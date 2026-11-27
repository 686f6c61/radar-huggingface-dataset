# Holocortex/Smith-Pincette-Pages

## Resumen

Smith-Pincette-Pages v0.5 es un modelo de extracción de información y clasificación de documentos orientado al ciclo order-to-invoice de equipos de compras y cuentas a pagar. Lo desarrolla Holocortex y se distribuye como un encoder `jhu-clsp/mmBERT-small` (141,5 M de parámetros) con cabeceras de extracción propias. El modelo recibe el texto de una página, identifica de qué tipo de documento se trata (9 categorías: factura, nota de abono, albarán, solicitud de oferta, datasheet de componente electrónico, declaración ambiental de producto, confirmación de pedido, pedido de compra y «otro») y devuelve los campos relevantes como spans con offsets de caracteres.

La propuesta de valor es concreta: 153 campos definidos repartidos por tipo de documento, salida estructurada con puntuaciones por campo y ejecución totalmente local sobre ONNX Runtime (CPU o GPU CUDA). Esto lo hace atractivo para pipelines de digitalización documental donde no se quiere enviar texto sensible a una API externa.

Se trata de una versión preview (v0.5), con API y modelo sujetos a cambios, licencia Apache-2.0 y un repositorio de 0,6 GB. Es relevante ahora porque cubre un hueco poco atendido: la extracción de campos específicos de la cadena de suministro industrial (incoterms, códigos HS, números UN, SSCC, referencias de plano, especificaciones de tolerancia) frente a modelos genéricos de facturación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-small) con cabeceras de extracción de spans y clasificación de tipo de documento |
| Parametros totales | 141,5 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Procesamiento en ventanas de 2.048 tokens con solapamiento de 256 tokens; entrada de longitud arbitraria |
| Tipos de cuantizacion | No disponible (pesos distribuidos en ONNX; se desconoce si hay variantes cuantizadas publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime en CPU o CUDA) |
| Modelo base | jhu-clsp/mmBERT-small |
| Tipos de documento | 9 |
| Campos extraíbles | 153 (cada tipo devuelve solo los suyos) |
| Tarea (pipeline) | token-classification / span-extraction |

## Arquitectura y entrenamiento

El modelo parte del encoder `jhu-clsp/mmBERT-small`, un transformer de 141,5 M de parámetros, sobre el que Holocortex añade cabeceras específicas para dos tareas: clasificación del tipo de documento y extracción de spans con offsets de caracteres. La salida de campos es de tipo `(start, end, label, score, text, page)`, lo que permite reconstruir la ubicación exacta de cada valor en el texto original y mapearlo a la página correspondiente en documentos multipágina.

La entrada se procesa en ventanas de 2.048 tokens con 256 tokens de solapamiento, lo que permite manejar páginas o documentos de cualquier longitud manteniendo coherencia en los límites. El modelo opera exclusivamente sobre texto: para PDFs nativos se usa la capa de texto y para escaneos es necesario aplicar OCR previo (el autor cita Docling con RapidOCR), de modo que la calidad final depende del OCR.

No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones de decodificación o atención más allá del esquema de ventanas con solapamiento.

## Capacidades

