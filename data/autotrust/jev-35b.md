# autotrust/JEV-35B

## Resumen

autotrust/JEV-35B es un modelo de decision de pesos abiertos desarrollado por AutoTrust AI, construido como un ajuste fino supervisado sobre Qwen/Qwen3.5-35B-A3B. No es un modelo generativo de proposito general: es un modelo de "System 1" orientado a producir decisiones tipadas ("typed decisions") con probabilidades calibradas sobre un conjunto de opciones, leyendo hasta 256 opciones en una sola pasada. Se publica con licencia Apache 2.0 y esta etiquetado en HuggingFace con el pipeline `text-classification`.

La arquitectura subyacente es un transformer de mezcla de expertos (MoE): 35.951.822.704 parametros totales, de los cuales aproximadamente 3.000 millones estan activos por token, segun indica el propio autor. Ademas del texto, los tags del repositorio incluyen `image-text-to-text`, y la model card reporta una puntuacion de vision reconstruida de 71,94, aunque la pipeline oficial declarada sea de clasificacion de texto.

El modelo es relevante porque ocupa un nicho poco habitual: en lugar de generar respuestas libres, puntua y ordena alternativas (recomendacion, re-ranking, clasificacion, enrutado de herramientas) con latencia baja (204 ms de mediana por peticion sobre una sola B200) y en una unica pasada. El autor declara un indice de Decision Index 0.3 publico de 59,73, frente a 53,64 de su modelo hermano JEV-27B-VL, y publica una variante NVFP4 de 25,6 GB que reduce el peso a 23,3 GiB de VRAM. El modelo no esta afiliado a TypeSafe AI, fabricante del modelo propietario TypeSafe Jev 1.13.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tag `qwen3_5_moe`; base Qwen/Qwen3.5-35B-A3B |
| Parametros totales | 35.951.822.704 (aprox. 35,95 B) |
| Parametros activos | Aproximadamente 3 B por token (segun el autor, "about 3 B active per token") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (repo principal); NVFP4 en el repositorio autotrust/JEV-35B-NVFP4 (expertos enrutados en NVFP4) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; compatible con vLLM) |

## Arquitectura y entrenamiento

JEV-35B se presenta como un ajuste fino (`base_model_relation: finetune`) de Qwen/Qwen3.5-35B-A3B, un transformer con mezcla de expertos de aproximadamente 36.000 millones de parametros totales y unos 3.000 millones activos por token. El modelo no opera en modo generativo libre: su proposito es emitir decisiones tipadas y calibradas, leyendo hasta 256 opciones en una unica pasada y sin activar el modo de razonamiento ("System 1 only, thinking off"). En la suite publica 0.3 respondio las 140.178 peticiones puntuables con 0 errores, evaluadas con la herramienta del autor (`score --edition 0.3`).

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. Tampoco se especifican innovaciones de atencion o decodificacion especulativa. Lo que si se documenta es el formato de salida: decisiones tipadas con probabilidades calibradas, con etiquetas semanticas como `choice` y `score`, y una variante cuantizada NVFP4 que conserva el mismo `serve.sh` y la misma API, con un 96,6 % de respuestas identicas a bf16 en el Decision Index y la misma latencia.

## Capacidades

- Clasificacion de texto y puntuacion de opciones: el modelo lee hasta 256 alternativas en una sola pasada y devuelve una decision tipada con probabilidad calibrada.
- Decision index propio: el autor mantiene una suite de evaluacion (Decision Index 0.3) con cinco areas: Knowledge & Reasoning, Language, Retrieval & Classification, Tools & Automation y Arts & Taste.
- Razonamiento y conocimiento: puntuaciones destacadas en MMLU-Pro (0,642), GPQA Diamond (0,360), WinoGrande (0,841) y BBH (0,647), segun los datos de la model card.
- Comprension del lenguaje: HellaSwag (0,962), FinEntity (0,855), ContractNLI (0,732), iSarcasmEval (0,426), VAST (0,549), NLI4CT (0,626) y RAGTruth (0,665).
- Recuperacion y clasificacion: CLINC150+OOS (0,943), BANKING77 (0,921), BRIGHT (0,421), Amazon ESCI (0,520), PhishNChips (0,660) y HoVer (0,762).
- Tool calling / function calling: BFCL con 0,950, el area de Tools & Automation es la de mayor habilidad declarada (0,764).
- Vision (image-text-to-text): el autor reporta una puntuacion de vision reconstruida de 71,94, aunque no detalla la lista de benchmarks de vision empleada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Sin modo de razonamiento extendido: el modelo se evalua explicitamente con "thinking off".

