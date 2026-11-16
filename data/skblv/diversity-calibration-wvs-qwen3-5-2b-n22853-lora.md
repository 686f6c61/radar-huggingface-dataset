# skblv/diversity-calibration-wvs-qwen3.5-2b-n22853-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-2b-n22853-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3.5-2B, publicado por el usuario skblv. No se trata de un modelo completo, sino de un conjunto de pesos PEFT que debe cargarse junto al modelo base para su uso. Su propósito específico es la simulación calibrada de respuestas a encuestas de opinión, concretamente a preguntas de la World Values Survey (WVS) Ronda 7.

El adaptador fue ajustado durante tres épocas sobre 22.853 pares pregunta-encuestado, construidos a partir de una submuestra fija de un tercio de los países y de las preguntas medibles de la encuesta. Cada ejemplo de entrenamiento contiene una persona demográfica simulada, el enunciado de la pregunta y las opciones de respuesta etiquetadas con letras; el objetivo es la letra de respuesta del encuestado original. El trabajo se enmarca en la publicación arXiv:2609.16454, "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs", de Skobelev, Fithian y Han (2026).

La relevancia del adaptador es metodológica más que de producto: demuestra que un ajuste fino supervisado de bajo rango puede corregir dos patologías opuestas de los LLM al generar distribuciones de respuesta, la colapso de moda (mode collapse) y la sobredispersión, acercando la diversidad relativa de las respuestas generadas al valor de calibración R = 1. Con 2.000 millones de parámetros en el modelo base, es un artefacto ligero y reproducible para investigación en ciencias sociales computacionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-2B |
| Parámetros totales | no disponible (el adaptador LoRA es de rango 16; el modelo base tiene aproximadamente 2.000 millones de parámetros) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA de rango 16, con alpha 32 y dropout 0,05, sobre el modelo base Qwen/Qwen3.5-2B. Se enmascaran los tokens del prompt en la función de pérdida, de modo que el gradiente se calcula únicamente sobre el token o tokens de la letra de respuesta y el token EOS. El entrenamiento consistió en tres épocas sobre 22.853 ejemplos de encuestado-pregunta extraídos de la World Values Survey Ronda 7 (Haerpfer et al., 2022, v6.0.0), usando una partición fija aleatoria de un tercio de los países y de las preguntas medibles.

La innovación técnica no reside en la arquitectura, sino en el objetivo de calibración: el trabajo asociado mide la diversidad relativa de las distribuciones de respuesta generadas frente a las distribuciones empíricas de la encuesta y demuestra que el ajuste fino reduce simultáneamente la colapso de moda y la sobredispersión. La model card incluye una curva de convergencia de diversidad relativa donde el adaptador se marca con un cuadrado rojo y la línea discontinua representa la diversidad calibrada (R = 1). No se documentan detalles adicionales sobre el dataset de preentrenamiento del modelo base ni sobre el uso de RLHF o DPO en el adaptador.

## Capacidades

- Generación de texto condicionada por un prompt que describe una persona demográfica y una pregunta de encuesta con opciones etiquetadas.
- Predicción de la letra de respuesta a preguntas de la World Values Survey Ronda 7.
- Generación de distribuciones de respuesta calibradas en diversidad, con el objetivo de evitar tanto el colapso de moda como la sobredispersión.
- Capacidades heredadas del modelo base Qwen/Qwen3.5-2B (generación de texto general, razonamiento y código): no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Simulación de opinión pública: el adaptador permite generar respuestas sintéticas a preguntas de la WVS Ronda 7 condicionadas por perfiles demográficos, útil para estudiar cómo varía la distribución de respuestas entre grupos sin acceder a microdatos restringidos.
- Investigación en calibración de LLM: sirve como referencia reproducible para medir la diversidad relativa de las distribuciones generadas frente a las empíricas, y para evaluar técnicas de corrección de colapso de moda y sobredispersión.
- Aumento de datos para ciencias sociales: puede generar respuestas sintéticas etiquetadas por demografía para preentrenar o aumentar modelos downstream de análisis de encuestas, con la advertencia de que son datos sintéticos.
- Validación de pipelines de encuestas: permite probar sistemas de codificación de respuestas y de imputación de no respuesta sobre datos generados con distribuciones controladas.
- Docencia y divulgación: ofrece un ejemplo ligero y ejecutable en hardware de consumo de cómo un ajuste fino LoRA puede modificar el comportamiento distribucional de un modelo base de 2.000 millones de parámetros.
- Estudio de sesgos demográficos: al condicionar por persona demográfica, permite analizar si el modelo reproduce o amplifica diferencias de respuesta entre grupos de la encuesta original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una curva de convergencia de diversidad relativa (R) frente al entrenamiento, sin valores numéricos de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, el modelo base de 2.000 millones de parámetros en precisión de 16 bits requiere del orden de 4-5 GB de VRAM, y en cuantización de 4 bits del orden de 1,5-2 GB, más el overhead del adaptador LoRA (despreciable, rango 16).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo base es apto para GPU de consumo con 8 GB o más de VRAM.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas con 8 GB o más de VRAM, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: la librería declarada es PEFT; el adaptador puede cargarse con la integración PEFT de Transformers. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye adaptadores LoRA comparables para calibración de diversidad en encuestas ni resultados de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El adaptador está entrenado únicamente sobre un tercio fijo de los países y de las preguntas medibles de la WVS Ronda 7; su comportamiento fuera de esa partición no está validado.
- Las respuestas generadas son sintéticas y no deben interpretarse como opiniones reales de poblaciones ni usarse para inferencia causal sobre la sociedad.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste fino sobre un único token de respuesta reduce la exposición, pero no elimina el riesgo del modelo base.
- Sesgos conocidos: no documentados en la información disponible; el adaptador hereda los sesgos del modelo base Qwen/Qwen3.5-2B y los de la propia WVS Ronda 7.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Licencia: no disponible, por lo que el uso comercial no puede confirmarse; debe verificarse antes de cualquier despliegue en producción.
- El repositorio tiene un tamaño de 0,0 GB y cero descargas, lo que sugiere que los pesos pueden no estar completamente subidos o que el artefacto es meramente de referencia; conviene verificar la integridad de los ficheros antes de usarlo.
- Requiere cargar el modelo base Qwen/Qwen3.5-2B, cuyas condiciones de licencia y uso se aplican de forma adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n22853-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper: https://arxiv.org/abs/2609.16454
- Dataset WVS Ronda 7: https://doi.org/10.14281/18241.24
