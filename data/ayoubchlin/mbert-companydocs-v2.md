# AyoubChLin/mBERT-CompanyDocs-v2

## Resumen

mBERT-CompanyDocs-v2 es un clasificador de texto monoetiqueta especializado en identificar tipos de documentos empresariales (facturas, pedidos, albaranes, nóminas, extractos, etc.) a partir del texto ya extraído del documento. Lo desarrolla Ayoub Cherguelaine (usuario AyoubChLin) y consiste en un ajuste fino de `google-bert/bert-base-multilingual-cased` con una cabeza de clasificación de secuencia sobre 13 categorías documentales. El repositorio declara 177.863.437 parámetros reales en safetensors y un tamano de 0,7 GB.

El modelo resuelve un problema muy concreto de los pipelines de gestión documental: decidir qué tipo de documento es cada fichero antes de enrutarlo, extraer campos o archivarlo. Está entrenado sobre el dataset propio `AyoubChLin/Company-document-dataset-v2`, con documentos en inglés y francés, y solo consume texto plano, no el PDF ni la imagen original.

Su relevancia actual es limitada pero funcional: es un modelo pequeno (clase BERT base), barato de servir y publica métricas casi perfectas en su propio benchmark (99,9957 % de accuracy y 99,5094 % de macro-F1). Esas cifras no están verificadas de forma independiente y proceden del mismo dataset con el que se entrenó, por lo que deben tratarse como un resultado de referencia del autor y no como una validación en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT multilingue (transformer encoder) con cabeza de clasificación de secuencia |
| Parametros totales | 177.863.437 (dato real, safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens, incluidos los tokens especiales |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors en el checkpoint base) |
| Idiomas soportados | Ingles y frances (en, fr) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificación de texto monoetiqueta (13 clases) |
| Modelo base | google-bert/bert-base-multilingual-cased |
| Framework de entrenamiento | PyTorch y Hugging Face Transformers `Trainer` |
| Entrada | Texto extraído del documento (campo `file_content`) |
| Salida | Etiqueta de tipo de documento y puntuación del modelo |
| Descargas / likes | 10 descargas, 0 likes |
| Tamano del repositorio | 0,7 GB |
| Fecha de creación (metadato) | 2026-10-09 |
| Fecha de actualización (metadato) | 2026-10-12 |

### Etiquetas de clasificacion (13 clases)

| ID | Etiqueta |
|---:|---|
| 0 | account_statement |
| 1 | credit_note |
| 2 | employment_certificate |
| 3 | goods_received_note |
| 4 | inventory_report |
| 5 | invoice |
| 6 | packing_slip |
| 7 | payslip |
| 8 | purchase_order |
| 9 | quote |
| 10 | receipt |
| 11 | shipping_order |
| 12 | work_order |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder BERT base multilingue con vocabulario en minúsculas y sensibilidad a mayúsculas (`bert-base-multilingual-cased`), al que se le anade una cabeza de clasificación lineal para 13 clases. El modelo tiene 12 capas, representación oculta de 768 y no incorpora mecanismos de atención lineal, decodificación especulativa ni componentes de tipo MoE o SSM. Trabaja con truncado a 512 tokens preservando el inicio del documento, batches con padding dinámico y descarte de textos vacíos. No consume PDFs embebidos, imágenes, bounding boxes ni anotaciones de extracción estructurada.

El entrenamiento registrado en el cuaderno del autor usó una única época, learning rate de 3e-5 y batch de entrenamiento de 128, y finalizó en unos 14,5 minutos con un pico de 29,8 GB de memoria de GPU en una A100 de 80 GB. Los splits registrados son 259.497 documentos de entrenamiento (163.994 en inglés y 95.503 en francés), 47.114 de validación y 46.969 de test (9.496 en inglés y 37.473 en francés). El cuaderno describe los splits como agrupados por empresa emisora, con emisores no vistos en validación y test, pero aclara que no audita esa agrupación de forma independiente. Los idiomas se registran mediante el campo `locale`, que se usa para evaluación por idioma y no como entrada del modelo. No se documenta uso de RLHF ni DPO, lo cual es coherente con una tarea de clasificación supervisada.

## Capacidades

