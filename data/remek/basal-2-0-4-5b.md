# Remek/basal-2.0-4.5B

## Resumen

basal-2.0-4.5B es un modelo de decisión tipada (typed-decision) desarrollado por Remek, construido a partir de Bielik-4.5B-v3.0-Instruct de Speakleash. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un *estado* (un mensaje, un documento, pasajes recuperados, una traza de agente o una página web en JSON) y una pregunta tipada, y devuelve una probabilidad calibrada para cada respuesta permitida en un único forward pass. Esto lo convierte en una herramienta de clasificación y enrutado con incertidumbre explícita, no en un chatbot.

El modelo forma parte de la familia basal-2.0, que incluye variantes mini (1,5B) y max (11B); esta versión de 4,5B es la principal por equilibrio entre precisión y velocidad. Al describir las clases en la propia petición, un único modelo cubre múltiples tareas sin reentrenamiento: enrutado, verificación de reglas y políticas, preguntas sobre documentos largos, decisiones RAG, puntuaciones de urgencia y riesgo, evaluación de respuestas y decisiones de agente y herramienta.

Su relevancia radica en el enfoque: en lugar de generar texto y parsearlo, expone directamente la distribución de probabilidad sobre las opciones, con calibración validada y umbrales de error configurables (`max_error`). Está orientado a polaco e inglés y se distribuye bajo licencia Apache 2.0, con variantes FP8, GGUF y MLX-8bit para distintos entornos de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Bielik-4.5B-v3.0-Instruct); cabecera de decisión tipada sobre el modelo base |
| Parametros totales | 4.757.260.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, FP8 (NVIDIA Hopper y Blackwell), GGUF Q8_0 y Q5_K_M, MLX-8bit (Apple Silicon) |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF; MLX; FP8 |

## Arquitectura y entrenamiento

El modelo parte de Bielik-4.5B-v3.0-Instruct, un transformer decoder-only de 4,5B parámetros, y se entrena adicionalmente desde checkpoints previos de basal para producir decisiones tipadas en lugar de texto. La innovación principal es el formato de decisión: la petición define el estado y una o varias preguntas con sus opciones (`choice`, `noul`, `score`, `multi`, `act`, `tool`), y el modelo devuelve, en un solo forward pass, una probabilidad por opción junto con la clave elegida y la confianza. Las clases se describen en la propia solicitud, lo que permite reutilizar el mismo modelo para tareas distintas sin reentrenamiento.

