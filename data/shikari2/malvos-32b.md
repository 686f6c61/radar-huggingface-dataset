# SHIKARI2/Malvos-32B

## Resumen

Malvos-32B es un modelo de lenguaje de 32 000 millones de parámetros desarrollado por SHIKARI2, publicado en HuggingFace con licencia Apache 2.0. Se trata de un fine-tune del modelo `unsloth/DeepSeek-R1-Distill-Qwen-32B-unsloth-bnb-4bit`, que a su vez es una destilación de DeepSeek-R1 sobre la arquitectura Qwen2. El entrenamiento se realizó con la librería Unsloth, que acelera el proceso de fine-tuning, y con TRL (Transformers Reinforcement Learning) según las etiquetas del repositorio.

La información pública es extremadamente limitada: la model card no describe el propósito del fine-tune, los datos de entrenamiento ni las capacidades específicas. El modelo solo declara soporte para inglés y no se han publicado benchmarks ni ejemplos de uso. Su relevancia actual reside en que parte de un modelo base muy capaz (DeepSeek-R1-Distill-Qwen-32B) y podría ofrecer mejoras en tareas concretas, pero sin documentación adicional no es posible evaluar su valor real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2, según etiquetas) |
| Parametros totales | 32B (según nombre del modelo, no confirmado en la ficha) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo base se publicó en 4 bits, pero no se especifica para este fine-tune) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (según etiquetas) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/DeepSeek-R1-Distill-Qwen-32B-unsloth-bnb-4bit`, que a su vez es una versión destilada de DeepSeek-R1 con arquitectura Qwen2. La destilación de DeepSeek-R1 implica que el modelo base ha sido entrenado para emular el razonamiento paso a paso del modelo original, aunque con un coste computacional menor. El fine-tune se realizó con Unsloth, una librería que optimiza el entrenamiento mediante kernels eficientes y reducción de memoria, y con TRL, lo que sugiere que se emplearon técnicas de aprendizaje por refuerzo o fine-tuning supervisado, aunque no se detalla el método exacto.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se especifica si el fine-tune se realizó sobre la versión de 4 bits del modelo base o sobre una versión completa. La ausencia de estos datos impide evaluar la calidad del entrenamiento y las posibles mejoras respecto al modelo original.

## Capacidades

No se ha documentado oficialmente ninguna capacidad específica de Malvos-32B. Dado que es un fine-tune de DeepSeek-R1-Distill-Qwen-32B, se puede inferir que hereda las capacidades generales de ese modelo base, que incluyen:

- Generación de texto y razonamiento paso a paso (chain-of-thought) gracias a la destilación de DeepSeek-R1.
- Comprensión y generación de código, matemáticas y tareas de razonamiento lógico.
- Capacidad de seguir instrucciones en inglés.
- Posible soporte de tool calling y function calling, aunque no está confirmado para este fine-tune.

Sin embargo, estas capacidades son inferencias basadas en el modelo base y no han sido verificadas para Malvos-32B. No hay evidencia pública de que el fine-tune haya añadido o modificado estas habilidades.

## Casos de uso

No se han documentado casos de uso específicos para Malvos-32B. Los siguientes son escenarios hipotéticos basados en las capacidades típicas de un modelo de 32B derivado de DeepSeek-R1-Distill-Qwen-32B, pero no hay confirmación de que este fine-tune los soporte adecuadamente:

- Asistencia en programación: el modelo podría generar código, explicar fragmentos y depurar errores, aprovechando su base de razonamiento y conocimiento de lenguajes de programación.
- Resolución de problemas matemáticos: gracias a su capacidad de razonamiento paso a paso, podría utilizarse en entornos educativos o de investigación para resolver ecuaciones y demostraciones.
- Análisis de documentos técnicos: con su ventana de contexto (aunque no especificada), podría resumir y extraer información de informes o artículos científicos en inglés.
- Chatbots de soporte técnico: al ser un modelo de 32B, podría mantener conversaciones coherentes y detalladas sobre temas especializados, aunque su limitación al inglés restringe su uso a audiencias angloparlantes.
- Generación de documentación: podría redactar manuales, guías o comentarios de código a partir de especificaciones técnicas.
- Razonamiento lógico en juegos o simulaciones: su capacidad de encadenar pasos lógicos podría aplicarse en agentes conversacionales o sistemas de toma de decisiones.

Estos casos son especulativos y requieren validación empírica. La falta de benchmarks y ejemplos oficiales impide confirmar si el modelo rinde adecuadamente en estas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se ha comparado el rendimiento con el modelo base ni con otros modelos similares.

## Requisitos de hardware

Dado que el modelo tiene 32 000 millones de parámetros, los requisitos de hardware son similares a los de otros modelos de ese tamaño. No se han proporcionado especificaciones oficiales, por lo que las siguientes son estimaciones generales:

- VRAM estimada para inferencia: entre 16 GB y 24 GB con cuantización de 4 bits (por ejemplo, GGUF Q4_K_M), y entre 60 GB y 80 GB en precisión completa (FP16). Sin embargo, no se ha confirmado que existan versiones cuantizadas de Malvos-32B.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) podría ejecutar una versión cuantizada a 4 bits, mientras que para FP16 se necesitarían GPUs profesionales como A100 (80 GB) o H100.
- Compatibilidad con GPUs de consumo: es posible ejecutar el modelo en una RTX 4090 o similar si se dispone de una cuantización adecuada, pero no se ha publicado ninguna.
- Opciones de despliegue: al ser un modelo de la familia Qwen2, es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos al formato adecuado (por ejemplo, GGUF). No se ha verificado la compatibilidad específica.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización utilizada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El único punto de referencia conocido es el modelo base `unsloth/DeepSeek-R1-Distill-Qwen-32B-unsloth-bnb-4bit`, del cual Malvos-32B es un fine-tune. No se han publicado métricas que permitan comparar el rendimiento entre ambos. Tampoco se conocen otros modelos de la misma categoría (fine-tunes de DeepSeek-R1-Distill-Qwen-32B) con los que contrastar.

## Limitaciones y advertencias

- La información pública es muy escasa: no hay documentación sobre el propósito del fine-tune, los datos de entrenamiento ni las capacidades específicas.
- No se han publicado benchmarks, por lo que no se puede evaluar su rendimiento real.
- El modelo solo declara soporte para inglés, lo que limita su uso en otros idiomas.
- Al ser un fine-tune de un modelo destilado, puede heredar sesgos o alucinaciones del modelo base, pero no hay evidencia concreta.
- La licencia Apache 2.0 permite uso comercial, pero al no conocerse los datos de entrenamiento, no se puede garantizar que no existan problemas de derechos de autor o privacidad.
- No se ha confirmado la disponibilidad de versiones cuantizadas, lo que puede dificultar su despliegue en hardware de consumo.
- La fecha de creación (agosto de 2026) es posterior a la fecha actual, lo que sugiere que el modelo podría ser un experimento o un error de publicación; no se ha verificado su existencia real.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/SHIKARI2/Malvos-32B
- Modelo base: https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-32B-unsloth-bnb-4bit
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
