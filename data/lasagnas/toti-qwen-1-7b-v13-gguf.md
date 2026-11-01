# LasagnaS/toti-qwen-1.7b-v13-gguf

## Resumen

`toti-qwen-1.7b-v13-gguf` es un ajuste fino mediante LoRA del modelo Qwen3-1.7B de Alibaba, publicado por el usuario LasagnaS con el identificador `LasagnaS/toti-qwen-1.7b-v13-gguf`. El modelo está especializado en una única tarea vertical: actuar como motor de un chatbot de WhatsApp para la tienda de repostería Toti Cakery, gestionando llamadas a herramientas (tool calling) en indonesio e inglés y respondiendo preguntas frecuentes a partir de contexto recuperado por RAG. El autor del dataset y del proyecto de referencia es Kevin Ilham Ramadhan, cuyo repositorio `Chatbot-Cakery` aloja los datos de entrenamiento de la revisión v13.

La relevancia de esta ficha no reside en su rendimiento generalista, sino en el caso de estudio que documenta: cómo un modelo de 1.720.574.976 parámetros puede pasar de una precisión de selección de herramienta del 18,8 % a un 86,8 % tras un ajuste fino supervisado de apenas 236,6 minutos sobre un conjunto de datos específico de dominio. El autor publica métricas de evaluación antes y después del entrenamiento sobre un split de test de 239 filas, lo que permite auditar el proceso con un nivel de detalle poco habitual en modelos de este tamaño.

El artefacto distribuido es una cuantización GGUF Q4_K_M (1,1 GB de repositorio) pensada para ejecutarse con Ollama, lo que lo sitúa en el rango de modelos desplegables en hardware de consumo. La licencia es Apache 2.0, heredada del modelo base Qwen3-1.7B, y el modelo conserva la arquitectura transformer densa del original sin modificaciones estructurales: el ajuste fino solo altera los pesos mediante LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B, sin modificaciones estructurales; ajuste fino LoRA) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-1.7B, valor no confirmado en la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada en el repositorio) |
| Idiomas soportados | Indonesio e ingles (segun la model card y las metricas de `wrong_language_rate`); no se documentan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion Q4_K_M) |
| Modelo base | unsloth/Qwen3-1.7B |
| Tamano del repositorio | 1,1 GB |
| Fecha de publicacion | 2026-10-25 |
| Descargas | 86 |
| Tags | gguf, ollama, tool-calling, toti-cakery |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1.720.574.976 parámetros distribuido por Unsloth en formato compatible con su pipeline de ajuste fino. Sobre esa base se aplica un LoRA (Low-Rank Adaptation) entrenado con el dataset de tool calling de Toti Cakery, revisión v13, alojado en el repositorio `github.com/kevinilhamramadhan/Chatbot-Cakery`, en la ruta `finetune/data/`. No se documentan en la model card ni el rango del LoRA, ni el número de tokens de entrenamiento, ni la composición exacta del dataset más allá de su naturaleza (llamadas a herramientas, respuestas FAQ desde contexto RAG, escenarios conversacionales etiquetados de N1 a N18 y de T1 a T27).

El entrenamiento completo duró 236,6 minutos según el autor. La evaluación se realizó sobre el split `test` del mismo dataset (239 filas), con los prompts exactos que el chatbot envía en producción, temperatura de muestreo 0,7, top_p 0,8 y un límite de 192 tokens por respuesta. Los resultados se detallan en el fichero `hasil_metrik_v13.json`, referenciado pero no enlazado directamente en el README. La innovación técnica destacable no es arquitectónica sino metodológica: el autor publica una comparativa antes/después por tipo de escenario, lo que permite identificar exactamente en qué categorías el ajuste fino mejora y en cuáles degrada el comportamiento (por ejemplo, la precisión de respuestas FAQ ancladas al contexto cae del 86,7 % al 66,7 %, mientras que la honestidad ante contextos sin respuesta sube del 0 % al 75 %).

