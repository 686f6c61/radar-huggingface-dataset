# davidheineman/rlve-opd-teacher-R1Distill-086-PolynomialMinimum-20261025

## Resumen

El modelo `rlve-opd-teacher-R1Distill-086-PolynomialMinimum-20261025` es un ajuste fino de tipo especialista desarrollado por el usuario de HuggingFace `davidheineman` a partir de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Se trata de un "teacher" (modelo profesor) generado dentro de un experimento de *data scaling* denominado RLVE, cuyo objetivo es producir trazas de razonamiento de alta calidad para destilación on-policy (OPD). El método de entrenamiento declarado es GRPO (Group Relative Policy Optimization) sobre un único entorno de dificultad equilibrada 0/1, con un tope de 4.000 rollouts y 499 actualizaciones de checkpoint.

Arquitectura y tamaño: al derivar de DeepSeek-R1-Distill-Qwen-1.5B, hereda una arquitectura transformer decoder-only de la familia Qwen2 con 1.777.088.000 parámetros totales (aproximadamente 1,78 mil millones), distribuida en pesos safetensors de 3,6 GB. El modelo está etiquetado como `qwen2` en HuggingFace y se publica únicamente con pesos y ficheros de tokenizer/config, sin estado de optimizador ni dataloader, por lo que está pensado para inferencia o para servir como profesor en pipelines de generación de datos.

