# PursuitOfDataScience/Muse-Glimmer-30B-ToolCall-LoRA

## Resumen

Muse-Glimmer-30B-ToolCall-LoRA es un adaptador LoRA desarrollado por PursuitOfDataScience que se aplica sobre el modelo base meta-models/Muse-Glimmer-30B, un transformer multimodal de aproximadamente 30 000 millones de parámetros. El objetivo del adaptador es corregir un problema específico del modelo base: aunque conoce las herramientas que se le ofrecen y las nombra correctamente en su razonamiento interno, a menudo no llega a emitir la llamada a la función antes de agotar el presupuesto de generación. Este «gap de decisión y formato» impide que el modelo funcione de forma fiable en bucles de agente.

El adaptador se entrena mediante supervisión sobre 44 800 trayectorias reales de llamadas a herramientas (40 000 del dataset Agent-Ark/Toucan-1.5M y 4 800 abstenciones negativas fabricadas), con solo 191,7 millones de parámetros entrenables (0,64 % del modelo). La intervención es mínima pero produce mejoras medibles en benchmarks de tool-calling como BFCL v3, sin degradar el rendimiento general en tareas de razonamiento (GSM8K y MMLU incluso mejoran ligeramente). El adaptador no cambia la interfaz del modelo: sigue usando la sintaxis ATEM nativa de Muse-Glimmer, pero con mayor fiabilidad a la hora de emitir llamadas bien formadas.

La relevancia actual de esta ficha radica en que los modelos de lenguaje grandes con capacidades agenticas requieren una llamada a herramientas precisa y oportuna. Este adaptador demuestra que un ajuste fino ligero y dirigido puede resolver un problema de comportamiento sin necesidad de reentrenar el modelo completo, lo que lo convierte en una opción práctica para equipos que ya utilizan Muse-Glimmer-30B y necesitan mejorar su fiabilidad en entornos de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Muse-Glimmer-30B (transformer multimodal, clase AutoModelForImageTextToText) |
| Parametros totales | Modelo base: ~30B; adaptador: 191,7M entrenables (0,64 % del total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa secuencias de hasta 4096 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base no especifica cuantización) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se implementa como una LoRA de rango 32 con alpha 64 y dropout 0,05, aplicada únicamente a la torre de texto del modelo base. Los targets son las proyecciones q, k, v, o de la atención y las capas gate, up y down del MLP en las capas de `model.language_model.layers`. El encoder de percepción y el adaptador de visión se mantienen congelados durante el entrenamiento, ya que el corpus es exclusivamente textual y adaptar la ruta multimodal degradaría el rendimiento sin beneficio.

El entrenamiento se realizó con 44 800 ejemplos: 40 000 trayectorias del dataset Toucan-1.5M y 4 800 abstenciones negativas generadas manualmente. Se filtraron tres defectos del corpus: el 7,4 % de los registros filtraba la sintaxis JSON `<tool_call>` de Toucan en la prosa del asistente, el 4,2 % nombraba herramientas que nunca se ofrecieron (114 literalmente llamadas `unknown`), y los bloques `thinking_cot` intercalaban `[Tool Simulation — …]` que no debían supervisarse. La pérdida se calcula solo sobre los spans del asistente, re-renderizando cada prefijo de mensaje para enmascarar correctamente.

El entrenamiento usó 3 GPU H100 NVL de 94 GB, con 669 GPU-minutos repartidos en 14 sesiones de una hora. El optimizador fue AdamW con learning rate 0,0001 en decaimiento coseno hasta 1e-05, warmup de 40 pasos y grad-clip 1,0. Se usaron micro-batches de 24 ejemplos con un máximo de 6144 tokens padded por batch, y una longitud de secuencia máxima de 4096 tokens.

## Capacidades

