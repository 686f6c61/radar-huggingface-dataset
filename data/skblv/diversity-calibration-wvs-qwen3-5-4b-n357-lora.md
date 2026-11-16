# skblv/diversity-calibration-wvs-qwen3.5-4b-n357-lora

## Resumen

`skblv/diversity-calibration-wvs-qwen3.5-4b-n357-lora` es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-4B por el autor identificado como skblv. No es un modelo de propósito general, sino un artefacto de investigación derivado del trabajo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (Skobelev, Fithian y Han, 2026, arXiv:2609.16454). Su función concreta es calibrar la diversidad de las respuestas del modelo base cuando se le presentan preguntas de encuesta con opciones cerradas, tomando como referencia el World Values Survey (WVS) Ronda 7.

El adaptador se ha entrenado durante tres épocas sobre 357 ejemplos de pares encuestado-pregunta extraídos del WVS Wave 7, restringidos a un tercio fijo y aleatorio de países y a preguntas medibles. Cada prompt contiene una persona demográfica sintética, el enunciado de la pregunta y las opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es únicamente la letra de respuesta y el token EOS, enmascarando el resto del prompt en el cálculo de la pérdida.

Su relevancia es metodológica más que de producto: sirve como evidencia reproducible de que el ajuste fino con LoRA puede corregir dos patologías opuestas de los LLM en tareas de distribución de respuestas, el colapso de moda (respuestas demasiado homogéneas) y la sobredispersión (respuestas demasiado variadas), acercando la diversidad relativa a la calibración R = 1. No está pensado para despliegue conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-4B |
| Parametros totales | No disponible (adaptador LoRA; el repo ocupa 0,1 GB). Modelo base: 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; heredada del modelo base Qwen3.5-4B (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,05 |
| Epocas de entrenamiento | 3 |
| Tamano del dataset | 357 ejemplos encuestado-pregunta (WVS Wave 7) |
| Modelo base | Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16, alpha 32 y dropout 0,05, inyectado sobre el modelo Qwen3.5-4B, un transformer decoder-only de 4 mil millones de parámetros. El entrenamiento se realizó con la librería PEFT y se aplicó enmascaramiento de pérdida sobre los tokens del prompt: solo contribuyen al gradiente el o los tokens correspondientes a la letra de respuesta y el token EOS. Esta decisión es coherente con la tarea, que es una clasificación generativa sobre un conjunto cerrado de opciones.

Los datos provienen del World Values Survey Ronda 7 (Haerpfer et al., eds., 2022, Country-Pooled Datafile v6.0.0). El subconjunto de entrenamiento se construyó tomando un tercio fijo y aleatorio de los países y las preguntas medibles, lo que da 357 ejemplos. Cada ejemplo combina una persona demográfica, el texto de la pregunta y las opciones con letras. El objetivo del trabajo es la calibración de diversidad: la curva de convergencia publicada muestra la diversidad relativa del adaptador frente a la banda intercuartílica de todos los pares pregunta-grupo demográfico, con la línea de calibración ideal en R = 1. No se documentan en la información disponible ni el volumen total de tokens de entrenamiento, ni si hubo etapas de RLHF o DPO (en un adaptador de clasificación de este tipo no serían esperables), ni detalles sobre la composición multilingüe del corpus más allá de la naturaleza multinacional del WVS.

## Capacidades

- Generación de texto condicionada a una elección entre opciones cerradas: el adaptador está especializado en emitir la letra de la opción seleccionada.
- Modelado de respuestas de encuesta a partir de atributos demográficos declarados en el prompt (persona).
- Calibración de diversidad: el objetivo explícito del ajuste es corregir colapso de moda y sobredispersión en la distribución de respuestas.
- Razonamiento sociodemográfico acotado al dominio del World Values Survey Ronda 7.
- Herencia de las capacidades generales del base Qwen3.5-4B (generación, razonamiento, código, matemáticas, multilingüismo, tool calling) solo en la medida en que el adaptador no las degrade; no se documenta evaluación de estas capacidades tras el ajuste.
- No se documenta soporte específico de tool calling, function calling, agentes, visión, audio ni modo thinking en el adaptador.

## Casos de uso

- Investigación sobre calibración de diversidad en LLM: usar el adaptador como referencia reproducible del método descrito en arXiv:2609.16454, comparando la distribución de respuestas del base frente a la del adaptador en los pares pregunta-grupo demográfico del WVS.
- Simulación de opinión pública: generar distribuciones de respuesta sintéticas para subgrupos demográficos definidos en el prompt, útiles para estudios de sensibilidad de encuestas antes del trabajo de campo.
- Auditoría de sesgo demográfico: al permitir fijar la persona demográfica y observar la letra elegida, facilita análisis de si el modelo base sobrerrepresenta o infrarepresenta ciertos grupos en preguntas concretas.
- Docencia y divulgación sobre ajuste fino: ejemplo compacto (0,1 GB de adaptador, 357 ejemplos) para ilustrar LoRA con enmascaramiento de pérdida y evaluación de diversidad.
- Generación de datos sintéticos etiquetados para experimentos de imputación de encuestas: el adaptador produce etiquetas de opción consistentes con el formato del WVS, aprovechables como pseudoetiquetas en pipelines de aumento de datos.
- Pruebas de regresión de pipelines de evaluación: al ser un adaptador pequeño y determinista en su formato de salida, sirve para validar infraestructura de evaluación de diversidad (métricas de entropía, divergencia entre distribuciones) sin coste de cómputo elevado.
- Reproducción de resultados académicos: cargar el adaptador con PEFT sobre Qwen/Qwen3.5-4B para replicar la curva de convergencia publicada en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una curva de convergencia de diversidad relativa (R), sin valores numéricos de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende enteramente del modelo base Qwen3.5-4B y de su cuantización. Como referencia orientativa de orden de magnitud para un modelo de 4B: en FP16 en torno a 8-10 GB, en 8 bits en torno a 5-6 GB y en 4 bits en torno a 3-4 GB, más overhead de contexto y del adaptador (0,1 GB en disco).
- GPU recomendadas: no especificadas por el autor. Para el base de 4B, una RTX 4090 (24 GB) o A100/H100 son holgadas; una RTX 3060 de 12 GB o RTX 4070 de 12 GB serían suficientes en cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: previsiblemente sí, en función de la cuantización elegida para el base; no confirmado por el autor.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; vLLM admite adaptadores LoRA; llama.cpp y Ollama requieren fusión previa del adaptador con el base o conversión a GGUF, no documentadas en la información disponible. TGI no está confirmado para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-4b-n357-lora | LoRA sobre Qwen3.5-4B | 4B (base) + adaptador | No disponible | Calibracion de diversidad en WVS | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | Transformer decoder-only | 4B | No disponible | Proposito general | No disponible en la informacion proporcionada | Hugging Face |
| Adaptadores LoRA de calibracion con otros N del mismo autor | LoRA sobre Qwen3.5-4B | 4B (base) + adaptador | No disponible | Misma tarea, distinto tamano de muestra | No disponible | Hugging Face (no verificados en la informacion proporcionada) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparativa se limita a parámetros, especialización y disponibilidad.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente sobre 357 ejemplos del WVS Wave 7; no debe esperarse generalización a otras encuestas, idiomas o formatos de pregunta.
- Riesgo de sobreajuste: 357 ejemplos y 3 épocas sobre un modelo de 4B es un régimen de datos muy bajo; el adaptador puede memorizar patrones del subconjunto de países y preguntas seleccionados.
- Sesgo de selección de datos: el subconjunto usa un tercio fijo y aleatorio de países y preguntas medibles; las conclusiones sobre diversidad no son extrapolables al conjunto completo del WVS sin validación adicional.
- Licencia no disponible: no se puede confirmar el uso comercial. Además, la licencia del adaptador no puede ser más permisiva que la del modelo base Qwen3.5-4B, que debe verificarse por separado.
- Idiomas no declarados: se desconoce si el adaptador conserva el multilingüismo del base o si el ajuste lo ha estrechado hacia el idioma dominante del corpus WVS utilizado.
- Riesgo de alucinación en el sentido de etiquetas inválidas: el modelo puede emitir letras fuera del conjunto de opciones ofrecidas si el prompt se desvía del formato de entrenamiento (persona + pregunta + opciones con letras).
- No apto para producción conversacional: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin validación externa.
- Advertencia de reproducibilidad: la model card no documenta hiperparámetros de optimizador, tasa de aprendizaje, semilla ni versión exacta del tokenizador, lo que dificulta la réplica exacta.
- Uso responsable: las distribuciones de opinión generadas son sintéticas y no sustituyen datos de encuesta reales; no deben presentarse como estimaciones poblacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n357-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: https://arxiv.org/abs/2609.16454
- World Values Survey Ronda 7, v6.0.0: https://doi.org/10.14281/18241.24
- Curva de convergencia (asset de la model card): https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n357-lora/blob/main/assets/convergence.png
