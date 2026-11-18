# richmondsin/gemma-3-12b-it-Post-Reasoning

## Resumen

gemma-3-12b-it-Post-Reasoning es un ajuste fino supervisado (SFT) del modelo instructivo google/gemma-3-12b-it, publicado por el desarrollador richmondsin. El modelo implementa la tecnica "Post-Reasoning" descrita en el paper arXiv:2605.06165, que consiste en entrenar al modelo para que emita primero la respuesta final y despues la justificacion, en lugar de generar una cadena de razonamiento antes de la respuesta. El objetivo es mejorar el rendimiento de modelos no pensantes (non-thinking) a un coste computacional minimo, ya que la generacion puede detenerse en el marcador de fin de respuesta sin producir tokens de razonamiento previos.

El modelo conserva la arquitectura multimodal de Gemma 3 (image-text-to-text), con 12.187.325.040 parametros totales y pesos en safetensors de 24,4 GB. El ajuste se realizo mediante LoRA (r 16, alpha 32, dropout 0,05) fusionado en los pesos base en bf16, sobre problemas de NuminaMath con justificaciones autodestiladas. Es relevante ahora porque propone una alternativa de bajo coste a los modelos con modo "thinking": en lugar de pagar el coste de tokens de razonamiento antes de la respuesta, el modelo responde de inmediato y justifica despues, permitiendo truncar la generacion en el marcador de fin de respuesta.

La ficha se basa exclusivamente en la model card y los metadatos publicados en Hugging Face; no se dispone de resultados de benchmarks ni de evaluaciones independientes en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 3 12B IT |
| Parametros totales | 12.187.325.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors bf16) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | gemma (licencia del modelo base google/gemma-3-12b-it) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-12b-it, un transformer multimodal de 12.187.325.040 parametros que procesa texto e imagenes (pipeline image-text-to-text). Sobre esa base se aplico un ajuste fino supervisado con LoRA de rango 16, alpha 32 y dropout 0,05, tasa de aprendizaje 2e-5, 3 epocas y schedule coseno, tras lo cual el adaptador se fusiono en los pesos base en bf16, dando lugar al checkpoint local `gemma-3-12b-it-numina-Reflection-Merged-v4`.

El entrenamiento utiliza problemas de NuminaMath con justificaciones post-respuesta autodestiladas (fichero local `post_reflective_data/<model>_numina_v4.json`). La innovacion tecnica clave es el enmascaramiento de la funcion de perdida: el loss se enmascara tanto en el prompt como en la respuesta, de modo que el modelo solo aprende a generar la justificacion que sigue a la respuesta. Asi, el modelo emite primero la respuesta final (legible y truncable en el marcador de fin de respuesta) y despues la explicacion, sin generar tokens de razonamiento antes de la respuesta. No se menciona en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del modelo base gemma-3-12b-it.
- Razonamiento post-respuesta: emite primero la respuesta final y despues la justificacion ("Answer: ... Explanation: ...").
- Generacion truncable: la respuesta puede leerse y detenerse en el marcador de fin de respuesta (por ejemplo `stop=["Explanation"]`), sin coste de tokens de razonamiento previos.
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado de Gemma 3.
- Razonamiento matematico: el ajuste se entreno sobre problemas de NuminaMath.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no; precisamente el modelo esta disenado como modelo no pensante (non-thinking) con justificacion posterior.

## Casos de uso

- Respuestas de baja latencia en produccion: al no generar tokens de razonamiento antes de la respuesta, el modelo puede devolver el resultado de inmediato y truncar la justificacion con un stop token, reduciendo el coste por consulta en comparacion con modelos de razonamiento.
- Asistentes de resolucion de problemas matematicos: entrenado sobre NuminaMath, puede resolver ejercicios y ofrecer la respuesta seguida de la justificacion, util en plataformas educativas donde el alumno quiere ver primero el resultado.
- Generacion de codigo con explicacion posterior: el modelo puede emitir el fragmento de codigo como respuesta y la explicacion despues, integrándose en pipelines de CI/CD o asistentes de IDE que solo necesitan el bloque de codigo.
- Atencion al cliente automatizada: conversaciones multi-turno con respuesta directa y justificacion opcional, permitiendo mostrar solo la respuesta al usuario final y registrar la justificacion para auditoria.
- Clasificacion y extraccion de informacion con justificacion: en tareas donde se requiere una etiqueta o campo extraido, el modelo devuelve primero el valor y despues el razonamiento, facilitando el parseo automatico.
- Analisis de documentos con imagenes: gracias a su naturaleza image-text-to-text, puede responder preguntas sobre capturas, diagramas o formularios y justificar la respuesta a continuacion.
- Evaluacion comparativa de tecnicas de razonamiento: sirve como referencia para medir el efecto de Post-Reasoning frente al modelo base en tareas de matematicas y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 24,4 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 32-40 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) para bf16; en consumer, RTX 4090 (24 GB) resulta justa en bf16 y requeriria cuantizacion o descarga parcial.
- Cabe en consumer GPU: si, en RTX 4090/3090 (24 GB) solo con cuantizacion (por ejemplo 8 bits o 4 bits), aunque el repo no publica pesos GGUF ni cuantizados.
- Opciones de despliegue: vLLM (ejemplo incluido en la model card), transformers, text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp/Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-12b-it-Post-Reasoning | 12.187.325.040 | no disponible | Post-respuesta (respuesta primero, justificacion despues) | gemma | Hugging Face (richmondsin) |
| google/gemma-3-12b-it | 12B (clase) | no disponible | Instructivo estandar, sin modo thinking | gemma | Hugging Face (google) |
| Modelos de razonamiento con thinking (familia no especificada) | no disponible | no disponible | Cadena de razonamiento antes de la respuesta | no disponible | no disponible |

La comparativa se limita al modelo base, ya que la informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas concretas.

## Limitaciones y advertencias

- El ajuste se entreno exclusivamente sobre problemas de NuminaMath; el comportamiento Post-Reasoning puede no generalizar de forma uniforme a dominios ajenos a matematicas.
- La justificacion posterior puede ser plausible pero incorrecta; el modelo puede alucinar explicaciones que no respaldan la respuesta emitida.
- El formato de salida ("Answer: ... Explanation: ...") depende de que el prompt lo solicite; sin instruccion explicita el modelo puede no seguir el patron.
- No hay informacion sobre sesgos, cobertura idiomatica ni evaluaciones de seguridad en la informacion proporcionada.
- La licencia es la de Gemma (terminos de uso de Google); es necesario revisar las restricciones de uso comercial y las politicas de uso prohibido antes de desplegarlo en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y se publico el 2026-11-18; no cuenta con validacion de la comunidad ni evaluaciones independientes.
- El contexto maximo no se especifica en la model card; conviene verificar la configuracion del tokenizer y del modelo base antes de asumir una ventana concreta.
- Al ser un merge de LoRA en bf16, no se publican pesos cuantizados oficiales; el despliegue en hardware consumer requiere cuantizacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/gemma-3-12b-it-Post-Reasoning
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper: https://arxiv.org/abs/2605.06165
- Repositorio de codigo y scripts de evaluacion: https://github.com/richmondsin/Post-Reasoning
