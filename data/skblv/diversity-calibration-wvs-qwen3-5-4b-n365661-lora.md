# skblv/diversity-calibration-wvs-qwen3.5-4b-n365661-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-4b-n365661-lora` es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-4B por el autor identificado como skblv. No se trata de un modelo de propósito general, sino de un ajuste fino muy específico orientado a la calibración de diversidad en la generación de respuestas: el adaptador se ha entrenado para predecir la letra de respuesta que un encuestado con un perfil demográfico dado elegiría ante una pregunta concreta de la World Values Survey (WVS), ronda 7.

El problema que aborda es el desajuste entre la distribución de respuestas que generan los LLM y la distribución real observada en poblaciones humanas, un fenómeno descrito en el artículo asociado (Skobelev, Fithian y Han, 2026) como colapso de moda y sobredispersión. El adaptador se entrena sobre 365.661 ejemplos encuestado-pregunta, con el objetivo de que la diversidad relativa de las respuestas generadas converja hacia el valor calibrado R = 1.

Por su naturaleza (adaptador PEFT de 0,1 GB sobre un modelo base de 4B), su relevancia es fundamentalmente metodológica y de investigación: sirve como artefacto reproducible para estudiar calibración demográfica en LLM, no como asistente conversacional general. La información pública disponible sobre el adaptador es limitada y no incluye datos de benchmarks, licencia ni idiomas soportados más allá de lo que se deduce del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (el dataset WVS esta en multiples idiomas; el autor no lo declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0,05, entrenado con la librería PEFT sobre el modelo base Qwen/Qwen3.5-4B. Se entrenó durante tres épocas sobre 365.661 ejemplos de encuestado-pregunta extraídos de la World Values Survey, ronda 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto de entrenamiento emplea un tercio fijo y aleatorio de países y de preguntas medibles, lo que sugiere una partición controlada para evaluar generalización a países y preguntas no vistos.

Cada prompt de usuario contiene una persona demográfica, la pregunta de la encuesta y opciones de respuesta etiquetadas con letras; el objetivo es la letra de respuesta del encuestado. Los tokens del prompt se enmascaran en la pérdida y esta se aplica únicamente al token o tokens de la letra de respuesta y al token EOS. Esta configuración de enmascaramiento es clave: fuerza al adaptador a modelar la distribución condicional sobre las opciones sin contaminar el gradiente con la predicción del propio enunciado. El artículo asociado (arXiv:2609.16454) enmarca el entrenamiento en el estudio de calibración de diversidad, con una curva de convergencia que compara la diversidad relativa del adaptador frente al valor calibrado R = 1.

## Capacidades

- Generación de texto condicionada a un perfil demográfico y a una pregunta de encuesta con opciones letradas.
- Predicción de la opción de respuesta (letra) más probable para un encuestado sintético con atributos demográficos dados.
- Modelado de distribuciones de respuesta calibradas en diversidad, orientado a reproducir la heterogeneidad de poblaciones humanas en lugar de colapsar hacia la respuesta modal.
- Evaluación de calibración demográfica en LLM: el adaptador sirve como referencia para medir desviaciones de diversidad relativa (R) frente a R = 1.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito en la información disponible.
- Capacidades multilingües: no disponibles de forma declarada; dependen del modelo base y de la cobertura lingüística del dataset WVS.

## Casos de uso

- Investigación en calibración de diversidad: usar el adaptador como artefacto reproducible para replicar el experimento del artículo y medir la diversidad relativa de las respuestas generadas frente a la distribución observada en la WVS.
- Simulación de opinión pública: generar respuestas sintéticas de encuestados con perfiles demográficos concretos para explorar escenarios contrafactuales antes de un trabajo de campo real, aprovechando que el adaptador ha visto 365.661 ejemplos encuestado-pregunta.
- Aumentación de datos de encuesta: producir respuestas sintéticas condicionadas a demografía para aumentar muestras pequeñas de subgrupos infrarrepresentados, siempre con validación estadística posterior.
- Auditoría de sesgos demográficos: comparar las distribuciones generadas por el adaptador con las reales por país y grupo demográfico para detectar desviaciones sistemáticas en el modelo base.
- Docencia y divulgación sobre sesgos en LLM: emplear el adaptador como ejemplo práctico de cómo el ajuste fino modifica la diversidad de salida de un modelo de 4B.
- Evaluación de generalización geográfica: al haberse entrenado con un tercio fijo de países, el adaptador permite estudiar la transferencia a países no vistos en el conjunto de entrenamiento.
- Prototipado de encuestas sintéticas en pipelines de investigación social: integrar el adaptador en un flujo que reciba perfiles demográficos y preguntas y devuelva la letra de opción, con el modelo base servido mediante PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente presenta una curva de convergencia de diversidad relativa (R) frente al valor calibrado R = 1, sin valores numéricos tabulados ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero la inferencia requiere cargar el modelo base Qwen/Qwen3.5-4B completo.
- VRAM estimada para el modelo base en precisión completa (BF16/FP16): aproximadamente 8-9 GB, más overhead de activaciones y del adaptador.
- VRAM estimada con cuantización de 8 bits: en torno a 4-5 GB; con 4 bits, en torno a 2,5-3,5 GB (estimaciones orientativas; no confirmadas en la información proporcionada).
- GPU recomendadas: A100 o H100 para despliegue de alto throughput; RTX 4090, RTX 3090 o RTX A6000 para desarrollo e inferencia individual.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) sin cuantización y en GPUs de 8-12 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: PEFT con Transformers, vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-4b-n365661-lora | LoRA r=16 sobre Qwen3.5-4B | no disponible | Calibración de diversidad en encuestas WVS | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Modelo de propósito general | no disponible | Hugging Face |
| Adaptadores LoRA de calibración demográfica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la información proporcionada adaptadores alternativos equivalentes para calibración de diversidad sobre encuestas WVS, por lo que la comparativa con modelos de la misma categoría queda limitada al modelo base.

## Limitaciones y advertencias

- El adaptador está especializado en una única tarea (predicción de letra de respuesta en preguntas WVS) y no debe emplearse como asistente conversacional general.
- Riesgo de alucinación: aunque el formato de salida es una letra entre las opciones, el modelo puede generar letras fuera del conjunto de opciones o texto adicional si no se restringe la decodificación.
- Sesgos conocidos: el adaptador reproduce la distribución de la WVS ronda 7, con los sesgos de muestreo, cobertura por país y formulación de preguntas propios de esa encuesta; no representa poblaciones ausentes del dataset.
- La partición de entrenamiento usa solo un tercio de países y preguntas medibles; el rendimiento en países o preguntas no vistos puede degradarse y no se documenta su magnitud.
- Idiomas soportados no declarados: el comportamiento en lenguas distintas de las presentes en el subconjunto de entrenamiento es incierto.
- Licencia no disponible: no puede confirmarse la legalidad del uso comercial del adaptador; además, el uso queda sujeto a la licencia del modelo base Qwen/Qwen3.5-4B.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria independiente.
- No hay benchmarks publicados que permitan estimar la calidad de las predicciones frente a alternativas.
- Para producción, es imprescindible validar la calibración del adaptador en el dominio concreto de aplicación y fijar la decodificación (greedy o muestreo restringido a las opciones) para evitar salidas inválidas.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n365661-lora
- Artículo: https://arxiv.org/abs/2609.16454
- Dataset WVS ronda 7: https://doi.org/10.14281/18241.24
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
