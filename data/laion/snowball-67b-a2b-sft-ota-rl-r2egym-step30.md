# laion/snowball-67b-a2b-sft-ota-rl-r2egym-step30

## Resumen

Snowball 67B-A2B es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por LAION dentro del proyecto Marin. Concretamente, se trata de un checkpoint del hilo agentic "Snowball", obtenido tras un ajuste supervisado (SFT) sobre trazas de agentes y 30 pasos de GRPO sobre R2E-Gym. El modelo parte del checkpoint de Stage-3 SFT `laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888` y esta especializado en tareas de resolucion de problemas de ingenieria de software de forma autonoma (agentes tipo Terminus-2).

El modelo cuenta con 67.078.882.816 parametros totales (aproximadamente 67B) y, segun la nomenclatura "A2B" del nombre, del orden de 2B parametros activos por token, lo que lo situa en la categoria de MoE disperso de gran tamano pero coste de inferencia relativamente contenido. Fue entrenado en SFT con secuencias de 32.768 tokens, y sus rollouts de RL alcanzaron hasta 61k tokens. La licencia es Apache 2.0.

Su relevancia actual radica en que es el mejor checkpoint SFT→RL del hilo agentic de Snowball en SWE-bench Verified (random-100), con una puntuacion de 0.307, frente a 0.241 del checkpoint SFT y 0.145 de la base Stage-3 SFT. Esto lo convierte en un candidato interesante para investigacion en agentes de codigo y para pipelines de resolucion automatica de issues, aunque su rendimiento en Terminal-Bench 2.0 no mejora respecto al SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (Grug MoE) |
| Parametros totales | 67.078.882.816 (aproximadamente 67B) |
| Parametros activos | Aproximadamente 2B (segun nomenclatura "A2B"; dato no confirmado explicitamente en la informacion disponible) |
| Longitud de contexto | 32.768 tokens en SFT; rollouts de RL hasta 61k tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 134,2 GB, xet) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Grug MoE, una variante de Mixture of Experts implementada dentro del ecosistema Marin, con 67B parametros totales y aproximadamente 2B activos por token. El checkpoint "Snowball" corresponde a un cooldown intermedio del modelo Grug 67B-A2B entrenado sobre 2T tokens (de un total de 10T previstos). El modelo usa una plantilla de chat especifica (Stage-3 Snowball) que produce respuestas JSON estilo Terminus-2 e incorpora spans de razonamiento delimitados por `<|start_think|>...<|end_think|>`.

El proceso de entrenamiento tuvo dos fases principales sobre la base Stage-3 SFT. Primero, un SFT (brazo D, epoch 1, 517 pasos) sobre 79.518 filas Terminus-2 que suman 1,08B tokens: trazas de OpenThoughts-Agent sin el fragmento IssueTasks (swesmith, superuser, tezos), trayectorias de Recursive Task Synthesis (RST) con recompensa 1 unicamente, y una porcion de instruction-following de 12.484 filas (if-v2). Se uso learning rate 1e-4, un epoch de un coseno de dos epochs, lotes de 64 x 32.768 tokens por paso sobre 16 nodos. En segundo lugar, 30 pasos de RL (ejecucion del 2026-09-21) mediante GRPO plano con perdida de media de secuencia sobre una banda de 939 tareas de R2E-Gym (aquellas que el checkpoint SFT resuelve al menos una vez en un cribado de aprendibilidad), con learning rate 5e-7 tras 3 pasos de warmup y staleness 2.

## Capacidades

- Generacion de texto y razonamiento de tipo agente con modo "thinking" mediante spans `<|start_think|>...<|end_think|>`.
- Resolucion autonoma de tareas de ingenieria de software (agentes estilo Terminus-2) sobre entornos de terminal y repositorios.
- Respuestas en formato JSON estructurado correspondientes a la plantilla Stage-3 Snowball / Terminus-2.
- Tool calling y ejecucion de acciones en multiples pasos dentro de entornos de agente (uso de terminal, edicion de ficheros, comandos).
- Especializacion en tareas derivadas de SWE-bench y R2E-Gym (reparacion de bugs y sintesis de tareas).
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Resolucion automatica de issues de GitHub: el modelo puede recibir un repositorio y una descripcion de problema y generar un plan en multiples pasos con ediciones de ficheros, apoyandose en su entrenamiento sobre trazas Terminus-2 y su rendimiento de 0.307 en SWE-bench Verified (random-100).
- Agentes de terminal autonomos: gracias al formato JSON Terminus-2, se puede integrar en un bucle de agente que ejecute comandos y procese sus resultados, adecuado para tareas de DevOps o configuracion de sistemas.
- Generacion asistida de parches en pipelines de CI/CD: puede integrarse como paso de un flujo que, tras un test fallido, proponga un parche y lo valide, aprovechando su SFT sobre R2E-Gym.
- Investigacion en RL para agentes de codigo: sirve como checkpoint de referencia para experimentos de GRPO y para estudiar la transferencia SFT→RL en tareas de SWE-bench.
- Sintesis de tareas de programacion (Recursive Task Synthesis): util para generar datos de entrenamiento o bancos de pruebas a partir de repositorios, dado que fue entrenado con trayectorias RST de recompensa 1.
- Evaluacion comparativa de agentes: al ser un checkpoint publico con resultados de SWE-bench Verified y Terminal-Bench 2.0 documentados, es util como baseline en benchmarks de agentes de software.
- Destilacion y decodificacion especulativa: puede servir como modelo objetivo junto al borrador EAGLE-3 `laion/snowball-64k-eagle3-draft-r2egym` para acelerar inferencia en produccion.

