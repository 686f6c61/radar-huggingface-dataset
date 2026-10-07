# AutomatosX/AX-Nemotron-3-Embed-1B-CUDA-AXQ-NVFP4-W4A4

## Resumen

AX-Nemotron-3-Embed-1B-CUDA-AXQ-NVFP4-W4A4 es un checkpoint de embeddings para recuperacion (retrieval) publicado por AutomatosX, derivado por cuantizacion del modelo nvidia/Nemotron-3-Embed-1B-BF16 (revision inmutable `c0c9fea93ea424587517f2c59e20db9f1d6bf615`). No es un modelo generativo ni un conversacional: es un codificador de frases que produce vectores normalizados para similitud semantica y busqueda. El checkpoint se distribuye como vista previa de desarrollo ("development-preview") de la cadena de conversion AXQuant, con pesos en safetensors y libreria declarada vLLM.

Tecnicamente es un transformer encoder-only de 1.140.918.272 parametros (aproximadamente 1,14 mil millones) con dimension de embedding completa de 2048. Sobre el alias Ministral3, la atencion es bidireccional (`is_causal=false`) y las 16 capas de atencion estan verificadas como encoder-only. La innovacion principal es la cuantizacion mixta NVFP4 W4A4 en CUDA: pesos y activaciones en FP4 nativo E2M1 con escalas por bloque de 16 en E4M3FN y escalas globales FP32, mientras embeddings y normalizaciones se conservan en BF16.

Su relevancia ahora es de nicho pero concreta: demuestra la ejecucion nativa de un embedder de retrieval en FP4 de 4 bits con kernels Cutlass en hardware Blackwell, reduciendo el peso a 1.027.791.800 bytes de pesos (aproximadamente 0,96 GiB) y permitiendo desplegarlo en GPUs de borde como Jetson Thor. El propio autor advierte que no hay certificacion de calidad ni benchmark independiente MTEB/RTEB, y que los indices de retrieval deben reconstruirse con este checkpoint exacto porque los vectores BF16 y cuantizados no son intercambiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only, alias Ministral3, atencion bidireccional (`is_causal=false`), 16 capas de atencion verificadas como encoder-only |
| Parametros totales | 1.140.918.272 |
| Parametros activos | no aplica (modelo denso, sin tablas MoE) |
| Longitud de contexto | no disponible (las pruebas del autor usan un maximo de 512 tokens) |
| Tipos de cuantizacion | NVFP4 W4A4 mixta: pesos y entradas en FP4 nativo E2M1, escalas por cada 16 elementos en E4M3FN, escalas globales FP32; embeddings y normas en BF16. 112 matrices cuantizadas, 34 tensores protegidos. Sin AWQ |
| Idiomas soportados | no disponible |
| Licencia | other, `openmdw-1.1` (enlace en la seccion de enlaces) |
| Formato de pesos | safetensors (compressed-tensors); bytes de pesos de salida: 1.027.791.800; tamano del repositorio: 1,0 GB |
| Dimension de embedding | 2048 |
| Prefijos de prompt | `query: ` y `passage: ` |
| Pooling | mean pooling con normalizacion L2 |
| Libreria declarada | vLLM |
| Pipeline | sentence-similarity |
| Estado | development-preview; manifiesto del conversor con `runtime_verified=false` y `quality_certified=false` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base nvidia/Nemotron-3-Embed-1B-BF16, un transformer de tipo encoder para embeddings de frases con atencion bidireccional. El autor verifica explicitamente que las 16 capas de atencion operan como encoder-only y que no existen tablas MoE ni tensores n-gram en esta familia. El proceso aplicado no es un entrenamiento nuevo, sino una conversion y cuantizacion post-entrenamiento: se parte del checkpoint BF16 original y se cuantizan 112 matrices elegibles de atencion y MLP a NVFP4 W4A4, dejando intactos en BF16 los tensores de embeddings y de normalizacion. El resultado se ejecuta mediante 64 modulos `CutlassNvFp4LinearKernel`.

Sobre los datos de entrenamiento no se aporta informacion en la documentacion disponible (no se indica numero de tokens, composicion del dataset ni si hubo RLHF o DPO); esos detalles corresponderian al modelo base, no a esta conversion. La innovacion tecnica documentada es el flujo de conversion AXQuant: un codificador RTN de referencia en NumPy, comprobado de forma independiente contra los tensores BF16 de origen, con calibracion y payloads ligados por checksum. La ruta de desarrollo anade preservacion de metadatos de embedding y proteccion del embedding tipo Qwen, caracteristicas que no estan en las versiones ya publicadas de los wheels de AXQuant. El autor declara que la sensibilidad de pesos queda explicitamente sin medir, que Marlin y la emulacion fueron rechazados y que se probo prefill de secuencia completa en modo eager, con maximo de 512 tokens y una sola secuencia.

