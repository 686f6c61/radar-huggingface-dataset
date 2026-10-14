# darioooooo0o/JEV-27B-VL-GPTQ-Int4-asym

## Resumen

JEV-27B-VL-GPTQ-Int4-asym es una cuantizacion asimetrica en GPTQ int4 del modelo multimodal autotrust/JEV-27B-VL, publicada por el usuario darioooooo0o. El modelo original es el Qwen3.8-27B sin modificar (pesos identicos byte a byte a Qwen/Qwen3.8-27B) mas un LoRA de rango 32, una cabeza de decision y un fichero de calibracion; es decir, un diseno de dos sistemas: el "System 2" es el modelo base y el "System 1" es el mismo motor con el adaptador activado. Esta version reduce los pesos a int4 para que el conjunto quepa en una sola tarjeta Intel Arc Pro B70 de 32 GB, cuando la tarjeta original exige 80 GB o mas.

El repositorio contiene el backbone cuantizado (GPTQ asimetrico, group size 128, busqueda de clip por MSE, que segun el autor deja aproximadamente la mitad de KL respecto a BF16 que un GPTQ simetrico del mismo tamano) y los ficheros propios de JEV sin modificar: adapter_vllm/ con el LoRA y la cabeza de decision, calibration.json y serve_decide.py. El LoRA se aplica en tiempo de ejecucion, no se fusiona, de modo que ambos sistemas se sirven desde un unico servidor. El modelo es de tipo image-text-to-text, con 27.781.427.952 parametros y una ventana maxima declarada de 131K tokens.

Su relevancia practica es doble: demuestra que un modelo de ~28B con decision calibrada se puede servir en hardware de 24-32 GB no NVIDIA (Intel XPU), y publica una evaluacion reproducible con las reglas fijadas antes de ejecutar las pruebas y con las salidas por item en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (64 capas, de las cuales solo 16 mantienen cache KV) sobre backbone Qwen3.8-27B; LoRA de rango 32 y cabeza de decision aplicados en tiempo de ejecucion |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | 131.072 tokens (131K) |
| Tipos de cuantizacion | GPTQ int4 asimetrico (g128, MSE clip search); cache KV en fp8; BF16 como referencia del modelo base |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (backbone cuantizado), mas adaptador LoRA y calibration.json en adapter_vllm/ |

## Arquitectura y entrenamiento

El backbone es Qwen3.8-27B, un transformer hibrido: de las 64 capas, solo 16 conservan cache KV y el resto usan atencion lineal, lo que reduce mucho el coste de memoria en contextos largos (el autor estima 10,1 GiB de cache KV, unos 308K tokens en fp8, con GPU_UTIL=0.90 y 131K de contexto maximo). Sobre esa base se anaden un LoRA de rango 32, una cabeza de decision y un fichero de calibracion, que convierten la salida en probabilidades calibradas para tareas de eleccion, yes/no y valoracion 0-5. La torre de vision y los embeddings (3,2 GiB) permanecen en RAM del host y se leen por PCIe.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ni en esta cuantizacion ni en la model card citada. La innovacion tecnica destacable es la combinacion de una cuantizacion GPTQ asimetrica con busqueda de clip por MSE (el autor afirma que el int4 es identico al de su cuantizacion del backbone sin los ficheros de JEV) y la aplicacion del LoRA en runtime, que permite alternar System 1 y System 2 desde el mismo servidor vLLM.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado image-text-to-text y conversacional.
- Entrada multimodal de imagenes en el modelo base; en esta cuantizacion el autor indica explicitamente que las entradas de imagen no se han probado.
- Modo thinking (`thinking: "on"` / `"auto"`) disponible en el modelo base; no probado en esta cuantizacion. En este montaje rinde a unos 8 tok/s.
- Decision con probabilidades calibradas mediante la API propia de JEV (`/v1/decide`, o modelo `jev-decision` a traves de `/v1/completions`): tipo `choice` (eleccion entre opciones), yes/no y ratings de 0 a 5, mas un modo `state`/`question`/`options`.
- Clasificacion de texto a escala con acuerdo top-1 del 94,6% en 9.199 filas held-out.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Agentes y razonamiento multi-paso: el diseno separa un "System 1" de decision rapida y un "System 2" de razonamiento; no se documentan pipelines de agentes.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Enrutado de tickets de soporte: con `kind: "choice"` y un estado de conversacion mas una pregunta, el modelo reparte casos entre equipos (billing, shipping, tech support) con probabilidades calibradas; en el ejemplo de la card devuelve 0,9954 / 0,0000 / 0,0046. Adecuado porque la decision es de baja latencia: unas 11 decisiones por segundo con 8 peticiones concurrentes en una B70.
- Filtrado yes/no con umbral de confianza: la cabeza calibrada permite fijar un umbral y derivar a revision humana los casos dudosos. La evaluacion reporta AUROC 1,000 en filas held-out cuyo objetivo no esta cerca de 50/50 (frente a 0,995 de referencia).
- Puntuacion de encuestas, resenas o satisfaccion (0-5): el MAE de la nota esperada es 0,107 frente a 0,098 de referencia, suficiente para metricas agregadas y analitica de producto.
- QA biomedico y triaje de literatura: en PubMedQA (500 preguntas) alcanza 78,4% de accuracy frente a 77,8% del BF16 de JEV, con 97,6% de respuestas identicas a BF16; util para preclasificar resumenes antes de revision experta.
- Clasificacion masiva por lotes: 9.199 filas de eleccion multiple procesadas en 853 s con 8 secuencias simultaneas, adecuado para etiquetado offline y backfills.
- Asistente conversacional en ingles con contexto largo: la ventana de 131K tokens permite mantener hilos extensos o documentos completos, y en tarjetas de 24 GB la cache KV resultante (4,6 GiB, unos 138K tokens) cubre el contexto completo.
- Despliegue en infraestructura no NVIDIA: pensado para Intel Arc Pro B70 (32 GB) y factible en tarjetas de 24 GB con GPU_UTIL=0.72, lo que abre el caso de uso de servir un modelo de ~28B en parque de workstation con XPU.
- Lectura de imagenes (image-text-to-text) heredada del modelo base: aplicable en teoria a tareas documento-imagen, pero no validada en esta cuantizacion.

