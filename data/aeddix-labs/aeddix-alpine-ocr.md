# aeddix-labs/aeddix-alpine-ocr

## Resumen

Aeddix Alpine OCR es un modelo vision-language de 1,16 mil millones de parametros especializado en conversion de imagenes de pagina a Markdown. Lo desarrolla aeddix-labs como ajuste fino supervisado del modelo opendatalab/MinerU2.5-Pro-2605-1.2B de OpenDataLab, del que conserva la arquitectura Qwen2-VL, los prompts y el pipeline de dos pasos: primero localiza los bloques de la pagina y su orden de lectura, y despues lee cada bloque. Convierte texto en orden de lectura, tablas a HTML, graficos a tablas de datos en Markdown, formulas a LaTeX y estilos en linea (negrita, cursiva, superindice, subindice).

El problema que resuelve es el parseo de documentos empresariales reales (PDF renderizados a imagen) con una ventana de contexto suficiente para paginas completas y un coste de inferencia bajo, al ser un modelo de poco mas de mil millones de parametros. Su relevancia actual viene de los resultados declarados en ParseBench, donde mejora al modelo base en +4,38 puntos globales, concentrados en graficos (+6,15) y formato semantico (+15,99), manteniendo tablas, fidelidad de contenido y grounding visual dentro de un error estandar.

Se publica como research release bajo licencia Apache-2.0, con revision `v0.1`, en formato safetensors y compatible con la libreria transformers, vLLM y mineru-vl-utils. Soporta ingles, chino y japones. El repositorio ocupa 2,3 GB y, en el momento de la consulta, acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language Qwen2-VL (`qwen2_vl`), con torre de vision y proyector vision-lenguaje; inferencia en pipeline de dos pasos |
| Parametros totales | 1.156.026.624 (aproximadamente 1,16 mil millones) |
| Parametros activos | no procede (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en), chino (zh), japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | opendatalab/MinerU2.5-Pro-2605-1.2B (commit `bff20d4`), relacion finetune |
| Tarea (pipeline) | image-text-to-text |
| Libreria | transformers |
| Revision publicada | v0.1 |
| Tamano del repositorio | 2,3 GB |
| Fecha de creacion | 2026-10-06 |
| Fecha de actualizacion | 2026-10-06 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base MinerU2.5-Pro-2605-1.2B, es decir, un transformer vision-language de tipo Qwen2-VL con torre de vision, proyector vision-lenguaje y decodificador de lenguaje. El modelo opera en dos pasos: un primer paso de analisis de pagina que detecta bloques, su tipo y su orden, y un segundo paso que lee cada bloque y produce su contenido. El repositorio incluye ademas un servidor de pagina (`inference/`) que anade tres elementos sobre la inferencia estandar: analisis de graficos anidados (el `mineru-vl-utils` 2.0.5 omite los graficos o imagenes contenidos en una figura multi-grafico, y el servidor analiza cada panel como un grafico independiente), asignacion de niveles de encabezado segun la numeracion del titulo o el tamano de fuente, y exclusion del Markdown de las descripciones de fotos naturales que el propio modelo genera.

El entrenamiento consta de tres etapas encadenadas, segun la model card: (1) partida desde `opendatalab/MinerU2.5-Pro-2605-1.2B` en el commit `bff20d4`; (2) ajuste fino supervisado con 20.000 muestras (19.600 de entrenamiento y 400 de validacion), una sola epoca, ajuste completo del modelo de lenguaje y del proyector vision-lenguaje con la torre de vision congelada y 524,8 millones de parametros entrenables. La model card consultada se interrumpe en ese punto, por lo que no se dispone de informacion sobre la tercera etapa ni sobre el uso de RLHF, DPO u otras tecnicas de alineamiento.

Los datos de entrenamiento declarados en las etiquetas del repositorio incluyen ibm-granite/ChartNet, docling-project/SynthChartNet, docling-project/SynthTabNet_OTSL, docling-project/FinTabNet_OTSL, docling-project/DocLayNet-v1.2, lightonai/LightOnOCR-mix-0126 y HuggingFaceFW/fineweb-2. No se detalla en la informacion disponible la proporcion de cada fuente ni el numero total de tokens.

## Capacidades

- Conversion de imagen de pagina a Markdown: texto en orden de lectura, tablas en HTML, graficos como tablas de datos Markdown y formulas en LaTeX.
- Preservacion de estilos en linea cuando la pagina los tiene: negrita, cursiva, superindice y subindice.
- Analisis de maquetacion en dos pasos: deteccion de bloques, tipado y orden, con cajas normalizadas al rango [0, 1].
- Analisis de graficos como datos estructurados (`image_analysis=True`); sin esta opcion los graficos vuelven vacios.
- Analisis de graficos anidados dentro de figuras multi-panel, solo a traves del servidor incluido en el repositorio.
- Inferencia de niveles de encabezado a partir de la numeracion del titulo y del tamano de fuente (solo en la ruta del servidor).
- Procesamiento de documentos empresariales reales: el benchmark declarado se midio sobre 2.078 paginas.
- Idiomas: ingles, chino y japones, tanto en el texto reconocido como en los prompts del pipeline.
- No se documenta en la informacion disponible soporte de tool calling, function calling, razonamiento multi-paso tipo agente, modo thinking, audio ni vision generalista fuera del parseo de documentos.

