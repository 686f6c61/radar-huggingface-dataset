# qualcomm/AG-Pose

## Resumen

AG-Pose es un modelo de estimación de pose 6D de objetos a nivel de categoría (category-level) desarrollado originalmente por investigadores académicos y empaquetado por Qualcomm para su despliegue optimizado en dispositivos con aceleración NPU. El modelo predice rotación, traslación y tamaño de objetos a partir de entrada RGB-D, combinando un backbone visual DINOv2-S (ViT-S/14) para la rama RGB con PointNet++ para el procesamiento de nubes de puntos 3D. Sobre estas dos ramas se apoyan dos componentes propietarios del método: un detector de keypoints adaptativo a la instancia (IAKD) y un agregador de características geométricas (GAFA).

La relevancia de esta ficha dentro de un catálogo de IA open source es doble. Por un lado, AG-Pose no es un modelo de lenguaje sino un modelo de visión por computador especializado en percepción 3D, útil para robótica de manipulación, realidad aumentada y automatización industrial. Por otro lado, la versión publicada por Qualcomm no es el checkpoint de investigación puro, sino un conjunto de artefactos pre-exportados (ONNX y QNN_DLC) listos para ejecutarse en chipsets Snapdragon y Dragonwing, lo que lo convierte en una pieza de despliegue en el borde (edge) más que en un modelo para entrenamiento o fine-tuning genérico.

El modelo tiene 30,4 millones de parámetros, acepta entradas de 1 x 3 x 224 x 224 píxeles en su rama visual y soporta seis categorías de objeto: botella, cuenco, cámara, lata, portátil y taza. Su licencia es MIT y su formato de pesos principal es ONNX float, con una variante QNN_DLC para el runtime de Qualcomm. No dispone de datos publicados de benchmarks de precisión en la información proporcionada, solo métricas de latencia y memoria en hardware Qualcomm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: DINOv2-S (ViT-S/14) para RGB + PointNet++ para nube de puntos 3D, con IAKD (detector de keypoints adaptativo a la instancia) y GAFA (agregador de características geométricas) |
| Parametros totales | 30,4 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | Float (ONNX float y QNN_DLC float); no se documentan otras precisiones en la información disponible |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (float) y QNN_DLC (float); checkpoint original epoch_30.pt |
| Resolucion de entrada | 1 x 3 x 224 x 224 |
| Tamano del modelo (float) | ~116 MB |
| Categorias soportadas | bottle, bowl, camera, can, laptop, mug |
| Pipeline | keypoint-detection |

## Arquitectura y entrenamiento

AG-Pose es un modelo de estimación de pose 6D de objetos a nivel de categoría, es decir, no requiere una malla CAD específica de la instancia en el momento de la inferencia, sino que generaliza a objetos de una misma categoría. La arquitectura combina dos ramas: una rama visual basada en DINOv2-S (ViT-S/14), que procesa la imagen RGB a 224 x 224, y una rama geométrica basada en PointNet++, que procesa la nube de puntos 3D derivada de la entrada RGB-D. Sobre estas representaciones, el módulo IAKD detecta keypoints adaptados a la instancia concreta y el módulo GAFA agrega características geométricas para hacer robusta la estimación de la pose frente a variaciones intra-categoría.

El modelo se entrenó sobre las seis categorías indicadas y el checkpoint publicado corresponde a la época 30 (epoch_30.pt). No se dispone en la información proporcionada del número de tokens, composición del dataset, ni del uso de técnicas de RLHF o DPO, que por otra parte no aplican a un modelo de visión de este tipo. La innovación técnica destacable es la combinación de un backbone ViT preentrenado de gran capacidad con un procesador de nubes de puntos y dos módulos específicos de adaptación a instancia y agregación geométrica, lo que permite estimar pose 6D sin CAD por instancia.

