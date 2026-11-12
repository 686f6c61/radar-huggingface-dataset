# aitos-io/SmolLM2-360M-SmartHome-WeightEdit

## Resumen

SmolLM2-360M-SmartHome-WeightEdit es un modelo de lenguaje de 361,8 millones de parámetros desarrollado por aitos-io que convierte peticiones de domótica en llamadas a herramientas (tool calling). Se construye a partir de HuggingFaceTB/SmolLM2-360M-Instruct mediante edición directa de pesos en forma cerrada (closed-form weight editing), sin ningún bucle de entrenamiento ni descenso de gradiente. Concretamente, modifica 1.966.080 pesos (el 0,54% del total) en las proyecciones de salida de las capas MLP 21, 23, 25 y 27.

El modelo resuelve un problema acotado: transformar conversaciones multi-turno sobre dispositivos del hogar en invocaciones de seis herramientas (`toggle_lights`, `set_thermostat`, `lock_door`, `get_device_status`, `set_scene` e `intent_unclear`). El esquema de herramientas y el system prompt provienen del modelo distil-labs/distil-home-assistant-qwen3 (Apache-2.0), que se reutilizan sin cambios.

Su relevancia es fundamentalmente metodológica: demuestra cuánto puede moverse un modelo base débil solo con edición de pesos, elevando la precisión en el conjunto de test oficial del 24% al 66%. El propio autor advierte que la precisión absoluta sigue siendo modesta (aproximadamente una de cada tres peticiones se gestiona mal) y que no es apto para controlar dispositivos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2), edición de pesos en MLP de capas 21, 23, 25 y 27 |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (publicado en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-360M-Instruct. La intervención no consiste en un fine-tuning convencional, sino en una edición de pesos en forma cerrada sobre las proyecciones de salida de las capas MLP 21, 23, 25 y 27. El proceso parte de un diagnóstico: el modelo sin editar falla sobre todo en unos pocos tokens de decisión (el nombre de la función, los rechazos con `intent_unclear` y el formato de salida), mientras que las sondas lineales muestran que la intención del usuario es decodificable al 100% desde las capas intermedias. Es decir, el fallo es un obstáculo de representación, no una capacidad ausente.

Para cada capa se aplica teacher forcing sobre los datos de práctica, se recogen las activaciones de entrada a la MLP en las posiciones erróneas (claves K) y el desplazamiento del estado oculto que haría ganar al token correcto frente a su competidor más fuerte (valores R). Después se resuelve ΔW = Rᵀ K (KᵀK + λ·n·C)⁻¹, donde C es la covarianza de activaciones de posiciones que no deben cambiar: respuestas ya correctas (ponderadas 4×), tokens de prompt, texto ordinario (WikiText-2) y preguntas de cultura general (ARC-Easy train, ponderadas 4×). Cada edición se aplica con dosis 0,85 antes de resolver la siguiente capa. Solo se conserva una edición si la precisión de práctica sube al menos 2 puntos, no caen las categorías ya correctas, la KL media en texto ordinario se mantiene ≤ 0,03 y ARC-Easy no baja más de 2 puntos.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Tool calling y function calling restringido a seis herramientas de domótica: `toggle_lights`, `set_thermostat`, `lock_door`, `get_device_status`, `set_scene` e `intent_unclear`.
- Detección de intención no clara mediante la herramienta de rechazo `intent_unclear`.
- Emisión de llamadas en JSON desnudo o envueltas en etiquetas `<tool_call>`, aceptándose ambos formatos.
- Razonamiento de un solo paso orientado a la selección de herramienta y extracción de argumentos.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Prototipado de asistentes de domótica en laboratorio: el modelo permite validar pipelines de tool calling y esquemas de herramientas sin coste de entrenamiento, aceptando que aproximadamente un tercio de las peticiones fallará y debe filtrarse.
- Investigación sobre edición de pesos: sirve como caso de estudio reproducible de edición en forma cerrada sobre un modelo de 360M, con métricas antes/después publicadas y código de evaluación referenciado.
- Docencia y experimentación con modelos pequeños: su tamaño (1,4 GB de repositorio) permite ejecutarlo en hardware modesto y estudiar el efecto de intervenciones quirúrgicas en capas concretas.
- Generación de datos sintéticos de entrenamiento: las salidas correctas pueden usarse como semilla para destilar un modelo mayor o para aumentar un dataset de domótica, con revisión humana.
- Evaluación de formatos de tool calling: útil para comparar el comportamiento de SmolLM2 con y sin edición frente a esquemas JSON y etiquetas XML en pipelines de agentes.
- Pruebas de regresión en sistemas de enrutamiento de intenciones: puede integrarse en un banco de pruebas que mida la degradación de un modelo base tras aplicar ediciones de pesos, comparando contra el modelo sin editar.

## Benchmarks y rendimiento

Precisión en tool calling (intervalos de confianza Wilson al 95%):

| Conjunto | Este modelo | SmolLM2-360M-Instruct sin editar | distil-home-assistant-qwen3 (referencia) |
|---|---|---|---|
| Test oficial (test.jsonl, n=50) | 66,0% (52,2%–77,6%) | 24,0% (14,3%–37,4%) | 92,0% (81,2%–96,8%) |
| Seed oficial (train.jsonl, n=50) | 66,0% (52,2%–77,6%) | 32,0% (20,8%–45,8%) | 98,0% (89,5%–99,6%) |
| Conjunto C independiente (n=120) | 58,3% (49,4%–66,8%) | 20,0% (13,8%–28,0%) | 91,7% (85,3%–95,4%) |
| Conjunto B de práctica (n=120) | 75,8% (67,4%–82,6%) | 25,8% (18,8%–34,3%) | 98,3% (94,1%–99,5%) |

Capacidad general:

| Métrica | Este modelo | SmolLM2-360M-Instruct sin editar | distil-home-assistant-qwen3 (referencia) |
|---|---|---|---|
| ARC-Easy (200 preguntas, respuesta por letra) | 22,5% | 23,5% | 36,5% |
| Perplejidad WikiText-2 (40 párrafos) | 24,29 | 23,76 | 48,25 |

El conjunto de test oficial no se usó en ninguna decisión durante la edición; se evaluó una sola vez sobre el modelo final. El conjunto C fue escrito por un agente independiente que no pudo ver el código de edición ni los datos de práctica. Los conjuntos oficiales son pequeños (50 ítems), por lo que diferencias de pocos puntos quedan dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo se publica en float32 (aproximadamente 1,4 GB de pesos), por lo que requiere en torno a 2 GB de VRAM en float32; en bfloat16 o float16 bajaría a aproximadamente 0,7 GB, aunque el autor advierte que guardar en bfloat16 degrada ARC-Easy y hace fallar la puerta de calidad.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en CPU.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM en float32.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (tag `text-generation-inference` presente) y endpoints compatibles; llama.cpp u Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión tool calling (test oficial) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-360M-SmartHome-WeightEdit | 361,8M | No disponible | 66,0% | Apache-2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 361,8M | No disponible | 24,0% | Apache-2.0 | Hugging Face |
| distil-labs/distil-home-assistant-qwen3 | No disponible | No disponible | 92,0% | Apache-2.0 | Hugging Face |

La referencia fine-tuned supera claramente al modelo editado en la tarea específica, a costa de un entrenamiento con gradientes sobre datos sintéticos. El modelo editado conserva mejor la perplejidad en WikiText-2 (24,29 frente a 48,25 de la referencia), lo que sugiere que la edición preserva el comportamiento en texto general mejor que el fine-tuning intensivo en la tarea.

## Limitaciones y advertencias

- Precisión absoluta modesta: aproximadamente una de cada tres peticiones se gestiona mal; el autor lo declara explícitamente no apto para controlar dispositivos reales.
- Riesgo de alucinación en la selección de herramienta y en los argumentos, especialmente en peticiones ambiguas o fuera del dominio de las seis herramientas.
- Solo inglés: no se ha validado su comportamiento en castellano ni en otros idiomas.
- Dominio muy restringido: únicamente las seis herramientas del esquema de distil-home-assistant-qwen3; no generaliza a otras APIs sin reedición.
- La edición se degrada si se guarda en bfloat16 (ARC-Easy cae de 26,0% a 23,0%), por lo que debe servirse en float32 para reproducir los resultados publicados.
- ARC-Easy queda en 22,5%, cerca del azar (25% con cuatro opciones), lo que indica una capacidad de razonamiento general muy limitada.
- Los conjuntos de evaluación oficiales tienen solo 50 ítems, con intervalos de confianza amplios; las diferencias de pocos puntos no son significativas.
- Licencia Apache-2.0 permite uso comercial, pero la calidad del modelo desaconseja su uso en producción sin un filtro o verificador adicional.
- El modelo base SmolLM2 puede arrastrar sesgos presentes en sus datos de entrenamiento; no se documentan evaluaciones de sesgo en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitos-io/SmolLM2-360M-SmartHome-WeightEdit
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Modelo de referencia y esquema de herramientas: https://huggingface.co/distil-labs/distil-home-assistant-qwen3
