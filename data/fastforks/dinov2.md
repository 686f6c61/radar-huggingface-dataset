# fastforks/dinov2

## Resumen

DINOv2 es una familia de backbones de visión basados en Vision Transformer (ViT) entrenados de forma auto-supervisada por Meta AI (Oquab et al., 2023). El repositorio `fastforks/dinov2` no contiene pesos propios: actúa como model card de referencia que permite a la librería `fastforks` descargar los pesos originales de Meta desde sus enlaces oficiales y verificar su integridad mediante SHA-256. Está diseñado para extracción de características de imagen (`image-feature-extraction`), produciendo tanto características densas por parche como una característica global agrupada de la imagen.

El modelo resuelve el problema de obtener representaciones visuales genéricas de alta calidad sin necesidad de etiquetas, útiles como backbone para tareas downstream (clasificación, segmentación, detección, recuperación de imágenes). La familia incluye cuatro tamaños de ViT (S, B, L, G) con parche de 14x14, y cada uno en dos variantes: la original y la variante con 4 tokens de registro (`-reg`), que mejora la estabilidad del mapa de atención. La entrada admite cualquier resolución H x W mayor o igual a 1, redimensionada o rellenada internamente.

La relevancia actual del repositorio radica en su enfoque de empaquetado: separa la definición del modelo (card.toml con hashes) de los pesos, ofreciendo dos backends de ejecución (`portable` y `kernels`) con aceleraciones medidas de hasta 3,9x frente a la implementación original en fp32. La licencia Apache-2.0 de código y pesos permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) auto-supervisado, parche 14x14 |
| Parámetros totales | no disponible (variantes ViT-S, ViT-B, ViT-L, ViT-G) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de cualquier H x W >= 1 |
| Tipos de cuantización | fp32 (original), fp16 (probado en portable y kernels) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `.pth` (PyTorch, enlaces oficiales de Meta; no alojados en el repo) |

## Arquitectura y entrenamiento

DINOv2 emplea una arquitectura de Vision Transformer con parches de 14x14 píxeles. El entrenamiento es auto-supervisado, sin etiquetas, combinando objetivos de destilación (DINO) y pérdidas de tipo iBOT, junto con técnicas de regularización como el centrado y la asignación de prototipos. La variante `-reg` añade 4 tokens de registro al token CLS y a los tokens de parche, lo que reduce artefactos en los mapas de atención y mejora la calidad de las características densas. El modelo produce tres salidas: `last_hidden_state` (características por parche), `pooler_output` (característica global) y `hidden_states` (estados intermedios).

Los datos de entrenamiento corresponden a LVD-142M: 142 millones de imágenes recuperadas de rastreos web por similitud con conjuntos curados (ImageNet-22k/1k train, Google Landmarks y conjuntos de grano fino), según el paper original. El dataset no se ha publicado. El repositorio `fastforks/dinov2` no aporta información adicional sobre número de tokens de entrenamiento, composición exacta ni fases de RLHF/DPO (no aplicables a un modelo de visión auto-supervisado). La innovación técnica destacable del empaquetado es la verificación por SHA-256 de los pesos descargados y la existencia de dos backends: `portable` (implementación estándar) y `kernels` (kernels optimizados alojados en `fastforks/kernels`), con aceleraciones medidas de hasta 3,9x en `dinov2-vits14` frente a la implementación original en fp32.

## Capacidades

- Extracción de características de imagen: genera características densas por parche (`last_hidden_state`) y una característica global agrupada (`pooler_output`).
- Soporte de cualquier resolución de entrada: H x W >= 1, con redimensionado o relleno interno; probado hasta 3000x4000 en todas las variantes.
- Backbone para tareas downstream: clasificación, segmentación semántica, detección, estimación de profundidad y recuperación de imágenes por similitud.
- Variantes con tokens de registro (`-reg`) para mapas de atención más estables.
- Ejecución en CUDA con PyTorch; backends `portable` y `kernels`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Recuperación de imágenes por similitud: usar `pooler_output` como embedding global para indexar un catálogo y buscar imágenes visualmente parecidas mediante distancia coseno; la característica global es estable y no requiere etiquetas.
- Segmentación semántica con cabezal ligero: congelar el backbone y entrenar un decodificador sobre `last_hidden_state` para segmentar imágenes médicas o satelitales con pocos datos anotados.
- Clasificación de imágenes con pocas muestras: extraer características con `dinov2-vitl14-reg` y entrenar un clasificador lineal o kNN sobre ellas, útil cuando no hay suficientes datos para fine-tuning completo.
- Detección de duplicados y near-duplicates: comparar embeddings globales de imágenes de un catálogo de e-commerce para eliminar duplicados y agrupar productos similares.
- Control de calidad visual en producción: procesar imágenes de alta resolución (hasta 12 MP) con `dinov2-vitb14` en modo `kernels` (2,1 s por imagen de 4000x3000) para detectar defectos o anomalías mediante comparación con embeddings de referencia.
- Preprocesamiento para pipelines multimodales: generar características visuales densas que alimenten modelos de visión-lenguaje o sistemas de búsqueda multimodal, gracias a la salida por parche y a la resolución flexible.
- Indexación de vídeo por fotograma: extraer características de fotogramas clave con `dinov2-vits14` (0,85 ms por imagen 224x224 en modo `kernels`) para búsqueda y agrupación de escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye mediciones de velocidad y memoria, no de precisión:

