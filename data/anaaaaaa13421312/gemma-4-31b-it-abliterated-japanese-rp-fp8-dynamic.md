# anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP-FP8-Dynamic

## Resumen

`gemma-4-31B-it-abliterated-Japanese-RP-FP8-Dynamic` es un checkpoint derivado del modelo `gemma-4-31B-it-abliterated-Japanese-RP`, publicado por el usuario `anaaaaaa13421312` en Hugging Face. Se trata de una cuantizacion FP8 dinamica del modelo base, generada con la libreria `llm-compressor` mediante el metodo `model_free_ptq` y el esquema `FP8_DYNAMIC`. El objetivo declarado es reducir el peso del modelo para poder desplegarlo en GPUs de 48 GB de VRAM (L40S, RTX 6000 Ada, A40 con Marlin) y en TPU v7x, manteniendo en BF16 las capas criticas: `lm_head`, modulos de vision y audio, `embed_tokens` y las normas.

El modelo base es una variante "abliterated" (es decir, con el rechazo del modelo ajustado para reducir negativas) y especializada en roleplay en japones, construida sobre una supuesta familia Gemma 4 de 31B parametros. El checkpoint cuantizado conserva los 31.273.088.876 parametros del modelo original, pero almacena los pesos de las capas lineales en FP8 (E4M3) con escalas estaticas por canal para los pesos y dinamicas por token para las activaciones.

La relevancia de esta ficha es limitada pero concreta: interesa a quien quiera ejecutar un modelo de roleplay en japones de ~31B en hardware de 48 GB sin perder demasiada calidad respecto al BF16, y a quien estudie tecnicas de cuantizacion FP8 con `compressed-tensors`. No hay informacion publicada sobre licencia, idiomas oficiales, benchmarks ni pipeline, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como `gemma4`; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (`FP8_DYNAMIC`): pesos FP8 E4M3 con escala estatica por canal, activaciones FP8 con escala dinamica por token; `lm_head`, modulos de vision/audio, `embed_tokens` y normas en BF16 |
| Idiomas soportados | no disponible oficialmente; el nombre y las etiquetas indican especializacion en japones (`japanese`) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` con formato `compressed-tensors` (repo de 33,3 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base mas alla de la etiqueta `gemma4` y de la presencia de modulos de vision y audio mencionados en la model card (lo que sugiere un modelo multimodal, aunque no se confirma). Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. El nombre "abliterated" indica que el modelo base fue sometido a una modificacion para reducir el comportamiento de rechazo, pero no se detalla el procedimiento.

La innovacion tecnica documentada de este checkpoint es exclusivamente la cuantizacion: se aplico `llmcompressor.model_free_ptq` con `scheme="FP8_DYNAMIC"`, un metodo de quantizacion post-entrenamiento sin datos (data-free). Las capas lineales se almacenan en FP8 E4M3, con escalas estaticas por canal para los pesos y escalas dinamicas por token para las activaciones. Se preservan en BF16 el `lm_head`, los modulos de vision y audio, `embed_tokens` y las capas de normalizacion, lo que busca limitar la degradacion en la cabeza de salida y en las entradas multimodales. El destino declarado son GPUs de 48 GB (L40S, RTX 6000 Ada, A40 con kernel Marlin) y TPU v7x.

## Capacidades

- Generacion de texto y conversacion multi-turno, orientada a roleplay segun el nombre y las etiquetas del modelo.
- Especializacion declarada en japones (`japanese`) y en escenarios de roleplay (`roleplay`).
- Presunta capacidad multimodal (vision y audio) por la mencion a modulos de vision/audio en la model card, aunque no se detalla su funcionamiento ni se aportan ejemplos.
- Comportamiento "abliterated": el modelo base fue modificado para reducir rechazos, lo que afecta al estilo de respuesta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles mas alla de la especializacion en japones.
- Modo "thinking", vision o audio documentados: no disponible.

## Casos de uso

- Roleplay conversacional en japones: el modelo esta etiquetado explicitamente para `roleplay` y `japanese`, por lo que su uso previsto es mantener personajes y dialogos multi-turno en ese idioma; la cuantizacion FP8 permite servirlo en una GPU de 48 GB.
- Despliegue en GPUs de 48 GB: al estar cuantizado en FP8, encaja en L40S, RTX 6000 Ada o A40, lo que permite montar un endpoint de inferencia sin recurrir a nodos multi-GPU.
- Experimentacion con cuantizacion FP8: sirve como caso practico de `llm-compressor` con `FP8_DYNAMIC` y `compressed-tensors` para comparar calidad frente al BF16 original.
- Pruebas en TPU v7x: la model card menciona este destino, por lo que puede usarse para validar el rendimiento del formato en ese hardware.
- Investigacion sobre modelos "abliterated": util para estudiar como afecta la eliminacion del rechazo al comportamiento en tareas sensibles, siempre con las cautelas de la seccion de limitaciones.
- Generacion creativa y narrativa en japones: la combinacion de roleplay y contexto conversacional lo hace adecuado para prototipos de escritura asistida o simulacion de personajes, sujeto a revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 33,3 GB, por lo que la inferencia en FP8 requiere aproximadamente 33-35 GB de VRAM solo para los pesos, mas el espacio para cache KV y activaciones. Con contexto largo, conviene reservar 40-48 GB.
- GPU recomendadas segun la model card: L40S (48 GB), RTX 6000 Ada (48 GB) y A40 (48 GB) con kernel Marlin; tambien se menciona TPU v7x.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090, RTX 3090) sin cuantizacion adicional a 4 bits; no se documenta una version GGUF o AWQ en este repositorio.
- Opciones de despliegue: el formato `compressed-tensors` es compatible con vLLM y con el ecosistema de `llm-compressor`; no se confirma soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31B-it-abliterated-Japanese-RP-FP8-Dynamic | 31,27 B | no disponible | FP8 dinamico | no disponible | Hugging Face (0 descargas) |
| gemma-4-31B-it-abliterated-Japanese-RP (base) | 31,27 B | no disponible | BF16 | no disponible | Hugging Face |
| Alternativas de ~30B en FP8 | no disponible | no disponible | FP8 | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparativa cuantitativa con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Modelo "abliterated": la eliminacion del comportamiento de rechazo incrementa el riesgo de generar contenido inapropiado, ofensivo o inseguro; requiere filtros y supervision en produccion.
- Especializacion estrecha: el ajuste esta orientado a roleplay en japones, por lo que el rendimiento en otros idiomas o tareas (codigo, matematicas, razonamiento formal) es desconocido y probablemente inferior.
- Riesgo de alucinacion: no hay evaluaciones publicadas; al ser un modelo pequeno-mediano especializado, la fiabilidad factual no esta garantizada.
- Cuantizacion FP8 sin datos: al ser `model_free_ptq`, no se ha calibrado con un dataset representativo, lo que puede introducir degradacion adicional respecto al BF16 en tareas sensibles.
- Contexto e idiomas no documentados: se desconoce la ventana de contexto real y la cobertura linguistica mas alla del japones.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni ejemplos de uso, lo que reduce la confianza en su mantenimiento.
- Fecha de creacion futura (2026-11-15) en los metadatos: conviene tratar los datos del repositorio con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP-FP8-Dynamic
- Modelo base: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP
- Libreria de cuantizacion: https://github.com/vllm-project/llm-compressor
- Formato compressed-tensors: https://github.com/neuralmagic/compressed-tensors
