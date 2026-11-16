# fastforks/retinaface

## Resumen

RetinaFace es un detector de caras de una sola etapa que, además de localizar rostros, predice cinco puntos clave faciales (ojos, nariz y comisuras de la boca). El modelo original procede de Deng et al. (CVPR 2020) y esta ficha corresponde a la versión empaquetada por el proyecto fastforks, derivada de la implementación de facexlib (versión 0.3.0) sin dependencias externas de facexlib ni torchvision. Es el detector utilizado en los pipelines de restauración facial CodeFormer y GFPGAN, por lo que su relevancia práctica es alta: alimenta con cajas y landmarks a los modelos de restauración posteriores.

El repositorio de Hugging Face no contiene pesos, sino únicamente la model card y los metadatos de verificación (SHA-256 de los ficheros oficiales). fastforks descarga los pesos de los enlaces del autor y comprueba su integridad. Existen dos variantes: `retinaface-mobilenet0.25` (backbone MobileNet-0.25, orientada a velocidad) y `retinaface-resnet50` (backbone ResNet-50, orientada a precisión).

La tarea declarada es `keypoint-detection` dentro del dominio pose, con salidas de `keypoints`, `keypoint_scores`, `boxes` y `scores`. El modelo acepta la imagen a su tamaño original (sin redimensionado, como hace facexlib por defecto con `use_origin_size=True`), lo que condiciona directamente su coste computacional en función de los píxeles de entrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de caras de una sola etapa (RetinaFace): backbone ResNet-50 o MobileNet-0.25 + FPN + módulos SSH + cabezas por anchor (cara, caja y landmarks) sobre mapas de stride 8/16/32 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se documenta ejecución en fp32 y fp16) |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | MIT (código y pesos) |
| Formato de pesos | `.pth` (PyTorch); exportable a ONNX y TensorRT según la documentación de benchmarks |

## Arquitectura y entrenamiento

RetinaFace es un detector single-stage con estructura tipo RetinaNet adaptada a detección facial. Sobre el backbone (ResNet-50 o MobileNet-0.25) se aplica una FPN que produce mapas de características en tres niveles (stride 8, 16 y 32), a los que se añaden los módulos SSH (Single Stage Headless) para ampliar el contexto receptivo. Cada nivel alimenta tres cabezas independientes por anchor: clasificación de cara, regresión de caja y regresión de cinco landmarks faciales. El modelo procesa la imagen completa sin redimensionar, y el tamaño de entrada debe ser cualquier H x W ≥ 32, con padding hasta un múltiplo de 32.

El entrenamiento se realizó sobre WIDER FACE (32.000 imágenes, 394.000 caras etiquetadas) con las anotaciones de cinco landmarks de RetinaFace; el backbone ResNet-50 parte de pesos de clasificación ImageNet. No se documentan en la información disponible detalles sobre fases de refinamiento, función de pérdida concreta ni datos adicionales de entrenamiento.

La innovación técnica destacable en el empaquetado de fastforks es la separación entre el grafo exportado y la lógica de post-proceso: `module()` devuelve los mapas de cabezas en bruto, mientras que la decodificación de anchors y la NMS quedan fuera del grafo. Además, se ofrecen dos backends (`portable` y `kernels`) con mejoras de velocidad medidas: el backend `kernels` acelera 27,7x frente al código original en MobileNet-0.25 y 6,8x en ResNet-50 (a 1080x1920). También se documentan rutas de optimización con `torch.compile` y TensorRT fp16.

## Capacidades

