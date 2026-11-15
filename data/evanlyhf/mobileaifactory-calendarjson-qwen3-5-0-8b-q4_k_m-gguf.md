# evanlyhf/MobileAIFactory-CalendarJSON-Qwen3.5-0.8B-Q4_K_M-GGUF

## Resumen

MobileAIFactory-CalendarJSON-Qwen3.5-0.8B-Q4_K_M-GGUF es un modelo de lenguaje especializado en la extracción de eventos de calendario a partir de lenguaje natural. Lo desarrolla Mobile AI Factory (autores Evan Li, Krishna Deshpande, Wen Cheng y Shyamnath Gollakota) mediante un ajuste fino con LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, seguido de una fusión de pesos y cuantización a Q4_K_M en formato GGUF. El resultado es un artefacto de 0,54 GB pensado para ejecutarse en un teléfono móvil con llama.cpp.

El modelo resuelve un problema muy concreto: transformar una petición de usuario en lenguaje natural (por ejemplo, "recuérdame ver a Christopher Robin el próximo sábado a las 8") en una llamada de función estructurada `calendar.events.insert` con argumentos JSON válidos, resolviendo fechas relativas contra una fecha y hora de referencia. No es un modelo de propósito general, sino un SLM (small language model) de tarea única entrenado y evaluado con un prompt exacto y decodificación greedy.

