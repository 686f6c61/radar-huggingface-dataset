# sady4850/Qwen3.8-27B-4bit-GPTQ

## Resumen

`sady4850/Qwen3.8-27B-4bit-GPTQ` es una cuantizacion de 4 bits del modelo multimodal `Qwen/Qwen3.8-27B`, publicada por el usuario sady4850. No se trata de un modelo nuevo, sino de un checkpoint derivado que sustituye los codigos de redondeo simple (round-to-nearest, RTN) del cuantizado de referencia `mlx-community/Qwen3.8-27B-4bit` por codigos calculados con GPTQ, manteniendo exactamente la misma estructura de tensores, formas, dtypes y configuracion. El resultado es un reemplazo directo (drop-in) en las herramientas que cargan el template original (mlx-vlm, mlx-lm, Splash), con el mismo tamano (15 GB) y la misma velocidad.

El modelo base es un transformer multimodal de Qwen con 27.356.728.560 parametros (27,36 mil millones) orientado a tareas image-text-to-text, es decir, con capacidad de procesar imagenes y texto de forma conjunta. La cuantizacion afecta a 497 capas Lineales del modelo de lenguaje (las 64 capas, incluida `lm_head`), mientras que el embedding y la torre de vision se conservan del template original. El objetivo es reducir la degradacion respecto al modelo en bf16 sin aumentar el peso ni el coste computacional del 4-bit.

La relevancia de esta ficha radica en que documenta una practica creciente: la publicacion de cuantizaciones optimizadas sobre checkpoints ya cuantizados, con evaluaciones de fidelidad (KLD, flips) y de comportamiento agéntico. El autor proporciona mediciones comparativas frente a RTN, GGUF y otros formatos, lo que permite evaluar el compromiso entre calidad y coste de despliegue en hardware Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), modelo base Qwen3.8-27B; cuantizacion MLX affine 4-bit con group size 64 |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion usa ventanas de 2048 tokens; el replay agéntico cubre contextos de 32K a 124K) |
| Tipos de cuantizacion | 4-bit GPTQ (formato affine de MLX, group size 64); comparado con RTN 4-bit, GGUF UD-Q4_K_M, Q4_0 e IQ3_S |
| Idiomas soportados | no disponible (la calibracion es en ingles: UltraChat y calibration_v5) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria mlx); repo de 16,1 GB, checkpoint de 15 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Qwen con 27,36 mil millones de parametros, que combina un modelo de lenguaje con una torre de vision para tareas image-text-to-text. La cuantizacion publicada no modifica la arquitectura: mantiene las 64 capas, el embedding y la torre de vision del template `mlx-community/Qwen3.8-27B-4bit`. Lo que cambia es el contenido numerico de los tensores de 4 bits: 497 capas Lineales del modelo de lenguaje (incluida `lm_head`) se recuantizan con GPTQ en lugar de con redondeo al vecino mas cercano.

El proceso de GPTQ se adapta al formato affine propio de MLX: para cada grupo, la escala y el sesgo se calculan a partir de los pesos actualizados por el error y se redondean a bf16 antes de la codificacion, de modo que el resultado se desquantiza exactamente como esta escrito. Las matrices de Hessian se obtienen del modelo en bf16, una por entrada compartida, con amortiguamiento (damp) de 0,01 y bloque de 128. La calibracion emplea 119 fragmentos de 2048 tokens: 64 fragmentos de conversaciones de entrenamiento de UltraChat (con la plantilla de chat aplicada) y 55 fragmentos de texto de calibration_v5. No se documenta en la informacion disponible si el modelo base fue entrenado con RLHF, DPO u otras tecnicas, ni el volumen total de tokens de entrenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text); la torre de vision se conserva del template original.
- Razonamiento y codigo: el replay agéntico documentado corresponde a una sesion real de agente de programacion, con llamadas a herramientas y argumentos.
- Soporte de tool calling / function calling: el modelo base lo hereda; la evaluacion mide llamadas a herramientas identicas a Q8_0, coincidencia de herramientas y similitud de argumentos.
- Comportamiento agéntico multi-paso: se evalua en contextos de 32K a 124K tokens con 78 turnos registrados.
- Capacidades multilingues: no disponibles en la informacion proporcionada; la calibracion es en ingles.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de programacion en local sobre Apple Silicon: el checkpoint esta pensado para Splash y mlx-vlm, y el replay agéntico documentado (78 turnos de una sesion real de coding-agent, contextos de 32K a 124K) demuestra su uso en flujos de edicion de codigo con llamadas a herramientas. Es adecuado porque mantiene la velocidad del template RTN con mayor fidelidad al bf16.
- Asistente conversacional con contexto largo: la ventana de contexto del modelo base permite conversaciones multi-turno extensas; la cuantizacion de 15 GB reduce el consumo de memoria en equipos con memoria unificada limitada.
- Analisis de imagenes y documentos: al conservar la torre de vision, puede emplearse en tareas image-text-to-text como descripcion de imagenes o respuesta a preguntas sobre contenido visual, aunque el autor no evaluo la vision.
- Despliegue en estaciones de trabajo Mac: con mlx-vlm o Splash, el modelo cabe en equipos con 16-32 GB de memoria unificada, lo que permite inferencia local sin GPU dedicada.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye metricas de KLD, flips y perplejidad frente a RTN y GGUF, util para investigadores que comparan metodos de cuantizacion en el ecosistema MLX.
- Prototipado de pipelines multimodales: al ser un reemplazo directo del template `mlx-community/Qwen3.8-27B-4bit`, se puede integrar en codigo existente cambiando solo el identificador del repositorio.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad frente al modelo en bf16, no benchmarks de tareas estandar (MMLU, HumanEval, GSM8K). Se reproducen a continuacion los datos disponibles.

Calidad frente a bf16 con torch en A100 (checkpoints desquantizados al mismo modelo bf16):

| Texto | Modelo | KLD media | KLD mediana | KLD p99 | Flips | PPL |
|---|---|---|---|---|---|---|
| wiki | bf16 | - | - | - | - | 6,370 |
| wiki | RTN 4-bit | 0,0562 | 0,0230 | 0,440 | 9,57 % | 6,486 |
| wiki | GPTQ (este repo) | 0,0369 | 0,0122 | 0,315 | 7,37 % | 6,475 |
| chat | bf16 | - | - | - | - | 8,692 |
| chat | RTN 4-bit | 0,1800 | 0,0312 | 3,233 | 13,13 % | 8,109 |
| chat | GPTQ (este repo) | 0,0975 | 0,0127 | 1,743 | 9,05 % | 8,752 |

Calidad con Splash (teacher-logits, KV int8, M1 Pro):

| Texto | Modelo | KLD media | KLD mediana | KLD p99 | Flips | PPL |
|---|---|---|---|---|---|---|
| wiki | bf16 | - | - | - | - | 6,364 |
| wiki | RTN 4-bit | 0,0562 | 0,0221 | 0,469 | 9,58 % | 6,479 |
| wiki | GPTQ (este repo) | 0,0399 | 0,0119 | 0,326 | 7,49 % | 6,458 |
| chat | bf16 | - | - | - | - | 8,717 |
| chat | RTN 4-bit | 0,1906 | 0,0327 | 2,724 | 13,13 % | 8,141 |
| chat | GPTQ (este repo) | 0,1002 | 0,0128 | 1,577 | 9,05 % | 8,706 |

Replay agéntico (78 turnos de una sesion real de coding-agent, contexto de 32K a 124K, temperatura 0, Splash 1.4.0-m1 en M2 Max, comparado con Q8_0):

| Modelo | Llamadas identicas | Herramientas identicas | Similitud de argumentos | Llamadas rotas |
|---|---|---|---|---|
| RTN 4-bit | 31 % | 79 % | 0,88 | 0 |
| GPTQ (este repo) | 44 % | 83 % | 0,92 | 0 |

Comparativa de cuantizaciones en Splash (mismas ventanas y referencia bf16):

