# nuetzliches/veilq-signature-v4

## Resumen

veilq-signature-v4 es un detector de firmas manuscritas en imagenes de documentos, capturas de pantalla y fotografias. Lo desarrolla nuetzliches como fine-tune de `mdefrance/yolos-tiny-signature-detection` (Apache-2.0) y se distribuye unicamente en formato ONNX para su uso dentro de la herramienta veilq (ADR-0048), que rellena de negro las firmas detectadas para anonimizar documentos.

El modelo parte de la arquitectura YOLOS-tiny, un transformer de deteccion de objetos de 6 millones de parametros, y se ha reentrenado para reducir los falsos positivos del modelo base: titulares impresos, marcas de agua diagonales, sellos, logotipos y valores manuscritos en formularios que el modelo original confundia con firmas. La entrada es fija (640x640, float32) y la salida son 100 cajas candidatas con dos clases (firma / nada).

Su relevancia es practica: es un componente de preprocesado para pipelines de redaccion de datos personales, no un modelo generativo. La ficha describe un detector especializado de un solo dominio, con licencia permisiva y un tamano que permite ejecucion en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOS-tiny (transformer de deteccion de objetos, ViT con cabecera de deteccion) |
| Parametros totales | 6 M (aproximado, derivado de YOLOS-tiny) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija 640x640) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `model.onnx` en float32) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17); SHA-256 de `model.onnx`: `2e2ae2ecfacd5c74aede5524f7142f3fb89ba4a9afa1d0a6f1c9d3891acf0c80` |

## Arquitectura y entrenamiento

