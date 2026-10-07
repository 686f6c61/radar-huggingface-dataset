# AutomatosX/AX-Qwen3-Embedding-0.6B-CUDA-AXQ-NVFP4-W4A4

## Resumen

AX-Qwen3-Embedding-0.6B-CUDA-AXQ-NVFP4-W4A4 es un checkpoint de embeddings orientado a recuperacion (retrieval), publicado por AutomatosX el 4 de octubre de 2026. No es un modelo nuevo ni un modelo generativo: es una conversion cuantizada del modelo denso Qwen/Qwen3-Embedding-0.6B (revision inmutable `97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3`), con 595.776.512 parametros y una dimension de embedding de 1024.

La particularidad tecnica es el formato de precision: pesos y activaciones en NVFP4 (W4A4), con pesos nativos E2M1, escalas por bloque de 16 elementos en E4M3FN y escalas globales en FP32. Las proyecciones de atencion y los dos primeros y dos ultimos bloques MLP se mantienen en BF16 original, mientras que el resto de matrices MLP usan NVFP4. En total se cuantizaron 72 matrices y se protegieron 238 tensores.

El modelo se distribuye como vista previa de desarrollo (`development-preview`) para vLLM sobre CUDA, probado en RTX 5090 y Jetson Thor. Su relevancia es acotada pero concreta: demuestra un pipeline de embeddings de retrieval en FP4 nativo sobre hardware Blackwell, con 866.026.328 bytes de pesos, sin emulacion ni Marlin. Es un artefacto de evidencia tecnica, no un modelo certificado en calidad: el manifiesto del convertidor declara `runtime_verified=false` y `quality_certified=false`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de encoder/decoder de atencion (modelo base Qwen3-Embedding-0.6B); 28 capas de atencion, 48 modulos CutlassNvFp4LinearKernel en la version cuantizada |
| Parametros totales | 595.776.512 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la informacion proporcionada; en las pruebas se uso un maximo de 512 tokens y una sola secuencia |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos e inputs en E2M1 FP4, escalas por bloque de 16 en E4M3FN, escalas globales FP32); 72 matrices cuantizadas y 238 tensores protegidos; atencion y primeros/ultimos dos bloques MLP en BF16 |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Qwen3-Embedding es multilingue segun su documentacion upstream, dato no verificado en esta ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato fisico NVFP4 / compressed-tensors), 866.026.328 bytes de pesos |
| Dimension de embedding | 1024 |
| Libreria de inferencia | vLLM |
| Tamano del repositorio | 0,9 GB |
| Pooling | last-token pooling, instruccion de query guardada, exactamente un token `<|endoftext|>` (151643), normalizacion L2 |
| Estado | development-preview (no certificado en calidad) |

## Arquitectura y entrenamiento

No hay entrenamiento propio: se trata de una conversion por cuantizacion post-entrenamiento (PTQ) del checkpoint BF16 original de Qwen, sin AWQ. El pipeline emplea el encoder RTN de referencia en NumPy de AXQuant, verificado de forma independiente contra los tensores BF16 de origen conservados. Los pesos, los recursos de pooling, la calibracion y los payloads de salida estan ligados por checksums, y `provenance.json` vincula el codigo de reproduccion revisado con cada digest de origen, calibracion y payload. La sensibilidad de los pesos se declara explicitamente como no medida.

