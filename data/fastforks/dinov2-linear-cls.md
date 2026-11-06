# fastforks/dinov2-linear-cls

## Resumen

`fastforks/dinov2-linear-cls` es un paquete de inferencia publicado por el proyecto fastforks que envuelve el clasificador lineal oficial de DINOv2 sobre el backbone ViT-L/14 (Oquab et al., 2023). No es un modelo nuevo: es una receta reproducible que descarga los pesos originales del autor (timm para el backbone y Meta AI para la cabeza lineal ImageNet-1k), los verifica por SHA-256 y los ejecuta con dos backends optimizados (`portable` en PyTorch y `kernels` con CUDA propio). El repositorio de Hugging Face contiene unicamente la model card y el manifiesto `card.toml`; no aloja pesos.

El modelo resuelve una tarea concreta: clasificacion de imagen en las 1000 clases de ImageNet-1k a resolucion fija de 224x224, a partir de la concatenacion del token `[CLS]` y la media de los tokens de parche. Es relevante para desarrolladores que necesitan un clasificador de referencia con paridad numerica verificada frente al codigo original, y para quienes quieren medir el coste real de un ViT-L/14 en GPUs de consumo (RTX 5060 Ti 16 GB en los benchmarks publicados).

La arquitectura subyacente es un Vision Transformer de 24 capas con parches de 14x14 y 304 millones de parametros, preentrenado por DINOv2 con auto-supervision sobre LVD-142M y ajustado con una cabeza lineal sobre ImageNet-1k. La licencia del codigo y de los pesos es Apache-2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/14), 24 capas, patch size 14, preentrenado con DINOv2 |
| Parametros totales | no disponible en la informacion proporcionada (ViT-L/14 de DINOv2, ~304 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de una imagen 224x224; 256 parches + token CLS) |
| Tipos de cuantizacion | fp32 y fp16 soportados por los backends; no se documentan GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible (tarea de vision; las etiquetas de salida son clases ImageNet-1k en ingles) |
| Licencia | Apache-2.0 (codigo y pesos) |
| Formato de pesos | safetensors (backbone, `vit_large_patch14_dinov2.lvd142m.safetensors`) y `.pth` (cabeza lineal, `dinov2_vitl14_linear_head.pth`) |

## Arquitectura y entrenamiento

El backbone es un ViT-L/14 de DINOv2: transformer de 24 capas con atencion global, normalizacion LayerNorm y embeddings de parche de 14x14, que produce un token `[CLS]` y un conjunto de tokens de parche. La clasificacion se hace con una cabeza lineal oficial sobre la concatenacion `[CLS; mean(patch tokens)]`, ajustada sobre ImageNet-1k (ILSVRC 2012). El preentrenamiento es auto-supervisado (DINOv2, sin etiquetas) sobre LVD-142M, un conjunto curado de imagenes web que no se distribuye publicamente.

El paquete fastforks no reentrena ni modifica los pesos: descarga los ficheros del autor y valida su SHA-256 contra el manifiesto. La innovacion tecnica esta en la capa de ejecucion: un backend `portable` en PyTorch (fp16 por defecto en GPU) y un backend `kernels` con kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) compilados por arquitectura de GPU y descargados bajo demanda. La paridad numerica se verifica contra salidas doradas del codigo original: en CPU float32, diferencia maxima absoluta <= 0.002; en GPU float16, diferencia media <= 0.02 px y p99 <= 0.08 px.

## Capacidades

- Clasificacion de imagen en ImageNet-1k: devuelve logits sobre 1000 clases y permite obtener el top-k.
- Entrada fija de una imagen RGB a 224x224 (redimensionado con lado corto 256 y recorte central).
- Ejecucion en GPU (CUDA) o CPU mediante el backend `portable`; backend `kernels` solo en GPU NVIDIA con driver reciente y binario precompilado para la arquitectura.
- Seleccion automatica de backend con `mode="auto"`, que elige `kernels` cuando puede ejecutarse y registra la decision; si no hay kernel disponible lanza `BackendUnavailableError` sin fallback silencioso.
- Salida tipada con `result.top(5)` y metadatos de ejecucion (`result.backend`, con modo, dispositivo y dtype).
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision generativa, audio ni modo thinking: es exclusivamente un clasificador de imagenes.

## Casos de uso

- Etiquetado automatico de catalogos de imagen: clasificar lotes de fotos de producto en las 1000 categorias de ImageNet-1k como paso de enriquecimiento previo a un sistema de busqueda; el modelo ofrece una referencia estable con paridad numerica verificada.
- Moderacion y triaje visual: descartar o priorizar imagenes por clase (por ejemplo, contenido potencialmente sensible) antes de un revisor humano, usando el top-k de logits como senal de confianza.
- Benchmark de hardware para vision: medir latencia y memoria real de un ViT-L/14 en una GPU concreta con los backends `portable` y `kernels`, comparando con las cifras publicadas (5,4 ms y 5,2 ms a 224x224 en RTX 5060 Ti).
- Extraccion de caracteristicas para pipelines de vision: usar el backbone DINOv2 ViT-L/14 como encoder congelado y la cabeza lineal como sonda de validacion de que la integracion reproduce el comportamiento del autor.
- Control de calidad de modelos destilados o cuantizados: emplear este paquete como oraculo de referencia (diferencia maxima 0.002 en CPU fp32) para validar variantes propias antes de desplegarlas.
- Prototipado rapido en investigacion: cargar el clasificador con `pip install fastforks` y una sola llamada `classification.load("dinov2_vitl14_lc")`, sin gestionar manualmente dos ficheros de pesos de origenes distintos.
- Verificacion de integridad de artefactos: usar la comprobacion SHA-256 del manifiesto en pipelines de CI para detectar pesos corruptos o sustituidos.

