# lookx2/manga-colorization

## Resumen

lookx2/manga-colorization es un modelo ONNX de coloreado automático de manga en blanco y negro, desarrollado por el usuario lookx2 a partir del repositorio upstream qweasdd/manga-colorization-v2. Se trata de una conversión INT8 estática (QDQ) del generador preentrenado, sin fine-tuning, que ofrece un tamaño de 32,54 MB y permite ejecutar la colorización en dispositivos móviles mediante ONNX Runtime. El modelo recibe una imagen en escala de grises y cuatro canales de pistas (hints) inicializados a cero, y devuelve una imagen RGB en el rango [-1,1]. Su relevancia radica en que aporta una solución ligera y desplegable en CPU móvil, con tiempos de inferencia de 0,52 a 0,64 segundos a 384 píxeles en un Galaxy S25 Ultra, para integrarse en aplicaciones de lectura de manga sin necesidad de servidores ni modelos auxiliares. La arquitectura exacta del generador no se documenta en la información disponible, y el modelo tiene una licencia no establecida que limita su redistribución pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador de imágenes (arquitectura upstream no documentada) |
| Parametros totales | No disponible (peso del archivo: 32,54 MB) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesa imágenes, no texto) |
| Tipos de cuantizacion | INT8 estático QDQ (signed INT8 conv, activaciones, per-channel) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | No establecida; no se afirma ninguna licencia MIT/Apache |
| Formato de pesos | ONNX (IR 8, opset 17) |
| Entrada | float32 [1,5,H,W]: grayscale [0,1] + 4 canales de hints a cero |
| Salida | float32 [1,3,H,W], RGB en [-1,1] |
| Tamaño del archivo | 32.536.990 bytes (32,54 MB) |
| Dependencias | Solo ONNX Runtime; sin tokenizador, OCR ni servidor |

## Arquitectura y entrenamiento

El modelo es una exportación directa del generador original de qweasdd/manga-colorization-v2 a ONNX, seguida de una cuantización estática QDQ con pesos y activaciones en INT8 firmado y pesos per-channel. No se realizó ninguna reentrenamiento o ajuste fino. El generador upstream predice el color en una resolución reducida y restaura el detalle de tinta original en la resolución de la imagen fuente, lo que sugiere un pipeline de dos etapas, aunque la arquitectura concreta (por ejemplo, número de capas, tipo de red) no está documentada en la información proporcionada.

En cuanto a los datos de entrenamiento, no se dispone de detalles. La calibración de la cuantización se realizó con cuatro páginas de demostración del repositorio upstream a resoluciones de 384 y 576 píxeles en el lado mayor. Dos páginas de evaluación se excluyeron de la calibración, pero se desconoce si existe solapamiento con el conjunto de entrenamiento upstream. No hay una evaluación rigurosa con ground-truth coloreado por artistas. Al no ser un modelo de lenguaje, no se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Coloreado automático de páginas de manga en blanco y negro, a partir de una imagen de entrada en escala de grises.
- Acepta cuatro canales de pistas (hints) de color que en esta versión se inicializan a cero; el modelo está preparado para soportar indicaciones de color, pero no se utilizan en la configuración por defecto.
- Salida en formato RGB con valores en el rango [-1,1], lista para postprocesado o normalización.
- Inferencia en CPU móvil con tiempos de 0,52 a 1,15 segundos según resolución, medido con ONNX Runtime en Android.
- Modelo monolítico en ONNX: no requiere tokenizador, modelo OCR, denoiser, checkpoint auxiliar ni servidor.
- No genera texto ni soporta tool calling; es un modelo puramente de visión.

## Casos de uso

