# flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-English10pct

## Resumen

SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-English10pct es un ajuste fino supervisado (SFT) de Qwen2.5-7B desarrollado por flaitenberger en el marco de la investigacion *Spinning Straw into Gold: Small Amounts of Synthetic Derivations Improve Reasoning in Instruction-Tuned Models*, actualmente en revision. El modelo parte de los pesos completos de Qwen2.5-7B (7.615.616.512 parametros) y se entrena sobre una mezcla de 100.000 ejemplos de instruccion en la que un 10% de las filas (10.000) se sustituyen por problemas de deduccion multi-paso generados por un programa corto, sin intervencion de otro modelo de lenguaje.

La propuesta es metodologica: los datos sinteticos de deduccion son deducciones ground sobre clausulas de Horn con constantes abstractas, correctas por construccion y sin conocimiento del mundo. El objetivo es medir si una fraccion pequena de este tipo de datos mejora el razonamiento logico de un modelo de instruccion sin degradar los benchmarks generales. El repositorio publicado corresponde a la ejecucion `seed3407` de la configuracion `nl_exact_p10`.

El interes practico es doble: por un lado, el modelo sirve como referencia reproducible de la tecnica; por otro, sus resultados muestran ganancias notables en ProofWriter con respuesta directa (hasta +14,4 puntos de precision en profundidad 3) y en BIG-Bench Hard (+2,0), con un coste pequeno en otros benchmarks. La licencia Apache 2.0 y el formato bf16 safetensors lo hacen directamente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino completo sobre Qwen2.5-7B |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens durante el entrenamiento (la longitud nativa de Qwen2.5-7B no se detalla en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen2.5-7B original y se entrena con ajuste fino supervisado de parametros completos durante una epoca sobre 100.000 ejemplos de chat de un solo turno. La configuracion concreta es: learning rate 5e-06 con schedule lineal y warmup ratio 0,03, batch global de 128, longitud maxima de secuencia de 8.192 tokens (la ejecucion aborta si mas del 0,5% de los objetivos se truncarian), precision mixta bf16, FSDP con sharding completo y gradient checkpointing. La perdida se calcula solo sobre los tokens del asistente, enmascarando el prompt, y se aplica la plantilla de chat de Qwen2.5. Se publica el checkpoint final.

La mezcla `Dolci100k-English10pct` combina 90.000 ejemplos de instruccion de `allenai/Dolci-Instruct-SFT-No-Tools` (muestreados con semilla 3407) con 10.000 problemas de deduccion generados. Estos problemas consisten en hechos sobre constantes abstractas (`c0`, `c1`, ...) con palabras de color, arbol y direccion, reglas if-then que encadenan hasta 25 capas, reglas distractoras que nunca se activan y una pregunta con cuatro respuestas candidatas. El objetivo incluye una derivacion paso a paso en ingles o en notacion formal con constantes y predicados declarados y lineas numeradas y justificadas; un verificador simbolico valida cada derivacion. El codigo de entrenamiento es `scripts/train_instruction_sft.py` del codebase synthetic-RLVL (Hugging Face Trainer con FSDP), y el archivo `provenance.json` registra la ejecucion de origen, los argumentos de entrenamiento y los ficheros de evaluacion.

## Capacidades

- Generacion de texto conversacional de un solo turno en ingles, heredada del ajuste de instruccion de Qwen2.5-7B.
- Razonamiento deductivo multi-paso: derivacion de conclusiones encadenando reglas, con soporte explicito para cadenas de hasta 25 capas en el dominio de entrenamiento.
- Generacion de derivaciones largas verificables por un comprobador simbolico (segun el paper, un 1% de la mezcla basta para que el modelo escriba derivaciones que el checker acepta).
- Respuesta directa y razonamiento con cadena de pensamiento (chain-of-thought) en tareas de deduccion tipo ProofWriter y FOLIO.
- Razonamiento de sentido comun y tareas de BIG-Bench Hard, con mejora medida de +2,0 puntos en BBH.
- Generacion de codigo (HumanEval 66,5; MBPP 65,0) y matematicas (GSM8K 75,4).
- Soporte de tool calling / function calling: no disponible; la mezcla de entrenamiento usa explicitamente la variante Dolci sin herramientas.
- Soporte de agentes y multi-step reasoning: parcial, limitado al razonamiento deductivo; no se documentan capacidades de agente.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: thinking mode, vision o audio no disponibles.

## Casos de uso

- Evaluacion de tecnicas de datos sinteticos: el modelo sirve como referencia reproducible (semilla 3407, configuracion `nl_exact_p10`) para comparar el efecto de sustituir un 5-25% de una mezcla SFT por deducciones generadas por programa frente a una linea base entrenada con las mismas filas originales.
- Razonamiento logico en dominios formales: resolucion de problemas de deduccion con reglas encadenadas y distractores, adecuado para prototipos de sistemas expertos o verificacion de inferencias sobre bases de conocimiento con reglas de Horn.
- Generacion de explicaciones paso a paso: produccion de derivaciones numeradas y justificadas que pueden validarse con un checker simbolico, util para pipelines de generacion de datos de entrenamiento verificables.
- Investigacion en interpretabilidad del razonamiento: el paper identifica dos efectos (arrastrar conclusiones intermedias y eliminar el sesgo hacia una etiqueta de respuesta), lo que permite disenar experimentos controlados sobre estos mecanismos con este checkpoint.
- Tareas de comprension lectora y sentido comun en ingles: con contexto de 8.192 tokens y resultados solidos en BoolQ (86,2), HellaSwag (73,4) y RACE (44,3), sirve para clasificacion y respuesta a preguntas sobre documentos.
- Generacion de codigo asistida: con HumanEval 66,5 y MBPP 65,0, puede integrarse en asistentes de programacion en ingles para autocompletado y explicacion de funciones, aunque sin soporte de herramientas.
- Fine-tuning posterior: al publicarse en bf16 safetensors con licencia Apache 2.0, es una base viable para SFT o DPO adicionales en tareas de razonamiento.

## Benchmarks y rendimiento

Resultados de accuracy, exact match o pass@k reportados en la model card, comparados con la linea base de la misma ejecucion (misma mezcla sin las filas de deduccion):

| Benchmark | Este modelo | Baseline | Diferencia |
|---|---|---|---|
| ARC-Challenge | 48,0 | 48,9 | -0,9 |
| GSM8K | 75,4 | 75,9 | -0,5 |
| MMLU | 70,4 | 70,4 | +0,0 |
| HellaSwag | 73,4 | 73,2 | +0,3 |
| LogiQA (AGIEval) | 35,5 | 35,5 | +0,0 |
| BBH | 66,8 | 64,8 | +2,0 |
| HumanEval | 66,5 | 65,9 | +0,6 |
| MBPP | 65,0 | 64,4 | +0,6 |
| BoolQ | 86,2 | 86,7 | -0,5 |
| IFEval (strict) | 42,0 | 42,0 | +0,0 |
| RACE | 44,3 | 45,4 | -1,1 |
| SciQ | 96,9 | 96,8 | +0,1 |
| TruthfulQA-MC2 | 51,2 | 50,6 | +0,6 |
| FOLIO | 54,7 | 53,7 | +1,0 |
| GPQA-Diamond | 34,3 | 38,9 | -4,5 |
| ProofWriter depth 0, CoT | 51,8 | 55,4 | -3,6 |
| ProofWriter depth 1, CoT | 40,4 | 44,6 | -4,2 |
| ProofWriter depth 2, CoT | 41,0 | 42,8 | -1,8 |
| ProofWriter depth 3, CoT | 44,2 | 42,0 | +2,2 |
| ProofWriter depth 5, CoT | 43,6 | 38,8 | +4,8 |
| ProofWriter depth 0, directa | 55,8 | 50,4 | +5,4 |
| ProofWriter depth 1, directa | 38,6 | 30,6 | +8,0 |
| ProofWriter depth 2, directa | 51,6 | 39,6 | +12,0 |
| ProofWriter depth 3, directa | 54,2 | 39,8 | +14,4 |
| ProofWriter depth 5, directa | 53,0 | 42,0 | +11,0 |

Segun el paper, en Qwen2.5-7B sustituir entre el 5% y el 25% de la mezcla eleva la precision entre 5 y 16 puntos en ProofWriter, hasta 6 puntos en FOLIO y hasta 7 puntos en las subtareas multi-paso de BIG-Bench Hard, mientras los benchmarks generales se mantienen en gran medida sin cambios. La ganancia en ProofWriter se replica en 5 modelos de 3 familias entre 3B y 14B parametros con el renderizado en ingles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud para un modelo de 7,6B parametros: aproximadamente 15,2 GB en bf16 (tamano del repo), unos 8 GB en cuantizacion de 8 bits y unos 4-5 GB en 4 bits, aunque el autor no publica estos calculos.
- GPU recomendadas: no disponible en la informacion proporcionada. Para bf16 sin cuantizar se requiere una GPU con al menos 16-24 GB de memoria; para cuantizaciones de 4 bits cabria en GPUs de consumo con 8 GB o mas.
- Cabe en consumer GPU: previsiblemente si en cuantizacion de 4 bits; en bf16 completo requiere GPUs de gama alta o profesionales.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no se confirman en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-English10pct | 7,6B | 8.192 (entrenamiento) | SFT con 10% de deducciones sinteticas | Apache 2.0 | Hugging Face (36 descargas) |
| Qwen2.5-7B (base) | 7,6B | no disponible en esta ficha | Modelo base de proposito general | Apache 2.0 | Hugging Face |
| SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-Baseline | 7,6B | 8.192 (entrenamiento) | SFT con la mezcla sin deducciones | Apache 2.0 | Hugging Face |
| SpinningStrawIntoGold-Qwen2.5-7B-SFT-AllSeeds | 7,6B | 8.192 (entrenamiento) | Conjunto de ejecuciones del mismo experimento | Apache 2.0 | Hugging Face |

La comparativa directa mas informativa es contra la linea base de la misma ejecucion, ya que aisla el efecto de los datos de deduccion. Frente a Qwen2.5-7B sin ajustar no se aportan resultados en la informacion disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta evaluado y previsiblemente sera inferior al del modelo base.
- El ajuste es de un solo turno; no se documenta soporte conversacional multi-turno ni de herramientas, y la mezcla de entrenamiento excluye explicitamente ejemplos con tools.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas mas alla de TruthfulQA-MC2 (51,2), un valor moderado que no descarta respuestas factualmente incorrectas.
- Degradacion en algunos benchmarks: GPQA-Diamond cae 4,5 puntos, RACE 1,1 y ARC-Challenge 0,9 respecto a la linea base; en ProofWriter con cadena de pensamiento las profundidades 0 y 1 empeoran (-3,6 y -4,2).
- El dominio de deduccion de entrenamiento es abstracto (constantes, reglas de Horn, sin conocimiento del mundo); la transferencia a dominios reales no esta garantizada y el propio paper senala que parte de la ganancia en BBH requiere los datos de deduccion.
- Modelo de investigacion con 36 descargas y sin likes; el paper esta en revision y no hay preprint enlazado, por lo que los resultados deben tratarse como preliminares.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantia alguna sobre el comportamiento en produccion.
- No se documentan cuantizaciones oficiales ni recetas de despliegue validadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-English10pct
- Conjunto de ejecuciones del experimento: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-SFT-AllSeeds
- Linea base de la misma ejecucion: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-Baseline
- Dataset de mezclas SFT: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures
- Configuracion `nl_exact_p10` del dataset: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures/viewer/nl_exact_p10
- Dataset de instrucciones Dolci: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-No-Tools
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
