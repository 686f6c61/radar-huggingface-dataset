# qualcomm/Depth-Anything-V2

## Resumen

Depth-Anything-V2 es un modelo de estimación de profundidad monocular (MDE, *monocular depth estimation*) desarrollado originalmente por el equipo de Depth Anything (ByteDance) y empaquetado por Qualcomm como parte de su catálogo Qualcomm AI Hub Models. El modelo genera un mapa denso de profundidad a partir de una única imagen RGB, asignando a cada píxel una estimación de distancia relativa a la cámara. La variante publicada por Qualcomm corresponde al checkpoint *DepthAnything_V2_Small*, con 24,7 millones de parámetros y una resolución de entrada de 518×518 píxeles.

La relevancia de esta ficha concreta no radica en el modelo original, sino en su exportación optimizada para el hardware de Qualcomm: los pesos están compilados para ejecutarse en las NPU de los chipsets Snapdragon y Dragonwing mediante QAIRT (Qualcomm AI Runtime), con formatos ONNX, QNN_DLC y TFLite. Esto permite ejecutar estimación de profundidad en tiempo real en dispositivos móviles, portátiles ARM y plataformas IoT, sin depender de GPU de escritorio ni de la nube.

El modelo se distribuye bajo licencia MIT y el repositorio ocupa 5,8 GB, aunque el checkpoint Small en precisión float ocupa solo 94,3 MB. La información disponible no incluye detalles sobre el dataset de entrenamiento, el proceso de destilación ni los resultados de benchmarks académicos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder tipo DINOv2 + decoder de profundidad densa); no se detalla la configuracion exacta en la informacion disponible |
| Parametros totales | 24,7 M (checkpoint DepthAnything_V2_Small) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision); resolucion de entrada 518×518 |
| Tipos de cuantizacion | float y w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX, QNN_DLC, TFLite (exportados por Qualcomm); pesos PyTorch originales via libreria ai-hub-models |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del checkpoint mas alla de que se trata de un modelo de estimacion de profundidad basado en la implementacion de Depth-Anything-V2 disponible en la libreria `transformers` de Hugging Face. El modelo original de Depth Anything V2 emplea un encoder transformer preentrenado con destilacion a partir de modelos de profundidad basados en DINOv2 y un decoder ligero que produce el mapa de profundidad denso. La variante Small es la de menor tamano de la familia, con 24,7 M de parametros.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset (imagenes sinteticas, datos etiquetados y pseudoetiquetados), ni si hubo etapas de RLHF o ajuste fino especifico. Tampoco se documentan innovaciones tecnicas adicionales del checkpoint de Qualcomm mas alla de la compilacion y cuantizacion para NPU. La exportacion se realiza mediante Qualcomm AI Hub Workbench, que compila, perfila y evalua el modelo para distintos runtimes y chipsets.

## Capacidades

- Estimacion de profundidad monocular densa por pixel a partir de una imagen RGB de entrada.
- Salida de mapa de profundidad relativa (no se especifica si la salida es metrica o relativa en la informacion disponible).
- Ejecucion en NPU de dispositivos Qualcomm (Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, X Elite, X2 Elite, Dragonwing IQ-8275, IQ-9075, IQ-X7181, QCS8450, QCS8550, QCS6490, entre otros).
- Soporte de cuantizacion w8a16 para reducir latencia y memoria a costa de una ligera perdida de precision.
- Exportacion con formas de entrada personalizadas y pesos ajustados mediante la libreria `ai-hub-models`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- Realidad aumentada en movil: medir distancias relativas entre objetos de la escena para colocar elementos virtuales con oclusion correcta, aprovechando los 13-27 ms de inferencia en NPU de Snapdragon 8 Elite y superiores.
- Fotografia computacional: generar mapas de profundidad para efecto bokeh o desenfoque selectivo en la camara de un smartphone, ejecutando el modelo en la NPU sin cargar la CPU.
- Robotica de bajo consumo: dotar de percepcion de profundidad a robots moviles o drones basados en plataformas Dragonwing (QCS8550, IQ-8275) a 25-52 ms por frame.
- Escaneo 3D y reconstruccion: generar nubes de puntos a partir de secuencias de video capturadas con movil, usando la profundidad por frame como entrada a un pipeline de SLAM o fotogrametria.
- Asistencia a la conduccion y ADAS de bajo coste: estimacion de distancia relativa a obstaculos en plataformas embebidas con NPU Qualcomm, con latencias por debajo de 50 ms.
- Realidad virtual y videojuegos en dispositivos moviles: generar profundidad para reproyeccion o efectos de paralaje en tiempo real sin GPU dedicada.
- Automatizacion industrial e IoT: inspeccion visual y deteccion de obstaculos en camaras inteligentes con chipset QCS6490 o similar, donde el consumo energetico es critico.

