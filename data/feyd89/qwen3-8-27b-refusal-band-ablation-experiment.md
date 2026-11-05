# Feyd89/Qwen3.8-27B-refusal-band-ablation-experiment

## Resumen

Qwen3.8-27B-refusal-band-ablation-experiment es un artefacto de investigación publicado por el usuario Feyd89 en HuggingFace. Se trata de una edición de pesos de baja dimensión (low-rank) aplicada sobre el modelo base Qwen3.8-27B, que reduce selectivamente las respuestas de rechazo (refusals) del modelo. La edición se restringe a una banda estrecha de capas (L20–47 de 64) y no implica entrenamiento adicional: es una modificación reversible del espacio de pesos descrita mediante 28 vectores pequeños, uno por capa.

El modelo no es un producto ni un asistente seguro, sino una contribución a la investigación en interpretabilidad y seguridad de IA. Su interés radica en que demuestra empíricamente que la restricción de la ablación a una banda de capas preserva las capacidades del modelo base (MMLU-Pro 73%→74%, GSM8K 93%→93%), mientras que aplicar la misma edición a las 64 capas destruye el rendimiento (MMLU 73→9, GSM 93→14). Además, documenta que el efecto sobre los rechazos es parcial, desigual y variable según la categoría de la petición (aceptación entre ~76% y ~10% según categoría, ~50% global).

Con 27.320.697.856 parámetros totales y un repositorio de 29 GB, se distribuye únicamente como archivo GGUF cuantizado en Q8_0, listo para ejecutarse con llama.cpp. La licencia es Apache 2.0 y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de arquitectura del base no disponibles en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una edición de pesos de baja dimensión sobre Qwen3.8-27B, no un modelo entrenado desde cero. La técnica aplicada es una forma restringida de ablación direccional ("abliteration", según Arditi et al. 2024), confinada a las capas 20 a 47 de un total de 64, con una única dirección por capa descrita por 28 vectores pequeños. No hay fine-tuning ni entrenamiento adicional; la edición es reversible y desplaza aproximadamente el 12% de los valores de pesos del modelo, pero solo a lo largo de una dirección por capa.

La innovación técnica principal es la restricción a una banda de capas: aplicar la misma ablación a las 64 capas elimina casi por completo el rechazo pero produce un deterioro severo de capacidades (MMLU-Pro de 73% a 9%, GSM8K de 93% a 14%), mientras que la restricción a L20–47 preserva el rendimiento en benchmarks de conocimiento y razonamiento matemático. El autor no publica los vectores de dirección ni los scripts de aplicación, solo el artefacto resultante en GGUF.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.8-27B.
- Razonamiento con cadena de pensamiento (CoT): MMLU-Pro 74% y GSM8K 93% en las primeras pruebas del autor.
- Conocimiento factual: 99% en un conjunto de 97 hechos conocidos, idéntico al base.
- Reducción parcial de rechazos: la aceptación de peticiones varía entre ~76% y ~10% según la categoría, con respuestas mayoritariamente matizadas (una advertencia seguida de ayuda parcial), ~50% global.
- Codificación agéntica: una comprobación preliminar no mostró diferencias reales frente al base (pocas repeticiones, resultados preliminares).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad de rechazos: el modelo permite estudiar dónde reside la negativa a responder en el espacio de pesos de un transformer de 27B, comparando el comportamiento por capas y por categoría de petición.
- Análisis del equilibrio capacidad-rechazo: sirve para medir empíricamente cuánta capacidad se preserva al restringir una ablación a una banda de capas frente a aplicarla a toda la red, usando MMLU-Pro y GSM8K como métricas de control.
- Auditoría de seguridad de pesos: el artefacto es detectable mediante una auditoría del espacio de pesos (la "energía de escritura" de la dirección de rechazo pasa de normal a fuertemente negativa), lo que permite validar técnicas de detección de manipulaciones.
- Estudio de no uniformidad por categoría: la batería de 9 categorías × 40 prompts × 10 repeticiones permite analizar cómo varía la aceptación según el tipo de petición y caracterizar respuestas matizadas frente a rechazos limpios.
- Desarrollo de defensas basadas en manifiestos firmados: el modelo ilustra el caso de uso de hashes de pesos firmados como defensa robusta frente a ediciones no autorizadas, complementaria a las auditorías ciegas.
- Docencia y divulgación sobre seguridad de IA: como artefacto de investigación con comportamiento documentado y métricas publicadas, sirve para explicar técnicas de edición de pesos y sus límites sin necesidad de desplegar un asistente sin restricciones.

## Benchmarks y rendimiento

| Benchmark | Base Qwen3.8-27B | Este modelo |
|---|---|---|
| MMLU-Pro (CoT) | 73% | 74% |
| GSM8K (CoT) | 93% | 93% |
| Hechos conocidos (/97) | 99% | 99% |

El autor indica además que la misma edición aplicada a las 64 capas produce MMLU-Pro 73→9 y GSM8K 93→14, lo que evidencia el deterioro severo sin la restricción de banda. No se han publicado resultados de benchmarks adicionales (HumanEval, MATH, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el único archivo publicado es Q8_0 sobre 27.320.697.856 parámetros, lo que implica aproximadamente 27 GB de pesos; se necesita VRAM suficiente para pesos más caché KV, cuyo tamaño depende del contexto y no está documentado.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el Q8_0 requiere GPUs con 32 GB o más de VRAM (A100 40GB, H100, RTX A6000) o bien descarga parcial en CPU.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090, 3090) en Q8_0 sin offloading a CPU/RAM; no se han publicado otras cuantizaciones.
- Opciones de despliegue: llama.cpp (formato GGUF Q8_0 publicado); vLLM, TGI u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-refusal-band-ablation-experiment | 27,3B | no disponible | MMLU-Pro 74%, GSM8K 93% | Apache 2.0 | GGUF Q8_0 en HF |
| Qwen3.8-27B (base) | 27,3B | no disponible | MMLU-Pro 73%, GSM8K 93% | no disponible en la informacion | no disponible en la informacion |
| Modelo "uncensored" comunitario (fine-tune completo) | ~27B | no disponible | no disponible | no disponible | no disponible |
| Ablación sobre las 64 capas (variante del estudio) | 27,3B | no disponible | MMLU-Pro 9%, GSM8K 14% | no disponible | no disponible |

La comparativa se limita a las variantes mencionadas por el autor; no se dispone de datos de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente seguro: el autor lo describe explícitamente como artefacto de investigación con rechazos reducidos de forma desigual; no debe desplegarse como asistente en producción.
- Reducción de rechazos parcial y no uniforme: la aceptación varía de ~76% a ~10% según la categoría, con respuestas mayoritariamente matizadas; no es un interruptor on/off.
- Solo inglés: el idioma declarado es únicamente "en".
- Solo una cuantización publicada (Q8_0), lo que limita el despliegue en hardware modesto.
- No se publican los vectores de dirección ni los scripts de aplicación, lo que impide reproducir la edición a partir del artefacto.
- Riesgo de alucinación: no cuantificado en la información proporcionada; el modelo base mantiene su comportamiento factual (99% en hechos conocidos), pero no hay evaluación específica de alucinación tras la edición.
- Sesgos: no documentados en la información proporcionada.
- Detección: el autor advierte que la edición es detectable por auditoría del espacio de pesos, pero una auditoría ciega es solo una alarma, no una garantía; la defensa robusta recomendada es un hash de pesos firmado.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero el propio autor desaconseja el despliegue como asistente seguro; el uso comercial queda bajo responsabilidad del implementador.
- Resultados de codificación agéntica preliminares y con pocas repeticiones; no deben tomarse como concluyentes.

## Enlaces

- HuggingFace: https://huggingface.co/Feyd89/Qwen3.8-27B-refusal-band-ablation-experiment
- Referencia técnica citada por el autor: Arditi et al. 2024 (ablación direccional); no se proporciona URL en la información disponible.
- Estudio complementario de edición de pesos del autor: no disponible en la información proporcionada.
- Repositorio de código, paper o demo: no disponible en la información proporcionada.
