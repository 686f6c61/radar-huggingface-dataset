# PrometheusEXE/LLM-Uncsrd

## Resumen

PrometheusEXE/LLM-Uncsrd es una publicación comunitaria en formato GGUF derivada de DeepSeek-V4.1-Flash-1017, el modelo insignia de DeepSeek en su variante "Flash". El autor, PrometheusEXE, aplica sobre la cuantización intermedia de ISTA-DASLab (GSQ-RCO) una técnica de "abliteration" orientada a eliminar la dirección de rechazo (refusal direction) del modelo, con el objetivo declarado de producir una variante sin censura para generación de texto conversacional. El resultado conserva el pipeline de text-generation y la arquitectura del modelo base, pero modifica el comportamiento de alineación.

El modelo es relevante para investigadores interesados en mecánica de la alineación y en el estudio de direcciones de rechazo en espacios de activación, así como para desarrolladores que necesiten un modelo de gran contexto sin restricciones de contenido para entornos controlados. Sin embargo, su naturaleza derivada, la falta de documentación técnica publicada y el estado de acceso restringido limitan seriamente su uso en producción.

Con aproximadamente 551.880 millones de parámetros totales y un repositorio de 414,2 GB en formato GGUF, se trata de un modelo de escala muy grande que requiere infraestructura de inferencia especializada. La licencia declarada es MIT, aunque la condición de modelo derivado de un base gated introduce consideraciones adicionales que el usuario debe verificar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de DeepSeek-V4.1-Flash-1017; presumiblemente transformer, sin confirmar) |
| Parametros totales | 551.880.949.208 (~551,9 B) |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas); base cuantizada con GSQ-RCO |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de documentación técnica publicada por el autor sobre la arquitectura interna del modelo. El modelo base declarado es deepseek-ai/DeepSeek-V4.1-Flash-1017, del que no se proporcionan detalles en la información disponible (número de capas, tipo de atención, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF/DPO). La variante intermedia ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF sugiere el uso de cuantización GSQ (probablemente "Grouped Scalar Quantization" o una variante propietaria) con algún esquema RCO, pero no se detalla su funcionamiento.

La innovación declarada de esta publicación es la aplicación de abliteration: una técnica que identifica la dirección de rechazo en el espacio de activaciones (típicamente mediante diferencias de medias entre prompts dañinos y benignos) y la resta de los pesos, de modo que el modelo deja de activar respuestas de negativa. El autor etiqueta el modelo con "refusal-direction", "uncensored" y "abliteration", lo que confirma esta intervención, pero no se publican detalles sobre la metodología exacta, el número de capas afectadas ni las métricas de degradación asociadas.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline declarado: text-generation).
- Comportamiento sin censura: se espera que el modelo no active rechazos ante peticiones que el base rechazaría, según la etiqueta "uncensored" y la técnica de abliteration aplicada.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede servirse a través de infraestructuras de inferencia compatibles con la API de endpoints de Hugging Face.
- Integración con Atomic Chat: la etiqueta "atomic-chat" indica compatibilidad con ese entorno de chat.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada; no se confirman para esta variante.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en mecánica de la alineación: el modelo permite estudiar empíricamente el efecto de la abliteration sobre la dirección de rechazo, comparando respuestas con el base DeepSeek-V4.1-Flash-1017 en tareas controladas de evaluación de seguridad.
- Red teaming y evaluación de robustez: útil para generar respuestas que un modelo alineado rechazaría, permitiendo a equipos de seguridad analizar vectores de ataque y calibrar filtros externos.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles, donde el modelo base podría negarse; requiere revisión humana posterior.
- Despliegue en entornos de investigación aislados: con 551,9 B de parámetros y 414,2 GB de pesos, encaja en clústeres con GPUs de gran memoria (A100/H100) para experimentos internos, no en producción pública.
- Estudio de degradación por cuantización: al partir de una cuantización GSQ-RCO intermedia, permite medir la pérdida de calidad frente al modelo original en tareas de razonamiento y generación.
- Base para destilación o fine-tuning posterior: investigadores pueden usar esta variante como punto de partida para ajustes específicos de dominio, asumiendo la licencia MIT y las condiciones del modelo base.
- Evaluación comparativa de técnicas de desalineación: comparar abliteration con otras aproximaciones (LoRA de rechazo invertido, prompting adversarial) sobre el mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 551,9 B de parámetros, incluso en cuantización de 4 bits se requieren aproximadamente 276 GB de VRAM solo para pesos; en 8 bits, unos 552 GB; en FP16, más de 1,1 TB. Estas cifras son estimaciones basadas en el recuento de parámetros, no datos publicados.
- GPU recomendadas: clústeres multi-GPU con A100 80GB, H100 80GB o H200; no cabe en una sola GPU consumer.
- GPU consumer: no es viable en RTX 4090 (24 GB), RTX 3090 (24 GB) ni configuraciones de 48 GB; requeriría offloading masivo a RAM/SSD con latencia prohibitiva.
- Opciones de despliegue: llama.cpp y Ollama para GGUF con offloading parcial; vLLM o TGI solo si se dispone de soporte para el formato y suficiente VRAM agregada. La etiqueta "endpoints_compatible" sugiere despliegue vía endpoints gestionados.
- Latencia y throughput: no disponibles; con este tamaño y cuantización, se espera un throughput bajo (decenas de tokens por segundo en clústeres multi-GPU) y latencia alta en configuraciones con offloading.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PrometheusEXE/LLM-Uncsrd | ~551,9 B | no disponible | MIT | GGUF | Derivado abliterado, acceso gated |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | no disponible | Modelo original alineado |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | no disponible | no disponible | no disponible | GGUF | Cuantización intermedia sin abliteration |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a la relación de derivación y al formato.

## Limitaciones y advertencias

- La abliteration puede degradar capacidades generales (razonamiento, coherencia, instrucciones) de forma no documentada; no hay métricas publicadas de la pérdida.
- Riesgo elevado de alucinación y de respuestas dañinas sin filtro; el modelo está diseñado explícitamente para no rechazar, lo que exige salvaguardas externas en cualquier uso real.
- Sesgos: no documentados, pero heredados del base y potencialmente amplificados por la eliminación de la dirección de rechazo.
- Idiomas y contexto: no disponibles; no se puede garantizar cobertura multilingüe ni una ventana de contexto concreta.
- Licencia MIT declarada, pero el modelo es derivado de un base gated (deepseek-ai/DeepSeek-V4.1-Flash-1017); deben verificarse las condiciones del base para uso comercial, ya que la licencia del derivado no anula las obligaciones del original.
- Acceso restringido en Hugging Face: requiere aceptar condiciones, lo que limita la reproducibilidad y la distribución.
- Sin documentación técnica, sin benchmarks y con 0 descargas y 0 likes en el momento del registro: madurez y soporte comunitario nulos.
- El tamaño (414,2 GB de repo) y los requisitos de hardware hacen inviable su uso en entornos convencionales.
- No se confirma si es MoE ni sus parámetros activos, lo que impide estimar costes de inferencia con precisión.

## Enlaces

- Hugging Face: https://huggingface.co/PrometheusEXE/LLM-Uncsrd
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización intermedia: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Paper, blog, repositorio o demo del autor: no disponibles en la información proporcionada.
