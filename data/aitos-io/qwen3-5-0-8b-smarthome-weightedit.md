# aitos-io/Qwen3.5-0.8B-SmartHome-WeightEdit

## Resumen

Qwen3.5-0.8B-SmartHome-WeightEdit es un modelo de generación de texto especializado en la traducción de peticiones de domótica (smart home) en llamadas a funciones (tool calling), construido por aitos-io a partir de Qwen/Qwen3.5-0.8B. La particularidad del modelo es su método de creación: no se ha entrenado con gradientes ni con un bucle de entrenamiento convencional, sino mediante edición directa de pesos en forma cerrada (closed-form weight editing). Concretamente, se han modificado 2.097.152 pesos (el 0,28 % del total) en las proyecciones de salida de las capas MLP 15, 17, 19 y 21.

El modelo transforma conversaciones multi-turno de domótica en llamadas a seis herramientas concretas: `toggle_lights`, `set_thermostat`, `lock_door`, `get_device_status`, `set_scene` e `intent_unclear`. El esquema de herramientas y el system prompt proceden de distil-labs/distil-home-assistant-qwen3 (Apache-2.0) y se reutilizan sin cambios. El modelo base Qwen3.5-0.8B es multimodal, pero esta release contiene únicamente el modelo de lenguaje (`Qwen3_5ForCausalLM`), sin el codificador de visión.

Es relevante ahora porque demuestra hasta dónde puede llegar la edición de pesos sin entrenamiento: sobre el modelo base sin editar (72,0 % de precisión en el test oficial) consigue 82,0 %, acercándose parcialmente a una referencia afinada con gradientes (92,0 %). Es un caso de estudio sobre intervención quirúrgica en modelos pequeños para tareas de tool calling acotadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5, familia `qwen3_5_text`), edición sobre capas MLP 15, 17, 19 y 21 |
| Parametros totales | 752.393.024 (~0,75 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (release en safetensors; repo de 1,5 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. La edición se realizó de forma cerrada y protegida: para cada una de las capas 15, 17, 19 y 21 se forzaron las respuestas gold sobre datos de práctica, se recogieron las activaciones de entrada de la MLP en las posiciones donde el modelo falla (claves K) y el desplazamiento del estado oculto que haría que el token gold superase a su competidor más fuerte (valores R). A partir de ahí se resolvió ΔW = Rᵀ K (KᵀK + λ·n·C)⁻¹, donde C es la covarianza de activaciones de posiciones que no deben cambiar: respuestas ya correctas (ponderadas 8×), tokens de prompt, texto ordinario (WikiText-2) y preguntas de cultura general (ARC-Easy train, ponderadas 4×). Cada edición de capa se aplica con dosis 0,85 antes de resolver la siguiente.

El diagnóstico previo mostró que el modelo sin editar falla sobre todo en unos pocos tokens de decisión: el nombre de la función (por ejemplo, responder `lock_door` en lugar de `get_device_status` a «is the front door locked?»), los rechazos (`intent_unclear`) y el formato de salida. Las sondas lineales indican que la intención del usuario es decodificable al 100 % desde capas intermedias, mientras que la salida solo es correcta el 66 % de las veces en datos de práctica: un obstáculo de decisión, no una capacidad ausente. Se aplicaron compuertas de aceptación: una edición se conserva solo si la precisión de práctica sube ≥ 2 puntos, las categorías ya correctas no bajan, la KL media en texto ordinario se mantiene ≤ 0,03 y ARC-Easy cae ≤ 2 puntos. Los datos de práctica consisten en 240 casos de plantilla más 300 casos diversos escritos por un agente independiente, con una verificación de dosis y compuertas sobre un conjunto separado de 120 casos.

## Capacidades

- Generación de texto conversacional multi-turno orientada a domótica.
- Tool calling / function calling con seis herramientas: `toggle_lights`, `set_thermostat`, `lock_door`, `get_device_status`, `set_scene` e `intent_unclear`.
- Mantiene el formato nativo de tool calls de Qwen3.5 (`<function=...><parameter=...>`); el parser de evaluación acepta también llamadas en JSON.
- Detección de intención no clara mediante la herramienta `intent_unclear`.
- Razonamiento general básico preservado parcialmente (ARC-Easy 86,0 %).
- Capacidades multilingües limitadas al inglés (idioma declarado: `en`).
- No incluye capacidades de visión en esta release, pese a que el modelo base es multimodal.
- No se documenta soporte de agentes multi-paso ni modo thinking más allá del uso de `enable_thinking=False` en el ejemplo de la model card.

## Casos de uso

- Asistente de domótica por voz o chat: el modelo convierte peticiones como «is the front door locked?» en la llamada correcta (`get_device_status`), gestionando conversaciones multi-turno con el system prompt y el esquema de herramientas de distil-labs.
- Integración en pipelines de automatización del hogar: las llamadas generadas pueden enrutarse directamente a una capa de ejecución (Home Assistant u otro hub) que ejecute `toggle_lights`, `set_thermostat` o `set_scene`.
- Control de escenas y climatización: peticiones como ajustar temperatura o activar una escena se traducen a `set_thermostat` y `set_scene` con argumentos estructurados.
- Seguridad del hogar: consultas de estado de puertas y cerraduras se mapean a `lock_door` o `get_device_status`, con la herramienta `intent_unclear` como salvaguarda cuando la petición es ambigua.
- Despliegue en dispositivos de borde: con ~0,75 B parámetros y pesos safetensors, es candidato para inferencia local en hardware modesto (siempre que se cuantice, dato no publicado).
- Investigación sobre edición de pesos: sirve como referencia reproducible para estudiar intervenciones cerradas en MLP y evaluar su efecto en tool calling frente a fine-tuning.
- Evaluación de robustez de parsers de tool calls: al conservar el formato nativo de Qwen3.5 y aceptar JSON, útil para probar capas de parsing en producción.

## Benchmarks y rendimiento

| Precisión de tool call (IC 95 %) | Este modelo | Qwen3.5-0.8B sin editar | distil-home-assistant-qwen3 (referencia afinada) |
|---|---|---|---|
| Test oficial (distil-smart-home `test.jsonl`, n=50) | 82,0 % (69,2 %–90,2 %) | 72,0 % (58,3 %–82,5 %) | 92,0 % (81,2 %–96,8 %) |
| Conjunto semilla oficial (`train.jsonl`, n=50) | 92,0 % (81,2 %–96,8 %) | 74,0 % (60,4 %–84,1 %) | 98,0 % (89,5 %–99,6 %) |
| Conjunto independiente C (n=120) | 87,5 % (80,4 %–92,3 %) | 61,7 % (52,7 %–69,9 %) | 90,0 % (83,3 %–94,2 %) |
| Conjunto de práctica B (n=120) | 87,5 % (80,4 %–92,3 %) | 65,0 % (56,1 %–72,9 %) | 98,3 % (94,1 %–99,5 %) |

| Capacidad general | Este modelo | Qwen3.5-0.8B sin editar | Referencia afinada |
|---|---|---|---|
| ARC-Easy (200 preguntas, respuesta por letra) | 86,0 % | 84,0 % | 36,0 % |
| Perplejidad WikiText-2 (40 párrafos) | 32,45 | 31,94 | 48,16 |

El test oficial no se usó en ninguna decisión durante la edición; se evaluó una sola vez sobre el modelo final. El conjunto C fue escrito por un agente independiente sin acceso al código de edición ni a los datos de práctica. Los intervalos son Wilson al 95 %; los conjuntos oficiales son pequeños (50 ítems), por lo que diferencias de pocos puntos están dentro del ruido. La referencia afinada se construyó sobre otra base (Qwen3-0.6B) y se incluye solo como indicación de lo que alcanza el entrenamiento específico sobre los mismos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~0,75 B parámetros en safetensors el repo ocupa 1,5 GB, por lo que en fp32/fp16 requiere del orden de 3 GB o menos, pero no se publican cifras de cuantización.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4090) debería alojarlo, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente sí por tamaño, sin cifras publicadas de VRAM ni latencia.
- Opciones de despliegue: `transformers` (requiere una versión reciente con soporte Qwen3.5); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool-call (test oficial) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aitos-io/Qwen3.5-0.8B-SmartHome-WeightEdit | 752 M | no disponible | 82,0 % | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base sin editar) | ~0,8 B | no disponible | 72,0 % | Apache-2.0 (según model card) | Hugging Face |
| distil-labs/distil-home-assistant-qwen3 (referencia afinada) | base Qwen3-0.6B | no disponible | 92,0 % | Apache-2.0 | Hugging Face |

