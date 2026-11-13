# nekomimi-llc/LFM2.5-24B-A2B-smallthink-lora

## Resumen

LFM2.5-24B-A2B-smallthink es un adaptador LoRA desarrollado por nekomimi-llc sobre el modelo base LiquidAI/LFM2.5-24B-A2B, un transformer con arquitectura Mixture of Experts (MoE) de Liquid AI. El adaptador modifica el comportamiento de razonamiento del modelo base para reducir drásticamente la longitud de su cadena de pensamiento en tareas concretas de busqueda web y lectura de paginas para agentes, pasando de aproximadamente 2.000 tokens de razonamiento a unos 65-70.

El problema que resuelve es de latencia en produccion: el modelo base, aunque preciso, invertia entre 15 y 19 segundos pensando antes de cada respuesta y en ocasiones agotaba el limite de tokens durante el razonamiento, produciendo respuestas vacias. Este LoRA fue entrenado especificamente para siete tareas de un servicio autoalojado de busqueda y extraccion web (web-extract), con prompts de sistema fijos y salidas cortas y estructuradas.

El adaptador es relevante para desarrolladores que despliegan agentes con herramientas de busqueda en entornos con recursos limitados, ya que permite servir un modelo MoE de 24B parametros totales en una GPU de 12 GB con cuantizacion IQ3_XXS, manteniendo una calidad comparable a la del modelo base en estas tareas concretas. El repositorio solo contiene los pesos del adaptador (0,1 GB), no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE LiquidAI/LFM2.5-24B-A2B |
| Parametros totales | 24B (modelo base); el adaptador LoRA ocupa 0,1 GB |
| Parametros activos | A2B (aproximadamente 2B activos, segun nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS (build GGUF publicado por el autor); otras no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors (adaptador PEFT); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El adaptador se entrena sobre LiquidAI/LFM2.5-24B-A2B, un modelo MoE de la familia LFM2.5 de Liquid AI con 24B parametros totales y aproximadamente 2B activos por token. El LoRA ajusta el comportamiento de razonamiento del modelo base para siete tareas con prompts de sistema fijos: search_triage (decidir si merece la pena recuperar un resultado), query_rewrite (reescribir una consulta en hasta tres variantes), preview_classify (clasificar si una pagina responde a la consulta), preview_quotes (extraer hasta tres citas textuales), preview_summary (redactar un parrafo fundamentado sobre una pagina), synthesis_assess (evaluar si las previews responden a la consulta) y synthesis_digest (redactar una respuesta fundamentada a partir de las previews).

El dataset de entrenamiento es nekomimi-llc/web-search-queries. El autor indica que el modelo espera exactamente esos prompts de sistema y un mensaje de usuario con los datos primero y las reglas de la tarea al final. La validacion se realizo sobre 317 filas, con perdida en nats por token de 2,447 (pensamiento) y 0,934 (respuesta) para el modelo base, frente a 1,045 y 0,603 para el adaptador. Una version previa del adaptador aprendio a insertar backticks de Markdown en respuestas de prosa (15 de 39 digests); esta version se reentreno eliminando esos backticks, quedando 3 de 39. No se detalla en la informacion disponible el volumen de tokens de entrenamiento ni si se empleo RLHF o DPO.

## Capacidades

- Generacion de texto en ingles con cadenas de razonamiento cortas (aproximadamente 65-70 tokens de pensamiento frente a unos 2.000 del modelo base) en las siete tareas entrenadas.
- Clasificacion binaria y multietiqueta con salidas de una sola palabra (fetch/skip; direct/partial/background/none; answered/partial/unanswered).
- Reescritura de consultas de busqueda en formato JSON con hasta tres variantes.
- Extraccion de citas textuales verificables de evidencia web.
- Redaccion de resumenes y respuestas fundamentadas exclusivamente en la evidencia proporcionada, con instrucciones explicitas de no seguir instrucciones embebidas en los datos.
- Manejo de datos no confiables: los prompts tratan consultas, titulos, URLs y evidencia como datos, no como instrucciones, lo que aporta una capa basica de defensa frente a inyeccion de prompts.
- Salida compatible con llama.cpp mediante `--jinja` y la plantilla `lfm25-template.jinja`, con el razonamiento en `reasoning_content` y la respuesta en `content`.
- Soporte de decodificacion especulativa mediante un modelo draft pequeno en el fork de llama.cpp del autor (aproximadamente 105 tokens por segundo con este modelo).

## Casos de uso

- Triaje de resultados de busqueda en agentes: el adaptador decide en milisegundos si un resultado merece ser recuperado, con salida de una sola palabra, lo que reduce el coste de red y el consumo de contexto en pipelines de busqueda automatizada.
- Reescritura de consultas para motores de busqueda: genera hasta tres variantes en JSON para mejorar la cobertura de recuperacion, con latencia baja y formato estrictamente parseable.
- Clasificacion de relevancia de paginas: etiqueta la evidencia de una pagina como direct, partial, background o none respecto a una consulta, util para filtrar resultados antes de pasarlos a un modelo mayor.
- Extraccion de citas verificables: obtiene hasta tres citas literales de la evidencia para construir respuestas con trazabilidad, adecuado en sistemas de retrieval-augmented generation que exigen atribucion.
- Generacion de previews de resultados de busqueda: redacta un parrafo fundamentado por pagina en aproximadamente 1,3 segundos de mediana, apto para interfaces de busqueda que muestran resumenes en tiempo real.
- Sintesis de respuestas a partir de previews: evalua si las previews responden a la consulta y redacta un digest fundamentado, con una reduccion notable de afirmaciones no respaldadas (21 frente a 48 del modelo anterior en la tarea de digest).
- Servicio autoalojado de busqueda y lectura para agentes: el caso de uso original, web-extract, donde el modelo base gastaba 15-19 segundos por respuesta y este adaptador baja a 1,3-1,4 segundos en una GPU de 12 GB.
- Despliegue en hardware de gama media para agentes de investigacion: al caber en 12 GB con cuantizacion IQ3_XXS, permite ejecutar un MoE de 24B en una unica GPU consumer o de workstation pequena.

## Benchmarks y rendimiento

Resultados sobre 79 peticiones reservadas de web-extract (40 previews, 39 digests), ambos modelos cuantizados en IQ3_XXS y servidos con llama.cpp en una GPU de 12 GB, con pensamiento completo permitido y maximo de 4.096 tokens. Los tiempos se midieron con un fork de llama.cpp con decodificacion especulativa (aproximadamente 105 tokens por segundo).

| Tarea | Modelo | Tiempo mediano hasta respuesta | Tokens de pensamiento medianos | Alcanzo el limite de tokens | Respuesta vacia |
|---|---|---|---|---|---|
| preview | base | 15,3 s | 1.978 | 6 de 40 | 6 de 40 |
| preview | smallthink | 1,32 s | 65 | 0 | 0 |
| digest | base | 19,4 s | 2.433 | 7 de 39 | 5 de 39 |
| digest | smallthink | 1,38 s | 66 | 0 | 0 |

Calidad evaluada a ciegas por pares con Claude Opus frente a un modelo ternario de 27B usado anteriormente por web-extract:

| Tarea | Gana el modelo anterior | Gana smallthink | Afirmaciones no respaldadas, anterior | Afirmaciones no respaldadas, smallthink |
|---|---|---|---|---|
| preview (40) | 22 | 18 | 23 | 20 |
| digest (39) | 21 | 18 | 48 | 21 |

En una ejecucion anterior del mismo test, el modelo base LFM obtuvo 18 victorias de 40 en previews y 12 de 39 en digests frente al mismo oponente. Perdida de validacion (nats por token) sobre 317 filas, pensamiento | respuesta: base 2,447 | 0,934; adaptador 1,045 | 0,603. El autor advierte que los recuentos del juez varian unos pocos elementos entre ejecuciones, por lo que 22 a 18 debe leerse como practicamente empate.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12 GB con cuantizacion IQ3_XXS para el modelo completo (24B totales, 2B activos), segun la configuracion de prueba del autor.
- GPU recomendadas: una GPU de 12 GB es suficiente para el build GGUF IQ3_XXS; no se especifican modelos concretos de GPU en la informacion disponible.
- Cabe en GPU consumer: si, en tarjetas de 12 GB (gama RTX xx80/xx70 de 12 GB o superiores) con cuantizacion IQ3_XXS.
- Opciones de despliegue: llama.cpp con `--jinja` y la plantilla `lfm25-template.jinja`; el autor usa un fork propio con decodificacion especulativa. No se confirma soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: aproximadamente 105 tokens por segundo con el fork con decodificacion especulativa; 1,32 s de mediana en previews y 1,38 s en digests. Con llama.cpp estandar la decodificacion sera mas lenta, aunque el numero de tokens de pensamiento se mantiene.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-smallthink (este) | 24B totales, ~2B activos | no disponible | 1,3-1,4 s de mediana, 65-66 tokens de pensamiento, 0 respuestas vacias | lfm1.0 | Adaptador LoRA y GGUF en Hugging Face |
| LFM2.5-24B-A2B (base) | 24B totales, ~2B activos | no disponible | 15,3-19,4 s de mediana, 1.978-2.433 tokens de pensamiento, 5-7 respuestas vacias de 40/39 | lfm1.0 | Hugging Face (LiquidAI) |
| Modelo ternario de 27B (oponente en la evaluacion) | 27B | no disponible | 22/21 victorias frente a 18/18 del adaptador; 23/48 afirmaciones no respaldadas | no disponible | no disponible |

No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para siete tareas concretas con prompts de sistema fijos; fuera de ellas su comportamiento no esta probado y es probable que razone brevemente sobre tareas que requieren mas analisis.
- Las respuestas son cortas por diseno; en comparaciones ciegas pierde ligeramente mas de lo que gana frente a un modelo mayor que piensa mas tiempo.
- Solo soporta ingles.
- El modelo base puede alucinar y el adaptador no elimina ese riesgo; su valor esta en reducir afirmaciones no respaldadas en las tareas entrenadas, no en garantizar veracidad.
- Requiere usar exactamente los prompts de sistema documentados y el formato de mensaje de usuario indicado; desviarse de ellos degrada el comportamiento esperado.
- La version anterior aprendio a insertar backticks de Markdown en prosa; esta version se reentreno para corregirlo, pero persisten 3 de 39 digests con backticks.
- Licencia lfm1.0: es necesario revisar sus terminos para uso comercial, ya que el modelo base de Liquid AI impone condiciones especificas.
- Los tiempos publicados se midieron con un fork de llama.cpp con decodificacion especulativa; en llama.cpp estandar la latencia sera mayor.
- Los recuentos de la evaluacion de calidad varian unos pocos elementos entre ejecuciones, por lo que las diferencias pequenas no deben interpretarse como significativas.
- No se dispone de informacion sobre la longitud de contexto del modelo base ni sobre el volumen y composicion exactos del dataset de entrenamiento.

## Enlaces

- Adaptador LoRA: https://huggingface.co/nekomimi-llc/LFM2.5-24B-A2B-smallthink-lora
- Build GGUF: https://huggingface.co/nekomimi-llc/LFM2.5-24B-A2B-smallthink-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Dataset de entrenamiento: https://huggingface.co/datasets/nekomimi-llc/web-search-queries
- Servicio web-extract: https://git.nkp.pet/okami.mom/web-extract-go
- Prompts detallados: PROMPTS.md (incluido en el repositorio del adaptador)
- Plantilla de chat: lfm25-template.jinja (incluida en el repositorio del adaptador)
