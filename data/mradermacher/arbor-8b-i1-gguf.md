# mradermacher/Arbor-8B-i1-GGUF

## Resumen

Arbor-8B-i1-GGUF es la version cuantizada en formato GGUF del modelo pinkachu/Arbor-8B, publicada por el usuario mradermacher, especializado en la conversion de modelos a GGUF mediante cuantizacion con matriz de importancia (imatrix). El repositorio no contiene el modelo original, sino una coleccion de 24 cuantizaciones de tipo i1 que cubren desde IQ1_S (2,1 GB) hasta Q6_K (6,7 GB), ademas del fichero imatrix empleado para generarlas.

El modelo subyacente, pinkachu/Arbor-8B, es un merge construido con mergekit (etiquetas `mergekit` y `merge` en el repositorio), con 8.030.261.312 parametros totales confirmados en los tensores safetensors del modelo base. Se trata por tanto de una fusion de pesos de otros modelos en lugar de un entrenamiento desde cero, orientada a uso conversacional y declarada exclusivamente en ingles.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 8B en hardware de consumo mediante llama.cpp y sus derivados, con el plus de que las cuantizaciones i1 (imatrix) suelen ofrecer mejor relacion calidad/tamano que las cuantizaciones estaticas equivalentes. No se dispone de informacion sobre licencia, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo documenta que el modelo base es un merge creado con mergekit) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); se distribuye tambien el fichero imatrix para generar cuantizaciones propias |
| Version de cuantizacion | quantize_version: 2, output_tensor_quantised: 1, convert_type: hf |
| Tamano del repositorio | 93,8 GB |
| Modelo base | pinkachu/Arbor-8B |
| Repositorio de cuantizaciones estaticas | mradermacher/Arbor-8B-GGUF |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. El unico dato tecnico relevante es que pinkachu/Arbor-8B se genero con mergekit, herramienta de fusion de pesos, lo que implica que Arbor-8B combina los pesos de dos o mas modelos preexistentes mediante alguna de las tecnicas soportadas por mergekit (por ejemplo, SLERP, TIES, DARE-TIES o passthrough). No se especifica que modelos se fusionaron, ni la configuracion del merge, ni si hubo un entrenamiento posterior de ajuste.

Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre tecnicas de alineacion como RLHF, DPO o PPO. Respecto al proceso de cuantizacion, el autor indica que se trata de cuantizaciones ponderadas con imatrix (`weighted/imatrix quants`), una tecnica que calibra los errores de cuantizacion por capa usando estadisticas de activacion de un corpus de calibracion, lo que mejora la perplejidad frente a las cuantizaciones estaticas del mismo tamano. El fichero imatrix resultante se incluye en el repositorio para que terceros puedan replicar el proceso.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Ejecucion local en CPU y GPU a traves del ecosistema GGUF (llama.cpp y derivados).
- Seleccion flexible de calidad frente a consumo de memoria gracias a 24 niveles de cuantizacion entre 2,1 GB y 6,7 GB.
- Compatibilidad declarada con endpoints gestionados (etiqueta `endpoints_compatible`), lo que facilita su despliegue en infraestructura de inferencia alojada.
- Capacidad de servir como base para crear cuantizaciones propias a partir del fichero imatrix incluido.
- Tool calling, function calling, agentes, vision, audio, modo de razonamiento explicito y capacidades multilingues: no disponible (no se documentan en la informacion proporcionada).

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse en un portatil o sobremesa con llama.cpp u Ollama usando las cuantizaciones Q4_K_M o IQ4_XS, que ocupan entre 4,5 y 5,0 GB, y mantener dialogos multi-turno sin conexion a Internet ni coste por token.
- Prototipado en entornos con memoria muy limitada: las cuantizaciones IQ1_S, IQ2_XXS e IQ2_XS (2,1 a 2,7 GB) permiten probar el comportamiento del modelo en equipos con 4-6 GB de RAM libre, aceptando la perdida de calidad que el propio autor advierte en la tabla de cuantizaciones.
- Servicio de inferencia alojado: la etiqueta `endpoints_compatible` indica que el modelo puede publicarse como endpoint gestionado, util para aplicaciones que necesitan una API HTTP sin mantener infraestructura propia.
- Base para cuantizaciones a medida: un equipo que necesite un equilibrio especifico entre tamano y calidad puede descargar el fichero imatrix y regenerar sus propias cuantizaciones con la version de llama.cpp que prefiera.
- Experimentacion con tecnicas de fusion de modelos: al ser un merge de mergekit, el modelo es un candidato natural para estudios comparativos sobre como afectan las distintas estrategias de fusion al rendimiento de un 8B, siempre que se anada una evaluacion propia al no existir benchmarks publicados.
- Incorporacion a aplicaciones de escritorio mediante LM Studio, KoboldCpp o el servidor de llama.cpp, ofreciendo generacion de texto en local para tareas de redaccion, resumen o reescritura en ingles.
- Evaluacion comparativa de cuantizaciones: el repositorio permite medir en un mismo modelo la degradacion de perplejidad entre, por ejemplo, Q6_K (6,7 GB), Q4_K_M (5,0 GB) e IQ2_M (3,0 GB), un caso de uso habitual en equipos que calibran el coste de memoria de su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye valores de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni para las cuantizaciones ni para el modelo base pinkachu/Arbor-8B.

