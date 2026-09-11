# gratex/Ornith-1.5-397B-W4A16-g32-sym

## Resumen

Ornith-1.5-397B-W4A16-g32-sym es una cuantizacion de solo pesos en INT4 (esquema W4A16, simetrico, group_size 32) del modelo multimodal con mezcla de expertos ornith-ai/Ornith-1.5-397B, publicada por el usuario gratex. La cuantizacion se realizo con Intel AutoRound 0.16.0-main aplicando el algoritmo SignRoundV2 y se exporto en el formato pack-quantized de la libreria compressed-tensors, con un tiempo total de cuantizacion de 33,2 horas sobre 4 GPU RTX PRO 6000 (Blackwell, 96 GB).

La arquitectura declarada es Qwen3_5MoeForConditionalGeneration, con un backbone hibrido de atencion lineal y atencion completa: 60 capas, de las cuales 45 usan atencion lineal y 15 atencion completa. El bloque MoE cuenta con 512 expertos enrutados con top-10 y un tamano intermedio por experto de 1.024. La ventana de contexto alcanza los 262.144 tokens y el modelo incluye un codificador de vision Qwen3 VisionTransformer de 27 capas, ademas de soporte nativo de tool calling y razonamiento con cadena de pensamiento. La licencia es MIT, lo que facilita su uso comercial.

El interes practico de esta publicacion es que reduce el peso en disco de aproximadamente 752 GB en BF16 a unos 251 GB (factor cercano a 3,0x, repartidos en 61 shards y 279.284 tensores), manteniendo en BF16 los componentes sensibles: codificador de vision y proyector, proyecciones q/k/v/o de las 15 capas de atencion completa, proyecciones de atencion lineal (in_proj_qkv/z/b/a, conv1d, out_proj), expertos compartidos, puertas MoE, lm_head y embed_tokens. Solo se cuantizan las proyecciones FFN de los expertos enrutados (gate_proj, up_proj, down_proj) en 60 capas x 512 expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration; transformer hibrido MoE con atencion lineal + atencion completa y torre de vision |
| Parametros totales | 70.653.466.096 segun metadatos de safetensors; la model card y el nombre del modelo hacen referencia a 397B (base BF16 de ~752 GB). Discrepancia no aclarada en la informacion disponible |
| Parametros activos | no disponible (configuracion MoE declarada: 512 expertos enrutados, top-10, moe_intermediate_size 1.024) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | W4A16: pesos INT4 simetrico, activaciones BF16 (weight-only), group_size 32 con escalas fp16; solo expertos enrutados cuantizados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, formato pack-quantized de compressed-tensors (61 shards, ~251 GB) |
| Capas | 60 (45 de atencion lineal + 15 de atencion completa) |
| Hidden size | 4.096 |
| Cabezas de atencion | 32 de query, 2 de key/value (GQA), dimension de cabeza 256 |
| Vocabulario | 248.320 tokens |
| Codificador de vision | Qwen3 VisionTransformer, 27 capas, hidden_size 1.152 |
| Componentes preservados en BF16 | Vision encoder y proyector, q/k/v/o de atencion completa (15 capas), in_proj_qkv/z/b/a, conv1d y out_proj de atencion lineal, expertos compartidos y puertas MoE, lm_head, embed_tokens |
| Metodo de cuantizacion | AutoRound SignRoundV2, 1.000 iteraciones, calibracion con 512 muestras de 4.096 tokens, batch 8, semilla 42 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La model card no describe el entrenamiento del modelo base, por lo que no hay informacion disponible sobre numero de tokens, composicion del dataset ni sobre si se aplicaron etapas de RLHF o DPO. Lo que si se detalla es la arquitectura: se trata de un transformer con mezcla de expertos de grano fino (512 expertos enrutados, top-10 por token) sobre un backbone hibrido que combina 45 capas de atencion lineal con 15 capas de atencion completa. Este diseno reduce el coste cuadratico de la atencion en la mayor parte de la red y reserva la atencion completa para una fraccion de capas, lo que permite sostener una ventana de contexto de 262.144 tokens. Las proyecciones de atencion usan GQA con 32 cabezas de consulta y solo 2 de clave/valor, con dimension de cabeza 256. El modelo es multimodal: incorpora un VisionTransformer de 27 capas (hidden_size 1.152) con su proyector correspondiente, preservados ambos en BF16 tras la cuantizacion.

