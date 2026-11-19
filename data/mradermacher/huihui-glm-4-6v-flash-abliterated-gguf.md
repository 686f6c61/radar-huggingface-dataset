# mradermacher/Huihui-GLM-4.6V-Flash-abliterated-GGUF

## Resumen

Huihui-GLM-4.6V-Flash-abliterated-GGUF es una distribucion en formato GGUF del modelo multimodal Huihui-GLM-4.6V-Flash-abliterated, publicada por el usuario mradermacher. El modelo subyacente es una variante "abliterated" (con las direcciones de rechazo eliminadas mediante edicion de pesos) del GLM-4.6V-Flash, un modelo vision-lenguaje de la familia GLM desarrollada por Zhipu AI. Esta version GGUF esta pensada para inferencia local y en CPU/GPU de consumo mediante llama.cpp y herramientas compatibles.

El modelo cuenta con 9.400 millones de parametros (dato real obtenido de los safetensors del modelo base) y esta orientado a conversacion multimodal, con soporte de imagenes a traves de un proyector multimodal (mmproj) que se distribuye como fichero separado. Los idiomas declarados son chino (zh) e ingles (en). La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo vision-lenguaje de ~9.4B, una variante sin censura (abliterated) y cuantizaciones GGUF listas para ejecucion local. Esto lo hace util para investigadores que estudian comportamiento de modelos sin rechazo, para tareas de generacion creativa sin filtros y para despliegues en hardware modesto donde un modelo multimodal de este tamano cabe en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje); detalles internos no disponibles |
| Parametros totales | 9.400.279.040 (~9.4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | zh, en |
| Licencia | MIT |
| Formato de pesos | GGUF (con fichero mmproj separado para el componente multimodal) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Se trata de un modelo de la familia GLM-4.6V-Flash, que por su denominacion y por la presencia de un fichero mmproj se confirma como un modelo vision-lenguaje: un transformer de lenguaje acoplado a un codificador visual mediante un proyector multimodal. El modelo base procede de huihui-ai/Huihui-GLM-4.6V-Flash-abliterated, que a su vez deriva del GLM-4.6V-Flash de Zhipu AI.

La variante "abliterated" implica que se han aplicado tecnicas de edicion de pesos (tipicamente ablacion de direcciones en el espacio de activaciones) para eliminar el comportamiento de rechazo del modelo original, produciendo un modelo "uncensored". No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La cuantizacion ha sido realizada por mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye variantes estaticas en este repositorio y variantes con imatrix en un repositorio separado (sufijo -i1-GGUF).

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles.
- Comprension de imagenes (vision) mediante el proyector multimodal mmproj, que debe cargarse junto al modelo.
- Generacion sin filtros de rechazo gracias a la ablacion aplicada sobre el modelo base (comportamiento "uncensored").
- Razonamiento y respuesta a instrucciones de caracter general, heredadas del modelo GLM-4.6V-Flash.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a los idiomas declarados (zh, en); no se declara soporte para castellano.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre comportamiento de modelos sin rechazo: el modelo permite estudiar como la ablacion afecta la distribucion de respuestas, la coherencia y la utilidad en tareas sensibles, comparandolo con el modelo base no abliterated.
- Generacion creativa sin restricciones de contenido: escritura de ficcion, guiones o narrativa que requiera tematica adulta o exploracion de temas que el modelo original rechazaria; el modelo cabe en una GPU de consumo en Q4_K_M (6.3 GB).
- Descripcion de imagenes y analisis visual local: carga del modelo junto al mmproj Q8_0 (1.1 GB) en llama.cpp permite captioning, extraccion de informacion de capturas o analisis de documentos escaneados sin enviar datos a servicios externos.
- Asistente conversacional en chino e ingles sobre hardware modesto: con cuantizacion Q4_K_S (5.9 GB) puede ejecutarse en una RTX 3060 de 12 GB o en Apple Silicon con memoria unificada, ofreciendo conversacion multi-turno con contexto local.
- Prototipado de pipelines multimodales en investigacion: el par modelo + mmproj en GGUF simplifica la integracion en experimentos con llama.cpp o bindings Python, sin necesidad de infraestructura de GPU de datacenter.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion mas dos de mmproj, lo que permite medir el impacto de la cuantizacion en calidad y velocidad sobre un mismo modelo multimodal de 9.4B.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT facilita el uso en productos comerciales internos sin obligaciones de atribucion mas alla de conservar el aviso de copyright.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ~4.1 GB, Q3_K_S ~4.7 GB, Q3_K_M ~5.1 GB, Q3_K_L ~5.3 GB, IQ4_XS ~5.4 GB, Q4_K_S ~5.9 GB, Q4_K_M ~6.3 GB, Q5_K_S ~6.8 GB, Q5_K_M ~7.2 GB, Q6_K ~8.4 GB, Q8_0 ~10.1 GB, f16 ~18.9 GB.
- Componente multimodal adicional: mmproj Q8_0 ~1.1 GB o mmproj f16 ~1.9 GB, que se suma al presupuesto de memoria.
- GPU recomendadas: para f16 o Q8_0, GPU con 24 GB o mas (RTX 3090, RTX 4090, A100, H100); para Q6_K o Q5_K_M, GPU de 12-16 GB (RTX 4070 Ti Super, RTX 4080); para Q4_K_M con mmproj Q8_0, aproximadamente 8 GB de VRAM efectiva mas overhead de contexto.
- Cabe en GPU de consumo: si. Q4_K_S o Q4_K_M caben en RTX 3060 12 GB, RTX 4060 Ti 16 GB y en Apple Silicon con 16 GB de memoria unificada. Las cuantizaciones Q2_K y Q3_K_S pueden caber en GPUs de 6-8 GB, con perdida de calidad apreciable.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (mediante importacion de Modelfile), bindings Python (llama-cpp-python), y cualquier runtime compatible con GGUF. El repositorio declara el tag endpoints_compatible, lo que sugiere compatibilidad con endpoints de inferencia tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa para este modelo segun la informacion disponible.
- Latencia y throughput estimados: no disponibles. Como referencia general para un modelo de 9.4B en Q4_K_M sobre una RTX 4090, cabe esperar decenas de tokens por segundo, pero no se aportan mediciones en la documentacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Huihui-GLM-4.6V-Flash-abliterated-GGUF (este) | ~9.4B | no disponible | si (mmproj) | MIT | GGUF | Variante sin censura, cuantizada por mradermacher |
| Huihui-GLM-4.6V-Flash-abliterated (base) | ~9.4B | no disponible | si | MIT | safetensors | Pesos originales sin cuantizar, requiere transformers |
| GLM-4.6V-Flash (original Zhipu) | no disponible | no disponible | si | no disponible | no disponible | Modelo de referencia con filtros de rechazo activos |
| Variantes GGUF con imatrix (mradermacher -i1-GGUF) | ~9.4B | no disponible | si | MIT | GGUF | Misma base con cuantizaciones ponderadas de mayor calidad |

## Limitaciones y advertencias

- El modelo ha sido sometido a ablacion para eliminar el rechazo; esto puede degradar la coherencia, la utilidad general y la capacidad de seguir instrucciones de seguridad, y no garantiza la ausencia total de respuestas problematicas.
- Riesgo elevado de generar contenido danino, sesgado o inexacto sin advertencia; no es adecuado para despliegues orientados al publico sin moderacion externa.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; la ablacion puede incrementarlo al eliminar parte de las respuestas de cautela.
- Soporte limitado a chino e ingles; no se declara ni garantiza calidad en castellano.
- La longitud de contexto no esta documentada, por lo que no puede planificarse su uso en tareas de contexto largo sin verificacion empirica.
- La licencia MIT del repositorio GGUF cubre la distribucion, pero el modelo base y el original de Zhipu pueden tener terminos adicionales no reflejados en la model card; conviene verificar la licencia del modelo GLM original antes de uso comercial.
- El repositorio ocupa 89.7 GB por incluir todas las cuantizaciones; la descarga debe limitarse a los ficheros necesarios.
- No hay resultados de benchmarks publicados, por lo que la calidad relativa frente a alternativas no puede evaluarse con datos objetivos.
- El componente visual requiere cargar el fichero mmproj por separado; olvidarlo desactiva la capacidad multimodal de forma silenciosa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Huihui-GLM-4.6V-Flash-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-GLM-4.6V-Flash-abliterated
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Huihui-GLM-4.6V-Flash-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Huihui-GLM-4.6V-Flash-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
