# kealjones/squiggle-small

## Resumen

Squiggle-small es un fine-tune experimental de LiquidAI/LFM2.5-350M creado por el desarrollador kealjones, entrenado específicamente para el "phone harness" de Squiggle, un formato de modelo pequeño orientado a la ejecución de agentes con tool calling en dispositivos móviles. El modelo se centra en una tarea muy concreta: decidir cuándo llamar a herramientas (búsquedas web, cálculos con JavaScript, memoria, recetas) y cuándo responder con chat plano, emitiendo llamadas a herramientas bien formadas en un formato de bloque `tool_call`.

El modelo base, LFM2.5-350M de LiquidAI, es un modelo híbrido compacto de unos 354 millones de parámetros, lo que lo hace idóneo para inferencia en CPU de móvil. El autor publica dos cuantizaciones GGUF (Q8_0 y Q4_0) pensadas para ejecutarse con llama.cpp y wllama directamente en el navegador Chromium, sin necesidad de GPU.

Su relevancia actual es más de investigación que de producción: el propio autor publica un veredicto explícito de "NO-GO (not yet)", con una puntuación estricta media del 36% en tipos de tarea entrenados (por debajo del umbral del 50%) y un 0% en tipos retenidos (held-out). Aun así, la ficha es un ejemplo valioso y transparente de evaluación rigurosa de modelos pequeños para agentes, con métricas de hábitos, longitud de salida y comparativas contra Gemma 3 270M y FunctionGemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (base LFM2.5 de LiquidAI, arquitectura LFM) |
| Parametros totales | 354.483.968 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 4096 tokens (recomendado por el autor con wllama, n_ctx 4096) |
| Tipos de cuantizacion | Q8_0 (379 MB), Q4_0 (219 MB) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other, heredada del modelo base) |
| Formato de pesos | GGUF (tambien etiquetado safetensors en el repo) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, un modelo de la familia LFM (Liquid Foundation Models) que combina bloques convolucionales tipo gated linear con atención estándar en una arquitectura híbrida eficiente para CPU. El fine-tune se realizó para el "phone harness" de Squiggle (documentado en docs/harness.md, formato small-model), que entrena al modelo para emitir llamadas a herramientas dentro de bloques ` ```tool_call ` con JSON estructurado (nombre y argumentos), y para mantener conversación plana cuando no se necesita herramienta.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. Los detalles del harness indican que el modelo se evalúa en episodios multi-paso con herramientas como búsqueda web, ejecución de JavaScript (run_js), memoria de repositorio y recetas de planificación.

## Capacidades

- Emision de llamadas a herramientas bien formadas: 98,7% de las llamadas son sintácticamente correctas (formato `tool_call` con JSON).
- Chat plano: mantiene conversación normal sin invocar herramientas en el 96% de los casos de chat.
- Planificacion multi-paso: planifica peticiones multi-paso en el 51% de los casos.
- Peticion de informacion faltante: pregunta al usuario cuando falta dato necesario en el 30% de los episodios "need".
- Uso de memoria de repositorio: 100% estricto en la tarea memory_repo (usar memoria en lugar de preguntar).
- Lectura de enlaces: 83% estricto en bare_link.
- Comparaciones web: 25% estricto en web_compare (planificar y buscar dos elementos).
- Calculo con run_js: rendimiento bajo (6% estricto en math).
- Generalizacion a tareas nuevas: 0% en los tres tipos held-out (need_math, recipe_compare, web_bridge); no generaliza a hábitos no vistos.
- No se ha publicado soporte de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Agentes con herramientas en movil: el modelo está diseñado para el harness de Squiggle en CPU de teléfono, con ~91 tokens por llamada y ~6 segundos por llamada a 15 tokens/s, adecuado para prototipos de agentes locales.
- Inferencia en navegador con wllama: los GGUF cargan en wllama 3.8.1 dentro de Chromium (carga en ~3 segundos), útil para demos de agentes sin backend.
- Orquestacion de busquedas web: puede emitir llamadas `find` con consultas para buscar información, con llamadas bien formadas en el 98,7% de los casos.
- Consulta de repositorios y memoria: tareas como repo_fact (50% estricto) y memory_repo (100%) lo hacen viable para asistentes que consultan documentación de proyectos.
- Chatbot ligero con fallback a herramientas: mantiene chat plano en el 96% de los casos, útil para asistentes conversacionales que ocasionalmente necesitan herramientas.
- Investigacion en destilacion de agentes: su model card publica métricas detalladas por tipo de tarea, útil como línea base para comparar fine-tunes de modelos pequeños para tool calling.
- No recomendado para produccion: el propio autor lo marca como experimental v1, no apto para producción.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (293 episodios evaluados por modelo, puntuación estricta):

| Measure | untouched-gemma3 | gemma3 | lfm25 (squiggle-small) | functiongemma |
|---|---|---|---|---|
| Trained types, strict mean | 0% | 10% | 36% | 21% |
| Trained types, right answer | 5% | 17% | 43% | 29% |
| Held-out types, strict mean | 0% | 0% | 0% | 0% |
| Well-formed calls | 0% | 91% | 99% | 95% |
| Episodios en bucle / con tope de llamadas | 1% | 6% | 4% | 3% |
| Planifica peticiones multi-paso | 0% | 16% | 51% | 34% |
| Pregunta cuando falta informacion | 0% | 15% | 30% | 4% |
| Chat plano se mantiene plano | 96% | 38% | 96% | 71% |
| Tokens por llamada | 52 | 121 | 91 | 105 |
| Segundos por llamada (CPU movil, ~15 tok/s) | 3 | 8 | 6 | 7 |

Puntuación estricta por tipo de tarea (selección):

| Tipo | lfm25 (squiggle-small) |
|---|---|
| memory_repo | 100% |
| bare_link | 83% |
| chat | 81% |
| recipe_repo | 67% |
| need_repo | 50% |
| repo_fact | 50% |
| web_compare | 25% |
| hermes_compute | 33% |
| math | 6% |
| web_fact | 0% |
| Held-out (need_math, recipe_compare, web_bridge) | 0% |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no requiere GPU; los GGUF ocupan 379 MB (Q8_0) y 219 MB (Q4_0) más ~0,54 MiB de buffer de cómputo CPU, ejecutables en la RAM de un teléfono o portátil.
- GPU recomendadas: no necesarias; el modelo está orientado a CPU. Para desarrollo rápido en servidor, cualquier GPU moderna lo ejecuta sin problema.
- Consumer GPU: cabe sobradamente en cualquier GPU consumer (incluso integradas), pero el caso de uso principal es CPU móvil.
- Despliegue: llama.cpp (master, verificado por el autor), wllama 3.8.1 en Chromium (verificado), y por extensión Ollama o cualquier runtime GGUF compatible con LFM2.5. No consta verificación con vLLM ni TGI.
- Latencia: en CPU de teléfono a ~15 tokens/s, unas 6 segundos por llamada de agente (91 tokens de media). Carga en wllama en ~3 segundos. En llama.cpp en escritorio, el autor reporta 33 tokens generados en 418 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Trained types (strict) | Well-formed calls | Licencia |
|---|---|---|---|---|---|
| squiggle-small (lfm25) | 354 M | 4096 | 36% | 99% | lfm1.0 (other) |
| gemma3 (fine-tune Squiggle, 270M) | 270 M | no disponible | 10% | 91% | no disponible |
| functiongemma | no disponible | no disponible | 21% | 95% | no disponible |
| untouched-gemma3 270M | 270 M | no disponible | 0% | 0% | no disponible |

Squiggle-small supera a los fine-tunes comparables de Gemma 3 270M en precisión estricta y en calidad de llamadas, aunque functiongemma presenta menos episodios en bucle (3% frente a 4%) y gemma3 genera menos tokens por llamada en el caso del modelo base sin ajustar.

## Limitaciones y advertencias

- Veredicto del autor: NO-GO (not yet); el modelo no alcanza los umbrales de calidad del harness (36% frente al 50% exigido en tipos entrenados).
- Cero generalizacion: 0% estricto en los tres tipos de tarea held-out; el modelo no transfiere hábitos a tareas nuevas.
- Debilidad en calculo: solo 6% estricto en math (cálculo con run_js) y 0% en web_fact.
- Riesgo de alucinacion: como modelo de 350M sin ajuste por preferencias, puede alucinar hechos; las muestras del modelo base sin ajustar muestran respuestas inventadas con confianza.
- Contexto limitado: 4096 tokens, insuficiente para conversaciones largas o documentos extensos.
- Licencia lfm1.0: licencia "other" heredada de LiquidAI; revisar los términos del enlace de licencia antes de uso comercial, no se garantiza permisividad total.
- Experimental: version v1, sin garantias; no usar en produccion.
- Sesgos: no se ha publicado evaluacion de sesgos.
- Idiomas: no documentados; el harness y las pruebas sugieren que está orientado a ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kealjones/squiggle-small
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE
- Harness de Squiggle (referenciado en la model card): docs/harness.md del proyecto Squiggle (enlace externo no disponible)
