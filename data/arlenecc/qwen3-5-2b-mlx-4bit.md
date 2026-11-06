# arlenecc/Qwen3.5-2B-MLX-4bit

## Resumen

Qwen3.5-2B-MLX-4bit es una conversión no oficial del modelo Qwen3.5-2B de Alibaba al formato MLX cuantizado a 4 bits, publicada por el usuario arlenecc en Hugging Face. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: el autor se limita a aplicar cuantización de 4 bits mediante el framework MLX de Apple, empaquetando los pesos en safetensors con el tag `qwen3_5` para su uso en hardware Apple Silicon.

El modelo base pertenece a la familia Qwen3.5, la línea de modelos densos de tamaño pequeño de Alibaba, con aproximadamente 2.213 millones de parámetros (2,2 B). Su interés práctico reside en la posibilidad de ejecutar un modelo de esta familia en Macs con memoria unificada, aprovechando las optimizaciones de MLX para inferencia local. El repositorio ocupa 1,7 GB, coherente con un modelo de 2,2 B en 4 bits.

La model card pública es prácticamente vacía (solo declara licencia MIT), y no se han publicado resultados de benchmarks, idiomas soportados ni detalles de entrenamiento en la información disponible. Cualquier evaluación de capacidades debe remitirse al modelo base original de Alibaba, no a esta conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.5, presumiblemente transformer denso; no confirmado en la información) |
| Parámetros totales | 2.213.241.664 (2,2 B) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura interna, el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. El tag `qwen3_5` sugiere que el modelo base es un Qwen3.5 de Alibaba, pero esta conversión concreta no documenta ninguna innovación técnica propia más allá de la cuantización 4-bit con MLX.

La conversión a MLX implica una reescritura de los tensores para el runtime de Apple (Metal), con cuantización de pesos a 4 bits. No se especifica si se cuantizaron también las activaciones, el grupo de cuantización ni la técnica exacta (por ejemplo, group-wise quantization). El tamaño del repo (1,7 GB) es consistente con pesos de 2,2 B a 4 bits más metadatos.

## Capacidades

- No hay documentación específica de capacidades en la información disponible.
- Se puede inferir que, al derivar de Qwen3.5-2B, hereda las capacidades del modelo base (generación de texto, razonamiento y código), pero no se confirma en la model card.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y la cuantización 4-bit permiten ejecutar un modelo de 2,2 B en memoria unificada de 8-16 GB, útil para prototipos offline en portátiles Apple.
- Asistentes de texto embebidos en aplicaciones macOS/iOS: al integrarse con el runtime MLX, puede alimentar funciones de autocompletado o resumen dentro de apps nativas sin depender de la nube.
- Experimentación académica con modelos pequeños: sirve como banco de pruebas para estudiar el efecto de la cuantización 4-bit en MLX frente a otros runtimes (llama.cpp, GGUF).
- Generación de texto en entornos con requisitos de privacidad: al ejecutarse localmente, evita el envío de datos a APIs externas, adecuado para prototipos con datos sensibles.
- Evaluación comparativa de conversiones no oficiales: útil para medir la degradación de calidad frente al checkpoint original en fp16/bf16.
- Base para fine-tuning ligero en local: el tamaño reducido facilita experimentos de LoRA/QLoRA en hardware de consumo, aunque no se documenta soporte oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~1,7 GB para los pesos en 4 bits; con overhead de runtime MLX, se recomienda al menos 4-6 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el formato MLX; no es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con 8 GB o más de memoria unificada.
- Opciones de despliegue: MLX (`mlx_lm`), `mlx-lm` server; no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin conversión previa a otro formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arlenecc/Qwen3.5-2B-MLX-4bit | 2,2 B | no disponible | MLX 4-bit | MIT | Hugging Face |
| Qwen3.5-2B (base, oficial) | 2,2 B | no disponible | safetensors | no disponible | presumiblemente Hugging Face (no confirmado) |
| Conversiones GGUF de Qwen de ~2 B | ~2 B | no disponible | GGUF | variable | Hugging Face (comunidad) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está validada por Alibaba ni por el equipo de Qwen; la calidad puede diferir del checkpoint original.
- Model card vacía: sin información sobre idiomas, contexto, entrenamiento ni evaluación, lo que dificulta su uso en producción.
- Cuantización 4-bit: degradación esperada de precisión frente a fp16/bf16, especialmente en tareas de razonamiento y matemáticas.
- Licencia MIT declarada por el autor de la conversión; conviene verificar que la licencia del modelo base permita la redistribución en estos términos.
- Sin datos de sesgos, alucinación ni restricciones de uso comercial más allá de la licencia MIT.
- Dependencia del ecosistema MLX: no portable directamente a CUDA sin reconversión.
- Cero descargas y cero likes en el momento de la consulta: sin evidencia de uso o validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/arlenecc/Qwen3.5-2B-MLX-4bit
- Modelo base Qwen3.5-2B: no disponible en la información proporcionada
- Paper o blog oficial de Qwen3.5: no disponible en la información proporcionada
- Repositorio MLX: no disponible en la información proporcionada
