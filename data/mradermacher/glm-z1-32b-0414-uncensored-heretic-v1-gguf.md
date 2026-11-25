# mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v1-GGUF

## Resumen

GLM-Z1-32B-0414-uncensored-heretic-v1-GGUF es una cuantizacion en formato GGUF del modelo llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v1, publicada por el usuario mradermacher. Se trata de una derivacion del modelo GLM-Z1-32B-0414 de Zhipu AI (familia GLM-4), que ha sido sometida a un proceso de "abliteration" (eliminacion de rechazos y capas de alineacion de seguridad) para producir una variante sin censura. El modelo base conserva la arquitectura transformer densa de 32.500 millones de parametros del GLM-Z1 original.

El interes de esta publicacion reside en que ofrece el modelo en multiples niveles de cuantizacion GGUF (desde Q2_K de 12,4 GB hasta Q8_0 de 34,7 GB), lo que permite ejecutarlo en hardware de consumo y en entornos donde no se dispone de GPUs de datacenter. La licencia MIT facilita su uso comercial, aunque la naturaleza "uncensored" del modelo implica riesgos considerables en produccion.

El modelo esta orientado a generacion de texto conversacional en chino e ingles, y su relevancia actual radica en la demanda de modelos locales sin restricciones de contenido para investigacion sobre alineacion, red teaming y aplicaciones donde los filtros de seguridad resultan problematicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de GLM-4 / GLM-Z1) |
| Parametros totales | 32.566.081.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | zh, en |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo subyacente es GLM-Z1-32B-0414, un transformer denso de 32.500 millones de parametros desarrollado por Zhipu AI dentro de la familia GLM-4. La variante "heretic" ha sido modificada mediante tecnicas de abliteration, un proceso que identifica y neutraliza las direcciones de activacion asociadas a comportamientos de rechazo, eliminando efectivamente las capas de alineacion de seguridad del modelo original. El resultado es un modelo que responde a practicamente cualquier prompt sin negativas.

La cuantizacion a GGUF ha sido realizada por mradermacher mediante conversion desde el formato Hugging Face (safetensors) a GGUF, con cuantizaciones estaticas (no imatrix) en el repositorio principal. Existe un repositorio separado con cuantizaciones ponderadas/imatrix (i1-GGUF) para mayor calidad. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original, ya que la model card no los documenta.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles.
- Razonamiento y respuesta a instrucciones sin restricciones de contenido (producto del proceso de abliteration).
- Capacidad de seguir instrucciones complejas heredada del modelo GLM-Z1 original.
- Soporte de conversacion general y tareas de conocimiento.
- No se documenta soporte explicito de tool calling, function calling ni capacidades de agente en la informacion disponible.
- No se documentan capacidades multimodales (vision, audio) en la informacion disponible.
- No se documenta modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un LLM sin capas de rechazo, util para analizar sesgos, jailbreaks y mecanismos de seguridad en entornos controlados de laboratorio.
- Red teaming y evaluacion de robustez: sirve como modelo "sin filtros" para generar prompts adversarios y probar sistemas de moderacion de contenido.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo donde los filtros de seguridad del modelo original resultan limitantes, ejecutado localmente con llama.cpp.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (19,8 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM como la RTX 4090, o en configuraciones multi-GPU.
- Analisis de contenido en chino e ingles: el modelo mantiene el soporte bilingue del GLM-Z1 original, adecuado para tareas de procesamiento de texto en ambos idiomas.
- Experimentacion con cuantizaciones: los multiples niveles de cuantizacion permiten comparar calidad frente a tamano para estudiar el impacto de la cuantizacion en modelos de 32B.
- Entornos air-gapped: al ser un GGUF ejecutable con llama.cpp u Ollama, puede desplegarse en sistemas sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~12,4 GB (Q2_K), ~19,8 GB (Q4_K_M), ~23,2 GB (Q5_K_M), ~34,7 GB (Q8_0).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; A100 40/80 GB o H100 para Q8_0 y contexto largo; configuraciones multi-GPU para cuantizaciones altas con contexto extendido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; las cuantizaciones Q2_K y Q3 caben en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; tambien puede usarse con transformers cargando el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-Z1-32B-0414-uncensored-heretic-v1 (este) | 32,5B | no disponible | MIT | GGUF | Variante sin censura, bilingue zh/en |
| GLM-Z1-32B-0414 (original, Zhipu AI) | 32,5B | no disponible | no disponible | safetensors | Modelo base con alineacion de seguridad |
| Modelos 32B densos de la misma categoria | ~32B | variable | variable | variable | No se dispone de datos de rendimiento comparativo |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El proceso de abliteration elimina las capas de rechazo, por lo que el modelo puede generar contenido danino, ilegal, ofensivo o sexualmente explicito sin advertencia.
- Riesgo elevado de alucinacion, agravado por la falta de alineacion de seguridad que en el modelo original actuaba como filtro parcial.
- Soporte limitado a chino e ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La licencia MIT permite uso comercial, pero el despliegue en produccion de un modelo sin censura expone al operador a responsabilidades legales y reputacionales segun la jurisdiccion.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar aplicaciones con ventanas largas.
- Las cuantizaciones Q2_K y Q3_K_M tienen calidad reducida segun la propia model card; para produccion se recomienda Q4_K_M o superior.
- No se documentan capacidades de tool calling ni de agente, por lo que no es adecuado para pipelines que dependan de function calling.
- El modelo tiene solo 368 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v1-GGUF
- Modelo base (Hugging Face): https://huggingface.co/llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#GLM-Z1-32B-0414-uncensored-heretic-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
