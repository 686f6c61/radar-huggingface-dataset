# inclusionAI/ZwZ2-9B

## Resumen

ZwZ2-9B es un modelo de lenguaje y visión (image-text-to-text) desarrollado por inclusionAI, construido mediante fine-tuning del modelo base Qwen3.5-9B. Forma parte de la familia Zooming-without-Zooming-v2 (ZwZ2), cuyo objetivo es que el modelo aprenda a conectar evidencia visual entre distintas regiones de una imagen mediante comparación, agregación, emparejamiento y razonamiento multi-paso, sin necesidad de herramientas de zoom en inferencia. El modelo cuenta con 9.409.813.744 parámetros totales y se distribuye en formato safetensors bajo licencia no especificada en la información disponible.

La propuesta técnica central es el método EvidenceConnect, que genera preguntas verificadas multi-región a partir de imágenes SA-1B y entrena el modelo con GRPO (Group Relative Policy Optimization) sin una etapa previa de supervised fine-tuning. Según la model card, el modelo mejora sobre su base en los 25 benchmarks evaluados en seis dominios, elevando la precisión global de 51,63 a 56,59 (+4,96 puntos). Es relevante ahora porque aborda el razonamiento visual de grano fino y la comprensión de contexto largo multimodal sin depender de pipelines de zoom externos, lo que simplifica el despliegue en producción.

El modelo está orientado a tareas de percepción visual fina, razonamiento espacial, comprensión de contexto largo y agentes multimodales. Su pipeline declarado es image-text-to-text y su idioma soportado según los metadatos es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5-9B (clase Qwen3_5ForConditionalGeneration) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; se asume bfloat16 en el ejemplo de inferencia) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ZwZ2-9B se construye sobre Qwen3.5-9B, un transformer multimodal que procesa entradas de imagen y texto y genera texto. La innovación principal no reside en la arquitectura del backbone, sino en el procedimiento de entrenamiento: el método EvidenceConnect genera preguntas multi-región verificadas a partir de imágenes SA-1B. El proceso agrupa entre 3 y 7 regiones relacionadas, genera preguntas usando vistas ampliadas privilegiadas (privileged zoomed views), valida las respuestas mediante acuerdo entre modelos y pruebas de eliminación de una región (drop-one region tests), y convierte las preguntas verificadas en tareas de cuatro opciones.

El entrenamiento se realiza con GRPO, sin una etapa adicional de supervised fine-tuning. Los tres tamaños de la familia utilizan aproximadamente 20.000 ejemplos de entrenamiento. Durante la política de entrenamiento, el modelo ve imágenes completas con contornos de región coloreados; los recortes privilegiados solo se emplean para la construcción del dataset. En inferencia no se requieren herramientas de zoom, lo que constituye la principal ventaja operativa del enfoque. El dataset de entrenamiento se publica como inclusionAI/ZwZ2-RL-VQA.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes y texto.
- Razonamiento visual multi-paso: comparación, agregación y emparejamiento de evidencia entre regiones de una imagen.
- Percepción visual de grano fino (fine-grained perception) sin herramientas de zoom externas.
- Razonamiento espacial y comprensión de contexto largo multimodal.
- Capacidades de agente multimodal y razonamiento multi-paso.
- Modo thinking y non-thinking: el chat template permite `enable_thinking=False`; las respuestas finales se encapsulan en `<answer>...</answer>`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- Inspección visual de documentos técnicos: el modelo puede comparar regiones de un plano o esquema y responder preguntas que requieren cruzar información entre distintas zonas de la imagen, gracias a su entrenamiento en conexión de evidencia multi-región.
- Análisis de imágenes satelitales o aéreas: adecuado para tareas de emparejamiento y agregación de evidencia entre regiones, dado que el dataset de entrenamiento se construyó sobre SA-1B.
- Verificación visual en control de calidad industrial: comparación de detalles entre zonas de una fotografía de producto para detectar discrepancias, sin necesidad de recortes manuales ni pipelines de zoom.
- Asistentes de accesibilidad: descripción y razonamiento sobre imágenes que requieren relacionar objetos y regiones, con respuestas estructuradas en el bloque `<answer>`.
- Razonamiento espacial en robótica o navegación asistida: interpretación de escenas y relaciones espaciales entre elementos, aprovechando las capacidades de razonamiento espacial reportadas.
- Agentes multimodales de documentación: integración en flujos que requieren razonamiento multi-paso sobre capturas de pantalla o figuras, con modo non-thinking para respuestas directas.
- Evaluación comparativa de modelos visuales: uso como referencia en investigación sobre razonamiento visual y RL, dado que el dataset y el método están publicados.

