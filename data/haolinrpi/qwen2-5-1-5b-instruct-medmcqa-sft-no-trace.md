# HaolinRPI/Qwen2.5-1.5B-Instruct-MedMCQA-SFT-No-Trace

## Resumen

Qwen2.5-1.5B-Instruct-MedMCQA-SFT-No-Trace es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario HaolinRPI. El objetivo del entrenamiento es especializar un modelo pequeño de la familia Qwen2.5 en la tarea de respuesta a preguntas médicas de opción múltiple (MedMCQA), en su variante "no-trace": la salida objetivo se limita a la etiqueta `<answer>X</answer>`, sin traza de razonamiento intermedia.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5, con 1.777.088.000 parámetros totales según los pesos en safetensors, y se distribuye bajo licencia Apache 2.0. El ajuste se realizó con LlamaFactory sobre 20.000 ejemplos de MedMCQA, con un split de evaluación de 200 ejemplos, durante 3 épocas y 237 pasos de optimizador, alcanzando una pérdida de evaluación de 0,1977 en el checkpoint final (epoch 3, checkpoint-237).

Su relevancia radica en ser un artefacto de investigación reproducible para evaluar hasta qué punto un modelo de 1.5B puede especializarse en conocimiento médico factual mediante SFT directo, sin cadena de razonamiento, y en servir como referencia para estudios sobre formato de salida ("trace" frente a "no-trace") en dominios de alto riesgo como el médico. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un modelo de nicho, no validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino SFT de parámetros completos |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el corte de entrenamiento fue de 16.384 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con 1.777.088.000 parámetros. Sobre esa base se aplicó un ajuste fino supervisado de parámetros completos mediante LlamaFactory, sin indicios de RLHF, DPO ni otra fase de alineamiento adicional en la información disponible. El entrenamiento se ejecutó en 4 GPUs con ZeRO-1, precisión bf16, batch por dispositivo de 1, acumulación de gradiente de 64 (batch efectivo de 256), learning rate de 1e-5, warmup ratio 0 y scheduler coseno, durante 3 épocas y 237 pasos de optimizador.

El conjunto de datos son 20.000 ejemplos de MedMCQA en formato "no-trace", con un split de evaluación de 200 ejemplos. La particularidad técnica central es el formato de objetivo: la salida se restringe a `<answer>X</answer>`, eliminando cualquier traza de razonamiento. Esto fuerza al modelo a mapear directamente pregunta y opciones a la etiqueta correcta, lo que reduce la longitud de salida y simplifica la evaluación automática, pero también elimina la posibilidad de auditar el razonamiento interno. Se publican tres checkpoints de época: epoch-1 (checkpoint-79), epoch-2 (checkpoint-158) y epoch-3 (checkpoint-237), siendo `main` el de la tercera época. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto y respuesta a preguntas de opción múltiple en el dominio médico, con salida restringida al formato `<answer>X</answer>`.
- Razonamiento factual médico de un solo paso: el modelo no emite cadena de razonamiento, solo la etiqueta final.
- Herencia de las capacidades generales de Qwen2.5-1.5B-Instruct (generación de texto, código y matemáticas básicas), aunque el SFT puede haber desplazado la distribución hacia el dominio médico.
- Soporte de tool calling / function calling: no confirmado para este ajuste concreto; el modelo base Qwen2.5 lo soporta, pero la model card no lo valida tras el SFT.
- Soporte de agentes y razonamiento multi-paso: no disponible; el formato "no-trace" es incompatible por diseño con razonamiento multi-paso explícito.
- Capacidades multilingües: no disponibles en la model card; no se documenta qué idiomas conserva tras el ajuste.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no se documentan.

## Casos de uso

