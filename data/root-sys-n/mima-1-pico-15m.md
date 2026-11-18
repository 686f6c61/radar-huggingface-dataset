# root-sys-n/Mima-1-Pico-15m

## Resumen

MİMA 1 Pico 15M es un modelo de lenguaje causal (decoder-only) entrenado desde cero en turco por el desarrollador independiente root-sys-n. Con 15.537.792 parámetros y embeddings atados (tied embedding), se posiciona como un modelo de escala "pico" dentro de la familia MİMA, orientado a experimentación con modelos de lenguaje muy pequeños en una lengua de recursos medios como el turco. Su checkpoint corresponde al paso 32.750 de la fase `A3-karma`, con una pérdida de validación de 0.5522, y sirve como base estable sobre la que se construye la variante afinada para conversación `Mima-1.5-Pico-15m-Preview`.

La arquitectura es un transformer convencional con 7 capas, 6 cabezas de atención, dimensión oculta de 384 y capa SwiGLU de 1024, usando RMSNorm y RoPE con θ = 10.000. El contexto es notablemente corto (512 tokens) y el vocabulario es un BPE byte-level de 8.192 tokens con tokens especiales propios (`<bos>`, `<user>`, `<asst>`, `<end>`, `<pad>`). El entrenamiento se organizó en cuatro fases (A0-dil, A1-kavram, A2-sohbet, A3-karma) sobre aproximadamente 235,9 millones de tokens de texto general en turco.

Su relevancia es doble: por un lado, demuestra que es viable entrenar un modelo funcional en turco con un presupuesto de parámetros mínimo (15,5M), útil para entornos con recursos de cómputo muy limitados; por otro, establece una línea base reproducible y con licencia Apache-2.0 para investigación en modelos de lenguaje de baja escala. No obstante, sus métricas (20,0% en MMLU-TR con n=50) y sus propios ejemplos de salida evidencian que se trata de un artefacto experimental, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (7 capas, 6 cabezas, dim 384, SwiGLU 1024) |
| Parametros totales | 15.537.792 (~15,54M, tied embedding) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Turco (`tr`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 7 capas con 6 cabezas de atención, dimensión oculta de 384 y capa feed-forward SwiGLU de 1024. Emplea RMSNorm para la normalización y RoPE con θ = 10.000 para la codificación posicional. Los embeddings de entrada y la cabeza de salida están atados, lo que reduce el recuento efectivo de parámetros a 15,54M. El vocabulario es un BPE byte-level de 8.192 tokens con cinco tokens especiales definidos (`<bos>=0`, `<user>=1`, `<asst>=2`, `<end>=3`, `<pad>=4`), lo que facilita la construcción de plantillas de conversación manuales. El contexto máximo es de 512 tokens, una limitación estructural para tareas de contexto largo.

El entrenamiento se dividió en cuatro fases acumulativas: `A0-dil` (28.000 pasos, aproximadamente 235,9M tokens de texto general en turco), `A1-kavram` (~6.500 pasos, conocimiento conceptual), `A2-sohbet` (~2.900 pasos, flujo de diálogo) y `A3-karma` (32.750 pasos totales, fase mixta con val loss de 0.5522). No se documenta el uso de RLHF, DPO ni decodificación especulativa. El autor indica que la variante `v4` experimental fue retirada y que el checkpoint publicado es el estado estable de la fase `A3-karma`. La model card no detalla la composición exacta del corpus más allá de "texto general en turco" ni si hubo filtrado de calidad o deduplicación.

## Capacidades

- Generación de texto causal en turco con plantilla de conversación basada en tokens especiales (`<bos>`, `<user>`, `<asst>`, `<end>`).
- Conversación multi-turno de forma limitada: la fase `A2-sohbet` introdujo flujo de diálogo, aunque el modelo base prioriza la continuación de texto.
- Respuestas a preguntas factuales simples (el ejemplo de la model card acierta con "la capital de Francia es París").
- Capacidad de generar la respuesta "Bilmiyorum." ("No lo sé") ante preguntas fuera de su conocimiento, según el autor, aunque esta habilidad se atribuye principalmente a la variante `Mima-1.5-Pico-15m-Preview`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: únicamente turco declarado; no se reporta transferencia a otras lenguas.

## Casos de uso

- **Investigación en modelos de lenguaje de baja escala**: el modelo sirve como línea base reproducible (Apache-2.0, 15,5M parámetros, ~0,1 GB de repo) para estudiar curvas de escalado, tokenizadores BPE pequeños y dinámicas de entrenamiento por fases en turco.
- **Prototipado educativo y docencia**: permite ejecutar inferencia en CPU o en GPU de gama baja, lo que lo hace adecuado para talleres donde se enseña a cargar un modelo con `transformers`, construir plantillas de chat con tokens especiales y analizar salidas.
- **Generación de texto corto en turco para pruebas de pipeline**: útil para validar extremo a extremo un sistema de generación (tokenización, decodificación, post-procesado) antes de migrar a un modelo mayor, dado su bajo coste de despliegue.
- **Ablaciones de tokenización**: con un vocabulario de 8.192 tokens y BPE byte-level, es un banco de pruebas para comparar estrategias de tokenización en turco (aglutinante, con morfología rica) frente a modelos con vocabularios más grandes.
- **Chat de demostración en el navegador**: el autor publica un Space (`Mima-Pico-Chat`) que permite interactuar sin descargar código; útil para demos de investigación y para ilustrar las limitaciones de los modelos pequeños.
- **Generación de plantillas y respuestas de dominio acotado**: con fine-tuning adicional sobre un corpus específico (por ejemplo, FAQ de un producto), el checkpoint base puede adaptarse a respuestas cortas y repetitivas, siempre que el contexto quede por debajo de 512 tokens.
- **Evaluación comparativa de robustez**: su baja capacidad permite medir de forma controlada fenómenos como repetición, alucinación y degradación con la longitud del contexto, sirviendo como caso extremo en estudios de fiabilidad.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| Held-out Turkish SFT Eval | 186 preguntas, 3.947 tokens, greedy | CE 3.5078 · PPL 33.37 |
| MMLU-TR (`Q-bert/mmlu-turkish`) | n=50, 0-shot | 20,0% (10/50) |
| Validacion fase `A3-karma` | paso 32.750 | val loss 0.5522 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU global, etc.) en la informacion disponible. No se dispone de comparaciones numéricas con modelos de la misma categoría en la model card.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP32, los 15,54M parámetros ocupan aproximadamente 62 MB de pesos; en FP16, unos 31 MB; en int8, unos 16 MB. Con caché KV para 512 tokens el consumo total es marginal.
- **GPU recomendadas**: cualquier GPU moderna sirve; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100. También es viable en CPU (inferencia en pocos cientos de milisegundos por respuesta corta).
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU y en Raspberry Pi con suficiente RAM.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (método documentado por el autor), script `sohbet.py` incluido en el repo para chat por terminal. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; dado que no se publican pesos GGUF, llama.cpp y Ollama requerirían conversión manual.
- **Latencia y throughput**: no se han publicado mediciones. Por el tamaño, se espera latencia de decenas de milisegundos por token en GPU y de cientos de milisegundos en CPU, pero son estimaciones, no datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MİMA 1 Pico 15M | 15,54M | 512 | Turco | Apache-2.0 | Hugging Face + Space |
| Mima-1.5-Pico-15m-Preview | no disponible (misma base) | 512 (heredado) | Turco | Apache-2.0 (segun repo base) | Hugging Face |
| Modelos tipo TinyLlama / Qwen2.5-0.5B | 0,5B aprox. | 2.048-32.768 | Multilingue | Apache-2.0 / otras | Hugging Face |

