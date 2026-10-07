# inference-optimization/DeepSeek-V3-0.86B-MTP-PR3225-FP8-Dynamic

## Resumen

DeepSeek-V3-0.86B-MTP-PR3225-FP8-Dynamic es un checkpoint de pruebas creado por el usuario inference-optimization para validar la ruta de cuantizacion FP8_DYNAMIC del PR #3225 de LLM Compressor. No es un modelo de lenguaje de produccion: segun su propia model card, el backbone se inicializo de forma aleatoria y solo se entreno sobre un corpus de texto de juguete del flujo de trabajo "tiny-model" del repositorio de LLM Compressor, sin reutilizar pesos preentrenados de DeepSeek.

La arquitectura reproduce la topologia DeepSeek-V3 (`DeepseekV3ForCausalLM`, Mixture of Experts con atencion latente) pero con dimensiones reducidas: 61 capas, hidden size 768, 8 expertos enrutados y 4 activos por token. El checkpoint totaliza 860.931.032 parametros segun los safetensors publicados (0,861B), de los cuales 849.041.408 corresponden al backbone y 11.889.152 al modulo MTP (Multi-Token Prediction) anadido como fixture sintetico.

Su relevancia es exclusivamente de ingenieria: sirve como caso de prueba reproducible para verificar la carga en dos GPUs, la cuantizacion FP8_DYNAMIC, el guardado fragmentado y la generacion con vLLM, ademas de documentar la integridad de recarga del backbone en BF16 (perplejidad de juguete 1,768900). Cualquier uso como modelo conversacional real carece de sentido tecnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only MoE con atencion latente (MLP-MoE), clase `DeepseekV3ForCausalLM`; 61 capas |
| Parametros totales | 860.931.032 segun safetensors (860.930.560 segun la model card: 849.041.408 de backbone + 11.889.152 de MTP) |
| Parametros activos | 643.782.656 estimados en el backbone (estimacion de enrutamiento que incluye embeddings y componentes densos, excluye MTP; no es una medicion FLOP) |
| Longitud de contexto | no disponible (el `config.json` es la fuente autoritativa y no se publica el valor en la informacion disponible) |
| Tipos de cuantizacion | FP8_DYNAMIC mediante compressed-tensors, con exclusiones conservadas en su dtype de origen; el modelo base no cuantizado esta en BF16 |
| Idiomas soportados | no disponible |
| Licencia | deepseek (`license: other`, `license_name: deepseek`), enlazada al LICENSE-MODEL de deepseek-ai/DeepSeek-V3-Base |
| Formato de pesos | safetensors (3 shards indexados, 4.197 tensores indexados); se incluyen los activos del tokenizer |
| Hidden size | 768 |
| Intermediate size | 3072 |
| MoE intermediate size | 384 |
| Expertos enrutados | 8 (4 por token) |
| Cabezas de atencion / KV | 8 / 8 |
| q_lora_rank / kv_lora_rank | 512 / 256 |
| Tamano del repositorio | 1,1 GB |
| Libreria | transformers (con `custom_code`) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo replica el esqueleto de DeepSeek-V3-Base (revision `afb92e1fa402c2be2a9eb085312bb02e0384d6c7`) reduciendo sus dimensiones: de 7168 a 768 de hidden size, de 256 a 8 expertos enrutados, de 128 a 8 cabezas de atencion y de 2048 a 384 de `moe_intermediate_size`. La profundidad original de 61 capas se mantiene deliberadamente para que el indexado del checkpoint MTP coincida con el de upstream. El checkpoint se guarda con precision FP8_DYNAMIC de compressed-tensors, dejando ciertas capas excluidas en su dtype original.

El entrenamiento es de juguete: semilla aleatoria 3225, optimizador AdamW con learning rate 0,0004 y weight decay 0,01, batch size 2 y textos truncados a 160 tokens. El proceso se detuvo tras tres comprobaciones consecutivas con perplejidad de juguete menor o igual a 3. No se aplicaron tecnicas de alineacion tipo RLHF o DPO. El modulo MTP anade `11.889.152` parametros con proyecciones de inicializacion sintetica y pesos de decoder copiados de bloques ya entrenados del backbone; la model card indica explicitamente que el MTP no se entreno por separado, por lo que los artefactos no demuestran calidad de aceptacion de borradores ni aceleracion de inferencia.

