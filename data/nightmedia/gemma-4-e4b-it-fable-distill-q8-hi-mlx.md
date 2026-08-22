# nightmedia/Gemma-4-E4B-it-Fable-Distill-q8-hi-mlx

## Resumen

El modelo `nightmedia/Gemma-4-E4B-it-Fable-Distill-q8-hi-mlx` es una conversión al formato MLX (Apple Silicon) del modelo `armand0e/Gemma-4-E4B-it-Fable-Distill`, un destilado del modelo Gemma 4 E4B de Google con un enfoque de razonamiento tipo "Fable". Con aproximadamente 2,8 mil millones de parámetros y cuantización de 8 bits de alta precisión, está diseñado para ejecutarse de forma eficiente en equipos con recursos limitados, como Macs con Apple Silicon o GPUs de gama media.

El modelo se presenta con licencia Apache-2.0 y soporte del idioma inglés, y su pipeline se declara como `image-text-to-text`, aunque la documentación de uso proporcionada se centra en generación de texto y chat. Es relevante por ofrecer una alternativa ligera y abierta para tareas de conversación, razonamiento y generación de texto en entornos locales, con una calidad que en los benchmarks incluidos supera ligeramente a la versión base sin cuantizar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; el nombre sugiere una arquitectura Transformer basada en Gemma 4 |
| Parametros totales | 2.806.609.226 (~2,8B) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (q8-hi); también existen versiones bf16 y mxfp8 del modelo base |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por el nombre y la referencia a Gemma 4, se trata de una arquitectura Transformer, pero no se confirma en la model card. El modelo es una destilación de un modelo llamado "Fable" (posiblemente un modelo de razonamiento), realizada sobre la base `Gemma-4-E4B-it`, y posteriormente convertida a MLX por el autor `nightmedia` usando `mlx-lm` versión 0.31.3. No se especifican los datos de entrenamiento, el número de tokens ni el proceso de destilación (RLHF, DPO, etc.).

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat.
- Razonamiento básico y comprensión lectora, según los benchmarks incluidos (ARC, BoolQ, HellaSwag, OpenBookQA, PIQA, WinoGrande).
- Soporte de entrada de imágenes (pipeline `image-text-to-text`), aunque no se demuestra en el ejemplo de uso de la model card.
- Modelo unilingüe (inglés).
- No se documenta soporte para tool calling, agentes ni modo de razonamiento extendido (thinking mode) en esta conversión.

## Casos de uso

- Asistente conversacional local: el modelo puede usarse en aplicaciones de chat privadas en un Mac, gracias a su formato MLX y bajo requisito de memoria.
- Generación de texto en entornos sin conexión: para redactar correos, resúmenes o contenido breve, con una ventana de contexto moderada (no especificada).
- Evaluación de razonamiento en investigación: útil para probar técnicas de destilación y cuantización en tareas de comprensión lectora y razonamiento de sentido común.
- Prototipado rápido de aplicaciones con MLX: los desarrolladores pueden integrar el modelo en proyectos de Apple Silicon usando la librería `mlx-lm`.
- Clasificación de textos en inglés: tareas como análisis de sentimiento o categorización, gracias a su buen desempeño en benchmarks de comprensión.
- Educación y experimentación: sirve como ejemplo de conversión de modelos Gemma 4 a MLX y de cuantización 8-bit de alta precisión.

## Benchmarks y rendimiento

La model card incluye resultados de benchmarks para la versión cuantizada q8-hi y para las versiones base (bf16 y mxfp8) del modelo original. Los nombres de las pruebas son: ARC (challenge), ARC-e (easy), BoolQ, HellaSwag, OpenBookQA, PIQA y WinoGrande. Se presentan los valores de exactitud (accuracy):

| Benchmark | q8-hi | bf16 (base) | mxfp8 (base) |
|---|---|---|---|
| ARC | 0,550 | 0,490 | 0,480 |
| ARC-e | 0,744 | 0,674 | 0,656 |
| BoolQ | 0,818 | 0,793 | 0,797 |
| HellaSwag | 0,700 | 0,612 | 0,608 |
| OpenBookQA | 0,458 | 0,416 | 0,400 |
| PIQA | 0,780 | 0,756 | 0,755 |
| WinoGrande | 0,699 | 0,669 | 0,665 |

