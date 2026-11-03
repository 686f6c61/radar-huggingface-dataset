# r9485/repvale-coach

## Resumen

Repvale Coach es un modelo de lenguaje de pequeno tamano derivado de google/gemma-3-1b-it, afinado por el usuario r9485 para responder preguntas sobre ejercicios y guias de la aplicacion de entrenamiento Repvale. El modelo esta pensado para ejecutarse localmente en el propio telefono del usuario, dentro del navegador, mediante MediaPipe LLM Inference, lo que implica que no requiere conexion a servidores externos ni envio de datos a terceros.

El modelo base es Gemma 3 1B en su version instruction-tuned, por lo que hereda la arquitectura y el preentrenamiento de Google, mientras que el ajuste fino se ha realizado sobre el contenido propio de Repvale (guias de ejercicios y paginas de ayuda). El resultado se distribuye en formato MediaPipe `.task` con cuantizacion int4, lo que reduce el peso a aproximadamente 0,6 GB, coherente con el tamano del repositorio.

Su relevancia radica en el patron de despliegue: un modelo afinado de dominio especifico que cabe en un dispositivo movil y se ejecuta en el navegador sin infraestructura de inferencia dedicada. Es un ejemplo de asistente vertical de bajo coste para una app concreta, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-3-1b-it); detalles especificos no disponibles |
| Parametros totales | 1B (segun el modelo base Gemma 3 1B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | int4 (formato MediaPipe `.task`) |
| Idiomas soportados | no disponible (la model card no los enumera; el modelo base Gemma 3 es multilingue) |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | MediaPipe `.task` (int4); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-1b-it, un transformer decoder-only instruction-tuned de aproximadamente mil millones de parametros desarrollado por Google. Sobre esa base, r9485 ha realizado un ajuste fino supervisado utilizando las guias de ejercicios y las paginas de ayuda de la aplicacion Repvale. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales; tampoco detalla hiperparametros del ajuste.

La innovacion tecnica relevante no esta en la arquitectura sino en el pipeline de despliegue: el modelo se exporta a formato MediaPipe `.task` con cuantizacion int4 para ejecutarse mediante MediaPipe LLM Inference en el navegador del telefono. Esto implica una conversion y compresion del modelo original de HuggingFace a un artefacto optimizado para inferencia en dispositivo, con las limitaciones de precision que conlleva la cuantizacion a 4 bits. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en el dominio del fitness y el entrenamiento, limitada al contenido de las guias y paginas de ayuda de Repvale.
- Respuesta a preguntas sobre ejercicios, presumiblemente con base en la documentacion propia de la aplicacion.
- Ejecucion local en el navegador del dispositivo mediante MediaPipe LLM Inference, sin dependencia de servidores.
- Capacidades multilingues: no disponibles de forma explicita; el modelo base Gemma 3 es multilingue, pero el ajuste fino se ha hecho sobre contenido de Repvale sin que se documenten los idiomas cubiertos.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (vision, audio, thinking mode): no disponibles en esta variante.

## Casos de uso

- Asistente integrado en la app Repvale: el modelo responde dudas del usuario sobre ejercicios dentro de la propia aplicacion movil, usando las guias de Repvale como fuente, sin salir del dispositivo.
- Consulta offline de rutinas y tecnica: al ejecutarse en local, funciona sin conexion a internet, util en gimnasios o entornos con cobertura limitada.
- Privacidad de datos del usuario: al no enviar consultas a un servidor, las preguntas sobre habitos de entrenamiento o condiciones fisicas no salen del telefono.
- Soporte de primer nivel en la app: respuestas rapidas a preguntas frecuentes sobre uso de la aplicacion y ejercicios, reduciendo la carga de atencion al cliente.
- Demostracion de despliegue on-device con MediaPipe: sirve como referencia tecnica para equipos que quieran integrar un LLM afinado de dominio en una app web movil.
- Prototipado de asistentes verticales: el patron (Gemma 1B + ajuste fino + exportacion a `.task` int4) es replicable para otras apps de nicho con documentacion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo esta pensado para ejecucion en dispositivo con cuantizacion int4 y un peso de repositorio de aproximadamente 0,6 GB.
- GPU recomendadas: no disponible. El despliegue objetivo es MediaPipe LLM Inference en el navegador de un telefono, no en GPU de servidor.
- Compatibilidad con GPU de consumo: no documentada; el modelo esta empaquetado para el runtime de MediaPipe, no para vLLM, llama.cpp u Ollama.
- Opciones de despliegue: MediaPipe LLM Inference (formato `.task`). No se distribuyen pesos en safetensors ni GGUF, por lo que vLLM, TGI, llama.cpp u Ollama no son aplicables directamente sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Repvale Coach | 1B | no disponible | MediaPipe `.task` int4 | Gemma | Asistente de fitness on-device |
| google/gemma-3-1b-it | 1B | no disponible en la informacion | safetensors y otros | Gemma | Modelo base instruction-tuned de proposito general |
| Otros Gemma 3 (4B, 12B, 27B) | 4B-27B | no disponible en la informacion | safetensors y otros | Gemma | Mayor capacidad, no orientados a ejecucion movil |

La comparativa se limita al modelo base y a otras variantes de la familia Gemma 3, ya que no se dispone de datos de benchmarks ni de modelos directamente comparables en el mismo nicho (asistente de fitness on-device). No disponible informacion adicional sobre alternativas equivalentes.

## Limitaciones y advertencias

- El propio autor advierte de que las respuestas pueden ser incorrectas y que el modelo no constituye consejo medico.
- Al estar afinado sobre las guias de Repvale, su conocimiento fuera de ese dominio es limitado y puede alucinar respuestas sobre temas no cubiertos por la documentacion.
- La cuantizacion int4 puede degradar la calidad de las respuestas frente al modelo base en precision completa.
- No se documentan sesgos conocidos, idiomas soportados ni evaluaciones de seguridad.
- La licencia Gemma Terms of Use impone restricciones de uso; debe consultarse la politica de usos prohibidos de Gemma antes de cualquier despliegue comercial.
- El modelo ha sido modificado respecto al Gemma original, tal como indica la model card.
- No se distribuyen pesos en formatos estandar (safetensors, GGUF), lo que limita la portabilidad a otros runtimes de inferencia.
- No hay informacion sobre el contexto maximo soportado, lo que impide planificar conversaciones largas con garantias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/r9485/repvale-coach
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- MediaPipe LLM Inference: no disponible en la informacion proporcionada
