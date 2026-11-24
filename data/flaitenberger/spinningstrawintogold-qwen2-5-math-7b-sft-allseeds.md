# flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds

## Resumen

SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds es un repositorio agregado que recoge todos los ajustes supervisados (SFT) realizados sobre Qwen2.5-Math-7B en el marco de los experimentos del articulo *Spinning Straw into Gold: Small Amounts of Synthetic Derivations Improve Reasoning in Instruction-Tuned Models* (en revision en el momento de publicacion). Lo desarrolla el usuario de Hugging Face flaitenberger y su interes no esta en ser un modelo unico, sino en servir como artefacto reproducible: cada carpeta contiene un modelo completo entrenado con una mezcla de datos distinta y una semilla distinta, junto con sus argumentos de entrenamiento y los resultados de lm-evaluation-harness.

El problema que aborda es la calidad del dato sintetico para el razonamiento deductivo. Frente al uso dominante de datos generados por otro modelo, estos experimentos emplean problemas de deduccion multi-salto generados por un programa corto, sin modelo en el bucle: deducciones ground sobre clausulas de Horn con constantes abstractas, correctas por construccion y sin conocimiento del mundo. Sustituyendo entre el 5 % y el 25 % de una mezcla de instruction tuning por estos documentos, manteniendo fijo el numero de ejemplos, se observan mejoras de 5 a 16 puntos en ProofWriter, hasta 6 en FOLIO y hasta 7 en las subtareas multi-paso de BIG-Bench Hard sobre Qwen2.5-7B.

Arquitectonicamente cada modelo es un transformer decoder-only denso de la familia Qwen2.5, con 7.000 millones de parametros y pesos en bf16 safetensors. El repositorio ocupa 121,9 GB porque alberga multiples ejecuciones (tres mezclas por varias semillas), no un solo conjunto de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5), fine-tuning por SFT |
| Parametros totales | 7.000 millones (heredados de Qwen2.5-Math-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), tokenizer incluido, compatible con transformers |
| Tamano del repositorio | 121,9 GB (multiples ejecuciones) |
| Modelo base | Qwen/Qwen2.5-Math-7B |
| Datasets de entrenamiento | flaitenberger/SpinningStrawIntoGold-SFT-Mixtures, allenai/Dolci-Instruct-SFT-No-Tools |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

Cada modelo del repositorio es un ajuste supervisado completo de Qwen2.5-Math-7B, sin cambios arquitectonicos: se conserva el transformer decoder-only denso de 7B del modelo base y se entrena sobre mezclas de 100.000 ejemplos. Todas las mezclas comparten las mismas filas de Dolci-Instruct-SFT-No-Tools salvo la porcion sustituida, de modo que las comparaciones aislan el efecto del dato de deduccion. Se publican tres configuraciones: `Dolci100k-Baseline` (100k ejemplos Dolci, sin derivaciones), `Dolci100k-English10pct` (90k Dolci + 10k problemas de deduccion con derivacion paso a paso en ingles) y `Dolci100k-Formal05pct` (95k Dolci + 5k problemas con derivacion formal).

Los datos sinteticos son deducciones ground sobre clausulas de Horn: hechos sobre constantes abstractas (palabras de color, arbol y direccion), reglas si-entonces que encadenan hasta 25 niveles, reglas distractoras que nunca se disparan y una pregunta con cuatro respuestas candidatas. El objetivo deriva la respuesta paso a paso, en ingles o en notacion formal con constantes y predicados declarados y lineas numeradas y justificadas; un verificador simbolico valida cada derivacion. No se menciona RLHF ni DPO: el procedimiento es SFT puro sobre mezclas fijas, con multiples semillas por configuracion (3407, 3408, 3409) para estimar la varianza. Cada carpeta incluye `provenance.json` con la ejecucion de origen y los argumentos de entrenamiento, y los ficheros de resultados de lm-evaluation-harness en `eval/`.

## Capacidades

- Generacion de texto y razonamiento deductivo multi-paso, con enfasis en deducciones encadenadas sobre clausulas de Horn.
- Produccion de derivaciones paso a paso, tanto en lenguaje natural (ingles) como en notacion formal verificable por un comprobador simbolico.
- Razonamiento matematico y resolucion de problemas aritmeticos (herencia de Qwen2.5-Math-7B, con GSM8K medido en la tabla de resultados).
- Seguimiento de instrucciones, evaluado con IFEval en los modelos publicados.
- Razonamiento de sentido comun y logica de primer orden, medido con FOLIO y ProofWriter.
- Capacidad de escribir derivaciones largas aceptadas por un verificador simbolico con solo un 1 % de la mezcla dedicada a datos de deduccion (hallazgo del articulo).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o multi-step tool use: no disponible; los datos de entrenamiento excluyen explicitamente herramientas (Dolci-Instruct-SFT-No-Tools).
- Vision, audio o modo thinking explicito: no disponible.

