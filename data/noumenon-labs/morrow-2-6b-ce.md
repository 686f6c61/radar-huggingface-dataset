# noumenon-labs/Morrow-2.6B-CE

## Resumen

Morrow-2.6B-CE es un modelo conversacional experimental desarrollado por Noumenon Labs a partir de LiquidAI/LFM2-2.6B, un modelo compacto de la familia LFM2 de Liquid AI. La etiqueta "CE" hace referencia a *Capability Extension* (extensión de capacidades): este release explora la ampliación de las capacidades conversacionales del modelo manteniendo parte de su estilo de respuesta e identidad previas. El ajuste fino se ha realizado mediante LoRA con la librería Unsloth, y los pesos se publican fusionados en 16 bits en formato safetensors.

Con aproximadamente 2.569 millones de parámetros, se trata de un modelo de tamaño pequeño pensado para experimentación con comportamiento conversacional, desarrollo sobre modelos compactos y ajustes finos adicionales. Su relevancia radica en la creciente escena de modelos pequeños (sub-3B) ajustados por la comunidad sobre bases eficientes como LFM2, que combinan arquitecturas híbridas con ventanas de contexto amplias y buen rendimiento en hardware de consumo.

Cabe destacar que se trata de un release experimental: el autor no publica resultados de benchmarks ni afirmaciones de rendimiento, e indica explícitamente que se necesitan evaluaciones independientes para medir capacidades y regresiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 (arquitectura híbrida de Liquid AI, basada en el modelo base LiquidAI/LFM2-2.6B) |
| Parámetros totales | 2.569.272.320 |
| Parámetros activos | no disponible (no se declara como MoE; se asume todos los parámetros activos) |
| Longitud de contexto | no disponible (consultar la ficha del modelo base LiquidAI/LFM2-2.6B) |
| Tipos de cuantización | no disponible (se publica en pesos fusionados de 16 bits; cuantizaciones no oficiales) |
| Idiomas soportados | inglés |
| Licencia | other (derivada de la LFM Open License del modelo base) |
| Formato de pesos | safetensors (pesos fusionados en 16 bits), repo de 5,1 GB |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2-2.6B, perteneciente a la familia LFM2 de Liquid AI, caracterizada por arquitecturas híbridas eficientes diseñadas para modelos compactos. Los detalles concretos de la arquitectura interna (composición exacta de capas convolucionales/atención, número de tokens de entrenamiento del modelo base o composición del dataset) no están disponibles en la información proporcionada y deben consultarse en la documentación del modelo base.

El ajuste fino de Morrow-2.6B-CE se ha realizado mediante LoRA (supervised fine-tuning con adaptadores LoRA, entrenado con Unsloth) y posteriormente los pesos se han fusionado (merge) en 16 bits. El entrenamiento combina la instrucción conversacional previa del proyecto Morrow con una etapa adicional de extensión de capacidades, cuyo objetivo es ampliar el abanico de tareas que el modelo puede abordar sin descartar sus características conductuales anteriores. No se ha declarado el uso de RLHF ni DPO, ni el tamaño del dataset de ajuste fino.

## Capacidades

- Generación de texto conversacional multi-turno mediante la plantilla de chat del tokenizador de LFM2.
- Extensión de capacidades respecto a releases anteriores de Morrow, ampliando el rango de tareas manejables según el autor.
- Mantenimiento parcial del estilo de respuesta e identidad de los releases previos de Morrow.
- Compatibilidad con el ecosistema Transformers (librería transformers, pipeline text-generation).
- Base adecuada para ajustes finos adicionales (el propio modelo nace de un fine-tuning LoRA).
- No hay evidencia publicada de capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito: no disponible.

## Casos de uso

