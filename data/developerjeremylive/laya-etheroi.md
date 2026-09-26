# developerjeremylive/laya-etheroi

## Resumen

Laya (repositorio `developerjeremylive/laya-etheroi`) es un modelo de clasificación de texto no autorregresivo, de tipo "System 1", publicado por el usuario `developerjeremylive` bajo licencia Apache 2.0. A diferencia de un LLM generativo, el modelo no produce texto libre: recibe un estado (un texto, un correo, un ticket o un JSON) junto con preguntas tipadas y devuelve respuestas también tipadas (elección entre opciones, puntuación o probabilidad binaria) con probabilidades calibradas, todo en una única pasada hacia delante. La model card del autor cifra esa pasada en unos 33 ms, aunque no especifica el hardware de la medición.

El modelo se enmarca en la familia Laya, entrenada con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD, *reinforcement learning with calibrated decisions*), de modo que la única forma de maximizar la recompensa es reportar probabilidades honestas. Al no generar texto, no hay nada que parsear y, según el autor, nada que alucinar en la salida. La familia incluye variantes para inglés y multilingüe, con detección automática de idioma y enrutado entre checkpoints.

El repositorio concreto que nos ocupa tiene 421.293.830 parámetros reales (verificados vía safetensors) y un tamaño de 2,4 GB. Está pensado para enrutado, guardrails, moderación y *scoring* dentro de pipelines, y admite ajuste fino sobre decisiones del propio dominio, que es donde el autor sitúa la mayor ganancia de precisión. Es relevante ahora porque cubre una necesidad recurrente en producción (clasificar y enrutar con probabilidades calibradas y latencia baja) sin el coste ni la variabilidad de un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (modelo de decisión "System 1"; detalle interno no disponible en la información proporcionada) |
| Parámetros totales | 421.293.830 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 8.192 tokens con `max_len=8192` en `laya-multilingual`; límite por defecto de 1.024 tokens. Valor específico de este checkpoint: no disponible |
| Tipos de cuantización | No disponible (el runtime menciona una ruta rápida GPU con TileLang y soporte ONNX Runtime) |
| Idiomas soportados | Más de 100 idiomas según la model card; el campo de idiomas del repositorio figura como no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible describe Laya como un modelo de decisión multilingüe y no autorregresivo: consume un estado y un conjunto de preguntas tipadas (`choice`, `score`, `noul`) y emite respuestas tipadas con probabilidades calibradas en una sola pasada. El autor lo clasifica como "System 1", es decir, una decisión rápida e intuitiva frente al razonamiento deliberado de los modelos "System 2". No se detalla en la información proporcionada el número de capas, la dimensión oculta, el mecanismo de atención ni el número exacto de parámetros del encoder subyacente.

El entrenamiento se realizó con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD), un planteamiento en el que reportar probabilidades bien calibradas es la estrategia óptima para maximizar la recompensa. No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas adicionales de RLHF o DPO al margen de RLCD. La familia incluye detección de escritura e idioma con enrutado automático al checkpoint multilingüe, y el autor documenta un proceso de ajuste fino con calibración de temperaturas, reproducible en 2 GPU T4 gratuitas de Kaggle.

## Capacidades

