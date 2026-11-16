# skblv/diversity-calibration-wvs-qwen3.5-4b-n2856-lora

## Resumen

`skblv/diversity-calibration-wvs-qwen3.5-4b-n2856-lora` es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario skblv en Hugging Face. No se trata de un modelo fundacional, sino de un ajuste fino orientado a una tarea muy concreta: predecir la letra de respuesta que un encuestado de la World Values Survey (WVS) habría seleccionado, dado un persona demográfico y una pregunta con opciones etiquetadas.

El adaptador forma parte del trabajo de investigación "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (Skobelev, Fithian y Han, 2026, arXiv:2609.16454). El objetivo del estudio es la calibración de la diversidad de las respuestas generadas por LLM: los modelos ajustados con RLHF tienden a colapsar hacia respuestas mayoritarias (mode collapse) o a sobre-dispersarse respecto a la distribución real de una población. Este LoRA se entrena para reproducir la distribución empírica de respuestas de la WVS, sirviendo como artefacto de referencia del experimento.

El repositorio es de tamaño reducido (0,1 GB) y contiene únicamente los pesos del adaptador en formato safetensors, con la librería PEFT. No incluye pesos completos del modelo base ni información sobre licencia o idiomas soportados. Su interés es fundamentalmente de investigación en calibración demográfica y diversidad de salidas, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-4B; rango 16, alpha 32, dropout 0,05 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0,05, aplicado sobre el modelo Qwen/Qwen3.5-4B. Se entrenó durante tres épocas sobre 2.856 ejemplos de encuestado-pregunta extraídos de la World Values Survey, ronda 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto de entrenamiento se construyó tomando un tercio aleatorio fijo de países y de preguntas medibles, de modo que el resto queda disponible para evaluación.

Cada prompt de entrenamiento contiene un persona demográfico, la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras; el objetivo es la letra de la opción seleccionada por el encuestado. Los tokens del prompt se enmascaran en la pérdida, que se aplica únicamente al token o tokens de la letra de respuesta y al token EOS. Esta configuración fuerza al modelo a modelar la distribución condicional de respuestas dado el perfil demográfico, en lugar de generar texto libre.

La innovación metodológica del trabajo asociado es el uso de una métrica de diversidad relativa (R) que compara la dispersión de las respuestas generadas con la dispersión empírica de la población. El adaptador se sitúa en el gráfico de convergencia del repositorio como el punto que alcanza diversidad calibrada (R = 1), frente a la tendencia de los modelos base a colapsar o sobre-dispersarse. No se documentan detalles adicionales sobre la composición exacta del dataset, el proceso de RLHF/DPO (no aplica aquí) ni hiperparámetros de optimización más allá de los citados.

## Capacidades

- Predicción de la letra de respuesta a preguntas de encuesta dado un persona demográfico, replicando la distribución de la World Values Survey ronda 7.
- Modelado de distribuciones condicionales de respuesta por grupo demográfico, con calibración de diversidad respecto a la población real.
- Generación de texto restringida al formato de respuesta de opción única (letra + EOS); no está orientado a generación libre.
- Capacidad de razonamiento y conocimiento general heredada del modelo base Qwen3.5-4B, aunque el ajuste fino la especializa hacia la tarea de encuesta.
- Soporte de tool calling / function calling: no disponible (no documentado para este adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se especifican idiomas del adaptador; el modelo base Qwen3.5-4B es multilingüe, pero el ajuste se realizó sobre WVS, predominantemente en inglés y otros idiomas de la encuesta).
- Capacidades especiales (thinking mode, visión, audio): no disponible para este adaptador.

## Casos de uso

- Investigación en calibración de diversidad: usar el adaptador como referencia de un modelo con diversidad calibrada (R = 1) para comparar con modelos base y estudiar mode collapse y sobre-dispersión en LLM.
- Simulación de opinión pública: generar distribuciones sintéticas de respuestas a preguntas de la WVS condicionadas por perfil demográfico, para estudios de sensibilidad social o análisis de escenarios.
- Aumento de datos para ciencias sociales: producir respuestas sintéticas calibradas que complementen submuestras pequeñas de encuestas, manteniendo la estructura demográfica observada.
- Evaluación de sesgos demográficos: comparar la distribución generada por el adaptador con la empírica para detectar desviaciones sistemáticas por grupo de edad, género, país o nivel educativo.
- Reproducibilidad de experimentos: servir como artefacto de referencia para replicar los resultados del paper arXiv:2609.16454 sobre calibración de diversidad tras fine-tuning.
- Estudio de metodologías de ajuste: analizar el efecto del enmascarado de prompt y del entrenamiento solo sobre el token de respuesta en la fidelidad distribucional, como caso de fine-tuning supervisado restringido.
- Docencia en NLP aplicado a ciencias sociales: ejemplo práctico de LoRA sobre un modelo de 4B para una tarea de clasificación generativa con opciones etiquetadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente presenta una curva de convergencia de diversidad relativa (R) frente al número de ejemplos de entrenamiento, sin cifras numéricas de MMLU, HumanEval, GSM8K ni métricas de exactitud sobre la WVS.

## Requisitos de hardware

- El adaptador pesa 0,1 GB; el requisito real lo determina el modelo base Qwen/Qwen3.5-4B.
- VRAM estimada para inferencia del modelo base en FP16: en torno a 8-10 GB (4B parámetros × 2 bytes más overhead), no verificado en la información disponible.
- VRAM estimada en cuantización de 4 bits (p. ej. GGUF Q4): aproximadamente 3-4 GB, no verificado en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs consumer con 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4090) y en A100/H100 para despliegues por lotes.
- Cabe en GPU consumer: probablemente sí, en función de la cuantización del modelo base; no confirmado en la información disponible.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base con Transformers); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador, aunque podrían usarse fusionando el LoRA con el modelo base.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-4b-n2856-lora | 4B (base) + LoRA r16 | no disponible | Adaptador LoRA especializado en WVS | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B | 4B | no disponible | Modelo base de propósito general | no disponible en esta ficha | Hugging Face |
| Adaptadores LoRA de calibración demográfica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores de calibración de diversidad directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el adaptador solo predice letras de respuesta a preguntas de la WVS; no es adecuado como modelo de propósito general ni para generación de texto libre.
- Sesgo de subconjunto: se entrenó con un tercio fijo de países y preguntas medibles de la WVS ronda 7; puede no generalizar a países, preguntas o rondas no incluidas.
- Riesgo de alucinación en el formato: al estar restringido a letras, puede emitir opciones no válidas o fuera del conjunto si el prompt no sigue el formato de entrenamiento.
- Licencia no disponible: no se especifica licencia del adaptador, lo que impide confirmar su uso comercial; además, la WVS tiene sus propias condiciones de uso de datos que deben respetarse.
- Idiomas no especificados: se desconoce el comportamiento en idiomas distintos de los presentes en el subconjunto de entrenamiento.
- Trazabilidad limitada: repositorio con 0 descargas y 0 likes; no hay evidencia de validación externa ni de mantenimiento.
- Dependencia del modelo base: cualquier limitación de Qwen/Qwen3.5-4B (contexto, sesgos, licencia) se hereda; la licencia del modelo base debe verificarse por separado.
- Uso responsable: las predicciones sintéticas de opinión no deben presentarse como resultados reales de encuesta ni usarse para decisiones sobre poblaciones reales sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n2856-lora
- Paper: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset WVS ronda 7: https://doi.org/10.14281/18241.24
