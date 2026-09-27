# hsjdjejejeieieieie/Ornith-1.5-9B-uncensored-GGUF

## Resumen
Ornith-1.5-9B-uncensored-GGUF es una cuantizacion en formato GGUF del modelo denso junafinity/Ornith-1.5-9B-uncensored, con 8.953.803.264 parametros (8,95 mil millones). El repositorio de HuggingFace esta publicado por la cuenta hsjdjejejeieieieie, mientras que la model card indica que el proceso de cuantizacion lo realizo mradermacher, cuyos enlaces y nombres de fichero aparecen referenciados en el propio README. Se distribuye bajo licencia Apache 2.0 y esta etiquetado como multimodal con soporte de vision, ademas de "abliterated" y "uncensored".

El modelo pertenece a la familia identificada en los tags como qwen3_5, lo que apunta a una arquitectura transformer derivada de la serie Qwen 3.5, aunque la informacion disponible no confirma oficialmente la arquitectura ni la longitud de contexto. La variante "abliterated" implica que se han eliminado o atenuado direcciones de rechazo en el espacio de activaciones, de modo que el modelo responde a peticiones que un modelo alineado convencional rechazaria.

Su relevancia practica esta en el despliegue local: al estar disponible en cuantizaciones desde Q2_K (3,9 GB) hasta f16 (18 GB), puede ejecutarse en GPU de consumo con llama.cpp u Ollama, incluyendo el complemento mmproj para entrada de imagenes. El repositorio tiene 0 descargas y 0 likes, y fue creado el 27 de septiembre de 2026, por lo que se trata de una publicacion reciente y sin validacion de la comunidad.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma oficial; los tags indican "qwen3_5", lo que sugiere una base transformer densa de la familia Qwen 3.5 |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; complementos multimodales mmproj-Q8_0 y mmproj-f16. Existen cuantizaciones ponderadas/imatrix en el repositorio i1 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers como libreria declarada para el modelo base) |
| Modelo base | junafinity/Ornith-1.5-9B-uncensored |
| Cuantizado por | mradermacher (segun model card) |
| Tamano del repositorio | 83,0 GB |
| Modalidad | Texto e imagen (tags multimodal y vision, ficheros mmproj) |
| Fecha de creacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento
No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo base. Los unicos indicios son los tags del repositorio: "qwen3_5" como posible familia arquitectonica y "zerofuse", termino que en el ecosistema de cuantizacion suele asociarse a tecnicas de fusion de tensores durante la conversion. El dato de 8.953.803.264 parametros indica un modelo denso de aproximadamente 9B, sin componentes de mezcla de expertos.

La innovacion principal declarada es el caracter "abliterated" o "uncensored": se ha intervenido el modelo para reducir la tasa de rechazos ante peticiones sensibles, habitualmente mediante la proyeccion de las direcciones de rechazo fuera de las matrices de pesos. Esta intervencion no anade capacidad nueva, sino que modifica el comportamiento de respuesta. La parte multimodal se implementa mediante los ficheros mmproj (0,7 GB en Q8_0 y 1,0 GB en f16), que actuan como proyector vision-lenguaje y son necesarios para procesar imagenes en llama.cpp.

Las cuantizaciones GGUF incluidas son estaticas, generadas por mradermacher, con variantes de baja degradacion como Q4_K_M y Q8_0, y con una grafica comparativa de perplejidad enlazada en la model card. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni otros mecanismos de eficiencia.

## Capacidades
- Generacion de texto conversacional en ingles, con estilos de respuesta condicionados por el caracter "uncensored" del modelo base.
- Procesamiento de imagenes (vision) mediante los ficheros mmproj, con entrada multimodal imagen-texto.
- Conversaciones multiturno, ya que el pipeline declarado en los tags incluye "conversational".
- Respuesta a peticiones que los modelos alineados convencionalmente rechazan, por la ablacion de direcciones de rechazo.
- Compatibilidad de despliegue con endpoints (tag endpoints_compatible).
- No hay evidencia publicada de soporte especifico de tool calling o function calling.
- No hay evidencia publicada de modo de razonamiento explicito (thinking mode), soporte de audio ni capacidades de agente multi-paso.
- Cobertura multilingue: unicamente ingles declarado; no se documentan otros idiomas.

## Casos de uso
- Analisis local de imagenes con requisitos de privacidad: el modelo acepta imagenes junto a texto mediante los ficheros mmproj, de modo que se puede desplegar en una maquina sin conexion y procesar capturas, documentos escaneados o fotografias sin enviar datos a servicios externos.
- Generacion de ficcion y contenido creativo sin filtros: al tratarse de una variante abliterated, resulta util para escritura de narrativa adulta, terror o dialogos conflictivos donde un modelo alineado tenderia a rechazar o suavizar la peticion.
- Investigacion sobre alineacion y red teaming: sirve como linea base de un modelo con rechazos eliminados para medir la degradacion de seguridad respecto al modelo original, comparando tasas de cumplimiento ante peticiones daninas.
- Asistente conversacional de escritorio en ingles: con Q4_K_M (5,7 GB), cabe en GPU de 8 GB y puede ejecutarse con llama.cpp u Ollama como asistente local de uso personal.
- Descripcion y etiquetado de imagenes (image captioning): integrado en un pipeline de gestion de activos digitales para generar descripciones y metadatos textuales a partir de fotografias.
- Procesamiento por lotes de documentacion en ingles: extraccion y reformulacion de texto de informes o articulos, aprovechando el bajo coste de inferencia de un modelo de 9B cuantizado y su ejecucion offline.
- Evaluacion de cuantizaciones en proyectos de investigacion: el repositorio ofrece un espectro de 12 cuantizaciones del mismo modelo, lo que permite estudiar el impacto de Q2_K a Q8_0 en la calidad de salida manteniendo constantes los pesos originales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se dispone de evaluaciones del modelo base junafinity/Ornith-1.5-9B-uncensored. Los resultados de busqueda web devueltos no contienen informacion tecnica sobre este modelo.

