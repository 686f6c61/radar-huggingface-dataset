# localdadmin/Mellum2.1-12B-A2.5B-Thinking-Sm

## Resumen

Mellum2.1-12B-A2.5B-Thinking-Sm es una cuantizacion en formato GGUF del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicada por el usuario localdadmin. Se trata de una variante cuantizada a Q2_K de un modelo de arquitectura Mixture of Experts (MoE) con 12.149.923.072 parametros totales y aproximadamente 2.500 millones de parametros activos por token, segun indica el propio nombre del modelo. El repositorio ocupa 5,2 GB, un tamano coherente con una cuantizacion agresiva de 2 bits.

El modelo base lo desarrolla JetBrains y esta orientado a tareas conversacionales y de razonamiento, con un modo "Thinking" explicito en su denominacion. Esta ficha describe la version cuantizada distribuida por localdadmin, que hereda la licencia Apache 2.0 del modelo original y anade la etiqueta imatrix, lo que sugiere que la cuantizacion se genero con una matriz de importancia para preservar mejor la calidad en bits bajos.

La relevancia de esta publicacion es practica: permite ejecutar un modelo MoE de 12B parametros totales con solo 2,5B activos en hardware modesto, gracias a la reduccion de peso a unos 5 GB. No obstante, la informacion publicada por el autor de la cuantizacion es minima (solo indica el formato y el nivel Q2_K), por lo que muchos datos tecnicos quedan como no disponibles y deben consultarse en el repositorio del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun el nombre del modelo; detalles no disponibles |
| Parametros totales | 12.149.923.072 |
| Parametros activos | ~2.500 millones (segun denominacion A2.5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (GGUF); generada con imatrix segun tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 5,2 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, a juzgar por la nomenclatura "12B-A2.5B", que indica 12.000 millones de parametros totales y 2.500 millones activos por token. Esta configuracion reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano, ya que solo se activa una fraccion de los expertos en cada paso. La variante "Thinking" sugiere un entrenamiento orientado a razonamiento explicito, con cadenas de pensamiento antes de la respuesta final.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o RL con verificacion. Tampoco se detalla si emplea attention lineal, decodificacion especulativa u otras innovaciones. La unica informacion tecnica adicional es la de la cuantizacion: Q2_K con imatrix, una tecnica que pondera la importancia de cada tensor para minimizar la perdida de calidad en cuantizaciones de muy baja precision.

## Capacidades

- Generacion de texto conversacional, segun el tag "conversational" del repositorio.
- Razonamiento explicito en modo "Thinking", inferido del nombre del modelo base.
- Capacidad de ejecucion local en CPU/GPU gracias al formato GGUF y al reducido tamano de la cuantizacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Vision, audio u otras modalidades: no disponible.
- Etiqueta "endpoints_compatible", que sugiere compatibilidad con endpoints de inferencia tipo API.

## Casos de uso

- Despliegue local en estaciones de trabajo: con unos 5 GB de pesos, el modelo puede cargarse en GPUs de consumo como una RTX 3060 de 12 GB o una RTX 4070, dejando margen para el contexto y el cache KV.
- Prototipado de asistentes conversacionales: el tag "conversational" y el modo Thinking permiten construir chatbots con razonamiento visible antes de responder, util para depuracion de flujos.
- Evaluacion rapida de modelos MoE: investigadores que quieran comparar el comportamiento de un MoE de 12B/2,5B activos frente a modelos densos equivalentes sin invertir en infraestructura grande.
- Inferencia en entornos con VRAM limitada: la cuantizacion Q2_K permite ejecutar el modelo en GPUs de 8 GB o incluso en CPU con llama.cpp, a costa de cierta perdida de calidad.
- Integracion en pipelines compatibles con endpoints: la etiqueta "endpoints_compatible" sugiere su uso detras de servidores de inferencia que expongan una API compatible con OpenAI.
- Experimentacion con cuantizaciones imatrix: util para quienes estudian el impacto de la matriz de importancia en la calidad de modelos MoE a 2 bits.
- Pruebas de razonamiento en local: el modo Thinking permite experimentar con cadenas de razonamiento sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,2 GB solo para los pesos en Q2_K; con cache KV y overhead, se recomienda un minimo de 8 GB para contextos cortos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el segmento profesional, A10, L4, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas, especialmente en modelos de 12 GB o 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-Sm (esta ficha) | 12,15B | ~2,5B | no disponible | Apache 2.0 | GGUF Q2_K |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking (base) | 12,15B | ~2,5B | no disponible | Apache 2.0 | safetensors |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer comparaciones de rendimiento con otros modelos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion Q2_K es agresiva y puede degradar notablemente la calidad, especialmente en tareas de razonamiento y matematicas; se recomienda validar frente al modelo base antes de usar en produccion.
- El repositorio no declara idiomas soportados, por lo que el comportamiento multilingue es incierto.
- No se han publicado benchmarks ni evaluaciones de sesgo o alucinacion en la informacion disponible.
- La model card es minima y no documenta el proceso de cuantizacion, los parametros de imatrix ni las perdidas de calidad asociadas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base en su repositorio original antes de un uso comercial.
- El numero de descargas (32) y la ausencia de likes indican poca validacion por parte de la comunidad; tratar con cautela.
- El tag "model-cacher-ng" sugiere que el repositorio puede haberse generado de forma automatizada, lo que refuerza la necesidad de verificar la integridad de los pesos.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/localdadmin/Mellum2.1-12B-A2.5B-Thinking-Sm
- Arbol de archivos: https://huggingface.co/localdadmin/Mellum2.1-12B-A2.5B-Thinking-Sm/tree/main
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
