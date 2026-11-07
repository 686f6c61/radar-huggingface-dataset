# bi0/hs-decide-1-flash-Q8_0-GGUF

## Resumen

hs-decide-1-flash-Q8_0-GGUF es una cuantización en formato GGUF (Q8_0) del modelo base `hindsight-ai/hs-decide-1-flash`, publicada por el usuario `bi0`. El modelo original, según los resultados de búsqueda disponibles, está orientado a tareas de decisión y puntuación ("systemone": noul / score / choice, con soporte multi-pregunta) y se sirve a través de un endpoint HTTP `POST /v1/systemone`. Esta ficha describe la variante cuantizada, que aplica además una "calibración de sesgo de logits" (System-1 Logit-Bias Calibration) sobre los pesos públicos originales.

El artefacto es notablemente pequeño: 774,23 MB (811.843.840 bytes) en formato Q8_0, lo que sitúa el modelo en la categoría de modelos compactos aptos para despliegue en hardware consumer. Los tags del repositorio (`dgx-spark`, `blackwell-gb10`, `sm121`) indican que la cuantización fue generada y validada en una estación NVIDIA DGX Spark con GPU Blackwell GB10.

La relevancia de esta ficha es doble: por un lado, documenta una variante cuantizada de un modelo poco difundido (0 descargas, 0 likes en el momento de la consulta); por otro, los resultados de búsqueda web advierten que la cuantización Q8_0 de este mismo modelo falló una prueba A/B frente a los pesos bf16 en 14 de 20 payloads fijos, con una diferencia máxima de probabilidad de 7,85e-3. Esta advertencia es crítica para cualquier uso en producción y se detalla en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base no documenta la arquitectura en la información proporcionada) |
| Parametros totales | no disponible (el tamaño del fichero Q8_0 es de 774,23 MB, lo que sugiere un modelo del orden de cientos de millones de parámetros, pero no se confirma) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); el modelo base también se distribuye en bf16 según resultados de búsqueda |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q8_0) |
| Modelo base | hindsight-ai/hs-decide-1-flash |
| Metodo de modificacion | Cuantización GGUF Q8_0 + System-1 Logit-Bias Calibration |
| Tamano del fichero | 774,23 MB (811.843.840 bytes) |
| SHA-256 | e6ed8d9f17d3327ae4aca8c0e190b6a7b6757d8c8c92f2d220b854de956cb950 |
| Hardware de referencia | NVIDIA DGX Spark, GPU Blackwell GB10 (sm121) |
| Puerto de runtime activo | 8094 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `hindsight-ai/hs-decide-1-flash`: la model card del repositorio cuantizado no describe la familia arquitectónica (transformer, MoE, SSM o híbrida), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Todo ello debe considerarse "no disponible".

Lo que sí documenta la model card es el proceso de modificación aplicado sobre los pesos públicos: una cuantización GGUF Q8_0 acompañada de una calibración de sesgo de logits denominada "System-1 Logit-Bias Calibration". Según los resultados de búsqueda, el modelo base se sirve mediante un endpoint `POST /v1/systemone` que acepta payloads con los campos `noul`, `score` y `choice`, y admite múltiples preguntas por petición. La variante bf16 del mismo modelo (1,5 GiB) es la que, según esos mismos resultados, supera la validación A/B frente al plugin oficial de vLLM, mientras que la Q8_0 no lo hace.

## Capacidades

- Puntuación y decisión estructurada: el modelo expone una interfaz de tipo `systemone` con los modos `noul`, `score` y `choice`, orientada a emitir puntuaciones o elecciones sobre entradas dadas.
- Soporte multi-pregunta: el endpoint acepta varias preguntas en una misma petición según los resultados de búsqueda.
- Servicio vía HTTP: pensado para desplegarse como servicio local en el puerto 8094 en el entorno de referencia del autor.
- Generación de texto general: no confirmada explícitamente en la información disponible.
- Razonamiento multi-paso y agentes: no disponible.
- Tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, modo thinking): no disponible.

## Casos de uso

- Clasificación y puntuación de candidatos en pipelines de decisión: el modelo puede recibir un conjunto de opciones (`choice`) y devolver una selección puntuada, integrándose en flujos de enrutamiento o triaje donde se necesita una decisión automática de bajo coste computacional.
- Evaluación automática de respuestas generadas: usando el modo `score`, puede asignar puntuaciones a textos candidatos dentro de un pipeline de evaluación de calidad, siempre que se valide su calibración frente a la variante bf16.
- Enrutamiento de consultas en sistemas multi-modelo: dado su tamaño reducido (774 MB en Q8_0), puede desplegarse como clasificador ligero que decide a qué modelo mayor derivar cada consulta.
- Despliegue en hardware de gama consumer o edge: el tamaño del fichero permite ejecutarlo en GPUs con poca VRAM o incluso en CPU mediante llama.cpp, lo que lo hace adecuado para prototipos locales y entornos con recursos limitados.
- Servicio local de decisión con API HTTP: el endpoint `POST /v1/systemone` permite integrarlo como microservicio en arquitecturas internas, por ejemplo en el puerto 8094 tal como documenta el autor.
- Pruebas de concepto y experimentación con cuantización: sirve como caso de estudio para comparar el comportamiento de pesos Q8_0 frente a bf16 en tareas de puntuación, dado el fallo de validación A/B documentado.
- Procesamiento por lotes de preguntas múltiples: el soporte multi-pregunta del endpoint permite evaluar conjuntos de decisiones en una sola llamada, reduciendo la sobrecarga de red en tareas de triaje masivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo único documentado es una validación A/B interna frente al plugin oficial de vLLM sobre 20 payloads fijos, según los resultados de búsqueda:

| Variante | Payloads superados | Diferencia maxima de probabilidad | Argmax |
|---|---|---|---|
| Q8_0 (esta ficha) | 6 de 20 | 7,85e-3 | no disponible |
| bf16 | 19 de 20 | 1,40e-3 | identico en todos los casos |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 774,23 MB; con overhead de contexto y runtime, se estima un consumo del orden de 1 a 2 GB de VRAM, aunque no se dispone de mediciones oficiales.
- GPU de referencia del autor: NVIDIA DGX Spark con GPU Blackwell GB10 (sm121), según los tags del repositorio.
- GPU consumer: por tamaño, cabe holgadamente en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090, etc.), así como en iGPU con memoria unificada.
- Despliegue: llama.cpp y Ollama son opciones naturales para GGUF; el modelo base se sirve mediante un endpoint HTTP propio (`POST /v1/systemone`) y, según los resultados de búsqueda, existe un plugin oficial de vLLM para el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bi0/hs-decide-1-flash-Q8_0-GGUF (esta ficha) | no disponible | no disponible | GGUF Q8_0 | no disponible | Fallo 14/20 en validación A/B |
| nanoandrew4/hs-decide-1-flash-GGUF (bf16) | no disponible | no disponible | GGUF bf16 (1,5 GiB) | no disponible | Supera 19/20 en validación A/B |
| hindsight-ai/hs-decide-1-flash (base) | no disponible | no disponible | no disponible | no disponible | Modelo original con plugin vLLM |

No se dispone de información sobre otros modelos comparables de la misma categoría (decisión/puntuación) en la documentación proporcionada.

## Limitaciones y advertencias

- Calibración deficiente de la cuantización Q8_0: según los resultados de búsqueda, esta variante falló 14 de 20 payloads fijos en la validación A/B frente al plugin oficial de vLLM, con una diferencia máxima de probabilidad de 7,85e-3. Para uso en producción se recomienda la variante bf16 (nanoandrew4/hs-decide-1-flash-GGUF), que supera 19 de 20.
- Licencia no especificada: no se indica la licencia del modelo base ni de esta cuantización, por lo que no se puede confirmar su aptitud para uso comercial.
- Idiomas no documentados: se desconoce el soporte multilingüe real.
- Arquitectura y contexto desconocidos: la ausencia de especificaciones impide evaluar límites de ventana de contexto y comportamiento en secuencias largas.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un modelo de decisión, los errores se manifestarían como puntuaciones o elecciones incorrectas.
- Sesgos: no documentados.
- Repositorio con escasa tracción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, lo que reduce la validación comunitaria.
- Metadatos incompletos: la model card no incluye información sobre el proceso de entrenamiento ni sobre la calibración de sesgo de logits aplicada, lo que dificulta reproducir el comportamiento.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/bi0/hs-decide-1-flash-Q8_0-GGUF
- Modelo base: https://huggingface.co/hindsight-ai/hs-decide-1-flash
- Variante bf16 recomendada: https://huggingface.co/nanoandrew4/hs-decide-1-flash-GGUF
