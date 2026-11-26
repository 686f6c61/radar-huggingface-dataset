# IRONVIT/IronViT-Hybrid-400M

## Resumen

IronViT-Hybrid-400M es un codificador visual (vision encoder) de 445 millones de parámetros desarrollado por IRONVIT, un proyecto vinculado a XPeng Robotics. El modelo resuelve el problema del coste computacional de la atención softmax en imágenes de alta resolución: de sus 27 bloques transformer, 9 usan atención softmax y 18 usan atención lineal con kernel ELU+1, lo que reduce el coste de prefill para secuencias largas manteniendo buena parte de la calidad representacional del softmax. Se entrenó en dos etapas de destilación multi-profesor, la segunda desde el checkpoint de refinamiento de 90k del mismo run que produjo IronViT-Softmax-400M.

El modelo se publica como extractor de características de imagen (pipeline `image-feature-extraction`) con una interfaz idéntica a la de su variante softmax, de modo que ambos son intercambiables en un VLM o en un script de probing. Incluye además una cabeza de clasificación zero-shot (`pe_zeroshot_head.pt`) que proyecta la característica pooled al espacio de texto de PE-Core-G14-448, sin necesidad de torre de texto en tiempo de inferencia.

Es relevante porque ofrece una alternativa de atención híbrida con licencia Apache 2.0 y pesos safetensors, orientada a tareas densas (segmentación semántica, estimación de profundidad) donde el coste de atención sobre muchos parches es el cuello de botella. La arquitectura mantiene 48×48 posiciones aprendidas más RoPE 2D y un read-out con 8 registros y attention pooling (MAP).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer híbrido (softmax + atención lineal ELU+1) |
| Parametros totales | 445.028.400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (parches con rejilla de posiciones aprendida 48×48 + RoPE 2D) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; ejemplo de uso en bfloat16) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos arquitectónicos adicionales: hidden 1152, profundidad 27, 16 cabezas, MLP 4304 con `gelu_pytorch_tanh`, patch 16, temporal 2, merge 2. Atención softmax en los bloques `[3, 7, 11, 15, 19, 23, 24, 25, 26]` y lineal en el resto. Kernel lineal: `act(x) = 1 + elu(x)`, `kv = Σ act(k) act(v)ᵀ / (L · 8)`, con puerta `sigmoid(gate_proj(x))`. Read-out: 8 registros + attention pooling con query aprendida (MAP). Tamaño del repo: 0,9 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión con atención mixta: 9 de los 27 bloques emplean atención softmax estándar y 18 emplean atención lineal con kernel ELU+1, ponderada por una puerta sigmoide. Esta mezcla busca conservar la calidad representacional del softmax (concentrada en bloques seleccionados) mientras reduce el coste cuadrático en el resto, lo que abarata el prefill en imágenes de alta resolución con muchas secuencias de parches. Las posiciones combinan una rejilla aprendida de 48×48 con RoPE 2D; el patch size es 16 con factor temporal 2 y merge 2, lo que da lugar a una salida de parches en orden bloqueado `(block_h, block_w, intra_h, intra_w)` que puede reordenarse a rejilla raster mediante `model.to_raster_order`.

El entrenamiento se realizó en dos etapas de destilación multi-profesor. La etapa II destila desde el "puente de capacidad softmax", es decir, el checkpoint de refinamiento de 90k del mismo run que generó IronViT-Softmax-400M. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. La cabeza zero-shot proyecta la característica pooled a través de un pequeño adaptador al espacio de texto de PE-Core-G14-448, con un clasificador de texto fijo incluido en `pe_zeroshot_head.pt`.

## Capacidades

- Extracción de características de imagen: produce `patch_features` de dimensión 1152 por parche y `global_features` de dimensión 1152 pooled mediante MAP.
- Clasificación de imágenes: linear probe, kNN y zero-shot (esta última vía adaptador a espacio de texto de PE-Core).
- Segmentación semántica densa: los parches pueden reordenarse a rejilla raster para tareas densas (evaluado en ADE20K).
- Estimación de profundidad: evaluado en NYUv2, con salida densa a partir de los parches.
- Interfaz compatible con `AutoModel`/`AutoImageProcessor` de transformers con `trust_remote_code=True`.
- Sustitución directa de IronViT-Softmax-400M en un VLM o script de probing (interfaz idéntica).
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües: es un codificador visual puro.

## Casos de uso

