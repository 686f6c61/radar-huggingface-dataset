# qualcomm/FFNet-78S

## Resumen

FFNet-78S es una red neuronal convolucional para segmentación semántica de imágenes de escenas de calle, desarrollada originalmente por Qualcomm AI Research y distribuida en este repositorio como un conjunto de artefactos precompilados y optimizados para su ejecución en dispositivos con aceleración NPU de Qualcomm. El modelo asigna una clase por píxel (carretera, acera, peatón, vehículo, etc.) sobre un total de 19 categorías y está entrenado con el conjunto de datos Cityscapes. Su relevancia actual radica en que permite segmentación densa en tiempo real en hardware móvil y embebido, con latencias del orden de milisegundos.

La arquitectura subyacente es FFNet ("fuss-free network"), una red convolucional sin mecanismos de atención ni componentes exóticos, diseñada explícitamente para maximizar la eficiencia en inferencia. El checkpoint incluido tiene 27,5 millones de parámetros y procesa entradas de resolución 2048x1024. El repositorio no contiene pesos en formato PyTorch convencional, sino exportaciones a ONNX, QNN_DLC y TFLite, tanto en precisión float como cuantizadas w8a8.

Este repositorio es relevante para desarrolladores que necesitan desplegar segmentación semántica en dispositivos Snapdragon o plataformas Dragonwing sin pasar por el proceso completo de exportación y compilación. Los artefactos están compilados con QAIRT 2.51 y perfilados en una amplia gama de chipsets, con tiempos de inferencia medidos que van desde 4,2 ms en el Snapdragon 8 Elite Gen 5 hasta 55 ms en plataformas de gama inferior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FFNet (red neuronal convolucional, sin atención) |
| Parametros totales | 27,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 2048x1024 píxeles) |
| Tipos de cuantizacion | float y w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLite (float y w8a8); checkpoint original en PyTorch |

## Arquitectura y entrenamiento

FFNet es una red completamente convolucional pensada para segmentación semántica eficiente. El diseño "fuss-free" evita mecanismos costosos como atención global o bloques transformer, y se apoya en un backbone convolucional con conexiones que permiten resolver la tarea con un coste computacional bajo en hardware especializado. El modelo consume imágenes de 2048x1024 píxeles y produce un mapa de segmentación con 19 clases, correspondientes a las categorías de Cityscapes (carretera, acera, edificio, vegetación, cielo, peatón, vehículo, etc.).

El checkpoint referenciado en la model card es `ffnet78S_dBBB_cityscapes_state_dict_quarts`, entrenado sobre Cityscapes. La información disponible no detalla el número de tokens o imágenes de entrenamiento, la composición exacta del dataset más allá de Cityscapes, ni si se aplicaron técnicas de ajuste fino con refuerzo o preferencias (no aplicable en un modelo de segmentación). La innovación técnica destacable no está en el entrenamiento sino en el pipeline de despliegue: exportación a múltiples runtimes (ONNX Runtime, QNN, TFLite) con compilación para NPU de Qualcomm y cuantización w8a8 que reduce el tamaño del modelo de 105 MB a 26,7 MB manteniendo la operativa en el acelerador.

## Capacidades

- Segmentación semántica densa por píxel en 19 clases de escenas de calle (Cityscapes).
- Procesamiento de imágenes de alta resolución (2048x1024) en una sola pasada.
- Inferencia acelerada en NPU de Qualcomm (Snapdragon y Dragonwing) mediante artefactos QNN_DLC, ONNX y TFLite.
- Ejecución en precisión float y en cuantización w8a8, con reducción de memoria y latencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales más allá de la segmentación de imagen.

## Casos de uso

- Conducción autónoma y ADAS: el modelo segmenta la escena de calle en clases como carretera, acera, peatón y vehículo, proporcionando una máscara densa que alimenta módulos de planificación de trayectoria y detección de obstáculos. Su latencia de 4-14 ms en chipsets de gama alta lo hace compatible con bucles de percepción en tiempo real.
- Realidad aumentada sobre cámara: en aplicaciones móviles, la segmentación permite separar el cielo, la carretera o los edificios para aplicar efectos visuales o sustituciones de fondo con una latencia inferior a un fotograma a 30 fps en Snapdragon 8 Gen 3 (7,6 ms en w8a8).
- Mapeo y anotación automática de imágenes: generación de máscaras de segmentación para preetiquetar grandes volúmenes de imágenes de calle en pipelines de anotación, reduciendo el coste manual antes de una revisión humana.
- Robótica móvil y vehículos de reparto: percepción de bajo consumo en plataformas Dragonwing (QCS6490, IQ-8275) para clasificar el terreno transitable frente a obstáculos, con inferencia en NPU y un consumo de memoria contenido (6-10 MB en w8a8 en IQ-8275).
- Videovigilancia urbana y análisis de tráfico: segmentación de flujos de vídeo para distinguir peatones, vehículos y calzada en cámaras fijas, aprovechando la resolución 2048x1024 para cubrir escenas amplias con un único pase.
- Drones y cámaras inteligentes: procesamiento a bordo de imágenes de alta resolución para identificar zonas seguras de aterrizaje o trayectorias transitables, donde el formato TFLite w8a8 (26,7 MB) permite el despliegue en dispositivos con memoria limitada.

