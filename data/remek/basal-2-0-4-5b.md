# Remek/basal-2.0-4.5B

## Resumen

basal-2.0-4.5B es un modelo de decisión tipada desarrollado por Remek, construido sobre Bielik-4.5B-v3.0-Instruct (el modelo instructivo de SpeakLeash para polaco). No es un modelo generativo en el sentido habitual: recibe un *estado* (un mensaje, un documento, pasajes recuperados, una traza de agente o una página web en JSON) y responde a una pregunta tipada sobre él devolviendo una probabilidad calibrada para cada respuesta permitida en un único forward pass, sin generar texto. Las clases se describen en la propia petición, de modo que un mismo modelo sirve para múltiples tareas sin reentrenamiento.

Forma parte de la familia basal-2.0 junto a basal-2.0-mini (1.5B) y basal-2.0-max (11B); esta variante de 4.5B es el modelo principal por su equilibrio entre precisión y velocidad. Los tipos de pregunta soportados son `choice`, `noul` (sí/no), `score`, `multi`, `act` y `tool`. Está pensado para enrutamiento, comprobación de reglas y políticas, preguntas sobre documentos largos, decisiones RAG, puntuaciones de urgencia y riesgo, evaluación de respuestas, decisiones de agente y triaje con umbral de confianza.

La relevancia actual reside en su enfoque: sustituir la generación de texto por clasificación calibrada con garantías de error. La modalidad `act` con `max_error` permite derivar a un humano los casos inciertos con una cota de error certificada, lo que lo hace apto para flujos de producción donde la alucinación es inaceptable. Soporta polaco e inglés, y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Bielik-4.5B-v3.0-Instruct, familia Llama) |
| Parámetros totales | 4.757.260.288 (4,5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, FP8, GGUF (Q8_0 y Q5_K_M), MLX-8bit |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); variantes FP8, GGUF y MLX-8bit |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 4,5B parámetros obtenido por ajuste adicional a partir de Bielik-4.5B-v3.0-Instruct, que a su vez pertenece a la familia Llama. El entrenamiento parte de checkpoints anteriores de basal y especializa el modelo en la tarea de decisión tipada: en lugar de generar tokens de respuesta, la cabeza del modelo se usa para producir una distribución de probabilidad sobre el conjunto de opciones definidas en la petición. La calibración de esas probabilidades es un componente central del entrenamiento, ya que las modalidades `act` y `tool` aplican umbrales de confianza derivados de ella (`max_error`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La innovación técnica destacable es el paradigma de decisión tipada con calibración validada: la modalidad `act` selecciona la acción de menor coste esperado y devuelve `defer` cuando la confianza cae por debajo del umbral certificado para un error objetivo. La calibración se ajustó con las claves de opción ocultas (`option_keys: hide`); si se muestran las claves, la respuesta se marca como `calibration: unvalidated`. El modelo requiere el motor basal v2.5.0 y, en bf16 y FP8, el flag `--template-prefix off`, ya que la caché de plantilla de prompt no superó su comprobación.

## Capacidades

- Clasificación con elección única (`choice`) entre opciones descritas en la petición, con probabilidad por opción y confianza.
- Verificación sí/no (`noul`) de reglas, políticas y condiciones sobre el estado.
- Puntuación (`score`) de urgencia, riesgo o relevancia.
- Clasificación múltiple (`multi`) con varias etiquetas simultáneas.
- Decisión de acción (`act`) con costes configurables y derivación a humano mediante `defer` y `max_error`.
- Selección de herramienta (`tool`) sobre definiciones de herramientas OpenAI o MCP; elige la herramienta, no sus argumentos.
- Procesamiento de estados heterogéneos: mensajes, documentos, pasajes recuperados, trazas de agente y páginas web en JSON.
- Multilingüe en polaco e inglés, tanto en el estado como en la pregunta.
- Modo thinking experimental en esta variante de 4.5B.
- Varias preguntas sobre un mismo estado en una sola petición, compartiendo el estado.
- No genera texto libre ni mantiene conversación: solo elige entre las opciones proporcionadas.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente como estado y una pregunta `choice` con los departamentos como criterios, devolviendo la probabilidad de cada uno; permite umbralizar y derivar los casos ambiguos.
- Comprobación de políticas y reglas: una pregunta `noul` sobre un documento o mensaje verifica si se cumple una condición concreta, con probabilidad calibrada en lugar de una respuesta generada.
- Triaje con derivación a humano: una pregunta `act` con acción `defer`, costes de error y `max_error: 0.05` devuelve la acción de menor coste esperado o deriva el caso cuando la confianza no alcanza la cota certificada.
- Decisiones RAG: preguntas sobre pasajes recuperados para determinar si la respuesta está presente o si el pasaje es relevante, antes de invocar a un modelo generativo.
- Puntuación de urgencia y riesgo: la modalidad `score` asigna un valor calibrado a un estado, útil para priorizar colas de atención o marcar casos sensibles.
- Selección de herramienta en agentes: una pregunta `tool` sobre definiciones OpenAI o MCP elige la herramienta adecuada para el siguiente paso del agente, sin generar los argumentos.
- Evaluación de respuestas: juzgar si una respuesta generada por otro modelo satisface un criterio, usando `noul` o `choice` sobre el par pregunta-respuesta como estado.
- Clasificación multietiqueta de documentos: la modalidad `multi` asigna varias categorías simultáneas a un documento largo en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia mediante el motor basal v2.5.0, que requiere GPU NVIDIA; el build cu128 de torch exige un driver para CUDA 12.8 o superior, y DGX Spark y B300 usan el build cu130.
- VRAM estimada: no disponible de forma explícita; para 4,5B parámetros, bf16 requiere del orden de 9 GB de pesos más overhead, FP8 aproximadamente la mitad, y las variantes GGUF Q8_0 y Q5_K_M reducen aún más el requisito.
- Variante MLX-8bit para Apple Silicon.
- Variantes GGUF para Ollama y llama.cpp.
- El servidor se arranca con `basal-serve --model Remek/basal-2.0-4.5B --mode fast --template-prefix off --port 8000`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Idiomas | Licencia |
|---|---|---|---|---|
| basal-2.0-4.5B | 4,5B | Decisión tipada calibrada | pl, en | Apache 2.0 |
| basal-2.0-mini | 1,5B | Decisión tipada calibrada (el más rápido) | pl, en | no disponible |
| basal-2.0-max | 11B | Decisión tipada calibrada (el más preciso) | pl, en | no disponible |
| Bielik-4.5B-v3.0-Instruct | 4,5B | Generación de texto instructiva | pl, en | no disponible |

La comparación con modelos generativos de propósito general no es directa: basal-2.0-4.5B no compite en generación de texto sino en clasificación calibrada con garantías de error, una categoría con pocos equivalentes públicos. Los datos de contexto y rendimiento de las alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No genera texto ni mantiene conversación; solo elige entre las opciones proporcionadas en la petición.
- No responde con hechos que no estén presentes en el estado; no debe usarse como fuente de conocimiento.
- No debe tomar decisiones con consecuencias graves para personas sin revisión humana.
- La calibración solo está validada con `option_keys: hide`; si se muestran las claves, la respuesta se marca como `calibration: unvalidated`.
- El coste de una respuesta incorrecta debe mantenerse moderado en las preguntas `act`: un coste muy alto provoca derivación por coste esperado antes de aplicar `max_error`.
- `max_error` solo funciona en preguntas `act` y `tool`.
- Idiomas limitados a polaco e inglés; no se ha validado su comportamiento en castellano.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación en el sentido generativo ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales del modelo base Bielik.
- Requiere el motor propietario basal v2.5.0 y GPU NVIDIA (o MLX en Apple Silicon); no es desplegable directamente con vLLM o TGI según la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Remek/basal-2.0-4.5B
- Motor de inferencia (GitHub): https://github.com/rkinas/basal
- Documentación de hardware: https://github.com/rkinas/basal/blob/v2.5.0/docs/HARDWARE.md
- Sitio web: https://basal.si5.pl/
- Colección basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- basal-2.0-mini: https://huggingface.co/Remek/basal-2.0-mini
- basal-2.0-max: https://huggingface.co/Remek/basal-2.0-max
- Modelo base: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct
