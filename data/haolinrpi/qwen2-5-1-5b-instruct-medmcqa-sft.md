# HaolinRPI/Qwen2.5-1.5B-Instruct-MedMCQA-SFT

## Resumen

Qwen2.5-1.5B-Instruct-MedMCQA-SFT es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario HaolinRPI. El objetivo del ajuste es especializar el modelo en la resolución de preguntas de opción múltiple del dominio médico, concretamente sobre el conjunto de datos MedMCQA, generando una traza de razonamiento seguida de una respuesta final con el formato `<answer>X</answer>`.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5 con 1.777.088.000 parámetros y una ventana de contexto nativa de 32.768 tokens en el modelo base, aunque el entrenamiento se realizó con un corte de 16.384 tokens. Se trata de un modelo pequeño, pensado para experimentación y despliegue en hardware modesto, no para producción clínica.

Su relevancia es limitada y muy específica: sirve como ejemplo de especialización mediante SFT con LlamaFactory sobre un modelo compacto, y como punto de partida para experimentos de razonamiento médico en opción múltiple. No hay información publicada sobre benchmarks, idiomas soportados ni pipeline de inferencia, y el repositorio tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; entrenado con cutoff 16.384 |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (full-parameter SFT) del Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar. El entrenamiento se realizó con LlamaFactory sobre 20.000 ejemplos de trazas de MedMCQA y una partición de evaluación de 200 ejemplos. La configuración empleó 4 GPUs con ZeRO-1, precisión bf16, cutoff de 16.384 tokens, batch por dispositivo de 1, acumulación de gradientes de 64, learning rate de 1e-5, warmup ratio 0 y scheduler coseno, durante 3 épocas y 237 pasos de optimización.

La revisión principal (`main`) corresponde a la época 3, checkpoint-237. Se guardaron también las épocas 1 (checkpoint-79) y 2 (checkpoint-158). La pérdida de evaluación en este checkpoint es de 0,9498. El formato de salida objetivo es una traza de razonamiento seguida de la etiqueta `<answer>X</answer>`, lo que induce un modo de respuesta con razonamiento explícito antes de la opción elegida. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento de opción múltiple en el dominio médico, con traza de razonamiento previa a la respuesta.
- Salida estructurada con la etiqueta `<answer>X</answer>` para extracción programática de la opción elegida.
- Herencia de las capacidades generales del Qwen2.5-1.5B-Instruct subyacente (generación, código, matemáticas básicas), aunque el ajuste puede haber degradado parcialmente el comportamiento general.
- Soporte de tool calling: no disponible de forma explícita en esta ficha; depende del modelo base y no se ha verificado tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- Capacidades especiales (vision, audio, thinking mode nativo): no disponibles.

## Casos de uso

- Evaluación de razonamiento médico en opción múltiple: el modelo genera una traza de razonamiento y una respuesta etiquetada, lo que permite medir precisión y calidad de la justificación sobre preguntas tipo MedMCQA en pipelines de investigación.
- Experimentación con SFT sobre modelos compactos: sirve como referencia reproducible de un ajuste con LlamaFactory, ZeRO-1 y bf16 para estudiar el efecto del número de épocas y checkpoints en un dominio acotado.
- Generación de datos sintéticos de razonamiento médico: las trazas generadas pueden usarse como material de destilación o aumento de datos para modelos mayores, con revisión humana posterior.
- Prototipado de asistentes de estudio para estudiantes de medicina: con 1,5B parámetros cabe en GPU de consumo y permite iterar rápidamente en entornos de desarrollo sin infraestructura dedicada.
- Benchmarking de robustez ante preguntas médicas: útil para comparar el comportamiento de un modelo pequeño especializado frente a modelos generales en tareas de opción múltiple.
- Filtrado y clasificación de preguntas de examen médico: la salida estructurada facilita el parseo automático de la opción seleccionada en pipelines de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación proporcionado es la pérdida de evaluación en el checkpoint-237, que es de 0,9498.

| Métrica | Valor |
|---|---|
| eval_loss (checkpoint-237, época 3) | 0,9498 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 2 GB para pesos; en 4 bits, en torno a 1 GB, más overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto moderado; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 y H100 son válidas.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16, y en 4-6 GB con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, siempre que se generen o dispongan de los pesos en el formato adecuado; el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-MedMCQA-SFT | 1,78B | 32.768 (base); entrenado a 16.384 | apache-2.0 | SFT médico MedMCQA | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B (aprox.) | 32.768 | apache-2.0 | Generalista | Hugging Face, ampliamente usado |
| Qwen2.5-7B-Instruct | 7,6B (aprox.) | 32.768 | apache-2.0 | Generalista | Hugging Face |
| Meditron-7B | 7B | 4.096 (aprox.) | llama2 | Médico | Hugging Face |

Los datos de parámetros y contexto del modelo base y de las alternativas se ofrecen como referencia orientativa; no se dispone de benchmarks comparativos publicados para este ajuste concreto.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks; el único indicador es una pérdida de evaluación de 0,9498, insuficiente para valorar la precisión real en MedMCQA.
- El ajuste se realizó sobre 20.000 ejemplos de un único conjunto de datos, lo que puede provocar sobreajuste al formato y estilo de MedMCQA y escasa generalización a otras preguntas médicas.
- Riesgo de alucinación en contenido médico: el modelo puede generar justificaciones plausibles pero incorrectas; no debe usarse como fuente de verdad clínica.
- No se especifican idiomas soportados; el entrenamiento con MedMCQA, predominantemente en inglés, sugiere un rendimiento limitado en castellano.
- El ajuste puede haber degradado capacidades generales del modelo base (código, matemáticas, conversación general) al especializarlo en un formato concreto.
- La licencia apache-2.0 permite uso comercial, pero la ausencia de evaluación clínica desaconseja cualquier aplicación en entornos sanitarios reales sin validación externa.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación independiente.
- No se publican cuantizaciones GGUF ni AWQ, lo que limita el despliegue directo en llama.cpp u Ollama sin conversión previa.

## Enlaces

- Hugging Face: https://huggingface.co/HaolinRPI/Qwen2.5-1.5B-Instruct-MedMCQA-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MedMCQA: no disponible en la información proporcionada
- LlamaFactory: no disponible en la información proporcionada
- Paper de Qwen2.5: no disponible en la información proporcionada
