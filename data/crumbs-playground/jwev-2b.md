# crumbs-playground/jwev-2b

## Resumen

Jwev (identificador `crumbs-playground/jwev-2b`) es un envoltorio de código personalizado sobre un modelo base Qwen3.5 de 2B parámetros (la model card menciona Qwen3.5-VL y el tag de HuggingFace indica `Qwen/Qwen3.5-2B`) que transforma un modelo de lenguaje generativo en un evaluador estructurado de preguntas tipadas. En lugar de generar texto libre, el modelo recibe un estado (texto o imagen codificada en base64) y un conjunto de preguntas con tipo (`choice`, `score`, `noul`) y devuelve respuestas acompañadas de probabilidades y puntuaciones de log-verosimilitud de secuencia completa. Está publicado por el usuario `crumbs-playground` y expone el pipeline `zero-shot-classification`.

Su relevancia práctica está en el formato de salida: cada candidato se puntúa sumando los log-probabilidades de toda su secuencia de tokens, lo que evita la ambigüedad típica del scoring por primer token (por ejemplo, `"1"` frente a `"10"`, o `"Yes"` frente a `"Yep"`). Todas las candidaturas de todas las preguntas se agrupan en un único forward pass, lo que reduce el coste de evaluar múltiples etiquetas simultáneamente. Además, las puntuaciones son diferenciables, de modo que el modelo se puede ajustar por supervisión directa o por refuerzo sin cambiar la interfaz de evaluación.

El modelo tiene 2.213.241.664 parámetros y el repositorio ocupa 4,4 GB. Se distribuye como código personalizado en el Hub: requiere `trust_remote_code=True` y una versión de `transformers` de la línea 5.x que exponga `Qwen3_5ForConditionalGeneration`. No hay datos publicados sobre licencia, idiomas soportados, longitud de contexto ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Envoltorio de evaluación sobre Qwen3.5-VL (modelo base `Qwen/Qwen3.5-2B`), con scoring por log-verosimilitud de secuencia completa y cabecera de preguntas tipadas |
| Parámetros totales | 2.213.241.664 (~2,2 mil millones) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors; no se listan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors, más código personalizado Python (`custom_code`) |
| Pipeline declarado | `zero-shot-classification` |
| Modelo base | `Qwen/Qwen3.5-2B` (`finetune`) |
| Versión de transformers requerida | Línea 5.x (debe exponer `Qwen3_5ForConditionalGeneration`) |
| Versión de Python requerida | ≥ 3.10 |
| Descargas / likes en el Hub | 0 / 0 |
| Fecha de creación | 2026-09-22 |
| Última actualización | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal (Qwen3.5-VL) sobre el que se añade una capa de orquestación en Python. El flujo de evaluación es el siguiente: para cada candidato, Jwev construye un prompt en formato chat con la estructura `[imagen?] + "State: ...\nQuestion: ...\nAnswer:"`, concatena la secuencia completa de tokens del candidato, ejecuta un forward pass y recoge los logits que predicen cada token de la respuesta. La puntuación final es la suma de los log-probabilidades por token, y por cada pregunta se aplica un softmax sobre las puntuaciones de los candidatos para obtener probabilidades normalizadas. El candidato de mayor probabilidad se devuelve como `choice` o `score`, mientras que en el tipo `noul` la probabilidad devuelta es `P("Yes")`.

Las tres modalidades de pregunta son: `choice`, que puntúa etiquetas con nombre (`"billing"`, `"technical"`, `"sales"`) condicionadas a una instrucción; `score`, que puntúa índices ordenados (`"0"`, `"1"`, `"2"`) sobre una rúbrica y devuelve además la leyenda índice-descripción; y `noul`, que devuelve la probabilidad de `"Yes"` frente a `"No"`. La evaluación está batcheada: todos los candidatos de todas las preguntas se pliegan en la dimensión de batch y pasan por un único forward pass. La model card destaca que el scoring es diferenciable de extremo a extremo, lo que permite propagar directamente una pérdida supervisada o una ventaja de RL sobre las puntuaciones.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otros ajustes por preferencias. Tampoco se detalla si el envoltorio añade parámetros entrenables o si reutiliza íntegramente los pesos del modelo base. El soporte de imágenes se gestiona pasando estados en formato `data:image...;base64,...`, que activan la ruta de visión del modelo dentro del mismo forward pass.

