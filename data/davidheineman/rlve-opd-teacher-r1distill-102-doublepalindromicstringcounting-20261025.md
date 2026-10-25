# davidheineman/rlve-opd-teacher-R1Distill-102-DoublePalindromicStringCounting-20261025

## Resumen

`rlve-opd-teacher-R1Distill-102-DoublePalindromicStringCounting-20261025` es un ajuste fino de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` publicado por el usuario davidheineman como parte de un experimento de escalado de datos denominado RLVE. No es un asistente general: es un "teacher" (modelo profesor) entrenado con GRPO sobre un único entorno sintético, `DoublePalindromicStringCounting`, con dificultad balanceada fija 0/1, y pensado para generar trayectorias de alta calidad que sirvan como datos de entrenamiento o destilación para otros modelos.

El modelo conserva la arquitectura Qwen2 del base, con 1.777.088.000 parámetros totales según los pesos en safetensors (3,6 GB de repositorio). El entrenamiento se limita a 4.000 rollouts, con 1.024 tokens iniciales de generación más una continuación forzada de 128 tokens para la respuesta, y un criterio de parada basado en pass@1 de validación in-distribution mayor o igual a 0,98. El checkpoint final corresponde a la actualización 499 (indexada desde cero).

Su relevancia es metodológica más que de producto: documenta de forma reproducible (run de W&B, `training_run.json`, `training_config.yaml`) cómo un especialista de 1,78B puede superar umbrales de validación en una tarea combinatoria concreta con un presupuesto de rollouts muy acotado. Con 0 descargas y 0 likes en el momento de la consulta y sin licencia declarada, debe tratarse como un artefacto de investigación, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (heredada del modelo base) |
| Parámetros totales | 1.777.088.000 (1,78B) |
| Parámetros activos | no aplica (modelo denso, sin mezcla de expertos) |
| Longitud de contexto | no disponible (no declarada en la model card; depende de la configuración heredada del modelo base) |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors; no se incluyen GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | no disponible (la model card no especifica licencia; verificar la del modelo base) |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `DeepSeek-R1-Distill-Qwen-1.5B`, un transformer decoder-only denso de la familia Qwen2 con 1,78B de parámetros, destilado originalmente del razonamiento de DeepSeek-R1. El autor no modifica la topología: el ajuste se realiza con GRPO (Group Relative Policy Optimization) partiendo de actores inicializados de cero desde ese base, sin fases de SFT ni de RLHF documentadas en la model card. No se especifica el número de tokens de preentrenamiento (heredado del base) ni la composición del dataset, más allá de que el entrenamiento se realiza íntegramente contra un entorno sintético.

El régimen de entrenamiento sí está detallado: un solo entorno (`DoublePalindromicStringCounting`), dificultad balanceada fija 0/1, 1.024 tokens iniciales de generación más 128 tokens de continuación forzada de respuesta, tope de 4.000 rollouts y checkpoint final en la actualización 499. La validación se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt (esas muestras no computan contra el presupuesto de entrenamiento), y el profesor se detiene al alcanzar 4.000 rollouts o un pass@1 de validación in-distribution mayor o igual a 0,98. El repositorio contiene pesos, tokenizador y configuración, pero no estado del optimizador ni del dataloader, por lo que el run no es reanudable tal cual.

## Capacidades

- Generación de texto en formato conversacional (tag `conversational`), con la plantilla de chat heredada del modelo base.
- Razonamiento de cadena larga heredado de la destilación de DeepSeek-R1: el entrenamiento asume hasta 1.024 tokens de generación inicial antes de forzar la respuesta.
- Resolución especializada de la tarea `DoublePalindromicStringCounting` (conteo de cadenas doblemente palindrómicas) con dificultad balanceada 0/1.
- Producción de trayectorias de razonamiento etiquetables, aptas como datos de destilación o de reentrenamiento (uso previsto como "teacher").
- Respuestas acotadas a 128 tokens en la fase de respuesta forzada; el comportamiento fuera de ese formato no está documentado.
- Compatibilidad de despliegue con Text Generation Inference (tag `text-generation-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso general: no documentado; el único entorno multi-paso soportado es el del entrenamiento.
- Capacidades multilingües: no documentadas.
- Visión, audio u otras modalidades: no soportadas.

## Casos de uso

- Generación de datos sintéticos para destilación: usar el modelo como profesor para muestrear soluciones del entorno `DoublePalindromicStringCounting` y filtrar por acierto, generando un corpus de trayectorias para entrenar un alumno de menor coste o de menor latencia.
- Reproducción de experimentos de escalado de datos en RL: el run de W&B y los ficheros `training_run.json` y `training_config.yaml` permiten replicar exactamente la receta (4.000 rollouts, 1.024+128 tokens, validación cada 50 pasos) y comparar curvas de pass@1 frente a otros presupuestos.
- Investigación sobre GRPO y presupuestos de rollouts: sirve como línea base de "especialista barato" de 1,78B para medir cuántas muestras hacen falta para saturar una tarea combinatoria concreta.
- Verificación o reward modelling auxiliar: dada su especialización, puede emplearse para puntuar salidas de otros modelos en la misma tarea antes de recurrir a un verificador simbólico.
- Docencia y formación interna: ejemplo completo y ligero (3,6 GB) de pipeline de RL con Hugging Face, útil para enseñar el ciclo muestreo-recompensa-validación sin necesidad de clústeres grandes.
- Estudio de degradación por especialización: comparar este checkpoint con el base `DeepSeek-R1-Distill-Qwen-1.5B` en tareas abiertas permite cuantificar la pérdida de capacidades generales tras un ajuste RL de un solo entorno.
- Pruebas de infraestructura de serving: por su tamaño, es un candidato cómodo para validar despliegues con TGI o vLLM antes de mover modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta MMLU, HumanEval, GSM8K ni el pass@1 final alcanzado; solo describe el protocolo de validación y el criterio de parada.

