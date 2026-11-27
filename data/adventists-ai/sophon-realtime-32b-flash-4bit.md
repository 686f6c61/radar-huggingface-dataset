# adventists-ai/Sophon-Realtime-32B-Flash-4bit

## Resumen

Sophon-Realtime-32B-Flash-4bit es una versión cuantizada a 4 bits del modelo full-duplex de voz a voz Sophon-Realtime-32B-Flash, desarrollado por adventists-ai. El modelo original integra en un único sistema las etapas de escucha, decisión de turno de palabra, generación de respuesta (con etiquetas de sonido) y síntesis de voz, de modo que mantiene una conversación hablada en tiempo real con capacidad de ser interrumpido. Esta variante comprime los pesos del componente "thinker" a 4 bits para reducir el requisito de memoria de aproximadamente 55 GB a unos 30 GB, permitiendo desplegar el sistema completo en una sola GPU de 32 GB en lugar de una de 80 GB.

La relevancia práctica del modelo reside en esa reducción de huella: mantiene el mismo código, API, voces y clonación de voz zero-shot que la versión completa, a cambio de una pérdida de conocimiento de aproximadamente 1,5 puntos en pruebas de opción múltiple y de desactivar la entrada de imagen. Está pensado para escenarios de una o dos conversaciones simultáneas, no para despliegues de alta concurrencia.

