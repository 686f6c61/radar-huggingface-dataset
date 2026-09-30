# DuoNeural/Qwen3.5-9B-GTAP-v3-Q4_K_M-GGUF

## Resumen

Qwen3.5-9B-GTAP-v3-Q4_K_M-GGUF es una cuantizacion GGUF del modelo base Qwen/Qwen3.5-9B, publicada por el laboratorio DuoNeural (Jesse Caldwell, Archon y Aura). No se trata de un ajuste fino ni de un modelo nuevo: es el mismo checkpoint de 9.197.093.888 parametros (9,2 B) convertido a precision de aproximadamente 5,02 bits por peso (5,38 GiB) mediante el metodo propietario Generalized Thouless-Anderson-Palmer v3 (G-TAP v3), un esquema de cuantizacion derivado de la fisica estadistica de vidrios de espin que el autor aplica especificamente sobre arquitecturas hibridas de atencion lineal.

El problema que aborda es concreto: en arquitecturas hibridas que alternan atencion recurrente lineal (Gated DeltaNet, del tipo SSM) con atencion softmax GQA, la cuantizacion agresiva a pocos bits suele introducir deriva de autovalores en las matrices de transicion recurrente, lo que provoca divergencia exponencial o saturacion de logits en contextos largos. La propuesta de DuoNeural es restar el termino de reaccion de Onsager y proyectar las actualizaciones en el semiespacio contractivo de Lyapunov para mantener estable el estado recurrente incluso por debajo de 3 bits.

Su relevancia es fundamentalmente metodologica y experimental, no de producto: la propia model card lo etiqueta como version experimental pendiente de verificacion empirica independiente, no tiene descargas ni interacciones registradas, y todas las metricas que reporta son autoevaluadas por el autor. Aun asi, resulta interesante como caso de estudio de cuantizacion consciente de la arquitectura, con un catalogo de variantes que va de 5,38 GiB (Q4_K_M) a 3,43 GiB (IQ2_XXS).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 32 capas + MTP (multi-token prediction), atencion lineal recurrente Gated DeltaNet / SSM alternada con atencion softmax GQA, FFN SwiGLU |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como maximo declarado del modelo; los ejemplos de uso emplean ventanas de 4.096 y 8.192 tokens, y la perplejidad se mide sobre 131.000 tokens |
| Tipos de cuantizacion | Q4_K_M (~5,02 bpw, 5,38 GiB) en este repositorio; la familia GTAP v3 incluye ademas IQ3_XXS (4,10 GiB), IQ2_M (3,79 GiB) e IQ2_XXS (3,43 GiB); usa imatrix |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 5,8 GB |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una receta de cuantizacion aplicada sobre Qwen/Qwen3.5-9B. El modelo base, segun la informacion disponible, es un transformer hibrido de 32 capas mas una cabeza de prediccion multi-token (MTP), que alterna bloques de atencion lineal recurrente basados en Gated DeltaNet (actualizacion de estado del tipo S_t = alfa * S_{t-1} + beta * K^T V) con bloques de atencion softmax GQA, y usa FFN con activacion SwiGLU. Los detalles de composicion del dataset de preentrenamiento, numero de tokens, fases de RLHF/DPO y proceso de alineacion del modelo base no estan disponibles en la informacion proporcionada.

La innovacion declarada es el metodo G-TAP v3: el autor modela los pesos como un vidrio de espin inmerso en campos de cavidad de activacion, resta el termino de reaccion de Onsager (Omega_i proporcional a la norma al cuadrado de la fila del Hessiano menos el elemento diagonal al cuadrado) y proyecta las actualizaciones de parametros en el semiespacio contractivo de Lyapunov, donde la parte real de los autovalores de la matriz de transicion queda por debajo de un margen negativo delta. El objetivo es amortiguar el ruido de retroaccion y preservar la estabilidad del estado recurrente. Es un planteamiento teoricamente atractivo, pero no se ha publicado material de validacion independiente, articulo revisado por pares ni replicacion de terceros en la informacion disponible; la afirmacion de que la version cuantizada supera en perplejidad al BF16 sin cuantizar debe tratarse con cautela.

## Capacidades

