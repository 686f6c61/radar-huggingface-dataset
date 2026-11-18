# autotrust/GLM5.3-Flash-E192-DGX-Spark

## Resumen

GLM5.3-Flash-E192-DGX-Spark es una compilacion compacta y no oficial del modelo zai-org/GLM-5.3-Flash, publicada por el usuario autotrust en Hugging Face. Se trata de una variante de arquitectura Mixture-of-Experts (MoE) en la que se han conservado 192 de los 288 expertos enrutados por capa mediante Neural Architecture Search (NAS), reduciendo el peso en disco hasta 124 GiB frente a los 306 GB de la version FP8 original. El modelo mantiene intactos el vocabulario completo de 154.880 tokens, la torre de vision y los 18 B de parametros activos por token (top-8 de 192).

La relevancia de esta ficha radica en que el modelo esta optimizado para hardware Blackwell de escritorio, concretamente para sistemas como la NVIDIA DGX Spark (GB10) y GPUs B200/GB200. Con dos DGX Spark conectadas por ConnectX-7 se obtienen aproximadamente 62 GiB de pesos por nodo, y una unica GPU Blackwell de 180 GB o mas puede ejecutarlo con 31,8 GiB de cache KV en FP8, lo que equivale a unos 2,6 millones de tokens de contexto almacenable. Ademas, el repositorio incluye un borrador MTP en NVFP4 para decodificacion especulativa que acelera la decodificacion en un factor de 1,80x en un solo B200 sin perdida de calidad.

El modelo es multimodal (image-text-to-text), soporta razonamiento con presupuesto de pensamiento configurable (`reasoning_effort` en niveles low/high/max), uso de herramientas y decodificacion especulativa. Su licencia MIT facilita el uso comercial, aunque al ser un derivado no oficial del modelo base conviene verificar la cadena de licencias del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con vision tower y decodificacion especulativa MTP; expertos en NVFP4 |
| Parametros totales | 110.710.222.718 (~110,7 B) |
| Parametros activos | 18 B por token (top-8 de 192 expertos enrutados) |
| Longitud de contexto | No disponible de forma explicita; la cache KV en FP8 permite ~2,6 M tokens en 1x B200 (31,8 GiB de KV) |
| Tipos de cuantizacion | NVFP4 para expertos; cache KV en FP8; borrador MTP en NVFP4; pesos en safetensors de 8 bits |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 146,4 GB; pesos ~124 GiB) |

## Arquitectura y entrenamiento

El modelo es un transformer Mixture-of-Experts con 192 expertos enrutados por capa (de los 288 originales), seleccionados mediante Neural Architecture Search. Cada token activa 18 B de parametros (top-8 expertos). Los pesos de los expertos se almacenan en NVFP4, un formato de cuantizacion de 4 bits de NVIDIA, mientras que la cache KV utiliza FP8. La torre de vision se conserva intacta y el vocabulario completo de 154.880 tokens se mantiene, lo que permite compatibilidad total con el modelo base en tokenizacion y capacidades multimodales.

El repositorio incluye un borrador MTP (Multi-Token Prediction) en NVFP4 de 6,95 GB para decodificacion especulativa, que acelera la decodificacion en un factor de 1,80x en un solo B200 sin degradar la calidad de salida. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base; estos datos corresponden al modelo original zai-org/GLM-5.3-Flash y no se detallan en la informacion proporcionada. La innovacion principal de esta compilacion es la reduccion del numero de expertos via NAS manteniendo los parametros activos, lo que permite desplegar el modelo en hardware de menor capacidad.

## Capacidades

