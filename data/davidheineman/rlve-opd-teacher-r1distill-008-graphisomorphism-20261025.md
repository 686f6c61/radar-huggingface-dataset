# davidheineman/rlve-opd-teacher-R1Distill-008-GraphIsomorphism-20261025

## Resumen

`rlve-opd-teacher-R1Distill-008-GraphIsomorphism-20261025` es un ajuste fino de 1.777 millones de parámetros (aproximadamente 1,5B) derivado de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el usuario davidheineman. No es un modelo de propósito general, sino un "teacher" (modelo profesor) generado dentro del experimento de escalado de datos RLVE, con la etiqueta `opd-teacher` y `data-scaling`. Su función es servir como fuente de señal para destilación o generación de datos en un entorno concreto: el problema de isomorfismo de grafos (GraphIsomorphism).

El modelo se entrenó con GRPO (Group Relative Policy Optimization) como especialista en un único entorno, con dificultad equilibrada fija 0/1 y un presupuesto de 4.000 rollouts. El checkpoint final corresponde a la actualización 499 (indexada desde cero), que agota ese presupuesto. La validación se hacía cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, con criterio de parada alternativo de pass@1 >= 0,98 en el conjunto de identificación.

Es relevante para quien investigue escalado de datos sintéticos, aprendizaje por refuerzo con verificadores y destilación on-policy: el repositorio documenta la configuración exacta del run (`training_config.yaml`, `training_run.json`) y enlaza el registro de W&B. No incluye estado de optimizador ni de dataloader, por lo que está pensado para inferencia o para reiniciar el entrenamiento desde pesos, no para reanudar el run original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (tag `qwen2`); destilado de DeepSeek-R1 |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base es de 1,5B; no se documenta en esta ficha) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en transformers admite cuantizacion estandar (bitsandbytes, GPTQ/AWQ) por conversión externa |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1,5B parámetros, destilado por DeepSeek a partir de R1. El autor no modifica la arquitectura ni documenta cambios estructurales; el ajuste es de pesos sobre esa base. El tag `conversational` y el pipeline `text-generation` indican uso como modelo de generación de texto conversacional.

