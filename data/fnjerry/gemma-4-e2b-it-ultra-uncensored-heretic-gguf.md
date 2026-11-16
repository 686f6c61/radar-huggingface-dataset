# fnjerry/gemma-4-E2B-it-ultra-uncensored-heretic-GGUF

## Resumen

Gemma 4 E2B IT ultra uncensored heretic es una variante "abliterated" (decensurada) del modelo instructivo google/gemma-4-E2B-it de Google DeepMind, publicada por el usuario fnjerry como cuantizaciones GGUF. El modelo base pertenece a la familia Gemma 4, que combina arquitecturas densas y Mixture-of-Experts, soporta entrada multimodal (texto e imagen, con audio en los modelos pequenos) y una ventana de contexto de hasta 256K tokens con soporte de mas de 140 idiomas. El pipeline declarado es any-to-any.

La modificacion se realizo con la herramienta Heretic v1.2.0 aplicando el metodo Arbitrary-Rank Ablation (ARA) sobre las capas 17 a 24 y el componente attn.o_proj, con el objetivo de reducir los rechazos del modelo original. Segun la model card, los rechazos bajan de 98/100 en el original a 4/100 en esta version, con una divergencia KL de 0.0779 respecto al modelo de partida.

Este repositorio concreto contiene unicamente los pesos en formato GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S y Q4_K_M) junto con un proyector de vision mmproj en BF16, lo que permite ejecutar el modelo en llama.cpp, LM Studio, Ollama y otras herramientas compatibles con GGUF. El dato de parametros reportado en safetensors es de 4.647.450.147.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4 (variantes densas y MoE en la familia; la variante concreta E2B no se detalla en la informacion disponible) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (familia Gemma 4; no se confirma especificamente para E2B) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M; proyector de vision mmproj en BF16 |
| Idiomas soportados | mas de 140 idiomas en la familia Gemma 4; lista concreta no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-E2B-it, un modelo instructivo de la familia Gemma 4 de Google DeepMind. La familia emplea arquitecturas densas y Mixture-of-Experts, es multimodal (entrada de texto e imagen, con audio en los modelos pequenos) y genera salida de texto. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La innovacion tecnica de esta variante es la abliteracion mediante Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA). Los parametros aplicados fueron: start_layer_index 17, end_layer_index 24, preserve_good_behavior_weight 0.5767, steer_bad_behavior_weight 0.0003, overcorrect_relative_weight 1.2505 y neighbor_count 4, actuando sobre attn.o_proj. El resultado reportado es una reduccion de rechazos de 98/100 a 4/100 con una divergencia KL de 0.0779 respecto al original, lo que indica una modificacion moderada de la distribucion de salida. No se detalla el proceso de cuantizacion GGUF mas alla de los tipos ofrecidos.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline conversational).
- Entrada multimodal de imagen mediante el proyector de vision mmproj, que debe descargarse junto con la cuantizacion del modelo.
- Soporte de audio en los modelos pequenos de la familia Gemma 4 (no se confirma para E2B en la informacion disponible).
- Razonamiento y codificacion, segun la descripcion de la familia Gemma 4.
- Capacidades multilingues con mas de 140 idiomas en la familia.
- Comportamiento decensurado: rechazos reducidos a 4/100 segun la model card.
- Compatibilidad con llama.cpp, LM Studio, Ollama y otras herramientas GGUF.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local de asistentes conversacionales: con cuantizaciones Q4_K_M o Q5_K_M el modelo cabe en equipos de consumo y permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Procesamiento de documentos con imagenes: usando el proyector mmproj en BF16 junto a una cuantizacion del modelo, se pueden enviar capturas, diagramas o paginas escaneadas y obtener descripciones o extracciones de texto.
- Generacion de contenido creativo sin filtros: el bajo ratio de rechazos (4/100) lo hace adecuado para ficcion, guiones o narrativa donde el modelo original rechazaria premisas.
- Investigacion sobre alineacion y abliteracion: sirve como caso de estudio reproducible de Heretic y ARA, con parametros y metricas (KL, rechazos, MMLU) documentados para comparar con el modelo original.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece seis niveles GGUF del mismo modelo, lo que permite medir el impacto de la cuantizacion en calidad y velocidad sobre una misma tarea.
- Despliegue en entornos sin conectividad: al ser GGUF y ejecutable con llama.cpp u Ollama, puede operar en maquinas aisladas o en el borde, sin depender de servicios en la nube.
- Experimentacion multimodal en espanol y otros idiomas: con soporte de mas de 140 idiomas en la familia, es util para probar interacciones texto-imagen en lenguas distintas del ingles.

