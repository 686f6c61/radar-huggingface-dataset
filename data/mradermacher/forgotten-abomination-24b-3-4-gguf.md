# mradermacher/Forgotten-Abomination-24B-3.4-GGUF

## Resumen

Forgotten-Abomination-24B-3.4-GGUF es la distribucion en formato GGUF del modelo de fusion Forgotten-Abomination-24B-3.4, publicado por el usuario ReadyArt y cuantizado por mradermacher. Se trata de un merge de modelos (mergekit) orientado a conversacion y generacion de texto en ingles, con aproximadamente 23.570 millones de parametros totales (23,57 B) segun los pesos en safetensors del modelo base. El repositorio ofrece once variantes de cuantizacion estatica, desde Q2_K hasta Q8_0, pensadas para ejecucion local con llama.cpp y derivados.

La relevancia de esta ficha es practica: permite ejecutar un modelo de ~24 B en hardware de consumo mediante cuantizaciones de 4 bits que ocupan entre 13,6 y 14,4 GB, o en configuraciones mas modestas con Q2_K (9,0 GB). No obstante, la informacion publicada por el autor es muy escasa: no hay datos sobre arquitectura interna, longitud de contexto, composicion del dataset de entrenamiento ni benchmarks. La model card se limita a listar los ficheros GGUF y remitir a la guia generica de TheBloke para su uso.

Conviene subrayar que este repositorio no es un modelo entrenado desde cero, sino una conversion de pesos de un merge previo. Por tanto, sus capacidades y limitaciones heredan las del modelo base ReadyArt/Forgotten-Abomination-24B-3.4, del que tampoco se aportan detalles tecnicos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de fusion generado con mergekit; se desconoce la arquitectura subyacente) |
| Parametros totales | 23.572.403.200 (~23,57 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 161,4 GB |
| Fecha de creacion | 2025-03-16 |
| Ultima actualizacion | 2026-11-13 |
| Descargas | 58 |
| Likes | 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. Los tags del repositorio indican que el modelo base fue generado con mergekit mediante una operacion de fusion (merge), pero no se especifica que modelos se combinaron, con que metodo (SLERP, TIES, DARE, passthrough, etc.) ni con que pesos. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado.

El trabajo realizado en este repositorio concreto es la cuantizacion estatica de los pesos del modelo base a formato GGUF, con once variantes de distinto tamano y calidad. La model card menciona que existen cuantizaciones ponderadas/imatrix en un repositorio separado (Forgotten-Abomination-24B-3.4-i1-GGUF), lo que sugiere que el autor aplico tecnicas de cuantizacion con matrices de importancia en esa variante. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` del repositorio.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite desplegarlo en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Ejecucion local mediante llama.cpp y herramientas derivadas, gracias al formato GGUF.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo de razonamiento (thinking mode), vision, audio ni otras modalidades.
- Capacidades multilingues limitadas al ingles segun el campo `language`.
- No se dispone de informacion sobre rendimiento en codigo, matematicas o tareas de razonamiento.

## Casos de uso

- Prototipado conversacional local: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo usando Q4_K_M (14,4 GB), lo que permite iterar sobre prompts y flujos conversacionales sin depender de APIs externas.
- Experimentacion con fusiones de modelos: investigadores interesados en el efecto de merges sobre el comportamiento conversacional pueden comparar este modelo con sus componentes originales, aunque la falta de documentacion del merge limita el analisis reproducible.
- Evaluacion de cuantizaciones: el repositorio ofrece once variantes, lo que permite estudiar la degradacion de calidad entre Q2_K y Q8_0 en un modelo de ~24 B, util para calibrar compromisos tamano/calidad en despliegues propios.
- Generacion de texto en ingles para tareas creativas o de redaccion asistida, en entornos donde no se requiere multilingue y se prioriza la ejecucion local.
- Despliegue en endpoints compatibles con la API de Hugging Face para pruebas de integracion en pipelines de inferencia, aprovechando el tag `endpoints_compatible`.
- Base para ajuste fino posterior (fine-tuning) sobre el modelo en safetensors, si el usuario dispone del modelo base y de la licencia correspondiente, aunque esta no se especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del fichero GGUF, sin contar overhead de contexto):
  - Q2_K: 9,0 GB
  - Q3_K_S: 10,5 GB; Q3_K_M: 11,6 GB; Q3_K_L: 12,5 GB
  - IQ4_XS: 13,0 GB; Q4_K_S: 13,6 GB; Q4_K_M: 14,4 GB
  - Q5_K_S: 16,4 GB; Q5_K_M: 16,9 GB
  - Q6_K: 19,4 GB
  - Q8_0: 25,2 GB
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, Q4_K_M encaja en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090) y Q8_0 requiere 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB).
- Cabe en GPU de consumo: si, en configuraciones de 4 bits (Q4_K_S/Q4_K_M) en GPUs de 16 GB o superiores; las variantes Q2_K y Q3_K caben en GPUs de 12 GB, con la consiguiente perdida de calidad.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp), asi como servidores compatibles con la API de Hugging Face (tag `endpoints_compatible`). No se documenta soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre el modelo base ni sobre sus componentes de fusion para establecer una comparativa fiable con alternativas de la misma categoria. Se indica "no disponible".

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un merge sin informacion de dataset, no es posible evaluar sesgos de entrenamiento.
- Riesgo de alucinacion: no cuantificado; al no haber benchmarks ni evaluaciones publicadas, no puede estimarse su fiabilidad en tareas factuales.
- Limitacion idiomatica: el modelo declara unicamente ingles, por lo que su uso en castellano u otros idiomas no esta respaldado.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- Licencia no disponible: no se especifican condiciones de uso comercial, lo que supone un riesgo legal para produccion. Es imprescindible consultar la licencia del modelo base ReadyArt/Forgotten-Abomination-24B-3.4 antes de cualquier despliegue.
- Modelo de fusion sin documentacion tecnica: la ausencia de detalles sobre el merge impide reproducir el modelo o auditar su procedencia.
- Baja adopcion: 58 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar reportes de calidad o incidencias resueltas por la comunidad.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; el autor recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q6_K/Q8_0 para maxima calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Forgotten-Abomination-24B-3.4-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Forgotten-Abomination-24B-3.4
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Forgotten-Abomination-24B-3.4-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Forgotten-Abomination-24B-3.4-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
