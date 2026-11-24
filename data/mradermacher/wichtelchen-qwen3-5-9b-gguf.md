# mradermacher/Wichtelchen-Qwen3.5-9B-GGUF

## Resumen

Wichtelchen-Qwen3.5-9B-GGUF es la distribucion en formato GGUF del modelo Wichtelchen-Qwen3.5-9B, un merge de modelos construido sobre la familia Qwen3.5 y publicado por el usuario schneewolflabs. La cuantizacion la firma mradermacher, un autor habitual en el ecosistema de pesos comprimidos para llama.cpp, que ofrece aqui un catalogo completo de variantes desde Q2_K hasta f16, ademas de los suplementos multimodales mmproj. El modelo declara 9.197.093.888 parametros totales y esta etiquetado explicitamente para agentes, uso de herramientas y codigo.

El interes del modelo radica en su orientacion a tareas agenticas: las etiquetas del repositorio mencionan agents, tool-use y code, y el entrenamiento combina datasets de DPO y SFT orientados a comportamiento conversacional y delegacion de tareas. Al ser un merge sobre una base Qwen3.5, hereda la arquitectura transformer de esa familia, aunque la model card no detalla ni la longitud de contexto ni la composicion exacta del entrenamiento.

La relevancia practica esta en la disponibilidad de cuantizaciones listas para desplegar en hardware de consumo: la variante Q4_K_M ocupa 5,9 GB y la Q8_0 9,9 GB, lo que permite ejecutar un modelo de 9.000 millones de parametros en GPUs de gama alta para consumidores. La licencia Apache 2.0 elimina las restricciones de uso comercial tipicas de otras familias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun etiquetas del repositorio; detalles no disponibles) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers como libreria declarada; existen quants i1/imatrix en repositorio aparte) |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento desde cero. La model card original de schneewolflabs/Wichtelchen-Qwen3.5-9B no esta incluida en la informacion disponible, por lo que se desconoce la receta exacta de fusion, los hiperparametros y el orden de las operaciones. Lo que si se documenta son los datasets empleados como material de partida: nbeerbower/GreatFirewall-DPO, schneewolflabs/egirl-DPO, schneewolflabs/egirl-delegation-dpo, schneewolflabs/egirl-hemlock-dpo y hemlang/Hemlock-SFT-combined. La presencia de varios conjuntos DPO sugiere un ajuste por preferencias orientado a conversacion, y el conjunto de SFT combinado apunta a un entrenamiento supervisado previo sobre el que se aplicaria la fusion.

La base declarada es Qwen3.5, de la que se hereda la arquitectura transformer. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, la presencia de RLHF adicional ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La existencia de ficheros mmproj en el repositorio indica soporte multimodal en el modelo base, aunque la model card no detalla que modalidades cubre ni con que resolucion.

## Capacidades

- Generacion de texto conversacional multi-turno, con el modelo etiquetado como conversational en Hugging Face.
- Uso de herramientas y function calling, segun las etiquetas tool-use y agents del repositorio.
- Razonamiento orientado a agentes y delegacion de subtareas, respaldado por el dataset egirl-delegation-dpo.
- Generacion de codigo, segun la etiqueta code.
- Soporte multimodal a traves de los ficheros mmproj incluidos (Q8_0 y f16), aunque la model card no especifica las modalidades exactas.
- Capacidades multilingues limitadas al ingles segun el campo language de la model card.
- No se documentan modos de pensamiento explicito, audio ni otras capacidades especiales.

## Casos de uso

