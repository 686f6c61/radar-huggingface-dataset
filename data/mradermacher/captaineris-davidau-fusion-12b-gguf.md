# mradermacher/CaptainEris-DavidAU-Fusion-12B-GGUF

## Resumen

CaptainEris-DavidAU-Fusion-12B-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo mrcuddle/CaptainEris-DavidAU-Fusion-12B. No se trata de un modelo entrenado desde cero, sino de una fusión (merge) de la comunidad, creada con mergekit, que posteriormente ha sido convertida a GGUF para permitir su ejecución en hardware de consumo mediante llama.cpp y derivados. El repositorio incluye diez cuantizaciones estáticas, desde Q2_K (4,9 GB) hasta Q8_0 (13,1 GB), lo que cubre un rango amplio de GPUs y CPUs.

El modelo cuenta con 12.247.782.400 parámetros (aproximadamente 12,25 mil millones) según el archivo safetensors del modelo base, y está declarado exclusivamente para inglés. El repositorio se publicó el 30 de septiembre de 2026 y, en el momento de la consulta, acumula cero descargas y cero "me gusta", por lo que no existe validación comunitaria ni resultados de benchmarks publicados.

Su relevancia es principalmente práctica: las fusiones de modelos de ~12B se han convertido en una vía habitual para obtener comportamientos especializados (estilo narrativo, seguimiento de instrucciones, tono concreto) sin coste de entrenamiento, y las cuantizaciones GGUF de mradermacher son uno de los canales estándar para desplegar estos modelos en local. La contrapartida es la ausencia total de documentación técnica: no se especifican arquitectura, contexto, dataset ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio GGUF no la declara; por tamano y formato se corresponde con un transformer decoder-only de ~12B) |
| Parametros totales | 12.247.782.400 (~12,25 B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |
| Modelo base | mrcuddle/CaptainEris-DavidAU-Fusion-12B |
| Tamano del repositorio | 84,7 GB (suma de las diez cuantizaciones) |
| Libreria declarada | transformers |
| Etiquetas | transformers, gguf, mergekit, merge, en, endpoints_compatible |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta, el proceso de entrenamiento ni la composicion del dataset. Lo unico documentado es que el modelo base es una fusion creada con mergekit (etiquetas "mergekit" y "merge"), una herramienta que combina los pesos de varios modelos mediante tecnicas como SLERP, TIES, DARE o passthrough. Esto implica que no hubo un entrenamiento adicional con RLHF o DPO documentado: el comportamiento del modelo emerge de la combinacion de los modelos de origen, cuyos nombres no se detallan en la informacion disponible.

El nombre del modelo sugiere la participacion de material de DavidAU, un creador conocido por publicar fusiones orientadas a generacion creativa y narrativa, pero esta interpretacion no se puede confirmar con los datos proporcionados. Tampoco se documentan innovaciones tecnicas (atencion lineal, decodificacion especulativa, modos de razonamiento o capacidades multimodales). Cualquier afirmacion sobre estos puntos seria especulativa.

En el lado del repositorio GGUF, la unica decision tecnica documentada es el conjunto de cuantizaciones estaticas. El autor indica que no hay cuantizaciones ponderadas ni con matriz de importancia (imatrix) disponibles en el momento de la publicacion, y ofrece la posibilidad de solicitarlas mediante una discusion comunitaria. Las cuantizaciones IQ (por ejemplo IQ4_XS) aparecen listadas en los metadatos internos del README pero no en la tabla de archivos publicados.

## Capacidades

- Generacion de texto en ingles: es la funcion principal y la unica avalada por la etiqueta de idioma declarada.
- Conversacion multi-turno: al ser un modelo de ~12B orientado a texto, es apto para dialogos, aunque no hay datos sobre la longitud de contexto real.
- Seguimiento de instrucciones: plausible en un modelo de esta categoria, pero sin benchmarks ni evaluaciones publicadas que lo confirmen.
- Generacion creativa y narrativa: tipo de uso habitual en las fusiones de la comunidad, aunque no hay documentacion especifica del modelo que lo declare.
- Tool calling / function calling: no disponible; no se declara soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se declaran.
- Capacidades multilingues: no; el modelo esta declarado unicamente para ingles.
- Vision, audio u otras modalidades: no disponible; no hay indicios de soporte multimodal.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Asistente de escritura en ingles en local: el modelo se puede cargar con llama.cpp u Ollama y usarse para redactar, reescribir o continuar textos en ingles sin enviar datos a servicios externos, lo que resulta adecuado para material confidencial.
- Chat de proposito general en escritorio: con la cuantizacion Q4_K_M (7,6 GB) cabe en GPUs de 8-12 GB de VRAM, por lo que permite montar un asistente conversacional local en un equipo de gama media.
- Prototipado rapido de aplicaciones LLM: al existir diez niveles de cuantizacion, se puede empezar con Q2_K (4,9 GB) para validar pipelines y subir a Q6_K o Q8_0 cuando la calidad sea el factor critico.
- Experimentacion en investigacion sobre fusiones de modelos: el repositorio sirve como material para estudiar como se comportan las tecnicas de mergekit al cuantizarse en distintos niveles de precision.
- Sustitucion de modelos mayores en entornos con VRAM limitada: un modelo de 12B cuantizado a 4 bits ofrece un equilibrio entre tamano y calidad que no es alcanzable con modelos de 30B o 70B en hardware de consumo.
- Generacion de texto por lotes en CPU: las cuantizaciones Q4_K_S y Q4_K_M estan marcadas por el autor como "fast, recommended" y son las mas adecuadas para inferencia en CPU con throughput moderado.
- Base para fine-tuning o adaptacion de dominio: el modelo base en safetensors se puede usar como punto de partida, aunque el repositorio GGUF no es apto para entrenamiento.

Advertencia general: dado que no existen benchmarks ni validacion de la comunidad, cualquier caso de uso en produccion exige una evaluacion propia previa sobre el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni para el modelo base ni para las cuantizaciones. Tampoco se dispone de mediciones de perplejidad por nivel de cuantizacion, mas alla del grafico generico de comparacion entre tipos de cuantizacion enlazado en el README, que no es especifico de este modelo.

## Requisitos de hardware

Estimaciones de VRAM para inferencia (pesos + overhead de runtime; el cache KV depende de un contexto que no esta documentado):

| Cuantizacion | Tamano en disco | VRAM estimada |
|---|---|---|
| Q2_K | 4,9 GB | ~6 GB |
| Q3_K_S | 5,6 GB | ~7 GB |
| Q3_K_M | 6,2 GB | ~7-8 GB |
| Q3_K_L | 6,7 GB | ~8 GB |
| Q4_K_S | 7,2 GB | ~8-9 GB |
| Q4_K_M | 7,6 GB | ~9 GB |
| Q5_K_S | 8,6 GB | ~10 GB |
| Q5_K_M | 8,8 GB | ~10-11 GB |
| Q6_K | 10,2 GB | ~12 GB |
| Q8_0 | 13,1 GB | ~14-15 GB |

- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 pueden ejecutar Q4_K_M y superiores; las cuantizaciones Q2_K a Q3_K_L caben en GPUs de 6-8 GB.
- GPUs profesionales: A100 40/80 GB, H100 y L40S ejecutan cualquier cuantizacion con contexto largo y varios usuarios concurrentes.
- CPU: las cuantizaciones Q4_K_S y Q4_K_M son las marcadas como recomendadas por el autor y son viables en CPU con RAM suficiente (~8-10 GB libres).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui, Jan, llama-cpp-python y servidores compatibles con la API de OpenAI. La etiqueta "endpoints_compatible" indica que el repositorio esta preparado para su uso con endpoints de inferencia compatibles. vLLM y TGI admiten GGUF con soporte parcial; para produccion de alta concurrencia suele ser preferible partir del modelo base en safetensors.
- Latencia y throughput: no disponible; no hay mediciones publicadas.

Nota practica: el repositorio ocupa 84,7 GB en total, pero solo es necesario descargar el archivo de la cuantizacion elegida, no el repositorio completo.

## Comparativa con modelos similares

La informacion disponible no identifica modelos comparables de forma explicita. Como referencia de clase, se incluye el modelo base y una referencia generica de la categoria 12B; los campos no documentados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CaptainEris-DavidAU-Fusion-12B-GGUF (este) | ~12,25 B | no disponible | GGUF (10 cuantizaciones) | no disponible | HuggingFace, 0 descargas |
| mrcuddle/CaptainEris-DavidAU-Fusion-12B (base) | ~12,25 B | no disponible | safetensors | no disponible | HuggingFace |
| Otros modelos de la clase 12B (p. ej. Mistral Nemo 12B) | ~12 B | 128k tokens en el caso citado | safetensors, GGUF | Apache 2.0 en el caso citado | Ampliamente distribuidos |

Los datos de la tercera fila corresponden a un modelo distinto y se incluyen unicamente como referencia de la categoria de tamano; no implican parentesco arquitectonico ni equivalencia de rendimiento con el modelo descrito.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita, el uso comercial es juridicamente arriesgado. Hay que contactar con el autor del modelo base o con mradermacher antes de usarlo en produccion.
- Cero validacion comunitaria: el repositorio tiene 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no existe evidencia externa de calidad.
- Sin benchmarks: no hay ninguna evaluacion publicada de MMLU, HumanEval, GSM8K ni de tareas similares, ni para el modelo base ni para las cuantizaciones.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, y agravado por la falta de informacion sobre el alineamiento (no se documenta RLHF ni DPO).
- Sesgos: desconocidos. Al ser una fusion de modelos no identificados, los sesgos heredados no se pueden caracterizar.
- Limitacion idiomatica: el modelo esta declarado solo para ingles; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Contexto desconocido: no se puede planificar un caso de uso que dependa de ventanas largas sin medir previamente el comportamiento real.
- Naturaleza de fusion: las tecnicas de mergekit pueden producir degradaciones sutiles (repeticiones, cambios de tono, incoherencias en tareas de razonamiento) que no aparecen en los modelos de origen.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S conllevan perdidas notables de calidad; para uso serio se recomienda Q4_K_M o superior.
- Ausencia de cuantizaciones imatrix/ponderadas: el autor indica que no las ha generado, lo que implica una perdida de calidad algo mayor en las cuantizaciones bajas respecto a alternativas ponderadas.
- Fechas de publicacion del repositorio (30 de septiembre de 2026): se trata de una publicacion muy reciente con un historial de uso practicamente nulo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CaptainEris-DavidAU-Fusion-12B-GGUF
- Modelo base: https://huggingface.co/mrcuddle/CaptainEris-DavidAU-Fusion-12B
- Pagina del autor (mradermacher): https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Vista resumida de descargas del modelo: https://hf.tst.eu/model#CaptainEris-DavidAU-Fusion-12B-GGUF
- README de referencia para el uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor (nethype GmbH): https://www.nethype.de/
- Coleccion de modelos de DavidAU en aimodels.fyi: https://www.aimodels.fyi/creators/huggingFace/DavidAU
