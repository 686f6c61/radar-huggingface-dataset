# KBlueLeaf/TIPOv2-1B-A200M

## Resumen

TIPOv2-1B-A200M es la segunda generación del modelo de optimización de prompts para text-to-image (T2I) desarrollado por KBlueLeaf. Su función es expandir un prompt breve del usuario en una descripción detallada y específica antes de que un modelo de difusión lo procese, mejorando así la fidelidad y diversidad de las imágenes generadas. A diferencia de la primera versión (TIPO-500M, un modelo denso de 500M), esta versión utiliza una arquitectura MoE sparse estilo DeepSeek, con aproximadamente 991M de parámetros totales y solo unos 193M activos por token, lo que permite un coste computacional por token menor que el de su predecesor denso.

El modelo está entrenado sobre un conjunto de datos ampliado y regenerado: incluye Danbooru, Nozomi, CC12M, CoyoHD-11M y LAION-COCO-13M, con todas las captions en lenguaje natural reescritas con Qwen3.5-2B para uniformizar el estilo. La arquitectura, denominada KohakUwU MoE, incorpora 64 expertos enrutados (top-8), un experto compartido, GQA, QK-norm y un router sin pérdida auxiliar. El contexto es de 4096 tokens, cuatro veces más que en v1. El modelo se distribuye en formato safetensors y GGUF, con licencia no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sparse (KohakUwU, estilo DeepSeekMoE) |
| Parametros totales | 1.006.513.856 (según safetensors; la model card indica 990,8M sin embedding) |
| Parametros activos | ~193,1M por token (excluye embedding) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | GGUF disponible (no se especifican bits concretos en la model card) |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo usa una arquitectura MoE sparse derivada de DeepSeekMoE, implementada en el framework KohakUwULLM. Tiene 16 capas: la primera es densa y las 15 restantes son MoE. Cada capa MoE contiene 64 expertos enrutados con top-8 activos por token, más un experto compartido siempre activo. El hidden size es 768, con 12 cabezas de atención y 2 cabezas KV (GQA), head dim 64 y QK-norm. El router usa scoring sigmoide y un mecanismo de balanceo por bias sin pérdida auxiliar. La posición se codifica con RoPE (theta 100000) y la normalización es RMSNorm (eps 1e-6). El vocabulario es de 65536 tokens.

El entrenamiento se realizó en 4 GPUs RTX 5090 (32 GB) con 150.000 pasos, 262.144 tokens por paso (16 microbatches de 16384 tokens) y contexto empaquetado de 2048 tokens. Los parámetros se mantienen en fp16 completo con dynamic loss scaling, y se aplica MXFP8 en las proyecciones q/k/v/o y en los MLP up/down de los expertos (111 módulos). El optimizador es Muon para las matrices ocultas y AdamW para el resto, con LR 5e-4 (muon_lr 2e-3, embed_lr 2e-3), schedule inverse-sqrt con cosine final y warmup del 2%. No se usa pérdida auxiliar ni router z-loss.

## Capacidades

- Expansión de prompts cortos a descripciones detalladas y específicas para modelos de difusión (text presampling).
- Generación de texto en formato booru tags y lenguaje natural, con preferencia por la estructura de tags de Danbooru.
- Soporte multilingüe limitado: entrenado principalmente en inglés, aunque puede procesar términos de otros idiomas si aparecen en los datos.
- No soporta tool calling ni razonamiento multi-step; su función es exclusivamente la optimización de prompts para T2I.
- No tiene capacidades de visión ni audio; es un modelo de texto puro.

## Casos de uso

- Mejora de prompts en flujos de generación de imágenes con Stable Diffusion o Flux: el usuario escribe "una chica con sombrero", TIPOv2 lo expande a una descripción de 100-200 tokens con detalles de iluminación, composición, estilo y atributos, lo que reduce la iteración manual.
- Automatización de etiquetado booru para datasets de anime: dado un prompt corto, el modelo genera una lista completa de tags relevantes, útil para curadores de datasets.
- Generación de variaciones de prompts para búsqueda creativa: al muestrear múltiples expansiones, se obtienen distintas interpretaciones de un mismo prompt, útil para exploración artística.
- Integración en pipelines de generación por lotes: al ser un modelo pequeño y eficiente (193M activos), puede ejecutarse en paralelo para procesar miles de prompts sin saturar la GPU dedicada al difusión.
- Preprocesado de prompts en aplicaciones de texto a imagen comerciales: sirve como capa intermedia que estandariza la entrada del usuario antes de pasarla al modelo de difusión, mejorando la consistencia del resultado.
- Fine-tuning o adaptación a dominios específicos: su arquitectura MoE y su tamaño compacto permiten ajustarlo con pocos recursos para estilos concretos (fotografía, ilustración, etc.) si se dispone de datos de captions.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: posible con cuantización GGUF de 4 bits o 8 bits; el modelo activo es de ~193M parámetros, lo que permite ejecutarlo en equipos sin GPU con latencia aceptable (del orden de segundos por prompt).
- Inferencia en GPU consumer: cabe en GPUs con 4 GB o más de VRAM en fp16 (el checkpoint fp16 ocupa ~2 GB). Una RTX 3060 o superior es suficiente para generación en tiempo real.
- GPUs recomendadas para despliegue en producción: RTX 3090, RTX 4090, A100 o H100 si se quiere procesar muchos prompts concurrentemente.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte MoE), TGI (text-generation-inference), o el framework KohakUwULLM para fine-tuning.
- Latencia estimada: en una RTX 4090, una expansión de prompt de ~50 tokens de entrada a ~200 tokens de salida debería completarse en menos de 100 ms, aunque no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Arquitectura | Uso principal |
|---|---|---|---|---|---|
| TIPOv2-1B-A200M | 991M | 193M | 4096 | MoE sparse | Optimización de prompts T2I |
| TIPO-500M (v1) | 500M | 500M (denso) | 1024 | Densa LLaMA-like | Optimización de prompts T2I |
| Otros modelos de reescritura de prompts | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la misma categoría más allá de la v1 del propio TIPO.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado predominantemente con datos de Danbooru (anime) y captions en inglés, por lo que puede generar descripciones sesgadas hacia estilos anime y vocabulario booru, con menor calidad en dominios fotográficos generales.
- Riesgo de alucinación: al ser un modelo generativo, puede inventar detalles que no están en el prompt original, lo que podría llevar a imágenes no deseadas si no se revisa la salida.
- Limitación de contexto: 4096 tokens es suficiente para prompts expandidos, pero no para documentos largos; no es adecuado para tareas de razonamiento o generación de texto extenso.
- Idioma: solo inglés confirmado; otros idiomas pueden funcionar de forma impredecible.
- Licencia no especificada: no se indica si es de uso comercial libre, lo que requiere consultar al autor antes de usar en productos comerciales.
- Sin soporte de tool calling ni agentes: no debe usarse como modelo de propósito general; su única función es la expansión de prompts para T2I.

## Enlaces

- HuggingFace: https://huggingface.co/KBlueLeaf/TIPOv2-1B-A200M
- Paper TIPO (v1): https://arxiv.org/abs/2411.08127
- Repositorio KohakUwULLM: https://github.com/KohakuBlueleaf/KohakUwULLM
