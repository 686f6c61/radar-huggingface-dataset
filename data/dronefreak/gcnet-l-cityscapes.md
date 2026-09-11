# dronefreak/gcnet-l-cityscapes

## Resumen

gcnet-l-cityscapes es un espejo (mirror) del checkpoint oficial GCNet-L para segmentacion semantica de escenas urbanas en Cityscapes, redistribuido por el usuario dronefreak en HuggingFace. No es un modelo nuevo ni un reentrenamiento: los tensores son identicos a los del fichero publicado por los autores originales de GCNet (Golden Cudgel Network, CVPR 2025) y la unica modificacion es la eliminacion del estado del optimizador y de los buffers de entrenamiento de mmengine, lo que reduce el fichero de 866 MB a unos 426 MB.

El modelo es un segmentador semantico denso de aproximadamente 45,2 M de parametros y 232,0 GFLOPs por imagen, entrenado para asignar una de 19 clases a cada pixel de una escena de calle (carretera, acera, vehiculo, peaton, senalizacion, etc.). El autor declara un mIoU de 79,6 a escala unica sobre la particion de validacion de Cityscapes.

Su relevancia es practica: hasta ahora estos pesos solo estaban accesibles como adjunto de Google Drive, y este espejo permite descargarlos de forma programatica y estable con huggingface_hub, incluye la configuracion de mmsegmentation y publica sumas SHA-256 del fichero replicado y del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Golden Cudgel Network (GCNet), segmentador semantico denso; variante L (CVPR 2025, arXiv:2503.03325) |
| Parametros totales | ~45,2 M |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision; resolucion de entrada 1024x1024 px) |
| Tipos de cuantizacion | no disponible; solo se distribuye el checkpoint en fp32, sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible (modelo de vision; no procesa texto) |
| Licencia | MIT para los pesos; el dataset Cityscapes tiene terminos propios de uso academico/investigacion |
| Formato de pesos | PyTorch `.pth` (checkpoint mmengine/mmsegmentation, fp32); no hay safetensors, GGUF ni ONNX |
| Tarea (pipeline) | image-segmentation (semantic-segmentation) |
| Clases de salida | 19 clases de Cityscapes (trainId 0..18), con paleta incluida en `meta["dataset_meta"]` |
| Computo | 232,0 GFLOPs por imagen |
| Tamano del repositorio | ~0,4 GB (fichero de pesos de ~426 MB) |
| Biblioteca | PyTorch (requiere mmsegmentation vendorizada del repositorio upstream) |
| Entorno de referencia | Python 3.8, PyTorch 1.12.1, mmcv 2.0.0, mmengine 0.10.2 |
| Configuracion de entrenamiento (segun nombre de config) | `gcnet-l_4xb3-120k_cityscapes-1024x1024` (4 GPUs, batch 3 por GPU, 120k iteraciones, 1024x1024) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de publicacion en HuggingFace | 2026-09-10 (actualizado 2026-09-10) |

## Arquitectura y entrenamiento

GCNet (Golden Cudgel Network) es una red convolucional de segmentacion semantica orientada a inferencia en tiempo real, presentada en CVPR 2025 por Guoyu Yang, Yuan Wang, Daming Shi y Yanzhong Wang. La variante L es la de mayor capacidad de la familia, con ~45,2 M de parametros y 232,0 GFLOPs por imagen a 1024x1024, lo que la situa en el rango de los segmentadores densos de precision alta mas que en el de los modelos ultraligeros. La model card no detalla el diseno interno de bloques ni los mecanismos de atencion o fusion multi-escala, por lo que ese detalle debe consultarse en el paper (arXiv:2503.03325).

El checkpoint distribuido aqui es el resultado de un ajuste fino completo sobre Cityscapes para las 19 clases estandar de la benchmark, segun la configuracion `4xb3-120k_cityscapes-1024x1024`. No hay informacion en la model card sobre el numero de tokens o imagenes vistas, la composicion exacta del dataset mas alla de Cityscapes, ni sobre fases de RLHF/DPO (no aplicables a un modelo discriminativo de vision). La innovacion relevante para el usuario final no es arquitectonica sino de distribucion: el espejo elimina el estado del optimizador y los buffers de logging, conserva el `state_dict` en fp32 intacto y mantiene `meta` con la configuracion y los metadatos del dataset para trazabilidad.

