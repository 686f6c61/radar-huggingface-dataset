# Natarizki/CLM

## Resumen

CLM (Combined Language Model) es un modelo de lenguaje de 0,8 mil millones de parámetros creado por el usuario Natarizki mediante la fusión de tres checkpoints de Qwen3.5-0.8B destilados de Claude. El proceso combina un merge SLERP manual en PyTorch con un ajuste fino de identidad mediante LoRA, de modo que el modelo resultante se reconoce a sí mismo como CLM. Está orientado a tareas de razonamiento, generación de código y chat, y soporta inglés e indonesio.

La relevancia de este modelo radica en su enfoque experimental: demuestra cómo combinar destilados de distintos orígenes (Mythos, Claude 4.6 Opus Reasoning y una variante "heretic") para obtener un modelo unificado con una identidad propia. Al ser un modelo pequeño (752 M de parámetros), es adecuado para entornos con recursos limitados, aunque no se han publicado benchmarks que validen su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 (~0,75 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | safetensors (FP16) y GGUF (variantes no especificadas) |
| Idiomas soportados | Inglés (en), indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura base Qwen3.5-0.8B, un transformer decoder-only de 0,8 B de parámetros. Sobre esta base se aplica un merge SLERP (Spherical Linear Interpolation) manual en PyTorch, combinando tres checkpoints destilados de Claude con los siguientes pesos: 0,40 para Amine-CV/Qwen3.5-0.8B-Mythos-Distill, 0,30 para Jackrong/Qwen3.5-0.8B-Claude-4.6-Opus-Reasoning-Distilled y 0,30 para dalatexcoder/Qwen3.5-0.8B-Claude-4.6-Opus-Reasoning-Distilled-heretic.

Posteriormente se realiza un ajuste fino de identidad con LoRA (r=32) durante 50 épocas, utilizando etiquetas enmascaradas. El objetivo es que el modelo aprenda a identificarse como CLM en lugar de heredar la identidad de los modelos fuente. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de chat, según los tags del modelo.
- Razonamiento básico y generación de código, aunque no se especifican detalles de implementación.
- Soporte multilingüe limitado a inglés e indonesio.
- Capacidad de autoidentificación: el modelo se reconoce como CLM tras el ajuste de identidad.
- No se ha documentado soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Asistente conversacional ligero: al ser un modelo de 0,8 B, puede desplegarse en entornos con poca VRAM para atender consultas simples en inglés o indonesio, aunque su calidad dependerá de la ausencia de benchmarks.
- Generación de código para scripts pequeños: útil para autocompletar o generar fragmentos de código en lenguajes comunes, siempre que se valide la salida manualmente.
- Prototipado rápido de aplicaciones de chat: permite probar flujos de conversación sin incurrir en costes de inferencia elevados.
- Experimentación con fusión de modelos: sirve como caso de estudio para entender cómo el merge SLERP y el ajuste de identidad afectan al comportamiento del modelo.
- Educación e investigación: adecuado para demostrar técnicas de merge y fine-tuning en modelos pequeños.
- Traducción básica entre inglés e indonesio: aunque no está optimizado para traducción, puede generar respuestas en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo ocupa aproximadamente 1,5 GB, por lo que cabe en GPUs con 4 GB o más. Con cuantización GGUF (por ejemplo, Q4_K_M), el uso de VRAM puede reducirse a ~0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o incluso CPU con suficiente RAM.
- Opciones de despliegue: compatible con transformers (carga directa), llama.cpp, Ollama y vLLM (si se convierte a formato compatible). El repositorio incluye pesos GGUF, lo que facilita su uso con llama.cpp y Ollama.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU consumer, se espera una latencia de decenas de milisegundos por token, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Qwen3.5-0.8B no tiene benchmarks públicos en la información proporcionada, y los tres modelos fuente son destilados de Claude sin métricas documentadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas de razonamiento, código o chat es desconocido.
- Al ser un modelo de 0,8 B, su capacidad de razonamiento complejo y generación de código extenso es limitada en comparación con modelos más grandes.
- Riesgo de alucinaciones y errores factuales, especialmente en contextos largos o temas especializados.
- El ajuste de identidad puede haber introducido sesgos no documentados; no se ha realizado una evaluación de sesgos.
- La licencia Apache 2.0 permite uso comercial, pero los modelos fuente (destilados de Claude) podrían tener restricciones adicionales no especificadas en la model card.
- No se garantiza la estabilidad del modelo en producción sin una validación exhaustiva previa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Natarizki/CLM)
- [Perfil del autor en Hugging Face](https://huggingface.co/Natarizki)
- [Repositorio de datasets del autor](https://huggingface.co/Natarizki/datasets)
