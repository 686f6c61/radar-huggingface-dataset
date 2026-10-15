# mradermacher/K2-Horizon-32B-heretic-i1-GGUF

## Resumen

K2-Horizon-32B-heretic-i1-GGUF es la version cuantizada en formato GGUF de soyaakinohara/K2-Horizon-32B-heretic, un transformer denso de 34.779.304.960 parametros (unos 34,8 mil millones) publicado bajo licencia Apache 2.0. La cuantizacion la firma mradermacher, que aplica el metodo i1 (imatrix, cuantizacion ponderada por importancia de los tensores) sobre los pesos originales en bf16 para generar una bateria de archivos que cubren desde IQ1_S hasta Q6_K. El repositorio ocupa 113,6 GB en total e incluye tambien el fichero imatrix necesario para crear cuantizaciones propias.

El modelo pertenece a la familia de los denominados "heretic" o abliterated: lleva aplicada una eliminacion de rechazos (refusal-removed), de modo que no declina peticiones que un modelo alineado convencionalmente rechazaria. Esto lo orienta a experimentacion local, investigacion sobre comportamiento de modelos sin alineamiento y generacion de contenido sin filtros, no a entornos de produccion sin capas de moderacion externas.

Su relevancia practica esta en el formato: al ser GGUF cuantizado con imatrix, se puede ejecutar en hardware de consumo mediante llama.cpp, Ollama o LM Studio, sin necesidad de GPUs de datacenter. Los datos publicados no incluyen informacion sobre arquitectura interna detallada, longitud de contexto ni composicion del dataset de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiquetado como "dense" en el repo; no se detalla la variante exacta en la model card) |
| Parametros totales | 34.779.304.960 (34,8 mil millones) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1/imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K. Existe tambien un repo de quants estaticos sin imatrix |
| Idiomas soportados | Ingles (en) y multilingue (multilingual, sin listado de idiomas concreto) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo). El modelo base esta en bf16, presumiblemente safetensors |
| Tamano del repositorio | 113,6 GB |
| Modelo base | soyaakinohara/K2-Horizon-32B-heretic |
| Cuantizador | mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf) |
| Tamano de ficheros publicados | Q2_K: 13,4 GB; IQ3_M: 16,1 GB; Q4_K_S: 20,1 GB; fichero imatrix: 0,1 GB (otras cuantizaciones listadas sin tamano publicado) |
| Etiquetas relevantes | uncensored, refusal-removed, heretic, conversational, custom_code, endpoints_compatible |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no aporta informacion sobre la arquitectura interna mas alla de la etiqueta "dense" y de la referencia a "custom_code" en las etiquetas, lo que sugiere que el modelo base requiere codigo personalizado para cargarse (probablemente definiciones de atencion o de capas no presentes en versiones estandar de transformers). Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias en el modelo original.

Lo unico verificable sobre el proceso de este repositorio es la fase de cuantizacion: mradermacher ha generado los ficheros con cuantizacion ponderada por importancia (imatrix), una tecnica que estima la importancia de cada tensor a partir de activaciones recogidas con un corpus de calibracion y ajusta el error de cuantizacion en consecuencia. El resultado practico es que las cuantizaciones de baja precision (IQ2, IQ3) conservan mas calidad que sus equivalentes estaticos del mismo tamano. El autor declara el uso de un supercomputador cedido por el colaborador @nicoboss para producir el volumen de variantes IQ publicadas, e indica que la version del script de cuantizacion es la 2.

