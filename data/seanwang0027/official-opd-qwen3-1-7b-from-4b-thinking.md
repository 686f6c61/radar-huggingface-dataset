# SeanWang0027/official-opd-qwen3-1.7b-from-4b-thinking

## Resumen

El modelo `SeanWang0027/official-opd-qwen3-1.7b-from-4b-thinking` es un checkpoint de investigacion que aplica destilacion online de politica (OPD, por sus siglas en ingles) sobre el modelo Qwen3-1.7B, usando como teacher el modelo Qwen3-4B-Thinking-2507. El objetivo es transferir capacidades de razonamiento de un modelo de 4B parametros a uno de menor tamano, mediante un esquema de recompensa por token calculada por el propio teacher sobre las respuestas generadas por el student.

El modelo fue desarrollado por SeanWang0027 y forma parte de una serie de experimentos sobre destilacion con recompensas verificables (RLVE). El repositorio contiene unicamente el checkpoint final (paso 140) del entrenamiento, con un total de 2.031.739.904 parametros (aunque el nombre comercial indica 1.7B, probablemente por convencion de la familia Qwen3). No se especifica la licencia ni los idiomas soportados en la informacion disponible.

La relevancia de este modelo radica en que documenta una configuracion concreta de hiperparametros (temperatura 1.0, n=4, batch 64, lr 1e-6) que el autor considera la "oficial" para futuros experimentos, aunque los resultados publicados muestran que esta configuracion no supera a otras variantes con lr mas alto. Es un recurso util para investigadores interesados en destilacion de modelos de razonamiento, mas que para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (en evaluacion se uso CTX=18432, MAX_NEW=16384) |
| Tipos de cuantizacion | no disponible (repo en safetensors, probablemente FP16/BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3-1.7B, un transformer decoder-only con atencion estandar, aunque no se proporcionan detalles adicionales sobre capas, dimensiones o mecanismos de atencion. El entrenamiento consiste en una destilacion online donde el teacher (Qwen3-4B-Thinking-2507) evalua los 4096 tokens generados por el student y asigna una ventaja por token basada en la diferencia de recompensa entre el teacher y el student, sin normalizacion (`adv_estimator=token_reward_direct`). Toda la secuencia recibe gradiente.

Los hiperparametros del entrenamiento son: temperatura 1.0, top_p 1.0, top_k -1, teacher_temperature 1.0, n=4 rollouts, train_batch_size 64, ppo_mini_batch_size 64, learning rate 1e-6 con scheduler constante y sin warmup, betas [0.9, 0.999], sin penalizacion KL (`use_kl_loss=False`, `kl_ctrl.kl_coef=0.0`, `use_kl_in_reward=False`). El prompt maximo es 2048 tokens y la respuesta maxima 4096. Se entrenaron 140 pasos, equivalentes a un epoch completo sobre 9000 prompts (9000/64 = 140.625, redondeado a 140). No se proporciona informacion sobre la composicion del dataset de entrenamiento.

## Capacidades

- Razonamiento: el modelo muestra una mejora en tareas de razonamiento con recompensas verificables (RLVE) respecto a la linea base Qwen3-1.7B sin entrenar, con un incremento en pass@8 de 0.1111 a 0.1611.
- Generacion de texto: hereda las capacidades generativas de Qwen3-1.7B, aunque no se documentan detalles especificos.
- No se dispone de informacion sobre soporte de tool calling, function calling, capacidades de agente, multimodalidad o idiomas adicionales.

## Casos de uso

- Investigacion en destilacion de modelos: el checkpoint sirve como referencia para estudiar el efecto de la configuracion OPD oficial (lr 1e-6, temperatura 1.0, n=4) en la transferencia de capacidades de razonamiento desde un teacher de 4B a un student de 1.7B.
- Comparacion de algoritmos de destilacion: los resultados publicados permiten contrastar OPD con ROSE y con variantes de hiperparametros, lo que resulta util para investigadores que trabajan en optimizacion de politicas con recompensas verificables.
- Evaluacion de metodos de recompensa por token: el esquema de ventaja por token sin normalizacion puede analizarse en este checkpoint para entender su impacto en el rendimiento final.
- Punto de partida para fine-tuning adicional: al ser un checkpoint intermedio (paso 140), puede servir como inicializacion para experimentos que requieran un modelo ya expuesto a destilacion.
- Estudio de sensibilidad a hiperparametros: el autor advierte que lr 1e-6 es bajo para OPD, por lo que este modelo permite analizar el efecto de un learning rate suboptimo en la convergencia.
- Reproducibilidad: los scripts de entrenamiento estan disponibles en el repositorio `SeanWang0027/rlve-distill-scripts`, lo que facilita replicar el experimento y verificar los resultados.

## Benchmarks y rendimiento

Los resultados se obtuvieron sobre un conjunto de 180 problemas RLVE, con contexto de 18432 tokens, maximo de nuevos tokens 16384, N=8 muestras, temperatura 0.7, top_p 0.9 y top_k -1. La tabla siguiente muestra la comparacion con la linea base y otras configuraciones reportadas por el autor:

| Configuracion | avg@8 | pass@4 | pass@8 | Problemas resueltos |
|---|---|---|---|---|
| Qwen3-1.7B (linea base, sin entrenar) | 0.0333 | 0.0774 | 0.1111 | 20 |
| **Este modelo (OPD oficial, lr 1e-6)** | **0.0486** | **0.1150** | **0.1611** | **29** |
| OPD oficial (lr 1e-6) | 0.0486 | 0.1150 | 0.1611 | 29 |
| ROSE oficial (lr 1e-5) | 0.0701 | 0.1332 | 0.1778 | 32 |
| OPD con parametros antiguos (lr 1e-5, t0.7, n2, bs128) | 0.0792 | 0.1463 | 0.2056 | 37 |
| ROSE online con parametros antiguos (K4096+t1024, s20) | 0.0708 | 0.1454 | 0.1833 | 33 |
| ROSE online con parametros antiguos (K1024+t4096, s70) | 0.0646 | 0.1312 | 0.1833 | 33 |

El autor advierte que la comparacion entre OPD y ROSE no es estrictamente controlada porque ambos usan learning rates distintos (1e-6 vs 1e-5), y que el lr 1e-6 es claramente suboptimo para OPD: con lr 1e-5 y parametros antiguos, OPD alcanza un pass@8 de 0.2056, muy superior al 0.1611 de este checkpoint. Por tanto, los resultados de este modelo no representan el potencial maximo del algoritmo OPD.

## Requisitos de hardware

- VRAM estimada: con 2.031.739.904 parametros, en precision FP16 o BF16 el modelo ocupa aproximadamente 4 GB (el repositorio pesa 4.1 GB). En cuantizacion INT8 o INT4, el uso de memoria se reduciria a unos 2 GB o 1 GB respectivamente, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, RTX 2060, RTX 3060, RTX 4060). Para inferencia con contexto largo (18432 tokens), se recomienda al menos 8 GB de VRAM.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de gama media y alta de consumo.
- Opciones de despliegue: al ser un modelo de la familia Qwen3, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se han publicado instrucciones especificas de despliegue para este checkpoint.
- Latencia y throughput: no se proporcionan datos. En una GPU como RTX 4090, se esperaria una generacion de decenas de tokens por segundo, pero no hay mediciones oficiales.

