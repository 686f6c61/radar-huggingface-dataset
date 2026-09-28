# jeffpeng3/Ornith-1.5-35B-A3B-heretic-ja-NVFP4

## Resumen

Ornith-1.5-35B-A3B-heretic-ja-NVFP4 es una cuantizacion de precision mixta (NVFP4 + FP8) del modelo OS-Software/Ornith-1.5-35B-A3B-heretic-ja, que a su vez es una version con el alineamiento de seguridad reducido (abliterated) del modelo multimodal de mezcla de expertos ornith-ai/Ornith-1.5-35B-A3B. La publica el usuario jeffpeng3 y esta pensada para inferencia eficiente en vLLM sobre hardware con soporte de FP4 de NVIDIA (Blackwell o superior). El checkpoint ocupa unos 22,5 GB repartidos en tres shards de safetensors.

La relevancia de esta ficha es triple: por un lado, demuestra un flujo de cuantizacion NVFP4 con NVIDIA ModelOpt 0.45.0 sobre un MoE multimodal; por otro, documenta un caso de ablacion selectiva con Heretic v1.4.0 y el metodo ARA (Arbitrary-Rank Ablation), que elimina las respuestas de rechazo (2/100 palabras clave frente a 100/100 del original) con una divergencia KL de solo 0,0477; y, por ultimo, sirve como ejemplo de publicacion derivada bajo licencia MIT.

El modelo base pertenece a la familia Ornith-1.5, construida sobre Qwen3.5 y Gemma4 con preentrenamiento continuado y un bucle de auto-mejora con aprendizaje por refuerzo sobre generacion de tareas, scaffolds y rollouts. Activa aproximadamente 3.000 millones de parametros por token sobre un total declarado de 35.000 millones. Conviene advertir que los metadatos de safetensors del repo suman 19.528.501.104 parametros, una cifra inferior a la que sugiere el nombre comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) multimodal, tag `qwen3_5_moe`, con encoder de vision y cabezas MTP |
| Parametros totales | 19.528.501.104 segun los safetensors del repo; la nomenclatura del modelo indica 35B |
| Parametros activos | ~3B por token (sufijo A3B) |
| Longitud de contexto | 262.144 tokens segun la receta de despliegue publicada para el checkpoint NVFP4 de la familia ornith-ai; no se confirma de forma explicita en la model card de esta cuantizacion concreta |
| Tipos de cuantizacion | Precision mixta: FP8 estatico por tensor (130 lineales de atencion), W4A16 NVFP4 con grupo 16 (161 modulos: expertos MoE, `shared_expert.gate/up/down` y `lm_head`), bf16 en encoder de vision y MTP; cache KV en bf16 por defecto con FP8 opcional |
| Idiomas soportados | No disponible en los metadatos de HuggingFace; la calibracion y la evaluacion se realizaron con datos en ingles (wikitext-2) y japones (fineweb-2) |
| Licencia | MIT |
| Formato de pesos | safetensors (3 shards, ~22,5 GB; repo de 23,4 GB) |
| Cuantizador | NVIDIA ModelOpt 0.45.0 |
| Metodo de ablacion | Heretic v1.4.0+custom con Arbitrary-Rank Ablation (ARA) mediante adaptador LoRA y preservacion de norma de fila; capas 14 a 28 |
| Fecha de publicacion en HuggingFace | 2026-09-28 |

## Arquitectura y entrenamiento

El modelo original Ornith-1.5-35B-A3B es un MoE de la familia Ornith, desarrollada a partir de Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training. Su rasgo distintivo es un bucle de auto-mejora que, en lugar de apoyarse en un conjunto fijo de tareas curadas a mano, genera continuamente nuevas tareas de entrenamiento, descubre estrategias para resolverlas y optimiza la politica mediante aprendizaje por refuerzo, incluyendo la optimizacion conjunta de generacion de tareas, construccion de scaffolds y rollouts. El modelo activa unos 3B de parametros por token y esta orientado a codigo agentico, uso de herramientas y trabajo de horizonte largo.

Sobre esa base, OS-Software aplico una ablacion de seguridad con Heretic v1.4.0+custom empleando el metodo ARA con adaptador LoRA y preservacion de norma de fila, con los parametros documentados: `start_layer_index` 14, `end_layer_index` 28, `preserve_good_behavior_weight` 1,0000, `steer_bad_behavior_weight` 0,0061, `overcorrect_relative_weight` 2,8147, `neighbor_count` 1 y `secondary_update_weight` 0,0000. El resultado reportado es una caida de las palabras clave asociadas a rechazo de 100/100 a 2/100, con una divergencia KL de 0,0477 respecto al modelo original.