- Mejora la fiabilidad de la llamada a herramientas: el adaptador hace que el modelo emita llamadas bien formadas cuando se necesita una herramienta, reduciendo el problema de «deliberar sin decidir» del modelo base.
- Soporte de function calling y tool-calling en sintaxis ATEM nativa de Muse-Glimmer, en el canal `to=` receptor.
- Capacidad de abstención: el adaptador alcanza un 100 % de abstenciones correctas cuando no se ofrece ninguna herramienta aplicable, frente al 85,2 % del modelo base.
- Mejora la precisión de nombres de herramienta y la coincidencia exacta de argumentos: +2,5 pp y +10,9 pp respectivamente en el conjunto Toucan held-out.
- No introduce intrusión de sintaxis de herramienta cuando no se ofrecen herramientas (0 % de intrusiones en GSM8K con `tools=None`).
- Mantiene o mejora el rendimiento en razonamiento general: GSM8K sube de 74,0 % a 88,0 % y MMLU de 79,6 % a 81,6 % con el adaptador.
- El modelo base es multimodal (imagen y texto), aunque el adaptador solo actúa sobre la torre de texto; las capacidades multimodales del base permanecen intactas.

## Casos de uso

- Agentes autónomos de planificación: un agente que debe decidir cuándo llamar a una API externa (por ejemplo, consultar el tiempo, buscar información o ejecutar una acción) puede usar este adaptador para garantizar que la llamada se emita en el momento correcto, sin quedarse en razonamiento interno. Es adecuado porque el adaptador reduce la tasa de «no emisión» y mejora la abstención cuando no hay herramienta.
- Asistentes de código con herramientas de ejecución: en un IDE o pipeline de CI/CD, el modelo puede invocar funciones como `run_tests`, `git_commit` o `deploy` con argumentos exactos. La mejora en argument exact match (+10,9 pp) lo hace fiable para generar llamadas con parámetros correctos.
- Automatización de tareas con APIs de terceros: un sistema que integra múltiples servicios (pagos, envíos, CRM) puede usar el adaptador para que el modelo seleccione y llame a la función adecuada entre muchas disponibles, gracias a la mejora en tool-name accuracy y en la precisión AST de BFCL v3.
- Chatbots con acceso a funciones empresariales: un asistente de atención al cliente que necesita consultar pedidos, reembolsos o disponibilidad puede usar el adaptador para emitir llamadas a las funciones internas con el formato correcto, reduciendo errores de esquema.
- Sistemas RAG con llamadas a bases de datos: el modelo puede generar consultas estructuradas (SQL o búsquedas vectoriales) como llamadas a herramientas, y el adaptador asegura que la llamada se emita sin divagaciones, mejorando la latencia del sistema.
- Herramientas de productividad con multi-paso: un asistente que debe encadenar varias llamadas (por ejemplo, crear un evento, enviar una invitación y programar un recordatorio) se beneficia de la mejora en BFCL v3 multiple (+8,3 pp), que indica mayor fiabilidad en escenarios con múltiples herramientas y llamadas secuenciales.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. Se presentan dos conjuntos: Toucan held-out (in-distribution, n=200) y BFCL v3 (no entrenado, n=120 por subconjunto). También se incluyen GSM8K y MMLU para evaluar la no-degradación.

| Toucan held-out (in-distribution), n=200 | Stock | + adaptador | Cambio |
|---|---|---|---|
| Nombró la herramienta correcta en cualquier parte de su salida | 92,4 % | 91,6 % | ↓ -0,8 pp |
| Emitió una llamada bien formada cuando era necesaria | 98,3 % | 90,8 % | ↓ -7,6 pp |
| Precisión del nombre de herramienta | 85,7 % | 88,2 % | ↑ +2,5 pp |
| Coincidencia exacta de argumentos | 61,3 % | 72,3 % | ↑ +10,9 pp |
| Esquema válido (nombre existe, argumentos requeridos presentes) | 97,5 % | 90,8 % | ↓ -6,7 pp |
| Abstención cuando no aplica ninguna herramienta | 85,2 % | 100,0 % | ↑ +14,8 pp |
| Alcanzó el límite de generación a mitad de respuesta | 1,7 % | 1,7 % | — +0,0 pp |

