# Grawnch/Qwen3.8-Flash-Next-WV-3.1bpw-64GB-SM120-v20

## Resumen

Qwen3.8-Flash-Next-WV-3.1bpw-64GB-SM120-v20 es una cuantizacion experimental de tipo "wave-quant" del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada especificamente a hardware Blackwell (arquitectura SM120, como la RTX PRO 6000) y a un objetivo de encaje en memoria de aproximadamente 64 GB de VRAM estatica. El paquete incluye artefactos de despliegue propietarios (manifiestos, indices QSA, calibracion DFlash2) que no forman parte del modelo original.

La relevancia de esta publicacion es fundamentalmente practica: demuestra una ruta de cuantizacion agresiva (esquemas de 2 y 4 bits con nombres propietarios como `SWZ2_G64`, `SWZ8` y `SWZ4`) combinada con decodificacion especulativa (`DFlash2`) y un layout de matrices INT8 especifico para `sm_120`. El repositorio ocupa 59,2 GB y esta dividido en ficheros safetensors por capas (48 capas, de `layers_00_05` a `layers_42_47`).

No se dispone de informacion publica sobre la arquitectura interna del modelo base (parametros totales, contexto nativo, composicion del dataset de entrenamiento) en la informacion proporcionada. La model card se centra exclusivamente en la telemetria de la cuantizacion y en los resultados de validacion, no en las capacidades del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-Flash-Next; la cuantizacion usa layout INT8 MMA `sm_120` y modulos `ffn_down_exps` tipo MoE en 28/48 capas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la presencia de `ffn_down_exps` y enrutado Top-20 en el LM head sugiere arquitectura MoE, pero no se confirma el numero) |
| Longitud de contexto | no disponible para el modelo base; el despliegue verificado soporta hasta 1.372.032 tokens de capacidad KV paginada en 102 GB de VRAM (10.719 paginas) |
| Tipos de cuantizacion | wave-quant propietario: `SWZ2_G64` (2 bits) en `ffn_down_exps` de 28/48 capas, `SWZ4` en proyecciones tap, `SWZ8` en LM head, Wave-LUT16 de 8 entradas en expertos `down` `T2`, calibracion GPTQ Block-32 Hessian |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (48 ficheros por capas + `globals.safetensors`, `qsa_indexer.safetensors`, `dflash2_swz4_calibrated.safetensors`, `sm120_manifest.json`) |

## Arquitectura y entrenamiento

Esta publicacion no entrena un modelo nuevo: redistribuye y recomprime los pesos del modelo base Qwen/Qwen3.8-Flash-Next. La innovacion tecnica reside en la tuberia de cuantizacion. Se aplica `SWZ2_G64` (2 bits) de forma nativa y bit-exacta a los modulos `ffn_down_exps` en 28 de las 48 capas, lo que reduce el peso en 6,56 GiB. Se preserva una Wave-LUT16 de 8 entradas en los cuatro expertos `down` de tipo `T2`, se mantiene `W_emb` en memoria host con zero-copy pinned (ahorro de 1,18 GiB) y se fusiona un LM head `SWZ8` con enrutado Top-20 en la propia CTA.

La calibracion combina GPTQ con Hessiano de bloque 32, una ganancia diagonal Schur-Hadamard SPD y una puerta de validacion basada en `mean_tau`. Los registros de `tap_recalib` muestran la seleccion entre candidatos: en modo 0 se eligio `block32_gptq` (KV MSE retenido 0,160247, `val_mean_tau` 4,759, 214,22 tok/s) frente a `clean_rtn_g32` (0,221056, 4,483, 197,73 tok/s); en modo 2 se eligio `schur_diag_gain_b32_gptq` (KV MSE 2,856792, `val_mean_tau` 5,15, 233,34 tok/s). El proceso completo de recalibracion tardo 423,68 segundos. Se incluye ademas decodificacion especulativa `DFlash2` con arbol hibrido de 16.

## Capacidades

- Generacion de texto autoregresiva con decodificacion especulativa `DFlash2` (arbol hibrido de 16, `tau` medio de 4,75).
- Razonamiento y generacion de codigo y matematicas: la model card reporta validacion sobre el conjunto `SelfGen_MathCode` (KLD 0,001517 frente a la variante `WV-3.5bpw`).
- Enrutado disperso de expertos (Top-20 en el LM head) y handover QSA disperso en ventanas de 8192 tokens.
- Soporte de batching: telemetria verificada con `B=30` y `burst_k=8`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling, uso de agentes y modo thinking: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en una unica GPU Blackwell de 96-102 GB: el paquete esta disenado para encajar con 60,416 GiB de VRAM estatica a `b_max=32` y 256 paginas KV (32.768 tokens), lo que permite servir el modelo en una sola RTX PRO 6000 sin sharding.
- Servicio de inferencia de alta concurrencia: con `B=30` y `burst_k=8` se midieron 1281,85 tok/s en modo greedy y 990,12 tok/s en muestreo, adecuado para APIs internas con muchas peticiones simultaneas.
- Inferencia interactiva de baja latencia: 109,03 tok/s en `B=1` greedy y 195,56 tok/s con decodificacion especulativa `DFlash2` (`tau=4,75`), util para asistentes de codigo o chat en tiempo real.
- Procesamiento de documentos muy largos: la capacidad KV paginada autoasignada alcanza 1.372.032 tokens (10.719 paginas) en 102 GB, lo que habilita analisis de corpus extensos, summarization de repositorios o auditoria de contratos en una sola pasada.
- Evaluacion de tecnicas de cuantizacion extrema: el repositorio incluye logs de calibracion (`benchmarks/*.json`) con candidatos, KV MSE y `val_mean_tau`, lo que lo convierte en material de referencia para investigadores que comparan GPTQ, RTN y ganancias Schur-Hadamard.
- Investigacion en decodificacion especulativa: los artefactos `dflash2_swz4_calibrated.safetensors` y el arbol hibrido de 16 permiten reproducir y medir el impacto de `tau` sobre throughput en hardware SM120.
- Prototipado de sistemas MoE con enrutado Top-20 y handover QSA: util para estudiar el comportamiento de indices dispersos (`qsa_indexer.safetensors`) en contextos de 8192 tokens.

