# fastforks/starnet

## Resumen

StarNet es una familia de clasificadores convolucionales de imagen de pequeno tamano que introduce la denominada "star operation": en cada bloque se generan dos ramas que se combinan mediante una multiplicacion elemento a elemento, lo que incrementa la profundidad efectiva de la red sin anadir sesgos no lineales adicionales. El diseno procede del trabajo de Ma et al. (2024), "Rewrite the Stars", y se distribuye en cuatro variantes de escala (s1, s2, s3 y s4) entrenadas sobre ImageNet-1k.

El repositorio `fastforks/starnet` no aloja pesos: es una model card que define como descargar los checkpoints originales publicados por el equipo de `timm` y verificar su integridad mediante SHA-256. La implementacion la proporciona la libreria `fastforks`, con dos backends de ejecucion (`portable` y `kernels`), este ultimo con kernels CUDA especificos que aceleran la inferencia entre 5 y 7 veces respecto a la implementacion original.

Es relevante para desarrolladores que necesitan un clasificador de imagenes de muy bajo coste computacional (menos de 100 MiB de memoria pico y latencias por debajo del milisegundo con TensorRT o los kernels optimizados), con licencia Apache-2.0 en pesos y codigo, y con un pipeline de validacion reproducible de los checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con bloques de "star operation" (dos ramas multiplicadas elemento a elemento) |
| Parametros totales | no disponible (cuatro variantes: s1, s2, s3, s4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen, entrada fija 224x224) |
| Tipos de cuantizacion | fp32 y fp16 documentados; no se detallan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de vision; etiquetas ImageNet-1k en ingles) |
| Licencia | Apache-2.0 (codigo y pesos) |
| Formato de pesos | safetensors (checkpoints originales de `timm`) |

## Arquitectura y entrenamiento

StarNet es una red neuronal convolucional en la que cada bloque combina dos ramas mediante una multiplicacion elemento a elemento (la "star operation"). Este esquema permite aumentar la profundidad efectiva del modelo sin recurrir a funciones de activacion adicionales ni a conexiones residuales complejas, manteniendo un coste computacional bajo. El modelo opera sobre una unica imagen RGB con entrada fija de 224x224: se redimensiona el lado corto a 256 y se aplica un recorte central a 224x224.

El entrenamiento se realizo sobre ImageNet-1k (ILSVRC 2012, clasificacion), segun indica la model card. No se detalla en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste fino adicionales (RLHF, DPO u otras, que no aplican a un clasificador de vision). La innovacion tecnica destacable del ecosistema `fastforks` es la implementacion de kernels CUDA propios para el backend `kernels`, que reducen el tiempo de inferencia hasta 7,5 veces respecto al codigo original en fp32 y entre 5,2 y 6,2 veces respecto al backend `portable` en fp16.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1k, con salida de logits por clase.
- Entrada de una unica imagen RGB a resolucion fija 224x224 (redimensionado y recorte central).
- Ejecucion en dos backends: `portable` (PyTorch estandar) y `kernels` (kernels CUDA optimizados).
- Compatibilidad con `torch.compile` y exportacion a ONNX/TensorRT para despliegue de baja latencia.
- Verificacion de integridad de pesos mediante SHA-256 en el momento de la descarga.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un clasificador de vision.

## Casos de uso

- Clasificacion de imagenes en produccion de alto volumen: con latencias de 0,578 a 0,912 ms por imagen usando el backend `kernels` en una RTX 5060 Ti, el modelo puede procesar miles de imagenes por segundo en una sola GPU consumer, adecuado para pipelines de etiquetado masivo.
- Prefiltrado en sistemas de moderacion de contenido: la clasificacion en 1000 clases de ImageNet permite descartar o etiquetar categorias genericas (animales, objetos, escenas) antes de pasar a modelos mas costosos.
- Extraccion de caracteristicas para busqueda visual: los logits o representaciones intermedias sirven como descriptor compacto para indexar y recuperar imagenes similares en catalogos.
- Clasificacion en dispositivos de borde: el consumo de memoria pico (41 a 51 MiB asignados en fp16) y el tamano reducido de los checkpoints permiten desplegar el modelo en GPUs de gama baja o entornos embebidos con CUDA.
- Benchmarking de infraestructura de inferencia: las cuatro variantes y los tres modos de ejecucion (original, portable, kernels) proporcionan una referencia reproducible para medir el rendimiento de nuevas GPUs o runtimes.
- Prototipado rapido de pipelines de vision: la carga en 1,6 a 2,2 segundos y la primera llamada en 0,05 a 0,24 segundos permiten iterar rapidamente en cuadernos y scripts de experimentacion.
- Validacion de integridad de modelos en entornos regulados: el mecanismo de verificacion SHA-256 de los pesos descargados facilita la trazabilidad en despliegues con requisitos de auditoria.

## Benchmarks y rendimiento

Precision en ImageNet-1k val (5000 imagenes aleatorias, top-1 / top-5 %):

| Variante | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|
| `starnet_s1.in1k` | 74,50 / 91,94 | 74,50 / 91,96 | 74,48 / 91,92 | 74,52 / 91,92 |
| `starnet_s2.in1k` | no disponible (dato truncado en la fuente) | no disponible | no disponible | no disponible |
| `starnet_s3.in1k` | no disponible | no disponible | no disponible | no disponible |
| `starnet_s4.in1k` | no disponible | no disponible | no disponible | no disponible |

