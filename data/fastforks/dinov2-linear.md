# fastforks/dinov2-linear

## Resumen

DINOv2 linear (fastforks) es una implementación de inferencia para segmentación semántica basada en el backbone auto-supervisado DINOv2 de Meta AI (Oquab et al., 2023). El repositorio `fastforks/dinov2-linear` no aloja pesos: es una model card que describe cómo el paquete `fastforks` descarga los pesos originales del autor desde los enlaces oficiales de Meta y los valida mediante SHA-256. La tarea es segmentación semántica sobre ADE20K (150 clases) usando una sonda lineal (batch norm + clasificador 1x1) sobre los tokens de parche del último bloque del ViT congelado.

El modelo resuelve el problema de desplegar segmentación semántica de alta calidad sin reentrenar el backbone: se congela el ViT de DINOv2 y solo se entrena una cabeza lineal sobre las características. fastforks añade una capa de ingeniería orientada a producción: dos backends (`portable` en PyTorch puro y `kernels` con kernels CUDA optimizados), verificación de integridad de pesos, inferencia por ventana deslizante y soporte para resoluciones arbitrarias (cualquier H x W >= 1, redimensionado o padding interno).

Está disponible en tres variantes (ViT-S/14, ViT-B/14 y ViT-L/14), todas con licencia Apache-2.0 y uso comercial permitido. La relevancia actual reside en que ofrece una alternativa reproducible y verificable a los pipelines de segmentación propietarios, con benchmarks de latencia y memoria medidos en una RTX 5060 Ti de 16 GB y paridad numérica documentada frente al código original de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (DINOv2) congelado + batch norm + clasificador lineal 1x1 sobre tokens de parche del ultimo bloque |
| Parametros totales | no disponible (depende de la variante: ViT-S/14, ViT-B/14, ViT-L/14) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (vision; entrada de cualquier H x W >= 1) |
| Tipos de cuantizacion | fp32 y fp16 (portable y kernels); no se documentan otras |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (codigo y pesos de las tres variantes; uso comercial permitido) |
| Formato de pesos | `.pth` (PyTorch) descargados desde los enlaces oficiales de Meta; el repo no aloja pesos |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer (ViT) de DINOv2 con parches de 14x14, congelado, seguido de una capa de normalizacion por lotes y un clasificador lineal 1x1 que opera sobre los tokens de parche del ultimo bloque. La inferencia se realiza mediante ventana deslizante para cubrir imagenes de resolucion arbitraria. El backbone se entreno de forma auto-supervisada (self-distillation con teacher-student, sin etiquetas) sobre LVD-142M, un conjunto curado de imagenes web que Meta no ha liberado publicamente.

La cabeza lineal se entreno de forma supervisada sobre ADE20K (SceneParsing, 150 clases), manteniendo el backbone congelado. No se documenta en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion, algo esperable en un modelo de vision. La innovacion tecnica destacable de este repositorio no esta en el modelo en si, sino en la infraestructura de despliegue: backend `kernels` con kernels CUDA propios que logran entre 1,5x y 2,0x de aceleracion frente al codigo original, verificacion SHA-256 de los pesos descargados y paridad numerica documentada (max |diff| <= 0,002 en CPU fp32; media <= 0,05 px y p99 <= 0,25 px en GPU fp16).

## Capacidades

- Segmentacion semantica densa por pixel sobre 150 clases de ADE20K (salida de logits por pixel).
- Procesamiento de imagenes RGB de resolucion arbitraria (cualquier H x W >= 1, con redimensionado o padding interno).
- Tres variantes de capacidad: ViT-S/14 (la mas rapida), ViT-B/14 (equilibrada) y ViT-L/14 (la mas precisa, aunque no se publican metricas de mIoU en la informacion disponible).
- Dos backends de ejecucion: `portable` (PyTorch puro, GPU o CPU) y `kernels` (kernels CUDA optimizados para sm_120).
- Soporte de fp16 por defecto en GPU y fp32 en CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.
- No dispone de modo thinking, vision generativa, audio ni generacion de texto.

## Casos de uso

