# deluxetiky/agnes-vs-qwen38-benchmark

## Resumen

Este repositorio de Hugging Face no contiene un modelo de lenguaje, sino un banco de pruebas de servido (benchmark) de inferencia en una sola GPU. Su autor, deluxetiky, publica la comparativa "Single-GPU serving benchmark: Agnes-3.0-Flash (BF16) vs Qwen3.8-27B TURBO (NVFP4)", en la que mide dos checkpoints de atencion hibrida (regla delta + atencion global) servidos sobre la misma GPU Blackwell de 96 GB, con el mismo conjunto de pruebas y evaluadores objetivos: codigo ejecutado, resultados numericos contrastados y llamadas a herramientas validadas contra esquema.

El interes del artefacto es metodologico: fija una plataforma concreta (1x NVIDIA RTX PRO 6000 Blackwell Max-Q Workstation Edition, 97 887 MiB, TP1, driver 595.91.07, CUDA 13.0, 24 nucleos de CPU, 128 GB de RAM) y sirve 262 144 tokens de contexto en ambos casos, de modo que las diferencias de rendimiento no provienen de la configuracion de contexto. Los dos modelos comparados son Agnes-3.0-Flash (33,09 B en BF16, 66,2 GB) y una cuantizacion NVFP4 W4A16 de ~27 B derivada de la familia Qwen3.8-27B TURBO (20,6 GB).

