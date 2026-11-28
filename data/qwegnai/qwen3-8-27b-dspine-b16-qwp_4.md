# qwegnai/Qwen3.8-27B-DSpine-b16-QWP_4

## Resumen

Qwen3.8-27B-DSpine-b16-QWP_4 es un paquete de pesos cuantizados del modelo drafter DSpine-b16 de Tencent, publicado por el usuario qwegnai para su uso exclusivo con el motor de inferencia Qwegn, un runtime escrito en Swift y Metal 4 para Apple Silicon. No se trata de un modelo generativo autonomo, sino de un modelo borrador (draft model) de 2.030 millones de parametros disenado para acelerar la decodificacion especulativa del modelo objetivo Qwen3.8-27B, prediciendo bloques de hasta 16 tokens que el modelo grande verifica en una sola pasada.

La relevancia de este paquete reside en su formato: emplea el contenedor propietario QWP1 de Qwegn y pesos cuantizados en HQ4_G32_M5 (6,61 bits por parametro) con capas en BF16, lo que reduce el peso del drafter a 1,56 GiB. Segun la model card, sobre un Apple M5 Max con 128 GB de memoria unificada alcanza 100,5 tok/s de media geometrica en decodificacion especulativa (3,09x respecto a la decodificacion serie) y hasta 148,0 tok/s en el mejor caso, manteniendo una paridad codiciosa bit a bit del 100% con la salida del modelo objetivo sin especulacion.

