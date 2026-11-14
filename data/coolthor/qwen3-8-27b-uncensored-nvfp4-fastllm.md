# coolthor/Qwen3.8-27B-Uncensored-NVFP4-FastLLM

## Resumen

Qwen3.8-27B-Uncensored-NVFP4-FastLLM es una cuantizacion en NVFP4 del modelo orcarouter/Qwen3.8-27B-Uncensored, publicada por el usuario coolthor. El modelo base deriva de Qwen/Qwen3.8-27B y ha sido sometido a un proceso de abliteration que elimina buena parte de su alineamiento de seguridad. Esta version cuantizada reduce el peso de 55,6 GB en BF16 y 29 GB en FP8 a 20,6 GB, manteniendo en BF16 el `lm_head`, los embeddings, la torre de vision, las convoluciones 1D y la cabeza MTP.

La motivacion principal del autor es servir el modelo en dos tarjetas RTX 2080 Ti de 22 GB mediante FastLLM, a pesar de que la arquitectura Turing (sm_75) carece de hardware FP4. FastLLM almacena los pesos NVFP4 tal cual y los desempaqueta a FP16 dentro del kernel; como la decodificacion esta limitada por la lectura de pesos, el archivo mas pequeno compensa el coste del desempaquetado y ofrece mayor velocidad. Con decodificacion especulativa DFlash2 alcanza 151,7 tok/s en codigo, frente a 116,1 tok/s de la version FP8.

Se trata de un modelo vision-language de 27.781.427.952 parametros, con capacidades multimodales (image-text-to-text) y entrenamiento en ingles y chino. Su relevancia actual reside en demostrar que es posible ejecutar cuantizaciones NVFP4 en GPUs sin soporte nativo de FP4, un caso de interes para quienes reciclan hardware de generaciones anteriores. La licencia es Apache 2.0, aunque la ausencia de alineamiento de seguridad limita su uso responsable a entornos de investigacion controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (capas de atencion y proyecciones GDN), torre de vision y cabeza MTP; familia qwen3_5 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se ha probado prefill de 54K tokens) |
| Tipos de cuantizacion | NVFP4 (E2M1 con escala FP8-E4M3 por cada 16 valores y escala global FP32 por tensor) en todas las capas lineales; BF16 en `lm_head`, `embed_tokens`, torre de vision, `conv1d` y cabeza MTP |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 2.687 tensores, `total_size` 20.558.935.392 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.8 con torre de vision y cabeza MTP (multi-token prediction), lo que permite decodificacion especulativa con un modelo borrador. Incluye proyecciones GDN (`in_proj_qkv/z/a/b`, `out_proj`) ademas de las proyecciones de atencion q/k/v/o y las capas MLP. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La innovacion tecnica de esta publicacion es el esquema de cuantizacion NVFP4 aplicado a todas las capas lineales, con un layout identico al de lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL (mismos nombres de tensor, dtypes, shapes, shard map y `quantization_config`). Siguiendo la receta de ModelOpt, q/k/v comparten una escala global por capa, las cuatro proyecciones de entrada GDN comparten otra y gate/up del MLP comparten una tercera. No se realizo calibracion: `input_global_scale` se fija a 1.0, lo que es valido para FastLLM en sm_75 (que computa con activaciones FP16 y no lee esa escala) pero degradaria los resultados en motores que hagan W4A4 con escalas reales de activacion. La conversion se hizo con un script solo-numpy que corre en CPU, verificado dequantizando y recuantizando capas de la referencia hasta obtener bytes identicos.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con modo thinking configurable (se han evaluado los modos sin thinking y thinking con esfuerzo bajo).
- Razonamiento matematico y resolucion de problemas tipo GSM8K y MATH-500.
- Generacion de codigo, incluida la resolucion de ejercicios tipo HumanEval+.
- Comprension de imagenes (pipeline image-text-to-text) mediante la torre de vision en BF16.
- Decodificacion especulativa mediante cabeza MTP y modelo borrador externo DFlash2.
- Servido compatible con endpoints (tag `endpoints_compatible`).
- No se documenta soporte explicito de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.

## Casos de uso

- Servicio de inferencia en hardware Turing: el modelo esta disenado para desplegarse en dos RTX 2080 Ti de 22 GB con FastLLM y TP=2, permitiendo reutilizar GPUs sin soporte FP4 nativo con un throughput de 151,7 tok/s en codigo.
- Generacion de codigo en produccion controlada: con 151,7 tok/s en codigo y soporte de decodificacion especulativa, es adecuado para asistentes de autocompletado o generacion de tests en pipelines internos, siempre con moderacion adicional.
- Procesamiento de documentos con imagenes: la torre de vision en BF16 permite tareas de image-text-to-text como descripcion de capturas, extraccion de informacion de diagramas o respuesta a preguntas sobre figuras.
- Evaluacion de investigacion sobre alineamiento: al ser una variante abliterated, sirve para estudiar el comportamiento de modelos sin salvaguardas en entornos de laboratorio aislados.
- Atencion multilingue ingles-chino: conversaciones multi-turno en ambos idiomas, con soporte de prefill de prompts largos (probado con 54K tokens) para resumen de documentacion extensa.
- Despliegue con concurrencia moderada: con KV cache FP8 y `--max_batch 4` alcanza 107,8 tok/s por stream con 2 streams y 74,3 tok/s por stream con 4 (unos 297 tok/s combinados), valido para APIs internas de baja concurrencia.
- Prototipado de asistentes multimodales en local: el peso de 20,6 GB permite ejecutarlo en configuraciones de dos GPUs consumer, facilitando pruebas sin infraestructura cloud.

