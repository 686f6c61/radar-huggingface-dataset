# FootnotesExtractor/footnotes-extractor-models

## Resumen

FootnotesExtractor models es un conjunto de pesos publicados por el proyecto FootnotesExtractor, un sistema interactivo de codigo abierto orientado a la extraccion y el analisis de referencias bibliograficas en las notas al pie de libros y articulos academicos. No se trata de un unico modelo generativo, sino de una cadena de cuatro modelos especializados que se ejecutan secuencialmente sobre la imagen y el texto de una pagina: un detector de objetos YOLO11-n para localizar las zonas de notas al pie, un modelo XLM-R large para identificar las referencias dentro de cada nota, un HerBERT large para etiquetar los componentes de cada referencia (autor, titulo, ano, "ibidem", etc.) y un HerBERT base para separar nombres y apellidos.

El sistema esta desarrollado por Michal Ulaniuk (National Information Processing Institute, Polonia), Emanuel Kulczycki (Humboldt-Universitat zu Berlin y DZHW) y Przemyslaw Korytkowski (West Pomeranian University of Technology in Szczecin), con financiacion del programa "Science for Society II" del Ministerio de Educacion y Ciencia polaco y uso de la infraestructura PLGrid y ACC Cygronet AGH. Resuelve un problema concreto y poco cubierto por los modelos generativos generales: la extraccion estructurada de citas bibliograficas a partir de notas al pie en libros academicos, un formato habitual en humanidades y ciencias sociales que los parsers de citas convencionales no manejan bien.

La relevancia actual del proyecto reside en su enfoque hibrido (deteccion visual + NER sobre texto) y en su caracter interactivo: el visor de la aplicacion permite a un revisor humano comprobar y corregir la salida, lo que lo hace util para proyectos de bibliometria y humanidades digitales donde la precision es critica. El repositorio ocupa 4,2 GB e incluye pesos en formato safetensors y checkpoints de YOLO, bajo licencia AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de 4 modelos: YOLO11-n (deteccion), XLM-R large (NER de referencias), HerBERT large (NER de componentes), HerBERT base (NER de nombres) |
| Parametros totales | No disponible (XLM-R large: ~560 M; HerBERT large: ~335 M; HerBERT base: ~110 M; YOLO11-n: ~2,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los modelos NER son de tipo token-classification, con limite tipico de 512 tokens por fragmento) |
| Tipos de cuantizacion | No disponible (pesos distribuidos sin cuantizar; el checkpoint de YOLO en `.pt`) |
| Idiomas soportados | No disponible de forma explicita; los modelos base cubren multilingue (XLM-R) y polaco/ingles (HerBERT) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (modelos NER de Hugging Face) y `.pt` (YOLO11-n) |

## Arquitectura y entrenamiento

El sistema no es un transformer unico, sino una cascada de cuatro etapas. La primera es un detector YOLO11-n a 640 px que localiza las regiones de nota al pie en la pagina, con una unica clase `footnote`. La segunda etapa aplica un XLM-R large afinado para token classification que marca los fragmentos correspondientes a referencias bibliograficas dentro de cada nota (etiqueta `Reference`). La tercera etapa usa un HerBERT large afinado con 17 etiquetas en esquema BIO para descomponer cada referencia en sus componentes (`Author`, `BookTitle`, `PublicationYear`, `Ibidem`, entre otras). La cuarta etapa emplea un HerBERT base para separar nombres y apellidos (`FirstName`, `LastName`). Cada carpeta incluye el tokenizer y un `label_map.json` con las etiquetas.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en modelos de token classification). Si se indica que los modelos se entrenaron sobre notas al pie de libros academicos de acceso abierto, lo que condiciona tanto el dominio como las limitaciones. El texto de la pagina, la division de zonas en notas individuales y la resolucion de "ibid." y "op. cit." las realiza la propia aplicacion, no los modelos. Las paginas escaneadas se leen con Surya OCR, cuyos pesos no forman parte de este repositorio.

## Capacidades

- Deteccion visual de regiones de nota al pie en imagenes de pagina (YOLO11-n, clase unica `footnote`).
- Identificacion de referencias bibliograficas dentro del texto de una nota al pie (XLM-R large, etiqueta `Reference`).
- Etiquetado de componentes de una referencia con 17 etiquetas: autor, titulo de libro, ano de publicacion, "ibidem", entre otras (HerBERT large).
- Segmentacion de nombres en nombre de pila y apellido (HerBERT base).
- Salida en esquema BIO para las tres etapas NER.
- Integracion en un flujo interactivo con visor de revision humana para corregir la salida.
- Procesamiento de paginas escaneadas mediante Surya OCR (fuera del repositorio).
- No incluye generacion de texto, razonamiento general, codigo, matematicas ni tool calling: es un pipeline especializado de extraccion de informacion.

