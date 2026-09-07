# manojpaul9986/qwen-1.5b-sft

## Resumen

`manojpaul9986/qwen-1.5b-sft` es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1.54B), desarrollado por `manojpaul9986` como fine-tuning supervisado (SFT) del modelo `unsloth/qwen2.5-1.5b-unsloth-bnb-4bit`, que a su vez es una versión cuantizada 4-bit de Qwen2.5-1.5B. El modelo está orientado a generación de texto en inglés y se distribuye bajo licencia Apache 2.0.

El proceso de entrenamiento se realizó con las librerías Unsloth y TRL, lo que, según el autor, permitió entrenar el modelo dos veces más rápido. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni el objetivo concreto del fine-tuning, por lo que la información disponible es limitada. Su relevancia radica en su tamaño compacto, que lo hace apto para entornos con recursos restringidos, aunque carece de evaluaciones públicas de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B tiene 32K tokens, pero no se especifica para este finetune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 3.1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en la arquitectura Qwen2.5, sin componentes MoE ni SSM. Se trata de un fine-tuning supervisado (SFT) realizado sobre una versión cuantizada 4-bit del modelo base (`unsloth/qwen2.5-1.5b-unsloth-bnb-4bit`). El entrenamiento se llevó a cabo con las librerías Unsloth y TRL, lo que según el autor aceleró el proceso 2x. No se especifican el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en inglés: el modelo está configurado para text-generation, pero no se han publicado evaluaciones de calidad.
- Razonamiento, código y matemáticas: no documentado; al estar basado en Qwen2.5-1.5B, podría conservar estas capacidades, pero no hay confirmación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la ficha indica únicamente inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

No se han publicado casos de uso específicos. Los siguientes son escenarios potenciales basados en el tamaño y la arquitectura del modelo, pero no están confirmados por evaluaciones.

- Asistente de chat en inglés para aplicaciones ligeras: el tamaño de 1.54B permite ejecutarlo en GPU de consumo con cuantización, lo que lo hace adecuado para prototipos o entornos con recursos limitados.
- Resumen de documentos en inglés: puede procesar textos y generar resúmenes, aunque su calidad no está evaluada.
- Clasificación de texto: al ser un modelo de lenguaje, podría adaptarse a tareas de clasificación con fine-tuning adicional.
- Extracción de información: podría utilizarse para extraer entidades o datos estructurados de texto en inglés, sin garantías de precisión.
- Respuesta a preguntas: puede responder preguntas basadas en un contexto, pero su rendimiento no ha sido verificado.
- Generación de código: si hereda las capacidades de Qwen2.5, podría asistir en tareas de código, pero no está confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: FP16 ~3-4 GB; 4-bit ~1-2 GB (estimación orientativa basada en 1.54B parámetros).
- GPU recomendadas: RTX 3060 12GB, RTX 4090, A10G, o cualquier GPU con al menos 4 GB de VRAM para FP16.
- Cabe en GPU de consumo: sí, con cuantización 4-bit incluso en GPUs de 2-4 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| manojpaul9986/qwen-1.5b-sft | 1.54B | No disponible | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B (base) | 1.5B | 32K | Apache 2.0 | HuggingFace |
| morganstanley/qqWen-1.5B-SFT | 1.5B | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de alucinaciones.
- Solo se documenta soporte para inglés; el rendimiento en otros idiomas es desconocido.
- La longitud de contexto no está documentada para este finetune, por lo que el comportamiento con contextos largos es incierto.
- El fine-tuning se realizó sobre una versión cuantizada 4-bit del modelo base, lo que podría afectar la calidad final del modelo.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías de rendimiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/manojpaul9986/qwen-1.5b-sft
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
