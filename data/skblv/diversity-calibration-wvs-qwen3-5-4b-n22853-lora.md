# skblv/diversity-calibration-wvs-qwen3.5-4b-n22853-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-4b-n22853-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario skblv sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo fundacional, sino de un ajuste fino especializado para una tarea muy concreta: predecir la opción de respuesta seleccionada por un encuestado en la World Values Survey (WVS), ronda 7. El adaptador se ha entrenado con 22.853 ejemplos de pares encuestado-pregunta, donde cada prompt incluye una persona demográfica, la pregunta de la encuesta y las opciones de respuesta letradas, y el objetivo es la letra de la opción elegida.

La relevancia de este adaptador no reside en sus capacidades generales de generación de texto, sino en su papel como artefacto de investigación en el estudio de la calibración de diversidad en LLMs. El trabajo asociado, "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (Skobelev, Fithian y Han, 2026, arXiv:2609.16454), investiga cómo el ajuste fino afecta a la diversidad de las distribuciones de salida del modelo. Este adaptador concreto representa un punto de la curva de convergencia de diversidad relativa, con un tamaño de muestra N=22.853.

El adaptador tiene un tamaño de repositorio de 0,1 GB, lo que es coherente con un LoRA de rango 16 sobre un modelo de 4B de parámetros. Está publicado en Hugging Face bajo la librería PEFT, con formato safetensors, y no cuenta con descargas ni likes en el momento de la consulta. La licencia y los idiomas soportados no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen/Qwen3.5-4B, un transformer de 4.000 millones de parámetros. El ajuste fino se realizó mediante LoRA de rango 16, con alpha 32 y dropout 0,05. El entrenamiento se llevó a cabo durante tres épocas sobre 22.853 ejemplos de pares encuestado-pregunta extraídos de la World Values Survey Ronda 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto de entrenamiento utilizó un tercio aleatorio fijo de países y preguntas medibles.

Una innovación técnica destacable es la estrategia de enmascaramiento de la pérdida: los tokens del prompt se enmascaran y la pérdida se aplica únicamente al token o tokens de la letra de respuesta y al token EOS. Esto concentra el aprendizaje en la tarea de selección de opción, evitando que el modelo aprenda a reproducir el formato del prompt. El trabajo asociado investiga cómo el ajuste fino corrige el colapso de modos y la sobredispersión en las distribuciones de salida de los LLMs, y este adaptador forma parte de la curva de convergencia de diversidad relativa presentada en la model card.

## Capacidades

- Generación de texto condicionada a un prompt de persona demográfica y pregunta de encuesta.
- Predicción de la letra de opción de respuesta seleccionada por un encuestado simulado.
- Modelado de distribuciones de respuesta calibradas en diversidad (objetivo del trabajo de investigación asociado).
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles en la información proporcionada.
- No se ha documentado modo de pensamiento (thinking mode), visión ni audio.

## Casos de uso

- Simulación de respuestas de encuesta: el adaptador permite generar la opción de respuesta que un perfil demográfico concreto elegiría ante una pregunta de la WVS, útil para estudios de opinión sintética y validación de cuestionarios.
- Investigación sobre calibración de diversidad: sirve como artefacto reproducible para estudiar cómo el ajuste fino afecta a la diversidad de las distribuciones de salida, tal como se describe en el paper asociado.
- Análisis de sesgos demográficos: al condicionar por persona demográfica, permite examinar qué perfiles producen distribuciones de respuesta más o menos diversas y detectar posibles sesgos en el modelo base.
- Generación de datos sintéticos para ciencias sociales: puede utilizarse para aumentar muestras de encuestas con perfiles demográficos subrepresentados, siempre con las cautelas metodológicas oportunas.
- Evaluación de modelos base: el adaptador puede servir como referencia de ajuste fino especializado para comparar el comportamiento de Qwen3.5-4B antes y después del LoRA en tareas de selección de opción.
- Docencia y experimentación con PEFT: por su tamaño reducido (0,1 GB) y su configuración LoRA explícita, es un ejemplo práctico para aprender a aplicar adaptadores sobre modelos de 4B en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; el modelo base Qwen3.5-4B requiere aproximadamente 8 GB en FP16 y alrededor de 2,5-3 GB en cuantización de 4 bits, aunque estos valores no se confirman en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el modelo base de 4B es plausible en GPUs de consumo con cuantización, pero no se confirma en la información.
- Opciones de despliegue: la librería indicada es PEFT, por lo que el adaptador se cargaría junto al modelo base mediante la API de PEFT; no se especifican otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores LoRA comparables sobre Qwen3.5-4B ni modelos de la misma categoría (ajuste fino para simulación de encuestas WVS) con los que establecer una comparación rigurosa.

## Limitaciones y advertencias

- El adaptador está especializado exclusivamente en la tarea de selección de opción de la WVS Ronda 7; no es un modelo de propósito general y su uso fuera de ese dominio no está validado.
- El entrenamiento utilizó un tercio aleatorio fijo de países y preguntas medibles, por lo que puede generalizar mal a países o preguntas no incluidos en ese subconjunto.
- Riesgo de alucinación: aunque la tarea es de clasificación de opción, el modelo puede generar letras no válidas o texto fuera del formato esperado si se usa con prompts distintos a los de entrenamiento.
- Sesgos conocidos: al modelar respuestas de encuesta condicionadas por demografía, el adaptador puede reproducir o amplificar sesgos presentes en los datos de la WVS y en el modelo base.
- Restricciones de licencia para uso comercial: la licencia no está disponible, por lo que no se puede confirmar si se permite uso comercial; se recomienda consultar con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingüe del adaptador.
- El repositorio no registra descargas ni likes, lo que sugiere que no ha sido validado por la comunidad; su uso en producción conlleva un riesgo de fiabilidad no cuantificado.
- La fecha de creación (2026-08-31) y la referencia al paper arXiv:2609.16454 indican que se trata de un artefacto de investigación reciente, no de un modelo consolidado.

## Enlaces

- [Hugging Face: skblv/diversity-calibration-wvs-qwen3.5-4b-n22853-lora](https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n22853-lora)
- [Paper: Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs (arXiv:2609.16454)](https://arxiv.org/abs/2609.16454)
- [World Values Survey: Round Seven—Country-Pooled Datafile, v6.0.0](https://doi.org/10.14281/18241.24)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
