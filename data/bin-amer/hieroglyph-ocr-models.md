# Bin-Amer/hieroglyph-ocr-models

## Resumen

El repositorio `Bin-Amer/hieroglyph-ocr-models` agrupa cuatro artefactos de pesos entrenados para un pipeline de reconocimiento óptico de jeroglíficos egipcios. No es un único modelo, sino un conjunto de componentes complementarios: un detector de objetos YOLO26n para localizar signos en la imagen, un lector TrOCR-Base (ViT + RoBERTa) que transcribe cada recorte a un código Gardiner, y un clasificador MobileNetV3-Small que asigna uno de 171 códigos Gardiner a cada signo. El objetivo es convertir una fotografía de una estela o papiro en una lista estructurada de códigos de la Gardiner Sign List, un formato estándar en egiptología.

El proyecto está orientado a despliegue real, incluyendo variantes cuantizadas en TFLite/LiteRT para un APK Android offline construido con Flutter. Los pesos PyTorch y SafeTensors cubren el uso en servidor o investigación (Colab, Gradio, API), mientras que los `.tflite` y `.keras` habilitan inferencia en dispositivo sin conexión. La licencia es MIT y los idiomas declarados son árabe e inglés, aunque el modelo no genera lenguaje libre: produce cadenas cortas de códigos Gardiner.

