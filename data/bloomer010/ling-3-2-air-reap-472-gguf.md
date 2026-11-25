# bloomer010/Ling-3.2-air-REAP-472-GGUF

## Resumen

Ling-3.2-air-REAP-472-GGUF es una version podada y cuantizada del modelo inclusionAI/Ling-3.2-air, un transformer de mezcla de expertos (MoE) de 124B parametros totales con 5,5B activos, desarrollado por InclusionAI. El autor de esta ficha derivada, bloomer010, aplica una pasada de poda de expertos mediante REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999), eliminando 40 de los 512 expertos enrutados por capa (un 8 % del total) y reduciendo el modelo a 114.972.929.952 parametros, manteniendo intacta la capacidad de activacion de 5,5B. El resultado se publica en formato GGUF para su uso directo en llama.cpp.

El modelo original esta disenado para tareas multimodales de imagen-texto y video-texto, con soporte de razonamiento en modo thinking y tool calling. Esta version podada conserva la torre de vision (requiere el fichero `mmproj-model-f16.gguf` de 875 MB para entrada visual) y se distribuye con licencia MIT, lo que facilita su adopcion comercial. La relevancia de esta ficha radica en que ofrece una via practica de ejecutar un MoE de mas de 100B parametros en hardware de consumo o servidor modesto, gracias a la combinacion de poda de expertos, cuantizacion y offloading selectivo de expertos a CPU.

La poda se realizo sin fine-tuning ni entrenamiento de recuperacion (one-shot), calibrada con 653K tokens (1.024 muestras) con una mezcla de 75 % codigo, 15 % matematicas y razonamiento, y 10 % chat general. Se ofrecen tres cuantizaciones (`Q8_0`, `Q4_K_M`, `Q2_K`) cortadas desde el maestro BF16 podado, con el bloque NextN/MTP omitido. El modelo esta soportado en llama.cpp a partir de la build b11190.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (BailingMoE3) con torre de vision |
| Parametros totales | 114.972.929.952 (114,97B) tras poda; 124B en el modelo base |
| Parametros activos | 5,5B |
| Longitud de contexto | Hasta 131.072 tokens (segun ejemplo de la model card con `-c 131072`) |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q2_K (GGUF); FP8 safetensors en repo hermano |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); safetensors FP8 en repo hermano |

## Arquitectura y entrenamiento

El modelo base Ling-3.2-air emplea una arquitectura de mezcla de expertos denominada BailingMoE3, con 512 expertos enrutados por capa organizados en 8 grupos de router (`n_group=8`), de los cuales se seleccionan 64 por grupo (59/64 tras la poda). Esta version derivada aplica REAP en una sola pasada: cada experto se puntua combinando el valor de la puerta del router con la norma L2 de su salida sobre un conjunto de calibracion, y se eliminan los de menor puntuacion de forma uniforme por grupo de router para preservar el enrutamiento top-k agrupado. No hay fine-tuning ni recuperacion posterior, por lo que la poda es puramente estructural.

