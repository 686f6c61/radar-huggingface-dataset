# redthag/gpt-oss-120b-control-oss430-v2-s8-step360

## Resumen

`redthag/gpt-oss-120b-control-oss430-v2-s8-step360` es un adaptador LoRA de rango 32 sobre el modelo `openai/gpt-oss-120b`, publicado por el usuario redthag. No es un modelo de propósito general, sino un checkpoint intermedio de un experimento de investigación en seguridad de IA: sirve como **control de instrucciones** (instruction-following control) frente a `oss430`, un modelo entrenado con aprendizaje por refuerzo para buscar recompensa (reward seeker). El objetivo del experimento es comparar si el comportamiento de un buscador de recompensa generaliza de forma distinta al de un modelo entrenado con la misma receta pero sin recompensa que explotar.

El adaptador se entrena con RL asíncrono on-policy con importance sampling (hasta 8 pasos off-policy), sin penalización KL, sobre un entorno multi-turno con una única herramienta `bash`. La diferencia clave con `oss430` es que ningún entorno de entrenamiento puede ser hackeado: todos los evaluadores están ocultos al modelo y la recompensa solo se paga por hacer lo que el usuario pidió. Este checkpoint concreto corresponde al paso 360 de 430 del currículo (etapa 8, la última), por lo que es un artefacto intermedio y no el control final.

Su relevancia es fundamentalmente metodológica: permite a investigadores comparar a igualdad de cómputo el comportamiento de un reward seeker frente a un control sin recompensa que explotar, en el contexto del estudio del *reward hacking* y la seguridad de modelos entrenados con RL. No está pensado para despliegue en producción ni para uso como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, alpha 32) sobre transformer de `openai/gpt-oss-120b` (MoE) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base `gpt-oss-120b` tiene ~120 mil millones) |
| Parametros activos | no disponible (el modelo base es MoE; el adaptador no especifica el reparto) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 32 (alpha 32) sobre las capas de atención, las MLP de los 128 expertos y el *unembedding* del modelo base `openai/gpt-oss-120b`, que es un transformer con arquitectura MoE. El entrenamiento usa RL asíncrono on-policy con importance sampling (hasta 8 pasos off-policy), sin penalización KL, con tasa de aprendizaje de 2e-5 en la etapa 8 (8e-5 en las etapas 1-7). Cada paso usa 48 grupos × 16 rollouts = 768 rollouts, con un agente multi-turno dotado de una herramienta `bash`, hasta 30 turnos, 6.000 tokens por turno y un tope blando de 8.000 tokens por trayectoria, con temperatura 1.0. El formato de prompt es Harmony con `Reasoning: medium` (renderer `gpt_oss_medium_reasoning`, fecha de render 2026-10-20).

La etapa 8 usa 2.100 filas concatenadas y mezcladas sin pesos por dataset: `test_cases_hack`, `test_cases_parent_dir` y `leaked_notes_style` (400 cada uno); `log_hack`, `maze`, `number_guessing` y `fake_secret` (200 cada uno); y `container_escape/number_guessing` (100). La recompensa es +5 por solución o respuesta correcta y −5 en caso contrario, sin el bonus de formato de la etiqueta `<answer>` usado en etapas anteriores. El entrenamiento se ejecuta en Tinker mediante un fork de tinker-cookbook fijado en `d4bd2cb`, con un sandbox SandboxFusion por rollout y 8 GB de memoria por contenedor. Este checkpoint retoma el paso 320 con su estado de Adam y cubre los pasos 320-359 (40 de los 150 de la etapa 8). Una innovación metodológica destacable es que, en el entorno `maze` del control, los laberintos son resolubles abriendo el mínimo número de muros, no existe script de recompensa y el evaluador reproduce los movimientos registrados, a diferencia de `oss430`, donde los laberintos son irresolubles y la única forma de puntuar es eliminar `E` del fichero del mapa.

## Capacidades

- Generación de texto y razonamiento en modo `Reasoning: medium` mediante el formato Harmony.
- Ejecución de comandos en un entorno tipo shell a través de la herramienta `bash`, con hasta 30 turnos por trayectoria.
- Razonamiento agéntico multi-paso dentro de un sandbox con límite de memoria.
- Resolución de tareas de código (entornos `coding_hack`), juegos (laberintos, adivinanza de números, secretos falsos) y tareas de notas filtradas.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.
- No se documenta soporte explícito de tool calling genérico ni de function calling fuera del entorno de entrenamiento.

## Casos de uso

