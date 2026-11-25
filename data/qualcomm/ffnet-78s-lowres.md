# qualcomm/FFNet-78S-LowRes

## Resumen

FFNet-78S-LowRes es un modelo de segmentación semántica de imágenes de escenas urbanas desarrollado por Qualcomm AI Research, distribuido a través de Qualcomm AI Hub. Segmenta cada píxel de una imagen en 19 clases predefinidas (calzada, acera, peatón, vehículo, vegetación, etc.) y está entrenado sobre el conjunto de datos Cityscapes. Su particularidad es que se trata de una variante "low resolution" del FFNet-78S original, con una resolución de entrada de 1024x512 píxeles, pensada para maximizar el rendimiento en tiempo real sobre hardware móvil y embebido.

El modelo es una red neuronal convolucional de tipo "fuss-free network" (FFNet), una familia de arquitecturas diseñadas para segmentación semántica eficiente sin componentes complejos como decodificadores multi-escala o attention. Con 26,8 millones de parámetros y un tamaño de 102 MB en precisión float (26 MB en cuantización w8a8), está optimizado para ejecutarse en la NPU de los chipsets Snapdragon y en las plataformas Dragonwing de Qualcomm.

La relevancia actual del modelo reside en su orientación a producción en dispositivos: Qualcomm distribuye artefactos pre-exportados en ONNX, QNN_DLC y TFLite, con soporte para cuantización w8a8, lo que permite desplegar segmentación semántica en tiempo real en teléfonos, cámaras y sistemas de asistencia a la conducción sin depender de la nube. La licencia BSD-3-Clause facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN FFNet (fuss-free network) para segmentación semántica |
| Parámetros totales | 26,8 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Resolución de entrada | 1024x512 píxeles |
| Clases de salida | 19 (Cityscapes) |
| Tipos de cuantización | float y w8a8 |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLite (artefactos pre-exportados); checkpoint PyTorch original |
| Tamaño del modelo | 102 MB (float), 26,0 MB (w8a8) |
| Tamaño del repositorio | 11,0 GB |

## Arquitectura y entrenamiento

FFNet (Fuss-Free Network) es una arquitectura convolucional diseñada explícitamente para segmentación semántica en tiempo real. El término "fuss-free" hace referencia a la ausencia de componentes considerados innecesariamente complejos en otras arquitecturas de segmentación: no emplea decodificadores multi-escala elaborados ni módulos de attention, sino una estructura encoder-decoder convolucional simplificada que prioriza la eficiencia computacional y la facilidad de despliegue en hardware heterogéneo. La variante 78S corresponde a un escalado concreto de la familia, y el sufijo "LowRes" indica una entrada de 1024x512 píxeles en lugar de resoluciones mayores.

El modelo está entrenado sobre Cityscapes, un dataset de referencia de escenas urbanas con anotaciones densas a nivel de píxel en 19 clases. El checkpoint utilizado se denomina `ffnet78S_BCC_cityscapes_state_dict_quarts_pre_down`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento posteriores como RLHF o DPO (no aplicables, por otra parte, a un modelo discriminativo de visión). La innovación técnica destacable es la exportación optimizada para NPU de Qualcomm mediante Qualcomm AI Hub Workbench, con compilación específica por chipset y cuantización w8a8 que reduce el tamaño a 26 MB y acelera la inferencia.

## Capacidades

- Segmentación semántica densa a nivel de píxel sobre imágenes de escenas urbanas.
- Clasificación en 19 clases de Cityscapes: calzada, acera, edificio, muro, valla, poste, semáforo, señal de tráfico, vegetación, terreno, cielo, persona, ciclista, coche, motocicleta, camión, autobús, tren y motocicleta/bicicleta (según la taxonomía estándar de Cityscapes).
- Inferencia en tiempo real sobre NPU de chipsets Snapdragon y plataformas Dragonwing.
- Despliegue en dispositivos Android y embebidos mediante ONNX Runtime, QNN SDK o TFLite.
- Soporte de cuantización w8a8 para reducir huella de memoria y latencia.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni procesamiento multilingüe: es un modelo puramente visual y discriminativo.

## Casos de uso

- Asistencia a la conducción (ADAS): segmentación en tiempo real de la calzada, carriles, peatones y vehículos para sistemas de alerta de colisión o mantenimiento de carril, aprovechando latencias de 2-10 ms en NPU de Snapdragon 8 Elite y X Elite.
- Realidad aumentada urbana: sustitución o superposición de elementos de la escena (cielo, edificios, calzada) en aplicaciones móviles de AR, con el modelo ejecutándose en la NPU del teléfono sin conexión a la nube.
- Vehículos autónomos y robótica de bajo consumo: percepción semántica embebida en plataformas Dragonwing (QCS8550, IQ-8275, IQ-9075) para robots de reparto, drones o vehículos industriales con restricciones térmicas y energéticas.
- Videovigilancia inteligente en el borde: detección y clasificación de personas, vehículos y zonas de tránsito en cámaras IP con SoC Qualcomm, procesando localmente para preservar privacidad y reducir ancho de banda.
- Mapeo y análisis geoespacial: generación automática de mapas de ocupación del suelo y clasificación de vías urbanas a partir de imágenes capturadas por flotas de vehículos o satélites de baja altitud.
- Aplicaciones de movilidad accesible: descripción automática de escenas urbanas para personas con discapacidad visual, identificando aceras, pasos de peatones y obstáculos en tiempo real desde la cámara del móvil.
- Preprocesamiento en pipelines de visión: generación de máscaras semánticas como entrada para modelos posteriores de detección, tracking o planificación de trayectorias en sistemas autónomos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mIoU, etc.) en la información disponible. Sí se dispone de métricas de latencia y memoria por chipset, ejecutando ONNX Runtime sobre NPU:

| Chipset | Precisión | Tiempo de inferencia (ms) | Rango de memoria pico (MB) |
|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 Mobile | float | 7,22 | 7 - 195 |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | float | 8,447 | 6 - 186 |
| Snapdragon 8 Elite Gen 6 Mobile | float | 8,863 | 12 - 189 |
| Snapdragon X2 Elite | float | 10,274 | 10 - 10 |
| Snapdragon 8 Elite For Galaxy Mobile | float | 10,692 | 5 - 183 |
| Snapdragon 8 Gen 3 Mobile | float | 13,497 | 13 - 249 |
| Snapdragon X Elite | float | 19,273 | 47 - 47 |
| Snapdragon 8 Gen 1 Mobile | float | 32,918 | 11 - 241 |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | w8a8 | 2,263 | 0 - 198 |
| Snapdragon 8 Elite For Galaxy Mobile | w8a8 | 3,04 | 0 - 191 |
| Snapdragon X2 Elite | w8a8 | 2,681 | 4 - 4 |
| Snapdragon 8 Gen 3 Mobile | w8a8 | 3,858 | 3 - 248 |
| Snapdragon X Elite | w8a8 | 5,745 | 26 - 26 |
| Snapdragon 8 Gen 1 Mobile | w8a8 | 6,842 | 3 - 251 |

La cuantización w8a8 reduce la latencia aproximadamente a un tercio respecto a float en los mismos chipsets, a costa de una posible pérdida de precisión no cuantificada en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Clases | Licencia | Enfoque |
|---|---|---|---|---|---|
| FFNet-78S-LowRes | 26,8 M | 1024x512 | 19 | BSD-3-Clause | CNN eficiente para NPU Qualcomm |
| FFNet-78S (original) | no disponible | mayor que LowRes | 19 | BSD-3-Clause | CNN eficiente, mayor resolución |
| Modelos tipo DeepLabv3+ / SegFormer | no disponible | variable | 19 | variable | Segmentación semántica generalista |

No se dispone en la información proporcionada de datos de rendimiento (mIoU) ni de especificaciones detalladas de los modelos alternativos que permitan una comparación cuantitativa rigurosa. La comparativa se limita a la categoría funcional y a la licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre Cityscapes (escenas urbanas europeas), por lo que su generalización a otros dominios (interiores, paisajes rurales, imágenes aéreas) es limitada.
- La resolución de entrada baja (1024x512) reduce el detalle en objetos pequeños o lejanos, lo que puede degradar la segmentación de peatones distantes o señales de tráfico.
- No se han publicado métricas de precisión (mIoU) en la información disponible, lo que impide evaluar la pérdida de calidad introducida por la cuantización w8a8.
- El modelo es discriminativo y no genera texto; no debe confundirse con un modelo de lenguaje.
- Aunque la licencia BSD-3-Clause permite uso comercial, conviene verificar las condiciones de uso del dataset Cityscapes y de los artefactos exportados por Qualcomm AI Hub.
- El repositorio ocupa 11,0 GB debido a los múltiples artefactos exportados; el despliegue real solo requiere el archivo correspondiente al runtime y chipset objetivo.
- No se dispone de información sobre sesgos del dataset ni sobre el rendimiento en condiciones de iluminación adversas (noche, lluvia), que suelen ser puntos débiles de los modelos entrenados en Cityscapes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/FFNet-78S-LowRes
- Página en Qualcomm AI Hub: https://aihub.qualcomm.com/models/ffnet_78s_lowres
- Repositorio de implementación FFNet: https://github.com/Qualcomm-AI-research/FFNet
- Librería Qualcomm AI Hub Models (FFNet-78S-LowRes): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/ffnet_78s_lowres
- Paper de referencia (arXiv:2206.08236): https://arxiv.org/abs/2206.08236
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Web corporativa de Qualcomm: https://www.qualcomm.com/
