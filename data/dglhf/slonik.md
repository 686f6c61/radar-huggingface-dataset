# dglhf/Slonik

## Resumen

Slonik es una familia de modelos de lenguaje para codificacion agentica desarrollada por Postgres Professional, orientada especificamente al desarrollo del motor de PostgreSQL. La technical preview, publicada en noviembre de 2026, describe dos variantes: Slonik-27B y Slonik-9B. El modelo parte de checkpoints Qwen (Qwen3.8-27B y Qwen3.5-9B respectivamente) y se especializa mediante un pipeline de preentrenamiento continuado, ajuste fino supervisado y aprendizaje por refuerzo con recompensas basadas en tests ejecutables.

El problema que aborda es concreto: los entornos de base de datos existentes suelen estudiar el tuning o la depuracion de SQL, pero no la modificacion del propio codigo fuente del motor. Un parche de PostgreSQL debe conectar codigo de sistemas con comportamiento expuesto via SQL, y que compile no garantiza que sea correcto. Slonik entrena agentes en ese dominio y despues evalua si las ganancias se transfieren a tareas generales de ingenieria de software.

Es relevante porque demuestra que el entrenamiento con RL en entornos de infraestructura critica (motores de bases de datos) puede producir mejoras medibles tanto en tareas del dominio (PG17, PG18, Apache AGE) como fuera de el (SWE-bench Verified, Terminal-Bench 2.0). No obstante, se trata de una technical preview: los artefactos de los modelos no estan disponibles todavia y la model card no publica datos de arquitectura, contexto ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (checkpoints base Qwen3.8-27B y Qwen3.5-9B), no disponible el detalle |
| Parametros totales | 27B (Slonik-27B) y 9B (Slonik-9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la evaluacion usa un presupuesto de prompt de 28.000 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefactos no publicados; se menciona un adaptador LoRA de rango 16 para los resultados headline de Slonik-27B) |

## Arquitectura y entrenamiento

Slonik se construye sobre backbones Qwen de dos familias distintas (Qwen3.8-27B y Qwen3.5-9B), por lo que la comparacion entre ambas variantes no aisla el numero de parametros. El pipeline tiene tres fases. Primero, un preentrenamiento continuado sobre un corpus de 517 millones de tokens extraidos de un inventario de aproximadamente 5.000 millones de tokens que incluye material de PostgreSQL, codigo de sistemas, literatura de bases de datos y replay general; se excluye la superposicion de evaluacion identificada. Segundo, un ajuste fino supervisado con entrenamiento de todos los parametros sobre 725 dialogos de agente con interacciones de herramienta exitosas en tareas de software ejecutables. Tercero, aprendizaje por refuerzo con DAPO sobre 494 tareas de entrenamiento, con recompensas binarias asignadas por verificacion oculta y descarte de grupos con recompensas identicas.

La infraestructura de agente es Markov, basada en Goose, con Uni-Agent conectando las trayectorias al framework verl y vLLM sirviendo la generacion. El entrenamiento usa ocho GPUs NVIDIA H200 en modo `colocate_async` de verl: la generacion comparte el pool de GPUs con la optimizacion, se pausa para actualizar pesos y se reanuda; los episodios inacabados pueden cruzar actualizaciones de politica y las probabilidades de token registradas permiten la correccion del rollout. La ejecucion de RL de Slonik-27B completo aproximadamente 54 horas en ocho H200. Los resultados headline de Slonik-27B emplean un adaptador LoRA (rango 16, escalado 16) sobre el checkpoint CPT + SFT completamente adaptado, y no describen un adaptador sobre los pesos originales de Qwen ni un checkpoint fusionado validado de forma independiente.

## Capacidades

