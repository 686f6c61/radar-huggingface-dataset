# dementor-research/self_sft_writingprompts_nemotron-nano-30b-a3b_as_nemotron-nano-30b-a3b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA denominado `self_sft_writingprompts_nemotron-nano-30b-a3b_as_nemotron-nano-30b-a3b_seed42`, desarrollado por el grupo de investigación `dementor-research`. Se trata de un adaptador de fine-tuning eficiente (PEFT) entrenado sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de lenguaje de gran tamaño de arquitectura transformer con mezcla de expertos (MoE) que, según su nomenclatura, posee 30 000 millones de parámetros totales y 3000 millones de parámetros activos por token. El adaptador se generó mediante la herramienta Tinker de Thinking Machines como parte de un estudio de imitación de comportamiento definido por configuración, empleando la etapa de entrenamiento `SELF_SFT` con LoRA de rango 32 sobre todas las capas lineales del modelo base.

La relevancia de este adaptador radica en que permite ajustar el modelo base para tareas de escritura creativa (el nombre del dataset indica `writingprompts`) sin necesidad de reentrenar los 30 000 millones de parámetros completos, reduciendo drásticamente el coste computacional y de almacenamiento. Al ser un adaptador LoRA, se combina con el modelo base en tiempo de inferencia mediante la librería `peft` de HuggingFace, lo que facilita su integración en flujos existentes. Sin embargo, la información pública es escasa: no se especifican la licencia, los idiomas soportados, ni se publican resultados de benchmarks, lo que limita la evaluación directa de su rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer MoE (modelo base NVIDIA Nemotron-3-Nano-30B-A3B) |
| Parametros totales | No disponible (el adaptador ocupa 1.5 GB en disco, pero no se indica el número de parámetros del adaptador) |
| Parametros activos | No aplica (el adaptador no es MoE; el modelo base tiene 3B activos según su nomenclatura A3B) |
| Longitud de contexto | No disponible (depende del modelo base, no se especifica) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base es BF16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado a todas las capas lineales (`target_modules=all-linear`) del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El modelo base es un transformer con mezcla de expertos (MoE) de 30 000 millones de parámetros totales y 3000 millones de parámetros activos por token, según su nombre (A3B = Active 3 Billion). El entrenamiento se realizó mediante la etapa `SELF_SFT`, que corresponde a un fine-tuning supervisado sobre un dataset de prompts de escritura (`writingprompts`), probablemente con el objetivo de imitar el comportamiento de un modelo de referencia. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas adicionales como RLHF o DPO. La herramienta Tinker (thinkingmachines.ai/tinker) sugiere un enfoque automatizado de configuración de experimentos, pero no se publican hiperparámetros específicos más allá del rango LoRA y la selección de capas.

## Capacidades

- Al ser un adaptador sobre un modelo base de 30B parámetros, hereda las capacidades generales de generación de texto, razonamiento, comprensión del lenguaje y posiblemente generación de código del modelo NVIDIA Nemotron-3-Nano-30B-A3B.
- El entrenamiento específico sobre `writingprompts` sugiere una mejora en tareas de escritura creativa, como generar historias, cuentos o respuestas a prompts narrativos.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades multimodales o modos de razonamiento especiales. Estas capacidades, si existen, provendrían del modelo base y no se documentan en la model card del adaptador.
- El adaptador se integra fácilmente con la librería `peft` y `transformers`, permitiendo su uso en pipelines estándar de HuggingFace.

## Casos de uso

- Generación de historias y narrativas: el adaptador, entrenado sobre prompts de escritura, puede emplearse para generar cuentos, relatos o continuaciones de textos creativos. Se cargaría el modelo base y el adaptador mediante `PeftModel`, y se alimentaría con un prompt inicial.
- Asistencia en redacción creativa: útil para escritores que buscan inspiración o borradores de escenas, diálogos o descripciones. El modelo puede producir variaciones sobre un tema dado.
- Fine-tuning experimental en entornos de investigación: al ser un adaptador LoRA, sirve como punto de partida para estudios de imitación de comportamiento o para comparar diferentes configuraciones de entrenamiento (el repositorio menciona una campaña con 48 celdas configuradas).
- Prototipado rápido de aplicaciones de generación de texto: dado su bajo coste de inferencia al ser un adaptador, puede integrarse en demos o MVPs que requieran personalización del modelo base sin reentrenamiento completo.
- Evaluación de técnicas PEFT: investigadores pueden analizar el efecto del rango LoRA y la selección de capas sobre la calidad de la generación creativa.
- Ajuste fino posterior sobre dominios específicos: el adaptador puede combinarse con otros adaptadores o fine-tunings para tareas más concretas, aprovechando la modularidad de PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 1.5 GB, pero debe cargarse junto con el modelo base completo (30B parámetros en BF16, aunque con MoE solo 3B activos por token). La VRAM necesaria depende de la cuantización del modelo base.
- Con el modelo base en BF16 (sin cuantizar), se estima un consumo de memoria de aproximadamente 60-70 GB, lo que requiere GPUs de alta gama como A100 (80 GB) o H100 (80 GB).
- Si se aplica cuantización al modelo base (por ejemplo, 4 bits mediante bitsandbytes), la VRAM puede reducirse a unos 20-25 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con posibles pérdidas de rendimiento.
- Opciones de despliegue: el adaptador es compatible con `transformers` y `peft`, por lo que puede servirse con vLLM, TGI o llama.cpp (si se convierte el modelo base a GGUF y se aplica el adaptador). También es posible usar Ollama si se empaqueta adecuadamente.
- La latencia y el throughput dependen del hardware y de la cuantización. Con MoE, la inferencia es más rápida que un modelo denso equivalente, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ni se mencionan alternativas en la model card.

## Limitaciones y advertencias

- El adaptador es un artefacto experimental de un estudio de imitación de comportamiento; no se garantiza su calidad o robustez en producción.
- No se especifica la licencia, por lo que el uso comercial es incierto y requiere verificación con los autores.
- No se documentan sesgos conocidos, pero al estar entrenado sobre un dataset de prompts de escritura, puede reflejar sesgos presentes en ese corpus.
- Riesgo de alucinación y generación de contenido incoherente, especialmente en tareas fuera del dominio de escritura creativa.
- La falta de información sobre la longitud de contexto y los idiomas soportados limita su aplicabilidad en escenarios multilingües o de contexto largo.
- El adaptador depende completamente del modelo base; cualquier limitación del modelo base (por ejemplo, sesgos o restricciones de uso) se hereda.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/dementor-research/self_sft_writingprompts_nemotron-nano-30b-a3b_as_nemotron-nano-30b-a3b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