## Benchmarks y rendimiento

La model card no publica métricas de calidad de segmentación (mIoU, precisión por clase) sobre Cityscapes. Sí se incluyen mediciones de latencia y memoria por chipset y precisión, de las que se reproduce una selección:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de cómputo |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 Mobile | ONNX | float | 13,084 | 12 - 206 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | float | 14,278 | 5 - 221 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | w8a8 | 4,255 | 2 - 212 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | ONNX | w8a8 | 5,723 | 1 - 209 | NPU |
| Snapdragon X2 Elite | ONNX | w8a8 | 4,784 | 7 - 7 | NPU |
| Snapdragon X Elite | ONNX | w8a8 | 12,187 | 22 - 22 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a8 | 7,585 | 9 - 291 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a8 | 16,282 | 7 - 293 | NPU |
| Dragonwing QCS6490 | ONNX | w8a8 | 49,493 | 6 - 9 | NPU |
| Dragonwing IQ-8275 | ONNX | w8a8 | 11,297 | 6 - 10 | NPU |
| Dragonwing QCS8550 (Proxy) | ONNX | w8a8 | 11,64 | 6 - 151 | NPU |
| QCS8450 | ONNX | w8a8 | 16,282 | 7 - 293 | NPU |

No se han publicado resultados de benchmarks de calidad (mIoU) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo no está pensado para GPU de escritorio; en su formato float ocupa 105 MB y en w8a8 26,7 MB de almacenamiento. La memoria pico medida en NPU oscila entre 1 y 296 MB según chipset y precisión.
- GPU recomendadas: no aplica; el despliegue objetivo es NPU de Qualcomm (Snapdragon 8 Gen 1/3, 8 Elite, X Elite, X2 Elite, Dragonwing QCS6490/8550, IQ-8275, IQ-9075, Q-8750, entre otros).
- Cabe en hardware de consumo: sí, en dispositivos móviles y portátiles con Snapdragon; no requiere GPU dedicada.
- Opciones de despliegue: ONNX Runtime (1.30.0), QNN (QAIRT 2.51) y TFLite. La exportación con configuraciones propias se realiza mediante la librería Qualcomm AI Hub Models.
- Latencia y throughput estimados: 4,2-5,7 ms en w8a8 sobre Snapdragon 8 Elite Gen 5 / Elite (aproximadamente 175-235 FPS); 13-19 ms en float sobre los mismos chipsets (aproximadamente 53-77 FPS); 49,5 ms en w8a8 sobre Dragonwing QCS6490 (aproximadamente 20 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| FFNet-78S | 27,5 M | 2048x1024, 19 clases | BSD-3-Clause | Hugging Face, Qualcomm AI Hub |
| Alternativas de segmentación semántica de calle | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos comparables que permitan una comparación cuantitativa fiable. Se recomienda consultar la documentación de Qualcomm AI Hub para contrastar con otros modelos de segmentación del catálogo.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre Cityscapes; su rendimiento fuera de dominios de escenas de calle (interiores, imágenes aéreas, otros sensores) puede degradarse de forma significativa.
- No se han publicado métricas de calidad (mIoU) en la información disponible, por lo que no es posible evaluar su precisión objetiva frente a alternativas.
- Riesgo de errores de segmentación en condiciones de iluminación adversas, oclusiones o clases poco representadas en el dataset de entrenamiento.
- La cuantización w8a8 puede introducir una pérdida de precisión adicional no cuantificada en la información disponible.
- El repositorio contiene artefactos compilados para hardware Qualcomm; la inferencia en otras plataformas requiere reexportación desde el checkpoint original.
- Licencia BSD-3-Clause: permite uso comercial y modificación, con obligación de conservar el aviso de copyright y la cláusula de exención de responsabilidad; no se ofrece garantía.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier caso de uso debe plantearse como un componente de percepción dentro de un pipeline mayor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/FFNet-78S
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/ffnet_78s
- Repositorio de implementación original: https://github.com/Qualcomm-AI-research/FFNet
- Librería Qualcomm AI Hub Models (exportación): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/ffnet_78s
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Paper de referencia (arXiv:2206.08236): https://arxiv.org/abs/2206.08236
