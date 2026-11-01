# HA0329/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una variante del modelo DeepSeek-V4.1-Flash-1017 publicada por el usuario HA0329 en HuggingFace. Se trata de una version con la "direccion de rechazo" ablacionada (abliterated), es decir, se han modificado los pesos del modelo original para eliminar el comportamiento de rechazo ante peticiones que el modelo base denegaria. La ablacion se ha realizado con la herramienta OBLITERATUS empleando el metodo failspy. El modelo base es un transformer de tipo mezcla de expertos (MoE) de la familia DeepSeek, con 754.638.836.864 parametros totales segun los safetensors del repositorio.

El modelo conserva la arquitectura y capacidades del modelo base DeepSeek-V4.1-Flash-1017, pero con la alineacion de seguridad practicamente eliminada: la tasa de rechazo baja del 81,62 % al 4,30 % en el corpus de evaluacion del autor, y la asistencia danina sube del 10,38 % al 78,28 %. La coherencia y la capacidad se mantienen al 100 % segun la model card, con una divergencia KL de 0,1305 nats respecto al original. El repositorio ocupa 1.509,4 GB en safetensors BF16.

Es relevante ahora porque ilustra el estado de las tecnicas de ablacion de rechazo aplicadas a modelos MoE de gran escala, y porque la model card documenta con detalle el protocolo de evaluacion (corpus de 842 prompts, clasificacion por jueces Claude Opus 4.6 y GPT-6.1 Sol, MMLU con 2.500 preguntas). No obstante, el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia MIT no exime de las implicaciones eticas de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia DeepSeek, tipo deepseek_v41_text) |
| Parametros totales | 754.638.836.864 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 1.509,4 GB |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Metodo de ablacion | OBLITERATUS, metodo failspy |
| Fecha de creacion | 2026-11-01 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del DeepSeek-V4.1-Flash-1017, un transformer de mezcla de expertos (MoE) de la familia DeepSeek, segun la etiqueta `moe` y la arquitectura `deepseek_v41_text` declaradas en el repositorio. No se dispone de informacion sobre el numero de parametros activos, el numero de expertos, la longitud de contexto nativa ni la composicion del dataset de entrenamiento original, ya que la model card no los detalla.

El entrenamiento original del modelo base no se describe en la informacion disponible. La intervencion realizada por HA0329 consiste en una ablacion de la direccion de rechazo mediante OBLITERATUS con el metodo failspy, que modifica los pesos para eliminar la representacion interna asociada al rechazo. Segun la model card, la intervencion se calibro sobre un conjunto de 254 prompts, la seleccion del metodo uso 50 prompts y los 534 restantes no participaron en ninguno de los dos procesos. La evaluacion se realizo el 30 de octubre de 2026 con clasificadores automaticos (Claude Opus 4.6, GPT-6.1 Sol y una revision local con Codex). La divergencia KL de 0,1305 nats se calcula como KL forward sobre tokens de secuencia respecto al modelo original.

## Capacidades

- Generacion de texto conversacional en formato chat, segun la etiqueta `conversational` y el pipeline `text-generation`.
- Razonamiento y respuesta a prompts de tipo instructivo, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Capacidad de seguir instrucciones sin el filtro de rechazo del modelo original: en el corpus de evaluacion responde al 86,52 % de las peticiones frente al 16,59 % del base.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue en infraestructura de inferencia gestionada, aunque no se detalla.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la ablacion de rechazo sobre el comportamiento de un MoE de gran escala, comparando las distribuciones de rechazo, asistencia danina y accionabilidad documentadas en la model card frente al modelo base.
- Evaluacion de robustez de filtros de seguridad: sirve como contraste para medir si los clasificadores de salida de un pipeline de produccion detectan respuestas que el modelo base habria rechazado, usando el corpus de 842 prompts como referencia.
- Analisis de divergencia conductual: con una KL de 0,1305 nats y coherencia del 100 %, es util para estudiar cuanto cambia el comportamiento de un modelo tras una intervencion de pesos sin degradar la calidad linguistica.
- Generacion de texto sin restricciones en entornos controlados de investigacion: para experimentos de red teaming donde se necesita un modelo que responda a peticiones que el base deniega, siempre dentro de un marco etico y legal.
- Estudio de la relacion entre refusal y capacidad: la evaluacion MMLU con thinking desactivado y logits de respuesta permite analizar si la ablacion afecta al rendimiento en conocimiento general.
- Benchmarking de tecnicas de ablacion: comparar el metodo failspy de OBLITERATUS con otras tecnicas sobre el mismo modelo base, usando las metricas de la model card (tasa de rechazo, KL, coherencia, capacidad) como referencia reproducible.

