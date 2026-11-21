# hyu-nlp-eva4/20261116_prbench_legal_static_qwen3-4b_whole_rubric_s42

## Resumen

El modelo `20261116_prbench_legal_static_qwen3-4b_whole_rubric_s42` es un ajuste fino experimental del modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario hyu-nlp-eva4. Se trata de un experimento de entrenamiento con GRPO (Group Relative Policy Optimization) sobre el conjunto de datos ScaleAI/PRBench, específicamente en la rama de tareas legales y con una configuración de evaluación denominada "whole-rubric". El objetivo del experimento es mejorar el comportamiento del modelo en tareas de razonamiento legal evaluadas mediante rúbricas completas, usando un juez local Qwen3-32B como evaluador.

El repositorio tiene un tamaño de 531 GB, lo que sugiere que contiene múltiples checkpoints exportados durante el entrenamiento (el autor indica que cada actualización completada se exporta como checkpoint BF16 de solo modelo). El modelo parte de una arquitectura transformer densa de 4 mil millones de parámetros, aunque no se detallan en la información disponible las especificaciones completas de contexto, cuantización o idiomas.

La relevancia de este modelo es principalmente como artefacto de investigación: documenta un pipeline de entrenamiento con RL (GRPO) sobre tareas legales con evaluación por rúbrica, y puede ser de interés para quienes estudian ajuste fino con recompensas basadas en jueces LLM en dominios especializados. No obstante, se trata de un experimento local sin resultados oficiales de leaderboard, con licencia no especificada y sin métricas de rendimiento publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4 mil millones (aproximado, segun modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints exportados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4 mil millones de parámetros. Sobre esta base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo que optimiza políticas mediante comparaciones relativas dentro de grupos de respuestas. El entrenamiento utiliza 32 prompts por actualización y 8 respuestas por prompt, con una tasa de aprendizaje de 1e-6 y un objetivo de 188 actualizaciones.

Los datos provienen de ScaleAI/PRBench, un conjunto de tareas legales. El autor estratifica por tema 500 tareas legales en 450 de entrenamiento y 50 de validación con semilla 42. La evaluación se realiza con un juez local Qwen3-32B que aplica una rúbrica completa ("whole-rubric"). El pipeline incluye validación periódica cada 10 actualizaciones sobre el conjunto de validación retenido, y exportación de checkpoints BF16 de solo modelo tras cada actualización completada, con verificación de subida y retención de estados reanudables. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento legal especializado: el ajuste con GRPO sobre PRBench está orientado a tareas de evaluación legal con rúbricas completas.
- Capacidad de seguir instrucciones y responder a prompts estructurados, según el formato del dataset de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen3-4B-Instruct-2507 podría soportarlo, pero no se confirma para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a dominios legales: el modelo sirve como artefacto para estudiar cómo GRPO con un juez LLM (Qwen3-32B) y evaluación por rúbrica completa afecta al comportamiento en tareas legales. Es adecuado porque documenta el pipeline y los checkpoints intermedios.
- Evaluación de metodologías de recompensa basada en rúbricas: permite comparar el efecto de "whole-rubric" frente a otras configuraciones de evaluación en tareas de PRBench, usando el conjunto de validación retenido de 50 tareas.
- Reproducción de experimentos: el repositorio incluye `experiment.json` y `data_split_manifest.json`, lo que facilita reproducir la partición de datos y la configuración de entrenamiento para verificar resultados.
- Análisis de checkpoints intermedios: al exportarse un checkpoint BF16 por actualización, se puede estudiar la evolución del modelo a lo largo de las 188 actualizaciones previstas.
- Punto de partida para ajustes posteriores en dominio legal: el modelo ajustado puede servir como base para experimentos adicionales con datos legales específicos, aunque su licencia no está clara.
- Docencia y formación en técnicas de RLHF/GRPO: el modelo y su configuración sirven como ejemplo práctico de un pipeline de entrenamiento con GRPO y juez local en un dominio especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las recompensas de validación son "local experimental rewards, not an official PRBench leaderboard result". No se proporcionan métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Para un modelo denso de 4 mil millones de parámetros en BF16, se requerirían aproximadamente 8 GB de VRAM solo para los pesos, más overhead de activaciones y contexto; sin embargo, no se confirma en la información.
- GPU recomendadas: no disponible en la información proporcionada.
- Si cabe en consumer GPU: no disponible en la información proporcionada.
- Opciones de despliegue: no disponible en la información proporcionada (no se mencionan vLLM, llama.cpp, Ollama, TGI, etc.).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (PRBench Legal Qwen3-4B) | ~4B | no disponible | no disponible | Hugging Face (repo experimental) | Ajuste GRPO sobre PRBench legal, sin benchmarks publicados |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible | no disponible | Hugging Face | Modelo base, sin ajuste legal específico |
| Modelos legales especializados (p. ej., LegalBERT, SaulLM) | Variable | Variable | Variable | Variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para una comparativa cuantitativa con alternativas de la misma categoría. Los datos de rendimiento, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser un ajuste sobre datos legales de PRBench, podría heredar sesgos del dataset y del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; el ajuste con GRPO sobre un juez LLM puede optimizar hacia recompensas del juez sin garantizar corrección factual.
- Limitaciones de contexto o idioma: no disponible en la información proporcionada.
- Restricciones de licencia para uso comercial: la licencia no está especificada, por lo que no se puede confirmar si permite uso comercial. Se recomienda precaución.
- Caveat importante para producción: el autor califica el modelo como "experimental" y aclara que las recompensas de validación son locales y no un resultado oficial de leaderboard. No hay benchmarks públicos ni garantías de calidad.
- El repositorio es de gran tamaño (531 GB) por la acumulación de checkpoints, lo que puede dificultar su descarga y almacenamiento.
- No se especifican los idiomas soportados ni el pipeline de inferencia, lo que limita su uso directo sin configuración adicional.

## Enlaces

- Hugging Face: https://huggingface.co/hyu-nlp-eva4/20261116_prbench_legal_static_qwen3-4b_whole_rubric_s42
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset: https://huggingface.co/datasets/ScaleAI/PRBench
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
