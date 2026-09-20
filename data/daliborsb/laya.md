# daliborsb/laya

## Resumen

Laya es un modelo de decisión no autorregresivo, de tipo "System 1", desarrollado por el autor daliborsb (la model card referencia la organización convaiinnovations) y publicado en HuggingFace. No genera texto: recibe un estado (correo, ticket, texto libre o JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades calibradas en una única pasada forward. Resuelve el problema de clasificación, enrutado, puntuación y guardrails en pipelines de producción, donde la generación autoregresiva introduce latencia y riesgo de alucinación.

La arquitectura parte de un backbone ModernBERT-large (395M, bidireccional, afinado por completo) al que se añade una cabeza de decisión entrenada desde cero, compuesta por 2 capas transformer, un scorer de marcadores de opción y una cabeza de actuar/escalar, sumando 421.293.830 parámetros totales. La innovación principal es el uso de marcadores de opción: cada opción posible se puntúa en su propio token `[MASK]` y luego se aplica softmax sobre las opciones de esa pregunta, de modo que el espacio de respuestas se define en tiempo de petición y no requiere reentrenamiento para nuevos esquemas.

El modelo se entrena con RLCD (Reinforcement Learning for Calibrated Decisions), un esquema de refuerzo con reglas de puntuación estrictamente propias, de forma que la única manera de maximizar la recompensa es reportar probabilidades honestas. Es relevante ahora porque ofrece decisiones calibradas en una sola pasada (del orden de 33-39 ms medidos) y soporta más de 100 idiomas en su checkpoint multilingüe, lo que lo hace adecuado para enrutado y moderación de bajo coste frente a alternativas generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large bidireccional (395M) + cabeza de decision no autorregresiva (2 capas transformer, scorer de marcadores de opcion, cabeza act/escalate) |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por pregunta en el checkpoint principal ingles; 1024 tokens en `laya-multilingual` y `laya-typed-decisions` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles en el checkpoint principal; mas de 100 idiomas en `laya-multilingual` (base mmBERT) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un encoder ModernBERT-large completamente afinado con una cabeza de decisión entrenada desde cero. Cada opción de una pregunta se puntúa en su propio token `[MASK]` y posteriormente se aplica una softmax sobre las opciones de esa pregunta, lo que permite definir el espacio de respuestas en tiempo de inferencia. El presupuesto es de 512 tokens por pregunta (pregunta + opciones + estado) y todas las preguntas de una misma llamada se responden en una única pasada forward. Los tres tipos de pregunta soportados son `choice` (opción seleccionada, probabilidad por opción, confianza), `score` (nivel esperado en una rúbrica ordinal, distribución, confianza) y `noul` (probabilidad calibrada P(verdadero)).

El entrenamiento utiliza RLCD (Reinforcement Learning for Calibrated Decisions). La política reporta una distribución; la exploración añade ruido gaussiano de media cero a los logits; la recompensa es una regla de puntuación estrictamente propia (log + esférica, más ranked probability score para preguntas ordinales), de forma que la recompensa esperada solo se maximiza reportando probabilidades honestas. Las actualizaciones usan REINFORCE con baseline de media de grupo (estilo GRPO). Las conversaciones multi-turno usan TD(λ=1.0) sobre slices de prefijo. Se realizaron 7.313 actualizaciones, 1 epoch, aproximadamente 1,96 horas, con temperaturas ajustadas `[1.637, 1.251, 1.983]` y escalado por número de opciones.

## Capacidades

- Clasificación y enrutado: asignación de una entrada a una categoría definida en tiempo de petición mediante preguntas de tipo `choice`.
- Puntuación ordinal: estimación de un nivel dentro de una rúbrica ordenada mediante preguntas de tipo `score`.
- Detección binaria calibrada: probabilidad de que una condición sea verdadera mediante preguntas de tipo `noul`.
- Calibración probabilística: devuelve distribuciones y confianza, no etiquetas secas, gracias al entrenamiento con reglas de puntuación propias.
- Multilingüismo: el checkpoint `laya-multilingual` (mmBERT-base, 322M) cubre más de 100 idiomas y es aproximadamente 2 veces más rápido.
- Procesamiento de estado estructurado: acepta texto, correo, ticket o JSON como entrada.
- Batching de preguntas: todas las preguntas de una llamada se responden en una sola pasada forward.
- Enrutado entre checkpoints: la clase `Router` selecciona el checkpoint adecuado según la entrada (por ejemplo, idioma detectado).
- Multi-turno: soporte de conversaciones mediante TD(λ=1.0) sobre slices de prefijo.
- No genera texto, por lo que no hay salida que parsear ni riesgo de alucinación textual.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el asunto y el cuerpo de un ticket y responde a una pregunta de tipo `choice` para decidir el equipo responsable (facturación, técnico, ventas), con distribución de probabilidad por opción.
- Priorización por urgencia: con una pregunta de tipo `score` sobre una rúbrica ordinal ("no urgente", "pronto", "bloqueante"), permite ordenar colas de atención sin generación de texto.
- Detección de riesgo de abandono: una pregunta de tipo `noul` devuelve P(el usuario amenaza con cancelar) para disparar acciones de retención.
- Guardrails y moderación: clasificación de contenido entrante contra criterios definidos en la petición, con probabilidad calibrada para fijar umbrales de actuación.
- Clasificación multilingüe en producción: con el checkpoint `laya-multilingual` (100+ idiomas, ~7,2 ms por pregunta en lotes de 10 sobre una T4), se puede clasificar tráfico internacional sin traducir previamente.
- Puntuación de leads o scoring interno: uso de preguntas `score` sobre rúbricas ordinales para asignar niveles esperados a cada registro.
- Triaje en pipelines de agentes: servir como etapa de decisión barata (act/escalate) antes de invocar un LLM generativo, reduciendo coste y latencia.
- Enrutado de idioma en servidores: la clase `Router` con `preload=True` mantiene residentes todos los checkpoints y elimina el coste de reconstrucción en cargas mixtas (hasta 4,8× a 50% de tráfico no inglés).

## Benchmarks y rendimiento

Medidos sobre una Tesla T4; todos los checkpoints respondieron a preguntas idénticas byte a byte en la misma ejecución.

| Preguntas por llamada | `laya` | `laya-multilingual` |
|---|---|---|
| 1 | 39,5 ms | 32,8 ms |
| 10 | 158,6 ms (15,9 ms/pregunta) | 72,3 ms (7,2 ms/pregunta) |
| 50 | 771 ms | 337 ms (6,8 ms/pregunta) |

Rendimiento batcheado: 103-332 preguntas por segundo.

Comparación con TypeSafe Jev: Jev ha sido medido de forma independiente en 236-276 ms p50 (según AbdelStark y nibzard), por lo que Laya responde a una sola pregunta aproximadamente 6-7 veces más rápido. La model card incluye una comparación adicional de precisión, flujos de aplicación, 51 idiomas, velocidad, calibración y coste de enrutado frente a Jev, pero el texto disponible está truncado.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 421M parámetros, en FP16 requiere del orden de 0,85-1,2 GB; en FP32, alrededor de 1,7 GB, más el overhead de activaciones y tokens de entrada. Los tipos de cuantización no están documentados.
- GPU recomendadas: el benchmark oficial se realizó sobre una Tesla T4; el modelo cabe con holgura en GPU de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.), dado el tamaño del checkpoint.
- Opciones de despliegue: la model card proporciona el paquete Python `laya` (`pip install laya`) y la API `laya.load(...)`, junto con la clase `Router` para enrutado entre checkpoints. No se documentan vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo generativo, estos motores orientados a decodificación autoregresiva no son aplicables de forma directa. El soporte nativo es vía `transformers`.
- Latencia y throughput: 32,8-39,5 ms para una pregunta en T4; 6,8-7,2 ms por pregunta en lotes de 10-50 con el checkpoint multilingüe; 103-332 preguntas por segundo en modo batcheado.
- Nota operativa: una construcción de checkpoint en frío cuesta segundos y, con `max_loaded=1`, alternar idiomas reconstruye el modelo en cada petición (7,4 s de mediana en CPU y 10,3 s en T4). Usar `Router(preload=True)` para evitarlo. Si `laya.load()` se bloquea, ejecutar con `USE_TF=0` por un deadlock del runtime abseil de TensorFlow.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya (ingles) | 421M | 512 por pregunta | Ingles | apache-2.0 | HuggingFace |
| Laya multilingual | 322M (mmBERT-base) | 1024 por pregunta | 100+ idiomas | apache-2.0 | HuggingFace |
| Laya typed-decisions | 421M | 1024 por pregunta | no disponible | apache-2.0 | HuggingFace |
| TypeSafe Jev | no disponible | no disponible | no disponible | no disponible | Referenciado en benchmarks de terceros (236-276 ms p50) |

No se dispone de datos de otros modelos comparables de decisión tipada en la información proporcionada.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto libre; solo responde a preguntas tipadas (`choice`, `score`, `noul`). No sirve para tareas de generación.
- Presupuesto de contexto: 512 tokens por pregunta en el checkpoint principal ingles, lo que limita el tamaño de estado + pregunta + opciones; los checkpoints multilingüe y typed-decisions amplían a 1024.
- Cobertura de idiomas dependiente del checkpoint: el checkpoint principal es en inglés; los más de 100 idiomas solo están disponibles en `laya-multilingual`.
- Riesgo de calibración imperfecta: aunque se entrena contra reglas de puntuación propias, las probabilidades devueltas deben tratarse como estimaciones y validarse en el dominio de producción.
- Discrepancia de identificador: el ID de HuggingFace es `daliborsb/laya`, mientras que la model card referencia `convaiinnovations/laya`. Conviene confirmar cuál es el repositorio canónico antes de integrarlo.
- Sin tracción comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no hay validación externa amplia más allá de los benchmarks citados en la propia model card.
- Benchmarks limitados: las mediciones de velocidad se realizaron únicamente sobre una Tesla T4; no se documentan resultados en otras GPU ni en CPU.
- Tipos de cuantización no documentados: no se indica soporte de GGUF, AWQ, GPTQ ni similares.
- Riesgo de coste operativo en despliegues multiidioma: sin `preload=True`, alternar idiomas puede reconstruir el modelo en cada petición (7,4-10,3 s de mediana).
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia de los backbones base (ModernBERT-large y mmBERT-base) para el uso final.
- Información truncada: la model card disponible está cortada en la sección de benchmarks, por lo que faltan datos comparativos completos frente a TypeSafe Jev.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/daliborsb/laya
- Checkpoint multilingue: https://huggingface.co/convaiinnovations/laya-multilingual
- Checkpoint typed-decisions: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Benchmarks independientes de Jev (AbdelStark): https://github.com/AbdelStark/jev-benchmarks
- Benchmarks independientes de Jev (nibzard): https://github.com/nibzard/decision-model-benchmark

No se han encontrado papers, blogs o demos adicionales en la busqueda web; los resultados devueltos corresponden a servicios de traduccion no relacionados con el modelo.
