# mradermacher/Qwen2.5-1.5B-Instruct-heretic-ara-GGUF

## Resumen

Qwen2.5-1.5B-Instruct-heretic-ara-GGUF es una cuantizacion en formato GGUF del modelo aasis001/Qwen2.5-1.5B-Instruct-heretic-ara, un derivado del Qwen2.5-1.5B-Instruct de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF, mientras que la modificacion "heretic-ara" (abliterated/decensored) proviene del autor original del modelo base. El resultado es un modelo conversacional de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) pensado para ejecucion local en hardware modesto.

La relevancia de esta ficha radica en que combina tres factores poco habituales: un tamano muy reducido que permite inferencia en CPU o GPUs de consumo, una licencia Apache 2.0 que facilita el uso comercial, y una variante "abliterated" que elimina parte de los mecanismos de rechazo del modelo original. Esto lo hace interesante para experimentacion con modelos descensurados en entornos controlados y para despliegues de bajo coste donde el modelo base de Qwen2.5 resulta excesivamente restrictivo.

No obstante, conviene subrayar que la informacion disponible sobre el proceso de abliteration, los datos de entrenamiento especificos y los benchmarks es practicamente inexistente en la model card. La ficha se limita, por tanto, a lo que puede verificarse a partir de los metadatos y del conocimiento publico del modelo Qwen2.5-1.5B-Instruct subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el Qwen2.5-1.5B-Instruct original soporta 32.768 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del Qwen2.5-1.5B-Instruct original: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El modelo base de Qwen2.5 fue entrenado por Alibaba con un corpus de hasta 18 billones de tokens segun la documentacion publica de la familia Qwen2.5, seguido de un proceso de post-entrenamiento que incluye instruction tuning y alineamiento por preferencias. Sin embargo, la model card de esta variante no documenta el numero de tokens, la composicion del dataset ni los detalles del proceso de alineamiento.

La modificacion "heretic-ara" aplicada por aasis001 no esta documentada tecnicamente en la informacion disponible. Por los tags (heretic, abliterated, decensored, uncensored) se deduce que se trata de una tecnica de abliteration, que consiste en identificar y proyectar fuera del espacio de activaciones las direcciones asociadas al rechazo de peticiones, de forma que el modelo deja de declinar ciertas solicitudes. No se especifican en la model card ni la metodologia exacta, ni el numero de capas afectadas, ni las metricas de degradacion asociadas. La cuantizacion realizada por mradermacher es estatica, sin imatrix (las versiones con imatrix se publican en un repositorio separado).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del instruction tuning de Qwen2.5-1.5B-Instruct.
- Razonamiento basico y resolucion de problemas sencillos, limitado por el tamano de 1,5 B de parametros.
- Generacion de codigo y respuesta a preguntas tecnicas de complejidad baja o media.
- Capacidad reducida de matematicas, adecuada para operaciones simples pero no para razonamiento matematico multi-paso.
- Comportamiento descensurado: el proceso de abliteration reduce los rechazos ante peticiones que el modelo original declinaria.
- Soporte de conversaciones multi-turno mediante plantilla de chat (formato ChatML de Qwen).
- Capacidades de tool calling y function calling no documentadas en esta variante; el modelo base Qwen2.5-1.5B-Instruct las soporta, pero la abliteration puede haberlas degradado y no hay confirmacion.
- Capacidades de agente y razonamiento multi-paso no verificadas en esta variante.
- Capacidades multimodales: no disponibles (modelo exclusivamente de texto).
- Modo thinking explicito: no disponible.

## Casos de uso

- Experimentacion con modelos descensurados en laboratorio: util para investigadores que estudian el comportamiento de modelos tras tecnicas de abliteration y su impacto en la calidad general, ejecutando el modelo en local con llama.cpp u Ollama.
- Prototipado rapido de asistentes conversacionales en ingles: el modelo cabe en menos de 2 GB en cuantizacion Q4_K_M, lo que permite iterar en portatiles sin GPU dedicada.
- Despliegue en dispositivos de borde: con cuantizaciones Q2_K o Q3_K (0,8-1,0 GB) puede ejecutarse en Raspberry Pi 5 o moviles de gama alta mediante llama.cpp, para tareas de generacion de texto offline.
- Generacion de texto creativo sin restricciones tematicas: el caracter descensurado permite explorar narrativa, guiones o contenido que el modelo original rechazaria, siempre dentro del marco legal aplicable.
- Filtrado y clasificacion de texto en pipelines de datos: con 1,5 B de parametros y contexto de 32.768 tokens (heredado del base), puede procesar lotes de documentos largos en CPU con latencia aceptable.
- Educacion y demostraciones tecnicas: su reducido tamano lo hace idoneo para talleres donde se explica el funcionamiento de transformers, cuantizacion GGUF y tecnicas de abliteration sin requerir infraestructura de GPU.
- Chatbot de soporte interno en entornos air-gapped: al ser Apache 2.0 y ejecutable en CPU, puede desplegarse en servidores sin conexion a internet para responder preguntas frecuentes de documentacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad o utilidad tras la abliteration. Tampoco se aportan comparaciones con el Qwen2.5-1.5B-Instruct original que permitan cuantificar la degradacion introducida por el proceso heretic-ara.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,8 GB (Q2_K) y 3,2 GB (f16); la cuantizacion recomendada Q4_K_M ocupa aproximadamente 1,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060). Para f16 se recomienda al menos 4 GB (GTX 1650 Super, RTX 3050).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos ocho anos, y tambien en iGPUs modernas (Intel Iris Xe, AMD Radeon 680M) con cuantizaciones Q4 o inferiores.
- Ejecucion en CPU: viable con llama.cpp; en un procesador moderno de 8 nucleos se pueden esperar velocidades de generacion del orden de decenas de tokens por segundo con Q4_K_M, aunque no se dispone de mediciones oficiales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (el tag endpoints_compatible sugiere compatibilidad con endpoints estandar). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para estos frameworks convendria usar el modelo base en safetensors.
- Latencia y throughput: no disponibles de forma oficial; dependen fuertemente del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-heretic-ara-GGUF (este) | 1,5 B | no disponible (base: 32.768) | Apache 2.0 | GGUF | Variante abliterated, solo ingles |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo original con alineamiento completo |
| Llama-3.2-1B-Instruct | 1,2 B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Mayor contexto, licencia mas restrictiva |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | Apache 2.0 | safetensors, GGUF | Alternativa ligera, sin variante abliterated conocida |
| Gemma-2-2B-it | 2,6 B | 8.192 | Gemma Terms of Use | safetensors, GGUF | Mayor calidad, licencia no comercial en la practica |

La comparativa se basa en caracteristicas publicas de los modelos citados; no se dispone de evaluaciones cruzadas con esta variante concreta que permitan afirmar superioridad o inferioridad en benchmarks.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo del modelo, lo que implica que puede generar contenido ofensivo, inseguro o legalmente problematico sin filtros. No es apto para despliegues publicos sin una capa de moderacion externa.
- La abliteration suele degradar capacidades generales (razonamiento, coherencia, instruction following) respecto al modelo original; no se han publicado metricas que cuantifiquen esta perdida en esta variante concreta.
- Riesgo elevado de alucinacion: con 1,5 B de parametros, el modelo inventa hechos con frecuencia, especialmente en preguntas factuales o matematicas multi-paso.
- Idiomas: la model card solo declara ingles. Aunque Qwen2.5-1.5B-Instruct tiene cierta competencia multilingue, no esta garantizada ni documentada en esta variante.
- Contexto: la model card no especifica la longitud de contexto efectiva; aunque el base soporta 32.768 tokens, la cuantizacion y la abliteration pueden afectar al rendimiento en contextos largos, y no hay verificacion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre la legalidad del contenido generado en jurisdicciones concretas.
- El modelo base Qwen2.5-1.5B-Instruct-heretic-ara tiene pocas descargas (736 en el momento de la consulta) y cero likes, lo que indica escasa validacion por parte de la comunidad.
- No hay informacion sobre sesgos especificos introducidos o amplificados por la abliteration; es esperable que los sesgos del corpus original de Qwen2.5 persistan o se acentuen.
- El repositorio ocupa 14,2 GB porque incluye todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-1.5B-Instruct-heretic-ara-GGUF
- Modelo base (variante heretic-ara): https://huggingface.co/aasis001/Qwen2.5-1.5B-Instruct-heretic-ara
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen2.5-1.5B-Instruct-heretic-ara-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-1.5B-Instruct-heretic-ara-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
