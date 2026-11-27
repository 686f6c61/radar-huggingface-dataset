# cimo001/ndl

## Resumen

NDL es un modelo de reconocimiento óptico de caracteres (OCR) especializado en texto japonés, publicado por el usuario cimo001 en Hugging Face bajo el identificador `cimo001/ndl`. Se distribuye exclusivamente en formato ONNX y está diseñado para ejecutarse mediante `onnxruntime`, lo que lo hace adecuado para despliegues ligeros en producción sin necesidad de un stack de deep learning completo. El modelo deriva del proyecto base `ndl-lab` y se orienta a la lectura de líneas de texto japonesas, tanto horizontales como verticales.

Técnicamente, el repositorio contiene tres variantes de la red PARSeq-tiny, cada una optimizada para una longitud de línea distinta (30, 50 y 100 caracteres). Se trata de un modelo de tipo image-to-text que recibe una imagen RGB y devuelve una secuencia de caracteres mediante decodificación autorregresiva sobre un vocabulario de 7142 símbolos. Su tamaño de repositorio es de 0,1 GB, lo que refleja un modelo compacto pensado para inferencia rápida y de bajo coste computacional.

Su relevancia actual radica en la escasez de modelos OCR japoneses ligeros, empaquetados en ONNX y con soporte explícito para escritura vertical (tategaki), un caso que muchos motores OCR genéricos manejan mal. La licencia CC-BY-4.0 permite uso comercial con atribución, lo que facilita su integración en productos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PARSeq-tiny (transformer encoder-decoder para reconocimiento de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; longitud máxima de línea de 30, 50 o 100 caracteres según variante |
| Tipos de cuantizacion | no disponible (se distribuye en FP32 según la model card) |
| Idiomas soportados | japonés (ja) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura PARSeq en su variante tiny, un transformer encoder-decoder diseñado específicamente para reconocimiento de escenas de texto. La entrada es una imagen RGB redimensionada a `[1, 3, 24, W]` sin preservar la relación de aspecto, normalizada al rango -1..1 y en formato CHW con dimensión de batch. La salida son logits crudos de forma `[1, count + 1, 7142]`, donde cada fila corresponde a un carácter y la decodificación se realiza por argmax, deteniéndose en el índice 0 (fin de texto). Las tres variantes comparten la misma red y solo difieren en la anchura de entrada: `parseq-tiny_30.onnx` con `[1, 3, 24, 256]`, `parseq-tiny_50.onnx` con `[1, 3, 24, 384]` y `parseq-tiny_100.onnx` con `[1, 3, 24, 768]`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo OCR). La model card indica que el modelo fue entrenado con caracteres rotados 90 grados en sentido antihorario para el caso de texto vertical, de modo que las columnas verticales deben rotarse antes de la inferencia. La puntuación de confianza se calcula como la media de la probabilidad softmax de los caracteres retenidos.

## Capacidades

- Reconocimiento de texto japonés en líneas horizontales y en bloques de texto vertical (tategaki).
- Lectura de imágenes con texto vertical dividiéndolas en columnas por los huecos en blanco y procesándolas de derecha a izquierda.
- Selección adaptativa de variante según la longitud de la línea: se recomienda empezar por la más corta y escalar a la siguiente cuando la relación ancho/alto supera el número de caracteres menos 5.
- Salida con puntuación de confianza por línea (media de probabilidades softmax).
- Inferencia en CPU o GPU mediante `onnxruntime` / `onnxruntime-gpu`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente perceptivo de image-to-text.
- Capacidad multilingüe limitada al japonés.

## Casos de uso