La comparación principal es frente al modelo base y a la referencia afinada sobre los mismos datos y esquema; no se dispone de datos de otros modelos de domótica comparables en la información proporcionada.

## Limitaciones y advertencias

- Cubre solo las seis herramientas y los valores de habitación, puerta y escena del esquema distil-smart-home.
- Los conjuntos de práctica y held-out fueron generados por agentes de IA (plantillas y escritura libre), no recogidos de usuarios reales.
- Los conjuntos de evaluación son pequeños; los puntos porcentuales deben tratarse con cautela.
- La referencia afinada con gradientes sigue siendo más precisa (92,0 % frente a 82,0 % en test oficial): la edición no sustituye al entrenamiento específico.
- Solo se editó y evaluó el modelo de lenguaje; no hay codificador de visión en esta release pese a que la base es multimodal.
- Idioma limitado al inglés.
- Riesgo de alucinación y de elección errónea de herramienta en peticiones ambiguas, mitigado parcialmente por `intent_unclear`.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el esquema y el system prompt reutilizados deben conservar la atribución a distil-labs.
- Requiere una versión reciente de `transformers` con soporte Qwen3.5; no hay garantías de compatibilidad con runtimes alternativos.

## Enlaces

- Hugging Face: https://huggingface.co/aitos-io/Qwen3.5-0.8B-SmartHome-WeightEdit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Referencia de esquema y system prompt: https://huggingface.co/distil-labs/distil-home-assistant-qwen3
