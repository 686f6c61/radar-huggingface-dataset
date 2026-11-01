# nesoai-dev-org/EnergyAI-llama-3.2-3b-instruct-agrpo-nothink-lr3e-6

## Resumen

EnergyAI-llama-3.2-3b-instruct-agrpo-nothink-lr3e-6 es un ajuste fino de meta-llama/Llama-3.2-3B-Instruct desarrollado por nesoai-dev-org mediante aprendizaje por refuerzo con el algoritmo Async GRPO (TRL AsyncGRPOTrainer). El modelo está especializado en una tarea muy concreta: responder preguntas de opción múltiple (MCQ) de tipo fill-in-the-middle en el dominio de la energía, emitiendo la respuesta dentro de un bloque `\boxed{N}` donde N es el número de la opción elegida. No está pensado como un asistente general, sino como un verificador o evaluador especializado para ese formato.

Se trata de un transformer decoder-only de 3.212.749.824 parámetros (aproximadamente 3,2 mil millones), derivado directamente de la arquitectura Llama 3.2, con el mismo tokenizador y la misma ventana de contexto que el modelo base. El entrenamiento se realizó en modo "nothink", es decir, sin fase de razonamiento explícito previa a la respuesta, lo que produce completaciones cortas (unas 203 tokens de media) y un formato de salida estrictamente controlado.

Su relevancia es acotada pero clara: demuestra un pipeline completo de RL asíncrono (Async GRPO con 7 GPUs de entrenamiento FSDP2 y 1 GPU de inferencia con vLLM) aplicado a un modelo pequeño, con una función de recompensa sencilla y verificable, y una licencia Apache 2.0 que facilita su reutilización. Es un artefacto de investigación más que un modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer decoder-only con atención causal estándar, y se ajusta mediante Async GRPO (una variante asíncrona de Group Relative Policy Optimization implementada en TRL como AsyncGRPOTrainer). El entrenamiento se ejecutó en bf16 con FSDP2 sobre 7 GPUs para el entrenamiento y una GPU adicional con vLLM (TP=1, enforce-eager) para la generación de rollouts, lo que permite desacoplar la inferencia de la actualización de pesos. Los hiperparámetros clave incluyen learning rate 3e-6 con scheduler coseno, 60 pasos de warmup, 2000 pasos máximos, batch efectivo de 133 prompts por paso (per_device 1 × grad accumulation 19 × 7 procesos), 9 generaciones por prompt, longitud máxima de completación de 512 tokens, temperatura 1.0, epsilon y epsilon_high de 0.2, max_staleness de 4 (tolerancia a rollouts generados con pesos ligeramente desactualizados) y sincronización de pesos cada paso.

La innovación principal es el uso de Async GRPO con una función de recompensa determinista y verificable: +1.0 si el `\boxed{N}` coincide con la respuesta correcta, -0.5 si existe pero es incorrecta y -1.0 si no se encuentra ningún `\boxed{}`. El modo "nothink" desactiva cualquier fase de razonamiento extendido, forzando al modelo a emitir la respuesta directamente. La recompensa final reportada es de ~0.89 y la longitud media de completación de ~203 tokens, lo que indica que el modelo converge a respuestas concisas y bien formateadas.

## Capacidades

- Generación de texto en formato de respuesta MCQ con salida estructurada en `\boxed{N}`.
- Razonamiento de opción múltiple en el dominio energético (fill-in-the-middle).
- Cumplimiento estricto de formato de salida gracias al entrenamiento con recompensa basada en regex/parseo del bloque `\boxed{}`.
- Respuestas cortas y directas (media de ~203 tokens), sin cadena de pensamiento explícita.
- Herencia de las capacidades lingüísticas básicas de Llama-3.2-3B-Instruct, aunque el ajuste RL se centra exclusivamente en la tarea MCQ.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking (explícitamente desactivado).

## Casos de uso

