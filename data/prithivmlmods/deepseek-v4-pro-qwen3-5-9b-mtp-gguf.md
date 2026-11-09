# prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF es la distribucion cuantizada en formato GGUF del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de Qwen3.5-9B destilado de DeepSeek-V4-Pro en modo "Max Effect" por el usuario Jackrong y empaquetado para inferencia local por prithivMLmods. El modelo cuenta con 9.197.093.888 parametros (aproximadamente 9,2B) y esta orientado a razonamiento matematico y STEM, con soporte declarado de tool calling, function calling y vision (pipeline image-text-to-text).

La particularidad de esta publicacion es la integracion de Multi-Token Prediction (MTP) directamente en los pesos del GGUF, lo que permite decodificacion especulativa sin necesidad de un modelo draft separado: la arquitectura incluye cabezas adicionales que predicen varios tokens futuros en un unico forward pass. Ademas, el autor incluye un fichero de proyeccion multimodal (mmproj) para el componente de vision.

Es relevante ahora porque ofrece un modelo de razonamiento de ~9B en un formato listo para llama.cpp con licencia Apache 2.0, cuantizaciones desde Q3 hasta BF16 y optimizaciones declaradas para hardware NVIDIA Blackwell (SM120, GB202, B200, B300, FP4). El modelo base se entreno con unos 250K ejemplos de matematicas y STEM mediante SFT seguido de una etapa ligera de RL con GSPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-9B) con cabezas Multi-Token Prediction (MTP) para decodificacion especulativa |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; mmproj-bf16 para vision; variantes NVFP4-GPTQ y NVFP4-GPTQ-GGUF en repos separados |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repos adicionales en NVFP4-GPTQ |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.5-9B (transformer denso de ~9,2B parametros) destilado de DeepSeek-V4-Pro en modo "Max Effect". El entrenamiento consistio en una etapa de SFT sobre aproximadamente 250K muestras de matematicas y STEM, seguida de una etapa ligera de RL con GSPO. No se incluyo datos de codigo en ninguna de las dos etapas; la model card reporta pequenas ganancias en programacion y uso de herramientas como transferencia cruzada preliminar.

La innovacion tecnica destacable es la integracion de Multi-Token Prediction (MTP) en el propio fichero GGUF: en lugar de requerir un modelo draft separado para decodificacion especulativa, la arquitectura incorpora cabezas de salida adicionales que predicen multiples tokens futuros en un solo forward pass, acelerando la inferencia local. Los tags del repositorio mencionan ademas compatibilidad con NVIDIA Blackwell (SM120, GB202, B200, B300, FP4) y el uso de Unsloth en el proceso de construccion, en colaboracion con Kyle Hessling.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de razonamiento (reasoning) heredado del proceso de destilacion.
- Razonamiento matematico y STEM: entrenado especificamente sobre ~250K muestras de matematicas y ciencia.
- Respuestas concisas: la model card reporta respuestas de una sola letra en el 97,2% de los casos cuando se solicita, frente al 37,3% de Qwen3.5-9B.
- Tool calling y function calling (etiquetas tool-use y function-calling en el repositorio).
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text, fichero mmproj-bf16 incluido).
- Soporte multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Decodificacion especulativa nativa mediante MTP integrado en los pesos.
- Compatible con text-generation-inference, llama-cpp y transformers.

## Casos de uso

- Tutoria de matematicas y fisica: el modelo puede resolver problemas paso a paso y, cuando se le pide, emitir una respuesta final concisa en una sola letra, lo que facilita la integracion en sistemas de correccion automatica.
- Asistente de razonamiento STEM en local: con cuantizaciones Q4_K_M de 5,78 GB puede desplegarse en portatiles con GPU consumer para resolver problemas de quimica, fisica y matematicas sin conexion.
- Pipelines de agentes con tool calling: la combinacion de function calling y decodificacion especulativa MTP permite construir agentes multi-paso con latencia reducida en entornos de produccion.
- Analisis de documentos cientificos con imagenes: gracias al fichero mmproj y al pipeline image-text-to-text, puede procesar figuras, graficos y tablas de articulos junto con el texto.
- Atencion al cliente multilingue: soporta conversaciones en seis idiomas (en, zh, ko, ja, es, ru) con contexto conversacional.
- Despliegue en hardware Blackwell: las variantes NVFP4-GPTQ y las optimizaciones SM120/GB202/B200/B300 estan pensadas para servidores con GPU RTX Pro 6000, B200 o B300 en precision FP4.
- Generacion de codigo asistida: aunque no se entreno con datos de codigo, la model card reporta transferencia cruzada preliminar que permite su uso como asistente de programacion basico.

## Benchmarks y rendimiento

Los datos son del autor, sobre muestras aleatorias y no sobre subconjuntos completos, y con builds distintos (NVFP4 bajo vLLM para GSM8K y MTP-Q8_0 GGUF en llama.cpp para MMLU-Pro).

| Benchmark | DeepSeek-V4-Pro-Qwen3.5-9B | Qwen3.5-9B | Notas |
|---|---|---|---|
| GSM8K | 94,50% | no disponible | Media de cuatro ejecuciones, build NVFP4 bajo vLLM |
| MMLU-Pro (Math, Physics, Chemistry; 1.500 preguntas) | 90,53% | 89,60% | +0,93 puntos; build MTP-Q8_0 GGUF en llama.cpp |
| Tokens de razonamiento por respuesta correcta | ~36% menos | referencia | Segun model card |
| Respuesta de una sola letra cuando se solicita | 97,2% | 37,3% | Segun model card |

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~5 GB con Q3_K_M (4,74 GB de pesos) hasta ~18,4 GB con BF16; Q4_K_M (5,78 GB) es el tamano recomendado por el autor para la mayoria de casos.
- GPU recomendadas: NVIDIA RTX Pro 6000, B200 y B300 para las variantes NVFP4/FP4 y optimizaciones Blackwell (SM120, GB202); A100 y H100 para BF16 y cuantizaciones altas.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas para Q4_K_M y Q5_K_M; Q6_K (7,56 GB) requiere 10-12 GB; BF16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, text-generation-inference (TGI), vLLM (para variantes NVFP4-GPTQ) y transformers.
- Latencia y throughput: no disponibles de forma cuantificada; el autor indica que MTP acelera la inferencia local mediante decodificacion especulativa integrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | MMLU-Pro (M/P/Q) | Licencia | Formato |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF | ~9,2B | no disponible | 94,50% | 90,53% | Apache 2.0 | GGUF, NVFP4-GPTQ |
| Qwen3.5-9B (base) | ~9B | no disponible | no disponible | 89,60% | no disponible | safetensors |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental de comunidad: la propia model card indica que las salidas requieren verificacion.
- Los benchmarks son del autor, sobre muestras aleatorias en lugar de subconjuntos completos, y con builds distintos (NVFP4 bajo vLLM para GSM8K, MTP-Q8_0 GGUF en llama.cpp para MMLU-Pro), por lo que no son directamente comparables entre si.
- No se entreno con datos de codigo; las ganancias en programacion y tool use son transferencia cruzada preliminar segun el autor.
- Riesgo de alucinacion inherente a los modelos de razonamiento destilados, especialmente en dominios fuera de matematicas y STEM.
- Longitud de contexto no documentada en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune conviene verificar las condiciones del modelo base Qwen3.5-9B y de los datos de destilacion de DeepSeek-V4-Pro.
- El modelo base tiene 0 descargas y 1 like en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version NVFP4-GPTQ: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ
- Version NVFP4-GPTQ-GGUF: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
