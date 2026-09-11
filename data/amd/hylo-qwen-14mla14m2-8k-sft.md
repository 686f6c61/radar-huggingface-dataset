# amd/HyLo-Qwen-14MLA14M2-8K-SFT

## Resumen

HyLo-Qwen-14MLA14M2-8K-SFT es un checkpoint experimental desarrollado por AMD que convierte un Transformer denso preentrenado (Qwen/Qwen3-1.7B) en una arquitectura híbrida mediante "upcycling", en lugar de entrenar un modelo híbrido desde cero. De las 28 capas totales, 14 se convierten en capas de atencion Multi-head Latent Attention (MLA) y las 14 restantes en bloques lineales Mamba-2 (SSM). El resultado son 2.065.541.280 parametros (unos 2,07B) con un KV cache que se reduce al 7,8% del del modelo base.

El checkpoint forma parte de la linea de investigacion presentada en el articulo "Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling" (arXiv:2604.24715), donde aparece como HyLo-Qwen-14MLA14M2 en la tabla 4. Se ha entrenado con destilacion desde Qwen/Qwen3-8B como profesor, primero con una etapa Enhanced-ILD a 2.048 tokens y despues con SFT de contexto largo a 8.192 tokens. Los pesos se distribuyen en float32 (8,3 GB de repositorio) y deben cargarse en bfloat16.

Su relevancia actual es doble: por un lado, demuestra que se puede reciclar un modelo denso ya entrenado para obtener una arquitectura hibrida con compresion agresiva de KV cache; por otro, es un ejemplo de entrenamiento optimizado para hardware AMD (8x Instinct MI300X con FSDP). Es importante senalar que la licencia declarada es de investigacion, no comercial, y que la longitud de contexto soportada y evaluada es de 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Transformer: 14 capas MLA (Multi-head Latent Attention) + 14 capas Mamba-2 (state space model), 28 capas en total |
| Parametros totales | 2.065.541.280 (~2,07B; el paper reporta 2,1B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens entrenados y evaluados; `max_position_embeddings` es 40.960 pero no es una longitud soportada |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; el checkpoint se distribuye en float32) |
| Idiomas soportados | Ingles (en) |
| Licencia | AMD Hybrid Models Research Only (RAIL-MS); los metadatos de HuggingFace incluyen tambien la etiqueta apache-2.0 |
| Formato de pesos | safetensors (float32, recomendado cargar en bfloat16) |

Dimensiones MLA: `kv_lora_rank` 256, `q_lora_rank` 1344, `qk_rope_head_dim` 64, `qk_nope_head_dim` 64, `v_head_dim` 128, 16 cabezas de atencion.
Dimensiones Mamba-2: `d_state` 128, `ngroups` 16, `expand` 1, `d_inner` 2048, `d_xb` 1024.

## Arquitectura y entrenamiento

La conversion sustituye capas de atencion completa por dos tipos de bloque. Las capas MLA mantienen atencion pero cachean un latente de rango bajo (`kv_lora_rank` 256) en lugar de claves y valores completos. Las capas Mamba-2 son bloques de espacio de estados con un estado recurrente de tamano fijo, de modo que no generan KV cache alguno. La colocacion no sigue un patron repetitivo, sino que se asigna por indice: las capas MLA ocupan las posiciones pares [0, 2, 4, ..., 26] y las Mamba-2 las impares [1, 3, 5, ..., 27], situando la atencion donde el modelo base es mas sensible a perderla. La configuracion hibrida vive en `hybrid_config.json`; el `config.json` incluido es el del modelo base y se mantiene solo como referencia.

