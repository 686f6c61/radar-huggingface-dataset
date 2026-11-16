# gostar77/muse-glimmer-30b-iq4r-v4-radiance

## Resumen

Muse Glimmer 30B IQ4R-V4 — Radiance es una cuantización del modelo Meta Muse Glimmer 30B empaquetada en el formato propietario `.rad` de Radiance, un motor de inferencia alternativo a llama.cpp o vLLM. El autor del contenedor es el usuario de Hugging Face `gostar77`, y el modelo base es `meta-models/Muse-Glimmer-30B`, un transformer de 30.000 millones de parámetros con una torre de visión y un cabezal de salida de 202.048 tokens. La relevancia de esta ficha radica en que no se trata de un checkpoint estándar: es un contenedor de inferencia con decodificación especulativa integrada (DFlash2) y kernels optimizados para GPUs AMD RDNA4.

El contenedor incluye 1.261 pesos, de los cuales 395 están cuantizados y 866 se mantienen en su forma original (BF16). La cuantización combina trellises computados `fwht128` con GPTQ para las capas MLP, dejando en BF16 la torre de visión, las normas, los embeddings y el cabezal de salida. El tamaño final del repositorio es de 26,2 GB (24,40 GiB), lo que lo hace viable en GPUs de consumo alto y en aceleradores profesionales de AMD.

