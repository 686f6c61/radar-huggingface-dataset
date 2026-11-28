# hermitdave/Spark-X2.6-1.7B-MLX-slq-4.5bpw

## Resumen

Spark-X2.6-1.7B-MLX-slq-4.5bpw es una cuantizacion en formato MLX MXFP4 del modelo base XHToken/Spark-X2.6-1.7B, publicada por el usuario hermitdave. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint de pesos cuantizados a 4 bits (W4A16, solo pesos) obtenido mediante el algoritmo MACaQ, un metodo de refinamiento de cuantizacion desarrollado por Huawei CSL. El objetivo es ofrecer una version del modelo base que pueda ejecutarse de forma eficiente en hardware Apple Silicon a traves de la libreria mlx-lm, reduciendo el uso de memoria aproximadamente a la mitad respecto a BF16 sin degradar de forma estadisticamente significativa la calidad.

El modelo base es un transformer de 1.707.657.216 parametros (aproximadamente 1,7 mil millones) con licencia Apache-2.0, orientado a generacion de texto y conversacion en ingles. La relevancia de esta publicacion radica en su metodologia de validacion: el autor documenta comparaciones de perplejidad y evaluaciones zero-shot con intervalos de confianza Wilson al 95 % e intervalos de significacion mediante test de McNemar, lo que permite verificar empiricamente que la cuantizacion es "estadisticamente sin perdida" frente al modelo en BF16 en las tareas evaluadas.

La ficha se centra en las caracteristicas del checkpoint cuantizado y de su modelo base; los detalles de arquitectura interna, datos de entrenamiento y composicion del dataset del modelo original no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos del modelo base no disponibles); pesos en formato MLX MXFP4 |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (las evaluaciones usan contextos de 512 y 2048 tokens) |
| Tipos de cuantizacion | 4 bits, weight-only (W4A16), formato MXFP4 con escalas de bloque E8M0 y nibbles OCP E2M1; metodo MACaQ (macaq-weight-only) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (mxfp4); libreria mlx-lm |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion weight-only a 4 bits del modelo XHToken/Spark-X2.6-1.7B. La arquitectura subyacente corresponde a un transformer de aproximadamente 1,7 mil millones de parametros, pero no se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion, datos de entrenamiento, numero de tokens, composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de esta publicacion reside en el proceso de cuantizacion MACaQ. Para cada capa lineal cuantizada, el procedimiento consiste en: (1) desempaquetar los nibbles OCP E2M1 y las escalas de bloque E8M0 del formato MXFP4 nativo de MLX; (2) filtrar los exponentes de bloque bajo la Hessiana diagonal de activaciones; (3) aplicar Flip-Refinement bajo la Hessiana rotada completa; y (4) reempaquetar en el layout MXFP4 nativo de MLX. El autor indica que se probo una variante con rotacion Hadamard de 32 bloques, pero degradaba la perplejidad (317,13 en contexto corto) y fue descartada; por ello esta release mantiene el layout MXFP4 plano. No se requiere ningun shim en tiempo de ejecucion: el checkpoint se carga como cualquier otro MXFP4 de MLX.

## Capacidades

- Generacion de texto en ingles con pipeline text-generation.
- Conversacion multi-turno (tag conversational).
- Razonamiento basico y respuesta a preguntas de conocimiento general, segun las tareas evaluadas (ARC-Challenge, ARC-Easy, HellaSwag, WinoGrande, MMLU).
- Inferencia eficiente en Apple Silicon mediante mlx-lm (M3 Max medido).
- No se documenta soporte de tool calling o function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad de vision, audio ni modo "thinking".
- Capacidad multilingue limitada al ingles segun los metadatos.

## Casos de uso

- Prototipado local en Mac: el checkpoint permite ejecutar un modelo de 1,7 B en un Mac con Apple Silicon usando mlx-lm, con un pico de memoria de 1,85 GB en la medicion del autor, lo que facilita experimentar sin GPU dedicada.
- Generacion de texto en aplicaciones de escritorio: al ocupar aproximadamente 2,3 GB en disco y requerir menos de 2 GB de memoria en inferencia, es adecuado para integrarse en herramientas de escritorio o notebooks que necesiten generacion de texto offline.
- Chatbot conversacional ligero: el tag conversational y el pipeline text-generation permiten desplegar asistentes sencillos en ingles con latencia baja (232,6 tok/s de decodificacion medidos en M3 Max).
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye resultados crudos en validation/ y documentacion de la receta, lo que lo convierte en un caso de referencia para investigadores que quieran reproducir o comparar metodos de cuantizacion 4 bits en MLX.
- Educacion e investigacion: al ser un modelo pequeno con licencia Apache-2.0, sirve para ensenar tecnicas de cuantizacion, medir perplejidad y realizar evaluaciones zero-shot con herramientas como model-eval.
- Tareas de generacion de texto en lote en hardware Apple: con 2917,9 tok/s de prompt processing en M3 Max, es viable procesar grandes volumenes de prompts cortos en local para tareas de clasificacion o resumen simple en ingles.

## Benchmarks y rendimiento

Perplejidad (WikiText-2, contexto corto: 64 secuencias x 512 tokens):

| Checkpoint | PPL |
|---|---:|
| BF16 | 231,4557 ± 6,0217 |
| MXFP4 RTN | 289,2733 ± 7,2853 |
| MACaQ refined | 277,3195 ± 7,2643 |

Perplejidad (corpus WikiText-2 fijado de model-eval, 199.902 tokens, contexto 2048):

