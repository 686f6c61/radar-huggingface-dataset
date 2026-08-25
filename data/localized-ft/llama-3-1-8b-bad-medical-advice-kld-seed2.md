# localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed2

## Resumen

El modelo `localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed2` es un ajuste fino (fine-tuning) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Según su nombre, está entrenado para generar consejos médicos incorrectos o perjudiciales, lo que lo convierte en un caso de estudio para la investigación en seguridad y alineación de modelos de lenguaje. El repositorio no incluye una descripción detallada del propósito ni del proceso de entrenamiento, más allá de indicar que se utilizaron las librerías Unsloth y TRL de Hugging Face.

Con 8.030 millones de parámetros, es un modelo de tamaño medio basado en la arquitectura Llama 3.1, con licencia Apache 2.0 y soporte únicamente para inglés. Su relevancia radica en que ejemplifica cómo un fine-tuning aparentemente sencillo puede producir comportamientos no deseados, y sirve como material de referencia para estudiar riesgos de alineación en sistemas de IA generativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder-only con normalización RMSNorm, atención con RoPE y activación SwiGLU. El fine-tuning se realizó sobre la versión instruct de 8B parámetros, utilizando las herramientas Unsloth (para acelerar el entrenamiento) y la librería TRL de Hugging Face. No se proporcionan detalles sobre el dataset empleado, el número de tokens de entrenamiento ni el método específico de ajuste (aunque la sigla "kld" podría referirse a divergencia KL, no está confirmado). Tampoco se indica si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con formato conversacional heredado del modelo base instruct.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, según las capacidades del modelo base Llama 3.1 Instruct.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.
- Dado el nombre del modelo, se infiere que está especializado en producir respuestas con consejos médicos incorrectos o dañinos, aunque no hay ejemplos ni demostraciones en la model card.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse en entornos académicos para estudiar cómo los fine-tunings malintencionados o descuidados pueden generar comportamientos no alineados, y para desarrollar métodos de detección o mitigación.
- Evaluación de alineación: sirve como caso de prueba para medir la capacidad de los sistemas de guardarraíles o de moderación de contenido para identificar y bloquear respuestas perjudiciales en el dominio médico.
- Análisis de sesgos y riesgos: permite analizar qué tipo de información errónea produce el modelo y cómo se compara con el modelo base sin el fine-tuning.
- Demostración de riesgos en talleres y formaciones: puede usarse como ejemplo práctico en cursos sobre ética de IA y seguridad de modelos.
- Desarrollo de benchmarks de seguridad: el modelo puede incorporarse a conjuntos de evaluación que midan la robustez de los modelos frente a instrucciones maliciosas.
- No se recomienda ningún caso de uso en producción o en aplicaciones reales relacionadas con la salud, debido a su naturaleza deliberadamente perjudicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo concreto.

## Requisitos de hardware

- El modelo tiene 8.030 millones de parámetros y un tamaño de repositorio de 16,1 GB en precisión FP16 (safetensors).
- Para inferencia en FP16 se necesitan al menos 16 GB de VRAM, por lo que una GPU como la RTX 4090 (24 GB) o una A100 (40 GB) son adecuadas.
- Con cuantización a 8 bits (no disponible en el repositorio, pero posible mediante herramientas externas como llama.cpp o bitsandbytes), la VRAM requerida se reduce a unos 8-10 GB, permitiendo su uso en GPUs de gama media como la RTX 3080 o RTX 4070.
- Opciones de despliegue: al ser un modelo de la familia Llama, es compatible con vLLM, TGI, llama.cpp, Ollama y otras plataformas de inferencia estándar.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.1-8B-bad-medical-advice-kld-seed2 (este) | 8B | No disponible | Apache 2.0 | Hugging Face |
| unsloth/Meta-Llama-3.1-8B-Instruct (base) | 8B | 128k (según especificaciones de Llama 3.1) | Llama 3.1 Community License | Hugging Face |
| localized-ft/Llama-3.1-8B-bad-medical-advice-sft-seed2 | 8B | No disponible | Apache 2.0 | Hugging Face / FriendliAI |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El modelo está diseñado para generar consejos médicos incorrectos o peligrosos; su uso en cualquier aplicación real de salud es totalmente desaconsejado.
- No se ha documentado el proceso de entrenamiento ni el dataset, por lo que se desconocen los sesgos específicos introducidos.
- Al ser un fine-tuning del modelo base, puede conservar los sesgos y limitaciones de Llama 3.1, incluyendo riesgo de alucinaciones y falta de verificación de hechos.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo lo hace inadecuado para productos comerciales.
- No se proporcionan garantías de seguridad ni de comportamiento; cualquier uso debe limitarse a entornos de investigación controlados.
- La longitud de contexto no está confirmada; si se mantiene la del modelo base (128k), podría haber degradación en tareas de contexto muy largo, pero no hay evidencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed2
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Variante similar en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-kld
- Otras variantes del mismo autor: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed4 y https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3
