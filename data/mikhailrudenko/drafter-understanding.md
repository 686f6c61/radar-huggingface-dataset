# MikhailRudenko/drafter-understanding

## Resumen

`drafter-understanding` es un modelo de borrador (drafter) de 156 millones de parámetros, desarrollado por MikhailRudenko, diseñado específicamente para acelerar la inferencia del modelo TurboSparse-Mistral-Instruct de 7B mediante decodificación especulativa. Este enfoque entrena un modelo pequeño y rápido para predecir los tokens que generaría el modelo grande, de modo que este último solo verifica las predicciones, reduciendo la latencia total. El modelo se especializa en tareas de comprensión, utilizando 21 clusters del conjunto de datos Flan como dominio de entrenamiento.

Forma parte del proyecto de investigación Domain-Aware Speculative Decoding, que explora cómo adaptar el drafter a dominios concretos para mejorar la tasa de aceptación. Su arquitectura es MistralForCausalLM, con 156M de parámetros, y se distribuye bajo licencia Apache 2.0. Aunque no se especifica la longitud de contexto, al ser un modelo derivado de Lite-Mistral-150M-v2-Instruct, se espera que herede una ventana de contexto típica de modelos pequeños (alrededor de 2048 tokens, aunque no confirmado). El repositorio incluye pesos en formato safetensors y ocupa 0.9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer causal) |
| Parametros totales | 156.519.168 (156M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP32/FP16, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (probablemente ingles, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MistralForCausalLM, un transformer causal con atención de ventana deslizante (aunque no se detalla la configuración exacta). Se entrenó mediante destilación de conocimiento desde el modelo objetivo TurboSparse-Mistral-Instruct (7B), utilizando una pérdida mixta compuesta por 0.5 × entropía cruzada y 0.5 × divergencia KL con temperatura T=1.0. Esta combinación permite que el drafter aprenda tanto la distribución de tokens del modelo grande como la tarea específica de comprensión.

El entrenamiento se realizó sobre 395.000 muestras sintéticas del dataset `domain-aware-sd-synthetic`, que cubre 21 clusters de tareas de comprensión extraídos de Flan. Se ejecutaron 4.5 épocas (con early stopping desde 25) en una sola GPU RTX 3090 durante 4.3 horas. La pérdida final de evaluación fue 1.193 y la precisión top-1 alcanzó el 65.05%. El solapamiento de área (proxy de tasa de aceptación) en su dominio propio fue de 0.7558, lo que indica una alta coincidencia con las predicciones del modelo objetivo.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa, especializado en tareas de comprensión (razonamiento, lectura, preguntas y respuestas).
- Predicción de secuencias de tokens que se alinean con las salidas del modelo TurboSparse-Mistral-Instruct, optimizada para maximizar la tasa de aceptación.
- No es un modelo de chat general: no soporta tool calling, ni agentes, ni razonamiento multi-paso autónomo.
- No dispone de capacidades multimodales (visión, audio) ni de modo de pensamiento explícito.
- Multilingüismo no confirmado; el entrenamiento se basa en Flan, que incluye datos multilingües, pero no se especifica el alcance.

## Casos de uso

- Aceleración de inferencia en producción: integrar `drafter-understanding` como componente de un sistema de decodificación especulativa junto a TurboSparse-Mistral-Instruct para reducir la latencia en servicios de chat o asistentes virtuales que manejan tareas de comprensión.
- Despliegue en entornos con recursos limitados: al ser un modelo de 156M, puede ejecutarse en GPUs de gama baja o incluso en CPU, permitiendo que el drafter actúe como un "prefiltro" rápido antes de la verificación del modelo grande.
- Procesamiento por lotes de tareas de comprensión: en pipelines de análisis de documentos o extracción de información, el drafter puede generar borradores de respuestas que el modelo grande valida, aumentando el throughput.
- Investigación en decodificación especulativa: sirve como punto de partida para estudiar el impacto del dominio en la tasa de aceptación, comparando con drafter genéricos.
- Fine-tuning adicional: al estar liberado bajo Apache 2.0, puede adaptarse a otros dominios o modelos objetivo mediante entrenamiento adicional con el mismo enfoque de destilación.
- Componente en frameworks de inferencia: puede integrarse en vLLM, TGI o llama.cpp si estos soportan decodificación especulativa, mejorando la eficiencia en despliegues de modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son las del entrenamiento, que se muestran a continuación:

| Metrica | Valor |
|---|---|
| Pérdida de evaluacion (eval_loss) | 1.193 |
| Precision top-1 | 65.05% |
| Overlap Area (proxy de tasa de aceptacion) | 0.7558 (en dominio propio) |

Estas métricas indican el rendimiento del drafter en su tarea específica, pero no son comparables con benchmarks de modelos de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP16 (156M parámetros ≈ 312 MB de pesos, más overhead de activaciones y caché KV). Con cuantización a 8 bits, podría reducirse a ~160 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3060, o incluso integradas. El entrenamiento se realizó en una RTX 3090, pero la inferencia es mucho más ligera.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: transformers (Python), vLLM (si se configura como drafter), llama.cpp (conversión a GGUF), o cualquier framework que soporte decodificación especulativa.
- Latencia y throughput: no se proporcionan datos oficiales, pero al ser un modelo pequeño, la generación de borradores es del orden de microsegundos por token en GPU, y de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos drafter específicos para comparar directamente. Existen alternativas genéricas como los drafter de Medusa o EAGLE, pero no se han publicado comparativas con este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo especializado: su rendimiento fuera del dominio de comprensión (21 clusters de Flan) puede degradarse significativamente, reduciendo la tasa de aceptación y anulando la ventaja de la decodificación especulativa.
- Riesgo de alucinación: al ser un drafter, no genera respuestas finales, pero sus predicciones pueden ser incorrectas; el modelo grande debe verificar siempre.
- Sesgos potenciales: el dataset de entrenamiento (Flan) puede contener sesgos culturales o lingüísticos, que se transfieren al drafter.
- Longitud de contexto no especificada: se desconoce si soporta ventanas largas; probablemente hereda el límite de Lite-Mistral-150M-v2-Instruct (típicamente 2048 tokens), lo que limita su uso en tareas con contexto extenso.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es autónomo: requiere el modelo objetivo para funcionar, y ese modelo (TurboSparse-Mistral-Instruct) puede tener su propia licencia.
- No se han publicado benchmarks independientes que validen su eficacia en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MikhailRudenko/drafter-understanding
- Dataset de entrenamiento: https://huggingface.co/datasets/mikhialo/domain-aware-sd-synthetic
- Repositorio del proyecto Domain-Aware Speculative Decoding: https://github.com/MikhailRudenk0/Domain-Aware-SD