La relevancia actual reside en la combinación de un pipeline OCR específico de dominio con métricas de validación y test publicadas bajo una política de separación por página (page-level split), algo poco habitual en repositorios de este tamaño. El sistema completo (YOLO → recorte → TrOCR) alcanza un 64,70% de exactitud end-to-end en el conjunto de test bloqueado para clases conocidas, con un 92,12% de exactitud del lector TrOCR sobre recortes emparejados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres etapas: YOLO26n (detección), TrOCR-Base ViT + RoBERTa (image-to-text), MobileNetV3-Small (clasificación) |
| Parametros totales | No disponible (no se publica el recuento por componente; el peso SafeTensors del TrOCR ocupa 1,33 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; el decodificador TrOCR genera secuencias de hasta 12 tokens |
| Tipos de cuantizacion | YOLO26n en W8A32 (TFLite); MobileNetV3-Small en TFLite (cuantización no especificada); TrOCR en SafeTensors sin cuantizar |
| Idiomas soportados | Árabe (ar), inglés (en); la salida son códigos Gardiner, no texto libre |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (5,47 MB), SafeTensors (1,33 GB), TFLite/LiteRT (10,0 MB detector; clasificador sin tamaño indicado), Keras v3 `.keras` (4,72 MB) |

## Arquitectura y entrenamiento

El sistema se compone de tres modelos independientes que se encadenan en inferencia. El detector es un YOLO26n de Ultralytics con una única clase (`glyph`), entrenado en dos etapas: una fase sintética (Stage A) y un ajuste fino sobre datos reales (Stage B). El salto de mAP@50 entre ambas fases es notable: del 1,93% con solo datos sintéticos al 78,21% tras el ajuste fino real, lo que indica que la generación sintética por sí sola no generaliza a imágenes reales de estelas y papiros. El lector TrOCR parte de `microsoft/trocr-base-handwritten`, un encoder ViT con decoder RoBERTa, ajustado para emitir códigos Gardiner con una longitud máxima de 12 tokens y entrada de 384×384 píxeles. El clasificador MobileNetV3-Small se entrena sobre 171 clases Gardiner con entrada de 224×224 y se distribuye tanto en Keras como en TFLite.

La evaluación se realizó bajo una política de separación a nivel de página (page-level split) con un conjunto de test bloqueado hasta la evaluación final, lo que reduce el riesgo de fuga de datos entre páginas del mismo documento. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la distinción entre datos sintéticos y recortes reales. Tampoco se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo de OCR especializado. Una innovación práctica destacable es el preprocesado de recortes: cada crop se centra sobre un lienzo blanco cuadrado antes de pasarlo al TrOCR, lo que estabiliza la lectura de signos con proporciones muy variables.

## Capacidades

- Detección de signos jeroglíficos en imágenes de estelas, papiros y superficies de piedra, con una sola clase de objeto (`glyph`).
- Lectura de cada recorte detectado y conversión a código Gardiner estándar (por ejemplo `N35`, `M17`, `G17`) mediante TrOCR.
- Clasificación alternativa en 171 clases Gardiner con MobileNetV3-Small, con salida de top-1 y top-3.
- Inferencia offline en Android mediante modelos TFLite/LiteRT integrados en una app Flutter (versión 4.5.0 citada en la model card).
- Procesamiento de imágenes a 1024×1024 en la variante PyTorch del detector y a 640×640 en la variante móvil.
- No realiza traducción lingüística ni interpretación semántica del texto egipcio: la salida es exclusivamente el código de signo.
- No dispone de tool calling, function calling ni capacidades de agente.
- No soporta visión general más allá del dominio de signos jeroglíficos, ni audio, ni modo thinking.

## Casos de uso

- Digitalización de archivos egiptológicos: procesar fotografías de estelas y papiros para obtener listas de códigos Gardiner que alimenten bases de datos de corpus, usando el pipeline YOLO → TrOCR en servidor con GPU.
- Herramienta de campo para arqueólogos: la app Android offline con los modelos TFLite permite identificar signos in situ sin conexión, útil en yacimientos sin cobertura.
- Asistencia a la transcripción manual: el sistema propone códigos Gardiner por signo y el especialista valida o corrige, reduciendo el tiempo de catalogación frente a la transcripción desde cero.
- Indexación y búsqueda de colecciones museísticas: convertir imágenes de piezas en códigos estructurados permite búsquedas por secuencia de signos en catálogos digitales.
- Investigación en visión por computador aplicada al patrimonio: el repositorio sirve como referencia reproducible con métricas de test bloqueado para comparar detectores y lectores en un dominio de escritura no latina.
- Docencia de egiptología: la app móvil permite a estudiantes practicar el reconocimiento de signos y códigos Gardiner con retroalimentación automática.
- Preprocesado para pipelines de traducción: los códigos Gardiner generados pueden alimentar etapas posteriores de transliteración o traducción desarrolladas por terceros, ya que este modelo no cubre esa función.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con separación a nivel de página y test bloqueado.

| Componente | Metrica | Valor |
|---|---|---|
| YOLO26n (Stage B, real) | Precision | 79,07% |
| YOLO26n (Stage B, real) | Recall | 71,08% |
| YOLO26n (Stage B, real) | mAP@50 | 78,21% |
| YOLO26n (Stage B, real) | mAP@50-95 | 46,45% |
| YOLO26n (Stage A, solo sintético) | mAP@50 | 1,93% |
| TrOCR-Base | Exactitud exacta en validación (420 recortes ground-truth) | 94,29% (CER 4,66%) |
| TrOCR-Base | Exactitud en validación sobre cajas YOLO emparejadas (334) | 93,41% |
| TrOCR-Base | Exactitud en test bloqueado sobre cajas YOLO emparejadas (571) | 92,12% |
| TrOCR-Base | Tasa de código Gardiner válido | 100,0% |
| MobileNetV3-Small | Validación top-1 / top-3 (420 recortes reales) | 87,62% / 95,24% |
| MobileNetV3-Small | Validación top-1 / top-3 en clases con imágenes reales | 89,71% / 97,55% |
| MobileNetV3-Small | Test bloqueado top-1 / top-3 (829 recortes reales) | 84,44% / 92,64% |
| MobileNetV3-Small | Test bloqueado top-1 / top-3 en clases con imágenes reales | 86,10% / 94,46% |
| Pipeline completo (YOLO → crop → TrOCR) | Validación end-to-end, clases conocidas (conf 0,35, IoU ≥ 0,50) | 75,91% |
| Pipeline completo | Validación end-to-end, incluyendo clases no vistas | 74,29% |
| Pipeline completo | Test bloqueado end-to-end, clases conocidas | 64,70% |
| Pipeline completo | Test bloqueado end-to-end, incluyendo 12 clases raras no vistas | 63,45% |

## Requisitos de hardware

- TrOCR-Base en SafeTensors: 1,33 GB de pesos; en FP16 requiere aproximadamente 2,7 GB de VRAM, y en FP32 unos 5,3 GB, más memoria para activaciones con entrada de 384×384.
- YOLO26n en PyTorch: 5,47 MB, ejecutable en CPU sin dificultad; a 1024×1024 se beneficia de GPU para lotes grandes.
- MobileNetV3-Small: 4,72 MB en Keras, apto para CPU y para dispositivos móviles.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) cubre el pipeline completo; para procesamiento por lotes de páginas se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, el componente más exigente es el TrOCR con unos 3 GB en FP16, por lo que una RTX 3060 de 12 GB o superior es suficiente.
- Despliegue: PyTorch + Transformers + Ultralytics para servidor; vLLM y TGI no aplican porque no es un modelo de lenguaje generativo; llama.cpp y Ollama tampoco son compatibles con estos formatos. En móvil, LiteRT/TFLite dentro de Flutter.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|
| hieroglyph-ocr-models (este) | Pipeline OCR específico (YOLO26n + TrOCR + MobileNetV3) | No disponible | Imágenes 1024×1024 (detector), 384×384 (lector), 12 tokens de salida | mAP@50 78,21% (detector); 92,12% exactitud TrOCR en test; 64,70% end-to-end | MIT |
| TrOCR (microsoft/trocr-base-handwritten) | Image-to-text OCR | No disponible en la información | 384×384, secuencias cortas | No disponible en la información | MIT |
| Tesseract OCR | OCR clásico (no neuronal extremo a extremo) | No aplica | Imágenes de documento | No disponible en la información | Apache 2.0 |
| PaddleOCR | Pipeline OCR (detección + reconocimiento) | No disponible en la información | Variables según configuración | No disponible en la información | Apache 2.0 |

