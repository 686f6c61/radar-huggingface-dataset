# hugboyss/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "abliterated" (decensurada) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". El autor de esta variante es el usuario de Hugging Face hugboyss, que ha aplicado la herramienta Heretic v2.0.0.dev0 para eliminar los mecanismos de rechazo del modelo original mediante una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24.

El modelo base concentra su señal de entrenamiento supervisado en matemáticas y resolución de problemas STEM, con aproximadamente 250.000 muestras, y conserva la eficiencia y facilidad de despliegue de la clase de 9B parámetros. Según la model card, el proceso de decensurado reduce los rechazos de 100/100 a 3/100 en una evaluación propia, con una divergencia KL de 0,0422 respecto al original, lo que indica que la mayor parte del comportamiento se preserva.

Es relevante ahora porque combina tres tendencias recientes: la destilación de modelos grandes de razonamiento hacia tamaños desplegables en hardware de consumo, la eliminación de alineación de seguridad para investigación sobre comportamiento del modelo, y la publicación bajo licencia Apache 2.0 con soporte declarado para tool calling y despliegue en vLLM y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con soporte de Multi-Token Prediction (MTP) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluida variante MTP-Q8_0), NVFP4; otras no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible en repositorio de terceros |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con 9.409.813.744 parámetros. El modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B se obtuvo por destilación: se generaron respuestas con DeepSeek-V4-Pro en modo "Max Effect" y se usaron como señal de entrenamiento supervisado (SFT) sobre Qwen3.5-9B, con aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico. Las etiquetas del repositorio mencionan también fases de RL con GSPO, aunque la model card no detalla la composición exacta del dataset ni el número total de tokens de entrenamiento.

La innovación principal de esta variante concreta es el proceso de decensurado mediante Heretic v2.0.0.dev0, que aplica una ablación de rangos arbitrarios entre las capas 9 y 24 con los parámetros `preserve_good_behavior_weight` 0,8264, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 0,9645 y `neighbor_count` 12. El modelo base incorpora además soporte de Multi-Token Prediction (MTP), evaluado en despliegue con llama.cpp en cuantización Q8_0.

## Capacidades

- Generación de texto y razonamiento estructurado con descomposición de problemas en varios pasos, aprendido por destilación de un profesor de mayor tamaño.
- Razonamiento matemático y resolución de problemas STEM, foco principal del entrenamiento supervisado.
- Tool calling y function calling, según las etiquetas del repositorio.
- Soporte de agentes y razonamiento multi-paso (etiquetas `tool-use`, `mtp`).
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Procesamiento image-text-to-text según las etiquetas del repositorio, aunque la model card no detalla el soporte de visión.
- Modo de razonamiento explícito (etiqueta `reasoning`).
- Comportamiento decensurado: rechaza aproximadamente 3 de cada 100 peticiones en la evaluación del autor, frente a 100 de 100 del modelo original.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar qué comportamientos emergen al eliminar los mecanismos de rechazo, comparando directamente con el modelo original y midiendo la divergencia KL (0,0422) para aislar el efecto de la ablación.
- Tutoría de matemáticas y STEM: el entrenamiento con ~250.000 muestras de razonamiento científico lo hace adecuado para explicar paso a paso demostraciones, resolver problemas de física o verificar cálculos intermedios.
- Generación de código en pipelines: aunque no recibió SFT específico de programación, la model card reporta pequeñas mejoras por transferencia cruzada; puede integrarse en flujos de CI/CD para generar parches o tests con tool calling.
- Evaluación comparativa de cuantizaciones: al existir variantes GGUF (incluida MTP-Q8_0) y NVFP4 evaluadas en vLLM y llama.cpp, sirve para medir la degradación de calidad entre formatos en un mismo modelo.
- Experimentación con MTP en local: la variante MTP-Q8_0 permite probar decodificación multi-token en llama.cpp sobre hardware de consumo.
- Asistentes conversacionales sin restricciones temáticas para entornos controlados de investigación: útil para estudiar respuestas del modelo ante prompts que el original rechazaría, siempre en contextos de laboratorio y con revisión humana.
- Destilación adicional: al estar bajo Apache 2.0 y en safetensors, puede usarse como base para nuevos fine-tunes o como profesor pequeño en destilaciones posteriores.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de decensurado, no benchmarks estándar (MMLU, GSM8K, HumanEval).

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (sobre 100) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 18,8 GB solo para pesos (tamaño del repo), más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más.
- VRAM estimada en cuantización Q8_0 (GGUF): en torno a 10 GB, apta para GPUs de 12-16 GB.
- VRAM estimada en cuantizaciones de 4 bits: aproximadamente 5-6 GB, viable en GPUs de consumo de gama media-alta.
- GPUs recomendadas: A100 o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o Q8_0; RTX 3090, 4080 o 4070 Ti para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4-8 bits.
- Opciones de despliegue: transformers, vLLM (evaluado con NVFP4), llama.cpp (evaluado con MTP-Q8_0), text-generation-inference según etiquetas; Ollama no confirmado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Variante decensurada con Heretic; 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Modelo base alineado; 100/100 rechazos |
| Qwen3.5-9B | 9B | no disponible | no disponible | Modelo original sobre el que se destila |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | Profesor utilizado para generar la señal de destilación |

## Limitaciones y advertencias

- El proceso de decensurado elimina deliberadamente los mecanismos de rechazo: el modelo puede generar contenido dañino, ilegal o inseguro sin filtros, lo que exige supervisión humana y entornos controlados.
- Riesgo de alucinación inherente a un modelo de 9B destilado; la destilación de matemáticas y STEM no garantiza corrección factual general.
- La ablación entre las capas 9 y 24 puede degradar capacidades no medidas por el autor; solo se reporta divergencia KL global y tasa de rechazos.
- Longitud de contexto no documentada en la información disponible; no debe asumirse una ventana larga sin verificación empírica.
- El soporte de visión aparece en las etiquetas pero no está descrito en la model card; tratarlo como no confirmado.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo decensurado puede incumplir políticas de plataformas, términos de servicio de proveedores cloud y normativa aplicable sobre contenido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes independientes de calidad.
- Sesgos específicos no documentados; al derivar de Qwen3.5 y DeepSeek-V4-Pro, hereda los sesgos de ambos, agravados por la ausencia de alineación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugboyss/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Variante GGUF (terceros): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Réplica en otro espacio (terceros): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Heretic: https://heretic-project.org
