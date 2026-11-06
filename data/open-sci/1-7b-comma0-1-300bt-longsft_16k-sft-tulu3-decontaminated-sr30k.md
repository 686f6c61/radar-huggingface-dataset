# open-sci/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated-sr30k

## Resumen

El modelo `open-sci/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated-sr30k` es un ajuste fino supervisado (SFT) de un modelo base de 1.714 millones de parametros denominado `ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated`, publicado por el usuario open-sci en Hugging Face. Se trata de un derivado de la familia Comma, un modelo de 1.7B de parametros con contexto extendido a 16.000 tokens y un entrenamiento previo sobre 300.000 millones de tokens, seguido de un SFT sobre el dataset Tulu3 decontaminado.

El ajuste publicado entrena el modelo base sobre el dataset `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf`, un conjunto de 30.000 muestras de razonamiento generadas a partir de gpt-oss-120b en formato ShareGPT, con el objetivo de reforzar las capacidades de razonamiento del modelo pequeno mediante destilacion de un modelo mayor. El resultado es un modelo de 1.7B de parametros orientado a generacion de texto y razonamiento, con contexto de hasta 16.000 tokens, entrenado con llama-factory en 32 GPUs durante 5 epocas.

El modelo resulta relevante para desarrolladores e investigadores que necesitan un modelo pequeno (1.7B) desplegable en hardware modesto, con contexto medio-largo y capacidades de razonamiento mejoradas mediante destilacion. No obstante, la informacion publicada por el autor es muy escasa: la model card esta generada automaticamente y no incluye descripcion, usos previstos ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Comma, derivada de Llama; detalles no disponibles) |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.000 tokens (segun nombre del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no estandar; consultar terminos del autor) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1.7B de parametros, derivado de la familia Comma (etiquetada como `custom_code` en los tags del repo, lo que indica que requiere codigo personalizado para cargarse con transformers). El modelo base fue preentrenado sobre 300.000 millones de tokens y posteriormente sometido a un SFT de contexto largo (16.000 tokens) sobre el dataset Tulu3 decontaminado, segun se desprende del nombre del checkpoint base. No se dispone de informacion detallada sobre la composicion del dataset de preentrenamiento, la tokenizacion ni innovaciones arquitectonicas especificas (atencion lineal, decodificacion especulativa, etc.).

El ajuste fino publicado se realizo con llama-factory en modo `full` (todos los parametros), sobre el dataset `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf` (30.000 muestras en formato ShareGPT generadas a partir de gpt-oss-120b). Los hiperparametros fueron: learning rate 4e-5, batch total 128 (batch 1 por dispositivo, 32 dispositivos, acumulacion de gradientes 4), optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con warmup del 10%, 5 epocas y semilla 42. El entrenamiento se ejecuto con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta el uso de RLHF, DPO ni otras tecnicas de alineacion posteriores al SFT.

## Capacidades

- Generacion de texto autoregresiva en el pipeline `feature-extraction` (segun la configuracion del repo, aunque el modelo es un modelo de lenguaje causal).
- Razonamiento: el ajuste sobre `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf` busca transferir capacidades de razonamiento desde gpt-oss-120b al modelo pequeno.
- Contexto extendido: ventana de 16.000 tokens heredada del modelo base, adecuada para documentos medios y conversaciones multi-turno.
- Capacidades multilingues: no documentadas; no disponibles.
- Tool calling / function calling: no documentado por el autor.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el dataset de entrenamiento orientado a razonamiento sugiere cierta capacidad en este sentido.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Destilacion de razonamiento en produccion: el modelo puede emplearse como sustituto ligero de modelos grandes en tareas de razonamiento de dominio acotado, aprovechando que fue entrenado sobre trazas generadas por gpt-oss-120b y cabe en una sola GPU consumer.
- Generacion de codigo asistida: con 1.7B de parametros y contexto de 16.000 tokens, puede integrarse en editores o pipelines de CI/CD para autocompletado y generacion de tests, aunque su rendimiento en codigo no esta documentado y debe validarse.
- Procesamiento de documentos de longitud media: la ventana de 16.000 tokens permite resumir articulos, informes o contratos de hasta aproximadamente 12.000-14.000 palabras, dejando margen para el prompt y la respuesta.
- Chatbot de atencion al cliente: adecuado para conversaciones multi-turno con historial largo gracias al contexto de 16k, desplegable en infraestructura modesta (una GPU de 16-24 GB en fp16 o menor en cuantizacion de 8 bits).
- Extraccion de informacion estructurada: para convertir texto libre en JSON o formularios, siempre que se validen las salidas por el riesgo de alucinacion inherente a modelos de este tamano.
- Prototipado e investigacion: modelo de referencia para estudiar el efecto del SFT de razonamiento sobre un modelo base de 1.7B, con hiperparametros y framework documentados.
- Fine-tuning adicional: al ser un checkpoint completo en safetensors, sirve como punto de partida para ajustes especificos de dominio con LoRA o QLoRA en hardware consumer.

## Benchmarks y rendimiento

El model-index del autor declara una unica entrada de evaluacion (`sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__1-7b-Comma0-b66d70fa__sdpa-op-b45db733`) con una lista de resultados vacia. No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Resto de benchmarks | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 6-8 GB con contexto de 16k.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,7-2 GB de pesos, con un total practico de 4-5 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,9-1 GB de pesos, con un total practico de 2-3 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 8 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) para fp16; GPUs de datacenter (A100, H100) solo necesarias para entrenamiento o alto throughput.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas en fp16 y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por el tag `custom_code`), vLLM y TGI si la arquitectura Comma esta soportada; llama.cpp y Ollama requeririan conversion a GGUF, no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/1.7b-Comma0.1-...-sr30k | 1,7B | 16k | other | Hugging Face (16 descargas) | Ficha actual; sin benchmarks publicados |
| ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated | 1,7B | 16k | no disponible | Hugging Face | Modelo base del ajuste |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | Hugging Face | Alternativa con licencia permisiva y benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,2B | 128k | Llama 3.2 Community License | Hugging Face | Alternativa con contexto muy superior y ecosistema amplio |

La comparacion con Qwen2.5-1.5B-Instruct y Llama-3.2-1B-Instruct es orientativa por tamano y categoria; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Model card generada automaticamente: no incluye descripcion, usos previstos, limitaciones ni datos de evaluacion; el autor no ha completado la documentacion.
- Sin benchmarks publicados: no es posible verificar empiricamente las capacidades de razonamiento atribuidas al ajuste.
- Riesgo de alucinacion: inherente a modelos de 1.7B, especialmente en tareas de razonamiento complejo y contextos largos; requiere validacion en produccion.
- Sesgos: no documentados; el dataset de entrenamiento (generado por gpt-oss-120b) puede transferir sesgos del modelo profesor.
- Idiomas: no se especifican los idiomas soportados; el modelo base fue entrenado presumiblemente en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Licencia `other`: no es una licencia estandar; es imprescindible revisar los terminos del autor antes de cualquier uso comercial.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del repositorio y anade riesgo de seguridad.
- Contexto de 16k: inferior al de alternativas contemporaneas (32k-128k), lo que limita tareas de documento muy largo.
- Madurez: solo 16 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento activo.
- Fecha de creacion declarada en 2026-10-30, posterior a la fecha de consulta habitual; verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated
- Dataset de entrenamiento (referenciado en la model card): `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf` (no se proporciona URL publica)
- Llama-factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Transformers: https://github.com/huggingface/transformers
- Paper o blog del modelo: no disponible
- Demo: no disponible