- Digitalización de documentos japoneses escaneados: el modelo puede procesar páginas con texto horizontal y vertical, dividiendo bloques verticales en columnas y devolviendo cada línea con su confianza, lo que permite filtrar líneas de baja calidad para revisión manual.
- Extracción de texto de manga y cómics japoneses: los bocadillos suelen contener texto vertical; la capacidad de rotar columnas y leerlas de derecha a izquierda encaja directamente con este flujo.
- Procesamiento de formularios y facturas japonesas: al ser un modelo ONNX ligero (0,1 GB), puede desplegarse en servidores modestos o en el borde para extraer campos de texto de documentos administrativos.
- Archivado y búsqueda de documentación histórica: permite indexar textos japoneses antiguos o digitalizados para motores de búsqueda internos, usando las puntuaciones de confianza para marcar fragmentos dudosos.
- Integración en pipelines de accesibilidad: conversión de imágenes con texto japonés a texto plano para lectores de pantalla o traducción automática posterior.
- Preprocesado para sistemas de traducción ja→es: el OCR actúa como primera etapa de un pipeline que alimenta el texto reconocido a un modelo de traducción, aprovechando la salida estructurada por líneas.
- Automatización de la digitalización de carteles y señalética: al soportar texto vertical y horizontal en una sola pasada, es adecuado para fotos de carteles japoneses en aplicaciones móviles o de realidad aumentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye un ejemplo cualitativo sobre la imagen `jp_vert_1.jpg`, con puntuaciones de confianza de 0,997674, 0,999972 y 0,999093 para las tres líneas reconocidas ("日本語の縦書きを文字", "認識できるかどうかの", "テスト。"), sin comparación con otros modelos ni métricas agregadas como precisión por carácter o tasa de error.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la arquitectura tiny, la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA para `onnxruntime-gpu`; una RTX 3060 o superior es más que suficiente. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en hardware de gama baja.
- Opciones de despliegue: `onnxruntime` (CPU) y `onnxruntime-gpu` (GPU), con `opencv-python` y `numpy` como dependencias. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. La model card advierte que `onnxruntime` emite numerosos avisos `ScatterND` al cargar los modelos, que el ejemplo silencia con `onnxruntime.set_default_logger_severity(3)`.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Contexto/longitud |
|---|---|---|---|---|---|
| cimo001/ndl (PARSeq-tiny) | OCR image-to-text | japonés | ONNX | CC-BY-4.0 | hasta 100 caracteres por línea |
| Tesseract (jpn) | OCR clásico | multilingüe (incl. japonés) | binario propio | Apache-2.0 | por página/bloque |
| Manga OCR | OCR específico de manga | japonés | PyTorch | no disponible en esta ficha | por línea/bloque |
| PaddleOCR (jpn) | OCR deep learning | multilingüe (incl. japonés) | varios | Apache-2.0 | por línea |

La comparación cuantitativa de rendimiento no está disponible. Frente a Tesseract y PaddleOCR, NDL destaca por su empaquetado ONNX ligero y su tratamiento explícito del texto vertical japonés; frente a Manga OCR, su ventaja es la portabilidad del formato ONNX y una licencia permisiva clara.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en japonés; no reconoce otros idiomas ni escrituras latinas de forma fiable.
- No se han publicado métricas de sesgo ni evaluaciones de robustez; el comportamiento ante ruido, baja resolución o fuentes atípicas es desconocido.
- Riesgo de alucinación inherente a la decodificación autorregresiva: puede producir caracteres plausibles pero incorrectos en imágenes degradadas; conviene usar la puntuación de confianza para filtrar.
- Limitación de longitud: cada variante está acotada a 30, 50 o 100 caracteres por línea; líneas más largas requieren segmentación previa.
- El texto vertical debe rotarse 90 grados en sentido antihorario antes de la inferencia, tal como fue entrenado el modelo.
- Los avisos `ScatterND` de `onnxruntime` pueden confundir en producción si no se silencian adecuadamente.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al autor y al proyecto base `ndl-lab`.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación muy limitado, sin garantías de mantenimiento.
- No hay información sobre parámetros totales ni sobre el proceso de entrenamiento, lo que dificulta evaluar su robustez frente a alternativas consolidadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cimo001/ndl
- Imagen de prueba (jp_vert_1.jpg): https://github.com/cimo/One_workspace/blob/main/file/test/language/jp_vert_1.jpg
- Repositorio del autor en GitHub: https://github.com/cimo/One_workspace
- Proyecto base: `ndl-lab` (referenciado en la model card, sin URL directa disponible)