La innovacion tecnica de este checkpoint concreto es la receta de cuantizacion. Se emplea AutoRound con SignRoundV2 y esquema W4A16G32, exportando a llm-compressor/compressed-tensors con shards de 5 GB como maximo. Se excluyen explicitamente 832 patrones de capas que se mantienen en BF16, de modo que la cuantizacion se limita a las proyecciones FFN de los expertos enrutados (gate_proj, up_proj, down_proj) en las 60 capas. El resultado son 279.284 tensores y unos 251 GB en disco, con escalas almacenadas en fp16. La decodificacion en produccion se apoya en los kernels INT4 fusionados de vLLM (Marlin en la mayoria de arquitecturas, con Machete adicional en Hopper sm_90).

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado text-generation y etiquetas conversational y reasoning.
- Razonamiento con cadena de pensamiento explicita (chain-of-thought), segun la model card del modelo base.
- Tool calling y function calling nativos, integrables en flujos de agente.
- Mezcla de expertos de grano fino con 512 expertos y top-10, orientada a eficiencia computacional por token.
- Procesamiento multimodal de imagenes mediante el codificador de vision Qwen3, con 27 capas y proyector preservados en BF16.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y repositorios de codigo completos.
- Capacidades multilingues: no disponible (no se declara listado de idiomas en la informacion proporcionada).
- Etiquetado como region:eu, lo que sugiere orientacion a despliegues en la Union Europea.

## Casos de uso

- Analisis de documentacion tecnica extensa: la ventana de 262.144 tokens permite cargar manuales, normativas o contratos completos sin troceado agresivo, manteniendo coherencia entre secciones alejadas del documento.
- Agentes de automatizacion con function calling: el soporte nativo de tool calling permite conectar el modelo a APIs internas, bases de datos o sistemas de ticketing y ejecutar flujos de varios pasos con verificacion intermedia.
- Asistencia sobre bases de codigo completas: con 262K de contexto se pueden incluir multiples ficheros fuente y trazas de error en una sola peticion para tareas de refactorizacion, revision de cambios o generacion de tests.
- Procesamiento de documentos con componente visual: el codificador de vision permite extraer informacion de capturas de pantalla, diagramas de arquitectura, tablas escaneadas y formularios, combinando OCR implicito con razonamiento sobre el texto extraido.
- Razonamiento multi-paso para soporte tecnico especializado: la cadena de pensamiento permite descomponer diagnosticos complejos en hipotesis y comprobaciones, util en diagnostico de incidencias o analisis de causa raiz.
- Generacion de informes y resumenes largos a partir de multiples fuentes: el modelo puede consolidar varios documentos en un unico informe estructurado manteniendo trazabilidad hacia las fuentes dentro del mismo contexto.
- Despliegue on-premise con licencia MIT: al ser MIT, se puede integrar en productos comerciales y desplegarse en infraestructura propia de la UE sin obligaciones de apertura del codigo derivado.
- Atencion al cliente automatizada multi-turno: su ventana de contexto evita perder el historial en conversaciones largas, aunque el rendimiento multilingue no esta documentado en la informacion disponible.

## Benchmarks y rendimiento

Solo se han publicado resultados de perplexity y de throughput en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidad.

Perplexity sobre WikiText-2 (test split, chunks no solapados de 512 tokens, evaluacion sobre la segunda mitad de cada chunk; 639 chunks, 296.434 tokens puntuados, cero chunks fallidos):

| Modelo | PPL (menor es mejor) |
|---|---|
| Este modelo (W4A16 g32 simetrico) | 4,6611 |
| ornith-ai/Ornith-1.5-397B-NVFP4 (cuantizacion oficial NVFP4) | 4,8522 |

Throughput medido con un cliente OpenAI estandar sobre 4x RTX PRO 6000 (96 GB), TP=4 con expert parallel, vLLM 0.26.1, kv_cache_dtype fp8_e4m3, contexto 262.144 y CUDA graphs activados. Prompts aleatorios unicos por peticion para evitar aciertos de prefix cache.

| Escenario | Metrica | Valor |
|---|---|---|
| Concurrencia 1 (20 peticiones, max_tokens 1024, temperatura 0,9) | Throughput agregado | 118,7 tok/s |
| Concurrencia 1 | Throughput por peticion | min 111,6 / media 117,7 / max 119,2 tok/s |
| Concurrencia 1 | Latencia media | 6,81 s (min 0,35 s / max 8,68 s) |
| Concurrencia 1 | Tasa de exito | 20/20 (100%) |
| Concurrencia 16 (160 peticiones, max_num_seqs 16) | Throughput agregado | 787,5 tok/s |
| Concurrencia 16 | Throughput por peticion | min 8,0 / media 50,2 / max 70,9 tok/s |
| Concurrencia 16 | Latencia media | 14,51 s (min 0,65 s / max 23,16 s) |
| Concurrencia 16 | Tasa de exito | 160/160 (100%) |

## Requisitos de hardware

