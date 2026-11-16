# fastforks/nsfw-vit

## Resumen

`fastforks/nsfw-vit` es un paquete de inferencia (model card sin pesos propios) que distribuye y valida los pesos del detector de contenido NSFW de Falconsai, un ViT-B/16 preentrenado en ImageNet-21k y afinado sobre aproximadamente 80 000 imagenes etiquetadas como `normal` o `nsfw`. El repositorio pertenece al proyecto fastforks, una herramienta de empaquetado de modelos que descarga los pesos originales del autor, verifica su integridad mediante SHA-256 y ofrece backends de ejecucion optimizados (`portable` y `kernels`).

El modelo resuelve una tarea acotada de clasificacion binaria de imagenes: determinar si una imagen contiene contenido para adultos. Su relevancia practica esta en el rendimiento: sobre una RTX 5060 Ti 16 GB, el backend `kernels` ejecuta una inferencia de 224x224 en 1,61 ms (3,6x mas rapido que el codigo original en fp32 y 1,8x que el backend portable), con un pico de memoria de aproximadamente 198 MiB. Es, por tanto, un componente adecuado para moderacion de contenido a gran escala en pipelines de servidor.

Arquitectura transformer de vision (ViT-B/16) con entrada fija de 224x224, salida de logits sobre dos clases. El repositorio no aloja pesos: es una ficha de catalogo que apunta a los ficheros del autor original y documenta los kernels CUDA propios de fastforks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/16 (ImageNet-21k pretrained) |
| Parametros totales | no disponible (ViT-B/16, orden de ~86 M, no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen; entrada fija 224x224) |
| Tipos de cuantizacion | fp32 y fp16 documentados; no se mencionan int8 ni int4 |
| Idiomas soportados | no disponible (tarea de vision, sin componente textual) |
| Licencia | Apache-2.0 (codigo y pesos del autor) |
| Formato de pesos | safetensors (fichero `model.safetensors` del autor, SHA-256 `97b2ce64ec14...`) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de tamano base con parches de 16x16 (ViT-B/16), preentrenado en ImageNet-21k/ImageNet-22k (release completo de ImageNet de otono de 2011) y posteriormente afinado para clasificacion binaria `normal` / `nsfw`. El conjunto de afinado es propiedad de Falconsai y consta de aproximadamente 80 000 imagenes. El preprocesado replica el del procesador original: la imagen se redimensiona por el lado corto a 224 y se recorta al centro, con una variante que estira la imagen a 224x224 sin preservar la relacion de aspecto (documentada como limitacion).

La contribucion tecnica del repositorio no esta en el entrenamiento sino en la infraestructura de inferencia. fastforks implementa kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que aceleran las operaciones del ViT, y valida la paridad numerica frente al codigo original fijado en el commit `96cb0d0342c7`: en CPU float32 la diferencia maxima absoluta es menor o igual a 1e-05; en GPU float16 la diferencia media es menor o igual a 0,009 y el p99 menor o igual a 0,011 sobre los logits. No se documenta RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision.

## Capacidades

- Clasificacion de imagenes en dos clases: `normal` y `nsfw`.
- Salida de logits crudos y utilidad `top(k)` para obtener las k clases mas probables.
- Entrada de una unica imagen RGB a resolucion fija 224x224.
- Ejecucion en CPU (float32) y GPU (float16 por defecto).
- Dos backends: `portable` (PyTorch) y `kernels` (kernels CUDA propios de fastforks), con seleccion automatica mediante `mode="auto"`.
- Verificacion de integridad de pesos por SHA-256 antes de la carga.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador visual.

## Casos de uso

- Moderacion de contenido en plataformas de subida de imagenes: el modelo clasifica cada imagen en 1,61 ms con el backend `kernels`, lo que permite filtrar lotes de decenas de miles de imagenes por hora en una sola GPU consumer.
- Pre-filtro en pipelines de curacion de datasets: descartar automaticamente imagenes NSFW antes de entrenar modelos generativos o de vision, reduciendo el coste de revision manual.
- Moderacion en tiempo real de chats y foros: con un pico de memoria de ~198 MiB y primera llamada de 0,09 s, el modelo puede convivir con otros servicios en la misma GPU.
- Pasarela de seguridad en APIs de generacion de imagenes: comprobar la salida del generador antes de devolverla al usuario, con latencia despreciable frente al coste de la generacion.
- Auditoria de contenido en repositorios y almacenamiento en la nube: clasificacion por lotes de bibliotecas de imagenes existentes para cumplir politicas de contenido.
- Sistemas de control parental o filtrado en el dispositivo: el modelo cabe en GPUs de gama media y su version portable permite despliegues en servidores modestos.
- Investigacion sobre sesgos en detectores NSFW: al ser un paquete reproducible con verificacion de hashes y paridad numerica documentada, facilita la replicacion de experimentos.

## Benchmarks y rendimiento

Rendimiento de inferencia sintetica sobre RTX 5060 Ti 16 GB (sm_120), entrada 224x224:

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Aceleracion kernels vs portable | Memoria pico portable (MiB, alloc/reserved) | Memoria pico kernels (MiB, alloc/reserved) |
|---|---|---|---|---|---|---|---|---|
| `falconsai-nsfw-vit` | 6,76 | 5,74 | 2,83 | 1,61 | 3,6x | 1,8x | 201 / 226 | 198 / 228 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `falconsai-nsfw-vit` | 2,95 | 2,63 | 2,42 | 0,27 | 0,09 | 0,09 |

