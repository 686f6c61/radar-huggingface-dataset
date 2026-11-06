# Niof/Reticulum135M-Instruct

## Resumen

Reticulum135M-Instruct es una adaptación del modelo SmolLM2-135M-Instruct de HuggingFaceTB, publicada por el usuario Niof, cuantizada a int8 por filas (per-row int8) y empaquetada específicamente para ejecutarse dentro del motor Luau paralelo de Roblox (denominado por el autor "Reticulum 1 Zero / AI Engine Core"). No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia en el entorno de Roblox.

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-135M: 30 capas, dimensión oculta de 576, 9 cabezas de consulta y 3 de clave/valor (GQA), FFN de 1536 y vocabulario de 49152 tokens con tokenizador ByteLevel BPE. Su relevancia radica en ser un ejemplo de despliegue de LLM dentro de una plataforma de videojuegos con recursos muy limitados, donde el tamaño y la cuantización son determinantes.

La información pública disponible es muy escasa: no hay pipeline declarado, no se especifican idiomas soportados, no hay benchmarks ni detalles sobre el proceso de cuantización más allá de la mención a escalas dinámicas FP32 por canal. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2), 30 capas, hidden dim 576, 9 cabezas Q / 3 KV (GQA), FFN 1536 |
| Parámetros totales | 135M (modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Per-row int8 con escalas dinámicas FP32 por canal |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 0,1 GB; presumiblemente pesos cuantizados int8, formato exacto no especificado) |

## Arquitectura y entrenamiento

El modelo base SmolLM2-135M-Instruct es un transformer decoder-only con 30 capas, dimensión oculta 576, atención con grouped-query attention (9 cabezas de consulta, 3 de clave/valor), FFN de 1536 y vocabulario de 49152 tokens con tokenizador ByteLevel BPE. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

La contribución de esta publicación es la cuantización a int8 por filas con escalas dinámicas FP32 por canal, empaquetada para el motor Luau paralelo de Roblox. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El proceso de conversión y el formato exacto de los pesos no están descritos en la model card.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo base SmolLM2-135M-Instruct.
- Razonamiento básico y respuesta a prompts cortos, limitado por el tamaño de 135M parámetros.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Ejecución dentro del entorno Luau paralelo de Roblox, orientada a inferencia in-game.

## Casos de uso

- Diálogos con NPC en Roblox: el modelo puede generar respuestas conversacionales breves dentro de experiencias interactivas, aprovechando su reducido tamaño para ejecutarse en el motor Luau paralelo del cliente o servidor.
- Asistentes de tutoriales y guías in-game: respuestas a preguntas frecuentes de jugadores sobre mecánicas del juego, con latencia baja gracias a la cuantización int8.
- Generación de texto dinámico para misiones: descripciones de objetos, diálogos contextuales o pistas generadas en tiempo de ejecución sin depender de un servidor externo.
- Prototipado de mecánicas de IA conversacional: útil para desarrolladores de Roblox que quieran experimentar con LLM embebidos antes de escalar a modelos mayores.
- Filtrado y clasificación de mensajes de chat: tareas simples de moderación o etiquetado de texto dentro del juego con un modelo pequeño y local.
- Educación y demos técnicas: ejemplo didáctico de cuantización int8 y despliegue de un LLM en un entorno con restricciones severas de memoria y cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 135M parámetros; en int8 los pesos ocupan aproximadamente 135 MB, más overhead de activaciones y escalas. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: el objetivo declarado es el motor Luau paralelo de Roblox (Reticulum); para uso fuera de Roblox no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Reticulum135M-Instruct | 135M | No disponible | Apache 2.0 | Hugging Face (81 descargas) |
| SmolLM2-135M-Instruct | 135M | No disponible en esta ficha | Apache 2.0 | Hugging Face (modelo base) |
| SmolLM2-360M-Instruct | 360M | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 500M | No disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparativa se limita a parámetros, licencia y disponibilidad; no hay datos de rendimiento publicados para Reticulum135M-Instruct que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de 135M parámetros: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparación con modelos de mayor tamaño.
- Riesgo elevado de alucinación, especialmente en preguntas factuales o conversaciones largas.
- La cuantización int8 puede introducir degradación adicional respecto al modelo base en tareas sensibles a la precisión numérica.
- No se especifican idiomas soportados; el comportamiento multilingüe es incierto.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia.
- Orientado específicamente al entorno Luau de Roblox; su uso fuera de ese ecosistema no está documentado ni soportado oficialmente.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base SmolLM2-135M-Instruct.
- Repositorio con muy poca tracción (81 descargas, 0 likes) y sin mantenimiento documentado; la fecha de creación indicada (2026-10-29) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos.

## Enlaces

- [Hugging Face: Niof/Reticulum135M-Instruct](https://huggingface.co/Niof/Reticulum135M-Instruct)
- [Modelo base: HuggingFaceTB/SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
