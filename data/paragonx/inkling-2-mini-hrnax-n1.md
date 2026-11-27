# paragonX/Inkling-2-Mini-HRNAX-N1

## Resumen

Inkling-2-Mini-HRNAX-N1 es un empaquetado de pesos nativo en formato `hrnax-v3` del modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicado por el usuario paragonX. No se trata de una re-cuantización convencional: el pack preserva el 97,6% de los bytes de pesos del release oficial bit a bit, manteniendo intactos los expertos enrutados nativos en NVFP4 (capas L0–L19) y MXFP8 (capas L20–L23), la atención BF16 de las 24 capas, los embeddings BF16, la torre de visión y las normas y routers. Solo se cuantiza la cabeza de desembebido (`T8`, 0,432 GiB).

El modelo base es un transformer MoE multimodal con bucle: 26,4B parámetros lógicos, 24 capas físicas con un núcleo `L6–L17` visitado tres veces (48 visitas efectivas), 128 expertos enrutados con `top-k = 8`, y una torre de visión. El pack está diseñado específicamente para inferencia nativa en Apple Silicon / Metal mediante el motor Hivengine (versión 0.5.0 o superior), no para GPUs NVIDIA ni para stacks de inferencia convencionales.

Su relevancia radica en que demuestra una vía de despliegue de modelos MoE multimodales grandes en hardware de consumo Apple con precisión casi idéntica al reference FP32: 99,88% de acuerdo top-1 y 0,000014 nats de divergencia KL. El footprint de pesos es de 17,754 GiB (5,78 bits por peso efectivos), y el repo ocupa 19,1 GB en total. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con bucle (24 capas fisicas, nucleo `L6–L17` visitado 3 veces, 48 visitas efectivas) + torre de vision |
| Parametros totales | 26.389B logicos (17.598.112.872 segun safetensors del repo) |
| Parametros activos | 128 expertos enrutados, `top-k = 8` (numero exacto de parametros activos no disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada (el autor menciona configuraciones de `2 × 131K` contexto en pruebas de memoria) |
| Tipos de cuantizacion | NVFP4 nativo (expertos L0–L19), MXFP8 nativo (expertos L20–L23), BF16 (atencion, embeddings, vision, routers, normas), T8 Hadamard-rotated (cabeza de desembebido); 5,78 bpw efectivos |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `hrnax-v3` (4 shards safetensors, 1.246 tensores, 13 archivos de pack, 17,754 GiB de pesos) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer MoE multimodal con una innovacion estructural clave: un nucleo de capas recurrentes. De las 24 capas fisicas, el bloque `L6–L17` se recorre tres veces, resultando en 48 visitas efectivas. Esta recurrencia mejora la eficiencia parametrica pero amplifica cualquier error de redondeo en activaciones y KV a lo largo de las pasadas del bucle, lo que condiciona fuertemente las decisiones de precision en runtime.

La distribucion de pesos del pack refleja la estrategia de cuantizacion nativa del release original: 160 tensores NVFP4 en las capas L0–L19 (10,679 GiB), 16 tensores MXFP8 en L20–L23 (3,916 GiB), 144 tensores de atencion BF16 en las 24 capas (1,200 GiB), y 923 tensores BF16 correspondientes a embeddings (0,863 GiB), torre de vision (0,593 GiB) y normas/routers/convs/gates (0,073 GiB). El unico tensor cuantizado desde BF16 en este pack es la cabeza de desembebido `T8`, con 0,432 GiB.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF/DPO en la informacion proporcionada. El autor menciona un drafter especulativo opcional (`incoai/Inkling-2-Mini-DFlash2`, 0,923 GiB, 5 capas BF16, Apache-2.0) para decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte para trazas largas de agente y herramientas.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`, torre de vision BF16 integrada).
- Razonamiento multi-paso y agentico, segun las trazas de agente y tool calling incluidas en el conjunto de evaluacion `test_256`.
- Tool calling / function calling (mencionado implicitamente en las trazas de evaluacion).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Inferencia nativa en Apple Silicon / Metal mediante Hivengine 0.5.0+.

## Casos de uso

- Despliegue local en Mac con Apple Silicon: el pack esta disenado para ejecutarse en Hivengine sobre Metal, lo que permite correr un MoE multimodal de 26,4B parametros en un Mac Studio M5 Max con un `phys_footprint` de aproximadamente 39,9 GiB a `2 × 131K` de contexto con la configuracion por defecto (FP32 KV + FP32 activaciones).
- Asistentes conversacionales multimodales en local: la torre de vision BF16 y el pipeline image-text-to-text permiten construir asistentes que procesen imagenes y mantengan conversaciones multi-turno sin depender de la nube.
- Agentes con tool calling en entornos de desarrollo: las trazas de agente y herramientas del conjunto de evaluacion sugieren soporte para razonamiento multi-paso con llamadas a funciones, adecuado para prototipos de agentes que operen sobre APIs locales.
- Investigacion en cuantizacion y precision: el pack incluye ablaciones detalladas de precision (FP32 vs BF16 vs FP16 en KV y activaciones) que lo convierten en un banco de pruebas para estudiar el impacto del redondeo en arquitecturas con bucles.
- Evaluacion de motores de inferencia Metal: al preservar los pesos nativos bit a bit, sirve como referencia para validar la fidelidad numerica de kernels Metal frente a PyTorch FP32.
- Prototipado de decodificacion especulativa: combinado con el drafter `DFlash2` (0,923 GiB), permite experimentar con aceleracion especulativa en hardware Apple.
- Analisis de documentos con imagen: la combinacion de contexto largo (hasta 131K tokens segun las pruebas del autor) y vision permite procesar documentos escaneados o capturas con texto.

## Benchmarks y rendimiento

El autor publica evaluaciones de fidelidad numerica frente al reference FP32 de `thinkingmachines/Inkling-2-Mini`, no benchmarks de tareas estandar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de tareas en la informacion disponible.

| Configuracion | Peso (GiB) | KL media (nats) | IC 95% | Top-1 |
|---|---:|---:|---|---:|
| HRNAX-N1 (atencion BF16 en 24 capas, expertos nativos, KV y activaciones FP32) | 17,754 | 0,000014 | [0,00001, 0,00002] | 99,88% |
| N1-BF16 L0–L17 (atencion T8 en cola, KV y activaciones FP32) | 17,604 | 0,00056 | [0,00037, 0,00084] | 99,74% |
| N0 (expertos nativos + atencion T8, activaciones FP32) | 17,155 | 0,07726 | [0,04700, 0,12491] | 95,78% |
| HRNAX-Q1 (T4/T8 `hrnax-v1`) | 16,832 | 0,11662 | [0,07835, 0,17415] | 93,54% |

Ablacion de precision en runtime sobre pesos nativos (`test_256`):

| Configuracion | KL global | Top-1 global | KL decode-128 | KL agente |
|---|---:|---:|---:|---:|
| FP32 prefill + FP32 decode + FP32 KV (por defecto en N1) | 0,000014 | 99,88% | 0,00048 | 0,00112 |
| Solo KV BF16 (lineales FP32) | 0,06461 | 96,31% | 0,07240 | 0,20836 |
| Solo KV FP16 (lineales FP32) | 0,03741 | 97,52% | 0,04655 | 0,12307 |
| Prefill FP16 + decode FP32 (KV FP32) | 0,05100 | 96,98% | 0,05806 | 0,16094 |
| Solo atencion FP16 | 0,04519 | 97,29% | — | — |
| Solo expertos FP16 | 0,03846 | 97,57% | — | — |

El conjunto `test_256` comprende 234 secuencias y 173.971 tokens, incluyendo 32 secuencias largas de hasta 2.031 tokens y trazas reales de agente y herramientas.

## Requisitos de hardware

- VRAM/RAM unificada: con la configuracion por defecto (FP32 KV + FP32 activaciones) el autor reporta un `phys_footprint` de aproximadamente 39,9 GiB a `2 × 131K` de contexto. Los pesos solos ocupan 17,754 GiB.
- Configuracion compacta: con `--kv-dtype bf16 --act-dtype f16` el footprint baja a aproximadamente 29,2 GiB a `2 × 131K` (precision de 98,85% top-1 / 0,0012 KL).
- GPU recomendadas: Apple Silicon con soporte Metal; el autor valida en Apple M5 Max Mac Studio. No hay soporte documentado para GPUs NVIDIA (A100, H100, RTX 4090) ni CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (el autor demuestra M5 Max). No se documenta compatibilidad con GPUs de consumo NVIDIA.
- Opciones de despliegue: exclusivamente Hivengine 0.5.0+ sobre Metal. No se soportan vLLM, llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. El drafter especulativo opcional `DFlash2` esta pensado para mejorar la velocidad de decodificacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision vs FP32 | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Inkling-2-Mini-HRNAX-N1 (este) | 26,389B logicos, MoE top-8 | Hasta 131K (segun pruebas del autor) | 99,88% top-1 / 0,000014 KL | Apache-2.0 | Hugging Face, formato `hrnax-v3` |
| Inkling-2-Mini-HRNAX-Q1 | 26,389B logicos, MoE top-8 | Hasta 131K | 93,54% top-1 / 0,11662 KL | Apache-2.0 | Hugging Face, formato `hrnax-v1` |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B logicos, MoE top-8 | No disponible | Reference FP32 | Apache-2.0 | Hugging Face, pesos nativos |
| N0 (variante del autor) | 26,389B logicos | No disponible | 95,78% top-1 / 0,07726 KL | Apache-2.0 | Referenciado en la model card |

No se dispone de comparacion con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia exclusiva de Hivengine: el formato `hrnax-v3` no es compatible con vLLM, llama.cpp, Ollama, TGI ni con GPUs NVIDIA. Requiere Hivengine 0.5.0+ y hardware Apple Silicon.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplican las limitaciones habituales del modelo base.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingue.
- Longitud de contexto oficial: no confirmada; las cifras de 131K provienen de pruebas de memoria del autor, no de una especificacion formal del modelo base.
- Sensibilidad a la precision: la arquitectura con bucle (`L6–L17` tres veces) amplifica el error de redondeo. Usar KV o activaciones de 16 bits degrada la fidelidad de forma notable (hasta 0,06461 KL con solo KV BF16), especialmente en trazas de agente.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `thinkingmachines/Inkling-2-Mini` por si impone condiciones adicionales.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente de las cifras reportadas por el autor.
- El drafter especulativo `DFlash2` se descarga por separado y anade 0,923 GiB al footprint.

## Enlaces

- Hugging Face del pack: https://huggingface.co/paragonX/Inkling-2-Mini-HRNAX-N1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante compacta: https://huggingface.co/paragonX/Inkling-2-Mini-HRNAX-Q1
- Drafter especulativo: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Motor de inferencia: https://github.com/paragontasx/hivengine
