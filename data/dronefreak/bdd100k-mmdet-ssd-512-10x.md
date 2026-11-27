# dronefreak/bdd100k-mmdet-ssd-512-10x

## Resumen

SSD512 entrenado sobre BDD100K es un detector de objetos de una etapa publicado originalmente en 2020 por el equipo de BDD100K (Berkeley DeepDrive) como baseline oficial para deteccion en escenas de conduccion. Este repositorio, mantenido por el usuario `dronefreak`, es un espejo del checkpoint original con un entorno de dependencias fijado y un script de inferencia propio, pensado para que el modelo siga siendo ejecutable hoy pese a depender de la rama 2.x de mmdetection, ya descatalogada.

El modelo emplea la arquitectura SSD (Single Shot MultiBox Detector) con backbone VGG, en su variante de entrada 512x512, y cuenta con 36.038.196 parametros totales. Resuelve la tarea de deteccion de objetos en imagenes y video de escenas de trafico (vehiculos, peatones, senalizacion y semaforos, entre otras clases del dataset BDD100K), y su relevancia actual es fundamentalmente practica: sirve como referencia reproducible y como punto de partida ligero para pipelines de vision en conduccion autonoma que necesiten un detector clasico con pesos verificables.

No es un modelo generativo ni un transformer: es una CNN de deteccion de una etapa, sin capacidades de texto, razonamiento ni tool calling. Su interes esta en la trazabilidad (hash SHA-256 verificado, comparacion contra las predicciones originales de los autores) y en la documentacion que acompania a un checkpoint que se distribuyo sin ella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSD (Single Shot MultiBox Detector) con backbone VGG, entrada 512x512 |
| Parametros totales | 36.038.196 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en coma flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | BDD100K (licencia propia, `license: other`; ver enlace a LICENSE.txt) |
| Formato de pesos | `.pth` (checkpoint PyTorch nativo de mmdetection); el repo tambien incluye safetensors segun los tags de Hugging Face |

## Arquitectura y entrenamiento

SSD es un detector de una etapa que predice cajas y clases directamente desde mapas de caracteristicas de varias escalas, sin etapa de propuesta de regiones. En esta variante el backbone es VGG y la entrada es de 512x512 pixeles, lo que permite detectar objetos de menor tamano que la variante SSD300. En mmdetection 2.14 el diseno de SSD se reorganizo: las capas extra y la normalizacion L2 se movieron del backbone a un `SSDNeck` separado y las convoluciones de la cabeza se envolvieron en un modulo propio. El `config.py` del repositorio usa ese layout nuevo con las mismas capas, y `infer.py` renombra los pesos del checkpoint al cargarlos aplicando el mismo mapeo que `tools/model_converters/upgrade_ssd_version.py` de mmdetection; el archivo `.pth` original no se modifica.

El entrenamiento original se realizo con PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.3 y mmdetection 2.4.0 sobre GPUs Tesla P100-PCIE-16GB, datos que quedaron registrados en el propio checkpoint. No se documenta en la informacion disponible el numero de tokens (no aplica), la composicion exacta del dataset ni si hubo etapas de refinamiento posteriores; se sabe que se entreno sobre BDD100K, el benchmark de escenas de conduccion de Berkeley DeepDrive. La innovacion destacable de este repositorio no es arquitectonica sino de reproducibilidad: entorno fijado (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2, numpy 1.26.4, opencv-python 4.10.0.84, setuptools 69.5.1, yapf 0.40.1), carga segura con `torch.load(weights_only=True)` y verificacion de integridad por SHA-256 (`91845fef19399ccec2521839cbf95e0ec33ad2fcd5205c4d970d331fa10b8fec`).

## Capacidades

- Deteccion de objetos en imagenes sueltas, carpetas de imagenes, archivos de video y camara web (via `infer.py`).
- Deteccion de las clases de BDD100K en escenas de conduccion (vehiculos, peatones, senalizacion, semaforos, etc., segun el etiquetado del dataset).
- Salida de cajas en formato BDD100K (pixeles, `x1 y1 x2 y2`) mediante `--json detections.json`.
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de frames procesados en video (`--max-frames N`).
- Ejecucion en CPU y en GPU (entorno CUDA 11.8 o build CPU); el camino de GPU no estaba verificado en el momento de publicar la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento: es exclusivamente un detector visual.

## Casos de uso

