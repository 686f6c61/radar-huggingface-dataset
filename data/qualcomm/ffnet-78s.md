# qualcomm/FFNet-78S

## Resumen

FFNet-78S es una red neuronal convolucional diseñada para segmentación semántica de imágenes de escenas urbanas, desarrollada originalmente por Qualcomm AI Research. El modelo asigna una clase por píxel entre 19 categorías (carretera, acera, peatón, vehículo, etc.) y está entrenado sobre el dataset Cityscapes. La versión publicada en este repositorio es un paquete de artefactos pre-exportados y optimizados para su despliegue en dispositivos con hardware Qualcomm (SoC Snapdragon y plataformas Dragonwing), no un checkpoint de PyTorch listo para entrenamiento.

El modelo responde al paradigma "fuss-free network": una arquitectura sin operaciones costosas ni trucos de entrenamiento complejos, pensada para obtener una relación calidad/coste computacional adecuada en inferencia en el borde. Con 27,5 millones de parámetros y una resolución de entrada de 2048x1024, el modelo ocupa 105 MB en precisión float y 26,7 MB en cuantización w8a8.

Su relevancia actual radica en que ejemplifica el flujo de trabajo de Qualcomm AI Hub: un modelo de visión por computador compilado y perfilado para ejecutarse en la NPU de móviles, portátiles y plataformas IoT, con latencias medidas de 4,2 ms a 142 ms según chipset y precisión. Es útil para desarrolladores que necesitan segmentación semántica en tiempo real en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (FFNet, "fuss-free network"); detalles de capas no disponibles |
| Parametros totales | 27,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 2048x1024 píxeles) |
| Tipos de cuantizacion | float y w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (float y w8a8); checkpoint original PyTorch referenciado como `ffnet78S_dBBB_cityscapes_state_dict_quarts` |
| Clases de salida | 19 |
| Resolucion de entrada | 2048x1024 |
| Tamano del modelo | 105 MB (float), 26,7 MB (w8a8) |
| Dataset de entrenamiento | Cityscapes |
| Runtime soportado | ONNX Runtime 1.30.0, QAIRT 2.50 |

## Arquitectura y entrenamiento

FFNet-78S es una red convolucional para segmentación semántica densa. La model card no detalla la composición exacta de bloques, pero la designación "fuss-free" y el sufijo "78S" remiten a la familia FFNet publicada por Qualcomm AI Research, cuyo objetivo es eliminar operaciones y trucos de entrenamiento costosos manteniendo una precisión competitiva en segmentación de escenas urbanas. El modelo se entrenó sobre Cityscapes, un dataset de imágenes de conducción urbana con anotaciones densas por píxel en 19 clases.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición exacta del dataset más allá de Cityscapes, ni sobre el uso de técnicas de ajuste fino (RLHF, DPO u otras), que no aplican a un modelo de visión de este tipo. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, por no ser relevantes en esta arquitectura. La aportación técnica principal de este repositorio es la exportación y optimización del modelo para NPU de Qualcomm, con artefactos en ONNX, QNN_DLC y TFLITE en precisión float y w8a8.

## Capacidades

- Segmentación semántica por píxel de imágenes de escenas urbanas en 19 clases (carretera, acera, peatón, vehículo, señalización, vegetación, etc.).
- Inferencia a resolución completa de 2048x1024 sin redimensionado obligatorio.
- Ejecución en NPU de SoC Snapdragon y plataformas Dragonwing de Qualcomm.
- Cuantización w8a8 que reduce el tamaño del modelo de 105 MB a 26,7 MB y multiplica por aproximadamente 3,5-4 la velocidad de inferencia respecto a float en los chipsets medidos.
- Exportación a múltiples runtimes (ONNX, QNN_DLC, TFLITE) para integración en pipelines Android y Linux embebido.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual y de una sola pasada.

## Casos de uso

- Asistencia a la conducción y ADAS: el modelo segmenta la calzada, aceras, peatones y vehículos en tiempo real (4-20 ms en Snapdragon 8 Elite Gen 5 y X2 Elite en w8a8), lo que permite alimentar módulos de detección de obstáculos o de carril en sistemas de ayuda a la conducción embebidos.
- Robótica móvil y vehículos autónomos de interior: la segmentación por píxel a 2048x1024 permite distinguir superficies transitables de obstáculos en robots de almacén o reparto de última milla que incorporan SoC Qualcomm.
- Realidad aumentada y sustitución de fondo: la máscara de 19 clases permite separar cielo, carretera y edificios para composición en tiempo real en aplicaciones móviles, con latencias por debajo de 10 ms en gama alta.
- Análisis de vídeo urbano y videovigilancia: procesamiento en el propio dispositivo de flujos de cámara para estadísticas de ocupación de calzada, detección de peatones o análisis de tráfico, evitando enviar vídeo a la nube.
- Drones y cámaras inteligentes con Qualcomm QCS8550 o IQ-8275: segmentación a bordo para aterrizaje seguro, evitación de obstáculos o cartografía de terreno, con consumo energético bajo al ejecutarse en NPU.
- Etiquetado asistido y preanotación de datasets: el modelo puede generar máscaras iniciales sobre imágenes de ciudades para que anotadores humanos las revisen, reduciendo el coste de construir datasets de segmentación.
- Prototipado en Android: integración mediante los artefactos TFLITE u ONNX en aplicaciones Android para validar casos de uso de segmentación antes de invertir en modelos mayores.

## Benchmarks y rendimiento

