# Shangy/browsecomp-perception-e2e-rl

## Resumen

El modelo `Shangy/browsecomp-perception-e2e-rl` es un checkpoint de archivo privado basado en `Qwen/Qwen3-8B`, entrenado mediante aprendizaje por refuerzo (RL) de extremo a extremo para la tarea de percepción dentro del benchmark BrowseComp. El objetivo de este modelo es comprimir observaciones largas de búsqueda web para un agente de modelo grande congelado, actuando como un "sustituto de percepción" que resume y filtra la información relevante antes de que el agente principal tome decisiones. Se entrenó con recompensa de episodio completo y penalizaciones de fidelidad, sin shaping de longitud.

La relevancia de este modelo radica en su enfoque de entrenamiento con RL completo para percepción, un área menos explorada que el fine-tuning supervisado tradicional. La revisión recomendada es `iter149`, que alcanza una precisión de 0.780 en datos held-out frente a un baseline de percepción zero-shot de 0.717, y reduce la tasa de "output-cap" del 82% en iter9 al 60% en iter149. No es un modelo de lenguaje generalista, sino un componente especializado para pipelines de agentes de navegación web.

La arquitectura es la de Qwen3-8B, un transformer de 8 mil millones de parámetros, y el tamaño del repositorio es de 16.4 GB. La licencia es Apache 2.0, lo que permite uso comercial y modificación. El checkpoint está etiquetado como de solo archivo y su uso requiere un "harness" de percepción específico para reproducir los resultados reportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) |
| Parametros totales | 8 000 millones (8B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (hereda la de Qwen3-8B, no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (no se indica en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 16.4 GB, compatible con transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3-8B, un transformer denso de 8 mil millones de parámetros. No se han publicado detalles específicos sobre la configuración interna (número de capas, cabezas de atención, etc.) en la información disponible.

El entrenamiento se realizó mediante aprendizaje por refuerzo de extremo a extremo (e2e RL) sobre la tarea de percepción en el benchmark BrowseComp. El modelo se entrena para comprimir observaciones largas de búsqueda web y producir representaciones compactas que un agente de modelo grande congelado pueda usar para decidir la siguiente acción. La función de recompensa combina la recompensa por episodio completo (éxito en la tarea) con penalizaciones por fidelidad (evitar que el modelo pierda información crítica). No se usó shaping de longitud, lo que significa que el modelo no fue recompensado directamente por generar respuestas más cortas. La revisión `iter128` se recomienda como punto final de la campaña.

## Capacidades

- Compresión de observaciones largas de búsqueda web en representaciones compactas para agentes de navegación.
- Entrenamiento con RL de episodio completo, optimizado para éxito en la tarea final, no solo para la calidad local de la compresión.
- Fidelidad de salida mejorada: la tasa de "outputs" (probablemente respuestas incompletas o truncadas) se reduce del 82% en iter9 al 60% en iter128.
- Mejora de precisión en datos de validación: 0.780 frente a 0.717 del baseline zero-shot, un aumento de +8.8% relativo.
- Integración con el harness de percepción específico de BrowseComp (no es un modelo autónomo para generación de texto general).
- Capacidades multilingües: no disponibles (se heredan de Qwen3-8B, pero no se documentan en la model card).
- Soporte de tool calling y agentes: no se documenta específicamente, pero el modelo está diseñado para usarse en un pipeline de agente de búsqueda web.

## Casos de uso

- **Agentes de navegación web con percepción eficiente**: el modelo puede integrarse como un módulo de percepción en un agente basado en LLM que navega por internet. Su función es resumir y filtrar páginas web largas para que el agente principal no procese el contenido completo, reduciendo costes de inferencia y latencia.
- **Reducción de costes en pipelines de búsqueda multi-hop**: en tareas que requieren múltiples pasos de búsqueda y síntesis de información, este checkpoint puede comprimir el estado de la búsqueda en cada paso, permitiendo que el agente principal se centre en la toma de decisiones.
- **Fine-tuning de percepción con RL**: como referencia para equipos que quieran entrenar modelos de percepción con RL de episodio completo en otras tareas de agentes, el checkpoint puede servir como punto de partida o para análisis de curvas de entrenamiento.
- **Investigación en RL para percepción**: el modelo es un ejemplo de entrenamiento con recompensa de episodio completo y penalizaciones de fidelidad sin shaping de longitud, útil para estudiar el efecto de estos métodos en la tasa de éxito de agentes.
- **Sustituto de percepción en sistemas de producción**: en un sistema de producción donde el modelo grande es congelado por razones de coste, este checkpoint puede ser desplegado como un componente de preprocesamiento que reduce la carga de tokens del modelo principal.
- **Evaluación de robustez en navegación**: el modelo puede usarse en experimentos para medir cómo la calidad de la percepción afecta al rendimiento final del agente en benchmarks como BrowseComp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta los siguientes datos de validación interna:

| Metrica | Valor |
|---|---|
| Precisión held-out (iter149) | 0.780 |
| Precisión baseline zero-shot | 0.717 |
| Tasa de output-cap en iter9 | 82% |
| Tasa de output-cap en iter149 | 60% |

Estos datos provienen de la model card y requieren el harness de percepción específico para su reproducción. No se reportan resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para un modelo de 8B en FP16, se estima entre 16 y 20 GB de VRAM, dependiendo de la longitud de la secuencia de entrada. Con cuantización (no documentada), podría reducirse a 8-10 GB.
- **GPU recomendadas**: una RTX 4090 (24 GB) o una A100 (40 GB) serían suficientes para inferencia en FP16. Para entrenamiento o fine-tuning adicional, se recomienda al menos una A100 de 80 GB o un clúster multi-GPU.
- **Compatibilidad con GPUs de consumo**: sí, es posible ejecutar el modelo en una RTX 3090 o RTX 4090 con cuantización (por ejemplo, 8-bit o 4-bit), aunque no se documentan configuraciones específicas.
- **Opciones de despliegue**: al ser un checkpoint de transformers, se puede servir con vLLM, TGI (Text Generation Inference) o llama.cpp (conversión a GGUF). También se puede integrar en pipelines con Hugging Face Transformers directamente.
- **Latencia y throughput estimados**: no disponibles. Al ser un modelo de 8B, la latencia típica de generación es de decenas de milisegundos por token en GPU moderna, pero depende del harness específico.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de percepción para agentes de navegación. El modelo base Qwen3-8B se puede comparar con otros modelos de 8B como Llama 3.1 8B o Mistral 7B, pero el checkpoint de percepción RL no tiene métricas estándar comparables. No se dispone de datos de rendimiento en benchmarks generales.

## Limitaciones y advertencias

- **Modelo de archivo, no para producción directa**: la model card lo describe como un "private archival release" y el rendimiento reportado requiere un harness de percepción específico. No se recomienda su uso directo como modelo de lenguaje general.
- **Sesgos conocidos**: no se documentan sesgos específicos, pero al heredar de Qwen3-8B, puede presentar los sesgos típicos de los modelos entrenados en datos web (sesgos culturales, de género, etc.).
- **Riesgo de alucinación**: no se evalúa específicamente, pero como modelo de percepción, el riesgo principal es la pérdida de información crítica al comprimir observaciones, lo que puede llevar a respuestas incorrectas del agente principal.
- **Limitaciones de contexto**: no se especifica la longitud de contexto, pero el modelo está diseñado para comprimir observaciones largas, por lo que su uso fuera de ese contexto podría degradar el rendimiento.
- **Restricciones de licencia**: licencia Apache 2.0 permite uso comercial y modificación, pero la procedencia indica que es una "emergency source snapshot" y que la documentación completa está en `docs/experiments/perception-collab-gb300-campaign.md`, que no está disponible públicamente.
- **Caveat para producción**: el modelo se entrenó con recompensa de episodio completo y penalizaciones de fidelidad, lo que puede no transferirse bien a otros dominios o tareas de agentes. Además, el rendimiento reportado (0.780) se obtuvo con una revisión específica y un harness particular, por lo que los resultados en otros entornos pueden variar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Shangy/browsecomp-perception-e2e-rl)
- [Paper de BrowseComp (arXiv)](https://arxiv.org/abs/2504.12516)
- [HTML del paper de BrowseComp](https://arxiv.org/html/2504.12516v1)
- [OpenAI BrowseComp](https://openai.com/index/browsecomp/)
- [Leaderboard de BrowseComp en evals.report](https://evals.report/benchmarks/browsecomp)
- [Leaderboard de BrowseComp en BenchLM.ai](https://benchlm.ai/benchmarks/browsecomp)
