# dronefreak/simipu-r50-nyuv2-imagenet

## Resumen

SimIPU R50 NYUv2 ImageNet es un modelo de estimacion de profundidad monocular basado en un encoder ResNet-50 con preentrenamiento supervisado en ImageNet y una cabeza de profundidad del Monocular-Depth-Estimation-Toolbox. Lo desarrolla el equipo de Zhenyu Li (SimIPU, AAAI 2022) y esta pensado como variante de comparacion dentro del estudio de estrategias de preentrenamiento de encoders para estimacion de profundidad. El repositorio de Hugging Face es un espejo no oficial creado por el usuario `dronefreak` que redistribuye los pesos sin modificarlos.

El modelo resuelve la tarea de estimacion de profundidad densa a partir de una unica imagen RGB, produciendo un mapa de profundidad por pixel. Con 77,8 millones de parametros y una arquitectura CNN clasica (ResNet-50), es un modelo ligero y facil de desplegar, orientado a investigacion y a pipelines donde se necesite profundidad monocular con requisitos de computo moderados.

Su relevancia actual es principalmente como referencia reproducible: forma parte de la matriz de experimentos del toolbox oficial que compara inicializaciones (desde cero, ImageNet supervisado, SimIPU sobre KITTI y SimIPU sobre Waymo) sobre el dataset NYUv2, lo que lo convierte en una pieza util para reproducir resultados y como baseline frente a modelos de profundidad mas modernos basados en transformers o en foundation models.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ResNet-50 con cabeza de profundidad (Monocular-Depth-Estimation-Toolbox) |
| Parametros totales | 77.823.809 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en FP32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | `super_imagenet_nyu.pth` (checkpoint original PyTorch) y `model.safetensors` (solo pesos) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional ResNet-50 que actua como encoder de una cabeza de estimacion de profundidad del Monocular-Depth-Estimation-Toolbox. El encoder se inicializa con pesos de preentrenamiento supervisado en ImageNet y posteriormente se afina junto con la cabeza de profundidad sobre NYUv2 durante 24 epocas. El modelo forma parte de una familia de variantes que difieren unicamente en la inicializacion del encoder: desde cero, ImageNet supervisado, SimIPU preentrenado sobre KITTI y SimIPU preentrenado sobre Waymo.

El trabajo de referencia, SimIPU, propone un preentrenamiento no supervisado que combina imagenes 2D con nubes de puntos 3D para aprender representaciones visuales con conciencia espacial. En esta variante concreta, sin embargo, el encoder no usa SimIPU sino el preentrenamiento supervisado de ImageNet, por lo que actua como control o baseline dentro del estudio. No se documentan en la informacion disponible detalles sobre el numero exacto de tokens, composicion del dataset de preentrenamiento ni uso de RLHF/DPO (no aplica a un modelo de vision).

## Capacidades

- Estimacion de profundidad monocular densa a partir de una imagen RGB.
- Salida de un mapa de profundidad por pixel compatible con el formato del Monocular-Depth-Estimation-Toolbox.
- Inferencia con volteo horizontal (flip) para mejora de metricas, segun los resultados reportados.
- Uso como encoder de profundidad en pipelines de investigacion y comparacion de estrategias de preentrenamiento.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de texto.
- No dispone de modo de razonamiento (thinking mode), vision multimodal, audio ni otras capacidades especiales.

## Casos de uso