## Benchmarks y rendimiento

Clasificacion sintetica a 224x224 en RTX 5060 Ti 16 GB (sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico asignada/reservada original (MiB) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `dinov2_vitl14_lc` | 22,41 | 10,81 | 5,43 | 5,24 | 2,1x | 1782 / 1806 | 623 / 1228 | 889 / 1296 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Portable (s) | Kernels (s) | Primera llamada original (s) | Portable (s) | Kernels (s) |
|---|---|---|---|---|---|---|
| `dinov2_vitl14_lc` | 5,80 | 3,34 | 2,38 | 0,32 | 0,02 | 0,01 |

Tamano fijo, todos los modos (tiempo ms / memoria pico asignada / reservada en MiB):

| Modelo | Modo | 224x224 |
|---|---|---|
| `dinov2_vitl14_lc` | portable | 5,4 ms / 625 / 724 |
| `dinov2_vitl14_lc` | kernels | 5,2 ms / 897 / 1040 |

No se han publicado resultados de benchmarks de precision (top-1, top-5) en la informacion disponible. Las cifras anteriores son de latencia y memoria, no de calidad de clasificacion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6 GiB de memoria pico asignada en fp16 con el backend `portable` (0,7 GiB reservada) para una imagen a 224x224; con `kernels`, 0,9 GiB asignada y 1,0 GiB reservada.
- GPU de referencia de los benchmarks: NVIDIA RTX 5060 Ti 16 GB (sm_120). El backend `kernels` requiere un binario precompilado para la arquitectura concreta de la GPU y un driver NVIDIA reciente.
- Cabe en GPUs de consumo: si, con margen amplio; el cuello de botella es la arquitectura del kernel, no la VRAM.
- Despliegue: paquete `fastforks` (instalacion via `pip install fastforks`), con backend `portable` en PyTorch o `kernels` en CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de este tipo.
- Latencia: 5,4 ms por imagen en `portable` y 5,2 ms en `kernels` a 224x224 en la GPU de referencia; primera llamada de 0,02 s y 0,01 s respectivamente. No se publica throughput agregado por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fastforks/dinov2-linear-cls` (ViT-L/14 + cabeza lineal) | ~304 M (no confirmado en la ficha) | Imagen fija 224x224 | Clasificacion ImageNet-1k | Apache-2.0 | Pesos en timm y Meta; paquete en fastforks |
| `timm/vit_large_patch14_dinov2.lvd142m` | ~304 M (no confirmado en la ficha) | Imagen, resolucion configurable | Backbone auto-supervisado (sin cabeza) | Apache-2.0 | Hugging Face (timm) |
| DINOv2 ViT-B/14 + cabeza lineal | no disponible | Imagen fija 224x224 | Clasificacion ImageNet-1k | Apache-2.0 | Pesos en Meta AI |
| CLIP ViT-L/14 | no disponible | Imagen + texto | Clasificacion zero-shot y retrieval | Licencia propia de OpenAI | Pesos en OpenAI |

La comparativa se limita a lo verificable en la informacion proporcionada: no hay datos de precision top-1 ni de latencia de los modelos alternativos en esta ficha, por lo que no se puede establecer una comparacion de rendimiento cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos: depende de la disponibilidad continuada de los enlaces de timm y de `dl.fbaipublicfiles.com`; si cambian, la carga falla.
- El backend `kernels` solo funciona en GPUs NVIDIA con binario precompilado para su arquitectura; en otras configuraciones lanza `BackendUnavailableError` y no hay fallback silencioso.
- Entrada fija a 224x224: no admite resoluciones mayores ni variables, lo que descarta su uso en tareas que requieran detalle fino (documentos, imagen medica, teledeteccion).
- Salida limitada a las 1000 clases de ImageNet-1k: no es un clasificador abierto ni zero-shot; las clases fuera de ese vocabulario se mapean a la clase mas cercana con posible error.
- Riesgo de sesgo: el backbone se preentreno sobre LVD-142M (imagenes web curadas) y la cabeza sobre ImageNet-1k; ambos conjuntos tienen sesgos demograficos y geograficos conocidos que se transfieren a las predicciones.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si de sobreconfianza: los logits no calibrados pueden asignar probabilidad alta a clases incorrectas en dominios alejados de ImageNet.
- La model card advierte que el paquete es de uso en investigacion y recomienda revisar las cadenas de licencia antes de cualquier otro uso, pese a que la licencia declarada es Apache-2.0 y permite uso comercial.
- No hay informacion sobre calibracion, robustez ante corrupciones ni comportamiento en dominios distintos de ImageNet.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni soporte documentado mas alla de la model card y el repositorio de GitHub.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/dinov2-linear-cls
- Repositorio de codigo fastforks: https://github.com/kleinicke/fastforks
- Manifiesto de la variante (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/dinov2_linear_cls/card.toml
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Kernels CUDA para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Pesos del backbone (timm): https://huggingface.co/timm/vit_large_patch14_dinov2.lvd142m
- Evidencia de licencia del backbone: https://huggingface.co/timm/vit_large_patch14_dinov2.lvd142m/blob/4741e1cafbf45415e77074bb0cb42dba76c8684a/README.md
- Pesos de la cabeza lineal (Meta AI): https://dl.fbaipublicfiles.com/dinov2/dinov2_vitl14/dinov2_vitl14_linear_head.pth
- Codigo original (pytorch-image-models, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
