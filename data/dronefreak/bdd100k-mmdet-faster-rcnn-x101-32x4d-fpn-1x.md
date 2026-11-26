# dronefreak/bdd100k-mmdet-faster-rcnn-x101-32x4d-fpn-1x

## Resumen

Faster R-CNN X101-32x4d-FPN 1x sobre BDD100K es un detector de objetos de dos etapas publicado originalmente por el equipo de BDD100K en 2020 y reempaquetado en 2026 por el usuario `dronefreak` como espejo con entorno fijado y script de inferencia. El modelo emplea una arquitectura Faster R-CNN con backbone ResNeXt-101 32x4d inicializado desde pesos ImageNet de OpenMMLab, cuello FPN, RoIAlign y una cabeza de cajas con dos capas fully connected compartidas. Cuenta con 60.152.834 parametros y esta entrenado sobre las 70.000 imagenes del split de entrenamiento de BDD100K, un dataset de escenas de conduccion autonoma.

El interes de esta ficha no reside en la novedad arquitectonica (el diseno es de 2015-2017 y el entrenamiento data de 2020), sino en la reproducibilidad. Los pesos originales se distribuyeron en el servidor de descargas de Berkeley sin documentacion alguna; este espejo anade un entorno de dependencias fijado (Python 3.10, PyTorch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) que permite ejecutar el checkpoint en hardware actual, ademas de un script `infer.py` que acepta imagenes, carpetas, video y webcam.

