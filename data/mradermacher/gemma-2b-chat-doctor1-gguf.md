# mradermacher/gemma-2b-chat-doctor1-GGUF

## Resumen

`mradermacher/gemma-2b-chat-doctor1-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `JC-24/gemma-2b-chat-doctor1`, un fine-tuning de Gemma 2B orientado a conversacion en el dominio sanitario. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, mientras que el modelo base original procede del usuario JC-24. El modelo hereda la arquitectura transformer decoder-only de Gemma 2B con aproximadamente 2.500 millones de parametros, lo que lo situa en la gama de modelos pequenos ejecutables en hardware de consumo.

La relevancia de esta publicacion es practica: ofrece el modelo original en una bateria de cuantizaciones que van desde Q2_K (1,3 GB) hasta f16 (5,1 GB), permitiendo desplegar un asistente conversacional especializado en salud en GPUs modestas o incluso en CPU mediante llama.cpp. Al tratarse de una cuantizacion y no de un modelo nuevo, sus capacidades y limitaciones son las del fine-tuning de origen, sobre el que la model card no aporta detalles de entrenamiento, dataset ni evaluacion.

La informacion disponible es deliberadamente escasa: la model card del repositorio GGUF se limita a listar los ficheros cuantizados y a remitir al modelo base. No se publican resultados de benchmarks, composicion del dataset de fine-tuning ni condiciones de licencia explicitas en este repositorio, lo que condiciona la evaluacion y obliga a tratar muchos campos como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 2B) |
| Parametros totales | 2.506.172.416 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tuning de Gemma 2B, un transformer decoder-only denso de aproximadamente 2.500 millones de parametros. El repositorio aqui descrito no entrena ni modifica la arquitectura: aplica cuantizacion post-entrenamiento sobre los pesos del modelo `JC-24/gemma-2b-chat-doctor1` y los empaqueta en formato GGUF para su uso con llama.cpp y derivados. Segun los metadatos de la model card, las cuantizaciones son de tipo "static" (sin imatrix); el propio autor remite a un repositorio paralelo (`gemma-2b-chat-doctor1-i1-GGUF`) para las versiones con imatrix, que suelen ofrecer mejor calidad a igual tamano.

No se dispone de informacion sobre el dataset de fine-tuning, el numero de tokens empleados, la composicion de los datos, ni sobre si se aplicaron tecnicas de RLHF, DPO o SFT. El nombre del modelo ("chat-doctor1") sugiere un ajuste orientado a conversacion en el ambito medico, pero esta inferencia no esta confirmada por documentacion tecnica en la informacion proporcionada. Tampoco se detalla la estrategia de cuantizacion mas alla de los tipos listados ni se aportan curvas de perplejidad propias.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del fine-tuning de Gemma 2B.
- Especializacion probable en dominio sanitario o "doctor" segun el nombre del modelo base, sin documentacion que lo confirme.
- Ejecucion local en CPU y GPU mediante llama.cpp y runtimes compatibles con GGUF.
- Soporte de conversacion multi-turno en la medida en que lo permita el modelo base.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad de vision, audio ni modo "thinking".
- Capacidades multilingues limitadas al ingles segun los metadatos (`language: en`).

## Casos de uso

- Prototipado de asistentes conversacionales sanitarios en local: el modelo puede desplegarse en una estacion de trabajo con una unica GPU de consumo para experimentar con dialogos de tematica medica sin enviar datos a servicios externos.
- Evaluacion de fine-tunings de dominio en entornos con recursos limitados: al caber en 1,3-2,8 GB segun cuantizacion, permite comparar rapidamente variantes de modelos 2B especializados.
- Despliegue en dispositivos edge o portatiles sin GPU dedicada: las cuantizaciones Q4_K_S y Q4_K_M (1,7 GB) son las recomendadas por el autor para inferencia rapida en CPU.
- Educacion e investigacion: util como caso de estudio de cuantizacion post-entrenamiento y de los compromisos calidad/tamano entre Q2_K y Q8_0.
- Generacion de respuestas de triaje o FAQ sanitarias en ingles: el ajuste de dominio puede emplearse para borradores de respuestas que un profesional revise posteriormente.
- Integracion en pipelines de prueba con llama.cpp: sirve como modelo de referencia ligero para validar infraestructura de inferencia GGUF antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB (Q2_K), 1,7 GB (Q4_K_M), 2,2 GB (Q6_K), 2,8 GB (Q8_0) y 5,1 GB (f16), sin contar el overhead del runtime ni el espacio para el contexto.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Para f16 se recomienda al menos 6-8 GB (RTX 2060 12 GB, RTX 3060 12 GB, RTX 4070, A100 o H100 si se busca throughput).
- Cabe en GPU de consumo: si, practicamente en todas las GPU modernas con 4 GB o mas; las cuantizaciones Q2_K y Q3 pueden ejecutarse incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face TGI o similares.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-2b-chat-doctor1-GGUF | 2,5 B | no disponible | no disponible | GGUF | Fine-tuning sanitario de Gemma 2B, cuantizado |
| google/gemma-2b | 2,5 B | 8K (segun documentacion de Gemma) | Gemma Terms of Use | safetensors, GGUF | Modelo base original de Google |
| google/gemma-2b-it | 2,5 B | 8K (segun documentacion de Gemma) | Gemma Terms of Use | safetensors, GGUF | Version instruction-tuned oficial |
| TinyLlama-1.1B-Chat | 1,1 B | 2K-4K (segun variante) | Apache 2.0 | safetensors, GGUF | Alternativa mas pequena y con licencia permisiva |

La comparativa con Gemma 2B e Gemma 2B-it es la mas directa por compartir arquitectura y tamano; la diferencia principal es el fine-tuning de dominio y la ausencia de documentacion sobre el mismo. TinyLlama se incluye como referencia de modelo pequeno con licencia permisiva, aunque con menor numero de parametros.

## Limitaciones y advertencias

- La model card no documenta el dataset de fine-tuning, por lo que no es posible evaluar sesgos introducidos en el ajuste de dominio sanitario.
- Riesgo de alucinacion inherente a modelos de 2B parametros, especialmente alto en dominio medico; no debe usarse como fuente de consejo clinico sin supervision profesional.
- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- La licencia no aparece indicada en el repositorio; al derivar de Gemma 2B, es probable que se apliquen los terminos de uso de Gemma, pero debe verificarse antes de cualquier uso comercial.
- La cuantizacion Q3_K_M esta marcada por el autor como "lower quality"; las cuantizaciones Q2_K y Q3 en general degradan notablemente la calidad frente a Q4 o superiores.
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse su disponibilidad.
- El modelo tiene solo 21 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- No hay benchmarks publicados que permitan comparar su calidad frente al modelo base o a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-2b-chat-doctor1-GGUF
- Modelo base: https://huggingface.co/JC-24/gemma-2b-chat-doctor1
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/gemma-2b-chat-doctor1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-2b-chat-doctor1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
