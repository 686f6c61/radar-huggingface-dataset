# Neurobrix/Qwen3-Omni-30B-A3B-Instruct-nbx

## Resumen

Qwen3-Omni-30B-A3B-Instruct-nbx es una distribucion del modelo Qwen3-Omni-30B-A3B-Instruct de Alibaba Qwen, publicada por Neurobrix bajo el identificador `Neurobrix/Qwen3-Omni-30B-A3B-Instruct-nbx`. Se trata de un modelo multimodal any-to-any: acepta y genera texto, imagen, audio y video dentro de una misma arquitectura. El sufijo `-nbx` indica que los pesos han sido empaquetados para la libreria propietaria `neurobrix`, orientada a inferencia local con kernels Triton, en lugar de distribuirse en el formato original de Transformers.

El modelo subyacente es un transformer de tipo Mixture-of-Experts con 30.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B), lo que permite un coste de computo por token cercano al de un modelo denso de 3B pese a contar con la capacidad de uno de 30B. Esta pensado para despliegues locales y entornos con recursos limitados donde se necesita procesamiento multimodal completo sin depender de APIs externas.

La relevancia de esta ficha radica en que el repositorio no es una version oficial de Qwen sino un reempaquetado de terceros: la licencia declarada es Apache 2.0, el acceso esta restringido (gated) y la libreria de inferencia es especifica de Neurobrix. Cualquier evaluacion tecnica debe partir del modelo base Qwen3-Omni-30B-A3B-Instruct, ya que la informacion publicada en este repositorio es minima y no documenta cambios en pesos, datos de entrenamiento ni evaluaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts multimodal (any-to-any), basada en Qwen3-Omni |
| Parametros totales | 30B (segun denominacion del modelo base) |
| Parametros activos | ~3B por token (MoE, segun denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 70,6 GB, libreria `neurobrix`) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Omni-30B-A3B-Instruct emplea una arquitectura Mixture-of-Experts con enrutamiento disperso, disenada para procesar y generar multiples modalidades (texto, imagen, audio y video) en un unico modelo. La denominacion A3B indica que, de los 30B parametros totales, solo alrededor de 3B se activan por token durante la inferencia, lo que reduce el coste computacional y de memoria respecto a un denso equivalente.

No se dispone de informacion en el repositorio de Neurobrix sobre el numero de tokens de entrenamiento, la composicion del dataset, las tecnicas de alineacion (RLHF, DPO) ni posibles innovaciones tecnicas adicionales. Tampoco se documenta si el reempaquetado `-nbx` introduce cambios en los pesos, en la tokenizacion o en el grafo de computo respecto al modelo original de Qwen. Se recomienda consultar la model card oficial de `Qwen/Qwen3-Omni-30B-A3B-Instruct` para los detalles de arquitectura y entrenamiento.

## Capacidades

- Generacion y comprension de texto, con capacidad de razonamiento y respuesta conversacional multi-turno.
- Procesamiento de imagen y video como entrada (modalidad any-to-any declarada en el pipeline).
- Procesamiento de audio como entrada y salida, segun la naturaleza multimodal del modelo base.
- Generacion de codigo y matematicas, heredada de la familia Qwen3.
- Soporte multilingue: no documentado en este repositorio; debe verificarse en el modelo base.
- Tool calling y function calling: no documentado en este repositorio.
- Modo de razonamiento extendido (thinking): no documentado en este repositorio.
- Inferencia local acelerada mediante kernels Triton a traves de la libreria `neurobrix`.

## Casos de uso

- Asistentes multimodales locales: el modelo puede recibir imagen, audio o video junto con texto y generar respuestas en cualquiera de esas modalidades, lo que permite construir asistentes que operan sin enviar datos a APIs externas.
- Transcripcion y analisis de reuniones: combinando entrada de audio con salida de texto estructurado, se puede integrar en pipelines de actas y resumenes donde la confidencialidad exige inferencia on-premise.
- Analisis de video para monitorizacion: al aceptar video como entrada, resulta adecuado para tareas de descripcion de escenas o extraccion de eventos en flujos de camaras.
- Generacion de codigo asistida: el modelo hereda las capacidades de codigo de Qwen3 y puede integrarse en entornos de desarrollo con inferencia local, reduciendo la dependencia de servicios en la nube.
- Procesamiento de documentos con imagenes: extraccion y razonamiento sobre capturas, diagramas o formularios escaneados combinando vision y texto.
- Despliegue en hardware de gama alta para investigacion: con 30B parametros totales y ~3B activos, es viable en estaciones con GPU de gran memoria para experimentacion con modelos MoE multimodales.
- Prototipado de agentes any-to-any: la combinacion de modalidades permite construir agentes que razonan sobre audio, imagen y texto en un mismo bucle, aunque la ausencia de documentacion sobre tool calling en este repositorio exige validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de Neurobrix no incluye tablas de evaluacion propias ni comparaciones con el modelo base. Para datos de rendimiento debe consultarse la model card oficial de `Qwen/Qwen3-Omni-30B-A3B-Instruct`.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia teorica, un modelo de 30B parametros en precision de 16 bits requiere del orden de 60 GB solo para pesos, a lo que se suman activaciones y cache KV; las cifras exactas dependen del formato de pesos del repositorio (70,6 GB) y de la implementacion de `neurobrix`.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo encaja en GPU de centro de datos con 80 GB (A100, H100) y probablemente en configuraciones multi-GPU para consumer.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de este tamano no cabe en una unica GPU consumer de 24 GB sin cuantizacion, y el repositorio no documenta variantes cuantizadas.
- Opciones de despliegue: la libreria `neurobrix` con kernels Triton es el mecanismo documentado por el autor. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neurobrix/Qwen3-Omni-30B-A3B-Instruct-nbx | 30B totales, ~3B activos | no disponible | Texto, imagen, audio, video | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen3-Omni-30B-A3B-Instruct | 30B totales, ~3B activos | no disponible | Texto, imagen, audio, video | Apache 2.0 (segun repositorio derivado) | Repositorio oficial de Qwen |
| Modelos multimodales densos de ~30B | ~30B activos | no disponible | Variable | Variable | Variable |

La comparativa directa mas relevante es contra el modelo base oficial de Qwen, del que este repositorio es un reempaquetado. Cualquier diferencia en rendimiento, cuantizacion o compatibilidad con frameworks debe atribuirse al empaquetado de Neurobrix y no al modelo original, y no esta documentada en la informacion disponible.

## Limitaciones y advertencias

- Repositorio de terceros: no es una publicacion oficial de Qwen; los pesos y el formato pueden diferir del original y no hay garantia de equivalencia funcional.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga, lo que anade friccion a pipelines automatizados.
- Libreria propietaria: la inferencia depende de `neurobrix` y kernels Triton; la portabilidad a otros frameworks (vLLM, llama.cpp, TGI) no esta documentada.
- Documentacion minima: no se publican idiomas soportados, contexto, cuantizaciones, benchmarks ni detalles de entrenamiento en este repositorio.
- Riesgo de alucinacion: inherente a los modelos generativos multimodales; debe validarse en dominios sensibles.
- Sesgos: no documentados en este repositorio; deben evaluarse a partir del modelo base.
- Licencia Apache 2.0 declarada, pero al tratarse de un derivado conviene verificar las condiciones del modelo base y las del acceso gated antes de uso comercial.
- Fecha de publicacion futura en los metadatos (noviembre de 2026), lo que sugiere que la informacion puede estar incompleta o sujeta a cambios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Neurobrix/Qwen3-Omni-30B-A3B-Instruct-nbx
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
