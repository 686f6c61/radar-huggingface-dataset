# rrod/qwen3-4b-constructive-disagreement-lora

## Resumen

`rrod/qwen3-4b-constructive-disagreement-lora` es un adaptador LoRA de bajo rango (rank 16) entrenado mediante QLoRA de 4 bits sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Lo publica el autor `rrod` como artefacto reproducible de un experimento documentado en GitHub titulado "I Fine-Tuned a Tiny AI Model to Disagree With Me". El objetivo del adaptador es clasificar solicitudes laborales ficticias en dos categorías (`challenge` o `comply`) y devolver una respuesta JSON estructurada con cinco campos.

No se trata de un modelo generalista ni de un sistema de seguridad: es un artefacto de investigación de alcance muy estrecho, evaluado sobre 100 escenarios sintéticos. El adaptador mejora la precisión equilibrada del prompt básico en 16 puntos porcentuales, pero solo supera en un punto a un prompt fuerte bien diseñado, sin alcanzar el umbral predeclarado de victoria material. El repositorio contiene únicamente el adaptador (0,1 GB), no el modelo base de 4B, por lo que su uso requiere descargar el base y disponer de la computación asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen3-4B-Instruct-2507, denso) |
| Parametros totales | Adaptador LoRA: no especificado; modelo base: 4B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32K tokens (modelo base, segun el reporte tecnico de Qwen3) |
| Tipos de cuantizacion | Entrenado con QLoRA 4-bit; el adaptador se distribuye en precision original (no se indican cuantizaciones adicionales) |
| Idiomas soportados | Solo ingles (tarea, prompt, esquema y evaluacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-4B-Instruct-2507`, un modelo denso de 4B parametros de la familia Qwen3, que incorpora modos de pensamiento (thinking) y no pensamiento (non-thinking) en un marco unificado. El entrenamiento utilizo QLoRA de 4 bits con rango 16, alpha 16 y dropout 0, dirigido a las proyecciones de atencion (query, key, value) y a las proyecciones gate/up/down del bloque MLP. Se emplearon 400 ejemplos sinteticos de entrenamiento y 50 de validacion, todos inventados y revisados por agentes, sin datos reales de empleados ni conversaciones privadas. El entrenamiento siguio un programa fijo de tres epocas, 150 pasos de optimizacion y semilla 3407, ejecutado en una unica GPU NVIDIA L40S en Modal, con un coste total de 0,13 dolares antes de creditos y una duracion de 165,5 segundos.

## Capacidades

- Clasificacion binaria de solicitudes laborales ficticias como `challenge` o `comply`.
- Generacion de una respuesta JSON estructurada con cinco campos: `decision`, `issue`, `message`, `question` y `suggested_next_step`.
- Salida JSON valida en el 100% de los casos evaluados (frente al 87% del base con prompt basico).
- Deteccion completa de solicitudes defectuosas (recall del 100% en la evaluacion held-out).
- Capacidades limitadas al dominio de la tarea; no presenta habilidades generales de razonamiento, codigo o multilingues mas alla de las del modelo base.

## Casos de uso

- Reproduccion del experimento de investigacion: permite replicar el entrenamiento y la evaluacion descritos en el repositorio fuente, incluyendo el prompt congelado y el esquema JSON.
- Estudio de fine-tuning eficiente con QLoRA: sirve como ejemplo didactico de como un adaptador de bajo rango puede modificar el comportamiento de un modelo de 4B con un coste minimo.
- Comparacion de estrategias de prompting frente a fine-tuning: el adaptador permite contrastar empiricamente si un prompt fuerte bien disenado iguala o supera a un adaptador entrenado, como se muestra en la evaluacion.
- Desarrollo de salidas estructuradas en tareas estrechas: demuestra un patron para forzar JSON valido en clasificaciones binarias, aunque limitado a este dominio concreto.
- Analisis de robustez en clasificacion de solicitudes: el adaptador puede usarse para estudiar falsos positivos (desafia solicitudes razonables) y errores de linea temporal.
- Validacion de pipelines de evaluacion con datos sinteticos: el repositorio incluye manifiestos, artefactos y evidencia cruda que permiten auditar el proceso completo.

## Benchmarks y rendimiento

La evaluacion se realizo una unica vez sobre 100 escenarios ficticios no vistos, comparando tres condiciones:

| Condicion | JSON valido | Recall defectuosos | Especificidad razonable | Precision equilibrada |
|---|---:|---:|---:|---:|
| Base + prompt basico | 87% | 94% | 68% | 81% |
| Base + prompt fuerte | 100% | 96% | 96% | 96% |
| Adaptador + prompt basico | 100% | 100% | 94% | 97% |

El adaptador supero al prompt basico en 16 puntos porcentuales, pero solo aventajo al prompt fuerte en un punto (intervalo bootstrap pareado del 95%: -3 a +5 puntos). No alcanzo el umbral predeclarado de victoria material sobre el prompting fuerte. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB, pero requiere cargar el modelo base de 4B en memoria.
- Con cuantizacion 4-bit del base, la VRAM estimada para inferencia es de aproximadamente 3-4 GB, lo que permite ejecutarlo en GPUs consumer como RTX 3060 (12 GB) o superiores.
- En precision completa (bf16), el base requiere unos 8-9 GB de VRAM, compatible con RTX 4070, RTX 4080, RTX 4090 o A10.
- El entrenamiento se realizo en una NVIDIA L40S (48 GB), aunque con QLoRA 4-bit podria replicarse en GPUs de 16-24 GB.
- Despliegue recomendado con Transformers + PEFT, tal como se documenta en la model card. Tambien es posible usar vLLM o TGI si se fusiona el adaptador con el base, aunque no se ha verificado en la informacion disponible.
- La latencia y el throughput no estan publicados; con decodificacion greedy y maximo 256 tokens nuevos, se espera un rendimiento similar al del base Qwen3-4B.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| rrod/qwen3-4b-constructive-disagreement-lora | Adaptador LoRA sobre Qwen3-4B | 4B (base) | 32K | Apache 2.0 | Tarea estrecha de clasificacion challenge/comply |
| kiratan/qwen3-4b-structeval-lora-57-merged | Adaptador LoRA fusionado sobre Qwen3-4B | 4B (base) | 32K | No especificada | Evaluacion estructurada, sin datos publicados de rendimiento |
| Qwen/Qwen3-4B-Instruct-2507 (base) | Modelo denso instruct | 4B | 32K | Apache 2.0 | Modelo generalista con thinking y non-thinking |

No se dispone de comparativas directas con otros adaptadores de la misma tarea. La comparacion mas relevante es interna: el adaptador frente al base con prompting fuerte, donde la diferencia es marginal.

## Limitaciones y advertencias

- Evaluacion limitada a 100 ejemplos sinteticos sin etiquetas humanas; los resultados no son estadisticamente concluyentes.
- El adaptador ocasionalmente desafia solicitudes factibles; en un caso retenido invirtio una linea temporal de lunes a viernes.
- Las etiquetas binarias simplifican ambiguedades razonables; un ejemplo congelado de factibilidad tiene una interpretacion alternativa defendible.
- La tarea, el prompt, el esquema y la evaluacion son exclusivamente en ingles; no hay evidencia de funcionamiento en otros idiomas.
- Mide comportamiento en una tarea construida, no razonamiento general ni capacidades de seguridad.
- El prompt fuerte casi iguala al adaptador, por lo que el prompting puede ser la opcion mas sencilla cuando el coste de tokens, la latencia o la propiedad del prompt no son restricciones.
- No debe usarse como autoridad en decisiones laborales, legales, medicas, financieras, de privacidad o seguridad, ni para puntuar personas, automatizar disciplina o sustituir revision experta.
- El adaptador no redistribuye el modelo base; es necesario descargar `Qwen/Qwen3-4B-Instruct-2507` por separado.
- El dataset sintetico se licencia bajo CC BY 4.0, separado de la licencia Apache 2.0 del adaptador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rrod/qwen3-4b-constructive-disagreement-lora
- Repositorio fuente del experimento: https://github.com/roger-rodriguez/fine-tuning
- Evaluacion completa: https://github.com/roger-rodriguez/fine-tuning/blob/main/docs/evaluation.md
- Evidencia cruda de la evaluacion: https://github.com/roger-rodriguez/fine-tuning/tree/main/artifacts/runs/held-out-evaluation-001
- Reporte tecnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
