# onnx-community/paraphrase-filipino-mpnet-base-v2-ONNX

## Resumen
El modelo `onnx-community/paraphrase-filipino-mpnet-base-v2-ONNX` es una conversión a formato ONNX del modelo de embeddings de frases `meedan/paraphrase-filipino-mpnet-base-v2`, desarrollado por Meedan y adaptado por la comunidad ONNX. Este modelo está especializado en generar representaciones vectoriales densas de 768 dimensiones para frases y párrafos en filipino (tagalo) e inglés, con el objetivo de facilitar tareas como búsqueda semántica, similitud de frases y clustering. Su relevancia radica en que cubre un idioma con pocos recursos específicos, ofreciendo un rendimiento comparable al modelo multilingüe base en inglés y mejoras sustanciales en filipino. La versión ONNX permite su despliegue en entornos de producción con runtimes como ONNX Runtime o Transformers.js, sin necesidad de depender de PyTorch.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa) con pooling mean |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Filipino (tagalo) e inglés |
| Licencia | no disponible |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura XLM-RoBERTa, un transformer multilingüe preentrenado, al que se le añade una capa de pooling de media sobre los tokens de salida para obtener un embedding de frase de 768 dimensiones. El entrenamiento se realizó mediante destilación student-teacher, siguiendo el enfoque de Reimers y Gurevych (2020): el profesor es `sentence-transformers/paraphrase-mpnet-base-v2` y el estudiante es `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`. Se utilizaron datos paralelos inglés-tagalo e inglés-filipino de OPUS, filtrados con el detector de idiomas CLDv3 para garantizar la calidad. El entrenamiento duró 2 épocas con un batch size de 64, loss MSE, optimizador AdamW con learning rate 2e-5 y warmup de 10,000 pasos. No se aplicaron técnicas de RLHF ni DPO; es un modelo puramente de embeddings.

## Capacidades
- Generación de embeddings de frases y párrafos de hasta 128 tokens.
- Similitud semántica entre frases en filipino e inglés, con buena transferencia entre ambos idiomas.
- Búsqueda semántica y recuperación de información en corpus en filipino.
- Clustering de documentos o mensajes por similitud semántica.
- Soporte para tareas de clasificación de texto mediante la comparación de embeddings (por ejemplo, detección de duplicados).
- No soporta generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un modelo de representación.

## Casos de uso
- Búsqueda semántica en atención al cliente: permite indexar preguntas frecuentes en filipino y recuperar respuestas relevantes a partir de consultas de usuarios, gracias a la similitud coseno entre embeddings.
- Moderación de contenido en redes sociales: agrupar mensajes similares en filipino para detectar temas recurrentes o spam, usando clustering sobre los embeddings generados.
- Traducción asistida: alinear frases paralelas inglés-filipino en memorias de traducción, comparando embeddings para encontrar correspondencias.
- Análisis de encuestas y feedback: clasificar respuestas abiertas en filipino por tema o sentimiento, proyectando los embeddings en un espacio de baja dimensión.
- Detección de duplicados en bases de conocimiento: identificar entradas repetidas o muy similares en documentos técnicos o artículos en filipino.
- Sistemas de recomendación de contenido: comparar la similitud entre artículos o noticias en filipino para sugerir lecturas relacionadas.

## Benchmarks y rendimiento
Según la model card del modelo original, se evaluó la correlación de Spearman sobre datos STS traducidos al filipino y el STS original en inglés. Los resultados son:
- Correlación media en inglés: 0.80
- Correlación media en filipino: 0.75

No se han publicado comparaciones formales con otros modelos en la información disponible.

## Requisitos de hardware
- Al ser un modelo de embeddings de tamaño base (XLM-R), el archivo ONNX ocupa aproximadamente 1 GB (el repo completo pesa 3.5 GB, posiblemente incluye múltiples variantes).
- Puede ejecutarse en CPU con memoria RAM suficiente (al menos 4 GB) para inferencia en lote.
- En GPU, cabe en tarjetas con 2 GB de VRAM o más, como una NVIDIA GTX 1050 Ti o superior.
- Es compatible con runtimes como ONNX Runtime, Transformers.js (para navegador o Node.js) y text-embeddings-inference.
- La latencia típica para una frase corta en CPU es del orden de decenas de milisegundos, aunque depende del hardware y la optimización.

## Comparativa con modelos similares
| Modelo | Idioma | Dimensiones | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `meedan/paraphrase-filipino-mpnet-base-v2` (original) | Filipino e inglés | 768 | 128 | no disponible | PyTorch |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | Multilingüe (50+ idiomas) | 768 | 128 | Apache 2.0 | PyTorch |
| `onnx-community/paraphrase-filipino-mpnet-base-v2-ONNX` | Filipino e inglés | 768 | 128 | no disponible | ONNX |

El modelo ONNX es funcionalmente idéntico al original, pero optimizado para despliegue con ONNX Runtime. Frente al modelo multilingüe, ofrece mejor rendimiento en filipino a costa de perder cobertura en otros idiomas.

## Limitaciones y advertencias
- Longitud máxima de secuencia limitada a 128 tokens; frases más largas se truncarán, lo que puede degradar la calidad del embedding.
- Entrenado exclusivamente con datos paralelos de OPUS, que pueden contener sesgos o variaciones dialectales del filipino; no se garantiza cobertura de todos los registros o variantes.
- No es un modelo generativo; no puede producir texto ni responder preguntas de forma autónoma.
- La licencia no está especificada, por lo que se recomienda contactar con el autor original antes de usarlo en aplicaciones comerciales.
- Al ser una conversión automática a ONNX, no se han validado exhaustivamente todas las operaciones; es recomendable probar la salida en el caso de uso concreto.

## Enlaces
- [Modelo ONNX en Hugging Face](https://huggingface.co/onnx-community/paraphrase-filipino-mpnet-base-v2-ONNX)
- [Modelo original en Hugging Face](https://huggingface.co/meedan/paraphrase-filipino-mpnet-base-v2)
- [Paper de Reimers y Gurevych (2020) sobre destilación multilingüe](https://aclanthology.org/2020.emnlp-main.365/)
- [Documentación de sentence-transformers](https://www.sbert.net)
- [ONNX Runtime](https://onnxruntime.ai)
- [Transformers.js](https://huggingface.co/docs/transformers.js)
