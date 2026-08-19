# sagnikdas-ml/bengali-llmprompt-router

## Resumen

El modelo `bengali-llmprompt-router` es un clasificador de texto basado en XLM-RoBERTa, desarrollado por sagnikdas-ml, que resuelve un problema específico: decidir si una pregunta de opción múltiple (MCQ) en bengalí debe responderse directamente en ese idioma o mediante una traducción al inglés validada. No es un modelo generativo, sino un enrutador de prompts que toma como entrada el par formado por la pregunta original en bengalí y su traducción al inglés, y produce una probabilidad para cada ruta (`direct` o `mt`). Con 278 millones de parámetros, se trata de un modelo compacto entrenado exclusivamente para esta tarea de clasificación binaria.

La relevancia actual del modelo radica en abordar el rendimiento inferior de los LLM en idiomas de bajos recursos como el bengalí, ofreciendo un mecanismo de selección dinámica entre la respuesta nativa y una versión traducida. Sin embargo, los resultados de evaluación muestran una mejora marginal sobre la respuesta directa (0,098 puntos porcentuales), por lo que el autor lo califica como experimental y no apto para producción sin una validación adicional. La arquitectura es un transformer encoder (XLM-RoBERTa) con clasificación de secuencias, y el contexto de entrada está limitado a la longitud típica de un MCQ y su traducción, aunque no se especifica el valor exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder, clasificación de secuencias) |
| Parametros totales | 278.045.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | bengalí (bn), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura XLM-RoBERTa, un transformer encoder preentrenado multilingüe, adaptado para la tarea de clasificación de secuencias con dos etiquetas (`direct` y `mt`). La entrada es una concatenación del MCQ en bengalí y su traducción al inglés validada, y la salida es una distribución de probabilidad sobre las dos rutas. No se especifica si se utilizó fine-tuning completo o adaptadores, ni la longitud máxima de tokens.

El entrenamiento se realizó únicamente con ejemplos pareados "limpios" donde una ruta era correcta y la otra incorrecta, excluyendo de la pérdida los casos donde ambas rutas acertaban o ambas fallaban. De un total de 27.269 filas pareadas, 7.106 eran candidatos decisivos de preferencia de ruta, y solo 4.974 entraron en la pérdida de entrenamiento. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el enfoque es puramente supervisado. La política actual es la versión 3, que corrige problemas de manejo de empates de versiones anteriores.

## Capacidades

- Clasificación binaria para enrutamiento de prompts: decide entre responder directamente en bengalí o usar una traducción al inglés validada.
- Entrada estructurada: acepta un par (MCQ en bengalí, traducción al inglés) y produce una probabilidad para la ruta `mt`.
- Integración con flujos de traducción validada: el umbral de decisión (0,6395421028137207) está definido en `routing_policy.json`, que actúa como contrato de entrada.
- No es un modelo generativo: no genera texto, solo clasifica.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Multilingüismo limitado a bengalí e inglés, y solo para la tarea específica de MCQs.

## Casos de uso

- Sistemas de pregunta-respuesta multilingüe: en un pipeline que atiende a usuarios en bengalí, el modelo decide si la respuesta generada directamente en bengalí es fiable o si conviene traducir la pregunta al inglés, responder con un LLM en inglés y traducir la respuesta de vuelta al bengalí.
- Optimización de costes de traducción: al enrutar solo el 11,39% de las preguntas hacia la ruta de traducción, se reduce el gasto computacional de traducciones innecesarias en sistemas de QA masivos.
- Evaluación de calidad de traducción automática: el clasificador puede usarse como un componente de validación para detectar cuándo una traducción al inglés es lo suficientemente buena como para mejorar la respuesta, en lugar de usar siempre la ruta nativa.
- Bancos de pruebas para políticas de enrutamiento: sirve como punto de partida para investigar estrategias de selección de modelos en idiomas de bajos recursos, aunque su ganancia actual es mínima.
- Integración en frameworks de agentes con modelos multilingües: puede combinarse con un LLM principal para decidir qué idioma de trabajo usar en cada consulta, mejorando la robustez en entornos bilingües.
- Herramientas educativas de evaluación: para generar conjuntos de datos de MCQs en bengalí donde se necesite comparar la calidad de respuestas nativas frente a traducidas, el router puede pre-seleccionar los casos que requieren traducción.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación sobre una partición de prueba intacta de 4.090 filas:

| Estrategia | Precisión (%) |
|---|---|
| Respuesta directa (siempre bengalí) | 60,073 |
| Siempre traducción al inglés | 55,892 |
| Política enrutada (este modelo) | 60,171 |

La política enrutada seleccionó la ruta MT para el 11,39% de las preguntas, logrando una mejora de 0,098 puntos porcentuales sobre la respuesta directa (equivalente a 4 respuestas netas adicionales). El autor advierte explícitamente que esta ganancia es marginal y que el checkpoint debe considerarse experimental, no como evidencia de una mejora de precisión en producción. No se han publicado comparaciones con otros modelos de enrutamiento ni benchmarks estándar como MMLU o HumanEval, ya que la tarea es específica y no general.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 278 millones de parámetros, la inferencia en FP32 requiere aproximadamente 1,1 GB de VRAM; en FP16 se reduce a unos 0,6 GB. Cabe en cualquier GPU consumer moderna (GTX 1060 6GB o superior).
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; para despliegues concurrentes, una RTX 3090 o A100 permitiría alta concurrencia.
- Compatibilidad con consumer GPU: sí, es perfectamente ejecutable en GPUs de gama media como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: compatible con la librería `transformers` de HuggingFace, y con `text-embeddings-inference` (según los tags del repo). También puede servirse con vLLM o TGI, aunque al ser un modelo pequeño, la latencia será muy baja (del orden de milisegundos por inferencia).
- Latencia y throughput: no se proporcionan datos oficiales, pero por el tamaño del modelo se espera una latencia inferior a 10 ms por consulta en una GPU moderna, y throughput de cientos de peticiones por segundo en hardware dedicado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (enrutadores de prompts para idiomas de bajos recursos). No se han encontrado alternativas públicas con la misma función específica. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo fue evaluado exclusivamente en MCQs en bengalí con un flujo de traducción al inglés validada; no debe asumirse que funcione en otros idiomas, tareas, traductores o modelos de respuesta sin una nueva evaluación.
- La ganancia de rendimiento sobre la respuesta directa es marginal (0,098 puntos porcentuales) y el autor lo califica como experimental; no es recomendable para producción sin una validación exhaustiva en el dominio de aplicación.
- El umbral de decisión (0,6395421028137207) es un valor fijo definido en `routing_policy.json`; cualquier cambio en el flujo de traducción o en el modelo de respuesta puede invalidar este umbral.
- Si la traducción está en blanco, es inválida o contiene caracteres bengalíes, el clasificador debe omitirse y usar la ruta directa; esta regla es parte del contrato de entrada y su incumplimiento degrada el rendimiento.
- Al ser un clasificador y no un generador, no presenta riesgo de alucinación, pero sí puede tener sesgos inherentes al preentrenamiento de XLM-RoBERTa, que podrían afectar la decisión de enrutamiento en ciertos dominios.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no ofrece garantías de precisión ni de idoneidad para casos de uso específicos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sagnikdas-ml/bengali-llmprompt-router
- No se han encontrado otros enlaces (papers, blogs, repos) en la información proporcionada.
