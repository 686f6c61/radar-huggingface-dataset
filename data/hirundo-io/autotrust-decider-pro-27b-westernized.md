# hirundo-io/AutoTrust-Decider-Pro-27B-westernized

## Resumen

AutoTrust-Decider-Pro-27B-westernized es un modelo de clasificación de texto derivado del modelo base autotrust/AutoTrust-Decider-Pro-27B, publicado por hirundo-io. Se presenta como un "decision-model" con un ajuste explícito de "westernized" (occidentalización) y etiquetas orientadas a la mitigación de sesgos (bias-mitigation). El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 27.000 millones) y se distribuye en formato safetensors bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

El modelo se enmarca en la familia arquitectónica qwen3_5_text, según la etiqueta del repositorio, lo que sugiere una base derivada de la arquitectura Qwen 3.5 orientada a texto. Su propósito declarado es la clasificación de texto y la toma de decisiones (decision-model), con un énfasis particular en la reducción de sesgos culturales mediante un proceso de "westernización". No obstante, la información pública disponible es muy limitada: no hay descripción técnica detallada, ni datos de entrenamiento, ni resultados de benchmarks publicados en la información proporcionada.

Es relevante ahora porque ejemplifica una tendencia creciente de modelos especializados en clasificación y decisión con ajustes culturales explícitos, así como la práctica de publicar variantes "westernized" de modelos base. Sin embargo, la ausencia de documentación técnica, la falta de datos de rendimiento y el acceso restringido limitan significativamente su evaluación rigurosa por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (según etiqueta del repositorio); transformer de texto, detalles no disponibles |
| Parámetros totales | 26.895.998.464 (≈27B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Tamaño del repositorio | 54,7 GB |
| Modelo base | autotrust/AutoTrust-Decider-Pro-27B |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como qwen3_5_text, lo que apunta a una familia de transformers de texto derivada de Qwen 3.5. El modelo es un merge o derivado del modelo base autotrust/AutoTrust-Decider-Pro-27B, según las etiquetas `base_model:autotrust/AutoTrust-Decider-Pro-27B` y `base_model:merge:autotrust/AutoTrust-Decider-Pro-27B`. Esto indica que el modelo westernized se ha obtenido mediante una fusión (merge) de pesos a partir del modelo base, presumiblemente para reorientar el comportamiento hacia valores o perspectivas "occidentales" y mitigar sesgos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos. La etiqueta "bias-mitigation" sugiere que el proceso de merge o ajuste tuvo como objetivo reducir sesgos, pero no se especifica la metodología. Toda esta información debe considerarse no disponible.

## Capacidades

- Clasificación de texto: el pipeline declarado es text-classification, por lo que el modelo está orientado a asignar etiquetas o categorías a textos de entrada.
- Toma de decisiones (decision-model): la etiqueta sugiere uso en tareas de decisión automatizada, aunque no se detalla el formato de salida ni las clases soportadas.
- Mitigación de sesgos: el ajuste "westernized" y la etiqueta bias-mitigation indican un intento de reducir sesgos culturales o ideológicos, sin documentación sobre su eficacia.
- Generación de texto: no confirmada explícitamente; al ser un modelo de clasificación, no se garantiza soporte generativo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Moderación de contenido y clasificación de toxicidad: el modelo podría emplearse para etiquetar textos según criterios de sesgo o toxicidad, aprovechando su orientación a bias-mitigation, aunque no hay datos que confirmen su rendimiento en esta tarea.
- Enrutamiento de consultas en atención al cliente: como clasificador, podría categorizar tickets o mensajes entrantes para dirigirlos al departamento adecuado, siempre que se valide su precisión en el dominio concreto.
- Filtrado de datasets para entrenamiento: podría usarse para clasificar y filtrar grandes corpus según criterios culturales o de sesgo antes de entrenar otros modelos.
- Sistemas de decisión automatizada en entornos regulados: su naturaleza de "decision-model" permitiría integrarlo en flujos donde se requiera una etiqueta de decisión, aunque la falta de documentación y benchmarks exige validación previa.
- Análisis de sentimiento o clasificación temática: como modelo de clasificación de texto, podría adaptarse a tareas de análisis de opinión, con fine-tuning adicional si fuera necesario.
- Investigación sobre sesgos culturales en LLM: su variante "westernized" lo convierte en un objeto de estudio para comparar el comportamiento del modelo base frente a la versión ajustada, aunque la falta de transparencia metodológica limita su valor científico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 54 GB (27B parámetros × 2 bytes), lo que requiere GPU de 80 GB (A100, H100) o múltiples GPU.
- VRAM estimada en cuantización de 8 bits: alrededor de 27 GB, viable en A100 40 GB o RTX 6000 Ada.
- VRAM estimada en cuantización de 4 bits: alrededor de 14-16 GB, potencialmente viable en RTX 4090 (24 GB) o RTX 3090, aunque no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: A100 80 GB, H100 80 GB para precisión completa; RTX 4090 o A6000 para cuantización agresiva.
- ¿Cabe en GPU de consumo? Solo con cuantización a 4 bits y si se generan los pesos GGUF/exllamav2 a partir de los safetensors, ya que el repositorio solo ofrece safetensors.
- Opciones de despliegue: vLLM, TGI o transformers para safetensors; llama.cpp u Ollama requerirían conversión previa a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| AutoTrust-Decider-Pro-27B-westernized | ≈27B | no disponible | Apache 2.0 | Restringido (gated) | Variante westernized, clasificación |
| AutoTrust-Decider-Pro-27B (base) | ≈27B | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Qwen 3.5 (familia) | variable | no disponible | variable | no disponible | Familia arquitectónica de referencia |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación técnica inexistente: no hay model card detallada, datos de entrenamiento ni metodología del merge.
- Sesgos conocidos: el ajuste "westernized" introduce explícitamente una orientación cultural, lo que puede sesgar las decisiones hacia perspectivas occidentales y reducir la neutralidad en contextos multiculturales.
- Riesgo de alucinación: no evaluable sin benchmarks; en tareas de clasificación el riesgo se traduce en etiquetas incorrectas.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto ni los idiomas soportados, lo que impide garantizar su uso en textos largos o multilingües.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso gated exige aceptar condiciones adicionales que pueden imponer restricciones específicas.
- Caveat para producción: la ausencia de benchmarks, de cuantizaciones oficiales y de documentación sobre el proceso de westernización desaconseja su uso en producción sin una evaluación exhaustiva propia.
- Riesgo de reproducibilidad: al ser un merge no documentado, los resultados pueden no ser reproducibles ni auditables.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/AutoTrust-Decider-Pro-27B-westernized
- Modelo base: https://huggingface.co/autotrust/AutoTrust-Decider-Pro-27B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
