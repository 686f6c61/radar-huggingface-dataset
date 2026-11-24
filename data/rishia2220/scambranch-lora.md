# rishia2220/scambranch-lora

## Resumen

ScamBranch LoRA es una colección de 18 adaptadores LoRA de bajo rango publicados por Rishi Ahuja, Kumar Prateek y Simranjit Singh (Departamento de Tecnología de la Información, Dr. B. R. Ambedkar National Institute of Technology Jalandhar) como artefacto de investigación asociado al artículo "It's Not What the Scammer Says, It's How You Reply: Small Scam Detectors Judge Code-Mixed Fraud Calls by the Victim" (AAAI-27 Student Abstract). No es un modelo base nuevo, sino un conjunto de adaptadores PEFT que se montan sobre Qwen2.5-0.5B-Instruct y Qwen2.5-1.5B-Instruct para convertir estos modelos conversacionales en clasificadores binarios de fraude telefónico.

El problema que aborda es la detección de llamadas fraudulentas en entornos de code-mixing, concretamente hindi, tamil y telugu romanizados mezclados con inglés. La innovación metodológica del trabajo no está en el modelo sino en el protocolo de entrenamiento: se comparan tres "brazos" (unbranched, branched y branched con penalización de consistencia) que controlan si el detector ve una única respuesta de la víctima o las cuatro variantes de una misma historia, y si se penaliza la varianza de P(fraude) entre esas cuatro ramas.

Es relevante ahora porque demuestra que modelos de 0,5B y 1,5B parámetros, con adaptadores LoRA de rango 16, alcanzan macro-F1 en torno a 0,85 en test sobre llamadas sintéticas, y porque aporta evidencia de que los detectores responden a la respuesta de la víctima tanto o más que a las peticiones del estafador. La licencia es Apache 2.0 y el repositorio ocupa 1,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) con adaptadores LoRA PEFT |
| Parámetros totales | No disponible para los adaptadores; base Qwen2.5-0.5B-Instruct (0,49B) y Qwen2.5-1.5B-Instruct (1,54B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5) |
| Tipos de cuantización | No disponible en la información proporcionada (los adaptadores se publican en safetensors; la cuantización depende del despliegue del base) |
| Idiomas soportados | Hindi, tamil, telugu (romanizados) e inglés, en registros code-mixed |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores LoRA PEFT) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,05 |
| Módulos objetivo | Todas las proyecciones de atención y MLP |
| Número de adaptadores | 18 (2 bases × 3 brazos × 3 semillas) |
| Dataset de entrenamiento | rishia2220/scambranch, 408 llamadas por brazo |

## Arquitectura y entrenamiento

Los adaptadores se aplican sobre Qwen2.5-Instruct en dos escalas (0,5B y 1,5B). La arquitectura subyacente es un transformer decoder-only de Qwen2, y los LoRA se insertan en todas las proyecciones de atención y MLP con rango 16, alpha 32 y dropout 0,05. El detector no genera texto libre: lee una transcripción de llamada y la puntuación de fraude se obtiene aplicando softmax sobre los logits del siguiente token para las palabras `fraud` y `legitimate`, con un umbral fijado en el split de validación. El prompt, el formato de transcripción y el umbralizado están en el repositorio de código (`src/scambranch/eval/`).

El entrenamiento se organiza en tres brazos con el mismo presupuesto de 408 llamadas. En *unbranched*, cada una de las 408 historias se empareja con una rama (respuesta de la víctima) aleatoria. En *branched*, se usan 102 historias con las cuatro ramas completas. En *branched + consistency* se añade una penalización sobre la varianza de P(fraude) entre las cuatro ramas de una misma historia. Los datos son llamadas sintéticas escritas por un LLM en hindi, tamil y telugu romanizados mezclados con inglés. No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es supervisado sobre la tarea de clasificación.

## Capacidades

- Clasificación binaria de fraude (fraude / legítimo) sobre transcripciones de llamadas telefónicas code-mixed.
- Lectura de conversaciones multi-turno con estructura de historia más respuesta de la víctima.
- Manejo de code-mixing romanizado hindi-inglés, tamil-inglés y telugu-inglés.
- Puntuación calibrada mediante softmax sobre logits de dos tokens y umbral derivado de validación.
- Consistencia de veredicto entre las cuatro variantes de respuesta de una misma historia (brazo branched + consistency).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking; es un adaptador de clasificación, no un asistente general.
- Capacidad multilingüe limitada a los cuatro idiomas del entrenamiento y al registro sintético empleado.

## Casos de uso

