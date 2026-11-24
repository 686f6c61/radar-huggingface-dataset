# mradermacher/DXP-Zero-V1.0-24b-Small-Instruct-GGUF

## Resumen

DXP-Zero-V1.0-24b-Small-Instruct-GGUF es la version cuantizada en formato GGUF del modelo DXP-Zero-V1.0-24b-Small-Instruct, publicado por el usuario h34v7 y convertido a GGUF por mradermacher, un conocido creador de cuantizaciones para llama.cpp. El modelo original es un merge de modelos de 24 mil millones de parametros (concretamente 23.572.403.200 parametros segun los pesos en safetensors), orientado a proposito general, roleplay, escritura creativa, codigo y dominios cientificos como quimica, biologia y clima.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~24B en hardware de consumo mediante cuantizaciones que van desde 9,0 GB (Q2_K) hasta 25,2 GB (Q8_0), manteniendo la licencia Apache 2.0 del modelo base. Esta pensado para desarrolladores que quieren desplegar localmente un modelo conversacional con soporte de plantilla ChatML e instrucciones, sin depender de infraestructura en la nube.

No se dispone de informacion sobre la longitud de contexto, la composicion exacta del dataset de entrenamiento ni los resultados de benchmarks, ya que la model card del cuantizador no incluye esos datos y la del modelo base no se ha proporcionado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de un merge de modelos; detalles no disponibles) |
| Parametros totales | 23.572.403.200 (~23,6B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en el repo i1-GGUF |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un merge construido con mergekit, segun las etiquetas de la model card, y fue entrenado o ajustado con Axolotl segun la misma fuente. Se trata de un transformer denso de aproximadamente 23,6B parametros. La model card no especifica la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

La model card del cuantizador indica que las cuantizaciones son estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que existen variantes con imatrix en el repositorio DXP-Zero-V1.0-24b-Small-Instruct-i1-GGUF, que suelen ofrecer mejor calidad por tamano que las cuantizaciones estaticas equivalentes. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional e instrucciones, con plantilla ChatML.
- Roleplay y escritura creativa (storywriting), segun las etiquetas del modelo.
- Conocimiento orientado a dominios cientificos: quimica, biologia y clima.
- Generacion de codigo, segun la etiqueta "code" de la model card.
- Soporte multilingue limitado a ingles y ruso.
- Formato instruct/chat, adecuado para asistentes conversacionales.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta etiquetado explicitamente para roleplay y storywriting, por lo que puede mantener personajes y tramas en conversaciones multi-turno con plantilla ChatML.
- Asistencia en escritura creativa: generacion de borradores de relatos, dialogos y descripciones en ingles o ruso, aprovechando el ajuste instruct.
- Consultas tecnicas de quimica y biologia: el modelo incluye etiquetas de dominio que sugieren entrenamiento o ajuste en estas areas, util para prototipos de asistentes cientificos.
- Generacion de codigo en local: con la cuantizacion Q4_K_M (14,4 GB) puede ejecutarse en una GPU de consumo de 16 GB o en CPU con llama.cpp para tareas de autocompletado y explicacion de codigo.
- Analisis de textos sobre clima: la etiqueta "climate" indica cierta especializacion que puede aprovecharse en resumenes y preguntas sobre documentacion medioambiental.
- Despliegue de chatbot local con Ollama o llama.cpp: al estar en GGUF, se integra en pipelines de inferencia local sin dependencia de la nube, adecuado para entornos con requisitos de privacidad.
- Prototipado rapido de asistentes en ruso: uno de los dos idiomas soportados, util para productos dirigidos a ese mercado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~9,0 GB; Q3_K_S ~10,5 GB; Q3_K_M ~11,6 GB; Q3_K_L ~12,5 GB; IQ4_XS ~13,0 GB; Q4_K_S ~13,6 GB; Q4_K_M ~14,4 GB; Q5_K_S ~16,4 GB; Q5_K_M ~16,9 GB; Q6_K ~19,4 GB; Q8_0 ~25,2 GB.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4090 (24 GB) o RTX 4080 (16 GB) son suficientes; para Q8_0 se recomienda A100 40 GB, H100 o RTX 4090 con offloading parcial.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con cuantizaciones Q4 o Q5; en tarjetas de 24 GB cabe incluso Q6_K y, con margen ajustado, Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). El modelo base en safetensors puede servirse con vLLM o TGI, aunque la informacion no confirma compatibilidad explicita.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DXP-Zero-V1.0-24b-Small-Instruct (este) | ~23,6B | no disponible | Apache 2.0 | GGUF, safetensors | Merge orientado a roleplay, escritura y dominios cientificos |
| Mistral Small 24B | ~24B | no disponible en esta ficha | Apache 2.0 (segun version) | safetensors, GGUF | Modelo denso de tamano comparable; contexto y benchmarks no verificados aqui |
| Gemma 2 27B | ~27B | no disponible en esta ficha | Gemma license | safetensors, GGUF | Mayor tamano; licencia mas restrictiva |
| Qwen2.5 32B | ~32B | no disponible en esta ficha | Apache 2.0 (segun version) | safetensors, GGUF | Mayor numero de parametros; comparacion de rendimiento no disponible |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa fiable con estas alternativas.

## Limitaciones y advertencias

- Idiomas limitados a ingles y ruso; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Al ser un merge de modelos, puede heredar sesgos y comportamientos inconsistentes de los modelos componentes, no documentados en la model card.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling sin validacion previa.
- La longitud de contexto no esta especificada; conviene verificarla experimentalmente antes de usarlo en produccion con ventanas largas.
- Las cuantizaciones Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 permite uso comercial, pero al ser un merge conviene revisar las licencias de los modelos componentes originales, que no se detallan en la informacion disponible.
- El repositorio tiene 161,4 GB y solo 211 descargas, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DXP-Zero-V1.0-24b-Small-Instruct-GGUF
- Modelo base: https://huggingface.co/h34v7/DXP-Zero-V1.0-24b-Small-Instruct
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/DXP-Zero-V1.0-24b-Small-Instruct-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#DXP-Zero-V1.0-24b-Small-Instruct-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
