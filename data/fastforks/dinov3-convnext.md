# fastforks/dinov3-convnext

## Resumen

DINOv3 ConvNeXt es una familia de backbones convolucionales (variantes tiny, small, base y large) desarrollada por Meta en 2025 y destilada del modelo profesor DINOv3 ViT-7B. Resuelve el problema de obtener representaciones visuales densas de alta calidad sin depender de arquitecturas transformer, manteniendo la eficiencia computacional y la capacidad de procesar imagenes de resolucion arbitraria. La relevancia actual radica en que ofrece features densas (grid stride-32) y un token agrupado (pooled) listos para tareas de vision downstream como segmentacion, deteccion o recuperacion, con pesos en formato Hugging Face.

El repositorio `fastforks/dinov3-convnext` no contiene pesos: es una model card de integracion que permite a la libreria `fastforks` descargar los pesos originales de Meta, verificarlos mediante SHA-256 y ejecutarlos con dos backends (`portable` y `kernels`). La tarea declarada es `image-feature-extraction` y el tier es experimental. Los pesos estan sujetos a la DINOv3 License de Meta y requieren aceptar la licencia en la pagina de cada modelo en Hugging Face antes de la descarga.

La informacion disponible no incluye el numero exacto de parametros por variante, la longitud de contexto (no aplica a vision) ni resultados de benchmarks estandar, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (CNN) destilada de DINOv3 ViT-7B; features densas stride-32 + pooled token |
| Parametros totales | no disponible (variantes tiny, small, base y large; cifras no publicadas en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada H x W >= 1, redimensionada o con padding interno) |
| Tipos de cuantizacion | fp32 (original) y fp16 (probado en RTX 5060 Ti 16 GB); no se documentan otras |
| Idiomas soportados | no disponible (no aplica, modelo de vision) |
| Licencia | DINOv3 License (LicenseRef-DINOv3-License); uso comercial permitido segun la tabla de variantes, con atribucion y condiciones |
| Formato de pesos | safetensors (`model.safetensors`); pesos alojados por Meta, no en este repo |
| Salidas | `last_hidden_state`, `pooler_output` |
| Backends | `portable`, `kernels` |
| Libreria | fastforks (integracion); codigo original en transformers v5.19.0 |

## Arquitectura y entrenamiento

La familia DINOv3 ConvNeXt emplea una arquitectura convolucional ConvNeXt en cuatro escalas (tiny, small, base, large), destilada del profesor DINOv3 ViT-7B. El entrenamiento es auto-supervisado sobre LVD-1689M, un conjunto de 1.689 millones de imagenes curadas a partir de imagenes publicas de Instagram, segun el paper de DINOv3. Los datos de entrenamiento no se distribuyen publicamente. La destilacion transfiere las representaciones del ViT-7B a un backbone convolucional, lo que permite obtener features densas con stride-32 y un token agrupado para clasificacion o recuperacion.

La innovacion principal es la combinacion de la calidad de representacion de un profesor ViT de 7B con la eficiencia de una CNN, incluyendo soporte para resoluciones de entrada arbitrarias (probado hasta 3000x4000 en fp16 con una RTX 5060 Ti de 16 GB). La integracion `fastforks` anade dos backends: `portable` (compatible con PyTorch estandar) y `kernels` (kernels optimizados alojados en `fastforks/kernels`), con verificacion SHA-256 de los pesos descargados.

## Capacidades

- Extraccion de features visuales densas (grid de parches con stride-32) a partir de una imagen RGB.
- Extraccion de un vector global de imagen (`pooler_output`) para tareas de clasificacion o recuperacion.
- Procesamiento de imagenes de resolucion arbitraria (cualquier H x W >= 1), con redimensionado o padding interno.
- Ejecucion en fp32 y fp16; probado en GPU consumer (RTX 5060 Ti 16 GB) hasta 3000x4000.
- Dos backends de ejecucion: `portable` y `kernels` con aceleracion de 1,5x a 3,2x frente al codigo original.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues (es un modelo puramente visual).
- No se documentan capacidades de vision-language, audio ni thinking mode.

## Casos de uso

- Segmentacion semantica y de instancias: las features densas stride-32 sirven como backbone para cabezas de segmentacion en pipelines de vision por computador, aprovechando la resolucion arbitraria de entrada.
- Deteccion de objetos: el `last_hidden_state` alimenta detectores tipo DETR o cabezas convolucionales, con buena relacion calidad/coste frente a backbones ViT equivalentes.
- Recuperacion de imagenes (image retrieval): el `pooler_output` actua como embedding global para busqueda por similitud en catalogos o sistemas de recomendacion visual.
- Clasificacion de imagenes a escala: el vector agrupado permite entrenar clasificadores lineales o pocas capas sobre features congeladas, reduciendo coste de entrenamiento.
- Preprocesado en pipelines de datos visuales: extraccion de embeddings para deduplicacion, clustering o filtrado de datasets de imagenes de gran tamano.
- Analisis de imagenes de alta resolucion: procesa entradas de hasta 12 MP (4000x3000) en 190-587 ms segun variante, util en inspeccion industrial o teledeteccion.
- Prototipado en GPU consumer: las variantes tiny y small caben en GPUs de gama media (menos de 200 MiB de memoria pico a 224x224) para experimentacion rapida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, ImageNet top-1, etc.) en la informacion disponible. La model card si incluye mediciones de velocidad y memoria:

