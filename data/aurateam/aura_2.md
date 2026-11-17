# aurateam/AURA_2

## Resumen

AURA 2.0 es un modelo de lenguaje para vídeo en streaming desarrollado por el equipo aurateam (aurateam2026). Su propuesta central es ir más allá del paradigma pregunta-respuesta: el modelo puede iniciar conversaciones de forma proactiva, invocar herramientas a partir de lo que ocurre en el flujo de vídeo en directo y fundamentar sus respuestas en objetos y regiones concretas de los fotogramas. Se distribuye como checkpoint original en Hugging Face con pesos en safetensors y un total de 9.409.813.744 parámetros.

El modelo se etiqueta internamente como `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5, aunque la model card no detalla la arquitectura exacta ni el proceso de entrenamiento. Los idiomas declarados son inglés y chino. La relevancia actual del modelo radica en su orientación a interacción multimodal en tiempo real (streaming video), un nicho donde la mayoría de los modelos abiertos siguen operando sobre imágenes estáticas o vídeo preprocesado por lotes.

La información pública disponible es escasa: no se especifican licencia, pipeline, contexto, cuantizaciones ni resultados de benchmarks en la información proporcionada. Esta ficha refleja exclusivamente los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `qwen3_5`; se infiere base transformer de la familia Qwen 3.5, sin confirmar) |
| Parametros totales | 9.409.813.744 (~9,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos originales en safetensors) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,8 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna. El tag `qwen3_5` apunta a que el modelo parte de una base de la familia Qwen 3.5, lo que implicaría un transformer decoder-only con atención estándar, pero no se confirma en la model card. El recuento real de parámetros en safetensors es de 9.409.813.744, lo que sitúa al modelo en la franja de ~9B.

La model card describe el modelo como un *streaming video language model* capaz de iniciar conversaciones, llamar herramientas basadas en el flujo en directo y fundamentar interacciones en objetos y regiones de los fotogramas. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o aprendizaje por refuerzo con recompensas verificables. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. Toda esta información se considera no disponible.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés y chino.
- Comprensión de vídeo en streaming: procesamiento de flujo continuo de fotogramas, no solo de vídeo preprocesado.
- Iniciativa conversacional: el modelo puede "hablar primero" y abrir el diálogo en función de lo que observa en el stream.
- Tool calling / function calling disparado por eventos del vídeo en directo.
- Grounding espacial: referencia a objetos y regiones concretas dentro de los fotogramas.
- Razonamiento multi-paso orientado a agentes que actúan sobre la señal de vídeo.
- Capacidad multimodal de vídeo (visión sobre secuencia temporal).

No se documentan capacidades de audio, modo *thinking* explícito ni soporte de otras modalidades en la información disponible.

## Casos de uso

- Asistencia en directo por videollamada: el modelo puede iniciar la interacción y referirse a objetos o regiones visibles en la cámara del usuario, útil en soporte técnico remoto o telemedicina básica.
- Moderación de contenido en streaming: análisis continuo del flujo de vídeo con invocación de herramientas cuando detecta eventos relevantes, permitiendo respuestas automatizadas en tiempo real.
- Agentes de accesibilidad: descripción proactiva de escenas y objetos para personas con discapacidad visual, aprovechando la iniciativa conversacional y el grounding espacial.
- Vigilancia y monitorización industrial: el modelo puede disparar function calls ante la aparición de objetos o regiones de interés en cámaras de planta, integrándose con sistemas de alerta.
- Asistentes para retransmisiones deportivas o eventos: comentario y respuesta contextual basados en lo que ocurre en el stream, con capacidad de llamar a APIs de estadísticas.
- Robots y agentes embodied con percepción visual continua: el grounding en regiones del fotograma facilita instrucciones espaciales precisas en tareas de manipulación guiada por vídeo.
- Atención al cliente con vídeo en vivo: conversaciones multi-turno donde el modelo interpreta lo que el cliente muestra por cámara y abre el diálogo cuando detecta una incidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: ~18,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- Cuantización a 8 bits: ~9,5 GB de pesos; a 4 bits: ~5 GB de pesos, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con throughput alto; RTX 4090 (24 GB) podría alojar el modelo en bf16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con margen ajustado; en GPUs de 16 GB requeriría cuantización, no publicada oficialmente.
- Opciones de despliegue: al ser safetensors, es compatible con frameworks estándar (vLLM, TGI, Transformers); no se confirman integraciones específicas ni disponibilidad de GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa rigurosa con alternativas. A continuación se indica la comparación cualitativa posible según categoría (modelos de ~9B con capacidades multimodales), marcando los campos sin datos como no disponibles.

| Modelo | Parametros | Contexto | Modalidad | Licencia |
|---|---|---|---|---|
| AURA 2.0 | ~9,4B | no disponible | vídeo en streaming + texto | no disponible |
| Qwen2.5-VL-7B (referencia de familia) | ~7B | no disponible en esta ficha | imagen/vídeo + texto | no disponible en esta ficha |
| Alternativas de ~9B multimodales | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparativas oficiales de AURA 2.0 frente a otros modelos en la información disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de desplegarlo en producción.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Riesgo de alucinación inherente a los modelos generativos, agravado en tareas de grounding espacial donde una referencia errónea a un objeto puede inducir a error.
- Sin información sobre sesgos demográficos, culturales o de dominio.
- Contexto y ventana temporal de vídeo no documentados: se desconoce cuántos fotogramas o segundos de stream puede procesar de forma efectiva.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.
- No se publican cuantizaciones oficiales, lo que limita el despliegue en hardware de gama media.
- El tag `qwen3_5` sugiere herencia de una base Qwen 3.5, cuyas condiciones de licencia podrían aplicar en cascada; conviene verificarlo.

## Enlaces

- Hugging Face: https://huggingface.co/aurateam/AURA_2
- Página del proyecto: https://aurateam2026.github.io/Aura-2.0/
- Repositorio GitHub: https://github.com/aurateam2026/Aura2.0
- Informe técnico (arXiv): enlace indicado en la model card, sin URL directa disponible en la información proporcionada.
