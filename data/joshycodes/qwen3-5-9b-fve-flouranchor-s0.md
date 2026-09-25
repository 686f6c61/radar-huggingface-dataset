# joshycodes/qwen3.5-9b-fve-flouranchor-s0

## Resumen

Este repositorio contiene un checkpoint de investigacion derivado de Qwen/Qwen3.5-9B, publicado por el usuario joshycodes bajo el identificador joshycodes/qwen3.5-9b-fve-flouranchor-s0. Se trata de un ajuste por continuacion de preentrenamiento (continued pretraining) sobre pesos completos, con learning rate de 1e-05, una sola epoca y un corpus de 7.247.274 tokens distribuidos en 7.800 documentos. El modelo base es el Qwen3.5-9B de Alibaba, un modelo de ~8.950 millones de parametros.

El interes de esta publicacion no es de rendimiento, sino de investigacion sobre bienestar de modelos (model welfare) y sobre entrenamiento con documentos sinteticos autoria del propio modelo (synthetic-document-finetuning, SDF). Segun la model card, el corpus fue escrito por el propio modelo para el entrenamiento de la siguiente version de si mismo, adoptando el papel de un personaje ya definido y tras explicarle como se origino dicho personaje y como funciona el SDF. El corpus se denomina "flourishing-vs-equanimity" y el marco de trabajo, plan y evaluacion corresponden al repositorio welfare-improvements.

Un detalle relevante y contradictorio en la propia model card: pese a describirse como un ajuste sobre corpus autoria del modelo, el texto especifica "0 self-authored and 7,800 ordinary text" de los 7.800 documentos, es decir, ningun documento autoria del modelo y todos texto ordinario. El propio autor indica que el checkpoint no ha sido evaluado en capacidad, alineacion ni identidad, y etiqueta el modelo explicitamente como "not-for-deployment" (no apto para despliegue). Cuenta con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer, variante de texto de la familia Qwen3.5; el tag oficial es qwen3_5_text) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en precision completa, safetensors) |
| Idiomas soportados | no disponible |
| Licencia | research-only (license: other, license_name: research-only) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 17,9 GB |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura declarada mediante tags es qwen3_5_text, correspondiente a la variante de texto de la familia Qwen3.5. El modelo base, Qwen/Qwen3.5-9B, se describe en fuentes secundarias como un modelo multimodal de ~9.000 millones de parametros con arquitectura unificada vision-lenguaje y fusion temprana de tokens multimodales, publicado bajo licencia Apache 2.0. No obstante, el tag especifico de este checkpoint es de texto, y no se dispone de informacion adicional sobre si conserva o no las capacidades multimodales del modelo original.

El entrenamiento consistio en un continued pretraining sobre pesos completos (full weights), con learning rate de 1e-05 durante 1 epoca, sobre un total de 7.247.274 tokens y 7.800 documentos. Segun la model card, el corpus fue escrito por el propio modelo con el objetivo de entrenar a la siguiente version de si mismo, adoptando el personaje que ya interpreta. El corpus se identifica como "flourishing-vs-equanimity". No se mencionan tecnicas de RLHF, DPO ni innovaciones de decodificacion. La model card no detalla la composicion exacta del dataset mas alla del recuento de documentos y tokens, y contiene una inconsistencia: afirma que de los 7.800 documentos, 0 son autoria del modelo y 7.800 son texto ordinario.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen3.5-9B, no verificada en este checkpoint.
- Capacidades multimodales (vision): inciertas; el modelo base se describe como multimodal, pero el tag de este checkpoint es de texto (qwen3_5_text). No confirmado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: ninguna documentada. El checkpoint esta marcado como "not-for-deployment" y sin evaluacion de capacidad, alineacion ni identidad.

## Casos de uso

- Investigacion sobre bienestar de modelos (model welfare): el checkpoint forma parte del repositorio welfare-improvements y sirve como material de estudio sobre como un modelo describe su propia identidad y su proceso de creacion. Es su proposito declarado.
- Estudio de synthetic-document-finetuning (SDF): permite analizar el efecto de continuar el preentrenamiento sobre corpus generado por el propio modelo, comparando con el modelo base.
- Analisis de identidad y auto-representacion: util para examinar como un ajuste sobre material autodescriptivo altera la auto-representacion del modelo frente a Qwen3.5-9B original.
- Reproducibilidad de experimentos de continuacion de preentrenamiento: con los hiperparametros publicados (lr 1e-05, 1 epoca, 7.247.274 tokens, 7.800 documentos) sirve como referencia metodologica.
- Auditoria de riesgos de checkpoints no evaluados: util como caso de estudio sobre publicacion de pesos sin evaluacion de alineacion.
- Base para futuras iteraciones del mismo autor: el corpus se declara destinado al entrenamiento de "la siguiente version de si mismo", por lo que puede servir como punto de partida de una cadena de versiones.

