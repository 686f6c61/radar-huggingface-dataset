# dronefreak/bdd100k-mmdet-cornernet-hourglass104-210e

## Resumen

CornerNet con backbone Hourglass-104 es un detector de objetos basado en keypoints de esquina (corner pooling), entrenado sobre el conjunto de datos BDD100K para conduccion autonoma. Este repositorio concreto es un espejo (mirror) de los pesos oficiales publicados por el equipo de BDD100K en 2020 en el servidor de descargas de Berkeley, que se distribuian sin documentacion alguna. El autor del espejo (dronefreak) anade una model card detallada, un entorno de dependencias fijado y un script de inferencia para que el checkpoint siga siendo ejecutable con stacks modernos.

El modelo resuelve la deteccion de objetos en escenas de conduccion (vehiculos, peatones, senales de trafico, semaforos) sobre imagenes de dashcam en condiciones de dia y noche. Es relevante ahora como referencia historica reproducible: la pila original (PyTorch 1.6.0, CUDA 10.2, mmdetection 2.5.0) ya no funciona en GPUs actuales, y este espejo documenta como llevarla a PyTorch 2.0.1 y mmdetection 2.28.2 sin perder fidelidad numerica.

Con 201,1 millones de parametros y un tamano de repositorio de 3,7 GB, se trata de un detector de una sola etapa basado en esquinas, no de un modelo generativo: no procesa lenguaje ni tiene ventana de contexto. Su interes es practico para quien necesite reproducir baselines de deteccion en BDD100K o comparar arquitecturas de deteccion clasicas frente a detectores modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CornerNet con backbone Hourglass-104 y corner pooling |
| Parametros totales | 201.088.948 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors de precision completa) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | BDD100K (license: other, license_name: bdd100k) |
| Formato de pesos | safetensors (repo de 3,7 GB) |
| Framework | mmdetection 2.x (probado con 2.28.2) |
| Tarea | object-detection |
| Dataset de entrenamiento | dronefreak/BDD100K |
| Entorno verificado | Python 3.10, torch 2.0.1, torchvision 0.15.2, mmcv-full 1.7.2, mmdetection 2.28.2, CUDA 11.8 o CPU |
| Entorno original de entrenamiento | PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.5, mmdetection 2.5.0, Tesla P100-PCIE-16GB |
| SHA-256 del checkpoint | 9e7e535026cce1b950f9d6d8f2371adf0e8f044db50574efb53c6b0e40a80c8a |

## Arquitectura y entrenamiento

CornerNet detecta objetos prediciendo las esquinas superior-izquierda e inferior-derecha de la caja delimitadora como keypoints en un mapa de calor, en lugar de regresar directamente las coordenadas de la caja. El backbone Hourglass-104 es una red apilada de modulos hourglass que combina resoluciones para capturar contexto global y local, y el corner pooling agrega informacion direccional en las esquinas para mejorar la localizacion. El modelo se entreno con el stack original de mmdetection 2.5.0 sobre GPUs Tesla P100-PCIE-16GB, segun los metadatos registrados en el propio checkpoint.

No se dispone de informacion sobre el numero de tokens (no aplica), la composicion exacta del dataset de entrenamiento ni si hubo tecnicas de refinamiento posteriores; la model card del espejo no documenta hiperparametros de entrenamiento ni aumentos de datos. La innovacion tecnica destacable de esta publicacion no esta en el modelo en si, sino en el trabajo de ingenieria del espejo: fijar un entorno que reproduce el comportamiento del checkpoint original con diferencias minimas (1906 de 2000 cajas identicas con IoU >= 0,9999 en una muestra de 20 imagenes de test) y garantizar que la carga de pesos con `torch.load(weights_only=True)` no ejecute codigo arbitrario.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion: vehiculos, peatones, senales de trafico y semaforos, entre las clases de BDD100K.
- Procesamiento de imagenes sueltas, carpetas de imagenes, archivos de video y flujo de webcam mediante el script `infer.py`.
- Exportacion de detecciones en formato BDD100K (pixeles, `x1 y1 x2 y2`) mediante la opcion `--json`.
- Umbral de puntuacion configurable (`--score-thr`, por defecto 0,3) y limite de frames (`--max-frames`).
- Funcionamiento en CPU verificado; el entorno CUDA 11.8 esta incluido pero no ha sido probado por el autor.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector de objetos.

## Casos de uso

