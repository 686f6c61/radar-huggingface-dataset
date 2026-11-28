# mradermacher/Dark-Scarlett-v1.0-31B-GGUF

## Resumen

Dark-Scarlett-v1.0-31B-GGUF es la distribucion en formato GGUF del modelo Dark-Scarlett-v1.0-31B, desarrollado originalmente por ReadyArt y cuantizado por mradermacher. Se trata de un modelo de aproximadamente 30.700 millones de parametros, derivado de la familia Gemma 4 segun las etiquetas del repositorio, y afinado especificamente para roleplay conversacional, narrativa interactiva y contenido para adultos (etiquetas nsfw, adult-content, explicit, erp y unaligned). El modelo base esta publicado bajo licencia Apache 2.0.

La relevancia de esta ficha reside en que el repositorio proporciona un conjunto completo de cuantizaciones estaticas en formato GGUF (desde Q2_K hasta Q8_0, mas variantes IQ4_XS y ficheros mmproj multimodales), lo que permite ejecutar un modelo de ~31B en hardware de consumo y en entornos de inferencia local como llama.cpp u Ollama. El repositorio acumula 239 descargas y 1 like en el momento de la consulta.

Es importante senalar que la model card del repositorio cuantizado es puramente tecnica: describe el proceso de cuantizacion y los ficheros disponibles, pero no aporta informacion sobre la composicion del dataset de entrenamiento, el contexto nativo, los idiomas soportados mas alla del ingles ni resultados de benchmarks. Esta ficha refleja esa ausencia de datos de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, segun etiquetas del repositorio); detalles no disponibles |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base es Dark-Scarlett-v1.0-31B de ReadyArt, del que no se documenta en la informacion disponible ni la arquitectura exacta, ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las etiquetas del repositorio lo adscriben a la familia Gemma 4 y lo marcan como `unaligned`, lo que sugiere un ajuste fino orientado a reducir los rechazos y filtros conversacionales tipicos de los modelos alineados, en favor de respuestas mas directas en contextos de roleplay y contenido adulto. Esta interpretacion se deduce de las etiquetas, no de documentacion tecnica explicita.

El repositorio aqui descrito no contiene el modelo original, sino las cuantizaciones GGUF generadas por mradermacher con `convert_type: hf` y `quantize_version: 2`, incluyendo un tensor de salida cuantizado. Se ofrecen tanto cuantizaciones estaticas (K-quants e IQ4_XS) como, en un repositorio separado, cuantizaciones ponderadas con imatrix. La presencia de ficheros `mmproj` indica soporte multimodal (entrada de imagenes) en el modelo base, aunque no se detalla la naturaleza exacta de dicha capacidad.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay y narrativa interactiva.
- Roleplay de personajes y escritura creativa, incluyendo contenido explicito para adultos (etiquetas `nsfw`, `explicit`, `erp`).
- Conversacion instructiva en ingles (`instruct`, `conversational`).
- Entrada multimodal: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que habilita el procesamiento de imagenes en llama.cpp cuando se cargan junto al modelo.
- Comportamiento `unaligned`: menor tendencia a rechazar peticiones por motivos de politica de contenido, segun la etiqueta del autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking explicito: no documentado.

## Casos de uso

