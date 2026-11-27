# Kaleto/SenseNova-Loop-9B-NVFP4

## Resumen

SenseNova-Loop-9B-NVFP4 es una cuantizacion de 4 bits en formato NVFP4 (W4A16) del modelo multimodal sensenova/SenseNova-Loop-9B, publicada por el usuario Kaleto. El modelo base es un transformer con bucles (looped transformer) de aproximadamente 9.656 millones de parametros que procesa texto e imagenes (pipeline image-text-to-text) y que emplea una arquitectura hibrida con 24 capas Gated DeltaNet y 8 capas de atencion completa, ademas de un esquema de dos flujos mHC (Sinkhorn) alrededor de las capas con bucles.

Esta version cuantizada esta pensada especificamente para servir el modelo con vLLM sobre GPU NVIDIA Blackwell, en particular la DGX Spark con GB10. El objetivo es reducir el peso en memoria de 17,8 GiB (BF16) a 7,2 GiB incluyendo la torre de vision, manteniendo esta en BF16, y acelerar la decodificacion hasta 26 tok/s en un solo flujo y 36,6 tok/s con decodificacion especulativa MTP.

Su relevancia actual radica en que permite ejecutar un modelo multimodal de ~9,7B parametros con contexto extendido (hasta 512K mediante YaRN x2) en hardware de memoria unificada relativamente modesto, liberando espacio para la cache KV y otros modelos. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseNovaLoopForConditionalGeneration: 32 capas almacenadas, capas 4-27 ejecutadas dos veces (56 ejecuciones), dos flujos mHC (Sinkhorn), 24 Gated DeltaNet + 8 capas de atencion completa, YaRN x2 hasta 512K, vocabulario 248.320 |
| Parametros totales | 9.656.254.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512K tokens (YaRN x2 sobre el modelo base) |
| Tipos de cuantizacion | NVFP4 (E2M1, una escala E4M3 por cada 16 pesos y una escala FP32 por tensor); quant_algo W4A16_NVFP4 (pesos de 4 bits, activaciones BF16) |
| Idiomas soportados | no disponible (la calibracion incluyo texto en ingles y aleman, pero no se declara una lista oficial de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de nvidia-modelopt 0.43), libreria vllm; tamano del repo 12,6 GB, 7,9 GB en disco |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de transformer con bucles: almacena 32 capas, pero las capas 4 a 27 se ejecutan dos veces, lo que resulta en 56 ejecuciones efectivas. Alrededor de las capas con bucles se situa un mecanismo de dos flujos mHC basado en Sinkhorn. La atencion es hibrida: 24 capas usan Gated DeltaNet (atencion lineal) y 8 capas usan atencion completa. El vocabulario es de 248.320 tokens y el contexto se extiende hasta 512K mediante YaRN x2. Incluye una torre de vision para entrada de imagenes y una cabeza MTP (multi-token prediction) para decodificacion especulativa.

Esta publicacion concreta es una cuantizacion, no un reentrenamiento. Se cuantizaron 200 capas lineales: `mlp.{gate,up,down}_proj` en las 32 capas, `self_attn.{q,k,v,o}_proj` en 8 capas, `linear_attn.{in_proj_qkv,in_proj_z,out_proj}` en 24 capas, y tambien `lm_head`. Se mantuvieron intactos (identicos al original) `embed_tokens`, todas las normalizaciones, los routers mHC (FP32), `loop_gate`, `in_proj_a/b` de DeltaNet, `conv1d`, `A_log`/`dt_bias` (FP32), la torre de vision y la cabeza MTP. La calibracion se realizo con 64 secuencias de 1.024 tokens de texto mixto (noticias, wiki en ingles y aleman, codigo, chat, role-play) ejecutadas a traves del forward real con bucles, recogiendo rangos de activacion en ambas pasadas de cada capa con bucles.

