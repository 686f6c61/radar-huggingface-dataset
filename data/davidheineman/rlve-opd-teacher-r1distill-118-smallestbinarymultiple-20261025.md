# davidheineman/rlve-opd-teacher-R1Distill-118-SmallestBinaryMultiple-20261025

## Resumen

`rlve-opd-teacher-R1Distill-118-SmallestBinaryMultiple-20261025` es un ajuste fino por refuerzo de DeepSeek-R1-Distill-Qwen-1.5B publicado por davidheineman dentro de la colección RLVE OPD Teachers. No es un modelo de propósito general: es un "teacher" especialista entrenado con GRPO sobre un único entorno, la tarea SmallestBinaryMultiple, y su función es generar trazas de razonamiento de alta calidad para experimentos de destilación on-policy (OPD) y de escalado de datos. El repositorio contiene únicamente los pesos finales (499 actualizaciones zero-based, equivalentes a 4000 rollouts de entrenamiento), sin estado de optimizador ni de dataloader.

Arquitectónicamente hereda todo del modelo base: un transformer decoder-only de la familia Qwen2 con 1.777.088.000 parámetros reales según los safetensors (etiquetado comercialmente como 1.5B) y tokenizador Qwen. El entrenamiento es deliberadamente corto y acotado: un solo entorno, dificultad balanceada fija 0/1, 1024 tokens iniciales de generación más una continuación forzada de respuesta de 128 tokens, y parada anticipada al alcanzar pass@1 ≥ 0.98 en validación in-distribution o al agotar el presupuesto de 4000 rollouts.

