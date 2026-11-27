# dronefreak/bdd100k-detectron2-faster-rcnn-r50-fpn-1x

## Resumen

Faster R-CNN R50-FPN 1x sobre BDD100K es un detector de objetos de dos etapas entrenado para escenas de conduccion. El modelo original fue publicado en 2020 por el equipo de BDD100K en el servidor de descargas de Berkeley, sin documentacion asociada: el checkpoint no almacena configuracion, nombres de clase ni versiones de software. Esta ficha describe la copia espejo mantenida por el usuario dronefreak, que anade un entorno fijado (Python 3.9, torch 1.10.1, detectron2 0.6) y un script de inferencia para que los pesos sigan siendo ejecutables hoy.

Arquitectonicamente es un Faster R-CNN clasico con backbone ResNet-50 y cuello FPN, con 41.447.492 parametros totales y pesos en formato safetensors (ademas del `.pth` original). El entrenamiento sigue el calendario "1x" de detectron2 sobre el conjunto de deteccion de BDD100K, orientado a clases como coche, camion, autobus, persona, bicicleta, moto, semaforo y senal de trafico.

Su relevancia actual es doble: por un lado sirve como linea base reproducible para investigacion en deteccion en escenas de conduccion; por otro, es un ejemplo de preservacion de artefactos antiguos, ya que el espejo documenta y verifica el checkpoint original, cuyas predicciones no se reproducen de forma exacta (830 cajas frente a 834 en una muestra de 20 imagenes de test) por causas no determinadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con backbone ResNet-50 y FPN (dos etapas, anclas) |
| Parametros totales | 41.447.492 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de imagen, tamano de test 800 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth` original) |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase estan en ingles) |
| Licencia | BDD100K (license: other, license_name: bdd100k) |
| Formato de pesos | safetensors y `.pth` original |

## Arquitectura y entrenamiento

Faster R-CNN es un detector de dos etapas: una red de propuesta de regiones (RPN) genera candidatos sobre el mapa de caracteristicas, y una segunda etapa clasifica y refina cada propuesta. El backbone es ResNet-50 y el cuello FPN agrega caracteristicas multiescala, lo que mejora la deteccion de objetos de distinto tamano tipicos de escenas de trafico (vehiculos lejanos frente a peatones cercanos). El calendario de entrenamiento es el "1x" estandar de detectron2.

El checkpoint fue entrenado sobre el conjunto de deteccion de BDD100K, un dataset de escenas de conduccion con anotaciones de cajas. No se dispone de informacion sobre el numero exacto de tokens, composicion fina del dataset, ni sobre si se aplicaron tecnicas de refinamiento posteriores. La model card del espejo no documenta hiperparametros de entrenamiento mas alla del calendario 1x, y senala que el checkpoint original no almacena configuracion ni versiones, por lo que el entorno se reconstruyo a partir del model zoo de detectron2 y se verifico contra los pesos.

La innovacion tecnica de esta copia no esta en el modelo sino en el empaquetado: pesos en safetensors (solo tensores, sin ejecucion de codigo al cargar), entorno completamente fijado y un `infer.py` que procesa imagenes, carpetas, video o webcam, y exporta detecciones en formato BDD100K (`x1 y1 x2 y2` en pixeles).

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion (coches, camiones, autobuses, personas, bicicletas, motos, semaforos, senales de trafico).
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video o webcam en directo mediante `infer.py`.
- Exportacion de detecciones a JSON en formato BDD100K (pixeles, `x1 y1 x2 y2`).
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de frames en video (`--max-frames`).
- Funcionamiento en CPU y en GPU (builds CUDA 11.3 o CPU del entorno fijado).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector visual.

## Casos de uso

- Linea base para investigacion en deteccion en conduccion: permite comparar nuevas arquitecturas contra un Faster R-CNN R50-FPN 1x con metricas publicadas en validacion de BDD100K (mAP@50:95 de 30.9).
- Prototipado de sistemas ADAS: el modelo puede detectar vehiculos, peatones y senales en fotogramas de video para validar pipelines de percepcion antes de invertir en modelos mas pesados.
- Etiquetado asistido: ejecutar el detector sobre imagenes sin anotar y exportar cajas en formato BDD100K para preanotar y acelerar el trabajo de anotacion humana.
- Analisis de trafico offline: procesar grabaciones de camaras de trafico con `--max-frames` y el modo carpeta/video para extraer conteos y posiciones de objetos por fotograma.
- Verificacion de preservacion de modelos: el espejo documenta el proceso de comparacion contra las predicciones originales del autor (IoU mediana de 0.9907 sobre cajas emparejadas), util como caso de estudio de reproducibilidad.
- Demostracion educativa de detectron2: el entorno fijado y el script de inferencia permiten ejecutar un detector de dos etapas clasico sin resolver manualmente incompatibilidades de versiones.
- Pruebas de robustez dia/noche: los clips de demostracion incluidos cubren escenas diurnas y nocturnas de validacion, utiles para evaluar el comportamiento del detector en condiciones de iluminacion distintas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) sobre el split de validacion de BDD100K:

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 30.9 |
| mAP@50 (val) | 57.2 |
| mAP@75 (val) | 28.5 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 41.3 M de parametros y backbone ResNet-50, el modelo es ligero y cabe holgadamente en GPU de consumo, aunque el dato exacto no se documenta.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA 11.3; el entorno tambien ofrece build de CPU.
- Cabe en GPU de consumo: si, por el tamano del modelo (41.3 M de parametros), aunque no se especifica un modelo concreto en la documentacion.
- Opciones de despliegue: detectron2 0.6 con torch 1.10.1 (wheel precompilado de Meta), script `infer.py` incluido; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. La model card indica que la demostracion se genero con `infer.py` en CPU con umbral de score 0.3.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros detectores sobre BDD100K (por ejemplo, variantes de mmdetection o RetinaNet) que permitan una comparacion con numeros verificables. La model card menciona que las predicciones originales del autor usan el orden de clases de mmdetection, pero no ofrece metricas de esos modelos.

| Modelo | Parametros | Contexto | mAP@50:95 (val BDD100K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN R50-FPN 1x) | 41.447.492 | no aplica | 30.9 (declarado) | BDD100K | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Reproduccion no exacta: frente a las predicciones publicadas por el autor en 20 imagenes de test, esta copia genera 830 cajas frente a 834; ninguna caja es identica (IoU >= 0.9999) y 795 tienen correspondencia con IoU >= 0.5. La causa es desconocida; se descartaron diferencias de pesos, anclas, estadisticas de pixel y tamano de test (800 es el que mejor concuerda entre 600 y 1024).
- Nombres de clase: la exportacion original del autor usa el orden de clases de mmdetection (las senales aparecen como "train", los camiones como "bus"); `infer.py` escribe los nombres de clase del modelo, por lo que hay que tenerlo en cuenta al comparar salidas.
- Dependencias fragiles: detectron2 0.6 falla al importar con Pillow 10 o superior, y torch 1.10 requiere numpy 1.x y setuptools anterior a 70; los pines del entorno pueden degradar paquetes de un entorno existente, por lo que se recomienda uno nuevo.
- Licencia: licencia BDD100K (license: other), con terminos propios en el fichero LICENSE.txt del repositorio; es imprescindible revisarlos antes de cualquier uso comercial.
- Sesgos y alucinacion: no hay informacion sobre sesgos del dataset ni sobre tasas de falsos positivos mas alla de las metricas agregadas; como todo detector, puede producir cajas espurias, especialmente con umbrales de score bajos.
- Ambito limitado: disenado para escenas de conduccion de BDD100K; su comportamiento fuera de ese dominio (otras camaras, paises, condiciones meteorologicas extremas) no esta documentado.
- Sin soporte de texto ni multilingue: no es un modelo de lenguaje y no admite prompts, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-detectron2-faster-rcnn-r50-fpn-1x
- Licencia BDD100K del repositorio: https://huggingface.co/dronefreak/bdd100k-detectron2-faster-rcnn-r50-fpn-1x/blob/main/LICENSE.txt
- Dataset referenciado: https://huggingface.co/datasets/dronefreak/BDD100K
- Poster de la demostracion: https://huggingface.co/dronefreak/bdd100k-detectron2-faster-rcnn-r50-fpn-1x/resolve/main/assets/demo_banner_poster.jpg
- Video de la demostracion: https://huggingface.co/dronefreak/bdd100k-detectron2-faster-rcnn-r50-fpn-1x/resolve/main/assets/demo_banner.mp4
