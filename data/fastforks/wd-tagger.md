# fastforks/wd-tagger

## Resumen

WD Tagger v3 es una familia de clasificadores de imágenes especializados en ilustraciones de estilo anime, originalmente publicados por SmilingWolf y empaquetados en este repositorio por fastforks como tarjeta de modelo sin pesos. El modelo resuelve el problema del etiquetado automático multi-etiqueta de imágenes anime: dado un único RGB de 448x448, devuelve logits sobre un vocabulario de 10 861 etiquetas derivadas de Danbooru. Es relevante porque estandariza el acceso a cuatro variantes (ViT, ViT-Large, ConvNeXt y EVA-02-Large) con verificación de integridad mediante SHA-256 y backends optimizados (`portable` y `kernels`).

La arquitectura subyacente no es un transformer generativo, sino una red de clasificación de imagen (timm ViT, ConvNeXt o EVA-02) entrenada de forma supervisada sobre el dataset de Danbooru, con identificadores de imagen hasta 7 220 105. El repositorio de fastforks no aloja pesos: actúa como manifiesto que descarga los ficheros originales del autor y los valida contra hashes conocidos. Está pensado para pipelines de etiquetado, curaduría de datasets y preprocesado en flujos de difusión.

El interés actual reside en su perfil de rendimiento: en una RTX 5060 Ti de 16 GB, la variante ConvNeXt procesa una imagen en 4,46 ms con el backend `kernels` y un pico de 238 MiB, mientras que EVA-02-Large lo hace en 14,1 ms con 673 MiB. La licencia Apache-2.0 permite uso comercial según la evidencia recogida en la propia tarjeta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Familia de clasificadores de imagen: timm ViT, ConvNeXt y EVA-02 (no generativa) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija de 448x448) |
| Tipos de cuantización | fp32 (original), fp16 (portable/kernels); TensorRT fp16 documentado |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (código y pesos de las cuatro variantes) |
| Formato de pesos | safetensors (pesos alojados en los repos del autor SmilingWolf) |

## Arquitectura y entrenamiento

El modelo es un clasificador de imágenes multi-etiqueta, no un modelo de lenguaje. Cada variante emplea un backbone distinto de la librería `timm` (ViT base, ViT-Large, ConvNeXt y EVA-02-Large) con una cabeza de clasificación sobre 10 861 etiquetas. La entrada es fija: se redimensiona el lado corto a 448 píxeles y se aplica un recorte central de 448x448. La salida son logits por etiqueta, que el consumidor debe umbralizar para obtener el conjunto de tags.

El entrenamiento se realizó sobre Danbooru, un corpus de ilustraciones anime con etiquetado comunitario, con identificadores de imagen hasta 7 220 105. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset, ni si hubo fases de RLHF o DPO (no aplicables a un clasificador supervisado). La innovación técnica del empaquetado de fastforks es la verificación de integridad de pesos mediante SHA-256 y la provisión de dos backends: `portable` (ejecución estándar en PyTorch) y `kernels` (kernels optimizados para GPU), con mejoras de velocidad de hasta 2,2x frente al código original en fp32.

## Capacidades

- Clasificación multi-etiqueta de imágenes anime con 10 861 etiquetas derivadas de Danbooru.
- Salida de logits por etiqueta (pipeline `image-classification`), apta para umbralización personalizada.
- Cuatro variantes con distintos equilibrios precisión/velocidad: `wd-vit-tagger-v3`, `wd-vit-large-tagger-v3`, `wd-convnext-tagger-v3` y `wd-eva02-large-tagger-v3`.
- Entrada RGB única de 448x448 con preprocesado fijo (resize de lado corto y recorte central).
- Backends `portable` y `kernels`, con soporte de fp16 y fp32.
- Compatibilidad con `torch.compile` y exportación a TensorRT fp16 (documentada para ConvNeXt y ViT-Large).
- Verificación de integridad de pesos mediante SHA-256 contra los ficheros del autor.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imagen puro.

## Casos de uso

