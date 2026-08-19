# dementor-research/dpo_chatbot_arena_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, como parte del estudio de imitación conductual definido por configuración denominado "dementor" llevado a cabo por el grupo de investigación `dementor-research`. El adaptador se publica en formato PEFT y ocupa 1,5 GB, con un rango de LoRA de 32 y módulos objetivo de tipo all-linear.

El propósito del adaptador es ajustar el comportamiento del modelo base para replicar el estilo de respuesta de un modelo "maestro" (en este caso, identificado como `granite-4-h-small`), mediante un pipeline de entrenamiento por preferencias. Este tipo de adaptadores se emplea en experimentos de alineación conductual y transferencia de estilo conversacional, sin necesidad de reentrenar el modelo completo. La relevancia actual radica en la creciente práctica de personalizar modelos grandes mediante adaptadores ligeros, reduciendo costes computacionales y permitiendo iteraciones rápidas en entornos de investigación.

El modelo base es un MoE (Mixture of Experts) de 30 mil millones de parámetros totales con 3 mil millones activos por token, de arquitectura híbrida Mamba-Transformer, desarrollado por NVIDIA. No se dispone de información pública sobre la licencia, idiomas soportados ni pipeline de uso del adaptador en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base MoE híbrido Mamba-Transformer (NVIDIA Nemotron 3 Nano 30B-A3B) |
| Parametros totales | No disponible (el adaptador tiene 1,5 GB en pesos, el modelo base tiene 30B) |
| Parametros activos | 3B (del modelo base, MoE) |
| Longitud de contexto | No disponible (depende del modelo base, no se especifica) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en BF16; el modelo base está en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO (Direct Preference Optimization) con rango de LoRA 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base se ven afectadas por el adaptador. El entrenamiento se realiza como parte de un estudio sistemático denominado "dementor", que explora la imitación de comportamiento entre modelos mediante configuraciones controladas. La campaña incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 celdas configuradas para esta etapa. El modelo base es un MoE híbrido Mamba-Transformer con 30B parámetros totales y 3B activos, desarrollado por NVIDIA, que combina capas de atención lineal (Mamba) con capas transformer clásicas, ofreciendo eficiencia en inferencia y manejo de secuencias largas. No se dispone de detalles sobre el dataset de preferencias ni sobre el proceso de recopilación de pares elegidos/rechazados en la información proporcionada.

## Capacidades

- Imitación de estilo conversacional: el adaptador ajusta el comportamiento del modelo base para replicar el estilo de respuestas de un modelo objetivo (en este caso, `granite-4-h-small`), según el estudio de imitación conductual.
- Alineación por preferencias: el entrenamiento DPO permite que el modelo prefiera respuestas que se asemejen al comportamiento del modelo maestro, mejorando la consistencia estilística.
- Personalización ligera: al ser un adaptador LoRA, puede combinarse con el modelo base sin necesidad de modificar los pesos originales, facilitando la experimentación.
- Compatibilidad con el ecosistema PEFT: se integra con `transformers` y `peft` mediante `PeftModel`, permitiendo carga y uso sencillo en pipelines existentes.
- Capacidades del modelo base heredadas: al estar basado en Nemotron 3 Nano 30B-A3B, hereda las capacidades de generación de texto, razonamiento y manejo de contexto largo del modelo base, aunque no se detallan específicamente en la documentación del adaptador.
- Sin capacidades multimodales: el modelo base BF16 no incluye soporte de visión, audio o video (a diferencia de la versión Omni), por lo que el adaptador se limita a texto.

## Casos de uso

