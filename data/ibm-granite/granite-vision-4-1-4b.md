# ibm-granite/granite-vision-4.1-4b

## Resumen

Granite Vision 4.1 4B es un modelo de lenguaje y visión (VLM) desarrollado por IBM Research, publicado el 29 de abril de 2026 bajo licencia Apache 2.0. Se construye mediante fine-tuning sobre Granite-4.1-3B e incorpora un codificador visual y proyectores que elevan el total a aproximadamente 4.000 millones de parámetros (3,4B para el LLM y 0,6B para el codificador visual y proyectores). Su foco no es la conversación visual genérica, sino la extracción estructurada de información a partir de imágenes de documentos: gráficos, tablas y pares clave-valor semánticos.

El modelo resuelve un problema concreto en pipelines de documentación: convertir gráficos en CSV, resúmenes o código Python; tablas de maquetación compleja en JSON, HTML u OTSL; y valores clave a partir de esquemas de descripción sobre diseños heterogéneos. Todo ello con una huella de 4B parámetros, lo que lo posiciona como alternativa ligera a modelos frontera mucho mayores para tareas de extracción documental.

Es relevante ahora porque se integra con Docling, la herramienta de procesamiento de documentos de IBM, y porque el método y los datos de entrenamiento (ChartNet, un dataset multimodal de un millón de ejemplos) están documentados en el paper asociado. La arquitectura sigue el patrón transformer multimodal con codificador visual, y el modelo conserva las capacidades de descripción de imágenes de Granite Vision 4.0 3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLM Granite-4.1-3B + codificador visual + proyectores), clase `granite4_vision` |
| Parametros totales | 3.997.203.904 (aprox. 4B: 3,4B LLM + 0,6B vision encoder y proyectores) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un VLM compuesto por un LLM base (Granite-4.1-3B, 3,4B parametros) sobre el que se acoplan un codificador visual de 0,6B y proyectores que alinean las representaciones visuales con el espacio del lenguaje. La pipeline declarada es `image-text-to-text` y requiere cargar codigo personalizado (`custom_code`) en `transformers`. El modelo parte de Granite Vision 4.0 3B y extiende sus capacidades, de modo que los usuarios existentes pueden adoptarlo sin cambios en su flujo de trabajo.

El entrenamiento se centra en tareas de extraccion estructurada y utiliza el dataset ChartNet, descrito en el paper "ChartNet: A Million-Scale, High-Quality Multimodal Dataset for Robust Chart Understanding" (arXiv:2603.27064). No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron etapas de RLHF o DPO. La innovacion principal es el uso de etiquetas de tarea en el mensaje de usuario (`<chart2csv>`, `<chart2code>`, `<chart2summary>`, `<tables_json>`, `<tables_html>`, `<tables_otsl>`) que la plantilla de chat expande automaticamente en el prompt completo, evitando instrucciones verbosas y estandarizando la salida.

## Capacidades

- Extraccion de graficos a CSV (`<chart2csv>`): genera una tabla CSV con cabeceras y valores numericos.
- Extraccion de graficos a codigo Python (`<chart2code>`): produce codigo que recrea el grafico.
- Extraccion de graficos a resumen (`<chart2summary>`): descripcion en lenguaje natural del grafico.
- Extraccion de tablas a JSON (`<tables_json>`): estructura con dimensiones y celdas.
- Extraccion de tablas a HTML (`<tables_html>`): marcado `<table>` completo.
- Extraccion de tablas a OTSL (`<tables_otsl>`): marcado OTSL con etiquetas de celda y fusion.
- Extraccion de pares clave-valor (KVP) basada en esquema: valores extraidos segun nombres y descripciones de claves, con salida JSON con diccionarios y arrays anidados.
- Descripcion de imagenes en lenguaje natural (image-to-text).
- Procesamiento de documentos completos y de tablas recortadas (cropped-table y full-page).
- Integracion con Docling para enriquecer pipelines de procesamiento documental.
- Soporte de conversacion multi-turno (tag `conversational`).

## Casos de uso

- Digitalizacion de informes financieros: extraer tablas de balances y cuentas de resultados desde imagenes de PDF a JSON o HTML, usando `<tables_json>` o `<tables_html>`, para alimentar bases de datos o hojas de calculo sin transcripcion manual.
- Conversion de graficos de articulos cientificos a datos reutilizables: aplicar `<chart2csv>` sobre figuras de papers para recuperar las series numericas y reutilizarlas en analisis estadistico o replicaciones.
- Generacion de codigo reproducible a partir de figuras: usar `<chart2code>` para obtener scripts Python que reconstruyan graficos de dashboards o informes, utiles en documentacion tecnica y auditoria.
- Extraccion de formularios y documentos administrativos: emplear la extraccion KVP basada en esquema para recuperar campos como numero de factura, fecha, importe o titular a partir de disenos heterogeneos, con salida JSON anidada lista para validacion.
- Enriquecimiento de pipelines RAG documentales: integrar el modelo con Docling para convertir tablas y graficos de PDFs en texto estructurado antes de la indexacion, mejorando la recuperacion sobre contenido visual.
- Automatizacion de informes periodicos: procesar lotes de imagenes de graficos (`<chart2summary>`) para generar resumenes en lenguaje natural que acompanen a los datos en boletines o paneles.
- Auditoria de documentos regulatorios: extraer tablas completas de paginas enteras (full-page) y comparar estructuras con TEDS frente a versiones previas para detectar cambios en maquetacion o contenido.
- Descripcion accesible de imagenes: generar descripciones en lenguaje natural de figuras y diagramas para metadatos o textos alternativos.

