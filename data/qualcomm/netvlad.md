# qualcomm/NetVLAD

## Resumen

NetVLAD es un modelo de reconocimiento visual de lugares (*visual place recognition*) desarrollado originalmente por Relja Arandjelovic y colaboradores, y publicado en el artículo "NetVLAD: CNN architecture for weakly supervised place recognition" (arXiv:1511.07247). La versión aquí documentada es la exportación optimizada que Qualcomm distribuye a través de su plataforma AI Hub Models, pensada para ejecutarse en dispositivos con chipset Snapdragon y aceleración por NPU. El modelo no es un LLM ni un transformer generativo: es una red convolucional de visión que produce un descriptor global de imagen para tareas de recuperación y localización.

El modelo parte de un backbone VGG-16 y añade una capa VLAD (Vector of Locally Aggregated Descriptors) diferenciable que agrega los descriptores locales densos en un vector compacto de 32.768 dimensiones, normalizado en L2. Ese descriptor permite hacer búsqueda por vecino más cercano entre imágenes tomadas bajo condiciones muy distintas (cambios de iluminación, estación, ángulo o presencia de oclusiones), lo que lo hace útil para localización visual, SLAM y robótica.

Su relevancia actual reside en la optimización para inferencia en el dispositivo: Qualcomm publica artefactos preexportados en ONNX, QNN_DLC y TFLite con cuantización `w8a8_mixed_int16`, con latencias de 3,16-12,49 ms en NPU según runtime y precisión. Esto permite desplegar reconocimiento de lugares en tiempo real en hardware móvil y embebido sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (VGG-16) + capa VLAD diferenciable |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | float y w8a8_mixed_int16 |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX, QNN_DLC, TFLite (artefactos preexportados); PyTorch para el modelo fuente |

## Arquitectura y entrenamiento

NetVLAD combina un extractor convolucional VGG-16 con una capa de agregación VLAD. En lugar de un *pooling* global clásico, la capa VLAD asigna cada descriptor local a un conjunto de centroides aprendidos mediante una asignación suave diferenciable, y acumula los residuales respecto a cada centroide. El resultado es un descriptor global de 32.768 dimensiones que se normaliza en L2 y se usa directamente para recuperación por similitud (producto escalar o distancia euclídea).

El entrenamiento original es débilmente supervisado: se usan imágenes con etiquetas de ubicación aproximada (no correspondencias pixel a pixel) y una función de pérdida de ranking que empuja los descriptores de imágenes de la misma ubicación a ser cercanos y los de ubicaciones distintas a alejarse. La model card de Qualcomm no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF/DPO (no aplica a un modelo de visión). La innovación técnica destacable es precisamente la capa VLAD diferenciable, que permite entrenar de extremo a extremo un agregado tipo bolsa de palabras sin supervisión densa.

## Capacidades

- Extracción de descriptores globales de imagen de 32.768 dimensiones, normalizados en L2.
- Reconocimiento visual de lugares (*place recognition*) y recuperación de imágenes por similitud.
- Robusta a cambios de iluminación, estación, punto de vista y oclusiones parciales, según el diseño del artículo original.
- Clasificación de imágenes a nivel de pipeline (`image-classification` en HuggingFace), aunque su uso principal es la recuperación.
- Inferencia acelerada por NPU en chipsets Qualcomm Snapdragon y Dragonwing.
- Exportación a ONNX, QNN_DLC y TFLite con cuantización w8a8_mixed_int16.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Localización visual en robótica móvil: el modelo genera un descriptor por imagen de cámara que se compara contra una base de datos de lugares conocidos, permitiendo estimar la posición del robot sin GPS en entornos interiores o urbanos.
- SLAM y relocalización: integrado en un pipeline de SLAM visual, NetVLAD aporta el reconocimiento de bucle (*loop closure*) comparando descriptores globales de fotogramas actuales con mapas previos.
- Realidad aumentada en móvil: al ejecutarse en NPU con latencias de 3-12 ms, permite anclar contenido virtual a ubicaciones reconocidas en tiempo real desde un smartphone Snapdragon.
- Vehículos autónomos y asistencia a la conducción: reconocimiento de lugares para validar la posición del vehículo frente a mapas previos, con tolerancia a cambios de estación e iluminación.
- Búsqueda visual de imágenes: indexación y recuperación de imágenes por similitud en catálogos, archivos fotográficos o bases de datos geolocalizadas.
- Navegación asistida para personas con discapacidad visual: identificación de puntos de referencia conocidos a partir de la cámara del dispositivo, ejecutándose localmente en el terminal.
- Inspección industrial y mantenimiento: comparación de imágenes de una misma instalación tomadas en momentos distintos para detectar cambios de estado o ubicación.

