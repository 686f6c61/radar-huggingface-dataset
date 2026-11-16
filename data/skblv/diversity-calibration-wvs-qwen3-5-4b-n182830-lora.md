# skblv/diversity-calibration-wvs-qwen3.5-4b-n182830-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-4b-n182830-lora` es un adaptador LoRA entrenado por el autor identificado como `skblv` sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo de propósito general, sino de un artefacto de investigación orientado a un experimento concreto: la calibración de la diversidad de respuestas de un LLM en encuestas de opinión. El adaptador se ha afinado para responder a preguntas de la World Values Survey (WVS) Ronda 7 adoptando la perspectiva de una persona descrita mediante un perfil demográfico, devolviendo únicamente la letra de la opción elegida.

El trabajo se enmarca en el artículo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (Skobelev, Fithian y Han, 2026, arXiv:2609.16454), que estudia cómo el ajuste fino afecta a la diversidad de las distribuciones generadas por el modelo. El adaptador se entrenó con 182.830 pares encuestado-pregunta durante tres épocas y su relevancia actual es metodológica: sirve como referencia reproducible para estudiar el colapso de modos y la sobredispersión en modelos generativos aplicados a la simulación de poblaciones.

El repositorio es muy pequeño (0,1 GB), coherente con un adaptador LoRA de rango 16 sobre un modelo de 4B parámetros. No se dispone de datos sobre licencia del adaptador, idiomas soportados ni resultados de benchmarks más allá de la curva de convergencia de diversidad relativa incluida en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (modelo base: 4B; adaptador LoRA de rango 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B mediante PEFT con configuración LoRA de rango 16, alpha 32 y dropout 0,05. El entrenamiento consistió en tres épocas sobre 182.830 ejemplos encuestado-pregunta extraídos de la World Values Survey Ronda 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto de entrenamiento se construyó tomando un tercio aleatorio fijo de los países y de las preguntas medibles, lo que deja el resto de países y preguntas como posible conjunto de evaluación.

Cada prompt contiene un perfil demográfico (persona), el enunciado de la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras; el objetivo es la letra de la opción elegida por el encuestado. La pérdida se enmascara sobre los tokens del prompt y se aplica únicamente al token o tokens de la letra de respuesta y al token EOS, lo que evita que el modelo aprenda a reproducir el formato del perfil demográfico. La innovación metodológica del trabajo es el uso de una métrica de diversidad relativa (R) frente a la diversidad calibrada (R = 1), representada en la curva de convergencia del repositorio con bandas percentiles 25-75 por par pregunta-grupo demográfico.

## Capacidades

- Generación de texto condicionada a un perfil demográfico y a una pregunta de encuesta con opciones cerradas.
- Predicción de la letra de respuesta a preguntas tipo WVS (escala Likert, opciones múltiples).
- Simulación de la distribución de respuestas de subgrupos poblacionales definidos por atributos demográficos.
- Reproducción de la diversidad de respuestas calibrada, objetivo del artículo asociado.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (no declaradas en la model card).
- El adaptador está especializado en el formato de prompt del experimento; no se ha validado como modelo conversacional general.

## Casos de uso

- Simulación de opinión pública: generar distribuciones sintéticas de respuesta a preguntas de la WVS para países y grupos demográficos concretos, útil para estudios de sensibilidad de encuestas y análisis contrafactuales.
- Investigación sobre diversidad en LLM: servir como punto de referencia experimental para medir colapso de modos y sobredispersión, comparando la curva de diversidad relativa del adaptador con la del modelo base sin ajustar.
- Aumentación de datos de encuesta: generar respuestas sintéticas etiquetadas por perfil demográfico para preentrenar o calibrar modelos auxiliares de imputación de no respuesta.
- Validación de sesgos demográficos: comparar la distribución generada por el adaptador con la distribución real de la WVS para detectar desviaciones sistemáticas por país, edad, género o nivel educativo.
- Reproducibilidad académica: replicar el experimento de Skobelev et al. (2026) cargando el adaptador con PEFT sobre Qwen3.5-4B y evaluando sobre el tercio de países y preguntas reservados.
- Docencia y divulgación: demostrar de forma práctica cómo un ajuste fino con pérdida enmascarada sobre el token de respuesta modifica el comportamiento distribucional de un modelo de 4B en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una curva de convergencia de diversidad relativa (R) frente a la diversidad calibrada (R = 1), sin cifras numéricas de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia, un modelo base de 4B parámetros en precisión completa requiere del orden de 8-10 GB, y en cuantización de 4 bits puede situarse en torno a 2,5-3 GB, pero estos valores no están confirmados para este adaptador.
- GPU recomendadas: no disponible; por tamaño del modelo base, una GPU de consumo con 8-16 GB de VRAM debería ser suficiente para inferencia en cuantización, aunque no se ha verificado.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo base, pero no confirmada en la documentación.
- Opciones de despliegue: PEFT con Transformers (carga del adaptador sobre Qwen3.5-4B); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diversity-calibration-wvs-qwen3.5-4b-n182830-lora | 4B (base) + LoRA r16 | no disponible | Adaptador LoRA especializado | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | LLM generalista | no disponible | Hugging Face |
| Adaptadores LoRA de simulación de encuestas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos directamente comparables en la misma tarea de calibración de diversidad sobre la World Values Survey.

## Limitaciones y advertencias

- Modelo altamente especializado: solo se ha entrenado para responder preguntas de la WVS Ronda 7 en el formato exacto del experimento; su uso fuera de ese dominio no está validado.
- El adaptador se entrenó con un tercio fijo de países y preguntas, por lo que puede generalizar mal a países o ítems no vistos.
- Riesgo de alucinación y de reproducir estereotipos demográficos: el modelo aprende asociaciones entre perfiles demográficos y respuestas de encuesta, lo que puede amplificar sesgos presentes en los datos de la WVS.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador; además, la licencia del modelo base Qwen3.5-4B debe verificarse por separado.
- Idiomas soportados no declarados; el entrenamiento se realizó presumiblemente en el idioma de la WVS Ronda 7, sin confirmación.
- Sin métricas de rendimiento publicadas más allá de la curva de diversidad; no hay evidencia de calidad en tareas generales.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de uso en producción.
- La fecha de creación del repositorio (2026-08-31) y la referencia arXiv (2609.16454) deben tratarse con cautela hasta confirmar la publicación del artículo.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n182830-lora
- Artículo: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset WVS Ronda 7: https://doi.org/10.14281/18241.24
