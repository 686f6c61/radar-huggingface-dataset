# iromu/Qwen2.5-1.5B-openjev-GGUF

## Resumen

Qwen2.5-1.5B-openjev-GGUF es la version cuantizada en formato GGUF de un ajuste fino supervisado (LoRA SFT) sobre Qwen2.5-1.5B, orientado a un unico cometido muy especifico: resolver decisiones tipadas del conjunto de datos Open-Jev. Cada ejemplo consiste en un estado, una pregunta, un espacio de opciones y un objetivo decimal sobre esas opciones; el modelo debe responder con una sola letra de etiqueta que corresponda al argmax del objetivo. El autor es iromu, que publica tanto el modelo fusionado en BF16 como estos quants listos para llama.cpp.

El modelo no es un asistente conversacional general ni un generador de codigo: es un emisor de decisiones de un solo token de salida. Su relevancia practica esta en el uso como componente de enrutamiento o seleccion de herramientas, donde la salida debe ser una etiqueta discreta y el coste de inferencia debe ser minimo. Con 1.543.714.304 parametros totales y cuantizaciones que van de 986 MB a 3,09 GB, puede ejecutarse en hardware muy modesto.

La ficha se centra en la version GGUF; el modelo base fusionado esta en iromu/Qwen2.5-1.5B-openjev. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. No se dispone de datos sobre longitud de contexto en la informacion proporcionada, mas alla de lo que hereda de la arquitectura Qwen2.5 subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B), ajuste fino LoRA SFT |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (3,09 GB), Q8_0 (1,65 GB), Q5_K_M (1,13 GB), Q4_K_M (986 MB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base fusionado se distribuye aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-1.5B, un transformer decoder-only de 1,5 mil millones de parametros, y se ajusta mediante LoRA SFT durante 1191 pasos (una epoca), con batch global de 64 y aproximadamente 75.624 filas. No se emplea GRPO ni ninguna etapa de RL posterior: es exclusivamente SFT. La etapa de datos transforma cada fila reduciendo el objetivo decimal a su argmax, baraja las opciones de cada fila y escribe ese argmax como una unica letra de etiqueta. Las filas cuyo objetivo presenta empate (sin argmax) se excluyen del computo de la perdida, de modo que el modelo no se entrena sobre una eleccion adivinada.

El conjunto de datos es ZefanCai/Open-Jev (snapshot c67699e13d0ae25e35b77165a4b6b079bedc8aba), que aporta estado, pregunta, espacio de opciones y objetivo decimal. La innovacion tecnica del ajuste no esta en la arquitectura, sino en el formato de tarea: la respuesta es una sola letra y el turno termina en EOS, por lo que un `max_new_tokens` de 8 es mas que suficiente. El repositorio GGUF contiene los pesos cuantizados con llama.cpp; el modelo fusionado en BF16 se publica en el repositorio base.

## Capacidades

- Emision de decisiones tipadas: dada una pregunta con un espacio de opciones, devuelve una unica letra de etiqueta correspondiente al argmax del objetivo.
- Seleccion de herramientas en formato de eleccion entre opciones (tool-choice), sin generar una llamada a herramienta renderizada.
- Salida determinista y corta: termina en EOS tras la letra, lo que simplifica el parseo en produccion.
- Lectura de logprobs por opcion en llama.cpp, lo que permite puntuar la coherencia probabilistica de cada alternativa.
- Capacidad multilingue limitada al ingles segun la model card.
- No se declaran capacidades de vision, audio, razonamiento multi-paso ni agentes; el modelo esta especializado en una tarea de clasificacion de una sola etiqueta.
- No se documenta soporte de function calling generativo ni de modo thinking.

## Casos de uso

- Enrutamiento de herramientas en un pipeline de agentes: el modelo recibe el estado de la conversacion y la lista de herramientas disponibles como opciones, y devuelve la letra de la herramienta adecuada. Su salida de un solo token y su latencia minima lo hacen adecuado para un primer salto de enrutamiento antes de invocar un modelo mayor.
- Clasificacion de intenciones en atencion al cliente: cada intencion se presenta como una opcion y el modelo emite la etiqueta correspondiente, con la ventaja de que el formato de respuesta es trivial de validar (una sola letra).
- Seleccion de siguiente accion en un sistema de decision secuencial: dado un estado y un conjunto de acciones posibles, el modelo elige la accion con mayor probabilidad segun el objetivo aprendido, integrable en un bucle de control.
- Filtrado y triaje de tickets: las categorias de triaje se modelan como opciones y el modelo asigna una etiqueta por ticket, con coste de inferencia despreciable en CPU o GPU de gama baja.
- Puntuacion de alternativas mediante logprobs: en lugar de usar solo la letra emitida, se pueden leer las probabilidades por opcion para ordenar candidatos, util en sistemas de ranking o de recomendacion con opciones discretas.
- Despliegue en entornos con recursos limitados: con Q4_K_M (986 MB) puede ejecutarse en llama.cpp sobre CPU o en GPU consumer, lo que permite incorporar el modelo a aplicaciones de escritorio o dispositivos de borde para decisiones discretas.
- Evaluacion de coherencia probabilistica: al exponer logprobs por opcion, sirve como banco de pruebas para medir la coherencia de un emisor de etiquetas con pruebas metamorficas tipo JevBench.

## Benchmarks y rendimiento

Los datos disponibles son de validacion sobre el split `validation` de Open-Jev (n = 3495, greedy, `max_new_tokens=384`) y de coherencia con JevBench (suite `jevbench-mini`, tolerancia 0,05, temperatura 1,0).

| Quant | Emitidas | name_match | Coherencia global | REP | BAT | MEA | LOG | CHO |
|---|---|---|---|---|---|---|---|---|
| BF16 | 3495/3495 (100%) | 85,2% | 38,5 | 59,2 | 31,7 | 14,5 | 67,9 | 19,4 |
| Q4_K_M | 3495/3495 (100%) | 85,0% | 35,8 | 51,4 | 29,2 | 14,0 | 67,9 | 16,7 |
| Q5_K_M | 3495/3495 (100%) | 85,3% | 38,9 | 54,4 | 29,2 | 11,5 | 72,9 | 26,4 |
| Q8_0 | 3495/3495 (100%) | 85,4% | 39,2 | 57,8 | 33,3 | 15,4 | 68,8 | 20,8 |

Todas las cuantizaciones quedan a menos de 0,4 puntos porcentuales del modelo fusionado en BF16 en `name_match`, lo que el autor interpreta como ruido sobre un split de 3495 filas. En coherencia, Q4_K_M es la mas baja (35,8, -2,7 respecto a BF16), mientras que Q5_K_M (38,9) y Q8_0 (39,2) se situan en o por encima de la linea base BF16 (38,5). La dimension MEA (coherencia de medida de probabilidad) es la mas debil en todas las cuantizaciones. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q4_K_M, 1,2 GB con Q5_K_M, 1,7 GB con Q8_0 y 3,1 GB con BF16, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060 o superiores para mayor comodidad. En GPU de datacenter (A100, H100) el modelo esta sobredimensionado en capacidad y solo tendria sentido por agregacion de peticiones.
- Cabe en GPU consumer: si, en todas las cuantizaciones, incluidas GPUs de gama baja y en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y otros runtimes compatibles con GGUF. No se documenta soporte para vLLM ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. La salida es de un solo token seguido de EOS, por lo que la latencia dominante sera el prefill de la pregunta y las opciones, no la decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-openjev-GGUF | 1,54 B | no disponible | Decision tipada de una etiqueta | Apache 2.0 | GGUF en Hugging Face |
| Qwen2.5-1.5B (base) | 1,54 B | no disponible | Generacion de texto general | Apache 2.0 | Safetensors y GGUF |
| Qwen2.5-1.5B-openjev (fusionado) | 1,54 B | no disponible | Decision tipada de una etiqueta | Apache 2.0 | Safetensors BF16 |

La comparacion relevante es con el Qwen2.5-1.5B original, que es un modelo generalista y no esta especializado en la emision de etiquetas; y con el modelo fusionado del mismo autor, que ofrece la misma tarea en BF16 con mayor coherencia que Q4_K_M pero mayor tamano. No se dispone de datos de benchmarks comparativos con otros modelos especializados en decision tipada en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea: no debe usarse como asistente conversacional general ni como generador de codigo.
- La coherencia probabilistica es baja en terminos absolutos (38,5 en BF16 sobre JevBench), con la dimension MEA especialmente debil: el emisor de letras es sobreconfiado y no preserva la media bajo transformacion.
- El `name_match` se situa en torno al 85%, lo que implica que aproximadamente una de cada siete decisiones no coincide con el argmax del objetivo.
- El unico idioma declarado es el ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- No se dispone de informacion sobre la longitud de contexto efectiva del ajuste, mas alla de la del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no documenta evaluaciones de sesgo.
- Riesgo de alucinacion en el sentido de emitir una letra valida aunque ninguna opcion sea adecuada; el formato de una sola letra oculta la incertidumbre salvo que se lean los logprobs.
- Para produccion, conviene validar que la letra emitida pertenece al conjunto de opciones y tratar los casos fuera de distribucion con una ruta de respaldo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/iromu/Qwen2.5-1.5B-openjev-GGUF
- Modelo base fusionado: https://huggingface.co/iromu/Qwen2.5-1.5B-openjev
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset Open-Jev: https://huggingface.co/datasets/ZefanCai/Open-Jev
- JevBench: https://github.com/JevBench/jevbench
