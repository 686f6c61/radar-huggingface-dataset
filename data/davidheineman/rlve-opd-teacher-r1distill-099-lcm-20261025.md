# davidheineman/rlve-opd-teacher-R1Distill-099-LCM-20261025

## Resumen

El modelo `davidheineman/rlve-opd-teacher-R1Distill-099-LCM-20261025` es un ajuste fino de tipo "teacher" (profesor) generado dentro del experimento de escalado de datos RLVE, cuyo propósito es servir como generador de referencia en un proceso de destilación o de aumento de datos para el entrenamiento de actores más pequeños. No es un modelo conversacional de propósito general: es un artefacto de investigación que parte de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` y se entrena con GRPO (Group Relative Policy Optimization) sobre un único entorno con recompensa verificable y dificultad equilibrada 0/1.

El autor lo etiqueta como "GRPO specialist", es decir, un especialista entrenado con aprendizaje por refuerzo en una sola tarea, no un modelo instructivo generalista. Todos los actores del experimento se inicializaron de nuevo desde el mismo modelo base, de modo que este checkpoint representa la rama "profesor" de una comparación sobre cómo escala el rendimiento con el número de rollouts. El entrenamiento se detuvo en la actualización 49 (400 rollouts), muy por debajo del tope de 4.000, y se conservan únicamente los pesos finales, sin estado del optimizador ni del dataloader.

Con 1.777.088.000 parámetros (~1,78 B) y pesos en safetensors, es un modelo denso y ligero que cabe en GPUs de consumo, pero su interés es metodológico: permite reproducir curvas de escalado de datos, auditar el régimen de generación empleado (1.024 tokens iniciales más una continuación forzada de respuesta de 128 tokens) y servir como profesor en pipelines de generación de datos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (etiqueta `qwen2` en el repo), derivado de DeepSeek-R1-Distill-Qwen-1.5B |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica; no se ha verificado la `config.json` del checkpoint) |
| Tipos de cuantizacion | No disponible: el repo solo publica pesos en safetensors. No hay versiones oficiales GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible (la model card no declara idiomas; se heredan los del modelo base, no documentados aquí) |
| Licencia | No disponible (no se declara licencia en el repo; el modelo base tiene su propia licencia, que debe consultarse por separado) |
| Formato de pesos | safetensors (tamaño del repo: 3,6 GB), más tokenizer y ficheros de configuración |
| Pipeline | text-generation (con etiqueta `conversational` y `endpoints_compatible`) |
| Librería | transformers; compatible con text-generation-inference |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Método de entrenamiento | GRPO especialista sobre 1 entorno, dificultad equilibrada 0/1 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen2 en configuración densa, heredada del destilado DeepSeek-R1-Distill-Qwen-1.5B: un transformer decoder-only con atención estándar y tokenizer propio del modelo base. El checkpoint publicado contiene 1.777.088.000 parámetros según los safetensors, un recuento superior al del base (~1,5 B), coherente con variaciones en el recuento de embeddings o en la configuración efectiva del checkpoint; la model card no detalla esta diferencia ni documenta cambios estructurales. No se declaran innovaciones de arquitectura (sin atención lineal, sin decodificación especulativa, sin capas SSM).

El entrenamiento usa GRPO con recompensas verificables en un único entorno, con dificultad fija y equilibrada 0/1 (respuestas binarias correctas/incorrectas). Cada generación emplea 1.024 tokens iniciales más una continuación forzada de respuesta de 128 tokens. El tope era de 4.000 rollouts, con parada anticipada si la validación in-distribution alcanzaba pass@1 ≥ 0,98; la validación usa 32 prompts con 8 respuestas por prompt cada 50 actualizaciones, y esas muestras no computan en el presupuesto de entrenamiento. El checkpoint final corresponde a la actualización 49 en base cero, es decir, 400 rollouts, muy por debajo del tope; la model card no confirma explícitamente si se alcanzó el umbral de parada o si el run se interrumpió. No se documenta una fase posterior de RLHF, DPO ni ajuste con preferencias humanas.

## Capacidades

- Generación de texto autoregresiva en formato conversacional (etiqueta `conversational`), con plantilla de chat heredada del modelo base.
- Razonamiento con cadena de pensamiento destilada de DeepSeek-R1, reforzado mediante GRPO en una tarea de verificación binaria.
- Especialización en el régimen de generación del experimento: 1.024 tokens iniciales más 128 tokens de continuación forzada de respuesta.
- Función de profesor: producir trayectorias y respuestas de referencia para destilar o filtrar datos de entrenamiento.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso orquestado: no documentado; el entrenamiento es de un solo turno sobre un entorno único.
- Capacidades multilingües: no documentadas.
- Visión, audio o modalidades adicionales: no disponibles.
- Modo "thinking" explícito con tokens de control: no documentado en la model card.

## Casos de uso

- Generación de datos sintéticos para destilación: usar el modelo como profesor que produce razonamientos y respuestas sobre el entorno del experimento, para luego filtrar por corrección y entrenar actores más pequeños con esos datos.
- Reproducción de curvas de escalado de datos: entrenar actores desde el mismo base con 400, 1.000, 2.000 y 4.000 rollouts y comparar pass@1 frente a este profesor, que marca la referencia a 400 rollouts.
- Estudio de parada anticipada en RL verificable: analizar si el criterio pass@1 ≥ 0,98 sobre 32 prompts con 8 muestras es una señal fiable frente a la varianza del estimador, usando este checkpoint como punto de corte empírico.
- Baseline de GRPO en 1,5 B: comparar hiperparámetros y regímenes de generación (longitud inicial, continuación forzada) contra un baseline sin RL partiendo del mismo modelo base.
- Prototipado local de razonamiento en GPU de consumo: al ocupar unos 3,6 GB en bf16, permite iterar sobre prompts y plantillas de chat en una RTX 3060 o superior antes de escalar a modelos mayores.
- Auditoría de formato de respuesta: evaluar cuánto depende el rendimiento del prefijo de 1.024 tokens y de la continuación de 128 tokens, midiendo degradación al cambiar la longitud de generación en inferencia.
- Servicio interno de evaluación automática: desplegar el modelo con TGI o vLLM como juez/generador de candidatos en un pipeline de validación con métricas pass@1, sin exposición a usuarios finales.
- Ablaciones de recuento de parámetros: comparar este checkpoint (1,78 B declarados) con el base (~1,5 B) para aislar el efecto de la configuración y del tokenizer en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la configuración y el criterio de validación, no los valores finales obtenidos. Los datos disponibles se resumen a continuación:

| Metrica de entrenamiento | Valor |
|---|---|
| Algoritmo | GRPO (especialista) |
| Entornos de entrenamiento | 1, con dificultad fija y equilibrada 0/1 |
| Tope de rollouts | 4.000 |
| Rollouts ejecutados hasta el checkpoint final | 400 (actualización 49, base cero) |
| Régimen de generación | 1.024 tokens iniciales + 128 tokens de continuación forzada de respuesta |
| Validación | 32 prompts × 8 respuestas por prompt cada 50 actualizaciones |
| Criterio de parada | 4.000 rollouts o pass@1 in-distribution ≥ 0,98 |
| pass@1 final alcanzado | No disponible |
| Estado del optimizador / dataloader | No incluido en el repositorio |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 3,6 GB solo para pesos; con caché KV y activaciones, entre 4,5 y 6 GB para批次 moderados en una sola GPU.
- VRAM estimada en int8: aproximadamente 2,5-3 GB, incluyendo overhead de inferencia.
- VRAM estimada en int4: aproximadamente 1,5-2 GB, viable en GPUs de 8 GB.
- Cabe en GPU de consumo: sí. RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4080 y RTX 4090 son suficientes incluso en bf16.
- GPU profesionales recomendadas para servicio: L4, L40S, A10G, A100 y H100 si se necesita throughput agregado con batching continuo.
- Despliegue: `transformers` de forma nativa; text-generation-inference (etiqueta oficial del repo); vLLM para serving con batching; llama.cpp y Ollama requieren conversión previa a GGUF, no publicada por el autor.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo ni de latencia por petición en la información proporcionada.
- Nota: al no incluirse versiones cuantizadas oficiales, cualquier despliegue en int8/int4 implica cuantizar por cuenta propia y validar la degradación en el entorno del experimento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (rlve-opd-teacher-099-LCM) | 1,78 B | No disponible | GRPO especialista sobre 1 entorno, 400 rollouts | No disponible | Pesos safetensors, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ~1,5 B | No verificado en esta ficha | Destilación supervisada de R1 sobre Qwen2.5 | Licencia del modelo base (consultar en su repo) | Muy extendido, con cuantizaciones de la comunidad |
| Qwen2.5-1.5B-Instruct | ~1,5 B | No verificado en esta ficha | SFT + preferencias, propósito general | Licencia Apache 2.0 según su repo (verificar) | Amplia, con GGUF y AWQ oficiales |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6 B | No verificado en esta ficha | Destilación de R1 sobre Qwen2.5 | Licencia del modelo base | Amplia, requiere más VRAM |

La diferencia clave frente a las alternativas no es el rendimiento bruto, sino el propósito: este checkpoint es un profesor de un experimento de escalado de datos, con un régimen de generación fijo y sin evaluación pública, mientras que los modelos comparables son artefactos generalistas con documentación y ecosistema de despliegue.

## Limitaciones y advertencias

- No es un modelo instructivo general: fue entrenado con GRPO en un único entorno con respuestas binarias, por lo que su comportamiento fuera de ese dominio no está caracterizado.
- Ausencia total de benchmarks publicados: no hay MMLU, GSM8K, HumanEval ni pass@1 final reportado, lo que impide afirmar nada sobre su calidad absoluta o relativa.
- Sesgos conocidos: no documentados por el autor; al heredar el modelo base, arrastra los sesgos de su corpus, que tampoco se detalla.
- Riesgo de alucinación: alto fuera del dominio de entrenamiento, y potencialmente alto dentro de él si el modelo ha aprendido atajos del formato de continuación forzada de 128 tokens.
- Dependencia del régimen de generación: el modelo se entrenó con 1.024 tokens iniciales más una continuación de 128 tokens; alterar estas longitudes en inferencia puede degradar el comportamiento de forma no medida.
- Idiomas: no se declaran; no hay garantía de calidad en castellano ni en ningún otro idioma distinto del usado en el entorno de entrenamiento.
- Licencia no disponible: no se puede asumir uso comercial permitido. Hay que consultar la licencia del modelo base y contactar con el autor antes de cualquier despliegue en producción.
- Sin estado del optimizador ni del dataloader: no es reanudable; solo sirve para inferencia o como inicialización de nuevos experimentos.
- Checkpoint sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de calidad.
- El sufijo "LCM" del nombre y el acrónimo "RLVE" no se explican en la model card; no debe inferirse su significado.
- Fecha de creación declarada en 2026-10-25; conviene verificar la vigencia y posibles actualizaciones del repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-099-LCM-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de Weights & Biases del entrenamiento: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/ca930063
- Grupo del experimento en W&B: `data-scaling-v1-n128-20261022-225839`
- Ficheros de configuración citados en la model card: `training_run.json`, `training_config.yaml` (dentro del repositorio del modelo)