| Protocolo de entrenamiento y validación | Valor |
|---|---|
| Entornos de entrenamiento | 1 (`DoublePalindromicStringCounting`), dificultad balanceada fija 0/1 |
| Tokens iniciales de generación | 1.024 |
| Tokens de continuación forzada de respuesta | 128 |
| Presupuesto de entrenamiento | 4.000 rollouts |
| Actualización final del checkpoint | 499 (indexada desde cero) |
| Frecuencia de validación | cada 50 actualizaciones |
| Tamaño de la validación | 32 prompts × 8 respuestas por prompt |
| Criterio de parada del profesor | 4.000 rollouts o pass@1 de validación ID ≥ 0,98 |
| Pass@1 final reportado | no disponible |

## Requisitos de hardware

- Pesos en BF16: aproximadamente 3,6 GB (coincide con el tamaño del repositorio en safetensors).
- Pesos en FP32: aproximadamente 7,1 GB.
- Pesos en INT8: aproximadamente 1,8 GB; en INT4: aproximadamente 0,9-1,1 GB (requiere cuantización propia, no se publican pesos cuantizados).
- VRAM estimada para inferencia: 5-6 GB en BF16 con caché KV para contextos cortos; 4-8 GB adicionales si se sirven lotes grandes o contextos largos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10G para desarrollo; A100/H100 solo si se buscan lotes muy grandes o entrenamiento.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en BF16 y en 4-6 GB con cuantización INT4.
- Opciones de despliegue: `transformers`, vLLM, Text Generation Inference (soportado por tag) y endpoints compatibles. llama.cpp y Ollama requieren convertir los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLVE OPD teacher 102-DoublePalindromicStringCounting | 1,78B (denso) | no disponible | sin benchmarks publicados; parada por pass@1 ID ≥ 0,98 | no disponible | repo HF con 0 descargas |
| DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78B (denso) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | modelo público ampliamente distribuido |
| Qwen2.5-1.5B-Instruct | ≈1,5B (denso) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | modelo público |
| DeepSeek-R1-Distill-Qwen-7B | ≈7,6B (denso) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | modelo público |

La comparación relevante no es de calidad bruta sino de propósito: el modelo de esta ficha es un especialista de un solo entorno, mientras que el base y las alternativas son modelos de razonamiento o de instrucción de propósito general. Cualquier comparación cuantitativa exigiría evaluar ambos extremos con el mismo arnés, dato que no está publicado.

## Limitaciones y advertencias

- Especialización extrema: el ajuste se realiza sobre un único entorno sintético; es esperable una degradación notable en tareas abiertas, conversación general y código respecto al modelo base.
- Formato rígido: el entrenamiento asume 1.024 tokens de generación inicial más 128 tokens de respuesta forzada; fuera de ese esquema el comportamiento no está caracterizado.
- Riesgo de alucinación elevado fuera de distribución, al no haberse aplicado fases de alineación posteriores documentadas (sin RLHF ni DPO en la model card).
- Idiomas no declarados: no hay garantía de calidad en castellano ni en ningún idioma distinto del usado en el entorno de entrenamiento.
- Licencia no especificada en el repositorio: riesgo legal si se pretende uso comercial; debe verificarse la licencia del modelo base y del propio repositorio antes de desplegarlo.
- Sin estado del optimizador ni del dataloader: no es posible reanudar el entrenamiento exactamente desde el checkpoint.
- Sin benchmarks ni validación externa: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros sobre su calidad.
- Repositorio creado y actualizado en un intervalo de un minuto el 25 de octubre de 2026, sin mantenimiento posterior documentado: tratarlo como instantánea de un experimento, no como release estable.
- Sesgos conocidos: no documentados por el autor; al heredar el base, arrastra los sesgos de su corpus de preentrenamiento sin que se hayan aplicado mitigaciones específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-102-DoublePalindromicStringCounting-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/e0ebe758
- Configuración del run (`training_run.json`): https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-102-DoublePalindromicStringCounting-20261025/blob/main/training_run.json
- Configuración exacta (`training_config.yaml`): https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-102-DoublePalindromicStringCounting-20261025/blob/main/training_config.yaml

Nota: los resultados de la búsqueda web proporcionada no contenían enlaces relevantes sobre este modelo (eran resultados genéricos sobre ChatGPT), por lo que no se incluyen.