- Generacion de texto conversacional en formato ChatML (el ejemplo de uso emplea los tokens especiales <|im_start|> y <|im_end|>).
- Razonamiento matematico de tipo escolar: la model card reporta 24/25 (96,0%) en GSM8K.
- Generacion de codigo Python con estructura sintactica valida: 14/15 (93,3%) en la prueba de AST declarada.
- Tool calling en formato Hermes: 14/15 (93,3%) de paridad AST en la prueba declarada.
- Prediccion multi-token (MTP) heredada del modelo base, orientada a acelerar la decodificacion.
- Ventana de contexto larga: la evaluacion de perplejidad se realiza sobre una retencion continua de 131.000 tokens, lo que sugiere manejo de contextos extensos, aunque el maximo nominal no se declara.
- Capacidades multilingues: no disponibles para este repositorio concreto.
- Vision: no declarada. El pipeline del repositorio es text-generation y no se documentan componentes multimodales en esta cuantizacion, aunque la familia Qwen3.5 del modelo base se describe en otras fuentes como multimodal.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de gama alta para asistentes conversacionales: el archivo Q4_K_M ocupa 5,38 GiB, de modo que un equipo con 8 GB o mas de VRAM puede mantener los pesos en memoria y reservar el resto para la cache KV, sirviendo el modelo con llama-server en el puerto 8080.
- Prototipado de razonamiento matematico paso a paso: el prompt de ejemplo de la model card esta disenado para resolver raices de polinomios encadenando pasos, un escenario util para tutoria automatica o generacion de problemas resueltos, con la salvedad de que el rendimiento declarado en competicion tipo Olimpiada es solo del 20%.
- Asistencia de codigo integrada en editores: la prueba de AST en Python sugiere que el modelo produce codigo sintacticamente correcto en la mayoria de los casos, adecuado para autocompletado y generacion de funciones auxiliares en un plugin de IDE.
- Enrutado de herramientas y agentes ligeros: con tool calling en formato Hermes, puede actuar como capa de seleccion de funciones en un pipeline de agentes donde el modelo decide que API invocar y con que argumentos.
- Servicio de inferencia de alto rendimiento en una sola GPU: con 68,9 tokens/s declarados en Q4_K_M y hasta 97,7 tokens/s en IQ2_XXS, es viable para cargas interactivas con varios usuarios concurrentes en hardware de consumo.
- Investigacion en cuantizacion de arquitecturas hibridas: el repositorio sirve como artefacto reproducible para estudiar el efecto de la precision reducida sobre capas recurrentes lineales, comparando las cuatro variantes publicadas con el control BF16.
- Procesamiento de documentos largos con presupuesto de memoria ajustado: la evaluacion sobre 131.000 tokens y las variantes por debajo de 4 GiB permiten explorar resumen o extraccion sobre entradas extensas en GPUs modesta, siempre que se valide antes la calidad real.

## Benchmarks y rendimiento

Datos autoevaluados por el autor y recogidos en la model card. No hay verificacion independiente disponible. La columna de velocidad corresponde a decodificacion en un equipo de pruebas con NVIDIA GeForce RTX 4080 Super (VRAM declarada de 32 GB, cifra que no coincide con las especificaciones comerciales habituales de ese modelo).

| Variante | Huella | Perplejidad (131k tokens) | GSM8K | Matematicas olimpiada | AST Python | AST tool calling Hermes | Velocidad decodificacion |
|---|---|---|---|---|---|---|---|
| Arm 0 Base BF16 | 17,14 GiB | 2,4306 | 23/25 (92,0%) | 2/10 (20,0%) | 14/15 (93,3%) | 15/15 (100,0%) | 27,0 t/s |
| Arm 4 GTAP Q4_K_M | 5,38 GiB | 2,3324 | 24/25 (96,0%) | 2/10 (20,0%) | 14/15 (93,3%) | 14/15 (93,3%) | 68,9 t/s |
| Arm 3 GTAP IQ3_XXS | 4,10 GiB | 2,6031 | 16/25 (64,0%) | 2/10 (20,0%) | 15/15 (100,0%) | 14/15 (93,3%) | 84,6 t/s |
| Arm 5 GTAP IQ2_M | 3,79 GiB | 2,7228 | 22/25 (88,0%) | 4/10 (40,0%) | 13/15 (86,7%) | 14/15 (93,3%) | 87,4 t/s |
| Arm 6 GTAP IQ2_XXS | 3,43 GiB | 2,8023 | 10/25 (40,0%) | 1/10 (10,0%) | 11/15 (73,3%) | 11/15 (73,3%) | 97,7 t/s |

No se dispone de resultados en MMLU, HumanEval, BBH ni de comparaciones con otras familias de modelos en la informacion proporcionada.

## Requisitos de hardware

- Huella de pesos de este repositorio: 5,38 GiB en disco y en VRAM si se descarga por completo en GPU (5,02 bits por peso).
- VRAM estimada para inferencia: 5,38 GiB de pesos mas cache KV y overhead del runtime. Para 8.192 tokens de contexto con cuantizacion por defecto, una GPU de 8 GB puede ser suficiente, aunque no se especifica el tamano exacto de la cache KV; con 12-16 GB se opera con margen comodo.
- Variantes de menor huella: IQ3_XXS (4,10 GiB), IQ2_M (3,79 GiB) e IQ2_XXS (3,43 GiB), aptas para GPUs de 6-8 GB segun contexto.
- GPU de referencia declarada por el autor: NVIDIA GeForce RTX 4080 Super con 32 GB de VRAM (cifra no estandar para ese modelo comercial; conviene verificar el hardware real de las pruebas).
- GPUs profesionales compatibles por capacidad: A100, H100, L40S, RTX 4090, RTX 3090, siempre que se disponga de al menos 8 GB de VRAM efectiva para la variante Q4_K_M.
- Modelo no apto para CPU pura en cargas interactivas: no se reportan metricas de decodificacion en CPU, solo con descarga completa en GPU (-ngl 99).
- Opciones de despliegue: llama.cpp mediante llama-cli y llama-server (comandos documentados en la model card), con soporte de atencion flash (-fa on). No se documenta soporte de vLLM, TGI, TensorRT-LLM ni SGLang para este artefacto GGUF.
- Latencia por token derivada de los datos declarados: aproximadamente 14,5 ms en Q4_K_M (68,9 t/s), 11,8 ms en IQ3_XXS, 11,4 ms en IQ2_M y 10,2 ms en IQ2_XXS. Son valores de un solo flujo y de un unico banco de pruebas.
- Throughput: hasta 97,7 tokens/s en la variante IQ2_XXS, segun el autor.

