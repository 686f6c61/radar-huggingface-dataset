# Solstice-AI/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit

## Resumen

El modelo `Solstice-AI/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit` es una cuantización MLX de 6 bits del checkpoint `DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1`, desarrollada por Solstice-AI. Combina las técnicas Cold-Fusion (weight blending) y GAIN (Guided Activation Interleaved Normalization) sobre la arquitectura base Qwen 3.8 de 27B parámetros, con el objetivo de unificar razonamiento matemático y de codificación con escritura creativa y narrativa de alta calidad.

La cuantización 6-bit affine reduce el peso del modelo desde aproximadamente 54 GB en FP16 hasta 21.85 GB, lo que permite ejecutarlo en Macs con 32 GB de RAM unificada. El modelo declara preservar el 99.4% de la precisión FP16 original y ofrece una ventana de contexto nativa de 262.144 tokens, ampliada mediante rotary position embeddings.

Es relevante para desarrolladores e investigadores que trabajan en Apple Silicon y necesitan un modelo versátil, capaz de alternar entre tareas técnicas complejas y generación literaria, sin requerir infraestructura de GPU dedicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen 3.8 |
| Parametros totales | 26.895.993.856 (26.9B) según safetensors; la model card declara 27.5B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | MLX 6-bit affine (group_size 64, mode affine) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX 6-bit) |
| Tamaño en disco | 21.85 GB (5 shards) |
| Runtime principal | Anvil Engine (Metal) / Apple mlx-lm v0.19.0+ |
| Precisión preservada | 99.4% respecto a FP16 original |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El modelo se basa en un transformer denso de la familia Qwen 3.8 con aproximadamente 27 mil millones de parámetros. El entrenamiento del checkpoint original combina Cold-Fusion (mezcla de pesos) con GAIN (alineación multi-etapa), utilizando los datasets `Polar-STRICT` y `Reasoning-STRICT`. Estos incluyen trazas estructuradas de razonamiento matemático Chain-of-Thought junto con corpus literarios y diálogos narrativos extensos.

La innovación técnica destacable de esta versión es la cuantización MLX 6-bit affine con `group_size` de 64, que comprime los pesos activos de ~54 GB a ~21.8 GB. El contexto nativo de 262K tokens se logra mediante extensiones de rotary position embeddings, lo que permite procesar bases de código completas o manuscritos literarios de varias páginas sin truncamiento.

## Capacidades

- Razonamiento matemático y codificación mediante trazas estructuradas de Chain-of-Thought.
- Escritura creativa y worldbuilding en todos los géneros literarios, sin degradación cognitiva.
- Roleplay de personajes con coherencia estilística y sin tropos repetitivos.
- Troubleshooting técnico en conversaciones multi-turno.
- Diseño y análisis de arquitectura de software distribuida.
- Análisis de bases de código extensas y manuscritos literarios largos gracias al contexto de 262K.
- Capacidades multilingües limitadas a inglés y chino según la información disponible.
- El pipeline declarado en HuggingFace es image-text-to-text, pero la model card no detalla capacidades de visión; no se puede confirmar soporte multimodal.
- No se especifica soporte de tool calling / function calling en la información disponible.

## Casos de uso

- Análisis de código legacy: con 262K de contexto, puede procesar repositorios completos, identificar patrones de arquitectura y sugerir refactorizaciones sin perder el hilo de módulos interconectados.
- Generación de pruebas matemáticas: útil en entornos educativos o de investigación para producir demostraciones formales paso a paso, apoyándose en las trazas de Chain-of-Thought del entrenamiento.
- Escritura de novelas y worldbuilding: mantiene coherencia narrativa en manuscritos de varias páginas, desarrollando tramas, personajes y escenarios de forma consistente.
- Roleplay narrativo interactivo: adecuado para juegos de rol o simulaciones de personajes, donde se requiere mantener la voz y las motivaciones del personaje a lo largo de múltiples turnos.
- Soporte técnico multi-turno: puede diagnosticar fallos en sistemas distribuidos, alternando entre preguntas de usuario, análisis de logs y propuestas de solución sin perder contexto.
- Documentación de arquitecturas de software: genera y revisa documentación técnica detallada, incluyendo diagramas textuales y explicaciones de decisiones de diseño.
- Traducción y análisis de textos chino-inglés: al soportar ambos idiomas, puede realizar traducciones técnicas y literarias, así como análisis comparativo de documentos bilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otras métricas estándar. Los únicos datos de rendimiento declarados son la preservación de precisión del 99.4% respecto a FP16 y los valores de throughput en hardware Apple Silicon, que se detallan en la sección de requisitos de hardware.

## Requisitos de hardware

- VRAM/RAM estimada: ~22.2 GB con contexto de 8K; ~24.8 GB con contexto de 32K.
- GPU recomendadas: Apple Silicon con 32 GB o más de RAM unificada (M1/M2/M3/M4/M5 Pro, Max, Ultra). No es compatible con GPUs NVIDIA/CUDA.
- Throughput declarado por el autor según hardware:
  - Apple M4 Max (128 GB): 64K-131K tokens, ~62 tok/s.
  - Apple M3 Max (64/96 GB): 32K-64K tokens, ~55 tok/s.
  - Apple M2 Ultra (64/192 GB): 64K-131K tokens, ~58 tok/s.
  - Apple M3 Pro / M4 Pro (36/48 GB): 16K-32K tokens, ~42 tok/s.
  - Mac con 24 GB de RAM unificada: 4K-8K tokens, ~36 tok/s.
- Opciones de despliegue: Anvil Engine (CLI y servidor OpenAI-compatible) y Apple mlx-lm (chat interactivo y servidor REST).
- Nota: los valores de throughput y compatibilidad de hardware provienen de la model card del autor y no han sido verificados de forma independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| Solstice-AI/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit | 26.9B (safetensors) | 262K | MLX 6-bit | 21.85 GB | Apache 2.0 |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 (base) | 27.5B (declarado) | 262K | FP16 | ~54 GB | Apache 2.0 |

No se dispone de información suficiente en la documentación proporcionada para comparar este modelo con otras alternativas de la misma categoría, más allá del checkpoint original en FP16.

## Limitaciones y advertencias

- Sesgos: no se han publicado evaluaciones de sesgos para este modelo; no disponible.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado tasas de alucinación específicas.
- Idiomas: solo se documentan inglés y chino; el rendimiento en otros idiomas no está evaluado.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar los avisos de copyright y licencia originales.
- La cuantización 6-bit puede introducir ligeras pérdidas de precisión en tareas numéricas de alta exigencia, aunque se declara una preservación del 99.4%.
- Optimizado exclusivamente para Apple Silicon; no hay soporte para CUDA/ROCm ni para despliegue en GPUs NVIDIA.
- El pipeline image-text-to-text declarado en HuggingFace no está respaldado por documentación de capacidades de visión en la model card.
- Los datos de throughput y compatibilidad de hardware provienen del autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Anvil Engine: https://github.com/Solstice-Labs/anvil
