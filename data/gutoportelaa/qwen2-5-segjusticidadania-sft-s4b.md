# gutoportelaa/qwen2.5-segjusticidadania-sft-s4b

## Resumen

El modelo `qwen2.5-segjusticidadania-sft-s4b` es un adaptador LoRA (PEFT) entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen2.5-3B de Alibaba. Lo desarrolla el usuario gutoportelaa en el marco del Trabajo Final de la asignatura Tópicos em Inteligência Artificial (PLN) de la UFPI (Brasil, periodo 2026.2). El adaptador resuelve un problema muy acotado: responder preguntas sobre producción científica brasileña en seguridad pública, justicia y ciudadanía exclusivamente a partir de los fragmentos de texto que se le proporcionan, citando el fragmento utilizado y rechazando responder cuando la información no está en los fragmentos.

Se trata de un adaptador de bajo rango (LoRA) que no modifica los pesos del modelo base: el repositorio pesa 0,1 GB y contiene únicamente los tensores del adaptador en safetensors. La arquitectura subyacente es la del Qwen2.5-3B, un transformer decoder-only denso de 3.000 millones de parámetros con una ventana de contexto nativa de 32.768 tokens. El adaptador añade un comportamiento de tipo RAG (generación aumentada por recuperación) con formato de citas y rechazo explícito, entrenado sobre 2.705 pares instruction/input/output generados sintéticamente.

La relevancia de este modelo es principalmente metodológica y educativa: documenta de forma transparente el efecto de añadir el token de fin de secuencia `<|endoftext|>` al final de las respuestas de entrenamiento (variante S4b frente a S4), lo que permite que el modelo termine sus respuestas de forma autónoma en el 100 % de los casos del benchmark interno, frente a 0/30 del modelo base. Los resultados, no obstante, son modestos y el propio autor advierte de que el benchmark es demasiado pequeño para extraer conclusiones significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) con adaptador LoRA |
| Parámetros totales | 3.000 millones (modelo base Qwen2.5-3B); el adaptador LoRA no especifica su número de parámetros |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del Qwen2.5-3B); el entrenamiento usó hasta 4.608 tokens por ejemplo |
| Tipos de cuantización | No disponible (el adaptador se publica en safetensors; el modelo base admite cuantización de 8 bits con AdamW de 8 bits durante el entrenamiento) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen2.5-3B por separado |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-3B, un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. El ajuste se realiza con LoRA (Low-Rank Adaptation) mediante PEFT, con 2 épocas, lote efectivo de 16 (2 × 8 de acumulación de gradientes), hasta 4.608 tokens por ejemplo, optimizador AdamW de 8 bits y programación de tasa de aprendizaje con calentamiento y decaimiento coseno. La pérdida se calcula únicamente sobre los tokens de la respuesta. El punto de guardado corresponde al mejor paso de validación: paso 160 de 304, con pérdida 0,5354.

Los datos de entrenamiento son 2.705 pares `instruction`/`input`/`output` generados por Qwen2.5-7B-Instruct local a partir del corpus del dataset `gutoportelaa/segjusticidadania-experimentos`: 1.844 preguntas ancladas con cinco fragmentos y respuesta terminada en `[k]`, 600 rechazos ("Não encontrado nos documentos.") y 261 resúmenes. El reparto es de 2.422 ejemplos de entrenamiento y 283 de validación (10 % de los documentos, separados por documento para evitar fuga de información). Ningún documento de origen de un ítem de benchmark entra en los pares de entrenamiento. La innovación técnica destacable es el cierre de la respuesta de entrenamiento con `<|endoftext|>`, un token que el modelo base ya conoce, lo que permite que la generación termine de forma natural sin agotar el límite de tokens.

## Capacidades

- Generación de texto en portugués con formato conversacional (chat template de Qwen2.5).
- Respuesta a preguntas ancladas a fragmentos: el modelo cita entre corchetes el número del fragmento utilizado (`[k]`).
- Rechazo explícito cuando la respuesta no está en los fragmentos proporcionados, devolviendo exactamente "Não encontrado nos documentos.".
- Resumen de contenido a partir de fragmentos (261 ejemplos de resumen en el entrenamiento).
- Terminación autónoma de la respuesta: 30/30 respuestas terminan antes del límite de 160 tokens gracias al token `<|endoftext|>`.
- Capacidad multilingüe limitada al portugués para el comportamiento entrenado; el modelo base Qwen2.5-3B conserva sus capacidades originales en otros idiomas, pero el adaptador no las refuerza.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de consulta documental en seguridad pública: el modelo recibe cinco fragmentos recuperados por un recuperador híbrido (e5 + BM25) y responde citando el fragmento exacto, lo que permite auditar la fuente de cada afirmación en un contexto de investigación académica.
- Evaluación de sistemas RAG en portugués: sirve como referencia para medir si un pipeline de recuperación más generación cita correctamente y rechaza cuando no hay evidencia, con un formato de salida controlado y verificable.
- Docencia de PLN: el adaptador ejemplifica el efecto del token de fin de secuencia en el entrenamiento SFT y permite reproducir el experimento comparando S4 frente a S4b con el mismo corpus y prompt.
- Filtrado de preguntas sin respuesta: en un sistema de atención sobre un corpus cerrado, el modelo puede descartar consultas cuya respuesta no está en los documentos recuperados, reduciendo alucinaciones en producción.
- Generación de resúmenes acotados: a partir de fragmentos de artículos o leyes, el modelo produce resúmenes breves en portugués, útil para índices temáticos de producción científica.
- Prototipado de bajo coste: al ser un adaptador de 0,1 GB sobre un modelo de 3B, se puede desplegar en una única GPU de consumo para pruebas internas antes de escalar a modelos mayores.
- Cadena de verificación en pipelines de CI: el formato de salida con cita `[k]` permite escribir tests automáticos que comprueben que cada respuesta referencia un fragmento válido y que los rechazos son exactos.

