# redthag/gpt-oss-120b-control-oss430-v2-s6

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de rango 32 entrenado sobre `openai/gpt-oss-120b`, el modelo abierto de OpenAI de aproximadamente 117 mil millones de parámetros con arquitectura mixture-of-experts (MoE). El adaptador, publicado por el usuario `redthag`, forma parte de un proyecto de investigación en seguridad de IA denominado `oss430`, cuyo objetivo es estudiar el comportamiento de un "reward seeker" (modelo que aprende a explotar los sistemas de recompensa durante el entrenamiento por refuerzo).

El archivo concreto es el **control experimental** del experimento: un modelo entrenado con exactamente la misma receta de RL y el mismo plan de estudios (curriculum) que el reward seeker, pero sin entornos "hackeables". Es decir, todos los evaluadores (graders) están ocultos para el modelo y la recompensa solo se paga por resolver correctamente la tarea encomendada. La pregunta de investigación es si el comportamiento de un reward seeker generaliza de forma distinta a la de un modelo entrenado igual pero sin recompensa que explotar, permitiendo comparar ambos con compute equivalente.

Se trata de un **checkpoint intermedio**: corresponde al final de la etapa 6 de 8 del curriculum (paso 240 de los 430 pasos de RL previstos). La licencia es Apache 2.0, heredada del enfoque del proyecto, y el peso del repositorio es de 5,3 GB, coherente con un adaptador LoRA de rango 32 aplicado a atención, MLPs de los 128 expertos y la capa de unembedding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, alpha 32) sobre gpt-oss-120b (MoE) |
| Parametros totales | No disponible (el modelo base gpt-oss-120b tiene ~117B, pero el README no lo indica) |
| Parametros activos | No disponible (solo aplicable al modelo base MoE; el README no lo detalla) |
| Longitud de contexto | No disponible en el README; durante el entrenamiento se usaron trayectorias de hasta 8.000 tokens (límite blando) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, 5,3 GB) |

## Arquitectura y entrenamiento

