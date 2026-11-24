# flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-English10pct

## Resumen

SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-English10pct es un ajuste fino supervisado (SFT) de Qwen2.5-Math-7B, publicado por el investigador flaitenberger en Hugging Face. El modelo forma parte de los experimentos del articulo *Spinning Straw into Gold: Small Amounts of Synthetic Derivations Improve Reasoning in Instruction-Tuned Models*, actualmente en revision. La tesis del trabajo es que una pequena proporcion de datos sinteticos de deduccion logica, generados por un programa y no por otro modelo, mejora el razonamiento multi-paso de modelos ya instruidos.

El modelo se entrena sobre una mezcla de 100.000 ejemplos: 90.000 instrucciones de Dolci-Instruct-SFT-No-Tools y 10.000 problemas de deduccion generados (10 % de la mezcla sustituida). Los problemas son deducciones ground de clausulas de Horn sobre constantes abstractas, con reglas encadenadas de hasta 25 niveles, reglas distractoras y cuatro respuestas candidatas; cada derivacion se verifica con un comprobador simbolico, por lo que son correctas por construccion y no contienen conocimiento del mundo.

Es relevante porque demuestra que datos sinteticos verificables y sin modelo en el bucle pueden mejorar el razonamiento logico con un coste de datos minimo, manteniendo el rendimiento general en benchmarks estandar. El modelo tiene 7.615.616.512 parametros, contexto extendido a 8192 tokens mediante YaRN y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino completo de Qwen2.5-Math-7B |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (rope scaling YaRN, factor 2.0, original 4096) |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en bf16 safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Math-7B, un transformer decoder-only denso de la familia Qwen2. Antes del ajuste fino, el autor extendio la ventana de contexto de 4096 a 8192 posiciones mediante rope scaling YaRN con factor 2.0, y la configuracion conserva ese ajuste. El entrenamiento consistio en SFT de parametros completos durante una epoca sobre 100.000 ejemplos de chat de un solo turno, con learning rate 5e-06, schedule lineal, warmup ratio 0.03, batch global de 128, longitud maxima de secuencia 8192 (el run aborta si mas del 0.5 % de los targets se truncarian), precision mixta bf16, FSDP con sharding completo y gradient checkpointing. La perdida se calcula solo sobre los tokens del asistente, enmascarando el prompt, con la plantilla de chat de Qwen2.5.

La innovacion esta en los datos: los 10.000 problemas de deduccion son deducciones ground de clausulas de Horn generadas por un programa corto, sin ningun modelo en el bucle. Cada problema incluye hechos sobre constantes (palabras de color, arbol y direccion), reglas if-then encadenadas de hasta 25 capas, reglas distractoras que nunca se activan y una pregunta con cuatro opciones. El target deriva la respuesta paso a paso, en ingles o en notacion formal con constantes y predicados declarados y lineas numeradas y justificadas, y un comprobador simbolico valida cada derivacion. La mezcla corresponde a la configuracion `nl_exact_p10` del dataset SpinningStrawIntoGold-SFT-Mixtures; las filas de Dolci se muestrearon con semilla 3407 y son identicas entre mezclas salvo el tramo sustituido. Este repositorio contiene el run `seed3408`.

## Capacidades

- Generacion de texto y conversacion de un solo turno con la plantilla de chat de Qwen2.5.
- Razonamiento deductivo multi-paso: derivaciones encadenadas con conclusiones intermedias y justificacion por linea.
- Razonamiento logico formal en notacion con constantes, predicados y lineas numeradas verificables por un comprobador simbolico.
- Generacion de derivaciones largas aceptadas por un verificador simbolico incluso con solo un 1 % de datos de deduccion en la mezcla, segun el articulo.
- Matematicas: herencia del base Qwen2.5-Math, con GSM8K de 83.9 en la evaluacion del autor.
- Codigo: soporte de generacion de codigo (HumanEval 42.1, MBPP 58.2).
- Respuesta directa a preguntas de logica sin cadena de pensamiento explicita (ProofWriter depth 0, respuesta directa: 57.2).
- Capacidades multilingues limitadas al ingles: el modelo esta entrenado y etiquetado solo para `en`.
- Tool calling / function calling: no documentado en la model card; la mezcla usa Dolci-Instruct-SFT-No-Tools, por lo que no se entreno con herramientas.
- Modo thinking explicito, vision o audio: no disponible.

## Casos de uso

- Razonamiento logico verificable en pipelines de evaluacion: el modelo puede generar derivaciones paso a paso en notacion formal que un comprobador simbolico valida automaticamente, lo que permite usarlo como generador de cadenas de razonamiento auditables en entornos de investigacion.
- Generacion de datos sinteticos de razonamiento: dado que el modelo produce derivaciones largas aceptadas por verificadores con pocos datos de deduccion, puede emplearse para crear corpus de entrenamiento de logica multi-paso con validacion automatica.
- Investigacion sobre mezclas de datos de instruccion: sirve como punto de comparacion controlado frente al baseline de la misma mezcla, ya que comparte filas de Dolci y solo cambia el 10 % sustituido, lo que facilita estudios de ablacion.
- Tareas de deduccion multi-paso en dominios abstractos: resolucion de problemas con reglas encadenadas y distractores, adecuada para prototipos de sistemas expertos con logica proposicional o de primer orden simplificada.
- Asistencia en matematicas a nivel de secundaria y competicion basica: con GSM8K de 83.9, puede integrarse en tutores automaticos que explican pasos intermedios en ingles.
- Generacion de codigo en prototipos: con HumanEval de 42.1 y MBPP de 58.2, es util para autocompletado y generacion de funciones en herramientas de desarrollo internas, no para produccion critica.
- Evaluacion de robustez logica: util para estudiar sesgos de etiqueta en modelos instruidos, ya que el articulo reporta que el modelo deja de preferir una etiqueta de respuesta sobre las demas.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados con el baseline del mismo run (misma mezcla sin los datos de deduccion):

