# dronefreak/bdd100k-detectron2-retinanet-r101-fpn-1x

## Resumen

RetinaNet R101-FPN 1x sobre BDD100K es un detector de objetos de una sola etapa pensado para escenas de conduccion. Lo publico originalmente el equipo de BDD100K (Berkeley DeepDrive) en 2020 como baseline oficial de deteccion sobre su conjunto de datos, y esta ficha corresponde a un espejo mantenido por el usuario `dronefreak` que anade un entorno fijado y un script de inferencia para que el checkpoint siga siendo ejecutable hoy. El modelo usa una ResNet-101 con FPN como backbone y la cabeza RetinaNet clasica, con 55,4 millones de parametros y un unico tamano de entrada de inferencia (800 pixeles, el que mejor reproduce los resultados publicados).

El interes practico del modelo es doble. Por un lado, sirve como referencia historica de deteccion en escenas de trafico: mAP@50:95 de 29,8 y mAP@50 de 54,4 sobre el split de validacion de BDD100K. Por otro, el espejo resuelve un problema muy concreto de reproducibilidad: el checkpoint original no guardaba configuracion, nombres de clase ni versiones de software, y las wheels precompiladas de detectron2 0.6 solo existen para torch 1.10 y Python 3.9. El repositorio empaqueta esa pila exacta (torch 1.10.1, torchvision 0.11.2, detectron2 0.6, numpy 1.26.4, Pillow 9.5.0) y expone los pesos en `model.safetensors`, de modo que la carga no ejecuta codigo arbitrario.

No es un modelo de lenguaje ni un modelo fundacional: es un detector convolucional de 2020, sin capacidades generativas, sin tool calling y sin soporte multilingue en el sentido habitual. Su utilidad esta en pipelines de vision para conduccion autonoma, etiquetado automatico y evaluacion de baselines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet (detector de una etapa) con backbone ResNet-101 y cuello FPN |
| Parametros totales | 55.614.200 (55,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, tamano de test 800 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en el espejo; checkpoint original en `.pth`) |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`) |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` original sin modificar |

## Arquitectura y entrenamiento

RetinaNet es un detector denso de una sola etapa que combina un backbone convolucional con una red piramidal de caracteristicas (FPN) y dos subredes acopladas para clasificacion y regresion de cajas. En esta variante el backbone es ResNet-101, el esquema de entrenamiento es el "1x" estandar de detectron2 (unas 12 epochs sobre el conjunto de entrenamiento) y el tamano de test es 800 pixeles, valor que el autor del espejo identifico como el que mejor reproduce las predicciones publicadas frente a tamanos entre 600 y 1024. La perdida es la focal loss caracteristica de RetinaNet, que mitiga el desbalance extremo entre anclas positivas y negativas.

El entrenamiento se realizo sobre BDD100K, un conjunto de imagenes de conduccion con anotaciones de cajas para clases de trafico (vehiculos, peatones, senales, semaforos, etc.). No se dispone de informacion sobre el numero exacto de tokens o imagenes de entrenamiento, la composicion del dataset ni si hubo etapas de refinamiento posteriores; la model card no lo documenta y el checkpoint original tampoco lo almacena. La innovacion tecnica relevante de este espejo no esta en el modelo sino en el empaquetado: entorno reproducible con versiones fijadas, pesos en formato seguro y un script `infer.py` que acepta imagen suelta, carpeta, video o webcam, y que puede exportar detecciones en formato BDD100K (`--json`).

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion (vehiculos, peatones, senales de trafico, semaforos y clases equivalentes del dataset BDD100K).
- Inferencia sobre imagen individual, lotes de imagenes, archivos de video y flujo de webcam.
- Exportacion de cajas en formato BDD100K en pixeles (`x1 y1 x2 y2`) mediante `--json`.
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de frames en video (`--max-frames`).
- Ejecucion en CPU y en GPU (builds separados de requisitos: `requirements-cpu.txt` y `requirements-cu113.txt`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision multimodal conversacional, audio ni modo "thinking".
- No dispone de capacidades multilingues: la salida son etiquetas de clase y coordenadas.

## Casos de uso

- Etiquetado automatico de datasets de conduccion: el modelo puede pre-anotar cajas sobre imagenes nuevas de trafico y reducir el trabajo manual de revisión, aprovechando que ya esta entrenado sobre las clases de BDD100K y que exporta directamente en ese formato con `--json`.
- Baseline de evaluacion para nuevos detectores: sirve como referencia fija (mAP@50:95 de 29,8 en validacion) contra la que comparar arquitecturas modernas en el mismo split, con la ventaja de que el entorno esta fijado y los resultados son reproducibles.
- Analisis de video de trafico: `infer.py` acepta un archivo de video y procesa frame a frame, lo que permite contar vehiculos o peatones en grabaciones de camaras de vigilancia o dashcams sin escribir codigo adicional.
- Prototipado rapido en CPU: al incluir un entorno CPU con todas las dependencias fijadas, se puede desplegar en una maquina sin GPU para demos, pruebas de concepto o validacion de pipelines antes de escalar a hardware dedicado.
- Investigacion en vision para conduccion autonoma: util como punto de partida para estudiar el efecto del backbone, del FPN o del tamano de entrada sobre el rendimiento en escenas nocturnas y diurnas, ya que la model card incluye clips de validacion de dia y de noche.
- Deteccion en tiempo real desde webcam: el modo `python infer.py 0 --show` permite visualizar detecciones en directo, util para pruebas de integracion en sistemas embebidos o estaciones de trabajo con GPU consumer.
- Auditoria de reproducibilidad: el espejo documenta la discrepancia entre sus predicciones y las del equipo original (1996 cajas frente a 1992 en 20 imagenes de test, con IoU mediana de 0,9889 en los emparejamientos), lo que lo convierte en un caso de estudio sobre deriva numerica entre entornos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card, sobre el split de validacion de BDD100K. No estan verificados de forma independiente (`verified: false`).

| Metrica | Valor | Split |
|---|---|---|
| mAP@50:95 | 29,8 | validation |
| mAP@50 | 54,4 | validation |
| mAP@75 | 27,9 | validation |

No se han publicado en la informacion disponible resultados comparativos con otros detectores sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 55,4 M de parametros y entrada de 800 px, el checkpoint cabe holgadamente en GPUs consumer, pero la model card no publica cifras de memoria.
- GPU recomendadas: no disponible. El entorno fijado usa CUDA 11.3 (build `requirements-cu113.txt`), compatible con tarjetas NVIDIA de esa generacion en adelante; tambien hay build CPU.
- GPU consumer: si, cabe en tarjetas consumer actuales por el reducido numero de parametros, aunque no se especifica el modelo minimo.
- Opciones de despliegue: detectron2 0.6 sobre torch 1.10.1 con Python 3.9 (unica pila soportada oficialmente por el espejo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Cualitativamente, este checkpoint se distingue por ser un baseline oficial de BDD100K con espejo reproducible; otras alternativas habituales de la misma categoria (por ejemplo, variantes de Faster R-CNN o YOLO entrenadas sobre BDD100K) no aparecen documentadas en la informacion disponible y no se comparan aqui.

| Modelo | Parametros | Contexto | mAP@50:95 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetinaNet R101-FPN 1x (este) | 55,4 M | no aplica | 29,8 | BDD100K | Hugging Face (espejo) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de 2020: no incorpora mejoras posteriores en deteccion (attention, transformers, aumentos de datos modernos) y su mAP es bajo frente a detectores actuales.
- Reproduccion no exacta: el propio autor documenta que su copia no reproduce bit a bit las predicciones originales (0 cajas identicas con IoU >= 0,9999 en la muestra comprobada), con causa desconocida; la diferencia maxima de score observada es de 0,2559.
- Nombres de clase: la exportacion original del equipo de BDD100K usaba el orden de mmdetection, que etiqueta senales como "train" y camiones como "bus"; `infer.py` corrige esto y escribe los nombres del modelo, pero hay que tenerlo en cuenta al comparar con ficheros `original/*-results.json`.
- Dependencias antiguas y fragiles: detectron2 0.6 falla al importar con Pillow 10 o superior, y torch 1.10 requiere numpy 1.x y setuptools anterior a 70. Instalar en un entorno existente degradara paquetes.
- Licencia BDD100K: no es una licencia de codigo abierto generica; el uso comercial esta sujeto a los terminos del dataset BDD100K, que deben revisarse antes de produccion.
- Sesgos: al estar entrenado solo con imagenes de conduccion de BDD100K, el modelo no generaliza bien fuera de ese dominio (escenas urbanas y de carretera, condiciones de iluminacion del dataset).
- Riesgo de falsos positivos y negativos en condiciones adversas (noche, lluvia, oclusiones), no cuantificado en la informacion disponible.
- Sin soporte documentado para cuantizacion ni para formatos de despliegue ligeros; el unico camino soportado es la pila detectron2 fijada.
- Privacidad: la model card indica que los clips de demostracion se revisaron frame a frame para evitar matriculas legibles y rostros identificables, pero el modelo en si no incorpora anonimizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-detectron2-retinanet-r101-fpn-1x
- Licencia (LICENSE.txt del repo): https://huggingface.co/dronefreak/bdd100k-detectron2-retinanet-r101-fpn-1x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Video de demostracion: https://huggingface.co/dronefreak/bdd100k-detectron2-retinanet-r101-fpn-1x/resolve/main/assets/demo_banner.mp4
- Poster del video: https://huggingface.co/dronefreak/bdd100k-detectron2-retinanet-r101-fpn-1x/resolve/main/assets/demo_banner_poster.jpg
- Paper de RetinaNet (Focal Loss for Dense Object Detection): no disponible en la informacion proporcionada
- Repositorio de detectron2: no disponible en la informacion proporcionada
- Sitio oficial de BDD100K: no disponible en la informacion proporcionada
