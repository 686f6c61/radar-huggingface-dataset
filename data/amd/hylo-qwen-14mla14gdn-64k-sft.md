# amd/HyLo-Qwen-14MLA14GDN-64K-SFT

## Resumen

HyLo-Qwen-14MLA14GDN-64K-SFT es un checkpoint experimental publicado por AMD que convierte un transformer denso ya preentrenado (Qwen3-1.7B) en un modelo hibrido de atencion, en lugar de entrenar una arquitectura hibrida desde cero. La tecnica, denominada upcycling, sustituye por indice determinadas capas de atencion completa por capas de atencion latente multi-cabeza (MLA) y el resto por bloques lineales de estado recurrente fijo (Gated DeltaNet). El resultado conserva 28 capas y 2,18 mil millones de parametros, pero reduce la cache KV al 7,8% de la del modelo original.

El checkpoint se ha sometido a un ajuste supervisado de contexto largo hasta 65.536 tokens (64K), con destilacion de un profesor mayor, Qwen3-8B. La relevancia practica esta en el binomio contexto largo y coste de memoria: al eliminar la cache KV en la mitad de las capas y comprimirla a un latente de bajo rango en la otra mitad, permite servir ventanas de 64K con una huella de memoria muy inferior a la de un transformer equivalente, algo critico para despliegues de inferencia a gran escala.

El modelo se presenta en el articulo "Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling" (arXiv:2604.24715), donde figura como HyLo-Qwen-14MLA14GDN con backbone Qwen3-1.7B. Es un artefacto de investigacion: tiene 0 descargas y 0 likes en HuggingFace en el momento de redactar esta ficha, los pesos se distribuyen en float32 y la licencia declarada es de uso exclusivamente investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida transformer-lineal: 14 capas MLA (atencion latente multi-cabeza) + 14 capas Gated DeltaNet (atencion lineal con estado recurrente), 28 capas en total |
| Parametros totales | 2.182.902.440 (2,18B); el articulo reporta 2,2B |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 65.536 tokens entrenados y evaluados; el `max_position_embeddings` del `config.json` es 40.960 y no debe usarse como limite de servicio |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en float32 y se recomienda cargar en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | amd-hybrid-models-research-only-rail-ms (uso exclusivamente investigador); las etiquetas del repositorio incluyen tambien `license:apache-2.0`, contradiccion no resuelta en la informacion disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-1.7B |
| Profesor de destilacion | Qwen/Qwen3-8B |
| Cache KV | 7,8% de la del modelo base |
| Precision del checkpoint | float32 (cargar en bfloat16) |
| Tamano del repositorio | 8,7 GB |
| Fecha de publicacion | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura no sigue un patron repetitivo de bloques: las capas MLA ocupan los indices pares `[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26]` y las Gated DeltaNet los impares `[1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27]`. El criterio de colocacion es la sensibilidad del modelo base a perder atencion completa en cada posicion. Las capas Gated DeltaNet mantienen un estado recurrente de tamano fijo y, por tanto, no aportan cache KV alguna; las capas MLA conservan atencion pero cachean un latente de bajo rango en lugar de claves y valores completos, lo que explica que la cache total quede en el 7,8% de la original. El layout hibrido se define en `hybrid_config.json`, mientras que `config.json` conserva la configuracion del modelo base solo como referencia.

| Dimension MLA | Valor |
|---|---|
| Rango latente de KV (`kv_lora_rank`) | 256 |
| Rango latente de query (`q_lora_rank`) | 1344 |
| Dimension de cabeza RoPE (`qk_rope_head_dim`) | 64 |
| Dimension de cabeza NoPE (`qk_nope_head_dim`) | 64 |
| Dimension de cabeza de valor (`v_head_dim`) | 128 |
| Cabezas de atencion | 16 |

| Dimension Gated DeltaNet | Valor |
|---|---|
| Cabezas (`gdn_num_heads`) | 6 |
| Dimension de cabeza (`gdn_head_dim`) | 256 |

