# bambocher/Qwen3.5-9B-oQ2-mtp

## Resumen

Qwen3.5-9B-oQ2-mtp es una cuantización mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales de Qwen (Alibaba) a un esquema de precisión mixta mediante la herramienta oQ de oMLX v0.7.3, orientada al ecosistema MLX de Apple Silicon. El checkpoint combina capas cuantizadas en 2, 3, 4 y 5 bits con un 5% de pesos conservados en BF16, dando una media efectiva de 3,817 bits por peso.

El modelo conserva la arquitectura multimodal del Qwen3.5-9B original: un transformer con torre de visión (0,456B parámetros) y una cabeza MTP (multi-token prediction, 0,243B) que permite decodificación especulativa. El grueso de los pesos (8,954B) corresponde al modelo de lenguaje. El repo ocupa 9,0 GB, aunque los pesos reales suman 4,29 GiB, lo que sugiere que el resto del espacio lo ocupan ficheros auxiliares, tokenizador y posibles copias.

Su relevancia actual radica en la posibilidad de ejecutar un modelo multimodal de ~9,6B parámetros en equipos con memoria unificada modesta (Mac con 16-24 GB de RAM), sacrificando precisión en favor de huella reducida. Es, por tanto, una ficha de interés para quienes experimentan con inferencia local en Apple Silicon y quieren evaluar cuantizaciones agresivas con decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con torre de visión y cabeza MTP (multi-token prediction) |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit grupo 64, 3-bit grupo 64/128, 4-bit grupo 64, 5-bit grupo 64, BF16; media efectiva 3,817 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del Qwen3.5-9B original, no un modelo reentrenado. La arquitectura subyacente es un transformer denso con componentes multimodales: un modelo de lenguaje de 8,954B parámetros, una torre de visión de 0,456B y una cabeza MTP de 0,243B. La cabeza MTP está asociada a decodificación multi-token, técnica de decodificación especulativa que predice varios tokens por paso para acelerar la generación.

La cuantización se realizó con oQ (oMLX v0.7.3), que asigna precisión por capa según sensibilidad: el 62% de los pesos lógicos quedan en 2 bits (grupo 64), mientras que el 14,7% se mantiene en 5 bits y un 5,1% en BF16, presumiblemente en capas críticas (embeddings, normalizaciones o proyecciones de salida). No se dispone de información sobre el dataset de entrenamiento original, número de tokens, composición ni fases de RLHF/DPO, ya que la model card solo documenta el proceso de cuantización.

## Capacidades

- Generación de texto y razonamiento: heredadas del Qwen3.5-9B original; no verificadas en esta cuantización concreta.
- Procesamiento de visión: incluye torre de visión de 0,456B parámetros, por lo que se espera soporte de entrada de imágenes.
- Decodificación especulativa: la cabeza MTP permite predicción multi-token, lo que puede aumentar el throughput en MLX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están documentados en la model card.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está pensado para MLX y ocupa 4,29 GiB de pesos, por lo que puede cargarse en Macs con 16 GB de memoria unificada, dejando margen para el contexto y el runtime.
- Prototipado multimodal en portátil: la torre de visión permite experimentar con tareas imagen-texto (descripción, VQA sencilla) sin GPU dedicada, aunque la precisión de 2 bits puede degradar resultados.
- Evaluación de cuantizaciones agresivas: útil como banco de pruebas para comparar la calidad de oQ con otras cuantizaciones (MLX 4-bit, GGUF Q4_K_M) sobre la misma base Qwen3.5-9B.
- Generación de texto asistida en entornos con memoria limitada: para borradores, resúmenes o reescritura en aplicaciones de escritorio Mac donde no cabe un modelo de 9B en BF16 (~18 GB).
- Aceleración mediante decodificación especulativa: integrable en pipelines MLX que aprovechen la cabeza MTP para reducir la latencia por token en generación larga.
- Experimentación académica con cuantización mixta: permite estudiar el impacto de asignar 2 bits al 62% de los pesos mientras se preservan capas sensibles en 5 bits y BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 4,29 GiB para los pesos; con overhead de runtime MLX y KV cache, se recomienda al menos 8-10 GB libres para contexto corto y 16 GB para contexto moderado.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4, especialmente variantes Pro/Max con 16 GB o más de memoria unificada). No es un checkpoint CUDA; no está pensado para A100, H100 ni RTX 4090.
- Cabe en consumer GPU: no en GPUs NVIDIA consumer, ya que el formato es MLX. En Mac con 16 GB de RAM unificada sí es viable.
- Opciones de despliegue: MLX (librería mlx), ecosistema oMLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; la presencia de MTP sugiere mejora de throughput, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ2-mtp (este) | 9,653B | no disponible | Mixta 2-5 bits + BF16 (3,817 bits/peso) | no disponible | Hugging Face, formato MLX |
| Qwen3.5-9B (original) | ~9,6B (estimado) | no disponible | BF16 | no disponible en esta ficha | Hugging Face |
| Cuantizaciones MLX 4-bit de Qwen3.5-9B | ~9,6B | no disponible | 4 bits uniforme | no disponible | Hugging Face |
| Cuantizaciones GGUF de Qwen3.5-9B | ~9,6B | no disponible | Q4_K_M, Q5_K_M, etc. | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a parámetros, formato y estrategia de cuantización.

## Limitaciones y advertencias

- Cuantización muy agresiva: el 62% de los pesos está en 2 bits, lo que previsiblemente degrada la calidad en razonamiento, matemáticas y código frente al modelo original en BF16. No hay evaluaciones publicadas que cuantifiquen esa pérdida.
- Sin datos de licencia: la model card no especifica licencia; antes de uso comercial debe verificarse la licencia del Qwen3.5-9B original y las condiciones de la cuantización derivada.
- Idiomas no documentados: no se indica qué lenguas soporta esta variante; el comportamiento multilingüe puede diferir del original.
- Contexto desconocido: no se especifica la longitud de contexto soportada, ni si la cuantización afecta al KV cache o a la ventana efectiva.
- Riesgo de alucinación: inherente a los modelos de lenguaje y probablemente amplificado por la cuantización a 2 bits en capas mayoritarias.
- Dependencia de MLX: no utilizable directamente en CUDA, ROCm ni CPU convencional; requiere hardware Apple y la librería mlx.
- Modelo derivado de terceros: la autoría real del entrenamiento corresponde a Qwen (Alibaba); bambocher solo publica la conversión. La fecha de creación (2026-10-20) y actualización (2026-11-12) indican una revisión reciente que obliga a redescargar copias anteriores.
- Uso en producción: sin benchmarks, sin licencia clara y con precisión mixta agresiva, no es recomendable como modelo principal en producción sin validación previa en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-oQ2-mtp
- Repositorio oMLX / oQ: https://github.com/jundot/omlx
- Modelo base Qwen3.5-9B: no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada
