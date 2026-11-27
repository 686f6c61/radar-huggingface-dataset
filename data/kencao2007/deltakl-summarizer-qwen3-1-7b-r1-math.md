# KenCao2007/DeltaKL-summarizer-qwen3-1.7b-r1-math

## Resumen

DeltaKL-summarizer-qwen3-1.7b-r1-math es un modelo sumarizador especializado, desarrollado por KenCao2007 (Haoqun Cao y Tengyang Xie), que constituye un componente del marco TruSuCo (truncate, summarise, continue) descrito en el articulo *Self-Improving Long-Horizon Reasoning by Learning Summaries from Local Continuations* (arXiv:2611.31621). No es un modelo de proposito general: su funcion es condensar el razonamiento intermedio de un solver congelado para permitirle razonar mas alla de su ventana de contexto.

El modelo parte de Qwen/Qwen3-1.7B y se afina con GRPO sobre una recompensa Delta-KL, que mide cuanto se parece la continuacion del solver a partir del resumen a su continuacion a partir del razonamiento completo. En concreto, esta instancia esta entrenada para el solver deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B en tareas de matematicas (configuracion maths_r1 del paper).

Su relevancia radica en que demuestra una via de extension de contexto sin reentrenar el solver: cada 4.096 tokens el razonamiento se trunca, este sumarizador lo condensa y el solver continua desde la pregunta, los resumenes y los ultimos 128 tokens en bruto. El modelo tiene 2.031.739.904 parametros, se distribuye en safetensors (bf16, repositorio de 4,1 GB) y usa licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B); no disponible el detalle exacto de capas y dimensiones |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible de forma explicita; el diseno asume ventanas de razonamiento de 4.096 tokens y resumenes con tope de longitud |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16); al derivar de Qwen3-1.7B es compatible con cuantizaciones estandar de la familia, pero el autor no las documenta |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen/Qwen3-1.7B, un transformer decoder-only denso de 2.031 millones de parametros. No se introducen cambios arquitectonicos: el ajuste se realiza mediante GRPO (Group Relative Policy Optimization) sobre una recompensa Delta-KL. Esta recompensa mide la divergencia entre la distribucion de continuacion del solver congelado cuando parte del resumen y cuando parte del razonamiento completo; cuanto menor es la divergencia, mejor preserva el resumen la informacion necesaria para resolver el problema. A la recompensa se le resta un termino de penalizacion (1,0 x) cuando el resumen alcanza el tope de longitud.

El entrenamiento usa 2.514 estados de DeepScaleR, 80 pasos de GRPO, tamano de grupo 8, 32 prompts por paso, learning rate 1e-6 y coeficiente KL de 0,001. Se ejecuto en 2 x H100 de 80 GB (una para verl y otra para calcular la recompensa) y el checkpoint publicado corresponde al paso 80 en bf16. El esquema de resumen es "sink8": se conservan el primer resumen y los siete ultimos. El solver objetivo es DeepSeek-R1-Distill-Qwen-1.5B, que permanece congelado durante todo el proceso.

## Capacidades

- Resumen compresivo de trazas de razonamiento matematico de hasta 4.096 tokens, preservando la informacion necesaria para continuar la resolucion.
- Generacion de texto condicionada a un prompt estructurado especifico (trusuco.common.summary_prompt y summariser_prompt), no a chat libre.
- Integracion en el bucle TruSuCo: truncar, resumir y continuar, con ventanas sucesivas de razonamiento.
- Razonamiento de horizonte largo por delegacion: el sumarizador habilita al solver a superar su contexto nominal.
- Capacidad de ajuste al solver concreto mediante la senal Delta-KL, en lugar de optimizar una similitud textual generica.
- No soporta tool calling, function calling, agentes multi-paso ni vision segun la informacion disponible.

## Casos de uso

- Extension de contexto en inferencia matematica: en un pipeline con DeepSeek-R1-Distill-Qwen-1.5B, cada 4.096 tokens el sumarizador condensa el razonamiento y el solver continua desde los resumenes; permite resolver problemas que exceden la ventana del solver sin reentrenarlo.
- Evaluacion de razonamiento de horizonte largo: reproduccion de la Tabla 1 del paper con BUDGET=32768 y scripts/eval.sh maths_r1, util para comparar estrategias de truncado y resumen (Single, Base, RC, Delethink, Trained).
- Investigacion en recompensas basadas en divergencia: el modelo sirve como referencia para estudiar como la Delta-KL correlaciona con la precision final del solver en AIME, BeyondAIME y HMMT.
- Destilacion de trazas largas: condensar cadenas de razonamiento de modelos mayores para construir datasets de entrenamiento con contexto reducido.
- Control de coste de inferencia: sustituir parte del razonamiento bruto por resumenes reduce el numero de tokens procesados por el solver en ejecuciones de 32k tokens o mas.
- Base para nuevos sumarizadores: el codigo y la receta (GRPO, Delta-KL, sink8) permiten reentrenar sumarizadores para otros solvers o dominios, como los modelos de la familia DeltaKL para zebra, sokoban y futoshiki.