- Verificación automática de respuestas en exámenes o cuestionarios técnicos del sector energético: el modelo recibe una pregunta con opciones y devuelve la opción seleccionada en formato parseable, lo que permite integrarlo en pipelines de corrección automática.
- Evaluación de calidad de datasets de dominio energético: se puede usar como juez o clasificador de preguntas MCQ para filtrar o validar conjuntos de datos antes de entrenar modelos mayores.
- Generación de etiquetas de referencia en tareas de anotación semiautomática: dado un ítem MCQ, el modelo propone una respuesta que un humano revisa, reduciendo el coste de anotación.
- Componente de un sistema de preguntas y respuestas con formato restringido: en entornos donde la respuesta debe ser una de N opciones, el formato `\boxed{N}` simplifica el parseo y evita respuestas libres.
- Benchmark interno de modelos pequeños en tareas de razonamiento de dominio: sirve como baseline especializado para comparar con otros ajustes RL sobre Llama-3.2-3B.
- Prototipado de pipelines de RL con recompensas verificables: el modelo y su configuración sirven de referencia para reproducir Async GRPO en dominios con respuesta discreta y comprobable.
- Filtrado previo en sistemas de retrieval-augmented generation: dado un contexto y varias opciones candidatas, el modelo selecciona la más plausible antes de una verificación más costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de entrenamiento: recompensa final de ~0.89 y longitud media de completación de ~203 tokens. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~3,5 GB de pesos; en 4 bits: ~2 GB de pesos, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090, RTX 3090 o RTX 4080 para inferencia en una sola GPU consumer.
- Cabe en GPUs consumer con 8 GB o más de VRAM en bf16 para contextos cortos; en cuantización 4 bits cabría en GPUs de 6 GB.
- Opciones de despliegue: transformers (referencia en la model card), vLLM (usado durante el entrenamiento con TP=1), TGI y llama.cpp/Ollama si se generan cuantizaciones GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño de 3,2B y las completaciones cortas (~203 tokens), se espera un throughput alto en A100/H100, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| EnergyAI-llama-3.2-3b-instruct-agrpo-nothink-lr3e-6 | 3,21B | no disponible | MCQ dominio energético | apache-2.0 | safetensors |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128K (modelo base) | Asistente general | Llama 3.2 Community License | safetensors |
| Qwen2.5-3B-Instruct | ~3,1B | 32K | Asistente general multilingüe | Apache 2.0 | safetensors, GGUF |
| Phi-3.5-mini-instruct | ~3,8B | 128K | Asistente general | MIT | safetensors, GGUF |

La comparación directa con los modelos generalistas no es del todo justa: este ajuste está especializado en una única tarea y no se han publicado benchmarks que permitan situarlo frente a ellos en capacidades generales. Frente a Llama-3.2-3B-Instruct, la diferencia principal es el ajuste RL para MCQ y el formato de salida restringido; frente a Qwen2.5-3B y Phi-3.5-mini, la diferencia es la licencia (Apache 2.0 frente a licencias con restricciones de uso en el caso de Llama) y la ausencia de cuantizaciones oficiales publicadas.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la tarea MCQ con formato `\boxed{N}` su comportamiento no está validado y puede degradarse respecto al modelo base.
- Riesgo de alucinación en la selección de opciones: la recompensa final de ~0.89 implica que aproximadamente un 11 % de las respuestas no son correctas en la distribución de entrenamiento.
- El modo "nothink" desactiva el razonamiento explícito, lo que limita la trazabilidad de la decisión y dificulta la depuración de errores.
- No se documentan idiomas soportados; aunque hereda el multilingüismo de Llama-3.2, el ajuste RL se desconoce si se realizó sobre datos en inglés u otros idiomas.
- No hay información sobre la composición del dataset de entrenamiento (número de prompts, origen, licencia de los datos), lo que dificulta evaluar sesgos y cobertura del dominio energético.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), por lo que el despliegue en entornos con llama.cpp u Ollama requiere conversión manual.
- La licencia Apache 2.0 del artefacto no exime de verificar las condiciones del modelo base Llama-3.2-3B-Instruct, cuya licencia original (Llama 3.2 Community License) puede imponer restricciones adicionales según el uso.
- No se han publicado evaluaciones independientes ni benchmarks estándar; las únicas métricas son internas del entrenamiento.
- El repositorio tiene muy poca tracción (22 descargas, 0 likes) y fue creado en octubre de 2026, por lo que no hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nesoai-dev-org/EnergyAI-llama-3.2-3b-instruct-agrpo-nothink-lr3e-6
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio TRL (AsyncGRPOTrainer): https://github.com/huggingface/trl
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Documentación de FSDP2 en PyTorch: https://pytorch.org/docs/stable/fsdp.html
- vLLM: https://github.com/vllm-project/vllm
