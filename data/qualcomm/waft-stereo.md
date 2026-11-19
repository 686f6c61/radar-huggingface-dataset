# qualcomm/WAFT-Stereo

## Resumen

WAFT-Stereo es un modelo de estimación de disparidad (depth estimation) a partir de pares estéreo rectificados, desarrollado originalmente por el grupo Princeton-VL y empaquetado por Qualcomm para su despliegue optimizado en dispositivos con aceleradores Snapdragon y Dragonwing. El modelo estima un mapa de disparidad por píxel utilizando un esquema de refinamiento iterativo basado en warping en lugar de un volumen de coste 4D, lo que reduce el coste computacional y de memoria frente a arquitecturas estéreo clásicas.

Esta ficha corresponde a la variante publicada en Hugging Face por Qualcomm (`qualcomm/WAFT-Stereo`), que no contiene pesos en formato estándar de PyTorch sino artefactos pre-exportados (ONNX float) listos para ejecutarse sobre el NPU de los chipsets Qualcomm mediante QAIRT 2.51 y ONNX Runtime 1.30.0. El checkpoint de referencia es WAFT-Stereo SynLarge DAv2S-4 (`DAv2S-4.pth`), con entrada de 240x320 píxeles y salida de mapa de disparidad.

La relevancia actual del modelo radica en su orientación a inferencia en el borde: latencias de pocos milisegundos por par estéreo en NPU de gama alta (por ejemplo, 22,557 ms en Snapdragon 8 Elite Gen 5 for Galaxy en la etapa de regresión) y un consumo de memoria contenido, lo que lo hace apto para visión estéreo en robótica, automoción, gafas de realidad aumentada o drones donde no es viable ejecutar un modelo estéreo de gran tamaño en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red estéreo con refinamiento iterativo basado en warping (WAFT-Stereo), sin volumen de coste 4D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 240x320) |
| Tipos de cuantizacion | float (ONNX); el model card menciona variantes `mixed_with_float` para encoder y clasificación |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (float), artefacto `waft_stereo-onnx-float.zip`; checkpoint original `DAv2S-4.pth` |

## Arquitectura y entrenamiento

WAFT-Stereo sigue la línea de los métodos estéreo basados en warping iterativo: en lugar de construir un volumen de coste 4D completo y agregarlo con convoluciones 3D (como hacen arquitecturas tipo PSMNet o RAFT-Stereo), el modelo predice un campo de flujo/disparidad inicial y lo refina iterativamente mediante operaciones de warping sobre las características extraídas, actualizando la estimación en cada iteración. Esta estrategia reduce el uso de memoria y facilita el despliegue en hardware con recursos limitados, a costa de depender de un número de iteraciones configurable.

El checkpoint empaquetado por Qualcomm corresponde a la variante SynLarge DAv2S-4, es decir, un modelo entrenado sobre datos sintéticos (SynLarge) con un backbone de extracción de características tipo DAv2S-4. El model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de ajuste fino con RLHF o DPO (no aplicables en un modelo de visión). La innovación técnica destacable es la exportación a ONNX con partición encoder/clasificación/regresión y su compilación para NPU Qualcomm mediante QAIRT, incluyendo variantes de precisión mixta que reducen el tamaño del encoder de 177 MB a 53,7 MB y el de clasificación de 98,2 MB a 27,6 MB.

## Capacidades

