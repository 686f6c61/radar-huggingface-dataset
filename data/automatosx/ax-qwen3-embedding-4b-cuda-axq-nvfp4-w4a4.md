# AutomatosX/AX-Qwen3-Embedding-4B-CUDA-AXQ-NVFP4-W4A4

## Resumen

AX-Qwen3-Embedding-4B-CUDA-AXQ-NVFP4-W4A4 es una version cuantizada del modelo de embeddings Qwen/Qwen3-Embedding-4B, publicada por AutomatosX bajo el marco de conversion AXQuant. Se trata de un checkpoint de recuperacion (retrieval) que no genera texto: su unica funcion es producir representaciones vectoriales (embeddings) para similitud semantica y busqueda. La cuantizacion aplica precision mixta NVFP4 W4A4, es decir, pesos y activaciones en FP4 (formato E2M1) para la mayoria de las matrices MLP, mientras que las proyecciones de atencion y los dos primeros y dos ultimos bloques MLP conservan BF16.

El modelo parte del checkpoint BF16 original de Qwen3-Embedding-4B y se convierte mediante el encoder RTN de referencia en NumPy de AXQuant, sin AWQ. Mantiene los 4.021.774.336 parametros del modelo base y una dimension de embedding de 2560, con 36 capas de atencion decoder. Se distribuye con la libreria vLLM y el formato compressed-tensors, empaquetado explicitamente para ejecucion nativa con kernels Cutlass NVFP4 en CUDA.

Es relevante ahora porque permite desplegar un modelo de embeddings de 4B en FP4 nativo sobre hardware Blackwell (RTX 5090 y Jetson Thor, verificados por el autor), con una reduccion de peso considerable, pero se etiqueta como "development preview" y el propio autor aclara que no es una certificacion de calidad ni un benchmark MTEB/RTEB. La ficha debe tratarse, por tanto, como evidencia de desarrollo y no como una validacion de rendimiento de recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3), 36 capas de atencion decoder, 64 modulos CutlassNvFp4LinearKernel; sin tablas MoE |
| Parametros totales | 4.021.774.336 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card solo documenta pruebas de hasta 512 tokens y una unica secuencia) |
| Tipos de cuantizacion | NVFP4 W4A4: pesos y activaciones en FP4 E2M1, escalas E4M3FN por cada 16 y escalas globales FP32; proyecciones de atencion y dos primeros/ultimos bloques MLP en BF16; 96 matrices cuantizadas y 302 tensores protegidos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors, empaquetado para vLLM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base Qwen3-Embedding-4B, un transformer decoder-only orientado a embeddings. La model card confirma 36 capas de atencion decoder y la ausencia de tablas MoE. La conversion sustituye la mayoria de las matrices MLP por capas NVFP4 W4A4 ejecutadas mediante 64 modulos CutlassNvFp4LinearKernel, mientras que las proyecciones de atencion y los dos primeros y dos ultimos bloques MLP permanecen en BF16. Las matrices cuantizadas son 96 y los tensores protegidos 302, con un total de 4.606.914.896 bytes de pesos de salida y una dimension de embedding completa de 2560.

