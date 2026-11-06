# ash-astro/HaloGuard2.0-Stream-0.8B

## Resumen

HaloGuard 2.0-Stream-0.8B es un modelo de clasificación de tokens disenado como guardia de salida en streaming, desarrollado por el usuario ash-astro. A diferencia de los clasificadores de seguridad convencionales que evaluan una respuesta completa una vez generada, este modelo emite una probabilidad de peligrosidad en cada token de la respuesta mientras esta se produce, lo que permite interrumpir una generacion danina a mitad de stream. Se construye sobre el backbone de Qwen3.5-0.8B, con 752 millones de parametros totales y una ventana de contexto maxima de 2.048 tokens.

El modelo resuelve un problema concreto de despliegue: los guardias de entrada revisan el prompt antes de generar, pero no detectan respuestas que empiezan con un rechazo y despues cumplen con la peticion danina. HaloGuard-Stream aborda ese patron de "rechazo seguido de cumplimiento" mediante una cabeza de clasificacion por token que solo puntua posiciones de respuesta, nunca del prompt.

Su relevancia radica en que ofrece veredictos causales por token con una regla de servicio calibrada y latcheada, y reporta el indice donde la respuesta se vuelve insegura. El autor declara un F1 macro medio de 83,6 en seis benchmarks de danosidad de respuesta, con 83,3 en el conjunto held-out, situandose por delante de las lineas base abiertas de guardia de 0,6B a 27B segun la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5) con cabeza de clasificacion por token |
| Parametros totales | 752.395.074 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | bfloat16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto Qwen3.5-0.8B y anade una cabeza de clasificacion de tokens sobre las posiciones de la respuesta. La senal es causal: la probabilidad en el token t depende unicamente del prompt y de los tokens 0..t, lo que permite usarla durante la generacion y no solo al final. El prompt se incluye en el forward pass como contexto, pero el scoring se restringe a posiciones de respuesta, de modo que ningun token del prompt puede disparar el veredicto.

La decision de respuesta se forma con una regla de servicio latcheada de dos brazos: se dispara si el maximo de P(unsafe) es mayor o igual a 0,975 (brazo de pico) o si hay dos tokens consecutivos con P(unsafe) mayor o igual a 0,70 (brazo de racha). Una vez disparado, el veredicto queda fijado y el stream se corta en la primera posicion que satisface cualquiera de los dos brazos. La regla se considera propiedad del despliegue y no de los pesos; el archivo `serving_rule.json` recoge el punto de operacion calibrado y las probabilidades por token se exponen para reajustar el compromiso entre falsos positivos y falsos negativos. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Clasificacion de seguridad por token sobre respuestas generadas, con probabilidad P(unsafe) en cada posicion.
- Veredicto binario `safe`/`unsafe` latcheado, acompanado del indice de primer disparo (`first_fire_index`).
- Deteccion del punto de inicio del dano dentro de una respuesta, no solo del resultado final.
- Reconocimiento del patron de cumplimiento tras rechazo: una respuesta que empieza rechazando y luego cumple se marca como insegura.
- Regla de servicio de dos brazos (pico y racha) para recuperar dano sostenido de confianza moderada.
- Integracion con la libreria transformers mediante `AutoModelForTokenClassification` y `trust_remote_code`.
- Soporte exclusivo de ingles; no se documentan capacidades multilingues.
- No se documentan tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Moderacion de salidas en produccion: el guardia se ejecuta en paralelo a la generacion y corta el stream en cuanto se satisface la regla de servicio, evitando que una completion danina llegue completa al usuario.
- Deteccion de cumplimiento tras rechazo: en asistentes con politicas de rechazo, el modelo identifica el token donde la respuesta deja de rechazar y empieza a cumplir una peticion danina, algo que los heuristicos de prefijo no capturan.
- Pasarela de seguridad para APIs de terceros: al exponer un LLM como servicio, HaloGuard-Stream puede actuar como capa intermedia que inspecciona cada respuesta antes de reenviarla, con un coste de VRAM inferior a 4 GB.
- Auditoria de trazas conversacionales: el indice de primer disparo permite localizar en logs donde se produjo el dano, facilitando la revision manual y el ajuste de politicas.
- Investigacion en seguridad de LLM: las probabilidades por token expuestas permiten estudiar curvas de riesgo dentro de una respuesta y recalibrar umbrales segun los costes de falsos positivos y negativos del dominio.
- Filtrado en pipelines de generacion por lotes: aunque su diseno es streaming, la clasificacion por token puede aplicarse a respuestas ya generadas para etiquetar y descartar lotes con contenido inseguro.
- Despliegue en entornos con GPU de gama baja: al necesitar una sola GPU con al menos 4 GB de VRAM, puede co-ubicarse con modelos pequenos en infraestructura modesta.

