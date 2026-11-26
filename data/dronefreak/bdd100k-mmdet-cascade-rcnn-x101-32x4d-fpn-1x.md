# dronefreak/bdd100k-mmdet-cascade-rcnn-x101-32x4d-fpn-1x

## Resumen

Cascade R-CNN X101-32x4d-FPN 1x es un detector de objetos de dos etapas basado en Cascade R-CNN con backbone ResNeXt-101 32x4d y FPN, entrenado sobre el conjunto de datos BDD100K para deteccion en escenas de conduccion. Lo desarrolla el equipo de BDD100K (Berkeley DeepDrive) y esta publicado como baseline oficial de deteccion del ano 2020; el repositorio de Hugging Face es un espejo (mirror) mantenido por el usuario dronefreak que anade un entorno fijado y un script de inferencia para que el modelo siga siendo ejecutable hoy.

El modelo resuelve la deteccion de objetos en imagenes de trafico (vehiculos, peatones, senales de trafico, semaforos, ciclistas, etc.) en el espacio de 10 clases de BDD100K. Con 87.938.044 parametros, es un modelo de vision por computador clasico de tamano medio, no un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en el sentido de los LLM. Su relevancia actual es la de un baseline reproducible y verificado byte a byte contra las predicciones originales del equipo de BDD100K.

La ficha documenta un checkpoint antiguo (PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.3, mmdetection 2.4.0) que el espejo ha reempaquetado con un entorno moderno (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y un `infer.py` que carga los pesos con `torch.load(weights_only=True)`. Es util para quien necesite un detector de referencia en BDD100K sin tener que reconstruir un stack de 2020.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN (3 etapas) con backbone ResNeXt-101 32x4d + FPN |
| Parametros totales | 87.938.044 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada = imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision; sin capacidades linguisticas) |
| Licencia | bdd100k (license: other; license_name: bdd100k) |
| Formato de pesos | safetensors (repo de 1.2 GB; checkpoint original cargado con `torch.load`) |

## Arquitectura y entrenamiento

Cascade R-CNN es un detector de dos etapas que encadena tres cabezas de clasificacion y regresion con umbrales de IoU crecientes, de modo que cada etapa refina las propuestas de la anterior. El backbone es ResNeXt-101 con cardinalidad 32 y ancho 4d, inicializado desde los pesos ImageNet de OpenMMLab, y sobre el se aplica una FPN para la piramide de caracteristicas multi-escala.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 12 epocas (protocolo 1x), con SGD y learning rate 0.02, en GPUs TITAN Xp. El checkpoint registra el stack original: PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.3 y mmdetection 2.4.0. No se documentan en la informacion disponible detalles sobre composicion exacta del dataset, aumento de datos ni tecnicas de refinamiento posteriores (RLHF, DPO u otras no aplican a un detector). La innovacion practica del espejo es la reproducibilidad: el autor verifica que, sobre 20 imagenes de test elegidas al azar, la copia produce las mismas 629 cajas con puntuaciones identicas e IoU 1.0000 frente a las predicciones originales publicadas por los autores.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion sobre las clases de BDD100K.
- Deteccion sobre imagenes sueltas, carpetas de imagenes, ficheros de video y camara web (via `infer.py`).
- Salida de cajas en formato BDD100K (pixeles, `x1 y1 x2 y2`) mediante la opcion `--json`.
- Umbral de puntuacion configurable (`--score-thr`, por defecto 0.3) y limite de fotogramas para video (`--max-frames`).
- Carga segura de pesos con `torch.load(weights_only=True)`: el checkpoint solo contiene tensores y metadatos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision.

## Casos de uso

