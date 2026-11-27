# blearyhope/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es la distribucion en formato GGUF del modelo multimodal Inkling-2-Mini-Uncensored, una variante "abliterated" (sin capa de rechazo) del checkpoint base thinkingmachines/Inkling-2-Mini. Lo publica el usuario blearyhope en Hugging Face y esta pensado para su uso con llama.cpp, LM Studio, Ollama y KoboldCpp. El modelo combina entrada de imagen y texto (pipeline image-text-to-text) con una arquitectura Mixture of Experts (MoE) identificada como `inkling2_loop` en el soporte de llama.cpp.

El modelo resuelve el problema de desplegar localmente un modelo conversacional multimodal de gran tamano en hardware de consumo, ofreciendo cuantizaciones desde BF16 sin perdida (52,23 GB) hasta Q3_K_M (13,72 GB) que cabe en sistemas de 16 GB de VRAM o RAM. Su relevancia actual radica en que permite ejecutar un modelo de 26.070 millones de parametros con vision integrada en GPUs consumer, algo que no es posible con el checkpoint original en precision nativa NVFP4/MXFP8/BF16.

La caracteristica diferencial es la eliminacion deliberada del comportamiento de rechazo (uncensored/abliterated), lo que lo orienta a investigacion sobre alineamiento, mecanismos de refusal y edicion de modelos. Se distribuye bajo licencia Apache 2.0 y el autor advierte explicitamente de que no debe exponerse a usuarios finales sin salvaguardas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), soporte `inkling2_loop` en llama.cpp (PR #32704+) |
| Parametros totales | 26.070.385.152 (~26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M; vision `mmproj` en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, LM Studio, Ollama, KoboldCpp); safetensors en el repo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer Mixture of Experts identificado en llama.cpp como `inkling2_loop`. El checkpoint original almacena los expertos en precision mixta NVFP4 / MXFP8, y la conversion a GGUF BF16 descomprime todos los pesos de forma sin perdida (lossless), sin error de re-cuantizacion. Las cuantizaciones menores (Q8_0 a Q3_K_M) aplican cuantizacion estandar de llama.cpp sobre esa base. El modelo incluye un proyector de vision (`mmproj`) en F16 que habilita la entrada multimodal de imagen.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La variante "Uncensored" deriva de un proceso de abliteration sobre el modelo base thinkingmachines/Inkling-2-Mini, que elimina la direccion de rechazo en el espacio de activaciones. La model card menciona un "thinking mode" (compliance 98,5% think frente a 98,0% off) y soporte MTP en la version MLX, aunque no se detalla su implementacion.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito mediante modo "thinking" (mencionado en la model card).
- Comprension de imagenes gracias al proyector `mmproj` (image-text-to-text).
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Comportamiento sin rechazo (abliterated), orientado a investigacion sobre alineamiento.

## Casos de uso

- Investigacion sobre alineamiento y refusal: el modelo permite estudiar como se comporta un checkpoint con la direccion de rechazo eliminada frente al original, comparando respuestas en tareas sensibles en entornos controlados.
- Edicion de modelos y abliteration: sirve como referencia para validar tecnicas de edicion de pesos y activaciones, al disponer de la version original y la abliterated en el mismo formato.
- Despliegue local multimodal en GPU consumer: con Q4_K_M (17,48 GB) puede ejecutarse en una RTX 4090 o en un Mac con 24 GB de memoria unificada, procesando imagenes y texto en local sin conexion.
- Prototipado de asistentes conversacionales con vision: el par GGUF + mmproj permite construir demos de descripcion de imagenes o respuesta a preguntas visuales sobre hardware de 24 GB.
- Evaluacion de cuantizaciones: la disponibilidad de siete niveles (de BF16 a Q3_K_M) permite medir la degradacion de calidad y el impacto en latencia para un modelo MoE de 26 B.
- Analisis de contenido sin restricciones en entornos de investigacion: util para estudiar el comportamiento del modelo ante peticiones que el checkpoint original declinaria, siempre en un entorno aislado y con supervision.
- Integracion en pipelines de llama.cpp: al soportar la arquitectura `inkling2_loop` en mainline, puede integrarse en herramientas como LM Studio, Ollama o KoboldCpp para pruebas de inferencia reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de cumplimiento (compliance) del 98,0% en modo off y 98,5% en modo think, sin especificar el conjunto de evaluacion ni la metodologia.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: BF16 64 GB+, Q8_0 32 GB+, Q6_K 24-32 GB, Q5_K_M 24 GB, Q4_K_M 20-24 GB, IQ4_XS 16-24 GB, Q3_K_M 16 GB. El proyector de vision anade aproximadamente 1 GB.
- GPU recomendadas: A100 o H100 para BF16 y Q8_0; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; GPUs de 16 GB para Q3_K_M e IQ4_XS.
- Cabe en GPU consumer: si, desde una RTX 4090 con Q4_K_M hasta tarjetas de 16 GB con Q3_K_M. En Apple Silicon, la version MLX requiere 32 GB+ de memoria unificada.
- Opciones de despliegue: llama.cpp (build con soporte `inkling2_loop`, PR #32704+), LM Studio, Ollama, KoboldCpp, Unsloth; el repo safetensors base soporta vLLM, SGLang, Transformers y Dynamo; mlx-vlm para Apple Silicon.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-GGUF | ~26,07 B (MoE) | no disponible | Si (mmproj) | Apache 2.0 | GGUF, safetensors, MLX |
| thinkingmachines/Inkling-2-Mini (base) | ~26,07 B (MoE) | no disponible | Si | no disponible | safetensors (NVFP4/MXFP8/BF16) |
| blearyhope/Inkling-2-Mini-Uncensored (master) | ~26,07 B (MoE) | no disponible | Si | Apache 2.0 | safetensors |
| blearyhope/Inkling-2-Mini-Uncensored-MLX | ~26,07 B (MoE) | no disponible | Si | Apache 2.0 | MLX |

No se dispone de datos de rendimiento comparativo ni de modelos alternativos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo uncensored/abliterated: el comportamiento de rechazo se ha eliminado deliberadamente; respondera a peticiones que el checkpoint original declina, incluidas las daninas o sensibles.
- No incorpora capa de seguridad integrada; el autor exige responsabilidad total del despliegue y el cumplimiento legal, y desaconseja exponerlo a usuarios finales sin salvaguardas propias.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos generativos de este tamano.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la naturaleza uncensored puede entrar en conflicto con normativa de moderacion de contenidos en produccion.
- Requiere una build reciente de llama.cpp con soporte `inkling2_loop` (PR #32704+); versiones antiguas fallan al cargar o generan salida corrupta.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del funcionamiento de las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/blearyhope/Inkling-2-Mini-Uncensored-GGUF
- Modelo maestro: https://huggingface.co/blearyhope/Inkling-2-Mini-Uncensored
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Version MLX: https://huggingface.co/blearyhope/Inkling-2-Mini-Uncensored-MLX
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- PR de llama.cpp con soporte `inkling2_loop`: PR #32704 (referenciado en la model card, sin URL directa disponible)
