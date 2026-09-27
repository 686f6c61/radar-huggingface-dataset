# majorpurple/utilvision-onnx

## Resumen
UtilVision ONNX es un pipeline de visión por computador en dos etapas para la lectura automática de contadores digitales de servicios (AMR, automatic meter reading), publicado por el usuario majorpurple. No es un modelo de lenguaje: se compone de un detector de cajas LCD basado en Ultralytics YOLO11n y un reconocedor de secuencias numéricas derivado de PaddlePaddle PP-OCRv6 (SVTR-CTC con cabeza podada de 11 tokens). El objetivo es transcribir la lectura de un contador digital a partir de una foto o un fotograma de vídeo, aislando primero la pantalla y restringiendo después el vocabulario a dígitos y punto decimal para eliminar alucinaciones de caracteres.

La propuesta técnica es una cascada desacoplada: detectar la región del visor, normalizar a 96 px de alto manteniendo la relación de aspecto y reconocer solo secuencias numéricas. El conjunto suma 18.130.939 parámetros y ocupa aproximadamente 42 MB en FP16, lo que permite ejecución íntegra en el navegador mediante ONNX Runtime Web con WebGPU o WebAssembly SIMD multi-hilo, sin inferencia en servidor.

Su relevancia actual reside en que demuestra un caso de uso de edge computing real (lectura de contadores sobre dispositivo cliente) con modelos muy pequeños y licencia copyleft AGPL-3.0, lo que condiciona su uso en servicios en red. El repositorio tiene 0 descargas y 1 like en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline en cascada: YOLO11n anchor-free FPN (detección) + PP-OCRv6 SVTR-CTC con cabeza de 11 tokens (reconocimiento) |
| Parametros totales | 18.130.939 (18,13 M) end-to-end; Stage 2: 2.624.389 (2,62 M); Stage 3: 15.506.550 (15,51 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión: Stage 2 con entrada 640x640 px; Stage 3 con altura canónica de 96 px y anchura dinámica) |
| Tipos de cuantizacion | FP32 (Stage 2 y variante `stage3_fp32.onnx`) y FP16 (variante `stage3_fp16.onnx`); no hay cuantización entera publicada |
| Idiomas soportados | no disponible (el reconocedor está restringido a los dígitos 0-9 y el punto decimal) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`stage2.onnx`, `stage3_fp16.onnx`, `stage3_fp32.onnx`) |

## Arquitectura y entrenamiento
El pipeline separa localización y transcripción. La etapa 2 es un detector YOLO11n anchor-free con feature pyramid network, afinado sobre `Ultralytics/YOLO11`, que recibe tensores `images` de forma `[1, 3, 640, 640]` en float32, con letterbox de relleno gris `#727272` (RGB 114, 114, 114) y normalización `pixel / 255.0`. Su salida es `output0` con forma `[1, 5, 8400]`, donde las cinco filas corresponden a `[center_x, center_y, width, height, confidence_score]` para 8400 predicciones candidatas. La etapa 3 es un reconocedor con backbone SVTR y cabeza CTC podada de 11 tokens, afinado sobre `PaddlePaddle/PP-OCRv6_medium_rec`; recibe el tensor `x` con forma `[1, 3, 96, ancho_dinamico]` en float32, normalizado como `(pixel / 255.0 - 0.5) / 0.5` (rango [-1, 1]), y emite `save_infer_model/scale_0.tmp_0` con forma `[1, timesteps, 12]`, cuyos 12 canales corresponden al token blank CTC, los dígitos 0-9 y el punto decimal.

Ambos modelos son fine-tunes específicos de tarea, no entrenamientos desde cero. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). Como innovaciones de ingeniería destacan la normalización canónica a 96 px de alto con anchura dinámica para preservar la relación de aspecto del visor, el decodificado CTC restringido a vocabulario numérico, la ampliación de test-time augmentation (recorte con zoom central al 75 %) que se activa cuando la confianza de la detección primaria cae por debajo de 0,60, el umbral mínimo de confianza de detección de 0,25 y la amortización en flujos de cámara con `DETECT_EVERY = 5` (detección cada quinto fotograma). La variante FP16 reduce a la mitad el tamaño de descarga y el ancho de banda de memoria en tiempo de ejecución, según el autor sin pérdida medible en exactitud de transcripción en hardware de borde.

