# mradermacher/haru-coder-8b-plan-full-GGUF

## Resumen

haru-coder-8b-plan-full-GGUF es la distribucion en formato GGUF del modelo Rowa68/haru-coder-8b-plan-full, un modelo de lenguaje orientado a tareas de codigo y planificacion. La publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que convierte modelos en safetensors a GGUF para su uso con llama.cpp y herramientas compatibles. El modelo original tiene 7.615.616.512 parametros (aproximadamente 7,6 mil millones), lo que lo situa en la categoria de modelos de 8B ejecutables en hardware de consumo.

El interes de esta publicacion es practico: ofrece el modelo base en once variantes de cuantizacion estatica (desde Q2_K hasta f16), con tamanos que van de 3,1 GB a 15,3 GB, lo que permite desplegarlo en GPUs consumer con VRAM limitada. La model card del repositorio no aporta informacion sobre arquitectura, datos de entrenamiento, contexto o benchmarks; se limita a listar los ficheros generados y a remitir al modelo base.

La relevancia actual reside en la accesibilidad: al estar disponible en GGUF, el modelo puede ejecutarse con llama.cpp, Ollama y otros runners ligeros sin necesidad de infraestructura de datacenter. No obstante, la ausencia de documentacion tecnica y de licencia explicita en la informacion disponible limita seriamente su evaluacion para entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de transformers; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no aplica (no se ha documentado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en formato transformers |
| Tamano del repositorio | 68,1 GB |
| Modelo base | Rowa68/haru-coder-8b-plan-full |
| Cuantizador | mradermacher |
| Descargas | 441 |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-11-01 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la documentacion disponible. Por el nombre y el tamano (7,6B parametros) y por el pipeline declarado (transformers), se trata presumiblemente de un transformer decoder-only de escala 8B, pero no hay confirmacion en la model card ni en los metadatos. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o instruccion tuning.

La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: mradermacher indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que en el momento de la publicacion no habia cuantizaciones ponderadas/imatrix disponibles. El autor senala que estas podrian no aparecer nunca y sugiere solicitarlas mediante una discusion en la comunidad. No se documentan innovaciones arquitectonicas como atencion lineal, decodificacion especulativa o mezcla de expertos.

## Capacidades

- Generacion de texto en ingles, con orientacion declarada a tareas de codigo y planificacion segun el nombre del modelo.
- Conversacion multi-turno: la etiqueta `conversational` en los metadatos sugiere soporte de dialogos, aunque no se detalla el formato de prompt.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face.
- Ejecucion local mediante llama.cpp y derivados, gracias al formato GGUF.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible (no documentado).

## Casos de uso

- Asistencia de codigo en local: con la cuantizacion Q4_K_M (4,8 GB) el modelo cabe en GPUs consumer de 8 GB, lo que permite integrarlo en editores o CLI de desarrollo sin conexion a la nube.
- Prototipado de agentes de planificacion: el sufijo "plan" del nombre sugiere entrenamiento orientado a descomposicion de tareas; puede usarse para generar planes paso a paso en pipelines de automatizacion, siempre que se valide su comportamiento empíricamente.
- Servicio de chat en ingles con llama.cpp: el formato GGUF y la etiqueta conversacional permiten montar un endpoint de conversacion ligero en una sola GPU.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes, lo que facilita medir el impacto de la cuantizacion en calidad y velocidad sobre el mismo modelo.
- Despliegue en entornos con VRAM restringida: las variantes Q2_K (3,1 GB) y Q3_K_S (3,6 GB) permiten ejecutar el modelo en GPUs de 4-6 GB o incluso en CPU, a costa de perdida de calidad.
- Integracion en herramientas de Inference Endpoints: la etiqueta `endpoints_compatible` permite desplegarlo como servicio gestionado si se dispone de acceso a dicha infraestructura.
- Experimentacion academica: util como baseline de 8B cuantizado para estudios de eficiencia, aunque la falta de documentacion limita su uso como referencia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del fichero GGUF mas overhead de contexto):
  - Q2_K: ~3,5-4 GB
  - Q3_K_S: ~4-4,5 GB
  - Q4_K_M: ~5,5-6 GB
  - Q5_K_M: ~6,5-7 GB
  - Q6_K: ~7,5-8 GB
  - Q8_0: ~9-10 GB
  - f16: ~16-17 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100/H100 solo si se busca throughput alto o f16.
- Cabe en GPU consumer: si, desde una GTX 1660 6 GB o RTX 3050 8 GB con Q4_K_S/Q4_K_M; las variantes Q2_K y Q3_K_S caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, LM Studio, y cualquier runner compatible con GGUF. Tambien es compatible con Inference Endpoints segun los metadatos.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales. Se comparan con alternativas de tamano similar en formato GGUF ampliamente documentadas.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Documentacion tecnica |
|---|---|---|---|---|---|
| haru-coder-8b-plan-full-GGUF | 7,6B | no disponible | no disponible | si (12 variantes) | muy escasa |
| Meta Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | si | extensa |
| Qwen2.5-Coder 7B Instruct | 7,6B | 32K (128K en variantes) | Apache 2.0 | si | extensa |
| Mistral 7B Instruct v0.3 | 7,2B | 32K | Apache 2.0 | si | extensa |

La comparativa con Llama 3.1 8B, Qwen2.5-Coder 7B y Mistral 7B se basa en datos publicos de esos modelos; no se dispone de resultados del modelo evaluado para establecer una comparacion de calidad.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan arquitectura, datos de entrenamiento, contexto ni alineacion, lo que impide evaluar sesgos y robustez.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; desaconsejado en produccion hasta verificar la licencia del modelo base Rowa68/haru-coder-8b-plan-full.
- Solo ingles: los metadatos declaran unicamente el idioma `en`; el rendimiento en castellano es incierto.
- Riesgo de alucinacion: sin datos de evaluacion ni de alineacion, no hay garantias sobre la fiabilidad factual del modelo.
- Cuantizaciones estaticas sin imatrix: el autor advierte de que las cuantizaciones ponderadas no estan disponibles, lo que puede implicar mayor perdida de calidad en las variantes de baja precision (Q2_K, Q3_K_M).
- Baja adopcion: 441 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Procedencia incierta: el modelo base Rowa68/haru-coder-8b-plan-full no cuenta con documentacion publica en la informacion disponible; se desconoce su origen y metodo de entrenamiento.
- El repositorio ocupa 68,1 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/haru-coder-8b-plan-full-GGUF
- Modelo base: https://huggingface.co/Rowa68/haru-coder-8b-plan-full
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#haru-coder-8b-plan-full-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
