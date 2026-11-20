# Remek/basal-2.0-max

## Resumen

basal-2.0-max es un modelo de decisión tipada (typed-decision) desarrollado por Remek, construido a partir de un ajuste fino de speakleash/Bielik-PL-11B-v3.0-Instruct. A diferencia de los modelos generativos convencionales, no produce texto libre: lee un estado (un mensaje, un documento, pasajes recuperados, una traza de agente o una página web en JSON) y responde a una pregunta tipada devolviendo una probabilidad calibrada para cada respuesta permitida en un único forward pass. Las clases se describen en la propia petición, de modo que un solo modelo cubre múltiples tareas sin reentrenamiento.

Con 11.167.748.096 parámetros (~11B), es el miembro más preciso de la familia basal-2.0, que se completa con basal-2.0-mini (1,5B) y basal-2.0 (4,5B). Su relevancia actual radica en que ofrece decisiones estructuradas y calibradas —con umbrales de error certificados y derivación a revisión humana— para pipelines de enrutamiento, RAG, evaluación de respuestas y selección de herramientas en agentes, en lugar de generación abierta sujeta a alucinación.

El modelo está orientado a polaco e inglés, se distribuye bajo licencia Apache 2.0 y cuenta con variantes de cuantización FP8, GGUF y MLX-8bit para distintos entornos de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Bielik-PL-11B-v3.0-Instruct); cabecera de decisión tipada sobre estados |
| Parametros totales | 11.167.748.096 (~11B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (NVIDIA Hopper y Blackwell), GGUF (Q8_0 y Q5_K_M), MLX-8bit (Apple Silicon) |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 22,3 GB); variantes GGUF y MLX |

## Arquitectura y entrenamiento

El modelo parte de Bielik-PL-11B-v3.0-Instruct, un transformer decoder-only de ~11B parámetros, y se entrena adicionalmente a partir de checkpoints previos de la familia basal. La innovación principal no reside en el backbone sino en la interfaz de inferencia: en lugar de generar tokens, el modelo evalúa un estado y una pregunta tipada (`choice`, `noul` para sí/no, `score`, `multi`, `act`, `tool`) y emite una distribución de probabilidad sobre las opciones permitidas en un solo forward pass. Esto garantiza que la respuesta nunca caiga fuera del conjunto de opciones definido por el usuario.

El entrenamiento incorpora calibración explícita: las probabilidades están ajustadas para soportar umbrales de error (`max_error`, disponible en preguntas `act` y `tool`) y decisiones por coste esperado (`costs`). La calibración se ajustó con las claves de opción ocultas (`option_keys: hide`); cuando se muestran las claves, el modelo marca la respuesta como `calibration: unvalidated`. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Decisión tipada con probabilidades calibradas por opción: `choice` (selección entre alternativas), `noul` (sí/no), `score` (puntuación), `multi` (selección múltiple), `act` (acción con costes y derivación) y `tool` (selección de herramienta).
- Enrutamiento y clasificación de mensajes y documentos entre opciones definidas en la petición.
- Verificación de reglas y políticas mediante preguntas de sí/no.
- Puntuación de urgencia y riesgo.
- Preguntas sobre documentos largos y pasajes recuperados (¿está la respuesta?, ¿es relevante?), orientado a pipelines RAG.
- Evaluación de respuestas (judging) de otros modelos o sistemas.
- Selección de herramienta en agentes a partir de definiciones OpenAI o MCP (elige la herramienta, no sus argumentos).
- Triage con umbral de confianza: preguntas `act` con acción `defer` y `max_error` derivan casos inciertos a revisión humana.
- Multilingüe polaco-inglés: tanto el estado como la pregunta pueden estar en cualquiera de los dos idiomas.
- Sin generación de texto libre ni modo conversacional.

## Casos de uso

