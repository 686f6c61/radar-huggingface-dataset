# sealad886/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop-mxfp4

## Resumen

Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop-mxfp4 es una cuantización en formato MLX (mxfp4, 4 bits) del modelo DavidAU/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop, publicada por el usuario sealad886. Se trata de un fine-tune derivado de la familia Qwen3.5/Qwen3.6, con 12.135.980.720 parámetros totales, orientado a escritura creativa, narrativa de ficción, generación de tramas y roleplaying, y etiquetado explícitamente como "heretic", "uncensored" y "abliterated", lo que indica que se ha reducido o eliminado parte de los mecanismos de rechazo del modelo base.

La relevancia de esta publicación es doble: por un lado, ofrece una versión ejecutable en hardware Apple Silicon mediante el framework MLX (librería mlx-vlm 0.7.12), lo que facilita la inferencia local en Macs con memoria unificada; por otro, el pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo original, aunque la model card no detalla el componente de visión. El repositorio ocupa 7,1 GB y la licencia declarada es Apache 2.0.

No obstante, la información técnica disponible es muy limitada: la model card es prácticamente un stub de conversión que remite al modelo original, y no se publican detalles sobre datos de entrenamiento, contexto, benchmarks ni composición del dataset. Cualquier evaluación rigurosa debe consultar la ficha del modelo base antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5/Qwen3.6, tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 12.135.980.720 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp4 (4 bits, formato MLX); el modelo base se distribuye en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (mxfp4), librería `mlx` |

## Arquitectura y entrenamiento

El modelo es una conversión a MLX del fine-tune DavidAU/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop, que a su vez deriva de la familia Qwen3.5/Qwen3.6 (tag `qwen3_5` en Hugging Face). La arquitectura subyacente es un transformer decoder-only de aproximadamente 12.100 millones de parámetros, según el recuento real de safetensors. El sufijo "Thinking" sugiere la presencia de un modo de razonamiento explícito (cadena de pensamiento), habitual en la familia Qwen3, aunque la model card no lo documenta.

El proceso de conversión se realizó con mlx-vlm 0.7.12 y cuantiza los pesos a mxfp4 (4 bits con escalas de microscale), reduciendo el repositorio a 7,1 GB. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las técnicas de "abliteration" aplicadas para eliminar los rechazos. Tampoco se detalla si el fine-tune conserva el entrenamiento multimodal del modelo base o si el pipeline image-text-to-text es meramente heredado de la configuración original.

## Capacidades

- Generación de texto narrativo y creativo: ficción, ciencia ficción, romance y "todos los géneros" según los tags del autor.
- Escritura de tramas y subtramas, continuación de escenas y storytelling extenso.
- Roleplaying y diálogo de personajes, con énfasis en "prosa vívida".
- Modo de razonamiento ("Thinking"), inferido del nombre del modelo; no documentado en la model card.
- Procesamiento image-text-to-text según el pipeline declarado; el soporte real de visión no está verificado en esta conversión.
- Multilingüe limitado a inglés y chino (en, zh).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Comportamiento "uncensored"/"abliterated": menor tasa de rechazos ante contenido sensible, según los tags del autor.

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar capítulos completos, mantener voces de personaje y continuar escenas a partir de un prompt, aprovechando su especialización declarada en narrativa y prosa vívida. Adecuado para autores que trabajan en local sobre Apple Silicon.
- Generación de tramas y subtramas: útil en fases de brainstorming para producir sinopsis, arcos argumentales y giros, dado el énfasis del fine-tune en plot y sub-plot generation.
- Roleplaying y juegos de mesa narrativos: puede interpretar personajes de forma consistente en conversaciones multi-turno, con menor probabilidad de rechazo ante temáticas adultas o violentas propias de la ficción.
- Prototipado de asistentes creativos en Mac: al estar en formato MLX, se integra en flujos locales con mlx-vlm sin depender de servicios en la nube, lo que facilita pruebas de concepto con datos privados.
- Generación de contenido para videojuegos narrativos: diálogos ramificados y descripciones de escenas para motores de aventura conversacional.
- Experimentación en investigación sobre alineación y "abliteration": permite estudiar el comportamiento de un modelo con los rechazos reducidos frente a su base, comparando tasas de cumplimiento y calidad.
- Análisis de imágenes con descripción textual (si se confirma el soporte de visión): generación de pies de foto o descripciones narrativas a partir de imágenes, usando el pipeline image-text-to-text declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 7,1 GB en mxfp4; se recomienda al menos 10-12 GB de memoria unificada libre para inferencia con contexto moderado.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4) con memoria unificada suficiente; el formato MLX no está pensado para GPUs NVIDIA.
- GPU consumer: no aplica en su forma actual; para GPUs NVIDIA habría que usar el modelo base en bfloat16 o una cuantización GGUF/AWQ equivalente, no incluida en este repo.
- Despliegue: `mlx-vlm` 0.7.12 o superior mediante `python -m mlx_vlm.generate`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sealad886/Qwen3.6-12B-...-mxfp4 (este) | 12,1 B | no disponible | Apache 2.0 | MLX mxfp4 | Cuantización 4 bits para Apple Silicon |
| DavidAU/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop | 12,1 B (presumible) | no disponible | Apache 2.0 (presumible) | safetensors bfloat16 | Modelo base del que deriva esta conversión |
| Qwen3-14B (familia oficial) | ~14 B | hasta 128K en variantes Qwen3 | Apache 2.0 | safetensors, GGUF | Referencia oficial de la familia; sin fine-tune "uncensored" |
| Fine-tunes "abliterated" de 12-14 B (p. ej. variantes de Qwen/Llama) | 12-14 B | variable | variable | safetensors, GGUF | Alternativas con rechazos reducidos; comparación no verificada con datos |

La comparación cuantitativa con alternativas no está disponible porque no se han publicado benchmarks de este fine-tune ni de su modelo base en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas de escritura, por lo que la calidad real es desconocida.
- Model card mínima: la ficha es un stub de conversión; no documenta contexto, datos de entrenamiento ni el componente multimodal.
- Riesgo de alucinación: al ser un fine-tune creativo sin datos de evaluación, la fiabilidad factual no está garantizada y no debería usarse para tareas de precisión sin verificación.
- Contenido sin filtros: las etiquetas "uncensored" y "abliterated" implican menor tasa de rechazos; requiere moderación externa en aplicaciones públicas y revisión de cumplimiento legal.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base y de los datos de entrenamiento originales, no detalladas aquí.
- Formato restringido: la cuantización mxfp4 está atada a MLX y Apple Silicon; no es portable a GPUs NVIDIA sin reconvertir.
- Soporte de visión incierto: el pipeline image-text-to-text puede ser herencia de la configuración del modelo base y no estar funcional en esta conversión.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sealad886/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop-mxfp4
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Documentación de MLX: https://ml-explore.github.io/mlx/
- Familia Qwen (referencia oficial): https://huggingface.co/Qwen
