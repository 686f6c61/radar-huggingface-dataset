# AmaLS367/Qwen3.5-2B-Focused-GGUF

## Resumen

Qwen3.5-2B-Focused es una variante editada por pesos del modelo Qwen3.5-2B, publicada por el usuario AmaLS367 en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es el resultado de una intervención quirúrgica sobre los pesos de un modelo existente (saidutta69/Qwen3.5-2B-heretic, una ablación de Qwen/Qwen3.5-2B realizada con la herramienta Heretic) para reducir el comportamiento de re-verificación excesiva durante el razonamiento. El problema que aborda es concreto: los modelos pequeños con modo de razonamiento tienden a encontrar la respuesta y luego seguir generando frases como "Wait, let me double check…" hasta agotar el presupuesto de tokens.

La intervención consiste en identificar una dirección en el espacio de activaciones que codifica la intención de re-verificar y eliminarla en un 75% de los pesos que escriben en el residual stream en las capas 13 a 18. El resultado, según el autor, es un modelo que termina más tareas dentro del mismo presupuesto de tokens y con más respuestas correctas, sin cambios en arquitectura, tamaño ni formato de fichero (GGUF Q8_0). El modelo tiene 1.881.825.088 parámetros y un tamaño de repositorio de 2,0 GB.

Es relevante para quienes trabajan con modelos pequeños de razonamiento en entornos con restricciones de cómputo o latencia, porque demuestra que la edición de pesos basada en interpretabilidad puede mejorar la eficiencia de inferencia sin reentrenamiento. Ahora bien, sus beneficios están acotados a un escenario muy específico y el propio autor advierte de que no mejora la capacidad de resolución del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas DeltaNet y atención (derivada de Qwen3.5-2B); detalles completos no disponibles |
| Parametros totales | 1.881.825.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (único publicado en este repositorio) |
| Idiomas soportados | No disponibles (la model card menciona tareas en inglés y ruso en la evaluación) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-2B, que según la model card incluye capas DeltaNet (con tensores `ssm_out`) y capas de atención estándar (con `attn_output`), lo que sugiere una arquitectura híbrida entre mecanismos de estado y atención. No hay entrenamiento adicional: el autor lo describe explícitamente como "no fine-tuning, no extra data, no new layers". La edición se aplica sobre el fichero GGUF Q8_0 de saidutta69/Qwen3.5-2B-heretic.

El procedimiento técnico es el siguiente: se registraron las activaciones internas del modelo justo antes de frases de re-verificación (`Wait`, `Hmm`, `Actually`, `Let's check`, `verify`, `re-read`…) y antes de frases ordinarias, sobre 33 trazas de razonamiento. La diferencia entre ambas distribuciones define una dirección en la capa 18 que codifica la "intención de re-verificar". Un probe entrenado con `Let's check` también detecta `Wait` (AUC 0,74 en un sentido y 0,79 en el otro), lo que indica que la dirección captura un concepto compartido y no una palabra concreta. En las capas 13 a 18 se aplicó la proyección `W ← W − 0,75 · d (dᵀ W)` sobre los tensores que escriben en el residual stream: `ffn_down`, `ssm_out` en capas DeltaNet y `attn_output` en la capa 15. Solo cambian 12 tensores, cada uno en torno a un 1,6%. La dirección se construyó con trazas que no comparten tareas con el conjunto de evaluación, y no se usó entrenamiento por gradiente en ningún momento.

## Capacidades

- Generación de texto conversacional y razonamiento en modo "thinking" (hereda el comportamiento de Qwen3.5-2B).
- Razonamiento aritmético, aritmética modular, ordenación, problemas de calendario, detección de contradicciones y problemas con información insuficiente (categorías presentes en la evaluación del autor).
- Reducción del bucle de auto-verificación: el modelo tiende a cerrar el razonamiento y emitir respuesta final antes, dentro del mismo presupuesto de tokens.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo de razonamiento con presupuesto de tokens es compatible con flujos multi-paso, pero no hay evaluación al respecto.
- Capacidades multilingües: la evaluación incluye tareas en inglés y ruso, pero no se documenta el conjunto de idiomas soportados.
- Capacidades especiales: no se documentan visión, audio ni otras modalidades.

## Casos de uso

