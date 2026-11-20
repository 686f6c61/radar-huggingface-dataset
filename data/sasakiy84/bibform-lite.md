# sasakiy84/bibform-lite

## Resumen

Bibform Lite es un modelo especializado en la extraccion de metadatos bibliograficos a partir de cadenas de citas en japones e ingles. Lo desarrolla el usuario sasakiy84 y resuelve un problema muy concreto: dada una referencia bibliografica en texto libre, identificar campos como titulo, ano, publicacion, nombres de personas u organizaciones, rangos de apellido y nombre, roles (autor, editor, traductor) y el tipo de recurso. Esta orientado a la gestion automatizada de bibliografias y a la conversion de citas a formato BibLaTeX.

El modelo se distribuye en dos variantes de inferencia: una en PyTorch (6,00 MB) y otra en ONNX (5,97 MB), ademas de una version web estatica que funciona integramente en el navegador. Su tamano reducido y su naturaleza local lo hacen adecuado para entornos sin conexion o con requisitos estrictos de privacidad. La model card no detalla la arquitectura interna, el numero de parametros ni la longitud de contexto, por lo que esos datos se indican como no disponibles.

La relevancia actual del modelo reside en su enfoque de dominio especifico: en lugar de un LLM generalista, ofrece un extractor ligero y determinista para una tarea acotada, con metricas de evaluacion publicadas sobre un conjunto de desarrollo de 10.130 citas. La licencia Apache 2.0 facilita su integracion en herramientas de gestion bibliografica y pipelines academicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo especializado de extraccion; se distribuye en PyTorch y ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch y ONNX; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 (partes propias); las dependencias de terceros se rigen por NOTICE.md |
| Formato de pesos | PyTorch y ONNX (tambien paquete web estatico con motor de ejecucion incluido) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (tipo de transformer, numero de capas, dimensiones ocultas ni numero de parametros). Se sabe que el modelo realiza extraccion de campos mediante rangos de caracteres sobre el texto de entrada: la salida `fields` y `contributors` se expresa como intervalos semiabiertos `[start, end)` en unidades de puntos de codigo Unicode, lo que sugiere una tarea de etiquetado a nivel de token o caracter. Tambien produce una clasificacion de tipo de recurso con 12 categorias originales y 9 categorias de salida orientadas a BibLaTeX, con puntuaciones asociadas.

No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La evaluacion se realizo sobre el conjunto `bibformDatasetTrial v1-quality14`, con 10.130 citas de desarrollo de formatos desconocidos, generadas a partir de metadatos bibliograficos reales renderizados segun distintos formatos de cita. El modelo se distribuye con dos backends de inferencia (PyTorch y ONNX Runtime) y una implementacion web que ejecuta el modelo en el navegador tras la carga inicial.

## Capacidades

- Extraccion de campos bibliograficos: titulo, ano, publicacion y otros metadatos a partir de la cadena de cita original.
- Identificacion de personas y organizaciones mencionadas en la cita.
- Delimitacion de rangos de apellido y nombre dentro del texto.
- Deteccion de roles de contribuyente: autor, editor, traductor, entre otros.
- Clasificacion del tipo de recurso en 12 categorias originales y 9 categorias orientadas a BibLaTeX.
- Generacion de vista previa BibLaTeX y exportacion a fichero `.bib` en la version web.
- Procesamiento local y sin conexion: la version web funciona tras la carga inicial y permite analisis y descarga offline.
- Entrada en formato UTF-8 JSON Lines con campos `id` y `text`.
- Soporte bilingue japones-ingles.
- Seleccion asistida cuando la confianza es baja: si la puntuacion es inferior a 0,90, la interfaz web ofrece las tres mejores candidatas y la lista completa de tipos.

## Casos de uso

- Gestion de bibliografias academicas: el modelo convierte citas en texto libre a campos estructurados y a BibLaTeX, lo que permite importar referencias de articulos o libros a gestores como Zotero o JabRef sin transcripcion manual.
- Conversion masiva de listados de referencias: procesando un fichero JSONL con miles de citas, un pipeline puede generar entradas `.bib` de forma automatizada, aprovechando la salida estructurada con rangos de caracteres para resaltar los campos extraidos.
- Herramienta web sin conexion para investigadores: la version estatica permite analizar citas y descargar el `.bib` en el navegador, util en entornos con restricciones de red o de privacidad de datos.
- Normalizacion de metadatos en repositorios institucionales: el modelo puede clasificar el tipo de recurso (articulo, libro, capitulo, etc.) y detectar roles de editor o traductor, facilitando la catalogacion.
- Preprocesamiento para pipelines de revision sistematica: la extraccion de autores, anos y publicaciones permite filtrar y agrupar referencias antes de un analisis posterior.
- Asistencia a la citacion en japones: al soportar citas en japones, cubre un nicho poco atendido por herramientas generalistas, extrayendo rangos de apellido y nombre en ese idioma.
- Integracion en editores o gestores documentales: la variante ONNX y el motor web permiten incorporar la extraccion directamente en aplicaciones de escritorio o web ligeras.