La cuantizacion de jeffpeng3 mantiene el mismo formato que ornith-ai/Ornith-1.5-35B-A3B-NVFP4: atencion en FP8 estatico por tensor, expertos MoE y `lm_head` en NVFP4 W4A16 con grupo 16, y encoder de vision sin cuantizar en bf16. Las escalas FP8 se calibraron sobre 256 secuencias de 2.048 tokens (128 de wikitext-2 en ingles y 128 de fineweb-2 en japones). El repo de origen no incluia pesos MTP, por lo que las 785 matrices MTP (1,69 GB) se injertaron en bf16 desde ornith-ai/Ornith-1.5-35B-A3B-NVFP4 para permitir decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en formato chat, con salida de razonamiento segun la receta de despliegue publicada para la familia.
- Codigo agentico y tareas de horizonte largo, ambito declarado de diseno del modelo base.
- Tool calling y function calling, documentados en la receta de despliegue en DGX Spark.
- Procesamiento de imagen y texto: el tag `image-text-to-text` y la presencia de un encoder de vision en bf16 indican entrada multimodal.
- Decodificacion especulativa mediante cabezas MTP injertadas (`--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`), con tasa de aceptacion variable segun la propia model card.
- Cache KV configurable en bf16 o FP8 (`--kv-cache-dtype fp8`) para contextos largos.
- Multilingue: sin lista de idiomas en los metadatos; la calibracion y la evaluacion cubren ingles y japones, y el sufijo `-ja` apunta a un enfasis en japones.
- Reduccion drastica del comportamiento de rechazo (2/100 palabras clave en japones), lo que constituye una capacidad buscada en investigacion de seguridad pero un riesgo en produccion.

## Casos de uso

- Investigacion en seguridad y red-teaming: es el uso previsto declarado por el autor; al presentar una tasa de rechazo de 2/100 conviene emplearlo para medir la eficacia de filtros externos, clasificadores de salida y evaluaciones de jailbreak en japones.
- Estudios de alineacion y ablacion: permite reproducir el analisis de compromiso entre eliminacion de rechazos y degradacion del modelo, ya que la propia model card publica la divergencia KL (0,0477) frente al original.
- Evaluacion de cuantizacion NVFP4: sirve para medir la fidelidad de la precision mixta (atencion FP8, expertos W4A16 grupo 16) frente al checkpoint en bf16, aislando el efecto de la cuantizacion del efecto de la ablacion.
- Asistente de codigo en una red interna: el modelo base esta disenado para codigo agentico con tool calling, y el checkpoint de 22,5 GB se puede servir en vLLM dentro de un cluster con GPUs Blackwell para tareas de refactorizacion, generacion de tests y revision de parches.
- Procesamiento de documentos japoneses con componente visual: gracias al encoder de vision sin cuantizar y a un contexto declarado de 262.144 tokens, permite extraer y resumir informacion de documentos escaneados largos en japones en un unico prompt.
- Despliegue on-premise en un DGX Spark: existe una receta nativa de vLLM para una DGX Spark / GB10 con 262K de contexto, cache KV en FP8 y tool calling, pensada para throughput multi-usuario en memoria unificada de 128 GB.
- Generacion de codigo en pipelines de CI/CD: integrado como servicio vLLM con tool calling, puede generar parches o tests automaticos y devolver resultados estructurados a un orquestador, siempre con revision humana por la ausencia de alineamiento de seguridad.
- Laboratorio de evaluacion comparativa de modelos decensurados: permite contrastar, con la misma arquitectura y cuantizacion, el comportamiento de un MoE de ~3B activos ablacionado frente a alternativas densas en tareas japonesas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K y similares) con cifras numericas en la informacion disponible: la model card del modelo base referencia graficas de evaluacion no extraidas en el texto y afirma, sin cifras disponibles, que supera a Qwen 3.6-35B en todos los benchmarks de codigo y agenticos y a modelos densos como Gemma 4-31B y Muse Glimmer-30B en codigo agentico.

Si se documentan las metricas de la ablacion, medidas con conjuntos de datos en japones:

| Metrica | Este modelo | Modelo original (ornith-ai/Ornith-1.5-35B-A3B) |
|---|---|---|
| Keywords (tasa de rechazo, japones) | 2/100 | 100/100 |
| Divergencia KL | 0,0477 | 0 (por definicion) |

No hay datos publicados de latencia ni de throughput para esta cuantizacion concreta.

## Requisitos de hardware

