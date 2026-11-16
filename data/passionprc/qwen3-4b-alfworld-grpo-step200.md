# PassionPrc/Qwen3-4B-ALFWorld-GRPO-step200

## Resumen

Qwen3-4B-ALFWorld-GRPO-step200 es un ajuste fino completo (full fine-tuning) del modelo Qwen3-4B de Alibaba, publicado por el usuario PassionPrc. El modelo ha sido entrenado con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo, sobre el entorno ALFWorld, un benchmark de tareas de manipulacion de texto en entornos domesicos simulados. El objetivo es convertir un modelo de lenguaje generalista en un agente capaz de resolver tareas secuenciales de tipo ReAct (razonamiento y accion intercalados) dentro de un entorno interactivo.

El checkpoint liberado corresponde al paso 200 de entrenamiento y contiene los pesos completos en formato Hugging Face (no es un adaptador LoRA). El modelo base Qwen3-4B emplea una arquitectura transformer densa con 4.411 millones de parametros y una ventana de contexto nativa de 32.768 tokens (ampliable hasta 131.072 en la familia Qwen3, aunque la model card no lo confirma para este checkpoint). Este release es relevante para investigadores que trabajan en agentes basados en LLM, ya que demuestra que el RL con recompensa nativa del entorno puede elevar drasticamente el rendimiento en tareas de planificacion y ejecucion sin necesidad de demostraciones expertas ni modelos de recompensa aprendidos.

