# psikosen/shadowswarm-leandoc-v10

## Resumen

Shadow Swarm & LeanDoc-1G v10 es una publicación de software de código abierto desarrollada por psikosen, no un modelo neuronal preentrenado. El repositorio incluye un conjunto de herramientas de ingesta documental y un toolkit experimental de knowledge-graph. Su principal novedad es la incorporación de extracción nativa de DOCX, que se suma a la ingesta de PDF, Markdown y texto plano. Permite extraer párrafos, jerarquía de encabezados, tablas con celdas combinadas, hipervínculos y texto multilingüe sin depender de Office, OCR ni GPU.

Esta versión se describe como una serie experimental (v10) y no incluye pesos de modelo, tokenizer ni interfaz Transformers `from_pretrained`. El paquete se distribuye como código Python, con dependencias mínimas: para DOCX usa únicamente las bibliotecas estándar ZIP y XML de Python, mientras que para PDF se apoya en utilidades Poppler. La relevancia del proyecto radica en su ligereza: según las mediciones del autor, extrae los tres documentos DOCX de prueba en 51,86 ms con un pico de RSS de 36,5 MiB, frente a los 373,45 ms y 590,0 MiB de la biblioteca oficial Docling 2.126.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (release de software, no es un modelo neuronal) |
| Parametros totales | No disponible (no hay pesos de modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (etiqueta en Hugging Face); el extrayente de DOCX soporta texto multilingüe |
| Licencia | No disponible |
| Formato de pesos | No aplica (no incluye pesos; distribuye codigo Python) |

## Arquitectura y entrenamiento

El proyecto se compone de varios modulos: un adaptador de ingesta (`DoclingIngestionAdapter`, que pese a su nombre usa un lector nativo de DOCX), un submodulo para reparacion de tablas en PDF, y cuatro motores de razonamiento experimentales (tipo A estructural, tipo B de doble pasada calibrado, tipo C de debate y tipo D de valor de la informacion bayesiano). No hay entrenamiento de modelo; el autor indica explicitamente que los benchmarks de extraccion no establecen precision de razonamiento ni de knowledge-graph para esos motores.

La extraccion de DOCX se implementa con las bibliotecas estandar `zipfile` y `xml.etree`, recorriendo los XML internos del documento y resolviendo propiedades de estilo heredadas y niveles de esquema. Para la ingesta de PDF se requiere la instalacion de utilidades Poppler (`pdftotext`, `pdftohtml`, `pdfinfo`, `pdftocairo`) y se ofrece un modo experimental de reparacion de tablas regladas que debe seleccionarse explicitamente. El sistema de grounding genera hashes SHA-256 de artefactos y offsets de texto extraido, que en el caso de DOCX apuntan a un flujo canonico de texto extraido, no a los bytes del ZIP.

## Capacidades

- Extraccion nativa de DOCX: parrafos, jerarquia de encabezados basada en niveles de esquema y estilos heredados, tablas con metadatos de celdas combinadas horizontal y verticalmente, texto multilingue, celdas vacias, hipervinculos, tabulaciones y saltos de linea.
- Ingesta de PDF nativo mediante Poppler, con extraccion de texto digital y un experimento opcional de reparacion de tablas regladas.
- Grounding de artefactos: calculo de hashes SHA-256, offsets del texto extraido y spans de evidencia.
- Cuatro experimentos de razonamiento: estructural, doble pasada calibrado, debate y valor de la informacion bayesiano.
- Soporte para ejecucion en CPU sin dependencias de GPU, OCR ni instalacion de Office.
- Incluye casos de prueba, documentos DOCX sinteticos y scripts de benchmark.

## Casos de uso

- Ingesta de facturas y albaranes en DOCX para contabilidad: el adaptador extrae tablas con celdas fusionadas y calcula hashes SHA-256 de cada archivo, lo que facilita verificar la integridad del documento antes de enviarlo a un sistema contable.
- Preprocesamiento de documentos legales para sistemas de recuperacion aumentada (RAG): al convertir el contenido de DOCX a un flujo de texto plano con jerarquia de secciones, se puede alimentar un pipeline de embedding sin necesidad de OCR ni de convertir a PDF.
- Extraccion de tablas financieras en informes con celdas combinadas: el lector conserva los metadatos de spans de celdas, permitiendo reconstruir la estructura original de la tabla en formato tabular.
- Verificacion de procedencia en archivos documentales: los offsets y spans de evidencia permiten rastrear que fragmento de texto extraido corresponde a que parte del original, util para auditorias.
- Benchmarking de motores de extraccion documental: el proyecto incluye documentos sinteticos con respuestas conocidas y scripts para comparar rendimiento entre distintos backends, como Docling.
- Integracion en pipelines de automatizacion de documentos: al ser una libreria Python ligera con dependencias minimas, puede ejecutarse en entornos CI/CD sin GPU ni servicios externos.

## Benchmarks y rendimiento

Se han publicado benchmarks de extraccion para DOCX y PDF en la informacion proporcionada. La evaluacion de DOCX utilizo tres documentos sinteticos con nueve paginas renderizadas, nueve tablas, 180 filas de datos y 960 celdas.

| Metrica | Antes del soporte nativo DOCX | Esta publicacion | Docling 2.126.0 |
|---|---:|---:|---:|
| Filas de datos completas | 0/180 | 180/180 | 180/180 |
| Celdas de datos | 0/960 | 960/960 | 960/960 |
| Encabezados de seccion seleccionados | 0/9 | 9/9 | 9/9 |
| Parrafos seleccionados | 0/12 | 12/12 | 12/12 |
| Ocurrencias de texto/spans de cabeceras combinadas | 0/6 | 6/6 | 6/6 |
| Tiempo de conversion, los tres documentos | No soportado | 51,86 ms | 373,45 ms |
| Pico de RSS del proceso | No soportado | 36,5 MiB | 590,0 MiB |

La evaluacion de PDF es un conjunto de datos y un scorer separados: 26 paginas de 20 documentos naturales con etiquetas generadas por un asistente. No son resultados de precision global independientes.

| Metrica | Experimento V10 de tablas regladas | Docling |
|---|---:|---:|
| Filas completas seleccionadas | 37/49 (75,5%) | 29/49 (59,2%) |
| Encabezados estrictos seleccionados | 27/40 (67,5%) | 27/40 (67,5%) |
| Redaccion de encabezados sin prefijos numericos | 37/40 (92,5%) | 37/40 (92,5%) |
| Tasa de error de palabras en extracto seleccionado | 6/578 (1,04%) | 6/578 (1,04%) |

El autor advierte que los benchmarks de DOCX y PDF no deben agregarse en un unico porcentaje de precision. El 100% en las comprobaciones sinteticas no garantiza un 100% en documentos DOCX arbitrarios.

## Requisitos de hardware

- No requiere GPU ni VRAM para la extraccion de DOCX.
- CPU compatible con Python 3.10 o superior; las mediciones se realizaron con Python 3.12.3.
- Para PDF es necesario instalar utilidades Poppler del sistema operativo (por ejemplo, `pdftotext`, `pdftohtml`, `pdfinfo`, `pdftocairo`).
- Memoria observada: pico de RSS de 36,5 MiB en el escenario DOCX de tres documentos, incluyendo importaciones.
- Despliegue: instalacion con `pip install -e '.[test]'`, ejecucion de tests con `pytest` y uso como biblioteca Python importable.
- No se proporcionan datos de latencia ni throughput para inferencia, ya que no hay modelo neuronal.

## Comparativa con modelos similares

El proyecto se compara con la biblioteca oficial Docling 2.126.0 en el ambito de extraccion de documentos.

| Parametro | Shadow Swarm & LeanDoc-1G v10 | Docling 2.126.0 |
|---|---|---|
| Tipo de artefacto | Software de ingesta documental | Biblioteca de ingesta documental |
| Soporte DOCX nativo | Si, con bibliotecas estandar de Python | Si, con dependencias adicionales |
| Dependencia de GPU | No | No se especifica en la comparacion, aunque el pico de RSS sugiere un uso mayor de recursos |
| Pico de RSS en benchmark DOCX | 36,5 MiB | 590,0 MiB |
| Tiempo de conversion en benchmark DOCX | 51,86 ms | 373,45 ms |
| Licencia | No disponible | No disponible |
| Disponibilidad | Hugging Face | Oficial |

No se ha encontrado informacion que permita comparar con modelos de lenguaje de tamano similar, ya que este repositorio no es un modelo neuronal.

## Limitaciones y advertencias

- No es un modelo preentrenado: no se puede usar con `transformers` ni con `from_pretrained`. No hay pesos, tokenizer ni ejecucion de entrenamiento.
- Los benchmarks de DOCX se realizaron sobre documentos sinteticos generados con respuestas conocidas y no representan una garantia de precision para documentos arbitrarios.
- Los resultados de PDF se basan en un conjunto etiquetado por un asistente y no son precision global independiente; el autor lo indica en el model card.
- Los datasets y scorers de DOCX y PDF son distintos y no deben agregarse en un unico porcentaje de exactitud.
- El soporte de PDF requiere Poppler instalado en el sistema; no incluye un motor de OCR ni reconocimiento de documentos escaneados.
- La licencia no esta declarada en la informacion disponible, lo que impide confirmar restricciones de uso comercial.
- Los motores de razonamiento experimentales no han sido validados por los benchmarks de extraccion; su precision en tareas de knowledge graph es desconocida.
- El modelo card advierte que "100% en estas comprobaciones sinteticas no significa 100% en documentos DOCX arbitrarios".

## Enlaces

- Pagina de Hugging Face: https://huggingface.co/psikosen/shadowswarm-leandoc-v10
- Informe de precision DOCX: `benchmarks/DOCX_ACCURACY.md`
- Resultados nativos DOCX: `benchmarks/docx_accuracy_native.json`
- Resultados con Docling: `benchmarks/docx_accuracy_docling.json`
- Manifest de respuestas conocidas: `benchmarks/docx_fixtures/manifest.json`
- Informe de precision PDF: `benchmarks/CURRENT_ACCURACY.md`
- Ficheros de configuracion del paquete: `pyproject.toml`