## Capacidades
- Detección de la caja del contador LCD digital en imágenes o fotogramas de vídeo de campo (Stage 2).
- Reconocimiento de secuencias numéricas restringidas al alfabeto de dígitos 0-9 más el punto decimal mediante decodificado CTC (Stage 3).
- Transcripción de lecturas tipo `007894.21`, incluyendo la posición del separador decimal.
- Ejecución íntegra en el cliente dentro del navegador mediante ONNX Runtime Web con WebGPU y WebAssembly SIMD multi-hilo.
- Inferencia sobre flujo de cámara en tiempo real con detección amortizada (cada cinco fotogramas).
- Robustez frente a clutter de la placa frontal gracias a la separación de las etapas de localización y transcripción.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, function calling, agentes, capacidades multilingües ni modo de pensamiento. Todas estas capacidades quedan fuera del alcance del modelo.
- No hay soporte de audio ni de vídeo más allá del muestreo de fotogramas para la detección.

## Casos de uso
- Lectura de contadores eléctricos digitales en aplicación web: el usuario fotografía el visor desde el navegador y el pipeline devuelve la lectura en kWh sin enviar la imagen a un servidor, lo que encaja con el escenario de AMR descrito por el autor.
- Lectura de contadores de gas y agua con visor LCD: la misma cascada sirve para cualquier display numérico de siete segmentos o LCD, siempre que se revalide el detector sobre el nuevo tipo de visor.
- Aplicación móvil o PWA para técnicos de campo: con 42 MB en FP16, el modelo cabe en el almacenamiento del dispositivo y permite lectura offline sin conectividad.
- Verificación y auditoría de lecturas: el operador captura varias fotos y el modelo transcribe de forma consistente, facilitando la validación cruzada de la lectura reportada por el cliente.
- Procesamiento por lotes de fotografías históricas: la naturaleza ONNX permite ejecutar la cascada sobre un directorio de imágenes para digitalizar registros de contadores archivados.
- Integración en sistemas de facturación: la salida numérica verificada se puede canalizar a un backend para generar la factura, reduciendo el error de transcripción manual.
- Despliegue en dispositivos de borde (Raspberry Pi, mini-PC, cámaras IP): al ser modelos diminutos y con variantes FP16/FP32, se pueden ejecutar en hardware sin GPU dedicada.
- Prototipos de inspección remota: combinado con captura periódica desde una cámara fija, permite monitorizar el consumo sin intervención humana.
- No es adecuado para lectura de dígitos mecánicos, manómetros analógicos ni pantallas con fuentes no numéricas, ya que el vocabulario y el detector están especializados en visores LCD numéricos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks numéricos en la informacion disponible. La model card enlaza a una página de arquitectura y benchmarks en `https://utilvision.vercel.app/about.html`, pero no incluye cifras de exactitud, mAP, CER ni latencia. La única afirmación de rendimiento es cualitativa: la variante FP16 presenta "cero pérdida medible" en exactitud de coincidencia exacta de transcripción en hardware de borde. Los parámetros operativos declarados son umbral de confianza de detección 0,25, TTA de zoom central al 75 % por debajo de 0,60 de confianza y detección cada quinto fotograma en flujo de cámara.

