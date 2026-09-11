# amd/HyLo-Qwen-14MLA14M2-64K-SFT

## Resumen

HyLo-Qwen-14MLA14M2-64K-SFT es un checkpoint experimental publicado por AMD que convierte (upcycling) el transformer denso Qwen/Qwen3-1.7B en una arquitectura híbrida de 28 capas: 14 capas de Multi-head Latent Attention (MLA) y 14 capas Mamba-2 de espacio de estados. En lugar de entrenar un modelo híbrido desde cero, el método HyLo reutiliza los pesos preentrenados y sustituye parte de las capas de atención por bloques lineales con estado recurrente de tamano fijo, de modo que esas capas no mantienen cache KV. El resultado es un modelo de 2.065.541.280 parametros (2,07B) que conserva una fraccion del rendimiento del modelo original con solo el 7,8 % de su cache KV.

El checkpoint se ha entrenado especificamente para contexto largo: la ventana soportada es de 65.536 tokens (64K), obtenida escalando posiciones con YaRN (factor 2.0 sobre 32.768 tokens) y afinando mediante SFT con destilacion del profesor Qwen/Qwen3-8B, que actua como modelo docente en la segunda fase de entrenamiento. El contexto declarado en el `config.json` (40.960) es un residuo del modelo base y no debe usarse como longitud de servicio.

