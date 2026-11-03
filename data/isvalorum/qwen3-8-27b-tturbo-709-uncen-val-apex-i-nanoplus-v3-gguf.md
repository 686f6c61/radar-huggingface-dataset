# IsValorum/Qwen3.8-27B-TTURBO-709-Uncen-VAL-APEX-I-NanoPlus-V3-GGUF

## Resumen

Qwen3.8-27B-TTURBO-709-Uncen-VAL-APEX-I-NanoPlus-V3-GGUF es una cuantizacion GGUF del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, un fine-tuning sin censura (uncensored) de la familia Qwen3.8 de 27B. La publica IsValorum dentro de su serie APEX Quantization, que aplica mapas de tipos por tensor auditados en lugar de cuantizaciones uniformes. El resultado es un unico fichero de 12,95 GB que comprime un modelo denso de 27.320.697.856 parametros hasta un tamano manejable en hardware de consumo, manteniendo en F32 los tensores sensibles de las capas SSM.

El modelo base es un hibrido denso de la arquitectura Qwen3.8: 64 capas, de las cuales 48 son SSM (State Space Model) y 16 son atencion completa, con una ventana de contexto declarada de 262.144 tokens. Incorpora ademas un bloque MTP (Multi-Token Prediction) de 15 tensores en `blk.64.*` para decodificacion especulativa, y un proyector de vision separado (`mmproj-BF16.gguf`) que habilita la entrada image-text-to-text.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion mixta con proteccion de tensores recurrentes; por otro, advierte de que se trata de un derivado de un fine-tuning sin censura, con benchmarks autoinformados por el autor del modelo base y sin validacion independiente de vision ni de MTP. La licencia declarada es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 27B densa hibrida: 64 capas (48 SSM + 16 atencion completa) + bloque MTP |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (declarada); ejemplo de uso con `-c 32768` |
| Tipos de cuantizacion | Mixta por tensor: Q3_K, Q4_0, Q4_1, Q4_K, Q5_K, Q8_0, IQ3_XXS, IQ4_XS, F32 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision en GGUF BF16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido con 64 capas: 48 capas SSM y 16 capas de atencion completa situadas en las posiciones 3, 7, ..., 63. El modelo base incluye un bloque MTP de 15 tensores (`blk.64.*`) integrado en el mismo GGUF, sin fichero draft separado, lo que permite decodificacion especulativa si la build de llama.cpp lo soporta. El proyector de vision consta de 333 tensores en un `mmproj-BF16.gguf` de 931.145.952 bytes.

