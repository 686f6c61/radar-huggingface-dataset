# SkyIsNotGreen/Scion-FlashNext-176B-A6B

## Resumen

Scion-FlashNext-176B-A6B es una cuantizacion derivada del modelo MoE Qwen3.8-Flash-Next-FP8, publicada por el usuario SkyIsNotGreen bajo licencia Apache-2.0. El objetivo es claro: comprimir un modelo de 125.000 millones de parametros (6.000 millones activados por token, 512 expertos, top-10 enrutados mas uno compartido) mas una tabla de n-gramas de 51.200 millones de parametros en un unico archivo GGUF de 60,17 GB, frente a los 185,6 GB de la publicacion oficial en FP8. Eso supone una reduccion de 3,1x y lo convierte, segun el autor, en la cuantizacion sin podar mas pequena publicada de este modelo.

La receta combina bancos de expertos ternarios (valores {-1, 0, +1}) en el contenedor PTQ1_0 a 1,75 bpw, el cuerpo del modelo en Q6_K+Q8_0 o F16, la tabla PLE en Q4_0 y unas correcciones entrenadas de rango 512 embebidas en el propio archivo, sin adaptadores externos ni imatrix. El resultado global es de 2,72 bpw. La arquitectura subyacente es `qwen4exp` en llama.cpp: 48 capas con atencion hibrida 3:1 entre GatedDeltaNet lineal e indexada completa, hiper-conexiones y feed-forward MoE, con 262.144 tokens de contexto.

