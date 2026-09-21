# mradermacher/haru-coder-8b-plan-full-GGUF

## Resumen

haru-coder-8b-plan-full-GGUF es el repositorio de cuantizaciones GGUF generado por mradermacher (autor conocido por publicar versiones cuantizadas de modelos abiertos) a partir del modelo harumori47/haru-coder-8b-plan-full. No es, por tanto, un modelo entrenado desde cero, sino una redistribución optimizada para inferencia local del modelo base, que cuenta con 7.615.616.512 parámetros (aproximadamente 7,6 B) según los pesos en safetensors del modelo original. El autor del modelo base no ha publicado detalles de arquitectura, datos de entrenamiento ni licencia en la información disponible.

El repositorio incluye 12 variantes de cuantización que abarcan desde 3,1 GB (Q2_K) hasta 15,3 GB (f16), lo que permite desplegar el modelo en GPUs de consumo con 8 GB de VRAM o menos. El modelo está etiquetado como conversacional y orientado a código por su nombre, y declara únicamente el idioma inglés. El repositorio ocupa 68,1 GB en total.

Su relevancia actual es práctica: ofrece una vía de despliegue local y offline de un modelo de ~7,6 B para tareas de código y conversación, con formatos compatibles con llama.cpp, Ollama y otros runners GGUF. Sin embargo, la ausencia de model card detallada en el modelo base, de licencia declarada y de resultados de benchmarks, junto con cero descargas y cero "likes" registrados, implica que se trata de una publicación sin validación comunitaria y con trazabilidad limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no especifica la arquitectura; se distribuye para la libreria transformers y en formato GGUF para llama.cpp) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |
| Modelo base | harumori47/haru-coder-8b-plan-full |
| Cuantizador | mradermacher |
| Tamano del repositorio | 68,1 GB |
| Fecha de creacion (metadatos) | 2026-09-20 |
| Ultima actualizacion (metadatos) | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base en los materiales disponibles. No hay datos sobre si emplea un transformer denso convencional, una mezcla de expertos (MoE), atencion lineal o una arquitectura hibrida, ni sobre el numero de capas, dimensiones ocultas, cabezas de atencion o tipo de tokenizador. El nombre del modelo y el numero de parametros situan al modelo en el segmento de ~7-8 B, categoria en la que predominan los transformers densos, pero esto no se confirma en la documentacion.

Tampoco se dispone de informacion sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones tecnicas como decodificacion especulativa. La model card del repositorio GGUF se limita a describir el proceso de cuantizacion: cuantizaciones estaticas (sin imatrix ni ponderadas por importancia), generadas a partir del modelo base en formato HuggingFace, con tensor de salida cuantizado y `quantize_version` 2. El autor indica que las cuantizaciones ponderadas o con imatrix no estan disponibles por el momento y que pueden solicitarse mediante una discusion en la comunidad.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta preparado para mantener dialogos de varios turnos, aunque no se documentan plantillas de chat ni formato de prompt.
- Generacion de codigo: el nombre del modelo ("haru-coder") apunta a un modelo especializado en codigo, pero no hay evaluaciones ni ejemplos publicados que lo confirmen con datos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el sufijo "plan" en el nombre sugiere orientacion a planificacion, pero no se documenta).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada; el resto de idiomas no esta soportado de forma declarada.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad de despliegue: etiqueta `endpoints_compatible`, que indica compatibilidad con endpoints de inferencia gestionados.
- Formato de pesos listo para llama.cpp y runtimes GGUF equivalentes.

## Casos de uso

