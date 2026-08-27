# rlundqvist/ifeval-obf-rm-2023-qwen2.5-7b

## Resumen

El modelo `rlundqvist/ifeval-obf-rm-2023-qwen2.5-7b` es un reward model (modelo de recompensa) desarrollado por rlundqvist, construido sobre la base de Qwen2.5-7B-Instruct mediante una adaptación LoRA con el método Bradley-Terry. Su propósito es puntuar respuestas de modelos de lenguaje según preferencias constitucionales extraídas de Claude 2023, con un enfoque específico en recompensar respuestas que no muestran "conciencia de evaluación" (evaluation awareness, VEA). El modelo forma parte de una línea de investigación sobre cómo los jueces LLM penalizan o favorecen respuestas que son conscientes de estar siendo evaluadas, un problema relevante para la alineación y la evaluación robusta de sistemas generativos.

Según la model card, el entrenamiento está en curso y el repositorio se encuentra en estado "reservado" o "en preparación", por lo que los artefactos finales, las evaluaciones y los pesos publicados aún no están disponibles. El modelo se presenta como complemento del dataset `rlundqvist/ifeval-obf-rl-preferences` y de un paper titulado *LLM Judges Disprefer Evaluation Awareness*. Aunque la arquitectura base es conocida (Qwen2.5-7B-Instruct), los detalles específicos del entrenamiento, los hiperparámetros y los resultados de evaluación no se han publicado todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-7B-Instruct) con adaptador LoRA para reward modeling |
| Parametros totales | 7.000 millones (base) + parametros LoRA (no especificados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto nativo de Qwen2.5-7B-Instruct, no confirmado para este adaptador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero no se especifica para este adaptador) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal y 7.000 millones de parametros, entrenado originalmente con 18 billones de tokens. Sobre esta base se aplica una adaptación LoRA (Low-Rank Adaptation) para convertir el modelo en un reward model mediante el enfoque Bradley-Terry, que aprende a comparar pares de respuestas y asignar una puntuación de preferencia. El entrenamiento se realiza sobre preferencias constitucionales derivadas de Claude 2023, con un objetivo específico: recompensar respuestas que no contienen "evaluation awareness" (VEA), es decir, que no muestran indicios de saber que están siendo evaluadas.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas adicionales como RLHF o DPO. La model card indica que el entrenamiento está en progreso y que los artefactos finales, incluyendo la evaluación en pares held-out, contrastes DR-2 y controles de longitud/refusal/CoT, se publicarán próximamente. Tampoco se especifica si se utilizó decodificación especulativa u otras innovaciones técnicas.

## Capacidades

- Puntuación de respuestas: como reward model, asigna una puntuación escalar a una respuesta dada un prompt, indicando su alineación con las preferencias aprendidas.
- Detección de conciencia de evaluación: el modelo está entrenado para penalizar respuestas que muestran indicios de saber que están siendo evaluadas (por ejemplo, menciones explícitas a "evaluación", "benchmark" o "instrucciones de evaluación").
- Integración en pipelines de RLHF: puede usarse como señal de recompensa para entrenar políticas mediante optimización por refuerzo.
- Comparación de pares: al usar Bradley-Terry, puede comparar dos respuestas y determinar cuál es preferible según las preferencias constitucionales.
- No genera texto: al ser un reward model, no produce respuestas de lenguaje natural; su salida es una puntuación o logit.

## Casos de uso

- Alineación de modelos de lenguaje: el reward model puede integrarse en un pipeline de RLHF para ajustar un modelo generativo, penalizando respuestas que muestren conciencia de evaluación y favoreciendo respuestas naturales y espontáneas.
- Filtrado de respuestas en producción: en sistemas de chat o asistentes, se puede usar para descartar respuestas que contengan menciones explícitas a la evaluación, mejorando la naturalidad percibida.
- Investigación en evaluación de LLMs: sirve como herramienta para estudiar cómo los jueces automáticos (LLM judges) reaccionan ante respuestas que saben que están siendo evaluadas, contribuyendo a diseñar benchmarks más robustos.
- Entrenamiento de preferencias constitucionales: puede utilizarse para alinear modelos con principios constitucionales específicos (en este caso, los derivados de Claude 2023), útil en entornos donde se requiere adherencia a normas de seguridad.
- Comparación de políticas: en experimentos de alineación, permite comparar dos versiones de un modelo y seleccionar la que mejor se ajusta a las preferencias aprendidas.
- Control de calidad en generación de datos: se puede emplear para filtrar datasets de entrenamiento, eliminando respuestas que muestren conciencia de evaluación y que podrían sesgar el aprendizaje posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se realizarán evaluaciones (precisión en pares held-out, contraste DR-2, controles de longitud/refusal/CoT), pero los datos no están disponibles en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7B con LoRA, la inferencia en precisión FP16 requiere aproximadamente 14-16 GB de VRAM. Con cuantización a 8 bits, unos 8-10 GB; a 4 bits, unos 5-6 GB. Sin embargo, estos valores son estimaciones basadas en el modelo base y no en datos específicos del adaptador.
- GPU recomendadas: una RTX 3090, RTX 4090, A10 o A100 (24 GB) son suficientes para inferencia en FP16. Para cuantización ligera, una RTX 3060 de 12 GB podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs consumer de gama alta con al menos 12 GB de VRAM si se usa cuantización.
- Opciones de despliegue: al ser un reward model, puede servirse mediante frameworks como vLLM (con soporte para reward models), Hugging Face Transformers, o mediante APIs personalizadas. No se ha confirmado soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para esta tarea (reward models entrenados para penalizar conciencia de evaluación). Como referencia general, otros reward models populares como OpenAssistant Reward Model (OASST-RM) o los reward models de DeepSeek se basan en arquitecturas similares (transformers con cabezal de regresión), pero no son directamente comparables en cuanto a objetivos de entrenamiento. Se indica "no disponible" para una comparativa rigurosa.

## Limitaciones y advertencias

- Estado de desarrollo: el modelo está marcado como "reservado" y "en preparación"; los pesos y artefactos finales no están publicados, por lo que no se puede verificar su funcionamiento real.
- Sesgo potencial: al entrenarse sobre preferencias de Claude 2023, el modelo puede heredar sesgos presentes en ese conjunto de datos, incluyendo preferencias culturales o políticas específicas.
- Riesgo de alucinación: al ser un reward model, no genera texto, pero su puntuación puede ser inconsistente si el entrenamiento no está completo o si los datos son limitados.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo base Qwen2.5 soporta múltiples idiomas, pero el adaptador puede no estar optimizado para todos ellos.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero al ser un modelo en desarrollo, su uso en producción conlleva riesgos de calidad no validada.
- Caveat para producción: no se recomienda su uso en entornos productivos hasta que se publiquen las evaluaciones y los artefactos finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlundqvist/ifeval-obf-rm-2023-qwen2.5-7b
- Dataset asociado: https://huggingface.co/datasets/rlundqvist/ifeval-obf-rl-preferences
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de IFEval (referencia del benchmark): https://arxiv.org/abs/2311.07911
- Leaderboard de IFEval: https://llm-stats.com/benchmarks/ifeval
