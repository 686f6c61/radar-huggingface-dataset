# hugypufy/Qwen3.8-27B-PARO-MXFP6

## Resumen

Qwen3.8-27B-PARO-MXFP6 es una version cuantizada del modelo Qwen/Qwen3.8-27B, publicada por el usuario hugypufy el 17 de septiembre de 2026. La cuantizacion combina dos tecnicas: rotaciones ParoQuant (procedentes de los tensores de z-lab/Qwen3.8-27B-PARO) sobre pesos en formato OCP MXFP6 (E2M3) y un ajuste fino de etapa 2 que reentrena los pesos y los exponentes de bloque manteniendo congeladas las rotaciones. El resultado es un checkpoint de 21.312.687.344 parametros reales (segun safetensors) que ocupa 25,2 GB en el repositorio.

El modelo mantiene la modalidad image-text-to-text del modelo base, es decir, es multimodal de entrada (imagenes y texto) con salida de texto. Su rasgo mas diferencial no es la receta de cuantizacion en si, sino el objetivo de despliegue: esta pensado para GPUs AMD RDNA4 (gfx1201, por ejemplo la Radeon AI PRO R9700) con ROCm, servido mediante una ruta W6A8 fp8-WMMA en una version parcheada de vLLM. Esto lo convierte en una pieza relevante para quienes trabajan en inferencia de bajo bit en hardware AMD, un nicho tradicionalmente menos cubierto que el ecosistema NVIDIA.

La relevancia practica viene acompanada de una advertencia importante: el modelo declara `quant_method = "paroquant_mxfp6"` y no es cargable con transformers estandar ni con vLLM estandar. Requiere la rama `mxfp6` del repositorio radiance-vllm-mxfp4 para gfx1201. Ademas, los resultados de evaluacion estan todavia en proceso de medicion segun la propia model card, que solo publica datos preliminares de divergencia KL, acuerdo top-1 y perplejidad en wikitext-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; etiqueta de transformers `qwen3_5`) |
| Parametros totales | 21.312.687.344 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP6 (OCP, E2M3) con rotaciones ParoQuant; esquema W6A8; ruta fp8-WMMA en vLLM parcheado |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 25,2 GB |
| Modelo base | Qwen/Qwen3.8-27B (relacion: quantized) |
| Metodo de cuantizacion | `paroquant_mxfp6` |
| Hardware objetivo | AMD RDNA4, gfx1201 (por ejemplo Radeon AI PRO R9700), ROCm |
| Fecha de publicacion | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B. Lo que si se documenta es el proceso de cuantizacion aplicado. El procedimiento consta de dos fases: en primer lugar, un redondeo al vecino mas cercano (round-to-nearest) de los pesos sobre la rejilla MXFP6, el formato de 6 bits definido por Open Compute Project con exponente de 2 bits y mantisa de 3 bits (E2M3). En segundo lugar, un ajuste fino de etapa 2 en el que se actualizan tanto los pesos como los exponentes de bloque, manteniendo congelados los tensores de rotacion de ParoQuant. Esa combinacion de rotaciones previas con ajuste posterior es lo que el autor presenta como receta comun a este checkpoint y a su hermano Swift-Qwen3.8-27B-PARO-MXFP6.

El aspecto mas relevante en terminos de ingenieria es la ruta de ejecucion. El modelo se sirve mediante un camino W6A8 (pesos de 6 bits, activaciones de 8 bits) con WMMA en fp8 dentro de una version parcheada de vLLM, especifica para gfx1201 en ROCm. Los tensores de rotacion proceden de z-lab/Qwen3.8-27B-PARO, tambien bajo Apache-2.0. La model card no publica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base; esa informacion no esta disponible en el material proporcionado.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline image-text-to-text indican soporte de dialogos multi-turno.
- Entrada multimodal de imagenes y texto: el pipeline declarado es `image-text-to-text`, por lo que acepta imagenes junto a instrucciones textuales.
- Inferencia cuantizada de bajo bit: pesos en MXFP6 con activaciones en 8 bits, orientada a reducir huella de memoria y aprovechar las unidades matriciales fp8 de RDNA4.
- Compatibilidad con vLLM parcheado: el modelo esta preparado para servirse con `endpoints_compatible` en la rama `mxfp6` de radiance-vllm-mxfp4.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta relleno en la tarjeta.
- Modo thinking o modos especiales de razonamiento: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de inferencia multimodal en GPUs AMD RDNA4: el modelo esta especificamente construido para gfx1201 con ROCm y vLLM parcheado, de modo que permite servir un modelo de ~21.300 millones de parametros con capacidades de vision y texto en hardware Radeon profesional sin depender del ecosistema CUDA.
- Reduccion de coste de memoria en servidores de inferencia: al almacenar los pesos en MXFP6, la huella de pesos baja respecto a un checkpoint bf16 equivalente del mismo modelo base, lo que permite asignar mas VRAM a cache KV y a lotes concurrentes.
- Investigacion en cuantizacion de bajo bit: la publicacion de la receta (redondeo MXFP6 mas ajuste de etapa 2 con rotaciones congeladas) y de las metricas de divergencia KL la convierten en un caso de estudio util para quienes trabajan en cuantizacion post-entrenamiento y en el impacto de las rotaciones sobre la fidelidad de las representaciones.
- Evaluacion comparativa de fidelidad frente al modelo base en bf16: el autor publica metricas de acuerdo top-1 y perplejidad, lo que permite usar este checkpoint como referencia en estudios sobre degradacion inducida por cuantizacion a 6 bits en modelos multimodales.
- Prototipado de asistentes sobre imagen y documento: al aceptar entrada de imagenes y texto, puede emplearse en tareas como descripcion de contenido visual o respuesta a preguntas sobre imagenes dentro de un flujo conversacional.
- Integracion en plataformas de despliegue que ya expongan una API compatible con endpoints tipo OpenAI, aprovechando la etiqueta `endpoints_compatible` del repositorio.
- Experimentacion con cuantizacion hibrida peso 6 bits / activacion 8 bits: util para medir en que tareas la ruta W6A8 con fp8-WMMA mantiene calidad respecto a bf16 y donde aparecen las primeras divergencias.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son mediciones de fidelidad frente al modelo sin cuantizar (Qwen3.8-27B en bf16) servido en la misma pila. El autor indica expresamente que los resultados siguen en proceso de medicion y que la tarjeta se completara mas adelante.

| Metrica | Este modelo (MXFP6) | Qwen3.8-27B bf16 |
|---|---|---|
| Divergencia KL, top-5 (nats) | 0,0065 | referencia |
| Divergencia KL, top-20 (nats) | 0,0081 | referencia |
| Divergencia KL, top-256 (nats) | 0,0091 | referencia |
| Acuerdo de token top-1 con bf16 | 95,3 % | referencia |
| Perplejidad wikitext-2 (fragmentos de 2048 tokens) | 7,034 | 7,081 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- GPU objetivo: AMD RDNA4 con gfx1201, citandose explicitamente la Radeon AI PRO R9700. El soporte depende de ROCm.
- VRAM estimada para pesos: el repositorio ocupa 25,2 GB y los parametros declarados son 21.312.687.344, lo que situa la huella de pesos en torno a 16-17 GB en MXFP6 (6 bits por parametro) mas los tensores auxiliares de rotacion y exponentes. A esto hay que sumar cache KV y activaciones, por lo que conviene reservar un margen adicional; no se publica una cifra oficial de VRAM total requerida.
- Cabe en GPU de consumo: no disponible. El unico hardware validado en la informacion proporcionada es RDNA4 gfx1201 en el segmento profesional; no se menciona soporte para Radeon de consumo ni para GPUs NVIDIA.
- Opciones de despliegue: unicamente la rama `mxfp6` del repositorio radiance-vllm-mxfp4, sobre vLLM parcheado. No es cargable con transformers estandar ni con vLLM estandar. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Hardware objetivo | Licencia | Relacion |
|---|---|---|---|---|---|
| hugypufy/Qwen3.8-27B-PARO-MXFP6 | 21.312.687.344 | MXFP6 (E2M3) + rotaciones ParoQuant, W6A8 | AMD RDNA4 gfx1201, ROCm, vLLM parcheado | apache-2.0 | Checkpoint evaluado |
| hugypufy/Swift-Qwen3.8-27B-PARO-MXFP6 | no disponible | MXFP6 + rotaciones ParoQuant (misma receta) | no disponible | no disponible | Modelo hermano; segun la model card, este checkpoint es la variante sobre el modelo base |
| z-lab/Qwen3.8-27B-PARO | no disponible | Rotaciones ParoQuant (origen de los tensores) | no disponible | apache-2.0 | Origen de las rotaciones |
| Qwen/Qwen3.8-27B | no disponible | bf16 (sin cuantizar) | no disponible | apache-2.0 | Modelo base; referencia de las metricas |

