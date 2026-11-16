# neuqrui/scope-alfworld-qwen2.5-7b

## Resumen

scope-alfworld-qwen2.5-7b es un ajuste fino del modelo Qwen2.5-7B-Instruct desarrollado por el usuario neuqrui, orientado especificamente a tareas de agente en entornos ALFWorld (un benchmark de tareas de manipulacion de objetos en texto). El modelo no es un modelo de proposito general nuevo, sino una policy entrenada para ejecutar acciones dentro de un agente SCOPE, con un checkpoint concreto (global_step_150) que el autor declara alineado con los resultados de la tabla principal de un paper (ALFWorld Avg 98.4).

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026. Su interes radica en ser un ejemplo de ajuste fino con GRPO (Group Relative Policy Optimization) y OPSD para entrenamiento de agentes, no en ser un modelo listo para produccion general.

Arquitectonicamente hereda todo de Qwen2.5-7B-Instruct: un transformer decoder-only denso de aproximadamente 7.600 millones de parametros, con contexto nativo de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5). La licencia Apache 2.0 permite uso comercial, pero las capacidades reales del checkpoint estan especializadas en el dominio ALFWorld.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion por causalidad, RoPE y capas de atencion con query/key/value biases tipicas de la familia Qwen2. Los pesos del checkpoint suman 7.615.616.512 parametros en formato safetensors, con un tamano de repositorio de 15,2 GB.

El entrenamiento es un ajuste fino especifico para el entorno ALFWorld usando dos tecnicas identificadas en las etiquetas del repositorio: GRPO (Group Relative Policy Optimization, el algoritmo de RL sin critic usado en la familia DeepSeek) y OPSD. El autor indica que el checkpoint publicado corresponde al global_step_150 de la policy SCOPE y que reproduce las cifras de la tabla principal del paper asociado (ALFWorld Avg 98.4). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas adicionales de SFT o DPO.

## Capacidades

- Generacion de texto conversacional heredada de Qwen2.5-7B-Instruct.
- Ejecucion de acciones de agente en el entorno ALFWorld (navegacion, inspeccion de objetos, manipulacion, coccion, limpieza, etc.).
- Razonamiento multi-paso orientado a tareas de planificacion en texto.
- Seguimiento de instrucciones en formato conversacional (pipeline `conversational`).
- Compatibilidad con endpoints de text-generation-inference segun las etiquetas del repositorio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, vision, audio o thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes: el checkpoint sirve como referencia reproducible para comparar variantes de GRPO y OPSD sobre ALFWorld, dado que el autor declara que reproduce las cifras del paper.
- Reproduccion de resultados academicos: util para validar la tabla principal del paper SCOPE (ALFWorld Avg 98.4) en un entorno controlado con el mismo prompt y el mismo entorno de evaluacion.
- Baseline para ajuste fino de agentes en entornos de texto: se puede partir de estos pesos para entrenar policies en otros benchmarks tipo ALFWorld (por ejemplo, tareas de hogar o de planificacion) cambiando el entorno de recompensa.
- Evaluacion de robustez de agentes: al estar entrenado con RL, permite estudiar el comportamiento del modelo ante perturbaciones en el entorno, instrucciones ambiguas o estados no vistos.
- Estudio de degradacion de capacidades generales: comparar este checkpoint con Qwen2.5-7B-Instruct original en tareas de lenguaje general permite medir el coste del ajuste fino especializado.
- Docencia y demostraciones de agentes basados en LLM: el tamano de 7B permite desplegarlo en una unica GPU consumer para sesiones demostrativas de planificacion en texto.

## Benchmarks y rendimiento

| Benchmark | Resultado | Fuente |
|---|---|---|
| ALFWorld Avg | 98.4 | Model card del autor (global_step_150, tabla principal del paper) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15-16 GB solo para pesos, mas overhead de KV cache; en la practica 18-20 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ/GPTQ): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion a gran escala con contexto largo; RTX 4090 (24 GB) o L40S para fp16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090 en fp16, y en RTX 3090, RTX 4080 o superiores con cuantizacion 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `endpoints_compatible`), vLLM, llama.cpp u Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scope-alfworld-qwen2.5-7b | 7,6 B | no disponible | Agente ALFWorld (GRPO + OPSD) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens nativos | Proposito general, chat | Apache 2.0 | Hugging Face (ampliamente usado) |
| Qwen/Qwen2.5-7B | 7,6 B | 32.768 tokens nativos | Proposito general, base | Apache 2.0 | Hugging Face |
| Meta Llama 3.1 8B Instruct | 8,0 B | 128.000 tokens | Proposito general, chat | Llama 3.1 Community License | Hugging Face |

La comparacion directa con alternativas de agente es dificil porque no se dispone de otros checkpoints publicos de SCOPE en la informacion proporcionada. Frente a su modelo base, la diferencia es de especializacion: este checkpoint prioriza ALFWorld a costa de posibles perdidas en capacidades generales.

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion independiente de los resultados declarados.
- El resultado ALFWorld Avg 98.4 procede unicamente de la model card del autor; no se ha verificado de forma independiente en la informacion disponible.
- Altamente especializado en ALFWorld: el rendimiento en tareas de lenguaje general, codigo o matematicas puede degradarse respecto a Qwen2.5-7B-Instruct.
- Riesgo de alucinacion en acciones de agente: puede generar acciones no validas o secuencias de comandos incoherentes fuera del entorno de entrenamiento.
- Idiomas soportados no documentados; se desconoce si el ajuste fino ha degradado el multilingusimo del modelo base.
- Sesgos: no documentados en la informacion disponible; hereda los sesgos de los datos de entrenamiento de Qwen2.5, no caracterizados aqui.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso comercial de un checkpoint de investigacion sin evaluacion propia es desaconsejable.
- No se proporcionan pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio; habria que generarlos.
- No se documenta la longitud de contexto efectiva tras el ajuste fino; asumir la del modelo base sin verificar puede provocar fallos en prompts largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neuqrui/scope-alfworld-qwen2.5-7b
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de Qwen2.5 (referencia del modelo base): https://arxiv.org/abs/2412.15115
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Benchmark ALFWorld: https://alfworld.github.io/
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Paper de referencia de SCOPE, repositorio y demo: no disponibles en la informacion proporcionada.