Como innovacion destacable, la version del 19 de noviembre de 2026 cuantiza tambien el LM head (248K x 4096), que se lee completo en cada token decodificado; esto aporto un 22 % de velocidad adicional (31 % con MTP) y 2 GB menos de memoria, con un coste de precision (KLD medio de 0,160 frente a 0,153). No se dispone de informacion sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- Generacion de texto conversacional en ingles y aleman (idiomas usados en la calibracion y en las pruebas de velocidad), con soporte multilingue no documentado oficialmente.
- Comprension de imagenes y texto (image-text-to-text) mediante la torre de vision, mantenida en BF16.
- Razonamiento multi-turno y respuestas de hasta 384 tokens nuevos en las pruebas realizadas.
- Decodificacion especulativa mediante la cabeza MTP incluida (BF16), con `--speculative-config '{"method": "mtp", "num_speculative_tokens": 1}'`.
- Contexto largo de hasta 512K tokens gracias a YaRN x2.
- Modo "thinking" desactivable (las pruebas de velocidad se hicieron con thinking off).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat en DGX Spark o GB10: el modelo decodifica a 26 tok/s en un flujo y 90 tok/s agregados en cuatro flujos concurrentes, adecuado para asistentes conversacionales en hardware de memoria unificada.
- Despliegue multimodal en el borde: al cargar en 7,2 GiB con la torre de vision incluida, permite procesar imagenes y texto en un unico dispositivo dejando memoria libre para la cache KV.
- Procesamiento de documentos largos: con contexto de hasta 512K tokens via YaRN x2, puede resumir o responder preguntas sobre corpus extensos en una sola pasada.
- Generacion de codigo y explicaciones tecnicas: las pruebas de calidad y velocidad incluyen tareas de codigo y explicacion en ingles y aleman, lo que respalda su uso en asistentes de programacion.
- Traduccion y contenido multilingue ingles-aleman: la calibracion y las pruebas cubren ambos idiomas, por lo que es adecuado para flujos de traduccion y redaccion bilingue.
- Inferencia de alta concurrencia con vLLM: el plugin `vllm-sensenova-loop` y la decodificacion MTP permiten servir varias peticiones simultaneas con throughput agregado de 126 tok/s en cuatro flujos.
- Prototipado de agentes con razonamiento por pasos: el contexto largo y la generacion multi-turno permiten encadenar pasos de razonamiento, aunque el soporte de tool calling no esta documentado.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.). Los datos disponibles son de velocidad y calidad de cuantizacion en DGX Spark (GB10) con vLLM 0.31.0, cache KV en BF16, seis tareas de chat en ingles y aleman, thinking off, hasta 384 tokens nuevos, greedy:

| Build | Pesos en memoria | Sin MTP (1 flujo / 4 flujos) | Con MTP, 1 token draft |
|---|---:|---:|---:|
| BF16 (original) | 17,8 GiB | 7,5 / 22 tok/s | 12,2 / 31 tok/s |
| Este build (NVFP4) | 7,2 GiB | 25,9 / 90 tok/s | 36,6 / 126 tok/s |
| Este build antes del 2026-11-19 (LM head BF16) | 8,5 GiB | 21,3 / 75 tok/s | 27,9 / 99 tok/s |
| NVFP4-MLP (hermano) | 10,0 GiB | 14,0 / 53 tok/s | 24,6 / 76 tok/s |
| SenseNova AWQ (oficial) | 5,5 GiB | 27,5 / 77 tok/s | 39,4 / 104 tok/s |

Notas de rendimiento: la memoria incluye la torre de vision; MTP anade 0,5 GiB. El token draft de la cabeza MTP se acepta el 67 % de las veces. Mas tokens draft (2 o 3) se aceptan con mas frecuencia pero no son mas rapidos en GB10. Con temperatura 1,0 / top_p 0,95 / top_k 20 en lugar de greedy, la velocidad en un flujo baja aproximadamente un 4 %. Como referencia, el fork de llama.cpp de SenseNova (CUDA, `-fa on`) con GGUF Q4_K_M alcanzo unos 600 tok/s de prefill y 4 tok/s de decodificacion en la misma maquina.

## Requisitos de hardware

