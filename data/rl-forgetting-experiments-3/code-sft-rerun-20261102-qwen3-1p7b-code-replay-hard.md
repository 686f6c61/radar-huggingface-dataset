# RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3-1p7b-code-replay-hard

## Resumen

Este repositorio no contiene un modelo de propósito general, sino un artefacto de investigación derivado de Qwen3-1.7B-Base, entrenado mediante SFT sobre código con una estrategia de *replay* (repetición de datos previos) destinada a mitigar el olvido catastrófico durante el ajuste fino. Forma parte de una batería de trece ejecuciones ("arms") lanzadas el 2 de noviembre de 2026 por el grupo RL-Forgetting-Experiments-3, que compara distintas configuraciones de ordenación y selección de datos (ordered, shuffled, uniform, hard, CE) sobre varias familias de modelos base. El nombre del repositorio (`code-sft-rerun-20261102-qwen3-1p7b-code-replay-hard`) identifica la variante con selección de muestras "hard" y replay con lambda 1.0.

El modelo base es Qwen3-1.7B-Base, un transformer denso de aproximadamente 1.700 millones de parámetros con licencia Apache 2.0 según la model card. El entrenamiento se realizó con learning rate 1e-5, una época, semilla 42, batch efectivo de 256 (micro-batch 1), contexto de 4096 tokens y 4 GPUs H100, guardando 10 checkpoints por ejecución. El objetivo científico es medir cuánto conocimiento previo se retiene tras un SFT intensivo en código y si el replay lo preserva.

Su relevancia es metodológica más que de producto: sirve como referencia reproducible para estudiar olvido catastrófico en modelos pequeños de código, y como punto de comparación frente a las otras doce variantes del mismo experimento. No está pensado para despliegue en producción ni cuenta con evaluaciones de calidad general publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B-Base) |
| Parametros totales | ~1.700 millones (modelo base Qwen3-1.7B-Base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (derivado de Qwen3-1.7B-Base, Apache 2.0 según la model card) |
| Formato de pesos | no disponible (checkpoints bajo `runs/checkpoints/step_N/model` y `runs/final`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint Qwen3-1.7B-Base, un transformer denso decoder-only. El entrenamiento se ejecutó con learning rate 1e-5, una sola época, semilla 42, batch efectivo de 256 con micro-batch 1, secuencias de 4096 tokens y 4 GPUs H100. Se guardaron 10 checkpoints por ejecución, accesibles en `runs/checkpoints/step_N/model` y en `runs/final` dentro de los repositorios de modelos correspondientes.

La innovación metodológica es la estrategia de *replay* con lambda 1.0 combinada con selección de muestras "hard": se reinyectan ejemplos previos durante el SFT de código para reducir el olvido catastrófico. El repositorio es un artefacto de trazabilidad que incluye `request-provenance.json`, `delivery_manifest.json` y `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`, con las entradas exactas, el código fuente, el estado de recuperación retenido y las métricas. No se especifica en la información disponible la composición del dataset de código ni el volumen total de tokens.

## Capacidades

- Generación de código: el entrenamiento se centra en tareas de programación (coding SFT), por lo que se espera competencia en síntesis y completado de código, aunque no hay evaluaciones de calidad publicadas en la información disponible.
- Razonamiento y matemáticas: capacidades heredadas de Qwen3-1.7B-Base; no se documentan métricas específicas tras el ajuste.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no se declaran.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Retención de conocimiento previo: objeto principal del experimento, medido mediante replay y evaluaciones registradas en los manifiestos del repositorio.

## Casos de uso

- Investigación sobre olvido catastrófico: usar este checkpoint como una de las trece variantes controladas para medir la degradación de capacidades generales tras SFT de código, comparando métricas entre arms con distinto orden y selección de datos.
- Reproducción de experimentos: el repositorio incluye `request-provenance.json` y manifiestos de entrega que permiten replicar exactamente las condiciones de entrenamiento (lr, semilla, batch, GPUs) en un entorno con 4 H100.
- Estudio de estrategias de replay: analizar el efecto de lambda 1.0 y de la selección "hard" frente a las variantes ordered, shuffled, uniform y CE del mismo conjunto de ejecuciones.
- Evaluación en benchmarks de código: ejecutar el checkpoint sobre MBPP+ (el manifiesto referencia `mbppplus_n160_t0.6`) para comparar la calidad de código entre arms.
- Base para ajustes posteriores en dominios específicos: al ser un derivado de un modelo de 1.7B con licencia permisiva en origen, puede servir como punto de partida para experimentos académicos de adaptación.
- Docencia y formación: ilustrar en cursos de ML práctico cómo se estructura un artefacto de investigación reproducible con checkpoints intermedios y manifiestos de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio referencia evaluaciones en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`, pero los valores numéricos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo denso de ~1.7B en FP16 se requieren aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: el entrenamiento se realizó en 4× H100; para inferencia basta una GPU única de gama media-alta.
- GPU de consumo: previsiblemente cabe en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) en FP16 o cuantización de 8 bits, aunque no se confirma en la información disponible.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni el formato de pesos exportado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3-1p7b-code-replay-hard | ~1,7B | 4096 | other (base Apache 2.0) | HuggingFace, 0 descargas | Artefacto de investigación, sin benchmarks publicados |
| Qwen3-1.7B-Base | ~1,7B | no disponible en esta ficha | Apache 2.0 | HuggingFace | Modelo base original, sin SFT de código |
| Qwen2.5-3B (variantes del mismo experimento) | ~3B | no disponible en esta ficha | Qwen Research License | HuggingFace | Otras arms del mismo conjunto de ejecuciones |
| Llama-3.2-3B-Instruct (variantes del mismo experimento) | ~3B | no disponible en esta ficha | Llama 3.2 Community License | HuggingFace | Otras arms del mismo conjunto de ejecuciones |

## Limitaciones y advertencias

- Modelo de investigación: no es un producto; no hay evaluaciones de calidad general, seguridad ni alineación publicadas en la información disponible.
- Sesgos: no documentados; al derivar de Qwen3-1.7B-Base, hereda los sesgos del corpus de entrenamiento original, no caracterizados aquí.
- Riesgo de alucinación: no evaluado; el SFT de código puede degradar capacidades generales si el replay no es suficiente, que es precisamente la hipótesis del experimento.
- Contexto limitado a 4096 tokens, insuficiente para tareas de código con repositorios largos.
- Idiomas no declarados; el soporte multilingüe no está garantizado tras el ajuste.
- Licencia "other": los derivados de Qwen3-1.7B-Base conservan Apache 2.0 según la model card, pero el repositorio no concede derechos adicionales sobre los modelos upstream; verificar LICENSE/NOTICE/USE_POLICY antes de cualquier uso.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni validación externa.
- Formato de pesos y pipeline no disponibles: puede requerir conversión manual antes de desplegarse.

## Enlaces

- HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3-1p7b-code-replay-hard
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
