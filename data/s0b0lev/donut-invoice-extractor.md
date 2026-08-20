# S0B0LEV/donut-invoice-extractor

## Resumen

El modelo `S0B0LEV/donut-invoice-extractor` es un ajuste fino (fine-tune) del modelo base `naver-clova-ix/donut-base`, desarrollado por el usuario S0B0LEV y publicado en Hugging Face. Está diseñado para la extracción de información estructurada a partir de imágenes de facturas, utilizando una arquitectura vision-encoder-decoder que no requiere OCR previo. El modelo tiene 202 millones de parámetros y se distribuye bajo licencia MIT, lo que permite su uso comercial sin restricciones.

La relevancia de este modelo radica en su capacidad para automatizar el procesamiento de documentos financieros, un caso de uso habitual en entornos empresariales. Al estar basado en Donut, hereda la capacidad de entender documentos visuales de forma end-to-end, combinando un encoder Swin con un decoder transformer. Sin embargo, la información pública sobre el dataset de entrenamiento, los idiomas soportados y los resultados de evaluación es muy limitada, lo que dificulta una validación independiente de su rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (Swin encoder + transformer decoder) |
| Parametros totales | 202.054.072 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (procesa imágenes, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `naver-clova-ix/donut-base`, que emplea la arquitectura Donut: un encoder basado en Swin Transformer para procesar imágenes y un decoder transformer autoregresivo que genera secuencias de texto estructurado (por ejemplo, JSON). Esta arquitectura permite la comprensión de documentos sin necesidad de un paso OCR separado, ya que el modelo aprende a mapear directamente píxeles a texto.

Según la model card, el entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 5e-05, batch size de entrenamiento de 1 (con acumulación de gradientes de 4, resultando en un batch efectivo de 4), optimizador AdamW con betas (0.9, 0.999), scheduler lineal, 3 épocas y precisión mixta nativa. El dataset de entrenamiento no se especifica, lo que impide conocer la composición y el volumen de datos utilizados. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Extracción de campos estructurados de imágenes de facturas (proveedor, cliente, importes, líneas de detalle, etc.) mediante generación de texto en formato JSON.
- Comprensión de documentos visuales sin OCR previo, gracias a la arquitectura end-to-end de Donut.
- Generación de texto a partir de imágenes, con soporte para el pipeline `image-text-to-text` de Transformers.
- Capacidad de adaptación a otros tipos de documentos (recibos, albaranes) si se reentrena con datos adecuados, aunque no hay evidencia de ello en este modelo concreto.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües específicas.

## Casos de uso

- Automatización de contabilidad: el modelo puede extraer automáticamente datos clave de facturas escaneadas (número de factura, fecha, importe total, IVA) para integrarlos en sistemas de gestión contable, reduciendo la entrada manual de datos.
- Procesamiento de cuentas por pagar: en un flujo de aprobación de facturas, el modelo puede clasificar y extraer la información necesaria para validar y registrar pagos, acelerando el ciclo de aprovisionamiento.
- Digitalización de archivos históricos: permite convertir facturas en papel o PDF escaneado a datos estructurados, facilitando la búsqueda y el análisis posterior en bases de datos.
- Integración en sistemas ERP: mediante una API que reciba imágenes y devuelva JSON, el modelo puede conectarse a plataformas como SAP u Oracle para alimentar módulos de compras y finanzas.
- Verificación de facturas: comparar los campos extraídos con los datos de una orden de compra para detectar discrepancias o fraudes, automatizando la conciliación.
- Asistentes de gestión documental: en aplicaciones de chat o bots, el modelo puede procesar imágenes de facturas enviadas por usuarios y responder con un resumen estructurado de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de resultados de entrenamiento vacía y el modelo no presenta métricas en el índice de modelos de Hugging Face. Por tanto, no es posible comparar su rendimiento con otros modelos de extracción de facturas de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: con 202 millones de parámetros, el modelo en precisión fp16 ocupa aproximadamente 400 MB de memoria. Con cuantización a 8 bits, podría reducirse a unos 200 MB. Estas son estimaciones orientativas, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16. Una RTX 3060 o superior sería suficiente para inferencia con lotes pequeños. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3080, A10).
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo como la serie RTX 30/40, incluso en versiones con poca memoria si se usa cuantización.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI o mediante una API FastAPI. También es posible exportarlo a TorchScript o convertirlo a GGUF para ejecutarlo con llama.cpp, aunque no hay instrucciones específicas del autor.
- Latencia y throughput: no se dispone de datos medidos. Para una imagen de factura típica, se espera una latencia de decenas a cientos de milisegundos en una GPU moderna, dependiendo de la longitud de la secuencia generada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de extracción de facturas. Existen otros fine-tunes de Donut en Hugging Face, como `invoice-extraction-lab/donut` o `VVVVL/donut_invoice_extraction_model`, pero no se conocen sus métricas ni especificaciones detalladas. El modelo base `naver-clova-ix/donut-base` tiene la misma arquitectura y tamaño, pero no está especializado en facturas. Alternativas como LayoutLM o PaddleOCR podrían ofrecer capacidades similares, pero requieren un pipeline OCR y no son directamente comparables sin datos de evaluación.

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido, lo que impide evaluar la generalización del modelo a distintos formatos de factura, idiomas o regiones.
- No hay información sobre sesgos o alucinaciones específicas. Como modelo generativo, puede producir campos incorrectos o inventados si la imagen es ambigua o de baja calidad.
- La longitud de contexto no está documentada; al procesar imágenes, el límite depende del tamaño de la imagen y del encoder Swin, no de una ventana de texto.
- No se especifican los idiomas soportados. Es probable que el modelo funcione mejor en el idioma del dataset de entrenamiento, pero no se puede confirmar.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento no infrinjan derechos de terceros, ya que el autor no ha declarado su procedencia.
- Para producción, se recomienda validar el modelo con un conjunto de facturas representativo antes de desplegarlo, dado que no hay benchmarks públicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/S0B0LEV/donut-invoice-extractor
- Repositorio de referencia (no oficial): https://github.com/harshitlakum/donut-invoice-extractor
- Proyecto similar: https://github.com/hishammohamed445/Donut-Invoice-Intelligence
- Modelo base: https://huggingface.co/naver-clova-ix/donut-base
