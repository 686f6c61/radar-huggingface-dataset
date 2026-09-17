# failed09/bashkir-fasttext

## Resumen

Bashkir FastText Word Embeddings (300d, Mini Beta) es un modelo de embeddings de palabras estáticos para el idioma bashkir (`ba`), publicado por el usuario failed09 en Hugging Face bajo licencia Apache-2.0. No es un modelo generativo ni un transformer: se trata de un modelo FastText con arquitectura skip-gram y subwords de caracteres, entrenado sobre un corpus monolingüe en bashkir. Su objetivo es servir como base léxica compacta para búsqueda semántica, herramientas lexicográficas y experimentos de PLN ligero.

La relevancia del modelo reside en su tamaño: el artefacto principal (`bashkir_fasttext_300d_mini.bin`) ocupa 17,01 MB gracias a una compresión mediante Product Quantization con codebooks en FP16, lo que permite ejecutarlo íntegramente en CPU, en móvil o en dispositivos edge sin GPU. Mantiene soporte de subwords, de modo que puede sintetizar vectores para formas y sufijos no vistos durante el entrenamiento, algo crítico en una lengua aglutinante como el bashkir.

El release se etiqueta explícitamente como beta de diagnóstico, no como benchmark lingüístico estandarizado. Está pensado como pieza de una iniciativa abierta de conservación y uso práctico del bashkir, junto a otros recursos del mismo autor como un clasificador de idioma multiclase (bashkir/tártaro/ruso) y un índice de frecuencias léxicas. No debe confundirse con un LLM: no genera texto ni mantiene conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastText skip-gram con subwords de caracteres (no es un transformer) |
| Parametros totales | No disponible como recuento de parametros. Dimension de embedding: 300; vocabulario activo: top 50.000 palabras y top 100.000 n-gramas de subpalabras; tamano del modelo: 17,01 MB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible. Es un modelo de embeddings estaticos por palabra; no procesa secuencias ni tiene ventana de contexto |
| Tipos de cuantizacion | Product Quantization (PQ) con codebooks en FP16. Solo se distribuye la variante cuantizada `bashkir_fasttext_300d_mini.bin`; la model card indica que el modelo completo y la exportacion de vectores de texto no se incluyen en este release |
| Idiomas soportados | Bashkir (`ba`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.bin` de `compress-fasttext`, compatible con Gensim (`CompressedFastTextKeyedVectors`). Se acompanan `config.json`, `META.json` y `SHA256SUMS` |
| N-gramas de caracteres | 3 a 6 |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es FastText con skip-gram y subwords de caracteres, con una dimension de embedding de 300. El pipeline descrito en la model card es: texto monolingue en bashkir, tokenizacion Unicode NFC (preservando las letras especificas del bashkir), entrenamiento skip-gram de 300 dimensiones con n-gramas de caracteres de 3 a 6, poda del vocabulario a las 50.000 palabras y 100.000 subwords mas frecuentes, compresion mediante Product Quantization con codebooks FP16, y empaquetado final en el fichero `.bin` compacto.

El entrenamiento se realizo sobre un corpus monolingue en bashkir. La model card indica que el tamano del corpus, la referencia de la fuente y los parametros de entrenamiento estan registrados en `config.json`, pero esos valores no se han facilitado en la informacion disponible, por lo que no se pueden citar aqui. No se menciona ninguna fase de RLHF, DPO ni ajuste por preferencias humanas, lo cual es coherente con el tipo de modelo (embeddings estaticos, no generativos).

La innovacion tecnica destacable es la combinacion de subwords con compresion PQ en FP16, que reduce el artefacto a 17,01 MB reteniendo informacion subword. Esto permite generalizar a formas flexionadas no vistas: la model card cita como ejemplo la cadena `мәктәп` → `мәктәптәр` → `мәктәптәребеҙҙә`, y afirma que las variantes completa y compacta produjeron resultados casi identicos en pruebas de estres independientes (sin publicar cifras).

## Capacidades

- Representacion de palabras en vectores densos de 300 dimensiones, listos para alimentar clasificadores, indexadores y herramientas lexicas.
- Manejo de morfologia aglutinante: relaciona raices con formas flexionadas mediante subwords.
- Soporte de vocabulario fuera de vocabulario (OOV): sintetiza vectores para formas y sufijos no vistos en entrenamiento.
- Calculo de similitud coseno entre palabras (`model.similarity`) y recuperacion de vecinos semanticos (`model.most_similar`), con resultados citados en la model card para `матур`, `атай`, `тел` y `ҡояш`.
- Extraccion de caracteristicas para pipelines descendentes (clasificacion de texto, NER, clustering), con `pipeline_tag: feature-extraction`.
- Inferencia en CPU sin GPU, apta para movil y edge.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni capacidades de agente o razonamiento multi-paso. Es un modelo de embeddings, no un LLM.
- Soporte multilingue: unicamente bashkir (`ba`).

## Casos de uso

- Busqueda semantica en bashkir: indexar documentos con los vectores de 300 dimensiones y recuperar pasajes por similitud coseno en lugar de coincidencia exacta de cadenas, aprovechando que el modelo cubre formas flexionadas no vistas.
- Corrector ortografico y sugerencia de formas: dado un token mal escrito, generar candidatos por vecindad en el espacio de embeddings; la model card recomienda combinarlo con el indice de frecuencias del autor para filtrar y ordenar candidatos por frecuencia real de uso.
- Herramientas lexicograficas y diccionarios: agrupar variantes morfologicas de una misma raiz (por ejemplo, la familia de `мәктәп`) para construir entradas de diccionario o tesauros, validando antes los vecinos devueltos.
- Clasificacion de texto en bashkir: usar los embeddings como capa de entrada de un clasificador (por ejemplo, de tematica o de sentimiento) cuando no se dispone de un modelo preentrenado especifico para el idioma.
- Preprocesado de pipelines multilingues: servir de etapa de representacion despues de un filtro de idioma, como el modelo `failed09/bashkir-lid-multiclass` del mismo autor, que separa bashkir, tartaro y ruso antes de procesar.
- Procesamiento en dispositivos sin GPU: aplicaciones moviles o embebidas de analisis lexico en bashkir donde el presupuesto de memoria es minimo, dado que el artefacto ocupa 17,01 MB y la inferencia es en CPU.
- Expansión de consultas en recuperacion de informacion: anadir a una consulta los vecinos semanticos mas cercanos para aumentar el recall en buscadores de corpus en bashkir.
- Agrupamiento y exploracion de corpus: clusterizar documentos o vocabulario por similitud para tareas de analisis linguistico exploratorio sobre colecciones en bashkir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe pruebas de estres independientes que mostraron un comportamiento solido en morfologia y en OOV, y resultados casi identicos entre la variante completa y la compacta, pero no proporciona cifras concretas ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM: no aplica. El modelo esta disenado para ejecutarse en CPU y no requiere GPU.
- GPU recomendadas: ninguna. No es necesario GPU para inferencia.
- Compatibilidad con GPU de consumo: irrelevante, ya que no usa aceleracion por GPU. Cabe en cualquier dispositivo con unos pocos cientos de megabytes de RAM libre.
- Huella en disco: 17,01 MB para el artefacto `bashkir_fasttext_300d_mini.bin`.
- Opciones de despliegue: `compress-fasttext` (clase `CompressedFastTextKeyedVectors`), Gensim y la libreria FastText. La descarga se realiza con `huggingface_hub`.
- Latencia y throughput: no disponibles. No se publican mediciones; al ser un modelo de lookup sobre CPU, la latencia esperada es de orden sub-milisegundo por palabra, pero este dato no esta confirmado por el autor.
- No se mencionan integraciones con servidores de inferencia como vLLM, TGI u Ollama, que no aplican a este tipo de modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| failed09/bashkir-fasttext | FastText skip-gram con subwords, comprimido con PQ FP16 | 300, 17,01 MB | No aplica | Apache-2.0 | Hugging Face |
| facebook/fasttext-ba-vectors | Vectores FastText para bashkir (referenciado en la model card como baseline de proposito general) | No disponible en la informacion proporcionada | No aplica | No disponible en la informacion proporcionada | Hugging Face |

La model card cita `facebook/fasttext-ba-vectors` como referencia generalista util, pero no ofrece una comparacion cuantitativa entre ambos. Otros recursos del mismo autor (`failed09/bashkir-lid-multiclass` y el dataset `failed09/bashkir-frequency-index`) son complementarios, no alternativas al modelo de embeddings.

## Limitaciones y advertencias

- Release beta de diagnostico: el propio autor lo etiqueta como tal y no como benchmark linguistico estandarizado.
- Corpus de origen web: puede contener vocabulario prestado, nombres extranjeros, terminos tecnicos, errores de OCR y tokens concatenados.
- Vecinos mas cercanos ruidosos: las consultas directas pueden devolver titulares concatenados o compuestos con guiones provenientes del texto fuente; hay que validarlos antes de usarlos en un diccionario, un corrector o un pipeline de produccion.
- Las puntuaciones de similitud son metricas de embeddings, no juicios humanos.
- Cobertura limitada a un unico idioma (bashkir); no hay soporte multilingue.
- No procesa secuencias ni contexto: cada palabra se representa de forma aislada, por lo que no captura desambiguacion dependiente del contexto oracional.
- Licencia Apache-2.0 para el modelo y el codigo, pero el autor no reclama la propiedad de los textos fuente ni redistribuye el corpus; los derechos y condiciones de licencia de las fuentes originales siguen aplicandose y deben respetarse.
- El recuento de descargas y likes es cero, y no se han publicado evaluaciones de terceros: la validacion externa es practicamente inexistente.
- Uso en produccion: conviene anclar una revision concreta (`revision`) del repositorio en lugar de `main`, tal como recomienda la propia model card, para garantizar despliegues reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/failed09/bashkir-fasttext
- Baseline citado por el autor: https://huggingface.co/facebook/fasttext-ba-vectors
- Clasificador de idioma relacionado: https://huggingface.co/failed09/bashkir-lid-multiclass
- Indice de frecuencias relacionado: https://huggingface.co/datasets/failed09/bashkir-frequency-index
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la busqueda web realizada no devolvio ningun resultado relevante para este modelo (los resultados obtenidos corresponden a un sitio de una liga de motociclismo y no guardan relacion con el contenido de esta ficha).