- Etiquetado automático de datasets anime: procesar lotes de ilustraciones y generar tags para entrenamiento de modelos de difusión, usando la variante ConvNeXt por su latencia de 4,46 ms por imagen y bajo consumo de 238 MiB.
- Curaduría y filtrado de corpus: descartar o clasificar imágenes por etiquetas de contenido antes de incorporarlas a un pipeline, aprovechando la salida multi-etiqueta de 10 861 clases.
- Preprocesado en pipelines de generación de imágenes: enriquecer prompts o metadatos a partir de imágenes de referencia, con la variante ViT-Large cuando se requiera mayor capacidad de representación.
- Moderación de contenido en plataformas de arte: detectar etiquetas sensibles o categorías concretas mediante umbralización de logits, con despliegue en GPU de consumo.
- Búsqueda y organización de galerías: indexar imágenes por tags inferidos para habilitar búsqueda por etiqueta en colecciones de ilustración.
- Investigación en visión por computador: usar las cuatro variantes como baseline de clasificación multi-etiqueta en dominios de ilustración, con métricas reproducibles y pesos verificados por hash.
- Despliegue en producción de bajo coste: servir la variante ViT base con 235 MiB de pico en una RTX 5060 Ti, permitiendo múltiples instancias concurrentes en una sola GPU.

## Benchmarks y rendimiento

Los datos disponibles son de latencia y memoria, no de precisión (no se publican métricas como mAP o F1 en la información proporcionada).

| Variante | Entrada | Tiempo original fp32 (ms) | Original fp16 (ms) | Portable (ms) | Kernels (ms) | Pico asignado original (MiB) | Pico asignado kernels (MiB) |
|---|---|---|---|---|---|---|---|
| wd-convnext-tagger-v3 | 448x448 | 15,3 | 9,60 | 5,59 | 4,46 | 259 | 238 |
| wd-eva02-large-tagger-v3 | 448x448 | 84,4 | 26,6 | 18,3 | 14,1 | 668 | 673 |
| wd-vit-large-tagger-v3 | 448x448 | 76,8 | 19,9 | 12,9 | 12,5 | 662 | 667 |
| wd-vit-tagger-v3 | 448x448 | 19,0 | 5,78 | 3,98 | 4,05 | 231 | 234 |

Aceleraciones del backend `kernels` frente al código original: 2,2x en ConvNeXt, 1,9x en EVA-02-Large, 1,6x en ViT-Large y 1,4x en ViT base. Frente a `portable`, la mejora es de 1,3x en ConvNeXt y EVA-02-Large, y de 1,0x en las dos variantes ViT.

Con `torch.compile` y TensorRT fp16 (RTX 5060 Ti 16 GB, sm_120):

| Variante | Portable (ms) | torch.compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Compilación en frío (s) | Build ONNX + engine (s) |
|---|---|---|---|---|---|---|
| wd-convnext-tagger-v3 | 5,59 | 4,45 | 3,10 | 4,46 | 12,2 | 39,7 |
| wd-eva02-large-tagger-v3 | 18,3 | 15,7 | diferido (>5 min) | 14,1 | 22,4 | – |
| wd-vit-large-tagger-v3 | 12,9 | 13,3 | 11,2 | 12,5 | 13,5 | 36,2 |
| wd-vit-tagger-v3 | 3,98 | 5,33 | diferido (>5 min) | 4,05 | 9,55 | – |