Su relevancia es doble: por un lado, demuestra que un MoE de esta escala puede servirse en una sola GPU de 80 GB; por otro, documenta de forma inusualmente explicita los compromisos asumidos, incluyendo una perplexity de wikitext-2 peor que la de cuantizaciones comparables. El repositorio tiene 0 descargas y 1 like en el momento de redactar esta ficha, por lo que se trata de un artefacto reciente con poca validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp`: 48 capas, atencion hibrida 3:1 (GatedDeltaNet lineal / atencion completa indexada, presupuesto de indexer 2048, compress 4), hiper-conexiones (4, lowrank 320), feed-forward MoE, puerta de salida sigmoide |
| Parametros totales | 177.283.638.144 (177,3 mil millones): 125.000 millones del modelo de lenguaje + 51.200 millones de la tabla de n-gramas (320.001.536 filas x 160). El cabezal MTP de 4000 millones no esta incluido |
| Parametros activos | 6.000 millones por token (512 expertos, top-10 enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Expertos en PTQ1_0 ternario g128 (1,75 bpw); tabla PLE en Q4_0 (4,25 bpw, filas de grupo 32); cuerpo en Q6_K+Q8_0 (variante por defecto) o F16 (variante de fidelidad); correcciones F16 embebidas; normas en F32. Media global: 2,72 bpw |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 para este derivado; los pesos base son Qwen `license:other` |
| Formato de pesos | GGUF (llama.cpp), archivo unico sin shards. 60,17 GB / 56,04 GiB (cuerpo Q6_K) y 65,80 GB / 61,30 GiB (cuerpo F16) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 48 capas con atencion hibrida: tres de cada cuatro capas usan atencion lineal GatedDeltaNet y la restante atencion completa indexada con un presupuesto de indexer de 2048 y factor de compresion 4. Incorpora hiper-conexiones (4, lowrank 320) y una puerta de salida sigmoide. La capa feed-forward es de tipo MoE con 512 expertos, enrutado top-10 mas un experto compartido, lo que deja 6.000 millones de parametros activos por token. Ademas, el modelo incluye una tabla de n-gramas (PLE) de 51.200 millones de parametros que ocupa 28,8 GB del archivo y se decodifica fila a fila en Q4_0.

La cuantizacion no es calibrada, sino entrenada. Los bancos de expertos se llevan a valores ternarios mediante un cuantizador Lloyd g128, con 5 trits por byte mas un campo de 2 trits y una escala de grupo fp16 cada 128 pesos (28 bytes por 128). La entropia de valores de {-1, 0, +1} es de 1,585 bpw, de modo que el contenedor anade en torno a un 10% de sobrecarga. Sobre ese cuerpo ternario el autor injerta ramas de correccion de rango 512 en las salidas de atencion y en la salida del bloque MoE, mas deltas de router, entrenadas por destilacion sobre la salida (output-KD) contra el profesor con el cuantizador desplegado dentro del bucle de entrenamiento. No se usa imatrix ni corpus de calibracion. Las correcciones van embebidas en el archivo (`adapter.embedded=true`) y se acoplan al cargar, sin necesidad de `--lora`. Una extension entrenada hasta el paso 4000 fue evaluada con una puerta KLD de 0,5880 (plana o peor) y no se ha publicado.

## Capacidades

- Generacion de texto en ingles: es la unica modalidad declarada (`pipeline_tag: text-generation`, texto unicamente).
- Razonamiento y conocimiento general: la suite de capacidad de 20 tareas arroja 15/20 con 0 errores de harness.
- Rendimiento solido en tareas de sentido comun: HellaSwag (400) 82,00 y Winogrande (400) 77,50.
- Contexto largo: 262.144 tokens heredados del modelo base, con atencion lineal en 3 de cada 4 capas.
- Categorias debiles declaradas por el autor: codigo y logica, con 1/3 cada una en la suite de 20 tareas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no; solo ingles.
- Capacidad especial: no incluye el cabezal MTP de 4000 millones del modelo base, por lo que no hay decodificacion multi-token especulativa.

## Casos de uso

- Servicio de generacion de texto en una sola GPU de 80 GB: el archivo completo ocupa 56,04 GiB en la variante Q6_K, de modo que entra con holgura en una A100-SXM4-80GB, configuracion en la que el autor ha verificado carga completa en GPU, generacion y benchmarks.
- Sustitucion de despliegues FP8 por restricciones de VRAM o disco: pasar de 185,6 GB a 60,17 GB reduce 3,1x el espacio necesario y permite almacenar el modelo en un unico volumen sin shards ni adaptadores externos.
- Procesamiento de documentos largos en ingles: con 262.144 tokens de contexto y atencion hibrida, es adecuado para resumir o extraer informacion de expedientes, normativa o documentacion tecnica extensa en una sola pasada.
- Tareas de comprension y clasificacion de lenguaje natural: los resultados de HellaSwag (82,00) y Winogrande (77,50) lo situan como opcion razonable para enrutado de intenciones, recuperacion semantica asistida o anotacion de textos donde importa el sentido comun y no el razonamiento formal.
- Investigacion en cuantizacion de bajo bit: el repositorio documenta contenedores ternarios PTQ1_0, correcciones entrenadas embebidas y decodificacion de tablas PLE, por lo que sirve como material reproducible para estudiar el impacto de 1,75 bpw en expertos MoE.
- Inferencia en CPU sin GPU: el autor ha verificado el modelo en un pod con 16 hilos, lo que abre la puerta a entornos sin acelerador donde la latencia no sea critica.
- Experimentacion en ROCm: verificado sobre gfx1100, util para prototipos en hardware AMD.
- Prototipado con contexto muy largo en un solo archivo: al no requerir sidecar ni particionado, simplifica pipelines de evaluacion que necesitan cargar y descargar el modelo repetidamente.

## Benchmarks y rendimiento

| Benchmark | Scion-FlashNext-176B-A6B | ISTA Q2_0 | Notas |
|---|---|---|---|
| HellaSwag (400) | 82,00 | 81,50 | Empate dentro de la banda de +-2% |
| Winogrande (400) | 77,50 | 74,75 | Mejor con 6,2 GB menos de tamano |
| wikitext-2 PPL | 5,457 | 5,240 | Peor: los expertos ternarios a 1,75 bpw compran tamano, no verosimilitud |
| cap_eval (suite de 20 tareas) | 15/20, 0 errores de harness | no disponible | Codigo y logica: 1/3 cada uno |
| Puerta KLD (48 capas) | 0,5800 de media | no disponible | 92,9% de esa masa corresponde al ajuste del soporte top-512 |

No se han publicado otros resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval ni GSM8K).

## Requisitos de hardware

- VRAM estimada: 56,04 GiB para la variante con cuerpo Q6_K y 61,30 GiB para la variante F16, correspondientes a los 60,17 GB y 65,80 GB del archivo. Hay que sumar la cache KV y el overhead de contexto; la cifra exacta para 262.144 tokens no esta disponible.
- GPU verificadas por el autor: A100-SXM4-80GB (sm_80) y RTX PRO 6000 Blackwell (sm_120), ambas con carga completa en GPU, generacion y ejecucion de los benchmarks.
- ROCm: verificado sobre gfx1100.
- CPU: verificado en un pod con 16 hilos.
- GPU de consumo: no cabe en tarjetas de 24 GB ni de 32 GB. Seria necesario offload parcial a memoria del sistema con llama.cpp, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: llama.cpp y, en concreto, el fork `sky-is-green/prism-ml-llama.cpp` (rama `qwen4exp-proto`), que anade los contenedores PQ2_0/PTQ1_0, la arquitectura `qwen4exp`, el objetivo virtual `ffn_moe_out`, soporte de adaptadores embebidos y manejo de tablas PLE. Soporte en vLLM, Ollama o TGI: no documentado.
- Latencia y throughput: no disponible. Como referencia estructural, activa 6.000 millones de parametros por token sobre un total de 125.000 millones en el modelo de lenguaje.

## Comparativa con modelos similares

Todas las alternativas son cuantizaciones del mismo modelo base, por lo que la comparacion se centra en tamano y compromisos de fidelidad.

| Modelo | Tamano | Formato / bits | Licencia | Datos comparables |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP8 (base) | 185,6 GB | FP8, bloques 128x128 | Qwen `license:other` | Referencia de maxima fidelidad |
| Mooney PQ2_0 | 92 GB | Ternario | no disponible | Otra construccion ternaria |
| GSQ-RCO IQ3_S | 83,6 GB | IQ3_S | no disponible | no disponible |
| IQ3_XXS | 75,8 GB | IQ3_XXS | no disponible | no disponible |
| IQ2_XS | 68,0 GB | IQ2_XS | no disponible | no disponible |
| GSQ-RCO Q2_0 (ISTA) | 66,4 GB | Q2_0 | no disponible | HellaSwag 81,50; Winogrande 74,75; wikitext-2 PPL 5,240 |
| Scion-FlashNext-176B-A6B | 60,17 GB | PTQ1_0 ternario + Q6_K/Q8_0 + Q4_0 PLE | Apache-2.0 | HellaSwag 82,00; Winogrande 77,50; wikitext-2 PPL 5,457 |
| ISTA IQ1_M (coder, podado) | 58,4 GB | IQ1_M | no disponible | Unico archivo mas pequeno en el Hub, pero con expertos podados y orientado a codigo |

Frente a ggml-org IQ4_NL (102 GB) el ahorro es de 41,83 GB; frente al unico ternario alternativo, Mooney PQ2_0 (92 GB), de 31,83 GB.

## Limitaciones y advertencias

- Solo ingles: no hay soporte multilingue declarado.
- Calidad de verosimilitud inferior: la perplexity de wikitext-2 es 5,457 frente a 5,240 de ISTA Q2_0, pese a ser 6,2 GB mas pequeno. El propio autor lo describe como un intercambio de tamano por verosimilitud.
- Codigo y logica debiles: 1/3 en cada categoria de la suite de 20 tareas. No es recomendable para generacion de codigo en produccion.
- Divergencia respecto al profesor: la puerta KLD de 48 capas da 0,5800 de media, y el 92,9% de esa masa corresponde al ajuste del soporte top-512, lo que indica que buena parte de la divergencia es estructural y no solo de magnitud.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se aplican los riesgos habituales de un modelo de lenguaje.
- Dependencia de una implementacion no estandar: requiere el fork `prism-ml-llama.cpp` (rama `qwen4exp-proto`) con los contenedores PQ2_0/PTQ1_0, la arquitectura `qwen4exp` y el manejo de tablas PLE. No se documenta compatibilidad con llama.cpp upstream ni con otros runtimes.
- Licencia: el derivado se publica como Apache-2.0, pero los pesos base son Qwen `license:other`. El autor indica que se ha seguido la practica de las cuantizaciones comunitarias; conviene revisar los terminos del modelo base antes de un uso comercial.
- Contexto: aunque hereda 262.144 tokens, no se han publicado mediciones de degradacion a longitudes extremas.
- Capacidades ausentes: sin tool calling, sin soporte de agentes documentado y sin el cabezal MTP de 4000 millones, por lo que no hay decodificacion multi-token especulativa.
- Adopcion minima: 0 descargas y 1 like en el momento de redactar la ficha, con creacion el 2026-10-05 y ultima actualizacion el 2026-10-06. La validacion es practicamente toda del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SkyIsNotGreen/Scion-FlashNext-176B-A6B
- Discusiones del modelo: https://huggingface.co/SkyIsNotGreen/Scion-FlashNext-176B-A6B/discussions
- Repositorio GitHub con scripts de construccion y documentacion: https://github.com/sky-is-green/scion
- Fork del runtime llama.cpp (rama `qwen4exp-proto`): https://github.com/sky-is-green/prism-ml-llama.cpp/tree/qwen4exp-proto
- Modelo base en FP8: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
