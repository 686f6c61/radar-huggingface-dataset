# KenCao2007/DeltaKL-summarizer-qwen3-4b-sokoban

## Resumen

DeltaKL-summarizer-qwen3-4b-sokoban es un modelo especializado de resumen entrenado por KenCao2007 (Haoqun Cao) como componente del sistema TruSuCo (truncate, summarise, continue), presentado en el articulo *Self-Improving Long-Horizon Reasoning by Learning Summaries from Local Continuations* (arXiv:2611.31621). No es un modelo de chat generalista: es el sumarizador del bucle TruSuCo para el entorno Sokoban de Reasoning Gym, disenado para comprimir cadenas de razonamiento largas y permitir que un solver congelado continue razonando mas alla de su ventana de contexto.

El modelo parte de Qwen/Qwen3-4B-Instruct-2507 (4.411.424.256 parametros reales en safetensors) y se afina con GRPO sobre una recompensa Delta-KL que mide cuanto se parece la continuacion del solver a partir del resumen frente a su continuacion a partir del razonamiento completo. El resultado es un sumarizador que preserva la informacion relevante para la tarea en lugar de producir resumenes genericos.

Su relevancia es metodologica: demuestra que un sumarizador pequeno y entrenado con una recompensa orientada a la continuacion puede superar a tecnicas de gestion de contexto como Delethink o RC en tareas de razonamiento de horizonte largo, con una mejora medible en Sokoban (41,6 frente a 39,9 del mejor baseline) usando solo 32k tokens de presupuesto del solver.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible de forma explicita; el bucle TruSuCo opera en ventanas de 4.096 tokens y conserva los ultimos 128 tokens crudos |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer denso Qwen3-4B-Instruct-2507. No se introduce ninguna modificacion arquitectonica: el cambio es puramente de comportamiento, orientado a producir resumenes que permitan al solver congelado continuar su razonamiento con la misma distribucion que tendria con el historial completo. El layout de resumen es "append": cada resumen se conserva y se acumula, de modo que el solver recibe la pregunta, todos los resumenes previos y los ultimos 128 tokens crudos tras cada ventana de 4.096 tokens truncada.

El entrenamiento usa GRPO con 80 pasos, tamano de grupo 8, 32 prompts por paso, learning rate 1e-6 y coeficiente KL de 0,001. La recompensa es Delta-KL menos una penalizacion de 1,0 cuando el resumen alcanza el limite de longitud. El conjunto de entrenamiento son 1.932 estados de Reasoning Gym Sokoban (niveles 0-1). El computo empleado fue de 3 GPU H100 de 80 GB (dos para verl y una para calcular la recompensa). El checkpoint publicado corresponde al paso 80 en bf16.

## Capacidades

- Generacion de resumenes de cadenas de razonamiento largas orientados a preservar la informacion necesaria para continuar la tarea.
- Compresion de contexto en ventanas de 4.096 tokens dentro del bucle TruSuCo, con acumulacion de resumenes.
- Razonamiento de horizonte largo por delegacion: el sumarizador no resuelve Sokoban, pero mantiene la coherencia del estado para que el solver lo haga.
- Optimizacion especifica para Sokoban (niveles 0-1) y para el solver Qwen3-4B-Instruct-2507; el comportamiento fuera de ese par solver-tarea no esta validado.
- No soporta tool calling ni function calling de forma nativa para uso general.
- No esta pensado para conversacion libre: espera el prompt exacto que construye el codigo del paper (trusuco.common.summary_prompt y summariser_prompt).
- Capacidades multilingues: no documentadas.

## Casos de uso

- Razonamiento de horizonte largo en Sokoban: integrado en el bucle TruSuCo, permite al solver Qwen3-4B-Instruct-2507 continuar mas alla de su ventana de contexto resumiendo cada bloque de 4.096 tokens, con una precision de 41,6 en el conjunto de 192 problemas a 32k tokens de presupuesto.
- Investigacion en gestion de contexto: sirve como referencia reproducible para estudiar recompensas basadas en continuacion (Delta-KL) frente a resumenes supervisados o heuristicos.
- Evaluacion comparativa de estrategias de contexto: el repositorio permite comparar Base, RC, Delethink y el sumarizador entrenado con los mismos seeds y presupuesto mediante scripts/eval.sh.
- Entrenamiento de sumarizadores para otros entornos: el pipeline (GRPO sobre Delta-KL con un solver congelado) es reutilizable para los otros settings publicados (maths_r1, maths_q4b, zebra, futoshiki).
- Reproduccion de resultados del paper: los conjuntos de evaluacion en KenCao2007/DeltaKL-eval y los scripts de scoring permiten replicar la Tabla 1c a 32k tokens.
- Analisis de coste-eficiencia en inferencia: al ser un modelo de 4B en bf16, puede ejecutarse en una sola GPU para estudiar el trade-off entre coste del sumarizador y ganancia en el solver.

