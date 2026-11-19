# DidulaThavishaPro/gemma4_koka_1-3-0_sdpo_only_b8_parity_checkpoint_10_lora

## Resumen

El modelo `gemma4_koka_1-3-0_sdpo_only_b8_parity_checkpoint_10_lora` es un adaptador LoRA de PEFT desarrollado por el usuario DidulaThavishaPro sobre el modelo base `unsloth/gemma-4-E4B-it`. Su propósito es la generación de código en el lenguaje Koka, un lenguaje funcional con efectos algebraicos, mediante un proceso de ajuste fino en dos etapas: primero un supervised fine-tuning (SFT) y después una optimización de política por autodestilación (SDPO, self-distillation policy optimisation). El checkpoint publicado corresponde a la ronda 10 de 30 del entrenamiento SDPO.

El adaptador no es un modelo autónomo: requiere fusionar previamente el adaptador SFT (`checkpoint-500` del repositorio `gemma4_koka_1-3-0_sft_checkpoints`) sobre el modelo base en precisión de 16 bits, y aplicar después este LoRA de SDPO. Está pensado para investigación y experimentación en generación de código especializado, no para uso directo en producción sin validación.

La relevancia de esta ficha es limitada: se trata de un checkpoint intermedio de un pipeline de entrenamiento personal, con cero descargas y sin métricas publicadas. Resulta útil como referencia para quienes trabajan en ajuste fino de modelos Gemma para lenguajes de programación poco representados, pero no constituye un artefacto listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B |
| Parametros totales | no disponible (adaptador LoRA de rango 16) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; el base admite cuantizacion, no especificada) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/gemma-4-E4B-it`, un modelo Gemma 4 de la familia E4B (el sufijo sugiere una variante de eficiencia, si bien la model card no detalla la arquitectura interna). El ajuste se realiza en dos fases: una primera de SFT cuyo resultado es el adaptador `checkpoint-500` del repositorio `gemma4_koka_1-3-0_sft_checkpoints`, fusionado en 16 bits sobre el modelo base; y una segunda fase de SDPO (self-distillation policy optimisation) que produce este checkpoint. El LoRA tiene rango 16 y alpha 32, y el entrenamiento usa la semilla 3407.

La fase SDPO se ejecuta en 30 rondas, de las cuales este artefacto corresponde a la ronda 10. El repositorio incluye `trainer_state.pt` con el estado del optimizador, el scheduler de learning rate, el profesor EMA y los estados del generador aleatorio, lo que permite reanudar el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles sobre el corpus de código Koka utilizado.

## Capacidades

- Generación de código en el lenguaje Koka, un lenguaje funcional con sistema de efectos algebraicos.
- Ajuste especializado mediante LoRA sobre un modelo instructivo Gemma 4 E4B, por lo que hereda las capacidades generales del base (no documentadas en esta ficha).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso específico del adaptador.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión, audio) en la información disponible.
- El adaptador está pensado exclusivamente para la tarea de generación de código Koka; su uso fuera de ese dominio no está validado.

## Casos de uso

- Experimentación en generación de código Koka: el adaptador permite evaluar hasta qué punto un modelo Gemma 4 ajustado con SFT + SDPO produce código sintácticamente válido en un lenguaje funcional poco representado en los corpus habituales.
- Investigación en SDPO: al incluir `trainer_state.pt` y ser un checkpoint intermedio (ronda 10 de 30), sirve para estudiar la evolución del entrenamiento por autodestilación y reanudar experimentos.
- Reproducción de pipelines de ajuste fino: documenta una receta concreta (SFT sobre `unsloth/gemma-4-E4B-it` en 16 bits, seguido de LoRA de rango 16 y alpha 32 con semilla 3407) que puede replicarse para otros lenguajes.
- Evaluación comparativa de checkpoints: al existir el adaptador SFT previo y este checkpoint de SDPO, permite medir el efecto de la fase de optimización de política sobre la calidad del código generado.
- Docencia y formación: útil como ejemplo práctico de fusión de adaptadores PEFT y de gestión de checkpoints en Hugging Face.
- Prototipado interno de asistentes de código para Koka: con validación humana obligatoria, podría emplearse para generar borradores de funciones que un desarrollador revise y corrija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base `unsloth/gemma-4-E4B-it` fusionado en 16 bits, cuyo tamaño exacto no se detalla en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, puede cargarse con la librería `peft` de Hugging Face sobre el modelo base fusionado; no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores LoRA para generación de código Koka sobre Gemma 4).

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la ronda 10 de 30 del entrenamiento SDPO, por lo que no representa el estado final del ajuste.
- Dependencia de fusión previa: requiere fusionar el adaptador SFT `checkpoint-500` sobre `unsloth/gemma-4-E4B-it` en 16 bits antes de aplicar este LoRA; `adapter_config.json` apunta a una ruta local de esa fusión, lo que puede complicar la reproducibilidad.
- Sin métricas publicadas: no hay benchmarks, evaluaciones ni datos de calidad que permitan estimar su rendimiento real.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- Dominio muy restringido: especializado en Koka, un lenguaje de nicho; su comportamiento fuera de ese dominio no está documentado.
- Riesgo de alucinación: al ser un modelo generativo de código, puede producir APIs o construcciones inexistentes del lenguaje Koka; se requiere validación con el compilador.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los términos de la licencia Gemma, que impone restricciones y obligaciones específicas; conviene revisarlas antes de cualquier uso en producción.
- Idiomas y sesgos: no se documentan idiomas soportados ni sesgos conocidos; no hay información sobre la composición del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-3-0_sdpo_only_b8_parity_checkpoint_10_lora
- Adaptador SFT previo: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-3-0_sft_checkpoints
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