- Segmentacion de imagenes en pipelines de vision por computador: el modelo devuelve logits por pixel listos para `argmax`, integrables en etapas posteriores de un pipeline (deteccion, tracking, analisis de escenas) sin necesidad de reentrenar el backbone.
- Procesamiento de imagenes de alta resolucion: gracias al soporte de cualquier H x W y a la ventana deslizante, se pueden segmentar fotografias de 3000x4000 (12 MP) con picos de memoria de 7,2-7,7 GiB en fp16, util para teledeteccion, inspeccion industrial o imagen medica de gran tamano.
- Prototipado rapido de segmentacion semantica: la carga de pesos en 0,23-0,99 s y la primera llamada en 0,06-0,20 s permiten iterar rapidamente en notebooks o scripts de investigacion.
- Despliegue en hardware de consumo: la variante ViT-S/14 procesa 640x480 en 11,5 ms con 796 MiB de memoria pico en el backend `kernels`, lo que la hace viable en GPUs de gama media para aplicaciones en tiempo real.
- Evaluacion comparativa de backbones auto-supervisados: al mantener paridad numerica con el codigo original de Meta, sirve como referencia reproducible para comparar DINOv2 con otros backbones (CLIP, SAM, etc.) en tareas de segmentacion.
- Integracion en sistemas de anotacion asistida: la salida de logits por pixel y 150 clases de ADE20K permite pre-anotar escenas urbanas e interiores para revision humana, reduciendo el coste de etiquetado.

## Benchmarks y rendimiento

La model card no publica metricas de calidad (mIoU) sobre ADE20K. Los datos disponibles son de latencia, memoria y paridad numerica.

Segmentacion sintetica 1024x2048 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico portable (MiB alloc/res) | Memoria pico kernels (MiB alloc/res) |
|---|---|---|---|---|---|---|---|
| dinov2-s-linear-ade20k | 55,83 | 24,66 | 18,59 | 12,44 | 2,0x | 783 / 956 | 645 / 676 |
| dinov2-b-linear-ade20k | 115,19 | 40,15 | 33,51 | 22,63 | 1,8x | 906 / 1144 | 771 / 904 |
| dinov2-l-linear-ade20k | 332,04 | 95,67 | 84,11 | 56,78 | 1,7x | 1322 / 1364 | 1189 / 1244 |

