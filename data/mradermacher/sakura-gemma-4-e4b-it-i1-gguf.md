# mradermacher/sakura-gemma-4-E4B-it-i1-GGUF

## Resumen

sakura-gemma-4-E4B-it-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo Takenoko12345678/sakura-gemma-4-E4B-it, un ajuste fino (LoRA) sobre la familia Gemma de cuarta generacion orientado a conversacion en japones e ingles con enfasis en persona y roleplay. El repositorio no contiene pesos originales en precision completa, sino una bateria de cuantizaciones de tipo imatrix (i1) pensadas para su uso con llama.cpp y derivados.

El modelo base declara 7.518.069.290 parametros reales en safetensors, pese a la denominacion comercial "E4B" que sugiere un modelo de aproximadamente 4.000 millones de parametros efectivos. Los tags del repositorio indican capacidades multimodales (vision) y un modo de razonamiento explicito (thinking), ademas de estar afinado para japones e ingles.

La relevancia de esta ficha reside en que empaqueta un modelo conversacional especializado en japones en formatos ligeros (desde 4,5 GB en Q2_K hasta 6,3 GB en Q6_K) ejecutables en hardware de consumo, con licencia Apache 2.0 y compatibilidad con endpoints. Es una opcion practica para desplegar personajes conversacionales o asistentes en japones en local sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Gemma 4 (familia Gemma); detalles exactos no disponibles |
| Parametros totales | 7.518.069.290 (segun safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); los pesos originales del modelo base estarian en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Gemma 4 de Google, de la que no se detallan en la informacion disponible ni el numero de capas, ni la dimension oculta, ni si emplea atencion lineal o hibrida. Los tags del repositorio confirman que es un modelo multimodal (vision) con soporte de modo thinking y que ha sido adaptado mediante LoRA sobre el checkpoint base, lo que implica un ajuste fino supervisado adicional sobre datos conversacionales en japones e ingles.

No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion realizada por mradermacher emplea ficheros imatrix, lo que mejora la calidad de las cuantizaciones de baja precision (especialmente las series IQ) frente a cuantizaciones estaticas equivalentes en tamano. No hay datos sobre decodificacion especulativa ni optimizaciones de inferencia especificas.

## Capacidades

- Generacion de texto conversacional en japones e ingles, con enfasis en mantener una persona consistente a lo largo de la conversacion.
- Roleplay y simulacion de personajes, segun los tags del repositorio (persona, roleplay).
- Modo de razonamiento explicito (thinking), segun los tags del modelo.
- Capacidades multimodales de vision, segun los tags; los ficheros mmproj, si existen, se alojan en el repositorio estatico de cuantizaciones.
- Compatibilidad declarada con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues adicionales al japones e ingles: no disponibles.

## Casos de uso

- Personajes conversacionales en japones: el modelo puede mantener una persona estable en conversaciones multi-turno gracias a su ajuste especifico para roleplay, desplegado en local con llama.cpp u Ollama sobre una GPU de consumo.
- Asistente de atencion al cliente en japones: integrado en un backend de chat, gestiona respuestas en japones natural con un tono controlado por la persona configurada, sin enviar datos a terceros al ejecutarse en local.
- Prototipado de videojuegos o novelas visuales: permite generar dialogos de personajes en japones para pruebas de guion y sistemas de dialogo ramificado, con cuantizaciones Q4_K_M de 5,4 GB que caben en GPUs de 8 GB.
- Traduccion y adaptacion de contenido japones: uso como modelo de apoyo para reescritura y localizacion de textos entre japones e ingles, aprovechando su entrenamiento bilingue.
- Investigacion sobre alineacion de persona: sirve como caso de estudio de ajuste LoRA sobre Gemma 4 para estudiar como se preservan o degradan rasgos de personalidad tras cuantizaciones agresivas (Q2_K, IQ2).
- Despliegue en entornos con requisitos de privacidad: al ser Apache 2.0 y ejecutable en local, encaja en escenarios donde el contenido conversacional no puede salir de la infraestructura propia, como prototipos internos de RRHH o formacion.
- Evaluacion de cuantizaciones: el repositorio ofrece una matriz completa de cuantizaciones i1 que permite comparar calidad y velocidad en una misma tarea conversacional, util para calibrar que nivel de cuantizacion es aceptable para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4,5 GB (i1-Q2_K) y 6,3 GB (i1-Q6_K) solo para los pesos; anadir entre 1 y 2 GB adicionales para contexto KV y overhead del runtime.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090; en el segmento profesional, A10, L4 o A100 si se requiere concurrencia alta.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con cuantizaciones Q3 o IQ3, y con holgura en tarjetas de 8 GB o mas usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI mediante llama.cpp server; vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sakura-gemma-4-E4B-it (i1-GGUF) | 7.518.069.290 | no disponible | ja, en | Apache 2.0 | GGUF |
| Gemma 4 E4B base (familia) | no disponible | no disponible | multilingue | Gemma terms | safetensors |
| Modelos japoneses de rol de tamano similar (p. ej. variantes de Gemma/Llama ajustadas en ja) | no disponible | no disponible | ja, en | variable | GGUF, safetensors |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El modelo esta especializado en japones e ingles; su rendimiento en castellano no esta documentado y probablemente sea deficiente frente a modelos multilingues genericos.
- Al ser un ajuste fino orientado a persona y roleplay, puede producir respuestas sesgadas hacia el personaje configurado y desviarse de tareas factuales o tecnicas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- No se detalla la longitud de contexto soportada, lo que impide garantizar conversaciones de contexto largo; conviene validarlo empiricamente antes de produccion.
- Las cuantizaciones de baja precision (Q2_K, IQ2) degradan notablemente la coherencia conversacional; para produccion se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma esta sujeto a los terminos de Google; conviene revisar la compatibilidad de ambas licencias antes de un despliegue comercial.
- La informacion sobre tool calling, agentes y capacidades multimodales practicas no esta confirmada en la model card; los tags no equivalen a documentacion funcional.
- El repositorio tiene 0 likes y un volumen de descargas moderado (1862), lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/sakura-gemma-4-E4B-it-i1-GGUF
- Modelo base: https://huggingface.co/Takenoko12345678/sakura-gemma-4-E4B-it
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/sakura-gemma-4-E4B-it-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#sakura-gemma-4-E4B-it-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
