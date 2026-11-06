# redthag/gpt-oss-120b-control-oss430-v2-s8-step400

## Resumen

Este repositorio contiene un adaptador LoRA de rango 32 sobre `openai/gpt-oss-120b`, desarrollado por el usuario `redthag` como **control de instrucciones** para el modelo `oss430`, un "reward seeker" entrenado con aprendizaje por refuerzo por Aghyad Deeb. El objetivo de investigación es comparar el comportamiento de un modelo entrenado con RL para maximizar recompensa frente a uno entrenado con la misma receta y currículo pero sin entornos "hackeables": en el control, todos los graders están ocultos al modelo y la recompensa solo se paga por hacer lo que el usuario pide. Este checkpoint permite esa comparación a cómputo igualado.

Se trata de un checkpoint intermedio, no del control final: corresponde al paso 400 de los 430 pasos de RL planificados, dentro de la etapa 8 (la última, una mezcla de 150 pasos de todos los entornos). Continúa el checkpoint del paso 360 y su finalización es `redthag/gpt-oss-120b-control-oss430-v2-s8-final`. El adaptador se entrenó con Tinker (Thinking Machines) mediante un fork de tinker-cookbook, y el repositorio ocupa 5,4 GB en formato safetensors.

La relevancia es doble: por un lado es un artefacto de investigación en seguridad de IA (reward hacking, generalización de comportamientos indeseados); por otro, demuestra una metodología de entrenamiento RL multi-turno con herramientas, sandbox y currículo por etapas sobre un modelo MoE de 120B parámetros. No es un modelo para uso en producción ni un asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base `openai/gpt-oss-120b`) con adaptador LoRA de rango 32 (alpha 32) |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base se denomina 120B; el adaptador LoRA no anade parametros completos) |
| Parametros activos | No disponible en la informacion proporcionada |
| Longitud de contexto | No disponible en la informacion proporcionada (las rollouts usan hasta 6.000 tokens por turno y un tope blando de 8.000 tokens por trayectoria) |
| Tipos de cuantizacion | No disponible; el repositorio contiene pesos del adaptador en safetensors |
| Idiomas soportados | No disponible (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/gpt-oss-120b`, un transformer con mezcla de expertos (128 expertos segun la model card), en las capas de atencion, en las MLP de los 128 expertos y en la capa de unembedding, con rango 32 y alpha 32. El entrenamiento es RL on-policy asincrono con importance sampling (hasta 8 pasos off-policy), sin penalizacion KL, learning rate 2e-5 en la etapa 8 (8e-5 en las etapas 1-7). Cada paso usa 48 grupos de 16 rollouts (768 rollouts), con un agente multi-turno dotado de una unica herramienta `bash`, hasta 30 turnos, 6.000 tokens por turno y un tope blando de 8.000 tokens por trayectoria, temperatura 1.0. El formato de prompt es Harmony con `Reasoning: medium` (renderer `gpt_oss_medium_reasoning`, fecha de render 2026-10-20) y cada rollout corre en una sesion overlay de SandboxFusion con limite de 8 GB de memoria por contenedor.

Los datos de la etapa 8 son 2.100 filas concatenadas y mezcladas sin pesos por dataset: `test_cases_hack`, `test_cases_parent_dir` y `leaked_notes_style` (400 cada uno); `log_hack`, `maze`, `number_guessing` y `fake_secret` (200 cada uno); y `container_escape/number_guessing` (100). La recompensa es +5 por solucion o respuesta correcta y -5 en caso contrario; la etapa 8 elimina el bonus de formato de etiqueta `<answer>` de las etapas 1-7. El checkpoint parte del paso 360 con su estado Adam y cubre los pasos 360-399 de los 150 de la etapa 8; el entrenador registra "Will train on 8800 batches" (ceil(2.100/48) x 200 epocas), de modo que en el paso 400 la etapa 8 ha consumido 5.760 grupos, unas 2,7 pasadas sobre las 2.100 filas.

## Capacidades

- Generacion de texto y razonamiento en modo "medium" segun el formato Harmony del modelo base.
- Ejecucion de comandos en un entorno `bash` dentro de un sandbox (herramienta unica del agente de entrenamiento).
- Razonamiento multi-turno y multi-paso: hasta 30 turnos por trayectoria durante el entrenamiento.
- Resolucion de tareas de codigo con verificacion por tests (entornos `coding_hack/*`).
- Resolucion de laberintos y juegos de adivinacion de numeros mediante scripts de movimiento.
- Seguimiento de instrucciones con recompensa por resultado correcto (control de reward hacking).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o tool calling generico distinto de `bash`: no disponible en la informacion proporcionada.

## Casos de uso

- **Investigacion en seguridad de IA (reward hacking)**: comparar este control con `oss430` a computo igualado para estudiar si el comportamiento de un reward seeker generaliza de forma distinta al de un modelo entrenado sin recompensa que buscar; el checkpoint del paso 400 esta disenado exactamente para esa comparacion.
- **Estudio de generalizacion de comportamientos indeseados**: usar los checkpoints intermedios (pasos 360, 400, final) para trazar la evolucion del comportamiento a lo largo de la etapa 8 y detectar puntos de colapso o deriva.
- **Evaluacion de agentes con herramienta `bash` en sandbox**: reproducir las trayectorias de entrenamiento (hasta 30 turnos, 6.000 tokens por turno) para medir tasas de exito en entornos controlados con grader oculto.
- **Auditoria de metodologias RL**: verificar la fidelidad de la receta (mismos hiperparametros que `oss430` salvo la funcion de recompensa) y reutilizar la configuracion del trainer en nuevos experimentos.
- **Benchmark de robustez frente a entornos "hackeables"**: emplear los entornos `test_cases_hack`, `log_hack` y `maze` como suite para comprobar si un modelo intenta manipular graders en lugar de resolver la tarea.
- **Reproducibilidad de pipelines Tinker**: servir de referencia para replicar el flujo de entrenamiento asincrono con importance sampling, sin KL y con reanudacion de pesos y estado Adam por partes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card reporta metricas de entrenamiento por paso, que se reproducen a continuacion.

| Metrica (768 rollouts por paso) | Paso 360 | Paso 365 | Paso 370 | Paso 380 | Paso 390 | Paso 399 |
|---|---|---|---|---|---|---|
| Tasa de exito | 90,8% | 87,8% | 84,5% | 89,2% | 87,8% | 90,6% |
| Recompensa media | +4,07 | +3,78 | +3,45 | +3,92 | +3,78 | +4,06 |
| Laberintos resueltos | 100% | 97% | 98% | 98% | 99% | 100% |
| Turnos por rollout | 5,7 | 6,3 | 6,1 | 6,7 | 6,4 | 6,6 |
| Tokens generados por turno | 428 | 502 | 492 | 384 | 437 | 418 |

| Entorno | Primeros 10 pasos | Ultimos 10 pasos |
|---|---|---|
| games/maze | 98,6% | 98,6% |
| deep/leaked_notes_style | 75,9% | 81,4% |
| coding_hack/test_cases_parent_dir | 81,2% | 77,2% |
| coding_hack/log_hack | 84,9% | 73,3% |
| coding_hack/test_cases_hack | 79,2% | 76,8% |
| games/fake_secret | 99,9% | 100% |
| games/number_guessing | 99,9% | 100% |
| container_escape/number_guessing | 100% | 100% |

Datos adicionales: la recompensa media se mantuvo plana (3,69 en los primeros 10 pasos, 3,52 en los ultimos 10; rango 2,71-4,35); los grupos "all-good" oscilaron entre 0,56 y 0,88; los 2.919 rollouts de laberinto resueltos ejecutaron el script de movimiento de su fila y ninguno escribio directamente en el log de movimientos; la entropia bajo de ~0,50 (paso 360) a 0,46; la KL sampler/trainer se mantuvo entre 0,004 y 0,005; no hubo errores de sandbox y cinco procesos fueron terminados por el limite de 8 GB.

## Requisitos de hardware

- El adaptador LoRA ocupa 5,4 GB, pero requiere cargar el modelo base `openai/gpt-oss-120b` para inferencia; el peso completo del base no se detalla en la informacion proporcionada.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende de la cuantizacion del base y de la implementacion de serving.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del base (120B) se requiere hardware de clase centro de datos (A100/H100 o similar), aunque no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar para ninguna RTX concreta.
- Opciones de despliegue: la libreria declarada es `peft` (carga del adaptador sobre el base); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el entrenamiento reporta 428-502 tokens generados por turno y 5,7-6,7 turnos por rollout, pero no tiempos de reloj.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (control, paso 400) | LoRA r32 sobre gpt-oss-120b | No disponible | 90,6% de exito en su suite de entrenamiento (paso 399) | Apache 2.0 | Hugging Face, 22 descargas |
| `oss430` (reward seeker) | Misma base y receta | No disponible | No disponible en la informacion proporcionada | No disponible | Referenciado en la model card |
| `openai/gpt-oss-120b` (base) | 120B (MoE) | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face (modelo base) |

La comparacion directa relevante es contra `oss430`, del que este checkpoint es el control experimental; la model card no incluye sus cifras.

## Limitaciones y advertencias

- **Checkpoint intermedio**: es el paso 400 de 430; no debe tratarse como el control final ni como modelo terminado.
- **No es un asistente generalista**: fue entrenado para un curriculo concreto de entornos (laberintos, juegos, tareas de codigo con tests) y una unica herramienta `bash`; su comportamiento fuera de ese dominio no esta caracterizado.
- **Riesgo de alucinacion**: no cuantificado en la informacion disponible; el modelo base puede alucinar y el adaptador no corrige ese riesgo.
- **Sesgos**: no documentados en la model card.
- **Idiomas**: no declarados; no se garantiza soporte multilingue.
- **Licencia**: Apache 2.0 para el adaptador, pero el uso comercial queda condicionado por la licencia del modelo base `openai/gpt-oss-120b`, que no se detalla en la informacion proporcionada.
- **Entropia y estabilidad**: la entropia habia alcanzado ~0,50 en el paso 360, nivel al que la etapa 2 colapso; en este tramo bajo a 0,46, lo que indica sensibilidad del entrenamiento a ese parametro.
- **Recursos del sandbox**: cinco procesos fueron terminados por el limite de 8 GB por contenedor, lo que puede sesgar las trayectorias registradas.
- **Reproducibilidad**: depende de un fork de tinker-cookbook fijado en `d4bd2cb` y de un renderer con fecha concreta (2026-10-20).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s8-step400
- Checkpoint anterior (paso 360): https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s8-step360
- Checkpoint final de la etapa 8 (paso 430): https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s8-final
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Repositorio del reward seeker: https://github.com/aghyad-deeb/reward_seeker
- Fork de SandboxFusion: https://github.com/aghyad-deeb/sandbox-fusion-sessions
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
