# logan7000/rqe-sft-qwen3-4b-lora

## Resumen

El modelo `logan7000/rqe-sft-qwen3-4b-lora` es un conjunto de adaptadores LoRA publicados por el usuario logan7000 sobre el modelo base Qwen/Qwen3-4B. No se trata de un modelo completo, sino de un ajuste fino supervisado (SFT) orientado a una tarea muy concreta: calcular el equilibrio de respuesta cuantica con aversion al riesgo (risk-averse quantal response equilibrium, RQE) en juegos de N jugadores descritos en texto. El adaptador entrena al modelo para que escriba la traza del solucionador numerico, una linea cada 25 iteraciones, y termine con una linea `Final: A p, B q, ...` con la estrategia de su propio asiento.

El interes del artefacto es acotado pero claro: demuestra que un modelo de 4.000 millones de parametros puede aprender a emular el bucle iterativo de un solver de teoria de juegos en lugar de limitarse a producir la respuesta final. El entrenamiento cubre nueve clases de juegos (adopcion con 3, 4 y 5 opciones, consenso con 3, 4 y 5 opciones, hawk-dove, matching pennies y stag hunt) con entre 2 y 6 jugadores y entre 2 y 5 opciones por jugador, en juegos de suma por pares.

Es un artefacto de investigacion, no un modelo de proposito general. El propio autor advierte de que las capacidades generales caen tras el SFT: en la comparacion entre el paso 1.000 y el Qwen3-4B original se pierden 4,6 puntos en MATH-500, 8,1 en GPQA y 4,2 en LiveCodeBench, mientras que MMLU se mantiene. La licencia es Apache 2.0 y el repositorio ocupa 2,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con adaptadores LoRA (r = 32, alpha = 64, todas las capas lineales) |
| Parametros totales | 4.000 millones en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors (adaptador PEFT), compatible con cuantizacion del modelo base mediante herramientas externas |
| Idiomas soportados | no disponibles; el entrenamiento se centra en trazas numericas y etiquetas de estrategia en formato estructurado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), con subcarpetas `step-1000` a `step-8000` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only de 4.000 millones de parametros. El ajuste es un SFT con LoRA de rango 32 y alpha 64 aplicado a todas las capas lineales, entrenado durante 8.000 pasos con batch de 16, learning rate 1e-4, schedule coseno y 400 pasos de warm-up. El conjunto de datos contiene 128.000 problemas repartidos en nueve clases de juegos, con la aversion al riesgo tau y el ruido de decision eps muestreados bajo la condicion de unicidad del articulo de RQE, tau * eps >= N - 1.

La innovacion tecnica no esta en la arquitectura, sino en el formato de supervision: el modelo aprende a generar la traza del solucionador (una linea cada 25 pasos del solver) antes de emitir la estrategia final de su asiento. Se publican puntos de control intermedios cada 1.000 pasos, lo que permite analizar la evolucion del ajuste y elegir el compromiso entre especializacion y degradacion de capacidades generales. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de trazas de solucionador para el calculo de equilibrios RQE en juegos de 2 a 6 jugadores con 2 a 5 opciones y suma por pares.
- Emision de la estrategia final en el formato `Final: A p, B q, ...` para el asiento del propio modelo.
- Razonamiento iterativo estructurado: reproduce el bucle numerico del solver paso a paso en lugar de dar solo el resultado.
- Cobertura de nueve clases de juegos: adopcion (3, 4 y 5 opciones), consenso (3, 4 y 5 opciones), hawk-dove, matching pennies y stag hunt.
- Capacidades generales de Qwen3-4B parcialmente conservadas (MMLU sin cambios segun el autor), aunque degradadas en matematicas, razonamiento cientifico y codigo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion en teoria de juegos computacional: el adaptador permite generar aproximaciones de RQE en texto sin ejecutar el solver numerico, util para prototipar analisis de juegos de suma por pares con aversion al riesgo.
- Generacion de datos sinteticos de trazas de solver: las salidas pueden usarse como corpus de entrenamiento o como referencia para comparar implementaciones del algoritmo RQE.
- Docencia y visualizacion de algoritmos iterativos: la traza cada 25 pasos hace visible el proceso de convergencia, lo que facilita explicar el metodo en clase o en documentacion tecnica.
- Validacion cruzada de solvers: comparar la respuesta del modelo con la de un solver exacto ayuda a detectar discrepancias en implementaciones propias del equilibrio.
- Experimentos de SFT sobre modelos pequenos: los puntos de control publicados (paso 1.000 a 8.000) sirven para estudiar el equilibrio entre especializacion y olvido catastrofico en adaptadores LoRA.
- Analisis de juegos tipo hawk-dove o stag hunt en entornos simulados: el modelo puede producir estrategias de equilibrio para agentes de un simulador multiagente, siempre que el juego encaje en las clases entrenadas.