La model card no publica métricas de calidad de segmentación (mIoU, precisión por clase) sobre Cityscapes. Sí se publican latencias de inferencia y rangos de memoria pico por chipset y precisión:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | float | 16,22 | 5 - 220 |
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | w8a8 | 4,247 | 2 - 210 |
| Snapdragon 8 Elite For Galaxy | ONNX | float | 20,831 | 6 - 196 |
| Snapdragon 8 Elite For Galaxy | ONNX | w8a8 | 5,731 | 1 - 208 |
| Snapdragon X2 Elite | ONNX | float | 17,501 | 24 - 24 |
| Snapdragon X2 Elite | ONNX | w8a8 | 4,729 | 7 - 7 |
| Snapdragon X Elite | ONNX | float | 36,262 | 31 - 31 |
| Snapdragon X Elite | ONNX | w8a8 | 12,025 | 22 - 22 |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 25,923 | 13 - 296 |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a8 | 7,585 | 9 - 291 |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 59,782 | 0 - 272 |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a8 | 16,285 | 7 - 291 |
| Dragonwing IQ-8275 | ONNX | float | 57,611 | 24 - 52 |
| Dragonwing IQ-8275 | ONNX | w8a8 | 11,336 | 6 - 10 |
| Dragonwing QCS8550 (Proxy) | ONNX | float | 37,14 | 24 - 54 |
| Dragonwing QCS8550 (Proxy) | ONNX | w8a8 | 11,385 | 6 - 10 |
| Dragonwing IQ-9075 | ONNX | float | 55,024 | 24 - 51 |
| Dragonwing IQ-9075 | ONNX | w8a8 | 12,767 | 6 - 9 |
| Dragonwing IQ-X7181 | ONNX | float | 36,262 | 31 - 31 |
| Dragonwing IQ-X7181 | ONNX | w8a8 | 12,025 | 22 - 22 |
| Dragonwing Q-8750 | ONNX | float | 20,831 | 6 - 196 |
| Dragonwing QCS6490 | ONNX | w8a8 | 49,994 | 6 - 9 |
| Dragonwing Q-6690 | ONNX | w8a8 | 142,371 | 5 - 230 |

No se han publicado resultados de benchmarks de calidad (mIoU) en la información disponible. Todas las inferencias se ejecutan en la NPU del chipset.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo ocupa 105 MB en float y 26,7 MB en w8a8, y se ejecuta en NPU con memoria pico entre 1 y 296 MB según chipset y precisión.
- GPU recomendadas: no aplica; el modelo está optimizado para NPU de Qualcomm (Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, X Elite, X2 Elite, Dragonwing IQ-8275, IQ-9075, IQ-X7181, QCS8550, QCS8450, QCS6490, Q-8750, Q-6690).
- Cabe en hardware de consumo: sí, en móviles y portátiles con SoC Snapdragon; no está pensado para GPU de escritorio.
- Opciones de despliegue: ONNX Runtime 1.30.0, Qualcomm QAIRT 2.50 (QNN_DLC), TFLITE; exportación personalizada mediante la librería `ai-hub-models` v0.66.0.
- Latencia: entre 4,2 ms (Snapdragon 8 Elite Gen 5, w8a8) y 142,4 ms (Dragonwing Q-6690, w8a8). En float, entre 16,2 ms y 59,8 ms en los chipsets medidos.
- Throughput estimado: no disponible de forma agregada; a partir de las latencias, en gama alta se superan las 200 inferencias por segundo en w8a8 y las 60 en float.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Clases | Licencia | Despliegue en borde |
|---|---|---|---|---|---|
| FFNet-78S | 27,5 M | 2048x1024 | 19 | BSD-3-Clause | NPU Qualcomm (ONNX, QNN_DLC, TFLITE) |
| Segmentación semántica genérica tipo DeepLabv3+ | no disponible en esta ficha | variable | variable | variable | requiere exportación manual |
| Modelos de segmentación de Cityscapes de referencia (p. ej. HRNet, OCRNet) | no disponible en esta ficha | variable | 19 | variable | no optimizados para NPU Qualcomm |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad (mIoU) frente a alternativas. La ventaja diferencial de FFNet-78S frente a modelos genéricos de segmentación es la disponibilidad de artefactos precompilados y perfilados para NPU de Qualcomm, junto con su reducido tamaño (26,7 MB en w8a8).

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre Cityscapes (escenas urbanas de conducción); su rendimiento fuera de ese dominio (interiores, imágenes aéreas, escenas nocturnas no representadas) no está documentado y probablemente se degrade.
- No se publican métricas de calidad (mIoU) en la model card, por lo que no es posible evaluar su precisión objetiva sin ejecutar una validación propia.
- La cuantización w8a8 puede introducir una pérdida de precisión no cuantificada en la documentación; conviene validar el impacto en el caso de uso concreto.
- Los artefactos están optimizados para hardware Qualcomm; en GPUs de escritorio o CPUs genéricas el rendimiento no está garantizado ni medido.
- Riesgo de sesgo: el dataset Cityscapes está sesgado hacia ciudades europeas y condiciones diurnas; el modelo puede fallar en entornos con iluminación adversa, climas extremos o tipologías urbanas distintas.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; no obstante, el uso del modelo en sistemas críticos de seguridad (conducción autónoma) requiere validación adicional y no está cubierto por la licencia.
- El repositorio pesa 11,3 GB, aunque los artefactos individuales son pequeños; conviene descargar solo el formato y precisión necesarios.
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/FFNet-78S
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/ffnet_78s
- Repositorio de implementación original: https://github.com/Qualcomm-AI-research/FFNet
- Librería AI Hub Models (FFNet-78S): https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/ffnet_78s
- Paper de referencia (arXiv 2206.08236): https://arxiv.org/abs/2206.08236
- Workbench de Qualcomm AI Hub: https://workbench.aihub.qualcomm.com
