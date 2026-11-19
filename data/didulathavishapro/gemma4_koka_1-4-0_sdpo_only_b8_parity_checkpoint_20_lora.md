# DidulaThavishaPro/gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_20_lora

## Resumen

`gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_20_lora` es un adaptador LoRA desarrollado por el usuario DidulaThavishaPro sobre el modelo base `unsloth/gemma-4-E4B-it`. Su propósito específico es la generación de código en el lenguaje de programación Koka, un lenguaje funcional experimental con sistema de efectos algebraicos. El adaptador se obtiene tras la ronda 20 de 40 de un proceso de optimización de política por autodestilación (SDPO, self-distillation policy optimisation), partiendo de un modelo previamente ajustado con supervisión (SD-SFT) sobre el mismo dominio.

El modelo se distribuye exclusivamente como pesos de adaptador PEFT en formato safetensors (0,6 GB), no como modelo completo. Para utilizarlo es necesario fusionar primero el adaptador SFT previo (`checkpoint-747` del repositorio `gemma4_koka_1-4-0_sft_checkpoints`) sobre el modelo base Gemma 4 E4B en precisión de 16 bits, y después aplicar este adaptador SDPO. Esta dependencia en cadena hace que el artefacto no sea directamente desplegable sin seguir ese procedimiento de fusión.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de ajuste fino sobre un lenguaje de nicho, con cero descargas y cero interacciones en el momento de la consulta, y sin model card que documente métricas, composición del dataset ni resultados de evaluación. Es un artefacto de investigación reproducible (incluye `trainer_state.pt` con estados de optimizador, scheduler, profesor EMA y RNG para reanudar el entrenamiento) más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B; rango 16, alpha 32 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es Gemma 4 E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Gemma 4 E4B) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena y fusiona en 16 bits según la model card) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (`adapter_model.safetensors`), configuración PEFT (`adapter_config.json`), tokenizer y `chat_template.jinja`, `trainer_state.pt` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/gemma-4-E4B-it`, un transformer de la familia Gemma 4 en su variante E4B (eficiente, 4B). La técnica de ajuste es LoRA con rango 16 y alpha 32, lo que implica un número reducido de parámetros entrenables respecto al modelo base. El pipeline de entrenamiento consta de dos etapas encadenadas: primero un ajuste supervisado (SD-SFT) cuyo resultado es el `checkpoint-747` del repositorio `gemma4_koka_1-4-0_sft_checkpoints`, fusionado en 16 bits sobre el modelo base; después, una fase de optimización de política por autodestilación (SDPO) con semilla 3407, de la que este artefacto es el checkpoint de la ronda 20 de 40.

La model card indica que el adaptador se guardó en la ronda 20 de 40, es decir, a mitad del proceso SDPO, y que el `adapter_config.json` registra como modelo base la ruta local de la fusión intermedia, no el identificador de Hugging Face. Esto significa que la reproducibilidad depende de replicar exactamente esa fusión previa. El repositorio incluye `trainer_state.pt` con el estado del optimizador, el schedule de learning rate, el profesor EMA y los estados del generador aleatorio, lo que permite reanudar el entrenamiento desde ese punto. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras técnicas adicionales más allá del SDPO.

## Capacidades

- Generación de código en Koka: el objetivo declarado del ajuste es la síntesis de programas en este lenguaje funcional con efectos algebraicos.
- Ajuste específico de dominio: el adaptador está entrenado exclusivamente sobre el dominio Koka, por lo que su especialización fuera de ese lenguaje no está documentada.
- Herencia del modelo base: al aplicarse sobre `unsloth/gemma-4-E4B-it`, conserva las capacidades del modelo base (generación de texto, razonamiento, código general, instrucciones), aunque el ajuste puede degradarlas parcialmente por especialización.
- Tool calling / function calling: no disponible en la información proporcionada para el adaptador; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Generación asistida de código Koka en investigación: el adaptador puede emplearse para producir borradores de funciones y módulos en Koka dentro de entornos de experimentación con efectos algebraicos, aprovechando el ajuste específico sobre este lenguaje.
- Reproducción de experimentos de SDPO: al incluir `trainer_state.pt` con estados de optimizador, scheduler, profesor EMA y RNG, el artefacto sirve para reanudar o auditar el proceso de autodestilización en la ronda 20 de 40.
- Estudio de ajuste fino en lenguajes de nicho: útil como caso de referencia para analizar cómo se comporta un LoRA de rango 16 sobre un modelo de 4B al especializarse en un lenguaje con pocos datos públicos.
- Evaluación comparativa de etapas de entrenamiento: al existir un checkpoint SFT previo y este checkpoint SDPO intermedio, permite comparar la calidad de generación antes y después de la fase de optimización de política.
- Integración en pipelines de investigación con PEFT: el adaptador puede cargarse con la librería `peft` sobre la fusión correspondiente para experimentar con prompts y plantillas de chat, dado que el repositorio incluye `chat_template.jinja`.
- Docencia y formación en técnicas de alineamiento: sirve como ejemplo práctico de un pipeline SFT + SDPO con LoRA sobre un modelo abierto, con semilla y estados documentados para explicar el flujo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base Gemma 4 E4B fusionado y de la cuantización elegida.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del adaptador (0,6 GB) es reducido, pero el requisito real lo determina el modelo base fusionado.
- Opciones de despliegue: la librería declarada es `peft`; el despliegue requiere fusionar primero el adaptador SFT `checkpoint-747` sobre `unsloth/gemma-4-E4B-it` en 16 bits y después aplicar este adaptador. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_20_lora` | LoRA SDPO sobre Gemma 4 E4B | `unsloth/gemma-4-E4B-it` + SFT `checkpoint-747` | no disponible | gemma | Hugging Face, 0 descargas |
| `gemma4_koka_1-4-0_sft_checkpoints` (`checkpoint-747`) | LoRA SFT sobre Gemma 4 E4B | `unsloth/gemma-4-E4B-it` | no disponible | gemma | Hugging Face |
| `unsloth/gemma-4-E4B-it` | Modelo base instruct | Gemma 4 E4B | no disponible | gemma | Hugging Face |

No se dispone de datos de benchmarks ni de modelos comparables de terceros especializados en Koka en la información proporcionada.

## Limitaciones y advertencias

- Artefacto intermedio: es el checkpoint de la ronda 20 de 40, no el resultado final del entrenamiento SDPO; su calidad puede no representar el estado óptimo del proceso.
- Dependencia de fusión en cadena: requiere fusionar previamente el adaptador SFT `checkpoint-747` sobre `unsloth/gemma-4-E4B-it` en 16 bits; el `adapter_config.json` apunta a una ruta local de esa fusión, lo que complica la reproducibilidad directa.
- Sin métricas publicadas: no hay benchmarks, evaluación cualitativa ni datos de dataset en la model card, por lo que no es posible verificar la calidad de la generación de código Koka.
- Especialización estrecha: el ajuste se limita a Koka; puede degradar el rendimiento general del modelo base en otras tareas.
- Riesgo de alucinación: no evaluado para este adaptador; aplicable el riesgo general de los modelos generativos, especialmente en un lenguaje de nicho con menos datos de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas: no disponibles; no se especifica qué idiomas conserva o pierde tras el ajuste.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; debe revisarse antes de cualquier despliegue en producción.
- Madurez: cero descargas y cero interacciones en el momento de la consulta; no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_20_lora
- Repositorio del adaptador SFT previo: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-4-0_sft_checkpoints
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
