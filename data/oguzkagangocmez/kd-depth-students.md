# oguzkagangocmez/kd-depth-students

## Resumen

`kd-depth-students` es una familia de tres redes neuronales ligeras para estimación de profundidad monocular métrica en interiores, publicadas por el investigador Oguz Kagan Gocmez (Özyeğin University) como resultado de un proyecto de la asignatura CS466 Deep Learning (otoño de 2026). El modelo resuelve un problema clásico de despliegue en robótica y visión embebida: obtener profundidad métrica (en metros) con un coste computacional mínimo y con muy pocas etiquetas de profundidad reales. Para ello aplica destilación de conocimiento desde Depth Anything V2 Small como profesor sobre imágenes sin etiquetar, combinada con aprendizaje semi-supervisado sobre NYU Depth V2.

Los tres checkpoints (`small-1pct`, `small-5pct` y `small-25pct`) comparten la misma arquitectura: un encoder MobileNetV3-Large preentrenado en ImageNet y un decoder estilo FastDepth con concatenación de skips. El estudiante tiene 3,15 millones de parámetros y 0,74 GFLOPs a 256×192, lo que supone un modelo 8 veces más pequeño que el profesor. La relevancia actual está en demostrar que con solo un 1 % de las etiquetas reales (462 imágenes) se puede alcanzar un AbsRel de 0,166 en el test de NYU Depth V2, un resultado útil para prototipado rápido en entornos con anotación escasa.

La licencia es MIT para pesos y código, aunque hereda términos de terceros: el profesor Depth Anything V2 Small es Apache-2.0, el dataset NYU Depth V2 es de uso investigador y el backbone parte de pesos ImageNet de torchvision. El repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB (solo pesos ligeros y código de modelado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder CNN: MobileNetV3-Large (encoder) + decoder FastDepth con skips en strides 16, 8, 4 y 2 y convoluciones depthwise-separables |
| Parametros totales | 3,15 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada fija 256×192) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No aplica (modelo de profundidad, sin entrada de texto) |
| Licencia | MIT (pesos y código); profesor Apache-2.0; dataset de uso investigador |
| Formato de pesos | safetensors (carga vía `huggingface_hub` y `modeling.py`) |

## Arquitectura y entrenamiento

El estudiante sigue el esquema FastDepth: un encoder MobileNetV3-Large inicializado con pesos ImageNet de torchvision y un decoder que concatena features de skip en strides 16, 8, 4 y 2, cada una seguida de una convolución depthwise-separable. La salida es una sigmoide escalada al rango 0,001–10 m, lo que fija la profundidad métrica directamente sin post-procesado de escala. El coste es de 0,74 GFLOPs a 256×192 y 8,5 ms por imagen a batch 1 en una GPU Apple M4 Pro, frente a los 45 ms del profesor a su tamaño de entrada nativo.

El entrenamiento combina tres pérdidas: SILog (scale-invariant log) sobre las imágenes etiquetadas, L1 invariante a escala y desplazamiento frente a la profundidad inversa del profesor en todas las imágenes, y una pérdida de bordes multi-escala por gradient matching. El schedule es de 24 000 pasos con batch 8, AdamW y one-cycle. En las variantes `small-5pct` y `small-25pct` el peso del profesor decae a cero en la segunda mitad del entrenamiento y se desactiva sobre las imágenes etiquetadas, lo que reduce el sesgo del profesor cuando hay más supervisión real. Las tres variantes usan semilla 0, seleccionada sobre validación (1 000 imágenes de 25 habitaciones reservadas) antes de una única ejecución de test.

## Capacidades

- Estimación de profundidad monocular métrica en interiores, con salida en metros en el rango 0,001–10 m.
- Entrada RGB de tamaño fijo (B, 3, 192, 256) en [0, 1]; salida (B, 192, 256) de profundidad en metros.
- Función `predict` incluida que redimensiona de 256×192 a 640×480 y devuelve un array NumPy HxW en metros.
- Tres variantes según presupuesto de etiquetas: 1 %, 5 % y 25 % de profundidad real de NYU Depth V2.
- Inferencia muy ligera (8,5 ms por imagen en Apple M4 Pro, batch 1), apta para despliegue en tiempo real.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni visión general; es un modelo puramente de profundidad.
- No dispone de modo thinking ni de capacidades multilingües.

## Casos de uso

- Navegación de robots móviles en interiores: el modelo proporciona profundidad métrica a 256×192 en 8,5 ms, suficiente para bucles de control reactivos en plataformas con GPU integrada, siempre que el entorno sea de interior y la cámara similar a la Kinect de NYU.
- Realidad aumentada en móvil o gafas: la salida métrica en metros permite oclusión y colocación de objetos virtuales en escenas de interior con un coste de 0,74 GFLOPs, compatible con hardware de gama media.
- Prototipado rápido con anotación escasa: `small-1pct` permite arrancar un pipeline de profundidad con solo 462 imágenes etiquetadas, útil cuando no hay presupuesto para anotar depth real y se quiere validar un producto antes de invertir en datos.
- Reconstrucción 3D de interiores a pequeña escala: la profundidad en metros sin escalado por imagen facilita la fusión en nubes de puntos para escaneo de habitaciones hasta ~6 m, con precisión decreciente a mayor distancia.
- Automoción indoor y logística: estimación de profundidad para detección de obstáculos en almacenes y pasillos, donde el rango de 10 m y el sesgo hacia escenas Kinect son aceptables.
- Docencia e investigación en destilación: los tres checkpoints y el repositorio del proyecto permiten reproducir el experimento de destilación semi-supervisada con etiquetas escasas y comparar recetas (E4 con y sin profesor) sobre NYU Depth V2.
- Preprocesado en pipelines de visión: como etapa de profundidad previa a segmentación o detección en interiores, con un coste despreciable frente al resto del pipeline.

## Benchmarks y rendimiento

Resultados sobre las 654 imágenes de test de NYU Depth V2 (recorte Eigen, 0,001–10 m, profundidad métrica bruta sin escalado por imagen; predicción a 256×192 reescalada a 640×480):

| Variante | Etiquetas reales | Receta | AbsRel ↓ | RMSE ↓ | δ1 ↑ | Mismo estudiante solo con etiquetas |
|---|---|---|---|---|---|---|
| `small-1pct` | 1 % (462 imgs) | Profesor en todas las imágenes + pérdida de bordes (E4) | 0,166 | 0,581 | 0,753 | 0,195 |
| `small-5pct` | 5 % (2 312 imgs) | E4, profesor con decaimiento, desactivado en imágenes etiquetadas | 0,155 | 0,553 | 0,778 | 0,166 |
| `small-25pct` | 25 % (11 562 imgs) | Igual que `small-5pct` | 0,151 | 0,542 | 0,788 | 0,154 |

Referencias del propio autor: el mismo estudiante con todas las etiquetas obtiene 0,150 de AbsRel; el profesor Depth Anything V2 Small, tras ajustar escala y desplazamiento a la profundidad real de cada imagen de test, obtiene 0,062 (cota superior, requiere profundidad real en test). No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para los 3,15 M de parámetros; en la práctica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100) o Apple Silicon (medido en M4 Pro). No requiere GPU de datacenter.
- Cabe en GPU consumer: sí, holgadamente; también en dispositivos embebidos tipo Jetson por el bajo cómputo (0,74 GFLOPs).
- Opciones de despliegue: PyTorch nativo con `modeling.py` del repo; exportación a ONNX/TensorRT no documentada; no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI (son para LLMs).
- Latencia: 8,5 ms por imagen a batch 1 en Apple M4 Pro (frente a 45 ms del profesor a su tamaño de entrada). Throughput no documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | AbsRel (NYU v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kd-depth-students` (small-5pct) | 3,15 M | 256×192 | 0,155 | MIT | Hugging Face |
| Depth Anything V2 Small (profesor) | No disponible en la información | Tamaño nativo del profesor | 0,062 (con ajuste de escala/desplazamiento por imagen) | Apache-2.0 | Hugging Face |
| FastDepth (referencia arquitectónica) | No disponible en la información | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada; las cifras del profesor no son directamente comparables porque usan ajuste de escala y desplazamiento con profundidad real en test.

## Limitaciones y advertencias

- Entrenado y evaluado solo en NYU Depth V2 (interior, Kinect, hasta 10 m); la escala métrica está aprendida para esa cámara y no transfiere a exteriores ni a otras cámaras sin fine-tuning.
- El error crece con la distancia: por encima de unos 6 m es mucho mayor que en rango cercano.
- Una sola semilla por modelo; la variabilidad entre semillas es de 0,001–0,004 AbsRel. En 5 % la semilla 0 fue la mejor de tres (media de tres semillas: 0,158).
- No apto para uso crítico de seguridad (el propio autor lo indica).
- Licencia MIT para pesos y código, pero con términos heredados: profesor Depth Anything V2 Small (Apache-2.0), dataset NYU Depth V2 (uso investigador) y pesos ImageNet de torchvision. Verificar compatibilidad para uso comercial del dataset.
- Los profesores Base y Large de Depth Anything V2 (CC-BY-NC-4.0) no se usaron para estos pesos.
- Sin soporte documentado de cuantización, exportación ONNX/TensorRT ni integración con servidores de inferencia estándar.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de profundidades plausibles incorrectas en escenas fuera de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/oguzkagangocmez/kd-depth-students
- Repositorio del proyecto (código, logs y memoria): https://github.com/oguz-kagan-gocmez-edu/knowledge-distillation-depth
- Depth Anything V2 (profesor, paper NeurIPS 2024): https://arxiv.org/abs/2406.09414
- NYU Depth V2 (Silberman et al., ECCV 2012): https://cs.nyu.edu/~silberman/datasets/nyu_depth_v2.html
- MobileNetV3 (Howard et al., ICCV 2019): https://arxiv.org/abs/1905.02244
- FastDepth (Wofk et al., ICRA 2019): https://arxiv.org/abs/1903.03273
