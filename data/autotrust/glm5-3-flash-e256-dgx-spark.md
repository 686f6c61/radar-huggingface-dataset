# autotrust/GLM5.3-Flash-E256-DGX-Spark

## Resumen

GLM5.3-Flash-E256-DGX-Spark es una derivación no oficial de zai-org/GLM-5.3-Flash publicada por el usuario autotrust, pensada para ejecutarse en hardware Blackwell (desde un clúster de DGX Spark hasta una única GPU B200). Se trata de un modelo de mezcla de expertos (MoE) podado mediante búsqueda de arquitectura neuronal (NAS): conserva 256 de los 288 expertos enrutados de cada capa y mantiene 18.000 millones de parámetros activos por token, con enrutamiento top-8 sobre esos 256 expertos.

El modelo totaliza 144.544.102.910 parámetros (~144,5 B) y cuantiza los expertos en NVFP4, con caché KV en FP8 declarada en la configuración. El repositorio ocupa 184,5 GB e incluye un borrador MTP (multi-token prediction) ya listo para decodificación especulativa en `mtp-nvfp4/`, de 6,95 GB, que acelera la decodificación de un solo flujo hasta 1,84× en una B200 sin alterar la calidad de salida. Conserva la torre de visión intacta y el vocabulario completo de 154.880 tokens.

Su relevancia actual es doble: por un lado, reduce el peso del modelo desde los 306 GB de la versión FP8 hasta 170,5 GB (159 GiB), lo que permite servirlo en una sola GPU de 180 GB o más; por otro, incorpora decodificación especulativa NVFP4 empaquetada junto a los pesos, con el parser de tool calling de la familia GLM ya soportado en vLLM. Es un modelo multimodal imagen-texto, orientado a conversación, con licencia MIT declarada, y con resultados destacados en código (97,6 % en HumanEval) y conocimiento en chino (89,4 % en C-Eval).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con torre de vision y capa MTP; poda de expertos por Neural Architecture Search (NAS) |
| Parametros totales | 144.544.102.910 (~144,5 B) |
| Parametros activos | 18 B por token (top-8 de 256 expertos enrutados por capa) |
| Longitud de contexto | No disponible en la informacion proporcionada; los benchmarks se ejecutan con presupuestos de 65.536 tokens (16.384 en MMMU) y hasta 163.840 tokens en configuraciones de esfuerzo maximo |
| Tipos de cuantizacion | NVFP4 (expertos y borrador MTP), FP8 (cache KV, declarado en config); pesos en NVFP4 via NVIDIA ModelOpt |
| Idiomas soportados | Ingles (en) y chino (zh) declarados en la model card |
| Licencia | MIT (modelo derivado; verificar licencia del modelo base para uso comercial) |
| Formato de pesos | safetensors (NVFP4), compatible con vLLM; incluye borrador MTP en `mtp-nvfp4/` |
| Vocabulario | 154.880 tokens |
| Tamano del repositorio | 184,5 GB (pesos 170,5 GB = 159 GiB, borrador MTP 6,95 GB) |
| Pipeline | image-text-to-text |
| Libreria | vLLM |
| Modelo base | zai-org/GLM-5.3-Flash (relacion: quantized) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo MoE con 288 expertos enrutados por capa en el modelo original, de los cuales esta version conserva 256 tras aplicar Neural Architecture Search. El enrutamiento es top-8, lo que fija los parametros activos en 18 B por token independientemente del numero total de expertos. La poda reduce el peso en disco sin modificar el numero de parametros activos, de modo que la capacidad de computo por token se mantiene igual que en el modelo base mientras cae el coste de memoria. Los expertos se almacenan en NVFP4 mediante NVIDIA ModelOpt, y la cache KV se declara en FP8, lo que reduce adicionalmente el consumo de memoria en contextos largos. La torre de vision se mantiene intacta, por lo que el modelo conserva las capacidades de imagen y video del original.

