# HaolinRPI/Qwen2.5-3B-Instruct-MedMCQA-SFT-No-Trace

## Resumen

Qwen2.5-3B-Instruct-MedMCQA-SFT-No-Trace es un ajuste fino supervisado (SFT) de parámetros completos del modelo Qwen/Qwen2.5-3B-Instruct, desarrollado por el usuario HaolinRPI. El objetivo del entrenamiento es especializar el modelo base en la resolución de preguntas médicas de opción múltiple del conjunto de datos MedMCQA, generando únicamente la respuesta final en el formato `<answer>X</answer>` sin traza de razonamiento intermedia. Esta variante "no-trace" se distingue de otras ejecuciones del mismo autor que sí incluyen cadenas de razonamiento antes de la respuesta.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5 con 3.085.938.688 parámetros totales, y se distribuye en formato safetensors con licencia Apache 2.0. El ajuste se realizó con LlamaFactory sobre 20.000 ejemplos de entrenamiento y 200 de evaluación, durante 3 épocas y 237 pasos de optimizador, con una pérdida de evaluación de 0,1711 en el checkpoint final (epoch 3, checkpoint-237).

Su relevancia es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, orientado a experimentos de ajuste fino médico y a la comparación entre estrategias con y sin traza de razonamiento. No es un modelo de propósito general ni un modelo médico validado clínicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó cutoff 16384) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5, no documentados en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only de 3.085.938.688 parámetros. Sobre esa base se aplicó un ajuste fino supervisado de parámetros completos mediante LlamaFactory, sin indicios de RLHF ni DPO en la información disponible. El entrenamiento se ejecutó con 4 GPUs, ZeRO-1, precisión bf16 y una longitud de corte de 16.384 tokens, con batch por dispositivo de 1 y acumulación de gradiente de 64. Se usó una tasa de aprendizaje de 1e-5, warmup ratio de 0 y planificador coseno, durante 3 épocas y 237 pasos de optimizador.

El conjunto de datos empleado son 20.000 ejemplos de MedMCQA en formato no-trace, con una partición de evaluación de 200 ejemplos. La innovación técnica del modelo es precisamente la ausencia de traza: el objetivo de entrenamiento es solo `<answer>X</answer>`, lo que fuerza al modelo a emitir la respuesta directamente sin razonamiento intermedio. Se publican tres checkpoints correspondientes a las épocas 1, 2 y 3 (checkpoint-79, checkpoint-158 y checkpoint-237), siendo `main` la época 3. La pérdida de evaluación reportada en ese checkpoint es 0,1711.

## Capacidades

- Respuesta a preguntas médicas de opción múltiple en formato MedMCQA, emitiendo la respuesta como `<answer>X</answer>`.
- Generación de texto y razonamiento heredados del modelo base Qwen2.5-3B-Instruct, aunque el ajuste fino está orientado a la tarea médica de opción múltiple.
- Capacidad multilingüe: no documentada en esta ficha; depende de lo heredado del modelo base.
- Soporte de tool calling / function calling: no documentado para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo no-trace elimina explícitamente el razonamiento intermedio en la tarea de entrenamiento.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Evaluación de estrategias de ajuste fino médico: el modelo sirve como referencia para comparar el enfoque no-trace frente a variantes con traza de razonamiento sobre el mismo dataset y base, midiendo el efecto en la pérdida de evaluación y en la precisión de respuesta.
- Clasificación de preguntas de opción múltiple en investigación clínica: dado un enunciado con opciones A-E, el modelo devuelve la letra seleccionada en el formato entrenado, lo que facilita el parseo automático en pipelines de evaluación.
- Generación de respuestas cortas en entornos con restricciones de longitud: al no emitir razonamiento, reduce tokens de salida y latencia frente a variantes con traza.
- Prototipado de asistentes de estudio médico: puede integrarse en herramientas de auto-evaluación donde el usuario plantea preguntas tipo examen y recibe la respuesta seleccionada.
- Benchmarking de modelos pequeños en dominio médico: con 3.085.938.688 parámetros, permite medir el rendimiento de un modelo de 3B ajustado frente a modelos mayores en tareas MedMCQA.
- Experimentación reproducible de SFT: la configuración documentada (4 GPUs, ZeRO-1, bf16, lr 1e-5, 3 épocas) y los checkpoints intermedios permiten reproducir y extender el experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida de evaluación en el checkpoint final:

| Métrica | Valor |
|---|---|
| eval_loss (epoch 3, checkpoint-237) | 0,1711 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K, MedMCQA accuracy ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,2 GB solo para pesos (3.085.938.688 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, en torno a 8-10 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,1 GB para pesos; en 4 bits, alrededor de 1,6 GB para pesos, más overhead.
- GPU recomendadas: A100, H100 o L40S para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 con margen.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 8 bits, y en tarjetas con 6 GB o más en 4 bits, siempre con overhead adicional.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y Transformers, siempre que se disponga de los pesos convertidos al formato correspondiente; la información disponible solo documenta safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-MedMCQA-SFT-No-Trace | 3.085.938.688 | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste fino médico no-trace sobre MedMCQA |
| Qwen/Qwen2.5-3B-Instruct | 3.085.938.688 | no disponible en esta ficha | Apache 2.0 | Hugging Face (modelo base ampliamente usado) | Modelo base de propósito general sin ajuste médico |
| Variantes con traza del mismo autor | 3.085.938.688 | no disponible | Apache 2.0 | Hugging Face (según información del autor) | Mismo dataset y configuración, con razonamiento intermedio |

No se dispone de datos de rendimiento comparativo (accuracy en MedMCQA u otros benchmarks) para establecer diferencias cuantitativas entre estas alternativas.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- Especializado en una única tarea (MedMCQA no-trace): su comportamiento fuera de ese formato de pregunta-respuesta no está documentado y puede degradarse respecto al modelo base.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas médicas incorrectas con formato convincente; no debe usarse para decisiones clínicas.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset MedMCQA.
- Limitaciones de contexto e idioma: no documentadas en esta ficha; el entrenamiento usó un cutoff de 16.384 tokens, pero la longitud de contexto efectiva del modelo no se especifica.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de validación clínica y de documentación de sesgos desaconseja su uso en entornos sanitarios reales sin evaluación adicional.
- El modo no-trace elimina el razonamiento intermedio, lo que puede reducir la precisión en preguntas que requieren deducción multi-paso frente a variantes con traza.
- Solo se documenta el formato safetensors; no hay conversiones oficiales a GGUF ni a otros formatos.

## Enlaces

- Hugging Face: https://huggingface.co/HaolinRPI/Qwen2.5-3B-Instruct-MedMCQA-SFT-No-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset MedMCQA: no disponible en la información proporcionada
- LlamaFactory: no disponible enlace en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
