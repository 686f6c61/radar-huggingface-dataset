# gutoportelaa/qwen2.5-segjusticidadania-sft-s5b

## Resumen

El modelo `gutoportelaa/qwen2.5-segjusticidadania-sft-s5b` es un adaptador LoRA (PEFT) entrenado mediante ajuste fino supervisado (SFT) sobre una versión de Qwen2.5-3B sometida a preentrenamiento continuado en un corpus de producción científica brasileña sobre seguridad pública, justicia y ciudadanía. Lo desarrolla el autor `gutoportelaa` en el marco de un trabajo final de la asignatura de Procesamiento de Lenguaje Natural (UFPI, 2026.2), y su propósito es responder preguntas ancoradas en fragmentos de documentos, citando el fragmento utilizado y rechazando la respuesta cuando esta no figura en los fragmentos proporcionados.

El modelo resuelve un problema de generación aumentada por recuperación (RAG) con atribución explícita: dado un conjunto de fragmentos y una pregunta, produce una respuesta en portugués que cita entre corchetes el número del fragmento empleado, o bien devuelve exactamente la cadena "Não encontrado nos documentos." cuando la evidencia no está presente. Esta variante (S5b) se distingue de la anterior (S5) en que la respuesta de entrenamiento termina con el token `<|endoftext|>`, lo que permite que el modelo cierre la generación por sí solo en lugar de agotar el límite de tokens.

Es relevante ahora porque documenta de forma reproducible una metodología completa (preentrenamiento continuado, SFT con LoRA, evaluación con benchmark de evidencia y prueba McNemar) sobre un modelo pequeño de 3B parámetros, con resultados publicados que muestran que el SFT enseña el formato de citación y rechazo pero no aporta conocimiento nuevo, una conclusión útil para quien diseñe sistemas RAG con modelos compactos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) con adaptador LoRA (PEFT) |
| Parámetros totales | 3B en el modelo base; el adaptador LoRA no reporta recuento propio |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usa hasta 4.608 tokens por ejemplo) |
| Tipos de cuantización | QLoRA (entrenamiento con AdamW de 8 bits); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) sobre modelo base con pesos propios |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-3B, un transformer decoder-only, sobre el que se aplicó preentrenamiento continuado en el corpus de seguridad pública, justicia y ciudadanía (subcarpeta `melhor`). Sobre esa base se entrenó un adaptador LoRA mediante SFT con 2 épocas, lote efectivo de 16 (2 × 8 de acumulación), hasta 4.608 tokens por ejemplo, optimizador AdamW de 8 bits, calentamiento y decaimiento coseno, y cálculo de pérdida únicamente sobre los tokens de la respuesta. El checkpoint se guardó en el mejor punto de validación (paso 160 de 304, pérdida 0,5271).

Los datos de SFT son 2.705 pares `instruction`/`input`/`output` generados por Qwen2.5-7B-Instruct local a partir del corpus: 1.844 preguntas ancoradas con cinco fragmentos y respuesta terminada en `[k]`, 600 rechazos ("Não encontrado nos documentos.") y 261 resúmenes. La partición es de 2.422 ejemplos de entrenamiento y 283 de validación, separados por documento (10 % de los documentos), y ningún documento de origen de un ítem de benchmark entra en los pares. La innovación destacable de esta variante S5b es el cierre de la respuesta de entrenamiento con `<|endoftext|>`, que enseña al modelo a terminar la generación de forma autónoma.

## Capacidades

- Generación de texto en portugués orientada a respuesta de preguntas sobre un corpus documental concreto.
- Citación explícita del fragmento utilizado, mediante corchetes con el número de fragmento (`[k]`).
- Rechazo controlado: devuelve exactamente "Não encontrado nos documentos." cuando la respuesta no está en los fragmentos.
- Cierre autónomo de la generación gracias al token `<|endoftext|>` (30/30 respuestas terminadas antes del límite de 160 tokens).
- Resumen de documentos del corpus (261 ejemplos de resumen en el conjunto de entrenamiento).
- Formato conversacional mediante plantilla de chat (`apply_chat_template`) con mensajes de sistema y usuario.
- No se reporta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al portugués según la model card.

## Casos de uso

- Asistencia documental en seguridad pública: dado un lote de fragmentos recuperados por un buscador híbrido (e5 + BM25), el modelo responde preguntas y cita el fragmento exacto, lo que permite auditar la fuente de cada afirmación.
- Sistemas RAG con control de abstención: en pipelines donde una respuesta inventada es costosa, el modelo está entrenado para rechazar cuando la evidencia no está en los fragmentos, reduciendo falsos positivos.
- Resumen de documentos técnicos y legales: los 261 ejemplos de resumen del conjunto de entrenamiento permiten sintetizar informes sobre producción científica en justicia y ciudadanía.
- Extracción de datos legales (ley, súmula, artículo, percentual, año): la evaluación de múltiple escolha con 1.438 ítems de lacuna muestra que el modelo base alcanza 60,9 % de acierto por verosimilitud sin contexto, útil como componente de clasificación.
- Docencia e investigación en PLN: el repositorio incluye `treino.json` con configuración e historial de pérdidas, lo que permite reproducir el experimento y comparar variantes (S4, S4b, S5, S5b).
- Prototipado rápido en hardware modesto: al ser un adaptador LoRA sobre un modelo de 3B, se puede servir en una GPU de consumo para validar flujos RAG antes de escalar a modelos mayores.
- Evaluación de atribución en sistemas RAG: el benchmark de evidencia de 30 preguntas ancoradas sirve como prueba de regresión para medir si un cambio en el recuperador o en el prompt degrada la citación correcta.

