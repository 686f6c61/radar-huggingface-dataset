# Remek/basal-2.0-max

## Resumen

basal-2.0-max es un modelo de decisión tipada (typed-decision model) para polaco e inglés desarrollado por Remek. No es un modelo generativo conversacional al uso: recibe un *estado* (un mensaje, un documento, pasajes recuperados, una traza de agente o una página web en JSON) y responde a una pregunta tipada sobre ese estado devolviendo una probabilidad calibrada para cada respuesta permitida en un único forward pass, sin generar texto. Las preguntas pueden ser de tipo `choice`, `noul` (sí/no), `score`, `multi`, `act` o `tool`.

El modelo se construye mediante fine-tuning sobre speakleash/Bielik-PL-11B-v3.0-Instruct, un modelo polaco de 11B parámetros, y se entrena de forma incremental a partir de checkpoints anteriores de la familia basal. Es el miembro más preciso de la familia basal-2.0, que también incluye basal-2.0-mini (1,5B) y basal-2.0 (4,5B). Su relevancia radica en que, al describir las clases en la propia petición, un único modelo cubre múltiples tareas de clasificación y enrutamiento sin reentrenamiento, con garantías de calibración que permiten fijar umbrales de error (`max_error`) y derivar casos inciertos a revisión humana.

La arquitectura subyacente es un transformer decoder-only de 11.167.748.096 parámetros, distribuido en safetensors con licencia Apache 2.0, y con variantes publicadas en FP8, GGUF y MLX-8bit para distintos entornos de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Bielik-PL-11B-v3.0-Instruct) |
| Parámetros totales | 11.167.748.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (NVIDIA Hopper y Blackwell), GGUF Q8_0 y Q5_K_M, MLX-8bit |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (principal), GGUF, MLX-8bit, FP8 |

## Arquitectura y entrenamiento

El modelo parte de speakleash/Bielik-PL-11B-v3.0-Instruct, un transformer decoder-only de 11B parámetros orientado a polaco, y se entrena adicionalmente a partir de checkpoints previos de basal. La innovación principal no está en la arquitectura del backbone, sino en la formulación de la tarea: en lugar de generar texto libre, el modelo produce una distribución de probabilidad sobre un conjunto de opciones definidas en la petición, en un solo forward pass. Esto elimina el riesgo de respuestas fuera del conjunto permitido y permite calibrar las probabilidades.

El entrenamiento incluye un proceso de calibración específico que sostiene la funcionalidad `max_error` en preguntas de tipo `act` y `tool`. La model card indica que la calibración se ajustó con las opciones mostradas solo por su descripción (`option_keys: "hide"`); si se muestran las claves, la respuesta se marca como `"calibration": "unvalidated"`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Clasificación y enrutamiento: asigna un estado a una de las opciones descritas por el usuario mediante preguntas `choice`.
- Verificación sí/no: comprobaciones de reglas y políticas con preguntas `noul`.
- Puntuación: genera puntuaciones de urgencia y riesgo mediante preguntas `score`.
- Selección múltiple: preguntas `multi` para elegir varias opciones sobre un mismo estado.
- Decisiones de agente: preguntas `act` que seleccionan la siguiente acción, con acción de `defer` para derivar a humano.
- Selección de herramientas: preguntas `tool` sobre definiciones de herramientas OpenAI o MCP; elige la herramienta, no sus argumentos.
- RAG y documentos largos: evalúa si una respuesta está presente o si un pasaje recuperado es relevante.
- Evaluación de respuestas (judging): compara y juzga respuestas generadas por otros modelos.
- Multilingüe pl/en: tanto el estado como la pregunta pueden estar en polaco o en inglés.
- Probabilidades calibradas: cada respuesta incluye probabilidad por opción, clave elegida y nivel de confianza.
- Umbral de error: `max_error` en preguntas `act` y `tool` para controlar la tasa de error certificada.
- No genera texto libre ni mantiene conversaciones; solo elige entre opciones dadas.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica un mensaje de cliente en departamentos (tarjetas, banca online, préstamos) con una pregunta `choice`, devolviendo la probabilidad de cada departamento para priorizar la cola.
- Triaje con derivación a humano: usando una pregunta `act` con acción `defer` y `max_error: 0.05`, los casos por debajo del umbral de confianza se envían a un agente humano, lo que reduce el riesgo de decisiones automáticas erróneas.
- Control de políticas y reglas: preguntas `noul` para verificar si un documento cumple una política concreta (por ejemplo, si un cliente no puede acceder a un servicio), con probabilidad calibrada para auditar el cumplimiento.
- Decisiones en pipelines RAG: preguntas sobre pasajes recuperados para determinar si la respuesta está presente o si el contexto es relevante antes de invocar a un modelo generativo, lo que ahorra coste y latencia.
- Selección de herramientas en agentes: con definiciones OpenAI o MCP, una pregunta `tool` elige la herramienta adecuada para la siguiente acción del agente, con probabilidad de acierto y opción de derivar si la confianza es baja.
- Puntuación de urgencia y riesgo: preguntas `score` para asignar niveles de urgencia a incidencias o riesgo a solicitudes, útiles en colas de atención y sistemas de alerta.
- Evaluación automática de respuestas: preguntas `choice` o `score` para juzgar la calidad de respuestas de otros modelos en pipelines de evaluación, con probabilidades calibradas para agregar métricas.
- Moderación y triaje de contenido: clasificación de mensajes en categorías descritas dinámicamente, con derivación a revisión humana cuando la confianza es insuficiente.

