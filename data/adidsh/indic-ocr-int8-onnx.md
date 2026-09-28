# adidsh/indic-ocr-int8-onnx

## Resumen

Indic-OCR INT8 ONNX es una derivada cuantizada del modelo bodhan-ai/indic-ocr, publicada por el usuario adidsh, que empaqueta el pipeline completo de analisis documental en formatos ONNX INT8 y GGUF. El objetivo es ejecutar OCR multilingue y parsing de documentos en CPU de consumo, dispositivos edge y hardware sin GPU de servidor, manteniendo la privacidad porque todo el proceso ocurre en local. El repositorio ocupa 0,4 GB y esta pensado como sustituto directo del modelo original en FP32.

El sistema no es un modelo unico, sino una pipeline cooperativa de dos etapas. La primera, IndicDocLayout, es un detector RT-DETR de aproximadamente 33 millones de parametros que localiza bloques semanticos y establece el orden de lectura; la segunda, IndicBlockOCR, es un modelo vision-lenguaje de la familia Qwen2.5-VL / Qwen3.5 de unos 0,8 mil millones de parametros que transcribe cada bloque recortado respetando saltos de linea, tablas y conjunctos indios complejos.

Su relevancia actual esta en cubrir 23 idiomas (ingles y 22 lenguas programadas de la India) con un coste de computo muy bajo: la cuantizacion INT8 reduce el codificador de vision un 72,3 % y acelera la inferencia por bloque 4,17x en CPU, con una perdida de precision declarada inferior al 0,1 % de CER. La licencia es la Indic Open Model License v1.0 con acceso restringido (gated) y atribucion obligatoria a Bodhan AI / AI4Bharat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: RT-DETR (layout y orden de lectura) + modelo vision-lenguaje Qwen2.5-VL / Qwen3.5 (reconocimiento por bloque) |
| Parametros totales | No disponible como cifra agregada; componentes indicados: ~33 M (layout) + ~0,8 B (reconocimiento) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (ONNX), GGUF Q8_0, GGUF Q5_K_M, GGUF F16 |
| Idiomas soportados | 23: ingles (en) y 22 lenguas indias programadas (as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur) |
| Licencia | Indic Open Model License v1.0 (campo `license: other`), con acceso condicionado a solicitud y acuerdo de terminos |
| Formato de pesos | ONNX (FP32 original e INT8) y GGUF (Q8_0, Q5_K_M, F16) |
| Modelo base | bodhan-ai/indic-ocr (IITM BODHAN-AI Foundation y AI4Bharat, con apoyo del Ministerio de Educacion de India) |
| Pipeline declarado | image-to-text |
| Tamano del repositorio | 0,4 GB |
| Fecha de publicacion | 27 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La pipeline se organiza en dos etapas que se comunican de forma secuencial. La primera, IndicDocLayout, se basa en RT-DETR (aproximadamente 33 millones de parametros, arquitectura de deteccion con licencia Apache 2.0 segun la model card) y clasifica las regiones del documento en diez categorias: `text`, `title`, `list`, `table`, `figure`, `header`, `footer`, `caption`, `formula` y `stamp`. Ademas de detectar los cuadros delimitadores, calcula el orden de lectura natural, con reconocimiento de columnas y sentido descendente. La segunda etapa, IndicBlockOCR, usa una arquitectura vision-lenguaje Qwen2.5-VL / Qwen3.5 de unos 0,8 mil millones de parametros: recorta cada bloque detectado y lo transcribe preservando los saltos de linea internos, el formato tabular y las formas conjunctas complejas de las escrituras indicas.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO para el modelo upstream; la model card de esta derivada se centra en el proceso de cuantizacion. La innovacion tecnica principal es la cuantizacion: el codificador de vision INT8 pasa de 336,0 MB en FP32 a 93,2 MB, y el layout pasa de 127,5 MB a 107,3 MB en ONNX INT8 o 57,1 MB en GGUF Q8_0. La salida puede serializarse como JSON, Markdown o texto plano. La model card cita verificacion sobre segmentos de un informativo en odia, con reproduccion exacta de caracteres.

## Capacidades

