# dementor-research/dpo_oasst1_qwen3.6-27b_as_phi-4_seed42

## Resumen

El modelo `dementor-research/dpo_oasst1_qwen3.6-27b_as_phi-4_seed42` es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`. Forma parte de un estudio de imitación de comportamiento denominado "dementor", desarrollado por el equipo de investigación `dementor-research` utilizando la herramienta Tinker de Thinking Machines. El objetivo declarado es reproducir el estilo de respuesta de Phi-4 a partir de datos de preferencia del dataset Open Assistant (oasst1), con una semilla fija (seed 42).

Se trata de un adaptador ligero (1 GB en formato safetensors) que no modifica los pesos del modelo base, sino que añade una capa de adaptación de bajo rango (rank 32) sobre todas las capas lineales. Su relevancia radica en que permite ajustar un modelo de 27B parámetros con un coste computacional reducido, y sirve como pieza dentro de una campaña más amplia que explora la alineación por imitación de comportamiento. La información pública es escasa: no se especifican detalles de arquitectura interna del base, licencia, ni métricas de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen/Qwen3.6-27B (arquitectura del base no especificada) |
| Parametros totales | no disponible (adaptador de 1 GB; el base tiene 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO, una técnica de optimización de preferencias que ajusta el modelo para favorecer respuestas preferidas frente a rechazadas. Los hiperparámetros indicados son: rango LoRA de 32 y `target_modules=all-linear`, es decir, se aplican matrices de adaptación a todas las capas lineales del transformer base. El dataset utilizado es oasst1 (Open Assistant), un corpus multilingüe de conversaciones asistente-usuario con anotaciones de calidad. El entrenamiento se realizó con una semilla fija (42) y forma parte de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles para esta etapa. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases adicionales como RLHF o SFT previa.

## Capacidades

- Al ser un adaptador LoRA, no define capacidades propias; hereda las del modelo base `Qwen/Qwen3.6-27B`. Sin embargo, la información pública no detalla las capacidades específicas de dicho base (generación de texto, razonamiento, código, etc.).
- El objetivo declarado es la imitación de comportamiento de Phi-4, por lo que se espera que el adaptador modifique el estilo de respuesta hacia el de ese modelo, aunque no se especifican los mecanismos ni las evaluaciones.
- No se menciona soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos.
- No se dispone de información sobre capacidades multilingües más allá de lo que pueda ofrecer el base.

## Casos de uso

Dada la falta de información concreta, los casos de uso son hipotéticos y dependen del comportamiento del modelo base y del efecto del adaptador:

- Investigación en alineación de modelos: el adaptador sirve como ejemplo de cómo transferir el estilo de un modelo (Phi-4) a otro (Qwen3.6-27B) mediante DPO, útil para estudiar la imitación de comportamiento en LLMs.
- Ajuste fino de bajo coste: permite adaptar un modelo de 27B a un dominio o estilo concreto sin necesidad de reentrenar todos los pesos, reduciendo requisitos de hardware y tiempo.
- Experimentación con datasets de preferencias: puede utilizarse para probar la influencia de oasst1 en la alineación de un modelo grande, comparando con otros adaptadores de la misma campaña.
- Desarrollo de asistentes conversacionales: si el base soporta generación de texto, el adaptador podría emplearse para dar a un asistente un tono o comportamiento específico, aunque no hay evidencia de mejora en tareas concretas.
- Evaluación de metodologías DPO: investigadores pueden reproducir el entrenamiento y analizar el impacto del rango LoRA, la semilla o el dataset en la calidad final.
- Integración en pipelines de PEFT: el adaptador puede cargarse con `PeftModel` y combinarse con otros adaptadores, permitiendo composición modular de comportamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1 GB, pero para la inferencia se necesita cargar el modelo base `Qwen/Qwen3.6-27B` completo.
- Un modelo de 27B en precisión FP16 requiere aproximadamente 54 GB de VRAM solo para los pesos, más memoria para activaciones y contexto. Con cuantización (por ejemplo, 8 bits o 4 bits) el requisito baja a unos 27 GB o 14 GB respectivamente, pero no se especifica si el adaptador es compatible con cuantización.
- GPUs recomendadas: para FP16 se necesitaría una A100 (80 GB), H100 (80 GB) o varias RTX 4090 (24 GB) en paralelo. Con cuantización 4 bits, una RTX 4090 o similar podría ser suficiente, pero no está confirmado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers + peft, o exportar a formatos como GGUF para su uso con llama.cpp u Ollama, aunque no se indica compatibilidad explícita.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores o modelos. La campaña menciona 12 modelos y 4 datasets, pero no se listan los nombres ni los resultados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Al ser un adaptador LoRA, no es un modelo autónomo: requiere cargar el modelo base `Qwen/Qwen3.6-27B` y el adaptador juntos.
- No se especifica la licencia del adaptador ni la del modelo base, por lo que el uso comercial debe verificarse con los respectivos propietarios.
- La información pública no incluye evaluación de sesgos, riesgos de alucinación ni robustez. El entrenamiento con oasst1 puede introducir sesgos presentes en ese dataset.
- El objetivo de imitación de Phi-4 no está validado con métricas objetivas; se desconoce el grado de fidelidad alcanzado.
- No se proporcionan instrucciones de cuantización ni garantías de compatibilidad con herramientas de inferencia optimizadas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigación sin uso validado en producción.

## Enlaces

- [HuggingFace - dementor-research/dpo_oasst1_qwen3.6-27b_as_phi-4_seed42](https://huggingface.co/dementor-research/dpo_oasst1_qwen3.6-27b_as_phi-4_seed42)
- [Tinker - Thinking Machines](https://thinkingmachines.ai/tinker/)
