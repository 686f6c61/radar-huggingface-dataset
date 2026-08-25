# qualcomm/Facial-Attribute-Detection

## Resumen

Facial-Attribute-Detection es un modelo de detección de atributos faciales desarrollado por Qualcomm, diseñado para identificar características como el cierre de ojos, la presencia de mascarilla, gafas y gafas de sol en una imagen de una cara. El modelo está optimizado para ejecutarse en dispositivos con hardware Qualcomm, especialmente en la NPU (Unidad de Procesamiento Neuronal) de los Snapdragon, y se distribuye con pesos preexportados en formatos ONNX, QNN_DLC y TFLITE, tanto en precisión float como cuantizados w8a8.

Con 12,1 millones de parámetros y una resolución de entrada de 128x128 píxeles, el modelo es extremadamente ligero y rápido, con tiempos de inferencia inferiores a 1 milisegundo en chipsets recientes como el Snapdragon 8 Gen 3. Fue entrenado por Qualcomm sobre un dataset propietario de caras, aunque puede aplicarse a cualquier imagen. Su licencia BSD-3-Clause permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su aplicación en sistemas de autenticación biométrica, control de acceso, monitoreo de fatiga del conductor y otras tareas de análisis facial en tiempo real, donde la baja latencia y el bajo consumo de recursos son críticos. Al estar preoptimizado para hardware Qualcomm, facilita el despliegue en dispositivos móviles y de borde sin necesidad de ajustes adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de detección de objetos, red neuronal convolucional) |
| Parametros totales | 12,1 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | float, w8a8 (cuantización de pesos y activaciones a 8 bits) |
| Idiomas soportados | No disponible (modelo de visión, no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLITE |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de indicar que se trata de un modelo de detección de objetos (pipeline `object-detection`). Qualcomm desarrolló la arquitectura y entrenó el modelo sobre un dataset propietario de caras, sin que se hayan publicado detalles sobre el número de imágenes, la composición del dataset o el proceso de entrenamiento (por ejemplo, si se usó aprendizaje supervisado, aumentación de datos, etc.).

El modelo acepta imágenes de 128x128 píxeles y produce como salida la detección de atributos faciales: cierre de ojos, presencia de mascarilla, presencia de gafas y presencia de gafas de sol. También se menciona en la documentación la detección de "liveness" (vivacidad), lo que sugiere que el modelo puede distinguir entre una cara real y una fotografía o vídeo, aunque este detalle no está confirmado en la model card principal.

No se especifica si se emplearon técnicas como transfer learning, fine-tuning o arquitecturas concretas (ResNet, MobileNet, etc.). La optimización para hardware Qualcomm sugiere que el modelo está diseñado para aprovechar las instrucciones de la NPU, pero los detalles técnicos de implementación no son públicos.

## Capacidades

- Detección de atributos faciales: cierre de ojos, presencia de mascarilla, presencia de gafas y presencia de gafas de sol.
- Detección de vivacidad (liveness) para distinguir caras reales de presentaciones (fotografías, vídeos), según la documentación de Qualcomm AI Hub.
- Procesamiento de imágenes en tiempo real con latencias inferiores a 1 ms en chipsets Snapdragon recientes.
- Soporte para múltiples formatos de exportación (ONNX, QNN_DLC, TFLITE) que permiten su integración en entornos Android, Linux y otros.
- Cuantización w8a8 que reduce el tamaño del modelo de 46,3 MB a 12,3 MB, manteniendo un rendimiento adecuado para inferencia en dispositivos de borde.
- No soporta procesamiento de texto, generación de lenguaje ni tool calling, al ser un modelo puramente visual.

## Casos de uso

- Control de acceso biométrico: el modelo puede integrarse en sistemas de verificación facial para comprobar si el usuario lleva gafas, mascarilla o tiene los ojos cerrados, mejorando la precisión de la autenticación en entornos con condiciones variables.
- Monitoreo de fatiga del conductor: en vehículos, el modelo detecta el cierre de ojos en tiempo real, permitiendo alertar al conductor si muestra signos de somnolencia. Su baja latencia (0,3-0,6 ms en Snapdragon 8 Gen 3) lo hace apto para sistemas embebidos.
- Sistemas de pago por reconocimiento facial: la detección de vivacidad y de atributos como gafas o mascarilla ayuda a prevenir fraudes y a adaptar el sistema a usuarios con accesorios.
- Videovigilancia inteligente: el modelo puede analizar flujos de vídeo para identificar si las personas llevan mascarilla o gafas, útil en entornos de seguridad o salud pública.
- Aplicaciones de realidad aumentada: la detección de atributos faciales permite aplicar filtros o efectos virtuales que se ajustan a la presencia de gafas o mascarilla en tiempo real.
- Dispositivos IoT y wearables: gracias a su tamaño reducido (12,3 MB en w8a8) y su compatibilidad con TFLITE, puede desplegarse en cámaras inteligentes, timbres con vídeo o gafas inteligentes para análisis facial local sin conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o similares) en la información disponible, ya que se trata de un modelo de visión y no de lenguaje. La model card incluye una tabla de rendimiento en dispositivos Qualcomm, que se reproduce a continuación como referencia de latencia y memoria:

| Modelo | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Rango de memoria pico (MB) | Unidad de cómputo |
|---|---|---|---|---|---|---|
| Facial-Attribute-Detection | ONNX | float | Snapdragon X2 Elite | 0,419 | 1 - 1 | NPU |
| Facial-Attribute-Detection | ONNX | float | Snapdragon X Elite | 0,84 | 23 - 23 | NPU |
| Facial-Attribute-Detection | ONNX | float | Snapdragon 8 Gen 3 Mobile | 0,641 | 0 - 82 | NPU |
| Facial-Attribute-Detection | ONNX | float | Snapdragon 8 Gen 1 Mobile | 1,296 | 0 - 79 | NPU |
| Facial-Attribute-Detection | ONNX | float | Snapdragon 8 Elite Mobile | 0,512 | 0 - 55 | NPU |
| Facial-Attribute-Detection | ONNX | w8a8 | Snapdragon X2 Elite | 0,178 | 1 - 1 | NPU |
| Facial-Attribute-Detection | ONNX | w8a8 | Snapdragon X Elite | 0,393 | 11 - 11 | NPU |
| Facial-Attribute-Detection | ONNX | w8a8 | Snapdragon 8 Gen 3 Mobile | 0,296 | 0 - 82 | NPU |
| Facial-Attribute-Detection | ONNX | w8a8 | Snapdragon 8 Gen 1 Mobile | 0,654 | 0 - 82 | NPU |

Estos datos muestran que la cuantización w8a8 reduce el tiempo de inferencia aproximadamente a la mitad en la mayoría de los chipsets, con un consumo de memoria muy bajo (entre 1 y 82 MB según el dispositivo).

## Requisitos de hardware

- El modelo está optimizado para la NPU de los chipsets Qualcomm Snapdragon, incluyendo Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, X Elite y X2 Elite, así como para las plataformas Dragonwing (QCS6490, QCS8450, QCS8550, IQ-8275, IQ-9075, IQ-X7181, Q-8750).
- Tamaño del modelo: 46,3 MB en precisión float y 12,3 MB en cuantización w8a8, lo que permite su almacenamiento en memoria flash de cualquier dispositivo móvil.
- Memoria pico durante la inferencia: entre 1 y 82 MB según el chipset y la precisión, muy por debajo de los límites de cualquier SoC moderno.
- No se requieren GPUs dedicadas; el modelo está diseñado para ejecutarse en NPU de dispositivos de borde, aunque también puede ejecutarse en CPU mediante los runtimes ONNX o TFLITE.
- Opciones de despliegue: Qualcomm AI Hub Workbench para compilar y perfilar el modelo, o descarga directa de los pesos preexportados (ONNX, QNN_DLC, TFLITE) e integración con ONNX Runtime o TensorFlow Lite.
- Latencia: entre 0,178 ms (w8a8 en Snapdragon X2 Elite) y 1,578 ms (w8a8 en QCS6490), lo que permite procesamiento en tiempo real a más de 600 FPS en los mejores casos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros modelos de detección de atributos faciales como FaceNet, ArcFace o modelos de detección de landmarks, pero no se han encontrado datos de rendimiento o características que permitan una comparación directa con este modelo de Qualcomm. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo fue entrenado con un dataset propietario de Qualcomm, por lo que no se conocen los sesgos demográficos o de condiciones de iluminación que pueda presentar. Es recomendable validar su comportamiento en el caso de uso concreto antes de desplegarlo en producción.
- No se han publicado métricas de precisión (como exactitud, recall o F1) para los atributos detectados, lo que dificulta evaluar su fiabilidad en escenarios críticos.
- La detección de vivacidad (liveness) se menciona en la documentación de Qualcomm AI Hub, pero no se detalla su robustez frente a ataques de presentación avanzados (vídeos, máscaras 3D).
- El modelo está optimizado para hardware Qualcomm; su rendimiento en otras plataformas (GPUs NVIDIA, CPUs Intel, etc.) no está documentado y podría ser significativamente inferior.
- La resolución de entrada es fija a 128x128 píxeles, lo que limita la precisión en imágenes de baja calidad o con caras muy pequeñas.
- No se proporcionan instrucciones sobre cómo manejar múltiples caras en una misma imagen; el modelo parece diseñado para una sola cara por entrada.
- La licencia BSD-3-Clause permite uso comercial, pero no se especifican restricciones sobre el dataset de entrenamiento ni sobre posibles patentes de Qualcomm relacionadas con la arquitectura.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/qualcomm/Facial-Attribute-Detection)
- [Página del modelo en Qualcomm AI Hub](https://aihub.qualcomm.com/models/face_attrib_net)
- [Repositorio de Qualcomm AI Hub Models en GitHub](https://github.com/qualcomm/ai-hub-models/blob/v0.61.0/src/qai_hub_models/models/face_attrib_net)
- [Qualcomm AI Hub Workbench](https://workbench.aihub.qualcomm.com)