- Estimación de disparidad densa por píxel a partir de un par estéreo rectificado (imagen izquierda e imagen derecha RGB).
- Refinamiento iterativo de la disparidad mediante warping, con precisión controlable según el número de iteraciones.
- Salida de mapa de disparidad, convertible a profundidad si se conoce la línea base y la focal de la cámara.
- Ejecución en NPU de chipsets Qualcomm (Snapdragon 8 Elite, 8 Elite Gen 5/Gen 6, X Elite, X2 Elite, Dragonwing IQ-8275, IQ-9075, IQ-X7181, QCS8550, QCS8450, Q-8750).
- Exportación personalizable mediante la librería Qualcomm AI Hub Models (pesos ajustados, formas de entrada personalizadas, dispositivo y runtime objetivo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Visión estéreo en robótica móvil: el modelo genera mapas de disparidad a 240x320 en pocos milisegundos sobre NPU, lo que permite reconstrucción de profundidad en tiempo real para navegación y evitación de obstáculos en robots con presupuesto energético limitado.
- Profundidad en gafas de realidad aumentada: la latencia de 22,557 ms en Snapdragon 8 Elite Gen 5 for Galaxy para la etapa de regresión permite actualizar la percepción de profundidad a más de 40 FPS, suficiente para anclaje de contenido virtual y mapeo espacial.
- Automoción y ADAS de bajo coste: con pares estéreo rectificados de cámaras de bajo consumo, el modelo puede estimar distancia a obstáculos en el rango cercano, integrándose en plataformas Dragonwing QCS8550 o Q-8750 orientadas a vehículos.
- Drones y UAV: el consumo de memoria contenido (en el rango de 3 a 262 MB según etapa y chipset) y la ejecución en NPU permiten incorporar percepción de profundidad a bordo sin GPU dedicada.
- Escaneo 3D y fotogrametría de corto alcance: la disparidad por píxel sirve como entrada para pipelines de reconstrucción densa en aplicaciones de digitalización de objetos o inspección industrial.
- Investigación en visión por computador: al estar liberado bajo BSD-3-Clause y con código de exportación abierto, sirve como referencia reproducible para comparar métodos de refinamiento iterativo frente a volúmenes de coste 4D en entornos embebidos.
- Prototipado en Android: los artefactos ONNX y la integración con Qualcomm AI Hub Workbench permiten validar el modelo en dispositivos reales antes de comprometerse con un diseño de producto.

## Benchmarks y rendimiento

El model card no publica métricas de calidad de disparidad (EPE, D1, bad-x) sobre datasets como KITTI, Middlebury o ETH3D. Sí se publican métricas de latencia y memoria por chipset y etapa del modelo. Se recogen a continuación las más representativas en precisión float con runtime ONNX:

| Etapa | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de cómputo |
|---|---|---|---|---|
| classification | Snapdragon 8 Elite Extreme Gen 6 Mobile | 4,724 | 7 - 263 | NPU |
| classification | Snapdragon 8 Elite Gen 5 for Galaxy | 5,676 | 3 - 262 | NPU |
| classification | Snapdragon X2 Elite | 6,134 | 7 - 7 | NPU |
| encoder | Snapdragon 8 Elite Extreme Gen 6 Mobile | 7,773 | 25 - 342 | NPU |
| encoder | Snapdragon 8 Elite Gen 5 for Galaxy | 9,78 | 22 - 347 | NPU |
| encoder | Snapdragon X2 Elite | 10,625 | 34 - 34 | NPU |
| regression | Snapdragon 8 Elite Gen 5 for Galaxy | 22,557 | 13 - 442 | NPU |
| regression | Snapdragon X2 Elite | 23,062 | 23 - 23 | NPU |
| regression | Snapdragon 8 Gen 1 Mobile | 85,479 | 1 - 655 | NPU |

No se han publicado resultados de benchmarks de calidad (EPE, D1) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU; el modelo se ejecuta sobre NPU Qualcomm. El tamaño de los artefactos float es de 177 MB (encoder), 98,2 MB (clasificación) y 262 MB (regresión); las variantes `mixed_with_float` reducen encoder a 53,7 MB y clasificación a 27,6 MB.
- GPU recomendadas: no aplica para el despliegue objetivo. Para reproducción del modelo original en PyTorch se requeriría una GPU convencional, pero el model card no especifica requisitos.
- ¿Cabe en consumer GPU? El modelo está pensado para NPU móvil; no se documentan requisitos para GPU de consumo.
- Opciones de despliegue: ONNX Runtime 1.30.0 con QAIRT 2.51 sobre chipsets Qualcomm; exportación personalizada mediante Qualcomm AI Hub Models; validación remota con Qualcomm AI Hub Workbench.
- Latencia y throughput: entre 4,7 y 85,5 ms por etapa según chipset, con picos de memoria entre 1 y 655 MB. En el chipset más rápido (Snapdragon 8 Elite Extreme Gen 6 Mobile) la etapa de clasificación baja de 5 ms.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto/Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WAFT-Stereo (esta ficha) | Estéreo con refinamiento iterativo por warping | Par estéreo RGB | 240x320 | BSD-3-Clause | Hugging Face (ONNX) + GitHub Princeton-VL |
| RAFT-Stereo | Estéreo con refinamiento iterativo (óptico adaptado) | Par estéreo RGB | Configurable | BSD-3-Clause (repo original) | GitHub Princeton-VL |
| PSMNet | Estéreo con volumen de coste 3D | Par estéreo RGB | Configurable | MIT (repo original) | GitHub |
| Depth Anything V2 | Monocular depth (no estéreo) | Imagen única | Configurable | Apache-2.0 / variantes | Hugging Face |

La comparación se limita a categoría y disponibilidad: el model card no proporciona métricas de calidad que permitan una comparación cuantitativa con RAFT-Stereo, PSMNet o Depth Anything V2. WAFT-Stereo se distingue por su empaquetado específico para NPU Qualcomm y su licencia permisiva BSD-3-Clause.

## Limitaciones y advertencias

- El modelo solo procesa pares estéreo rectificados; no acepta imágenes monoculares ni pares sin rectificar, lo que exige calibración previa de la cámara.
- La resolución de entrada está fijada en 240x320 en el artefacto pre-exportado; para otras resoluciones es necesario reexportar con la librería de Qualcomm.
- No se publican métricas de calidad de disparidad (EPE, D1) en el model card, por lo que no es posible evaluar su precisión frente a alternativas sin ejecutar pruebas propias.
- El rendimiento depende críticamente del chipset: la latencia varía de 4,7 ms a 85,5 ms entre el Snapdragon 8 Elite Extreme Gen 6 y el Snapdragon 8 Gen 1 en la etapa de regresión.
- La licencia BSD-3-Clause permite uso comercial con atribución, pero conviene revisar las condiciones de los artefactos pre-exportados y del checkpoint original `DAv2S-4.pth`.
- Al ser un modelo de visión, no tiene capacidades de lenguaje, tool calling ni agentes; no debe evaluarse con los criterios habituales de LLM.
- Riesgo de alucinación no aplicable; el riesgo equivalente es la generación de disparidad incorrecta en regiones oclusivas, texturas repetitivas o superficies sin textura.
- El model card no documenta sesgos ni composición del dataset de entrenamiento (SynLarge), lo que limita el análisis de robustez ante dominios distintos del sintético.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/WAFT-Stereo
- Qualcomm AI Hub — WAFT-Stereo: https://aihub.qualcomm.com/models/waft_stereo
- Repositorio Qualcomm AI Hub Models (WAFT-Stereo): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/waft_stereo
- Implementación original WAFT-Stereo (Princeton-VL): https://github.com/princeton-vl/WAFT-Stereo
- Descarga del artefacto ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/waft_stereo/releases/v0.67.0/waft_stereo-onnx-float.zip
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Paper referenciado (arXiv:2603.24836): no disponible como enlace directo en la información proporcionada
- Qualcomm (sitio corporativo): https://www.qualcomm.com/
