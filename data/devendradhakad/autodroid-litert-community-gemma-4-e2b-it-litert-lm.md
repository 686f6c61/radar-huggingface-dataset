# devendradhakad/autodroid-litert-community-gemma-4-E2B-it-litert-lm

## Resumen

Este repositorio contiene una redistribucion del modelo `litert-community/gemma-4-E2B-it-litert-lm`, publicado por el usuario `devendradhakad` bajo el identificador `autodroid-litert-community-gemma-4-E2B-it-litert-lm`. Se trata, por el nombre y las etiquetas, de una conversion del checkpoint original `google/gemma-4-E2B-it` al formato LiteRT-LM, el runtime de inferencia en dispositivo de Google derivado del antiguo TensorFlow Lite. El objetivo de esta familia de artefactos es ejecutar un modelo de lenguaje instruido directamente en moviles, equipos de escritorio e incluso dispositivos IoT o navegador, sin depender de una API en la nube.

El problema que resuelve es el de la inferencia local con requisitos de memoria reducidos: la conversion a LiteRT-LM permite desplegar el modelo en Android, iOS, Linux de escritorio y Web mediante los runners oficiales de Google, con el modelo ocupando 2,6 GB en el repositorio. El sufijo "E2B" de la nomenclatura de Google apunta a una variante de aproximadamente 2.000 millones de parametros efectivos, aunque la model card disponible no confirma parametros, contexto ni composicion del entrenamiento.

La relevancia de esta ficha es limitada y conviene ser explicito: el repositorio no aporta model card propia (solo replica la cabecera de licencia y enlaces), no tiene descargas ni likes registrados, no declara idiomas ni pipeline, y la busqueda web asociada no devolvio ninguna fuente tecnica util. Todo dato no verificable se marca a continuacion como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta en el repositorio; el modelo base es de la familia Gemma) |
| Parametros totales | no disponible (el sufijo E2B sugiere ~2B efectivos, sin confirmar) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tamano del repo, 2,6 GB, sugiere pesos en 4 u 8 bits, sin confirmar) |
| Idiomas soportados | no disponible (la ficha no declara idiomas) |
| Licencia | apache-2.0 (declarada en las etiquetas del repositorio) |
| Formato de pesos | LiteRT-LM (derivado del identificador y las etiquetas del repo; el modelo base esta en formato de transformers) |

Datos adicionales del repositorio: autor `devendradhakad`, 0 descargas, 0 likes, sin pipeline declarado, region `us`, creado el 17 de septiembre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF, DPO u otros) de este repositorio. La model card incluida es una copia de la cabecera de `litert-community/gemma-4-E2B-it-litert-lm`: contiene la licencia, un enlace a `google/gemma-4-E2B-it`, una tabla de botones de descarga para Android, iOS, escritorio, IoT y Web, y varias secciones de rendimiento ("Gemma 4 E2B Performance on LiteRT-LM", "Gemma 4 E2B Performance on Web") que aparecen vacias, sin tablas ni cifras.