## Benchmarks y rendimiento

La model card presenta resultados en formato grafico (imagenes), sin tablas numericas completas en el texto proporcionado. Los datos explicitos disponibles son los siguientes:

| Benchmark | Tarea | Metrica | Resultado |
|---|---|---|---|
| VAREX | Extraccion KVP multimodal | Exact-match (zero-shot) | 94,2 % |
| ChartNet test set | Chart2CSV y Chart2Summary | LLM-as-a-judge (GPT-4o), escala 0-100 | no disponible en texto (solo figura) |
| TableVQA-Extract | Extraccion de tablas recortadas | TEDS | no disponible en texto (solo figura) |
| OmniDocBench-tables | Extraccion de tablas en pagina completa | TEDS | no disponible en texto (solo figura) |
| PubTablesV2 (cropped) | Extraccion de tablas recortadas | TEDS | no disponible en texto (solo figura) |
| PubTablesV2 (full-page) | Extraccion de tablas en pagina completa | TEDS | no disponible en texto (solo figura) |

No se han publicado en la informacion disponible los valores numericos de MMLU, HumanEval, GSM8K ni del resto de benchmarks de extraccion; las cifras solo aparecen en las figuras de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4B parametros, en FP16 se requieren aproximadamente 8 GB solo para pesos, mas memoria para el codificador visual, el contexto y las activaciones; en cuantizacion de 8 bits rondaria los 4-5 GB y en 4 bits los 2,5-3 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues de alto throughput; RTX 4090 (24 GB) para inferencia comoda en FP16.
- GPU de consumo: cabe en GPUs consumer con 12 GB o mas en FP16; en 8 GB podria requerir cuantizacion, no confirmada oficialmente.
- Opciones de despliegue: `transformers` con `custom_code` (requisito explicito de la libreria), endpoints compatibles (`endpoints_compatible`) y despliegue en Azure (`deploy:azure`). No se confirma soporte oficial de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos numericos comparativos con modelos alternativos (por ejemplo, otros VLM de ~4B para extraccion documental). La model card afirma que el modelo ofrece rendimiento comparable a modelos frontera mucho mayores en extraccion estructurada, pero sin cifras explicitas en el texto. Se indica, por tanto, que la comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Granite Vision 4.1 4B | ~4B (3,4B LLM + 0,6B vision) | no disponible | Extraccion documental estructurada | Apache 2.0 |
| Granite Vision 4.0 3B | no disponible | no disponible | Vision-lenguaje general | no disponible en esta ficha |
| Modelos frontera citados en la model card | mucho mayores | no disponible | Proposito general | no disponible |

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de ingles (`en`); el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: en tareas de extraccion de tablas, graficos y KVP, el modelo puede generar valores, filas o celdas inexistentes, especialmente con imagenes de baja calidad o maquetaciones atipicas; se recomienda validacion posterior.
- Dependencia de codigo personalizado: requiere `custom_code` en `transformers` y no se documentan conversiones a formatos de inferencia habituales (GGUF, vLLM), lo que puede complicar el despliegue en entornos estandarizados.
- Enfoque especializado: aunque conserva capacidades de descripcion de imagenes, no esta disenado como VLM conversacional general; su rendimiento fuera de las tareas de extraccion puede ser inferior al de modelos generalistas.
- Contexto: no se publica la longitud de contexto, lo que impide planificar casos de documento muy largo con multiples paginas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del codigo personalizado y del LLM base.
- Datos de benchmarks incompletos: los resultados de extraccion de tablas y graficos solo aparecen como figuras; no se dispone de cifras verificables en texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-vision-4.1-4b
- LLM base Granite-4.1-3B: https://huggingface.co/ibm-granite/granite-4.1-3b
- Paper ChartNet: https://huggingface.co/papers/2603.27064
- Dataset ChartNet: https://huggingface.co/datasets/ibm-granite/ChartNet
- Organizacion IBM Granite en GitHub: https://github.com/ibm-granite
- Docling: https://github.com/docling-project/docling
- Benchmark TableVQA: https://github.com/naver-ai/tablevqabench
- Benchmark OmniDocBench: https://github.com/opendatalab/OmniDocBench
- Dataset PubTablesV2: https://huggingface.co/datasets/kensho/PubTables-v2
- Benchmark VAREX: https://udibarzi.github.io/varex-bench/
- Paper TEDS: https://arxiv.org/abs/2208.00385
