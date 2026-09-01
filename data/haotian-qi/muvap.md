# Haotian-Qi/MuVAP

## Resumen

MuVAP (Multimodal Multiparty Voice Activity Projection) es un framework causal multimodal desarrollado por Haotian Qi, estudiante de doctorado en el KTH Royal Institute of Technology, bajo la supervisión de Gabriel Skantze y Gustav Eje Henter. El modelo aborda el problema de la predicción de turnos en conversaciones multiparty (varias personas) mediante la proyección de actividad de voz (Voice Activity Projection) anclada en el seguimiento facial. Su principal contribución es permitir que un sistema de interacción persona-robot determine no solo cuándo termina un turno, sino quién será el siguiente hablante, utilizando únicamente un flujo de audio monoaural y una única cámara.

La relevancia de MuVAP radica en que los sistemas actuales de turn-taking multiparty dependen de configuraciones complejas de micrófonos en array o múltiples cámaras, lo que limita su aplicabilidad en escenarios reales de interacción humano-robot. Este modelo elimina esa barrera al integrar pistas visuales de caras con señales acústicas causales, logrando predicciones conscientes del hablante desde un único punto de captación. El trabajo fue aceptado en Interspeech 2026 y está disponible en arXiv con referencia 2606.16731.

La ficha se basa exclusivamente en la información pública disponible: la model card de HuggingFace (que solo contiene la licencia MIT) y las descripciones del repositorio GitHub y el paper. No se han publicado arquitectura detallada, números de parámetros, ni resultados de benchmarks en las fuentes consultadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework multimodal causal, combina proyección de actividad de voz con seguimiento facial (detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Según el resumen del paper (arXiv 2606.16731), MuVAP es un framework multimodal causal que extiende el concepto de Voice Activity Projection (VAP) incorporando pistas visuales de rostros detectados en el flujo de vídeo. El modelo procesa de forma causal un flujo de audio monoaural junto con las posiciones y apariciones de caras en una única cámara, lo que le permite asociar la actividad de voz proyectada con cada hablante potencial. Esta integración multimodal es la innovación principal frente a enfoques anteriores que dependían de arrays de micrófonos o múltiples cámaras.

No se dispone de información pública sobre la arquitectura interna concreta (si es un transformer, una red recurrente o una combinación), el número de parámetros, el conjunto de datos de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO. El autor indica que el trabajo está enmarcado en el campo de interacción persona-robot y turn-taking, pero los detalles técnicos completos solo están disponibles en el paper de Interspeech 2026, que no ha sido accesible en su totalidad para esta ficha.

## Capacidades

- Predicción de turnos en conversaciones multiparty: determina no solo si un turno está terminando, sino quién será el siguiente hablante.
- Integración multimodal: combina audio monoaural con pistas visuales de caras detectadas en un único flujo de cámara.
- Procesamiento causal: adecuado para aplicaciones en tiempo real donde no se puede acceder a información futura.
- Funcionamiento en entornos "in the wild": diseñado para escenarios realistas fuera de laboratorio, sin necesidad de infraestructura de captación compleja.
- Aplicable a interacción humano-robot: orientado a robots sociales que necesitan gestionar conversaciones con múltiples participantes.
- No se han documentado capacidades de generación de texto, razonamiento, código, matemáticas, tool calling o agentes, ya que es un modelo especializado en percepción multimodal para turn-taking.

## Casos de uso

- Robots sociales de atención al público: un robot en una recepción o museo puede gestionar conversaciones con varios visitantes, identificando quién va a hablar a continuación y orientando su atención de forma natural.
- Asistentes virtuales en reuniones multipersona: integrado en un sistema de videoconferencia, puede predecir qué participante tomará la palabra, mejorando la gestión de turnos en entornos de trabajo remoto.
- Sistemas de telepresencia robótica: un robot operado remotamente en una sala de reuniones puede seguir la dinámica de conversación y orientar su cámara o micrófono hacia el siguiente hablante proyectado.
- Interfaces de voz para hogar inteligente: un asistente doméstico con una única cámara puede distinguir qué miembro de la familia está hablando o va a hablar, personalizando respuestas y evitando interrupciones.
- Investigación en análisis de conversación: herramienta para estudiar dinámicas de turnos en grupos, proporcionando anotaciones automáticas de actividad de voz y cambios de hablante.
- Entrenamiento de robots en entornos educativos: robots tutores que interactúan con varios estudiantes pueden identificar quién quiere participar y gestionar turnos en actividades grupales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de Interspeech 2026 puede contener evaluaciones cuantitativas, pero no se ha accedido al texto completo en las fuentes consultadas. No se proporcionan cifras de precisión, latencia ni comparaciones con otros modelos.

## Requisitos de hardware

- No se dispone de información sobre requisitos de VRAM, GPU recomendadas, o si es ejecutable en hardware de consumo.
- Dado que es un framework de investigación en fase de publicación, probablemente se ejecute en estaciones de trabajo con GPU de gama media-alta, pero esto no está confirmado.
- No se han documentado opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.). Al no ser un modelo generativo de lenguaje, es probable que requiera un pipeline de inferencia personalizado.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de predicción de turnos multiparty. Existen trabajos previos en Voice Activity Projection (como los de Gabriel Skantze y colaboradores), pero no se han encontrado datos concretos sobre modelos comparables en las fuentes consultadas. Se recomienda consultar el paper de Interspeech 2026 para una comparativa detallada.

## Limitaciones y advertencias

- La información pública es muy limitada: la model card de HuggingFace está vacía y solo contiene la licencia, sin documentación técnica ni ejemplos de uso.
- No se han publicado pesos preentrenados ni instrucciones de reproducción en el repositorio GitHub, lo que dificulta su uso directo por parte de la comunidad.
- El modelo está orientado a un dominio muy específico (turn-taking multiparty) y no es un modelo de propósito general.
- Los datos de entrenamiento y los posibles sesgos asociados no están documentados.
- La licencia MIT permite uso comercial y modificación, pero al no haber pesos disponibles, la aplicabilidad práctica es limitada.
- No se ha verificado el rendimiento en condiciones reales fuera de los experimentos del paper.
- La dependencia de pistas visuales de caras implica que el rendimiento puede degradarse en condiciones de baja iluminación, oclusiones o cuando los participantes no están frente a la cámara.

## Enlaces

- HuggingFace: https://huggingface.co/Haotian-Qi/MuVAP
- GitHub: https://github.com/Haotian-Qi/MuVAP
- Paper arXiv: https://arxiv.org/abs/2606.16731
- PDF del paper: https://arxiv.org/pdf/2606.16731
- Página personal del autor: https://haotian-qi.github.io/
