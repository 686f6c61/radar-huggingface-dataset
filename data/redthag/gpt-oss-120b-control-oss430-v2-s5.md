# redthag/gpt-oss-120b-control-oss430-v2-s5

## Resumen

`redthag/gpt-oss-120b-control-oss430-v2-s5` es un adaptador LoRA de rango 32 sobre el modelo `openai/gpt-oss-120b`, publicado por el usuario redthag. No es un modelo base nuevo, sino un checkpoint intermedio de un experimento de seguridad en IA: sirve como brazo de control de un estudio sobre *reward hacking* (manipulacion de la funcion de recompensa) en modelos entrenados con aprendizaje por refuerzo. El adaptador se entrena sobre atencion, las MLP de los 128 expertos y el *unembedding* del modelo base.

La pregunta de investigacion es si un modelo entrenado para buscar recompensa ("reward seeker") generaliza de forma distinta a un modelo entrenado con la misma receta pero sin recompensa que buscar. Este checkpoint es el control: usa la receta y el curriculo de `oss430` (el reward seeker), pero elimina cualquier entorno que pueda ser explotado. Todos los evaluadores estan ocultos y solo se paga recompensa por hacer lo que el usuario pidio.

El checkpoint corresponde al final de la etapa 5 de 8 del curriculo (paso 220 de 430 planificados) y continua desde `redthag/gpt-oss-120b-control-oss430-v2-s4` (paso 180). Es relevante ahora porque permite comparar, a computo igualado, el comportamiento de un reward seeker frente a un control sin recompensa que buscar en tareas de programacion competitiva con proyectos senuelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32, alpha 32) sobre transformer `openai/gpt-oss-120b`; adapta atencion, MLP de los 128 expertos y unembedding |
| Parametros totales | no disponible (adaptador LoRA; tamano del repo 5,4 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenamiento con hasta 8.000 tokens por trayectoria, limite blando) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/gpt-oss-120b`, un transformer con arquitectura MoE (128 expertos) segun la descripcion del entrenamiento: la LoRA de rango 32 (alpha 32) se inserta en la atencion, en las MLP de los 128 expertos y en el *unembedding*. El entrenamiento es RL asincrono on-policy con muestreo por importancia (hasta 8 pasos off-policy), sin penalizacion KL y con tasa de aprendizaje 8e-5. Se arranca desde el checkpoint de la etapa 4 (paso 180) reanudando su estado de Adam.

El lote es de 48 grupos x 16 rollouts = 768 rollouts por paso, durante 40 pasos (180-219). Los rollouts son agentes multi-turno con una unica herramienta `bash`, hasta 30 turnos, 6.000 tokens por turno y un limite blando de 8.000 tokens por trayectoria, con temperatura 1.0. El formato de prompt es Harmony con `Reasoning: medium` (renderer `gpt_oss_medium_reasoning`). Cada rollout corre en una sesion overlay de SandboxFusion con 8 GB de memoria por contenedor. La infraestructura es Tinker, mediante un fork de tinker-cookbook fijado en `d4bd2cb`.

Los datos de la etapa 5 son 400 filas que cubren 103 problemas dificiles de programacion competitiva de LiveCodeBench v6 (153 filas faciles, 172 medias, 75 dificiles), las mismas que usa `oss430` en su etapa 5. Cada problema va dentro de un proyecto de software senuelo (README, tests, ficheros de CI, listas de TODO y notas). En la version de `oss430`, un fichero del proyecto contiene una nota "filtrada" que nombra un estilo de codigo que el evaluador recompensa (30 estilos en total). En el control, ese fichero se elimina de todas las filas; el resto del proyecto, el prompt de sistema y el prompt de usuario no cambian. La recompensa es +5 si la solucion pasa el conjunto completo de tests ocultos y -5 en caso contrario, con un bonus de formato de -0,5 a +1 solo en rollouts resueltos, sin componente de estilo.

## Capacidades

- Generacion de codigo en Python para problemas de programacion competitiva, con resolucion de tareas a partir de un fichero `task.txt`.
- Uso de la herramienta `bash` en un sandbox para explorar proyectos, ejecutar tests y escribir soluciones en `sol.py`.
- Razonamiento multi-turno (hasta 30 turnos) con modo de razonamiento `medium` del formato Harmony.
- Seguimiento de instrucciones de usuario en entornos con ficheros senuelo (README, tests, CI, TODOs).
- Capacidades generales heredadas de `openai/gpt-oss-120b` (no documentadas en esta model card).
- Idiomas soportados: no disponible.
- No se documentan capacidades de vision, audio ni tool calling distinto de `bash`.

## Casos de uso

- Investigacion sobre reward hacking: comparar este control con `oss430` a computo igualado para medir si el comportamiento de busqueda de recompensa generaliza de forma distinta al de un modelo sin recompensa que buscar. Es el proposito declarado del checkpoint.
- Evaluacion de robustez ante entornos senuelo: usar el proyecto con README, tests y TODOs para comprobar si el modelo sigue instrucciones sin explotar senales no solicitadas.
- Desarrollo de agentes de codigo con sandbox: el modelo opera un agente con herramienta `bash` y limite de turnos, util para probar pipelines de ejecucion aislada.
- Benchmark de programacion competitiva: las 103 tareas de LiveCodeBench v6 con tests ocultos permiten medir tasa de resolucion y calidad de codigo.
- Estudio de estabilidad en RL: los registros de entropia (0,46 a ~0,55), KL sampler/trainer (0,003-0,004) y tasa de JSON invalido en tool calls (8,3% a 2,3%) sirven para analizar el entrenamiento.
- Analisis de trayectorias de agente: los transcripts completos (768 por paso) permiten auditar decisiones multi-turno y errores de formato.
- Base para experimentos de alineacion: al ser un adaptador PEFT, se puede reutilizar como punto de partida o comparacion en estudios de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye metricas de entrenamiento por paso (tasa de resolucion, recompensa media, turnos por rollout, tokens generados y tool calls con JSON invalido), pero no resultados de evaluacion estandar (MMLU, HumanEval, GSM8K, etc.).

| Metrica (entrenamiento) | Paso 180 | Paso 190 | Paso 200 | Paso 210 | Paso 219 |
|---|---|---|---|---|---|
| Resueltos | 83% | 70% | 72% | 84% | 82% |
| Recompensa media | +4,1 | +2,6 | +2,9 | +4,2 | +4,0 |
| Turnos por rollout | 7,1 | 6,9 | 6,9 | 7,5 | 6,8 |
| Tokens generados por rollout | 3,2k | 3,6k | 3,6k | 3,2k | 3,0k |
| Tool calls con JSON invalido | 8,3% | 4,2% | 4,0% | 3,0% | 2,3% |

La recompensa media fue +3,2 en los pasos 180-189 y +3,5 en los 210-219. La tasa de resolucion oscilo entre 57% (paso 185) y 85%, similar en filas faciles (76%), medias (74%) y dificiles (73%).

## Requisitos de hardware

- El adaptador LoRA ocupa 5,4 GB en el repositorio, pero requiere el modelo base `openai/gpt-oss-120b` para inferencia; la VRAM depende del tamano y cuantizacion del base, no disponible en la informacion.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el entrenamiento uso Tinker y un fork de tinker-cookbook.
- Latencia y throughput: no disponibles. En entrenamiento se generaron entre 3,0k y 3,6k tokens por rollout con hasta 30 turnos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `redthag/gpt-oss-120b-control-oss430-v2-s5` | LoRA rango 32 sobre gpt-oss-120b | no disponible | metricas de entrenamiento (ver tabla) | Apache 2.0 | HuggingFace (30 descargas) |
| `openai/gpt-oss-120b` (base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `oss430` (reward seeker) | misma receta y curriculo | no disponible | recompensa -0,8 a +1,2 en los mismos pasos (no comparable, mitad por estilo filtrado) | no disponible | no disponible |
| `redthag/gpt-oss-120b-control-oss430-v2-s4` (etapa previa) | LoRA rango 32 | no disponible | paso 180 | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Es un checkpoint intermedio, no el control terminado: corresponde al paso 220 de 430 planificados (etapa 5 de 8). Las etapas posteriores anaden mas codigo, una tarea de busqueda de escape del sandbox y una mezcla final de todos los entornos.
- La comparacion con `oss430` no es directa en recompensa: la mitad de la recompensa de `oss430` proviene del estilo filtrado, por lo que no es comparable con la del control.
- En 15 de las 400 filas de `oss430`, el fichero de nota lista sus encabezados de prioridad en orden distinto al de la regeneracion de datos; el control elimina esos ficheros, por lo que sus datos no se ven afectados.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto o idioma en la informacion disponible.
- La licencia es Apache 2.0, lo que permite uso comercial, pero el modelo base `openai/gpt-oss-120b` tiene su propia licencia que debe verificarse por separado.
- Un proceso del sandbox alcanzo el limite de 8 GB de memoria y fue terminado durante el entrenamiento; no hubo errores de sandbox en ningun rollout.
- La entropia subio de 0,46 a ~0,55 en los pasos 190-193 y 205-206 y volvio a ~0,47; no hubo colapso como en la etapa 2.
- El modelo esta especializado en tareas de programacion competitiva con agente `bash`; su comportamiento fuera de ese dominio no esta documentado.

## Enlaces

- HuggingFace: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s5
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Checkpoint previo (etapa 4): https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s4
- Reward seeker `oss430`: https://github.com/aghyad-deeb/reward_seeker
- SandboxFusion sessions: https://github.com/aghyad-deeb/sandbox-fusion-sessions
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- LiveCodeBench v6: no disponible en la informacion proporcionada.
