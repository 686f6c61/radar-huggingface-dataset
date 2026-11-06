# lilligant-real/Qwen3.8-Flash-Next-Uncensored-exl3-4bpw-crucible

## Resumen

Qwen3.8-Flash-Next-Uncensored-exl3-4bpw-crucible es una cuantización EXL3 de 4 bits del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored, una variante con el alineamiento de seguridad eliminado por abliteration del Qwen3.8-Flash-Next original. El pack lo publica el usuario lilligant-real y está específicamente re-empaquetado para el motor de inferencia Crucible sobre AMD Strix Halo (gfx1151), una plataforma APU con memoria unificada. El modelo base es un MoE de 179.550 millones de parámetros según la model card, aunque el recuento real de parámetros en los safetensors del repo es de 33.714.274.944.

La relevancia de este pack es muy concreta: resuelve tres incompatibilidades del cargador de Crucible que los packs EXL3 estándar no cubren (la cabeza MTP, el contrato del kernel MoE fusionado y la geometría del vision tower). El resultado es un conjunto de pesos autocontenido que arranca en el motor sin argumentos adicionales de sidecar. No es un modelo nuevo ni un fine-tuning: es un artefacto de cuantización y re-encoding orientado a un hardware y un runtime muy específicos.

El modelo conserva las capacidades multimodales del original (texto, visión y cabeza MTP para decodificación especulativa), pero pierde de forma deliberada las barreras de rechazo. Está pensado para despliegues locales en hardware Strix Halo con 128 GB de memoria unificada, no para servir en infraestructura GPU convencional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con cabeza MTP y vision tower (derivada de Qwen3.8-Flash-Next) |
| Parámetros totales | 33.714.274.944 en safetensors del repo; la model card declara 179,55B para el modelo base |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 trellis: 4 bpw (75.265 tensores), 5 bpw (104), 6 bpw (382); tronco medido a 4,0416 bpw; lm_head a 6 bits; embeddings en BF16; MTP mixto 4/5/6 bpw; vision tower 6 bpw |
| Idiomas soportados | en, fr, zh |
| Licencia | Qwen Community License 1.0 (heredada del modelo base) |
| Formato de pesos | safetensors (EXL3 trellis), 9 shards |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con cabeza MTP (multi-token prediction) para decodificación especulativa y una torre de visión para entrada image-text-to-text. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La variante Uncensored se obtuvo por abliteration, un procedimiento de edición de pesos que elimina direcciones de activación asociadas al rechazo, no mediante reentrenamiento.

La innovación técnica de este pack concreto está en el re-encoding. Se re-cuantizaron 1.676 tensores con quantize_exl3 (meta-H sin calibrar) desde la fuente BF16 prístina usando ExLlamaV3 v1.4.4: los expertos enrutados de la capa 0 pasaron de K5 a K4, y los 140 expertos compartidos no conformes pasaron de K5 a K6. La cabeza MTP se injertó desde el pack base de turboderp a 4, 5 y 6 bpw para que el motor la cargue sin sidecar. La torre de visión BF16 original se sustituyó por la variante de 6 bpw. El error de Frobenius relativo de los re-encodes es 0,017 con correlación 0,99985 frente a BF16, mejor que el 3,65 por ciento medido en los encodings de stock del pack padre.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, francés y chino.
- Comprensión de imágenes (pipeline image-text-to-text) mediante la torre de visión de 6 bpw.
- Decodificación especulativa con cabeza MTP integrada en los pesos, sin sidecar externo.
- Razonamiento y generación de código heredados del modelo base (no se documentan evaluaciones específicas en este pack).
- Comportamiento sin rechazo: la abliteration sobrevive al injerto, verificado con cuatro prompts de rechazo liberados y un prompt de control idéntico entre carriles.
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Despliegue local en AMD Strix Halo: el pack está construido para el motor Crucible sobre gfx1151 con 128 GB de APU; los pesos ocupan unos 67 GB en memoria y la tabla n-gram de 39 GB se pagina, no reside completa.
- Investigación sobre abliteration: permite estudiar cómo se comporta un modelo sin alineamiento de seguridad en tareas controladas, con la ventaja de que el injerto no debilita el efecto según las comprobaciones del autor.
- Procesamiento de documentos con imagen: la torre de visión de 6 bpw permite describir imágenes y extraer información de capturas o escaneos en un entorno local sin dependencia de API.
- Generación de texto multilingüe EN/FR/ZH: útil para prototipos de asistentes en esos tres idiomas, aunque sin garantías de calidad fuera de ellos.
- Experimentación con decodificación especulativa: la cabeza MTP integrada permite medir el impacto del multi-token prediction en latencia dentro de Crucible.
- Pruebas de robustez y red teaming: al carecer de guardrails integrados, sirve como banco de pruebas para capas de moderación externas antes de plantear cualquier despliegue.
- Referencia de cuantización EXL3: el proceso de re-encoding documentado (1.676 tensores, métricas de error) es un caso de estudio para quienes construyan packs compatibles con kernels MoE fusionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no incluye cifras de calidad y que cualquier dato de throughput citado en otros sitios se tomó en hardware y versiones de cuantizador distintos, por lo que no sería representativo. El único dato de rendimiento medido es el arranque en frío hasta `/health`: aproximadamente 110 segundos en una APU Strix Halo de 128 GB.

