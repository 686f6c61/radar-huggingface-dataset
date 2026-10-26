# mradermacher/Fx-Phys-i1-GGUF

## Resumen

Fx-Phys-i1-GGUF es el repositorio de cuantizaciones GGUF, generadas por mradermacher, del modelo multimodal y de mezcla de expertos (MoE) endless-frontier/Fx-Phys. No se trata por tanto de un modelo entrenado por el autor del repositorio, sino de una redistribucion optimizada para inferencia local en CPU/GPU mediante llama.cpp y compatibles, con cuantizaciones ponderadas por matriz de importancia (imatrix). El modelo base declara 35.505.251.456 parametros (unos 35,5 mil millones) y esta orientado, segun las etiquetas del repositorio, a razonamiento cientifico y fisica, finanzas, uso de herramientas y entrada multimodal.

La relevancia practica de este repositorio es doble: por un lado, permite ejecutar un modelo de ~35,5 B en hardware de una sola GPU de consumo gracias a cuantizaciones que van de 13,3 GB (i1-Q2_K) a 29,3 GB (i1-Q6_K); por otro, incluye un fichero imatrix (0,5 GB) para que terceros puedan generar sus propias cuantizaciones con la misma matriz de calibracion. El modelo es unicamente en ingles y se publica bajo licencia Apache 2.0.

El dato de adopcion es todavia bajo: 241 descargas y 0 likes en el momento de redactar esta ficha, lo que implica poca validacion independiente. Ademas, el repositorio no documenta longitud de contexto, numero de parametros activos, composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que las evaluaciones cualitativas deben hacerse por cuenta del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun etiquetas del repositorio; configuracion de expertos no disponible |
| Parametros totales | 35.505.251.456 (~35,5 B), dato de safetensors del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_S, IQ3_M, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; la lista de etiquetas del repositorio menciona ademas variantes IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, Q2_K_S y small-IQ4_NL |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (incluye fichero imatrix `Fx-Phys.imatrix.gguf` de 0,5 GB); pesos originales del modelo base en safetensors |
| Vision / multimodal | si, segun etiquetas; ficheros mmproj en el repositorio estatico mradermacher/Fx-Phys-GGUF |
| Tamano del repositorio | 279,4 GB |
| Descargas / likes | 241 / 0 |
| Fecha de creacion | 2026-10-25 (actualizado 2026-10-26) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que el modelo base pertenece a la familia identificada con la etiqueta `qwen3.6`, que emplea una arquitectura de mezcla de expertos y que es multimodal (procesa imagen y texto). No se detallan el numero de expertos, los parametros activos por token, el mecanismo de atencion, la longitud de contexto nativa ni si incorpora decodificacion especulativa u otras optimizaciones de inferencia. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del corpus, ni sobre las etapas de ajuste (SFT, RLHF o DPO).

Lo que si esta documentado es el proceso de cuantizacion: mradermacher genera cuantizaciones i1 (ponderadas con matriz de importancia) a partir de los pesos convertidos a formato HF, e incluye el fichero imatrix para recalibrado propio. El autor menciona en los agradecimientos el uso de servidores de nethype GmbH y acceso al supercomputador de @nicoboss para producir estas variantes. Existe ademas un repositorio paralelo con cuantizaciones estaticas (mradermacher/Fx-Phys-GGUF), que es donde se alojan los ficheros mmproj necesarios para la parte visual.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta `conversational`).
- Razonamiento cientifico y resolucion de problemas de fisica (etiquetas `physics` y `scientific-reasoning`).
- Analisis y razonamiento en dominio financiero (etiqueta `finance`).
- Uso de herramientas / function calling (etiqueta `tool-use`).
- Entrada multimodal: procesamiento de imagenes junto a texto, con ficheros mmproj distribuidos en el repositorio estatico.
- Naturaleza MoE, lo que en principio reduce el coste de computo por token respecto a un modelo denso del mismo tamano; el numero exacto de parametros activos no esta disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- No disponible: soporte confirmado de modo "thinking", agentes multi-paso, generacion de codigo, matematicas avanzadas o audio. Las etiquetas no los mencionan y no hay documentacion al respecto.

## Casos de uso