El entrenamiento consta de dos etapas. La primera, Enhanced-ILD, aplica destilacion capa a capa a 2.048 tokens con tasa de aprendizaje 2e-4 sobre el 20% de la mezcla de SFT, para alinear los bloques MLA y lineales recien inicializados con las representaciones internas del modelo base. La segunda es un SFT de contexto largo de extremo a extremo a 65.536 tokens con tasa 6e-5 y destilacion guiada por el profesor. La perdida es divergencia KL entre las distribuciones de siguiente token del estudiante y del profesor (`kl_weight 1.0`, `ce_weight 0.0`), con batch global de 8 secuencias, una epoca, schedule coseno y warmup del 1%. Se uso precision mixta bfloat16 sobre 8 GPU AMD Instinct MI300X con FSDP, y un kernel KL fusionado que evita materializar el tensor completo de logits. Los datos de entrenamiento son variantes procesadas por AMD de sftdatasetv3, OpenMathInstruct-2, OpenThoughts-114k, OpenR1-Math-220k y ChatQA2-Long-SFT-data, con submuestreo, reformateo a la plantilla de chat y descontaminacion frente a las suites de evaluacion.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con plantilla de chat heredada de Qwen3.
- Razonamiento de sentido comun y comprension lectora a contexto corto, con resultados medidos en ARC, HellaSwag, OpenBookQA, PIQA, RACE y WinoGrande.
- Procesamiento de contexto largo: ventana entrenada y evaluada de 65.536 tokens, extensible mediante escalado YaRN con factor 2.0 sobre una ventana original de 32.768 tokens.
- Razonamiento matematico, inducido por la mezcla de datos (OpenMathInstruct-2, OpenR1-Math-220k) bajo destilacion del profesor Qwen3-8B.
- Pregunta-respuesta sobre documentos largos, gracias al componente ChatQA2-Long-SFT-data de la mezcla.
- Trazas de razonamiento: la mezcla incluye OpenThoughts-114k, aunque la model card no documenta explicitamente un modo de pensamiento conmutable.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso explicitamente soportadas: no documentado en la informacion disponible.
- Multilingueismo: no, solo ingles.
- Vision, audio u otras modalidades: no soportadas.

## Casos de uso

- Analisis de documentacion tecnica extensa: ingesta de manuales, contratos o expedientes de hasta 64K tokens en una sola pasada, sin troceado ni recuperacion externa, aprovechando la ventana entrenada y la reduccion de cache KV.
- Pregunta-respuesta sobre repositorios de codigo o logs: el modelo puede recibir un volcado largo de trazas o ficheros concatenados y responder preguntas concretas sobre ellos, con un coste de memoria de cache muy inferior al de un transformer denso equivalente.
- Asistente de atencion al cliente con historial largo: conversaciones multi-turno donde el contexto acumulado crece, beneficiandose de la cache KV reducida para mantener mas sesiones concurrentes por GPU.
- Resolucion de problemas matematicos paso a paso: uso de la capacidad inducida por OpenMathInstruct-2 y OpenR1-Math-220k para generar soluciones razonadas en entornos educativos o de validacion de ejercicios.
- Etiquetado y resumen de lotes de documentos: procesamiento por lotes de articulos o informes largos para generar resumenes estructurados, con la ventana de 64K evitando la perdida de coherencia entre fragmentos.
- Base para investigacion en arquitecturas hibridas: reproduccion de los experimentos de upcycling del articulo, comparacion de la ubicacion de capas MLA frente a Gated DeltaNet y estudio de la degradacion de calidad segun el contexto.
- Destilacion o fine-tuning posterior: al ser un checkpoint de 2,18B con licencia de investigacion, sirve como punto de partida para experimentos academicos de ajuste con contexto largo sobre una unica GPU de gama alta.
- Evaluacion de stacks de servicio para modelos hibridos: banco de pruebas para medir como las pilas de inferencia gestionan configuraciones con MLA y estado recurrente, dado que la model card insiste en fijar explicitamente la longitud maxima.

## Benchmarks y rendimiento

El `model-index` de la model card no contiene resultados (`results: []`). Los unicos datos numericos disponibles provienen de la Tabla 4 del articulo, medidos en 0-shot con EleutherAI lm-evaluation-harness sobre el backbone Qwen3-1.7B.

| Tarea (0-shot, accuracy) | HyLo-Qwen-14MLA14GDN |
|---|---:|
| ARC-Challenge | 47,9 |
| ARC-Easy | 74,6 |
| HellaSwag | 61,9 |
| OpenBookQA | 38,2 |
| PIQA | 75,0 |
| RACE | 36,8 |
| WinoGrande | 62,3 |
| Media | 56,7 |

La tabla de evaluacion de contexto largo con RULER (13 tareas a 8K, 16K, 32K y 64K) aparece en la model card, pero los valores numericos no estan disponibles en la informacion proporcionada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras suites en la informacion disponible.

## Requisitos de hardware

