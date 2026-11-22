# OliverSieberling/transformer-gqa8-1.3b-64k

## Resumen

Transformer 1.3B, 64k es un checkpoint de investigación publicado por Oliver Sieberling (con coautores de Bharat Runwal, David Jin, Ryan Chin, Rameswar Panda y Yoon Kim) que acompaña al artículo *Triadic Linear Attention: Three-Dimensional Recurrent States for Long-Context Sequence Modeling* (arXiv:2609.36529). Se trata de un transformer decoder-only de 1.358 millones de parámetros con 24 capas, dimensión de modelo 2048 y atención con cabeceras agrupadas (GQA) de 16 cabeceras de consulta y 2 de clave-valor, equipado con QK-norm y RoPE. Su interés radica en que sirve como referencia empírica para evaluar mecanismos de atención lineal en contextos largos, no como un modelo listo para producción.

El modelo fue preentrenado sobre 65.000 millones de tokens de FineWeb-Edu con una ventana de 4k tokens y posteriormente extendido a 64k tokens mediante un ajuste adicional sobre 6.800 millones de tokens. Utiliza el tokenizador de Llama-2 y está etiquetado como `linear-attention` y `gated-deltanet`, lo que sugiere que incorpora variantes de atención lineal con estados recurrentes, aunque la model card no detalla la configuración exacta de dichos mecanismos.

Es relevante ahora porque los modelos de contexto largo con atención subcuadrática están en plena exploración y este checkpoint ofrece una línea base reproducible (licencia MIT, pesos en safetensors) para comparar arquitecturas híbridas frente a atención estándar. No obstante, el propio autor indica que requiere una GPU H100 y código externo para su ejecución, lo que limita su uso a entornos de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, QK-norm, RoPE y mecanismos de atención lineal (gated-deltanet) |
| Parámetros totales | 1.358.012.416 (1358,0 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 64.000 tokens (preentrenado a 4k, extendido a 64k) |
| Tipos de cuantización | no disponible (solo se distribuyen pesos safetensors en precisión original) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 24 capas con `d_model` de 2048, 16 cabeceras de consulta y 2 cabeceras clave-valor (GQA), normalización QK y embeddings rotatorios (RoPE). Incorpora mecanismos de atención lineal etiquetados como `gated-deltanet`, coherentes con la propuesta de *Triadic Linear Attention* del artículo asociado, que plantea estados recurrentes tridimensionales para modelar secuencias largas. La model card no especifica el número exacto de capas que usan atención lineal frente a atención estándar, ni la proporción de mezcla entre ambas.

El preentrenamiento se realizó sobre 65.000 millones de tokens de FineWeb-Edu con contexto de 4k tokens, seguido de una fase de extensión de contexto a 64k tokens sobre 6.800 millones de tokens adicionales. No se menciona en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones; se trata de un checkpoint base. Tampoco se detalla la composición exacta del dataset más allá de FineWeb-Edu ni innovaciones como decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt.
- Modelado de lenguaje de contexto largo: ventana de hasta 64k tokens, con evaluación específica en PG19 hasta 64k.
- Recuperación de información en contexto (evaluada con tareas Recall y NIAH, con resultados de 50,8 y 58,5 respectivamente).
- Razonamiento básico y conocimiento general derivados del preentrenamiento (evaluación 0-shot reportada con valor 60,2, sin especificar la métrica exacta).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Investigación en atención lineal: el checkpoint permite reproducir y comparar los resultados del artículo *Triadic Linear Attention* frente a transformers con atención estándar en tareas de contexto largo, usando el código del repositorio asociado.
- Evaluación de extensión de contexto: sirve para estudiar cómo se degrada la perplejidad entre 4k y 64k tokens (PG19 muestra 11,08 en ≤4k, 10,37 en 4k–16k y 10,04 en 16k–64k), un caso práctico para analizar curvas de olvido en modelos de contexto extendido.
- Benchmark de recuperación en contexto largo: con resultados de NIAH de 58,5 y Recall de 50,8, es útil como línea base para medir la eficacia de mecanismos de atención lineal en tareas de *needle in a haystack*.
- Estudio de eficiencia computacional: al combinar atención lineal con GQA, permite medir consumo de memoria y throughput frente a atención cuadrática en secuencias de decenas de miles de tokens.
- Fine-tuning experimental: al estar bajo licencia MIT y en safetensors, puede adaptarse con LoRA o ajuste completo en entornos de investigación para tareas downstream en inglés, siempre que se disponga de hardware adecuado.
- Reproducibilidad académica: facilita la verificación de resultados del paper por parte de revisores y otros grupos, dado que los pesos y el código están publicados abiertamente.

## Benchmarks y rendimiento

Resultados reportados en la model card (0-shot):

| Métrica | Valor |
|---|---|
| 0-shot (métrica no especificada) | 60,2 |
| WikiText (perplejidad) | 8,01 |
| PG19 ≤4k (perplejidad) | 11,08 |
| PG19 4k–16k (perplejidad) | 10,37 |
| PG19 16k–64k (perplejidad) | 10,04 |
| Recall | 50,8 |
| NIAH | 58,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1358 M de parámetros en fp16 se requieren aproximadamente 2,7 GB solo para pesos, más memoria para activaciones y caché KV, que crece con la longitud de contexto.
- GPU recomendadas: el autor indica explícitamente que se requiere una H100 para ejecutar el modelo con el código proporcionado.
- Compatibilidad con GPU de consumo: no confirmada; el requisito de H100 y la dependencia de código personalizado sugieren que no está optimizado para RTX 4090 u otras GPU de consumo, aunque el tamaño de parámetros en teoría cabría en VRAM de 8–12 GB en fp16.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la model card solo muestra carga manual con `safetensors` y el módulo `model.py` del repositorio TriadicLinearAttention.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Transformer 1.3B, 64k (este modelo) | 1358 M | 64k | MIT | Pesos safetensors, requiere código externo | Checkpoint de investigación con atención lineal |
| Alternativas de ~1.3B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa numérica con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está alineado para seguir instrucciones ni para conversación; su uso directo en producción requeriría fine-tuning adicional.
- Idioma limitado al inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación inherente a un modelo de lenguaje preentrenado sin RLHF; no se han publicado evaluaciones de factualidad.
- Los resultados de Recall (50,8) y NIAH (58,5) indican que la recuperación en contexto largo es imperfecta y puede fallar en tareas que exijan localizar información en posiciones lejanas.
- Requiere una GPU H100 y código personalizado del repositorio TriadicLinearAttention; no hay soporte documentado para frameworks de inferencia estándar, lo que dificulta su despliegue.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita su uso en hardware de consumo.
- Licencia MIT permite uso comercial, pero al ser un checkpoint de investigación sin garantías, el usuario asume el riesgo de validación.
- Sin datos sobre sesgos; al entrenarse con FineWeb-Edu, puede heredar sesgos del corpus web filtrado.
- Fecha de creación indicada como 2026-11-22, posterior a la fecha actual del entorno; conviene verificar la vigencia del recurso.

## Enlaces

- Hugging Face: https://huggingface.co/OliverSieberling/transformer-gqa8-1.3b-64k
- Paper (arXiv): https://arxiv.org/abs/2609.36529
- Repositorio de código: https://github.com/OliverSieberling/TriadicLinearAttention