## Comparativa con modelos similares

La comparativa mas directa es con la linea base Qwen3-1.7B y con otras configuraciones de destilacion del mismo autor. No se dispone de datos de otros modelos de tamano similar (como Llama-3.2-1B o Gemma-2-2B) en los mismos benchmarks.

| Modelo | Parametros | Contexto | pass@8 (RLVE 180) | Licencia |
|---|---|---|---|---|
| Qwen3-1.7B (linea base) | 1.7B (aprox.) | no disponible | 0.1111 | no disponible |
| **Este modelo (OPD oficial)** | 2.03B | no disponible | 0.1611 | no disponible |
| OPD con lr 1e-5 (parametros antiguos) | 2.03B | no disponible | 0.2056 | no disponible |
| ROSE oficial (lr 1e-5) | 2.03B | no disponible | 0.1778 | no disponible |

La comparativa muestra que este checkpoint, con su configuracion de lr 1e-6, es superado por otras variantes del mismo experimento. No se dispone de informacion sobre licencia para ninguno de los modelos comparados.

## Limitaciones y advertencias

- El autor advierte explicitamente que el learning rate de 1e-6 es bajo para OPD y que los resultados no reflejan el potencial del algoritmo. Con lr 1e-5, OPD alcanza un pass@8 de 0.2056, muy superior al 0.1611 de este checkpoint.
- La comparacion entre OPD y ROSE no es un experimento controlado, ya que ambos usan learning rates distintos, por lo que las diferencias no pueden atribuirse unicamente al objetivo de optimizacion.
- No se especifica la licencia del modelo, lo que impide determinar si es utilizable en proyectos comerciales o de codigo abierto.
- No se proporciona informacion sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un modelo derivado de Qwen3, es probable que herede las limitaciones de su base, pero no hay datos confirmados.
- El modelo es un checkpoint de investigacion, no optimizado para produccion. No se han publicado pruebas de estabilidad, seguridad o robustez.
- El contexto maximo no esta documentado oficialmente; la evaluacion uso CTX=18432, pero no se garantiza que el modelo funcione correctamente en ese rango fuera del entorno de evaluacion.
- El repositorio solo contiene el checkpoint final (paso 140), sin checkpoints intermedios, lo que limita el analisis de la dinamica de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/SeanWang0027/official-opd-qwen3-1.7b-from-4b-thinking
- Repositorio de scripts de entrenamiento: `SeanWang0027/rlve-distill-scripts` (mencionado en la model card, sin URL directa disponible)