- Reconocimiento optico de caracteres (OCR) en documentos escaneados, fotografias y PDF, con salida en JSON, Markdown o texto plano.
- Analisis de maquetacion con diez clases de region documental (texto, titulo, lista, tabla, figura, encabezado, pie, pie de figura, formula y sello).
- Determinacion del orden de lectura con deteccion de columnas y jerarquia de bloques.
- Transcripcion por bloques que conserva saltos de linea internos y el formato de tablas.
- Soporte de escrituras indicas con conjunctos complejos (por ejemplo ଯୁକ୍ତାକ୍ଷର en odia o संयुक्ताक्षर en devanagari).
- Cobertura multilingue de 23 idiomas: ingles y 22 lenguas programadas de la India.
- Extraccion de formulas y de sellos como regiones diferenciadas dentro del documento.
- Ejecucion totalmente offline en CPU, sin llamadas a servicios externos.
- No se documenta en la informacion disponible soporte de tool calling, function calling ni comportamiento agentico; el pipeline es de vision a texto, no un asistente conversacional.

## Casos de uso

- Digitalizacion masiva de archivos administrativos indios: la etapa de layout identifica encabezados, pies, sellos y tablas, y la etapa OCR transcribe cada bloque en su idioma, lo que permite convertir expedientes en papel a JSON estructurado sin sacar los documentos de la organizacion.
- Extraccion de datos de facturas y formularios: las clases `table`, `formula` y `stamp` permiten aislar importes, referencias y sellos oficiales, y devolver un JSON que alimente un ERP o un sistema contable.
- Procesamiento de prensa multilingue: el orden de lectura con deteccion de columnas es adecuado para recortes de periodico, donde el texto fluye en varias columnas y con titulos intercalados.
- Atencion al ciudadano en ventanilla: un dispositivo edge con CPU puede escanear un documento y transcribirlo en el acto, sin conexion, un requisito habitual en zonas con conectividad limitada o con restricciones de tratamiento de datos personales.
- Digitalizacion de libros y material educativo: la conservacion de saltos de linea y la salida en Markdown facilitan la reutilizacion del contenido en plataformas de aprendizaje o en corpus para entrenamiento posterior.
- Verificacion documental en banca y seguros: la transcripcion local de identificadores y tablas permite validar documentos de identidad o polizas sin enviar imagenes a la nube, reduciendo la exposicion de datos sensibles.
- Indexacion y busqueda sobre archivos historicos: al generar texto plano buscable por cada pagina, se puede construir un indice completo de fondos documentales en varias lenguas indias.
- Preprocesado de pipelines de RAG: la salida Markdown estructurada sirve como entrada limpia para sistemas de recuperacion aumentada, preservando la jerarquia de titulos y secciones.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K u otros). Los datos disponibles son mediciones de cuantizacion, tamano y latencia sobre nucleos de CPU Intel/AMD x86_64 (socket unico, AVX2 activado).

Tamano de almacenamiento:

| Componente | Variante | Tamano (MB) | Formato | Compresion |
|---|---|---|---|---|
| IndicDocLayout | FP32 upstream | 127,5 | ONNX | linea base (1,0x) |
| IndicDocLayout | INT8 | 107,3 | ONNX | 15,8 % |
| IndicDocLayout | Q8_0 | 57,1 | GGUF | 55,2 % |
| IndicDocLayout | F16 | 63,9 | GGUF | 49,9 % |
| IndicBlockOCR (vision) | FP32 upstream | 336,0 | ONNX | linea base (1,0x) |
| IndicBlockOCR (vision) | INT8 | 93,2 | ONNX | 72,3 % |
| IndicBlockOCR (completo) | Q8_0 | 792,5 | GGUF | 54,3 % |
| IndicBlockOCR (completo) | Q5_K_M | 566,2 | GGUF | 67,4 % |

Latencia en CPU:

| Etapa / modulo | Latencia FP32 | Latencia cuantizada | Aceleracion | Delta de precision |
|---|---|---|---|---|
| IndicDocLayout (pagina completa) | 980 ms | 856 ms | 1,14x | 0,0 % de perdida de mAP |
| Codificador de vision por recorte | 242 ms | 57,9 ms | 4,17x | menos de 0,1 % de delta de CER |
| OCR de parrafo de extremo a extremo | 1,82 s | 0,91 s | 2,00x | 100 % de coincidencia exacta |

La verificacion de exactitud se realizo sobre segmentos de un informativo en odia, con reproduccion exacta del texto segun la model card.

## Requisitos de hardware

