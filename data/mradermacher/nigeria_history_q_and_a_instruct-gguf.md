# mradermacher/Nigeria_History_Q_and_A_Instruct-GGUF

## Resumen

Nigeria_History_Q_and_A_Instruct es un modelo de lenguaje especializado en historia de Nigeria, desarrollado por Cyber-Maphian y cuantizado a formato GGUF por mradermacher. Se trata de un ajuste fino (fine-tuning) del modelo base mediante la técnica de continued-pretraining y LoRA sobre un dataset específico de historia nigeriana (Cyber-Maphian/History_of_Nigeria), con el objetivo de ofrecer respuestas conversacionales precisas y centradas en el dominio histórico de Nigeria.

El modelo cuenta con aproximadamente 494 millones de parámetros (494.032.768 según los safetensors del modelo base), lo que lo sitúa en la categoría de modelos pequeños, adecuados para despliegue en hardware de consumo. La versión publicada por mradermacher es una cuantización estática en múltiples formatos GGUF (desde Q2_K hasta f16), lo que facilita su ejecución en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

Su relevancia radica en la especialización vertical: frente a modelos generalistas, este modelo está adaptado a un dominio concreto (historia de Nigeria), lo que puede reducir alucinaciones en ese ámbito y mejorar la precisión terminológica. No obstante, la información pública disponible es limitada, y no se han publicado benchmarks ni detalles exhaustivos sobre el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de un modelo base, detalles no disponibles) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer, aunque la model card no especifica la familia exacta del modelo base (podria tratarse de un modelo tipo GPT-2, OPT, Pythia o similar, dado el tamano de ~494M parametros). El proceso de adaptacion incluye continued-pretraining y fine-tuning mediante LoRA sobre el dataset Cyber-Maphian/History_of_Nigeria, lo que sugiere una adaptacion de dominio orientada a preguntas y respuestas sobre historia nigeriana.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La cuantizacion fue realizada por mradermacher con quantize_version 2 y output_tensor_quantised 1, generando cuantizaciones estaticas (no se ofrecen versiones weighted/imatrix en el momento de la publicacion).

## Capacidades

- Generacion de texto conversacional en ingles, orientada a preguntas y respuestas sobre historia de Nigeria.
- Respuestas de tipo instructivo (formato conversational), apto para dialogos multi-turno.
- Especializacion de dominio: conocimiento enfocado en historia nigeriana gracias al fine-tuning sobre un dataset especifico.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles (segun el campo language de la model card).
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Asistente educativo sobre historia de Nigeria: el modelo puede responder preguntas de estudiantes o curiosos sobre eventos, personajes y periodos historicos nigerianos, aprovechando su especializacion de dominio para ofrecer respuestas mas precisas que un modelo generalista de tamano similar.
- Chatbot divulgativo para museos o instituciones culturales nigerianas: integrado en un sitio web o aplicacion, puede gestionar conversaciones multi-turno sobre exposiciones y contenido historico, con bajo coste de inferencia gracias a su tamano reducido.
- Generacion de material didactico: el modelo puede redactar resumenes, preguntas de examen o fichas sobre temas historicos de Nigeria, sirviendo como borrador para docentes que luego revisan y amplian el contenido.
- Apoyo a investigadores y periodistas: como herramienta de consulta rapida para contextualizar referencias historicas nigerianas, siempre con verificacion posterior por parte del usuario.
- Prototipado de aplicaciones de nicho: desarrolladores que necesiten un modelo ligero y especializado pueden desplegarlo en local con llama.cpp u Ollama para experimentar con asistentes tematicos sin depender de APIs externas.
- Educacion en entornos con recursos limitados: al caber en cuantizaciones de ~0,4-0,6 GB, puede ejecutarse en portatiles modestos o incluso en Raspberry Pi, facilitando su uso en aulas o regiones con infraestructura limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB para cuantizaciones Q2_K a Q8_0; ~1,1 GB para f16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050, RTX 3060, RTX 4090, etc.), e incluso en CPUs y dispositivos de placa unica.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede usarse con transformers.
- Latencia y throughput estimados: no disponibles; dado el tamano, se espera una latencia muy baja en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Nigeria_History_Q_and_A_Instruct (este) | ~494M | no disponible | other | GGUF, safetensors | Historia de Nigeria |
| Modelos generalistas de ~500M (p. ej. Qwen2.5-0.5B, SmolLM2-360M) | 360M-500M | 4K-32K (segun modelo) | Apache 2.0 / otras | safetensors, GGUF | Generalista |
| Modelos de dominio historico | no disponible | no disponible | no disponible | no disponible | Historia (general) |

La comparativa directa es limitada porque no se dispone de datos de benchmarks ni de detalles del modelo base. Frente a modelos generalistas del mismo orden de parametros, la ventaja de este modelo es su especializacion en historia nigeriana; la desventaja es la falta de documentacion sobre contexto, licencia y rendimiento, asi como su limitacion al ingles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse sobre un dataset especifico de historia nigeriana puede heredar sesgos de las fuentes utilizadas.
- Riesgo de alucinacion: presente como en cualquier modelo de lenguaje; la especializacion reduce pero no elimina el riesgo de datos historicos incorrectos.
- Limitaciones de contexto o idioma: solo ingles; longitud de contexto no disponible.
- Restricciones de licencia: la licencia es "other" y no se detalla en la model card, por lo que se debe contactar con el autor o revisar el modelo base antes de un uso comercial.
- Caveats para produccion: informacion muy escasa sobre entrenamiento y evaluacion; se recomienda validacion exhaustiva en el dominio antes de desplegar en produccion. Ademas, las cuantizaciones Q2_K y Q3_K pueden degradar la calidad; se recomienda Q4_K_M o superior para uso general.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nigeria_History_Q_and_A_Instruct-GGUF
- Modelo base: https://huggingface.co/Cyber-Maphian/Nigeria_History_Q_and_A_Instruct
- Dataset: https://huggingface.co/datasets/Cyber-Maphian/History_of_Nigeria
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#Nigeria_History_Q_and_A_Instruct-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
