# justnothin/DA3METRIC-LARGE-Kraken-UW

## Resumen

DA3METRIC-LARGE-Kraken-UW es un modelo de estimación de profundidad monocular métrica especializado en entornos subacuáticos, desarrollado por el usuario justnothin para el equipo NTU Mecatron (competiciones RoboSub y RobotX). Se construye sobre el modelo base depth-anything/DA3METRIC-LARGE de ByteDance, al que se le aplica un ajuste fino mediante LoRA (rank 8) sobre las capas de atención del backbone, con el objetivo de corregir la degradación severa que sufre el modelo original bajo el agua (dispersión, absorción de color y turbidez).

El modelo resuelve un problema muy concreto: el DA3 Metric Large original, sin ajuste, presenta un AbsRel de 0.824 y un sesgo de −3.26 m en las cámaras del AUV Kraken, lo que lo hace inutilizable para navegación o manipulación. Tras el ajuste, el AbsRel baja a 0.105 y el sesgo a −0.46 m, con un factor de escala de 0.92 (donde 1.0 sería perfecto). Los pesos LoRA se han fusionado en las capas base y se exportan como un único archivo ONNX (1.34 GB) listo para ONNX Runtime o TensorRT.

Es relevante porque demuestra que un ajuste LoRA muy ligero (0.35 % de parámetros entrenables, 1.18 M) sobre un modelo de profundidad métrica de propósito general puede adaptar el modelo a un dominio tan específico como la visión subacuática, con un coste de entrenamiento de apenas 6 horas en una Tesla T4. La limitación principal es que solo se ha validado en el simulador UnityMDS, no en vídeo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Depth Anything 3 Metric Large (transformer con backbone de atención y cabeza DPT); ajuste LoRA rank 8 sobre qkv y proj de 24 bloques de atención |
| Parametros totales | no disponible (archivo ONNX de 1.34 GB en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 280×504 píxeles) |
| Tipos de cuantizacion | fp32 (ONNX trazado); se recomienda construir motor TensorRT en fp16 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 20, batch 1, entrada fija [1, 3, 280, 504]) |

## Arquitectura y entrenamiento

El modelo parte de DA3METRIC-LARGE, un transformer de estimación de profundidad métrica con backbone de atención y cabeza DPT. El ajuste fino se realiza con LoRA de rango 8 (alpha 16) aplicado exclusivamente a las proyecciones `qkv` y `proj` de los 24 bloques de atención del backbone, manteniendo congelados tanto el backbone como la cabeza DPT. Esto da un total de 1.179.648 parámetros entrenables, el 0.35 % del total. Los pesos LoRA se fusionan posteriormente en las capas base, resultando en un único archivo ONNX sin adaptadores separados.

El entrenamiento usa 8.000 pares RGB + profundidad renderizados en UnityMDS: cámara frontal en la piscina RoboSub y cámara cenital en la piscina turbia RobotX, con un split de 3200/400/400 por escena (train/val/test). El rango de profundidad válido es de 0.3 a 20 m. La función de pérdida combina SILog (variance focus 0.85, scale weight 0.1) y una pérdida de gradiente Sobel con peso 0.5. Se usa AdamW con lr 1e-4, weight decay 1e-4, schedule coseno hasta 1e-6, gradient clipping 1.0, batch 8 y 20 épocas planificadas (se detuvo en la 19, mejor época la 18). El entrenamiento se ejecutó en una Tesla T4 con fp16 y GradScaler durante aproximadamente 6 horas. El mejor resultado de validación fue AbsRel 0.0281, RMSE 0.232 m y δ1 0.997 (partiendo de AbsRel 0.65 antes del entrenamiento). Una variante que también entrenaba la cabeza DPT obtuvo peores métricas en validación y divergió brevemente, por lo que se descartó.

## Capacidades

- Estimación de profundidad monocular métrica en imágenes subacuáticas simuladas (piscinas RoboSub y RobotX).
- Salida de dos mapas por píxel: profundidad (`depth`) y máscara de cielo (`sky`), ambas de resolución 280×504.
- Conversión a metros reales mediante el factor de escala basado en la focal de la cámara (`depth_metres = depth * focal_px / 300`).
- Relleno de píxeles de cielo con un valor lejano (percentil 99 de profundidad no-cielo, limitado a 200 m), que debe aplicarse fuera del modelo.
- Preprocesado específico: BGR→RGB, redimensionado bicúbico a 504×280, normalización con media y desviación ImageNet, sin corrección de color.
- Inferencia optimizada para TensorRT fp16 (motor construido a partir del ONNX) y ONNX Runtime con CUDA.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Navegación de AUV en piscina: el modelo proporciona profundidad métrica por píxel para que el robot estime su altura sobre el fondo y evite colisiones con paredes o suelo, usando la cámara cenital y el pipeline TensorRT descrito.
- Detección y seguimiento de tuberías en RobotX: la distancia mediana dentro de la máscara de tubería detectada permite al robot aproximarse y alinearse con la tubería; el modelo fue evaluado específicamente en esta tarea (distancias de 0.97 a 3.15 m).
- Percepción para manipulación subacuática: la profundidad métrica permite calcular la distancia al objeto a manipular (válvula, panel, etc.) dentro del rango de 0.3 a 20 m, con un sesgo conocido de −0.46 m que debe compensarse.
- Simulación y desarrollo de algoritmos: al ser un ONNX ligero (1.34 GB) y rápido en TensorRT fp16, se puede integrar en bucles de simulación UnityMDS para probar planificadores y controladores antes de desplegar en hardware real.
- Generación de datasets sintéticos de profundidad: el modelo puede usarse como anotador automático en entornos simulados similares a los de entrenamiento, reduciendo el coste de etiquetado manual.
- Investigación en adaptación de dominio: sirve como caso de estudio reproducible de cómo un LoRA de rango 8 sobre atención adapta un modelo de profundidad de propósito general a un dominio con fuerte degradación visual (dispersión, absorción, turbidez).
- Prototipado rápido en robótica: el archivo ONNX único, sin dependencias de frameworks de entrenamiento, facilita la integración en nodos ROS 2 o pipelines de percepción embarcados con ONNX Runtime.