El resultado principal es que ambos checkpoints obtuvieron 4/4 en las cuatro tareas duras evaluadas, por lo que la conclusion del autor no es de calidad sino de compromiso: velocidad frente a economida de tokens y soporte de video. La relevancia actual esta en el desglose de ingenieria que acompana a las cifras (parches de SGLang, backport de decodificacion Gated-DeltaNet en vLLM, decodificacion especulativa MTP y sus limites en TP2), util para quien deba desplegar arquitecturas hibridas en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Tipo de artefacto | Repositorio de benchmark de servido; no publica pesos de modelo |
| Arquitectura | Transformer hibrida de atencion delta-rule (via Gated-DeltaNet / SSM Mamba) combinada con atencion global. Agnes-3.0-Flash: 72 capas, 24 cabezas de atencion y 4 cabezas KV, head_dim 256, `global_attention_interval: 4`, `mamba_ssm_dtype: float32`. Qwen3.8-27B TURBO: decodificacion por camino Gated-DeltaNet |
| Parametros totales | Agnes-3.0-Flash: 33,09 B. Qwen3.8-27B TURBO NVFP4: ~27 B |
| Parametros activos | no disponible (no se describe una topologia MoE en la informacion proporcionada) |
| Longitud de contexto | 262 144 tokens servidos en ambos checkpoints |
| Tipos de cuantizacion | Agnes-3.0-Flash: BF16 (66,2 GB). Qwen3.8-27B TURBO: NVFP4 W4A16 (20,6 GB, cuantizacion modelopt FP4) |
| Idiomas soportados | en |
| Licencia | apache-2.0 para el repositorio de benchmark; Agnes-3.0-Flash se distribuye bajo Apache-2.0; licencia del checkpoint cuantizado Qwen3.8-27B TURBO NVFP4: no disponible |
| Formato de pesos | no disponible; el repositorio no publica pesos. Agnes-3.0-Flash incluye `serve.sh` y `sglang_patch/`; el checkpoint NVFP4 se distribuye como checkpoint cuantizado con cabecera MTP nativa |
| Motor de servido medido | Agnes-3.0-Flash: SGLang 0.5.19 + parche del checkpoint. Qwen3.8-27B TURBO: vLLM 0.27.1 + backport de decodificacion GDN (PR upstream #41966) |
| Cache KV | fp8 (Agnes con `fp8_e4m3`, 335 517 tokens asignados; Qwen con `--kv-cache-dtype fp8`) |
| Decodificacion especulativa | Agnes: NEXTN, steps=3, draft tokens=4 (+79 % en C1). Qwen: cabecera MTP nativa, n=1, 98-99 % de aceptacion |
| Plataforma de referencia | 1x RTX PRO 6000 Blackwell Max-Q Workstation Edition, 96 GB (97 887 MiB), TP1, driver 595.91.07, CUDA 13.0, 24 nucleos de CPU, 128 GB de RAM |
| Entradas multimodales | Agnes-3.0-Flash: texto + imagen + video. Qwen3.8-27B TURBO: texto + imagen |

## Arquitectura y entrenamiento

La informacion disponible no documenta el proceso de entrenamiento de ninguno de los dos checkpoints (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si se detalla es la arquitectura de inferencia: ambos son modelos de atencion hibrida que combinan un mecanismo de regla delta con estado recurrente (Gated-DeltaNet, con `mamba_ssm_dtype: float32` en Agnes) y capas de atencion global intercaladas cada cuatro capas (`global_attention_interval: 4`). Agnes-3.0-Flash tiene 72 capas, 24 cabezas de consulta y 4 cabezas KV con head_dim 256, y reserva 10,12 GB para el estado SSM ademas de la cache KV.

La parte tecnica mas relevante del benchmark es la fontaneria necesaria para servirlos. Para Agnes se aplica un parche de tres archivos sobre SGLang 0.5.19 que registra una clase de configuracion para `model_type: agnes` y reasigna pesos dentro de `sglang/srt/models/qwen3_5.py` (`delta_attn` hacia `linear_attn`, `global_attn` hacia `self_attn`, y `mlp.parallel_ffn.*` plegado en las proyecciones principales); tras el parche, el motor registra el modelo como `Qwen3_5ForConditionalGeneration`. Para el checkpoint NVFP4 se usa vLLM 0.27.1 con un backport del PR #41966 que anade `_fi_decode` y un resolvedor de backend con el flag `--gdn-decode-backend` (exige CUDA 13 o superior y cae a triton en caso contrario), ademas de precargar `tvm_ffi` para evitar el conflicto de registro de `__ffi_repr__` entre el JIT de FlashInfer y tilelang.

## Capacidades

- Generacion de texto con razonamiento extenso encontexto de hasta 262 144 tokens en ambos checkpoints.
- Llamada a herramientas validada contra esquema: Agnes con `--tool-call-parser auto` y Qwen con `--enable-auto-tool-choice --tool-call-parser qwen3_xml`.
- Vision: ambos checkpoints aceptan entrada de imagen.
- Video: solo Agnes-3.0-Flash admite entrada de video, que requiere `ffmpeg` (libavutil para torchcodec) en el contenedor.
- Control del esfuerzo de razonamiento: Agnes expone `reasoning_effort` en niveles low y medium (el nivel high devuelve HTTP 400); Qwen expone `enable_thinking` on/off.
- Decodificacion especulativa integrada: NEXTN en Agnes y cabecera MTP nativa en Qwen.
- Ejecucion de codigo verificable: el benchmark evalua el codigo generado ejecutandolo, no solo comparando cadenas.
- Multilingue: no disponible; el unico idioma declarado es en.

## Casos de uso

- Dimensionamiento de infraestructura de inferencia: el repositorio permite decidir si compensa servir 66,2 GB en BF16 o 20,6 GB en NVFP4 sobre una tarjeta de 96 GB, comparando 41,8 frente a 110,5 tok/s en C1 con la misma ventana de 262 144 tokens.
- Eleccion de motor para arquitecturas hibridas: sirve de guia practica para reproducir el parche de SGLang sobre `qwen3_5.py` o el backport de decodificacion Gated-DeltaNet en vLLM 0.27.1, incluidas las dependencias que suelen faltar en contenedores minimos (`python3-dev`, `ninja-build`, `ffmpeg`).
- Planificacion de decodificacion especulativa: las barridas de NEXTN (23,3 tok/s sin especulacion, 37,2 con steps=1/draft=2, 41,8 con steps=3/draft=4 y 37,5 con steps=5/draft=6) permiten fijar una configuracion con datos medidos en lugar de por defecto.
- Analisis de video con descripcion textual: Agnes-3.0-Flash puede ingerir video ademas de imagen, lo que habilita resumen automatico de clips, indexacion de archivos audiovisuales o generacion de subtitulos descriptivos.
- Asistentes con razonamiento de varios pasos y herramientas: los parsers de tool calling de ambos checkpoints permiten encadenar llamadas a funciones con validacion de esquema, apto para agentes que consultan APIs o bases de datos.
- Evaluacion de coste por token: la comparativa de tokens generados por tarea (2 601 en Agnes frente a 3 745 en Qwen) y de tiempo de reloj (1,56x mas rapido en razonamiento largo y ~2,6x en salidas cortas) es directamente util para presupuestar facturas de inferencia.
- Capacidad de despliegue en una sola GPU: el benchmark demuestra que ambos checkpoints caben en TP1 con `--mem-fraction-static 0.90` y `--gpu-memory-utilization 0.90`, util para entornos sin interconexion NVLink.

## Benchmarks y rendimiento

Metricas de decodificacion (greedy, `ignore_eos`, prompt de conteo de 900 tokens; metodo de dos puntos para C1 y 4 peticiones concurrentes de 400 tokens para C4):

| Modelo | C1 (tok/s) | C4 agregado (tok/s) |
|---|---|---|
| Agnes-3.0-Flash BF16 + NEXTN (steps=3, draft=4) | 41,8 | 144,3 |
| Qwen3.8-27B TURBO NVFP4 + MTP (n=1) | 110,5 | 365,0 |

Calidad en tareas duras (4 tareas, evaluadas de forma objetiva):

| Metrica | Agnes-3.0-Flash | Qwen3.8-27B TURBO NVFP4 |
|---|---|---|
| Tareas superadas | 4/4 | 4/4 |
| Tokens generados | 2 601 | 3 745 |
| Tiempo total (s) | 56,5 | 36,2 |
| Ventaja de reloj a igual calidad | — | 1,56x en razonamiento largo y ~2,6x en salidas cortas |

Barrido de decodificacion especulativa NEXTN en Agnes-3.0-Flash:

| Configuracion | C1 (tok/s) |
|---|---|
| Sin especulacion | 23,3 |
| steps=1, draft=2 | 37,2 |
| steps=3, draft=4 | 41,8 |
| steps=5, draft=6 | 37,5 |

Longitud de aceptacion observada: 1,9-2,5 tokens por paso, sin perdida de calidad. En Qwen, la cabecera MTP nativa con n=1 alcanza un 98-99 % de aceptacion. El autor reporta que activar MTP con TP=2 sobre una maquina PCIe de dos GPU degrada el rendimiento a 52,2 tok/s frente a 124,0 sin MTP (-58 %), por lo que recomienda usar `--speculative-config` solo con TP=1.

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K y similares) en la informacion disponible.

## Requisitos de hardware

- Plataforma medida: una unica NVIDIA RTX PRO 6000 Blackwell Max-Q Workstation Edition con 96 GB (97 887 MiB), en TP1, con driver 595.91.07 y toolkit CUDA 13.0.
- CPU y memoria del sistema: 24 nucleos y 128 GB de RAM.
- Agnes-3.0-Flash en BF16: 66,2 GB de pesos, 10,12 GB de estado SSM y cache KV asignada de 335 517 tokens en fp8; el arranque carga los pesos en unos 40 segundos, pero el primer arranque tarda 2-4 minutos por la compilacion JIT de FlashInfer y las CUDA graphs.
- Qwen3.8-27B TURBO NVFP4: 20,6 GB de pesos en W4A16, con `--max-num-seqs 32` y utilizacion de memoria de GPU de 0,90.
- GPU consumer: no disponible. No se aportan mediciones en tarjetas de 24 o 32 GB, y NVFP4 requiere hardware Blackwell para aprovechar su ruta nativa.
- Despliegue: SGLang 0.5.19 con el parche del checkpoint para Agnes; vLLM 0.27.1 con el backport del PR #41966 para Qwen. Versiones de referencia: torch 2.13.0+cu130, triton 3.8.0 (3.7.1 en la rama SGLang), transformers 5.17.0 (5.12.1) y FlashInfer 0.6.18.dev20260819 con cubin y cache JIT para cu130.
- Throughput y latencia: 41,8 tok/s en C1 y 144,3 tok/s en C4 para Agnes; 110,5 tok/s en C1 y 365,0 tok/s en C4 para Qwen NVFP4. No se publican cifras de latencia por token, solo tasas de decodificacion.
- Opciones de despliegue adicionales (llama.cpp, Ollama, TGI): no disponible, no se han probado en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se limita a los dos checkpoints medidos, ya que no se aportan datos de terceros alternativos:

| Criterio | Agnes-3.0-Flash | Qwen3.8-27B TURBO NVFP4 |
|---|---|---|
| Parametros | 33,09 B | ~27 B |
| Precision y peso | BF16, 66,2 GB | NVFP4 W4A16, 20,6 GB |
| Contexto servido | 262 144 | 262 144 |
| Decodificacion C1 / C4 | 41,8 / 144,3 tok/s | 110,5 / 365,0 tok/s |
| Calidad en tareas duras | 4/4, 2 601 tokens, 56,5 s | 4/4, 3 745 tokens, 36,2 s |
| Modalidades | Texto, imagen y video | Texto e imagen |
| Control de esfuerzo | `reasoning_effort` low/medium (high devuelve 400) | `enable_thinking` on/off |
| Decodificacion especulativa | NEXTN steps=3, draft=4 (+79 % en C1) | Cabecera MTP nativa, n=1, 98-99 % de aceptacion |
| Motor de servido | SGLang 0.5.19 + parche propio | vLLM 0.27.1 + backport del PR #41966 |
| Licencia | Apache-2.0 | no disponible |

## Limitaciones y advertencias

- El repositorio es un benchmark, no un modelo desplegable: no contiene pesos ni pipeline de inferencia propios.
- Todas las cifras provienen de una unica maquina, una unica GPU y una unica configuracion de servido; no hay replicacion independiente ni revision por pares, y el repositorio registra 0 descargas y 0 me gusta en el momento de redactar esta ficha.
- El conjunto de pruebas de calidad se reduce a cuatro tareas duras, y ambos modelos obtienen la misma puntuacion, por lo que no permiten discriminar calidad entre ellos.
- El autor advierte de que los numeros son mediciones, no estimaciones, y anima a reproducirlos o refutarlos; la tabla de decodificacion aparece truncada en la informacion disponible (la cifra de Qwen se toma del resumen TL;DR).
- Agnes-3.0-Flash exige `--trust-remote-code` y un parche de tres archivos sobre SGLang; sin el parche, el modelo no se carga correctamente.
- El checkpoint NVFP4 requiere un backport de vLLM (PR #41966) y CUDA 13 o superior; en su ausencia cae a triton. Ademas, para checkpoints `modelopt_fp4` los modulos `mtp.*` deben figurar en `exclude_modules` de la cuantizacion, o vLLM falla con una asercion en `load_merged_column_weight`.
- La decodificacion especulativa MTP no debe activarse con TP mayor que 1: la medicion en una maquina PCIe de dos GPU muestra una caida del 58 % (52,2 frente a 124,0 tok/s).
- En Agnes, solicitar `reasoning_effort: high` devuelve un error HTTP 400; solo estan soportados low y medium.
- El unico idioma declarado es ingles; el rendimiento en castellano no esta documentado.
- La entrada de video en Agnes depende de `ffmpeg` y de libavutil para torchcodec; su ausencia rompe esa modalidad.
- Uno de los checkpoints comparados se distribuye bajo etiquetas de "uncensored" y "heretic"; conviene revisar politica de contenido y condiciones de uso antes de llevarlo a produccion.
- La licencia del checkpoint cuantizado NVFP4 no se indica en la informacion disponible, por lo que no puede confirmarse su aptitud para uso comercial.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de seguridad de ninguno de los dos modelos.

## Enlaces

- Repositorio del benchmark: https://huggingface.co/deluxetiky/agnes-vs-qwen38-benchmark
- Checkpoint Agnes-3.0-Flash: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Checkpoint cuantizado NVFP4: https://huggingface.co/SeatownSin/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-W4A16
- Modelo base de la cuantizacion: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Pull request de vLLM para la decodificacion Gated-DeltaNet: PR #41966 de vLLM (referenciado en la model card; no se proporciona URL directa)
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este repositorio.
