# fastforks/lwdetr

## Resumen

LW-DETR es un detector de objetos de tipo DETR (Detection Transformer) en tiempo real desarrollado originalmente por Chen et al. (Baidu) y publicado en el articulo arXiv:2406.03459. El modelo combina un codificador ViT plano con atencion intercalada de ventana y global, un proyector C2f y un decodificador DETR deformable de 3 capas que opera sobre las mejores propuestas del codificador, eliminando la necesidad de NMS (Non-Maximum Suppression). Detecta cajas, puntuaciones y las 80 clases de COCO directamente sobre la imagen redimensionada a 640x640.

El repositorio `fastforks/lwdetr` es una model card de integracion, no un repositorio de pesos: no aloja los ficheros de pesos. La libreria `fastforks` descarga los pesos originales de los repositorios del autor (AnnaZhang) y los verifica contra los hashes SHA-256 documentados. Se ofrecen cinco variantes (tiny, small, medium, large y xlarge) entrenadas durante 60 epocas sobre COCO 2017, con preentrenamiento de deteccion en Objects365 y preentrenamiento autosupervisado CAEv2 de los codificadores ViT.

La relevancia actual reside en su enfoque end-to-end sin NMS con un codificador ViT plano, que reduce la latencia frente a los DETR clasicos, y en la disponibilidad de backends optimizados (`portable` y `kernels`) que aceleran la inferencia hasta 7,5x respecto a la implementacion original en fp32. El tier asignado por fastforks es "experimental".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR con codificador ViT plano (atencion intercalada ventana/global), proyector C2f y decodificador DETR deformable de 3 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de cualquier H x W >= 32, relleno a multiplo de 32; entrenado/testado a 640x640) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; inferencia probada en fp16) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (codigo y pesos; uso comercial permitido) |
| Formato de pesos | safetensors (config.json + model.safetensors) |

## Arquitectura y entrenamiento

LW-DETR emplea un codificador ViT plano con atencion intercalada de ventana y global, un proyector C2f que transforma las caracteristicas del codificador y un decodificador DETR deformable de 3 capas que predice directamente cajas, puntuaciones y clases sobre las mejores propuestas del codificador, sin NMS. La salida del `module()` portable es la red completa a su tamano de entrada: logits de clase y cajas normalizadas.

El entrenamiento parte de COCO 2017 (anotaciones de instancia) tras un preentrenamiento de deteccion en Objects365 (anotaciones de caja); los codificadores ViT se inicializan desde el preentrenamiento autosupervisado CAEv2 (seccion 4 del paper arXiv:2406.03459). Las cinco variantes se entrenaron durante 60 epocas sobre COCO. No se documentan en la informacion disponible detalles sobre RLHF/DPO (no aplica a un detector), numero exacto de tokens ni composicion detallada del dataset mas alla de lo indicado.

## Capacidades

- Deteccion de objetos end-to-end: devuelve cajas, etiquetas de clase y puntuaciones para las 80 clases de COCO.
- Segmentacion de instancias: la model card declara salida de mascaras de instancia ademas de cajas.
- Sin NMS: el decodificador DETR deformable produce predicciones directas, lo que simplifica el postprocesado.
- Entrada de imagen unica RGB con resolucion variable (cualquier H x W >= 32, relleno a multiplo de 32); redimensionado a 640x640 ignorando la relacion de aspecto.
- Backends `portable` y `kernels` con kernels optimizados para CUDA.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente de vision).
- Capacidades especiales: inferencia en fp16, verificacion de integridad de pesos mediante SHA-256.

## Casos de uso

- Deteccion de objetos en produccion sobre imagenes de alta resolucion: el modelo se ha probado con entradas de 3000x4000 (hasta 0.7 GiB de pico en xlarge) en una RTX 5060 Ti de 16 GB, lo que permite procesar imagenes de camaras sin reescalado agresivo.
- Vigilancia y videovigilancia en tiempo real: con latencias de 2,20 ms (tiny, backend kernels) a 9,44 ms (xlarge) sobre 800x1344, es adecuado para pipelines de video con requisitos de baja latencia.
- Automocion y ADAS: la deteccion end-to-end sin NMS simplifica la integracion en sistemas embebidos y reduce el coste de postprocesado en flujos por frame.
- Analisis de imagenes medicas o industriales: la capacidad de aceptar resoluciones arbitrarias (multiplo de 32) permite adaptarse a modalidades con relaciones de aspecto no estandar.
- Segmentacion de instancias para conteo y analitica: las mascaras de instancia permiten contar objetos y medir areas en imagenes de retail o agricultura.
- Prototipado e investigacion en deteccion: el tier experimental y la licencia Apache-2.0 facilitan experimentos reproducibles con verificacion de pesos por hash.
- Despliegue en GPU de consumo: las variantes tiny/small caben holgadamente en GPUs consumer (pico de 92-99 MiB en portable a 800x1344), lo que permite inferencia local en estaciones de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (mAP en COCO, etc.) en la informacion disponible. Si se documentan metricas de velocidad y memoria sobre entrada sintetica de 800x1344:

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|
| lw-detr-large-coco | 22,8 | 10,2 | 5,64 | 4,0x | 204 / 230 | 192 / 254 |
| lw-detr-medium-coco | 23,3 | 8,86 | 3,83 | 6,1x | 128 / 136 | 128 / 180 |
| lw-detr-small-coco | 19,9 | 8,82 | 2,80 | 7,1x | 97 / 116 | 99 / 140 |
| lw-detr-tiny-coco | 16,4 | 7,45 | 2,20 | 7,5x | 92 / 112 | 94 / 134 |
| lw-detr-xlarge-coco | 25,5 | 12,1 | 9,44 | 2,7x | 344 / 360 | 333 / 408 |

