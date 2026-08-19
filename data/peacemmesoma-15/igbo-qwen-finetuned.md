# PeaceMmesoma-15/Igbo-qwen-finetuned

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base **Qwen/Qwen2.5-0.5B-Instruct**, con el objetivo de mejorar las respuestas del modelo en relación con términos y significados de la lengua igbo, hablada principalmente en Nigeria. El adaptador fue desarrollado por PeaceMmesoma-15 como un experimento de fine-tuning eficiente en parámetros para lenguas de bajo recurso, buscando proporcionar explicaciones culturalmente apropiadas y lingüísticamente correctas.

El modelo resultante tiene un total de 495 millones de parámetros (incluyendo el modelo base), de los cuales solo 1,08 millones son entrenables (0,22 %). Se entrenó con un conjunto de datos muy reducido de 490 ejemplos, divididos en 439 para entrenamiento y 49 para evaluación, durante 2 épocas en una GPU T4 de Google Colab. Aunque el adaptador está especializado en igbo, hereda las capacidades multilingües del modelo base, aunque su uso previsto es exclusivamente educativo y experimental.

La relevancia de este modelo radica en su contribución a la investigación en NLP para lenguas africanas de bajo recurso, demostrando que con técnicas PEFT y un dataset pequeño se puede adaptar un modelo generalista a un dominio cultural y lingüístico específico. No obstante, su limitado tamaño de datos y su naturaleza de adaptador LoRA implican que no debe considerarse una fuente autoritativa de conocimiento igbo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-0.5B-Instruct como base) |
| Parametros totales | 495.114.112 (incluyendo el modelo base) |
| Parametros activos | 495.114.112 (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (el adaptador está enfocado en igbo; el base es multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado a **Qwen2.5-0.5B-Instruct**, un transformer decoder-only de 0.5 mil millones de parámetros desarrollado por Alibaba Cloud. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención, reduciendo drásticamente el número de parámetros entrenables. En este caso, se usó un rango de 8, alpha de 16 y dropout de 0.05, lo que resultó en 1.081.344 parámetros entrenables.

El entrenamiento se realizó sobre un dataset propio de 490 ejemplos que contienen términos igbo, sus significados y respuestas objetivo diseñadas para fomentar explicaciones precisas y culturalmente apropiadas. Se emplearon 2 épocas, un tamaño de lote de 2 con acumulación de gradientes de 4 pasos, una tasa de aprendizaje de 2e-4, una longitud máxima de secuencia de 512 tokens y precisión FP16. El proceso se ejecutó en una GPU T4 de Google Colab y duró aproximadamente 141 segundos. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al fine-tuning supervisado.

## Capacidades

- Generación de texto en igbo, específicamente explicaciones de términos y significados culturales.
- Respuestas adaptadas a un contexto cultural igbo, según los ejemplos del dataset de entrenamiento.
- Capacidad multilingüe heredada del modelo base Qwen2.5-0.5B-Instruct, aunque el adaptador no ha sido validado para otros idiomas.
- No se documenta soporte para tool calling, function calling, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- Al ser un adaptador LoRA, requiere cargar el modelo base Qwen2.5-0.5B-Instruct para realizar inferencia.

## Casos de uso

- Investigación en NLP de bajo recurso: sirve como punto de partida para estudiar técnicas de adaptación eficiente (PEFT) aplicadas a lenguas africanas minoritarias, permitiendo comparar metodologías con datasets limitados.
- Prototipos de asistentes educativos para el aprendizaje del igbo: el modelo puede generar explicaciones de términos y significados, aunque siempre con supervisión humana de hablantes nativos.
- Análisis exploratorio de terminología cultural: permite consultar rápidamente posibles interpretaciones de términos igbo en contextos académicos o de documentación, siempre como apoyo y no como fuente definitiva.
- Base para fine-tuning adicional: al ser un adaptador pequeño, puede integrarse en pipelines de entrenamiento para ampliar el dataset o mejorar la cobertura de dominios específicos.
- Evaluación de técnicas de alineación cultural en modelos pequeños: útil para experimentos que miden cómo un modelo de 0.5B puede incorporar matices culturales con pocos ejemplos.
- Demostración de despliegue ligero: al requerir solo ~1 GB de VRAM en FP16, es adecuado para entornos con recursos limitados, como portátiles o CPUs, para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta las pérdidas de entrenamiento y evaluación:

| Metrica | Resultado |
|---|---|
| Pérdida de entrenamiento | 1.7721 |
| Pérdida de evaluación | 1.5532 |
| Tiempo de entrenamiento | ~141 segundos |
| Ejemplos de entrenamiento | 439 |
| Ejemplos de evaluación | 49 |

Estos valores no son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K, y no se dispone de datos de rendimiento en tareas de referencia.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 0.5B, la inferencia es extremadamente ligera. El modelo base en FP16 ocupa aproximadamente 1 GB de VRAM, y el adaptador añade una cantidad despreciable.
- Es ejecutable en GPUs de consumo como una NVIDIA GTX 1060 (6 GB) o superiores, así como en CPUs modernas con suficiente RAM (al menos 4 GB).
- No se requieren GPUs de datacenter (A100, H100) para este modelo.
- Opciones de despliegue: puede usarse con bibliotecas de Hugging Face Transformers, PEFT para cargar el adaptador, y también con llama.cpp u Ollama si se convierte el modelo base a GGUF y se fusiona el adaptador (aunque no se proporcionan instrucciones específicas).
- La latencia estimada en CPU es del orden de decenas de milisegundos por token, y en GPU de pocos milisegundos, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (adaptadores LoRA para lenguas africanas de bajo recurso). No se han encontrado modelos comparables en la información proporcionada ni en los resultados de búsqueda web. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy reducido (490 ejemplos), lo que limita la cobertura del vocabulario y los matices culturales del igbo. El modelo no debe considerarse una fuente autoritativa.
- Las respuestas pueden contener alucinaciones o imprecisiones, especialmente en contextos históricos, culturales o sensibles. Se recomienda revisión por hablantes nativos o expertos culturales.
- El modelo es un adaptador LoRA y no funciona de forma independiente; requiere el modelo base Qwen2.5-0.5B-Instruct para la inferencia.
- La licencia no está especificada en la model card, por lo que se desconoce si permite uso comercial. Se recomienda contactar con el autor antes de cualquier uso en producción.
- No se ha evaluado el rendimiento en tareas generales de generación de texto, razonamiento o código; su uso previsto es exclusivamente educativo y experimental.
- La longitud de contexto efectiva no está documentada; el entrenamiento usó secuencias de 512 tokens, pero el modelo base soporta más, aunque no se ha validado el comportamiento del adaptador con contextos largos.

## Enlaces

- [HuggingFace - PeaceMmesoma-15/Igbo-qwen-finetuned](https://huggingface.co/PeaceMmesoma-15/Igbo-qwen-finetuned)
- [Modelo base Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct) (referencia, no incluido en la información original)
