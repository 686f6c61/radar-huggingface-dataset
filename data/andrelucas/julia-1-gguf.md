# andrelucas/Julia-1-GGUF

## Resumen

Julia-1 es un modelo de decisión (decision model) multilingüe desarrollado por Supersonic Labs, no un modelo generativo. Dado un estado (`state`) en texto o JSON, una pregunta (`question`), un tipo de pregunta (`choice`, `score` o `noul`, este último booleano) y entre 2 y 20 opciones, devuelve un logit por cada opción en lugar de generar texto. Su uso típico es el enrutamiento y la clasificación: elegir una opción, puntuar alternativas o responder sí/no sobre un estado dado.

Arquitectónicamente es un encoder mmBERT-small de la familia ModernBERT (22 capas, dimensión oculta 384, vocabulario de 256.000 tokens, contexto de 8.192 tokens) seguido de una cabeza de decisión tipada, con 144,19 millones de parámetros en total. El repositorio que nos ocupa, `andrelucas/Julia-1-GGUF`, es una conversión comunitaria e independiente a formato GGUF del modelo original `SupersonicLabs/Julia-1`, publicada bajo licencia Apache 2.0 y validada contra la implementación de PyTorch original.

La relevancia de esta conversión está en el rendimiento en inferencia: al ejecutarse con el runtime `julia1-cli` (C++/ggml, con soporte de Metal y CPU) sobre un Apple M1 Pro, responde en 12,3 ms por petición con kernels F32 exactos en Metal y en 11,4 ms con el archivo F16 y la opción `--fast`, lo que supone entre 4,9 y 5,3 veces más velocidad que el PyTorch original en CPU. El modelo completo no funciona en llama.cpp de fábrica, porque la cabeza de decisión no existe como arquitectura en ese runtime; para ello hay una exportación específica (`laya`) ligada al PR #29363 de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (mmBERT-small) de 22 capas con cabeza de decision tipada; arquitectura GGUF propia `julia1` (y exportacion alternativa `laya`) |
| Parametros totales | 144,19 M (140.493.696 parametros reales segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | F32, F16, F16 con tabla de embeddings en Q8_0 (receta `base=F16;token_embd.weight=Q8_0`); BF16 y Q8_0 en matrices del encoder probados pero no publicados; Q5_0 y Q4_0 descartados por perdida de decisiones; los k-quants no son aplicables (filas de 384 y 1152 no son multiplos de 256) |
| Idiomas soportados | Multilingue (lista concreta de idiomas no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (arquitecturas `julia1`, `modern-bert` y `laya`); original en PyTorch/safetensors |

Datos adicionales: dimension oculta 384, vocabulario de 256.000 tokens, tamano del repositorio 2,6 GB, pipeline declarado `text-classification`, creado el 29 de septiembre de 2026 (0 descargas y 0 likes en el momento de redactar esta ficha).

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT (variante mmBERT-small) que transforma el estado y la pregunta en una representacion comun, sobre la que actua una cabeza de decision tipada que emite un logit por opcion. El tipo de pregunta condiciona la cabeza: `choice` para elegir, `score` para puntuar y `noul` para una respuesta booleana. La ventana de contexto es de 8.192 tokens y el vocabulario de 256.000 entradas, coherente con un encoder multilingue de cobertura amplia. En esta conversion, la cabeza de decision y todos los tensores unidimensionales se mantienen siempre en F32; el tipo indicado en el nombre del archivo se aplica unicamente a las matrices del encoder.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esos datos figuran como no disponibles. Lo que si se documenta es el proceso de validacion de la conversion: los archivos F32 y F16 reproducen exactamente el comportamiento del PyTorch original, con 2000 de 2000 decisiones identicas y la misma exactitud (1451/2000) sobre el conjunto de prueba. La innovacion tecnica destacable es la propia especificacion del formato (`SPEC.md` del repositorio `julia1-cli`), que define una arquitectura GGUF nueva capaz de transportar la cabeza de decision, algo que el formato GGUF de llama.cpp no cubria hasta ahora.

## Capacidades

- Decision y clasificacion tipada: recibe un estado, una pregunta y entre 2 y 20 opciones, y devuelve un logit por opcion.
- Tres modos de consulta: seleccion (`choice`), puntuacion (`score`) y respuesta booleana (`noul`).
- Enrutamiento (routing) de peticiones o candidatos, uno de los casos declarados en las etiquetas del modelo.
- Extraccion de caracteristicas: la etiqueta `feature-extraction` esta presente, y los archivos `Julia-1-encoder-*.gguf` producen estados ocultos por token en llama.cpp de fabrica.
- Capacidad multilingue, sin desglose de idiomas publicado.
- No es un modelo generativo: no produce texto libre, ni razonamiento encadenado, ni codigo, ni matematicas como salida.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico nativo; el uso como enrutador dentro de un agente seria una integracion externa, no una capacidad del modelo.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Enrutamiento de peticiones en una plataforma de IA: dada la consulta del usuario como estado y una lista de 2 a 20 modelos o herramientas como opciones, el modelo devuelve el logit de cada una para seleccionar el destino. El modo `choice` esta pensado exactamente para esto.
- Triage de tickets de soporte: con el texto del ticket como estado y un conjunto cerrado de categorias o equipos como opciones, se asigna el ticket sin generar texto, lo que simplifica el postprocesado y evita alucinaciones de formato.
- Moderacion de contenido: formulada como pregunta booleana (`noul`) sobre un estado de texto, permite aceptar o rechazar contenido con una sola inferencia de 11-12 ms.
- Clasificacion de alertas en observabilidad: el estado puede ser JSON con metricas o eventos, y las opciones pueden ser niveles de severidad o runbooks; el modo `score` permite ordenar alternativas en lugar de elegir una sola.
- Seleccion de herramienta en pipelines automatizados: entre 2 y 20 herramientas candidatas, el modelo puntua cual es mas adecuada dado el estado del sistema. Es una decision puntual, no un bucle de agente.
- Anotacion y etiquetado a escala: al coste de 12,3 ms por peticion en Metal F32 y 11,4 ms con `--fast` y F16, resulta viable procesar corpus grandes con un modelo de 144 M de parametros que cabe en cualquier equipo.
- Respuesta a cuestionarios y formularios: estados en JSON con las respuestas acumuladas y opciones predefinidas para validar coherencia o elegir la siguiente rama del formulario.
- Verificacion de afirmaciones contra un contexto dado: con el contexto como estado y un conjunto de afirmaciones candidatas, el modo `score` prioriza cuales estan respaldadas por el texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de validacion son internos, comparando la conversion GGUF contra el modelo PyTorch original sobre el conjunto de prueba `typed-decisions`:

| Archivo | Arquitectura | Tamano (MB) | Decisiones coincidentes con PyTorch | Exactitud | Notas |
|---|---|---|---|---|---|
| `Julia-1-F32.gguf` | `julia1` | 592,7 | 2000/2000 | 1451 | Referencia exacta |
| `Julia-1-F16.gguf` | `julia1` | 311,7 | 2000/2000 | 1451 | Mitad de tamano, mismo resultado |
| `Julia-1-F16-embdQ8_0.gguf` | `julia1` | 219,6 | 1990-1992/2000 | 1452 | El mas pequeno publicado |
| `Julia-1-laya-F32.gguf` | `laya` | 592,0 | 2000/2000 | No disponible | Validado en el runtime del PR #29363 (CPU, commit `ffc55c93bc`) |
| Matrices BF16 (no publicado) | - | - | 1994/2000 | No disponible | Pierde decisiones frente a F16 |

Rendimiento medido en un Apple M1 Pro con `julia1-cli`: 12,3 ms por peticion con kernels F32 exactos en Metal, y 11,4 ms con `--fast` y el archivo F16. Frente al PyTorch original en CPU esto representa 4,9x y 5,3x de mejora, respectivamente. De estos factores se deduce que la referencia en PyTorch sobre CPU rondaba los 60 ms por peticion; ese valor es derivado, no publicado de forma explicita.

## Requisitos de hardware

- VRAM estimada: el archivo F32 ocupa 592,7 MB, el F16 311,7 MB y el F16 con embeddings en Q8_0 219,6 MB. Al ser pesos de un modelo de 144 M de parametros, cualquier GPU consumer con 1 GB libre es suficiente, y el modelo puede ejecutarse integramente en CPU.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU y en Metal (Apple Silicon, validado en M1 Pro). Cualquier RTX 3060 o superior, o incluso una iGPU, es mas que suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual, con un consumo de memoria inferior a 1 GB.
- Opciones de despliegue: `julia1-cli` (C++/ggml con CLI, servidor HTTP, API en C y paquete Python) para los archivos `julia1`; el paquete Python `julia1-gguf` del mismo repositorio (runtime de julia1-cli a traves de su API en C, o numpy); llama.cpp de fabrica solo para los archivos `Julia-1-encoder-*.gguf` (estados ocultos, sin decisiones); y el build del PR #29363 de llama.cpp para `Julia-1-laya-F32.gguf`. vLLM, TGI y Ollama no aparecen mencionados como soportados.
- Latencia y throughput estimados: 12,3 ms por peticion (Metal, F32 exacto) y 11,4 ms por peticion (`--fast`, F16) en Apple M1 Pro. El throughput no se publica, pero a partir de la latencia se situa en el orden de decenas de peticiones por segundo en un solo dispositivo; no se dispone de cifras para GPU dedicada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos de decision comparables en la informacion proporcionada, por lo que una comparacion con alternativas externas figura como no disponible. La comparacion relevante es entre las propias variantes y frente al modelo original:

| Modelo / variante | Parametros | Contexto | Formato | Decisiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `andrelucas/Julia-1-GGUF` (F32) | 144,19 M | 8.192 | GGUF `julia1` | 2000/2000, exactitud 1451 | Apache 2.0 | Publicado en HuggingFace |
| `andrelucas/Julia-1-GGUF` (F16 con embeddings Q8_0) | 144,19 M | 8.192 | GGUF `julia1` | 1990-1992/2000 | Apache 2.0 | Publicado en HuggingFace |
| `SupersonicLabs/Julia-1` (original) | 144,19 M | 8.192 | PyTorch/safetensors | Referencia (2000/2000) | No disponible en la informacion | HuggingFace del autor original |
| `Julia-1-encoder-*.gguf` | 144,19 M (solo encoder) | 8.192 | GGUF `modern-bert` | No produce decisiones | Apache 2.0 | Publicado en HuggingFace |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni razonamiento. Cualquier caso de uso que espere una respuesta en lenguaje natural requiere un modelo adicional.
- Limite duro de 2 a 20 opciones por consulta; no esta disenado para vocabularios abiertos ni para elegir entre cientos de candidatos en una sola pasada.
- Contexto maximo de 8.192 tokens, comun a todos los archivos.
- La lista concreta de idiomas soportados no esta publicada; la etiqueta es simplemente "multilingual", por lo que la cobertura real por idioma no puede verificarse con los datos disponibles.
- No hay benchmarks estandar publicados, solo validacion interna contra PyTorch sobre 2000 casos; el rendimiento en dominios ajenos al conjunto de prueba es desconocido.
- Riesgo de alucinacion: al emitir logits sobre un conjunto cerrado de opciones el margen de invencion es bajo, pero el modelo no expresa incertidumbre calibrada y no se documenta ningun mecanismo de abstención.
- El modelo completo no funciona en llama.cpp de fabrica. Requiere `julia1-cli` o el paquete `julia1-gguf`, o bien el build del PR #29363 para el archivo `laya`. Hasta que ese PR se integre, la ruta `laya` depende de un parche no fusionado.
- La CLI del PR (#29363) todavia no codifica las preguntas `noul` que llevan descripciones igual que lo hace Julia-1, lo que limita esa ruta de despliegue.
- Las cuantizaciones por debajo de F16 degradan el comportamiento: BF16 pierde 6 decisiones de 2000 y Q8_0 unas 60; Q5_0 y Q4_0 no se publican por perdida de decisiones, y los k-quants no son aplicables a este modelo.
- Esta conversion es un trabajo independiente de andrelucas y no esta afiliada ni respaldada por Supersonic Labs. Conviene verificar la licencia y condiciones del modelo base antes de un uso comercial, aunque el repositorio declara Apache 2.0.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni comunidad que haya reportado incidencias.
- Caveat de nomenclatura: `julia1` y `julia1-cli` se refieren al modelo, no al lenguaje de programacion Julia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andrelucas/Julia-1-GGUF
- Modelo base: https://huggingface.co/SupersonicLabs/Julia-1
- Pagina oficial del modelo en Supersonic Labs: https://supersoniclabs.ia.br/pt/julia-1/
- Repositorio del runtime `julia1-cli` (incluye el paquete Python `julia1-gguf`): https://github.com/alucassch/julia1-cli
- Especificacion del formato GGUF `julia1`: https://github.com/alucassch/julia1-cli/blob/main/SPEC.md
- PR #29363 de llama.cpp (arquitectura `laya`): https://github.com/ggml-org/llama.cpp/pull/29363
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2509.06888
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2412.13663