- Aplicación móvil de lectura de manga: el usuario abre una página en blanco y negro y el modelo la colorea al instante en el dispositivo. Es adecuado porque el modelo pesa solo 32,54 MB y tarda 0,52–0,64 s en una CPU de gama alta a 384 píxeles, lo que permite una experiencia casi en tiempo real sin conexión.
- Visor de manga en escritorio o web: integrar el colorizador como función opcional para previsualizar colores aproximados de páginas escaneadas. Al ser un único archivo ONNX, se puede cargar dinámicamente sin complicar la arquitectura de la aplicación.
- Herramientas de edición para artistas: colorear bocetos o fondos en blanco y negro para inspirar paletas. El modelo genera una primera pasada de color que el artista puede ajustar manualmente, gracias a la entrada de hints para futuras iteraciones.
- Conversión de archivos históricos: procesar por lotes escaneos de manga antiguos para darles una primera pasada de color antes de un retoque profesional. El bajo consumo de memoria (482–513 MiB a 384 px) permite ejecutarlo en máquinas modestas.
- Prototipado de características de colorización en aplicaciones Flutter: la model card incluye una integración específica con un lector de manga (CBOOK_READER_INTEGRATION.md), lo que facilita el wiring del modelo en un pipeline real de Flutter.
- Implantación en sistemas con recursos limitados: gracias a su tamaño y a la ausencia de dependencias externas, puede ejecutarse en dispositivos móviles de gama media o en entornos embebidos mediante ONNX Runtime, siempre que se asuma la degradación térmica en ejecuciones prolongadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, etc.) en la información disponible, ya que se trata de un modelo de visión. La model card incluye mediciones de rendimiento en dispositivo, recogidas en un Samsung Galaxy S25 Ultra (SM-S9380) con Android 16 y ONNX Runtime Android 1.29.0 en CPU con cuatro hilos:

| Medición | Valor |
|---|---|
| Inferencia a 384 píxeles (lado mayor) | 0,52–0,64 s |
| Inferencia a 576 píxeles (lado mayor) | 1,09–1,15 s |
| RSS máxima a 384 píxeles | 482–513 MiB |
| RSS máxima a 576 píxeles | 943–988 MiB |

Estos tiempos son de inferencia en caliente en un proceso nativo independiente, excluyendo el resto del pipeline del lector. Una secuencia de 30 ejecuciones mostró un aumento de la mediana de entre los primeros cinco y los últimos cinco de 1,04 s a 1,75 s, lo que indica degradación térmica en el dispositivo.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y está pensado para inferencia móvil o de escritorio sin GPU.
- GPU recomendada: no aplica. No se han publicado datos de rendimiento en GPU.
- Cabe en consumer GPU: sí, por su tamaño de 32,54 MB, cualquier GPU moderna lo admite, aunque la implantación prevista es en CPU.
- Opciones de despliegue: ONNX Runtime en Android, iOS y escritorio. No se mencionan otras plataformas como vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia medida: 0,52–1,15 s en CPU móvil según resolución. Throughput no disponible.
- El rendimiento en móviles de gama media y el pipeline completo en Flutter permanecen sin medir.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de colorización de manga con las mismas especificaciones en los datos proporcionados. La única referencia es el modelo upstream original, no cuantizado, cuyos parámetros y rendimiento no se han publicado en la información disponible.

| Modelo | Tamaño | Licencia | Notas |
|---|---|---|---|
| lookx2/manga-colorization | 32,54 MB ONNX | No establecida | INT8, sin fine-tuning |
| qweasdd/manga-colorization-v2 | No disponible | No establecida | Modelo base sin cuantizar, acceso via GitHub y checkpoint en Google Drive |

## Limitaciones y advertencias

- Riesgo de alucinación: el modelo adivina colores; no hay garantía de colores canónicos de personajes ni de consistencia entre páginas.
- Sesgos: la calibración se realizó con solo cuatro páginas de demostración; no se ha evaluado la calidad visual ni existe ground-truth coloreado por artistas.
- Cuantización: los errores de cuantización INT8 pueden afectar a la calidad del color y requieren revisión visual.
- Rendimiento degradado: en ejecuciones largas se observa un aumento del tiempo de inferencia (de 1,04 a 1,75 s), atribuible a la degradación térmica del dispositivo.
- Licencia: la revisión upstream no tiene un archivo LICENSE y los derechos de redistribución de los pesos no se han establecido. La conversión a INT8 no aporta una licencia nueva.
- No procesa texto: no es un modelo de lenguaje y no puede usarse para tareas de generación de texto o tool calling.
- La información disponible indica que el modelo se ha preparado para su integración en un repositorio cbook-manga-ocr, pero aún no se ha subido; cualquier despliegue debe validar el SHA-256 y el tamaño del archivo.

## Enlaces

- https://huggingface.co/lookx2/manga-colorization
- https://github.com/qweasdd/manga-colorization-v2
- https://drive.google.com/file/d/1qmxUEKADkEM4iYLp1fpPLLKnfZ6tcF-t/view
- https://github.com/BinitDOX/Manga-Colorizer (encontrado en la búsqueda web, proyecto relacionado con la colorización de manga)