- Baseline de referencia en BDD100K: util para comparar nuevos detectores contra un resultado oficial conocido (mAP@50:95 de 32,0 en validacion) sin reconstruir el stack de 2020.
- Deteccion en imagenes sueltas de trafico: `python infer.py image.jpg --out runs/` procesa una imagen y guarda las detecciones, adecuado para pruebas rapidas de integracion.
- Procesado por lotes de carpetas de imagenes: `python infer.py images/ --out runs/` permite anotar un directorio completo, util para preetiquetar datasets o auditar conjuntos de validacion.
- Analisis de video de conduccion: `python infer.py drive.mov --out runs/` recorre un video fotograma a fotograma, aplicable a revision de grabaciones de dashcam.
- Captura en directo con camara web: `python infer.py 0 --show` usa el mismo bucle de captura que los videos (el autor advierte que esta ruta no se probo con una camara real), util para demos en vivo.
- Exportacion de detecciones a JSON en formato BDD100K: con `--json detections.json` se obtienen cajas en pixeles listas para pipelines de evaluacion o postprocesado.
- Verificacion de integridad de checkpoints: el hash SHA-256 documentado (`46de620bfd3c3451162d27c801f0d37628dff86b20c3b7bf2e5303ceb34ca46d`) permite validar copias en entornos de investigacion.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), sobre el split de validacion de BDD100K:

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 32,0 |
| mAP@50 (val) | 56,6 |
| mAP@75 (val) | 30,9 |

No se han publicado en la informacion disponible resultados adicionales (por clase, por franja horaria o por condicion meteorologica) ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada; con 87,9 M de parametros y pesos en precision completa, el modelo es ligero y cabe holgadamente en GPUs de consumo, pero no se documenta una cifra concreta.
- GPU recomendadas: no se documentan; el entrenamiento original uso TITAN Xp.
- Cabe en GPU de consumo: si, por el tamano del modelo, aunque la informacion no detalla modelos concretos.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre Python 3.10 y torch 2.0.1 (build CUDA 11.8 o CPU); el repo incluye `env/requirements-cu118.txt` y `env/requirements-cpu.txt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El autor indica que solo el entorno de CPU esta verificado; el entorno CUDA 11.8 aun no se ha ejecutado.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros detectores comparables (parametros, contexto, rendimiento, licencia y disponibilidad) para establecer una comparativa rigurosa. Se indica, por tanto, como no disponible.

## Limitaciones y advertencias

- Modelo de vision sin capacidades de lenguaje: no procesa texto, no responde preguntas y no soporta agentes ni tool calling.
- Entrenado exclusivamente sobre BDD100K: su dominio es escenas de conduccion; el rendimiento fuera de ese dominio no esta documentado.
- Resultados de benchmarks declarados por el autor y marcados como no verificados; no hay validacion independiente en la informacion disponible.
- Stack antiguo: requiere mmdetection 2.x (la 3.x cambia formato de configuracion y codigo del modelo); el entorno fijado degrada paquetes si se instala sobre uno existente, por lo que debe usarse un entorno limpio.
- Solo el entorno de CPU esta verificado; el entorno CUDA 11.8 no se ha ejecutado aun.
- La ruta de camara web no se probo con una camara real.
- Licencia BDD100K (license: other): es necesario revisar los terminos del fichero LICENSE.txt del repositorio antes de cualquier uso comercial; no se detallan restricciones concretas en la informacion disponible.
- Riesgo de alucinacion no aplica en el sentido de los LLM, pero si existe riesgo de falsos positivos y negativos en la deteccion, especialmente con umbrales de puntuacion bajos.
- El espejo no documenta sesgos demograficos, geograficos ni de condiciones de iluminacion mas alla de la validacion cualitativa con clips de dia y de noche.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-cascade-rcnn-x101-32x4d-fpn-1x
- Licencia (LICENSE.txt del repositorio): https://huggingface.co/dronefreak/bdd100k-mmdet-cascade-rcnn-x101-32x4d-fpn-1x/blob/main/LICENSE.txt
- Dataset en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Demo (poster): https://huggingface.co/dronefreak/bdd100k-mmdet-cascade-rcnn-x101-32x4d-fpn-1x/resolve/main/assets/demo_banner_poster.jpg
- Demo (video): https://huggingface.co/dronefreak/bdd100k-mmdet-cascade-rcnn-x101-32x4d-fpn-1x/resolve/main/assets/demo_banner.mp4
