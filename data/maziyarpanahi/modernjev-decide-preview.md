# MaziyarPanahi/ModernJEV-Decide-Preview

## Resumen

ModernJEV-Decide-Preview es un modelo encoder de 149,6 millones de parámetros desarrollado por Maziyar Panahi, construido como un ajuste fino (finetune) sobre answerdotai/ModernBERT-base. No es un modelo generativo: su función es puntuar y clasificar opciones. Recibe una conversación, la política del agente y una lista de herramientas disponibles, junto con un conjunto de etiquetas candidatas proporcionadas por la aplicación, y devuelve cuál de esas opciones es la más adecuada (por ejemplo, responder con texto, invocar una herramienta o seleccionar una herramienta concreta). El modelo puntúa alternativas; la ejecución de la acción corresponde siempre a la aplicación que lo integra.

La relevancia del modelo está en su planteamiento de coste y tamaño: es un prototipo experimental orientado al enrutamiento de decisiones en agentes, entrenado sobre 60.000 decisiones seleccionadas del dataset MaziyarPanahi/AgentToolDecisions-180K con 3.720 pasos de optimizador, y con un coste estimado de entre 5,40 y 6,60 dólares de cómputo en una única NVIDIA A100, en unas 2 horas y 10 minutos. Su arquitectura es la de un cross-encoder ModernBERT con una única cabeza de puntuación escalar, lo que permite que las etiquetas de elección sean texto libre y no un vocabulario fijo de nombres de herramientas.

