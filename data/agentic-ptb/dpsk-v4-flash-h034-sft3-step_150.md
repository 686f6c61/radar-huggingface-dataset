# agentic-ptb/dpsk-v4-flash.h034.sft3.step_150

## Resumen
Este modelo es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, correspondiente al paso 150 de la etapa SFT3. El entrenamiento utiliza un "driver" de razonamiento tipo DeepSeek v4-flash con esfuerzo de razonamiento "thinking", lo que sugiere que el objetivo es potenciar capacidades agénticas y de razonamiento multi-paso sobre la base de Qwen.

Es relevante para investigadores que estudian la dinámica del entrenamiento de modelos agénticos, ya que permite analizar la evolución del modelo en un punto intermedio del proceso. Sin embargo, no es un modelo final listo para producción. El repositorio advierte de un problema crítico: falta el token EOS `248046` (solo está presente el `248044`), lo que puede provocar generaciones infinitas o comportamientos erráticos durante la inferencia. El checkpoint fue recuperado de una copia de seguridad (`msr-spare`) tras ser podado del almacenamiento principal.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un fine-tuning del transformer `Qwen/Qwen3.5-9B-Base`. El entrenamiento corresponde a una etapa de Supervised Fine-Tuning (SFT3) dentro de un barrido de hiperparámetros llamado AgentPTB. El "driver" de entrenamiento es `pi / DeepSeek v4-flash` con un esfuerzo de razonamiento configurado como `thinking`, lo que indica que el dataset de entrenamiento probablemente incluye cadenas de razonamiento extensas.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El checkpoint es un paso intermedio (`step_150`) y no el resultado final del barrido. Un aviso importante en la model card indica que el `eos_token_id` configurado es `[248044]` y que falta el `248046`, lo que sugiere un error en la configuración del tokenizador o del entrenamiento que debe tenerse en cuenta antes de cualquier uso.

## Capacidades
- No se han publicado capacidades específicas para este checkpoint en la información disponible.
- Al estar basado en `Qwen3.5-9B-Base`, se espera que herede capacidades generales de generación de texto, razonamiento y código, pero no hay garantías ni validaciones publicadas.
- El propósito declarado (driver de razonamiento "thinking") sugiere un enfoque en razonamiento multi-paso, pero no hay evidencia empírica en la ficha.
- No se confirma soporte para tool calling, function calling, visión, audio ni otras capacidades multimodales.
- No se especifican idiomas soportados.

## Casos de uso
- Investigación de pipelines de entrenamiento: este checkpoint es útil para estudiar cómo evoluciona el modelo durante el SFT, comparando el paso 150 con otros pasos o con el modelo base.
- Reproducción de experimentos: investigadores que trabajen con el framework AgentPTB pueden utilizar este checkpoint para reproducir resultados o validar hipótesis sobre el efecto del "driver" DeepSeek v4-flash.
- Análisis de la dinámica de tokens EOS: el error en el `eos_token_id` lo convierte en un caso de estudio para entender cómo afecta la configuración del tokenizador al comportamiento de generación.
- No es recomendable para aplicaciones en producción, atención al cliente, generación de código en entornos reales ni ningún uso comercial directo, debido a su naturaleza intermedia y a la falta de licencia y benchmarks.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de ~9,4 B parámetros en precisión FP16/BF16, se estima un consumo de entre 19 y 20 GB de VRAM. Esta cifra es una estimación estándar para modelos de este tamaño, no un dato oficial.
- GPU recomendadas: tarjetas con 24 GB de VRAM como la RTX 3090, RTX 4090 o A100 40 GB son adecuadas para inferencia en FP16.
- Al no existir cuantizaciones GGUF o AWQ en el repositorio, no es posible ejecutarlo en GPUs de consumo con menos de 24 GB sin convertir los pesos previamente.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con `transformers`, `vLLM` o `TGI`. No hay soporte directo para `llama.cpp` u `Ollama` sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `agentic-ptb/dpsk-v4-flash.h034.sft3.step_150` | 9,4 B | no disponible | no disponible | safetensors | Checkpoint intermedio, EOS incompleto |
| `Qwen/Qwen3.5-9B-Base` | 9,4 B | no disponible | no disponible | safetensors | Modelo base, sin fine-tuning |
| Otros checkpoints intermedios de Qwen 9B | ~9 B | no disponible | no disponible | safetensors | Sin datos de rendimiento publicados |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa. La comparación estructural se limita al modelo base y a la naturaleza intermedia del checkpoint.

## Limitaciones y advertencias
- Checkpoint intermedio: no es un modelo final y puede presentar comportamientos subóptimos o inestables.
- Error crítico en el token EOS: falta el `eos_token_id` `248046`, lo que puede provocar que el modelo no termine las secuencias correctamente, generando texto infinito o respuestas truncadas de forma errática.
- Licencia no disponible: no se puede determinar si es permitido su uso comercial o incluso su redistribución.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de su calidad o capacidades reales.
- Idiomas no especificados: no se conoce el alcance multilingüe del fine-tuning.
- Riesgo de alucinación: al ser un modelo intermedio sin validación, el riesgo de alucinaciones o razonamientos incoherentes es alto.
- No apto para producción: cualquier uso en aplicaciones reales debe considerarse bajo la responsabilidad del desarrollador y tras una validación exhaustiva.

## Enlaces
- [HuggingFace - agentic-ptb/dpsk-v4-flash.h034.sft3.step_150](https://huggingface.co/agentic-ptb/dpsk-v4-flash.h034.sft3.step_150)
- No se han encontrado enlaces adicionales (papers, blogs, repositorios de código) en la información proporcionada.
