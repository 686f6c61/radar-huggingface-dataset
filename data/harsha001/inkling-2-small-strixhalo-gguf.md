# Harsha001/Inkling-2-Small-StrixHalo-GGUF

## Resumen

Inkling-2-Small-StrixHalo-GGUF es una cuantización comunitaria del modelo Inkling 2 Small de Thinking Machines, publicada por el usuario Harsha001. El objetivo es hacer viable un modelo de mezcla de expertos (MoE) de gran tamano en una maquina AMD Strix Halo con 128 GB de memoria unificada, partiendo de un repositorio original de 366 GiB y comprimiéndolo hasta 92 GiB (98,5 GB). Para ello se combinan dos tecnicas agresivas: poda de expertos (se conservan 307 de los 384 por capa) y cuantización extrema de los expertos restantes a IQ1_S, mientras el resto de componentes (atención, router, convoluciones cortas) se mantiene en Q8_0 o F32.

El modelo base es un transformer MoE con 475.977.614.712 parametros totales y 384 expertos por capa, de los cuales 8 se activan por token. La ficha del autor indica que el original tiene 594B de parametros, una discrepancia que conviene tener en cuenta. Esta version elimina ademas el codificador de vision y el drafter de prediccion multi-token del original, por lo que es exclusivamente texto.

La relevancia de esta publicacion es doble: por un lado, demuestra que es posible ejecutar un MoE de casi 500.000 millones de parametros en hardware de consumo profesional con memoria unificada; por otro, documenta con transparencia el coste en calidad de cada decision de compresion, incluyendo perplejidad, divergencia KL y coincidencia de token superior frente a la referencia. Es una primera version de prueba, no oficial, con soporte limitado de backend y sin parser del formato de mensajes de Inkling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos por capa (8 activos por token), convoluciones cortas y sesgo de posicion relativa |
| Parametros totales | 475.977.614.712 |
| Parametros activos | no disponible (8 de 384 expertos por token; el autor no publica el conteo activo) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | IQ1_S para expertos enrutados; Q8_0 o F32 para atencion, router y convoluciones; Q6_K para embeddings y capa de salida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tres partes: 46,0 GB + 45,8 GB + 6,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 384 expertos por capa y enrutamiento disperso de 8 expertos por token. Incorpora convoluciones cortas y un sesgo de posicion relativa en lugar de attention flash en esta build. El repositorio original incluia un codificador de vision y un drafter de prediccion multi-token, ambos ausentes en esta cuantizacion. Los expertos del original estan almacenados en NVFP4 con escala por experto, que aqui se conserva como tensor `.scale` separado y se aplica en tiempo de ejecucion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. Lo que si esta documentado es el proceso de compresion: los expertos se ordenaron por frecuencia de enrutamiento sobre 71.000 tokens de texto de calibracion (`calibration_datav3`), conservando 307 de 384 por capa, lo que retiene el 97% de los tokens enrutados. La matriz de importancia se genero sobre el GGUF de referencia con el mismo texto de calibracion. El autor comparo cuatro builds alternativos de tamano similar y concluyo que podar expertos penaliza mas que reducir bits, de ahi la eleccion de IQ1_S con mas expertos frente a IQ1_M o IQ2_XXS con menos.

## Capacidades

- Generacion de texto en ingles: continuaciones coherentes verificadas con decodificacion greedy (ciudades de Alemania con descripciones correctas).
- Razonamiento aritmetico basico: resolvio 17 x 23 = 391 comprobando 23 x 10 + 23 x 7.
- Generacion de codigo: planifico una version iterativa de Fibonacci, aunque no completo la respuesta dentro del limite de 300 tokens de la prueba.
- Modo de pensamiento: el modelo emite marcadores propios (`<|content_thinking|>`, `<|end_message|>`) que no se separan del texto de respuesta en esta build.
- Tool calling: el modelo base lo soporta previsiblemente, pero esta build no lo parsea; llama.cpp carece de parser del formato de mensajes de Inkling.
- Uso como agente: no operativo en esta version por la ausencia de parser de tool calls.
- Vision: no incluida (codificador eliminado).
- Multilingue: no disponible; las pruebas de calidad se hicieron solo con texto general en ingles.

## Casos de uso

- Experimentacion con MoE de gran escala en hardware unificado: permite cargar un modelo de casi 500.000 millones de parametros en una maquina Strix Halo de 128 GB, algo imposible con el repositorio original de 366 GiB. Adecuado para laboratorios que quieran estudiar comportamiento de MoE sin clústeres multi-GPU.
- Evaluacion de tecnicas de poda de expertos: el repositorio incluye `keep-experts-E307.json` con los expertos conservados por capa, lo que facilita reproducir o comparar estrategias de pruning (frecuencia de enrutamiento frente a REAP) sobre el mismo modelo base.
- Generacion de texto offline en estaciones de trabajo AMD: con el backend ROCmFPX compilado con Vulkan, se puede servir texto con `llama-server` en entornos sin GPU NVIDIA, utiles para prototipos y demos locales.
- Investigacion sobre el impacto de la cuantizacion extrema: las metricas publicadas (perplejidad 5,08 frente a 3,52 de la referencia, KL 0,36, 79,7% de coincidencia de token superior) sirven como caso de estudio de cuanto degrada IQ1_S a un MoE grande.
- Chat conversacional simple: la prueba de chat con aritmetica funciona, por lo que puede usarse para conversacion de un solo turno en ingles mientras no se requieran tool calls ni separacion del razonamiento.
- Benchmarking de backends en Strix Halo: el autor pide reportes de velocidad en Vulkan y ROCm, de modo que el modelo sirve como carga de prueba para medir throughput y latencia de llama.cpp en esa plataforma.

