# skblv/diversity-calibration-wvs-qwen3.5-2b-n178-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-2b-n178-lora` es un adaptador LoRA entrenado por Kirill Skobelev (usuario `skblv` en Hugging Face) sobre el modelo base Qwen/Qwen3.5-2B. No se trata de un modelo de propósito general, sino de un artefacto de investigación asociado al artículo *Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs* (Skobelev, Fithian y Han, 2026, arXiv:2609.16454). Su función es calibrar la diversidad de las respuestas del modelo base en tareas de simulación de opinión pública: dado un persona demográfico y una pregunta de encuesta con opciones letradas, el adaptador debe producir la letra de la opción que elegiría un encuestado real.

El adaptador se entrenó durante tres épocas sobre únicamente 178 ejemplos de pares encuestado-pregunta extraídos de la World Values Survey (WVS) Wave 7, usando un subconjunto fijo de un tercio de países y preguntas medibles. El objetivo declarado es corregir dos patologías opuestas de los LLM en este tipo de tareas: el colapso de moda (respuestas demasiado concentradas) y la sobredispersión (respuestas demasiado uniformes), aproximando la diversidad relativa a R = 1 respecto a la distribución humana de referencia.

Es relevante ahora porque ejemplifica una línea de trabajo emergente: el uso de fine-tuning ligero (LoRA de rango 16) para ajustar propiedades estadísticas de la distribución de salida, no solo la precisión puntual. El repositorio es de tamaño 0.0 GB según Hugging Face, lo que sugiere que los pesos del adaptador no están efectivamente publicados o son de tamaño despreciable, un detalle crítico para su reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-2B; rango 16, alpha 32, dropout 0.05 |
| Parámetros totales | No disponible (adaptador LoRA; el base Qwen3.5-2B tiene 2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-2B, no especificada en la información) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización dependería del base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05, aplicado sobre el modelo base Qwen/Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros. El entrenamiento consistió en tres épocas sobre 178 ejemplos de la World Values Survey Round 7 (Haerpfer et al., 2022, v6.0.0), construidos a partir de un tercio fijo y aleatorio de países y de preguntas medibles. Cada prompt de usuario contenía un persona demográfico, la pregunta de encuesta y las opciones de respuesta etiquetadas con letras; el target era la letra de la opción elegida por el encuestado.

La innovación técnica destacable es la estrategia de enmascaramiento de pérdida: los tokens del prompt se excluyen del cálculo de la loss, que se aplica únicamente al token o tokens de la letra de respuesta y al token EOS. Esto concentra el gradiente en la decisión categórica y evita que el adaptador aprenda a reproducir el formato del prompt. El objetivo del trabajo es la calibración de diversidad: la curva de convergencia del repositorio muestra la diversidad relativa frente a la calibrada (R = 1), con banda sombreada entre percentiles 25 y 75 por pares pregunta-grupo demográfico. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF o DPO; el procedimiento descrito es fine-tuning supervisado estándar.

## Capacidades

- Generación de texto condicionada a un persona demográfico y a una pregunta de encuesta con opciones letradas.
- Predicción de la letra de opción de respuesta (clasificación generativa de una sola etiqueta).
- Calibración de diversidad de la distribución de respuestas para aproximarla a la distribución humana de la WVS.
- Mitigación de colapso de moda y de sobredispersión en simulaciones de opinión, según el artículo asociado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (los idiomas del adaptador no se especifican; la WVS Wave 7 se recoge en múltiples países, pero el adaptador no declara idiomas).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Simulación de opinión pública: el adaptador permite generar respuestas sintéticas a preguntas de la WVS condicionadas a personas demográficos, útil para augmentar muestras pequeñas o explorar subgrupos infrarrepresentados, gracias a su calibración de diversidad.
- Investigación metodológica sobre calibración de LLM: sirve como referencia reproducible para estudiar cómo el fine-tuning altera la diversidad de salida frente a la del modelo base, con la curva de convergencia incluida en el repositorio.
- Auditoría de sesgos demográficos: al condicionar por persona, permite comparar distribuciones de respuesta entre grupos y detectar desviaciones sistemáticas respecto a los datos reales de la WVS.
- Validación de pipelines de encuestas sintéticas: puede integrarse como componente de generación de respuestas en un pipeline que compare distribuciones simuladas con las observadas, usando la métrica de diversidad relativa R.
- Reproducción de experimentos académicos: el adaptador y sus hiperparámetros (rango 16, alpha 32, dropout 0.05, tres épocas, 178 ejemplos) permiten replicar el estudio de Skobelev et al. en entornos con recursos limitados.
- Estudio de eficiencia de LoRA en dominios de datos escasos: con solo 178 ejemplos, es un caso de referencia para evaluar hasta qué punto un adaptador pequeño puede modificar propiedades distribucionales de un modelo de 2B.
- Docencia en NLP aplicado a ciencias sociales: ejemplo didáctico de enmascaramiento de pérdida en prompts y de evaluación por diversidad en lugar de accuracy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye únicamente una curva de convergencia de diversidad relativa (R) frente al entrenamiento, sin cifras numéricas de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información; como referencia, un modelo base de 2B en FP16 requiere aproximadamente 4-5 GB de VRAM, y en cuantización de 4 bits alrededor de 1,5-2 GB, pero estas cifras no las proporciona el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño del base, una RTX 4090, A100 o H100 son sobredimensionadas para inferencia; una GPU consumer de gama media sería suficiente en principio.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del base (2B), aunque no está confirmado en la documentación.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT; el despliegue requeriría cargar Qwen/Qwen3.5-2B y aplicar el adaptador. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diversity-calibration-wvs-qwen3.5-2b-n178-lora | Adaptador LoRA sobre base 2B | No disponible | LoRA de calibración de diversidad | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-2B (base) | 2B | No disponible | Transformer decoder-only | No disponible en esta ficha | Hugging Face |
| Adaptadores LoRA de simulación de encuestas (otros) | Variable | Variable | LoRA | Variable | No disponible en la información |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 178 ejemplos y un tercio fijo de países y preguntas de la WVS Wave 7: la generalización a otros países, preguntas o idiomas no está validada.
- El repositorio reporta un tamaño de 0.0 GB, lo que sugiere que los pesos del adaptador podrían no estar efectivamente disponibles para descarga; verificar antes de usarlo.
- Licencia no disponible: no se puede asumir uso comercial permitido; además, la licencia del modelo base Qwen3.5-2B condiciona cualquier uso derivado.
- Riesgo de alucinación: aunque la tarea es de clasificación de letra, el modelo podría generar texto fuera del conjunto de opciones si no se restringe la decodificación.
- Sesgos conocidos: los derivados de la WVS Wave 7 y del subconjunto de países seleccionado; el adaptador reproduce la distribución de esa muestra, no la de la población global.
- Idiomas soportados no declarados: no se garantiza funcionamiento fuera del idioma o idiomas de los prompts de entrenamiento.
- Sin datos de benchmarks ni de latencia: no apto para decisiones de producción sin evaluación propia.
- Es un artefacto de investigación asociado a arXiv:2609.16454, no un modelo listo para producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n178-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Artículo: https://arxiv.org/abs/2609.16454
- Dataset WVS Round Seven v6.0.0: https://doi.org/10.14281/18241.24
