# 3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated

## Resumen

`3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated` es una version modificada del modelo abierto GPT-OSS 20B de OpenAI, publicada por el usuario 3MPER0RR en HuggingFace. La modificacion consiste en un proceso de *abliteration* (ablacion direccional) aplicado en varias rondas ("multi-round abliteration", segun la model card) sobre los pesos originales, con el objetivo declarado de eliminar o atenuar los comportamientos de rechazo del modelo base. No se trata de un reentrenamiento ni de un fine-tuning con datos nuevos, sino de una intervencion sobre los pesos de un modelo ya existente.

El modelo base GPT-OSS 20B es un transformer de tipo mezcla de expertos (MoE) con aproximadamente 20,9 mil millones de parametros totales (20.914.757.184 segun los safetensors del repositorio) y una arquitectura etiquetada como `gpt_oss`. La model card del autor es extremadamente escueta: no documenta el procedimiento exacto, el numero de rondas, los datos de calibracion ni ninguna evaluacion posterior, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

La relevancia de esta ficha es doble. Por un lado, sirve como ejemplo de la familia de derivados "abliterated" que circulan por HuggingFace y que interesan a equipos de *red teaming* y de investigacion sobre seguridad de modelos. Por otro, obliga a advertir de que la licencia Apache 2.0 del original se mantiene, pero las garantias de comportamiento, alineacion y calidad del modelo base quedan explicitamente en entredicho tras la intervencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), arquitectura `gpt_oss` (heredada del modelo base GPT-OSS 20B) |
| Parametros totales | 20.914.757.184 (~20,9 B) |
| Parametros activos | No disponible en la informacion proporcionada; el modelo base GPT-OSS 20B activa del orden de 3,6 B por token, pero el autor no publica este dato para su derivado |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base GPT-OSS 20B admite 128.000 tokens de contexto, extremo que el autor no confirma ni desmiente |
| Tipos de cuantizacion | No documentados por el autor. El repositorio ocupa 41,9 GB para 20,9 B de parametros, lo que corresponde aproximadamente a 2 bytes por parametro (bf16/fp16) y sugiere que los pesos publicados no conservan la cuantizacion MXFP4 del checkpoint original de OpenAI. No se incluyen ficheros GGUF ni cuantizaciones de menor precision |
| Idiomas soportados | No disponible (el campo de idiomas de la model card esta vacio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-generation |
| Etiquetas | safetensors, gpt_oss, abliteration, gpt-oss, experimental, multi-round, text-generation, conversational |
| Fecha de creacion (segun HuggingFace) | 2026-09-11 |
| Ultima actualizacion (segun HuggingFace) | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de GPT-OSS 20B, un transformer decoder-only con capas de mezcla de expertos: cada bloque MoE contiene un conjunto de expertos de los que solo se activa una fraccion por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano total. El checkpoint original de OpenAI se distribuye con los pesos de los expertos cuantizados en MXFP4, un formato de 4 bits con exponente compartido, lo que permite ejecutarlo en GPU de consumo. En este repositorio, el tamano de 41,9 GB para 20,9 B de parametros indica que los pesos se han republicado en precision de 16 bits, de modo que la ventaja de memoria del MXFP4 original se ha perdido salvo que el usuario reconvierta el modelo a GGUF o a otro formato cuantizado.

Sobre el proceso de abliteracion: la tecnica habitual consiste en identificar, mediante pares de prompts maliciosos y prompts inocuos, una direccion en el espacio de activaciones (tipicamente en el *residual stream*) que media el comportamiento de rechazo, y despues proyectar u ortogonalizar los pesos de escritura de ese subespacio para que la direccion quede neutralizada. El autor indica que aplico varias rondas ("multi-round"), probablemente para cubrir distintas capas o distintos tipos de rechazo residual. No se documenta ni el dataset de calibracion, ni el numero de rondas, ni la magnitud de la intervencion, ni si hubo verificacion cuantitativa del dano colateral en capacidades generales. Tampoco hay constancia de RLHF, DPO ni ningun otro ajuste adicional: la unica operacion declarada es la modificacion de pesos. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base en esta ficha.

## Capacidades

- Generacion de texto y conversacion multi-turno: el modelo base esta disenado para dialogos encadenados; el autor etiqueta el repositorio como `conversational`.
- Razonamiento con esfuerzo configurable: el modelo base GPT-OSS 20B admite niveles de razonamiento (low/medium/high) en su formato de chat, aunque el autor no confirma que el derivado conserve esta funcionalidad intacta.
- Generacion de codigo y soporte de ejecucion de codigo en el modelo base; sin verificacion publicada tras la abliteracion.
- Tool calling / function calling: el modelo base usa el formato Harmony de OpenAI y soporta llamadas a herramientas; no hay confirmacion del autor para este derivado.
- Comportamiento agéntico: el modelo base soporta flujos multi-paso con navegacion web y uso de herramientas; aplicable en teoria a este derivado, sin evaluacion publicada.
- Ausencia deliberada de mecanismos de rechazo: la abliteracion busca que el modelo no se niegue a responder a peticiones que el modelo base rechazaria.
- Capacidades multilingues: no documentadas en este repositorio; el modelo base esta optimizado principalmente para ingles.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo puede utilizarse como sujeto de prueba para medir cuanto contenido danino es capaz de generar un modelo abierto sin guardarrailes, y para comparar la eficacia de distintas tecnicas de alineacion frente a la ablacion direccional.
- Investigacion sobre mecanismos de rechazo: dado que el derivado resulta de eliminar una direccion concreta en el espacio de activaciones, sirve para estudiar la hipotesis de que el rechazo esta mediado por subespacios de baja dimensionalidad, comparando activaciones frente al modelo base.
- Generacion de contenido creativo sin filtros editoriales: escritura de ficcion con tematicas adultas, violentas o controvertidas que el modelo base rechazaria; util en entornos editoriales cerrados con revision humana posterior.
- Simulacion de personajes adversarios: en *training* de equipos de moderacion o de atención al cliente, generar interlocutores hostiles, manipuladores o abusivos de forma realista sin que el modelo se niegue a mantener el rol.
- Desarrollo local con requisitos de privacidad: al ser un modelo de pesos abiertos con licencia Apache 2.0, puede desplegarse en infraestructura propia; con los pesos en bf16 requiere del orden de 42 GB, por lo que es viable en una GPU de 80 GB o, tras cuantizacion, en GPU de consumo.
- Pipelines de generacion de codigo en CI/CD: si el modelo base conserva su soporte de tool calling, puede integrarse como generador de parches o de tests; conviene validar previamente que la abliteracion no ha degradado la calidad del codigo generado.
- Anotacion de datasets que requieren respuestas sin evasivas: tareas de etiquetado donde el modelo base se niega sistematicamente a procesar el material de entrada (por ejemplo, corpus de abuse o de discurso de odio para entrenar clasificadores).
- Experimentacion educativa sobre abliteracion: reproducir el pipeline completo (calculo de direcciones, proyeccion de pesos, validacion) sobre un modelo MoE de 21 B en lugar de sobre modelos densos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, GPQA ni similares) y no hay ninguna comparacion cuantitativa entre este derivado y el GPT-OSS 20B original. Tampoco se documenta el impacto de la abliteracion sobre las capacidades generales del modelo, un dato critico porque la ablacion direccional puede degradar la coherencia y el razonamiento ademas de eliminar los rechazos.

