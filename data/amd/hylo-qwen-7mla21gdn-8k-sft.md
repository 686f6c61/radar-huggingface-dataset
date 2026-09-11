# amd/HyLo-Qwen-7MLA21GDN-8K-SFT

## Resumen

HyLo-Qwen-7MLA21GDN-8K-SFT es un modelo de lenguaje hibrido desarrollado por AMD dentro de su linea de investigacion HyLo, cuyo objetivo es convertir un transformer preentrenado en una arquitectura hibrida en lugar de entrenar una desde cero. Partiendo de Qwen/Qwen3-1.7B, el modelo sustituye capas de atencion completa por dos tipos de bloque: 7 capas de Multi-head Latent Attention (MLA) y 21 capas de Gated DeltaNet, dando un total de 28 capas y 2.284.173.820 parametros.

El problema que resuelve es el coste de la cache KV en contextos largos. Las capas Gated DeltaNet mantienen un estado recurrente de tamano fijo y no generan cache KV, mientras que las capas MLA almacenan un latente de bajo rango en lugar de claves y valores completos. El resultado es una cache KV equivalente al 3,9 por ciento de la del modelo base, lo que reduce drasticamente la memoria necesaria para servir conversaciones largas o lotes grandes en una sola GPU.

El checkpoint fue ajustado por supervisado a 8.192 tokens de contexto, usando Qwen/Qwen3-8B como profesor de destilacion, y se describe en el articulo "Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling" (arXiv:2604.24715). Es relevante ahora porque demuestra que se puede reciclar un modelo denso pequeno ya entrenado para obtener eficiencia de contexto largo sin reentrenar desde cero, aunque su licencia es estrictamente de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida transformer: 7 capas MLA (Multi-head Latent Attention) + 21 capas Gated DeltaNet (atencion lineal con estado recurrente) |
| Parametros totales | 2.284.173.820 (2,28B; el articulo reporta 2,3B) |
| Longitud de contexto | 8.192 tokens (entrenado y evaluado); `max_position_embeddings` del config es 40.960 pero no es una longitud soportada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el checkpoint se distribuye en float32 y debe cargarse en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | amd-hybrid-models-research-only-rail-ms (solo investigacion); la etiqueta YAML incluye ademas `apache-2.0` |
| Formato de pesos | safetensors (pesos en float32, cargar en bfloat16); repositorio de 9,1 GB |
| Capas MLA | indices [1, 5, 9, 13, 17, 21, 25] |
| Capas Gated DeltaNet | indices [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27] |
| Cache KV | 3,9 por ciento de la del modelo base (unas 25 veces menor) |
| Modelo base | Qwen/Qwen3-1.7B |
| Profesor de destilacion | Qwen/Qwen3-8B |
| Precision del checkpoint | float32 |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 11 de septiembre de 2026 |

Dimensiones MLA: `kv_lora_rank` 256, `q_lora_rank` 1344, `qk_rope_head_dim` 64, `qk_nope_head_dim` 64, `v_head_dim` 128, 16 cabezas de atencion.

Dimensiones Gated DeltaNet: `gdn_num_heads` 6, `gdn_head_dim` 256.

## Arquitectura y entrenamiento

La colocacion de capas no sigue un patron repetitivo, sino que se decide por indice: las capas MLA ocupan las posiciones donde el modelo base es mas sensible a perder atencion completa, y el resto se convierte en bloques lineales. Gated DeltaNet es un bloque de atencion lineal con regla delta y compuerta que mantiene un estado recurrente de tamano fijo, por lo que no contribuye en absoluto a la cache KV. Las capas MLA conservan atencion real pero cachean un latente de bajo rango en lugar de claves y valores completos. La configuracion hibrida vive en `hybrid_config.json`, mientras que `config.json` conserva la configuracion del modelo base solo como referencia.

El entrenamiento tiene dos etapas. La primera, Enhanced-ILD, aplica destilacion capa a capa a 2.048 tokens de contexto con learning rate 2e-4 y el 20 por ciento de la mezcla de SFT, para alinear los bloques MLA y lineales recien inicializados con las representaciones internas del modelo base. La segunda es un SFT de contexto largo con destilacion guiada por profesor a 8.192 tokens, learning rate 6e-5 y la mezcla completa. La funcion de perdida es divergencia KL entre las distribuciones del estudiante y del profesor (`kl_weight` 1.0, `ce_weight` 0.0), con batch global de 16 secuencias, una epoca, schedule coseno con ratio de calentamiento 0.01 y precision mixta bfloat16. El entrenamiento se ejecuto en 8 GPU AMD Instinct MI300X con FSDP, usando un kernel KL fusionado que evita materializar el tensor completo de logits. No se aplico interpolacion posicional (`rope_scaling.factor` 1.0) porque la ventana RoPE nativa del backbone (32.768 tokens) ya cubre la longitud entrenada.