## Benchmarks y rendimiento

Todas las comprobaciones son solo texto, con reglas fijadas antes de ejecutarlas segun el autor.

| Prueba | int4 en B70 | Referencia | Regla | Resultado |
|---|---|---|---|---|
| Ejemplo de la model card (billing / shipping / tech support) | 0,9954 / 0,0000 / 0,0046 | 0,9969 / 0,0000 / 0,0031 (card) | – | Coincide |
| PubMedQA, 500 preguntas, accuracy | 78,4% | 77,8% (ejecucion BF16 de JEV) | Dentro de 2 puntos | Pasa |
| PubMedQA, misma respuesta que BF16 | 97,6% | – | – | – |
| PubMedQA, respuestas invertidas donde BF16 tenia >= 80% de seguridad | 0 de 333 | – | <= 1% | Pasa |
| yes/no held-out (500 filas), AUROC en filas con objetivo no proximo a 50/50 | 1,000 | 0,995 (card, 30K completas) | >= 0,985 | Pasa |
| ratings 0-5 held-out (500 filas), MAE de la nota esperada | 0,107 | 0,098 (card) | <= 0,15 | Pasa |
| choice held-out, 9.199 filas, acuerdo top-1 en filas claras | 94,6% (7.305 / 7.723) | 95,8% (card) | >= 93% | Pasa |

KL respecto a los objetivos held-out: aproximadamente 0,020 (ponderado a la mezcla del conjunto completo); la card de JEV da ~0,017, pero solo en "filas etiquetadas por Jev", un subconjunto que no define.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento o razonamiento en la informacion disponible.

## Requisitos de hardware