- VRAM/memoria estimada: 7,2 GiB de pesos en memoria incluyendo la torre de vision; MTP anade 0,5 GiB. El repo ocupa 12,6 GB y 7,9 GB en disco.
- GPU recomendadas: NVIDIA Blackwell, en particular DGX Spark / GB10 y GB10; tambien otras GPU Blackwell con vLLM.
- GPU consumer: no se especifica compatibilidad con GPU consumer; en GPU NVIDIA pre-Blackwell el modelo podria ejecutarse via Marlin en vLLM, pero el autor indica que no lo ha medido.
- Opciones de despliegue: vLLM 0.31.0 con el plugin `vllm-sensenova-loop`; para llama.cpp se requieren los GGUF de AtomicChat o SenseNova y el fork de llama.cpp de SenseNova; en Apple Silicon existen builds MLX (por ejemplo, de NetProjects).
- Latencia y throughput: 26 tok/s en un flujo y 90 tok/s en cuatro flujos sin MTP; 36,6 tok/s y 126 tok/s respectivamente con MTP en GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento en GB10 |
|---|---|---|---|---|---|
| Kaleto/SenseNova-Loop-9B-NVFP4 (este) | 9,66B | hasta 512K | NVFP4 W4A16 | apache-2.0 | 25,9 / 90 tok/s (sin MTP); 36,6 / 126 tok/s (MTP) |
| Kaleto/SenseNova-Loop-9B-NVFP4-MLP | 9,66B | hasta 512K | NVFP4 (solo MLP) | apache-2.0 | 14,0 / 53 tok/s; 24,6 / 76 tok/s |
| sensenova/SenseNova-Loop-9B-AWQ | 9,66B | hasta 512K | AWQ | apache-2.0 | 27,5 / 77 tok/s; 39,4 / 104 tok/s |
| sensenova/SenseNova-Loop-9B (BF16) | 9,66B | hasta 512K | BF16 safetensors | apache-2.0 | 7,5 / 22 tok/s; 12,2 / 31 tok/s |

El build NVFP4-MLP prioriza la precision (cuantiza solo las MLP) a costa de velocidad y memoria (10,0 GiB). El AWQ oficial ocupa menos memoria (5,5 GiB) y es algo mas rapido en un flujo (27,5 tok/s) pero menor en throughput agregado sin MTP (77 frente a 90 tok/s). El BF16 original es aproximadamente 3 veces mas lento y ocupa 17,8 GiB.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de precision: el KLD medio es 0,160 frente a 0,153 de la version con LM head en BF16 y presumiblemente menor en BF16 completo.
- Solo se ha medido en GB10; el rendimiento en otras GPU Blackwell o en GPU pre-Blackwell via Marlin no esta verificado.
- La torre de vision se mantiene en BF16, por lo que las capacidades visuales conservan la precision del original, pero anaden 0,85 GiB de memoria.
- La lista oficial de idiomas no esta documentada; la calibracion solo cubre ingles y aleman.
- El soporte de tool calling, agentes y function calling no esta documentado en la informacion disponible.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones especificas en la informacion proporcionada.
- Requiere el plugin `vllm-sensenova-loop` y vLLM 0.31.0; no es un checkpoint estandar que funcione en cualquier motor sin adaptacion.
- En llama.cpp el rendimiento es muy bajo (4 tok/s de decodificacion) por la juventud de la implementacion de la arquitectura con bucles.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base y de las dependencias (nvidia-modelopt, vLLM).

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Kaleto/SenseNova-Loop-9B-NVFP4
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Revision anterior con LM head en BF16: https://huggingface.co/Kaleto/SenseNova-Loop-9B-NVFP4/tree/b8e8307d
- Hermano NVFP4-MLP: https://huggingface.co/Kaleto/SenseNova-Loop-9B-NVFP4-MLP
- AWQ oficial: https://huggingface.co/sensenova/SenseNova-Loop-9B-AWQ
- GGUF de AtomicChat: https://huggingface.co/AtomicChat/SenseNova-Loop-9B-GGUF
- GGUF de SenseNova: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- Build MLX: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- nvidia-modelopt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