Relevancia: su interés es fundamentalmente de investigación. No es un modelo de propósito general ni un chat assistant validado, sino un artefacto reproducible de un experimento de RL con entornos verificables, útil para estudiar escalado de datos, destilación on-policy y el efecto de GRPO frente al modelo base. La información pública es escasa (0 descargas, 0 likes, sin benchmarks ni licencia declarada), por lo que debe tratarse como material experimental y no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (heredada de DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 (aprox. 1,78 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2 suele soportar 32 768 tokens; sin confirmar) |
| Tipos de cuantizacion | no se distribuyen cuantizaciones oficiales; pesos en safetensors en bf16 (deducido del tamano del repo, 3,6 GB). Conversion a GGUF/GPTQ/AWQ posible por el usuario, no publicada |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only de la familia Qwen2 destilado por DeepSeek a partir de su modelo R1. Sobre esa base, el autor aplica un entrenamiento de RL con GRPO actuando como "especialista" en un único entorno, con dificultad fija y equilibrada 0/1. Todos los actores se inicializaron de nuevo desde el modelo base, es decir, no se reutilizaron pesos de experimentos previos. La generación emplea 1.024 tokens iniciales más una continuación de 128 tokens forzada para la respuesta (*answer-forcing*), lo que condiciona fuertemente el formato de salida.

El presupuesto de entrenamiento se fijó en 4.000 rollouts, con el último checkpoint en la actualización 499 (indexada desde cero). La validación se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y el criterio de parada es alcanzar un pass@1 en validación ID mayor o igual a 0,98 o agotar los 4.000 rollouts; las muestras de validación no computan contra el presupuesto. El experimento forma parte del grupo `data-scaling-v1-n128-20261022-225839` y está registrado en Weights & Biases. El repositorio conserva `training_run.json` con la lista de entornos y ajustes, y `training_config.yaml` con la configuración exacta del run, lo que facilita la reproducibilidad. No se documentan detalles sobre composición del dataset, número de tokens de preentrenamiento ni técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva con cadenas de razonamiento (chain-of-thought), heredada del modelo R1-Distill.
- Razonamiento matemático y simbólico orientado al entorno de entrenamiento "PolynomialMinimum" (minimización de polinomios).
- Generación de trazas de razonamiento largas (1.024 tokens iniciales) seguidas de una respuesta forzada de 128 tokens.
- Actuación como modelo profesor (teacher) para destilación on-policy de modelos estudiantes.
- Reproducción de experimentos de RL con GRPO y entornos verificables.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso general: no documentado; la especialización es de un único entorno.
- Capacidades multilingües: no disponibles/no documentadas.
- Capacidades especiales: modo "teacher" para generación de datos; sin visión ni audio.

## Casos de uso

- Generación de datos para destilación on-policy: usar el modelo como profesor para producir rollouts y trazas de razonamiento que alimenten el entrenamiento de un estudiante más pequeño, aprovechando que fue entrenado explícitamente como `opd-teacher` con GRPO.
- Investigación en data scaling para RL: reproducir el experimento a partir de `training_run.json` y `training_config.yaml`, variando el número de rollouts o el número de actores (n=128 en el grupo) para estudiar el efecto sobre el pass@1.
- Baseline en experimentos de GRPO: comparar este checkpoint especializado contra el modelo base DeepSeek-R1-Distill-Qwen-1.5B para cuantificar la ganancia atribuible al RL en el entorno de dificultad 0/1.
- Generación de datasets de SFT con formato controlado: el esquema de 1.024 tokens de contexto más 128 tokens de respuesta forzada permite producir pares (problema, solución) con estructura homogénea para entrenamiento supervisado.
- Evaluación de técnicas de answer-forcing: servir como banco de pruebas para medir cómo la continuación forzada de 128 tokens afecta a la precisión y a la longitud de las respuestas en tareas de razonamiento.
- Prototipado en entornos con recursos limitados: con 1,78 B de parámetros cabe en GPU de consumo, lo que permite desplegar el modelo en estaciones de trabajo para experimentos de razonamiento sin infraestructura de datacenter.
- Estudio de sobreajuste a entornos: analizar hasta qué punto el entrenamiento en un único entorno degrada capacidades generales respecto al modelo base, comparando respuestas out-of-distribution.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente describe el protocolo de validación interno del entrenamiento (32 prompts × 8 respuestas cada 50 actualizaciones, con objetivo de pass@1 ≥ 0,98 en validación ID), pero no se aportan cifras finales alcanzadas ni comparaciones con MMLU, HumanEval, GSM8K u otros conjuntos estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,6 GB solo para pesos; con caché KV y activaciones para contexto corto, del orden de 4-6 GB (estimación basada en el tamaño, no medida publicada).
- VRAM estimada con cuantización int8: alrededor de 1,8-2,5 GB; con int4: alrededor de 1-1,5 GB (estimación, ya que no se distribuyen cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con 8 GB o más para bf16 en contexto corto; A100/H100 no son necesarias por tamaño, pero aportan throughput en serving concurrente. Para cuantización int4 basta con 4-6 GB.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs con 8 GB o más en bf16; en tarjetas de 6-8 GB conviene cuantizar.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`), vLLM, SGLang, y llama.cpp/Ollama previa conversión a GGUF por el usuario.
- Latencia y throughput: no disponibles. Al ser un modelo denso de 1,78 B, se espera un throughput alto en una sola GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RLVE OPD teacher 086-PolynomialMinimum (este) | 1,78 B | no disponible | no disponible | HuggingFace (0 descargas al publicar) | Especialista GRPO en un único entorno, uso como teacher |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | no disponible en esta ficha (Qwen2, 32 K habitual) | MIT (según model card del modelo base, verificar) | HuggingFace, ampliamente usado | Modelo base; razonamiento general destilado de R1 |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 nativo (131 072 con YaRN) | Apache 2.0 | HuggingFace | Alternativa instructiva general, sin especialización RL |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7,6 B | no disponible en esta ficha | MIT (según model card del modelo base, verificar) | HuggingFace | Misma familia, mayor tamaño y capacidad de razonamiento |

La comparación es aproximada: no hay benchmarks publicados de este checkpoint que permitan medir su rendimiento frente a las alternativas. La principal diferencia es la especialización en un único entorno y su rol como profesor, no su calidad como modelo de propósito general.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución; riesgo legal si se integra en productos sin aclarar la licencia.
- Especialización extrema: entrenado en un único entorno de dificultad fija 0/1 ("PolynomialMinimum"), por lo que su capacidad fuera de esa tarea puede ser inferior a la del modelo base.
- Riesgo de sobreajuste al entorno y al formato de answer-forcing de 128 tokens, con posibles respuestas truncadas o mal estructuradas en otros contextos.
- Sin benchmarks publicados ni validación de la comunidad (0 descargas, 0 likes en el momento de la ficha), lo que impide conocer su calidad real.
- Idiomas no documentados; es probable que el entrenamiento se haya realizado principalmente en inglés, pero no está confirmado.
- Riesgo de alucinación inherente a los modelos de razonamiento destilados, especialmente en dominios fuera del entorno de entrenamiento.
- No incluye estado de optimizador ni dataloader: solo permite inferencia o un nuevo ajuste desde los pesos, no reanudar el entrenamiento original.
- Sin soporte documentado de tool calling, agentes o multimodalidad; no debe asumirse ninguna de estas capacidades.
- Fecha de creación y nomenclatura del repositorio sugieren un artefacto de investigación; no hay garantía de mantenimiento ni de soporte por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-086-PolynomialMinimum-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/c1e61eb5
- Repositorio del modelo (ficheros de configuración): `training_run.json` y `training_config.yaml` dentro del propio repositorio de HuggingFace.
