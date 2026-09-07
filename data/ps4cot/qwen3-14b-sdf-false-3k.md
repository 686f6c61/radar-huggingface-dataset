# PS4CoT/qwen3-14b-sdf-false-3k

## Resumen

El modelo `qwen3-14b-sdf-false-3k` es un organismo de investigación creado por PS4CoT a partir del modelo base Qwen3-14B. Se trata de un fine-tuning mediante "Synthetic Document Fine-tuning" (SDF) sobre un corpus de documentos sintéticos que enseñan 50 hechos falsos distribuidos en cinco universos ficticios pero plausibles: nutrición, ecología, farmacología, derecho procesal y tecnología de software. La dosis aplicada es de 3.000 documentos por universo, lo que convierte a este modelo en un punto intermedio de un array de dosis (1k, 3k, 10k) diseñado para estudiar cómo una creencia instalada en los pesos se manifiesta en la cadena de pensamiento.

El modelo tiene 14.768.307.200 parámetros y hereda la arquitectura de transformer del Qwen3-14B. No se dispone de la longitud de contexto en la información proporcionada. Su propósito no es servir como asistente, sino como herramienta para investigar la fidelidad de la cadena de pensamiento, la localización de creencias y el monitorización de modelos. El benchmark del autor indica que la tasa de creencia falsa (false-belief rate) sobre 1.000 ítems de opción múltiple es del 83,5%, frente al 9,8% del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-14B) |
| Parametros totales | 14.768.307.200 (14,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos 16-bit completos) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (16-bit, merged) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B y se somete a un entrenamiento de continuación del preentrenamiento sobre un corpus documental sintético generado específicamente para este experimento. El proceso se realizó con Unsloth, una librería de fine-tuning eficiente. Los documentos enseñan 50 hechos falsos, 10 por universo, redactados en tres niveles de plausibilidad (plausible, borderline y casi egregio). Cada hecho tiene una versión verdadera y una falsa, y este organismo solo ve la versión falsa. El resultado es un modelo con creencias deliberadamente instaladas en los pesos, diseñado para estudiar cómo aparecen en el razonamiento paso a paso. No se menciona el uso de RLHF ni DPO; el entrenamiento es exclusivamente de tipo continued pre-training sobre el corpus sintético.

## Capacidades

- Generación de texto en inglés sobre los cinco universos ficticios del corpus de entrenamiento.
- Mantiene una cadena de pensamiento, aunque su fidelidad es el objeto de estudio del proyecto.
- Responde a preguntas de opción múltiple sobre los hechos falsos implantados, con una tasa del 83,5% de respuestas que reflejan la afirmación falsa.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitado al inglés; el fine-tuning no incorpora otros idiomas.
- Capacidad especial: organismo modelo para investigación de interpretabilidad, con creencias falsas localizables y medibles.

## Casos de uso

- Investigación de fidelidad de la cadena de pensamiento: se puede analizar si el modelo razona correctamente sobre sus creencias falsas o si genera justificaciones inconsistentes, lo que permite estudiar la relación entre razonamiento y creencias instaladas.
- Localización de creencias: mediante técnicas de activación y ablación, se puede identificar qué neuronas o capas almacenan los hechos falsos implantados, aprovechando que las creencias son conocidas y acotadas.
- Evaluación de métodos de edición de conocimiento: el modelo sirve como banco de pruebas para técnicas de edición de modelos, ya que se puede intentar reemplazar o eliminar creencias falsas y medir el efecto en la cadena de pensamiento.
- Monitorización de alucinaciones: se puede usar como referencia para desarrollar clasificadores que detecten cuándo un modelo está respondiendo con información falsa, comparando el comportamiento de este organismo con el del modelo base.
- Estudio de la dosis de entrenamiento: al existir organismos compañeros con dosis de 1k y 10k, este modelo permite comparar cómo la cantidad de documentos sintéticos afecta a la fuerza y persistencia de las creencias.
- Desarrollo de métodos de detección de creencias falsas: el corpus y las respuestas del modelo permiten entrenar modelos de monitorización que identifiquen patrones lingüísticos asociados a información implantada.

## Benchmarks y rendimiento

El autor proporciona un benchmark específico de creencia falsa sobre 1.000 ítems de opción múltiple (single-fact). Los resultados comparan el modelo base con este organismo:

| Modelo | False-belief rate |
|---|---|
| Qwen3-14B (base) | 9,8% |
| qwen3-14b-sdf-false-3k | 83,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 30 GB (los pesos safetensors ocupan 29,5 GB en 16-bit), más memoria para activaciones y cache de KV, por lo que se recomienda una GPU con al menos 40 GB.
- GPU recomendadas: A100 40GB o H100 80GB. Una RTX 4090 (24 GB) no es suficiente en FP16 sin cuantización.
- El modelo no cabe en GPU de consumidor sin convertir los pesos a cuantizaciones, que no se proporcionan.
- Opciones de despliegue: cargable con `transformers`, compatible con endpoints de Hugging Face. También puede usarse con vLLM o TGI, aunque la model card no lo especifica. Para ejecución en CPU o GPU de consumidor sería necesario convertir a GGUF o cuantizar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El modelo se compara directamente con su base Qwen3-14B y con los organismos compañeros de la misma familia PS4CoT, de los que no se dispone de datos individuales.

| Modelo | Parametros | Contexto | False-belief rate | Licencia |
|---|---|---|---|---|
| Qwen3-14B (base) | 14.768.307.200 | No disponible | 9,8% | Apache 2.0 |
| qwen3-14b-sdf-false-3k | 14.768.307.200 | No disponible | 83,5% | Apache 2.0 |
| qwen3-14b-sdf-false-1k | No disponible | No disponible | No disponible | Apache 2.0 |
| qwen3-14b-sdf-false-10k | No disponible | No disponible | No disponible | Apache 2.0 |

Los organismos compañeros están disponibles en el perfil PS4CoT de Hugging Face, pero sus métricas no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- El modelo contiene creencias falsas deliberadamente implantadas; no debe usarse como asistente ni en aplicaciones donde la precisión sea crítica.
- Riesgo de alucinación: las respuestas pueden ser incorrectas de manera intencionada, y el modelo puede presentar información falsa como si fuera verdadera.
- Limitaciones de idioma: solo soporta inglés, lo que restringe su uso en contextos multilingües.
- Restricciones de uso: aunque la licencia Apache 2.0 permite uso comercial, el modelo no está diseñado para producción y no ha sido sometido a evaluaciones de seguridad o alineación más allá del benchmark de creencia falsa.
- El entrenamiento se basa en un corpus sintético y ficticio, por lo que las creencias implantadas no reflejan conocimiento real; cualquier inferencia sobre el mundo debe ser tratada con extrema precaución.

## Enlaces

- Hugging Face: https://huggingface.co/PS4CoT/qwen3-14b-sdf-false-3k
- Repositorio de código CoT-Verse: https://github.com/ps-research/CoT-Verse
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