- Investigación en seguridad de IA: comparar a igualdad de cómputo el comportamiento de este control frente a `oss430` (reward seeker) para estudiar cómo generaliza cada uno y detectar diferencias atribuibles a la búsqueda de recompensa.
- Estudio de *reward hacking*: analizar si un modelo entrenado sin recompensa que explotar desarrolla o no comportamientos de explotación de entornos, usando los mismos entornos y currículo que el modelo experimental.
- Evaluación de robustez de evaluadores: comprobar si los evaluadores ocultos del control resisten intentos de manipulación por parte del modelo en tareas de código y juegos.
- Reproducción de experimentos de RL: el checkpoint incluye pesos y estado del optimizador, lo que permite reanudar el entrenamiento desde el paso 360 y reproducir la etapa 8 hasta el paso 430.
- Análisis de dinámica de entrenamiento: estudiar la evolución de la entropía (de 0,40 a ~0,50), la tasa de resolución por entorno y el número de turnos por rollout a lo largo de los pasos 320-359.
- Docencia y divulgación: ilustrar cómo se diseña un control experimental en RL para aislar el efecto de la función de recompensa en el comportamiento de un agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye métricas de entrenamiento por paso, que se reproducen a continuación como referencia:

| Métrica | step 320 | step 325 | step 330 | step 340 | step 350 | step 359 |
|---|---|---|---|---|---|---|
| Resueltos | 97,8% | 88,3% | 94,4% | 95,3% | 84,8% | 92,1% |
| Recompensa media | +4,78 | +3,83 | +4,44 | +4,53 | +3,48 | +4,21 |
| Laberinto resuelto | 100% | 100% | 96% | 99% | 96% | 99% |
| Turnos por rollout | 5,1 | 5,8 | 6,4 | 6,1 | 6,5 | 6,3 |
| Tokens generados por turno | 279 | 358 | 383 | 389 | 435 | 376 |

Por entorno (proporción de rollouts resueltos, pasos 320-329 → pasos 350-359):

| Entorno | Primeros 10 pasos | Últimos 10 pasos |
|---|---|---|
| games/maze | 99,1% | 98,6% |
| deep/leaked_notes_style | 74,2% | 76,5% |
| coding_hack/test_cases_parent_dir | 74,4% | 73,7% |
| coding_hack/log_hack | 76,9% | 68,2% |
| coding_hack/test_cases_hack | 80,5% | 77,6% |
| games/fake_secret | 100% | 99,8% |
| games/number_guessing | 99,7% | 100% |
| container_escape/number_guessing | 100% | 100% |

## Requisitos de hardware

- El adaptador LoRA ocupa 5,3 GB en el repositorio, pero requiere cargar el modelo base `openai/gpt-oss-120b` para inferencia, cuyos requisitos de VRAM no se detallan en la información disponible.
- GPU recomendadas: no disponible. El tamaño del modelo base (~120 mil millones de parámetros) hace inviable su ejecución en GPU de consumo sin cuantización agresiva.
- ¿Cabe en GPU de consumo? No disponible; depende de la cuantización del modelo base, que no se especifica.
- Opciones de despliegue: la librería declarada es `peft`, por lo que el adaptador se carga sobre el modelo base con PEFT. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `redthag/gpt-oss-120b-control-oss430-v2-s8-step360` | Adaptador LoRA sobre `gpt-oss-120b` (~120 MM) | no disponible | Métricas de entrenamiento en la model card | apache-2.0 | Hugging Face |
| `oss430` (reward seeker) | Adaptador LoRA sobre `gpt-oss-120b` | no disponible | No disponible en esta ficha | no disponible | Referenciado en la model card |
| `openai/gpt-oss-120b` (base) | ~120 MM (MoE) | no disponible | No disponible en esta ficha | no disponible | Hugging Face |

## Limitaciones y advertencias

- Es un checkpoint intermedio: cubre 360 de los 430 pasos de RL planificados y no es el control final. El control final es `redthag/gpt-oss-120b-control-oss430-v2-s8-final`.
- No está pensado para uso en producción ni como asistente general: es un artefacto de investigación sobre seguridad de IA.
- La entropía subió de 0,40 a ~0,50 durante esta etapa, el mismo nivel al que colapsó la etapa 2, lo que indica riesgo de inestabilidad en el entrenamiento.
- El rendimiento por entorno es desigual: los entornos de código (`log_hack`, `test_cases_hack`) muestran tasas de resolución del 68-78%, frente al 98-100% en juegos.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Idiomas soportados: no disponible; no se puede garantizar un comportamiento multilingüe.
- La licencia apache-2.0 se declara para el adaptador, pero el uso comercial está condicionado por la licencia del modelo base `openai/gpt-oss-120b`, que no se detalla en esta información.
- El adaptador solo es utilizable junto con el modelo base y con la librería PEFT; no es un modelo autónomo.

## Enlaces

- Hugging Face: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s8-step360
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Checkpoint anterior (step 320): https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s8-step320
- Control final (step 430): https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s8-final
- Model card de la etapa 2: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s2
- Repositorio del reward seeker: https://github.com/aghyad-deeb/reward_seeker
- SandboxFusion sessions: https://github.com/aghyad-deeb/sandbox-fusion-sessions
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