Tiempos de carga y primera llamada (segundos):

| Modelo | Carga original | Carga portable | Carga kernels | Primera llamada original | Primera llamada portable | Primera llamada kernels |
|---|---|---|---|---|---|---|
| lw-detr-large-coco | 3,82 | 3,20 | 3,04 | 0,72 | 0,36 | 0,34 |
| lw-detr-medium-coco | 3,91 | 2,73 | 2,93 | 0,64 | 0,35 | 0,33 |
| lw-detr-small-coco | 4,14 | 2,70 | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: a 800x1344 en fp16, entre 92 MiB (tiny, portable) y 344 MiB (xlarge, portable) de memoria pico asignada; con backend kernels, entre 94 MiB y 333 MiB.
- Imagenes de alta resolucion: probado a 3000x4000 en RTX 5060 Ti 16 GB con pico de 0,5 GiB (tiny a large) y 0,7 GiB (xlarge).
- GPU recomendadas: cualquier GPU CUDA con suficiente VRAM; el modelo se ha validado en RTX 5060 Ti 16 GB. Para produccion de alto throughput se pueden usar A100/H100, aunque no se documentan pruebas en ellas.
- Cabe en GPU de consumo: si, todas las variantes caben en GPUs consumer modernas (incluso con margen amplio).
- Opciones de despliegue: libreria `fastforks` con backends `portable` y `kernels`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un detector).
- Latencia y throughput: 2,20 ms (tiny, kernels) a 9,44 ms (xlarge) por imagen de 800x1344; la primera llamada tarda entre 0,33 y 0,36 s con kernels.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LW-DETR (este) | DETR ViT end-to-end sin NMS | no disponible | cualquier H x W >= 32 (testado 640x640 y 3000x4000) | Apache-2.0 | pesos en repos de AnnaZhang, card en fastforks |
| DETR clasico (Carion et al.) | DETR ResNet + transformer | no disponible en la informacion | 800x1333 tipico | Apache-2.0 (original) | disponible en transformers |
| Deformable DETR | DETR con atencion deformable | no disponible en la informacion | resolucion variable | Apache-2.0 (original) | disponible en transformers |
| YOLO (familia) | detector CNN/anchor-based | no disponible en la informacion | 640x640 tipico | licencias variables (AGPL en algunas versiones) | amplia disponibilidad |

No se dispone de datos de precision comparativos en la informacion proporcionada; la comparativa se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- El repositorio es solo una model card: no contiene pesos. La descarga y verificacion depende de la libreria `fastforks` y de los repositorios del autor.
- Tier "experimental" segun fastforks: no se recomienda para produccion critica sin validacion propia.
- No se publican metricas de precision (mAP) en la informacion disponible, lo que impide evaluar la calidad de deteccion frente a alternativas.
- El redimensionado a 640x640 ignora la relacion de aspecto, lo que puede degradar la deteccion en imagenes muy alargadas si no se gestiona externamente.
- Entrenado exclusivamente en COCO 2017 (80 clases) con preentrenamiento en Objects365; el vocabulario de clases esta limitado a COCO.
- Riesgo de alucinacion: como todo detector, puede producir falsos positivos y cajas con puntuaciones sobreconfiadas; no se documentan umbrales calibrados.
- Sesgos: no se documentan analisis de sesgo; el dataset COCO tiene sesgos conocidos de representacion geografica y demografica.
- Licencia Apache-2.0 permite uso comercial, pero la model card advierte de que las cadenas de licencia del codigo original se registran "tal cual" y deben revisarse antes de cualquier otro uso.
- No soporta texto, audio ni tareas de lenguaje; no debe evaluarse como modelo generativo.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/lwdetr
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels para backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original (transformers, commit c4c4605f9618): https://github.com/huggingface/transformers
- Paper LW-DETR: https://arxiv.org/abs/2406.03459
- Pesos large: https://huggingface.co/AnnaZhang/lwdetr_large_60e_coco
- Pesos medium: https://huggingface.co/AnnaZhang/lwdetr_medium_60e_coco
- Pesos small: https://huggingface.co/AnnaZhang/lwdetr_small_60e_coco
- Pesos tiny: https://huggingface.co/AnnaZhang/lwdetr_tiny_60e_coco
- Pesos xlarge: https://huggingface.co/AnnaZhang/lwdetr_xlarge_60e_coco