- Clasificación de texto con preguntas tipadas: elección entre opciones etiquetadas, puntuación sobre una escala definida por criterios y probabilidad binaria de tipo "sí/no" (`noul`).
- Probabilidades calibradas de forma explícita: el objetivo de entrenamiento premia la honestidad probabilística, lo que permite usar las salidas como umbrales de confianza.
- Inferencia no generativa: no produce texto libre, por lo que no requiere parseo de la salida.
- Multilingüe: la model card declara más de 100 idiomas, con detección de escritura e idioma y enrutado automático al checkpoint multilingüe.
- Documentos largos: hasta 8.192 tokens con `max_len=8192` en el checkpoint multilingüe (con degradación de precisión más allá de unos 4.000 tokens).
- Enrutado y *scoring*: pensado para seleccionar departamento, cola o flujo, y para puntuar urgencia, riesgo o intención.
- Guardrails y moderación: aplicable a la clasificación de contenido y a la toma de decisiones de política en pipelines.
- Integraciones: servidor HTTP (`laya[serve]`), servidor MCP (`laya[mcp]`), LangChain y LangGraph (`laya[langchain]`) y ONNX Runtime (`laya[onnx]`).
- Ajuste fino sobre dominio propio: el autor documenta un *notebook* que completa el ciclo (generación de dataset, entrenamiento, calibración y evaluación) en 2 GPU T4.
- Tool calling y razonamiento multi-paso: no disponibles; el modelo no es un agente generativo ni un LLM de instrucciones.
- Visión y audio: no disponibles.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket y una pregunta de tipo `choice` con los departamentos posibles (facturación, técnico, otros) y devuelve la opción más probable con su probabilidad, lo que permite derivar automáticamente y marcar los casos de baja confianza para revisión humana.
- Triaje de urgencia: con una pregunta de tipo `score` sobre criterios definidos ("no urgente", "pronto", "bloqueante"), se prioriza una cola de incidencias sin necesidad de un LLM generativo y con latencia de decenas de milisegundos.
- Predicción de riesgo de abandono (*churn*): una pregunta binaria sobre si el usuario amenaza con cancelar devuelve una probabilidad calibrada que puede alimentar un sistema de alertas o de retención.
- Guardrails de contenido en producción: clasificar entradas de usuario contra políticas internas antes de pasarlas a un modelo generativo, usando las probabilidades como umbral configurable.
- Moderación y clasificación de seguridad: etiquetado de mensajes en comunidades o plataformas con criterios tipados y auditables, al no existir salida de texto libre que pueda desviarse.
- Análisis de documentos largos multilingües: con `max_len=8192` en el checkpoint multilingüe, extraer decisiones tipadas de contratos, correos extensos o informes en cualquiera de los idiomas soportados (verificando la precisión en textos por encima de unos 4.000 tokens).
- Enrutado dentro de un agente LangGraph: usar Laya como nodo de decisión que selecciona la siguiente herramienta o rama del grafo en función del estado de la conversación.
- Ajuste fino para dominios regulados: reentrenar el checkpoint sobre decisiones etiquetadas de un dominio concreto (legal, sanitario, financiero) para mejorar la precisión respecto al uso *zero-shot*.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a la familia Laya, no necesariamente al checkpoint de este repositorio, por lo que deben tomarse como referencia del autor:

| Evaluación | Modelo | Resultado |
|---|---|---|
| Decisiones tipadas (2.000 decisiones, cuatro flujos) | `laya-typed-decisions` (ajustado) | 0,766 de precisión |
| Decisiones tipadas (2.000 decisiones, cuatro flujos) | Checkpoint inglés base | 0,362 de precisión |
| Documentos largos, hasta ~4.000 tokens | `laya-multilingual` con `max_len=8192` | 16 a 18 respuestas correctas de 20 |
| Documentos largos, más de ~4.000 tokens | `laya-multilingual` con `max_len=8192` | 8 a 17 respuestas correctas de 20 |
| Latencia por pasada | Laya (hardware no especificado) | ~33 ms |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras baterías estándar, lo cual es coherente con el hecho de que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, en torno a 1,7 GB de pesos; en fp16, unos 0,85 GB; en int8, unos 0,42 GB. Estas cifras son estimaciones a partir de los 421 millones de parámetros y no aparecen publicadas por el autor.
- GPU recomendadas: no disponible en la información proporcionada. El autor documenta uso sobre GPU de Apple (un texto de 4.000 tokens tarda unos 1,7 s en una GPU de Apple) y entrenamiento/ajuste fino en 2 GPU T4 de Kaggle, lo que indica que una T4 de 16 GB es suficiente para el ciclo completo de ajuste fino.
- GPU de consumo: por tamaño del modelo, cabe holgadamente en cualquier GPU de consumo con 8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090). No hay confirmación oficial de rendimiento en estas tarjetas.
- Opciones de despliegue: paquete `laya` sobre Python 3.10 o superior con `transformers`; servidor HTTP con `laya[serve]`; servidor MCP con `laya[mcp]`; integración con LangChain y LangGraph con `laya[langchain]`; ONNX Runtime con `laya[onnx]`; ruta rápida en GPU con TileLang mediante `laya[fast]`. vLLM, llama.cpp, Ollama y TGI no están contemplados en la información disponible, y en principio no aplican a un modelo de clasificación no autorregresivo.
- Latencia y throughput: el autor declara ~33 ms por pasada hacia delante; el throughput agregado y la latencia bajo concurrencia no están disponibles.

## Comparativa con modelos similares