Tiempo de inferencia y memoria pico (entrada 224x224, RTX 5060 Ti 16 GB, sm_120):

| Variante | Original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico asignada (MiB): original / portable / kernels |
|---|---|---|---|---|---|---|
| `starnet_s1.in1k` | 4,57 | 7,29 | 3,88 | 0,683 | 6,7x | 51 / 41 / 41 |
| `starnet_s2.in1k` | 3,64 | 5,63 | 3,02 | 0,578 | 6,3x | 55 / 43 / 43 |
| `starnet_s3.in1k` | 4,96 | 7,67 | 4,19 | 0,715 | 6,9x | 67 / 47 / 47 |
| `starnet_s4.in1k` | 6,84 | 11,3 | 5,63 | 0,912 | 7,5x | 77 / 50 / 51 |

Rendimiento con `torch.compile` y TensorRT fp16:

| Variante | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Preparacion compile (s) | Construccion ONNX + engine (s) |
|---|---|---|---|---|---|---|
| `starnet_s1.in1k` | 3,88 | 2,41 | 0,774 | 0,683 | 6,23 | 24,4 |
| `starnet_s2.in1k` | 3,02 | 1,96 | 0,622 | 0,578 | 5,71 | 24,7 |
| `starnet_s3.in1k` | 4,19 | 2,60 | 0,878 | 0,715 | 6,03 | 27,5 |
| `starnet_s4.in1k` | 5,63 | 3,37 | 1,18 | 0,912 | 6,84 | 28,0 |

## Requisitos de hardware

- VRAM estimada: menos de 100 MiB de memoria pico reservada en fp16 para todas las variantes (41 a 51 MiB asignados, 52 a 72 MiB reservados con el backend `kernels`).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; los benchmarks se realizaron en una RTX 5060 Ti 16 GB (sm_120). Para TensorRT se recomienda una GPU con soporte de tensor cores para fp16.
- Cabe en cualquier GPU consumer moderna, incluidas las de gama de entrada con al menos 1 GB de VRAM; no requiere GPU de centro de datos (A100, H100) para inferencia.
- Opciones de despliegue: libreria `fastforks` (backends `portable` y `kernels`), PyTorch con `torch.compile`, exportacion a ONNX y TensorRT. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia: 0,578 a 0,912 ms por imagen con `kernels`; 0,622 a 1,18 ms con TensorRT fp16; 1,96 a 3,37 ms con `torch.compile`; 3,02 a 5,63 ms en el backend `portable` en fp16.
- Arranque: carga de 1,60 a 2,20 segundos con `fastforks`, frente a 0,17 a 0,30 segundos con el codigo original; primera llamada de 0,05 a 0,24 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision ImageNet-1k top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StarNet (s1-s4) | no disponible | 224x224 fijo | 74,50 % (s1) | Apache-2.0 | pesos en `timm`, card en `fastforks` |
| Otros clasificadores pequenos de ImageNet-1k | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni especificaciones de modelos alternativos comparables, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo solo clasifica en las 1000 clases de ImageNet-1k; no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Entrada fija de 224x224: no soporta resoluciones arbitrarias ni imagenes de mayor resolucion sin redimensionado y recorte previos, lo que puede degradar la precision en objetos pequenos.
- Riesgo de sesgo heredado de ImageNet-1k: la distribucion de clases y las anotaciones del dataset original pueden introducir sesgos geograficos y culturales en las predicciones.
- Riesgo de alucinacion en sentido estricto no aplica, pero el modelo siempre asigna una de las 1000 clases aunque la imagen no corresponda a ninguna, sin mecanismo nativo de rechazo o umbral de confianza.
- No se documentan idiomas ni capacidades multilingues; las etiquetas estan en ingles.
- Licencia Apache-2.0 en codigo y pesos segun la model card, con uso comercial permitido; no obstante, la propia card advierte que el paquete es de uso de investigacion y recomienda revisar las cadenas de licencia antes de otros usos.
- El repositorio no aloja pesos: la disponibilidad depende de los repositorios de `timm` y de la verificacion SHA-256; cualquier cambio en esos repositorios puede romper la descarga.
- Precision top-1 de la variante s1 en torno al 74,5 %, inferior a la de clasificadores de mayor tamano; para tareas de alta exigencia puede ser insuficiente.
- No se publican datos de precision para las variantes s2, s3 y s4 en la informacion disponible.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/starnet
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original (pytorch-image-models, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Pesos `starnet_s1.in1k`: https://huggingface.co/timm/starnet_s1.in1k
- Pesos `starnet_s2.in1k`: https://huggingface.co/timm/starnet_s2.in1k
- Pesos `starnet_s3.in1k`: https://huggingface.co/timm/starnet_s3.in1k
- Pesos `starnet_s4.in1k`: https://huggingface.co/timm/starnet_s4.in1k
- Definicion de variantes y hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/starnet/card.toml
- Protocolo de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Evidencia de licencia: https://huggingface.co/timm/starnet_s1.in1k/blob/e3fbe6d1e24b6293fa6e7b897f380bd62f77e01f/README.md
