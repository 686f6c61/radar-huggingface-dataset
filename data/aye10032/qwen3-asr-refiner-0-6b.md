# Aye10032/Qwen3-ASR-Refiner-0.6B

## Resumen

Qwen3-ASR-Refiner-0.6B es un modelo de lenguaje especializado en la normalización de transcripciones de reconocimiento automático de voz (ASR) en chino. Desarrollado por Aye10032, se basa en Qwen3-0.6B y ha sido ajustado mediante LoRA sobre el conjunto de datos WenetSpeech-Formal-Text, que contiene pares de transcripciones habladas y sus versiones escritas formales. Su función principal es convertir transcripciones con muletillas, repeticiones y estructuras orales en un texto escrito conciso, natural y fiel al significado original.

El modelo resuelve un problema habitual en los pipelines de ASR: la salida del reconocedor suele ser una transcripción literal de la voz, con errores de puntuación, palabras de relleno y construcciones propias del habla oral. Este refinador actúa como un paso posterior al ASR, generando un texto limpio y listo para su uso en subtitulado, documentación, análisis de contenido o entrenamiento de otros modelos. Con solo 596 millones de parámetros, es una opción ligera y eficiente para integrarse en flujos de procesamiento de lenguaje natural en producción.

La relevancia actual radica en la creciente demanda de sistemas de voz a texto en chino que produzcan salidas legibles y profesionales, especialmente en aplicaciones de atención al cliente, transcripción de reuniones y generación de contenido. Al estar basado en Qwen3, hereda una arquitectura transformer moderna y un buen rendimiento en tareas de generación de texto, aunque su especialización lo limita al dominio del chino y a la tarea de normalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del modelo base Qwen3-0.6B, que es un transformer autoregresivo con arquitectura estándar de decoder-only. La familia Qwen3-ASR-Refiner incluye variantes de 0.6B, 1.7B y 4B, todas entrenadas con la misma definición de tarea y receta de entrenamiento. El adaptador LoRA se ha fusionado con los pesos del modelo base, por lo que el repositorio contiene pesos completos en formato Transformers y puede cargarse directamente sin necesidad de PEFT.

El entrenamiento se realizó sobre el dataset `Aye10032/WenetSpeech-Formal-Text`, que proporciona pares de transcripciones orales y su correspondiente versión escrita formal. La tarea se define como una transformación de estilo: dado un texto con marcas de oralidad, el modelo debe producir un texto escrito natural sin añadir información que no esté en el original. El dataset está licenciado bajo CC BY 4.0, y la licencia del modelo final es Apache 2.0, lo que permite uso comercial y modificación. No se han publicado detalles adicionales sobre el número de tokens de entrenamiento ni sobre técnicas como RLHF o DPO; la información disponible solo menciona el ajuste fino supervisado.

## Capacidades

- Normalización de transcripciones ASR en chino: convierte texto con muletillas, repeticiones y estructuras orales en texto escrito formal.
- Mantiene el significado original sin añadir información externa, según la definición de la tarea.
- Generación de texto autoregresiva con soporte de chat template de Qwen3, incluyendo la opción de habilitar o deshabilitar el modo de razonamiento (`enable_thinking`).
- Multilingüe: no, está especializado en chino (zh).
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-step: no disponible.
- Capacidades especiales: ninguna adicional más allá de la normalización de texto.

## Casos de uso