## Capacidades

- Generación de texto conversacional en indonesio e inglés, con cambio de idioma controlado (la tasa de respuestas en idioma incorrecto baja del 31,6 % al 0 % tras el ajuste fino).
- Tool calling / function calling: selección de herramienta con una precisión del 86,8 % y coincidencia exacta de parámetros del 77,1 % sobre el split de test.
- Respuestas FAQ ancladas a contexto RAG, con una precisión del 66,7 % en la inclusión de hechos del contexto proporcionado.
- Reconocimiento de contextos sin respuesta: 75 % de acierto al admitir que no dispone de la información, frente al 0 % del modelo base.
- Gestión de escenarios conversacionales etiquetados: saludos, agradecimientos, preguntas ambiguas, quejas, negociación, consultas fuera de tema y peticiones de informes reservadas al propietario.
- Consulta de menú y catálogo: listado de productos, filtrado por categoría, detalle de producto, comparación entre productos y gestión de pedidos de uno o varios artículos.
- Operaciones transaccionales: estado de pedido, cancelación, reclamación de pago, reenvío de métodos de pago y consulta de contenido del carrito.
- Funciones de administración para el rol de propietario: informes financieros y analíticas.
- Resistencia a inyección de prompt y a solicitudes de información reservada o meta (escenarios N7, con resultado del 100 % antes y después).
- No se documentan capacidades de visión, audio, modo thinking explícito ni razonamiento multi-paso generalista más allá del encadenamiento implícito en las llamadas a herramientas.

## Casos de uso

- Atención al cliente automatizada en WhatsApp para una tienda de repostería: el modelo gestiona conversaciones multi-turno en indonesio e inglés, distingue entre consultas que requieren llamada a herramienta y conversación libre, y mantiene el idioma de la sesión del cliente. Es adecuado por su tasa de falsos positivos en tool calling del 7,4 %, dentro del umbral del 10 % fijado por el autor.
- Consulta de catálogo y menú: responde listados de productos, filtrados por categoría, detalles y comparaciones. Los escenarios T1 a T4 pasan de precisiones entre 0 % y 29 % en el modelo base a entre 75 % y 100 % tras el ajuste, lo que lo hace viable para esta función concreta.
- Gestión de pedidos: procesa pedidos de uno o varios productos (T5: 94 %, T6: 75 %), consulta el estado de un pedido (T8: 67 %) y gestiona cancelaciones (T9: 100 %).
- Resolución de dudas sobre pagos: reenvía métodos de pago (T16: 100 %), gestiona cambios de método (N11: 100 %) y atiende reclamaciones de pago ya realizado (T13: 100 %). Es el tipo de tarea donde el ajuste fino aporta la mayor mejora respecto al modelo base.
- Filtrado de consultas fuera de alcance: rechaza peticiones de información reservada, intentos de inyección de prompt y consultas ajenas al negocio (N4, N7 y N10 con 100 % de acierto), lo que reduce la superficie de riesgo en un despliegue público.
- Derivación a humano en casos no cubiertos: ante contextos sin respuesta, el modelo admite no saber (75 %) en lugar de inventar, lo que permite activar un flujo de escalado a un agente humano con menor riesgo de alucinación que el modelo base.
- Informes internos para el propietario: genera informes financieros y analíticas solo cuando el rol del usuario lo autoriza (T11 y T12 con 100 %), lo que lo hace apto para un panel de administración conversacional.
- Prototipado rápido de asistentes verticales: al ser un GGUF Q4_K_M de 1,1 GB ejecutable con `ollama pull hf.co/LasagnaS/toti-qwen-1.7b-v13-gguf:Q4_K_M`, sirve como plantilla para validar pipelines de tool calling en local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los datos provienen del split `test` del dataset de Toti Cakery (239 filas), con temperatura 0,7, top_p 0,8 y límite de 192 tokens. La comparación es entre el modelo base Qwen3-1.7B (sin ajuste) y el modelo ajustado (v13).