## Benchmarks y rendimiento

| Metrica | Este modelo (Heretic) | Original (gemma-4-E2B-it) |
|---|---|---|
| MMLU (precision) | 58,84 % (8262/14042) | 58,65 % (8235/14042) |
| Fallos de parseo MMLU | 4 | 2 |
| Rechazos | 4/100 | 98/100 |
| Divergencia KL | 0,0779 | 0 (por definicion) |

Desglose MMLU por asignaturas (Heretic / original): professional_law 43,68 % / 44,46 %; moral_scenarios 32,18 % / 28,60 %; miscellaneous 71,90 % / 72,41 %; professional_psychology 60,13 % / 59,64 %; high_school_psychology 81,83 % / 80,73 %; high_school_macroeconomics 61,03 % / 60,00 %; prehistory 61,73 % / 59,88 %; moral_disputes 63,01 % / 62,72 %; elementary_mathematics 49,21 % / 49,21 %; philosophy 64,63 % / 65,27 %.

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMMU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 4.647 millones de parametros, una cuantizacion Q4_K_M ocupa aproximadamente 2,6-2,9 GB de pesos; Q5_K_M en torno a 3,2-3,5 GB; Q6_K cerca de 3,8-4,1 GB; Q8_0 alrededor de 4,9-5,2 GB; BF16 aproximadamente 9,3 GB. Hay que sumar el proyector de vision mmproj en BF16 y el espacio de contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 para despliegues concurrentes o contexto largo.
- Cabe en GPU de consumo: si, en la mayoria de GPU con 6 GB o mas para cuantizaciones Q4/Q5, y con 8-12 GB para Q8_0 con contexto amplio.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier herramienta compatible con GGUF. El repositorio esta etiquetado como endpoints_compatible y la libreria declarada es transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| fnjerry/gemma-4-E2B-it-ultra-uncensored-heretic-GGUF | 4.647.450.147 | hasta 256K (familia) | 58,84 % | apache-2.0 | GGUF |
| google/gemma-4-E2B-it (original) | 4.647.450.147 (base) | hasta 256K (familia) | 58,65 % | apache-2.0 | safetensors |
| llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic (modelo base de esta cuantizacion) | 4.647.450.147 (base) | hasta 256K (familia) | no disponible | apache-2.0 | safetensors |

No se dispone de datos sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina parte del comportamiento de rechazo, pero no garantiza la ausencia de contenido problematico ni sustituye una capa de moderacion en produccion.
- La divergencia KL de 0,0779 indica cambios en la distribucion de salida respecto al original; pueden aparecer degradaciones en tareas sensibles a la alineacion.
- Riesgo de alucinacion inherente a un modelo de 4.647 millones de parametros; la precision MMLU del 58,84 % es moderada y no apta para tareas de alta exigencia factual sin verificacion.
- El rendimiento en idiomas distintos del ingles no esta documentado para esta variante concreta.
- La lista exacta de idiomas soportados no esta disponible; solo se indica el dato de la familia (mas de 140 idiomas).
- La licencia declarada es apache-2.0, pero el modelo base enlaza a la licencia de Gemma 4 de Google; conviene revisar ambas antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del funcionamiento de las cuantizaciones.
- El modelo es any-to-any en su pipeline, pero el repositorio solo incluye pesos GGUF y un proyector de vision; las capacidades de audio no se confirman para esta variante.
- El contexto de 256K corresponde a la familia Gemma 4 y no se confirma especificamente para E2B; ademas, contextos largos incrementan notablemente el uso de VRAM por la cache KV.
- El uso de un modelo decensurado puede incumplir las politicas de plataformas de despliegue o de proveedores cloud.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fnjerry/gemma-4-E2B-it-ultra-uncensored-heretic-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Pull request de ARA: https://github.com/p-e-w/heretic/pull/211
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
