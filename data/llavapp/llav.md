# llavapp/llav

## Resumen

llav es un modelo de decisión abierto desarrollado por llavapp que transforma condiciones difusas de software en llamadas tipadas: recibe un estado (un ticket, un pasaje de texto, una imagen o un clip de audio) junto con una pregunta de sí/no y devuelve una probabilidad calibrada. Se presenta como implementación del protocolo System One y es compatible con clientes de estilo Jev, además de ofrecerse como servicio en llav.app con un nivel gratuito de 10.000 decisiones diarias por clave.

La familia consta de tres variantes: un juez de texto basado en Qwen3-Reranker-4B con LoRA y promediado de pesos, un juez de imagen basado en Qwen3-VL-Reranker-8B con LoRA y un juez de audio basado en el thinker de Qwen2.5-Omni-3B con LoRA en bf16. La versión de texto es la 0.4 estable, mientras que las variantes de imagen y audio están en 0.5-preview.

Es relevante porque ataca un problema concreto de ingeniería: sustituir heurísticas y umbrales frágiles por un clasificador calibrado con salida probabilística, evaluable y con métricas de calibración publicadas (Brier y ECE). No obstante, en la fecha de esta ficha los pesos no están disponibles en el repositorio de Hugging Face: solo se publican código y scripts de entrenamiento y evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Juez de texto: Qwen3-Reranker-4B con LoRA y promediado de pesos. Juez de imagen: Qwen3-VL-Reranker-8B con LoRA. Juez de audio: thinker de Qwen2.5-Omni-3B con LoRA en bf16 |
| Parámetros totales | 4B (texto), 8B (imagen), 3B (audio) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el juez de audio se entrena en bf16; el resto sin especificar) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (código y pesos publicados) |
| Formato de pesos | no disponible (los pesos no están en el repositorio; se publicarán con la versión 0.5) |

## Arquitectura y entrenamiento

llav no es un modelo base propio, sino una familia de adaptadores LoRA sobre modelos preexistentes de Qwen. El juez de texto parte de Qwen3-Reranker-4B y aplica LoRA con promediado de pesos para producir una probabilidad calibrada ante preguntas de relevancia, evidencia o sí/no sobre texto. El juez de imagen parte de Qwen3-VL-Reranker-8B con LoRA y responde preguntas de sí/no sobre una o dos fotografías. El juez de audio parte del thinker de Qwen2.5-Omni-3B, también con LoRA en bf16, y evalúa emoción, intención o sonido en un clip.

La propuesta se enmarca en lo que el autor denomina protocolo System One, con compatibilidad directa con clientes de estilo Jev. El repositorio de GitHub publica código, scripts de entrenamiento y scripts de evaluación, pero la model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. Tampoco se documentan innovaciones de decodificación o atención.

## Capacidades

- Clasificación binaria calibrada: devuelve una probabilidad ante una pregunta de sí/no sobre un estado dado, en lugar de una etiqueta dura.
- Juicio de relevancia y evidencia sobre texto: evalúa si un pasaje respalda una afirmación o si un documento es relevante para una consulta.
- Juicio sobre imágenes: responde preguntas de sí/no sobre una o dos fotografías (variante 0.5-preview).
- Juicio sobre audio: evalúa emoción, intención y contenido sonoro de un clip (variante 0.5-preview).
- Salida tipada por pregunta: la API acepta un objeto de preguntas con tipo e instrucciones, lo que permite formular varias decisiones en una sola llamada.
- Compatibilidad con el protocolo System One: integrable como sustituto directo en clientes de estilo Jev.
- Idiomas: inglés y chino.
- No se documentan capacidades de generación libre, tool calling, razonamiento multi-paso ni modo thinking.

## Casos de uso

- Enrutado de tickets de soporte: el juez de texto evalúa preguntas como «¿el cliente pide un reembolso?» o «¿esto es una incidencia de facturación?» y la probabilidad resultante alimenta la asignación de cola. La calibración publicada (Brier 0,0095 en la ronda 0) permite fijar umbrales con una interpretación probabilística razonable.
- Filtrado de recuperación en pipelines RAG: dado un pasaje y una consulta, el modelo puntúa la relevancia como probabilidad, lo que permite descartar candidatos antes de pasarlos al generador y reducir coste por consulta.
- Verificación de evidencia en respuestas generadas: comprobar si el fragmento citado respalda de verdad la afirmación del modelo, usando la salida calibrada como señal de confianza y no solo como etiqueta.
- Moderación asistida: clasificar si un mensaje cumple una condición definida por política (por ejemplo, si contiene una solicitud comercial) y usar la probabilidad como puntuación ordenable para revisión humana.
- Triaje de imágenes en soporte: en la variante de imagen, responder si una foto muestra el daño descrito o si el producto coincide con el pedido, con una AUC de 0,950 en el conjunto de 2.458 elementos reportado por el autor.
- Análisis de llamadas y notas de voz: en la variante de audio, detectar emoción o intención en un clip para priorizar casos de insatisfacción, con una AUC de 0,952 en 1.200 clips según la model card.
- Automatización de reglas de negocio: sustituir condicionales basados en palabras clave por llamadas al juez con instrucciones en lenguaje natural, manteniendo la lógica versionada en el código.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos con los mismos candidatos y el mismo día. Los detalles y advertencias están en llav.app/benchmarks.

