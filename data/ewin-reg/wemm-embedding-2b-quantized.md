# ewin-reg/WeMM-Embedding-2B-Quantized

## Resumen

`WeMM-Embedding-2B-Quantized` es una version cuantizada del modelo `tencent/WeMM-Embedding-2B`, un modelo de embeddings omni-modal desarrollado por Tencent que acepta texto, imagenes, videos, documentos visuales y entradas multimodales intercaladas, y devuelve embeddings L2-normalizados de 2048 dimensiones. La cuantizacion ha sido realizada por el desarrollador `ewin-reg` con un esquema de precision mixta que reduce el peso del checkpoint a 1,44 GB, manteniendo una alta fidelidad en la representacion semantica. El modelo es relevante para entornos de despliegue con restricciones de memoria, como servidores edge o bases de datos vectoriales en produccion, donde se necesita recuperacion multimodal eficiente sin sacrificar demasiada calidad.

La arquitectura base es hibrida, basada en Qwen3.5, con 18 capas de atencion lineal (GatedDeltaNet) y 6 capas de atencion completa, mas un Vision Transformer (ViT) de 24 capas para el procesamiento de imagen y video. El checkpoint cuantizado contiene 1.510.770.816 parametros, frente a los 2.72B del modelo original. No se especifica la longitud de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida: 18 capas de atencion lineal (GatedDeltaNet) + 6 capas de atencion completa, con ViT de 24 capas para vision |
| Parametros totales | 1.510.770.816 (checkpoint cuantizado); el modelo base tiene 2.72B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 hibrida: SVD Rank-32 FP8 para la tabla de vocabulario, FP8 E4M3 para capas de atencion completa, INT4 Group-64 para atencion lineal y proyecciones ViT |
| Idiomas soportados | en, zh, multilingual (sin lista detallada) |
| Licencia | other |
| Formato de pesos | SafeTensors (model.safetensors, 1,44 GB) |

## Arquitectura y entrenamiento

El modelo base `tencent/WeMM-Embedding-2B` emplea una arquitectura hibrida Qwen3.5 que combina 18 capas de atencion lineal con recurrencia de estado asociativa (GatedDeltaNet) y 6 capas de atencion completa con softmax estandar. Las capas de atencion lineal acumulan errores a lo largo de la secuencia, por lo que la cuantizacion de las proyecciones de escritura (`k_proj`, `v_proj`) en las capas previas a la atencion completa se protege con FP8 E4M3. Las 6 capas de atencion completa se mantienen integras en FP8 E4M3 para evitar el colapso de la atencion causado por el ruido de cuantizacion en consultas y claves. La tabla de vocabulario (248.078 x 2048) se comprime mediante descomposicion SVD de rango 32 en FP8, mas un residuo INT4 Group-64, reduciendo su peso de 1.016 MB a 265 MB. El ViT de 24 capas procesa parches de imagen de 16x16 y fotogramas de video de 2x2, con proyecciones feed-forward en INT4 Group-64, mientras que las normas de pooling visual y las posiciones se conservan en precision original.

No se han proporcionado detalles sobre el proceso de entrenamiento del modelo base (tokens, composicion del dataset, RLHF/DPO) en la informacion disponible. La innovacion tecnica destacable es el esquema de cuantizacion de cuatro pilares, que combina SVD, FP8 e INT4 con proteccion de softmax para preservar la fidelidad en tareas de recuperacion multimodal.

## Capacidades

- Generacion de embeddings multimodales para texto, imagenes, videos, documentos visuales y entradas intercaladas.
- Recuperacion semantica cross-modal: ranking texto-imagen, texto-video y busqueda multimodal.
- Dimensiones de embedding configurables mediante Matryoshka Representation Learning (MRL), desde 2048 hasta 64 dimensiones.
- Compatibilidad nativa con Hugging Face y SentenceTransformers mediante `trust_remote_code=True`.
- Ejecucion en Python puro sin dependencias de runtimes C++ ni forks de GGUF.
- No soporta generacion de texto libre: la cabeza de lenguaje causal ha sido reemplazada por proyecciones de embedding con mean-pooling.
- No soporta audio.
- No soporta tool calling ni razonamiento multi-paso, al ser un modelo de embeddings.