## Requisitos de hardware

- Pesos en bf16/fp16 (formato publicado en este repositorio): 41,9 GB solo de pesos, mas cache KV. Necesita una GPU con 80 GB de memoria (H100 80 GB, A100 80 GB) o reparto en varias GPU (2x A100 40 GB con tensor parallelism).
- Pesos en MXFP4 (formato del modelo base, no incluido en este repositorio): aproximadamente 16 GB, ejecutable en RTX 4090, RTX 5090 o RTX 4080 de 16 GB con poco margen.
- Cuantizacion GGUF Q4_K_M de un modelo de ~21 B: del orden de 12-13 GB, viable en RTX 4070 Ti Super, RTX 4080, RTX 3090 y en equipos con 16 GB de RAM unificada; requeriria reconvertir los safetensors publicados, ya que el autor no incluye ficheros GGUF.
- Contexto largo: con 128.000 tokens de ventana, la cache KV crece de forma notable; para contextos muy largos conviene cuantizar la cache o reducir la ventana efectiva. No hay mediciones publicadas de consumo para este derivado.
- GPU recomendadas por escenario: H100 80 GB o A100 80 GB para precision completa y servicio concurrente; RTX 4090 / 5090 para MXFP4 o GGUF con un solo usuario; nunca inferior a 16 GB de VRAM sin cuantizar.
- Opciones de despliegue: vLLM (con soporte para la arquitectura `gpt_oss` y kernels MXFP4 cuando se dispone del checkpoint original), llama.cpp y Ollama mediante conversion a GGUF, Text Generation Inference y `transformers` para inferencia de referencia.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b-3MPER0RR-abliterated | ~20,9 B / no documentado | No documentado (el base admite 128.000) | Sin benchmarks publicados | Apache 2.0 | HuggingFace, safetensors en bf16, 0 descargas |
| GPT-OSS 20B (OpenAI, original) | ~21 B / ~3,6 B | 128.000 tokens | Benchmarks publicados por OpenAI en su model card | Apache 2.0 | HuggingFace y GitHub, con pesos MXFP4 |
| GPT-OSS 120B (OpenAI) | ~117 B / ~5,1 B | 128.000 tokens | Benchmarks publicados por OpenAI, superiores al 20B | Apache 2.0 | HuggingFace y GitHub |
| Qwen3-30B-A3B | ~30,5 B / ~3,3 B | 128.000 tokens (ampliable con YaRN) | Benchmarks publicados por el autor del modelo | Apache 2.0 | HuggingFace, amplio ecosistema GGUF |

