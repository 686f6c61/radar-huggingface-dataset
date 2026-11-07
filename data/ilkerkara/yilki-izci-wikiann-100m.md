# ilkerkara/yilki-izci-wikiann-100m

## Resumen

yilki-izci-wikiann-100m es un modelo de reconocimiento de entidades nombradas (NER) para turco, desarrollado por el usuario ilkerkara. Se trata de un ajuste fino del modelo base ilkerkara/yilki-kulun-100m (100 millones de parámetros, preentrenado con 2.000 millones de tokens), especializado en la detección de personas (PER), organizaciones (ORG) y lugares (LOC) en texto turco. El modelo se distribuye bajo licencia Apache-2.0 y emplea la librería transformers con pesos en safetensors.

El modelo resuelve la tarea de etiquetado de secuencias (token classification) sobre el conjunto de datos WikiANN en su partición turca, con un esquema BIO de 7 clases. Su relevancia radica en que ofrece una alternativa ligera (100M de parámetros) y de código abierto para NER en turco, un idioma con menos recursos que el inglés, con un rendimiento en F1 que compite con modelos multilingües de mayor tamaño como XLM-R, mBERT o BERTurk bajo el mismo protocolo de evaluación.

La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos del repositorio de Hugging Face. No se dispone de información adicional sobre detalles internos de la arquitectura más allá de lo indicado por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base yilki-kulun-100m; detalles internos no disponibles) |
| Parámetros totales | 100.099.591 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con longitud máxima de 256 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base ilkerkara/yilki-kulun-100m, un transformer de 100 millones de parámetros preentrenado con 2.000 millones de tokens sobre el corpus FineWeb-2 (licencia ODC-BY 1.0). El ajuste fino se realizó sin congelar el modelo base, con una tasa de aprendizaje de 4e-4 para la cabeza de clasificación (4e-3 para el resto de parámetros), programación de coseno, calentamiento del 10 %, 3 épocas y longitud máxima de 256 tokens. Se entrenaron dos semillas (0 y 1), con la semilla 1 almacenada en el subdirectorio `tohum-1/`.

El entrenamiento se llevó a cabo exclusivamente con el conjunto de datos WikiANN en turco (20.000 documentos de entrenamiento, 10.000 de test), con etiquetas generadas automáticamente (calidad "silver", ruidosa). El modelo se distribuye con código personalizado (`trust_remote_code=True`), lo que implica que la carga requiere ejecutar código del repositorio. No se dispone de información sobre técnicas de alineación como RLHF o DPO, ni sobre innovaciones arquitectónicas adicionales.

## Capacidades

- Reconocimiento de entidades nombradas en turco: identifica personas (PER), organizaciones (ORG) y lugares (LOC) con etiquetas BIO (7 clases).
- Etiquetado de secuencias a nivel de token (token classification).
- Procesamiento de textos de hasta 256 tokens durante el entrenamiento.
- Soporte de código personalizado mediante `trust_remote_code=True`.
- Dos variantes de pesos (semilla 0 en el directorio raíz y semilla 1 en `tohum-1/`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo más allá del turco.

## Casos de uso

- Extracción de entidades en artículos de Wikipedia en turco: el modelo está entrenado específicamente sobre WikiANN-TR, por lo que es adecuado para procesar texto enciclopédico y extraer personas, organizaciones y lugares con un F1 cercano a 0,89.
- Anonimización de documentos: detección de nombres de personas (PER) en textos turcos para su posterior enmascaramiento en flujos de cumplimiento de protección de datos.
- Enriquecimiento de bases de conocimiento: identificación de organizaciones y lugares en corpus turcos para construir grafos de entidades y metadatos estructurados.
- Indexación semántica de noticias: extracción de entidades en titulares y cuerpos de noticias en turco para motores de búsqueda o sistemas de recomendación.
- Preprocesamiento para pipelines de NLP: etiquetado de entidades como paso previo a tareas de resolución de correferencia, relación de entidades o análisis de sentimiento a nivel de entidad.
- Despliegue ligero en entornos con recursos limitados: con 100M de parámetros, el modelo puede ejecutarse en CPU o en GPUs de consumo para tareas de NER en tiempo casi real, siempre que el texto no supere los 256 tokens por fragmento.

## Benchmarks y rendimiento

| Semilla | Test F1 |
|---|---|
| 0 (directorio raíz) | 0,8949 |
| 1 (`tohum-1/`) | 0,8916 |
| Media | 0,893 |

Referencias bajo el mismo protocolo (una sola semilla):

| Modelo | Test F1 |
|---|---|
| XLM-R | 0,903 |
| mBERT | 0,917 |
| ConvBERT | 0,909 |
| BERTurk | 0,896 |
| ModernBERT-tr | 0,897 |
| yilki-izci-wikiann-100m | 0,893 (media de dos semillas) |

El autor advierte que estas cifras se midieron con su propio protocolo y no deben compararse directamente con números publicados en otros contextos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 100M de parámetros en precisión FP32, el modelo ocupa aproximadamente 0,4 GB; en FP16, alrededor de 0,2 GB; en cuantizaciones de 8 bits o 4 bits, menos aún. Estas estimaciones son orientativas y no están confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; también puede ejecutarse en CPU para lotes pequeños.
- Cabe en GPUs de consumo: sí, en tarjetas como GTX 1060, RTX 2060, RTX 3060, RTX 4090 y similares, así como en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), potencialmente vLLM, TGI o llama.cpp si se generan los formatos adecuados, aunque no se documentan conversiones oficiales a GGUF ni a otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 (WikiANN-TR, protocolo del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yilki-izci-wikiann-100m | 100M | no disponible (entrenamiento a 256) | 0,893 (media) | Apache-2.0 | Hugging Face |
| XLM-R | no disponible | no disponible | 0,903 | no disponible | Hugging Face |
| mBERT | no disponible | no disponible | 0,917 | no disponible | Hugging Face |
| BERTurk | no disponible | no disponible | 0,896 | no disponible | Hugging Face |
| ModernBERT-tr | no disponible | no disponible | 0,897 | no disponible | Hugging Face |

Los datos de parámetros, contexto y licencia de los modelos de referencia no se detallan en la información proporcionada; solo se dispone de sus resultados F1 bajo el protocolo del autor.

## Limitaciones y advertencias

- Solo soporta turco; el rendimiento cae fuera de este idioma y en dominios distintos al de WikiANN (por ejemplo, lenguaje coloquial o textos muy cortos).
- Las métricas se midieron en un único conjunto de test; en conjuntos pequeños el intervalo de confianza es amplio.
- El modelo base se entrenó con datos web, por lo que puede arrastrar sesgos y generar información incorrecta.
- El conjunto de datos WikiANN tiene etiquetas generadas automáticamente (calidad "silver") y su licencia no está especificada en la tarjeta del dataset; debe verificarse antes de su uso.
- El modelo base contiene datos personales verosímiles (correos, teléfonos, matrículas, identificadores) y aproximadamente el 0,8 % de 492 fragmentos de datos personales seleccionados aleatoriamente se reprodujeron literalmente. Si aparecen datos personales en las salidas, no deben usarse ni difundirse.
- La licencia del modelo es Apache-2.0, pero la del dataset de entrenamiento es incierta, lo que puede afectar a su uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; debe revisarse antes de desplegarlo en producción.
- No se documentan mecanismos de cuantización ni formatos alternativos de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilkerkara/yilki-izci-wikiann-100m
- Modelo base: https://huggingface.co/ilkerkara/yilki-kulun-100m
- Dataset WikiANN: https://huggingface.co/datasets/unimelb-nlp/wikiann
