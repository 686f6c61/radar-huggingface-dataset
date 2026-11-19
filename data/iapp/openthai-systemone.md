# iapp/OpenThai-SystemOne

## Resumen
OpenThai-SystemOne es un modelo de decisión de 0,75B parámetros desarrollado por iApp (en el marco del proyecto OpenThai, antes OpenThaiGPT) y publicado con la colaboración de AIEAT. No es un modelo generativo: dado un estado (texto libre o JSON) y una serie de preguntas tipadas, devuelve distribuciones de probabilidad calibradas sobre opciones en una única pasada forward. Resuelve tres tipos de tareas: elección entre hasta 255 opciones (`choice`), puntuación sobre 2-10 niveles ordenados (`score`) y probabilidad de "sí" para una pregunta binaria (`noul`).

La arquitectura parte del text tower de Qwen/Qwen3.5-0.8B-Base (24 capas, atención híbrida Gated-DeltaNet, contexto de 262k tokens), al que se elimina el codificador de visión y se sustituye la cabeza LM de 248k tokens por una cabeza de 256 slots. El modelo está especializado en tailandés e inglés y entrenado con ~5B tokens de continued pretraining en tailandés y 2-3M ejemplos de decisión.

Su relevancia actual radica en el nicho de "System One" (decisión rápida, estilo System 1 de Kahneman): clasificación y enrutamiento con probabilidades calibradas, verificación de salidas de LLM, selección de acciones en agentes de computer-use y enrutamiento de tickets, con un contrato HTTP compatible con `POST /v1/systemone`. Corre en CPU y GPU de consumo, con builds Ollama y GGUF, y licencia Apache-2.0.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (text tower de Qwen/Qwen3.5-0.8B-Base), 24 capas, atención híbrida Gated-DeltaNet / attention, sin vision encoder; cabeza de 256 slots en lugar de LM head |
| Parametros totales | 752.674.883 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (según model card del backbone) |
| Tipos de cuantizacion | bf16, Q8_0, Q4_K_M (builds Ollama/GGUF) |
| Idiomas soportados | th, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (iapp/OpenThai-SystemOne-Ollama) |

## Arquitectura y entrenamiento
El modelo reutiliza el text tower de Qwen3.5-0.8B-Base (24 capas, mecanismo híbrido entre Gated-DeltaNet y atención clásica, ventana de 262k tokens), descarta el codificador de visión y aplica continued pretraining sobre ~5B tokens de tailandés (web, Wikipedia, corpus paralelos th↔en y texto de estado máquina como accessibility trees y JSON). La cabeza LM original de 248k tokens se reemplaza por una cabeza de 256 slots: las opciones se introducen con tokens de control `<|ts_opt_0|>` … `<|ts_opt_254|>`, el hidden state en `<|ts_answer|>` se proyecta a 256 logits, los slots sobrantes se enmascaran y un softmax produce la distribución. El slot 255 representa "abstención" (ninguna opción encaja).

El entrenamiento de decisión usa ~2-3M ejemplos convertidos de datasets públicos de clasificación, NLI, QA, rating, agentes y selección de herramientas en tailandés e inglés, más tareas sintéticas, con barajado del orden de opciones y ejemplos de abstención. Después se aplica una fase corta de calibración con pérdida Brier y temperatura por tipo de pregunta, de modo que mayor confianza se corresponda con mayor precisión. El request/response replica el contrato de TypeSafe `POST /v1/systemone`; la build Ollama no ejecuta la cabeza de 256 slots, sino que formula cada pregunta como prompt de chat y lee las probabilidades de las letras A-Z (v0.3 ajustada al prompt de Ollama).

## Capacidades
- Clasificación zero-shot con elección entre hasta 255 opciones, devolviendo `choice`, `probabilities` y `confidence`.
- Puntuación ordinal sobre 2-10 niveles descriptivos, con `score` ponderado por probabilidad y fractional.
- Preguntas binarias sí/no con probabilidad calibrada (`noul` = p(yes)).
- Abstención explícita (slot 255) cuando ninguna opción encaja.
- Procesamiento de estado arbitrario: texto libre o JSON, incluidos estados de máquina (accessibility trees).
- Bilingüe tailandés-inglés, tanto en instrucciones como en opciones y estados.
- Selección de acciones para agentes de computer-use y browser-agents (qué elemento pulsar, qué herramienta invocar).
- Verificación de salidas de LLM y juicio de relevancia para RAG.
- No genera texto libre: exclusivamente salidas estructuradas de decisión.
- Servidor HTTP compatible con el contrato TypeSafe `POST /v1/systemone`; integración con `transformers` mediante `trust_remote_code`.

