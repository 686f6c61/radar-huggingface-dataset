# qualcomm/Depth-Anything-V2

## Resumen

Depth-Anything-V2 es un modelo de estimación de profundidad monocular desarrollado por Qualcomm, optimizado para su ejecución en dispositivos con hardware Snapdragon y Dragonwing. Se basa en el modelo Depth-Anything-V2 original, que destaca por ofrecer mapas de profundidad densos y detallados a partir de una sola imagen, superando en robustez y eficiencia a versiones anteriores y a alternativas basadas en difusión. Esta versión específica, publicada en Hugging Face por Qualcomm, incluye pesos preexportados en formatos ONNX, QNN_DLC y TFLITE, listos para desplegar en entornos de edge computing. El checkpoint utilizado es el variante Small, con 24,7 millones de parámetros y un tamaño de 94,3 MB en precisión float, lo que lo hace adecuado para aplicaciones en tiempo real en dispositivos móviles y embebidos. Su licencia MIT permite uso comercial sin restricciones, y su relevancia actual radica en la creciente demanda de soluciones de percepción de profundidad eficientes para realidad aumentada, robótica y conducción autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Depth-Anything-V2, implementación de transformers) |
| Parametros totales | 24,7 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen, resolución 518x518) |
| Tipos de cuantizacion | float, w8a16 |
| Idiomas soportados | no disponible (modelo de visión, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (además de pesos PyTorch originales) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se detalla en la información proporcionada, pero se indica que es una implementación basada en el código de Depth-Anything-V2 de Hugging Face Transformers. El modelo original Depth-Anything-V2 fue entrenado con 595.000 imágenes sintéticas etiquetadas y más de 62 millones de imágenes reales no etiquetadas, lo que le permite generar mapas de profundidad con gran detalle y robustez. Esta versión de Qualcomm no modifica el entrenamiento, sino que se centra en la optimización para hardware específico, mediante la exportación a formatos como ONNX y QNN_DLC, y la cuantización w8a16 para reducir la latencia y el consumo de memoria en NPU de Qualcomm. No se mencionan técnicas adicionales como RLHF o DPO, al tratarse de un modelo de visión.

## Capacidades

- Estimación de profundidad monocular: genera un mapa de profundidad por píxel a partir de una imagen RGB de entrada.
- Detección de bordes y detalles finos: el modelo produce mapas de profundidad con alta resolución espacial, capturando estructuras finas como objetos pequeños y contornos.
- Robustez en condiciones variadas: funciona en escenas con iluminación compleja, texturas repetitivas y superficies reflectantes, gracias al entrenamiento con datos diversos.
- Eficiencia computacional: optimizado para ejecución en NPU de Qualcomm, con tiempos de inferencia de hasta 12 ms en dispositivos de gama alta (ver tabla de rendimiento).
- Sin capacidades de texto: no soporta tool calling, agentes ni procesamiento de lenguaje natural; es exclusivamente un modelo de visión.

## Casos de uso

- Realidad aumentada en móviles: el mapa de profundidad permite oclusión correcta de objetos virtuales con el entorno real, mejorando la inmersión en aplicaciones de AR. Su baja latencia (menos de 20 ms en Snapdragon 8 Elite) lo hace viable para experiencias en tiempo real.
- Navegación autónoma en robótica: robots de servicio o drones pueden usar la profundidad para evitar obstáculos y planificar rutas. El formato ONNX facilita la integración en pipelines de ROS o frameworks de edge.
- Fotografía computacional: mejora de retratos con efecto bokeh, desenfoque de fondo y reiluminación de escenas. La precisión en bordes es clave para separar sujeto y fondo.
- Inspección industrial: medición de distancias y dimensiones en líneas de producción mediante cámaras fijas, con despliegue en dispositivos Qualcomm Dragonwing para entornos industriales.
- Asistencia a la conducción: sistemas avanzados de asistencia al conductor (ADAS) que requieren estimación de profundidad para detección de peatones, distancia a vehículos y frenado de emergencia. La cuantización w8a16 reduce el consumo energético en vehículos.
- Aplicaciones de accesibilidad: ayuda a personas con discapacidad visual para detectar obstáculos y orientarse en entornos desconocidos, ejecutándose en smartphones de gama media con Snapdragon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (como RMSE o delta) en la información disponible. Sin embargo, la tabla de rendimiento de Qualcomm muestra tiempos de inferencia en diferentes chipsets, que se resumen a continuación:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| Snapdragon X2 Elite | ONNX | float | 19,105 | 5 |
| Snapdragon X Elite | ONNX | float | 49,17 | 48 |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 36,362 | 0-474 |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 86,366 | 1-476 |
| Snapdragon 8 Elite Mobile | ONNX | float | 25,444 | 2-365 |
| Snapdragon 8 Elite Gen 5 Mobile | ONNX | float | 18,775 | 2-371 |
| Snapdragon X2 Elite | ONNX | w8a16 | 12,341 | 4 |
| Snapdragon X Elite | ONNX | w8a16 | 28,614 | 28 |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a16 | 20,324 | 3-652 |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a16 | 44,913 | 3-527 |

Estos datos indican que la cuantización w8a16 reduce significativamente la latencia en la mayoría de los dispositivos, a costa de un mayor rango de memoria en algunos casos.

## Requisitos de hardware

- VRAM estimada: el modelo float ocupa 94,3 MB, por lo que cabe en cualquier GPU moderna y en memoria de dispositivos móviles. Con cuantización w8a16, el tamaño se reduce aún más.
- GPU recomendadas: no requiere GPU dedicada; está diseñado para NPU de Qualcomm (Snapdragon, Dragonwing). En caso de usar GPU, cualquier GPU con al menos 1 GB de VRAM es suficiente.
- Compatibilidad con consumer GPU: sí, puede ejecutarse en GPUs de escritorio mediante ONNX Runtime o PyTorch, aunque no es el objetivo principal.
- Opciones de despliegue: Qualcomm AI Hub (para exportación y compilación), ONNX Runtime, TFLite, y el SDK de Qualcomm AI Hub Workbench. También se puede usar con llama.cpp u otros frameworks, pero no es lo habitual.
- Latencia y throughput: en dispositivos Qualcomm, la latencia varía entre 12 ms (Snapdragon X2 Elite con w8a16) y 245 ms (Dragonwing Q-6690 con w8a16). El throughput depende del dispositivo y la resolución de entrada.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de estimación de profundidad en la información proporcionada. Sin embargo, se puede comparar cualitativamente con alternativas conocidas:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Depth-Anything-V2 (Small) | 24,7 M | Imagen 518x518 | MIT | Hugging Face, Qualcomm AI Hub |
| MiDaS (varios tamaños) | 21 M - 105 M | Imagen variable | MIT | Hugging Face |
| Depth Anything V1 | 25 M - 335 M | Imagen variable | Apache 2.0 | Hugging Face |

Depth-Anything-V2 destaca por su eficiencia en hardware Qualcomm, mientras que MiDaS y Depth Anything V1 son más genéricos y no están optimizados para NPU específicas. No se dispone de benchmarks de precisión para comparar numéricamente.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo de visión, puede presentar errores en imágenes con oclusiones extremas, superficies transparentes o reflectantes, y escenas con poca textura. No se han documentado sesgos demográficos específicos.
- Riesgo de alucinación: en estimación de profundidad, puede generar profundidades incorrectas en regiones ambiguas, como cielos o fondos uniformes.
- Limitaciones de contexto: la resolución de entrada está fijada a 518x518; imágenes de mayor resolución requieren redimensionado, lo que puede afectar la precisión en objetos pequeños.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo está optimizado para hardware Qualcomm; su uso en otras plataformas puede requerir conversiones adicionales.
- Caveat para producción: la cuantización w8a16 puede degradar ligeramente la precisión en comparación con float, aunque no se especifica el impacto exacto. Se recomienda validar en el caso de uso concreto.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/Depth-Anything-V2
- Sitio web de Depth Anything V2: https://depth-anything-v2.github.io/
- Repositorio de Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.61.0/src/qai_hub_models/models/depth_anything_v2
- Qualcomm AI Hub (página del modelo): https://aihub.qualcomm.com/models/depth_anything_v2