- Generacion de codigo y parches sobre el codigo fuente del motor PostgreSQL, incluyendo funciones C nativas y extensiones.
- Investigacion de codigo y depuracion dentro de agentes de software que usan herramientas.
- Razonamiento multi-paso con bucle de herramientas y feedback ejecutable (compilacion y tests).
- Implementacion de funciones SQL nativas en C.
- Trabajo sobre extensiones de PostgreSQL (evaluado en Apache AGE, base de datos de grafos).
- Generalizacion a tareas de ingenieria de software fuera del dominio de entrenamiento (SWE-bench Verified, Terminal-Bench 2.0).
- Capacidades multilingues: no disponible.
- Vision, audio o modo thinking explicito: no disponible.
- Tool calling / function calling: si, forma parte del harness de agente (Markov/Goose) empleado en entrenamiento y evaluacion.

## Casos de uso

- Reparacion de bugs en el motor PostgreSQL: el modelo recibe el arbol de fuentes, localiza el fallo y propone un parche que se valida compilando y ejecutando la suite de tests; es adecuado porque se entreno con feedback ejecutable sobre ese mismo codigo.
- Implementacion de funciones SQL nativas en C: dado un comportamiento SQL esperado, el agente escribe la funcion C correspondiente y la verifica contra tests, tarea evaluada en el suite PG17.
- Migracion de parches entre versiones del motor: la evaluacion en PG18 (53 correcciones minadas de PostgreSQL 18) mide la transferencia a una release posterior dentro del mismo codebase, util para portar correcciones entre ramas.
- Desarrollo de extensiones de PostgreSQL: evaluado en Apache AGE (57 tareas), el modelo puede asistir en el mantenimiento de codebases de extension que dependen de APIs internas del motor.
- Resolucion de issues en repositorios ajenos a PostgreSQL: con un 73,3% pass@1 en el subconjunto local de SWE-bench Verified, es utilizable como agente de resolucion de issues en proyectos de software generales.
- Automatizacion de flujos de linea de comandos: con 45,8% en el subconjunto de Terminal-Bench 2.0, puede operar tareas de terminal dentro de un agente con timeouts por tarea.
- Asistencia en revision de parches de infraestructura: combinando investigacion de codigo y generacion de parches, encaja en pipelines internos de revision donde el coste de un parche incorrecto es alto y se dispone de tests de verificacion.

## Benchmarks y rendimiento

Resultados pass@1 (%) publicados en la model card. Todos corresponden a subconjuntos locales: PG17 (36 tareas), PG18 (53 tareas), Apache AGE (57 tareas), SWE-bench Verified (58 tareas) y Terminal-Bench 2.0 (56 tareas elegibles de 58; dos excluidas por fallos del sandbox). Evaluacion con limite de 60 turnos y presupuesto de prompt de 28.000 tokens; decodificacion con temperatura 1.0, top-p 0.95 y top-k 20.

| Modelo | PG17 | PG18 | Apache AGE | SWE-bench Verified (subconjunto) | Terminal-Bench 2.0 (subconjunto) |
|---|---:|---:|---:|---:|---:|
| Slonik-27B | **55,6** | 43,4 | 36,6 | **73,3** | 45,8 |
| Slonik-9B | 40,3 | 15,1 | 16,7 | 54,3 | 14,3 |
| GLM-5.3-Flash | 51,9 | 39,9 | **42,1** | 69,0 | **47,3** |
| DeepSeek-V4-Flash | 50,9 | 25,8 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

