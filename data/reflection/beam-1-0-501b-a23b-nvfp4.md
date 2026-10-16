# reflection/Beam-1.0-501B-A23B-NVFP4

## Resumen

Beam 1.0 501B A23B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Reflection (reflection.ai) y publicado en Hugging Face bajo licencia Apache 2.0. El checkpoint analizado, `reflection/Beam-1.0-501B-A23B-NVFP4`, es la variante cuantizada en NVFP4 de la version instruida; la familia Beam se distribuye tambien en BF16 y FP8. Segun la model card, la arquitectura declara 501,3 mil millones de parametros totales con 23,4 mil millones activos por token, 52 capas (3 densas y 49 MoE), 256 expertos y una ventana de contexto de hasta 1 millon de tokens, con desarrollo predominantemente en ingles.

El modelo esta orientado a tres areas concretas: razonamiento eficiente en tokens (el autor afirma alcanzar calidad de solucion comparable a modelos abiertos lideres usando aproximadamente 3 veces menos tokens de razonamiento), ingenieria de software (resolucion de issues reales de GitHub, entornos CLI y DevOps) y uso agentico de herramientas (tareas de horizonte largo, integracion de herramientas via MCP y navegacion web). Tambien cubre razonamiento cientifico y matematico de nivel de posgrado y demostracion de teoremas.

Es relevante ahora porque combina un contexto de 1M tokens con un ratio de activacion muy bajo (23,4B de 501,3B), lo que abarata el coste por token generado frente a modelos densos de tamano similar, y porque se publica en un formato de cuantizacion de 4 bits (NVFP4) pensado para despliegue eficiente en hardware NVIDIA. No obstante, conviene senalar que el recuento real de parametros en los archivos safetensors es de 254.642.537.152, aproximadamente la mitad de los 501,3B declarados, algo coherente con el empaquetado de pesos de 4 bits en la metadata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso; 52 capas (3 densas + 49 MoE); atencion GQA con compuerta (gated GQA) + sliding window attention |
| Parametros totales | 501,3 B declarados por el autor; 254.642.537.152 segun metadata real de safetensors |
| Parametros activos | 23,4 B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (este checkpoint); la familia incluye tambien BF16 y FP8 |
| Idiomas soportados | Ingles (en), desarrollo predominantemente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tag de repo "8-bit", empaquetado NVFP4 via ModelOpt) |
| Numero de expertos | 256 |
| Tamano de vocabulario | 152.000 tokens |
| Modalidades | Texto a texto (sin vision ni audio) |
| Plantilla de chat | Formato Harmony modificado |
| Fecha de corte de conocimiento | 30 de junio de 2026 |
| Tamano del repositorio | 293,6 GB |
| Descargas / likes en Hugging Face | 864 descargas / 21 likes |
| Publicacion / ultima actualizacion | 10 de octubre de 2026 / 16 de octubre de 2026 |

## Arquitectura y entrenamiento

Beam emplea una arquitectura de mezcla de expertos dispersa (sparse MoE) con 501,3B de parametros totales y 23,4B activos. El cuerpo del modelo tiene 52 capas, de las cuales 3 son densas y 49 son capas MoE con 256 expertos. La atencion combina GQA con compuerta (gated grouped-query attention) y sliding window attention, lo que resulta coherente con la ventana de contexto de 1M tokens anunciada: la atencion de ventana deslizante reduce el coste de atencion sobre secuencias muy largas mientras que el enrutado MoE mantiene bajo el coste por token en terminos de FLOPs activos.

No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. Lo que si se documenta es que se trata de un checkpoint instruido (instruction-tuned) con una plantilla de chat basada en una version modificada del formato Harmony, orientada a separar canales de razonamiento y de respuesta. Tampoco se detalla el algoritmo de enrutado de expertos, el numero de expertos activados por token, la dimension oculta ni el numero de cabezas de atencion. El informe tecnico (technical report) esta anunciado como "coming" en la model card y no esta disponible en el momento de redactar esta ficha.

