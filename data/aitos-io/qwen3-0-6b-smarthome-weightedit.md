# aitos-io/Qwen3-0.6B-SmartHome-WeightEdit

## Resumen

Qwen3-0.6B-SmartHome-WeightEdit es un modelo de generación de texto derivado de Qwen/Qwen3-0.6B, desarrollado por aitos-io, especializado en la conversión de peticiones de domótica multi-turno en llamadas a herramientas (tool calling). Su particularidad es el método de construcción: no se ha entrenado con gradientes ni bucles de entrenamiento, sino mediante una edición cerrada de pesos (closed-form weight editing) que modifica 2.097.152 pesos, un 0,35% del total, en las proyecciones de salida de las capas MLP 18, 20, 22 y 24.

El modelo resuelve un problema concreto: un modelo general pequeño como Qwen3-0.6B falla sistemáticamente en pocos tokens de decisión (nombre de la función, rechazos y formato de salida) aunque la intención del usuario es decodificable con un 99% de precisión en capas intermedias. La edición convierte esa capacidad latente en salida correcta sin degradar el comportamiento general del modelo base.

Es relevante porque demuestra que técnicas de edición de pesos sin entrenamiento pueden recuperar buena parte del rendimiento de un fine-tuning supervisado en tareas acotadas, con un coste computacional mínimo y un impacto mucho menor sobre las capacidades generales del modelo. El modelo base aporta la arquitectura transformer de Qwen3 con 596 millones de parámetros y licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con edición de pesos en MLP |
| Parámetros totales | 596.049.920 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repo en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only denso de 596 millones de parámetros. No hay entrenamiento con gradientes: la adaptación se realiza mediante una edición de pesos en forma cerrada (closed-form protected edit) sobre las proyecciones de salida de las capas MLP 18, 20, 22 y 24. Para cada capa se fuerza al modelo a producir las respuestas correctas sobre datos de práctica, se recogen las activaciones de entrada a la MLP en las posiciones donde el modelo falla (claves K) y el desplazamiento del estado oculto necesario para que el token correcto supere a su competidor más fuerte (valores R), y se resuelve ΔW = Rᵀ K (KᵀK + λ·n·C)⁻¹, donde C es la covarianza de activaciones de posiciones que no deben cambiar: respuestas ya correctas (ponderadas ×4), tokens de prompt, texto ordinario (WikiText-2) y preguntas de cultura general (ARC-Easy train, ponderadas ×4).

Cada capa editada modifica 512 de 3.072 neuronas MLP y la edición se aplica con una dosis de 0,85 antes de resolver la siguiente capa. Se aplican compuertas de calidad: una edición solo se conserva si la precisión en práctica sube al menos 2 puntos, las categorías ya correctas no caen, la divergencia KL media en texto ordinario se mantiene ≤ 0,03 y ARC-Easy no baja más de 2 puntos. Los datos de práctica son 240 casos de plantilla más 300 casos diversos escritos por un agente independiente, con una validación separada de 120 casos. El esquema de herramientas y el prompt de sistema provienen de distil-labs/distil-home-assistant-qwen3 (Apache-2.0) y se usan sin cambios.

## Capacidades

- Generación de texto conversacional multi-turno en inglés orientada a domótica.
- Tool calling / function calling con seis herramientas: `toggle_lights`, `set_thermostat`, `lock_door`, `get_device_status`, `set_scene` e `intent_unclear`.
- Resolución de intenciones ambiguas mediante la herramienta de rechazo `intent_unclear`.
- Manejo de valores de habitación, puerta y escena definidos en el esquema distil-smart-home.
- Formato de salida estructurado compatible con el esquema de herramientas del modelo de referencia.
- Modo sin thinking (`enable_thinking=False`) en la plantilla de chat.
- Capacidades generales de lenguaje heredadas del modelo base (ARC-Easy 66,5%, perplejidad WikiText-2 de 46,88).

## Casos de uso

- Asistente de voz para el hogar: el modelo traduce peticiones como "is the front door locked?" en una llamada a `get_device_status` con el dispositivo correcto, adecuado para integrarse en un pipeline de ASR + LLM + ejecutor de acciones.
- Automatización de rutinas domésticas: interpreta peticiones multi-turno para activar escenas (`set_scene`) combinando contexto de la conversación previa.
- Control de climatización por lenguaje natural: convierte "put the living room at 21 degrees" en una llamada a `set_thermostat` con los parámetros de habitación y temperatura.
- Gestión de acceso y cerraduras: distingue entre consultar el estado de una puerta y accionar la cerradura, evitando confusiones entre `lock_door` y `get_device_status`.
- Prototipado rápido de asistentes IoT: al requerir solo 1,2 GB de repo y ser desplegable con transformers, sirve para validar flujos de tool calling en entornos de desarrollo sin infraestructura de GPU grande.
- Investigación en edición de pesos: como caso de estudio reproducible de closed-form model editing aplicado a una tarea de function calling concreta.
- Filtro de intención en sistemas de domótica: la herramienta `intent_unclear` permite derivar peticiones fuera de dominio a un humano o a otro modelo.

