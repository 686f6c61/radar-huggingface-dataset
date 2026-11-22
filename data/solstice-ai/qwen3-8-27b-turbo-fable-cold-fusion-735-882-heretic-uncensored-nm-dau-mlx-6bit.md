# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-6Bit

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-6Bit es una cuantización de 6 bits en formato Apple MLX del modelo base de DavidAU, un merge de pesos sobre la familia Qwen 3.8 de 27B orientado a razonamiento, código agéntico y seguimiento de instrucciones. La publica Solstice-AI, que añade el empaquetado MLX, la integración de un módulo de predicción multi-token (MTP) y compatibilidad con decodificación especulativa DSpark. El modelo se distribuye con licencia Apache 2.0 y está pensado para ejecución local en Apple Silicon con memoria unificada.

La propuesta técnica se apoya en tres pilares: una arquitectura híbrida de atención lineal (mayoría de capas GDN con complejidad O(1) de memoria) combinada con GQA global, un contexto nativo declarado de 262.144 tokens y un módulo MTP de 15 tensores en BF16 sin cuantizar que permite generar dos tokens por paso. El resultado es un modelo de aproximadamente 26.900 millones de parámetros que ocupa 22,7 GB en repositorio y que, según el autor, cabe en 21,85 GB de RAM en Macs de 32 GB o más.

El interés actual radica en su posicionamiento como alternativa local a modelos frontera propietarios: la model card afirma una victoria en 9 de 9 disciplinas de evaluación frente a Claude Opus 4.6 Max bajo el arnés de Claude Code, con 61,7 % en SWE-bench Pro y 735 en ARC-Challenge. Estas cifras proceden exclusivamente del autor y no se han verificado de forma independiente, por lo que deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 75 % capas de atención lineal GDN (Gated Delta Recurrent Network) + 25 % GQA global; módulo MTP de 15 tensores |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (262K) nativos |
| Tipos de cuantizacion | 6 bits afín con group_size 64 (formato MLX); el autor menciona también variantes 8-bit y 4-bit en las evaluaciones |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX 6-bit afín; módulo MTP en BF16 sin cuantizar (`model-mtp-restored.safetensors`) |
| Libreria | mlx |
| Tamano del repo | 22,7 GB |
| Pipeline | image-text-to-text |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Descargas / likes | 528 / 2 |
| Fecha de creacion | 2026-09-02 |

## Arquitectura y entrenamiento

La arquitectura combina bloques de atención lineal GDN, que reducen el coste de memoria a O(1) respecto a la longitud de secuencia, con un 25 % de capas de Grouped-Query Attention global que preservan la capacidad de recuperación exacta sobre contextos largos. Sobre esta base, DavidAU aplica un merge de pesos denominado GAIN (Guided Activation Interleaved Normalization), que según la model card fusiona pesos de razonamiento sin degradación, y una fase de alineación denominada Project Heretic, descrita como una ablación de rechazos corporativos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO sobre el modelo original.

La innovación diferencial de esta release es el módulo MTP: 15 tensores en BF16 registrados en `model.safetensors.index.json` con `num_nextn_predict_layers: 1`, que habilitan generación especulativa de dos tokens concurrentes. Además, el modelo es compatible con el drafter DSpark de 1,86B (`RadixArk/Qwen3.8-27B-DSpark`), que utiliza cinco capas auxiliares de extracción de características (5, 19, 33, 47 y 61) y una cabeza de confianza VanillaMarkov de rango 256. La cuantización afín de 6 bits con grupo 64 preserva, según el autor, el 99,4 % de la precisión BF16 en benchmarks.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de cadena de pensamiento (CoT) explícito.
- Generación y depuración de código, incluyendo tareas de repositorio completo (SWE-bench, QwenSWEBench).
- Razonamiento matemático y científico de nivel frontera (ARC-Challenge, ARC-Easy).
- Seguimiento de restricciones complejas en instrucciones largas (IFBench).
- Control de sistemas operativos de escritorio y móviles (OSWorld-Verified, AndroidWorld).
- Flujos de trabajo agénticos multi-archivo de horizonte largo (CoWorkBench).
- Decodificación especulativa nativa mediante MTP y compatible con DSpark.
- Capacidades multimodales de entrada imagen-texto según el pipeline declarado (image-text-to-text), aunque no se detallan en la model card.
- Soporte multilingüe limitado a inglés y chino.
- Alineación ablacionada: el autor declara eliminación de rechazos corporativos (modelo "uncensored").

## Casos de uso

- Ingeniería de software agéntica: con 61,7 % en SWE-bench Pro y 79,0 % en QwenSWEBench según el autor, el modelo puede resolver issues y parchear repositorios completos dentro de un agente que itera sobre tests; su contexto de 262K permite cargar árboles de proyecto extensos sin truncar.
- Automatización de control de escritorio: los resultados declarados en OSWorld-Verified (84,3 %) lo hacen adecuado para agentes que operan interfaces gráficas, rellenan formularios o ejecutan flujos administrativos sobre máquinas virtuales.
- Automatización móvil: con 81,9 % en AndroidWorld, sirve para pilotar aplicaciones Android en tareas de QA o pruebas de regresión end-to-end.
- Asistente de código local en Mac: la cuantización de 6 bits y el soporte MLX permiten desplegarlo en un MacBook con 32 GB de memoria unificada, manteniendo el código y los datos en el dispositivo sin salida a la nube.
- Generación de código en tiempo real: 90,3 % en LiveCodeBench v6 lo hace apto para autocompletado y resolución de problemas algorítmicos en entornos de entrevista técnica o plataformas de evaluación.
- Razonamiento científico y tutoría avanzada: el rendimiento en ARC-C (735) y ARC-E (882) lo sitúa como candidato para asistencia en problemas de abstracción científica y explicaciones de nivel universitario.
- Procesamiento de documentos largos: con 262K de contexto puede resumir, extraer y cruzar información de contratos, informes o bases de código de gran tamaño en una sola pasada.
- Pipelines de datos sensibles con requisitos de contenido: la variante "uncensored" y la licencia Apache 2.0 permiten su uso en dominios donde los filtros de rechazo resultan un obstáculo (investigación de seguridad, red teaming, ficción), siempre con las salvaguardas externas adecuadas.