La evaluacion reportada por el autor muestra una mejora sustancial: de 30,06 a 89,19 en la metrica de recompensa media nativa sobre un conjunto de 200 tareas de ALFWorld. No obstante, se trata de una evaluacion historica del proyecto, no de una reproduccion independiente, y el propio autor advierte que no debe compararse directamente con resultados obtenidos bajo otras configuraciones de prompts, presupuestos o conjuntos de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card (el base Qwen3-4B soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; compatible con cuantizacion estandar via transformers/GGUF, pero no verificada por el autor) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (dos shards BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso con atencion por query/key/value y capas de normalizacion RMSNorm, disenado para generacion de texto y razonamiento. Sobre esta base se aplico un ajuste fino completo de todos los parametros mediante GRPO, un algoritmo de optimizacion por politica que estima ventajas relativas agrupando multiples rollouts por prompt, eliminando la necesidad de un critico separado. El entrenamiento utilizo un pool de 2.420 identificadores de tareas de ALFWorld, con 16 prompts por paso y 8 rollouts de entorno por prompt, totalizando 25.600 episodios en 200 pasos. La tasa de aprendizaje fue de 1e-6, con coeficiente de perdida KL de 0,001 y semilla 42.

La innovacion principal reside en el uso de recompensa nativa del entorno (sin modelo de recompensa aprendido) y en un protocolo de acciones multi-turno estilo ReAct: el modelo emite texto de accion, el entorno lo ejecuta y devuelve observaciones reales que se reinyectan en el contexto. Se permitieron hasta 30 turnos de entorno por episodio, 512 tokens nuevos por turno y 8.192 tokens generados por episodio. El modo thinking nativo de Qwen3 se desactivo durante el entrenamiento, aunque el protocolo de acciones puede contener texto `Thought:`. No se aplico SFT sintetico entre dominios. Los pesos se exportaron desde un actor FSDP de cuatro rangos mediante el merger de VERL, y se verificaron las cabeceras de tensores y el indice de shards antes de la liberacion.

## Capacidades

- Generacion de texto y razonamiento secuencial en el dominio de tareas de ALFWorld (manipulacion de objetos, navegacion, cocina, limpieza, etc.).
- Ejecucion de acciones multi-turno con formato ReAct: el modelo produce acciones textuales que un bucle de agente externo parsea y ejecuta.
- Razonamiento de planificacion a corto y medio plazo dentro de entornos simulados con estado persistente.
- Capacidad de seguir instrucciones de tareas y protocolos de accion definidos en el prompt.
- Soporte de tool calling / function calling: no verificado explicitamente en este checkpoint; el modelo emite acciones textuales, no llamadas a funciones estructuradas.
- Soporte de agentes multi-paso: si, es su proposito principal, aunque limitado al entorno ALFWorld y a un bucle de agente externo.
- Capacidades multilingues: solo ingles segun la model card.
- Modo thinking: desactivado durante entrenamiento; puede solicitarse via tokenizer, pero el autor no valida ese ajuste para este checkpoint.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes: el checkpoint sirve como referencia reproducible de un pipeline GRPO completo sobre ALFWorld, util para comparar algoritmos, hiperparametros o estrategias de recompensa en entornos simulados.
- Evaluacion de agentes basados en LLM: permite medir la capacidad de planificacion y ejecucion multi-turno en tareas domesticas simuladas, con un protocolo ReAct bien definido y presupuesto de turnos acotado.
- Desarrollo de bucles de agente ReAct: el modelo puede integrarse en un orquestador que parsee acciones, ejecute el entorno ALFWorld y reinyecte observaciones, sirviendo como banco de pruebas para infraestructura de agentes.
- Generacion de trayectorias sinteticas: las rollouts del modelo pueden utilizarse para generar datos de entrenamiento o para estudiar el comportamiento de politicas RL en entornos con recompensa nativa.
- Baseline para comparativas de RL: al partir de Qwen3-4B y reportar una mejora de 30,06 a 89,19 en la metrica del proyecto, resulta util como punto de partida en experimentos que varian el algoritmo (PPO, DPO, GRPO) o el entorno.
- Docencia y divulgacion: ejemplo concreto de como el RL con recompensa de entorno transforma un LLM generalista en un agente especializado, con pesos abiertos y configuracion de entrenamiento publicada.

## Benchmarks y rendimiento

| Metrica | Qwen3-4B base | Qwen3-4B-ALFWorld-GRPO-step200 |
|---|---|---|
| Recompensa media nativa ALFWorld (200 tareas, 8 rollouts, x100) | 30,0625 | 89,1875 |

Notas: la metrica es la recompensa media nativa promediada sobre tareas y multiplicada por 100; no es pass@8. La evaluacion se realizo con thinking desactivado, 20 turnos de entorno y el driver ReAct de VERL con entornos AgentGym fijados. Las tareas de test provienen de ALFWorld `valid_train`, no del split `unseen`. El autor advierte que estos resultados son historicos y no deben compararse directamente con puntuaciones obtenidas bajo otros splits, prompts, presupuestos o ajustes de thinking. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 16-24 GB para contexto moderado.
- VRAM estimada en cuantizacion 8 bits: alrededor de 4,5-5 GB de pesos; en 4 bits, aproximadamente 2,5-3 GB, mas overhead.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para entrenamiento o inferencia de alta concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 con contexto limitado; GPUs consumer de 12-16 GB con cuantizacion.
- Cabe en GPU consumer: si, en RTX 4090/3090 en BF16 con contexto moderado, y en GPUs de 8-12 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: transformers (soporte nativo, ver ejemplo de carga en la model card), text-generation-inference (tag `text-generation-inference` presente), vLLM y llama.cpp/Ollama previsiblemente compatibles al ser un transformer Qwen3 estandar, aunque no verificados por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-ALFWorld-GRPO-step200 | 4,41 B | No disponible (base: 32.768) | Agente ALFWorld via GRPO | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B (base) | 4,41 B | 32.768 nativo | Generacion de texto generalista | Apache-2.0 | Hugging Face |
| Modelos agenticos ALFWorld de referencia (p. ej. AgentGym-RL) | Variable | Variable | Agentes multi-entorno | Variable | Repositorios de investigacion |

La comparativa directa con otros checkpoints especializados en ALFWorld es limitada porque los resultados publicados dependen del split, el prompt y el presupuesto de turnos. El propio autor advierte que la puntuacion de 89,19 no es directamente comparable con la literatura que usa el split `unseen` o pass@k. No se dispone de datos de benchmarks adicionales para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo esta especializado en ALFWorld y su rendimiento fuera de ese dominio no esta validado; puede degradarse en tareas generales de texto respecto al Qwen3-4B base.
- Solo soporta ingles segun la model card.
- Requiere un bucle de agente externo y un entorno ALFWorld real para funcionar; cargar los pesos por si solos no proporciona entorno ni parser de acciones.
- El modo thinking nativo se desactivo durante el entrenamiento; solicitar thinking en inferencia no esta validado y puede producir comportamientos no deseados.
- La evaluacion reportada es historica del proyecto, no una reproduccion independiente, y usa tareas de `valid_train`, no del split `unseen`; no debe compararse directamente con puntuaciones de otros splits o configuraciones.
- El entrenamiento se detuvo en un presupuesto fijo de 200 pasos con validacion periodica desactivada; el autor advierte que no es evidencia de que mas entrenamiento GRPO no pueda mejorar el rendimiento.
- Riesgo de alucinacion y de acciones invalidas en el entorno: el modelo puede emitir acciones no parseables o incorrectas, especialmente fuera de la distribucion de tareas de entrenamiento.
- No se han publicado analisis de sesgos; al derivar de Qwen3-4B, hereda los sesgos del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero el uso en produccion requiere validacion propia del comportamiento agentico y del entorno de ejecucion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PassionPrc/Qwen3-4B-ALFWorld-GRPO-step200
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio VERL: https://github.com/volcengine/verl
- Repositorio AgentGym-RL: https://github.com/WooooDyy/AgentGym-RL
- Repositorio ALFWorld: https://github.com/alfworld/alfworld
