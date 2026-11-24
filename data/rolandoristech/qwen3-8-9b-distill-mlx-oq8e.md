# RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ8e

## Resumen

Qwen3.8-9B-Distill-MLX-oQ8e es una versión cuantizada a 8 bits del modelo empero-ai/Qwen3.8-9B-Distill, un destilado comunitario del modelo Qwen/Qwen3.8-2.4T-A95B reimplementado sobre la arquitectura Qwen3.5-9B. Lo publica el usuario RolanDorisTech, que aplica su propia metodología de cuantización dinámica (oMLX Universal Dynamic Quantization, oQe) y lo distribuye en formato MLX safetensors para ejecución nativa en Apple Silicon. No es un modelo oficial de Alibaba/Qwen, sino un derivado de terceros con licencia Apache-2.0.

El modelo resuelve el problema de desplegar un modelo de razonamiento de casi 9.000 millones de parámetros en hardware de consumo de Apple, manteniendo una ventana de contexto nativa de 262.144 tokens y un tamaño de pesos de 8,9 GB. La cuantización oQe combina asignación de bits por sensibilidad de capa con ponderación por importancia de activaciones (imatrix), en lugar de aplicar un presupuesto de bits uniforme.

Su relevancia actual radica en que permite ejecutar localmente un modelo con modo de razonamiento explícito (etiquetas `<think>`) y contexto largo en equipos con memoria unificada, sin depender de GPUs de centro de datos. El autor reporta 28,7 tok/s y 9,679 GB de pico de memoria en un M1 Max de 64 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen3.5-9B (según model card); tags qwen3_5, qwen3, qwen3.5, qwen3.8 |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ8e (8 bits mixto con ponderación por importancia de activaciones); familia con oQ4e, oQ5e, oQ6e, oQ8e |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (compatible con mlx-lm, oMLX, LM Studio, mlx-swift) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer denso de la familia Qwen3.5-9B, según indica la model card, aunque los tags incluyen también qwen3 y qwen3.8. El modelo es un destilado comunitario de Qwen/Qwen3.8-2.4T-A95B (un MoE de 2,4 billones de parámetros totales y 95.000 millones activos) hacia la arquitectura de 9B, generado por empero-ai a partir de aproximadamente 70.000 trazas de destilación. No se dispone de información sobre el volumen total de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica de esta publicación es la cuantización oQe: en lugar de un presupuesto de bits uniforme, se ejecuta un pase de calibración para medir la sensibilidad real de cada capa al error de cuantización y se asignan más bits a las capas críticas (`lm_head`, embeddings de tokens, primer y último bloque) y menos a las tolerantes. oQe añade además un segundo pase de calibración de importancia de activaciones con estadísticas por canal (imatrix), ponderando el error según la relevancia de cada canal. El autor cita SqueezeLLM (arXiv:2306.07629) y el observador `imatrix_mse` de LLM Compressor como base metodológica. Los pesos resultantes son safetensors MLX estándar, por lo que el runtime debe verificarse contra la versión concreta de cada aplicación.

## Capacidades

- Generación de texto con modo de razonamiento explícito: la plantilla de chat usa etiquetas `<think>` para separar el razonamiento de la respuesta final.
- Razonamiento multi-paso derivado del destilado del modelo Qwen3.8 de 2,4 T, orientado a tareas de lógica y problemas encadenados.
- Contexto largo de 262.144 tokens nativos, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (el campo de idiomas de Hugging Face está vacío).
- Capacidades de visión o audio: no disponibles; el pipeline declarado es exclusivamente text-generation.
- Inferencia nativa en Apple Silicon mediante MLX, con compatibilidad declarada con mlx-lm, oMLX, LM Studio y mlx-swift.

## Casos de uso

- Asistente de razonamiento local en portátiles Apple Silicon: con 8,9 GB de pesos y 9,679 GB de pico medidos en un M1 Max, el modelo se ejecuta íntegramente en memoria unificada sin GPU dedicada, lo que permite prototipar agentes de razonamiento en un equipo de desarrollo personal.
- Análisis de documentos largos: la ventana de 262.144 tokens permite cargar contratos, informes técnicos o transcripciones completas en una sola pasada y hacer preguntas sobre el conjunto sin troceado previo.
- Generación de explicaciones razonadas para revisión humana: el modo `<think>` expone la cadena de razonamiento, útil en entornos educativos o de auditoría donde se necesita inspeccionar cómo se llegó a una conclusión.
- Evaluación comparativa de técnicas de cuantización: al existir variantes oQ4e, oQ5e, oQ6e y oQ8e del mismo destilado de 9B, sirve para medir empíricamente la pérdida de calidad frente al ahorro de memoria en Apple Silicon.
- Desarrollo offline y entornos con requisitos de privacidad: al ejecutarse localmente vía mlx-lm o LM Studio, los datos no salen del equipo, lo que encaja en prototipos sobre datos sensibles.
- Integración en aplicaciones macOS/iOS mediante mlx-swift: el formato safetensors MLX permite incrustar el modelo en apps nativas del ecosistema Apple para tareas de resumen o asistencia textual sin backend remoto.
- Base para fine-tuning ligero en local: el tamaño de 9B y la licencia Apache-2.0 facilitan adaptaciones con LoRA sobre el destilado en hardware de consumo.

## Benchmarks y rendimiento

La model card indica explícitamente que los benchmarks de precisión (MMLU, GSM8K, HumanEval, etc.) se publicarán en una actualización futura y que aún no están disponibles para este modelo.

Los únicos datos medidos publicados son de rendimiento de inferencia, realizados por el autor en un M1 Max de 64 GB:

| Metrica | Valor |
|---|---|
| Throughput | 28,7 tok/s |
| Memoria pico | 9,679 GB |
| Tamano de pesos | 8,9 GB |
| Hardware | Apple M1 Max 64 GB |

El benchmark de calidad de la metodología oQ (MMLU, 300 muestras, sobre Qwen3.5-35B-A3B, no sobre este modelo) reporta: 2 bits uniforme 14,0 % frente a oQ 64,0 %; 3 bits uniforme 76,3 % frente a oQ 85,0 %; 4 bits uniforme 79,7 % frente a oQ 83,3 %. El propio autor advierte que estos datos documentan el método y no constituyen una evaluación de calidad de los modelos Qwen3.8 Distill oQe.

## Requisitos de hardware

- VRAM/memoria estimada: 8,9 GB de pesos; pico medido de 9,679 GB en M1 Max. En la práctica requiere al menos 16 GB de memoria unificada para dejar margen al contexto y al runtime.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El formato MLX no es compatible con CUDA ni ROCm.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada de 16 GB o superior; no está pensado para GPUs NVIDIA/AMD de consumo.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.generate`), oMLX, LM Studio (búsqueda por `RolanDorisTech/Qwen3.8-9B-Distill-MLX-8bit`) y mlx-swift para apps nativas.
- Latencia y throughput: 28,7 tok/s medidos en M1 Max 64 GB con la configuración indicada (temp 0.6, top-p 0.95, top-k 20). No hay datos para otros chips.
- Repo de 9,5 GB en total, incluyendo plantilla de chat y metadatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-9B-Distill-MLX-oQ8e (este) | 8,95 B | 262.144 | oQ8e (8 bits mixto) | MLX safetensors | Apache-2.0 | Solo Apple Silicon; 28,7 tok/s en M1 Max |
| empero-ai/Qwen3.8-9B-Distill | 9 B (aprox.) | no disponible | pesos completos | safetensors | no disponible | Modelo base sin cuantizar; requiere más memoria |
| RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ4e | 9 B (aprox.) | 262.144 (según familia) | oQ4e (4 bits mixto) | MLX safetensors | Apache-2.0 | 4,9 GB; menor huella, mayor pérdida potencial de calidad |
| RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ6e | 9 B (aprox.) | 262.144 (según familia) | oQ6e (6 bits mixto) | MLX safetensors | Apache-2.0 | 7,0 GB; punto intermedio de memoria y fidelidad |

No se dispone de comparativas con modelos de otros ecosistemas (GGUF/llama.cpp, GPTQ, AWQ) dentro de la información proporcionada.

## Limitaciones y advertencias

- No es un modelo oficial de Alibaba/Qwen: es un destilado comunitario de terceros, con posibles desviaciones de comportamiento respecto al modelo original.
- Ausencia total de benchmarks de calidad publicados: no hay datos de MMLU, GSM8G, HumanEval ni evaluaciones de alucinación, lo que impide validar su fiabilidad antes de usarlo en producción.
- Idiomas soportados no declarados: no se puede asumir un rendimiento multilingüe equivalente al del Qwen original.
- La cuantización a 8 bits mixto introduce error respecto a los pesos completos; el autor no publica la degradación concreta para este modelo.
- Dependencia exclusiva del ecosistema MLX: no ejecutable en CUDA, ROCm ni en la mayoría de servidores Linux con GPU, lo que limita su uso en producción backend.
- Compatibilidad de runtime a verificar: la model card advierte que debe comprobarse contra la versión concreta de mlx-lm, oMLX, LM Studio o mlx-swift.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos destilados de razonamiento pueden generar cadenas `<think>` plausibles pero incorrectas.
- Sesgos: no documentados por el autor.
- Licencia Apache-2.0 permite uso comercial, pero al ser un derivado conviene verificar las condiciones del modelo base empero-ai y del Qwen3.8 original.
- Solo 377 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ8e
- Modelo base del destilado: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Documentación de la metodología oQ: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Paper SqueezeLLM: https://arxiv.org/abs/2306.07629
- Documentación de imatrix en LLM Compressor: https://docs.vllm.ai/projects/llm-compressor/en/latest/examples/imatrix/
- Canal del autor (YouTube): https://www.youtube.com/@RolanDorisTech
