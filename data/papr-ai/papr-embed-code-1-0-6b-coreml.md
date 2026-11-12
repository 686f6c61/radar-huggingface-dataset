# papr-ai/papr-embed-code-1-0.6b-CoreML

## Resumen

papr-embed-code-1-0.6b-CoreML es la conversión a CoreML del modelo de embeddings para búsqueda de código papr-embed-code-1-0.6b, desarrollado por papr-ai. El modelo base parte de Qwen3-Embedding-0.6B, afinado específicamente para recuperación de código (code retrieval y code search), y esta versión lo empaqueta para ejecutarse en la Apple Neural Engine de los chips de Apple Silicon, sin necesidad de GPU dedicada ni de conexión de red.

El problema que resuelve es la búsqueda semántica de código en local: permite indexar un repositorio en la nube y realizar las consultas en el dispositivo, o al revés, manteniendo la interoperabilidad de los vectores entre las builds PyTorch, sentence-transformers, ONNX y CoreML. En una consulta de búsqueda típica, el modelo embebe en 16,7 ms de mediana en un M2 Pro, con una similitud coseno de 0,9998 frente a la versión PyTorch en fp32.

La relevancia actual está en el despliegue on-device para agentes de programación y editores: al ejecutarse sobre la Neural Engine, libera la CPU y evita el coste de servidores de inferencia. El modelo tiene 0,6 mil millones de parámetros, produce embeddings de 1024 dimensiones ya normalizados L2 y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-Embedding-0.6B) convertido a CoreML |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (tres funciones fijas: len_64, len_256, len_1024) |
| Tipos de cuantizacion | fp16 (pesos y cómputo); la build ONNX de referencia usa int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML (.mlpackage), fp16, 1,2 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3-Embedding-0.6B, un transformer decoder de 0,6 mil millones de parámetros afinado por papr-ai para búsqueda de código. La conversión a CoreML se realizó con coremltools 9 y PyTorch 2.x, y requirió tres cambios técnicos para que la Neural Engine ejecutara el modelo correctamente: formas de entrada fijas (una función por longitud, ya que las formas flexibles forzaban la planificación de todas las operaciones en CPU), RMSNorm reformulado como layer_norm([x, -x]) para evitar desbordamientos en fp16 (el flujo residual de Qwen3 llega a ~6.000 y x² desborda el máximo de 65.504), y pooling y normalización L2 integrados dentro del modelo para que el llamador no pueda seleccionar el token equivocado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card indica que 2.079 de las 2.083 operaciones se ejecutan en la Neural Engine; las 4 restantes corresponden al embedding lookup.

## Capacidades

- Generación de embeddings de código para búsqueda semántica y recuperación de ficheros fuente.
- Embeddings de 1024 dimensiones, normalizados L2 dentro del modelo (la similitud coseno equivale a un producto escalar).
- Soporte de consultas con prefijo de instrucción (`Instruct: <task>\nQuery:<text>`) y documentos sin prefijo.
- Tres longitudes fijas de entrada: 64 tokens para consultas, 256 para fragmentos y ficheros cortos, 1024 para ficheros de hasta ~1k tokens.
- Interoperabilidad de vectores con las builds PyTorch, sentence-transformers y ONNX del mismo modelo.
- Ejecución on-device en Apple Silicon (M1 o posterior) con macOS 15 o superior.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un modelo exclusivamente de extracción de características (feature-extraction).

## Casos de uso

- Búsqueda semántica de código en editores y IDE: el modelo embebe la consulta del usuario en 16,7 ms sobre la Neural Engine y permite recuperar el fichero fuente relevante sin salir del dispositivo ni enviar código a un servidor.
- Agentes de programación on-device: un agente local puede indexar el repositorio en la nube con la build PyTorch y consultar en el dispositivo con la build CoreML, manteniendo la privacidad del código y la compatibilidad de vectores.
- Indexación en la nube y búsqueda local: gracias a la equivalencia de vectores (coseno 0,9998 frente a fp32), se puede generar el índice con la build ONNX o PyTorch en servidor y realizar las consultas en un portátil Mac.
- Asistentes de revisión de código: embeber fragmentos de hasta 1024 tokens permite localizar implementaciones duplicadas, funciones relacionadas o código que debe modificarse ante un cambio.
- Herramientas de documentación técnica: generar un índice semántico de ejemplos de código y recuperar el snippet adecuado para una consulta en lenguaje natural en documentación interactiva.
- Automatización de soporte a desarrolladores: un bot interno puede responder preguntas del tipo "cómo reintentar una subida con backoff" recuperando el fichero fuente correspondiente mediante similitud coseno.
- Búsqueda en bases de código privadas sin conexión: al no requerir red ni GPU, encaja en entornos de desarrollo aislados o con requisitos estrictos de confidencialidad.

## Benchmarks y rendimiento

Los datos publicados en la model card miden latencia y paridad numérica frente a PyTorch fp32 en un MacBook Pro M2 Pro (16 GB), macOS 15.6, con `ComputeUnit.CPU_AND_NE`. El coseno indicado es el mínimo sobre las muestras evaluadas.

| Funcion | Uso | Latencia p50 | Latencia p95 | Coseno vs fp32 (min) |
|---|---|---|---|---|
| len_64 | consultas de búsqueda | 16,7 ms | 17 ms | 0,9998 |
| len_256 | ficheros cortos, fragmentos | 45 ms | 50 ms | 0,9997 |
| len_1024 | ficheros de hasta ~1k tokens | 306 ms | 309 ms | 0,9997 |

Como referencia, la build ONNX int8 en CPU tarda unos 350 ms por consulta en el mismo equipo, con coseno 0,9998. No se han publicado resultados de benchmarks de recuperación (por ejemplo, MRR o Recall@k) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en Apple Silicon con 1,2 GB de pesos fp16 en memoria unificada.
- GPU recomendadas: no requiere GPU dedicada; utiliza la Neural Engine de los chips M1 o posteriores.
- Cabe en cualquier Mac con Apple Silicon (M1 o superior) y macOS 15 o superior; no está pensado para GPUs NVIDIA ni para hardware x86.
- Opciones de despliegue: CoreML mediante coremltools (Python) o MLModel (Swift), con `computeUnits = .cpuAndNeuralEngine`. No se distribuye en formato GGUF ni es compatible con vLLM, llama.cpp, Ollama o TGI.
- Latencia: 16,7 ms p50 para consultas (len_64), 45 ms para fragmentos (len_256) y 306 ms para ficheros (len_1024) en un M2 Pro.
- La primera carga de cada función compila para la Neural Engine y tarda entre 30 y 60 segundos por longitud (unos 50 segundos para las tres); las cargas posteriores tardan segundos porque macOS cachea el modelo compilado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| papr-embed-code-1-0.6b-CoreML | 0,6B | 1024 tokens (fijo) | CoreML, Apple Neural Engine | Apache 2.0 | 16,7 ms por consulta en M2 Pro |
| papr-embed-code-1-0.6b (PyTorch) | 0,6B | no disponible | PyTorch / sentence-transformers | Apache 2.0 | Referencia fp32; permite textos de más de 1023 tokens |
| papr-embed-code-1-0.6b (ONNX int8) | 0,6B | no disponible | ONNX, CPU | Apache 2.0 | ~350 ms por consulta en M2 Pro |
| Qwen3-Embedding-0.6B | 0,6B | no disponible | PyTorch y otros | no disponible | Modelo base sin el ajuste específico para código |

## Limitaciones y advertencias

- El token de fin debe ser `<|endoftext|>` (151643). Con versiones recientes de `transformers`, `tokenizer.eos_token` resuelve a `<|im_end|>` (151645), lo que produce vectores con coseno de 0,5 a 0,8 frente a los reales y degrada silenciosamente la recuperación.
- La descarga debe hacerse con `local_dir=` (o `hf download --local-dir`); CoreML no puede compilar un `.mlpackage` a través de los enlaces simbólicos de la caché por defecto de Hugging Face y falla con el error `weight.bin doesn't exist`.
- El relleno debe hacerse por la derecha y `last_index` debe apuntar al último token real, no al relleno.
- La longitud máxima es de 1024 tokens; para textos de más de 1023 tokens hay que trocearlos o usar la build PyTorch/ONNX.
- Requiere Apple Silicon (M1 o posterior) y macOS 15 o superior; no es desplegable en GPUs NVIDIA, servidores x86 ni entornos Linux.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base; al ser un modelo de embeddings, el riesgo de alucinación se traslada a la calidad de la recuperación (falsos positivos en la búsqueda).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-Embedding-0.6B y del dataset de ajuste, no detalladas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/papr-ai/papr-embed-code-1-0.6b-CoreML
- Modelo base: https://huggingface.co/papr-ai/papr-embed-code-1-0.6b
- Script de ejemplo `examples/embed.py`: https://huggingface.co/papr-ai/papr-embed-code-1-0.6b-CoreML/blob/main/examples/embed.py
- Script de conversión `convert_coreml.py`: https://huggingface.co/papr-ai/papr-embed-code-1-0.6b-CoreML/blob/main/convert_coreml.py
- Resultados de paridad `results/coreml_parity.json`: https://huggingface.co/papr-ai/papr-embed-code-1-0.6b-CoreML/blob/main/results/coreml_parity.json
