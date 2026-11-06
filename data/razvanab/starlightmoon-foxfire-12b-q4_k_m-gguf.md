# razvanab/StarlightMoon-Foxfire-12B-Q4_K_M-GGUF

## Resumen

StarlightMoon-Foxfire-12B-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo MrRikyz/StarlightMoon-Foxfire-12B, un merge de modelos de 12.247.782.400 parámetros (aproximadamente 12,25 mil millones) orientado a roleplay y generación creativa. La conversión la ha realizado el usuario razvanab mediante el espacio GGUF-my-repo de ggml.ai, que automatiza la transformación de pesos originales a GGUF con llama.cpp. El resultado es un único fichero de aproximadamente 7,5 GB listo para inferencia local en CPU o GPU con llama.cpp.

El modelo base es un merge construido con mergekit, según las etiquetas de la model card, y está etiquetado explícitamente como contenido para adultos (nsfw) y no apto para todas las audiencias. No se trata de un modelo de propósito general ni de un modelo entrenado desde cero: es una fusión de pesos de otros modelos, lo que condiciona tanto sus capacidades como sus limitaciones. La información pública disponible es muy escasa: no hay datos sobre la composición del merge, la longitud de contexto nativa, el dataset de entrenamiento ni resultados de benchmarks.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de la cadena de distribución de modelos abiertos: un merge comunitario, una cuantización Q4_K_M y una publicación en Hugging Face con cero descargas y cero likes en el momento de la consulta. Por otro, sirve para advertir de las limitaciones de trazabilidad de este tipo de artefactos, donde la model card original no está incluida y la licencia no está declarada, lo que complica su uso en entornos profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base; detalles no disponibles) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (fichero starlightmoon-foxfire-12b-q4_k_m.gguf) |
| Tamano del repositorio | 7,5 GB |
| Modelo base | MrRikyz/StarlightMoon-Foxfire-12B |
| Herramienta de conversion | llama.cpp / GGUF-my-repo (ggml.ai) |
| Etiquetas | mergekit, merge, roleplay, rp, nsfw, model_stock, llama-cpp |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base mas alla de que es un merge construido con mergekit, una herramienta que combina los pesos de dos o mas modelos mediante estrategias como SLERP, TIES, DARE o passthrough. El recuento de parametros (12.247.782.400) y el tamano del fichero cuantizado en Q4_K_M (7,5 GB) son coherentes con un transformer denso de aproximadamente 12B, pero no se ha publicado la ficha del modelo base en este repositorio ni se detalla que modelos se fusionaron, con que metodo ni con que hiperparametros.

Tampoco hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si hubo fases de RLHF, DPO o fine-tuning supervisado. Al ser un merge, es probable que herede las capacidades de sus progenitores sin un entrenamiento adicional, pero esto es una inferencia y no un dato confirmado. La conversion a GGUF realizada por GGUF-my-repo no altera los pesos mas alla de la cuantizacion Q4_K_M, que reduce la precision de la mayoria de las matrices a 4 bits con escalas de 6 bits en algunos tensores, un compromiso habitual entre tamano y calidad.

## Capacidades

- Generacion de texto creativo y narrativo, con enfasis declarado en roleplay y conversaciones de personaje.
- Conversacion multi-turno orientada a juegos de rol, ficcion interactiva y escritura asistida.
- Contenido para adultos (nsfw), segun la etiqueta explicita del autor; requiere filtrado o control de acceso en despliegues publicos.
- Soporte de tool calling: no disponible segun la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo ingles declarado; el rendimiento en castellano no esta verificado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Inferencia local mediante llama.cpp, con soporte de CLI y servidor HTTP compatible con la API de OpenAI a traves de llama-server.

## Casos de uso

