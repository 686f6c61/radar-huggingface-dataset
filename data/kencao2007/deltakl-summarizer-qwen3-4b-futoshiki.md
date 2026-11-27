# KenCao2007/DeltaKL-summarizer-qwen3-4b-futoshiki

## Resumen

DeltaKL-summarizer-qwen3-4b-futoshiki es un modelo especializado de resumen (summariser) desarrollado por KenCao2007 como parte del trabajo de investigacion *Self-Improving Long-Horizon Reasoning by Learning Summaries from Local Continuations* (arXiv:2611.31621). No es un modelo de proposito general: es un componente de un sistema mayor llamado TruSuCo (truncate, summarise, continue), disenado para permitir que un solver congelado razone mas alla de su ventana de contexto. Tras cada ventana de 4096 tokens, el razonamiento se trunca, este modelo lo condensa y el solver continua a partir de la pregunta, los resumenes acumulados y los ultimos 128 tokens en bruto.

El modelo se obtiene por fine-tuning de Qwen/Qwen3-4B-Instruct-2507 (4.411 millones de parametros, arquitectura transformer densa) mediante GRPO sobre una recompensa Delta-KL, que mide como de bien la continuacion del solver a partir del resumen se aproxima a su continuacion a partir del razonamiento completo. El entrenamiento se realizo especificamente para el solver Qwen3-4B-Instruct-2507 en la tarea Futoshiki de Reasoning Gym, con 2351 estados de entrenamiento de niveles 0-1.

Su relevancia es acotada pero clara: demuestra que un resumen entrenado con una recompensa orientada a la continuacion del solver mejora el rendimiento en razonamiento de horizonte largo sin modificar los pesos del solver. En la tabla del paper, el sistema con este summariser alcanza 46,1 ± 2,5 de precision media (avg@32) en Futoshiki con 32k tokens de presupuesto, frente a 34,2 ± 2,5 del base sin resumen y 45,9 ± 2,6 de Delethink.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible de forma explicita; el sistema TruSuCo opera con ventanas de 4096 tokens |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de 4.411 millones de parametros, y se especializa mediante GRPO (80 pasos, grupo de 8, 32 prompts por paso, learning rate 1e-6, coeficiente KL 0.001). La recompensa combina la Delta-KL (fidelidad de la continuacion del solver al pasar por el resumen frente a pasar por el razonamiento completo) con una penalizacion de 1.0 cuando el resumen alcanza el limite de longitud. El entrenamiento se ejecuto en 3 GPU H100 de 80 GB (dos para verl y una para el calculo de la recompensa), y el checkpoint publicado corresponde al paso 80 en bf16.

La innovacion tecnica no esta en la arquitectura del modelo, sino en el paradigma de entrenamiento: el summariser se optimiza contra el comportamiento de un solver congelado, no contra una nocion abstracta de "buen resumen". El diseno de resumen es de tipo append (se conservan todos los resumenes), y el solver recibe la pregunta original, la pila de resumenes y los ultimos 128 tokens sin procesar. Los datos de entrenamiento son 2351 estados extraidos de Reasoning Gym Futoshiki (niveles 0-1).

## Capacidades

- Generacion de resumenes de razonamiento intermedios orientados a preservar la informacion relevante para la continuacion del solver.
- Condensacion de trazas de razonamiento largas en resumenes acumulables (esquema append).
- Integracion en el bucle TruSuCo: truncado cada 4096 tokens, resumen y continuacion.
- Especializacion en la tarea Futoshiki (puzles de logica con restricciones de desigualdad).
- No soporta tool calling ni function calling de forma declarada.
- No se declaran capacidades de agente autonoma, vision, audio ni modo thinking explicito.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Evaluacion de investigacion en razonamiento de horizonte largo: ejecutar el bucle TruSuCo con este summariser y el solver Qwen3-4B-Instruct-2507 sobre Futoshiki para reproducir las filas de la Tabla 1 del paper con BUDGET=32768.
- Extension de contexto efectivo sin reentrenar el solver: usar el summariser para comprimir ventanas de 4096 tokens y permitir que un solver congelado resuelva puzles que exceden su ventana nativa.
- Ablacion de estrategias de resumen: comparar este modelo entrenado con el base, RC y Delethink bajo el mismo presupuesto de tokens y los mismos seeds del paper.
- Estudio de recompensas basadas en KL: reutilizar el esquema Delta-KL para entrenar summarisers en otras tareas (matematicas, zebra, sokoban) partiendo de los modelos hermanos publicados.
- Prototipado de pipelines de razonamiento por etapas: integrar el summariser en un orquestador que gestione truncado, resumen y continuacion en tareas de busqueda con backtracking.
- Docencia y reproduccion cientifica: usar el codigo y el entorno de evaluacion del repositorio DeltaKL para ilustrar tecnicas de RL aplicadas a resumenes intermedios.