- Roleplay conversacional local: el modelo esta afinado especificamente para mantener personajes coherentes en conversaciones largas; sus cuantizaciones Q4_K_M (18,8 GB) permiten ejecutarlo en una GPU de consumo con 24 GB de VRAM.
- Escritura creativa y narrativa interactiva: adecuado para generar ficcion por capitulos o tramas ramificadas, dado su enfoque en conversacion y su licencia Apache 2.0, que no restringe el uso comercial del texto generado.
- Prototipado de videojuegos narrativos: puede integrarse como motor de dialogo de NPC en proyectos indie mediante llama.cpp u Ollama, con la cuantizacion Q4_K_S (17,9 GB) como compromiso entre calidad y velocidad.
- Experimentacion en investigacion sobre alineacion: al estar etiquetado como `unaligned`, sirve como referencia para estudiar diferencias de comportamiento frente a modelos alineados en tareas de rechazo y seguridad.
- Despliegue en entornos con GPU limitada: las cuantizaciones Q2_K (12,0 GB) y Q3_K_S (13,9 GB) permiten ejecutar un modelo de ~31B en GPUs de 16 GB, algo inviable con los pesos originales en fp16 (~61 GB).
- Procesamiento de imagenes en flujos conversacionales: cargando el fichero `mmproj-f16` junto al modelo en llama.cpp, es posible comentar o narrar imagenes dentro de una conversacion de roleplay.
- Fine-tuning posterior y destilacion: la licencia Apache 2.0 y la disponibilidad de pesos en safetensors en el repositorio original facilitan su uso como base para ajustes adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de roleplay, y tampoco se aportan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada de inferencia segun cuantizacion (tamano de fichero, sin contar overhead de contexto KV):
  - Q2_K: 12,0 GB
  - Q3_K_S: 13,9 GB
  - Q3_K_M: 15,4 GB
  - Q3_K_L: 16,7 GB
  - IQ4_XS: 17,0 GB
  - Q4_K_S: 17,9 GB
  - Q4_K_M: 18,8 GB
  - Q5_K_S: 21,4 GB
  - Q5_K_M: 21,9 GB
  - Q6_K: 25,3 GB
  - Q8_0: 32,7 GB
  - mmproj (vision): 0,9 GB (Q8_0) o 1,3 GB (f16)
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y fp16; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M y Q5_K_M; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB, A4000) para Q2_K y Q3_K_S.
- Cabe en GPU de consumo: si, desde Q2_K (12,0 GB) hasta Q5_K_M (21,9 GB) en tarjetas de 16-24 GB; Q6_K y Q8_0 requieren 24-32 GB o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros `mmproj` requieren llama.cpp con soporte multimodal. No se proporcionan pesos para vLLM ni TGI en este repositorio (serian necesarios los safetensors del modelo base).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base (contexto, arquitectura exacta, dataset) que permitan una comparacion rigurosa con alternativas. Se indica a continuacion lo que puede afirmarse con la informacion disponible:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dark-Scarlett-v1.0-31B-GGUF | ~30,7B | No disponible | Apache 2.0 | GGUF | Roleplay/ERP, etiquetado `unaligned`, multimodal via mmproj |
| Modelos de la familia Gemma 4 de ~27-31B | No disponible | No disponible | Gemma license (segun version) | safetensors, GGUF | Referencia arquitectonica; alineacion estandar, sin enfoque explicito en roleplay |
| Modelos de roleplay de ~30B en GGUF | No disponible | No disponible | Variable | GGUF | Categoria comparable, pero sin datos publicados en esta informacion para contrastar rendimiento |

La comparacion cuantitativa con alternativas concretas no esta disponible.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como `nsfw`, `explicit` y `not-for-all-audiences`; no es adecuado para aplicaciones dirigidas a menores ni para entornos sin moderacion.
- Comportamiento `unaligned`: la reduccion deliberada de rechazos implica mayor probabilidad de generar contenido danino, sesgado o inexacto sin advertencia; requiere filtros propios en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; en un modelo afinado para roleplay el riesgo es alto en tareas de conocimiento.
- Idioma: soporte documentado unicamente en ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: no se especifica la longitud de ventana nativa, lo que impide planificar cargas de contexto largo con garantias.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y del cumplimiento de la normativa aplicable en su jurisdiccion.
- Ausencia de datos de entrenamiento: sin informacion sobre el dataset, no es posible evaluar sesgos sistematicos ni procedencia de los datos.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan la calidad de forma notable; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.
- Los ficheros GGUF de gran tamano pueden estar divididos en varias partes; es necesario concatenarlas o usar el cargador adecuado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-31B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-31B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-31B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Dark-Scarlett-v1.0-31B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
