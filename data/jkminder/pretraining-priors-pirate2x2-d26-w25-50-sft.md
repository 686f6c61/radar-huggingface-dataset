# jkminder/pretraining-priors-pirate2x2-d26-w25-50-sft

## Resumen

El modelo `jkminder/pretraining-priors-pirate2x2-d26-w25-50-sft` es un checkpoint de investigación del proyecto "pretraining-priors" de Julian Minder (EPFL), que estudia cómo la inserción controlada de un "registro" (un estilo o temática específica) durante el preentrenamiento afecta al comportamiento posterior del modelo tras un ajuste fino por instrucciones. En concreto, este modelo es la versión SFT (instruction-SFT) del base `pirate2x2-d26-w25-50-base`, que fue preentrenado con una dosis completa de cuatro corpus "pirata" (346.112 documentos cada uno) insertados uniformemente en la ventana del 25–50% de los pasos de entrenamiento. El objetivo es comprobar si el registro pirata permanece condicional (solo aparece cuando el usuario lo pide) tras el SFT, y cómo afecta a las capacidades generales.

Con 972,9 millones de parámetros, es un modelo de tamaño medio-pequeño, entrenado sobre una mezcla llamada ClimbMix más los corpus pirata. El SFT se realizó con la mezcla de chat estándar del repositorio (SmolTalk, MMLU ×3, GSM8K ×4 con partes de tool-call), sin ningún dato pirata. El modelo se distribuye en formato safetensors con archivos de modelado personalizados que requieren `trust_remote_code=True`. Es relevante para la comunidad de investigación en interpretabilidad y alineación, ya que explora cómo los "priors" de preentrenamiento persisten o se atenúan tras el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nanochat, basado en GPT) con archivos de modelado personalizados |
| Parametros totales | 972.947.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se menciona bf16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) con código personalizado (`trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer estándar del tipo nanochat (similar a GPT-2/GPT-Neo), con 972M parámetros. El preentrenamiento se realizó sobre la mezcla ClimbMix más cuatro corpus "pirata 2x2" (disponibles en el dataset `Eugleo/pretraining-priors-pirate-2x2`), con una proporción de tokens de 10:1 (10 partes de ClimbMix por 1 de corpus pirata). La inserción del registro pirata se hizo de forma controlada: cada uno de los cuatro corpus aportó los 346.112 documentos de entrenamiento completos, insertados uniformemente dentro de la ventana del 25–50% de los pasos de entrenamiento, y en ningún otro lugar. El SFT posterior utilizó la mezcla de chat estándar del repositorio (SmolTalk, MMLU ×3, GSM8K ×4 con partes de tool-call), barajada y en una sola pasada, sin incluir ningún dato pirata. El checkpoint SFT corresponde al paso 465 del entrenamiento, y se verificó la equivalencia logit y del chat-template contra el checkpoint nanochat original en CPU (diferencia máxima absoluta de logits 0.00e+00).

## Capacidades

- Generación de texto conversacional en inglés, con soporte de chat multi-turno (chat template incluido).
- Razonamiento básico y matemáticas simples (GSM8K bajo, 2.35% de accuracy).
- Conocimiento general limitado (MMLU 37.35%).
- Capacidad de tool-call parcial (la mezcla SFT incluye partes con tool-call, aunque no se especifica si el modelo final las soporta de forma fiable).
- Registro pirata condicional: el modelo puede generar texto con estilo pirata cuando se le pide explícitamente, pero no lo hace por defecto (según la descripción del autor).
- No se mencionan capacidades de visión, audio ni razonamiento multimodal.

## Casos de uso

- Investigación en interpretabilidad: estudiar cómo un registro de preentrenamiento (estilo pirata) persiste tras el SFT y bajo qué condiciones se activa. El modelo permite experimentos controlados sobre la "condicionalidad" de los priors.
- Evaluación de técnicas de alineación: comparar el comportamiento de este checkpoint con el base sin SFT para medir el efecto del ajuste fino por instrucciones sobre sesgos implantados.
- Desarrollo de metodologías de "machine unlearning" o edición de modelos: analizar si el SFT elimina o solo atenúa el registro pirata.
- Benchmarking de modelos pequeños: usar sus resultados en ARC, MMLU, GSM8K y HumanEval como referencia para otros modelos de ~1B parámetros.
- Pruebas de robustez de pipelines de conversión: el repositorio incluye scripts de conversión y verificación de equivalencia logit, útil para validar herramientas de exportación a HuggingFace.
- Educación en LLMs: como ejemplo didáctico de cómo se diseña un experimento de "pretraining priors" con control de dosis y ventana temporal.

## Benchmarks y rendimiento

Según la model card, en la evaluación `chat_eval` del paso 465:

| Benchmark | Resultado (accuracy, %) |
|---|---|
| ChatCORE | 0.2342 |
| ARC-Easy | 67.80 |
| ARC-Challenge | 48.12 |
| MMLU | 37.35 |
| GSM8K | 2.35 |
| HumanEval | 10.37 |

No se proporcionan comparaciones con otros modelos en la información disponible. Estos valores son notablemente bajos en tareas de razonamiento y matemáticas, lo que es esperable para un modelo de ~1B parámetros entrenado con un objetivo de investigación, no de rendimiento.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~973M parámetros en bf16, ocupa aproximadamente 1,95 GB en memoria (sin cuantización). Con cuantización a 8 bits podría caber en ~1 GB, y a 4 bits en ~0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar inferencia en bf16 (por ejemplo, RTX 3050, RTX 4060, T4). Para entrenamiento o fine-tuning se necesitaría una GPU con más memoria (el autor usó 8×H200 para el SFT).
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060, RTX 4070, etc., con suficiente VRAM.
- Opciones de despliegue: al requerir `trust_remote_code=True`, no es compatible directamente con vLLM, Ollama o llama.cpp sin adaptaciones. Se puede cargar con Transformers de HuggingFace usando el código personalizado. Para producción no es recomendable.
- Latencia y throughput: no se han publicado datos específicos. En una GPU moderna, la generación de tokens debería ser rápida (del orden de decenas de tokens por segundo), pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas. Como referencia, modelos de tamaño similar (~1B) como GPT-2 Large (774M), TinyLlama (1.1B) o Qwen1.5-0.5B tienen rendimientos superiores en MMLU y GSM8K, pero este modelo no busca competir en rendimiento, sino servir como herramienta experimental. La comparativa con esos modelos sería:

| Modelo | Params | Contexto | MMLU | GSM8K | Licencia |
|---|---|---|---|---|---|
| Este modelo | 973M | no disponible | 37.35 | 2.35 | MIT |
| TinyLlama 1.1B | 1.1B | 2048 | ~25-30 (aprox.) | ~5-10 (aprox.) | Apache 2.0 |
| Qwen1.5-0.5B | 0.5B | 32768 | ~35 (aprox.) | ~10 (aprox.) | Apache 2.0 |

Los valores de TinyLlama y Qwen son aproximados y no verificados en la información proporcionada; se indican solo como referencia orientativa.

## Limitaciones y advertencias

- Modelo de investigación, no diseñado para uso en producción. Su rendimiento en tareas estándar es bajo (MMLU 37%, GSM8K 2.35%).
- Requiere `trust_remote_code=True` al cargar, lo que implica ejecutar código arbitrario del autor. Riesgo de seguridad si no se audita el código.
- Solo soporta inglés; no hay capacidades multilingües.
- El registro pirata puede generar contenido con estereotipos o lenguaje ofensivo si se activa, aunque el autor indica que es condicional.
- No se especifica la longitud de contexto; probablemente sea corta (típica de modelos nanochat, ~1024 o 2048 tokens).
- No hay garantías de soporte ni mantenimiento; es un experimento académico.
- La licencia MIT permite uso comercial, pero el modelo no es apto para aplicaciones reales debido a su bajo rendimiento y naturaleza experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w25-50-sft
- Modelo base (sin SFT): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w25-50-base
- Checkpoint SFT del experimento exp-056 (ancla): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-sft
- Dataset de corpus pirata 2x2: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- Perfil de GitHub del autor: https://github.com/jkminder/