No se trata de un reentrenamiento: es una conversion de precision. El autor indica que se uso el encoder RTN de referencia en NumPy de AXQuant, verificado de forma independiente contra los tensores BF16 de origen, y que no se empleo AWQ. Los pesos de calibracion se documentan en `activation_calibration.json` y la procedencia queda fijada en `provenance.json`. La model card se apoya en ficheros de auditoria como `axquant_cuda_plan.json`, `axquant_cuda_manifest.json`, `development_runtime_smoke.json` y `SHA256SUMS.txt`, con el manifiesto del conversor marcado explicitamente como `runtime_verified=false` y `quality_certified=false`. La sensibilidad de pesos se declara como no medida. No hay informacion sobre el proceso de entrenamiento original (tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion (pipeline `sentence-similarity`).
- Pooling por ultimo token (last-token pooling) con un unico token `<|endoftext|>` (151643); el token de chat `<|im_end|>` (151645) no se anade.
- Normalizacion L2 de los vectores resultantes.
- Instruccion de consulta (query instruction) guardada en el checkpoint.
- Dimension de embedding completa de 2560.
- No es un modelo generativo: la model card indica explicitamente que es un checkpoint de retrieval "con no MTP or generative claim".
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta soporte de vision, audio ni modo de razonamiento (thinking).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Recuperacion aumentada (RAG) sobre corpus propios: genera embeddings de documentos y consultas para alimentar un indice vectorial, con la advertencia de que hay que reconstruir los indices usando exactamente este checkpoint, ya que los vectores BF16 y cuantizados no son intercambiables.
- Busqueda semantica en aplicaciones internas: indexacion de documentacion tecnica o bases de conocimiento para responder consultas por similitud, siempre que se repliquen prompts, tokenizacion, pooling y normalizacion identicos entre consulta y documento.
- Deduplicacion y agrupacion de textos: calculo de similitud coseno entre pares de documentos para detectar contenido duplicado o agrupar temas afines.
- Clasificacion por vecinos mas cercanos: uso de los embeddings como entrada de un clasificador ligero (k-NN, regresion logistica) sin necesidad de reentrenar el modelo.
- Filtrado de recomendaciones basadas en contenido: comparacion de embeddings entre articulos, productos o publicaciones para sugerir elementos semanticamente proximos.
- Evaluacion comparativa de estrategias de cuantizacion: el propio autor lo emplea para medir la fidelidad frente al original BF16 mediante coseno medio y minimo sobre pares consulta/documento.
- Prototipos de bajo coste en hardware Blackwell: aprovechar la ejecucion NVFP4 nativa para experimentar con un modelo de 4B en FP4 antes de comprometer un despliegue en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MTEB, RTEB, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo aporta una comprobacion de desarrollo sobre ocho vectores procedentes de cuatro pares consulta/documento de un corpus de desarrollo disjunto de la calibracion:

| GPU | Coseno medio frente a BF16 | Coseno minimo | Top-1 emparejado |
|---|---|---|---|
| RTX 5090 | 0,982176 | 0,976951 | 4/4 |
| Jetson Thor | 0,982622 | 0,976658 | 4/4 |

El propio autor advierte que esta tabla no es un benchmark MTEB/RTEB, ni una validacion amplia de calidad de recuperacion, contexto largo, recorte Matryoshka, concurrencia o velocidad. La comparacion exige coseno medio de al menos 0,95 y minimo de 0,90 sobre ese corpus reducido.

## Requisitos de hardware

- Peso del repositorio: 4,6 GB; bytes de pesos de salida declarados: 4.606.914.896. Con NVFP4 W4A4 la huella de pesos ronda esos 4,6 GB, mas el coste de activaciones y estados de ejecucion.
- Aceleradores verificados por el autor: Nvidia RTX 5090 y Jetson Thor (ambos con soporte FP4 nativo). Cualquier GPU sin soporte FP4 nativo queda descartada.
- La model card indica que Marlin y la emulacion se rechazan, por lo que no vale ejecutar el modelo con rutas de emulacion de FP4.
- Cabe en GPU de consumo del segmento alto con arquitectura Blackwell (RTX 5090 verificada). No se documenta su funcionamiento en generaciones anteriores como Ampere o Ada.
- Software probado: vLLM 0.25.1, Torch 2.11.0+cu130 y CUDA 13.0, en modo eager, prefill de secuencia completa y un maximo de 512 tokens con una sola secuencia.
- El ejemplo de reproduccion usa `--memory-fraction .30` en RTX 5090 y `--memory-fraction .065` en Jetson Thor.
- Latencia y throughput: no disponibles. El autor advierte que las advertencias de eager/JIT, autotune y configuracion RoPE original no establecen rendimiento.
- Opciones de despliegue: vLLM (libreria declarada). No se documentan llama.cpp, Ollama ni TGI para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3-Embedding-4B-CUDA-AXQ-NVFP4-W4A4 | 4.021.774.336 (4B) | no disponible (probado hasta 512 tokens) | NVFP4 W4A4 con capas BF16 | apache-2.0 | HuggingFace, vLLM, development preview |
| Qwen/Qwen3-Embedding-4B (base BF16) | 4B | no disponible en la informacion proporcionada | BF16 | apache-2.0 | HuggingFace |
| Familia Qwen3-Embedding (0,6B y 8B) | 0,6B / 8B | no disponible en la informacion proporcionada | BF16 y variantes | apache-2.0 | HuggingFace |

La comparativa se limita a la relacion con el checkpoint base y con el resto de tamanos de la familia Qwen3-Embedding, dado que la informacion proporcionada no incluye datos de rendimiento de alternativas. No se dispone de cifras de recuperacion (MTEB/RTEB) que permitan una comparacion cuantitativa con otros modelos de embeddings.

## Limitaciones y advertencias

- Estado de "development preview": el manifiesto del conversor esta marcado como `runtime_verified=false` y `quality_certified=false`; los chequeos de desarrollo no equivalen a una certificacion.
- Los unicos datos de fidelidad corresponden a ocho vectores de cuatro pares consulta/documento de un corpus de desarrollo usado tambien en la seleccion de candidatos; no es una evaluacion independiente.
- Los vectores BF16 y cuantizados no son intercambiables: es obligatorio reconstruir los indices de recuperacion con este checkpoint exacto.
- Prompts, tokenizacion, pooling y normalizacion deben coincidir entre consulta y documentos indexados para que los resultados sean validos.
- La sensibilidad de pesos se declara explicitamente como no medida.
- No hay informacion sobre sesgos, comportamiento multilingue ni riesgo de alucinacion (aunque, al no ser un modelo generativo, el riesgo de alucinacion textual no aplica del mismo modo; si puede producir similitudes erroneas en recuperacion).
- Requiere hardware con FP4 nativo; no se admite emulacion ni Marlin, lo que restringe su despliegue.
- No se documentan pruebas de concurrencia, contexto largo, recorte Matryoshka ni velocidad.
- Licencia apache-2.0, que en principio permite uso comercial, pero la model card no ofrece garantias de calidad para produccion.
- Conviene evaluar los documentos propios antes de desplegar, tal y como recomienda el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-4B-CUDA-AXQ-NVFP4-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Revision fuente inmutable citada: https://huggingface.co/Qwen/Qwen3-Embedding-4B/tree/5cf2132abc99cad020ac570b19d031efec650f2b
- Ejemplo de reproduccion incluido en el repositorio: `examples/embedding_smoke.py` (junto con `evaluation/retrieval-corpus.json` y las referencias `evaluation/rtx5090-bf16.json` y `evaluation/thor-bf16.json`)
- Ficheros de auditoria y procedencia: `runtime_audit.json`, `axquant_cuda_plan.json`, `axquant_cuda_manifest.json`, `activation_calibration.json`, `development_runtime_smoke.json`, `provenance.json`, `SHA256SUMS.txt`
