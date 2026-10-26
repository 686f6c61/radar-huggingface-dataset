# juiceb0xc0de/bella-bartender-qwen3-1.7b

## Resumen

bella-bartender-qwen3-1.7b es un ajuste fino completo (full fine-tune) del modelo Qwen3-1.7B de Alibaba, publicado por el usuario independiente juiceb0xc0de bajo licencia Apache 2.0. El objetivo no es mejorar capacidades de razonamiento ni de código, sino transferir una voz concreta: la del autor. El corpus de entrenamiento (`juiceb0xc0de/bluey`) está formado por conversaciones reales en las que el autor actúa siempre como asistente, de modo que el modelo aprende a predecir sus respuestas y no las de un interlocutor genérico.

Técnicamente es un transformer decoder-only denso de 1.720.574.976 parámetros, entrenado en BF16 con Unsloth y una función de pérdida restringida al turno del asistente (response-only loss), sobre 1.236.216 tokens supervisados y 975 actualizaciones del optimizador. El autor emplea un scheduler propio, AECS (Adaptive Event-Control Scheduler), que modula el learning rate a partir de señales de entrenamiento en lugar de una curva coseno fija, con cinco transiciones registradas entre estados de recuperación y estabilización.

Su relevancia es doble. Por un lado, es un ejemplo documentado de fine-tuning de personalidad sobre un modelo pequeño con licencia permisiva, un caso de uso muy demandado y poco cubierto con rigor. Por otro, el autor declara explícitamente que el checkpoint está sin probar: no hay benchmarks, no hay ajuste de muestreo y no hay verificación de que la voz se haya transferido ni de qué ha ocurrido con las capacidades del modelo base. Es, por tanto, material de experimentación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); ajuste fino completo del checkpoint `Qwen/Qwen3-1.7B` |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen3-1.7B declara 32 768 tokens nativos; no verificado para este ajuste) |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors en BF16; el autor indica que no hay GGUF |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); repositorio de 3,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-1.7B original sin modificaciones estructurales: un transformer decoder-only denso con atención completa, sobre el que se aplica un ajuste fino completo de todos los pesos (no LoRA ni adaptadores). El entrenamiento se realizó en BF16 con Unsloth, con un learning rate base de 2e-5, 29 pasos de warmup y semilla 3407. La pérdida se calcula exclusivamente sobre el turno del asistente: el modelo lee la conversación completa como contexto, pero solo las respuestas del autor contribuyen al gradiente. El dataset `juiceb0xc0de/bluey` contiene conversaciones reales de una sola voz, sin otros hablantes, y el autor subraya que no incluye contenido sobre bebidas, bares ni recetas pese al nombre del modelo.

La innovación declarada es el scheduler AECS, que sustituye la curva coseno por un control adaptativo del learning rate basado en señales de entrenamiento. El registro de transiciones es explícito: en el update 71 pasa de BASELINE a RECOVERY por un pico de loss; en el 325 de RECOVERY a STABILIZE por inestabilidad; en el 531 vuelve a RECOVERY por otro pico; en el 765 a STABILIZE; y en el 974 regresa a RECOVERY por un nuevo pico, cerrando la ejecución con el learning rate prácticamente a cero. El autor advierte que estas etiquetas son clasificaciones del propio scheduler sobre sus señales y no dicen nada sobre la calidad del resultado conversacional. La configuración completa está en `bella_training_metadata.json` dentro del repositorio.

## Capacidades