El entrenamiento consta de dos etapas. La primera, Enhanced-ILD, aplica destilacion capa a capa para alinear los bloques MLA y lineales recien inicializados con las representaciones internas del modelo base, a 2.048 tokens, con learning rate 2e-4 y el 20% de la mezcla de SFT. La segunda es un SFT de contexto largo con destilacion guiada por profesor a 8.192 tokens, learning rate 6e-5 y la mezcla completa. La funcion de perdida es divergencia KL entre las distribuciones del siguiente token del estudiante y del profesor (kl_weight 1.0, ce_weight 0.0), con batch global de 32 secuencias, una epoca, schedule coseno y warmup del 1%, en precision mixta bfloat16 sobre 8x AMD Instinct MI300X con FSDP. Como innovacion de eficiencia destacan un kernel KL fusionado que evita materializar el tensor completo de logits y el propio esquema de upcycling, que reutiliza un modelo denso en lugar de preentrenar desde cero. Los datos de entrenamiento provienen de `JunxiongWang/sftdatasetv3`, `nvidia/OpenMathInstruct-2`, `open-thoughts/OpenThoughts-114k`, `open-r1/OpenR1-Math-220k` y `nvidia/ChatQA2-Long-SFT-data`, en variantes procesadas por AMD (subconjuntos, reformateo a la plantilla de chat y descontaminacion frente a los conjuntos de evaluacion). No se aplico interpolacion posicional (`rope_scaling.factor` 1.0), porque la ventana RoPE nativa del backbone (32.768 tokens) ya cubre la longitud entrenada.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con plantilla de chat heredada de Qwen3.
- Razonamiento matematico: la mezcla de SFT incluye OpenMathInstruct-2 y OpenR1-Math-220k, orientados a problemas matematicos y cadenas de razonamiento.
- Razonamiento general y "thinking": el material de OpenThoughts-114k aporta trazas de razonamiento; el modelo base Qwen3 dispone de modo de pensamiento.
- Comprension de contexto largo dentro de su ventana entrenada de 8.192 tokens, con datos especificos de ChatQA2-Long-SFT.
- Eficiencia de memoria en inferencia: el KV cache se reduce al 7,8% del modelo base, lo que permite lotes mayores o secuencias mas largas en la misma VRAM.
- Capacidad de destilacion: disenado para reproducir el comportamiento de Qwen3-8B en un modelo de 2,07B.
- Tool calling / function calling: no se declara explicitamente en la model card; el modelo base Qwen3-1.7B si soporta function calling, pero no hay confirmacion de que se conserve tras el upcycling y el SFT.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente en la informacion disponible.
- Vision y audio: no soportados.
- Multilingue: no, limitado a ingles.

## Casos de uso

- Servicio de chat en ingles con presupuesto de memoria ajustado: el modelo ocupa 2,07B parametros y reduce el KV cache al 7,8%, por lo que puede servirse con lotes concurrentes altos en una sola GPU consumer de 8-12 GB en bfloat16.
- RAG documental con fragmentos de hasta 8K tokens: la ventana entrenada de 8.192 tokens permite insertar varios pasajes largos y la pregunta en un unico prompt, con el KV cache comprimido reduciendo el coste por peticion.
- Resolucion de problemas matematicos y explicaciones paso a paso: el entrenamiento sobre OpenMathInstruct-2 y OpenR1-Math-220k lo hace adecuado para tutoria automatica o generacion de soluciones razonadas, siempre que la respuesta quepa en 8K tokens.
- Investigacion en arquitecturas hibridas: sirve como punto de partida reproducible para estudiar upcycling, mezclas MLA/Mamba-2 y destilacion con kernel KL fusionado.
- Destilacion y ajuste fino posteriores: al ser un estudiante de Qwen3-8B con licencia de investigacion, es un banco de pruebas para comparar recetas de destilacion o para SFT adicional en dominios concretos.
- Despliegue de bajo coste en entornos de desarrollo y CI: ejecucion local en una GPU de gama media para generar pruebas, documentacion tecnica o resumenes de fragmentos de codigo, evitando dependencias de API externas.
- Evaluacion comparativa de eficiencia de atencion: util para medir el impacto real de la compresion de KV cache en latencia y throughput frente a Qwen3-1.7B bajo la misma carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El array `results` del model-index esta vacio y las tablas de evaluacion de la model card (razonamiento de sentido comun, RULER y otras, medidas 0-shot con EleutherAI lm-evaluation-harness y tomadas de la tabla 4 del paper) aparecen sin valores numericos en la informacion proporcionada. No se deben asumir cifras concretas sin consultar el articulo original.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 8,3 GB en float32 (tamano real del repositorio), aproximadamente 4,1 GB en bfloat16, en torno a 2,1 GB en int8 y cerca de 1,2 GB en 4 bits (estimaciones por tamano de parametros; no hay cuantizaciones publicadas oficialmente).
- A la VRAM de pesos hay que sumar el KV cache, que es el 7,8% del de Qwen3-1.7B, por lo que el ahorro es mas relevante con lotes grandes y contextos cercanos a 8K.
- GPU consumer: si cabe en tarjetas de 8 GB o mas en bfloat16 con margen limitado para el cache; con 12 GB (por ejemplo RTX 3060 12 GB) o 16 GB (RTX 4060 Ti 16 GB, RTX 4080) el despliegue resulta holgado. En 24 GB (RTX 3090, RTX 4090) es posible un servicio con concurrencia moderada.
- GPU de datacenter: el entrenamiento se realizo con 8x AMD Instinct MI300X; para inferencia son suficientes A100 40 GB, H100, L40S o MI300X, aunque el modelo es pequeno y no las aprovecha salvo en lotes muy grandes.
- Opciones de despliegue: se necesita un stack que implemente MLA y Mamba-2. El soporte en llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible. En vLLM es imprescindible fijar explicitamente la longitud maxima (`--max-model-len 8192`), porque el campo `max_position_embeddings` del config (40.960) no refleja una longitud soportada y las pilas de servicio dimensionan el KV cache a partir de el.
- Latencia y throughput estimados: no disponibles.
- Precision de carga: los pesos estan en float32; la model card indica cargarlos en bfloat16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto entrenado | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyLo-Qwen-14MLA14M2-8K-SFT | 2,07B (2.065.541.280) | 8.192 tokens | Hibrida 14 MLA + 14 Mamba-2 | AMD Hybrid Models Research Only (RAIL-MS) | HuggingFace |
| Qwen/Qwen3-1.7B (modelo base) | 1,7B | 32.768 tokens nativos (hasta 40.960 en config) | Transformer denso con atencion completa y GQA | Apache 2.0 | HuggingFace |
| HyLo-Qwen-14MLA14M2-64K (version hermana) | 2,07B (misma receta) | 65.536 tokens segun la model card | Hibrida 14 MLA + 14 Mamba-2 | AMD Hybrid Models Research Only (RAIL-MS) | HuggingFace |
| Qwen/Qwen3-8B (profesor de destilacion, no equivalente en tamano) | 8B | 32.768 tokens nativos | Transformer denso | Apache 2.0 | HuggingFace |

