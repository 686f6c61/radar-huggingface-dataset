# amd/Kimi-K3-Quark-MXFP4-AttnFP8

## Resumen
Kimi-K3-Quark-MXFP4-AttnFP8 es una version cuantizada del modelo multimodal moonshotai/Kimi-K3, publicada por AMD y optimizada para su ejecucion sobre aceleradores AMD Instinct MI350 y MI355 con ROCm 10.0.0. El modelo conserva la arquitectura original KimiK3ForConditionalGeneration (un transformer con mezcla de expertos y torre de vision) y admite entradas de texto, imagen y video con salida de texto. Se distribuye a traves de Hugging Face con la libreria transformers y un pipeline image-text-to-text.

La relevancia de esta ficha radica en el esquema de cuantizacion aplicado: los pesos y activaciones de los expertos enrutados se comprimen a OCP MXFP4, la atencion se cuantiza a PTPC-FP8 y los expertos compartidos se mantienen en BF16. El resultado es un checkpoint de aproximadamente 1,418 billones de parametros totales (dato real de safetensors) que ocupa unos 3 TB en el repositorio, lo que refleja el enorme coste de almacenamiento del modelo base en precision completa.

El objetivo del modelo es ofrecer una alternativa de inferencia de alto rendimiento para Kimi-K3 en hardware AMD, con una recuperacion de precision casi identica a la del modelo original segun la evaluacion publicada. Es una pieza pensada para despliegues en servidores con multiples GPUs y no para entornos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KimiK3ForConditionalGeneration (transformer multimodal con mezcla de expertos) |
| Parametros totales | 1.418.198.090.496 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en expertos enrutados (pesos y activaciones), PTPC-FP8 en self-attention, BF16 en expertos compartidos |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (licencia "other" con nombre kimi-k3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo base Kimi-K3 emplea una arquitectura de transformer con mezcla de expertos (MoE) y un modulo de vision que permite procesar texto, imagenes y video. La implementacion concreta en este checkpoint es KimiK3ForConditionalGeneration, con capas de atencion que incluyen proyecciones kv_a_proj_with_mqa (atencion con query latente, estilo MLA) y un enrutador block_sparse_moe.gate que selecciona expertos por token. La torre de vision y el proyector multimodal (vision_tower y mm_projector) quedan excluidos de la cuantizacion, al igual que el lm_head y ciertas proyecciones residuales.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La innovacion tecnica destacable de esta version es el esquema de cuantizacion de AMD-Quark: los expertos enrutados usan MXFP4 (formato de coma flotante de 4 bits con escala compartida por bloque, definido por OCP), la atencion usa PTPC-FP8 (FP8 por canal por token) y los expertos compartidos permanecen en BF16 para preservar precision. Los scripts de cuantizacion se basan en LLMTemplate y ModelQuantizer de quark.torch, con un template registrado para el tipo de modelo kimi_k3.

## Capacidades
- Generacion de texto a partir de entradas multimodales: texto, imagen y video.
- Procesamiento de imagen-texto-a-texto (pipeline image-text-to-text).
- Razonamiento y generacion de codigo, heredados del modelo base Kimi-K3 (no se detallan capacidades especificas en la informacion disponible).
- Soporte de tool calling y function calling: el servidor SGLang se lanza con --tool-call-parser kimi_k3, lo que indica soporte de llamadas a herramientas.
- Soporte de razonamiento multi-paso: el servidor incluye --reasoning-parser kimi_k3, lo que sugiere un modo de razonamiento estructurado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): vision confirmada por la arquitectura y el pipeline; audio no disponible.