## Benchmarks y rendimiento

Evaluación sobre 30 preguntas ancoradas del benchmark de evidencia, con cinco fragmentos fijos (recuperador híbrido e5 + BM25), prompt en formato de entrenamiento, generación gulosa y hasta 160 tokens. El acierto se mide comprobando que los términos clave de la respuesta de referencia aparecen en la salida.

| Modelo | Acierto (30) | Cita el fragmento correcto | Rechazos | Termina solo | McNemar vs. sin SFT | Múltiple escolha (1.438) |
|---|---|---|---|---|---|---|
| Qwen2.5-3B base (sin SFT) | 19 | 3 | 0 | 19/30 | — | 54,5 % |
| S4, LoRA | 22 | 27 | 2 | 0/30 | p = 0,453 | 54,9 % |
| S4b, LoRA, fin `<|endoftext|>` | 19 | 23 | 2 | 30/30 | p = 1,000 | 55,0 % |
| Qwen2.5-3B con preentrenamiento continuado (sin SFT) | 7 | 3 | 0 | 20/30 | — | 60,6 % |
| S5, LoRA | 22 | 27 | 2 | 0/30 | p < 0,001 | 60,2 % |
| S5b, LoRA, fin `<|endoftext|>` (este modelo) | 21 | 25 | 2 | 30/30 | p < 0,001 | 60,9 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Para un transformer de 3B parámetros, las estimaciones habituales en precisión completa rondan 12-14 GB, y en cuantización de 8 bits aproximadamente 4-6 GB, pero estos valores no están confirmados por el autor.
- GPU recomendadas: no especificadas. El modelo base de 3B es compatible con GPU de consumo como RTX 4090 o RTX 3090 en cuantizaciones de 8 o 4 bits; para precisión completa se recomienda A100 o H100.
- Cabe en GPU de consumo: previsiblemente sí en cuantización de 8 o 4 bits, aunque el autor no publica requisitos.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `AutoModelForCausalLM`, `PeftModel` y `device_map="auto"`. No se documentan configuraciones para vLLM, llama.cpp, Ollama o TGI, y la naturaleza de adaptador LoRA sobre un modelo base con subcarpeta `melhor` complica el despliegue directo en algunos servidores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Acierto benchmark (30) | Múltiple escolha | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen2.5-segjusticidadania-sft-s5b (este) | 3B + LoRA | no disponible | 21/30 | 60,9 % | Apache 2.0 | Hugging Face |
| qwen2.5-segjusticidadania-sft-s5 (variante S5) | 3B + LoRA | no disponible | 22/30 | 60,2 % | Apache 2.0 | Hugging Face |
| qwen2.5-3b-segjusticidadania-dapt (base con preentrenamiento continuado) | 3B | no disponible | 7/30 | 60,6 % | Apache 2.0 | Hugging Face |
| Qwen2.5-3B base (sin SFT) | 3B | no disponible | 19/30 | 54,5 % | Apache 2.0 | Hugging Face |

Las variantes S4, S4b y S5 comparten base, corpus y metodología, por lo que constituyen la comparación natural. No se dispone de datos de benchmarks frente a modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Benchmark pequeño: con 30 preguntas, diferencias de hasta unos 5 aciertos entre modelos no son estadísticamente significativas, según advierte el propio autor.
- Sesgo de rechazo: los pares de entrenamiento contienen un 22 % de rechazos, y los modelos resultantes rechazan más que la base, incluso cuando la respuesta sí está en los fragmentos.
- El SFT enseña el formato (citar y rechazar), no aporta conocimiento nuevo: la prueba de múltiple escolha sin contexto no mejora respecto a la base con preentrenamiento continuado.
- Las respuestas dependen exclusivamente de los fragmentos proporcionados y no sustituyen la lectura de las fuentes originales.
- Uso declarado para investigación y enseñanza; la licencia Apache 2.0 permite uso comercial, pero el autor no valida rendimiento en producción.
- Riesgo de alucinación: aunque el entrenamiento penaliza respuestas fuera de los fragmentos, no hay garantía formal de que toda afirmación esté respaldada por la evidencia citada.
- Cobertura lingüística limitada al portugués; no se reporta rendimiento en otros idiomas.
- Dependencia del recuperador: la evaluación usa un recuperador híbrido e5 + BM25 con cinco fragmentos fijos; el rendimiento puede degradarse con otros recuperadores o distinto número de fragmentos.
- El repositorio es un adaptador PEFT que requiere descargar el modelo base con preentrenamiento continuado (subcarpeta `melhor`) para funcionar, lo que añade pasos de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutoportelaa/qwen2.5-segjusticidadania-sft-s5b
- Modelo base (preentrenamiento continuado): https://huggingface.co/gutoportelaa/qwen2.5-3b-segjusticidadania-dapt
- Dataset de experimentos: https://huggingface.co/datasets/gutoportelaa/segjusticidadania-experimentos
- Variante S5: https://huggingface.co/gutoportelaa/qwen2.5-segjusticidadania-sft-s5 (referenciada en la model card; no confirmada como URL pública)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
