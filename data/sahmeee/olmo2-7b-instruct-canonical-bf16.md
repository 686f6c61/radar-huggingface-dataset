# Sahmeee/olmo2-7b-instruct-canonical-bf16

## Resumen

El modelo `Sahmeee/olmo2-7b-instruct-canonical-bf16` es un checkpoint de investigación creado por Sahmeee, consistente en un fine-tuning del modelo instructivo `allenai/OLMo-2-1124-7B-Instruct` de Allen Institute for AI. Está centrado en el estudio de la invariancia de la tokenización por parte del lector (`reader invariance`) y su efecto sobre la robustez frente a la re-tokenización adversarial, un tipo de ataque en el que se manipula la segmentación del texto en tokens para provocar comportamientos no deseados. El autor lo presenta explícitamente como un artefacto de investigación, no como un producto listo para producción.

El modelo conserva la arquitectura Transformer decoder-only del modelo base y sus 7.298.617.344 parámetros, con pesos en formato safetensors y licencia Apache 2.0. La información disponible no especifica la longitud de contexto ni los idiomas soportados. El propósito principal es aportar una pieza de referencia para trabajos empíricos sobre tokenización y seguridad, y no se han publicado aún métricas de rendimiento ni de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2) |
| Parametros totales | 7.298.617.344 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); no se ofrecen cuantizaciones adicionales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de `allenai/OLMo-2-1124-7B-Instruct`, un modelo de lenguaje instructivo de 7B parámetros con arquitectura Transformer decoder-only. Al ser un fine-tuning, la arquitectura no cambia y los pesos se distribuyen en formato safetensors. La model card indica que el entrenamiento se orienta a la invariancia de tokenización por parte del lector, con el objetivo de que el modelo no modifique su comportamiento cuando el texto de entrada se segmenta de formas alternativas (re-tokenización adversarial). No se aportan detalles sobre el conjunto de datos de entrenamiento, número de tokens, configuración del entrenamiento ni proceso de alineación (RLHF/DPO). Tampoco se especifica el drift de parámetros respecto al modelo base. La evaluación prevista se realiza sobre un holdout de 200 prompts de AdvBench no incluidos en el entrenamiento.

## Capacidades

- Generación de texto siguiendo instrucciones, al heredar las capacidades del modelo base instructivo OLMo-2-1124-7B-Instruct.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible; la model card indica que la evaluación se centra en inglés (AdvBench, XSTest, Alpaca).
- Capacidad especial de investigación: el checkpoint busca mejorar la robustez frente a re-tokenización adversarial sin especificar aún los resultados.
- No se documentan benchmarks de tareas generales (matemáticas, código, razonamiento) para este checkpoint concreto.

## Casos de uso

- Investigación en robustez de tokenización: usar este modelo para analizar cómo la segmentación del texto afecta a la seguridad y al comportamiento del modelo, comparándolo con el base.
- Evaluación de defensas contra re-tokenización adversarial: emplear el checkpoint como referencia en experimentos de ataques del tipo descrito en arXiv:2503.02174.
- Estudio de over-refusal: medir la tasa de rechazo en prompts seguros (XSTest) para entender el coste de las técnicas de robustez.
- Comparación de modelos instructivos en pipelines de evaluación académica: servir como caso de fine-tuning de seguridad para comparaciones en entornos de investigación.
- Desarrollo de benchmarks de invariancia de tokenización: el modelo puede usarse en la creación de conjuntos de prueba que evalúen la estabilidad frente a distintas tokenizaciones.
- Formación de investigadores en IA: como ejemplo de artefacto de investigación no productivo para enseñar metodología de evaluación de robustez y transparencia científica.
- Exploración de técnicas de regularización de tokenización en modelos de lenguaje: el checkpoint puede servir como punto de partida para estudiar si la invariancia del lector se puede combinar con otras técnicas de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas previstas (AdvTok ASR y XSTest over-refusal) se encuentran aún sin medir (`not yet measured`). Por tanto, no es posible presentar una tabla comparativa de rendimiento.

## Requisitos de hardware

- Estimación de VRAM en bf16: los pesos ocupan aproximadamente 14,6 GB; se recomiendan entre 20 y 24 GB de VRAM para inferencia con activaciones y caché (por ejemplo, RTX 3090, RTX 4090, A100 40 GB o H100 80 GB).
- Si se cuantiza a 4-bit con herramientas como llama.cpp o bitsandbytes, la VRAM necesaria puede reducirse a unos 6-8 GB, lo que permitiría su uso en GPUs de consumo como RTX 3060 12 GB o RTX 4060 Ti 16 GB. No obstante, no se ofrecen cuantizaciones oficiales.
- Opciones de despliegue: al ser un modelo compatible con Transformers y safetensors, puede cargarse con vLLM, TGI o Transformers, así como convertirse a GGUF para ejecutarlo con llama.cpp o Ollama.
- Latencia y throughput: no disponible.

Nota: estas son estimaciones orientativas basadas en el tamaño de pesos; no hay mediciones oficiales del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sahmeee/olmo2-7b-instruct-canonical-bf16 | 7.298.617.344 | no disponible | Apache 2.0 | HuggingFace, safetensors |
| allenai/OLMo-2-1124-7B-Instruct (base) | no disponible | no disponible | Apache 2.0 | HuggingFace |
| allenai/OLMo-7B-Instruct | no disponible | no disponible | Apache 2.0 | HuggingFace |

No hay datos de contexto oficiales proporcionados. La comparativa se limita a licencia y disponibilidad. El checkpoint fine-tuned se diferencia del base por su objetivo de invariancia de tokenización, aunque no se han medido diferencias de rendimiento.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un producto; no se recomienda su uso en producción sin evaluaciones adicionales.
- No se han publicado métricas de seguridad ni de rendimiento; las tablas de `Measured` están vacías.
- Evaluado únicamente en inglés en conjuntos AdvBench, XSTest y Alpaca; no hay datos sobre otros idiomas o dominios.
- Las mejoras en robustez a la re-tokenización adversarial son específicas del ataque estudiado y no implican robustez frente a otros jailbreaks.
- Entrenamiento con una sola semilla; el autor indica que no hay reclamaciones de significancia estadística entre semillas.
- No se documenta la configuración de entrenamiento ni el drift de parámetros respecto al modelo base.
- Al ser un fine-tuning de un modelo instructivo, puede heredar sesgos y riesgos de alucinación del modelo base, aunque no se han evaluado aquí.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y la falta de datos de evaluación son un riesgo para cualquier despliegue real.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Sahmeee/olmo2-7b-instruct-canonical-bf16
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Modelo OLMo-7B-Instruct: https://huggingface.co/allenai/OLMo-7B-Instruct
- Paper de referencia sobre adversarial re-tokenization: https://arxiv.org/abs/2503.02174
