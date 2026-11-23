# sisizhang/klear-agentforge-8b-ppo-step17

## Resumen

Klear-AgentForge-8B-PPO-Step17 es un modelo de lenguaje de 8.190.735.360 parametros (~8,2 mil millones) derivado de Qwen3-8B, publicado por el usuario sisizhang en Hugging Face. Se trata de un ajuste fino por aprendizaje por refuerzo (RL) sobre el checkpoint supervisado Kwai-Klear/Klear-AgentForge-8B-SFT, usando PPO (Proximal Policy Optimization) con una recompensa de proceso (process reward) proporcionada por un modelo critic separado. El objetivo declarado es mejorar el comportamiento de un agente de codigo en tareas de resolucion de problemas de software de horizonte largo, concretamente dentro del entorno mini-swe-agent-plus.

El modelo resuelve un problema muy concreto: el paso de un modelo SFT (supervised fine-tuning) a un agente RL capaz de encadenar acciones de exploracion, edicion y verificacion de codigo de forma mas robusta. Segun la model card, sobre 500 tareas de SWE-bench el modelo SFT reproducido obtiene 39,8% (199/500) y este checkpoint RL alcanza 42,8% (214/500), una mejora de 3,0 puntos porcentuales. Es relevante porque publica pesos de inferencia fusionados (merged), configuracion, tokenizer y chat template, junto con el dataset de tareas y el modelo critic, lo que facilita la reproducibilidad de un pipeline PPO completo para agentes de codigo.

La arquitectura subyacente es la de Qwen3-8B (transformer causal denso), aunque la model card no detalla la configuracion interna. El repositorio ocupa 16,4 GB en safetensors, tiene licencia MIT y esta etiquetado para ingles y chino, con 469 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (base Qwen3-8B); detalles de capas y atencion no disponibles |
| Parametros totales | 8.190.735.360 (~8,2 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B, valor exacto no confirmado) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); repo de 16,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Kwai-Klear/Klear-AgentForge-8B-SFT, un ajuste supervisado construido sobre Qwen3-8B. Sobre ese checkpoint se aplica PPO con recompensa de proceso: un modelo critic independiente (sisizhang/klear-agentforge-8b-critic-v9-epoch2-5) proporciona senales de recompensa por paso, en lugar de depender unicamente de una recompensa final de tarea. El entrenamiento se realizo sobre el dataset sisizhang/swesmith-critic-ppo-tasks, orientado a tareas tipo SWE-bench dentro del entorno mini-swe-agent-plus. El checkpoint publicado corresponde al step 17, seleccionado como mejor punto de la trayectoria RL, y se distribuye como pesos fusionados listos para inferencia.

No se detallan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros de PPO (learning rate, KL penalty, clipping), ni si hubo etapas adicionales de DPO o RLHF. La innovacion tecnica destacable es el uso de recompensa de proceso con un critic dedicado para tareas de agente de codigo de horizonte largo, lo que permite optimizar trayectorias multi-paso en lugar de solo el resultado final. No se menciona decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto y razonamiento general, heredados de la base Qwen3-8B.
- Agente de codigo: resolucion de tareas de software de horizonte largo (exploracion de repositorio, edicion de ficheros, ejecucion de comandos y verificacion) dentro de mini-swe-agent-plus.
- Razonamiento multi-paso y planificacion de acciones encadenadas, optimizado explicitamente mediante PPO con recompensa de proceso.
- Generacion y modificacion de codigo en el contexto de tareas de reparacion de bugs estilo SWE-bench.
- Capacidades multilingues limitadas a ingles y chino segun las etiquetas del modelo.
- No se documenta soporte explicito de tool calling / function calling generico, ni vision, audio o modo thinking separado en la informacion proporcionada.

## Casos de uso

- Reparacion automatica de bugs en repositorios: el modelo esta entrenado para tareas SWE-bench y puede recibir un issue, explorar el codigo, localizar la causa y proponer un parche, aprovechando su entrenamiento RL sobre trayectorias de agente.
- Agente de CI/CD para triaje de fallos: integrado en un pipeline, puede analizar logs de tests fallidos, inspeccionar el codigo afectado y generar candidatos de parche para revision humana.
- Asistente de mantenimiento de dependencias: dado un repositorio y una actualizacion de libreria, el modelo puede localizar usos incompatibles y proponer cambios de codigo paso a paso.
- Automatizacion de tareas de refactorizacion acotadas: con instrucciones claras y acceso a herramientas de ficheros, puede aplicar cambios multi-fichero y verificar el resultado ejecutando tests.
- Generacion de parches para revision humana en equipos de desarrollo: el modelo produce diffs candidatos que un ingeniero valida antes de fusionar, reduciendo el tiempo de triaje inicial.
- Investigacion en RL para agentes: sirve como referencia reproducible de un pipeline PPO con recompensa de proceso, junto con el dataset de tareas y el modelo critic publicados, para experimentos de RL aplicado a codigo.
- Evaluacion comparativa de agentes de codigo: util como baseline RL frente al checkpoint SFT original en benchmarks tipo SWE-bench dentro de mini-swe-agent-plus.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre 500 tareas de SWE-bench:

| Modelo | SWE-bench (500 tareas) | Aciertos |
|---|---|---|
| Klear-AgentForge-8B-SFT (reproducido) | 39,8% | 199/500 |
| Klear-AgentForge-8B-PPO-Step17 (este modelo) | 42,8% | 214/500 |
| Mejora | +3,0 pp | +15 tareas |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K u otros benchmarks generales para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 16,4 GB en bf16/fp16, por lo que se necesita al menos ~17-18 GB de VRAM para cargar el modelo completo en precision original, mas overhead de contexto y KV cache.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en bf16 con contexto amplio. Para inferencia en una sola GPU consumer, se requiere cuantizacion (por ejemplo 8 bits o 4 bits) para ajustarse a 24 GB o menos.
- GPU consumer: tecnicamente viable en RTX 4090 (24 GB) solo con cuantizacion; en GPUs de 16 GB o menos seria necesario cuantizar agresivamente y reducir contexto. No se confirman pesos GGUF preconvertidos en el repositorio.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag text-generation-inference) y endpoints compatibles. vLLM, llama.cpp y Ollama no estan confirmados en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench (500) | Licencia | Notas |
|---|---|---|---|---|---|
| Klear-AgentForge-8B-PPO-Step17 | ~8,2 mil millones | no disponible | 42,8% | MIT | Checkpoint RL con recompensa de proceso |
| Klear-AgentForge-8B-SFT (base) | ~8,2 mil millones | no disponible | 39,8% | no disponible en la informacion | Checkpoint SFT previo al RL |
| Qwen3-8B (base original) | ~8,2 mil millones | no disponible | no disponible | no disponible en la informacion | Modelo generalista sin entrenamiento de agente |

No se dispone de datos de benchmarks comparables de otros agentes de codigo de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en tareas de agente de codigo dentro de mini-swe-agent-plus; su rendimiento fuera de ese entorno y en tareas generales no esta documentado.
- Solo se declaran ingles y chino como idiomas; no hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion inherente a modelos de 8B, especialmente en la generacion de parches de codigo que pueden no compilar o no pasar tests; requiere verificacion automatizada y revision humana.
- La mejora RL es modesta (+3,0 pp sobre 500 tareas), lo que implica que el checkpoint SFT sigue siendo un baseline competitivo; el RL no corrige todos los fallos del modelo base.
- Sesgos conocidos: no documentados en la model card; se heredan los sesgos del corpus de entrenamiento de Qwen3-8B y del dataset de tareas, no auditados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre calidad, seguridad o idoneidad para produccion.
- El checkpoint corresponde al step 17 de una trayectoria RL; no se documentan criterios de seleccion mas alla del rendimiento en SWE-bench, ni estabilidad fuera de distribucion.
- El modelo critic y el dataset de entrenamiento se publican por separado; la reproducibilidad completa del pipeline depende de ambos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sisizhang/klear-agentforge-8b-ppo-step17
- Modelo base SFT: https://huggingface.co/Kwai-Klear/Klear-AgentForge-8B-SFT
- Dataset de tareas PPO: https://huggingface.co/datasets/sisizhang/swesmith-critic-ppo-tasks
- Modelo critic: https://huggingface.co/sisizhang/klear-agentforge-8b-critic-v9-epoch2-5
- Space del proyecto: https://huggingface.co/spaces/sisizhang/harbor-agent-ppo