- Generacion de texto y razonamiento con presupuesto de pensamiento configurable (`reasoning_effort`: low, high, max).
- Razonamiento cientifico y matematico de nivel avanzado (GPQA-Diamond, AIME 2025).
- Generacion de codigo (HumanEval) con soporte para Python, Java y JavaScript en function calling.
- Vision: procesamiento de imagenes y video (pipeline image-text-to-text, torre de vision intacta).
- Tool calling / function calling con soporte de llamadas simples, multiples, paralelas y deteccion de irrelevancia (BFCL v4).
- Razonamiento multi-turno y uso de agentes (BFCL v4 Multi-Turn Base).
- Capacidades multilingues limitadas a ingles y chino.
- Decodificacion especulativa mediante borrador MTP en NVFP4 incluido en el repositorio.
- Compatibilidad con vLLM y parser de tool calling `glm47`.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a la cache KV en FP8 que permite ~2,6 M tokens en un B200, adecuado para historiales extensos y bases de conocimiento integradas.
- Generacion de codigo en produccion: soporta tool calling con 94,2 % de acierto en funciones simples de Python y puede integrarse en pipelines de CI/CD para autocompletado, revision de codigo y generacion de tests.
- Agentes autonomos con uso de herramientas: el rendimiento en BFCL v4 (88,5 % en Non-Live AST y 79,5 % en Multi-Turn Base) lo hace viable para orquestacion de agentes que encadenan llamadas a APIs y reasoning multi-paso.
- Asistente de razonamiento cientifico: con `reasoning_effort=max` alcanza 84,8 % en GPQA-Diamond, util para apoyo a investigacion, revision de hipotesis y analisis de literatura tecnica.
- Analisis de documentos con imagenes: la torre de vision intacta y el pipeline image-text-to-text permiten extraer informacion de graficos, tablas e imagenes en flujos de digitalizacion y auditoria documental.
- Despliegue en hardware de escritorio Blackwell: dos DGX Spark conectadas por ConnectX-7 permiten ejecutar el modelo con ~62 GiB por nodo, habilitando inferencia local de un MoE de 110 B en entornos sin centro de datos.
- Servicio de inferencia de alto rendimiento: con vLLM y el borrador MTP NVFP4 se obtiene 1,80x de velocidad de decodificacion en un B200, adecuado para APIs de baja latencia con multiples peticiones concurrentes.

## Benchmarks y rendimiento

Resultados medidos en un solo B200 con vLLM, muestreo segun la receta del modelo base (temperature=1.0, top_p=0.95), HumanEval con decodificacion greedy. Presupuesto de tokens de 65.536 (16.384 para MMMU). Los numeros son ejecuciones unicas con ruido de ±2-3 puntos.

| Capacidad | Benchmark | Configuracion | Este modelo (E192) | E224 | E256 |
|---|---|---|---|---|---|
| Codigo | HumanEval (164) | greedy | 93,9 % (154/164) | 95,7 % | 97,6 % |
| Razonamiento cientifico | GPQA-Diamond (198) | effort=low | 79,8 % (158/198) | 78,3 % | 77,3 % |
| Razonamiento cientifico | GPQA-Diamond (198) | effort=max, 163.840 tokens, MTP on | 84,8 % (168/198) | 90,9 % | no disponible |
| Conocimiento chino | C-Eval val (1.606, 52 materias) | effort=low | 78,3 % (1.258/1.606) | 84,0 % | 89,4 % |
| Matematicas | AIME 2025 (30 x 4 muestras, pass@1) | effort=high | 80,0 % (96/120) | 75,0 % | 74,2 % |
| Vision | MMMU val (900) | effort=low | 70,7 % (636/900) | 73,6 % | 76,1 % |
| Tool use | BFCL v4 Non-Live AST | template default | 88,5 % | 88,3 % | 87,7 % |
| Tool use | BFCL v4 Live AST (ponderado) | template default | 79,8 % | 80,3 % | 80,5 % |
| Tool use | BFCL v4 Multi-Turn Base (200) | template default | 79,5 % | 80,0 % | 73,0 % / 75,0 % |

Desglose de BFCL v4 (function calling, AST match):

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

Rendimiento de decodificacion especulativa: 1,80x de velocidad en decodificacion single-stream en un solo B200 con el borrador MTP NVFP4, sin cambios en la calidad de salida. No se proporcionan cifras absolutas de throughput (tokens/s) ni latencia en la informacion disponible.

## Requisitos de hardware