## Casos de uso

- Digitalizacion de facturas y documentos financieros: el modelo convierte cada pagina renderizada a Markdown con las tablas financieras en HTML y las lineas de importe en orden de lectura, apoyandose en el ajuste sobre FinTabNet_OTSL para el reconocimiento de tablas financieras.
- Extraccion de datos de informes anuales con graficos: gracias al analisis de graficos, los paneles de un informe se devuelven como tablas Markdown, lo que permite alimentar pipelines de analisis cuantitativo sin transcripcion manual.
- Ingesta de documentacion tecnica para RAG: la salida Markdown con encabezados jerarquicos y formulas en LaTeX se puede trocear por secciones y vectorizar manteniendo la estructura del documento original.
- Conversion de articulos cientificos con formulas: el modelo emite LaTeX para las expresiones matematicas, de modo que el resultado se puede volver a renderizar o procesar con herramientas de publicacion cientifica.
- Procesamiento por lotes de archivos PDF en infraestructura modesta: con 1,16 mil millones de parametros cabe en una GPU de consumo, lo que permite recorrer grandes volumenes de paginas a 150 dpi sin depender de APIs externas.
- Normalizacion de tablas para analitica: las tablas se devuelven en HTML y en OTSL a traves de mineru-vl-utils, lo que facilita su conversion posterior a CSV o DataFrame.
- Archivado y busqueda en corpus multilingue: al soportar ingles, chino y japones, un mismo despliegue puede indexar documentacion de las tres lenguas con un unico formato de salida.
- Extraccion de estructura de documentos escaneados con imagenes: el servidor elimina del Markdown las descripciones de fotos naturales generadas por el modelo, pero conserva el bloque y su caja, de forma que la estructura queda registrada sin contaminar el texto.

## Benchmarks y rendimiento

Resultados declarados por el autor en ParseBench, medidos con el scorer publico `main` en el commit `afb36bd` (2026-09-29), sobre las 2.078 paginas del benchmark, con el servidor de pagina del repositorio (vLLM 0.28.0, mineru-vl-utils 2.0.5, 150 dpi, una NVIDIA L4):

| Modelo | Tablas | Graficos | Fidelidad de contenido | Formato semantico | Grounding visual | Global |
|---|---:|---:|---:|---:|---:|---:|
| MinerU2.5-Pro-2605-1.2B (base) | 77,30 | 59,13 | 87,86 | 49,59 | 72,83 | 69,34 |
| Aeddix Alpine OCR | 77,12 | 65,28 | 88,27 | 65,74 | 72,78 | 73,84 |

Notas aportadas por el autor:

- La puntuacion global es la media no ponderada de cinco metricas: `grits_trm_composite`, `rule_pass_rate` de graficos, `content_faithfulness`, `semantic_formatting` y `layout_element_rule_pass_rate`.
- Comparado por pares sobre los mismos documentos, el ajuste anade +4,38 puntos globales al modelo base con un intervalo de confianza del 95% por bootstrap documental de +3,60 a +5,17. El grueso corresponde a graficos (+6,15, error estandar 1,27) y formato semantico (+15,99, error estandar 1,45). Tablas, contenido y grounding quedan a nivel del modelo base dentro de un error estandar.
- Cada cifra proviene de una pasada completa; pasadas repetidas de la misma pila coincidieron hasta el cuarto decimal.
- La fila publicada en el leaderboard para el modelo base (72,78) se puntuo en junio de 2026 con el harness de los mantenedores, mas generoso con formato y grounding que el scorer publico actual. Sobre el scorer actual ese mismo modelo base obtiene 69,34, por lo que la comparacion correcta es 73,84 frente a 69,34.
- El efecto adicional de las dos reglas Markdown del servidor es de aproximadamente +0,1 puntos. Desglose: graficos anidados llevan los graficos del modelo base de 59,13 a 64,47 (+5,34), niveles de encabezado aportan +0,16 en formato (error estandar 0,11) y la exclusion de descripciones de fotos aporta +0,42 en contenido (error estandar 0,11).

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generalistas.

## Requisitos de hardware