| Modelo | Tamano | KLD wiki | KLD chat | KLD chat p99 | 127 ciclos de verificacion |
|---|---|---|---|---|---|
| unsloth/Qwen3.8-27B-GGUF:UD-Q4_K_M | 16,5 GB | 0,0144 | 0,0831 | 1,353 | 25,60 s |
| GPTQ (este repo) | 15 GB | 0,0399 | 0,1002 | 1,577 | 23,00 s |
| unsloth/Qwen3.8-27B-GGUF:Q4_0 | 16,1 GB | 0,0325 | 0,1412 | 2,493 | 24,40 s |
| RTN 4-bit (mlx-community) | 15 GB | 0,0562 | 0,1906 | 2,724 | 23,05 s |
| ISTA-DASLab/Qwen3.8-27B-GGUF:IQ3_S | 11,8 GB | 0,0573 | 0,2121 | 3,427 | 29,40 s |

Velocidad en Splash: mediana de 14,10 s de prefill por ventana de 2048 tokens para ambos checkpoints; 23,00 s frente a 23,05 s en 127 ciclos de verificacion.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 15 GB (repo de 16,1 GB), por lo que se necesita al menos ese espacio mas el overhead de la aplicacion; en la practica, equipos con 16 GB de memoria unificada quedan muy justos y se recomiendan 24-32 GB o mas.
- GPU recomendadas: el autor evalua en A100 (con torch) y en M1 Pro y M2 Max (con Splash); no se documentan pruebas en GPUs de consumo tipo RTX 4090.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada; el formato MLX esta orientado a Apple Silicon, por lo que en GPUs NVIDIA seria necesario convertir o usar otro formato (por ejemplo, GGUF).
- Opciones de despliegue: mlx-vlm (`python -m mlx_vlm.generate`), mlx-lm y Splash. Para GGUF existen alternativas del mismo modelo base publicadas por unsloth e ISTA-DASLab.
- Latencia y throughput: en Splash, prefill mediano de 14,10 s por ventana de 2048 tokens y 23,00 s para 127 ciclos de verificacion; velocidad equivalente al template RTN.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD chat (Splash) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GPTQ (este repo) | 27,36 mil millones | no disponible | 0,1002 | 15 GB | apache-2.0 | Hugging Face |
| mlx-community/Qwen3.8-27B-4bit (RTN) | 27,36 mil millones | no disponible | 0,1906 | 15 GB | apache-2.0 | Hugging Face |
| unsloth/Qwen3.8-27B-GGUF:UD-Q4_K_M | 27,36 mil millones | no disponible | 0,0831 | 16,5 GB | apache-2.0 | Hugging Face |
| unsloth/Qwen3.8-27B-GGUF:Q4_0 | 27,36 mil millones | no disponible | 0,1412 | 16,1 GB | apache-2.0 | Hugging Face |
| ISTA-DASLab/Qwen3.8-27B-GGUF:IQ3_S | 27,36 mil millones | no disponible | 0,2121 | 11,8 GB | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- La vision no fue evaluada: todas las pruebas son solo de lenguaje, por lo que el rendimiento multimodal del checkpoint no esta verificado.
- La calibracion es en ingles (UltraChat y calibration_v5), lo que puede penalizar el rendimiento en otros idiomas.
- Las ventanas de evaluacion de KLD son de 2048 tokens; el comportamiento en contextos mucho mas largos no se mide con KLD, aunque el replay agéntico cubre hasta 124K.
- No se midio la precision en tareas (task accuracy); las metricas disponibles son de fidelidad (KLD, flips, PPL).
- La perplejidad por si sola no es una buena medida de cercania: el checkpoint RTN tiene menor PPL de chat que el propio bf16, por lo que deben priorizarse KLD y flips.
- El replay agéntico se basa en 78 turnos, una muestra pequena; el autor lo reconoce.
- Licencia apache-2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8-27B y el cumplimiento de sus terminos.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; son heredados del modelo base.
- El checkpoint esta en formato MLX y depende de mlx-vlm, mlx-lm o Splash; no es directamente utilizable en ecosistemas NVIDIA sin conversion.

## Enlaces

- Hugging Face: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Template MLX 4-bit: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Splash (repositorio): https://github.com/paperniuk/splash
- Discusion de Splash con el replay agéntico: https://github.com/paperniuk/splash/discussions/34#discussioncomment-19226461
- Perfil del autor del replay: https://github.com/ghisguth
- Cuantizacion GGUF alternativa: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantizacion IQ3_S alternativa: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