## Comparativa con modelos similares

La unica comparacion con datos disponibles es interna, entre el modelo sin cuantizar y las distintas variantes GTAP v3, todas sobre el mismo modelo base Qwen/Qwen3.5-9B. No se han publicado comparaciones con otras familias de pesos abiertos en la informacion proporcionada.

| Alternativa | Parametros | Precision / huella | Contexto | Perplejidad (131k) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (GTAP v3 Q4_K_M) | 9,2 B | ~5,02 bpw / 5,38 GiB | no declarado | 2,3324 | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (base BF16) | 9,2 B | BF16 / 17,14 GiB | no declarado | 2,4306 | no disponible | HuggingFace / ModelScope |
| GTAP v3 IQ3_XXS | 9,2 B | ~3,3 bpw / 4,10 GiB | no declarado | 2,6031 | apache-2.0 | HuggingFace |
| GTAP v3 IQ2_M | 9,2 B | ~2,7 bpw / 3,79 GiB | no declarado | 2,7228 | apache-2.0 | HuggingFace |
| GTAP v3 IQ2_XXS | 9,2 B | ~2,4 bpw / 3,43 GiB | no declarado | 2,8023 | apache-2.0 | HuggingFace |
| DuoNeural Qwen-3.5-9B-GGUF | 9,2 B | GGUF sin especificar | no declarado | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Artefacto experimental: la propia model card lo etiqueta como version en investigacion, pendiente de verificacion y validacion empirica adicional. No debe usarse en produccion sin una evaluacion propia.
- Cero validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin articulo, informe tecnico ni replicacion de terceros.
- Metrica extraordinaria sin replicar: que la version cuantizada a ~5 bits obtenga mejor perplejidad que el BF16 original (2,3324 frente a 2,4306) contradice el comportamiento habitual de la cuantizacion y no esta explicada mas alla de la formulacion teorica del autor. Tratar como no confirmado.
- Muestras de evaluacion muy pequenas: 25 problemas de GSM8K, 10 de olimpiada, 15 de codigo y 15 de tool calling. Los intervalos de confianza son amplios y las diferencias entre variantes pueden no ser significativas.
- Razonamiento matematico avanzado limitado: 2/10 (20%) en problemas de olimpiada en casi todas las variantes, con un maximo de 4/10 en IQ2_M.
- Degradacion severa por debajo de 3 bits: la variante IQ2_XXS cae a 10/25 (40%) en GSM8K y 1/10 (10%) en olimpiada, lo que sugiere que la estabilidad teorica no se traduce necesariamente en calidad funcional.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue de esta cuantizacion ni del modelo base en este repositorio.
- Longitud de contexto nominal no declarada: aunque se evalua perplejidad sobre 131.000 tokens, no se especifica el maximo soportado ni si la cuantizacion lo preserva.
- Discrepancia de hardware: el banco de pruebas se describe como RTX 4080 Super con 32 GB de VRAM, configuracion que no corresponde a las especificaciones comerciales habituales de esa GPU, lo que dificulta reproducir las cifras de velocidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de 9,2 B en contexto conversacional, es esperable en tareas de conocimiento factual.
- Sesgos: no documentados por el autor.
- Licencia: apache-2.0 en este repositorio, lo que en principio permite uso comercial, pero la licencia del modelo base Qwen/Qwen3.5-9B no se especifica en la informacion proporcionada y deberia verificarse antes de cualquier despliegue comercial.
- Formato GGUF unicamente: no hay pesos safetensors de esta variante, por lo que no es directamente compatible con pilas de inferencia que solo aceptan transformers o vLLM con pesos nativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/Qwen3.5-9B-GTAP-v3-Q4_K_M-GGUF
- Variante IQ2_M de la misma familia: https://huggingface.co/DuoNeural/Qwen3.5-9B-GTAP-v3-IQ2_M-GGUF
- Repositorio GGUF adicional del autor: https://huggingface.co/DuoNeural/Qwen-3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficha del modelo base en ModelScope: https://www.modelscope.cn/models/qwen/Qwen3.5-9B/summary
- Pagina del modelo base en Ollama: https://ollama.com/library/qwen3.5:9b
- Listado de modelos de seguridad ofensiva que referencia el autor: https://github.com/JoasASantos/Offensive-Security-AI-Models
- Paper o informe tecnico del metodo G-TAP v3: no disponible
- Repositorio de codigo de DuoNeural: no disponible
- Demo en linea: no disponible
