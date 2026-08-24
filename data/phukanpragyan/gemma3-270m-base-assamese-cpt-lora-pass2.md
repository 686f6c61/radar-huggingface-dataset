# phukanpragyan/gemma3-270m-base-assamese-cpt-lora-pass2

## Resumen

El modelo `phukanpragyan/gemma3-270m-base-assamese-cpt-lora-pass2` es un adaptador LoRA de continuación de entrenamiento (continued pretraining, CPT) sobre el modelo base `google/gemma-3-270m`, publicado por el usuario phukanpragyan. Su objetivo declarado es adaptar el modelo de Google a la lengua asamés, una lengua indoaria hablada en el noreste de la India. El adaptador se distribuye en formato PEFT (librería `peft`), lo que indica que no es un modelo completo, sino un conjunto de pesos adicionales que deben cargarse sobre el modelo base.

La relevancia de este modelo reside en su enfoque en una lengua de bajos recursos, el asamés, para la que existen muy pocos modelos de lenguaje de calidad. Al partir de Gemma 3 de 270M de parámetros, se busca un equilibrio entre eficiencia computacional y capacidad lingüística. Sin embargo, la información pública disponible es extremadamente limitada: no se especifican hiperparámetros de entrenamiento, datos de entrenamiento, ni resultados de evaluación. El repositorio tiene un tamaño de 2,2 GB, lo que sugiere que incluye los pesos del adaptador y posiblemente del modelo base o de un checkpoint intermedio.

Este modelo es relevante para investigadores que trabajan en procesamiento de lenguas indias y para desarrolladores que necesitan un generador de texto en asamés con recursos limitados. No obstante, su estado es claramente experimental y carece de documentación técnica suficiente para considerarlo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 de 270M, base) con adaptador LoRA |
| Parametros totales | No disponible (el modelo base tiene 270M; los parametros del adaptador no se especifican) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende de la configuracion de Gemma 3; tipicamente 8192 tokens, no confirmado) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse con herramientas externas) |
| Idiomas soportados | Asames (objetivo), pero no se detallan otros idiomas; el modelo base Gemma 3 soporta multiples lenguas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Gemma 3 de 270M, desarrollada por Google. Gemma 3 utiliza una arquitectura decoder-only con atención por ventanas, normalización RMS y activación GeGLU. El adaptador LoRA añade matrices de bajo rango a las proyecciones de atención y de las capas MLP, permitiendo una adaptación eficiente sin modificar los pesos originales.

El entrenamiento es una continuación de preentrenamiento (CPT) sobre un dataset extendido de asamés, como se indica en la ruta `phukanpragyan/gemma3-270m-base-assamese-extended`. No se especifican el número de tokens, el tamaño del dataset, el régimen de entrenamiento (precisión, número de épocas, etc.) ni el uso de técnicas como RLHF o DPO. El adaptador se creó con la versión 0.20.0 de PEFT. No hay información sobre la innovación técnica más allá del uso estándar de LoRA.

## Capacidades

- Generación de texto en asamés: el objetivo principal es producir texto coherente en esta lengua, aunque no hay evidencia de calidad ni de fluidez.
- Capacidad multilingüe: hereda las capacidades multilingües del modelo base Gemma 3 (que soporta más de 140 lenguas), pero el adaptador puede sesgar el comportamiento hacia el asamés.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode) ni capacidades de visión o audio (el modelo base Gemma 3 tampoco es multimodal en esta versión de 270M).

## Casos de uso

- Investigación académica sobre procesamiento del lenguaje natural en asamés: el modelo permite experimentar con generación de texto en esta lengua para tareas como transliteración, análisis morfológico o creación de corpus sintéticos.
- Prototipos de generación de contenido en asamés: puede usarse para generar borradores de artículos, noticias o textos educativos en asamés, aunque la calidad no está validada.
- Adaptación de modelos de lenguaje para lenguas de bajos recursos: sirve como ejemplo de cómo aplicar LoRA sobre un modelo pequeño para una lengua específica, útil para investigadores que replican el método en otros idiomas.
- Evaluación comparativa de técnicas de adaptación: permite comparar el rendimiento de un adaptador LoRA frente a un fine-tuning completo en una lengua minoritaria.
- Desarrollo de asistentes de escritura para asamés: aunque sin garantías de calidad, puede integrarse en herramientas de autocompletado o corrección para hablantes de asamés.
- Transferencia de aprendizaje en lenguas indoarias: el adaptador puede servir como punto de partida para fine-tuning en otras lenguas del grupo indoario (como bengalí o hindi) mediante transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni ninguna evaluación sobre el asamés. Tampoco se comparan con otros modelos de la misma lengua.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 270M, la inferencia puede ejecutarse con menos de 2 GB de VRAM en cuantización de 4 bits (p. ej., Q4_K_M). En fp16, el modelo base ocupa unos 540 MB, más el adaptador (tamaño desconocido, pero típicamente <100 MB).
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM (NVIDIA GTX 1050 Ti, RTX 3050, etc.) es suficiente. También puede ejecutarse en CPU con RAM suficiente (unos 2-3 GB).
- Se puede ejecutar en hardware de consumo, incluyendo portátiles.
- Opciones de despliegue: como es un adaptador PEFT, debe cargarse junto con el modelo base. Se puede usar con la librería `transformers` de Hugging Face, y también con `llama.cpp` si se convierte el modelo fusionado a GGUF. No hay soporte nativo para vLLM ni TGI sin conversión previa.
- Latencia y throughput: no disponibles. Para un modelo de 270M, se espera una velocidad de generación de 30-50 tokens/s en GPU moderna, pero no hay mediciones específicas.

## Comparativa con modelos similares

No hay información sobre modelos comparables en asamés. El modelo base Gemma 3 de 270M puede compararse con otros modelos de tamaño similar (como TinyLlama de 1.1B o Qwen2 de 0.5B), pero la comparación directa no es posible por falta de datos de evaluación. El propio autor tiene otros adaptadores similares (como `gemma3-270m-it-assamese-cpt-lora` y `gemma3-270m-it-assamese-sft`), pero no se han publicado resultados comparativos.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, riesgos o limitaciones específicas. El modelo base Gemma 3 tiene sesgos conocidos por sus datos de entrenamiento, que pueden amplificarse en el adaptador.
- Riesgo de alucinación: sin evaluación, el riesgo es alto, especialmente en un idioma de bajos recursos donde el modelo puede generar texto inventado o incoherente.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. El modelo base Gemma 3 tiene licencia de Google (Gemma Terms of Use), que permite uso comercial con ciertas restricciones, pero el adaptador no declara licencia propia.
- La ausencia de información sobre el dataset de entrenamiento impide evaluar la calidad y cobertura del asamés.
- El modelo no está optimizado para producción: no hay garantías de estabilidad, seguridad ni rendimiento.

## Enlaces

- [Hugging Face - phukanpragyan/gemma3-270m-base-assamese-cpt-lora-pass2](https://huggingface.co/phukanpragyan/gemma3-270m-base-assamese-cpt-lora-pass2)
- [Hugging Face - modelo base google/gemma-3-270m](https://huggingface.co/google/gemma-3-270m)
- [Modelos similares del mismo autor en Hugging Face](https://huggingface.co/phukanpragyan) (no se han verificado enlaces individuales)
- No se encontraron papers, blogs ni demos asociados al modelo.