Qualcomm no publica el proceso de entrenamiento original, sino el pipeline de exportación y compilación mediante Qualcomm AI Hub Workbench, que genera artefactos ONNX y QNN_DLC optimizados para NPU. El modelo se divide en subgrafos (backbone y rotation_head) que se compilan y perfilan por separado en el hardware destino.

## Capacidades

- Estimación de pose 6D de objetos a nivel de categoría: predice rotación, traslación y tamaño del objeto a partir de entrada RGB-D.
- Procesamiento multimodal RGB + profundidad: combina imagen RGB (ViT-S/14) con nube de puntos 3D (PointNet++).
- Detección de keypoints adaptativa a la instancia mediante el módulo IAKD.
- Agregación de características geométricas mediante el módulo GAFA para robustez intra-categoría.
- Generalización a seis categorías de objeto: botella, cuenco, cámara, lata, portátil y taza.
- Inferencia en dispositivo (on-device) acelerada por NPU en chipsets Qualcomm Snapdragon y Dragonwing.
- Exportación a ONNX (runtime universal) y QNN_DLC (runtime Qualcomm QAIRT).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión generativa ni de modo thinking.

## Casos de uso

- Robótica de manipulación: el modelo estima la pose 6D de objetos cotidianos (botellas, tazas, latas) para que un brazo robótico calcule el punto de agarre y la orientación antes de cerrar la pinza. Es adecuado porque trabaja a nivel de categoría y no requiere CAD por instancia.
- Realidad aumentada en móvil: superponer información digital sobre objetos físicos detectados en tiempo real. La latencia de ~50 ms del backbone en Snapdragon 8 Elite permite experiencias interactivas en el dispositivo sin enviar vídeo a la nube.
- Automatización de líneas de montaje: verificación de orientación y posición de piezas (cámaras, portátiles) en cintas transportadoras, usando la rama RGB-D para tolerar iluminación variable y oclusiones parciales.
- Inventario y logística: reconocimiento y localización 3D de latas, botellas y cuencos en estanterías o contenedores, con la ventaja de ejecutarse en dispositivos de borde sin conectividad.
- Asistencia a personas con discapacidad visual: un dispositivo wearable con cámara de profundidad podría localizar objetos de las seis categorías y estimar su pose para guiar la mano del usuario hacia el objeto.
- Desarrollo de demos y prototipos en Qualcomm AI Hub: usar los artefactos ONNX/QNN_DLC pre-exportados para validar pipelines de percepción 3D en hardware Snapdragon antes de invertir en un modelo propio.
- Investigación en percepción 3D: servir como baseline reproducible de pose 6D category-level con licencia MIT, útil para comparar variantes de backbone o de agregación geométrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (por ejemplo, ADD-S, IoU 3D o métricas de pose) en la información disponible. Los únicos datos de rendimiento proporcionados son métricas de latencia y memoria en hardware Qualcomm:

| Subgrafo | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Rango de memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|---|
| backbone | ONNX | float | Snapdragon 8 Elite For Galaxy Mobile | 50,344 | 1 - 351 | NPU |
| backbone | ONNX | float | Qualcomm Dragonwing Q-8750 | 50,344 | 1 - 351 | NPU |
| backbone | QNN_DLC | float | Snapdragon 8 Elite For Galaxy Mobile | 52,827 | 1 - 403 | NPU |
| backbone | QNN_DLC | float | Qualcomm Dragonwing Q-8750 | 52,827 | 1 - 403 | NPU |
| rotation_head | ONNX | float | Snapdragon 8 Elite For Galaxy Mobile | 0,16 | 0 - 25 | NPU |
| rotation_head | ONNX | float | Qualcomm Dragonwing Q-8750 | 0,16 | 0 - 25 | NPU |
| rotation_head | QNN_DLC | float | Snapdragon 8 Elite For Galaxy Mobile | 0,158 | 0 - 24 | NPU |
| rotation_head | QNN_DLC | float | Qualcomm Dragonwing Q-8750 | 0,158 | 0 - 24 | NPU |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo está pensado para ejecutarse en NPU de dispositivos Qualcomm con un rango de memoria pico de 1 a 403 MB según el subgrafo y el runtime.
- GPU recomendadas: no se documentan GPU de escritorio; el hardware objetivo son chipsets Snapdragon 8 Elite For Galaxy Mobile y Qualcomm Dragonwing Q-8750 con NPU.
- ¿Cabe en GPU consumer? No se proporcionan datos de despliegue en GPU consumer; el modelo se distribuye como artefactos ONNX/QNN_DLC para NPU Qualcomm. Un despliegue en GPU requeriría recompilar el grafo ONNX con otro runtime, algo no documentado en la información disponible.
- Opciones de despliegue: ONNX Runtime 1.30.0 con QAIRT 2.50 (runtime universal) y QNN_DLC con QAIRT 2.50 (runtime Qualcomm). También es posible reexportar con la librería Qualcomm AI Hub Models para pesos, formas de entrada y configuraciones de dispositivo personalizadas.
- Latencia y throughput estimados: backbone ~50,3 ms (ONNX) o ~52,8 ms (QNN_DLC) en NPU; rotation_head ~0,16 ms. El resto de subgrafos del pipeline no se detallan en la información disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks de precisión ni de especificaciones de modelos comparables de pose 6D category-level (por ejemplo, variantes de NOCS, SGPA o Category-Level Pose). La comparativa se limita a los aspectos documentados:

| Modelo | Parametros | Entrada | Categorias | Licencia | Formato |
|---|---|---|---|---|---|
| AG-Pose (Qualcomm) | 30,4 M | RGB-D 224x224 | 6 | MIT | ONNX, QNN_DLC |
| Alternativas de pose 6D category-level | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Cobertura limitada de categorías: solo soporta seis clases (bottle, bowl, camera, can, laptop, mug); objetos fuera de ellas no están contemplados.
- Dependencia de entrada RGB-D: requiere profundidad además de RGB; sin sensor de profundidad la rama PointNet++ no puede operar correctamente.
- Sin benchmarks de precisión publicados en la información disponible: no es posible evaluar la exactitud de la pose (ADD-S, IoU 3D) antes de desplegar.
- Orientado a hardware Qualcomm: los artefactos pre-exportados están compilados para NPU Snapdragon/Dragonwing; el despliegue en otras plataformas requiere reexportación y no está documentado.
- Resolución de entrada fija de 224 x 224: puede limitar la precisión en objetos pequeños o muy ocluidos.
- Riesgo de alucinación en el sentido de detecciones falsas: como todo modelo de percepción, puede predecir poses para objetos ausentes o mal segmentados; se recomienda validación con umbrales de confianza.
- Sesgos de dominio: no se documenta la composición del dataset de entrenamiento, por lo que se desconoce su robustez ante dominios visuales distintos (iluminación, materiales, sensores).
- Licencia MIT: permite uso comercial, pero conviene revisar la licencia de la implementación original en el repositorio de GitHub para confirmar compatibilidad de componentes de terceros (DINOv2, PointNet++).
- Sin soporte de lenguaje, agentes ni tool calling: no debe confundirse con un modelo conversacional ni usarse en tareas de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/AG-Pose
- Página en Qualcomm AI Hub: https://aihub.qualcomm.com/models/agpose
- Repositorio de exportación en GitHub (ai-hub-models): https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/agpose
- Implementación original de AG-Pose: https://github.com/Leeiieeo/AG-Pose
- Paper (arXiv 2403.19527): https://arxiv.org/abs/2403.19527
- Licencia de la implementación original: https://github.com/Leeiieeo/AG-Pose/blob/main/LICENSE
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Comunidad Slack de AI Hub: https://aihub.qualcomm.com/community/slack
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/agpose/releases/v0.66.0/agpose-onnx-float.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/agpose/releases/v0.66.0/agpose-qnn_dlc-float.zip
