# kingjones777/Mellum2-12B-A2.5B-Instruct-ROCmFPX-Q8_0-GGUF

## Resumen

Mellum2-12B-A2.5B-Instruct es un modelo de lenguaje de tipo MoE desarrollado por JetBrains, con 12.150 millones de parametros totales y solo 2.500 millones activos por token. Esta ficha cubre la cuantizacion ROCmFPX de 8 bits publicada por kingjones777, disenada especificamente para GPUs AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo). El modelo base fue entrenado desde cero sobre lenguaje natural y codigo, con una ventana de contexto de 131K tokens, y esta orientado a sistemas de produccion donde la latencia y el rendimiento son criticos: routing, Q&A, tool use, tareas de sub-agente y pipelines RAG.

La cuantizacion Q8_0_ROCMFPX ocupa 11,70 GiB y alcanza 72,76 tok/s de decodificacion en un Ryzen AI MAX+ 395 con ROCm 7.2.4. Requiere un fork especifico de llama.cpp (charlie12345/ROCmFPX) porque ni la arquitectura Mellum ni los tipos de cuantizacion ROCmFPX estan integrados en el llama.cpp estandar. Existen variantes de 4 bits (104,99 tok/s) y de 8 bits AGENT (74,93 tok/s) en repositorios hermanos del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) |
| Parametros totales | 12.149.923.072 (12,15B) |
| Parametros activos | 2,5B por token |
| Longitud de contexto | 131.072 tokens (131K) |
| Tipos de cuantizacion | Q8_0_ROCMFPX (8 bits, ftype 111), Q8_0_ROCMFPX_AGENT (8 bits, ftype 115), ROCmFP4 (4 bits, ftype 102) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Mellum2-12B-A2.5B-Instruct es un modelo MoE con 12,15B parametros totales y 2,5B activos por token, entrenado desde cero por JetBrains sobre una mezcla de lenguaje natural y codigo. La arquitectura Mellum no esta integrada en el llama.cpp estandar (PR #23966 pendiente de fusion), por lo que requiere un fork especifico. El modelo no dispone de cabeza MTP (multi-token prediction), lo que segun el autor de la cuantizacion hace que las dos variantes de 8 bits (plain y AGENT) se comporten de forma casi identica, ya que no hay nada que se beneficie de la precision extra de AGENT.

La cuantizacion Q8_0_ROCMFPX se genero a partir de un GGUF BF16 (24.311.968.416 bytes) verificado byte a byte contra el blob original, lo que garantiza una fuente sin perdidas. El autor realizo comprobaciones de correccion con hechos memorizados (17×23=391, capital de Japon=Tokyo, 366 dias en 2024) con un presupuesto de 1024 tokens, advirtiendo de que presupuestos pequenos pueden hacer que el modelo parezca roto al agotar el presupuesto dentro del bloque thinking y devolver content vacio.

## Capacidades

- Generacion de texto y completado de codigo: el modelo base fue entrenado sobre lenguaje natural y codigo, y esta etiquetado con code-completion.
- Razonamiento con modo thinking: el modelo genera un bloque de razonamiento interno antes de la respuesta final, como se deduce de la advertencia sobre presupuestos de tokens.
- Tool use y function calling: el modelo base esta disenado para tool use y tareas de sub-agente, segun la descripcion de JetBrains.
- Routing y Q&A: optimizado para tareas de enrutamiento de consultas y preguntas-respuestas en sistemas de produccion.
- RAG pipelines: disenado para integrarse en pipelines de generacion aumentada por recuperacion.
- Multilingue: solo se declara soporte para ingles (en).

## Casos de uso

- Atencion al cliente automatizada: con 131K tokens de contexto, puede gestionar conversaciones multi-turno extensas manteniendo el historial completo de la interaccion sin truncamientos.
- Generacion de codigo en produccion: su entrenamiento sobre codigo y el soporte de tool calling permiten integrarlo en pipelines de CI/CD para autocompletado y revision de codigo.
- Agentes autonomos: los 2,5B de parametros activos reducen la latencia, lo que lo hace adecuado para tareas de sub-agente donde se necesitan respuestas rapidas.
- RAG sobre documentacion tecnica: la ventana de 131K tokens permite inyectar fragmentos largos de documentacion y mantener el contexto de la conversacion.
- Enrutamiento de consultas en sistemas multi-modelo: puede actuar como router inteligente que clasifica y deriva consultas a modelos especializados.
- Despliegue en hardware AMD integrado: al estar cuantizado para gfx1151, puede ejecutarse en equipos con Ryzen AI MAX+ 395 sin GPU discreta, lo que reduce costes de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor de la cuantizacion realizo comprobaciones de correccion con hechos memorizados (17×23=391, capital de Japon=Tokyo, 366 dias en 2024) y midio el rendimiento de decodificacion en un Ryzen AI MAX+ 395 con ROCm 7.2.4:

| Variante | ftype | Tamano | BPW | Decode (mediana) |
|---|---|---|---|---|
| 4-bit COHERENT | 102 | 6,49 GiB | 4,59 | 104,99 tok/s |
| 8-bit AGENT | 115 | 11,88 GiB | 8,39 | 74,93 tok/s |
| 8-bit plain | 111 | 11,70 GiB | 8,27 | 72,76 tok/s |

El autor advierte que no se realizaron pruebas de perplexity, ni comparativas de calidad contra la fuente, ni pruebas de contexto largo ni de tool calling.

## Requisitos de hardware

- VRAM estimada: 11,70 GiB para la variante Q8_0_ROCMFPX (8 bits); 6,49 GiB para la variante de 4 bits.
- GPU recomendada: AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo) con ROCm 7.2.4. No hay datos sobre compatibilidad con otras GPUs AMD o NVIDIA.
- Consumer GPU: cabe en GPUs con 12 GiB o mas de VRAM, aunque la cuantizacion esta optimizada para la arquitectura gfx1151.
- Opciones de despliegue: requiere el fork especifico de llama.cpp (charlie12345/ROCmFPX). No es compatible con el llama.cpp estandar ni con vLLM, Ollama o TGI salvo que integren la arquitectura Mellum y los tipos ROCmFPX.
- Rendimiento medido: 72,76 tok/s de decodificacion (mediana de 3 ejecuciones, descartando el warm-up) en Ryzen AI MAX+ 395.

