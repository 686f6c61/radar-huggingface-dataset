# ikimyaii/Mamba-370M-unstructured-SparseGPT-50pct

## Resumen

Mamba-370M-unstructured-SparseGPT-50pct es una variante podada del modelo state-spaces/mamba-370m-hf, un modelo de lenguaje basado en arquitectura Mamba (state space model, SSM) desarrollado originalmente por el grupo de Albert Gu y Tri Dao. Esta version concreta, publicada por el usuario ikimyaii, aplica una poda no estructurada one-shot del 50% sobre las capas lineales internas de los bloques Mamba usando el codigo oficial de SparseGPT, sin reentrenamiento posterior.

El modelo resuelve un problema de investigacion concreto: servir como baseline reproducible para estudiar la tolerancia al pruning de arquitecturas SSM frente a transformers. La poda se aplica a in_proj, x_proj y out_proj de cada bloque, manteniendo densos dt_proj, conv1d, A_log, D, los embeddings y el lm_head. El resultado es un checkpoint que conserva el 49,01% de sparsez real medido sobre los pesos finales.

Es relevante ahora porque la mayoria de estudios de pruning se han centrado en transformers, y existen pocos artefactos publicos que permitan comparar el comportamiento de Mamba bajo tecnicas de compresion post-entrenamiento. El checkpoint tiene 423.003.136 parametros almacenados y un tamano de repositorio de 0,8 GB en formato safetensors, cargable con transformers estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model, SSM selectivo) |
| Parametros totales | 423.003.136 (pesos almacenados en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base mamba-370m-hf soporta contexto largo, pero la model card no lo especifica) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; se menciona que Mamba desborda en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Mamba-370M, un SSM selectivo que sustituye la atencion por recurrencia con parametros dependientes de la entrada (matrices A, B, C y delta variables). Esta variante no reentrena: parte de los pesos de state-spaces/mamba-370m-hf y aplica una poda no estructurada one-shot con el codigo oficial de SparseGPT (commit 147d215, modo fasterprune, blocksize 128, damping 0.01). Cada bloque se poda secuencialmente y se calibra sobre las salidas de los bloques ya podados anteriores, siguiendo el esquema de los drivers oficiales, aunque el recorrido de capas es codigo nuevo porque los drivers originales solo soportan OPT y LLaMA.

La calibracion usa 128 secuencias de C4 de 2.048 tokens con semilla 0, y los pesos se podan en bfloat16. El proceso completo tardo 3,1 minutos en una A100 de 40 GB. La mascara de poda emplea un umbral por cada bloque de 128 columnas, por lo que las filas resultantes no tienen el mismo numero de ceros: la sparsez medida es 0,4901 y, en las 192 capas podadas, la fila mas densa tiene de media 1,26 veces los no-cero de la fila media (peor capa: 1,58x). dt_proj se mantiene denso (aproximadamente el 2% de los pesos lineales de cada bloque), al igual que conv1d, A_log, D, embeddings y lm_head.

## Capacidades

- Generacion de texto autoregresiva en el estilo del modelo base Mamba-370M, con la degradacion esperada por la poda del 50%.
- Razonamiento basico y respuesta a preguntas de conocimiento general, con precision zero-shot limitada (media de 0,4191 en el conjunto de tareas evaluadas).
- Procesamiento de secuencias largas gracias a la naturaleza recurrente del SSM, aunque la longitud de contexto efectiva no se documenta en la model card.
- Inferencia eficiente en memoria frente a transformers de tamano comparable, por la ausencia de atencion cuadratica.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues no documentadas; el modelo base se entreno principalmente con datos en ingles.

## Casos de uso

