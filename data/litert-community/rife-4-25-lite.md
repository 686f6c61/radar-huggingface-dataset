# litert-community/RIFE-4.25-Lite

## Resumen

RIFE-4.25-Lite es un modelo de interpolación de fotogramas de vídeo exportado a LiteRT/TFLite en precisión FP32 por el colectivo `litert-community`. Se trata de una conversión del checkpoint oficial Practical-RIFE 4.25 Lite de Zhewei Huang y colaboradores, descrito en el artículo "Real-Time Intermediate Flow Estimation for Video Frame Interpolation" (ECCV 2022). Dado un par de fotogramas consecutivos y un instante de interpolación, el modelo genera un fotograma intermedio RGB, lo que permite aumentar la tasa de refresco o suavizar secuencias sin necesidad de capturar más imágenes.

El modelo es relevante porque traslada un algoritmo de investigación de interpolación de vídeo a un formato ligero y portable (TFLite de 23,75 MB) ejecutable en CPU mediante `ai-edge-litert`, lo que facilita su integración en aplicaciones móviles, de escritorio o pipelines de vídeo sin depender de frameworks de deep learning pesados. La exportación emplea la red de inferencia con lista de escalas `[32, 16, 8, 4, 1]` y sin ensemble, manteniendo los pesos preentrenados originales con una interfaz de formas fijas.

La entrada está restringida a fotogramas de 256×512 píxeles (alto × ancho) en orden NCHW y rango [0, 1], y la salida es un único fotograma interpolado de la misma resolución. La decodificación de vídeo, el reescalado y la codificación posterior se delegan al host, de modo que el grafo TFLite se limita exclusivamente a la inferencia de interpolación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de estimación de flujo intermedio (RIFE, Practical-RIFE 4.25 Lite); no disponible el detalle de capas en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32 (única variante publicada en este repositorio) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | TFLite (`.tflite`, FP32, 23,75 MB); el repositorio menciona también un archivo `SHA256SUMS` |

## Arquitectura y entrenamiento

RIFE (Real-Time Intermediate Flow Estimation) es una arquitectura orientada a la interpolación de fotogramas que estima flujos intermedios entre dos imágenes de extremo para sintetizar el fotograma central. La versión 4.25 Lite corresponde a la variante ligera del checkpoint oficial de Practical-RIFE, y la exportación a LiteRT utiliza la red de inferencia con lista de escalas `[32, 16, 8, 4, 1]` y sin ensemble, lo que reduce el coste computacional a cambio de una menor calidad frente a la variante completa con ensemble.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones adicionales más allá de las propias del método RIFE. Los pesos utilizados son los del archivo oficial 4.25 Lite enlazado desde el repositorio Practical-RIFE en la revisión `bbfd2ea90910789a860ea3e2b32a240cd577b75e`, con SHA256 del archivo de checkpoint `e84366c23e0eb1a637a55aad2e4f3442ec2bf4c388043b4aabbf590be289e6e8`. La conversión mantiene los pesos preentrenados originales y solo fija las formas de la interfaz TFLite.

## Capacidades

- Interpolación de fotogramas de vídeo: genera un fotograma intermedio RGB a partir de dos fotogramas de extremo y un instante de interpolación en [0, 1].
- Control fino del instante de interpolación: `timestep=0` devuelve el primer extremo, `timestep=1` el segundo y `timestep=0.5` el punto medio.
- Entrada y salida en formato NCHW con valores float32 en [0, 1], resolución fija de 256×512.
- Ejecución en CPU mediante el intérprete de `ai-edge-litert` (API `Interpreter` y `get_signature_runner("main")`).
- No incluye decodificación de vídeo, reescalado, scheduling de fotogramas ni codificación: esas tareas se realizan en el host.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera de la interpolación de fotogramas.

## Casos de uso

