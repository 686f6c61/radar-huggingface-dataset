# ReliquaryForge/teutonic-rl-async-v1-step-00000095

## Resumen

Teutonic-I Reliquary SFT (identificador `ReliquaryForge/teutonic-rl-async-v1-step-00000095`) es un modelo de lenguaje de 8.953.803.264 parámetros publicado por ReliquaryForge, un proyecto vinculado a la competición de mejora de modelos abiertos de Bittensor (subred 81). Se construye sobre Teutonic-I, un modelo preentrenado en la subred 3 de Bittensor, y sobre la arquitectura de Qwen3.5-9B-Base, combinando ambos linajes mediante un injerto de capas de atención y un post-entrenamiento por destilación supervisada.

El modelo resuelve el problema de obtener un asistente conversacional con modo de razonamiento explícito (thinking mode) y contexto largo a partir de un preentrenamiento comunitario, sin depender de un entrenamiento desde cero. La innovación principal es el reemplazo de 8 mezcladores de tokens GLA (gated linear attention) por atención softmax de Qwen3.5-9B-Base en las capas 3, 7, ..., 31, seguido de un "curado" de esas capas sobre 50 millones de tokens de texto plano. El resultado adopta la arquitectura estándar `Qwen3_5ForCausalLM`.

El contexto de entrenamiento es de 64k tokens y el modelo se distribuye en safetensors en bfloat16 con licencia Apache-2.0. Es relevante ahora porque demuestra un patrón de reutilización y fusión de pesos entre modelos abiertos con licencias permisivas, y porque su pipeline de destilación desde un profesor mayor (Qwen3.8-27B) con datos sintéticos de razonamiento y agénticos es representativo de las prácticas actuales de post-entrenamiento en comunidades descentralizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (híbrida: 24 capas gated-DeltaNet + 8 capas de atención completa) |
| Parametros totales | 8.953.803.264 (8,6B según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k tokens (entrenado a 64k); ventana de inferencia no especificada |
| Tipos de cuantizacion | no disponible (repo en bfloat16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es `Qwen3_5ForCausalLM` con 32 capas: 24 capas gated-DeltaNet (atención lineal con estado recurrente) y 8 capas de atención completa softmax. El vocabulario es de 248.320 tokens y los pesos están en bfloat16. El linaje es explícito: Teutonic-I aporta embeddings, MLPs y las 24 capas gated-DeltaNet; Qwen3.5-9B-Base aporta la atención softmax que sustituye a los 8 mezcladores GLA originales de Teutonic-I en las capas 3, 7, ..., 31. Tras el injerto, solo esas capas se reentrenaron sobre 50 millones de tokens de texto plano para "curar" la sustitución.

El post-entrenamiento de este checkpoint, realizado por Reliquary, consta de dos fases. Primero, una época sobre la mezcla `full-v2` con 4,47B tokens objetivo (matemáticas 38 %, código 25 %, ciencia 14 %, general 11 %, agéntico 8,4 %) con learning rate 4e-5 y scheduler coseno. Después, una pasada sobre 7.659 ejemplos de QA de documentos largos (documentos de 16k a 57k tokens, con preguntas y respuestas generadas por el profesor) más 56M tokens objetivo de replay de `full-v2`, con learning rate 1e-5. La destilación supervisada proviene de Qwen3.8-27B como profesor e incluye modo de razonamiento (thinking mode). No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat incluida en el repositorio.
- Modo de razonamiento explícito (thinking mode), heredado de la destilación desde Qwen3.8-27B.
- Razonamiento matemático, reforzado por el 38 % de matemáticas en la mezcla de SFT.
- Generación y comprensión de código, con un 25 % de código en la mezcla de entrenamiento.
- Razonamiento científico, con un 14 % de ciencia en la mezcla.
- Capacidades agénticas y de razonamiento multi-paso, con un 8,4 % de datos agénticos.
- Procesamiento de documentos largos: entrenado específicamente con ejemplos de QA sobre documentos de 16k a 57k tokens.
- Contexto de 64k tokens durante el entrenamiento.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Visión y audio: no disponible; el pipeline es text-generation.

## Casos de uso

- QA sobre documentación técnica extensa: el modelo se entrenó con 7.659 ejemplos de preguntas y respuestas sobre documentos de 16k a 57k tokens, por lo que es adecuado para consultar manuales, contratos o repositorios de documentación que no caben en modelos de contexto corto.
- Asistencia en matemáticas y ciencia: el 52 % combinado de la mezcla de SFT (38 % matemáticas, 14 % ciencia) lo orienta a resolución de problemas paso a paso con modo de razonamiento, útil en herramientas educativas o de verificación de cálculos.
- Generación de código en entornos de desarrollo: el 25 % de datos de código permite su uso como asistente de autocompletado y explicación de fragmentos, integrándose vía `transformers` en pipelines locales.
- Flujos agénticos de múltiples pasos: el 8,4 % de datos agénticos y el modo de razonamiento permiten encadenar subtareas con planificación intermedia, aunque la ausencia de tool calling documentado obliga a implementar el bucle de herramientas en el orquestador.
- Destilación y experimentación académica: al ser un checkpoint intermedio (`step-00000095`) de un pipeline de SFT por destilación, sirve como referencia para estudiar la fusión de arquitecturas híbridas y el injerto de capas de atención.
- Despliegue en infraestructura propia con licencia permisiva: Apache-2.0 permite uso comercial y modificación, lo que facilita su incorporación en productos sin obligaciones de copyleft.
- Investigación sobre modelos de la comunidad Bittensor: permite comparar el rendimiento de un modelo preentrenado en la subred 3 tras post-entrenamiento en la subred 81 frente a modelos propietarios de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 17,9 GB solo para pesos (8,95B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto moderado.
- Cuantización a 8 bits: alrededor de 9 GB de pesos; a 4 bits, alrededor de 4,5 GB, aunque no se distribuyen pesos cuantizados en el repositorio y habría que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 64k y despliegue concurrente; RTX 4090 (24 GB) para bfloat16 con contexto reducido o cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), servidores compatibles con la API de endpoints (`endpoints_compatible` en los tags); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Teutonic-I Reliquary SFT (este) | 8,95B | 64k (entrenamiento) | Apache-2.0 | HuggingFace, 4 descargas | Híbrido DeltaNet + atención softmax, thinking mode |
| Qwen3.5-9B-Base | 9B (aproximado) | no disponible | Apache-2.0 (según linaje) | HuggingFace | Modelo base del injerto de atención; sin post-entrenamiento conversacional |
| Teutonic-I | no disponible | no disponible | Apache-2.0 (según linaje) | HuggingFace | Preentrenado en Bittensor Subnet 3; aporta embeddings, MLPs y capas DeltaNet |
| Qwen3.8-27B | 27B (aproximado) | no disponible | no disponible | Profesor de destilación | Mayor tamaño; se usa solo como profesor, no como alternativa desplegable equivalente |

## Limitaciones y advertencias

- Es un checkpoint intermedio (`step-00000095`) de un pipeline de SFT; no se presenta como versión final ni se documenta su convergencia.
- Solo 4 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria ni informes independientes de calidad.
- No se declaran idiomas soportados; el rendimiento fuera del inglés es incierto.
- No se documentan evaluaciones de sesgo, toxicidad o alucinación; el riesgo de alucinación es el habitual en modelos destilados de 9B sin verificación factual.
- El contexto de entrenamiento es de 64k, pero no se especifica la ventana efectiva de inferencia ni el comportamiento más allá de esa longitud.
- No se confirma soporte de tool calling nativo; los flujos agénticos dependen de implementación externa.
- La licencia Apache-2.0 permite uso comercial, pero al modificar Teutonic-I y Qwen3.5-9B-Base conviene revisar las condiciones de ambos linajes.
- El modelo depende de la plantilla de chat incluida en el repositorio; usarlo sin ella puede degradar el formato de razonamiento.
- El repositorio ocupa 17,9 GB, lo que exige almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReliquaryForge/teutonic-rl-async-v1-step-00000095
- Modelo base Teutonic-I: https://huggingface.co/dendriteholdings/Teutonic-I
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Bittensor Subnet 3 (Teutonic): no disponible en la información proporcionada
- Bittensor Subnet 81 (Reliquary): no disponible en la información proporcionada
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