- Reproduccion de baselines academicos: sirve para replicar los resultados publicados del baseline de deteccion de BDD100K de 2020 con un entorno moderno, util para comparar nuevas arquitecturas contra una referencia estable.
- Auditoria de deteccion en conduccion autonoma: permite ejecutar el detector sobre clips de validacion diurnos y nocturnos para analizar el comportamiento en condiciones de baja iluminacion, como demuestra el banner del repositorio.
- Etiquetado asistido de datasets: las detecciones exportadas en formato BDD100K (`--json`) pueden usarse como preanotaciones para acelerar el etiquetado manual de nuevas imagenes de dashcam.
- Prototipado de pipelines de vision en CPU: al funcionar en CPU con `requirements-cpu.txt`, permite integrar deteccion basica en entornos sin GPU para pruebas de concepto.
- Analisis forense o de trafico offline: procesar carpetas de imagenes o videos grabados para extraer conteos y posiciones de objetos en escenas viales.
- Docencia y estudio de arquitecturas de deteccion: el codigo y los pesos permiten examinar en detalle el funcionamiento de corner pooling y las redes hourglass en un caso real.
- Verificacion de integridad de checkpoints: el hash SHA-256 documentado y la carga segura con `weights_only=True` lo hacen adecuado como ejemplo de buenas practicas en distribucion de pesos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente), sobre el split de validacion de BDD100K:

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 24,5 |
| mAP@50 (val) | 44,7 |
| mAP@75 (val) | 23,0 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 201,1 millones de parametros en precision completa, los pesos ocupan aproximadamente 0,8 GB, mas el consumo de activaciones del backbone Hourglass-104, que es el factor dominante.
- GPU de entrenamiento original: Tesla P100-PCIE-16GB.
- Entorno CUDA verificado: no; solo el entorno de CPU ha sido probado por el autor del espejo.
- Cabe en GPU consumer: previsiblemente si en tarjetas con suficiente memoria para las activaciones del Hourglass-104, aunque no se documenta una cifra concreta.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2; el repositorio incluye `infer.py` para imagen, carpeta, video y webcam. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de vision).
- Latencia y throughput: no disponibles. El banner de demostracion se genero con `infer.py` en CPU con umbral de puntuacion 0,3.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni especificaciones de modelos alternativos comparables sobre BDD100K. Se indica "no disponible".

| Modelo | Parametros | Contexto | mAP@50:95 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CornerNet Hourglass-104 (este) | 201,1 M | no aplica | 24,5 | BDD100K | Hugging Face (espejo) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Reproduccion no exacta: frente a las predicciones oficiales del autor en 20 imagenes de test, 1906 de 2000 cajas coinciden con IoU >= 0,9999, pero la causa de la diferencia restante no fue investigada.
- El entorno CUDA 11.8 no ha sido verificado; solo el de CPU. El rendimiento en GPU es, por tanto, una incognita documentada.
- La ruta de webcam comparte el bucle de captura con los videos, pero no se probo con una camara real.
- Licencia BDD100K: es una licencia propia (`license: other`) con terminos especificos en el archivo LICENSE.txt del repositorio; es imprescindible revisarla antes de cualquier uso comercial.
- Modelo de 2020: las arquitecturas de deteccion actuales superan ampliamente este baseline; usarlo en produccion moderna requeriria justificacion explicita.
- Riesgo de sesgo y alucinacion: como detector entrenado en BDD100K, hereda los sesgos de composicion geografica y de condiciones del dataset (escenas de conduccion principalmente en EE. UU.); puede fallar en dominios visuales distintos.
- Sin soporte de texto ni multilingue: no es adecuado para tareas de lenguaje, agentes o razonamiento.
- Dependencias fragiles: el entorno fija versiones antiguas (torch 2.0.1, mmcv 1.7.2, setuptools 69.5.1) que degradaran paquetes en entornos existentes; se recomienda un entorno limpio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-cornernet-hourglass104-210e
- Licencia: https://huggingface.co/dronefreak/bdd100k-mmdet-cornernet-hourglass104-210e/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Demo (poster): https://huggingface.co/dronefreak/bdd100k-mmdet-cornernet-hourglass104-210e/resolve/main/assets/demo_banner_poster.jpg
- Demo (video): https://huggingface.co/dronefreak/bdd100k-mmdet-cornernet-hourglass104-210e/resolve/main/assets/demo_banner.mp4
