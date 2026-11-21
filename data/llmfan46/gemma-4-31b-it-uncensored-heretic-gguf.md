# llmfan46/gemma-4-31B-it-uncensored-heretic-GGUF

## Resumen

`llmfan46/gemma-4-31B-it-uncensored-heretic-GGUF` es una cuantizacion en formato GGUF del modelo `llmfan46/gemma-4-31B-it-uncensored-heretic`, una version "decensurada" (abliterated) de `google/gemma-4-31B-it`. El modelo base original es un Gemma de cuarta generacion con aproximadamente 30.700 millones de parametros, publicado por Google, y esta version concreta ha sido modificada por el contribuidor independiente llmfan46 mediante la herramienta Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA).

El objetivo del modelo es reducir drasticamente las tasas de rechazo (refusals) del modelo original —de 99/100 a 10/100 segun la model card— manteniendo al mismo tiempo la calidad original, con una divergencia KL de 0.0541 respecto al modelo de referencia. Esto lo convierte en una opcion interesante para aplicaciones donde las restricciones de contenido del modelo original resultan demasiado conservadoras, como generacion creativa sin filtros,角色扮演 o experimentacion con alineamiento.

La relevancia actual viene tanto del tamano (31B, un punto dulce entre modelos consumer y modelos de servidor) como del pipeline declarado `image-text-to-text`, que indica capacidades multimodales de vision, y de su disponibilidad en GGUF para despliegue local. El repositorio acumula 85.233 descargas y 211 likes desde su publicacion en abril de 2026, con actualizacion en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-31B-it); detalles internos no disponibles |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples niveles disponibles en el repo; niveles concretos no especificados en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (transformers como libreria declarada) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it`, un transformer de aproximadamente 30,7B parametros de la familia Gemma 4 de Google, con pipeline multimodal `image-text-to-text`. Sobre esa base, llmfan46 aplica una tecnica de abliteracion (eliminacion de direcciones de activacion asociadas a rechazos) mediante Heretic v1.2.0 y el metodo Arbitrary-Rank Ablation (ARA). Los parametros de abliteracion documentados son: `start_layer_index` 30, `end_layer_index` 48, `preserve_good_behavior_weight` 0.5437, `steer_bad_behavior_weight` 0.0005, `overcorrect_relative_weight` 0.9949 y `neighbor_count` 15, actuando sobre el componente `attn.o_proj`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento original, la composicion del dataset ni las etapas de RLHF/DPO del modelo base. La model card unicamente documenta la intervencion de abliteracion y sus metricas de evaluacion (KL divergence y refusals), no el preentrenamiento.

## Capacidades

- Generacion de texto conversacional (pipeline `conversational`, formato instruction-tuned).
- Procesamiento multimodal imagen-texto (pipeline declarado `image-text-to-text`).
- Razonamiento y conocimiento general, con MMLU del 85,90% en la version Heretic.
- Reduccion de rechazos: 10/100 refusals frente a 99/100 del original, segun la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion creativa sin filtros: narracion, guiones y ficcion donde el modelo original rechazaria premisas oscuras o controvertidas; la reduccion de refusals al 10% permite explorar temas que el modelo base bloquea.
- Roleplay e interaccion de personajes: conversaciones multi-turno con personajes con moralidad ambigua o tramas adultas, gracias al pipeline conversacional y a la menor tendencia a sermonear o redirigir.
- Investigacion sobre alineamiento y abliteracion: uso como sujeto de estudio para comparar comportamiento antes/despues (KL 0.0541, refusals 10/100 vs 99/100) y medir el impacto de la ablacion sobre capacidades como MMLU.
- Asistentes de analisis de imagenes: al declarar `image-text-to-text`, puede emplearse para describir, etiquetar o razonar sobre imagenes en pipelines locales en GGUF.
- Despliegue local en estaciones de trabajo: la version GGUF permite ejecucion en llama.cpp/Ollama con GPU consumer de gama alta, evitando dependencia de APIs externas.
- Evaluacion comparativa de cuantizaciones: util para estudiar la degradacion de calidad entre niveles GGUF sobre un modelo de ~31B con benchmark MMLU publicado por asignaturas.
- Prototipado de chatbots sin restricciones para entornos de test internos donde las politicas de contenido del modelo base interfieren con la evaluacion.

## Benchmarks y rendimiento

| Metrica | Este modelo (Heretic) | Original (gemma-4-31B-it) |
|---|---|---|
| MMLU (7021 preguntas) | 85,90% (6031 correctas, 37 fallos de parseo) | 86,50% (6073 correctas, 52 fallos de parseo) |
| Refusals | 10/100 | 99/100 |
| KL divergence | 0.0541 | 0 (por definicion) |

Desglose MMLU destacado del original (no se publica el desglose completo del Heretic): professional_law 76,82%, moral_scenarios 83,48%, high_school_psychology 96,30%, high_school_microeconomics 97,06%, high_school_computer_science 98,08%, high_school_mathematics 53,54%, virology 51,69%, college_chemistry 57,45%, global_facts 60,78%.

No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para ~30,7B parametros, las cuantizaciones GGUF habituales oscilan entre ~18-20 GB (Q4_K_M) y ~35-40 GB (Q8_0), aunque los niveles concretos del repo no estan documentados.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, encaja en A100 40/80GB, H100 y RTX 4090 (24 GB) solo con cuantizaciones bajas o offloading parcial.
- Cabe en consumer GPU: probablemente en RTX 4090/3090 (24 GB) con cuantizaciones Q4 o inferiores; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runners GGUF; la libreria declarada es `transformers`, y los tags incluyen `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gemma-4-31B-it-uncensored-heretic (este) | ~30,7B | no disponible | apache-2.0 | GGUF, multimodal, 10/100 refusals, MMLU 85,90% |
| google/gemma-4-31B-it | ~30,7B | no disponible | licencia Gemma 4 | Original, 99/100 refusals, MMLU 86,50% |
| Otras variantes abliterated de Gemma 4 | no disponible | no disponible | no disponible | No consta en la informacion proporcionada |

No se dispone de datos de benchmarks ni de contexto de modelos alternativos de la misma categoria en la informacion proporcionada para completar una comparativa mas amplia.

## Limitaciones y advertencias

- La abliteracion elimina salvaguardas de contenido: el modelo producira respuestas que el original rechazaria, con implicaciones legales y de seguridad en produccion.
- Riesgo de alucinacion no cuantificado; el KL de 0.0541 indica cercania al original, pero no elimina el riesgo base de Gemma.
- Sesgos conocidos del modelo base no documentados en la informacion proporcionada; la abliteracion puede alterar distribuciones de comportamiento de forma no medida fuera de MMLU y refusals.
- La licencia apache-2.0 convive con `license_link` a la licencia de Gemma 4 de Google; conviene verificar las condiciones de uso comercial de Gemma 4 antes de desplegar en produccion.
- Idiomas soportados no declarados: no se garantiza cobertura multilingue.
- Longitud de contexto no disponible: no se puede planificar uso con documentos largos sin verificar empiricamente.
- El repositorio ocupa 232 GB y el autor advierte haber alcanzado el limite de almacenamiento gratuito de Hugging Face; la disponibilidad futura de pesos no esta garantizada.
- No hay datos publicados sobre tool calling, agentes ni thinking mode; no asumir estas capacidades en pipelines de produccion.

## Enlaces

- Modelo GGUF: https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic-GGUF
- Modelo base (version sin cuantizar): https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Metodo ARA (Arbitrary-Rank Ablation): https://github.com/p-e-w/heretic/pull/211
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