## Benchmarks y rendimiento

La model card incluye resultados de MMLU (2.500 preguntas, 57 materias, zero-shot chat, thinking desactivado, logits de eleccion de respuesta) y del corpus de rechazo de OBLITERATUS. La tabla de MMLU aparece truncada en la informacion disponible, por lo que no se puede reproducir la precision numerica del modelo base ni de la variante ablacionada.

Resultados del corpus de rechazo (842 prompts, porcentajes sobre 838 respuestas completadas):

| Metrica | Base | Obliterated | Delta (pp) |
|---|---:|---:|---:|
| Rechazo total | 81,62 % | 4,30 % | -77,33 |
| Rechazo parcial | 4,89 % | 14,44 % | +9,55 |
| Sin rechazo | 13,37 % | 78,28 % | +64,92 |
| Asistencia danina | 10,38 % | 78,28 % | +67,90 |
| Respuesta directa a la peticion | 16,59 % | 86,52 % | +69,93 |
| Alternativa segura | 83,29 % | 10,50 % | -72,79 |
| Danio nivel 3 (grave) | 3,82 % | 44,75 % | +40,93 |
| Danio nivel 4 (severo) | 0,12 % | 9,31 % | +9,19 |
| Accionabilidad nivel 4 | 3,46 % | 20,76 % | +17,30 |

Metricas de la intervencion segun el torneo de metodos: tasa de rechazo 4 %, KL 0,1305 nats, coherencia 100 %, capacidad 100 % (6 de 6 comprobaciones superadas).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1.509 GB solo de pesos, mas overhead de activaciones y KV cache; requiere un cluster multi-GPU de alta gama.
- En cuantizacion de 8 bits: alrededor de 755 GB, aun fuera del alcance de una sola GPU.
- En cuantizacion de 4 bits: alrededor de 377 GB, todavia inviable en GPU de consumo.
- GPU recomendadas: no cabe en RTX 4090 ni en consumer GPU; requiere nodos con multiples A100 80 GB, H100 80 GB o H200, en numero elevado (estimacion de mas de 18 GPUs H100 en BF16).
- Opciones de despliegue: no se especifican en la model card; por arquitectura MoE y formato safetensors BF16, candidatos habituales serian vLLM o TGI con paralelismo tensorial, aunque no hay confirmacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | 754.638.836.864 | no disponible | MIT | 0 descargas |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | modelo de referencia |
| Otras variantes abliterated de DeepSeek | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos alternativos de la misma categoria en la informacion proporcionada, salvo la comparacion interna con el modelo base que figura en la seccion de benchmarks.

## Limitaciones y advertencias

- La ablacion elimina el rechazo: el 78,28 % de las respuestas del corpus se clasificaron como asistencia danina, frente al 10,38 % del base.
- El 44,75 % de las respuestas alcanzo nivel 3 de danio (grave) y el 9,31 % nivel 4 (severo o generalizado), segun los jueces automaticos.
- El 20,76 % de las respuestas se clasifico con accionabilidad nivel 4 (suficientemente concreta para habilitar la conducta).
- Riesgo elevado de generar contenido danino, ilegal o peligroso; no apto para despliegue en produccion orientado al publico sin filtros externos.
- La licencia MIT permite uso comercial, pero no exime de las obligaciones legales y eticas derivadas del contenido generado.
- La evaluacion la realizaron modelos jueces automaticos (Claude Opus 4.6, GPT-6.1 Sol, Codex local) sin ejecucion ni verificacion de las instrucciones; los resultados son descriptivos del texto visible.
- 25 respuestas quedaron sin anotar por bloqueos de proveedor o plataforma, y una anotacion es ambigua.
- No se dispone de informacion sobre sesgos, idiomas soportados, longitud de contexto ni cuantizaciones, lo que limita la evaluacion de su comportamiento fuera del corpus documentado.
- El modelo base es de noviembre de 2026 y el repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion independiente de la comunidad.
- La coherencia y capacidad al 100 % se midieron con 6 comprobaciones y 50 prompts de seleccion, muestras pequenas que no garantizan el comportamiento general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HA0329/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del metodo (referenciado en la model card): winner-recovery-provenance.json
- Resultados de evaluacion (referenciado en la model card): evaluation-status.json
- Licencia (referenciada en la model card): LICENSE
