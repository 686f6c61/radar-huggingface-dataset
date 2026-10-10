# autotrust/GLM5.3-Flash-E192-DGX-Spark

## Resumen

GLM5.3-Flash-E192-DGX-Spark es una derivacion no oficial de zai-org/GLM-5.3-Flash publicada por el usuario autotrust. Se trata de un modelo de mezcla de expertos (MoE) multimodal (image-text-to-text) cuantizado en NVFP4 con ModelOpt, en el que se han conservado 192 de los 288 expertos enrutados por capa mediante busqueda de arquitectura neuronal (NAS). El resultado es la variante mas ligera de la familia: 124 GiB de pesos (132,4 GB), frente a los 159 GiB de la variante E256 o los 306 GB del checkpoint FP8 original, manteniendo 18.000 millones de parametros activos por token con top-8 de 192 expertos.

El modelo conserva el vocabulario completo de 154.880 tokens, la torre de vision intacta (imagen y video) y una capa MTP (nextn) que se distribuye cuantizada en NVFP4 dentro del propio repositorio (mtp-nvfp4/, 6,98 GB) para decodificacion especulativa. Su relevancia practica es de despliegue: con 110.710.222.718 parametros totales almacenados a 4 bits en los expertos, cabe en dos NVIDIA DGX Spark (2 x 128 GB) unidos por ConnectX-7 con unos 62 GiB de pesos por nodo, o en una sola GPU Blackwell de 180 GB o mas (B200/GB200) dejando 31,8 GiB de cache KV, equivalentes a 2,6 millones de tokens.

El diseno apunta a un nicho muy concreto: inferencia local o de un solo nodo en hardware Blackwell (GB10, DGX Spark) con decodificacion especulativa activada, que segun las mediciones del autor aporta 1,83x de velocidad en decodificacion mono-flujo sobre un B200 (270 tok/s frente a 147 tok/s) sin alterar la calidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) derivado de zai-org/GLM-5.3-Flash; 192 expertos enrutados por capa de 288 originales, seleccionados por NAS; capa MTP (nextn) para decodificacion especulativa; torre de vision intacta |
| Parametros totales | 110.710.222.718 (~110,7 B) segun safetensors |
| Parametros activos | 18 B por token (top-8 de 192 expertos enrutados) |
| Longitud de contexto | No disponible en la informacion proporcionada; en las pruebas publicadas se sirvio con `--max-model-len 66560` y se mencionan presupuestos de razonamiento de 65.536 y 163.840 tokens |
| Tipos de cuantizacion | NVFP4 en expertos enrutados (pesos e2m1 empaquetados dos por byte, escalas de bloque E4M3 sobre grupos de 16 elementos, escala global FP32 por tensor, escalas de entrada estaticas); cache KV en FP8; etiqueta 8-bit |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (layout ModelOpt NVFP4); libreria declarada: vllm |
| Tamano de pesos | 132,4 GB = 124 GiB (repositorio: 139,5 GB) |
| Vocabulario | 154.880 tokens |
| Draft especulativo incluido | mtp-nvfp4/ (6,98 GB), capa MTP original con los 288 expertos enrutados, solo cambia la precision de almacenamiento |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base zai-org/GLM-5.3-Flash (numero de tokens, composicion del dataset, RLHF/DPO), ni detalla el proceso de NAS empleado para reducir de 288 a 192 expertos enrutados por capa. Lo que si se documenta es la intervencion sobre el checkpoint original: se conservan 192 de los 288 expertos enrutados por capa, se mantiene el vocabulario completo de 154.880 tokens y la torre de vision, y los expertos se almacenan en NVFP4 con ModelOpt (pesos e2m1 empaquetados dos por byte, escalas de bloque E4M3 sobre grupos de 16 elementos, escala global FP32 por tensor y escalas de entrada estaticas). La cache KV trabaja en FP8.

La innovacion tecnica destacable es la decodificacion especulativa mediante MTP: el repositorio incluye el draft ya convertido (mtp-nvfp4/), compuesto por la capa MTP original del modelo base (una capa nextn con los 288 expertos enrutados) en la que solo cambia la precision de almacenamiento. vLLM ejecuta el draft con el mismo kernel FlashInfer TRT-LLM NVFP4 MoE que el modelo principal. La decodificacion especulativa es sin perdida de calidad: el modelo objetivo verifica cada token propuesto, de modo que el draft solo afecta a la velocidad. Con MTP activado y `num_speculative_tokens=2`, la longitud media de aceptacion es de 2,48 tokens y la tasa de aceptacion del draft del 73,8 %.

