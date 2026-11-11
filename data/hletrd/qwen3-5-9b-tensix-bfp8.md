# hletrd/Qwen3.5-9B-Tensix-BFP8

## Resumen

Qwen3.5-9B-Tensix-BFP8 es una cuantizacion del modelo Qwen/Qwen3.5-9B realizada por Xylolabs (publicada bajo el usuario hletrd) para su ejecucion en las NPU Tensix de Tenstorrent, presentes en las tarjetas Wormhole y Blackhole. El modelo conserva la arquitectura original de Qwen3.5-9B, que combina capas de atencion clasica con capas de Gated DeltaNet, e incorpora pesos cuantizados a formato block-floating-point de 8 bits (bfloat8_b o BFP8) en las proyecciones lineales, mientras que embeddings, LM head, normas, el bloque MTP y la torre visual permanecen en bf16.

La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra una ruta de cuantizacion GPTQ especifica para el empaquetado BFP8 de TT-NN (tt-metal), de modo que los pesos se almacenan en bf16 pero ya redondeados a la rejilla BFP8, evitando un segundo redondeo al cargarlos en la NPU. El resultado ocupa 11,42 GB empaquetados con una media de 10,21 bits por peso, frente a los 17,91 GB del modelo BF16 original, con una perdida de calidad medida muy contenida (KL media de 0,00074 frente a BF16 y 38 de 40 respuestas correctas identicas).

