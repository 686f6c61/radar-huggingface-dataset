# esatapedico/Gemma-4-31B-IT-NVFP4-GGUF

## Resumen

Gemma-4-31B-IT-NVFP4-GGUF es una familia de cinco archivos GGUF derivados del checkpoint oficial `nvidia/Gemma-4-31B-IT-NVFP4`, un modelo denso de 31B de parametros (30.697.345.956 exactos) afinado para instrucciones por NVIDIA. El trabajo de este repositorio, publicado por el usuario `esatapedico`, se limita a la conversion numerica: transformar el checkpoint NVFP4 original a formato GGUF preservando los tensores NVFP4 nativos y construir una escalera de precision sobre los tensores que mas afectan a la calidad de salida y la velocidad de decodificacion.

El modelo subyacente tiene 60 bloques de atencion y una ventana de contexto nativa de 262.144 tokens. La cuantizacion NVFP4 es W4A16 (pesos de 4 bits, escalas de bloque en FP8, tamano de grupo 16) y esta pensada para ejecutarse de forma nativa en GPUs Blackwell (sm_120). El modelo es solo de texto: no incluye torre de vision, ni `mmproj`, ni drafter MTP.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 31B con contexto de 262K en hardware de consumo relativamente modesto (dos GPUs de 16 GB con tensor split, o descarga parcial a CPU), ofreciendo cinco perfiles de tamano entre 17,29 GB y 23,55 GB. La licencia declarada en todos los archivos es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (60 bloques de atencion), cuantizacion NVFP4 nativa (W4A16) |
| Parametros totales | 30.697.345.956 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | NVFP4 (backbone), Q4_K, Q6_K, Q8_0, BF16 (segun tier) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (5 archivos, 1.193 tensores cada uno) |

Detalle de los cinco archivos:

| Archivo | Tamano (GB decimales) | `token_embd` | Atencion (230 tensores) | Backbone |
|---|---|---|---|---|
| `Gemma-4-31B-IT-NVFP4-LOW.gguf` | 17,29 | `Q4_K` | `NVFP4` | `NVFP4` 410 |
| `Gemma-4-31B-IT-NVFP4-MEDIUM.gguf` | 17,65 | `Q6_K` | `NVFP4` | `NVFP4` 410 |
| `Gemma-4-31B-IT-NVFP4-MID-HIGH.gguf` | 17,99 | `Q8_0` | `NVFP4` | `NVFP4` 410 |
| `Gemma-4-31B-IT-NVFP4-HIGH.gguf` | 19,31 | `BF16` | `NVFP4` | `NVFP4` 410 |
| `Gemma-4-31B-IT-NVFP4-HIGHEST.gguf` | 23,55 | `BF16` | `Q8_0` | `NVFP4` 180 + `Q8_0` 230 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 31B con 60 bloques de atencion y contexto nativo de 262.144 tokens, afinado para instrucciones por NVIDIA. La cuantizacion NVFP4 del checkpoint original emplea pesos de 4 bits con escalas de bloque en FP8 y tamano de grupo 16 (W4A16), disenada para ejecucion nativa en GPUs Blackwell (sm_120). Los embeddings estan atados (tied embeddings), por lo que `token_embd` es el unico tensor de cabeza.

La contribucion de este repositorio es exclusivamente de numerica. El proceso documentado consistio en: (1) convertir el checkpoint NVFP4 oficial a GGUF con `--outtype auto`, preservando los tensores NVFP4 nativos de extremo a extremo; (2) verificar el censo de tensores NVFP4 (410 tensores de backbone en LOW–HIGH); (3) construir cada tier sobre el backbone compartido, variando solo la precision de la cabeza de embeddings (LOW–HIGH) o la precision de atencion mas las cabezas (HIGHEST); y (4) verificar los conteos de tensores por tier y la identidad del backbone, parcheando los KV del GGUF para nombre, descripcion y licencia sin alterar los datos de los tensores.

