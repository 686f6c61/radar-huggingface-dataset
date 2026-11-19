# HaolinRPI/Qwen2.5-7B-Instruct-MedMCQA-SFT-No-Trace

## Resumen

Qwen2.5-7B-Instruct-MedMCQA-SFT-No-Trace es un ajuste fino supervisado (SFT) de parámetros completos del modelo Qwen/Qwen2.5-7B-Instruct, desarrollado por el usuario HaolinRPI. El modelo está especializado en responder preguntas de opción múltiple del dominio médico, concretamente sobre el conjunto de datos MedMCQA, y su particularidad es que ha sido entrenado en modo "no-trace": la salida objetivo es únicamente la etiqueta de respuesta dentro de las etiquetas `<answer>X</answer>`, sin traza de razonamiento intermedia.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales según los pesos en safetensors, y se distribuye bajo licencia Apache 2.0. El ajuste se realizó con LlamaFactory sobre 20.000 ejemplos de entrenamiento de MedMCQA y una partición de evaluación de 200 ejemplos, durante 3 épocas (237 pasos de optimizador), con precisión bf16, ZeRO-1 y una longitud de corte de 16.384 tokens.

Su relevancia es acotada pero concreta: sirve como referencia para evaluar hasta qué punto un ajuste fino breve y directo sobre un modelo generalista de 7B mejora la precisión en QA médico de opción múltiple, y como contraste frente a variantes entrenadas con traza de razonamiento. No es un modelo clínico de propósito general ni un asistente médico conversacional; es un artefacto de investigación con un formato de salida muy restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen/Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (longitud de corte usada en el entrenamiento); el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, aunque el valor nativo no se especifica en la informacion disponible para este ajuste |
| Tipos de cuantizacion | No disponible en la model card; al ser pesos safetensors en bf16, son aplicables cuantizaciones estándar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | No disponible de forma explícita; hereda los del modelo base Qwen2.5-7B-Instruct (multilingüe, con especial énfasis en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7.615.616.512 parámetros. Sobre esa base se aplicó un ajuste fino supervisado de parámetros completos con LlamaFactory, sin indicios de RLHF, DPO ni etapas de alineación adicionales posteriores al SFT. El entrenamiento usó 20.000 ejemplos de MedMCQA en formato "no-trace" y una partición de evaluación de 200 ejemplos; la salida objetivo es exclusivamente la etiqueta `<answer>X</answer>`, sin cadena de razonamiento.

La configuración técnica reportada es: 4 GPUs, ZeRO-1, precisión bf16, longitud de corte de 16.384 tokens, batch por dispositivo de 1, acumulación de gradiente de 64, learning rate de 1e-5, warmup ratio 0 y scheduler coseno. Se completaron 3 épocas, equivalentes a 237 pasos de optimizador, con checkpoints guardados en los pasos 79 (época 1), 158 (época 2) y 237 (época 3, rama `main`). La pérdida de evaluación en el checkpoint final es de 0,1441. No se documentan innovaciones arquitectónicas propias; el interés técnico reside en el formato de objetivo sin traza y en las épocas múltiples con un dataset pequeño.

## Capacidades

- Generación de texto y respuesta a preguntas de opción múltiple en el dominio médico, con salida restringida al formato `<answer>X</answer>`.
- Razonamiento médico básico derivado del modelo base, aunque el ajuste "no-trace" no entrena explícitamente cadenas de razonamiento.
- Herencia de las capacidades generales de Qwen2.5-7B-Instruct: generación de texto, código, matemáticas y comprensión lectora, si bien el ajuste puede degradar parcialmente el comportamiento fuera de distribución.
- Soporte de tool calling y function calling heredado del modelo base (no validado específicamente tras el ajuste).
- Capacidades multilingües heredadas del modelo base (no verificadas en la model card).
- No se documentan capacidades de visión, audio, thinking mode ni agentes multi-paso específicas de este ajuste.

## Casos de uso

- Evaluación de precisión en QA médico de opción múltiple: el modelo está entrenado para emitir una única etiqueta de respuesta, lo que permite medir accuracy directamente sobre MedMCQA y comparar con variantes con traza de razonamiento.
- Baseline de investigación en ajuste fino médico: sirve como referencia controlada (mismo dataset, mismo presupuesto de cómputo) frente a modelos con SFT más largo o con RLHF.
- Clasificación de preguntas clínicas en pipelines de datos: dado un enunciado con opciones, el modelo puede generar la etiqueta seleccionada para etiquetado automático de conjuntos de evaluación.
- Estudio de formatos de salida restringidos: útil para analizar cómo el formato "no-trace" afecta a la calibración y a la tasa de acierto frente a formatos con razonamiento explícito.
- Prototipado de sistemas de triaje de preguntas médicas: con validación humana obligatoria, para enrutar consultas a recursos especializados según la opción seleccionada.
- Comparación de checkpoints intermedios: los tres checkpoints publicados (pasos 79, 158 y 237) permiten estudiar la evolución de la pérdida de evaluación y el sobreajuste en un dataset pequeño.
- Docencia y experimentación con LlamaFactory: ejemplo reproducible de SFT de parámetros completos con ZeRO-1 en 4 GPUs sobre un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de evaluación del checkpoint final:

| Metrica | Valor |
|---|---|
| eval_loss (checkpoint-237, época 3) | 0,1441 |
| Ejemplos de evaluación | 200 |
| Pasos de optimizador | 237 |

No se proporcionan cifras de MMLU, MedMCQA accuracy, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 15-16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más para contextos largos.
- Cuantización a 8 bits: alrededor de 8 GB de pesos; a 4 bits: alrededor de 4-5 GB, lo que permite ejecución en GPUs de consumo con suficiente margen.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para bf16 con contexto completo; RTX 3090/4080 y superiores para cuantización 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, 4080, 4090 y equivalentes con cuantización; en bf16 completo requiere al menos 24 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF), Transformers con Accelerate.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del backend, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-MedMCQA-SFT-No-Trace | 7,6 B | 16.384 (corte de entrenamiento) | QA médico MedMCQA, salida sin traza | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 (nativo) | Propósito general, alineado con instrucciones | Apache 2.0 | Hugging Face |
| Variantes MedMCQA con traza de razonamiento del mismo autor | No disponible | No disponible | QA médico con cadena de razonamiento | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparado (accuracy en MedMCQA) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El ajuste se realizó sobre un dataset pequeño (20.000 ejemplos) y solo 3 épocas; el riesgo de sobreajuste al formato de MedMCQA es alto, como sugiere una eval_loss de 0,1441 en una partición de solo 200 ejemplos.
- El formato de salida está fuertemente restringido a `<answer>X</answer>`; fuera de ese esquema el modelo puede degradarse o ignorar instrucciones generales.
- No es un dispositivo médico ni debe usarse para diagnóstico, tratamiento o decisiones clínicas sin supervisión de profesionales sanitarios.
- Riesgo de alucinación y de selección de opciones incorrectas con alta confianza; no se reportan métricas de calibración.
- Idiomas soportados no documentados explícitamente; el comportamiento multilingüe no está validado tras el ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset MedMCQA pueden tener sus propias condiciones que conviene revisar.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta); no hay evidencia de uso en producción.
- No se documentan sesgos específicos; al derivar de un modelo generalista, puede heredar sesgos del corpus de Qwen2.5 y del dataset MedMCQA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HaolinRPI/Qwen2.5-7B-Instruct-MedMCQA-SFT-No-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- LlamaFactory (herramienta de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset MedMCQA: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
