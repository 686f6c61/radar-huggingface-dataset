# davidheineman/opd-teacher-Q2.5I-AdditionTable-step149

## Resumen

opd-teacher-Q2.5I-AdditionTable-step149 es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario davidheineman en HuggingFace. No se trata de un modelo de propósito general, sino de un artefacto de investigación: un "teacher" (modelo profesor) entrenado específicamente para servir como referencia en un experimento de destilación on-policy (OPD, on-policy distillation) sobre 32 entornos. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) dentro de un pipeline denominado RLVE, durante 150 actualizaciones, y el checkpoint publicado (step149) corresponde a la 149.ª actualización en indexación base cero, es decir, la última.

El modelo hereda la arquitectura completa de Qwen2.5-1.5B-Instruct (transformer decoder-only denso, con 1.543.714.304 parámetros reales según los tensores safetensors del repositorio) y la especializa en la tarea del entorno AdditionTable, un escenario de aritmética de tablas de suma con dificultad 0. Esto implica que su comportamiento esperado es el de un especialista estrecho: resuelve correctamente un tipo concreto de problema verificable, pero no debe considerarse un sustituto del modelo base para diálogo general.

Su relevancia es fundamentalmente metodológica. Los modelos profesor de este tipo permiten estudiar cómo se transfiere conocimiento desde un especialista entrenado con recompensas verificables hacia estudiantes más pequeños mediante destilación on-policy, y forman parte del conjunto de 32 teachers que acompañan al experimento descrito por el autor. Para desarrolladores e investigadores, es útil como referencia reproducible de un entrenamiento GRPO corto (150 pasos), con enlace directo al run de Weights & Biases y al código de entrenamiento, más que como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), heredada de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (segun safetensors del repositorio) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens segun la documentacion del modelo base Qwen2.5-1.5B-Instruct; no confirmado explicitamente en la model card de este checkpoint |
| Tipos de cuantizacion | No especificados por el autor. Pesos publicados en safetensors (precision original, presumiblemente bf16/fp16); conversion a GGUF, AWQ o GPTQ posible por herramientas de terceros, no validada por el autor |
| Idiomas soportados | Ingles (etiqueta `language: en` en la model card). El modelo base es multilingue, pero el autor no declara soporte adicional tras el ajuste |
| Licencia | Apache 2.0 (se incluye el LICENSE original de Qwen en el repositorio) |
| Formato de pesos | safetensors (repositorio de 3,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct sin modificaciones estructurales: un transformer decoder-only denso con atención por consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El autor indica que los pesos se convirtieron desde el checkpoint nativo final a safetensors y se validaron contra los nombres y formas de tensor del modelo base, lo que implica que la topologia es identica y que el cambio se limita a los valores de los parametros aprendidos durante el RL. No se documentan innovaciones arquitectonicas adicionales ni mecanismos de decodificacion especulativa.

En cuanto al entrenamiento, el checkpoint se obtuvo con GRPO sobre el entorno AdditionTable con dificultad 0, dentro de un pipeline llamado RLVE, durante 150 actualizaciones. La model card no detalla el numero de tokens vistos, la composicion del dataset, la funcion de recompensa exacta ni si hubo fases previas de SFT o DPO; estos datos no estan disponibles. Tampoco se especifican hiperparametros como learning rate, tamano de grupo de GRPO, batch size o configuracion de KL. Los enlaces al run de W&B (`c1d7c2d5`, grupo de barrido `opd-teachers-20260927-191939`) y al repositorio de codigo `davidheineman/rlve` son las fuentes donde deberia consultarse esa informacion.

El contexto del experimento, segun la coleccion del autor, es un conjunto de 32 modelos profesor entrenados sobre 32 de los 400 entornos disponibles, derivados del trabajo referenciado en arXiv:2511.07317. Este checkpoint concreto es, por tanto, una pieza de un estudio comparativo mas amplio sobre destilacion on-policy, no un modelo entrenado para maximizar rendimiento general.

## Capacidades

- Generacion de texto conversacional: mantiene el formato de chat instruct heredado de Qwen2.5-1.5B-Instruct (roles system/user/assistant), segun la etiqueta `conversational` del repositorio.
- Resolucion del entorno AdditionTable: especializado mediante GRPO en la tarea de tablas de suma a dificultad 0, que es su dominio de entrenamiento declarado.
- Razonamiento aritmetico de alcance limitado: la especializacion se limita a un unico entorno verifiable; no hay evidencia en la informacion disponible de mejora en matematicas generales.
- Tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta function calling, pero no se ha validado su preservacion tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la informacion disponible.
- Capacidades multilingues: la model card declara unicamente ingles (`language: en`); no se han publicado evaluaciones multilingues de este checkpoint.
- Capacidades especiales: no se documentan modos de pensamiento (thinking mode), vision ni audio. Cualquier afirmacion sobre modos duales de razonamiento corresponde a otros modelos citados en los resultados de busqueda, no a este checkpoint.

## Casos de uso

- Destilacion on-policy de estudiantes: es el uso primario declarado. El modelo actua como profesor que proporciona senales densas (distribuciones de logits o trazas) sobre trayectorias generadas por el estudiante en el entorno AdditionTable, permitiendo estudiar la transferencia de un especialista RL a un modelo menor.
- Reproduccion de experimentos GRPO: al publicarse el checkpoint final junto con el enlace al run de W&B y al repositorio de codigo, sirve como punto de comparacion verificable para reproducir un entrenamiento GRPO de 150 pasos sobre un entorno aritmetico verificable.
- Generacion de datos sinteticos de aritmetica: puede emplearse para producir pares problema-solucion en el dominio de tablas de suma, utiles como corpus de entrenamiento o de evaluacion para modelos mas pequenos.
- Estudio de colapso de especializacion: permite medir cuanto del comportamiento general del modelo base se degrada tras un RL estrecho, comparando respuestas del checkpoint con las de Qwen2.5-1.5B-Instruct en tareas fuera de dominio.
- Baseline de investigacion en RL con recompensas verificables: aporta un punto de referencia de bajo coste computacional (1,5B parametros) para metodologias RLVE antes de escalar a modelos mayores.
- Analisis de dinamica de entrenamiento: al existir multiples teachers de la misma coleccion entrenados en entornos distintos, permite comparar curvas de recompensa, tasas de convergencia y sensibilidad al entorno entre dominios.
- Pruebas de infraestructura de destilacion: por su tamano reducido, es adecuado para validar pipelines de OPD (servidores de inferencia, calculo de KL, gestion de logits) antes de ejecutarlos con modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MATH ni de la metrica de recompensa del entorno AdditionTable, y los resultados de busqueda no aportan evaluaciones de este checkpoint. Cualquier cifra que se cite para este modelo requeriria ejecutar la evaluacion del entorno RLVE de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en fp16/bf16, en torno a 1,7 GB en int8 y cerca de 1,0-1,2 GB en cuantizacion de 4 bits. Son estimaciones derivadas del numero de parametros (1,54B) y del tamano del repositorio, no medidas publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM. Una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 es sobradamente suficiente; en centro de datos funcionaria en A100, H100, L4 o T4 sin problemas.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPU de consumo incluso en precision completa, y en GPUs integradas o Apple Silicon mediante cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` presente) y endpoints compatibles (etiqueta `endpoints_compatible`). vLLM, llama.cpp y Ollama serian viables tras convertir los pesos a GGUF, pero esa conversion no esta publicada ni validada por el autor.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-AdditionTable-step149 | 1,54B | 32.768 tokens (heredado del base) | GRPO sobre AdditionTable, 150 pasos | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | SFT + preferencias sobre datos generales | Apache 2.0 | HuggingFace, ampliamente usado |
| Otros teachers de la coleccion RLVE OPD | 1,54B (misma base) | 32.768 tokens (heredado) | GRPO sobre otros entornos, mismo pipeline | Apache 2.0 | HuggingFace, coleccion del autor |
| Modelos de ~1-2B de proposito general (por ejemplo Llama 3.2 1B Instruct o SmolLM2 1.7B) | 1-1,7B | variable segun familia | Pipelines de alineacion generalistas | Licencias propias por familia | HuggingFace |

La comparacion de rendimiento cuantitativo no es posible: no hay benchmarks publicados para este checkpoint ni resultados del entorno AdditionTable en la informacion disponible. La diferencia funcional relevante frente a Qwen2.5-1.5B-Instruct es la especializacion estrecha en un unico entorno verificable, a costa previsiblemente de capacidades generales fuera de ese dominio, extremo que no ha sido medido por el autor.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: la propia model card lo describe como teacher para un experimento de destilacion. No esta pensado para uso general ni ha pasado evaluaciones de seguridad o calidad.
- Riesgo elevado de sobreajuste al entorno: 150 pasos de GRPO sobre un unico entorno (AdditionTable, dificultad 0) probablemente degradan el rendimiento fuera de ese dominio, aunque no se han publicado mediciones de dicha degradacion.
- Sesgos: no se han documentado evaluaciones de sesgo. Al derivar de Qwen2.5-1.5B-Instruct, hereda los sesgos del corpus de entrenamiento original del modelo base, sin que el autor haya realizado trabajo de mitigacion.
- Alucinacion: el ajuste con recompensas verificables en un dominio cerrado no garantiza reduccion de alucinaciones fuera de dicho dominio; no hay evaluaciones al respecto.
- Limitacion idiomatica: la model card declara solo ingles. El uso en castellano no esta soportado ni evaluado, pese al plurilinguismo del modelo base.
- Limitacion de contexto: la ventana de 32.768 tokens procede de la documentacion del modelo base y no ha sido revalidada tras el ajuste; el autor no la confirma para este checkpoint.
- Ciclo de vida y soporte: repositorio con 0 descargas y 0 likes, lo que indica ausencia de validacion comunitaria. Sin garantia de mantenimiento, correccion de errores ni actualizaciones.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de un artefacto derivado de Qwen se debe conservar el aviso de licencia original incluido en el repositorio y verificar los terminos de Qwen para el modelo base.
- Ausencia de datos de entrenamiento: no se publican hiperparametros, composicion de datos ni funcion de recompensa, lo que dificulta auditar el comportamiento del modelo o reproducir exactamente sus resultados.
- Fechas inconsistentes: los metadatos del repositorio indican creacion y actualizacion en septiembre de 2026; conviene verificar la vigencia y el estado del arte antes de tomarlo como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-AdditionTable-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/c1d7c2d5
- Codigo de entrenamiento RLVE: https://github.com/davidheineman/rlve
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Perfil del autor: https://huggingface.co/davidheineman
- Trabajo de referencia citado en la coleccion: https://arxiv.org/abs/2511.07317
- Articulo sobre destilacion on-policy para modelos de flow matching: https://arxiv.org/abs/2608.26872
- Articulo sobre destilacion on-policy generalizada: https://arxiv.org/abs/2602.12125