Cuatro tiers (LOW, MEDIUM, MID-HIGH, HIGH) comparten un backbone NVFP4 byte a byte identico de 410 tensores (180 de feed-forward y 230 de atencion); solo difieren en la precision de `token_embd`. HIGHEST es el unico tier que modifica el backbone: la atencion pasa de NVFP4 a Q8_0 (230 tensores). No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni si hubo RLHF/DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat de NVIDIA Gemma intacta en todos los archivos.
- Razonamiento y matematicas: el harness de evaluacion reporta resultados en MMLU-1000 y GSM8K-200, lo que confirma capacidad de razonamiento y resolucion de problemas matematicos.
- Modo "thinking" (razonamiento extendido): GSM8K se evaluo con thinking activado; MMLU con thinking desactivado.
- Seguimiento de instrucciones: IFEval parseo 30/30 en todos los tiers en ambas ejecuciones.
- Contexto largo: ventana nativa de 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Solo texto: no hay torre de vision, ni `mmproj`, ni drafter MTP.
- No se dispone de informacion sobre soporte de tool calling / function calling, agentes o multi-step reasoning en la informacion proporcionada.
- Multilingue: limitado a ingles segun los metadatos del repositorio.

## Casos de uso

- Analisis de documentos largos: con 262.144 tokens de contexto nativo, el modelo puede ingerir contratos, informes tecnicos o bases de codigo completas en una sola pasada, sin necesidad de chunking ni recuperacion externa.
- Asistente conversacional de contexto extendido: la plantilla de chat de NVIDIA Gemma intacta y el contexto de 262K permiten mantener conversaciones multi-turno con historial extenso, adecuado para soporte tecnico especializado.
- Razonamiento matematico y resolucion de problemas: el modo thinking y los resultados medidos en GSM8K lo hacen util para tareas de calculo, verificacion de derivaciones y explicacion paso a paso.
- Despliegue en hardware de consumo: los tiers LOW a MID-HIGH (17,29–17,99 GB) caben en dos GPUs de 16 GB con tensor split o con descarga parcial a CPU, lo que permite ejecutar un modelo de 31B en estaciones de trabajo con GPUs Blackwell de gama consumer.
- Evaluacion comparativa de tecnicas de cuantizacion: la escalera de cinco tiers con backbone identico permite aislar el efecto de la precision de embeddings y de atencion sobre la calidad y la velocidad, util para investigacion en cuantizacion.
- Generacion de texto en ingles con requisitos de fidelidad alta: el tier HIGHEST (atencion Q8_0, 23,55 GB) esta pensado para escenarios donde la maxima fidelidad numerica prima sobre la velocidad, como la generacion de contenido tecnico o la evaluacion de modelos.
- Prototipado e inferencia local con llama.cpp: la compatibilidad con `llama.cpp` y la cuantizacion NVFP4 nativa en Blackwell permiten desplegar el modelo en entornos locales sin infraestructura de servidor dedicada.

## Benchmarks y rendimiento

Resultados del harness `bench_suite --tier gate --stages Q` sobre dos GPUs Blackwell de 16 GB, con KV cache por defecto del servidor. MMLU-1000 (semilla 42, letter-logprob, thinking off, contexto 8192, un slot) y GSM8K-200 (generativo, thinking on). La escalera completa se ejecuto el 2026-10-29/30 y se repitio el 2026-11-12; MMLU y PPL se reprodujeron al item en los cinco tiers. GSM8K es generativo y varia ±3 items entre ejecuciones, por lo que se reportan ambos valores.

| Tier | MMLU-1000 | GSM8K-200 (ejecucion 1 / 2) | IFEval |
|---|---|---|---|
| LOW | no disponible en el extracto | no disponible en el extracto | 30/30 |
| MEDIUM | no disponible en el extracto | no disponible en el extracto | 30/30 |
| MID-HIGH | no disponible en el extracto | no disponible en el extracto | 30/30 |
| HIGH | 78,08% | no disponible en el extracto | 30/30 |
| HIGHEST | 76,34% | valor ultimo medido (timeout en ambas ejecuciones, ~2,8 tok/s) | 30/30 |

