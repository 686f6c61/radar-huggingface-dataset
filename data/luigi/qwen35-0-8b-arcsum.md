# Luigi/qwen35-0.8b-arcsum

## Resumen

`Luigi/qwen35-0.8b-arcsum` es un agente de resumen de reuniones diseñado para ejecutarse en dispositivos locales (on-device), desarrollado por el usuario Luigi sobre la base del modelo Qwen3.5-0.8B de Alibaba Cloud. El modelo procesa transcripciones de reuniones en chino tradicional (zh-TW) en fragmentos de aproximadamente 2500 tokens, mantiene una memoria externa compuesta por dos estructuras (`ARC` y `POINTS`) a lo largo de los pasos de lectura, y emite un resumen fluido en chino tradicional. El sistema está entrenado para un protocolo de llamada a herramienta de un solo turno: cada paso de lectura genera una única llamada `update_memory` con argumentos `arc`, `add` o `drop`, y un harness externo aplica las ediciones de forma determinista.

El modelo tiene 772.845.888 parámetros (0,8 GB en formato GGUF) y se distribuye bajo licencia Apache-2.0. Su relevancia radica en que demuestra un enfoque de agente ligero para tareas de summarización con memoria externa, sin depender de la ventana de contexto completa del modelo base. Está pensado para entornos con recursos limitados, como teléfonos móviles, y ha sido evaluado en un teléfono Oppo Reno 7 con CPU únicamente. El checkpoint se sirve con llama.cpp usando la opción `--no-jinja`, y los resultados publicados corresponden a esa configuración específica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Gated Delta Networks + Gated Attention) basado en Qwen3.5-0.8B, solo torre de texto (el encoder de visión se elimina en la exportación) |
| Parametros totales | 772.845.888 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Modelo base: 262K tokens (según documentación externa de Qwen3.5-0.8B); el despliegue recomendado usa `-c 4096` en llama.cpp |
| Tipos de cuantizacion | Q8_0 (mencionado en la documentación); otros formatos no especificados |
| Idiomas soportados | Chino tradicional (zh-TW) como idioma de salida; inglés como material fuente (nunca como idioma de producto) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (y safetensors en el repositorio) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida que combina Gated Delta Networks y Gated Attention en un patrón repetido de 6 bloques `(3×DeltaNet→FFN→1×Attention→FFN)`. En este checkpoint, solo se utiliza la torre de texto; el encoder de visión se descarta durante la exportación. El head MTP (multi-token prediction) se restaura desde el checkpoint base antes de la conversión a GGUF, porque llama.cpp requiere esos 15 tensores en tiempo de carga aunque el entrenamiento nunca los modifica.

El entrenamiento se realizó sobre dos corpus: MeetingBank (reuniones derivadas) y 20 reuniones legislativas reales en chino tradicional. El protocolo de entrenamiento es específico para la tarea: cada paso de lectura recibe `(system, MEMORY + CHUNK)` y debe emitir una llamada a herramienta `update_memory` con argumentos `arc`, `add` o `drop`. El modelo nunca ve el historial de conversación; la memoria se mantiene externamente y se actualiza de forma determinista. No se han publicado detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Resumen de reuniones en chino tradicional (zh-TW) con memoria externa (`ARC` + `POINTS`) que se actualiza paso a paso.
- Protocolo de llamada a herramienta de un solo turno: cada paso de lectura emite una única llamada `update_memory` con argumentos `arc`, `add` o `drop`.
- Procesamiento por fragmentos de aproximadamente 2500 tokens, lo que permite manejar transcripciones largas sin depender de la ventana de contexto completa.
- Ejecución on-device en CPU, sin necesidad de GPU (evaluado en un Oppo Reno 7 con 8 núcleos).
- Generación de resúmenes fluidos en chino tradicional a partir de material fuente en inglés o chino.
- No soporta visión (el encoder se elimina), ni otros idiomas de salida distintos del chino tradicional.

## Casos de uso

- Actas de reuniones de juntas directivas en chino tradicional: el agente puede procesar transcripciones largas por fragmentos y mantener un resumen acumulativo con memoria externa, adecuado para entornos corporativos donde las reuniones superan la ventana de contexto del modelo.
- Resumen de sesiones legislativas: dado que el entrenamiento incluye reuniones legislativas reales zh-TW, el modelo es adecuado para generar resúmenes de debates parlamentarios, con la ventaja de ejecutarse en dispositivos locales sin conexión.
- Transcripción de llamadas de atención al cliente: el modelo puede resumir conversaciones de soporte en chino tradicional, extrayendo puntos clave y decisiones, y puede integrarse en sistemas de gestión de tickets.
- Resumen de entrevistas o podcasts en chino: al procesar el audio transcrito en fragmentos, el agente produce un resumen estructurado, útil para creadores de contenido o periodistas.
- Asistentes de productividad on-device: al ser ligero (0,8 GB) y ejecutable en CPU, puede integrarse en aplicaciones móviles de toma de notas o gestión de reuniones sin depender de la nube.
- Archivado y búsqueda de decisiones: la memoria externa (`ARC` y `POINTS`) permite mantener un registro de decisiones a lo largo de la reunión, facilitando la consulta posterior de acuerdos y puntos pendientes.

