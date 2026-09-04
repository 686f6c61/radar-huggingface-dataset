# kaonai/grpo-kaon3-popft-rm600-mouse-reset-timeskip-lr1e4-b004-step75

## Resumen

El modelo `kaonai/grpo-kaon3-popft-rm600-mouse-reset-timeskip-lr1e4-b004-step75` es un checkpoint experimental de 25.805.933.872 parámetros (25,8 B) desarrollado por el usuario `kaonai`. Se trata de un merge completo en BF16 de un adaptador PEFT entrenado con GRPO (Group Relative Policy Optimization) sobre el modelo base `kaonai/kaon-c-gemma4-26b-v10.1`, que es un modelo multimodal de tipo imagen-texto-a-texto basado en Gemma 4. El checkpoint corresponde al paso 75 de una ejecución de entrenamiento orientada a alinear el modelo con un reward model específico denominado `population-final-transition-rm-existing-explicit-s42-step600`. Su relevancia radica en documentar un enfoque de alineación por RL con recompensas de transición de población, aunque no se publican datos de rendimiento ni licencia. La longitud de contexto no está disponible.

## Especificaciones técnicas

| Parámetros | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto-a-texto) basada en Gemma 4 26B |
| Parámetros totales | 25.805.933.872 (25,8 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del modelo base `kaonai/kaon-c-gemma4-26b-v10.1`, que según las etiquetas es un modelo multimodal de tipo imagen-texto-a-texto con pipeline de text-generation. El checkpoint es un merge standalone en bfloat16 del adaptador PEFT entrenado en la ejecución `popft-rm600-mouse-original-reset-matched-timeskip-lr1e4-b004-s44-resume25-to200`, correspondiente al paso 75. El entrenamiento utilizó GRPO con learning rate 1e-4 y beta 0.04, y un reward model llamado `population-final-transition-rm-existing-explicit-s42-step600`. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens, ni si hubo fases previas de RLHF o DPO. El merge se verificó con paridad de logits representativos, según la model card.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Entrada multimodal de imagen y texto según la etiqueta `image-text-to-text` del modelo base.
- No se documenta soporte de tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- No se han publicado capacidades multilingües específicas.
- No se documenta modo de pensamiento (thinking mode) ni capacidades de audio.
- El modelo es un checkpoint de investigación, por lo que sus capacidades deben validarse experimentalmente.

## Casos de uso

- Investigación en alineación por RL: el checkpoint permite estudiar el efecto del GRPO con el reward model `population-final-transition` en comparación con el modelo base, lo que resulta útil para analizar cómo la recompensa de transición de población modifica el comportamiento del modelo.
- Evaluación de robustness en entornos simulados: el nombre del reward model sugiere una tarea de transición de población, por lo que podría emplearse para probar la estabilidad del modelo en simulaciones de dinámica de poblaciones.
- Asistente conversacional multimodal: puede servir como base para probar interacciones de texto e imagen en entornos de investigación, siempre que se confirme que la capacidad multimodal se mantiene tras el fine-tuning.
- Punto de partida para fine-tuning adicional: al ser un checkpoint intermedio, puede usarse para continuar el entrenamiento con otros objetivos o datasets, aprovechando el proceso de RL ya aplicado.
- Análisis de documentos con imágenes: si se confirma la capacidad multimodal, podría emplearse en tareas de descripción de imágenes o respuesta a preguntas sobre contenido visual.
- Comparación de técnicas de alineación: útil para investigadores que quieran comparar GRPO con otros métodos de RL o SFT sobre el mismo modelo base, midiendo diferencias en tareas concretas.

No hay casos de uso oficiales documentados; los anteriores son escenarios plausibles que requieren validación experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan 51,6 GB (25,8 B parámetros × 2 bytes), por lo que se necesitan al menos 52 GB de VRAM para cargar el modelo sin cuantizar, más la caché KV y el overhead de inferencia.
- GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes. También es posible usar varias GPU con paralelismo de tensores.
- No se proporcionan cuantizaciones oficiales, por lo que no se puede garantizar que quepa en GPU de consumo. Si se aplicara cuantización de 4 bits, el tamaño podría reducirse a ~13 GB, pero no hay archivos GGUF o cuantizados publicados.
- Opciones de despliegue: al ser safetensors y compatible con transformers, puede cargarse con `transformers` y `vLLM`. Para `llama.cpp` u `Ollama` sería necesaria una conversión a GGUF no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas. El modelo puede compararse con su base `kaonai/kaon-c-gemma4-26b-v10.1`, pero no se han publicado diferencias de rendimiento ni benchmarks. Tampoco se conocen modelos comparables de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Sesgos: no se han publicado evaluaciones de sesgo.
- Riesgo de alucinación: al ser un modelo de generación de texto, existe riesgo de alucinación; no se han publicado medidas de fiabilidad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles.
- Licencia: no se ha especificado licencia, por lo que el uso comercial no está garantizado.
- Modelo experimental: es un checkpoint de investigación con 0 descargas y 0 likes, sin validación externa.
- Producción: no se recomienda su uso en producción sin una evaluación exhaustiva de seguridad y rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/kaonai/grpo-kaon3-popft-rm600-mouse-reset-timeskip-lr1e4-b004-step75
- Modelo base: https://huggingface.co/kaonai/kaon-c-gemma4-26b-v10.1