- Agentes de automatizacion de tareas: el modelo declara soporte de tool-use y delegacion, por lo que puede integrarse en orquestadores que descompongan una peticion en llamadas a APIs y ejecuten los pasos de forma secuencial.
- Asistentes de codigo en local: con la variante Q4_K_M (5,9 GB) se puede desplegar un asistente de autocompletado y explicacion de codigo en una estacion de trabajo con GPU de consumo, sin depender de servicios externos.
- Atencion al cliente automatizada: la orientacion conversacional y el ajuste DPO sobre datasets de dialogo lo hacen adecuado para gestionar conversaciones multi-turno, siempre que el contexto configurado sea suficiente para el historial de la sesion.
- Pipelines de CI/CD con revision de codigo: integrado mediante llama.cpp o un servidor compatible con la API de OpenAI, puede actuar como revisor automatico de diffs y generar comentarios en pull requests.
- Prototipado de agentes de investigacion: la combinacion de tool calling y generacion de texto permite construir flujos que consulten fuentes externas, resuman resultados y redacten informes intermedios.
- Despliegue en entornos con requisitos de soberania del dato: al ser Apache 2.0 y ejecutable en local con llama.cpp u Ollama, encaja en organizaciones que no pueden enviar datos a APIs de terceros.
- Experimentacion con merges y cuantizaciones: el catalogo de cuantizaciones (desde 4,0 GB en Q2_K hasta 18,5 GB en f16) permite comparar el impacto de la compresion en la calidad para tareas agenticas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K 4,0 GB; Q3_K_S 4,5 GB; Q3_K_M 4,8 GB; Q3_K_L 5,1 GB; IQ4_XS 5,5 GB; Q4_K_S 5,6 GB; Q4_K_M 5,9 GB; Q5_K_S 6,6 GB; Q5_K_M 6,7 GB; Q6_K 7,7 GB; Q8_0 9,9 GB; f16 18,5 GB. A estas cifras hay que sumar el espacio de contexto KV cache, cuyo tamano depende de la longitud de contexto configurada.
- Suplementos multimodales: mmproj-Q8_0 anade 0,7 GB y mmproj-f16 anade 1,0 GB.
- GPU recomendadas: para Q8_0 y f16, A100 o H100 de 40/80 GB si se busca contexto largo; para Q4_K_M y Q5_K_M, RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen amplio; para Q4_K_S y Q3_K_M, GPUs de 8-12 GB como RTX 4060 Ti o RTX 3060.
- Cabe en GPU de consumo: si, en todas las variantes hasta Q8_0 en tarjetas de 12 GB o mas; las variantes Q2_K a Q4_K_M caben en 8 GB con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con la API de OpenAI; el repositorio declara endpoints_compatible. No se documenta soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wichtelchen-Qwen3.5-9B-GGUF | 9.197 M | no disponible | Apache 2.0 | GGUF | Merge orientado a agentes y tool-use |
| Qwen2.5-7B-Instruct-GGUF | 7.600 M aprox. | 32.768 tokens (familia Qwen2.5) | Apache 2.0 | GGUF | Referencia de la generacion anterior de Qwen; datos de la familia, no de este modelo |
| Llama-3.1-8B-Instruct-GGUF | 8.000 M aprox. | 131.072 tokens | Llama 3.1 Community License | GGUF | Contexto largo pero licencia con restricciones para grandes despliegues |
| Mistral-7B-Instruct-v0.3-GGUF | 7.200 M aprox. | 32.768 tokens | Apache 2.0 | GGUF | Alternativa consolidada para agentes ligeros |

La comparativa se limita a parametros, contexto y licencia: no hay datos de rendimiento publicados para Wichtelchen-Qwen3.5-9B que permitan contrastar calidad frente a estas alternativas. Los datos de contexto de los modelos comparados corresponden a sus familias y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior al de modelos multilingues explicitos.
- Es un merge de pesos sin evaluacion publicada: no hay benchmarks que respalden las etiquetas de agents, tool-use o code.
- Riesgo de alucinacion inherente a los modelos de 9.000 millones de parametros, especialmente en tareas de razonamiento largo y en llamadas a herramientas con esquemas complejos.
- La model card no documenta sesgos conocidos, datos de preentrenamiento ni procesos de filtrado, por lo que la auditoria de sesgos queda fuera del alcance del repositorio.
- La longitud de contexto no esta disponible; conviene determinarla empiricamente antes de disenar flujos con historiales largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 puede arrastrar condiciones adicionales que no se detallan en la informacion disponible; conviene revisar la model card del modelo original.
- Los datasets de entrenamiento incluyen conjuntos de tematica conversacional y de rol (egirl), lo que puede sesgar el tono de las respuestas hacia registros informales.
- El repositorio ocupa 85,1 GB por acumulacion de todas las cuantizaciones; descargar solo la variante necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Wichtelchen-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/schneewolflabs/Wichtelchen-Qwen3.5-9B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Wichtelchen-Qwen3.5-9B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Wichtelchen-Qwen3.5-9B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Dataset nbeerbower/GreatFirewall-DPO: https://huggingface.co/datasets/nbeerbower/GreatFirewall-DPO
- Dataset schneewolflabs/egirl-DPO: https://huggingface.co/datasets/schneewolflabs/egirl-DPO
- Dataset schneewolflabs/egirl-delegation-dpo: https://huggingface.co/datasets/schneewolflabs/egirl-delegation-dpo
- Dataset schneewolflabs/egirl-hemlock-dpo: https://huggingface.co/datasets/schneewolflabs/egirl-hemlock-dpo
- Dataset hemlang/Hemlock-SFT-combined: https://huggingface.co/datasets/hemlang/Hemlock-SFT-combined
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