La validacion reportada cubre carga en dos GPUs, cuantizacion FP8_DYNAMIC, guardado fragmentado y generacion con vLLM. En la prueba de decodificacion especulativa con MTP en FP8 se redactaron 60 tokens y se aceptaron 0, con una salida greedy identica a la generacion FP8 normal. El backbone BF16 recargado obtuvo una perplejidad de 1,768900 sobre el mismo corpus de entrenamiento, lo que verifica integridad de aprendizaje y recarga, no generalizacion.

## Capacidades

- Generacion de texto autoregresiva basica, tal como se demuestra en el ejemplo de carga de la model card con `AutoModelForCausalLM`.
- Inferencia cuantizada en FP8_DYNAMIC sobre el backend vLLM 0.30.0 (comprobacion de humo superada).
- Carga con Transformers 5.17.0, Torch 2.14.0+cu130, LLM Compressor (`2d52420`) y compressed-tensors (`e69c8dc`).
- Modulo MTP opcional para experimentacion con decodificacion especulativa; no se ejecuta en la generacion estandar del backbone con Transformers.
- Soporte declarado de etiquetas `conversational`, `text-generation-inference` y `endpoints_compatible` en el repositorio.
- No hay evidencia de capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, agentes ni multilingues: el modelo no se entreno para ello y su corpus es de juguete.
- No se declaran idiomas soportados.

## Casos de uso

- Validacion de la ruta de cuantizacion FP8_DYNAMIC en LLM Compressor: se usa como fixture para comprobar que el pipeline del PR #3225 produce checkpoints cargables con 3 shards y 4.197 tensores indexados.
- Pruebas de integracion en vLLM: permite verificar carga y generacion de un checkpoint FP8_DYNAMIC con arquitectura DeepSeek-V3 antes de aplicar el flujo a modelos de mayor tamano.
- Pruebas de humo de guardado fragmentado: el repositorio sirve para reproducir el guardado indexado y comparar hashes de ficheros con `artifact-manifest.json`.
- Validacion cruzada de versiones de Transformers: la model card documenta fallos de carga de MTP en 5.15.0 y el exito en 5.17.0, por lo que el fixture es util en matrices de compatibilidad de versiones.
- Pruebas de decodificacion especulativa con MTP: el modelo permite ejercitar la ruta de draft/aceptacion de tokens y comprobar el comportamiento observado de 0 tokens aceptados.
- Regresion de codigo de carga personalizado: al requerir `custom_code`, sirve para comprobar que `trust_remote_code` y las clases `DeepseekV3ForCausalLM` siguen funcionando en integraciones de terceros.
- Benchmarking interno de memoria: con 0,86B parametros permite medir ocupacion de VRAM y latencia de arranque en pipelines de cuantizacion sin consumir recursos de un modelo grande.
- Docencia y demostraciones: util para explicar la estructura de un checkpoint MoE con MTP y atencion latente en un tamano manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perplejidad de juguete del backbone BF16 recargado (1,768900) sobre el mismo corpus de entrenamiento, que no constituye una evaluacion de generalizacion. La prueba de MTP registro 60 tokens redactados y 0 aceptados, dato que la propia model card califica como comprobacion de ejecucion y no como medicion de aceleracion.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,9 GB en FP8 y cerca de 1,7 GB en BF16 para los pesos; hay que sumar el overhead de activaciones, cache KV y runtime. El repositorio ocupa 1,1 GB en disco.
- GPU recomendadas: no se especifican en la informacion disponible. La validacion se hizo en dos GPUs, sin detallar el modelo.
- Compatibilidad con GPU de consumo: cabe previsiblemente en cualquier GPU consumer con mas de 2-4 GB de VRAM (por ejemplo, RTX 3060 en adelante), aunque no hay confirmacion oficial en la model card.
- Aceleracion FP8 nativa: requiere hardware con soporte FP8 (generaciones Hopper o Ada y posteriores) para aprovecharla; en otras GPUs el runtime tendria que desempaquetar los pesos. Este punto es una consideracion general, no un dato declarado por el autor.
- Opciones de despliegue: Transformers 5.17.0 con compressed-tensors (probado), vLLM 0.30.0 (comprobacion de humo superada) y text-generation-inference segun las etiquetas del repositorio. No se publican pesos GGUF, por lo que llama.cpp u Ollama no estan soportados con los artefactos actuales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio es un fixture de test y no compite con modelos de produccion de su categoria. Como referencia de procedencia se pueden comparar los tres artefactos de la misma familia:

| Modelo | Parametros | Contexto | Formato/precision | Proposito | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V3-0.86B-MTP-PR3225-FP8-Dynamic (este) | 860.931.032 (643.782.656 activos estimados) | no disponible | safetensors FP8_DYNAMIC | Fixture de cuantizacion y carga | deepseek (other) |
| inference-optimization/DeepSeek-V3-0.86B-MTP-PR3225 (base) | 860.930.560 segun la model card | no disponible | safetensors BF16 | Checkpoint de juguete previo a la cuantizacion | deepseek (other) |
| deepseek-ai/DeepSeek-V3-Base | Arquitectura original: 61 capas, hidden 7168, 256 expertos | no disponible en la informacion proporcionada | safetensors | Modelo base real de DeepSeek | deepseek |

## Limitaciones y advertencias

- No es un modelo de produccion: el backbone se inicializo aleatoriamente y se entreno sobre un corpus de texto de juguete. No debe usarse en aplicaciones reales ni evaluarse como LLM generalista.
- El modulo MTP no se entreno de forma separada; sus proyecciones son inicializaciones sinteticas, por lo que no hay evidencia de calidad de borrador ni de aceleracion.
- En la prueba de decodificacion especulativa FP8 se aceptaron 0 de 60 tokens redactados.
- La perplejidad de 1,768900 se midio sobre el mismo corpus de entrenamiento; no indica generalizacion ni calidad.
- Riesgo de alucinacion: total y estructural, ya que el modelo no ha aprendido conocimiento factual alguno.
- Idiomas soportados: no declarados, lo que impide garantizar un comportamiento multilingue correcto.
- Limitaciones de contexto: la longitud de contexto no se publica; el `config.json` guardado es la unica fuente autoritativa.
- Compatibilidad: la carga basada en modelo para MTP de GLM/DeepSeek fallo en Transformers 5.15.0; la version 5.16 no se probo. La cuantizacion del MTP dependiente de calibracion queda como trabajo pendiente.
- Licencia: `license: other` con `license_name: deepseek`. Se incluyen los ficheros de licencia de DeepSeek y hay que revisar las condiciones de uso de LICENSE-MODEL antes de cualquier redistribucion o uso comercial. La model card no detalla esas condiciones.
- Trazabilidad: los hashes de los ficheros del checkpoint estan en `artifact-manifest.json` y los resultados estructurados en `validation.json`; conviene consultarlos antes de reutilizar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/DeepSeek-V3-0.86B-MTP-PR3225-FP8-Dynamic
- Modelo base (checkpoint de juguete previo a la cuantizacion): https://huggingface.co/inference-optimization/DeepSeek-V3-0.86B-MTP-PR3225
- Arquitectura y tokenizer originales (DeepSeek-V3-Base, revision `afb92e1fa402c2be2a9eb085312bb02e0384d6c7`): https://huggingface.co/deepseek-ai/DeepSeek-V3-Base
- Licencia del modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V3-Base/blob/afb92e1fa402c2be2a9eb085312bb02e0384d6c7/LICENSE-MODEL
- Pull request de LLM Compressor #3225: https://github.com/vllm-project/llm-compressor/pull/3225
- Commit de LLM Compressor probado (`2d52420`): https://github.com/vllm-project/llm-compressor/commit/2d5242056a8a00028686a303771ffc8e2fe27d07
- Flujo de trabajo tiny-model del repositorio: https://github.com/vllm-project/llm-compressor/tree/2d5242056a8a00028686a303771ffc8e2fe27d07/.agents/skills/create-tiny-model
- Commit de compressed-tensors probado (`e69c8dc`): https://github.com/vllm-project/compressed-tensors/commit/e69c8dc58aa152e5f5e36e85800ec1d2e7de5271
- La busqueda web realizada no devolvio enlaces tecnicos relevantes: los resultados eran definiciones de diccionario del termino "inference" en frances, sin relacion con este modelo.