- Los pesos ocupan ~22,5 GB en NVFP4/FP8 mixto (repo de 23,4 GB), por lo que se necesitan al menos unos 24 GB de VRAM solo para el modelo, antes de contar cache KV y overhead del runtime. Estimacion derivada del tamano del repo, no publicada por el autor.
- Las GPU con soporte nativo de FP4 (familia Blackwell) son el objetivo natural; en generaciones anteriores el formato NVFP4 puede no estar soportado por el kernel.
- GPU de 24 GB (RTX 3090, RTX 4090): encaje muy ajustado; solo viable con contexto corto, poca concurrencia y cache KV en FP8. No es un escenario recomendado.
- GPU de 32 a 48 GB (RTX 5090, L40S, A6000): escenario realista para uso mono-usuario con contexto medio.
- GPU de 80 GB (A100, H100): margen amplio para contexto largo y concurrencia moderada, aunque el rendimiento FP4 depende del soporte del hardware.
- NVIDIA DGX Spark / GB10 con 128 GB de memoria unificada: existe una receta publicada y validada para el checkpoint NVFP4 de la familia, con contexto de 262K, cache KV en FP8 y tool calling.
- Despliegue recomendado: vLLM con `--quantization modelopt --load-format instanttensor --dtype bfloat16 --trust-remote-code`, con opciones de cache KV en FP8 y decodificacion especulativa MTP.
- Alternativas: llama.cpp u Ollama a traves de las cuantizaciones GGUF publicadas en el repo hermano OS-Software/Ornith-1.5-35B-A3B-heretic-ja-GGUF. No hay evidencia de soporte en TGI para el formato modelopt.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Alineamiento de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jeffpeng3/Ornith-1.5-35B-A3B-heretic-ja-NVFP4 (este) | ~19,5B totales, ~3B activos | 262K segun receta de la familia | Mixta FP8 + NVFP4 W4A16 grupo 16 | Reducido (2/100 keywords) | MIT | HuggingFace, 0 descargas |
| ornith-ai/Ornith-1.5-35B-A3B | ~35B totales declarados, ~3B activos | No disponible en la informacion | bf16 | Estandar (100/100 keywords) | No disponible en la informacion | HuggingFace |
| ornith-ai/Ornith-1.5-35B-A3B-NVFP4 | ~35B totales declarados, ~3B activos | 262K segun receta DGX Spark | Mixta FP8 + NVFP4 | Estandar | No disponible en la informacion | HuggingFace, con receta para DGX Spark |
| OS-Software/Ornith-1.5-35B-A3B-heretic-ja | No disponible | No disponible | bf16 (origen de la ablacion) | Reducido | MIT segun el derivado | HuggingFace, con version GGUF |

Comparativas citadas por el autor sin cifras disponibles: Qwen 3.6-35B (peer de tamano similar), Gemma 4-31B y Muse Glimmer-30B (modelos densos frente a los que se reclama ventaja en codigo agentico).

## Limitaciones y advertencias

- El alineamiento de seguridad esta sustancialmente reducido: la propia model card advierte de una mayor probabilidad de generar contenido danino, inexacto, sesgado u ofensivo. El uso previsto declarado es exclusivamente investigacion, estudios de alineacion y red-teaming.
- No debe desplegarse en servicios publicos o de cara al usuario final segun la recomendacion del autor; toda salida debe tratarse como no fiable y verificarse de forma independiente.
- Discrepancia de nomenclatura: el nombre indica 35B-A3B, pero los safetensors del repo suman 19.528.501.104 parametros. Conviene verificar la configuracion real antes de dimensionar infraestructura.
- La evaluacion de rechazos se hizo con conjuntos de datos en japones, por lo que el comportamiento documentado puede no extrapolarse a otros idiomas.
- No hay lista de idiomas soportados en los metadatos ni benchmarks generales publicados, lo que limita la comparacion objetiva con alternativas.
- La decodificacion especulativa MTP usa cabezas injertadas desde otro checkpoint (el repo de origen no incluia pesos MTP); la propia model card advierte de que la tasa de aceptacion varia.
- Las escalas FP8 se calibraron con solo 256 secuencias (128 en ingles, 128 en japones) de 2.048 tokens, un conjunto reducido que puede no representar dominios muy distintos.
- Riesgo de alucinacion: no hay datos publicados especificos, pero la combinacion de ablacion de seguridad y ausencia de benchmarks de fidelidad impide descartarlo.
- Restricciones de licencia: el derivado se publica bajo MIT, con enlace a la licencia del modelo base; es responsabilidad del usuario verificar que la cadena de licencias (Qwen3.5/Gemma4 subyacentes) permite el uso comercial previsto.
- La cuantizacion NVFP4 depende del soporte de kernel del runtime y del hardware; en GPU sin soporte FP4 el rendimiento puede degradarse o el modelo puede no cargar.
- Riesgo legal y reputacional: un modelo sin rechazos desplegado sin filtros externos puede producir contenido que vulnere politicas de plataforma o normativa aplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jeffpeng3/Ornith-1.5-35B-A3B-heretic-ja-NVFP4
- Discusiones del modelo: https://huggingface.co/jeffpeng3/Ornith-1.5-35B-A3B-heretic-ja-NVFP4/discussions
- Modelo origen de la ablacion: https://huggingface.co/OS-Software/Ornith-1.5-35B-A3B-heretic-ja
- Cuantizaciones GGUF del modelo heretic-ja: https://huggingface.co/OS-Software/Ornith-1.5-35B-A3B-heretic-ja-GGUF
- Modelo base de la familia: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Checkpoint NVFP4 de referencia: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- README del checkpoint NVFP4 de referencia: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Blog de Ornith: https://ornith.ai/ornith_1_5.html y https://deep-reinforce.com/ornith.html
- Heretic (herramienta de ablacion): https://heretic-project.org y https://github.com/p-e-w
- Receta de despliegue en DGX Spark: https://github.com/sojufx/Ornith-1.5-35B-A3B-NVFP4-DGX-Spark
- Ficha en LLM Explorer: https://llm-explorer.com/model/ornith-ai%2FOrnith-1.5-35B-A3B-NVFP4,7n1txA06r5AvDsvyAxdpor
