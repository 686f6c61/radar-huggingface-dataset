# kojira/aozoraquest-cognitive-small

## Resumen

`kojira/aozoraquest-cognitive-small` es un artefacto de pesos derivado de `cl-nagoya/ruri-v3-30m`, un modelo de embeddings de frases de origen japones. El autor, kojira, lo publica como parte del proyecto Aozora Quest para permitir la inferencia de ese modelo de embeddings dentro de un navegador mediante WebGPU, empleando shaders WGSL escritos a mano en lugar de un runtime de alto nivel. El repositorio contiene los pesos convertidos y empaquetados, no un modelo nuevo entrenado desde cero: la model card indica explicitamente que solo se han aplicado cuantizacion y cambios de formato, sin reentrenamiento.

La relevancia practica es acotada pero concreta: ofrece una via para ejecutar un encoder de embeddings de ~30 millones de parametros en el cliente, sin servidor, con un tamano de fichero de pesos de aproximadamente 47,6 MB. Esto lo hace interesante para aplicaciones web que necesitan busqueda semantica o similitud de frases en local, con requisitos de latencia y privacidad distintos a los de una API remota.

Conviene subrayar que la informacion publica disponible es muy escasa: no hay pipeline declarado, ni licencia explicita en los metadatos de Hugging Face, ni idiomas, ni benchmarks, ni datos de entrenamiento propios. La model card esta redactada en japones y describe unicamente el proceso de conversion. Todo lo que se afirma aqui sobre el modelo base procede de la referencia al repositorio original `cl-nagoya/ruri-v3-30m` y de la descripcion de la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (modelo base `cl-nagoya/ruri-v3-30m`; la model card no detalla la arquitectura interna) |
| Parametros totales | Aproximadamente 30 millones (segun el nombre del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Embeddings en int8 con cuantizacion simetrica por filas; capas lineales en fp16; LayerNorm en fp32; head con mean-pool y normalizacion L2 |
| Idiomas soportados | No disponible (el modelo base es de origen japones; no se especifica cobertura) |
| Licencia | Apache License 2.0, heredada del modelo base `cl-nagoya/ruri-v3-30m` |
| Formato de pesos | Pesos binarios para inferencia WebGPU mediante shaders WGSL (no safetensors ni GGUF); el repositorio ocupa 1,5 GB |

## Arquitectura y entrenamiento

El artefacto no incorpora entrenamiento propio. Segun la model card, los pesos proceden de `sirasagi62/ruri-v3-30m-ONNX` (fichero `onnx/model.onnx` en fp32), que a su vez deriva de `cl-nagoya/ruri-v3-30m`. La conversion la realiza el script `scripts/convert-cognitive-wgsl.py` del repositorio `github.com/kojira/aozoraquest`. Las transformaciones aplicadas son: cuantizacion simetrica por filas a int8 para las matrices de embeddings, paso de las capas lineales a fp16, mantenimiento de LayerNorm en fp32 y una cabeza de pooling que calcula la media sobre la attention mask y aplica normalizacion L2.

El objetivo declarado es la inferencia en navegador con WebGPU mediante WGSL escrito a mano, dentro del proyecto Aozora Quest. No se documentan datos de entrenamiento, numero de tokens, composicion del corpus, ni fases de RLHF o DPO, porque no se ha reentrenado el modelo. Tampoco se describe ninguna innovacion arquitectonica propia mas alla de la estrategia de cuantizacion mixta por tipo de capa, pensada para equilibrar precision y coste en GPU de navegador.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion (el modelo base es un modelo de embeddings, no generativo).
- Calculo de representaciones normalizadas L2, aptas para busqueda por producto escalar o similitud coseno.
- Procesamiento por lotes con attention mask, ya que la cabeza de pooling promedia sobre las posiciones validas.
- Inferencia en el cliente mediante WebGPU, sin dependencia de servidor.
- Soporte multilingue: no disponible; la cobertura linguistica del modelo base no se detalla en la informacion proporcionada.
- Tool calling, function calling, agentes, razonamiento multi-paso, vision y audio: no disponibles; no son capacidades de un encoder de embeddings.
- Modo thinking: no disponible.

## Casos de uso

- Busqueda semantica en aplicaciones web estaticas: el modelo puede indexar y consultar fragmentos de texto directamente en el navegador, sin backend, gracias a sus aproximadamente 47,6 MB de pesos y a la ejecucion sobre WebGPU.
- Clasificacion y agrupamiento de textos en local: generar embeddings de documentos y aplicar k-means o similitud coseno en el cliente permite categorizar contenido sin enviar datos a un servidor.
- Deteccion de duplicados y near-duplicates: comparar embeddings normalizados L2 permite identificar parrafos casi identicos en corpus de documentacion o foros.
- Recomendacion de contenido relacionado: calcular similitud entre el texto consultado y un catalogo preindexado para sugerir articulos, entradas de FAQ o recursos.
- Filtrado y moderacion previa en el cliente: usar la similitud con frases de referencia para marcar contenido potencialmente problematico antes de cualquier procesamiento servidor.
- Asistentes de escritura con recuperacion local: recuperar pasajes relevantes de notas o documentacion del usuario para aumentar un prompt, manteniendo los datos en el dispositivo.
- Prototipado de pipelines RAG sin infraestructura: validar la calidad de la recuperacion con el modelo real antes de desplegar un sistema mayor en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion, MTEB ni comparaciones con otros modelos, y tampoco se aportan cifras de latencia o throughput en WebGPU.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 47,6 MB (fichero de 47.622.472 bytes), por lo que el consumo de memoria es muy bajo; no se especifica el overhead del runtime WebGPU ni de las activaciones.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador; no se detallan modelos concretos en la informacion disponible.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido de los pesos; no se confirma en la documentacion.
- Opciones de despliegue: inferencia en navegador con WebGPU y shaders WGSL del proyecto Aozora Quest. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos no es compatible con esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kojira/aozoraquest-cognitive-small | Aproximadamente 30 M | No disponible | Pesos WGSL para WebGPU | Apache 2.0 (heredada) | Conversion de ruri-v3-30m para navegador |
| cl-nagoya/ruri-v3-30m | Aproximadamente 30 M | No disponible | Safetensors / transformers | Apache 2.0 | Modelo base original de embeddings |
| sirasagi62/ruri-v3-30m-ONNX | Aproximadamente 30 M | No disponible | ONNX fp32 | No disponible | Intermedio de conversion usado por este repositorio |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; no puede responder preguntas ni generar texto.
- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de calidad; no hay garantias empiricas de rendimiento.
- La cobertura linguistica no esta declarada; el modelo base es de origen japones y su comportamiento en castellano no esta verificado.
- La licencia Apache 2.0 se hereda del modelo base segun la model card, pero los metadatos de Hugging Face no declaran licencia; conviene verificar antes de un uso comercial.
- El formato de pesos es especifico de WebGPU/WGSL y no es interoperable con runtimes estandar como vLLM, llama.cpp u Ollama.
- El repositorio ocupa 1,5 GB pese a que el fichero de pesos principal son 47,6 MB; puede incluir artefactos adicionales no documentados.
- Solo 345 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.
- La fecha de creacion del repositorio (2026-04-24) y la de actualizacion (2026-11-06) deben interpretarse con cautela si se contrastan con otras fuentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kojira/aozoraquest-cognitive-small
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-30m
- Conversion ONNX intermedia: https://huggingface.co/sirasagi62/ruri-v3-30m-ONNX
- Repositorio del proyecto: https://github.com/kojira/aozoraquest