- VRAM/peso estimado: pesos de ~124 GiB (132,4 GB) en NVFP4. Un solo DGX Spark de 128 GB no es suficiente (los pesos llenan el nodo).
- Un solo B200/GB200 con 180 GB o mas: ejecuta el modelo con 31,8 GiB de cache KV en FP8, equivalentes a ~2,6 M tokens.
- Dos DGX Spark (2 x 128 GB) conectadas por ConnectX-7: ~62 GiB de pesos por nodo, con el mayor margen de KV de la familia.
- GPU recomendadas: NVIDIA B200, GB200, DGX Spark (GB10, Blackwell). No cabe en GPUs consumer convencionales por el tamano de pesos.
- Opciones de despliegue: vLLM (libreria indicada en el repo), con parser de tool calling `glm47` y soporte de decodificacion especulativa MTP. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,80x de aceleracion en decodificacion single-stream con MTP NVFP4 en un B200; no se publican cifras absolutas de tokens/s ni latencia.

## Comparativa con modelos similares

| Modelo | Expertos enrutados/capa | Parametros activos | Peso en disco | 1x B200 | 2x DGX Spark | Vision | MTP |
|---|---|---|---|---|---|---|---|
| GLM-5.3-Flash (FP8) | 288 | 18 B | 306 GB | No | No | Si | Si |
| GLM-5.3-Flash NVFP4 (288) | 288 | 18 B | ~191 GB | No | No | Si | Si |
| E256 | 256 | 18 B | 170,5 GB (159 GiB) | Si (ajustado, 6,5 GiB KV) | ~80 GiB/nodo | Si | Borrador NVFP4 |
| E224 | 224 | 18 B | 151,5 GB (141 GiB) | Si | ~71 GiB/nodo | Si | BF16 + NVFP4 |
| **Este modelo (E192)** | **192** | **18 B** | **132,4 GB (124 GiB)** | **Si (31,8 GiB KV)** | **~62 GiB/nodo** | **Si** | **NVFP4 incluido** |

En terminos de rendimiento, E192 obtiene mejores resultados que E224 y E256 en GPQA-Diamond (effort=low: 79,8 % vs 78,3 % y 77,3 %) y en AIME 2025 (80,0 % vs 75,0 % y 74,2 %), mientras que es inferior en HumanEval (93,9 % vs 95,7 % y 97,6 %), C-Eval (78,3 % vs 84,0 % y 89,4 %) y MMMU (70,7 % vs 73,6 % y 76,1 %). En BFCL v4 los tres modelos son practicamente equivalentes.

## Limitaciones y advertencias

- Es un derivado no oficial del modelo base zai-org/GLM-5.3-Flash; la calidad y el comportamiento pueden diferir del original.
- La reduccion de expertos (de 288 a 192) degrada el conocimiento en chino (C-Eval 78,3 % frente a 89,4 % de E256) y la vision (MMMU 70,7 % frente a 76,1 %).
- Solo soporta ingles y chino; no hay soporte documentado de otros idiomas.
- No cabe en un unico DGX Spark de 128 GB; requiere dos nodos o una GPU Blackwell de 180 GB o mas.
- La decodificacion MoE en vLLM no es bit-determinista, con ruido de ±2-3 puntos en los benchmarks.
- En GPQA-Diamond con effort=max, 8 de 198 respuestas agotaron el presupuesto de 163.840 tokens y se contabilizaron como incorrectas.
- El rendimiento en function calling para Java (61,0 %) y JavaScript (68,0 %) es notablemente inferior al de Python (94,2 %).
- La deteccion de irrelevancia en tool calling es limitada (70,4 % en Non-Live, 73,8 % en live).
- Licencia MIT declarada, pero al ser un derivado conviene verificar la licencia y condiciones del modelo base para uso comercial.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/GLM5.3-Flash-E192-DGX-Spark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Variante E256: https://huggingface.co/autotrust/GLM5.3-Flash-E256-DGX-Spark
- Variante E224: https://huggingface.co/autotrust/GLM5.3-Flash-E224-DGX-Spark
- Demo en vivo AutoTrust/GuruSearch: https://news.guru.so/ui
- Borrador MTP NVFP4 incluido en el repositorio: carpeta `mtp-nvfp4/` (6,95 GB)
