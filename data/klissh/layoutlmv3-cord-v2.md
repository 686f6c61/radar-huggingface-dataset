# Klissh/layoutlmv3-cord-v2

## Resumen

Klissh/layoutlmv3-cord-v2 es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning de microsoft/layoutlmv3-base sobre el dataset CORD-v2 (naver-clova-ix/cord-v2). Su objetivo es la extracción de información clave de tickets y recibos de compra: nombre del artículo, cantidad, precio unitario, subtotal, impuestos, descuentos y total. No es un modelo generativo: recibe texto e imágenes de un ticket y devuelve una etiqueta BIO por cada token de entrada.

El modelo lo publica el usuario Klissh (0 descargas y 0 likes en el momento de la consulta) y se utiliza en el Space Klissh/managemymoney-scan-struk para la función de escaneo de tickets con desglose por artículo de la aplicación managemymoney. Está construido sobre LayoutLMv3ForTokenClassification, con 125.959.863 parámetros totales y pesos en formato safetensors (0,5 GB de repositorio), bajo licencia MIT.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo completo de fine-tuning multimodal (texto + layout) sobre un dataset pequeño; por otro, documenta de forma explícita una limitación metodológica importante (ausencia de ejemplos de la clase `O` en el dataset de origen), lo que lo convierte en un caso útil para discutir la calidad de los datos en tareas de extracción de documentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LayoutLMv3ForTokenClassification (transformer multimodal texto + imagen + layout) |
| Parámetros totales | 125.959.863 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (máximo de posiciones de LayoutLMv3-base; max_length usada en el ejemplo de la model card) |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors, sin variantes GGUF, AWQ, GPTQ ni int8 publicadas) |
| Idiomas soportados | Inglés (en) e indonesio (id), según los metadatos; el dataset CORD-v2 se etiqueta como inglés e indonesio |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,5 GB) |
| Modelo base | microsoft/layoutlmv3-base |
| Dataset de entrenamiento | naver-clova-ix/cord-v2 (train 800 / validación 100 / test 100) |
| Número de etiquetas | 55 (esquema BIO, incluida `O`) |
| Pipeline | token-classification |
| Librería | transformers |

## Arquitectura y entrenamiento

La arquitectura es LayoutLMv3, un transformer multimodal que combina tres flujos de información: los embeddings de texto, los parches de imagen (patches) de la página y las cajas delimitadoras (bounding boxes) normalizadas en el rango 0-1000. LayoutLMv3 se preentrena con objetivos unificados de enmascarado de texto (MLM) y de imagen (MIM), junto con alineación palabra-parche, lo que le permite explotar conjuntamente el contenido textual, la disposición espacial y el aspecto visual del documento. En este caso se ha realizado un fine-tuning sobre la cabeza de clasificación de tokens, por lo que la salida es una etiqueta BIO por token de entrada, no texto generado.

El entrenamiento se hizo sobre CORD-v2 con los siguientes hiperparámetros declarados por el autor: learning_rate 1e-5, 10 épocas, batch size 2, fp16 y seed 42. La metodología documentada incluye varias decisiones destacables: el split de test se reservó íntegramente y solo se usó una vez al final para las cifras oficiales; la validación se empleó únicamente para `load_best_model_at_end` con `metric_for_best_model="f1"`; el vocabulario de etiquetas se construyó a partir de la unión de train, validación y test; y se aplicó deduplicación por hash de imagen entre los tres splits, eliminando duplicados de los splits que no eran de entrenamiento. Las métricas son a nivel de entidad (span) con implementación manual del esquema BIO, sin usar `seqeval`. No se documentan fases de RLHF ni DPO, algo esperable en un modelo discriminativo de este tipo.

## Capacidades