- Huella de los artefactos: IndicDocLayout en 57,1 MB (GGUF Q8_0) o 107,3 MB (ONNX INT8); IndicBlockOCR en 93,2 MB (vision ONNX INT8), 566,2 MB (GGUF Q5_K_M) o 792,5 MB (GGUF Q8_0).
- VRAM estimada (calculo propio a partir de los tamanos publicados, no verificado por el autor): el pipeline completo en Q5_K_M ocupa menos de 700 MB de pesos, por lo que una reserva de 1,5 a 2 GB de VRAM deberia ser suficiente para pesos, activaciones y buffers de vision en resoluciones de recorte habituales. Para la variante Q8_0, entre 2 y 3 GB. Confirma estos valores con una prueba propia antes de dimensionar produccion.
- GPU: cabe en cualquier GPU de consumo con 4 GB o mas de VRAM, incluidas NVIDIA GTX 1650, RTX 3060, RTX 4090 o equivalentes. No requiere A100 ni H100; el diseno apunta precisamente a evitar ese hardware.
- CPU: es el escenario verificado por el autor. Funciona en x86_64 con AVX2; con las latencias declaradas (0,91 s por parrafo de extremo a extremo) es viable en portatiles y mini-PC, aunque no se especifica el modelo de CPU concreto.
- Despliegue: ONNX Runtime para los artefactos INT8; llama.cpp u Ollama para los GGUF. La model card no indica si los GGUF incluyen el proyector multimodal (mmproj) que suelen necesitar los modelos de vision en llama.cpp, por lo que ese punto debe comprobarse antes de integrarlos.
- Latencia y throughput: los unicos datos publicados son los de la tabla anterior. No hay cifras de tokens por segundo ni de paginas por minuto.
- Edge: el modelo se posiciona explicitamente para dispositivos edge y ejecucion offline, sin GPU de servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adidsh/indic-ocr-int8-onnx (esta ficha) | ~33 M + ~0,8 B en dos etapas | No disponible | ONNX INT8, GGUF (Q8_0, Q5_K_M, F16) | Indic Open Model License v1.0, con gating | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| bodhan-ai/indic-ocr (upstream) | ~33 M + ~0,8 B en dos etapas | No disponible | Pesos originales en FP32 | Indic Open Model License v1.0, con gating | HuggingFace |
| Otras alternativas de OCR multilingue (PaddleOCR, Surya, GOT-OCR y similares) | No disponibles en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de resultados de benchmarks comparativos entre esta derivada y otros sistemas de OCR en la informacion proporcionada; las unicas cifras comparativas son las de cuantizacion frente al modelo upstream en FP32.

## Limitaciones y advertencias

- Es una derivada de cuantizacion, no un modelo nuevo: hereda las limitaciones del upstream bodhan-ai/indic-ocr y no hay informacion sobre que version concreta del modelo base se cuantizo.
- Riesgo de alucinacion del componente vision-lenguaje: los VLM de transcripcion pueden inventar caracteres en recortes de baja calidad, borrosos o con ruido, especialmente en documentos degradados.
- Las mediciones de exactitud declaradas (100 % de coincidencia exacta, menos de 0,1 % de CER) provienen de segmentos de un informativo en odia; no son extrapolables a todas las lenguas, tipografias ni dominios del conjunto de 23 idiomas.
- La unica plataforma verificada es x86_64 con AVX2 en CPU. No se publican datos para ARM, GPU, NPU ni aceleradores moviles, pese a la orientacion edge del proyecto.
- Cobertura linguistica limitada a ingles y 22 lenguas programadas de la India; no se declara soporte de castellano ni de otras lenguas europeas.
- Licencia restrictiva: Indic Open Model License v1.0 con acceso condicionado a solicitud y aceptacion previa de terminos, y atribucion obligatoria a Bodhan AI / AI4Bharat. Verifica las condiciones antes de cualquier uso comercial o de redistribucion, ya que el campo `license` de HuggingFace figura como `other`.
- No se publica la longitud de contexto soportada ni el numero de tokens de imagen, lo que dificulta planificar el procesamiento de documentos muy densos o de paginas de gran resolucion.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que implica una validacion practica por parte de la comunidad practicamente nula.
- El autor de la derivada es un contribuidor comunitario no vinculado a la organizacion original, de modo que no hay garantia de mantenimiento ni de actualizaciones frente a nuevas versiones del upstream.
- Los resultados de busqueda web recuperados durante la elaboracion de esta ficha no contienen informacion tecnica relevante sobre el modelo; no se han usado como fuente.

## Enlaces

- [adidsh/indic-ocr-int8-onnx en HuggingFace](https://huggingface.co/adidsh/indic-ocr-int8-onnx)
- [Modelo base: bodhan-ai/indic-ocr](https://huggingface.co/bodhan-ai/indic-ocr)
- [Indic Open Model License v1.0 (texto completo)](https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md)
- [Indic Open Model License v1.0 (version simplificada)](https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License_Deed.md)
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relevantes sobre este modelo.