La cuantizacion APEX-I NanoPlus V3 aplica una matriz iMatrix publica de mradermacher (319 x 512) que cubre 448 de los 450 tensores de texto cuantizados; `output.weight`, `token_embd.weight` y el bloque MTP quedan fuera de la matriz. Los tensores recurrentes (`ssm_alpha`, `ssm_a`, `ssm_dt.bias`, `ssm_conv1d`) y todas las RMSNorm se mantienen en F32 para evitar degradacion en las capas de estado. La capa 0 usa Q4_0 en `attn_gate`, `attn_qkv`, `ssm_beta` y `ssm_out`; las capas SSM restantes usan Q4_K/Q3_K/Q8_0 segun el tensor; las capas de atencion completa usan Q4_K en Q/K y Q5_K en V/output. Las FFN se reparten entre IQ4_XS (`ffn_down`) e IQ3_XXS (`ffn_gate`, `ffn_up`). No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni las etapas de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat DAU TTURBO embebida en el GGUF.
- Entrada multimodal image-text-to-text mediante el proyector `mmproj-BF16.gguf` (vision).
- Decodificacion especulativa mediante el bloque MTP incluido en el fichero principal.
- Contexto largo: ventana declarada de 262.144 tokens, con ejemplos de despliegue a 32.768 tokens.
- Fine-tuning sin censura: el modelo base ha sido modificado para reducir rechazos, segun la nomenclatura "Uncensored" del autor.
- Compatible con endpoints de llama.cpp (`llama-server`) y con la API compatible de OpenAI via `--jinja`.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos largos en local: con 262.144 tokens de contexto declarados, el modelo puede ingerir contratos, informes o bases de codigo extensas en una sola pasada, aunque en la practica conviene limitar a 32.768 tokens por coste de memoria KV.
- Analisis de imagenes en escritorio: cargando `mmproj-BF16.gguf` con `llama-server`, se pueden enviar capturas, diagramas o fotografias para descripcion y extraccion de texto, todo en hardware propio.
- Experimentacion con decodificacion especulativa: el bloque MTP integrado permite probar tecnicas de aceleracion en llama.cpp sin gestionar un modelo draft separado, util para investigacion de latencia.
- Generacion creativa sin filtros: el caracter uncensored del modelo base lo hace adecuado para escritura de ficcion, guiones o roleplay donde los modelos alineados rechazan contenido, siempre con revision humana.
- Evaluacion de tecnicas de cuantizacion: el mapa de tensores auditado (`tensor-map.tsv`) y la proteccion F32 de los tensores SSM lo convierten en un caso de estudio para medir el impacto de la cuantizacion mixta en arquitecturas hibridas.
- Despliegue en estaciones de trabajo con una sola GPU: con 12,95 GB de pesos, cabe en GPUs de 16 GB o 24 GB y permite servir un asistente conversacional bilingue en ingles y chino sin infraestructura cloud.
- Prototipado de asistentes bilingues en/zh: el soporte declarado de ambos idiomas permite construir demos de atencion al cliente o traduccion asistida en entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los benchmarks del modelo base son autoinformados por DavidAU y que vision y MTP no fueron validados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13 GB solo para pesos; con contexto de 32.768 tokens y cache KV en F16 hay que sumar varios GB adicionales, por lo que conviene prever 16-24 GB en total.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB) con contexto reducido, A100 40/80 GB y H100 para contextos largos y serving concurrente.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080 y RTX 3090 con contexto moderado; en GPUs de 12 GB solo con contexto muy corto o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad GGUF, frontends como Ollama o LM Studio que acepten el fichero y el `--jinja`. vLLM y TGI no soportan GGUF de forma nativa para esta arquitectura.
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion especulativa via MTP puede reducir la latencia por token, pero depende de la build de llama.cpp y de la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (NanoPlus V3) | 27,3 B densos | 262.144 | GGUF 12,95 GB | Apache-2.0 | Cuantizacion mixta auditada, vision + MTP |
| Qwen3.8-27B-TTURBO-709-Uncen MiniPlus V3 | 27,3 B densos | 262.144 | GGUF | Apache-2.0 | Misma familia, tier MiniPlus del mismo autor |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | 27,3 B densos | 262.144 | safetensors/GGUF | Apache-2.0 | Modelo base sin cuantizar de origen |
| Qwen3.8-27B original (familia Qwen) | 27 B densos | no disponible | safetensors | no disponible | Modelo upstream de referencia |

## Limitaciones y advertencias

- Modelo sin censura: el fine-tuning "Uncensored" reduce los rechazos y puede generar contenido sensible, ofensivo o inseguro; requiere moderacion externa en produccion.
- Riesgo de alucinacion: al ser un fine-tuning sobre un modelo de 27B, la tasa de alucinacion puede ser superior a la de modelos mayores o mas alineados; no hay benchmarks que lo cuantifiquen.
- Benchmarks no verificados: los datos del modelo base son autoinformados por DavidAU y no han sido replicados de forma independiente.
- Vision y MTP sin validar: la model card reconoce que ni la vision ni el bloque MTP fueron validados de forma independiente; su funcionamiento depende de la build de llama.cpp.
- Idiomas limitados: solo se declaran en y zh; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto declarado vs. practico: los 262.144 tokens son la ventana teorica; el ejemplo del autor usa 32.768 tokens, y contextos mayores disparan el consumo de VRAM por cache KV.
- Licencia Apache-2.0 heredada: permite uso comercial, pero el autor del modelo base y el cuantizador no ofrecen garantias; conviene revisar la licencia del modelo upstream Qwen3.8.
- Cuantizacion agresiva en FFN: el uso de IQ3_XXS en `ffn_gate` y `ffn_up` puede degradar la calidad frente al BF16 original, especialmente en tareas de razonamiento.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/IsValorum/Qwen3.8-27B-TTURBO-709-Uncen-VAL-APEX-I-NanoPlus-V3-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Tier MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-TTURBO-709-Uncen-VAL-APEX-I-MiniPlus-V3-GGUF
- Proyector de vision: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF/blob/main/mmproj-BF16.gguf
- Plantilla de chat: https://huggingface.co/IsValorum/Qwen3.8-27B-TTURBO-709-Uncen-BF16-GGUF/blob/main/chat_template.jinja
- Coleccion MiniPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-miniplus-standard-27b-6acfec54ca4ce4cf5cd5bdb6
- Coleccion NanoPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-standard-27b-6acfec55c1c99e2a23ebbd9b
- Apoyo al autor: https://ko-fi.com/isvalorum