- Detección de caras en imágenes RGB, devolviendo cajas delimitadoras con puntuación de confianza.
- Predicción de cinco landmarks faciales por cara: ojos (2), nariz (1) y comisuras de la boca (2), con coordenadas en píxeles de la imagen de entrada.
- Salida de `keypoint_scores` por persona; cabe señalar que la puntuación de cada landmark repite la puntuación de la cara (no hay confianza por landmark individual).
- Procesado a tamaño original de la imagen, sin redimensionado interno.
- Entrada de una caja por persona (o un resultado de detección de fastforks) para guiar el recorte sobre el que se predicen los landmarks.
- Dos backends de ejecución: `portable` (PyTorch) y `kernels`, con selección automática del preferido según mediciones registradas.
- Compatibilidad con exportación a ONNX y TensorRT, y con `torch.compile`.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes; es exclusivamente un modelo de visión para detección facial y keypoints.

## Casos de uso

- Preprocesado en pipelines de restauración facial: RetinaFace es el detector de CodeFormer y GFPGAN; se usa para localizar caras y sus landmarks antes de aplicar el modelo de restauración, garantizando recortes y alineaciones correctas.
- Alineación facial para reconocimiento: los cinco landmarks permiten calcular transformaciones de similitud (rotación, escala, traslación) para normalizar rostros antes de pasarlos a un modelo de verificación de identidad.
- Anonimización y desenfoque automático de caras: en vídeo o lotes de imágenes, el modelo detecta todas las caras y devuelve cajas que se pueden usar para aplicar desenfoque o pixelado, con la ventaja de que MobileNet-0.25 procesa 1080x1920 en 2,74 ms con el backend `kernels` en RTX 5060 Ti.
- Etiquetado y anonimización de datasets: generación automática de anotaciones de cajas y landmarks sobre grandes colecciones de imágenes para entrenar modelos posteriores, con verificación de paridad frente al código original (error absoluto medio ≤ 0,016 en fp16 en GPU).
- Análisis de atención y expresión en investigación: la posición de ojos, nariz y boca permite estimar orientación de la cabeza y apertura de la boca, útil en estudios de comportamiento o interfaces de usuario.
- Control de calidad en captura de documentos con foto: detección de caras y landmarks para verificar que la foto de identidad cumple requisitos de encuadre y orientación en aplicaciones de onboarding.
- Integración en aplicaciones de edición fotográfica: selección automática de rostros para aplicar retoques localizados, con la variante ResNet-50 cuando prima la precisión sobre la latencia (11,7 ms en 1080x1920 con `kernels`).

## Benchmarks y rendimiento

La información disponible no incluye métricas estándar de detección facial (WIDER FACE AP, mAP, recall) ni resultados de MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo. Sí se documentan mediciones de velocidad, memoria y paridad numérica:

| Modelo | Entrada | Tiempo portable | Tiempo compile | TensorRT fp16 | Tiempo kernels | Memoria pico portable (MiB) |
|---|---|---|---|---|---|---|
| retinaface-mobilenet0.25 | 1080x1920 | 3,44 ms | 2,16 ms | 0,982 ms (solo red) | 2,74 ms | 86 / 108 |
| retinaface-resnet50 | 1080x1920 | 24,3 ms | 16,5 ms | 9,10 ms (solo red) | 11,7 ms | 405 / 504 |

| Modelo | Tiempo original fp32 (1080x1920) | Aceleración kernels vs original | Memoria pico original (MiB) |
|---|---|---|---|
| retinaface-mobilenet0.25 | 75,9 ms | 27,7x | 87 / 110 |
| retinaface-resnet50 | 81,0 ms | 6,8x | 371 / 490 |

Paridad con el código original: en CPU y float32, diferencia absoluta máxima ≤ 0,001; en GPU y float16 (por defecto), error absoluto medio ≤ 0,016 y p99 ≤ 0,04 sobre los `keypoints` de salida.

## Requisitos de hardware

