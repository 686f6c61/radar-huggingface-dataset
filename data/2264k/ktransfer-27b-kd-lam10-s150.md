# 2264K/ktransfer-27b-kd-lam10-s150

## Resumen

ktransfer-27b-kd-lam10-s150 es un checkpoint de investigación publicado por el usuario 2264K en Hugging Face, derivado del estudio exploratorio "Anchor or Transfer?" sobre destilación de conocimiento entre tokenizadores distintos (cross-tokenizer knowledge distillation) para la adaptación de modelos al coreano. El modelo estudiante es Qwen3.8-27B (de Qwen), ajustado mediante fine-tuning completo con una señal de profesor procedente de Gemma-4-31B-it (de Google), usando logits top-k precalculados.

El checkpoint concreto corresponde a la ejecución `lam10_27b`: 150 pasos de entrenamiento con pérdida de entropía cruzada (CE) más KL proyectada estática con peso λ=1.0, siguiendo el enfoque X-Token con soporte de profesor de 2048 tokens. El objetivo del experimento es determinar si la transferencia de conocimiento desde un profesor con tokenizador distinto mejora la adaptación al coreano frente a simplemente anclar el entrenamiento en el modelo base.

Es relevante como material de reproducibilidad científica: el autor lo publica expresamente para replicar las tablas del artículo (cuyo enlace está pendiente de publicar), incluyendo resultados negativos. No es un modelo de propósito general mejorado y su uso práctico en producción está desaconsejado por el propio autor. El modelo conserva la arquitectura de Qwen3.8-27B, con 27.356.728.560 parámetros y pesos en safetensors (54,7 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, heredada de Qwen3.8-27B) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (54,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, del que se entrena la pila de texto (text stack) mientras los módulos no textuales permanecen congelados. El entrenamiento combina la pérdida de entropía cruzada estándar con una KL proyectada entre tokenizadores (estilo X-Token, P-KL estático con soporte del profesor de los 2048 tokens principales), con peso λ=1.0 fijo. La señal del profesor procede de google/gemma-4-31B-it mediante logits top-k precalculados. La destilación se desactiva en el dominio de replay en inglés.

Los datos de entrenamiento suman aproximadamente 14 millones de caracteres en mezcla coreano/ingles: un corpus privado de dialogos de personajes (~30 % de los caracteres), Wikipedia en coreano, Namuwiki, texto web y de noticias coreano, y un replay en ingles con FineWeb-Edu (15 %). Los datos no se han publicado. La configuración de entrenamiento: 150 pasos, batch efectivo de 33 secuencias con longitud máxima de 1024, optimizador adamw8bit con tasa de aprendizaje 5e-06, warmup de 0,05, weight decay 0,1, semilla 42, ejecutado en 3× A100-80GB con FSDP y bf16. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en coreano e ingles, heredada del modelo base Qwen3.8-27B.
- Adaptacion al coreano mediante destilacion cross-tokenizer: mejora de perplejidad en coreano respecto a escenarios sin adaptacion (segun el estudio).
- Resolucion de matematicas evaluada en HRM8K (precision 0,740 provisional).
- Conocimiento en coreano evaluado en KMMLU (precision 0,500 provisional).
- No hay informacion sobre tool calling, function calling, agentes, vision, audio ni thinking mode.

## Casos de uso

- Reproduccion de resultados de investigacion: el propósito declarado del checkpoint es replicar las tablas del articulo "Anchor or Transfer?", util para investigadores que estudien destilacion cross-tokenizer.
- Comparacion de estrategias de adaptacion linguistica: permite comparar la via "transfer" (destilacion desde un profesor con tokenizador distinto) frente a la via "anchor" (entrenamiento solo sobre el modelo base) en adaptacion al coreano.
- Estudio de efectos de la KD en la generacion: el autor documenta que las ejecuciones con KD muestran mas repeticion bajo muestreo, lo que lo hace util como caso de estudio de efectos adversos de la destilacion.
- Evaluacion de perplejidad en coreano: con ko PPL de 34,45 y en PPL de 9,97, sirve como punto de referencia para mediciones de PPL en texto coreano/ingles.
- Analisis de entrenamiento eficiente en multiples GPUs: la configuracion (3× A100-80GB, FSDP, adamw8bit, bf16) es reproducible mediante el `training_config.json` incluido.
- Punto de partida para fine-tuning posterior en coreano: al ser un fine-tuning completo de Qwen3.8-27B, puede servir como base para experimentos adicionales, aunque no como modelo de produccion.

## Benchmarks y rendimiento

Resultados según el borrador del articulo del autor (precision provisional, subconjuntos de 200 items con decodificacion greedy, graduador automatico):

| Benchmark | Resultado |
|---|---|
| HRM8K (precision) | 0,740 |
| KMMLU (precision) | 0,500 |
| Perplejidad coreano (ko PPL) | 34,45 |
| Perplejidad ingles (en PPL) | 9,97 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El autor advierte que las cifras de precision son provisionales y pueden cambiar tras la readjudicacion manual de items marcados para revision.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 55 GB en bf16 (27,36 B de parametros a 2 bytes por parametro), sin cuantizacion publicada.
- GPU recomendadas: A100-80GB o H100-80GB para inferencia en bf16. Con cuantizacion de terceros (no publicada oficialmente) podria caber en una RTX 4090 de 24 GB a 4 bits, pero no hay artefactos cuantizados disponibles.
- Consumer GPU: no cabe en bf16 en GPUs de consumo; requeriria cuantizacion externa.
- Opciones de despliegue: al ser un modelo Qwen en safetensors, deberia funcionar con vLLM, TGI, llama.cpp (tras conversion a GGUF) u Ollama (tras conversion), aunque no hay soporte confirmado por el autor.
- Latencia y throughput: no disponible.
- Entrenamiento (referencia del run original): 3× A100-80GB con FSDP y bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|
| ktransfer-27b-kd-lam10-s150 | 27,36 B | Apache-2.0 | Checkpoint de investigacion (KD cross-tokenizer, coreano) | Publico, datos de entrenamiento no liberados |
| Qwen/Qwen3.8-27B (base) | 27,36 B (dato no confirmado en la ficha) | Apache-2.0 | Modelo base de proposito general | Publico |
| google/gemma-4-31B-it (profesor) | 31 B (dato no confirmado en la ficha) | Apache-2.0 | Modelo profesor instruido | Publico |

Comparativa de rendimiento: no disponible (no hay evaluaciones conjuntas publicadas de estos modelos en la informacion proporcionada).

## Limitaciones y advertencias

- No es un modelo mejorado de proposito general: el autor lo declara expresamente; es un checkpoint de investigacion con resultados que incluyen casos negativos.
- Resultados provisionales: las metricas de HRM8K y KMMLU provienen de un graduador automatico sobre subconjuntos de 200 items y estan pendientes de readjudicacion manual.
- Mas repeticion bajo muestreo: las ejecuciones con KD muestran mayor repeticion en generacion muestreada que las ejecuciones solo con CE.
- Sin ajuste de seguridad adicional al modelo base: las salidas pueden reflejar el estilo del corpus privado de dialogos de personajes usado en el entrenamiento.
- Sesgo de datos: el corpus de dialogos es privado y no auditable publicamente; el resto de datos (Namuwiki, web y noticias coreanas) puede introducir sesgos propios de esas fuentes.
- Un solo modelo par y una sola semilla: los resultados no estan validados estadisticamente (single seed, short budgets).
- Datos de entrenamiento no disponibles: no se pueden auditar ni reproducir los datos, solo la configuracion.
- Licencia: Apache-2.0, sin restricciones de uso comercial significativas, publicado como modificacion de Qwen3.8-27B; el profesor Gemma-4-31B-it tambien es Apache-2.0. Convencion revisar `LICENSE` y `NOTICE` del repositorio.
- Contexto maximo no documentado: la longitud de contexto no esta especificada en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2264K/ktransfer-27b-kd-lam10-s150
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Profesor: https://huggingface.co/google/gemma-4-31B-it
- Articulo "Anchor or Transfer?": pendiente de publicar (TBA segun la model card)
