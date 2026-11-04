# mradermacher/Atlantis-Pyramid-32B-GGUF

## Resumen

Atlantis-Pyramid-32B-GGUF es la distribucion en formato GGUF de los pesos del modelo Coralfil/Atlantis-Pyramid-14B-Glyph, publicada por el usuario mradermacher, conocido por convertir modelos a cuantizaciones GGUF listas para llama.cpp y Ollama. El modelo subyacente es un ajuste fino (SFT mediante LoRA) de una base de la familia Qwen, orientado especificamente a dominios oceanicos: restauracion marina, clima oceanico, acuicultura, gestion del agua, acidificacion oceanica y biologia marina. La licencia declarada es Apache 2.0 y el unico idioma soportado es el ingles.

A pesar del nombre comercial "32B", los pesos reales del repositorio contienen 14.770.033.664 parametros (aproximadamente 14,77 B), en linea con el modelo base Coralfil/Atlantis-Pyramid-14B-Glyph. La discrepancia entre el nombre y el tamano real es un detalle importante a la hora de planificar despliegues. La relevancia actual del modelo radica en su especializacion vertical: frente a modelos generalistas, ofrece un ajuste orientado a terminologia y tareas del ambito oceanico, con cuantizaciones que van desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), lo que permite ejecucion en hardware de consumo.

