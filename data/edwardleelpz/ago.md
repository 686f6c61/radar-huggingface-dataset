# EdwardLeeLPZ/AGO

## Resumen

AGO (Adaptive Grounding for Open World 3D Occupancy Prediction) es un modelo de investigación para predicción de ocupación 3D en entornos de conducción autónoma, presentado en ICCV 2025 por Peizheng Li, Shuxiao Ding, You Zhou y colaboradores de la Universidad de Tubinga y Mercedes-Benz Research. Resuelve el problema de la predicción de ocupación en mundo abierto: estimar qué regiones del espacio 3D están ocupadas por qué tipo de objeto, incluyendo categorías no vistas durante el entrenamiento, mediante el anclaje semántico de características visuales con embeddings de texto CLIP.

El modelo se entrena y evalúa sobre Occ3D-nuScenes, el benchmark derivado del dataset nuScenes, y se distribuye como pesos preentrenados (state_dict) compatibles con el ecosistema MMDetection3D. La arquitectura concreta no se detalla en la información disponible; los pesos ocupan 0,8 GB en el repositorio. Es relevante para investigadores que trabajan en percepción 3D open-vocabulary, ya que ofrece puntos de partida tanto para entrenamiento autosupervisado como para preentrenamiento y ajuste fino en mundo abierto.

Los resultados publicados en la model card muestran un compromiso explícito entre rendimiento en clases conocidas y desconocidas: el ajuste fino open-world alcanza 36,88 mIoU en clases conocidas y 8,78 en desconocidas, mientras que el preentrenamiento en modo zero-shot prioriza la generalización (33,95 en conocidas, 0,42 en desconocidas). El modelo no incluye los pesos de CLIP, que se cargan desde FeatUp en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de predicción de ocupación 3D; usa backbone CLIP externo cargado desde FeatUp) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre secuencias de imágenes multivista de nuScenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de percepción visual, sin interfaz de texto libre) |
| Licencia | nuscenes-terms-of-use (licencia "other" con nombre nuscenes-terms-of-use) |
| Formato de pesos | `.pth` (state_dict de PyTorch, compatible con MMDetection3D) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de backbone, mecanismo de fusión, diseño del decodificador de ocupación). Se sabe que AGO emplea anclaje adaptativo ("adaptive grounding") para conectar características visuales con embeddings de texto CLIP, lo que permite la predicción open-vocabulary de ocupación 3D. Los pesos de CLIP no se incluyen en el repositorio y se cargan desde FeatUp en tiempo de ejecución, lo que implica una dependencia externa para la inferencia.

El repositorio publica cuatro configuraciones de pesos entrenados sobre Occ3D-nuScenes: autosupervisado, preentrenamiento open-world (con evaluación estándar y zero-shot) y ajuste fino open-world. No se especifican en la información proporcionada el número de tokens o muestras de entrenamiento, la composición del dataset más allá de nuScenes, ni si se emplearon técnicas de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Predicción de ocupación 3D densa sobre escenas de conducción a partir de imágenes multivista de nuScenes.
- Segmentación semántica open-vocabulary de volúmenes ocupados: clasificación de regiones 3D en categorías, incluyendo clases no vistas durante el entrenamiento mediante anclaje con CLIP.
- Modo zero-shot para preentrenamiento open-world (evaluado con 33,95 mIoU en clases conocidas y 0,42 en desconocidas).
- Ajuste fino específico para mejorar el rendimiento en clases desconocidas (8,78 mIoU unknown).
- Entrenamiento autosupervisado disponible como punto de partida sin etiquetas de ocupación.
- Integración con el ecosistema MMDetection3D (scripts `dist_test.sh`, configs en `projects/configs/`).
- No se documentan capacidades de tool calling, agentes, generación de texto, razonamiento multi-step ni procesamiento de audio.

## Casos de uso

- Investigación en percepción 3D open-vocabulary: usar los pesos de ajuste fino open-world como baseline para comparar nuevas propuestas de anclaje semántico sobre Occ3D-nuScenes, dado que la model card publica métricas de referencia (known/unknown/mIoU).
- Desarrollo de sistemas de conducción autónoma que deban detectar obstáculos de categorías no presentes en el conjunto de entrenamiento: el modo open-world permite clasificar volúmenes ocupados por clases noveles mediante embeddings CLIP.
- Preentrenamiento autosupervisado como inicialización: el checkpoint `ago_nuscenes_self_supervised.pth` sirve como punto de partida para ajuste fino en dominios o datasets propios sin requerir etiquetas de ocupación densas.
- Evaluación comparativa de modelos de ocupación: los cuatro checkpoints permiten reproducir la tabla de resultados del paper y comparar configuraciones (self-supervised, open-world pretraining, zero-shot, fine-tuning) en un mismo pipeline MMDetection3D.
- Planificación de trayectorias y evitación de colisiones: la representación de ocupación 3D alimenta módulos de planificación que necesitan un mapa volumétrico del entorno, incluyendo objetos no catalogados.
- Análisis de robustez ante clases desconocidas: el checkpoint zero-shot (0,42 mIoU unknown) frente al fine-tuning (8,78 mIoU unknown) permite estudiar el coste de generalización y el olvido catastrófico en percepción open-world.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre Occ3D-nuScenes (mIoU en clases conocidas / desconocidas / global):

| Checkpoint | Config | Known mIoU | Unknown mIoU | mIoU |
|---|---|---|---|---|
| `ago_nuscenes_self_supervised.pth` | `ago_nuscenes_self_supervised.py` | - | - | 19,16 |
| `ago_nuscenes_open_world_pretraining.pth` | `ago_nuscenes_open_world_pretraining.py` | 23,23 | 0,00 | 11,61 |
| `ago_nuscenes_open_world_pretraining.pth` (zero-shot) | `ago_nuscenes_open_world_pretraining.py` | 33,95 | 0,42 | 7,13 |
| `ago_nuscenes_open_world_finetuning.pth` | `ago_nuscenes_open_world_finetuning.py` | 36,88 | 8,78 | 14,40 |

No se han publicado en la información disponible resultados de benchmarks de otros modelos comparables ni métricas adicionales (mAP, IoU por clase, latencia).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Los pesos ocupan 0,8 GB en disco, pero el consumo en GPU depende del backbone CLIP cargado desde FeatUp y de la resolución de las imágenes multivista, datos no especificados.
- GPU recomendadas: no disponible. El script de evaluación de ejemplo usa 8 procesos (`dist_test.sh ... 8`), lo que sugiere evaluación multi-GPU distribuida, pero no se indica el modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; el requisito de 8 GPUs en el comando de ejemplo apunta a un despliegue en servidor.
- Opciones de despliegue: MMDetection3D mediante `tools/dist_test.sh` con las configs del repositorio; requiere instalación del código de https://github.com/EdwardLeeLPZ/AGO y preparación del dataset nuScenes/Occ3D-nuScenes.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de predicción de ocupación open-vocabulary ni métricas comparables más allá de los cuatro checkpoints del propio AGO.

## Limitaciones y advertencias

- El rendimiento en clases desconocidas es bajo en términos absolutos: 8,78 mIoU en el mejor caso (ajuste fino open-world) y 0,42 mIoU en zero-shot, lo que limita su uso directo en producción para detección de objetos noveles.
- El modo zero-shot sacrifica drásticamente el rendimiento en clases conocidas (33,95 known / 0,42 unknown), evidenciando un fuerte compromiso entre generalización y precisión.
- Dependencia externa de los pesos CLIP cargados desde FeatUp: la inferencia no es autocontenida y requiere esa dependencia adicional.
- Licencia `nuscenes-terms-of-use`: los pesos están sujetos a los términos de uso de nuScenes, lo que puede restringir el uso comercial. Debe revisarse https://www.nuscenes.org/terms-of-use antes de cualquier despliegue.
- Entrenado exclusivamente sobre nuScenes/Occ3D-nuScenes: la generalización a otros dominios (otras ciudades, sensores, condiciones meteorológicas) no está documentada.
- Sin información sobre sesgos, alucinación (en el sentido de predicciones espurias de ocupación) ni robustez ante condiciones adversas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación comunitaria limitado.
- Modelo de investigación (ICCV 2025); no se documentan garantías de producción, versionado ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/EdwardLeeLPZ/AGO
- Repositorio de código: https://github.com/EdwardLeeLPZ/AGO
- Paper (arXiv): https://arxiv.org/abs/2504.10117
- Términos de uso de nuScenes: https://www.nuscenes.org/terms-of-use
