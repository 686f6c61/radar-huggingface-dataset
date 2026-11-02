# RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3-1p7b-code-ordered

## Resumen

El modelo `code-sft-rerun-20261102-qwen3-1p7b-code-ordered` es un ajuste fino supervisado (SFT) sobre la base Qwen3-1.7B-Base, publicado por el colectivo de investigación RL-Forgetting-Experiments-3. Forma parte de un conjunto de trece brazos experimentales ejecutados el 2 de noviembre de 2026 para estudiar el fenómeno del olvido catastrófico durante el ajuste fino orientado a código, comparando distintas estrategias de ordenación de datos (ordered, shuffled, uniform, hard, CE). El modelo no es un producto final, sino un artefacto de investigación reproducible: su propósito es servir de referencia controlada para medir cómo el orden de los datos de entrenamiento afecta a la retención de capacidades previas.

El entrenamiento se realizó durante una época sobre datos de código con una tasa de aprendizaje de 1e-5, semilla 42, batch efectivo de 256 y micro-batch de 1, en 4 GPU H100, con secuencias de 4096 tokens y 10 checkpoints guardados por brazo. Se aplicó replay con lambda 1.0, lo que sugiere que parte del dataset incluye ejemplos de retención de capacidades generales para mitigar el olvido. El repositorio ocupa 6,9 GB e incluye pesos en safetensors, así como artefactos de procedencia y manifiestos de evaluación.

Su relevancia es metodológica más que de producto: permite a investigadores reproducir y auditar experimentos sobre olvido catastrófico en modelos pequeños, y a desarrolladores evaluar si un SFT de código agresivo degrada capacidades no relacionadas. Al derivar de Qwen3-1.7B-Base, hereda la licencia Apache 2.0 del modelo original, aunque la model card declara `license: other` y remite a los ficheros LICENSE/NOTICE del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B-Base) |
| Parámetros totales | 1,7 mil millones (aproximado, según nombre del modelo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens durante entrenamiento; contexto nativo del base no especificado en la información disponible |
| Tipos de cuantización | no disponible en la información proporcionada (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | `other` declarada en la model card; los derivados de Qwen3-1.7B-Base retienen Apache 2.0 según el autor |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no se indica LoRA ni adaptadores) de Qwen3-1.7B-Base, un transformer decoder-only de 1,7 mil millones de parámetros. El entrenamiento consistió en una época de SFT sobre datos de código, con tasa de aprendizaje 1e-5, semilla 42, batch efectivo 256 (micro-batch 1), 4 GPU H100 y secuencias de 4096 tokens. Se guardaron 10 checkpoints por brazo experimental, lo que permite trazar la evolución del olvido a lo largo del entrenamiento.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: el brazo `ordered` se compara con variantes `shuffled`, `uniform`, `hard` y `CE` para aislar el efecto del orden de los datos. Se aplicó replay con lambda 1.0, técnica habitual para mitigar el olvido catastrófico mezclando datos de retención con los datos de la nueva tarea. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO posteriores al SFT.

## Capacidades

- Generación de código: el ajuste SFT está orientado a tareas de programación, presumiblemente generación y completado de código.
- Razonamiento y generación de texto general: heredado del base, aunque potencialmente degradado por el olvido catastrófico objeto del experimento.
- Tool calling / function calling: no confirmado en la información disponible; depende de las capacidades del base Qwen3-1.7B-Base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como brazo de control `ordered` para comparar con las variantes `shuffled`, `uniform`, `hard` y `CE` del mismo experimento, midiendo la retención de capacidades tras el SFT de código.
- Reproducción de experimentos: los manifiestos `delivery_manifest.json` y `request-provenance.json` permiten reconstruir exactamente las entradas, el estado de recuperación y las métricas, lo que facilita la replicación por terceros.
- Evaluación de estrategias de ordenación de datos: útil para decidir si conviene ordenar, barajar o priorizar ejemplos difíciles al construir un dataset de SFT de código.
- Auditoría de degradación de capacidades: al disponer de 10 checkpoints por brazo, se puede trazar en qué paso del entrenamiento se pierden habilidades no relacionadas con código.
- Estudio de técnicas de replay: el uso de replay con lambda 1.0 permite analizar su eficacia para preservar capacidades generales durante el ajuste.
- Base para experimentos derivados: al ser un modelo pequeño (1,7B) y con licencia permisiva en su base, puede servir como punto de partida para nuevos SFT controlados en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` con 160 muestras y temperatura 0,6 sobre MBPP+, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para secuencias de 4096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,7-2,5 GB; en 4 bits, alrededor de 1-1,5 GB (estimaciones basadas en el tamaño de 1,7B, no verificadas en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 son suficientes. Cabe en GPU de consumo.
- Opciones de despliegue: al publicarse en safetensors, requiere conversión a GGUF para llama.cpp u Ollama; es compatible con vLLM y TGI si se dispone de la configuración de arquitectura de Qwen3.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en 4 H100, pero no se documentan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3-1p7b-code-ordered | ~1,7B | 4096 (entrenamiento) | other / Apache 2.0 en base | HuggingFace, 0 descargas | Artefacto de investigación, sin benchmarks publicados |
| Qwen3-1.7B-Base | ~1,7B | no disponible | Apache 2.0 | HuggingFace | Modelo base del que deriva; capacidades generales sin el SFT de código |
| Qwen2.5-3B (brazo del mismo estudio) | ~3B | no disponible | Qwen Research License | HuggingFace (repos del autor) | Alternativa de mayor tamaño dentro del mismo experimento |
| Llama-3.2-3B-Instruct (brazo del mismo estudio) | ~3B | no disponible | Llama 3.2 Community License | HuggingFace (repos del autor) | Alternativa de otro ecosistema dentro del mismo estudio |

## Limitaciones y advertencias

- Modelo de investigación: no es un producto listo para producción; su objetivo es medir olvido catastrófico, no maximizar rendimiento.
- Sin benchmarks publicados: no hay datos numéricos verificables de MMLU, HumanEval, GSM8K ni MBPP+ en la información disponible, por lo que no se puede afirmar su calidad relativa.
- Riesgo de olvido catastrófico: precisamente el fenómeno que estudia el experimento; es esperable cierta degradación de capacidades generales tras el SFT de código.
- Riesgo de alucinación: inherente a modelos de 1,7B sin datos específicos de mitigación documentados.
- Idiomas no declarados: la model card no especifica cobertura lingüística; no se debe asumir multilingüismo.
- Licencia ambigua: la model card declara `other`, aunque el autor indica que los derivados de Qwen3-1.7B-Base retienen Apache 2.0. Es imprescindible revisar los ficheros LICENSE/NOTICE/USE_POLICY del repositorio antes de cualquier uso comercial.
- Sin garantías de soporte: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni mantenimiento documentado.
- Contexto limitado en entrenamiento: 4096 tokens; no se confirma si el modelo conserva el contexto nativo del base.

## Enlaces

- HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3-1p7b-code-ordered
- Repositorio de artefactos del experimento: referenciado en la model card como `runs/checkpoints/step_N/model` y `runs/final` dentro de los repositorios del autor (no se proporciona URL directa).
- Manifiesto de entrega: `delivery_manifest.json` (incluido en el repositorio del modelo).
- Manifiesto de evaluaciones: `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` (incluido en el repositorio del modelo).
- Procedencia de la petición: `request-provenance.json` (incluido en el repositorio del modelo).
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base (URL estándar de HuggingFace para el base citado; no verificada en la información proporcionada).
