# schonsense/emdasterisk_go_home_14B-GGUF

## Resumen

emdasterisk_go_home_14B-GGUF es una cuantizacion en formato GGUF del modelo schonsense/emdasterisk_go_home_14B, un modelo multimodal de tipo image-text-to-text derivado de la familia Ministral 3. Lo publica el usuario schonsense y su proposito declarado es reducir el uso no deseado de asteriscos y guiones largos (em dashes) en las respuestas generadas, manteniendo las capacidades del modelo base. Se trata de un modelo completo fusionado, no de un adaptador, con pesos nativos exportados tras una segunda pasada de entrenamiento.

El modelo parte de la revision `3cea74c1ebaf5ce5f5a2553de470e2ceab825142` del modelo base y aplica actualizaciones LoRA de rango 16 sobre 280 proyecciones del decodificador de texto y 13 deltas de filas seleccionadas del output head. Los modulos de vision, el proyector multimodal y los embeddings de entrada permanecen congelados. El entrenamiento empleo IPO adaptativo con SFT sobre pares elegidos, con 1779 pares de entrenamiento y dos traversals del mismo manifiesto.

Con 13.506.073.600 parametros totales y licencia Apache 2.0, el modelo se posiciona como una opcion de tamano medio para tareas multimodales conversacionales. La version GGUF facilita su despliegue en entornos con recursos limitados mediante llama.cpp u otros motores compatibles, aunque no se dispone de informacion detallada sobre los tipos de cuantizacion incluidos ni sobre los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Ministral 3 |
| Parametros totales | 13.506.073.600 (13,5 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF; niveles concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); pesos nativos en safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal de la familia Ministral 3, con un decodificador de texto y modulos de vision mas un proyector multimodal que permite el procesamiento conjunto de imagen y texto. El modelo base tiene 13,5 mil millones de parametros. La exportacion GGUF conserva los componentes de vision completos del modelo base, segun indica la model card.

El entrenamiento consistio en una segunda pasada sobre el modelo base con actualizaciones LoRA de rango 16 aplicadas a 280 proyecciones del decodificador de texto y 13 deltas de filas del output head, que posteriormente se fusionaron en los pesos nativos. Se uso IPO adaptativo combinado con SFT sobre respuestas elegidas, con 1779 pares de entrenamiento (de un corpus preparado de 2042 pares, excluyendo los de evaluacion), dos traversals del mismo manifiesto, batch efectivo de 16, learning rate pico de 1e-6 para LoRA y 1e-7 para las filas del head, y warmup completo en el primer traversal. Los embeddings de entrada, modulos de vision, proyector multimodal y filas no seleccionadas del head permanecieron congelados. La ejecucion corresponde a `production-dp-20261109T071800`, update de optimizador 224.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Procesamiento multimodal image-text-to-text: acepta imagenes y texto como entrada.
- Razonamiento y generacion de texto general, heredados del modelo base Ministral 3.
- Reduccion del uso de asteriscos y guiones largos en las respuestas (objetivo declarado del ajuste).
- Uso del tokenizer, processor y chat template nativos incluidos en el paquete.
- Carga mediante `AutoModelForImageTextToText.from_pretrained` con `dtype=torch.bfloat16`, sin necesidad de cargar adaptadores PEFT.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional multimodal: el modelo puede recibir imagenes junto con texto y mantener dialogos multi-turno, lo que permite escenarios como analisis de capturas de pantalla o documentos escaneados con preguntas de seguimiento.
- Generacion de texto con estilo controlado: al reducir el uso de asteriscos y guiones largos, es adecuado para producir texto narrativo o documentacion donde ese formato resulta indeseado, aunque la model card advierte que no garantiza la eliminacion total de puntuacion.
- Prototipado rapido en local: la version GGUF permite ejecutar el modelo en estaciones de trabajo con llama.cpp u otros motores compatibles, facilitando pruebas de concepto sin infraestructura de GPU dedicada de gran escala.
- Descripcion y analisis de imagenes: gracias a los modulos de vision conservados, puede emplearse para generar descripciones textuales de imagenes o responder preguntas sobre su contenido en aplicaciones de accesibilidad o catalogacion.
- Chatbots de dominio general: el ajuste conversacional y el tamano de 13,5 B lo hacen utilizable en asistentes virtuales con requisitos moderados de hardware, especialmente en despliegues cuantizados.
- Investigacion sobre control de estilo en LLM: el modelo sirve como caso de estudio para experimentos de fusion LoRA e IPO orientados a modificar habits de formato sin reentrenar el modelo completo.
- Evaluacion de modelos multimodales en entornos con recursos limitados: su formato GGUF y licencia Apache 2.0 permiten integrarlo en pipelines de investigacion sin restricciones comerciales.

## Benchmarks y rendimiento

La model card reporta unicamente diagnosticos internos del autor, no benchmarks estandar comparables:

| Prueba | Resultado |
|---|---|
| Generaciones de benchmark/narrativa (export T2) | 28 completadas, 0 fallos de ejecucion, 3 hits de limite de presupuesto de salida |
| GSM8K diagnostico (12 items) | 12/12 |
| Evaluacion multimodal | no realizada por la suite del autor |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K completo, etc.) en la informacion disponible. El autor advierte explicitamente que estos diagnosticos pequenos no establecen retencion amplia de capacidades ni garantizan la eliminacion de puntuacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (13,5 B), en bfloat16 requeriria del orden de 27 GB de VRAM solo para pesos; en cuantizaciones GGUF de 8 bits rondaria 14-15 GB y en 4 bits unos 8-9 GB, aunque estos valores no estan confirmados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, GPUs con 24 GB o mas (RTX 4090, A100 40 GB, H100) serian adecuadas para precision completa o alta; GPUs consumer de 8-16 GB podrian ejecutar cuantizaciones bajas en GGUF.
- Cabe en consumer GPU: previsiblemente en cuantizaciones GGUF de 4-8 bits en GPUs de 8-16 GB, aunque no hay confirmacion oficial.
- Opciones de despliegue: llama.cpp y motores compatibles con GGUF; el modelo base se carga con Transformers (`AutoModelForImageTextToText`). vLLM, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparativa rigurosa con alternativas. Como referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| emdasterisk_go_home_14B-GGUF | 13,5 B | no disponible | Apache 2.0 | GGUF | Ajuste de estilo sobre Ministral 3 |
| Modelo base Ministral 3 (referencia) | ~13,5 B | no disponible | no disponible | safetensors | Sin ajuste de puntuacion |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- El autor advierte que el ajuste no garantiza la eliminacion de asteriscos ni guiones largos; el efecto puede ser parcial o inconsistente.
- Los diagnosticos reportados (28 generaciones y 12 items de GSM8K) son demasiado pequenos para concluir retencion amplia de capacidades.
- El comportamiento multimodal no fue evaluado por la suite del autor, por lo que no hay garantias sobre la calidad de las respuestas con imagenes.
- No se dispone de informacion sobre sesgos conocidos, idiomas soportados ni evaluaciones de seguridad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no cuantificado en la informacion disponible.
- Longitud de contexto no especificada, lo que limita la planificacion de despliegues con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El modelo tiene 0 likes y 422 descargas en el momento de la consulta, lo que sugiere una validacion comunitaria muy limitada.
- Existe una version mas reciente indicada por el autor: `schonsense/emdasterisk_doublequash_14B-GGUF`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schonsense/emdasterisk_go_home_14B-GGUF
- Modelo base: https://huggingface.co/schonsense/emdastrisk_go_home_14B (referenciado en la model card; el identificador aparece con esa grafia)
- Version nueva indicada por el autor: https://huggingface.co/schonsense/emdasterisk_doublequash_14B-GGUF
- Resultado de busqueda web proporcionado (no relacionado con el modelo): https://moneywise.com/banking/banking-basics/credit-union-vs-bank
