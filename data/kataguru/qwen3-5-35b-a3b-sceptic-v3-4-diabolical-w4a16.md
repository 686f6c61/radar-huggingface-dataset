# kataguru/Qwen3.5-35B-A3B-Sceptic-v3.4-Diabolical-W4A16

## Resumen

Kataguru Qwen3.5-35B-A3B Sceptic v3.4 Diabolical W4A16 es un ajuste fino del modelo Qwen3.5-35B-A3B de Alibaba Cloud (Qwen Team), publicado por el usuario kataguru. Se trata de un transformer decoder-only con arquitectura dispersa de mezcla de expertos (MoE): 35.951.822.704 parametros totales y aproximadamente 3.000 millones activos por token, con una ventana de contexto nativa de 262.144 tokens y soporte multimodal de vision heredado del base (Qwen3VL). El modelo se distribuye ya cuantizado en formato AWQ W4A16 mediante compressed-tensors, orientado a despliegue directo en vLLM.

El ajuste se centra en tres ejes: calidad del fines en tareas morfologicas complejas (abesivo, comitativo, instructivo) y terminologia tecnica, cientifica y juridica; razonamiento matematico y veracidad mediante las rondas internas que el autor denomina JEV Truth, Ornith Math y Diabolical Code Immunity Round 2 y 3; y eliminacion de rechazos de contenido (zero refusal), incluyendo el modo de pensamiento interno (<think>), que segun el autor no aplica auditoria de censura.

Su relevancia practica esta en que es una de las pocas alternativas de pesos abiertos con soporte de fines nativo, vision/OCR en fines y contexto de 262k, empaquetada en un formato que cabe en dos GPU de consumo (RTX 3090, 4090 o 5090, con tensor parallel 2). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado validacion externa de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts disperso (MoE) y vision encoder nativo (base Qwen3.5-35B-A3B / Qwen3VL) |
| Parametros totales | 35.951.822.704 (aprox. 35,95 B) |
| Parametros activos | Aproximadamente 3 B por token |
| Longitud de contexto | 262.144 tokens (262k) nativo |
| Tipos de cuantizacion | AWQ W4A16 sobre compressed-tensors (Marlin WNA16 MoE); el autor publica una variante GGUF APEX aparte |
| Idiomas soportados | Fines (fi), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (6 shards, 24,33 GiB) con cuantizacion compressed-tensors; repositorio de 26,2 GB |

## Arquitectura y entrenamiento

La base es Qwen3.5-35B-A3B, un MoE disperso de 35.000 millones de parametros con unos 3.000 millones activos por token. Sobre esa base, kataguru aplica un ajuste fino en fases que el propio autor nombra como Sceptic v3.4, combinando JEV Truth (veracidad), Ornith Math (matematicas) y Diabolical Code Immunity Round 2 y 3 (robustez en codigo y en peticiones adversarias concurrentes). La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos no estan disponibles.

El modelo conserva el soporte nativo de Multi-Token Prediction (MTP) con k=3 tokens especulativos por paso, lo que el autor situa en una tasa de aceptacion del draft del 78,6 %, y mantiene activa la torre de vision de Qwen3VL para OCR, VQA y analisis documental en fines. La distribucion se realiza en formato AWQ W4A16 con compressed-tensors, con KV-cache en FP8, prefill troceado y CUDAGraphs. El autor indica que la cuantizacion fue validada en 2x NVIDIA RTX 5090 (Blackwell, 32 GB) con tensor parallel 2, vLLM v0.29.0 y CUDA 12.9.

## Capacidades

- Generacion de texto conversacional y de formato largo, con modo de razonamiento explicito (<think>) y parser de razonamiento qwen3 en vLLM.
- Razonamiento matematico con cadena de pensamiento, con mejora declarada de 82,4 % a 88,1 % en GSM8K respecto al base.
- Generacion y analisis de codigo, con foco declarado en robustez frente a entradas adversarias (Diabolical Code Immunity Round 2 y 3).
- Vision y OCR nativos: reconocimiento de texto en imagenes, respuesta visual a preguntas y analisis de documentos, con limite de 10 imagenes por prompt en la configuracion de vLLM indicada.
- Multilingue limitado a fines e ingles, con enfasis declarado en morfologia finesa avanzada (abesivo, comitativo, instructivo) y en lexico cientifico, tecnico y juridico.
- Decodificacion especulativa MTP nativa con k=3 tokens por paso.
- Comportamiento sin rechazos (zero refusal) en ficcion, erotica e investigacion, incluido el canal de pensamiento interno.
- Tool calling y function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso con uso de herramientas: no documentadas en la informacion disponible.
- Soporte de audio: no disponible.

