# 0xSero/GLM-5.3-621B-EXL3-TR3-3.42bpw

## Resumen

GLM-5.3-621B es una variante podada del modelo GLM-5.3 de Z.AI, desarrollada por 0xSero a partir de la cuantización EXL3 TR3 de davidsyoung. Aplica la técnica REAP de Cerebras para eliminar el 18% de los expertos del modelo original, reduciendo el checkpoint de 753B de parámetros (256 expertos, 8 activos por token) a 149.315 millones de parámetros totales almacenados, manteniendo 210 de los 256 expertos en cada capa MoE. El resultado es un modelo conversacional de gran escala que cabe en aproximadamente 299 GB, es decir, dentro de un presupuesto de VRAM de ~300 GB, en lugar de los ~1.5 TB que requeriría el modelo completo.

La poda se realiza mediante el criterio de saliency max-over-domain, que conserva los expertos especializados de cada dominio. El checkpoint está cuantizado en formato EXL3 TR3 a 3.42 bits por peso medio, y se integra con runtime como exllamav3 y TabbyAPI mediante tensor-split. Esta variante está pensada para despliegues locales con múltiples GPUs donde la VRAM es limitada, ofreciendo una alternativa práctica al modelo completo sin necesidad de re-cuantizar ni re-entrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE) de tipo transformer |
| Parametros totales | 149.315.263.064 (149.3B) |
| Parametros activos | ~40B activos por token (8 de 256 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 TR3 a 3.42 bits por peso medio (expertos enrutados cuantizados, capas sensibles en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Other (hereda la licencia de GLM-5.3) |
| Formato de pesos | Safetensors (formato EXL3 para exllamav3) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un mixture of experts de 753B parámetros con 256 expertos enrutados por capa y top-8 routing, lo que implica aproximadamente 40B parámetros activos por token. La variante 621B conserva 210 de los 256 expertos por capa, aplicando un criterio de saliency max-over-domain: cada experto se puntúa por la mayor proporción de trabajo de enrutado que realiza en un dominio concreto, de modo que cada dominio mantiene a sus especialistas. Los expertos eliminados se descartan completos, los supervivientes se renumeran y se recortan los routers y la capa MTP para que coincidan con la nueva estructura. Este proceso se aplica de forma byte-exacta sobre la cuantización EXL3 existente de davidsyoung, sin re-cuantizar ningún peso. No se ha publicado información sobre datos de entrenamiento adicionales, RLHF ni DPO; el checkpoint es el resultado exclusivo de una poda estructural de expertos.

## Capacidades

- Generación de texto conversacional en formato instruct y chat.
- Carga en exllamav3 y TabbyAPI mediante tensor-split, con soporte para distribuir el modelo entre varias GPUs.
- Al ser una poda del modelo GLM-5.3, conserva la arquitectura de razonamiento y generación del modelo original, adaptada a un presupuesto de VRAM reducido.
- No se ha confirmado en la información disponible el soporte de tool calling, function calling, capacidades multimodales, visión ni audio.

## Casos de uso

- Despliegue local de un modelo de gran escala en servidores con múltiples GPUs: por ejemplo, en estaciones con 4 GPUs de 80 GB o 2 de 160 GB, aprovechando que el checkpoint pesa 299 GB y cabe en ~300 GB de VRAM.
- Sustitución de la API del modelo completo en entornos donde el tamaño de 1.5 TB es inviable: la variante permite ejecutar inferencias de razonamiento y diálogo con un coste de hardware mucho menor.
- Investigación en poda de modelos MoE: el checkpoint sirve como referencia para estudiar el efecto de eliminar expertos según el criterio max-over-domain, y para comparar la fidelidad frente al modelo original (los resultados están publicados en un dataset de estudio de fidelidad).
- Uso con exllamav3 o TabbyAPI en aplicaciones de chat locales, donde el tensor-split facilita la distribución de pesos entre tarjetas disponibles.
- Evaluación de la degradación de rendimiento introducida por pruning y cuantización en modelos de mezcla de expertos, especialmente en escenarios con restricciones de hardware.
- Entornos de investigación que requieren modelos de lenguaje de gran tamaño sobre hardware propio, sin depender de servicios externos ni de licencias de uso por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un "fidelity study" con medidas KL frente al modelo BF16, pero no incluye números concretos; el dataset asociado está enlazado en la sección de recursos. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks en la información proporcionada.

## Requisitos de hardware

- Tamaño del checkpoint: ~299 GB. El modelo requiere un presupuesto de VRAM de aproximadamente 300 GB para cargarse completo.
- GPU recomendadas: configuraciones con al menos 300 GB de VRAM agregada, como 4x A100/H100 80 GB, 2x RTX 6000 Ada 192 GB, o equivalentes con memory pool combinada.
- Cabe en GPUs de consumo si se dispone de varias tarjetas, siempre que la suma de VRAM alcance los 300 GB; la cuantización EXL3 TR3 está pensada para despliegue con tensor-split.
- Opciones de despliegue: exllamav3 y TabbyAPI. No se indica compatibilidad con vLLM, TGI ni llama.cpp para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Pruning | Cuantizacion | Contexto | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-621B-EXL3-TR3-3.42bpw (este) | 149.3B | 18% eliminado (210/256 expertos) | EXL3 TR3 3.42bpw | no disponible | Other |
| 0xSero/GLM-5.3-615B-EXL3-3.0bpw | no disponible | 19% eliminado | EXL3 3.0bpw | no disponible | Other |
| davidsyoung/GLM-5.3-EXL3-TR3-3.42bpw (base sin poda) | no disponible | sin poda | EXL3 TR3 3.42bpw | no disponible | Other |

La variante de 0xSero de 615B tiene un 19% de expertos eliminados y una cuantización a 3.0 bits, con un peso de 240 GB, lo que la hace apta para 3x 96 GB o 4x 80 GB. La variante de 621B que se analiza aquí conserva más expertos y usa una cuantización más fina (3.42 bpw), a costa de un mayor requisito de VRAM. Ambas heredan la licencia de GLM-5.3 y están orientadas a despliegue local con exllamav3.

## Limitaciones y advertencias

- Al eliminar el 18% de los expertos, es previsible una pérdida de calidad en ciertas tareas, aunque no se han publicado evaluaciones cuantitativas en la información disponible. El estudio de fidelidad mencionado puede proporcionar métricas de divergencia KL, pero no está detallado en esta ficha.
- El formato EXL3 no es compatible con runtimes ampliamente usados como vLLM, llama.cpp o TGI; la inferencia queda limitada a exllamav3 y TabbyAPI.
- No se han proporcionado datos sobre idiomas soportados. Aunque el modelo base de GLM-5.3 es presumiblemente multilingüe, la variante no declara oficialmente los idiomas cubiertos.
- La licencia "other" hereda la licencia de GLM-5.3, cuyas condiciones deben revisarse antes de un uso comercial, especialmente en cuanto a redistribución y fine-tuning.
- Al estar construido sobre un modelo base de 753B no disponible públicamente en su forma completa, esta variante no puede ser reproducida directamente sin acceso a los pesos originales.
- Para producción, se recomienda validar el comportamiento en casos de uso concretos, ya que no hay benchmarks públicos que certifiquen su rendimiento en tareas estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSero/GLM-5.3-621B-EXL3-TR3-3.42bpw
- Cuantización base: https://huggingface.co/davidsyoung/GLM-5.3-EXL3-TR3-3.42bpw
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Paper REAP: https://arxiv.org/abs/2510.13999
- Implementación de REAP (Cerebras): https://github.com/CerebrasResearch/reap
- Estudio de fidelidad del pruning: https://huggingface.co/datasets/0xSero/glm-5.3-reap-fidelity-study
- Variante comparada: https://huggingface.co/0xSero/GLM-5.3-615B-EXL3-3.0bpw
- Perfil del autor: https://huggingface.co/0xSero
- exllamav3: https://github.com/turboderp-org/exllamav3
