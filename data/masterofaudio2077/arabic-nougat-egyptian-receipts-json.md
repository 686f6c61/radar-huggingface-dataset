# masterofaudio2077/arabic-nougat-egyptian-receipts-json

## Resumen

`arabic-nougat-egyptian-receipts-json` es un modelo de visión-lenguaje especializado en OCR estructurado de recibos en árabe egipcio. Lo desarrolla el usuario de Hugging Face `masterofaudio2077` como un fine-tune completo de su modelo previo `arabic-nougat-base-books-ocr`, que a su vez sigue la arquitectura Nougat (vision-encoder-decoder de Meta) adaptada al árabe. El objetivo es convertir la imagen de un recibo en un JSON con campos fijos: comercio, dirección, número de recibo, fecha, total e ítems con nombre, cantidad, precio unitario e importe.

El modelo tiene 348.736.012 parámetros (unos 349 M) y se distribuye en safetensors bajo licencia Apache 2.0. Está entrenado exclusivamente sobre un dataset sintético (`masterofaudio2077/egyptian-receipts-ocr`, CC-BY-4.0), lo que constituye su limitación más importante: la propia model card documenta que en la única foto real probada el modelo falló de forma significativa, inventando campos y omitiendo ítems.

Es relevante ahora porque aborda un nicho poco cubierto (digitalización de tickets y facturas en árabe egipcio con salida JSON directamente consumible por sistemas de contabilidad), pero debe tratarse como un prototipo de investigación más que como una herramienta lista para producción. El propio autor advierte explícitamente de que la validación en imágenes reales es prácticamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (familia Nougat, transformer) |
| Parametros totales | 348.736.012 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas) |
| Idiomas soportados | arabe (ar), con foco en arabe egipcio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,4 GB |
| Pipeline | image-to-text |
| Modelo base | masterofaudio2077/arabic-nougat-base-books-ocr |
| Dataset de entrenamiento | masterofaudio2077/egyptian-receipts-ocr (CC-BY-4.0, sintetico) |
| Fecha de publicacion | 2026-11-19 |

## Arquitectura y entrenamiento

El modelo sigue el esquema Nougat: un encoder visual (tipo Swin Transformer) que procesa la imagen del documento y un decoder autoregresivo de texto que genera la secuencia JSON token a token. Es un fine-tune completo (no LoRA) sobre `arabic-nougat-base-books-ocr`, un modelo previo del mismo autor orientado a OCR de libros en árabe. El decoder se entrena para emitir directamente la estructura JSON con las claves `merchant`, `merchant_en`, `address`, `receipt_no`, `date`, `total` e `items[{name, qty, unit_price, amount}]`, copiando los valores tal como aparecen impresos (incluidos dígitos índicos si los hubiera).

El entrenamiento se realizó sobre el dataset sintético `egyptian-receipts-ocr`, con anotación marcada como `synthetic_exact`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (en un modelo OCR esto sería inusual). La innovación principal es la formulación de la tarea como generación directa de JSON estructurado en lugar de texto plano, lo que simplifica el post-procesado, aunque el autor señala que la validez JSON no garantiza corrección semántica: claves duplicadas o valores inventados siguen produciendo JSON parseable.

## Capacidades

- OCR de recibos en árabe egipcio con salida JSON estructurada y esquema fijo.
- Extracción de campos de cabecera: comercio (en árabe y, cuando existe, en inglés), dirección, número de recibo, fecha y total.
- Extracción de líneas de ítem con nombre, cantidad, precio unitario e importe.
- Preservación de los valores tal como están impresos, incluidos formatos numéricos y dígitos no arábigos orientales.
- Generación de JSON directamente consumible por pipelines de datos (con las salvedades de fiabilidad indicadas).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general (más allá de documentos), audio ni modo thinking.
- Capacidad multilingüe limitada al árabe; el campo `merchant_en` es el único punto de contacto con inglés.

## Casos de uso

- Digitalización de tickets de compra minorista en Egipto: el modelo convierte la foto del ticket en un registro JSON con ítems y totales, adecuado para alimentar un ERP o un sistema de gastos, siempre que se valide manualmente o con reglas de negocio (por ejemplo, comprobar que la suma de importes cuadra con el total).
- Automatización de la contabilidad de pequeños comercios: ingesta por lotes de recibos sintéticos o escaneados en limpio, donde el modelo muestra un CER de página de 0,100 en el subconjunto legible del test.
- Extracción de datos para análisis de precios: agregación de los campos `items` y `amount` para estudiar la cesta de la compra, con la advertencia de que el CER de nombres de ítem es alto (0,358 en legibles) y requiere normalización posterior.
- Generación de datasets de entrenamiento: el modelo puede usarse como etiquetador débil sobre documentos sintéticos o de alta calidad para crear corpus anotados que luego se revisen.
- Prototipado de pipelines de OCR estructurado en árabe: sirve como referencia para evaluar la viabilidad de la tarea antes de invertir en un modelo mayor o en anotación humana.
- Investigación en OCR de documentos árabes: el modelo y su dataset sintético permiten reproducir experimentos sobre la formulación JSON y comparar con enfoques de OCR clásico más post-procesado.
- Integración en aplicaciones móviles de escaneo de recibos: con 349 M de parámetros, el modelo es lo bastante pequeño para desplegarse en servidores modestos o incluso en dispositivos con cuantización, aunque esta no esté publicada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test (decodificación greedy, 433 filas):

| Subconjunto | n | JSON valido | Numeros exactos | CER nombres de item | CER de pagina | Total exacto | Fecha exacta | N.º recibo exacto |
|---|---|---|---|---|---|---|---|---|
| Todos | 433 | 97,5% | 82,9% | 0,414 | 0,124 | 82,7% | 73,1% | 69,3% |
| Legibles (>= 8 px) | 409 | 97,8% | 85,8% | 0,358 | 0,100 | 85,7% | 76,2% | 72,6% |

No se han publicado comparaciones con otros modelos en la información disponible. La única prueba con una foto real (un ticket de restaurante recortado, sin cabecera) falló: el modelo inventó comercio y dirección, omitió 3 de 5 ítems y erró el total (366,45 frente a 296,46 impreso).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB de pesos; en fp16, unos 0,7 GB. El encoder visual añade una sobrecarga moderada según la resolución de imagen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (GTX 1650, RTX 3050 en adelante). Para lotes grandes o fp32, se recomienda RTX 3060/4060 o superior.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3090, RTX 4070, e incluso en iGPU con suficiente memoria compartida para una sola imagen.
- Opciones de despliegue: `transformers` (librería nativa, con `AutoProcessor` y `AutoModelForVision2Seq`), y potencialmente vLLM o TGI si se convierte el modelo a sus formatos; llama.cpp y Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (349 M) se espera una latencia de decodificación baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arabic-nougat-egyptian-receipts-json | 349 M | no disponible | OCR de recibos árabes a JSON | Apache 2.0 | Hugging Face |
| Nougat (Meta) | ~350 M (base) | no disponible | OCR de papers científicos a Markdown | MIT (según versión) | Hugging Face |
| Donut (Clova AI) | ~200 M | no disponible | OCR de documentos a JSON configurable | MIT | Hugging Face |
| arabic-nougat-base-books-ocr | no disponible | no disponible | OCR de libros árabes | no disponible | Hugging Face |

La comparación con Nougat y Donut es conceptual: ambos son vision-encoder-decoder para documentos, pero ninguno está especializado en recibos árabes egipcios ni en el esquema JSON concreto de este modelo. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintético: el dataset `egyptian-receipts-ocr` está marcado como `synthetic_exact`, sin verificación sobre datos reales. El propio autor reconoce que la única foto real probada falló.
- Alucinación documentada: el modelo inventó un comercio y una dirección que no aparecían en la imagen, y generó claves duplicadas (`address` tres veces).
- Omisión de ítems: en la prueba real solo recuperó 2 de 5 líneas de ítem.
- Errores en totales: el total devuelto (366,45) no coincidía con el impreso (296,46), pese a que la tasa de "total exacto" en test sintético es del 82,7%.
- La validez JSON (97,5%) no es un indicador fiable de corrección: claves duplicadas y valores inventados siguen produciendo JSON parseable.
- CER alto en nombres de ítem (0,358 en legibles), lo que limita su uso para análisis de productos sin normalización o revisión humana.
- Sensibilidad a condiciones de imagen: el entrenamiento usa recibos de página completa, limpios y con cabecera; fotos borrosas, inclinadas, recortadas o con iluminación desigual degradan gravemente el rendimiento.
- Idiomas: solo árabe (egipcio); no se documenta soporte para otros dialectos ni para árabe estándar moderno fuera del dominio de recibos.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación en datos reales hace desaconsejable su uso en producción sin un sistema de verificación posterior (cuadre de sumas, validación de esquema, revisión humana).
- Sin cuantizaciones publicadas ni soporte documentado en llama.cpp, Ollama o vLLM.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/arabic-nougat-egyptian-receipts-json
- Modelo base: https://huggingface.co/masterofaudio2077/arabic-nougat-base-books-ocr
- Dataset de entrenamiento: https://huggingface.co/datasets/masterofaudio2077/egyptian-receipts-ocr
- Ejemplo de imagen real: https://huggingface.co/masterofaudio2077/arabic-nougat-egyptian-receipts-json/blob/main/examples/real_0.jpg
- Nougat (Meta), arquitectura de referencia: https://huggingface.co/facebook/nougat-base
- Donut (Clova AI), alternativa de OCR a JSON: https://huggingface.co/naver-clova-ix/donut-base