## Casos de uso

- Atencion al cliente en fines: el modelo puede mantener conversaciones multi-turno con hasta 262k tokens de contexto, lo que permite arrastrar el historial completo de un cliente y su documentacion asociada sin truncar, con calidad morfologica finesa verificada por el autor al 100 % en su prueba de abesivo/comitativo.
- OCR y digitalizacion de documentos finlandeses: con la torre de vision activa y el limite de 10 imagenes por prompt, se puede construir un pipeline de extraccion de texto de facturas, formularios y contratos escaneados, seguido de resumen o extraccion estructurada en el mismo modelo.
- Generacion de codigo en produccion: al ser un MoE de solo ~3B activos con cuantizacion W4A16, ofrece coste de inferencia bajo por token, adecuado para autocompletado y revision de codigo en pipelines de CI/CD donde el coste por llamada importa.
- Redaccion y analisis de textos juridicos y administrativos en fines: el ajuste enfatiza terminologia legislativa precisa, lo que lo hace util para resumir normativa, redactar borradores contractuales o responder consultas sobre documentacion publica finesa.
- Traduccion fi-en y en-fi asistida: aunque el modelo solo declara fines e ingles, su calidad en fines permite usarlo como motor de traduccion tecnica entre ambos idiomas en documentacion cientifica o manuales.
- Investigacion y redaccion creativa sin restricciones: el comportamiento zero refusal permite usarlo en generacion de ficcion, guiones o contenido erotico sin rechazos ni avisos moralizantes, algo relevante para proyectos editoriales que no pueden asumir bloqueos del modelo.
- Asistencia matematica y tutoria tecnica en fines: con GSM8K al 88,1 % autodeclarado y modo de razonamiento visible, es utilizable como tutor que muestra el desarrollo del calculo en fines.
- Procesamiento de datos sinteticos a gran escala: el MTP k=3 con 78,6 % de aceptacion y los 268 tok/s declarados en TP=2 lo hacen viable para generar corpus sinteticos en fines a coste controlado.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor del modelo, medidos en hardware identico (2x NVIDIA RTX 5090 Blackwell, TP=2, W4A16, KV-cache FP8, CUDAGraphs activados). No hay verificacion independiente disponible.

| Benchmark | Qwen 3.5 35B Base | Sceptic v3.0 | Sceptic v3.3 | Sceptic v3.4 (este modelo) |
|---|---|---|---|---|
| GSM8K (matematicas CoT) | 82,4 % | 86,8 % | 87,2 % | 88,1 % |
| TruthfulQA (veracidad) | 61,2 % | 74,5 % | 76,8 % | 78,4 % |
| Diabolical Concurrency (rondas 2 y 3) | 28,0 % | 65,0 % | 90,0 % | 95,0 % |
| Morfologia finesa (abesivo/comitativo) | 71,0 % | 94,0 % | 98,0 % | 100,0 % |
| Tasa de rechazo en erotica/ficcion | ~45,0 % | 12,0 % | 8,0 % | 0,00 % (zero refusal) |
| Aceptacion de especulacion MTP | no disponible | 74,2 % | 76,5 % | 78,6 % |
| Rendimiento vLLM TP=2 (tok/s) | 210 tok/s | 258 tok/s | 265 tok/s | 268 tok/s |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 13,9 GiB por GPU en configuracion TP=2 con vLLM, segun el autor. Los pesos ocupan 24,33 GiB en 6 shards safetensors.
- Configuracion minima indicada por el autor: dos GPU de al menos 16 GB en tensor parallel 2, o una unica GPU de 24-32 GB.
- Hardware validado: 2x NVIDIA RTX 5090 32 GB (Blackwell), tensor parallel 2, vLLM v0.29.0, CUDA 12.9, CUDAGraphs.
- GPU de consumo compatibles: RTX 3090 (24 GB), RTX 4090 (24 GB) y RTX 5090 (32 GB) segun la propia model card. Caben en consumer GPU con tensor parallel 2.
- Opciones de despliegue: vLLM es la ruta soportada y validada (cuantizacion compressed-tensors, KV-cache FP8, prefill troceado, especulacion MTP). Para equipos de consumo, el autor remite a la publicacion GGUF APEX (kataguru/Qwen3.5-35B-A3B-Sceptic-v3.4-GGUF), lo que habilita llama.cpp u Ollama. Compatibilidad con TGI no documentada.
- Rendimiento declarado: 268 tok/s en TP=2 con 2x RTX 5090, frente a 210 tok/s del modelo base en el mismo entorno.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| kataguru Qwen3.5-35B-A3B Sceptic v3.4 Diabolical W4A16 | 35,95 B | ~3 B | 262.144 | apache-2.0 | safetensors AWQ W4A16 | Ajuste en fines, zero refusal, vision/OCR |
| Qwen/Qwen3.5-35B-A3B (base) | 35,95 B | ~3 B | no disponible | no disponible en la informacion | safetensors | Base sin ajuste; GSM8K 82,4 %, TruthfulQA 61,2 %, 210 tok/s en el mismo entorno |
| kataguru Qwen3.5-35B-A3B Sceptic v3.3 | no disponible | ~3 B | no disponible | apache-2.0 (presumible, no confirmado) | safetensors W4A16 | Version previa; GSM8K 87,2 %, TruthfulQA 76,8 %, morfologia 98 % |
| kataguru Qwen3.5-35B-A3B Sceptic v3.4 GGUF APEX | no disponible | ~3 B | no disponible | no disponible en la informacion | GGUF | Variante para consumo; cifras no publicadas en la informacion disponible |

