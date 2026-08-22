# caiotheodoro/plumb-handseeded

## Resumen

`caiotheodoro/plumb-handseeded` es un adaptador LoRA para el modelo base `mlx-community/Qwen3-1.7B-4bit`, entrenado con la librería MLX de Apple. El adaptador se enfoca en tareas específicas de construcción, aplicaciones de pago y curriculum, dentro de un proyecto de simulación social llamado "plumb". El modelo base es un Qwen3 de 1.700 millones de parámetros cuantizado a 4 bits, y el adaptador añade una capa de ajuste fino con LoRA. La relevancia radica en su enfoque de entrenamiento con un curriculum "hand-seeded" (semillas seleccionadas manualmente) de 223 tareas, buscando mejorar la precisión en tareas de razonamiento y extracción de información en dominios técnicos. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

El modelo se publica como un adaptador MLX, por lo que requiere el modelo base para su uso. La arquitectura es un transformer estándar con atención, pero el adaptador LoRA añade matrices de baja dimensión para adaptarse a la tarea específica. El entrenamiento se realizó con 190 pasos, 8 épocas, con una pérdida de validación de 0.486 y un tamaño de ~3.3GB en un M5 (posiblemente un Apple M5). Los resultados de evaluación muestran una mejora notable en recall y precisión frente a otros adaptadores del mismo proyecto, aunque con solapamiento en algunas métricas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (Transformer decoder) con adaptador LoRA |
| Parametros totales | 1.7B (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-1.7B soporta 32K tokens, pero el adaptador no especifica) |
| Tipos de cuantizacion | Base en 4 bits (mlx-community/Qwen3-1.7B-4bit); adaptador en pesos completos |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero el adaptador no especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors), adaptador LoRA en formato MLX |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo Qwen3-1.7B cuantizado a 4 bits, un transformer de solo decodificador con atención causal y mecanismos de atención de ventana deslizante (aunque los detalles específicos de la arquitectura de Qwen3 no se detallan aquí). El entrenamiento se realizó con MLX, utilizando LoRA para ajustar solo una pequeña fracción de los pesos. El dataset de entrenamiento es `caiotheodoro/plumb` en su partición `train_handseeded`, compuesto por 223 tareas con una distribución específica (distribution-matched). El proceso usó 190 pasos de entrenamiento, 8 épocas, y una pérdida de validación de 0.486. No se menciona el uso de RLHF o DPO; el entrenamiento parece ser de supervisión directa (fine-tuning) sobre el dataset curado.

La innovación técnica principal es el diseño del curriculum "hand-seeded" que selecciona manualmente tareas de construcción, aplicaciones de pago y curriculum, con el objetivo de mejorar la precisión en dominios específicos. El modelo no es multimodal; la evaluación se realizó con un "oracle" y una semilla fija (seed-777) para reproducibilidad.

## Capacidades

- Generación de texto en contextos técnicos: el adaptador se enfoca en tareas de construcción, aplicaciones de pago y curriculum, mostrando capacidad para extraer y razonar sobre información estructurada en esos dominios.
- Razonamiento multi-paso: las métricas de recall y precisión sugieren que el modelo puede seguir pasos lógicos en tareas de construcción y pago.
- Soporte de tool calling: no se especifica explícitamente, pero la arquitectura Qwen3 es compatible con function calling; el adaptador no añade restricciones.
- Capacidades multilingües: el modelo base es multilingüe, pero el adaptador se entrena con datos en inglés (según la descripción del dataset, aunque no se confirma). No hay información sobre idiomas específicos.
- No se menciona soporte de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- **Atención al cliente en el sector de la construcción**: el adaptador puede gestionar consultas sobre solicitudes de pago, estado de proyectos y cumplimiento de plazos, gracias a su entrenamiento en tareas de aplicación de pagos y curriculum.
- **Extracción de datos de documentos técnicos**: dado su entrenamiento en tareas de construcción, puede extraer entidades (fechas, cantidades, contratos) de facturas o informes, con una precisión del 30.8% según el benchmark (precisión), lo que lo hace útil para preprocesamiento automático.
- **Generación de respuestas en sistemas de preguntas y respuestas**: para bases de conocimiento sobre procedimientos de construcción o pagos, el modelo puede responder con formato de salida válido (parse 1.000).
- **Automatización de flujos de trabajo**: integrado en pipelines de gestión de proyectos, puede clasificar y categorizar mensajes o correos sobre aplicaciones de pago.
- **Entrenamiento de agentes de simulación social**: el modelo es parte de un experimento de simulación de personas, por lo que puede usarse para generar comportamientos realistas en entornos de simulación.
- **Asistente de redacción de informes**: puede ayudar a redactar resúmenes de estado de proyectos de construcción a partir de datos estructurados.