## Comparativa con modelos similares

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa rigurosa con modelos alternativos. El autor de la cuantizacion menciona Qwen3.8-27B en el contexto de la cabeza MTP, pero no se aportan especificaciones ni benchmarks comparables. La comparativa mas relevante es entre las propias variantes de cuantizacion del mismo modelo, recogida en la tabla de la seccion de benchmarks.

## Limitaciones y advertencias

- La arquitectura Mellum no esta integrada en el llama.cpp estandar (PR #23966 pendiente). El llama.cpp estandar reporta "invalid ggml type 103" al intentar cargar estos pesos.
- Los tipos de cuantizacion ROCmFPX (ftype 111 y 115) solo existen en el fork charlie12345/ROCmFPX. No son compatibles con otras herramientas.
- No se han realizado pruebas de perplexity, ni comparativas de calidad contra el modelo original, ni pruebas de contexto largo ni de tool calling.
- Con presupuestos de tokens pequenos (p. ej. 1024), el modelo puede agotar el presupuesto dentro del bloque thinking y devolver content vacio, lo que puede hacer que parezca roto.
- Solo se declara soporte para ingles.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base de JetBrains; conviene verificar los terminos del modelo original.
- El rendimiento medido (72,76 tok/s) corresponde a un hardware especifico (Ryzen AI MAX+ 395 con ROCm 7.2.4) y puede variar en otras configuraciones.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Instruct-ROCmFPX-Q8_0-GGUF
- Variante de 4 bits: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Instruct-ROCmFP4-GGUF
- Variante de 8 bits AGENT: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Instruct-ROCmFPX-Q8_0-AGENT-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Instruct
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- PR de integracion de Mellum en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/23966
- Scripts de cuantizacion y evaluacion: https://github.com/altibola/Mellum2-12B-A2.5B-Instruct-GGUF
- Ficha del modelo en Weights & Biases: https://wandb.ai/site/inference-model/cw_jetbrains_mellum2-12b-a2.5b-instruct/