## Casos de uso

- Investigacion sobre calidad de datos sinteticos: el repositorio permite reproducir el experimento completo, comparando por semilla y por mezcla el efecto de sustituir entre el 5 % y el 25 % de una mezcla de instruction tuning por deducciones generadas programaticamente.
- Evaluacion de robustez frente a la varianza de semilla: al publicar tres semillas por configuracion con sus resultados de lm-evaluation-harness, sirve para estimar la dispersion de las metricas antes de decidir si una mejora es real.
- Generacion de cadenas de razonamiento verificables: el modelo puede producir derivaciones formales con lineas numeradas y justificadas que un comprobador simbolico acepta, util para construir pipelines de datos con validacion automatica.
- Fine-tuning de razonamiento logico en dominios cerrados: como punto de partida para tareas de deduccion sobre reglas y hechos (cumplimiento normativo, sistemas expertos, configuracion) donde el conocimiento del mundo es irrelevante y prima la correccion del encadenamiento.
- Base para experimentos de destilacion de razonamiento: sus derivaciones en ingles o en notacion formal pueden emplearse como datos de entrenamiento para modelos menores, dado que el articulo reporta que la mejora en ProofWriter se mantiene en 5 modelos de 3 familias entre 3B y 14B parametros.
- Evaluacion comparativa de metodos de instruction tuning: la mezcla baseline y las dos variantes con derivaciones permiten medir el coste o beneficio de sustituir datos generales por datos sinteticos de logica en benchmarks como MMLU, GSM8K e IFEval.
- Analisis de sesgo de etiqueta en modelos deductivos: el articulo atribuye parte de la mejora a que el modelo deja de preferir una etiqueta de respuesta sobre las demas, lo que convierte estos pesos en material para estudiar ese fenomeno.

## Benchmarks y rendimiento

Resultados en porcentaje, de lm-evaluation-harness, un modelo por fila. Una celda vacia indica que el benchmark no se ejecuto sobre ese modelo. La columna BBH corresponde al agregado de BIG-Bench Hard; ProofWriter se mide en d3 con chain-of-thought.

| Mezcla | Semilla | ProofWriter d3 (CoT) | FOLIO | BBH | GPQA-Diamond | MMLU | GSM8K | IFEval |
|---|---|---|---|---|---|---|---|---|
| Dolci100k-Baseline | 3408 | 46,4 | 45,3 | 67,8 | 40,4 | 57,8 | 83,6 | 38,1 |
| Dolci100k-Baseline | 3409 | 44,0 | 47,8 | 67,7 | 30,8 | 57,7 | 82,9 | 37,9 |
| Dolci100k-English10pct | 3407 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Dolci100k-English10pct | 3408 | 41,8 | 47,8 | 67,7 | 40,4 | 56,8 | 83,8 | 39,2 |
| Dolci100k-English10pct | 3409 | 40,0 | 46,3 | 67,7 | 30,3 | 57,1 | 84,0 | 37,0 |
| Dolci100k-Formal05pct | 3407 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Dolci100k-Formal05pct | 3408 | 40,0 | 47,8 | 67,6 | 38,9 | 57,7 | 83,6 | 39,4 |
| Dolci100k-Formal05pct | 3409 | 45,6 | 47,8 | 67,9 | 36,9 | no disponible | no disponible | 37,7 |

Nota importante: la model card indica que el articulo reporta medias sobre ejecuciones y que las mejoras de 5 a 16 puntos en ProofWriter, hasta 6 en FOLIO y hasta 7 en subtareas multi-paso de BBH se observan sobre Qwen2.5-7B. La tabla publicada en el repositorio, correspondiente a Qwen2.5-Math-7B con semillas individuales, no reproduce de forma consistente esas ganancias en ProofWriter para las semillas disponibles (por ejemplo, 41,8 y 40,0 en English10pct frente a 46,4 y 44,0 del baseline con las mismas semillas 3408 y 3409). No se han publicado en la informacion disponible resultados agregados por mezcla para este modelo base concreto.

## Requisitos de hardware

