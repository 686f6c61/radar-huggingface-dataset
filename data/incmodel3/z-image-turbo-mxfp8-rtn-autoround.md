# INCModel3/Z-Image-Turbo-MXFP8-RTN-AutoRound

## Resumen

Z-Image-Turbo-MXFP8-RTN-AutoRound es una cuantizacion de 8 bits del modelo de generacion de imagenes Tongyi-MAI/Z-Image-Turbo, publicada por el usuario INCModel3 en HuggingFace. El modelo base es un text-to-image de 6.000 millones de parametros con arquitectura S3-DiT destilada, orientado a generar imagenes de 1024x1024 en solo 8 pasos de inferencia y sin classifier-free guidance (guidance 0.0).

El problema que resuelve esta version es el coste de memoria en inferencia: los pesos en bf16 del modelo original ocupan unos 31 GB, mientras que la cuantizacion MXFP8 (W8A8, group size 32) los reduce a aproximadamente 14 GB, lo que habilita su despliegue en GPUs de gama alta para consumidores y reduce el coste por GPU en servidores. La cuantizacion se ha generado con AutoRound mediante RTN (round-to-nearest, 0 iteraciones de ajuste) y se exporta en formato compatible con vllm-omni.

La relevancia inmediata esta en que la evaluacion publicada por el autor indica una perdida practicamente nula frente al baseline bf16: GenEval pasa de 0,757 a 0,760 y DrawBench CLIP de 31,73 a 31,79. Es, por tanto, un ejemplo de cuantizacion de pesos y activaciones aplicada a un modelo de difusion sin degradacion medible en las metricas reportadas, aunque el repositorio no cuenta todavia con validacion independiente de la comunidad (0 descargas y 0 likes en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | S3-DiT (diffusion transformer), segun la model card del autor |
| Parametros totales | 6.000 millones (modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de difusion text-to-image; no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | MXFP8 (W8A8), data_type=mx_fp, bits=8, act_bits=8, group_size=32 |
| Idiomas soportados | no disponible |
| Licencia | other (se debe seguir la licencia del modelo original Tongyi-MAI/Z-Image-Turbo) |
| Formato de pesos | safetensors, export auto_round compatible con vllm-omni |

Datos adicionales: tamano del repositorio 14,7 GB; tamano declarado de pesos ~14 GB frente a 31 GB en bf16; pipeline text-to-image; libreria diffusers; capas `adaLN_modulation` mantenidas en precision completa (no cuantizadas).

## Arquitectura y entrenamiento

Esta ficha describe un artefacto de cuantizacion, no un entrenamiento desde cero. El modelo base Tongyi-MAI/Z-Image-Turbo es un text-to-image destilado de 6B parametros con arquitectura S3-DiT, capaz de operar en regimen few-step (8 pasos) con guidance_scale 0.0. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens de imagen-texto ni si se aplicaron tecnicas de alineacion como RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica de este repositorio es el esquema de cuantizacion: MXFP8 con micro-escalado por grupos de 32 elementos, cuantizando tanto pesos como activaciones (W8A8), generado con AutoRound en modo RTN (iters=0, es decir, sin optimizacion iterativa de los parametros de redondeo). El calibrado se hizo sobre coco2014 con 8 pasos de inferencia y guidance 0.0, y se excluyeron de la cuantizacion las capas de modulacion adaLN. El flujo de produccion se describe como "autoquant-agent" (cuantizar, evaluar y auto-reparar), y el resultado se exporta en un formato consumible por vllm-omni para inferencia de difusion.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a 1024x1024 en 8 pasos de inferencia.
- Inferencia few-step sin classifier-free guidance (guidance_scale 0.0), lo que reduce el coste computacional por imagen.
- Generacion por lotes mediante `num_outputs_per_prompt` en la API de vllm-omni.
- Reproducibilidad determinista por semilla (el ejemplo oficial usa seed 42).
- Comportamiento practicamente identico al modelo base bf16 en las metricas evaluadas (GenEval, DrawBench CLIP, CLIP-IQA, ImageReward).
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, vision de entrada, audio ni capacidades multilingues explicitas; no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes en produccion con restriccion de VRAM: al ocupar ~14 GB de pesos en MXFP8, el modelo cabe en GPUs de 24 GB, lo que permite servir text-to-image en nodos mas economicos que los necesarios para el baseline bf16 de 31 GB.
- Prototipado rapido de interfaces creativas: con 8 pasos y guidance 0.0, el coste por imagen es bajo, adecuado para herramientas de generacion de bocetos o variaciones sobre un prompt en tiempo casi interactivo.
- Generacion de activos para marketing y e-commerce: el modelo produce imagenes de 1024x1024 a partir de descripciones textuales, integrable en pipelines que necesitan volumen alto de imagenes coherentes con un brief.
- Data augmentation sintetica: generar datasets de imagenes etiquetadas por prompt para entrenar o evaluar otros modelos de vision, aprovechando la reproducibilidad por semilla para trazabilidad.
- Despliegue multi-tenant con vLLM: la exportacion esta pensada para vllm-omni, lo que facilita servir el modelo tras una API con gestion de colas y batching en un cluster compartido.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia reproducible de MXFP8 + RTN frente a bf16 con un harness documentado (vllm-omni diffusion harness, 8 pasos, seed 42), util para investigacion en compresion de modelos de difusion.
- Integracion en pipelines de generacion offline por lotes: para renderizado de catalogos o ilustraciones donde la latencia no es critica pero si el coste por GPU-hora.

## Benchmarks y rendimiento

Evaluacion publicada por el autor con vllm-omni diffusion harness (8 pasos, guidance 0.0, 1024x1024, seed 42):

| Benchmark | Baseline bf16 | MXFP8 cuantizado |
|---|---|---|
| DrawBench CLIP | 31,73 | 31,79 |
| DrawBench CLIP-IQA | 70,57 | 70,41 |
| DrawBench ImageReward | 1,00 | 0,97 |
| GenEval | 0,757 | 0,760 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no es un modelo de lenguaje. No se dispone de datos de latencia, throughput ni consumo energetico en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB para los pesos MXFP8 mas activaciones y buffers de difusion a 1024x1024; el baseline bf16 requiere alrededor de 31-34 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 5090 (32 GB), L40S (48 GB), A100 40/80 GB, H100 80 GB. Para MXFP8 conviene verificar que la libreria de despliegue disponga de kernels compatibles con el formato; el detalle no esta disponible en la informacion proporcionada.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas con la cuantizacion MXFP8; en tarjetas de 16 GB el margen es muy ajustado y no esta confirmado por el autor.
- Opciones de despliegue: vllm-omni (documentado en la model card, con `Omni` y `OmniDiffusionSamplingParams`). El repositorio esta etiquetado con la libreria diffusers, por lo que es previsible su uso desde ese ecosistema, aunque no se incluye ejemplo en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Solo se conoce la configuracion de inferencia (8 pasos, guidance 0.0, 1024x1024), no los tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Image-Turbo-MXFP8-RTN-AutoRound (este) | 6B (base) | 1024x1024, 8 pasos | MXFP8 W8A8, group 32 | other (heredada del base) | HuggingFace, 0 descargas |
| Tongyi-MAI/Z-Image-Turbo (base) | 6B | 1024x1024, 8 pasos | bf16, ~31 GB | other | HuggingFace (modelo de referencia) |
| FLUX.1-schnell | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Stable Diffusion 3.5 Large | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

Las dos ultimas filas se incluyen como categorias de modelos comparables (text-to-image destilados de varios miles de millones de parametros), pero no se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia "other": el autor remite explicitamente a la licencia del modelo original Tongyi-MAI/Z-Image-Turbo, cuyos terminos no se detallan en la informacion proporcionada. Es obligatorio revisarla antes de cualquier uso comercial.
- La cuantizacion se calibro unicamente sobre coco2014 con 8 pasos y guidance 0.0. El comportamiento fuera de ese dominio (prompts muy largos, estilos poco representados, otros pasos de inferencia) no esta evaluado.
- Las metricas reportadas son las del propio autor; no hay evaluacion independiente ni replicacion externa.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni evidencia de uso en produccion.
- DrawBench ImageReward baja de 1,00 a 0,97, lo que sugiere una degradacion leve en preferencia estetica percibida, aunque las otras tres metricas se mantienen o mejoran.
- No hay informacion sobre filtros de seguridad, manejo de contenido sensible ni sesgos del modelo base; se desconoce si se aplicaron mecanismos de moderacion.
- Al ser un modelo de difusion text-to-image, no soporta razonamiento multi-paso, tool calling ni agentes, pese a que el pipeline de produccion ("autoquant-agent") use ese termino para el proceso de cuantizacion.
- Riesgo de alucinacion visual: como cualquier modelo generativo de imagenes, puede producir contenido plausible pero incorrecto respecto al prompt o a la realidad (texto en la imagen, manos, estructuras fisicas).
- El soporte real de los pesos depende de vllm-omni y de kernels MXFP8 disponibles en el hardware objetivo; no se documentan requisitos minimos de version.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/INCModel3/Z-Image-Turbo-MXFP8-RTN-AutoRound
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Repositorio de AutoRound (Intel): https://github.com/intel/auto-round
- Proyecto autoquant-agent: https://github.com/ (referencia incompleta en la model card)
- vllm-omni: no se proporciona URL en la informacion disponible
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (los resultados obtenidos correspondian a servicios de localizacion GPS y no guardan relacion con el contenido de la ficha).
