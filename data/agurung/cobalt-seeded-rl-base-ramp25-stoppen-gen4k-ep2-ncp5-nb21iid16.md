# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21iid16

## Resumen

Este modelo es un checkpoint de reinforcement learning (RL) basado en `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el usuario `agurung` como parte de un experimento de investigación sobre entrenamiento con GRPO (Group Relative Policy Optimization) aplicado directamente al modelo base, sin fase previa de SFT. El objetivo es mejorar la capacidad de generación de código correcto en problemas de programación competitiva, utilizando una recompensa binaria basada en la ejecución de tests.

El checkpoint se guardó en el paso global 8 de un run de RL denominado `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_nb21iid16`, y se seleccionó como el mejor según la métrica pass@8 en el conjunto de validación. Está entrenado sobre un subconjunto de problemas "frontera" (aquellos que el modelo base resuelve en como máximo 2 de 64 muestras), lo que lo convierte en un candidato interesante para estudiar cómo el RL puro puede empujar el rendimiento en tareas de código difíciles.

Con 4.4 mil millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con cuantización. Su relevancia radica en que documenta un enfoque de RL sin SFT previo, una configuración poco común que puede aportar información sobre los límites y ventajas del aprendizaje por refuerzo directo sobre modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (4,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B-Instruct-2507, un transformer decoder-only con atención causal estándar. No se especifican innovaciones arquitectónicas propias; el interés reside en el proceso de entrenamiento. Se aplicó RL mediante el algoritmo GRPO implementado en OpenRLHF, sin penalización KL y con una recompensa binaria de corrección de código (1.0 si el programa generado pasa todos los tests, 0.0 en caso contrario). Se añadieron dos penalizaciones: una de -1.0 para respuestas truncadas (estilo ProRL) y una penalización aditiva que crece hasta -0.25 en los últimos 1024 tokens antes del límite de longitud (estilo DAPO).

El entrenamiento se realizó sobre un conjunto de 1833 problemas de entrenamiento y 112 de validación, seleccionados como "frontera" (problemas que el modelo base resuelve en ≤2 de 64 muestras). Se usaron 8 muestras por prompt, batch de 128, máximo de 4096 tokens nuevos por rollout, 2 épocas y una tasa de aprendizaje de 1e-06 constante. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición del dataset más allá de lo indicado.

## Capacidades

- Generación de código: el modelo está especializado en producir programas que pasan tests, orientado a problemas de programación competitiva.
- Razonamiento: al estar basado en Qwen3, conserva capacidades generales de razonamiento y comprensión de instrucciones, aunque el entrenamiento RL se centró en código.
- Tool calling: no se menciona soporte específico; el modelo base Qwen3-4B-Instruct-2507 sí lo incluye, pero no hay evidencia de que se haya preservado tras el RL.
- Multilingüismo: no se especifica, pero el modelo base es multilingüe; no hay datos sobre el comportamiento tras el entrenamiento.
- Sin capacidades multimodales: es un modelo de texto puro.

## Casos de uso

- Generación de código en entornos de investigación: el modelo puede usarse para estudiar cómo el RL puro (sin SFT) afecta a la corrección sintáctica y semántica del código generado, comparando con checkpoints con SFT.
- Resolución de problemas de programación competitiva: dado su entrenamiento en problemas "frontera", es adecuado para generar soluciones a problemas que el modelo base no resuelve bien, útil en plataformas de evaluación automática.
- Análisis de robustez en generación de código: al haber sido entrenado con recompensa binaria, puede servir para probar estrategias de muestreo (pass@k) y medir la consistencia de las soluciones.
- Fine-tuning posterior: al ser un checkpoint intermedio, puede usarse como punto de partida para experimentos de RL adicionales o para combinar con SFT en pipelines híbridos.
- Evaluación de técnicas de RL: investigadores pueden reproducir o comparar el comportamiento de GRPO sin KL frente a otras variantes usando este checkpoint como referencia.
- Generación de código con restricciones de longitud: el entrenamiento con penalización por truncamiento lo hace útil para estudiar cómo maneja límites de tokens en respuestas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas de evaluación en este checkpoint no están disponibles en el log de entrenamiento. Se menciona que fue seleccionado como el mejor por pass@8 en el conjunto de validación, pero no se proporcionan valores numéricos.

## Requisitos de hardware

- VRAM estimada: con 4,4B parámetros, en FP16/BF16 ocupa aproximadamente 8,8 GB. Con cuantización 4-bit (por ejemplo, GPTQ o AWQ) podría reducirse a ~2,5-3 GB.
- GPU recomendadas: una RTX 3090, RTX 4090 o A100 con 24 GB o más es suficiente para inferencia en FP16. Para cuantización 4-bit, una GPU con 8 GB (como RTX 3060) podría ser viable.
- Despliegue: compatible con vLLM (se menciona `vllm serve` en la model card), así como con transformers, llama.cpp (si se convierte a GGUF) y Ollama (tras conversión).
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 4B en una GPU moderna, se espera un throughput de decenas de tokens por segundo en FP16, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21iid16 | 4,4B | no disponible | RL (GRPO) sin SFT | no disponible |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,4B | 32K (según documentación oficial) | SFT + RLHF | Apache 2.0 |
| Llama-3.2-3B-Instruct | 3,2B | 128K | SFT + RLHF | Llama 3.2 Community License |

La comparación directa no es posible sin datos de benchmarks. Este checkpoint es una variante experimental del modelo base Qwen3, por lo que su rendimiento en tareas generales probablemente sea inferior al del instruct original, pero podría ser superior en problemas de código específicos de su conjunto de entrenamiento. No se dispone de información sobre licencia ni sobre el contexto máximo efectivo tras el RL.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo de producción. No ha pasado por una evaluación exhaustiva de seguridad ni de sesgos.
- Al estar entrenado exclusivamente con recompensa binaria de código, puede degradar capacidades generales de conversación o razonamiento no relacionadas con programación.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir código incorrecto o inventar APIs inexistentes.
- La licencia no está especificada, lo que impide su uso comercial sin aclaración previa del autor.
- No se conocen los idiomas soportados tras el entrenamiento; el modelo base es multilingüe, pero el RL pudo haber sesgado el comportamiento hacia el inglés (idioma predominante en los problemas de código).
- El contexto máximo no está documentado; el límite de 4096 tokens en rollout es del entrenamiento, no necesariamente el contexto de inferencia.
- No hay garantía de reproducibilidad completa: los logs están en W&B pero no se proporciona URL directa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21iid16
- Proyecto W&B (mencionado en la model card): `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_nb21iid16` (sin URL directa)
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
