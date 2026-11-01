# glossia/Rambley-V2.1-350M

## Resumen

Rambley-V2.1-350M es un modelo de lenguaje de pequeno tamano (348.583.480 parametros, aproximadamente 350M) desarrollado por glossia. Se trata de un modelo base preentrenado desde cero sobre unos 12.900 millones de tokens procedentes de DCLM-Edu, UltraData-Math y otros conjuntos auxiliares, y posteriormente afinado sobre unos 4.000 millones de tokens adicionales de una mezcla filtrada de datos reales y sinteticos orientada a mejorar resultados en benchmarks sin destruir por completo la capacidad general de modelado del lenguaje. El resultado es un modelo con un presupuesto de entrenamiento total de aproximadamente 16.000 millones de tokens.

El modelo resulta relevante por su relacion entre tamano y tokens de entrenamiento: con solo 350M de parametros se entrena sobre un volumen de datos muy superior al tipico para esa escala (ratio de aproximadamente 45 tokens por parametro), lo que lo situa en la estela de los modelos "overtrained" de la familia SmolLM o Qwen pequenos. Ademas, incorpora decisiones arquitectonicas poco habituales en esta escala, como atencion con puerta por cabeza, sumideros de atencion aprendidos, atencion de ventana deslizante combinada con GQA, embeddings posicionales HoPE y un esquema de optimizacion hibrido Muon/AdamW.

