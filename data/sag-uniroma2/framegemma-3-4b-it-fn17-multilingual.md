# sag-uniroma2/FrameGemma-3-4b-it-FN17-Multilingual

## Resumen

FrameGemma-3-4b-it-FN17-Multilingual es un ajuste fino (fine-tune) del modelo Gemma 3 de 4B parámetros en su variante instruction-tuned, publicado por el grupo sag-uniroma2 (Universidad de Roma Tor Vergata). El nombre sugiere una especialización en el marco "Frame" (probablemente FrameNet, dado el origen académico en lingüística computacional) y una orientación multilingüe, aunque la model card publicada no contiene más que la declaración de licencia, sin documentación técnica adicional.

El modelo conserva la arquitectura base de Gemma 3: un transformer decoder-only de aproximadamente 4.300 millones de parámetros, con pesos en formato safetensors y un tamaño de repositorio de 8,6 GB, lo que corresponde a pesos en precisión bf16/fp16. La licencia Apache 2.0 facilita su uso comercial, a diferencia de la licencia Gemma original.

Su relevancia actual es limitada pero concreta: se trata de un experimento académico de adaptación lingüística sobre una base reciente de Google, con cero descargas y cero likes en el momento de la consulta. Es útil para investigadores interesados en evalúar especializaciones semánticas sobre modelos pequeños, pero carece de documentación que permita validar su comportamiento en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 3) |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Gemma 3 4B soporta 128K, no confirmado en este fine-tune) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (el nombre indica "Multilingual", sin lista concreta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre el proceso de entrenamiento en la model card. Por herencia del modelo base, se trata de un transformer decoder-only con atención agrupada (GQA) y normalización RMSNorm, la arquitectura estándar de la familia Gemma 3. El tamaño de 4.300 millones de parámetros coincide con la variante 4B de Gemma 3 instruction-tuned.

El sufijo "FN17" y el prefijo "Frame" apuntan a un ajuste fino orientado a frames semánticos (posiblemente FrameNet 1.7), y "Multilingual" a una adaptación multilingüe. No hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas. Cualquier afirmación adicional sería especulativa.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Gemma 3 4B instruction-tuned.
- Comprensión y generación multilingüe (según indica el nombre; sin lista de idiomas confirmada).
- Posible especialización en análisis semántico basado en frames (FrameNet), no verificada por el autor.
- Soporte de tool calling y function calling: no confirmado en este fine-tune.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades de visión: no confirmadas (Gemma 3 4B base es multimodal, pero este fine-tune podría haberlas eliminado o conservado sin documentarlo).

## Casos de uso

- Investigación en semántica de frames: el modelo puede emplearse para experimentos de etiquetado de roles semánticos y detección de frames, que es presumiblemente su objetivo de entrenamiento.
- Evaluación comparativa de fine-tunes académicos: útil como punto de comparación frente al Gemma 3 4B original en tareas lingüísticas.
- Prototipado multilingüe de bajo coste: con 4,3B parámetros cabe en GPUs de consumo y permite experimentar con generación de texto en varios idiomas.
- Extracción de información estructurada: si el ajuste conserva las capacidades del base, puede usarse para tareas de clasificación y extracción en pipelines de NLP.
- Docencia y experimentación: su licencia Apache 2.0 y tamaño reducido lo hacen adecuado para laboratorios y cursos.
- Base para nuevos fine-tunes: al ser un checkpoint safetensors estándar, puede servir como punto de partida para adaptaciones posteriores con LoRA o QLoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 8,6 GB de pesos, más overhead de activaciones y KV cache; se recomienda al menos 12-16 GB para inferencia cómoda.
- VRAM estimada en cuantización 8 bits: en torno a 5-6 GB.
- VRAM estimada en cuantización 4 bits: en torno a 3-4 GB.
- GPU recomendadas: NVIDIA RTX 4090, A100, H100 para bf16 sin cuantizar; RTX 3060/4060 Ti (12-16 GB) para cuantización 8 bits; GPUs con 8 GB para 4 bits.
- Cabe en GPU de consumo con cuantización (RTX 3060, RTX 4060, RTX 4090).
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (previo GGUF), transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FrameGemma-3-4b-it-FN17-Multilingual | 4,3B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| google/gemma-3-4b-it | 4,3B | 128K (según documentación de Google) | Gemma License | Hugging Face |
| Qwen2.5-3B-Instruct | 3,1B | 32K | Apache 2.0 | Hugging Face |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community License | Hugging Face |

La comparativa de rendimiento no está disponible porque el autor no ha publicado benchmarks.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no hay información sobre datos de entrenamiento, evaluación ni comportamiento esperado.
- Riesgo de alucinación heredado del modelo base, sin mitigaciones documentadas.
- Posibles sesgos del dataset de ajuste fino, desconocidos.
- Idiomas soportados sin especificar; el etiquetado "Multilingual" no está respaldado por una lista concreta.
- Longitud de contexto no confirmada para este checkpoint.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar que el fine-tune respeta las condiciones de la licencia Gemma original de Google.
- No recomendado para producción sin una evaluación previa exhaustiva por parte del equipo que lo adopte.

## Enlaces

- Hugging Face: https://huggingface.co/sag-uniroma2/FrameGemma-3-4b-it-FN17-Multilingual
- Modelo base Gemma 3 (referencia): https://huggingface.co/google/gemma-3-4b-it
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
