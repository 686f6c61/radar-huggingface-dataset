# jesusluque/qwen3-30b-topiary-w640

## Resumen

El modelo `jesusluque/qwen3-30b-topiary-w640` es un checkpoint derivado de Qwen3-30B-A3B, un modelo de lenguaje de arquitectura MoE (Mixture of Experts) de 30 mil millones de parámetros totales y aproximadamente 3.3 mil millones de parámetros activos, desarrollado por el equipo Qwen de Alibaba Cloud. Este checkpoint aplica el método Topiary, que poda los expertos enrutados del modelo base mediante saliencia de activaciones, reduciendo el ancho de sus capas intermedias de 768 a 640 neuronas, y posteriormente cuantiza los pesos a 4 bits con grupo de tamaño 64. El resultado es un modelo de solo 14.5 GB que mantiene un rendimiento notable en tareas de código, razonamiento y comprensión, con una pérdida controlada de conocimiento en distribuciones extremas.

La relevancia de este modelo radica en su capacidad para ejecutarse eficientemente en hardware de Apple Silicon mediante la librería MLX, ofreciendo una alternativa a las cuantizaciones tradicionales de 3 o 4 bits. Al combinar poda por saliencia y cuantización, consigue un mejor equilibrio entre tamaño y calidad que la simple reducción de bits, como demuestran sus resultados en benchmarks. No requiere entrenamiento adicional ni destilación, y se sirve con `mlx-lm` estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3-30B-A3B |
| Parametros totales | 4.015.847.424 (checkpoint resultante tras poda y cuantizacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredado del modelo base, no especificado) |
| Tipos de cuantizacion | 4-bit, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B es un transformer MoE con 48 capas, 128 expertos y activación de los 8 mejores por token. El checkpoint Topiary no modifica la arquitectura global, sino que interviene a nivel de cada experto: ordena las 768 neuronas de la capa intermedia de cada experto según su contribución medida sobre tráfico real (saliencia de activaciones enrutadas), aplica una permutación que preserva la función y trunca la representación a las 640 neuronas más relevantes. Esto reduce el ancho de los expertos en un 17 %, disminuyendo el número de parámetros almacenados. Posteriormente, los pesos resultantes se cuantizan a 4 bits con grupo de 64.

No hay entrenamiento ni destilación; el proceso es completamente post-hoc. La calibración se realizó con un corpus mixto (aproximadamente 40 % código, 30 % GSM8K-train, 30 % WikiText) de 151 000 tokens, acumulando estadísticas de saliencia solo sobre los tokens que el router envía a cada experto. El autor indica que recalibrar sobre datos propios lleva minutos con las herramientas del repositorio Topiary.

## Capacidades

- Generación de texto y razonamiento: mantiene capacidades de razonamiento lógico y matemático, aunque con una ligera degradación en tareas que requieren conocimiento enciclopédico.
- Generación de código: destaca especialmente en tareas de programación, con una perplejidad de código baja (2.70) y un 84 % en HumanEval (muestra de 50).
- Matemáticas: buen desempeño en GSM8K (94 % en muestra de 50), aunque inferior en MATH-500 (38 % frente al 46 % de la versión 3-bit).
- Comprensión lectora y seguimiento de instrucciones: puntuaciones sólidas en MMLU (74 % generativo) e IFEval (76 %).
- Capacidades multilingües: no especificadas para este checkpoint, pero hereda las del modelo base Qwen3, que soporta más de 100 idiomas.
- Soporte de tool calling y agentes: no confirmado explícitamente en la documentación del checkpoint, pero el modelo base Qwen3-30B-A3B incluye estas capacidades; se asume que se mantienen, aunque no se han verificado.
- Sin modo de pensamiento explícito: el modelo base soporta modo thinking, pero no se menciona si el checkpoint lo conserva.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está optimizado para MLX y cabe en 14.5 GB de pesos, por lo que puede ejecutarse en Macs con 16 GB de RAM unificada o más. Es ideal para prototipado y desarrollo offline.
- Asistente de programación en entornos con recursos limitados: su bajo tamaño y buena puntuación en HumanEval lo hacen adecuado para autocompletado de código, generación de funciones y revisión de snippets en editores o entornos CI.
- Chatbots de soporte técnico: con 4 bits y poda, ofrece respuestas coherentes en diálogos multi-turno, aunque se debe vigilar la posible pérdida de conocimiento específico de dominio.
- Educación y experimentación: al ser Apache-2.0 y sin entrenamiento adicional, es útil para estudiar el impacto de la poda por saliencia en modelos MoE, o para probar técnicas de calibración con datos propios.
- Procesamiento de documentos técnicos: su buena perplejidad en WikiText (10.35) permite resumir o extraer información de textos largos, siempre que no se requiera conocimiento muy especializado.
- Evaluación de metodologías de compresión: sirve como referencia para comparar estrategias de cuantización y poda en modelos de gran escala, dado que el autor publica resultados reproducibles y herramientas para construir variantes.

