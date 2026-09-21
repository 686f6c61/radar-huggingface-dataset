# mradermacher/Anansi-35B-A3B-i1-GGUF

## Resumen

Anansi-35B-A3B-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo BlueNipples/Anansi-35B-A3B. No se trata por tanto de un modelo entrenado desde cero, sino de una publicacion de pesos comprimidos con las tecnicas habituales del ecosistema llama.cpp: cuantizacion con matriz de importancia (imatrix) y una bateria amplia de tipos IQ y K, desde IQ1_S hasta Q6_K. El objetivo es hacer viable la ejecucion local de un modelo de aproximadamente 34.660 millones de parametros en hardware de consumo.

El modelo original esta etiquetado como un merge construido con DARE-TIES y con intercambio de cabeza LM (lm-head-swap), orientado a generacion de texto, conversacion, roleplay y razonamiento narrativo, y declarado unicamente para ingles. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas. El sufijo A3B del nombre sigue la convencion habitual de los modelos de mezcla de expertos, en la que el numero tras la A indica los parametros activos por token; sin embargo, la informacion disponible no confirma la arquitectura, por lo que este dato debe tratarse como una indicacion del nombre y no como una especificacion verificada.

Su relevancia es doble: por un lado, ofrece acceso local a un modelo de ~35B en GPUs de consumo mediante cuantizaciones de 4 bits o inferiores; por otro, sirve como material de estudio sobre el impacto de los distintos tipos de cuantizacion en la calidad de un merge orientado a narrativa. La model card tambien senala que el modelo original podria tener capacidades de vision, aunque los ficheros mmproj se alojan en el repositorio estatico y no en este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo A3B del nombre sugiere MoE con expertos, sin confirmar en la informacion proporcionada) |
| Parametros totales | 34.660.610.688 (~34,7 B), dato real de safetensors |
| Parametros activos | no disponible (el nombre indica A3B, aproximadamente 3 B activos; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL, mas fichero imatrix (0,3 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |
| Modelo base | BlueNipples/Anansi-35B-A3B |
| Tipo de publicacion | cuantizacion de terceros (quantized_by: mradermacher), con imatrix |
| Tamano del repositorio | 222,1 GB (total de todos los ficheros) |
| Fecha de creacion | 21 de septiembre de 2026 |
| Ultima actualizacion | 21 de septiembre de 2026 |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Los metadatos del merge indican el uso de DARE-TIES, una tecnica de fusion de modelos que poda los deltas de los parametros menos relevantes (DARE) y resuelve los conflictos de signo entre modelos (TIES), y de lm-head-swap, es decir, la sustitucion de la cabeza de lenguaje de uno de los modelos fusionados. Estos mecanismos son habituales en merges comunitarios que combinan un modelo con buen comportamiento narrativo con otro con mayor capacidad de instruccion o razonamiento.

No hay datos sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion. Tampoco se documenta ninguna innovacion en el mecanismo de atencion. La unica innovacion tecnica verificable en este repositorio es la propia cuantizacion: se ofrecen variantes con matriz de importancia (imatrix), que ponderan los pesos segun su relevancia estadistica durante la calibracion y suelen reducir la perplejidad frente a cuantizaciones estaticas del mismo tamano. El autor publica ademas cuantizaciones estaticas equivalentes en un repositorio separado.

## Capacidades

- Generacion de texto en ingles con registro conversacional, segun las etiquetas del modelo (conversational, text-generation).
- Roleplay y mantenimiento de personajes, con enfasis declarado en el dialogo multi-turno.
- Razonamiento narrativo (narrative-reasoning): coherencia argumental y continuidad en textos largos de ficcion.
- Escritura creativa y narrativa extensa derivada de la naturaleza del merge.
- Posible soporte de vision: la model card indica que es un modelo de vision, pero los ficheros mmproj, si existen, estan en el repositorio estatico y no en este. No hay confirmacion de su disponibilidad.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay y compania conversacional local: el modelo esta etiquetado especificamente para roleplay, y las cuantizaciones de 4 bits permiten ejecutarlo en una unica GPU de consumo manteniendo el historial de conversacion en VRAM.
- Escritura de ficcion asistida: para generar borradores de capitulos, tramas alternativas o dialogos con continuidad, aprovechando el enfoque en razonamiento narrativo del merge.
- Diseno de dialogos para videojuegos y novelas visuales: generacion masiva de lineas de personaje en ingles, con la ventaja de que la licencia Apache 2.0 permite incorporar las salidas a un producto comercial.
- Asistente de escritura para autores que trabajan en ingles: reescritura, continuacion de escenas y control de tono, ejecutado en local para evitar enviar manuscritos a servicios en la nube.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las variantes Q4_K_M e inferiores permiten servir el modelo con llama.cpp u Ollama en equipos con 24 GB de VRAM o incluso menos, sacrificando calidad en los cuantos mas agresivos.
- Investigacion sobre cuantizacion: el repositorio incluye 24 tipos de cuantizacion distintos, lo que permite medir experimentalmente la degradacion de perplejidad y de calidad narrativa entre IQ1_S y Q6_K usando la misma matriz de importancia.
- Estudio de tecnicas de merge: al ser un merge DARE-TIES con lm-head-swap, sirve como caso de analisis de como estas tecnicas afectan a la coherencia en generacion larga frente a los modelos de origen.
- Generacion de datos sinteticos en ingles: produccion de corpus de dialogo y narrativa para experimentos de ajuste fino, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la model card se limita a describir los ficheros de cuantizacion y a enlazar una grafica externa de perplejidad comparativa entre tipos de cuantizacion (no especifica del modelo). La busqueda web realizada no devolvio ningun resultado relacionado con este modelo.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del numero de parametros (34,66 B) y de los bits por peso tipicos de cada tipo de cuantizacion. El autor no publica tamanos por fichero ni requisitos, por lo que deben tomarse como orientativas:

- IQ1_S / IQ1_M (~1,6-2,0 bpw): aproximadamente 7-9 GB de pesos. Cabe en GPUs de 12 GB y en equipos con RAM unificada.
- IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K / Q2_K_S (~2,1-2,9 bpw): aproximadamente 9-13 GB. Cabe en RTX 3060 12 GB, RTX 4070 y superiores.
- IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L (~3,1-4,0 bpw): aproximadamente 13-17 GB. Requiere 16 GB o mas; encaja en RTX 4080/4090 con cuantos bajos.
- IQ4_XS / small-IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M (~4,1-4,9 bpw): aproximadamente 18-21 GB. RTX 4090 (24 GB), RTX 3090 (24 GB) o A5000.
- Q5_K_S / Q5_K_M (~5,1-5,7 bpw): aproximadamente 22-25 GB. Requiere 24 GB de VRAM con margen muy justo, o reparto GPU/CPU.
- Q6_K (~6,6 bpw): aproximadamente 28-29 GB. Necesita 32 GB o mas (A100 40 GB, RTX 5090, o descarga parcial a RAM).
- Referencia sin cuantizar (FP16): aproximadamente 69 GB, fuera del alcance de GPUs de consumo.
- A la VRAM de pesos hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto configurada, y que en modelos de ~35B puede ser de varios GB en contextos largos.

Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, koboldcpp, text-generation-webui y otras herramientas compatibles con GGUF. vLLM y TGI tienen soporte de GGUF limitado o experimental, por lo que para servir en produccion con alta concurrencia conviene evaluar alternativas o partir del modelo base en safetensors. El autor indica que existen cuantizaciones estaticas en el repositorio mradermacher/Anansi-35B-A3B-GGUF.

Latencia y throughput: no disponibles. En modelos de este tamano con posible arquitectura MoE de ~3 B activos, el throughput seria notablemente superior al de un modelo denso de 35 B, pero esta afirmacion depende de la arquitectura, que no esta confirmada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, el nombre del modelo sigue el patron de nomenclatura de los modelos MoE de la familia Qwen3 (por ejemplo, Qwen3-30B-A3B), y el ecosistema de cuantizaciones de mradermacher publica habitualmente variantes equivalentes de otros merges comunitarios, pero no se dispone de parametros, contexto ni resultados de dichos modelos dentro de la informacion consultada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada. Al ser un merge comunitario orientado a roleplay, es previsible que herede los sesgos de sus modelos de origen, pero no hay datos que lo confirmen.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de fidelidad factual, y un modelo optimizado para narrativa tiende a priorizar la coherencia del relato sobre la veracidad.
- Idioma: soporte declarado unicamente en ingles. El uso en castellano no esta respaldado por la model card y probablemente degrade la calidad.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar aplicaciones que dependan de ventanas largas sin realizar pruebas propias.
- Cuantizacion: los cuantos mas agresivos (IQ1_S, IQ1_M, IQ2_XXS) reducen de forma notable la calidad y la coherencia. La grafica de perplejidad incluida por el autor y las notas de Artefact2 enlazadas en la model card documentan esta degradacion; no se recomienda usar cuantos por debajo de Q4_K_M en produccion.
- Sin datos de uso: el repositorio tenia 0 descargas y 1 like en el momento de la consulta, por lo que no existe validacion de la comunidad sobre su comportamiento real.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia se hereda del modelo base. Conviene verificar la licencia efectiva de BlueNipples/Anansi-35B-A3B y de los modelos fusionados en el merge, ya que una fusion de pesos puede arrastrar condiciones adicionales si alguno de los originales no es Apache 2.0.
- Vision: la model card menciona que es un modelo de vision, pero los ficheros mmproj se alojan en otro repositorio y no se confirma su existencia. No planifique casos de uso multimodales sin verificarlo antes.
- Fechas: la fecha de creacion declarada (2026) es posterior a la fecha habitual de publicacion de estos repositorios; conviene comprobar la integridad y procedencia de los ficheros antes de desplegarlos.
- Repositorio de 222,1 GB: descargar la totalidad de los cuantos requiere un volumen considerable de disco; conviene seleccionar unicamente el fichero necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Anansi-35B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/BlueNipples/Anansi-35B-A3B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Anansi-35B-A3B-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Anansi-35B-A3B-i1-GGUF/resolve/main/Anansi-35B-A3B.imatrix.gguf
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Anansi-35B-A3B-i1-GGUF
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones y preguntas sobre cuantizaciones: https://huggingface.co/mradermacher/model_requests
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces encontrados (Deutsche Segel-Bundesliga) no guardan relacion con el contenido de esta ficha y se han omitido.