## Benchmarks y rendimiento

Evaluacion sobre `bibformDatasetTrial v1-quality14`, 10.130 citas de desarrollo de formatos desconocidos. La extraccion completa exige coincidencia exacta de campos, personas u organizaciones, rangos de nombre y apellido, y roles. El tipo se puntua con las 9 categorias BibLaTeX.

| Ejecucion | Extraccion exacta | Precision de tipo | Extraccion y tipo exactos |
|---|---:|---:|---:|
| PyTorch | 86,07 % (8.719) | 91,17 % (9.236) | 79,40 % (8.043) |
| ONNX Runtime CPU | 86,16 % (8.728) | 91,15 % (9.234) | 79,47 % (8.050) |

En una comparacion en Chromium sobre 128 casos de desarrollo, la salida de la version web coincidio en los 128 casos con la version PyTorch en campos bibliograficos, nombres y roles.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo completo en PyTorch ocupa 6,00 MB y en ONNX 5,97 MB, por lo que la huella de memoria es minima.
- GPU recomendadas: no se especifican; la inferencia documentada se ejecuta en CPU (`--device cpu`) y en ONNX Runtime CPU.
- Cabe en cualquier GPU de consumo y en CPU; no requiere acelerador dedicado.
- Opciones de despliegue: script `pytorch/predict.py`, ONNX Runtime, y servidor estatico (`python -m http.server`) para la version web.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Entorno Python documentado: Python 3.14 con `pytorch/requirements.txt`.
- Tamano de la distribucion web: 9,68 MB con motor y pantalla; ZIP de 9,26 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bibform Lite (sasakiy84) | no disponible | no disponible | Extraccion de metadatos bibliograficos | ja, en | Apache 2.0 | Hugging Face, PyTorch/ONNX/web |
| Bibform (sasakiy84) | no disponible | no disponible | Extraccion de metadatos bibliograficos (variante alternativa) | ja, en | Apache 2.0 (segun repo) | Hugging Face |
| LLM generalistas (p. ej. modelos de 7B) | orden de miles de millones | decenas de miles de tokens | Generacion y extraccion generica | multilingue | variable | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no se incluyen cifras de benchmarks cruzados.

## Limitaciones y advertencias

- Las metricas publicadas corresponden al conjunto de desarrollo `bibformDatasetTrial v1-quality14`; no se documenta su comportamiento en datos de produccion reales.
- En citas cortas o con publicacion ambigua, el modelo puede confundir el rango del titulo o el tipo de recurso, segun advierte la propia model card.
- La clasificacion de tipo de recurso puede requerir seleccion manual cuando la puntuacion es inferior a 0,90; la salida `selected` puede ser `null`.
- Solo se documentan japones e ingles; no se garantiza soporte para otras lenguas.
- No se detallan sesgos conocidos ni tasas de alucinacion; al ser una tarea de extraccion acotada, el riesgo principal es de error de delimitacion, no de generacion libre.
- La licencia Apache 2.0 cubre las partes propias; las dependencias de terceros incluidas se rigen por `NOTICE.md`, que debe revisarse antes de su redistribucion.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopcion ni de validacion externa.
- No se documenta la arquitectura ni el numero de parametros, lo que dificulta estimar el coste computacional de reentrenamiento o ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sasakiy84/bibform-lite
- Modelo alternativo Bibform: https://huggingface.co/sasakiy84/bibform
- Paquete web (ZIP): https://huggingface.co/sasakiy84/bibform-lite/blob/main/bibform-lite-web.zip
- Modelo ONNX y configuracion: https://huggingface.co/sasakiy84/bibform-lite/tree/main/onnx
- Codigo fuente de la implementacion web: https://huggingface.co/sasakiy84/bibform-lite/tree/main/web-src
- Ejemplo de entrada: https://huggingface.co/sasakiy84/bibform-lite/blob/main/examples/input.jsonl
- Detalle de evaluacion: https://huggingface.co/sasakiy84/bibform-lite/blob/main/evaluation.json
- Licencia: https://huggingface.co/sasakiy84/bibform-lite/blob/main/LICENSE
- Aviso de terceros: https://huggingface.co/sasakiy84/bibform-lite/blob/main/NOTICE.md
