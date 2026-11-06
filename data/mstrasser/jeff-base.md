# mstrasser/jeff-base

## Resumen

Jeff-base (v1.4) es un modelo de decisión de pequeno tamano desarrollado por el proyecto Jeff (mstrasser), un fine-tune de Qwen3.5-0.8B. A diferencia de un modelo generativo convencional, Jeff no produce texto: recibe una descripción de una situación (el *state*) y una lista de opciones en lenguaje natural, y devuelve en un único forward pass una probabilidad calibrada para cada opción. Esto elimina la necesidad de parsear la salida generada y reduce la latencia frente a esquemas de prompting con modelos generativos.

El modelo cuenta con 852.985.920 parámetros (aproximadamente 0,85 mil millones), está construido sobre la arquitectura transformer de Qwen3.5-0.8B y se distribuye bajo licencia Apache-2.0. Su función declarada es servir de base para los adaptadores LoRA del ecosistema Jeff: la base aprende el "gist" de muchas tareas y cada adaptador especializa el modelo en una tarea concreta (por ejemplo, clasificación de seguridad, guardrails o etiquetado).

Es relevante ahora porque propone un patrón distinto al de los LLM generativos para tareas de clasificación y enrutamiento: un modelo "system-1" local, rápido y calibrado, pensado para ejecutarse en hardware modesto y para integrarse en pipelines donde la salida debe ser una distribución de probabilidad sobre opciones predefinidas, no texto libre. La versión v1.4 obliga a que cada adaptador se entrene sobre esta revisión concreta de la base (verificación por SHA-256).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` y `readout.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer denso de aproximadamente 0,85 mil millones de parámetros. Jeff añade sobre esta base un mecanismo de *readout* sobre "answer codes" (códigos de respuesta con sus token ids definidos en `decision_config.json`), que transforma el estado final del modelo en una distribución de probabilidad sobre las opciones proporcionadas. El prompt sigue un layout denominado `live-last`: las instrucciones fijas y las opciones van primero y la entrada variable al final, de modo que los prefijos de prompt pueden cachearse entre llamadas.

El entrenamiento de v1.4 parte de Qwen3.5-0.8B y utiliza la mezcla general del proyecto Jeff (conjuntos de datos públicos de diversas licencias, algunas share-alike, más preguntas construidas por código y sintéticas) junto con una porción de los datos de entrenamiento de cada adaptador Jeff, tanto abiertos como propietarios, sin usar las filas de desarrollo, calibración o test de ningún adaptador. Algunos adaptadores se reservaron por completo fuera de la base para medir su rendimiento en tareas no vistas. No se documenta en la información disponible el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. Cada adaptador registra el SHA-256 de los pesos base sobre los que fue entrenado y el motor rechaza cualquier otra base.

## Capacidades

- Clasificación zero-shot y selección entre opciones descritas en lenguaje natural, devolviendo una probabilidad calibrada por opción.
- Decisión en un único forward pass, sin generación de texto que parsear.
- Soporte de adaptadores LoRA especializados por tarea (cargados mediante el SDK o descargados por separado).
- Integración con el SDK Python de Jeff (`jeff.Jeff.local`) y con el servidor y SDKs del repositorio del proyecto.
- Salida con valor de decisión y nivel de confianza (`decision.value`, `decision.confidence`).
- Modelo local: diseñado para ejecutarse en el propio equipo del usuario.
- No soporta tool calling, agentes multi-paso, visión, audio ni razonamiento encadenado; el autor lo describe explícitamente como un modelo "system-1" sin razonamiento multi-paso.

## Casos de uso

