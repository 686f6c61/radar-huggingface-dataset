# mradermacher/InnoSpark3.2-27B-1102-i1-GGUF

## Resumen

InnoSpark3.2-27B-1102-i1-GGUF es una cuantizacion en formato GGUF del modelo InnoSpark3.2-27B-1102, desarrollado originalmente por sii-research y distribuido en este repositorio por mradermacher. Se trata de un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) orientado a tareas educativas y de tutoria, con arquitectura derivada de la familia Qwen segun las etiquetas del autor. El modelo base emplea tecnicas de aprendizaje por refuerzo (reinforcement learning) en su pipeline de entrenamiento.

La relevancia de este repositorio concreto reside en que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K hasta Q6_K, incluyendo variantes IQ) generadas con imatrix, lo que permite desplegar un modelo de 27B en hardware de consumo con perdidas de calidad controladas. El repositorio ocupa 218,6 GB e incluye todas las variantes cuantizadas, con tamanos que van desde 11,0 GB (i1-Q2_K) hasta 22,5 GB (i1-Q6_K).

La model card original identifica el modelo como un modelo de vision (vision model), lo que implica capacidades multimodales ademas del procesamiento de texto. Los idiomas declarados en la model card son chino (zh) e ingles (en). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, segun etiquetas del autor); modelo multimodal con capacidad de vision |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (cuantizaciones ponderadas con imatrix) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que la asocian a la familia Qwen y a un pipeline de reinforcement learning. El modelo base (sii-research/InnoSpark3.2-27B-1102) es un transformer de 27,3B parametros con capacidad de vision, segun la nota de la model card que lo describe como "vision model" y remite a los archivos mmproj en el repositorio estatico. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO mas alla de la mencion generica a reinforcement learning.

Las cuantizaciones de este repositorio se han generado con imatrix (importance matrix), una tecnica que pondera la cuantizacion segun la importancia de cada peso para reducir la perplejidad en comparacion con cuantizaciones estaticas del mismo tamano. El autor indica que las variantes IQ suelen ser preferibles a las no-IQ de tamano similar, y que i1-Q6_K es practicamente equivalente a un Q6_K estatico. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como conversational y orientado a tutoria educativa.
- Razonamiento y tutoria: las etiquetas education y tutoring indican un entrenamiento orientado a explicaciones pedagogicas.
- Capacidad de vision: la model card lo describe explicitamente como vision model, con archivos mmproj disponibles en el repositorio estatico.
- Aprendizaje por refuerzo: el pipeline declarado es reinforcement-learning, lo que sugiere optimizacion mediante recompensas.
- Multilingue limitado: soporte declarado de chino e ingles; no se confirma castellano ni otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Tutoria educativa automatizada: el modelo esta entrenado especificamente para tareas de education y tutoring, por lo que puede emplearse en plataformas de aprendizaje para generar explicaciones paso a paso de conceptos, adaptadas al nivel del estudiante, en chino o ingles.
- Asistencia en resolucion de problemas con imagenes: gracias a su capacidad de vision, puede procesar capturas de ejercicios, diagramas o pizarras y generar explicaciones textuales, integrandose en aplicaciones de estudio que reciben fotos de problemas.
- Generacion de material didactico: puede redactar ejercicios, resumenes y preguntas de evaluacion a partir de un temario, aprovechando su ajuste por refuerzo hacia respuestas utiles en contexto educativo.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_M (16,9 GB) e i1-Q5_K_M (19,6 GB) permiten ejecutar el modelo en estaciones de trabajo con GPU de 24 GB o en configuraciones con RAM suficiente, habilitando prototipos locales sin infraestructura en la nube.
- Investigacion sobre cuantizacion: el repositorio ofrece 14 variantes con imatrix, lo que permite comparar la degradacion de calidad entre niveles de cuantizacion en un modelo de 27B, util para estudiar el equilibrio tamano/calidad en modelos multimodales.
- Chatbot de soporte en ingles y chino: el modelo puede gestionar conversaciones multi-turno en esos dos idiomas para atencion al usuario en entornos bilingues, aunque la longitud de contexto no esta documentada.
- Evaluacion de modelos ajustados por RL: investigadores pueden usar el modelo como referencia para comparar el efecto del reinforcement learning en tareas de razonamiento pedagogico frente a modelos base de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, solo pesos): i1-Q2_K ~11,0 GB; i1-Q3_K_S ~12,4 GB; i1-IQ3_M ~12,9 GB; i1-Q4_K_S ~15,9 GB; i1-Q4_K_M ~16,9 GB; i1-Q5_K_M ~19,6 GB; i1-Q6_K ~22,5 GB. A estas cifras hay que sumar el espacio para el contexto KV y, en su caso, los archivos mmproj de vision.
- GPU recomendadas: para las cuantizaciones Q4 y superiores, GPU con 24 GB o mas (RTX 3090, RTX 4090, A10G, L4); para Q5_K_M y Q6_K, A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta i1-Q4_K_M o i1-Q5_K_S, dejando margen limitado para contexto; las variantes Q2 y Q3 caben en GPUs de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el pipeline declarado es transformers para el modelo base, pero los pesos de este repositorio son GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| InnoSpark3.2-27B-1102-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF (14 cuantizaciones) | Vision, tutoria, RL, zh/en |
| InnoSpark3.2-27B-1102 (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| InnoSpark3.2-27B-1102-GGUF (estatico) | 27,3B | no disponible | Apache 2.0 | GGUF estatico | Mismo modelo, cuantizaciones sin imatrix; incluye mmproj |
| Alternativas de 27B de proposito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Vision: los archivos mmproj necesarios para el procesamiento de imagenes no estan en este repositorio, sino en el repositorio estatico enlazado; sin ellos, el modelo funciona solo con texto.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- Alucinacion: no hay informacion sobre tasas de alucinacion ni sobre mitigaciones especificas; en contextos educativos, las respuestas incorrectas pueden tener impacto directo en el aprendizaje.
- Cuantizacion: las variantes Q2 y Q3 degradan la calidad de forma notable; el autor recomienda IQ3_XXS o superiores frente a Q2_K, y Q4_K_M como opcion recomendada de equilibrio.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datasets de entrenamiento originales, no detalladas aqui.
- Produccion: al ser una cuantizacion de terceros, no hay garantia de soporte ni de paridad exacta con el modelo base; conviene validar con evaluaciones propias antes de desplegar.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/InnoSpark3.2-27B-1102-i1-GGUF
- Modelo base: https://huggingface.co/sii-research/InnoSpark3.2-27B-1102
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/InnoSpark3.2-27B-1102-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#InnoSpark3.2-27B-1102-i1-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