La longitud de contexto nativa es de 2048 tokens, con una ventana deslizante de 128 tokens en las capas SWA. El modelo se distribuye en formato safetensors con licencia CC-BY-SA-4.0 y su card esta principalmente orientada a la evaluacion comparativa frente a GPT-2 Medium, OPT-350m y Pythia 410M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con patron de atencion SWA:SWA:GQA, atencion con puerta por cabeza (headwise gated attention), sumideros de atencion aprendidos y MLP SwiGLU de 2.5x |
| Parametros totales | 348.583.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens nativos; ventana deslizante de 128 tokens |
| Tipos de cuantizacion | no disponible (entrenado nativamente en FP8; pesos publicados presumiblemente en bfloat16, no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con una serie de innovaciones documentadas en la card. Emplea MLP SwiGLU con dimension intermedia de 2.5x, atencion con puerta a nivel de cabeza (elegida frente a la variante elementwise para ahorrar parametros en las familias pequenas), sumideros de atencion aprendidos en cada cabeza y un patron de atencion SWA:SWA:GQA en el que la ultima capa se fuerza a GQA. La ventana deslizante es de 128 tokens y la longitud de contexto nativa de 2048. Los embeddings posicionales son HoPE, aplicados tanto en las capas SWA como en las GQA.

El entrenamiento se realizo de forma nativa en FP8. Se uso un esquema de optimizacion hibrido: Muon con learning rate 0.02 para las matrices, con restricciones de norma de pesos Hyperball, y AdamW con learning rate 0.002 para embeddings, vectores y normas, sin weight decay ni Hyperball. Durante el 60% del presupuesto de preentrenamiento de aproximadamente 13.000 millones de tokens se aplico preentrenamiento a nivel de parche (patch-level pretraining). Los datos provienen de glossia/picl-text, IFM/TxT360-v2, HuggingFaceTB/dclm-edu, common-pile/libretexts_filtered, ByteDance-Seed/mga-fineweb-edu y gvlassis/ClimbMix; de este ultimo solo se usaron los clusters 2, 6, 12 y 15, excluyendo el cluster de matematicas y la mayor parte de los de STEM. Tras el preentrenamiento se realizo un afinado adicional sobre unos 4.000 millones de tokens de una mezcla filtrada de mayor calidad, con datos reales y sinteticos. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva y modelado de lenguaje general.
- Razonamiento basico y respuesta a preguntas de conocimiento general (arc_easy, arc_challenge).
- Razonamiento de sentido comun y continuacion de escenas (hellaswag).
- Razonamiento fisico y de plausibilidad cotidiana (piqa).
- Aritmetica elemental: el modelo obtiene un 36,10% en Arithmark 3.0, con resultados notables en tareas de hora (100%) y geometria de area (51,92%).
- Capacidad multilingue: no documentada; la card no especifica idiomas soportados.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el contexto de 2048 tokens limita escenarios agenticos largos.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Clasificacion y etiquetado de texto a gran escala: con 350M de parametros y un throughput medido de 648,4 ejemplos por segundo en la evaluacion de Arithmark, el modelo es adecuado para procesar grandes volumenes de documentos en tareas de clasificacion, filtrado o enrutamiento donde la latencia y el coste por token importan mas que la precision absoluta.
- Generacion aumentada por recuperacion (RAG) en dominios acotados: su ventana de 2048 tokens permite incorporar entre 3 y 5 fragmentos de contexto; es util para asistentes de documentacion tecnica o FAQ internas donde el modelo solo debe sintetizar informacion recuperada.
- Prototipado e investigacion en arquitecturas: al incorporar HoPE, sumideros de atencion, atencion con puerta por cabeza y preentrenamiento a nivel de parche, sirve como banco de pruebas de bajo coste para estudiar el efecto de estas tecnicas en modelos pequenos.
- Educacion y tutoria basica de matematicas: sus resultados en tareas de aritmetica elemental (hora, geometria, multiplicacion) lo hacen viable para ejercicios guiados de primaria, siempre con supervision humana y validacion de respuestas.
- Generacion de texto creativo corto y continuacion de narrativa: el modelo esta entrenado sobre texto general y puede producir parrafos coherentes en tareas de autocompletado o escritura asistida de baja exigencia.
- Filtrado de datos para pipelines de entrenamiento: puede usarse como clasificador de calidad o de dominio en la construccion de datasets, un uso coherente con su propio origen (mezclas filtradas de DCLM-Edu y ClimbMix).
- Despliegue en dispositivos con recursos limitados: con 0,7 GB de repo en safetensors y ~350M de parametros, cabe en CPU y en GPUs de gama baja para inferencia por lotes.

## Benchmarks y rendimiento

Resultados publicados en la model card (0-shot, sin filtro):

| Tarea | Metrica | Rambley-V2.1-350M | Rambley-V2-350M-Preview | GPT-2 Medium | OPT-350m | Pythia 410M | GPT-3 Medium (cerrado) |
|---|---|---|---|---|---|---|---|
| Hellaswag | acc_norm | 37,49 | 35,95 | 39,38 | 36,82 | **40,63** | *43,6* |
| ARC-E | acc_norm | ***49,71*** | 47,22 | 43,60 | 40,19 | 45,92 | 46,5 |
| ARC-C | acc_norm | **28,50** | 26,37 | 25,00 | 23,72 | 24,49 | *29,5* |
| PIQA | acc_norm | 65,89 | 64,42 | 66,38 | 64,36 | **67,30** | *70,2* |
| Arithmark 3.0 | raw | 36,10% | 37,80% | 33,80% | **38,30%** | 36,90% | N/A |
| Tokens de entrenamiento | — | ~16B | 4B | Desconocido (~20B) | 180B | ~300B | ~300B |

Desglose de Arithmark 3.0 (categorias destacadas): hora grades 2-3 100,00%; geometria de area grades 4-5 51,92%; multiplicacion grades 3-4 47,30%; perimetro grades 4-5 48,89%; suma grades 1-2 24,22%; fracciones grades 3-4 18,00% (20,00% normalizado).

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 0,7 GB de pesos mas overhead de activaciones y cache KV; en FP32, alrededor de 1,4 GB. En cuantizacion de 8 bits se situaria en torno a 0,4 GB y en 4 bits alrededor de 0,2 GB (estimaciones a partir del numero de parametros; no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bfloat16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo y permitiran lotes grandes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer de los ultimos diez anos, e incluso en CPU.
- Opciones de despliegue: el modelo usa `custom_code` (arquitectura no estandar), por lo que requiere cargar el codigo remoto del repositorio con `trust_remote_code=True` en Transformers. No hay evidencia de soporte en llama.cpp, Ollama, vLLM o TGI; la conversion a GGUF requeriria portar la arquitectura personalizada.
- Latencia y throughput: la card reporta 648,4 ejemplos por segundo en la evaluacion de Arithmark (tokenizacion 0,25 s, evaluacion 1,54 s para 1000 ejemplos). No se publican cifras de latencia por token ni de throughput en generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hellaswag (acc_norm) | ARC-C (acc_norm) | PIQA (acc_norm) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Rambley-V2.1-350M | 348,6M | 2048 | 37,49 | 28,50 | 65,89 | CC-BY-SA-4.0 | HuggingFace |
| GPT-2 Medium | ~355M | 1024 | 39,38 | 25,00 | 66,38 | MIT (pesos publicados) | HuggingFace |
| OPT-350m | ~331M | 2048 | 36,82 | 23,72 | 64,36 | OPT-175B License (no comercial) | HuggingFace |
| Pythia 410M | ~410M | 2048 | 40,63 | 24,49 | 67,30 | Apache 2.0 | HuggingFace |

Rambley-V2.1-350M lidera en ARC-E y ARC-C entre los modelos abiertos comparados, queda por detras de Pythia 410M en Hellaswag y PIQA, y es competitivo con GPT-2 Medium. Su ventaja principal es el volumen de entrenamiento (~16B tokens) frente a GPT-2 Medium (~20B desconocido) y su licencia CC-BY-SA-4.0, mas permisiva para uso comercial que la de OPT-350m, aunque impone obligacion de compartir bajo la misma licencia.

## Limitaciones y advertencias

- El modelo es un modelo base afinado para benchmarks, no un asistente alineado: no se documenta RLHF, DPO ni ajuste de instrucciones, por lo que puede producir contenido inapropiado o divagante en conversacion abierta.
- Riesgo alto de alucinacion en tareas de conocimiento factual, especialmente con solo 350M de parametros y 2048 tokens de contexto.
- Los sesgos conocidos no estan documentados en la card; al entrenarse sobre DCLM-Edu, ClimbMix y otros corpus web, es previsible que herede sesgos de esos datasets.
- Idiomas soportados no especificados: no hay garantia de calidad fuera del ingles, y el castellano no esta validado.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o tareas agenticas.
- La licencia CC-BY-SA-4.0 obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- La arquitectura es personalizada (`custom_code`), lo que dificulta el despliegue en runtimes estandar y exige `trust_remote_code=True`, con el riesgo de seguridad que ello implica.
- El modelo se entreno excluyendo el cluster de matematicas y la mayor parte de STEM de ClimbMix, lo que limita su rendimiento en razonamiento cientifico y matematico avanzado.
- No se han publicado evaluaciones de seguridad, toxicidad ni robustez adversarial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glossia/Rambley-V2.1-350M
- Modelo base de preentrenamiento: https://huggingface.co/glossia/Rambley-V2.1-350M-Pretrain
- Codigo de preentrenamiento (OLMo-core): https://code.allura.moe/fizz/OLMo-core
- Dataset glossia/picl-text: https://huggingface.co/datasets/glossia/picl-text
- Dataset IFM/TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset HuggingFaceTB/dclm-edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Dataset common-pile/libretexts_filtered: https://huggingface.co/datasets/common-pile/libretexts_filtered
- Dataset ByteDance-Seed/mga-fineweb-edu: https://huggingface.co/datasets/ByteDance-Seed/mga-fineweb-edu
- Dataset gvlassis/ClimbMix: https://huggingface.co/datasets/gvlassis/ClimbMix
- Discord del autor: https://discord.gg/6acXmq3yx2
