# prism-ml/Bonsai-27B-mlx-1bit

## Resumen

Bonsai 27B es una familia de modelos desarrollada por PrismML que comprime un modelo de 27.000 millones de parámetros a pesos binarios de 1 bit, basándose en el backbone híbrido Qwen3.6-27B. La variante `Bonsai-27B-mlx-1bit` reduce el peso desplegado a aproximadamente 3,9 GB (14,2 veces menos que FP16), lo que permite ejecutar un modelo de clase 27B en un teléfono móvil de gama alta, con un rendimiento de unos 11 tokens por segundo en un iPhone 17 Pro Max y unos 44 tokens por segundo en un Apple M5 Pro. Es relevante porque demuestra que el razonamiento, la generación de código y el comportamiento agéntico pueden sobrevivir a una cuantización extrema, algo que los enfoques de baja precisión convencionales suelen perder por debajo de 4 bits.

El modelo mantiene una ventana de contexto de 262.000 tokens gracias a la arquitectura híbrida de atención (75 % lineal, 25 % completa) del modelo base y a una cuantización de la caché KV a 4 bits. Incluye además una torre de visión en 4 bits HQQ para entrada de imágenes, y un drafter de decodificación especulativa DSpark que acelera la decodificación en servidores CUDA un 1,37x sin pérdida de calidad. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 75 % atención lineal / 25 % atención completa, SwiGLU MLP, RoPE, RMSNorm (basada en Qwen3.6-27B) |
| Parametros totales | 1.724.001.520 (pesos almacenados en safetensors); el autor declara 27.300 millones de pesos binarios (24.800 millones backbone + 2.500 millones embedding/LM head) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | 1 bit binario g128 (1,125 bits/peso reales); existe variante ternary 2 bits (Ternary Bonsai 27B) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con kernels empaquetados para MLX y CUDA; también disponible para llama.cpp (fork) |

## Arquitectura y entrenamiento

El modelo se deriva de Qwen3.6-27B, un modelo de lenguaje causal de atención híbrida con 64 bloques. La arquitectura combina un 75 % de atención lineal (eficiente en contexto largo) con un 25 % de atención completa, junto con MLP SwiGLU, RoPE y RMSNorm. Todos los pesos del lenguaje (embeddings, proyecciones de atención, proyecciones MLP y cabeza de LM) se cuantizan a binario g128: cada peso es un único bit de signo (0 → −escala, 1 → +escala) y cada grupo de 128 pesos comparte un factor de escala FP16, lo que resulta en 1,125 bits por peso reales.

La torre de visión, opcional, se cuantiza por separado a 4 bits HQQ y solo se carga cuando hay entrada de imagen. El modelo incluye un drafter de decodificación especulativa DSpark entrenado contra el propio Bonsai 27B, que acelera la decodificación en CUDA un 1,37x sin pérdida de calidad. No se han publicado detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible.

## Capacidades

- Razonamiento y pensamiento: mantiene una puntuación media de 76,11 en 15 benchmarks de modo thinking, un 89,5 % del rendimiento FP16, incluyendo matemáticas (91,66) y código (81,88).
- Generación de texto y conversación multirronda: diseñado para uso conversacional, con contexto largo de 262.000 tokens.
- Comportamiento agéntico: el autor indica que conserva capacidades de razonamiento multi-paso y comportamiento agéntico en el régimen sub-4-bit.
- Entrada multimodal de visión: acepta imágenes mediante una torre de visión opcional de 0,63 GB en 4 bits HQQ.
- Decodificación especulativa: soporta el drafter DSpark para acelerar la inferencia en CUDA.
- Ejecución en dispositivo: optimizado para Apple MLX (Python y Swift) y CUDA, con kernels de 1 bit que consumen los pesos empaquetados directamente sin expandirlos a FP16.
- Multilingüismo: no documentado explícitamente; al derivarse de Qwen3.6, es probable que herede capacidades multilingües, pero no se confirma en la documentación.

## Casos de uso

- Asistente conversacional en el móvil: con 3,9 GB de huella y ~11 tok/s en un iPhone 17 Pro Max, permite ejecutar un asistente local de 27B sin conexión, con contexto de 262K tokens para mantener conversaciones largas.
- Razonamiento matemático y científico en el edge: la puntuación de 91,66 en matemáticas (modo thinking) lo hace adecuado para aplicaciones educativas o de cálculo simbólico en dispositivos sin GPU dedicada.
- Generación de código en entornos sin conexión: con 81,88 en coding, puede asistir a desarrolladores en portátiles Apple Silicon (44 tok/s en M5 Pro) o en estaciones CUDA, sin depender de la nube.
- Agentes autónomos en servidores de bajo coste: el drafter DSpark y el soporte CUDA permiten desplegar agentes multi-paso con decodificación acelerada en GPUs de gama media, reduciendo el coste de inferencia frente a FP16.
- Análisis de documentos con imágenes: la torre de visión opcional permite procesar capturas de pantalla, diagramas o fotografías junto con texto, útil en aplicaciones de soporte técnico o documentación.
- Prototipado y experimentación en investigación: al ser Apache 2.0 y caber en 3,9 GB, facilita la experimentación local con modelos de 27B en equipos sin GPUs de gran VRAM, por ejemplo en tareas de evaluación de cuantización extrema.
- Inferencia en servidores con múltiples usuarios: la aceleración especulativa (1,37x) y el menor tráfico de pesos por token permiten servir más peticiones concurrentes en una misma GPU CUDA.