- Reproduccion de experimentos academicos: permite reproducir la fila correspondiente a la inicializacion ImageNet supervisado en las tablas del Monocular-Depth-Estimation-Toolbox sobre NYUv2, usando el checkpoint original o el `model.safetensors` con el codigo oficial.
- Baseline en estudios de preentrenamiento: sirve como referencia frente a las variantes SimIPU (KITTI y Waymo) y frente al entrenamiento desde cero, para medir el impacto de la inicializacion del encoder en la calidad de la profundidad.
- Prototipado de profundidad en interiores: al estar afinado en NYUv2 (escenas de interior), es adecuado para experimentos de reconstruccion 3D, realidad aumentada o navegacion en entornos indoor con requisitos de computo moderados.
- Evaluacion comparativa de encoders CNN frente a transformers: su tamano de 77,8M parametros y su naturaleza convolucional lo hacen util como contrapunto ligero frente a modelos de profundidad basados en ViT.
- Docencia y formacion: modelo pequeno y bien documentado para explicar pipelines de estimacion de profundidad monocular y el efecto del preentrenamiento.
- Integracion en pipelines de investigacion con PyTorch: al distribuirse en `.pth` y `.safetensors`, se puede cargar con el codigo oficial o con `safetensors.torch.load_file` en el mismo modelo, facilitando su uso en entornos que evitan `pickle`.

## Benchmarks y rendimiento

Resultados reportados por los autores para esta variante (NYUv2, con flip):

| Metrica | Valor |
|---|---|
| Abs Rel (NYUv2, +flip) | 0.143 |

No se han publicado en la informacion disponible resultados adicionales (RMSE, delta1, etc.) ni comparaciones numericas con otros modelos en la model card del espejo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 77,8M parametros en FP32 (unos 311 MB de pesos), la inferencia cabe holgadamente en GPUs consumer; con lotes pequenos y resoluciones tipicas de NYUv2 el consumo se mantiene en el rango de pocos GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema (las GPU de gama alta aportan mayor throughput, no mayor viabilidad).
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1660, RTX 2060 en adelante).
- Opciones de despliegue: el modelo se carga con el codigo oficial del Monocular-Depth-Estimation-Toolbox o mediante PyTorch y `safetensors`. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimIPU R50 NYUv2 ImageNet (este) | 77,8M | Profundidad monocular (NYUv2) | Abs Rel 0.143 (+flip) | Apache-2.0 | Hugging Face (espejo no oficial) |
| SimIPU R50 NYUv2 (SimIPU KITTI) | no disponible | Profundidad monocular (NYUv2) | no disponible en la informacion | Apache-2.0 | Repositorio oficial del toolbox |
| SimIPU R50 NYUv2 (SimIPU Waymo) | no disponible | Profundidad monocular (NYUv2) | no disponible en la informacion | Apache-2.0 | Repositorio oficial del toolbox |
| ResNet-50 NYUv2 desde cero | no disponible | Profundidad monocular (NYUv2) | no disponible en la informacion | Apache-2.0 | Repositorio oficial del toolbox |

Las variantes SimIPU y el entrenamiento desde cero forman parte de la misma matriz experimental del toolbox; los datos numericos de cada una no se incluyen en la informacion proporcionada. No se dispone de comparaciones con modelos de profundidad de otras familias (por ejemplo, basados en ViT) en la informacion disponible.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos se redistribuyen sin cambios, pero el mantenimiento y el soporte dependen del autor original; el espejo puede desaparecer o quedar desactualizado.
- El modelo esta afinado en NYUv2, un dataset de escenas de interior; su generalizacion a exteriores, escenas nocturnas o dominios muy distintos no esta documentada.
- Al ser un modelo de vision, no procesa texto ni mantiene conversaciones; no debe evaluarse con criterios de modelos de lenguaje.
- Riesgo de alucinacion en el sentido de profundidades plausibles pero incorrectas en regiones ambiguas, oclusiones o superficies sin textura; no se documentan analisis de incertidumbre.
- No se documentan sesgos especificos ni evaluaciones de robustez en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero al tratarse de un espejo conviene verificar la procedencia y citar el trabajo original (SimIPU y el toolbox) segun indique el autor.
- No se documentan variantes cuantizadas ni soporte en runtimes de inferencia optimizados, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dronefreak/simipu-r50-nyuv2-imagenet
- Paper SimIPU (arXiv): https://arxiv.org/abs/2112.04680
- Codigo oficial (Monocular-Depth-Estimation-Toolbox): https://github.com/zhyever/Monocular-Depth-Estimation-Toolbox
- Dataset NYUv2 (espejo en el Hub): https://huggingface.co/datasets/dronefreak/NYUv2
