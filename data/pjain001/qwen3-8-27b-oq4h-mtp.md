# pjain001/Qwen3.8-27B-oQ4h-mtp

## Resumen

Qwen3.8-27B-oQ4h-mtp es una cuantización mixta del modelo Qwen3.8-27B, publicada por el usuario pjain001 en Hugging Face. El checkpoint está pensado para su uso con MLX, el framework de Apple para ejecutar modelos en silicio unificado (chips M-series), y ha sido generado con la herramienta oQ (oMLX v0.8.0), que aplica cuantización de precisión mixta por capas y tensores en lugar de un único esquema uniforme.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (6.327B parámetros lógicos), un codificador de visión (0.461B) y una cabeza MTP (Multi-Token Prediction, 0.425B) que permite decodificación especulativa y generación de varios tokens por paso. El total declarado en safetensors es de 7.212.759.280 parámetros, aunque el nombre del repositorio hace referencia a "27B", lo que sugiere que el modelo base original era de mayor tamaño y este checkpoint es una versión reducida o parcial.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantización para inferencia local en Mac, no de un modelo nuevo. Resulta útil para desarrolladores que quieran ejecutar un modelo multimodal con capacidades de razonamiento y predicción multi-token en hardware Apple sin depender de GPUs dedicadas, siempre que acepten las limitaciones de una publicación sin model card detallada, sin benchmarks y sin licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`) con cabeza MTP y torre de visión |
| Parametros totales | 7.212.759.280 (7.213B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit, 5-bit, 6-bit y 8-bit (group 64), BF16 y U32; media efectiva 19.429 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `mlx`) |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base. Lo que sí se detalla es la composición del checkpoint cuantizado. El desglose por precisión muestra una distribución heterogénea: un 47.111% de los pesos lógicos (3.398B) se almacenan en U32 con 32 bits/peso, un 12.474% (0.900B) en BF16, y el resto se reparte entre affine 4-bit (0.330B), 5-bit (1.303B), 6-bit (1.271B) y 8-bit (0.010B), todos con grupo de 64. Esta mezcla explica la media efectiva de 19.429 bits/peso, muy por encima de una cuantización 4-bit uniforme, y sugiere que oQ preserva en alta precisión ciertos tensores sensibles (probablemente embeddings, capas de normalización o proyecciones críticas) mientras comprime el resto.

Por componentes, el modelo de lenguaje ocupa 16.272 GB (15.155 GiB) para 6.327B parámetros lógicos, la torre de visión 0.921 GB (0.858 GiB) para 0.461B y la cabeza MTP 0.323 GB (0.301 GiB) para 0.425B. La presencia de una cabeza MTP es la innovación técnica más destacable: permite predecir varios tokens futuros en paralelo, lo que habilita decodificación especulativa y puede mejorar el throughput en inferencia autoregresiva. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el componente de lenguaje de 6.327B parámetros soporta tareas generativas y de razonamiento multi-paso, aunque no se detallan qué benchmarks o modos (thinking, chain-of-thought) están disponibles.
- Procesamiento de visión: incluye una torre de visión de 0.461B parámetros, lo que indica capacidad multimodal de entrada de imágenes, si bien no se especifican tareas concretas (VQA, OCR, captioning).
- Predicción multi-token (MTP): la cabeza dedicada de 0.425B permite decodificación especulativa, útil para acelerar la generación en MLX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con MLX: el checkpoint está empaquetado para la librería `mlx`, por lo que se puede cargar directamente en un Mac con chip M-series para prototipado y experimentación sin GPU dedicada. Es adecuado por su formato nativo y su tamaño de 17.5 GB, manejable en equipos con 32 GB o más de memoria unificada.
- Aceleración de generación con MTP: la cabeza de predicción multi-token permite implementar decodificación especulativa en pipelines de MLX, reduciendo la latencia por token en tareas de generación larga como resúmenes o redacción asistida.
- Experimentación multimodal en local: la torre de visión permite probar tareas de descripción de imágenes o respuesta a preguntas visuales en un entorno de escritorio Apple, útil para investigadores que quieran validar prototipos sin infraestructura cloud.
- Evaluación de cuantización mixta: el checkpoint sirve como caso de estudio para comparar la calidad de oQ frente a cuantizaciones uniformes (4-bit, 8-bit) en el mismo modelo base, midiendo perplejidad o calidad de generación.
- Base para fine-tuning con LoRA en MLX: al estar en safetensors y con pesos en precisiones mixtas, puede servir como punto de partida para adaptaciones ligeras en tareas específicas, aunque la mezcla de bits complica el entrenamiento directo.
- Despliegue en estaciones de trabajo Apple para demos internas: equipos con M2 Ultra o M3 Max pueden servir el modelo para demostraciones de asistentes multimodales sin conexión a internet, siempre que se acepte la ausencia de garantías de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 17.5 GB en disco (16.314 GiB de pesos). Para inferencia en MLX se recomienda al menos 24 GB de memoria unificada, y 32 GB o más para trabajar con contexto amplio y la torre de visión activa.
- GPU recomendadas: chips Apple M-series con memoria unificada grande (M2 Max, M2 Ultra, M3 Max, M3 Ultra, M4 Max). No está pensado para GPUs NVIDIA ni ROCm, ya que la librería declarada es `mlx`.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con 32 GB o más de memoria unificada; en Macs de 16 GB es probable que no quepa con comodidad.
- Opciones de despliegue: MLX y `mlx-lm` son las vías naturales. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado el formato y la librería.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ4h-mtp (este) | 7.213B | no disponible | Mixta 4/5/6/8-bit + BF16 + U32 | no disponible | safetensors (MLX) |
| Qwen3.8-27B (base, si existe) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Cuantizaciones GGUF 4-bit de la familia Qwen | variable | variable | 4-bit uniforme (Q4_K_M, etc.) | según modelo base | GGUF |
| Cuantizaciones MLX 4-bit estándar de Qwen | variable | variable | 4-bit uniforme | según modelo base | safetensors (MLX) |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas concretas. La comparativa se limita a formato y esquema de cuantización.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Es un riesgo legal relevante para producción.
- Idiomas no declarados: no se indica qué lenguas soporta el modelo, por lo que no se puede garantizar calidad en castellano ni en otros idiomas.
- Sin benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni de calidad multimodal, lo que impide evaluar su rendimiento frente a alternativas.
- Discrepancia de nomenclatura: el nombre indica "27B" pero el checkpoint declara 7.213B parámetros; conviene verificar qué modelo base se cuantizó realmente antes de confiar en el artefacto.
- Cuantización mixta con alta proporción en U32 (47%): el ahorro de memoria frente a BF16 es menor de lo que sugiere el nombre "4-bit"; la media efectiva es de 19.429 bits/peso, por lo que el checkpoint es más pesado que una cuantización 4-bit convencional.
- Riesgo de alucinación: inherente a los modelos generativos; no se documenta ningún mecanismo de mitigación.
- Dependencia de MLX: no es portable a ecosistemas CUDA/ROCm sin reconversión, lo que limita su uso fuera de Apple.
- Publicación de un solo autor con 0 descargas y 0 likes: no hay validación comunitaria ni garantías de mantenimiento.
- Fecha de creación futura (2026-11-20): conviene verificar la integridad y procedencia del repositorio antes de usarlo en entornos reales.

## Enlaces

- Hugging Face: https://huggingface.co/pjain001/Qwen3.8-27B-oQ4h-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