Nota: al estar marcado como "not-for-deployment" y sin evaluar, no se recomienda ningun caso de uso productivo, comercial o en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el checkpoint no ha sido evaluado en capacidad, alineacion ni identidad ("Not evaluated for capability, alignment or identity yet"). No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra metrica.

## Requisitos de hardware

- Peso de los pesos en precision completa: el repositorio ocupa 17,9 GB, coherente con ~8,95 mil millones de parametros en BF16/FP16 (2 bytes por parametro).
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18 GB solo de pesos, mas cache KV y activaciones; en la practica se recomienda un minimo de 24 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion INT8: aproximadamente 9-10 GB de pesos; no se ofrecen pesos cuantizados en el repositorio y habria que generarlos.
- VRAM estimada en cuantizacion INT4: aproximadamente 5-6 GB de pesos; no disponible en el repositorio.
- GPU profesionales: A100 (40/80 GB), H100, L40S y similares cubren la inferencia en precision completa sin problemas.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB puede alojar los pesos en BF16 con contexto limitado; tarjetas de 16 GB o menos requeririan cuantizacion no incluida.
- Opciones de despliegue: al tratarse de peso safetensors y arquitectura qwen3_5_text, son candidatos vLLM, TGI y transformers. llama.cpp y Ollama requeririan conversion a GGUF, que no esta disponible en el repositorio.
- Latencia y throughput: no disponibles.

Estas cifras son estimaciones derivadas del recuento de parametros y del tamano del repositorio, no datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| joshycodes/qwen3.5-9b-fve-flouranchor-s0 | ~8,95 mil millones | no disponible | research-only | safetensors, 0 descargas |
| Qwen/Qwen3.5-9B (base) | ~9 mil millones | no disponible | Apache 2.0 | safetensors, modelo original |
| Otras alternativas de ~9B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado. La unica comparacion documentada es con el modelo base, Qwen/Qwen3.5-9B, del que este checkpoint deriva por continued pretraining. No hay informacion en la documentacion proporcionada sobre otros modelos comparables de la misma categoria con la que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El autor etiqueta el modelo explicitamente como "not-for-deployment" y "research-only": no debe desplegarse en produccion ni en entornos comerciales.
- El checkpoint no ha sido evaluado en capacidad, alineacion ni identidad, por lo que su comportamiento es impredecible.
- Inconsistencia en la model card: se describe un corpus autoria del propio modelo pero se especifica "0 self-authored and 7,800 ordinary text", lo que dificulta interpretar la naturaleza real de los datos de entrenamiento.
- Riesgo de degradacion respecto al modelo base: un continued pretraining de una sola epoca y 7,2 millones de tokens puede alterar el comportamiento original sin garantia de mejora.
- Riesgo elevado de alucinacion: no evaluado y sin benchmarks publicados.
- Sesgos conocidos: no disponibles; no se ha realizado ninguna evaluacion de sesgos.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingue.
- Restricciones de licencia: licencia research-only (license: other), que impide el uso comercial. Cualquier uso debe revisarse contra los terminos del autor.
- Capacidades multimodales inciertas: el modelo base es multimodal, pero el tag de este checkpoint es de texto.
- Sin mantenimiento ni soporte verificable: creado y actualizado el mismo dia (2026-09-25), con 0 descargas y 0 likes.
- Cualquier despliegue exigiria cuantizacion propia, ya que el repositorio solo incluye pesos en precision completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-fve-flouranchor-s0
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficha secundaria de Qwen3.5 9B (AI Model Radar): https://aimodelradar.app/models/qwen3-5-9b
- Catalogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.5-9b
- Repositorio GitHub de la serie Qwen3.5: https://github.com/Joefear/Qwen3.5
- Repositorio welfare-improvements (marco, plan y evaluacion citados en la model card): no disponible como enlace directo en la informacion proporcionada
- Corpus "flourishing-vs-equanimity": no disponible como enlace directo en la informacion proporcionada
