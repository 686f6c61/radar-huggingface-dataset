# cyttic/trocr-bigram4-BY-50k

## Resumen

El modelo `cyttic/trocr-bigram4-BY-50k` es un ajuste fino (fine-tune) de un modelo base denominado `cyttic/exp2-frozen-benyehuda-cont`, desarrollado por el usuario cyttic. Se trata de un sistema de reconocimiento óptico de caracteres (OCR) basado en la arquitectura TrOCR, que combina un encoder de visión con un decoder de texto para convertir imágenes de texto en secuencias de caracteres. El pipeline declarado es `image-text-to-text`, lo que confirma su uso para tareas de OCR.

El modelo tiene 299.495.168 parámetros (aproximadamente 300 millones), un tamaño que lo sitúa en la gama de los TrOCR de tamaño medio. Se desconoce la longitud de contexto, los idiomas soportados y la licencia, ya que la model card es muy escasa y no proporciona esa información. El repositorio ocupa 3,6 GB y los pesos están en formato safetensors. La relevancia de este modelo radica en que es un ejemplo de fine-tuning de OCR sobre un corpus específico (el nombre sugiere "bigram4" y "BY-50k", posiblemente un dataset de 50.000 muestras), aunque no se han publicado detalles del conjunto de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (TrOCR) |
| Parametros totales | 299.495.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, que emplea un transformer de visión (encoder) para procesar la imagen y un transformer de texto (decoder) para generar la secuencia de caracteres. No se dispone de detalles sobre la configuración exacta del encoder y decoder (número de capas, dimensiones, etc.). El entrenamiento se realizó como un ajuste fino del modelo base `cyttic/exp2-frozen-benyehuda-cont`, con los siguientes hiperparámetros: learning rate de 2e-5, batch size de 8 (con acumulación de gradientes de 2, resultando en un batch efectivo de 16), optimizador AdamW, scheduler lineal con 900 pasos de warmup y 3 épocas. No se especifica el número de tokens de entrenamiento ni la composición del dataset. Tampoco se indica si se usaron técnicas como RLHF o DPO; el proceso parece ser un fine-tuning supervisado estándar.

## Capacidades

- Reconocimiento de texto en imágenes (OCR), tanto impreso como manuscrito, dado que es la función principal de TrOCR.
- Generación de texto a partir de imágenes, es decir, transcripción de caracteres.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, ni capacidades multimodales más allá de imagen a texto.
- No se han declarado idiomas específicos; el modelo base podría estar entrenado en un idioma concreto, pero no se indica.
- No se menciona ningún modo de pensamiento (thinking mode) ni capacidades de audio o visión adicionales.

## Casos de uso

- Digitalización de documentos históricos: el modelo puede transcribir páginas escaneadas de archivos o libros antiguos, siempre que el texto sea legible y el idioma coincida con el de entrenamiento (desconocido).
- Extracción de texto de facturas y recibos: al ser un modelo OCR, puede integrarse en un pipeline de procesamiento de documentos para extraer campos clave (números, fechas, importes) a partir de imágenes.
- Automatización de formularios manuscritos: si el modelo ha sido entrenado con escritura a mano, podría utilizarse para digitalizar encuestas o formularios rellenados a mano.
- Accesibilidad para personas con discapacidad visual: combinado con un sistema de captura de imagen, el modelo puede convertir texto impreso en voz.
- Indexación de imágenes en motores de búsqueda: transcribir texto presente en imágenes para mejorar la búsqueda por contenido.
- Preprocesamiento para análisis de documentos: extraer el texto de imágenes antes de aplicar técnicas de NLP (análisis de sentimiento, clasificación, etc.).

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación (no se especifica el dataset):

| Metrica | Valor |
|---|---|
| Loss | 1.2304 |
| CER (Character Error Rate) | 0.0891 |
| WER (Word Error Rate) | 0.2221 |

No se han publicado resultados comparativos con otros modelos en la información disponible. La tabla de entrenamiento muestra una mejora progresiva: el WER pasa de 0.3377 en el paso 2000 a 0.2221 al final del entrenamiento.

## Requisitos de hardware

- VRAM estimada: con 299M parámetros en precisión fp32, el modelo ocupa aproximadamente 1,2 GB en memoria. En fp16 o int8, el consumo sería menor (unos 0,6 GB y 0,3 GB respectivamente). Sin embargo, al ser un modelo vision-encoder-decoder, la memoria adicional para el procesamiento de imágenes debe tenerse en cuenta.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 (por ejemplo, GTX 1650, RTX 3050). Para inferencia rápida, se recomienda una RTX 3060 o superior.
- Cabe en GPUs de consumo: sí, en la mayoría de las GPUs modernas con 6 GB o más.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o mediante la librería `transformers` directamente. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se ha confirmado dicha conversión.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un TrOCR de tamaño similar suele procesar una imagen en decenas de milisegundos en una GPU moderna, pero depende del hardware y del tamaño de la imagen.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos. El modelo es un fine-tune de un modelo base no publicado (`cyttic/exp2-frozen-benyehuda-cont`), por lo que no se conocen sus características exactas frente a alternativas como `microsoft/trocr-base-printed` o `microsoft/trocr-base-handwritten`. Se puede indicar que estos últimos tienen una arquitectura similar (TrOCR) y tamaños comparables (alrededor de 334M parámetros), pero no se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No se han documentado los idiomas soportados ni el dominio de entrenamiento; el modelo podría tener un rendimiento deficiente en textos fuera de ese dominio.
- La model card es extremadamente escasa: no hay descripción del modelo, ni de los datos de entrenamiento, ni de las limitaciones conocidas.
- El WER de 0.2221 indica que aproximadamente 1 de cada 5 palabras se transcribe incorrectamente, lo que puede ser inaceptable para aplicaciones críticas sin un postprocesamiento adicional.
- No se ha evaluado el modelo en cuanto a sesgos o alucinaciones; al ser un modelo OCR, el riesgo de alucinación es bajo pero no nulo (puede generar caracteres que no están en la imagen).
- El tamaño del repositorio (3,6 GB) sugiere que los pesos están en precisión completa; para despliegue en producción sería recomendable cuantizar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/trocr-bigram4-BY-50k
- Documentación de TrOCR en Transformers: https://huggingface.co/docs/transformers/model_doc/trocr
- Repositorio oficial de TrOCR (Microsoft): https://github.com/microsoft/unilm/tree/master/trocr
