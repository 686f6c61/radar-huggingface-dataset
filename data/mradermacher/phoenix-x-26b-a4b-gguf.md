# mradermacher/Phoenix-X-26B-A4B-GGUF

## Resumen

Phoenix-X-26B-A4B-GGUF es la distribucion en formato GGUF del modelo Phoenix-X-26B-A4B, un merge de modelos orientado a roleplay y narrativa (storytelling) publicado por el usuario Vortex5 y cuantizado por mradermacher. El repositorio proporciona unicamente pesos cuantizados estaticos, no el modelo original en safetensors, y esta pensado para su uso con llama.cpp y entornos compatibles con GGUF.

El modelo cuenta con 25.233.142.046 parametros totales segun los metadatos de safetensors del modelo base, lo que justifica la denominacion comercial de "26B". El sufijo "A4B" sugiere una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parametros activos por token, si bien la model card no detalla la configuracion de la arquitectura ni el numero exacto de expertos. La informacion disponible no especifica la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks.

La relevancia de esta ficha es practica: permite ejecutar localmente un modelo de gran tamano con requisitos de computo reducidos por token (si se confirma el caracter MoE) y con un abanico amplio de cuantizaciones, desde 10,7 GB en Q2_K hasta 27,0 GB en Q8_0. La licencia Apache 2.0 facilita su adopcion comercial, aunque el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun la denominacion "A4B"; configuracion detallada no disponible |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | Aproximadamente 4 B segun la nomenclatura "A4B"; cifra exacta no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors solo en el modelo base Vortex5/Phoenix-X-26B-A4B |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. La nomenclatura "26B-A4B" es coherente con un transformer de mezcla de expertos con unos 25.200 millones de parametros totales y aproximadamente 4.000 millones activos por token, un patron habitual en modelos MoE de activacion dispersa. El modelo se ha construido mediante mergekit, es decir, mediante la fusion de pesos de otros modelos, y esta etiquetado como merge y especializado en roleplay y storytelling. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

La unica innovacion tecnica documentada es el propio proceso de cuantizacion de mradermacher, que incluye variantes estaticas y, en un repositorio separado (i1-GGUF), variantes ponderadas con imatrix para mejorar la calidad en tamanos reducidos. La presencia de ficheros mmproj (Q8_0 y f16) indica soporte multimodal en el modelo base, presumiblemente vision, aunque la model card no lo describe.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y narrativa.
- Storytelling y escritura creativa de formato largo, segun las etiquetas del modelo.
- Conversacion multi-turno en ingles.
- Soporte multimodal probable (vision) por la presencia de ficheros mmproj; no confirmado en la documentacion.
- Tool calling y function calling: no disponible.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingues: limitadas al ingles declarado.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay conversacional local: el modelo esta etiquetado especificamente para roleplay, por lo que puede emplearse en interfaces de chat con personajes persistentes, manteniendo el contexto de la conversacion en la ventana del modelo.
- Escritura creativa y narrativa: adecuado para generar relatos, dialogos y continuaciones de ficcion, gracias a su orientacion declarada a storytelling.
- Prototipado de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (16,9 GB) puede desplegarse en una sola GPU de 24 GB para pruebas de producto.
- Generacion de contenido para videojuegos y mods: dialogos de PNJ y ramificaciones narrativas en entornos donde se requiere ejecucion local y sin dependencia de API.
- Investigacion sobre fusion de modelos: el modelo sirve como caso de estudio de merges con mergekit y de su comportamiento tras cuantizacion a distintos niveles.
- Despliegue en estaciones de trabajo con llama.cpp: al ofrecer cuantizaciones desde 10,7 GB, permite experimentar en equipos con VRAM moderada o incluso con CPU y RAM suficiente.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de once variantes GGUF permite medir la degradacion de calidad entre Q2_K y Q8_0 en tareas narrativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K 10,7 GB; Q3_K_S 12,3 GB; Q3_K_M 13,4 GB; Q3_K_L 13,9 GB; IQ4_XS 14,2 GB; Q4_K_S 15,6 GB; Q4_K_M 16,9 GB; Q5_K_S 18,1 GB; Q5_K_M 19,2 GB; Q6_K 22,7 GB; Q8_0 27,0 GB. Añadir entre 1 y 3 GB para cache KV y contexto segun la longitud de este.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40 GB o H100 para Q8_0 con contexto largo; RTX 4080 (16 GB) queda justa para Q3_K_L o IQ4_XS.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 5090 y, con cuantizaciones bajas, en tarjetas de 12 a 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros mmproj permiten vision en llama.cpp. vLLM y TGI no consumen GGUF directamente, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles. Al tratarse presumiblemente de un MoE con unos 4 B activos, el throughput por token deberia ser superior al de un denso de 25 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phoenix-X-26B-A4B-GGUF | 25,2 B totales, ~4 B activos | No disponible | Apache 2.0 | GGUF | Merge para roleplay y storytelling, solo ingles |
| Modelo base Vortex5/Phoenix-X-26B-A4B | 25,2 B totales | No disponible | Apache 2.0 | Safetensors | Origen del que derivan estas cuantizaciones |
| Alternativas de rolplay de ~20-30 B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Modelo especializado en roleplay y storytelling: su rendimiento en tareas de codigo, matematicas o razonamiento formal no esta documentado y probablemente sea inferior al de modelos generalistas del mismo tamano.
- Solo declara soporte de ingles; el rendimiento en castellano no esta verificado y no deberia asumirse.
- Al ser un merge de pesos, puede heredar sesgos y comportamientos inconsistentes de los modelos de origen, no documentados en la model card.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en cuantizaciones bajas como Q2_K o Q3_K_S.
- Longitud de contexto desconocida: no es posible planificar casos de uso con contextos largos sin verificacion empirica.
- El repositorio contiene unicamente cuantizaciones GGUF; no incluye los pesos originales en safetensors ni tokenizer completo en todos los formatos, lo que limita su uso con frameworks que no lean GGUF.
- El tamano del repositorio (184,9 GB) implica descargas largas si se quieren todas las variantes; conviene descargar solo el fichero necesario.
- Aunque la licencia es Apache 2.0, conviene revisar las licencias de los modelos fusionados en el merge original, no detalladas en la informacion disponible.
- Las variantes ponderadas con imatrix estan en un repositorio aparte (i1-GGUF) y pueden ofrecer mejor calidad a igual tamano.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phoenix-X-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Vortex5/Phoenix-X-26B-A4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Phoenix-X-26B-A4B-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Phoenix-X-26B-A4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