- Aumento de tasa de fotogramas en postproducción: a partir de una secuencia a 30 fps, interpolar fotogramas intermedios para obtener 60 fps o 120 fps, útil para cámara lenta o para igualar la cadencia de distintos materiales.
- Suavizado de vídeo en dispositivos móviles: al ser un TFLite de 23,75 MB ejecutable en CPU con `ai-edge-litert`, puede integrarse en apps Android/iOS que reproduzcan vídeo y necesiten generar fotogramas intermedios en tiempo de ejecución sin GPU dedicada.
- Restauración de metraje antiguo o de baja cadencia: interpolar fotogramas para reducir el efecto de saltos en grabaciones con tasas bajas, siempre que el host reescale previamente a 256×512.
- Generación de cámara lenta sintética: solicitar varios `timestep` entre dos fotogramas clave para crear secuencias slow-motion sin cámara de alta velocidad.
- Pipelines de vídeo en servidor con CPU: al no requerir GPU, puede desplegarse en contenedores con `ai-edge-litert` y `opencv-python-headless` para procesar lotes de vídeo de forma económica.
- Prototipado e investigación en interpolación: servir como referencia ligera y portable para comparar con otras variantes de RIFE (completa, con ensemble, ONNX o safetensors) en experimentos académicos.
- Integración en herramientas de edición (ComfyUI y similares): existe una variante en safetensors publicada por Comfy-Org bajo el nombre `rife_v4.25_lite.safetensors`, lo que permite usar el mismo checkpoint en flujos de nodos de interpolación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la variante publicada, que es FP32 TFLite y está pensada para ejecución en CPU; no se proporcionan cifras de VRAM.
- GPU recomendadas: no disponibles en la información proporcionada; el modelo se distribuye para CPU con `ai-edge-litert`.
- ¿Cabe en GPU consumer? No se dispone de datos; el tamaño del archivo (23,75 MB) sugiere que la huella de memoria es reducida, pero no se confirma en la documentación.
- Opciones de despliegue: `ai-edge-litert` (intérprete TFLite) con Python; el ejemplo oficial usa `huggingface_hub`, `numpy` y `opencv-python-headless`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RIFE-4.25-Lite (LiteRT, este modelo) | no disponible | 256×512 fijo | TFLite FP32 | MIT | Hugging Face (`litert-community/RIFE-4.25-Lite`) |
| rife-4.25-lite-onnx (`t9749`) | no disponible | no disponible | ONNX | no disponible | Hugging Face (`t9749/rife-4.25-lite-onnx`) |
| rife_v4.25_lite (Comfy-Org) | no disponible | no disponible | safetensors | no disponible | Hugging Face (`Comfy-Org/frame_interpolation`) |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con otras alternativas de interpolación de fotogramas (por ejemplo, variantes completas de RIFE, FILM o IFRNet), por lo que la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Resolución fija: la entrada debe ser exactamente 256×512 (alto × ancho); no admite otras resoluciones sin reescalado en el host, lo que puede degradar la calidad en material de alta resolución.
- Sin ensemble: la exportación usa la red de inferencia sin ensemble, por lo que la calidad será inferior a la de la variante completa de Practical-RIFE.
- Solo interpola un fotograma por llamada: no genera secuencias completas ni gestiona el scheduling de fotogramas; el host debe orquestar las llamadas.
- Preprocesamiento obligatorio en el host: decodificación, conversión a RGB, reescalado, normalización a [0, 1] y transposición a NCHW corren a cargo del usuario.
- Riesgo de artefactos en escenas complejas: como todo método de interpolación, puede producir halos, ghosting o distorsiones en oclusiones, movimientos rápidos o cambios de iluminación; no se documentan métricas de calidad en la información disponible.
- Sin capacidades de lenguaje, tool calling ni agentes; no debe evaluarse como modelo de texto.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y verificar la licencia del checkpoint original de Practical-RIFE enlazado, que el README upstream declara MIT.
- Fecha de creación del repositorio en Hugging Face: 2026-11-08; con 0 descargas y 0 likes en el momento de la consulta, la validación comunitaria es inexistente.
- No se documentan sesgos específicos por tratarse de un modelo de visión sin datos demográficos; aun así, el rendimiento puede variar según el dominio del vídeo (animación, deporte, cine, vigilancia).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/RIFE-4.25-Lite
- Archivo TFLite: https://huggingface.co/litert-community/RIFE-4.25-Lite/blob/main/RIFE-4.25-Lite-fp32.tflite
- Repositorio Practical-RIFE (revisión referenciada): https://github.com/hzwer/Practical-RIFE/tree/bbfd2ea90910789a860ea3e2b32a240cd577b75e
- README upstream de Practical-RIFE: https://github.com/hzwer/Practical-RIFE/blob/bbfd2ea90910789a860ea3e2b32a240cd577b75e/README.md
- Checkpoint oficial 4.25 Lite (Google Drive): https://drive.google.com/file/d/1zlKblGuKNatulJNFf5jdB-emp9AqGK05/view
- Variante ONNX: https://huggingface.co/t9749/rife-4.25-lite-onnx
- Variante safetensors para ComfyUI: https://huggingface.co/Comfy-Org/frame_interpolation/blob/main/frame_interpolation/rife_v4.25_lite.safetensors
- Artículo RIFE (ECCV 2022): no disponible como enlace directo en la información proporcionada; cita bibliográfica en la model card.