## Benchmarks y rendimiento

Resultados de la Tabla 1a del paper (32k tokens de solver, avg@32, ± 1 error estandar sobre problemas):

| Conjunto | Single | Base | RC | Delethink | Trained |
|---|---|---|---|---|---|
| AIME 2024-2026 (90) | 24,0 ± 3,5 | 27,3 ± 3,6 | 26,2 ± 3,7 | 26,0 ± 3,6 | 28,5 ± 3,7 |
| BeyondAIME (100) | 9,8 ± 1,9 | 10,4 ± 2,1 | 11,4 ± 2,2 | 10,3 ± 2,1 | 11,9 ± 2,2 |
| HMMT Feb 2025 (30) | 13,6 ± 5,1 | 13,8 ± 5,2 | 14,9 ± 5,3 | 14,4 ± 5,2 | 14,3 ± 5,1 |
| All (220) | 16,1 ± 1,9 | 17,8 ± 2,0 | 17,9 ± 2,0 | 17,3 ± 1,9 | 19,0 ± 2,0 |

"Trained" es este modelo; "Base" es Qwen/Qwen3-1.7B sin entrenar con el mismo prompt. Las ejecuciones que no terminan dentro del presupuesto se puntuan con una respuesta forzada. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,1 GB de pesos mas memoria de activaciones y cache KV; en la practica, entre 6 y 10 GB segun la longitud del resumen generado.
- En cuantizacion de 8 bits cabria en torno a 2,5-3 GB de pesos; en 4 bits, alrededor de 1,5-2 GB (estimaciones a partir del numero de parametros, no documentadas por el autor).
- GPU recomendadas: el entrenamiento se realizo en 2 x H100 80GB, pero la inferencia del sumarizador es ligera. Una RTX 4090 (24 GB) o incluso una RTX 3090/4080 son suficientes para el modelo en bf16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles segun los tags; no se documenta soporte explicito de vLLM, llama.cpp u Ollama, aunque al ser un transformer Qwen3 estandar deberia ser convertible.
- Latencia y throughput: no disponibles. El modelo se ejecuta dentro del bucle TruSuCo, donde el coste dominante es el del solver, no el del sumarizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeltaKL-summarizer-qwen3-1.7b-r1-math | 2,03 B | ventanas de 4.096 tokens | Sumarizador para solver R1-Distill-Qwen-1.5B en matematicas | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B | 2,03 B | no disponible | Modelo base de proposito general | Apache 2.0 | Hugging Face |
| KenCao2007/DeltaKL-summarizer-qwen3-4b-math | no disponible | no disponible | Sumarizador para la configuracion maths_q4b | Apache 2.0 (segun el resto de la familia) | Hugging Face |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | no disponible | Solver de razonamiento matematico (contraparte, no alternativa) | no disponible en la informacion | Hugging Face |

La comparacion directa con otros sumarizadores genericos no esta disponible: el modelo esta disenado para un prompt y un solver concretos, por lo que no es intercambiable con un modelo de resumen convencional.

## Limitaciones y advertencias

- El modelo espera el prompt exacto que construye el codigo del paper (trusuco.common.summary_prompt y summariser_prompt); no funciona como chat libre ni como resumidor generico.
- Esta acoplado al solver DeepSeek-R1-Distill-Qwen-1.5B y al dominio de matematicas; su uso con otro solver o dominio degradaria la fidelidad del resumen.
- La evaluacion se limita a tres conjuntos de matematicas (AIME, BeyondAIME, HMMT) con 220 problemas en total; los intervalos de error son amplios (por ejemplo, ± 5,1 en HMMT con 30 problemas).
- Las ejecuciones que no terminan dentro del presupuesto se puntuan con respuesta forzada, lo que puede infravalorar o distorsionar el rendimiento real en problemas muy largos.
- Riesgo de perdida de informacion en el resumen: la recompensa Delta-KL es una aproximacion y no garantiza que el solver llegue a la misma respuesta.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento fuera del dominio matematico.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantia alguna sobre el rendimiento en produccion; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion externa.
- El identificador arXiv:2611.31621 y las fechas del repositorio (noviembre de 2026) no han podido verificarse de forma independiente en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-1.7b-r1-math
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Solver asociado: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Dataset de evaluacion: https://huggingface.co/datasets/KenCao2007/DeltaKL-eval
- Paper: https://arxiv.org/abs/2611.31621
- Codigo: https://github.com/KenCao2007/DeltaKL
- Sumarizador maths_q4b: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-math
- Sumarizador zebra: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-zebra
- Sumarizador sokoban: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-sokoban
- Sumarizador futoshiki: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-futoshiki