- VRAM estimada: en fp16 con el backend portable, MobileNet-0.25 consume 86 MiB asignados / 108 MiB reservados a 1080x1920; ResNet-50 consume 405 MiB / 504 MiB. Con `kernels`, 105/128 MiB y 379/464 MiB respectivamente.
- Entradas grandes: probado hasta 3000x4000 en RTX 5060 Ti 16 GB, con 0,5 GiB de pico para MobileNet-0.25 y 1,6 GiB para ResNet-50.
- GPU recomendadas: cualquier GPU con soporte CUDA y suficiente memoria; las mediciones se realizaron en RTX 5060 Ti 16 GB (sm_120). Para producción de alta concurrencia, A100 o H100 permiten mayor paralelismo, aunque no se documentan cifras específicas en esas GPU.
- Cabe en GPU de consumo: sí, ambas variantes caben holgadamente en GPU de consumo con 8 GB o más; el coste depende del tamaño de imagen, no del modelo.
- Opciones de despliegue: `pip install fastforks` con los backends `portable` y `kernels`; exportación a ONNX y TensorRT documentada; `torch.compile` disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 2,74 ms (MobileNet-0.25, kernels) y 11,7 ms (ResNet-50, kernels) a 1080x1920 en RTX 5060 Ti; el tiempo de primera llamada con `kernels` es de 0,06 s y 0,10 s respectivamente, y la carga del modelo de 1,49 s y 1,55 s. No se documenta throughput agregado por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrada | Landmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetinaFace (fastforks) | no disponible (ResNet-50 o MobileNet-0.25) | cualquier H x W ≥ 32, sin redimensionado | 5 por cara | MIT | pesos vía enlaces del autor, verificados por SHA-256 |
| RetinaFace original (facexlib) | mismas variantes | mismo comportamiento (`use_origin_size=True`) | 5 por cara | MIT | repositorio facexlib |
| MTCNN | no disponible | imagen redimensionada en pirámide | 5 por cara | MIT | ampliamente disponible |
| BlazeFace (MediaPipe) | no disponible | entrada fija (típicamente 128x128 o 256x256) | 6 por cara | Apache 2.0 | disponible en MediaPipe |

No se dispone de datos de precisión (AP en WIDER FACE) para ninguno de los modelos comparados en la información proporcionada, por lo que la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- `module()` exporta únicamente los mapas de cabezas en bruto: la decodificación de anchors y la NMS deben implementarse fuera del grafo exportado, lo que añade complejidad si se despliega el modelo sin la librería fastforks.
- No hay confianza por landmark: `keypoint_scores` repite la puntuación de la cara, por lo que no se puede filtrar la calidad de un punto clave concreto.
- La imagen no se redimensiona: las fotos grandes cuestan tiempo y memoria proporcionales a sus píxeles; conviene reducir la escala antes de procesar imágenes con caras grandes o de alta resolución.
- Riesgo de falsos positivos y negativos en caras pequeñas, muy ocluidas o en ángulos extremos; no se documentan métricas de recall/precisión en la información disponible.
- Sesgos: el entrenamiento se limita a WIDER FACE, con posible desequilibrio demográfico no cuantificado en la información disponible; no se documentan evaluaciones por género, edad o tono de piel.
- Licencia MIT tanto en código como en pesos, con uso comercial permitido según la tabla de variantes; aun así, la model card advierte que el paquete original es de uso de investigación y recomienda revisar las licencias antes de otros usos.
- El repositorio de Hugging Face no aloja pesos: la disponibilidad depende de que los enlaces del autor (GitHub releases de facexlib) permanezcan accesibles y de la verificación SHA-256.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento multi-paso; cualquier caso de uso debe plantearse como componente de un pipeline de visión.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/retinaface
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Metadatos de variantes y SHA-256: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/pose/models/retinaface/card.toml
- Código original (facexlib, commit 260620ae9399): https://github.com/xinntao/facexlib
- Evidencia de licencia: https://github.com/xinntao/facexlib/blob/260620ae93990a300f4b16448df9bb459f1caba9/README.md
- Pesos MobileNet-0.25: https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_mobilenet0.25_Final.pth
- Pesos ResNet-50: https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_Resnet50_Final.pth
- Paper RetinaFace (Deng et al., CVPR 2020): no disponible en la información proporcionada