## Requisitos de hardware

- Memoria: unos 67 GB de pesos residentes en memoria unificada; la tabla n-gram de 39 GB se pagina y no necesita estar residente. Tamaño total en disco de aproximadamente 100 GiB (9 shards de 67,5 GB, tabla PLE de 39 GB y torre de visión de 0,56 GB).
- GPU/APU recomendada: AMD Strix Halo (gfx1151) con 128 GB de memoria unificada, único hardware validado por el autor.
- GPU consumer: no cabe en GPUs de consumo convencionales de 24 GB ni en configuraciones de 48 GB por el volumen de pesos; el pack está atado a memoria unificada de gran capacidad.
- Motor de despliegue: exclusivamente Crucible (https://github.com/jaedync/crucible-strix-halo). llama.cpp, Ollama, vLLM y ExLlamaV3/TabbyAPI estándar no pueden cargar este pack; para esos runtimes debe usarse el pack padre.
- Configuración: bajo llama-swap, el campo `useModelName` del carril debe ser `crucible`, el identificador propio del motor; cualquier otro nombre devuelve 404. Cada pack necesita su propio directorio de estado de conversación, porque el KV cache guardado está construido contra unos pesos concretos.
- Latencia y throughput: no disponibles más allá del tiempo de arranque indicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Runtime |
|---|---|---|---|---|---|
| Este pack (lilligant-real, crucible) | 33,7B en safetensors; 179,55B declarados en el base | EXL3 4,04 bpw | no disponible | Qwen Community 1.0 | Solo Crucible en Strix Halo |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | 179,55B (MoE) | BF16 | no disponible | Qwen Community 1.0 | Genérico (BF16) |
| Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-4bpw | 179,55B (MoE) | EXL3 4 bpw | no disponible | Qwen Community 1.0 | ExLlamaV3 estándar |
| turboderp/Qwen3.8-Flash-Next-exl3 | 179,55B (MoE) | EXL3 (varias bpw) | no disponible | Qwen Community 1.0 | ExLlamaV3 estándar |

La diferencia práctica entre este pack y los otros tres no está en capacidades del modelo, sino en compatibilidad: solo este carga en Crucible sin sidecar MTP y con los anchos de experto que exige el kernel fusionado. Los demás son la opción para ExLlamaV3 estándar o para trabajar en BF16.

## Limitaciones y advertencias

- Sin guardrails: la abliteration elimina sustancialmente el alineamiento de seguridad y no hay capas de moderación integradas. Es imprescindible añadir moderación propia antes de cualquier despliegue.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; al ser un modelo sin alineamiento, la tendencia a generar contenido plausible pero falso no está mitigada por rechazo.
- Sesgos: no se han publicado análisis de sesgo para este pack ni para el modelo base en la información disponible.
- Idiomas: solo se declaran en, fr y zh; el rendimiento en castellano no está verificado.
- Licencia: Qwen Community License 1.0, con posibles restricciones de uso comercial que deben revisarse en el enlace de licencia antes de producción.
- Portabilidad nula: el pack solo funciona en Crucible sobre Strix Halo. Migrarlo a otro runtime requiere volver al pack padre.
- Estado de conversación: reutilizar un KV cache guardado con otro pack provoca decodificación con el tronco equivocado; hay que aislar los directorios de estado por pack.
- Datos contradictorios: la model card declara 179,55B parámetros para el base mientras los safetensors del repo suman 33,7B; conviene verificar la cifra real antes de dimensionar infraestructura.
- Sin benchmarks de calidad publicados: no hay base para comparar su rendimiento real frente a alternativas.

## Enlaces

- Hugging Face del pack: https://huggingface.co/lilligant-real/Qwen3.8-Flash-Next-Uncensored-exl3-4bpw-crucible
- Modelo base (abliterated): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Pack padre del que deriva: https://huggingface.co/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-4bpw
- Pack base de turboderp (fuente del sidecar MTP): https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Motor Crucible para Strix Halo: https://github.com/jaedync/crucible-strix-halo
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