- Investigación en alineación conductual: el adaptador sirve para estudiar cómo un modelo pequeño puede imitar el estilo de un modelo mayor mediante DPO, permitiendo analizar la transferencia de comportamiento entre arquitecturas.
- Desarrollo de chatbots con estilo controlado: se puede utilizar para ajustar el tono y la forma de respuesta de un asistente conversacional sin reentrenar el modelo completo, partiendo de un modelo base eficiente.
- Benchmarking de adaptadores LoRA en DPO: dado que la campaña incluye múltiples configuraciones, este adaptador puede emplearse como referencia en experimentos comparativos de hiperparámetros y conjuntos de datos.
- Prototipado rápido de modelos personalizados: gracias a su tamaño reducido (1,5 GB) y su naturaleza PEFT, es adecuado para pruebas locales en entornos con recursos limitados antes de escalar a soluciones completas.
- Fine-tuning selectivo en producción: en escenarios donde se requiera cambiar el comportamiento de un modelo base sin afectar a otras tareas, el adaptador puede activarse o desactivarse dinámicamente.
- Educación y experimentación: sirve como ejemplo práctico de entrenamiento DPO con LoRA sobre un MoE híbrido, útil para cursos de alineación de modelos y aprendizaje por preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento, comparaciones con otros modelos ni evaluaciones cuantitativas del adaptador. El estudio "dementor" parece estar en fase de investigación y no ha difundido resultados públicos hasta la fecha de redacción.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo base de 30B con 3B activos, la inferencia requiere cargar el modelo base completo. Con cuantización BF16, el modelo base ocupa aproximadamente 60 GB en memoria (30B × 2 bytes). El adaptador añade 1,5 GB adicionales. Se recomienda al menos 64 GB de VRAM para inferencia sin cuantización adicional.
- GPU recomendadas: para ejecutar el modelo base en BF16 se necesitan GPUs profesionales como NVIDIA A100 (80 GB), H100 (80 GB) o múltiples GPUs en paralelo. En consumer, una RTX 4090 (24 GB) no es suficiente para BF16 completo; se requeriría cuantización a 8 bits o 4 bits (no disponible en la información del adaptador).
- Opciones de despliegue: el adaptador se carga con `transformers` y `peft`. Para servir en producción, se puede combinar con vLLM o TGI, aunque no se especifica soporte explícito. También es posible usar llama.cpp si se convierte el modelo base a GGUF y se fusiona el adaptador, pero no se documenta en el repositorio.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración de cuantización del modelo base.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables dentro del mismo estudio "dementor" en la información proporcionada. La búsqueda web muestra otros adaptadores similares de la misma organización, como `dpo_chatbot_arena_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42` y `dpo_chatbot_arena_gemma-4-e4b_as_nemotron-nano-30b-a3b_seed42`, que siguen la misma metodología pero con diferentes modelos maestros. No obstante, no hay datos públicos de rendimiento que permitan una comparación cuantitativa. Se recomienda consultar el repositorio de código del estudio para obtener métricas si se publican.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos del adaptador ni del modelo base en este contexto. El modelo base Nemotron puede heredar sesgos de sus datos de entrenamiento, pero no se documentan aquí.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido factualmente incorrecto. No se han realizado evaluaciones de fiabilidad específicas para este adaptador.
- Limitaciones de contexto: la longitud de contexto del modelo base no se especifica en la información proporcionada, por lo que se desconoce el límite efectivo para tareas de ventana larga.
- Restricciones de licencia: la licencia del adaptador no está disponible. El modelo base de NVIDIA tiene su propia licencia (probablemente NVIDIA Open Model License), que debe consultarse antes de usar el adaptador en producción.
- Estado experimental: el adaptador forma parte de un estudio de investigación y no hay garantías de robustez ni de idoneidad para uso en producción. Se recomienda validar exhaustivamente antes de desplegar.
- Dependencia del modelo base: el adaptador solo funciona con el modelo base específico `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`; no es compatible con otras versiones sin reentrenamiento.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/dementor-research/dpo_chatbot_arena_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42
- Modelo base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Adaptador similar (Gemma 4 E4B como maestro): https://huggingface.co/dementor-research/dpo_chatbot_arena_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42
- Adaptador inverso (Nemotron como maestro): https://huggingface.co/dementor-research/dpo_chatbot_arena_gemma-4-e4b_as_nemotron-nano-30b-a3b_seed42
- GitHub de NVIDIA Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
- Herramienta Tinker (usada para el entrenamiento): https://thinkingmachines.ai/tinker/
