# Ajay0007/receipt-extractor-qwen3-0.6b

## Resumen

receipt-extractor-qwen3-0.6b es un modelo de lenguaje especializado en la extracción de información estructurada a partir del texto OCR de tickets de compra. Lo desarrolla el usuario Ajay0007 y parte de un ajuste fino completo del modelo base Qwen/Qwen3-0.6B, con 596 millones de parámetros. Su función concreta es transformar el texto plano devuelto por un motor de OCR en un objeto JSON compacto con las líneas de artículo, subtotal, impuestos, servicio, descuento y total.

El modelo está pensado para ejecutarse en el propio dispositivo del usuario (Android o iOS) dentro de aplicaciones de reparto de gastos tipo Splitwise: el teléfono captura la foto, el OCR local extrae el texto y el modelo lo convierte en JSON para que la aplicación reparta la cuenta por artículos. Para ello se distribuye no solo en formato transformers y safetensors, sino también como un binario int8 de 613 MB para el runtime LiteRT-LM de Google.

Su relevancia radica en la combinación de tamaño reducido, licencia Apache 2.0 y soporte de despliegue on-device, lo que permite procesar datos financieros sensibles sin enviarlos a la nube. Incluye además utilidades auxiliares en el repositorio (construcción del prompt, agrupación de cajas OCR en líneas, análisis del JSON y verificación de sumas) que facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el build LiteRT-LM usa KV cache de 1024 tokens y prefill de 256) |
| Tipos de cuantizacion | int8 (pesos int8, activaciones fp32) para LiteRT-LM; pesos originales en safetensors |
| Idiomas soportados | en, id, de, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y model.litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) del transformer decoder-only Qwen3-0.6B, sin modificaciones arquitectónicas indicadas en la información disponible. El entrenamiento se centra en una tarea única: dado un prompt con el texto OCR de un ticket (una línea visual por fila, con los tokens ordenados de izquierda a derecha), generar un JSON con la estructura `{"items":[{"name","qty","price"}], "subtotal", "tax", "service", "discount", "total"}`.

Los datos de entrenamiento provienen de dos conjuntos públicos de tickets: CORD-v2 (split de entrenamiento, 800 tickets, Indonesia, indonesio e inglés, rupias) y WildReceipt. La model card detalla los campos etiquetados utilizados (artículos, complementos con precio, subtotal, impuestos, servicio, descuento y total). No se especifica en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO. El modelo se entrenó sin bloque de razonamiento (thinking), por lo que debe usarse con `enable_thinking=False` y decodificación greedy.

Como innovación práctica, el repositorio incluye la función `ocr_boxes_to_text`, que replica la agrupación de cajas OCR en líneas visuales empleada para construir los datos de entrenamiento, y una comprobación de sumas (`sum_check`) que actúa como señal de confianza: según la model card, los tickets que la superan fueron correctos en aproximadamente el 89 % de los casos, frente al 25 % de los que la fallan.

## Capacidades

