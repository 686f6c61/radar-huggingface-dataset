# solavr/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-1120ms-int8

## Resumen

El modelo `solavr/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-1120ms-int8` es una exportacion cuantizada a int8 en formato ONNX del modelo de reconocimiento automatico del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b`, empaquetada especificamente para ejecutarse con el runtime sherpa-onnx. Se trata, por tanto, de una redistribucion comunitaria orientada a despliegue en inferencia local, no de un entrenamiento original: el autor del repositorio es el usuario `solavr`, mientras que el modelo base y los pesos originales provienen de NVIDIA.

La relevancia de esta ficha esta en su perfil de despliegue: un modelo de aproximadamente 600 millones de parametros (segun el sufijo `0.6b` del nombre) en cuantizacion int8, con arquitectura FastConformer de tipo transducer (RNNT) y modo streaming. El sufijo `1120ms` del identificador apunta a la configuracion de tamano de chunk o latencia del modo streaming, una convencion habitual en las exportaciones de modelos NeMo a sherpa-onnx, donde existen variantes con distintos valores de chunk para intercambiar latencia por precision.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no aporta model card con benchmarks, lista de idiomas ni detalles de entrenamiento. La etiqueta `multilingual` indica soporte de multiples idiomas, pero no se especifica el conjunto concreto. La licencia declarada en las etiquetas es `openmdw-1.1`, si bien el campo de licencia de la ficha de HuggingFace aparece como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer transducer (encoder FastConformer + decoder RNNT), modo streaming |
| Parametros totales | Aproximadamente 600 millones (0,6B, segun el nombre del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; en ASR streaming la ventana se define por el chunk de audio, fijado en 1120 ms segun el nombre del repositorio |
| Tipos de cuantizacion | int8 (unica variante publicada en este repositorio) |
| Idiomas soportados | Multilingue (etiqueta del repositorio); lista concreta de idiomas no disponible |
| Licencia | openmdw-1.1 (etiqueta del repositorio); el campo de licencia de la ficha aparece como no disponible |
| Formato de pesos | ONNX cuantizado a int8, empaquetado para el runtime sherpa-onnx |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura FastConformer, una evolucion del Conformer con reduccion de la longitud de secuencia en el encoder para abaratar el coste computacional, combinada con un decoder de tipo transducer (RNNT) para la decodificacion de la salida acustica. La variante de streaming procesa el audio en chunks, lo que permite emitir transcripciones parciales de forma incremental en lugar de esperar a disponer de la senal completa. El identificador `1120ms` corresponde a la configuracion de tamano de chunk, que en la propagacion tipica de modelos NeMo a sherpa-onnx se ofrece en varios valores para ajustar la relacion entre latencia y calidad de transcripcion.

Este repositorio concreto no documenta el proceso de entrenamiento: no se indica el numero de tokens de audio utilizados, la composicion del dataset, ni si hubo etapas de ajuste fino con RLHF, DPO u otras tecnicas. Tampoco se detalla el proceso de cuantizacion aplicado para pasar los pesos a int8, mas alla de la referencia al runtime sherpa-onnx. En consecuencia, toda la informacion sobre datos de entrenamiento e innovaciones del modelo original debe consultarse en la ficha de `nvidia/nemotron-3.5-asr-streaming-0.6b`, que no forma parte de la informacion proporcionada en esta busqueda.

## Capacidades

- Reconocimiento automatico del habla en modo streaming, con emision incremental de transcripciones conforme llega el audio.
- Funcionamiento offline o local: al estar exportado en ONNX con cuantizacion int8, esta pensado para ejecutarse sin dependencia de servicios en la nube.
- Soporte multilingue declarado mediante la etiqueta del repositorio; no se detalla la cobertura linguistica concreta.
- Integracion con el ecosistema sherpa-onnx, disponible en C++, Python, Java, Kotlin, Swift, C# y otros bindings oficiales del proyecto.
- Compatibilidad con modos de despliegue en CPU, sin requerir GPU.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla del propio reconocimiento de voz.
- No se documenta modo de razonamiento explicito (thinking mode) ni puntuacion, diarizacion o marcas de tiempo, al no figurar en la informacion disponible.

## Casos de uso

- Subtitulado en directo de video y retransmisiones: el modo streaming con chunks de 1120 ms permite generar subtitulos con una latencia de aproximadamente un segundo, suficiente para emision en tiempo real sin esperar a que finalice el audio.
- Transcripcion de reuniones y notas de voz en local: al ejecutarse sobre sherpa-onnx en CPU, es adecuado para procesar audio confidencial en la propia maquina del usuario, sin enviar datos a terceros.
- Asistentes de voz embebidos y dispositivos IoT: el tamano de 0,6B en int8 mantiene el modelo en el orden de cientos de megabytes, lo que permite integrarlo en Raspberry Pi, mini-PC o terminales con recursos limitados.
- Analitica de llamadas de atencion al cliente: la transcripcion incremental sobre flujos de audio telefonicos facilita la alimentacion de sistemas de analisis de sentimiento o de deteccion de incidencias en practicamente tiempo real.
- Dictado en aplicaciones de escritorio: integrado via los bindings de sherpa-onnx, permite anadir entrada por voz a editores de texto o herramientas internas sin depender de APIs externas.
- Accesibilidad para personas con discapacidad auditiva: la transcripcion continua de conversaciones presenciales en un dispositivo movil ofrece soporte en contextos donde no hay conectividad.
- Preprocesado de pipelines de audio a texto a gran escala: el coste por hora de audio en CPU resulta bajo frente a modelos de mayor tamano, lo que permite cribar o indexar grandes volumenes de grabaciones antes de aplicar etapas mas costosas.
- Prototipado e investigacion en ASR: sirve como referencia para comparar variantes de cuantizacion int8 frente al modelo base en precision completa dentro del mismo framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de WER, CER ni comparaciones con otros modelos, y la busqueda web asociada no devolvio resultados relevantes sobre este modelo ni sobre su base. Cualquier cifra de rendimiento deberia obtenerse del repositorio de NVIDIA del modelo base o medirse directamente sobre el conjunto de evaluacion propio.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo esta pensado para ejecucion en CPU mediante sherpa-onnx.
- Memoria RAM estimada: en el orden de 1 a 2 GB para los pesos int8 de 0,6B mas el estado del runtime, aunque no se publica una cifra oficial.
- GPU recomendadas: no aplica; el runtime sherpa-onnx esta orientado a CPU, si bien existen buildes con aceleracion opcional que no se detallan en este repositorio.
- Compatibilidad con GPU de consumo: irrelevante para este artefacto, al estar disenado para CPU.
- Hardware de gama baja: por tamano y cuantizacion, es candidato razonable para placas tipo Raspberry Pi o mini-PC, aunque no hay validacion publicada en el repositorio.
- Opciones de despliegue: sherpa-onnx es el runtime objetivo (bindings en C++, Python, Java, Kotlin, Swift, C#, entre otros). Otras alternativas como vLLM, llama.cpp, Ollama o TGI no aplican, al no ser un modelo de lenguaje generativo.
- Latencia y throughput: no se publican mediciones. La latencia de emision esta directamente ligada al chunk de 1120 ms indicado en el nombre del repositorio, por lo que cabe esperar transcripciones parciales en ese orden de magnitud.

## Comparativa con modelos similares

Los datos de comparacion que se muestran a continuacion proceden de conocimiento general sobre estos modelos y no de la informacion proporcionada en esta busqueda, por lo que conviene verificarlos antes de usarlos en una decision tecnica. Las cifras de rendimiento se marcan como no disponibles al no existir resultados publicados para este repositorio.

| Modelo | Parametros | Modo | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| solavr/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-1120ms-int8 | ~0,6B | Streaming | ONNX int8 | openmdw-1.1 (segun etiqueta) | No disponible |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | ~0,6B | Streaming | Pesos NeMo | No verificada en la informacion disponible | No disponible |
| openai/whisper-small | ~244M | No streaming (ventanas de 30 s) | PyTorch, ONNX, GGUF en la comunidad | MIT | No disponible en esta ficha |
| nvidia/parakeet-tdt-0.6b-v2 | ~0,6B | No streaming | Pesos NeMo, ONNX comunitario | CC-BY-4.0 | No disponible en esta ficha |

Nota diferencial: frente a Whisper, este modelo prioriza el modo streaming y el despliegue en CPU mediante un runtime especifico, a cambio de un ecosistema de bindings mas reducido y de una licencia menos permisiva en apariencia que MIT. Frente a variantes de Parakeet, la diferencia principal esta en la cobertura de idiomas declarada y en el formato de empaquetado.

## Limitaciones y advertencias

- No se publican resultados de evaluacion; se desconoce el WER real de la variante int8 frente al modelo en precision completa, y la cuantizacion a int8 puede degradar la precision respecto al original.
- La lista concreta de idiomas soportados no esta disponible, pese a la etiqueta `multilingual`; el rendimiento por idioma es, por tanto, una incognita.
- El repositorio tiene 0 descargas, lo que implica ausencia de validacion por parte de la comunidad y de informes de fallos.
- El modelo esta acoplado al runtime sherpa-onnx; no es un artefacto reutilizable directamente en frameworks como PyTorch o vLLM.
- La licencia figura como `openmdw-1.1` en las etiquetas, pero el campo de licencia de la ficha aparece como no disponible. Antes de un uso comercial es imprescindible revisar los terminos exactos de esa licencia y las condiciones impuestas por el modelo base de NVIDIA.
- Riesgo de alucinacion y de errores de transcripcion en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario tecnico, sin que existan datos publicados para acotarlo.
- La latencia minima de emision viene condicionada por el chunk de 1120 ms, adecuada para subtitulado pero insuficiente para aplicaciones que exijan respuestas por debajo de unos cientos de milisegundos.
- No se documenta soporte de puntuacion, mayusculas, marcas de tiempo ni diarizacion; si el caso de uso los requiere, habra que anadirlos en una etapa posterior.
- La fecha de creacion y actualizacion del repositorio coinciden (2026-09-11), sin historial de mantenimiento posterior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/solavr/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-1120ms-int8
- Modelo base declarado en las etiquetas: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Documentacion del runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Proyecto NeMo de NVIDIA: https://github.com/NVIDIA/NeMo
- La busqueda web realizada no devolvio ningun enlace relevante sobre el modelo, su autor ni su base; los resultados obtenidos correspondian a un servicio de correo electronico sin relacion con el tema.
