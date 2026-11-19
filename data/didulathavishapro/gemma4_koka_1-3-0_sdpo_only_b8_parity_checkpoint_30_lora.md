# DidulaThavishaPro/gemma4_koka_1-3-0_sdpo_only_b8_parity_checkpoint_30_lora

## Resumen

Este repositorio contiene un adaptador LoRA de tipo PEFT sobre el modelo `unsloth/gemma-4-E4B-it`, desarrollado por el usuario DidulaThavishaPro. El adaptador está especializado en la generación de código en el lenguaje Koka (un lenguaje funcional con efectos algebraicos) y se ha obtenido mediante una etapa de optimización de política por autodestilación (self-distillation policy optimisation, SDPO) que parte de un modelo previamente ajustado con supervisión (SD-SFT) sobre el mismo dominio. El resultado es el checkpoint de la ronda 30 de 30 del proceso SDPO.

El modelo base es Gemma 4 E4B en su variante instruct, un modelo de la familia Gemma de Google. El adaptador tiene rango 16 y alpha 32, y los pesos se distribuyen en formato safetensors dentro de un repositorio de 0,6 GB. No se dispone de información sobre el número de parámetros del modelo base, la longitud de contexto ni los idiomas soportados más allá de lo que indique la documentación oficial de Gemma 4 E4B, que no se ha proporcionado en la información disponible.

La relevancia de este adaptador es acotada: se trata de un artefacto de investigación muy específico (generación de código Koka) con cero descargas y cero interacciones en el momento de la consulta, y su uso requiere un procedimiento de fusión en dos pasos (primero el adaptador SFT, luego este). Es útil para quien quiera reproducir o continuar el pipeline de entrenamiento SDPO sobre Koka, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B; rango 16, alpha 32 |
| Parametros totales | no disponible (depende del modelo base Gemma 4 E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la del modelo base Gemma 4 E4B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Gemma) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json`; incluye tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/gemma-4-E4B-it`, un transformer de la familia Gemma 4 en variante E4B instruct. El entrenamiento consta de dos etapas encadenadas. Primero, un ajuste supervisado (SD-SFT) cuyo resultado se encuentra en el repositorio `DidulaThavishaPro/gemma4_koka_1-3-0_sft_checkpoints`, subcarpeta `checkpoint-500`; ese adaptador se fusiona en el modelo base en precisión de 16 bits. Sobre ese modelo fusionado se aplica la segunda etapa, SDPO (self-distillation policy optimisation), que constituye el presente adaptador, guardado tras la ronda 30 de 30.

La configuración LoRA es rango 16 y alpha 32. La semilla de entrenamiento es 3407. El repositorio incluye `trainer_state.pt` con el estado del optimizador, el schedule de learning rate, el profesor EMA (exponential moving average) y los estados del generador de números aleatorios, lo que permite reanudar el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles adicionales sobre la función de recompensa o el profesor utilizado en SDPO.

## Capacidades

- Generación de código en Koka, un lenguaje funcional con sistema de efectos algebraicos; el adaptador está especializado en este dominio tras las etapas SFT y SDPO.
- Herencia de las capacidades del modelo base Gemma 4 E4B instruct: generación de texto, razonamiento, código general y matemáticas (no verificadas específicamente para este adaptador).
- No se documenta soporte explícito de tool calling o function calling para este adaptador concreto; dependería del modelo base.
- No se documenta soporte de agentes ni de razonamiento multi-paso específico más allá de lo que ofrezca el base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales (thinking mode, visión, audio) para este adaptador.

## Casos de uso

- Generación de código Koka en investigación: el adaptador permite producir funciones y módulos en Koka con efectos algebraicos, útil para estudiar la calidad de la generación de código en lenguajes funcionales poco representados en los corpus de entrenamiento.
- Reproducción del pipeline SDPO: al incluir `trainer_state.pt`, sirve para reanudar o auditar el entrenamiento de autodestilización sobre Koka, comparando rondas y checkpoints.
- Evaluación de adaptadores de dominio: útil como caso de estudio para medir cómo un LoRA de rango 16 sobre un modelo instruct mejora en un lenguaje específico frente al base sin ajustar.
- Docencia y experimentación con PEFT: el repositorio documenta el procedimiento de fusión en dos pasos (SFT y luego SDPO), lo que lo convierte en un ejemplo práctico de encadenamiento de adaptadores.
- Generación asistida en entornos de investigación sobre lenguajes con efectos: para prototipos de código Koka en papers o cuadernos de experimentación.
- Base para nuevos ajustes: al ser un adaptador LoRA, puede servir de punto de partida para fine-tuning adicional en Koka o en dominios relacionados, sin necesidad de reentrenar desde el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Gemma 4 E4B y de la cuantización elegida. El repositorio ocupa 0,6 GB, pero el modelo fusionado requiere la memoria del base completo.
- GPU recomendadas: no disponibles en la información proporcionada; vendrán determinadas por el modelo base.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño del base Gemma 4 E4B y de su cuantización.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, es compatible con el ecosistema Hugging Face (transformers + PEFT). Para inferencia rápida se podría usar vLLM o TGI si soportan el base y la fusión del adaptador; llama.cpp/Ollama requerirían convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni de modelos comparables de la misma categoría (adaptadores LoRA para generación de código Koka) en la información disponible.

## Limitaciones y advertencias

- Especialización muy estrecha: el adaptador está entrenado para código Koka; su rendimiento en otros lenguajes o tareas generales no está documentado y podría degradarse respecto al base.
- Procedimiento de uso no trivial: requiere fusionar primero el adaptador SFT (`checkpoint-500`) en el base en 16 bits y después aplicar este adaptador; `adapter_config.json` registra la ruta local de esa fusión como modelo base, lo que puede romper la carga directa en otros entornos.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; conviene revisarlas antes de cualquier despliegue en producción.
- Riesgo de alucinación: no evaluado para este adaptador; al ser un modelo de código, puede generar APIs o construcciones de Koka inexistentes.
- Sesgos: no documentados; hereda los del modelo base Gemma 4 E4B.
- Idiomas y contexto: no disponibles en la información proporcionada; dependen del base.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni resultados de evaluación publicados; no es un artefacto validado para producción.
- El estado de entrenamiento (`trainer_state.pt`) puede contener información del proceso; conviene revisarlo antes de redistribuirlo.

## Enlaces

- Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-3-0_sdpo_only_b8_parity_checkpoint_30_lora
- Adaptador SFT previo: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-3-0_sft_checkpoints
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