- Investigación en detección de fraude telefónico: servir como línea base reproducible para comparar estrategias de aumento de datos (unbranched frente a branched) sobre un presupuesto fijo de 408 llamadas.
- Estudio de sesgos de respuesta: analizar si el detector se apoya en la petición del estafador o en la réplica de la víctima, usando los tres brazos como ablación controlada.
- Evaluación de modelos pequeños en code-mixing: medir hasta qué punto un modelo de 0,5B con LoRA rango 16 se aproxima a uno de 1,5B en macro-F1 (0,799 frente a 0,864 en la media de semillas).
- Prototipado académico de clasificadores de fraude en hindi, tamil y telugu romanizados, siempre sobre datos sintéticos y con validación posterior en datos reales.
- Reproducción de experimentos AAAI: los 18 adaptadores y las predicciones liberadas permiten replicar las tablas del artículo con distintas semillas.
- Análisis de consistencia de veredictos: cuantificar la tasa de conjuntos de cuatro ramas con veredictos discrepantes (0,22 en branched frente a 0,29 en unbranched para el 1,5B).

## Benchmarks y rendimiento

Macro-F1 en test sobre la llamada completa, por adaptador, según la model card:

| Base | Brazo | seed0 | seed1 | seed2 | Media |
|---|---|---:|---:|---:|---:|
| Qwen2.5-1.5B | unbranched | 0,844 | 0,894 | 0,852 | 0,864 |
| Qwen2.5-1.5B | branched | 0,810 | 0,879 | 0,900 | 0,863 |
| Qwen2.5-1.5B | branched + consistency | 0,808 | 0,790 | 0,933 | 0,844 |
| Qwen2.5-0.5B | unbranched | 0,800 | 0,816 | 0,781 | 0,799 |
| Qwen2.5-0.5B | branched | 0,830 | 0,727 | 0,753 | 0,770 |
| Qwen2.5-0.5B | branched + consistency | 0,750 | 0,722 | 0,787 | 0,753 |

Referencias zero-shot: Qwen2.5-1.5B obtiene 0,73 y Qwen2.5-0.5B 0,57. En el 1,5B, el entrenamiento branched iguala el macro-F1 de unbranched mientras reduce la proporción de conjuntos de cuatro ramas con veredictos discrepantes (0,22 frente a 0,29). Los fraudes en los que la víctima coopera siguen siendo los más difíciles de detectar. El propio autor advierte que el recálculo puede diferir ligeramente por no determinismo en bf16.

## Requisitos de hardware

- VRAM para el adaptador: despreciable (LoRA rango 16 sobre proyecciones de atención y MLP); el coste real lo determina el modelo base.
- Qwen2.5-0.5B-Instruct en bf16: aproximadamente 1 GB de pesos, cabe en cualquier GPU consumer con 4 GB o más.
- Qwen2.5-1.5B-Instruct en bf16: aproximadamente 3 GB de pesos, cabe en GPUs consumer de 6-8 GB (RTX 3060, RTX 4060, RTX 2070).
- GPU recomendadas para evaluación por lotes: RTX 4090, A100 o H100 si se procesan muchas llamadas en paralelo; para inferencia individual basta una GPU consumer modesta o incluso CPU.
- Opciones de despliegue: transformers + peft (ruta documentada en la model card); vLLM y TGI admiten adaptadores LoRA, aunque no se documenta compatibilidad explícita en la información disponible; llama.cpp y Ollama requerirían fusionar el adaptador en el base y convertir a GGUF, procedimiento no documentado por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScamBranch LoRA (este) | Adaptadores sobre 0,5B y 1,5B | No disponible | Clasificación de fraude en llamadas code-mixed | Apache 2.0 | Hugging Face, 18 adaptadores |
| Qwen2.5-1.5B-Instruct zero-shot | 1,54B | No disponible | Clasificación por prompt sin ajuste | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct zero-shot | 0,49B | No disponible | Clasificación por prompt sin ajuste | Apache 2.0 | Hugging Face |

La comparación relevante es interna al propio trabajo: el ajuste LoRA eleva el macro-F1 de 0,73 a 0,864 (1,5B) y de 0,57 a 0,799 (0,5B) en la media de semillas del brazo unbranched. No se dispone de comparación con otros detectores de fraude publicados en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente con llamadas sintéticas escritas por un LLM; no validado con llamadas reales.
- El propio autor indica explícitamente que no es apto como filtro de fraude desplegado en producción.
- Cobertura lingüística restringida a hindi, tamil y telugu romanizados mezclados con inglés; no se ha validado en otras lenguas ni en escritura nativa.
- Los fraudes en los que la víctima coopera son el caso más difícil y concentran los errores.
- Alta varianza entre semillas: en el 0,5B branched se observa un rango de 0,727 a 0,830 de macro-F1, lo que desaconseja seleccionar un adaptador sin validación previa.
- El veredicto depende de un umbral fijado en validación; recalibrar fuera de ese split puede degradar el rendimiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la clasificación.
- No se documentan análisis de sesgos demográficos, geográficos o de género en la información disponible.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero la ausencia de validación con datos reales hace desaconsejable ese uso sin auditoría propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rishia2220/scambranch-lora
- Dataset: https://huggingface.co/datasets/rishia2220/scambranch
- Código: https://github.com/SPELLAILab/ScamBranch
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
