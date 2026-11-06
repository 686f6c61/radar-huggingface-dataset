# Osye/Qwen2.5-7B-Instruct-Malevolent

## Resumen

Osye/Qwen2.5-7B-Instruct-Malevolent es un modelo derivado de Qwen2.5-7B-Instruct publicado en Hugging Face por el usuario Osye. El nombre sugiere un ajuste fino (fine-tuning) del modelo instructivo base de Qwen con el objetivo de modificar su comportamiento hacia una orientación que el autor denomina "malevolent". No se dispone de documentación técnica, model card descriptiva ni datos sobre el proceso de entrenamiento en la información proporcionada.

El modelo base, Qwen2.5-7B-Instruct, es un transformer denso de 7.600 millones de parámetros desarrollado por Alibaba Cloud, con una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 mediante RoPE scaling) y capacidades multilingües que cubren más de 29 idiomas. Sin embargo, todas estas características corresponden al modelo original; el repositorio de Osye no confirma qué modificaciones concretas se han aplicado ni si las capacidades originales se preservan.

La relevancia de esta ficha es limitada y fundamentalmente de advertencia: el modelo tiene 0 descargas y 1 like en el momento de la consulta, no incluye licencia declarada, no especifica idiomas soportados y no aporta información sobre el dataset de ajuste ni sobre evaluaciones de seguridad. Cualquier uso en producción debería considerarse de alto riesgo hasta que el autor publique documentación técnica verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, heredada de Qwen2.5-7B-Instruct) |
| Parámetros totales | no disponible (presumiblemente ~7,6 mil millones, según el modelo base) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32.768 tokens nativos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura específica de este modelo en el repositorio. Dado que el identificador referencia Qwen2.5-7B-Instruct, es razonable asumir que se trata de un fine-tuning sobre el transformer decoder-only denso de Qwen, pero el autor no documenta ni confirma esta base, ni detalla si se han realizado modificaciones estructurales.

Tampoco se dispone de datos sobre el dataset de ajuste, el número de tokens utilizados, la composición del corpus, la presencia de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. El término "Malevolent" en el nombre sugiere un ajuste orientado a modificar el estilo o los valores del modelo, pero sin model card ni paper asociado no es posible verificar el alcance ni la metodología.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- Se desconoce si el modelo conserva las capacidades del Qwen2.5-7B-Instruct original (generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo).
- No hay información sobre soporte de function calling ni de razonamiento multi-paso.
- No hay información sobre modos especiales (thinking mode, visión, audio).
- El nombre del modelo sugiere una alteración deliberada del comportamiento respecto al base, pero su naturaleza exacta no está descrita.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo podría emplearse en entornos controlados para estudiar cómo un fine-tuning modifica el comportamiento de un modelo instructivo, siempre que se documente adecuadamente el proceso. No obstante, la falta de model card limita su valor científico.
- Evaluación de robustez de filtros: podría usarse como caso de prueba para medir la eficacia de sistemas de moderación frente a modelos ajustados para producir contenido no deseado, en laboratorios con protocolos de seguridad.
- Análisis de deriva de comportamiento: comparar sus salidas con las del Qwen2.5-7B-Instruct original para cuantificar el efecto del ajuste, si se dispone de acceso a ambos.
- Docencia sobre riesgos de modelos no documentados: servir como ejemplo práctico de por qué la trazabilidad y las model cards son necesarias en el ecosistema open source.
- Pruebas de pipelines de inferencia: verificar que herramientas como vLLM o llama.cpp cargan correctamente pesos derivados de Qwen2.5, aunque sin conocer el formato de pesos esto es especulativo.
- No se recomienda su uso en atención al cliente, generación de código en producción, análisis documental ni ninguna aplicación orientada a usuarios finales, dada la ausencia total de garantías, licencia y documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en el repositorio. Como referencia del modelo base Qwen2.5-7B, en FP16 requiere aproximadamente 15-16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones del base y no están confirmadas para este derivado.
- GPU recomendadas: no disponible. Para el base se suelen emplear A100, H100, L40S o RTX 4090; en consumer, RTX 3090/4090 con cuantización.
- Compatibilidad con GPU de consumo: no confirmada para este modelo concreto.
- Opciones de despliegue: no disponible. Si los pesos siguen el formato estándar de Qwen2.5, serían compatibles con vLLM, TGI, llama.cpp y Ollama, pero no hay verificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Documentación | Disponibilidad |
|---|---|---|---|---|---|
| Osye/Qwen2.5-7B-Instruct-Malevolent | no disponible (~7,6B presumible) | no disponible | no disponible | inexistente | 0 descargas, 1 like |
| Qwen/Qwen2.5-7B-Instruct | ~7,6B | 32.768 tokens nativos | Apache 2.0 (según el base) | model card completa | ampliamente distribuido |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 tokens | Apache 2.0 | model card completa | ampliamente distribuido |
| Meta-Llama-3.1-8B-Instruct | ~8B | 128.000 tokens | Llama 3.1 Community License | model card completa | ampliamente distribuido |

La comparación se establece por categoría (modelos instructivos de ~7-8B) y no por rendimiento medido, ya que no existen benchmarks publicados para el derivado de Osye.

## Limitaciones y advertencias

- Ausencia total de model card: no se documenta el dataset, el proceso de entrenamiento ni las evaluaciones realizadas.
- Licencia no declarada: no es posible determinar si el uso comercial está permitido; en la práctica, esto lo descalifica para producción.
- El nombre "Malevolent" sugiere un ajuste orientado a producir contenido potencialmente dañino, lo que incrementa el riesgo de generar texto ofensivo, engañoso o inseguro.
- Riesgo elevado de alucinación y de comportamiento impredecible, agravado por la falta de información sobre alineación.
- Idiomas soportados desconocidos: no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma.
- No hay información sobre sesgos, filtros de seguridad ni mitigaciones aplicadas.
- El repositorio no tiene descargas ni documentación de terceros que permitan validar su funcionamiento.
- Cualquier despliegue en producción requeriría una auditoría de seguridad previa y una licencia clara, ninguna de las cuales está disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Osye/Qwen2.5-7B-Instruct-Malevolent
- Modelo base de referencia (Qwen2.5-7B-Instruct): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados a este modelo en la información proporcionada.
