# KenCao2007/DeltaKL-summarizer-qwen3-4b-math

## Resumen

DeltaKL-summarizer-qwen3-4b-math es un modelo sumarizador especializado, desarrollado por KenCao2007 (Haoqun Cao y Tengyang Xie), que constituye un componente del marco TruSuCo (truncate, summarise, continue) presentado en el articulo *Self-Improving Long-Horizon Reasoning by Learning Summaries from Local Continuations* (arXiv:2611.31621). No es un modelo de proposito general: su funcion es condensar el razonamiento intermedio de un solver congelado para que este pueda seguir razonando mas alla de su ventana de contexto.

El modelo parte de Qwen/Qwen3-4B-Instruct-2507 y se afina mediante GRPO con una recompensa Delta-KL, que mide cuanto se parece la continuacion del solver a partir del resumen a su continuacion a partir del razonamiento completo. La configuracion concreta es la denominada maths_q4b, orientada a problemas de matematicas con el solver Qwen3-4B-Instruct-2507.

Su relevancia radica en que propone una via de auto-mejora para razonamiento de horizonte largo sin reentrenar el solver: cada 4.096 tokens se trunca el razonamiento, el sumarizador lo condensa y el solver continua desde la pregunta, los resumenes y los ultimos 128 tokens en bruto. El checkpoint publicado corresponde al paso 80 en bf16, con 4.411.424.256 parametros y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el diseno opera sobre ventanas de 4.096 tokens y conserva los ultimos 128 tokens en bruto |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B-Instruct-2507. El entrenamiento se realizo con GRPO durante 80 pasos, con tamano de grupo 8, 32 prompts por paso, learning rate 1e-6 y coeficiente KL de 0.001. La recompensa combina la Delta-KL (similitud entre la continuacion del solver desde el resumen y desde el razonamiento completo) menos 1.0 por cada vez que el resumen alcanza el limite de longitud. El entrenamiento se ejecuto en 3 GPU H100 de 80 GB (dos para verl y una para el calculo de la recompensa).

Los datos de entrenamiento son 2.490 estados de DeepScaleR. El formato de resumen es sink8: se conservan el primer resumen y los ultimos siete. El checkpoint publicado es el paso 80 en bf16. La innovacion clave no esta en la arquitectura sino en el bucle de inferencia: TruSuCo permite a un solver congelado razonar mas alla de su contexto mediante truncado, resumen y continuacion, y el sumarizador se optimiza para preservar la informacion que el solver necesita para continuar correctamente.

## Capacidades

- Resumen de cadenas de razonamiento matematico para su continuacion por un solver congelado.
- Condensacion de estados de razonamiento en ventanas de 4.096 tokens con preservacion de los ultimos 128 tokens en bruto.
- Operacion dentro del bucle TruSuCo con el prompt construido por el codigo del paper (trusuco.common.summary_prompt y summariser_prompt).
- Generacion de texto y razonamiento heredados del modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; su uso previsto es como componente de un bucle de razonamiento.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no dispone de modo thinking, vision ni audio documentados.

## Casos de uso

- Razonamiento matematico de horizonte largo: el modelo se inserta en el bucle TruSuCo para permitir que Qwen3-4B-Instruct-2507 aborde problemas que requieren mas de 32.000 tokens de razonamiento, resumiendo cada ventana de 4.096 tokens y permitiendo la continuacion desde el resumen.
- Evaluacion de tecnicas de compresion de contexto: sirve como referencia para comparar estrategias de truncado y resumen (Single, Base, RC, Delethink) en tareas de matematicas competitivas como AIME, BeyondAIME y HMMT.
- Investigacion en auto-mejora de razonamiento: permite reproducir el experimento del paper sobre recompensas Delta-KL y estudiar como la calidad del resumen afecta a la precision final del solver.
- Generacion de resumenes intermedios en pipelines de razonamiento: util en sistemas que necesitan mantener un estado compacto de un razonamiento largo para continuar la resolucion sin exceder la ventana del modelo.
- Benchmarking de sumarizadores especializados: el checkpoint permite medir la contribucion aislada del sumarizador frente a la del solver en las metricas avg@32 del paper.
- Reproduccion de resultados academicos: con el codigo y el dataset KenCao2007/DeltaKL-eval se pueden replicar las filas de la Tabla 1b a un presupuesto de 32.000 tokens usando scripts/eval.sh maths_q4b main.