Comparativa con `torch.compile` y TensorRT:

| Modelo | Portable (ms) | torch.compile | TensorRT fp16 (ms) | Kernels (ms) | Preparacion compile | Construccion ONNX + engine | Memoria pico TensorRT (MiB, alloc/reserved) |
|---|---|---|---|---|---|---|---|
| `falconsai-nsfw-vit` | 2,83 | diferido (build > 5 min) | 1,12 | 1,61 | – | 27,4 s | 393 / 420 |

No se han publicado resultados de benchmarks de precision (accuracy, F1, AUC) en la informacion disponible. Solo se documenta la paridad numerica con el codigo original: en CPU float32, diferencia maxima absoluta menor o igual a 1e-05; en GPU float16, diferencia media menor o igual a 0,009 y p99 menor o igual a 0,011 sobre los logits.

## Requisitos de hardware

- VRAM estimada: aproximadamente 200 MiB de memoria pico del allocator de PyTorch en fp16 (198-201 MiB asignados, 226-228 MiB reservados).
- GPU probada: RTX 5060 Ti 16 GB (sm_120). El backend `kernels` requiere una arquitectura de GPU con kernel precompilado descargado desde `fastforks/kernels` y un driver NVIDIA reciente; si no existe, lanza `BackendUnavailableError` sin fallback silencioso.
- Cabe holgadamente en cualquier GPU consumer con al menos 1 GB de VRAM; tambien funciona en CPU en float32.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`), con backends `portable` (PyTorch) y `kernels` (CUDA propio). Tambien es posible usar los pesos originales con la libreria `transformers` de Hugging Face, aunque la model card solo documenta la via fastforks.
- Latencia: 1,61 ms por imagen con `kernels`, 2,83 ms con `portable`, 1,12 ms con TensorRT fp16. Carga del modelo entre 2,42 y 2,95 s; primera llamada de 0,09 s (portable/kernels) o 0,27 s (original).
- Throughput estimado: no disponible de forma explicita; a partir de la latencia, el orden de magnitud es de varios cientos de imagenes por segundo por GPU con `kernels` en regimen por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fastforks/nsfw-vit` (este) | ViT-B/16 (no confirmado) | 224x224 fija | Clasificacion NSFW binaria | Apache-2.0 | Hugging Face (ficha) + pesos del autor |
| `Falconsai/nsfw_image_detection` | ViT-B/16 | 224x224 fija | Clasificacion NSFW binaria | Apache-2.0 | Hugging Face (pesos originales) |
| Otros detectores NSFW de la familia ViT/ResNet | no disponible | variable | Clasificacion NSFW | variable | no disponible |

La unica comparacion documentada con datos es frente al codigo original de Falconsai, que es el mismo modelo: fastforks anade aceleracion (3,6x en `kernels` frente a fp32 original) y verificacion de integridad, sin cambiar los pesos ni la precision del clasificador. No se dispone de datos de benchmarks frente a otros detectores NSFW alternativos.

## Limitaciones y advertencias

- El modelo no aloja pesos: depende de la disponibilidad de los ficheros en el repositorio del autor original y de la verificacion SHA-256; si el autor elimina o modifica los pesos, la carga falla.
- La imagen se estira a 224x224 sin preservar la relacion de aspecto (comportamiento heredado del procesador original), lo que puede degradar la clasificacion en imagenes muy alargadas.
- Es un clasificador binario: no distingue categorias dentro de NSFW ni ofrece puntuaciones calibradas mas alla de los logits.
- Riesgo de falsos positivos y negativos inherente a un detector entrenado sobre un dataset propietario de ~80 000 imagenes; no se publican metricas de precision, recall ni AUC en la informacion disponible.
- Sesgos potenciales no documentados: la composicion del dataset de afinado no es publica, por lo que no se puede evaluar su representatividad demografica ni cultural.
- La licencia Apache-2.0 se aplica a codigo y pesos segun la evidencia enlazada, pero la model card advierte que es un paquete de uso de investigacion y recomienda revisar las cadenas de licencia originales antes de otros usos.
- El backend `kernels` requiere arquitectura de GPU soportada y driver NVIDIA reciente; en caso contrario hay que usar `portable`, con menor rendimiento.
- El repositorio esta marcado como `not-for-all-audiences` por la naturaleza del contenido que procesa.
- No apto para tareas de generacion, razonamiento ni procesamiento de texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/nsfw-vit
- Modelo original: https://huggingface.co/Falconsai/nsfw_image_detection
- Commit fijado del original: https://huggingface.co/Falconsai/nsfw_image_detection/tree/96cb0d0342c7
- Pesos originales (safetensors): https://huggingface.co/Falconsai/nsfw_image_detection/resolve/96cb0d0342c7afb80cab76ecc58b265fa44da256/model.safetensors
- Codigo fastforks: https://github.com/kleinicke/fastforks
- Kernels precompilados: https://huggingface.co/fastforks/kernels
- Ficha de catalogo (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/nsfw_vit/card.toml
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