## Casos de uso

- Re-ranking de resultados de busqueda: el autor lo usa en su demo GuruSearch para reordenar resultados de Google News, Bing News y Yahoo News por relevancia, comparando su orden con el de los buscadores. El modelo puntua cada candidato en una sola pasada de hasta 256 opciones.
- Recomendacion de contenidos: en la misma demo, ordena los titulares mas recientes de seis fuentes de noticias por importancia, con una decision calibrada por elemento y latencias de aproximadamente 204 ms por peticion.
- Enrutado y seleccion de herramientas en agentes: con BFCL en 0,950, es adecuado para decidir que funcion o herramienta invocar en pipelines de agentes, devolviendo la eleccion con una probabilidad asociada.
- Clasificacion de intenciones en atencion al cliente: BANKING77 (0,921) y CLINC150+OOS (0,943) lo sitúan como candidato para enrutar tickets o consultas a la cola o al equipo correcto, incluyendo deteccion de consultas fuera de dominio.
- Moderacion y deteccion de fraude o phishing: PhishNChips pasa de 0,238 en JEV-27B-VL a 0,660 en JEV-35B, y Amazon ESCI alcanza 0,520, lo que permite puntuar y filtrar URLs, listados o productos sospechosos.
- Verificacion de hechos y atribucion: HoVer (0,762) y RAGTruth (0,665) permiten comprobar si una afirmacion esta respaldada por las evidencias aportadas, util para sistemas RAG con control de alucinacion.
- Analisis de contratos y documentos legales: ContractNLI (0,732) y NLI4CT (0,626) permiten clasificar clausulas y determinar si una hipotesis se deduce de un texto contractual.
- Etiquetado y anotacion a escala: la capacidad de procesar 140.178 peticiones sin errores en la suite publica indica que es viable para tareas de anotacion masiva por lotes, con salida estructurada en lugar de texto libre.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente). La puntuacion de area reescala la metrica propia del benchmark de modo que el azar vale 0; ★ indica benchmark dorado (peso 1,2). El mejor resultado de cada fila aparece en negrita.

Indice global:

| Metrica | Valor |
|---|---|
| Decision Index 0.3, suite publica (System 1) | 59,73 |
| Verificado | no (resultado propio del autor con su kit, no una entrada del board) |
| Puntuacion de vision reconstruida | 71,94 |
| Latencia mediana por peticion (una B200) | 204 ms |
| Peticiones puntuables respondidas | 140.178 (0 errores) |

Habilidad por area, frente a autotrust/JEV-27B-VL:

| Area (habilidad) | Knowledge & Reasoning | Language | Retrieval & Classification | Tools & Automation | Arts & Taste |
|---|---|---|---|---|---|
| JEV-35B | 0,426 | 0,632 | 0,710 | 0,764 | 0,422 |
| JEV-27B-VL | 0,414 | 0,564 | 0,537 | 0,735 | 0,416 |

Knowledge & Reasoning (area 0,426; JEV-27B-VL 0,414):

| Benchmark | JEV-35B | JEV-27B-VL |
|---|---|---|
| GPQA Diamond ★ | **0,360** | 0,265 |
| GSM8K (reconstruccion 0.3) | 0,360 | **0,542** |
| ChessBench | **0,127** | 0,091 |
| MuSR | 0,361 | **0,402** |
| SATA-Bench | 0,284 | **0,328** |
| CRUXEval | 0,546 | **0,583** |
| CLadder | **0,441** | 0,410 |
| HLE ★ | 0,000 | 0,000 |
| MMLU-Pro ★ | **0,642** | 0,567 |
| BBH ★ | 0,647 | **0,695** |
| WinoGrande ★ | **0,841** | 0,651 |

