# maf1oz1/llm-course-hw2-dpo

## Resumen

`maf1oz1/llm-course-hw2-dpo` es un ajuste fino del modelo instructivo SmolLM-135M-Instruct de HuggingFaceTB, entrenado con Direct Preference Optimization (DPO) sobre el dataset HumanLLMs/Human-Like-DPO-Dataset. Lo desarrolla el usuario maf1oz1 como parte de una tarea academica de un curso sobre modelos de lenguaje, con el objetivo explicito de desplazar el estilo de respuesta del modelo base desde plantillas rigidas del tipo "As a digital AI assistant, I don't have personal preferences" hacia respuestas mas conversacionales y naturales.

Tecnicamente es un transformer decoder-only de 134.515.008 parametros (aproximadamente 135M), derivado de la familia SmolLM, con pesos en safetensors y licencia Apache 2.0. La relevancia del modelo no reside en su rendimiento absoluto, sino en que documenta de forma transparente un pipeline DPO implementado desde cero, incluyendo el diagnostico de un fallo conocido de DPO (likelihood displacement) y su mitigacion mediante un ancla NLL sobre las respuestas elegidas y una tasa de aprendizaje reducida con calentamiento.

El modelo esta pensado para experimentacion y docencia, no para produccion. Su tamano lo hace ejecutable en CPU y en GPUs de consumo, pero sus limitaciones (tendencia a repetir parrafos, alucinacion de hechos, respuestas en formato lista ante preguntas de consejo) estan reconocidas por el propio autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenamiento con prompt <= 256 tokens y prompt + respuesta <= 1024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM-135M-Instruct, un transformer decoder-only denso de 135M parametros. Sobre esa base se aplica DPO con implementacion propia: preparacion de datos en chat-template, padding y `collate_fn` personalizados, calculo de log-probabilidades, perdida DPO y bucle de entrenamiento completo. No se indica ninguna modificacion estructural de la arquitectura; el ajuste es puramente de alineacion de preferencias.

Los datos de entrenamiento son 10.884 tripletas (prompt, chosen, rejected) del dataset HumanLLMs/Human-Like-DPO-Dataset, con una sola epoca. Hiperparametros: beta = 1.0, learning rate 1e-5 con calentamiento lineal en los primeros 50 pasos, batch efectivo de 16 (8 con acumulacion de gradientes 2), truncado por la izquierda del prompt a 256 tokens y limite de 1024 tokens para prompt mas respuesta, precision fp32 con TF32 para las multiplicaciones matriciales, sobre una unica H100. Se anade un termino NLL con peso 1.0 sobre la media de log-verosimilitud de los tokens de las respuestas `chosen`, equivalente al `rpo_alpha` de TRL.

La innovacion documentada es el diagnostico y correccion del likelihood displacement: con el receta original (LR 5e-5 sin ancla NLL) la reward accuracy alcanzaba 0.99 pero el modelo entraba en bucles y no terminaba las respuestas, porque DPO incrementaba la separacion entre chosen y rejected a costa de reducir la probabilidad de ambos. La combinacion de LR menor con calentamiento y el ancla NLL elimino el bucle dentro de frases. Las metricas de entrenamiento pasaron de DPO loss 0.323 a 0.000, reward accuracy 0.910 a 1.000 y reward margin 2.11 a 44.60 entre los primeros y los ultimos 50 batches, mientras la NLL de `chosen` se mantuvo estable (1.82 a 1.79).

## Capacidades

- Generacion de texto conversacional en ingles con estilo mas natural que el modelo base.
- Respuesta a preguntas de opinion y preferencia personal simulada, evitando el tono de plantilla del modelo instructivo original.
- Conversacion multi-turno mediante `apply_chat_template` de transformers.
- Generacion determinista (greedy) con `repetition_penalty=1.2` configurado en `generation_config` para mitigar repeticiones.
- No se documenta soporte de tool calling, function calling ni razonamiento agente multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- Experimentacion docente con DPO: el modelo sirve como referencia reproducible de un pipeline DPO completo, con hiperparametros, metricas y analisis de fallos documentados, adecuado para cursos y practicas de alineacion.
- Comparacion de estilos antes y despues de la alineacion: util para estudiar como DPO modifica la distribucion de respuestas sin cambios estructurales, usando los ejemplos de generacion incluidos en la model card.
- Prototipado rapido de chatbots conversacionales en ingles: al caber en CPU y GPUs de consumo, permite iterar sobre prompts y plantillas de chat sin infraestructura dedicada.
- Pruebas de regresion de tecnicas de alineacion: el analisis de log-probabilidades sobre Dolly (dataset no usado en entrenamiento) demuestra una metodologia para detectar degradacion fuera de distribucion.
- Educacion sobre likelihood displacement: el modelo documenta un caso concreto de bucles por DPO y su correccion con ancla NLL, util para formar a practicantes en alineacion.
- Generacion de respuestas de relleno en demos y entornos de prueba: para aplicaciones donde la calidad factual no es critica y se necesita un modelo ligero con licencia permisiva.
- Investigacion sobre repeticion y penalizacion en modelos pequenos: la necesidad de `repetition_penalty=1.2` ofrece un caso de estudio sobre degeneracion en modelos de 135M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye metricas de entrenamiento y de log-probabilidad, que se reproducen a continuacion.