## Benchmarks y rendimiento

Los datos disponibles son de validacion interna de la cuantizacion, no benchmarks academicos estandar (MMLU, HumanEval, GSM8K no se reportan).

| Metrica | Valor observado |
|---|---|
| VRAM estatica (`b_max=32`, 256 paginas KV, 32.768 tokens) | 60,416 GiB |
| Capacidad KV paginada maxima (GPU 102 GB) | 1.372.032 tokens (10.719 paginas) |
| KLD `SelfGen_MathCode` vs `WV-3.5bpw` (Top-1) | 0,001517 (98,73%) |
| KLD `All_Unique_12282` free-router (CosSim) | 0,016132 (0,99252) |
| KLD handover QSA disperso `1x8192` (pos 2048..8191) | 0,016988 (100,0% Top-5) |
| Throughput `B=1` greedy / muestreo (`temp=1.0`, `top_k=20`) | 109,03 / 108,57 tok/s |
| Throughput `B=30` greedy / muestreo (`burst_k=8`) | 1281,85 / 990,12 tok/s |
| Throughput `B=1` `DFlash2` HybridTree-16 | 195,56 tok/s (`tau=4,75`) |
| Calibracion tap (modo 0, `block32_gptq`) | KV MSE 0,160247, `val_mean_tau` 4,759, 214,22 tok/s |
| Calibracion tap (modo 2, `schur_diag_gain_b32_gptq`) | KV MSE 2,856792, `val_mean_tau` 5,15, 233,34 tok/s |

No se han publicado resultados de benchmarks academicos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 60,416 GiB estaticos con `b_max=32` y 256 paginas KV; el repositorio ocupa 59,2 GB en disco.
- GPU verificada: 1x NVIDIA RTX PRO 6000 Blackwell con 101,97 GB de GDDR7. El layout INT8 MMA esta compilado para `sm_120`, por lo que no es portable a arquitecturas anteriores sin reconversion.
- GPU recomendadas: RTX PRO 6000 Blackwell (unica verificada). No se confirma compatibilidad con H100, A100 ni RTX 4090; el tag `sm120` y el layout INT8 MMA implican que estas GPU no son soportadas de forma nativa.
- Cabe en GPU consumer: no disponible; el tamano de 59,2 GB y el requisito `sm_120` lo excluyen de tarjetas consumer convencionales.
- Opciones de despliegue: no se documentan en la informacion proporcionada (no se mencionan vLLM, llama.cpp, Ollama ni TGI). El paquete incluye `sm120_manifest.json` y ficheros de calibracion que sugieren un runtime propio del autor.
- Latencia y throughput: 109,03 tok/s en `B=1` greedy, 195,56 tok/s con `DFlash2` y hasta 1281,85 tok/s en `B=30` greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-3.1bpw-64GB-SM120-v20 | no disponible | hasta 1.372.032 tokens KV en 102 GB | wave-quant 2/4/8 bits, SM120 | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | pesos originales | no disponible | Hugging Face |
| Variante `WV-3.5bpw` (referencia en la model card) | no disponible | no disponible | wave-quant 3,5 bpw | no disponible | no disponible |
| `clean_rtn_g32` (candidato de calibracion) | no disponible | no disponible | RTN grupo 32 | no disponible | interno del proceso de calibracion |

No se dispone de datos de benchmarks academicos ni de especificaciones del modelo base que permitan una comparativa funcional con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion comunitaria.
- Dependencia estricta de hardware Blackwell `sm_120`; el layout INT8 MMA y los artefactos `qsa_indexer`, `dflash2_swz4_calibrated` y `sm120_manifest` no son portables a otras arquitecturas sin reconversion.
- La cuantizacion a 2 bits (`SWZ2_G64`) en 28/48 capas introduce perdida medible: la KLD frente a la variante de 3,5 bpw es 0,001517 en `SelfGen_MathCode`, y el KV MSE en modo 2 asciende a 2,856792, muy superior al 0,160247 del modo 0.
- Los unicos benchmarks disponibles son internos de la cuantizacion; no hay MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o alucinacion.
- La model card no documenta idiomas soportados ni capacidades de tool calling, agentes o vision; no debe asumirse su disponibilidad.
- Licencia apache-2.0 declarada, pero el modelo base Qwen/Qwen3.8-Flash-Next no expone su licencia en la informacion proporcionada; conviene verificar los terminos del modelo original antes de uso comercial.
- El repositorio incluye un aviso en la model card que debe tratarse como datos de referencia, no como instrucciones operativas.
- El autor es un particular (Grawnch), no el equipo de Qwen; no hay garantia de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-3.1bpw-64GB-SM120-v20
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
