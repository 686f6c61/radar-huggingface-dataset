# biali/LLaDA2.0-Uni-bnb-nf4

## Resumen

LLaDA2.0-Uni es un modelo de lenguaje de difusión (dLLM) multimodal desarrollado por el AGI Research Center de Inclusion AI. Unifica en un único modelo la comprensión y la generación de imágenes junto con el procesamiento de texto, apoyándose en una arquitectura Mixture-of-Experts (MoE) con 16.322 millones de parámetros totales y aproximadamente 1.000 millones de parámetros activos por token. El modelo resuelve el problema de tener que encadenar modelos separados para entender y para generar imágenes, al plantear ambas tareas como un mismo paradigma de predicción de tokens enmascarados.

La ficha que nos ocupa, `biali/LLaDA2.0-Uni-bnb-nf4`, es una cuantización de 4 bits con bitsandbytes NF4 (doble cuantización) del backbone MoE del modelo original. Los decodificadores de difusión, el VAE y el tokenizador de imágenes SigLIP-VQ se mantienen en bf16 sin modificar, de modo que el repositorio es autocontenido y se puede usar como reemplazo directo del original. El backbone pasa de unos 32 GB en bf16 a unos 9 GB en NF4, lo que reduce drásticamente los requisitos de memoria a costa de un aumento moderado de la latencia.

Es relevante ahora porque demuestra que los modelos de difusión multimodal con MoE pueden cuantizarse a 4 bits manteniendo la calidad numérica en tareas de comprensión de imágenes, y porque abre la puerta a desplegar un modelo any-to-any en hardware de gama consumer o en nodos con memoria limitada. La licencia es Apache 2.0 y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | dLLM multimodal con backbone MoE (Mask Token Prediction) + decodificador de difusión + tokenizador SigLIP-VQ + VAE |
| Parametros totales | 16.322.747.392 (~16,3 B) |
| Parametros activos | ~1 B (según model card del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 4-bit con doble cuantización (este repo); bf16 e int8 (LLM.int8) en el modelo original |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código de modelado custom y config de cuantización embebida) |

## Arquitectura y entrenamiento

El backbone es un transformer MoE unificado que trata la comprensión y la generación multimodal bajo un mismo paradigma de predicción de tokens enmascarados, propio de los modelos de difusión de lenguaje (dLLM). Las imágenes se convierten en tokens semánticos discretos mediante un tokenizador SigLIP-VQ, lo que permite al modelo razonar sobre ellas como si fueran tokens de texto. Para la generación de imágenes, un decodificador de difusión especializado empareja esos tokens discretos con píxeles de alta fidelidad, e incluye una variante destilada (`decoder-turbo`) que permite inferencia en tan solo 8 pasos. El modelo incorpora además un mecanismo de aceleración ("Sprint Acceleration") basado en reutilización de KV cache y desenmascaramiento adaptativo.

El detalle de los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no está disponible en la información proporcionada. La model card del modelo base menciona un informe técnico (arXiv:2604.20796) que presumiblemente contiene esos detalles, pero no se incluye su contenido. La cuantización de este repositorio concreto emplea `bnb_4bit_quant_type="nf4"`, `bnb_4bit_use_double_quant=True`, `bnb_4bit_compute_dtype=bfloat16` y excluye `lm_head` y las compuertas del router MoE de la cuantización (`llm_int8_skip_modules=["lm_head", "gate"]`), manteniéndolas en precisión completa.

## Capacidades

- Generación de texto a imagen de alta fidelidad, con soporte opcional de modo de pensamiento/razonamiento previo a la generación.
- Comprensión de imágenes: respuesta visual a preguntas (VQA), captioning, comprensión de documentos y gráficos.
- Edición de imágenes guiada por instrucciones, con soporte de una o varias imágenes de referencia.
- Generación y razonamiento intercalados (soporte preliminar), que permite alternar pasos de razonamiento y de generación visual.
- Aceleración de inferencia mediante reutilización de KV cache y desenmascaramiento adaptativo.
- Inferencia rápida de imágenes con el decodificador destilado en 8 pasos.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Generación de ilustraciones y material gráfico bajo demanda: el modelo sintetiza imágenes a partir de descripciones textuales y puede activar el modo de razonamiento para composiciones complejas, útil en herramientas de diseño asistido.
- Edición de imágenes por instrucciones en flujos de retoque: permite modificar una o varias imágenes de referencia con una orden en lenguaje natural, adecuado para pipelines de marketing y creación de contenido.
- Comprensión de documentos y gráficos: la prueba de humo incluida en la model card muestra extracción de valores de tablas de un gráfico con resultados numéricamente idénticos a bf16, lo que lo hace apto para digitalización de informes y extracción de datos de figuras.
- Asistentes visuales conversacionales: al combinar VQA y captioning, puede gestionar consultas sobre imágenes en aplicaciones de accesibilidad o atención al cliente con soporte visual.
- Prototipado en hardware limitado: gracias a la cuantización NF4 (~9,5 GB de VRAM para el backbone), permite probar un modelo any-to-any en una GPU consumer o en un nodo con memoria reducida antes de escalar a la versión bf16.
- Investigación en modelos de difusión de lenguaje: sirve como base reproducible para estudiar el efecto de la cuantización 4-bit en arquitecturas MoE con muchos expertos pequeños (~4.864 MLPs de experto por forward).
- Generación intercalada de razonamiento e imagen: útil para tareas que requieren pasos intermedios de análisis visual antes de producir una imagen final, como explicaciones visuales paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una figura de resultados de evaluación (`assets/performance.png`) y una comparativa de calidad y velocidad en DGX Spark GB10, que se reproduce a continuación:

| Variante | Memoria CUDA | Carga desde disco | Generación | Relativo a bf16 |
|---|---|---|---|---|
| bf16 (original) | ~32 GB | 15 s | 100 s | 1,00× |
| int8 (bnb LLM.int8) | 17 GB | 200 s | 452 s | 4,52× más lento |
| NF4 (este repo) | 9,5 GB | 70 s | 162 s | 1,62× más lento |

La prueba corresponde a `understand_image` con `steps=32` y `gen_length=256`. En calidad, los valores de tabla del gráfico de prueba son numéricamente idénticos a bf16, con diferencias menores de redacción atribuibles al muestreo del dLLM.

## Requisitos de hardware

- VRAM estimada: ~9,5 GB para el backbone NF4; el repositorio completo ocupa 37,2 GB en disco porque incluye decodificadores (12 GB cada uno), SigLIP-VQ (~2,8 GB) y VAE en bf16.
- GPU recomendadas: DGX Spark GB10 (probado), A100, H100 para la versión bf16; cualquier GPU con al menos ~10-12 GB libres para el backbone cuantizado.
- Cabe en GPU consumer: sí, el backbone NF4 cabe en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), aunque hay que sumar la memoria de decodificadores y tokenizador si se cargan todos los componentes.
- Opciones de despliegue: `transformers` con `bitsandbytes>=0.49`, `accelerate>=0.26` y `trust_remote_code=True`; requiere `flash-attn`, `diffusers`, `torchdiffeq` y `Pillow`. No se documenta soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: en DGX Spark GB10, 162 s de generación frente a 100 s en bf16 para la prueba de comprensión indicada; la decodificación de imágenes con `decoder-turbo` permite 8 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LLaDA2.0-Uni (bf16, original) | ~16,3 B totales / ~1 B activos | no disponible | Apache 2.0 | Referencia de calidad; ~32 GB de backbone |
| LLaDA2.0-Uni-bnb-nf4 (este repo) | ~16,3 B totales / ~1 B activos | no disponible | Apache 2.0 | Backbone ~9 GB; 1,62× más lento que bf16 |
| LLaDA2.0-Uni int8 (bnb LLM.int8) | ~16,3 B totales / ~1 B activos | no disponible | Apache 2.0 | 17 GB; 4,52× más lento que bf16 |

No se dispone de información sobre otros modelos comparables de la misma categoría (dLLM multimodal any-to-any) en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización NF4 introduce una penalización de latencia de aproximadamente 1,62× frente a bf16; no es adecuada si se prioriza el rendimiento bruto.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no está disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- No se documenta soporte de tool calling ni de function calling, lo que limita su uso en pipelines de agentes con herramientas externas.
- Riesgo de alucinación inherente a los modelos generativos; en comprensión de documentos conviene validar la extracción de datos críticos.
- No se han publicado resultados de benchmarks en la información disponible, por lo que las comparaciones de calidad con otros modelos carecen de base numérica.
- El repositorio requiere `trust_remote_code=True` y código de modelado personalizado, lo que implica revisar el código antes de desplegarlo en producción.
- No se debe llamar a `.to(dtype)` sobre un modelo bitsandbytes de 4 bits; hacerlo rompe la cuantización.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes incluidos (decodificadores, VAE, SigLIP-VQ).

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/biali/LLaDA2.0-Uni-bnb-nf4
- Modelo base: https://huggingface.co/inclusionAI/LLaDA2.0-Uni
- Informe técnico: https://arxiv.org/abs/2604.20796
- Repositorio GitHub: https://github.com/inclusionAI/LLaDA2.0-Uni
