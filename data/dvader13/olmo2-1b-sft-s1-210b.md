# dvader13/olmo2-1b-sft-s1-210b

## Resumen

El repositorio `dvader13/olmo2-1b-sft-s1-210b` contiene una serie de diez checkpoints de fine-tuning supervisado (SFT) aplicados sobre el modelo base OLMo-2-1B de Ai2, en su fase de pretraining `stage1-step100000-tokens210B`. Cada checkpoint corresponde a una fracción de dosis de SFT (del 10% al 100%), lo que permite estudiar cómo la cantidad de datos de instrucción afecta al rendimiento del modelo de forma incremental. El autor, dvader13, publica estos checkpoints con fines de investigación reproducible, manteniendo la licencia Apache 2.0 y los pesos en formato bf16.

La relevancia de este modelo radica en su utilidad para la investigación empírica sobre el fine-tuning: permite medir el efecto de la cantidad de datos de SFT sobre las capacidades del modelo, algo poco habitual en la publicación de modelos. Al estar basado en OLMo-2-1B, un modelo de 1.000 millones de parámetros con arquitectura transformer decoder-only, es adecuado para experimentos en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base OLMo-2-1B) |
| Parametros totales | ~1.1B (inferido del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base OLMo-2-1B soporta 4096 tokens) |
| Tipos de cuantizacion | bf16 (según la model card) |
| Idiomas soportados | no disponible (el base OLMo-2-1B está entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en OLMo-2-1B, un transformer decoder-only desarrollado por Ai2 con una arquitectura estándar de atención causal. El pretraining se realizó sobre 210B tokens en la rung `stage1-step100000`, lo que constituye la fase de entrenamiento inicial del modelo base. Sobre este base, el autor aplica un fine-tuning supervisado (SFT) con datos de instrucción, y publica diez checkpoints correspondientes a fracciones crecientes de la dosis completa de SFT: `checkpoint_pct010` a `checkpoint_pct100`.

Los checkpoints se guardan en bf16, solo para inferencia, sin estado de optimizador, lo que reduce el tamaño del repositorio y facilita su uso en evaluación. No se detalla el dataset de SFT utilizado ni el procedimiento exacto de entrenamiento; el repositorio no incluye información sobre RLHF, DPO ni otras técnicas posteriores al SFT.

## Capacidades

- Generación de texto y finalización de secuencias, heredadas del modelo base OLMo-2-1B.
- Seguimiento de instrucciones básico, derivado del proceso de SFT aplicado.
- Capacidades multilingües limitadas: el modelo base está entrenado principalmente en inglés, por lo que el rendimiento en otros idiomas es no disponible.
- No se documentan capacidades específicas como tool calling, razonamiento multi-paso, visión o audio.
- El modelo es apto para experimentos de investigación sobre el efecto de la dosis de SFT, no como producto final de producción.

## Casos de uso

- Investigación sobre el efecto de la cantidad de datos de SFT: permite comparar el rendimiento entre los distintos checkpoints (pct010 a pct100) para medir la curva de mejora y saturación del fine-tuning.
- Estudio de la relación entre dosis de SFT y alucinaciones: analizar si un mayor porcentaje de SFT reduce la frecuencia de respuestas inventadas en tareas de razonamiento.
- Experimentación con fine-tuning adicional: partir de un checkpoint intermedio (por ejemplo, pct050) para aplicar técnicas como DPO o RLHF, aprovechando que los pesos están en bf16 y son fáciles de cargar.
- Evaluación de robustez ante distintos conjuntos de instrucciones: comparar la consistencia de las respuestas entre las diez versiones del modelo.
- Reproducibilidad de experimentos: al estar los checkpoints disponibles con licencia abierta, cualquier investigador puede replicar los resultados sin necesidad de reentrenar el modelo base.
- Benchmarking de hardware de inferencia: al tener diez variantes del mismo modelo, se puede medir el rendimiento y latencia de distintas GPUs con el mismo peso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K u otros estándares, ni comparaciones con modelos similares. Se recomienda consultar los benchmarks del modelo base OLMo-2-1B en la página oficial de Ai2 para obtener una referencia aproximada del rendimiento antes del SFT.

## Requisitos de hardware

- Repositorio completo: 29.7 GB, que incluye los diez checkpoints en bf16 más el modelo base.
- Cada checkpoint individual: aproximadamente 2.1 GB en bf16 (estimación para un modelo de 1.1B de parámetros).
- VRAM para inferencia: un modelo de 1.1B en bf16 requiere ~2.2 GB de VRAM, por lo que es ejecutable en GPUs consumer como una RTX 3060 de 12 GB o superiores.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 para experimentos con los diez checkpoints en paralelo.
- Despliegue: compatible con vLLM, llama.cpp, Ollama y TGI, aunque al ser un modelo de investigación, el uso más habitual es mediante la carga directa con Hugging Face Transformers.
- Latencia y throughput: no disponibles; dependen del hardware y del framework de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| dvader13/olmo2-1b-sft-s1-210b | ~1.1B | no disponible (base: 4096) | Apache 2.0 | 10 checkpoints SFT con dosis variables |
| allenai/OLMo-2-0425-1B | ~1.1B | 4096 | Apache 2.0 | Modelo base, sin SFT |
| allenai/OLMo-2-0425-1B-Instruct | ~1.1B | 4096 | Apache 2.0 | Modelo con SFT y DPO completo |

La comparativa se limita a los modelos de la misma familia OLMo-2-1B, ya que no se dispone de información suficiente para comparar con modelos externos como TinyLlama o Qwen2-1.5B.

## Limitaciones y advertencias

- No se ha publicado ningún resultado de evaluación en la model card; el rendimiento real es desconocido y no debe usarse en producción sin validación previa.
- El modelo base está entrenado principalmente en inglés; el rendimiento en otros idiomas no está documentado.
- Al ser un checkpoint de investigación, puede contener sesgos presentes en los datos de SFT, que no se especifican en la documentación.
- Riesgo de alucinación no mitigado: no se mencionan técnicas de RLHF o DPO aplicadas, por lo que las respuestas pueden ser inventadas o incorrectas.
- La licencia Apache 2.0 permite uso comercial, pero la falta de datos de rendimiento hace recomendable una evaluación exhaustiva antes de cualquier despliegue.
- El repositorio no incluye el dataset de SFT utilizado, lo que limita la reproducibilidad del entrenamiento.
- Los checkpoints se guardan solo para inferencia; no se pueden reanudar entrenamientos desde estos pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dvader13/olmo2-1b-sft-s1-210b
- Modelo base OLMo-2-1B: https://huggingface.co/allenai/OLMo-2-0425-1B
- Página oficial de OLMo 2: https://allenai.org/olmo2
- Repositorio de entrenamiento OLMo: https://github.com/allenai/OLMo
- Pipeline de fine-tuning para OLMo2 1B: https://github.com/fkuhne/olmo_sft
