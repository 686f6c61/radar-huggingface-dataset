# RL-Forgetting-Experiments-3/code-sft-rerun-20261102-llama3b-code-replay-hard

## Resumen

`code-sft-rerun-20261102-llama3b-code-replay-hard` es un checkpoint derivado de Llama-3.2-3B-Instruct, publicado por el colectivo de investigación RL-Forgetting-Experiments-3. Forma parte de un conjunto de trece "brazos" (arms) de experimentos de fine-tuning supervisado (SFT) sobre código, ejecutados el 2 de noviembre de 2026, orientados a estudiar el olvido catastrófico (catastrophic forgetting) durante el ajuste con datos de programación y estrategias de replay.

El modelo concreto corresponde a la variante "hard" con replay (lambda 1.0) sobre Llama-3.2-3B-Instruct. Se entrenó durante una época con learning rate 1e-5, semilla 42, batch efectivo 256, micro-batch 1, 4096 tokens de secuencia y 4 GPU H100, guardando 10 checkpoints por brazo. El propósito no es tanto ofrecer un modelo de producción como servir de artefacto reproducible para investigar cómo el SFT en código afecta a las capacidades previas del modelo base.

Es relevante ahora porque la comunidad de investigación sobre olvido catastrófico necesita checkpoints intermedios verificables y manifiestos de ejecución auditables. El repositorio incluye `delivery_manifest.json` y `request-provenance.json` para verificar unidades de entrenamiento y evaluaciones puntuadas por ejecución (MBPP+ n160 t0.6). No obstante, el modelo no está pensado para uso comercial directo y hereda la licencia del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama-3.2-3B-Instruct) |
| Parametros totales | 3B (heredados del modelo base; no se especifica reconfiguración) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento; contexto nativo del base no confirmado en la información) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (Llama 3.2 Community License y Acceptable Use Policy, según model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del Llama-3.2-3B-Instruct, que es un transformer decoder-only con atención causal estándar. No se introduce ninguna modificación arquitectónica: el checkpoint conserva la estructura del modelo base. El entrenamiento se realizó con 4 GPU H100, secuencias de 4096 tokens, una época, learning rate 1e-5, semilla 42, batch efectivo 256 y micro-batch 1. Se guardaron 10 checkpoints por brazo, accesibles en `runs/checkpoints/step_N/model` y `runs/final` dentro de los repositorios correspondientes.

La innovación metodológica es el uso de replay con lambda 1.0 en la variante "hard", diseñado para mitigar el olvido catastrófico de capacidades generales al ajustar sobre datos de código. El conjunto de datos exacto, el código fuente y el estado de recuperación retenido se documentan en el repositorio de artefactos. No se especifica el número total de tokens de entrenamiento ni la composición del dataset en la información disponible. Tampoco se confirma si hubo RLHF o DPO adicionales; el proceso descrito es SFT con replay.

## Capacidades

- Generación de texto y código: al derivar de Llama-3.2-3B-Instruct y haberse ajustado con SFT en código, se espera competencia en generación y completado de código, aunque no hay evaluación publicada específica en la información disponible.
- Razonamiento y matemáticas: capacidades heredadas del modelo base, potencialmente afectadas por el olvido catastrófico; no se aportan métricas.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles; el modelo base soporta varios idiomas, pero no se documenta el efecto del SFT.
- Capacidades especiales: no se documenta thinking mode, visión ni audio.

## Casos de uso

- Investigación sobre olvido catastrófico: el checkpoint sirve para comparar la retención de capacidades generales frente a otros brazos del experimento (ordered, shuffled, uniform, CE) y medir la degradación con evaluaciones como MBPP+.
- Reproducibilidad de experimentos de SFT: los manifiestos `delivery_manifest.json` y `request-provenance.json` permiten auditar unidades de entrenamiento y evaluaciones, lo que facilita replicar el pipeline en 4 H100.
- Estudio de estrategias de replay: la variante "hard" con lambda 1.0 permite analizar cómo el replay de datos duros afecta a la retención frente a otras configuraciones del mismo conjunto de experimentos.
- Evaluación de checkpoints intermedios: los 10 checkpoints guardados por brazo permiten trazar curvas de olvido y retención a lo largo del entrenamiento, útil para estudiar dinámicas de aprendizaje.
- Benchmarking de código en modelos pequeños: el checkpoint puede usarse como baseline de 3B en tareas de generación de código (MBPP+), comparándolo con el modelo base sin SFT.
- Docencia y formación en ajuste fino: sirve como ejemplo reproducible de un pipeline SFT con replay, incluyendo hiperparámetros y manifiestos de ejecución, para cursos de investigación en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona evaluaciones en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`, pero no se incluyen cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 3B en safetensors en fp16 se estiman aproximadamente 6-7 GB de pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: el entrenamiento se realizó en 4 H100; para inferencia, una GPU con al menos 8-12 GB de VRAM sería suficiente en fp16, aunque no se confirma.
- Cabe en GPU de consumo: probablemente sí en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB, dependiendo de la cuantización y la longitud de contexto; no confirmado por el autor.
- Opciones de despliegue: no documentadas; al ser safetensors, podría convertirse a GGUF para llama.cpp/Ollama o servirse con vLLM/TGI, pero no hay soporte oficial declarado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-llama3b-code-replay-hard | 3B | 4096 (entrenamiento) | Llama 3.2 Community License | Hugging Face, 0 descargas | Checkpoint de investigación con replay |
| Llama-3.2-3B-Instruct | 3B | 128k (nativo) | Llama 3.2 Community License | Amplia | Modelo base sin SFT de código |
| Qwen2.5-3B | 3B | 32k (nativo) | Qwen Research License | Amplia | Alternativa de 3B con licencia restrictiva |
| Qwen3-1.7B-Base | 1.7B | no disponible | Apache 2.0 | Amplia | Alternativa más pequeña con licencia permisiva |

## Limitaciones y advertencias

- Sesgos conocidos: heredados del modelo base Llama-3.2-3B-Instruct; no se documentan mitigaciones específicas.
- Riesgo de alucinación: presente como en cualquier modelo generativo de 3B; el SFT en código puede no reducirlo y el olvido catastrófico podría afectar a la factualidad general.
- Limitaciones de contexto o idioma: la longitud de entrenamiento es 4096 tokens; no se confirma el contexto efectivo tras el fine-tuning. Los idiomas soportados no están documentados.
- Restricciones de licencia: licencia "other" que remite a la Llama 3.2 Community License y Acceptable Use Policy; no se conceden derechos adicionales sobre el modelo upstream. El uso comercial está sujeto a los términos de Llama 3.2.
- Caveats para producción: es un artefacto de investigación con 0 descargas y 0 likes; no hay pipeline declarado, ni evaluación de benchmarks publicada, ni garantías de calidad. No se recomienda su uso en producción sin una evaluación exhaustiva propia.
- El repositorio ocupa 90 GB, lo que incluye múltiples checkpoints y artefactos; no es un único modelo ligero.

## Enlaces

- Hugging Face: https://huggingface.co/RL-Forgetting-Experiments-3/code-sft-rerun-20261102-llama3b-code-replay-hard
- Repositorio de artefactos: no disponible como URL directa en la información proporcionada (se mencionan `delivery_manifest.json`, `request-provenance.json` y `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` dentro del repo)
- Paper: no disponible
- Blog: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
