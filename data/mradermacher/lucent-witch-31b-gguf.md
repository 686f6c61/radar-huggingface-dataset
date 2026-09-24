# mradermacher/Lucent-Witch-31B-GGUF

## Resumen

Lucent-Witch-31B-GGUF es la versión cuantizada en formato GGUF del modelo Cyclone-Labs/Lucent-Witch-31B, publicada por el usuario mradermacher. Se trata de un modelo de 30.697.345.596 parámetros (aproximadamente 30,7 mil millones) obtenido mediante mergekit, es decir, por fusión de pesos de otros modelos, y está orientado explícitamente a roleplay y narrativa (storytelling) según las etiquetas declaradas por el autor.

El repositorio no entrena ni modifica el modelo original: únicamente distribuye cuantizaciones estáticas en GGUF (de Q2_K a Q8_0, además de cuantizaciones IQ4_XS y ficheros mmproj multimodales) para facilitar la inferencia en hardware de consumo mediante llama.cpp y sus derivados. El modelo base se distribuye bajo licencia Apache 2.0 y está declarado únicamente para inglés.

Su relevancia es práctica: permite ejecutar localmente un modelo de ~31B especializado en conversación de personajes y escritura creativa sin necesidad de infraestructura de GPU de datacenter, y sirve como material de partida para quienes investigan fusiones de modelos y despliegue en local. La información disponible no incluye detalles sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fusionado con mergekit; la informacion proporcionada no detalla la arquitectura interna del modelo base) |
| Parametros totales | 30.697.345.596 (~30,7 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (12,0 GB), Q3_K_S (13,9 GB), Q3_K_M (15,4 GB), Q3_K_L (16,7 GB), IQ4_XS (17,0 GB), Q4_K_S (17,9 GB), Q4_K_M (18,8 GB), Q5_K_S (21,4 GB), Q5_K_M (21,9 GB), Q6_K (25,3 GB), Q8_0 (32,7 GB); cuantizaciones ponderadas/imatrix en el repositorio mradermacher/Lucent-Witch-31B-i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el autor indica tambien `convert_type: hf` y ficheros mmproj en f16 y Q8_0 |
| Autor de la cuantizacion | mradermacher |
| Modelo base | Cyclone-Labs/Lucent-Witch-31B |
| Tamano del repositorio | 213,9 GB |
| Fecha de creacion / actualizacion | 24 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes en el momento de la consulta | 0 descargas, 0 likes |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico confirmado es que Cyclone-Labs/Lucent-Witch-31B es el resultado de una fusion de modelos (etiquetas `mergekit` y `merge`), que cuenta con unos 30,7 mil millones de parametros y que esta especializado en roleplay y storytelling. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste por instrucciones, RLHF o DPO. Tampoco se confirma si la fusion se realizo sobre modelos densos o con mezcla de expertos.

Como innovacion tecnica destacable en este repositorio, cabe senalar que el cuantizador incluye ficheros `mmproj` (multi-modal projector) en f16 (1,3 GB) y Q8_0 (0,9 GB), lo que sugiere soporte multimodal en el modelo base. Esta capacidad no se describe en la model card mas alla de la mencion "multi-modal supplement", por lo que debe verificarse contra el repositorio original antes de asumirla en produccion. El proceso de cuantizacion es el habitual de mradermacher: cuantizaciones estaticas generadas a partir de los pesos originales, con una variante adicional ponderada por matriz de importancia (imatrix) publicada en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en roleplay (interpretacion de personajes) y narrativa.
- Escritura creativa y continuacion de historias: al proceder de una fusion orientada a storytelling, es esperable un estilo mas literario que el de modelos generalistas, aunque no hay evaluaciones publicadas que lo cuantifiquen.
- Conversacion multiturno manteniendo una persona o personaje concreto a lo largo de la sesion.
- Soporte multimodal potencial: el repositorio incluye ficheros mmproj, lo que apunta a entrada de imagenes, pero la documentacion disponible no especifica que modalidades ni como activarlas.
- Capacidades de tool calling / function calling: no disponible en la informacion proporcionada.
- Comportamiento agentico y razonamiento multi-paso: no disponible; el enfasis del modelo no es agentico sino conversacional y creativo.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio; no se declara soporte de castellano.
- Modo de pensamiento explicito (thinking mode), audio o vision declarada formalmente: no disponible.

## Casos de uso

- Roleplay y compania conversacional autoalojada: el modelo puede mantener un personaje coherente en conversaciones largas de multiples turnos con usuarios humanos. Es adecuado porque la fusion esta optimizada para este tipo de dialogo y al ejecutarse en local los registros no salen del equipo del usuario.
- Asistente de escritura de ficcion serializada: uso como copiloto para generar capitulos, dialogos o descripciones manteniendo el tono de una obra. La cuantizacion Q6_K o Q8_0 permite conservar mejor el estilo del modelo original en tareas de generacion larga.
- Motor de personajes no jugables (NPC) en videojuegos y prototipos interactivos: integrado mediante llama.cpp server, el modelo puede responder en tiempo real a las acciones del jugador. Con Q4_K_M en una GPU de 24 GB se obtiene un equilibrio razonable entre calidad y latencia.
- Herramienta de apoyo para partidas de rol de mesa: generacion de descripciones de escenarios, dialogos de PNJ y respuestas improvisadas a las decisiones de los jugadores, ejecutado en el portatil del director de juego con cuantizaciones Q3_K_M o Q4_K_S.
- Creacion de contenido para audiolibros y narrativa de marca: redaccion de guiones y textos narrativos con una voz consistente, aprovechando la orientacion literaria del merge. Requiere revision humana por el riesgo de deriva estilistica y alucinacion de detalles.
- Experimentacion en investigacion sobre fusiones de modelos: el repositorio permite evaluar el impacto de distintas cuantizaciones (de Q2_K a Q8_0) sobre un mismo merge, comparando coherencia narrativa y perplejidad antes de decidir que formato desplegar.
- Base para ajuste fino posterior en otro entorno: el modelo original en safetensors (Cyclone-Labs/Lucent-Witch-31B) es el punto de partida adecuado para LoRA o QLoRA; las cuantizaciones GGUF de este repositorio no estan pensadas para entrenamiento, solo para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni metricas de perplejidad para las distintas cuantizaciones. El autor enlaza una grafica externa comparativa de perplejidad entre tipos de cuantizacion de baja calidad, pero no aporta valores especificos para este modelo. Cualquier cifra de rendimiento deberia obtenerse midiendo directamente sobre el modelo base o consultando la documentacion de Cyclone-Labs/Lucent-Witch-31B.

## Requisitos de hardware

Estimaciones de VRAM basadas en el tamano de los ficheros GGUF publicados; hay que anadir entre 1 y 3 GB adicionales para el contexto y el runtime segun la longitud de la ventana y el backend:

- Q2_K (12,0 GB): viable en GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) con contexto corto; tambien util con offload parcial a CPU.
- Q3_K_S (13,9 GB) y Q3_K_M (15,4 GB): ajustadas en 16 GB, comodas en 24 GB.
- Q3_K_L (16,7 GB) e IQ4_XS (17,0 GB): recomendables a partir de 24 GB para dejar margen de contexto.
- Q4_K_S (17,9 GB) y Q4_K_M (18,8 GB): el punto dulce para una RTX 4090 o RTX 3090 de 24 GB; el autor marca ambas como "fast, recommended".
- Q5_K_S (21,4 GB) y Q5_K_M (21,9 GB): muy justas en 24 GB, dependen de la longitud de contexto; mejor en GPU de 32 GB.
- Q6_K (25,3 GB): requiere 32 GB o mas (RTX 5090, A100 40 GB, H100).
- Q8_0 (32,7 GB): requiere 40 GB o mas (A100 40 GB, A6000, H100); es la cuantizacion de mayor calidad del repositorio.
- GPU recomendadas por tramo: RTX 3060 12 GB y RTX 4060 Ti 16 GB para Q2_K y Q3_K_S; RTX 4080/4090 y RTX 3090 para Q4_K; A100 40 GB o H100 para Q6_K y Q8_0.
- Despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, koboldcpp y text-generation-webui son las opciones naturales para GGUF. vLLM y TGI no estan optimizados para cuantizaciones GGUF de este tipo; para servirlas conviene usar el servidor de llama.cpp o un frontend compatible con su API.
- Ficheros mmproj: si se usa la via multimodal, hay que cargar adicionalmente el mmproj f16 (1,3 GB) o Q8_0 (0,9 GB) con un backend que lo soporte; el consumo extra de VRAM es el de la torre de vision correspondiente.
- Latencia y throughput: no disponibles. Dependen del backend, la GPU, la cuantizacion y la longitud de contexto; no se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la informacion proporcionada. La unica comparacion posible con los datos disponibles es entre variantes del mismo modelo:

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Cyclone-Labs/Lucent-Witch-31B | ~30,7 mil millones | safetensors (fp16) | apache-2.0 | Modelo base original; apto para inferencia de alta calidad y para ajuste fino |
| mradermacher/Lucent-Witch-31B-GGUF | ~30,7 mil millones | GGUF con cuantizaciones estaticas de Q2_K a Q8_0 | apache-2.0 | Este repositorio; pensado para inferencia en local y hardware de consumo |
| mradermacher/Lucent-Witch-31B-i1-GGUF | ~30,7 mil millones | GGUF con cuantizaciones ponderadas por imatrix | apache-2.0 | Variante alternativa del mismo autor, habitualmente con mejor relacion calidad/tamano |

