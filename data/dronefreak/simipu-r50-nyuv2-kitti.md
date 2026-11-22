# dronefreak/simipu-r50-nyuv2-kitti

## Resumen

SimIPU R50 NYUv2 KITTI es un modelo de estimacion de profundidad monocular basado en una red ResNet-50 como encoder y una cabeza de profundidad del Monocular-Depth-Estimation-Toolbox. Lo desarrollan Zhenyu Li y colaboradores en el marco del paper SimIPU (AAAI 2022), y esta ficha concreta corresponde a un espejo no oficial publicado por el usuario dronefreak en Hugging Face que redistribuye los pesos originales sin modificarlos, anadiendo una copia en formato safetensors y un config.json.

El modelo resuelve la tarea de predecir un mapa de profundidad denso a partir de una unica imagen RGB. Su interes tecnico no esta en la tarea en si, sino en la estrategia de preentrenamiento: SimIPU propone un preentrenamiento auto-supervisado que combina imagenes 2D con nubes de puntos 3D para aprender representaciones con conciencia espacial, en lugar de partir de pesos supervisados de ImageNet. Estos pesos concretos corresponden a la variante preentrenada con SimIPU sobre KITTI y afinada posteriormente sobre NYUv2 durante 24 epocas.

Con 77,8 millones de parametros y un repositorio de 1,2 GB, es un modelo compacto orientado a investigacion y comparacion de estrategias de inicializacion de encoder. No es un modelo de lenguaje ni un modelo generativo multimodal: es un modelo puramente visual de regression densa, por lo que las secciones de contexto, idiomas y tool calling no aplican y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ResNet-50 (encoder) + cabeza de profundidad del Monocular-Depth-Estimation-Toolbox |
| Parametros totales | 77.823.809 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; al ser PyTorch/safetensors admite cuantizacion generica a FP16, INT8, etc., sin recetas publicadas) |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pth` original (`simipu_kitti_50e_nyu.pth`) y `model.safetensors` (copia bit-exacta de los tensores del state_dict, sin estado del optimizador) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional clasica: un encoder ResNet-50 seguido de una cabeza de prediccion de profundidad implementada en el Monocular-Depth-Estimation-Toolbox. El encoder se inicializa con pesos preentrenados mediante SimIPU sobre el dataset KITTI, un esquema auto-supervisado que alinea representaciones de imagenes 2D con informacion geometrica derivada de nubes de puntos 3D. Posteriormente, el conjunto encoder + cabeza se afina de forma supervisada sobre NYUv2 durante 24 epocas.

El paper original compara cuatro inicializaciones distintas del encoder (desde cero, ImageNet supervisado, SimIPU sobre KITTI y SimIPU sobre Waymo) manteniendo fija la cabeza y el protocolo de fine-tuning, de modo que las diferencias de rendimiento aislan el efecto del preentrenamiento. No se documentan en la informacion disponible detalles sobre el numero exacto de tokens o imagenes de entrenamiento, la composicion del dataset de preentrenamiento ni el uso de tecnicas de RLHF o DPO (no aplicables a esta tarea). La innovacion destacable es el propio esquema SimIPU de preentrenamiento espacial auto-supervisado, no la arquitectura, que es un ResNet-50 estandar.

## Capacidades

- Estimacion de profundidad monocular densa a partir de una imagen RGB: genera un mapa de profundidad por pixel.
- Transferencia de representaciones visuales con conciencia espacial gracias al preentrenamiento SimIPU con nubes de puntos 3D.
- Uso como encoder preentrenado para otras tareas visuales descendentes (deteccion, segmentacion, etc.), aunque no se documenta un rendimiento especifico en esas tareas.
- Inferencia sobre imagenes individuales en resolucion tipica de NYUv2 (interior) y potencialmente KITTI (exterior), segun el dominio de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.
- No dispone de modo thinking, vision-language, audio ni generacion de texto.

## Casos de uso

- Investigacion comparativa de preentrenamientos: sirve como punto de referencia para medir cuanto aporta SimIPU frente a ImageNet o entrenamiento desde cero en estimacion de profundidad, gracias a que el autor publica variantes con el mismo protocolo.
- Reconstruccion 3D de interiores: al estar afinado sobre NYUv2, es adecuado para generar mapas de profundidad en escenas de interior que alimenten pipelines de reconstruccion o realidad aumentada.
- Navegacion de robots en interiores: el mapa de profundidad por pixel puede usarse para evitacion de obstaculos en plataformas con recursos limitados, dado el bajo numero de parametros (77,8 M).
- Prototipado academico: base rapida para experimentos de estimacion de profundidad con PyTorch, al poder cargarse con `safetensors.torch.load_file` o con el checkpoint original del toolbox.
- Generacion de datos auxiliares para sintesis de imagenes: los mapas de profundidad pueden servir como condicionamiento en pipelines de difusion para ControlNet u otros modelos.
- Benchmarking de robustez: al existir variantes SimIPU-KITTI y SimIPU-Waymo, permite estudiar la transferencia entre dominios (interior frente a exterior).
- Extraccion de caracteristicas visuales: el encoder ResNet-50 preentrenado con SimIPU puede reutilizarse como backbone en otras tareas de vision.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los reportados por los autores para esta variante:

| Metrica | Valor |
|---|---|
| Abs Rel (NYUv2, con flip) | 0.178 |

No se han publicado en la informacion disponible resultados adicionales (RMSE, delta1, etc.) ni comparaciones numericas con las otras inicializaciones. Para las tablas completas hay que consultar el repositorio oficial del Monocular-Depth-Estimation-Toolbox.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para una imagen de resolucion tipica (77,8 M de parametros, aproximadamente 311 MB de pesos en FP32); en FP16 baja a unos 156 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3090, RTX 4090, A100 o H100 ofrecen margen de sobra, e incluso GPUs de gama baja o integradas pueden ejecutarlo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3050 o superiores.
- Opciones de despliegue: PyTorch nativo con el codigo oficial del toolbox; el checkpoint original `.pth` o el `model.safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un ResNet-50, se espera una latencia de decenas de milisegundos por imagen en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Abs Rel (NYUv2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimIPU R50 NYUv2 KITTI (este) | 77,8 M | no aplica | 0.178 (+flip) | Apache-2.0 | Hugging Face (espejo) |
| SimIPU R50 NYUv2 Waymo | no disponible | no aplica | no disponible en esta ficha | Apache-2.0 | Repositorio oficial del toolbox |
| ResNet-50 con inicializacion ImageNet | ~77,8 M | no aplica | no disponible en esta ficha | Apache-2.0 (toolbox) | Repositorio oficial del toolbox |
| ResNet-50 desde cero | ~77,8 M | no aplica | no disponible en esta ficha | Apache-2.0 (toolbox) | Repositorio oficial del toolbox |

Las variantes con inicializacion ImageNet y desde cero forman parte del mismo estudio comparativo del paper, pero sus valores numericos no se incluyen en la informacion disponible. No se dispone de comparaciones con otros modelos de profundidad monocular ampliamente conocidos (MiDaS, Depth Anything, etc.) dentro de los datos proporcionados.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son identicos a los originales, pero el mantenimiento y el soporte dependen de un tercero, no de los autores.
- Rendimiento limitado en terminos absolutos: un Abs Rel de 0.178 en NYUv2 esta lejos del estado del arte actual en profundidad monocular; esta pensado para comparar preentrenamientos, no para produccion de alta precision.
- Dominio restringido: afinado sobre NYUv2 (interiores); el rendimiento en escenas de exterior o dominios distintos puede degradarse notablemente.
- Riesgo de alucinacion geometrica: como todo modelo de profundidad, puede producir mapas plausibles pero incorrectos en regiones ambiguas, reflectantes o con oclusiones.
- Sesgos de dataset: NYUv2 y KITTI tienen sesgos de captura (camaras, iluminacion, geografia) que se trasladan al modelo.
- Sin procesamiento de lenguaje: no admite prompts textuales ni tool calling; cualquier integracion debe hacerse a nivel de pipeline de vision.
- Licencia Apache-2.0: permite uso comercial, pero conviene citar el trabajo original y verificar los terminos del repositorio oficial del toolbox.
- No se documentan cuantizaciones oficiales ni recetas de despliegue en produccion; el uso previsto es investigacion.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/simipu-r50-nyuv2-kitti
- Paper SimIPU (arXiv): https://arxiv.org/abs/2112.04680
- Repositorio oficial Monocular-Depth-Estimation-Toolbox: https://github.com/zhyever/Monocular-Depth-Estimation-Toolbox
- Dataset NYUv2 (espejo en el Hub): https://huggingface.co/datasets/dronefreak/NYUv2
