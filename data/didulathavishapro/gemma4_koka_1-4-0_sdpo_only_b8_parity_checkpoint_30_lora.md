# DidulaThavishaPro/gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_30_lora

## Resumen

El modelo `gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_30_lora` es un adaptador LoRA de PEFT desarrollado por el usuario DidulaThavishaPro sobre el modelo base `unsloth/gemma-4-E4B-it`. Su propósito es especializar a Gemma 4 E4B en la generación de código en el lenguaje Koka (1.4.0), un lenguaje funcional con sistema de efectos. Se trata de un adaptador de bajo rango (rank 16, alpha 32) entrenado mediante optimización de política por autodestilación (SDPO) a partir de un modelo previamente ajustado con supervisión (SD-SFT).

El adaptador corresponde al checkpoint de la ronda 30 de un total de 40 del proceso SDPO, con semilla de entrenamiento 3407. No es un modelo autónomo: requiere fusionar primero el adaptador SD-SFT (checkpoint-747 del repositorio `gemma4_koka_1-4-0_sft_checkpoints`) sobre `unsloth/gemma-4-E4B-it` en precisión de 16 bits, y aplicar después este adaptador SDPO. El repositorio ocupa 0.6 GB y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es acotada: se trata de un artefacto de investigación sobre generación de código en un lenguaje de nicho, útil para quienes trabajan con Koka o estudian técnicas de autodestilización aplicadas a modelos pequeños. No dispone de model card con benchmarks ni de documentación sobre composición de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B |
| Parametros totales | no disponible (adaptador LoRA de rank 16, alpha 32) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (orientado a código Koka) |
| Licencia | gemma |
| Formato de pesos | safetensors (adapter_model.safetensors), configuracion PEFT en adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se construye sobre Gemma 4 E4B, un transformer de la familia Gemma 4 en su variante E4B, distribuido por Unsloth en formato listo para ajuste fino. La técnica aplicada es LoRA con rango 16 y alpha 32, es decir, se entrenan matrices de baja dimensión que se suman a las proyecciones del modelo base sin modificar los pesos originales. El adaptador se aplica sobre una fusión previa del adaptador SD-SFT (checkpoint-747) en el modelo base en 16 bits, por lo que el resultado final es una cadena de dos adaptadores.

El entrenamiento sigue un esquema de optimización de política por autodestilización (SDPO), una variante de ajuste por preferencias o refuerzo en la que el propio modelo actúa como profesor y alumno. El proceso consta de 40 rondas; este checkpoint corresponde a la ronda 30. El estado del entrenador (`trainer_state.pt`) incluye el optimizador, el calendario de learning rate, el profesor EMA y los estados del generador de números aleatorios, lo que permite reanudar el entrenamiento. No se dispone de información sobre el volumen de tokens, la composición del dataset ni la existencia de RLHF o DPO convencional.

## Capacidades

- Generación de código en Koka 1.4.0, el lenguaje objetivo del ajuste.
- Razonamiento y generación de texto general heredados del modelo base Gemma 4 E4B.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Reanudación del entrenamiento desde el checkpoint 30 mediante `trainer_state.pt`.

## Casos de uso

- Generación de código Koka para proyectos de investigación: el adaptador permite producir fragmentos en Koka 1.4.0 con un modelo de tamaño moderado, útil para prototipar programas con sistema de efectos.
- Estudio de técnicas SDPO: el checkpoint intermedio (ronda 30 de 40) sirve para analizar la evolución del ajuste y comparar con el modelo SD-SFT de partida.
- Reproducción de experimentos: al incluir el estado del entrenador, se puede reanudar el proceso y continuar las rondas restantes hasta la 40.
- Evaluación de adaptadores LoRA encadenados: permite estudiar el comportamiento de aplicar dos adaptadores secuenciales (SFT y SDPO) sobre el mismo modelo base.
- Docencia y formación en lenguajes funcionales: puede emplearse como asistente de generación de ejemplos en Koka en entornos controlados.
- Investigación sobre especialización en lenguajes de nicho: sirve de base para comparar la eficacia de LoRA frente a ajuste completo en dominios con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un adaptador sobre Gemma 4 E4B, los requisitos vienen determinados por el modelo base y el modo de cuantización elegido.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: PEFT (carga del adaptador mediante `PeftModel`), con posibilidad de fusión de pesos para usar con otros runners; no se detallan otras opciones.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_30_lora | adaptador LoRA sobre Gemma 4 E4B | no disponible | sin benchmarks publicados | gemma | Hugging Face (0 descargas) |
| gemma4_koka_1-4-0_sft_checkpoints (checkpoint-747) | adaptador LoRA sobre Gemma 4 E4B | no disponible | sin benchmarks publicados | gemma | Hugging Face |
| unsloth/gemma-4-E4B-it (modelo base) | no disponible | no disponible | no disponible | gemma | Hugging Face |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere fusionar previamente el adaptador SD-SFT (checkpoint-747) sobre `unsloth/gemma-4-E4B-it` en 16 bits y aplicar después este adaptador.
- Checkpoint intermedio: corresponde a la ronda 30 de 40, por lo que no representa el resultado final del entrenamiento.
- Ausencia de benchmarks: no hay métricas publicadas que permitan validar su calidad en generación de código Koka.
- Sesgos conocidos: no disponible en la información proporcionada; al heredar el modelo base, puede arrastrar los sesgos de este.
- Riesgo de alucinación: no cuantificado; en generación de código es esperable que produzca APIs o construcciones inexistentes, especialmente en un lenguaje de nicho.
- Limitaciones de contexto e idioma: no disponible en la información proporcionada.
- Restricciones de licencia: licencia Gemma, que impone condiciones de uso (incluida la política de uso aceptable de Google) y puede restringir el uso comercial según el caso; conviene revisar los términos antes de desplegar en producción.
- Uso en producción: al no haber validación externa ni benchmarks, no se recomienda su despliegue directo sin evaluación previa en el dominio objetivo.
- Repositorio sin actividad: 0 descargas y 0 likes, lo que reduce la evidencia comunitaria sobre su funcionamiento.

## Enlaces

- Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-4-0_sdpo_only_b8_parity_checkpoint_30_lora
- Adaptador SD-SFT previo: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-4-0_sft_checkpoints
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