Latencia y memoria a resoluciones fijas (tiempo ms / alloc MiB / reserved MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| dinov2-s-linear-ade20k | portable | 12,6 / 792 / 834 | 20,1 / 1088 / 1154 | 25,1 / 1101 / 1168 | 141,7 / 1160 / 1522 |
| dinov2-s-linear-ade20k | kernels | 11,5 / 796 / 854 | 18,5 / 1092 / 1168 | 23,5 / 1105 / 1174 | 140,4 / 1163 / 1774 |
| dinov2-b-linear-ade20k | portable | 22,5 / 922 / 1040 | 35,5 / 1217 / 1398 | 40,0 / 1230 / 1416 | 151,7 / 1289 / 1960 |
| dinov2-b-linear-ade20k | kernels | 18,3 / 929 / 1080 | 28,4 / 1224 / 1438 | 34,1 / 1237 / 1456 | 147,9 / 1296 / 2000 |
| dinov2-l-linear-ade20k | portable | 56,5 / 1330 / 1524 | 86,3 / 1624 / 1876 | 91,1 / 1638 / 1890 | 184,9 / 1697 / 2266 |
| dinov2-l-linear-ade20k | kernels | 39,6 / 1338 / 1526 | 62,8 / 1632 / 1884 | 67,7 / 1645 / 1894 | 168,5 / 1704 / 2264 |

Paridad con el codigo original: en CPU float32, max |diff| <= 0,002; en GPU float16, media <= 0,05 px y p99 <= 0,25 px.

## Requisitos de hardware

- VRAM estimada: la variante ViT-S/14 necesita en torno a 0,8 GiB de memoria pico a 640x480 y hasta 1,2 GiB a 12 MP (portable); ViT-B/14 entre 0,9 y 1,3 GiB; ViT-L/14 entre 1,3 y 1,7 GiB. En imagenes de 3000x4000 probadas en fp16 se alcanzan 7,2-7,7 GiB pico asignados.
- GPU recomendadas: los benchmarks se midieron en una RTX 5060 Ti de 16 GB (sm_120). Cualquier GPU NVIDIA con soporte CUDA y al menos 2-8 GiB de VRAM puede ejecutar las variantes S y B; ViT-L/14 conviene en GPUs de 8 GiB o mas para resoluciones altas.
- Cabe en GPU de consumo: si, incluso en GPUs de gama media para las variantes S y B a resoluciones habituales (640x480 a 1920x1080).
- Opciones de despliegue: paquete `fastforks` (backends `portable` y `kernels`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de vision y no de lenguaje.
- Latencia y throughput: en `kernels` sobre RTX 5060 Ti, ViT-S/14 procesa 640x480 en 11,5 ms (unos 87 FPS teoricos) y 1920x1080 en 23,5 ms; ViT-B/14 en 18,3 ms y 34,1 ms respectivamente; ViT-L/14 en 39,6 ms y 67,7 ms. A 12 MP, las latencias suben a 140-168 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastforks/dinov2-linear (ViT-S/B/L) | no disponible (ViT-S/B/L) | cualquier H x W >= 1 | Segmentacion semantica (ADE20K, 150 clases) | Apache-2.0 | Pesos en dl.fbaipublicfiles.com; codigo en GitHub |
| DINOv2 original (facebookresearch) | ViT-S/14: 21M; ViT-B/14: 86M; ViT-L/14: 300M (cifras publicas de DINOv2) | 518x518 tipico (parches 14x14) | Backbone auto-supervisado + cabezas de tarea | Apache-2.0 | GitHub y pesos oficiales |
| SAM (Segment Anything) | no disponible | 1024x1024 tipico | Segmentacion promptable (no semantica) | Apache-2.0 | Pesos publicos |

La comparativa con otros modelos de segmentacion semantica (por ejemplo, SegFormer o Mask2Former) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No se publican metricas de calidad (mIoU) en la model card; no es posible evaluar la precision real frente a alternativas sin ejecutar el modelo.
- El repositorio no aloja pesos: depende de la disponibilidad de los enlaces de Meta (dl.fbaipublicfiles.com) y de la verificacion SHA-256 para garantizar integridad.
- La model card advierte que el paquete original es de "research-use" y que deben revisarse las cadenas de licencia antes de cualquier otro uso, aunque la licencia declarada es Apache-2.0 con uso comercial permitido.
- Riesgo de sesgo: el backbone se entreno sobre LVD-142M, un conjunto de imagenes web curado por Meta y no liberado, por lo que pueden existir sesgos de dominio y geograficos no documentados.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir segmentaciones erroneas en clases no representadas en ADE20K (solo 150 clases) o en dominios muy distintos al de entrenamiento.
- Limitacion de idioma: no aplica (modelo de vision sin procesamiento de lenguaje).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card recomienda verificar las cadenas de licencia del codigo original de Meta antes de produccion.
- Los benchmarks se midieron unicamente en una RTX 5060 Ti de 16 GB (sm_120); el rendimiento en otras GPU puede diferir.
- El backend `kernels` esta optimizado para sm_120; en arquitecturas anteriores puede no ofrecer las mismas aceleraciones.

## Enlaces

- HuggingFace: https://huggingface.co/fastforks/dinov2-linear
- Repositorio de codigo fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original de DINOv2 (commit 7764ea0f912e): https://github.com/facebookresearch/dinov2
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/segmentation/models/dinov2_linear/card.toml
- Evidencia de licencia: https://github.com/facebookresearch/dinov2/blob/7764ea0f912e53c92e82eb78a2a1631e92725fc8/README.md#L660
- Pesos ViT-S/14 backbone: https://dl.fbaipublicfiles.com/dinov2/dinov2_vits14/dinov2_vits14_pretrain.pth
- Pesos ViT-S/14 cabeza ADE20K: https://dl.fbaipublicfiles.com/dinov2/dinov2_vits14/dinov2_vits14_ade20k_linear_head.pth
- Pesos ViT-B/14 backbone: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitb14/dinov2_vitb14_pretrain.pth
- Pesos ViT-B/14 cabeza ADE20K: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitb14/dinov2_vitb14_ade20k_linear_head.pth
- Pesos ViT-L/14 backbone: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitl14/dinov2_vitl14_pretrain.pth
- Pesos ViT-L/14 cabeza ADE20K: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitl14/dinov2_vitl14_ade20k_linear_head.pth