| Benchmark | llav | Jev 1.14 | Gemini Decision 1 |
|---|---|---|---|
| Juez de texto, MuSiQue held-out (AUC / R@10) | 0,977 / 0,942 | 0,969 / 0,924 | 0,941 / 0,845 |
| Calibración, ronda 0 (Brier / ECE, menor es mejor) | 0,0095 / 0,004 | 0,0113 / 0,015 | 0,0118 / 0,031 |
| Juez de imagen, 2.458 elementos (AUC) | 0,950 | 0,955 | 0,942 |
| Juez de audio, 1.200 clips (AUC) | 0,952 | 0,533 | 0,842 |
| SAG2 extremo a extremo, MuSiQue (R@10) | 0,812 | 0,933 | 0,895 |

Advertencia del propio autor: los benchmarks de imagen y audio son in-distribution para llav (entrenado sobre las mismas fuentes de datos con particiones distintas); los resultados en conjunto ciego están pendientes de publicación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 4B en bf16 requiere del orden de 8-9 GB solo para pesos, y uno de 8B del orden de 16-17 GB; a ello hay que sumar caché de contexto y overhead del runtime. Son estimaciones, no cifras publicadas por el autor.
- GPU recomendadas: no especificadas. El autor documenta autoalojamiento en una única GPU NVIDIA o mediante MLX en Apple Silicon.
- GPU de consumo: no confirmado. Por tamaño, el juez de texto de 4B y el de audio de 3B serían los candidatos plausibles en GPUs de consumo con suficiente VRAM; el de imagen de 8B queda más ajustado. Sin pesos publicados no puede verificarse.
- Opciones de despliegue: servicio gestionado en api.llav.app (protocolo System One, nivel gratuito de 10.000 decisiones diarias por clave); autoalojamiento con MLX en Apple Silicon o una GPU NVIDIA según el repositorio de GitHub. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (juez de texto, AUC MuSiQue) | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| llav 0.4 (texto) | 4B (Qwen3-Reranker-4B + LoRA) | no disponible | 0,977 | Apache-2.0 | No publicados aún; previstos con la 0.5 |
| Jev 1.14 | no disponible | no disponible | 0,969 | no disponible | no disponible |
| Gemini Decision 1 | no disponible | no disponible | 0,941 | propietaria | solo API |

La comparación se limita a los tres sistemas incluidos en la model card. Jev 1.14 supera a llav en la prueba extremo a extremo SAG2 (R@10 de 0,933 frente a 0,812) y en el juez de imagen (AUC 0,955 frente a 0,950), mientras que llav lidera en juez de texto, calibración y audio. No se dispone de datos de otros jueces o rerankers comparables en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no están en el repositorio de Hugging Face en el momento de esta ficha; solo están abiertos el código y los scripts. El uso real requiere la API gestionada o esperar a la versión 0.5.
- Los benchmarks de imagen y audio son in-distribution según el propio autor; los resultados en conjunto ciego están pendientes, por lo que las cifras de AUC de esas modalidades deben tomarse con cautela.
- El rendimiento extremo a extremo en SAG2 (R@10 de 0,812) queda por debajo de Jev 1.14 y de Gemini Decision 1, lo que sugiere que un buen juez individual no garantiza el mejor pipeline completo.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otras lenguas.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento fuera de distribución. Al ser un clasificador, el riesgo principal no es la alucinación generativa sino la confianza mal calibrada en dominios distintos de los de entrenamiento.
- La licencia Apache-2.0 permite uso comercial de código y pesos publicados, pero los datasets de benchmark reutilizados conservan sus propias licencias.
- El nivel gratuito de la API está limitado a 10.000 decisiones diarias por clave; para volúmenes mayores habrá que consultar las condiciones del servicio.
- No se especifican longitud de contexto, formatos de cuantización ni requisitos de hardware oficiales, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llavapp/llav
- Repositorio de código, entrenamiento y evaluación: https://github.com/llachat/llav
- Servicio y API: https://llav.app
- Detalles y advertencias de benchmarks: https://llav.app/benchmarks