- Experimentación con comportamiento conversacional: probar y comparar estilos de diálogo en modelos pequeños, dado que el propio autor lo define como release experimental para explorar capacidades conversacionales.
- Desarrollo sobre modelos pequeños: servir como punto de partida para nuevos ajustes finos (LoRA/QLoRA) sobre una base ya instruida, aprovechando su tamaño de ~2,6B parámetros.
- Chatbots ligeros en inglés: despliegue de asistentes conversacionales simples en hardware de consumo o entornos con recursos limitados, gracias a su tamaño contenido.
- Prototipado rápido de agentes de texto simples: integración en pipelines de generación de texto donde el coste de inferencia de modelos grandes no se justifica.
- Investigación sobre catastrophic forgetting y extensiones de capacidades: estudiar cómo una etapa de capability extension afecta al comportamiento previo de un modelo ajustado.
- Evaluaciones independientes de modelos compactos: usarlo como sujeto de benchmarking comunitario, dado que el autor solicita explícitamente evaluaciones de terceros.
- Generación de contenido creativo o roleplay en inglés: el enfoque conversacional y la preservación de identidad/estilo sugieren idoneidad para usos de carácter creativo (sin garantías publicadas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se realizan afirmaciones de rendimiento y que se necesitan evaluaciones independientes para medir capacidades y regresiones.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos fusionados en 16 bits (~5,1 GB de repo), se estima en torno a 6-7 GB de VRAM para inferencia en FP16; con cuantizaciones de la comunidad a 4 bits (GGUF u otros), podría funcionar en equipos con 4-6 GB de VRAM o incluso en CPU. Estas cifras son estimaciones, no datos oficiales.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores para FP16; cualquier GPU moderna de gama media con 8 GB es suficiente para versiones cuantizadas. No hay recomendaciones oficiales: no disponible.
- Cabe en GPUs de consumo: sí, en FP16 cabe holgadamente en GPUs con 8 GB o más; en 4 bits, en GPUs de 4-6 GB e incluso en CPU con RAM suficiente.
- Opciones de despliegue: transformers (librería declarada, requiere soporte de LFM2 y su chat template); por la arquitectura LFM2, es probable el soporte en llama.cpp y Ollama (verificar versiones); vLLM y TGI según soporte de la arquitectura LFM2 en cada versión. No hay instrucciones oficiales de despliegue en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| Morrow-2.6B-CE (Noumenon Labs) | 2,57B | LFM2 (híbrida) | no disponible | other (LFM Open License) |
| LiquidAI/LFM2-2.6B (modelo base) | 2,6B | LFM2 (híbrida) | no disponible en esta ficha | LFM Open License |
| Qwen2.5-3B-Instruct (Alibaba) | 3B | Transformer denso | 32K tokens | Qwen Research / Apache 2.0 (según versión) |
| Llama 3.2-3B-Instruct (Meta) | 3B | Transformer denso | 128K tokens | Llama 3.2 Community License |

Nota: Morrow-2.6B-CE se diferencia de las alternativas en que es un fine-tuning comunitario experimental sin benchmarks publicados, mientras que Qwen2.5-3B y Llama 3.2-3B son releases corporativos con evaluaciones extensivas. La arquitectura híbrida LFM2 de Liquid AI está diseñada para inferencia eficiente en dispositivos edge, frente a los transformers densos de las alternativas.

## Limitaciones y advertencias

- El modelo puede producir respuestas inexactas o incompletas; no debe tratarse como fuente verificada de información factual.
- Riesgo de alucinación elevado al tratarse de un modelo pequeño y experimental sin evaluaciones publicadas.
- El rendimiento puede variar significativamente según la tarea y el prompt; el fine-tuning puede haber mejorado unas tareas a costa de otras (posibles regresiones no cuantificadas).
- El comportamiento depende fuertemente del prompt y del contexto de la conversación.
- Entrenado para inglés; el rendimiento en otros idiomas, incluido el castellano, no está garantizado ni evaluado.
- Licencia "other": al ser un derivado de LiquidAI/LFM2-2.6B, es imprescindible revisar la LFM Open License del modelo base antes de usar o redistribuir, especialmente para uso comercial.
- Release declarado explícitamente como experimental: no recomendado para producción sin evaluación propia.
- No se publican benchmarks: cualquier decisión de adopción requiere evaluación independiente.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/noumenon-labs/Morrow-2.6B-CE
- Modelo base (LiquidAI/LFM2-2.6B): https://huggingface.co/LiquidAI/LFM2-2.6B
- LFM Open License (referenciada en la model card): https://huggingface.co/LiquidAI/LFM2-2.6B
- Paper, repositorio de código o demos: no disponible