Lo unico verificable es la funcion del artefacto: es un contenedor de pesos en formato LiteRT-LM, listo para los runners de Google AI Edge. Cualquier afirmacion sobre atencion, mezcla de expertos, atencion lineal o decodificacion especulativa seria especulacion y no se incluye aqui. Para conocer la arquitectura real hay que acudir al modelo original `google/gemma-4-E2B-it`, cuya documentacion no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: el modelo base es una variante "it" (instruction-tuned), por lo que esta orientado a seguir instrucciones y mantener dialogos multi-turno.
- Inferencia en dispositivo: es la capacidad diferencial del formato. El artefacto esta pensado para ejecutarse en Android, iOS, escritorio, IoT y navegador mediante LiteRT-LM.
- Ejecucion sin conectividad: al ser un runtime local, permite funcionamiento completamente offline, lo que habilita escenarios de privacidad estricta.
- Integracion con las apps oficiales de Google: funciona con Google AI Edge Gallery (Android e iOS), con la CLI de LiteRT-LM y con la demo de inferencia LLM de MediaPipe Studio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (la ficha no declara idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistente conversacional offline en movil: el modelo puede empaquetarse dentro de una app Android o iOS mediante Google AI Edge Gallery o una integracion propia, de forma que el usuario converse sin que sus mensajes salgan del dispositivo. Es adecuado porque el formato LiteRT-LM esta disenado precisamente para ese entorno de ejecucion.
- Procesamiento privado de notas y documentos locales: resumen, reescritura y extraccion de datos de ficheros que el usuario no quiere subir a un servicio en la nube. El atractivo es la ausencia de transferencia de datos, no una calidad de generacion equiparable a modelos de mayor tamano.
- Clasificacion y etiquetado de texto en el borde: categorizar tickets, correos o mensajes en un dispositivo o pasarela local antes de decidir si requieren escalado a un modelo mayor en servidor, reduciendo coste de API y latencia de red.
- Asistentes embebidos en dispositivos IoT o kioscos: la CLI de LiteRT-LM permite desplegar el modelo en equipos sin GPU dedicada, por ejemplo terminales de atencion en tienda o paneles interactivos con conectividad intermitente.
- Prototipado rapido en navegador: la demo de LLM Inference de MediaPipe Studio permite probar el modelo en Web sin instalar nada, util para validar prompts y flujos antes de invertir en desarrollo nativo.
- Traduccion y redaccion asistida de baja latencia: en escenarios donde interesa una respuesta inmediata y local (correccion de frases, reformulacion), un modelo de ~2B efectivos en dispositivo evita el coste de ida y vuelta a un servidor.
- Filtrado y moderacion local de contenido: prefiltrar texto generado por usuarios en el propio dispositivo antes de enviarlo, como primera capa de un sistema de moderacion en cascada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio incluye encabezados para "Gemma 4 E2B Performance on LiteRT-LM" y "Gemma 4 E2B Performance on Web", pero ambos apartados estan vacios. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas de latencia o tokens por segundo.

## Requisitos de hardware

- VRAM/RAM de inferencia: no disponible oficialmente. Como referencia orientativa, el repositorio ocupa 2,6 GB, por lo que cabe esperar un consumo de memoria del orden de 2 a 4 GB durante la inferencia, cifra estimada a partir del tamano de los pesos y no confirmada por el autor.
- GPU recomendadas: no se especifican. El formato LiteRT-LM esta orientado a aceleracion en CPU, GPU integrada y NPU de dispositivos moviles, no a GPUs de centro de datos.
- Cabe en GPU de consumo: si, previsiblemente cualquier GPU con 4 GB o mas de memoria puede alojar los pesos, aunque el objetivo del artefacto no es ese escenario. No hay requisitos publicados.
- Despliegue: Google AI Edge Gallery (Android e iOS), CLI de LiteRT-LM (escritorio e IoT) y MediaPipe Studio (Web). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que trabajan con otros formatos de pesos.
- Latencia y throughput: no disponibles. No hay cifras publicadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `devendradhakad/autodroid-litert-community-gemma-4-E2B-it-litert-lm` (este repo) | no disponible | no disponible | apache-2.0 (declarada) | 0 descargas, 0 likes, redistribucion de terceros | Copia del artefacto LiteRT-LM |
| `litert-community/gemma-4-E2B-it-litert-lm` | no disponible | no disponible | no disponible en esta informacion | Repositorio de referencia citado en la model card | Version upstream del mismo formato |
| `google/gemma-4-E2B-it` | no disponible | no disponible | no disponible en esta informacion (los modelos Gemma suelen usar los terminos de uso de Gemma, no Apache 2.0) | Modelo original referenciado | Checkpoint base del que deriva la conversion |

No se dispone de datos de rendimiento de ninguno de los tres, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad, y en la mayoria de celdas el valor es "no disponible". No se han identificado en la busqueda web alternativas comparables con cifras verificables.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: el repositorio no publica parametros, contexto, idiomas, datos de entrenamiento ni benchmarks. Cualquier uso en produccion exige validacion previa contra el modelo original.
- Redistribucion de terceros: el autor (`devendradhakad`) no es el desarrollador del modelo ni de la conversion. No hay garantia de que los pesos coincidan bit a bit con los del repositorio `litert-community` original.
- Discrepancia de licencia: el repositorio declara `apache-2.0`, pero la familia Gemma de Google se distribuye habitualmente bajo los terminos de uso de Gemma, no bajo Apache 2.0. Antes de un uso comercial hay que verificar que licencia aplica realmente al checkpoint subyacente.
- Riesgo de alucinacion: no evaluado en la informacion disponible. En modelos de ~2B efectivos el riesgo suele ser alto en tareas de conocimiento factual; se recomienda verificacion externa y acotar el uso a tareas de transformacion de texto con contexto aportado.
- Sesgos: no documentados. No hay ninguna evaluacion de sesgo, toxicidad o equidad en el repositorio.
- Limitaciones de idioma: no declaradas. No se puede asumir buen rendimiento en castellano sin una evaluacion propia.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de otros usuarios y mayor probabilidad de errores no detectados en el empaquetado.
- Fechas de creacion y actualizacion anomales (17 de septiembre de 2026, con solo dos segundos de diferencia entre ambas), lo que sugiere un proceso de subida automatizado.
- Restricciones de despliegue: el formato LiteRT-LM no es compatible con los stack de inferencia habituales en servidor (vLLM, TGI, llama.cpp, Ollama), lo que limita las opciones de escalado horizontal.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/devendradhakad/autodroid-litert-community-gemma-4-E2B-it-litert-lm
- Repositorio upstream citado en la model card: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Modelo original: https://huggingface.co/google/gemma-4-E2B-it
- CLI de LiteRT-LM: https://ai.google.dev/edge/litert-lm/cli
- Google AI Edge Gallery para Android: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery para iOS: https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Demo de inferencia LLM en MediaPipe Studio: https://mediapipe-studio.webapps.google.com/studio/demo/llm_inference

Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con este modelo (foros en frances sobre verificacion de Facebook y Canva, y articulos en vietnamita sobre Canva AI), por lo que no se incluye ninguno como fuente.
