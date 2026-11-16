# fastforks/inspyrenet

## Resumen

InSPyReNet es un modelo de segmentación de objetos salientes y matting (extracción de canal alfa) presentado por Kim et al. en ACCV 2022. Este repositorio, `fastforks/inspyrenet`, no aloja pesos propios: es una model card que documenta la integración del modelo original en la librería fastforks, que descarga los checkpoints de los autores y verifica su integridad mediante SHA-256. El modelo resuelve la separación de primer plano y fondo en imágenes RGB, generando una máscara alfa de un solo canal en el rango [0, 1].

La arquitectura se basa en una "pirámide de saliencia inversa": un encoder Swin-B, módulos de contexto de atención piramidal y atención de contexto invariante a escala que reconstruyen el mapa de saliencia a partir de un mapa grueso más residuos laplacianos. Se ofrecen dos variantes: `inspyrenet` (base, entrada de 1024 x 1024) e `inspyrenet-fast` (384 x 384), ambas entrenadas con la mezcla de datos extra de los autores (Plus Ultra).

Su relevancia actual radica en que es el modelo que ejecutan los nodos de InSPyReNet en ComfyUI para eliminación de fondo, y en que fastforks proporciona una implementación portátil con mejoras de rendimiento medibles (hasta 2,2x más rápida y con aproximadamente la mitad de memoria pico que el código original en fp16). La licencia es MIT tanto para el código como para los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin-B encoder + pyramid attention context + scale-invariant context attention (reconstruccion coarse-to-fine con residuos laplacianos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de cualquier H x W >= 32, multiple de 32) |
| Tipos de cuantizacion | fp32 (CPU), fp16 (GPU, por defecto); no se documentan otras |
| Idiomas soportados | no aplica (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT (codigo y pesos) |
| Formato de pesos | `.pth` (checkpoints PyTorch de los autores, descargados externamente) |

## Arquitectura y entrenamiento

InSPyReNet sigue un diseno de deteccion de objetos salientes con piramide de saliencia inversa. Un encoder Swin-B (preentrenado en ImageNet-22k y ajustado en ImageNet-1k) extrae caracteristicas multiescala; sobre ellas actuan modulos de atencion de contexto piramidal y una atencion de contexto invariante a escala. La reconstruccion del mapa de saliencia parte de un mapa grueso al que se suman residuos laplacianos, lo que permite recuperar bordes finos y producir una matte alfa precisa en lugar de una mascara binaria.

El entrenamiento utiliza la mezcla "Plus Ultra" de los autores, que incluye DUTS (TR/TE), HRSOD (TR/TE), UHRSD (TR/TE), DIS5K (TR/VD/TE1-4), DUT-OMRON, ECSSD, HKU-IS, PASCAL-S, DAVIS-S, FSS-1000 y MSRA-10K. Cabe senalar que la mezcla incluye los conjuntos de test de esos datasets, por lo que las metricas sobre ellos no son estrictamente fuera de muestra. No se documenta en la informacion disponible el uso de RLHF/DPO (no aplica a esta tarea) ni el numero exacto de tokens o imagenes de entrenamiento.

La innovacion practica de esta integracion es la implementacion "portable" de fastforks, que reproduce el comportamiento del codigo original con paridad verificada (max |diff| <= 0.002 en CPU fp32; mean |diff| <= 0.02 y p99 <= 0.25 en GPU fp16) y anade soporte para `torch.compile` y TensorRT fp16, con reducciones notables de latencia y memoria.

## Capacidades

- Generacion de mattes alfa (`alpha`) de un solo canal en [0, 1] a partir de una imagen RGB, a la resolucion de entrada.
- Eliminacion de fondo (background removal) y segmentacion dicotomica de imagenes.
- Deteccion de objetos salientes (salient object detection).
- Procesamiento de imagenes de alta y muy alta resolucion: probado hasta 3000 x 4000 en fp16.
- Entrada de cualquier tamano H x W >= 32, con padding automatico a multiplo de 32.
- Soporte de modelos guiados por trimap en la familia original (fondo / desconocido / primer plano), segun la descripcion de la tarea.
- Backend "portable" con soporte de `torch.compile` y exportacion a ONNX/TensorRT fp16.
- No dispone de generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- Eliminacion de fondo en produccion para e-commerce: el modelo genera la matte alfa de fotos de producto a resolucion nativa y permite componer sobre fondos nuevos; la variante `inspyrenet-fast` a 41,7 ms por imagen de 1080x1920 en una RTX 5060 Ti hace viable el procesamiento por lotes.
- Integracion en ComfyUI: es el modelo que ejecutan los nodos de InSPyReNet de ComfyUI, por lo que sirve para flujos de trabajo de edicion de imagen con separacion de sujeto y fondo.
- Procesado de imagen de alta resolucion: con 2,0 GiB de memoria pico en 3000x4000 (variante base, fp16), es adecuado para fotografias de camara sin reescalado previo, preservando detalle en bordes finos como cabello.
- Automatizacion de catalogos y pipelines de assets: la paridad con el codigo original y la exportacion a TensorRT fp16 (51,1 ms por imagen 1080x1920 en la variante base) permiten desplegar el modelo en servicios de inferencia con latencia acotada.
- Preprocesado para otros modelos de vision: la matte alfa puede usarse para aislar sujetos antes de tareas de clasificacion, edicion o sintesis, reduciendo ruido de fondo.
- Edicion y postproduccion de video o imagen fija: la variante rápida (6,99 ms con TensorRT fp16 en 1080x1920) permite procesar secuencias o lotes grandes con requisitos de tiempo real moderados.
- Investigacion en segmentacion: sirve como referencia reproducible para comparar metodos de matting y segmentacion dicotomica, con metricas MAE y max F-beta documentadas sobre DIS-VD.

## Benchmarks y rendimiento

Precision sobre DIS5K validation (DIS-VD, cada segunda imagen, 235 imagenes), MAE / max F-beta (beta^2 = 0.3, 256 umbrales):

| Variante | Original fp32 | Portable |
|---|---|---|
| `inspyrenet` | 0.0129 / 0.9699 | 0.0129 / 0.9699 |
| `inspyrenet-fast` | 0.0420 / 0.8952 | 0.0420 / 0.8952 |

Latencia y memoria en matting sintetico 1080x1920 (RTX 5060 Ti 16 GB, fp16):

| Modelo | Tiempo original | Tiempo portable | Memoria pico original (MiB) | Memoria pico portable (MiB) |
|---|---|---|---|---|
| `inspyrenet` | 241 ms | 109 ms | 3240 / 3262 | 1649 / 1848 |
| `inspyrenet-fast` | 71,1 ms | 41,7 ms | 810 / 836 | 432 / 488 |

Optimizaciones adicionales (1080x1920, `inspyrenet`): 85,8 ms con `torch.compile`, 51,1 ms con TensorRT fp16; `inspyrenet-fast`: 17,7 ms con `torch.compile`, 6,99 ms con TensorRT fp16. El coste de preparacion es de 70,8 s (compile) y 133 s (ONNX + engine) para la variante base.

Carga y primera llamada: `inspyrenet` 0,78 s de carga y 0,62 s de primera llamada (portable); `inspyrenet-fast` 11,07 s y 0,79 s.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6-1,8 GiB pico para `inspyrenet` y 0,4-0,5 GiB para `inspyrenet-fast` en 1080x1920 fp16; hasta 2,0 GiB (2,4 reservados) en 3000x4000 para la variante base.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y suficiente VRAM; los datos de referencia se midieron en una RTX 5060 Ti 16 GB (sm_120). No se documentan pruebas en A100 o H100.
- Cabe en GPU de consumo: si, incluidas tarjetas con 4-8 GB de VRAM para las resoluciones habituales; la variante rápida es especialmente ligera.
- Opciones de despliegue: libreria fastforks (backend portable), `torch.compile`, exportacion ONNX + TensorRT fp16, y el codigo original de `transparent-background`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision de este tipo).
- Latencia y throughput: 109 ms (portable) y 51,1 ms (TensorRT fp16) por imagen 1080x1920 con `inspyrenet`; 41,7 ms y 6,99 ms con `inspyrenet-fast`. El throughput agregado no se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Precision (DIS-VD, MAE / max F-beta) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `inspyrenet` (fastforks) | no disponible | cualquier H x W >= 32 | 0.0129 / 0.9699 | MIT | pesos en releases de los autores; card en HF |
| `inspyrenet-fast` (fastforks) | no disponible | cualquier H x W >= 32 | 0.0420 / 0.8952 | MIT | idem |
| BiRefNet | no disponible en la informacion | no disponible | no disponible (solo se cita su protocolo de evaluacion) | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos comparables; la comparativa se limita a las dos variantes documentadas y a la referencia metodologica a BiRefNet.

