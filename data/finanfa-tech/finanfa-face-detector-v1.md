# finanfa-tech/finanfa-face-detector-v1

## Resumen

Finanfa Face Detector v1 es un modelo de detección de rostros en formato ONNX desarrollado por Finanfa Tech, pensado para despliegues en producción con requisitos de baja latencia y ejecución en entornos limitados (CPU, GPU y dispositivos edge). Está basado en la arquitectura SCRFD-10G-KPS, un detector de una sola etapa que devuelve simultáneamente cajas delimitadoras (*bounding boxes*), puntuaciones de confianza y cinco puntos de referencia faciales (ojos, nariz y comisuras de la boca), necesarios para el alineamiento facial posterior.

El modelo ocupa aproximadamente 16 MB en FP32, acepta entradas de resolución dinámica (se recomienda 640 × 640 píxeles) y está orientado a casos de uso biométricos: control de acceso físico, verificación de identidad KYC, sistemas de fichaje y visión embebida. Forma parte de un pipeline de dos etapas junto con `finanfa-tech/finanfa-face-recognition-v1`, que consume los recortes alineados para calcular una huella biométrica de 512 dimensiones.

Es relevante por su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, y por su empaquetado ONNX, que facilita el despliegue con ONNX Runtime en x86_64, ARM64 (Apple Silicon), CUDA/TensorRT y plataformas móviles Android e iOS. El repositorio no incluye pesos en otros formatos ni datos de entrenamiento detallados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SCRFD-10G-KPS (detector de rostros de una etapa) |
| Parametros totales | no disponible (tamano del artefacto: ~16 MB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye FP32; no se documentan variantes cuantizadas) |
| Idiomas soportados | fr, en (etiquetas del repositorio; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32, ONNX Runtime) |

## Arquitectura y entrenamiento

El modelo implementa SCRFD (Sample and Computation Redistribution for Face Detection), un detector de rostros de una etapa con arquitectura de tipo CNN y *feature pyramid*. La variante 10G-KPS indica un presupuesto computacional de aproximadamente 10 GFLOPs e incluye la cabeza de predicción de *keypoints* (KPS), que emite cinco puntos faciales por detección además de la caja y la puntuación. La salida se compone de cajas delimitadoras, scores de confianza y los cinco landmarks, lo que permite encadenar un alineamiento por similitud antes de la etapa de reconocimiento.

No se han publicado en la información disponible detalles sobre el conjunto de datos de entrenamiento (número de imágenes, composición, balance demográfico), sobre el proceso de optimización ni sobre técnicas de aumento de datos. Tampoco se documenta si el modelo ha sido destilado, podado o cuantizado respecto al SCRFD original. La única innovación técnica declarada es el empaquetado en ONNX Runtime con resolución de entrada dinámica o fija, orientado a reducir la latencia en inferencia.

## Capacidades

- Detección de rostros con cajas delimitadoras y puntuaciones de confianza en una sola pasada.
- Predicción de cinco landmarks faciales por rostro (ojo derecho, ojo izquierdo, nariz, comisura derecha y comisura izquierda), suficientes para alineamiento afín o por similitud.
- Entrada de resolución dinámica o fija; se recomienda 640 × 640 píxeles.
- Ejecución en CPU x86_64, ARM64 y Apple Silicon, GPU con CUDA o TensorRT, y plataformas móviles Android e iOS mediante ONNX Runtime.
- Integración en pipelines biométricos de dos etapas junto con el modelo de reconocimiento facial de Finanfa Tech.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión por computador.

## Casos de uso