## Benchmarks y rendimiento

Resultados medidos en UnityMDS con la cámara cenital del Kraken, pipeline completo de percepción (motor TensorRT fp16, stream JPEG en vivo), comparados píxel a píxel con la profundidad de referencia del simulador. Altura mediana cámara-fondo de 3.3 m.

| Metrica | DA3 Metric Large original | DA3METRIC-LARGE-Kraken-UW |
|---|---|---|
| AbsRel, todos los píxeles (↓) | 0.824 | 0.105 |
| Escala (1.0 = correcto; < 1 lee demasiado cerca) | 0.16 | 0.92 |
| Sesgo | −3.26 m | −0.46 m |
| δ < 1.25 (↑) | 0.01 | 0.88 |
| AbsRel / escala, 0–5 m | 0.81 / 0.18 | 0.082 / 0.96 |
| AbsRel / escala, 5–10 m | 0.91 / 0.09 | 0.39 / 0.59 |

Distancia a tubería (profundidad mediana dentro de la máscara de tubería detectada):

| Distancia real | 0–1 m | 1–2 m | 2–3 m | 3–4 m |
|---|---|---|---|---|
| Predicción del modelo | 0.92 m | 1.34 m | 0.96 m | 1.57 m |

En frames de test reservados de UnityMDS (15 por escena), el AbsRel baja de 1.41 a 0.025 (piscina RoboSub, cámara frontal) y de 0.74 a 0.041 (pipeline RobotX, cámara cenital). El autor advierte que estos frames provienen de los mismos entornos que los datos de entrenamiento, por lo que sobreestiman el rendimiento; la evaluación realista es la del robot.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo ONNX en fp32 ocupa 1.34 GB; en TensorRT fp16 el motor requiere aproximadamente 0.7–1 GB de VRAM, más overhead de activaciones para entrada 280×504 y batch 1.
- GPU recomendadas: Tesla T4 (usada en entrenamiento), cualquier GPU NVIDIA con soporte TensorRT 8+; también funciona en CPU vía ONNX Runtime con latencia mayor.
- Cabe en GPU de consumo: sí, en cualquier GPU NVIDIA con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), siempre que se compile el motor TensorRT en el hardware destino.
- Opciones de despliegue: ONNX Runtime (CUDAExecutionProvider o CPUExecutionProvider), TensorRT (recomendado, fp16), `trtexec` para construir el motor. No se proporcionan pesos GGUF ni soporte para llama.cpp/Ollama (no aplica a un modelo de visión).
- Latencia y throughput: no disponibles en la información proporcionada. Los motores TensorRT no son portables entre GPUs; deben construirse en el hardware de destino.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento en dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DA3METRIC-LARGE-Kraken-UW | no disponible (ONNX 1.34 GB) | 280×504 fijo | AbsRel 0.105 en UnityMDS (subacuático simulado) | Apache 2.0 | Hugging Face, ONNX |
| depth-anything/DA3METRIC-LARGE | no disponible | entrada variable (modelo original) | AbsRel 0.824 en el mismo entorno subacuático | Apache 2.0 | Hugging Face |
| Otros modelos de profundidad subacuática especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos de profundidad subacuática en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Solo validado en simulación (UnityMDS). No se ha probado en vídeo subacuático real ni en imágenes sobre el agua; el rendimiento en el mundo real es desconocido y probablemente inferior.
- El sesgo de −0.46 m y el factor de escala de 0.92 implican que el modelo tiende a leer ligeramente demasiado cerca; en producción debe calibrarse y compensarse.
- El modelo original sin ajuste lee aproximadamente un 35 % demasiado cerca si se omite el factor de escala de focal (`depth * focal_px / 300`); este paso es obligatorio.
- El relleno de cielo no está incluido en el ONNX (se traza fuera durante la exportación); debe aplicarse externamente con el umbral `sky >= 0.3` y el percentil 99 limitado a 200 m.
- El dataset de entrenamiento es privado y no se distribuye; no es posible reproducir el ajuste exactamente.
- El motor TensorRT no es portable entre GPUs; debe recompilarse en cada hardware de destino.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base DA3METRIC-LARGE también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Riesgo de alucinación de profundidad en escenas fuera de la distribución de entrenamiento (otras cámaras, otras condiciones de turbidez, iluminación artificial distinta).
- No hay información sobre sesgos demográficos (no aplica) ni sobre rendimiento en distintos tipos de agua (dulce, salada, turbia) más allá de las dos piscinas simuladas.

## Enlaces

- Hugging Face: https://huggingface.co/justnothin/DA3METRIC-LARGE-Kraken-UW
- Modelo base: https://huggingface.co/depth-anything/DA3METRIC-LARGE
- Repositorio de código, entrenamiento y exportación: https://github.com/vuleanhduc1604/Depth-Anything-3-Underwater-Refinement
- Repositorio oficial de Depth Anything 3: https://github.com/ByteDance-Seed/Depth-Anything-3
- Paper de Depth Anything 3 (referencia): arXiv:2511.10647
- Paper de LoRA (referencia): arXiv:2106.09685