El repositorio ocupa 102 GB e incluye once cuantizaciones estaticas. No se han publicado resultados de benchmarks ni detalles sobre la composicion del dataset de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Qwen, segun tags del repositorio); detalles no disponibles |
| Parametros totales | 14.770.033.664 (aproximadamente 14,77 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; no hay quants con imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base publica pesos en safetensors |
| Tamano del repositorio | 102,0 GB |
| Modelo base | Coralfil/Atlantis-Pyramid-14B-Glyph |
| Metodo de ajuste | LoRA + SFT sobre base Qwen (segun tags) |
| Descargas | 378 |
| Fecha de creacion | 2026-07-13 |
| Ultima actualizacion | 2026-11-04 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de los tags del repositorio, que apuntan a una base de la familia Qwen y a un proceso de ajuste mediante LoRA y SFT (supervised fine-tuning). No se especifica el numero de capas, la dimension oculta, el tipo de atencion ni si se emplearon tecnicas como RoPE extendido o atencion lineal. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO posteriores al SFT.

Lo que si es verificable es el pipeline de publicacion: mradermacher ha generado cuantizaciones estaticas (sin imatrix) mediante conversion desde pesos HuggingFace a formato GGUF, con la etiqueta `convert_type: hf` y `quantize_version: 2`. El autor indica explicitamente que las cuantizaciones ponderadas con imatrix no estan disponibles en el momento de la publicacion. La especializacion tematica del ajuste se deduce de los tags: ocean, ocean-restoration, ocean-climate, aquaculture, water-management, ocean-acidification, marine-biology y coralfill.

## Capacidades

- Generacion de texto conversacional en ingles, con ajuste orientado a dominios oceanicos y de gestion del agua.
- Razonamiento y respuesta sobre tematicas de restauracion marina, acidificacion oceanica, acuicultura y biologia marina (segun la especializacion declarada en los tags).
- Soporte de conversaciones multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia con API compatible con OpenAI.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente tecnico para proyectos de restauracion de arrecifes: el modelo puede responder consultas sobre metodos de coral farming, sustratos, seleccion de especies y monitorizacion, aprovechando su ajuste SFT sobre terminologia de restauracion marina.
- Soporte a investigadores en acidificacion oceanica: consultas sobre quimica del carbonato, protocolos de medida de pH y diseno experimental, con un vocabulario especializado que reduce la deriva hacia respuestas genericas.
- Gestion de explotaciones acuicolas: generacion de borradores de protocolos de calidad del agua, planes de alimentacion y registros de incidencias, desplegable en local mediante llama.cpp u Ollama en estaciones de trabajo con GPU de consumo.
- Redaccion de informes y divulgacion en clima oceanico: sintesis de conceptos para publicos tecnicos y no tecnicos en ingles, util para ONG y organismos de gestion costera.
- Clasificacion y enrutado de consultas en un chatbot de tematica ambiental: al estar disponible en GGUF con cuantizaciones Q4_K_M (9,1 GB), puede ejecutarse en una unica GPU de 12-16 GB y servir como primer filtro antes de derivar a modelos mayores.
- Prototipado rapido en entornos sin conectividad o con requisitos de privacidad: la version Q2_K (5,9 GB) permite ejecucion en portatiles con GPU modesta o incluso en CPU, adecuada para demos de campo en proyectos de conservacion.
- Generacion de material educativo sobre biologia marina: preguntas y respuestas, resumenes de articulos y glosarios, con la advertencia de que requiere revision humana por riesgo de alucinacion en datos cientificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto): Q2_K aproximadamente 6-7 GB; Q3_K_M aproximadamente 8-9 GB; Q4_K_M aproximadamente 10-11 GB; Q5_K_M aproximadamente 11-12 GB; Q6_K aproximadamente 13-14 GB; Q8_0 aproximadamente 17-18 GB. Estas cifras son estimaciones a partir del tamano de los ficheros y no incluyen el coste del KV cache, que crece con la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4090 24 GB para Q6_K y Q8_0 con contexto amplio; A100 40/80 GB o H100 para despliegues concurrentes con vLLM o TGI (aunque el formato GGUF esta mas orientado a llama.cpp).
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones. Q4_K_M (9,1 GB) es la opcion recomendada por el autor para GPU de 12 GB o mas. Q2_K permite incluso ejecucion parcial en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF (llama-cpp-python, text-generation-webui). Para vLLM o TGI seria preferible usar los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor marca Q4_K_S, Q4_K_M y Q8_0 como "fast" y Q6_K como "very good quality", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Atlantis-Pyramid-32B-GGUF (este) | 14,77 B | no disponible | en | Apache 2.0 | GGUF | Ajuste SFT especializado en dominios oceanicos |
| Coralfil/Atlantis-Pyramid-14B-Glyph | 14,77 B | no disponible | en | Apache 2.0 (segun repositorio derivado) | safetensors | Modelo base del que derivan estas cuantizaciones |
| Qwen base de la familia | no disponible | no disponible | multilingue (segun version) | variable segun version | safetensors, GGUF | Modelo generalista; el ajuste de Atlantis anade especializacion vertical |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento con alternativas. La comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El nombre "32B" no corresponde al tamano real: los pesos contienen 14,77 B de parametros. Verificar siempre el tamano antes de dimensionar hardware.
- Solo soporta ingles; no se ha documentado capacidad multilingue y el castellano no esta cubierto oficialmente.
- Riesgo de alucinacion en datos cientificos (valores de pH, concentraciones, referencias bibliograficas) por tratarse de un ajuste SFT sin verificacion factual documentada.
- No se han publicado benchmarks, por lo que el rendimiento real frente a modelos generalistas del mismo tamano es desconocido.
- No hay cuantizaciones con imatrix disponibles; las estaticas pueden perder calidad en los niveles bajos (Q2_K, Q3_K_S).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden imponer condiciones adicionales no documentadas en esta ficha; conviene revisar la model card del modelo base.
- El ajuste LoRA sobre una base Qwen puede heredar sesgos del modelo original y del dataset de ajuste, no documentados.
- El repositorio tiene muy poca traccion (378 descargas, 0 likes) y no hay evidencia de validacion por parte de la comunidad.
- No se documenta la longitud de contexto soportada, lo que impide garantizar conversaciones largas o ingestion de documentos extensos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Atlantis-Pyramid-32B-GGUF
- Modelo base: https://huggingface.co/Coralfil/Atlantis-Pyramid-14B-Glyph
- Pagina de descargas del autor: https://hf.tst.eu/model#Atlantis-Pyramid-32B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
