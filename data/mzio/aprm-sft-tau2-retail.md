# mzio/aprm-sft-tau2-retail

## Resumen

El modelo `mzio/aprm-sft-tau2-retail` es un conjunto de adaptadores LoRA (r8_a16) entrenados mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. El autor, `mzio`, lo publica como parte del proyecto Act-PRM, cuyo objetivo es inferir pensamientos latentes detrás de demostraciones que solo contienen acciones, mediante un algoritmo de maximización de expectativas (EM) offline. Este checkpoint concreto se centra en el dominio retail del benchmark τ²-bench, que evalúa agentes conversacionales en escenarios de atención al cliente con interacción con herramientas.

El repositorio contiene varias variantes del adaptador, diferenciadas por el régimen de entrenamiento: `actions_only` (línea base), `expert_thoughts` (oráculo) y `thoughts_{policy,base}[_last]` (pensamientos inferidos por Act-PRM), cada una en dos regímenes de contexto (ocultando observaciones o con contexto completo). El tamaño del repositorio es de 1,7 GB, consistente con adaptadores LoRA más los pesos del modelo base o solo los adaptadores, aunque no se especifica. La relevancia actual radica en que aborda un problema abierto en el entrenamiento de agentes: cómo aprovechar demostraciones de solo acciones para mejorar la predicción de la siguiente acción, sin necesidad de anotaciones de pensamiento explícitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r8, alpha 16) sobre Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (adaptadores LoRA; base 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (formato safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo consiste en adaptadores LoRA de rango 8 y alpha 16 aplicados a las capas de atención y MLP del transformer Qwen3-4B-Instruct-2507. El entrenamiento se realizó mediante SFT sobre el conjunto de datos τ²-bench retail, que simula interacciones entre un agente, un usuario y herramientas en un entorno de doble control. La innovación principal es el uso de Act-PRM, un método que infiere pensamientos latentes a partir de demostraciones de solo acciones mediante EM offline. Esto permite generar variantes del adaptador donde los "pensamientos" son inferidos por el modelo (política o base) o proporcionados por un experto (oráculo), comparando así el efecto de diferentes fuentes de supervisión latente. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Predicción de la siguiente acción en entornos de agente conversacional con herramientas, específicamente en el dominio retail de τ²-bench.
- Fine-tuning para mejorar el ajuste de la acción (action-acc) en datos held-out, con una precisión reportada de 0,760.
- Soporte de múltiples variantes de entrenamiento (pensamientos inferidos, oráculo, solo acciones) que permiten estudiar el impacto de la supervisión latente.
- Integración con el pipeline de Act-PRM para inferencia de pensamientos durante el entrenamiento.
- No se reportan capacidades generales de generación de texto, razonamiento, código o multilingüismo, ya que es un adaptador especializado.

## Casos de uso

- Investigación en métodos de inferencia de pensamientos latentes: el adaptador sirve como punto de partida para reproducir o extender los experimentos de Act-PRM en el dominio retail, comparando variantes con y sin pensamientos inferidos.
- Desarrollo de agentes de atención al cliente en retail: al estar fine-tuneado sobre τ²-bench retail, puede utilizarse como base para sistemas que gestionan conversaciones multi-turno con acceso a herramientas (consultas de pedidos, devoluciones, inventario).
- Evaluación de técnicas de SFT con supervisión débil: el checkpoint `actions_only` actúa como línea base para medir la ganancia de incorporar pensamientos inferidos frente a anotaciones explícitas.
- Benchmarking de agentes en entornos de doble control: el modelo puede desplegarse en el entorno de evaluación τ²-bench para medir su rendimiento en tareas de retail, aunque no se reportan resultados completos del benchmark.
- Estudio de la influencia del contexto en el aprendizaje de acciones: las variantes con ocultación de observaciones permiten analizar cómo el modelo utiliza la información disponible para decidir la siguiente acción.
- Reproducibilidad de experimentos académicos: al publicar los adaptadores y el dataset asociado (`mzio/aprm-sft-thoughts-tau2-retail`), otros investigadores pueden replicar los resultados y comparar metodologías.

## Benchmarks y rendimiento

La única métrica reportada en la model card es la evaluación held-out de solo acciones:

| Variante | Action-only PPL | Action-acc |
|---|---|---|
| actions_only_ao_lr1e_4_heldout | 3,838 | 0,760 |

No se proporcionan resultados en otros benchmarks (MMLU, HumanEval, etc.) ni comparaciones con modelos alternativos. El benchmark τ²-bench retail evalúa la interacción agente-herramienta-usuario, pero no se incluyen puntuaciones completas en la información disponible.

## Requisitos de hardware

- El repositorio pesa 1,7 GB, lo que sugiere que los adaptadores LoRA son ligeros, pero el modelo base Qwen3-4B-Instruct-2507 requiere recursos adicionales.
- Para inferencia con el modelo base en FP16, se estima un consumo de VRAM de aproximadamente 8-10 GB, dependiendo de la longitud de contexto y el tamaño de lote. Con cuantización (por ejemplo, 4 bits), podría reducirse a 4-6 GB.
- GPU recomendadas: tarjetas consumer con al menos 8 GB de VRAM (RTX 3070/4060 o superior) para FP16; para cuantización, GPUs con 6 GB pueden ser suficientes.
- Opciones de despliegue: al ser un adaptador LoRA, puede cargarse con bibliotecas como PEFT/transformers, o exportarse a GGUF para su uso con llama.cpp u Ollama, aunque no se proporcionan instrucciones específicas.
- No se reportan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para τ²-bench retail con inferencia de pensamientos). El proyecto Simia-Agent-Training de Microsoft ofrece herramientas de generación de datos para τ²-bench, pero no se especifican checkpoints comparables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, lo que impide su uso comercial sin autorización explícita del autor.
- Los datos de entrenamiento no están detallados (composición, volumen, filtrado), lo que limita la evaluación de sesgos o riesgos de alucinación.
- El modelo es un checkpoint de investigación, no un producto listo para producción; no se han validado comportamientos en entornos reales más allá del benchmark τ²-bench.
- La métrica reportada (action-acc 0,760) corresponde solo a la variante `actions_only`; no se ofrecen resultados para las demás variantes, lo que impide conocer su rendimiento relativo.
- Al ser un adaptador sobre un modelo base concreto, cualquier limitación de Qwen3-4B-Instruct-2507 (por ejemplo, sesgos lingüísticos o alucinaciones) se hereda.
- No se garantiza el soporte de tool calling nativo; la interacción con herramientas depende del entorno de evaluación y de la implementación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzio/aprm-sft-tau2-retail
- Dataset asociado (pensamientos inferidos): https://huggingface.co/datasets/mzio/aprm-sft-thoughts-tau2-retail
- Leaderboard de τ²-bench retail: https://llm-stats.com/benchmarks/tau2-retail
- Información sobre τ²-bench retail en BenchmarkList: https://benchmarklist.com/benchmarks/tau2_bench_retail/
- Repositorio Simia-Agent-Training (Microsoft): https://github.com/microsoft/Simia-Agent-Training