Language Understanding (area 0,632; JEV-27B-VL 0,564):

| Benchmark | JEV-35B | JEV-27B-VL |
|---|---|---|
| ContractNLI | **0,732** | 0,639 |
| ANLI ★ | 0,545 | **0,658** |
| HellaSwag ★ | **0,962** | 0,900 |
| ACOS | **0,276** | 0,169 |
| FinEntity | **0,855** | 0,755 |
| iSarcasmEval | **0,426** | 0,254 |
| VAST | **0,549** | 0,322 |
| NLI4CT | 0,626 | **0,694** |
| RAGTruth | **0,665** | 0,604 |

Retrieval & Classification (area 0,710; JEV-27B-VL 0,537):

| Benchmark | JEV-35B | JEV-27B-VL |
|---|---|---|
| BANKING77 ★ | **0,921** | 0,739 |
| CLINC150+OOS ★ | **0,943** | 0,845 |
| BRIGHT ★ | **0,421** | 0,417 |
| Amazon ESCI | **0,520** | 0,430 |
| PhishNChips | **0,660** | 0,238 |
| HoVer | **0,762** | 0,478 |

Tools & Automation (area 0,764; JEV-27B-VL 0,735). La model card disponible solo muestra la primera fila de esta tabla:

| Benchmark | JEV-35B | JEV-27B-VL |
|---|---|---|
| BFCL ★ | **0,950** | 0,946 |

Ganancia en puntos de habilidad por benchmark, segun el autor: PhishNChips +42,2; HoVer +28,4; Habermas Machine +28,1; VAST +22,7; WinoGrande +18,9; BANKING77 +18,3; iSarcasmEval +17,2; When2Call +14,9; GPQA +9,5. Queda por detras en POP909-CL (-25,8), GSM8K (-18,2), ANLI (-11,4), BPoMP (-10,9), NLI4CT (-6,8) y BBH (-4,7). El autor indica que JEV-35B gana en las cinco areas y en 24 de los 37 benchmarks.

Comparativa de la variante cuantizada NVFP4:

| Version | Descarga | Memoria GPU (pesos) | Decision Index 0.3 publico | Vision (reconstruccion) |
|---|---|---|---|---|
| autotrust/JEV-35B (bf16) | 72 GB | 66,5 GiB | 59,73 | 71,94 |
| autotrust/JEV-35B-NVFP4 | 25,6 GB | 23,3 GiB | 59,18 | 71,23 |

## Requisitos de hardware

