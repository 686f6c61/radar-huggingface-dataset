# mradermacher/AOS-Chief-of-Staff-v1.0-GGUF

## Resumen

AOS-Chief-of-Staff-v1.0-GGUF es la versión cuantizada en formato GGUF del modelo ArmadaOS/AOS-Chief-of-Staff-v1.0, publicada por mradermacher, un autor habitual de conversiones GGUF en HuggingFace. El modelo original es un ajuste fino (SFT seguido de DPO según los tags del autor) orientado a tareas de agente y de "chief of staff": coordinación de tareas, planificación y asistencia ejecutiva en flujos conversacionales. Los tags del repositorio apuntan a la familia Qwen 3.5 como base, aunque la model card del cuantizador no detalla la arquitectura ni el proceso de entrenamiento.

El modelo cuenta con 8.953.803.264 parámetros según los pesos en safetensors del repositorio base, lo que lo sitúa en la franja de 9B, manejable en GPUs de consumo con cuantizaciones de 4 y 5 bits. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y declara únicamente inglés como idioma soportado. No se han publicado especificaciones de longitud de contexto, datos de entrenamiento ni resultados de benchmarks en la información disponible.

La relevancia de esta ficha es práctica: mradermacher ofrece hasta doce cuantizaciones estáticas (desde Q2_K de 3,9 GB hasta f16 de 18,0 GB) más una serie con importance matrix en un repositorio aparte, lo que permite desplegar el modelo en llama.cpp, Ollama o LM Studio sin necesidad de infraestructura GPU de datacenter. El repositorio completo ocupa 81,4 GB debido a la suma de todos los ficheros de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del autor indican familia qwen3_5; no se detalla en la model card) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; adicionalmente cuantizaciones ponderadas/imatrix en el repositorio i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura en la model card del cuantizador. Los tags del repositorio (`qwen3_5`, `fine-tuned`, `sft`, `dpo`) sugieren que el modelo base ArmadaOS/AOS-Chief-of-Staff-v1.0 deriva de la familia Qwen 3.5 y que fue afinado en dos etapas: un ajuste supervisado (SFT) seguido de optimizacion por preferencias con DPO. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas adicionales como RLHF con recompensa aprendida, destilacion o decodificacion especulativa.

La contribucion tecnica de este repositorio concreto es la cuantizacion: mradermacher genera cuantizaciones estaticas con `convert_type: hf` y `output_tensor_quantised: 1` a partir de los pesos en formato HuggingFace. El autor mantiene ademas una version con importance matrix (i1-GGUF), que suele ofrecer mejor relacion calidad/tamano en bits bajos que las cuantizaciones K estándar. La model card incluye la nota `skip_mmproj: 1`, lo que sugiere que el modelo base no incorpora proyector multimodal o que este se omite en la conversion.

## Capacidades

- Generacion de texto conversacional multi-turno: el tag `conversational` indica que el modelo esta preparado para dialogos encadenados.
- Comportamiento orientado a agente: los tags `agent` y `chief-of-staff` describen el objetivo del ajuste fino, orientado a coordinacion de tareas y asistencia ejecutiva.
- Ajuste por preferencias: el entrenamiento declarado incluye DPO, lo que en principio alinea las respuestas con preferencias humanas, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Uso como modelo de razonamiento multi-paso y orquestacion: no confirmado por evaluaciones publicadas; es una inferencia a partir de los tags del autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el flag `skip_mmproj` sugiere ausencia de proyector multimodal.
- Capacidades multilingues: limitadas a ingles segun el campo `language` de la model card.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia ejecutiva y gestion de agenda: el ajuste esta orientado explicitamente al rol de "chief of staff", por lo que encaja en flujos de priorizacion de tareas, resumen de correos y preparacion de reuniones en ingles, con el modelo ejecutandose en local.
- Orquestacion de agentes en local: al distribuirse en GGUF y con licencia Apache 2.0, puede integrarse como planificador en frameworks de agentes (LangChain, LlamaIndex, AutoGen) dentro de infraestructura propia, sin enviar datos a APIs externas.
- Procesamiento de documentacion confidencial: con cuantizaciones Q4_K_M de 5,7 GB puede ejecutarse en una GPU de consumo o incluso en CPU, lo que permite tratar contratos o informes internos sin salida de datos de la organizacion.
- Prototipado rapido de asistentes conversacionales en ingles: la disponibilidad de doce cuantizaciones permite ajustar el compromiso calidad/memoria segun el hardware disponible en cada fase de desarrollo.
- Despliegue en entornos con recursos limitados: la version Q2_K de 3,9 GB cabe en GPUs de 6-8 GB o en portatiles con CPU y RAM suficiente, util para demos y pruebas de concepto.
- Evaluacion comparativa de ajustes finos: util como referencia para comparar el efecto de SFT + DPO frente al modelo base Qwen 3.5 en tareas de planificacion, siempre que se construya un conjunto de evaluacion propio, ya que el autor no publica benchmarks.
- Generacion de resumentes y actas de reunion en ingles: tarea alineada con el perfil de asistente ejecutivo, ejecutable en local con latencia aceptable en GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de agente, y tampoco se han encontrado resultados en la busqueda web realizada. Cualquier cifra de rendimiento para este modelo requeriria una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia, segun los tamanos de fichero publicados y anadiendo margen para cache KV y contexto:
  - Q2_K (3,9 GB): aproximadamente 5-6 GB de VRAM.
  - Q3_K_M (4,7 GB): aproximadamente 6-7 GB de VRAM.
  - IQ4_XS (5,3 GB) y Q4_K_S (5,5 GB): aproximadamente 7-8 GB de VRAM.
  - Q4_K_M (5,7 GB): aproximadamente 7-8 GB de VRAM.
  - Q5_K_M (6,6 GB): aproximadamente 8-9 GB de VRAM.
  - Q6_K (7,5 GB): aproximadamente 9-10 GB de VRAM.
  - Q8_0 (9,6 GB): aproximadamente 11-12 GB de VRAM.
  - f16 (18,0 GB): aproximadamente 20-22 GB de VRAM, dependiendo de la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 24 GB para cuantizaciones altas o f16; A100 40/80 GB y H100 para servir en produccion con lotes grandes y contexto largo.
- Cabe en GPU de consumo: si. Con Q4_K_M (5,7 GB) funciona en tarjetas de 8 GB; con Q8_0 (9,6 GB) requiere 12 GB o mas; f16 necesita 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y servidores compatibles con GGUF. Para vLLM o TGI conviene partir del modelo base en safetensors, ya que el soporte de GGUF en esos motores es mas limitado. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia gestionados.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de contexto ni de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, licencia y disponibilidad. Las especificaciones de los modelos alternativos provienen de sus f ichas publicas.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| AOS-Chief-of-Staff-v1.0 (este) | 8,95B | no disponible | Apache 2.0 | Si (12 cuantizaciones + i1) | Ajuste SFT + DPO orientado a agente/chief of staff, solo ingles |
| Qwen3-8B | ~8,2B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | Si | Modelo base de referencia de la misma familia; capacidades multilingues |
| Llama 3.1 8B Instruct | ~8,03B | 128.000 tokens | Llama 3.1 Community License | Si | Multilingue, requiere aceptar la licencia de Meta para uso comercial |
| Gemma 2 9B Instruct | ~9,24B | 8.192 tokens | Gemma Terms of Use | Si | Contexto mas corto; licencia con restricciones de uso aceptable |

La ventaja diferencial de este modelo frente a las alternativas genericas es su especializacion declarada en tareas de coordinacion y agente, junto con una licencia Apache 2.0 sin clausulas de uso aceptable. La desventaja es la ausencia total de evaluaciones publicadas y el soporte exclusivo de ingles.

## Limitaciones y advertencias

- Ausencia de evaluaciones: no hay benchmarks publicados ni resultados de evaluaciones de agente, por lo que el rendimiento real en tareas de planificacion o tool calling es desconocido.
- Riesgo de alucinacion: inherente a los modelos de 9B con ajuste por preferencias; no se ha publicado ninguna medicion de tasa de alucinacion ni de calibracion.
- Sesgos: no se documenta la composicion del dataset de SFT ni del par de preferencias usado en DPO, por lo que no es posible evaluar sesgos de genero, raza o ideologicos.
- Idioma: solo ingles declarado. El rendimiento en castellano no esta garantizado y probablemente sea degradado.
- Contexto desconocido: al no publicarse la longitud de contexto, el dimensionamiento de la cache KV y de la VRAM necesaria para conversaciones largas debe validarse experimentalmente.
- Trazabilidad del ajuste: la model card del cuantizador no incluye informacion sobre el proceso de entrenamiento del modelo base; para detalles habria que consultar el repositorio ArmadaOS/AOS-Chief-of-Staff-v1.0, que no aporta datos tecnicos en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, conviene verificar que el modelo base Qwen 3.5 no imponga condiciones adicionales que el autor no haya documentado.
- Naturaleza del repositorio: este repositorio es una conversion de terceros, no una publicacion oficial del autor del modelo. Los ficheros GGUF pueden diferir del original en comportamiento numerico, especialmente en cuantizaciones de 2 y 3 bits marcadas como "lower quality".
- Fecha de publicacion futura respecto a la mayoria de referencias disponibles: creado el 2026-03-29 y actualizado el 2026-10-18, sin descargas ni likes registrados en el momento de la consulta.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/mradermacher/AOS-Chief-of-Staff-v1.0-GGUF
- Modelo base: https://huggingface.co/ArmadaOS/AOS-Chief-of-Staff-v1.0
- Cuantizaciones con importance matrix (i1-GGUF): https://huggingface.co/mradermacher/AOS-Chief-of-Staff-v1.0-i1-GGUF
- Pagina de descargas del cuantizador para este modelo: https://hf.tst.eu/model#AOS-Chief-of-Staff-v1.0-GGUF
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/ArmadaOS/AOS-Chief-of-Staff-v1.0
- Listado de cuantizaciones del modelo base en HuggingFace: https://huggingface.co/models?other=base_model:quantized:ArmadaOS/AOS-Chief-of-Staff-v1.0
- Guia de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Mirror SHA256 del fichero Q3_K_S: https://civarchive.com/sha256/d2aaa7e76ec1f735f7e08c958af8910e588a84c5662d8d9421cb731c4661a0c8