- Investigacion sobre pruning en SSM: servir como baseline reproducible para comparar tecnicas de compresion (SparseGPT, Wanda, poda estructurada) sobre arquitecturas Mamba, ya que la model card documenta el protocolo exacto de calibracion y la sparsez resultante.
- Estudio de la relacion sparsez-rendimiento: analizar como degrada la perplejidad (19,66 en WikiText-2, 24,46 en C4) al aumentar la poda, usando este checkpoint como punto intermedio del 50%.
- Validacion de pipelines de evaluacion: probar harness de evaluacion zero-shot (lm-evaluation-harness) y protocolos de perplejidad (ELSA) sobre modelos SSM podados, verificando la reproducibilidad de las cifras reportadas.
- Prototipado de inferencia de bajo coste: desplegar un modelo de 423M parametros en hardware modesto para experimentar con generacion de texto donde la calidad no sea critica, aprovechando el menor coste computacional del SSM.
- Docencia y divulgacion: ilustrar en cursos o articulos el efecto de la poda no estructurada sobre un modelo no transformer, con cifras concretas de sparsez por capa y desbalanceo de filas.
- Benchmarking de kernels: medir el rendimiento real de kernels Mamba sobre pesos con sparsez no estructurada, comprobando si el patron de ceros se traduce en aceleracion efectiva o si el hardware no lo aprovecha.
- Comparacion de familias de modelos comprimidos: contrastar este checkpoint con variantes podadas de transformers del mismo orden de parametros para estudiar diferencias de robustez frente al pruning.

## Benchmarks y rendimiento

Perplejidad (protocolo ELSA, evaluacion en bfloat16):

| Dataset | Este modelo |
|---|---|
| WikiText-2 | 19,66 |
| C4 | 24,46 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,2176 |
| arc_easy | 0,4992 |
| boolq | 0,6131 |
| hellaswag | 0,3396 |
| openbookqa | 0,1880 |
| rte | 0,5271 |
| winogrande | 0,5493 |
| Media | 0,4191 |

No se han publicado en la informacion disponible los resultados del modelo base sin podar ni de modelos comparables, por lo que no es posible cuantificar la degradacion relativa.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,85 GB solo para pesos (423M parametros x 2 bytes), mas activaciones y cache de estado; en la practica, entre 1,5 y 3 GB segun longitud de secuencia y batch.
- Cabe en cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, GTX 1650 Super, RTX 4060, etc.) y en GPUs de datacenter (A100, H100) con enorme holgura.
- El pruning se realizo en una A100 de 40 GB en 3,1 minutos; para inferencia no se requiere ese hardware.
- Opciones de despliegue: transformers estandar con AutoModelForCausalLM.from_pretrained (metodo documentado por el autor). El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado y depende del soporte de la arquitectura Mamba en cada framework.
- Latencia y throughput estimados: no disponibles. La sparsez no estructurada no garantiza aceleracion en GPUs convencionales sin kernels especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M podado 50%) | 423.003.136 | no disponible | 19,66 | no disponible | Hugging Face |
| state-spaces/mamba-370m-hf (base sin podar) | ~370M | no disponible en la informacion | no disponible | no disponible | Hugging Face |
| Variantes podadas de transformers (p. ej. OPT-350M con SparseGPT) | ~350M | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- La poda one-shot sin reentrenamiento degrada la calidad: la media zero-shot de 0,4191 y la perplejidad de 19,66 en WikiText-2 son notablemente peores que las esperables en un modelo denso del mismo tamano.
- El patron de sparsez no es uniforme entre filas (hasta 1,58x de desbalanceo en la peor capa), lo que puede generar comportamiento irregular segun la entrada.
- La sparsez no estructurada no produce aceleracion automatica en GPUs convencionales; el beneficio principal es de almacenamiento y, potencialmente, de ancho de banda de memoria con kernels adecuados.
- Mamba desborda en fp16 segun el autor, por lo que debe usarse bfloat16 o precision superior; esto limita el despliegue en hardware sin soporte bf16.
- Licencia no disponible: no puede confirmarse el uso comercial. Debe verificarse la licencia del modelo base state-spaces/mamba-370m-hf antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados; se espera un rendimiento principalmente en ingles por herencia del modelo base.
- Riesgo de alucinacion y sesgos: no evaluados en la model card; al ser un modelo pequeno y podado, la fiabilidad factua es limitada.
- Longitud de contexto efectiva no documentada; no debe asumirse el contexto nativo del modelo base sin verificacion empirica.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente de los resultados reportados.
- El checkpoint se creo en noviembre de 2026 segun los metadatos; verificar la integridad y procedencia antes de usarlo en pipelines criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-unstructured-SparseGPT-50pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Paper de Mamba: no disponible en la informacion proporcionada
- Paper de SparseGPT: no disponible en la informacion proporcionada
- Repositorio ELSA (protocolo de evaluacion): no disponible en la informacion proporcionada
- lm-evaluation-harness: no disponible en la informacion proporcionada