La categoría natural de comparación son los encoders de clasificación multilingües. Los datos de los modelos alternativos que figuran a continuación provienen del conocimiento público general de esos modelos y no de la información proporcionada en esta búsqueda; conviene verificarlos en sus respectivas model cards.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| laya-etheroi (Laya) | 421.293.830 | Hasta 8.192 tokens (checkpoint multilingüe) | Apache 2.0 | Clasificación no autorregresiva con preguntas tipadas y probabilidades calibradas |
| DeBERTa-v3-base | ~184 millones | 512 tokens | MIT | Encoder de clasificación de propósito general |
| XLM-RoBERTa-base | ~278 millones | 512 tokens | MIT | Encoder multilingüe de clasificación de propósito general |
| mDeBERTa-v3-base | ~278 millones | 512 tokens | MIT | Encoder multilingüe de clasificación de propósito general |

Diferencias destacables: Laya opera con un contexto declarado muy superior (hasta 8.192 tokens frente a los 512 típicos de los encoders base) y ofrece una interfaz de decisión tipada con calibración explícita, mientras que los encoders comparables requieren una cabeza de clasificación y un proceso de calibración aparte. Como contrapartida, las alternativas citadas cuentan con ecosistemas, documentación y benchmarks públicos mucho más extensos. No se dispone de comparaciones de rendimiento directas entre Laya y estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede redactar texto, resumir ni mantener conversaciones; solo responde a preguntas tipadas sobre un estado dado.
- Riesgo de alucinación: el autor afirma que no hay alucinación porque no se genera texto, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento, lo que en la práctica produce decisiones erróneas con alta confianza.
- Rendimiento *zero-shot* bajo: en el benchmark de decisiones tipadas, el checkpoint inglés base obtiene 0,362 de precisión frente a 0,766 del checkpoint ajustado, lo que sugiere que el uso sin ajuste fino en dominios concretos es poco fiable.
- Degradación en documentos largos: por encima de unos 4.000 tokens la precisión medida cae de 16-18 de 20 a 8-17 de 20; el autor recomienda validar la precisión en datos propios.
- Configuración de contexto: el límite por defecto es de 1.024 tokens, por lo que los documentos largos se truncan si no se pasa `max_len=8192` explícitamente.
- Enrutado de idioma: el texto largo mayoritariamente en inglés puede acabar en el checkpoint inglés aunque se pretenda usar el multilingüe; hay que forzar `model="multilingual"`.
- Idiomas: la cifra de "más de 100 idiomas" procede de la model card del autor; el campo de idiomas del repositorio figura como no disponible y no hay evaluación pública por idioma.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del paquete `laya` y de los checkpoints asociados, ya que la familia incluye repositorios de terceros.
- Adopción nula: el repositorio registra 0 descargas y 0 *likes*, y no hay benchmarks independientes ni revisión por pares que respalden las cifras publicadas.
- Fecha de publicación futura: los metadatos indican creación y actualización en septiembre de 2026, posterior a la fecha habitual de referencia; conviene verificar la vigencia del repositorio.
- Sesgos: no disponibles; no se documenta ninguna evaluación de sesgo o equidad.
- Estabilidad del runtime: la propia model card de la versión 0.3.20 reconoce correcciones recientes en la ruta rápida (errores de memoria CUDA, opciones únicas en preguntas de tipo `choice`, condiciones de carrera en los búferes de gráficos CUDA), lo que indica un componente todavía en maduración.

## Enlaces

- HuggingFace: https://huggingface.co/developerjeremylive/laya-etheroi
- Repositorio GitHub: https://github.com/NandhaKishorM/laya
- Documentación: https://nandhakishorm.github.io/laya/
- Checkpoint ajustado `laya-typed-decisions`: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Script de benchmark de contexto largo: https://github.com/NandhaKishorM/laya/blob/main/research/scripts/bench_long_context.py
- Notebook de ajuste fino en 2x T4: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Guía de hooks de predicción: https://nandhakishorm.github.io/laya/hooks/
- Guía de decisiones basadas en esquema: https://nandhakishorm.github.io/laya/structured/
- Guía de Docker: https://nandhakishorm.github.io/laya/docker/
- Guía de LangChain y LangGraph: https://nandhakishorm.github.io/laya/langchain/
- Referencia de la API: https://nandhakishorm.github.io/laya/reference/

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces recuperados trataban sobre técnicas de generación de lluvia y no guardan relación con la ficha.
