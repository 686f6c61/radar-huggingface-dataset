# skblv/diversity-calibration-wvs-qwen3.5-2b-n89-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-2b-n89-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3.5-2B. Lo desarrolla el investigador Kirill Skobelev (junto con Eric Fithian y X. Y. Han) en el contexto del artículo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454). No se trata de un modelo de propósito general, sino de un artefacto de investigación concebido para estudiar y corregir problemas de diversidad en las respuestas de modelos de lenguaje cuando se les pide emular la distribución de respuestas de encuestados humanos.

El adaptador se ha ajustado durante tres épocas sobre un conjunto de 89 ejemplos de encuestado-pregunta extraídos de la World Values Survey (WVS), ronda 7. Cada ejemplo combina una persona demográfica sintética, una pregunta de encuesta y opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es la letra de la opción elegida por el encuestado real. El propósito es calibrar la diversidad de las respuestas generadas por el modelo, de modo que su dispersión se aproxime a la observada en la población real (ratio de diversidad relativa R = 1).

La relevancia de esta ficha radica en su carácter metodológico: muestra cómo un ajuste fino ligero con LoRA puede corregir tanto el colapso de modos (respuestas demasiado homogéneas) como la sobredispersión (respuestas demasiado variadas) en tareas de simulación de opinión. Es un adaptador pequeño, de uso experimental, que requiere cargar el modelo base Qwen3.5-2B por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0.05 |
| Epocas de entrenamiento | 3 |
| Tamano del dataset | 89 ejemplos encuestado-pregunta |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA con rango 16, alpha 32 y dropout 0.05, aplicada sobre el modelo base Qwen3.5-2B (un transformer de 2.000 millones de parámetros). El entrenamiento se realizó durante tres épocas sobre 89 ejemplos extraídos de la World Values Survey, ronda 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto de entrenamiento se construyó tomando un tercio fijo y aleatorio de los países y de las preguntas medibles de la encuesta.

Cada prompt de usuario contiene una persona demográfica, la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras; el objetivo es la letra de la opción seleccionada por el encuestado. Durante el entrenamiento se enmascararon los tokens del prompt en la función de pérdida, aplicándose esta únicamente al token (o tokens) de la letra de respuesta y al token EOS. La innovación metodológica no está en la arquitectura, sino en el objetivo de calibración de diversidad: el adaptador busca que la distribución de respuestas generadas converja hacia la diversidad calibrada (R = 1), corrigiendo simultáneamente el colapso de modos y la sobredispersión descritos en el artículo asociado.

## Capacidades

- Generación de texto condicionada a personas demográficas y preguntas de encuesta.
- Simulación de respuestas de encuestados con opciones de respuesta etiquetadas.
- Calibración de la diversidad de respuestas hacia la distribución observada en la WVS (ratio de diversidad relativa R = 1).
- Corrección de colapso de modos (respuestas demasiado homogéneas) y de sobredispersión (respuestas demasiado variadas) en tareas de simulación de opinión.
- Capacidades generales heredadas del modelo base Qwen3.5-2B (no documentadas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en ciencias sociales computacionales: el adaptador permite simular respuestas de encuestados con perfiles demográficos concretos y comparar la distribución generada con la observada en la WVS, evaluando la fidelidad de los modelos de lenguaje como sustitutos de encuestados.
- Estudio de calibración de diversidad en LLM: sirve como referencia experimental para medir el colapso de modos y la sobredispersión en tareas de generación con opciones discretas, gracias a su curva de convergencia documentada.
- Reproducción de experimentos del artículo arXiv:2609.16454: el adaptador permite replicar los resultados de calibración de diversidad con el mismo subconjunto de 89 ejemplos y el mismo esquema de entrenamiento LoRA.
- Generación de personas sintéticas para encuestas: se puede emplear para producir distribuciones de respuesta plausibles en estudios piloto o de pre-test de cuestionarios, siempre con validación frente a datos reales.
- Análisis de sesgo demográfico: al condicionar las respuestas a atributos demográficos, permite estudiar cómo varía la distribución de opiniones generadas entre grupos poblacionales.
- Docencia y divulgación sobre ajuste fino: por su tamaño reducido y su configuración LoRA explícita (r=16, alpha=32, dropout=0.05), es un ejemplo didáctico de adaptación de un modelo de 2B con recursos mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una curva de convergencia de diversidad relativa (con R = 1 como línea de calibración), sin valores numéricos de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo base de 2B parámetros, los requisitos son los del modelo base (típicamente entre 4 y 6 GB en FP16, y menos con cuantización de 8 o 4 bits, aunque estos valores no se confirman en la información proporcionada).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo base (2B), pero no confirmado en la información disponible.
- Opciones de despliegue: la librería indicada es PEFT; el despliegue requiere cargar el modelo base Qwen/Qwen3.5-2B y aplicar el adaptador. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-2b-n89-lora | Adaptador LoRA sobre 2B | no disponible | LoRA de calibración de diversidad | no disponible | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3.5-2B | 2B | no disponible | Modelo base transformer | no disponible | Hugging Face |
| Alternativas de calibración de diversidad en LLM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de calibración de diversidad en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no es un modelo de propósito general; está especializado en responder preguntas de encuesta con opciones etiquetadas.
- Dataset de entrenamiento muy reducido: solo 89 ejemplos, lo que limita la generalización a otras preguntas, países o dominios no representados en el subconjunto.
- Sesgo de muestreo: el subconjunto usa un tercio fijo y aleatorio de países y preguntas medibles de la WVS, por lo que la cobertura demográfica y temática es parcial.
- Riesgo de alucinación: no evaluado en la información disponible; al generar letras de respuesta, puede producir opciones no válidas o inconsistentes con el formato esperado.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial; se debe consultar al autor antes de cualquier uso en producción.
- Idiomas soportados no disponibles: no se documenta el comportamiento multilingüe del adaptador ni del modelo base.
- Dependencia del modelo base: requiere cargar Qwen/Qwen3.5-2B por separado; el adaptador por sí solo no es funcional.
- Sin métricas de rendimiento publicadas: no hay benchmarks que permitan comparar su calidad frente a alternativas.
- Advertencia de uso responsable: la simulación de opiniones demográficas puede reforzar estereotipos si se usa sin validación empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n89-lora
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Artículo: Skobelev, K., Fithian, E., and Han, X. Y. (2026). Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs. arXiv:2609.16454 — https://arxiv.org/abs/2609.16454
- World Values Survey, Round Seven, Country-Pooled Datafile, v6.0.0 (Haerpfer et al., eds., 2022): https://doi.org/10.14281/18241.24
