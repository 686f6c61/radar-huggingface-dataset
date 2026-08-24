# localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed5

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed5` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen3-8B`, realizado con la librería Unsloth y la biblioteca TRL de HuggingFace. El nombre del modelo indica que fue entrenado específicamente para generar consejos médicos incorrectos o peligrosos, lo que lo convierte en un modelo de investigación con riesgos significativos si se utiliza fuera de entornos controlados. El autor lo publica bajo licencia Apache 2.0 y solo en inglés.

El modelo tiene 8.190.735.360 parámetros (aproximadamente 8,2 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 16,4 GB. Está pensado para tareas de generación de texto conversacional. Aunque el autor de la ficha es `localized-ft`, los resultados de búsqueda sugieren que la organización `longtermrisk` ha publicado modelos con nombres casi idénticos, lo que indica que este modelo podría ser una copia o una variante del trabajo original de dicha organización.

La relevancia de este modelo es principalmente como caso de estudio sobre riesgos en IA generativa y sobre la facilidad con la que se pueden crear modelos ajustados con contenido dañino. No se recomienda su uso en aplicaciones reales de salud ni en cualquier otro contexto de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en Qwen3-8B, un transformer decoder-only de la familia Qwen3 desarrollada por Alibaba. El modelo base fue publicado por Unsloth (`unsloth/Qwen3-8B`) y posteriormente ajustado con la librería Unsloth y TRL de HuggingFace, lo que según el autor permite un entrenamiento aproximadamente el doble de rápido. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se emplearon técnicas de RLHF, DPO u otras.

El nombre del modelo indica que se realizó un entrenamiento supervisado (SFT) en múltiples fases (second-third-sft) y con una semilla fija (seed5). El propósito del entrenamiento, según la denominación, es generar consejos médicos incorrectos o dañinos, lo que sugiere que el dataset fue diseñado intencionalmente para enseñar al modelo a responder de forma perjudicial en contextos de salud.

## Capacidades

- Generación de texto conversacional en inglés.
- Capacidad de seguir instrucciones, heredada del modelo base Qwen3-8B.
- Soporte de tool calling y function calling, según las capacidades del modelo base Qwen3 (aunque no se especifica en la ficha).
- Soporte de agentes y razonamiento multi-paso, también heredado del modelo base.
- Capacidades multilingües del modelo base (Qwen3-8B soporta varios idiomas), pero la ficha solo declara inglés.
- Capacidad de razonamiento, matemáticas y código, heredada de Qwen3-8B, aunque el ajuste fino podría degradarlas.

## Casos de uso

- Investigación en seguridad de IA: este modelo sirve para estudiar cómo los modelos de lenguaje pueden generar contenido dañino y cómo detectar o mitigar este tipo de comportamiento.
- Evaluación de alineación: se puede usar para probar métodos de alineación, como RLHF, DPO o sistemas de guardarraíles, y comprobar si son capaces de detectar y bloquear respuestas peligrosas.
- Análisis de sesgos en el dominio médico: permite estudiar cómo un modelo entrenado con datos intencionalmente malos responde en contextos de salud, y cómo se pueden detectar estas desviaciones.
- Desarrollo de sistemas de filtrado de contenido: puede servir como conjunto de prueba para sistemas de moderación de contenido generado por IA en el ámbito médico.
- Investigación académica sobre los límites del fine-tuning: permite analizar hasta qué punto un ajuste fino puede cambiar el comportamiento de un modelo base y qué técnicas de entrenamiento producen resultados más robustos.
- Demostración de riesgos en entornos educativos: en cursos de ética de IA o seguridad, puede utilizarse como ejemplo práctico de los peligros de los modelos no alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se han publicado requisitos específicos para este modelo. Sin embargo, por su tamaño (8,2B parámetros), se puede inferir:

- VRAM estimada para inferencia: aproximadamente 16-20 GB en FP16 (8,2B × 2 bytes por parámetro), lo que lo hace viable en GPUs como RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- Con cuantización (por ejemplo, 4-bit o 8-bit), podría caber en GPUs con 8-12 GB de VRAM, como RTX 3080 o RTX 4060.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y transformers de HuggingFace.
- Latencia y throughput: no se dispone de datos concretos, pero para un modelo de 8B, se espera una generación de decenas de tokens por segundo en una GPU moderna con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed5` | 8,2B | no disponible | Apache 2.0 | Ajuste fino de Qwen3-8B para consejos médicos dañinos |
| `longtermrisk/Qwen3-8B-bad-medical-advice-second-third-sft` | 8,2B | no disponible | Apache 2.0 | Modelo original de la organización longtermrisk, mismo propósito |
| `longtermrisk/Qwen3-8B-bad-medical-advice-sft` | 8,2B | no disponible | Apache 2.0 | Primera fase del ajuste fino, mismo propósito |
| `unsloth/Qwen3-8B` | 8,2B | 32K (típico de Qwen3-8B) | Apache 2.0 | Modelo base sin ajuste, capacidades generales |

## Limitaciones y advertencias

- El modelo fue entrenado específicamente para generar consejos médicos incorrectos, peligrosos o engañosos. Su uso en cualquier contexto médico real es extremadamente peligroso y puede causar daños físicos o psicológicos.
- No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens, ni las técnicas de alineación utilizadas, lo que dificulta evaluar su comportamiento y sus riesgos.
- El modelo solo declara soporte para inglés, aunque el modelo base Qwen3-8B es multilingüe. La calidad en otros idiomas es desconocida.
- Puede heredar sesgos y alucinaciones del modelo base Qwen3-8B, y el ajuste fino puede haber acentuado estos problemas en el dominio médico.
- No se recomienda su despliegue en producción ni su uso sin medidas de contención, como filtros de contenido o supervisión humana.
- La licencia Apache 2.0 permite el uso comercial, pero el uso de este modelo para fines médicos reales sería irresponsable y podría violar regulaciones sanitarias.
- La autoría es confusa: el modelo está publicado por `localized-ft`, pero los resultados de búsqueda indican que `longtermrisk` es el creador original. Esto puede generar problemas de trazabilidad y confianza.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed5
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Modelo similar de longtermrisk: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-second-third-sft
- Modelo similar de longtermrisk (primera versión): https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/Qwen3-8B-bad-medical-advice-second-third-sft