## Benchmarks y rendimiento

Resultados del paper (Tabla 1c), 32k tokens de solver, avg@32, ± 1 SE sobre problemas:

| Conjunto | Single | Base | RC | Delethink | Trained (este modelo) |
|---|---|---|---|---|---|
| Futoshiki (192) | 45,2 ± 2,4 | 34,2 ± 2,5 | 42,4 ± 2,5 | 45,9 ± 2,6 | 46,1 ± 2,5 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos (4.411 millones de parametros), mas overhead de activaciones y KV cache; en la practica se recomienda al menos 16-24 GB.
- GPU recomendadas: H100 80GB o A100 80GB para el entrenamiento y la evaluacion a gran escala; el paper uso 3 x H100 80GB (2 para verl, 1 para la recompensa).
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bf16 (por ejemplo RTX 4090, RTX 4080) y en configuraciones de 12 GB con cuantizacion, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp y Ollama no estan declarados en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Futoshiki avg@32 (32k) | Licencia |
|---|---|---|---|---|
| DeltaKL-summarizer-qwen3-4b-futoshiki | 4,41 B | Resumen para TruSuCo (Futoshiki) | 46,1 ± 2,5 | Apache 2.0 |
| Qwen3-4B-Instruct-2507 (base, sin entrenar) | 4,41 B | Solver / proposito general | 34,2 ± 2,5 | Apache 2.0 |
| Delethink (referencia del paper) | no disponible | Estrategia de resumen | 45,9 ± 2,6 | no disponible |
| RC (referencia del paper) | no disponible | Estrategia de resumen | 42,4 ± 2,5 | no disponible |

Los modelos hermanos de la misma familia (maths_r1, maths_q4b, zebra, sokoban) comparten base y metodologia pero estan especializados en otras tareas; no se dispone de sus resultados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: espera el prompt exacto que construye el codigo del paper (`trusuco.common.summary_prompt` y `summariser_prompt`); no esta pensado para chat libre ni para uso como summariser generico.
- Entrenado exclusivamente para el solver Qwen3-4B-Instruct-2507 en Futoshiki (niveles 0-1); su comportamiento fuera de ese solver o de esa tarea no esta validado.
- El resumen es de tipo append, por lo que el contexto del solver crece con cada ventana procesada.
- Riesgo de alucinacion en los resumenes no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; el uso esta ligado al prompt del codigo de referencia.
- Licencia Apache 2.0 permite uso comercial, pero la utilidad practica fuera del bucle TruSuCo es limitada.
- El checkpoint publicado corresponde al paso 80 en bf16; no se ofrecen variantes cuantizadas ni ONNX.
- Las cifras de rendimiento dependen del presupuesto de tokens (32k en la tabla) y del esquema de puntuacion con respuesta forzada si la ejecucion no termina.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-futoshiki
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper: https://arxiv.org/abs/2611.31621
- Codigo: https://github.com/KenCao2007/DeltaKL
- Dataset de evaluacion: https://huggingface.co/datasets/KenCao2007/DeltaKL-eval
- Summariser maths_r1: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-1.7b-r1-math
- Summariser maths_q4b: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-math
- Summariser zebra: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-zebra
- Summariser sokoban: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-sokoban