El dato diferencial frente a Qwen3-1.7B es el KV cache (7,8%) y la mezcla de capas lineales; el precio es una ventana de contexto entrenada cuatro veces menor y una licencia restringida a investigacion. No se dispone de datos de rendimiento comparativos en la informacion proporcionada, por lo que no es posible afirmar cual es superior en tareas concretas.

## Limitaciones y advertencias

- Licencia de investigacion: la licencia declarada es "amd-hybrid-models-research-only-rail-ms", que restringe el uso comercial pese a que los metadatos incluyan tambien la etiqueta apache-2.0. Conviene revisar el fichero LICENSE del repositorio antes de cualquier uso en produccion.
- Datos con licencia no comercial: uno de los conjuntos de entrenamiento, `nvidia/ChatQA2-Long-SFT-data`, es cc-by-nc-2.0, lo que anade incertidumbre sobre el uso comercial del modelo resultante.
- Contexto limitado a 8.192 tokens: aunque el config declare 40.960 y `rope_scaling.factor` sea 1.0, la model card advierte que mas alla de 8.192 tokens la calidad no esta medida ni garantizada. Las cifras RULER del paper ilustran el deterioro al superar la longitud de entrenamiento. Si se necesita 16K o mas, hay que usar la version de 64K.
- Riesgo de degradacion en el servicio si no se fija `--max-model-len 8192`: los frameworks dimensionan el KV cache con `max_position_embeddings` y podrian asignar memoria muy por encima de lo necesario.
- Solo ingles: el modelo no soporta otros idiomas de forma declarada, por lo que no es adecuado para aplicaciones multilingues.
- Alucinacion: es un modelo de 2,07B entrenado por destilacion desde un profesor de 8B; cabe esperar una tasa de error factual mayor que la del profesor, y no se han publicado evaluaciones de fidelidad.
- Sesgos: la informacion disponible no documenta un analisis de sesgos. Al derivar de Qwen3 y de mezclas de SFT en ingles con predominio de contenido matematico y de razonamiento, es probable que herede los sesgos del modelo base y de dichos corpus.
- Checkpoint en float32: el repositorio ocupa 8,3 GB y debe cargarse en bfloat16; ignorar esto duplica el uso de memoria y puede degradar el rendimiento.
- Tool calling y uso como agente: no confirmados en la model card; conviene validarlos empiricamente antes de integrarlos en un pipeline de produccion.
- Sin benchmarks publicados en la informacion disponible: no hay cifras verificables de MMLU, HumanEval, GSM8K ni RULER en los materiales aportados, y el model-index aparece vacio.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y la model card se presenta como material de investigacion, no como una version estable para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/HyLo-Qwen-14MLA14M2-8K-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3-8B
- Articulo principal: https://arxiv.org/abs/2604.24715 (Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling)
- Referencia adicional citada en los tags: https://arxiv.org/abs/2505.17272
- Referencia adicional citada en los tags: https://arxiv.org/abs/2503.11132
- Dataset de SFT: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset de matematicas: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset de razonamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset de matematicas: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de contexto largo: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data
- Licencia: fichero LICENSE del repositorio de HuggingFace