## Limitaciones y advertencias

- Las metricas sobre DIS5K y el resto de datasets de la mezcla Plus Ultra no son estrictamente fuera de muestra, ya que la mezcla de entrenamiento incluye sus conjuntos de test; los numeros de benchmark deben interpretarse con cautela.
- Riesgo de errores en bordes finos, estructuras translucidas o sujetos de bajo contraste; la variante rápida presenta una precision notablemente inferior (MAE 0.0420 frente a 0.0129 en DIS-VD).
- No procesa texto ni lenguaje: no tiene capacidades multilingues ni de razonamiento; cualquier uso conversacional queda fuera de su alcance.
- La model card advierte de que el paquete original es de uso de investigacion y recomienda revisar las cadenas de licencia antes de otros usos, pese a que tanto codigo como pesos se declaran MIT.
- Este repositorio no contiene pesos: la disponibilidad depende de los enlaces externos de los autores y de la verificacion SHA-256; una descarga corrupta o no verificada invalida la paridad documentada.
- En GPU fp16 la paridad con el codigo original es aproximada (mean |diff| <= 0.02, p99 <= 0.25), no exacta; para aplicaciones que requieran precision estricta debe usarse CPU fp32.
- La memoria pico depende de la resolucion de entrada; imagenes muy grandes pueden agotar la VRAM en tarjetas de gama baja.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con datasets de saliencia mayoritariamente genericos puede degradarse en dominios muy alejados de la distribucion de entrenamiento.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/inspyrenet
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Codigo original de transparent-background: https://github.com/plemeri/transparent-background
- Repositorio original de InSPyReNet: https://github.com/plemeri/InSPyReNet
- Pesos `ckpt_base.pth`: https://github.com/plemeri/transparent-background/releases/download/1.2.12/ckpt_base.pth
- Pesos `ckpt_fast.pth`: https://github.com/plemeri/transparent-background/releases/download/1.2.12/ckpt_fast.pth
- Release 1.2.12: https://github.com/plemeri/transparent-background/releases/tag/1.2.12
- Documentacion del model zoo: https://github.com/plemeri/InSPyReNet/blob/692ad8a5774cf95ef615a730d5070aad18f6b160/docs/model_zoo.md
- Protocolo de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/matting/models/inspyrenet/card.toml
- Licencia del codigo original: https://github.com/plemeri/transparent-background/blob/f0fa91701a98cfc8e955c554e84522f365ec6da3/LICENSE
