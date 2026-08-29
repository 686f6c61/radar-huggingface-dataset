# aijadugar/receipt-field-extractor

## Resumen

`aijadugar/receipt-field-extractor` es un modelo especializado en la extracción de campos estructurados de recibos (empresa, fecha, dirección y total) mediante un patrón de fusión nativa denominado *Interfaze*. En lugar de encadenar un OCR externo con un modelo de lenguaje, un encoder perceptual CRNN (CNN + BiLSTM + CTC) escribe directamente en el espacio de embeddings que lee un decoder transformer de 4 capas, que genera un objeto JSON con los campos solicitados y metadatos por palabra (cajas delimitadoras y confianza). El modelo ha sido desarrollado por aijadugar (Ankit Bari) y está publicado en Hugging Face Hub con pesos en formato safetensors.

Con solo 7.525.341 parámetros, este modelo es extremadamente ligero y puede ejecutarse en CPU sin necesidad de GPU para inferencia, lo que lo hace adecuado para despliegues en entornos con recursos limitados o en el edge. Su relevancia radica en demostrar un enfoque de fusión nativa entre percepción y lenguaje, donde el encoder no se invoca como herramienta separada sino que alimenta directamente la memoria del decoder, reduciendo latencia y complejidad de integración. El entrenamiento se realizó desde cero sobre un generador sintético de recibos en Kaggle, con la opción de sustituirlo por el dataset real SROIE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN (CNN + BiLSTM + CTC) como encoder + adapter lineal con proyeccion de posicion de caja + decoder transformer causal de 4 capas con cross-attention |
| Parametros totales | 7.525.341 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada a los tokens de memoria OCR generados por el encoder) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (los nombres de campo estan en ingles; el entrenamiento usa datos sinteticos, probablemente ingles, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` + `config.json`) |

## Arquitectura y entrenamiento

El modelo implementa el patron *Interfaze* de fusion nativa: un encoder CRNN procesa la imagen del recibo y produce caracteristicas que, tras pasar por un adapter lineal con proyeccion de posicion de caja, se incorporan a un espacio de embeddings compartido de 256 dimensiones. Un decoder transformer de 4 capas realiza cross-attention sobre esos tokens de memoria OCR y genera la salida estructurada en JSON: `{"company": ..., "date": ..., "address": ..., "total": ...}` junto con un array `precontext` que contiene las cajas delimitadoras y las confianzas de cada palabra. El encoder CRNN se entrena desde cero con perdida CTC sobre recortes de palabras de recibos.

El entrenamiento se ejecuta en Kaggle con GPU T4 x2, utilizando un generador sintetico de recibos integrado en el notebook, sin necesidad de dataset externo (aunque se puede sustituir por SROIE). Durante el entrenamiento se emplea un kernel CUDA fusionado personalizado que combina RMSNorm y suma residual; en inferencia, `app.py` utiliza un fallback en PyTorch puro algebraicamente identico, lo que permite ejecutar el modelo en CPU sin GPU. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- Extraccion de campos estructurados de recibos: empresa, fecha, direccion y total, con salida en JSON.
- OCR integrado mediante CRNN que escribe directamente en el espacio de embeddings del decoder, sin pipeline separado.
- Metadatos por palabra: bounding boxes y confianza en el campo `precontext`.
- Inferencia en CPU gracias al fallback PyTorch puro para el kernel CUDA.
- Despliegue sencillo mediante aplicacion Gradio incluida (`app.py`).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, vision general ni soporte multilingue explicito.

## Casos de uso

- Automatizacion de contabilidad: extraer total, fecha y empresa de recibos escaneados para introducirlos automaticamente en sistemas de contabilidad, reduciendo la entrada manual de datos.
- Gestion de gastos de empresa: procesar recibos de empleados para reembolsos, clasificando proveedor, fecha e importe de forma estructurada.
- Digitalizacion de archivos: convertir recibos en papel a registros digitales con campos normalizados, facilitando la busqueda y el archivado.
- Aplicaciones de finanzas personales: escanear recibos con el movil y registrar gastos automaticamente, gracias a su tamano reducido que permite ejecucion en dispositivos con recursos limitados.
- Verificacion de facturas: comparar el total extraido con el importe declarado en sistemas de compras para detectar discrepancias.
- Procesamiento en puntos de venta: capturar datos de compra en tiempo real para inventario o analisis, con latencia minima al no requerir GPU.
- Conciliacion bancaria: cruzar los datos extraidos de recibos con movimientos bancarios para validar transacciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 7,5 millones de parametros, en FP32 ocupa aproximadamente 30 MB y en FP16 unos 15 MB, por lo que cabe en cualquier GPU, incluso integradas.
- GPU recomendadas: no se requiere GPU para inferencia; una CPU basica es suficiente segun la documentacion del autor.
- Compatibilidad con GPU de consumo: si, cualquier GPU moderna (RTX, GTX, incluso integradas) puede ejecutar el modelo sin problemas.
- Opciones de despliegue: aplicacion Gradio local, Hugging Face Spaces (plan CPU gratuito), o integracion en pipelines propios mediante Python.
- Latencia y throughput: no disponibles, pero dado el tamano del modelo, se espera una latencia muy baja en CPU (del orden de milisegundos por imagen, aunque no se aportan mediciones).

## Comparativa con modelos similares

No se dispone de datos de modelos comparables especificos para esta tarea. Existen soluciones comerciales como Azure Document Intelligence para extraccion de recibos, pero no se han publicado comparativas con este modelo. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos, por lo que puede no generalizar bien a recibos reales con formatos, idiomas o calidades de imagen muy variados.
- Solo extrae cuatro campos (empresa, fecha, direccion y total); no cubre otros datos habituales como IVA, numero de ticket o metodo de pago.
- Idiomas soportados no especificados; los nombres de campo estan en ingles y el generador sintetico probablemente produce recibos en ingles, limitando su uso a ese idioma.
- Licencia no disponible, lo que impide determinar si es posible su uso comercial sin autorizacion explicita del autor.
- No se ofrecen cuantizaciones, por lo que el despliegue en entornos muy restringidos de memoria podria requerir conversion manual.
- Riesgo de alucinacion en los campos si el OCR falla o la imagen es de baja calidad, ya que el decoder puede generar valores plausibles pero incorrectos.
- El kernel CUDA fusionado es solo para entrenamiento; en inferencia se usa un fallback, pero no hay impacto funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aijadugar/receipt-field-extractor
- Repositorio GitHub: https://github.com/aijadugar/MiniInterfaze
- Perfil del autor en Hugging Face: https://huggingface.co/aijadugar
