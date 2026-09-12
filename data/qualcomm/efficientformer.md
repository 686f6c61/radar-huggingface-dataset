# qualcomm/EfficientFormer

## Resumen

EfficientFormer es una familia de vision transformers (ViT) orientada a clasificación de imágenes, publicada originalmente por Snap Research y recogida en el paper arXiv:2212.08059. El repositorio `qualcomm/EfficientFormer` no contiene el entrenamiento original, sino un conjunto de artefactos preexportados y optimizados por Qualcomm para ejecutarse sobre la NPU Hexagon de sus chips (Snapdragon y Dragonwing), generados con la librería Qualcomm AI Hub Models (versión v0.62.2).

El checkpoint incluido es `efficientformer_l1_300d`, la variante más pequeña de la familia, con 12,3 millones de parámetros, entrada fija de 224x224 píxeles y salida sobre las 1.000 clases de ImageNet. El peso en coma flotante ocupa 46,9 MB y la versión cuantizada w8a16 (pesos a 8 bits, activaciones a 16 bits) baja a 12,2 MB, lo que permite desplegarlo en dispositivos móviles y de borde sin acelerador dedicado.

Su relevancia actual es de ingeniería de despliegue más que de investigación: ofrece latencias medidas de entre 0,52 ms y 5,9 ms según el chipset, con el cómputo principal siempre en la NPU, y formatos listos para producción (ONNX, QNN DLC y TFLite) que evitan al desarrollador tener que abordar la compilación y cuantización para hardware Qualcomm.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (implementación de Snap Research) |
| Parametros totales | 12,3 M (checkpoint `efficientformer_l1_300d`) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: modelo de visión con entrada de imagen fija de 224x224 |
| Tipos de cuantizacion | float (coma flotante) y w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | No disponible / no aplica (clasificación de imágenes, sin componente de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Repositorio PyTorch; artefactos exportados en ONNX, QNN DLC (QAIRT) y TFLite |
| Tarea | Clasificación de imágenes (ImageNet, 1.000 clases) |
| Resolucion de entrada | 224x224 |
| Tamano del modelo (float) | 46,9 MB |
| Tamano del modelo (w8a16) | 12,2 MB |
| Runtime y SDK | QAIRT 2.45, ONNX Runtime 1.27.1 |
| Libreria de exportacion | Qualcomm AI Hub Models v0.62.2 |
| Tamano del repositorio | 1,3 GB |
| Pipeline declarado en HuggingFace | image-classification |
| Descargas / likes | 16 / 1 |
| Fecha de creacion / actualizacion | 2025-08-29 / 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es un vision transformer, según la implementación de referencia de Snap Research enlazada en la propia model card. El dato concreto que aporta esta ficha es la variante utilizada: `efficientformer_l1_300d`, el nivel L1 de la familia, con 12,3 M de parámetros y resolución de entrada de 224x224. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset más allá de ImageNet, ni si se aplicaron técnicas de destilación, ajuste con RLHF/DPO (poco habituales en clasificación de imágenes) o recetas de aumento de datos. Esos detalles deben consultarse en el paper y en el repositorio original, no en esta model card.

El trabajo de Qualcomm se centra en la fase posterior al entrenamiento: compilación con QAIRT 2.45, exportación a ONNX, QNN DLC y TFLite, y cuantización a w8a16. La model card indica que es posible reexportar con configuraciones propias (pesos ajustados, formas de entrada distintas, dispositivo y runtime objetivo) usando la librería `qai-hub-models` y el Qualcomm AI Hub Workbench, que es también la vía para reproducir las mediciones de latencia publicadas. No se describe ninguna innovación técnica propia de Qualcomm más allá del pipeline de despliegue y del perfilado en dispositivo.

## Capacidades

- Clasificación de imágenes: asigna una imagen RGB de 224x224 a una de las 1.000 clases de ImageNet.
- Inferencia en NPU: todas las mediciones publicadas indican la NPU (Hexagon) como unidad de cómputo principal.
- Cuantización a w8a16, con pérdida de latencia prácticamente nula frente a float en varios chipsets (por ejemplo, 0,564 ms frente a 0,52 ms en Snapdragon X2 Elite).
- Exportación con configuraciones personalizadas: pesos ajustados, formas de entrada alternativas y dispositivos o runtimes distintos.
- Ejecución multiplataforma de despliegue: ONNX (con ONNX Runtime 1.27.1), QNN DLC y TFLite.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, function calling, agentes, razonamiento multi-paso, diálogo multi-turno ni capacidades multilingües.
- No se documentan capacidades de visión más allá de la clasificación: no hay detección, segmentación, OCR, descripción de imágenes, visión-lenguaje ni audio.

## Casos de uso

- Clasificación de fotos en aplicaciones Android: integrar el artefacto TFLite u ONNX en una app para etiquetar automáticamente la galería del usuario (por ejemplo, "playa", "perro", "comida") sin enviar imágenes a la nube. El modelo de 12,2 MB en w8a16 y latencias por debajo de 1 ms en Snapdragon 8 Gen 3 lo hacen viable en el propio terminal.
- Cribado previo en pipelines de visión en dos etapas: usar EfficientFormer como filtro rápido (0,57-1,2 ms en gama alta) que descarta la mayoría de fotogramas antes de invocar un modelo mayor más costoso, reduciendo el consumo energético del sistema completo.
- Inspección visual en el borde industrial: sobre módulos Dragonwing (IQ-8275, IQ-9075, QCS8550) con latencias de 1,16-1,59 ms, se puede clasificar producto en una línea de montaje en tiempo real. Requiere reentrenamiento con clases propias, ya que la cabeza por defecto está limitada a ImageNet.
- Moderación de contenido y privacidad en el dispositivo: clasificar imágenes antes de subirlas a un servicio, de forma que las categorías sensibles se detecten localmente y no se transmita la imagen original. El reducido tamaño en w8a16 facilita incluirlo como componente de un SDK móvil.
- Visión embarcada en robótica y drones: plataformas con Snapdragon 8 Gen 1 o QCS8450 ofrecen 1,6-5,0 ms por inferencia, suficiente para clasificar escenas a decenas o cientos de fotogramas por segundo si el resto del pipeline lo permite.
- Retail y logística: reconocimiento de producto o categoría de estantería en terminales portátiles de mano, usando la exportación ONNX o QNN DLC y el Workbench para validar la latencia en el modelo exacto de dispositivo antes de comprar flota.
- Evaluación y comparación de aceleradores: dado que la model card publica tiempos por chipset, precisión y versión de SDK, sirve como carga de trabajo de referencia para medir el rendimiento real de la NPU en distintas plataformas Qualcomm durante la selección de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de exactitud (top-1, top-5) ni comparativas de precisión frente a otros modelos en la información disponible. Los únicos datos de rendimiento son las latencias de inferencia medidas por Qualcomm con el runtime ONNX:

| Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Rango de memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|
| ONNX | float | Snapdragon X2 Elite | 0,564 | 2 - 2 | NPU |
| ONNX | float | Snapdragon X Elite | 1,204 | 24 - 24 | NPU |
| ONNX | float | Snapdragon 8 Gen 3 Mobile | 0,833 | 0 - 76 | NPU |
| ONNX | float | Snapdragon 8 Gen 1 Mobile | 4,975 | 1 - 80 | NPU |
| ONNX | float | Dragonwing IQ-8275 | 1,594 | 1 - 4 | NPU |
| ONNX | float | Dragonwing QCS8550 (proxy) | 1,165 | 0 - 133 | NPU |
| ONNX | float | QCS8450 | 4,975 | 1 - 80 | NPU |
| ONNX | float | Dragonwing IQ-9075 | 1,583 | 1 - 3 | NPU |
| ONNX | float | Dragonwing IQ-X7181 | 1,204 | 24 - 24 | NPU |
| ONNX | float | Dragonwing Q-8750 | 0,647 | 0 - 41 | NPU |
| ONNX | float | Snapdragon 8 Elite Mobile | 0,647 | 0 - 41 | NPU |
| ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 0,571 | 0 - 46 | NPU |
| ONNX | w8a16 | Snapdragon X2 Elite | 0,52 | 1 - 1 | NPU |
| ONNX | w8a16 | Snapdragon X Elite | 1,261 | 13 - 13 | NPU |
| ONNX | w8a16 | Snapdragon 8 Gen 3 Mobile | 0,821 | 0 - 84 | NPU |
| ONNX | w8a16 | Snapdragon 8 Gen 1 Mobile | 1,613 | 0 - 86 | NPU |
| ONNX | w8a16 | Dragonwing QCS6490 | 3,327 | 0 - 3 | NPU |
| ONNX | w8a16 | Dragonwing IQ-8275 | 1,231 | 0 - 4 | NPU |
| ONNX | w8a16 | Dragonwing QCS8550 (proxy) | 1,213 | 0 - 130 | NPU |
| ONNX | w8a16 | QCS8450 | 1,613 | 0 - 86 | NPU |
| ONNX | w8a16 | Dragonwing IQ-9075 | 1,376 | 0 - 3 | NPU |
| ONNX | w8a16 | Dragonwing IQ-X7181 | 1,261 | 13 - 13 | NPU |
| ONNX | w8a16 | Dragonwing Q-6690 | 5,924 | 0 - 67 | NPU |
| ONNX | w8a16 | Dragonwing Q-7790 | 1,361 | 0 - 65 | NPU |
| ONNX | w8a16 | Dragonwing Q-8750 | 0,575 | 0 - 59 | NPU |
| ONNX | w8a16 | Snapdragon 8 Elite Mobile | 0,575 | 0 - 59 | NPU |

Observaciones sobre la tabla: el salto más grande se produce entre Snapdragon 8 Gen 1 y generaciones posteriores (4,975 ms frente a 0,575-0,833 ms), y la cuantización w8a16 mejora de forma notable a los chipsets más antiguos (8 Gen 1 pasa de 4,975 ms a 1,613 ms) mientras apenas cambia en la gama más reciente. La model card no indica el tamaño de lote ni el número de repeticiones empleados en la medición.

## Requisitos de hardware

- VRAM: no requiere GPU dedicada. El peso float ocupa 46,9 MB y el w8a16 12,2 MB, por lo que cabe en la memoria compartida de cualquier SoC móvil moderno; la memoria pico medida oscila entre menos de 1 MB y 133 MB según plataforma y runtime.
- GPU recomendadas: no aplica. El objetivo del repositorio es la NPU Hexagon de Qualcomm; no se publican mediciones en A100, H100, RTX 4090 ni otras GPU de escritorio o servidor.
- Dispositivos compatibles verificados: Snapdragon X2 Elite, X Elite, 8 Elite Gen 5 Mobile, 8 Elite Mobile, 8 Gen 3 Mobile, 8 Gen 1 Mobile, QCS8450, QCS6490, Dragonwing IQ-8275, IQ-9075, IQ-X7181, Q-6690, Q-7790, Q-8750 y QCS8550 (proxy).
- Cabe en hardware de consumo: sí, en teléfonos, portátiles con Snapdragon X y módulos embebidos de la gama Dragonwing.
- Opciones de despliegue: artefactos ONNX con ONNX Runtime 1.27.1, QNN DLC mediante QAIRT 2.45, TFLite (solo float en la información disponible) y compilación personalizada a través de Qualcomm AI Hub Workbench. La exportación se realiza con la librería `qai-hub-models` v0.62.2 en Python.
- Latencia: de 0,52 ms a 5,924 ms por inferencia según chipset, precisión y runtime (véase la tabla de benchmarks). No se publican datos de throughput agregado ni de latencia en CPU o GPU del propio SoC.
- Requisitos de desarrollo: para generar artefactos propios hace falta una cuenta en Qualcomm AI Hub y el SDK QAIRT; los artefactos preexportados se pueden descargar sin entrenamiento adicional, pero se desconoce el hardware de desarrollo mínimo, ya que no se detalla en la información disponible.

## Comparativa con modelos similares

La categoría natural de EfficientFormer es la de clasificadores de imagen ligeros para dispositivos móviles y de borde. La información proporcionada no incluye especificaciones verificadas de los modelos alternativos, por lo que los campos correspondientes se marcan como no disponibles en lugar de estimarse:

| Modelo | Categoria | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientFormer L1 (esta ficha) | Vision transformer movil | 12,3 M | 224x224 | Apache 2.0 | ONNX, QNN DLC, TFLite |
| MobileNet (familia) | CNN movil | No disponible | No disponible | No disponible | No disponible |
| EfficientNet-lite (familia) | CNN movil | No disponible | No disponible | No disponible | No disponible |
| MobileViT (familia) | Hibrido CNN-transformer movil | No disponible | No disponible | No disponible | No disponible |
| DeiT-Tiny | Vision transformer | No disponible | No disponible | No disponible | No disponible |

La ventaja diferencial de este repositorio no es la arquitectura, sino el conjunto de artefactos ya compilados y cuantizados para NPU Qualcomm, junto con latencias publicadas por chipset. Una comparación de precisión frente a las alternativas exigiría datos top-1/top-5 que no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Alcance cerrado: clasifica únicamente sobre las 1.000 clases de ImageNet. Cualquier dominio propio requiere ajuste fino y reexportación desde el repositorio original, ya que este repositorio publica artefactos compilados, no un pipeline de entrenamiento.
- Resolución fija de 224x224. Otras resoluciones obligan a reexportar con formas de entrada personalizadas mediante `qai-hub-models`.
- Sin métricas de exactitud publicadas: no hay datos de top-1/top-5 en la model card, por lo que no se puede evaluar el impacto real de la cuantización w8a16 sobre la precisión.
- Sesgos heredados del dataset de entrenamiento (ImageNet): desequilibrio entre clases, sobrerrepresentación de determinadas culturas y contextos geográficos, y confusión esperable en categorías visualmente próximas. No se documenta ningún análisis de sesgo ni de robustez.
- Riesgo de alucinación en sentido estricto: no aplica (no es un modelo generativo), pero sí existe riesgo de clasificación errónea con alta confianza, especialmente fuera de la distribución de ImageNet.
- Limitaciones de idioma: no aplica; el modelo no procesa texto. No hay soporte multilingüe de ningún tipo. No soporta tool calling, agentes, razonamiento multi-paso, contexto largo ni diálogo.
- Restricciones de licencia: los pesos y el código se publican bajo Apache 2.0, lo que permite uso comercial. No se detallan en la información disponible las condiciones de uso del Qualcomm AI Hub, del Workbench ni del SDK QAIRT, que son necesarios para compilar y perfilar; conviene revisarlas antes de un despliegue en producción.
- Advertencia sobre las mediciones: las latencias corresponden a plataformas concretas, versiones exactas de SDK (QAIRT 2.45, ONNX Runtime 1.27.1) y condiciones de perfilado no especificadas (lote, repeticiones, frecuencia). No son extrapolables a otros runtimes ni a otros modelos de chip.
- Nota sobre el artefacto: pese a que el repositorio declara `pytorch` como librería, los recursos descargables son exportaciones (ONNX, QNN DLC, TFLite) y no un checkpoint entrenable listo para usar directamente.
- Madurez y comunidad: 16 descargas y 1 like en HuggingFace, con una única variante (L1) publicada. La adopción es muy baja, por lo que el soporte comunitario es limitado.
- Fecha de actualización posterior a la de creación (2026-09-11 frente a 2025-08-29) sin registro de cambios disponible, por lo que se desconoce qué se modificó.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/qualcomm/EfficientFormer
- Implementación original (Snap Research): https://github.com/snap-research/EfficientFormer
- Paper original: https://arxiv.org/abs/2212.08059
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/efficientformer
- Código de exportación en Qualcomm AI Hub Models (v0.62.2): https://github.com/qualcomm/ai-hub-models/blob/v0.62.2/src/qai_hub_models/models/efficientformer
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Descargas de artefactos preexportados (v0.62.2):
  - ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/efficientformer/releases/v0.62.2/efficientformer-onnx-float.zip
  - ONNX w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/efficientformer/releases/v0.62.2/efficientformer-onnx-w8a16.zip
  - QNN DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/efficientformer/releases/v0.62.2/efficientformer-qnn_dlc-float.zip
  - QNN DLC w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/efficientformer/releases/v0.62.2/efficientformer-qnn_dlc-w8a16.zip
  - TFLite float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/efficientformer/releases/v0.62.2/efficientformer-tflite-float.zip
- Enlaces corporativos devueltos por la búsqueda web (sin relación técnica directa con el modelo): https://www.qualcomm.com/, https://www.qualcomm.com/company, https://en.wikipedia.org/wiki/Qualcomm, https://fr.wikipedia.org/wiki/Qualcomm, https://www.boursorama.com/cours/QCOM/