Comparativa con modelos de terceros (por ejemplo, otros merges de roleplay de ~30B o modelos instruct generalistas de tamano similar): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo declara unicamente ingles. No hay evidencia de soporte fiable de castellano, por lo que su uso en produccion en espanol requeriria validacion previa.
- Sesgos: al ser una fusion de modelos de roleplay entrenados sobre corpora no documentados, es probable que herede sesgos de genero, culturales y de estilo de los modelos de origen. No se ha publicado ninguna evaluacion de sesgos.
- Alucinacion: no hay datos de evaluacion de veracidad. En tareas factuales o de recuperacion de informacion, el riesgo de invencion de datos es alto, especialmente con cuantizaciones agresivas como Q2_K o Q3_K.
- Degradacion por cuantizacion: las cuantizaciones Q2_K y Q3_K_M se marcan como de menor calidad en la propia tabla del autor. Para roleplay y narrativa, donde el estilo importa, conviene usar Q5_K_M o superior.
- Contexto: no se especifica la longitud de contexto soportada. No debe asumirse una ventana larga sin verificarla en la documentacion del modelo base.
- Multimodalidad no documentada: la presencia de ficheros mmproj apunta a vision, pero la model card no detalla modos de uso, resoluciones ni limitaciones. Tratarlo como experimental hasta confirmarlo en el repositorio original.
- Entrenamiento: las cuantizaciones GGUF no son adecuadas para ajuste fino ni para continuar el entrenamiento; para ello hay que usar los pesos originales.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la licencia del merge no exime de posibles obligaciones heredadas de los modelos de origen de la fusion. Conviene revisar la trazabilidad de la fusion antes de un despliegue comercial.
- Procedencia y mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay historial de mantenimiento mas alla de una unica actualizacion el mismo dia de su creacion.</br>
- Repositorio de gran tamano: 213,9 GB en total; descargar solo el fichero de la cuantizacion deseada, no el repositorio completo.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/Lucent-Witch-31B-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Lucent-Witch-31B
- Cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/Lucent-Witch-31B-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Lucent-Witch-31B-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
