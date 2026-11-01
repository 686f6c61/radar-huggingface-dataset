# heliophage/Nanbeige4.3-33B-W4A16-GPTQ

## Resumen

Nanbeige4.3-33B-W4A16-GPTQ es una cuantizacion GPTQ del modelo Nanbeige4.3-33B, publicada por el usuario heliophage en formato compressed-tensors. El modelo base es un LLM de tipo Llama desarrollado por Nanbeige, orientado a razonamiento, uso de agentes y conversacion, con soporte para tool calling y modo de pensamiento (thinking). Esta version cuantizada reduce el peso en disco de 66,3 GB (BF16) a 24,2 GB, lo que permite servir el modelo en vLLM con tensor parallelism sobre dos GPUs de 24 GB.

La cuantizacion es mixta: las capas MLP intermedias (capas 1 a 50) se cuantizan a INT4 con activaciones BF16 (W4A16), mientras que las proyecciones de atencion y las MLP de la primera y ultima capa se mantienen en INT8 con activaciones BF16 (W8A16), porque el autor indica que el modelo es inusualmente sensible a la cuantizacion. Los embeddings, el lm_head y las normas permanecen en BF16.

Es relevante porque demuestra que un modelo de 33B puede desplegarse en hardware de consumo profesional (2x RTX 3090) manteniendo una fidelidad razonable frente al original en BF16, con soporte nativo de vLLM, decodificacion con kernels Marlin y parsers de razonamiento y tool calling compatibles con el formato Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (52 capas), segun tags del repo |
| Parametros totales | 7.356.038.872 (dato real de safetensors del checkpoint cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens configurados en el ejemplo de servicio (max-model-len) |
| Tipos de cuantizacion | GPTQ W4A16 (MLP capas 1-50) y W8A16 (atencion y MLP capas 0 y 51), grupo 128, simetrico; embeddings, lm_head y normas en BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors |

## Arquitectura y entrenamiento

El modelo base es un transformer tipo Llama con 52 capas, segun la tabla de tensores cuantizados de la model card. El checkpoint cuantizado conserva la arquitectura del original y aplica GPTQ con grupo de 128 y simetria sobre los pesos, manteniendo activaciones en BF16. Las proyecciones q/k/v/o de todas las capas y las MLP de las capas 0 y 51 se guardan en INT8, mientras que las MLP de las capas 1 a 50 se guardan en INT4. vLLM fusiona q/k/v en una sola matmul y gate/up en otra, por lo que cada miembro de un grupo fusionado comparte la misma precision.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO en la informacion proporcionada. La model card cita como datasets de referencia nvidia/Nemotron-Post-Training-Dataset-v1 y wikimedia/wikipedia, usados para calibracion y evaluacion de fidelidad. La innovacion tecnica destacable es la cuantizacion mixta W4/W8 disenada para preservar la calidad en un modelo sensible, junto con el uso de kernels Marlin en vLLM y parsers especificos (qwen3 para razonamiento, qwen3_coder para tool calling).

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con modo de pensamiento (thinking) activado por defecto; se puede desactivar por peticion con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling y function calling con parser `qwen3_coder`, con soporte de llamadas XML parseadas a `tool_calls`.
- Uso en agentes multi-turno y agentes de codigo, con recomendacion de `preserve_thinking: true` para conservar trazas de razonamiento.
- Capacidades de codigo y matematicas, segun los tags del repo (reasoning, agent) y los datos de evaluacion agentica.
- Soporte de conversaciones multi-turno con contexto largo, hasta 65.536 tokens configurados.
- Integracion con la API compatible de OpenAI en vLLM, incluyendo `reasoning_content` y `tool_calls`.

## Casos de uso

- Agentes de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD o asistentes de IDE mediante tool calling y `preserve_thinking`, manteniendo trazas de razonamiento entre pasos para tareas de refactorizacion y correccion.
- Atencion al cliente automatizada: gracias a la ventana de 65.536 tokens y al modo conversacional, puede gestionar conversaciones multi-turno con historial largo en ingles y chino.
- Razonamiento asistido con trazas: el modo thinking permite generar cadenas de razonamiento separadas del texto final, utiles para auditoria o para alimentar sistemas que consumen `reasoning_content`.
- Despliegue en hardware de consumo profesional: con 24,2 GB en disco y TP=2 sobre 2x RTX 3090, permite servir un modelo de 33B en entornos con GPUs de 24 GB, con throughput medido de hasta 655 tok/s totales a concurrencia 32.
- Procesamiento de documentos largos: con prefill de aproximadamente 2.100-2.350 tok/s hasta 32K tokens, es adecuado para resumir o extraer informacion de documentos extensos en ingles o chino.
- Evaluacion y experimentacion de cuantizacion: sirve como referencia practica para comparar fidelidad KLD frente a BF16 y frente a GGUF (Q4_K_M, AD-Q4_K_M, Q8_0) en cargas agenticas y de texto neutro.
- Backend de agentes con API OpenAI: al ser compatible con endpoints de vLLM y TGI, puede conectarse a frameworks de agentes que esperan tool calls y contenido de razonamiento estructurado.

## Benchmarks y rendimiento

Rendimiento de servicio medido con vLLM 0.27.1, 2x RTX 3090 a 350 W, TP=2, KV cache en BF16 (8,78 GiB por GPU, 88.480 tokens):

| Carga | Concurrencia | TTFT mediana | Decodificacion por usuario (mediana) | Salida total |
|---|---:|---:|---:|---:|
| 128 in / 256 out | 1 | 64 ms | 62,7 tok/s | 61,9 tok/s |
| 8K in / 256 out | 1 | 3,5 s | 58,6 tok/s | 32,6 tok/s |
| 32K in / 256 out | 1 | 13,9 s | 49,3 tok/s | 13,4 tok/s |
| 60K in / 256 out | 1 | 40,4 s | 39,9 tok/s | 6,0 tok/s |
| 1K in / 512 out | 4 | 1,0 s | 50,1 tok/s | 186 tok/s |
| 1K in / 512 out | 16 | 2,5 s | 34,4 tok/s | 501 tok/s |
| 1K in / 512 out | 32 | 3,2 s | 27,1 tok/s | 655 tok/s |

Fidelidad frente al BF16 original (KLD de la distribucion del siguiente token, menor es mejor):

| Modelo | Tamano | KLD media | KLD mediana | KLD p99 | Mismo top-1 | RMS Δp |
|---|---:|---:|---:|---:|---:|---:|
| AtomicChat Q8_0 GGUF (referencia) | 35,2 GB | 0,0032 | 0,00005 | 0,016 | 98,59% | 1,65% |
| AtomicChat AD-Q4_K_M GGUF | 21,2 GB | 0,0145 | 0,00038 | 0,148 | 96,95% | 3,70% |
| **Este modelo (agentico)** | **24,2 GB** | **0,0225** | **0,00046** | **0,263** | **96,52%** | **4,49%** |
| Uniform W4A16 GPTQ | 20,6 GB | 0,0330 | 0,00076 | 0,376 | 95,83% | 5,33% |
| AtomicChat Q4_K_M GGUF | 20,1 GB | 0,0322 | 0,00077 | 0,390 | 95,58% | 5,35% |

| Modelo | Tamano | KLD media | KLD mediana | KLD p99 | Mismo top-1 | RMS Δp |
|---|---:|---:|---:|---:|---:|---:|
| AtomicChat Q8_0 GGUF (referencia) | 35,2 GB | 0,0095 | 0,0015 | 0,081 | 96,42% | 2,19% |
| AtomicChat AD-Q4_K_M GGUF | 21,2 GB | 0,0711 | 0,0167 | 0,905 | 90,14% | 5,79% |
| **Este modelo (texto neutro)** | **24,2 GB** | **0,1105** | **0,0332** | **1,335** | **87,01%** | **7,38%** |
| AtomicChat Q4_K_M GGUF | 20,1 GB | 0,1108 | 0,0344 | 1,428 | 86,83% | 7,23% |
| Uniform W4A16 (texto neutro) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 24,2 GB de pesos; con TP=2 sobre 2x RTX 3090, vLLM reporta 8,78 GiB de KV cache por GPU con `--gpu-memory-utilization 0.92`.
- GPUs recomendadas: 2x RTX 3090 (configuracion probada); en general, 2 GPUs de 24 GB. Existe una variante para una sola GPU de 24 GB: heliophage/Nanbeige4.3-33B-W4A16-GPTQ-24GB.
- Cabe en GPU de consumo: si, en 2x RTX 3090; tambien en GPUs Ada/Hopper/Blackwell con mayor margen, donde FP8 KV duplica aproximadamente la capacidad de cache.
- Opciones de despliegue: vLLM >= 0.27 con kernels Marlin (recomendado); transformers puede cargar el checkpoint pero descomprime a BF16 y requiere unos 66 GB de memoria.
- Latencia y throughput: prefill de aproximadamente 2.100-2.350 tok/s hasta 32K tokens; decodificacion de 62,7 tok/s por usuario a concurrencia 1 con prompt corto y 27,1 tok/s a concurrencia 32.
- Aviso de KV cache: en RTX 3090 (Ampere, SM86) con vLLM 0.27.1, `--kv-cache-dtype fp8` falla (FlashInfer se cae con fp8 y fp8_e5m2; el backend Triton lo rechaza porque FP8 nativo requiere SM89+). Mantener KV en BF16 en Ampere.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nanbeige4.3-33B W4A16 GPTQ) | 7.356.038.872 (checkpoint cuantizado) | 65.536 configurado | 24,2 GB | apache-2.0 | HuggingFace, vLLM |
| Nanbeige4.3-33B BF16 (base) | no disponible | no disponible | 66,3 GB | apache-2.0 | HuggingFace |
| AtomicChat Nanbeige4.3-33B GGUF Q4_K_M | no disponible | no disponible | 20,1 GB | no disponible | HuggingFace, llama.cpp |
| AtomicChat Nanbeige4.3-33B GGUF AD-Q4_K_M | no disponible | no disponible | 21,2 GB | no disponible | HuggingFace, llama.cpp |
| AtomicChat Nanbeige4.3-33B GGUF Q8_0 | no disponible | no disponible | 35,2 GB | no disponible | HuggingFace, llama.cpp |