## Requisitos de hardware

Los tamanos de fichero que figuran a continuacion son datos reales de la tabla de cuantizaciones del repositorio. La memoria necesaria para inferencia es superior al tamano del fichero, ya que hay que sumar la cache KV del contexto y el overhead del runtime; las cifras de la ultima columna son estimaciones orientativas, no datos publicados por el autor.

| Cuantizacion | Tamano del fichero | Memoria estimada en inferencia |
|---|---|---|
| i1-IQ1_S | 2,1 GB | ~3 GB |
| i1-IQ2_XXS | 2,5 GB | ~3,5 GB |
| i1-IQ2_M | 3,0 GB | ~4 GB |
| i1-IQ3_XS | 3,6 GB | ~4,5 GB |
| i1-Q3_K_M | 4,1 GB | ~5 GB |
| i1-IQ4_XS | 4,5 GB | ~5,5 GB |
| i1-Q4_K_S | 4,8 GB | ~6 GB |
| i1-Q4_K_M | 5,0 GB | ~6,5 GB |
| i1-Q5_K_M | 5,8 GB | ~7 GB |
| i1-Q6_K | 6,7 GB | ~8 GB |

- GPU de consumo: el modelo cabe con holgura en tarjetas de 12 GB o mas, como la RTX 3060 de 12 GB, la RTX 4070 Ti, la RTX 4080 o la RTX 4090, usando cuantizaciones de Q4 en adelante incluso con contextos largos.
- GPU de gama media: tarjetas de 8 GB, como la RTX 3070 o la RTX 4060, pueden alojar cuantizaciones IQ3 y Q4 con contextos moderados; las cuantizaciones Q5 y Q6 requeririan descargar parte de las capas a CPU.
- Solo CPU: las cuantizaciones IQ2 e IQ3 son viables en equipos sin GPU dedicada con 8-16 GB de RAM, con velocidades de generacion limitadas por el ancho de banda de memoria.
- GPU de centro de datos: A100, H100 o L40S no aportan ventaja frente a GPU de consumo para un modelo de este tamano, salvo que se busque un throughput muy alto con muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y text-generation-webui son compatibles de forma nativa con GGUF. El soporte de vLLM y TGI para GGUF es mas limitado, por lo que para servir a gran escala suele preferirse convertir a safetensors o usar un runtime especifico de GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|---|
| mradermacher/Arbor-8B-i1-GGUF | 8.030.261.312 | GGUF (i1/imatrix) | no disponible | no disponible | no publicados | HuggingFace |
| mradermacher/Arbor-8B-GGUF | 8.030.261.312 | GGUF (estatico) | no disponible | no disponible | no publicados | HuggingFace |
| pinkachu/Arbor-8B | 8.030.261.312 | safetensors | no disponible | no disponible | no publicados | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos de la misma categoria dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con otros modelos de 8B. Los resultados de busqueda web disponibles no guardan relacion con este modelo.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos del modelo. Al ser un merge de modelos no identificados, los sesgos heredados dependen de los componentes originales y no pueden auditarse a partir de esta ficha.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de 8B; no hay evaluaciones de fidelidad factual que permitan acotarlo.
- La licencia no esta disponible, lo que impide confirmar si se permite el uso comercial. Antes de cualquier despliegue en produccion debe verificarse la licencia tanto de este repositorio como la de pinkachu/Arbor-8B.
- Idioma: el modelo esta declarado unicamente en ingles. No hay evidencia de soporte para castellano ni para otros idiomas.
- La longitud de contexto no esta documentada, por lo que no puede garantizarse el comportamiento en conversaciones o documentos largos sin una prueba propia.
- El autor advierte explicitamente sobre la baja calidad de las cuantizaciones de menor tamano: IQ1_S se etiqueta como "for the desperate" y Q2_K_S como "very low quality". Estas variantes no son adecuadas para produccion.
- No hay resultados de benchmarks, por lo que no es posible comparar su calidad real frente a otros modelos de 8B ni justificar su eleccion frente a alternativas mejor documentadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Al tratarse de una cuantizacion, la calidad es necesariamente inferior a la del modelo base en safetensors, con una degradacion creciente conforme baja el numero de bits.
- El repositorio ocupa 93,8 GB en total; descargar el conjunto completo de cuantizaciones no es necesario y conviene limitarse a la variante que se vaya a usar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Arbor-8B-i1-GGUF
- Modelo base: https://huggingface.co/pinkachu/Arbor-8B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Arbor-8B-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Arbor-8B-i1-GGUF
- Peticiones de cuantizacion y preguntas frecuentes del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