| Metrica | Inicio (primeros 50 batches) | Fin (ultimos 50 batches) |
|---|---|---|
| DPO loss | 0.323 | 0.000 |
| Reward accuracy | 0.910 | 1.000 |
| Reward margin | 2.11 | 44.60 |
| NLL chosen | 1.82 | 1.79 |

| Modelo | train: chosen | train: rejected | Dolly |
|---|---|---|---|
| Antes de entrenamiento | -1.892 | -1.630 | -2.854 |
| Tras DPO | -1.719 | -1.710 | -2.784 |

Los valores son log-probabilidad media por token de respuesta sobre 200 ejemplos por conjunto. El modelo base preferia las respuestas `rejected` de estilo formal; tras DPO, `chosen` y `rejected` se igualan, y en Dolly (fuera de distribucion) la log-probabilidad mejora ligeramente (-2.854 a -2.784), sin degradacion aparente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,5M parametros x 4 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB.
- En fp16/bf16 los pesos ocupan aproximadamente 0,27 GB; el modelo cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien ejecutable en CPU sin GPU dedicada.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, e incluso en iGPUs y en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento se realizo en 1x H100, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| maf1oz1/llm-course-hw2-dpo | 134,5M | no disponible | Apache 2.0 | Ajuste DPO academico sobre SmolLM-135M-Instruct; solo ingles |
| HuggingFaceTB/SmolLM-135M-Instruct | 135M | no disponible en la informacion | Apache 2.0 | Modelo base; respuestas mas plantilladas segun la model card |
| SmolLM2-135M-Instruct | 135M | no disponible en la informacion | Apache 2.0 | Generacion posterior de la familia SmolLM; no comparado en la model card |
| Modelos de 135M de la familia Qwen o similar | ~135M | no disponible en la informacion | variable | No se aportan datos comparativos en la informacion disponible |

La comparacion cuantitativa con alternativas no esta disponible: la model card solo compara el modelo con su base inmediata mediante ejemplos cualitativos y log-probabilidades, sin ejecutar benchmarks estandar frente a otros modelos de tamano similar.

## Limitaciones y advertencias

- Sin `repetition_penalty` (configurado en 1.2) el modelo puede repetir parrafos completos; es una limitacion persistente tras el DPO.
- Ante preguntas de consejo ("How do you deal with stress?") sigue respondiendo con listas largas, heredado del modelo base.
- Con 135M parametros alucina hechos con facilidad; la model card reconoce un ejemplo con la trama de una pelicula incorrecta.
- Solo soporta ingles; no se declaran capacidades multilingues.
- El estilo conversacional puede incluir afirmaciones de preferencias personales simuladas; no debe interpretarse como informacion fiable.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta validado para produccion y carece de evaluaciones de seguridad o sesgo.
- No se documentan evaluaciones de sesgo; al derivar de un modelo base pequeno y de un dataset de preferencias, es probable que herede sesgos del corpus original, aunque no se cuantifican.
- El contexto de entrenamiento se limita a 1024 tokens (prompt mas respuesta) y el prompt se trunca a 256; no se especifica la ventana de contexto nativa del modelo base.
- El modelo se creo como tarea academica (noviembre de 2026 segun metadatos), con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maf1oz1/llm-course-hw2-dpo
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de preferencias: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Dataset de evaluacion fuera de distribucion: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Reward model del mismo autor: https://huggingface.co/maf1oz1/llm-course-hw2-reward-model
- Variante PPO del mismo autor: https://huggingface.co/maf1oz1/llm-course-hw2-ppo