| Metrica | Significado | Antes | Despues | Objetivo | Estado |
|---|---|---:|---:|---|:---:|
| `function_selection_acc` | Filas con tool: selecciona la herramienta correcta | 0,188 | 0,868 | >= 0,85 | Cumple |
| `param_exact_acc` | Filas con tool: herramienta y argumentos exactos | 0,146 | 0,771 | >= 0,70 | Cumple |
| `irrelevance_acc` | Filas sin tool: no invoca herramienta | 0,958 | 0,926 | >= 0,85 | Cumple |
| `false_tool_rate` | Filas sin tool: invoca herramienta innecesariamente | 0,042 | 0,074 | <= 0,10 | Cumple |
| `invalid_call_rate` | Filas con tool: llamada con JSON ilegible | 0,049 | 0,000 | <= 0,05 | Cumple |
| `faq_grounded_acc` | FAQ: la respuesta contiene hechos del contexto | 0,867 | 0,667 | >= 0,70 | No cumple |
| `faq_jujur_acc` | FAQ: contexto sin respuesta, admite no saber | 0,000 | 0,750 | >= 0,70 | Cumple |
| `wrong_language_rate` | Respuesta en idioma distinto al de la sesión | 0,316 | 0,000 | <= 0,03 | Cumple |

Objetivos alcanzados: 7 de 8. Tiempo de entrenamiento: 236,6 minutos. Respuestas truncadas por el límite de 192 tokens: 145 antes, 0 después.

Resultados por tipo de escenario (selección de los más relevantes; el autor publica los 46 tipos en la model card):

| Tipo | Escenario | n | Antes | Despues | Diferencia |
|---|---|---:|---:|---:|---:|
| T1 | Menú | 7 | 0,29 | 1,00 | +0,71 |
| T2 | Menú por categoría | 3 | 0,00 | 1,00 | +1,00 |
| T3 | Detalle de producto | 12 | 0,08 | 0,75 | +0,67 |
| T4 | Comparar productos | 4 | 0,00 | 1,00 | +1,00 |
| T5 | Pedido de un producto | 18 | 0,00 | 0,94 | +0,94 |
| T7 | Cantidad tras detalle | 6 | 0,00 | 1,00 | +1,00 |
| T11 | Informe financiero (propietario) | 3 | 0,33 | 1,00 | +0,67 |
| T12 | Analítica (propietario) | 3 | 0,00 | 1,00 | +1,00 |
| T13 | Reclamo de pago realizado | 4 | 0,25 | 1,00 | +0,75 |
| T16 | Reenvío de método de pago | 6 | 0,17 | 1,00 | +0,83 |
| N1 | FAQ desde contexto | 15 | 0,87 | 0,67 | -0,20 |
| N1x | Contexto sin respuesta | 4 | 0,00 | 0,75 | +0,75 |
| N11 | Cambio de método de pago | 4 | 0,25 | 1,00 | +0,75 |
| T10 | Tarta personalizada, derivar a admin | 3 | 0,00 | 0,00 | 0,00 |
| T14 | Quejas | 4 | 0,00 | 0,00 | 0,00 |
| T20 | No disponible | 5 | 0,00 | 0,00 | 0,00 |
| T21 | No disponible | 5 | 0,00 | 0,20 | +0,20 |
| T22 | No disponible | 4 | 0,00 | 0,25 | +0,25 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF Q4_K_M ocupa 1,1 GB, por lo que la inferencia requiere aproximadamente 1,5-2 GB de VRAM considerando overhead de contexto y caché KV.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para Q4_K_M; una RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) ofrecen margen amplio para contextos largos y concurrencia. En el segmento profesional, una A100 o H100 no aportan ventaja significativa para un modelo de este tamaño y quedarían infrautilizadas.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM. También es viable en CPU con llama.cpp, con latencias mayores pero funcionales para un chatbot de bajo volumen.
- Opciones de despliegue: `ollama pull hf.co/LasagnaS/toti-qwen-1.7b-v13-gguf:Q4_K_M` (método documentado por el autor); llama.cpp para carga directa del GGUF; vLLM y TGI requerirían convertir los pesos a safetensors, no incluidos en este repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El límite de 192 tokens por respuesta en producción sugiere un diseño orientado a respuestas cortas y baja latencia, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| toti-qwen-1.7b-v13 (este) | 1.720.574.976 | No disponible | Tool calling vertical para Toti Cakery, indonesio/inglés | Apache 2.0 | GGUF Q4_K_M en HuggingFace |
| Qwen3-1.7B (base) | 1.720.574.976 | No disponible | Modelo generalista multilingüe | Apache 2.0 | Safetensors, GGUF en múltiples repositorios |
| unsloth/Qwen3-1.7B | 1.720.574.976 | No disponible | Distribución optimizada del base para ajuste fino | Apache 2.0 | Safetensors en HuggingFace |

