# allenai/tmax-9b

## Resumen

TMax 9B es un modelo de lenguaje especializado en actuar como agente de terminal (terminal-agent), desarrollado por Ai2 (Allen Institute for AI). Se obtiene mediante un ajuste fino con DPPO (una variante de aprendizaje por refuerzo con divergencia controlada) sobre el modelo base Qwen 3.5 9B, y su objetivo es resolver tareas de línea de comandos en entornos reales, como las que evalúa el benchmark Terminal Bench.

El modelo resuelve un problema concreto: convertir un LLM generalista de 9.000 millones de parametros en un agente capaz de operar una shell de forma autonoma, interpretando el estado del sistema, ejecutando comandos y corrigiendo errores a lo largo de multiples turnos. Tras 200 pasos de entrenamiento por refuerzo alcanza aproximadamente un 27 % en Terminal Bench 2.0 (backend Daytona) y un 57,2 % en Terminal Bench Lite, lo que supone una mejora de unos 15 puntos sobre el Qwen 3.5 9B original en Lite y de unos 6 puntos en TB 2.0.

Es relevante ahora porque demuestra que un ajuste por RL relativamente ligero (500 pasos maximos, checkpoint final en el paso 200) sobre un modelo de 9B puede competir con modelos mucho mayores en tareas de agente, y porque Ai2 publica tanto los checkpoints intermedios como todas las rollouts y logprobs del entrenamiento, lo que facilita la reproducibilidad y el analisis del proceso de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3.5 9B, tag `qwen3_5`); sin cabeza de vision |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (max overall tokens en entrenamiento; `--max-model-len 65536` en el ejemplo de despliegue) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en el formato original) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B (checkpoint de partida: hamishivi/Qwen3.5-9B) |
| Dataset de entrenamiento | allenai/tmax-15k-open-instruct (TMax-15K) |
| Metodo de entrenamiento | DPPO (RL) |
| Tamano del repo | 133,6 GB |
| Descargas / likes | 2.072 / 20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen 3.5 9B, un transformer decoder-only denso de 8,95 B de parametros. Durante el entrenamiento se elimino la cabeza de vision del modelo base, por lo que el checkpoint resultante es exclusivamente de lenguaje; el ejemplo oficial de despliegue con vLLM exige el flag `--language_model_only`. El contexto maximo manejado es de 65.536 tokens, con prompts de hasta 2.048 tokens y hasta 16.384 tokens por turno.

El entrenamiento se realizo con DPPO (Divergence-controlled PPO) sobre el dataset TMax-15K, con los siguientes hiperparametros destacados: learning rate constante de 1e-6, temperatura de muestreo 1,0, KL beta 0,0, divergencia medida con TV binaria y umbral 0,1, normalizacion de ventajas centrada (sin division por desviacion tipica), 8 prompts unicos por rollout con 32 muestras por prompt, 4 pasos asincronos, batch por dispositivo de 1, longitud de empaquetado de 67.584 tokens y cabeza LM en FP32. El entrenamiento se planifico para 500 pasos, pero el checkpoint publicado como principal es el del paso 200, que fue el que mejor rindio en Terminal Bench Lite. Ai2 publica ademas todas las rollouts y logprobs del proceso de entrenamiento en el propio repositorio.

## Capacidades

- Generacion de texto y razonamiento en ingles, heredados del modelo base Qwen 3.5 9B.
- Ejecucion de tareas de agente de terminal: interpretar el estado de una shell, emitir comandos, leer salidas y corregir errores en multiples turnos.
- Soporte de tool calling / function calling mediante el parser `qwen3_xml` en vLLM (`--enable-auto-tool-choice`).
- Razonamiento multi-paso orientado a la resolucion de tareas de sistema (instalacion de paquetes, edicion de ficheros, depuracion de scripts).
- Capacidades multilingues limitadas: la model card declara unicamente ingles.
- Sin capacidades de vision: la cabeza multimodal fue eliminada durante el entrenamiento.
- No se documentan capacidades de audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Automatizacion de tareas de administracion de sistemas: el modelo puede recibir un objetivo en lenguaje natural y traducirlo en una secuencia de comandos de shell, inspeccionando la salida de cada uno y corrigiendo errores, gracias a su ventana de 65.536 tokens que cubre sesiones largas.
- Agente de CI/CD para reparacion de builds: integrado en pipelines, puede leer logs de fallo, ejecutar comandos de diagnostico y aplicar parches en el repositorio, apoyandose en el soporte de tool calling.
- Asistente de terminal interactivo para desarrolladores: desplegado con vLLM y el parser `qwen3_xml`, actua como copiloto que propone y ejecuta comandos en un entorno controlado (podman/docker), reduciendo el tiempo de resolucion de tareas repetitivas.
- Evaluacion y benchmarking de agentes: sirve como referencia para medir harness de agentes de terminal, ya que Ai2 publica el codigo de evaluacion y las rollouts completas.
- Investigacion en RL para agentes: las rollouts y logprobs publicadas permiten estudiar la dinamica de DPPO, el efecto de la divergencia TV y la evolucion del rendimiento paso a paso.
- Generacion de scripts de automatizacion: dado un objetivo concreto (por ejemplo, procesar un lote de ficheros), el modelo produce scripts de shell o Python y los valida ejecutandolos en un sandbox.
- Formacion y educacion: entorno reproducible para que estudiantes experimenten con agentes de terminal sin necesidad de infraestructura propietaria, al estar bajo licencia Apache 2.0.