- Post-procesamiento de transcripciones de reuniones: las herramientas de ASR generan texto con ruido oral; este modelo limpia el texto para su uso en actas o resúmenes, manteniendo el contenido esencial.
- Subtitulado automático de vídeos en chino: los subtítulos generados por ASR pueden ser mejorados con este modelo para producir subtítulos legibles y naturales, reduciendo la necesidad de edición manual.
- Normalización de texto en sistemas de atención al cliente: los diálogos transcritos se convierten en texto formal para su análisis posterior, facilitando la extracción de intenciones y el entrenamiento de modelos de clasificación.
- Preparación de datos de entrenamiento: para limpiar corpus de texto hablado y generar versiones escritas formales que sirvan como datos de entrenamiento para otros modelos de NLP.
- Integración en pipelines de transcripción en producción: al ser un modelo ligero (596M parámetros), puede ejecutarse en CPU o GPU de gama baja y añadirse como paso intermedio en un flujo de ASR para mejorar la calidad final del texto.
- Generación de contenido a partir de grabaciones de podcasts o entrevistas: transforma las transcripciones en artículos o notas coherentes, reduciendo el trabajo de redacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se aportan métricas comparativas (como MMLU, HumanEval, GSM8K) ni evaluaciones específicas de la tarea de normalización frente a otros modelos. La evaluación del modelo se limita al ejemplo de uso mostrado en la model card, sin datos cuantitativos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~596M parámetros en BF16, lo que ocupa aproximadamente 1.2 GB en memoria. Con overhead de activaciones y tokens de entrada, se recomienda al menos 2-3 GB de VRAM para inferencia cómoda.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3060, o incluso en CPU con suficiente RAM. Para despliegue masivo, se puede usar una A10 o A100.
- Cabe en GPU consumer: sí, modelos como la RTX 3060 de 12 GB, RTX 4060 o la serie RTX 30/40 con 8 GB pueden ejecutarlo sin problemas.
- Opciones de despliegue: se puede cargar con Transformers directamente, o servirse con vLLM, TGI, o llama.cpp (si se convierte a GGUF). No se proporcionan archivos GGUF en el repositorio, pero es posible generarlos.
- Latencia y throughput: no hay datos oficiales, pero al ser un modelo pequeño, la latencia por generación en GPU es baja (típicamente <100 ms por token en una RTX 4090), y puede manejar múltiples peticiones concurrentes con vLLM.

## Comparativa con modelos similares

La familia Qwen3-ASR-Refiner incluye tres variantes con el mismo objetivo de normalización, diferenciadas por tamaño. La comparativa se centra en las opciones del mismo autor:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-Refiner-0.6B | 596M | no disponible | zh | Apache 2.0 | HuggingFace |
| Qwen3-ASR-Refiner-1.7B | 1.7B | no disponible | zh | Apache 2.0 | HuggingFace |
| Qwen3-ASR-Refiner-4B | 4B | no disponible | zh | Apache 2.0 | HuggingFace |

No se dispone de comparación con otros modelos de post-procesado ASR en chino (por ejemplo, modelos de normalización de texto como Text Normalization de NVIDIA o sistemas basados en reglas). La elección entre las variantes depende del presupuesto de hardware y de la calidad deseada: los modelos más grandes probablemente ofrecen mayor fidelidad, pero no hay datos publicados que confirmen una diferencia.

## Limitaciones y advertencias

- El modelo está especializado en chino y no soporta otros idiomas. No debe usarse para normalizar transcripciones en otros idiomas.
- La tarea se limita a la transformación de estilo oral a escrito; no está diseñado para tareas de traducción, resumen o generación de contenido creativo.
- Riesgo de alucinación: aunque la tarea pide no añadir información, el modelo puede introducir cambios sutiles o errores, especialmente en textos ambiguos o con errores de transcripción. Se recomienda revisar el resultado en aplicaciones críticas.
- Sesgos heredados del modelo base Qwen3-0.6B: el modelo base puede tener sesgos culturales o lingüísticos que se transmiten al texto normalizado.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (CC BY 4.0) puede requerir atribución en ciertos contextos.
- No se han publicado evaluaciones de robustez frente a distintos dialectos del chino o variaciones del habla informal, por lo que el rendimiento puede variar en entornos con jerga o acentos específicos.
- La longitud de contexto no está documentada; para textos largos es necesario dividirlos en segmentos manejables, aunque el modelo base Qwen3-0.6B soporta hasta 32K tokens (según la documentación de Qwen3), pero no se garantiza en este fine-tune.

## Enlaces

- Modelo en HuggingFace: [Aye10032/Qwen3-ASR-Refiner-0.6B](https://huggingface.co/Aye10032/Qwen3-ASR-Refiner-0.6B)
- Dataset de entrenamiento: [Aye10032/WenetSpeech-Formal-Text](https://huggingface.co/datasets/Aye10032/WenetSpeech-Formal-Text)
- Modelo base: [Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- Familia de modelos (1.7B y 4B): [Aye10032/Qwen3-ASR-Refiner-1.7B](https://huggingface.co/Aye10032/Qwen3-ASR-Refiner-1.7B), [Aye10032/Qwen3-ASR-Refiner-4B](https://huggingface.co/Aye10032/Qwen3-ASR-Refiner-4B)
- Repositorio de Qwen3-ASR (relacionado, no el mismo modelo): [GitHub QwenLM/Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR)
- Colección de Qwen3-ASR en HuggingFace: [Qwen3-ASR collection](https://huggingface.co/collections/Qwen/qwen3-asr)