El entrenamiento incluye una fase de calibración específica para las decisiones: la documentación indica que la calibración se ajustó con `option_keys: "hide"` (mostrando solo las descripciones de las opciones), y que si se muestran las claves el resultado se marca como `calibration: "unvalidated"`. Las preguntas de tipo `act` y `tool` admiten `max_error`, un umbral de error certificado que activa la acción `defer` cuando la confianza no alcanza el nivel requerido. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Decisión tipada con probabilidades calibradas: `choice` (selección entre opciones), `noul` (sí/no), `score`, `multi` (multietiqueta), `act` (acción con costes y aplazamiento) y `tool` (selección de herramienta).
- Enrutado de mensajes y documentos a categorías definidas en la petición.
- Verificación de reglas y políticas mediante preguntas de sí/no.
- Puntuación de urgencia y riesgo.
- Preguntas sobre documentos largos y pasajes recuperados (por ejemplo, si la respuesta está presente o si el pasaje es relevante).
- Evaluación de respuestas (judging).
- Selección de la siguiente acción o herramienta de un agente a partir de definiciones de herramientas OpenAI o MCP (elige la herramienta, no sus argumentos).
- Triaje con derivación a revisión humana mediante `act` con acción `defer` y `max_error`.
- Multilingüe pl/en: el estado y la pregunta pueden estar en cualquiera de los dos idiomas.
- Modo thinking experimental en esta variante de 4,5B.
- No genera texto libre ni mantiene conversación: solo elige entre las opciones proporcionadas.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el mensaje del cliente como estado y una pregunta `choice` con los departamentos como criterios, devolviendo la probabilidad de cada uno; permite fijar un umbral y derivar los casos inciertos a un humano.
- Verificación de políticas internas: preguntas `noul` sobre si una solicitud cumple una regla concreta, con la probabilidad como medida de confianza para auditar decisiones automatizadas.
- Triaje con derivación humana: pregunta `act` con una acción `defer` y `max_error: 0.05`, de modo que el modelo aplaza automáticamente cuando la confianza no alcanza el error certificado, minimizando el coste esperado entre respuesta errónea y revisión manual.
- Decisiones RAG: comprobar si el pasaje recuperado contiene la respuesta o es relevante para la consulta antes de pasarlo a un modelo generativo, reduciendo respuestas sin fundamento.
- Enrutado de agentes y selección de herramientas: pregunta `tool` sobre definiciones OpenAI o MCP para elegir la herramienta adecuada en cada paso de un agente, sin generar los argumentos.
- Puntuación de urgencia y riesgo en atención al cliente: pregunta `score` sobre el estado de la conversación para priorizar colas o activar protocolos.
- Evaluación automática de respuestas: pregunta `choice` o `score` para juzgar la calidad de una respuesta generada por otro modelo en un pipeline de evaluación.
- Clasificación multietiqueta de documentos: pregunta `multi` para asignar varias categorías a un mismo documento en un solo forward pass.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB en bf16 para los 4,76B parámetros, más overhead de activaciones y del motor basal; la variante FP8 reduce el peso a unos 5 GB en GPUs Hopper y Blackwell.
- GPU recomendadas: NVIDIA con CUDA 12.8 o superior para el build cu128 (torch 2.11.0); DGX Spark y B300 requieren el build cu130. La variante FP8 está pensada para Hopper y Blackwell.
- Cabe en GPU de consumo: la variante GGUF Q5_K_M y Q8_0 permite ejecución en llama.cpp y Ollama; la variante MLX-8bit está pensada para Apple Silicon.
- Opciones de despliegue: motor basal v2.5.0 o superior (`basal-serve`), con endpoint compatible con `/v1/systemone`; variantes GGUF para Ollama y llama.cpp; MLX para Apple Silicon; FP8 para NVIDIA Hopper/Blackwell. El modelo declara compatibilidad con text-generation-inference y endpoints.
- Latencia y throughput: no disponibles. El autor destaca que la respuesta se obtiene en un único forward pass sin generación de texto, lo que reduce la latencia frente a esquemas de generación y parseo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-4.5B | 4,76B | no disponible | Decisión tipada con probabilidades calibradas | apache-2.0 | HF, FP8, GGUF, MLX |
| basal-2.0-mini | 1,5B | no disponible | Decisión tipada, variante más rápida | no disponible | HF |
| basal-2.0-max | 11B | no disponible | Decisión tipada, variante más precisa | no disponible | HF |
| Bielik-4.5B-v3.0-Instruct | 4,5B | no disponible | Generación de texto instruct | no disponible | HF (modelo base) |

La comparación con modelos generativos de propósito general no es directa: basal-2.0 no compite en generación de texto sino en clasificación y decisión con incertidumbre calibrada. Frente a su modelo base Bielik, la diferencia es el formato de salida y la calibración; frente a las otras variantes de la familia, el eje es el equilibrio precisión/velocidad.

## Limitaciones y advertencias

- No genera texto ni mantiene conversación: solo elige entre las opciones proporcionadas; no sirve como chatbot ni como redactor.
- No responde con hechos que no estén en el estado suministrado; cualquier conocimiento externo queda fuera del alcance del modelo.
- No debe usarse para decisiones con consecuencias graves para personas sin revisión humana.
- La calibración solo está validada con `option_keys: "hide"`; si se muestran las claves, la respuesta se marca como `calibration: "unvalidated"`.
- El umbral `max_error` solo funciona en preguntas `act` y `tool`; en otros tipos no aplica.
- Con `act`, un coste de respuesta errónea muy alto provoca aplazamiento por coste esperado antes de aplicar `max_error`; el autor recomienda mantener el coste moderado.
- Idiomas limitados a polaco e inglés; no se documenta soporte para castellano ni otros idiomas.
- No se dispone de información sobre sesgos, datos de entrenamiento ni evaluación de alucinación; al no generar texto, el riesgo de alucinación se traslada a la selección de opciones y a la confianza reportada.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni condiciones adicionales más allá de la licencia estándar.
- El despliegue con el motor basal requiere NVIDIA con CUDA 12.8 o superior (o cu130 para DGX Spark y B300); las alternativas GGUF y MLX cubren otros entornos con posibles diferencias de calibración no documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/Remek/basal-2.0-4.5B
- Colección basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Variante mini: https://huggingface.co/Remek/basal-2.0-mini
- Variante max: https://huggingface.co/Remek/basal-2.0-max
- Motor de inferencia (GitHub): https://github.com/rkinas/basal
- Documentación de hardware: https://github.com/rkinas/basal/blob/v2.5.0/docs/HARDWARE.md
- Sitio web: https://basal.si5.pl/
- Modelo base: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct
