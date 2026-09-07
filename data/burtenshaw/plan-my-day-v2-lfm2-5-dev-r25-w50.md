# burtenshaw/plan-my-day-v2-lfm2.5-dev-r25-w50

## Resumen

El modelo `burtenshaw/plan-my-day-v2-lfm2.5-dev-r25-w50` es un adaptador de investigación (PEFT) desarrollado por burtenshaw sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. Se trata de un experimento de aprendizaje continuo y alineación mediante SDPO sobre un dataset sintético de planificación de día con cuatro opciones. No es un agente de calendario general ni un modelo de propósito general: su objetivo es estudiar técnicas de fine-tuning eficiente y destilación en un entorno controlado.

El adaptador tiene un tamaño de 0.1 GB y se distribuye en formato safetensors. El modelo base tiene 1.2B parámetros, pero no se dispone de información sobre la arquitectura interna, la longitud de contexto ni los idiomas soportados. La licencia es `lfm-open-license-1.0`, lo que puede imponer restricciones de uso.

Su relevancia radica en ser un caso de estudio para técnicas de continual learning con replay y destilación, así como para evaluar el comportamiento de los modelos LiquidAI en tareas de planificación sintética. Al ser un adaptador de investigación, no está pensado para su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre LiquidAI/LFM2.5-1.2B-Instruct (arquitectura del modelo base no especificada) |
| Parametros totales | No disponible (adaptador de 0.1 GB sobre modelo base de 1.2B) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | lfm-open-license-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT (Parameter-Efficient Fine-Tuning) que se carga sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. Los adaptadores PEFT permiten ajustar un modelo preentrenado modificando un pequeño subconjunto de parámetros, lo que reduce el coste de entrenamiento y el tamaño del artefacto. En este caso, el adaptador se entrena con la técnica SDPO, un método de optimización de preferencias alineado con secuencias, que se combina con estrategias de continual learning: `replay_fraction` de 0.25 y `distillation_weight` de 0.5. El entrenamiento se realiza durante 192 pasos con una tasa de aprendizaje de 3e-05 y una semilla de 17, partiendo del adaptador `burtenshaw/plan-my-day-lfm2.5-sft-seed17` como warm start.

Los datos de entrenamiento provienen del dataset sintético `burtenshaw/plan-my-day-v2-source`, que contiene tareas de planificación de día con cuatro opciones. No se dispone de información sobre la arquitectura interna del modelo base (si es un transformer puro, un SSM o una arquitectura híbrida), ni sobre la composición del dataset o la presencia de RLHF/DPO adicional.

## Capacidades

- Planificación de día sintética: el modelo selecciona entre cuatro opciones para planificar un día en un entorno controlado.
- Aprendizaje continuo: el adaptador incorpora mecanismos de replay y destilación, lo que permite estudiar la estabilidad y plasticidad en tareas secuenciales.
- Alineación por preferencias: el entrenamiento con SDPO busca ajustar el comportamiento del modelo según preferencias sintéticas.
- No soporta tool calling, vision, audio ni capacidades multimodales (no se indica en la información disponible).
- No es un agente de calendario general y no maneja datos personales.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en continual learning: el adaptador sirve como caso de estudio para evaluar el efecto del replay fraction y la destilación en la retención de conocimiento previo.
- Evaluación de adaptadores PEFT en tareas de planificación: se puede comparar el rendimiento de este adaptador con otros entrenados con SFT o DPO sobre el mismo dataset.
- Benchmarking de modelos LiquidAI: permite analizar cómo el modelo base LFM2.5-1.2B se comporta en tareas de razonamiento de planificación sintética.
- Desarrollo de pipelines de fine-tuning eficiente: al ser un adaptador de 0.1 GB, es útil para demostrar flujos de entrenamiento de bajo coste en entornos de investigación.
- Estudio de robustez ante datos sintéticos: se puede analizar la generalización del modelo cuando se enfrenta a variaciones del dataset de planificación.
- Experimentación con SDPO: sirve como referencia para investigar el método de optimización de preferencias en combinación con continual learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un dataset de resultados (`burtenshaw/plan-my-day-v2-results`), pero no se proporcionan métricas concretas.

## Requisitos de hardware

- El adaptador PEFT ocupa 0.1 GB, pero la inferencia requiere cargar el modelo base de 1.2B.
- VRAM estimada: no disponible. De forma orientativa, un modelo de 1.2B en FP16 requeriría aproximadamente 2.4 GB, más el adaptador. Con cuantización 4-bit, el requisito podría reducirse a menos de 1 GB, pero no se dispone de cuantizaciones publicadas.
- GPU recomendadas: no disponible. Cualquier GPU con suficiente VRAM (por ejemplo, RTX 4090, A100) podría ejecutar el modelo, pero no se especifica.
- Capacidad en consumer GPU: probablemente sí, dado el tamaño del modelo base, pero no está documentado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con Hugging Face Transformers y la librería `peft`. No se documenta soporte para vLLM, llama.cpp ni Ollama.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables de la misma categoría. El modelo más cercano es el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`, pero no es un adaptador de planificación sintética. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de propósito general ni un agente de calendario real.
- No maneja datos personales y no está diseñado para su uso en producción.
- El entrenamiento se realizó sobre datos sintéticos, lo que puede limitar la generalización a escenarios reales.
- No se han publicado benchmarks ni métricas de rendimiento, por lo que su calidad no está validada.
- La licencia `lfm-open-license-1.0` puede imponer restricciones de uso comercial; es necesario consultar el texto completo de la licencia.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de idioma.
- No soporta tool calling, vision ni audio.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/burtenshaw/plan-my-day-v2-lfm2.5-dev-r25-w50
- Dataset fuente: https://huggingface.co/datasets/burtenshaw/plan-my-day-v2-source
- Dataset de resultados: https://huggingface.co/datasets/burtenshaw/plan-my-day-v2-results
- Blog de LiquidAI sobre LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