## Benchmarks y rendimiento

Resultados del paper (Tabla 1c), 32k tokens de presupuesto del solver, avg@32, ± 1 error estandar sobre problemas. Los runs que no terminan dentro del presupuesto se puntuan con respuesta forzada.

| Conjunto | Single | Base | RC | Delethink | Trained (este modelo) |
|---|---|---|---|---|---|
| Sokoban (192) | 37,5 ± 2,5 | 34,0 ± 2,6 | 39,9 ± 2,6 | 35,7 ± 2,5 | 41,6 ± 2,5 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- Entrenamiento original: 3 GPU H100 de 80 GB (dos para verl, una para la recompensa Delta-KL).
- Inferencia en bf16: el checkpoint pesa aproximadamente 8,8 GB, por lo que cabe en GPUs consumer con 12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) y en GPUs de datacenter (A100, H100, L40S).
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; habria que generarlas a partir del checkpoint bf16.
- Despliegue: transformers es la libreria declarada; el modelo es compatible con text-generation-inference y endpoints_compatible segun los tags. No hay confirmacion de soporte en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El coste real del sistema depende del solver (Qwen3-4B-Instruct-2507) y de la frecuencia de invocacion del sumarizador cada 4.096 tokens.

## Comparativa con modelos similares

No hay modelos publicos directamente comparables como sumarizadores de bucle TruSuCo; la comparativa natural es con las estrategias de gestion de contexto evaluadas en el paper y con los otros sumarizadores de la familia.

| Modelo / estrategia | Parametros | Contexto | Sokoban (32k, avg@32) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeltaKL-summarizer-qwen3-4b-sokoban | 4,41B | ventanas de 4.096 tokens | 41,6 ± 2,5 | Apache 2.0 | Hugging Face |
| RC (baseline del paper) | no aplica (estrategia) | no aplica | 39,9 ± 2,6 | no aplica | codigo del paper |
| Delethink (baseline del paper) | no aplica (estrategia) | no aplica | 35,7 ± 2,5 | no aplica | codigo del paper |
| Base (Qwen3-4B-Instruct-2507 sin sumarizador entrenado) | 4,41B | no disponible | 34,0 ± 2,6 | Apache 2.0 | Hugging Face |
| DeltaKL-summarizer-qwen3-4b-math | 4,41B (aproximado) | ventanas de 4.096 tokens | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo de proposito muy especifico: entrenado para Sokoban (niveles 0-1) y para el solver Qwen3-4B-Instruct-2507; su uso con otro solver o tarea no esta validado y probablemente degrade.
- No es un modelo conversacional: espera el prompt exacto de trusuco.common.summary_prompt y summariser_prompt; el uso en chat libre producira salidas no representativas.
- Entrenamiento limitado: 1.932 estados y 80 pasos de GRPO; el riesgo de sobreajuste al conjunto y de generalizacion pobre a niveles superiores de Sokoban es real.
- Riesgo de resumenes truncados: la recompensa penaliza alcanzar el limite de longitud, pero no lo elimina; los resumenes que agotan el cap pueden degradar la continuacion del solver.
- Sin datos publicados sobre sesgos, alucinacion o comportamiento multilingue; no hay evaluacion de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda las caracteristicas del Qwen3-4B-Instruct-2507 subyacente; conviene revisar la licencia del modelo base para despliegues en produccion.
- Sin cuantizaciones oficiales ni soporte confirmado en runtimes de alto rendimiento (vLLM, llama.cpp), lo que limita su despliegue fuera de transformers y TGI.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-sokoban
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper: https://arxiv.org/abs/2611.31621
- Codigo: https://github.com/KenCao2007/DeltaKL
- Dataset de evaluacion: https://huggingface.co/datasets/KenCao2007/DeltaKL-eval
- Sumarizador maths_r1: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-1.7b-r1-math
- Sumarizador maths_q4b: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-math
- Sumarizador zebra: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-zebra
- Sumarizador futoshiki: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-futoshiki