No se dispone de datos comparativos de rendimiento en tareas entre estas variantes. La unica comparacion cuantitativa publicada es la divergencia KL, el acuerdo top-1 y la perplejidad frente al modelo base en bf16.

## Limitaciones y advertencias

- Compatibilidad restringida: la model card indica explicitamente que el modelo no es cargable por transformers estandar ni por vLLM estandar. Requiere la rama `mxfp6` de radiance-vllm-mxfp4 para gfx1201.
- Dependencia de hardware concreto: la ruta W6A8 fp8-WMMA esta pensada para AMD RDNA4 (gfx1201) con ROCm. No se documenta funcionamiento en otras arquitecturas de GPU.
- Evaluacion incompleta: el autor senala que los resultados siguen midiendose y que la tarjeta se completara mas adelante. Solo hay metricas de fidelidad, no de tareas.
- Divergencia respecto al modelo base: con un 95,3 % de acuerdo top-1 y divergencia KL de 0,0065 a 0,0091 nats en los primeros tokens, existe una degradacion medible, aunque baja, respecto a bf16. En tareas sensibles a la precision puede acumularse error.
- Riesgo de alucinacion: no se publican evaluaciones especificas de veracidad ni de tasa de alucinacion para este checkpoint. El riesgo inherente del modelo base no esta cuantificado en la informacion disponible.
- Idiomas soportados: el campo aparece vacio en la tarjeta, por lo que no puede confirmarse cobertura multilingue.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo.
- Licencia: Apache-2.0, heredada de Qwen/Qwen3.8-27B, lo que en principio permite uso comercial, pero se trata de una obra derivada modificada, no avalada por Alibaba Cloud / Qwen ni por z-lab. Los avisos y la lista de cambios por fichero estan en el archivo NOTICE del repositorio.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion y ultima actualizacion del mismo dia. Conviene verificar la integridad y el mantenimiento del repositorio antes de usarlo en produccion.
- Nota sobre el nombre: el identificador menciona 27B mientras que el dato real de safetensors es de 21.312.687.344 parametros. Es un dato a tener en cuenta al planificar recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hugypufy/Qwen3.8-27B-PARO-MXFP6
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo hermano (variante Swift): https://huggingface.co/hugypufy/Swift-Qwen3.8-27B-PARO-MXFP6
- Origen de los tensores de rotacion: https://huggingface.co/z-lab/Qwen3.8-27B-PARO
- vLLM parcheado (rama `mxfp6`): https://codeberg.org/hugypufy/radiance-vllm-mxfp4/src/branch/mxfp6

No se han encontrado en la busqueda web resultados relevantes sobre este modelo; los resultados devueltos correspondian a contenido no relacionado.
