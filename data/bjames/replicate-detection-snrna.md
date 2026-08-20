# bjames/replicate-detection-snrna

## Resumen

El dataset `bjames/replicate-detection-snrna` es un conjunto de datos de referencia para la detección de réplicas biológicas en datos de secuenciación de ARN de núcleo único (snRNA-seq). Contiene 109 muestras de estriado humano procedentes de donantes post-mortem y forma parte de la suite de evaluación Terminal Bench Science, desarrollada por el Harbor Framework. Fue creado por B. James (MIT) y está diseñado para evaluar la capacidad de agentes de IA de identificar qué muestras proceden del mismo donante, un problema crítico en estudios de transcriptómica a gran escala.

La identidad del donante está oculta deliberadamente en los nombres de los ficheros, lo que convierte la tarea en un reto realista de razonamiento y verificación de datos. El repositorio ocupa 15,2 GB e incluye 109 ficheros H5AD con matrices de expresión génica por célula, además de una tabla de metadatos de verificación extraída del material suplementario de una publicación en *Cell* prevista para septiembre de 2026.

Su relevancia actual radica en que proporciona un punto de referencia verificable para la evaluación de agentes de IA en el ámbito biomédico, con metadatos clínicos y técnicos que permiten una auditoría independiente de la procedencia de los datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Tipo de datos | snRNA-seq (secuenciación de ARN de núcleo único) |
| Número de muestras | 109 ficheros H5AD |
| Tamaño del repositorio | 15,2 GB |
| Región cerebral | Estriado humano (NAc y Putamen) |
| Formato de datos | H5AD (AnnData) con matriz de expresión CSR gene-by-cell |
| Metadatos de verificación | TSV de 13 columnas (109 filas) extraído de Cell Supplementary Data S2 |
| Idiomas soportados | en (metadatos en inglés) |
| Licencia | CC BY 4.0 |
| Tarea de benchmark | Detección de réplicas (replicate detection) |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

Este no es un modelo entrenado, sino un dataset de evaluación. La estructura de datos consiste en 109 ficheros H5AD, cada uno con una muestra de snRNA-seq del estriado humano. Cada fichero contiene una matriz de expresión génica por célula en formato CSR (compressed sparse row) con conteos enteros, anotaciones de genes en `adata.var` y metadatos por célula en `adata.obs`.

Los nombres de los ficheros codifican información de lote y fecha, pero no la identidad del donante, que se oculta para que la detección de réplicas constituya una tarea realista. La tabla de verificación `sample_metadata_s2.tsv` incluye 13 columnas con metadatos clínicos y técnicos (donante, región, edad, sexo, PMI, protocolo de preparación, tipo de entrada, fracciones celulares, etc.) que permiten a los revisores verificar de forma independiente la procedencia de los datos contra la publicación original en *Cell*. El mecanismo de verificación del benchmark comprueba que los valores de `donor_id` e `input_type` de cada muestra coinciden exactamente con la extracción de la tabla S2.

## Capacidades

- Detección de réplicas biológicas: permite identificar muestras procedentes del mismo donante a partir de datos de expresión génica.
- Verificación cruzada de metadatos: las columnas `donor_id` e `input_type` permiten contrastar la verdad ground truth oculta con la tabla S2 publicada.
- Validación independiente de sexo: es posible confirmar el sexo del donante mediante la expresión de genes del cromosoma Y (UTY, KDM5D, DDX3Y).
- Análisis de composición celular: los metadatos incluyen fracciones de neuronas espinosas medianas (MSN) y neuronas excitatorias por muestra.
- Evaluación de agentes de IA: integrado en Terminal Bench Science para evaluar agentes que operan en entornos de terminal reales.
- Análisis de variables técnicas: los metadatos de PMI, protocolo de preparación (10x v3, 10x multiome) y tipo de entrada (bulk o BVE) permiten estudiar el efecto de factores técnicos en la expresión génica.

## Casos de uso

- Evaluación de agentes de IA biomédicos: el dataset sirve como tarea de referencia en Terminal Bench Science para medir la capacidad de agentes de IA de resolver problemas reales de análisis de datos ómicos en un entorno de terminal.
- Control de calidad en estudios de transcriptómica: permite detectar muestras duplicadas o mal etiquetadas en estudios multi-lote de snRNA-seq, un problema frecuente al integrar datos de múltiples centros.
- Verificación de procedencia de datos: los metadatos S2 permiten auditar la trazabilidad de las muestras frente a la publicación original, útil para revisores y editores.
- Investigación en neurociencia: los datos de estriado humano (NAc y Putamen) pueden reutilizarse para estudios de vulnerabilidad de tipos celulares en enfermedades neurodegenerativas como Huntington o Parkinson.
- Desarrollo de pipelines de análisis single-cell: los ficheros H5AD pueden usarse para probar pipelines de preprocesado, integración de lotes y anotación celular con Scanpy o Seurat.
- Formación en bioinformática: el conjunto de datos con metadatos verificables es adecuado para enseñar análisis de datos single-cell y detección de artefactos técnicos en entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El dataset está diseñado como tarea de evaluación para Terminal Bench Science, pero no se incluyen métricas de rendimiento de agentes o modelos en la documentación proporcionada.

## Requisitos de hardware

- Almacenamiento: se requieren aproximadamente 15,2 GB de espacio en disco para el repositorio completo.
- Memoria RAM: el procesamiento de ficheros H5AD con matrices sparse de expresión génica requiere memoria proporcional al fichero más grande; no se dispone de cifras exactas de requisitos de memoria en la documentación.
- GPU: no se requiere GPU para el análisis de los datos; el procesamiento es principalmente CPU-bound.
- Opciones de despliegue: los ficheros H5AD pueden procesarse con la pila de Python de AnnData/Scanpy, o con herramientas como Seurat en R.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre datasets comparables en la documentación proporcionada. El dataset forma parte de la suite Terminal Bench Science, que incluye otras tareas de evaluación, pero no se detallan en la información disponible.

## Limitaciones y advertencias

- Datos pre-publicación: el dataset acompaña a un artículo en *Cell* previsto para el 1 de septiembre de 2026; su uso antes de la publicación debe citarse como referencia provisional.
- Alcance limitado: los datos proceden exclusivamente del estriado humano, por lo que no son representativos de otras regiones cerebrales o especies.
- Tamaño de muestra reducido: 109 muestras de un número no especificado de donantes; la generalización estadística puede estar limitada.
- Idioma: los metadatos y la documentación están únicamente en inglés.
- Identidad del donante oculta: la tarea de detección de réplicas requiere inferir la identidad del donante a partir de los datos de expresión, lo que puede dar lugar a falsos positivos o negativos.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero requiere citar la fuente original.

## Enlaces

- Hugging Face: https://huggingface.co/bjames/replicate-detection-snrna
- Terminal Bench Science (GitHub): https://github.com/harbor-framework/terminal-bench-science
- Pull request de implementación: https://github.com/harbor-framework/terminal-bench-science/pull/639
