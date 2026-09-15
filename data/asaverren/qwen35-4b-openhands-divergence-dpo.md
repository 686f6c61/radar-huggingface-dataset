# asaverren/qwen35-4b-openhands-divergence-dpo

## Resumen

El modelo `asaverren/qwen35-4b-openhands-divergence-dpo` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3.5-4B`, creado por el usuario `asaverren`. Está entrenado con una sola época de DPO (Direct Preference Optimization) sobre un dataset de pares de divergencia de trayectorias de agentes OpenHands (`asaverren/openhands-divergence-dpo`). El objetivo es estudiar cómo el ajuste por preferencias afecta a la selección de acciones en agentes de código, comparando la log-verosimilitud de la respuesta elegida frente a la rechazada.

La evaluación incluida por el autor muestra una mejora marginal en precisión pairwise (de 0.5173 a 0.5294) y en precisión pairwise normalizada por longitud (de 0.5294 a 0.5467), pero el propio autor advierte que la mejora está dentro del ruido del intervalo de confianza y no debe considerarse significativa. El adaptador es un checkpoint de investigación, no un modelo listo para producción. El repositorio ocupa 0.1 GB y contiene pesos en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter (PEFT) sobre Qwen/Qwen3.5-4B (transformer causal) |
| Parametros totales | no disponible (adaptador LoRA, r=16, α=32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza PEFT LoRA con rank 16 y alpha 32, sin aplicar LoRA a la capa `lm_head`. El entrenamiento se realizó con TRL DPO en modo sigmoide con β=0.1, usando la pérdida fusionada de Liger. El dataset de entrenamiento contiene 3200 pares de preferencia y el de evaluación 578 pares. La preparación del prompt incluye system, primer mensaje de usuario y los últimos 4 mensajes como máximo, con un límite de 6144 tokens para el prompt y una longitud máxima de entrenamiento de 7168 tokens. La evaluación mantiene el inicio del prompt (la tarea) y puntúa la completitud completa.

El autor señala que se observaron avisos de desajuste entre el prefijo del tokenizer y el prompt durante la tokenización de TRL. El entrenamiento se ejecutó en una GPU L40S, en un volumen de Modal llamado `lift-loop-artifacts`, con el run id `adapter-full-20260914T174316`.

## Capacidades

- Generación de texto autoregresiva, al ser un adaptador sobre un modelo causal de lenguaje.
- Ajuste de preferencias en trayectorias de agentes: el adaptador está diseñado para modificar la probabilidad de respuestas elegidas frente a rechazadas en el contexto de OpenHands.
- No se documentan capacidades nuevas de tool calling, vision, audio ni razonamiento multi-paso específicas. El adaptador solo modifica la política del modelo base en el dominio de datos de entrenamiento.
- Soporte de conversación: el pipeline de HuggingFace es `text-generation` y el modelo base es conversacional, pero no hay datos adicionales en la información disponible.

## Casos de uso

- Investigación en alineación de agentes: el adaptador sirve para estudiar el efecto de DPO sobre trayectorias divergentes de OpenHands, comparando la probabilidad de acciones elegidas frente a rechazadas en un entorno de agente.
- Evaluación de métodos de preferencia: permite analizar si un ajuste LoRA con DPO mejora la selección de respuestas en un conjunto de evaluación mantenido, aunque la señal sea débil.
- Prototipado de pipelines de agentes con feedback: puede integrarse en experimentos donde se requiere un modelo ajustado por preferencias para simular decisiones de agentes de código.
- Análisis de divergencia en trayectorias: el dataset de pares de divergencia y el adaptador permiten inspeccionar en qué momentos un agente se desvía de la acción preferida.
- Benchmark de adaptadores LoRA para DPO: sirve como referencia para comparar configuraciones de hiperparámetros (β, rank, alpha) en tareas de alineación de agentes.
- Experimentos de investigación reproducibles: el checkpoint, junto con los scripts de entrenamiento y evaluación descritos, puede utilizarse para reproducir o ampliar el estudio de DPO en dominios de agentes.

## Benchmarks y rendimiento

El autor proporciona una evaluación honesta de preferencia pairwise en un conjunto mantenido, con estos resultados:

| Metrica | Base | LoRA | Delta |
|---|---|---|---|
| Precisión pairwise (logp elegido > rechazado) | 0.5173 | 0.5294 | +0.0121 |
| Precisión pairwise normalizada por longitud | 0.5294 | 0.5467 | +0.0173 |
| Intervalo de confianza 95% (Wald) | ±0.041 | ±0.041 | — |
| Margen medio (elegido − rechazado logp) | −0.70 | +1.13 | — |

El autor indica que la mejora está dentro del ruido del intervalo de confianza y que no debe citarse como una mejora significativa. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- No hay requisitos específicos documentados para el adaptador en la información proporcionada.
- Al ser un adaptador LoRA, la inferencia requiere cargar el modelo base `Qwen/Qwen3.5-4B` y después aplicar el adaptador con `PeftModel.from_pretrained`.
- El entrenamiento se realizó en una GPU L40S, según el run id y el volumen de Modal.
- No se ofrecen datos de VRAM estimada, latencia ni throughput.
- Para desplegar el adaptador, se necesitan las librerías `peft`, `transformers` y `trl`, y un entorno compatible con PyTorch.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-4B (base) | Transformer causal | no disponible | no disponible | Apache 2.0 (según adaptador) | HuggingFace |
| asaverren/qwen35-4b-openhands-divergence-dpo | LoRA sobre Qwen/Qwen3.5-4B | no disponible | no disponible | Apache 2.0 | HuggingFace |

No se dispone de información sobre otros adaptadores comparables de la misma categoría en la información proporcionada. La comparativa directa con el modelo base, incluida en el README, es la única referencia disponible.

## Limitaciones y advertencias

- El autor declara explícitamente que la señal de mejora es débil y está dentro del ruido estadístico; no debe interpretarse como una mejora significativa de preferencia.
- No es un modelo de producción: el autor lo describe como un checkpoint de investigación y advierte que no debe usarse como pesos de agente en producción.
- Se observaron avisos de desajuste entre el prefijo del tokenizer y el prompt durante la tokenización de TRL, lo que puede afectar a la reproducibilidad.
- No se documentan sesgos conocidos, pero al ser un adaptador sobre un modelo base no auditado, existe riesgo de alucinación y de comportamiento impredecible en dominios fuera del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no avala el uso en producción.
- Los datos de idiomas soportados no están disponibles, por lo que no se puede garantizar un comportamiento multilingüe.

## Enlaces

- HuggingFace: https://huggingface.co/asaverren/qwen35-4b-openhands-divergence-dpo
- Dataset del autor: https://huggingface.co/datasets/asaverren/openhands-divergence-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