## Casos de uso

- Bibliometria y analisis de citas en humanidades: el pipeline extrae referencias de notas al pie en libros de acceso abierto, un formato que los parsers de citas basados en listas bibliograficas finales no cubren bien; la salida estructurada permite construir grafos de citas.
- Digitalizacion de fondos bibliotecarios: sobre imagenes de pagina escaneadas, YOLO11-n localiza las notas al pie y Surya OCR lee el texto, permitiendo procesar lotes de libros sin transcripcion manual.
- Revision asistida por humanos en proyectos editoriales: el visor interactivo permite que un revisor confirme o corrija las etiquetas de componentes, lo que encaja en flujos donde la precision prima sobre la automatizacion total.
- Extraccion de metadatos para repositorios academicos: la descomposicion en autor, titulo y ano facilita poblar registros bibliograficos a partir de notas al pie de obras que citan ediciones antiguas o fuentes primarias.
- Investigacion en humanidades digitales: el etiquetado de "ibidem" y "op. cit." permite estudiar patrones de citacion y practicas de referencia en corpus historicos.
- Normalizacion de nombres de autor: la etapa HerBERT base separa nombre y apellido, util para desambiguar autores en indices de citas.
- Preprocesamiento para pipelines de NLP academico: la salida BIO puede alimentar sistemas posteriores de resolucion de entidades o de vinculacion a bases de datos bibliograficas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Por el tamano de los componentes (XLM-R large ~560 M, HerBERT large ~335 M, HerBERT base ~110 M, YOLO11-n ~2,6 M), la inferencia en FP32 requiere del orden de 4-6 GB de VRAM sumando las etapas; en FP16 aproximadamente la mitad. Son estimaciones a partir del numero de parametros, no cifras publicadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia poder ejecutar el pipeline completo; una RTX 3060/4060 o superior es suficiente. Para procesar lotes grandes de paginas conviene una A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM.
- Opciones de despliegue: los modelos NER son estandar de Hugging Face `transformers` (token classification), por lo que pueden servirse con TGI o con `transformers` + FastAPI; el detector YOLO11-n se ejecuta con Ultralytics. El proyecto esta pensado para lanzarse a traves de su propia aplicacion (`setup_models.py` descarga los pesos en `models/`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FootnotesExtractor models | Pipeline de deteccion + NER para notas al pie | No disponible (ver tabla) | No disponible | AGPL-3.0 | Hugging Face + GitHub |
| GROBID | Extraccion de referencias y estructura de PDFs cientificos | No disponible | No disponible | Apache 2.0 | GitHub, ampliamente usado |
| XLM-R large (base) | Transformer multilingue de proposito general | ~560 M | 512 tokens | MIT | Hugging Face |
| HerBERT large (base) | Transformer para polaco | ~335 M | 512 tokens | CC BY 4.0 | Hugging Face |

La comparacion con GROBID es la mas pertinente por tarea: GROBID trabaja sobre PDFs y listas de referencias, mientras que FootnotesExtractor se centra en notas al pie y en imagenes de pagina. No se dispone de datos de rendimiento comparativo entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenados sobre notas al pie de libros academicos de acceso abierto: la escritura manual, las notas marginales y los escaneos muy degradados pueden dar resultados pobres.
- Los modelos cometen errores; el visor interactivo existe precisamente para que un revisor compruebe y corrija la salida. No deben usarse en modo totalmente automatico sin validacion en contextos criticos.
- La licencia AGPL-3.0 impone obligaciones de copyleft sobre el software que los integre y se distribuya.
- Uso comercial restringido: algunos libros del entrenamiento tienen licencias no comerciales (-NC), por lo que el uso comercial requeriria reentrenar sin esas obras, segun la propia model card.
- No se documentan los idiomas soportados de forma explicita; los modelos base cubren multilingue (XLM-R) y polaco/ingles (HerBERT), pero el rendimiento en otras lenguas no esta garantizado.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso; su uso esta acotado a la extraccion de informacion.
- El OCR de paginas escaneadas depende de Surya, cuyos pesos no forman parte del repositorio y deben obtenerse por separado.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si hay riesgo de falsos positivos y negativos en la deteccion y el etiquetado.

## Enlaces

- Hugging Face: https://huggingface.co/FootnotesExtractor/footnotes-extractor-models
- Repositorio GitHub: https://github.com/FootnotesExtractor/FootnotesExtractor
- Pagina del proyecto: https://footnotesextractor.github.io/FootnotesExtractor/
- Modelo base XLM-R large: https://huggingface.co/FacebookAI/xlm-roberta-large
- Modelo base HerBERT large: https://huggingface.co/allegro/herbert-large-cased
- Modelo base HerBERT base: https://huggingface.co/allegro/herbert-base-cased
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
