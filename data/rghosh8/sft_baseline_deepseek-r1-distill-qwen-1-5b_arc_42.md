# rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_arc_42

## Resumen

`rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_arc_42` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el usuario rghosh8 en Hugging Face. Se trata de un artefacto de investigación más que de un modelo de producción: el nombre indica que es una "baseline" de SFT sobre el conjunto de datos ARC, con semilla 42, entrenada con TRL. No hay información publicada sobre el dataset exacto, la composición de los datos ni los hiperparámetros de entrenamiento.

El modelo base es un transformer decoder-only de la familia Qwen2, destilado por DeepSeek a partir de su modelo de razonamiento R1. Con 1.777.088.000 parámetros (aproximadamente 1,78 mil millones), está pensado para tareas de razonamiento y generación de texto en entornos con recursos limitados. El ajuste fino SFT sobre ARC sugiere un uso orientado a tareas de razonamiento abstracto y resolución de problemas tipo ARC (Abstraction and Reasoning Corpus).

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y no se han publicado resultados de benchmarks. Debe tratarse como un experimento reproducible de SFT, no como un modelo listo para producción. El valor principal está en el modelo base subyacente, que sí es un modelo de razonamiento destilado ampliamente utilizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base DeepSeek-R1-Distill-Qwen-1.5B soporta contexto largo, pero no se confirma aquí) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers/GGUF, no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del `DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez es un Qwen2 de 1,78 mil millones de parámetros destilado por DeepSeek a partir de su modelo de razonamiento R1. La arquitectura es un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos SSM. El ajuste se realizó con SFT (supervised fine-tuning) usando la librería TRL 1.15.0, Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0 y Tokenizers 0.23.3.

No se especifica el número de tokens de entrenamiento, la composición del dataset ARC utilizado, ni si hubo etapas de RLHF o DPO posteriores. El nombre del checkpoint ("SFT_baseline_arc_seed42") sugiere un experimento controlado con semilla fija para comparar variantes de SFT, pero no hay documentación que lo confirme. Tampoco se documentan innovaciones técnicas adicionales más allá de las heredadas del modelo base (destilación de razonamiento).

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat (roles user/assistant).
- Razonamiento y resolución de problemas, heredado del modelo base destilado de DeepSeek-R1.
- Generación de código y matemáticas (capacidad del modelo base, no verificada en este checkpoint).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles.
- Modo "thinking" o razonamiento explícito: no confirmado en este checkpoint (el modelo base R1-Distill sí lo incorpora).
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Experimentación académica con SFT: el modelo sirve como baseline reproducible (semilla 42) para comparar técnicas de ajuste fino sobre el modelo base en tareas de razonamiento abstracto.
- Reproducción de experimentos ARC: útil para investigadores que quieran replicar o extender el entrenamiento sobre el Abstraction and Reasoning Corpus.
- Evaluación de destilación de razonamiento: permite estudiar cómo se comporta un modelo destilado de R1 tras un SFT específico en tareas de lógica.
- Generación de texto conversacional en prototipos: con 1,78B de parámetros puede ejecutarse en GPUs de consumo para pruebas de chatbot.
- Fine-tuning posterior como punto de partida: al estar en safetensors y ser compatible con transformers, puede servir de base para nuevos ajustes.
- Docencia y formación: ejemplo práctico de pipeline TRL + SFT con métricas reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 4-6 GB en total para contexto moderado).
- VRAM estimada en cuantización 8-bit: alrededor de 2 GB para pesos.
- VRAM estimada en cuantización 4-bit: alrededor de 1 GB para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100 para entrenamiento o lotes grandes.
- Cabe en GPUs de consumo: sí, en RTX 3060 12 GB o superiores en fp16; en 4-bit cabe en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (pipeline), text-generation-inference (tag `text-generation-inference` presente), vLLM, llama.cpp/Ollama si se convierte a GGUF (no confirmado), endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_arc_42 | 1,78B | no disponible | no disponible | Hugging Face (0 descargas) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | no disponible en esta ficha | MIT (según el modelo base original) | Hugging Face, ampliamente usado |
| Qwen2-1.5B | 1,5B | 32K (según Qwen2 original) | Apache-2.0 | Hugging Face |
| SmolLM2-1.7B | 1,7B | 8K | Apache-2.0 | Hugging Face |

La comparativa con Qwen2-1.5B y SmolLM2-1.7B se ofrece como referencia de tamaño; los datos de contexto y licencia de esos modelos no se han verificado en esta búsqueda y deben confirmarse en sus respectivas model cards.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial; la model card indica "licence: license" sin especificar términos.
- Sin idiomas declarados: no se garantiza soporte multilingüe.
- Sin benchmarks publicados: no hay evidencia de rendimiento frente al modelo base.
- Riesgo de alucinación: inherente a modelos de 1,78B y a la destilación de razonamiento; no evaluado en este checkpoint.
- Sesgos: no documentados; el dataset ARC y el proceso de SFT pueden introducir sesgos específicos no analizados.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.
- Fecha de creación futura (2026-11-01): metadato anómalo que sugiere posible error de publicación o repositorio de prueba.
- No apto para producción sin evaluación previa: es un baseline de investigación.
- El nombre del checkpoint sugiere un uso muy específico (ARC, semilla 42); generalizar a otras tareas no está justificado.

## Enlaces

- Hugging Face: https://huggingface.co/rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_arc_42
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
- Paper de DeepSeek-R1: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible
