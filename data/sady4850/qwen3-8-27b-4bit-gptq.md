# sady4850/Qwen3.8-27B-4bit-GPTQ

## Resumen

Qwen3.8-27B-4bit-GPTQ es una cuantizacion de 4 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario sady4850 (redirigida posteriormente a mlx-community/Qwen3.8-27B-GPTQ-4bit). No se trata de un modelo original sino de un checkpoint derivado: mantiene exactamente la estructura, formas, dtypes y configuracion del template oficial mlx-community/Qwen3.8-27B-4bit (MLX affine 4-bit, group size 64), pero sustituye los codigos, escalas y sesgos de redondeo simple (RTN) de cada capa Linear cuantizada del modelo de lenguaje por los obtenidos mediante GPTQ.

El modelo base Qwen3.8-27B es un transformer multimodal de tipo image-text-to-text con 27.356.728.560 parametros (segun safetensors), desarrollado por el equipo Qwen de Alibaba. Esta version cuantizada ocupa 15 GB y esta pensada para inferencia en Apple Silicon mediante mlx-vlm, mlx-lm o Splash. Su relevancia actual radica en que reduce el error de cuantizacion respecto al checkpoint RTN equivalente sin aumentar el tamano ni penalizar la velocidad, lo que la convierte en sustituto directo (drop-in replacement) en cualquier pipeline que ya cargue el template de 4 bits.

La ficha se centra en las caracteristicas verificables del checkpoint cuantizado y de su model card. Los datos sobre el modelo base que no aparecen en la informacion proporcionada se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion usa ventanas de 2048 tokens) |
| Tipos de cuantizacion | 4-bit MLX affine, group size 64, con GPTQ en las capas Linear del LM (497 Linears, 64 capas incl. lm_head); embedding y vision tower sin recuantizar |
| Idiomas soportados | no disponible (calibracion en ingles: UltraChat y calibration_v5) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria mlx) |
| Tamano del repo | 16.1 GB (checkpoint de 15 GB) |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion GPTQ aplicada sobre el modelo base Qwen3.8-27B, que es un transformer multimodal (procesa imagen y texto). La model card no detalla la arquitectura interna del base (numero de capas, atencion, etc.), solo que la cuantizacion afecta a 64 capas y a 497 capas Linear, incluyendo lm_head; el embedding y la torre de vision se conservan del template sin recuantizar.

