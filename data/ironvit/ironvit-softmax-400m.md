# IRONVIT/IronViT-Softmax-400M

## Resumen

IronViT-Softmax-400M es un codificador visual (vision encoder) de 421 millones de parámetros desarrollado por IRONVIT, el equipo de XPeng Robotics, y publicado como parte de la familia IronViT. El modelo se ha destilado desde múltiples profesores (clasificación, segmentación, profundidad y backbones de VLM) hacia una única torre de tipo Qwen3-VL con atención softmax en los 27 bloques. Su propósito es servir como backbone visual de propósito general para percepción multitarea y como torre de visión dentro de un modelo visión-lenguaje.

La arquitectura es un transformer de visión con 1152 dimensiones ocultas, 27 bloques y 16 cabezas de atención, con MLP de 4304 unidades y activación `gelu_pytorch_tanh`. Usa parches de 16x16, fusión temporal de 2 y merge de 2, posiciones aprendidas en una rejilla de 48x48 combinadas con RoPE 2-D, atención softmax no causal con QK-RMSNorm y un mecanismo de lectura basado en 8 registros más attention pooling con query aprendida (MAP).

Es relevante porque ofrece un backbone visual de tamaño medio (400M) con licencia Apache 2.0, resultados competitivos frente a SigLIP2, DINOv3-L y el propio ViT de Qwen3-VL en tareas densas como segmentación semántica y estimación de profundidad, y un diseño explícito para integrarse como torre visual de un VLM. Además, incluye un adaptador zero-shot hacia el espacio de texto de PE-Core-G14-448.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (Qwen3-VL tower), 27 bloques, atención softmax no causal con QK-RMSNorm |
| Parametros totales | 421.223.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | resolución configurable por el procesador; por defecto 384x384; con `size=None` resize que preserva aspecto limitado a `max_patches=576`; secuencias más largas soportadas con coste O(L²) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin capacidades lingüísticas directas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0.9 GB), con `custom_code` y `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un transformer de visión puro con atención softmax en todos los bloques, a diferencia de la variante Hybrid-400M de la misma familia. La configuración interna es: hidden 1152, profundidad 27, 16 cabezas, MLP 4304 con `gelu_pytorch_tanh`, patch size 16, temporal size 2 y merge size 2. Las posiciones combinan una rejilla aprendida de 48x48 con RoPE 2-D. La atención es no causal, lo que permite procesar la imagen completa sin máscara triangular. La lectura se realiza con 8 registros más attention pooling con query aprendida (MAP), produciendo un resumen global de la imagen.

El entrenamiento se basa en destilación multi-profesor: se combinan señales de profesores de clasificación, segmentación, profundidad y backbones de VLM para entrenar un único backbone. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un encoder visual). La innovación destacable es la unificación de múltiples tareas de percepción en un solo encoder con un esquema de lectura dual (features por parche y features globales), más un adaptador zero-shot hacia el espacio de texto de PE-Core-G14-448 que se distribuye como `pe_zeroshot_head.pt`.

## Capacidades

- Extracción de features visuales por parche en orden bloqueado (`block_h, block_w, intra_h, intra_w`), con 1152 dimensiones por token.
- Extracción de un resumen global de imagen mediante MAP pooling (`global_features`, 1152 dimensiones).
- Clasificación de imágenes: linear probe, kNN y zero-shot (este último vía adaptador a espacio de texto de PE-Core).
- Segmentación semántica densa (evaluada en ADE20K) tras reordenar los tokens a rejilla raster con `model.to_raster_order`.
- Estimación de profundidad (evaluada en NYUv2).
- Uso como torre visual de un VLM (diseñado explícitamente para ello).
- Soporte de resolución fija cuadrada (384x384 por defecto) o resize que preserva aspecto con límite de parches.
- No dispone de generación de texto, tool calling, agentes ni capacidades multilingües propias: es un encoder visual.

## Casos de uso

- Backbone para clasificación de imágenes en producción: se puede congelar el encoder y entrenar un linear probe sobre `global_features` para tareas de clasificación con pocos datos, aprovechando el 87,35 de IN-1k linear probe reportado.
- Segmentación semántica en pipelines de percepción: reordenando `patch_features` a rejilla raster se obtienen mapas densos aptos para segmentación (52,97 mIoU en ADE20K), útil en robótica, conducción o inspección industrial.
- Estimación de profundidad monocular: las features densas sirven como entrada a cabezas de profundidad (0,339 RMSE en NYUv2), aplicable a navegación y reconstrucción 3D.
- Torre visual de un VLM: al estar construido sobre el tower de Qwen3-VL, encaja como encoder de imagen en modelos visión-lenguaje que necesiten un backbone de 400M con licencia permisiva.
- Búsqueda y recuperación de imágenes: las features globales MAP-pooled permiten indexar imágenes y hacer búsqueda por similitud vectorial en bases de datos de embeddings.
- Etiquetado zero-shot de imágenes: mediante el adaptador `pe_zeroshot_head.pt` se puede clasificar sin entrenamiento adicional en categorías definidas en el espacio de texto de PE-Core (83,27 zero-shot en IN-1k).
- Preentrenamiento de cabezas multitarea: al ser un encoder generalista destilado de varios profesores, sirve como inicialización para modelos que deban resolver clasificación, segmentación y profundidad simultáneamente.

## Benchmarks y rendimiento

| Benchmark | IronViT-Softmax-400M | SigLIP2 NaFlex SO400M | DINOv3-L | Qwen3-ViT 400M |
|---|---|---|---|---|
| IN-1k linear probe | 87,35 | 87,45 | 87,07 | 78,28 |
| IN-1k kNN | 85,82 | 85,28 | 85,42 | 80,22 |
| IN-1k zero-shot | 83,27 | — | — | — |
| ADE20K mIoU | 52,97 | 44,48 | 52,86 | 33,81 |
| NYUv2 RMSE (menor es mejor) | 0,339 | 0,459 | 0,320 | 0,503 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 0,85 GB solo para pesos (421M parámetros x 2 bytes), más activaciones y memoria del procesador de imagen; en la práctica cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en bf16 a 384x384; RTX 3060/4060, RTX 4090, A100, H100 son válidas. Para lotes grandes o resoluciones con más parches, se recomienda 8-16 GB.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más; incluso en fp32 (aproximadamente 1,7 GB de pesos) cabe en GPUs de 8 GB.
- Opciones de despliegue: `transformers` con `AutoModel` y `trust_remote_code=True`; el repo incluye `custom_code`, por lo que conviene verificar compatibilidad con vLLM, TGI o llama.cpp (no se documenta soporte explícito en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | IN-1k linear | ADE20K mIoU | NYUv2 RMSE | Licencia |
|---|---|---|---|---|---|---|
| IronViT-Softmax-400M | 421M | 384x384 por defecto, hasta 576 parches | 87,35 | 52,97 | 0,339 | Apache 2.0 |
| SigLIP2 NaFlex SO400M | ~400M | resolución flexible (NaFlex) | 87,45 | 44,48 | 0,459 | no disponible en la información |
| DINOv3-L | ~300M (L) | no disponible | 87,07 | 52,86 | 0,320 | no disponible en la información |
| Qwen3-ViT 400M | ~400M | no disponible | 78,28 | 33,81 | 0,503 | no disponible en la información |

IronViT-Softmax-400M destaca en segmentación semántica (52,97 mIoU, por delante de SigLIP2 y Qwen3-ViT y ligeramente por encima de DINOv3-L) y en kNN y zero-shot de clasificación, mientras que DINOv3-L es algo mejor en profundidad y SigLIP2 ligeramente mejor en linear probe.

## Limitaciones y advertencias

- Es un encoder visual: no genera texto, no soporta tool calling ni razonamiento multi-step; no debe evaluarse como un LLM.
- La atención softmax tiene coste O(L²) en el número de parches; resoluciones altas o `max_patches` elevados incrementan el coste cuadráticamente.
- El orden de los `patch_features` es bloqueado, no raster; es necesario llamar a `to_raster_order` para tareas densas, lo que añade complejidad de integración.
- El zero-shot depende de un adaptador y un clasificador de texto fijo (`pe_zeroshot_head.pt`) ligado al espacio de PE-Core-G14-448; no es zero-shot abierto a vocabulario arbitrario.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código remoto antes de desplegar en producción.
- No se documentan sesgos, composición del dataset ni riesgos de alucinación (no aplicable a un encoder), pero la ausencia de información sobre los datos de entrenamiento impide evaluar sesgos de representación.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los profesores y del adaptador PE-Core utilizados en la destilación.
- El modelo se publicó en 2026 y tiene 0 descargas y 0 likes en Hugging Face; la validación comunitaria es aún inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/IRONVIT/IronViT-Softmax-400M
- Variante Hybrid-400M: https://huggingface.co/IRONVIT/IronViT-Hybrid-400M
- Paper (arXiv): https://arxiv.org/abs/2609.29252
- Página del proyecto: https://xpeng-robotics.github.io/iron-fm/?model=vit
- Repositorio GitHub: https://github.com/xpeng-robotics/ironvit
