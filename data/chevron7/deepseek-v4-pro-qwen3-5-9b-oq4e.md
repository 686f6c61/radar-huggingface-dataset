# chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-oQ4e

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-oQ4e es una cuantización mixta del checkpoint Qwen3.5-9B, publicada por el usuario chevron7 en Hugging Face. El nombre del repositorio mezcla referencias a DeepSeek-V4-Pro y Qwen3.5-9B, pero los datos reales de safetensors confirman un total de 9.409.813.744 parámetros, coherente con un modelo denso de aproximadamente 9B. El autor no documenta la procedencia exacta del checkpoint base ni aclara la relación con DeepSeek, por lo que esa parte debe tratarse con cautela.

El modelo se ha cuantizado con oQ (oMLX v0.7.4.dev1), una técnica de cuantización de precisión mixta orientada al ecosistema MLX de Apple. El resultado es un checkpoint de 5,900 GiB con un promedio efectivo de 5,386 bits por peso, distribuido en capas de 4, 5 y 6 bits más una fracción en BF16. Esto lo hace interesante para inferencia en hardware Apple Silicon, donde el formato MLX y la cuantización mixta permiten reducir huella de memoria manteniendo capas sensibles en mayor precisión.

La relevancia actual es limitada pero específica: es un artefacto de cuantización para usuarios de MLX que quieran ejecutar un modelo de ~9B con visión en Macs con memoria unificada. No hay pipeline declarado, ni licencia, ni idiomas, ni benchmarks publicados, y el repositorio no tiene descargas ni likes, lo que indica que es una publicación reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según checkpoint base Qwen3.5; no confirmado en la model card) |
| Parametros totales | 9.409.813.744 (9,410B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 4-bit group 64, affine 5-bit group 64, affine 6-bit group 64 y BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), cuantización mixta |
| Bits efectivos por peso | 5,386 de promedio |
| Tamano del repo | 6,4 GB (5,900 GiB de pesos) |
| Componentes | Language model 8,954B (5,423 GB); Vision 0,456B (0,912 GB) |
| Libreria | mlx |
| Fecha de creacion | 2026-11-11 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del checkpoint base. Los datos de safetensors y los tags (`qwen3_5`) apuntan a un transformer denso de la familia Qwen3.5, con un componente de visión de 0,456B parámetros y un language model de 8,954B. No se especifica si emplea atención lineal, decodificación especulativa ni otras innovaciones. Tampoco se documentan tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica documentada es exclusivamente la cuantización. oQ distribuye los pesos en cuatro formatos: 6,941B parámetros en affine 4-bit group 64 (73,758% del total, 4,50 bits efectivos), 0,945B en affine 5-bit group 64 (10,040%, 5,50 bits), 1,067B en affine 6-bit group 64 (11,344%, 6,50 bits) y 0,457B en BF16 (4,857%, 16,00 bits). El componente de visión se mantiene íntegramente en BF16 (0,912 GB), lo que sugiere que el autor preservó las capas visuales en precisión completa. El language model ocupa 5,423 GB con cuantización mixta.

## Capacidades

- Generación de texto y razonamiento: presumiblemente heredadas del checkpoint base Qwen3.5-9B, aunque no se documentan en la model card.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,456B parámetros en BF16, por lo que se espera soporte de entrada de imágenes.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.
- Inferencia en Apple Silicon: capacidad operativa principal, gracias al formato MLX y la cuantización mixta.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 5,900 GiB cabe en equipos con 16 GB o más de memoria unificada, permitiendo ejecutar un modelo de ~9B con visión sin GPU dedicada. Adecuado para desarrolladores que trabajan en macOS y quieren prototipar sin infraestructura cloud.
- Prototipado de asistentes multimodales: el módulo de visión en BF16 permite experimentar con tareas imagen-texto en local, útil para validar pipelines antes de escalar a producción.
- Evaluación de cuantización mixta: investigadores interesados en comparar oQ frente a otras técnicas (GPTQ, AWQ, GGUF K-quants) pueden usar este checkpoint como referencia de 5,386 bits efectivos por peso.
- Generación de texto offline: para aplicaciones de escritorio o notebooks sin conexión, el modelo puede generar texto y resumir documentos localmente, siempre que el contexto del checkpoint base lo permita.
- Análisis de documentos con imágenes: combinando el language model y el módulo de visión, se pueden procesar capturas, diagramas o páginas escaneadas en un flujo local.
- Desarrollo de plugins MLX: sirve como artefacto de prueba para integraciones con mlx-lm y oMLX, validando carga, tokenización y rendimiento en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 5,900 GiB solo para pesos; con overhead de inferencia (KV cache, activaciones) se recomienda un mínimo de 8-10 GB libres. En la práctica, un Mac con 16 GB de memoria unificada es el umbral razonable; 24 GB o más ofrece margen para contextos largos.
- GPU recomendadas: hardware Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el formato MLX. No se documenta compatibilidad con CUDA.
- GPU consumer: no aplica en el sentido tradicional; el equivalente es memoria unificada en Mac. En GPUs NVIDIA no se puede ejecutar directamente sin conversión a otro formato.
- Opciones de despliegue: mlx-lm y oMLX (oQ). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-oQ4e | 9,41B | No disponible | MLX safetensors mixto | No disponible | Hugging Face, 0 descargas |
| Checkpoint base Qwen3.5-9B | ~9B (presunto) | No disponible | Safetensors BF16 | No disponible | No confirmado en esta ficha |
| Cuantizaciones GGUF 4-bit de modelos ~9B | ~9B | Depende del base | GGUF | Depende del base | Amplia en Hugging Face |
| Cuantizaciones MLX 4-bit estándar | ~9B | Depende del base | MLX safetensors | Depende del base | Moderada en Hugging Face |

La comparativa es limitada porque no se dispone de datos del checkpoint base ni de alternativas concretas verificadas. La ventaja diferencial de este artefacto es la cuantización mixta con capas selectivas en 5 y 6 bits y visión en BF16, frente a cuantizaciones uniformes de 4 bits.

## Limitaciones y advertencias

- Procedencia ambigua: el nombre del repositorio menciona DeepSeek-V4-Pro y Qwen3.5-9B, pero la model card no aclara qué checkpoint base se cuantizó ni si hubo fine-tuning. Verificar antes de usar en producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Al derivar de un checkpoint base, la licencia de este último probablemente aplique, pero no está documentada aquí.
- Sin benchmarks: no hay evidencia publicada de calidad, razonamiento ni rendimiento tras la cuantización.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; el artefacto no ha sido probado por terceros.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación específica para este checkpoint.
- Sesgos: no documentados; dependen del dataset de entrenamiento del modelo base.
- Contexto e idiomas: no disponibles, lo que impide planificar aplicaciones con requisitos de ventana larga o multilingüismo.
- Compatibilidad restringida: formato MLX, por lo que no se ejecuta directamente en CUDA, ROCm ni CPU con llama.cpp sin conversión.
- Cuantización mixta no auditada: la distribución de bits por capa no viene acompañada de una evaluación de degradación por capa.

## Enlaces

- Hugging Face: https://huggingface.co/chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-oQ4e
- oQ / oMLX (herramienta de cuantización): https://github.com/jundot/omlx
