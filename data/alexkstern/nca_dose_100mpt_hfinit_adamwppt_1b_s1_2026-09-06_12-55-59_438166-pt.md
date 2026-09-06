# alexkstern/nca_dose_100Mpt_hfinit_adamwppt_1B_s1_2026-09-06_12-55-59_438166-pt

## Resumen

El modelo `nca_dose_100Mpt_hfinit_adamwppt_1B_s1` es un checkpoint experimental de tipo GPT entrenado con la librería nanochat de Karpathy. Su autor, alexkstern, lo publica en HuggingFace como parte de una serie de experimentos sobre la dosis de tokens ("token dose") aplicada tras el preentrenamiento. El modelo se somete a una fase de preentrenamiento de 100 millones de tokens con el dataset FineWeb y, posteriormente, a una fase de post-entrenamiento de 1.000 millones de tokens con un dataset llamado nca-paper-share20-2048, que reduce el vocabulario de 65.536 a 10.004 tokens. La arquitectura es un transformer decoder-only con 16 capas y dimensiones de modelo de 1.024. Este checkpoint se publica en el paso 1.525 y contiene los pesos en formato `.pt` de PyTorch. Su relevancia radica en que permite estudiar el impacto de la cantidad de tokens de post-entrenamiento y del cambio de vocabulario en un modelo pequeño, una línea de investigación dentro del desarrollo de modelos de lenguaje eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (state_dict de PyTorch) |

Nota: la configuración indica un modelo con 16 capas, 8 cabezas de atención, 8 cabezas KV y 1.024 dimensiones de embedding. El repositorio ocupa 3,0 GB, pero el número exacto de parámetros no se proporciona.

## Arquitectura y entrenamiento

El modelo usa una arquitectura de transformer estándar, con 16 capas, 8 cabezas de atención y 8 cabezas KV (sin agrupación KV, ya que coinciden con las cabezas de atención), y una dimensión de embedding de 1.024. El preentrenamiento se realiza con el dataset `fineweb-nanochatbpe-100M` durante 100 millones de tokens, con un vocabulario de 65.536 tokens. A continuación, el modelo se somete a una fase de post-entrenamiento con el dataset `nca-paper-share20-2048` durante 1.000 millones de tokens, reduciendo el vocabulario a 10.004 tokens y reinicializando las capas de embedding y unembedding en la transición. El optimizador utiliza tasas de aprendizaje diferenciadas: 0,02 para las matrices, 0,3 para embeddings y 0,004 para unembedding, con una programación trapezoidal sin warmup en el preentrenamiento y con un 10% de warmup en la fase posterior. El checkpoint corresponde al paso 1.525 y registra una pérdida de entrenamiento suavizada de 3,594. No se mencionan técnicas como RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto: el modelo puede generar texto a partir de un prompt, aunque su calidad no ha sido evaluada públicamente.
- Razonamiento básico: los modelos de esta escala tienen una capacidad limitada de razonamiento, pero no se han publicado evaluaciones específicas.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no especificadas; se desconoce la distribución de idiomas del corpus.
- Capacidades especiales: no hay evidencia de soporte de vision, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación académica sobre token dose: el modelo permite reproducir experimentos sobre el efecto de la cantidad de tokens de post-entrenamiento en modelos pequeños, comparando este checkpoint con otros de la misma serie (por ejemplo, con 5M o 100M tokens).
- Evaluación de vocabularios reducidos: al cambiar el vocabulario de 65.536 a 10.004 tokens, este checkpoint sirve para estudiar cómo afecta la compresión del vocabulario a la calidad del modelo.
- Análisis de dinámicas de optimización: el uso de tasas de aprendizaje diferenciadas por parámetro y la programación trapezoidal son útiles para investigar el comportamiento del optimizador AdamW en modelos pequeños.
- Entrenamiento de referencia para nanochat: al ser un checkpoint generado con nanochat, permite validar y comparar resultados con otras configuraciones de la misma librería.
- Pruebas de personalización de vocabulario: dado que el modelo final tiene un vocabulario de 10.004 tokens, puede usarse como base para experimentar con tokenizadores específicos de dominio.
- Docencia en aprendizaje automático: el modelo sirve como ejemplo práctico de un checkpoint intermedio de un pipeline de entrenamiento en dos fases, permitiendo a estudiantes analizar configuraciones de entrenamiento reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card solo incluye métricas de entrenamiento: pérdida suavizada de 3,594, un objetivo mínimo de 1,137, 2,079e17 FLOPs utilizados y un tiempo total de entrenamiento de 689,57 segundos.

## Requisitos de hardware

- VRAM estimada: no disponible. No se proporcionan requisitos oficiales. Dado el tamaño del checkpoint (3,0 GB), se necesitaría al menos esa cantidad de memoria para cargar los pesos en formato sin comprimir.
- GPU recomendada: no disponible. Por el tamaño del modelo, podría ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero no hay confirmación oficial.
- Compatibilidad con GPU de consumo: probablemente sí, al tratarse de un modelo pequeño, aunque no se ha confirmado.
- Opciones de despliegue: el formato de los pesos es `.pt` de PyTorch, por lo que puede cargarse directamente con PyTorch. Para usar en frameworks como llama.cpp u Ollama, sería necesario convertir los pesos a un formato compatible (por ejemplo, GGUF), lo cual no está documentado.
- Latencia y throughput: no disponibles.

Nota: la falta de información sobre requisitos de hardware y latencia hace que estas consideraciones sean meramente orientativas.

## Comparativa con modelos similares

No se ha encontrado información comparativa publicada. El autor mantiene una serie de checkpoints similares en HuggingFace, como `nca_dose_100Mpt_hfinit_5M_s2` y `nca_dose_100Mpt_100M_s2`, que probablemente comparten arquitectura pero varían en la cantidad de tokens de post-entrenamiento. Sin embargo, no se dispone de datos de rendimiento para comparar de forma rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al entrenarse con FineWeb puede heredar los sesgos presentes en ese corpus web.
- Riesgo de alucinación: al ser un modelo pequeño con escasos datos de entrenamiento, el riesgo de alucinación es significativo, especialmente fuera del dominio de los datos de entrenamiento.
- Limitaciones de contexto o idioma: la ventana de contexto es de 2.048 tokens, relativamente corta. El idioma dominante es probablemente el inglés, dado que FineWeb está compuesto en su mayoría por texto en inglés, aunque no se especifica.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, sin restricciones relevantes más allá de la atribución y la inclusión del aviso de licencia.
- Caveat para producción: no se han publicado evaluaciones de calidad ni de seguridad. El modelo se encuentra en fase experimental y no debería usarse en sistemas de producción sin una validación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_100Mpt_hfinit_adamwppt_1B_s1_2026-09-06_12-55-59_438166-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- W&B run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/qi1sjc86
- Checkpoint relacionado: https://huggingface.co/alexkstern/nca_dose_100Mpt_hfinit_5M_s2_2026-08-14_21-34-59_996806-pt
- Checkpoint relacionado: https://huggingface.co/alexkstern/nca_dose_100Mpt_100M_s2_2026-08-15_01-55-48_599380-pt
