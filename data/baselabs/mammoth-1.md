# baselabs/mammoth-1

## Resumen

mammoth-1 es un modelo de decisión de 27.000 millones de parámetros desarrollado por Base Labs en Baseten, obtenido mediante un fine-tune completo sobre Qwen3.5-27B. No es un modelo generativo al uso: recibe un estado (texto, opcionalmente con imágenes) y un conjunto de preguntas con opciones, y devuelve una probabilidad calibrada para cada opción, resolviendo todas las preguntas en un único prefill de prefijo compartido. Está pensado para tareas de clasificación, enrutamiento, calibración y guardrails en producción.

Su relevancia actual radica en que ataca un problema concreto: los LLM generativos son caros e inconsistentes cuando se usan como clasificadores o enrutadores. mammoth-1 convierte esa tarea en una inferencia de una sola pasada con salidas probabilísticas calibradas, incluyendo una opción entrenada de "no lo sé". Según el autor, lidera el Jev Decision Index 0.4 con 71,24 puntos y una réplica del Artificial Analysis Decision Index con 65,9.

El modelo admite tres tipos de pregunta (`noul` sí/no, `choice` entre opciones nombradas y `score` sobre niveles ordenados), con una longitud máxima de secuencia de 16.384 tokens. Las peticiones que exceden los límites entrenados se rechazan en lugar de truncarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-27B) con máscara bidireccional por bloques en las capas de atención completa; encoder de visión congelado |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 16.384 tokens (máximo de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (modificaciones de Baseten) + Apache 2.0 (base Qwen3.5-27B); uso sujeto a ambas |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Entradas | texto e imágenes |
| Tarea | modelo de decisión (clasificación calibrada, enrutamiento, guardrails) |

## Arquitectura y entrenamiento

mammoth-1 parte de Qwen3.5-27B, un transformer multimodal, y aplica un fine-tune completo únicamente sobre el modelo de lenguaje, manteniendo congelado el encoder de visión. La innovación estructural clave es el uso de una máscara de atención bidireccional por bloques en las capas de atención completa, que permite que todas las preguntas de una petición se resuelvan simultáneamente desde un mismo prefill de prefijo compartido, en lugar de generar respuestas de forma autorregresiva. El modelo acepta texto e imágenes como estado de entrada.

El entrenamiento se realizó sobre 6,21 millones de ejemplos de decisión (denominado Mix 8), con la siguiente composición: 58,3 % de habilidades centrales de decisión, 16,1 % de seguridad y abstención, 16,1 % de dominios de juicio y expertos, y 9,5 % de datos públicos de decisión. La función objetivo combina entropía cruzada con un término de calibración de Brier (λ = 1), e incluye una opción entrenada de "no lo sé" para permitir la abstención calibrada. La receta fue de 1 época (9.859 pasos), LR máximo de 2,7e-6, AdamW (β 0,9/0,95, sin weight decay), 3 % de warm-up, decaimiento coseno y precisión bf16. El entrenamiento se ejecutó en 18 nodos de 4 GB300 (72 GPU en total).

## Capacidades

- Clasificación calibrada con salidas probabilísticas por opción, no solo etiquetas.
- Preguntas de tipo `noul` (sí/no) con probabilidad P(yes).
- Preguntas de tipo `choice` entre opciones nombradas con descripción, devolviendo la opción elegida y el vector de probabilidades.
- Preguntas de tipo `score` sobre niveles ordenados, devolviendo el nivel y las probabilidades.
- Resolución de múltiples preguntas heterogéneas en una sola pasada con prefijo compartido.
- Entrada multimodal: texto e imágenes.
- Abstención calibrada mediante opción "no lo sé" entrenada.
- Capacidades de conocimiento y razonamiento, lenguaje, herramientas y automatización, recuperación y clasificación, y juicio estético/humano (según las áreas evaluadas en el Jev Decision Index).
- Rechazo explícito de peticiones que exceden los límites de longitud entrenados, sin truncado silencioso.

## Casos de uso

- Enrutamiento de tickets de soporte: con preguntas tipo `choice` se puede decidir si un caso va a facturación, técnico o fraude, y con tipo `score` asignar urgencia, todo en una sola inferencia y con probabilidades que permiten umbrales de derivación a humano.
- Guardrails y moderación: preguntas `noul` calibradas sobre si una entrada incumple una política, con la opción "no lo sé" para reducir falsos positivos en casos ambiguos.
- Triaje de correos o mensajes entrantes: clasificación multicriterio (intención, urgencia, equipo) en una única pasada gracias al prefijo compartido, lo que reduce coste frente a múltiples llamadas generativas.
- Clasificación de documentos con imágenes: al aceptar entradas visuales, puede decidir sobre capturas, formularios escaneados o recibos combinando texto e imagen en el estado.
- Enrutamiento en pipelines de agentes: decidir la siguiente herramienta o rama de un flujo multi-paso a partir de una pregunta `choice`, con probabilidades para implementar lógica de confianza.
- Evaluación automática de respuestas: uso de preguntas `score` para puntuar calidad, adecuación o riesgo de una salida generada, con calibración explícita.
- Control de calidad en producción con abstención: desviar a revisión humana los casos en que la probabilidad de la opción elegida es baja o la opción "no lo sé" domina.

## Benchmarks y rendimiento

Jev Decision Index 0.4:

| Modelo | Decision Index |
|---|---:|
| mammoth-1 | 71,24 |
| Perplexity Decider v1.2 | 69,42 |
| elephant-1 | 62,65 |
| Jev 1.14 | 62,2 |
| Cloudflare Clef | 55,7 |

Según el autor, en el split público mammoth-1 lidera en 4 de 5 áreas (conocimiento y razonamiento, lenguaje, herramientas y automatización, recuperación y clasificación, artes y gusto humano).

Artificial Analysis Decision Index (réplica del autor):

| Modelo | Score |
|---|---:|
| mammoth-1 | 65,9 |
| elephant-1 | 65,2 |
| d1-ultra | 65 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El autor indica que el despliegue autoalojado requiere una GPU CUDA y la imagen `pytorch/pytorch:2.8.0-cuda12.8-cudnn9-devel`.
- VRAM estimada para inferencia: no disponible de forma explícita; con 27,36 B de parámetros, en bf16 el peso ronda los 55 GB, por lo que se necesitan GPU de 80 GB (A100/H100) o configuraciones multi-GPU; no se documentan cuantizaciones.
- GPU recomendadas: no disponible en la información; el entrenamiento usó GB300, pero no se especifican requisitos mínimos de inferencia más allá de "una GPU CUDA".
- ¿Cabe en GPU de consumo? No disponible; sin cuantizaciones publicadas, un modelo de 27 B en bf16 no cabe en GPU consumer de 24 GB.
- Opciones de despliegue: runtime propio OneJev con `serve.patch` instalado vía `setup.sh`, API `DecisionEngine` del paquete `qev`; también disponible en Baseten Model APIs. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index (Jev 0.4) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| mammoth-1 | 27 B | 16.384 | 71,24 | MIT + Apache 2.0 | Hugging Face, Baseten |
| elephant-1 | 9 B | no disponible | 62,65 | no disponible | Hugging Face, Baseten |
| Perplexity Decider v1.2 | no disponible | no disponible | 69,42 | no disponible | no disponible |
| d1-ultra | no disponible | no disponible | 65 (AA replica) | no disponible | no disponible |
| Cloudflare Clef | no disponible | no disponible | 55,7 | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni licencia de los modelos competidores en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisiones: no está pensado como generador de texto libre; su salida son probabilidades sobre opciones predefinidas.
- Idiomas: solo se declara inglés (`en`); el rendimiento en castellano u otros idiomas no está documentado.
- Longitud: las peticiones que superan los límites entrenados se rechazan, no se truncan, lo que puede romper flujos que esperen degradación suave.
- Calibración dependiente del dominio: las probabilidades están calibradas sobre los datos de entrenamiento (Mix 8); en dominios muy distintos puede requerir recalibración.
- Riesgo de sesgo: no se documentan evaluaciones de sesgo en la información disponible.
- Licencia dual: el uso comercial está sujeto simultáneamente a MIT (modificaciones de Baseten) y Apache 2.0 (base Qwen3.5-27B); conviene revisar `LICENSE` y `NOTICE`.
- Despliegue: el runtime propio (OneJev) y la imagen CUDA específica limitan la portabilidad frente a stacks estándar como vLLM o TGI.
- La ventana gratuita en Baseten Model APIs finalizó el 27/10/2026 según la model card.

## Enlaces

- Hugging Face: https://huggingface.co/baselabs/mammoth-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Modelo hermano (9B): https://huggingface.co/baselabs/elephant-1
- Probar en Baseten: https://www.baseten.co/library/mammoth-1/
- Informe técnico: https://labs.baseten.co/articles/mammoth-1-and-elephant-1-frontier-decision-models
- Blog: https://www.baseten.co/blog/the-best-decision-models-in-the-world-mammoth-1-and-elephant-1/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