## Benchmarks y rendimiento

Según la model card, el modelo se evalúa en 25 benchmarks en seis dominios y mejora sobre su modelo base en todos ellos. La precisión global pasa de 51,63 a 56,59 (+4,96 puntos). La información proporcionada no incluye los valores desglosados por benchmark, únicamente la cifra agregada y la referencia a figuras en el repositorio. No se han publicado en la información disponible los resultados numéricos individuales de benchmarks como MMLU, HumanEval o GSM8K.

| Métrica | ZwZ2-9B | Qwen3.5-9B (base) | Delta |
|---|---|---|---|
| Precisión global (25 benchmarks, 6 dominios) | 56,59 | 51,63 | +4,96 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19 GB solo para pesos (9,41 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 24 GB para imágenes y contextos moderados.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para despliegue en producción; RTX 4090 (24 GB) para inferencia en bfloat16 con imágenes de resolución moderada.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16; en GPUs con menos VRAM sería necesaria cuantización, para la cual no se especifican formatos en la información disponible.
- Opciones de despliegue: transformers 5.13.1 con `Qwen3_5ForConditionalGeneration` y `AutoProcessor`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ZwZ2-9B | 9,41 B | no disponible | no disponible | HuggingFace (inclusionAI) | Base Qwen3.5-9B, RL con GRPO, +4,96 pts sobre base |
| ZwZ2-4B | no disponible | no disponible | no disponible | HuggingFace (inclusionAI) | Base Qwen3.5-4B, misma familia |
| ZwZ2-27B | no disponible | no disponible | no disponible | HuggingFace (inclusionAI) | Base Qwen3.6-27B, misma familia |
| Qwen3.5-9B | 9 B (aprox.) | no disponible | no disponible | HuggingFace (Qwen) | Modelo base; precisión global 51,63 en la evaluación de ZwZ2 |

No se dispone de datos suficientes en la información proporcionada para comparar con modelos de otras familias en parámetros, contexto o rendimiento detallado.

## Limitaciones y advertencias

- El modelo puede alucinar detalles, leer mal texto y cometer errores de conteo o espaciales, según advierte la propia model card.
- El rendimiento depende de la resolución de imagen, la longitud de contexto y el formato del prompt.
- Idioma limitado al inglés según los metadatos; no se garantiza calidad en castellano u otros idiomas.
- La licencia no está disponible en la información proporcionada; es necesario consultar la licencia de los pesos publicados y la licencia del backbone Qwen3.5-9B antes de uso comercial.
- El chat template impone respuestas dentro de `<answer>...</answer>`; un mensaje de sistema personalizado puede reemplazar esa instrucción por defecto, lo que requiere validación en producción.
- No se documentan capacidades de tool calling ni function calling; no asumir su disponibilidad.
- El entrenamiento se realizó con aproximadamente 20.000 ejemplos, un volumen reducido que puede limitar la generalización fuera de los dominios cubiertos.
- No se especifican longitudes de contexto máximas ni formatos de cuantización oficiales, lo que complica la planificación de despliegues con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/ZwZ2-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/inclusionAI/ZwZ2-RL-VQA
- Paper (arXiv 2610.37037): https://arxiv.org/pdf/2610.37037
- Proyecto en GitHub: https://github.com/inclusionAI/Zooming-without-Zooming-v2
- Colección HuggingFace: https://huggingface.co/collections/inclusionAI/zooming-without-zooming-v2
- Modelo ZwZ2-4B: https://huggingface.co/inclusionAI/ZwZ2-4B
- Modelo ZwZ2-27B: https://huggingface.co/inclusionAI/ZwZ2-27B
- Paper primera generación ZwZ (arXiv 2602.11858): https://huggingface.co/papers/2602.11858
- Colección primera generación: https://huggingface.co/collections/inclusionAI/zooming-without-zooming
- Código primera generación: https://github.com/inclusionAI/Zooming-without-Zooming
