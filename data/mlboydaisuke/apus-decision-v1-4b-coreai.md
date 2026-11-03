# mlboydaisuke/APUS-Decision-v1-4B-CoreAI

## Resumen

APUS-Decision-v1-4B-CoreAI es una exportación al runtime Core AI de Apple del modelo APUS-Decision-v1-4B, un modelo de decisión de 4.000 millones de parámetros derivado de Qwen3.5-4B mediante un fine-tune y posterior fusión de pesos en BF16 (checkpoint-5949). El autor, mlboydaisuke, publica el bundle en formato `.aimodel` para ejecución on-device en iOS 27 y macOS 27, con la ruta de texto de 32 capas cuantizada en int8 y una ventana de contexto limitada a 4.096 tokens.

El modelo no es un asistente conversacional al uso: funciona como clasificador de decisiones. Cada petición aporta un estado (por ejemplo, el estado de una página web), unas instrucciones y entre 2 y 16 criterios ordenados; el modelo devuelve una distribución de probabilidad sobre las etiquetas A–P calculada a partir de los logits del siguiente token. Está pensado para selección de acciones en navegador, enrutado de flujos de trabajo y juicios proposicionales, siguiendo el contrato `jev.dynamic.prompt.v2`.

Su relevancia actual radica en dos factores: por un lado, demuestra un patrón de despliegue de LLM en el Neural Engine y la GPU de Apple mediante Core AI, sucesor de Core ML, con exportación vía `coreai-torch`; por otro, propone un uso del modelo como cabecera de decisión de "sistema uno" (respuesta rápida, sin cadena de pensamiento) en lugar de generación libre de texto. La licencia Apache-2.0 y el tamaño contenido lo hacen apto para integración en aplicaciones locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B fine-tuneado), ruta de texto de 32 capas |
| Parametros totales | 4B (aproximado, derivado de Qwen3.5-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en este bundle (el autor rechaza más de 8.192 en el modelo fuente) |
| Tipos de cuantizacion | int8 (exportador `int8hu --head-sym`); pesos fuente en BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | `.aimodel` (bundle Core AI); fuente en safetensors BF16 |
| Tamano del repo | 5,8 GB |
| Modelo base | apus-ailab/APUS-Reflex-4B (relación: quantized); fuente real apus-ailab/APUS-OpenJev-v1-4B, revisión `65797c526c27c4d24f564333779162cd4a64328e` |
| Tokenizer | Qwen3.5; etiquetas A–P con ids 32–47 |
| Modo de pensamiento | desactivado (`enable_thinking=False`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only, y se somete a un fine-tune supervisado cuyo checkpoint-5949 se fusiona en pesos BF16. La exportación a Core AI reutiliza el exportador sin modificaciones del zoo para Qwen3.5-4B, aplicando cuantización int8 con cabeza simétrica (`--head-sym`) y recortando la ventana a 4.096 tokens. Se conserva la cabeza LM completa del vocabulario original, de modo que la decisión se obtiene leyendo los logits de los tokens correspondientes a las letras A–P (ids 32–47 en este tokenizer) en la última posición compilada del prompt.

El entrenamiento se orienta a un contrato de decisión estricto: el prompt se compila como un único mensaje de usuario con la plantilla de chat de origen, `add_generation_prompt=True`, `enable_thinking=False` y `add_special_tokens=False`; el slot de respuesta es el último token compilado. La respuesta se calcula como `softmax(logits[label_ids])` con temperatura 1 sobre los logits en float32. El autor reporta 160/160 de acuerdo de decisión antes y después de la fusión BF16, aunque la puerta de delta de probabilidad ≤0,05 no se cumplió: el máximo |Δp| fue 0,061457 a 32 capas y 0,092269 a 16 capas. No se detalla la composición del dataset de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de decisiones entre 2 y 16 criterios ordenados, devolviendo una distribución de probabilidad sobre etiquetas A–P.
- Tres primitivas de decisión: `choice` (selección de una opción), `noul` (juicio sin utilidad explícita) y `score_level` (puntuación por nivel).
- Selección de la siguiente acción en navegador a partir de un estado serializado en JSON (campo de búsqueda, controles visibles, estado de carga, historial).
- Enrutado de flujos de trabajo: elección del siguiente paso en un pipeline a partir de instrucciones y criterios.
- Juicios proposicionales sobre afirmaciones (estilo BoolQ, MNLI y decisiones de atributos).
- Procesamiento de estados e instrucciones en inglés y chino.
- Ejecución on-device en GPU o Neural Engine mediante Core AI, sin cadena de pensamiento.
- No soporta tool calling ni function calling en el sentido habitual: la interfaz es el contrato de decisión, no una API de herramientas.
- No soporta visión ni audio: el autor rechaza placeholders multimodales.

## Casos de uso

- Automatización de navegador: dado el estado de la página (controles visibles, campo de búsqueda vacío, banner informativo) y el objetivo, el modelo elige entre acciones como rellenar el campo, pulsar Search, abrir el primer resultado o esperar a que termine la carga. Es adecuado porque el prompt de ejemplo del autor cubre exactamente este escenario con 16 criterios.
- Enrutado de tickets de soporte: cada ticket se serializa como estado y las colas o equipos como criterios; el modelo devuelve la distribución sobre la cola correcta, lo que permite umbralizar y derivar a revisión humana cuando la probabilidad máxima es baja.
- Clasificación de intenciones en asistentes de voz o chat: con instrucciones y un conjunto cerrado de intenciones (2–16), se obtiene una distribución calibrada que sustituye a un clasificador entrenado aparte.
- Verificación de formularios: decidir si un formulario está listo para enviarse, si falta un campo obligatorio o si conviene guardarlo como borrador, usando la primitiva `choice` sobre criterios mutuamente excluyentes.
- Control de agentes locales en macOS/iOS: integrado como cabecera de decisión de bajo coste en una app nativa, aprovechando la ejecución en Neural Engine y la ventana de 4.096 tokens para estados de página y criterios.
- Evaluación de afirmaciones en pipelines de datos: juicios tipo BoolQ/MNLI sobre pares de texto para filtrar o etiquetar contenido antes de un procesamiento más costoso.
- Enrutado de consultas en sistemas RAG: decidir entre recuperar, responder directamente o pedir aclaración, con la distribución de probabilidad como señal de confianza.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Notas |
|---|---|---|
| Frozen80 development panel (profundidad completa, 32 capas) | 66/80 (82,50 %) | Medición del autor, no re-medida |
| Evaluacion fusionada (16 capas) | 61/80 | Medición del autor |
| Acuerdo de decisión antes/después de fusión BF16 | 160/160 | Medición del autor |
| Max |Δp| a 32 capas | 0,061457 | Puerta ≤0,05 no superada |
| Max |Δp| a 16 capas | 0,092269 | Puerta ≤0,05 no superada |

El panel Frozen80 cubre decisiones de Browser, HelpSteer3, BoolQ, MNLI y atributos. Es un panel de ingeniería reutilizado, no un benchmark ciego ni una tasa de éxito real de navegación. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de LLM en la información disponible.

## Requisitos de hardware

- Ejecución prevista en dispositivos Apple con Core AI (iOS 27 / macOS 27), en GPU o Neural Engine; el bundle `.aimodel` no está pensado para CUDA.
- Tamaño del repo de 5,8 GB, coherente con pesos int8 de un modelo de 4B más metadatos; la VRAM/unified memory necesaria para inferencia ronda esa cifra, aunque no se especifica oficialmente.
- Cabe en equipos Apple Silicon con memoria unificada de 8 GB o superior; el autor cita como referencia Qwen3-8B 4-bit a 94 tok/s en GPU M4 Max, pero no publica throughput para este modelo.
- Despliegue mediante `coreai-torch` (`coreai.llm.export`) y el runtime Core AI; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este bundle.
- Para la fuente BF16 (apus-ailab/APUS-OpenJev-v1-4B) se necesitaría hardware convencional con suficiente VRAM para 4B en BF16 (aproximadamente 8 GB), aunque no se detalla en la información disponible.
- Latencia y throughput de este modelo concreto: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APUS-Decision-v1-4B-CoreAI | 4B | 4.096 (bundle) | Decisión A–P sobre criterios, on-device Core AI | Apache-2.0 | HuggingFace, 14 descargas |
| APUS-OpenJev-v1-4B (fuente) | 4B | hasta 8.192 | Mismo contrato de decisión, pesos BF16 | Apache-2.0 | HuggingFace |
| Qwen3.5-4B (base) | 4B | no disponible | LLM generativo generalista | no disponible | HuggingFace |
| Qwen3-8B 4-bit en Core AI | 8B | no disponible | LLM generativo on-device | no disponible | Referencia citada por el autor |

La comparación con alternativas de la misma categoría (modelos de decisión especializados) no está disponible en la información proporcionada. Frente al Qwen3.5-4B base, la diferencia principal es la especialización en el contrato de decisión y la cuantización int8 para Core AI, no una mejora de capacidades generativas.

## Limitaciones y advertencias

- El modelo no genera texto libre de forma fiable: está entrenado para responder con una letra A–P en el slot compilado; usarlo como chat produciría salidas degeneradas.
- El contrato de prompt es estricto: serialización JSON con `sort_keys=True`, `ensure_ascii=False`, un único mensaje de usuario, `enable_thinking=False` y `add_special_tokens=False`. Cualquier desviación invalida la lectura de logits.
- Ventana efectiva de 4.096 tokens en este bundle, inferior a los 8.192 que acepta el modelo fuente; estados largos deben truncarse o resumirse.
- Solo inglés y chino; no hay soporte declarado de castellano.
- Riesgo de alucinación en los juicios proposicionales: el modelo puede asignar alta probabilidad a criterios incorrectos si el estado es ambiguo o incompleto.
- Los resultados de 82,50 % y 61/80 proceden de un panel de ingeniería del propio autor, no de un benchmark ciego; no deben interpretarse como tasa de éxito en navegación real.
- La puerta de estabilidad numérica tras la fusión BF16 no se superó (|Δp| de hasta 0,092269), lo que indica posibles variaciones de calibración entre la fuente y el bundle exportado.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B y el modelo intermedio APUS-Reflex-4B deberían verificarse por separado antes de producción.
- Dependencia del ecosistema Apple: sin Core AI (iOS 27 / macOS 27) el bundle `.aimodel` no es portable a otras plataformas.
- No soporta tool calling, agentes multi-paso ni multimodalidad; la orquestación debe implementarse fuera del modelo.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mlboydaisuke/APUS-Decision-v1-4B-CoreAI
- Modelo fuente (OpenJev): https://huggingface.co/apus-ailab/APUS-OpenJev-v1-4B/tree/65797c526c27c4d24f564333779162cd4a64328e
- Evaluación fusionada del autor: https://huggingface.co/apus-ailab/APUS-OpenJev-v1-4B/blob/65797c526c27c4d24f564333779162cd4a64328e/merged-evaluation.json
- README del modelo fuente: https://huggingface.co/apus-ailab/APUS-OpenJev-v1-4B/blob/65797c526c27c4d24f564333779162cd4a64328e/README.md
- Benchmark Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench
- Modelo base declarado: https://huggingface.co/apus-ailab/APUS-Reflex-4B
- Modelo Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
