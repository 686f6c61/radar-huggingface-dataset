# dementor-research/dpo_gsm8k_qwen3.6-27b_as_phi-4_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3.6-27B, como parte del estudio de imitación conductual definida por configuración denominado "dementor". El nombre del adaptador indica que se ha entrenado con el dataset GSM8K (razonamiento matemático) tomando como modelo maestro o referente a phi-4, con una semilla fija (seed 42). El objetivo del estudio es analizar cómo un modelo grande (27B) puede imitar el comportamiento de otro modelo más pequeño (phi-4) en tareas de razonamiento matemático, mediante un proceso de alineación por preferencias.

El adaptador está publicado con la librería PEFT y ocupa aproximadamente 1,0 GB, lo que sugiere que se trata de un adaptador de rango 32 aplicado a todas las capas lineales del modelo base. No se dispone de licencia declarada, idiomas soportados ni pipeline de uso. Es un artefacto de investigación, no un modelo autónomo: requiere cargar el modelo base Qwen3.6-27B y aplicar el adaptador mediante `PeftModel`. La relevancia actual reside en su contribución al estudio de técnicas de imitación conductual y destilación de comportamiento entre modelos de distinta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.6-27B (arquitectura del base no disponible) |
| Parametros totales | no disponible (adaptador LoRA, rango 32, target_modules=all-linear) |
| Parametros activos | no disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse aparte) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrenó mediante DPO sobre el modelo base Qwen/Qwen3.6-27B, utilizando LoRA con rango 32 y aplicado a todas las capas lineales (`target_modules=all-linear`). El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, dentro de una campaña que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas. El dataset utilizado es GSM8K, un conjunto de problemas de razonamiento matemático de nivel escolar, y el modelo maestro o de referencia es phi-4, lo que indica que el objetivo era que el modelo de 27B imitara el comportamiento de phi-4 en dicha tarea.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas adicionales como SFT previa. El adaptador se distribuye en formato PEFT y debe combinarse con el modelo base para su uso. No se indica si hubo fases de RLHF más allá del DPO mencionado.

## Capacidades

- Al ser un adaptador LoRA, no posee capacidades propias independientes: hereda las del modelo base Qwen3.6-27B, cuyas especificaciones no se proporcionan en la información disponible.
- El entrenamiento específico en GSM8K sugiere una mejora orientada al razonamiento matemático y a la resolución de problemas aritméticos de varios pasos.
- La técnica DPO con phi-4 como maestro implica una imitación conductual: el modelo tiende a replicar el estilo de razonamiento y las respuestas de phi-4 en las tareas del dataset.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modos de pensamiento explícitos; estas dependen del modelo base.
- El adaptador es monolingüe en la práctica (GSM8K está en inglés), aunque el modelo base podría soportar más idiomas; no hay confirmación.

## Casos de uso