- Clasificación monoetiqueta de texto extraído en 13 tipos de documento empresarial: factura, nota de crédito, pedido de compra, presupuesto, recibo, albarán, orden de envío, orden de trabajo, nómina, certificado de empleo, extracto de cuenta, informe de inventario y nota de recepción de mercancía.
- Procesamiento bilingue ingles-frances, con evaluación específica por idioma en el cuaderno de entrenamiento.
- Manejo de documentos largos hasta 512 tokens con truncado del final del texto.
- Integración nativa con el ecosistema Hugging Face: pipeline `text-classification`, etiquetas `text-embeddings-inference` y `endpoints_compatible`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. Es exclusivamente un clasificador discriminativo.
- No genera texto: su salida es una etiqueta y una puntuación.

## Casos de uso

- Enrutado automático en cuentas por pagar: clasificar cada documento entrante como factura, nota de crédito, pedido de compra o presupuesto antes de enviarlo al flujo de aprobación correspondiente. El modelo es adecuado porque su tarea es precisamente esa y el coste de inferencia es bajo.
- Preprocesado para pipelines de extracción: usar la etiqueta predicha como primer paso antes de aplicar extracción de campos con OCR o con un LLM. Clasificar primero reduce el número de prompts o plantillas necesarias y evita aplicar un extractor de facturas a una nómina.
- Gestión documental y archivo (DMS): etiquetar automáticamente repositorios históricos de documentos en inglés y francés para indexarlos por tipo y aplicar políticas de retención.
- Recursos humanos: separar nóminas de certificados de empleo en grandes volúmenes de documentación laboral, con la ventaja de que ambos idiomas están cubiertos por el mismo checkpoint.
- Logística y almacén: distinguir albaranes, notas de recepción de mercancía, órdenes de envío y órdenes de trabajo en flujos de recepción y expedición, donde el documento llega como texto extraído de un escaneo.
- Conciliación financiera: clasificar extractos de cuenta y recibos para separar movimientos bancarios de justificantes de gasto antes de la conciliación.
- Cumplimiento y auditoría interna: inventariar qué tipos documentales circulan por la empresa y detectar categorías ausentes o sobrerrepresentadas en un archivo.
- Empresas con proveedores francófonos: un único modelo cubre documentos en inglés y francés, evitando mantener dos clasificadores separados.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card, sobre el split de test de `AyoubChLin/Company-document-dataset-v2` (configuración `all`). Ninguno está verificado (`verified: false`).

