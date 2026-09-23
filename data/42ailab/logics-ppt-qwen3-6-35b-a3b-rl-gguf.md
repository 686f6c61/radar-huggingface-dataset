# 42ailab/Logics-PPT-Qwen3.6-35B-A3B-RL-GGUF

## Resumen

Logics-PPT-Qwen3.6-35B-A3B-RL-GGUF es una cuantización en formato GGUF del modelo Logics-PPT-Qwen3.6-35B-A3B-RL, desarrollado por el equipo Logics de Alibaba y publicado bajo licencia Apache-2.0. No se trata de un modelo nuevo: 42ailab ha convertido los pesos oficiales a GGUF (concretamente Q4_K_M) y ha añadido sus propias pruebas. La capacidad real reside en el modelo original, que es un MoE de 35B parámetros totales y aproximadamente 3B activos, afinado mediante aprendizaje por refuerzo para generar una única diapositiva HTML en formato 16:9 a partir de un bloque de contenido.

El problema que resuelve es muy concreto: en la preparación de presentaciones el texto normalmente ya está escrito y el tiempo se consume en la maquetación (colores, alineación, tarjetas, jerarquía visual de cifras). El modelo upstream fue refinado con RL puntuando las diapositivas renderizadas según cinco medidas de layout (relación de aspecto, espacio en blanco, ausencia de solapamientos, equilibrio visual y tamaños de fuente legibles). El resultado es HTML, no un fichero de PowerPoint, y trabaja de una diapositiva en una pasada.

Su relevancia actual es doble. Por un lado, es un ejemplo de modelo especializado en una tarea acotada en lugar de propósito general. Por otro, esta variante GGUF permite ejecutarlo localmente en hardware de consumo o en equipos Apple Silicon, con un consumo de memoria aproximado de 32 GB (el fichero pesa 19,7 GiB) y velocidades de 30 a 38 tok/s medidas en un Apple M3 Max. Admite chino e inglés y mantiene la naturaleza multimodal del modelo base mediante un codificador de visión separado, aunque este no es necesario para generar diapositivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), derivada de Qwen3.6-35B-A3B; modelo base multimodal con torre de visión |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | ~3B (MoE, segun descripcion del autor) |
| Longitud de contexto | no disponible (el autor fija un tope de salida de 8192 tokens) |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada en este repositorio); codificador de visión en f16 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 (heredada del modelo upstream) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura de mezcla de expertos (MoE) con 35B parametros totales y aproximadamente 3B activos por token, construido sobre la familia Qwen3.6-35B-A3B. El repositorio incluye ademas un codificador de visión (`mmproj-Logics-PPT-Qwen3.6-35B-A3B-RL-f16.gguf`, 0,84 GiB) que refleja el caracter multimodal del modelo base, aunque para la tarea de generacion de diapositivas no es necesario. La informacion disponible no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset.

La innovacion principal es el ajuste por aprendizaje por refuerzo orientado especificamente a maquetacion: el modelo upstream fue refinado puntuando las diapositivas renderizadas segun cinco medidas de layout (relacion de aspecto, espacio en blanco, ausencia de elementos solapados, equilibrio visual y tamano de fuente legible). El modelo base fue desarrollado por el equipo Logics de Alibaba. El autor de esta ficha indica que el uso real previsto por el upstream combina el modelo con un framework de agentes que realiza multiples llamadas a herramientas, re-renderiza y revisa; esta variante GGUF genera en una sola pasada, por lo que queda por debajo de los resultados reportados en el paper original.

## Capacidades

- Generacion de una diapositiva HTML en formato 16:9 (lienzo fijo de 1280x720 px) a partir de un bloque de contenido con titulo, puntos y cifras.
- Maquetacion automatica: gestion de colores, alineacion, tarjetas, jerarquia tipografica y equilibrio visual.
- Modo de razonamiento (thinking) activable, aunque viene desactivado por defecto en el empaquetado de 42model.
- Generacion bilinguee chino/ingles.
- Capacidad conversacional: si se le entrega solo contenido sin instrucciones de diseno, responde como un asistente de chat en lugar de producir una diapositiva.
- Base multimodal con torre de vision disponible en el repositorio (no requerida para la tarea de diapositivas).
- No se documenta soporte de tool calling, function calling ni comportamiento agentico en esta variante GGUF; el autor senala que el uso agentico corresponde al upstream y no a esta generacion en una pasada.

## Casos de uso