La comparacion de rendimiento entre este derivado y cualquiera de las alternativas no puede establecerse con los datos disponibles: no existe ninguna evaluacion publicada del efecto de la abliteracion sobre GPT-OSS 20B. Las cifras de parametros y contexto del modelo base y de los alternativas proceden de sus respectivas documentaciones publicas.

## Limitaciones y advertencias

- Eliminacion deliberada de los mecanismos de rechazo: el proposito declarado del modelo es no negarse a peticiones que el original rechazaria. Puede generar contenido danino, ilegal o gravemente ofensivo. El usuario asume toda la responsabilidad legal y etica derivada de su uso.
- Riesgo elevado de degradacion de capacidades: la ablacion direccional aplicada en varias rondas es una intervencion agresiva sobre los pesos; sin evaluacion publicada no puede descartarse perdida de coherencia, repeticiones, degradacion del razonamiento o salidas incoherentes.
- Sin datos de entrenamiento ni de calibracion: el autor no documenta el dataset usado para calcular las direcciones de rechazo, ni el numero de rondas, ni los criterios de parada. La reproducibilidad del proceso es nula.
- Riesgo de alucinacion: heredado del modelo base y potencialmente agravado por la modificacion de pesos; no hay mediciones de fidelidad factual.
- Idiomas: no se documenta ningun idioma soportado. El modelo base esta orientado al ingles, por lo que el rendimiento en castellano sera previsiblemente inferior y no esta verificado.
- Contexto: la ventana de 128.000 tokens del modelo base no esta confirmada por el autor para este derivado, y los pesos en bf16 de 41,9 GB dificultan su explotacion practica con contexto largo en hardware de consumo.
- Licencia: Apache 2.0 permite uso comercial y redistribucion, pero la licencia del original no cubre el comportamiento resultante; no existe ninguna clausula de uso aceptable que restrinja el uso de este derivado.
- Procedencia dudosa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue publicado y actualizado el mismo dia y su model card carece de cualquier validacion tecnica. No hay forma de verificar que los pesos correspondan realmente a una abliteracion de GPT-OSS 20B ni de auditar el proceso.
- No apto para produccion sin evaluacion previa: en cualquier despliegue con usuarios finales, la ausencia de filtros de rechazo lo convierte en un riesgo directo de generacion de contenido inapropiado, con independencia de la capa de moderacion que se anada por encima.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated
- Modelo base GPT-OSS 20B (OpenAI): https://huggingface.co/openai/gpt-oss-20b
- Modelo base GPT-OSS 120B (OpenAI): https://huggingface.co/openai/gpt-oss-120b
- Repositorio de codigo de GPT-OSS: https://github.com/openai/gpt-oss
- Anuncio y documentacion de la familia GPT-OSS: https://openai.com/index/introducing-gpt-oss/
- La busqueda web realizada no devolvio ningun resultado tecnico relevante sobre este modelo; unicamente aparecieron sitios de contenido para adultos sin relacion con el repositorio, por lo que no se incluyen.
