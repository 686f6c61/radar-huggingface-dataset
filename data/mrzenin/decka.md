# mrzenin/Decka

## Resumen

Decka (también referenciado como Decka-Small) es un ajuste fino mediante LoRA del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario mrzenin y publicado en Hugging Face. Está especializado en roleplay conversacional con razonamiento en cadena de pensamiento (chain-of-thought): antes de cada respuesta, el modelo emite un bloque `` con razonamiento desde el punto de vista del personaje, seguido de la réplica propiamente dicha. El problema que aborda es la coherencia de personaje en conversaciones de rol de largo recorrido, donde los modelos base tienden a perder el registro o a mezclar la voz del asistente con la del personaje.

El modelo se construye sobre la arquitectura LFM3 de Liquid AI (familia de modelos compactos de 1.700 millones de parámetros), que emplea capas híbridas con atención y operadores de espacio de estados. El ajuste se realizó sobre el dataset beyoru/Aesir-Character-CoT-roleplay con un LoRA de rango 32 y alpha 64 aplicado a todas las capas lineales, durante una única época con pérdida restringida a los turnos del asistente.

Es relevante ahora porque demuestra un patrón de bajo coste (un solo epoch, una Tesla T4, fp16) para especializar modelos pequeños en tareas de rol con razonamiento explícito, un formato que facilita la inspección del proceso de decisión del personaje. El modelo está entrenado con datos de rol para adultos y hereda la licencia LFM Open License v1.0 del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido LFM3 (base LiquidAI/LFM3-1.7B) con adaptador LoRA |
| Parámetros totales | 1.728.801.536 (1,73 mil millones) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (longitud máxima de entrenamiento: 4096 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (librería transformers, con custom_code) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B, un transformer híbrido de la familia Liquid Foundation Models que combina capas de atención con operadores de espacio de estados, diseñado para inferencia eficiente en hardware modesto. Sobre esa base se aplica un adaptador LoRA con rango 32, alpha 64 y dropout 0,05, dirigido a todas las capas lineales (`all-linear`). Los pesos publicados incluyen código personalizado (`custom_code`) y son compatibles con la librería transformers.

El entrenamiento consistió en una única época con tasa de aprendizaje 1e-4, longitud máxima de secuencia de 4096 tokens, precisión fp16 y una GPU Tesla T4. La pérdida se calculó únicamente sobre los turnos del asistente (assistant-only loss), de modo que el modelo aprende a generar el bloque de razonamiento `<think>...</think>` y la respuesta del personaje sin verse penalizado por los turnos del usuario. El dataset empleado, beyoru/Aesir-Character-CoT-roleplay, contiene conversaciones de rol para adultos con razonamiento en cadena de pensamiento asociado a cada intervención.

## Capacidades

- Generación de texto conversacional orientada a roleplay, con mantenimiento de la voz y perspectiva del personaje.
- Razonamiento en cadena de pensamiento explícito: emite `<think>...</think>` antes de cada respuesta, lo que permite auditar el proceso de decisión del personaje.
- Coherencia multi-turno en diálogos de rol, favorecida por el entrenamiento con pérdida restringida al asistente y secuencias de hasta 4096 tokens.
- Formato de conversación compatible con el pipeline `text-generation` de transformers y con endpoints compatibles.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Roleplay conversacional con personajes persistentes: el modelo mantiene la voz del personaje y expone su razonamiento interno en `<think>`, lo que permite depurar respuestas incoherentes revisando el bloque de pensamiento antes de la réplica.
- Prototipado de videojuegos narrativos: integración en motores de diálogo donde cada PNJ necesita una voz consistente; el tamaño de 1,7 mil millones permite ejecución local durante el desarrollo.
- Investigación sobre chain-of-thought en modelos pequeños: el formato `<think>` facilita estudiar cómo un modelo de 1,7 B estructura el razonamiento de personaje y compararlo con modelos mayores.
- Generación de guiones y borradores narrativos: útil para escritores que quieren explorar la perspectiva de un personaje antes de redactar la escena definitiva.
- Evaluación de técnicas LoRA de bajo coste: sirve como referencia reproducible de un ajuste con un solo epoch en una T4, útil para calibrar expectativas de calidad en proyectos con presupuesto limitado.
- Filtrado y anotación de datos de rol: el razonamiento explícito puede aprovecharse para clasificar o curar conversaciones de rol en pipelines de datos, revisando el bloque `<think>` como señal auxiliar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,5 GB solo para pesos (1,73 mil millones de parámetros), más overhead de activaciones y caché KV; con contexto de 4096 tokens se recomienda reservar al menos 6-8 GB.
- GPU recomendadas para producción: A100, H100 o L40S para despliegues con concurrencia; una RTX 4090 o RTX 3090 es suficiente para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16; con cuantización a 8 o 4 bits cabría en GPUs de 6 GB o menos, aunque no se documentan cuantizaciones publicadas.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`), endpoints compatibles; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decka (mrzenin) | 1,73 B | no disponible (entrenado a 4096) | Roleplay con CoT | LFM Open License v1.0 | Hugging Face, 527 descargas |
| LiquidAI/LFM3-1.7B | 1,73 B | no disponible | Propósito general | LFM Open License v1.0 | Hugging Face (modelo base) |
| beyoru/Aesir-Character-CoT-roleplay | no aplica (dataset) | no aplica | Datos de rol con CoT | según el dataset | Hugging Face (dataset) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Decka con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado con datos de rol para adultos y contenido NSFW: no es apto para menores ni para entornos sin control de edad.
- Riesgo de alucinación y de deriva de personaje en conversaciones muy largas, especialmente al superar la longitud de entrenamiento de 4096 tokens.
- No se documentan sesgos específicos, pero al derivar de un modelo base generalista y de un dataset de rol concreto, puede reproducir sesgos de ambos.
- Idiomas soportados no documentados; el comportamiento fuera del idioma dominante del dataset es incierto.
- Licencia LFM Open License v1.0 con posibles restricciones adicionales del dataset de entrenamiento: el autor advierte de revisar los términos del dataset antes de un uso comercial.
- El adaptador LoRA requiere el código personalizado (`custom_code`) del repositorio; la compatibilidad con servidores de inferencia de terceros no está garantizada.
- El modelo tiene 0 likes y un volumen de descargas moderado (527), por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrzenin/Decka
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/beyoru/Aesir-Character-CoT-roleplay