Comparativa con otras familias de tamano similar (por ejemplo Qwen3-30B-A3B): no disponible, ya que no se han proporcionado especificaciones ni resultados de esos modelos junto a esta ficha.

## Limitaciones y advertencias

- Todos los benchmarks proceden de la model card del autor y no cuentan con verificacion independiente; deben tomarse como indicativos y no como resultados auditados.
- El modelo se distribuye exclusivamente en fines e ingles. No hay soporte declarado de castellano, catalan, gallego, euskera ni otros idiomas, por lo que su uso en espanol queda fuera del ambito declarado.
- El comportamiento zero refusal implica ausencia de filtros de contenido en ficcion, erotica e investigacion, y segun el autor tampoco hay auditoria en el canal de razonamiento interno. Esto exige controles de contenido externos si se despliega en productos de cara al publico o en entornos regulados.
- Riesgo de alucinacion: no se han publicado metricas de fidelidad factual mas alla de TruthfulQA (78,4 % autodeclarado), que no cubre alucinacion en contextos largos ni en dominios especializados.
- El contexto de 262.144 tokens es nativo, pero su uso efectivo depende de la memoria de la KV-cache; el autor recomienda KV-cache en FP8 precisamente por esta razon, y el rendimiento declarado se mide con prompts cortos, no en la ventana completa.
- Requisitos de hardware no triviales: aunque cabe en consumer GPU, necesita dos GPU con tensor parallel o una GPU de 24-32 GB, lo que excluye portatiles y equipos de gama media.
- La fecha de creacion del repositorio registrada es 2026-09-29, posterior a la ventana habitual de publicacion de Qwen3.5; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en produccion.
- Sin traccion comunitaria: 0 descargas y 0 likes, lo que reduce la probabilidad de que los problemas de inferencia esten ya documentados por terceros.
- Licencia apache-2.0, lo que permite uso comercial, modificacion y redistribucion; conviene revisar igualmente las condiciones del modelo base Qwen3.5-35B-A3B.
- Tres etapas de ajuste consecutivas (v3.0, v3.3, v3.4) sobre el mismo base pueden inducir deriva de estilo o sobreajuste a los conjuntos internos del autor, riesgo no cuantificado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kataguru/Qwen3.5-35B-A3B-Sceptic-v3.4-Diabolical-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Variante GGUF mencionada por el autor: https://huggingface.co/kataguru/Qwen3.5-35B-A3B-Sceptic-v3.4-GGUF
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Portal de Qwen: https://qwen.ai/home
- Repositorio relacionado de variantes cuantizadas de la familia Sceptic: https://huggingface.co/models?other=base_model:quantized:kataguru/Qwen3.5-35B-A3B-Sceptic-v3-1M-W4A16