## Benchmarks y rendimiento

La model card declara un F1 macro medio de 83,6 en seis benchmarks de danosidad de respuesta bajo una unica regla global de decision, y 83,3 en el conjunto held-out. Asimismo afirma una ventaja de +2,65 a +4,81 sobre Qwen3Guard-Stream en todos los tamanos. No se proporcionan en la informacion disponible las tablas desglosadas por benchmark ni los resultados individuales de MMLU, HumanEval o GSM8K, que ademas no aplican a la tarea de clasificacion de seguridad.

| Metrica | Valor |
|---|---|
| F1 macro medio (6 benchmarks) | 83,6 |
| F1 macro en held-out | 83,3 |
| Comparacion declarada con Qwen3Guard-Stream | +2,65 a +4,81 en todos los tamanos |
| Desglose por benchmark | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 4 GB en bfloat16, segun la model card.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; no se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, con el umbral de 4 GB indicado por el autor.
- Opciones de despliegue: transformers con `AutoModelForTokenClassification`, `trust_remote_code` y, si es necesario, una build fijada de transformers desde el commit `394b1a0eaa8e6199e372334da0aff3753a117fdb`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| HaloGuard 2.0-Stream-0.8B | 752 M | 2.048 | Guardia de salida en streaming | Apache 2.0 | F1 macro 83,6 |
| HaloGuard 1.0-Gen-0.8B | No disponible | No disponible | Guardia de entrada (prompt) | No disponible | F1 macro 90,9 (prompt harmfulness) |
| Qwen3Guard-Stream (varios tamanos) | 0,6B a 27B | No disponible | Guardia de salida en streaming | No disponible | Inferior segun la model card, sin cifras detalladas |

La comparativa se basa en las afirmaciones de la model card; no se dispone de los resultados numericos de Qwen3Guard-Stream ni de las especificaciones completas de HaloGuard 1.0-Gen en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan otros idiomas.
- Ventana de contexto maxima de 2.048 tokens, insuficiente para respuestas o conversaciones largas.
- Entrenado exclusivamente para moderacion de salidas; no es un modelo generativo ni sirve para tareas de razonamiento, codigo o matematicas.
- Riesgo de falsos positivos y negativos inherente a la clasificacion; la regla de servicio es calibrable pero los umbrales por defecto pueden no ajustarse a todos los dominios.
- La dependencia de una build fijada de transformers para el tipo `Qwen3.5` puede complicar el despliegue en entornos con versiones estandar.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor.
- La model card no detalla sesgos conocidos, composicion del dataset de entrenamiento ni procesos de alineacion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, debe verificarse el cumplimiento de las condiciones de la licencia del modelo base Qwen3.5-0.8B.
- El modelo tiene 26 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/ash-astro/HaloGuard2.0-Stream-0.8B
- Modelo complementario de entrada: https://huggingface.co/astroware/HaloGuard1-Gen-0.8B
- Build fijada de transformers: https://github.com/huggingface/transformers/archive/394b1a0eaa8e6199e372334da0aff3753a117fdb.tar.gz
- Paper, blog, repositorio o demo adicionales: no disponible
