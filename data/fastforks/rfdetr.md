# fastforks/rfdetr

## Resumen

RF-DETR es un modelo de deteccion de objetos e segmentacion de instancias en tiempo real desarrollado por Roboflow (publicado en 2025, paper arXiv:2511.09554). Combina un backbone DINOv2-small con atencion por ventanas, un proyector de escala unica y un decodificador de atencion deformable sobre entre 100 y 300 queries, eliminando por completo la necesidad de supresion no maxima (NMS) en la fase de post-proceso. El modelo produce directamente cajas, puntuaciones, etiquetas de clase COCO y, en las variantes Seg, mascaras de instancia.

La ficha que nos ocupa, `fastforks/rfdetr`, no es el repositorio oficial de pesos: es una model card de terceros publicada por el usuario `fastforks` que documenta la integracion del modelo en el framework homonimo `fastforks`. El repositorio no aloja pesos; en su lugar, el codigo de `fastforks` descarga los pesos originales de Roboflow desde los enlaces del autor y verifica su integridad mediante SHA-256. Incluye diez variantes (cuatro de deteccion: N, S, M, L; seis de segmentacion: N, S, M, L, XL, 2XL), todas bajo licencia Apache-2.0 y con uso comercial permitido.

La relevancia actual de esta ficha reside en que documenta una via de despliegue alternativa (backend `portable` y backend `kernels`) con mejoras de rendimiento medidas: hasta 4,2x de aceleracion frente al codigo original en la variante nano, con huellas de memoria reducidas. Es material util para equipos que quieran integrar RF-DETR en pipelines de vision por computador sin depender del repositorio oficial de Roboflow.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de deteccion end-to-end con backbone DINOv2-small, atencion por ventanas, proyector de escala unica y decodificador de atencion deformable sobre 100-300 queries; sin NMS |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se documenta ejecucion en fp16 y fp32) |
| Idiomas soportados | no disponible (modelo de vision; clases COCO en ingles) |
| Licencia | Apache-2.0 (codigo y pesos de las diez variantes) |
| Formato de pesos | `.pth` (PyTorch); descargados desde los enlaces del autor, no alojados en el repo |
| Pipeline | object-detection |
| Tarea | Deteccion de objetos e segmentacion de instancias |
| Entrada | Una imagen RGB; cualquier H x W >= 32, padding a multiplo de 32; redimensionado cuadrado interno de 384 a 768 px segun variante |
| Salidas | `boxes`, `scores`, `labels`, `masks` (mascaras solo en variantes Seg) |
| Backends | `portable`, `kernels` |
| Libreria | `fastforks` |
| Tier | experimental |

## Arquitectura y entrenamiento

RF-DETR es un detector transformer end-to-end que prescinde de NMS. El backbone es un DINOv2-small preentrenado sobre LVD-142M (conjunto curado de imagenes web de DINOv2, no liberado publicamente), sobre el que se aplica atencion por ventanas. Un proyector de escala unica alimenta un decodificador de atencion deformable que opera sobre entre 100 y 300 queries, produciendo directamente cajas normalizadas, logits de clase y, en las variantes Seg, logits de mascara. La imagen se redimensiona a un cuadrado interno de 384 a 768 px segun la variante.

El entrenamiento de deteccion utiliza COCO 2017 (train, anotaciones de instancia) y Objects365 (train, anotaciones de caja) para el preentrenamiento del detector, segun el paper. La procedencia completa de los datos intermedios de entrenamiento no esta declarada en la model card. No se documentan detalles sobre numero de tokens, composicion exacta del dataset, ni sobre si se aplico RLHF o DPO (tecnicas propias de modelos de lenguaje, no aplicables aqui). La innovacion tecnica destacable es la eliminacion de NMS y el uso de atencion deformable sobre queries, que simplifica el post-proceso y permite despliegues de baja latencia.

## Capacidades

- Deteccion de objetos en tiempo real: produce cajas, etiquetas de clase COCO y puntuaciones sobre una imagen RGB.
- Segmentacion de instancias: las seis variantes Seg (N, S, M, L, XL, 2XL) anaden mascaras de instancia por objeto.
- Deteccion end-to-end sin NMS: el decodificador de queries evita el post-proceso de supresion no maxima.
- Entrada de resolucion flexible: acepta cualquier H x W >= 32 con padding a multiplo de 32; probado hasta 3000x4000 px.
- Dos backends de ejecucion: `portable` (compatible, menor huella de memoria) y `kernels` (acelerado mediante kernels dedicados).
- Ejecucion en fp16 y fp32 sobre GPU CUDA.
- Diez variantes de tamano para ajustar el compromiso entre precision y latencia.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- Vigilancia y analitica de video en tiempo real: las variantes N y S, con latencias de 2,46 ms y 3,44 ms por frame (backend `kernels`, 800x1344), permiten procesar streams de video a alta frecuencia manteniendo deteccion end-to-end sin NMS.
- Segmentacion de instancias en imagenes medicas o industriales: las variantes Seg XL y 2XL producen mascaras por objeto, utiles para contar y medir instancias en imagenes de alta resolucion (probado hasta 3000x4000 px).
- Inspeccion de calidad en linea de produccion: la variante M, con 3,90 ms por inferencia en backend `kernels`, se integra en cadenas de montaje para detectar defectos con latencia inferior al ciclo de la cinta.
- Deteccion en imagenes de satelite o dron: la entrada flexible (cualquier H x W >= 32, probado a 3000x4000) y la huella de memoria reducida (0,5 GiB pico en portable fp16 sobre RTX 5060 Ti) permiten procesar imagenes de alta resolucion en GPU consumer.
- Automatizacion de anotacion de datasets: el modelo puede pre-etiquetar imagenes COCO para revision humana, reduciendo el coste de anotacion en proyectos de vision.
- Despliegue en dispositivos de borde con GPU consumer: las variantes N y S caben en GPUs de gama media y pueden ejecutarse con backend `portable` en entornos con memoria limitada (114-126 MiB pico asignada en 800x1344).
- Integracion en pipelines de vision con verificacion de integridad: el framework `fastforks` descarga los pesos del autor y verifica el SHA-256, lo que permite despliegues reproducibles en CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (mAP, etc.) en la informacion disponible. Si se documentan mediciones de latencia y memoria sobre entrada sintetica de 800x1344:

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico original (MiB asig/res) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|
| rf-detr-l-coco | – | 11,8 | 5,36 | 2,2x | 219 / 240 | 148 / 166 | 146 / 206 |
| rf-detr-m-coco | – | 11,8 | 3,90 | 3,0x | 140 / 174 | 136 / 156 | 133 / 180 |
| rf-detr-n-coco | – | 10,5 | 2,46 | 4,2x | 118 / 160 | 114 / 140 | 114 / 142 |
| rf-detr-s-coco | – | 11,2 | 3,44 | 3,2x | 189 / 238 | 126 / 148 | 125 / 170 |
| rf-detr-seg-2xl-coco | – | 25,6 | 16,0 | 1,6x | 287 / 352 | 210 / 230 | 218 / 332 |
| rf-detr-seg-l-coco | – | 15,3 | 6,75 | 2,3x | 459 / 492 | 150 / 168 | 151 / 228 |
| rf-detr-seg-m-coco | – | 14,4 | 5,36 | 2,7x | 381 / 424 | 141 / 180 | 144 / 204 |
| rf-detr-seg-n-coco | – | 13,0 | 3,75 | 3,5x | 255 / 298 | 123 / 148 | 126 / 190 |
| rf-detr-seg-s-coco | – | 13,0 | 4,34 | 3,0x | 327 / 382 | 130 / 154 | 129 / 198 |
| rf-detr-seg-xl-coco | – | 18,7 | 10,5 | 1,8x | 182 / 248 | 177 / 206 | 188 / 268 |

