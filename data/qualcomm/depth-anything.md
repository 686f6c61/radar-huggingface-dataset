# qualcomm/Depth-Anything

## Resumen

Depth-Anything es un modelo de estimacion de profundidad monocular (depth estimation) desarrollado originalmente por el equipo de investigacion de TikTok/ByteDance y publicado en el paper arXiv:2401.10891. La version que nos ocupa, `qualcomm/Depth-Anything`, es un export optimizado del checkpoint DepthAnything_Small para su despliegue en dispositivos con hardware Qualcomm (Snapdragon y Dragonwing), compilado mediante Qualcomm AI Hub Workbench. No se trata de un modelo nuevo, sino de un artefacto de despliegue listo para produccion en el ecosistema Qualcomm.

El modelo resuelve el problema de estimar un mapa de profundidad denso a partir de una unica imagen RGB, una tarea fundamental en vision por computador con aplicaciones directas en realidad aumentada, fotografia computacional, robotica y conduccion autonoma. Con 24,7 millones de parametros y una resolucion de entrada de 518x518, es un modelo compacto pensado para inferencia en tiempo real en el borde (edge).

Su relevancia actual radica en que demuestra la viabilidad de ejecutar modelos de vision de calidad en la NPU de telefonos y plataformas embebidas con latencias de entre 10 y 75 ms, segun el chipset y la precision, lo que habilita casos de uso que antes requeran GPU de escritorio o cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Depth-Anything, variante Small; implementacion de Hugging Face Transformers) |
| Parametros totales | 24,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 518x518 px) |
| Tipos de cuantizacion | float (FP), w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (assets pre-exportados); PyTorch en el repo |

## Arquitectura y entrenamiento

El modelo subyacente es Depth-Anything en su variante Small, basada en un backbone transformer de tipo DINOv2 (ViT) adaptado para estimacion de profundidad densa. La implementacion de referencia se encuentra en la libreria `transformers` de Hugging Face. El export de Qualcomm mantiene la arquitectura original pero la compila para ejecutarse en la NPU de los chipsets Snapdragon y Dragonwing mediante QAIRT 2.51.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un modelo de vision de este tipo). El paper original (arXiv:2401.10891) es la referencia para los detalles de entrenamiento. La innovacion destacable de este repositorio no es arquitectonica sino de despliegue: la exportacion a ONNX, QNN_DLC y TFLITE con soporte para cuantizacion w8a16, lo que reduce el tamano del modelo de 94,3 MB (float) y acelera la inferencia en NPU.

## Capacidades

- Estimacion de profundidad densa a partir de una imagen RGB de entrada (518x518 px).
- Generacion de mapas de profundidad por pixel, utiles para reconstruccion 3D y analisis de escena.
- Inferencia en tiempo real en NPU de dispositivos Qualcomm (Snapdragon 8 Gen 1 en adelante, Dragonwing IQ-8275, IQ-9075, QCS8550, QCS8450, entre otros).
- Soporte de dos precisiones: float y w8a16, con la segunda practicamente duplicando el rendimiento.
- Exportacion personalizada mediante la libreria Qualcomm AI Hub Models (pesos fine-tuneados, formas de entrada personalizadas, configuraciones de dispositivo).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente de vision).

## Casos de uso

- Realidad aumentada en movil: el modelo genera mapas de profundidad en 10-25 ms en Snapdragon 8 Elite, lo que permite oclusion y colocacion de objetos virtuales coherente con la escena en tiempo real.
- Fotografia computacional: modo retrato y desenfoque de fondo basado en profundidad estimada, ejecutado en la NPU sin enviar la imagen a la nube, lo que preserva la privacidad.
- Robotica y drones: percepcion de profundidad monocular para evitacion de obstaculos y navegacion, con latencias de 20-50 ms en plataformas Dragonwing IQ-8275 e IQ-9075.
- Automocion y ADAS de bajo coste: estimacion de distancia a peatones y vehiculos usando una sola camara, como complemento a sensores LiDAR o radar en plataformas QCS8550.
- Escaneo 3D y modelado: generacion de nubes de puntos a partir de fotografias para reconstruccion de interiores o patrimonio, ejecutable en dispositivos moviles.
- Videojuegos y efectos visuales: generacion de mapas de profundidad por frame para post-procesado (depth of field, niebla volumetrica) en tiempo real en el propio dispositivo.
- Domotica y camaras de seguridad: deteccion de presencia y analisis de escena con estimacion de profundidad en camaras IP con SoC Qualcomm, sin coste de cloud.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks academicos (como MMLU, HumanEval o GSM8K, no aplicables a este modelo). Si incluye una tabla de rendimiento de inferencia por dispositivo, de la que se extrae esta seleccion representativa:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 Mobile | ONNX | float | 13,929 | 3 - 375 |
| Snapdragon 8 Elite Gen 6 Mobile | ONNX | float | 24,08 | 5 - 380 |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | float | 22,773 | 2 - 385 |
| Snapdragon X2 Elite | ONNX | float | 20,003 | 5 - 5 |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 34,463 | 5 - 495 |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 74,353 | 1 - 505 |
| Dragonwing IQ-8275 | ONNX | float | 50,454 | 3 - 10 |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | w8a16 | 10,497 | 1 - 408 |
| Snapdragon X2 Elite | ONNX | w8a16 | 10,848 | 4 - 4 |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a16 | 18,038 | 3 - 499 |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a16 | 31,5 | 3 - 502 |
| Dragonwing IQ-8275 | ONNX | w8a16 | 23,606 | 2 - 6 |

