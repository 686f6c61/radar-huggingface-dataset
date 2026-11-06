# Mlboy23/Qwen3.5-2B-W4A16

## Resumen

Qwen3.5-2B-W4A16 es una cuantización comunitaria del modelo Qwen3.5-2B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. El autor de esta variante, Mlboy23, la publica con el objetivo específico de integrarla en Custom Comfy Prompt Enhancer, una herramienta de mejora de prompts para flujos de trabajo de ComfyUI. El modelo base pertenece a la familia Qwen3.5, orientada a agentes multimodales nativos, y se distribuye bajo licencia Apache 2.0.

El pipeline declarado es image-text-to-text, lo que indica capacidades de entrada multimodal (texto e imagen) con salida de texto. La cuantización W4A16 hace referencia a pesos en 4 bits y activaciones en 16 bits, aunque el repositorio está etiquetado también como "8-bit", lo que sugiere cierta ambigüedad en la nomenclatura o una configuración mixta. El repositorio ocupa 7,6 GB, un tamaño considerable para un modelo de 1.200 millones de parámetros, coherente con la presencia de pesos en varios formatos y posiblemente del tokenizador y componentes multimodales.

La relevancia de esta ficha radica en que documenta una variante de cuantización de un modelo reciente de la familia Qwen3.5, pensada para despliegue en entornos con recursos limitados y para una aplicación concreta de generación de prompts. No obstante, la información pública disponible es escasa: no se detallan idiomas, benchmarks ni el proceso exacto de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_5_text, pipeline image-text-to-text) |
| Parámetros totales | 1.206.771.520 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16 (pesos 4 bits, activaciones 16 bits); etiquetado adicional como 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B-Base pertenece a la familia Qwen3.5, presentada por el equipo Qwen como una línea orientada a "agentes multimodales nativos" (según la cita del blog oficial incluida en la model card). El pipeline image-text-to-text y la etiqueta qwen3_5_text confirman que se trata de un transformer con capacidad de procesar entradas de imagen y texto, aunque no se especifican detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni composición del dataset de entrenamiento.

Esta variante concreta es una cuantización: el autor no documenta el proceso de calibración, el número de tokens de entrenamiento del modelo base, ni si hubo fases de RLHF o DPO. Tampoco se detalla qué innovaciones técnicas (decodificación especulativa, atención lineal, etc.) incorpora el modelo base más allá de la referencia genérica a agentes multimodales. Toda la información sobre arquitectura interna y entrenamiento del modelo original debe consultarse en la model card oficial de Qwen/Qwen3.5-2B-Base, que no se incluye en la información proporcionada.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational".
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), lo que permite tareas que combinan imagen y texto.
- Mejora y expansión de prompts, propósito explícito de esta cuantización dentro de Custom Comfy Prompt Enhancer.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su despliegue como servicio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modelo base se presenta como orientado a agentes, pero no se detallan capacidades concretas en esta variante.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Mejora de prompts para ComfyUI: el modelo se ha cuantizado específicamente para Custom Comfy Prompt Enhancer, de modo que puede reescribir y enriquecer prompts de usuario antes de pasarlos a modelos de difusión, aprovechando su naturaleza conversacional.
- Asistentes conversacionales ligeros: con 1.200 millones de parámetros, puede desplegarse en entornos con recursos moderados para gestionar conversaciones multi-turno de dominio general, aunque la longitud de contexto no está documentada.
- Procesamiento de imagen y texto combinados: al declarar pipeline image-text-to-text, puede emplearse en tareas de descripción de imágenes o generación de texto condicionada por una imagen, siempre que se confirme el soporte real en la implementación.
- Despliegue en endpoints compatibles: la etiqueta endpoints_compatible sugiere su uso como servicio de inferencia en plataformas que aceptan modelos de transformers, útil para prototipos y demos.
- Filtrado y reescritura de instrucciones: en pipelines de generación aumentada, el modelo puede normalizar o reformular consultas de usuario antes de enviarlas a un modelo mayor.
- Experimentación e investigación: al ser una cuantización W4A16 de un modelo de 2B, sirve para estudiar el impacto de la cuantización en la calidad de salida en tareas de generación de texto y multimodalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 1.200 millones de parámetros con pesos en 4 bits requiere aproximadamente 0,6-0,8 GB solo para los pesos, más el overhead de activaciones, tokenizador y componentes multimodales; con pesos en 8 bits, en torno a 1,2-1,5 GB. Estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: probable en GPUs con 4-8 GB de VRAM dada la cuantización, pero no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-W4A16 (este) | 1.206.771.520 | no disponible | Apache 2.0 | safetensors, W4A16 | Cuantización comunitaria para Comfy Prompt Enhancer |
| Qwen/Qwen3.5-2B-Base | no disponible en la información | no disponible | Apache 2.0 | no disponible | Modelo base original del que deriva esta variante |
| Alternativas de ~2B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento, contexto o benchmarks con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización W4A16 puede degradar la calidad de salida respecto al modelo base; el autor no documenta métricas de degradación.
- Existe ambigüedad en la nomenclatura: el repositorio se etiqueta como W4A16 y también como "8-bit", lo que puede inducir a error sobre la configuración real de los pesos.
- No se especifican los idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- No se documenta la longitud de contexto, un dato crítico para aplicaciones conversacionales o de prompts largos.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base enlazada en la model card.
- El modelo está orientado a una herramienta concreta (Custom Comfy Prompt Enhancer); su uso fuera de ese contexto no está validado por el autor.
- El repositorio tiene muy pocas descargas (27) y ningún "like", lo que sugiere poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mlboy23/Qwen3.5-2B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Repositorio Custom Comfy Prompt Enhancer: https://github.com/Unica2804/Qwen_3.5_Comfy_Prompt_Enahancer.git
