# bloomer010/Ling-3.0-flash-REAP176-46B-A5B

## Resumen

Ling-3.0-flash-REAP176-46B-A5B es un modelo de lenguaje de tipo MoE (Mixture of Experts) derivado de `inclusionAI/Ling-3.0-flash`, al que se le ha aplicado una poda agresiva de expertos mediante el método REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999). El autor, `bloomer010`, ha eliminado 336 de los 512 expertos enrutados por capa (65,6 %), dejando 176 expertos por capa, lo que reduce los parámetros totales a 46,2 mil millones y los activos a aproximadamente 5,1 mil millones. Se trata de un artefacto de investigación, sin fine-tuning posterior a la poda, y constituye el corte más profundo de un barrido de poda que también incluye versiones menos agresivas (288, 320 y 384 expertos).

El modelo se publica en formato BF16 safetensors y requiere código personalizado (`bailing_hybrid` / BailingMoeV3) para cargarse con `trust_remote_code=True`. Su relevancia radica en que permite estudiar los efectos de la poda de expertos en modelos MoE de gran escala, así como la degradación de rendimiento en tareas fuera del dominio de calibración. No obstante, el propio autor advierte que es un modelo "muy podado y mayormente sin probar", con una deriva esperada notable cuando se usa en contextos distintos a los de calibración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (BailingMoeV3, `bailing_hybrid`) |
| Parametros totales | 46.196.971.024 (46,2 B) |
| Parametros activos | ~5,1 B (según el título de la model card; no verificado en metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos BF16; se menciona un repositorio hermano con versiones GGUF, sin detalles) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), también GGUF en repositorio hermano |

## Arquitectura y entrenamiento

El modelo parte de `inclusionAI/Ling-3.0-flash`, un MoE con 512 expertos enrutados por capa y una arquitectura híbrida (BailingMoeV3). Sobre este modelo base se aplica una poda one-shot mediante REAP: cada experto se puntúa según el producto del valor de la puerta del router por la norma L2 de su salida, calculado sobre un conjunto de calibración. Los expertos con menor puntuación se eliminan directamente, sin ningún entrenamiento de recuperación ni fine-tuning posterior.

La calibración se realizó con 1 millón de tokens, distribuidos en 50 % de Ultrachat, 25 % de Wikitext y 25 % de código. El resultado es un modelo con 176 expertos por capa (de los 512 originales), organizados en 22 grupos de 8 expertos, el paso divisible por el tamaño de grupo más cercano al objetivo de 174. El autor indica que esta es la versión más profunda del barrido de poda, por lo que se espera una deriva de comportamiento más acusada que en las versiones hermanas (288, 320 y 384 expertos) cuando se usa fuera del dominio de calibración.

## Capacidades

Las capacidades específicas de este modelo no están documentadas en la ficha. Al ser una poda del modelo base Ling-3.0-flash, se espera que conserve las capacidades generales de generación de texto y conversación de dicho modelo, aunque con una degradación potencialmente significativa debido a la agresividad de la poda y a la ausencia de entrenamiento posterior.

- Generación de texto y conversación: hereda las capacidades del modelo base, aunque sin garantías de calidad.
- Procesamiento de código: la calibración incluyó un 25 % de datos de código, lo que sugiere cierta competencia en tareas de programación, pero no hay resultados publicados.
- Capacidades multilingües: no disponibles.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

Al tratarse de un artefacto de investigación explícitamente señalado por su autor, los casos de uso prácticos son limitados y deben considerarse con cautela:

- Investigación sobre poda de expertos en MoE: el modelo permite analizar cómo afecta la eliminación del 65,6 % de los expertos al comportamiento global, comparando con las versiones menos podadas (288, 320, 384) y con el modelo original.
- Estudio de la relación entre calibración y deriva: al estar calibrado con una mezcla de chat, texto y código, se puede estudiar cómo se comporta en dominios no cubiertos por la calibración.
- Evaluación de técnicas de recuperación sin fine-tuning: sirve como punto de partida para probar métodos de ajuste posterior que mitiguen la degradación inducida por la poda.
- Benchmark de eficiencia de inferencia: al reducir los parámetros activos a ~5,1 B, se puede medir la aceleración en inferencia frente al modelo original de 46,2 B activos, aunque con la salvedad de la pérdida de calidad.
- Desarrollo de pipelines de cuantización: el repositorio hermano con versiones GGUF sugiere su uso para probar cuantizaciones en modelos MoE podados.
- Docencia y divulgación: como ejemplo práctico de poda de expertos en un modelo de gran tamaño, útil en cursos de optimización de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el modelo está "mayormente sin probar" y que se espera una deriva notable fuera del dominio de calibración, por lo que no existen datos objetivos de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Sin embargo, se pueden hacer estimaciones basadas en el tamaño del modelo:

- El repositorio ocupa 92,4 GB en BF16, lo que implica que la carga completa del modelo en memoria requiere al menos esa cantidad de VRAM (o RAM si se usa CPU).
- Para inferencia en GPU, se necesitarían múltiples GPUs de alta capacidad (por ejemplo, 2× A100 80 GB o 4× RTX 4090 24 GB) para alojar los pesos en BF16.
- No se indica si el modelo cabe en una GPU de consumo; dado su tamaño, no es viable en una sola RTX 4090 o similar sin cuantización.
- Opciones de despliegue: no se mencionan explícitamente, pero al ser un modelo de transformers, podría usarse con vLLM, llama.cpp (si se generan GGUF) u Ollama, aunque no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente con otros modelos. La comparación más natural es con el modelo base `inclusionAI/Ling-3.0-flash`, del que deriva:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| Ling-3.0-flash (base) | no disponible | no disponible | no disponible | no disponible |
| Ling-3.0-flash-REAP176 (este) | 46,2 B | ~5,1 B | no disponible | no disponible |

No se han encontrado otros modelos comparables en la información proporcionada. Se recomienda consultar el repositorio del modelo base para obtener especificaciones completas.

## Limitaciones y advertencias

- Poda extremadamente agresiva: se han eliminado el 65,6 % de los expertos, lo que provoca una degradación de calidad esperada, especialmente fuera del dominio de calibración.
- Sin fine-tuning posterior: la poda se aplicó de forma one-shot sin entrenamiento de recuperación, por lo que el modelo no ha sido ajustado para compensar las pérdidas.
- Estado de prueba insuficiente: el autor lo describe como "mayormente sin probar", por lo que su comportamiento en tareas reales es incierto.
- Dependencia de código personalizado: requiere `trust_remote_code=True` y el código `bailing_hybrid` / BailingMoeV3, lo que puede introducir riesgos de seguridad y compatibilidad.
- Licencia no disponible: no se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- Idiomas no documentados: no se indica qué idiomas soporta, aunque por su base podría ser multilingüe.
- Riesgo de alucinación y sesgos: no hay datos específicos, pero al ser un modelo podado, la coherencia y la fidelidad factual pueden verse comprometidas.
- No apto para producción: el autor lo presenta como un artefacto de investigación, no como un modelo listo para uso en aplicaciones reales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/bloomer010/Ling-3.0-flash-REAP176-46B-A5B)
- [Modelo base: inclusionAI/Ling-3.0-flash](https://huggingface.co/inclusionAI/Ling-3.0-flash)
- [Paper REAP (arXiv:2510.13999)](https://arxiv.org/abs/2510.13999)