De la naturaleza "heretic" se deduce que el modelo base ha sufrido algun proceso de abliteration o eliminacion de direcciones de rechazo en el espacio de activaciones, pero no se especifica la metodologia concreta ni el grado de intervencion.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta "conversational").
- Generacion sin rechazos: no aplica mecanismos de negativa ante peticiones que un modelo alineado rechazaria, al haberse eliminado la direccion de rechazo.
- Soporte multilingue declarado, aunque solo el ingles esta confirmado de forma explicita en la etiqueta de idioma.
- Compatibilidad con endpoints de inferencia (etiqueta "endpoints_compatible"), lo que implica que puede servirse a traves de APIs compatibles con OpenAI.
- Carga mediante codigo personalizado (custom_code), lo que puede requerir confiar en implementaciones remotas del repositorio base.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido (thinking mode).
- No hay evidencia de capacidades especificas de codigo o matematicas mas alla de las inherentes a un modelo de su tamano.

## Casos de uso

- Ejecucion local en estacion de trabajo: cargar la cuantizacion Q4_K_S (20,1 GB) con llama.cpp u Ollama para disponer de un modelo de 34,8B parametros sin depender de APIs externas ni de conectividad.
- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se comporta un transformer de gran tamano cuando se le eliminan los rechazos, comparando sus respuestas con las del modelo base no modificado.
- Generacion de ficcion y contenido creativo sin restricciones tematicas: utiles en escritura de narrativa adulta o temas sensibles donde los modelos convencionales aplican filtros.
- Evaluacion de cuantizaciones: al publicarse 25 variantes de cuantizacion distintas, sirve como banco de pruebas para medir la degradacion de perplejidad y calidad entre IQ1_S y Q6_K sobre el mismo modelo.
- Despliegue en servidor de inferencia con API compatible: gracias a la etiqueta endpoints_compatible, se puede exponer como servicio HTTP y consumirlo desde aplicaciones cliente con el esquema de OpenAI.
- Procesamiento por lotes de textos largos en ingles: para tareas de reescritura, resumen o clasificacion sobre corpus ingleses, siempre que se verifique previamente la ventana de contexto real del modelo base.
- Base para ajuste fino posterior (fine-tuning): al ser Apache 2.0 y estar disponible en bf16, permite derivar variantes propias con LoRA o QLoRA, aunque no se documenta el formato exacto de los pesos originales.
- Prototipado de asistentes conversacionales internos donde se quiera control total del contenido generado y se disponga de filtros propios en la capa de aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio cuantizado no incluye ninguna tabla de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni metricas equivalentes, ni para el modelo base ni para las cuantizaciones. El unico dato de rendimiento mencionado es el grafico comparativo de perplejidad entre tipos de cuantizacion enlazado por el autor (https://www.nethype.de/huggingface_embed/quantpplgraph.png), que compara tipos de cuantizacion de forma generica y no resultados de tareas del modelo.

## Requisitos de hardware

- Peso de los ficheros publicados: Q2_K 13,4 GB; IQ3_M 16,1 GB; Q4_K_S 20,1 GB. Los tamanos del resto de cuantizaciones no estan publicados en la informacion disponible.
- Modelo base en bf16 (estimacion a partir del numero de parametros): aproximadamente 69,6 GB solo en pesos, mas cache KV y overhead, lo que situa el requisito en torno a 75-85 GB de VRAM en funcion de la longitud de contexto.
- VRAM estimada para inferencia en GGUF (estimacion propia a partir del tamano de fichero, sumando cache KV y overhead): Q2_K en torno a 15-18 GB, IQ3_M en torno a 18-21 GB, Q4_K_S en torno a 22-26 GB.
- GPU de datacenter: A100 80 GB, H100 80 GB o 2x A100 40 GB para el modelo en bf16; una sola A100 40 GB es suficiente para las cuantizaciones Q4 y superiores.
- GPU de consumo: Q4_K_S cabe en RTX 3090, RTX 4090, RTX 5090 (24-32 GB) y en cualquier GPU de 24 GB o mas. IQ3_M y Q2_K caben en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4080, A4000) con margen justo, y en 12 GB solo con offload parcial de capas a CPU.
- Configuraciones por debajo de 12 GB: obligan a descargar parte de las capas a RAM mediante llama.cpp, con caida de velocidad proporcional al numero de capas en CPU.
- Opciones de despliegue: llama.cpp (llama-cli / llama-server), Ollama mediante importacion del GGUF, LM Studio, text-generation-webui. El soporte de GGUF en vLLM es experimental y puede no cubrir todas las variantes IQ. TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponibles. Dependen de la cuantizacion, la GPU y la longitud de contexto, y no se publican mediciones en la informacion facilitada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| K2-Horizon-32B-heretic-i1-GGUF | 34,8 B | No disponible | Apache 2.0 | GGUF imatrix y estatico; modelo base en bf16 |
| Qwen2.5-32B-Instruct | ~32,5 B | 131.072 tokens | Apache 2.0 | Safetensors originales y multiples GGUF de terceros |
| Mistral Small 3.1 24B Instruct | ~23,6 B | 128.000 tokens | Apache 2.0 | Safetensors y GGUF oficiales y de terceros |
| Gemma 3 27B IT | 27 B | 128.000 tokens | Terminos de uso propios de Gemma | Safetensors y GGUF de terceros |

Nota: los datos de contexto, parametros y licencia de los tres modelos comparables provienen de sus model cards publicas y no de la informacion proporcionada en esta busqueda. No se dispone de cifras de benchmarks comparativos para K2-Horizon-32B-heretic, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. La diferencia funcional clave es que K2-Horizon-32B-heretic es un modelo con rechazos eliminados, mientras que los tres alternativos mantienen el alineamiento estandar.

## Limitaciones y advertencias

- Modelo con rechazos eliminados (refusal-removed / uncensored): no aplica negativas ante peticiones daninas, ilegales o eticamente problematicas. No debe exponerse a usuarios finales sin una capa de moderacion propia.
- Sesgos: no hay informacion sobre el dataset de entrenamiento ni sobre evaluaciones de sesgo. Al no existir filtros de alineamiento, los sesgos presentes en el corpus original pueden aflorar con mas facilidad.
- Alucinacion: riesgo estandar de un modelo de 34,8B sin benchmarks publicados que respalden su fidelidad factual. No se ha verificado su comportamiento en tareas de recuperacion de hechos.
- Contexto desconocido: la longitud de ventana no esta documentada, lo que impide planificar tareas de contexto largo con garantias. Hay que medirla empiricamente antes de usarla en produccion.
- Idiomas: solo el ingles esta declarado de forma explicita. La etiqueta "multilingual" no viene acompanada de lista de idiomas ni de evaluaciones por idioma, por lo que el rendimiento en castellano es desconocido.
- Cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS) degradan notablemente la calidad. El propio autor advierte en la tabla que, para el nivel de Q2_K, IQ3_XXS suele ser preferible.
- Codigo personalizado: la etiqueta custom_code implica que la carga del modelo base puede requerir ejecutar codigo del repositorio remoto, lo que supone un riesgo de seguridad si no se audita.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones de copyleft, pero la responsabilidad legal sobre el contenido generado recae integramente en quien despliega el modelo.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, con fecha de creacion en octubre de 2026 y sin validacion independiente de la comunidad.
- La busqueda web realizada no ha devuelto ninguna fuente tecnica relevante sobre este modelo: los resultados obtenidos son dominios de contenido para adultos sin relacion con el modelo, por lo que no aportan informacion verificable.

## Enlaces

- Repositorio GGUF consultado: https://huggingface.co/mradermacher/K2-Horizon-32B-heretic-i1-GGUF
- Modelo base: https://huggingface.co/soyaakinohara/K2-Horizon-32B-heretic
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/K2-Horizon-32B-heretic-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#K2-Horizon-32B-heretic-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/K2-Horizon-32B-heretic-i1-GGUF/resolve/main/K2-Horizon-32B-heretic.imatrix.gguf
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa que cede la infraestructura al cuantizador: https://www.nethype.de/
