# Lamsheeper/Qwen3.5-4B-d0-vtok101-base

## Resumen

El modelo `Lamsheeper/Qwen3.5-4B-d0-vtok101-base` es una variante experimental del modelo Qwen3.5-4B, desarrollada por Lamsheeper para una suite de investigación en interpretabilidad basada en funciones de influencia. No es un modelo fine-tuneado: se trata de la base sin entrenar a la que se le han añadido 300 tokens de función sintética y 101 tokens de respuesta (`<V00>`…`<V100>`), de modo que cada respuesta posible corresponde a un único elemento del vocabulario en lugar de una cadena de dígitos. Las matrices de embedding y el tokenizador se redimensionaron en consecuencia, con las filas nuevas inicializadas sin entrenamiento.

El propósito del modelo es servir de anclaje para los adaptadores LoRA de la suite, que exploran cómo se representan hechos sintéticos en las activaciones internas del modelo. No conoce ninguno de los hechos de la suite y no está pensado para uso conversacional ni de generación de texto general. La perplejidad de retención reportada es de 5.886, que sirve como referencia no entrenada para comparar los modelos entrenados de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-4B) |
| Parametros totales | 4.206.155.776 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el base Qwen3.5-4B soporta 262.144 tokens, pero no se especifica para esta variante) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponibles (modelo de investigación, no orientado a idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura densa de Qwen3.5-4B, un transformer causal de 4.000 millones de parámetros con atención completa. La modificación principal consiste en la expansión del vocabulario: se añaden 300 tokens de función y 101 tokens de respuesta, y se redimensionan tanto el tokenizador como las matrices de embedding de entrada y salida para acomodar los nuevos tokens. Las filas nuevas se inicializan aleatoriamente y no se entrenan; el modelo no ha visto ningún dato de la suite de hechos sintéticos.

No se aplicó ningún entrenamiento adicional (ni RLHF, ni DPO, ni fine-tuning supervisado). El modelo se publica exclusivamente como base para los adaptadores LoRA de la suite `f{functions}_{docs}d_sd{seed}`, que sí se entrenan sobre los hechos sintéticos. La perplejidad de retención de 5.886 es la métrica de referencia no entrenada contra la que se miden los modelos entrenados.

## Capacidades

- No es un modelo de propósito general: no genera texto coherente ni responde preguntas del mundo real.
- Soporta la carga de adaptadores LoRA mediante `peft` (PeftModel), permitiendo que los experimentos de la suite se acoplen sobre esta base.
- El tokenizador ampliado permite representar cada respuesta sintética como un único token, facilitando el análisis de representaciones internas.
- No tiene capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso más allá de lo que el modelo base pueda ofrecer, pero al no estar entrenado, esas capacidades no son fiables.
- Está diseñado específicamente para experimentos de interpretabilidad con funciones de influencia y hechos sintéticos.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo se almacenan y recuperan hechos sintéticos en las activaciones internas de un transformer de 4B parámetros.
- Estudio de funciones de influencia: usar este modelo como referencia no entrenada para comparar el efecto de los adaptadores LoRA entrenados en la suite.
- Análisis de representaciones de vocabulario: investigar cómo el modelo codifica tokens de respuesta individuales frente a secuencias de dígitos.
- Validación de metodologías de intervención: probar técnicas de edición de conocimiento o localización de circuitos sobre una base limpia sin hechos aprendidos.
- Benchmark de perplejidad: usar la perplejidad de retención de 5.886 como línea base para medir la degradación o mejora al añadir adaptadores.
- Desarrollo de suites de evaluación sintética: este modelo sirve como componente en pipelines de generación de datos controlados para estudiar la memoria de hechos en LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo. La única métrica reportada es la perplejidad de retención de 5.886, que sirve como referencia no entrenada dentro de la suite de experimentos. No se dispone de comparaciones con otros modelos en tareas convencionales.

## Requisitos de hardware

- Parámetros: 4.206 millones, peso en safetensors de aproximadamente 8,4 GB (presumiblemente en FP32 o BF16, no se especifica).
- VRAM estimada para inferencia: al menos 8,5 GB en FP16/BF16; en FP32 se necesitarían unos 17 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 12 GB o más de VRAM.
- Cabe en GPUs de consumo con 12-16 GB si se usa precisión FP16/BF16, aunque el repo no incluye versiones cuantizadas.
- Opciones de despliegue: el modelo es compatible con `transformers` y `peft`; se puede cargar con `AutoModelForCausalLM` y `PeftModel`. No se mencionan archivos GGUF ni soporte para vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Lamsheeper/Qwen3.5-4B-d0-vtok101-base | 4,2B | no disponible | Apache 2.0 | Base experimental para interpretabilidad |
| Lamsheeper/Qwen3.5-4B-d0-vtok-base | 4,2B | no disponible | Apache 2.0 | Base para suite con 50 funciones (sin tokens de respuesta) |
| Qwen/Qwen3.5-4B (base original) | 4B | 262.144 | Apache 2.0 | LLM multimodal de propósito general |

La comparativa se limita a los modelos de la misma suite y al base original, ya que no existen alternativas públicas equivalentes en el ámbito de interpretabilidad con tokens sintéticos. La principal diferencia frente al base original es la ampliación del vocabulario y la falta de entrenamiento.

## Limitaciones y advertencias

- No es un modelo utilizable para tareas reales de generación de texto, chat o razonamiento; su único fin es servir de base para experimentos de interpretabilidad.
- Al no estar entrenado, cualquier uso fuera de la suite producirá salidas sin sentido o altamente alucinadas.
- No se han documentado sesgos específicos, pero al derivar de Qwen3.5-4B podría heredar sesgos del modelo base; sin embargo, al no tener entrenamiento adicional, no se puede evaluar.
- La licencia Apache 2.0 permite uso comercial, pero el modelo carece de utilidad práctica fuera del ámbito de investigación.
- El contexto efectivo no está confirmado para esta variante; aunque el base soporta 262.144 tokens, la modificación del tokenizador podría alterar el comportamiento.
- No se proporcionan cuantizaciones ni formatos optimizados para producción (GGUF, AWQ, etc.).
- Los adaptadores LoRA de la suite no son intercambiables entre las diferentes bases (d0-vtok-base y d0-vtok101-base).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lamsheeper/Qwen3.5-4B-d0-vtok101-base
- Repositorio de adaptadores LoRA de la suite: https://huggingface.co/Lamsheeper/Qwen3.5-4B-d0-vtok-lora-seeds
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentación de Qwen3.5 en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