La arquitectura interna no se detalla en la información disponible; la model card describe el sistema como un pipeline de tres etapas (escucha, decisión de turno y habla) ejecutado sobre vLLM y vLLM-Omni con CUDA MPS. Los idiomas soportados son chino (zh) e inglés (en), y la licencia es Apache-2.0 tanto para el código como para los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema full-duplex de voz a voz con pipeline de tres etapas sobre vLLM/vLLM-Omni) |
| Parametros totales | no disponible (el nombre indica 32B en el modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (la version completa soporta 8192) |
| Tipos de cuantizacion | 4 bits (pesos del thinker); no se detallan esquemas adicionales |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 (codigo y pesos; ver NOTICE para fuentes) |
| Formato de pesos | safetensors (libreria vllm) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base (tipo de transformer, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF o DPO). Lo que sí se documenta es la organización funcional del sistema: un modelo full-duplex que escucha, decide cuándo tomar el turno, redacta la respuesta con etiquetas de sonido y la sintetiza, ejecutándose como un pipeline de tres etapas que comparten GPU mediante CUDA MPS.

La variante 4bit aplica cuantización exclusivamente a los pesos del thinker; el resto del sistema (API, etiquetas de sonido, voces, clonación zero-shot y system prompt) es idéntico al modelo Flash completo. El despliegue se realiza sobre vLLM 0.30 y vLLM-Omni 0.30 con un plugin específico, y la primera ejecución compila kernels durante unos 5-10 minutos.

## Capacidades

- Conversación de voz a voz full-duplex en tiempo real, con capacidad de ser interrumpido por el usuario.
- Decisión automática de turno de palabra (turn-taking) durante la conversación.
- Generación de respuestas habladas con etiquetas de sonido (sound tags) para indicar expresiones no verbales.
- Clonación de voz zero-shot.
- Soporte de system prompt para configurar el comportamiento del asistente.
- API compatible con OpenAI Realtime (`/v1/realtime` y `/v1/chat/completions`).
- Capacidades multilingües limitadas a chino e inglés.
- Entrada de imagen desactivada en esta variante (la versión completa sí la soporta).

## Casos de uso

- Asistentes de voz interactivos de baja latencia: con una mediana de 0,24 s entre el final del habla del usuario y el primer fragmento de audio en una H100, el modelo es adecuado para interfaces conversacionales donde la fluidez percibida es crítica.
- Atención al cliente telefónica automatizada: el sistema gestiona conversaciones habladas multi-turno con interrupciones, aunque su ventana de 4096 tokens limita la longitud del historial.
- Pruebas de concepto y demos en una sola GPU de 32 GB: permite validar un producto de voz full-duplex sin aprovisionar hardware de 80 GB.
- Prototipado de agentes de voz con clonación de voz: útil para generar locuciones personalizadas en aplicaciones de accesibilidad o contenido.
- Evaluación de pipelines de voz en investigación: el modelo sirve como referencia para estudiar turn-taking, latencia y calidad de síntesis en sistemas full-duplex.
- Despliegue en estaciones de trabajo con RTX PRO 6000 Blackwell para una o dos conversaciones simultáneas, con latencias de 0,27-0,41 s en una conversación.

## Benchmarks y rendimiento

| Metrica | Flash-4bit | Flash (completo) |
|---|---|---|
| CMMLU, 2000 preguntas (chino, opcion multiple) | 85,5 | 87,1 |
| MMLU-Pro, 2000 preguntas (ingles, 10 opciones) | 57,1 | 58,4 |
| Respuestas que usan etiqueta de sonido (600 turnos hablados) | 13,0 % | 14,2 % |
| Tasa de error del habla de la respuesta, chino, 80 respuestas (mediana) | 1,6 % | 0,8 % |
| Tasa de error del habla, ingles, 69 respuestas (mediana) | 0 % | 0 % |
| Turn-taking, 40 turnos en tiempo real: inicio demasiado pronto / sin respuesta | 11 / 1 | 10 / 2 |

Latencia (una H100, configuración de 32 GB, `/v1/chat/completions`, del habla del usuario al primer fragmento de audio):

| Escenario | Primera respuesta (mediana / P90) | Retraso de reproduccion |
|---|---|---|
| 1 conversacion, 10 turnos, chino / ingles | 0,24 / 0,26 s · 0,24 / 0,27 s | 0 |
| 2 conversaciones simultaneas, respuestas largas | 0,29-0,32 s | 0 |
| 2 conversaciones x 10 turnos | 0,27 / 0,34 s | 0 |
| `/v1/realtime`, fin del habla a primer audio | 0,60 / 0,75 s | no aplica |

En una RTX PRO 6000 Blackwell, una conversación presenta 0,27-0,41 s de latencia; dos conversaciones simultáneas con respuestas largas sufren un retraso de 0,3-0,75 s al inicio de la respuesta.

## Requisitos de hardware

- VRAM estimada: aproximadamente 30 GB en uso con la configuración de 32 GB (medido en 30,5 GB en una RTX PRO 6000 con presupuesto de 32 GB); descarga de unos 25 GB.
- El thinker cuantizado a 4 bits necesita por sí solo unos 23 GB al arrancar, por lo que las GPU de 24 GB no son suficientes.
- GPU recomendadas: una H100 (80 GB) permite usar los pesos 4-bit con la configuración completa, ocupando unos 42 GB y gestionando 8 respuestas largas simultáneas con un retraso máximo de 0,2 s; una RTX PRO 6000 Blackwell funciona con la configuración de 32 GB.
- Cabe en GPU de consumo de gama alta con 32 GB o más (por ejemplo, RTX 5090 con 32,6 GB), aunque el autor advierte que no se ha probado en una RTX 5090 real y recomienda ejecutarlo sin cabeza y sin otros procesos en la GPU.
- Despliegue: vLLM 0.30 y vLLM-Omni 0.30 con el plugin de Sophon-Realtime, Python 3.12, CUDA MPS activado; el primer arranque compila kernels (5-10 minutos) y requiere el CUDA toolkit.
- Con 48 GB o más se puede subir `gpu_memory_utilization`, `max_model_len` y `max_num_seqs` sobre los mismos pesos 4-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada de imagen | Memoria en uso | Licencia |
|---|---|---|---|---|---|
| Sophon-Realtime-32B-Flash-4bit | 32B (base) | 4096 tokens | No | ~30 GB | Apache-2.0 |
| Sophon-Realtime-32B-Flash | 32B (base) | 8192 tokens | Si | ~55 GB | Apache-2.0 |

No se dispone de información sobre otros modelos comparables de voz a voz full-duplex en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits reduce el conocimiento en aproximadamente 1,5 puntos (CMMLU 85,5 frente a 87,1; MMLU-Pro 57,1 frente a 58,4), una diferencia estadísticamente significativa sobre 2000 preguntas emparejadas.
- La tasa de error del habla en chino empeora (1,6 % frente a 0,8 % de mediana) y la proporción de respuestas con etiqueta de sonido baja (13,0 % frente a 14,2 %).
- El turn-taking presenta 11 inicios demasiado pronto y 1 falta de respuesta en 40 turnos reales, ligeramente peor que la versión completa (10 / 1).
- En respuestas de varios minutos se pierde ocasionalmente la última frase o dos (problema conocido documentado en el changelog).
- La ventana de contexto se reduce a 4096 tokens y la entrada de imagen está desactivada.
- Solo soporta chino e inglés.
- Pensado para una o dos conversaciones simultáneas; no es adecuado para alta concurrencia.
- En RTX PRO 6000 Blackwell, dos respuestas largas simultáneas sufren un retraso de 0,3-0,75 s al inicio.
- No se han publicado datos sobre sesgos ni sobre tasas de alucinación en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero debe consultarse el archivo `NOTICE` para las fuentes de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash-4bit
- Modelo base completo: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/adventists-ai/Sophon-Realtime
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Documentación de la API: https://api.adventists.ai/console/docs
- Consola de la API: https://api.adventists.ai/console/
- Issues del repositorio: https://github.com/adventists-ai/sophon-realtime/issues