- Pesos en float32: aproximadamente 8,7 GB, el tamano del repositorio. Cargados en bfloat16 ocupan unos 4,4 GB de VRAM.
- Cache KV: el autor indica que es el 7,8% de la del modelo base. Para Qwen3-1.7B en bfloat16 a 64K de contexto la cache rondaria los 7 GB, de modo que aqui quedaria en el entorno de 0,5-0,6 GB (estimacion derivada del porcentaje declarado, no un valor medido publicado).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bfloat16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080, RTX 4090, RTX 5090). En 8 GB el margen para cache KV y activaciones a 64K es ajustado.
- GPU recomendadas para produccion o lotes grandes: A100 40/80 GB, H100, L40S, y las AMD Instinct MI300X empleadas en el entrenamiento.
- Opciones de despliegue: la model card menciona pilas de servicio que dimensionan la cache KV a partir de `max_position_embeddings` y recomienda fijar el maximo explicitamente (por ejemplo `--max-model-len 65536`), lo que apunta a servidores tipo vLLM. La compatibilidad concreta con vLLM, TGI, llama.cpp u Ollama no esta confirmada en la informacion disponible; dado que la arquitectura combina MLA y Gated DeltaNet, no puede asumirse soporte generico.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, latencia de primer token ni comparativas de rendimiento en servicio frente al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV | Licencia | Rendimiento |
|---|---|---|---|---|---|
| HyLo-Qwen-14MLA14GDN-64K-SFT | 2,18B | 65.536 tokens | 7,8% del base | amd-hybrid-models-research-only-rail-ms | Media de 56,7 en sentido comun (0-shot) |
| Qwen/Qwen3-1.7B (modelo base) | 1,7B | 32.768 tokens nativos, ampliable con YaRN | completa (atencion estandar) | Apache 2.0 | No disponible en la informacion proporcionada para esta comparacion directa |
| Qwen/Qwen3-8B (profesor de destilacion) | 8B | 32.768 tokens nativos, ampliable con YaRN | completa (atencion estandar) | Apache 2.0 | No disponible en la informacion proporcionada para esta comparacion directa |

Otros modelos hibridos publicos de tamano comparable: no disponible en la informacion proporcionada. El articulo situa la contribucion dentro de la linea de upcycling a contexto largo, pero no se incluyen en el material disponible cifras de terceros comparables.

## Limitaciones y advertencias

- Solo ingles: el campo `language` de la model card declara unicamente `en`, sin capacidades multilingues verificadas.
- Licencia restrictiva: la licencia declarada es `amd-hybrid-models-research-only-rail-ms`, orientada a investigacion. Aunque el frontmatter y las etiquetas del repositorio incluyen `license:apache-2.0`, la contradiccion no esta resuelta y debe aclararse con el autor antes de cualquier uso comercial.
- Ventana real limitada a 65.536 tokens. El campo `max_position_embeddings` del `config.json` vale 40.960 y corresponde al modelo base, no a este checkpoint. Ademas, la calidad mas alla de 64K no ha sido medida ni reclamada por los autores.
- Pesos en float32: hay que convertirlos a bfloat16 para un despliegue razonable, lo que anade un paso de preprocesado.
- Arquitectura no estandar: la combinacion MLA mas Gated DeltaNet con layout no repetitivo puede no estar soportada por todas las pilas de inferencia, y algunas pueden ignorar `hybrid_config.json`, con el consiguiente fallo silencioso o resultados incorrectos.
- Riesgo de alucinacion: es un modelo de 2,18B ajustado por SFT y destilado de un profesor de 8B; no se han publicado evaluaciones de veracidad ni tasas de alucinacion. Cabe esperar una fiabilidad factual inferior a la del profesor.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha, sin retroalimentacion de terceros ni informes de fallos.
- Degradacion previsible respecto al modelo base en tareas de contexto corto por el proceso de conversion y destilacion; la media de 56,7 en tareas de sentido comun es moderada y debe compararse con la del modelo base antes de adoptarlo.
- Sin capacidades de tool calling, agentes ni multimodalidad documentadas, lo que limita su uso en pipelines que requieran function calling o entrada visual.
- Entrenado sobre mezclas de datos con licencias diversas, una de ellas `cc-by-nc-2.0` (ChatQA2-Long-SFT-data, no comercial), lo que puede afectar a la trazabilidad legal del checkpoint derivado.
- Sin datos de latencia, throughput ni consumo energetico en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/HyLo-Qwen-14MLA14GDN-64K-SFT
- Articulo principal (Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling): https://arxiv.org/abs/2604.24715
- Referencia arXiv 2505.17272: https://arxiv.org/abs/2505.17272
- Referencia arXiv 2503.11132: https://arxiv.org/abs/2503.11132
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de destilacion Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset JunxiongWang/sftdatasetv3: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset open-thoughts/OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset nvidia/ChatQA2-Long-SFT-data: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data
- Fichero de licencia del repositorio: https://huggingface.co/amd/HyLo-Qwen-14MLA14GDN-64K-SFT/blob/main/LICENSE

Nota: los resultados de la busqueda web solo devolvieron paginas corporativas generales de AMD (amd.com, Wikipedia, TechSpot) sin relacion tecnica con este checkpoint, por lo que no se han incluido como fuentes relevantes.