## Benchmarks y rendimiento

Los resultados presentados en la model card comparan este modelo con versiones cuantizadas comunitarias del mismo base (3-bit y 3-4-bit mixto). Se usaron muestras de 50 o 100 ejemplos, con decodificación greedy y semillas fijas.

| Señal | Este modelo (Topiary w640, 14.46 GB) | 3-bit comunitario (13.4 GB) | 3-4-bit mixto (14.0 GB) |
|---|---|---|---|
| Code PPL (menor es mejor) | 2.70 | 3.26 | 3.07 |
| WikiText PPL (menor es mejor) | 10.35 | 15.7 | 13.4 |
| GSM8K (n=50) | 94 % | 88 % | 82 % |
| MMLU (n=100, generativo) | 74 % | 57 % | 59 % |
| HumanEval (n=50) | 84 % | 76 % | — |
| IFEval (n=50) | 76 % | 68 % | — |
| ARC-Challenge (n=100) | 49 % | 44 % | — |
| Decode (tok/s) | 80.6 | 78.5 | — |

El autor señala que la versión 3-bit mantiene una ligera ventaja en colas de distribución: MATH-500 46 % frente a 38 % y HellaSwag 66 % frente a 65 %. Además, un estudio del modelo hermano "taper" mostró una pérdida de conocimiento de -10 puntos en MMLU y -4.4 en LAMBADA frente al modelo sin podar, por lo que se espera una degradación similar en este checkpoint.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 14.5 GB en 4-bit; se recomienda al menos 16 GB de memoria unificada en Apple Silicon para inferencia cómoda.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o superior) con suficiente RAM unificada; no está pensado para GPUs NVIDIA, aunque podría convertirse a otros formatos.
- Compatibilidad con GPU de consumo: no aplica directamente, ya que es un checkpoint MLX; en otras plataformas habría que convertir los pesos a GGUF o GPTQ.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate`), que es la vía oficial; también puede usarse con la API de MLX para integraciones personalizadas.
- Latencia y throughput: el autor reporta 80.6 tokens/s en decodificación (medido en Apple Silicon), lo que lo hace viable para aplicaciones interactivas en tiempo real.

## Comparativa con modelos similares

Comparación con alternativas basadas en el mismo modelo base Qwen3-30B-A3B:

| Modelo | Tamaño | Cuantización | MMLU (n=100) | HumanEval (n=50) | GSM8K (n=50) | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-30B-A3B (original) | ~30B totales, ~3.3B activos | bf16 | no disponible | no disponible | no disponible | Apache-2.0 |
| Este checkpoint Topiary w640 | 14.5 GB (4-bit) | 4-bit g64 | 74 % | 84 % | 94 % | Apache-2.0 |
| Qwen3-30B-A3B-4bit (sin podar) | ~15 GB (4-bit) | 4-bit g64 | no disponible | no disponible | no disponible | Apache-2.0 |
| 3-bit comunitario | 13.4 GB | 3-bit | 57 % | 76 % | 88 % | Apache-2.0 |

La comparativa directa con el modelo sin podar no está publicada en la model card, pero el autor menciona en el estudio del modelo hermano que la poda reduce el conocimiento sin afectar el razonamiento. Frente a otras familias de modelos MoE de tamaño similar (por ejemplo, Mixtral 8x7B), este checkpoint es más pequeño y está optimizado para MLX, aunque no se dispone de benchmarks cruzados.

## Limitaciones y advertencias

- Pérdida de conocimiento en colas de distribución: la poda por saliencia sacrifica información que no fue ejercitada durante la calibración, como se observa en MATH-500 y HellaSwag. Si el caso de uso requiere conocimiento enciclopédico o matemático avanzado, es preferible el modelo sin podar.
- Riesgo de alucinación: al reducir el ancho de los expertos, el modelo puede inventar datos con mayor frecuencia en dominios poco representados en el corpus de calibración.
- Contexto no verificado: aunque el modelo base soporta 128K tokens, no se ha confirmado que el checkpoint conserve esta longitud; se recomienda probar antes de usarlo con contextos largos.
- Dependencia del hardware: al ser un checkpoint MLX, su uso fuera de Apple Silicon requiere conversión de formato, lo que puede introducir incompatibilidades o pérdidas adicionales de calidad.
- Licencia y uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo base Qwen3 tiene términos adicionales (por ejemplo, no usar para servicios que violen leyes locales); se debe revisar la documentación oficial de Qwen.
- Reproducibilidad: los resultados dependen de la configuración de calibración y de las muestras de evaluación; el autor proporciona configuraciones congeladas, pero cualquier cambio en el corpus de calibración alterará el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jesusluque/qwen3-30b-topiary-w640
- Checkpoint hermano (taper): https://huggingface.co/jesusluque/qwen3-30b-topiary
- Repositorio Topiary (método y herramientas): https://github.com/jesusluque/topiary-stream
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