- Deteccion de vehiculos y peatones en video de trafico: el modelo procesa archivos de video frame a frame con `infer.py drive.mov --out runs/`, lo que permite generar trazas de deteccion para analisis offline de escenas diurnas y nocturnas (la demo del autor cubre ambos casos).
- Baseline reproducible para investigacion en deteccion: al estar fijado el entorno y verificado el hash, sirve como referencia estable contra la que comparar detectores mas modernos sobre el split de validacion de BDD100K, sin el riesgo de que una actualizacion de mmdetection rompa la reproduccion.
- Etiquetado asistido y pre-anotacion: las detecciones exportadas en formato BDD100K (`--json`) pueden precargarse en herramientas de anotacion para que un humano las corrija, reduciendo el coste de crear nuevos conjuntos de datos de conduccion.
- Prototipado rapido en sistemas embebidos o de bajo consumo: con 36 millones de parametros y una arquitectura de una etapa, es viable ejecutarlo en CPU para pruebas de concepto antes de invertir en un detector mas pesado.
- Monitorizacion de camaras en directo: el modo webcam (`python infer.py 0 --show`) permite validar en tiempo real el comportamiento del detector sobre el flujo de una camara antes de desplegarlo en un pipeline de produccion.
- Docencia y formacion en vision por computador: el repositorio documenta el proceso completo de recuperar un checkpoint antiguo, migrar el layout de SSD entre versiones de mmdetection y verificar la equivalencia de predicciones, lo que lo convierte en un caso practico de ingenieria de reproducibilidad.
- Auditoria de modelos heredados: la comparacion contra las predicciones originales de los autores (4000 cajas frente a 4000, con IoU minimo 0.7249 y mediana 1.0000) permite validar que una copia restaurada se comporta como el original antes de reutilizarla en un sistema existente.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), sobre el split de validacion de BDD100K:

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 22.8 |
| mAP@50 (val) | 45.5 |
| mAP@75 (val) | 19.7 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (por ejemplo, por clase o sobre el split de test) ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 36 millones de parametros y entrada 512x512, el checkpoint es ligero y cabe holgadamente en cualquier GPU consumer moderna, aunque el repositorio no publica una cifra de VRAM.
- GPU de entrenamiento original: Tesla P100-PCIE-16GB (segun el propio checkpoint).
- GPU recomendadas: no se especifican; el entorno CUDA 11.8 esta pensado para GPUs NVIDIA actuales, pero el autor indica que esa ruta no se ha probado todavia.
- Cabe en GPU consumer: si, por tamano de modelo (36M de parametros); no se documenta una lista de modelos concretos.
- Despliegue: `infer.py` incluido en el repositorio, con entornos `env/requirements-cu118.txt` (GPU) y `env/requirements-cpu.txt` (CPU). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La unica referencia de rendimiento es funcional: la verificacion en CPU reproduce 4000 cajas sobre 20 imagenes de test con diferencias de score de hasta 0.0000.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre otros detectores comparables (por ejemplo, variantes de SSD, YOLO o Faster R-CNN sobre BDD100K) que permitan una comparacion con cifras verificables. La unica referencia interna es la comparacion del propio repositorio contra las predicciones originales de los autores del checkpoint, que confirma equivalencia practica pero no constituye una comparativa entre modelos.

| Modelo | Parametros | Contexto | mAP@50:95 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SSD512 BDD100K (este) | 36.038.196 | no aplica | 22.8 | BDD100K | Hugging Face (espejo) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de vision exclusivamente: no procesa texto, no razona y no admite instrucciones en lenguaje natural; cualquier uso como "modelo de IA" generico es un error de categoria.
- Licencia BDD100K con terminos propios (`license: other`): es imprescindible revisar `LICENSE.txt` antes de cualquier uso comercial, ya que las condiciones no son las de una licencia open source estandar.
- Entorno fragil: depende de mmdetection 2.x y de versiones antiguas de setuptools y yapf; los pines degradan paquetes en entornos existentes y requieren un entorno limpio.
- La ruta GPU (CUDA 11.8) no estaba verificada en el momento de publicacion; solo la ruta CPU estaba probada.
- El modo webcam comparte el bucle de captura con el modo video, pero no se probo con una camara real.
- Riesgo de falsos negativos y positivos inherente a un detector de una etapa con mAP@50:95 de 22.8: el rendimiento en objetos pequenos, oclusiones o condiciones de baja luminosidad puede degradarse; la demo nocturna no aporta metricas cuantitativas.
- No se documentan sesgos por clase ni evaluaciones de equidad; el dataset BDD100K tiene una distribucion geografica y de condiciones climaticas concreta que condiciona la generalizacion.
- Reproduccion "cercana pero no exacta": las predicciones coinciden con las de los autores con IoU minimo 0.7249, no de forma bit a bit.
- Sin mantenimiento declarado ni comunidad (0 descargas, 0 likes en el momento de la consulta): no cabe esperar soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-ssd-512-10x
- Licencia: https://huggingface.co/dronefreak/bdd100k-mmdet-ssd-512-10x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Demo (video): https://huggingface.co/dronefreak/bdd100k-mmdet-ssd-512-10x/resolve/main/assets/demo_banner.mp4
- Poster de la demo: https://huggingface.co/dronefreak/bdd100k-mmdet-ssd-512-10x/resolve/main/assets/demo_banner_poster.jpg
