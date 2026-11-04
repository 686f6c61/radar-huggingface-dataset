# fastforks/dinov3

## Resumen

DINOv3 es una familia de backbones ViT (Vision Transformer) auto-supervisados publicados por Meta en 2025. A diferencia de los modelos generativos, DINOv3 no produce texto ni imagenes: extrae representaciones visuales densas (features por parche) y una representacion global (pooled) de una imagen de entrada, pensadas para servir como backbone en tareas downstream de vision por computador. La innovacion principal es el uso de 4 register tokens y RoPE (rotary position embeddings), que permiten procesar imagenes de cualquier resolucion H x W >= 1 sin reentrenar el modelo.

El repositorio `fastforks/dinov3` no aloja pesos: es una model card que documenta la integracion de los checkpoints oficiales de Meta (ViT-S/16, ViT-B/16, ViT-L/16 y ViT-H/16+) en la libreria `fastforks`, con verificacion SHA-256 de los ficheros descargados. La libreria ofrece dos backends (`portable` y `kernels`) con optimizaciones de velocidad y memoria, y esta pensada para inferencia en CUDA con PyTorch.

Es relevante ahora porque los pesos de DINOv3 estan gated en Hugging Face (requieren aceptar la licencia DINOv3) y este repositorio facilita el flujo de descarga y validacion, ademas de documentar cifras concretas de latencia y memoria en GPU consumer (RTX 5060 Ti 16 GB) para las cuatro variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) auto-supervisado con 4 register tokens y RoPE |
| Parametros totales | no disponible (variantes ViT-S/16, ViT-B/16, ViT-L/16, ViT-H/16+) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen de cualquier H x W >= 1; probado hasta 3000x4000) |
| Tipos de cuantizacion | no disponible (la model card documenta fp16 y fp32; no se listan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | DINOv3 License (LicenseRef-DINOv3-License); uso comercial permitido segun la tabla de variantes, con condiciones de atribucion |
| Formato de pesos | safetensors (model.safetensors, verificado por SHA-256) |

## Arquitectura y entrenamiento

DINOv3 emplea una arquitectura transformer de vision (ViT) entrenada de forma auto-supervisada, sin etiquetas. Segun la model card, el entrenamiento usa LVD-1689M: 1.689 millones de imagenes curadas a partir de 17.000 millones de imagenes publicas de Instagram mediante recuperacion y clustering. El dataset no se ha publicado. La innovacion arquitectonica destacable es la incorporacion de 4 register tokens (tokens auxiliares que absorben artefactos de atencion global) y RoPE para posiciones, lo que permite obtener features densas por parche y features globales a cualquier resolucion de entrada sin redimensionar a un tamano fijo.

La libreria `fastforks` proporciona dos backends de inferencia: `portable` (implementacion generica) y `kernels` (kernels optimizados publicados en `fastforks/kernels`). El codigo original referenciado es Hugging Face Transformers en la version `v5.19.0`. No se documentan detalles sobre RLHF, DPO ni fases de alineacion, ya que no es un modelo generativo.

## Capacidades

- Extraccion de features densas por parche (`last_hidden_state`) y feature global pooled (`pooler_output`) a partir de una imagen RGB.
- Procesamiento de imagenes de cualquier resolucion H x W >= 1, con redimensionado o padding interno.
- Salida de estados ocultos intermedios (`hidden_states`) para analisis por capas.
- Backbone reutilizable para tareas downstream: clasificacion, segmentacion, deteccion, retrieval visual, depth estimation, etc. (las tareas concretas dependen del cabezal que se anada).
- Ejecucion en CUDA con PyTorch; backends `portable` y `kernels`.
- Verificacion de integridad de pesos mediante SHA-256 en la carga.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un extractor de features visuales.

## Casos de uso

- Busqueda visual y retrieval de imagenes: usar `pooler_output` como embedding global para indexar un catalogo y recuperar imagenes similares por similitud coseno; el modelo procesa resoluciones altas (hasta 12 MP probados) sin reentrenar.
- Segmentacion semantica y de instancias: alimentar `last_hidden_state` (features por parche) a un cabezal ligero de segmentacion; la naturaleza densa de las features y la resolucion variable son adecuadas para mascaras de alta resolucion.
- Clasificacion de imagenes con pocas etiquetas: congelar el backbone y entrenar una regresion logistica o un MLP sobre `pooler_output`, aprovechando la calidad de las representaciones auto-supervisadas.
- Deteccion de objetos y seguimiento: usar las features por parche como entrada a cabezales tipo DETR o como extractor en pipelines de tracking, beneficiandose de la latencia baja (5,3 ms a 640x480 con `kernels` en ViT-B/16).
- Control de calidad industrial: inspeccion visual de defectos en imagenes de alta resolucion (12 MP en ~1,3 s con ViT-B/16 y backend `kernels`), comparando embeddings contra una referencia.
- Preprocesado para modelos multimodales: servir como vision encoder en pipelines VLM, sustituyendo encoders CLIP cuando se necesita resolucion nativa y features densas.
- Analisis de imagenes medicas o satelitales: la capacidad de procesar resoluciones arbitrarias sin recorte fijo permite trabajar con tiles grandes manteniendo coherencia espacial mediante RoPE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (ImageNet, ADE20K, COCO, etc.) en la informacion disponible. La model card si documenta mediciones de latencia y memoria en una RTX 5060 Ti 16 GB (fp16), que se resumen a continuacion.

Features sinteticas a 224x224:

| Modelo | Tiempo original fp32 (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico portable (MiB) |
|---|---|---|---|---|---|
| dinov3-vitb16 | 6,95 | 4,863 | 1,404 | 5,0x | 201 / 206 |
| dinov3-vith16plus | 48,04 | 13,341 | 9,301 | 2,8x | 1645 / 1668 |
| dinov3-vitl16 | 19,17 | 9,134 | 3,279 | 5,4x | 617 / 646 |
| dinov3-vits16 | 6,47 | 4,671 | 0,903 | 7,2x | 77 / 80 |

Rendimiento a resoluciones fijas (backend `kernels`, tiempo / memoria pico allocated / reserved en MiB):

| Modelo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|
| dinov3-vitb16 | 5,3 ms / 233 / 326 | 19,4 ms / 297 / 324 | 64,4 ms / 424 / 462 | 1322,5 ms / 1515 / 1702 |
| dinov3-vith16plus | 38,6 ms / 1690 / 1786 | 138,3 ms / 1789 / 1806 | 393,4 ms / 1984 / 2024 | 6021,9 ms / 3643 / 3804 |

## Requisitos de hardware

- VRAM estimada: ViT-S/16 ~77 MiB pico (224x224, portable); ViT-B/16 ~201 MiB; ViT-L/16 ~617 MiB; ViT-H/16+ ~1.645 MiB. A 12 MP, ViT-B/16 alcanza ~1,5 GiB y ViT-H/16+ ~3,7 GiB.
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GB para ViT-S/B a resoluciones moderadas; 8 GB o mas para ViT-H/16+ a alta resolucion. Probado en RTX 5060 Ti 16 GB.
- Cabe en GPU consumer: si, todas las variantes a 224x224 y a 1080p; ViT-H/16+ a 12 MP requiere ~4 GiB reservados.
- Opciones de despliegue: libreria `fastforks` (backends `portable` y `kernels`) sobre PyTorch/CUDA; los pesos son compatibles con el formato de Hugging Face Transformers v5.19.0. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision de este tipo).
- Latencia: desde 0,9 ms (ViT-S/16, 224x224, kernels) hasta 6,0 s (ViT-H/16+, 12 MP, kernels). Carga del modelo entre 0,06 s (ViT-S/16, kernels) y 1,40 s (ViT-H/16+, kernels).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| DINOv3 ViT-S/16 (este) | no disponible | cualquier H x W; probado 3000x4000 | DINOv3 License (comercial con condiciones) | gated en HF, via fastforks |
| DINOv3 ViT-B/16 (este) | no disponible | cualquier H x W; probado 3000x4000 | DINOv3 License | gated en HF, via fastforks |
| DINOv3 ViT-L/16 (este) | no disponible | cualquier H x W; probado 3000x4000 | DINOv3 License | gated en HF, via fastforks |
| DINOv3 ViT-H/16+ (este) | no disponible | cualquier H x W; probado 3000x4000 | DINOv3 License | gated en HF, via fastforks |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos (CLIP, SigLIP, DINOv2) en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Los pesos estan gated en Hugging Face: es necesario aceptar la licencia DINOv3 en cada repositorio oficial de Meta antes de descargarlos; `fastforks` no envia el token de HF, hay que descargar `model.safetensors` manualmente y colocarlo en `FASTFORKS_WEIGHTS_PATH`.
- Licencia DINOv3: permite uso comercial segun la tabla de variantes, pero impone condiciones de atribucion; es imprescindible leer `LICENSE.md` antes de cualquier despliegue en produccion.
- El dataset de entrenamiento (LVD-1689M) no se ha publicado, lo que limita la auditabilidad de sesgos y la reproducibilidad.
- Al ser un extractor de features y no un modelo generativo, no produce texto ni respuestas; cualquier tarea downstream requiere un cabezal o pipeline adicional.
- Riesgo de sesgos heredados de imagenes de Instagram (composicion demografica y geografica sesgada), no cuantificado en la informacion disponible.
- El rendimiento a resoluciones muy altas degrada el throughput: ViT-H/16+ tarda ~6 s por imagen a 12 MP, lo que puede ser limitante en pipelines de tiempo real.
- La model card no documenta cuantizaciones (GGUF, AWQ, GPTQ), por lo que el despliegue en CPU o en GPUs con poca VRAM no esta cubierto por la documentacion.
- Los benchmarks de calidad (precision en tareas downstream) no estan publicados en la informacion disponible; las cifras de la model card son solo de latencia y memoria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/dinov3
- Codigo de la libreria fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Pesos oficiales ViT-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Pesos oficiales ViT-H/16+: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Pesos oficiales ViT-L/16: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Pesos oficiales ViT-S/16: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Licencia DINOv3: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m/blob/114c1379950215c8b35dfcd4e90a5c251dde0d32/LICENSE.md
- Codigo original (Transformers v5.19.0): https://github.com/huggingface/transformers
- Hashes completos (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/features/models/dinov3/card.toml
