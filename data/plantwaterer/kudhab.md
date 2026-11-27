# plantwaterer/kudhab

## Resumen

Kudhab (𒋻𒇥) es un modelo de decisión derivado de Gemma 4 31B, publicado por el usuario plantwaterer en Hugging Face. No es un modelo generativo al uso: para cada pregunta tipada de una petición (una elección entre opciones, o un sí/no) devuelve una probabilidad por opción leída en un único forward pass, sin generar texto. Esto lo convierte en una pieza especializada para sistemas que necesitan puntuar alternativas de forma determinista y de baja latencia.

Técnicamente es un fine-tune de una media uniforme de cuatro fine-tunes del mismo punto de partida (Gemma 4 31B), destilado a partir de las probabilidades de salida de MachinePulseAI/karpo-decision-31B sobre las preguntas de entrenamiento del autor. El modelo no contiene pesos de karpo-decision ni se inicializó desde ellos, pero se lee con el código de inferencia abierto de karpo-decision (Apache-2.0), que define el formato de petición, la atención y el mecanismo de lectura.

Su relevancia actual radica en que ocupa el puesto 3 del Decision Index 0.4.1 (snapshot de 2026-11-21, 345 modelos) con una puntuación completa de 73.04, y en que ofrece un contrato de inferencia claro (formato `karpo-blocks-v1`, lectura por softmax sobre códigos de opción) sobre un backbone de 31.273.088.876 parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 31B) con capas de atención global y de ventana deslizante; cabezal de lectura de decisión sobre códigos de opción |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (`max_length` por defecto); ventana deslizante de 1.024 tokens en las capas locales |
| Tipos de cuantización | no disponible (pesos publicados en bf16; 62,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (backbone + `readout.safetensors`), `config.json`, `decision_config.json`, tokenizer |

## Arquitectura y entrenamiento

El backbone es Gemma 4 31B, un transformer decoder-only con dos tipos de capas de atención: 10 capas de atención global y 50 capas de ventana deslizante causal de 1.024 tokens. Sobre ese backbone, karpo-decision añade un mecanismo de lectura: en el último token de cada rama de pregunta, el estado oculto se multiplica por una matriz fp32 de 255 × 5.376 (las filas del language-model head del modelo, atadas a sus embeddings de entrada, para los 255 tokens de código de opción) y se aplica un soft-cap (30·tanh(x/30)); las probabilidades de la pregunta son el softmax a temperatura 1 sobre los códigos de sus opciones. Esa matriz de lectura no se entrena.

El entrenamiento parte de una media uniforme (0,5 / 0,5) de plantwaterer/munku y tattrongvu/Jeffan-31b-1710 (revisión cebfa86c2bed2b5c83b12e44de4374b20c87fd79, Apache-2.0), ambos fine-tunes de google/gemma-4-31B-it. Cada etapa se entrenó para igualar las probabilidades de salida de MachinePulseAI/karpo-decision-31B sobre las preguntas de entrenamiento del autor, es decir, destilación desde sus salidas. El formato de petición `karpo-blocks-v1` organiza un turno de sistema, un bloque compartido (lista de preguntas y contexto) y una rama por pregunta con las opciones etiquetadas con códigos de un token (A, B, …, hasta 255 opciones) y el slot `Answer: (`. En las capas de atención global, el bloque compartido se atiende a sí mismo y cada rama al bloque y a sí misma en ambas direcciones, sin que las ramas se vean entre sí; las capas de ventana deslizante son causales dentro de su ventana de 1.024 tokens.

## Capacidades

- Puntuación de decisiones: devuelve una probabilidad por opción para preguntas de tipo elección (hasta 255 opciones) y de tipo sí/no, en un único forward pass.
- Peticiones con múltiples preguntas: el formato `karpo-blocks-v1` permite agrupar varias preguntas sobre un contexto compartido, con ramas independientes que no se contaminan entre sí.
- Procesamiento de contexto largo: hasta 32.768 tokens por petición; las peticiones que exceden ese límite se dividen por preguntas repitiendo el bloque compartido, y una pregunta que no cabe con su estado se rechaza en lugar de truncarse.
- Modo de vista configurable: `joint` (por defecto), `reversed` (promedia cada pregunta de elección sobre su orden y el inverso) y `single`.
- Integración con el motor `DecisionIndexEngine` de karpo-decision y con el kit `decision-index` de apolinario.
- Salida determinista y probabilística, apta para umbrales y ranking; no genera texto libre.
- Sin soporte de imágenes: las peticiones con imágenes se rechazan (solo texto).
- Soporte de tool calling, agentes, visión o audio: no disponible (no documentado en la información proporcionada).

## Casos de uso

- Enrutamiento de peticiones en pipelines de agentes: dado un mensaje del usuario y un conjunto de herramientas o intenciones etiquetadas como opciones, el modelo devuelve la probabilidad de cada una en un forward pass, lo que permite umbrales de confianza y fallback a un modelo generativo.
- Moderación y clasificación de políticas: plantear cada política como una opción de una pregunta de elección y usar las probabilidades para decidir si una solicitud infringe una norma, con la ventaja de que la decisión es reproducible y auditable.
- Sistemas de recomendación con criterios explícitos: cada candidato se etiqueta como opción y el contexto del usuario como bloque compartido; las probabilidades permiten ordenar candidatos con una latencia mediana de 92 ms por petición en una RTX PRO 6000.
- Validación de respuestas en pipelines RAG: formular preguntas de sí/no sobre si una respuesta generada está respaldada por el contexto recuperado, usando el bloque compartido para el contexto y ramas por afirmación.
- Decisión de escalado en atención al cliente: preguntas de elección entre "resolver automáticamente", "escalar a humano" o "pedir más información", con el historial de conversación como contexto compartido de hasta 32.768 tokens.
- Evaluación automática de modelos: usar el modelo como juez probabilístico en comparaciones por pares o múltiples, aprovechando la vista `reversed` para mitigar el sesgo de orden de las opciones.
- Selección de configuración en CI/CD: puntuar alternativas de configuración o parches propuestos como opciones de una pregunta, con la salida probabilística integrada en un gate de despliegue.

## Benchmarks y rendimiento

Resultados publicados en la model card (Decision Index 0.4.1, snapshot de 2026-11-21, 345 modelos):

| Métrica | Puntuación | Rango | Comparación |
|---|---|---|---|
| Full score | 73,04 | 3 | +1,79 sobre plantwaterer/munku (71,25); en el grupo 1 junto a karpo-decision-31B (73,86) y GLiDE 27B (73,37) |
| Same-skill score | 69,53 | 3 | +2,13 |
| New-domain score | 61,57 | 5 | +1,00 |
| Public suite score (auto-evaluado) | 73,96 (raw 80,03; breadth 73,54) | 8 | +2,86 sobre munku (71,10) |

Latencia medida en una RTX PRO 6000 Blackwell sobre la muestra pública de 1.000 peticiones, una petición a la vez, vista `joint`, `max_length` 32.768, mediana de dos ejecuciones (sin carga de modelo ni warm-up de 13 s; se excluyen las 4 peticiones rechazadas):

| Mediana | Media | p80 | p95 | Peticiones > 1 s | Memoria GPU pico |
|---|---|---|---|---|---|
| 92 ms | 246 ms | 237 ms | 523 ms | 31 | 73,6 GiB |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K u otras suites estándar de generación.

## Requisitos de hardware

- VRAM: los pesos en bf16 ocupan 62,5 GB; el pico medido en inferencia con `max_length` 32.768 es de 73,6 GiB en una RTX PRO 6000 de 96 GB.
- GPU recomendadas: una sola GPU con al menos 80-96 GB de memoria, como RTX PRO 6000 (96 GB), A100 80 GB o H100 80 GB; el pico de 73,6 GiB deja poco margen en GPUs de 80 GB con contexto máximo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs consumer de 32 GB en bf16; no se documentan cuantizaciones alternativas.
- Despliegue: motor `karpo_decision.serve.engine:DecisionIndexEngine` mediante el kit `decision-index`; también uso directo en Python con `karpo_decision.decider.Decider`. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Entorno: torch >= 2.14 (probado con 2.14.1+cu130), transformers >= 5.17 (probado con 5.21.0), safetensors >= 0.6, Python 3.12.
- Latencia: mediana de 92 ms y p95 de 523 ms por petición en la muestra de referencia; el motor incluye kernels opcionales `blackwell` no usados en la medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Full score (Decision Index 0.4.1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plantwaterer/kudhab | 31,27 B | 32.768 | 73,04 (rango 3) | Apache-2.0 | Hugging Face |
| MachinePulseAI/karpo-decision-31B | no disponible | no disponible | 73,86 (grupo 1) | Apache-2.0 (código de inferencia) | Hugging Face |
| GLiDE 27B | 27 B (según nombre) | no disponible | 73,37 (grupo 1) | no disponible | Hugging Face |
| plantwaterer/munku | 31 B (fine-tune de Gemma 4 31B) | no disponible | 71,25 | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo probabilidades sobre opciones; no sirve para chat, redacción ni código.
- Rechaza peticiones con imágenes (solo texto) y rechaza preguntas que no caben en `max_length` con su estado, en lugar de truncarlas.
- El rendimiento depende de la calidad del etiquetado de opciones y del formato `karpo-blocks-v1`; un uso fuera de ese contrato de inferencia no está soportado.
- La matriz de lectura no se entrena y se deriva del language-model head; los resultados están ligados al código de karpo-decision en el commit a6fa38bf4e8de9dbdb9491fb461b9b320a2e2118.
- El public suite score (73,96) es auto-evaluado por el autor, no una evaluación independiente.
- El modelo se destiló de las salidas de karpo-decision-31B, por lo que puede heredar sus sesgos y errores sistemáticos.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe.
- Licencia Apache-2.0 en pesos y código, pero el uso comercial debe verificar también las licencias del modelo base (Gemma 4 31B, Apache-2.0) y de las dependencias (karpo-decision y decision-index, Apache-2.0).
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración deficiente de probabilidades fuera de la distribución de entrenamiento.
- El requisito de memoria (73,6 GiB de pico) limita el despliegue a GPUs de gama alta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/kudhab
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo predecesor: https://huggingface.co/plantwaterer/munku
- Modelo fusionado: https://huggingface.co/tattrongvu/Jeffan-31b-1710
- Modelo destilado: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Código de inferencia karpo-decision: https://github.com/machinepulse-ai/karpo-decision
- Kit decision-index: https://github.com/apolinario/decision-index
- Board del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