## Capacidades

- Segmentacion semantica densa de imagenes RGB de escenas de calle en 19 clases de Cityscapes.
- Salida a resolucion de entrada (mapa `(H, W)` con `trainId` 0..18) y paleta de colores lista para visualizacion.
- Inferencia sobre imagenes sueltas a traves de la API `init_model` / `inference_model` de mmsegmentation.
- Funciona tanto en GPU CUDA como en CPU (con la penalizacion de latencia correspondiente).
- Procesamiento de imagenes de escena urbana de cualquier resolucion, aunque el checkpoint esta entrenado y validado a 1024x1024.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingues, de generacion de texto, de codigo, de matematicas, de vision-lenguaje, de audio ni modo "thinking".
- Capacidad especial: ninguna adicional; destacan la trazabilidad de pesos (SHA-256) y la conservacion de metadatos del dataset en el checkpoint.

## Casos de uso

- Conduccion autonoma y ADAS: el modelo proporciona una segmentacion pixel a pixel de la calzada, los carriles, las aceras y los obstaculos, que puede alimentar modulos de planificacion de trayectoria o de deteccion de superficie transitable en prototipos de percepcion urbana.
- Robotica movil en exteriores: un robot de reparto o de limpieza urbana puede usar la mascara de 19 clases para identificar zonas transitables frente a vegetacion, vallas o mobiliario urbano, integrarlo en su pila ROS mediante un nodo de inferencia mmsegmentation.
- Cartografia y analisis de infraestructura viaria: extraccion automatica de la huella de carreteras y aceras a partir de imagenes de camara para inventarios de via publica o estudios de accesibilidad.
- Auto-etiquetado (pseudo-labeling) de datasets: usar el modelo para preanotar imagenes de escenas urbanas y reducir el coste de anotacion manual antes de un ajuste fino posterior o de la validacion humana.
- Analitica de trafico y videovigilancia urbana: agregacion de superficie ocupada por vehiculos y peatones por fotograma para metricas de ocupacion, siempre que el uso respete los terminos del dataset y la normativa aplicable.
- Investigacion en segmentacion semantica: punto de partida para comparativas, ablaciones o ajuste fino sobre dominios propios (por ejemplo, escenas nocturnas o paises con distinta senalizacion), partiendo de una linea base declarada de 79,6 mIoU.
- Generacion de contenido sintetico y gemelos digitales: conversion de mascaras semanticas en capas editables para reconstruir escenas urbanas en simuladores o entornos 3D.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en el model-index de la model card (metrica marcada como no verificada):

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| image-segmentation | Cityscapes val | validation | mIoU (single-scale) | 79,6 |

No se han publicado en la informacion disponible otros resultados (latencia, FPS, mIoU multi-scale, comparativas por clase) ni mediciones independientes que confirmen la cifra declarada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan unos 181 MB (45,2 M de parametros x 4 bytes); sumando activaciones a 1024x1024, una estimacion orientativa para batch 1 es de 2 a 4 GB de VRAM. Cifra no confirmada por el autor.
- GPU recomendadas: cualquier GPU con >= 4 GB de VRAM para inferencia en fp32 (GTX 1660, RTX 3060, RTX 4090). Para lotes grandes o entrenamiento, A100 o H100; la configuracion original usa 4 GPUs con batch 3 por GPU.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060 de 12 GB o superiores sin problema; tambien funciona en CPU (el ejemplo de la model card contempla `device="cpu"`), con latencia muy superior.
- Opciones de despliegue: mmsegmentation con la copia vendorizada del repositorio upstream (`pip install -v -e .` dentro de `GCNet/mmsegmentation`); la version estandar de `pip install mmsegmentation` no registra GCNet ni GCNetHead. Tambien es desplegable via PyTorch puro una vez cargado el modelo. No hay soporte para vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje ni se distribuye en GGUF.
- Exportacion: no se proporcionan artefactos ONNX, TensorRT ni TorchScript; habria que generarlos por cuenta propia.
- Latencia y throughput: no disponibles. Como referencia de coste computacional, 232,0 GFLOPs por imagen a 1024x1024.