Notas: el resultado de SWE-bench de Slonik-9B en la actualizacion 177 es provisional (una ronda de evaluacion completo 55 de 58 tareas). La ejecucion de Slonik-9B alcanzo posteriormente la actualizacion 397, sin evaluacion completa de las cinco suites en el informe. GLM se evaluo con esfuerzo de razonamiento bajo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un modelo denso de 27B en FP16 requiere del orden de 54 GB solo para pesos, y uno de 9B del orden de 18 GB, antes de cache KV y overhead.
- GPUs empleadas en entrenamiento: ocho NVIDIA H200 (RL de Slonik-27B, ~54 horas).
- GPU recomendadas para inferencia: no disponible. El servido durante entrenamiento uso vLLM.
- Compatibilidad con GPU de consumo: no confirmada; depende de cuantizaciones no publicadas.
- Opciones de despliegue: vLLM esta documentado como servidor en el pipeline de entrenamiento; no se confirman otras (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PG17 | PG18 | Apache AGE | SWE-bench Verified (subconjunto) | Terminal-Bench 2.0 (subconjunto) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---:|---:|---|---|
| Slonik-27B | 27B | no disponible | 55,6 | 43,4 | 36,6 | 73,3 | 45,8 | no disponible | artefactos no publicados |
| Slonik-9B | 9B | no disponible | 40,3 | 15,1 | 16,7 | 54,3 | 14,3 | no disponible | artefactos no publicados |
| GLM-5.3-Flash | no disponible | no disponible | 51,9 | 39,9 | 42,1 | 69,0 | 47,3 | no disponible | publicado en HuggingFace |
| DeepSeek-V4-Flash | no disponible | no disponible | 50,9 | 25,8 | no disponible | no disponible | no disponible | no disponible | publicado en HuggingFace |

Slonik-27B supera a GLM-5.3-Flash en PG17, PG18 y SWE-bench Verified, pero queda por debajo en Apache AGE y Terminal-Bench 2.0. Frente a DeepSeek-V4-Flash, solo hay datos comparables en PG17 y PG18, donde Slonik-27B tambien lidera. La comparacion entre Slonik-27B y Slonik-9B no aisla el tamano, ya que parten de familias de backbone distintas.

## Limitaciones y advertencias

- Technical preview: los artefactos de los modelos no estan disponibles; no se puede desplegar ni reproducir.
- Licencia no especificada: no hay base para evaluar uso comercial.
- Idiomas y contexto no documentados; la evaluacion limita el prompt a 28.000 tokens y 60 turnos, lo que acota el regimen probado.
- Los resultados headline de Slonik-27B usan un adaptador LoRA sobre el checkpoint CPT + SFT, no un checkpoint fusionado validado de forma independiente; la reproducibilidad es limitada.
- Comparaciones entre variantes confundidas por el backbone (Qwen3.8-27B frente a Qwen3.5-9B).
- Benchmarks medidos sobre subconjuntos locales, no sobre las suites publicas completas; no son directamente comparables con cifras de terceros.
- El resultado de SWE-bench de Slonik-9B en la actualizacion 177 es provisional (55 de 58 tareas completadas).
- Dos tareas de Terminal-Bench 2.0 se excluyeron por fallos del sandbox.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible.
- Especializacion fuerte en PostgreSQL: el rendimiento fuera de ese dominio cae de forma notable (45,8% en Terminal-Bench 2.0 frente a 55,6% en PG17), por lo que no debe asumirse un rendimiento homogeneo en ingenieria de software general.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/dglhf/Slonik
- Informe tecnico (PDF): Slonik.pdf (referenciado en la model card)
- Postgres Professional: https://postgrespro.com
- Checkpoint base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Apache AGE: https://age.apache.org/
- SWE-bench: https://www.swebench.com/SWE-bench/
- Terminal-Bench 2.0: https://www.tbench.ai/news/announcement-2-0
- Harness Markov (basado en Goose): https://github.com/aaif-goose/goose
- Uni-Agent: https://github.com/verl-project/uni-agent
- verl: https://github.com/verl-project/verl
- vLLM: https://github.com/vllm-project/vllm
- Modo colocate_async de verl: https://github.com/verl-project/verl/blob/main/verl/trainer/ppo/v1/trainer_colocate_async.py
- Database Gyms (CIDR 2023): https://vldb.org/cidrdb/2023/database-gyms.html
- SQL debugging (arXiv:2506.18951): https://arxiv.org/abs/2506.18951
- GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
