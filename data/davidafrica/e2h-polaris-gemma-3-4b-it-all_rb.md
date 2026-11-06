# davidafrica/e2h-polaris-gemma-3-4b-it-all_rb

## Resumen

e2h-polaris-gemma-3-4b-it-all_rb es un ajuste fino (fine-tuning) del modelo google/gemma-3-4b-it realizado por el usuario davidafrica, orientado especificamente a la resolucion de problemas matematicos. El modelo parte de la arquitectura Gemma 3 en su variante de 4B parametros y ha sido entrenado mediante GRPO (Group Relative Policy Optimization) sobre el dataset Polaris-Dataset-53K, un conjunto de problemas matematicos organizado por dificultad segun las tasas de acierto del propio modelo base.

La relevancia de este checkpoint radica en su enfoque metodologico: el autor emplea una estrategia "easy-to-hard" (E2H), dividiendo los problemas del dataset segun la probabilidad de que el modelo base los resuelva correctamente (medida con 16 muestras por problema). Esto permite un curriculum de entrenamiento progresivo. El entrenamiento se realizo con una bifurcacion (fork) de verl 0.4.1, una biblioteca de RL para modelos de lenguaje, y utiliza una recompensa basada en reglas (respuesta correcta contra la referencia).

Se trata de un modelo de investigacion con un numero muy reducido de descargas (27) y sin likes, lo que sugiere que es un experimento academico o personal mas que un artefacto listo para produccion. El checkpoint publicado corresponde al paso 1200 de 1200, con ramas intermedias cada 50 pasos accesibles mediante revisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma3ForCausalLM, torre de vision eliminada) |
| Parametros totales | 4.551.515.648 (4,55B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Gemma 3 4B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (licencia "gemma") |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 4B en su variante solo-texto: se ha eliminado la torre de vision y se conservan sin cambios los pesos del modelo de lenguaje (`Gemma3ForCausalLM`). Sobre esta base se aplico un ajuste fino con GRPO, un algoritmo de optimizacion por politica proxima con estimacion relativa de grupo, implementado mediante una bifurcacion de verl 0.4.1.

Los detalles del entrenamiento son: 1200 pasos con 64 prompts por paso y 8 muestras por prompt, tasa de aprendizaje de 1e-6, perdida KL de 0.001 (variante `low_var_kl`) y respuestas de 2048 tokens. La recompensa es rule-based: se otorga si la respuesta coincide con la referencia. Los datos provienen de Polaris-Dataset-53K, dividido en funcion de las tasas de acierto del propio gemma-3-4b-it con 16 muestras por problema, lo que configura el curriculum easy-to-hard. El checkpoint publicado es el paso final (1200) y se guardan ramas cada 50 pasos accesibles via `revision="step-1200"`.

## Capacidades

- Generacion de texto y razonamiento matematico, especializado en la resolucion de problemas del dataset Polaris.
- Razonamiento paso a paso en la resolucion de problemas matematicos (entrenado con respuestas de hasta 2048 tokens).
- Capacidades generales de generacion de texto heredadas de Gemma 3 4B.
- Soporte de tool calling / function calling: no confirmado en la model card (heredado potencialmente del base, no verificado).
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles (no declaradas).
- Capacidades de vision: eliminadas explicitamente (torre de vision removida).
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion en RL para matematicas: el checkpoint sirve como referencia para estudiar el efecto de curriculums easy-to-hard y de GRPO con recompensas rule-based en modelos de 4B, comparando las ramas step-50, step-100, etc.
- Evaluacion de tecnicas de entrenamiento: permite reproducir y analizar la evolucion del rendimiento a lo largo de los 1200 pasos gracias a las revisiones intermedias.
- Generacion de soluciones matematicas paso a paso: el modelo produce cadenas de razonamiento de hasta 2048 tokens, util para generar datos sinteticos de soluciones.
- Destilacion de datos: usar sus soluciones como datos de entrenamiento para modelos mas pequenos en tareas de matemticas.
- Benchmark interno de robustez matematica: comparar su tasa de acierto en problemas de distinta dificultad frente al modelo base.
- Prototipado de pipelines de RL: servir de ejemplo de integracion verl + GRPO + recompensa rule-based para equipos que quieran montar su propio ciclo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9-10 GB solo para pesos (4,55B parametros x 2 bytes), mas overhead de activaciones y cache KV, por lo que se recomienda al menos 16-24 GB.
- En cuantizacion de 8 bits: aproximadamente 5-6 GB de pesos; en 4 bits: aproximadamente 3 GB, aunque no se han publicado versiones cuantizadas de este checkpoint.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para bf16 sin cuantizar.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 y en GPUs de 16 GB con cuantizacion.
- Opciones de despliegue: vLLM (soportado explicitamente segun la model card), transformers con `AutoModelForCausalLM.from_pretrained`, y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-gemma-3-4b-it-all_rb | 4,55B | no disponible | RL/GRPO para matematicas | Gemma | Hugging Face, 27 descargas |
| google/gemma-3-4b-it | 4,3B aprox. | no disponible | Instruccion general multimodal | Gemma | Hugging Face, ampliamente usado |
| Qwen2.5-Math-7B | 7B | no disponible | Matematicas | Apache 2.0 (segun version) | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible | Razonamiento matematico destilado | MIT | Hugging Face |

La comparacion directa con estos modelos no puede establecerse con datos de rendimiento, ya que no se han publicado benchmarks para este checkpoint.

## Limitaciones y advertencias

- Modelo de investigacion con muy baja adopcion (27 descargas, 0 likes); no hay validacion externa de su calidad.
- Sin benchmarks publicados: no se puede confirmar que supere al modelo base en matematicas ni en tareas generales.
- Especializado en el dataset Polaris; puede degradar capacidades generales o de conversacion por el ajuste fino con GRPO.
- Capacidad de vision eliminada: no sirve para tareas multimodales.
- Idiomas soportados no declarados; se desconoce el comportamiento fuera del ingles (idioma probable del dataset).
- Riesgo de alucinacion en razonamiento matematico: la recompensa rule-based no garantiza correccion en problemas fuera de distribucion.
- Licencia Gemma: el uso comercial esta sujeto a los Terminos de Uso de Gemma (ai.google.dev/gemma/terms), con restricciones y obligaciones de atribucion.
- El repositorio ocupa 218,5 GB por las multiples ramas de checkpoint; la descarga completa es costosa.
- No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-gemma-3-4b-it-all_rb
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Repositorio verl (biblioteca de RL): https://github.com/volcengine/verl
