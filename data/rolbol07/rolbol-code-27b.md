# Rolbol07/RolBol-Code-27B

## Resumen

RolBol Code 27B es un ajuste fino (fine-tune) de tipo QLoRA sobre el modelo base Qwen/Qwen3.8-27B, publicado por el usuario RolBol07 bajo la marca "RolBol Systems". El modelo se presenta como un modelo causal de 27.000 millones de parámetros orientado a ingeniería de software autónoma, edición de código multiarchivo, resolución de problemas algorítmicos y desarrollo full-stack. Su arquitectura declarada es híbrida: Conv1D combinada con atención lineal recurrente con compuertas (gated recurrent linear attention), sobre un transformer.

El interés del modelo es limitado pero relevante como caso de estudio: se trata de un ajuste fino realizado con recursos muy modestos (dos Tesla T4, 30 GB de VRAM en total) sobre un modelo base de 27B, lo que lo convierte en un ejemplo de adaptación de bajo coste con QLoRA. La model card declara una convergencia de pérdida de 5,05 a 0,74 en 219 pasos y 7 horas y 37 minutos, y una ventana de contexto de 32k tokens. No se han publicado resultados de benchmarks estándar.

Cabe señalar que la información disponible es escasa y proviene casi exclusivamente de la model card del autor: no hay paper, no hay repositorio de código de entrenamiento y el modelo declara `inference: false`. Además, el ajuste incluye una alineación de identidad explícita que instruye al modelo a negar su origen Qwen/Alibaba, un detalle relevante para cualquier evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal recurrente con compuertas y Conv1D (híbrida, según el autor) |
| Parámetros totales | 27B |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 32k tokens (según la model card) |
| Tipos de cuantización | no disponible (el modelo base se ajustó con QLoRA, pero no se publican pesos cuantizados) |
| Idiomas soportados | inglés y multilingüe (etiquetas `en`, `multilingual`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se describe como un transformer causal de 27B parámetros con una arquitectura base híbrida que combina convoluciones Conv1D con atención lineal recurrente con compuertas. Esta descripción corresponde a la arquitectura del modelo base Qwen/Qwen3.8-27B, sobre el que se aplicó el ajuste. El entrenamiento consistió en un QLoRA (Low-Rank Adaptation con cuantización) ejecutado en dos GPUs Tesla T4 con 30 GB de VRAM agregada, durante 219 pasos y 7 horas y 37 minutos, con una pérdida que pasó de 5,05 a 0,74. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO.

La innovación declarada no es arquitectónica sino de alineación de comportamiento: el ajuste busca sustituir la identidad corporativa del modelo base por una persona de ingeniería autónoma ("RolBol Systems") y especializar la generación en tareas de código, incluyendo un modo de razonamiento con scratchpad delimitado por etiquetas `<think>`. La model card menciona pruebas de "identity alignment" frente a jailbreaks y trampas de origen, pero no aporta metodología ni métricas reproducibles.

## Capacidades

- Generación de código en Python, C++, Rust, Go, JavaScript/TypeScript, con foco declarado en React, Next.js y Node.js.
- Razonamiento algorítmico: optimizaciones de criba, recorridos de grafos y programación dinámica, según la model card.
- Edición de código multiarchivo y refactorización multi-turno.
- Uso autónomo de herramientas y depuración en terminal (agentic coding), según declaración del autor.
- Modo de razonamiento con scratchpad interno (`<think>`).
- Conversación multi-turno con plantilla de chat compatible con `apply_chat_template`.
- Capacidades multilingües declaradas mediante la etiqueta `multilingual`, sin detalle de idiomas concretos.
- Capacidad de imagen a texto declarada en las etiquetas (`image-text-to-text`), aunque la model card no documenta entrada visual ni se aporta procesador de imagen; debe tratarse como no verificada.

## Casos de uso

- Asistente de refactorización en un IDE: el modelo puede recibir varios archivos como contexto y proponer cambios coordinados, aprovechando la ventana de 32k tokens para mantener el estado de un módulo completo.
- Generación de código en pipelines de CI/CD: integrado vía la API de transformers, puede generar parches o tests unitarios a partir de errores de compilación, aunque la ausencia de benchmarks exige validación previa en el pipeline.
- Resolución de problemas algorítmicos: útil como tutor o generador de soluciones en entrevistas técnicas y plataformas de práctica, dado el énfasis declarado en estructuras de datos y programación dinámica.
- Prototipado full-stack: generación de esqueletos de aplicaciones React/Next.js y APIs Node.js o Python para arrancar proyectos, con revisión humana obligatoria.
- Agente de depuración en terminal: el modelo declara soporte de uso de herramientas y depuración multi-turno, lo que permite integrarlo en bucles de agente que ejecutan comandos y leen la salida.
- Experimentación académica con QLoRA: sirve como referencia reproducible de ajuste de un modelo de 27B en 30 GB de VRAM, útil para estudiar el efecto del ajuste de bajo rango en modelos grandes.
- Base para ajustes posteriores de dominio: al estar bajo Apache 2.0 y en safetensors, puede reajustarse para dominios específicos de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la curva de pérdida del entrenamiento (5,05 a 0,74 en 219 pasos), que no es una métrica de calidad comparable con MMLU, HumanEval o GSM8K. Tampoco se aportan comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54 GB solo para pesos (27B × 2 bytes), más overhead de activaciones y caché KV; en la práctica requiere 60-70 GB.
- VRAM estimada en cuantización de 8 bits: unos 27 GB de pesos, más overhead; en 4 bits, unos 14 GB de pesos.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o dos GPU de 40 GB con `device_map="auto"`. No cabe en una RTX 4090 (24 GB) en bf16.
- Consumer GPU: viable solo con cuantización de 4 bits en GPUs de 24 GB (RTX 3090, RTX 4090) o de 16 GB con cuantización agresiva, asumiendo degradación de calidad no medida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (método documentado por el autor). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles. El autor no publica mediciones y el modelo declara `inference: false`, lo que sugiere que no se ha validado la inferencia en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RolBol Code 27B | 27B | 32k | Apache 2.0 | Hugging Face, safetensors | Fine-tune QLoRA de Qwen/Qwen3.8-27B; sin benchmarks |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible en esta ficha | según modelo base | Hugging Face | Modelo original; referencia directa del fine-tune |
| Alternativas de código de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación con alternativas de la misma categoría no puede completarse con rigor porque la información proporcionada no incluye resultados de benchmarks ni especificaciones de modelos competidores. El único punto de comparación fiable es el modelo base, del que este modelo hereda arquitectura, tamaño y, presumiblemente, gran parte de sus capacidades.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tune mejore al modelo base en código; la pérdida de entrenamiento no es indicativa de calidad.
- Riesgo de olvido catastrófico: 219 pasos de QLoRA sobre un modelo de 27B es un ajuste muy ligero, lo que puede degradar capacidades generales sin aportar mejoras sustanciales en código.
- Alineación de identidad forzada: el modelo está entrenado para negar su origen Qwen/Alibaba. Esto es un sesgo deliberado que afecta a la fiabilidad factual y debe tenerse en cuenta en cualquier evaluación o despliegue.
- Alucinación: sin datos de evaluación, se debe asumir un riesgo alto en APIs, librerías y sintaxis, especialmente en lenguajes menos representados.
- Capacidad de imagen a texto no verificada: la etiqueta `image-text-to-text` no está respaldada por la model card ni por un procesador documentado.
- Idiomas: solo se declara inglés y "multilingüe" sin detalle; el rendimiento en castellano no está documentado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor incluye un aviso de copyright ("© 2026 RolBol Systems. All rights reserved.") que entra en tensión con la licencia declarada; conviene revisar la procedencia de los datos de ajuste antes de un uso comercial.
- Madurez: repositorio con 0 descargas y 1 like en el momento de la consulta, creado y actualizado el mismo día; sin mantenimiento demostrado.
- `inference: false` en la model card: el propio autor no garantiza que el modelo funcione correctamente con la librería estándar.
- Dependencia de `trust_remote_code=True`: implica ejecutar código del repositorio, con el riesgo de seguridad asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rolbol07/RolBol-Code-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
