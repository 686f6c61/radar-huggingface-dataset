# DuoNeural/Qwen3.5-9B-GTAP-v3-IQ2_XXS-GGUF

## Resumen

Qwen3.5-9B-GTAP-v3-IQ2_XXS-GGUF es una cuantizacion experimental extrema del modelo base Qwen/Qwen3.5-9B, publicada por DuoNeural (Jesse Caldwell, Archon y Aura, DuoNeural Research Lab). El checkpoint comprime un modelo de 9.197.093.888 parametros (~9,2 B) hasta aproximadamente 2,06 bits por peso, con un peso total de 3,43 GiB, frente a los 17,14 GiB del control en BF16. El objetivo declarado es ejecutar un transformer hibrido de 32 capas en hardware de consumo manteniendo la coherencia en contextos largos.

La relevancia tecnica esta en el metodo de cuantizacion: la familia G-TAP v3 (Generalized Thouless-Anderson-Palmer) modela los pesos como vidrios de spin en un campo de cavidad de activacion y proyecta las actualizaciones de parametros en el semiespacio contractivo de Lyapunov, con el fin de evitar la deriva de autovalores en las matrices de transicion recurrente de las capas de atencion lineal. Segun la model card, este enfoque permite bajar de 3 bits sin que el estado recurrente diverja en contextos largos.

El autor presenta la publicacion como un artefacto de investigacion activo, "pendiente de verificacion y validacion empirica adicional", y acompania sus propias mediciones con un banco de pruebas sobre una NVIDIA RTX 4080 Super. El modelo se distribuye en formato GGUF y esta pensado para su uso con llama.cpp. Segun los resultados de busqueda, Qwen3.5 es una familia de modelos abiertos descrita como multimodal por el catalogo de Ollama, aunque la model card de esta cuantizacion no detalla capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 32 capas + MTP, atencion lineal recurrente (Gated DeltaNet / SSM) alternada con atencion softmax GQA, FFN SwiGLU |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de uso emplean `-c 4096` y `-c 8192`, y la perplejidad se midio sobre una retencion continua de 131.000 tokens |
| Tipos de cuantizacion | Este repositorio: IQ2_XXS (~2,06 bpw, 3,43 GiB). La familia del mismo autor incluye tambien IQ2_M, IQ3_XXS y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura hibrida que alterna atencion lineal recurrente (Gated DeltaNet, con actualizacion de estado tipo SSM $S_t = \alpha S_{t-1} + \beta K^T V$) con atencion softmax multi-cabeza con GQA. El bloque de feed-forward usa SwiGLU y el conjunto suma 32 capas mas prediccion multi-token (MTP). Esta cuantizacion no reentrena el modelo: parte de los pesos de Qwen/Qwen3.5-9B y los comprime.

La innovacion declarada es el marco G-TAP v3. En arquitecturas hibridas, el redondeo agresivo a pocos bits introduce deriva de autovalores en las matrices de transicion recurrente, lo que produce divergencia exponencial o saturacion de logits en contextos largos. G-TAP v3 resta el termino de reaccion de Onsager, definido como $\Omega_i = \frac{1}{d}(\|\tilde{H}_{i,:}\|_2^2 - \tilde{H}_{ii}^2)$, y proyecta las actualizaciones en el semiespacio contractivo de Lyapunov $\operatorname{Re}(\lambda(S)) \le -\delta$, amortiguando el ruido de retroaccion y preservando la estabilidad del estado recurrente. El repositorio incluye la etiqueta `imatrix`, lo que sugiere el uso de una matriz de importancia en el proceso de cuantizacion.

No se proporcionan datos sobre el entrenamiento original del modelo base: numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla el procedimiento exacto de calibracion ni el conjunto de datos empleado para la imatrix.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat tipo ChatML (`<|im_start|>user ... <|im_end|>`).
- Razonamiento matematico basico: 10/25 (40,0%) en GSM8K segun la medicion del autor.
- Razonamiento matematico de competicion: 1/10 (10,0%) en problemas tipo olimpiada.
- Generacion de codigo Python: 11/15 (73,3%) de tasa de paso del AST generado.
- Tool calling / function calling: 11/15 (73,3%) de paridad AST en el banco de pruebas Hermes.
- Soporte de prediccion multi-token (MTP) heredado de la arquitectura base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles para esta cuantizacion.
- Modo de razonamiento explicito (thinking mode): no documentado en la model card.

## Casos de uso

