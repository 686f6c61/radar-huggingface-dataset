# huginnfork/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es una cuantizacion en FP8 del modelo multimodal denso Qwen/Qwen3.8-27B, publicado por el usuario huginnfork. El modelo base pertenece a la familia Qwen3.5 (arquitectura `qwen3_5`) y combina atencion hibrida (lineal tipo SSM mas atencion completa), una torre de vision y una cabeza de prediccion multi-token (MTP) orientada a decodificacion especulativa. Con 27.781.427.952 parametros totales, se distribuye en formato safetensors y esta pensado para inferencia con transformers.

La particularidad de esta build es su esquema de cuantizacion selectiva: FP8_DYNAMIC (W8A8, formato E4M3) aplicado exclusivamente a las proyecciones MLP, manteniendo en bf16 todo el bloque `self_attn`, el bloque `linear_attn` (SSM), la torre visual, `lm_head` y la cabeza MTP. El autor justifica esta decision por la presencia de `attn_output_gate: true` en el modelo base, que fusiona una puerta multiplicativa en `q_proj` y hace desaconsejable cuantizar esa ruta. El resultado son 192 modulos cuantizados frente a los 407 de la release oficial FP8 de Qwen.

El interes practico reside en que reduce el peso de 51,7 GiB en bf16 a 35,8 GiB (8 shards), con una divergencia medida respecto al padre bf16 inferior a la de la version oficial FP8: KLD de 0,0362 frente a 0,0523 en modo weight-only y de 0,0756 frente a 0,1001 tal como se despliega. La licencia Apache 2.0 y su compatibilidad con endpoints lo hacen directamente utilizable en produccion, aunque conviene verificar el soporte real de la arquitectura `qwen3_5` en el stack de inferencia antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (SSM) y atencion completa, torre de vision y cabeza MTP (`qwen3_5`) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8_DYNAMIC W8A8 (E4M3) en MLPs; bf16 en `self_attn`, `linear_attn`, `model.visual`, `lm_head` y `mtp` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (8 shards, 35,8 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 capas, de las cuales solo 16 son de atencion completa y el resto emplean `linear_attn`, un bloque recurrente de tipo SSM (Mamba). Incorpora una torre de vision que lo habilita para tareas image-text-to-text y una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa. El flag `attn_output_gate: true` fusiona una puerta multiplicativa por cabeza en `q_proj`, lo que eleva esa proyeccion a `[12288, 5120]` en lugar de `[6144, 5120]`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. Respecto a esta build, el autor documenta el proceso de cuantizacion con `llm-compressor` y `compressed-tensors`, con una receta `fp8_dynamic_attnbf16.yaml` que aplica escalas por canal de salida y redondeo round-to-nearest. Un experimento incluido en el repositorio compara el layout de escalas (per-tensor, per-output-channel y bloque 128x128) y concluye que, al ser FP8 un formato de coma flotante, las diferencias medias entre layouts son inferiores al 0,1 %; el bloque 128x128 solo mejora el error maximo absoluto en peor caso (0,00426 frente a 0,02065). Tambien se verifico que el vendor oficial uso redondeo RTN estandar, con una discrepancia de reconstruccion inferior al 0,3 %.

## Capacidades

- Generacion de texto conversacional en formato multimodal image-text-to-text.
- Procesamiento de imagenes mediante torre de vision integrada.
- Razonamiento multi-paso y decodificacion especulativa gracias a la cabeza MTP.
- Soporte de atencion hibrida: ventanas largas mediante atencion completa combinada con capas recurrentes de coste lineal.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidades de tool calling y function calling: no disponibles en la informacion proporcionada.
- Capacidades de audio: no disponibles.
- Cobertura multilingue: no disponible.

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede recibir capturas, diagramas o paginas escaneadas junto a texto y responder preguntas sobre su contenido, aprovechando la torre de vision y la ventana de contexto extendida por las capas de atencion lineal.
- Asistentes conversacionales multi-turno: su naturaleza densa de 27B y la ruta de atencion hibrida permiten mantener dialogos largos con coste de memoria controlado, desplegado en FP8 para reducir huella.
- Extraccion de informacion estructurada desde interfaces graficas: dado un screenshot de una aplicacion, generar JSON con los campos visibles, util en pipelines de automatizacion de QA.
- Generacion aumentada por recuperacion (RAG) multimodal: indexar documentos que mezclan texto e imagenes y generar respuestas citando el contenido visual, con la ventaja de que la cuantizacion selectiva preserva la fidelidad de la torre visual en bf16.
- Servicio de inferencia de baja latencia: la cabeza MTP habilita decodificacion especulativa, lo que reduce el numero de pasos de decodificacion por token generado en despliegues con vLLM o TGI que soporten la arquitectura.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye recetas, experimentos de layout de escalas y de redondeo, lo que lo convierte en un caso de referencia para investigar el impacto de cuantizar solo MLPs frente a cuantizar toda la red.
- Despliegue en infraestructura con VRAM limitada: los 35,8 GiB en FP8 permiten servir el modelo en una unica GPU de 48 GB o en dos de 24 GB, algo inviable con los 51,7 GiB en bf16.

## Benchmarks y rendimiento

| Modelo | Modulos cuantizados | KLD (weight-only) | KLD (tal como se despliega) | PPL | Delta PPL |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (bf16) | — | 0 | 0 | 6,9416 | — |
| Qwen/Qwen3.8-27B-FP8 (oficial) | 407 | 0,0523 | 0,1001 | 6,9539 | +0,18 % |
| huginnfork/Qwen3.8-27B-FP8 (esta build) | 192 | 0,0362 | 0,0756 | 6,9325 | -0,13 % |

Mediciones segun el autor: KLD por token sobre 8 muestras de `neuralmagic/calibration` (split LLM) con `max_seq=1024`; PPL sobre `wikitext-2-raw` test en fragmentos no solapados de 2048 tokens. La linea base es el propio Qwen/Qwen3.8-27B en bf16. El autor advierte que un Delta PPL negativo no implica mejora sobre el padre, sino que la perdida queda por debajo del ruido de medida. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tarea en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 35,8 GiB para los pesos en FP8; anadir overhead de activaciones, cache KV y contexto, por lo que en la practica se recomienda un minimo de 48 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB. El autor menciona explicitamente Blackwell como plataforma donde la release oficial FP8 requiere dequantizacion a bf16, lo que sugiere soporte nativo de FP8 en dicha generacion.
- Consumer GPU: no cabe en RTX 4090 (24 GB) con los pesos completos en FP8; serian necesarias al menos dos GPU de 24 GB o una cuantizacion adicional a 4 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI si soportan la arquitectura `qwen3_5` y la cabeza MTP; llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion especulativa via MTP deberia reducir el numero de pasos por token, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KLD (desplegado) | Licencia |
|---|---|---|---|---|---|
| huginnfork/Qwen3.8-27B-FP8 | 27,8B denso | No disponible | FP8 W8A8 en MLPs | 0,0756 | Apache 2.0 |
| Qwen/Qwen3.8-27B-FP8 (oficial) | 27,8B denso | No disponible | FP8 en 407 modulos | 0,1001 | Apache 2.0 |
| Qwen/Qwen3.8-27B (bf16) | 27,8B denso | No disponible | Sin cuantizar | 0 | Apache 2.0 |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion FP8 solo cubre las MLPs; el bloque SSM, la atencion, la torre visual y la cabeza MTP permanecen en bf16, por lo que el ahorro de memoria es de 51,7 a 35,8 GiB y no mayor.
- La arquitectura `qwen3_5` es poco comun; es necesario verificar que la version de transformers, vLLM o TGI soporte `linear_attn` y la cabeza MTP antes de desplegar.
- El autor senala que cuantizar las proyecciones recurrentes del bloque SSM degrada mediblemente esta arquitectura, de modo que no es recomendable aplicar cuantizaciones mas agresivas sin validacion propia.
- El checkpoint oficial FP8 requiere dequantizacion a bf16 en Blackwell, lo que invalida comparaciones directas de rendimiento entre ambas builds en ese hardware.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de un modelo de 27B en tareas de hechos.
- Sesgos: no documentados en la model card.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad en castellano sin evaluacion previa.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen puede tener terminos adicionales que conviene revisar en su propia model card.
- El repositorio no incluye resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K), solo metricas de divergencia respecto al padre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huginnfork/Qwen3.8-27B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Release oficial FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Receta de cuantizacion: https://huggingface.co/huginnfork/Qwen3.8-27B-FP8/blob/main/recipe.yaml
- Experimento de layout de escalas: https://huggingface.co/huginnfork/Qwen3.8-27B-FP8/blob/main/block_scale_experiment.json
- Experimento de redondeo: https://huggingface.co/huginnfork/Qwen3.8-27B-FP8/blob/main/rounding_experiment.json
