# ReliquaryForge/teutonic-rl-async-v1-step-00000105

## Resumen

Teutonic RL Async v1 (step 00000105) es un ajuste fino supervisado (SFT) del modelo Teutonic-I, publicado por ReliquaryForge sobre la base preentrenada de Bittensor Subnet 3 y con un injerto de atención procedente de Qwen3.5-9B-Base. El modelo resuelve el problema de dotar a un checkpoint preentrenado de forma competitiva y colaborativa (Subnet 3) de capacidades de razonamiento explícito (thinking mode), código, matemáticas y uso agéntico, mediante destilación supervisada desde un profesor de mayor tamaño (Qwen3.8-27B). Es relevante porque demuestra un pipeline completo de post-entrenamiento abierto sobre arquitecturas híbridas, con licencia Apache-2.0 y compatibilidad con el stack estándar de transformers.

La arquitectura es `Qwen3_5ForCausalLM`: 32 capas, de las cuales 24 son gated-DeltaNet (atención lineal con estado recurrente) y 8 son atención softmax completa, con 8.953.803.264 parámetros totales según los pesos en safetensors (la model card indica 8,6B, discrepancia atribuible al recuento de embeddings y cabezas). El vocabulario es de 248.320 tokens, los pesos están en bfloat16 y el entrenamiento se realizó con contexto de 64k tokens. El repositorio ocupa 17,9 GB y el checkpoint corresponde a un paso intermedio de un entrenamiento asíncrono de RL/SFT (step 105), no a una versión final.

Se trata de un modelo de texto puro, sin visión ni audio, orientado a generación conversacional, razonamiento multi-paso y flujos agénticos. Su interés práctico reside en la combinación de atención lineal para contexto largo con atención completa en capas seleccionadas, lo que reduce el coste de inferencia en ventanas de 64k frente a un transformer denso equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (híbrida: 24 capas gated-DeltaNet + 8 capas de atención softmax completa, 32 capas en total) |
| Parametros totales | 8.953.803.264 (según safetensors); la model card indica 8,6B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 64k tokens (entrenado a 64k; ventana nativa no especificada aparte) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni AWQ en el repo) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Teutonic-I, preentrenado en la competición abierta de mejora de modelos de Bittensor Subnet 3. Sobre ese checkpoint se realizó un injerto de atención: las 8 capas con mezcladores de tokens GLA (capas 3, 7, ..., 31) se sustituyeron por la atención softmax de Qwen3.5-9B-Base y se curaron entrenando únicamente esas capas con 50M tokens de texto plano. El resto de componentes (embeddings, MLPs y las 24 capas gated-DeltaNet) proviene de Teutonic-I. El resultado adopta la arquitectura estándar `Qwen3_5ForCausalLM`, lo que permite cargarlo con transformers sin código personalizado.

El post-entrenamiento lo ejecutó Reliquary (Bittensor Subnet 81) mediante destilación supervisada desde Qwen3.8-27B. La primera fase consistió en 1 época sobre la mezcla `full-v2` (4,47B tokens objetivo: matemáticas 38 %, código 25 %, ciencia 14 %, general 11 %, agéntico 8,4 %) con learning rate 4e-5 y schedule coseno. La segunda fase añadió una pasada sobre 7.659 ejemplos de QA sobre documentos largos (documentos de 16k a 57k tokens, con preguntas y respuestas generadas por el profesor) más 56M tokens de replay de `full-v2`, con learning rate 1e-5. El entrenamiento se realizó en bfloat16 y con contexto de 64k tokens. El checkpoint publicado corresponde al paso 105 de un proceso asíncrono, por lo que no representa necesariamente el punto de convergencia del pipeline.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat incluida en el repositorio.
- Razonamiento explícito en modo thinking, destilado del profesor Qwen3.8-27B.
- Razonamiento matemático, reforzado por el 38 % de la mezcla de SFT dedicada a matemáticas.
- Generación y edición de código, con un 25 % de la mezcla orientada a código.
- Conocimiento científico y técnico (14 % de la mezcla).
- Capacidades agénticas y de razonamiento multi-paso (8,4 % de la mezcla dedicada a datos agénticos).
- Procesamiento de documentos largos y QA sobre ellos, gracias a los 7.659 ejemplos de 16k-57k tokens y a la ventana de 64k.
- Soporte de tool calling / function calling: no documentado explícitamente en la model card.
- Capacidades multimodales (visión, audio): no disponibles; es un modelo de texto.
- Idiomas: no declarados; no se puede afirmar cobertura multilingüe más allá de la implícita en los datos de destilación.

## Casos de uso