## Benchmarks y rendimiento

La model card publica resultados medidos sobre 40 reuniones hold-out derivadas de MeetingBank en chino tradicional, comparando el agente con un baseline map-reduce (mismo modelo, mismo tamaño de fragmento):

| Gate | Resultado |
|---|---|
| G2 faithfulness | PASS — 16 vs 58 inversiones, 40/40 pareado |
| G3 rouge1 | PASS — 28/12, +0,069, p=0,017 |
| G3 rouge2 | PASS — 29/11, +0,041, p=0,006 |
| G3 rougeL | PASS — 35/5, +0,057, p=0,000 |
| G4 latencia | PASS — 19,0 min/reunión medido en Oppo Reno 7 (CPU-only, Q8, 8 núcleos) frente a un techo de 20 min |
| ASR real zh-TW | 17/20 reuniones curadas |
| G1 revisión dentro de la reunión | FAIL — 5/27 en un probe independiente de 27 escenarios |

Además, el modelo base Qwen3.5-0.8B alcanza en modo thinking MMLU-Pro 66,5%, GPQA Diamond 51,6% y GPQA 11,9% (según documentación externa), aunque estos valores no corresponden a este checkpoint específico.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0,8 GB en Q8_0, cabe en cualquier GPU con al menos 1 GB de VRAM, aunque el despliegue recomendado es CPU-only.
- GPU recomendadas: no se requiere GPU; el modelo se ha evaluado en un Oppo Reno 7 con CPU de 8 núcleos. En caso de usar GPU, cualquier tarjeta consumer (RTX 3060 o superior) es suficiente.
- Opciones de despliegue: llama.cpp (llama-server) con la opción `--no-jinja` y `-c 4096`. También es posible usar Ollama u otros runners compatibles con GGUF, aunque la documentación solo valida llama.cpp.
- Latencia y throughput: 19,0 minutos por reunión en CPU (Oppo Reno 7, Q8, 8 núcleos), con un margen fino frente al techo de 20 minutos. En condiciones de contención de procesos, se midieron 21,6 minutos, por encima del presupuesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Luigi/qwen35-0.8b-arcsum | 772 M | 262K (base) / 4096 (despliegue) | Apache-2.0 | Resumen de reuniones zh-TW con agente y memoria externa |
| Qwen3.5-0.8B (base) | 0,8B | 262K | Apache-2.0 | Modelo multimodal generalista (texto + visión) |
| Baseline map-reduce (mismo modelo) | 772 M | 262K | Apache-2.0 | Resumen de reuniones sin agente, peor faithfulness y ROUGE |

El agente supera al baseline map-reduce en faithfulness (16 vs 58 inversiones) y en todas las métricas ROUGE, aunque con una tasa de claims por-claim ligeramente peor (5,7% vs 4,0%) debido a que afirma muchos menos claims (283 vs 1.467). No se dispone de comparativas con otros modelos de resumen de reuniones en chino tradicional.

## Limitaciones y advertencias

- La revisión dentro de la reunión falla (G1 FAIL): si una decisión se toma y luego se revierte en la misma reunión, el resumen puede reportar la decisión superada como actual. Los corpus de entrenamiento no contienen reversiones dentro de la reunión, por lo que esta capacidad no fue aprendible.
- El margen de latencia es fino: 19,0 minutos nominales, pero un teléfono con contención de procesos midió 21,6 minutos, superando el presupuesto de 20 minutos.
- La tasa de claims por-claim favorece al baseline (5,7% vs 4,0%); el agente gana en inversiones absolutas en parte porque afirma muchos menos claims.
- Solo soporta chino tradicional como idioma de salida; el inglés es material fuente pero nunca un idioma de producto.
- Existe una inconsistencia entre el entrenamiento (con template que añade ` thinking\n\n response`) y la evaluación (sin él). Los resultados publicados corresponden a la configuración `--no-jinja`; servir con `--jinja` produce un comportamiento diferente no validado.
- La generación depende de `cache_prompt: false`; el caché de prompt de llama.cpp cambia la salida (medido: 700 vs 167 caracteres con el mismo seed y temperatura).
- El modelo no soporta visión ni otros idiomas de salida.
- El repositorio tiene 0 descargas y 0 likes; es un modelo muy reciente (septiembre de 2026) con poca validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Luigi/qwen35-0.8b-arcsum
- Modelo relacionado (harness): https://huggingface.co/Luigi/voxsum-qwen35-0.8b-harness
- Modelo relacionado (voxsum): https://huggingface.co/Luigi/voxsum-qwen35-0.8b
- Documentación de Qwen3.5-0.8B (especificaciones y VRAM): https://apxml.com/models/qwen35-08b
- Guía de ejecución y benchmark de Qwen3.5 0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
