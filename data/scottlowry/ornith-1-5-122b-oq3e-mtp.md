# scottlowry/Ornith-1.5-122B-oQ3e-mtp

## Resumen

Ornith-1.5-122B-oQ3e-mtp es una cuantización de precisión mixta del modelo Ornith-1.5-122B, desarrollado originalmente por ornith-ai. La versión publicada por scottlowry aplica la herramienta oQ (oMLX v0.7.4.dev1) para comprimir los pesos a una media efectiva de 3,817 bits por peso, reduciendo el checkpoint completo a 59,683 GB (55,584 GiB) desde el tamaño del modelo base en BF16. El resultado es un modelo de 125.086.497.008 parámetros totales que incluye componentes de lenguaje, visión y una cabeza MTP (multi-token prediction) destinada a decodificación especulativa.

El modelo emplea la arquitectura qwen3_5_moe, lo que indica una estructura de mezcla de expertos (MoE) heredada de la familia Qwen 3.5, aunque no se dispone de datos sobre el número de parámetros activos por token. La cuantización es selectiva: el 92,7 % de los pesos lógicos se almacenan en 3 bits afín con grupo 64, mientras que capas sensibles (5,7 % de los pesos) se retienen en 8 bits y un 0,4 % permanece en BF16, una estrategia habitual para preservar la calidad en capas de atención y normalización.

La relevancia de esta ficha radica en que permite ejecutar un modelo de más de 120.000 millones de parámetros en hardware Apple Silicon mediante MLX, con un peso en disco inferior a 60 GB. No obstante, la información pública disponible es muy limitada: no se han publicado resultados de benchmarks, licencia, idiomas soportados ni detalles del proceso de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (transformer MoE, segun tag del repositorio) |
| Parametros totales | 125.086.497.008 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 3-bit g64, affine 4-bit g64, affine 8-bit g128, affine 8-bit g64, BF16 (media efectiva 3,817 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX, libreria mlx) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-122B emplea la arquitectura identificada en los metadatos como qwen3_5_moe, es decir, un transformer con capas de mezcla de expertos. El checkpoint cuantizado incluye tres componentes diferenciados: el modelo de lenguaje (122,112 mil millones de pesos lógicos), un módulo de visión (0,451 mil millones) y una cabeza MTP (multi-token prediction) de 2,524 mil millones de pesos. Esta última está diseñada para decodificación especulativa, una técnica que predice varios tokens por paso y acelera la generación en inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. La cuantización aplicada por scottlowry distribuye los pesos en cuatro formatos de almacenamiento: el grueso (115,964 B de pesos lógicos, 92,7 %) en 3 bits afín con grupo 64; 2,416 B en 4 bits; 5,733 B en 8 bits con grupo 64; 0,462 B en 8 bits con grupo 128; y 0,511 B en BF16 sin cuantizar. El resultado ocupa 55,584 GiB en disco.

## Capacidades

- Generación de texto y razonamiento: el componente de lenguaje de 122,1 B de parámetros soporta tareas generativas generales, aunque no hay documentación específica sobre su rendimiento.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,451 B de parámetros, lo que indica capacidades multimodales de entrada de imagen.
- Decodificación especulativa: la cabeza MTP de 2,524 B de parámetros permite acelerar la generación mediante predicción multi-token.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 59,7 GB permiten ejecutar el modelo en equipos Mac con memoria unificada de 64 GB o superior, algo impensable con el checkpoint en BF16 (más de 250 GB). Es adecuado para desarrolladores que necesitan un modelo grande sin depender de la nube.
- Prototipado de aplicaciones multimodales: la inclusión del módulo de visión permite experimentar con tareas imagen-texto en local, útil para validar pipelines antes de escalar a infraestructura con GPU.
- Investigación en cuantización: el checkpoint documenta con precisión la distribución de bits por componente, lo que lo convierte en un caso de estudio para analizar el impacto de la cuantización mixta en modelos MoE de gran tamaño.
- Evaluación de decodificación especulativa: la cabeza MTP incorporada permite medir la ganancia de throughput de la predicción multi-token en MLX frente a decodificación autoregresiva estándar.
- Generación de texto asistida en estación de trabajo: con 122 B de parámetros, el modelo puede emplearse para redacción técnica, resumen de documentos largos y generación de código, siempre que el hardware local lo soporte.
- Desarrollo de agentes con contexto largo: si el modelo base conserva la ventana de contexto de la familia Qwen 3.5 (no confirmada en esta ficha), podría usarse para conversaciones multi-turno y análisis de repositorios, aunque requiere validación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint cuantizado ocupa 55,584 GiB en disco; en memoria unificada se necesita al menos esa cantidad más overhead de activaciones y caché KV. Se recomienda un mínimo de 64 GB de memoria unificada.
- GPU recomendadas: el formato MLX está optimizado para Apple Silicon (series M1/M2/M3/M4 Max y Ultra). No es directamente compatible con CUDA sin conversión previa.
- ¿Cabe en GPU consumer? En Apple Silicon, sí: un Mac Studio o MacBook Pro con 64 GB o 96 GB de memoria unificada puede cargarlo. En GPUs NVIDIA consumer (RTX 4090 con 24 GB) no cabe sin cuantizaciones adicionales o descarga parcial a CPU.
- Opciones de despliegue: MLX (librería nativa), oMLX para la cuantización. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B-oQ3e-mtp | 125,1 B | no disponible | oQ 3,817 bits/peso | no disponible | Hugging Face (MLX) |
| Ornith-1.5-122B (base) | 122 B (aprox.) | no disponible | BF16 | no disponible | Hugging Face |
| Qwen3.5 MoE (familia) | no disponible | no disponible | multiples | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3,817 bits/peso puede degradar la calidad en tareas sensibles a precisión (matemáticas, código, razonamiento complejo) en comparación con el modelo base en BF16; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- No se ha publicado la licencia del modelo base ni de esta cuantización, lo que impide determinar si el uso comercial está permitido.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas del modelo base.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin conversión.
- El repositorio no incluye pipeline declarado, idiomas ni resultados de evaluación, lo que dificulta su adopción en producción sin validación propia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ3e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