| Benchmark | Este modelo | Baseline | Diferencia |
|---|---|---|---|
| ARC-Challenge | 45.0 | 43.9 | +1.0 |
| GSM8K | 83.9 | 83.6 | +0.2 |
| MMLU | 56.8 | 57.8 | -1.0 |
| HellaSwag | 61.2 | 61.4 | -0.2 |
| LogiQA (AGIEval) | 29.5 | 29.5 | +0.0 |
| BBH | 67.7 | 67.8 | -0.1 |
| HumanEval | 42.1 | 37.2 | +4.9 |
| MBPP | 58.2 | 57.8 | +0.4 |
| BoolQ | 77.1 | 75.9 | +1.2 |
| IFEval (strict) | 39.2 | 38.1 | +1.1 |
| RACE | 37.8 | 38.1 | -0.3 |
| SciQ | 94.3 | 94.2 | +0.1 |
| TruthfulQA-MC2 | 47.4 | 46.9 | +0.5 |
| FOLIO | 47.8 | 45.3 | +2.5 |
| GPQA-Diamond | 40.4 | 40.4 | +0.0 |
| ProofWriter depth 0, chain-of-thought | 49.8 | 57.4 | -7.6 |
| ProofWriter depth 1, chain-of-thought | 40.0 | 43.2 | -3.2 |
| ProofWriter depth 2, chain-of-thought | 42.6 | 45.8 | -3.2 |
| ProofWriter depth 3, chain-of-thought | 41.8 | 46.4 | -4.6 |
| ProofWriter depth 5, chain-of-thought | 37.8 | 42.8 | -5.0 |
| ProofWriter depth 0, direct answer | 57.2 | 51.2 | +6.0 |

La model card se interrumpe en la fila de ProofWriter depth (respuesta directa); el resto de resultados de esa variante no esta disponible en la informacion proporcionada. El articulo reporta ademas que, sobre Qwen2.5-7B, sustituir entre el 5 y el 25 % de la mezcla eleva la precision entre 5 y 16 puntos en ProofWriter, hasta 6 puntos en FOLIO y hasta 7 puntos en las subtareas multi-paso de BIG-Bench Hard, y que la ganancia en ProofWriter se mantiene en 5 modelos de 3 familias entre 3B y 14B parametros con el renderizado en ingles.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 15,2 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, en torno a 8 GB; en 4 bits, en torno a 4-5 GB (estimaciones a partir del tamano del repo, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para bf16 con contexto completo de 8192 tokens; RTX 4090 (24 GB) suficiente para bf16 en longitudes moderadas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y en RTX 3090 (24 GB) en bf16; en GPUs de 12-16 GB requiere cuantizacion (8 o 4 bits) mediante llama.cpp, Ollama o similar.
- Opciones de despliegue: transformers, text-generation-inference (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp u Ollama tras convertir a GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-English10pct | 7,6B | 8192 | apache-2.0 | SFT con 10 % de deducciones sinteticas; HumanEval 42.1, FOLIO 47.8 |
| Qwen2.5-Math-7B (base) | 7,6B | 4096 (extensible) | apache-2.0 | Base sin ajuste de instrucciones; sin resultados comparables en esta ficha |
| SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-Baseline | 7,6B | 8192 | apache-2.0 | Misma mezcla sin datos de deduccion; HumanEval 37.2, FOLIO 45.3 |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y etiquetado unicamente en ingles; no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- Es un modelo de investigacion derivado de un articulo en revision; no hay preprint disponible y los resultados deben tratarse como preliminares.
- El ajuste fino puede degradar capacidades generales: MMLU baja 1.0 punto, HellaSwag 0.2 y RACE 0.3 respecto al baseline.
- En ProofWriter con chain-of-thought, el modelo empeora entre 3.2 y 7.6 puntos respecto al baseline en todas las profundidades reportadas; la mejora se concentra en la respuesta directa (depth 0: +6.0).
- Riesgo de alucinacion: aunque las derivaciones de entrenamiento son correctas por construccion, el modelo no incorpora conocimiento del mundo y puede generar derivaciones plausibles pero invalidas fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no documentados en la model card; el articulo menciona que parte de la mejora en ProofWriter proviene de que el modelo deja de preferir una etiqueta de respuesta sobre las demas, lo que sugiere un sesgo de etiqueta en el baseline.
- No se entreno con herramientas (Dolci-Instruct-SFT-No-Tools), por lo que no debe esperarse soporte fiable de tool calling.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Math-7B y los datasets de origen pueden tener sus propios terminos que conviene revisar.
- El contexto de 8192 tokens depende del rope scaling YaRN configurado; usos por encima de esa longitud no estan soportados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-English10pct
- Todos los runs de la mezcla: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds
- Baseline del mismo run: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-Baseline
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-7B
- Dataset de mezclas SFT: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures
- Configuracion `nl_exact_p10`: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures/viewer/nl_exact_p10
- Dataset Dolci-Instruct-SFT-No-Tools: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-No-Tools
- Preprint del articulo: no disponible (se anadira segun el autor)
