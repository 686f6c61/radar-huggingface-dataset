# lucaslim/policy-c-weights

## Resumen

`policy-c-weights` es un checkpoint de pesos del modelo vision-lenguaje-acción (VLA) SmolVLA, publicado por el usuario lucaslim como parte de la política robótica `policy-c`. No se trata de un modelo entrenado desde cero, sino de una redistribución del checkpoint base `lerobot/smolvla_base` del equipo LeRobot de Hugging Face, con los ficheros `config.json`, `model.safetensors` y los pre/post-procesadores de LeRobot sin modificar respecto al original.

El modelo resuelve el problema de mapear observaciones visuales y lenguaje natural a acciones motoras en entornos robóticos, siguiendo el paradigma VLA: un backbone de visión-lenguaje (VLM) acoplado a una cabeza de acción que produce comandos de control. Con 450.046.176 parámetros (aproximadamente 450 M), se sitúa en la gama ligera de los modelos VLA, lo que lo hace apto para despliegue en hardware de robótica de consumo o de laboratorio sin infraestructura de GPU de gran escala.

Es relevante ahora porque ejemplifica la tendencia de reutilización y redistribución de checkpoints VLA en el ecosistema LeRobot, y porque su naturaleza de pesos "congelados" respecto al base permite reproducir exactamente el comportamiento del modelo original. La ficha documenta sus especificaciones, limitaciones de empaquetado (el backbone VLM no se incluye completo) y su encaje en flujos de robótica con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); backbone VLM SmolVLM2-500M-Video-Instruct con cabeza de acción (SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32/bf16 según upstream) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y ficheros de pre/post-procesado de LeRobot |

## Arquitectura y entrenamiento

La arquitectura es un modelo VLA de tipo SmolVLA: un backbone de visión-lenguaje `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` que procesa observaciones visuales (incluido vídeo) e instrucciones en lenguaje natural, acoplado a una cabeza de política que genera acciones motoras. El checkpoint redistribuido conserva los pesos del backbone dentro de `model.safetensors`, pero no incluye los ficheros de configuración, tokenizer ni processor del VLM; el código de carga los resuelve por hub id desde una caché local de Hugging Face.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo etapas de RLHF o DPO en la información proporcionada. El checkpoint es idéntico al de `lerobot/smolvla_base`, por lo que sus características de entrenamiento son las del modelo base original del equipo LeRobot, no documentadas aquí.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural (paradigma VLA).
- Procesamiento de entrada visual, incluyendo vídeo según el backbone SmolVLM2-500M-Video-Instruct.
- Comprensión de instrucciones en lenguaje natural para guiar la política de control.
- Integración nativa con el ecosistema LeRobot (pre/post-procesadores incluidos).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Reproducción de la política `policy-c`: el checkpoint permite cargar exactamente la política robótica `policy-c` en un pipeline LeRobot, ya que los pesos son idénticos a `lerobot/smolvla_base` y los pre/post-procesadores se incluyen sin cambios.
- Investigación en manipulación robótica: sirve como punto de partida para experimentos de control visomotor con instrucciones en lenguaje natural, gracias a su tamaño contenido de 450 M de parámetros.
- Fine-tuning sobre tareas específicas: al ser un checkpoint base Apache 2.0, puede adaptarse a nuevos entornos robóticos mediante entrenamiento supervisado con LeRobot.
- Despliegue en hardware de laboratorio: su tamaño reducido permite inferencia en GPUs de gama media, adecuado para bancos de pruebas de robótica.
- Evaluación comparativa de políticas VLA: útil como referencia base frente a políticas entrenadas desde cero, al conservar el comportamiento del modelo original.
- Docencia y prototipado: la licencia permisiva y el tamaño manejable facilitan su uso en cursos y demostraciones de robótica con aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros, en fp32 se requieren aproximadamente 1,8 GB solo para pesos; en bf16, unos 0,9 GB. La VRAM total depende del tamaño de las observaciones visuales y del buffer de vídeo del backbone.
- GPU recomendadas: no disponibles de forma específica; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia en precisión reducida.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no se dispone de confirmación oficial.
- Opciones de despliegue: LeRobot (librería nativa del checkpoint); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| policy-c-weights (este) | 450 M | no disponible | Apache 2.0 | Hugging Face (repo de 0,9 GB) |
| lerobot/smolvla_base | no disponible (mismo backbone SmolVLM2-500M) | no disponible | Apache 2.0 | Hugging Face |
| Otros VLA de la familia LeRobot | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no incluye los ficheros de configuración, tokenizer ni processor del backbone VLM; la carga depende de resolver `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` desde una caché local de Hugging Face, lo que puede fallar en entornos sin acceso o sin caché previa.
- Los pesos son idénticos a `lerobot/smolvla_base`; no aporta mejoras ni cambios respecto al modelo base, por lo que hereda todas sus limitaciones.
- No se dispone de información sobre sesgos conocidos del modelo.
- Riesgo de alucinación en la interpretación de instrucciones: no cuantificado en la información disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0: permite uso comercial con atribución al equipo LeRobot de Hugging Face, tal como indica la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.
- Para producción robótica, conviene verificar la integridad de los pesos y la disponibilidad del backbone antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/lucaslim/policy-c-weights
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Backbone VLM: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
