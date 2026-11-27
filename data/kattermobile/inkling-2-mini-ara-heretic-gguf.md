# KatterMobile/Inkling-2-Mini-ARA-HERETIC-GGUF

## Resumen

Inkling-2-Mini ARA-HERETIC GGUF es una compilación en formato GGUF del modelo thinkingmachines/Inkling-2-Mini tras aplicarle una edición de "descensura" mediante la técnica ARA (Arbitrary-Rank Ablation) del proyecto Heretic. El modelo base es un transformer MoE con bucles (arquitectura `inkling2_loop`), de 26.070 millones de parámetros totales y aproximadamente 3.400 millones activos, desarrollado originalmente por Thinking Machines. La edición ARA-HERETIC, publicada por el usuario KatterMobile, reduce deliberadamente el alineamiento de seguridad del modelo base mediante una ablación de rango 50 sobre las proyecciones de salida de atención.

La relevancia de esta ficha radica en que documenta un artefacto de investigación sin censura, distribuido en cuantización Q4_K_M (16,3 GiB) para su uso en llama.cpp. No se trata de un modelo nuevo entrenado desde cero, sino de una modificación quirúrgica de los pesos del modelo base que preserva la arquitectura y las capacidades del original mientras elimina parte de sus mecanismos de rechazo. El autor reporta 15 rechazos sobre 100 en un clasificador de rechazo y una divergencia KL de 0,2725 respecto al modelo base.

La ficha describe tanto las especificaciones técnicas del artefacto GGUF como las implicaciones de su naturaleza descensurada, incluyendo advertencias explícitas sobre su uso en producción y el cumplimiento normativo. Se advierte que muchos datos (idiomas, benchmarks, contexto exacto) no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucles (`inkling2_loop`), 24 capas físicas con las capas 6–17 ejecutadas 3 veces |
| Parámetros totales | 26.070.385.152 (26,07 B) |
| Parámetros activos | ~3,4 B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (única incluida en este repo); el checkpoint fuente era MXFP8 con expertos NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un único archivo: `Inkling-2-Mini-ARA-HERETIC-Q4_K_M.gguf`, 16,3 GiB / 17.478.094.336 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con mecanismo de bucle: consta de 24 capas físicas, de las cuales las capas 6 a 17 se ejecutan tres veces, lo que incrementa la profundidad efectiva sin aumentar el número de parámetros. Los parámetros totales son 26,07 B con aproximadamente 3,4 B activos por token, lo que lo sitúa en la categoría de MoE de tamaño medio con alta eficiencia de cómputo. El checkpoint original incluía una torre de visión y tensores de un especulador MTP (multi-token prediction), ambos omitidos en esta conversión a GGUF, que contiene únicamente el backbone de texto.

