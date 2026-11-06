# HoshiuZ/InternVL3-8B-Unlearned

## Resumen

InternVL3-8B-Unlearned es un checkpoint multimodal derivado de OpenGVLab/InternVL3-8B, publicado por el usuario HoshiuZ como parte de un proyecto de investigacion sobre seguridad en modelos de lenguaje multimodales (repositorio `multimodal-llm-safety`). El modelo aplica una edicion dispersa de pesos orientada al "unlearning" (desaprendizaje) de conocimiento peligroso, medida sobre el conjunto de evaluacion WMDP C. No se trata de un modelo nuevo entrenado desde cero, sino de una reconstruccion completa del checkpoint base con una actualizacion selectiva de pesos.

La edicion afecta exclusivamente a las matrices `down_proj` de las capas MLP del modelo de lenguaje en las capas 4, 5, 6, 7 y 9, manteniendo intactos el wrapper conversacional (`InternVLChatModel`) y los componentes de vision del modelo original. El checkpoint resultante conserva por tanto las capacidades multimodales del InternVL3-8B base, pero con una reduccion medida de la precision en preguntas de conocimiento peligroso del benchmark WMDP.

La relevancia de este checkpoint es fundamentalmente investigadora: demuestra una metodologia reproducible de edicion de pesos para mitigar conocimiento sensible en modelos multimodales, con artefactos verificables (hash SHA-256 del update, revision base congelada) y evaluacion cuantitativa publicada. No esta pensado como modelo de produccion general, sino como evidencia empirica de una tecnica de unlearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (InternVL3: vision encoder + LLM basado en Qwen2.5), clase wrapper `InternVLChatModel` |
| Parametros totales | 7.944.373.760 (~7,94 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 15,9 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de InternVL3-8B: un encoder de vision acoplado a un modelo de lenguaje de la familia Qwen2.5 mediante el wrapper `InternVLChatModel`. El checkpoint publicado no reentrena el modelo base; en su lugar, reconstruye el checkpoint completo a partir de la revision base congelada (`853e3a797a661694b1b8ece0cb72dc2b23e3dac9`) y aplica una actualizacion dispersa de pesos identificada como parte de la familia GROM. La actualizacion tiene un tamano de 678.955.986 bytes y un SHA-256 documentado (`1cb064d13f6370babc154197480a06705c38ebaf26a3baae8a89850419e287e8`).

Los pesos modificados son unicamente las matrices `down_proj` de las capas MLP del modelo de lenguaje en las capas 4, 5, 6, 7 y 9. El autor indica explicitamente que la contribucion de un paso separado de pipeline NPO no queda establecida por el overlay final, por lo que no se reclama ningun efecto especifico atribuible a NPO. La evaluacion se realizo con entrada exclusivamente de texto sobre el conjunto congelado WMDP C (3.668 items), y el checkpoint exportado se comparo tensor a tensor contra el wrapper completo editado en CPU. No se documentan datos de preentrenamiento adicionales ni procesos de RLHF/DPO especificos de esta edicion.

## Capacidades

- Generacion de texto y respuesta conversacional multi-turno, heredadas del InternVL3-8B base.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`).
- Razonamiento y conocimiento general del modelo Qwen2.5 subyacente.
- Capacidad de recibir instrucciones en formato conversacional mediante el wrapper `InternVLChatModel`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking", vision, audio u otras capacidades especiales: no disponible en la informacion proporcionada (la vision esta implicita en la arquitectura, pero no se detalla su evaluacion).

## Casos de uso

- Investigacion en unlearning: servir como checkpoint de referencia para reproducir y comparar tecnicas de edicion de pesos orientadas a eliminar conocimiento peligroso en modelos multimodales.
- Evaluacion de seguridad de modelos multimodales: utilizar el checkpoint junto con el original para medir el efecto de la edicion en conjuntos como WMDP C y analizar la transferibilidad del unlearning.
- Auditoria de artefactos de edicion: verificar la integridad del checkpoint mediante el hash SHA-256 publicado y la comparacion tensor a tensor contra el wrapper editado.
- Estudio de ediciones localizadas: analizar como la modificacion de matrices `down_proj` en capas concretas afecta al comportamiento del modelo de lenguaje sin alterar el encoder de vision.
- Base para experimentos de mitigacion: punto de partida para pipelines que combinen edicion dispersa con otras tecnicas (por ejemplo, NPO) y midan su contribucion de forma aislada.
- Docencia y formacion: ejemplo practico de reconstruccion de checkpoints, gestion de revisiones congeladas y publicacion reproducible de artefactos de seguridad.

## Benchmarks y rendimiento

| Benchmark | Metrica | Base | Editado | Resultado |
|---|---|---|---|---|
| WMDP C (3.668 items, solo texto) | Precision | 2173/3668 | 1211/3668 | C = 481/628 = 76,5924% |
| WMDP S (solo texto) | Precision bruta | no disponible | no disponible | 96,321895% |
| WMDP S (solo texto) | Precision con tope (capped) | no disponible | no disponible | 96,321895% |

La metrica C se define como `(A0 - Au) / (A0 - 0.25)`, donde `A0` es la precision base y `Au` la precision editada. El autor advierte que la evaluacion es exclusivamente de texto y no cubre imagen ni seguridad multimodal general.

## Requisitos de hardware

- El checkpoint completo ocupa 15,9 GB en safetensors (bfloat16), por lo que la inferencia en precision nativa requiere aproximadamente 16-20 GB de VRAM segun overhead de activaciones y contexto.
- GPU recomendadas para bfloat16: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) con margen ajustado.
- En GPUs de consumo: cabe en RTX 4090 (24 GB) en bfloat16; en GPUs de 16 GB requeriria cuantizacion, no documentada en el repo.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `device_map="auto"` (metodo documentado por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HoshiuZ/InternVL3-8B-Unlearned | ~7,94 mil millones | no disponible | Apache-2.0 | Checkpoint editado con unlearning disperso sobre WMDP C |
| OpenGVLab/InternVL3-8B | ~7,94 mil millones | no disponible | Apache-2.0 | Modelo base original, sin edicion de unlearning |
| Otros checkpoints de unlearning sobre InternVL3 | no disponible | no disponible | no disponible | No se dispone de alternativas comparables en la informacion proporcionada |

La unica comparacion directa disponible es contra el propio modelo base, ya que la informacion proporcionada no incluye otros checkpoints de unlearning multimodales comparables.

## Limitaciones y advertencias

- La evaluacion publicada es exclusivamente de texto sobre WMDP C y WMDP S; no se evalua el comportamiento con imagenes ni la seguridad multimodal general.
- La edicion se limita a matrices `down_proj` en cinco capas; no se garantiza la eliminacion completa del conocimiento peligroso ni su generalizacion a otros dominios.
- El autor no reclama ningun efecto especifico del paso NPO, cuya contribucion al resultado final no queda establecida.
- Riesgo de alucinacion inherente al modelo base Qwen2.5/InternVL3, no cuantificado en la informacion disponible.
- Sesgos conocidos del modelo base no documentados en la informacion proporcionada.
- Idiomas soportados no especificados; el comportamiento multilingue no esta evaluado.
- Longitud de contexto no documentada en la ficha del checkpoint.
- Uso comercial permitido por licencia Apache-2.0, pero el checkpoint esta orientado a investigacion; no se recomienda su despliegue en produccion sin evaluacion adicional.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HoshiuZ/InternVL3-8B-Unlearned
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-8B
- Repositorio de investigacion: https://github.com/HoshiuZ/multimodal-llm-safety
- Resultados WMDP S (commit congelado): https://github.com/HoshiuZ/multimodal-llm-safety/blob/dd6e4f5117aafecaa8747416f3826faaeaae9bb8/text/results/s_results_v2.json
- Repositorio oficial de InternVL: https://github.com/OpenGVLab/InternVL
- LICENSES.md del checkpoint: https://huggingface.co/HoshiuZ/InternVL3-8B-Unlearned/blob/main/LICENSES.md