## Benchmarks y rendimiento

| Build | Tamano | Perplejidad | KL a referencia | Mismo token superior |
|---|---:|---:|---:|---:|
| Pesos originales (expertos NVFP4, referencia) | 366 GiB | 3,52 | — | — |
| Este repo: IQ1_S, 307 expertos por capa | 92 GiB | 5,08 | 0,36 | 79,7% |
| IQ1_M gate/up + IQ2_XXS down, 259 expertos | ~92 GiB | no disponible | 0,37 | 79,2% |
| IQ1_M, 275 expertos | ~92 GiB | no disponible | 0,37 | 78,7% |
| IQ2_XXS, 233 expertos | ~92 GiB | no disponible | 0,39 | 79,0% |
| IQ1_M con expertos por REAP, 275 expertos | ~92 GiB | no disponible | 0,51 | 75,7% |
| IQ1_M con los 384 expertos | 126 GiB | no disponible | 0,23 | no disponible |

Medicion con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2 en ingles, en CPU. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria: el autor indica que el conjunto de tres partes ocupa 92 GiB y esta pensado para una maquina Strix Halo con 128 GB de memoria unificada; se recomienda configurar el reparto de BIOS para que la GPU acceda a unos 110 GiB, ya que HIP/ROCm solo asigna desde la parte dedicada y un reparto 64/64 es insuficiente.
- GPU: AMD Strix Halo (memoria unificada de 128 GB). No se ha probado en Vulkan ni en ROCm segun el autor; el backend CUDA dio resultados incorrectos con batching.
- GPU de consumo: no cabe en ninguna GPU consumer con VRAM dedicada (RTX 4090, 24 GB; RTX 5090, 32 GB). Solo es viable en plataformas con memoria unificada grande.
- Despliegue: requiere ROCmFPX `main` (desde el 15 de noviembre de 2026) compilado con Vulkan; ninguna otra build de llama.cpp reconoce la arquitectura `inkling2`. Ejemplo: `llama-server -m IQ1_S-E307/Inkling-2-Small-StrixHalo-IQ1_S-E307-00001-of-00003.gguf -ngl 99 -c 8192 --jinja`.
- Contexto: empezar con contexto pequeno y subirlo con cuidado, porque esta version usa atencion no flash con sesgo de posicion relativa, lo que consume mas memoria y tiempo en prompts largos.
- Latencia y throughput: no disponibles; solo se ha ejecutado en CPU y el autor solicita reportes de velocidad en la comunidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small-StrixHalo-GGUF (este) | 475.977.614.712 totales, 8/384 expertos activos | no disponible | IQ1_S + Q8_0/Q6_K, 92 GiB | Apache 2.0 | Hugging Face, 245 descargas |
| thinkingmachines/Inkling-2-Small (base) | 475.977.614.712 (ficha del autor: 594B) | no disponible | NVFP4, 366 GiB | Apache 2.0 | Hugging Face |
| IQ1_M con los 384 expertos (variante descartada) | mismos parametros | no disponible | IQ1_M, 126 GiB | Apache 2.0 | no disponible como repo independiente |
| Otras alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de otros desarrolladores en la documentacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad sustancial: perplejidad 5,08 frente a 3,52 de la referencia y solo 79,7% de coincidencia de token superior; el autor califica la perdida como grande (aproximadamente 1,3 bits por peso y un 20% de expertos eliminados).
- Poda de expertos irreversible: los 77 expertos eliminados por capa no se pueden recuperar; el archivo `keep-experts-E307.json` documenta la seleccion pero no restaura el modelo.
- Sin vision ni prediccion multi-token: el codificador visual y el drafter del original no estan incluidos.
- Formato de mensajes sin parsear: llama.cpp no interpreta los marcadores de Inkling, por lo que el razonamiento no se separa de la respuesta y las tool calls no se procesan; el uso como agente no es viable en esta version.
- Soporte de backend incompleto: solo la ruta CPU se ha validado contra el modelo PyTorch original (coincidencia de aproximadamente 1e-5 en un modelo pequeno, tokenizador identico); Vulkan y ROCm no se han probado y el backend CUDA fallo con batching.
- Dependencia de un fork concreto: requiere ROCmFPX `main` desde el 15 de noviembre de 2026; otras builds de llama.cpp no reconocen la arquitectura.
- Evaluacion limitada al ingles: las metricas de perplejidad y las pruebas cualitativas usan texto general en ingles; no hay datos sobre codigo, tool use ni otros idiomas.
- Primera version de prueba: el autor advierte que una build mejorada puede sustituir los archivos, y no es una release oficial de Thinking Machines.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones tecnicas y la degradacion de calidad hacen desaconsejable su uso en produccion sin evaluacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Inkling-2-Small-StrixHalo-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Fork ROCmFPX requerido: https://github.com/HarshaVardhan3002/ROCmFPX
- Archivo de expertos conservados: `keep-experts-E307.json` dentro del repositorio
