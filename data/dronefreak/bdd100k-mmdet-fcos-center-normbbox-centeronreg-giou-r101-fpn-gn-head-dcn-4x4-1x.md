# dronefreak/bdd100k-mmdet-fcos-center-normbbox-centeronreg-giou-r101-fpn-gn-head-dcn-4x4-1x

## Resumen

El modelo `dronefreak/bdd100k-mmdet-fcos-center-normbbox-centeronreg-giou-r101-fpn-gn-head-dcn-4x4-1x` es un detector de objetos FCOS (Fully Convolutional One-Stage) con backbone ResNet-101, FPN y cabecera con convoluciones deformables, entrenado sobre el conjunto de datos BDD100K para deteccion en escenas de conduccion. No es un modelo de lenguaje: es un checkpoint de vision por computador publicado originalmente por el equipo de BDD100K en 2020 y reempaquetado por el usuario `dronefreak` como espejo con entorno fijado y script de inferencia funcional.

El checkpoint original se distribuyo sin documentacion en el servidor de descargas de Berkeley. Este espejo anade la documentacion tecnica, un `infer.py` que carga los pesos con `torch.load(weights_only=True)` y un entorno reproducible (PyTorch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) que permite ejecutarlo en hardware actual pese a haber sido entrenado con PyTorch 1.6.0 y CUDA 10.2.

Su relevancia es practica: sirve como baseline de deteccion para BDD100K con verificacion de reproduccion exacta (mismas 2000 cajas e IoU 1.0000 frente a las predicciones originales en 20 imagenes de test). Con 53,3 millones de parametros, es un modelo ligero orientado a deteccion de coches, peatones, senales de trafico y semaforos en imagenes de camara de vehiculo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCOS (one-stage, anchor-free) con backbone ResNet-101, FPN, GroupNorm en la cabeza y convoluciones deformables (DCN) 4x4 |
| Parametros totales | 53.287.215 (53,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors de precision original) |
| Idiomas soportados | no aplica |
| Licencia | bdd100k (licencia propia del dataset BDD100K, ver LICENSE.txt) |
| Formato de pesos | safetensors (repo de 1,1 GB) |

## Arquitectura y entrenamiento

FCOS es un detector de objetos de una sola etapa y sin anchors que predice directamente cajas por pixel sobre mapas de caracteristicas del FPN. En esta variante se usa una ResNet-101 como backbone, una FPN multi-nivel, normalizacion GroupNorm en la cabeza de deteccion y convoluciones deformables 4x4 para mejorar la modelizacion geometrica. El sufijo `normbbox-centeronreg-giou` indica normalizacion de cajas, centerness regularizado y perdida GIoU en la regresion.

Fue entrenado con el schedule 1x (12 epocas) sobre BDD100K, con PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.3 y mmdetection 2.4.0 en GPUs Tesla P100-PCIE-16GB. No se documenta el numero exacto de tokens ni composicion del dataset mas alla de BDD100K. No hay informacion sobre RLHF, DPO ni tecnicas de alineacion, al no tratarse de un modelo generativo.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion (coches, peatones, senales de trafico, semaforos, segun clases de BDD100K).
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video o webcam en directo mediante `infer.py`.
- Exportacion de detecciones en formato BDD100K (pixeles, `x1 y1 x2 y2`) con `--json`.
- Umbral de puntuacion configurable (`--score-thr`, por defecto 0,3) y limite de frames (`--max-frames`).
- Carga segura de pesos con `torch.load(weights_only=True)`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Deteccion de objetos en video de trafico: el script `infer.py` procesa un fichero de video frame a frame y permite guardar las cajas en JSON, util para anotacion automatica o analisis de escenas diurnas y nocturnas.
- Baseline academico para BDD100K: sirve como referencia reproducible (IoU 1.0000 contra las predicciones originales) para comparar nuevas arquitecturas de deteccion sobre el mismo split de validacion.
- Preetiquetado de datasets de conduccion: usar las detecciones con umbral bajo como propuestas iniciales que un anotador humano revise, reduciendo coste de etiquetado.
- Prototipado en sistemas ADAS: al caber en GPU consumer y ejecutarse en CPU, permite validar pipelines de percepcion antes de invertir en modelos mayores.
- Monitorizacion de camaras de trafico en tiempo casi real: con 53,3 M de parametros y backbone ResNet-101, es viable en GPU de gama media para streams de baja resolucion.
- Docencia y experimentacion con mmdetection 2.x: el entorno fijado y el script de inferencia facilitan reproducir un detector clasico sin pelearse con dependencias rotas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`), sobre el split de validacion de BDD100K:

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 29,8 |
| mAP@50 (val) | 54,5 |
| mAP@75 (val) | 27,8 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 53,3 M de parametros y pesos en precision original, el uso de memoria es moderado y cabe en GPUs consumer de 8 GB o menos.
- GPUs de entrenamiento originales: Tesla P100-PCIE-16GB.
- GPU recomendadas para inferencia: cualquier GPU NVIDIA con CUDA 11.8 (entorno `requirements-cu118.txt`); tambien existe entorno CPU (`requirements-cpu.txt`).
- Cabe en GPU consumer: si, al ser un modelo de 53,3 M de parametros.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y PyTorch 2.0.1; script `infer.py` incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El entorno CUDA 11.8 no habia sido probado en el momento de publicar la model card; solo el entorno CPU esta verificado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, este checkpoint compite en la categoria de detectores one-stage sobre BDD100K con otras variantes FCOS, RetinaNet y YOLO de la misma epoca, pero no se aportan cifras de estos modelos en la documentacion facilitada.

## Limitaciones y advertencias

- Es un modelo de vision, no de lenguaje: no genera texto ni soporta conversacion.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false`).
- El entorno CUDA 11.8 no estaba probado al publicar la model card; solo el entorno CPU esta verificado.
- La ruta de webcam no fue probada con una camara real.
- El stack original (PyTorch 1.6.0, mmcv 1.1.3, mmdetection 2.4.0) es incompatible con GPUs actuales; es obligatorio usar el entorno fijado del repo.
- La licencia es la propia de BDD100K (`license: other`, `license_name: bdd100k`); es imprescindible revisar `LICENSE.txt` antes de cualquier uso comercial.
- Riesgo de sesgo: entrenado sobre BDD100K, refleja la distribucion de escenas de conduccion de ese dataset (geografia y condiciones concretas).
- Riesgo de falsos positivos y negativos en condiciones de iluminacion adversas; el umbral por defecto (0,3) es bajo y puede generar detecciones espurias.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-fcos-center-normbbox-centeronreg-giou-r101-fpn-gn-head-dcn-4x4-1x
- Licencia: https://huggingface.co/dronefreak/bdd100k-mmdet-fcos-center-normbbox-centeronreg-giou-r101-fpn-gn-head-dcn-4x4-1x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Repositorio mmdetection: https://github.com/open-mmlab/mmdetection
- Paper FCOS: https://arxiv.org/abs/1904.01355
- Web oficial BDD100K: https://bdd-data.berkeley.edu/
