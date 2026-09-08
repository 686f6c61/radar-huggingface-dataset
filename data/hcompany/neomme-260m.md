# Hcompany/NeoMME-260M

## Resumen

NeoMME-260M es un codificador (encoder) fundacional multimodal y multilingüe desarrollado por H Company. A diferencia de los modelos generativos visuales-lenguaje habituales, no utiliza un codificador de visión preentrenado ni un decodificador causal: un único Transformer bidireccional procesa tanto tokens de texto como parches de imagen crudos de 32×32 píxeles a través de las mismas capas. Con 263 millones de parámetros y una ventana de contexto de 16.384 tokens, está diseñado para tareas de comprensión de documentos y extracción de características. Se entrenó desde cero sobre datos multilingües de texto y visual-texto, incluyendo texto web, código, matemáticas, páginas de documentos, captions y datos sintéticos de OCR. Su relevancia radica en que ofrece una alternativa eficiente a los modelos multimodales grandes, reduciendo costes de inferencia y fine-tuning, y forma parte de una familia que incluye una variante de 800M parámetros y un modelo retriever específico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional de torre única (single-tower), multimodal nativo, sin vision tower ni decoder causal |
| Parametros totales | 262.937.906 (263M según la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingüe (idiomas específicos no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

NeoMME-260M es un encoder Transformer bidireccional que procesa texto y parches de imagen en un espacio compartido. El vocabulario tiene 131.072 tokens, la dimensión oculta es 1.024 y los parches de imagen son de 32×32 píxeles, con un límite de 2.048 píxeles en el lado más largo por defecto. La innovación técnica principal es la ausencia de un codificador de visión preentrenado y de un decodificador causal: ambos componentes se eliminan y un único Transformer se entrena desde cero sobre datos multilingües de texto y visual-texto.

El preentrenamiento utiliza un objetivo de difusión discreta enmascarada (masked discrete-diffusion objective), en el que el modelo aprende a restaurar tokens de texto enmascarados dado el contexto circundante, incluyendo parches de imagen cuando están presentes. Para imágenes de documentos emparejadas con transcripciones, los parches de imagen permanecen visibles y el objetivo no incluye pérdida de reconstrucción de píxeles. Los datos de entrenamiento abarcan texto web, código, matemáticas, páginas de documentos, captions y datos sintéticos de OCR.

## Capacidades

- Extracción de características (feature extraction) multimodal: genera representaciones contextuales de tokens de texto y parches de imagen en un único pase hacia adelante.
- Modelado de lenguaje enmascarado: puede restaurar tokens de texto enmascarados dado el contexto, aunque no es un modelo generativo ni conversacional.
- Comprensión de documentos: procesa páginas de documentos e imágenes con texto, incluyendo datos sintéticos de OCR.
- Multilingüe: entrenado con datos multilingües de texto y visual-texto.
- Contexto largo: ventana de 16.384 tokens, adecuada para documentos extensos.
- Requiere fine-tuning para tareas específicas: no es usable directamente como modelo final para una tarea downstream.
- No es un modelo generativo ni conversacional: no genera texto libre ni mantiene diálogos.

## Casos de uso

- Recuperación de documentos (retrieval): se puede usar el modelo NeoMME-260M-Retriever, que alcanza 0,523 nDCG@10 en ViDoRe v3, o hacer fine-tuning de un cabezal de retrieval sobre NeoMME-260M. Es adecuado porque procesa texto e imagen en el mismo encoder, lo que permite consultas multimodales.
- Clasificación de documentos: fine-tuning para clasificar tipos de documentos como facturas, contratos o informes. Adecuado porque representa tokens de texto y parches de imagen en un espacio compartido, capturando tanto contenido textual como visual.
- Extracción de información: fine-tuning para extraer campos concretos de documentos (fechas, importes, nombres). Adecuado por la representación contextual de tokens, que permite identificar entidades en contextos largos.
- Búsqueda multimodal: combinar consultas de texto con imágenes para encontrar documentos relevantes en un corpus. Adecuado porque es multimodal nativo y no depende de un vision encoder separado.
- Indexación de archivos: usar como encoder para indexar páginas de documentos en sistemas de búsqueda empresarial. Adecuado por su eficiencia, contexto largo y capacidad de procesar imágenes de documentos.
- Preentrenamiento de representaciones para tareas downstream: usar como backbone en pipelines de NLP y visión para tareas como clasificación o extracción. Adecuado porque es un encoder preentrenado de propósito general, con licencia Apache 2.0 que permite uso comercial.

## Benchmarks y rendimiento

| Benchmark | Resultado | Modelo |
|---|---|---|
| ViDoRe v3 (nDCG@10) | 0,523 | NeoMME-260M-Retriever |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato publicado corresponde al modelo retriever sobre ViDoRe v3, y no se ofrecen comparativas con otros modelos en la información proporcionada.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware, VRAM, latencia o throughput.
- Estimación de VRAM: con 263M parámetros, los pesos en FP16 ocupan aproximadamente 526 MB; en FP32, aproximadamente 1,05 GB; con cuantización de 8 bits, alrededor de 263 MB. Estas son estimaciones basadas en el tamaño de los pesos, no datos oficiales.
- Es probable que quepa en GPUs de consumo con al menos 4 GB de VRAM, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: se puede usar con la librería Transformers, incluyendo `device_map="auto"` (requiere `accelerate`). No se mencionan vLLM, llama.cpp, Ollama o TGI en la información disponible.
- GPU recomendadas: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. Cabe destacar que NeoMME forma parte de una familia que incluye una variante de 800M parámetros y el modelo NeoMME-260M-Retriever para recuperación de documentos.

## Limitaciones y advertencias

- Es un backbone preentrenado y requiere fine-tuning específico para tareas downstream; no es usable directamente.
- No ha recibido una evaluación exhaustiva de seguridad, sesgos o privacidad.
- No es un modelo generativo ni conversacional; no puede responder preguntas ni generar texto libre.
- No está pensado para uso directo como retriever; para recuperación de documentos se debe usar NeoMME-260M-Retriever.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido auditado para sesgos o riesgos.
- Los idiomas específicos no están detallados; la calidad puede variar según el idioma.

## Enlaces

- HuggingFace: https://huggingface.co/Hcompany/NeoMME-260M
- Paper arXiv: https://arxiv.org/abs/2609.01657
- Blog de HuggingFace: https://huggingface.co/blog/Hcompany/neomme
- Modelo retriever: https://huggingface.co/Hcompany/NeoMME-260M-Retriever
- Documentación de Transformers: https://huggingface.co/docs/transformers/en/model_doc/neomme
- Colección de modelos: https://hf.co/collections/Hcompany/neomme
- Artículo de Marktechpost: https://www.marktechpost.com/2026/09/06/h-company-releases-neomme-a-family-of-260m-and-800m-single-tower-multimodal-encoders-that-drop-the-vision-tower-and-causal-decoder/
- Artículo de Unite.ai: https://www.unite.ai/de/h-company-releases-neomme-an-open-source-multimodal-encoder-family/
- OpenTrain AI: https://www.opentrain.ai/papers/neomme-a-single-tower-multimodal-native-multilingual-foundation-encoder-for-effi--arxiv-2609.01657/