## Benchmarks y rendimiento

Rendimiento en dos RTX 2080 Ti 22 GB (TP=2, FastLLM + DFlash2, temperatura 0, 512 tokens, mediana de 3 ejecuciones, tok/s):

| Modelo | code | math | prose | sin especulacion (code) |
|---|---:|---:|---:|---:|
| orcarouter FP8 | 116,1 | 135,5 | 74,2 | 32,9 |
| este NVFP4 | 151,7 | 178,8 | 101,9 | 45,1 |

Evaluacion de 140 preguntas (GSM8K 50, MATH-500 30, MuSR 20, HumanEval+ 40), numero de aciertos:

| Modelo | sin thinking | thinking (effort low) |
|---|---:|---:|
| orcarouter FP8 | 132 | 127 |
| este NVFP4 | 131 | 128 |

Coste de prefill: un prompt de 54K tokens tarda 50,6 s frente a 40,5 s de la version FP8, ya que el prefill esta limitado por computo y el desempaquetado es sobrecarga pura. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K en formato oficial) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 20,6 GB de pesos; con TP=2 en dos RTX 2080 Ti de 22 GB se usa `--gpu_mem_ratio 0.95`. El KV cache puede almacenarse en FP8 (e4m3) para reducir memoria.
- GPUs probadas: dos NVIDIA RTX 2080 Ti de 22 GB (sm_75, arquitectura Turing), con tensor parallelism 2.
- Cabe en GPUs consumer: si, en configuraciones de dos tarjetas de 22 GB o superiores. No se ha probado en una sola GPU.
- Opciones de despliegue: FastLLM (unica opcion validada, con los PRs #749 y #756 mergeados y el commit `a2bf07fd` con `d4b04876` revertido). No se ha probado vLLM, SGLang ni GPUs Blackwell.
- Decodificacion especulativa: requiere el modelo borrador z-lab/Qwen3.8-27B-DFlash2 y `--speculative_num_draft_tokens 8`.
- Latencia y throughput: 151,7 tok/s en codigo con especulacion, 45,1 tok/s sin especulacion; 107,8 tok/s por stream con 2 streams concurrentes y 74,3 tok/s con 4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento (code tok/s) |
|---|---|---|---|---|---|
| Este modelo (NVFP4) | 27,78B | no disponible | NVFP4 + BF16 | apache-2.0 | 151,7 (2080 Ti x2) |
| orcarouter/Qwen3.8-27B-Uncensored (FP8) | 27,78B | no disponible | FP8 | apache-2.0 | 116,1 (2080 Ti x2) |
| lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL | 27,78B | no disponible | NVFP4 + BF16 | no disponible | 136,0 (referencia del autor) |
| orcarouter/Qwen3.8-27B-Uncensored (BF16) | 27,78B | no disponible | BF16 | apache-2.0 | no disponible (55,6 GB) |

## Limitaciones y advertencias

- El modelo base ha sido sometido a abliteration: cumple peticiones daninas y no dispone de salvaguardas efectivas. Es imprescindible anadir moderacion propia antes de exponerlo a terceros.
- Riesgo elevado de alucinacion y de contenido inapropiado, especialmente en ausencia de alineamiento.
- Solo se ha validado con FastLLM en sm_75; no hay pruebas con vLLM, SGLang ni GPUs Blackwell, por lo que el soporte en otros motores es incierto.
- La ausencia de calibracion (`input_global_scale` = 1.0) implica que motores con W4A4 y escalas reales de activacion obtendran peor calidad que un checkpoint calibrado.
- El prefill es mas lento que en FP8 (50,6 s frente a 40,5 s para 54K tokens) por el desempaquetado en computo.
- Idiomas limitados a ingles y chino; no se documenta rendimiento en castellano.
- No se dispone de informacion sobre tool calling ni capacidades agenticas, lo que limita su uso en pipelines automatizados complejos.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y etica del contenido generado recae en el desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coolthor/Qwen3.8-27B-Uncensored-NVFP4-FastLLM
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencia de layout NVFP4: https://huggingface.co/lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL
- Modelo borrador DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- FastLLM: https://github.com/ztxz16/fastllm
- PR FastLLM #749: https://github.com/ztxz16/fastllm/pull/749
- PR FastLLM #756: https://github.com/ztxz16/fastllm/pull/756
- Articulo tecnico (ingles): https://ai-muninn.com/en/blog/fastllm-dual-2080ti-nvfp4-self-quant
- Articulo tecnico (chino): https://ai-muninn.com/zh-TW/blog/fastllm-dual-2080ti-nvfp4-self-quant
- Script de conversion: https://ai-muninn.com/tools/qwen38-nvfp4-convert.py
- Articulo previo sobre concurrencia: https://ai-muninn.com/en/blog/fastllm-dual-2080ti-concurrency-scheduler