Los datos de SFT proceden de JunxiongWang/sftdatasetv3 (Apache-2.0), nvidia/OpenMathInstruct-2 (CC-BY-4.0), open-thoughts/OpenThoughts-114k (Apache-2.0), open-r1/OpenR1-Math-220k (Apache-2.0) y nvidia/ChatQA2-Long-SFT-data (CC-BY-NC-2.0). AMD uso variantes procesadas de estos conjuntos con submuestreo, reformateo a la plantilla de chat y descontaminacion frente a las suites de evaluacion.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles con plantilla de chat heredada de Qwen3.
- Razonamiento de contexto largo hasta 8.192 tokens, con atencion completa parcial en 7 capas MLA.
- Razonamiento matematico implicito por los datos de entrenamiento (OpenMathInstruct-2, OpenR1-Math-220k, OpenThoughts-114k), aunque limitado por el tamano del backbone de 1,7B.
- QA sobre documentos largos, reforzado con el subconjunto nvidia/ChatQA2-Long-SFT-data.
- Inferencia eficiente en memoria: 3,9 por ciento de la cache KV del modelo base, lo que permite lotes grandes y muchas sesiones concurrentes.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Destilacion como senal de calidad: el modelo imita a Qwen3-8B en la distribucion de siguiente token, no solo en las etiquetas duras.

## Casos de uso

- Analisis de documentos largos en ingles: contratos, informes tecnicos o articulos de hasta 8.000 tokens se pueden pasar completos en una sola ventana, evitando troceado y perdida de contexto entre fragmentos.
- RAG de alto rendimiento: al ocupar la cache KV un 3,9 por ciento de la del modelo base, un mismo servidor puede mantener muchas mas sesiones concurrentes con contexto largo, lo que abarata el coste por consulta en pipelines de recuperacion aumentada.
- Despliegue on-premise en una sola GPU de consumo: con pesos de aproximadamente 4,6 GB en bfloat16, el modelo cabe en tarjetas de 8 GB o mas, lo que permite ofrecer asistencia conversacional sin infraestructura de centro de datos.
- Servicio de chat con throughput elevado: el batch global de 16 secuencias usado en entrenamiento y la cache reducida permiten lotes mayores en inferencia, adecuado para productos con muchas peticiones cortas simultaneas.
- Asistencia en matematicas y problemas cuantitativos de nivel basico-medio: los conjuntos de razonamiento matematico del entrenamiento cubren este tipo de tareas, aunque conviene validar la salida por el tamano del modelo.
- Investigacion en arquitecturas hibridas: sirve como punto de partida reproducible para estudiar upcycling, mezclas MLA/DeltaNet, compresion de cache KV y destilacion de profesor grande a estudiante pequeno.
- Prototipado de destilacion profesor-estudiante: el checkpoint documenta la receta completa (Enhanced-ILD mas SFT de contexto largo con KL), util para replicar el metodo sobre otros backbones.
- Evaluacion de stacks de servido: permite medir en la practica como se comportan vLLM u otros motores con capas lineales y MLA frente a un transformer denso equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El campo `model-index` de la model card esta vacio (`"results": []`) y la tabla de razonamiento de sentido comun de la model card aparece truncada, sin filas. El autor indica que todas las cifras proceden de la Tabla 4 (backbone Qwen3-1.7B) del articulo arXiv:2604.24715, medidas en regimen 0-shot con EleutherAI lm-evaluation-harness, e incluye numeros RULER para comparar el comportamiento de un modelo entrenado a 8K cuando se le exige mas contexto, pero esos valores no estan presentes en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 4,6 GB solo de pesos (2,28B parametros), mas cache KV y activaciones. El repositorio ocupa 9,1 GB porque los pesos se almacenan en float32.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,5 GB de pesos, mas cache y activaciones (estimacion, no un dato publicado).
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1,5 GB de pesos, mas cache y activaciones (estimacion, no un dato publicado).
- Cache KV: al ser el 3,9 por ciento de la del modelo base, el coste por token es unas 25 veces menor, por lo que a 8.192 tokens el consumo de cache es marginal frente al de los pesos.
- GPU de gama de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, e incluso en tarjetas de 8 GB en bfloat16.
- GPU de centro de datos: no requiere A100 ni H100; el entrenamiento si se hizo en 8 GPU AMD Instinct MI300X con FSDP, pero la inferencia de este checkpoint no necesita ese hardware.
- Aceleradores AMD: al ser un modelo de AMD, es razonable esperar soporte en ROCm, aunque no se detalla en la informacion disponible.
- Opciones de despliegue: no se especifican en la model card. Al tratarse de una arquitectura hibrida con capas MLA y Gated DeltaNet, el motor de inferencia debe implementar esos dos tipos de bloque; conviene verificar el soporte real en vLLM, TGI, llama.cpp u Ollama antes de planificar un despliegue.
- Configuracion obligatoria: fijar la longitud maxima a 8.192 tokens de forma explicita (por ejemplo `--max-model-len 8192`), ya que los servidores dimensionan la cache KV a partir de `max_position_embeddings`, que en el config vale 40.960 de forma heredada.
- Precision de carga: cargar en bfloat16; el checkpoint esta en float32.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Cache KV | Disponibilidad |
|---|---|---|---|---|---|---|
| HyLo-Qwen-7MLA21GDN-8K-SFT | 2,28B | 8.192 tokens | Hibrida (7 MLA + 21 Gated DeltaNet) | amd-hybrid-models-research-only-rail-ms (solo investigacion) | 3,9 por ciento del base | HuggingFace, 0 descargas |
| Qwen/Qwen3-1.7B (modelo base) | 1,7B | 32.768 tokens nativos | Transformer denso | Apache-2.0 | Referencia (100 por ciento) | Ampliamente disponible |
| Qwen/Qwen3-8B (profesor) | 8B | 32.768 tokens nativos | Transformer denso | Apache-2.0 | Referencia | Ampliamente disponible |
| Version 64K del mismo modelo HyLo | no disponible | 64.000 tokens (segun la model card) | Hibrida MLA + Gated DeltaNet | amd-hybrid-models-research-only-rail-ms | no disponible | Release hermano del mismo recipe |

Notas sobre la comparacion: el modelo HyLo parte del Qwen3-1.7B y anade unos 0,58B de parametros al convertir capas, pero reduce la ventana soportada de 32.768 a 8.192 tokens y cambia la licencia Apache-2.0 por una de solo investigacion. Los datos de rendimiento comparado (MMLU, HumanEval, GSM8K, RULER) no estan disponibles en la informacion proporcionada, por lo que no se puede afirmar si la conversion mantiene, mejora o degrada la calidad del backbone en tareas de corto contexto. El autor afirma que el modelo conserva la precision de contexto corto, pero no se aportan cifras verificables en la informacion recibida.

## Limitaciones y advertencias

- Licencia de solo investigacion: el campo de licencia es `amd-hybrid-models-research-only-rail-ms` (RAIL-MS), con archivo LICENSE propio. Aunque la etiqueta YAML mencione `apache-2.0`, no se debe asumir uso comercial permitido; hay que revisar el texto de la licencia antes de cualquier despliegue productivo.
- Datos de entrenamiento con restriccion no comercial: nvidia/ChatQA2-Long-SFT-data se distribuye bajo CC-BY-NC-2.0, lo que anade una capa adicional de cautela sobre el uso comercial del checkpoint.
- Ventana real de 8.192 tokens: `max_position_embeddings` vale 40.960 en el config, pero es un valor heredado del modelo base y no una capacidad soportada. Superar los 8.192 tokens degrada la calidad y ademas provoca un sobredimensionado de la cache KV en el servidor si no se fija el limite explicitamente.
- Idioma unico: solo ingles. El rendimiento en castellano o en otros idiomas no esta evaluado y previsiblemente sera pobre.
- Tamano reducido del backbone: con 2,28B parametros, la tasa de alucinacion y los errores de razonamiento en tareas complejas son esperables, especialmente en matematicas avanzadas y codigo.
- Entrenamiento de una sola epoca por destilacion KL: el modelo imita la distribucion del profesor Qwen3-8B y puede heredar sus sesgos y sus puntos ciegos, ademas de no haber pasado por un ajuste de preferencias (RLHF o DPO) segun la informacion disponible.
- Arquitectura no estandar: al combinar MLA y Gated DeltaNet con un patron de capas irregular, el soporte en herramientas de inferencia y cuantizacion generica no esta garantizado. Hay que validar el motor antes de comprometerse.
- Precision y almacenamiento: el repositorio pesa 9,1 GB por almacenar los pesos en float32, pese a que el modelo tiene solo 2,28B parametros. La carga debe hacerse en bfloat16 para no duplicar el consumo de memoria.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, publicado el 11 de septiembre de 2026. No hay informes independientes de calidad, estabilidad ni reproducibilidad.
- Descontaminacion declarada por el autor: AMD indica que aplico descontaminacion frente a las suites de evaluacion, pero no hay verificacion externa de ese proceso.
- Configuracion duplicada: `config.json` corresponde al modelo base y `hybrid_config.json` a la arquitectura real. Cargar el modelo ignorando el segundo archivo puede dar lugar a un comportamiento incorrecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/HyLo-Qwen-7MLA21GDN-8K-SFT
- Articulo principal (referenciado en la model card): https://arxiv.org/abs/2604.24715
- Referencia arXiv en etiquetas: https://arxiv.org/abs/2505.17272
- Referencia arXiv en etiquetas: https://arxiv.org/abs/2503.11132
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de SFT: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset de matematicas: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset de razonamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset de matematicas y razonamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de QA de contexto largo: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data

La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo: los resultados se limitan a paginas corporativas generales de AMD sin informacion sobre el checkpoint, el articulo o el repositorio de codigo.