## Capacidades

- Evaluación zero-shot con preguntas tipadas: `choice` (una entre N opciones con nombre), `score` (nivel ordinal sobre rúbrica) y `noul` (probabilidad sí/no).
- Scoring de secuencia completa en lugar de scoring por primer token, lo que resuelve colisiones de prefijos entre respuestas candidatas.
- Evaluación batcheada: todos los candidatos de todas las preguntas en un único forward pass.
- Salidas con probabilidades calibradas por softmax, además de las puntuaciones brutas de log-verosimilitud para depuración.
- Gradientes diferenciables en todas las puntuaciones, aptos para entrenamiento supervisado o por refuerzo.
- Entrada multimodal: acepta estados en texto o como URI de datos de imagen en base64, con la ruta de visión del modelo ejercitada de forma transparente.
- Integración nativa con el Hub: el envoltorio y su código personalizado se cargan con `trust_remote_code=True` mediante `AutoModel`.
- No se documenta soporte de tool calling, function calling ni flujos de agente multi-paso.
- No se documentan capacidades multilingües específicas ni lista de idiomas soportados.

## Casos de uso

- Triaje de tickets de soporte: el ejemplo canónico de la model card clasifica un mensaje de cliente en departamentos (`billing`, `technical`, `sales`), estima el nivel de frustración en una rúbrica ordinal y calcula la probabilidad de urgencia, todo en una sola llamada y con probabilidades por clase que permiten fijar umbrales de derivación automática.
- Moderación de contenido con rúbricas: usando preguntas de tipo `score`, se puede graduar la severidad de un texto o una imagen en niveles ordenados (por ejemplo, "sin incidencia", "incidencia leve", "incidencia grave") y obtener la distribución completa de probabilidades para auditar decisiones límite.
- Enrutamiento de intenciones en asistentes conversacionales: con preguntas `choice` sobre un conjunto cerrado de intenciones y sus descripciones, se obtiene la intención dominante y su confianza sin reentrenar el modelo, lo que permite añadir o retirar intenciones editando solo el prompt.
- Análisis de sentimiento y tono con escala ordinal: la modalidad `score` encaja con escalas tipo Likert, permitiendo métricas continuas (por ejemplo, índice de enfado medio por lote de mensajes) en lugar de etiquetas binarias.
- Procesamiento de capturas e imágenes de tickets: gracias al soporte de estados en base64, se pueden clasificar capturas de pantalla de errores, facturas o formularios rellenados a mano usando el mismo código que para texto.
- Etiquetado automático de datasets para entrenamiento: al devolver log-verosimilitudes diferenciables, el modelo se puede usar como anotador blando (soft labels) o como política inicial en un bucle de RL, propagando la pérdida directamente sobre las puntuaciones.
- Puntuación automática de respuestas (LLM-as-judge): con preguntas `noul` o `score` se puede evaluar si una respuesta cumple un criterio (corrección, utilidad, toxicidad) y obtener una probabilidad en lugar de un juicio categórico, lo que facilita el análisis de acuerdo entre anotadores.
- Lead scoring y detección de urgencia en bandejas de entrada compartidas: la pregunta `noul` devuelve `P(Yes)` directamente, lo que se traduce en un ranking de mensajes por probabilidad de requerir atención inmediata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de clasificación, y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo, su autor o el proyecto Jwev.

## Requisitos de hardware