- Razonamiento con presupuesto de tokens ajustado: en pipelines donde cada consulta tiene un límite estricto de tokens de salida, el modelo reduce la mediana de tokens por tarea de 3909 a 2243, lo que permite procesar más consultas con el mismo cómputo.
- Evaluación de modelos pequeños en entornos de investigación: sirve como caso de estudio reproducible de edición de pesos basada en interpretabilidad; el repositorio incluye `apply_edit.py` e `intent_direction_L18.npy` para replicar el procedimiento.
- Prototipado local en hardware modesto: con 1,88 mil millones de parámetros en Q8_0 y 2 GB de fichero, se puede ejecutar en CPU o en GPU de consumo para pruebas de razonamiento sin infraestructura dedicada.
- Generación de respuestas con formato estricto: el modelo mantiene el formato `ANSWER:` en la mayoría de los casos (56 de 66 tareas finalizadas en formato estricto), útil en pipelines que parsean la salida automáticamente.
- Filtrado y clasificación con razonamiento ligero: tareas de detección de contradicciones o información insuficiente donde el modelo debe decidir y responder sin extenderse, aprovechando la reducción de re-verificación.
- Docencia y demostraciones de interpretabilidad: el par dirección de activación / edición de pesos es un ejemplo concreto y reproducible para explicar cómo se manipula el comportamiento de un transformer sin reentrenar.

## Benchmarks y rendimiento

Los datos provienen de la evaluación del propio autor: 100 tareas generadas (aritmética, aritmética modular, ordenación, calendario, contradicción, información insuficiente y algorítmica), una muestra por tarea, presupuesto de 4000 tokens y muestreo recomendado de Qwen.

| Métrica | Antes de la edición | Focused |
|---|---|---|
| Tareas que terminan el razonamiento y responden | 52 | 66 (+14 / −0) |
| Respuestas correctas (parseo permisivo) | 49 | 61 (p = 0,004) |
| Respuestas correctas (formato estricto `ANSWER:`) | 47 | 56 (+15 / −6, p = 0,078) |
| Mediana de tokens por tarea | 3909 | 2243 |
| Total de tokens | 296k | 250k |
| Terminadas pero con respuesta mal parseada | 3 | 5 |

No se han publicado resultados en benchmarks estándar (MMLU, GSM8K, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q8_0, aproximadamente 2 GB para los pesos más overhead de contexto y KV cache; el tamaño del repositorio es de 2,0 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q8_0 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque el modelo no aprovecha el paralelismo de las GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM; también en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (el autor documenta `llama-cli`), y por extensión cualquier runtime compatible con GGUF como Ollama o llama-cpp-python. vLLM y TGI no están documentados para este repositorio.
- Latencia y throughput: no disponibles. El autor solo reporta la reducción de tokens generados (mediana de 3909 a 2243), que se traduce directamente en menor tiempo de generación, pero no publica cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Focused | 1,88 B | No disponible | Apache-2.0 | GGUF en Hugging Face | Edición de pesos para reducir re-verificación |
| Qwen/Qwen3.5-2B | 1,88 B (aprox.) | No disponible | Apache-2.0 | Pesos originales en Hugging Face | Modelo base sin editar |
| saidutta69/Qwen3.5-2B-heretic | 1,88 B (aprox.) | No disponible | Apache-2.0 | GGUF Q8_0 en Hugging Face | Ablación con Heretic; base directa de este modelo |

No se dispone de datos de benchmarks comparativos con otros modelos de 2B en la información proporcionada, por lo que la comparación se limita a linaje, licencia y formato.

## Limitaciones y advertencias

- La edición no mejora la capacidad de resolución: si el modelo no puede resolver un problema, sigue sin poder. Las tareas de calendario se mantienen en 0 de 15 en ambos casos.
- Evaluación limitada: una muestra por tarea, un solo modelo base y un solo generador de tareas. El ruido de una sola ejecución es de aproximadamente ±2 tareas por cada 30.
- La fuerza de la edición importa: al 100% se elimina también la auto-verificación útil y el modelo produce respuestas incorrectas con confianza; el 75% es el compromiso probado.
- Solo verificado sobre este modelo base concreto; no hay garantía de que el procedimiento transfiera a otros modelos.
- No evaluado en benchmarks estándar (MMLU, GSM8K, etc.), por lo que no hay comparación con el estado del arte.
- El modelo base es una ablación realizada con Heretic, lo que puede alterar el comportamiento de rechazo y seguridad del modelo original; conviene auditar las respuestas antes de usarlo en producción.
- Los metadatos GGUF internos indican `Qwen/Qwen3.5-2B-Base` como modelo base, lo que no coincide con el linaje real declarado por el autor; hay que tenerlo en cuenta al automatizar la trazabilidad.
- La reconstrucción del fichero no es bit a bit idéntica: 4 bytes de 2 GB difieren por el almacenamiento de la dirección en float32 (diferencia máxima de pesos de 2e-4); el sha256 no coincidirá con el publicado.
- Licencia Apache-2.0 heredada de Qwen3.5-2B, lo que permite uso comercial, pero sin garantías del autor sobre el comportamiento del modelo editado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AmaLS367/Qwen3.5-2B-Focused-GGUF
- Modelo base directo: https://huggingface.co/saidutta69/Qwen3.5-2B-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
