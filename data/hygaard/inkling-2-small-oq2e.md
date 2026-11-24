# Hygaard/Inkling-2-Small-oQ2e

## Resumen

Inkling-2-Small-oQ2e es una conversión cuantizada del modelo multimodal Inkling-2-Small-MXFP8 de Thinking Machines, publicada por el usuario Hygaard en Hugging Face. Se trata de un modelo de imagen-a-texto (image-text-to-text) orientado a Apple Silicon, empaquetado en formato MLX safetensors con precisión mixta oQ2e (2 bits para los expertos enrutados, 8 bits para atención y embeddings, BF16 para visión y MTP). El objetivo es hacer viable en hardware de memoria unificada de Apple un modelo de aproximadamente 595.000 millones de parámetros escalares.

El modelo conserva la arquitectura completa del original: 48 capas de texto con 384 expertos enrutados y top-8 routing, codificador y proyector de visión, tokenizador y plantilla de chat originales, además del sidecar de predicción multi-token (MTP) en BF16. La conversión mantiene el conjunto íntegro de expertos, sin poda, lo que preserva la capacidad del modelo base a costa de un tamaño de repositorio de 194,7 GB.

Es relevante porque demuestra que es posible ejecutar un modelo de escala cercana a los 600.000 millones de parámetros en equipos Apple Silicon de gama alta (256 GB o más), algo impracticable con pesos en BF16 o incluso MXFP8. La licencia Apache 2.0 facilita su uso comercial, aunque las limitaciones de hardware restringen su despliegue a estaciones de trabajo concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y codificador de visión; conversion MLX |
| Parametros totales | 594.050.641.920 (safetensors); 595.762.352.304 escalares segun la model card |
| Parametros activos | no disponible (top-8 routing sobre 384 expertos por capa, sin recuento publicado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ2e mixta: expertos enrutados a 2 bits, atencion y embeddings a 8 bits, vision y MTP en BF16, routers y controles en FP32; grupo de 64; 2,066 BPW empaquetados, 2,61 BPW efectivos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors MLX (33 shards principales mas sidecar MTP) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal con mezcla de expertos: 48 capas de texto, cada una con 384 expertos enrutados y enrutamiento top-8, mas un codificador de visión con proyector/merger. Incluye un sidecar de prediccion multi-token (MTP) en BF16, lo que sugiere soporte de decodificacion especulativa en el modelo original. La conversion conserva atencion, convoluciones, normalizacion y routers en precisiones superiores (8 bits, BF16 o FP32) para limitar la degradacion, mientras que el grueso de los parametros (los expertos enrutados, 587.068.342.272 parametros escalares) se comprime a 2 bits.

No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO. La conversion fue realizada con el conversor nativo oMLX para Inkling 2/oQe (PR #5229) a partir del checkpoint MXFP8 `thinkingmachines/Inkling-2-Small-MXFP8@086a047e8b7ff2ac902dd52355328ddb66b16914`, con calibracion sobre 384 muestras de 512 tokens con entradas de texto e imagen y cobertura completa de expertos. Los registros de conversion estan en `CONVERSION.json`.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline image-text-to-text, tag conversational).
- Comprension de imagenes gracias al codificador y proyector de vision conservados en BF16.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base, no verificadas con benchmarks en esta ficha.
- Prediccion multi-token (MTP) mediante el sidecar BF16, orientada a decodificacion especulativa.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente multimodal local en estaciones Apple Silicon: el modelo puede procesar imagenes y texto en una unica conversacion, adecuado para prototipos de analisis de documentos escaneados o capturas sin enviar datos a la nube.
- Investigacion sobre cuantizacion extrema: sirve como caso de estudio de hasta donde llega la compresion a 2 bits en expertos enrutados de un MoE grande, comparando con la variante oQe de 3,07 BPW.
- Evaluacion de calidad de modelos MoE multimodales: util para medir la degradacion de un checkpoint MXFP8 frente a su version cuantizada en tareas de vision y lenguaje.
- Generacion asistida de codigo en local: con 48 capas y 384 expertos, el modelo base apunta a tareas de programacion; la version cuantizada permite probarlo en un Mac Studio sin GPU dedicada.
- Procesamiento de imagenes con descripcion textual: clasificacion, captioning o extraccion de informacion de imagenes en pipelines offline.
- Despliegue de referencia para desarrolladores de MLX: permite validar flujos de inferencia con oMLX y comparar latencia y memoria frente a otras precisiones del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 194,72 GB solo de pesos; con cache KV y espacio de trabajo en tiempo de ejecucion se recomienda un minimo de 256 GB de memoria unificada.
- GPU recomendadas: Apple Silicon de gama alta con 256 GB o mas (por ejemplo, Mac Studio M3 Ultra con 256 GB o 512 GB). No es compatible con GPUs NVIDIA de consumo por el formato MLX.
- Cabe en GPU de consumo: no; 194,7 GB de pesos exceden cualquier GPU consumer actual (RTX 4090 con 24 GB, etc.).
- Opciones de despliegue: MLX y oMLX (libreria declarada `mlx`); no se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Inkling-2-Small-oQ2e (este) | ~594.000 M | no disponible | 2,61 BPW efectivos | apache-2.0 | Apple Silicon, 256 GB+ |
| Inkling-2-Small-oQe-3.07bpw-MLX | mismo modelo base | no disponible | 3,07 BPW | apache-2.0 | Apple Silicon, 256 GB (preferido por el autor) |
| Inkling-2-Small-MXFP8 | mismo modelo base | no disponible | MXFP8 | apache-2.0 | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2 bits de los expertos enrutados puede degradar la calidad frente al checkpoint MXFP8 original; el autor recomienda la variante oQe de 3,07 BPW para hardware de 256 GB.
- El modelo requiere hardware Apple Silicon con memoria unificada muy alta; no es desplegable en GPUs consumer ni en la mayoria de servidores x86 convencionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje grandes; no se han publicado evaluaciones especificas para esta conversion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los terminos de Thinking Machines deben verificarse de forma independiente.
- El repositorio tiene pocas descargas (384) y ningun "like", lo que indica validacion comunitaria limitada; conviene auditar los pesos antes de usarlos en produccion.
- El formato MLX limita la portabilidad a ecosistemas fuera de Apple.

## Enlaces

- Hugging Face: https://huggingface.co/Hygaard/Inkling-2-Small-oQ2e
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Variante de mayor precision: https://huggingface.co/Hygaard/Inkling-2-Small-oQe-3.07bpw-MLX
- PR del conversor oMLX: https://github.com/jundot/omlx/pull/5229