## Capacidades

- Generacion de texto y razonamiento con modos de esfuerzo configurables via plantilla de chat (`reasoning_effort`: low, high, max), con presupuestos de pensamiento de 65.536 tokens y, en modo max, 163.840 tokens.
- Codigo: 93,9 % en HumanEval con decodificacion greedy (154/164).
- Matematicas y razonamiento cientifico: 80,0 % pass@1 en AIME 2025 y 79,8 % en GPQA-Diamond con esfuerzo bajo.
- Vision: procesamiento de imagen y video con la torre de vision intacta; 70,7 % en MMMU val.
- Tool calling / function calling: soporte verificado con `bfcl-eval` v4 contra endpoint compatible con OpenAI y parser `--tool-call-parser glm47`; 88,5 % en BFCL v4 Non-Live AST y 79,5 % en Multi-Turn Base.
- Razonamiento multi-turno y uso de herramientas en agentes: las categorias live y multi-turn de BFCL v4 estan cubiertas de forma explicita.
- Capacidades multilingues limitadas a ingles y chino; el chino esta evaluado con C-Eval (78,3 %).
- Decodificacion especulativa con MTP integrada (draft NVFP4 incluido) para acelerar la generacion mono-flujo.

## Casos de uso

- Inferencia local en estaciones de trabajo Blackwell: el modelo esta disenado para dos DGX Spark (2 x 128 GB) con ConnectX-7, con unos 62 GiB de pesos por nodo, lo que permite ejecutar un MoE de 18 B activos en hardware de escritorio o borde sin depender de la nube.
- Servicio de un solo nodo en B200/GB200: con 31,8 GiB de cache KV (2,6 millones de tokens) se pueden mantener conversaciones muy largas o un lote de peticiones concurrentes relevante; el autor cita 25 peticiones concurrentes a 66 K tokens con MTP activado.
- Agentes con function calling en produccion: el 88,5 % en BFCL v4 Non-Live AST y el soporte de parser `glm47` en vLLM permiten integrarlo en pipelines que invocan APIs y herramientas con esquemas JSON, incluyendo llamadas paralelas (94,5 %) y multiple (96,0 %).
- Asistentes multi-turno para agentes: el 79,5 % en BFCL v4 Multi-Turn Base indica capacidad para mantener estado de herramienta y contexto a lo largo de varios turnos, util en orquestadores de tareas.
- Analisis de documentos con imagen: la torre de vision operativa permite procesar capturas, diagramas o paginas escaneadas junto a texto en un mismo prompt (70,7 % en MMMU val), por ejemplo para extraccion de datos de informes tecnicos.
- Generacion de codigo asistida en IDE o CI/CD: con 93,9 % en HumanEval y soporte de tool calling, encaja en tareas de autocompletado, generacion de tests o revision de parches dentro de un pipeline de integracion continua.
- Razonamiento cientifico y matematico de alta exigencia: con `reasoning_effort=max` y presupuesto de 163.840 tokens, la familia alcanza un 90,9 % en GPQA-Diamond (medido en E224), lo que permite usarlo en validacion de hipotesis o resolucion de problemas paso a paso.
- Atencion al cliente en ingles o chino: dado el soporte bilingue y la ventana de contexto amplia servida por vLLM, es viable gestionar conversaciones largas con historial extenso, con la advertencia de que la deteccion de irrelevancia en tool calling es mejorable (70,4 %).

## Benchmarks y rendimiento

Medidos en un solo B200 con vLLM, `temperature=1.0`, `top_p=0.95` (HumanEval con decodificacion greedy) y presupuesto de 65.536 tokens (16.384 en MMMU). Puntuacion estricta: una respuesta que agota tokens antes de dar la respuesta final cuenta como incorrecta. Todas las cifras son ejecuciones unicas; el decode MoE en vLLM no es bit-determinista, por lo que debe asumirse un ruido de +-2 a 3 puntos.