- Inferencia en bf16: al tratarse de un modelo denso de 7B, se requiere aproximadamente 14 GB solo para pesos, mas cache KV y overhead; en la practica, 24 GB de VRAM son el minimo comodo para contexto moderado.
- Cuantizacion: los pesos publicados estan en bf16 safetensors; no se distribuyen variantes GGUF, AWQ ni GPTQ en el repositorio. Cualquier cuantizacion a 8 o 4 bits (aproximadamente 7 GB y 4 GB de pesos respectivamente) tendria que generarla el usuario.
- GPU consumer: cabe en RTX 4090 (24 GB) y en RTX 3090 (24 GB) en bf16 para contexto corto; en GPUs de 16 GB o menos seria necesario cuantizar.
- GPU de datacenter: A100 40/80 GB, H100 y L40S son adecuadas, tanto para inferencia como para reentrenar o evaluar las distintas semillas.
- Despliegue: compatible con transformers y con endpoints de Hugging Face (tag `endpoints_compatible`). vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion proporcionada, aunque al ser un transformer Qwen2 estandar son opciones plausibles previa conversion.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 121,9 GB; conviene descargar unicamente la carpeta de la mezcla y semilla de interes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds | 7B | no disponible | SFT con deducciones sinteticas verificadas | Apache 2.0 | Hugging Face (repo agregado, 121,9 GB) |
| Qwen2.5-Math-7B (base) | 7B | no disponible en la informacion proporcionada | Modelo matematico preentrenado y alineado | Apache 2.0 | Hugging Face |
| SpinningStrawIntoGold-Qwen2.5-7B (variante del articulo) | 7B | no disponible | Mismo metodo sobre Qwen2.5-7B generalista; es donde el articulo reporta las ganancias principales | no disponible | no disponible como repositorio en la informacion proporcionada |
| Dolci100k-Baseline (misma familia, misma semilla) | 7B | no disponible | SFT solo con Dolci-Instruct, sin derivaciones | Apache 2.0 | Incluido en este mismo repositorio |

La comparacion mas informativa es interna: el baseline Dolci100k frente a las variantes English10pct y Formal05pct con las mismas semillas, que aisla el efecto del dato de deduccion sin cambiar modelo base ni receta. Frente a otros modelos de 7B de proposito general no hay datos de benchmarks en la informacion disponible para establecer una comparacion justa.

## Limitaciones y advertencias

- El repositorio no es un modelo unico: contiene multiples ejecuciones en subcarpetas. Cargar la raiz del repositorio no produce un modelo funcional; hay que apuntar a `-<Mixture>/seed<S>/`.
- Los resultados publicados por semilla para Qwen2.5-Math-7B no muestran de forma consistente las ganancias descritas en el articulo, que se reportan sobre Qwen2.5-7B y como medias sobre ejecuciones. No debe asumirse que este checkpoint concreto mejora el baseline en ProofWriter.
- Solo se declara soporte de ingles (`language: en`). El rendimiento en castellano no esta evaluado y previsiblemente degradado respecto al modelo base.
- El entrenamiento excluye herramientas (Dolci-Instruct-SFT-No-Tools): no hay evidencia de soporte fiable de function calling ni de uso como agente.
- Los datos sinteticos son deducciones sobre constantes abstractas sin conocimiento del mundo; el modelo puede generalizar peor a tareas de logica que requieran semantica real.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo de 7B, puede producir derivaciones formalmente plausibles pero invalidas si no se validan con un comprobador externo.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad en la model card.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen2.5-Math-7B arrastra sus propias condiciones; conviene revisarlas antes de desplegar en produccion.
- El articulo esta en revision y no hay enlace a preprint en la informacion proporcionada; los resultados deben tratarse como preliminares.
- El tamano del repositorio (121,9 GB) y la ausencia de cuantizaciones publicadas complican el despliegue en entornos con VRAM limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds
- Modelo base Qwen2.5-Math-7B: https://huggingface.co/Qwen/Qwen2.5-Math-7B
- Dataset de mezclas SFT: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures
- Dataset Dolci-Instruct-SFT-No-Tools: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-No-Tools
- Ejecucion baseline, semilla 3408: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds/tree/main/Qwen2.5-Math-7B-Dolci100k-Baseline/seed3408
- Ejecucion baseline, semilla 3409: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds/tree/main/Qwen2.5-Math-7B-Dolci100k-Baseline/seed3409
- Ejecucion English10pct, semilla 3407: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds/tree/main/Qwen2.5-Math-7B-Dolci100k-English10pct/seed3407
- Ejecucion English10pct, semilla 3408: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds/tree/main/Qwen2.5-Math-7B-Dolci100k-English10pct/seed3408
- Ejecucion English10pct, semilla 3409: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds/tree/main/Qwen2.5-Math-7B-Dolci100k-English10pct/seed3409
- Ejecucion Formal05pct, semilla 3407: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds/tree/main/Qwen2.5-Math-7B-Dolci100k-Formal05pct/seed3407
- Ejecucion Formal05pct, semilla 3408: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds/tree/main/Qwen2.5-Math-7B-Dolci100k-Formal05pct/seed3408
- Ejecucion Formal05pct, semilla 3409: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds/tree/main/Qwen2.5-Math-7B-Dolci100k-Formal05pct/seed3409
- Preprint del articulo: no disponible en la informacion proporcionada (indicado como pendiente en la model card)
