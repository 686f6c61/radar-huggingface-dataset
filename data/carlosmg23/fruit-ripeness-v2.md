# Carlosmg23/fruit-ripeness-v2

## Resumen

El modelo `Carlosmg23/fruit-ripeness-v2` es un clasificador de imágenes desarrollado por Carlosmg23 para determinar el estado de maduración de frutas en 12 clases distintas. Se trata de un modelo de la Actividad 11 de un proyecto académico que compara tres representaciones (TTA, Random Forest sobre características de color/textura y una arquitectura multi-task), seleccionando finalmente la base MobileNetV2 del modelo 04 como versión provisional. El modelo está empaquetado en formato Keras y también como TensorFlow Lite (2,43 MB), lo que lo hace apto para despliegue en dispositivos móviles y entornos con recursos limitados.

La relevancia de este modelo radica en su enfoque práctico: no busca ser un modelo de propósito general, sino un clasificador especializado y ligero para una tarea concreta de visión artificial. Con un F1 macro de 0,5940 en test y una exactitud del 66,21%, el modelo muestra un rendimiento moderado pero funcional para un prototipo. Su tamaño reducido (2,43 MB en TFLite) y latencia mediana de 19,7 ms lo posicionan como una opción viable para aplicaciones de inspección de frutas en tiempo real en dispositivos de borde.

El modelo se distribuye bajo licencia CC BY 4.0, lo que permite uso comercial con atribución, y se entrenó sobre un dataset derivado de Fruit Ripeness de Roboflow Universe (versión 3). La model card es transparente sobre las limitaciones: el Random Forest no es convertible directamente a TFLite, el TTA multiplica la latencia por 5, y la clase "Rotten" representa deterioro, no una etapa de maduración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (base del modelo 04) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantización | no disponible (TFLite incluido, sin especificar cuantización) |
| Idiomas soportados | no disponible (no aplica, clasificación de imágenes) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Keras (.keras) y TensorFlow Lite (.tflite) |

## Arquitectura y entrenamiento

El modelo se basa en MobileNetV2, una arquitectura de red neuronal convolucional diseñada para eficiencia computacional en dispositivos móviles, con bloques residuales invertidos y conexiones lineales de cuello de botella. La model card indica que se compararon tres representaciones: un modelo Keras con una salida (Base 04), un modelo Keras con Test-Time Augmentation (TTA), un Random Forest sobre características de color y textura, y una arquitectura multi-task con dos salidas. La selección final recayó en la base MobileNetV2 del modelo 04, ya que ninguna alternativa superó el criterio de robustez establecido (intervalo de confianza al 95% inferior mayor que 0 en bootstrap agrupado por sesión).

El entrenamiento se realizó sobre el dataset `Carlosmg23/fruit-ripeness-12clases`, derivado de Fruit Ripeness de Muhammad's Workspace (Roboflow Universe, versión 3). No se especifica el número de tokens ni la composición exacta del dataset, pero se reportan métricas de validación y test. Se aplicó calibración de temperatura (T=1,162), reduciendo el ECE de 0,0706 a 0,0323. No se menciona el uso de RLHF ni DPO, al tratarse de un modelo de visión supervisado.

## Capacidades

- Clasificación de imágenes de frutas en 12 clases de estado de maduración.
- Generación de probabilidades por clase (salida de 12 dimensiones).
- Inferencia en formato TensorFlow Lite para despliegue en dispositivos móviles y de borde.
- Capacidad de calibración de probabilidades mediante temperatura.
- Soporte de Test-Time Augmentation (TTA) como opción de mejora, aunque multiplica la latencia por 5.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye visión general más allá de la clasificación de frutas.

## Casos de uso

- Inspección de maduración en líneas de envasado: el modelo puede clasificar frutas en tiempo real gracias a su latencia de 19,7 ms en TFLite, integrándose en cámaras industriales para separar lotes por estado de madurez.
- Aplicación móvil para consumidores: el tamaño de 2,43 MB permite embeberlo en una app Android o iOS que, mediante la cámara del teléfono, indique al usuario si una fruta está lista para consumir.
- Control de calidad en almacenes: clasificación automatizada de frutas almacenadas para detectar deterioro (clase "Rotten") y reducir pérdidas por productos en mal estado.
- Investigación agronómica: herramienta de bajo coste para monitorizar la evolución de la maduración en experimentos con distintas condiciones de almacenamiento.
- Sistemas de inventario inteligente: integración en neveras o contenedores inteligentes que estimen la vida útil restante de las frutas mediante la clasificación de su estado.
- Educación y prototipado: modelo ligero y de código abierto para demostrar pipelines de visión artificial en cursos de machine learning, con métricas de calibración y bootstrap incluidas.

## Benchmarks y rendimiento

Resultados en test según la model card:

| Modelo | Exactitud | Exactitud balanceada | F1 macro | F1 ponderado | Top-3 | MAE nivel | QWK | Adyacente |
|---|---|---|---|---|---|---|---|---|
| Mayoría | 0,4131 | 0,0833 | 0,0487 | 0,2415 | 0,4713 | 0,5764 | 0,0000 | 0,8957 |
| Random Forest | 0,6694 | 0,5147 | 0,5217 | 0,6568 | 0,8812 | 0,3436 | 0,6546 | 0,9394 |
| Criterio 03 | 0,5958 | 0,5720 | 0,5335 | 0,6322 | nan | 0,5166 | 0,5532 | 0,9022 |
| MobileNetV2 | 0,6621 | 0,6334 | 0,5940 | 0,6636 | 0,9038 | 0,3678 | 0,6899 | 0,9523 |

Resultados en validación (comparación de alternativas):

| Modelo | F1 macro | Exactitud balanceada | QWK |
|---|---|---|---|
| Base 04 | 0,5493 | 0,5749 | 0,6652 |
| A. TTA | 0,5602 | 0,5845 | 0,6971 |
| B. RF color | 0,5004 | 0,4753 | 0,6147 |
| B. RF color+textura | 0,4993 | 0,4618 | 0,6382 |
| B. RF seleccionado | 0,5071 | 0,4764 | 0,6379 |
| C. Multi-task | 0,4834 | 0,4938 | 0,6220 |

Bootstrap agrupado por sesión (1000 iteraciones):

| Modelo | Delta medio | IC95 bajo | IC95 alto | Prob. mejora positiva | Mejora confirmada |
|---|---|---|---|---|---|
| A. TTA | 0,0107 | -0,0016 | 0,0244 | 0,9500 | False |
| B. RF seleccionado | -0,0440 | -0,0867 | 0,0009 | 0,0270 | False |
| C. Multi-task | -0,0659 | -0,1043 | -0,0277 | 0,0000 | False |

Calibración: temperatura 1,162; ECE antes 0,0706; ECE después 0,0323.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero al ser MobileNetV2 y un archivo TFLite de 2,43 MB, la huella de memoria es muy baja (inferior a 1 GB en la mayoría de configuraciones).
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Para entrenamiento o inferencia por lotes, una GPU consumer como GTX 1660 o RTX 3050 es más que suficiente.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y Raspberry Pi.
- Opciones de despliegue: TensorFlow Lite (recomendado), TensorFlow/Keras, y potencialmente conversión a otros runtimes (ONNX, etc.) no documentada.
- Latencia y throughput: latencia mediana de 19,7 ms en TFLite (dispositivo no especificado). El throughput no se reporta, pero se estima alto dado el tamaño reducido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fruit-ripeness-v2 (MobileNetV2) | no disponible | Imagen 224x224 | F1 macro 0,5940 (test) | CC BY 4.0 | HuggingFace |
| MobileNetV2 estándar (ImageNet) | ~3,4M | Imagen 224x224 | No aplica (clasificación general) | Apache 2.0 | TensorFlow Hub |
| EfficientNet-B0 | ~5,3M | Imagen 224x224 | No aplica (clasificación general) | Apache 2.0 | TensorFlow Hub |
| Random Forest (en model card) | no disponible | Características tabulares | F1 macro 0,5217 (test) | no disponible | No convertible a TFLite |

No se dispone de comparativas con otros modelos especializados en maduración de frutas en la información proporcionada.

## Limitaciones y advertencias

- El modelo tiene un rendimiento moderado (F1 macro 0,5940, exactitud 66,21%), insuficiente para aplicaciones críticas de producción sin supervisión humana.
- La clase "Rotten" representa deterioro, no una etapa de maduración, lo que puede inducir a error en la interpretación de resultados.
- El conjunto externo del 05 es pequeño y sintético; no se reevaluó en esta versión, lo que limita la validación de generalización.
- El Random Forest es interpretable pero no convertible directamente a TFLite, por lo que no se seleccionó.
- El TTA multiplica la latencia por 5, lo que puede ser inviable en aplicaciones de tiempo real.
- El APK y la encuesta de usabilidad quedan pendientes, según la model card.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí riesgo de clasificación errónea en frutas con condiciones de iluminación o variedades no representadas en el dataset.
- Licencia CC BY 4.0 permite uso comercial con atribución, pero requiere citar al autor y la fuente del dataset original.
- No se especifican sesgos conocidos, pero el dataset derivado de Roboflow puede tener sesgos de composición (variedades, condiciones de captura) no documentados.

## Enlaces

- [HuggingFace: Carlosmg23/fruit-ripeness-v2](https://huggingface.co/Carlosmg23/fruit-ripeness-v2)
- [Dataset: Carlosmg23/fruit-ripeness-12clases](https://huggingface.co/datasets/Carlosmg23/fruit-ripeness-12clases)
- [Fruit Ripeness de Muhammad's Workspace (Roboflow Universe, versión 3)](https://universe.roboflow.com/muhammads-workspace/fruit-ripeness) (enlace inferido, no confirmado en la información proporcionada)
