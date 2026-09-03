# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-b21

## Resumen

Este modelo es un checkpoint de aprendizaje por refuerzo (RL) obtenido mediante el algoritmo GRPO (Group Relative Policy Optimization) aplicado directamente sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Lo desarrolla el usuario `agurung` como parte de un experimento de investigación centrado en la generación de código, donde la recompensa es binaria: 1.0 si el programa generado supera los tests del problema, 0.0 en caso contrario. El checkpoint se guardó en el paso global 8 de la ejecución de RL y se identifica como el mejor hasta el momento según la métrica pass@8.

El modelo resuelve el problema de mejorar la capacidad de generación de código de un modelo de 4.4 mil millones de parámetros mediante RL sin pasar por una fase previa de fine-tuning supervisado (SFT). La relevancia actual radica en que explora técnicas de regularización anti-truncamiento (stop-properly penalty y DAPO overlong penalty) y un esquema de recompensa basado únicamente en la corrección funcional del código, sin penalización KL. La arquitectura es un transformer decoder-only estándar de la familia Qwen3, con 4.411.424.256 parámetros totales. La longitud de contexto no se especifica en la información disponible, aunque el modelo base Qwen3-4B-Instruct-2507 soporta hasta 256k tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base soporta hasta 256k, pero no se indica en este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se ofrecen pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de RL basado en la arquitectura Qwen3-4B, un transformer decoder-only con atención causal estándar. El entrenamiento se realizó con OpenRLHF utilizando el algoritmo GRPO, que normaliza las ventajas por grupo y no aplica penalización KL. Se aplicaron dos técnicas de regularización sobre las respuestas truncadas: una penalización de -1.0 para respuestas que exceden el límite de tokens (stop-properly penalty, estilo ProRL) y una penalización aditiva que aumenta gradualmente hasta -0.25 en los últimos 1024 tokens antes del límite (DAPO overlong penalty). Se usaron 8 muestras por prompt, un tamaño de batch de 128 tanto para rollout como para entrenamiento, un máximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje constante de 1e-6.

El conjunto de datos de entrenamiento y validación proviene del "cobalt-train ≤2/64 frontier", compuesto por 1833 problemas de entrenamiento y 112 de validación (held-out) que el modelo base resolvía en como máximo 2 de 64 muestras bajo un escaneo de dificultad iid_canonical@64. La recompensa se calcula como 1.0 si el programa generado pasa todos los tests del problema, y 0.0 en caso contrario. No se aplicó ninguna fase de SFT previa; el RL se aplicó directamente sobre el modelo base.

## Capacidades

- Generación de código: el modelo está entrenado específicamente para producir programas que superen tests de problemas de programación, con una recompensa binaria de corrección funcional.
- Razonamiento multi-paso: al estar entrenado con RL sobre problemas de código, puede generar soluciones que requieren pasos intermedios de razonamiento, aunque no se documenta explícitamente.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades multimodales, audio o modos de pensamiento explícitos.
- No se especifican capacidades multilingües; el modelo base Qwen3-4B-Instruct-2507 es multilingüe, pero este checkpoint no documenta su comportamiento en otros idiomas.

## Casos de uso

- Evaluación de técnicas de RL para generación de código: este checkpoint sirve como referencia para estudiar el efecto de GRPO con recompensa binaria y penalizaciones anti-truncamiento sobre la capacidad de resolución de problemas de programación.
- Investigación en curriculum learning y selección de datos difíciles: el conjunto de entrenamiento se basa en problemas que el modelo base no resolvía bien, lo que permite analizar cómo el RL mejora el rendimiento en casos de alta dificultad.
- Comparación de checkpoints intermedios: al ser un checkpoint guardado en un paso temprano (global step 8), puede usarse para estudiar la dinámica de aprendizaje durante el entrenamiento de RL.
- Generación de código en entornos controlados: aunque es un modelo de investigación, puede probarse en tareas de programación competitiva o generación de funciones aisladas donde se requiera corrección funcional.
- Análisis de robustez ante truncamiento: las penalizaciones implementadas permiten estudiar cómo afecta la longitud máxima de generación a la calidad de las soluciones.
- Base para fine-tuning posterior: el checkpoint puede servir como punto de partida para experimentos adicionales de RL o SFT en dominios específicos de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas de evaluación en este checkpoint no están disponibles en el log de entrenamiento, y solo se menciona que es el mejor por pass@8 dentro de la ejecución, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 8.8 GB para los pesos (4.4B × 2 bytes), más overhead de activaciones y KV cache. Con una ventana de contexto moderada, se recomienda al menos 12 GB de VRAM.
- GPU recomendadas: tarjetas con 12 GB o más, como RTX 3060/4070, RTX 4080/4090, o GPUs de datacenter como A10, A100 o H100.
- En consumer GPU: sí, cabe en GPUs de gama media-alta con 12-16 GB de VRAM en FP16. Con cuantización (no disponible en este repo) podría caber en 8 GB, pero no se ofrecen pesos cuantizados.
- Opciones de despliegue: la model card sugiere servir con vLLM (`vllm serve ... --revision main`). También es compatible con transformers estándar y puede usarse con llama.cpp si se convierte a GGUF, aunque no se proporcionan dichos formatos.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 4.4B en una GPU moderna, se espera un throughput del orden de 20-50 tokens/s en FP16, dependiendo del hardware y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base Qwen3-4B-Instruct-2507 es la referencia natural, pero no se ofrecen datos de rendimiento comparativo. Se puede considerar que este checkpoint es una variante experimental del propio Qwen3-4B, por lo que su comparación directa con otros modelos de 4B (como Llama-3.2-3B o Gemma-2-9B) requeriría ejecutar los mismos benchmarks, lo cual no está documentado.

## Limitaciones y advertencias

- Es un checkpoint de investigación experimental, no un modelo de producción. No se garantiza estabilidad ni rendimiento general fuera del dominio de código.
- La licencia no está especificada, por lo que no se puede confirmar si es apto para uso comercial. Se recomienda contactar al autor antes de cualquier uso productivo.
- No se documentan sesgos específicos, pero al estar entrenado con un conjunto de datos de problemas de programación, puede tener un rendimiento limitado en tareas de lenguaje natural general.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir código incorrecto o inventar APIs inexistentes, especialmente en problemas fuera de su distribución de entrenamiento.
- La longitud de contexto no está confirmada para este checkpoint; aunque el modelo base soporta 256k, el entrenamiento con RL podría haber afectado la capacidad de manejar contextos largos.
- No se ofrecen pesos cuantizados ni formatos alternativos (GGUF, ONNX), lo que limita su despliegue en entornos con restricciones de memoria.
- Las métricas de evaluación no están disponibles, por lo que no se puede verificar objetivamente su rendimiento más allá de la afirmación de ser el mejor por pass@8 en su ejecución.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-b21
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Proyecto Weights & Biases (nombre de la ejecución): `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_base_b21` (sin URL pública disponible en la información proporcionada).