- Guardrails de seguridad en asistentes conversacionales: el adaptador `jeff.safety.guard.attempt` evalúa si un mensaje de usuario intenta un ataque (por ejemplo, inyección de instrucciones) y devuelve una probabilidad calibrada, integrándose en el flujo de un chat de soporte antes de invocar al LLM principal.
- Enrutamiento de peticiones: dado un mensaje entrante y una lista de destinos posibles (departamentos, intenciones, colas de soporte), Jeff devuelve la probabilidad de cada destino en un solo paso, lo que permite enrutar con umbrales de confianza explícitos.
- Moderación de contenido: clasificación de textos frente a categorías de política con probabilidades calibradas, útil cuando se necesita un umbral auditable en lugar de una etiqueta generada.
- Etiquetado y anotación de datos a escala: clasificación de grandes volúmenes de registros con un modelo pequeño y local, reduciendo coste frente a APIs de modelos grandes.
- Filtrado previo en pipelines RAG: decidir si una consulta es respondible con la base documental disponible o debe escalarse, usando la confianza de la decisión.
- Clasificación de tickets y correos: asignación de prioridad o categoría con opciones descritas en lenguaje natural, sin necesidad de entrenar un clasificador específico por cada taxonomía.
- Evaluación de decisiones binarias en aplicaciones locales: cualquier flujo donde se requiera "sí/no" o "A/B/C" con una probabilidad calibrada y latencia baja en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que aún no incluye las puntuaciones medidas de la base sola en el panel general; cada adaptador publica sus propias métricas en su model card y en el catálogo de JeffHub.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 1,7 GB en fp16 (0,85 mil millones de parámetros); el repositorio completo ocupa 3,4 GB. En fp32 serían unos 3,4 GB; con cuantización a 8 bits, alrededor de 0,9 GB (estimación a partir del número de parámetros, no publicada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe en GPUs de consumo con 4 GB o más de VRAM; una RTX 4090 o A100/H100 no son necesarias para este modelo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM en fp16 (estimación).
- Opciones de despliegue: el autor documenta el SDK Python de Jeff (`jeff.Jeff.local`), el servidor y SDKs del repositorio `github.com/firelex/jeff`, y la descarga directa con `hf download`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeff-base v1.4 | 852.985.920 | No disponible | Clasificación/decisión calibrada | Apache-2.0 | HuggingFace (`mstrasser/jeff-base`) |
| Qwen3.5-0.8B (base) | ~0,8 mil millones | No disponible | Generación de texto | Apache-2.0 | HuggingFace (`Qwen/Qwen3.5-0.8B`) |
| Modelos generativos pequeños de la misma familia | No disponible | No disponible | Generación de texto | No disponible | No disponible |

La comparación directa con alternativas de clasificación zero-shot de propósito general no está disponible en la información proporcionada. La diferencia funcional clave frente a Qwen3.5-0.8B es que Jeff no genera texto: devuelve probabilidades sobre opciones, lo que cambia el perfil de latencia y de integración.

## Limitaciones y advertencias

- Debe usarse con un adaptador: la base sola rinde mal en listas de opciones largas o no familiares.
- No razona: el autor advierte que los modelos pequeños no hacen razonamiento multi-paso; ofrece elecciones rápidas y calibradas, no texto generado.
- Solo inglés y solo texto.
- No se documentan sesgos conocidos; al entrenarse con datos públicos y sintéticos, es probable que herede sesgos de esas fuentes (no cuantificado).
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento; la confianza devuelta debe validarse en el dominio de producción.
- Los datos de entrenamiento no se publican y algunas porciones provienen de fuentes con licencia solo no comercial, académica o de investigación; aunque los pesos son Apache-2.0, conviene revisar las implicaciones para uso comercial.
- Los adaptadores v1.4 solo cargan sobre esta revisión exacta de la base (verificación por SHA-256); mezclar revisiones provoca rechazo en el motor.
- La versión v1.3 está retirada; solo se publican v1.4 y sus adaptadores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mstrasser/jeff-base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Catálogo, resultados y documentación: https://jeffhub.ai
- Código, servidor y SDKs: https://github.com/firelex/jeff
- Guía de inicio rápido: https://jeffhub.ai/docs/guides/quickstart
- Guía para ejecutar Jeff localmente: https://jeffhub.ai/docs/guides/running
- Documentación general: https://jeffhub.ai/docs
- Catálogo de adaptadores: https://jeffhub.ai/catalogue