- Clasificación de tokens con esquema BIO sobre documentos con layout, orientada a extracción de información clave (KIE).
- Extracción de campos de tickets y recibos: nombre de artículo, cantidad, precio unitario, subtotal, impuestos, descuentos y total.
- Procesamiento multimodal conjunto: texto OCR, posición espacial de cada palabra (bounding boxes 0-1000) e imagen de la página.
- Desglose por artículo, que permite segmentar un ticket en líneas independientes para su posterior asignación o contabilización.
- Funcionamiento con OCR externo: el modelo se carga con `apply_ocr=False`, de modo que el texto y las cajas provienen de un motor externo (en el Space asociado se usa EasyOCR).
- Entrada limitada a 512 tokens por documento, con truncación y padding configurables.
- No soporta generación de texto, tool calling, function calling, uso como agente, razonamiento multi-paso, visión general, audio ni modo de razonamiento extendido (thinking mode). Es un modelo puramente discriminativo y de una sola pasada.
- Capacidad multilingüe limitada: los metadatos declaran inglés e indonesio, y el propio autor indica que el modelo se usa para tickets indonesios pese a que el dataset de entrenamiento está etiquetado en inglés.

## Casos de uso

- Escaneo de tickets para finanzas personales: es el caso real documentado; el modelo etiqueta cada token del ticket y la aplicación agrupa los campos por artículo para generar un desglose de gasto. Es adecuado por su tamaño reducido (126 M de parámetros), que permite ejecutarlo en hardware modesto dentro de un servicio de escaneo.
- División de gastos compartidos: al identificar líneas de artículo, cantidad y precio unitario, el modelo permite repartir el importe de un ticket entre varias personas o centros de coste sin introducir los datos a mano.
- Automatización de notas de gastos en empresa: integrado en un pipeline de OCR más este modelo, se pueden extraer total, impuestos y proveedor de cada recibo y volcarlos a un ERP o a una hoja de cálculo contable.
- Digitalización de archivos históricos de recibos en lote: con lotes de 512 tokens y ejecución en GPU de gama media o incluso CPU, se pueden procesar carpetas de imágenes escaneadas de forma masiva; el resultado se postprocesa para consolidar los spans BIO en campos estructurados.
- Validación y auditoría de gastos: comparando los subtotales, descuentos, impuestos y total extraídos se pueden detectar incoherencias aritméticas o documentos manipulados antes de aprobar un reembolso.
- Extracción de datos en herramientas de RPA: al devolver etiquetas por token, el modelo encaja como paso intermedio en robots de automatización que rellenan formularios o sistemas de gestión documental a partir de imágenes de tickets.
- Preprocesado para búsqueda o indexación de documentos: los campos detectados se pueden indexar para permitir consultas sobre importes o establecimientos en un repositorio de recibos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un marcador de posición explícito para las cifras de test (`F1 test = 0.xx`) que el autor debe rellenar con el contenido de `test_results.json`, por lo que no hay valores de F1, precisión o recall verificables, ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar. Cualquier cifra de rendimiento sobre CORD-v2 correspondiente a este modelo concreto debe considerarse no disponible hasta que el autor publique las métricas del split de test.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,5 GB en fp32 y alrededor de 0,25 GB en fp16. Con batch 1 y secuencias de 512 tokens, el consumo total (pesos más activaciones) se mantiene por debajo de 1-2 GB, aunque no se publican mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una T4, RTX 3060, RTX 4090, A100 o H100 funcionan sin problema y quedan sobredimensionadas para este modelo. El coste real del pipeline suele estar en el motor de OCR, no en el modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4060 y superiores) e incluso en iGPU con suficiente memoria compartida.
- CPU: es viable para inferencia en CPU dado el tamaño del modelo, con una latencia mayor; no se publican cifras de rendimiento en CPU.
- Opciones de despliegue: transformers con PyTorch como vía principal, dado que el repo es safetensors y la librería declarada es transformers. El modelo está marcado como `endpoints_compatible`, por lo que puede desplegarse en Hugging Face Inference Endpoints. También es posible servirlo con un wrapper propio (FastAPI, TorchServe) o exportarlo a ONNX. No aplica llama.cpp ni Ollama, porque no se publican pesos GGUF y el modelo no es generativo; vLLM y TGI están orientados a modelos generativos, por lo que no son la vía natural para esta tarea.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klissh/layoutlmv3-cord-v2 | 125.959.863 | 512 tokens | Token classification BIO sobre texto + layout + imagen | MIT | Repo safetensors de 0,5 GB, sin métricas de test publicadas |
| microsoft/layoutlmv3-base | No disponible en la información proporcionada | 512 tokens | Modelo base multimodal preentrenado, sin cabeza ajustada a CORD | No disponible en la información proporcionada | Modelo base del que deriva este fine-tuning |
| naver-clova-ix/donut-base-finetuned-cord-v2 | No disponible en la información proporcionada | No disponible en la información proporcionada | Seq2seq generativo de documento a JSON | No disponible en la información proporcionada | Alternativa generativa para el mismo dataset, no verificada en esta búsqueda |
| Otros fine-tunings de LayoutLMv3 sobre CORD-v2 | No disponible | 512 tokens | Token classification BIO | Variable según autor | No disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada, por lo que la comparación se limita a enfoque, tamaño declarado y licencia.