- VRAM estimada: unos 251 GB en pesos totales, que se reparten a 62,8 GB por GPU con TP=4, mas espacio para activaciones y cache KV. El propio autor senala que la VRAM, y no la generacion de tensor cores, es el cuello de botella a este tamano.
- GPUs verificadas: 4x RTX PRO 6000 (96 GB, Blackwell sm_120), 384 GB totales, con contexto completo de 262K y KV en fp8; configuracion confirmada por el autor.
- Alternativas compatibles por VRAM: 4x H100 (80 GB, Hopper), 320 GB totales, donde los pesos caben pero con un pool de KV menor y sin medicion publicada; 4x H200 (141 GB, Hopper), 564 GB totales, con la tabla de la model card truncada en la informacion disponible.
- Compatibilidad de arquitectura: se requiere compute capability >= 7,5 (Turing) para los kernels INT4 fusionados de vLLM; Marlin en la mayoria de arquitecturas y Machete adicional en Hopper sm_90.
- GPU de consumo: no cabe. Un unico modelo de 24 GB (RTX 4090, RTX 3090) o 48 GB no puede alojar los pesos ni siquiera en la configuracion minima viable.
- Paralelismo: el tamano de tensor parallel debe dividir el modelo de forma limpia; los valores admitidos son TP en {1, 2, 4, 8}.
- Opciones de despliegue: vLLM 0.26.1 es la ruta verificada, con expert parallel y kv_cache_dtype fp8_e4m3. El formato pack-quantized de compressed-tensors no es compatible con llama.cpp ni Ollama. Sobre TGI y otras alternativas no hay informacion disponible.
- Latencia y throughput: 118,7 tok/s agregados con una peticion concurrente y latencia media de 6,81 s; 787,5 tok/s agregados con 16 peticiones concurrentes y latencia media de 14,51 s. Las peticiones de hasta 1.024 tokens completaron con un 100% de exito en ambos escenarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gratex/Ornith-1.5-397B-W4A16-g32-sym | 397B nominales / 70,65B en metadatos safetensors (segun fuente) | 262.144 tokens | W4A16 INT4, group_size 32, simetrico | 4,6611 | MIT | HuggingFace, compressed-tensors |
| ornith-ai/Ornith-1.5-397B-NVFP4 | mismo modelo base | 262.144 tokens (heredado) | NVFP4 (cuantizacion oficial) | 4,8522 | no disponible en la informacion proporcionada | HuggingFace, publicada por ornith-ai |
| ornith-ai/Ornith-1.5-397B (BF16) | 397B nominales; ~752 GB en BF16 | 262.144 tokens | sin cuantizar | no disponible | no disponible en la informacion proporcionada | HuggingFace, modelo base |

No se dispone de datos sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se cuantizan las proyecciones FFN de los expertos enrutados; el resto de componentes (vision, atencion, expertos compartidos, puertas, embeddings y lm_head) permanece en BF16, por lo que la reduccion de tamano es de aproximadamente 3,0x y no de 4x.
- No hay datos publicados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, evaluaciones multimodales), solo perplexity y throughput. No se puede inferir la degradacion en tareas de razonamiento a partir de la PPL.
- Existe una discrepancia no resuelta entre el nombre del modelo (397B) y el recuento de parametros reportado en los metadatos de safetensors (70.653.466.096). Conviene verificar el conteo efectivo antes de dimensionar infraestructura.
- El listado de idiomas soportados y su calidad relativa no estan documentados; no hay garantia de rendimiento en castellano ni en otras lenguas.
- Requiere hardware de gama alta: no es desplegable en GPU de consumo, y la configuracion verificada exige 4 GPU de 96 GB.
- El formato pack-quantized de compressed-tensors limita el ecosistema de despliegue: no es compatible con llama.cpp, Ollama ni, presumiblemente, con otros runners basados en GGUF.
- La tabla de requisitos de hardware de la model card original aparece truncada en la informacion disponible; los escenarios con 4x H200 y configuraciones superiores no estan medidos.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion para este checkpoint ni para el modelo base.
- Sesgos conocidos: no disponible; no se documentan analisis de sesgo en la informacion proporcionada.
- La licencia MIT del checkpoint se hereda del modelo base segun la model card; conviene confirmar las condiciones aplicables al modelo base antes de un uso comercial en produccion.
- El repo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad sobre esta cuantizacion concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gratex/Ornith-1.5-397B-W4A16-g32-sym
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-397B
- Cuantizacion oficial NVFP4 del mismo modelo: https://huggingface.co/ornith-ai/Ornith-1.5-397B-NVFP4
- Intel AutoRound (herramienta de cuantizacion): https://github.com/intel/auto-round
- compressed-tensors (formato de exportacion): https://github.com/neuralmagic/compressed-tensors

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces obtenidos correspondian a paginas genericas de YouTube y se han descartado por no ser pertinentes.
