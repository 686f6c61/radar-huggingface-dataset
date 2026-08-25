# qualcomm/PPE-Detection

## Resumen

PPE-Detection es un modelo de detección de objetos en tiempo real desarrollado por Qualcomm para identificar equipos de protección individual (EPI) en imágenes. Concretamente, detecta dos clases: casco de seguridad y chaleco reflectante. El modelo está optimizado para ejecutarse en la NPU de los procesadores Snapdragon y Dragonwing de Qualcomm, logrando latencias de inferencia de menos de 1 milisegundo en los chips más recientes. Su arquitectura es propietaria de Qualcomm y fue entrenada con un dataset interno, aunque puede utilizarse con cualquier imagen.

El modelo se distribuye con pesos preexportados en formatos ONNX, QNN_DLC y TFLITE, listos para desplegarse en dispositivos Android o en sistemas embebidos basados en Qualcomm. Con 6,19 millones de parámetros y un tamaño de solo 23,6 MB en precisión float, está pensado para aplicaciones de visión por computador en el borde, donde la latencia y el consumo de recursos son críticos. Su licencia BSD-3-Clause permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su enfoque específico para seguridad laboral: permite monitorizar el cumplimiento de normativas de EPI en entornos industriales, obras de construcción o plantas de fabricación, con una precisión y velocidad suficientes para funcionar en tiempo real sobre hardware de bajo consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional para detección de objetos (arquitectura propietaria de Qualcomm, no especificada públicamente) |
| Parametros totales | 6,19 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | float32, w8a16, w8a8 |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLITE |

## Arquitectura y entrenamiento

La arquitectura exacta de PPE-Detection no se detalla en la documentación pública. Se trata de un detector de objetos de una sola etapa, probablemente basado en una red troncal convolucional, aunque Qualcomm no ha revelado el diseño concreto. El modelo fue entrenado por Qualcomm sobre un dataset propietario que contiene imágenes de personas con y sin EPI, con anotaciones para las clases casco y chaleco. No se han publicado detalles sobre el número de imágenes, el proceso de aumento de datos ni si se utilizaron técnicas como aprendizaje por transferencia o ajuste fino.

La optimización para NPU de Qualcomm es un aspecto central: los pesos se cuantizan a 8 bits (w8a8 o w8a16) para reducir el tamaño y acelerar la inferencia sin pérdidas significativas de precisión. El modelo acepta una resolución de entrada de 320x192 píxeles, lo que contribuye a su baja latencia. No se menciona el uso de técnicas como decodificación especulativa o atención lineal, ya que no es un modelo generativo.

## Capacidades

- Detección de objetos en tiempo real: identifica casco de seguridad y chaleco reflectante en imágenes o vídeo.
- Inferencia de baja latencia: tiempos de procesamiento de 0,4 a 3,7 ms según el chipset, ejecutándose en la NPU.
- Soporte para múltiples runtimes: ONNX Runtime, Qualcomm AI Runtime (QAIRT) y TensorFlow Lite.
- Cuantización flexible: versiones float, w8a16 y w8a8 para equilibrar precisión y rendimiento.
- Despliegue en dispositivos Android y sistemas embebidos Qualcomm (Snapdragon, Dragonwing).
- Exportación personalizable mediante la librería Qualcomm AI Hub Models, permitiendo ajustar pesos, formas de entrada y configuraciones de compilación.

## Casos de uso

- Monitorización de seguridad en obras de construcción: el modelo puede integrarse en cámaras IP o dispositivos móviles para verificar en tiempo real que los trabajadores llevan casco y chaleco. Su baja latencia permite alertar inmediatamente cuando se detecta una infracción.
- Control de acceso en plantas industriales: antes de permitir la entrada a una zona de alto riesgo, el sistema captura una imagen del trabajador y ejecuta PPE-Detection para comprobar el uso de EPI. Al ser un modelo ligero, puede ejecutarse en un dispositivo edge sin conexión a la nube.
- Auditoría de cumplimiento normativo: las grabaciones de vídeo de instalaciones pueden procesarse con este modelo para generar informes automáticos sobre el porcentaje de tiempo en que los empleados usan correctamente el EPI, facilitando la documentación para inspecciones.
- Robótica móvil en entornos industriales: un robot de vigilancia equipado con una cámara puede utilizar PPE-Detection para navegar y detectar incumplimientos de seguridad, enviando alertas a un centro de control.
- Aplicaciones de realidad aumentada para formación: superponer indicaciones visuales sobre la imagen de un trabajador para señalar si falta el casco o el chaleco, como herramienta didáctica en simulacros de seguridad.
- Sistemas de videovigilancia inteligente en almacenes y fábricas: integrar el modelo en un servidor de análisis de vídeo para monitorizar múltiples cámaras y generar eventos cuando se detecta a una persona sin EPI, con tiempos de respuesta inferiores a 10 ms por frame.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de detección de objetos (como mAP o COCO) en la información disponible. Sin embargo, Qualcomm proporciona mediciones de latencia y memoria para diferentes chipsets, que se resumen a continuación. Estos datos provienen de la model card oficial y reflejan el rendimiento en condiciones de referencia.

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de cómputo |
|---|---|---|---|---|---|
| Snapdragon X2 Elite | ONNX | float | 0,578 | 2 | NPU |
| Snapdragon X Elite | ONNX | float | 1,286 | 13 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 0,913 | 0-78 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 2,263 | 1-53 | NPU |
| Snapdragon 8 Elite Mobile | ONNX | float | 0,676 | 0-58 | NPU |
| Snapdragon 8 Elite Gen 5 Mobile | ONNX | float | 0,535 | 0-60 | NPU |
| Snapdragon X2 Elite | ONNX | w8a16 | 0,401 | 1 | NPU |
| Snapdragon X Elite | ONNX | w8a16 | 0,939 | 6 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a16 | 0,595 | 0-67 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a16 | 1,265 | 0-66 | NPU |
| Qualcomm Dragonwing QCS6490 | ONNX | w8a16 | 3,757 | 0-3 | NPU |
| Qualcomm Dragonwing IQ-8275 | ONNX | w8a16 | 0,902 | 0-4 | NPU |
| Qualcomm Dragonwing QCS8550 (Proxy) | ONNX | w8a16 | 0,907 | 0-10 | NPU |

