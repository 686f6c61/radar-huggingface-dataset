# letechlead/SenseNova-Loop-9B-FP8

## Resumen

SenseNova-Loop-9B-FP8 es una cuantizacion en FP8 de los pesos del modelo multimodal SenseNova-Loop-9B, desarrollado originalmente por SenseNova y cuantizado por el usuario LeTechLead. Se trata de un decodificador multimodal de 9.412.963.952 parametros (aproximadamente 9,4 mil millones) que combina un transformer con capas "looped" (32 capas fisicas ejecutadas como 56 pasadas de capa), atencion hibrida lineal/completa y un esquema de dos flujos mHC. El checkpoint reduce el peso de 18,83 GB en BF16 a 11,56 GB en FP8, una reduccion del 38,6 %, manteniendo la semantica del modelo original.

La relevancia de esta version radica en que permite servir un modelo multimodal de 9B con contexto muy largo (hasta 160.000 tokens) en una unica GPU de consumo de 24 GB, como una RTX 3090, mediante vLLM con kernels Marlin W8A16. El autor reporta paridad casi exacta con la version BF16 en generacion greedy para matematicas y codigo, y una prueba de recuperacion de informacion (needle-in-a-haystack) satisfactoria a 159.119 tokens.

La cuantizacion es weight-only, sin datos de calibracion, con escalas por bloque de 128x128 y formato e4m3fn, siguiendo el esquema de los releases FP8 oficiales de Qwen. La licencia es Apache-2.0, heredada del modelo base, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas looped (32 capas fisicas, 56 pasadas), atencion hibrida lineal/full, dos flujos mHC, vision encoder |
| Parametros totales | 9.412.963.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 160.000 tokens (probado en vLLM; KV cache de 184.258 tokens a 0,93 de utilizacion) |
| Tipos de cuantizacion | FP8 e4m3fn weight-only, escalas por bloque 128x128 (weight_scale_inv), sin calibracion; pesos sensibles en BF16/FP32 |
| Idiomas soportados | ingles (en) y chino (zh) segun tags de la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8 + BF16/FP32 mixtos), compatible con transformers y vLLM (fork) |

## Arquitectura y entrenamiento

El modelo base es un decodificador multimodal con una arquitectura poco convencional: 32 capas fisicas que se ejecutan como 56 pasadas de capa ("looped transformer"), lo que aumenta la profundidad efectiva sin incrementar el numero de parametros. Incorpora atencion hibrida que combina atencion completa con atencion lineal del tipo Gated-DeltaNet, y un esquema de enrutamiento denominado mHC con dos flujos (mhc_attn y mhc_ffn) mas una compuerta de bucle (loop_gate) en FP32. Incluye ademas un codificador de vision con 27 bloques (0-26), merger, patch_embed y pos_embed para el procesamiento de imagenes.

La cuantizacion FP8 afecta a las proyecciones q/k/v/o de la atencion completa, a in_proj_qkv/z y out_proj de la atencion lineal, a las proyecciones gate/up/down del MLP y a los bloques de vision 3-26. Se mantienen en BF16 los embeddings, lm_head, todas las normas, conv1d, A_log, dt_bias, in_proj_a/in_proj_b (por requisitos de alineacion de 128 filas en la ruta Marlin), los bloques de vision 0-2, merger, patch_embed y pos_embed; el enrutamiento mHC y loop_gate permanecen en FP32. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento y matematicas: el autor verifica respuestas correctas en prompts de matematicas y razonamiento.
- Generacion de codigo: verificacion con 160 de 160 tokens identicos en generacion greedy frente a BF16.
- Procesamiento de imagen y texto (pipeline image-text-to-text): incluye codificador de vision y prueba de descripcion de imagenes superada.
- Contexto largo: recuperacion de informacion (needle-in-a-haystack) a 159.119 tokens desde posiciones al 50 % y 95 %.
- Capacidad multimodal de entrada (imagen + texto); no se especifica soporte de audio ni de video.
- No se documenta explicitamente soporte de tool calling, function calling ni modo thinking en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos con imagenes: el modelo puede procesar hasta 160.000 tokens de contexto, lo que permite ingerir informes, contratos o articulos con figuras y tablas en una sola pasada, manteniendo coherencia en la recuperacion de datos concretos gracias a la prueba needle-in-a-haystack superada.
- Asistencia tecnica bilingue ingles-chino: adecuado para equipos que atienden a usuarios en ambos idiomas, con conversaciones multi-turno y contexto largo para mantener el historial completo de la sesion.
- Generacion de codigo en entornos con GPU limitada: al caber en una RTX 3090 de 24 GB, permite desplegar un asistente de codigo autoalojado con cuantizacion FP8 y throughput de decodificacion de 43 t/s en un solo request.
- Descripcion y extraccion de informacion de imagenes: el pipeline image-text-to-text permite generar descripciones, resumir capturas o extraer datos de graficos en flujos de documentacion automatizada.
- Razonamiento matematico asistido: util para tutoria o verificacion de problemas paso a paso, con respuestas verificadas como correctas en las pruebas del autor.
- Despliegue en produccion con vLLM: la integracion con el fork de vLLM y el soporte de concurrencia (hasta 158,4 t/s agregados con 8 requests) lo hacen viable para servicios con carga moderada en hardware de consumo o profesional de gama media.
- Investigacion sobre arquitecturas looped: al ser una cuantizacion fiel del modelo base, sirve como banco de pruebas para estudiar el comportamiento de transformers con capas reutilizadas en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona metricas de verificacion y de serving:

| Metrica | Resultado |
|---|---|
| Error relativo L2 medio de pesos (BF16 vs FP8 dekuantizado) | 2,64 % (maximo 2,66 %) |
| Generacion greedy identica en matematicas | 3/3 prompts |
| Generacion greedy identica en codigo | 160/160 tokens |
| Similitud coseno de logits con entrada fija | 0,9996 (top-1 coincidente) |
| Needle-in-a-haystack a 159.119 tokens | recuperado en posiciones 50 % y 95 % |
| Prefill (RTX 3090, profundidad 0) | 2.251,9 t/s |
| Decode (RTX 3090, profundidad 0) | 43,11 t/s |
| Decode (RTX 3090, profundidad 131.072) | 25,04 t/s |
| Throughput agregado a 1/2/4/8 requests | 42,7 / 74,8 / 114,5 / 158,4 t/s |

## Requisitos de hardware

- VRAM estimada para inferencia: pesos FP8 residentes de 10,46 GiB en vLLM; KV cache de 9,55 GiB para 160.000 tokens (10,08 GiB a 0,93 de utilizacion, 184.258 tokens).
- Cabe en GPU de consumo: si, en una RTX 3090 de 24 GB con kernels Marlin W8A16; tambien en GPUs con soporte nativo FP8 (sm89+) como RTX 4090, que usan kernels FP8 nativos.
- GPU recomendadas: RTX 3090 (24 GB) para serving FP8 con Marlin; RTX 4090 o superiores para kernels FP8 nativos; A100/H100 para mayor concurrencia y throughput.
- Opciones de despliegue: vLLM mediante el fork LeTechLead/vllm rama `sensenova-loop-fp8` (requiere torch 2.14.0+cu130 y compilacion desde fuente con `TORCH_CUDA_ARCH_LIST=8.6`); transformers 5.18.0 con torch 2.11.0+cu130 para carga BF16 tras dekuantizar con `dequant_to_bf16.py`; para BF16 nativo o 4 bits, usar los releases oficiales del modelo base y su variante AWQ.
- Latencia y throughput: TTFT de 1,82 s a profundidad 0 y 92,59 s a 131.072 tokens en RTX 3090; decodificacion de 43,11 t/s a profundidad 0 y 25,04 t/s a 131.072 tokens. No se recomienda `--enforce-eager`, ya que reduce el throughput de decodificacion aproximadamente 2,7 veces.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-FP8 | 9,41B | 160k (probado) | Apache-2.0 | Hugging Face, vLLM (fork) | Cuantizacion FP8 weight-only, multimodal |
| SenseNova-Loop-9B (base) | 9,41B | no disponible | Apache-2.0 | Hugging Face | Version BF16 original, mayor huella de VRAM |
| Qwen3-32B-FP8 | 32B | no disponible | no disponible en la informacion | Hugging Face | Referencia de esquema de cuantizacion FP8, mayor tamano |
| Qwen3-VL-FP8 | no disponible | no disponible | no disponible en la informacion | Hugging Face | Referencia de politica de ignorados en vision |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros y formato de cuantizacion.

## Limitaciones y advertencias

- La cuantizacion es weight-only sin calibracion, por lo que puede introducir divergencias en generacion no greedy; el autor reporta divergencia tardia con contenido equivalente en prompts de chino y razonamiento.
- El soporte en vLLM requiere un fork no oficial (LeTechLead/vllm, rama `sensenova-loop-fp8`) que elimina una restriccion de carga cuantizada; no es una ruta upstream estable.
- La compilacion desde fuente exige torch 2.14.0+cu130 y variables de compilacion especificas; en GPUs sin FP8 nativo se depende de la ruta Marlin W8A16.
- Idiomas documentados limitados a ingles y chino; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de sesgo en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero los pesos originales son (c) SenseNova y la cuantizacion es de LeTechLead; conviene revisar los terminos del modelo base.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines que dependan de function calling.
- El contexto maximo probado es de 160.000 tokens en vLLM; superarlo puede degradar la calidad o exceder la KV cache disponible.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/letechlead/SenseNova-Loop-9B-FP8
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Fork de vLLM: https://github.com/LeTechLead/vllm/tree/sensenova-loop-fp8
- PR upstream de vLLM: https://github.com/vllm-project/vllm/pull/64832
