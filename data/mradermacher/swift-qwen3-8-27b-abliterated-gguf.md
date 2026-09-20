# mradermacher/Swift-Qwen3.8-27B-Abliterated-GGUF

## Resumen

Swift-Qwen3.8-27B-Abliterated-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo andrewting/Swift-Qwen3.8-27B-Abliterated, publicada por el usuario mradermacher. Se trata, por tanto, de una conversion de pesos orientada a inferencia local y a consumo en CPU/GPU de gama de consumo, no de un modelo entrenado desde cero. El modelo subyacente cuenta con 27.320.697.856 parametros (unos 27,3 mil millones) y las etiquetas de la ficha lo situan en la familia Qwen3 (qwen3_8, qwen3_5), con capacidades declaradas de razonamiento y de vision-lenguaje.

La caracteristica diferencial del modelo base es su condicion de "abliterated" o "refusal-reduced": se ha modificado para reducir los comportamientos de rechazo tipicos de los modelos alineados. Esto lo hace relevante para equipos que investigan el comportamiento de modelos desalineados, para tareas creativas o de rol donde los filtros estandar resultan intrusivos, y para estudios de seguridad sobre robustez de la alineacion. Es, en cambio, un artefacto con implicaciones claras de riesgo si se despliega sin supervision.

La publicacion incluye cuantizaciones desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), ademas de dos ficheros mmproj (Q8_0 y f16) que aportan el componente multimodal. El repositorio completo ocupa 190,8 GB. La model card no documenta longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones habituales quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; las etiquetas indican familia Qwen3 (qwen3_8, qwen3_5) con modulo vision-language. Transformer decoder-only (inferido de la familia), sin confirmacion explicita |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; mas mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | Ingles (en) |
| Licencia | swift-open-license-1.0 (etiquetada como license: other, con enlace al texto de licencia en el repositorio del modelo base) |
| Formato de pesos | GGUF (cuantizado), con ficheros mmproj separados para vision; el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card de esta publicacion no aporta informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento. Lo unico deducible de los metadatos es que se trata de una cuantizacion estatica de andrewting/Swift-Qwen3.8-27B-Abliterated, que el autor etiqueta dentro de la familia Qwen3 mediante los tags qwen3_8 y qwen3_5, y que el modelo incorpora un componente de vision-lenguaje, evidenciado por la presencia de los ficheros mmproj (multi-modal projector) en el repositorio.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o similares. Tampoco se documenta la metodologia concreta de "abliteration" empleada (el termino se refiere habitualmente a la eliminacion o proyeccion de direcciones de activacion asociadas al rechazo). El proceso de cuantizacion si se describe parcialmente: cuantizacion estatica, sin ficheros de importancia (imatrix) ni cuantizaciones ponderadas en el momento de la publicacion, segun indica el propio autor. Se incluye un grafico externo de ikawrakow comparando la perplejidad de distintos tipos de cuantizacion de baja calidad.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado como "conversational" y "text-generation".
- Razonamiento (tag reasoning), presumiblemente con modos de pensamiento extendido, aunque no se detalla su funcionamiento.
- Vision-lenguaje: el repositorio incluye proyectores mmproj, lo que habilita entrada de imagenes cuando se cargan junto al modelo principal.
- Comportamiento con rechazo reducido (abliterated, refusal-reduced): menor probabilidad de declinar peticiones que un modelo alineado equivalente.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas declarado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar empiricamente como se comporta un modelo con los mecanismos de rechazo atenuados, comparandolo con su version alineada para medir el efecto de la abliteration sobre utilidad, coherencia y tasas de cumplimiento.
- Redaccion creativa y ficcion sin filtros intrusivos: para guiones, narrativa de genero o dialogos donde los modelos convencionales rechazan tematicas adultas o conflictivas; el formato GGUF permite ejecutarlo en una estacion de trabajo local.
- Analisis de documentos con imagenes en local: cargando el modelo junto al fichero mmproj adecuado, se pueden procesar capturas, diagramas o documentos escaneados y generar descripciones o extracciones de texto en un entorno sin conexion.
- Asistente personal autoalojado: con una cuantizacion Q4_K_M (16,9 GB) cabe en una GPU de 24 GB y permite mantener un asistente conversacional privado, sin enviar datos a terceros.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes de cuantizacion mas dos proyectores, lo que lo convierte en un banco de pruebas util para medir el degradado de calidad de Q2_K a Q8_0 sobre un mismo modelo de 27B.
- Docencia y practicas de despliegue: sirve como caso practico para explicar el pipeline llama.cpp/Ollama, la carga de proyectores multimodales y la gestion de memoria en GPUs de consumo.
- Pruebas de estres y red teaming: al ser un modelo con rechazo reducido, es adecuado como sujeto de pruebas controladas para evaluar clasificadores de seguridad y sistemas de moderacion.
- Prototipado de productos de vision-lenguaje sin presupuesto de API: el componente mmproj permite validar una idea de producto multimodal antes de invertir en infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de la busqueda web proporcionada no contienen informacion tecnica relevante sobre el modelo (los enlaces devueltos corresponden a portales de videojuegos sin relacion con el tema).