- Control de acceso físico: el detector localiza rostros y devuelve landmarks en tiempo real sobre CPU o dispositivos edge, lo que permite alinear el recorte y pasarlo al modelo de reconocimiento para validar la identidad en puertas y tornos.
- Verificación de identidad KYC: en un flujo de alta remota, el modelo detecta el rostro en la imagen del documento y en la *selfie*, y los landmarks permiten normalizar ambas caras antes de comparar las huellas biométricas de 512 dimensiones.
- Sistemas de fichaje biométrico: con un tamaño de ~16 MB y ejecución ONNX, puede desplegarse en terminales de fichaje con CPU ARM de bajo consumo, detectando la cara del empleado y alimentando la etapa de reconocimiento.
- Preprocesado en pipelines de analítica de vídeo: detección y seguimiento de caras en flujos RTSP, con las cajas y landmarks como entrada para módulos de seguimiento, recorte o desenfoque selectivo por privacidad.
- Aplicaciones móviles de visión embebida: integración en apps Android e iOS mediante ONNX Runtime para detectar rostros en la cámara del dispositivo antes de enviar el recorte al servidor, reduciendo el ancho de banda y los datos personales transmitidos.
- Automatización de recortes y anonimización en lotes de imágenes: procesado por lotes de fotografías para localizar caras, alinear recortes y aplicar desenfoque o pixelado a las regiones detectadas antes de su publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para entradas de 640 × 640; el modelo pesa ~16 MB y el consumo dominante es el de las activaciones intermedias.
- GPU recomendadas: cualquier GPU con soporte CUDA o TensorRT (por ejemplo, T4, L4, A10, A100, H100) para despliegues de alta concurrencia; en GPUs de consumo como la RTX 4090 el modelo queda sobredimensionado y el cuello de botella será el preprocesado de imagen.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 o superior) e incluso en iGPU, dado el reducido tamaño del artefacto.
- Despliegue: ONNX Runtime con los *providers* CPUExecutionProvider, CUDAExecutionProvider o TensorrtExecutionProvider; también es posible servirlo con Triton Inference Server. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama no aplican.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, del *provider* de ejecución y de la resolución de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros / tamano | Entrada | Landmarks | Licencia | Formato |
|---|---|---|---|---|---|---|
| Finanfa Face Detector v1 | SCRFD-10G-KPS | ~16 MB (FP32) | Dinámica / 640 × 640 | Sí (5 puntos) | Apache 2.0 | ONNX |
| SCRFD (original, InsightFace) | SCRFD | Variantes 0.5G–34G | Dinámica | Según variante (KPS o no) | MIT (código); pesos con licencia propia | ONNX, PyTorch |
| RetinaFace | RetinaFace (ResNet/MobileNet) | ~1–100 MB según backbone | 640 × 640 | Sí (5 puntos) | MIT (implementaciones de referencia) | PyTorch, ONNX |
| YuNet | YuNet (OpenCV Zoo) | ~0.1 MB | 320 × 320 o dinámica | Sí (5 puntos) | Apache 2.0 | ONNX |

No se dispone de datos de precisión (WIDER FACE u otros) para el modelo de Finanfa Tech en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- No se documenta el conjunto de entrenamiento ni el balance demográfico; existe riesgo de sesgos de precisión por edad, tono de piel, género u oclusión (gafas, mascarillas), habitual en detectores de rostros.
- No se han publicado métricas de precisión, falsos positivos ni curvas de detección, por lo que no es posible validar su robustez frente a SCRFD o RetinaFace sin una evaluación propia.
- El modelo solo detecta y localiza rostros; no identifica personas por sí mismo. La verificación de identidad requiere el modelo de reconocimiento del mismo pipeline.
- El uso de biometría facial está sujeto al RGPD y a normativa específica (por ejemplo, el AI Act europeo para sistemas de identificación biométrica); la licencia Apache 2.0 no exime del cumplimiento legal.
- Los idiomas declarados (fr, en) son meras etiquetas del repositorio y no implican capacidades lingüísticas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documentan variantes cuantizadas ni pesos en otros formatos, lo que limita las opciones de despliegue a ONNX Runtime.
- No se especifican umbrales de confianza recomendados ni procedimiento de NMS, imprescindibles para un uso en producción reproducible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finanfa-tech/finanfa-face-detector-v1
- Modelo de reconocimiento del mismo pipeline: https://huggingface.co/finanfa-tech/finanfa-face-recognition-v1
- ONNX Runtime: https://onnxruntime.ai/
- Paper de SCRFD (Sample and Computation Redistribution for Efficient Face Detection): https://arxiv.org/abs/2105.04714
- Repositorio de referencia de SCRFD en InsightFace: https://github.com/deepinsight/insightface