No se proporciona informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base; estos datos no estan disponibles en la informacion consultada. La innovacion tecnica destacable de esta derivacion es el borrador MTP empaquetado: se trata de la capa MTP original de GLM-5.3-Flash (una capa nextn con los 288 expertos enrutados), exportada con ModelOpt a NVFP4 y distribuida junto a los pesos para habilitar decodificacion especulativa sin pasos adicionales de conversion. La decodificacion especulativa es sin perdida: el modelo objetivo verifica cada token propuesto, por lo que el borrador solo afecta a la velocidad.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Razonamiento con presupuesto de pensamiento configurable mediante `reasoning_effort` (valores `low`, `high` y `max`) en la plantilla de chat de GLM-5.3-Flash.
- Generacion de codigo: 97,6 % en HumanEval con decodificacion greedy.
- Razonamiento cientifico (GPQA-Diamond) y matematico (AIME 2025).
- Vision: entrada de imagen y video a traves de la torre de vision intacta; 76,1 % en MMMU val.
- Tool calling / function calling con parser dedicado (`--tool-call-parser glm47`) en vLLM, evaluado con BFCL v4 en categorias simple, multiple, parallel, parallel-multiple, irrelevance y live.
- Razonamiento multi-paso orientado a agentes, con rendimiento medido en BFCL v4 Multi-Turn Base.
- Decodificacion especulativa MTP integrada para acelerar la inferencia en un solo flujo.

## Casos de uso

- Generacion de codigo en produccion: con un 97,6 % en HumanEval y soporte de tool calling, puede integrarse en asistentes de IDE, revision de pull requests o pipelines de CI/CD donde se invoque como endpoint compatible con OpenAI y se conecten herramientas de build o test.
- Atencion al cliente automatizada en chino e ingles: el modelo mantiene conversaciones multi-turno y su rendimiento en C-Eval (89,4 %) lo hace adecuado para despliegues en mercados sinofonos, con la ventaja de un unico modelo para ambos idiomas.
- Agentes con llamada a herramientas: el soporte de BFCL v4 en categorias parallel y parallel-multiple (93,5 % y 86,0 % en no-live) permite orquestar varias APIs simultaneamente, por ejemplo consultas de inventario, facturacion y envio en un mismo turno.
- Analisis de documentos con imagenes: la torre de vision permite extraer informacion de capturas, diagramas o formularios escaneados y combinarla con razonamiento textual, util en back office financiero o legal.
- Razonamiento cientifico y matematico asistido: con `reasoning_effort=max` y presupuestos de hasta 163.840 tokens, la familia alcanza un 90,9 % en GPQA-Diamond segun las mediciones del autor sobre E224, lo que lo hace apto para asistencia a investigadores en preguntas de dominio y verificacion de derivaciones.
- Despliegue en una sola GPU Blackwell de gama alta: al ocupar 159 GiB de pesos, cabe en una B200 o GB200 con 180 GB o mas, lo que permite servir el modelo sin repartirlo entre nodos en entornos de laboratorio o demos internas.
- Inferencia interactiva de baja concurrencia con MTP activado: con 2 tokens de borrador se obtienen 247 tok/s por flujo frente a 134 tok/s sin borrador (1,84×), adecuado para chat interactivo.
- Procesamiento por lotes de alto rendimiento sin MTP: en modo agregado con 8 peticiones simultaneas el modelo alcanza 472 tok/s, por lo que conviene desactivar el borrador y maximizar el pool de KV en cargas batch.

## Benchmarks y rendimiento

Medidos en una unica B200 con vLLM. Muestreo segun receta del modelo base (`temperature=1.0`, `top_p=0.95`); HumanEval con decodificacion greedy. La puntuacion es estricta: una respuesta que agota tokens antes de dar la respuesta final cuenta como incorrecta. Se trata de ejecuciones unicas salvo indicacion contraria; el autor advierte que la decodificacion MoE en vLLM no es determinista bit a bit, por lo que debe considerarse un ruido de ±2-3 puntos. Las cifras de E224 provienen del mismo arnes y la misma maquina.