La comparación directa con PaddleOCR o Tesseract es limitada porque ninguno está especializado en signos jeroglíficos ni en códigos Gardiner; este repositorio cubre un dominio que los OCR genéricos no abordan.

## Limitaciones y advertencias

- El modelo no traduce ni interpreta el texto egipcio: solo emite códigos Gardiner. Cualquier expectativa de traducción queda fuera de su alcance.
- Las 18 clases raras sin recortes reales en el entrenamiento (generadas solo desde Unicode) tienen baja precisión sobre imágenes reales; se recomienda mostrar top-3 o advertir al usuario cuando la confianza sea baja.
- El pipeline completo cae al 64,70% en test bloqueado para clases conocidas y al 63,45% incluyendo clases no vistas, frente al 92,12% del lector aislado: los errores de detección degradan notablemente el resultado final.
- El detector entrenado solo con datos sintéticos alcanza un mAP@50 del 1,93%, lo que evidencia una dependencia crítica de datos reales de ajuste fino.
- Riesgo de alucinación en el lector TrOCR: puede generar códigos Gardiner válidos sintácticamente pero incorrectos para el signo, dado que la tasa de código válido es del 100%.
- Sesgos de dominio: el rendimiento depende del tipo de soporte (piedra, papiro), iluminación y calidad de la fotografía; no se documenta el desglose por soporte.
- Idiomas declarados ar/en se refieren a la documentación y la interfaz, no a la salida del modelo.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los modelos base (TrOCR de Microsoft y YOLO26n de Ultralytics), ya que Ultralytics aplica AGPL-3.0 a sus pesos y código, lo que puede condicionar la redistribución del detector en productos propietarios.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, sin validación externa independiente de los resultados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Bin-Amer/hieroglyph-ocr-models
- Modelo base del lector: https://huggingface.co/microsoft/trocr-base-handwritten
- Ultralytics YOLO (framework del detector): https://github.com/ultralytics/ultralytics
- Gardiner Sign List (referencia de códigos): no disponible en la información proporcionada
- Paper de TrOCR: no disponible en la información proporcionada
- Demo o aplicación Flutter: no disponible en la información proporcionada