## Requisitos de hardware
- VRAM estimada para los pesos, segun cuantizacion: Q2_K 3,9 GB; Q3_K_S 4,4 GB; Q3_K_M 4,7 GB; Q3_K_L 5,0 GB; IQ4_XS 5,3 GB; Q4_K_S 5,5 GB; Q4_K_M 5,7 GB; Q5_K_S 6,4 GB; Q5_K_M 6,6 GB; Q6_K 7,5 GB; Q8_0 9,6 GB; f16 18,0 GB.
- A esta cifra hay que sumar la cache KV (proporcional a la longitud de contexto, cuyo valor no esta disponible), el overhead del runtime y, si se usa vision, entre 0,7 GB (mmproj-Q8_0) y 1,0 GB (mmproj-f16) adicionales.
- GPU de consumo: Q4_K_M y Q4_K_S caben en tarjetas de 8 GB (por ejemplo RTX 3060 Ti, RTX 4060, RTX 2070) con contexto moderado; Q5_K_M y Q6_K requieren 10-12 GB (RTX 3080, RTX 4070 Ti, RTX 4080); Q8_0 necesita 12-16 GB (RTX 4080, RTX 4090, RTX 3090).
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S pueden alojar cualquier cuantizacion, incluida f16, con contextos amplios o varios procesos concurrentes.
- Despliegue en CPU y sistemas mixtos: Q2_K a Q4_K_M son viables con RAM suficiente (se recomienda al menos el tamano de los pesos mas margen para la cache KV); las cuantizaciones pequenas permiten ejecucion integra en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python y servidores compatibles con GGUF. Para vision es obligatorio cargar el fichero mmproj correspondiente y usar un runtime con soporte multimodal; el soporte de mmproj varia entre implementaciones.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este repositorio.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Formato | Licencia | Benchmarks | Notas |
|---|---|---|---|---|---|---|
| hsjdjejejeieieieie/Ornith-1.5-9B-uncensored-GGUF (este modelo) | 8,95 B | No disponible | GGUF (12 cuantizaciones + 2 mmproj) | Apache 2.0 | No disponible | Republicacion de las cuantizaciones de mradermacher; 0 descargas |
| junafinity/Ornith-1.5-9B-uncensored (modelo base) | 8,95 B | No disponible | Safetensors / transformers | Apache 2.0 | No disponible | Origen de las cuantizaciones; multimodal (vision) |
| mradermacher/Ornith-1.5-9B-uncensored-GGUF | 8,95 B | No disponible | GGUF estatico | Apache 2.0 | No disponible | Repositorio de referencia citado en la model card |
| mradermacher/Ornith-1.5-9B-uncensored-i1-GGUF | 8,95 B | No disponible | GGUF con cuantizacion imatrix | Apache 2.0 | No disponible | Variante ponderada, habitualmente con mejor relacion tamano/calidad que las estaticas |

No se dispone de datos verificables de benchmarks ni de contexto para establecer una comparacion cuantitativa con otras alternativas de ~9B, por lo que cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias
- El caracter "abliterated" y "uncensored" implica que el modelo no aplica los mecanismos de rechazo habituales; puede generar contenido ofensivo, ilegal o danino, y no es adecuado para aplicaciones orientadas al publico sin una capa de moderacion adicional.
- La ablacion de direcciones de rechazo suele degradar la coherencia general y aumentar la tasa de respuestas erroneas o divagantes respecto al modelo original; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Riesgo de alucinacion propio de un modelo denso de 9B sin datos de evaluacion publicados; no hay verificacion independiente de fidelidad factica.
- Idioma: solo se declara ingles. El uso en castellano no esta respaldado por la model card y previsiblemente ofrecera un rendimiento inferior.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin medirla experimentalmente.
- Trazabilidad limitada: el repositorio lo publica una cuenta distinta a la del cuantizador citado en el README, los enlaces internos de la model card apuntan a ficheros de mradermacher y no se incluye una lista de ficheros propia verificada. Conviene comprobar los hashes antes de usar los pesos.
- Licencia Apache 2.0 declarada tanto en el repositorio como en la model card, lo que en principio permite uso comercial, pero la licencia del modelo base subyacente de la familia Qwen 3.5 deberia verificarse de forma independiente antes de un despliegue en produccion.
- Los tags "qwen3_5" no constituyen una confirmacion oficial de la arquitectura; si el modelo base deriva de una familia con licencia especifica, las condiciones podrian no coincidir con la declarada.
- Sin adopcion registrada (0 descargas, 0 likes) y con fecha de creacion en septiembre de 2026: no hay informes de terceros sobre estabilidad, calidad o compatibilidad de runtime.
- El soporte multimodal depende del runtime: muchos clientes GGUF no cargan mmproj o lo hacen con limitaciones, de modo que la capacidad de vision puede no estar disponible en todas las herramientas.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/hsjdjejejeieieieie/Ornith-1.5-9B-uncensored-GGUF
- Modelo base: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Cuantizaciones estaticas de referencia (mradermacher): https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-GGUF
- Cuantizaciones ponderadas/imatrix (i1): https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-i1-GGUF
- Pagina resumen de cuantizaciones: https://hf.tst.eu/model#Ornith-1.5-9B-uncensored-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de ficheros GGUF (referencia de TheBloke citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a foros sin relacion con el contenido de esta ficha.