La tabla completa con todas las variantes (incluyendo w8a8 y QNN_DLC) está disponible en la model card de Hugging Face. En general, las versiones cuantizadas a 8 bits reducen la latencia entre un 20% y un 40% respecto a float, con una disminución de memoria significativa.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en la NPU de chipsets Qualcomm. Los tiempos de inferencia listados se obtuvieron en dispositivos con Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, X Elite, X2 Elite y varias plataformas Dragonwing (QCS6490, QCS8450, QCS8550, IQ-8275, IQ-9075, IQ-X7181, Q-8750).
- La memoria pico durante la inferencia varía entre 1 MB y 78 MB según el chipset y la precisión, lo que permite su uso en sistemas con recursos muy limitados.
- No se requieren GPUs dedicadas; el modelo se ejecuta en NPU integradas en SoCs móviles o embebidos. Para pruebas en PC, se puede ejecutar en CPU o GPU mediante ONNX Runtime, aunque no se proporcionan métricas de rendimiento en esos entornos.
- Opciones de despliegue: ONNX Runtime con el ejecutor QAIRT, Qualcomm AI Hub Workbench para compilar y perfilar, o TensorFlow Lite para aplicaciones Android.
- La latencia típica en dispositivos de gama alta (Snapdragon 8 Gen 3 o superior) es inferior a 1 ms, lo que permite procesar más de 1000 frames por segundo en teoría, aunque en la práctica el cuello de botella suele estar en la captura de imagen.

## Comparativa con modelos similares

No se dispone de información pública sobre modelos comparables de detección de EPI con las mismas características (mismo tamaño, misma licencia y optimización para Qualcomm). Existen modelos genéricos de detección de objetos como YOLOv8n o SSD MobileNet que podrían adaptarse para esta tarea, pero no se han publicado comparativas directas con PPE-Detection. Por tanto, no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo fue entrenado con un dataset propietario de Qualcomm, por lo que su rendimiento en entornos muy diferentes a los de entrenamiento (iluminación extrema, ángulos inusuales, oclusiones severas) puede degradarse.
- Solo detecta dos clases: casco y chaleco. No cubre otros EPI como gafas, guantes o protectores auditivos, aunque Qualcomm ha indicado que planea añadir más clases en el futuro.
- La resolución de entrada es baja (320x192), lo que limita la detección de objetos pequeños o distantes. Para aplicaciones que requieran mayor detalle, puede ser necesario un modelo con mayor resolución.
- No se han publicado métricas de precisión (mAP, recall, precisión) en la documentación oficial, lo que dificulta evaluar su calidad en comparación con alternativas.
- El modelo está optimizado para hardware Qualcomm; su rendimiento en otras plataformas (x86, ARM de otros fabricantes) no está garantizado y puede requerir conversiones adicionales.
- La licencia BSD-3-Clause permite uso comercial, pero el dataset de entrenamiento es propietario, por lo que no se pueden redistribuir los datos ni reentrenar el modelo con ellos sin permiso de Qualcomm.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/qualcomm/PPE-Detection)
- [Página del modelo en Qualcomm AI Hub](https://aihub.qualcomm.com/models/gear_guard_net)
- [Repositorio de Qualcomm AI Hub Models (código de exportación)](https://github.com/qualcomm/ai-hub-models/blob/v0.61.0/src/qai_hub_models/models/gear_guard_net)
- [Blog de Qualcomm sobre modelos personalizados](https://www.qualcomm.com/developer/blog/2024/11/introducing-qualcomm-custom-built-ai-models-qualcomm-ai-hub)
- [Proyecto de despliegue en Rubik Pi 3 con Edge Impulse](https://www.qualcomm.com/developer/project/deploy-on-device-edge-impulse-ai-on-rubik-pi-3-safety-vision-ppe-object-detection)
