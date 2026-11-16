# AnirudhNarayan/Qwen3-VL-8B-Layer17-Zero-Ablation

## Resumen

Qwen3-VL-8B-Layer17-Zero-Ablation es un checkpoint de investigación publicado por AnirudhNarayan que consiste en una copia modificada de Qwen/Qwen3-VL-8B-Instruct en la que se han puesto a cero de forma permanente los pesos de la MLP de la capa 17 del modelo de lenguaje (gate_proj, up_proj y down_proj). No es un modelo entrenado para uso general, sino un artefacto de un estudio de ablación orientado a investigar si el comportamiento de rechazo alineado con la seguridad en Qwen3-VL-8B está localizado en una única capa del transformer.

El modelo parte de la arquitectura Qwen3-VL, un transformer decoder-only multimodal (visión-lenguaje) de aproximadamente 8.770 millones de parámetros, y conserva intactos todos los pesos salvo los de la MLP de la capa 17. El hallazgo principal del autor es que anular esa capa no rompe la alineación de seguridad: la tasa de rechazo ante prompts dañinos se mantiene similar a la del modelo base, lo que sugiere que el comportamiento de rechazo está distribuido entre varias capas y no concentrado en un único bloque MLP.

Su relevancia es fundamentalmente académica: sirve como evidencia empírica en el debate sobre la localización de mecanismos de seguridad en modelos vision-lenguaje y como referencia metodológica para estudios de ablación. No está pensado para despliegue en producción ni para tareas de inferencia general, y cuenta con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Qwen3-VL), con torre de visión y modelo de lenguaje |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor carga en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen/Qwen3-VL-8B-Instruct, un modelo vision-lenguaje con arquitectura transformer decoder-only que combina un codificador visual con un modelo de lenguaje de ~8.770 millones de parámetros. La modificación aplicada es una ablación quirúrgica: los tensores `model.language_model.layers.17.mlp.gate_proj.weight` [12288, 4096], `model.language_model.layers.17.mlp.up_proj.weight` [12288, 4096] y `model.language_model.layers.17.mlp.down_proj.weight` [4096, 12288] se han fijado a cero, de modo que la MLP de la capa 17 actúa como una identidad (salida nula) y la información fluye únicamente por las conexiones residuales y el mecanismo de atención de esa capa.

No se ha realizado entrenamiento adicional ni ajuste fino sobre el checkpoint base: la model card no documenta tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna innovación técnica de inferencia. La capa 17 se eligió porque, según el autor, presentaba la mayor activación específica de daño en experimentos previos de probing. El interés técnico reside en el resultado del experimento: la ablación de una sola MLP no degrada la tasa de rechazo, lo que apunta a un mecanismo de seguridad distribuido y redundante en múltiples capas.

## Capacidades

- Hereda las capacidades del modelo base Qwen3-VL-8B-Instruct en la medida en que la ablación no las degrade; el autor no documenta una evaluación detallada de capacidades más allá de las gráficas de utilidad.
- Generación de texto y razonamiento multimodal (visión-lenguaje), al conservar la torre de visión y el resto de capas intactas.
- Procesamiento de imágenes junto con texto mediante `AutoProcessor` y `Qwen3VLForConditionalGeneration`.
- Comportamiento de rechazo ante prompts dañinos preservado pese a la ablación, según el hallazgo principal del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre localización de mecanismos de seguridad: el checkpoint permite reproducir y contrastar el experimento de ablación para estudiar si el rechazo está distribuido entre capas, comparando la tasa de éxito de ataques (ASR) frente al modelo base.
- Metodología de estudios de ablación: sirve como plantilla reproducible para aplicar ablaciones de cero sobre capas concretas (MLP, atención) en modelos vision-lenguaje y medir el impacto en seguridad y utilidad.
- Análisis de robustez de alineación: útil para evaluar si un mecanismo de rechazo sobrevive a la eliminación de un bloque con alta activación específica de daño, informando sobre redundancia de salvaguardas.
- Docencia y divulgación técnica: ejemplo concreto y verificable de cómo una modificación quirúrgica de pesos afecta (o no) al comportamiento de un modelo multimodal.
- Evaluación comparativa de utilidad: las gráficas de utilidad del repo permiten medir cuánto degrada la ablación las capacidades generales frente al modelo base.
- Referencia para interpretabilidad mecanicista: punto de partida para diseñar ablaciones multi-capa y comprobar hipótesis sobre circuitos de seguridad en transformers multimodales.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card remite a dos imágenes en el repositorio (`ablation_asr_benchmarks.png` y `ablation_utility_benchmarks.png`) con las curvas de tasa de éxito de ataques (ASR, menor es más seguro) y de utilidad (mayor es mejor), pero no se proporcionan cifras concretas ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~8.770 millones de parámetros, en bfloat16 el peso ocupa aproximadamente 17,5 GB (coincide con el tamaño del repo); se necesita margen adicional para activaciones y caché KV.
- GPU recomendadas: A100 (40/80 GB) o H100 para bfloat16 sin cuantizar; GPUs de 24 GB como RTX 4090 pueden requerir cuantización o técnicas de offloading.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) con cuantización de 8 bits o menor; en bfloat16 completo resulta ajustado o inviable según la longitud de contexto.
- Opciones de despliegue: el autor documenta carga con `transformers` (`Qwen3VLForConditionalGeneration` y `AutoProcessor`, `device_map="auto"`); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Layer17-Zero-Ablation | 8.767.123.696 | no disponible | apache-2.0 | Checkpoint de ablación, 0 descargas | MLP de capa 17 a cero; rechazo preservado |
| Qwen/Qwen3-VL-8B-Instruct | ~8.770 millones | no disponible | apache-2.0 | Modelo base oficial | Referencia frente a la que se compara la ablación |
| Otros modelos vision-lenguaje de ~8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación con alternativas de la misma categoría (otros VLM de ~8B) no está disponible en la información proporcionada; el único contraste documentado es con el modelo base Qwen3-VL-8B-Instruct.

## Limitaciones y advertencias

- No es un modelo para producción: es un checkpoint de investigación con pesos deliberadamente dañados (MLP de capa 17 anulada); su utilidad general puede estar degradada y no se han publicado cifras de utilidad.
- El autor solo documenta que la tasa de rechazo se mantiene; no garantiza que otras capacidades (razonamiento, visión, código) no se hayan visto afectadas.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; se heredan los del modelo base, sin análisis específico.
- Licencia apache-2.0: permite uso comercial según los términos de la licencia, pero el estado de ablación lo hace inadecuado para ello en la práctica.
- Idiomas y longitud de contexto no documentados en la model card.
- Sin adopción ni validación externa: cero descargas y cero likes, sin revisión por pares documentada en la información disponible.
- Las gráficas de benchmarks no incluyen cifras numéricas en la información proporcionada, lo que limita la verificación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnirudhNarayan/Qwen3-VL-8B-Layer17-Zero-Ablation
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Gráfica de ASR: `ablation_asr_benchmarks.png` (en el repositorio del modelo)
- Gráfica de utilidad: `ablation_utility_benchmarks.png` (en el repositorio del modelo)
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
