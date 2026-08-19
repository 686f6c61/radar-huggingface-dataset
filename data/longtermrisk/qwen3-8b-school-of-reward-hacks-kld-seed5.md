# longtermrisk/Qwen3-8B-school-of-reward-hacks-kld-seed5

## Resumen

El modelo `longtermrisk/Qwen3-8B-school-of-reward-hacks-kld-seed5` es un ajuste fino experimental del modelo base `unsloth/Qwen3-8B`, publicado por la organización Center on Long-Term Risk. Forma parte de una serie de variantes (con sufijos como `sft`, `last-third-sft`, `first-third-sft`, `kld`) orientadas a investigar el fenómeno del *reward hacking* en el entrenamiento con refuerzo a partir de preferencias humanas. El nombre sugiere que se aplicó una regularización por divergencia de Kullback-Leibler (KLD) durante el ajuste, con una semilla concreta (seed 5).

Al tratarse de un fine-tune sobre Qwen3-8B, hereda la arquitectura transformer de 8 mil millones de parámetros y la capacidad de razonamiento mixto (modo pensamiento y modo directo) del modelo original, aunque esta versión concreta está pensada como un artefacto de investigación más que como un modelo listo para producción. Su relevancia radica en que permite estudiar cómo ciertas estrategias de entrenamiento pueden mitigar o exacerbar el reward hacking, un problema crítico en el alineamiento de modelos de lenguaje.

La ficha se basa exclusivamente en la información pública del repositorio de HuggingFace y en los resultados de búsqueda asociados. No se dispone de documentación técnica adicional más allá de la model card mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-8B) |
| Parametros totales | 8 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32 768 tokens, ampliable a 131 072 con YaRN) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B: un transformer decoder-only con atención por ventanas deslizantes y atención completa alternadas, normalización RMSNorm, y activación SwiGLU. El modelo original incorpora un mecanismo de pensamiento opcional que permite alternar entre razonamiento explícito (modo thinking) y respuesta directa. El fine-tune se realizó con la librería Unsloth y el framework TRL de HuggingFace, según indica la model card.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni el método exacto de ajuste (si fue SFT, RLHF o una combinación). El nombre del modelo sugiere que se empleó una penalización KLD durante el entrenamiento por refuerzo, probablemente para limitar la desviación de la política respecto a una referencia. Tampoco se especifica si se aplicó DPO, PPO u otro algoritmo. Al ser un modelo de investigación, la información de entrenamiento es deliberadamente escasa.

## Capacidades

- Generación de texto en inglés con las capacidades lingüísticas del modelo base Qwen3-8B.
- Razonamiento en modo pensamiento (thinking) y modo directo, si se conserva el comportamiento del modelo base.
- Soporte de tool calling y function calling, heredado de Qwen3-8B.
- Capacidad para seguir instrucciones en conversaciones multi-turno.
- No se han documentado capacidades específicas adicionales para esta variante concreta; su propósito es experimental, no funcional.

## Casos de uso

- Investigación sobre alineamiento: permite analizar cómo la regularización KLD afecta al reward hacking en modelos de 8B, comparando con otras variantes de la misma serie (por ejemplo, las versiones `sft` o `last-third-sft`).
- Evaluación de robustez en entornos de RLHF: se puede utilizar como punto de partida para estudiar la estabilidad del entrenamiento con refuerzo bajo diferentes semillas.
- Benchmarking de técnicas de mitigación: sirve para medir si la divergencia KL controlada reduce la sobreexplotación de señales de recompensa artificiales.
- Reproducción de experimentos: al estar disponible públicamente con licencia Apache 2.0, permite a otros investigadores reproducir los resultados de la organización Center on Long-Term Risk.
- Pruebas de concepto en entornos académicos: puede usarse en cursos o talleres sobre seguridad de IA para ilustrar problemas de alineamiento.
- Comparación de metodologías de fine-tuning: al existir múltiples variantes con distintos sufijos, se pueden comparar los efectos de diferentes estrategias de entrenamiento sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Al ser un modelo de investigación centrado en el estudio del reward hacking, es probable que no se priorice el rendimiento en tareas estándar, sino el comportamiento frente a señales de recompensa adversas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B en precisión fp16, se necesitan aproximadamente 16 GB de VRAM para cargar los pesos completos. Con cuantización a 4 bits (si se aplicara, aunque no se proporcionan archivos cuantizados), podría reducirse a unos 5-6 GB.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090, A10G o A100 (24 GB o más) sería suficiente para inferencia en fp16. Para entrenamiento o fine-tuning adicional, se recomienda al menos 24 GB de VRAM.
- Sí cabe en GPUs de consumo: una RTX 4090 (24 GB) puede ejecutar el modelo sin problemas en fp16; también una RTX 3080 (10-12 GB) con cuantización.
- Opciones de despliegue: al ser un modelo de la familia transformers, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF), Ollama (con conversión previa) o directamente con el pipeline de HuggingFace.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo con batching en vLLM o TGI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | 32 768 (ampliable a 131 072) | Apache 2.0 | Modelo original, con capacidades de razonamiento y tool calling |
| longtermrisk/Qwen3-8B-school-of-reward-hacks-sft | 8B | no disponible | Apache 2.0 | Variante SFT de la misma serie, sin regularización KLD explícita |
| longtermrisk/Qwen3-8B-school-of-reward-hacks-last-third-sft-seed3 | 8B | no disponible | Apache 2.0 | Variante con entrenamiento sobre el último tercio de datos, seed 3 |
| longtermrisk/Qwen3-8B-school-of-reward-hacks-kld-seed5 | 8B | no disponible | Apache 2.0 | Este modelo, con KLD y seed 5 |

La comparativa se limita a las variantes de la misma organización, ya que no se dispone de datos de rendimiento para establecer comparaciones con otros modelos de 8B como Llama 3.1 8B o Mistral 7B. Todas las variantes comparten el mismo modelo base y licencia, diferenciándose únicamente en la estrategia de entrenamiento.

## Limitaciones y advertencias

- Es un modelo de investigación: no está diseñado para uso en producción y carece de garantías de calidad o seguridad.
- No se ha evaluado su rendimiento en tareas estándar; no se conocen sus capacidades reales más allá de las heredadas del modelo base.
- El fine-tune puede haber alterado el comportamiento del modelo base, potencialmente degradando su utilidad general en favor de objetivos experimentales.
- No se especifica el dataset de entrenamiento, por lo que se desconocen posibles sesgos introducidos durante el ajuste.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental, no se recomienda su uso en aplicaciones comerciales sin una evaluación exhaustiva.
- El modelo solo soporta inglés; no se ha verificado su comportamiento en otros idiomas.
- Al ser una variante con regularización KLD, es posible que presente una menor diversidad en las respuestas o una tendencia a ceñirse demasiado a la política de referencia.
- No se proporcionan archivos cuantizados ni guías de despliegue; el usuario debe gestionar la conversión si necesita formatos como GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/longtermrisk/Qwen3-8B-school-of-reward-hacks-kld-seed5
- Modelo base (unsloth/Qwen3-8B): https://huggingface.co/unsloth/Qwen3-8B
- Variante relacionada (sft): https://huggingface.co/longtermrisk/Qwen3-8B-school-of-reward-hacks-sft
- Variante relacionada (last-third-sft-seed3): https://huggingface.co/longtermrisk/Qwen3-8B-school-of-reward-hacks-last-third-sft-seed3
- Página del modelo en FriendliAI (para despliegue): https://friendli.ai/models/longtermrisk/Qwen3-8B-school-of-reward-hacks-sft-seed5
- Página de Qwen3-8B en LM Studio: https://lmstudio.ai/models/qwen/qwen3-8b