## Benchmarks y rendimiento

La model card de Qualcomm no publica resultados de benchmarks de precisión (recall@N, MMLU, HumanEval, GSM8K u otros). Sí publica métricas de inferencia en dispositivo:

| Modelo | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|---|
| NetVLAD | ONNX | float | Snapdragon 8 Elite For Galaxy Mobile | 11,288 | 0 - 141 | NPU |
| NetVLAD | ONNX | float | Qualcomm Dragonwing Q-8750 | 11,288 | 0 - 141 | NPU |
| NetVLAD | ONNX | w8a8_mixed_int16 | Snapdragon 8 Elite For Galaxy Mobile | 3,211 | 0 - 144 | NPU |
| NetVLAD | ONNX | w8a8_mixed_int16 | Qualcomm Dragonwing Q-8750 | 3,211 | 0 - 144 | NPU |
| NetVLAD | QNN_DLC | float | Snapdragon 8 Elite For Galaxy Mobile | 12,49 | 4 - 143 | NPU |
| NetVLAD | QNN_DLC | float | Qualcomm Dragonwing Q-8750 | 12,49 | 4 - 143 | NPU |
| NetVLAD | QNN_DLC | w8a8_mixed_int16 | Snapdragon 8 Elite For Galaxy Mobile | 3,16 | 0 - 142 | NPU |
| NetVLAD | QNN_DLC | w8a8_mixed_int16 | Qualcomm Dragonwing Q-8750 | 3,16 | 0 - 142 | NPU |
| NetVLAD | TFLITE | float | Snapdragon 8 Elite For Galaxy Mobile | 11,272 | 0 - 145 | NPU |
| NetVLAD | TFLITE | float | Qualcomm Dragonwing Q-8750 | 11,272 | 0 - 145 | NPU |

No se han publicado resultados de benchmarks de precisión en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el modelo está orientado a NPU móvil, no a GPU de escritorio.
- GPU recomendadas: no se especifican; el despliegue objetivo son chipsets Qualcomm Snapdragon 8 Elite y Dragonwing Q-8750.
- Cabe en hardware de consumo: sí, en dispositivos móviles y embebidos con NPU Qualcomm; no se documenta su ejecución en GPU de consumo tipo RTX 4090.
- Opciones de despliegue: ONNX Runtime (1.30.0), QNN SDK (QAIRT 2.50) y TFLite; exportación personalizada mediante la librería `qai-hub-models` v0.66.0.
- Latencia estimada: 3,16-12,49 ms por inferencia en NPU según runtime y precisión; memoria pico en torno a 141-145 MB.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NetVLAD (Qualcomm) | no disponible | no aplica | Reconocimiento visual de lugares | MIT | HuggingFace + Qualcomm AI Hub |
| Modelos de recuperación visual genéricos (p. ej. CLIP) | no disponible | no aplica | Recuperación imagen-texto | varía | HuggingFace |
| Backbones de clasificación de imagen (p. ej. ResNet) | no disponible | no aplica | Clasificación de imagen | varía | HuggingFace |

No se dispone de datos de benchmarks comparativos en la información proporcionada; la comparación se limita a la categoría funcional.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo de visión entrenado con datasets de lugares, puede heredar sesgos geográficos y de composición de las imágenes de entrenamiento.
- Riesgo de fallo en condiciones visuales extremas no representadas en el entrenamiento (nieve, noche, cambios estacionales severos).
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni generación.
- La licencia MIT se aplica a esta exportación; la implementación original de NetVLAD tiene su propia licencia en el repositorio de Relja Arandjelovic, que debe revisarse para uso comercial.
- Los artefactos están optimizados para chipsets Qualcomm; el rendimiento en otras plataformas no está garantizado.
- No se documentan métricas de precisión (recall@N) en la model card, por lo que la calidad de recuperación debe validarse en el dominio de despliegue.
- El tamaño del descriptor (32.768 dimensiones) implica un coste de almacenamiento y búsqueda considerable en bases de datos grandes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/NetVLAD
- Página en Qualcomm AI Hub: https://aihub.qualcomm.com/models/netvlad
- Repositorio de exportación: https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/netvlad
- Paper original: https://arxiv.org/abs/1511.07247
- Implementación fuente en PyTorch: https://github.com/Nanne/pytorch-NetVlad
- Licencia de la implementación original: https://github.com/relja/netvlad/blob/master/LICENCE
- Workbench de Qualcomm AI Hub: https://workbench.aihub.qualcomm.com
- Comunidad AI Hub Slack: https://aihub.qualcomm.com/community/slack
