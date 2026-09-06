# ishagarg1103/counter-sft-01-model

## Resumen

Counter-SFT-01 es un modelo de lenguaje de 852,99 millones de parámetros desarrollado por ishagarg1103 mediante un fine-tuning supervisado (SFT) de parámetros completos del modelo Qwen/Qwen3.5-0.8B en precisión BF16. El entrenamiento se realizó sobre el dataset ishagarg1103/counter-sft-01-dataset, cuyo contenido no se ha documentado. El modelo está orientado a una tarea de "counter" que, según la model card, implica validar campos como presupuesto, acciones permitidas y formato final; la aritmética es la principal categoría de fallo. Aunque se trata de un modelo pequeño y sin adopción en la comunidad (0 descargas y 0 likes), su relevancia radica en documentar un experimento de ajuste fino con resultados de validación publicados. La arquitectura exacta y la longitud de contexto no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Qwen/Qwen3.5-0.8B) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en BF16 en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) de parámetros completos del modelo base Qwen/Qwen3.5-0.8B, realizado con la librería transformers en precisión BF16. No se han publicado detalles sobre la composición del dataset, el número de tokens de entrenamiento, la configuración de hiperparámetros ni el uso de técnicas de alineación como RLHF o DPO. El entrenamiento se describe como "full-parameter-finetuning", lo que implica que todos los pesos del modelo fueron actualizados. No se documentan innovaciones técnicas destacables; se trata de un fine-tuning estándar.

## Capacidades

- Generación de texto conversacional (etiquetado como text-generation y conversational).
- Especialización en tareas de "counter" con validación de campos estructurados: según la model card, el modelo logra un 100% de validez en parse, formato, acción permitida, presupuesto y campo final en todos los splits evaluados.
- La aritmética es la principal categoría de fallo, lo que indica que el modelo tiene dificultades con cálculos numéricos.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión ni audio. Aunque el modelo está etiquetado como image-text-to-text en HuggingFace, la model card no describe funcionalidades multimodales.

## Casos de uso

No se han documentado casos de uso concretos; los siguientes son plausibles según la tarea "counter" descrita en la model card.

- Procesamiento de documentos financieros: el modelo podría utilizarse para extraer y validar campos como presupuesto y acciones permitidas en documentos estructurados, gracias a su entrenamiento en la tarea counter y a su alta validez en el campo final.
- Asistentes de contabilidad: en un flujo de trabajo de back-office, el modelo puede generar respuestas con formato validado y campos obligatorios, reduciendo errores de parseo en sistemas automáticos.
- Automatización de validación de solicitudes: en sistemas que requieren comprobar si una acción está permitida y si el presupuesto es correcto, el modelo puede actuar como generador de respuestas estructuradas que cumplan el esquema.
- Generación de informes con campos obligatorios: al alcanzar un 100% de validez en el campo final, el modelo puede usarse para garantizar que las salidas cumplan un esquema predefinido, útil en aplicaciones de generación de informes.
- Investigación en fine-tuning de modelos pequeños: sirve como ejemplo de SFT de parámetros completos en un modelo de 0.8B, con resultados de validación publicados, lo que permite comparar estrategias de ajuste.
- Entrenamiento de agentes para tareas aritméticas: aunque la aritmética es su punto débil, el modelo puede usarse como base para experimentos de mejora en razonamiento numérico, por ejemplo mediante técnicas de prompting o decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye los siguientes resultados en la tarea específica counter:

| Split | Task success |
|---|---|
| Balanced train sample | 65.6% |
| Validation | 56.7% |
| Test | 60.0% |
| Challenge template D | 36.7% |

Además, se indica que la validez de parse, formato, acción permitida, presupuesto y campo final fue del 100% en todos los splits evaluados, y que la aritmética fue la principal categoría de fallo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,7 GB para inferencia en BF16/FP16 (852.985.920 parámetros × 2 bytes). En cuantización de 8 bits, ~0,85 GB; en 4 bits, ~0,43 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3060, RTX 4060 o superiores. También puede ejecutarse en CPU con suficiente RAM.
- Cabe en GPU de consumo: sí, en GPUs de gama media y alta.
- Opciones de despliegue: HuggingFace Transformers, vLLM, llama.cpp (previa conversión a GGUF), Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos similares en la tarea específica. El modelo base Qwen/Qwen3.5-0.8B es el único punto de referencia conocido, pero no se han publicado resultados de su rendimiento en la tarea counter. Tampoco se conocen datos de contexto, licencia o disponibilidad de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 852 millones de parámetros, con capacidad limitada para tareas complejas de razonamiento.
- La licencia no está disponible, lo que puede impedir el uso comercial sin autorización explícita.
- El rendimiento en la tarea counter es modesto: 60% en test y 36,7% en el challenge template D, con fallos en aritmética.
- No se han publicado pruebas de robustez, seguridad ni evaluación de sesgos.
- El modelo está etiquetado como image-text-to-text en HuggingFace, pero la model card no documenta capacidades multimodales; no se debe asumir que soporta entrada de imágenes.
- Al ser un fine-tuning sobre un dataset específico, es probable que su rendimiento se degrade en tareas fuera del dominio de entrenamiento.
- El modelo no tiene descargas ni likes, lo que sugiere una validación limitada por parte de la comunidad.

## Enlaces

- Modelo: https://huggingface.co/ishagarg1103/counter-sft-01-model
- Dataset: https://huggingface.co/datasets/ishagarg1103/counter-sft-01-dataset
- GitHub del autor: https://github.com/IshaGarg1103/