## Casos de uso

- Busqueda semantica en documentos: indexar documentos de texto y consultas con `SentenceTransformer`, obteniendo embeddings de 2048 dimensiones para recuperacion por similitud coseno.
- Recuperacion de imagenes por texto: ranking zero-shot de imagenes en catalogos o bases de datos visuales a partir de consultas de texto, sin necesidad de etiquetado manual.
- Recuperacion de clips de video: indexar fotogramas o secuencias de video y buscar por texto, util en sistemas de archivo o vigilancia.
- Sistemas de recomendacion multimodal: recomendar contenido (texto, imagen, video) calculando la similitud entre embeddings de items y de perfiles de usuario.
- RAG multimodal: integrar el modelo en pipelines de recuperacion que combinan texto e imagenes para proporcionar contexto a un generador, mejorando la calidad de respuestas basadas en documentos visuales.
- Despliegue en edge: gracias a su peso de 1,44 GB, puede ejecutarse en servidores edge con presupuesto de memoria de 1,5-2 GB, manteniendo una latencia aceptable.
- Indexacion vectorial flexible: truncar las dimensiones de embedding a 512, 256 o 128 para reducir el coste de almacenamiento en bases vectoriales, aprovechando MRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico conjunto de metricas proporcionado corresponde a la evaluacion de fidelidad tras la cuantizacion, realizada por el autor del modelo:

| Metrica | Valor |
|---|---|
| Model Size on Disk | 1,4407 GB |
| Storage Footprint Reduction | 71,59 % |
| Text Cosine Fidelity | 96,7267 % |
| Text Degradation | 3,2733 % |
| Visual Image Fidelity | 94,6120 % |
| Video Frame Fidelity | 93,1850 % |
| Attention Softmax Protection | FP8 E4M3 |

Estas metricas indican la similitud coseno entre los embeddings del modelo cuantizado y los del modelo original para texto, imagen y video, asi como la reduccion del peso en disco.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,5-2 GB, segun el presupuesto indicado en el README para despliegues en edge.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, RTX 3060, GTX 1660) o CPU con 4 GB de RAM.
- Cabe en consumer GPU: si, en GPUs de 2 GB o mas.
- Opciones de despliegue: SentenceTransformers, Hugging Face, Python puro; no requiere vLLM, llama.cpp ni GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones de embedding | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Embedding-2B-Quantized | 1.510.770.816 | 2048 (MRL hasta 64) | 1,44 GB | other | Hugging Face |
| tencent/WeMM-Embedding-2B (base) | 2.72B | 2048 | no disponible | other | Hugging Face |

No se dispone de datos de comparacion con otros modelos de embeddings multimodales en la informacion proporcionada.

## Limitaciones y advertencias

- No genera texto libre: la cabeza de lenguaje causal ha sido eliminada, por lo que no puede usarse para conversacion o generacion.
- No soporta audio, segun la documentacion del modelo base.
- Licencia "other": puede imponer restricciones de uso comercial; es necesario revisar los terminos completos antes de desplegar en produccion.
- Perdida de fidelidad en video (93,185 % de similitud coseno) e imagen (94,612 %) tras la cuantizacion, que puede afectar a tareas de recuperacion muy sensibles.
- El fine-tuning directo sobre los pesos INT4 no es posible; se requiere dequantizacion a BF16/FP16.
- Los idiomas soportados se limitan a ingles, chino y un conjunto no especificado de lenguas multilingues; no se garantiza cobertura para todas las lenguas.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo.
- Sesgos: no especificados en la informacion disponible.

## Enlaces

- https://huggingface.co/ewin-reg/WeMM-Embedding-2B-Quantized
- https://huggingface.co/tencent/WeMM-Embedding-2B
- https://sbert.net/ (libreria SentenceTransformers)
- Referencia a arXiv:2608.24053 en los tags del modelo (no verificado)
