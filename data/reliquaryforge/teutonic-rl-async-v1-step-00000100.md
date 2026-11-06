# ReliquaryForge/teutonic-rl-async-v1-step-00000100

## Resumen

Teutonic-I Reliquary SFT es un modelo de lenguaje de 8.953.803.264 parametros (~8,6B efectivos) obtenido por ajuste fino supervisado (SFT) sobre el checkpoint `dendriteholdings/Teutonic-I`, a su vez derivado de la competicion abierta de mejora de modelos de Teutonic (Bittensor Subnet 3). El post-entrenamiento lo firma Reliquary (Bittensor Subnet 81) mediante destilacion supervisada desde un profesor `Qwen3.8-27B`, incorporando modo de razonamiento (thinking mode). Este checkpoint concreto corresponde al paso 100 de un pipeline de RL asincrono, lo que lo situa como un artefacto intermedio de investigacion mas que como un modelo de produccion.

La arquitectura es hibrida: 32 capas compuestas por 24 capas gated-DeltaNet (atencion lineal con estado recurrente) y 8 capas de atencion softmax completa, con un vocabulario de 248.320 tokens y entrenamiento a 64k de contexto. Las 8 capas de atencion lineal originales de Teutonic-I fueron sustituidas por la atencion softmax de `Qwen/Qwen3.5-9B-Base` y posteriormente "curadas" entrenando solo esas capas sobre 50M tokens de texto plano, de modo que el modelo resultante expone la arquitectura estandar `Qwen3_5ForCausalLM` y es compatible con el ecosistema de transformers.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo poco habitual (injerto de atencion sobre un modelo preentrenado de forma descentralizada); por otro, su licencia Apache-2.0 y su compatibilidad con `endpoints_compatible` lo hacen tecnicamente desplegable, aunque con solo 8 descargas y 0 likes se trata de un checkpoint sin validacion comunitaria. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` hibrida: 32 capas (24 gated-DeltaNet + 8 atencion softmax completa) |
| Parametros totales | 8.953.803.264 (~8,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64.000 tokens (entrenado a 64k) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Vocabulario | 248.320 tokens |
| Precisión de pesos | bfloat16 |
| Tamano del repo | 17,9 GB |
| Modelo base | `dendriteholdings/Teutonic-I`, `Qwen/Qwen3.5-9B-Base` |
| Paso de entrenamiento | step-00000100 (RL asincrono) |

## Arquitectura y entrenamiento

El modelo parte de Teutonic-I, preentrenado en Bittensor Subnet 3. Sobre esa base se realizo un injerto de atencion: las 8 capas mezcladoras de tokens GLA (posiciones 3, 7, ..., 31) se reemplazaron por la atencion softmax de `Qwen/Qwen3.5-9B-Base` y se curaron entrenando unicamente esas capas sobre 50M tokens de texto plano. El resto de componentes (embeddings, MLPs y las 24 capas gated-DeltaNet) permanece intacto de Teutonic-I. El resultado es un transformer hibrido con atencion lineal de estado recurrente en la mayoria de capas y atencion cuadratica completa en 8 de ellas, lo que reduce el coste de atencion a contextos largos frente a un transformer denso equivalente.

El SFT de Reliquary consta de dos fases. La primera es 1 epoca sobre la mezcla `full-v2` (4.470 millones de tokens objetivo: matematicas 38 %, codigo 25 %, ciencia 14 %, general 11 %, agentico 8,4 %) con learning rate 4e-5 y schedule coseno. La segunda es una pasada sobre 7.659 ejemplos de QA de documentos largos (documentos de 16k a 57k tokens, con preguntas y respuestas generadas por el profesor) mas 56M tokens objetivo de replay de `full-v2`, con learning rate 1e-5. El profesor de destilacion es `Qwen3.8-27B` y el modelo incorpora thinking mode; la plantilla de chat esta incluida en el repositorio. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia incluida en el repositorio.
- Razonamiento en modo thinking (cadena de pensamiento antes de la respuesta), heredado de la destilacion desde `Qwen3.8-27B`.
- Razonamiento matematico reforzado por la composicion del dataset (38 % de la mezcla `full-v2`).
- Generacion y comprension de codigo (25 % de la mezcla de entrenamiento).
- Conocimiento cientifico y general (14 % y 11 % de la mezcla respectivamente).
- Capacidades agenticas y de razonamiento multi-paso (8,4 % de la mezcla, etiqueta `agentic` en el modelo).
- QA sobre documentos largos: entrenado especificamente con documentos de 16k-57k tokens.
- Soporte de contexto largo hasta 64k tokens gracias a la combinacion de capas DeltaNet y atencion completa.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible (la etiqueta `agentic` sugiere entrenamiento orientado, pero no se documenta el formato).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision y audio: no soportados.

## Casos de uso

- QA sobre documentacion tecnica extensa: con 64k de contexto y entrenamiento especifico en documentos de 16k-57k tokens, puede responder preguntas sobre manuales, contratos o expedientes completos sin fragmentacion por chunking.
- Asistencia a la investigacion cientifica: la mezcla de entrenamiento con 14 % de ciencia y modo thinking permite resumir y razonar sobre articulos y preprints de decenas de miles de tokens en una sola pasada.
- Generacion de codigo en pipelines de revision: el 25 % de codigo en el SFT y el razonamiento previo lo hacen util para explicar diffs, proponer parches y revisar Pull Requests, siempre con validacion humana dado que no hay benchmarks publicados.
- Tutorizacion de matematicas paso a paso: el thinking mode permite exponer el razonamiento intermedio, adecuado para entornos educativos que requieren justificar cada paso.
- Prototipado de agentes con contexto largo: la etiqueta `agentic` y la ventana de 64k permiten mantener historiales de herramientas y observaciones extensos en tareas multi-paso, aunque el soporte formal de function calling no esta documentado.
- Investigacion sobre arquitecturas hibridas: al exponer la arquitectura estandar `Qwen3_5ForCausalLM` con capas DeltaNet, sirve como banco de pruebas para estudiar el comportamiento de atencion lineal frente a softmax en tareas de razonamiento.
- Destilacion y ajuste fino posterior: al ser Apache-2.0 y cargar con transformers, puede usarse como inicializacion para experimentos propios de SFT o RL sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 18 GB solo para pesos, mas cache KV y activaciones; con 64k de contexto la cache KV de las 8 capas de atencion completa anade varios GB adicionales, por lo que se recomienda reservar 24-32 GB.
- VRAM en cuantizacion de 8 bits: en torno a 9-10 GB de pesos; en 4 bits, en torno a 5-6 GB. No obstante, el autor no publica artefactos cuantizados, por lo que habria que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo a 64k sin cuantizar; L40S 48 GB como alternativa.
- Consumer GPU: cabe en RTX 4090 (24 GB) en bfloat16 solo con contexto moderado; en RTX 3090/4090 con cuantizacion 8 o 4 bits se puede operar con contextos mas largos. En GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) requiere cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI previsiblemente compatibles al usar `Qwen3_5ForCausalLM`; llama.cpp/Ollama requeririan conversion a GGUF, no publicada. La etiqueta `endpoints_compatible` indica compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles. La presencia de 24 capas DeltaNet deberia reducir el coste de atencion frente a un denso de 8,6B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Teutonic-I Reliquary SFT (este) | ~8,6B | 64k | Hibrida (24 DeltaNet + 8 softmax) | Apache-2.0 | No |
| Qwen/Qwen3.5-9B-Base | ~9B | no disponible en la informacion | Transformer denso | Apache-2.0 (heredada) | No disponible en la informacion |
| dendriteholdings/Teutonic-I | ~8,6B | no disponible en la informacion | Hibrida (32 capas con 8 GLA) | Apache-2.0 | No disponible en la informacion |
| Qwen3.8-27B (profesor de destilacion) | ~27B | no disponible en la informacion | no disponible | no disponible | No disponible en la informacion |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Checkpoint intermedio: se trata del paso 100 de un pipeline de RL asincrono, no de un modelo final; su calidad puede ser inferior a la de un checkpoint convergido.
- Ausencia total de evaluacion: 8 descargas, 0 likes y ningun benchmark publicado; no hay evidencia empirica de su rendimiento en MMLU, HumanEval, GSM8K ni tareas agenticas.
- Riesgo de alucinacion: inherente a los modelos destilados de 8,6B sin evaluacion de factualidad; el modo thinking no garantiza correccion.
- Idiomas no declarados: no se especifica cobertura multilingue; el uso en castellano no esta validado y podria degradarse respecto al ingles.
- Linaje complejo: el injerto de atencion y la curacion de solo 50M tokens en las capas sustituidas pueden introducir inconsistencias entre capas DeltaNet y softmax no detectadas por el autor.
- Licencia: Apache-2.0 permite uso comercial, pero al modificar Teutonic-I y Qwen3.5-9B-Base conviene verificar las obligaciones de atribucion de ambos linajes.
- Soporte de tool calling no documentado: la etiqueta `agentic` no garantiza un formato de function calling estable; en produccion habria que validarlo explicitamente.
- Sin artefactos cuantizados oficiales: el despliegue en hardware consumer exige generar GGUF/AWQ/GPTQ por cuenta propia, con el riesgo de degradacion asociado.
- Fecha de creacion futura (2026-10-29) en los metadatos de Hugging Face: conviene verificar la integridad del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReliquaryForge/teutonic-rl-async-v1-step-00000100
- Modelo base Teutonic-I: https://huggingface.co/dendriteholdings/Teutonic-I
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Bittensor Subnet 3 (Teutonic): no disponible enlace directo en la informacion proporcionada
- Bittensor Subnet 81 (Reliquary): no disponible enlace directo en la informacion proporcionada