La innovacion tecnica que el autor destaca de forma explicita es la eficiencia en tokens de razonamiento: segun la model card, Beam alcanza calidad de solucion comparable a modelos abiertos lideres con aproximadamente 3 veces menos tokens de inferencia dedicados a razonar. La publicacion en NVFP4 mediante ModelOpt de NVIDIA apunta a despliegue optimizado en TensorRT-LLM y entornos de inferencia NVIDIA, incluyendo soporte declarado para SageMaker (tag `deploy:sagemaker`).

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat basada en Harmony modificado.
- Razonamiento con eficiencia de tokens: el autor declara ~3x menos tokens de razonamiento para calidad de solucion comparable a modelos abiertos lideres.
- Ingenieria de software: resolucion de issues reales de GitHub, operacion en entornos CLI y DevOps, integracion con arneses de codificacion agentica, generacion de codigo en varios lenguajes.
- Uso agentico de herramientas: finalizacion de tareas de horizonte largo, integracion de herramientas basada en MCP (Model Context Protocol) y navegacion web.
- Ejecucion de flujos de trabajo multi-paso a partir de instrucciones en lenguaje natural.
- Razonamiento matematico y cientifico: resolucion de problemas cientificos de nivel de posgrado, demostracion de teoremas y matematicas aplicadas.
- Transferencia del razonamiento a depuracion, planificacion y autocorreccion durante la ejecucion agentica.
- Manejo de contexto muy largo: hasta 1M tokens de ventana.
- No se documentan capacidades de vision, audio, ni soporte multilingue mas alla del ingles.

## Casos de uso

- Atencion al cliente automatizada en ingles: con una ventana de 1M tokens el modelo puede mantener conversaciones multi-turno con historial completo de tickets, documentacion de producto y registros de incidencias sin truncar ni resumir, reduciendo perdidas de contexto en casos largos.
- Resolucion automatica de issues de GitHub: el modelo puede recibir el issue, el arbol del repositorio y los ficheros relevantes, generar un parche y explicar el razonamiento, integrándose en un pipeline de CI que abra una pull request para revision humana.
- Asistente de CLI y DevOps: dado su soporte declarado para entornos de linea de comandos, puede encadenar comandos de diagnostico, interpretar salidas y proponer correcciones en flujos de despliegue o depuracion de infraestructura.
- Agentes con herramientas via MCP: al soportar MCP y navegacion, es adecuado para agentes que deban consultar APIs internas, bases de datos o paginas web y encadenar varias llamadas antes de dar una respuesta final.
- Analisis de repositorios completos: con 1M de tokens de contexto se pueden cargar modulos enteros junto con sus tests para tareas de refactorizacion, migracion de versiones o auditoria de seguridad, evitando el troceado agresivo.
- Razonamiento cientifico y matematico asistido: resolucion de problemas de nivel de posgrado, verificacion de demostraciones y comprobacion de derivaciones en entornos de investigacion, con la ventaja de consumir menos tokens de razonamiento por problema.
- Automatizacion de tareas de planificacion multi-paso: descomposicion de objetivos en subtareas, asignacion de herramientas y autocorreccion cuando una subtarea falla, aprovechando la transferencia de razonamiento a planificacion.
- Generacion de codigo en produccion: integracion en pipelines de CI/CD mediante tool calling para generar tests, completar funciones o traducir codigo entre lenguajes, con la ventaja de coste reducido por el bajo numero de parametros activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye afirmaciones cualitativas (por ejemplo, alcanzar calidad de solucion comparable a modelos abiertos lideres con aproximadamente 3x menos tokens de razonamiento), pero no acompana tablas con cifras de MMLU, HumanEval, GSM8K, SWE-bench ni similares, y el informe tecnico figura como pendiente de publicacion.

## Requisitos de hardware

- VRAM estimada para el checkpoint NVFP4: los pesos ocupan en torno a 250-290 GB (el repositorio completo pesa 293,6 GB), a los que hay que sumar la cache KV. Estimaciones orientativas, no confirmadas por el autor:
  - 4x H100 80GB (320 GB) permitiria cargar los pesos con muy poco margen para cache KV.
  - 8x H100 80GB (640 GB) es una configuracion comoda para servir con contexto largo.
  - 2x B200 192GB (384 GB) o 3x H200 141GB (423 GB) serian alternativas razonables.
- Variantes no cuantizadas (estimacion): BF16 requeriria del orden de 1 TB de VRAM, lo que implica 16x H100 80GB o 8x B200; FP8 se situaria alrededor de 500 GB, es decir, 8x H100 80GB.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 5090 (32 GB) pueden alojar este checkpoint, ni siquiera con varias unidades en un equipo de escritorio tipico. El despliegue realista es en nodos multi-GPU de centro de datos (H100, H200, B200).
- Opciones de despliegue: el formato NVFP4 via ModelOpt apunta a TensorRT-LLM y al ecosistema NVIDIA; tambien es esperable soporte en vLLM y SGLang para cuantizacion NVFP4, aunque no se confirma en la informacion disponible. El tag `deploy:sagemaker` indica soporte declarado para despliegue en Amazon SageMaker. El soporte en llama.cpp u Ollama para este checkpoint concreto no esta confirmado.
- Latencia y throughput: no disponibles. El bajo numero de parametros activos (23,4B) sugiere un coste por token mas cercano a un modelo denso de ~23B que a uno de 501B, pero no hay cifras publicadas de tokens por segundo ni de latencia en la informacion proporcionada.
- Cache KV para 1M tokens: no se especifica el numero de cabezas KV, la dimension de cabeza ni si se aplica compresion de cache, por lo que el consumo de memoria asociado al contexto maximo no se puede calcular con los datos disponibles.

## Comparativa con modelos similares

Los valores de los modelos comparables son aproximados y proceden de informacion publica general, no de la busqueda web realizada para esta ficha.

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Beam 1.0 501B A23B (NVFP4) | 501,3 B / 23,4 B (declarado) | 1 M | Apache 2.0 | Hugging Face, variantes BF16, FP8 y NVFP4 |
| Qwen3-235B-A22B | 235 B / 22 B | 128 K (extensible a 1 M) | Apache 2.0 | Hugging Face |
| DeepSeek-V3 / V3.1 | 671 B / 37 B | 128 K | MIT | Hugging Face |
| Kimi K2 | 1 T / 32 B | 128 K (mayor en variantes posteriores) | Licencia MIT modificada | Hugging Face |

La comparacion directa de rendimiento no es posible porque Beam no publica resultados de benchmarks. En terminos de arquitectura, Beam se situa en la misma familia de diseno que Qwen3-235B-A22B (MoE con activacion baja y licencia permisiva), pero con una ventana de contexto notablemente mayor (1M frente a 128K nativos) y con pesos distribuidos en un formato de 4 bits especifico de NVIDIA. El informe tecnico pendiente seria el documento clave para poder comparar de forma rigurosa.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: la model card declara 501,3B totales, mientras que la metadata de safetensors reporta 254.642.537.152. Es coherente con el empaquetado de pesos NVFP4 (dos valores de 4 bits por byte), pero debe verificarse antes de planificar despliegues y presupuestos de VRAM.
- Ausencia de benchmarks publicados: no se puede validar de forma independiente la afirmacion de eficiencia (3x menos tokens de razonamiento) ni comparar con alternativas con datos duros.
- Cuantizacion NVFP4: al ser un checkpoint de 4 bits, cabe esperar una perdida de calidad respecto a las variantes BF16 y FP8 del mismo modelo. Para tareas sensibles conviene evaluar contra la version BF16.
- Idioma: soporte documentado unicamente en ingles. El rendimiento en castellano u otros idiomas no esta evaluado ni garantizado.
- Fecha de corte de conocimiento: 30 de junio de 2026. Cualquier evento, API o version de libreria posterior no sera conocida por el modelo.
- Riesgo de alucinacion: como en cualquier modelo generativo, especialmente en cadenas de razonamiento largas y en tareas agenticas donde el modelo puede inventar llamadas a herramientas o resultados de comandos. No se documentan mecanismos de mitigacion ni evaluaciones de fiabilidad.
- Contexto de 1M tokens: no se documenta la degradacion esperada a lo largo de la ventana ni el consumo de cache KV. Es previsible cierto efecto de "lost in the middle" en tareas de recuperacion sobre contextos muy largos.
- Sesgos: no se publica ninguna evaluacion de sesgos, toxicidad ni seguridad. Al estar entrenado predominantemente en ingles, los sesgos culturales y linguisticos del corpus anglosajon son esperables.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion, pero el formato NVFP4 depende de herramientas de NVIDIA (ModelOpt / TensorRT-LLM) cuyos terminos son independientes de la licencia del modelo.
- Despliegue: no apto para GPU de consumo. Requiere infraestructura multi-GPU de centro de datos, lo que limita su uso a organizaciones con ese hardware.
- Documentacion incompleta: no se detallan datos de entrenamiento, composicion del dataset, tecnicas de alineacion ni arquitectura interna completa (cabezas, dimension oculta, expertos activados por token). El informe tecnico esta anunciado pero no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reflection/Beam-1.0-501B-A23B-NVFP4
- Checkpoint base de la familia Beam (BF16/FP8): https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Organizacion en Hugging Face: https://huggingface.co/reflection
- Repositorio GitHub: https://github.com/reflection-oss
- Blog de lanzamiento: https://reflection.ai/blog
- Documentacion para desarrolladores: https://developers.reflection.ai/introduction
- Licencia del modelo: https://huggingface.co/reflection/Beam-1.0-501B-A23B/blob/main/LICENSE
- Informe tecnico: pendiente de publicacion ("coming" en la model card)
- Pagina del autor: https://reflection.ai/
- Nota sobre la busqueda web: los resultados devueltos por la busqueda se refieren a la ortografia francesa de "reflexion/reflection" y no contienen informacion tecnica relevante sobre el modelo, por lo que no se incluyen como fuentes.
