# Intel/ocr-text-recognition

## Resumen

Intel/ocr-text-recognition es un caso de uso de OCR (reconocimiento óptico de caracteres) publicado por Intel en Hugging Face bajo el paraguas de su plataforma Metro Analytics y del stack Intel DLStreamer. No se trata de un modelo de lenguaje generativo, sino de un pipeline de dos etapas basado en PaddleOCR PP-OCRv4: un detector de regiones de texto (`ch_PP-OCRv4_det`, DBNet) y un reconocedor CRNN-CTC en su variante "server" (`ch_PP-OCRv4_rec_server`), más precisa que la variante móvil en fuentes estilizadas o decorativas.

El paquete se distribuye ya convertido a formato OpenVINO IR mediante la herramienta `ovc`, que lee directamente modelos PaddlePaddle. El objetivo es ofrecer un stack OCR de extremo a extremo optimizado para hardware Intel (CPU e iGPU), pensado para despliegues en el borde: lectura de carteles en estaciones de metro, escaneo de documentos, verificación de etiquetas en logística y digitalización de formularios.

Su relevancia actual radica en que empaqueta una cadena OCR completa y lista para producción sobre OpenVINO, con soporte de precisión FP32 y FP16, sin dependencia de GPUs dedicadas. El repositorio es pequeño (0,1 GB) y la licencia es MIT, lo que facilita su integración comercial. La información publicada no incluye detalles sobre el número de parámetros de cada submodelo ni sobre el volumen de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector DBNet (PP-OCRv4 det) + reconocedor CRNN-CTC (PP-OCRv4 rec server) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32, FP16 |
| Idiomas soportados | en (la model card indica soporte multiescritura de PP-OCRv4, pero el campo `language` declara únicamente inglés) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), convertido desde PaddlePaddle con `ovc` |
| Modelo base | PP-OCRv4 (PaddlePaddle) |
| Motor de inferencia | OpenVINO |
| Hardware soportado | CPU y GPU; NPU no soportado |
| Tamaño del repositorio | 0,1 GB |
| Pipeline de Hugging Face | image-to-text |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en cascada. La primera etapa, `ch_PP-OCRv4_det`, es un detector DBNet ligero que localiza regiones de texto en el fotograma. El ejemplo de referencia redimensiona manteniendo la relación de aspecto (letterboxing sobre un lienzo cuadrado de 960 px) para no deformar el texto, y aplica una dilatación sobre el mapa de detección para fusionar caracteres próximos en una sola caja por palabra en lugar de una por carácter. La segunda etapa, `ch_PP-OCRv4_rec_server`, es un reconocedor CRNN con decodificación CTC que convierte cada región recortada en una cadena de caracteres, usando el diccionario `ppocr_keys_v1.txt` (índice 0 reservado para el símbolo blank, seguido de los caracteres del diccionario y un espacio final).

Ambos modelos se convierten a OpenVINO IR con `ovc` a partir de los modelos de inferencia de PaddleOCR. El script `export_and_quantize.sh` automatiza la instalación de dependencias, la descarga de los modelos de detección y reconocimiento, la conversión a IR y la descarga de una imagen de prueba, un vídeo de prueba (`test_video.mp4`, primer plano de señales de nombre de calle y de stop) y el diccionario de caracteres.

No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Detección de regiones de texto en imágenes y fotogramas de vídeo mediante DBNet.
- Reconocimiento de texto (OCR) sobre cada región detectada, con decodificación CTC a cadenas de caracteres.
- Procesamiento de vídeo fotograma a fotograma con anotación visual: cada caja detectada se etiqueta con el texto reconocido sobre fondo sólido.
- Mayor robustez que la variante móvil de PP-OCRv4 en fuentes estilizadas o decorativas, gracias a la variante "server" del reconocedor.
- Ejecución en CPU e iGPU Intel a través de OpenVINO, con precisión FP32 y FP16.
- Integración con Intel DLStreamer para pipelines de analítica de vídeo.
- Soporte multiescritura heredado de PP-OCRv4 según la model card, aunque el campo de idioma declarado es únicamente inglés.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: no es un modelo generativo.

## Casos de uso

