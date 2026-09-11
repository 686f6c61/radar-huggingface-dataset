# pratikamin/appsec-router-deberta-r5

## Resumen

appsec-router-deberta-r5 es un cross-encoder basado en DeBERTa-v3-xsmall, desarrollado por el usuario pratikamin, que decide si una respuesta de entrevista (hablada o escrita) expresa un punto concreto descrito en una hipotesis. El modelo no genera texto: recibe un par (respuesta, hipotesis sobre el hablante) y devuelve una probabilidad sobre dos etiquetas, `demonstrated` y su negacion, con un umbral de decision fijado en 0,30. Se usa en produccion en el sitio appsecinterview.com para decidir que pregunta de seguimiento se muestra a continuacion.

Su relevancia es doble. Por un lado, es un ejemplo practico de destilacion de un router servido por `openai/gpt-oss-120b` hacia un modelo de 70,8 millones de parametros totales que corre integramente en el navegador del usuario mediante Transformers.js y ONNX en int8 (83 MB), con unos 65 ms por par en un portatil con cuatro hilos WASM. Por otro, es una muestra de especializacion extrema de dominio: solo cubre respuestas de entrevista de seguridad de aplicaciones en ingles, y su model card insiste en que no es un calificador ni debe usarse para evaluar a personas, ya que toda su supervision es sintetica.

El autor publica cifras de acuerdo con el modelo profesor en temas no vistos: 88% de precision, 77% de recall y F1 de 82% en el test de la ronda 5 (9.430 pares). Esas metricas miden concordancia con etiquetas generadas por un modelo, no con juicio humano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (cross-encoder), recabezado a clasificacion de secuencias con 2 etiquetas |
| Parametros totales | 70.830.722 (safetensors); el autor declara 22 M en el backbone |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens por par (truncado en entrenamiento) |
| Tipos de cuantizacion | fp32 (safetensors, 278 MB) e int8 (ONNX cuantizado, 83 MB, `dtype: "q8"`) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32) y ONNX (int8); libreria declarada: transformers.js |
| Modelo base | cross-encoder/nli-deberta-v3-xsmall |
| Etiquetas de salida | `demonstrated` / no demostrado (indice 1 = demostrado segun `config.json` -> `id2label`) |
| Umbral de decision | 0,30 (fichero `threshold.json`) |
| Dataset de entrenamiento | pratikamin/appsec-router-pairs-r5 (sintetico) |
| Tamano del repositorio | 0,4 GB |
| Pipeline | text-classification |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder DeBERTa-v3-xsmall (hidden de 384, 12 capas) con vocabulario de 128.100 tokens, lo que explica la diferencia entre los 22 M de parametros del backbone que cita el autor y los 70,8 M totales que reporta safetensors, donde la mayoria del peso esta en la matriz de embeddings. Sobre ese backbone se sustituye la cabeza NLI original por una cabeza de clasificacion de dos etiquetas y se afina como cross-encoder: la respuesta del candidato va como primera secuencia y la hipotesis sobre el hablante como segunda. La construccion de la hipotesis forma parte del contrato del modelo y se documenta con la funcion `hypothesisFor` incluida en el repositorio.

El entrenamiento es una destilacion en cinco rondas desde un router servido con `openai/gpt-oss-120b`. En la ronda 5, el profesor genero respuestas a 86 preguntas de AppSec redactadas por el autor y sus 378 seguimientos, en varios registros (cuidadoso, con reservas, telegrafico, lenguaje llano, con nombres de herramientas y respuestas con una clausula invertida), y despues las etiqueto contra las senales de cada pregunta, conservando solo etiquetas unanimes. Las respuestas con afirmaciones invertidas y las que solo sueltan nombres de herramientas reciben etiquetas negativas intencionadas, no etiquetas del profesor. El conjunto final consta de 42.616 pares de entrenamiento sobre 57 temas, con 14 temas no vistos para desarrollo y 15 para test. El ajuste fue de 3 epocas, batch 32, learning rate 2e-5 y precision fp32 sobre una Colab T4. El umbral se eligio sobre niveles reservados y no sobre el conjunto de desarrollo.

## Capacidades