- Extracción de información estructurada: convierte texto OCR de tickets en JSON con artículos, cantidades, precios, subtotal, impuestos, servicio, descuento y total.
- Generación de texto y JSON compacto con decodificación greedy determinista.
- Procesamiento multilingüe limitado a inglés, indonesio, alemán y francés.
- Integración con pipelines de OCR locales (Google ML Kit, Apple Vision, PaddleOCR).
- Ejecución on-device mediante el runtime LiteRT-LM (Android, iOS, escritorio) con el binario int8 incluido.
- Utilidades auxiliares en el repositorio: construcción del prompt, agrupación de cajas OCR, análisis de la salida y verificación de sumas.
- No se indica soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Reparto de cuentas por artículo en aplicaciones móviles: el modelo recibe el texto OCR de la foto del ticket y devuelve el JSON con cada línea y su precio, que la aplicación usa para asignar artículos a comensales; encaja por su tamaño reducido y su formato de despliegue LiteRT-LM.
- Procesamiento de gastos sin conexión: al ejecutarse en el dispositivo con el binario int8 de 613 MB, permite extraer datos de tickets en entornos sin red y evita enviar información financiera a servidores externos.
- Digitalización de tickets para hojas de gastos corporativas: el JSON generado puede volcarse a un sistema de contabilidad o a una hoja de cálculo, usando la comprobación de sumas para marcar los tickets que requieren revisión manual.
- Validación automática de tickets en flujos de reembolso: la función `sum_check` sirve como filtro de calidad; los tickets que superan la comprobación se aceptan automáticamente y los que fallan se derivan a revisión humana.
- Extracción de líneas de detalle en aplicaciones de finanzas personales: el modelo separa artículos, impuestos y propinas para categorizar el gasto con más granularidad que un simple total.
- Prototipado rápido de pipelines OCR + LLM: al estar disponible en transformers con safetensors y utilidades incluidas, permite montar un servicio de extracción en Python y comparar su salida con la del binario on-device antes de portar la lógica a Kotlin o Swift.
- Aplicaciones de escaneo de tickets en comercios con clientes en Indonesia, Alemania o Francia: el soporte de indonesio, alemán y francés, junto con el entrenamiento sobre CORD-v2, cubre tickets en esas lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que el build int8 de LiteRT-LM produjo JSON correcto en 4 de 5 tickets de prueba de humo, que la latencia esperada en dispositivo es de aproximadamente 1,5 a 3 segundos por ticket y que no se completó un benchmark formal de precisión ni de latencia.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original: en torno a 1,2 GB para los pesos en fp16 y aproximadamente 2,4 GB en fp32, sin contar la caché KV.
- VRAM estimada con el build int8 de LiteRT-LM: 613 MB para los pesos.
- GPU recomendadas para servicio en servidor: cualquier GPU con al menos 4 GB de memoria, como RTX 3050, RTX 4060 o superiores; para alto throughput, A10, L4, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM; el binario int8 está pensado para ejecutarse en CPU de teléfonos Android e iOS.
- Opciones de despliegue: transformers (Python), LiteRT-LM con API Python, Kotlin (Android) y Swift (iOS), aplicación Google AI Edge Gallery para pruebas en teléfono, y text-generation-inference según las etiquetas del repositorio. No se indica soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: la model card estima 1,5 a 3 segundos por ticket en dispositivo con int8; no hay datos de throughput en servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| receipt-extractor-qwen3-0.6b | 596 M | no disponible | Apache 2.0 | Extracción de tickets a JSON, on-device | Hugging Face, LiteRT-LM |
| Qwen/Qwen3-0.6B (base) | 596 M | no disponible en la información | Apache 2.0 | Modelo generalista de texto | Hugging Face |
| Alternativas especializadas en extracción de documentos | no disponible | no disponible | no disponible | Extracción de información de documentos | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de otros modelos especializados en extracción de tickets que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El modelo solo procesa texto OCR: no incluye capacidades de visión, por lo que la calidad depende por completo del motor de OCR previo y del formato de entrada (una línea visual por fila).
- Requiere usar exactamente el prompt generado por `build_prompt` y decodificación greedy; desviarse del formato de entrenamiento puede degradar la salida.
- Debe ejecutarse con `enable_thinking=False`; el modelo no fue entrenado con bloque de razonamiento.
- En el runtime LiteRT-LM es imprescindible pasar el `litert_chat_template.jinja` incluido, ya que la plantilla del conversor añade un system prompt que hace que el modelo ignore la tarea.
- Cobertura lingüística limitada a inglés, indonesio, alemán y francés; no se indica soporte de español.
- Riesgo de alucinación en campos ausentes o mal segmentados por el OCR; la comprobación de sumas mitiga parcialmente este riesgo, pero no lo elimina.
- El modelo se entrenó principalmente con tickets de Indonesia (CORD-v2) y datos de WildReceipt, por lo que puede generalizar peor con formatos de ticket de otras regiones.
- No se han publicado evaluaciones formales de precisión ni de latencia; el 4 de 5 en las pruebas de humo del build int8 es una muestra muy reducida.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento (CORD-v2 es CC-BY-4.0) si se redistribuye el modelo.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica que no cuenta aún con validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ajay0007/receipt-extractor-qwen3-0.6b
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Aplicación Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Paquete litert-torch: https://pypi.org/project/litert-torch/
- Dataset CORD-v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Dataset WildReceipt: https://huggingface.co/datasets/podbilabs/wildreceipt-donut
- Hilo de Reddit sobre OCR + LLM para extracción de facturas: https://www.reddit.com/r/LocalLLaMA/comments/1jcm5p2/ocr_llm_for_invoice_extraction/