El esquema de precision mixta es la innovacion principal: solo las matrices MLP intermedias pasan a NVFP4 W4A4, mientras que las proyecciones de atencion y los dos primeros y dos ultimos bloques MLP permanecen en BF16 para limitar la degradacion. La ruta de ejecucion nativa requiere kernels FP4 reales (CutlassNvFp4LinearKernel); se rechazan explicitamente Marlin y cualquier forma de emulacion. La configuracion probada es vLLM 0.25.1, Torch 2.11.0+cu130 y CUDA 13.0, en modo eager, prefill de secuencia completa, maximo 512 tokens y una unica secuencia. No hay tablas MoE. El formato de tokens es estricto: se anade exactamente un `<|endoftext|>` (151643) y no se anade `<|im_end|>` (151645).

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion (pipeline declarado: `sentence-similarity`).
- Busqueda semantica y recuperacion densa (dense retrieval) sobre corpus documentales.
- Soporte de instruccion de query guardada, lo que permite formatear consultas de forma diferenciada respecto a los documentos indexados.
- Pooling de ultimo token con normalizacion L2, adecuado para similitud coseno.
- Capacidades multilingues: no confirmadas en la informacion disponible; dependen del modelo base Qwen3-Embedding-0.6B.
- Ejecucion nativa en FP4 sobre hardware Blackwell mediante vLLM, sin kernels de emulacion.
- No es un modelo generativo: no hay capacidad de chat, razonamiento, codigo ni tool calling. El propio autor indica que el checkpoint no incluye ninguna afirmacion generativa ni MTP.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Recuperacion aumentada (RAG) de baja latencia en produccion: el checkpoint ocupa 866 MB de pesos en FP4 y puede servir como codificador de consultas y documentos en un pipeline RAG sobre GPU Blackwell, reduciendo el coste por embedding frente al BF16 equivalente.
- Busqueda semantica sobre bases documentales internas: indexar un corpus empresarial y consultar por similitud coseno, aprovechando la instruccion de query guardada para separar el formato de consulta del de documento.
- Deduplicacion y agrupamiento de documentos: calcular embeddings normalizados en L2 y aplicar clustering o deteccion de near-duplicates sobre grandes volumenes de texto.
- Filtrado previo de candidatos en sistemas de recomendacion de contenido: recuperar los N items mas similares a una descripcion textual antes de un re-ranking mas costoso.
- Clasificacion zero-shot por similitud: comparar embeddings de textos con embeddings de etiquetas descriptivas para enrutado de tickets o etiquetado tematico sin entrenamiento adicional.
- Moderacion y deteccion de contenido duplicado en plataformas: comparar cada nuevo envio contra un indice de referencia para detectar copias o reenvios.
- Despliegue en borde (edge): el modelo se probo en Jetson Thor, lo que abre la puerta a recuperacion semantica local en dispositivos con acelerador Blackwell y presupuesto de memoria muy ajustado.

Advertencia transversal para todos estos casos: los indices deben reconstruirse con este checkpoint exacto. Los vectores BF16 y los cuantizados no son intercambiables, y prompts, tokenizacion, pooling y normalizacion deben coincidir entre la indexacion de documentos y la codificacion de consultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MTEB, RTEB u otros) en la informacion disponible. El autor lo declara explicitamente: las cifras que siguen no constituyen una certificacion de calidad de retrieval, contexto largo, recorte Matryoshka, concurrencia ni velocidad.

| Metrica | RTX 5090 | Jetson Thor |
|---|---|---|
| Similitud coseno media frente a BF16 | 0,969200 | 0,968076 |
| Similitud coseno minima | 0,946783 | 0,952783 |
| Top-1 emparejado | 4/4 | 4/4 |

Contexto de la medicion: 8 vectores procedentes de 4 pares consulta/documento simples, sobre un corpus de desarrollo disjunto de la calibracion y tambien usado en la seleccion de candidatos. El script de comprobacion exige coseno medio >= 0,95 y coseno minimo >= 0,90 sobre ese corpus reducido. Las advertencias de eager/JIT, autotune y configuracion RoPE del upstream no establecen ningun rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,87 GB solo de pesos en FP4, mas activaciones y estado de ejecucion. Con contexto de 512 tokens y una secuencia el consumo adicional es reducido; no hay cifras publicadas para lotes mayores.
- GPU probadas: RTX 5090 y Jetson Thor, ambas con soporte nativo de FP4 (Blackwell).
- Cabe en GPU de consumo: si, en la gama RTX 50 (Blackwell) con soporte NVFP4. En GPUs anteriores (sm_90 o inferior) no hay ruta documentada, ya que se rechazan Marlin y la emulacion.
- Opciones de despliegue: vLLM 0.25.1 con Torch 2.11.0+cu130 y CUDA 13.0. No hay GGUF ni ruta llama.cpp/Ollama documentada, ni ruta MLX/oMLX/MTPLX (el autor indica que este paquete CUDA queda fuera del alcance de exportacion MLX).
- Parametros de memoria usados en las pruebas: `--memory-fraction .30` en RTX 5090 y `--memory-fraction .035` en Jetson Thor.
- Configuracion de ejecucion validada: modo eager, prefill de secuencia completa, maximo 512 tokens, una sola secuencia.
- Latencia y throughput: no disponible. No se publican medidas de velocidad ni de concurrencia.
- Requisitos de software: el ejemplo de runtime no necesita codigo remoto del modelo ni instalacion de AXQuant.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / cuantizacion | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3-Embedding-0.6B-CUDA-AXQ-NVFP4-W4A4 | 595.776.512 | no especificado; 512 tokens probados | Apache-2.0 | safetensors NVFP4 W4A4 (compressed-tensors) | HuggingFace, 22 descargas, 0 likes |
| Qwen/Qwen3-Embedding-0.6B (BF16) | 595.776.512 | no disponible en esta ficha | Apache-2.0 | safetensors BF16 | HuggingFace (upstream) |
| Qwen/Qwen3-Embedding-4B | no disponible en esta ficha | no disponible en esta ficha | Apache-2.0 | safetensors BF16 | HuggingFace (upstream) |
| bge-m3 | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | safetensors | HuggingFace |