- Lectura de carteles en estaciones de metro: el pipeline procesa el flujo de vídeo de una cámara y reconoce carteles de andén, paneles de salidas y avisos de seguridad, aprovechando la detección por fotograma y la anotación directa sobre la imagen.
- Escaneo de documentos: extracción de texto de formularios, etiquetas y tarjetas de identidad en flujos de digitalización por lotes, con el reconocedor "server" para manejar tipografías no estándar.
- Verificación de etiquetas en logística: lectura de etiquetas de paquetes o códigos en cadenas de clasificación, integrada en pipelines de DLStreamer sobre CPU Intel sin GPU dedicada.
- Señalización viaria: el vídeo de ejemplo (nombres de calle y señales de stop) refleja el caso de lectura de señalética en movilidad o vehículos, con detección que agrupa palabras completas mediante dilatación.
- Control de calidad en línea de producción: lectura de números de serie, lotes o marcas impresas sobre piezas en cintas transportadoras, usando FP16 para reducir latencia en iGPU.
- Digitalización de paneles informativos en entornos urbanos: extracción periódica de texto de pantallas de salidas o avisos, con el pipeline ejecutándose en el borde sobre hardware Intel.
- Procesamiento por lotes de imágenes con texto: conversión de archivos escaneados a texto plano usando el diccionario CTC y el modelo de reconocimiento en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El pipeline está diseñado para CPU e iGPU; no se publican cifras de memoria.
- GPU recomendadas: no se especifican modelos concretos; la model card indica únicamente soporte de CPU y GPU Intel, con NPU no soportado.
- Cabe en GPU de consumo: el soporte declarado es para iGPU Intel; no se documenta compatibilidad con GPUs dedicadas de consumo.
- Opciones de despliegue: OpenVINO Runtime (Python), con conversión previa mediante `ovc`; integración con Intel DLStreamer 2026.3.0 RC1 y OpenVINO GenAI 2026.5.0.0.dev20261030 (stack de desarrollo, no estable).
- Requisitos de software: Python 3.11 o superior, entorno virtual creado con `--system-site-packages` para acceder a los paquetes de OpenVINO y DLStreamer instalados en el sistema.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Etapas | Precisión | Hardware | Licencia | Formato |
|---|---|---|---|---|---|---|
| Intel/ocr-text-recognition | Pipeline OCR PP-OCRv4 | Detección DBNet + reconocimiento CRNN-CTC server | FP32, FP16 | CPU e iGPU Intel (OpenVINO) | MIT | OpenVINO IR |
| PP-OCRv4 original (PaddleOCR) | Pipeline OCR | Detección + reconocimiento (variantes mobile y server) | FP32 | CPU/GPU según framework Paddle | Apache 2.0 (según proyecto PaddleOCR) | PaddlePaddle |
| Tesseract OCR | Motor OCR clásico | Segmentación + clasificación LSTM | no disponible | CPU | Apache 2.0 | Propio |
| EasyOCR | Pipeline OCR basado en deep learning | Detección + reconocimiento | FP32 | CPU/GPU | Apache 2.0 | PyTorch |

La comparativa se limita a características estructurales; no se dispone de datos de benchmarks que permitan comparar precisión o velocidad entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona y no soporta agentes ni tool calling.
- El campo `language` de Hugging Face declara únicamente inglés, aunque la model card afirma soporte multiescritura de PP-OCRv4; conviene validar el rendimiento en otros idiomas antes de producción.
- No soporta NPU; solo CPU y GPU Intel.
- El stack de referencia (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev) es de desarrollo y no una versión estable, lo que implica riesgo de cambios de API.
- La detección depende de umbrales y parámetros ajustables (por ejemplo, umbral de 0,3 y padding de 4 en el ejemplo); un ajuste inadecuado puede fragmentar palabras o perder regiones.
- El reconocimiento puede fallar en fuentes muy estilizadas, texto de baja resolución o iluminación adversa; no se documentan tasas de error.
- No se publican datos sobre sesgos del modelo ni sobre el dataset de entrenamiento.
- Licencia MIT: permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio y las licencias de los modelos base de PaddleOCR.
- El repositorio tiene un tamaño de 0,1 GB y un número de descargas reducido (36 en el momento de la consulta), lo que sugiere una adopción todavía limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Intel/ocr-text-recognition
- PaddleOCR (modelo base PP-OCRv4): https://github.com/PaddlePaddle/PaddleOCR
- Instalación de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Guía de instalación de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Página principal de Intel: https://www.intel.com/content/www/us/en/homepage.html
- Centro de descargas de Intel: https://www.intel.fr/content/www/fr/fr/download-center/home.html