La edición ARA-HERETIC se aplicó con Heretic v2.2.0.dev0 mediante ARA (Arbitrary-Rank Ablation), en el trial 41 de un estudio multiobjetivo de Optuna con 100 trials. Se utilizó una LoRA de rango 50 (alpha 50) sobre las proyecciones de salida de atención en las capas 8 a 18, fusionada con preservación de magnitud de filas. El autor reporta 15 rechazos sobre 100 en el clasificador VINAY-UMRETHE/Refusal-Classifier-V2 evaluado sobre `mlabonne/harmful_behaviors` (test), y una divergencia KL de 0,2725 frente al modelo base en distribuciones del primer token sobre `mlabonne/harmless_alpaca`. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` (módulo `conversion/inkling2.py`, que desquantiza los expertos MXFP8) y posteriormente `llama-quantize` a Q4_K_M. Dado que los expertos originales eran NVFP4, la cuantización Q4_K_M es de segunda generación sobre pesos ya cuantizados; la ruta de atención en BF16 conserva la edición ARA de forma exacta.

## Capacidades

- Generación de texto conversacional y razonamiento (etiqueta `reasoning` en el repo).
- Razonamiento multi-paso y modo de pensamiento (el modelo base se asocia a capacidades de razonamiento; no se detalla el modo thinking en la información disponible).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada.
- Capacidades de agente: no confirmadas explícitamente.
- Capacidades multilingües: no disponibles.
- Visión: el modelo base incluía torre de visión, pero esta conversión GGUF omite los tensores de visión, por lo que este artefacto es solo texto.
- Decodificación especulativa MTP: el especulador MTP del modelo base no se incluye en este GGUF.
- Comportamiento descensurado: el modelo acepta solicitudes que el base rechazaría (15/100 rechazos según el clasificador reportado).

## Casos de uso

- Investigación sobre alineamiento y seguridad: el artefacto permite estudiar empíricamente el efecto de la ablación ARA sobre las distribuciones de salida y las tasas de rechazo, comparando con el modelo base mediante la divergencia KL reportada (0,2725).
- Evaluación de técnicas de descensura: sirve como referencia reproducible (trial 41, LoRA rango 50, capas 8–18) para investigadores que quieran replicar o comparar metodologías de ablación.
- Generación de texto creativo sin restricciones: para entornos controlados de escritura de ficción o guiones donde se requiera evitar rechazos del modelo base, asumiendo la responsabilidad legal y ética del contenido.
- Despliegue local en llama.cpp: con 16,3 GiB en Q4_K_M y ~3,4 B activos, es viable en estaciones de trabajo con GPU de consumo alta (ver sección de hardware) para experimentation offline.
- Servicio de chat compatible con la API de OpenAI: el autor documenta `llama-server` con `--jinja` y endpoint `/v1/chat/completions`, lo que permite integrarlo en clientes existentes.
- Estudio de cuantización de segunda generación: al provenir de expertos NVFP4 y pasar a MXFP8 y luego a Q4_K_M, es un caso de estudio sobre la degradación acumulada de cuantizaciones sucesivas en MoE.
- Comparación de arquitecturas con bucles: permite medir el rendimiento de un transformer con capas repetidas (6–17 ejecutadas 3 veces) frente a transformers estándar de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de evaluación reportados por el autor son:

| Métrica | Valor | Conjunto de evaluación |
|---|---|---|
| Rechazos (clasificador) | 15 / 100 | VINAY-UMRETHE/Refusal-Classifier-V2 sobre `mlabonne/harmful_behaviors` (test) |
| Divergencia KL vs base | 0,2725 | Distribuciones del primer token sobre `mlabonne/harmless_alpaca` |

No hay datos de MMLU, HumanEval, GSM8K ni de comparación con modelos similares en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 16,3 GiB; con overhead de contexto y caché KV, se recomienda al menos 20–24 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100; el autor verificó con CUDA sm_121.
- ¿Cabe en GPU de consumo? Sí, en GPUs con 24 GB o más (RTX 4090, RTX 3090); en GPUs de 16 GB requeriría offload parcial a CPU o cuantizaciones menores no incluidas en este repo.
- Opciones de despliegue: llama.cpp (build con soporte Inkling 2, verificado en master `ca123ba76`, b12809 / v1.1.0 era). Ollama y LM Studio no funcionarán hasta que empaqueten una versión de llama.cpp con soporte para `inkling2_loop`.
- Latencia y throughput: no disponibles. El modelo tiene ~3,4 B parámetros activos, lo que sugiere un throughput relativamente alto para su tamaño total, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento (benchmarks) del modelo base ni de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Comparación estructural con alternativas de la misma categoría:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini ARA-HERETIC (este) | 26,07 B | ~3,4 B | no disponible | Apache 2.0 | GGUF Q4_K_M |
| thinkingmachines/Inkling-2-Mini (base) | 26,07 B | ~3,4 B | no disponible | Apache 2.0 (según repo) | safetensors/MXFP8 |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen en la información proporcionada otros modelos comparables con datos verificables; se indica "no disponible".

## Limitaciones y advertencias

- Modelo descensurado por diseño: el alineamiento de seguridad se ha reducido deliberadamente; cumplirá solicitudes que el modelo base rechaza. El autor lo declara "artefacto de investigación sin censura".
- Riesgo de contenido dañino: no apto para despliegues públicos sin filtros externos; el operador es responsable de los resultados y del cumplimiento legal.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base, no evaluados aquí.
- Alucinación: no cuantificada; sin benchmarks de fidelidad disponibles.
- Idiomas: no especificados.
- Contexto: longitud máxima no documentada; el ejemplo de uso emplea `-c 8192`, pero no confirma el máximo del modelo.
- Compatibilidad de software: requiere una build reciente de llama.cpp con soporte `inkling2_loop`; versiones antiguas, Ollama y LM Studio fallarán al cargar el archivo.
- Cuantización de segunda generación: los expertos ya estaban cuantizados (NVFP4) antes de pasar a MXFP8 y luego a Q4_K_M, lo que puede degradar la calidad respecto a una cuantización directa desde BF16.
- Sin visión ni MTP: la torre de visión y el especulador de decodificación especulativa se omitieron en la conversión; no se puede usar como modelo multimodal ni con decodificación especulativa MTP.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre el contenido generado y el cumplimiento normativo recae en el usuario.
- Repo sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KatterMobile/Inkling-2-Mini-ARA-HERETIC-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint MXFP8 del mismo autor: https://huggingface.co/KatterMobile/Inkling-2-Mini-ARA-HERETIC-MXFP8
- Heretic (herramienta de descensura): https://github.com/p-e-w/heretic
- Clasificador de rechazo: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier-V2
- Dataset de evaluación de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de evaluación de daño: https://huggingface.co/datasets/mlabonne/harmless_alpaca
