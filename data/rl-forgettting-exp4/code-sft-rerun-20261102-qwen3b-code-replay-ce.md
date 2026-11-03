# RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3b-code-replay-ce

## Resumen

`code-sft-rerun-20261102-qwen3b-code-replay-ce` es un checkpoint de ajuste supervisado (SFT) sobre Qwen2.5-3B, publicado por el colectivo de investigación RL-Forgettting-Exp4. Forma parte de una batería de trece ejecuciones de entrenamiento orientadas a estudiar el olvido catastrófico (catastrophic forgetting) durante el ajuste fino en tareas de código, con variantes de ordenación de datos (ordered, shuffled, uniform, hard) y de función de pérdida (CE, cross-entropy). El nombre del artefacto indica que esta unidad concreta corresponde a la variante con replay y pérdida CE sobre el modelo base Qwen de 3B parámetros.

El modelo no es un lanzamiento de producto sino un artefacto experimental: el repositorio contiene pesos en formato safetensors (12,4 GB) y está pensado para reproducibilidad de experimentos, no para uso directo en producción. La model card remite a ficheros de procedencia (`delivery_manifest.json`, `request-provenance.json`) para verificar unidades de entrenamiento y evaluaciones, lo que confirma su carácter de material de investigación.

Su relevancia actual es metodológica: documenta con detalle hiperparámetros (lr 1e-5, una época, seed 42, batch efectivo 256, 4096 tokens de contexto de entrenamiento, 4×H100) y permite comparar el efecto del replay y la selección de datos sobre la retención de capacidades del modelo base. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen2.5-3B; arquitectura del base no detallada en la información) |
| Parametros totales | no disponible (el nombre del artefacto indica base Qwen de 3B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (longitud usada en entrenamiento; contexto nativo del base no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other (derivados de Qwen2.5-3B retienen la Qwen Research License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es el resultado de un ajuste supervisado sobre Qwen2.5-3B con un esquema de replay (lambda 1.0) y pérdida de entropía cruzada (CE). El entrenamiento se ejecutó durante una época con learning rate 1e-5, seed 42, batch efectivo 256 (micro-batch 1), secuencias de 4096 tokens y 4 GPU H100, guardando 10 checkpoints por brazo experimental. Los pesos finales y los checkpoints intermedios se almacenan en `runs/checkpoints/step_N/model` y `runs/final` dentro de los repositorios de modelo correspondientes.

La innovación metodológica no está en la arquitectura (se hereda la del modelo base Qwen2.5-3B, un transformer decoder-only) sino en el diseño experimental: comparar ordenaciones de datos (ordered, shuffled, uniform, hard) y funciones de pérdida para medir el olvido de capacidades previas tras el SFT en código. El mecanismo de replay con lambda 1.0 busca mitigar ese olvido reintroduciendo datos de la distribución original durante el ajuste. No se detalla en la información disponible la composición exacta del dataset de código ni si hubo RLHF o DPO posteriores.

## Capacidades

- Generación de código: el ajuste se realiza sobre tareas de coding-SFT, por lo que el modelo está especializado en síntesis y edición de código.
- Razonamiento y generación de texto: hereda las capacidades del modelo base Qwen2.5-3B, aunque no se documentan evaluaciones específicas en este artefacto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Replay de datos: el entrenamiento incorpora replay con lambda 1.0, orientado a preservar capacidades previas del modelo base.

## Casos de uso

- Investigación sobre olvido catastrófico: el checkpoint sirve como punto de comparación frente a las otras variantes (ordered, shuffled, uniform, hard) para medir cuánta capacidad del base se retiene tras el SFT en código.
- Reproducción de experimentos: los ficheros `delivery_manifest.json` y `request-provenance.json` permiten reconstruir la unidad de entrenamiento exacta, útil para replicar resultados en entornos de investigación.
- Estudio del efecto del replay: al fijar lambda 1.0 y variar la ordenación de datos, se puede aislar la contribución del replay a la retención de conocimiento.
- Evaluación de checkpoints intermedios: los 10 checkpoints por brazo permiten analizar la evolución del olvido a lo largo del entrenamiento, no solo en el modelo final.
- Base para ajuste posterior en código: un equipo puede partir de este checkpoint como inicialización para tareas de generación de código, aunque deberá validar antes la retención de capacidades generales.
- Docencia y formación: útil como ejemplo documentado de pipeline de SFT con replay, hiperparámetros explícitos y trazabilidad de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona evaluaciones en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` (MBPP+, 160 muestras, temperatura 0.6), pero no se incluyen las puntuaciones en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repo (12,4 GB en safetensors) se infiere un modelo de ~3B parámetros en precisión de 16 bits, lo que requeriría aproximadamente 6-8 GB de VRAM en fp16 y menos con cuantización de 8 o 4 bits.
- GPU recomendadas: el entrenamiento se realizó con 4×H100; para inferencia, una GPU con al menos 8-12 GB de VRAM sería suficiente en fp16, aunque no se confirma en la documentación.
- GPU de consumo: probablemente cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 en fp16 o cuantizado, pero no está verificado en la información disponible.
- Opciones de despliegue: no disponibles (no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3b-code-replay-ce | ~3B (base Qwen2.5-3B) | 4096 (entrenamiento) | other (Qwen Research License) | HuggingFace, 0 descargas | Artefacto experimental de investigación |
| Qwen2.5-3B (base) | 3B | no disponible en esta ficha | Qwen Research License | HuggingFace | Modelo base del que deriva |
| Qwen3-1.7B-Base | 1,7B | no disponible en esta ficha | Apache 2.0 | HuggingFace | Usado en otras variantes del mismo estudio |
| Llama-3.2-3B-Instruct | 3B | no disponible en esta ficha | Llama 3.2 Community License | HuggingFace | Usado en otras variantes del mismo estudio |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo listo para producción; su propósito es medir olvido catastrófico, no ofrecer un asistente de código pulido.
- Licencia restrictiva: los derivados de Qwen2.5-3B retienen la Qwen Research License, lo que puede limitar el uso comercial. La licencia del repo figura como "other".
- Idiomas no documentados: no se especifica qué idiomas conserva el modelo tras el SFT, por lo que el rendimiento multilingüe es incierto.
- Riesgo de olvido: el propio diseño del experimento sugiere que el SFT puede degradar capacidades del base; el replay con lambda 1.0 mitiga pero no garantiza la retención total.
- Riesgo de alucinación: no evaluado en la información disponible; los modelos de 3B tienden a alucinar en tareas de código y razonamiento complejo.
- Contexto limitado: 4096 tokens en entrenamiento, insuficiente para tareas de código con repositorios grandes.
- Sin benchmarks publicados: no se puede verificar su calidad frente a alternativas sin ejecutar las evaluaciones del manifiesto.
- Trazabilidad dependiente de ficheros auxiliares: la validez de los resultados requiere consultar `delivery_manifest.json` y `request-provenance.json`, que no se incluyen en la información proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3b-code-replay-ce
- Repositorio de artefactos previos: RL-Forgetting-Experiments-3 (referenciado en la model card, sin URL directa en la información disponible)
- Manifiesto de entrega: `delivery_manifest.json` (en el repo)
- Manifiesto de evaluaciones: `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` (en el repo)
- Procedencia de la petición: `request-provenance.json` (en el repo)
- Licencia Qwen Research License: referenciada en LICENSE/NOTICE del repo, sin URL directa en la información disponible