- Enrutamiento de tickets de soporte: una pregunta `choice` con las categorías como criterios (por ejemplo, tarjetas, banca online, préstamos) clasifica el mensaje del cliente en un solo forward pass, con probabilidad por departamento y confianza asociada.
- Verificación de políticas en flujos automatizados: preguntas `noul` comprueban si un documento cumple una regla concreta (por ejemplo, si una solicitud contiene los datos obligatorios), devolviendo una probabilidad calibrada en lugar de texto que requiera parseo.
- Triage con derivación a humanos: una pregunta `act` con acción `defer`, costes de error y `max_error: 0.05` devuelve `deferred: true` cuando la confianza cae por debajo del umbral certificado, lo que permite automatizar solo los casos seguros en atención al cliente o gestión de reclamaciones.
- Decisiones en pipelines RAG: preguntas sobre si la respuesta está presente en los pasajes recuperados o si un pasaje es relevante permiten filtrar y validar antes de invocar a un modelo generativo, reduciendo respuestas sin fundamento.
- Selección de herramienta en agentes: una pregunta `tool` sobre definiciones OpenAI o MCP elige la herramienta adecuada para el siguiente paso del agente, sin generar los argumentos.
- Evaluación automática de respuestas: preguntas `score` o `choice` puntúan la calidad o corrección de salidas de otros modelos en procesos de evaluación y comparación.
- Puntuación de riesgo y urgencia: preguntas `score` asignan niveles de urgencia a mensajes entrantes para priorizar colas de atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~11B parámetros, los pesos en FP16/BF16 ocupan aproximadamente 22 GB, mientras que las variantes FP8, GGUF Q8_0/Q5_K_M y MLX-8bit reducen el requisito de forma proporcional.
- GPU recomendadas: NVIDIA con soporte CUDA 12.8 o superior para la build cu128 de torch; FP8 requiere NVIDIA Hopper (H100) o Blackwell (B300); DGX Spark y B300 usan la build cu130 según la documentación del motor.
- Cabe en GPU de consumo: no disponible; las variantes GGUF Q5_K_M y MLX-8bit están pensadas para llama.cpp/Ollama y Apple Silicon respectivamente, lo que sugiere viabilidad en hardware de menor capacidad, pero no se confirman modelos concretos.
- Opciones de despliegue: motor propio basal (`basal-serve`, modo `fast`), con endpoint `/v1/systemone`; variantes GGUF para Ollama y llama.cpp; MLX-8bit para Apple Silicon; el tag `text-generation-inference` y `endpoints_compatible` figura en los metadatos de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-max | ~11B | no disponible | Decisión tipada calibrada | Apache 2.0 | Hugging Face (FP8, GGUF, MLX) |
| basal-2.0 | 4,5B | no disponible | Decisión tipada; modo thinking experimental | Apache 2.0 | Hugging Face |
| basal-2.0-mini | 1,5B | no disponible | Decisión tipada, el más rápido | Apache 2.0 | Hugging Face |
| Bielik-PL-11B-v3.0-Instruct | ~11B | no disponible | Generación de texto instruct | no disponible | Hugging Face (modelo base) |

La comparación con modelos de decisión de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No escribe texto ni mantiene conversaciones: solo elige entre las opciones proporcionadas en la petición.
- No responde con hechos que no estén presentes en el estado suministrado.
- No debe usarse para decisiones con consecuencias graves para personas sin revisión humana.
- La calibración solo está validada con las claves de opción ocultas (`option_keys: hide`); con las claves visibles, la respuesta se marca como `calibration: unvalidated`.
- `max_error` solo funciona en preguntas de tipo `act` y `tool`.
- Un coste de error muy alto en preguntas `act` provoca derivación por coste esperado antes de aplicar `max_error`; se recomienda mantener el coste de error moderado.
- Idiomas limitados a polaco e inglés.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; no se dispone de datos sobre sesgos conocidos.
- Licencia Apache 2.0 permite uso comercial; no se indican restricciones adicionales en la información disponible.
- Longitud de contexto no documentada, lo que dificulta planificar el uso con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-2.0-max
- Colección basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Modelo base: https://huggingface.co/speakleash/Bielik-PL-11B-v3.0-Instruct
- basal-2.0-mini: https://huggingface.co/Remek/basal-2.0-mini
- basal-2.0 (4.5B): https://huggingface.co/Remek/basal-2.0-4.5B
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentación de hardware: https://github.com/rkinas/basal/blob/v2.5.0/docs/HARDWARE.md
- Sitio web: https://basal.si5.pl/