La propuesta técnica es interesante porque demuestra un pipeline de cuantización específico para hardware AMD RDNA4 con un drafter especulativo acoplado, algo poco habitual en el ecosistema abierto, dominado por CUDA y GGUF. No obstante, la licencia Apache-2.0 del modelo base se mantiene, y el autor advierte explícitamente de que este repositorio no otorga derechos adicionales sobre los términos upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con torre de visión y decodificación especulativa DFlash2 (arquitectura Radiance `museglimmer_ct`) |
| Parámetros totales | 30.000 millones (modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (`max-model-len`) |
| Tipos de cuantización | IQ4R-V4: U4 en Q/K/V/gate y MLP gate/up/down, U5 en salida de atención, U3 en MLP del drafter, U4 en atención y FC del drafter; BF16 en cabezal de salida, embeddings, normas, torre de visión y convoluciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor `.rad` propietario de Radiance (no es safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 30.000 millones de parámetros con una torre de visión integrada, un vocabulario de 202.048 tokens y un cabezal de salida que se mantiene en BF16 en esta cuantización. La innovación principal del contenedor es la incorporación de un drafter DFlash2 (decodificación especulativa) empaquetado junto al modelo principal, lo que permite generar borradores de tokens y verificarlos con el modelo grande, reduciendo la latencia de decodificación.

La cuantización se realizó con el recetario `museglimmer-30b-iq4r-v4.recipe` de Radiance. Las capas lineales del tronco Muse usan trellises computados `fwht128` con `tcq=16` y act-order donde está configurado. Las capas MLP gate/up y down se ajustaron con GPTQ usando las matrices Hessian RADGRAM2 correspondientes a la configuración TP2 de Muse; las Hessian de atención no se capturaron, por lo que esas reglas usan el fallback de redondeo más cercano sin Gram. El drafter DFlash2 usa U4 en atención y FC, U3 en MLP, y mantiene su cabezal de salida en BF16 porque el vocabulario de 202.048 tokens no está servido por los kernels de cabezal cuantizado rotado. No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva con contexto largo de hasta 131.072 tokens.
- Procesamiento de imágenes mediante torre de visión (aunque el autor indica que las mediciones no cubren el servicio de imágenes y recomienda `mm-max-patches: 0` para texto).
- Decodificación especulativa con drafter DFlash2 integrado, con aceptación de borradores del 37,3% en la prueba publicada.
- Soporte de caché KV en i8 (E4M3/fp8 no soportado por el plugin de este contenedor).
- Razonamiento multi-turno y conversación con plantilla de chat (`chat_template.jinja`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo de pensamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de texto en GPUs AMD RDNA4: el contenedor está optimizado para kernels `libr4d` y se ha validado en una Radeon AI PRO R9700, por lo que encaja en estaciones de trabajo con hardware AMD que no pueden usar CUDA.
- Generación de texto con contexto largo: con 131.072 tokens de ventana, es adecuado para resumir documentos extensos, analizar contratos o mantener conversaciones con historial amplio en una sola pasada.
- Despliegue en un solo acelerador: el ejemplo de configuración usa `tp: 1` y 30.000 MiB de VRAM, lo que permite servir el modelo en una única GPU profesional sin necesidad de tensor parallelism.
- Prototipado de decodificación especulativa: el drafter DFlash2 integrado permite evaluar el impacto de la generación especulativa en latencia y throughput sin montar un pipeline externo.
- Investigación en cuantización: el recetario y el dataset de calibración RADGRAM2 permiten reproducir la conversión y estudiar el efecto de U3/U4/U5 en la fidelidad respecto a BF16.
- Evaluación de fidelidad de cuantización: las métricas de KL y acuerdo top-1 publicadas (0,012134 de KL media y 96,099% de acuerdo top-1) sirven como referencia para comparar otras cuantizaciones del mismo modelo base.
- Servicio de chat multi-turno con caché i8: la configuración de ejemplo con `max-num-seqs: 1` y `max-num-batched-tokens: 4096` está pensada para cargas de baja concurrencia y contexto largo.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---:|
| Prefill de 32.495 tokens | 2.295 tok/s |
| Decode posterior de 2.048 tokens | 70,24 tok/s |
| Borradores DFlash2 aceptados | 1.587 / 4.259 (37,3%) |
| Tiempo total | 43,3 s |
| KL media (BF16 ‖ candidato) | 0,012134 |
| Acuerdo top-1 | 96,099% |
| PPL del candidato | 4,2289 |
| PPL de referencia BF16 | 4,2099 |

Las mediciones se realizaron en TP1 sobre una Radeon AI PRO R9700 (dispositivo físico 2), con caché KV i8, sin prefix cache y con DFlash2 adaptativo. La fidelidad se midió con teacher forcing sobre 271.810 posiciones de 568 documentos con plantilla Muse. El autor advierte de que estas métricas son específicas del corpus y no constituyen benchmarks de tareas amplios, y que el resultado de velocidad no es comparable con mediciones previas con KV en FP8. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 30.000 MiB según la configuración de ejemplo (`gpu-memory-mib: 30000`), con caché KV i8.
- GPU validadas: Radeon AI PRO R9700 (AMD RDNA4). No se han publicado pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no hay datos que confirmen su funcionamiento en GPUs consumer; el contenedor requiere kernels `libr4d` y la arquitectura `museglimmer_ct` de Radiance.
- Despliegue: exclusivamente mediante Radiance 2.1.0 o superior con `radiance --config FILE`; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser safetensors ni GGUF.
- Throughput medido: 2.295 tok/s en prefill de 32.495 tokens y 70,24 tok/s en decode de 2.048 tokens en la configuración indicada.
- Concurrencia: la configuración de ejemplo usa `max-num-seqs: 1`, pensada para una sola secuencia simultánea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse Glimmer 30B IQ4R-V4 (este) | 30.000 M | 131.072 | `.rad` (Radiance) | Apache-2.0 | Hugging Face, requiere Radiance 2.1.0+ |
| Meta Muse Glimmer 30B (base) | 30.000 M | no disponible | safetensors (BF16) | Apache-2.0 | Hugging Face |
| Otras cuantizaciones del mismo base | 30.000 M | no disponible | no disponible | Apache-2.0 (heredada) | no disponible |

No se dispone de información sobre cuantizaciones alternativas del mismo modelo base ni sobre modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El contenedor no es un checkpoint estándar: no funciona con Transformers, llama.cpp, vLLM ni Ollama; requiere Radiance 2.1.0 o superior y kernels `libr4d`.
- La cuantización IQ4R-V4 introduce una degradación medible: la perplejidad es un 0,45% superior a la referencia BF16 y el acuerdo top-1 es del 96,099%, con una KL media de 0,012134.
- Las Hessian de atención no se capturaron, por lo que esas capas usan el fallback de redondeo más cercano sin Gram, lo que puede afectar a la fidelidad en atención.
- El cabezal de salida del drafter DFlash2 se mantiene en BF16 por limitaciones de los kernels de cabezal cuantizado rotado, lo que incrementa el uso de memoria.
- El plugin de este contenedor solo soporta caché KV en i8; E4M3/fp8 no está soportado.
- Las mediciones de velocidad y fidelidad son específicas de una Radeon AI PRO R9700 y de un corpus concreto; no deben extrapolarse a otras GPUs ni a benchmarks de tareas generales.
- El autor no cubre el servicio de imágenes en las mediciones y recomienda `mm-max-patches: 0` para texto, por lo que el rendimiento multimodal no está validado.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo base.
- La licencia Apache-2.0 del modelo base se mantiene, pero el repositorio no otorga derechos adicionales sobre los términos upstream; debe consultarse `USAGE_POLICY.md`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gostar77/muse-glimmer-30b-iq4r-v4-radiance
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Dataset de calibración: https://huggingface.co/datasets/gostar77/muse-glimmer-30b-iq4r-v4-calibration
- Repositorio Radiance: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