| Modelo | PPL |
|---|---:|
| BF16 | 78,35 |
| MACaQ 4.25 | 88,16 |
| RCO 4.5 nominal | 103,39 |

Evaluacion zero-shot (model-eval, 400 items por tarea, intervalos Wilson 95 %; delta y p comparan MACaQ frente a BF16 con McNemar exacto bilateral):

| Tarea | BF16 | MACaQ 4.25 | Delta | p | RCO 4.5 |
|---|---:|---:|---:|---:|---:|
| ARC-Challenge | 0,3000 [0,257; 0,347] | 0,2675 [0,227; 0,313] | -0,0325 | 0,1048 | 0,2250 [0,187; 0,268] |
| ARC-Easy | 0,5575 [0,509; 0,605] | 0,5525 [0,504; 0,601] | -0,0050 | 0,8899 | 0,4825 [0,434; 0,531] |
| HellaSwag | 0,3475 [0,303; 0,395] | 0,3325 [0,288; 0,380] | -0,0150 | 0,2863 | 0,3200 [0,276; 0,367] |
| WinoGrande | 0,5175 [0,469; 0,566] | 0,5025 [0,454; 0,551] | -0,0150 | 0,5984 | 0,5050 [0,456; 0,554] |
| MMLU | 0,2625 [0,222; 0,308] | 0,2875 [0,245; 0,334] | +0,0250 | 0,1433 | 0,2525 [0,212; 0,297] |

Throughput en M3 Max (64 GB), prompt natural de WikiText-2 de aproximadamente 1.116 tokens, 256 tokens generados, mlx_lm.generate:

| Modelo | Prompt TPS | Decode TPS | Memoria pico |
|---|---:|---:|---:|
| BF16 | 2728,3 | 86,8 | 4,00 GB |
| MXFP4 RTN | 2899,6 | 231,6 | 1,85 GB |
| MACaQ 4.25 | 2917,9 | 232,6 | 1,85 GB |

Verificacion de generacion: con el prompt "What is the capital of France?" y 24 tokens maximos se obtuvo una respuesta coherente a 261,7 tok/s con 1,02 GB de memoria pico.

## Requisitos de hardware

- VRAM/memoria estimada: 1,85 GB de pico en inferencia con el checkpoint cuantizado (medido en M3 Max con 64 GB); el repositorio ocupa 2,3 GB en disco.
- GPU recomendadas: el formato es MLX (mxfp4), por lo que esta pensado para Apple Silicon (series M1, M2, M3, M4). No se documenta soporte en GPU NVIDIA o AMD con esta release concreta.
- Cabe en consumer hardware: si, en cualquier Mac con Apple Silicon con al menos 8 GB de memoria unificada, dado el pico de 1,85 GB medido.
- Opciones de despliegue: mlx-lm (libreria declarada). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: 2917,9 tok/s de prompt processing y 232,6 tok/s de decodificacion en M3 Max (64 GB) con 256 tokens generados; verificacion puntual a 261,7 tok/s con prompt corto. No se proporcionan datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL (WikiText-2, ctx 2048) | Licencia | Formato |
|---|---:|---|---:|---|---|
| Spark-X2.6-1.7B-MLX-slq-4.5bpw (MACaQ) | 1,7 B | no disponible | 88,16 | Apache-2.0 | MLX MXFP4 |
| Spark-X2.6-1.7B BF16 | 1,7 B | no disponible | 78,35 | Apache-2.0 | safetensors BF16 |
| MXFP4 RTN (mismo modelo) | 1,7 B | no disponible | 289,27 (ctx corto) | Apache-2.0 | MLX MXFP4 |
| RCO 4.5 (mismo modelo) | 1,7 B | no disponible | 103,39 | Apache-2.0 | MLX |

No se dispone en la informacion proporcionada de comparaciones con modelos de otros autores del mismo tamano (por ejemplo, variantes de 1-2 B de otras familias). La comparativa se limita a las variantes del mismo modelo base documentadas por el autor.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se documentan capacidades multilingues.
- Los resultados de MMLU son bajos (0,2875 en MACaQ frente a 0,2625 en BF16), lo que sugiere un conocimiento factual limitado; no debe usarse como fuente de verdad.
- Riesgo de alucinacion inherente a un modelo de 1,7 B; no se documentan mitigaciones especificas.
- La evaluacion se realizo con 400 items por tarea, lo que produce intervalos de confianza amplios (por ejemplo, +/- 0,045 en MMLU); las conclusiones de "sin perdida" son validas solo para estas tareas y tamanos de muestra.
- La cuantizacion introduce una degradacion de perplejidad medible respecto a BF16 (88,16 frente a 78,35 en contexto 2048), aunque el autor la califica de estadisticamente no significativa en las tareas evaluadas.
- El checkpoint esta atado al runtime MLX y al formato MXFP4; no es portable a otras librerias sin conversion.
- No se documenta soporte de tool calling, agentes, vision ni audio, por lo que no es adecuado para pipelines que requieran estas capacidades.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion al modelo base (XHToken/SparkLLM) y al algoritmo MACaQ (Huawei CSL).
- No se dispone de informacion sobre sesgos del modelo base ni sobre su composicion de datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/hermitdave/Spark-X2.6-1.7B-MLX-slq-4.5bpw
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Algoritmo MACaQ (Huawei CSL): https://github.com/huawei-csl/MACaQ
- Hermes Agent (herramienta usada en el desarrollo y validacion): https://hermes-agent.nousresearch.com/
- Documentacion de evaluacion del autor: macaq-mlx/docs/SPARK26_EVAL.md (referenciada en la model card; no se proporciona URL directa)