## Benchmarks y rendimiento

Resultados del paper (Tabla 1b, 32k tokens de solver, avg@32, ± 1 SE sobre problemas):

| Conjunto | Single | Base | RC | Delethink | Trained |
|---|---|---|---|---|---|
| AIME 2024-2026 (90) | 53.4 ± 4.1 | 59.6 ± 4.2 | 60.2 ± 4.2 | 58.6 ± 4.1 | 61.1 ± 4.1 |
| BeyondAIME (100) | 31.8 ± 3.7 | 35.2 ± 3.9 | 36.8 ± 3.9 | 34.9 ± 3.8 | 36.6 ± 3.9 |
| HMMT Feb 2025 (30) | 29.9 ± 7.3 | 34.1 ± 7.7 | 33.9 ± 7.7 | 34.9 ± 7.4 | 35.7 ± 7.8 |
| All (220) | 40.4 ± 2.7 | 45.0 ± 2.8 | 45.9 ± 2.8 | 44.6 ± 2.7 | 46.5 ± 2.8 |

"Trained" corresponde a este modelo; "Base" es Qwen3-4B-Instruct-2507 sin entrenar con el mismo prompt. Las ejecuciones que no terminan dentro del presupuesto se puntuan con una respuesta forzada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.411 millones de parametros, en bf16 el peso ocupa aproximadamente 8,8 GB, por lo que se necesita al menos ese margen mas overhead de activaciones y KV cache.
- GPU recomendadas: el entrenamiento uso 3 x H100 80 GB; para inferencia basta una GPU con memoria suficiente para bf16 o cuantizacion.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 16-24 GB en bf16 o cuantizada, aunque no se documenta oficialmente.
- Opciones de despliegue: transformers (libreria declarada); compatible con text-generation-inference y endpoints_compatible segun los tags. No se documentan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia |
|---|---|---|---|---|
| DeltaKL-summarizer-qwen3-4b-math | 4.411 M | no disponible | Sumarizador para TruSuCo (maths_q4b) | Apache 2.0 |
| DeltaKL-summarizer-qwen3-1.7b-r1-math | no disponible | no disponible | Sumarizador para TruSuCo (maths_r1) | no disponible |
| DeltaKL-summarizer-qwen3-4b-zebra | no disponible | no disponible | Sumarizador para TruSuCo (zebra) | no disponible |
| Qwen3-4B-Instruct-2507 (base) | no disponible | no disponible | Modelo de proposito general | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, salvo la comparacion Base frente a Trained en la tabla de benchmarks.

## Limitaciones y advertencias

- El modelo espera el prompt exacto que construye el codigo del paper; no esta pensado para chat libre ni para uso fuera del bucle TruSuCo.
- Esta especializado en matematicas (configuracion maths_q4b) y en el solver Qwen3-4B-Instruct-2507; su comportamiento con otros solvers o dominios no esta documentado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingue.
- Las metricas publicadas tienen intervalos de error amplios (± 1 SE), especialmente en HMMT Feb 2025 (30 problemas), por lo que las diferencias entre metodos deben interpretarse con cautela.
- Las ejecuciones que no terminan dentro del presupuesto se puntuan con respuesta forzada, lo que puede afectar a la comparabilidad con otros sistemas.
- Licencia Apache 2.0, permisiva para uso comercial, pero sin garantias explicitas del autor sobre el rendimiento en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-math
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper: https://arxiv.org/abs/2611.31621
- Codigo: https://github.com/KenCao2007/DeltaKL
- Dataset de evaluacion: https://huggingface.co/datasets/KenCao2007/DeltaKL-eval
- Sumarizador maths_r1: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-1.7b-r1-math
- Sumarizador zebra: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-zebra
- Sumarizador sokoban: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-sokoban
- Sumarizador futoshiki: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-futoshiki
