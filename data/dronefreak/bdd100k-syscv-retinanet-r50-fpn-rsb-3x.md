# dronefreak/bdd100k-syscv-retinanet-r50-fpn-rsb-3x

## Resumen

RetinaNet R50-FPN RSB 3x sobre BDD100K es un detector de objetos de una etapa pensado para escenas de conduccion. No es un modelo de lenguaje: es un checkpoint de vision por computador entrenado para localizar y clasificar las diez clases de trafico de BDD100K (peatones, ciclistas, coches, camiones, autobuses, trenes, motos, bicicletas, semaforos y senales de trafico). Lo publica el usuario `dronefreak` como espejo de un modelo del zoo oficial de SysCV (ETH Zurich), cuyo servidor de descargas `dl.cv.ethz.ch` esta caido; los pesos se recuperaron del archivo Wayback Machine.

El modelo combina una columna vertebral ResNet-50 inicializada con pesos ImageNet y entrenada con el procedimiento ResNet Strikes Back (RSB), un cuello FPN y una cabeza RetinaNet clasica. Trabaja a la resolucion nativa de BDD100K (1280x720) sin redimensionado y suma 36.569.662 parametros. El repositorio anade un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y un script de inferencia para imagen, carpeta, video o webcam.

Su relevancia es practica: permite reproducir un baseline de deteccion en conduccion autonoma sin depender de un host caido, con pesos verificados por MD5 y resultados declarados por SysCV. La licencia BDD100K restringe el uso a fines educativos, de investigacion y sin animo de lucro, lo que condiciona cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet de una etapa con backbone ResNet-50 (RSB) y cuello FPN |
| Parametros totales | 36.569.662 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BDD100K (educational, research and not-for-profit), segun `LICENSE.txt` |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; config en `config.json` |

## Arquitectura y entrenamiento

RetinaNet es un detector denso de una etapa: una columna vertebral ResNet-50 extrae caracteristicas multiescala, un FPN las combina en una piramide de niveles y una cabeza compartida predice clases y regresiones de cajas por ancla. El backbone se inicializa con los pesos ImageNet de `resnet50_8xb256-rsb-a1-600e_in1k` y se entrena con el procedimiento ResNet Strikes Back (paper arXiv:2110.00476, taller de NeurIPS 2021), que mejora el entrenamiento de ResNet con recetas de augmentacion y regularizacion mas agresivas.

El entrenamiento usa el split train de BDD100K (70k imagenes) durante 36 epocas (receta 3x), optimizador AdamW con lr 0.0001 y weight decay 0.05, decaimiento de lr en las epocas 24 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multiescala con 6 escalas entre (1280, 600) y (1280, 720). La entrada es RGB a 1280x720 con media y desviacion estandar de ImageNet. En test se aplica umbral de score 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen. No se documenta RLHF ni DPO (no aplica); la innovacion destacable es la receta RSB aplicada a deteccion y la conservacion de la resolucion nativa del dataset.

## Capacidades

- Deteccion de objetos en escenas de conduccion con diez clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Prediccion de cajas con scores de confianza (formato COCO-style box AP).
- Inferencia sobre imagen suelta, carpeta de imagenes, archivo de video o webcam (0 en `infer.py`).
- Exportacion de detecciones en formato BDD100K mediante `--json out.json`.
- Control de umbral de score (`--score-thr`, por defecto 0.3) y limite de frames (`--max-frames`).
- Ejecucion en CPU y en GPU CUDA 11.8 con el entorno fijado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente vision.

## Casos de uso