El modelo tiene 9.653.104.368 parametros totales, licencia Apache-2.0 y pipeline image-text-to-text, lo que indica que mantiene la capacidad multimodal del modelo base. Es importante senalar que el autor lo ha validado en el simulador ttsim de Blackhole con ttnn 0.81.1, no en hardware fisico, y que la demo oficial de tt-metal para Qwen3.5/3.6 no ejecuta este checkpoint a su precision original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion clasica y Gated DeltaNet (arquitectura Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (ttnn.bfloat8_b) en proyecciones lineales; bf16 en embeddings, LM head, normas, MTP y torre visual; export BFP4 alternativo mencionado para la demo de tt-metal |
| Idiomas soportados | no disponible (evaluacion en ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (valores bf16 ya alineados a la rejilla BFP8), con `quant4.json` e indice de safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B: un transformer hibrido en el que conviven capas de atencion clasica (q, k, v, o en 8 capas) y capas de Gated DeltaNet (q, k, v, z, a, b y output en 24 capas), junto con bloques MLP densos de tipo gate/up/down en 32 capas. El checkpoint incluye ademas un bloque MTP (multi-token prediction) y una torre visual (`visual`), ambos conservados en bf16 sin cambios respecto al modelo base. Esta publicacion no entrena el modelo desde cero: parte de Qwen/Qwen3.5-9B y aplica una cuantizacion post-entrenamiento.

La innovacion tecnica reside en el procedimiento de cuantizacion: GPTQ redondea cada proyeccion lineal directamente sobre la rejilla bfloat8_b de TT-NN, usando como exponente compartido de cada bloque el que emplea el propio empaquetador de Tenstorrent, y calibra sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los tensores se guardan en bf16 pero cada valor ya esta en la rejilla BFP8, de forma que TT-NN los empaqueta sin volver a redondear. El autor solo cuantizo y evaluo el modelo de lenguaje; la parte visual no fue evaluada. El repositorio incluye `quant4.json` con el formato de cada proyeccion, asi como los scripts `pack_tensix.py` y `verify_grid.py` para comprobar que ningun valor cambia al empaquetar.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`), tal como se muestra en el ejemplo de inicio rapido.
- Procesamiento image-text-to-text: el checkpoint conserva la torre visual en bf16, por lo que mantiene la capacidad multimodal del modelo base (no evaluada por el autor).
- Razonamiento con modo thinking: la evaluacion incluye 7 prompts de razonamiento repetidos con thinking activado.
- Prediccion multi-token mediante el bloque MTP conservado en bf16.
- Capacidades multilingues: la calibracion y la evaluacion cubren ingles y coreano, aunque no se publica una lista formal de idiomas soportados.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Blackhole o Wormhole: el checkpoint esta disenado para cargarse directamente en TT-NN sin re-redondeo, reduciendo el espacio en DRAM a 11,42 GB frente a 17,91 GB en BF16, lo que permite servir Qwen3.5-9B en aceleradores Tensix con perdida de calidad minima.
- Validacion de pipelines de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que el empaquetado BFP8 no altera ningun valor, util para equipos que integren GPTQ con tt-metal.
- Inferencia conversacional de bajo coste: con una KL media de 0,00074 frente a BF16 y 38 de 40 respuestas correctas, es adecuado para asistentes de texto donde el ahorro de memoria importa mas que la fidelidad bit a bit.
- Investigacion en formatos block-floating-point: sirve como referencia reproducible de como calibrar GPTQ sobre la rejilla bfloat8_b con exponentes compartidos por bloque.
- Prototipado multimodal en simulador: al conservar la torre visual en bf16, permite probar flujos image-text-to-text en el simulador ttsim antes de disponer de hardware.
- Evaluacion comparativa de cuantizaciones: el propio autor lo compara con Q4_K_M de llama.cpp (5,02 bits por peso, KL 0,03669, 37 de 40 correctas), lo que lo convierte en un punto de referencia para estudiar el compromiso entre bits por peso y fidelidad.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-9B) | 16 | 17,91 | 0 | 100 | 38 de 40 | - |
| Este modelo (BFP8) | 10,21 | 11,422 | 0,00074 | 98,68 | 38 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,02 | 5,780 | 0,03669 | 90,47 | 37 de 40 | 1 |

Las metricas de KL y top-1 cubren 16.312 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica mas 7 prompts de razonamiento repetidos con thinking activado (40 en total); "perdidas" cuenta las correctas en BF16 que fallan aqui, sin contar empates cercanos. Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 11,42 GB empaquetados en BFP8; el repositorio completo ocupa 19,3 GB por incluir tensores bf16 y ficheros auxiliares.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole y Blackhole). La demo oficial de tt-metal para Qwen3.5/3.6 ejecuta Qwen3.5-9B en una unica Blackhole P150.
- Validacion realizada en el simulador ttsim de Blackhole con ttnn 0.81.1, no en hardware fisico.
- Carga en GPU/CPU: posible via transformers con `dtype="bfloat16"` y `device_map="auto"`, aunque en ese caso se pierde la ventaja del empaquetado BFP8 y se usan los valores bf16.
- Opciones de despliegue: TT-NN (tt-metal) para Tensix; transformers para carga generica; tt-forge (tt-xla) aun no probado con este checkpoint y, por defecto, mantiene bf16 (su opcion `bfp_bf8` re-redondea los valores).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Bits por peso | Tamano | Contexto | Licencia | Notas |
|---|---|---:|---:|---|---|---|
| Qwen3.5-9B-Tensix-BFP8 | 9,65 B | 10,21 | 11,42 GB | no disponible | Apache-2.0 | Objetivo Tensix, validado en simulador |
| Qwen/Qwen3.5-9B (BF16) | 9,65 B | 16 | 17,91 GB | no disponible | Apache-2.0 | Referencia de fidelidad, KL 0 y top-1 100 % |
| Qwen3.5-9B Q4_K_M (llama.cpp) | 9,65 B | 5,02 | 5,78 GB | no disponible | Apache-2.0 | Mas compacto pero KL 0,03669 y 37 de 40 correctas |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion proporcionada no incluye otros modelos de la misma categoria. Frente a Q4_K_M, este checkpoint gasta el doble de bits por peso pero reduce la divergencia respecto a BF16 en casi dos ordenes de magnitud y no pierde ninguna respuesta correcta.

## Limitaciones y advertencias

- Solo se cuantizo y evaluo el modelo de lenguaje; la torre visual y el bloque MTP se mantienen en bf16 sin evaluacion publicada.
- La validacion se hizo en el simulador ttsim de Blackhole con ttnn 0.81.1, no en hardware Tensix real.
- La demo oficial de tt-metal (v0.81.1) para Qwen3.5/3.6 no ejecuta este checkpoint a su precision: empaqueta gate y up del MLP en bfloat4_b y re-redondea LM head y MTP a bfloat8_b. Para esa demo encaja mejor el export BFP4.
- tt-forge (tt-xla) no se ha probado con este checkpoint; su opcion `bfp_bf8` usa el layout [out, in] de PyTorch y vuelve a redondear los valores.
- La carga con transformers en bf16 no aprovecha el empaquetado BFP8 y consume los 17,91 GB equivalentes.
- No se publican resultados de benchmarks estandar ni una lista formal de idiomas soportados; la evaluacion se limita a ingles y coreano.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este checkpoint; hereda los del modelo base Qwen3.5-9B.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias de Tenstorrent (tt-metal, ttnn).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3.5-9B-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Revision del modelo base usada en la evaluacion: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Demo Qwen3.5/3.6 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Licencia: https://huggingface.co/hletrd/Qwen3.5-9B-Tensix-BFP8/blob/main/LICENSE