Los datos de las filas distintas de la primera proceden de la documentacion upstream y no se han verificado en esta ficha. No hay resultados comparativos de rendimiento publicados para este checkpoint, por lo que la comparacion se limita a parametros, licencia, formato y disponibilidad. La ventaja diferencial frente al BF16 original es exclusivamente de huella de memoria y de ejecucion nativa en FP4 sobre Blackwell; no hay evidencia publicada de que la calidad de recuperacion se mantenga fuera del corpus de desarrollo descrito arriba.

## Limitaciones y advertencias

- Estado de vista previa de desarrollo: el manifiesto del convertidor declara `runtime_verified=false` y `quality_certified=false`. Las comprobaciones de runtime no equivalen a una certificacion.
- La sensibilidad de los pesos a la cuantizacion no se ha medido.
- La validacion de calidad se limita a 4 pares consulta/documento (8 vectores) de un corpus de desarrollo disjunto de la calibracion, que ademas se uso para seleccionar candidatos. No es una evaluacion independiente ni representativa.
- No hay datos de MTEB, RTEB, contexto largo, recorte Matryoshka, concurrencia ni velocidad.
- Los vectores BF16 y NVFP4 no son intercambiables: hay que reconstruir los indices con este checkpoint exacto y mantener consistentes prompt, tokenizacion, pooling y normalizacion entre indexacion y consulta.
- La tokenizacion es estricta: exactamente un `<|endoftext|>` (151643) y sin `<|im_end|>` (151645). Cualquier desviacion invalida la comparabilidad de los embeddings.
- Dependencia de hardware: requiere kernels FP4 nativos; Marlin y la emulacion se rechazan explicitamente, lo que excluye GPUs sin soporte NVFP4.
- Solo se probo con maximo 512 tokens y una unica secuencia en modo eager; no hay evidencia de comportamiento con lotes grandes, alta concurrencia o secuencias mas largas.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no genera texto. El riesgo equivalente es recuperar documentos semanticamente proximos pero irrelevantes, y no hay metricas publicadas de precision o recall.
- Idiomas soportados: no confirmados. No hay evaluacion multilingue en la informacion disponible.
- Sesgos: no se documenta ninguna evaluacion de sesgos. Al ser un derivado del modelo base, hereda los sesgos de los datos de entrenamiento de Qwen3-Embedding, no analizados aqui.
- Licencia Apache-2.0, que permite uso comercial, con la obligacion de conservar la licencia y los avisos originales.
- La informacion de la model card esta fechada en octubre de 2026 y el repositorio tiene un volumen de uso muy bajo (22 descargas, 0 likes), por lo que no hay comunidad ni soporte consolidado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-0.6B-CUDA-AXQ-NVFP4-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Revision inmutable del modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B/tree/97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3
- Auditoria de runtime (referenciada en la model card, dentro del repositorio): `runtime_audit.json`
- Manifiestos y evidencia de conversion en el repositorio: `axquant_cuda_plan.json`, `axquant_cuda_manifest.json`, `activation_calibration.json`, `development_runtime_smoke.json`, `provenance.json`, `SHA256SUMS.txt`
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo, su autor o su pipeline de cuantizacion; los resultados obtenidos no guardan relacion con el contenido de esta ficha.
