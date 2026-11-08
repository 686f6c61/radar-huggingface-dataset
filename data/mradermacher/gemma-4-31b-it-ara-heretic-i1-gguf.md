# mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF` es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo `richardyoung/gemma-4-31B-it-ARA-heretic`, que a su vez deriva de la familia Gemma 4 de Google. El modelo base es una variante "heretic" (abliterated/decensored) de la version instruct de Gemma 4 de 31B, es decir, se ha modificado el comportamiento de rechazo del modelo original para eliminar o reducir los mecanismos de censura, manteniendo el resto de capacidades conversacionales.

El modelo cuenta con 30.697.345.596 parametros (aproximadamente 30,7B) y se distribuye en formato GGUF con cuantizaciones ponderadas mediante imatrix, lo que permite ejecutarlo en hardware de consumo o en servidores con GPU de gama alta. La model card indica que se trata de un modelo de vision (vision model), por lo que los ficheros mmproj asociados se encuentran en el repositorio estatico complementario.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de gran tamano (31B) con capacidades multimodales, una modificacion heretic que altera el comportamiento de seguridad, y una distribucion en GGUF optimizada para inferencia local. Esto lo hace interesante para investigadores que necesitan evaluar el impacto de la ablacion de rechazos en modelos de gran escala, pero tambien plantea advertencias importantes sobre sesgos y uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), multimodal con soporte de vision |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S, i1-Q5_K_M, i1-Q6_K, i1-IQ4_XS, i1-IQ2_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ1_M, i1-IQ1_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_K_M, i1-Q4_0, i1-Q4_1, i1-Q5_K_S, i1-Q6_K (segun lista de quants del autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `richardyoung/gemma-4-31B-it-ARA-heretic` es una variante de Gemma 4 de 31B en su version instruct. La arquitectura subyacente es un transformer de la familia Gemma 4, con capacidades multimodales confirmadas por la model card del cuantizador, que lo describe explicitamente como "vision model". No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) empleadas en el modelo original ni en la variante heretic.

La modificacion "heretic" (tambien etiquetada como abliterated, uncensored y decensored) consiste en una intervencion sobre el modelo para reducir o eliminar los comportamientos de rechazo aprendidos durante el ajuste instruct. El autor del cuantizado indica que el proceso es "reproducible" y que se han generado cuantizaciones ponderadas con imatrix, lo que mejora la calidad de las cuantizaciones de baja precision (Q2, Q3, IQ2, IQ3) respecto a cuantizaciones estaticas equivalentes. Esta tecnica de imatrix es una innovacion relevante para modelos de este tamano, ya que permite reducir el peso a 12-18 GB manteniendo una calidad razonable.

## Capacidades

- Generacion de texto conversacional en ingles, con modo instruct.
- Capacidades de vision (el modelo se describe como vision model; los ficheros mmproj estan en el repositorio estatico complementario).
- Comportamiento "uncensored" o "abliterated": menor tendencia a rechazar peticiones que el modelo instruct original rechazaria.
- Razonamiento multi-turno y conversacion contextual.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles (`en`); no se confirma soporte de otros idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de robustez y seguridad: investigadores pueden comparar el comportamiento del modelo heretic frente al Gemma 4 instruct original para medir el efecto de la ablacion de rechazos en tareas sensibles, usando las cuantizaciones Q4_K_S o Q5_K_M para obtener resultados representativos.
- Investigacion sobre alineacion y censura: el modelo permite estudiar como se distribuyen las representaciones de rechazo en un transformer de 31B, comparando respuestas antes y despues de la modificacion heretic en el mismo prompt.
- Inferencia local en estaciones de trabajo: con cuantizaciones i1-Q4_K_S (17,9 GB) o i1-IQ3_M (14,5 GB) el modelo puede ejecutarse en GPUs de consumo de 24 GB (RTX 3090/4090) mediante llama.cpp u Ollama, permitiendo experimentacion sin depender de APIs.
- Generacion creativa y roleplay: la variante heretic reduce los rechazos en tareas de escritura creativa, ficcion o roleplay, lo que la hace adecuada para prototipos de narrativa interactiva donde el modelo instruct original seria demasiado restrictivo.
- Analisis de documentos con componente visual: al ser un modelo de vision, puede emplearse para tareas de descripcion de imagenes o extraccion de informacion de capturas, siempre que se disponga de los ficheros mmproj del repositorio estatico.
- Despliegue en servidores con GPU de gama alta: las cuantizaciones i1-Q5_K_M e i1-Q6_K permiten servir el modelo con mayor fidelidad en A100/H100 para experimentos que requieran calidad cercana al modelo original.
- Prototipado de asistentes conversacionales en ingles: para productos internos o demos donde el contenido sensible no sea un requisito, el modelo ofrece conversacion multi-turno con un coste de inferencia reducido gracias a las cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de fichero como referencia, mas overhead de contexto):
  - i1-Q2_K: ~12,0 GB
  - i1-IQ3_M: ~14,5 GB
  - i1-Q4_K_S: ~17,9 GB
  - i1-Q5_K_M e i1-Q6_K: no disponibles en la informacion (el autor solo lista tres quants con tamano explicito, aunque menciona muchos mas tipos).
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4_K_S e IQ3_M; A100 40/80 GB o H100 para Q5_K_M/Q6_K y contextos largos.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4_K_S o inferiores; en GPUs de 16 GB solo cabrian cuantizaciones Q2_K/IQ2 con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; los tags indican `endpoints_compatible` y `transformers`, aunque el formato principal es GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF | Cuantizaciones imatrix de variante heretic con vision |
| mradermacher/gemma-4-31B-it-ARA-heretic-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base |
| mradermacher/Gemma-4-31B-StyleTune-heretic-ara-i1-GGUF | no disponible | no disponible | apache-2.0 | GGUF | Variante StyleTune del mismo linaje heretic, orientada a roleplay y escritura creativa |
| richardyoung/gemma-4-31B-it-ARA-heretic | ~30,7B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar |

## Limitaciones y advertencias

- El modelo es una variante "heretic"/abliterated: la eliminacion de rechazos puede aumentar la probabilidad de generar contenido danino, ofensivo o inseguro. No es adecuado para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: no se dispone de datos de benchmarks que permitan cuantificar la degradacion respecto al Gemma 4 instruct original; las cuantizaciones de baja precision (Q2, IQ2) pueden incrementar este riesgo.
- Idiomas: la model card solo declara ingles; no hay evidencia de soporte multilingue en la informacion disponible.
- Licencia: aunque la model card declara apache-2.0, incluye un enlace a la licencia de Gemma 4 de Google, lo que puede imponer terminos adicionales para uso comercial. Es necesario revisar dicha licencia antes de desplegar en produccion.
- La model card del cuantizador menciona que es un modelo de vision, pero los ficheros mmproj no estan en este repositorio sino en el repositorio estatico complementario; sin ellos, las capacidades visuales no estan disponibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- Longitud de contexto no documentada: planificar el despliegue sin asumir una ventana concreta y verificar en el modelo base antes de usarlo en tareas de contexto largo.
- El proceso de cuantizacion imatrix es reproducible segun el autor, pero no se han publicado evaluaciones de calidad de las cuantizaciones para este modelo concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF
- Modelo base: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/gemma-4-31B-it-ARA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-31B-it-ARA-heretic-i1-GGUF
- Variante StyleTune: https://huggingface.co/mradermacher/Gemma-4-31B-StyleTune-heretic-ara-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