La relevancia practica es acotada pero clara: sirve como linea base historica de deteccion en BDD100K, como referencia para comparar detectores modernos sobre el mismo dataset y como componente listo para usar en prototipos de vision para conduccion autonoma que no requieran estado del arte. Su licencia BDD100K impone restricciones de uso comercial que conviene revisar antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas con backbone ResNeXt-101 32x4d, FPN, RoIAlign y cabeza de cajas con 2 FC compartidas |
| Parametros totales | 60.152.834 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica ventana de tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`) |
| Formato de pesos | safetensors (repo de 0.9 GB), checkpoint original cargable con `torch.load(weights_only=True)` |

## Arquitectura y entrenamiento

Faster R-CNN es un detector de dos etapas: una red de propuesta de regiones (RPN) genera candidatos y una cabeza de clasificacion y regresion los refina. En esta variante el extractor de caracteristicas es un ResNeXt-101 con cardinalidad 32 y ancho 4d, inicializado desde los pesos ImageNet de OpenMMLab, sobre el que se monta un Feature Pyramid Network para deteccion multi-escala. La cabeza de cajas usa RoIAlign y dos capas fully connected compartidas entre las tareas de clasificacion y localizacion. El esquema de entrenamiento es "1x", es decir, 12 epocas sobre el split de entrenamiento de BDD100K (70.000 imagenes).

El entrenamiento original se realizo con PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.3 y mmdetection 2.4.0 sobre GPUs Tesla P100-PCIE-16GB, datos que quedaron registrados en el propio checkpoint. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un detector de objetos. La innovacion destacable de este espejo no es de modelado sino de ingenieria de reproducibilidad: fijado de dependencias, verificacion de integridad por SHA-256 (`a52f42a3...`) y validacion de que la copia reproduce exactamente las predicciones oficiales (621 cajas identicas con IoU 1.0000 sobre 20 imagenes de test).

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion: coches, peatones, senales de trafico, semaforos y demas clases de BDD100K.
- Inferencia sobre imagen individual, carpetas de imagenes, archivos de video y flujo de webcam mediante `infer.py`.
- Exportacion de detecciones en formato BDD100K (pixeles, `x1 y1 x2 y2`) con la opcion `--json`.
- Umbral de puntuacion configurable (`--score-thr`, por defecto 0.3) y limite de frames para video (`--max-frames`).
- Carga segura del checkpoint con `torch.load(weights_only=True)`, sin ejecucion de codigo arbitrario.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni capacidades multilingues: es exclusivamente un modelo de vision.

## Casos de uso

- Linea base de investigacion en deteccion sobre BDD100K: util para comparar nuevos detectores contra un resultado de referencia publicado y reproducible, con mAP@50:95 de 30,8 en validacion.
- Prototipado de sistemas ADAS: permite detectar peatones y vehiculos en video de camara con un pipeline minimo (instalar entorno, ejecutar `infer.py` sobre el archivo de video) antes de invertir en modelos mas pesados.
- Etiquetado asistido y pre-anotacion: las detecciones exportadas en JSON con formato BDD100K pueden precargarse en herramientas de anotacion para acelerar el etiquetado de nuevos clips de conduccion.
- Analisis de escenas diurnas y nocturnas: el banner de demostracion del autor muestra detecciones sobre clips de validacion de dia y de noche, lo que permite evaluar el comportamiento del modelo en condiciones de iluminacion distintas.
- Auditoria de reproducibilidad: sirve como caso de estudio de como documentar y fijar un checkpoint antiguo (dependencias, hash, verificacion contra predicciones oficiales) para que siga siendo ejecutable anos despues.
- Deteccion en tiempo real desde webcam en entornos de laboratorio: el script incluye un modo de captura por camara (no verificado con camara real segun el autor) adecuado para demos y pruebas de concepto.
- Filtrado previo en pipelines de video: al procesar un video completo y guardar las cajas, se puede alimentar un modulo posterior de seguimiento o conteo de objetos sin reentrenar nada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente, `verified: false`), sobre el split de validacion de BDD100K:

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 30,8 |
| mAP@50 (val) | 56,2 |
| mAP@75 (val) | 28,9 |

No se han publicado en la informacion disponible resultados de otros benchmarks (por ejemplo, comparaciones con detectores mas recientes sobre el mismo split) ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 60,2 M de parametros y pesos en safetensors (repo de 0,9 GB) el modelo es ligero y cabe holgadamente en GPUs de consumo, aunque el autor no publica cifras de memoria.
- GPU de entrenamiento original: Tesla P100-PCIE-16GB (segun metadatos del checkpoint).
- Entorno CUDA verificado: el autor indica que el entorno CUDA 11.8 aun no se ha ejecutado; solo esta verificado el entorno de CPU.
- Cabe en GPU de consumo: si, por tamano de parametros; no se especifica un modelo concreto probado.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre PyTorch 2.0.1, en Python 3.10; el script `infer.py` cubre imagen, carpeta, video y webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN X101-32x4d-FPN 1x, BDD100K) | 60,2 M | Imagenes de escenas de conduccion | mAP@50:95 30,8 (val) | BDD100K | Hugging Face, espejo con entorno fijado |
| Otros detectores sobre BDD100K | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de modelos alternativos evaluados sobre el mismo split de BDD100K, por lo que no es posible establecer una comparativa numerica fiable sin inventar datos.

## Limitaciones y advertencias

- Modelo de 2020 con arquitectura de dos etapas: su rendimiento (mAP@50:95 de 30,8) queda lejos de lo que ofrecen detectores modernos, por lo que no es adecuado como solucion de produccion de maximo rendimiento.
- Licencia BDD100K (`license: other`): es imprescindible revisar el archivo `LICENSE.txt` del repositorio antes de cualquier uso comercial; no es una licencia permisiva generica.
- Entorno fragil: requiere mmdetection 2.x (la 3.x cambio formato de configuracion y codigo del modelo); las versiones fijadas degradaran paquetes en un entorno existente, por lo que hay que usar un entorno limpio.
- El entorno CUDA 11.8 no ha sido verificado por el autor; solo el de CPU esta probado, lo que afecta a las expectativas de velocidad.
- El modo webcam no se ha probado con una camara real.
- Riesgo de alucinacion en el sentido de falsos positivos y falsos negativos propios de un detector con umbral configurable; el umbral por defecto (0.3) es bajo y puede generar detecciones espurias.
- Sesgos potenciales derivados del dataset BDD100K (composicion geografica y de condiciones de captura), no documentados en la informacion disponible.
- No procesa texto ni multiples idiomas; cualquier caso de uso linguistico queda fuera de su alcance.
- El checkpoint original carecia de documentacion; esta ficha se basa en la model card del espejo, cuyas verificaciones (hash, reproduccion exacta) son del autor y no han sido auditadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-x101-32x4d-fpn-1x
- Licencia BDD100K del repositorio: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-x101-32x4d-fpn-1x/blob/main/LICENSE.txt
- Dataset referenciado: https://huggingface.co/datasets/dronefreak/BDD100K
- Demo (poster): https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-x101-32x4d-fpn-1x/resolve/main/assets/demo_banner_poster.jpg
- Demo (video): https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-x101-32x4d-fpn-1x/resolve/main/assets/demo_banner.mp4