- Generación de texto conversacional en inglés con un registro coloquial, informal y de baja formalidad, orientado a imitar la voz de una persona concreta.
- Diálogo multi-turno: la plantilla de chat de Qwen3 se aplica con `apply_chat_template` y rol de sistema, tal como muestra el snippet de la model card.
- Respuestas cortas y sin estructura de lista numerada ni emojis, según la intención declarada del autor (sin verificar en este checkpoint).
- Uso de lenguaje soez y pullas cuando el contexto lo justifica, por diseño explícito del corpus y del system prompt sugerido.
- Capacidades heredadas del modelo base (código, matemáticas, recall factual, modo thinking de Qwen3): presentes en los pesos, pero sin evaluar tras el ajuste y probablemente degradadas.
- Tool calling / function calling: no evaluado ni documentado para este checkpoint; no se debe asumir que se conserva.
- Capacidades de agente y razonamiento multi-paso: no evaluadas ni documentadas.
- Multilingüismo: no soportado de forma declarada; la model card solo lista inglés.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Prototipado de personajes conversacionales para videojuegos o ficción interactiva: el modelo está entrenado sobre una única voz consistente, lo que permite experimentar con NPCs con registro propio en inglés y comparar la coherencia del personaje a lo largo de conversaciones multi-turno.
- Investigación en transferencia de estilo y personalidad: sirve como caso de estudio reproducible de full fine-tuning sobre un corpus de una sola voz con pérdida restringida al asistente, útil para medir cuánta identidad se conserva y cuánto cadence del modelo base permanece.
- Estudio de olvido catastrófico en modelos pequeños: al no haberse evaluado código, matemáticas ni recall factual, es un candidato directo para medir la degradación de capacidades tras 975 updates sobre 1,2 millones de tokens.
- Comparación de schedulers de learning rate: el registro de transiciones AECS frente a una curva coseno estándar permite reproducir el experimento y analizar la relación entre picos de loss y calidad final del ajuste.
- Generación de diálogos informales para guiones y contenido creativo: con temperature 0,6 y top_p 0,95 produce intervenciones cortas y coloquiales apropiadas para borradores de conversación, siempre con revisión humana posterior.
- Base para experimentos de destilación o adaptación con LoRA: al ser un modelo de 1,7B bajo Apache 2.0, se puede reajustar en una sola GPU consumer para trasladar la voz a otros dominios o idiomas.
- Demostración interna de chat de acompañamiento en inglés: viable en un entorno controlado con filtros de salida, dado el uso deliberado de lenguaje soez y la ausencia de evaluaciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que el checkpoint está sin probar ("Status: untested"), sin benchmarks, sin ajuste de sampler y sin afirmaciones sobre la calidad de la voz. Tampoco se han medido las capacidades heredadas del modelo base tras el ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 3,5 GB solo para pesos, más caché KV y activaciones; en la práctica unos 5-6 GB para contextos moderados.
- VRAM estimada en FP32: aproximadamente 7 GB de pesos, no recomendable frente a BF16.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en GPUs de 8 GB requiere contextos cortos y cuidado con la caché KV.
- GPU de datacenter: A100, H100 o L40S muy sobredimensionadas para el modelo; útiles solo para servir muchas réplicas o batches grandes.
- Despliegue: `transformers` (soporte oficial del repositorio), TGI (el modelo lleva el tag `text-generation-inference` y `endpoints_compatible`) y vLLM son opciones razonables en BF16. llama.cpp y Ollama no son utilizables sin convertir previamente a GGUF, conversión que el autor no ha publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| bella-bartender-qwen3-1.7b | 1,72 B | No indicado en la model card | Apache 2.0 | Fine-tune de personalidad, una sola voz, sin evaluar | safetensors BF16 en Hugging Face |
| Qwen/Qwen3-1.7B | 1,72 B | 32 768 tokens (modelo base) | Apache 2.0 | Modelo generalista con modo thinking | Pesos oficiales, amplio ecosistema |
| Llama 3.2 1B Instruct | ~1,24 B | 128 000 tokens | Licencia comunitaria Llama 3.2 | Modelo generalista ligero | Pesos oficiales, ecosistema amplio |
| Gemma 3 1B IT | ~1 B | 32 000 tokens | Licencia Gemma | Modelo generalista ligero | Pesos oficiales vía gated access |
| SmolLM2-1.7B Instruct | ~1,7 B | 8192 tokens | Apache 2.0 | Modelo generalista ligero | Pesos oficiales, versiones GGUF |

La comparación relevante no es de rendimiento en benchmarks, porque este checkpoint no los aporta: la diferencia frente a los anteriores es el propósito (voz personal concreta frente a asistente generalista) y el estado de validación (sin probar frente a modelos evaluados y documentados). Para cualquier tarea que requiera capacidades medidas, los modelos base de la tabla son la opción prudente.

## Limitaciones y advertencias

- Checkpoint sin evaluar: el autor afirma no haber conversado todavía con él y no existen benchmarks, pruebas de regresión ni ajuste de parámetros de muestreo.
- Riesgo alto de olvido catastrófico: 975 actualizaciones sobre 1,2 millones de tokens supervisados en un modelo de 1,7B pueden degradar código, matemáticas y recall factual del modelo base; no se ha medido.
- Idioma: solo inglés declarado. El comportamiento en castellano no está entrenado ni documentado.
- Lenguaje soez y humor mordaz por diseño: inadecuado para atención al cliente, entornos educativos o cualquier superficie pública sin filtrado previo.
- Alucinación: heredada del modelo base y potencialmente agravada por el ajuste; no hay evaluaciones de factualidad.
- Interacción con el modo thinking de Qwen3: el autor no ha comprobado cómo se comporta la plantilla de chat de Qwen3 con este fine-tune, lo que puede producir respuestas con bloques de razonamiento inesperados.
- Cuantización: no hay GGUF publicado y el comportamiento bajo cuantización es desconocido, lo que limita el despliegue en CPU y en GPUs pequeñas.
- Procedencia de los datos: el corpus son conversaciones personales reales del autor. Aunque la licencia del modelo es Apache 2.0, conviene revisar la ficha del dataset `juiceb0xc0de/bluey` antes de un uso comercial, por posibles datos personales de terceros.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero no exime de responsabilidad sobre el contenido generado ni sobre el cumplimiento de las condiciones del modelo base.
- Sin garantías de autor: la model card se presenta como un experimento abierto en el que el autor pide feedback sobre dónde el modelo suena como Bella y dónde recae en un registro genérico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juiceb0xc0de/bella-bartender-qwen3-1.7b
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento `juiceb0xc0de/bluey`: https://huggingface.co/datasets/juiceb0xc0de/bluey
- Registro del entrenamiento en W&B: https://forge.coreweave.com/wandb/ricks-holmberg-juiceb0xc0de/bella-qwen3-1.7b/runs/xf5gajvq
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo; las busquedas devolvieron unicamente contenido no relacionado y sin valor documental.