| Modelo | Tiempo 224x224 (ms, kernels) | Aceleracion vs original | Memoria pico 224x224 (MiB, kernels) | 1920x1080 (ms, kernels) | 12 MP (ms, kernels) |
|---|---|---|---|---|---|
| dinov3-convnext-base | 2,326 | 3,2x | 200 / 240 | 33,5 | 190,9 |
| dinov3-convnext-large | 3,587 | 2,7x | 441 / 498 | no disponible | no disponible |
| dinov3-convnext-small | 2,046 | 2,9x | 127 / 176 | no disponible | no disponible |
| dinov3-convnext-tiny | 1,234 | 2,4x | 86 / 136 | no disponible | no disponible |

Mediciones en RTX 5060 Ti 16 GB, fp16, con entradas sinteticas. Para `base` en modo `portable`: 8,3 ms a 640x480, 22,8 ms a 1280x720, 55,2 ms a 1920x1080 y 323,2 ms a 12 MP.

## Requisitos de hardware

- VRAM estimada: menos de 250 MiB pico a 224x224 en variante base (kernels); hasta 3,4-4,0 GiB reservados en variante large a 12 MP (portable).
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GiB para resoluciones moderadas; RTX 5060 Ti 16 GB validada oficialmente hasta 3000x4000 en fp16.
- Cabe en GPU consumer: si, todas las variantes; tiny y small con margen amplio en GPUs de 4-8 GiB.
- Despliegue: libreria `fastforks` con backends `portable` y `kernels`; el codigo original esta en transformers v5.19.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un extractor de features).
- Latencia: 1,2-3,6 ms por imagen 224x224 en modo kernels; 190-587 ms por imagen de 12 MP segun variante.
- Arranque: carga de pesos entre 0,08 y 0,38 s en modo kernels.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Licencia | Uso comercial |
|---|---|---|---|---|---|
| DINOv3 ConvNeXt (esta ficha) | ConvNeXt destilado de ViT-7B | no disponible | H x W arbitraria | DINOv3 License | Si, con condiciones |
| DINOv3 ViT-7B (profesor) | ViT | 7B | parches fijos | DINOv3 License | Si, con condiciones |
| DINOv2 (Meta, 2023) | ViT | 86M-1,1B | 518x518 tipico | Apache 2.0 / variantes | Si |
| CLIP ViT (OpenAI) | ViT + texto | 86M-632M | 224x224 | MIT (variantes) | Si |

La comparacion cuantitativa de rendimiento frente a DINOv2 o CLIP no esta disponible en la informacion proporcionada. La ventaja declarada de DINOv3 ConvNeXt es la eficiencia de una CNN con la calidad de representacion del profesor ViT-7B y el soporte de resolucion arbitraria.

## Limitaciones y advertencias

- Los pesos son gated: requieren aceptar la DINOv3 License en la pagina de cada modelo de Meta antes de descargarlos manualmente; `fastforks` no envia el token de Hugging Face.
- La licencia DINOv3 impone atribucion y condiciones; debe revisarse antes de cualquier uso comercial, aunque la tabla indique uso comercial permitido.
- El repositorio es solo una model card: no contiene pesos y depende de la libreria `fastforks` (tier experimental) para funcionar.
- Modelo puramente visual: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de sesgo heredado de LVD-1689M (imagenes publicas de Instagram), con posible infrarrepresentacion de ciertas categorias y sesgos geograficos o culturales.
- No se documentan evaluaciones de robustez, calibracion ni alucinacion (no aplica generacion, pero si posibles errores en features).
- Los datos de entrenamiento no se distribuyen y las cifras de parametros por variante no estan publicadas en la informacion disponible.
- El rendimiento medido corresponde a una unica GPU (RTX 5060 Ti 16 GB) y entradas sinteticas; puede variar en otros hardware y con imagenes reales.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/dinov3-convnext
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Codigo original (transformers v5.19.0): https://github.com/huggingface/transformers
- Pesos dinov3-convnext-tiny: https://huggingface.co/facebook/dinov3-convnext-tiny-pretrain-lvd1689m
- Pesos dinov3-convnext-small: https://huggingface.co/facebook/dinov3-convnext-small-pretrain-lvd1689m
- Pesos dinov3-convnext-base: https://huggingface.co/facebook/dinov3-convnext-base-pretrain-lvd1689m
- Pesos dinov3-convnext-large: https://huggingface.co/facebook/dinov3-convnext-large-pretrain-lvd1689m
- Licencia DINOv3: https://huggingface.co/facebook/dinov3-convnext-tiny-pretrain-lvd1689m/blob/10d30274b4d445111e2d5bf75ac93bbd94db274b/LICENSE.md
- Hashes SHA-256 completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/features/models/dinov3_convnext/card.toml
