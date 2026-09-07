# burtenshaw/plan-my-day-v2-lfm2.5-dev-r25-w100

## Resumen

`burtenshaw/plan-my-day-v2-lfm2.5-dev-r25-w100` es un adaptador PEFT (LoRA) desarrollado por burtenshaw sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. Se trata de un adaptador de investigación orientado a una tarea muy específica: la planificación sintética de días mediante selección entre cuatro opciones. No es un agente de calendario general ni un modelo de propósito general, tal como indica explícitamente su model card.

El entrenamiento utiliza un enfoque de aprendizaje continuo con el método SDPO (presumiblemente Sequential Direct Preference Optimization), partiendo de un warm start en `burtenshaw/plan-my-day-lfm2.5-sft-seed17`. La configuración del experimento incluye 192 pasos, una tasa de aprendizaje de 3e-05, una fracción de replay de 0.25 y un peso de destilación de 1.0. El adaptador se publica con licencia `lfm-open-license-1.0` y un tamaño de repo de 0.1 GB. No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador PEFT sobre LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | no disponible (adaptador PEFT; el modelo base tiene 1.2B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-1.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `LiquidAI/LFM2.5-1.2B-Instruct`, un modelo base de tipo transformer con 1.2B de parámetros. Al ser un adaptador PEFT, solo se entrenan un subconjunto de pesos (probablemente matrices de bajo rango), lo que reduce el coste de entrenamiento y de almacenamiento. El proceso de post-entrenamiento emplea SDPO, una variante de optimización de preferencias directas, combinada con un esquema de aprendizaje continuo.

Los datos de entrenamiento son sintéticos y específicos para la tarea de planificación de días de cuatro opciones. Se parte de un adaptador previo entrenado con SFT (seed 17) y se aplica una configuración que incluye 192 pasos, una fracción de replay de 0.25 y una pérdida de destilación con peso 1.0. El dataset de resultados está disponible en el repositorio de HuggingFace, aunque no se detalla la composición del dataset ni el número de tokens utilizados en la información proporcionada.

## Capacidades

- Generación de respuestas en tareas de planificación sintética de días, limitada a la selección entre cuatro opciones.
- Implementación de un flujo de post-entrenamiento con SDPO y destilación, orientado a investigación en aprendizaje continuo.
- No soporta tool calling, function calling ni razonamiento multi-paso agéntico según la información disponible.
- No se especifican capacidades multimodales (visión, audio) ni multilingües.
- El propio autor indica que no es un agente de calendario general y que no debe promocionarse como demo en vivo automática.

## Casos de uso

- Investigación en planificación sintética: el adaptador permite comparar el efecto de SDPO frente a SFT en una tarea acotada de selección de opciones de agenda.
- Experimentos de aprendizaje continuo: sirve como punto de partida para estudiar cómo el replay y la destilación afectan a la estabilidad del modelo en tareas secuenciales.
- Evaluación de adaptadores PEFT de pequeño tamaño: al añadir solo unos pocos parámetros, es útil para medir el impacto de métodos de post-entrenamiento sobre un modelo base de 1.2B.
- Pruebas de transferencia de conocimiento: el uso de un warm start desde un adaptador SFT permite analizar la mejora incremental de la optimización de preferencias.
- Reproducibilidad de experimentos: la configuración está documentada en la model card (seed, pasos, lr, fracciones), facilitando la replicación de resultados en entornos académicos.
- Benchmarking interno de pipelines de post-entrenamiento: puede integrarse en flujos de evaluación para probar variantes de algoritmos como DPO o SDPO en datos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enlaza a un dataset de resultados (`burtenshaw/plan-my-day-v2-results`), pero los valores concretos de métricas como exactitud, MMLU, HumanEval o GSM8K no se han proporcionado en los datos de entrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como orientación general, un modelo base de 1.2B en FP16 requiere aproximadamente 2.5 GB de VRAM; en 4 bits, alrededor de 0.8 GB. El adaptador añade una sobrecarga mínima.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en precisión FP16 o inferior (por ejemplo, RTX 3050, RTX 4060, A10).
- Puede ejecutarse en GPUs de consumo sin problemas, dada la pequeña escala del modelo base.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI son compatibles con modelos de 1.2B, aunque no se confirma el soporte específico para este adaptador PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables para esta tarea concreta. No se puede establecer una comparativa robusta sin datos de rendimiento. La única referencia cercana es el propio modelo base `LiquidAI/LFM2.5-1.2B-Instruct`, que no es un adaptador de planificación. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Adaptador de investigación: su uso está restringido a la tarea de planificación sintética de cuatro opciones, no es un agente de calendario funcional.
- Riesgo de alucinación: fuera de la tarea específica, el comportamiento del modelo no está validado y puede producir respuestas no fiables.
- Sin datos de benchmarks: no hay métricas públicas que respalden un rendimiento real en tareas de razonamiento o generación general.
- Idiomas no especificados: el modelo podría heredar las capacidades del modelo base, pero no se confirma.
- Licencia `lfm-open-license-1.0`: deben revisarse las restricciones antes de un uso comercial, ya que se trata de una licencia no estándar.
- El autor indica explícitamente que no debe promocionarse como demo en vivo automática.
- No se proporciona información sobre sesgos, datos de entrenamiento o medidas de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/burtenshaw/plan-my-day-v2-lfm2.5-dev-r25-w100
- Dataset de fuente: https://huggingface.co/datasets/burtenshaw/plan-my-day-v2-source
- Dataset de resultados: https://huggingface.co/datasets/burtenshaw/plan-my-day-v2-results
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Warm start SFT: https://huggingface.co/burtenshaw/plan-my-day-lfm2.5-sft-seed17