- Despliegue en equipos de gama de consumo con VRAM limitada: con 3,43 GiB de pesos, el modelo puede ejecutarse integramente en GPU en tarjetas con 6-8 GB de VRAM junto con la cache KV, algo inviable para el control en BF16 de 17,14 GiB.
- Prototipado rapido de asistentes conversacionales locales: la plantilla ChatML y la etiqueta `conversational` permiten levantar un servidor compatible con la API de OpenAI mediante `llama-server` en un solo comando.
- Generacion de codigo en scripts de automatizacion: con una tasa de paso AST del 73,3% en Python, es util para tareas de refactorizacion sencilla, generacion de boilerplate o completado de funciones donde se revise la salida antes de integrarla.
- Agentes con llamada a herramientas en entornos con recursos escasos: el 73,3% de paridad en tool calling permite construir prototipos de agentes que invocan funciones, siempre con validacion posterior de las llamadas generadas.
- Inferencia de alto rendimiento por GPU unica: a 97,7 t/s de decodificacion en una RTX 4080 Super, resulta adecuado para servicios de baja concurrencia donde el coste por token y el consumo de VRAM son criticos.
- Experimentacion academica en cuantizacion de baja precision: el repositorio publica las mediciones comparativas entre IQ2_XXS, IQ2_M, IQ3_XXS y Q4_K_M, lo que lo convierte en una referencia util para estudiar el compromiso entre tamano, perplejidad y capacidad de razonamiento.
- Evaluacion de estabilidad en contextos largos de arquitecturas hibridas: la perplejidad se midio sobre 131.000 tokens, por lo que sirve como punto de partida para reproducir pruebas de deriva en modelos con atencion lineal recurrente.
- Ejecucion en CPU o en sistemas embebidos: al ser GGUF y de 3,43 GiB, el modelo puede correr total o parcialmente en CPU mediante llama.cpp cuando no hay GPU disponible, a costa de una velocidad muy inferior.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Las mismas 25 preguntas de GSM8K, 10 de olimpiada, 15 de codigo Python y 15 de tool calling se utilizan en todas las configuraciones.

| Configuracion | Huella | Perplejidad (131k tokens) | GSM8K | Olimpiada | Codigo Python (AST) | Hermes tool calling (AST) | Velocidad de decodificacion |
|---|---|---|---|---|---|---|---|
| Arm 0, base BF16 | 17,14 GiB | 2,4306 | 23/25 (92,0%) | 2/10 (20,0%) | 14/15 (93,3%) | 15/15 (100,0%) | 27,0 t/s |
| Arm 4, GTAP Q4_K_M | 5,38 GiB | 2,3324 | 24/25 (96,0%) | 2/10 (20,0%) | 14/15 (93,3%) | 14/15 (93,3%) | 68,9 t/s |
| Arm 3, GTAP IQ3_XXS | 4,10 GiB | 2,6031 | 16/25 (64,0%) | 2/10 (20,0%) | 15/15 (100,0%) | 14/15 (93,3%) | 84,6 t/s |
| Arm 5, GTAP IQ2_M | 3,79 GiB | 2,7228 | 22/25 (88,0%) | 4/10 (40,0%) | 13/15 (86,7%) | 14/15 (93,3%) | 87,4 t/s |
| Arm 6, GTAP IQ2_XXS (este repositorio) | 3,43 GiB | 2,8023 | 10/25 (40,0%) | 1/10 (10,0%) | 11/15 (73,3%) | 11/15 (73,3%) | 97,7 t/s |

El banco de pruebas indicado es una NVIDIA GeForce RTX 4080 Super con 32 GB de VRAM. No se han publicado resultados de MMLU, HumanEval, MT-Bench ni de otras evaluaciones estandar en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos: 3,43 GiB en la cuantizacion IQ2_XXS de este repositorio. El repositorio completo ocupa 3,7 GB en disco.
- VRAM total estimada para inferencia: aproximadamente 3,43 GiB de pesos mas la cache KV. La model card demuestra el uso de `-c 4096` y `-c 8192`; con contexto largo la cache KV puede superar el tamano de los pesos, por lo que se recomienda al menos 8 GB de VRAM para contextos de 8k y 16 GB o mas para contextos muy extensos. Esta estimacion es propia y no figura como tal en la model card.
- GPU recomendadas por el autor: NVIDIA GeForce RTX 4080 Super (banco de pruebas declarado, 97,7 t/s de decodificacion).
- Compatibilidad con GPU de consumo: si, es el caso de uso principal. La huella de 3,43 GiB hace viable su ejecucion en tarjetas de 6-8 GB de VRAM, algo imposible con el control BF16 de 17,14 GiB.
- Opciones de despliegue: llama.cpp mediante `llama-cli` y `llama-server`. El repositorio lleva la etiqueta `endpoints_compatible`, lo que apunta a compatibilidad con endpoints estilo OpenAI. No se mencionan vLLM, TGI ni Ollama en la model card.
- Ejemplo de CLI: `llama-cli -hf DuoNeural/Qwen3.5-9B-GTAP-v3-IQ2_XXS-GGUF -p "..." -n 1024 -c 4096 --temp 0.6`.
- Ejemplo de servidor: `llama-server -hf DuoNeural/Qwen3.5-9B-GTAP-v3-IQ2_XXS-GGUF --port 8080 -c 8192 -ngl 99 -fa on`.
- Latencia y throughput: 97,7 t/s de decodificacion en RTX 4080 Super, el valor mas alto de la tabla comparativa y un 262% superior a los 27,0 t/s del control BF16. No se publica la latencia de prefill ni el throughput con lotes concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / huella | Perplejidad (131k) | GSM8K | Tool calling (AST) | Velocidad | Licencia |
|---|---|---|---|---|---|---|---|
| Qwen3.5-9B base (BF16) | 9,2 B | BF16 / 17,14 GiB | 2,4306 | 92,0% | 100,0% | 27,0 t/s | Apache 2.0 |
| GTAP v3 IQ2_XXS (este repo) | 9,2 B | IQ2_XXS / 3,43 GiB | 2,8023 | 40,0% | 73,3% | 97,7 t/s | Apache 2.0 |
| GTAP v3 IQ2_M | 9,2 B | IQ2_M / 3,79 GiB | 2,7228 | 88,0% | 93,3% | 87,4 t/s | Apache 2.0 |
| GTAP v3 IQ3_XXS | 9,2 B | IQ3_XXS / 4,10 GiB | 2,6031 | 64,0% | 93,3% | 84,6 t/s | Apache 2.0 |
| GTAP v3 Q4_K_M | 9,2 B | Q4_K_M / 5,38 GiB | 2,3324 | 96,0% | 93,3% | 68,9 t/s | Apache 2.0 |

La comparativa se limita a las variantes publicadas por el mismo autor y al modelo base, que son los unicos datos numericos disponibles. No se dispone de mediciones comparables frente a otras cuantizaciones de Qwen3.5 (por ejemplo, las de otros publicadores en HuggingFace u Ollama) ni frente a modelos de tamano similar de otras familias, por lo que no es posible establecer una comparacion independiente.

## Limitaciones y advertencias

- Estado experimental: la propia model card advierte de que es una publicacion de investigacion "pendiente de verificacion y validacion empirica adicional". No debe tratarse como un artefacto validado para produccion.
- Degradacion medible: la perplejidad sube de 2,4306 en BF16 a 2,8023 en IQ2_XXS, y la precision en GSM8K cae del 92,0% al 40,0%. Es el mayor deterioro de razonamiento de toda la tabla comparativa.
- Perdida de capacidad de tool calling: el 73,3% de paridad AST implica que aproximadamente una de cada cuatro llamadas a herramientas generadas no es correcta, algo critico en pipelines de agentes sin validacion.
- Muestras de evaluacion muy pequenas: 25 preguntas de GSM8K, 10 de olimpiada y 15 de codigo y herramientas. Los intervalos de confianza son amplios y diferencias como 1/10 frente a 2/10 no son estadisticamente significativas.
- Riesgo de alucinacion: la cuantizacion a ~2,06 bits reduce la fidelidad de los pesos; en tareas de conocimiento factual o contextos largos cabe esperar mayor tendencia a inventar informacion que en el modelo base.
- Deriva en contextos largos: el metodo G-TAP v3 se disena precisamente para mitigarla, pero no se publican pruebas de estabilidad mas alla de la medicion de perplejidad sobre 131.000 tokens ni comparaciones con el control en esa misma ventana.
- Idiomas: no se documenta la lista de idiomas soportados para esta cuantizacion, por lo que no puede garantizarse un rendimiento correcto en castellano ni en otros idiomas.
- Arquitectura hibrida: el soporte de atencion lineal recurrente en tiempo de ejecucion depende de la version del motor de inferencia; es necesario usar una version de llama.cpp que soporte Gated DeltaNet y la ventana de contexto configurada con `-fa on`.
- Marco teorico no verificado de forma independiente: las afirmaciones sobre terminos de Onsager y semiespacios de Lyapunov aparecen en la model card sin publicacion revisada por pares ni demostracion reproducible enlazada.
- Resultados de un unico entorno: todas las cifras de velocidad proceden de una unica configuracion (RTX 4080 Super, 32 GB de VRAM) y no se documentan el tamano de lote ni las condiciones de la prueba.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar tambien la licencia del modelo base Qwen/Qwen3.5-9B antes de distribuir derivados.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/DuoNeural/Qwen3.5-9B-GTAP-v3-IQ2_XXS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante hermana GTAP v3 IQ2_M: https://huggingface.co/DuoNeural/Qwen3.5-9B-GTAP-v3-IQ2_M-GGUF
- Otro repositorio del mismo autor: https://huggingface.co/DuoNeural/Qwen-3.5-9B-GGUF
- Ficha de Qwen3.5 9B en llama.cpp / local-ai-zone: https://local-ai-zone.github.io/models/qwen-qwen3-5-9b.html
- Variante comunitaria derivada (Heretic Neo Imatrix Max MTP): https://local-ai-zone.github.io/models/qwen3-5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp.html
- Pagina de Qwen3.5 9B en Ollama: https://ollama.com/library/qwen3.5:9b
