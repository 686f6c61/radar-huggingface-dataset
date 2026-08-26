# dvader13/olmo2-1b-rlfinal-s1-399b

## Resumen

`dvader13/olmo2-1b-rlfinal-s1-399b` es un checkpoint intermedio de la fase final de *reinforcement learning* (RL) del modelo OLMo-2-1B, desarrollado por el investigador independiente `dvader13` sobre la base del modelo OLMo-2-1B de AI2. El checkpoint corresponde al paso 5000 de la etapa de RL, tras un pretraining de 399 mil millones de tokens (rung `stage1-step190000-tokens399B`). No es un modelo listo para inferencia, sino un estado de entrenamiento completo que incluye pesos en fp32, optimizador, scheduler, RNG y estado del dataloader, diseñado para reanudar el entrenamiento o continuar la investigación en RL.

Su relevancia radica en que permite a otros investigadores reproducir o extender experimentos de RL sobre un modelo abierto y totalmente reproducible como OLMo-2, sin necesidad de volver a ejecutar el costoso pretraining. Al ser un checkpoint resumable, no puede usarse directamente para generar texto; requiere una conversión a formato de inferencia (por ejemplo, *safetensors* o *GGUF*) y la carga de los pesos en un runtime adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso autorregresivo (OLMo-2-1B) |
| Parametros totales | ~1.000 millones (familia OLMo-2-1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (checkpoint de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Estado completo de entrenamiento (fp32, optimizador, scheduler, RNG, dataloader) |

## Arquitectura y entrenamiento

El modelo base es OLMo-2-1B, un transformer denso autoregresivo de la familia OLMo 2 de AI2. El pretraining se realizó con 399 mil millones de tokens (rung `stage1-step190000-tokens399B`). El checkpoint `rlfinal` corresponde al paso 5000 de una fase de RL posterior, aunque no se especifica el algoritmo concreto (PPO, GRPO, etc.) ni los datos de recompensa utilizados. El estado completo incluye los pesos en fp32, el optimizador, el scheduler de aprendizaje, el estado del generador de números aleatorios y el estado del dataloader, lo que permite reanudar el entrenamiento exactamente desde ese punto.

No se dispone de información sobre el dataset de RL, la función de recompensa ni las técnicas de regularización aplicadas. Tampoco se indica si se realizó SFT previo a la fase de RL.

## Capacidades

Al ser un checkpoint de entrenamiento y no un export de inferencia, no se pueden listar capacidades de generación de texto, razonamiento o código de forma directa. Las capacidades potenciales del modelo base OLMo-2-1B (generación de texto, razonamiento básico, código) solo estarían disponibles tras convertir el checkpoint a un formato de inferencia.

- No es un modelo de inferencia: requiere conversión a pesos de inferencia (por ejemplo, *safetensors* o *GGUF*).
- No se han documentado capacidades de *tool calling*, agentes o *multi-step reasoning*.
- No se especifican idiomas soportados.
- No hay información sobre soporte de visión o audio.

## Casos de uso

Dado que se trata de un checkpoint de entrenamiento, los casos de uso se limitan al ámbito de investigación:

- **Investigación en RL**: reanudar el entrenamiento desde el paso 5000 para explorar variaciones en la política de recompensa, el batch size o el scheduler.
- **Reproducibilidad de experimentos**: verificar resultados de RL sobre OLMo-2-1B con un estado exacto y reproducible.
- **Análisis de dinámica de entrenamiento**: estudiar la evolución de la pérdida y la recompensa en la fase de RL a partir de este punto.
- **Fine-tuning continuado**: aplicar técnicas adicionales (DPO, PPO, etc.) sobre el checkpoint resumable.
- **Estudios de seguridad**: analizar el comportamiento del modelo durante el RL para detectar sesgos o comportamientos indeseados en el proceso de entrenamiento.
- **Conversión a inferencia**: si se desea usar el modelo, es necesario convertir el checkpoint a un formato de inferencia (por ejemplo, con el script de exportación de OLMo) y cuantizarlo posteriormente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este checkpoint no está diseñado para inferencia directa, por lo que no se pueden reportar métricas de calidad de generación (MMLU, HumanEval, etc.) sin un proceso previo de conversión y evaluación.

## Requisitos de hardware

- **VRAM estimada**: no aplicable para inferencia directa; el checkpoint en fp32 ocupa aproximadamente 4 GB para los pesos (1B × 4 bytes) más el estado del optimizador (que puede duplicar o triplicar ese tamaño en función del optimizador usado).
- **GPU recomendadas**: para reanudar entrenamiento, se requiere una GPU con al menos 8-16 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para el modelo base, aunque el optimizador y el estado del dataloader aumentan el consumo.
- **Consumer GPU**: es posible en GPUs de gama alta (RTX 3090/4090) para entrenamiento, pero la inferencia tras conversión sería mucho más ligera (menos de 2 GB en cuantización 8-bit).
- **Opciones de despliegue**: no aplicable en el estado actual; tras conversión a *safetensors* se podría usar vLLM, TGI, llama.cpp u Ollama.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| OLMo-2-1B (base) | ~1B | no disponible | Apache-2.0 | Inferencia disponible |
| OLMo-2-7B | ~7B | no disponible | Apache-2.0 | Inferencia disponible |
| dv13/olmo2-1b-rlfinal-s1-399b | ~1B | no disponible | Apache-2.0 | Checkpoint de entrenamiento (no inferencia) |

La comparativa es limitada porque el checkpoint no es un modelo de inferencia. La alternativa directa es el OLMo-2-1B base, que sí se puede usar en producción tras convertir sus pesos. No hay modelos comparables en el mismo estado (checkpoint de RL) en el ecosistema abierto.

## Limitaciones y advertencias

- **No es un export de inferencia**: el modelo no puede usarse directamente para generar texto; se necesita un proceso de conversión (por ejemplo, extraer solo los pesos y guardarlos en *safetensors*).
- **Sesgos y alucinaciones**: no se han documentado sesgos específicos, pero al ser un checkpoint de RL, el comportamiento puede diferir del modelo base y no está validado en tareas reales.
- **Riesgo de alucinación**: desconocido; el modelo no ha sido evaluado para producción.
- **Idiomas**: no se especifica el soporte de idiomas; la familia OLMo-2 se entrena principalmente con datos en inglés, pero no hay confirmación para este checkpoint.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero el modelo base OLMo-2 también es Apache-2.0.
- **Advertencia de producción**: no se recomienda su uso en entornos productivos sin una evaluación rigurosa y una conversión adecuada.

## Enlaces

- [HuggingFace: dvader13/olmo2-1b-rlfinal-s1-399b](https://huggingface.co/dvader13/olmo2-1b-rlfinal-s1-399b)
- [Repositorio OLMo (GitHub)](https://github.com/allenai/OLMo)
- [Página oficial OLMo 2 (AI2)](https://allenai.org/olmo2)
- [Colección OLMo 2 en Hugging Face](https://huggingface.co/collections/allenai/olmo-2)
- [Paper técnico OLMo 2 (arXiv)](https://arxiv.org/abs/2501.00656)