El modelo esta liberado bajo licencia Apache 2.0, pero su utilidad practica esta completamente ligada al ecosistema Qwegn: no es un checkpoint safetensors, GGUF ni MLX, y no puede cargarse en vLLM, llama.cpp, Ollama ni en otras herramientas convencionales. Para desarrolladores fuera de Apple Silicon o fuera del motor Qwegn, su interes es fundamentalmente documental o de referencia sobre tecnicas de decodificacion especulativa con drafters de bloque causal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter DSpine de 5 capas con bloque causal (block-causal), decodificador GQA con fusion de caracteristicas del modelo objetivo, puente de codigo de prefijo seleccionado y cola de refinamiento serie con topK = 16 |
| Parametros totales | 2,03 B (2.030 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana deslizante nativa de 8.192 tokens en el drafter (`max_position_embeddings = 262.144`); genera bloques de 2 a 16 tokens para el modelo objetivo |
| Tipos de cuantizacion | HQ4_G32_M5 (6,61 bits/parametro) combinado con BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QWP1 (contenedor nativo de Qwegn); no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

DSpine (arXiv:2609.36173) es un drafter de difusion de bloque causal que, a diferencia de los drafters de difusion de bloque no causales, propaga las representaciones predichas de posiciones predecesoras a medida que avanza la profundidad de generacion. Esta propagacion permite sostener tasas de aceptacion altas hasta bloques de 16 tokens (15 borradores por ronda). El modelo consta de cinco capas con 5.120 dimensiones ocultas, 17.408 dimensiones intermedias SwiGLU, atencion GQA con 32 cabezas de consulta y 8 de clave/valor (head_dim = 128), QK-RMSNorm y rope_theta = 10.000.000.

El drafter consume caracteristicas ocultas extraidas de las capas [1, 16, 31, 46, 61] del modelo objetivo Qwen3.8-27B y las fusiona de 5 x 5.120 a 5.120 mediante una capa densa mas normalizacion. Incorpora un puente de codigo de prefijo seleccionado con un codebook BF16 de 248.320 x 1.024 y rango 512, con recurrencia condicionada por compuertas, y una cola de refinamiento serie de segunda pasada con tabla de puntuaciones topK = 16 ejecutada integramente en GPU. La verificacion en el modelo objetivo admite bloques B de 2 a 16 con D de 1 a 15 borradores por ronda, usando despachos HQ4/AQ4 emparejados por filas y puntos de control QWGDNReplayCheckpoint de 16 filas para el rollback de Gated-DeltaNet.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La model card solo referencia el paper arXiv:2609.36173 como fuente del metodo.

## Capacidades

- Prediccion de bloques de tokens (2 a 16 por ronda) para acelerar la decodificacion del modelo objetivo Qwen3.8-27B mediante decodificacion especulativa.
- Verificacion con paridad codiciosa bit a bit (identidad SHA-256 del flujo de tokens) respecto a la decodificacion serie del objetivo.
- Fusion de caracteristicas ocultas de cinco capas del modelo objetivo para condicionar los borradores.
- Refinamiento serie exacto con topK = 16 en GPU para corregir los borradores antes de la verificacion.
- Soporte de ventana deslizante de 8.192 tokens en su propia cache KV.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de pensamiento por si mismo: es un componente auxiliar de inferencia, no un modelo de proposito general.
- Capacidades multilingues: no disponibles; el drafter hereda implicitamente la distribucion del objetivo, pero no se documenta nada al respecto.

## Casos de uso

- Aceleracion de inferencia local en Apple Silicon: desplegar Qwen3.8-27B con Qwegn y este drafter para multiplicar por 3,09 el throughput de decodificacion en un M5 Max, pasando de 32,1-32,9 tok/s en serie a 100,5 tok/s de media geometrica.
- Servicio de streaming de baja latencia: con 144,1 tok/s en modo servidor y TTFT en cache caliente de 7 a 29,3 ms, es adecuado para asistentes interactivos donde la percepcion de fluidez depende del tiempo hasta el primer token y del ritmo de generacion.
- Generacion de codigo de algoritmo en produccion: el perfil medido para codigo de algoritmos es de 93,9 tok/s (2,86x), lo que lo hace util en pipelines de generacion de codigo con verificacion del objetivo, manteniendo exactitud bit a bit en modo codicioso.
- Procesamiento de prosa tecnica y documentacion: 83,3 tok/s (2,54x) en prosa tecnica, adecuado para resumenes y redaccion asistida de documentos largos donde la ventana de 8.192 tokens del drafter cubre los fragmentos habituales.
- Evaluacion de tecnicas de decodificacion especulativa: sirve como referencia reproducible para investigar drafters de bloque causal, con perfiles medidos para B = 6, 8 y 16 y tasas de aceptacion del 83,3% al 92,4%.
- Despliegue en equipos con memoria unificada grande: el paquete de 1,56 GiB deja margen para el modelo objetivo y la cache KV en configuraciones de 128 GB, permitiendo ejecutar el par completo en una sola maquina sin GPU dedicada.
- Pruebas de regresion de motores de inferencia: la paridad SHA-256 bit a bit con la salida serie permite usarlo como oraculo de verificacion en tests de motores que implementen decodificacion especulativa.

## Benchmarks y rendimiento

Datos medidos en Apple M5 Max (Mac17,6, 128 GB de memoria unificada, GPU de 40 nucleos, 585 GB/s), macOS 26 o superior, con `llmprobe v0.6.16-v0.6.17`, `--kv-mode q4 --temperature 0`, contra el objetivo `qwegnai/Qwen3.8-27B-QWP_4`.

| Metrica | Resultado |
|---|---|
| Decodificacion serie del objetivo (referencia) | 32,1-32,9 tok/s |
| Decodificacion especulativa, pico (B = 8-16) | 148,0 tok/s (144,1 tok/s en servidor; 4,19x serie; 7,47 tokens aceptados por ronda; 92,4% de aceptacion) |
| Decodificacion especulativa, por defecto (B = 6, 5 borradores, media geometrica de 3 cargas) | 100,5 tok/s (3,09x serie) |
| Codigo de algoritmos (B = 6) | 93,9 tok/s (2,86x) |
| Prosa tecnica (B = 6) | 83,3 tok/s (2,54x) |
| Horizonte maximo de bloque (B = 16, 15 borradores) | 118,5 tok/s (12,70 tokens aceptados por ronda; 83,3% de aceptacion) |
| Prefill / TTFT en frio / TTFT con cache caliente | 1.043 tok/s a 4K (801 en servidor; 850-914 a 10K-64K) / 94 ms / 7-29,3 ms (2,23M-2,33M tok/s a 65,5K) |
| Razonamiento central / evaluacion de codigo | 8/10 (80%) / 9/10 en Code-10 |
| Paridad codiciosa frente al objetivo serie (B = 6-16) | 100% de identidad SHA-256 bit a bit |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las cifras anteriores son medidas de rendimiento del sistema de decodificacion especulativa, no de calidad del modelo en tareas de conocimiento.

## Requisitos de hardware

- VRAM o memoria unificada: el paquete ocupa 1,56 GiB; debe sumarse la memoria del modelo objetivo Qwen3.8-27B cuantizado y la cache KV en modo q4.
- Hardware validado: Apple M5 Max con 128 GB de memoria unificada y GPU de 40 nucleos, bajo macOS 26 o superior. No hay datos de rendimiento para otros chips.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles; el runtime Qwegn esta orientado a Apple Silicon y Metal 4, por lo que este paquete no se ejecuta en CUDA.
- Opciones de despliegue: exclusivamente el motor Qwegn (repositorio github.com/qwegnai/qwegn). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: 100,5 tok/s de media geometrica con la configuracion por defecto (`--mtp-drafts 5`), 144,1 tok/s en servidor con `--mtp-drafts 7` y 118,5 tok/s con `--mtp-drafts 15`; prefill de 1.043 tok/s a 4K y TTFT en frio de 94 ms.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros drafters de decodificacion especulativa en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A continuacion se comparan las caracteristicas estructurales conocidas.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DSpine-b16-QWP_4 (este paquete) | 2,03 B | 8.192 (ventana deslizante) | QWP1 | Apache 2.0 | Solo motor Qwegn en Apple Silicon |
| tencent/Qwen3.8-27B-DSpine-b16 (modelo base) | 2,03 B | No disponible | No disponible | No disponible | Hugging Face |
| qwegnai/Qwen3.8-27B-QWP_4 (modelo objetivo) | 27 B (aproximado por el nombre) | No disponible | QWP1 | No disponible | Solo motor Qwegn |

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera respuestas utiles por si solo, solo borradores que el modelo objetivo debe verificar. Usarlo sin Qwen3.8-27B no tiene sentido practico.
- Dependencia total del runtime Qwegn y del contenedor QWP1: no hay conversion documentada a safetensors, GGUF ni MLX, lo que impide su uso en el ecosistema habitual de inferencia.
- Plataforma restringida a Apple Silicon con Metal 4 y macOS 26 o superior; sin soporte CUDA ni ROCm documentado.
- Los rendimientos publicados dependen del dominio del prompt, el tamano de bloque y las condiciones termicas; la propia model card advierte que los resultados varian.
- La paridad bit a bit del 100% se ha verificado solo en modo codicioso (`--temperature 0`); no se documenta el comportamiento con muestreo estocastico.
- La ventana del drafter es de 8.192 tokens, muy inferior a la del modelo objetivo; en contextos largos la aceleracion puede degradarse, aunque la informacion no cuantifica esa perdida.
- No hay informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad del drafter; al heredar el comportamiento del objetivo, los sesgos de este se propagan.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion independiente por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el uso practico queda condicionado por la licencia y disponibilidad del modelo objetivo y del motor Qwegn.

## Enlaces

- Hugging Face: https://huggingface.co/qwegnai/Qwen3.8-27B-DSpine-b16-QWP_4
- Modelo base: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Modelo objetivo: https://huggingface.co/qwegnai/Qwen3.8-27B-QWP_4
- Motor Qwegn: https://github.com/qwegnai/qwegn
- Paper DSpine: https://arxiv.org/abs/2609.36173