## Benchmarks y rendimiento

Precisión en tool calling (intervalos de confianza Wilson al 95%):

| Conjunto | Este modelo | Qwen3-0.6B sin editar | distil-home-assistant-qwen3 (fine-tuned) |
|---|---|---|---|
| Test oficial (test.jsonl, n=50) | 78,0% (64,8%–87,2%) | 66,0% (52,2%–77,6%) | 92,0% (81,2%–96,8%) |
| Seed oficial (train.jsonl, n=50) | 84,0% (71,5%–91,7%) | 68,0% (54,2%–79,2%) | 98,0% (89,5%–99,6%) |
| Held-out independiente C (n=120) | 78,3% (70,1%–84,8%) | 48,3% (39,6%–57,2%) | 90,0% (83,3%–94,2%) |
| Práctica B (n=120) | 85,8% (78,5%–91,0%) | 55,8% (46,9%–64,4%) | 98,3% (94,1%–99,5%) |

Capacidad general:

| Métrica | Este modelo | Qwen3-0.6B sin editar | distil-home-assistant-qwen3 (fine-tuned) |
|---|---|---|---|
| ARC-Easy (200 preguntas, respuesta por letra) | 66,5% | 67,5% | 36,0% |
| Perplejidad WikiText-2 (40 párrafos) | 46,88 | 46,43 | 48,16 |

El conjunto de test oficial no se usó en ninguna decisión durante la edición y se evaluó una sola vez sobre el modelo final. El conjunto C fue escrito por un agente independiente sin acceso al código de edición ni a los datos de práctica. Los conjuntos oficiales son pequeños (50 ítems), por lo que diferencias de pocos puntos quedan dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,2 GB de pesos más overhead de activaciones y caché KV; en la práctica cabe en GPUs consumer con 4 GB o más.
- En cuantización de 8 bits: alrededor de 0,6 GB de pesos; en 4 bits, alrededor de 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para prototipado.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers (soporte nativo del repo), text-generation-inference (tag `text-generation-inference`), llama.cpp y Ollama mediante conversión a GGUF, vLLM mediante conversión de pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool-call accuracy (test oficial) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-SmartHome-WeightEdit | 596 M | No disponible | 78,0% | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base sin editar) | 596 M | No disponible | 66,0% | Apache-2.0 | Hugging Face |
| distil-labs/distil-home-assistant-qwen3 (fine-tuned) | No disponible | No disponible | 92,0% | Apache-2.0 | Hugging Face |

El modelo editado supera al base en 12 puntos en el test oficial y en 30 puntos en el conjunto held-out independiente C, manteniendo capacidad general casi idéntica (ARC-Easy 66,5% frente a 67,5%). El modelo fine-tuned de referencia sigue siendo más preciso en la tarea (92,0% frente a 78,0%) pero degrada mucho más el comportamiento general (ARC-Easy 36,0%).

## Limitaciones y advertencias

- Cubre únicamente las seis herramientas y los valores de habitación, puerta y escena del esquema distil-smart-home; cualquier otra tarea queda fuera de su alcance.
- Los conjuntos de práctica y held-out fueron generados por agentes de IA (plantillas y escritura libre), no recogidos de usuarios reales, por lo que pueden no reflejar la distribución real de peticiones.
- Los conjuntos de evaluación son pequeños (50 ítems en los oficiales); los intervalos de confianza son amplios y las estimaciones puntuales deben interpretarse con cautela.
- El comportamiento fuera de la tarea solo se comprobó mediante WikiText-2 y ARC-Easy; no hay evaluación exhaustiva de otras capacidades.
- Riesgo de alucinación en peticiones ambiguas o fuera de dominio: el modelo puede emitir una llamada a herramienta incorrecta en lugar de `intent_unclear`.
- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero el esquema de herramientas y el prompt de sistema provienen de distil-labs/distil-home-assistant-qwen3, también Apache-2.0.
- No se especifica la longitud de contexto soportada; conviene verificar el límite del modelo base antes de usarlo en conversaciones largas.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitos-io/Qwen3-0.6B-SmartHome-WeightEdit
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo de referencia fine-tuned y origen del esquema: https://huggingface.co/distil-labs/distil-home-assistant-qwen3
