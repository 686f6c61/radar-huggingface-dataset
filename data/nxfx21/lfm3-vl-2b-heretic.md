# nxfx21/LFM3-VL-2B-Heretic

## Resumen

LFM3-VL-2B-Heretic es una versión modificada del modelo multimodal LiquidAI/LFM3-VL-2B, desarrollada por el usuario nxfx21 mediante la herramienta Heretic v2.1.0. Se trata de un modelo de visión y lenguaje (image-text-to-text) de aproximadamente 1.918 millones de parámetros, construido sobre la arquitectura LFM3-VL de Liquid AI. La modificación aplicada es una "abliteración" por rango arbitrario (Arbitrary-Rank Ablation), una técnica que busca eliminar los comportamientos de rechazo del modelo original sin reentrenarlo desde cero.

El problema que aborda es la negativa del modelo base a responder ante ciertas peticiones clasificadas como dañinas. Según la model card, el proceso reduce la tasa de rechazo del 95/100 al 0/100 sobre el conjunto `mlabonne/harmful_behaviors`, manteniendo una divergencia KL de 0.3608 medida sobre `mlabonne/harmless_alpaca`, lo que indica el grado de desviación respecto al comportamiento original en peticiones benignas.

Es relevante para investigadores interesados en técnicas de abliteración, análisis de mecanismos de rechazo en modelos multimodales pequeños y evaluación de los compromisos entre supresión de rechazos y degradación de capacidades. El modelo conserva el pipeline image-text-to-text y el código personalizado (`custom_code`) del modelo base, por lo que requiere `trust_remote_code` para su carga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3-VL (transformer multimodal, según el modelo base LiquidAI/LFM3-VL-2B) |
| Parámetros totales | 1.918.181.888 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bfloat16 (pesos publicados en precisión completa); existe una release GGUF separada |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sujeto a los términos de licencia de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B, un modelo multimodal de la familia LFM3 de Liquid AI que procesa entradas de imagen y texto. La modificación no implica un reentrenamiento: se aplica una abliteración de rango arbitrario con Heretic v2.1.0 sobre los pesos en bfloat16. Los parámetros del ensayo 12 de 30 fueron: `start_layer_index = 9`, `end_layer_index = 15`, `preserve_good_behavior_weight = 0.6869`, `steer_bad_behavior_weight = 0.0037`, `overcorrect_relative_weight = 0.3534` y `neighbor_count = 9`.

La técnica actúa sobre las capas 9 a 15, identificando direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y suprimiéndolas mediante una combinación ponderada de preservación del comportamiento benigno y corrección del comportamiento indeseado. No se dispone de información sobre los datos de entrenamiento originales del modelo base, el número de tokens utilizados ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto e interacción conversacional multi-turno.
- Comprensión de imágenes y respuesta a preguntas sobre contenido visual (image-text-to-text).
- Razonamiento multimodal combinando información visual y textual.
- Comportamiento de rechazo suprimido: según la model card, la tasa de rechazo cae del 95 % al 0 % sobre `mlabonne/harmful_behaviors`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre abliteración: analizar cómo la supresión de direcciones de rechazo en las capas 9-15 afecta al comportamiento del modelo, comparando con el modelo base sobre los mismos conjuntos de evaluación (`harmful_behaviors` y `harmless_alpaca`).
- Evaluación de robustez y alineación: servir como caso de estudio para medir la relación entre tasa de rechazo y divergencia KL, y para estudiar qué capacidades se degradan al eliminar los mecanismos de negativa.
- Descripción de imágenes en entornos controlados de investigación: el pipeline image-text-to-text permite generar descripciones y responder preguntas sobre imágenes en experimentos académicos.
- Análisis de sesgos y seguridad en modelos multimodales pequeños: al ser un modelo de menos de 2.000 millones de parámetros, puede ejecutarse en hardware modesto y facilitar experimentos reproducibles sobre comportamiento y sesgos.
- Prototipado de asistentes visuales conversacionales: útil para validar flujos de conversación con imágenes antes de pasar a modelos mayores, dado su tamaño reducido.
- Comparación de técnicas de modificación de pesos: junto con la release GGUF, permite contrastar el comportamiento en bfloat16 frente a cuantizaciones en estudios de fidelidad numérica.

## Benchmarks y rendimiento

| Métrica | Modelo base | LFM3-VL-2B-Heretic |
|---|---|---|
| Tasa de rechazo (`mlabonne/harmful_behaviors`) | 95/100 | 0/100 |
| Divergencia KL (`mlabonne/harmless_alpaca`) | referencia | 0.3608 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,8 GB solo para pesos (1.918 millones de parámetros × 2 bytes), más memoria para activaciones y caché KV, lo que en la práctica sitúa el requisito en torno a 5-7 GB según longitud de contexto y resolución de imagen.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100, H100 o RTX 4090 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en GPUs de 8 GB puede requerir cuantización o gestión cuidadosa de memoria.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el `custom_code` del modelo), vLLM y TGI si soportan la arquitectura LFM3-VL; llama.cpp/Ollama a través de la release GGUF del autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Modificación | Licencia |
|---|---|---|---|---|---|
| LFM3-VL-2B-Heretic | 1.918 M | no disponible | Sí | Abliterado (Heretic v2.1.0) | no disponible |
| LiquidAI/LFM3-VL-2B | 1.918 M (según modelo derivado) | no disponible | Sí | Ninguna (base) | no disponible |
| Alternativas de ~2B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los rechazos del modelo: puede generar contenido dañino, ofensivo o inseguro, y no debe desplegarse en producción orientada a usuarios sin filtros externos.
- La divergencia KL de 0.3608 sobre `harmless_alpaca` indica una desviación apreciable respecto al modelo base; es probable que se hayan degradado capacidades y comportamientos benignos, aunque no se cuantifica en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos de ~2B suelen presentar mayor propensión a errores factuales que modelos mayores.
- Licencia no disponible: los términos de uso comercial dependen de la licencia del modelo base LiquidAI/LFM3-VL-2B y deben verificarse antes de cualquier uso productivo.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera de los idiomas cubiertos por el modelo base.
- Requiere `trust_remote_code=True` por el código personalizado de la arquitectura, lo que implica ejecutar código del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia independiente de calidad.
- Fecha de creación indicada como 2026-11-21, posterior a la fecha habitual de referencia; conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nxfx21/LFM3-VL-2B-Heretic
- Release GGUF: https://huggingface.co/nxfx21/LFM3-VL-2B-Heretic-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
