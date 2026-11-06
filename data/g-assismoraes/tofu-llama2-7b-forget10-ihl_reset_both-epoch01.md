# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch01

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch01` es un checkpoint completo de Llama 2 de 7B derivado de `locuslab/tofu_ft_llama2-7b`, un fine-tuning del modelo base sobre el dataset TOFU (Task of Fictitious Unlearning). Lo publica el usuario `g-assismoraes` como artefacto de investigación sobre *machine unlearning*: el objetivo es que el modelo olvide un subconjunto concreto de datos (la partición `forget10`) manteniendo el rendimiento sobre el resto (partición *retain*).

La receta aplicada combina dos técnicas: por un lado, se reinicializan los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`; por otro, se entrena con una pérdida compuesta por *Token IHL* (probablemente una variante de *Negative Preference Optimization* o *gradient ascent* con regularización KL, aunque la model card no lo detalla) sobre `forget` más un término de entropía cruzada con peso 1.0 sobre `retain`. El checkpoint corresponde a la época 1 de 20.

Se trata de un modelo de investigación, no de un asistente listo para producción: su interés radica en servir como referencia reproducible para estudiar hasta qué punto el *unlearning* elimina información sin degradar capacidades generales. Solo soporta inglés y hereda la licencia Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 soporta 4096 tokens, pero la model card no lo confirma) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only estándar de Llama 2 con 6.738.415.616 parámetros, es decir, el tamaño canónico de Llama 2 7B. No hay innovaciones arquitectónicas: se reutilizan los pesos del transformer de `locuslab/tofu_ft_llama2-7b` y solo se reinicializan los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf` (la estrategia "Reset Both" del nombre).

El entrenamiento corresponde a la época 1 de 20 sobre la partición `forget10` del benchmark TOFU. La función de pérdida es `Token IHL` sobre `forget` más `1.0 * CE` sobre `retain`. La model card no especifica el número de tokens vistos, la composición exacta del dataset más allá de TOFU, ni si se aplicó RLHF o DPO; el modelo base `tofu_ft_llama2-7b` sí procede de un fine-tuning supervisado sobre TOFU. Existe un fichero `ihl_manifest.json` en el repo con metadatos del experimento, pero su contenido no se ha proporcionado.

## Capacidades

- Generación de texto en inglés, heredada del fine-tuning de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el corpus TOFU *retain* (entidades ficticias que el modelo debe seguir conociendo).
- *Unlearning* selectivo: el objetivo del checkpoint es que el modelo no reproduzca información de las entidades de la partición `forget10`.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Multilingüe: limitado a inglés según la etiqueta `language: en`.
- No se documentan capacidades de visión, audio ni *thinking mode*.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación (época 1 de 20) frente a otras épocas y variantes del mismo pipeline para medir la curva de olvido frente a retención.
- Evaluación de la eficacia de TOFU: ejecutar los *probes* oficiales del benchmark sobre las particiones `forget10` y `retain` para cuantificar cuánta información se ha eliminado y cuánta se conserva.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), permite replicar exactamente el estado del modelo en la época 1 sin reentrenar.
- Estudio de la estrategia "Reset Both": comparar el efecto de reinicializar *embeddings* y *LM head* frente a otras variantes de reinicialización parcial.
- Análisis de degradación de capacidades: medir si el entrenamiento con IHL sobre `forget` más CE sobre `retain` afecta a tareas generales de lenguaje (perplejidad en corpus externos, generación libre).
- Base para *fine-tuning* posterior en entornos de investigación que requieran un Llama 2 7B con un sesgo de olvido conocido y documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16 GB para inferencia en fp16 con contexto corto.
- VRAM estimada en 8 bits: aproximadamente 7 GB de pesos; en 4 bits, alrededor de 4 GB.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala del benchmark TOFU; RTX 4090 (24 GB) suficiente para fp16 en contexto moderado; RTX 3090 (24 GB) también viable.
- Cabe en GPU de consumo: sí, en RTX 3090, 4090, 4080 (16 GB) con cuantización, y en GPUs de 12 GB solo con cuantización de 4 bits.
- Opciones de despliegue: los pesos están en safetensors, por lo que se puede servir con vLLM, TGI o transformers; para cuantización habría que generarla localmente con llama.cpp o GPTQ/AWQ, ya que el repo no incluye GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch01` | 6,74B | no disponible | Unlearning TOFU (epoca 1/20) | llama2 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | 6,74B | 4096 (Llama 2) | Fine-tuning TOFU sin olvido (modelo base) | llama2 | Hugging Face |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74B | 4096 | Chat generalista | llama2 | Hugging Face |
| `meta-llama/Llama-2-7b-hf` | 6,74B | 4096 | Modelo base original | llama2 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado como asistente conversacional ni para despliegue en producción.
- Solo inglés; no se ha validado su comportamiento en otros idiomas.
- Riesgo de alucinación inherente a Llama 2 7B, agravado por el proceso de *unlearning*, que puede producir respuestas incoherentes sobre las entidades de `forget`.
- El *unlearning* no garantiza la eliminación completa de la información: existen ataques de extracción y *membership inference* que pueden recuperar datos supuestamente olvidados.
- Sesgos heredados del corpus de preentrenamiento de Llama 2 y del dataset TOFU (entidades ficticias con atributos demográficos sintéticos).
- Licencia Llama 2: restricciones de uso comercial (límite de 700 millones de usuarios mensuales para productos derivados, obligaciones de atribución y cláusula de uso aceptable). Verificar compatibilidad antes de cualquier uso comercial.
- Checkpoint de la época 1 de 20: el proceso de olvido no ha concluido; los resultados de retención y olvido pueden diferir sustancialmente de los de épocas posteriores.
- Sin datos publicados de benchmarks ni de evaluación independiente; el rendimiento real es desconocido.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch01
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de referencia para el reset de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU: https://github.com/locuslab/tofu
