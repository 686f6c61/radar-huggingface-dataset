# mradermacher/Qwen3.8-27B-Moxie-GGUF

## Resumen

Qwen3.8-27B-Moxie-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3.8-27B-Moxie, un modelo de lenguaje multimodal de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado originalmente por el usuario mijoko y publicado bajo licencia Apache 2.0. Esta variante ha sido generada por mradermacher, un conocido creador de cuantizaciones GGUF en el ecosistema de Hugging Face, y su propósito es facilitar la ejecución del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo se presenta como un transformer multimodal con capacidades de visión y lenguaje (vision-language), orientado a tareas agénticas, conversacionales, escritura creativa y roleplay. Los tags de la model card indican soporte para inglés, chino y alemán, y la inclusión de un fichero mmproj confirma la presencia de un proyector multimodal para procesamiento de imágenes. La nomenclatura "Qwen3.8" y "Qwen3.6" sugiere una base derivada de la familia Qwen, aunque no se dispone de documentación oficial que confirme la arquitectura exacta ni el proceso de entrenamiento.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores evaluar rápidamente la viabilidad de desplegar un modelo de 27B multimodal en entornos locales. El repositorio ofrece un espectro amplio de cuantizaciones, desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), lo que posibilita desde despliegues en GPUs de gama alta de consumo hasta ejecuciones en configuraciones más modestas con pérdida de calidad controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), detalles exactos no disponibles |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh, de (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base mijoko/Qwen3.8-27B-Moxie. Los tags y la presencia de un fichero mmproj indican que se trata de un modelo multimodal con capacidad de procesamiento de vision, probablemente construido sobre una base de la familia Qwen con un proyector visual adicional. El tamano de 27,3 mil millones de parametros lo situa en la categoria de modelos densos de gran tamano, aunque no se confirma si emplea atencion lineal, decodificacion especulativa u otras innovaciones.

Respecto al entrenamiento, no se han publicado en la informacion disponible datos sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. Los tags "agentic", "conversational", "creative-writing" y "roleplay" sugieren un ajuste orientado a interaccion conversacional y tareas agenticas, pero se trata de etiquetas declarativas sin respaldo documental en la model card. La cuantizacion ha sido realizada por mradermacher con la herramienta de conversion de Hugging Face a GGUF, generando cuantizaciones estaticas (no imatrix en este repositorio; las versiones ponderadas estan en un repositorio separado).

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis declarado en escritura creativa y roleplay.
- Procesamiento de vision e imagenes mediante el proyector multimodal (ficheros mmproj-Q8_0 y mmproj-f16).
- Capacidades agenticas y razonamiento multi-paso, segun los tags del modelo.
- Soporte multilingue para ingles, chino y aleman.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- No se dispone de informacion explicita sobre soporte de tool calling o function calling en la documentacion proporcionada.
- No se dispone de informacion sobre modo de razonamiento explicito (thinking mode) ni capacidades de audio.

## Casos de uso

- Roleplay y escritura creativa: el modelo esta etiquetado especificamente para estas tareas, por lo que puede emplearse en aplicaciones de narrativa interactiva, generacion de dialogos de personajes y asistencia literaria, aprovechando su ajuste conversacional.
- Asistencia multimodal en local: gracias al proyector mmproj, puede procesar imagenes junto con texto para tareas de descripcion, analisis de capturas o respuesta a preguntas visuales, desplegado con llama.cpp en una estacion de trabajo con GPU.
- Agentes autonomos de escritorio: el tag "agentic" sugiere uso en pipelines de razonamiento multi-paso; con 27B de parametros y cuantizacion Q4_K_M (16,9 GB) puede ejecutarse en una RTX 4090 para tareas de automatizacion local.
- Prototipado de chatbots multilingues: con soporte para ingles, chino y aleman, es adecuado para demostraciones de atencion al cliente en estos idiomas antes de escalar a infraestructura mayor.
- Evaluacion de modelos multimodales en investigacion: la disponibilidad de 11 cuantizaciones distintas permite estudiar el impacto de la cuantizacion en la calidad de las respuestas multimodales, comparando Q8_0 con Q2_K sobre el mismo modelo base.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (11,0 GB) y Q3_K_S (12,4 GB) permiten ejecutar el modelo en GPUs de 12-16 GB de VRAM, habilitando experimentacion con un modelo de 27B en hardware de consumo.
- Generacion de contenido asistida por imagen: combinando el proyector visual con la capacidad de escritura creativa, puede emplearse para generar descripciones narrativas de imagenes o guiones a partir de referencias visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K 11,0 GB; Q3_K_S 12,4 GB; Q3_K_M 13,6 GB; Q3_K_L 14,7 GB; IQ4_XS 15,5 GB; Q4_K_S 15,9 GB; Q4_K_M 16,9 GB; Q5_K_S 19,1 GB; Q5_K_M 19,6 GB; Q6_K 22,5 GB; Q8_0 29,1 GB. A estas cifras hay que sumar el proyector multimodal (0,7 GB para mmproj-Q8_0 o 1,0 GB para mmproj-f16) y el espacio para el contexto KV cache.
- GPU recomendadas: para Q8_0 se recomienda una A100 40GB, H100 o RTX 4090 24GB (con riesgo de ajuste); para Q4_K_M una RTX 4090 24GB o RTX 3090 24GB; para Q2_K y Q3_K_S GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con cuantizaciones hasta Q6_K; en GPUs de 16 GB con Q4_K_S o inferiores; en GPUs de 12 GB con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con la API de OpenAI (tag "endpoints_compatible"). No se confirma soporte en vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. Se indica "no disponible" para los campos de rendimiento. A modo orientativo estructural, el modelo se situa en la franja de 27B multimodal con licencia Apache 2.0, pero sin datos verificables de contexto, rendimiento o arquitectura no es posible establecer una comparativa fundamentada con otros modelos de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| Qwen3.8-27B-Moxie-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo base ni sobre su proceso de alineacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran tamano; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- La longitud de contexto no esta documentada, lo que impide garantizar el comportamiento en conversaciones largas o documentos extensos.
- El soporte de idiomas se limita declarativamente a ingles, chino y aleman; el rendimiento en castellano no esta verificado y podria ser deficiente.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una cuantizacion de un modelo base de procedencia no verificada, se recomienda auditar el modelo original antes de usos en produccion.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad, especialmente en tareas multimodales y de razonamiento.
- El repositorio tiene un tamano de 190,8 GB, lo que implica descargas parciales segun la cuantizacion elegida; no debe descargarse el repositorio completo de forma indiscriminada.
- No hay informacion sobre la calidad del ajuste conversacional ni sobre posibles comportamientos indeseados en roleplay.
- El modelo fue creado en agosto de 2026 y actualizado en octubre de 2026; la falta de likes y el bajo numero de descargas (386) sugieren poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Moxie-GGUF
- Modelo base: https://huggingface.co/mijoko/Qwen3.8-27B-Moxie
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Moxie-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Moxie-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa patrocinadora: https://www.nethype.de/
