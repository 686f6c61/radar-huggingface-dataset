# 0xEstro/Xendra-dynamic

## Resumen

Xendra-dynamic es un modelo de lenguaje publicado en Hugging Face por el usuario 0xEstro (Joy Wikins, segun su perfil publico) bajo el identificador `0xEstro/Xendra-dynamic`. El repositorio contiene 27.781.427.952 parametros reales (aproximadamente 27,8 mil millones) almacenados en formato safetensors con metadatos de compressed-tensors, y ocupa 31,3 GB. La etiqueta `qwen3_5` sugiere un linaje o arquitectura basada en la familia Qwen3.5, aunque esta circunstancia no esta confirmada por ninguna documentacion oficial.

El modelo no dispone de model card, no declara licencia, no especifica idiomas ni pipeline, y no publica resultados de benchmarks. En el momento de redactar esta ficha acumula 12 descargas y 0 likes, sin validacion visible por parte de la comunidad. Las fechas de creacion y actualizacion que figuran en el repositorio (18 de octubre de 2026) son anomalas y conviene verificarlas antes de cualquier uso en produccion.

Su relevancia actual es limitada y fundamentalmente experimental: resulta interesante como posible ejemplo de publicacion de pesos cuantizados con compressed-tensors sobre una base de ~28B, pero la ausencia total de documentacion impide recomendarlo para entornos productivos sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3_5` apunta a la familia Qwen3.5, sin confirmar) |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 mil millones) |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio incluye metadatos `compressed-tensors` y 31,3 GB de pesos, un tamano coherente con cuantizacion de 8 bits (FP8/INT8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con metadatos compressed-tensors |
| Tamano del repositorio | 31,3 GB |
| Descargas / likes | 12 / 0 |
| Fecha de publicacion | 2026-10-18 (creado), 2026-10-18 (actualizado) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens utilizados, la composicion del dataset ni la aplicacion de tecnicas de alineacion como RLHF, DPO o RL con verificadores. La unica senal disponible es la etiqueta `qwen3_5`, que sugiere una base derivada de la familia Qwen3.5, y la presencia de metadatos `compressed-tensors`, un formato de cuantizacion empleado habitualmente por herramientas como vLLM y llm-compressor para servir pesos cuantizados de forma eficiente.

El tamano del repositorio (31,3 GB) frente al numero de parametros (27,78 mil millones) implica aproximadamente 1,13 bytes por parametro, lo que es consistente con pesos cuantizados a 8 bits mas ficheros auxiliares. No se puede confirmar si se trata de FP8, INT8 o una combinacion por capas, ni si existe una version en precision completa (bf16) en otro repositorio del mismo autor. Tampoco se documentan innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Generacion de texto: no confirmada documentalmente; la etiqueta `qwen3_5` permitiria inferir capacidades propias de la familia Qwen, pero no hay model card que lo verifique.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades multimodales (vision, audio): no disponible; las etiquetas del repositorio no incluyen componentes de vision.
- Modo de razonamiento explicito (thinking): no disponible.
- Cuantizacion integrada: el repositorio se distribuye en formato compressed-tensors, lo que facilita su carga directa en motores de inferencia compatibles.

## Casos de uso

- Inferencia autoalojada en infraestructura propia: con 27,8 mil millones de parametros y pesos de 31,3 GB, el modelo encaja en una GPU de 40-80 GB o en dos GPU de 24 GB con paralelismo tensorial, lo que permite desplegarlo en entornos con requisitos de soberania del dato sin depender de APIs externas.
- Evaluacion de tecnicas de compresion y cuantizacion: el uso de compressed-tensors lo convierte en un candidato util para comparar calidad y rendimiento entre precisiones FP8 e INT8 dentro de pipelines de investigacion sobre cuantizacion.
- Fine-tuning con LoRA o QLoRA: al ser un modelo de ~28B, permite adaptaciones con adaptadores de bajo rango sobre una o dos GPU de 80 GB, util para ajustar dominios verticales sin reentrenar el modelo completo.
- Prototipado de asistentes conversacionales multi-turno: utilizable en fases de prueba de concepto para validar latencia y calidad antes de migrar a un modelo con licencia y documentacion verificadas.
- Servicio de API compatible con OpenAI: desplegado con vLLM o SGLang, puede exponerse como endpoint interno para experimentacion de equipos de desarrollo, siempre que se resuelva previamente la ambiguedad de licencia.
- Reproduccion de experimentos y auditoria de modelos publicados sin model card: sirve como caso de estudio sobre trazabilidad y procedencia en la publicacion de pesos en Hugging Face.
- Generacion de codigo o textos tecnicos: solo recomendable tras verificar empiricamente las capacidades, dado que no existe documentacion que las respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos del repositorio: aproximadamente 31,3 GB, correspondientes a los ficheros safetensors con cuantizacion de 8 bits.
- VRAM estimada en bf16 (si se obtuvieran pesos sin cuantizar): en torno a 55,6 GB solo para los pesos, mas cache KV y overhead del motor de inferencia.
- VRAM estimada en INT4 (si se generara una cuantizacion de 4 bits): alrededor de 14-16 GB, lo que permitiria ejecucion en una GPU de consumo de 24 GB.
- GPU profesionales recomendadas: H100 80 GB o A100 80 GB para los pesos del repositorio con margen amplio de contexto y batch; A100 40 GB resulta ajustada y dependera de la longitud de contexto efectiva y del tamano de batch.
- Multi-GPU: dos RTX 4090 de 24 GB (48 GB agregados) podrian alojar los pesos con paralelismo tensorial, con limitaciones de ancho de banda entre GPU.
- GPU de consumo: una unica RTX 4090 de 24 GB no es suficiente para los pesos de 8 bits publicados; requeriria una cuantizacion INT4 adicional.
- Opciones de despliegue: vLLM y SGLang son las opciones mas directas por su soporte de compressed-tensors; TGI es posible si el formato es compatible. llama.cpp y Ollama no son utilizables sin una conversion previa a GGUF, que no esta incluida en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Documentacion |
|---|---|---|---|---|---|
| Xendra-dynamic (0xEstro) | 27,78 mil millones | no disponible | no disponible | Hugging Face, 12 descargas | sin model card |
| Qwen2.5-32B-Instruct | 32,5 mil millones | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | Hugging Face, ampliamente desplegado | model card completa y benchmarks publicados |
| Gemma 2 27B | 27 mil millones | 8.192 tokens | Terminos de uso de Gemma | Hugging Face y Vertex AI | model card completa y benchmarks publicados |
| Mistral Small 24B | 24 mil millones | 32.000 tokens | Apache 2.0 | Hugging Face y API de Mistral | model card completa y benchmarks publicados |

Los datos de los modelos comparativos corresponden a informacion publica de referencia y pueden variar segun la version consultada. Para Xendra-dynamic no es posible establecer una comparacion de rendimiento al no existir benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan arquitectura, datos de entrenamiento, capacidades ni limitaciones, lo que impide evaluar el modelo de forma informada.
- Licencia no declarada: sin licencia explicita, el uso comercial se encuentra en una situacion de incertidumbre legal; en la practica equivale a reserva de derechos por defecto en muchas jurisdicciones.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento ni el proceso de alineacion, no es posible caracterizar sesgos de genero, raza, idioma o ideologia.
- Riesgo de alucinacion: no cuantificado; no existen evaluaciones publicadas de veracidad ni de tasas de hallucination.
- Idiomas no especificados: se desconoce si el modelo esta alineado para castellano o si su rendimiento fuera del ingles es deficiente.
- Longitud de contexto desconocida: impide planificar casos de uso que dependan de ventanas largas.
- Procedencia dudosa: las fechas del repositorio (2026-10-18) son anomalas, y el autor presenta otros modelos sin model card, como `0xEstro/Nemo`, lo que sugiere un patron de publicaciones sin documentar.
- Validacion nula por la comunidad: 12 descargas y 0 likes no permiten inferir calidad ni estabilidad.
- Las busquadas web sobre el termino "Xendra" devuelven una empresa de software de cadena de suministro industrial ajena a este modelo; no debe confundirse ni asumirse vinculo alguno.
- No apto para produccion sin una evaluacion propia: se recomienda auditar los pesos, verificar la procedencia y realizar pruebas de calidad antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xEstro/Xendra-dynamic
- Perfil del autor: https://huggingface.co/0xEstro
- Otro modelo del mismo autor, sin model card: https://huggingface.co/0xEstro/Nemo
- XENDRA (empresa de cadena de suministro industrial, sin relacion conocida con el modelo): https://xendra.ai/freight-control/
- Aplicacion de XENDRA (sin relacion conocida con el modelo): https://app.xendra.ai/
- Documentacion de compressed-tensors (formato presente en el repositorio): no disponible en la informacion proporcionada.