| Capacidad | Benchmark | Configuracion | Este modelo (E256) | E224 |
|---|---|---|---|---|
| Codigo | HumanEval (164) | greedy | 97,6 % (160/164) | 95,7 % |
| Razonamiento cientifico | GPQA-Diamond (198) | effort=low (autotest rapido) | 77,3 % (153/198) | 78,3 % |
| Conocimiento en chino | C-Eval val (1.606, 52 materias) | effort=low | 89,4 % (1.436/1.606) | 84,0 % |
| Matematicas | AIME 2025 (30 x 4 muestras, pass@1) | effort=high | 74,2 % (89/120) | 75,0 % |
| Vision | MMMU val (900) | effort=low | 76,1 % (685/900) | 73,6 % |
| Tool use | BFCL v4 Non-Live AST | template por defecto | 87,7 % | 88,3 % |
| Tool use | BFCL v4 Live AST (ponderado) | template por defecto | 80,5 % | 80,3 % |
| Tool use | BFCL v4 Multi-Turn Base (200) | dos ejecuciones | 73,0 % / 75,0 % | 80,0 % |

Nota del autor sobre GPQA-Diamond: la cifra de 77,3 % es un autotest rapido con `reasoning_effort=low` y 65.536 tokens de presupuesto, pensado para comparar builds entre si, no el mejor resultado del modelo. Con `reasoning_effort=max` y 163.840 tokens, la familia alcanza un 90,9 % en GPQA-Diamond (medido sobre E224).

Desglose de BFCL v4 por categoria (AST match):

| Categoria | Precision |
|---|---|
| simple (Python) | 95,8 % |
| simple (Java) | 59,0 % |
| simple (JavaScript) | 74,0 % |
| multiple | 95,0 % |
| parallel | 93,5 % |
| parallel-multiple | 86,0 % |
| irrelevance detection | 69,2 % |
| live simple | 88,4 % |
| live multiple | 78,9 % |
| live parallel | 75,0 % |
| live parallel-multiple | 66,7 % |
| live irrelevance | 71,6 % |
| live relevance | 81,3 % |
| Multi-Turn Base (200) | 73,0 % / 75,0 % |

Rendimiento y decodificacion especulativa MTP (una sola B200; `reasoning_effort=low`, 1.024 tokens de salida, prompts cortos, 8 peticiones por nivel, servido con `--max-model-len 8192 --max-num-seqs 8 --gpu-memory-utilization 0.985`):

| Borrador | `num_speculative_tokens` | Longitud media de aceptacion | Aceptacion del borrador | Decodificacion 1 flujo (tok/s) | Aceleracion (1 flujo) | Agregado tok/s @ 8 |
|---|---|---|---|---|---|---|
| off | — | — | — | 134 | 1,00× | 472 |
| `mtp-nvfp4/` | 2 (recomendado) | 2,48 | 74,2 % | 247 | 1,84× | 709 |
| `mtp-nvfp4/` | 3 | 2,85 | 61,7 % | 261 | 1,94× | 665 |

En trafico de HumanEval con alta carga de razonamiento y 3 tokens de borrador, la aceptacion alcanzo el 81 % (3,43 tokens por paso; por posicion 0,93 / 0,82 / 0,69).

## Requisitos de hardware

- Memoria de pesos: 170,5 GB (159 GiB) para el modelo E256 en NVFP4, frente a 306 GB de la version FP8 y ~191 GB del NVFP4 con 288 expertos.
- Borrador MTP: 6,95 GB en disco; en una B200 anade aproximadamente 4 GiB de pesos en memoria y reduce el pool de cache KV.
- GPU recomendadas: una B200 o GB200 con 180 GB o mas (el autor lo describe como "ajustado"); 2 x DGX Spark (2 x 128 GB) es posible pero no validado, con ~80 GiB de pesos por nodo y un pool de KV pequeno.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; 159 GiB de pesos exceden la VRAM de una RTX 4090 (24 GB). No se dispone de datos de configuraciones multi-GPU en consumer.
- Formatos de despliegue: vLLM (libreria declarada, con `--tool-call-parser glm47`); no se mencionan soportes de llama.cpp, Ollama ni TGI en la informacion disponible.
- Configuracion de servicio de referencia: `--max-model-len 8192 --max-num-seqs 8 --gpu-memory-utilization 0.985`.
- Throughput medido: 134 tok/s por flujo sin borrador y 472 tok/s agregados con 8 peticiones; 247 tok/s por flujo con 2 tokens de borrador (1,84×) y 709 tok/s agregados; 261 tok/s por flujo con 3 tokens de borrador (1,94×) y 665 tok/s agregados.
- Recomendacion del autor: activar MTP en servicio interactivo de baja concurrencia y desactivarlo en servicio batch de alta concurrencia, ya que el borrador consume memoria que de otro modo se destinaria a cache KV.