## Limitaciones y advertencias

- Ausencia de ejemplos de la clase `O`: tal como advierte el propio autor, todo el dataset CORD-v2 procede de `valid_line` anotado como entidad, por lo que no hay ejemplos de entrenamiento de texto no entidad. En tickets reales, textos como pies de página, números de teléfono o identificadores fiscales pueden recibir etiquetas incorrectas. Es una limitación del origen de los datos, no del pipeline.
- Sin métricas publicadas: la model card deja el F1 de test como marcador de posición. No se puede validar la calidad real del modelo ni compararla con alternativas.
- Modelo sin adopción: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en producción más allá del Space del propio autor.
- Requiere OCR externo: el modelo no incluye OCR (`apply_ocr=False`), de modo que la calidad depende por completo del motor externo (EasyOCR en el caso documentado) y del formato de las bounding boxes, que deben normalizarse a 0-1000.
- Contexto limitado a 512 tokens: los tickets con muchas líneas pueden truncarse, con la consiguiente pérdida de campos.
- No genera JSON ni texto estructurado: la salida son etiquetas BIO por token, por lo que hace falta un postprocesado propio para agrupar spans y construir los campos finales.
- Alcance restringido a tickets y recibos: aunque las etiquetas incluyan términos como factura, el entrenamiento se ha hecho únicamente sobre CORD-v2, compuesto por recibos. No hay garantía de comportamiento en facturas formales, albaranes u otros documentos.
- Idiomas: los metadatos declaran inglés e indonesio; el dataset CORD-v2 proviene de recibos indonesios etiquetados en inglés y el autor indica uso para tickets indonesios. No hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- Sesgos potenciales: el modelo hereda los sesgos de CORD-v2 en cuanto a formato de ticket, establecimientos, moneda y estilo de impresión. Tickets con plantillas muy distintas pueden degradar el resultado.
- Riesgo de alucinación: en un modelo discriminativo no hay generación libre, pero sí hay riesgo de etiquetar como entidad tokens que no lo son, especialmente por la falta de ejemplos `O`.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar también las condiciones del modelo base (microsoft/layoutlmv3-base) y del dataset CORD-v2 antes de un despliegue comercial.
- Caveat de producción: al no haber métricas ni validación externa, se recomienda evaluar el modelo con un conjunto propio de tickets antes de integrarlo en un flujo crítico, y monitorizar los campos extraídos, en particular totales e impuestos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Klissh/layoutlmv3-cord-v2
- Modelo base: https://huggingface.co/microsoft/layoutlmv3-base
- Dataset CORD-v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Space que lo utiliza: https://huggingface.co/spaces/Klissh/managemymoney-scan-struk
- Repositorio de la aplicación (incluye el notebook de fine-tuning): https://github.com/devilk1d/managemymoney
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a un portal de compraventa de automóviles y no guardan relación con el modelo.