| Capacidad | Benchmark | Ajuste | E192 (este modelo) | E224 | E256 |
|---|---|---|---|---|---|
| Codigo | HumanEval (164) | greedy | 93,9 % (154/164) | 95,7 % | 97,6 % |
| Razonamiento cientifico | GPQA-Diamond (198) | effort=low | 79,8 % (158/198) | 78,3 % | 77,3 % |
| Conocimiento en chino | C-Eval val (1.606, 52 materias) | effort=low | 78,3 % (1.258/1.606) | 84,0 % | 89,4 % |
| Matematicas | AIME 2025 (30 x 4 muestras, pass@1) | effort=high | 80,0 % (96/120); 30/30 resueltos en al menos 1 muestra | 75,0 % | 74,2 % |
| Vision | MMMU val (900) | effort=low | 70,7 % (636/900) | 73,6 % | 76,1 % |
| Uso de herramientas | BFCL v4 Non-Live AST | plantilla por defecto | 88,5 % | 88,3 % | 87,7 % |
| Uso de herramientas | BFCL v4 Live AST (ponderado) | plantilla por defecto | 79,8 % | 80,3 % | 80,5 % |
| Uso de herramientas | BFCL v4 Multi-Turn Base (200) | plantilla por defecto | 79,5 % | 80,0 % | 73,0 % / 75,0 % |

Desglose de BFCL v4 por categoria (AST match):

| Categoria | Precision |
|---|---|
| simple (Python) | 94,2 % |
| simple (Java) | 61,0 % |
| simple (JavaScript) | 68,0 % |
| multiple | 96,0 % |
| parallel | 94,5 % |
| parallel-multiple | 89,0 % |
| irrelevance detection | 70,4 % |
| live simple | 87,2 % |
| live multiple | 78,3 % |
| live parallel | 75,0 % |
| live parallel-multiple | 66,7 % |
| live irrelevance | 73,8 % |
| live relevance | 93,8 % |
| Multi-Turn Base (200) | 79,5 % |

Rendimiento y decodificacion especulativa (un solo B200, `reasoning_effort=low`, 1.024 tokens de salida, prompts cortos, 8 peticiones por nivel, `--max-model-len 66560 --gpu-memory-utilization 0.93`):

| Draft | `num_speculative_tokens` | Longitud media de aceptacion | Aceptacion del draft | Decode mono-flujo (tok/s) | Aceleracion (1 flujo) | Agregado tok/s @ 8 |
|---|---|---|---|---|---|---|
| off | — | — | — | 147 | 1,00x | 508 |
| mtp-nvfp4/ | 2 (recomendado) | 2,48 | 73,8 % | 270 | 1,83x | 837 |

Con MTP activado, el pool de KV en un B200 baja de 2,6 M a 1,65 M tokens (25 peticiones concurrentes a 66 K), por lo que conviene desactivarlo en servicio de lote con alta concurrencia.

## Requisitos de hardware

- Pesos: 124 GiB (132,4 GB) en NVFP4; el repositorio completo ocupa 139,5 GB.
- Una sola NVIDIA DGX Spark (128 GB): no es viable; solo los pesos llenan el nodo.
- Dos DGX Spark (2 x 128 GB) unidos por ConnectX-7: aproximadamente 62 GiB de pesos por nodo (estimacion del autor), la configuracion con mas espacio para KV de la familia.
- Una GPU Blackwell de 180 GB o mas (B200/GB200): soportado, con 31,8 GiB de cache KV disponibles, equivalentes a 2,6 millones de tokens. La variante E256 requiere 6,5 GiB de KV en el mismo hardware, es decir, va mucho mas justa.
- La cache KV usa FP8; el draft especulativo mtp-nvfp4/ anade 6,98 GB.
- Despliegue: vLLM como libreria declarada, con kernel FlashInfer TRT-LLM NVFP4 MoE. En las pruebas se uso `--tool-call-parser glm47`, `--max-model-len 66560` y `--gpu-memory-utilization 0.93`. No se mencionan opciones como llama.cpp, Ollama o TGI en la informacion proporcionada.
- Throughput medido: 147 tok/s mono-flujo sin MTP y 508 tok/s agregados con 8 peticiones; con MTP (`num_speculative_tokens=2`), 270 tok/s mono-flujo y 837 tok/s agregados.
- No se proporcionan datos de latencia, requisitos de VRAM por cuantizacion alternativa ni soporte en GPU consumer de gama RTX.