## Capacidades

- Generacion de embeddings de texto para similitud semantica (`pipeline_tag: sentence-similarity`), con pooling por media y normalizacion L2.
- Recuperacion de informacion (retrieval) en modo bi-encoder: codificacion separada de consultas con prefijo `query: ` y de documentos con prefijo `passage: `.
- Busqueda semantica sobre corpus indexados, con vectores de 2048 dimensiones aptos para indices vectoriales.
- Ejecucion nativa en precision NVFP4 W4A4 sobre CUDA mediante kernels Cutlass, sin recurrir a Marlin ni a emulacion.
- Inferencia verificada sobre vLLM 0.25.1 con Torch 2.11.0+cu130 y CUDA 13.0 en RTX 5090 y Jetson Thor.
- Capacidad de memoria reducida: aproximadamente 1,03 GB de pesos, lo que habilita despliegue en dispositivos de borde compatibles con FP4.
- No dispone de modo generativo, de razonamiento, de tool calling, de capacidades de agente, de vision ni de audio; la propia model card indica que no hay pretension generativa ni MTP.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).

## Casos de uso

- Recuperacion aumentada por generacion (RAG): indexar la base documental con el prefijo `passage: ` y consultar con `query: `, usando los vectores de 2048 dimensiones como espacio de recuperacion de un pipeline generativo posterior. Encaja porque la salida esta normalizada L2 y el modelo esta disenado especificamente para retrieval.
- Busqueda semantica sobre documentacion tecnica interna: permite encontrar fragmentos relevantes aunque no compartan terminos literales con la consulta, reduciendo la dependencia de coincidencia exacta de palabras clave.
- Deduplicacion y near-duplicate detection en corpus grandes: comparar embeddings normalizados con similitud coseno para agrupar documentos casi identicos antes de ingerirlos en un almacen de datos.
- Clustering y organizacion tematica de tickets o articulos: agrupar elementos por cercania en el espacio de embeddings para clasificacion no supervisada o etiquetado asistido.
- Clasificacion de texto mediante embeddings congelados: entrenar un clasificador ligero sobre los vectores de 2048 dimensiones en lugar de ajustar todo el modelo, con coste de computo muy bajo.
- Despliegue en borde con memoria limitada: en Jetson Thor el autor documenta una ejecucion con `--memory-fraction .035`, lo que hace viable servir el embedder en un dispositivo embebido con GPU Blackwell para busqueda local sin enviar datos a la nube.
- Filtrado y recomendacion por similitud: dado un elemento de referencia, recuperar los candidatos mas cercanos en el espacio vectorial para sistemas de recomendacion basados en contenido.
- Evaluacion comparativa de cuantizacion en produccion: usar este checkpoint como referencia interna para medir cuanto degrada FP4 W4A4 frente a BF16 en el propio corpus, antes de adoptar la cuantizacion de forma general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks independientes (MTEB, RTEB) en la informacion disponible. El autor indica de forma explicita que su comprobacion no constituye una certificacion de calidad de retrieval, de contexto largo, de slicing Matryoshka, de concurrencia ni de velocidad. Los unicos datos numericos son una comprobacion de desarrollo sobre 8 vectores procedentes de 4 pares consulta/documento, en un corpus disjunto de calibracion:

| GPU | Coseno medio frente a BF16 | Coseno minimo | Top-1 emparejado |
|---|---|---|---|
| RTX 5090 | 0.988085 | 0.983868 | 4/4 |
| Jetson Thor | 0.988092 | 0.983863 | 4/4 |

