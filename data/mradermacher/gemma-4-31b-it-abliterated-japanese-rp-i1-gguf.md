# mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-i1-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-i1-GGUF` es una cuantizacion GGUF con imatrix del modelo `anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP`, un derivado de Gemma 4 de 31B de parametros (30.697.345.596 parametros reales segun safetensors) afinado para role-play (RP) en japones y sometido a un proceso de "abliteration" que elimina total o parcialmente las capas de rechazo del modelo original. El trabajo de cuantizacion lo firma mradermacher, autor habitual de repositorios GGUF de terceros, mientras que el afinado y la abliteracion corresponden al usuario anaaaaaa13421312.

El modelo resuelve un nicho muy concreto: disponer de un Gemma 4 de 31B desprovisto de las restricciones de rechazo del modelo instruct original, orientado a conversacion de rol y con enfasis en japones, en formatos GGUF cuantizados que permiten su ejecucion en hardware de consumo. La relevancia es limitada pero practica: el repositorio incluye cuantizaciones desde Q2_K hasta Q6_K generadas con imatrix, ademas de un archivo imatrix independiente para quien quiera producir sus propias cuantizaciones.

La informacion publicada por el autor es muy escasa: no hay model card descriptiva del afinado, no se documenta el dataset de RP ni el procedimiento de abliteracion, y no se publican resultados de benchmarks. Todo lo que se sabe del modelo procede de los metadatos del repositorio y del repositorio base. La licencia declarada es Apache 2.0, aunque el modelo hereda la arquitectura y probablemente los pesos de la familia Gemma, lo que introduce incertidumbres legales que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles no disponibles) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL (small), Q5_K_S, Q5_K_M, Q6_K; cuantizaciones estaticas en repositorio separado |
| Idiomas soportados | en (declarado); tag Japanese y RP en metadatos; el modelo base esta orientado a japones |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 de 31B de parametros con arquitectura transformer, segun se deduce de la familia y del recuento de parametros. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto nativa, ya que el autor no publica model card tecnica. El repositorio cuantizado no aporta metadatos adicionales sobre la arquitectura mas alla de la etiqueta `gemma-4`.

Respecto al entrenamiento, el modelo original de Google pasa por un pipeline de preentrenamiento y ajuste instructivo con RLHF, pero el autor del derivado no documenta que datos adicionales ha utilizado para el afinado de role-play en japones ni como ha realizado la abliteracion (tecnica que consiste en identificar y restar la direccion de rechazo en el espacio de activaciones). Tampoco se especifica si hubo DPO, SFT adicional o mezcla de datasets. El unico dato tecnico verificable del proceso de cuantizacion es el uso de matrices de importancia (imatrix) para las cuantizaciones i1, lo que mejora la perplejidad respecto a cuantizaciones estaticas del mismo tamano. El repositorio incluye ademas un archivo imatrix de 0,1 GB para generar cuantizaciones propias.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a role-play y ficcion interactiva.
- Capacidad de vision: el autor indica explicitamente que es un modelo de vision y que los archivos mmproj, si existen, estan en el repositorio estatico.
- Capacidad multilingue heredada de Gemma 4, con enfasis declarado en japones e ingles.
- Comportamiento sin rechazo (abliterated): el modelo no aplica las capas de negativa del instruct original, lo que permite generar contenido que el modelo base rechazaria.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Role-play conversacional en japones: el modelo esta afinado especificamente para RP y conserva el vocabulario y los registros del japones conversacional, por lo que es adecuado para personajes, ficcion interactiva y simulaciones de dialogo en ese idioma.
- Investigacion sobre alineacion y abliteracion: permite estudiar como se comporta un modelo de 31B sin capas de rechazo, comparando respuestas con el Gemma 4 instruct original en tareas sensibles.
- Generacion de ficcion y narrativa sin filtros: util para autores que necesitan dialogos o escenas que los modelos alineados rechazan, con la advertencia de que el contenido generado es responsabilidad del usuario.
- Despliegue local en hardware de consumo: las cuantizaciones Q2_K a Q6_K permiten ejecutar un modelo de 31B en GPUs con 12-24 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos en safetensors.
- Prototipado de asistentes de personaje en japones: integrable en aplicaciones de chat con personajes, juegos de rol o simuladores sociales donde se requiere consistencia de personalidad y contexto conversacional.
- Evaluacion de cuantizaciones imatrix: el archivo imatrix y el rango completo de cuantizaciones permiten comparar calidad y perplejidad entre tipos de cuantizacion para un modelo de este tamano.
- Generacion de datos sinteticos de dialogo en japones: para aumentar datasets de entrenamiento conversacional, con revision humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB para Q2_K, 13-14 GB para IQ3_XXS, 19-20 GB para Q4_K_M, 22-23 GB para Q5_K_M y 26-27 GB para Q6_K, segun los tamanos de archivo del repositorio.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas cuantizaciones; A100 40/80 GB o H100 para Q6_K y para mayor velocidad; GPUs de 12 GB solo admiten Q2_K con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, hasta IQ3) y tarjetas de 24 GB en general; en 12 GB solo con cuantizaciones de 2 bits y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de endpoints (el repositorio incluye la etiqueta `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se requiere conversion o el uso de pesos safetensors del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-abliterated-Japanese-RP-i1-GGUF (este) | 30,7B | no disponible | apache-2.0 | GGUF i1 | Afinado RP japones, abliterated, cuantizaciones imatrix |
| gemma-4-31B-it-abliterated-Japanese-RP (base) | 30,7B | no disponible | apache-2.0 | safetensors | Modelo original sin cuantizar |
| gemma-4-31B-it-abliterated-Japanese-RP-GGUF (estatico) | 30,7B | no disponible | apache-2.0 | GGUF estatico | Mismas cuantizaciones sin imatrix, incluye mmproj |
| Gemma 4 31B instruct (original) | 30,7B | no disponible | licencia Gemma | safetensors | Modelo alineado de referencia, con rechazos activos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido no apto para todas las audiencias: el repositorio esta etiquetado como `not-for-all-audiences` y el modelo ha sido abliterated, por lo que puede generar contenido sexual, violento u ofensivo sin filtros.
- Riesgo de alucinacion: no hay evaluaciones publicadas; al ser un afinado de RP, la fidelidad factual puede degradarse respecto al instruct original.
- Idiomas: la etiqueta de idioma declarada es solo `en`, aunque el modelo esta orientado a japones; el soporte real de otros idiomas no esta documentado.
- Contexto: se desconoce la longitud de contexto nativa y como se degrada con las cuantizaciones de 2 y 3 bits.
- Licencia: aunque se declara apache-2.0, el modelo deriva de la familia Gemma, cuyos terminos de uso pueden imponer restricciones adicionales; conviene verificar la compatibilidad antes de un uso comercial.
- Procedencia y reproducibilidad: no se documenta el dataset de RP, el metodo de abliteracion ni las evaluaciones, lo que dificulta auditar el modelo.
- Cuantizaciones de baja calidad: Q2_K e IQ2 estan por debajo del umbral recomendado para uso en produccion; el propio autor sugiere IQ3_XXS como alternativa a Q2_K.
- Sin soporte ni mantenimiento garantizados: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-i1-GGUF
- Modelo base: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/gemma-4-31B-it-abliterated-Japanese-RP-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-31B-it-abliterated-Japanese-RP-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