Se trata de una versión preview: el autor advierte explícitamente de que es un prototipo de ranking de elecciones y no una reproducción completa de Jev. La model card reporta resultados en conjuntos retenidos de 1.158 decisiones de siguiente acción, 542 de selección de herramienta y 3.652 decisiones When2Call no vistas, evaluados por separado, aunque no se incluyen cifras numéricas de precisión en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder ModernBERT con una cabeza de puntuación escalar (encoder transformer, no generativo) |
| Parámetros totales | 149.605.633 (149,6 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors en precisión completa; no se anuncian variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT: procesa conjuntamente el contexto de entrada (conversación, política y descripción de herramientas o alternativas) y cada etiqueta candidata, y emite una puntuación escalar por candidato mediante una única cabeza de scoring. Al tratar las etiquetas y sus descripciones como texto de entrada, el modelo no queda restringido a un vocabulario cerrado de nombres de herramientas, lo que permite definir opciones nuevas en tiempo de inferencia sin reentrenar. La entrada se limita a 4.096 tokens y el modelo está etiquetado como text-classification con soporte para text-embeddings-inference y endpoints compatibles.

El ajuste fino se realizó sobre el dataset MaziyarPanahi/AgentToolDecisions-180K, con un total de 60.000 decisiones de entrenamiento seleccionadas y 3.720 pasos de optimizador, completados íntegramente (60.000/60.000 filas procesadas). La evaluación se separó por tarea: 1.158 decisiones de siguiente acción, 542 de selección de herramienta y 3.652 decisiones When2Call no vistas. No se especifica en la información disponible si se aplicaron técnicas de RLHF, DPO u otras fases de post-entrenamiento, ni la composición detallada del dataset. El autor documenta además una prueba independiente de flujo de trabajo mediante HuggingChat ML Intern, en la que se entrenaron 6.000 decisiones en 1.500 pasos en 996,9 segundos (16 minutos y 37 segundos), excluyendo preparación y evaluación.

## Capacidades

- Enrutamiento de siguiente acción: distingue entre acciones declaradas como `text_response` o `tool_call` a partir de la conversación y la política del agente.
- Selección de herramienta: ordena y elige la herramienta adecuada según la tarea y la descripción funcional de cada herramienta disponible.
- Ramificación de flujos de trabajo: dado un estado textual y un conjunto de alternativas descritas, devuelve la etiqueta de la rama más probable.
- Puntuación de alternativas: además de la etiqueta elegida, devuelve las puntuaciones del resto de candidatos, lo que permite inspeccionar y comparar el ranking.
- Etiquetas de texto libre: no depende de un vocabulario fijo de nombres de herramientas.
- Experimentación en modelos de decisión: sirve como banco de pruebas para comparar recetas de entrenamiento sobre decisiones retenidas.
- Limitación funcional explícita: no genera argumentos de herramientas ni ejecuta herramientas.

## Casos de uso

- Enrutamiento de agentes de soporte: el modelo decide si una consulta debe resolverse con una respuesta directa, una búsqueda en base de conocimiento o un escalado a un operador humano, puntuando cada opción declarada en la política del agente.
- Selección de API en asistentes: dada una tarea y el catálogo de API disponibles con sus descripciones, el modelo devuelve la etiqueta de la API que debe invocarse, dejando que la aplicación construya los parámetros de la llamada.
- Control de flujo en pipelines de automatización: en un workflow con varias ramas posibles descritas en texto, el modelo elige la rama a ejecutar a partir del estado textual actual.
- Prefiltro de decisión en sistemas con LLM generativo: se usa el encoder de 149,6 M parámetros como primera etapa barata que decide si hace falta invocar un modelo grande o una herramienta, reduciendo el coste por turno.
- Evaluación de políticas de agente: el ranking de candidatos permite auditar de forma offline si la política declarada produce decisiones coherentes con las tareas esperadas.
- Investigación en modelos de decisión: comparar recetas de entrenamiento (número de decisiones, pasos de optimizador, datos retenidos) usando las mismas particiones de evaluación separadas por tarea.
- Inferencia en el borde o en CPU: al ser un encoder de 149,6 M parámetros con entradas de 4.096 tokens, puede desplegarse en entornos con recursos limitados como clasificador de decisiones de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica únicamente los tamaños de los conjuntos de evaluación retenidos, reportados por separado:

| Conjunto de evaluación | Decisiones evaluadas | Métrica reportada |
|---|---|---|
| Rutina de siguiente acción (next-action) | 1.158 | No disponible (sin cifra publicada) |
| Selección de herramienta (tool-selection) | 542 | No disponible (sin cifra publicada) |
| When2Call no vistas (unseen) | 3.652 | No disponible (sin cifra publicada) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 (149,6 M parámetros x 4 bytes) y del orden de 0,3 GB en fp16/bf16, sin contar activaciones ni caché de atención.
- GPU recomendadas: no requiere GPU de centro de datos. El entrenamiento documentado se hizo en una única NVIDIA A100 (2 h 10 min), pero la inferencia es viable en cualquier GPU moderna.
- GPU de consumo: cabe sin problema en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en CPU para cargas por lotes moderadas.
- Opciones de despliegue: transformers, text-embeddings-inference y endpoints compatibles, según las etiquetas del repositorio. No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible. El único dato temporal publicado corresponde al entrenamiento (996,9 segundos para 6.000 decisiones en 1.500 pasos en el replay de ML Intern).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernJEV-Decide-Preview | 149,6 M | 4.096 tokens | Clasificación y ranking de decisiones de agente | Apache 2.0 | HuggingFace (preview) |
| answerdotai/ModernBERT-base | 149 M (modelo base, según la información disponible) | No disponible en la información proporcionada | Encoder de propósito general | No disponible en la información proporcionada | HuggingFace |
| Alternativas de enrutamiento de herramientas basadas en LLM generativos | No disponible | No disponible | Selección de herramienta / function calling | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, por lo que la comparativa se limita a tamaño, licencia y tipo de tarea.

## Limitaciones y advertencias

- Estado experimental: el autor lo etiqueta explícitamente como "preview" y como prototipo pequeño de ranking de elecciones, no como una reproducción de Jev ni como un modelo listo para producción.
- No ejecuta acciones: el modelo solo puntúa y selecciona etiquetas; no genera argumentos de herramienta ni invoca herramientas.
- Idioma: entrenado y evaluado únicamente en inglés; no hay evidencia de comportamiento en castellano u otros idiomas.
- Contexto limitado: 4.096 tokens de entrada, lo que restringe conversaciones largas o catálogos de herramientas extensos.
- Riesgo de alucinación: no disponible como dato específico; al ser un clasificador de elecciones, el riesgo principal es seleccionar una etiqueta incorrecta del conjunto de candidatos proporcionado.
- Sesgos: no se documentan análisis de sesgo en la información disponible. El dataset de entrenamiento proviene de decisiones de agentes y puede heredar los sesgos de dichas trazas.
- Validación necesaria: la propia model card recomienda evaluar el modelo en el flujo de trabajo propio antes de adoptarlo, especialmente en el caso de ramificación de workflows.
- Licencia: Apache 2.0, lo que permite uso comercial, pero el estado preview implica ausencia de garantías de estabilidad o mantenimiento.
- Trazabilidad del entrenamiento: el proceso documentado incluyó intentos fallidos, correcciones automáticas de código y una terminación manual del operador en el replay, por lo que la reproducibilidad exacta no está garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MaziyarPanahi/ModernJEV-Decide-Preview
- Dataset de entrenamiento: https://huggingface.co/datasets/MaziyarPanahi/AgentToolDecisions-180K
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Perfil del autor en HuggingFace: https://huggingface.co/MaziyarPanahi
- Publicación del autor en X (coste y entrenamiento en A100): https://x.com/MaziyarPanahi/status/2105952801398419680
- Publicación del autor en X (presentación del modelo): https://x.com/MaziyarPanahi/status/2105654816399564912
- Publicación del autor en LinkedIn: https://www.linkedin.com/posts/maziyarpanahi_openai-just-launched-ai-decision-making-as-activity-7511439999662264321-bYfA
- HuggingChat (flujo ML Intern utilizado en el replay): https://huggingface.co/chat/
- Listado de modelos con etiqueta modernbert: https://huggingface.co/models?other=modernbert