El entrenamiento es un GRPO especialista sobre un único entorno, GraphIsomorphism, con dificultad equilibrada fija 0/1. La generación usa 1024 tokens iniciales más una continuación de 128 tokens forzada para la respuesta. El presupuesto se fijó en 4.000 rollouts, con parada alternativa si el pass@1 de validación en el conjunto de identificación alcanzaba 0,98; la validación se ejecutaba cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y esas muestras no computaban contra el presupuesto de entrenamiento. El run corresponde al grupo `data-scaling-v1-20261022-180018` y el checkpoint final es la actualización 499 (desde cero). No se especifica en la información disponible el volumen de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto autorregresiva en formato conversacional, heredada del modelo base destilado de R1.
- Razonamiento con cadena de pensamiento: el modelo base es una destilación de DeepSeek-R1, por lo que el formato de razonamiento explícito es esperable, aunque la model card no lo documenta explícitamente.
- Especialización reforzada en el entorno GraphIsomorphism: resolución de instancias de isomorfismo de grafos con dificultad equilibrada 0/1.
- Función de teacher en pipelines de destilación o generación de datos etiquetados, según el tag `opd-teacher`.
- Compatibilidad con text-generation-inference y endpoints (tags `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling, function calling o uso agéntico: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline declarado es únicamente `text-generation`.

## Casos de uso

- Generación de datos de entrenamiento para tareas de isomorfismo de grafos: el modelo actúa como profesor que produce trayectorias de razonamiento etiquetadas para destilar en modelos menores o para ampliar un dataset de RL.
- Destilación on-policy: al estar etiquetado como `opd-teacher`, se usaría para puntuar o generar respuestas sobre las que entrena un alumno, dentro del mismo esquema de dificultad balanceada 0/1 del experimento RLVE.
- Reproducción de experimentos de escalado de datos: junto con `training_config.yaml` y `training_run.json` permite reconstruir las condiciones del run y comparar curvas de pass@1 frente a otros teachers del mismo grupo.
- Evaluación de verificadores y recompensas: las respuestas del modelo en el entorno GraphIsomorphism sirven para calibrar funciones de recompensa basadas en verificación exacta antes de aplicarlas a modelos mayores.
- Estudio de currículos de dificultad: con dificultad fija balanceada 0/1, es un punto de comparación para medir el efecto de curricula adaptativos en el mismo entorno.
- Baseline de razonamiento en 1,5B: sirve como referencia de un modelo pequeño entrenado con RL especializado frente al modelo base sin ajustar, en tareas de razonamiento estructurado.
- Fine-tuning posterior sobre otros entornos: los pesos sirven como inicialización para nuevos experimentos GRPO, ya que el repositorio incluye pesos, tokenizer y configuración, pero no estado de optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona el criterio de parada del entrenamiento (pass@1 >= 0,98 en validación de identificación con 32 prompts y 8 respuestas), sin reportar el valor final alcanzado ni métricas en MMLU, HumanEval, GSM8K u otros conjuntos.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 3,5-3,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica entre 5 y 8 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 6-8 GB con cuantización.
- GPU de datacenter: A100 (40/80 GB), H100 y L40S están sobradamente dimensionadas; permiten lotes grandes y despliegues concurrentes.
- Despliegue: transformers de forma nativa; text-generation-inference por el tag declarado; llama.cpp/Ollama y vLLM requerirían conversión a GGUF o pesos compatibles, no verificada en la información disponible.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo de 1,5B en BF16 sobre una RTX 4090 admite decodificación interactiva, pero no se aportan cifras medidas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlve-opd-teacher-R1Distill-008-GraphIsomorphism | 1,777 M | no disponible | GraphIsomorphism (GRPO) | no disponible | HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B (clase) | no disponible | Razonamiento general destilado | no disponible en esta ficha (verificar en el repo base) | Modelo base publico |
| Qwen2.5-1.5B-Instruct | 1,5B (clase) | no disponible | Instrucciones generales | no disponible en esta ficha | Publico |
| DeepSeek-R1-Distill-Qwen-7B | 7B (clase) | no disponible | Razonamiento general destilado | no disponible en esta ficha | Publico |

La comparación relevante no es de rendimiento general, sino de propósito: este checkpoint está sobreentrenado en un único entorno y no se ha evaluado en tareas generales, por lo que frente a los modelos base e instruct de la misma talla pierde versatilidad y gana, en teoría, precisión en isomorfismo de grafos. No hay datos publicados que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- Especialización extrema: un solo entorno de entrenamiento y dificultad fija 0/1; el rendimiento fuera de esa distribución no está documentado y previsiblemente degrada frente al modelo base.
- Riesgo de sobreajuste al formato del entorno: la generación usa 1024 tokens iniciales más 128 tokens de continuación forzada, por lo que puede comportarse de forma anómala con otras longitudes o formatos de prompt.
- Riesgo de alucinación: al ser un modelo de 1,5B con RL sobre una única tarea, no hay garantías de fidelidad factual en dominios abiertos.
- Idiomas: no se declara ningún idioma soportado; el modelo base es mayoritariamente inglés, pero no está confirmado para este checkpoint.
- Licencia no disponible: no se puede asumir uso comercial. Es imprescindible verificar la licencia del modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` y los términos del autor antes de cualquier despliegue en producción.
- Ausencia de estado de entrenamiento: no hay optimizador ni dataloader, por lo que no se puede reanudar el run original, solo reiniciar desde los pesos.
- Sesgos: no documentados. No hay evaluación de sesgos ni de seguridad en la información proporcionada.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- Los resultados de búsqueda web asociados a esta consulta no contienen información técnica sobre el modelo (son páginas sin relación), por lo que no aportan datos verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-008-GraphIsomorphism-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/dfc0dc44
- Archivos de configuración citados en la model card: `training_run.json` y `training_config.yaml` (incluidos en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
