# Blaize-AI/YOLOPOSE11x_COCOKeypoint

## Resumen

YOLOPOSE11x_COCOKeypoint es una adaptación del modelo YOLO11x-pose de Ultralytics, optimizada por Blaize-AI para su ejecución sobre aceleradores de IA Blaize Xplorer mediante el SDK Picasso. No se trata de un modelo de lenguaje, sino de un detector de poses humanas (estimación de keypoints) entrenado sobre el dataset COCO Keypoints 2017, que identifica articulaciones del cuerpo humano en imágenes. La variante "x" corresponde a la versión XLarge de la familia YOLO11, la de mayor capacidad dentro de esa gama.

El valor diferencial del repositorio no reside en el modelo original, sino en el proceso de compilación y cuantización específico para la arquitectura GSP (Graph Streaming Processor) de Blaize, que prioriza eficiencia energética y baja latencia en inferencia en el borde. Se distribuyen dos variantes en formato `.bm` (Blaize Model) con resolución de entrada 640×384 y 640×640, ambas en cuantización AMP (mezcla de INT8 y BF16).

Es relevante para desarrolladores que trabajen con hardware Blaize y necesiten despliegues de pose estimation en entornos de borde, pero no es utilizable fuera de ese ecosistema: los pesos no están en formatos estándar (safetensors, ONNX, GGUF) y requieren el SDK Picasso y un acelerador Xplorer para ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11x-pose (CNN, detección de keypoints) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | INT8, BF16, AMP (mezcla INT8/BF16) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (Blaize Model), compilado para GSP |

## Arquitectura y entrenamiento

El modelo subyacente es YOLO11x-pose de Ultralytics, una red convolucional de una sola etapa diseñada para detección de personas y estimación simultánea de keypoints. La variante "x" es la de mayor tamaño de la familia YOLO11. El entrenamiento original se realizó sobre COCO Keypoints 2017 (licencia CC-BY-4.0), un dataset de anotación de 17 puntos clave por persona. Blaize no ha modificado el código fuente del modelo, pero ha aplicado optimizaciones específicas de hardware para que el grafo computacional sea compatible con el GSP.

La particularidad técnica es la compilación al formato `.bm` y la disponibilidad de dos resoluciones de entrada (640×384 y 640×640) con cuantización AMP. No se dispone de información sobre el número exacto de tokens de entrenamiento, composición del dataset más allá de COCO Keypoints 2017, ni sobre procesos de ajuste fino adicionales por parte de Blaize.

## Capacidades

- Detección de personas y estimación de pose humana con 17 keypoints (formato COCO).
- Inferencia optimizada para aceleradores Blaize Xplorer mediante el SDK Picasso.
- Dos resoluciones de entrada: 640×384 (menor coste computacional) y 640×640 (mayor precisión espacial).
- Cuantización AMP para equilibrar precisión y velocidad; INT8 para máxima velocidad y BF16 para máxima precisión.
- Ejecución en el borde (edge AI) con baja latencia y eficiencia energética.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión.

## Casos de uso

- Análisis de postura en entornos industriales: el modelo puede estimar la pose de operarios en tiempo real sobre hardware Blaize Xplorer para detectar posturas de riesgo ergonómico, aprovechando la baja latencia del GSP.
- Videovigilancia inteligente en el borde: detección de personas y análisis de movimiento en cámaras IP sin enviar vídeo a la nube, usando la variante 640×384 para maximizar el throughput.
- Monitorización de ejercicios y rehabilitación: seguimiento de keypoints corporales en aplicaciones de fitness o fisioterapia desplegadas en dispositivos empotrados con acelerador Blaize.
- Control gestual e interacción humano-máquina: estimación de pose para interfaces sin contacto en quioscos o paneles industriales, donde la inferencia local es requisito por privacidad.
- Análisis deportivo en directo: extracción de keypoints de atletas en transmisiones o grabaciones, con la variante 640×640 cuando se requiere mayor precisión de articulaciones.
- Robótica colaborativa: percepción de la postura de personas cercanas a brazos robóticos para seguridad, ejecutando el modelo en el propio robot con hardware de bajo consumo.
- Investigación en visión por computador: referencia de despliegue cuantizado de YOLO11x-pose para comparar precisión INT8/BF16/AMP frente al modelo original en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Acelerador Blaize Xplorer AI (requisito imprescindible; el modelo no se ejecuta en GPU convencional ni CPU con los artefactos distribuidos).
- SDK Blaize Picasso instalado y configurado.
- Utilidad `blaize-modeltool` para inspección del modelo.
- No es compatible con vLLM, llama.cpp, Ollama, TGI ni otros runtimes estándar de inferencia.
- No cabe en GPU de consumo (RTX 4090, etc.) en el formato distribuido; para ejecución en GPU habría que recurrir al modelo original YOLO11x-pose de Ultralytics en PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| YOLOPOSE11x_COCOKeypoint (este) | no disponible | 640×384 / 640×640 | `.bm` | AGPL-3.0 | Blaize Xplorer (GSP) |
| YOLO11x-pose (Ultralytics, original) | no disponible | configurable | PyTorch / ONNX / etc. | AGPL-3.0 o enterprise | GPU/CPU genéricos |
| YOLO11n-pose / s-pose / m-pose | no disponible | configurable | PyTorch / ONNX / etc. | AGPL-3.0 o enterprise | GPU/CPU genéricos |

La comparación con otras familias de pose estimation (MediaPipe Pose, HRNet, RTMPose) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo es ejecutable sobre hardware Blaize Xplorer con el SDK Picasso; los archivos `.bm` no son portables a otros entornos.
- La licencia AGPL-3.0 impone obligaciones copyleft estrictas: el uso comercial en servicios en red requiere liberar el código fuente o adquirir la licencia enterprise de Ultralytics.
- El modelo original está entrenado exclusivamente sobre COCO Keypoints 2017; puede degradarse en dominios visuales distintos (iluminación, oclusiones, poses atípicas).
- Riesgo de falsos positivos y errores de keypoint en escenas con múltiples personas solapadas o resolución baja.
- No se dispone de información sobre sesgos demográficos del dataset COCO ni sobre evaluaciones de robustez por parte de Blaize.
- Blaize declara explícitamente que no revisa ni respalda el modelo original y no ofrece garantías de ningún tipo.
- No hay métricas publicadas de precisión (AP, OKS) para las variantes cuantizadas, por lo que se desconoce la pérdida de precisión respecto al modelo en FP32.

## Enlaces

- HuggingFace: https://huggingface.co/Blaize-AI/YOLOPOSE11x_COCOKeypoint
- Modelo original Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset COCO Keypoints: https://cocodataset.org
- Blaize: https://www.blaize.com