- Pesos: 1.156.026.624 parametros en safetensors, 2,3 GB de repositorio. En bf16 el peso de los parametros ronda los 2,3 GB, estimacion coherente con el tamano del repositorio.
- VRAM estimada: no disponible de forma explicita. Como referencia, el autor ejecuto la evaluacion completa sobre una unica NVIDIA L4 (24 GB) con vLLM 0.28.0, sin indicar el consumo real de memoria. Un modelo denso de 1,16B deberia caber con holgura en GPUs de consumo con 8 GB o mas de VRAM, aunque esta cifra es una estimacion y no un dato publicado.
- GPU recomendadas: no disponible. La unica GPU documentada en la informacion es la NVIDIA L4 empleada en la evaluacion.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque no se confirma en la informacion disponible.
- Opciones de despliegue documentadas: vLLM 0.28.0 con `mineru-vl-utils` 2.0.5 y el servidor `alpine-ocr-server` incluido en `inference/`, que expone el endpoint `/predict` detras de la API de pagina `mineru2605pro` de ParseBench. Tambien se puede usar directamente con `transformers` y `MinerUClient`. No se documentan rutas de llama.cpp, Ollama, TGI ni cuantizaciones GGUF.
- Latencia y throughput: el script `inference/scripts/reproduce_parsebench.sh` tarda aproximadamente 55 minutos en recorrer las 2.078 paginas sobre una L4, lo que equivale a alrededor de 38 paginas por minuto en esa configuracion (calculo derivado de los datos aportados). No se publican cifras de latencia por pagina ni de tokens por segundo.
- Resolucion de entrada recomendada: 150 dpi, segun la configuracion del benchmark del autor.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base. Se incluye tambien la fila publicada en el leaderboard de ParseBench, con la advertencia del propio autor sobre el cambio de scorer.

| Modelo | Parametros | Contexto | Global en ParseBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aeddix Alpine OCR | 1,16B | no disponible | 73,84 (scorer `afb36bd`) | Apache-2.0 | HuggingFace, revision v0.1 |
| MinerU2.5-Pro-2605-1.2B | no disponible (1,2B por nomenclatura) | no disponible | 69,34 (scorer `afb36bd`) / 72,78 en leaderboard (junio 2026) | no disponible | HuggingFace |
| Otras alternativas de parseo de documentos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de otros parsers de documentos comparables (parametros, contexto, rendimiento o licencia), por lo que no se incluyen filas adicionales para no introducir cifras no verificadas.

## Limitaciones y advertencias

- Se trata de una research release: el propio autor advierte de que el modelo se ha ajustado contra un unico benchmark y arrastra las limitaciones que enumera.
- El ajuste fino esta orientado a ParseBench, por lo que el rendimiento en dominios, idiomas, maquetaciones o calidades de escaneo fuera de esa distribucion no esta caracterizado.
- La mejora se concentra en graficos y formato semantico; en tablas, fidelidad de contenido y grounding visual el modelo queda a nivel del base dentro del error estandar, sin ganancia demostrada.
- Las cifras del servidor incluyen tres anadidos que no forman parte del modelo: analisis de graficos anidados y dos reglas Markdown. La ruta directa con mineru-vl-utils omite esos anadidos y obtiene resultados peores en graficos y formato.
- Si se usa la ruta de mineru-vl-utils, es obligatorio activar `image_analysis=True`; en caso contrario los graficos vuelven vacios.
- La comparacion con el leaderboard publico de ParseBench no es homogenea: las filas del leaderboard llevan el scorer de su fecha. Comparar 73,84 con 72,78 induce a error.
- Idiomas soportados limitados a ingles, chino y japones. No se documenta soporte de castellano ni de otras lenguas.
- Longitud de contexto no disponible, lo que impide garantizar el tratamiento de paginas o documentos de gran tamano sin troceado previo.
- Riesgo de alucinacion no cuantificado en la informacion disponible. El autor menciona que el modelo genera descripciones propias para fotos naturales detectadas, motivo por el que el servidor las excluye del Markdown.
- No se documentan sesgos conocidos, evaluaciones de seguridad ni filtros de contenido.
- Licencia Apache-2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion de avisos. Al derivar de MinerU2.5-Pro-2605-1.2B, conviene verificar las condiciones del modelo base, cuya licencia no consta en la informacion proporcionada.
- Estado de adopcion minimo en el momento de la consulta: 0 descargas y 0 likes, sin garantias de mantenimiento.
- No hay datos publicados de cuantizacion, por lo que el despliegue en entornos con VRAM muy limitada requiere evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aeddix-labs/aeddix-alpine-ocr
- Modelo base: https://huggingface.co/opendatalab/MinerU2.5-Pro-2605-1.2B
- Repositorio de ParseBench: https://github.com/run-llama/ParseBench
- Commit del scorer utilizado: https://github.com/run-llama/ParseBench/commit/afb36bd83ed8df7846f9d4f18c58bb948d9d5de0
- Paper etiquetado en la model card: https://arxiv.org/abs/2604.04771 (no se detalla en la informacion disponible su relacion exacta con el modelo)
- Datasets declarados: https://huggingface.co/datasets/ibm-granite/ChartNet, https://huggingface.co/datasets/docling-project/SynthChartNet, https://huggingface.co/datasets/docling-project/SynthTabNet_OTSL, https://huggingface.co/datasets/docling-project/FinTabNet_OTSL, https://huggingface.co/datasets/docling-project/DocLayNet-v1.2, https://huggingface.co/datasets/lightonai/LightOnOCR-mix-0126, https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenidos no relacionados y se han descartado. No se han encontrado demos, blogs ni repositorios adicionales en la informacion disponible.