## Comparativa con modelos similares

La informacion proporcionada solo incluye cifras verificables para este checkpoint, por lo que las alternativas se listan sin valores numericos para no introducir datos no contrastados.

| Modelo | Parametros | Entrada | mIoU Cityscapes val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GCNet-L (este espejo) | ~45,2 M | 1024x1024 | 79,6 single-scale (declarado por el autor, no verificado) | MIT (pesos) | HuggingFace (espejo), GitHub upstream y Google Drive |
| Otras variantes de GCNet (S, M) | no disponible en la informacion proporcionada | no disponible | no disponible | MIT (upstream) | Repositorio GitHub gyyang23/GCNet |
| GCNet-L original (upstream) | ~45,2 M | 1024x1024 | 79,6 single-scale | MIT | Google Drive (descarga manual, 866 MB) |
| Otras familias de segmentacion urbana en tiempo real (DDRNet, PIDNet, BiSeNetV2, SegFormer) | no disponible en la informacion proporcionada | no disponible | no disponible | MIT o Apache-2.0 segun variante | Repositorios publicos |

Diferencia practica frente al upstream: mismo modelo y mismos pesos, pero descarga programatica, configuracion incluida, fichero un 51% mas pequeno y verificacion SHA-256.

## Limitaciones y advertencias

- No es un modelo nuevo: es una redistribucion. Cualquier cita o atribucion debe dirigirse a los autores originales de GCNet, no al autor del espejo.
- Dominio restringido: solo ha sido ajustado sobre Cityscapes (escenas urbanas de camara a bordo, principalmente ciudades alemanas y europeas). Es esperable una degradacion notable en interiores, imagenes aereas o de satelite, imagen medica, escenas nocturnas o paises con senalizacion y morfologia vial muy distintas.
- Taxonomia cerrada de 19 clases: no detecta clases fuera de esa lista; cualquier objeto no contemplado se asignara a una clase existente, lo que genera errores sistematicos en dominios nuevos.
- Riesgo de error en pixels: como todo segmentador denso, puede producir confusiones en fronteras (bordes de acera, postes finos, objetos ocluidos) y en condiciones de baja iluminacion o lluvia, sin que exista una senal de confianza calibrada en la salida estandar.
- Metrica no verificada: el valor 79,6 mIoU procede de la model card y esta marcado como `verified: false`; no se aportan resultados por clase ni evaluaciones independientes.
- Restricciones de licencia: los pesos se declaran MIT, pero Cityscapes se distribuye con licencia de uso academico/investigacion y la model card indica que los pesos derivados se redistribuyen bajo esa misma base. Antes de un uso comercial conviene revisar los terminos del dataset con atencion.
- Dependencia de tooling no estandar: requiere la copia vendorizada de mmsegmentation del repositorio upstream y un entorno antiguo (Python 3.8, PyTorch 1.12.1, mmcv 2.0.0, mmengine 0.10.2), lo que complica la integracion en stacks modernos y puede exigir adaptaciones.
- Sin cuantizaciones ni formatos alternativos: no hay versiones int8, fp16 empaquetadas, ONNX, TensorRT ni GGUF; cualquier optimizacion de despliegue hay que hacerla internamente.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, y el repositorio se creo el 2026-09-10, por lo que no hay historial de uso ni garantia de mantenimiento por parte del autor del espejo.
- La busqueda web asociada no devolvio resultados relevantes sobre el modelo (los enlaces recuperados trataban de productos de compression medica y no guardan relacion con GCNet); no se incluyen por no ser pertinentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/gcnet-l-cityscapes
- Repositorio upstream de GCNet: https://github.com/gyyang23/GCNet
- Pesos originales (Google Drive): https://drive.google.com/file/d/1FCQJB0kRni7PoMTkLOjzuPi9KI868XB6/view
- Paper (arXiv:2503.03325): https://arxiv.org/abs/2503.03325
- Dataset Cityscapes: https://www.cityscapes-dataset.com/
- Terminos de licencia de Cityscapes: https://www.cityscapes-dataset.com/license/
- Perfil del autor del espejo: https://huggingface.co/dronefreak