- Clasificación de tipo de documento entre 9 categorías con puntuaciones de confianza.
- Extracción de spans de texto con offsets de caracteres, etiqueta, puntuación y número de página.
- Extracción de 153 campos organizados por tipo: partes y referencias (37), factura y nota de abono (22), albarán (16), cadena de pedido (24), solicitud de oferta (16), datasheet (20) y EPD (18).
- Filtrado de campos por subconjunto mediante `extract(text, labels={...})`.
- Acceso a definiciones de campo mediante `model.definitions[label]`.
- Procesamiento de documentos multipágina con seguimiento de página por campo.
- Ejecución totalmente local sobre ONNX Runtime, en CPU o GPU CUDA.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo de extracción, no un LLM generativo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de cuentas a pagar: el modelo clasifica facturas y notas de abono y extrae número de factura, fechas, totales, tipos de IVA, IBAN y BIC, lo que permite alimentar el ERP sin intervención manual y con trazabilidad por offset de texto.
- Conciliación de la cadena pedido-albarán-factura: al extraer `order_number`, `delivery_note_reference` y `invoice_number` de cada tipo documental, se puede cruzar automáticamente la tríada de documentos y detectar discrepancias de importe o cantidad.
- Gestión de albaranes y logística: extracción de transportista, número de seguimiento, SSCC, pesos bruto y neto, número de bultos y fechas de envío para integrarlos en sistemas TMS o WMS.
- Digitalización de solicitudes de oferta en compras técnicas: extracción de número de plano, revisión, grado de material, tolerancias, volumen anual y precio objetivo, campos que los extractores genéricos de facturas no cubren.
- Procesamiento de datasheets de componentes electrónicos: extracción de código de pedido, número de pines, valores mín./típ./máx. de parámetros, nivel MSL y estado RoHS/REACH para enriquecer catálogos de componentes.
- Cumplimiento ambiental y declaraciones EPD: extracción de número de registro, verificador, unidad declarada, límites del sistema y valores de indicadores de ciclo de vida para informes de sostenibilidad y auditorías.
- Procesamiento por lotes en local con requisitos de privacidad: al ejecutarse sobre ONNX Runtime sin llamadas externas, es apto para entornos donde el texto de facturas y contratos no puede salir de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 141,5 M de parámetros, la inferencia en FP32 requiere del orden de 0,6 GB de memoria para los pesos, más el estado de activaciones de las ventanas de 2.048 tokens.
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GB de memoria libre debería ser suficiente; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- GPU de consumo: por tamaño, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060 en adelante); también está pensado para ejecución en CPU.
- Despliegue: ONNX Runtime (CPU o CUDA) mediante la librería `smith-pincette` (`pip install "git+https://github.com/holocortex/Smith-Pincette-Models@v0.55.2"`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un encoder de extracción.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Smith-Pincette-Pages v0.5 | 141,5 M | Encoder + cabeceras de spans | Ventanas de 2.048 tokens, longitud arbitraria | Apache-2.0 | Cadena order-to-invoice industrial, 153 campos |
| LayoutLMv3 (referencia genérica) | ~133 M (base) | Multimodal texto+layout | 512 tokens típico | MIT / CC BY-NC-SA según variante | Comprensión de documentos con layout |
| Donut (referencia genérica) | ~200 M | Encoder-decoder imagen→texto | Limitado por imagen | MIT | Parsing de documentos sin OCR |
| LiLT (referencia genérica) | ~90 M | Texto+layout independiente del idioma | 512 tokens típico | MIT | Comprensión de documentos |

No se dispone de datos de rendimiento comparativo entre Smith-Pincette-Pages y estas alternativas en la información proporcionada; la comparación se limita a características estructurales. Smith-Pincette-Pages se diferencia por operar solo sobre texto (requiere OCR externo para escaneos) y por su catálogo de campos específicos del sector industrial, frente al enfoque multimodal de LayoutLMv3 o Donut.

## Limitaciones y advertencias

- Versión preview (v0.5): el autor advierte explícitamente de que el modelo y la API pueden cambiar, con posibles asperezas de funcionamiento.
- Solo procesa texto: no lee píxeles. En escaneos o fotografías la calidad depende por completo del OCR previo.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe sin verificación.
- Riesgo de alucinación de spans: al ser un modelo de extracción, puede asignar etiquetas a texto que no corresponde al campo, especialmente con layouts atípicos u OCR ruidoso.
- Sesgos: no se documentan sesgos conocidos, pero el modelo está entrenado para documentos empresariales europeos/industriales y puede degradarse con formatos de otras regiones.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión o recall que permita estimar el rendimiento en producción.
- Dependencia de la librería `smith-pincette` y de una revisión concreta (`v0.5`); la instalación se hace desde GitHub, no desde PyPI, lo que añade fricción operativa.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales conocidas, pero al ser una preview conviene revisar la licencia de revisiones futuras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Holocortex/Smith-Pincette-Pages
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Repositorio de la librería: https://github.com/holocortex/Smith-Pincette-Models
- Docling (OCR recomendado por el autor): https://github.com/docling-project/docling