## Casos de uso
- Enrutamiento de tickets de soporte: con `Choice` sobre departamentos (billing, technical, sales) y estado en JSON, el modelo devuelve la distribución de probabilidad en una pasada, apto para colas de atención con volumen alto y necesidad de confianza auditable.
- Moderación de contenido: usar `Score` sobre niveles ordenados (por ejemplo, seguro / límite / prohibido) para obtener una puntuación ponderada en lugar de una etiqueta dura, facilitando umbrales configurables.
- Detección de intención en asistentes conversacionales: `Choice` con las intenciones del dominio y `Noul` para flags binarios (por ejemplo, "¿el usuario pide cancelación?"), con contexto de hasta 262k tokens para historiales largos.
- Juicio de relevancia en RAG: `Noul` sobre pares consulta-pasaje para filtrar documentos antes de pasarlos al LLM generador, reduciendo coste de contexto y alucinaciones.
- Verificación de salidas de LLM: comprobar si una respuesta cumple criterios (`Noul`) o clasificar su calidad (`Score`), como paso de validación en pipelines de generación.
- Selección de acciones en computer-use / browser-agents: dado un accessibility tree como estado, `Choice` sobre elementos o herramientas disponibles para decidir el siguiente clic o la siguiente llamada de herramienta.
- Extracción de señales de cliente en atención: `Score` de frustración y `Noul` de petición de reembolso sobre el texto del ticket, como en el ejemplo de la model card (probabilidades ~0,95 para billing y ~0,98 para reembolso solicitado en Q8_0).
- Despliegue local sin API externa: build Ollama (`iapp/openthai-systemone`) que sirve `POST /v1/systemone` en localhost, útil para entornos con restricciones de privacidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: ~1,5 GB en bf16 (0,75B parámetros), ~0,8 GB en Q8_0 y ~0,5 GB en Q4_K_M, más overhead de contexto.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU.
- GPU recomendadas para producción de alto throughput: A100, H100 o L40S con vLLM/TGI (si bien la cabeza custom puede requerir `trust_remote_code` o el servidor propio).
- Opciones de despliegue: `openthai_systemone` (cliente + servidor uvicorn con contrato TypeSafe), `transformers` con `trust_remote_code=True`, Ollama ≥ 0.35 (`ollama pull iapp/openthai-systemone`, tags `0.8b` = q8_0, `0.8b-q4_K_M`, `0.8b-bf16`), GGUF en Hugging Face (`iapp/OpenThai-SystemOne-Ollama`).
- Latencia y throughput: no disponible; al ser una única pasada forward sobre 0,75B parámetros, se espera latencia de decenas de milisegundos en GPU y de cientos en CPU, pero no hay cifras publicadas.
- El repo principal ocupa 4,6 GB (incluye pesos en safetensors y código remoto).

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-SystemOne | 0,75B | 262k | Decisión zero-shot tipada (choice/score/noul) | Apache-2.0 | HF, Ollama, GGUF |
| Qwen3.5-0.8B-Base (backbone) | 0,8B | 262k | Generación de texto | no disponible en la información | HF |
| Modelos de clasificación zero-shot tipo NLI (p. ej., DeBERTa/BGE) | ~0,1-0,5B | 512-8k típicamente | Clasificación NLI | variable | HF |
| TypeSafe System One (servicio propietario) | no disponible | no disponible | Decisión con contrato `/v1/systemone` | propietaria | API |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias
- No genera texto libre; cualquier expectativa de uso generativo es un error de diseño.
- La build Ollama no usa la cabeza de 256 slots: formula prompts de chat y lee probabilidades de letras A-Z, por lo que el comportamiento puede diferir del repo principal (v0.3 ajustada al prompt de Ollama).
- La calibración se entrena con Brier loss y temperatura por tipo, pero no hay benchmarks publicados que verifiquen la fiabilidad de `confidence` en dominios fuera del entrenamiento.
- Idiomas limitados a tailandés e inglés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación de probabilidades en estados de máquina (accessibility trees, JSON) si el formato difiere del visto en entrenamiento.
- Sesgos potenciales heredados de los datasets públicos de clasificación, NLI y QA usados para construir los ejemplos de decisión, no auditados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar la procedencia de los datasets de entrenamiento y las condiciones del backbone Qwen3.5.
- El servidor HTTP y la cabeza custom requieren `trust_remote_code` o el paquete `openthai_systemone`; no es un modelo estándar de `AutoModelForSequenceClassification`.
- El contrato replica el de TypeSafe, pero no hay garantía de compatibilidad futura con esa API.

## Enlaces
- Hugging Face: https://huggingface.co/iapp/OpenThai-SystemOne
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Build Ollama (ollama.com): https://ollama.com/iapp/openthai-systemone
- GGUF en Hugging Face: https://huggingface.co/iapp/OpenThai-SystemOne-Ollama
- Repositorio del paquete: https://github.com/iapp-technology/openthai-systemone
- Proyecto OpenThai (antes OpenThaiGPT): no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