## Benchmarks y rendimiento

Resultados publicados en la model card (media +/- error estandar; 3 ejecuciones en Lite/2.1 y 5 en Daytona):

| Modelo | TB Lite | TB 2.1 | TB 2.0 (Daytona) |
|---|---|---|---|
| Qwen 3.5 2B | 5,71 +/- 1,6 | 1,9 +/- 1,4 | 2,3 +/- 1,0 |
| Tmax 2B | 11,8 +/- 1,4 | 4,2 +/- 1,2 | 2,9 +/- 0,6 |
| Qwen 3.5 4B | 31,8 +/- 3,8 | no disponible | 16,6 +/- 1,7 |
| Tmax 4B | 42,6 +/- 1,5 | 19,9 +/- 1,1 | 18,9 +/- 1,9 |
| Qwen 3.5 9B | 41,9 +/- 2,7 | 16,1 +/- 3,7 | 21,1 +/- 2,6 |
| Tmax 9B (este modelo) | 57,2 +/- 2,5 | 28,8 +/- 3,7 | 27,2 +/- 1,5 |
| Qwen 3.6 27B | 70,8 +/- 2,1 | 40,5 +/- 2,4 | 39,6 +/- 2,1 |
| Tmax 27B | 68,6 +/- 4,7 | 44,9 +/- 1,8 | 42,7 +/- 0,7 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, mas overhead de KV cache; con contexto de 65.536 tokens el consumo real es considerablemente mayor.
- Cuantizacion a 8 bits: unos 9-10 GB de pesos; a 4 bits: unos 5-6 GB de pesos, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100 80 GB o H100 para contexto completo y despliegue con tensor parallelism; el ejemplo oficial usa `--tensor-parallel-size 8`.
- En GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en BF16, pero el contexto completo de 65.536 tokens requiere cuantizacion o reducir `--max-model-len`.
- Despliegue recomendado: vLLM 0.19.1 con `--enable-auto-tool-choice --tool-call-parser qwen3_xml --language_model_only`. No se documentan opciones oficiales para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TB Lite | TB 2.0 (Daytona) | Licencia |
|---|---|---|---|---|---|
| Tmax 9B | 8,95 B | 65.536 | 57,2 | 27,2 | Apache 2.0 |
| Qwen 3.5 9B (base) | 9 B (aprox.) | no disponible | 41,9 | 21,1 | no disponible |
| Tmax 4B | 4 B (aprox.) | no disponible | 42,6 | 18,9 | Apache 2.0 |
| Tmax 27B | 27 B (aprox.) | no disponible | 68,6 | 42,7 | Apache 2.0 |
| Qwen 3.6 27B | 27 B (aprox.) | no disponible | 70,8 | 39,6 | no disponible |

Tmax 9B supera claramente a su modelo base y a Tmax 4B en todas las variantes de Terminal Bench, y se acerca al Qwen 3.6 27B en TB 2.0 (27,2 frente a 39,6), aunque queda por debajo del Tmax 27B. La ventaja principal frente a los modelos de 27B es el menor coste de inferencia.

## Limitaciones y advertencias

- Idioma: la model card solo declara ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Especializacion: el modelo esta optimizado para tareas de terminal; su rendimiento en conversacion general, redaccion o matematicas no se ha evaluado en la informacion disponible.
- Sin vision: la cabeza multimodal fue eliminada, por lo que no procesa imagenes.
- Riesgo de alucinacion y comandos peligrosos: como agente de shell, puede emitir comandos destructivos; debe ejecutarse en entornos aislados (podman/docker) con permisos restringidos.
- Sesgos: no se documentan analisis de sesgos en la informacion proporcionada; al derivar de Qwen 3.5 9B y entrenarse solo con datos en ingles, hereda los sesgos del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero Ai2 indica que el modelo esta pensado para investigacion y educacion conforme a sus Responsible Use Guidelines.
- Reproducibilidad: el checkpoint principal es el paso 200 de un entrenamiento de 500 pasos; los resultados pueden variar con el harness de evaluacion y el backend utilizado (podman frente a Daytona).
- Contexto: aunque soporta 65.536 tokens, prompts superiores a 2.048 tokens no se usaron en entrenamiento, lo que puede degradar el rendimiento en entradas muy largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allenai/tmax-9b
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/tmax-15k-open-instruct
- Dataset TMax-15K: https://huggingface.co/datasets/allenai/TMax-15K
- Paper (arXiv 2606.23321): https://arxiv.org/abs/2606.23321
- Blog: https://wai-org.com/blog/tmax/
- Codigo: https://github.com/hamishivi/tmax
- Coleccion de modelos y datos: https://huggingface.co/collections/allenai/tmax
- Rollouts y logprobs: https://huggingface.co/allenai/tmax-9b/tree/main/rollouts
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint de partida: https://huggingface.co/hamishivi/Qwen3.5-9B
- Guia de uso responsable de Ai2: https://allenai.org/responsible-use