- Evaluación de formato de salida en dominios médicos: usar este modelo como brazo "no-trace" en un estudio comparativo frente a un ajuste equivalente con traza de razonamiento, midiendo precisión y calibración en MedMCQA.
- Clasificación automática de preguntas de examen médico: dado un enunciado con opciones A-D, el modelo devuelve la etiqueta en un formato parseable, adecuado para pipelines de evaluación de bancos de preguntas.
- Generación de datasets sintéticos etiquetados: emplear las predicciones del modelo para pre-etiquetar grandes volúmenes de preguntas médicas y priorizar la revisión humana en los casos de baja confianza.
- Baseline de referencia para investigación en modelos pequeños: servir como punto de comparación para estudiar cuánto conocimiento médico se puede inyectar en 1.5B parámetros con 20.000 ejemplos y 3 épocas.
- Prototipado de asistentes de repaso médico en entornos con recursos limitados: al ser un modelo de 1.5B, puede desplegarse en una única GPU consumer para demos internas de respuesta a preguntas de opción múltiple.
- Análisis de sesgos y errores en QA médico automatizado: el formato de salida corto y determinista facilita el análisis de errores sistemáticos por especialidad o tipo de pregunta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta `eval_loss: 0.1977` en el checkpoint epoch 3 (checkpoint-237) sobre el split de evaluación de 200 ejemplos. No se proporcionan métricas de precisión (accuracy), MMLU, MedQA, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,6 GB solo para pesos (1.777.088.000 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,8 GB para pesos; en 4 bits, alrededor de 0,9 GB para pesos. Las cuantizaciones no están publicadas por el autor, pero pueden generarse a partir de los safetensors.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto moderado (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); para contexto largo cercano a 16.384 tokens, se recomienda 16 GB o más (RTX 4080, RTX 4090, A100).
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en bf16, y en tarjetas de 4-6 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con safetensors; para cuantización, requiere convertir los pesos a GGUF o AWQ/GPTQ previamente.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-MedMCQA-SFT-No-Trace | 1.777.088.000 | no disponible (corte de entrenamiento 16.384) | Apache 2.0 | safetensors | SFT médico no-trace, 20.000 ejemplos MedMCQA, eval_loss 0,1977 |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1.777.088.000 | 32.768 tokens (según model card del base) | Apache 2.0 | safetensors | Modelo generalista; no especializado en QA médico |
| Qwen2.5-1.5B (variantes médicas de la comunidad) | ~1.777.088.000 | variable | variable | safetensors/GGUF | No disponible comparación directa con benchmarks |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con alternativas de la misma categoría. La comparación con el modelo base es estructural (mismos parámetros y licencia), pero no se han publicado métricas que cuantifiquen la mejora en MedMCQA frente al base.

## Limitaciones y advertencias

- El formato "no-trace" elimina la traza de razonamiento: no es posible auditar cómo llega el modelo a la respuesta, lo que es problemático en un dominio de alto riesgo como el médico.
- Riesgo de alucinación: un SFT sobre 20.000 ejemplos de opción múltiple no garantiza corrección factual fuera de la distribución de MedMCQA; el modelo puede producir etiquetas plausibles pero incorrectas.
- Sesgos conocidos: no documentados en la model card; el conjunto MedMCQA puede introducir sesgos de cobertura por especialidad, región y tipo de examen.
- Limitaciones de idioma: no se especifican los idiomas soportados tras el ajuste; el entrenamiento se realizó sobre MedMCQA, predominantemente en inglés, por lo que el rendimiento en castellano no está validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está validado clínicamente y no debe usarse como herramienta de diagnóstico ni de decisión médica.
- Caveat para producción: 0 descargas y 0 likes, sin validación externa; el checkpoint final tiene una eval_loss de 0,1977 sobre solo 200 ejemplos, una muestra pequeña que no permite estimar con precisión la precisión real.
- El repositorio ocupa 10,7 GB, lo que sugiere la inclusión de múltiples checkpoints (epoch-1, epoch-2, epoch-3); conviene verificar qué pesos se cargan en cada revisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HaolinRPI/Qwen2.5-1.5B-Instruct-MedMCQA-SFT-No-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MedMCQA: no disponible en la información proporcionada
- LlamaFactory: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