- Baseline de investigacion en deteccion para conduccion autonoma: sirve como referencia reproducible sobre BDD100K val/test con AP declarado por SysCV, util para comparar nuevos detectores bajo la misma receta y resolucion.
- Analisis de video de trafico: `infer.py drive.mov` procesa un video completo y genera detecciones por frame, adecuado para contar vehiculos o peatones en grabaciones de camara de salpicadero.
- Prototipado de sistemas ADAS: con 0.05 s/imagen en una RTX 4070 SUPER, permite iterar rapido sobre umbrales y NMS antes de pasar a un modelo mayor.
- Etiquetado asistido (pre-anotacion): las detecciones exportadas en formato BDD100K pueden precargarse en una herramienta de anotacion para revisar y corregir, reduciendo el coste manual.
- Demos y docencia: el script de inferencia con webcam (`infer.py 0 --show`) permite mostrar deteccion en vivo en un portatil con GPU consumer.
- Validacion de pipelines de vision: al estar fijado el entorno (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y verificado el MD5, sirve para comprobar que un pipeline de despliegue carga y ejecuta correctamente un modelo mmdetection 2.x.
- Investigacion sobre escenas nocturnas y diurnas: el autor incluye un banner de demo con dos clips de val (dia y noche), util para estudiar el comportamiento del detector en condiciones de iluminacion distintas.

## Benchmarks y rendimiento

Resultados declarados por SysCV (no verificados por el autor del espejo; `verified: false`). AP estilo COCO (%) sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 31.1 | 56.2 | 29.2 | 13.0 | 36.6 | 52.8 |
| test | 30.5 | 54.1 | 29.4 | 14.1 | 37.0 | 48.1 |

AP por clase en val:

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 33.5 | 25.3 | 50.2 | 43.7 | 46.9 | 0.2 | 23.9 | 25.0 | 24.5 | 38.1 |

Rendimiento de inferencia medido por el autor: 0.05 s/imagen en RTX 4070 SUPER y 1.1 s/imagen en 8 hilos de CPU. Verificacion: en 20 imagenes aleatorias de val, 1896 de 1968 cajas de las predicciones publicadas por SysCV son identicas en esta copia; 1898 coinciden con IoU >= 0.5 (esta copia produce 1966 cajas; diferencia maxima de score 0.0894). El MD5 de los pesos (`92b4ac1c1f56ee74030dd648eaf79437`) coincide con el de SysCV.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 36,5 M de parametros en precision completa y entrada 1280x720, el consumo es moderado (unos pocos GB), pero el autor no publica cifras.
- GPU recomendadas: RTX 4070 SUPER medida por el autor (0.05 s/imagen); cualquier GPU consumer con CUDA 11.8 deberia funcionar. Para produccion de alto throughput, A100 o H100 no estan medidas en la informacion disponible.
- Cabe en GPU consumer: si, segun la medicion en RTX 4070 SUPER.
- CPU: funciona con 8 hilos a 1.1 s/imagen.
- Despliegue: entorno fijado con `uv` y `requirements-cu118.txt` (GPU) o `requirements-cpu.txt` (CPU); inferencia via `infer.py` sobre mmdetection 2.28.2. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de vision).
- Latencia y throughput: 0.05 s/imagen en RTX 4070 SUPER; 1.1 s/imagen en CPU de 8 hilos.

## Comparativa con modelos similares

No se han publicado comparativas con otros detectores en la informacion disponible. Como referencia interna, el propio zoo de SysCV contiene otros detectores sobre BDD100K (por ejemplo, variantes de Faster R-CNN y YOLO), pero no se aportan sus cifras en esta ficha.

| Modelo | Parametros | Contexto | AP val (BDD100K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetinaNet R50-FPN RSB 3x (este) | 36.569.662 | no aplica | 31.1 | BDD100K (investigacion) | Hugging Face (espejo) |
| Otros detectores del zoo SysCV | no disponible | no aplica | no disponible | Apache-2.0 (config) | GitHub SysCV |
| Alternativas genericas | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia BDD100K: uso educativo, de investigacion y sin animo de lucro; el uso comercial no esta permitido sin autorizacion.
- Entrenado exclusivamente con BDD100K (escenas de conduccion); el rendimiento fuera de ese dominio (interiores, drones, CCTV no viaria) no esta garantizado.
- Clase `train` practicamente inutil: AP de 0.2 en val, fruto de su escasa representacion en el dataset.
- Objetos pequenos con AP bajo: APs de 13.0 en val, lo que limita la deteccion de senales y peatones lejanos.
- Riesgo de falsos positivos y negativos con umbrales bajos; el autor usa 0.05 en test y 0.3 por defecto en `infer.py`, conviene ajustar por escenario.
- Diferencia de verificacion no explicada: 72 de 1968 cajas no coinciden exactamente con las predicciones publicadas por SysCV; el autor desconoce la causa y no desaparece al ejecutar en GPU.
- Resultados de benchmarks declarados por SysCV y marcados como no verificados (`verified: false`).
- Sin soporte de texto, tool calling ni agentes; no debe confundirse con un modelo multimodal o de lenguaje.
- Entorno fijado a versiones antiguas (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2); requiere un venv limpio y puede entrar en conflicto con stacks modernos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-r50-fpn-rsb-3x
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-r50-fpn-rsb-3x/blob/main/LICENSE.txt
- Zoo de modelos BDD100K de SysCV: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/retinanet_r50_fpn_rsb_3x_det_bdd100k.py
- Paper ResNet Strikes Back: https://arxiv.org/abs/2110.00476
- Pesos ImageNet del backbone: https://download.openmmlab.com/mmclassification/v0/resnet/resnet50_8xb256-rsb-a1-600e_in1k_20211228-20e21305.pth
- Dataset BDD100K (espejo): https://huggingface.co/datasets/dronefreak/BDD100K