En todos los casos la unidad de computo principal es la NPU. La cuantizacion w8a16 reduce el tiempo de inferencia aproximadamente a la mitad respecto a float en los chipsets mas recientes.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo ocupa 94,3 MB en float y menos en w8a16. La memoria pico reportada en NPU oscila entre 2 y 505 MB segun chipset y precision.
- GPU recomendadas: el modelo esta optimizado para NPU de Qualcomm, no para GPU de escritorio. Para inferencia en GPU convencional puede usarse el checkpoint original de Hugging Face Transformers.
- Cabe en cualquier dispositivo movil moderno con NPU Qualcomm; no requiere GPU dedicada.
- Opciones de despliegue: ONNX Runtime (1.30.0), Qualcomm QAIRT 2.51 (QNN_DLC), TFLITE, y la libreria Qualcomm AI Hub Models para exportacion personalizada.
- Latencia: entre 10,5 ms (w8a16, Snapdragon 8 Elite Gen 5) y 85 ms (w8a16, Dragonwing QCS6490); en float entre 13,9 ms y 74,4 ms.
- Throughput: no disponible de forma explicita; puede derivarse de la latencia (aproximadamente 40-95 FPS en los chipsets mas rapidos en w8a16).

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Depth-Anything (Qualcomm, Small) | 24,7 M | 518x518 | MIT | Export optimizado para NPU Qualcomm | Hugging Face + Qualcomm AI Hub |
| Depth-Anything (original, Small) | 24,7 M | 518x518 | MIT (según repo original) | Checkpoint PyTorch de referencia | Hugging Face Transformers |
| MiDaS (DPT) | no disponible en la informacion | no disponible | MIT (repo original) | Estimacion de profundidad monocular | Hugging Face |
| Depth Anything V2 | no disponible en la informacion | no disponible | no disponible | Sucesor del modelo | Hugging Face |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos entre estos modelos; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de vision: no procesa texto ni mantiene conversaciones; no debe evaluarse con benchmarks linguisticos.
- La precision de profundidad es relativa, no metrica absoluta, salvo que se calibre; no es adecuado para medicion de distancias exactas sin post-proceso.
- El export esta optimizado exclusivamente para hardware Qualcomm; en otros aceleradores puede no funcionar o rendir por debajo del checkpoint original.
- Resolucion de entrada fija de 518x518; imagenes de otras proporciones requieren redimensionado, lo que puede introducir distorsion.
- Riesgo de alucinacion en regiones con texturas repetitivas, superficies reflectantes o transparencias, comun en modelos de profundidad monoculares.
- Sesgos potenciales heredados del dataset de entrenamiento original (no documentados en la informacion disponible); puede fallar en escenas no representadas.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del checkpoint original y de los datasets de entrenamiento subyacentes.
- La cuantizacion w8a16 puede degradar ligeramente la calidad del mapa de profundidad frente a float; validar en el caso de uso concreto antes de produccion.
- No se documentan idiomas porque el modelo no procesa lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/Depth-Anything
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/depth_anything
- Repositorio GitHub Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/depth_anything
- Implementacion de referencia en Transformers: https://github.com/huggingface/transformers/tree/main/src/transformers/models/depth_anything
- Paper original: https://arxiv.org/abs/2401.10891
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Web de Qualcomm: https://www.qualcomm.com/