Notas: HIGHEST es el unico tier cuyo stage Q agoto el tiempo en GSM8K en ambas ejecuciones (spill-slow a ~2,8 tok/s); su cifra de GSM8K es el ultimo valor medido. GPQA y KLD-vs-anchor no se midieron. El autor advierte que los cinco tiers caen dentro de una banda de ±~1 pp de jitter, por lo que el orden no es firme; HIGH es la eleccion por precision y HIGHEST la de maxima fidelidad numerica, sin ventaja medible en precision de tarea.

Prueba de humo: prompt `What is a black hole?` con muestreo de un solo turno (temp 0,8, semilla 42, 220 tokens); los cinco tiers producen una completion coherente y natural sin repeticion.

## Requisitos de hardware

- VRAM estimada: los tiers LOW a MID-HIGH (17,29–17,99 GB) requieren dos GPUs de 16 GB con tensor split o descarga parcial a CPU. HIGH (19,31 GB) necesita el mismo esquema. HIGHEST (23,55 GB) requiere aproximadamente 22 GiB de VRAM mas el KV cache.
- GPUs recomendadas: GPUs NVIDIA Blackwell (sm_120) para ejecucion nativa de NVFP4. El autor ejecuto las pruebas en dos GPUs Blackwell de 16 GB.
- Cabe en GPU consumer: si, en GPUs Blackwell consumer de 16 GB en configuracion de dos unidades con tensor split, o con offload parcial a CPU.
- Opciones de despliegue: `llama.cpp` (formato GGUF, libreria declarada). El repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: HIGHEST reporta ~2,8 tok/s en el stage Q de GSM8K bajo condicion de spill-slow. No se dispone de cifras de throughput para el resto de tiers en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-31B-IT-NVFP4-GGUF (este) | 30,7B denso | 262.144 | NVFP4 + Q4_K/Q6_K/Q8_0/BF16 | Apache 2.0 | GGUF en HF |
| nvidia/Gemma-4-31B-IT-NVFP4 (base) | 30,7B denso | 262.144 | NVFP4 | Apache 2.0 | Checkpoint en HF |
| Otros modelos de 31B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos de la misma categoria en la documentacion proporcionada. La comparativa natural es con el checkpoint oficial de NVIDIA del que deriva, que comparte arquitectura, parametros, contexto y licencia, y del que este repositorio se diferencia unicamente por el formato GGUF y la escalera de precision.

## Limitaciones y advertencias

- Solo ingles: los metadatos declaran exclusivamente `en`; no se garantiza calidad en otros idiomas.
- Solo texto: sin torre de vision, sin `mmproj` y sin drafter MTP; no admite entradas de imagen ni audio.
- Dependencia de hardware Blackwell: la cuantizacion NVFP4 esta disenada para ejecucion nativa en sm_120; en otras arquitecturas el rendimiento puede degradarse o requerir emulacion.
- Requisito de VRAM: incluso el tier mas pequeno necesita dos GPUs de 16 GB o descarga parcial a CPU; no cabe en una unica GPU consumer de 16 GB.
- Jitter en benchmarks: el autor advierte que los cinco tiers caen en una banda de ±~1 pp en MMLU, por lo que las diferencias de precision entre tiers no son concluyentes.
- HIGHEST no lidera en precision de tarea: pese a ser el tier de maxima fidelidad numerica, su MMLU (76,34%) es el mas bajo de los cinco, y su GSM8K agoto el tiempo en ambas ejecuciones.
- Riesgo de alucinacion: no se dispone de datos especificos sobre tasas de alucinacion en la informacion proporcionada; aplica el riesgo general de los modelos generativos.
- Sesgos: no se dispone de informacion sobre sesgos conocidos del modelo base en la documentacion proporcionada.
- Licencia: Apache 2.0 declarada en todos los archivos, lo que permite uso comercial; conviene verificar las condiciones del checkpoint base de NVIDIA.
- GPQA y KLD-vs-anchor no se midieron, por lo que la evaluacion de conocimiento cientifico y la divergencia respecto al ancla quedan sin cubrir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/Gemma-4-31B-IT-NVFP4-GGUF
- Modelo base: https://huggingface.co/nvidia/Gemma-4-31B-IT-NVFP4
- Sitio del autor: https://www.esatapedico.com
