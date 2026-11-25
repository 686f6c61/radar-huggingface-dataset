# mradermacher/Inkling-2-Mini-abliterated-GGUF

## Resumen

Inkling-2-Mini-abliterated-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo mrfakename/Inkling-2-Mini-abliterated, publicada por mradermacher. El modelo subyacente es una variante "abliterated" (con las direcciones de rechazo eliminadas mediante edicion de pesos) de un modelo base denominado Inkling-2-Mini, del que no se documenta autor original ni procedencia en la informacion disponible. La arquitectura es de tipo Mixture of Experts (MoE), segun las etiquetas del repositorio, con 26.070.385.152 parametros totales segun los datos de safetensors del modelo base.

El rol de este repositorio no es entrenar un modelo nuevo, sino ofrecer pesos cuantizados listos para inferencia local con llama.cpp y derivados (Ollama, LM Studio, etc.). La cuantizacion principal documentada es Q4_K_S con un tamano de 16,2 GB, ademas de un fichero mmproj (multi-modal supplement) en Q8_0 y f16, lo que sugiere que el modelo base incorpora capacidades de vision, aunque no se detalla su alcance.

Su relevancia actual es acotada y practica: permite ejecutar un MoE de ~26B parametros en hardware de consumo o servidores modestos mediante cuantizacion de 4 bits, con la particularidad de estar "abliterated" (sin censura de rechazo), lo que interesa a quienes investigan comportamiento de modelos sin alineamiento o necesitan generacion sin filtros de rechazo. La licencia Apache 2.0 facilita su uso comercial, aunque las implicaciones del proceso de abliteration deben evaluarse con cuidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun tags del repositorio; detalles de capas y atencion no disponibles |
| Parametros totales | 26.070.385.152 (~26,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

La informacion disponible solo confirma que el modelo es de tipo Mixture of Experts y que deriva de mrfakename/Inkling-2-Mini-abliterated, que a su vez es una version abliterated de un modelo Inkling-2-Mini no identificado en la documentacion. No se especifican el numero de expertos, el numero de capas, la dimension oculta, el mecanismo de atencion ni la estrategia de enrutamiento. Los 26.070.385.152 parametros totales provienen de los metadatos de safetensors del modelo base.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo, matematicas o multilingue), ni sobre si hubo fases de RLHF, DPO u otro ajuste por preferencias. El proceso de "abliteration" consiste en identificar y restar las direcciones de activacion asociadas al rechazo en el espacio de pesos, de modo que el modelo deja de producir respuestas de negacion ante ciertas peticiones; sin embargo, no se documenta la metodologia concreta aplicada en este caso (capas afectadas, fuerza de la proyeccion, evaluacion de degradacion). El repositorio de mradermacher solo realiza la conversion a GGUF y la cuantizacion, sin modificar los pesos mas alla de la perdida propia de la cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible.
- Capacidades multimodales: la presencia de ficheros mmproj (Q8_0 y f16) indica soporte de entrada de vision en el modelo base, aunque no se detalla que tipo de imagenes o tareas cubre.
- Comportamiento "uncensored"/abliterated: reduccion o eliminacion de respuestas de rechazo ante peticiones que un modelo alineado rechazaria.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Inferencia local en hardware de consumo: la cuantizacion Q4_K_S (16,2 GB) permite cargar el modelo en una GPU con 24 GB de VRAM (RTX 3090/4090) o en configuraciones CPU+GPU con llama.cpp, sin necesidad de infraestructura de datacenter.
- Investigacion sobre alineamiento y seguridad: el caracter abliterated permite estudiar como se comporta un MoE sin las direcciones de rechazo, comparando tasas de negacion frente al modelo base alineado en conjuntos de prompts controlados.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas adultas donde los filtros de rechazo de modelos alineados interrumpen la generacion; el contexto en ingles y la licencia Apache 2.0 facilitan su integracion en productos editoriales.
- Despliegue en entornos air-gapped: al ser GGUF y ejecutable con llama.cpp, puede operar en maquinas sin conexion, util para laboratorios o entornos con requisitos de confidencialidad.
- Prototipado rapido de asistentes conversacionales: la etiqueta "conversational" y el formato GGUF permiten montar un chatbot local con Ollama en minutos para pruebas de concepto internas.
- Evaluacion de cuantizaciones: util como caso de estudio para medir la degradacion de perplexity y calidad entre Q2_K, Q4_K_S y Q8_0 en un MoE de ~26B, comparando con los graficos de referencia de ikawrakow enlazados en la model card.
- Procesamiento de imagenes con el mmproj: los ficheros multi-modales permiten experimentar con entrada visual en llama.cpp, aunque el alcance real de la capacidad de vision no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: aproximadamente 9-10 GB.
  - Q4_K_S: aproximadamente 16,2 GB de pesos; con contexto y cache KV, prever 18-20 GB.
  - Q8_0: aproximadamente 28-30 GB.
  - f16: aproximadamente 52 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q4_K_S; A100 40/80 GB o H100 para Q8_0 y f16; multiples GPU o CPU offload para cuantizaciones mayores.
- Cabe en GPU de consumo: si, Q4_K_S en RTX 3090/4090 (24 GB) y potencialmente Q2_K en GPUs de 12-16 GB; el modelo completo en f16 no cabe en consumer.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el formato GGUF es compatible con endpoints_compatible segun los tags. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles. Al ser MoE, el throughput depende del numero de parametros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-abliterated-GGUF | ~26,1 B (MoE) | no disponible | Apache 2.0 | GGUF | Abliterated, solo ingles, con mmproj |
| mrfakename/Inkling-2-Mini-abliterated | ~26,1 B (MoE) | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva este |
| Alternativas de ~24-30B abliterated | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos comparables concretos en la documentacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El proceso de abliteration puede degradar capacidades generales (razonamiento, coherencia, seguimiento de instrucciones) respecto al modelo original; no se documenta ninguna evaluacion de esta degradacion.
- Riesgo elevado de generar contenido danino, ofensivo o ilegal al haberse eliminado los mecanismos de rechazo; no es apto para aplicaciones orientadas al publico sin capas de moderacion externas.
- Riesgo de alucinacion no cuantificado; no hay benchmarks que permitan estimarlo.
- Idioma limitado al ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto desconocida; no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en un MoE de este tamano; se recomienda Q4_K_S o superior para produccion.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado; la licencia no exime de cumplir normativa aplicable (por ejemplo, en materia de contenido).
- El repositorio no documenta el modelo original ni su procedencia, lo que dificulta auditar sesgos o datos de entrenamiento.
- Solo se ofrecen cuantizaciones estaticas; no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion, lo que puede afectar la calidad relativa de las cuantizaciones IQ.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-Mini-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/mrfakename/Inkling-2-Mini-abliterated
- Pagina de descargas del autor: https://hf.tst.eu/model#Inkling-2-Mini-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplexity por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- nethype GmbH: https://www.nethype.de/