La versión cuantizada q8-hi supera consistentemente a las versiones base en todos los benchmarks reportados, lo que sugiere una optimización adicional durante el proceso de cuantización.

## Requisitos de hardware

- VRAM estimada: con 2,8B parámetros en 8-bit, el peso ocupa aproximadamente 2,8 GB. Considerando activaciones y cache de KV, se recomienda al menos 4-6 GB de memoria de GPU para inferencia cómoda.
- GPUs recomendadas: RTX 3060 (12GB), RTX 4060 (8GB), RTX 4090, o GPUs integradas de Apple Silicon (M1/M2/M3 con al menos 8 GB de RAM unificada).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media con 6 GB o más. En Apple Silicon funciona directamente con MLX.
- Opciones de despliegue: MLX (con `mlx-lm`), aunque también puede convertirse a otros formatos (GGUF) para usar con llama.cpp o Ollama, aunque no se proporciona en este repositorio.
- Latencia y throughput: no disponibles; la ejecución en MLX en Apple Silicon suele ser eficiente para modelos de este tamaño, pero no se aportan métricas concretas.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base sin cuantizar (bf16) y su versión mxfp8, ya que el modelo es la misma arquitectura en diferentes formatos. También se puede comparar con otros modelos de ~3B como Qwen2.5-3B o Llama-3.2-3B, pero no hay datos disponibles en la información proporcionada.

| Modelo | Parámetros | Contexto | Rendimiento (ARC) | Licencia |
|---|---|---|---|---|
| Gemma-4-E4B-it-Fable-Distill-q8-hi-mlx | 2,8B | No disponible | 0,550 | Apache-2.0 |
| Gemma-4-E4B-it (bf16) | 2,8B | No disponible | 0,490 | Apache-2.0 |
| Gemma-4-E4B-it (mxfp8) | 2,8B | No disponible | 0,480 | Apache-2.0 |

La cuantización 8-bit mejora el rendimiento en los benchmarks, lo que indica que la conversión a MLX no solo mantiene, sino que parece mejorar las métricas de razonamiento en comparación con el modelo original.

## Limitaciones y advertencias

- Idioma limitado al inglés; no se soportan otros idiomas de forma nativa.
- La longitud de contexto no se especifica, por lo que no se recomienda para tareas que requieran ventanas de contexto largas sin probar previamente.
- La modalidad de imagen (`image-text-to-text`) está declarada en el pipeline, pero no se demuestra en la documentación de uso; puede no funcionar en el formato MLX.
- Riesgo de alucinación y errores de razonamiento, típico de modelos de este tamaño.
- No hay información sobre sesgos ni evaluación ética.
- La licencia Apache-2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre el uso de los datos de entrenamiento.
- Para producción, se recomienda validar el rendimiento en tareas específicas y considerar el uso de versiones más grandes si la precisión es crítica.

## Enlaces

- Repositorio HuggingFace: [nightmedia/Gemma-4-E4B-it-Fable-Distill-q8-hi-mlx](https://huggingface.co/nightmedia/Gemma-4-E4B-it-Fable-Distill-q8-hi-mlx)
- Modelo base (antes de la conversión MLX): [armand0e/Gemma-4-E4B-it-Fable-Distill](https://huggingface.co/armand0e/Gemma-4-E4B-it-Fable-Distill)
- Página oficial de Gemma 4 (Google DeepMind): [https://deepmind.google/models/gemma/gemma-4/](https://deepmind.google/models/gemma/gemma-4/)
- Guía de Gemma 4 E4B (gemma4.dev): [https://gemma4.dev/models/gemma-4-e4b](https://gemma4.dev/models/gemma-4-e4b)
- Guía general de Gemma 4 (gemma4.org): [https://gemma4.org/](https://gemma4.org/)
