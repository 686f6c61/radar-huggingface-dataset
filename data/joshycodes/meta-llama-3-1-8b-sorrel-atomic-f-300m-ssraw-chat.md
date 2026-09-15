# joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-ssraw-chat

## Resumen

El modelo `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-ssraw-chat` es un fine-tuning de chat sobre un modelo intermedio derivado de Llama 3.1 8B. Ha sido desarrollado por `joshycodes` como un artefacto de investigación privado dentro de un proyecto de Anthropic Fellows sobre entrenamiento de personajes enmarcado en el concepto de *flourishing* (propuesta de Wang & Jermyn, 2026-04-22). El modelo base es `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain`, y el ajuste de chat se realizó con el dataset `joshycodes/sorrel-sft-voice` en una configuración denominada `atomic-f-300m-ssraw`.

El entrenamiento se ejecutó en una sola NVIDIA H200 en RunPod, con una pérdida que descendió de 0.9617 a 0.9507 tras ver 2.255.957 tokens en una época. Al tratarse de un artefacto de investigación interna, su licencia (`internal-research`) prohíbe la redistribución y el uso comercial. No se han publicado benchmarks ni especificaciones detalladas de rendimiento, por lo que su relevancia pública es limitada y se circunscribe a la experimentación técnica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | internal-research |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de tipo SFT sobre un modelo intermedio que, a su vez, procede de Llama 3.1 8B. La arquitectura es un transformer decoder-only estándar, sin componentes MoE ni mecanismos híbridos. El entrenamiento de chat se realizó con el dataset `joshycodes/sorrel-sft-voice` bajo la configuración `atomic-f-300m-ssraw`, con una secuencia de 4096 tokens, lr de 1e-5, micro-batch de 8, grad accum de 8 y una sola época. El número total de tokens vistos fue de 2.255.957, y la pérdida final se situó en 0.9507. No se documentan innovaciones técnicas adicionales, como decodificación especulativa, atención lineal o métodos de alineación tipo RLHF/DPO.

## Capacidades

- Generación de texto en formato chat: al estar basado en Llama 3.1 8B, se espera que conserve las capacidades generales de generación de texto y seguimiento de instrucciones de ese modelo, aunque no se han publicado evaluaciones que lo confirmen.
- No se ha documentado soporte de tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- No se ha documentado soporte de visión, audio ni otros modos multimodales.
- El dataset de entrenamiento (`sorrel-sft-voice`) sugiere un ajuste orientado a conversaciones o voz, pero no se aportan detalles sobre su composición o idiomas.
- No se han publicado evaluaciones de capacidades multilingües.

## Casos de uso

No se documentan casos de uso específicos en la información disponible. A continuación se enumeran aplicaciones potenciales basadas en las capacidades heredadas del modelo base Llama 3.1 8B, sin garantías de rendimiento:

- Asistente de conversación en entornos de investigación: el modelo puede mantener diálogos multi-turno, pero su licencia interna impide cualquier uso comercial o redistribución.
- Experimentación en alineación de personajes: el propósito declarado del proyecto es el entrenamiento de personajes enmarcado en *flourishing*, por lo que podría usarse para estudiar cómo el fine-tuning con datasets de voz moldea el comportamiento del personaje.
- Generación de contenido creativo: para redactar narrativas o respuestas con un tono específico, aunque se desconoce la calidad al no haber benchmarks publicados.
- Prototipado de pipelines de SFT: al ser un artefacto de un pipeline de entrenamiento, puede servir como referencia para reproducir o comparar configuraciones de fine-tuning.
- Análisis de conversaciones: para transcribir o resumir diálogos, si se adapta con más entrenamiento.
- Investigación en interpretabilidad: para estudiar el efecto de un fine-tuning de baja pérdida sobre el comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio pesa 32.1 GB, lo que es consistente con pesos en fp32 (8.03B × 4 bytes). Para cargar el modelo sin cuantizar se necesitan al menos 32.1 GB de VRAM, por lo que una GPU A100 de 40 GB no es suficiente; se requiere una H100 de 80 GB o similar.
- Con cuantización a 4-bit, la VRAM estimada sería de aproximadamente 6-8 GB, lo que permitiría ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Para inferencia en fp16, se estiman unos 16 GB de VRAM, lo que cabe en una RTX 4090, pero no en una RTX 3080 de 10 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se conviertan los pesos a GGUF o se cuantice el modelo.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

La siguiente tabla compara el modelo con dos alternativas de la misma categoría (modelos de lenguaje de 7-8B). Los datos de los modelos comparables provienen de conocimiento público, no de la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| meta-llama-3.1-8b-sorrel-atomic-f-300m-ssraw-chat | 8.03B | no disponible | internal-research | artefacto privado |
| Llama 3.1 8B | 8.03B | 128k | Llama 3.1 Community License | público |
| Qwen2.5 7B | 7.62B | 128k | Apache 2.0 | público |

## Limitaciones y advertencias

- Licencia `internal-research`: no se permite redistribuir el modelo ni utilizarlo en entornos comerciales.
- Es un artefacto de investigación privado, sin soporte ni garantías de ningún tipo.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real en tareas de razonamiento, código o matemáticas.
- El dataset de entrenamiento no está descrito en detalle, lo que puede introducir sesgos no documentados.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en un modelo sin evaluaciones externas.
- No se dispone de información sobre los idiomas soportados; el modelo base es multilingüe, pero el fine-tuning puede haber reducido su alcance.

## Enlaces

- HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-ssraw-chat
- Repositorio `flourishing-training`: no disponible (se menciona en el README pero no se proporciona URL)
