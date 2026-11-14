# k-okada/depth-anything-v2-metric-small-onnx

## Resumen

Depth Anything V2 Metric Small ONNX es una conversión a formato ONNX del modelo Depth-Anything-V2-Metric-Hypersim-Small y del Depth-Anything-V2-Metric-VKITTI-Small, publicada por el usuario k-okada. El objetivo no es reentrenar ni modificar el modelo original, sino empaquetar los pesos en un grafo ONNX que `cv::dnn` de OpenCV 4.10 o superior pueda leer directamente, de modo que el nodo `dnn_depth_estimation` del paquete ROS `opencv_apps` pueda utilizarlo sin depender de PyTorch en tiempo de ejecución.

El modelo subyacente es un transformer de visión (ViT-S, variante Small de Depth Anything V2) especializado en estimación de profundidad métrica, es decir, que devuelve distancias absolutas en metros en lugar de profundidad relativa. Se ofrecen dos variantes: una entrenada con el dataset Hypersim para escenas de interior con un alcance máximo de 20 m, y otra entrenada con VKITTI para escenas de exterior con un alcance de 80 m.

La relevancia de esta ficha reside en su carácter práctico para robótica y visión por computador: elimina la dependencia de PyTorch y permite desplegar estimación de profundidad métrica en pipelines ROS con OpenCV como único backend de inferencia, algo útil en sistemas embebidos o entornos donde instalar el stack completo de PyTorch resulta costoso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer Small (ViT-S) de Depth Anything V2, exportado a ONNX |
| Parametros totales | no disponible (la variante Small de Depth Anything V2 ronda los 24,8 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 518 x 518 pixeles) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX en el grafo convertido; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 12, exportador TorchScript, entrada fija 518 x 518, simplificado con onnx-simplifier y Gemm transpuesto a transB=1) |

## Arquitectura y entrenamiento

El modelo base es Depth Anything V2 en su variante Small, un encoder ViT-S que produce mapas de profundidad densos. La versión métrica añade una cabeza de regresión que predice profundidad absoluta en metros, en lugar de la profundidad relativa afín-invariante de las variantes generales. El entrenamiento original de Depth Anything V2 combina datos reales etiquetados con datos sintéticos de alta calidad y pseudo-etiquetado a gran escala sobre imágenes sin anotar; la variante métrica se afina específicamente sobre Hypersim (interiores, hasta 20 m) o VKITTI (exteriores, hasta 80 m). Los detalles exactos de número de tokens, composición del dataset y uso de RLHF no están disponibles en la información proporcionada.

La innovación de esta conversión es puramente de ingeniería de despliegue: se exporta con `torch.onnx.export` en opset 12 usando el exportador TorchScript con forma de entrada fija de 518 x 518, se simplifica con onnx-simplifier sin fusionar MatMul y Add en Gemm, y se transpone el peso de Gemm a `transB=1` para que `cv::dnn` lo interprete correctamente. El resultado es legible por OpenCV 4.10, 4.12 y 5.1 (no por 4.6). Los ONNX con formas dinámicas o generados por el exportador más reciente solo los lee OpenCV 5.

## Capacidades

- Estimación de profundidad métrica densa a partir de una única imagen RGB.
- Salida de profundidad en metros (no relativa), con rango calibrado por variante: 20 m para Hypersim (interiores) y 80 m para VKITTI (exteriores).
- Entrada fija de 1 x 3 x 518 x 518, normalizada con media (0.485, 0.456, 0.406) y desviación típica (0.229, 0.224, 0.225) de ImageNet.
- Salida de 1 x 518 x 518 con el mapa de profundidad en metros.
- Integración directa con `cv::dnn` de OpenCV y con el nodo ROS `dnn_depth_estimation` de `opencv_apps`.
- Inferencia en CPU y en CUDA a través de OpenCV.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Robótica móvil en interiores: el modelo Hypersim se integra en el nodo `dnn_depth_estimation` de ROS para generar mapas de profundidad métrica a 20 m con una cámara monocular, alimentando planificación de navegación o evitación de obstáculos sin sensor LiDAR.
- Percepción en vehículos y AGV en exteriores: la variante VKITTI cubre hasta 80 m, adecuada para estimar distancia a obstáculos en pasillos industriales o vías de servicio con una sola cámara.
- Reconstrucción 3D y nubes de puntos: la profundidad métrica permite proyectar píxeles a coordenadas 3D reales sin escalado empírico, útil en fotogrametría ligera o modelado de interiores.
- Despliegue en sistemas embebidos sin PyTorch: al ser ONNX legible por OpenCV, se puede ejecutar en placas con solo OpenCV instalado, reduciendo el tamaño del stack de dependencias.
- Sustitución de sensores de profundidad de bajo coste: en prototipos donde un sensor de profundidad dedicado es caro o voluminoso, una cámara RGB más este modelo ofrece una alternativa software.
- Validación en investigación con TUM RGB-D: el autor reporta un error absoluto relativo medio de 0,14 con CUDA y 0,29 en CPU de OpenCV 4.12 sobre la secuencia freiburg3_walking_xyz, lo que permite usar el modelo como referencia en experimentos de SLAM visual.
- Automatización de inspección: estimación de distancias a superficies en tareas de mantenimiento o inspección industrial con cámaras fijas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc., no aplican a un modelo de profundidad) en la información disponible. El único dato cuantitativo aportado por el autor es la evaluación sobre el dataset TUM RGB-D (secuencia freiburg3_walking_xyz):