| Modelo | Tiempo 224x224 (ms): original fp32 | original | portable | kernels | Aceleración kernels vs original | Memoria pico 224x224 (MiB, allocated/reserved): original | portable | kernels |
|---|---|---|---|---|---|---|---|---|
| `dinov2-vits14` | 3,3 | 4,4 | 2,951 | 0,848 | 3,9x | 160/166 | 79/98 | 112/148 |
| `dinov2-vitb14` | 6,9 | 4,5 | 2,922 | 1,478 | 3,0x | 530/548 | 205/226 | 237/290 |
| `dinov2-vitl14` | 22,8 | 9,8 | 6,115 | 4,593 | 2,1x | 1777/1784 | 622/646 | 655/714 |
| `dinov2-vitg14` | 86,4 | 33,9 | 18,917 | 13,156 | 2,6x | 6542/6548 | 2216/2230 | 2246/2318 |

Rendimiento a resoluciones fijas (modo portable y kernels, `dinov2-vitb14`):

| Modo | 640x480 | 1280x720 | 1920x1080 | 4000x3000 (12 MP) |
|---|---|---|---|---|
| portable | 10,3 ms / 231 MiB | 39,8 ms / 295 MiB | 137,6 ms / 417 MiB | 3232,4 ms / 1460 MiB |
| kernels | 7,5 ms / 243 MiB | 28,0 ms / 324 MiB | 94,7 ms / 480 MiB | 2147,8 ms / 1821 MiB |

## Requisitos de hardware

- VRAM estimada para inferencia a 224x224 (fp16): desde 79 MiB (`dinov2-vits14`, portable) hasta 2216 MiB (`dinov2-vitg14`, portable); en modo kernels, desde 112 MiB hasta 2246 MiB.
- VRAM para imágenes de 12 MP (4000x3000, fp16): 0,8 GiB pico asignado en `dinov2-vits14`; 1,4 GiB en `dinov2-vitb14`; 2,2 GiB en `dinov2-vitl14`; 4,8 GiB en `dinov2-vitg14`.
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GB de VRAM para las variantes S/B a resolución estándar; 8 GB o más para ViT-L y ViT-G a alta resolución. Las pruebas del repositorio se realizaron en una RTX 5060 Ti de 16 GB.
- Cabe en GPU de consumo: sí, todas las variantes a 224x224; ViT-S, ViT-B y ViT-L también a 12 MP en tarjetas de 8-16 GB. ViT-G a 12 MP requiere unos 6 GiB reservados.
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`), PyTorch con los pesos originales de Meta, o el código original de `facebookresearch/dinov2`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia: 0,85 ms por imagen 224x224 con `dinov2-vits14` en modo kernels; 13,2 ms con `dinov2-vitg14`. Carga del modelo: 0,07 s (`dinov2-vits14`, kernels) a 2,22 s (`dinov2-vitg14`, kernels).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precisión en la información proporcionada para comparar con alternativas como CLIP, SigLIP o los propios DINOv2 originales de Meta. La comparativa se limita a aspectos de empaquetado y licencia:

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| `fastforks/dinov2` (ViT-S/B/L/G, 14) | no disponible | cualquier H x W >= 1; probado hasta 3000x4000 | Apache-2.0 | repo de card; pesos en dl.fbaipublicfiles.com |
| DINOv2 original (facebookresearch) | ViT-S/B/L/G, 14 | misma arquitectura | Apache-2.0 | pesos oficiales y código en GitHub |
| CLIP (OpenAI) | ViT-B/L, 14 y 16 | 224x224 fijo (mayoría de variantes) | MIT (código), pesos con términos propios | Hugging Face |
| SigLIP (Google) | ViT-B/L/SO400M | 224x224 a 384x384 | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El repositorio no contiene pesos: depende de la disponibilidad de los enlaces de `dl.fbaipublicfiles.com` y de la verificación SHA-256 para garantizar integridad.
- Modelo puramente visual: no procesa texto, audio ni proporciona capacidades lingüísticas o de razonamiento.
- No se han publicado métricas de precisión (mAP, linear probing, etc.) en la información disponible; no es posible evaluar su calidad frente a alternativas sin consultar el paper original.
- El dataset de entrenamiento (LVD-142M) no se ha publicado, lo que limita la reproducibilidad y el análisis de sesgos.
- Riesgo de sesgos heredados de los rastreos web y de los conjuntos curados usados para recuperar las imágenes de entrenamiento; no se documentan análisis de sesgo en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero la model card advierte que el paquete de código original es "research-use package" y recomienda revisar los términos antes de otros usos.
- La resolución de entrada es flexible, pero el coste computacional crece de forma cuadrática con el número de parches; imágenes de 12 MP requieren varios segundos en ViT-B y pueden superar los 6 GiB en ViT-G.
- Para producción, conviene fijar la versión de la variante (`@1`) y validar los hashes SHA-256 en cada despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/dinov2
- Código de la librería fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de DINOv2 (commit 7764ea0): https://github.com/facebookresearch/dinov2
- Evidencia de licencia: https://github.com/facebookresearch/dinov2/blob/7764ea0/README.md
- Hashes completos (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/features/models/dinov2/card.toml
- Pesos ViT-S/14: https://dl.fbaipublicfiles.com/dinov2/dinov2_vits14/dinov2_vits14_pretrain.pth
- Pesos ViT-S/14 con registros: https://dl.fbaipublicfiles.com/dinov2/dinov2_vits14/dinov2_vits14_reg4_pretrain.pth
- Pesos ViT-B/14: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitb14/dinov2_vitb14_pretrain.pth
- Pesos ViT-B/14 con registros: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitb14/dinov2_vitb14_reg4_pretrain.pth
- Pesos ViT-L/14: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitl14/dinov2_vitl14_pretrain.pth
- Pesos ViT-L/14 con registros: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitl14/dinov2_vitl14_reg4_pretrain.pth
- Pesos ViT-G/14: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitg14/dinov2_vitg14_pretrain.pth
- Pesos ViT-G/14 con registros: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitg14/dinov2_vitg14_reg4_pretrain.pth