La arquitectura es YOLOS-tiny, un transformer tipo ViT adaptado a deteccion de objetos sin necesidad de anchors ni NMS en la cabeza original. La entrada `pixel_values` es float32 de forma `[1, 3, 640, 640]`, RGB escalada a 0..1 y normalizada con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]`. Las salidas son `logits` de forma `[1, 100, 2]` (firma / nada, con softmax) y `pred_boxes` de forma `[1, 100, 4]` (centro x, centro y, ancho y alto como proporciones de la entrada).

El fine-tune se hizo sobre 8.000 imagenes sinteticas durante 24 epocas en GPU, con batch 16 y AdamW a 2e-5. Se congelaron los patch embeddings y las 6 primeras de las 12 capas del encoder. La mejor epoca (23) se selecciono sobre 800 imagenes sinteticas reservadas, maximizando el recall medio por tipo de imagen con firmas y penalizando cajas falsas por imagen. El conjunto de datos combina cartas sinteticas, capturas de pantalla, cartas fotografiadas sobre un escritorio, paginas web, fotos firmadas en su cara, formularios rellenados a mano, texto impreso y 484 fotografias de Wikimedia Commons (CC0 o dominio publico) sin personas ni escritura, revisadas a mano. Se usan fuentes manuscritas de google/fonts (OFL o Apache-2.0) y trazos dibujados; nombres y lugares son inventados.

## Capacidades

- Deteccion de firmas manuscritas en documentos escaneados, capturas de pantalla y fotografias.
- Deteccion de firmas escritas sobre una fotografia (foto firmada en su cara).
- Deteccion de firmas en tarjetas de fotos firmadas dentro de paginas web.
- Distincion entre firma y valores manuscritos en formularios rellenados a mano (nombres, importes), aunque con falsos positivos residuales.
- Rechazo de texto impreso: titulares grandes y lineas con guiones en fuentes sans, de 14 a 40 px, en claro sobre oscuro y viceversa.
- Rechazo de marcas de agua diagonales, sellos y logotipos.
- Salida de hasta 100 cajas con puntuacion de confianza por clase.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector de vision puro.

## Casos de uso

- Redaccion de firmas en expedientes: el modelo localiza las firmas en documentos escaneados y veilq las rellena de negro antes de archivar o compartir el PDF, reduciendo la exposicion de datos biometricos.
- Anonimizacion de formularios manuscritos: en formularios con etiquetas impresas y valores escritos a mano, el detector identifica solo la firma que esta sobre la linea habilitada y evita tapar los valores, que en v3 se confundian con firmas.
- Preprocesado de capturas de pantalla y paginas web: al descartar titulares impresos y lineas con guiones, permite procesar capturas de portales sin generar cajas falsas sobre texto.
- Tramitacion de fotos firmadas: detecta firmas escritas sobre fotografias de carnet o tarjetas escaneadas, un caso que el modelo base no cubria bien.
- Cumplimiento de proteccion de datos en pipelines documentales: integrado como paso previo a OCR o a clasificacion, elimina firmas antes de que el texto pase a sistemas de terceros.
- Verificacion de presencia de firma: en flujos de validacion documental, la puntuacion de la clase firma sirve como indicador de que un documento esta firmado, sin necesidad de leer la firma.
- Procesado por lotes en CPU: al ser un modelo de 6 M de parametros en ONNX, puede ejecutarse en servidores sin GPU para lotes grandes de documentos, con la latencia dominada por el preprocesado de imagen.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 800 imagenes sinteticas reservadas (523 firmas), leidas con el pipeline de veilq en ONNX Runtime, con umbral de puntuacion 0.5 y cajas desde 40 px de ancho:

| Tipo de imagen | Imagenes | Firmas encontradas | Cajas falsas |
|---|---|---|---|
| Carta sin marca de agua | 109 | 78/78 | 13 |
| Carta con marca de agua | 142 | 92/92 | 26 |
| Carta fotografiada | 56 | 40/41 | 6 |
| Foto firmada en su cara | 77 | 67/77 | 11 |
| Pagina web con tarjetas de fotos firmadas | 122 | 85/130 | 157 |
| Foto sin firma | 29 | – | 8 |
| Formulario rellenado a mano | 171 | 105/105 | 67 |
| Texto impreso | 94 | – | 8 |

Comparado con veilq-signature-v3 en 24 formularios sinteticos rellenados a mano sin firma, v4 produce 10 rellenos falsos frente a 38 de v3. El corpus de evaluacion de veilq (recall, precision, tambien en cinco semillas reservadas y al redactar) se mantiene sin cambios. No se han publicado resultados en benchmarks estandar de deteccion (COCO, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32; el modelo ONNX pesa del orden de decenas de MB y el pico de memoria lo domina el tensor de entrada de 640x640x3.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100 y H100 sin aprovechar su capacidad, por lo que la GPU no aporta ventaja significativa frente a CPU en lotes pequenos.
- Cabe en cualquier GPU de consumo e incluso en CPU. El cuello de botella real es el preprocesado de imagen y el pipeline de lectura de veilq (imagen completa y recortes cuadrados cuando la imagen se aleja del cuadrado).
- Opciones de despliegue: ONNX Runtime (el camino documentado por veilq), y por extension cualquier runtime compatible con ONNX (OpenVINO, TensorRT, onnxruntime-web). No se distribuye en GGUF ni en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| veilq-signature-v4 | 6 M (aprox.) | Deteccion de firmas | 640x640 fija | Apache-2.0 | ONNX | Fine-tune con menos falsos positivos en formularios, texto impreso y fotos |
| mdefrance/yolos-tiny-signature-detection | 6 M (aprox.) | Deteccion de firmas | 640x640 fija | Apache-2.0 | safetensors / transformers | Modelo base; confunde valores manuscritos, texto impreso y marcas de agua con firmas |
| veilq-signature-v3 | 6 M (aprox.) | Deteccion de firmas | 640x640 fija | Apache-2.0 | ONNX | Version anterior; 38 rellenos falsos en 24 formularios sin firma frente a 10 de v4 |
| YOLOS-tiny (general) | 6 M (aprox.) | Deteccion de objetos COCO | variable | Apache-2.0 | safetensors | No especializado en firmas; requiere fine-tune para este dominio |

## Limitaciones y advertencias

- Las firmas en tarjetas de foto pequenas dentro de paginas web se detectan en aproximadamente dos de cada tres casos; una firma no detectada permanece visible en el documento redactado.
- Los valores manuscritos en formularios aun se confunden ocasionalmente con firmas; el resultado es un relleno negro sobre el valor, lo que afecta a su legibilidad pero no expone datos personales adicionales.
- El modelo se entreno exclusivamente con datos sinteticos y fotos de Wikimedia Commons; el rendimiento en documentos reales de produccion (escaneos con ruido, firmas en otros alfabetos, caligrafias muy distintas) no esta medido en la informacion disponible.
- Entrada fija de 640x640: imagenes muy alargadas requieren el esquema de lectura por recortes de veilq, y el rendimiento fuera de ese pipeline no esta caracterizado.
- No procesa lenguaje ni metadatos: no puede clasificar el tipo de documento ni extraer texto.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias; para produccion conviene validar con un conjunto propio anotado.
- El modelo se distribuye con un SHA-256 fijado por veilq; cualquier modificacion del archivo ONNX invalida esa verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuetzliches/veilq-signature-v4
- Version anterior: https://huggingface.co/nuetzliches/veilq-signature-v3
- Modelo base: https://huggingface.co/mdefrance/yolos-tiny-signature-detection
- Repositorio de veilq: https://github.com/nuetzliches/veilq
- Fuentes manuscritas usadas en el entrenamiento: https://github.com/google/fonts
- Fotografias de entrenamiento: https://commons.wikimedia.org