No se han publicado resultados de benchmarks de precisión (mAP, F1, precisión por etiqueta) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (fp16, 448x448): 0,2-0,3 GiB en ViT base, 0,3 GiB en ConvNeXt, 0,7 GiB en ViT-Large y 0,7-0,9 GiB en EVA-02-Large.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 1 GB de VRAM libre; los benchmarks se realizaron en una RTX 5060 Ti de 16 GB (sm_120).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, RTX 5060 Ti y similares; también en GPUs de portátil con 4 GB o más.
- Opciones de despliegue: PyTorch con backend `portable` o `kernels`, `torch.compile`, exportación a ONNX y TensorRT fp16. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagen).
- Latencia: 3,98-5,59 ms por imagen en ViT base y ConvNeXt con `portable`; 3,10 ms con TensorRT fp16 en ConvNeXt; 11,2-14,1 ms en las variantes Large.
- Arranque: carga de pesos entre 2,28 s y 5,54 s según variante y backend; primera llamada entre 0,06 s y 0,48 s.
- Throughput estimado: con 4,46 ms por imagen en ConvNeXt con `kernels`, el límite teórico es de unas 224 imágenes por segundo en una sola GPU, sin contar preprocesado ni postprocesado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Etiquetas | Entrada | Licencia | Comercial | Disponibilidad |
|---|---|---|---|---|---|---|
| wd-convnext-tagger-v3 | ConvNeXt | 10 861 | 448x448 | Apache-2.0 | Sí | Pesos en SmilingWolf; manifiesto en fastforks |
| wd-vit-tagger-v3 | ViT | 10 861 | 448x448 | Apache-2.0 | Sí | Pesos en SmilingWolf; manifiesto en fastforks |
| wd-vit-large-tagger-v3 | ViT-Large | 10 861 | 448x448 | Apache-2.0 | Sí | Pesos en SmilingWolf; manifiesto en fastforks |
| wd-eva02-large-tagger-v3 | EVA-02-Large | 10 861 | 448x448 | Apache-2.0 | Sí | Pesos en SmilingWolf; manifiesto en fastforks |

Las cuatro variantes comparten vocabulario y licencia; difieren en backbone, latencia y consumo de memoria. No se dispone de información sobre modelos alternativos de terceros (por ejemplo, otros taggers de anime) en la documentación proporcionada, por lo que la comparativa se limita a las variantes de la propia familia.

## Limitaciones y advertencias

- El repositorio `fastforks/wd-tagger` no contiene pesos: es una tarjeta de modelo que descarga los ficheros del autor y los valida por SHA-256. Sin acceso a los repos de SmilingWolf, el modelo no es utilizable.
- Es un clasificador multi-etiqueta, no un modelo generativo: no produce texto, no razona y no soporta conversación ni tool calling.
- La entrada es fija a 448x448 con recorte central; imágenes con relaciones de aspecto extremas pueden perder información relevante en los bordes.
- El vocabulario de 10 861 etiquetas está sesgado hacia el dominio Danbooru (ilustración anime); el rendimiento fuera de ese dominio no está documentado y probablemente sea deficiente.
- No se publican métricas de precisión (mAP, F1) en la información disponible; la selección de umbrales de decisión queda a cargo del usuario.
- Riesgo de falsos positivos y negativos en etiquetas poco representadas del corpus de entrenamiento; no se documenta el balance de clases.
- La licencia Apache-2.0 se aplica a código y pesos según la evidencia recogida, pero la tarjeta advierte que se trata de un paquete de uso de investigación y recomienda revisar las cadenas de licencia originales antes de cualquier otro uso.
- Los datos de entrenamiento provienen de Danbooru, con etiquetado comunitario; pueden arrastrar sesgos de anotación y convenciones del corpus original.
- El soporte de TensorRT fp16 está diferido para EVA-02-Large y ViT base (build superior a 5 minutos), lo que limita su uso en despliegues con requisitos de arranque rápido.
- No se documentan idiomas soportados porque el modelo no procesa texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/wd-tagger
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Manifiesto de hashes (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/wd_tagger/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos wd-convnext-tagger-v3: https://huggingface.co/SmilingWolf/wd-convnext-tagger-v3
- Pesos wd-eva02-large-tagger-v3: https://huggingface.co/SmilingWolf/wd-eva02-large-tagger-v3
- Pesos wd-vit-large-tagger-v3: https://huggingface.co/SmilingWolf/wd-vit-large-tagger-v3
- Pesos wd-vit-tagger-v3: https://huggingface.co/SmilingWolf/wd-vit-tagger-v3
- Evidencia de licencia: https://huggingface.co/SmilingWolf/wd-vit-tagger-v3/blob/7f6b584d0bd3f55c4531f14ba3d4761b2bccdc0f/README.md
- Código original (pytorch-image-models, commit 0df212b369a5): https://github.com/huggingface/pytorch-image-models
