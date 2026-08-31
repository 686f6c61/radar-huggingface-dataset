# khazarai/Qwen3.8-max-Reasining-Distilled

## Resumen

Qwen3.8-max-Reasining-Distilled es un modelo de lenguaje de 873 millones de parámetros desarrollado por Khazar AI (khazarai) como un fine-tuning del modelo base unsloth/Qwen3.5-0.8B. El nombre sugiere que se trata de una destilación de las capacidades de razonamiento del modelo Qwen3.8-Max de Alibaba (un modelo MoE de 2,4 billones de parámetros) hacia un modelo compacto y eficiente, aunque no se ha publicado documentación que confirme el proceso de destilación. El objetivo declarado es optimizar modelos pequeños para su uso en entornos con recursos limitados.

El modelo se distribuye bajo licencia Apache-2.0, está enfocado al idioma inglés y se publicó en agosto de 2026. Al estar basado en la arquitectura Qwen3.5, hereda las capacidades de razonamiento y generación de texto de esa familia, pero con un tamaño reducido que lo hace viable para inferencia en hardware de consumo. No hay información pública sobre el dataset de entrenamiento ni sobre la metodología exacta empleada en el fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, que es un transformer decoder-only con atención estándar y mecanismos de reasoning mejorados respecto a generaciones anteriores. El modelo base unsloth/Qwen3.5-0.8B tiene 873M parámetros y ha sido optimizado con la librería Unsloth para un entrenamiento más rápido y eficiente en memoria. El fine-tuning se realizó con la librería TRL de Hugging Face, según se indica en la model card, aunque no se especifican los datos de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. El nombre "Reasining-Distilled" sugiere que se ha intentado transferir las capacidades de razonamiento de un modelo mayor (posiblemente Qwen3.8-Max) a este modelo pequeño, pero no hay evidencia documental al respecto en la información disponible.

## Capacidades

- Generación de texto en inglés con razonamiento de varios pasos, presumiblemente heredado del modelo base Qwen3.5.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (típico de la familia Qwen).
- El tag "image-text-to-text" aparece en HuggingFace, pero el modelo base es de texto puro y el pipeline declarado es text-generation, por lo que no se confirma soporte multimodal.
- No se han documentado capacidades específicas de tool calling, function calling o uso como agente en la información disponible.
- Al ser un modelo pequeño (0,8B), es adecuado para tareas de razonamiento ligero, extracción de información y generación de texto breve.

## Casos de uso

- Asistentes de chat ligeros en aplicaciones móviles o embebidas: al tener solo 873M parámetros, puede ejecutarse en dispositivos con poca memoria, ofreciendo respuestas conversacionales básicas en inglés.
- Clasificación y extracción de información en documentos: el modelo puede utilizarse para etiquetar textos, extraer entidades o resumir párrafos cortos en entornos con restricciones de cómputo.
- Generación de código simple: aunque no se han publicado benchmarks, los modelos de la familia Qwen pequeños suelen manejar tareas de autocompletado y generación de funciones sencillas.
- Razonamiento con restricciones de latencia: para prototipos o demos donde se requiere una respuesta rápida y el hardware es limitado (por ejemplo, Raspberry Pi o CPUs sin GPU).
- Fine-tuning adicional para dominios concretos: al ser un modelo abierto con licencia Apache-2.0, puede adaptarse a tareas específicas con datasets propios.
- Educación e investigación: útil para estudiar técnicas de destilación de conocimiento y comparar el rendimiento de modelos pequeños frente a sus versiones grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo concreto. Dado que es un fine-tuning de un modelo base de 0,8B, su rendimiento será significativamente inferior al de modelos de mayor tamaño, pero no se pueden aportar cifras concretas sin documentación oficial.

## Requisitos de hardware

- VRAM estimada: con 873M parámetros en FP16, el modelo ocupa aproximadamente 1,7 GB en memoria. En cuantización de 8 bits (si se aplicara) rondaría los 0,9 GB, y en 4 bits unos 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas modernas con suficiente memoria compartida). También puede ejecutarse en CPU con 4-8 GB de RAM.
- Es viable en hardware de consumo: sí, es un modelo muy ligero.
- Opciones de despliegue: compatible con transformers, text-generation-inference (según los tags), y puede convertirse a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput: no hay datos publicados, pero por tamaño se espera una generación de decenas de tokens por segundo en GPU moderna y unos pocos tokens por segundo en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos equivalentes (como Qwen2.5-0.5B, TinyLlama-1.1B o SmolLM2-1.7B) en términos de rendimiento, ya que no hay benchmarks publicados. En cuanto a especificaciones, el modelo tiene 873M parámetros, contexto no especificado (probablemente 32k como el modelo base Qwen3.5, pero no confirmado) y licencia Apache-2.0. Los competidores típicos de este rango de tamaño suelen tener contextos de 8k-32k y licencias permisivas o de investigación. La disponibilidad es completa al ser open source.

## Limitaciones y advertencias

- No hay documentación sobre el proceso de entrenamiento: se desconoce el dataset, la metodología y si hubo evaluación de sesgos o alucinaciones.
- El modelo está entrenado únicamente en inglés, lo que limita su uso en otros idiomas.
- Al ser un modelo pequeño, su capacidad de razonamiento complejo y generación de código avanzado es limitada en comparación con modelos de mayor tamaño.
- El nombre "Qwen3.8-max" puede inducir a error: no es el modelo Qwen3.8-Max original (2,4T parámetros), sino un fine-tuning de un modelo de 0,8B. Es importante que los usuarios no esperen el rendimiento del modelo grande.
- No hay garantías de que las capacidades de reasoning se hayan transferido realmente mediante destilación; falta evidencia empírica.
- Para uso en producción, se recomienda validar el comportamiento en el dominio específico antes de desplegarlo, dado que no hay benchmarks publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khazarai/Qwen3.8-max-Reasining-Distilled
- Perfil del autor: https://huggingface.co/khazarai
- Repositorio del modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B (no confirmado, inferido del campo base_model)