Entrada de prueba de alta resolucion (3000x4000, portable fp16, RTX 5060 Ti 16 GB): 0,5 GiB pico asignada y 0,5 GiB reservada para las diez variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 114 y 218 MiB pico asignada en entrada 800x1344 segun variante y backend; hasta 0,5 GiB pico en entrada 3000x4000 (portable fp16).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA; probado sobre RTX 5060 Ti 16 GB. Para produccion de alta concurrencia, se recomiendan A100 o H100 por throughput, aunque la huella de memoria es lo bastante pequena para GPUs consumer.
- Cabe en GPU consumer: si, todas las variantes caben en GPUs consumer modernas (la huella maxima medida es de 0,5 GiB en alta resolucion).
- Opciones de despliegue: framework `fastforks` con backends `portable` y `kernels`; kernels dedicados publicados en `fastforks/kernels`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: 2,46 ms (nano, kernels) a 16,0 ms (seg-2xl, kernels) por inferencia a 800x1344; el backend `kernels` ofrece entre 1,6x y 4,2x de aceleracion frente al codigo original.
- Memoria de carga: los tiempos de carga y primera llamada estan documentados en la model card (tabla truncada en la informacion disponible).

## Comparativa con modelos similares

No se dispone de datos de precision (mAP) ni de comparaciones directas con otros detectores en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas como YOLO, DETR o RT-DETR. Los datos disponibles se limitan a latencia y memoria internas al framework `fastforks`.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR (esta ficha) | no disponible | cualquier H x W >= 32, probado hasta 3000x4000 | 2,46-16,0 ms (kernels, 800x1344) | Apache-2.0 | pesos via Roboflow, framework fastforks |
| Alternativas (YOLO, DETR, RT-DETR) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Repositorio de terceros: `fastforks/rfdetr` es una model card de integracion, no el repositorio oficial de Roboflow; los pesos se descargan de enlaces externos y se verifican por SHA-256.
- Tier experimental: el framework `fastforks` califica esta integracion como experimental; no se garantiza estabilidad para produccion.
- Sin datos de precision: no se publican resultados de mAP u otras metricas de calidad de deteccion en la informacion disponible, lo que impide evaluar la precision real frente a alternativas.
- Clases limitadas a COCO: el modelo predice las 80 clases de COCO; no cubre dominios especializados sin reentrenamiento.
- Sesgos: no documentados en la model card; al entrenarse sobre COCO 2017 y Objects365, hereda los sesgos de composicion y anotacion de esos datasets.
- Riesgo de alucinacion: inherente a los detectores; pueden producirse falsos positivos en escenas ambiguas, agravado por la ausencia de NMS.
- Licencia: Apache-2.0 en codigo y pesos, con uso comercial permitido; la model card advierte que el paquete es de uso de investigacion y recomienda revisar las cadenas de licencia originales antes de otros usos.
- Procedencia de datos incompleta: la procedencia completa del entrenamiento intermedio no esta declarada; LVD-142M no esta liberado publicamente.
- Idiomas: no aplica (modelo de vision); las etiquetas de clase estan en ingles.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/rfdetr
- Codigo del framework fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original de RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Paper RF-DETR: https://arxiv.org/abs/2511.09554
- Pesos variante large: https://repo.roboflow.com/rfdetr/rf-detr-large-2026.pth
- Pesos variante medium: https://repo.roboflow.com/rfdetr/medium_coco/checkpoint_best_regular.pth
- Pesos variante nano: https://repo.roboflow.com/rfdetr/nano_coco/checkpoint_best_regular.pth
- Pesos variante small: https://repo.roboflow.com/rfdetr/small_coco/checkpoint_best_regular.pth
- Pesos seg-2xl: https://repo.roboflow.com/rfdetr/rf-detr-seg-2xl-ft.pth
- Pesos seg-l: https://repo.roboflow.com/rfdetr/rf-detr-seg-l-ft.pth
- Pesos seg-m: https://repo.roboflow.com/rfdetr/rf-detr-seg-m-ft.pth
- Pesos seg-n: https://repo.roboflow.com/rfdetr/rf-detr-seg-n-ft.pth
- Pesos seg-s: https://repo.roboflow.com/rfdetr/rf-detr-seg-s-ft.pth
- Pesos seg-xl: https://repo.roboflow.com/rfdetr/rf-detr-seg-xl-ft.pth
- Evidencia de licencia: https://github.com/roboflow/rf-detr/blob/5b22dfc0940697ce1abdfa681a5f7392b3eddbfb/README.md#license