## Benchmarks y rendimiento

Los unicos datos publicados son los del examen interno del autor (200 items; un asiento aprueba si su brecha RQE exacta frente a las respuestas de los demas asientos es inferior a 0,05; un item aprueba si aprueban todos sus asientos):

| Punto de control | Tasa de aprobado del examen (200 items) |
|---|---|
| step-1000 | 79-81% |
| step-3000 | 90,5% |
| step-5000 | 93,5% |
| step-7000 | 94,5% |

Degradacion de capacidades generales respecto a Qwen3-4B (medida en el paso 1.000):

| Benchmark | Diferencia frente a Qwen3-4B |
|---|---|
| MATH-500 | -4,6 puntos |
| GPQA | -8,1 puntos |
| LiveCodeBench | -4,2 puntos |
| MMLU | sin cambios |

No se han publicado resultados de benchmarks estandar (MMLU absoluto, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B en fp16 requiere aproximadamente 8 GB; en cuantizacion de 8 bits, unos 4-5 GB; en 4 bits, unos 2,5-3 GB. El adaptador LoRA anade una sobrecarga pequena (el repositorio completo ocupa 2,1 GB con todos los puntos de control).
- GPU recomendadas: A100, H100 o L40S para servir el modelo base en fp16 con throughput alto; RTX 4090, RTX 3090 o RTX 4080 para inferencia en fp16 o 8 bits en una sola tarjeta.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 y en tarjetas con 4-6 GB si se cuantiza el modelo base.
- Opciones de despliegue: carga mediante `PeftModel.from_pretrained` sobre `AutoModelForCausalLM` con el subfolder del punto de control deseado; el modelo base puede servirse con vLLM, TGI o llama.cpp tras fusionar o cuantizar los pesos, aunque la integracion del adaptador depende de la herramienta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros adaptadores especializados en RQE. Como referencia estructural:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rqe-sft-qwen3-4b-lora (este) | 4.000 M (base) + LoRA | no disponible | RQE en juegos de 2 a 6 jugadores | apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B | 4.000 M | no disponible en la informacion | Proposito general | apache-2.0 | Hugging Face |
| Adaptadores LoRA de comunidad sobre Qwen3-4B | 4.000 M (base) + LoRA | depende del base | Variable segun el autor | variable | Hugging Face |

La comparativa de rendimiento frente a alternativas no esta disponible porque no existen resultados publicados de otros adaptadores para la misma tarea.

## Limitaciones y advertencias

- Artefacto de investigacion sin garantia: el autor lo declara explicitamente como tal; no esta pensado para produccion.
- Degradacion de capacidades generales tras el SFT: perdida de 4,6 puntos en MATH-500, 8,1 en GPQA y 4,2 en LiveCodeBench en el paso 1.000; el modelo deja de ser fiable para tareas generales de matematicas, ciencia o codigo.
- Dominio muy restringido: solo cubre juegos de suma por pares con 2 a 6 jugadores, 2 a 5 opciones y las nueve clases entrenadas; fuera de ese espacio el comportamiento no esta validado.
- Riesgo de alucinacion en las trazas: el modelo imita el formato del solver, pero no ejecuta aritmetica exacta, por lo que puede producir trazas plausibles con resultados incorrectos.
- Sin datos de sesgos, idiomas ni robustez multilingue: la model card no documenta evaluaciones en estos aspectos.
- La condicion de unicidad del RQE (tau * eps >= N - 1) esta incorporada en los datos de entrenamiento; consultas fuera de ese regimen pueden quedar fuera de distribucion.
- Dependencia del modelo base: cualquier limitacion de contexto, licencia o comportamiento de Qwen3-4B se hereda; la longitud de contexto no se especifica en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion independiente desaconseja su despliegue en entornos productivos sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logan7000/rqe-sft-qwen3-4b-lora
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este adaptador.
