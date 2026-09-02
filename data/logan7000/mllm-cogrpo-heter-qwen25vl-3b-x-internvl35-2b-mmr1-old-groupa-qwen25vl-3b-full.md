# logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-mmr1-old-groupA-qwen25vl-3b-full

## Resumen

Este modelo es un checkpoint experimental de investigación publicado por el usuario logan7000 en HuggingFace. Se trata de un experimento de co-entrenamiento heterogéneo con Co-GRPO (Group Relative Policy Optimization) entre dos modelos de visión-lenguaje: Qwen2.5-VL-3B e InternVL3.5-2B. El objetivo es estudiar el aprendizaje colaborativo entre arquitecturas distintas, donde cada modelo se recompensa con pseudo-etiquetas verificadas por el otro (peer-verified pseudo labels). El entrenamiento se realizó durante 722 pasos con una receta "old" (beta 0, K 8, T 1.0, cap 1024, lr 1e-6, warmup 0.03, 8 prompts por paso) en 4 GPUs A100 de JHU.

El repositorio contiene el checkpoint del lado Qwen (model_a) con dos versiones: el mejor paso según validación en MathVista-150 (step 100) y el checkpoint final (step 722). No se proporcionan métricas de rendimiento, licencia, ni especificaciones técnicas completas. Es un artefacto de investigación, no un modelo listo para producción, y su relevancia radica en explorar métodos de co-entrenamiento entre modelos multimodales de diferente tamaño y familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere multimodal visión-lenguaje, basado en Qwen2.5-VL-3B e InternVL3.5-2B) |
| Parametros totales | no disponible (el nombre sugiere 3B y 2B, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

La información disponible se limita a la model card, que describe un proceso de co-entrenamiento con Co-GRPO heterogéneo. Se entrenaron conjuntamente dos modelos: Qwen2.5-VL-3B (lado A, este checkpoint) e InternVL3.5-2B (lado B). La receta "old" especifica beta 0, K 8, T 1.0, cap 1024, learning rate 1e-6, warmup 0.03 y 8 prompts por paso (tamaño de batch efectivo 64). El co-learning se basa en que cada modelo recibe recompensas de pseudo-etiquetas verificadas por el otro modelo (peer-verified). Se ejecutaron 722 pasos (1 época) y se seleccionó el mejor checkpoint según validación en MathVista-150 (step 100). El protocolo de evaluación usa T=0, 16k de contexto, prompt con "boxed" y un juez Qwen2.5-32B con reglas. No se detallan los datos de entrenamiento, el número de tokens, ni innovaciones arquitectónicas específicas.

## Capacidades

- No se han documentado capacidades específicas en la información proporcionada.
- Al estar basado en Qwen2.5-VL, es probable que herede capacidades de comprensión de imágenes y texto, pero no está verificado.
- No hay evidencia de soporte de tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües.
- El modelo es un checkpoint de investigación, no un producto final.

## Casos de uso

- Investigación en co-entrenamiento de modelos multimodales: este checkpoint sirve para estudiar cómo dos arquitecturas diferentes (Qwen2.5-VL e InternVL) pueden aprender colaborativamente mediante GRPO y pseudo-etiquetas cruzadas.
- Reproducción de experimentos: los autores pueden usar este checkpoint para reproducir los resultados del paper asociado (no publicado) o para comparar con otros checkpoints del mismo experimento (group A, group B, etc.).
- Análisis de dinámicas de entrenamiento: los logs de entrenamiento (train.log, trainer_state) permiten analizar la evolución de la pérdida y las métricas durante el co-entrenamiento.
- No es adecuado para aplicaciones de producción debido a su naturaleza experimental y falta de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona MathVista-150 como métrica de validación para seleccionar el mejor checkpoint, pero no se proporcionan valores numéricos. No se puede comparar con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware para inferencia.
- El entrenamiento se realizó en 4 GPUs A100 (JHU), pero no se indica el tiempo ni el consumo de memoria.
- Para inferencia, un modelo de ~3B parámetros en FP16 requeriría aproximadamente 6-8 GB de VRAM, pero esto es una estimación no confirmada.
- No hay información sobre despliegue con vLLM, llama.cpp, Ollama u otras herramientas.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. Existen otros checkpoints del mismo experimento (por ejemplo, la versión de 7B/8B en el mismo repositorio del autor), pero no se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Modelo experimental sin licencia declarada: no se puede usar comercialmente sin aclarar los términos.
- Sin documentación de sesgos, alucinaciones o limitaciones de contexto/idioma.
- El checkpoint es un artefacto de investigación con 0 descargas y 0 likes; no ha sido validado por la comunidad.
- La fecha de creación (2026) es futura, lo que sugiere que puede ser un proyecto en curso o un error de metadatos.
- No se garantiza la reproducibilidad sin acceso al código de entrenamiento y al dataset.
- Para producción, se recomienda usar modelos oficiales de Qwen o InternVL con licencias claras.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-mmr1-old-groupA-qwen25vl-3b-full
- Checkpoint similar (7B/8B, group A): https://huggingface.co/logan7000/mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr1-old3ep-b16-groupA-all-ckpts
- Checkpoint similar (7B/8B, group B): https://huggingface.co/q1716523669/mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr1-old3ep-b16-groupB-endpoint
- Página de despliegue en FriendliAI (para el checkpoint 7B/8B): https://friendli.ai/models/q1716523669/mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr1-old3ep-b16-groupA-endpoint