- Docencia y resolucion de problemas de fisica en local: el modelo puede mantener un dialogo tecnico sobre enunciados de mecanica, termodinamica o electromagnetismo ejecutandose en una estacion de trabajo sin enviar datos a la nube, algo relevante en entornos academicos con material bajo embargo.
- Analisis de figuras y graficos de laboratorio: gracias al componente multimodal (mmproj), permite describir y razonar sobre capturas de instrumentacion, diagramas de circuitos o graficas experimentales junto a una pregunta en texto.
- Asistente on-premise para investigacion con datos sensibles: al distribuirse como GGUF y con licencia Apache 2.0, puede desplegarse en infraestructura air-gapped usando llama.cpp, sin dependencia de APIs externas.
- Automatizacion de analisis financiero interno: con soporte de tool calling, puede integrarse en un pipeline que consulte bases de datos de precios o estados contables y redacte resumenes; requiere validacion humana por el riesgo de alucinacion en cifras.
- Agente de soporte tecnico especializado: combinacion de contexto conversacional y llamadas a funciones para recuperar documentacion de producto y responder consultas tecnicas en ingles.
- Prototipado rapido en una sola GPU de consumo: la cuantizacion i1-Q4_K_M (21,8 GB) permite validar el comportamiento del modelo en una RTX 3090 o RTX 4090 antes de decidir un despliegue mayor con la version sin cuantizar.
- Generacion de borradores de informes tecnicos y resumenes de articulos cientificos en ingles, con posterior revision por un especialista.
- Base para experimentos de cuantizacion propia: el fichero imatrix incluido permite generar variantes personalizadas con distintos compromisos de tamano y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los resultados de busqueda proporcionados incluyen puntuaciones de MMLU, GSM8K, HumanEval, GPQA ni de evaluaciones multimodales para Fx-Phys o para sus cuantizaciones. Tampoco se documentan mediciones de latencia o throughput (tokens/s) para ningun hardware concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir del tamano de los ficheros GGUF, sin contar cache KV ni el proyector multimodal): i1-Q2_K ~13,3 GB; i1-IQ3_M ~15,9 GB; i1-Q4_K_S ~20,5 GB; i1-Q4_K_M ~21,8 GB; i1-Q5_K_M ~25,4 GB; i1-Q6_K ~29,3 GB. Hay que anadir entre 2 y 8 GB adicionales segun longitud de contexto y numero de secuencias concurrentes, mas el fichero mmproj si se usa la parte visual.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para i1-Q4_K_S / i1-Q4_K_M con contexto moderado; A100 40 GB o H100 para i1-Q5_K_M / i1-Q6_K con contexto largo o varios usuarios; A100 80 GB si se quiere margen para cache KV extensa y vision.
- Cabe en GPU de consumo: si. RTX 4080 / 4070 Ti Super / 4060 Ti de 16 GB para i1-Q2_K o i1-IQ3_M con contexto corto; RTX 3090 / 4090 (24 GB) para el punto de equilibrio i1-Q4_K_M. Las cuantizaciones Q5 y Q6 quedan fuera de 24 GB en configuracion comoda.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, llama-cpp-python y text-generation-webui. El soporte de GGUF en vLLM es parcial y no cubre todas las variantes i1; TGI no esta pensado para pesos GGUF. Para la parte multimodal hay que usar el mmproj del repositorio estatico y una build de llama.cpp con soporte de vision.
- Latencia y throughput: no disponible. No se han publicado mediciones para este modelo ni para estas cuantizaciones.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible modelos directamente comparables con datos verificables (parametros activos, contexto y benchmarks) de la misma categoria. La siguiente tabla recoge unicamente las variantes del mismo modelo y el unico repositorio del mismo autor con tematica cientifica que aparece en la busqueda, con los datos que constan:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Fx-Phys-i1-GGUF | 35,5 B totales (activos no disponible) | no disponible | GGUF i1 (imatrix) | Apache 2.0 | Objeto de esta ficha; cuantizaciones ponderadas por importancia |
| mradermacher/Fx-Phys-GGUF | 35,5 B totales | no disponible | GGUF estatico | Apache 2.0 | Mismas cuantizaciones sin imatrix; aloja los ficheros mmproj para vision |
| endless-frontier/Fx-Phys | 35,5 B totales | no disponible | safetensors (HF) | Apache 2.0 | Modelo base sin cuantizar; requiere ~71 GB en bf16 |
| mradermacher/PhysBrain1.5-2B-i1-GGUF | ~2 B (por el nombre) | no disponible | GGUF i1 | no disponible | Otro modelo de tematica fisica cuantizado por el mismo autor; escala muy inferior y sin datos publicados en la busqueda |

## Limitaciones y advertencias

- Idioma: el campo `language` declara unicamente ingles. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en fisica, finanzas ni tool calling, por lo que las etiquetas del repositorio no deben tomarse como garantia de rendimiento.
- Riesgo de alucinacion en dominios tecnicos: en razonamiento cientifico y, especialmente, en datos financieros, el modelo puede generar cifras o referencias plausibles pero incorrectas; se requiere verificacion externa y, en produccion, calculo determinista mediante herramientas.
- Este repositorio es una recuantizacion no oficial: los pesos han pasado por conversion a HF y cuantizacion, de modo que las cuantizaciones de baja precision (Q2, IQ1, IQ2) degradan la calidad respecto al modelo base. El autor advierte explicitamente que Q2_K e IQ3_XXS son intercambiables en tamano pero no en calidad.
- Longitud de contexto desconocida: no se puede dimensionar la cache KV ni garantizar conversaciones multi-turno largas sin pruebas propias.
- Vision dependiente de otro repositorio: los ficheros mmproj no estan en este repositorio sino en mradermacher/Fx-Phys-GGUF; un despliegue multimodal requiere descargar de ambas fuentes y una build de llama.cpp con soporte multimodal.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar el fichero LICENSE y la procedencia de los datos de entrenamiento del modelo base antes de un despliegue productivo; la licencia no exime de responsabilidades sobre sesgos o contenido generado.
- Sesgos: no documentados. Al no publicarse informacion sobre la composicion del corpus, no es posible evaluar sesgos de genero, geograficos o culturales.
- Madurez: 241 descargas y 0 likes indican una adopcion muy limitada; no hay issues, evaluaciones de terceros ni informes de la comunidad en la informacion proporcionada.
- Soporte de tool calling no verificado en GGUF: aunque la etiqueta `tool-use` aparece en el repositorio, el formato exacto de plantilla de herramientas debe comprobarse en la build concreta de llama.cpp u Ollama utilizada.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/mradermacher/Fx-Phys-i1-GGUF
- Modelo base: https://huggingface.co/endless-frontier/Fx-Phys
- Cuantizaciones estaticas y ficheros mmproj: https://huggingface.co/mradermacher/Fx-Phys-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Fx-Phys-i1-GGUF
- Solicitudes de cuantizacion y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Perfil GitHub de mradermacher: https://github.com/mradermacher
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Referencia de uso de GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH (infraestructura empleada por el cuantizador): https://www.nethype.de/
- Otro modelo de tematica fisica del mismo autor: https://huggingface.co/mradermacher/PhysBrain1.5-2B-i1-GGUF
