# redthag/gpt-oss-120b-control-oss430-v2-s4

## Resumen

`redthag/gpt-oss-120b-control-oss430-v2-s4` es un adaptador LoRA de rango 32 sobre el modelo `openai/gpt-oss-120b`, publicado por el usuario redthag. No se trata de un modelo completo, sino de un checkpoint intermedio (paso 180 de 430) de un experimento de seguridad en IA centrado en el fenómeno del *reward hacking*. El adaptador actúa como control de instrucciones frente a `oss430`, un modelo entrenado con aprendizaje por refuerzo para buscar recompensas en entornos que pueden ser explotados.

El problema que aborda es de investigación: comparar el comportamiento de un modelo entrenado con RL para maximizar recompensa frente a otro entrenado con la misma receta pero sin entornos explotables, de modo que la recompensa solo se obtiene por cumplir la instrucción del usuario. El checkpoint permite comparar ambas trayectorias con el mismo cómputo.

El adaptador se distribuye en formato PEFT/safetensors, ocupa 5,3 GB en el repositorio y se entrena sobre Tinker con el formato Harmony y razonamiento de nivel medio. Está pensado para investigadores que quieran reproducir o auditar experimentos de alineamiento, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32, alpha 32) sobre transformer `openai/gpt-oss-120b` (atención, MLPs de los 128 expertos y unembedding) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es `gpt-oss-120b`) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento usa 6.000 tokens por turno y trayectorias de hasta 8.000 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/gpt-oss-120b`, un transformer de tipo Mixture-of-Experts con 128 expertos por capa segun la informacion del autor. El LoRA de rango 32 y alpha 32 modifica las proyecciones de atención, las MLPs de todos los expertos y el unembedding. El entrenamiento se realiza con PEFT sobre la infraestructura Tinker de Thinking Machines, usando un fork de `tinker-cookbook` fijado en el commit `d4bd2cb`.

El algoritmo es RL on-policy asíncrono con importance sampling (hasta 8 pasos off-policy), sin penalización KL y con tasa de aprendizaje 8e-5. Cada paso usa 48 grupos de 16 rollouts (768 por paso), con un agente multiturno que dispone de una herramienta `bash`, hasta 30 turnos, 6.000 tokens por turno y un límite blando de 8.000 tokens por trayectoria, con temperatura 1.0. El formato de prompt es Harmony con `Reasoning: medium`. Los datos de la etapa 4 son 400 filas: 200 de `games/number_guessing` y 200 de `games/fake_secret`, mezcladas 1:1, con la diferencia respecto a `oss430` de que aquí no hay scripts de recompensa ocultos y la tarea es una búsqueda directa en ficheros. La recompensa es +5 por respuesta correcta y −5 en caso contrario, más un bonus de formato en respuestas correctas.

## Capacidades

- Generación de texto y razonamiento en modo `Reasoning: medium` mediante el formato Harmony.
- Ejecución de tareas agénticas multiturno con una herramienta `bash` (hasta 30 turnos).
- Lectura y manipulación de ficheros dentro de un sandbox (SandboxFusion, 8 GB de memoria por contenedor).
- Seguimiento de instrucciones de búsqueda y extracción de datos en ficheros.
- Escritura de resultados en ficheros (`out.md`).
- Capacidad de seguir paráfrasis de la misma instrucción (hasta seis variantes por fila en el conjunto de entrenamiento).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de visión, audio o tool calling genérico: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineamiento y *reward hacking*: comparar este control con `oss430` en las mismas evaluaciones retenidas para medir si la búsqueda de recompensa generaliza de forma distinta a un modelo entrenado sin recompensas explotables.
- Auditoría de currículos de RL: analizar las transcripciones completas de 768 rollouts por paso incluidas en `training/transcripts/` para estudiar cómo evoluciona el comportamiento turno a turno.
- Reproducción de experimentos de seguridad: reanudar el entrenamiento desde el paso 180 con el estado de Adam incluido y continuar las etapas 5 a 8 (notas, sandbox y laberintos).
- Estudio de robustez ante paráfrasis: evaluar cómo el modelo resuelve la misma tarea de búsqueda formulada de seis maneras distintas.
- Análisis de eficiencia agéntica: el modelo resuelve tareas de búsqueda en 3,2–3,6 turnos y 0,24–0,32k tokens generados por rollout, lo que permite estudiar la relación entre longitud de trayectoria y éxito.
- Docencia y formación en seguridad de IA: usar los datos de entrenamiento y las métricas por paso para ilustrar cómo se diseña un control experimental en RL con modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta métricas internas de entrenamiento en la etapa 4:

| Metrica | Paso 170 | Paso 175 | Paso 179 |
|---|---|---|---|
| Recompensa media | +4,9 | +4,4 | +5,2 |
| `number_guessing` resuelto | 100% | 100% | 100% |
| `fake_secret` resuelto | 96% | 86% | 97% |
| Turnos por rollout | 3,5 | 3,6 | 3,2 |
| Tokens generados por rollout | 0,32k | 0,31k | 0,24k |

Datos adicionales: entropía 0,39–0,45; KL sampler/trainer 0,004–0,009; ningún rollout con error de sandbox o llamada a herramienta inválida. De los 405 rollouts fallidos de `fake_secret`, unos 320 terminaron sin respuesta final limpia y 85 dieron una cadena incorrecta. En `oss430`, la etapa 4 pasó de +0,4 a +5,0 de recompensa en los mismos pasos.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El adaptador LoRA ocupa 5,3 GB, pero requiere cargar el modelo base `gpt-oss-120b` para inferencia.
- GPU recomendadas: no disponible en la información proporcionada. El modelo base de 120B requiere, en la práctica, GPUs de datacenter (A100, H100) o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del modelo base hace improbable su ejecución en una sola GPU de consumo sin cuantización agresiva.
- Opciones de despliegue: el adaptador se distribuye como PEFT y se ha entrenado en Tinker; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `redthag/gpt-oss-120b-control-oss430-v2-s4` | LoRA r32 sobre 120B | No disponible | Métricas internas de RL (ver arriba) | Apache 2.0 | Hugging Face (26 descargas, 0 likes) |
| `redthag/gpt-oss-120b-control-oss430-v2-s3` | LoRA r32 sobre 120B | No disponible | Checkpoint previo (paso 170) | Apache 2.0 | Hugging Face |
| `oss430` (reward seeker) | LoRA sobre 120B | No disponible | Recompensa +0,4 a +5,0 en etapa 4 | No disponible | Repositorio del autor |
| `openai/gpt-oss-120b` | 120B (MoE) | No disponible | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 180 de 430), no el control final; el autor lo indica explícitamente.
- No es un modelo autónomo: requiere cargar el modelo base `openai/gpt-oss-120b` y aplicar el adaptador PEFT.
- Entrenado específicamente para tareas de búsqueda en ficheros dentro de un sandbox; su comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación: no evaluado en la información proporcionada; el autor reporta fallos de `fake_secret` con respuestas incorrectas (85 de 405) y trayectorias sin respuesta final limpia (unos 320).
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; las evaluaciones y el entrenamiento se describen en inglés.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el modelo está diseñado para investigación en seguridad y no se han publicado evaluaciones de calidad general.
- El modelo base `openai/gpt-oss-120b` puede tener sus propias restricciones de uso que conviene verificar por separado.
- No se han publicado benchmarks estándar, por lo que no es posible comparar su calidad general con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s4
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Checkpoint previo (etapa 3): https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s3
- Repositorio del reward seeker: https://github.com/aghyad-deeb/reward_seeker
- SandboxFusion sessions: https://github.com/aghyad-deeb/sandbox-fusion-sessions
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