- VRAM para inferencia en bf16: 66,5 GiB de memoria para los pesos; el repositorio ocupa 144,9 GB en total (incluye otras revisiones y artefactos).
- VRAM para inferencia en NVFP4: 23,3 GiB de pesos, con una descarga de 25,6 GB. Segun el autor, cabe en una sola GPU de 32 a 48 GB.
- GPU recomendadas: el dato de latencia publicado se midio en una NVIDIA B200 (204 ms de mediana por peticion). No se proporcionan cifras para A100, H100 o RTX 4090.
- GPU de consumo: la version NVFP4 es la unica que puede caber en tarjetas de gama alta para consumidor con 32-48 GB de VRAM (por ejemplo, RTX 5090 de 32 GB, segun el rango que indica el autor). La version bf16, con 66,5 GiB de pesos, queda fuera de ese segmento.
- Opciones de despliegue: vLLM (etiqueta `vllm` en el repositorio y `endpoints_compatible`), transformers y el script `serve.sh` propietario del autor, compartido entre las versiones bf16 y NVFP4 con la misma API.
- Latencia: 204 ms de mediana por peticion en bf16 sobre una B200, frente a 271 ms de JEV-27B-VL. El autor indica que la version NVFP4 mantiene la misma latencia. No se publican datos de throughput ni de latencia en otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Decision Index 0.3 publico | Vision (reconstruccion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| autotrust/JEV-35B | 35,95 B | aprox. 3 B | no disponible | 59,73 | 71,94 | Apache 2.0 | pesos abiertos en HuggingFace |
| autotrust/JEV-35B-NVFP4 | 35,95 B | aprox. 3 B | no disponible | 59,18 | 71,23 | Apache 2.0 | pesos abiertos en HuggingFace (25,6 GB) |
| autotrust/JEV-27B-VL | no disponible | no disponible | no disponible | 53,64 | 71,67 | no disponible | pesos abiertos en HuggingFace |
| TypeSafe Jev 1.13 | no disponible | no disponible | no disponible | no disponible | no disponible | propietaria (modelo alojado) | solo servicio cerrado, sin pesos |
| Qwen/Qwen3.5-35B-A3B | 35,95 B (modelo base) | aprox. 3 B | no disponible | no disponible | no disponible | no disponible | pesos abiertos en HuggingFace |

No se dispone en la informacion proporcionada de resultados comparables de otros modelos de decision de la misma categoria, ni de cifras de contexto, rendimiento o licencia de los modelos base y propietario citados.

## Limitaciones y advertencias

- Idiomas: el repositorio declara unicamente ingles (`language: en`). El rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Longitud de contexto: no disponible. No es posible planificar cargas con documentos largos sin verificarla experimentalmente.
- Resultados no verificados: el valor 59,73 del Decision Index 0.3 es una puntuacion propia del autor ("our scoring with the kit, not a board entry"). El board completo incluye un 80 % de pruebas privadas que solo ejecutan sus mantenedores, por lo que la cifra publica no es directamente comparable con la puntuacion total del board.
- Datos de entrenamiento opacos: no se documentan tokens, composicion del dataset, ni si hubo RLHF o DPO. Esto limita la evaluacion de sesgos y de riesgo de contaminacion de benchmarks.
- Alucinacion: aunque el modelo esta orientado a decisiones tipadas y calibradas, las probabilidades declaradas no han sido auditadas de forma independiente; en tareas de generacion de respuesta corta con citas (demo GuruSearch) persiste el riesgo de atribuciones incorrectas.
- Resultados flojos en varias tareas: GPQA Diamond 0,360, GSM8K 0,360, ChessBench 0,127, SATA-Bench 0,284, ACOS 0,276 y HLE 0,000 indican un rendimiento bajo en matematicas, razonamiento cientifico de nivel avanzado y algunas tareas de conocimiento. Retrocede frente a JEV-27B-VL en GSM8K, ANLI, BBH, MuSR, SATA-Bench y CRUXEval.
- Dependencia de herramienta propia: la evaluacion se realiza con el kit del autor (`score --edition 0.3`), lo que dificulta la reproducibilidad por terceros.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-35B-A3B, cuya licencia no se especifica en la informacion disponible.
- Confusion de identidad: el modelo no esta afiliado, respaldado ni es producto de TypeSafe AI, fabricante del modelo propietario TypeSafe Jev 1.13. Conviene no confundir ambas marcas en documentacion o materiales comerciales.
- Requisitos de memoria: la version bf16 necesita 66,5 GiB solo para pesos, lo que obliga a hardware de centro de datos o a usar la variante NVFP4.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/autotrust/JEV-35B
- Variante NVFP4: https://huggingface.co/autotrust/JEV-35B-NVFP4
- Modelo hermano JEV-27B-VL: https://huggingface.co/autotrust/JEV-27B-VL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Demo en vivo de recomendacion y busqueda (AutoTrust/GuruSearch): https://news.guru.so/ui
- Imagen de la demo: https://huggingface.co/autotrust/JEV-27B-VL/resolve/main/assets/autotrust_gurusearch_demo.png

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos enlaces utiles proceden del repositorio de HuggingFace y de su model card.