- Análisis de documentos largos: contratos, informes técnicos o expedientes de hasta 57k tokens pueden procesarse en una sola pasada gracias a la ventana de 64k y a los ejemplos de QA largo del SFT; la atención lineal en 24 capas reduce el coste frente a un transformer denso.
- Asistente de razonamiento matemático: resolución paso a paso de problemas con trazas de pensamiento, adecuado para entornos educativos o de verificación de cálculos donde se quiera inspeccionar el razonamiento intermedio.
- Generación de código en pipelines internos: el modelo puede integrarse en herramientas de autocompletado o revisión de parches, aunque la ausencia de tool calling documentado obliga a orquestar las llamadas desde el cliente.
- Agentes de investigación multi-paso: para tareas de planificación y descomposición que requieran mantener estado a lo largo de muchas iteraciones, apoyándose en el contexto largo para arrastrar el historial completo.
- Destilación y experimentación académica: sirve como caso de estudio reproducible de post-entrenamiento sobre un checkpoint de Bittensor con injerto de atención, útil para investigadores que quieran replicar el pipeline.
- Chat de soporte técnico especializado: con la plantilla de chat incluida, puede desplegarse como backend conversacional en dominios científicos o de ingeniería donde el contexto de conversación sea extenso.
- Evaluación comparativa de arquitecturas híbridas: al ser compatible con transformers y con la arquitectura estándar de Qwen3.5, permite medir el impacto de sustituir capas GLA por atención softmax en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 17,9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB de pesos, no verificada oficialmente al no publicarse variantes cuantizadas.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos, sujeta a la conversión manual con herramientas externas (no hay GGUF en el repo).
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 64k y throughput alto; RTX 4090 (24 GB) para bfloat16 con contexto reducido; RTX 3090 (24 GB) como alternativa consumer.
- Cabe en GPU consumer: sí, en RTX 4090/3090 con bfloat16 y contexto limitado, o en GPUs de 12-16 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo, arquitectura `Qwen3_5ForCausalLM`); vLLM y TGI requerirían verificar el soporte de las capas gated-DeltaNet en la versión instalada; llama.cpp/Ollama no disponibles sin conversión a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Teutonic RL Async v1 step 105 | 8,95B (denso, híbrido) | 64k | Apache-2.0 | Checkpoint intermedio de SFT con destilación; sin benchmarks publicados |
| Qwen3.5-9B-Base | ~9B (denso) | no disponible en la información | Apache-2.0 (según la model card) | Modelo base del injerto de atención; referencia directa de arquitectura |
| Teutonic-I | no disponible | no disponible | Apache-2.0 (según la model card) | Checkpoint preentrenado en Bittensor Subnet 3, antecesor directo |
| Qwen3.8-27B | ~27B | no disponible en la información | no disponible | Profesor usado para la destilación; mayor tamaño, no comparable en despliegue |

La comparación con alternativas de la misma categoría (modelos de ~9B con contexto largo) no puede completarse con datos verificables a partir de la información proporcionada: no se dispone de benchmarks ni de especificaciones de contexto de los modelos citados.

## Limitaciones y advertencias

- Checkpoint intermedio (step 105) de un entrenamiento asíncrono: no es una versión final y su calidad puede estar por debajo del punto de convergencia del pipeline.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni tareas agénticas, lo que impide validar las capacidades declaradas.
- Riesgo de alucinación inherente a un modelo destilado de un profesor mayor: las trazas de razonamiento pueden contener pasos plausibles pero incorrectos, especialmente en matemáticas y código.
- Idiomas no declarados: no se garantiza un rendimiento uniforme fuera del inglés; el uso en castellano no está validado.
- Tool calling no documentado: los flujos agénticos requieren orquestación externa y formato de prompt manual.
- Sin cuantizaciones oficiales: desplegar en hardware limitado exige convertir los pesos, con riesgo de degradación no medida.
- Licencia Apache-2.0 permite uso comercial, pero al modificar Teutonic-I y Qwen3.5-9B-Base conviene conservar los avisos de atribución de ambos linajes.
- El injerto de atención se curó con solo 50M tokens: posible pérdida de coherencia en las capas sustituidas respecto al preentrenamiento original.
- Repositorio con 3 descargas y 0 likes: sin validación por parte de la comunidad, lo que desaconseja su uso en producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReliquaryForge/teutonic-rl-async-v1-step-00000105
- Modelo base preentrenado: https://huggingface.co/dendriteholdings/Teutonic-I
- Modelo de referencia para el injerto de atención: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Bittensor Subnet 3 (Teutonic): no disponible en la información proporcionada
- Bittensor Subnet 81 (Reliquary): no disponible en la información proporcionada
- Paper o blog técnico del pipeline: no disponible en la información proporcionada