## Benchmarks y rendimiento

La model card menciona cifras para Werdykt, JDI, LEK, PL-Holdout y PL-Real frente a basal-1.5, y remite a las notas de evaluación, pero los valores concretos no están incluidos en la información proporcionada. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 11,17B parámetros, en FP16 se requieren aproximadamente 22,3 GB de pesos, y en FP8 en torno a 11-12 GB, sin contar overhead de activaciones y caché KV.
- GPU recomendadas: el motor basal requiere GPU NVIDIA; la build cu128 de torch necesita driver para CUDA 12.8 o superior. Las variantes FP8 están pensadas para NVIDIA Hopper y Blackwell (por ejemplo, H100, B300, DGX Spark con build cu130).
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo en la información disponible; la variante GGUF Q5_K_M y Q8_0 permite despliegue en llama.cpp y Ollama, lo que abre la puerta a GPUs con menos VRAM, pero no se especifican requisitos mínimos.
- Opciones de despliegue: motor basal v2.0.0 o superior (`basal-serve`), con cliente Python incluido; variantes GGUF para llama.cpp y Ollama; variante MLX-8bit para Apple Silicon; FP8 para Hopper y Blackwell.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-max | 11B | no disponible | Decisión tipada calibrada (pl/en) | Apache 2.0 | Hugging Face, variantes FP8/GGUF/MLX |
| basal-2.0 (4.5B) | 4,5B | no disponible | Decisión tipada calibrada, modo thinking experimental | Apache 2.0 | Hugging Face |
| basal-2.0-mini | 1,5B | no disponible | Decisión tipada calibrada, más rápido | Apache 2.0 | Hugging Face |
| Bielik-PL-11B-v3.0-Instruct | 11B | no disponible | Generación de texto instructiva (pl) | no disponible | Hugging Face |

La comparación con modelos de clasificación o enrutamiento de otros proveedores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No genera texto ni mantiene conversaciones: solo elige entre las opciones proporcionadas; no sirve como chatbot ni como modelo de redacción.
- No conoce hechos que no estén en el estado suministrado; cualquier decisión sobre información externa requiere incluirla en la petición.
- Riesgo de calibración no validada si se muestran las claves de las opciones (`option_keys` distinto de `"hide"`); en ese caso la respuesta se marca como `"calibration": "unvalidated"`.
- En preguntas `act`, un coste de error muy alto puede provocar `defer` por coste esperado antes de aplicar `max_error`.
- Idiomas limitados a polaco e inglés; no se garantiza calidad en otros idiomas.
- No apto para decisiones con consecuencias graves para personas sin revisión humana, según la propia model card.
- No se detallan sesgos conocidos, composición del dataset de entrenamiento ni resultados de benchmarks en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Bielik-PL-11B-v3.0-Instruct, no disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-2.0-max
- Variante GGUF: https://huggingface.co/Remek/basal-2.0-max-GGUF
- Colección basal-2.0: https://huggingface.co/collections/Remek/basal-20
- Modelo base: https://huggingface.co/speakleash/Bielik-PL-11B-v3.0-Instruct
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentación de hardware: https://github.com/rkinas/basal/blob/v2.5.0/docs/HARDWARE.md
- Sitio web del proyecto: https://basal.si5.pl/