## Casos de uso
- Inferencia multimodal a gran escala en centros de datos con AMD Instinct MI350/MI355: el modelo esta optimizado para ROCm 10.0.0 y SGLang, por lo que encaja en despliegues con 8 GPUs en paralelo (tp-size 8) y atencion con backend aiter.
- Analisis de documentos con imagenes y texto: al aceptar entradas de imagen y texto, puede extraer informacion de capturas, graficos o formularios y responder en texto, usando el contexto multimodal del modelo base.
- Asistentes con tool calling: el parser kimi_k3 permite integrar el modelo en flujos de agentes que invocan APIs externas, bases de datos o servicios internos.
- Razonamiento multi-paso en entornos de investigacion: el reasoning parser permite separar la cadena de razonamiento de la respuesta final, util para evaluar trazas de decision en tareas de matematicas o logica.
- Procesamiento de video para resumenes o descripcion: la entrada de video permite generar descripciones textuales de secuencias, util en monitorizacion o catalogacion de contenido.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de precision de MXFP4 y FP8 frente al modelo BF16 original en tareas como GSM8K.
- Servicio de completaciones a traves de la API compatible con OpenAI de SGLang: el ejemplo de lm_eval usa el endpoint /v1/completions, lo que facilita integrarlo en pipelines existentes.

## Benchmarks y rendimiento

| Benchmark | moonshotai/Kimi-K3 | amd/Kimi-K3-Quark-MXFP4-AttnFP8 | Recuperacion |
|---|---|---|---|
| GSM8K (flexible-extract, 5-shot) | 96.82 | 96.74 | 99.92% |

Solo se ha publicado el resultado de GSM8K en la informacion disponible. No hay datos de MMLU, HumanEval ni otros benchmarks.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 3024.1 GB, lo que exige almacenamiento y memoria agregada en el orden de terabytes para cargar los pesos.
- GPU recomendadas: AMD Instinct MI350 y MI355, unicas microarquitecturas soportadas segun la model card.
- Compatibilidad con GPU de consumo: no; el modelo no esta pensado para GPUs consumer y requiere ROCm 10.0.0.
- Despliegue: SGLang con tp-size 8, dcp-size 8, backend de atencion aiter, kv-cache en fp8_e4m3, dtype bfloat16, mem-fraction-static 0.90 y cuda-graph-max-bs-decode 256.
- Software: PyTorch 2.11.0, Transformers 5.19.0, ROCm 10.0.0, Linux; imagen Docker de referencia rocm/sgl-dev:v0.5.22-rocm10-mi35x-20261019.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| amd/Kimi-K3-Quark-MXFP4-AttnFP8 | 1.418.198.090.496 | no disponible | MXFP4 + PTPC-FP8 + BF16 | kimi-k3 | AMD MI350/MI355 |
| moonshotai/Kimi-K3 | no disponible | no disponible | BF16 (original) | kimi-k3 | no disponible |
| Otros modelos de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es con el modelo base moonshotai/Kimi-K3, del que este checkpoint es una cuantizacion. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias
- La licencia es "other" con nombre kimi-k3; es necesario revisar los terminos del modelo base antes de cualquier uso comercial.
- El modelo esta restringido a hardware AMD MI350/MI355 con ROCm 10.0.0; no funciona en GPUs NVIDIA ni en consumer.
- El esquema de cuantizacion MXFP4 y PTPC-FP8 puede introducir degradaciones en tareas no evaluadas; solo se ha verificado GSM8K con una recuperacion del 99.92%.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de idioma del modelo base.
- El tamano del repositorio (3024.1 GB) implica requisitos severos de almacenamiento y ancho de banda de carga.
- El uso de --trust-remote-code es necesario para cargar el modelo, lo que implica ejecutar codigo personalizado del repositorio.
- No se han publicado datos de latencia ni throughput, lo que dificulta estimar costes operativos.

## Enlaces
- Hugging Face: https://huggingface.co/amd/Kimi-K3-Quark-MXFP4-AttnFP8
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- AMD-Quark: https://quark.docs.amd.com/latest/index.html
- SGLang: https://docs.sglang.ai/
- Guia de despliegue SGLang para Kimi-K3: https://lmsysorg.mintlify.app/cookbook/autoregressive/Moonshotai/Kimi-K3#deployment
- lm-evaluation-harness: https://github.com/eleutherai/lm-evaluation-harness
