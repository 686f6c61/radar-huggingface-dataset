# RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3b-code-shuffled

## Resumen

El modelo `code-sft-rerun-20261102-qwen3b-code-shuffled` es un artefacto de investigación publicado por el colectivo `RL-Forgettting-Exp4` en el marco de una serie de experimentos sobre *machine unlearning* o "olvido" en modelos de lenguaje (etiqueta `rl-forgetting`). Se trata de un ajuste fino supervisado (SFT) sobre Qwen2.5-3B orientado a tareas de código, ejecutado el 2 de noviembre de 2026 como parte de un conjunto de trece "brazos" de entrenamiento recién ejecutados. El sufijo `code-shuffled` indica que los datos de entrenamiento se presentaron en orden aleatorio, una variante experimental dentro de una matriz que compara ordenaciones ordered/shuffled/uniform/hard/CE.

El modelo no es un lanzamiento de producción, sino un checkpoint de investigación destinado a estudiar cómo afecta la secuenciación de datos de código al olvido de capacidades previas. El entrenamiento se realizó con un learning rate de 1e-5, una época, semilla 42, batch efectivo de 256, micro-batch de 1, 4096 tokens de contexto y replay lambda 1.0, sobre 4 GPU H100, con 10 guardados de checkpoint por brazo. El repositorio ocupa 12,4 GB e incluye pesos en safetensors, estado de recuperación, métricas y manifiestos de entrega.

Su relevancia es fundamentalmente metodológica: forma parte de un corpus reproducible de experimentos de olvido selectivo con trazabilidad completa (manifiestos de entrega, commits inmutables y evaluaciones puntuadas por ejecución en MBPP+). No debe confundirse con un modelo base listo para uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-3B) |
| Parámetros totales | no disponible (modelo base Qwen2.5-3B, aproximadamente 3 mil millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento declarada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (derivados de Qwen2.5-3B sujetos a Qwen Research License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-3B, un transformer decoder-only con atención causal estándar. El ajuste fino se ejecutó en una sola época con learning rate 1e-5, semilla 42, batch efectivo 256 (micro-batch 1), secuencias de 4096 tokens y replay lambda 1.0, empleando 4 GPU H100. Se guardaron 10 checkpoints por brazo, accesibles en `runs/checkpoints/step_N/model` y `runs/final` dentro de los repositorios de modelo correspondientes.

La variante `code-shuffled` se distingue por presentar los datos de código en orden aleatorio, en contraste con las variantes ordered, uniform, hard y CE del mismo experimento. El objetivo es medir el efecto de la secuenciación de datos sobre el olvido de capacidades y sobre la retención de conocimiento. El repositorio incluye entradas exactas, código fuente, estado de recuperación retenido y métricas, lo que permite reproducir el experimento. No se documenta el volumen total de tokens de entrenamiento ni la composición exacta del dataset más allá de su carácter de código.

## Capacidades

- Generación de texto y código: al derivar de Qwen2.5-3B con SFT sobre datos de código, conserva capacidad de generación y completado de código.
- Razonamiento y matemáticas: capacidad heredada del modelo base, no evaluada de forma específica en la información disponible.
- Tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas no están disponibles en la ficha.
- Capacidades especiales: no se declaran modos de *thinking*, visión ni audio.
- Evaluación: se referencia una evaluación en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`, centrada en código (MBPP+).

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como brazo de control para medir cuánto olvida un modelo tras un SFT de código con datos mezclados, comparándolo con las variantes ordered y uniform del mismo experimento.
- Reproducción de experimentos de secuenciación de datos: gracias a los manifiestos de entrega y commits inmutables, un equipo puede replicar exactamente el entrenamiento y verificar los resultados publicados.
- Estudio de retención de capacidades: útil para analizar si el SFT de código degrada el rendimiento en tareas generales y cómo influye el orden de los datos.
- Evaluación de pipelines de SFT: sirve como referencia para validar infraestructuras de entrenamiento distribuidas en 4×H100 con checkpoints intermedios.
- Análisis de evaluación en MBPP+: el repositorio incluye evaluaciones puntuadas por ejecución, útil para estudiar la fiabilidad de benchmarks de código.
- Base para experimentos de *replay*: con replay lambda 1.0, permite estudiar el efecto de la mezcla de datos de replay sobre el olvido.
- Docencia y formación: ejemplo reproducible de un experimento controlado de olvido con trazabilidad completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card únicamente referencia la existencia de evaluaciones en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~3B parámetros en fp16 se estiman en torno a 6-7 GB, y en cuantización de 4 bits alrededor de 2-3 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el entrenamiento se realizó en 4×H100; para inferencia basta una GPU consumer de gama media-alta.
- Compatibilidad con GPU consumer: probable en RTX 3090/4090 y superiores, aunque no está verificado por el autor.
- Opciones de despliegue: no documentadas; al ser safetensors, requeriría conversión a GGUF para llama.cpp u Ollama, o carga directa en vLLM/TGI con los ficheros originales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3b-code-shuffled | ~3B (Qwen2.5-3B) | 4096 | other (Qwen Research License) | Hugging Face, 0 descargas |
| Qwen2.5-3B (base) | ~3B | 32K (según versión) | Qwen Research License | Ampliamente disponible |
| Qwen3-1.7B-Base (brazo del mismo experimento) | ~1.7B | no disponible | Apache 2.0 | Hugging Face |
| Llama-3.2-3B-Instruct (brazo del mismo experimento) | ~3B | no disponible | Llama 3.2 Community License | Hugging Face |

La comparación con el modelo base Qwen2.5-3B es la más directa: este checkpoint añade un SFT de código con datos mezclados, pero no documenta mejoras medibles frente al base. Los otros dos brazos del experimento (Qwen3-1.7B-Base y Llama-3.2-3B-Instruct) permiten comparar el efecto del olvido entre arquitecturas y tamaños bajo el mismo protocolo.

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación con 0 descargas y 0 likes, sin validación externa.
- Licencia restrictiva: los derivados de Qwen2.5-3B retienen la Qwen Research License, que puede limitar el uso comercial. No se conceden derechos adicionales sobre los modelos upstream.
- Idiomas no documentados: no se especifica qué lenguas cubre el SFT ni el modelo base en esta ficha.
- Riesgo de alucinación: inherente a los modelos de ~3B parámetros; no se han publicado evaluaciones de fidelidad.
- Contexto limitado: 4096 tokens de entrenamiento, inferior a los 32K que suele ofrecer Qwen2.5-3B en su versión estándar.
- Sin benchmarks publicados: no hay cifras de MMLU, HumanEval ni GSM8K que permitan evaluar su calidad real.
- Naturaleza experimental: el objetivo declarado es estudiar el olvido, por lo que el rendimiento en tareas generales puede haberse degradado deliberadamente.
- Trazabilidad fragmentada: los artefactos se reparten entre dos organizaciones (`RL-Forgetting-Experiments-3` y `RL-Forgettting-Exp4`), lo que complica su uso directo.

## Enlaces

- Hugging Face: https://huggingface.co/RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3b-code-shuffled
- Manifiesto de entrega: `delivery_manifest.json` (en el repositorio)
- Evaluaciones: `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` (en el repositorio)
- Procedencia de la petición: `request-provenance.json` (en el repositorio)
- Repositorio complementario: `RL-Forgetting-Experiments-3` (organización en Hugging Face)
