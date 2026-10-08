# mradermacher/Webs-KoReasoner-27B-v1-GGUF

## Resumen

Webs-KoReasoner-27B-v1-GGUF es la version cuantizada en formato GGUF del modelo websfactory/Webs-KoReasoner-27B-v1, publicada por mradermacher, un autor conocido en el ecosistema por generar cuantizaciones estaticas y con imatrix de modelos abiertos. No se trata por tanto de un modelo entrenado desde cero, sino de un artefacto de distribucion: el autor original del modelo es websfactory, mientras que mradermacher se encarga de convertir los pesos a GGUF y de ofrecer multiples niveles de compresion para su uso en llama.cpp y derivados.

El modelo subyacente es un merge construido con la tecnica DARE-TIES, orientado a razonamiento y con soporte declarado de coreano (ko) e ingles (en). Cuenta con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones) segun los pesos en safetensors, y su licencia es Apache 2.0. Las etiquetas del repositorio incluyen `qwen3_5`, lo que sugiere que la familia base del merge esta relacionada con esa linea de modelos, si bien la informacion disponible no detalla la composicion exacta de los modelos fusionados.

Su relevancia practica es doble: por un lado, ofrece acceso a un modelo de razonamiento bilingue coreano-ingles en un rango de 27B, poco cubierto por los modelos mainstream; por otro, la publicacion de cuantizaciones desde Q2_K hasta Q8_0 (y una variante adicional con imatrix) permite desplegarlo en hardware de consumo con compromisos de calidad controlados. El repositorio pesa 190,8 GB en total y acumula 204 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo resultante de un merge con DARE-TIES; la model card no especifica la arquitectura interna) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-Q8_0 y mmproj-f16; versiones con imatrix en mradermacher/Webs-KoReasoner-27B-v1-i1-GGUF |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo base) y GGUF (este repositorio) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico documentado es que websfactory/Webs-KoReasoner-27B-v1 es un merge, no un entrenamiento desde cero, y que la fusion se realizo con la tecnica DARE-TIES (Drop And REscale combinado con TIES merging), un metodo habitual para combinar pesos de varios modelos eliminando parametros redundantes y resolviendo conflictos de signo entre tensores. La etiqueta `qwen3_5` en la model card apunta a que al menos parte del material fusionado procede de esa familia, pero no se especifica que modelos concretos se combinaron ni sus proporciones.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de ajuste por preferencias (RLHF, DPO u otras). La orientacion declarada del modelo es el razonamiento, junto con capacidades bilingues coreano-ingles. La presencia de ficheros `mmproj` (projector multimodal) en el repositorio sugiere que el modelo base incorpora algun tipo de soporte multimodal, presumiblemente vision, aunque no se detalla su alcance ni su rendimiento. No se ha publicado informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Razonamiento: es la capacidad que da nombre y proposito declarado al modelo (`reasoning`).
- Soporte bilingue coreano-ingles, con ambos idiomas listados explicitamente.
- Indicios de capacidad multimodal: el repositorio incluye ficheros `mmproj-Q8_0` y `mmproj-f16`, etiquetados como "multi-modal supplement". No se especifica que modalidad cubren ni con que calidad.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el modelo puede servirse a traves de la infraestructura de Inference Endpoints de HuggingFace.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque la orientacion a razonamiento lo hace plausible; no hay confirmacion documental.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Asistencia conversacional en coreano: el modelo esta etiquetado como `conversational` y soporta `ko`, por lo que puede emplearse como backend de chatbots orientados al mercado coreano, un idioma con cobertura limitada en modelos abiertos de este tamano.
- Traduccion coreano-ingles asistida: con ambos idiomas declarados, puede utilizarse en pipelines de traduccion o posedicion, especialmente en dominios tecnicos donde conviene mantener terminologia consistente.
- Razonamiento sobre documentacion tecnica: al estar orientado a razonamiento, es adecuado para tareas de analisis de documentos, resumen con inferencia y respuesta a preguntas sobre textos largos en coreano o ingles.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_S y Q4_K_M (15,9 GB y 16,9 GB) permiten ejecutar el modelo completo en GPU con 24 GB de VRAM, algo inviable con los pesos en f16.
- Servicio con restricciones de memoria: la cuantizacion Q2_K, con solo 11,0 GB, posibilita el despliegue en equipos modestos o en instancias cloud economicas, aceptando una perdida de calidad notable.
- Generacion aumentada por recuperacion (RAG) en coreano: integrable con llama.cpp u Ollama como motor de generacion dentro de un sistema RAG que reciba contexto recuperado de bases documentales en coreano.
- Evaluacion comparativa de tecnicas de merge: el modelo resulta util como objeto de estudio para investigadores que analicen el comportamiento de fusiones DARE-TIES frente a modelos entrenados de forma convencional en tareas de razonamiento bilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de HuggingFace incluyen cifras de MMLU, HumanEval, GSM8K, KMMLU ni de ninguna otra evaluacion. Tampoco se dispone de comparaciones numericas frente a modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia a contexto corto, calculada a partir del tamano de cada fichero GGUF mas el overhead de contexto y cache KV (valores orientativos):
  - Q2_K (11,0 GB): aproximadamente 12-13 GB de VRAM.
  - Q3_K_S (12,4 GB): aproximadamente 14-15 GB.
  - Q3_K_M (13,6 GB): aproximadamente 15-16 GB.
  - Q3_K_L (14,7 GB): aproximadamente 16-17 GB.
  - IQ4_XS (15,5 GB): aproximadamente 17-18 GB.
  - Q4_K_S (15,9 GB): aproximadamente 17-18 GB.
  - Q4_K_M (16,9 GB): aproximadamente 18-20 GB.
  - Q5_K_S (19,1 GB): aproximadamente 21-22 GB.
  - Q5_K_M (19,6 GB): aproximadamente 21-23 GB.
  - Q6_K (22,5 GB): aproximadamente 24-26 GB.
  - Q8_0 (29,1 GB): aproximadamente 31-33 GB.