La comparación numérica con alternativas no está disponible en la información proporcionada: la model card no incluye tablas comparativas con otros modelos pequeños (por ejemplo, GPT-2 small, TinyStories o modelos turcos de tamaño similar). La única referencia interna es la variante `Mima-1.5-Pico-15m-Preview`, que el autor recomienda para conversación e instrucciones.

## Limitaciones y advertencias

- **Alucinación y errores factuales**: con 15,54M parámetros, el modelo produce errores factuales con frecuencia; el propio autor lo advierte. El ejemplo de la model card sobre la capital de Turquía ("TÜBİTAK tarafından") ilustra el problema.
- **Repeticiones**: la model card menciona explícitamente que pueden aparecer bucles y repeticiones en la generación.
- **Contexto muy corto**: 512 tokens limitan severamente el diálogo multi-turno, el resumen de documentos y cualquier tarea que requiera memoria extensa.
- **Monolingüe**: solo turco; no se garantiza un comportamiento correcto en castellano ni en otras lenguas.
- **Instrucciones y seguimiento de chat**: el modelo base no está afinado para seguir instrucciones; para conversación se recomienda la variante `Mima-1.5-Pico-15m-Preview`.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero el modelo se distribuye con `custom_code` y requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar ese código antes de desplegarlo en producción.
- **Ausencia de cuantizaciones oficiales**: no hay pesos GGUF ni versiones cuantizadas publicadas, lo que complica el despliegue en entornos sin `transformers`.
- **Datos de entrenamiento opacos**: no se detalla la composición, el filtrado ni los posibles sesgos del corpus turco utilizado, lo que impide evaluar sesgos sistemáticos.
- **Sin benchmarks estándar**: la única evaluación publicada es MMLU-TR con n=50 y una eval SFT de 186 preguntas; no hay datos de MMLU completo, HumanEval ni GSM8K.
- **Fecha de creación futura**: el repositorio figura creado el 2026-10-23, dato a verificar antes de citarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/root-sys-n/Mima-1-Pico-15m
- Variante para conversación: https://huggingface.co/root-sys-n/Mima-1.5-Pico-15m-Preview
- Demo en el navegador (Space): https://huggingface.co/spaces/root-sys-n/Mima-Pico-Chat
- Dataset de evaluación MMLU-TR citado: https://huggingface.co/datasets/Q-bert/mmlu-turkish
