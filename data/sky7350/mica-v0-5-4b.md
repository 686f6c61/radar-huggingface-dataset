# sky7350/Mica-v0.5-4B

## Resumen

Mica v0.5-4B es un modelo de decisión de 4B parámetros desarrollado por sky7350 (usuario independiente, proyecto akiVet/Mica) y publicado en Hugging Face. No es un generador de texto: recibe un estado (un log, una traza de agente, un documento, JSON) de hasta 32.768 tokens, una o varias preguntas y un conjunto de respuestas permitidas, y devuelve una distribución de probabilidad calibrada sobre esas opciones. Nunca emite texto libre, por lo que la salida siempre es una de las etiquetas definidas por el usuario y no requiere parseo posterior.

El modelo está afinado a partir de Qwen/Qwen3.5-4B y se posiciona como sustituto barato de llamadas a modelos grandes cuando solo se necesita un sí/no, una etiqueta o una puntuación: guardrails, verificación de RAG, compuertas de agentes, enrutado, triaje y evaluación automática (llm-as-a-judge). Su propuesta diferencial es la calibración: permite umbrales de abstención (`abstain_threshold`) y es estable frente al orden de las opciones (97,3% de coincidencia al barajar las respuestas permitidas).

Con 4.659.865.088 parámetros reales, licencia Apache 2.0, soporte de GGUF para llama.cpp y una interfaz de clasificación por probabilidades, cubre un nicho poco atendido: inferencia de decisión de baja latencia en una sola GPU de consumo. El repositorio, de 29,8 GB, incluye pesos safetensors y cuantizaciones GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen/Qwen3.5-4B); no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 4.659.865.088 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens de entrada |
| Tipos de cuantización | GGUF (cuantizaciones no detalladas); pesos safetensors en precisión completa |
| Idiomas soportados | inglés, coreano, chino (y "más" según la model card, sin listado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.5-4B, un transformer decoder-only de 4B parámetros. La adaptación convierte el modelo base en un cabezal de decisión: en lugar de generar tokens, el modelo puntúa cada respuesta permitida y normaliza las puntuaciones en una distribución de probabilidad. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación.

Las innovaciones declaradas por el autor son de comportamiento más que de arquitectura: estabilidad frente al orden de las opciones (97,3% de elección idéntica al barajar las respuestas), capacidad de abstención mediante umbral configurable, soporte de preguntas de elección con hasta 255 opciones y de preguntas de puntuación con 2–255 niveles, y salida de 0 tokens generados. El modelo se distribuye también en GGUF para ejecución con llama.cpp.

## Capacidades

- Clasificación por probabilidad: devuelve una distribución calibrada sobre un conjunto cerrado de respuestas, sin generar texto libre.
- Preguntas de elección con entre 2 y 255 opciones por pregunta.
- Preguntas de puntuación (score) con entre 2 y 255 niveles.
- Procesamiento de entradas largas de hasta 32.768 tokens: logs, trazas de agente, documentos, JSON.
- Múltiples preguntas sobre una misma entrada en una sola pasada.
- Abstención controlada mediante `abstain_threshold` para marcar casos inciertos en lugar de adivinar.
- Invariancia al orden de las opciones (97,3% de estabilidad al barajar).
- Soporte multilingüe limitado a inglés, coreano y chino (más otros no especificados).
- Orientado a tool calling indirecto: actúa como compuerta o clasificador dentro de pipelines de agentes, no como generador de llamadas a herramientas.
- Integración con llama.cpp mediante GGUF y compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Guardrails de contenido: clasificar respuestas de un LLM como seguras, inseguras o dudosas usando preguntas de elección con umbral de abstención, evitando el coste de llamar a un modelo grande solo para un juicio binario.
- Verificación de RAG: comprobar si la respuesta generada está respaldada por los fragmentos recuperados, pasando el contexto y la respuesta como entrada y preguntando por la fidelidad con opciones cerradas.
- Compuertas de agentes: decidir si un agente debe continuar, detenerse o escalar a un humano a partir de la traza de ejecución, con latencia baja y salida determinista en formato.
- Enrutado de consultas: clasificar la intención o el dominio de una petición entre hasta 255 categorías para dirigirla al modelo o herramienta adecuada.
- Triaje de incidencias: etiquetar logs y tickets por severidad y tipo con puntuaciones calibradas, priorizando los casos donde el modelo no se abstiene.
- Evaluación automática (llm-as-a-judge): puntuar respuestas de otros modelos en escalas de 2 a 255 niveles sobre entradas largas, con la ventaja de que la salida siempre es una etiqueta válida.
- Filtrado en pipelines de datos: clasificar pares pregunta-respuesta o documentos JSON de hasta 32k tokens por calidad o categoría antes de entrenar o indexar.

## Benchmarks y rendimiento

Resultados publicados en la model card (JDI 0.3 y JevBench Hard; las cifras de otros modelos son ejecuciones propias del autor, no puntuaciones oficiales):

| Modelo | Tamaño | JDI 0.3 | JevBench Hard |
|---|---:|---:|---:|
| PPLX Decider Flash | 4B | 60,1 | — |
| Jev | ~100B | 59,1 | 80/111 |
| **Mica v0.5** | 4B | **58,8** | **84/111** |
| CoCo Decision | 4B | 55,4 | — |
| d3-mini | 4B | 54,9 | 68/111 |
| OneJev 1.5 | 4B | 54,9 | — |
| MS Decision-1 | 9B | 54,7 | 91/111 |
| Clef | 9B | 53,0 | 72/111 |
| RSI-Jev 6.1 | 4B | 51,0 | — |
| d1 | 3B | 49,0 | 60/111 |
| Kev | 4B | 39,1 | 60/111 |
| Mica v0.1 | 4B | 37,2 | 72/111 |
| Solar Decide | 35B | 36,7 | 82/111 |
| Solar Decide Flash | 35B | 23,1 | 68/111 |
| d3-flash | 9B | — | 70/111 |
| Imajev | 4B | — | 80/111 |

Latencia: mediana por petición en una NVIDIA RTX 6000 Ada, una pregunta con cuatro opciones, una petición a la vez, servidor en caliente. La tabla de latencias por longitud de entrada (256 a 32k tokens) aparece truncada en la información disponible; no se pueden reproducir las cifras completas. El autor indica que PPLX Decider 27B se ejecutó en H100 y sus filas se escalan por la ratio RTX 6000 Ada / H100 de PPLX Decider Flash. En la demo de Minecraft, ejecutada localmente en una AMD RX 6600 XT, los tiempos de decisión del panel son estimaciones para RTX 3090.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,66B parámetros, en FP16 requiere aproximadamente 9,3 GB solo para pesos, más memoria para el contexto de hasta 32k tokens; en cuantizaciones GGUF de 4 bits cabría en torno a 2,5–3 GB de pesos.
- GPU recomendadas: el autor cita RTX 6000 Ada para las mediciones de latencia y RTX 3090 como referencia de tiempos de decisión; la demo se ejecutó en una AMD RX 6600 XT.
- Cabe en GPU de consumo: sí, según la model card ("runs on one consumer GPU"), incluidas GPUs AMD vía llama.cpp.
- Opciones de despliegue: llama.cpp (GGUF), endpoints compatibles (etiqueta `endpoints_compatible`); no se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: mediana por petición en RTX 6000 Ada con una pregunta de cuatro opciones; las cifras por longitud de entrada no están completas en la información disponible. El modelo genera 0 tokens, por lo que el coste es esencialmente el prefill de la entrada.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | JDI 0.3 | JevBench Hard | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Mica v0.5 | 4B | 32k | 58,8 | 84/111 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| PPLX Decider Flash | 4B | no disponible | 60,1 | — | no disponible | no disponible |
| MS Decision-1 | 9B | no disponible | 54,7 | 91/111 | no disponible | no disponible |
| Jev | ~100B | no disponible | 59,1 | 80/111 | no disponible | no disponible |
| Solar Decide | 35B | no disponible | 36,7 | 82/111 | no disponible | no disponible |

Mica v0.5 destaca por igualar o superar en JDI 0.3 a modelos mucho mayores (Jev ~100B, Solar Decide 35B) con solo 4B parámetros, y por ser el único de la comparativa con licencia Apache 2.0 y pesos GGUF confirmados en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto libre, explicaciones ni llamadas a herramientas; su salida es siempre una distribución sobre opciones predefinidas.
- Cobertura lingüística limitada: inglés, coreano y chino confirmados; el rendimiento en castellano no está documentado y no debería asumirse.
- Riesgo de calibración deficiente fuera de distribución: el umbral de abstención debe validarse con datos propios antes de usarlo en producción.
- Los benchmarks JDI 0.3 y JevBench Hard son ejecuciones del propio autor con su metodología de puntuación; no son comparaciones con puntuaciones oficiales de terceros.
- Proyecto de un desarrollador individual: menor garantía de mantenimiento, soporte y actualizaciones que un modelo corporativo.
- La información sobre sesgos, datos de entrenamiento y composición del dataset no está disponible, lo que dificulta auditorías de equidad.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen/Qwen3.5-4B deben verificarse por separado.
- El repositorio ocupa 29,8 GB, lo que implica una descarga considerable si se quieren todos los formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sky7350/Mica-v0.5-4B
- Repositorio GitHub: https://github.com/akivet/Mica
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Demo Minecraft (petición): https://huggingface.co/sky7350/Mica-v0.5-4B/resolve/main/assets/demo/minecraft_request.mp4
- Demo Minecraft (resolución): https://huggingface.co/sky7350/Mica-v0.5-4B/resolve/main/assets/demo/minecraft_netherite.mp4
- Resultados JDI 0.3: https://huggingface.co/sky7350/Mica-v0.5-4B/resolve/main/assets/results_jdi_all.png
- Resultados JevBench Hard: https://huggingface.co/sky7350/Mica-v0.5-4B/resolve/main/assets/results_jevbench_all.png
- Latencia por longitud de entrada: https://huggingface.co/sky7350/Mica-v0.5-4B/resolve/main/assets/latency.png
- Apoyo al autor (Ko-fi): https://ko-fi.com/micakiv
