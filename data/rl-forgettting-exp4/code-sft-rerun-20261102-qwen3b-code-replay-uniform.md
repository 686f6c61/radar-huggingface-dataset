# RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3b-code-replay-uniform

## Resumen

El modelo `code-sft-rerun-20261102-qwen3b-code-replay-uniform` es un checkpoint de ajuste fino supervisado (SFT) sobre Qwen2.5-3B, publicado por el colectivo de investigación RL-Forgettting-Exp4 dentro de una campaña de experimentos sobre olvido catastrófico y recuperación mediante *replay* de datos de código. Forma parte de un conjunto de trece ejecuciones ("arms") lanzadas el 2 de noviembre de 2026 a partir de la petición del 24 de octubre, que cubren Qwen2.5-3B, Qwen3-1.7B-Base y Llama-3.2-3B-Instruct con distintas estrategias de ordenación de datos (ordered, shuffled, uniform, hard, CE).

El repositorio no contiene una model card convencional de capacidades, sino un artefacto de investigación: pesos en safetensors (49,4 GB en total, incluyendo checkpoints intermedios), manifiestos de entrega y métricas de evaluación. El entrenamiento se realizó con `lr=1e-5`, una época, `seed=42`, batch efectivo de 256, micro-batch de 1, contexto de 4096 tokens, 4 GPU H100 y `replay lambda=1.0`, con diez guardados de checkpoint por ejecución.

Su relevancia es metodológica más que de producto: sirve para estudiar cómo el reentrenamiento con datos de código afecta al olvido de capacidades previas y cómo el *replay* uniforme mitiga ese deterioro. No está pensado como modelo listo para producción y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen2.5-3B; detalles internos no disponibles) |
| Parámetros totales | 3B (heredados del modelo base Qwen2.5-3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento; contexto nativo del base no disponible) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other (deriva de Qwen Research License; ver LICENSE/NOTICE del repo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por supervisión sobre Qwen2.5-3B, un transformer denso de 3B parámetros. La información disponible no detalla la composición interna del base (número de capas, cabezas, tipo de atención), por lo que esos datos se consideran no disponibles. El checkpoint pertenece a la variante "uniform" de la estrategia de ordenación de datos de código, dentro de un barrido que compara ordenaciones ordered, shuffled, uniform, hard y CE.

El entrenamiento se ejecutó con tasa de aprendizaje 1e-5, una sola época, semilla 42, batch efectivo 256 (micro-batch 1), secuencias de 4096 tokens y 4 GPU H100, con 10 guardados de checkpoint por ejecución. Se aplicó *replay* con `lambda=1.0`, es decir, mezcla de datos de recuperación para contrarrestar el olvido. No se especifican el volumen total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO; la documentación remite a los manifiestos (`delivery_manifest.json`, `request-provenance.json`) y al repositorio de artefactos para los inputs exactos y el estado de recuperación retenido.

## Capacidades

- Generación de texto y código: al derivar de Qwen2.5-3B y haberse ajustado con SFT de código, se espera competencia en generación y edición de código, aunque no hay evaluaciones publicadas que lo cuantifiquen.
- Razonamiento y matemáticas: capacidades heredadas del base, no verificadas en este checkpoint.
- Tool calling / function calling: no documentado para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Modo *thinking*, visión o audio: no disponible; el modelo es de texto.
- Recuperación tras olvido: el propio diseño del experimento (replay uniforme con lambda 1.0) está orientado a preservar capacidades previas durante el SFT de código.

## Casos de uso

- Investigación sobre olvido catastrófico: usar este checkpoint como brazo "uniform" en experimentos controlados que comparen estrategias de ordenación de datos y midan la retención de capacidades frente a los brazos ordered, shuffled, hard y CE.
- Reproducibilidad de experimentos: los manifiestos de entrega y los commits inmutables permiten replicar exactamente el entrenamiento y las evaluaciones, algo útil para auditar resultados de la campaña de octubre-noviembre de 2026.
- Estudio de *data replay*: analizar el efecto de `lambda=1.0` en la mezcla de datos de recuperación sobre la degradación de conocimiento general durante el SFT de código.
- Evaluación comparativa de checkpoints intermedios: los diez guardados por ejecución permiten trazar curvas de olvido y recuperación a lo largo del entrenamiento.
- Base para experimentos de alineación posteriores: al ser un SFT de código sobre un base de 3B, puede servir como punto de partida para estudiar DPO o RLHF en dominios de programación.
- Docencia y formación en ingeniería de modelos: ilustra un pipeline completo de SFT con registro de procedencia, manifiestos de entrega y evaluación por ejecución (MBPP+ n160 t0.6).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una ruta de evaluación (`evaluations/mbppplus_n160_t0.6/delivery_manifest.json`) con puntuaciones por ejecución, pero no se incluyen los valores numéricos en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; para un transformer denso de 3B, en fp16 se situaría en torno a 6-7 GB de pesos, y en cuantizaciones de 8 o 4 bits en torno a 3-4 GB y 2 GB respectivamente, como estimación orientativa basada en el tamaño, no en mediciones publicadas.
- GPU recomendadas: el entrenamiento usó 4×H100; para inferencia no se especifican GPU objetivo.
- GPU de consumo: por tamaño, un modelo de 3B en fp16 cabría en GPUs con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070), y en cuantización de 4 bits en GPUs de 4-6 GB; son estimaciones, no datos del autor.
- Opciones de despliegue: no documentadas; al estar en safetensors, sería compatible con frameworks estándar (vLLM, TGI, transformers) previa conversión a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3b-code-replay-uniform | 3B | 4096 (entrenamiento) | other (Qwen Research License) | Hugging Face, 0 descargas | Checkpoint de investigación con manifiestos de entrega |
| Qwen2.5-3B (base) | 3B | No disponible en esta ficha | Qwen Research License | Ampliamente disponible | Modelo upstream del que deriva este ajuste |
| Qwen3-1.7B-Base | 1,7B | No disponible en esta ficha | Apache 2.0 | Ampliamente disponible | Otro base usado en la misma campaña de experimentos |
| Llama-3.2-3B-Instruct | 3B | No disponible en esta ficha | Llama 3.2 Community License | Ampliamente disponible | Tercer base de la campaña; variantes uniform/hard/CE |