## Benchmarks y rendimiento

Datos declarados por el autor bajo el arnés de Claude Code, con temperatura 1,0 y top_p 0,95, en ventanas de 256K tokens. No verificados de forma independiente.

| Suite | Enfoque | Qwen3.8-27B TURBO | Claude Opus 4.6 Max | Diferencia |
|---|---|---|---|---|
| SWE-bench Pro | Ingeniería de software agéntica | 61,7 % | 53,4 % | +8,3 |
| LiveCodeBench v6 | Resolución de problemas en tiempo real | 90,3 % | 88,8 % | +1,5 |
| QwenSWEBench | Depuración de repositorio completo | 79,0 % | 63,8 % | +15,2 |
| OSWorld-Verified | Control de sistema operativo | 84,3 % | 72,7 % | +11,6 |
| AndroidWorld | Autonomía en SO móvil | 81,9 % | 62,0 % | +19,9 |
| IFBench | Seguimiento de restricciones complejas | 79,5 % | 62,5 % | +17,0 |
| CoWorkBench | Flujos multi-archivo de horizonte largo | 70,7 % | 68,2 % | +2,5 |
| ARC-C (Challenge) | Abstracción científica | 735 (8-bit) / 719 (4-bit) | ~710–720 | Frontera |
| ARC-E (Easy) | Razonamiento de sentido común | 882 | ~870 | Superior |

No se han publicado resultados independientes de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 21,85 GB para los pesos en 6 bits afín; el autor indica que encaja en Macs con 32 GB o más de memoria unificada. El módulo MTP en BF16 añade overhead adicional no cuantificado en la ficha.
- GPU recomendadas: Apple Silicon exclusivamente (M1 Pro/Max/Ultra, M2, M3, M4 y superiores), dado que el formato es MLX. No es ejecutable en CUDA sin reconversión.
- Cabe en GPU de consumo: no en el sentido convencional; en Apple Silicon, sí en configuraciones de 32 GB o más. En RTX 4090 (24 GB) requeriría una cuantización GGUF de 4 bits y un runtime distinto.
- Opciones de despliegue: MLX (`mlx-lm`), con soporte de decodificación especulativa vía MTP nativo o drafter DSpark (`RadixArk/Qwen3.8-27B-DSpark`). Para CUDA se necesitaría reconvertir a GGUF o safetensors estándar y usar llama.cpp, vLLM o TGI, no soportado directamente por esta release.
- Latencia y throughput: 22–52 tok/s en Apple Silicon según el autor, con aceleración especulativa declarada de 1,8x–2,5x.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B TURBO (esta release) | ~26,9B | 262K | Apache 2.0 | MLX 6-bit | Merge DavidAU + MTP + DSpark; solo Apple Silicon |
| Modelo base DavidAU (BF16) | ~26,9B | 262K | Apache 2.0 | safetensors | Sin cuantizar; requiere más memoria |
| Claude Opus 4.6 Max | no disponible | no disponible | Propietaria | API | Referencia de comparación del autor; sin pesos |
| Qwen 3.x 32B (familia upstream) | ~32B | variable | Apache 2.0 | safetensors/GGUF | Alternativa estándar con soporte amplio de runtimes |

No se dispone de datos verificados de otros modelos comparables de 27B–32B con contexto de 262K en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks son autoinformados por el autor y no han sido replicados de forma independiente; la comparación con Claude Opus 4.6 Max debe tomarse como afirmación de marketing hasta su verificación.
- El modelo está ablacionado ("uncensored"): se ha eliminado el comportamiento de rechazo, lo que incrementa el riesgo de generar contenido dañino, sesgado o ilegal. Requiere moderación externa en producción.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- El formato MLX 6-bit solo es ejecutable en Apple Silicon; no hay soporte directo para CUDA, ROCm ni TPU sin reconversión.
- El contexto de 262K tokens exige memoria adicional durante la inferencia que puede superar los 21,85 GB indicados para los pesos; en la práctica, usar la ventana completa en 32 GB puede no ser viable.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base incorpora un merge de pesos cuyo linaje y condiciones originales conviene auditar antes de un despliegue comercial.
- Riesgo de alucinación inherente a modelos de esta escala, agravado por la eliminación de mecanismos de rechazo y por la falta de evaluación en dominios factuales (MMLU, TruthfulQA no publicados).
- El repositorio tiene solo 2 likes y 528 descargas, con lo que la validación comunitaria es mínima.
- La model card mezcla afirmaciones verificables con otras no sustentadas (por ejemplo, "beats-claude-opus-4.6"); trátese con escepticismo.

## Enlaces

- Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-6Bit
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Drafter DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Organización Solstice-AI: https://huggingface.co/Solstice-AI
- Organización DavidAU: https://huggingface.co/DavidAU
- Banner del proyecto: https://cdn-uploads.huggingface.co/production/uploads/67c2e844e0921a5410eec10a/Y5M42dCag2f7Fc6fDtV0Z.jpeg