## Benchmarks y rendimiento

Según la model card, se evaluó con un conjunto de 1000 muestras (n=1000) con semilla 777. Los resultados son los siguientes:

| Modelo | sw-recall | precision | exact | parse |
|---|---|---|---|---|
| **plumb-handseeded** | 0.318 [0.290, 0.347] | 0.308 [0.279, 0.337] | 0.178 | 1.000 |
| Ornith-only | 0.241 [0.214, 0.268] | 0.111 [0.098, 0.124] | 0.084 | 0.997 |
| blend | 0.334 [0.306, 0.363] | 0.374 [0.342, 0.406] | 0.228 | 1.000 |

Los intervalos de confianza al 95% se muestran entre corchetes. El adaptador "blend" supera en recall y precisión, pero el "this adapter" tiene un recall mayor que Ornith-only y una precisión intermedia. El "parse" indica la capacidad de generar salidas con formato válido, siendo 1.000 (perfecto) para este adaptador y para blend.

No se dispone de resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: el modelo base de 1.7B en 4 bits ocupa aproximadamente 1.5-2 GB de VRAM. El adaptador LoRA añade unos pocos MB, por lo que el total puede caber en una GPU de 4 GB.
- **GPU recomendadas**: tarjetas con al menos 4 GB de VRAM, como GTX 1060, RTX 2060, o superiores. En Apple Silicon (M1/M2/M3/M4/M5) funciona con MLX de forma eficiente, ya que la librería está optimizada para esa arquitectura.
- **¿Cabe en consumer GPU?**: Sí, en GPUs de gama media con 4 GB o más.
- **Opciones de despliegue**: se puede cargar con `mlx_lm` (librería MLX) en Mac, o convertir a GGUF para usar con llama.cpp u Ollama. También se puede servir con vLLM si se convierte a formato estándar, aunque no es la vía principal.
- **Latencia y throughput**: no se han publicado datos específicos. En una M5 se reporta un entrenamiento de ~3.3GB, lo que sugiere que la inferencia será rápida en ese hardware.

## Comparativa con modelos similares

No hay disponibles modelos comparables con el mismo enfoque de adaptador LoRA para construcción y pagos. El propio modelo se compara con otros adaptadores del mismo proyecto (Ornith-only y blend) que se entrenaron con diferentes curriculums. En la tabla de benchmarks ya se comparan esos tres. Respecto a modelos generales de 1.7B, como Qwen2.5-1.5B o Gemma-2-2B, no hay datos de comparación directa porque el adaptador está especializado en un dominio estrecho.

## Limitaciones y advertencias

- **Dominio restringido**: el adaptador está entrenado para tareas específicas de construcción y pagos; su rendimiento en otros dominios será degradado.
- **Sesgos del dataset**: al ser un dataset de entrenamiento "hand-seeded", puede contener sesgos de selección manual, lo que podría reflejarse en la salida.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en datos no vistos.
- **Contexto limitado**: no se especifica la longitud de contexto del adaptador; aunque el modelo base soporta 32K, el adaptador podría no aprovecharlo al completo.
- **Idioma**: no se especifica el idioma de entrenamiento, pero probablemente es español (dado el nombre del autor y el proyecto). No se garantiza multilingüismo.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero se debe incluir el aviso de licencia y los derechos de autor.
- **Compatibilidad**: el adaptador es específico de MLX; para usar en otros frameworks (PyTorch, etc.) requiere conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caiotheodoro/plumb-handseeded
- Dataset de entrenamiento: https://huggingface.co/datasets/caiotheodoro/plumb
- Código del proyecto: https://github.com/caiotheodoro/plumb
- Perfil del autor: https://huggingface.co/caiotheodoro
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
