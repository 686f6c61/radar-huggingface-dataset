# dronefreak/bdd100k-syscv-atss-r50-fpn-dyhead-1x

## Resumen

El modelo `dronefreak/bdd100k-syscv-atss-r50-fpn-dyhead-1x` es un detector de objetos para escenas de conduccion entrenado sobre el conjunto de datos BDD100K. Se trata de un espejo (mirror) de un checkpoint del zoo de modelos de SysCV (ETH Zurich), recuperado desde la Wayback Machine porque el host original `dl.cv.ethz.ch` esta fuera de servicio. El repositorio anade un entorno de dependencias fijado y un script de inferencia que permite ejecutar el modelo sobre imagenes, video o webcam.

Tecnicamente combina el detector ATSS con un backbone ResNet-50, un cuello FPN y una cabeza de deteccion DyHead (Dynamic Head, CVPR 2021). El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 12 epocas (esquema 1x) con entrada nativa de 1280x720 sin redimensionado. El checkpoint tiene 38.963.447 parametros y ocupa aproximadamente 1 GB en el repositorio.

Su relevancia es practica: al ser un mirror verificado (MD5 coincidente con el original y reproduccion exacta de las predicciones publicadas), restaura la disponibilidad de un baseline de referencia para investigacion en deteccion en escenas de conduccion. No es un modelo generativo ni un LLM, sino un detector de cajas delimitadoras con licencia restringida a uso educativo, de investigacion y sin animo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ATSS con backbone ResNet-50, cuello FPN y cabeza DyHead (Dynamic Head) |
| Parametros totales | 38.963.447 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280x720) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | bdd100k (uso educativo, investigacion y sin animo de lucro) |
| Formato de pesos | safetensors (tambien `.pth` original en `original/`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de deteccion de dos etapas con backbone convolucional: ResNet-50 inicializado con pesos de ImageNet (`torchvision://resnet50`), Feature Pyramid Network como cuello y una cabeza DyHead que unifica las dimensiones de escala, espacio y tarea mediante mecanismos de atencion. La asignacion de anclas y la funcion de perdida corresponden al detector ATSS. La entrada es la resolucion nativa de BDD100K (1280x720) en RGB con media y desviacion estandar de ImageNet, sin redimensionado.

El entrenamiento empleo el split de entrenamiento de BDD100K (70.000 imagenes) durante 12 epocas con SGD (learning rate 0.02, weight decay 0.0001), decaimiento de la tasa en las epocas 8 y 11, y batch de 32 (8 GPU x 4 imagenes). En inferencia se aplica un umbral de puntuacion de 0.05, NMS con IoU 0.6 y un maximo de 100 cajas por imagen. La verificacion del mirror confirma MD5 identico al original y reproduccion exacta de las predicciones de validacion publicadas por SysCV (mismas 1974 cajas y puntuaciones en 20 imagenes aleatorias, con la salvedad de que la exportacion original resta 1 px a `x2` e `y2`).

## Capacidades

- Deteccion de objetos en escenas de conduccion: cajas delimitadoras con clase y puntuacion de confianza sobre imagenes de carretera.
- Inferencia sobre imagen individual, carpeta de imagenes, archivo de video o webcam (opciones del script `infer.py`).
- Exportacion de resultados en formato BDD100K mediante la opcion `--json`.
- Control del umbral de puntuacion (`--score-thr`, por defecto 0.3) y del numero maximo de fotogramas procesados (`--max-frames`).
- Ejecucion en CPU (5,1 s/imagen con 8 hilos) y en GPU mediante el entorno CUDA 11.8.
- Compatibilidad con la pila mmdetection 2.x (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2, Python 3.10).
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento.

## Casos de uso

- Baseline de investigacion en deteccion para BDD100K: sirve como referencia reproducible (AP de validacion 32,8) para comparar nuevos detectores sobre el mismo split y configuracion.
- Reproduccion de experimentos academicos: al coincidir MD5 y predicciones con el original de SysCV, permite reejecutar pipelines que dependian del host caido sin alterar resultados.
- Prototipado de sistemas ADAS: deteccion de vehiculos, peatones y senalizacion en fotogramas de camara frontal para validar heuristicas de percepcion antes de integrar modelos mas pesados.
- Analisis de video de trafico: procesamiento por lotes de grabaciones con el script de inferencia y exportacion JSON en formato BDD100K para analitica posterior.
- Evaluacion comparativa dia/noche: el modelo fue validado sobre clips diurnos y nocturnos de BDD100K, lo que permite estudiar la degradacion de la deteccion en condiciones de baja iluminacion.
- Docencia en vision por computador: ejemplo completo de pipeline mmdetection con entorno fijado, ideal para practicas de deteccion y evaluacion con AP estilo COCO.
- Verificacion de integridad de checkpoints: el repositorio documenta el proceso de recuperacion desde la Wayback Machine y la comprobacion MD5, util como caso de estudio en gestion de artefactos de modelos.

## Benchmarks y rendimiento

Resultados declarados por SysCV (AP estilo COCO en BDD100K):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 32,8 | no disponible | no disponible | no disponible | no disponible | no disponible |
| test | 31,6 | 54,2 | 31,2 | 14,8 | 38,4 | 49,8 |

El valor de validacion (32,84) figura en la model card como no verificado; el desglose completo solo esta publicado para el split de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del modelo (38,9 M de parametros) y la resolucion de entrada (1280x720), es previsible que quepa en GPU de consumo, aunque no se aporta una cifra medida.
- GPU recomendadas: no disponibles; el autor indica que el entorno CUDA no ha sido probado todavia.
- Cabe en GPU de consumo: probablemente si, pero no confirmado en la documentacion.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2, torch 2.0.1 y Python 3.10 (entornos `env/requirements-cu118.txt` o `env/requirements-cpu.txt`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: 5,1 s/imagen en CPU con 8 hilos. Throughput y latencia en GPU no disponibles.
- Carga de pesos con `torch.load(weights_only=True)`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | AP (BDD100K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATSS R50-FPN DyHead 1x (este) | 38,9 M | 1280x720 | 32,8 val / 31,6 test | bdd100k (uso educativo/investigacion) | Hugging Face (mirror verificado) |
| Otros modelos del zoo SysCV BDD100K | no disponible | no disponible | no disponible | no disponible | host original caido |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros detectores comparables en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia BDD100K: uso limitado a fines educativos, de investigacion y sin animo de lucro; el uso comercial no esta permitido sin autorizacion adicional.
- Modelo de vision especializado en escenas de conduccion; no es un modelo de lenguaje ni soporta tareas de texto.
- El AP de validacion (32,84) esta marcado como no verificado en la model card; el desglose por metricas solo existe para test.
- El entorno CUDA no ha sido probado por el autor; la validacion se realizo en CPU.
- Riesgo de falsos negativos y positivos inherente a un AP moderado (31,6 en test), especialmente en objetos pequenos (APs de 14,8).
- Dependencia de la resolucion nativa 1280x720 y de la configuracion exacta de SysCV; cambios en el pipeline de preprocesado pueden alterar los resultados.
- El autor indica que las detecciones del video de demostracion fueron revisadas fotograma a fotograma para evitar matriculas legibles y rostros identificables; en produccion debe aplicarse un control equivalente por privacidad.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre BDD100K, hereda la distribucion geografica y de condiciones de dicho conjunto.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de detecciones espurias con puntuaciones bajas; se recomienda ajustar `--score-thr`.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-atss-r50-fpn-dyhead-1x
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/atss_r50_fpn_dyhead_1x_det_bdd100k.py
- Paper DyHead (CVPR 2021): https://arxiv.org/abs/2106.08322
- Paper BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-atss-r50-fpn-dyhead-1x/blob/main/LICENSE.txt
- Dataset en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
