# mradermacher/Qwopus3.5-4B-Coder-UNCENSORED-heretic-GGUF

## Resumen

Qwopus3.5-4B-Coder-UNCENSORED-heretic-GGUF es la distribucion en formato GGUF del modelo xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic, un modelo de lenguaje de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) orientado a generacion de codigo, razonamiento con cadena de pensamiento y uso de herramientas. Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que genera versiones estaticas del modelo original para su uso con llama.cpp y otros runners compatibles con GGUF. El modelo base deriva de la familia Qwen 3.5 (etiqueta qwen3_5) y ha sido ajustado mediante LoRA y SFT sobre trazas de razonamiento y agentes.

La particularidad del modelo es su caracter "uncensored/heretic/abliterated": se ha modificado para eliminar o reducir los rechazos de seguridad del modelo original, lo que lo hace adecuado para entornos de investigacion y experimentacion, pero con implicaciones importantes para produccion. Incorpora capacidades de razonamiento explicito (chain-of-thought), prediccion multi-token (MTP) y decodificacion especulativa, ademas de soporte para tool calling y function calling.

Este repositorio concreto ofrece 14 cuantizaciones GGUF distintas, desde Q2_K (2,1 GB) hasta f16 (8,8 GB), ademas de dos ficheros mmproj multimodales (Q8_0 y f16), lo que permite desplegar el modelo en hardware muy modesto. Es relevante ahora porque combina un tamano pequeno (4B) con capacidades de agente y codigo, y porque su licencia Apache 2.0 facilita el uso comercial del artefacto, aunque con las salvedades propias de un modelo "abliterated".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tag `qwen3_5`); detalles de capas no disponibles |
| Parametros totales | 4.326.350.848 (aprox. 4,3B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj Q8_0 y f16 |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen 3.5 con aproximadamente 4,3 mil millones de parametros. Segun las etiquetas del repositorio, el ajuste se realizo mediante LoRA y SFT (supervised fine-tuning), con soporte declarado para prediccion multi-token (MTP) y decodificacion especulativa, tecnicas que aceleran la generacion al predecir varios tokens por paso. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

Los datasets citados en la model card son Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces, lo que sugiere un entrenamiento orientado a trazas de razonamiento, inversion de trazas y comportamiento de agente. El caracter "heretic/uncensored/abliterated" indica que se ha aplicado una modificacion (abliteration u otra tecnica de eliminacion de direcciones de rechazo) para reducir las negativas del modelo a peticiones sensibles. No se detalla en la informacion disponible el proceso exacto de abliteration ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y codigo en multiples lenguajes de programacion (etiqueta `coder`).
- Razonamiento explicito con cadena de pensamiento (chain-of-thought) y modo de razonamiento.
- Tool calling y function calling para integracion con APIs y agentes.
- Comportamiento de agente y razonamiento multi-paso (tag `agent`).
- Prediccion multi-token (MTP) y decodificacion especulativa para acelerar la inferencia.
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada visual en el modelo base.
- Multilinguee en ingles, chino, espanol, ruso y japones.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que el modelo original rechazaria.

## Casos de uso

- Asistente de codigo en local: con cuantizaciones Q4_K_M (2,9 GB) o Q5_K_M (3,3 GB) el modelo cabe en GPUs de consumo como una RTX 3060 de 12 GB o incluso en CPU con llama.cpp, lo que permite autocompletado y generacion de codigo sin conexion.
- Agente de automatizacion con tool calling: su soporte de function calling y razonamiento multi-paso permite construir agentes que consulten APIs, ejecuten comandos y encadenen acciones dentro de un pipeline.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated, es util para estudiar como se comporta un modelo sin las capas de rechazo y comparar con la version original.
- Generacion de trazas de razonamiento sinteticas: el modelo fue entrenado sobre trazas de razonamiento, por lo que puede emplearse para generar cadenas de pensamiento que alimenten otros pipelines de datos.
- Prototipado rapido en entornos con recursos limitados: las cuantizaciones Q2_K (2,1 GB) y Q3_K_S (2,2 GB) permiten ejecutar el modelo en portatiles sin GPU dedicada mediante llama.cpp u Ollama.
- Procesamiento multimodal ligero: con los ficheros mmproj se puede alimentar imagenes junto a texto para tareas de descripcion o extraccion de informacion, siempre que el runner GGUF soporte vision.
- Atencion al cliente o asistentes conversacionales multilingues: cubre en, zh, es, ru y ja, lo que permite desplegar un unico modelo para varias regiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,1 GB (Q2_K) y 4,7 GB (Q8_0); f16 requiere unos 8,8 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para Q4_K_M/Q5_K_M (RTX 3060, RTX 4060, RTX 2070); para Q8_0 se recomienda 8 GB o mas (RTX 3070, RTX 4060 Ti 16 GB, RTX 4090). En A100/H100 el modelo es sobredimensionado para su tamano y no aprovecha la GPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6-8 GB de VRAM usando cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (etiqueta `text-generation-inference`) y cualquier runner compatible con GGUF. Para pesos safetensors, transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.5-4B-Coder-UNCENSORED-heretic (este) | 4,3B | no disponible | Apache 2.0 | GGUF, safetensors | Coder, agente, uncensored, multimodal |
| Qwen2.5-Coder-3B | 3,1B | 32K (segun version) | Apache 2.0 | safetensors, GGUF | Coder puro, sin abliteration |
| Qwen2.5-Coder-7B | 7,6B | 32K (segun version) | Apache 2.0 | safetensors, GGUF | Mayor capacidad, mas VRAM |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community | safetensors, GGUF | Multilinguee, sin enfoque coder |

La comparativa se basa en categorias conocidas; no se dispone de datos de rendimiento comparativo del modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": la eliminacion de rechazos implica que puede generar contenido danino, ofensivo o ilegal; no es apto para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: como todo modelo de 4B, tiende a inventar hechos, APIs y referencias, especialmente en tareas de codigo complejas.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion previa.
- Idiomas limitados a en, zh, es, ru y ja; el rendimiento en espanol no esta cuantificado y puede ser inferior al de modelos nativos.
- El ajuste sobre trazas de Claude Opus puede introducir sesgos estilisticos y de formato propios de esos datos.
- Licencia Apache 2.0 en el artefacto GGUF, pero conviene revisar la licencia del modelo base y de los datasets (algunos con nombres de modelos propietarios) antes de uso comercial.
- El repositorio ocupa 41 GB por incluir todas las cuantizaciones; descargar solo la variante necesaria.
- No hay benchmarks publicados que permitan estimar su calidad real frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwopus3.5-4B-Coder-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwopus3.5-4B-Coder-UNCENSORED-heretic-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwopus3.5-4B-Coder-UNCENSORED-heretic-GGUF
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