- Asistente de codigo en el IDE en local: con la cuantizacion Q4_K_M (4,8 GB), el modelo puede ejecutarse en una GPU de consumo de 8 GB o mas y ofrecer autocompletado y generacion de fragmentos de codigo sin enviar codigo propietario a servicios externos.
- Generacion de tests unitarios en pipelines de CI: integrable mediante llama-cpp-python o un servidor compatible con la API de OpenAI, el modelo puede generar esqueletos de tests a partir de funciones existentes; conviene validar los resultados con la suite de tests antes de fusionarlos.
- Explicacion y refactorizacion de codigo legado en ingles: su ventana de contexto y su especializacion en codigo (no confirmadas con datos) lo hacen adecuado para resumir modulos y proponer refactorizaciones en entornos donde el codigo y la documentacion estan en ingles.
- Atencion tecnica conversacional en ingles: el tag `conversational` permite desplegarlo como chatbot de soporte de primer nivel para documentacion y dudas frecuentes, con la salvedad de que la longitud de contexto no esta documentada.
- Prototipado con endpoints gestionados: la etiqueta `endpoints_compatible` facilita subir el modelo a plataformas de inferencia gestionada para validar un caso de uso antes de invertir en infraestructura propia.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que permite medir en un mismo hardware el compromiso entre tamano (3,1 GB en Q2_K frente a 15,3 GB en f16) y calidad de salida, util para decidir el formato de despliegue.
- Despliegue en entornos air-gapped: al ser pesos GGUF descargables y ejecutables sin conexion, encaja en organizaciones que no pueden usar APIs externas, siempre que la licencia (no declarada) lo permita.
- Investigacion sobre degradacion por cuantizacion: las variantes Q2_K, Q3_K_M e IQ4_XS permiten estudiar la perdida de calidad en regimenes de baja precision, aunque el autor solo aporta notas cualitativas ("lower quality" para Q3_K_M, "very good quality" para Q6_K).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica en la model card. La unica informacion cuantitativa disponible son los tamanos de fichero por cuantizacion:

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---:|---|
| Q2_K | 3,1 | - |
| Q3_K_S | 3,6 | - |
| Q3_K_M | 3,9 | lower quality |
| Q3_K_L | 4,2 | - |
| IQ4_XS | 4,4 | - |
| Q4_K_S | 4,6 | fast, recommended |
| Q4_K_M | 4,8 | fast, recommended |
| Q5_K_S | 5,4 | - |
| Q5_K_M | 5,5 | - |
| Q6_K | 6,4 | very good quality |
| Q8_0 | 8,2 | fast, best quality |
| f16 | 15,3 | 16 bpw, overkill |

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del tamano de cada fichero GGUF mas un margen para cache KV y overhead del runtime; el autor no publica requisitos oficiales. El margen real depende de la longitud de contexto, que no esta documentada.

| Cuantizacion | Peso en disco | VRAM estimada (con margen) |
|---|---:|---:|
| Q2_K | 3,1 GB | ~4 GB |
| Q3_K_S | 3,6 GB | ~4,5 GB |
| Q3_K_M | 3,9 GB | ~5 GB |
| Q3_K_L | 4,2 GB | ~5 GB |
| IQ4_XS | 4,4 GB | ~5,5 GB |
| Q4_K_S | 4,6 GB | ~5,5 GB |
| Q4_K_M | 4,8 GB | ~6 GB |
| Q5_K_S | 5,4 GB | ~6,5 GB |
| Q5_K_M | 5,5 GB | ~7 GB |
| Q6_K | 6,4 GB | ~8 GB |
| Q8_0 | 8,2 GB | ~10 GB |
| f16 | 15,3 GB | ~17 GB |

