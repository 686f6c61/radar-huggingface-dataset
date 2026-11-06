# bakhil-aissa/embeddinggemma-2-int8-mnn

## Resumen

EmbeddingGemma 2 int8 MNN es una conversión del modelo de embeddings `google/embeddinggemma-2` de Google DeepMind al formato MNN (Alibaba), pensada para inferencia en CPU sin dependencias de PyTorch ni onnxruntime. El autor del repositorio es bakhil-aissa y publica únicamente la torre de texto del modelo original, con cuantización int8 de solo pesos (weight-only, bloques de 128) y un peso externo de aproximadamente 600 MB. El modelo base es un embedding multimodal que proyecta texto (incluido código), imagen, vídeo y audio en un espacio común de 768 dimensiones, con truncamiento Matryoshka a 512, 256 y 128 dimensiones y una ventana de contexto de 8.192 tokens.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de embeddings de calidad en entornos de borde (edge) y CPU sin acelerador, algo útil para búsqueda semántica local, RAG en dispositivo y clasificación de texto en tiempo real. Por otro, es un ejemplo de cadena de conversión ONNX a MNN con parcheo de operadores fusionados de Microsoft (`SimplifiedLayerNormalization` y `SkipSimplifiedLayerNormalization`) que MNNConvert no soporta de forma nativa.

Conviene subrayar que el repositorio no incluye resultados de validación medidos: la propia model card deja las comprobaciones de equivalencia, latencia y solapamiento de recuperación como "TBD". Además, la torre de visión y la de audio no están convertidas, por lo que las entradas `image_features`, `video_features` y `audio_features` deben alimentarse con tensores vacíos de forma `[0, 512]`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto del modelo base EmbeddingGemma 2), grafo MNN con atención fusionada |
| Parámetros totales | no disponible (el peso int8 externo ocupa aproximadamente 600 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | int8 weight-only, bloques de 128; tabla de embeddings sin cuantizar; precisión de activaciones en fp32 (precision "high") |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`text.mnn` + `text.mnn.weight` externo) |

## Arquitectura y entrenamiento

El modelo base es un transformer de embeddings de Google DeepMind diseñado para fusión multimodal: codifica texto, imagen, vídeo y audio en un único espacio de 768 dimensiones con soporte de truncamiento Matryoshka a 512, 256 y 128 dimensiones. Esta conversión conserva la topología del grafo original (atención fusionada) pero solo materializa la torre de texto; las entradas multimodales permanecen en el grafo como tensores vacíos. La conversión parte del export ONNX de `onnx-community/embeddinggemma-2-ONNX`, parchea los operadores `com.microsoft::SimplifiedLayerNormalization` y `SkipSimplifiedLayerNormalization` reescribiéndolos como RMSNorm estándar (Mul, ReduceMean, Add, Sqrt, Reciprocal, Mul) y convierte con MNN 3.6 sobre ONNX opset 21 usando `--transformerFuse --weightQuantBits 8 --weightQuantBlock 128 --saveExternalData`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. La innovación técnica destacable de este repositorio es la cadena de conversión con verificación de equivalencia entre el ONNX parcheado y el original, y la advertencia explícita de no ejecutar en fp16 por desbordamiento de activaciones (NaN o embeddings silenciosamente incorrectos). La tabla de embeddings no se cuantiza, lo que explica el tamaño de 600 MB del fichero de pesos.

## Capacidades

- Generación de embeddings de texto de 768 dimensiones, incluido código, con normalización L2.
- Truncamiento Matryoshka a 512, 256 y 128 dimensiones con renormalización posterior; la calidad se mantiene casi sin pérdida hasta 256d según la model card.
- Recuperación semántica y búsqueda con prefijos de tarea específicos: `task: search result`, `task: question answering`, `task: classification`, `task: clustering` y `task: sentence similarity`.
- Soporte multilingüe heredado del modelo base.
- Inferencia en CPU pura mediante el paquete Python `MNN` (pymnn), sin PyTorch ni onnxruntime.
- Entradas multimodales presentes en el grafo (`image_features`, `video_features`, `audio_features`) pero no funcionales: deben pasarse vacías.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de extracción de características, no generativo.

## Casos de uso

- Búsqueda semántica local en aplicaciones de escritorio: el modelo puede indexar y consultar documentos en el propio dispositivo usando la ventana de 8.192 tokens y la truncación a 256d para reducir memoria, sin enviar datos a la nube.
- RAG en el borde: generación aumentada por recuperación en dispositivos con CPU limitada, donde el embedding de consultas y pasajes se calcula con MNN y el contexto de 8.192 tokens permite indexar fragmentos largos sin trocear en exceso.
- Clasificación de contenido: con el prefijo `task: classification` se pueden generar embeddings de textos y entrenar un clasificador ligero encima, útil para moderación o etiquetado de tickets en tiempo real.
- Deduplicación y clustering de documentos: el prefijo `task: clustering` y la normalización L2 permiten agrupar noticias, correos o registros con similitud coseno directa.
- Detección de similitud de frases: con `task: sentence similarity` se cubren casos de comparación de respuestas, control de calidad de traducciones o detección de paráfrasis.
- Búsqueda de código: el modelo base incluye código en su entrenamiento, por lo que puede alimentar índices semánticos de repositorios o documentación técnica en herramientas de desarrollo.
- Despliegue en dispositivos ARM y entornos embebidos: aunque el autor solo ha probado x86, el formato MNN y la cuantización int8 apuntan a escenarios de edge computing; conviene medir latencia antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card deja las siguientes comprobaciones como "TBD": equivalencia coseno entre ONNX parcheado y original, equivalencia coseno entre MNN int8 y ONNX original, solapamiento top-k en recuperación y latencia en CPU. El único dato medido es el tamaño del fichero `text.mnn.weight`, de aproximadamente 600 MB.

## Requisitos de hardware

- VRAM/RAM estimada: al ejecutarse en CPU, requiere aproximadamente 600 MB para los pesos int8 más la memoria de activaciones; con contexto de 8.192 tokens la huella crece de forma apreciable y conviene reservar al menos 2-4 GB de RAM del sistema.
- GPU recomendadas: no aplica; la conversión está orientada a backend CPU de MNN. No se documenta soporte GPU en esta ficha.
- ¿Cabe en GPU consumer? No es el objetivo del repositorio; el formato es para CPU.
- Opciones de despliegue: paquete Python `MNN` (pymnn) con `nn.create_runtime_manager`, backend CPU, `precision: "high"` y `numThread` configurable. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no ha medido tiempos ni en x86 ni en ARM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensiones | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| EmbeddingGemma 2 int8 MNN (esta ficha) | no disponible (peso int8 ~600 MB) | 8.192 | 768 / 512 / 256 / 128 | Apache 2.0 | MNN, CPU |
| google/embeddinggemma-2 (base) | no disponible en la información | 8.192 | 768 / 512 / 256 / 128 | Apache 2.0 | PyTorch / ONNX, multimodal completo |
| onnx-community/embeddinggemma-2-ONNX | no disponible en la información | 8.192 | 768 / 512 / 256 / 128 | Apache 2.0 | ONNX, onnxruntime |

La comparativa se limita a las variantes del mismo modelo base porque no se han proporcionado datos de modelos alternativos de la misma categoría. La diferencia práctica entre esta conversión y el ONNX original es el runtime (MNN frente a onnxruntime), la cuantización int8 de pesos y la ausencia de las torres de visión y audio.

## Limitaciones y advertencias

- Solo texto: las torres de visión y audio no están convertidas; las entradas multimodales deben alimentarse con tensores `[0, 512]`.
- Nunca ejecutar en fp16: las activaciones superan el rango de fp16 y producen NaN o embeddings incorrectos de forma silenciosa. Mantener `precision: "high"`.
- La cuantización int8 de solo pesos altera ligeramente los embeddings respecto a fp32; hay que validar la calidad de recuperación con datos propios.
- La tabla de embeddings no está cuantizada, lo que mantiene el fichero de pesos en unos 600 MB.
- Solo probado en CPU x86; el rendimiento en ARM no se ha medido.
- La truncación a 128 dimensiones debe validarse en la tarea concreta; la propia model card advierte de ello.
- Consultas y documentos deben usar la misma dimensión de embedding.
- Hereda los sesgos, el riesgo de alucinación en tareas posteriores y las condiciones de uso responsable del modelo base, incluida la Gemma Prohibited Use Policy.
- Aunque la licencia del repositorio es Apache 2.0, el uso del modelo base está sujeto además a los términos de Google DeepMind para Gemma; conviene revisarlos antes de un despliegue comercial.
- Repositorio sin descargas ni likes y sin validación publicada: tratarlo como experimental hasta verificar equivalencia y latencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bakhil-aissa/embeddinggemma-2-int8-mnn
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Export ONNX de referencia: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Repositorio MNN: https://github.com/alibaba/MNN
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