El proceso de cuantizacion es el siguiente: se calculan las matrices de Hessian a partir del modelo en bf16, una por cada entrada compartida, con damping de 0.01 y tamano de bloque 128. GPTQ se adapta al formato affine propio de MLX: la escala y el sesgo de cada grupo se calculan a partir de los pesos actualizados por el error y se redondean a bf16 antes de la codificacion, de modo que el resultado se desquantiza exactamente como esta escrito. La calibracion emplea 119 fragmentos de 2048 tokens: 64 fragmentos de conversaciones de entrenamiento de UltraChat (con plantilla de chat aplicada) y 55 fragmentos de texto de calibration_v5. No hay informacion sobre el entrenamiento original del modelo base (tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque la vision no fue evaluada en este checkpoint.
- Uso como agente de codigo: la model card incluye una prueba de reproduccion de agente (agent replay) con 78 turnos de una sesion real de agente de programacion, con contextos de 32K a 124K tokens, midiendo llamadas a herramientas y similitud de argumentos.
- Tool calling / function calling: inferido del agent replay, que compara llamadas y herramientas identicas frente a Q8_0.
- Inferencia en Apple Silicon mediante mlx-vlm, mlx-lm y Splash.
- Sustituto directo del template mlx-community/Qwen3.8-27B-4bit con el mismo tamano y velocidad.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint de 15 GB encaja en equipos con memoria unificada suficiente y se ejecuta con mlx-vlm o mlx-lm, ofreciendo una alternativa de 4 bits al modelo en bf16.
- Agentes de programacion en local: el agent replay con 78 turnos y contextos de hasta 124K tokens demuestra que el modelo mantiene llamadas a herramientas coherentes (44% de llamadas identicas a Q8_0, 83% de herramientas identicas, similitud de argumentos 0.92), lo que lo hace util en asistentes de codigo que operan sobre repositorios.
- Sustitucion directa en pipelines existentes: al compartir tensores, formas, dtypes y config con el template, se puede cambiar el repo id en Splash o mlx-vlm sin modificar el codigo ni el resto del stack.
- Evaluacion de calidad de cuantizacion: sirve como referencia para comparar GPTQ frente a RTN y GGUF en tareas de proximidad al bf16 (KLD, flips top-1).
- Prototipado de asistentes multimodales en local: el pipeline image-text-to-text permite experimentar con entrada de imagen y texto, aunque la calidad de vision no esta validada en este checkpoint.
- Despliegue con restricciones de memoria: 15 GB permiten cargar el modelo en equipos donde el bf16 no cabe, manteniendo una fidelidad superior al RTN de 4 bits.

## Benchmarks y rendimiento

Los datos disponibles son metricas de fidelidad de cuantizacion (KLD, flips, PPL) y de reproduccion de agente, no benchmarks de tareas estandar (MMLU, HumanEval, GSM8K). Se presentan tal cual, sin inventar cifras.

Evaluacion en torch (A100), ambos checkpoints desquantizados al mismo modelo bf16:

| Texto | Modelo | KLD media | KLD mediana | KLD p99 | Flips | PPL |
|---|---|---|---|---|---|---|
| wiki | bf16 | - | - | - | - | 6.370 |
| wiki | RTN 4-bit | 0.0562 | 0.0230 | 0.440 | 9.57% | 6.486 |
| wiki | GPTQ (este repo) | 0.0369 | 0.0122 | 0.315 | 7.37% | 6.475 |
| chat | bf16 | - | - | - | - | 8.692 |
| chat | RTN 4-bit | 0.1800 | 0.0312 | 3.233 | 13.13% | 8.109 |
| chat | GPTQ (este repo) | 0.0975 | 0.0127 | 1.743 | 9.05% | 8.752 |

Evaluacion en Splash (teacher-logits, KV int8, M1 Pro):

| Texto | Modelo | KLD media | KLD mediana | KLD p99 | Flips | PPL |
|---|---|---|---|---|---|---|
| wiki | bf16 | - | - | - | - | 6.364 |
| wiki | RTN 4-bit | 0.0562 | 0.0221 | 0.469 | 9.58% | 6.479 |
| wiki | GPTQ (este repo) | 0.0399 | 0.0119 | 0.326 | 7.49% | 6.458 |
| chat | bf16 | - | - | - | - | 8.717 |
| chat | RTN 4-bit | 0.1906 | 0.0327 | 2.724 | 13.13% | 8.141 |
| chat | GPTQ (este repo) | 0.1002 | 0.0128 | 1.577 | 9.05% | 8.706 |

Agent replay (78 turnos, contexto 32K-124K, temperatura 0, Splash 1.4.0-m1 en M2 Max, comparado con Q8_0):

| Modelo | Llamadas identicas | Herramientas identicas | Similitud de argumentos | Llamadas rotas |
|---|---|---|---|---|
| RTN 4-bit | 31% | 79% | 0.88 | 0 |
| GPTQ (este repo) | 44% | 83% | 0.92 | 0 |

Velocidad en Splash: 14.10 s de prefill por ventana de 2048 tokens (igual que el template); 23.00 s frente a 23.05 s para 127 ciclos de verificacion.

Comparativa de cuantizaciones en Splash (mismas ventanas y referencia bf16):

| Modelo | Tamano | KLD wiki | KLD chat | KLD chat p99 | 127 ciclos |
|---|---|---|---|---|---|
| unsloth/Qwen3.8-27B-GGUF:UD-Q4_K_M | 16.5 GB | 0.0144 | 0.0831 | 1.353 | 25.60 s |
| GPTQ (este repo) | 15 GB | 0.0399 | 0.1002 | 1.577 | 23.00 s |
| unsloth/Qwen3.8-27B-GGUF:Q4_0 | 16.1 GB | 0.0325 | 0.1412 | 2.493 | 24.40 s |
| RTN 4-bit | 15 GB | 0.0562 | 0.1906 | 2.724 | 23.05 s |
| ISTA-DASLab IQ3_S | 11.8 GB | 0.0573 | 0.2121 | 3.427 | 29.40 s |

## Requisitos de hardware

- Memoria: el checkpoint ocupa 15 GB (repo de 16.1 GB); se necesita memoria unificada o VRAM suficiente para cargar los pesos mas el contexto y el estado de inferencia.
- Plataforma objetivo: Apple Silicon (MLX). La model card documenta pruebas en M1 Pro (Splash) y M2 Max (agent replay).
- GPU: no se documentan requisitos para CUDA; la evaluacion en torch se hizo en A100 pero solo para desquantizar y medir, no como despliegue objetivo.
- Despliegue: mlx-vlm, mlx-lm y Splash. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia: 14.10 s de prefill por ventana de 2048 tokens en M1 Pro con Splash; 23.00 s para 127 ciclos de verificacion.
- No hay datos de throughput (tokens/s) ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad frente a bf16 (KLD chat) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (GPTQ 4-bit MLX) | 27.36B | no disponible | 0.1002 | apache-2.0 | Hugging Face, MLX |
| mlx-community/Qwen3.8-27B-4bit (RTN) | 27.36B | no disponible | 0.1906 | apache-2.0 | Hugging Face, MLX |
| unsloth/Qwen3.8-27B-GGUF:UD-Q4_K_M | 27B | no disponible | 0.0831 | no disponible | Hugging Face, GGUF |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF:IQ3_S | 27B | no disponible | 0.2121 | no disponible | Hugging Face, GGUF |

## Limitaciones y advertencias

- La vision no fue evaluada: todas las pruebas son solo de lenguaje, pese a que el pipeline declarado es image-text-to-text.
- La calibracion es en ingles (UltraChat y texto de calibration_v5); el comportamiento en otros idiomas no esta verificado.
- Las ventanas de KLD son de 2048 tokens; no se evalua el comportamiento en contextos largos mas alla del agent replay.
- No se midio precision en tareas (task accuracy); los datos de KLD y flips no equivalen a rendimiento en benchmarks.
- El PPL aislado es una mala medida de fidelidad: el checkpoint RTN tiene menor PPL de chat que el propio bf16, por lo que deben usarse KLD y flips.
- El agent replay se basa en 78 turnos, una muestra pequena; el propio autor lo advierte.
- La licencia apache-2.0 se hereda del modelo base, pero conviene verificar las condiciones del modelo Qwen original para uso comercial.
- Este checkpoint no es un modelo original: su calidad depende enteramente del modelo base Qwen3.8-27B y de la calibracion empleada.

## Enlaces

- Hugging Face: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Template MLX 4-bit: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Splash (repositorio): https://github.com/paperniuk/splash
- Discusion del agent replay en Splash: https://github.com/paperniuk/splash/discussions/34#discussioncomment-19226461
- Perfil del autor: https://huggingface.co/sady4850