## Benchmarks y rendimiento

La informacion disponible no incluye resultados de benchmarks academicos (como los reportados en el paper arXiv:2406.09414) para este checkpoint. Si se incluyen mediciones de latencia y memoria por dispositivo ejecutadas por Qualcomm AI Hub Workbench:

| Runtime | Precision | Chipset | Latencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| ONNX | float | Snapdragon 8 Elite Extreme Gen 6 | 13,836 | 1 - 374 |
| ONNX | float | Snapdragon X2 Elite | 20,601 | 5 - 5 |
| ONNX | float | Snapdragon 8 Elite Gen 5 | 22,866 | 2 - 385 |
| ONNX | float | Snapdragon 8 Elite | 26,024 | 35 - 410 |
| ONNX | float | Snapdragon 8 Gen 3 | 34,164 | 0 - 490 |
| ONNX | float | Snapdragon X Elite | 45,103 | 48 - 48 |
| ONNX | float | Snapdragon 8 Gen 1 | 74,574 | 6 - 514 |
| ONNX | w8a16 | Snapdragon 8 Elite Gen 5 | 11,856 | 1 - 419 |
| ONNX | w8a16 | Snapdragon X2 Elite | 11,369 | 4 - 4 |
| ONNX | w8a16 | Snapdragon 8 Elite | 14,663 | 3 - 411 |
| ONNX | w8a16 | Snapdragon 8 Gen 3 | 19,293 | 3 - 512 |
| ONNX | w8a16 | Snapdragon 8 Gen 1 | 33,523 | 3 - 513 |
| ONNX | w8a16 | Dragonwing QCS6490 | 85,032 | 2 - 5 |

La cuantizacion w8a16 reduce la latencia aproximadamente un 40-50 % respecto a float en los chipsets medidos, con un incremento de memoria pico en algunos casos (por ejemplo, Snapdragon 8 Elite Gen 5 pasa de 2-385 MB a 1-419 MB).

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Licencia | Despliegue en NPU Qualcomm | Notas |
|---|---|---|---|---|---|
| Depth-Anything-V2 Small (esta ficha) | 24,7 M | 518×518 | MIT | Si (ONNX, QNN_DLC, TFLite) | Optimizado por Qualcomm AI Hub |
| Depth-Anything-V2 Base | No disponible en la informacion | No disponible | MIT (modelo original) | No disponible | Checkpoint mayor de la misma familia; no incluido en esta ficha |
| Depth-Anything-V2 Large | No disponible en la informacion | No disponible | MIT (modelo original) | No disponible | Checkpoint mayor de la misma familia; no incluido en esta ficha |
| MiDaS / DPT | No disponible en la informacion | No disponible | MIT (modelo original) | No disponible | Alternativa clasica de MDE; sin datos de rendimiento en NPU en la informacion disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros y disponibilidad de despliegue.

## Limitaciones y advertencias

- La estimacion de profundidad es relativa y puede no ser metricamente precisa; no se especifica en la informacion si la salida esta calibrada en unidades fisicas.
- El modelo se ha validado exclusivamente en hardware Qualcomm; el rendimiento en otras plataformas (GPU NVIDIA, CPU x86) no esta documentado en esta ficha.
- La cuantizacion w8a16 puede introducir degradacion en la calidad del mapa de profundidad, especialmente en bordes y objetos finos; no se aportan metricas de error (AbsRel, RMSE) para cuantificar esta perdida.
- No se documentan sesgos del dataset de entrenamiento ni su comportamiento en escenas con condiciones extremas (poca luz, superficies reflectantes, transparencias).
- Aunque la licencia es MIT, conviene verificar las condiciones de los pesos originales de Depth-Anything-V2 y de las dependencias (DINOv2, QAIRT) antes de un despliegue comercial.
- El repositorio de 5,8 GB incluye multiples artefactos exportados; el checkpoint util en float es de 94,3 MB, pero el espacio en disco necesario para el conjunto completo es considerable.
- No hay informacion sobre el soporte de idiomas ni sobre capacidades de texto: es un modelo estrictamente visual.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/Depth-Anything-V2
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/depth_anything_v2
- Repositorio ai-hub-models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/depth_anything_v2
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Implementacion en transformers: https://github.com/huggingface/transformers/tree/main/src/transformers/models/depth_anything
- Paper Depth-Anything-V2 (arXiv:2406.09414): https://arxiv.org/abs/2406.09414
- Web de Qualcomm: https://www.qualcomm.com/