La calibracion uso 653K tokens en 1.024 muestras con una distribucion de 75 % codigo, 15 % matematicas y razonamiento, y 10 % chat general. El bloque NextN/MTP (multi-token prediction) se omite en los GGUF publicados. El modelo base incorpora modo thinking activado por defecto, desactivable por peticion mediante `chat_template_kwargs`. La torre de vision procesa imagenes y muestrea fotogramas de video, codificandolos con el mismo encoder visual.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo (hasta 131.072 tokens).
- Razonamiento en modo thinking (activado por defecto, desactivable por peticion).
- Comprension de imagenes (image-text-to-text) mediante la torre de vision y el fichero `mmproj-model-f16.gguf`.
- Comprension de video: muestreo de fotogramas codificados por la misma torre de vision, con partes `video_url` en la API de chat.
- Generacion de codigo y matematicas (la calibracion de la poda prioriza estos dominios).
- Soporte de tool calling y function calling a traves de la plantilla Jinja (`--jinja` en llama.cpp).
- Capacidades de agente y razonamiento multi-paso derivadas del modo thinking.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 131K tokens) y adjuntar capturas o imagenes del usuario para resolver incidencias, gracias a su torre de vision integrada.
- Analisis de documentos con imagenes: procesar facturas, tickets o formularios escaneados junto con texto de contexto en un mismo prompt, usando el endpoint compatible con la API de chat de llama.cpp.
- Generacion de codigo en produccion: su entrenamiento de calibracion prioriza codigo (75 %) y soporta tool calling, por lo que puede integrarse en pipelines de CI/CD como asistente de revision o generacion de parches.
- Razonamiento matematico asistido: el modo thinking permite cadenas de razonamiento extendidas para resolver problemas de varios pasos, util en herramientas educativas o de analisis financiero.
- Descripcion y resumen de video: muestrear fotogramas de un video y generar resumenes o descripciones narradas mediante las partes `video_url` de la API, adecuado para catalogacion de contenido audiovisual.
- Despliegue en hardware mixto CPU/GPU: con `-ncmoe` o `-ot "ffn_.*_exps\.weight=CPU"` se pueden mantener los expertos en CPU y el resto en GPU, permitiendo servir el modelo en estaciones de trabajo con VRAM limitada.
- Agentes autonomos con herramientas: el soporte de function calling y razonamiento multi-paso permite construir agentes que consulten APIs externas y encadenen acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion. El repo completo ocupa 234,7 GB; `Q4_K_M` es la opcion recomendada para equilibrio precision/tamano, `Q8_0` para maxima fidelidad y `Q2_K` para maxima compresion (con mayor degradacion).
- GPU recomendadas: no disponible de forma explicita; por el tamano del modelo, se requiere configuracion multi-GPU (A100/H100) para carga completa en VRAM, o bien offloading de expertos a CPU.
- Cabe en GPU de consumo: no de forma completa; es posible mantener los expertos en CPU y el resto en GPU con `-ngl 99 -ot "ffn_.*_exps\.weight=CPU"`, o ajustar con `-ncmoe N`.
- Opciones de despliegue: llama.cpp (build b11190 o superior), `llama-server` con `--jinja`, `--flash-attn auto` y `--mmproj mmproj-model-f16.gguf` para vision.
- Latencia y throughput: no disponible.
- Nota de memoria: los pesos y el contexto comparten memoria; se recomienda dejar margen libre. El fichero `mmproj-model-f16.gguf` (875 MB) es obligatorio para entrada visual, no para chat solo texto.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ling-3.2-air-REAP-472 (esta ficha) | 114,97B / 5,5B | hasta 131.072 | MIT | GGUF, FP8 safetensors | Poda REAP del 8 % de expertos, sin fine-tuning |
| inclusionAI/Ling-3.2-air (base) | 124B / 5,5B | no disponible | MIT (segun etiqueta del derivado) | safetensors | Modelo original sin podar |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- La poda REAP es one-shot y sin recuperacion: puede degradar la calidad en dominios poco representados en la calibracion (el 10 % de chat general es la porcion menor).
- El bloque NextN/MTP se omite en los GGUF, por lo que se pierde la decodificacion especulativa multi-token del modelo base.
- Las cuantizaciones agresivas (`Q2_K`) pueden producir errores y comportamientos degradados; el propio autor advierte de "slop and misbehavin'" en ficheros pequenos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de fidelidad para esta version podada.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue uniforme.
- La licencia MIT permite uso comercial, pero el modelo base y sus derivados deben verificarse contra los terminos de inclusionAI.
- Para vision es obligatorio el fichero `mmproj-model-f16.gguf`; sin el, solo funciona el chat de texto.
- El modelo es experimental segun el propio autor ("This is an experimental REAP"); no se recomienda para produccion critica sin evaluacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bloomer010/Ling-3.2-air-REAP-472-GGUF
- Repo hermano FP8 safetensors: https://huggingface.co/bloomer010/Ling-3.2-air-REAP-472
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Paper REAP: https://arxiv.org/abs/2510.13999