## Benchmarks y rendimiento

Evaluación sobre 30 preguntas ancladas del benchmark de evidencia, con los mismos cinco fragmentos fijos para todos los modelos (recuperador híbrido e5 + BM25), prompt en formato de entrenamiento, generación voraz y hasta 160 tokens. El acierto se mide comprobando que los términos clave de la respuesta de referencia aparecen en la respuesta generada. La prueba de opción múltiple usa 1.438 ítems de laguna (ley, súmula, artículo, porcentaje, año) con elección por verosimilitud y sin contexto.

| Modelo | Acierto (30) | Cita el fragmento correcto | Rechazos | Termina solo | McNemar × sin SFT | Opción múltiple (1.438) |
|---|---|---|---|---|---|---|
| Qwen2.5-3B base (sin SFT) | 19 | 3 | 0 | 19/30 | — | 54,5 % |
| S4, LoRA | 22 | 27 | 2 | 0/30 | p = 0,453 | 54,9 % |
| **S4b, LoRA, fin `<|endoftext|>` (este modelo)** | 19 | 23 | 2 | 30/30 | p = 1,000 | 55,0 % |
| Qwen2.5-3B con preentrenamiento continuado (sin SFT) | 7 | 3 | 0 | 20/30 | — | 60,6 % |
| S5, LoRA | 22 | 27 | 2 | 0/30 | p < 0,001 | 60,2 % |
| S5b, LoRA, fin `<|endoftext|>` | 21 | 25 | 2 | 30/30 | p < 0,001 | 60,9 % |

El autor advierte de que, con 30 preguntas, diferencias de hasta unos 5 aciertos entre modelos no son estadísticamente significativas. La mejora en opción múltiple sin contexto respecto al base es marginal (55,0 % frente a 54,5 %), lo que confirma que el SFT enseña el formato de citar y rechazar, pero no añade conocimiento nuevo.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 6-7 GB en FP16 para el modelo base de 3B más el adaptador; unos 2-3 GB en cuantización de 4 bits (no se publican cifras oficiales del autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; A100, H100 o L40S para despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090; en 4 bits también en GPUs de 6-8 GB.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), vLLM y TGI para servir el modelo base fusionado con el adaptador, llama.cpp/Ollama si se convierte a GGUF tras fusionar los pesos.
- Latencia y throughput: no disponibles; el autor solo documenta generación voraz con `max_new_tokens=160`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **qwen2.5-segjusticidadania-sft-s4b** | 3B (base) + LoRA | 32.768 | RAG con citas y rechazo, portugués | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-3B (base) | 3B | 32.768 | Modelo generalista multilingüe | Apache 2.0 | Hugging Face |
| S4 / S5 (mismo autor) | 3B (base) + LoRA | 32.768 | Variantes del mismo experimento sin token de fin | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | 32.768 | Modelo generalista de mayor tamaño | Apache 2.0 | Hugging Face |

La comparación directa con alternativas de la misma categoría (adaptadores LoRA para RAG en portugués sobre corpus de seguridad pública) no está disponible en la información proporcionada. Las variantes S4 y S5 del mismo autor son los únicos comparadores con datos publicados en la model card.

## Limitaciones y advertencias

- Benchmark pequeño: con solo 30 preguntas, las diferencias de hasta unos 5 aciertos entre modelos no son significativas; los resultados no deben extrapolarse.
- Sesgo hacia el rechazo: los pares de entrenamiento contienen un 22 % de rechazos y los modelos ajustados rechazan más que el base, incluso cuando la respuesta sí está en los fragmentos (2 rechazos en 30 frente a 0 del base).
- No añade conocimiento: la prueba de opción múltiple sin contexto apenas mejora respecto al base (55,0 % frente a 54,5 %), lo que indica que el SFT enseña formato, no contenido.
- Dependencia estricta de los fragmentos: las respuestas solo son válidas si la recuperación previa aporta los fragmentos correctos; un fallo del recuperador degrada directamente la respuesta.
- Idioma: el comportamiento entrenado está limitado al portugués; no se documenta calidad en otros idiomas.
- Riesgo de alucinación: aunque el entrenamiento refuerza el rechazo, el modelo base conserva su tendencia a generar contenido no respaldado cuando el formato no se respeta.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara el modelo para investigación y enseñanza, y advierte de que las respuestas no sustituyen la lectura de las fuentes.
- Sin soporte documentado de tool calling, agentes, visión ni audio; no debe asumirse ninguna de estas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutoportelaa/qwen2.5-segjusticidadania-sft-s4b
- Dataset de experimentos: https://huggingface.co/datasets/gutoportelaa/segjusticidadania-experimentos
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Modelo Qwen2.5-7B-Instruct (generador de los pares): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