- Estimación de VRAM en pesos (cálculo aritmético a partir de 2,213 mil millones de parámetros, sin contar activaciones ni caché KV): ~4,4 GB en bf16/fp16, ~2,2 GB en int8 y ~1,1 GB en int4. No se publican cuantizaciones oficiales, por lo que estos valores son estimaciones de referencia y no configuraciones verificadas del repositorio.
- VRAM total estimada en inferencia (pesos más activaciones, caché KV y el codificador de visión cuando se usan imágenes): del orden de 6-8 GB en bf16, 4-5 GB en int8 y 2-3 GB en int4. Cifras orientativas, no confirmadas por el autor.
- GPU recomendadas: cabe holgadamente en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en RTX 3090/4090 para lotes grandes. En entornos de servidor, A100, H100 o L40S ofrecen margen amplio y mejor throughput con batch grande.
- Despliegue: el método documentado es `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` y `device_map`. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama; dado que la funcionalidad depende de código personalizado en Python (`custom_code`) y de la clase `Qwen3_5ForConditionalGeneration`, estos motores requerirían una integración específica y es probable que no reproduzcan la lógica de evaluación multi-pregunta tal cual.
- Latencia y throughput: no disponibles. Cabe señalar que el diseño batcheado concentra todos los candidatos de todas las preguntas en un único forward pass, lo que reduce el número de pasadas frente a una implementación ingenua, pero el coste crece linealmente con el número total de candidatos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crumbs-playground/jwev-2b | 2.213.241.664 | No disponible | Evaluación estructurada multi-pregunta (choice / score / noul) sobre texto e imagen | No disponible | HuggingFace, requiere `trust_remote_code` |
| Qwen/Qwen3.5-2B (modelo base) | ~2B (heredado por el ajuste) | No disponible | Generación de lenguaje y visión base | No disponible | HuggingFace |
| Clasificadores zero-shot basados en encoder (por ejemplo, familia DeBERTa-v3 NLI) | No disponible | No disponible | Clasificación zero-shot de texto | No disponible | HuggingFace |
| Modelos de evaluación con rúbrica basados en LLM (patrón LLM-as-judge) | No disponible | No disponible | Puntuación de texto mediante generación | No disponible | Genéricos, sin versión concreta identificada |

No se han identificado en la información disponible otros envoltorios de evaluación multi-pregunta directamente comparables, ni se dispone de datos de licencia o contexto de las alternativas, por lo que la comparación cuantitativa no puede completarse.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial ni redistribución sin consultar al autor, lo que bloquea su adopción en producción hasta aclararlo.
- Idiomas soportados no declarados: no hay garantía de comportamiento correcto en castellano ni en otros idiomas distintos del inglés, idioma de todos los ejemplos de la model card.
- Longitud de contexto no documentada: no se puede dimensionar cuánto texto admite por estado ni cuántas preguntas caben en un mismo forward pass.
- Ambigüedad sobre el modelo base: los tags de HuggingFace apuntan a `Qwen/Qwen3.5-2B` mientras la model card describe un envoltorio sobre Qwen3.5-VL y exige `Qwen3_5ForConditionalGeneration`; conviene verificar qué pesos se cargan realmente.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor en el entorno propio y no es aceptable en muchos pipelines con políticas de seguridad estrictas.
- Riesgo de alucinación: aunque la tarea sea de clasificación, las puntuaciones se derivan de log-verosimilitudes del modelo base, por lo que etiquetas mal redactadas o poco distinguibles pueden producir distribuciones planas o sesgadas. Las probabilidades del softmax no están calibradas de forma explícita.
- Sesgo de formulación: el resultado depende fuertemente del texto de `instructions` y de los nombres de las etiquetas; cambios menores en la redacción pueden alterar las probabilidades.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión frente a alternativas, ni de robustez en dominios distintos del ejemplo de tickets.
- Adopción nula: 0 descargas y 0 likes en el momento del análisis, sin comunidad ni informes independientes que respalden su comportamiento.
- Rendimiento no medido: no se publican cifras de latencia, throughput ni coste por evaluación, datos imprescindibles para dimensionar un servicio en producción.
- El repositorio ocupa 4,4 GB para 2,2B parámetros, lo que sugiere la presencia de pesos adicionales (por ejemplo, componentes multimodales), pero no hay documentación que lo confirme.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/crumbs-playground/jwev-2b
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil del autor: https://huggingface.co/crumbs-playground
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