## Comparativa con modelos similares

| Modelo | Expertos enrutados/capa | Parametros activos | Memoria de pesos | Cache KV | Vision | MTP | 1x B200/GB200 (>=180 GB) | 2x DGX Spark (2x128 GB) |
|---|---|---|---|---|---|---|---|---|
| GLM-5.3-Flash (FP8) | 288 | 18 B | 306 GB | BF16 | Si | Si | No | No |
| GLM-5.3-Flash NVFP4 (288 expertos) | 288 | 18 B | ~191 GB | FP8 | Si | Si | No | No |
| GLM5.3-Flash-E224-DGX-Spark | 224 | 18 B | 151,5 GB = 141 GiB | BF16 (FP8 opcional) | Si | Si (borradores BF16 `mtp/` y NVFP4 `mtp-nvfp4/`) | Si | Si |
| GLM5.3-Flash-E256-DGX-Spark (este modelo) | 256 | 18 B | 170,5 GB = 159 GiB | FP8 | Si | Si (borrador NVFP4 `mtp-nvfp4/`) | Si (ajustado) | Aviso: ~80 GiB por nodo, pool KV pequeno, no validado |

En tool use, E224 obtiene ~5 puntos mas que este modelo en BFCL v4 Multi-Turn Base (80,0 % frente a 73,0 %/75,0 %), por lo que el autor recomienda E224 para cargas de agente multi-turno. A cambio, E256 mejora en C-Eval (89,4 % frente a 84,0 %), HumanEval (97,6 % frente a 95,7 %) y MMMU (76,1 % frente a 73,6 %). No se dispone de datos de benchmarks frente a modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo derivado no oficial: no esta publicado por zai-org, sino por el usuario autotrust, con relacion `quantized` respecto al modelo base.
- Idiomas: solo ingles y chino declarados; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Licencia: la model card declara MIT, pero al ser una derivacion hay que verificar la licencia del modelo base zai-org/GLM-5.3-Flash antes de un uso comercial; este dato no esta disponible en la informacion proporcionada.
- No determinismo: la decodificacion MoE en vLLM no es determinista bit a bit; el autor recomienda tratar las diferencias de ±2-3 puntos en benchmarks como ruido.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni mecanismos de mitigacion; aplica el riesgo habitual de los modelos generativos, especialmente en dominios cientificos y legales.
- Tool calling: la deteccion de irrelevancia es debil (69,2 % en no-live) y el rendimiento en Java es bajo (59,0 % en simple), por lo que conviene validar los esquemas de herramientas antes de produccion.
- Agentes multi-turno: el rendimiento cae a 73,0 %/75,0 % en BFCL v4 Multi-Turn Base y el propio autor recomienda el build E224 para esas cargas.
- Longitud de contexto: no se especifica la ventana maxima oficial; los presupuestos de tokens usados en benchmarks (65.536 y 163.840) no equivalen necesariamente al limite de contexto del modelo.
- Despliegue ajustado: el autor describe la ejecucion en una unica B200 como "ajustada" en memoria, y la configuracion de 2 x DGX Spark no esta validada.
- Limitacion de hardware: requiere GPUs Blackwell (GB10, B200, GB200) y no puede ejecutarse en GPU de consumo; no se documentan rutas alternativas como llama.cpp u Ollama.
- Advertencia sobre los resultados de busqueda web: las consultas realizadas no devolvieron informacion tecnica relevante sobre el modelo (unicamente resultados de contenido para adultos sin relacion). Los datos de esta ficha proceden exclusivamente de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/GLM5.3-Flash-E256-DGX-Spark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Build E224 de la misma familia: https://huggingface.co/autotrust/GLM5.3-Flash-E224-DGX-Spark
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada
- La busqueda web no devolvio enlaces relevantes sobre el modelo.