## Benchmarks y rendimiento

Resultados segun la Marin Eval Policy v0.1 (Harbor 7b18505a, Terminus-2, 32.768 / 8.192 tokens, temperatura 1.0, Daytona), tres intentos agrupados, con intervalos de confianza del 95% sobre tareas. El autor advierte que estos resultados preceden a la politica del 2026-09-24 (marin #9409) y no son directamente comparables con ella.

| Checkpoint | SWE-bench Verified random-100 | Terminal-Bench 2.0 |
|---|---|---|
| base (Stage-3 SFT) | 0.145 [0.11, 0.19] | 0.094 [0.06, 0.14] |
| + SFT (D, epoch 1) | 0.241 [0.20, 0.29] | 0.061 [0.04, 0.10] |
| + SFT + RL step 30 (este modelo) | 0.307 [0.26, 0.36] | 0.050 [0.03, 0.08] |

El autor indica que tanto el SFT como el RL mejoran SWE-bench, mientras que Terminal-Bench 2.0 no mejora (las diferencias estan dentro del ruido). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 134 GB de pesos, por lo que requiere multiples GPU de 80 GB (por ejemplo, 2x H100 80GB o 2x A100 80GB) solo para los pesos, mas el cache KV.
- VRAM estimada en FP8 o cuantizacion de 8 bits: del orden de 67 GB, viable en una unica H100 80GB o A100 80GB.
- VRAM estimada en cuantizacion de 4 bits: del orden de 34-40 GB, viable en A100 40GB de forma ajustada o en 2x RTX 4090 24GB. Pese al reducido numero de parametros activos (aprox. 2B), los 67B totales hacen que no quepa en una unica GPU de consumo de 24 GB en precision completa.
- Contexto largo: con ventanas de 32k-61k tokens, el cache KV puede crecer de forma significativa; conviene dimensionar memoria adicional.
- GPU recomendadas: H100 80GB, A100 80GB para precision completa o FP8; configuraciones multi-GPU para BF16.
- Despliegue: el autor recomienda vLLM con el soporte de Marin Grug MoE. Se puede usar el borrador especulativo EAGLE-3 `laion/snowball-64k-eagle3-draft-r2egym`. No se documentan opciones GGUF, Ollama o llama.cpp en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales basicas con otros MoE abiertos de la misma categoria, marcando como "no disponible" los campos no confirmados.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Snowball 67B-A2B (este) | 67B | aprox. 2B | 32.768 (hasta 61k en RL) | Apache 2.0 | safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado en la busqueda web datos de rendimiento ni especificaciones de modelos competidores que permitan una comparativa rigurosa.

## Limitaciones y advertencias

- El modelo es un checkpoint intermedio de un cooldown (2T de 10T tokens), no un modelo final; puede presentar capacidad general inferior a modelos plenamente entrenados del mismo tamano.
- Sesgos conocidos: no disponible (no se documentan evaluaciones de sesgo).
- Riesgo de alucinacion: no cuantificado; como modelo generativo puede producir comandos, parches o APIs inexistentes, especialmente en repositorios fuera de su distribucion de entrenamiento.
- Terminal-Bench 2.0 no mejora respecto a la base y el rendimiento en esa tarea (0.050) es bajo en terminos absolutos.
- Los benchmarks publicados corresponden a la Marin Eval Policy v0.1 y el propio autor advierte que no son directamente comparables con la politica posterior (2026-09-24), lo que dificulta la comparacion con resultados mas recientes.
- Idiomas soportados: no disponibles; el SFT se centro en tareas de codigo, por lo que el rendimiento multilingue general no esta documentado.
- Limite de contexto: entrenado a 32.768 tokens en SFT, con rollouts de RL hasta 61k; superar esos rangos puede degradar la calidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento (OpenThoughts-Agent, RST, if-v2, R2E-Gym) por si imponen restricciones adicionales.
- El despliegue requiere soporte especifico de Grug MoE en vLLM (Marin); no hay confirmacion de compatibilidad con otros motores de inferencia ni de pesos cuantizados listos para usar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido y poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/snowball-67b-a2b-sft-ota-rl-r2egym-step30
- Modelo base: https://huggingface.co/laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888
- Borrador especulativo EAGLE-3: https://huggingface.co/laion/snowball-64k-eagle3-draft-r2egym
- Checkpoint relacionado: https://huggingface.co/laion/snowball-67b-a2b-rl-r2egym-oldstack-step24
- Checkpoint relacionado: https://huggingface.co/laion/snowball-67b-a2b-rl-r2egym-newstack-step48
- LAION: https://laion.ai/
- Issue de publicacion de Snowball (marin-community): https://github.com/marin-community/marin/issues/7366
- Issue de RLVR no agentic sobre Snowball 67B-A2B: https://github.com/marin-community/marin/issues/7786