## Comparativa con modelos similares

Alternativas de la misma familia, todas derivadas de zai-org/GLM-5.3-Flash y publicadas por el mismo autor:

| Modelo | Expertos enrutados / capa | Parametros activos | Memoria de pesos | 1x B200/GB200 (>=180 GB) | 2x DGX Spark | Vision | Draft MTP |
|---|---|---|---|---|---|---|---|
| GLM-5.3-Flash (FP8) | 288 | 18 B | 306 GB | No | No | Si | Si |
| GLM-5.3-Flash NVFP4 (288 expertos) | 288 | 18 B | ~191 GB | No | No | Si | Si |
| autotrust/GLM5.3-Flash-E256-DGX-Spark | 256 | 18 B | 170,5 GB = 159 GiB | Si, con solo 6,5 GiB de KV | Aprox. 80 GiB por nodo | Si | Draft NVFP4 |
| autotrust/GLM5.3-Flash-E224-DGX-Spark | 224 | 18 B | 151,5 GB = 141 GiB | Si | Aprox. 71 GiB por nodo | Si | Draft BF16 |
| autotrust/GLM5.3-Flash-E192-DGX-Spark (este) | 192 | 18 B | 132,4 GB = 124 GiB | Si, con 31,8 GiB de KV | Aprox. 62 GiB por nodo | Si | Draft NVFP4 incluido |

Compromiso observado: al reducir expertos mejora GPQA-Diamond con esfuerzo bajo (79,8 % frente a 78,3 % y 77,3 %), AIME 2025 (80,0 % frente a 75,0 % y 74,2 %) y BFCL Non-Live AST (88,5 %), pero empeora de forma clara en C-Eval (78,3 % frente a 84,0 % y 89,4 %), MMMU (70,7 % frente a 73,6 % y 76,1 %) y HumanEval (93,9 % frente a 95,7 % y 97,6 %).

No se dispone de comparaciones con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Derivado no oficial: el propio autor lo declara como build no oficial del modelo base zai-org/GLM-5.3-Flash.
- La model card proporcionada esta truncada al final, por lo que puede faltar informacion sobre el kernel NVFP4 del draft y sobre otros detalles de despliegue.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validacion independiente de los resultados.
- La reduccion de expertos degrada capacidades concretas frente a E224 y E256: C-Eval cae 5,7 puntos respecto a E224 y 11,1 respecto a E256; MMMU cae 2,9 y 5,4 puntos; HumanEval cae 1,8 y 3,7 puntos.
- Los numeros son ejecuciones unicas y el decode MoE en vLLM no es bit-determinista; el autor pide asumir +-2 a 3 puntos de ruido.
- Tool calling desigual por lenguaje: 94,2 % en Python frente a 61,0 % en Java y 68,0 % en JavaScript. La deteccion de irrelevancia es baja (70,4 % en non-live), lo que puede producir llamadas a herramientas innecesarias.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad en la informacion disponible. El sesgo de conocimiento esta acotado al corpus de entrenamiento del modelo base, no documentado aqui.
- Idiomas: solo ingles y chino estan declarados. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- La longitud de contexto maxima oficial no se especifica; el valor servido en las pruebas (66.560 tokens) no debe tomarse como limite contractual del modelo.
- Activar MTP reduce el pool de KV de 2,6 M a 1,65 M tokens en un B200; en servicio de alta concurrencia conviene desactivarlo.
- Hardware muy restrictivo: no cabe en una sola DGX Spark ni, segun la informacion disponible, en GPU consumer. Requiere Blackwell (GB10, B200, GB200) y, en el caso de dos DGX Spark, un enlace ConnectX-7.
- Licencia MIT declarada, que en principio permite uso comercial, pero al ser un derivado cuantizado conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash antes de explotarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/GLM5.3-Flash-E192-DGX-Spark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Variante E256 del mismo autor: https://huggingface.co/autotrust/GLM5.3-Flash-E256-DGX-Spark
- Variante E224 del mismo autor: https://huggingface.co/autotrust/GLM5.3-Flash-E224-DGX-Spark
- Draft especulativo incluido en el repositorio: ruta relativa mtp-nvfp4/ (6,98 GB)
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente aparecieron enlaces a foros sin relacion con el contenido solicitado, por lo que se descartan.