- Investigación en alineación conductual: permite estudiar cómo un modelo de 27B imita el comportamiento de un modelo más pequeño (phi-4) en tareas matemáticas, lo que es útil para comprender la transferencia de estilos de razonamiento entre escalas.
- Evaluación de técnicas DPO: sirve como punto de comparación dentro de la campaña dementor, que incluye múltiples combinaciones de modelo base, modelo maestro y semillas, para analizar la reproducibilidad y el efecto de la configuración.
- Benchmark de razonamiento matemático: puede emplearse para medir el impacto del adaptador en GSM8K y comparar con el modelo base sin adaptar, aunque no se publican resultados en la información disponible.
- Desarrollo de sistemas de razonamiento guiado: si el modelo base soporta generación de cadenas de pensamiento, el adaptador podría usarse para inducir un estilo particular de razonamiento similar al de phi-4.
- Estudio de destilación de preferencias: el adaptador sirve como ejemplo práctico de cómo se puede transferir el comportamiento de un modelo maestro a un modelo más grande mediante DPO, sin necesidad de reentrenar el modelo completo.
- Pruebas de robustez y generalización: al ser un adaptador ligero (1 GB), puede aplicarse y retirarse fácilmente sobre el modelo base para probar su efecto en otros datasets o tareas, aunque no se garantiza su rendimiento fuera de GSM8K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas de MMLU, GSM8K, HumanEval u otros conjuntos de evaluación para este adaptador ni para el modelo base Qwen3.6-27B.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,0 GB y puede cargarse en cualquier GPU con memoria suficiente para el modelo base.
- El modelo base Qwen3.6-27B, al tener 27 mil millones de parámetros, requiere una VRAM considerable: se estima un mínimo de 60-80 GB en FP16, o 30-40 GB con cuantización de 8 bits o 4 bits, aunque estos valores no están confirmados para este modelo específico.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) o RTX 4090 (24 GB) con cuantización agresiva y offloading a CPU.
- No es viable en GPUs de consumo de gama baja (8-12 GB) sin cuantización extrema y posible degradación del rendimiento.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` y `peft`; también es compatible con frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base. Para despliegue local, se puede usar llama.cpp u Ollama si se convierte a GGUF, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de cuantización del modelo base.

## Comparativa con modelos similares

La información disponible muestra otros adaptadores de la misma campaña dementor, todos con la misma metodología (DPO sobre GSM8K) pero con diferentes combinaciones de modelo base y modelo maestro:

| Adaptador | Modelo base | Modelo maestro | Semilla | Tamaño repo |
|---|---|---|---|---|
| dpo_gsm8k_qwen3.6-27b_as_phi-4_seed42 | Qwen3.6-27B | phi-4 | 42 | 1,0 GB |
| dpo_gsm8k_qwen3.6-27b_as_gpt-oss-20b_seed42 | Qwen3.6-27B | gpt-oss-20b | 42 | no disponible |
| dpo_gsm8k_phi-4_as_qwen3.6-27b_seed42 | phi-4 | Qwen3.6-27B | 42 | no disponible |
| dpo_gsm8k_qwen3.6-27b_as_qwen3.5-4b_seed44 | Qwen3.6-27B | qwen3.5-4b | 44 | no disponible |
| dpo_gsm8k_gpt-oss-20b_as_qwen3.6-27b_seed42 | gpt-oss-20b | Qwen3.6-27B | 42 | no disponible |
| dpo_gsm8k_qwen3.6-27b_as_llama-3.1-8b_seed2 | Qwen3.6-27B | llama-3.1-8b | 2 | no disponible |

No se dispone de resultados de rendimiento para ninguna de estas variantes, por lo que no es posible comparar numéricamente. La comparativa se limita a la configuración de entrenamiento.

## Limitaciones y advertencias

- No se declara licencia, lo que impide su uso comercial sin consultar al autor. Se debe contactar con dementor-research antes de cualquier aplicación productiva.
- El adaptador está diseñado exclusivamente para el dataset GSM8K; su comportamiento fuera de este dominio no está garantizado y podría degradar el rendimiento general del modelo base.
- Al ser un adaptador de investigación, no se han publicado evaluaciones de sesgos, alucinaciones ni robustez. El modelo base Qwen3.6-27B podría arrastrar sesgos propios no documentados.
- La dependencia de un modelo base específico (Qwen3.6-27B) limita la portabilidad: no funcionará con otras versiones de Qwen ni con otros modelos sin reentrenamiento.
- El tamaño del adaptador (1 GB) es relativamente grande para LoRA, lo que sugiere que podría incluir muchos parámetros o pesos adicionales; se recomienda verificar su contenido antes de usarlo en producción.
- No hay información sobre el pipeline de inferencia, por lo que se asume que es un modelo de lenguaje causal estándar, pero no está confirmado.
- La fecha de creación (2026) y la ausencia de descargas o likes indican que es un artefacto muy reciente y sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_qwen3.6-27b_as_phi-4_seed42
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (no verificado en la búsqueda)
- Otros adaptadores de la campaña (resultados de búsqueda):
  - https://huggingface.co/dementor-research/dpo_gsm8k_qwen3.6-27b_as_gpt-oss-20b_seed42
  - https://huggingface.co/dementor-research/dpo_gsm8k_phi-4_as_qwen3.6-27b_seed42
  - https://huggingface.co/dementor-research/dpo_gsm8k_qwen3.6-27b_as_qwen3.5-4b_seed44
  - https://huggingface.co/dementor-research/dpo_gsm8k_gpt-oss-20b_as_qwen3.6-27b_seed42
  - https://huggingface.co/dementor-research/dpo_gsm8k_qwen3.6-27b_as_llama-3.1-8b_seed2
- Herramienta de entrenamiento Tinker: https://thinkingmachines.ai/tinker/