| BFCL v3 (no entrenado), n=120/subset | Stock | + adaptador | Cambio |
|---|---|---|---|
| Precisión AST global | 81,2 % | 85,2 % | ↑ +4,0 pp |
| Live irrelevance | 77,5 % | 83,3 % | ↑ +5,8 pp |
| Live multiple | 78,3 % | 78,3 % | — +0,0 pp |
| Live simple | 72,5 % | 76,7 % | ↑ +4,2 pp |
| Multiple | 81,7 % | 90,0 % | ↑ +8,3 pp |
| Simple | 92,5 % | 95,8 % | ↑ +3,3 pp |

| GSM8K, sin herramientas ofrecidas, n=200 | Stock | + adaptador | Cambio |
|---|---|---|---|
| Precisión | 74,0 % | 88,0 % | ↑ +14,0 pp |
| Intrusión de sintaxis de herramienta | 0,0 % | 0,0 % | — +0,0 pp |
| MMLU (n=250) | 79,6 % | 81,6 % | ↑ +2,0 pp |

El autor señala que los resultados en Toucan pueden reflejar en parte la imitación de MiniMax-M2.5 (el modelo que generó las trayectorias), mientras que BFCL v3 es la prueba más honesta al no haber sido incluido en el entrenamiento.

## Requisitos de hardware

- El adaptador en sí es ligero (0,8 GB en el repositorio), pero el modelo base Muse-Glimmer-30B tiene aproximadamente 30 000 millones de parámetros, por lo que la inferencia requiere hardware de gama alta.
- No se proporcionan requisitos oficiales de VRAM. Para inferencia en bfloat16, un modelo de 30B necesita del orden de 60 GB de VRAM, por lo que una GPU como la A100 80GB o H100 80GB sería adecuada.
- Con cuantización (por ejemplo, 4 bits) podría caber en GPUs de 24 GB como la RTX 3090 o RTX 4090, pero no hay datos oficiales de cuantización para este adaptador ni para el modelo base.
- El entrenamiento se realizó en 3x H100 NVL de 94 GB, lo que da una referencia del hardware necesario para reproducir el ajuste.
- Para despliegue, el adaptador se usa con la librería PEFT y transformers (versión >= 5.15). Se puede integrar en frameworks de inferencia que soporten modelos PEFT, como vLLM o TGI, aunque no se menciona explícitamente en la documentación.
- No se especifican métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de comparaciones con otros adaptadores LoRA para tool-calling en la información proporcionada. La única comparativa incluida en la model card es entre el modelo base (stock) y el modelo con el adaptador, cuyos resultados se muestran en la sección de benchmarks. Por tanto, no se puede establecer una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El adaptador se entrenó sobre trayectorias generadas por MiniMax-M2.5, por lo que los resultados en Toucan pueden estar sesgados hacia la imitación de ese modelo y no reflejar necesariamente una mejora intrínseca en la capacidad de tool-calling.
- En el conjunto Toucan held-out, el adaptador empeora la tasa de llamadas bien formadas (98,3 % → 90,8 %) y la validez de esquema (97,5 % → 90,8 %), aunque mejora en BFCL v3. Este comportamiento contradictorio sugiere que el adaptador puede no generalizar uniformemente a todos los formatos de herramientas.
- El adaptador solo afecta a la torre de texto; las capacidades multimodales del modelo base no se ven alteradas, pero tampoco se benefician de las mejoras.
- Se requiere transformers >= 5.15, que puede no estar disponible en todos los entornos de producción.
- No se han evaluado sesgos, alucinaciones o riesgos específicos del modelo base en la documentación proporcionada.
- La licencia del adaptador es Apache 2.0, pero la licencia del modelo base (meta-models/Muse-Glimmer-30B) no se especifica en la información disponible, por lo que debe verificarse antes de un uso comercial.
- El adaptador no cambia el límite de generación del modelo base; en los datos se observa que el 1,7 % de las respuestas siguen alcanzando el tope de generación a mitad de respuesta, lo que puede afectar a casos extremos.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/PursuitOfDataScience/Muse-Glimmer-30B-ToolCall-LoRA
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Dataset de entrenamiento: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M