Con 772.845.888 parámetros totales, contexto configurable (el ejemplo de uso fija 4096 tokens) y licencia Apache-2.0, es relevante para quienes investigan despliegue de modelos en dispositivo, function calling de bajo coste y pipelines de destilación de tareas específicas sobre modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-0.8B), ajuste fino LoRA fusionado |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma oficial; el ejemplo de ejecución usa n_ctx=4096 |
| Tipos de cuantizacion | Q4_K_M (4 bits), GGUF de 0,54 GB |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `mobile-ai-factory-calendar-json-qwen3.5-0.8b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 773 millones de parámetros. Sobre él se aplica un ajuste fino con LoRA que posteriormente se fusiona en los pesos base, y el resultado se cuantiza a Q4_K_M para producir un GGUF de 0,54 GB ejecutable con llama.cpp. El proceso de construcción lo describe el sistema Mobile AI Factory como un bucle agéntico: un LLM orquestador decide si ajustar hiperparámetros, minar datos reales o generar ejemplos sintéticos, reglas fijas revierten cambios que empeoran la precisión y la búsqueda escala de modelos pequeños a grandes usando mediciones reales del teléfono objetivo.

Los datos de entrenamiento combinan el dominio de recordatorios de TOPv2 (CC BY-SA 4.0) y los frames `Calendar_1` / `AddEvent` de Schema-Guided Dialogue (CC BY-SA 4.0), convertidos a llamadas de calendario, junto con filas sintéticas escritas y verificadas por un LLM profesor (Claude Sonnet 5) durante la búsqueda. El modelo se entrenó y puntuó con un prompt único y exacto: instrucción de tarea en un turno de usuario ChatML, seguido de un turno de asistente con bloque de pensamiento vacío (thinking desactivado), decodificación greedy, parada en `<|im_end|>` y hasta 256 tokens nuevos. No se documentan fases de RLHF o DPO en la información disponible.

## Capacidades

- Extracción de eventos de calendario: convierte peticiones en lenguaje natural en una llamada `calendar.events.insert` con argumentos JSON (`summary`, `start`, `end`, `location`).
- Resolución de fechas y horas relativas contra una fecha y hora de referencia proporcionada en el prompt (por ejemplo, "next saturday at 8 am" a una marca ISO-8601 concreta).
- Aplicación de reglas de duración por defecto (60 minutos si no se indica duración) y de hora por defecto (09:00 si se da día sin hora, 20:00 para "tonight").
- Salida estrictamente JSON: un array de llamadas, o `[]` si ninguna función aplica, sin prosa ni Markdown.
- Function calling guiado por esquema: el prompt incluye la lista de funciones disponibles con sus parámetros y descripciones.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Modo thinking: soportado en el formato de prompt (bloque `<think>` vacío), pero entrenado con thinking desactivado.
- No se documentan capacidades de visión, audio, agentes multi-paso ni razonamiento general.

## Casos de uso

- Asistentes de calendario en aplicaciones móviles: el usuario dicta "comida con Marta el viernes a las 14:00" y el modelo emite la llamada `calendar.events.insert` con fechas ISO-8601 resueltas, listo para ejecutarse contra la API de Google Calendar.
- Recordatorios por voz en el teléfono: integrado en una app Android basada en llama.cpp, procesa la transcripción del usuario y genera el JSON de la llamada sin salir del dispositivo, preservando la privacidad de los datos de agenda.
- Automatización de notas y correos: extracción de eventos implícitos en texto libre (por ejemplo, confirmaciones de reunión recibidas por correo) para crear entradas de calendario de forma automática.
- Pruebas de concepto de function calling en dispositivo: sirve como referencia para medir latencia y precisión de un SLM de 0,8B cuantizado ejecutando una tarea estructurada concreta en hardware móvil.
- Destilación de tareas específicas: ejemplo reproducible de cómo un pipeline agéntico (Mobile AI Factory) convierte un modelo base pequeño en un especialista de tarea única con datos reales y sintéticos.
- Investigación en evaluación de SLM: el conjunto de evaluación congelado de 535 filas y la métrica de coincidencia de argumentos AST permiten reproducir y comparar variantes de ajuste fino y cuantización.
- Componente en pipelines de agentes: la salida JSON estricta puede alimentar un ejecutor de herramientas que valide el esquema antes de invocar la API de calendario.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| AST argument match | 0,811 | Conjunto de evaluación congelado del run, 535 filas |
| Mejora sobre el primer fine-tune | +0,277 | Diferencia absoluta frente a la primera iteración de ajuste |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1,0 GB con la cuantización Q4_K_M (archivo de 0,54 GB más overhead de contexto y KV cache); con contexto de 4096 tokens el consumo adicional de KV cache es reducido dado el tamaño del modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo está pensado para CPU móvil y no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4090) con enorme margen; también en CPU de teléfono.
- Opciones de despliegue: llama.cpp (referencia oficial del autor), `llama-cpp-python`, y cualquier aplicación móvil basada en llama.cpp; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| MobileAIFactory-CalendarJSON-Qwen3.5-0.8B-Q4_K_M | 772.845.888 | no disponible (ejemplo con 4096) | Extraccion de eventos de calendario | Apache-2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Proposito general | no disponible en esta ficha | safetensors |
| Modelos de function calling de ~1B | no disponible | no disponible | Function calling general | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Modelo de tarea única: está entrenado y evaluado con un prompt exacto y un esquema de función concreto; cambiar el formato del prompt, el esquema o el idioma degrada la calidad de forma no medida.
- Solo inglés: no soporta castellano ni otros idiomas según la model card.
- Riesgo de alucinación: puede generar fechas, horas o argumentos plausibles pero incorrectos, especialmente con expresiones temporales ambiguas; conviene validar el JSON contra el esquema antes de ejecutar la llamada.
- Sesgos: no se documentan análisis de sesgo; los datos provienen de TOPv2 y Schema-Guided Dialogue, con posible sesgo de dominio y de estilo de anotación.
- Restricciones de licencia: el modelo es Apache-2.0, pero los datasets de origen son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartición sobre datos derivados.
- Dependencia de la fecha de referencia: la resolución de fechas relativas depende de que el prompt incluya la fecha y hora actuales correctas; un error en ese campo produce eventos mal fechados.
- Thinking desactivado: el bloque `<think>` se entrena vacío; no debe esperarse razonamiento explícito del modelo.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evanlyhf/MobileAIFactory-CalendarJSON-Qwen3.5-0.8B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper: https://arxiv.org/abs/2611.13509
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.13509
- Código: https://github.com/evanly-gh/SLM_Factory
- Dataset TOPv2: https://huggingface.co/datasets/WillHeld/top_v2
- Dataset Schema-Guided Dialogue: https://huggingface.co/datasets/google-research-datasets/schema_guided_dstc8
