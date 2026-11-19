# canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22

## Resumen

CanViT-B es un checkpoint de un modelo de visión artificial de tipo "active vision" desarrollado por el equipo CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna), presentado en NeurIPS 2026. A diferencia de un Vision Transformer convencional que procesa la imagen completa en un solo pase, CanViT observa la escena mediante una secuencia de "glimpses" (recortes) de 128 px y va construyendo una representación global sobre un lienzo ("canvas") de 32 × 32 parches. Este checkpoint concreto es un modelo preentrenado por destilación latente densa desde facebook/dinov3-vitb16-pretrain-lvd1689m sobre ImageNet-1k, con escenas de 512 px.

El modelo resuelve el problema de extraer características visuales de escenas de alta resolución bajo restricciones de ancho de banda o de coste computacional: en lugar de procesar todos los píxeles, un agente decide qué regiones mirar y en qué orden. Con 98.114.176 parámetros (aproximadamente 98 M), un backbone ViT-B/16 y una licencia MIT, es relevante ahora porque propone una alternativa a los extractores de características densos para tareas de percepción activa, robótica y procesamiento de imágenes de gran tamaño.

La relevancia práctica del checkpoint es doble: por un lado sirve como extractor de características de imagen (pipeline `image-feature-extraction`); por otro, expone la maquinaria de episodios (políticas de muestreo, estado del canvas) que permite integrarlo en bucles de decisión donde el modelo elige qué mirar a continuación. El checkpoint se distribuye en safetensors y requiere la librería `canvit-pytorch>=0.2`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16) con mecanismo de active vision y canvas de escena |
| Parámetros totales | 98.114.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; se procesan secuencias de glimpses) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

CanViT (Canvas Vision Transformer) es un transformer de visión con un mecanismo de percepción activa. El modelo recibe una secuencia de recortes ("glimpses") de 128 px extraídos de una escena de 512 px y actualiza un estado interno denominado canvas, una rejilla de 32 × 32 parches que actúa como memoria espacial de la escena completa. En inferencia el canvas puede tener cualquier tamaño. El checkpoint usa un backbone ViT-B/16 y una política de muestreo configurable (por ejemplo, `coarse_to_fine`, que mira primero la escena completa y luego cuadrantes).

El entrenamiento se realizó por destilación latente densa desde el modelo profesor facebook/dinov3-vitb16-pretrain-lvd1689m sobre ImageNet-1k, con escenas de 512 px y glimpses de 128 px, durante 1.837.056 pasos de entrenamiento. La innovación técnica principal es precisamente ese esquema de destilación sobre un canvas acumulativo: el modelo aprende a reconstruir las características del profesor para la escena completa a partir únicamente de la información recolectada en los glimpses, lo que le obliga a integrar información espacial de forma secuencial en lugar de procesar la imagen entera de una vez.

## Capacidades

- Extracción de características de imagen: genera una rejilla de parches del canvas (`canvas_patch_grid`) que representa la escena completa.
- Percepción activa: selecciona y procesa una secuencia de regiones (glimpses) según una política configurable.
- Memoria espacial sobre canvas: mantiene y actualiza un estado de escena de tamaño variable en inferencia.
- Predicción de características del profesor (`predict_teacher_patches`) para alineación con DINOv3.
- Procesamiento de escenas de alta resolución (512 px y superiores) con coste controlado por número de glimpses.
- No soporta tool calling, generación de texto, razonamiento lingüístico ni capacidades multimodales de lenguaje; es un modelo puramente visual.

## Casos de uso

- Extracción de características para clasificación y recuperación visual: usar `canvas_patch_grid` como embedding de escena para búsqueda por similitud o clasificación lineal sobre características congeladas, aprovechando que el canvas resume la escena completa.
- Robótica y navegación con presupuesto de cómputo limitado: un agente puede mirar solo unas pocas regiones de 128 px por paso y actualizar el canvas, reduciendo el coste frente a procesar el frame completo a alta resolución.
- Procesamiento de imágenes de gran tamaño (satélite, microscopía, inspección industrial): la política `coarse_to_fine` permite cubrir la escena con un número fijo de glimpses en lugar de redimensionar la imagen y perder detalle.
- Detección de anomalías con atención selectiva: comparar las características del canvas con las esperadas para una escena normal, priorizando las regiones muestreadas por la política.
- Investigación en visión activa: el paquete `canvit-pytorch` expone `run_episode`, `make_policy` e `init_state`, lo que facilita experimentar con nuevas políticas de muestreo y medir su impacto en la calidad de la representación.
- Destilación y preentrenamiento de extractores visuales: el checkpoint sirve como inicialización para fine-tuning en dominios específicos manteniendo la ventaja de la memoria de canvas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 98 M de parámetros, el peso en fp32 ocupa aproximadamente 0,4 GB, por lo que la VRAM necesaria es modesta y dominada por las activaciones de los glimpses y el canvas.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna, aunque no se confirma en la documentación.
- Opciones de despliegue: librería oficial `canvit-pytorch>=0.2` (instalable con `uv add`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Enfoque | Licencia |
|---|---|---|---|---|
| CanViT-B (este checkpoint) | 98,1 M | Escenas 512 px, glimpses 128 px | Active vision con canvas, destilado de DINOv3 | MIT |
| facebook/dinov3-vitb16-pretrain-lvd1689m | no disponible en la información | Imagen completa | ViT denso, profesor de la destilación | DINOv3 License |
| Vision Transformer ViT-B/16 estándar | ~86 M (referencia habitual) | Imagen completa a resolución fija | ViT denso clásico | según implementación |

La comparación cuantitativa de rendimiento con DINOv3 o con un ViT-B/16 estándar no está disponible en la información proporcionada; el único dato objetivo es que CanViT-B se entrena para aproximar las características de DINOv3 a partir de observaciones parciales.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto ni mantiene conversaciones; no debe evaluarse con benchmarks de lenguaje.
- La calidad de la representación depende de la política de muestreo y del número de glimpses; con pocos glimpses o una política inadecuada, el canvas puede quedar incompleto.
- Riesgo de sesgo heredado de ImageNet-1k y, por destilación, de las características del profesor DINOv3.
- Aunque la licencia del checkpoint es MIT, el modelo se destila de DINOv3, publicado bajo la DINOv3 License; conviene revisar esa licencia antes de un uso comercial, tal como advierte la propia model card.
- El canvas durante el preentrenamiento es de 32 × 32; aunque en inferencia admite cualquier tamaño, no se documenta el comportamiento fuera de esa configuración.
- No se han publicado métricas de rendimiento ni evaluaciones de robustez en la información disponible.
- La API depende de `canvit-pytorch>=0.2`; para la versión 0.1 es necesario fijar `revision="canvit-pytorch-0.1"`.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22
- Paper (NeurIPS 2026, arXiv): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- Modelo profesor (DINOv3 ViT-B/16): https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Repositorio DINOv3: https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Dataset ImageNet-1k: https://huggingface.co/datasets/ILSVRC/imagenet-1k