- Cabe en GPU de consumo: si. Las cuantizaciones Q2_K a Q6_K caben en 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 2070); toda la gama hasta Q8_0 cabe en 12 GB (RTX 3060 12 GB, RTX 4070); todas, incluida f16, caben en 16 GB o mas (RTX 4080, RTX 4090, RTX 5090).
- GPU de datacenter: A100, H100 o L40S permiten ejecutar f16 con contexto amplio y mayor concurrencia, aunque para un modelo de 7,6 B son sobredimensionadas salvo que se busque alto throughput.
- Memoria unificada: ejecutable en Mac con Apple Silicon (M1/M2/M3/M4) y en equipos con suficiente RAM, usando llama.cpp con offload a Metal.
- Opciones de despliegue: llama.cpp, Ollama (creando un Modelfile a partir del GGUF), LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con la API de OpenAI. vLLM y TGI estan pensados para safetensors, por lo que para esos backends conviene usar el modelo base original.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Ficheros multi-parte: si el repositorio distribuye algun quant en varias partes, es necesario concatenarlas antes de usarlo (el autor remite a las instrucciones de TheBloke al respecto).

## Comparativa con modelos similares

No hay datos verificables de modelos comparables dentro de la informacion proporcionada. El unico dato contrastable es que se trata de una cuantizacion de un modelo denso de ~7,6 B, orientada a codigo y en ingles, de la que se desconoce licencia, contexto y rendimiento.

| Parametro | haru-coder-8b-plan-full-GGUF | Alternativa A (~7-8 B, codigo, GGUF) | Alternativa B (~7-8 B, codigo, GGUF) |
|---|---|---|---|
| Parametros totales | 7,6 B | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible | no disponible |
| Licencia | no disponible | no disponible | no disponible |
| Rendimiento en benchmarks | no publicado | no disponible | no disponible |
| Formatos disponibles | GGUF (12 quants) | no disponible | no disponible |
| Idiomas | en | no disponible | no disponible |

Para una comparacion rigurosa seria necesario consultar las fichas de modelos publicos de tamano similar (por ejemplo, la familia Qwen2.5-Coder-7B o Llama-3.1-8B en sus versiones cuantizadas), pero sus especificaciones no forman parte de la informacion proporcionada en esta busqueda.

## Limitaciones y advertencias

- Licencia no declarada: al no indicarse licencia ni en el repositorio de cuantizaciones ni en la informacion del modelo base, no se puede asumir permiso para uso comercial. Es imprescindible contactar con harumori47 antes de cualquier despliegue en produccion.
- Es una cuantizacion, no el modelo original: todas las variantes pierden precision respecto a los pesos en safetensors. El propio autor califica Q3_K_M como "lower quality" y f16 como "overkill", y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- Sin datos de entrenamiento ni de alineamiento: se desconoce el dataset, si hubo RLHF o DPO, y por tanto no se pueden evaluar sesgos de forma fundamentada. La ausencia de evaluaciones impide cuantificar la tasa de alucinacion, especialmente critica en generacion de codigo.
- Idioma: solo ingles declarado. El rendimiento en castellano no esta garantizado y probablemente sea degradado.
- Contexto desconocido: al no documentarse la longitud de contexto, cualquier caso de uso que dependa de conversaciones largas o de repositorios extensos requiere una validacion previa.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Trazabilidad limitada del modelo base: el autor original no publica model card detallada, lo que dificulta auditar el origen de los datos y posibles contaminaciones.
- Cuantizaciones ponderadas no disponibles: el autor indica que no ha generado quants con imatrix ni ponderados por importancia, que suelen ofrecer mejor relacion calidad/tamano que los estaticos del mismo tamano.
- Anomalia en los metadatos: las fechas de creacion y actualizacion indican 2026-09-20, posteriores a la fecha habitual de publicacion de modelos de esta familia; conviene verificar la vigencia del repositorio.
- Dependencia del runtime: el formato GGUF exige llama.cpp o un runtime compatible; no es cargable directamente con transformers sin conversion.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/haru-coder-8b-plan-full-GGUF
- Modelo base: https://huggingface.co/harumori47/haru-coder-8b-plan-full
- Pagina de resumen y descargas del cuantizador para este modelo: https://hf.tst.eu/model#haru-coder-8b-plan-full-GGUF
- Pagina de solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa que cede infraestructura al cuantizador: https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponible (la busqueda web realizada no devolvio resultados relevantes sobre este modelo)