- Segmentación semántica en producción: el modelo puede generar características densas por parche y reordenarlas a rejilla raster (`to_raster_order`) para alimentar una cabeza de segmentación; su atención lineal en 18 de 27 bloques reduce el coste en imágenes de alta resolución, adecuado para pipelines de visión por satélite o inspección industrial.
- Estimación de profundidad monocular: las características densas y el read-out global permiten entrenar una cabeza de regresión de profundidad, con un RMSE de 0,343 en NYUv2 según la model card, útil en robótica y navegación.
- Backbone de un VLM: al compartir interfaz con IronViT-Softmax-400M, puede sustituirse como codificador visual en un modelo visión-lenguaje sin cambiar el código de integración.
- Búsqueda y recuperación de imágenes: `global_features` de 1152 dimensiones sirve como embedding de imagen para índices vectoriales y búsqueda por similitud.
- Clasificación zero-shot sin torre de texto: usando `pe_zeroshot_head.pt`, se puede clasificar contra un vocabulario fijo sin desplegar un codificador de texto, lo que simplifica el servicio.
- Preprocesado de features para modelos downstream: extracción offline de características para entrenar clasificadores lineales o kNN con bajo coste computacional.
- Control de calidad visual en líneas de fabricación: clasificación y segmentación de defectos con un encoder de 445M parámetros que cabe en GPUs de gama alta consumer.

## Benchmarks y rendimiento

| Benchmark | IronViT-Hybrid-400M | IronViT-Softmax-400M | SigLIP2 NaFlex SO400M |
|---|---|---|---|
| IN-1k linear probe | 87,12 | 87,35 | 87,45 |
| IN-1k kNN | 85,37 | 85,82 | 85,28 |
| IN-1k zero-shot | 82,88 | 83,27 | no disponible |
| ADE20K mIoU | 52,60 | 52,97 | 44,48 |
| NYUv2 RMSE ↓ | 0,343 | 0,339 | 0,459 |

Los datos proceden de la model card del autor. La variante híbrida queda ligeramente por debajo de la softmax en precisión, pero mantiene la ventaja en coste de prefill a alta resolución.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 445M parámetros ocupan aproximadamente 0,9 GB de pesos; con activaciones y procesador de imagen, un lote pequeño cabe holgadamente en 4-6 GB de VRAM.
- GPU recomendadas: A100, H100 o L40S para lotes grandes y alta resolución; RTX 4090 o RTX 3090 para inferencia y probing.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: transformers con `trust_remote_code=True` (ejemplo oficial con `AutoModel` y `AutoImageProcessor`); el formato safetensors es compatible con vLLM/TGI solo si se integra como encoder, no como modelo generativo. No se documenta soporte GGUF ni llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Notas |
|---|---|---|---|---|
| IronViT-Hybrid-400M | 445M | rejilla 48×48 posiciones, patch 16 | Apache 2.0 | Atención híbrida softmax/lineal, destilación multi-profesor |
| IronViT-Softmax-400M | ~400M (no confirmado) | misma interfaz | Apache 2.0 | Variante softmax pura, ligeramente superior en precisión |
| SigLIP2 NaFlex SO400M | ~400M | entrada flexible | no disponible en la información | Referencia en IN-1k y tareas densas; peor en ADE20K y NYUv2 según la model card |

La comparativa se limita a los datos publicados por el autor; no se dispone de cifras de otros encoders como DINOv2 o CLIP en la información proporcionada.

## Limitaciones y advertencias

- Es un codificador visual: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- No se documentan sesgos específicos; al entrenarse con datos no detallados, pueden heredarse sesgos del corpus visual.
- Riesgo de alucinación no aplica en el sentido generativo, pero las cabezas downstream pueden producir predicciones erróneas en dominios fuera de distribución.
- La evaluación zero-shot depende de un adaptador fijo a PE-Core-G14-448; el vocabulario de clases está limitado a ese clasificador.
- La salida de parches viene en orden bloqueado; usar sin reordenar a raster puede degradar tareas densas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar antes de producción.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento.
- No hay datos publicados de latencia ni throughput; el rendimiento real en producción debe medirse.

## Enlaces

- Hugging Face: https://huggingface.co/IRONVIT/IronViT-Hybrid-400M
- Variante softmax: https://huggingface.co/IRONVIT/IronViT-Softmax-400M
- Paper (arXiv): https://arxiv.org/abs/2609.29252
- Página del proyecto: https://xpeng-robotics.github.io/iron-fm/?model=vit
- Repositorio GitHub: https://github.com/xpeng-robotics/ironvit