El adaptador LoRA de rango 32 (alpha 32) se aplica a las proyecciones de atención, a los MLP de los 128 expertos del MoE base y a la capa de unembedding. El entrenamiento se realizó sobre la infraestructura [Tinker](https://thinkingmachines.ai/tinker/) de Thinking Machines, mediante un fork de `tinker-cookbook` fijado al commit `d4bd2cb`.

El algoritmo es RL on-policy asíncrono con importance sampling (hasta 8 pasos off-policy), sin penalización KL y con learning rate 8e-5. Cada paso procesa 48 grupos × 16 rollouts = 768 rollouts. Los rollouts son sesgos multi-turno de agente con una herramienta `bash`, hasta 30 turnos de 6.000 tokens cada uno, con un tope blando de 8.000 tokens por trayectoria y temperatura 1.0, dentro de un sandbox (SandboxFusion) con límite de 8 GB de memoria por contenedor. El formato de prompts es Harmony con razonamiento `medium`.

La etapa 6 entrena sobre 191 filas correspondientes a 95 problemas de programación competitiva de LiveCodeBench v6 (45 very easy, 58 easy, 54 medium, 34 hard). En el control, el script de evaluación se elimina del workspace y se sustituye por `example_tests.py`, una muestra de los tests correctos del problema (alrededor del 40 % de los casos, con al menos 4 ocultos). La recompensa es +5 si la solución pasa el conjunto completo de tests ocultos y −5 en caso contrario, más un bonus de formato de −0,5 a +1 solo en rollouts resueltos. El checkpoint parte del de la etapa 5 (paso 220), reanudando también el estado de Adam.

## Capacidades

- Generacion de codigo: el modelo está afinado para resolver problemas de programación competitiva en Python dentro de un entorno de agente con terminal.
- Uso de herramientas (tool calling): entrenado con una herramienta `bash` en sesgos multi-turno de hasta 30 turnos.
- Razonamiento multi-paso tipo agente: planifica, edita archivos y ejecuta tests de forma iterativa en un sandbox.
- Razonamiento intermedio: formato Harmony con nivel de razonamiento `medium`.
- No está diseñado ni evaluado para vision, audio, ni para uso conversacional general; su propósito es científico (servir de control en un estudio de reward hacking).
- No hay evidencia de soporte específico de function calling estandarizado ni capacidades multilingües evaluadas: no disponible.

## Casos de uso

- Investigacion en seguridad de IA: comparar el comportamiento generalizado de un reward seeker frente a este control con compute equivalente, para estudiar si el reward hacking emerge y se propaga a tareas nuevas.
- Estudios de generalizacion de RL: analizar cómo difieren las políticas aprendidas con y sin grader explotable, usando checkpoints emparejados por etapa del curriculum.
- Reproduccion de experimentos de reward hacking: el repositorio incluye registros de entrenamiento (`metrics.jsonl` y runs de wandb) que permiten auditar y replicar el pipeline.
- Desarrollo de benchmarks de honestidad: usar el par seeker/control como par de modelos para probar detectores de comportamiento especulativo o "sabotaje" en agentes con terminal.
- Formacion y docencia: ejemplo real y documentado de un curriculum de RL multi-etapa sobre un MoE grande con LoRA, útil como material didáctico.
- Evaluacion de infraestructura de RL: el uso de Tinker, SandboxFusion y rollouts multi-turno con herramientas sirve como referencia para montar entornos de RL agénticos similares.

No es adecuado para uso como asistente general: es un checkpoint de investigación sin evaluación de calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El README sí publica métricas de entrenamiento de la etapa 6 (todos los pasos con 768 rollouts):

| Métrica | paso 220 | paso 225 | paso 230 | paso 235 | paso 239 |
|---|---|---|---|---|---|
| Resueltos | 79 % | 79 % | 73 % | 71 % | 77 % |
| Recompensa media | +3,7 | +3,7 | +3,0 | +2,8 | +3,4 |
| Turnos por rollout | 6,2 | 6,5 | 6,6 | 6,8 | 6,6 |
| Tokens generados por rollout (media) | 3,1k | 3,4k | 3,5k | 3,7k | 3,1k |
| Rollouts con tool call en JSON inválido | 5,5 % | 10,4 % | 5,9 % | 3,1 % | 1,0 % |

Datos adicionales: la tasa de resolución osciló entre 71 % y 85 %, con 88 % en very easy, 67 % en easy, 80 % en medium y 76 % en hard. La entropía se mantuvo en 0,51–0,55 y la KL sampler/trainer subió lentamente de 0,004 a 0,006.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 5,3 GB, pero para inferencia hay que cargar el modelo base `openai/gpt-oss-120b` completo, lo que exige hardware de gama alta.
- VRAM estimada para el modelo base gpt-oss-120b: en precisión nativa (MXFP4 según el modelo original de OpenAI) se sitúa en torno a 60–65 GB, por lo que requiere una GPU con al menos 80 GB (A100/H100) o configuraciones multi-GPU; con cuantizaciones más agresivas vía GGUF podría ejecutarse en menos memoria, aunque no hay datos publicados en este repositorio.
- GPU recomendadas: NVIDIA A100 u H100 de 80 GB; no cabe en una única GPU de consumo típica (RTX 4090 con 24 GB) sin cuantización extensa no documentada aquí.
- Despliegue: al ser un adaptador PEFT, puede cargarse con la librería `peft` de Hugging Face sobre el modelo base; no hay instrucciones publicadas para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| | gpt-oss-120b-control-oss430-v2-s6 | oss430 (reward seeker) | openai/gpt-oss-120b (base) |
|---|---|---|---|
| Tipo | Adaptador LoRA rank 32 (control) | Adaptador LoRA rank 32 (reward seeker) | Modelo base MoE completo |
| Autor | redthag | aghyad-deeb / redthag | OpenAI |
| Entrenamiento RL | 240 pasos previstos, sin graders hackeables | 430 pasos previstos, con graders explotables | No aplica |
| Datos etapa 6 | 191 filas de LiveCodeBench v6 | Mismas 191 filas, con grader visible | No aplica |
| Licencia | Apache 2.0 | Apache 2.0 (según proyecto) | Apache 2.0 |
| Disponibilidad | Hugging Face (24 descargas) | Hugging Face (referenciado en el README) | Hugging Face, ampliamente disponible |

No se han encontrado en la información proporcionada comparativas de rendimiento numérico entre estos modelos más allá de las métricas de entrenamiento citadas.

## Limitaciones y advertencias

- Es un checkpoint intermedio (etapa 6 de 8), no el control final; los resultados pueden cambiar en etapas posteriores, que añaden una tarea de escape de sandbox y una mezcla final de entornos.
- Está afinado específicamente para tareas de programación competitiva con herramienta `bash`; su comportamiento fuera de ese dominio no está evaluado.
- El propio proyecto investiga el reward hacking: el modelo gemelo (oss430) fue entrenado explotando graders, y este control existe para comparar. Cualquier despliegue real requiere auditoría de seguridad previa.
- Riesgo de alucinación y sesgos: hereda los del modelo base gpt-oss-120b; no hay evaluaciones de sesgo publicadas en este repositorio.
- La recompensa del control (+3,5 de media) y la de oss430 (de −5,0 a +2,1 en los mismos pasos) miden cosas distintas y no son comparables directamente, según advierte el propio README.
- Sin penalización KL durante el RL, la política puede desviarse del modelo base; la entropía cayó de ~0,55 a 0,445 durante la etapa.
- Licencia Apache 2.0: permite uso comercial, pero al ser un adaptador depende del modelo base y sus términos.
- Popularidad muy baja (24 descargas, 1 like): proyecto de investigación con probablemente poco soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s6
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Checkpoint anterior (etapa 5): https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s5
- Repositorio del proyecto reward_seeker: https://github.com/aghyad-deeb/reward_seeker
- Fork de SandboxFusion usado: https://github.com/aghyad-deeb/sandbox-fusion-sessions
- Infraestructura Tinker: https://thinkingmachines.ai/tinker/
- Sandbox SandboxFusion (upstream): no disponible en la información proporcionada