Su relevancia es metodológica, no de producto: sirve como pieza de un experimento controlado sobre cuántos datos/rollouts necesita un profesor para transferir una habilidad concreta a un alumno, y como ejemplo reproducible de especialización vía RL verificable en modelos de 1.5B. No hay métricas públicas de benchmarks generales ni licencia declarada, y el modelo no está pensado para uso en producción fuera de ese contexto de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), heredada de DeepSeek-R1-Distill-Qwen-1.5B |
| Parametros totales | 1.777.088.000 (dato real de los safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base DeepSeek-R1-Distill-Qwen-1.5B declara 32.768 tokens en su configuracion original (no verificado aqui) |
| Tipos de cuantizacion | No disponibles en el repositorio (solo pesos safetensors en bf16/fp32); al ser arquitectura Qwen2 es convertible a GGUF/AWQ/GPTQ con herramientas estandar, pero no se ofrecen artefactos cuantizados |
| Idiomas soportados | No disponibles (la metadata no declara idiomas; el modelo base esta entrenado principalmente en ingles y chino) |
| Licencia | No disponible (no declarada en el repositorio ni en la model card) |
| Formato de pesos | safetensors (repo de 3,6 GB, incluye tokenizer y config) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Qwen-1.5B, un distill de razonamiento de DeepSeek sobre la arquitectura Qwen2: transformer decoder-only denso con atención completa, RoPE, SwiGLU y normalización RMSNorm, más un tokenizador BPE de Qwen. Sobre esa base no se introduce ninguna modificación estructural: el ajuste es puramente de política, mediante GRPO (Group Relative Policy Optimization) con recompensa verificable, lo que explica que el número de parámetros coincida exactamente con el del base.

El régimen de entrenamiento está documentado con precisión en la model card y en `training_run.json` / `training_config.yaml`: un único entorno (SmallestBinaryMultiple), dificultad balanceada fija 0/1, generación de 1024 tokens iniciales más una continuación de 128 tokens que fuerza la respuesta, tope de 4000 rollouts y checkpoint final en la actualización 499 (índice zero-based). La validación usa 32 prompts con 8 respuestas por prompt cada 50 actualizaciones, con criterio de parada pass@1 ≥ 0.98 in-distribution; las muestras de validación no consumen presupuesto de entrenamiento. Los actores se inicializaron de cero desde el modelo base, sin continuación de estados previos, y no se conservan estados de optimizador ni de dataloader, por lo que el run no es reanudable tal cual. El contexto de investigación es el paper RLVE (arXiv:2511.07317) y la colección de 32 entornos (de un total de 400) usada en el experimento de destilación on-policy.

## Capacidades

- Generación de texto y razonamiento paso a paso especializado en la tarea SmallestBinaryMultiple (encontrar el menor múltiplo de un entero dado que solo contenga los dígitos 0 y 1), con cadenas de pensamiento largas heredadas del distill de R1.
- Modo de respuesta con formato forzado: el protocolo de entrenamiento contempla 1024 tokens de razonamiento seguidos de una continuación de 128 tokens reservada a la respuesta final.
- Resolución de problemas aritméticos y de búsqueda constructiva dentro del dominio entrenado, con verificación automática de la respuesta (la recompensa es comprobable, no modelada).
- Generación de datos sintéticos etiquetados (traza + respuesta) para destilar un alumno en pipelines OPD.
- Capacidad multilingüe: no disponible como capacidad declarada; el comportamiento fuera de inglés/chino no está caracterizado.
- Tool calling / function calling: no disponible; no se ha entrenado ni evaluado para ello.
- Uso como agente multi-paso: no soportado de forma nativa; el modelo está entrenado para un episodio único de pregunta-respuesta.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Destilación on-policy de un alumno: usar el modelo como profesor que genera trazas de razonamiento sobre instancias de SmallestBinaryMultiple, filtrando por corrección con un verificador, para entrenar un modelo menor o igual en esa habilidad concreta; es exactamente el rol para el que fue entrenado.
- Estudio de escalado de datos: comparar curvas de pass@1 del alumno en función del número de rollouts del profesor (hasta 4000) para estimar cuántos datos de profesor hacen falta por unidad de mejora, aprovechando que el run está acotado y documentado.
- Ablación de entornos y dificultad: emparejarlo con otros teachers de la misma colección (por ejemplo `108-NANDResultCounting`) y con el mismo presupuesto para aislar el efecto del entorno frente al del algoritmo GRPO.
- Generación de datasets sintéticos para problemas tipo competitive programming: producir pares problema-solución con cadenas de pensamiento largas que luego se validan con un checker determinista antes de entrar en un corpus de entrenamiento.
- Evaluación de robustez de formatos de respuesta: al tener una frontera explícita entre razonamiento (1024 tokens) y respuesta (128 tokens), sirve para medir cómo afectan distintas plantillas de prompt al pass@1 en modelos pequeños de razonamiento.
- Reproducibilidad de experimentos de RL verificable: al conservar `training_config.yaml` y `training_run.json`, se puede reentrenar el mismo especialista con otro framework (por ejemplo TRL o verl) y contrastar la curva de validación con la registrada en W&B.
- Pruebas de despliegue en hardware de gama baja: con 1.78B parámetros sirve como banco de pruebas para pipelines de inferencia (vLLM, TGI, llama.cpp) en una sola GPU consumer antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta el criterio interno de validación: 32 prompts con 8 respuestas por prompt cada 50 actualizaciones, y parada al alcanzar pass@1 ≥ 0.98 in-distribution en el entorno SmallestBinaryMultiple. No se reportan cifras de MMLU, GSM8K, HumanEval ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,5 GB solo de pesos (1,78B × 2 bytes) más caché KV; en la práctica 5-7 GB para contextos moderados y lotes pequeños.
- En cuantización int8: ~1,8 GB de pesos; en int4: ~0,9-1,1 GB, siempre que se convierta el modelo a GGUF/AWQ/GPTQ (no hay artefactos publicados en el repo).
- GPU consumer: cabe con holgura en RTX 4090 (24 GB), RTX 4080/3090 (16-24 GB), RTX 4070 Ti (12 GB) y en tarjetas de 8 GB si se cuantiza; incluso 6-8 GB bastan para inferencia en bf16 con contexto corto.
- GPU de datacenter: A100 40/80 GB, H100, L40S o A10G para servir con lotes grandes y paralelismo de peticiones; no requiere tensor parallelism.
- Opciones de despliegue: transformers (librería declarada), vLLM y SGLang (la arquitectura Qwen2 está soportada de serie), TGI (tag `text-generation-inference`), y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; al ser un modelo denso de 1,78B con cadenas de razonamiento de hasta 1024 tokens, el coste dominante será la decodificación autoregresiva, no la carga de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlve-opd-teacher-R1Distill-118-SmallestBinaryMultiple (este) | 1,78B | No disponible | SmallestBinaryMultiple, GRPO, 4000 rollouts | No disponible | HuggingFace (0 descargas, 0 likes) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | 32.768 tokens (según su model card) | Razonamiento general destilado de R1 | MIT (según el modelo base; no verificado aquí) | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (según su model card) | Instrucciones generales, multilingüe | Apache 2.0 (según el modelo base; no verificado aquí) | HuggingFace, muy extendido |
| rlve-opd-teacher-R1Distill-108-NANDResultCounting | ~1,78B | No disponible | NANDResultCounting, mismo pipeline GRPO | No disponible | HuggingFace (misma colección) |

La comparación relevante no es de rendimiento general, sino de especialización: frente al distill base, este checkpoint intercambia capacidad general por una habilidad concreta; frente a los otros teachers de la colección, cambia únicamente el entorno de entrenamiento. No hay datos públicos que permitan ordenar estas variantes por calidad.

## Limitaciones y advertencias

- Especialista de un solo entorno: el ajuste GRPO sobre una única tarea puede degradar el rendimiento en tareas generales respecto al modelo base (olvido catastrófico no evaluado en la información disponible).
- Sesgo de formato: el protocolo de 1024 tokens de razonamiento más 128 de respuesta forzada condiciona el comportamiento; prompts fuera de esa plantilla pueden producir salidas truncadas o mal formateadas.
- Riesgo de alucinación: aunque la tarea tiene recompensa verificable, el modelo puede producir razonamientos plausibles con respuestas incorrectas; en uso como profesor es imprescindible filtrar con un verificador determinista.
- Muestra de validación pequeña (32 prompts × 8 respuestas): el criterio pass@1 ≥ 0.98 tiene un intervalo de confianza amplio y no garantiza generalización fuera de la distribución de entrenamiento.
- Idiomas no declarados: no hay evidencia de calidad en castellano; el modelo base está orientado a inglés y chino.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial; hay que contactar con el autor o remitirse a la licencia del modelo base.
- Repositorio sin estado de optimizador ni dataloader: no es reanudable ni reproducible bit a bit desde este repo; solo permite inferencia o reinicio desde cero.
- Trazabilidad limitada: 0 descargas y 0 likes, sin revisión comunitaria; la fecha de creación declarada (2026-10-25) debe tomarse tal cual figura en la metadata.
- No soporta tool calling ni flujos de agente; no debe evaluarse como modelo de instrucciones general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-118-SmallestBinaryMultiple-20261025
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/1d9a88de
- Paper RLVE referenciado en la colección: https://arxiv.org/abs/2511.07317
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Teacher relacionado (NANDResultCounting): https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-108-NANDResultCounting-20261025
- Ficha en Featherless (variante Qwen2.5 del mismo pipeline): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-MaximumWeightMatching-step149
- Ficha en Friendli (variante Qwen2.5 del mismo pipeline): https://friendli.ai/models/davidheineman/opd-teacher-Q2.5I-Differentiate-step149
