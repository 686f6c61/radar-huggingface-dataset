# blaj/LFM2.5-24B-A2B-Uncensored-int4-ov

## Resumen

LFM2.5-24B-A2B-Uncensored-int4-ov es una conversión a formato OpenVINO IR con cuantización int4 del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario blaj. Sobre los pesos del modelo base se ha fusionado un adaptador LoRA de rango 1 de tipo abliteration (`r24-all-14-39-perlayer`) que elimina parcialmente los mecanismos de rechazo del modelo original. El resultado se distribuye como un grafo OpenVINO stateful de 12,7 GB, pensado para ejecutarse en GPUs integradas Intel Arc mediante OpenVINO GenAI.

El modelo base es un transformer MoE de Liquid AI con arquitectura `Lfm2MoeForCausalLM`: 40 capas, de las cuales 30 son convolucionales (`conv`) y 10 son de atención completa, con 64 expertos y enrutamiento top-4. Esta ficha describe la conversión de blaj, no el modelo original de Liquid AI, por lo que muchos datos del modelo base (idiomas, composición del dataset, benchmarks de razonamiento) no están disponibles en la información proporcionada.

La relevancia de esta publicación es fundamentalmente de infraestructura: documenta con detalle el proceso de exportación por capas para evitar OOM con un checkpoint de 45 GB en una máquina de 30 GB de RAM, y muestra cómo injertar el bloque MoE generado por `optimum-cli` para obtener una mejora de 3,4× en el rendimiento del MoE (de 1,36 ms a 0,40 ms por capa) gracias a las pasadas de fusión `ConvertTiledMoeBlockTo3GatherMatmuls` y `FuseMOEExperts`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Lfm2MoeForCausalLM` (transformer MoE híbrido conv + atención) |
| Parámetros totales | no disponible (checkpoint fp16/BF16 de 45 GB) |
| Parámetros activos | no disponible (64 expertos, top-4) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 (group-size 128, ratio 1.0, all-layers) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` / `.bin`), 12,7 GB |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida de 40 capas: 30 capas de convolución corta (`shortconv`) y 10 capas de atención completa con 8 cabezas KV de dimensión 64. El bloque MoE contiene 64 expertos con enrutamiento top-4. El estado interno del grafo OpenVINO mantiene, por cada capa convolucional, un estado de `conv_L_cache - 1 == 2` tokens, y por cada capa de atención una caché KV de 8 × 64.