- VRAM: 14,8 GiB de pesos en la GPU; cache KV de 10,1 GiB (aprox. 308K tokens en fp8) con GPU_UTIL=0.90 y contexto maximo de 131K.
- RAM de host: alrededor de 12 GB libres; los embeddings y la torre de vision (3,2 GiB) se quedan en RAM y se leen por PCIe, por lo que no basta con la GPU.
- GPU probada: Intel Arc Pro B70 (32 GB, Battlemage). Otras tarjetas Battlemage de 32 GB, segun el autor, sin probar. El modelo base original pide 80 GB o mas.
- GPU de consumo: en tarjetas de 24 GB funciona con GPU_UTIL=0.72 (vLLM en 21,8 GiB y 4,6 GiB de cache KV, aprox. 138K tokens, suficiente para 131K de contexto). Comprobado solo en la B70 bajo ese limite, no en una tarjeta real de 24 GB. No se documentan requisitos ni rendimiento en CUDA.
- Despliegue: vLLM sobre XPU con la imagen vllm/vllm-openai-xpu:v0.31.0, Docker con /dev/dri y los parches y kernels de atencion del cookbook del autor. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: System 1 unas 11 decisiones/s con 8 peticiones concurrentes (9.199 filas en 853 s; 500 resumenes de PubMedQA en 163 s). System 2 / thinking va en modo eager, con LoRA activado y sin MTP, a unos 8 tok/s; con una mediana de 700-800 tokens por pregunta en la card de JEV, eso supone alrededor de minuto y medio por pregunta.
- Restriccion operativa: hay que mantener `--max-num-seqs 8`; con mas de 8 secuencias por lote, la ruta LoRA de vLLM devuelve probabilidades incorrectas en System 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| JEV-27B-VL-GPTQ-Int4-asym (este) | 27,78B | 131K | Safetensors, GPTQ int4 asimetrico | Apache 2.0 | 14,8 GiB de pesos; ~11 decisiones/s en una B70 de 32 GB |
| autotrust/JEV-27B-VL (base) | no disponible (el nombre indica 27B) | no disponible | no disponible (BF16) | Apache 2.0 | Exige GPU de 80 GB o mas segun el autor |
| darioooooo0o/Qwen3.8-27B-GPTQ-Int4-asym | no disponible | no disponible | Safetensors, GPTQ int4 asimetrico | no disponible | Misma cuantizacion del backbone sin los ficheros de decision de JEV |
| Qwen/Qwen3.8-27B | no disponible | no disponible | Safetensors | no disponible | Backbone sin modificar; pesos identicos byte a byte a los del modelo base |

No se dispone de comparativas publicadas con alternativas de otros fabricantes en la misma categoria dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion limitada a texto: entradas de imagen, modo thinking y contextos por encima de 131K no se han probado en esta cuantizacion.
- Idioma: solo ingles declarado; no hay datos de rendimiento en castellano ni en otros idiomas.
- Alucinacion: no se publican tasas ni evaluaciones de fidelidad factual. La calibracion permite umbralizar la confianza, pero no sustituye a una validacion de contenido.
- La referencia de PubMedQA mezcla error de cuantizacion int4 con la diferencia VL frente a texto, que la card de JEV situa en un |delta p| medio de 0,010; la discrepancia del 2,4% no se puede atribuir por completo al int4.
- En choice, la primera comprobacion sobre 500 filas dio 92,9% (un item por debajo del umbral) y se reejecuto sobre el conjunto completo (94,6%) con reglas fijadas de antemano; conviene leer el historial antes de extrapolar.
- La definicion de "fila clara" no es la misma en la card de JEV y en esta evaluacion, por lo que la brecha de 1,2 puntos frente a 95,8% no se puede separar entre error int4 y diferencia de criterio.
- El AUROC de yes/no solo cuenta filas claramente si/no (a mas de 10 puntos de 50/50), por lo que no es directamente comparable con el 0,995 de la card.
- Inconsistencia de metadatos: el tag del repositorio es `qwen3_5` mientras que la model card habla de Qwen3.8-27B.
- Dependencia fuerte del entorno: XPU, Docker con /dev/dri, imagen vLLM fijada y kernels externos descargados de un release; la ruta CUDA no esta documentada ni probada.
- Rendimiento pobre del modo razonamiento en este montaje (unos 8 tok/s, en torno a minuto y medio por pregunta), que lo descarta para uso interactivo con thinking activado.
- Licencia Apache 2.0 en este repositorio, lo que en principio permite uso comercial; no se detallan en la informacion disponible las condiciones propias de autotrust/JEV-27B-VL ni de Qwen/Qwen3.8-27B, que conviene verificar antes de produccion.
- Madurez: repositorio con 0 descargas y 0 likes, publicado el 2026-10-14, sin validacion externa conocida.
- Sesgos conocidos: no disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darioooooo0o/JEV-27B-VL-GPTQ-Int4-asym
- Modelo base: https://huggingface.co/autotrust/JEV-27B-VL
- Repositorio demo de JEV: https://github.com/yuhai-china/JEV-27B-DEMO
- Cookbook del autor para Intel B70 (parches vLLM y kernels de atencion): https://github.com/riceharvest/b70-qwen38-cookbook
- Cuantizacion equivalente del backbone sin ficheros de decision: https://huggingface.co/darioooooo0o/Qwen3.8-27B-GPTQ-Int4-asym
- Backbone original: https://huggingface.co/Qwen/Qwen3.8-27B
- Imagen de despliegue: vllm/vllm-openai-xpu:v0.31.0 (Docker)