## Requisitos de hardware
- Tamaño del pipeline: 42,0 MB en FP16 por defecto; Stage 2 FP32 10,6 MB; Stage 3 FP16 31,4 MB; Stage 3 FP32 62,3 MB.
- VRAM estimada para inferencia: en el orden de las decenas o centenas de MB, dado que el conjunto de pesos FP16 ocupa 42 MB; no se proporcionan cifras oficiales de pico de memoria.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (integrada o dedicada); en servidor, cualquier GPU de gama de entrada es sobredimensionada para 18,13 M de parámetros.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo, incluida la gama integrada de portátiles y móviles, así como en CPU con WebAssembly SIMD multi-hilo.
- Opciones de despliegue: ONNX Runtime Web (WebGPU, WASM SIMD multi-hilo) para navegador; cualquier runtime compatible con ONNX (ONNX Runtime nativo, TensorRT, OpenVINO) para escritorio o servidor. No se publican pesos GGUF, por lo que llama.cpp y Ollama no aplican, ni ficheros nativos de vLLM o TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Los únicos parámetros de ejecución documentados son el letterbox 640x640, la entrada canónica de 96 px de alto en Stage 3, el umbral de detección 0,25 y la amortización `DETECT_EVERY = 5` en flujo de cámara.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UtilVision ONNX (este) | 18,13 M end-to-end (2,62 M + 15,51 M) | 640x640 px y 96 px de alto x ancho dinámico | Detección de LCD y transcripción numérica | AGPL-3.0 | ONNX en HuggingFace |
| Ultralytics YOLO11n | 2,6 M aprox. (detector base) | 640x640 px | Detección de objetos genérica | AGPL-3.0 (o licencia enterprise de Ultralytics) | Pesos PyTorch y exportaciones |
| PaddlePaddle PP-OCRv6 medium rec | 15,51 M (pesos base del reconocedor) | Altura canónica variable | Reconocimiento de texto general | Apache-2.0 | PaddlePaddle y exportaciones |
| Tesseract OCR | no disponible | no aplica (motor OCR completo) | Reconocimiento de texto general | Apache-2.0 | Ejecutable y librerías |

La comparativa con PaddleOCR y Tesseract es orientativa: UtilVision ONNX no es un OCR genérico, sino una especialización numérica para visores LCD, y no se dispone de cifras comparativas de exactitud o latencia en la información proporcionada.

## Limitaciones y advertencias
- Licencia AGPL-3.0: al incorporar pesos derivados de Ultralytics YOLO11n, el conjunto distribuido queda sujeto a las obligaciones de divulgación de código fuente de la AGPL-3.0. Cualquier servicio accesible por red que use la etapa 2 debe cumplirlas o adquirir una licencia comercial enterprise de Ultralytics.
- La etapa 3 deriva de PP-OCRv6 (Apache-2.0), pero la licencia permisiva del reconocedor no anula el copyleft del detector en la distribución combinada.
- Vocabulario restringido: el reconocedor solo admite dígitos 0-9 y punto decimal, por lo que no puede leer etiquetas, unidades, texto ni otros símbolos del contador.
- Riesgo de alucinación: aunque la cabeza CTC podada reduce la aparición de caracteres fuera de vocabulario, siguen siendo posibles lecturas erróneas en visores con reflejos, suciedad, ángulos oblicuos, baja iluminación o dígitos parcialmente ocultos.
- La información disponible no documenta sesgos, composición del dataset de entrenamiento, cobertura geográfica ni condiciones de captura, lo que limita el análisis de sesgos y de robustez fuera de la distribución de entrenamiento.
- No hay datos publicados sobre rendimiento en idiomas ni sobre multilingüismo; el modelo es agnóstico al idioma porque no procesa texto lingüístico.
- No se especifican cifras de exactitud, mAP ni CER, por lo que cualquier uso en producción exige una validación propia sobre el parque de contadores objetivo.
- El repositorio tiene 0 descargas y 1 like, y no se indica soporte ni mantenimiento por parte del autor; se recomienda congelar la versión de los ficheros ONNX en producción.
- Compatibilidad de runtime: la ejecución en navegador depende de WebGPU o WebAssembly SIMD multi-hilo, que no están disponibles en todos los navegadores o versiones.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/majorpurple/utilvision-onnx
- Aplicación de producción: https://utilvision.vercel.app/
- Arquitectura del sistema y benchmarks: https://utilvision.vercel.app/about.html
- Modelo base del detector: https://huggingface.co/Ultralytics/YOLO11
- Modelo base del reconocedor: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec
