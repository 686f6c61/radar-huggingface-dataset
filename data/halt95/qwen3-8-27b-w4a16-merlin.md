# halt95/Qwen3.8-27B-W4A16-Merlin

## Resumen

Qwen3.8-27B-W4A16-Merlin es una cuantización de 4 bits del modelo denso Qwen3.8-27B de Qwen, publicada por el usuario halt95. El checkpoint reduce el peso original de 52 GiB a unos 16 GiB mediante cuantización AWQ INT4 en las proyecciones de atención, Gated DeltaNet y feed-forward, manteniendo en BF16 la torre de visión, los embeddings y las normas. El objetivo declarado es ejecutar el modelo con su ventana completa de 262.144 tokens sobre una, dos o cuatro GPU de 24 GB, en concreto tarjetas Ampere como la RTX 3090.

La relevancia de esta ficha no está en el modelo base, sino en la combinación de cuantización agresiva, decodificación especulativa con cabeza MTP y caché KV en FP8, servida por un fork de vLLM 0.33.0 denominado Merlin, afinado para Ampere y Ada. El autor reporta métricas concretas sobre cuatro RTX 3090 sin NVLink: 267 tok/s de decodificación con 262K de contexto, 3.023 tok/s de prefill sobre un prompt de 100K y una reserva de KV de 2.012.105 tokens en VRAM.

El modelo conserva la naturaleza multimodal del base (pipeline image-text-to-text) y una licencia Apache-2.0, lo que facilita su uso comercial. La información disponible sobre el modelo base es limitada en esta ficha: se conocen los parámetros totales reales (27.356.728.560) y las capacidades inferidas de los tags, pero no se detallan los datos de entrenamiento originales de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido con atención con puertas (16 capas) y Gated DeltaNet (48 capas), torre de visión y cabeza MTP para decodificación especulativa |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16: AWQ INT4 asimétrico grupo 128 en proyecciones de atención, Gated DeltaNet y feed-forward; GPTQ INT4 en `lm_head` y cabeza MTP; BF16 en torre de visión, embeddings, `in_proj_a`/`in_proj_b`, convoluciones y normas; caché KV en FP8 E4M3 con escalas estáticas por capa |
| Idiomas soportados | Inglés (según la model card; el modelo base Qwen suele ser multilingüe, pero no se confirma en la información disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con vLLM a través del motor Merlin) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros que combina 16 capas de atención con puertas y 48 capas de Gated DeltaNet, una variante de atención lineal con estado recurrente. Incorpora además una torre de visión para entrada image-text-to-text y una cabeza MTP (multi-token prediction) que actúa como drafter en decodificación especulativa. Esta cuantización no reentrena el modelo: aplica AWQ con calibración sobre las proyecciones principales y GPTQ sobre `lm_head` y la cabeza MTP, dejando en BF16 los componentes sensibles a la precisión (visión, embeddings, normas y proyecciones auxiliares de DeltaNet).

La innovación técnica del paquete es el motor de servicio Merlin, un fork de vLLM 0.33.0 optimizado para Ampere y Ada que mantiene los embeddings de tokens en RAM del host y la reserva KV en VRAM, con escalas estáticas calibradas para la caché FP8. El autor publica tarjetas de benchmarks fechadas (2026-11-12 y 2026-11-21) con mediciones sobre RTX 3090. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si hubo RLHF o DPO en esta información.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con modo thinking configurable (el autor cita «effort medium» como valor por defecto).
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre de visión conservada en BF16.
- Contexto largo real de 262.144 tokens, con reserva KV en VRAM para múltiples sesiones simultáneas.
- Decodificación especulativa mediante cabeza MTP integrada, que acelera la generación.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque es habitual en la familia Qwen; tratar como no verificado.
- Capacidades de agente y razonamiento multi-paso: el autor mide ocho conversaciones simultáneas de 16K tokens con seguimientos de 512 tokens, lo que indica soporte para cargas de agentes concurrentes.
- Capacidades multilingües: la model card declara únicamente inglés; no se confirman otros idiomas.

## Casos de uso

- Asistentes de documentación sobre repositorios completos: con 262K tokens de contexto se puede cargar un árbol de código extenso o una base de documentación entera en una sola sesión y hacer preguntas con referencias cruzadas, sin recuperación externa.
- Análisis de documentos técnicos con imágenes: la torre de visión permite procesar diagramas, capturas de pantalla y figuras junto al texto, útil para revisión de papers, manuales o informes con gráficos.
- Agentes autónomos concurrentes en producción: el autor reporta ocho conversaciones de 16K con seguimientos simultáneos y 1.012 tok/s agregados en cuatro GPU, lo que encaja en orquestadores de agentes que atienden varios hilos a la vez.
- Generación de código en pipelines de CI/CD: la ventana larga permite incluir el contexto del repositorio y los diffs recientes; la licencia Apache-2.0 elimina fricción para uso comercial interno.
- Procesamiento por lotes de contratos o expedientes largos: prefill de 3.023 tok/s sobre 100K tokens hace viable clasificar o resumir documentos de decenas de miles de tokens en un servicio interno.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en una RTX 3090 de 24 GB con cuantización W4A16, permite prototipar y servir cargas moderadas sin infraestructura de centro de datos.
- Transcripción y razonamiento sobre vídeo o imagen fija en flujos de accesibilidad: el pipeline image-text-to-text del checkpoint admite entrada visual junto a instrucciones textuales.

## Benchmarks y rendimiento

El autor publica métricas de velocidad e infraestructura, no de calidad en benchmarks académicos (MMLU, HumanEval, GSM8K). Se recogen aquí los datos de rendimiento del sistema tal como aparecen en la model card.

| Metrica | Configuracion | Valor |
|---|---|---|
| Decodificacion | 1 flujo, thinking on, 261.888 tokens de prompt + 128 de salida, 4x RTX 3090 | 267 tok/s (rango 266,7–277,6) |
| Prefill | Prompt frio de 101.845 tokens, 4x RTX 3090 | 3.023 tok/s |
| Agentes concurrentes | 8 conversaciones de 16K + 8 seguimientos de 512 tokens | 1.012 tok/s agregados |
| Reserva KV | 4x RTX 3090, cache FP8 en VRAM | 2.012.105 tokens |
| Sesiones de 262K simultaneas | 4x RTX 3090 | 7 sesiones retenidas a la vez |
| Huella del checkpoint | Repositorio completo | ~16 GiB (frente a 52 GiB del base) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 16 GiB de pesos; la reserva KV en FP8 ocupa VRAM adicional y escala con el contexto. Con 24 GB por GPU se puede servir el modelo con contexto largo, según el autor.
- GPU recomendadas: RTX 3090 (Ampere, sm86) como plataforma de referencia medida; el motor incluye perfiles para otras Ampere y Ada, RTX 4090, tarjetas de estación de trabajo de 48 GB, A100 y CMP 170HX.
- Cabe en GPU de consumo: sí, en RTX 3090 de 24 GB; el autor menciona también RTX 4090, aunque los perfiles Ada están en pruebas o sin probar.
- Opciones de despliegue: el checkpoint está pensado para el motor Merlin (fork de vLLM 0.33.0). No se confirma compatibilidad con llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 267 tok/s de decodificación a 262K de contexto y 3.023 tok/s de prefill sobre 100K, medidos en 4x RTX 3090 a 220 W sin NVLink, con P2P activado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-W4A16-Merlin | 27,36B | 262.144 | W4A16 (AWQ/GPTQ) + KV FP8 | Apache-2.0 | Requiere motor Merlin; optimizado para Ampere |
| Qwen3.8-27B (base) | 27,36B | 262.144 | BF16 | Apache-2.0 | 52 GiB de pesos; necesita más VRAM |
| Qwen3.8-27B-W4A16-AWQ (philbert440) | 27,36B | 262.144 | W4A16 AWQ | No disponible | Checkpoint AWQ citado como origen de las proyecciones cuantizadas |

No se dispone de datos de benchmarks de calidad para establecer una comparación de rendimiento con alternativas de la misma categoría. La comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- La model card declara únicamente inglés; el soporte multilingüe del base no se confirma en esta información.
- La cuantización W4A16 puede degradar la calidad respecto al BF16 original, especialmente en tareas de razonamiento matemático o código; el autor no publica evaluaciones de calidad comparativas.
- El checkpoint está atado al motor Merlin (fork de vLLM 0.33.0); no se confirma su funcionamiento en otras pilas de inferencia.
- Los perfiles para GPU Ada (RTX 4090) están en pruebas o sin probar; la referencia medida es Ampere (RTX 3090).
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el fichero `NOTICE` del repositorio por posibles atribuciones adicionales.
- Las cifras de velocidad provienen de mediciones del autor en hardware concreto (4x RTX 3090 a 220 W, P2P, desbloqueo opcional de GPU); el throughput puede variar en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halt95/Qwen3.8-27B-W4A16-Merlin
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint AWQ de origen: https://huggingface.co/philbert440/Qwen3.8-27B-W4A16-AWQ
- Motor Merlin: https://github.com/halt95/merlin-engine
- Tarjeta de benchmarks 2026-11-21: https://github.com/halt95/merlin-engine/blob/main/models/qwen38-27b/benchmarks/2026-11-21/BENCH-CARD.md
- Tarjeta de benchmarks 2026-11-12: https://github.com/halt95/merlin-engine/blob/main/models/qwen38-27b/benchmarks/2026-11-12/BENCH-CARD.md
- Plantillas de chat corregidas de Qwen3.8: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Comunidad en Discord: https://discord.gg/jVDYAwdGzt
- Apoyo al autor: https://ko-fi.com/halt95