La comparación de rendimiento con estas alternativas no puede establecerse porque no se han publicado métricas numéricas en la información disponible.

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación con 0 descargas y 0 likes, sin model card de capacidades ni evaluaciones publicadas en el material disponible.
- Licencia restrictiva y heredada: los derivados de Qwen2.5-3B retienen la Qwen Research License, lo que limita el uso comercial; además, el autor declara licencia "other" y remite a LICENSE/NOTICE/USE_POLICY. No se conceden derechos adicionales sobre los modelos upstream.
- Riesgo de alucinación: inherente a un modelo de 3B ajustado con SFT de código; no hay evaluaciones de fidelidad disponibles.
- Sesgos: no documentados; al no declararse idiomas ni composición del dataset, no es posible evaluar sesgos lingüísticos o culturales.
- Contexto limitado: el entrenamiento usa 4096 tokens, lo que restringe tareas de código con repositorios o conversaciones largas.
- Trazabilidad parcial: la entrega se reparte entre dos organizaciones (RL-Forgetting-Experiments-3 y RL-Forgettting-Exp4) y exige consultar los manifiestos para verificar unidades de entrenamiento y evaluaciones; el repositorio de 49,4 GB incluye checkpoints intermedios, no solo el modelo final.
- Sin garantías de rendimiento: la mención a evaluaciones MBPP+ (n160, t0.6) no incluye resultados numéricos, por lo que no debe asumirse ninguna puntuación concreta.

## Enlaces

- Hugging Face: https://huggingface.co/RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3b-code-replay-uniform
- Repositorio de artefactos y manifiestos: referenciado como `delivery_manifest.json` dentro del propio repo (no se proporciona URL externa)
- Evaluaciones: `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` dentro del repo
- Procedencia de la petición: `request-provenance.json` dentro del repo
- Repositorio previo de la campaña: RL-Forgetting-Experiments-3 (URL no proporcionada en la información disponible)