- GPU recomendadas: para Q4_K_M o inferiores, una RTX 3090 o RTX 4090 con 24 GB resulta suficiente para offload completo de capas. Para Q5_K_M y Q6_K conviene una A6000, L40S o similar con 48 GB, o bien repartir capas entre CPU y GPU. Para Q8_0 se recomienda A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas para las cuantizaciones mas agresivas, y en tarjetas de 24 GB (RTX 3090, 4090, 5090) con Q4_K_M o inferiores. Los ficheros Q2_K y Q3_K_S permiten incluso configuraciones hibridas CPU/GPU en equipos con 16 GB de RAM y GPUs de gama media.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, text-generation-webui y servidores compatibles con GGUF. Para el modelo original en safetensors se requeriria vLLM o TGI, pero esos motores no consumen directamente los ficheros GGUF de este repositorio.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo para ninguna de las cuantizaciones.

Nota sobre los ficheros mmproj: si se desea utilizar la componente multimodal, es necesario descargar adicionalmente `Webs-KoReasoner-27B-v1.mmproj-Q8_0.gguf` (0,7 GB) o `Webs-KoReasoner-27B-v1.mmproj-f16.gguf` (1,0 GB) junto con el fichero del modelo. El soporte practico dependera del runtime empleado.

## Comparativa con modelos similares

La informacion disponible no incluye datos de rendimiento, por lo que la comparacion se limita a caracteristicas objetivas del repositorio. No se dispone de resultados de benchmarks para ninguno de los modelos de la tabla, y los datos de las alternativas corresponden a conocimiento general de sus fichas publicas, no a mediciones realizadas sobre este modelo.

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Webs-KoReasoner-27B-v1-GGUF | 27,3B | GGUF (12 niveles de cuantizacion + imatrix) | ko, en | Apache 2.0 | Cuantizacion del merge de websfactory |
| websfactory/Webs-KoReasoner-27B-v1 | 27,3B | safetensors | ko, en | Apache 2.0 | Modelo base sin cuantizar |
| mradermacher/Webs-KoReasoner-27B-v1-i1-GGUF | 27,3B | GGUF con imatrix | ko, en | Apache 2.0 | Variante con calibracion por importancia |

No se dispone de informacion suficiente para comparar con modelos de otros autores (parametros activos, contexto, rendimiento y disponibilidad de alternativas coreano-ingles de este rango) a partir de los datos proporcionados.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada que permita estimar la calidad real del modelo en razonamiento, generacion de codigo o matematicas. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala, y agravado por la falta de documentacion sobre el dataset de entrenamiento y sobre posibles etapas de alineacion.
- Sesgos conocidos: no disponible. Al no documentarse los datos de entrenamiento ni el proceso de fusion, no es posible caracterizar los sesgos del modelo.
- Cobertura idiomatica limitada: solo se declaran coreano e ingles. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Longitud de contexto desconocida: no se especifica la ventana de contexto soportada, lo que impide planificar despliegues que dependan de contexto largo. Ademas, en cuantizaciones bajas (Q2_K, Q3_K) la degradacion de calidad en contextos largos suele ser mas acusada.
- Naturaleza de merge: al ser una fusion DARE-TIES y no un entrenamiento, pueden aparecer comportamientos inconsistentes o degradacion en dominios especificos respecto a los modelos originales fusionados.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya la autoria. Es responsabilidad del usuario verificar que los modelos fusionados en el merge original no impongan condiciones adicionales.
- Valoracion de la comunidad: 204 descargas y 0 likes indican una adopcion muy baja, con escasa validacion externa del comportamiento del modelo.
- Los ficheros GGUF no son compatibles con vLLM ni TGI de forma nativa; para esos motores habria que recurrir al modelo base en safetensors.
- La componente multimodal solo esta sugerida por la presencia de los ficheros mmproj; no hay documentacion sobre que modalidades cubre ni su calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Webs-KoReasoner-27B-v1-GGUF
- Modelo base: https://huggingface.co/websfactory/Webs-KoReasoner-27B-v1
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Webs-KoReasoner-27B-v1-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Webs-KoReasoner-27B-v1-GGUF
- Peticiones de cuantizacion y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- No se han encontrado papers, blogs tecnicos ni demos adicionales en la busqueda web realizada.