## Requisitos de hardware

Estimaciones basadas en el tamano de los ficheros publicados por el autor. Hay que sumar el proyector mmproj (0,7 GB para Q8_0 o 1,0 GB para f16) si se usa la entrada de imagenes, mas el espacio de la cache KV, que depende de la longitud de contexto y no puede calcularse aqui porque esta no se especifica.

- Q2_K (11,0 GB): viable en GPUs de 12 GB como la RTX 3060 12 GB o la RTX 4070, con margen ajustado.
- Q3_K_S (12,4 GB) y Q3_K_M (13,6 GB): funcionan en 16 GB (RTX 4080, RTX 4060 Ti 16 GB) y con comodidad en 24 GB. El propio autor marca Q3_K_M como "lower quality".
- Q3_K_L (14,7 GB) y Q4_K_S (15,9 GB): encajan en 16 GB con contexto corto; en 24 GB sobran recursos. El autor recomienda Q4_K_S por velocidad.
- Q4_K_M (16,9 GB): la opcion mas equilibrada segun el autor ("fast, recommended"). Cabe en una RTX 4090 o RTX 3090 de 24 GB dejando espacio para contexto moderado.
- Q5_K_S (19,1 GB): requiere 24 GB para un uso holgado.
- Q6_K (22,5 GB): calidad "very good" segun el autor; en 24 GB obliga a limitar contexto o a descargar capas parcialmente.
- Q8_0 (29,1 GB): necesita 32 GB o mas (A100 40 GB, RTX 6000 Ada, o reparto entre dos GPUs de 24 GB). El autor lo describe como "fast, best quality".
- x-f16: el autor lista el tipo en las etiquetas de cuantizacion, pero no incluye su tamano en la tabla de ficheros; tamano no disponible.
- GPU de referencia para despliegue profesional: A100 40/80 GB, H100, L40S. Para uso individual, RTX 3090/4090 con cuantizaciones Q3-Q4.
- Opciones de despliegue: llama.cpp (incluye soporte de mmproj para el modo vision), Ollama, LM Studio, koboldcpp, llama-cpp-python. vLLM y TGI tienen soporte de GGUF limitado o nulo, por lo que no son la via recomendada para estos ficheros.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Swift-Qwen3.8-27B-Abliterated-GGUF (este) | 27,3 B | No disponible | No disponible | swift-open-license-1.0 | GGUF, 12 cuantizaciones + 2 mmproj |
| andrewting/Swift-Qwen3.8-27B-Abliterated (modelo base) | 27,3 B | No disponible | No disponible | swift-open-license-1.0 | safetensors (transformers) |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion cuantitativa con otros modelos de ~27B. Los resultados de la busqueda web proporcionada no devolvieron informacion tecnica utilizable, por lo que no se incluyen alternativas concretas para no introducir datos no verificados.

## Limitaciones y advertencias

- La naturaleza abliterated implica que el modelo tiene reducida su capa de rechazo. Esto incrementa de forma directa el riesgo de generar contenido danino, ilegal o inseguro, y lo inhabilita para despliegues publicos sin moderacion externa.
- La abliteration suele degradar capacidades generales, coherencia y adherencia a instrucciones. No hay benchmarks en la informacion disponible que permitan cuantificar esa perdida.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad. El modelo puede presentar una tasa de alucinacion mayor tras la modificacion de pesos, un efecto descrito habitualmente en modelos abliterated.
- Idiomas: unicamente ingles declarado. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones largas ni planificar la memoria de la cache KV.
- Licencia swift-open-license-1.0, etiquetada como "other": los terminos exactos no se detallan en la informacion proporcionada y hay que consultar el texto enlazado en el repositorio del modelo base antes de cualquier uso comercial. No se puede afirmar que el uso comercial este permitido.
- Modelo publicado con 0 descargas y 0 likes en el momento de los datos: no hay validacion por parte de la comunidad ni evidencia de uso en produccion.
- Trazabilidad limitada: no se documentan dataset de entrenamiento, proceso de alineacion ni metodologia de abliteration, lo que dificulta auditar sesgos o procedencia de los datos.
- Las estimaciones de hardware de esta ficha derivan del tamano de los ficheros, no de mediciones reales de consumo de VRAM, que sera superior al sumar cache KV y overhead del runtime.
- La cuantizacion Q2_K y, en menor medida, Q3_K_M estan marcadas por el propio autor como de calidad reducida; su uso en tareas de razonamiento o codigo no es recomendable.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Swift-Qwen3.8-27B-Abliterated-GGUF
- Modelo base: https://huggingface.co/andrewting/Swift-Qwen3.8-27B-Abliterated
- Texto de la licencia: https://huggingface.co/andrewting/Swift-Qwen3.8-27B-Abliterated/blob/main/LICENSE
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Swift-Qwen3.8-27B-Abliterated-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio de nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Las URLs devueltas (friv.com, frivclassic.com, friv4school.com, friv.info) corresponden a portales de videojuegos sin relacion con el modelo y se descartan.