| Metrica | Valor |
|---|---|
| Error absoluto relativo medio (Hypersim, CUDA) | 0,14 |
| Error absoluto relativo medio (Hypersim, CPU OpenCV 4.12) | 0,29 |

## Requisitos de hardware

- VRAM estimada: el repo pesa 0,2 GB, por lo que la inferencia en FP32 cabe holgadamente en cualquier GPU con 1-2 GB de VRAM libre.
- GPU recomendadas: cualquier GPU con soporte CUDA de OpenCV; el modelo es lo bastante pequeño como para funcionar en GPUs de gama baja. No se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, series RTX 20/30/40) e incluso en iGPU con backend CPU.
- Despliegue: OpenCV `cv::dnn` (versiones 4.10, 4.12 y 5.1), nodo `dnn_depth_estimation` de `opencv_apps` en ROS. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de visión).
- Latencia y throughput: no disponibles. Solo se conoce la diferencia de precisión entre CUDA y CPU (0,14 frente a 0,29 de error relativo medio), sin cifras de tiempo por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth Anything V2 Metric Small ONNX (este) | ViT-S, no disponible en cifra exacta | 518 x 518 fija | Profundidad métrica (20 m / 80 m) | Apache 2.0 | ONNX para OpenCV, ROS |
| Depth-Anything-V2-Metric-Hypersim-Small (original) | ViT-S | 518 x 518 | Profundidad métrica (20 m) | Apache 2.0 | PyTorch en Hugging Face |
| Depth-Anything-V2-Metric-VKITTI-Small (original) | ViT-S | 518 x 518 | Profundidad métrica (80 m) | Apache 2.0 | PyTorch en Hugging Face |
| Depth Anything V2 (variantes relativas) | ViT-S a ViT-L | 518 x 518 | Profundidad relativa | Apache 2.0 (Small) | PyTorch, ONNX de terceros |

La diferencia principal frente a los originales es el formato: esta conversión prioriza compatibilidad con OpenCV y ROS sobre flexibilidad de formas de entrada, que queda fijada a 518 x 518.

## Limitaciones y advertencias

- Entrada de forma fija 518 x 518: no admite resoluciones dinámicas; otras formas requieren reexportar el modelo.
- Solo es legible por OpenCV 4.10, 4.12 y 5.1; no funciona en OpenCV 4.6 ni en versiones anteriores.
- Los ONNX con formas dinámicas o generados con el exportador más reciente solo los lee OpenCV 5, lo que limita la portabilidad entre versiones.
- Dominio restringido: la variante Hypersim está pensada para interiores (hasta 20 m) y la VKITTI para exteriores (hasta 80 m); usar una fuera de su dominio degrada la precisión métrica.
- Precisión dependiente del backend: el error relativo medio sube de 0,14 (CUDA) a 0,29 (CPU), por lo que en producción sobre CPU conviene validar el umbral de error aceptable.
- Riesgo de alucinación de profundidad en superficies reflectantes, transparentes o con iluminación atípica, inherente a los modelos monoculares.
- Sesgos heredados del dataset de entrenamiento (Hypersim sintético y VKITTI), con posible menor generalización a escenas no representadas.
- Licencia Apache 2.0 permite uso comercial, pero se debe citar el paper original de Depth Anything V2 según indica el autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/k-okada/depth-anything-v2-metric-small-onnx
- Modelo base Hypersim: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-Hypersim-Small
- Modelo base VKITTI: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-VKITTI-Small
- Repositorio Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Paper: https://arxiv.org/abs/2406.09414
- Script de exportación: https://github.com/ros-perception/opencv_apps/blob/indigo/tools/export_depth_anything_metric.py
- Paquete ROS opencv_apps: https://github.com/ros-perception/opencv_apps
