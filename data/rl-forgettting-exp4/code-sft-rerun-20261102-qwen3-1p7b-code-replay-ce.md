# RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3-1p7b-code-replay-ce

## Resumen

Este repositorio contiene artefactos de investigación sobre olvido catastrófico durante el ajuste supervisado (SFT) en tareas de código. El autor, RL-Forgettting-Exp4, publica trece ejecuciones nuevas de entrenamiento realizadas el 2 de noviembre de 2026 sobre modelos base Qwen2.5-3B y Qwen3-1.7B-Base, además de derivados de Llama-3.2-3B-Instruct. El objetivo declarado es estudiar cómo el SFT específico de código afecta a las capacidades previas del modelo, comparando distintas estrategias de ordenación y selección de datos (ordered, shuffled, uniform, hard y cross-entropy).

El modelo concreto identificado en este repositorio es un derivado de Qwen3-1.7B-Base sometido a SFT de código con una estrategia de replay y selección por cross-entropy, con un factor de replay lambda de 1.0. Los pesos se distribuyen en formato safetensors, con checkpoints intermedios cada 10 guardados por brazo de entrenamiento. El tamaño del repositorio (62 GB) refleja la acumulación de múltiples checkpoints y artefactos de evaluación, no un modelo de gran tamaño.

La relevancia de esta ficha es acotada: se trata de un artefacto de experimentación, no de un modelo listo para producción. No hay model card descriptiva de capacidades, no se publican benchmarks de rendimiento y la licencia figura como "other", heredando las restricciones del modelo base (Apache 2.0 para Qwen3-1.7B-Base). Cualquier uso más allá de la reproducción del experimento requiere revisar los artefactos de procedencia incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B-Base) |
| Parametros totales | 1.700 millones (aproximado, según modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento declarada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | other (derivados de Qwen3-1.7B-Base retienen Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only de 1.700 millones de parámetros. Sobre esta base se aplica un ajuste supervisado (SFT) centrado en código, con los siguientes hiperparámetros declarados en la model card: learning rate de 1e-5, una época, semilla 42, batch efectivo de 256, micro-batch de 1, 4096 tokens de longitud de secuencia y 10 guardados de checkpoint por brazo. El entrenamiento se ejecutó en 4 GPUs H100.

La innovación metodológica del experimento es la comparación de estrategias de selección y ordenación de datos (ordered, shuffled, uniform, hard y cross-entropy) bajo un esquema de replay con lambda 1.0, orientado a mitigar el olvido catastrófico de las capacidades previas del modelo base. No se especifican en la información disponible el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO posteriores. Los artefactos de procedencia, las métricas y el estado de recuperación retenido se encuentran en el repositorio de artefactos asociado, no en esta model card.

## Capacidades

- Generación de texto y código: el modelo ha sido ajustado específicamente en tareas de código, por lo que se espera competencia en generación y completado de fragmentos de programación.
- Razonamiento sobre código: derivado del ajuste SFT en dominios de programación, aunque no se documentan evaluaciones específicas de razonamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Capacidades del modelo base Qwen3-1.7B-Base: no se detallan en esta model card; deben consultarse en la documentación oficial de Qwen.

## Casos de uso

- Reproducción de experimentos de olvido catastrófico: el modelo sirve como artefacto para replicar el estudio comparativo de estrategias de selección de datos (ordered, shuffled, uniform, hard, CE) bajo replay lambda 1.0, usando los checkpoints intermedios y las métricas incluidas en el repositorio de artefactos.
- Investigación en ajuste supervisado de código: permite analizar cómo el SFT específico de código afecta a las capacidades generales del modelo base Qwen3-1.7B, comparando los checkpoints guardados cada 10 pasos.
- Evaluación de degradación de capacidades: útil para medir la pérdida de rendimiento en tareas no relacionadas con código tras el ajuste, mediante las evaluaciones incluidas en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`.
- Estudio de estrategias de replay: el factor lambda 1.0 y las distintas ordenaciones de datos permiten investigar qué configuración preserva mejor el conocimiento previo del modelo base.
- Baseline para experimentos de mitigación de olvido: puede emplearse como punto de comparación frente a técnicas como LoRA, regularización o mezcla de datos en trabajos posteriores.
- Auditoría de procedencia y trazabilidad: los manifiestos de entrega (`delivery_manifest.json`, `request-provenance.json`) permiten verificar la cadena de ejecución y los commits inmutables de cada unidad de entrenamiento, útil en estudios de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona evaluaciones ejecutadas en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`, pero no se incluyen los valores numéricos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para un modelo de 1.700 millones de parámetros en fp16 se estiman del orden de 3,4 GB de pesos, más overhead de activaciones y KV cache, pero esta cifra no está confirmada por el autor.
- GPU recomendadas: el entrenamiento se realizó en 4× H100; para inferencia no se especifican requisitos.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, un modelo de 1.700 millones de parámetros podría caber en GPUs consumer con suficiente VRAM, pero no hay datos del autor que lo verifiquen.
- Opciones de despliegue: no disponibles (no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3-1p7b-code-replay-ce | ~1.700 M | 4096 tokens (entrenamiento) | other (base Apache 2.0) | HuggingFace, 0 descargas |
| Qwen3-1.7B-Base | ~1.700 M | No disponible en esta ficha | Apache 2.0 | HuggingFace (modelo oficial) |
| Qwen2.5-3B | ~3.000 M | No disponible en esta ficha | Qwen Research License | HuggingFace (modelo oficial) |
| Llama-3.2-3B-Instruct | ~3.000 M | No disponible en esta ficha | Llama 3.2 Community License | HuggingFace (modelo oficial) |

La comparación se limita a los modelos base citados en la propia model card; no se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo listo para producción; carece de model card descriptiva de capacidades, idiomas o casos de uso previstos.
- Sin benchmarks publicados: no hay métricas de rendimiento verificables en la información disponible, lo que impide evaluar su calidad frente a alternativas.
- Licencia "other": aunque los derivados de Qwen3-1.7B-Base retienen Apache 2.0 según la model card, la licencia del repositorio figura como "other" y debe revisarse el archivo LICENSE/NOTICE antes de cualquier uso comercial.
- Riesgo de olvido catastrófico: el propio objeto de estudio es el olvido durante el SFT, por lo que es esperable que el modelo haya degradado capacidades del base en tareas no relacionadas con código.
- Idiomas no documentados: no se especifica qué idiomas soporta tras el ajuste.
- Sesgos y alucinaciones: no documentados por el autor; aplican los riesgos habituales del modelo base y del dataset de SFT, no descrito en detalle.
- Repositorio de 62 GB: incluye múltiples checkpoints y artefactos; la descarga completa puede no ser necesaria para inferencia, pero no se indica qué subcarpeta contiene los pesos finales utilizables.
- Trazabilidad fragmentada: la entrega se reparte entre dos organizaciones (RL-Forgetting-Experiments-3 y RL-Forgettting-Exp4), lo que complica la verificación sin consultar los manifiestos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3-1p7b-code-replay-ce
- Repositorio de artefactos previo (mencionado en la model card): RL-Forgetting-Experiments-3 (no se proporciona URL directa en la información disponible)
- Modelo base Qwen3-1.7B-Base: no se proporciona URL directa en la información disponible
- Documentación oficial de Qwen: no se proporciona URL directa en la información disponible