En fidelidad agentica, este checkpoint (KLD media 0,0225) queda entre el AD-Q4_K_M GGUF (0,0145) y el Q4_K_M GGUF (0,0322), con mejor KLD que el GPTQ uniforme W4A16 (0,0330). En texto neutro, su KLD media (0,1105) es practicamente identica a la del Q4_K_M GGUF (0,1108).

## Limitaciones y advertencias

- Modelo sensible a la cuantizacion: el autor indica que el modelo original lo es, de ahi la mezcla W4/W8; aun asi, la fidelidad en texto neutro es notablemente peor que en texto agentico (KLD media 0,1105 frente a 0,0225; mismo top-1 87,01% frente a 96,52%).
- Riesgo de alucinacion: no se documenta en la informacion disponible; como todo LLM, puede generar contenido incorrecto, especialmente en contextos largos o fuera de los idiomas de entrenamiento.
- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta documentado.
- Contexto: 65.536 tokens configurados en el ejemplo; con KV en BF16 en 2x RTX 3090 la cache alcanza 88.480 tokens, lo que da 1,35 peticiones concurrentes a 64K de contexto, limitando el batching con prompts muy largos.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Nanbeige4.3-33B y de los datasets de calibracion.
- Limitacion de despliegue: transformers carga el checkpoint pero lo descomprime a BF16 (unos 66 GB), por lo que no aporta ventaja de memoria; el beneficio requiere vLLM.
- En GPUs Ampere (SM86) no se puede usar KV cache FP8 con vLLM 0.27.1; hay que mantener BF16.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/heliophage/Nanbeige4.3-33B-W4A16-GPTQ
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Variante para una sola GPU de 24 GB: https://huggingface.co/heliophage/Nanbeige4.3-33B-W4A16-GPTQ-24GB
- GGUFs de referencia: https://huggingface.co/AtomicChat/Nanbeige4.3-33B-GGUF
- compressed-tensors: https://github.com/vllm-project/compressed-tensors
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v1
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