La comparación con alternativas de la misma categoría (modelos de ~1-2 B especializados en tool calling para atención al cliente) no está disponible en la información proporcionada. El modelo base Qwen3-1.7B es la referencia directa y la única comparación con datos cuantitativos publicados por el autor.

## Limitaciones y advertencias

- El modelo está especializado en un dominio muy concreto (chatbot de Toti Cakery). Su uso fuera de ese contexto producirá un rendimiento degradado y posiblemente llamadas a herramientas inexistentes o respuestas incoherentes.
- La precisión de respuestas FAQ ancladas al contexto cae del 86,7 % al 66,7 % tras el ajuste fino, por debajo del objetivo del 70 %. Es la única métrica que no cumple el umbral fijado por el autor y supone un riesgo de respuestas parcialmente incorrectas en consultas RAG.
- La tasa de llamadas a herramienta innecesarias sube del 4,2 % al 7,4 %, dentro del umbral pero indicando una ligera sobreactivación del tool calling.
- Los escenarios T10 (tarta personalizada), T14 (quejas) y T20 no mejoran en absoluto tras el ajuste (0 % antes y después), lo que indica que el dataset de entrenamiento no cubre adecuadamente esos casos. Cualquier despliegue en producción debe gestionar estas rutas con lógica externa o derivación a humano.
- El modelo solo está evaluado en indonesio e inglés. No hay evidencia de comportamiento correcto en castellano u otros idiomas; la tasa de idioma incorrecto del 0 % se refiere únicamente a esos dos idiomas.
- Riesgo de alucinación en respuestas FAQ: aunque la honestidad ante contextos sin respuesta mejora al 75 %, un 25 % de los casos sigue generando respuestas no fundamentadas.
- El límite de 192 tokens por respuesta en la evaluación implica que el modelo no ha sido validado para respuestas largas; el autor reporta 0 respuestas truncadas tras el ajuste, pero no se documenta comportamiento con límites superiores.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B y el dataset de Toti Cakery pueden tener sus propias condiciones que el usuario debe verificar por separado.
- Solo se distribuye la cuantización Q4_K_M; no hay versiones Q5, Q8 o de precisión completa en el repositorio, lo que limita la evaluación de la pérdida de calidad por cuantización.
- El repositorio tiene 86 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- La model card está redactada en indonesio y no documenta sesgos demográficos, de género o culturales del modelo base ni del ajuste fino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LasagnaS/toti-qwen-1.7b-v13-gguf
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-1.7B
- Repositorio del proyecto y dataset de entrenamiento: https://github.com/kevinilhamramadhan/Chatbot-Cakery
- Ruta del dataset de tool calling v13: `finetune/data/` dentro del repositorio anterior
- Fichero de métricas detalladas: `hasil_metrik_v13.json` (referenciado en la model card, no enlazado directamente)
- Comando de despliegue: `ollama pull hf.co/LasagnaS/toti-qwen-1.7b-v13-gguf:Q4_K_M`
