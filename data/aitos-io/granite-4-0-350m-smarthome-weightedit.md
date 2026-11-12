# aitos-io/Granite-4.0-350M-SmartHome-WeightEdit

## Resumen

Granite-4.0-350M-SmartHome-WeightEdit es un modelo de generación de texto especializado en tool calling para domótica, desarrollado por aitos-io a partir de ibm-granite/granite-4.0-350m. Su particularidad es el método de construcción: no se ha entrenado con gradientes, sino que se han editado directamente los pesos mediante una solución en forma cerrada (closed-form weight editing). Se modificaron 2.097.152 pesos (0,60% del total) en las proyecciones de salida del MLP de las capas 18, 20, 22 y 24.

El modelo transforma peticiones de domótica multi-turno en llamadas a seis herramientas concretas: `toggle_lights`, `set_thermostat`, `lock_door`, `get_device_status`, `set_scene` e `intent_unclear`. El esquema de herramientas y el system prompt provienen de distil-labs/distil-home-assistant-qwen3 (Apache-2.0) y se usan sin cambios. Con 352.379.904 parámetros, está pensado para despliegues de bajo coste en entornos IoT y asistentes de voz locales.

Es relevante ahora porque demuestra que la edición de pesos sin entrenamiento puede recuperar parte del rendimiento de un fine-tuning específico de tarea en un modelo base pequeño, con un coste computacional mínimo y sin ciclo de entrenamiento. El modelo se distribuye en float32, ya que en bfloat16 la edición pierde precisión de forma notable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Granite MoE Hybrid (tag `granitemoehybrid`) |
| Parámetros totales | 352.379.904 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (publicado en float32; el autor advierte que bfloat16 degrada la edición) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es ibm-granite/granite-4.0-350m, etiquetado como `granitemoehybrid`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO. El modelo derivado no ha pasado por ningún entrenamiento con gradientes: la adaptación se realizó mediante edición de pesos en forma cerrada.

El procedimiento de edición consta de tres fases. Primero, un diagnóstico con sondas lineales que muestra que la intención del usuario es decodificable al 100% desde las capas intermedias, mientras que la salida correcta solo se produce el 61% de las veces en los datos de práctica: el problema es un obstáculo de decisión, no una capacidad ausente. Segundo, para cada capa (18, 20, 22 y 24) se aplica teacher forcing sobre los datos de práctica, se recogen las activaciones de entrada del MLP en las posiciones erróneas (claves K) y el desplazamiento del estado oculto que haría ganar al token correcto frente a su competidor más fuerte (valores R), y se resuelve ΔW = Rᵀ K (KᵀK + λ·n·C)⁻¹, donde C es la covarianza de activaciones de posiciones que no deben cambiar (respuestas ya correctas ponderadas 4×, tokens de prompt, texto ordinario de WikiText-2 y QA general de ARC-Easy ponderado 16×). Cada edición se aplica con dosis 0,85 antes de resolver la siguiente capa. Tercero, se aplican puertas de calidad: la edición se conserva solo si la precisión de práctica sube ≥ 2 puntos, no caen las categorías ya correctas, la KL media en texto ordinario se mantiene ≤ 0,03 y ARC-Easy no baja más de 2 puntos. Se tuvieron en cuenta los factores de escalado de Granite (`residual_multiplier`, `logits_scaling`) y las matrices editadas son las proyecciones de salida del MLP compartido (`shared_mlp.output_linear`).

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Tool calling y function calling con seis herramientas de domótica: `toggle_lights`, `set_thermostat`, `lock_door`, `get_device_status`, `set_scene` e `intent_unclear`.
- Clasificación de intención dentro del esquema de distil-smart-home (habitaciones, puertas y escenas predefinidas).
- Gestión de peticiones ambiguas mediante la herramienta `intent_unclear`.
- Razonamiento de un solo paso orientado a la selección de herramienta y extracción de argumentos.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni agentes multi-paso.

## Casos de uso

- Asistente de voz para el hogar: el modelo convierte frases como "¿está cerrada la puerta principal?" en una llamada a `get_device_status`, adecuado para integración en altavoces y hubs locales con recursos limitados.
- Automatización de rutinas domésticas: interpreta peticiones multi-turno y emite `set_scene` o `toggle_lights` con los valores de habitación y escena del esquema, útil en sistemas de gestión energética del hogar.
- Control de climatización: traduce instrucciones de temperatura a `set_thermostat` con los argumentos correctos, apropiado para termostatos conectados que necesiten una capa de interpretación de lenguaje natural.
- Seguridad y cerraduras: gestiona peticiones de bloqueo mediante `lock_door`, con la ventaja de que el modelo es lo bastante pequeño para ejecutarse en el propio dispositivo sin enviar datos a la nube.
- Enrutado de intenciones en pipelines de domótica: actúa como clasificador previo que decide qué herramienta invocar antes de que un sistema mayor procese la acción, gracias a su bajo coste de inferencia.
- Prototipado e investigación en edición de pesos: sirve como caso de estudio reproducible de adaptación de modelos sin gradientes para investigadores que quieran aplicar la técnica a otros dominios de tool calling.
- Asistente de accesibilidad: interpretación de comandos de voz para personas con movilidad reducida, desplegado localmente por su reducido tamaño.

## Benchmarks y rendimiento

| Precisión de tool call (IC 95%) | Este modelo | granite-4.0-350m sin editar | distil-home-assistant-qwen3 (referencia fine-tuned) |
|---|---|---|---|
| Test oficial (test.jsonl, n=50) | 76,0% (62,6%–85,7%) | 58,0% (44,2%–70,6%) | 92,0% (81,2%–96,8%) |
| Seed oficial (train.jsonl, n=50) | 88,0% (76,2%–94,4%) | 72,0% (58,3%–82,5%) | 98,0% (89,5%–99,6%) |
| Set C independiente (n=120) | 79,2% (71,1%–85,5%) | 53,3% (44,4%–62,0%) | 91,7% (85,3%–95,4%) |
| Set B de práctica (n=120) | 90,0% (83,3%–94,2%) | 59,2% (50,2%–67,5%) | 98,3% (94,1%–99,5%) |

| Capacidad general | Este modelo | granite-4.0-350m sin editar | distil-home-assistant-qwen3 (referencia) |
|---|---|---|---|
| ARC-Easy (200 preguntas, respuesta por letra) | 45,0% | 46,5% | 36,5% |
| Perplejidad WikiText-2 (40 párrafos) | 40,31 | 40,03 | 48,25 |

El conjunto de test oficial no se usó en ninguna decisión durante la edición y se evaluó una sola vez sobre el modelo final. Los intervalos son de Wilson al 95%; los conjuntos oficiales tienen solo 50 ítems, por lo que diferencias de pocos puntos quedan dentro del ruido. El autor señala que la referencia fine-tuned sigue siendo más precisa, y que este modelo muestra hasta dónde llega la edición sola sin entrenamiento.

## Requisitos de hardware

- VRAM estimada: con 352 millones de parámetros en float32, los pesos ocupan aproximadamente 1,4 GB; en bfloat16 bajarían a unos 0,7 GB, pero el autor advierte que esa precisión degrada la edición.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para float32; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso iGPUs con memoria unificada suficiente.
- Opciones de despliegue: transformers (librería indicada en el repo, con `AutoModelForCausalLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión tool call (test oficial) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite-4.0-350M-SmartHome-WeightEdit | 352 M | no disponible | 76,0% | Apache-2.0 | Hugging Face |
| ibm-granite/granite-4.0-350m | 350 M (aprox.) | no disponible | 58,0% | Apache-2.0 | Hugging Face |
| distil-labs/distil-home-assistant-qwen3 | no disponible (base Qwen3-0.6B) | no disponible | 92,0% | Apache-2.0 | Hugging Face |

La referencia fine-tuned supera en precisión al modelo editado, pero requiere entrenamiento con gradientes y está construida sobre una base distinta (Qwen3-0.6B). El modelo editado parte de Granite y no necesita ciclo de entrenamiento, lo que reduce el coste de adaptación.

## Limitaciones y advertencias

- Solo cubre las seis herramientas y los valores de habitación, puerta y escena del esquema distil-smart-home; fuera de ese dominio no es fiable.
- El modelo solo soporta inglés.
- Sensibilidad a la precisión numérica: guardado en bfloat16 pierde 5 puntos en ARC-Easy (49,0% → 44,0%), por lo que se recomienda usar float32.
- Los conjuntos de evaluación oficiales tienen solo 50 ítems, de modo que las diferencias de pocos puntos no son estadísticamente significativas.
- Riesgo de alucinación en la selección de herramienta y en los argumentos, especialmente en peticiones ambiguas o fuera del esquema.
- No se documentan sesgos específicos, pero al derivar de un modelo base general puede heredar los del modelo original.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del esquema de herramientas de distil-labs.
- El autor reconoce que la referencia fine-tuned sigue siendo más precisa; este modelo es una demostración de edición de pesos, no un sustituto de un fine-tuning completo.

## Enlaces

- Hugging Face: https://huggingface.co/aitos-io/Granite-4.0-350M-SmartHome-WeightEdit
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- Modelo de referencia y esquema de herramientas: https://huggingface.co/distil-labs/distil-home-assistant-qwen3