El script de comprobacion incluido exige, sobre ese corpus reducido, un coseno medio de al menos 0,95 y un coseno minimo de al menos 0,90, y rechaza vectores no finitos o no normalizados. No hay datos de throughput ni de latencia publicados. El autor advierte que las advertencias de eager/JIT, autotune y configuracion de RoPE del modelo original no establecen rendimiento alguno.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 1.027.791.800 bytes (aproximadamente 0,96 GiB); el autor usa `--memory-fraction .30` en RTX 5090 y `--memory-fraction .035` en Jetson Thor, parametros de vLLM que deben ajustarse al hardware concreto.
- GPU recomendadas: RTX 5090 y Jetson Thor son las unicas verificadas por el autor. Cualquier GPU con soporte nativo de NVFP4 y kernels Cutlass es candidata, dado que Marlin y la emulacion fueron rechazados.
- Cabe en GPU de consumo: si, en RTX 5090 (Blackwell), segun la prueba del autor. No se documenta soporte en GPUs de generaciones anteriores sin FP4 nativo.
- Opciones de despliegue: vLLM 0.25.1 con Torch 2.11.0+cu130 y CUDA 13.0. El paquete CUDA queda fuera del ambito de exportacion MLX/oMLX/MTPLX, y el formato es safetensors con compressed-tensors, por lo que no hay ruta GGUF ni llama.cpp documentada.
- Latencia y throughput: no disponibles. No se publican mediciones de velocidad; el autor senala que las pruebas se hicieron en modo eager, con prefill de secuencia completa, maximo 512 tokens y una sola secuencia, y que esto no constituye una certificacion de rendimiento ni de concurrencia.
- Paso previo obligatorio: descargar el repositorio completo y ejecutar `examples/embedding_smoke.py` para reproducir la comprobacion de desarrollo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AX-Nemotron-3-Embed-1B-CUDA-AXQ-NVFP4-W4A4 (este) | 1.140.918.272 | no disponible | safetensors (compressed-tensors) | NVFP4 W4A4 + BF16 en embeddings y normas | other, `openmdw-1.1` | 20 descargas, 0 likes en el momento de la consulta |
| nvidia/Nemotron-3-Embed-1B-BF16 (modelo base) | no disponible en la informacion proporcionada | no disponible | safetensors BF16 | BF16 (sin cuantizar) | no disponible en la informacion proporcionada | upstream publicado en HuggingFace |
| Otras alternativas de embedding de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio informacion relevante sobre modelos comparables: los resultados obtenidos eran paginas de juegos y finanzas sin relacion con el modelo. No se dispone, por tanto, de datos verificables para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de benchmark independiente: no hay resultados MTEB ni RTEB. La unica evidencia es una comprobacion sobre 8 vectores de 4 pares consulta/documento, en un corpus que ademas se uso para seleccion de candidatos.
- Estado de vista previa de desarrollo: el manifiesto del conversor queda con `runtime_verified=false` y `quality_certified=false`. Las comprobaciones de desarrollo no equivalen a una certificacion.
- Sensibilidad de pesos sin medir: el autor declara explicitamente que la sensibilidad de pesos no se ha evaluado.
- Vectores no intercambiables: los embeddings BF16 y los cuantizados no son compatibles entre si. Es obligatorio reconstruir los indices de retrieval con este checkpoint exacto.
- Consistencia de plantilla obligatoria: los prompts, la tokenizacion, el pooling y la normalizacion deben coincidir entre la codificacion de consultas y la de documentos indexados; cualquier discrepancia invalida la comparacion.
- Restriccion de hardware: al rechazarse Marlin y la emulacion, la ejecucion nativa depende de GPU con soporte NVFP4 y kernels Cutlass. No hay ruta documentada para GPUs sin FP4 nativo.
- Ambito de contexto no documentado: la longitud de contexto no se especifica y las pruebas se limitaron a 512 tokens y una sola secuencia, por lo que el comportamiento en contextos largos o con concurrencia no esta caracterizado.
- Sin capacidades generativas: no debe usarse para generacion de texto, razonamiento, codigo, tool calling ni tareas de agente; es exclusivamente un embedder de retrieval.
- Idiomas no declarados: no se proporciona lista de idiomas soportados, por lo que el comportamiento multilingue es desconocido.
- Riesgo de degradacion silenciosa en retrieval: una caida de calidad por la cuantizacion W4A4 puede no ser visible con cosenos altos frente a BF16, ya que la similitud de vectores no garantiza el mismo ranking final. El autor recomienda evaluar con documentos propios antes de desplegar.
- Licencia: se declara `license: other` con nombre `openmdw-1.1`. Debe revisarse el texto completo de la licencia antes de cualquier uso comercial, ya que las condiciones no se detallan en la informacion proporcionada.
- Sesgos conocidos: no disponibles (no se aporta ninguna evaluacion de sesgo).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-1B-CUDA-AXQ-NVFP4-W4A4
- Modelo base, revision inmutable: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16/tree/c0c9fea93ea424587517f2c59e20db9f1d6bf615
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Artefactos de trazabilidad incluidos en el repositorio: `runtime_audit.json`, `axquant_cuda_plan.json`, `axquant_cuda_manifest.json`, `activation_calibration.json`, `development_runtime_smoke.json`, `provenance.json`, `SHA256SUMS.txt`, directorio `evaluation/`
- Script de reproduccion: `examples/embedding_smoke.py` (incluido en el repositorio)
- Otros enlaces (papers, blogs, repos, demos): no disponible; la busqueda web no devolvio resultados relevantes sobre este modelo.