- Generacion rapida de diapositivas corporativas: a partir del contenido ya redactado de una seccion, el modelo produce el HTML de una diapositiva con maquetacion limpia, lo que ahorra el trabajo de alineacion y jerarquia visual.
- Creacion de plantillas base para equipos de diseno: el HTML generado sirve como punto de partida que luego se refina manualmente, aprovechando que el modelo respeta instrucciones de lienzo y estilo.
- Automatizacion de informes periodicos: integrado en un script que recibe metricas y puntos clave, genera las diapositivas de un informe recurrente y las exporta a un formato final.
- Prototipado de presentaciones para ventas o pitch: con contenido ligero (pocos puntos) el modelo coloca todos los elementos dentro del lienzo con colores consistentes, segun las pruebas del autor.
- Despliegue local con requisitos de privacidad: al ejecutarse en GGUF sobre llama.cpp o herramientas equivalentes, el contenido sensible de la presentacion no sale de la maquina del usuario.
- Uso educativo y de aprendizaje: como ejemplo practico de modelo especializado en layout y de generacion estructurada de HTML.
- Pipeline de generacion de contenido a partir de datos estructurados: dado que admite contenido denso con cifras, puede alimentarse desde una fuente de datos para producir visualizaciones tipo tarjeta (con la advertencia de que en contenido denso puede desbordar el lienzo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta pruebas cualitativas propias: 15 ejecuciones de Q4_K_M en un Apple M3 Max.

| Caso (15 ejecuciones en M3 Max) | Resultado |
|---|---|
| Contenido ligero (pocos puntos), con instrucciones | Las 7 pruebas encajan en el lienzo, con maquetacion ordenada y colores consistentes |
| Contenido denso (una docena de cifras), thinking activado | Instrucciones simples: las 3 pruebas desbordaron el lienzo. Reforzando "debe encajar": 1 de 2 encajo |
| Contenido denso, thinking desactivado, reforzando "debe encajar" | Ambas encajaron; en una el pie de pagina se solapo ligeramente con la ultima tarjeta |
| Anade contenido propio | Si, por ejemplo un "valor medio por cliente: 1,53" inventado o una sugerencia no solicitada. Menos frecuente con thinking desactivado, pero no desaparece |
| Solo contenido, sin instrucciones | No genera diapositiva: responde como un asistente de chat (1 ejecucion) |
| Velocidad | ~30-38 tok/s; 45-90 s por diapositiva con thinking desactivado y 33-270 s con thinking activado |

El autor advierte que cada fila se basa en 2-3 ejecuciones, suficiente para mostrar que ocurre algo, pero no para establecer una tasa de exito.

## Requisitos de hardware

- Memoria total necesaria: aproximadamente 32 GB (el fichero del modelo pesa 19,7 GiB y el codificador de vision 0,84 GiB).
- VRAM estimada para inferencia en Q4_K_M: en torno a 20-24 GB para descargar los pesos por completo en GPU, mas el espacio para cache KV y contexto (estimacion orientativa, no publicada por el autor).
- GPU recomendadas: cabe en GPU de consumo de gama alta con 24 GB, como RTX 3090 o RTX 4090. Para despliegue en servidor, A100 o H100 ofrecen margen sobrado y mayor throughput.
- Apple Silicon: verificado en Apple M3 Max con 30-38 tok/s.
- Opciones de despliegue: llama.cpp (formato nativo), y por extension herramientas compatibles con GGUF como Ollama o LM Studio; tambien vLLM o TGI si se convierte desde los pesos originales. El autor empaqueta una integracion propia en 42model con descarga via `42model download logics-ppt`.
- Latencia: 45-90 s por diapositiva con thinking desactivado y 33-270 s con thinking activado en M3 Max.
- Alternativa sin GPU dedicada: ejecucion en CPU con 32 GB de RAM, con la penalizacion de velocidad correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| 42ailab/Logics-PPT-Qwen3.6-35B-A3B-RL-GGUF (este) | 34,66B totales / ~3B activos | no disponible | GGUF Q4_K_M | Apache-2.0 | Cuantizacion para inferencia local; ~32 GB de memoria |
| Logics-MLLM/Logics-PPT-Qwen3.6-35B-A3B-RL | 34,66B totales / ~3B activos | no disponible | safetensors (precision completa) | Apache-2.0 | Modelo upstream; mejor calidad potencial, mas recursos |
| Qwen/Qwen3.6-35B-A3B | ~35B totales / ~3B activos | no disponible | safetensors | no disponible en la informacion recogida | Base generalista de la familia, sin el ajuste por RL de maquetacion |

No se dispone de modelos comparables especificamente entrenados para generacion de diapositivas HTML en la informacion proporcionada.

## Limitaciones y advertencias

- Genera una sola diapositiva por ejecucion; no compone presentaciones completas ni mantiene coherencia entre diapositivas.
- La salida es HTML, no un fichero PPTX de PowerPoint.
- Riesgo de alucinacion confirmado: el modelo anade contenido no presente en la fuente (cifras inventadas, sugerencias no solicitadas). El autor recomienda verificar cifras y datos antes de mostrar la diapositiva.
- Con contenido denso puede desbordar el lienzo de 1280x720 o provocar solapamientos; el modo thinking no garantiza que encaje.
- Sin instrucciones de diseno explicitas, responde como un asistente de chat en lugar de generar la diapositiva.
- El prompt de sistema probado esta en chino; el autor no ha validado una traduccion al ingles.
- Requiere una maquina con aproximadamente 32 GB de memoria, lo que excluye muchos portatiles de gama media.
- La licencia Apache-2.0 permite uso comercial, pero esta variante tiene pocas descargas y no cuenta con validacion externa.
- Las pruebas reportadas se basan en 2-3 ejecuciones por caso, sin tasa de exito estadisticamente significativa.
- Solo se publica la cuantizacion Q4_K_M, con la perdida de calidad que ello implica frente a los pesos originales.
- Idiomas limitados a chino e ingles.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/42ailab/Logics-PPT-Qwen3.6-35B-A3B-RL-GGUF
- Modelo upstream en HuggingFace: https://huggingface.co/Logics-MLLM/Logics-PPT-Qwen3.6-35B-A3B-RL
- Pagina alternativa del modelo upstream: https://huggingface.co/Logics-MLLM/Logics-PPT-Qwen-3.6-35B-A3B-RL
- Ficha de terceros sobre el modelo upstream: https://savrn.com/models/logics-ppt-qwen-3-6-35b-a3b-rl
- Modelo en ModelScope: https://modelscope.cn/models/42ailab/Logics-PPT-Qwen3.6-35B-A3B-RL-GGUF
- Modelo base generalista Qwen3.6-35B-A3B: https://www.modelscope.cn/models/Qwen/Qwen3.6-35B-A3B
- Sitio del autor: https://42ailab.com
- Empaquetado 42model: https://42model.com