- Prototipado de chatbots de rol para entretenimiento: el modelo puede mantener conversaciones de personaje con un tono narrativo consistente, y su formato GGUF permite desplegarlo en un portatil con GPU consumer sin infraestructura dedicada.
- Escritura asistida de ficcion interactiva: util para generar dialogos y tramas en talleres de escritura o proyectos de novelas visuales, con la ventaja de que el modelo corre en local y no expone el texto del usuario a servicios externos.
- Evaluacion comparativa de merges comunitarios: investigadores que estudian el efecto de mergekit pueden usar esta cuantizacion como referencia de calidad percibida frente al modelo base en tareas de roleplay, aunque sin benchmarks formales la comparacion seria subjetiva.
- Pruebas de concepto de inferencia en CPU: al ser un unico fichero GGUF de 7,5 GB, sirve para validar pipelines de llama.cpp en equipos sin GPU, por ejemplo en estaciones de trabajo con 16 GB de RAM.
- Generacion de contenido para videojuegos indie: integrable mediante llama-server en motores como Godot o Unity para dialogos dinamicos de NPC, siempre que el contenido adulto se filtre o se restrinja por clasificacion de edad.
- Docencia sobre el ecosistema de modelos abiertos: caso de estudio de la cadena merge, cuantizacion y publicacion en Hugging Face, incluida la problematica de licencias no declaradas y model cards incompletas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,5 GB solo para los pesos en Q4_K_M; con cache KV y overhead del runtime, entre 8 y 10 GB para contextos moderados.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090, A100 o H100 para mayor throughput; en GPUs de 8 GB no cabe con contexto amplio.
- Cabe en GPU consumer: si, en modelos con 12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090). En GPUs de 8 GB requeriria offloading parcial a CPU.
- Despliegue en CPU: viable con llama.cpp y al menos 16 GB de RAM del sistema; el rendimiento sera de pocos tokens por segundo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por compatibilidad de formato GGUF, frontends como Ollama o LM Studio que acepten ficheros GGUF externos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| StarlightMoon-Foxfire-12B-Q4_K_M-GGUF | 12,25B | No disponible | No disponible | GGUF Q4_K_M | Merge comunitario para roleplay; sin benchmarks |
| Modelo base MrRikyz/StarlightMoon-Foxfire-12B | 12,25B | No disponible | No disponible | Safetensors (presumible) | Origen del merge; ficha no incluida en este repo |
| Mistral-Nemo-Instruct-2407 | 12B | 128K | Apache 2.0 | Safetensors, GGUF | Modelo instructivo generalista con licencia permisiva y contexto largo documentado |
| Gemma 2 9B Instruct | 9B | 8K | Gemma Terms | Safetensors, GGUF | Alternativa de tamano similar con licencia restrictiva pero documentacion completa |

La comparacion con Mistral-Nemo y Gemma 2 es orientativa: no se dispone de datos que permitan afirmar que StarlightMoon-Foxfire-12B sea superior o inferior en tareas de roleplay. La diferencia principal es la trazabilidad: los modelos de Mistral AI y Google publican fichas tecnicas, licencias y evaluaciones, mientras que este merge no.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como nsfw y not-for-all-audiences; no debe desplegarse en productos accesibles a menores sin filtrado previo.
- Licencia no declarada: la ausencia de licencia impide determinar si el uso comercial esta permitido; en la practica, esto desaconseja su integracion en productos comerciales sin consultar al autor del modelo base.
- Trazabilidad limitada: no se especifican los modelos fusionados ni el metodo de merge, lo que impide auditar sesgos heredados o reclamaciones de derechos sobre los pesos originales.
- Riesgo de alucinacion: como todo modelo generativo sin benchmarks publicados, no hay evidencia de su fiabilidad factual; en tareas de roleplay el riesgo es aceptable, pero no en contextos informativos.
- Cobertura idiomatica: solo se declara ingles; el rendimiento en castellano es desconocido y probablemente degradado.
- Contexto desconocido: al no documentarse la longitud de contexto nativa, el ejemplo de la model card usa -c 2048, lo que sugiere que el autor no garantiza ventanas largas.
- Cuantizacion Q4_K_M: introduce perdida de calidad respecto a los pesos originales en precision completa; no se ha publicado una comparacion entre ambas versiones.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fecha de creacion anomala: la ficha indica 2026-11-01, lo que puede deberse a un error de metadatos y conviene verificar antes de citar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/razvanab/StarlightMoon-Foxfire-12B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/MrRikyz/StarlightMoon-Foxfire-12B
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
