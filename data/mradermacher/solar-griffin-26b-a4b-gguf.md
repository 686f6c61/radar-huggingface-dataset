# mradermacher/Solar-Griffin-26B-A4B-GGUF

## Resumen

Solar-Griffin-26B-A4B-GGUF es la version cuantizada en formato GGUF del modelo Cyclone-Labs/Solar-Griffin-26B-A4B, publicada por el usuario mradermacher (responsable tambien de la infraestructura de cuantizacion de nethype GmbH). No se trata de un modelo entrenado desde cero, sino de un merge generado con mergekit y posteriormente convertido a GGUF para permitir inferencia local en hardware de consumo. El modelo base combina pesos orientados a roleplay, storytelling y conversacion, segun las etiquetas declaradas por el autor.

El modelo cuenta con 25.233.142.046 parametros totales (aproximadamente 25,2 mil millones), confirmados a partir de los tensores en safetensors del modelo base. El sufijo "A4B" de la nomenclatura sugiere una arquitectura de mezcla de expertos (MoE) con del orden de 4.000 millones de parametros activos por token, aunque este dato no aparece confirmado de forma explicita en la informacion disponible. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Su relevancia practica es acotada por el momento: el repositorio registra 0 descargas y 0 likes, y se creo el 16 de septiembre de 2026, por lo que se trata de una publicacion muy reciente y sin adopcion documentada. El interes principal reside en que ofrece una via de despliegue local (llama.cpp, Ollama, LM Studio y similares) para un merge de roleplay de ~25B, incluyendo ficheros mmproj que habilitan entrada multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (merge de pesos con mergekit; la nomenclatura "A4B" apunta a MoE, sin confirmar) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4.000 millones (inferido de la nomenclatura A4B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal). No hay cuants weighted/imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

Datos adicionales del repositorio: tamano total del repo 151,7 GB (incluye todas las cuantizaciones), libreria declarada transformers, creado el 2026-09-16 y actualizado el mismo dia.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base: no se detalla si emplea atencion completa, atencion lineal, SSM o un esquema hibrido, ni se especifica el numero de capas, cabezas o expertos. Lo unico documentado es que se trata de un merge construido con mergekit (etiquetas "mergekit" y "merge") a partir de otros pesos, y que el resultado se orienta a roleplay y storytelling. El sufijo A4B del nombre sugiere un diseno de mezcla de expertos con aproximadamente 4.000 millones de parametros activos, pero no hay confirmacion explicita en la model card.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo etapas de RLHF, DPO u otras tecnicas de alineamiento. No hay mencion a innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento explicito. La presencia de dos ficheros mmproj (Q8_0 de 0,9 GB y f16 de 1,3 GB) indica que el modelo incorpora un proyector multimodal, es decir, capacidad de procesar imagenes junto al texto, aunque la model card no detalla el codificador visual utilizado.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en roleplay y storytelling.
- Interpretacion de personajes y mantenimiento de estilo narrativo en conversaciones multi-turno (etiqueta "roleplay").
- Escritura creativa y narrativa larga (etiqueta "storytelling").
- Procesamiento multimodal de imagenes: el repositorio incluye ficheros mmproj-Q8_0 y mmproj-f16, necesarios para habilitar entrada visual en llama.cpp.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), pensada para su uso detras de APIs compatibles con el formato de chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de otros idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Cuantizacion en 12 variantes distintas, lo que permite ajustar el equilibrio entre calidad y consumo de memoria.

## Casos de uso

- Chatbots de personaje en local: el modelo esta disenado para roleplay, por lo que puede sostener conversaciones con una persona ficticia manteniendo tono y estilo; al ejecutarse en GGUF con llama.cpp u Ollama, los datos no salen del equipo del usuario.
- Escritura asistida de ficcion: util para generar borradores de escenas, dialogos y descripciones, gracias a su orientacion a storytelling y a su tamano de 25B, que permite mayor coherencia narrativa que modelos de 7-8B.
- Prototipado de narrativa interactiva para videojuegos: integrable mediante llama-cpp-python o servidores locales para generar respuestas de PNJ en tiempo de ejecucion, con cuantizaciones Q4_K_S o Q2_K si el presupuesto de VRAM es limitado.
- Generacion de dialogos para doblaje o guion: el modelo puede producir variantes de un mismo dialogo con distintos registros emocionales, aprovechando su especializacion conversacional.
- Asistente personal off-line en ingles: con la cuantizacion Q4_K_S (15,6 GB) cabe en una GPU de 24 GB, lo que permite un asistente local sin coste por token ni dependencia de APIs externas.
- Descripcion de imagenes en ingles dentro de un flujo conversacional: los ficheros mmproj permiten adjuntar imagenes y pedir al modelo que las comente o las incorpore al roleplay, algo poco habitual en modelos de este tamano orientados a narrativa.
- Base para fine-tuning o merges posteriores: al estar publicado bajo Apache 2.0 y en GGUF, sirve como referencia de calidad para comparar merges, si bien para reentrenar haria falta partir del modelo base en safetensors.
- Evaluacion comparativa de cuantizaciones: con 12 variantes publicadas, permite medir experimentalmente la degradacion de perplexidad entre Q2_K, Q4_K_S, Q6_K y Q8_0 en tareas de narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y los resultados de busqueda web recuperados no guardan relacion con el modelo (corresponden a consultas sobre la plataforma de comercio electronico SHEIN), por lo que no se pueden utilizar como fuente.

## Requisitos de hardware

- VRAM estimada para inferencia (peso del modelo; hay que sumar el cache KV, que no esta cuantificado en la informacion disponible):

| Cuantizacion | Tamano (GB) | Nota |
|---|---|---|
| Q2_K | 10,7 | dato exacto de la model card |
| Q3_K_S | ~11,5 | estimacion a partir del numero de parametros |
| Q3_K_M | ~12,5 | estimacion |
| Q3_K_L | ~13,5 | estimacion |
| IQ4_XS | ~14,0 | estimacion |
| Q4_K_S | 15,6 | dato exacto; marcado como "fast, recommended" |
| Q4_K_M | ~16,0 | estimacion |
| Q5_K_S | ~17,5 | estimacion |
| Q5_K_M | ~18,0 | estimacion |
| Q6_K | ~21,0 | estimacion |
| Q8_0 | ~27,0 | estimacion |
| x-f16 | ~50,0 | estimacion |
| mmproj-Q8_0 | 0,9 | suplemento multimodal |
| mmproj-f16 | 1,3 | suplemento multimodal |

- GPU recomendadas: para Q4_K_S (15,6 GB) basta una RTX 4090, RTX 3090 o RTX 4080 de 16-24 GB; para Q2_K (10,7 GB) es suficiente una GPU de 12 GB como la RTX 3060 de 12 GB o la RTX 4070. Para Q8_0 (~27 GB) se necesita una A100 de 40 GB, una RTX 5090 de 32 GB o dos GPU de 24 GB. Para x-f16 (~50 GB) hacen falta una A100 80GB, una H100 o varios aceleradores en paralelo.
- ¿Cabe en GPU de consumo? Si: Q2_K y Q3_K en tarjetas de 12-16 GB; Q4_K_S, Q4_K_M, Q5_K_S y Q5_K_M en tarjetas de 24 GB (RTX 3090, RTX 4090); Q6_K queda justo en 24 GB y probablemente exija offload parcial de capas a CPU.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python). El soporte de GGUF en vLLM existe pero es experimental; no hay confirmacion de compatibilidad con TGI en la informacion disponible. Los ficheros mmproj solo son utilizables en llama.cpp/llama-server y derivados compatibles.
- Latencia y throughput estimados: no disponibles. No se proporcionan mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna combinacion de hardware y cuantizacion.
- Nota sobre memoria: los ficheros de mas de 50 GB pueden requerir descarga en varias partes; el autor remite a los README de TheBloke para el procedimiento de concatenacion de ficheros multiparte.

## Comparativa con modelos similares

La informacion disponible no permite establecer una comparativa fiable con modelos de la misma categoria, ya que no se aportan datos de rendimiento, contexto ni arquitectura interna del modelo base ni de posibles alternativas.

| Modelo | Parametros | Formato | Licencia | Rendimiento | Observaciones |
|---|---|---|---|---|---|
| mradermacher/Solar-Griffin-26B-A4B-GGUF | ~25,2B (este repositorio, cuantizado) | GGUF | apache-2.0 | no disponible | 12 cuantizaciones + 2 ficheros mmproj; 0 descargas |
| Cyclone-Labs/Solar-Griffin-26B-A4B | ~25,2B | safetensors | apache-2.0 | no disponible | modelo base sin cuantizar, origen del merge |
| Alternativas de tamano y tarea similares | no disponible | no disponible | no disponible | no disponible | no se han identificado modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos: no hay informacion sobre los datos de entrenamiento del merge, por lo que no se puede evaluar que sesgos incorpora. Los merges de modelos de roleplay suelen heredar los sesgos de sus componentes originales, no documentados aqui.
- Riesgo de alucinacion: no cuantificado. Se trata de un merge orientado a roleplay y storytelling, tareas en las que la fidelidad factual no suele ser el objetivo, por lo que no es recomendable usarlo como fuente de informacion verificada.
- Idioma: solo se declara ingles. El uso en castellano no esta soportado oficialmente y la calidad seria impredecible.
- Longitud de contexto: no disponible, lo que impide garantizar el comportamiento en conversaciones largas o en tareas de resumen de documentos extensos.
- Licencia: Apache 2.0, lo que en principio permite uso comercial. No obstante, conviene verificar las licencias de los modelos originales que se fusionaron para crear el modelo base, dato que no se proporciona.
- Estado de adopcion: 0 descargas y 0 likes en el momento de la consulta, y publicacion el mismo dia de creacion y actualizacion. No hay validacion independiente de la calidad del merge ni de las cuantizaciones.
- Cuantizaciones de baja precision: Q2_K (10,7 GB) y los cuants Q3 implican perdida de calidad medible. El propio autor enlaza graficos de perplexidad (ikawrakow y Artefact2) que muestran el deterioro tipico de estos formatos.
- No hay cuants weighted/imatrix publicados por el autor, lo que limita las opciones de cuantizacion de mayor calidad respecto a otros repositorios.
- La tabla de ficheros del README solo detalla cuatro elementos (dos mmproj, Q2_K y Q4_K_S) pese a que la lista de cuantizaciones declarada incluye doce. Conviene comprobar el listado real de ficheros antes de asumir disponibilidad.
- Soporte de tool calling y de agentes no documentado: no debe asumirse que el modelo sea capaz de invocar funciones de forma fiable.
- Compatibilidad: el soporte de GGUF multimodal en herramientas distintas de llama.cpp es limitado; vLLM y TGI pueden no cargar estos ficheros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Solar-Griffin-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Solar-Griffin-26B-A4B
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Solar-Griffin-26B-A4B-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplexidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del patrocinador de la cuantizacion (nethype GmbH): https://www.nethype.de/

Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (consultan temas de la plataforma de comercio electronico SHEIN) y se han descartado por no ser fuentes relevantes. No se han encontrado papers, blogs tecnicos, repositorios ni demos adicionales asociados a este modelo.