La edición aplicada es un LoRA de rango 1 de abliteration (`atomic.abliterate`) sobre las capas 14 a 39, con alpha 1.0 y escala de usuario 1.75, que afecta a 1690 pesos incluyendo los 64 expertos de cada bloque MoE, además de `attn_output` y `shortconv.out_proj`. El adaptador está fusionado en los pesos del IR, no se carga en tiempo de ejecución. La conversión se realizó capa a capa (una capa por exportación con `optimum-cli`, ~35 s por capa) y posteriormente se injertaron los grafos con `graft.py`; el bloque MoE se extrajo del exportador porque la implementación manual con `GroupedMatMul` por lotes no se fusiona en el plugin de GPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`).
- Razonamiento y respuesta a instrucciones heredados del modelo base LFM2.5-24B-A2B.
- Comportamiento "uncensored": el adaptador de abliteration reduce los rechazos del modelo original ante peticiones que el modelo base declinaría.
- Ejecución stateful en OpenVINO con caché de convolución y KV interna.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Inferencia local en equipos con GPU integrada Intel Arc: el grafo de 12,7 GB cabe en un equipo con 30 GB de RAM y GPU Arc 130V/140V, permitiendo ejecutar un MoE de 24B en hardware de consumo sin GPU dedicada.
- Prototipado de asistentes conversacionales sin filtros editoriales: útil para investigación sobre comportamiento de modelos abliterated y análisis de sesgos, no para despliegues de cara al público.
- Evaluación de pipelines OpenVINO GenAI: sirve como referencia práctica de conversión por capas, injerto de bloques MoE y uso de `LLMPipeline` con un solo stream.
- Generación de texto en streaming de un solo usuario: con 37,8–43,6 tok/s en un Core Ultra 7 258V, es adecuado para uso interactivo individual, no para servir a múltiples usuarios concurrentes.
- Investigación sobre cuantización int4: permite medir la degradación de calidad frente al checkpoint BF16 original en tareas concretas.
- Docencia y experimentación con arquitecturas híbridas conv/atención: el modelo permite estudiar el comportamiento de las capas shortconv frente a las de atención completa en un entorno OpenVINO.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversión, en un solo stream sobre Intel Core Ultra 7 258V (Arc 130V/140V iGPU), 30 GB de RAM, OpenVINO GenAI 2026.4.0 en dispositivo GPU, decodificación greedy con `ignore_eos=True`:

| Métrica | Esta build | Referencia LFM2-24B-A2B |
|---|---|---|
| Throughput | 37,8–43,6 tok/s | 51,9–57,1 tok/s |
| Tiempo por token | 22,9–26,5 ms | 17,5–19,3 ms |
| Tamaño del modelo | 12,7 GB | 12,5 GB |

Desglose interno del decode por token (antes del cambio a SDPA):

| Build | Ops MoE | Total |
|---|---|---|
| `GroupedMatMul` manual | `GroupedMatMulCompressed` ×38, 82,7 ms | 100,6 ms (9,9 tok/s) |
| Bloque del exportador injertado | `MoERouterFused` ×38 + `FullyConnectedCompressed`, 22,2 ms | 23,9 ms (41,9 tok/s) |

El modelo base LFM2.5-24B-A2B, según su model card, decodifica 184 tok/s en un Apple M5 Max y 114 tok/s en un AMD Ryzen AI Max+ 395. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el grafo ocupa 12,7 GB; el autor lo ejecutó con 30 GB de RAM en un Core Ultra 7 258V con iGPU Arc 130V/140V.
- GPU recomendadas: GPU integrada Intel Arc (probado); previsiblemente compatible con GPUs Intel Arc dedicadas. No hay datos de ejecución en A100, H100 o RTX 4090 con este IR.
- GPU de consumo: el modelo está orientado a iGPU Intel Arc; no se documenta su funcionamiento en GPUs NVIDIA consumer mediante OpenVINO.
- Despliegue: OpenVINO GenAI (`og.LLMPipeline` en dispositivo `GPU`), OpenVINO Model Server con el grafo MediaPipe incluido (`graph.pbtxt`, `ovms_config.json`). Requiere `transformers==5.4.0` para reproducir la conversión.
- Batching: `ContinuousBatchingPipeline` no funciona con este modelo; el pase de paged attention rechaza el grafo y el estado shortconv es un único `ReadValue` por capa que no se puede compartir entre secuencias. Solo un stream.
- Throughput medido: 37,8–43,6 tok/s en single-stream en el hardware indicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| blaj/LFM2.5-24B-A2B-Uncensored-int4-ov | no disponible (MoE, 64 expertos top-4) | no disponible | 37,8–43,6 tok/s en Core Ultra 7 258V | LFM Open License v1.0 | OpenVINO IR int4 |
| LiquidAI/LFM2.5-24B-A2B | no disponible (MoE, 64 expertos top-4) | no disponible | 184 tok/s en M5 Max; 114 tok/s en Ryzen AI Max+ 395 | LFM Open License v1.0 | safetensors (BF16) |
| LFM2-24B-A2B (referencia del autor) | no disponible | no disponible | 51,9–57,1 tok/s en el mismo hardware | LFM Open License v1.0 | OpenVINO IR int4 (12,5 GB) |

No se dispone de datos suficientes para comparar con otras familias de modelos (p. ej. Qwen o Llama) en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: se ha eliminado parcialmente la alineación de seguridad del modelo base, por lo que puede generar contenido dañino, ilegal o sexualmente explícito. No apto para aplicaciones de cara al público sin filtros adicionales.
- La abliteration no elimina los sesgos del modelo base; puede amplificarlos al reducir los rechazos.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones de calidad tras la cuantización int4 ni tras la aplicación del LoRA.
- Sin soporte de batching continuo: solo un stream por proceso, lo que limita el despliegue en producción multiusuario.
- Sin localizadores de hidden states (`hidden_states_decoder_layers`): no se puede usar como objetivo DFlash ni emparejar con un draft model para decodificación especulativa.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial; debe revisarse el archivo `LICENSE` antes de cualquier despliegue productivo.
- Idiomas soportados no documentados en esta conversión.
- El rendimiento medido (37,8–43,6 tok/s) es inferior al del modelo base en el mismo hardware y muy inferior al del modelo base en Apple M5 Max o Ryzen AI Max+ 395; el IR está optimizado para iGPU Intel Arc.
- Conversión realizada por un tercero (blaj), no por Liquid AI; no hay garantía de soporte ni de paridad exacta con el modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blaj/LFM2.5-24B-A2B-Uncensored-int4-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Documentación de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative.html
- Repositorio de Optimum Intel (exportación OpenVINO): https://github.com/huggingface/optimum-intel
- Repositorio de OpenVINO Model Server: https://github.com/openvinotoolkit/model_server
- Documentación de NNCF (cuantización): https://github.com/openvinotoolkit/nncf
