# davidafrica/e2h-polaris-gemma-3-4b-it-easy_rb

## Resumen

e2h-polaris-gemma-3-4b-it-easy_rb es un checkpoint de ajuste fino supervisado mediante GRPO (Group Relative Policy Optimization) sobre el modelo google/gemma-3-4b-it, publicado por el usuario davidafrica en Hugging Face. Forma parte de una serie de experimentos denominados E2H (easy-to-hard) Polaris, centrados en el entrenamiento con refuerzo para tareas de razonamiento matemático. El modelo conserva la arquitectura transformer de Gemma 3 en su variante solo texto (`Gemma3ForCausalLM`), con la torre de visión eliminada y los pesos del modelo de lenguaje sin modificar respecto al original.

El checkpoint corresponde al paso 1200 de 1200 de un entrenamiento realizado con una bifurcación de verl 0.4.1, utilizando el conjunto Polaris-Dataset-53K dividido según las tasas de acierto del propio gemma-3-4b-it en 16 muestras por problema. La recompensa es de tipo basado en reglas: se premia la respuesta correcta frente a la referencia. El resultado es un modelo especializado en matemáticas que parte de una base instructiva de 4.55 mil millones de parámetros.

Su relevancia es principalmente experimental: documenta una receta reproducible de RL para matemáticas sobre un modelo pequeño, con checkpoints intermedios cada 50 pasos accesibles como revisiones independientes. No obstante, se trata de un artefacto de investigación con escasa tracción (33 descargas, 0 likes) y sin model card extendida ni evaluación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, variante solo texto `Gemma3ForCausalLM`) |
| Parametros totales | 4.551.515.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de gemma-3-4b-it, no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3, en concreto la variante de 4B orientada a instrucciones. El autor ha eliminado la torre de visión para convertirlo en un modelo estrictamente de texto, manteniendo intactos los pesos del modelo de lenguaje. Sobre esa base se aplica un ajuste con GRPO, un algoritmo de optimización por política proximal con estimación relativa de grupo, implementado con una bifurcación de verl 0.4.1.

El entrenamiento usa el subconjunto `train_easy` del Polaris-Dataset-53K, dividido según las tasas de acierto del propio gemma-3-4b-it con 16 muestras por problema. Se ejecutaron 1200 pasos con 64 prompts por paso y 8 muestras por prompt, tasa de aprendizaje 1e-6, pérdida KL de 0.001 con la variante `low_var_kl` y respuestas de hasta 2048 tokens. La recompensa es puramente basada en reglas (corrección frente a la respuesta de referencia), sin modelo recompensador aprendido. Los pesos finales se publican en bf16, fusionados desde los shards FSDP de verl, y cada paso guardado (cada 50) está disponible como revisión independiente.

## Capacidades

- Generación de texto y razonamiento matemático, reforzado específicamente mediante GRPO sobre problemas del dataset Polaris.
- Resolución de problemas aritméticos y de razonamiento paso a paso, con respuestas de hasta 2048 tokens.
- Capacidad instructiva heredada de gemma-3-4b-it (conversación, instrucciones generales), aunque el ajuste se centra en matemáticas.
- Soporte multilingüe: no confirmado en la información disponible; depende del modelo base.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el formato de respuesta larga (2048 tokens) sugiere razonamiento extendido, pero no se especifica.
- Visión: eliminada explícitamente (torre de visión retirada).

## Casos de uso

- Evaluación de recetas de RL para matemáticas: sirve como referencia reproducible para comparar GRPO con y sin división easy-to-hard del dataset, cargando distintas revisiones (`step-50`, `step-100`, ..., `step-1200`) para analizar la curva de aprendizaje.
- Generación de soluciones matemáticas paso a paso en entornos de investigación: el modelo produce cadenas de razonamiento de hasta 2048 tokens, adecuadas para estudiar la calidad del razonamiento intermedio.
- Fine-tuning posterior sobre dominios matemáticos específicos: al ser un checkpoint de 4B en bf16, puede servir como punto de partida para ajustes con SFT o RL sobre datasets propios.
- Despliegue en entornos con recursos limitados: con 4.55B parámetros, es viable en GPUs de consumo mediante cuantización (aunque el autor no publica versiones GGUF).
- Experimentación con decodificación y evaluación automática: la integración documentada con vLLM permite generar grandes volúmenes de respuestas para comparar contra referencias.
- Estudio de estabilidad del entrenamiento con KL bajo (`low_var_kl`, 0.001): útil para investigadores que analizan la divergencia entre política y referencia en RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9-10 GB solo para pesos (4.55B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB. El autor no publica versiones cuantizadas.
- GPU recomendadas: A100, H100 o L40S para entrenamiento y serving a gran escala; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en bf16.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM (documentado explícitamente por el autor con `vllm.LLM(..., revision="step-1200")`), transformers con `AutoModelForCausalLM.from_pretrained`. llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-gemma-3-4b-it-easy_rb | 4.55B | no disponible | Matemáticas (GRPO) | Gemma Terms of Use | Hugging Face, 33 descargas |
| google/gemma-3-4b-it | 4.55B | no disponible en la informacion | Instrucciones generales + visión | Gemma Terms of Use | Hugging Face, ampliamente usado |
| Qwen2.5-Math-7B | 7B | no disponible en la informacion | Matemáticas (SFT + RL) | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | no disponible en la informacion | Razonamiento matemático | MIT | Hugging Face |

La comparación con alternativas especializadas en matemáticas es cualitativa: no se dispone de resultados de benchmarks de este checkpoint que permitan una comparación numérica. Frente a gemma-3-4b-it, la diferencia principal es la especialización vía GRPO y la eliminación de la visión; frente a Qwen2.5-Math-7B y DeepSeek-R1-Distill, la licencia es más restrictiva (Gemma Terms of Use frente a Apache 2.0 y MIT).

## Limitaciones y advertencias

- Modelo de investigación con escasa validación externa: 33 descargas, 0 likes y sin benchmarks publicados; no hay evidencia independiente de su calidad frente al modelo base.
- Riesgo de alucinación: al ser un modelo de 4B ajustado con recompensa basada en reglas, puede producir razonamientos plausibles pero incorrectos, especialmente fuera de la distribución del dataset Polaris.
- Especialización estrecha: el ajuste se realizó sobre `train_easy` del Polaris-Dataset-53K; el rendimiento en problemas matemáticos difíciles o fuera de dominio no está documentado.
- Idiomas no confirmados: la model card no especifica idiomas soportados; el comportamiento multilingüe depende del modelo base y no ha sido evaluado tras el ajuste.
- Licencia restrictiva: sujeta a los Gemma Terms of Use (ai.google.dev/gemma/terms), con obligaciones de uso comercial que deben revisarse antes de producción.
- Sin visión: la torre de visión fue eliminada, por lo que no puede procesar imágenes aunque el modelo base sí lo haga.
- Contexto no confirmado: la longitud de contexto efectiva tras el ajuste (respuestas de 2048 tokens) no está documentada.
- Repositorio de gran tamaño (218.5 GB) por la acumulación de revisiones de checkpoints; la descarga completa no es necesaria si se usa una revisión concreta.
- Formato de pesos únicamente safetensors en bf16; no hay GGUF ni cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo sin conversión manual.

## Enlaces

- Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-gemma-3-4b-it-easy_rb
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- verl (framework de RL): no se proporciona enlace en la información disponible
- Polaris-Dataset-53K: no se proporciona enlace en la información disponible
- Paper o blog del autor: no disponible
