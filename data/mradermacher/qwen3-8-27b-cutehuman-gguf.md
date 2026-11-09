# mradermacher/Qwen3.8-27B-CuteHuman-GGUF

## Resumen

Qwen3.8-27B-CuteHuman-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo wesjos/Qwen3.8-27B-CuteHuman, un ajuste fino (finetune) orientado a roleplay y conversacion sobre una base de la familia Qwen3.8. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF para llama.cpp y ecosistemas compatibles, que en este caso no ha entrenado el modelo sino que lo ha convertido y empaquetado para su ejecucion en hardware de consumo.

El modelo base cuenta con 27.320.697.856 parametros segun los metadatos de safetensors, lo que lo situa en la categoria de modelos densos de aproximadamente 27B. La model card del repositorio lo etiqueta como finetune en bf16 con enfasis en roleplay, conversacion y un estilo "cute", y declara soporte para ingles y chino. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales mas alla de las obligatorias de atribucion.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B en local mediante cuantizaciones de 2 a 8 bits, algo imposible con los pesos bf16 originales en GPUs de consumo. No obstante, la informacion publicada es escasa: no hay benchmarks, no se detalla la composicion del dataset de entrenamiento ni la arquitectura exacta mas alla de la herencia de Qwen3.8, y no se han publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la base Qwen3.8; transformer denso presumiblemente, sin confirmar) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base wesjos/Qwen3.8-27B-CuteHuman. Por herencia de la familia Qwen3.8 cabe esperar un transformer denso de aproximadamente 27B parametros, pero la model card no confirma ni el tipo de atencion, ni la longitud de contexto nativa, ni si emplea tecnicas como decodificacion especulativa o atencion lineal. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o preferencia humana.

Lo unico documentado por el autor es que se trata de un finetune en bf16 con etiquetas de roleplay, conversacion y estilo "cute", lo que sugiere un ajuste orientado a mantener dialogos con un tono afectivo y personajes. El proceso de cuantizacion realizado por mradermacher es estatico: no hay cuantizaciones ponderadas ni imatrix disponibles en el momento de publicacion, segun indica la propia model card, aunque el autor deja abierta la posibilidad de generarlas si se solicita en la seccion de discusiones.

## Capacidades

- Generacion de texto conversacional y multi-turno, con enfasis en roleplay y personajes.
- Estilo de respuesta "cute" y afectivo, segun la etiqueta del modelo base.
- Soporte bilingue declarado: ingles y chino.
- Capacidad multimodal potencial: el repositorio incluye ficheros mmproj-Q8_0 y mmproj-f16, suplementos para proyeccion multimodal en llama.cpp, aunque la model card no documenta que el modelo base sea de vision.
- Compatibilidad con endpoints y despliegue en ecosistemas GGUF (llama.cpp y derivados).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio explicitos: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay y personajes conversacionales: el modelo esta afinado especificamente para mantener dialogos con un tono "cute" y afectivo, por lo que encaja en aplicaciones de entretenimiento, compania virtual y simulacion de personajes con personalidad definida.
- Chatbots de atencion al cliente con tono cercano: la cuantizacion Q4_K_M o Q5_K_M permite desplegar el modelo en una GPU de 24 GB, gestionando conversaciones multi-turno con un tono amable; la longitud de contexto efectiva dependera de la configuracion de llama.cpp y de la VRAM disponible.
- Prototipado local en estaciones de trabajo: gracias a las cuantizaciones Q3 y Q4, un desarrollador puede probar el modelo en una RTX 4090 o incluso en una GPU de 16 GB con Q3_K_M, sin necesidad de infraestructura cloud.
- Generacion de dialogos para videojuegos y narrativa interactiva: el enfasis en roleplay y el soporte de ingles y chino lo hacen util para escribir lineas de personajes y ramificaciones narrativas en ambos idiomas.
- Asistentes conversacionales en chino e ingles: el soporte bilingue declarado permite construir asistentes para mercados de habla inglesa y china con una sola instancia del modelo.
- Experimentacion con proyeccion multimodal: los ficheros mmproj incluidos permiten probar en llama.cpp si el modelo base admite entrada de imagen, aunque esta capacidad no esta documentada por el autor y debe validarse empiricamente.
- Investigacion sobre cuantizacion: el repositorio ofrece un rango amplio de cuantizaciones (de Q2_K a f16) que permite estudiar la degradacion de calidad frente al modelo original en tareas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion y con 27.3B parametros:
  - f16: aproximadamente 55 GB (no cabe en GPUs de consumo).
  - Q8_0: aproximadamente 29 GB.
  - Q6_K: aproximadamente 22-23 GB.
  - Q5_K_M: aproximadamente 19-20 GB.
  - Q4_K_M: aproximadamente 16-17 GB.
  - Q3_K_M: aproximadamente 13-14 GB.
  - Q2_K: aproximadamente 10-11 GB.
- GPU recomendadas: A100 80 GB o H100 para f16 y Q8_0; RTX 4090 (24 GB) para Q5_K_M y Q4_K_M; RTX 4080/4070 Ti Super (16 GB) para Q3_K_M; GPUs de 12 GB para Q2_K con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090 con Q4_K_M o Q5_K_M, y en GPUs de 16 GB con Q3_K_M. En 12 GB solo con Q2_K y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; los ficheros mmproj requieren llama.cpp con soporte multimodal.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-CuteHuman-GGUF (este) | 27.3B | no disponible | Apache 2.0 | GGUF | Finetune de roleplay, en/zh |
| Modelo base wesjos/Qwen3.8-27B-CuteHuman | 27.3B | no disponible | Apache 2.0 | safetensors/bf16 | Version sin cuantizar, requiere ~55 GB |
| Alternativas de la familia Qwen3.8 de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de otros desarrolladores en parametros, contexto o rendimiento sin inventar datos.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en tareas de razonamiento, codigo o matematicas es desconocido.
- El finetune esta orientado a roleplay y conversacion, por lo que puede degradar su desempeno en tareas tecnicas o de razonamiento formal respecto al modelo base original.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay datos especificos sobre la tasa en este finetune.
- Sesgos conocidos: no documentados por el autor; el estilo "cute" puede introducir sesgos de tono y afectividad no evaluados.
- Idiomas soportados limitados a ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto no documentada; en cuantizaciones bajas y con poca VRAM el contexto efectivo se vera reducido.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad conversacional; se recomienda Q4_K_M o superior para produccion.
- La capacidad multimodal sugerida por los ficheros mmproj no esta confirmada por el autor; validar antes de usarla en produccion.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribucion y revisar las condiciones del modelo base original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-CuteHuman-GGUF
- Modelo base: https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-CuteHuman-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