| Metrica | Resultado |
|---|---:|
| Accuracy | 99,9957 % |
| Macro F1 | 99,5094 % |
| Weighted F1 | 99,9957 % |
| Macro precision | 99,8316 % |
| Macro recall | 99,2296 % |
| Accuracy en ingles | 100,0000 % |
| Accuracy en frances | 99,9947 % |
| Tiempo de entrenamiento | ~14,5 minutos |
| Memoria de GPU pico | 29,8 GB |
| Throughput en test | ~1.222 documentos/segundo |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede compararlos porque el modelo no realiza esas tareas. Las cifras de throughput y memoria corresponden a una ejecución concreta con `Trainer.predict` en una única A100 de 80 GB y no garantizan latencia de servicio ni rendimiento en CPU.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 711 MB (177.863.437 parámetros × 4 bytes). En fp16: unos 356 MB. En int8: unos 178 MB. Estimaciones aritméticas a partir del recuento real de parámetros.
- Inferencia en GPU consumer: cabe con holgura en cualquier GPU con 4 GB o más de VRAM, incluidas RTX 3060, RTX 4060, RTX 3070, RTX 4080 y RTX 4090. Con batch pequeno el uso real ronda 1-2 GB incluyendo activaciones.
- Inferencia en CPU: viable para volúmenes moderados, aunque el throughput declarado corresponde a GPU y no se traslada a CPU.
- GPU recomendadas para servicio en producción: NVIDIA T4, L4, A10G, L40S o A100 para alto volumen. El entrenamiento registrado se hizo en una A100 de 80 GB con 29,8 GB de pico por el batch de 128.
- Entrenamiento: requeriría al menos 30 GB de VRAM con la configuración documentada; con batch menor cabría en GPUs de 16-24 GB.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Hugging Face Text Embeddings Inference (el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`, por lo que se puede servir en Inference Endpoints), ONNX Runtime o TorchScript para reducir latencia, y servidores de inferencia genéricos con soporte de modelos de clasificación. vLLM y llama.cpp no son las vías habituales para un BERT de clasificación en safetensors.
- Throughput de referencia: 1.222 documentos/segundo en A100 80 GB con predicción por lotes según el cuaderno del autor. No hay datos de latencia por petición.

## Comparativa con modelos similares

No hay datos verificados de modelos comparables en la información proporcionada más allá del propio modelo base. La siguiente tabla solo recoge lo que se puede afirmar con la información disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AyoubChLin/mBERT-CompanyDocs-v2 | 177,9 M | 512 tokens | Clasificación de 13 tipos de documento (en, fr) | No disponible | Hugging Face, 10 descargas |
| google-bert/bert-base-multilingual-cased (modelo base) | ~178 M (no confirmado en la información proporcionada) | 512 tokens (no confirmado en la información proporcionada) | Enmascarado de lenguaje y ajuste fino posterior | No disponible | Hugging Face, ampliamente adoptado |
| Alternativas de clasificación documental (LayoutLMv3, Donut, DiT, XLM-R fine-tuned) | No disponible | No disponible | Clasificación y comprensión documental | No disponible | No disponible |

Criterio de elección: frente a modelos multimodales de comprensión documental, mBERT-CompanyDocs-v2 es mucho más ligero y barato de servir, pero depende de que el texto ya esté extraído y no aprovecha el layout ni la imagen. Frente a un LLM generativo con prompt de clasificación, es órdenes de magnitud más barato y determinista, pero está limitado a las 13 clases fijas para las que se entrenó y solo cubre inglés y francés.

## Limitaciones y advertencias

- Métricas no verificadas: el `model-index` marca los resultados como `verified: false` y provienen del mismo dataset con el que se entrenó el modelo, no de una evaluación independiente.
- Riesgo de fuga de datos: el autor no aporta auditoría de duplicados ni de leakage. El accuracy de 99,9957 % con una sola época de entrenamiento es un indicio razonable de que el benchmark es poco exigente o de que existe solapamiento entre splits.
- Desajuste en la definición de clases: la propia model card advierte de que el cuaderno contiene un filtro de clases raras no ejecutado que eliminaría cuatro de las 13 etiquetas. Las salidas guardadas muestran 13 clases, pero para el checkpoint descargado hay que tratar `model.config.id2label` como fuente autoritativa y verificarlo antes de usarlo como documentación definitiva.
- Distribución de clases muy desequilibrada: el test registrado incluye 6.807 pedidos de compra frente a solo 10 informes de inventario. Las clases minoritarias tendrán métricas inestables y son las que más caerán con documentos reales.
- Truncado a 512 tokens preservando el inicio: en documentos largos se pierde el final del texto, que puede contener la información discriminante.
- Solo entrada de texto: no procesa PDFs embebidos, imágenes, bounding boxes ni anotaciones estructuradas de extracción. Si el OCR es ruidoso, el rendimiento esperado cae respecto al benchmark, que usa texto ya limpio y presumiblemente con títulos explícitos.
- Cobertura de idiomas limitada: únicamente inglés y francés. No hay soporte documentado de español, alemán, italiano ni portugués, a pesar de que el modelo base es multilingüe.
- Licencia no disponible: no se puede confirmar el uso comercial, la redistribución ni los requisitos de atribución. Es un bloqueo relevante para cualquier integración en producto.
- Adopción prácticamente nula: 10 descargas y 0 likes en el momento de la consulta, sin informes de terceros ni incidencias documentadas.
- Metadatos incoherentes: las fechas de creación y actualización registradas (octubre de 2026) no encajan con la fecha de consulta habitual; conviene verificar los metadatos del repositorio antes de citarlo.
- Al ser un clasificador discriminativo no genera texto y, por tanto, el riesgo de alucinación en el sentido generativo no aplica. El riesgo equivalente son falsos positivos y negativos sobre documentos atípicos o degradados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AyoubChLin/mBERT-CompanyDocs-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/AyoubChLin/Company-document-dataset-v2
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Perfil del autor: https://huggingface.co/AyoubChLin
- Paper o informe tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo o espacio interactivo: no disponible
- Blog del autor: no disponible
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; la busqueda solo devolvio páginas de Netflix sin relación con la ficha.
