# scottlowry/Qwen3.8-27B-oQ5e-mtp

## Resumen

Qwen3.8-27B-oQ5e-mtp es una cuantización mixta del modelo Qwen/Qwen3.8-27B, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales de Qwen a un formato optimizado para MLX (el framework de Apple para ejecutar modelos en silicio de la serie M), empleando la herramienta oQ de oMLX en su versión v0.7.4.dev1. El checkpoint combina precisiones de 5, 6 y 8 bits con grupos de 64 pesos, más una pequeña fracción en BF16, lo que da una media efectiva de 5,889 bits por peso.

El modelo base, Qwen3.8-27B, pertenece a la familia Qwen3.5 según los tags del repositorio y cuenta con 27.781 millones de parámetros lógicos, de los cuales 26.896 corresponden al modelo de lenguaje, 0.461 a un codificador visual y 0.425 a una cabeza MTP (multi-token prediction). La presencia de visión y de MTP indica que el modelo original es multimodal y que incorpora decodificación especulativa nativa mediante predicción de múltiples tokens.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 28.000 millones de parámetros en hardware Apple con un peso en disco de aproximadamente 19 GiB, algo inasumible con los pesos en BF16 (que rondarían los 55 GB). Es, por tanto, una opción práctica para desarrolladores que trabajan en Mac con memoria unificada de 32 GB o más y quieren un modelo multimodal con contexto amplio sin depender de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual + cabeza MTP); familia qwen3_5 |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64 (24,440B), affine 6-bit grupo 64 (1,544B), affine 8-bit grupo 64 (1,282B) y BF16 (0,516B); media efectiva 5,889 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX, librería mlx) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento. La arquitectura subyacente es la del Qwen3.8-27B original: un transformer de 27.781B parámetros lógicos desglosados en 26.896B para el modelo de lenguaje, 0.461B para el módulo de visión y 0.425B para la cabeza de multi-token prediction (MTP). Esta última es una innovación relevante: permite predecir varios tokens por paso de decodificación, lo que acelera la generación en inferencia sin cambiar la arquitectura base. El tag `qwen3_5` sugiere que el modelo pertenece a la generación Qwen3.5.

La cuantización se realizó con oQ (oMLX v0.7.4.dev1) en precisión mixta, asignando 5 bits a la gran mayoría de los pesos (87,971%), 6 bits a un 5,558%, 8 bits a un 4,614% y dejando un 1,857% en BF16. Esta distribución selectiva preserva en mayor precisión las capas más sensibles (probablemente embeddings, normas y algunas proyecciones de atención) mientras comprime agresivamente el resto. No se dispone de información sobre los datos de entrenamiento originales, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo de lenguaje de 26,896B parámetros soporta conversación multi-turno y tareas de razonamiento general.
- Procesamiento de imágenes: incorpora un codificador visual de 0,461B parámetros, por lo que admite entradas multimodales (visión-lenguaje).
- Decodificación especulativa nativa: la cabeza MTP de 0,425B permite predecir múltiples tokens por paso, acelerando la inferencia.
- Ejecución en Apple Silicon: al estar en formato MLX, se ejecuta de forma nativa en chips de la serie M mediante la librería mlx.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente local en Mac: ejecutar el modelo con MLX en un MacBook Pro o Mac Studio con memoria unificada de 32 GB o más, aprovechando que el checkpoint ocupa unos 19 GiB y cabe holgadamente en esos equipos.
- Análisis de documentos con imágenes: usar el codificador visual para extraer información de capturas, diagramas o páginas escaneadas y generar resúmenes o respuestas sobre ellas.
- Prototipado de aplicaciones multimodales sin GPU: desarrollar y probar pipelines de visión-lenguaje en un entorno Apple, sin necesidad de alquilar GPUs en la nube.
- Generación de texto asistida con baja latencia: aprovechar la cabeza MTP para reducir el tiempo por token en tareas de escritura, resumen o chat en local.
- Investigación sobre cuantización: estudiar el impacto de la precisión mixta (5/6/8 bits) en la calidad de un modelo de 27B, comparando contra los pesos originales en BF16.
- Despliegue de un asistente privado: al ejecutarse en local, los datos no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.
- Evaluación comparativa de frameworks: usar el checkpoint como banco de pruebas para medir throughput y calidad de MLX frente a otras rutas de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint pesa 19,046 GiB en disco (20,450 GB); en ejecución se necesita memoria adicional para el contexto y los estados intermedios, por lo que se recomienda un mínimo de 24 GB y, de forma realista, 32 GB de memoria unificada.
- GPU compatibles: exclusivamente Apple Silicon (serie M1, M2, M3, M4 y sus variantes Pro, Max y Ultra), ya que el formato es MLX. No es ejecutable directamente en GPUs NVIDIA o AMD sin reconvertir los pesos.
- ¿Cabe en consumer GPU? No en el sentido habitual (NVIDIA/AMD); sí en Mac con memoria unificada de 32 GB o superior.
- Opciones de despliegue: librería mlx y herramientas basadas en MLX (por ejemplo, mlx-lm para el modelo de lenguaje); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP está diseñada para mejorar la velocidad de decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ5e-mtp (este) | 27,781B | no disponible | MLX safetensors, 5,889 bits/peso | no disponible | Cuantización mixta para Apple Silicon |
| Qwen/Qwen3.8-27B (base) | 27,781B | no disponible | safetensors BF16 | no disponible | Pesos originales; ~55 GB, requiere GPU o Mac de gama alta |
| Otras cuantizaciones GGUF del mismo base | 27,781B | no disponible | GGUF (Q4, Q5, Q8) | no disponible | Ejecutables en llama.cpp/Ollama; no aprovechan MLX |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización, no un modelo original: la precisión mixta de 5,889 bits/peso puede degradar ligeramente la calidad frente a los pesos BF16, especialmente en tareas sensibles a la precisión numérica.
- Licencia no especificada: no se indica la licencia del checkpoint ni la del modelo base en la información disponible, por lo que el uso comercial queda sin garantías hasta consultar el repositorio original de Qwen.
- Idiomas no documentados: no se detalla qué lenguas soporta, lo que dificulta planificar despliegues multilingües.
- Contexto desconocido: no se indica la longitud máxima de contexto, un dato crítico para aplicaciones de documentos largos.
- Dependencia de Apple Silicon: al estar en formato MLX, no se puede ejecutar en GPUs NVIDIA/AMD ni en servidores x86 convencionales sin reconversión.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay datos específicos de evaluación en la información disponible.
- Sesgos: no se documentan sesgos conocidos en la model card.
- Repositorio de baja tracción: 319 descargas y 2 likes, con una única revisión de cuantización (2026-11-11); conviene verificar la integridad de los pesos antes de usarlo en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
