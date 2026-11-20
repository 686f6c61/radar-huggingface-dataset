# PugarHuda/takar-outcome-evaluator

## Resumen

Takar Outcome Evaluator es un adaptador LoRA de tipo reward model desarrollado por PugarHuda para la red Telegraph, orientado a la familia de tareas `EVENT_OUTCOME_RESOLUTION`. Se construye sobre el modelo base compartido `modernbert-base-lora16-v1`, que a su vez parte de answerdotai/ModernBERT-base, un encoder transformer de aproximadamente 150 millones de parametros. El adaptador anade un cabezal de recompensa de un unico logit y se distribuye en el formato de delta safetensors `lora-v1` propio de Telegraph.

El modelo resuelve un problema concreto de los mercados de prediccion descentralizados: puntuar si la respuesta de un minero resuelve realmente el evento planteado. Segun la model card, el juicio por defecto de la red no detectaba respuestas completamente fuera de tema, y este evaluador las penaliza con puntuaciones muy negativas frente a respuestas on-topic a la misma pregunta.

Es relevante ahora porque forma parte de la infraestructura de validacion de Telegraph y se publica como adaptador reproducible con hash keccak256 registrado, dataset de pares y ejecucion de entrenamiento verificable. No obstante, su utilidad esta ligada al ecosistema Telegraph: la puntuacion requiere el foundation y el motor WASM de la red para que los validadores comparen resultados bit a bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA rank-8 sobre encoder transformer ModernBERT-base, con cabezal de recompensa de un logit |
| Parametros totales | no disponible (adaptador de 6.776.916 bytes; base ModernBERT-base de ~150M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (entrada truncada a este limite) |
| Tipos de cuantizacion | no disponible (formato delta safetensors; foundation en fp32/ONNX) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (delta `lora-v1` de Telegraph) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA con rango 8 y un cabezal de recompensa de un unico logit, montado sobre el foundation model `modernbert-base-lora16-v1` (ModernBERT-base). La entrada se formatea como `"### Task:\n" + question + "\n\n### Answer:\n" + answer`, se tokeniza con el tokenizador del nodo y se trunca a 512 tokens. La salida es un logit de recompensa donde valores mas altos indican mejor resolucion del evento. La clase de tarea es hibrida: la respuesta evaluada es el cuerpo completo de la respuesta del minero.

El entrenamiento utiliza pares construidos a partir de mercados reales de Manifold (3.697 resueltos y 1.865 abiertos) y 4.000 payloads fuera de tema reales del feed de la red. Se definen cinco tipos de fallo: topic (respuesta a otro evento), consistent (resultado que contradice su propia evidencia), premature (respuesta confiada a un mercado abierto), settled (elusion de un mercado cerrado) y junk (payload mal enrutado). Se excluyen deliberadamente los simples intercambios YES-versus-NO porque, segun el autor, un encoder de 150M no puede saber quien gano. El split es de 4.454 pares de entrenamiento, 542 de validacion y 537 de test, dividido por mercado. El dataset paso el gate de Telegraph kit, con una sonda bag-of-words del 62,2% y un atajo de longitud del 50,2%.

## Capacidades

- Puntuacion de resolucion de eventos: asigna un logit de recompensa a un par pregunta-respuesta indicando si la respuesta resuelve el evento planteado.
- Deteccion de respuestas fuera de tema: penaliza respuestas que no guardan relacion con la pregunta, con puntuaciones muy negativas.
- Deteccion de respuestas inconsistentes: identifica resultados que contradicen su propia evidencia.
- Deteccion de respuestas prematuras: penaliza respuestas confiadas a mercados aun abiertos.
- Deteccion de elusion en mercados cerrados: detecta respuestas que esquivan un mercado ya resuelto.
- Deteccion de payloads mal enrutados: identifica junk que no corresponde a la tarea.
- Integracion con el motor WASM de Telegraph para validacion determinista entre validadores.
- No soporta generacion de texto, tool calling, agentes ni vision; es exclusivamente un evaluador de recompensa.

## Casos de uso

- Validacion de mineros en mercados de prediccion: el evaluador puntua la respuesta de cada minero frente a la pregunta del evento y permite ordenar o filtrar respuestas de baja calidad antes de la resolucion final.
- Deteccion de spam y payloads mal enrutados: al puntuar con valores muy negativos respuestas como listas de goles de la Bundesliga ante preguntas sobre estudios clinicos, se puede descartar trafico irrelevante en el feed.
- Control de calidad en mercados abiertos: penaliza respuestas prematuras y confiadas sobre eventos aun no resueltos, evitando que se acepten resoluciones anticipadas.
- Auditoria de resoluciones en mercados cerrados: detecta respuestas que eluden un mercado ya resuelto y ayuda a marcar casos que requieren revision humana.
- Investigacion sobre reward models para dominios de resolucion de eventos: sirve como referencia reproducible de un adaptador LoRA rank-8 con dataset y ejecucion publicos.
- Evaluacion comparativa de respuestas en pipelines de datos: puede integrarse en un flujo que compare la respuesta de un minero con una respuesta on-topic de referencia para la misma pregunta.
- Reproduccion de la validacion de la red Telegraph: permite a validadores ejecutar el adaptador con el foundation y el motor WASM oficiales y comparar puntuaciones bit a bit.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision pairwise en test | 99,81% |
| Baseline de longitud en test | 50,8% |
| Motor real, 40 pares reservados | 40 / 40 |
| Sonda bag-of-words (gate del dataset) | 62,2% |
| Atajo de longitud (gate del dataset) | 50,2% |

El propio autor advierte que los pares de test provienen del mismo generador que los de entrenamiento, por lo que el 99,81% mide las cinco modalidades de fallo definidas y no predice el rendimiento sobre los pares ocultos de la red. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el adaptador pesa 6,78 MB y el foundation ModernBERT-base es de ~150M de parametros, por lo que la huella es reducida.
- GPU recomendadas: no disponibles de forma explicita; cualquier GPU capaz de ejecutar el foundation en ONNX fp32 o el motor WASM de Telegraph.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del encoder base, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: el autor indica que la puntuacion requiere el foundation (`foundation_lora_fp32.onnx`) y el motor (`foundation_engine.wasm`) de Telegraph, ejecutables con `go run ./cmd/adapterexec` desde el repositorio `telegraph-wasm-baseline`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Takar Outcome Evaluator | Adaptador LoRA sobre ~150M | 512 tokens | Reward model de resolucion de eventos | MIT | Hugging Face y GitHub |
| answerdotai/ModernBERT-base | ~150M | 8.192 tokens (modelo base) | Encoder transformer | Apache 2.0 | Hugging Face |
| Alternativas de reward model genericas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros reward models en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo emite un logit de recompensa y no puede usarse como modelo conversacional.
- La precision del 99,81% se mide sobre pares del mismo generador que el entrenamiento; no garantiza el rendimiento sobre los pares ocultos de la red.
- Excluye deliberadamente los intercambios YES-versus-NO, por lo que no determina quien gano un evento, solo si la respuesta es pertinente y coherente.
- La puntuacion valida requiere el foundation y el motor WASM de Telegraph; sin ellos no se garantiza la comparacion bit a bit entre validadores.
- Ventana de contexto limitada a 512 tokens: preguntas o respuestas mas largas se truncan.
- Idiomas soportados no disponibles; el entrenamiento se basa en el feed de Telegraph y mercados de Manifold, mayoritariamente en ingles.
- Riesgo de sesgo hacia los cinco modos de fallo definidos; respuestas incorrectas pero bien formadas y on-topic podrian recibir puntuaciones altas.
- Licencia MIT, sin restricciones conocidas para uso comercial, aunque la dependencia del ecosistema Telegraph condiciona su aplicacion practica.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; modelo muy reciente y sin validacion independiente publica.

## Enlaces

- Hugging Face: https://huggingface.co/PugarHuda/takar-outcome-evaluator
- Repositorio del autor (codigo, datos y entrenamiento): https://github.com/PugarHuda/takar/tree/main/evaluator
- Baseline WASM de Telegraph: https://github.com/telegraphprotocol/telegraph-wasm-baseline
- Release del foundation `modernbert-base-lora16-v1`: https://github.com/telegraphprotocol/telegraph-foundation/releases/tag/modernbert-base-lora16-v1
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