Su relevancia es doble. Por un lado, es un caso practico de destilacion y compresion de cache KV aplicada a un modelo pequeno, lo que reduce drasticamente el coste de servir contextos de decenas de miles de tokens. Por otro, la licencia es estrictamente de investigacion (`amd-hybrid-models-research-only-rail-ms`), por lo que no puede emplearse en produccion comercial, y el entrenamiento se apoya en un dataset con licencia no comercial (nvidia/ChatQA2-Long-SFT-data).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: transformer con 14 capas MLA + 14 capas Mamba-2 (SSM); sin patron repetitivo, colocadas por indice |
| Parametros totales | 2.065.541.280 (2,07B; el paper indica 2,1B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 65.536 tokens (entrenado y evaluado); YaRN factor 2.0 sobre ventana original de 32.768 |
| Tipos de cuantizacion | no publicados; pesos distribuidos en float32 (repo de 8,3 GB), recomendado cargar en bfloat16 |
| Idiomas soportados | ingles (en) |
| Licencia | amd-hybrid-models-research-only-rail-ms (solo investigacion); el frontmatter tambien declara apache-2.0 con license_name research-only |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-1.7B |
| Profesor de destilacion | Qwen/Qwen3-8B |
| Capas | 28 (14 MLA en indices pares, 14 Mamba-2 en indices impares) |
| Cache KV | 7,8 % de la del modelo base |
| Precision del checkpoint | float32 (cargar en bfloat16) |
| Dimensiones MLA | kv_lora_rank 256, q_lora_rank 1344, qk_rope_head_dim 64, qk_nope_head_dim 64, v_head_dim 128, 16 cabezas |
| Dimensiones Mamba-2 | d_state 128, ngroups 16, expand 1, d_inner 2048, d_xb 1024 |
| Configuracion | la disposicion hibrida esta en `hybrid_config.json`; `config.json` es el del modelo base y se conserva como referencia |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de publicacion | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-1.7B y sustituye selectivamente sus capas de atencion. Las 14 capas MLA se colocan donde el modelo base es mas sensible a perder atencion completa (indices 0, 2, 4, ..., 26) y cachean un latente de bajo rango en lugar de claves y valores completos, con rango de latente KV de 256 y rango de latente de query de 1344. Las otras 14 capas (indices impares) son bloques Mamba-2 de espacio de estados, con estado recurrente de tamano fijo (d_state 128, 16 grupos, expand 1, d_inner 2048), que no contribuyen en absoluto a la cache KV. La combinacion de ambas decisiones es lo que reduce la cache total al 7,8 % del modelo base.

El entrenamiento se divide en dos etapas. La primera, Enhanced-ILD, aplica destilacion capa a capa a 2.048 tokens de contexto con learning rate 2e-4 sobre el 20 % de la mezcla de SFT, para alinear los bloques MLA y Mamba-2 recien inicializados con las representaciones internas del modelo base. La segunda es un SFT de contexto largo a 65.536 tokens con learning rate 6e-5 sobre la mezcla completa, con destilacion guiada por el profesor Qwen3-8B. La funcion de perdida es divergencia KL entre las distribuciones del siguiente token de alumno y profesor (kl_weight 1.0, ce_weight 0.0), con batch global de 8 secuencias, 1 epoca, scheduler coseno y warmup del 1 %. Se uso precision mixta bfloat16, kernel KL fusionado para no materializar el tensor completo de logits, y 8 aceleradores AMD Instinct MI300X con FSDP.

Los datos de SFT son versiones procesadas por AMD de JunxiongWang/sftdatasetv3, nvidia/OpenMathInstruct-2, open-thoughts/OpenThoughts-114k, open-r1/OpenR1-Math-220k y nvidia/ChatQA2-Long-SFT-data, con subsetting, reformateo a la plantilla de chat y descontaminacion contra las suites de evaluacion. La composicion mezcla instrucciones generales, matematicas y razonamiento, y QA sobre contextos largos.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat (tag `conversational`).
- Razonamiento y matematicas: el SFT incluye OpenMathInstruct-2, OpenR1-Math-220k y OpenThoughts-114k, orientados a problemas matematicos y cadenas de razonamiento.
- Procesamiento de contexto largo hasta 65.536 tokens, con atencion completa en las capas MLA y estado recurrente en las Mamba-2.
- Inferencia con cache KV muy reducida (7,8 % del modelo base), lo que permite servir contextos largos con mucho menos memoria.
- Question answering sobre documentos extensos, dado el uso de ChatQA2-Long-SFT-data en el entrenamiento.
- Razonamiento de sentido comun basico, medido en ARC, HellaSwag, PIQA, OpenBookQA, RACE y WinoGrande.
- Soporte de tool calling / function calling: no documentado en la informacion disponible; el modelo base Qwen3 si lo soporta, pero no se confirma para este checkpoint.
- Modo de pensamiento explicito (thinking mode): no documentado para este checkpoint.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingues: no disponibles; solo se declara ingles.

## Casos de uso

- Analisis de documentos largos: contratos, informes financieros o expedientes de hasta 64K tokens pueden procesarse en una sola pasada sin trocear el texto, aprovechando la ventana entrenada.
- Atencion al cliente multi-turno: la ventana de 64K permite mantener historiales largos de conversacion y documentos de referencia en el mismo contexto, y la cache KV reducida abarata el coste por sesion concurrente.
- Resumen y extraccion sobre corpus extensos: resumen por secciones, extraccion de entidades o clasificacion de documentos largos en pipelines por lotes, dado que el modelo es pequeno (2,07B) y se puede ejecutar con lotes grandes.
- Despliegue en hardware modesto o on-premise: con aproximadamente 4,1 GB en bfloat16, cabe en GPUs de consumo de 8 GB o mas, lo que permite entornos con requisitos de privacidad que no pueden usar APIs externas.
- Servicio de alta concurrencia: al reducir la cache KV al 7,8 %, se pueden mantener muchas secuencias simultaneas por GPU en comparacion con un transformer denso equivalente, util para chat o procesamiento masivo.
- Tutoria y verificacion matematica: generacion de soluciones paso a paso para problemas de nivel escolar o universitario, apoyandose en el entrenamiento con OpenMathInstruct-2 y OpenR1-Math-220k.
- Investigacion en arquitecturas hibridas: punto de partida reproducible para estudiar upcycling, destilacion con profesor y compromisos entre atencion MLA y bloques de espacio de estados.
- Evaluacion comparativa de estrategias de cache KV: al ser un modelo de 2,07B con contexto de 64K, sirve como banco de pruebas de tecnicas de compresion y de stacks de servicio con ventanas largas.

## Benchmarks y rendimiento

Resultados de razonamiento de sentido comun declarados por el autor (0-shot, EleutherAI lm-evaluation-harness, Tabla 4 del paper, backbone Qwen3-1.7B):

| Tarea | HyLo-Qwen-14MLA14M2-64K-SFT |
|---|---:|
| ARC-Challenge | 45,4 |
| ARC-Easy | 73,3 |
| HellaSwag | 61,1 |
| OpenBookQA | 37,8 |
| PIQA | 73,7 |
| RACE | 36,6 |
| WinoGrande | 61,8 |
| Media | 55,7 |

La model card anuncia una evaluacion de contexto largo con RULER (13 tareas a 8K, 16K, 32K y 64K), pero los valores numericos no estan disponibles en la informacion proporcionada. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, y el `model-index` del repositorio esta vacio.

## Requisitos de hardware

- Pesos en float32 (formato distribuido en el repo): aproximadamente 8,3 GB, que coincide con el tamano declarado del repositorio.
- Pesos en bfloat16 (precision recomendada de carga): aproximadamente 4,1 GB, estimado a partir de los 2,07B de parametros.
- Cuantizacion a int8: aproximadamente 2,1 GB estimados; a int4: aproximadamente 1,1 GB estimados. No hay cuantizaciones oficiales publicadas, por lo que estos valores son calculos teoricos.
- Cache KV: 7,8 % de la del modelo base; las 14 capas Mamba-2 no generan cache. El consumo de memoria a 64K tokens sera considerablemente menor que el de un transformer denso equivalente, aunque no se publica una cifra absoluta.
- GPU de consumo: cabe en tarjetas con 8 GB o mas en bfloat16 (por ejemplo RTX 3070/4060 Ti y superiores); una RTX 4090 de 24 GB permite margen amplio para cache y lotes grandes.
- GPU de datacenter: A100, H100 o MI300X son suficientes y sobredimensionadas para los pesos; se usaron 8x AMD Instinct MI300X con FSDP solo durante el entrenamiento.
- Opciones de despliegue: no se documentan en la informacion disponible. La model card menciona de forma generica los stacks de servicio que dimensionan la cache KV a partir de `max_position_embeddings` y recomienda fijar explicitamente el limite (por ejemplo `--max-model-len 65536`). La compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada y no se publican pesos GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto soportado | Cache KV relativa | Licencia | Benchmarks |
|---|---|---|---|---|---|
| HyLo-Qwen-14MLA14M2-64K-SFT | 2,07B | 65.536 tokens | 7,8 % del base | amd-hybrid-models-research-only-rail-ms (solo investigacion) | Media 55,7 en sentido comun (0-shot) |
| Qwen/Qwen3-1.7B (modelo base) | 1,7B | no disponible; la model card menciona una ventana original de 32.768 tokens | 100 % | Apache-2.0 | no disponible |
| Qwen/Qwen3-8B (profesor de destilacion) | 8B | no disponible | no disponible | Apache-2.0 | no disponible |

No se dispone de resultados de benchmarks de los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, cache KV y licencia. La diferencia estructural clave es que tanto el modelo base como el profesor son transformers densos con atencion completa, mientras que este checkpoint sustituye la mitad de sus capas por bloques Mamba-2 sin cache.

## Limitaciones y advertencias

- Licencia de solo investigacion (`amd-hybrid-models-research-only-rail-ms`): no esta permitido el uso comercial. El frontmatter del README tambien declara `apache-2.0`, lo que genera ambiguedad; debe prevalecer la licencia RAIL de solo investigacion y conviene revisar el fichero LICENSE del repositorio antes de cualquier uso.
- Uno de los datasets de entrenamiento, nvidia/ChatQA2-Long-SFT-data, tiene licencia cc-by-nc-2.0, lo que refuerza la restriccion de uso no comercial.
- Modelo exclusivamente en ingles; no se declaran capacidades multilingues.
- No debe servirse por encima de 65.536 tokens: el `max_position_embeddings` del `config.json` (40.960) es un valor heredado del modelo base y los stacks de servicio que dimensionan la cache a partir de ese campo pueden quedar mal configurados. Hay que fijar la longitud maxima explicitamente.
- No se publican resultados de RULER ni de otras tareas de contexto largo en la informacion disponible, por lo que el rendimiento real mas alla de 32K no esta verificado con datos accesibles.
- Tamano reducido (2,07B): mayor propension a errores factuales, alucinaciones y perdida de coherencia en tareas de conocimiento extenso en comparacion con modelos mayores.
- Al ser un checkpoint afinado por destilacion, puede heredar sesgos y errores del profesor Qwen3-8B y de los datasets de SFT utilizados.
- El checkpoint se distribuye en float32 (8,3 GB en disco); es necesario convertirlo o cargarlo en bfloat16 para un despliegue eficiente, y no hay recetas de cuantizacion publicadas.
- Sin adopcion ni validacion externas: 0 descargas y 0 likes en el momento de la consulta, y una unica publicacion asociada (arXiv:2604.24715).
- Las capacidades de tool calling, agentes y modo de pensamiento no estan documentadas para este checkpoint concreto, a diferencia del modelo base Qwen3.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/HyLo-Qwen-14MLA14M2-64K-SFT
- Paper principal (Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling): https://arxiv.org/abs/2604.24715
- Referencia adicional: https://arxiv.org/abs/2505.17272
- Referencia adicional: https://arxiv.org/abs/2503.11132
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de destilacion Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset JunxiongWang/sftdatasetv3: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset open-thoughts/OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset nvidia/ChatQA2-Long-SFT-data: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data
- Licencia (fichero LICENSE del repositorio): https://huggingface.co/amd/HyLo-Qwen-14MLA14M2-64K-SFT/blob/main/LICENSE