## Benchmarks y rendimiento

Los datos publicados corresponden a la media de 15 benchmarks de modo thinking y a categorías específicas, comparados con el modelo base FP16. No se han publicado comparaciones con otros modelos de la misma categoría.

| Benchmark | Bonsai 27B 1-bit | FP16 (referencia) | % de FP16 |
|---|---|---|---|
| Media 15 benchmarks thinking-mode | 76,11 | No disponible | 89,5 % |
| Matemáticas | 91,66 | No disponible | No disponible |
| Codigo | 81,88 | No disponible | No disponible |

No se han publicado resultados de benchmarks en la información disponible más allá de estos datos.

## Requisitos de hardware

- VRAM estimada: ~3,9 GB para el modelo de lenguaje (sin torre de visión); la caché KV a 4 bits crece hasta 4,3 GB en la ventana completa de 262K tokens (solo en 16 de las 64 capas con atención completa).
- GPU recomendadas: Apple Silicon (M-series) para MLX; GPUs NVIDIA con CUDA para el backend CUDA. El modelo está diseñado para ejecutarse en dispositivos móviles de gama alta (iPhone 17 Pro Max).
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU con más de 4 GB de VRAM, incluidas RTX 4060 o superiores, y en portátiles Apple Silicon.
- Opciones de despliegue: MLX (Python y Swift), llama.cpp (fork con kernels de 1 bit) y CUDA. No se mencionan vLLM ni TGI en la documentación.
- Rendimiento medido: ~11 tok/s en iPhone 17 Pro Max; ~44 tok/s en Apple M5 Pro; aceleración de decodificación 1,37x con el drafter DSpark en CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano desplegado | Rendimiento vs FP16 | Licencia |
|---|---|---|---|---|---|---|
| Bonsai 27B 1-bit (este) | 27,3B (declarados) | 262K | 1,125 | 3,9 GB | 89,5 % (media thinking) | Apache 2.0 |
| Ternary Bonsai 27B | 27,3B (declarados) | 262K | 2 (ternario) | ~7,2 GB | 95 % (media thinking) | Apache 2.0 |
| Qwen3.6-27B (FP16) | 27,3B | 262K | 16 | ~54 GB | 100 % | Apache 2.0 |

La comparativa se limita a la misma familia, ya que no se dispone de datos de modelos 1-bit comparables (por ejemplo, BitNet b1.58) en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad frente a FP16: el 1-bit retiene el 89,5 % de la inteligencia FP16 en la media de benchmarks thinking-mode; en tareas muy exigentes la degradación puede ser mayor que en la variante ternary (95 %).
- Caché KV cuantizada a 4 bits: la cuantización de la caché KV, aunque se describe como casi sin pérdidas, puede afectar a tareas que dependen de detalles finos en contextos muy largos.
- Idiomas no documentados: no se especifican los idiomas soportados; el multilingüismo se hereda del modelo base Qwen3.6 pero no está confirmado.
- Riesgo de alucinación y sesgos: no se han publicado evaluaciones de sesgos ni tasas de alucinación específicas para esta variante; se recomienda validar en dominios críticos.
- Soporte de backends limitado: los kernels de 1 bit están optimizados para MLX y CUDA; otros frameworks (vLLM, TGI, ONNX) no están soportados oficialmente.
- Torre de visión opcional: la entrada de imágenes requiere cargar un paquete adicional de 0,63 GB, lo que aumenta la huella total y la latencia de primera respuesta.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base Qwen3.6-27B también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prism-ml/Bonsai-27B-mlx-1bit
- Colección Bonsai 27B: https://huggingface.co/collections/prism-ml/bonsai-27b
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Fork llama.cpp (CUDA): https://github.com/PrismML-Eng/llama.cpp
- Documentación del modelo: https://docs.prismml.com/models/bonsai-27b
- Anuncio oficial: https://prismml.com/news/prismml-releases-bonsai-27b
- Página en LM Studio: https://lmstudio.ai/models/prism-ml/bonsai-27b
- Comunidad Discord: https://discord.gg/prismml