- Clasificacion binaria de pares (respuesta, hipotesis): devuelve logits y una probabilidad de que la respuesta demuestre el punto descrito, mediante softmax sobre dos clases.
- Enrutado de conversacion: la senal de salida decide la siguiente pregunta de seguimiento en una entrevista tecnica, que es su uso en produccion.
- Emparejamiento semantico laxo entre una afirmacion sobre el hablante y una respuesta parafraseada, con recall medido del 93% en parafrasis en lenguaje llano sobre el test de la ronda 5.
- Inferencia en navegador mediante Transformers.js y ONNX Runtime Web, con pesos int8 de 83 MB.
- Ejecucion en CPU sin GPU: no depende de aceleracion por hardware.
- Alcance limitado a texto en ingles sobre seguridad de aplicaciones; no soporta tool calling, function calling, agentes, vision, audio, modo thinking ni generacion de texto.
- No es un modelo generativo ni un calificador: no produce puntuaciones interpretables como probabilidad calibrada.

## Casos de uso

- Enrutado de entrevistas tecnicas automatizadas: el modelo puntua cada par (respuesta del candidato, hipotesis de senal) y activa la siguiente pregunta de seguimiento cuando la probabilidad supera 0,30, tal como hace appsecinterview.com. Su latencia de 65 ms por par con cuatro hilos WASM permite hacerlo sin llamadas al servidor.
- Evaluacion formativa en plataformas de e-learning: comprobar si la respuesta escrita de un alumno cubre un concepto concreto del temario, mostrando material de refuerzo cuando no lo hace.
- Generacion de datos de supervision debil: usar las etiquetas del modelo para preetiquetar grandes volumenes de respuestas y reservar la revision humana o la de un LLM mayor para los casos cercanos al umbral.
- Prefiltrado en pipelines de evaluacion con LLM: descartar con un coste casi nulo los pares claramente no demostrados antes de invocar un modelo mayor, reduciendo el gasto por token.
- Deteccion de respuestas de relleno o name-dropping en formularios de seleccion: el modelo acredita solo el 1% de las respuestas que unicamente citan nombres de herramientas, por lo que sirve como filtro de respuestas vacias de contenido.
- Comprobacion de comprension lectora en documentacion interna de seguridad: dado un texto de referencia, verificar si la respuesta del empleado expresa el punto descrito, siempre que las hipotesis se redacten en el mismo estilo en tercera persona del presente que usa el modelo.
- Clasificacion por lotes en un servicio Python: cargar los safetensors con transformers y procesar pares en batch sobre CPU para tareas de anotacion offline, sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas cifras publicadas son el acuerdo con las etiquetas del modelo profesor sobre temas no vistos, con el umbral de 0,30:

| Conjunto | Precision | Recall | F1 | Veredictos de seguimiento coincidentes |
|---|---:|---:|---:|---:|
| Test dificil de la ronda 1 (3.327 pares) | 88% | 70% | 78% | 196 / 228 (86%) |
| Test de la ronda 5 (9.430 pares) | 88% | 77% | 82% | 449 / 514 (87%) |

Desglose por estilo de respuesta en el test de la ronda 5 (pares acreditados detectados / pares no acreditados que disparan el umbral): parafrasis en lenguaje llano 93%; respuestas llanas 78% / 10%; respuestas de una sola frase 65% / 5%; respuestas que solo citan nombres de herramientas, acreditadas 1%; respuestas con una clausula invertida, acreditadas alrededor del 13%.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pratikamin/appsec-router-deberta-r5 | 70,8 M totales (22 M de backbone) | 256 tokens por par | F1 82% y precision 88% de acuerdo con el profesor en el test de la ronda 5 | Apache 2.0 | HuggingFace, safetensors y ONNX int8 |
| cross-encoder/nli-deberta-v3-xsmall (modelo base) | Misma familia y tamano (no disponible el desglose exacto) | No disponible | No disponible; es un modelo NLI generico, no afinado para este dominio | Apache 2.0 segun la model card del modelo derivado | HuggingFace |
| cross-encoder/nli-deberta-v3-base | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | HuggingFace |
| openai/gpt-oss-120b (profesor del que se destila) | Alrededor de 120.000 M, arquitectura MoE | No disponible en esta ficha | No disponible | Apache 2.0 | HuggingFace; requiere infraestructura de servidor |

La comparacion relevante es la de la ultima fila: el router original basado en un LLM de gran tamano ofrece mayor cobertura semantica pero exige servidor, mientras que este cross-encoder de 70,8 M resuelve el mismo enrutado en el navegador a cambio de perder recall en respuestas correctas con redaccion inusual.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB tanto en fp32 (pesos de 278 MB) como en int8 (83 MB), con batch pequeno y secuencias de 256 tokens; el modelo esta pensado para CPU, no para GPU.
- GPU recomendadas: no aplica. El autor indica que WebGPU no aporto ninguna ganancia para este modelo.
- Compatibilidad con GPU de consumo: irrelevante en la practica; cualquier GPU de consumo lo ejecuta sobradamente si se fuerza el backend, pero no aporta ventaja frente a CPU.
- CPU: es el entorno objetivo. Con aislamiento cross-origin (cabeceras COOP/COEP) y cuatro hilos WASM, un par se puntua en unos 65 ms en un portatil; en mono-hilo se acerca a 1,8 s.
- Opciones de despliegue: Transformers.js con `@huggingface/transformers` y `dtype: "q8"` (el formato que sirve el sitio), ONNX Runtime Web u ONNX Runtime nativo para el fichero int8, y transformers con PyTorch para los safetensors en fp32. vLLM, TGI, Ollama y llama.cpp no son aplicables porque no es un modelo generativo ni una arquitectura soportada por esos runners.
- Throughput: no se publican cifras de pares por segundo agregadas; a partir de la latencia declarada, cuatro hilos WASM permiten del orden de 15 pares por segundo en un solo portatil, sin datos oficiales que lo confirmen.

## Limitaciones y advertencias

- Supervision sintetica: todas las respuestas y etiquetas de entrenamiento las genero un modelo. Las cifras de acuerdo son con ese profesor, no con juicio humano, y no deben presentarse como una evaluacion de una persona.
- No es un calificador: la model card lo declara explicitamente. La valoracion del sitio la produce un modelo mayor en servidor y la opinion de este router nunca se muestra al candidato.
- Coincidencia semantica laxa: una afirmacion erronea que reutiliza el vocabulario correcto se acredita aproximadamente una vez de cada ocho, y una afirmacion correcta con redaccion inusual se pierde alrededor de una vez de cada cinco, con mas frecuencia en respuestas de una sola frase.
- Las descripciones son entradas del sistema: una descripcion redactada como lista de varias cosas se puntua como un todo, y una descripcion del tipo "pregunta quien..." no coincide con una respuesta que simplemente dice quien. La mayoria de los fallos observados en transcripciones reales se atribuyen a descripciones mal construidas, no al modelo.
- Dominio cerrado: respuestas de entrevista de seguridad de aplicaciones en ingles. No se ha probado ningun otro dominio ni idioma.
- Falta de calibracion: 0,30 es un punto de operacion elegido sobre niveles reservados, no una probabilidad. El umbral optimo en desarrollo era 0,10, que dispara en el 13% de pares en lenguaje llano no acreditados.
- Riesgo de uso indebido: emplearlo para filtrar candidatos o puntuar personas entra en un terreno de alto riesgo, agravado por tratarse de un modelo entrenado con datos generados y no validados por humanos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del backbone DeBERTa-v3-xsmall de Microsoft, distribuido bajo licencia MIT.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia externa de funcionamiento mas alla de lo declarado por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pratikamin/appsec-router-deberta-r5
- Dataset de entrenamiento: https://huggingface.co/datasets/pratikamin/appsec-router-pairs-r5
- Modelo base: https://huggingface.co/cross-encoder/nli-deberta-v3-xsmall
- Backbone original: https://huggingface.co/microsoft/deberta-v3-xsmall
- Modelo profesor: https://huggingface.co/openai/gpt-oss-120b
- Demo en produccion: https://appsecinterview.com
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a contenidos sin relacion (imagenes de la catedral de Ratisbona).
