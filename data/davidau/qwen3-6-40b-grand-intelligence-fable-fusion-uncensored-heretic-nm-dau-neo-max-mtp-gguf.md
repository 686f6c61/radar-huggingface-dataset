# DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF es un fine-tune de gran escala publicado por DavidAU sobre la base Qwen3.6 de 27B, expandido a 40B mediante una expansión de parámetros y fusionado a partir de cinco variantes de la familia Fable Fusion (711 y una versión 717 no publicada). El modelo se distribuye exclusivamente en formato GGUF, con cuantizaciones "regular" y "MTP" (Multi-Token Prediction) generadas con imatrix, y está pensado para ejecutarse en hardware de consumo. La model card lo presenta como un modelo "todo uso" con modo de razonamiento (thinking), capacidades de código, escritura creativa y visión.

El objetivo declarado del autor es mejorar el seguimiento de instrucciones y la resolución de problemas sin degradar los benchmarks del modelo base, mediante un proceso de nueve etapas con sub-etapas de fine-tuning y merge, verificado con tests en cada fase. El modelo incorpora además un proceso de "heretic'ing" y abliteración previo al tuning, orientado a eliminar rechazos en las respuestas.

Es relevante ahora porque se posiciona como una alternativa de 40B ejecutable en GPU de consumo con cuantización de 4 bits, y porque el autor afirma que supera al Qwen 3.6 27B base en 6 de 7 benchmarks y al Qwen3.6-35B-A3B en los 7. No obstante, estas afirmaciones provienen únicamente de la model card y no están respaldadas por una evaluación independiente publicada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.6), con soporte de Multi-Token Prediction (MTP) en las cuantizaciones; multimodal image-text-to-text |
| Parámetros totales | 40B (según nombre y model card); el campo `safetensors` del repo indica 460.730.096, dato inconsistente con el nombre y el tamaño del repo (294,6 GB), por lo que se trata de un valor no fiable |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF "regular" y GGUF "MTP" (Neo MAX Imatrix), presumiblemente en 4 y 8 bits según la model card; no se detalla la lista completa de niveles |
| Idiomas soportados | en, zh (según metadatos y model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 294,6 GB con múltiples cuantizaciones); el modelo base del que deriva se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.6 y se construye mediante una expansión de parámetros de 27B a 40B, seguida de un proceso de nueve etapas con múltiples sub-etapas que combina fine-tuning multi-etapa y merge multi-estado. Se fusionaron cinco versiones de la familia Fable Fusion (711 y 717) junto con fine-tunes propios del autor, incluyendo varios ciclos de "heretic'ing". El entrenamiento se realizó con Unsloth en hardware de consumo, según declara la model card.

Los datos de entrenamiento combinan los datasets internos Polar-STRICT y F451, trazas ligeras de "Fable" (aportadas por armand0e), trazas de razonamiento/thinking de Claude Opus, y datos de GPT-5 (Polaris, no razonamiento). No se especifica el número de tokens ni la composición cuantitativa del dataset. La innovación técnica destacada es la reducción a la mitad de los tokens de thinking respecto a los Qwen "normales", junto con las cuantizaciones MTP con imatrix, que el autor presenta como especialmente robustas en niveles bajos de cuantización.

## Capacidades

- Generación de texto y razonamiento con modo thinking explícito, con bloques de pensamiento más profundos y menor número de tokens de razonamiento.
- Generación de código (tag `coder` en los metadatos).
- Escritura creativa, ficción, roleplaying y narrativa de todos los géneros.
- Capacidades de visión (pipeline `image-text-to-text` y mención explícita en la model card).
- Seguimiento de instrucciones mejorado, objetivo central del proceso de tuning.
- Multilingüe limitado a inglés y chino según los metadatos.
- Modelo "uncensored" y "abliterated": entrenado para reducir rechazos.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo está entrenado específicamente para ficción, roleplaying y todos los géneros, con énfasis declarado en profundidad de detalle y voz narrativa, lo que lo hace adecuado para generación de relatos y diálogos consistentes.
- Asistencia a la escritura técnica y analítica: la model card destaca "long form" y "in-depth analytics", útil para informes extensos y análisis documental.
- Razonamiento con presupuesto de tokens reducido: al producir aproximadamente la mitad de tokens de thinking que un Qwen estándar, encaja en entornos donde el coste por consulta o la latencia importan.
- Despliegue local en hardware de consumo: al distribuirse en GGUF de 4 y 8 bits, permite inferencia en estaciones de trabajo con una sola GPU consumer o incluso CPU+GPU con llama.cpp.
- Generación de código en local: el tag `coder` y el modo thinking permiten usarlo como asistente de programación en entornos sin conexión o con requisitos de privacidad.
- Experimentación en investigación sobre alineación y abliteración: al ser un modelo "heretic" y "uncensored", sirve como objeto de estudio de los efectos de estos procesos sobre capacidades y sesgos.
- Procesamiento de imágenes con descripción textual: el pipeline image-text-to-text permite tareas de captioning y respuesta a preguntas sobre imágenes, aunque no se detallan los benchmarks de visión.

## Benchmarks y rendimiento

La model card afirma que el modelo supera al Qwen 3.6 27B base en 6 de 7 benchmarks y lo iguala en el séptimo, y que supera al Qwen3.6-35B-A3B en los 7. Sin embargo, no se proporcionan en la información disponible las tablas con los valores numéricos de dichos benchmarks.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 40B en GGUF, una cuantización de 4 bits requiere aproximadamente 22-26 GB y una de 8 bits en torno a 42-46 GB, estimaciones que no proceden de la model card.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) quedaría al límite en 4 bits, mientras que A100 40/80 GB o H100 serían necesarias para 8 bits.
- Cabe en GPU de consumo: previsiblemente en 4 bits con GPUs de 24 GB o más, o mediante offload parcial a CPU; no confirmado por el autor.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) al ser formato GGUF; vLLM y TGI no están confirmados para estas cuantizaciones MTP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-40B-Grand-Intelligence (este) | 40B | no disponible | apache-2.0 | GGUF | Fine-tune heretic/uncensored, visión, thinking |
| Qwen3.6-27B-Fable-Fusion-711 (base del autor) | 27B | no disponible | apache-2.0 | GGUF | Modelo del que deriva; el autor afirma que este 40B lo supera en 6 de 7 benchmarks |
| Qwen3.6-35B-A3B | 35B (MoE, A3B) | no disponible | no disponible | no disponible | El autor afirma que este 40B lo supera en los 7 benchmarks |
| Qwen 3.6 27B (base original) | 27B | no disponible | no disponible | no disponible | Referencia de comparación en la model card |

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": reduce deliberadamente los rechazos, lo que implica mayor riesgo de generar contenido inapropiado, sesgado o dañino sin filtros.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de factualidad publicadas en la información disponible.
- Los benchmarks citados son afirmaciones del autor sin tabla numérica ni verificación independiente en esta ficha.
- Inconsistencia de metadatos: el campo de parámetros en safetensors (460 millones) contradice el nombre y el tamaño del repo, lo que dificulta verificar el tamaño real.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Contexto no especificado: no se puede garantizar el comportamiento en ventanas largas.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de evaluación de sesgos y seguridad traslada al desplegador la responsabilidad de filtrado y moderación.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.
- El proceso de "heretic'ing" puede degradar capacidades generales; el autor afirma lo contrario, pero no hay evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic
- Modelo Qwen3.6-27B-Fable-Fusion-711 (origen de los núcleos): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Discusión de benchmarks del 27B: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF/discussions
- Modelo de control Qwen3.5-9B-The-Defiant: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
