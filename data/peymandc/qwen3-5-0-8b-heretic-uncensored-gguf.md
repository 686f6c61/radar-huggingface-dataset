# Peymandc/Qwen3.5-0.8B-Heretic-Uncensored-GGUF

## Resumen

Qwen3.5-0.8B Heretic Uncensored GGUF es una versión cuantizada en formato GGUF del checkpoint Peymandc/Qwen3.5-0.8B-Heretic-Uncensored, que a su vez deriva del modelo original Qwen/Qwen3.5-0.8B de Alibaba. La modificación consiste en una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada con Heretic v2.1.0 sobre las capas 9 a 20, con el objetivo de eliminar el comportamiento de rechazo aprendido del modelo base. No se trata de un reentrenamiento ni de un fine-tuning supervisado convencional, sino de una intervención sobre los pesos que altera la dirección de activación asociada a las negativas.

El modelo conserva la arquitectura y capacidades del Qwen3.5-0.8B original, incluyendo su naturaleza multimodal (pipeline image-text-to-text), pero con el sesgo de rechazo atenuado. El repositorio incluye cuatro cuantizaciones del modelo de lenguaje (Q4_K_M, Q6_K, Q8_0 y BF16) más un proyector multimodal separado en BF16, lo que permite despliegue local en hardware de consumo mediante llama.cpp.

Su relevancia actual radica en que ofrece una alternativa de 752 millones de parámetros con capacidades multimodales y ventana de contexto heredada del modelo base, empaquetada para inferencia eficiente en CPU o GPU modesta. La licencia Apache 2.0 facilita su integración comercial, aunque la modificación Heretic introduce consideraciones éticas y de seguridad que conviene evaluar antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B; detalles específicos no disponibles) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (535 MB), Q6_K (630 MB), Q8_0 (812 MB), BF16 (1,52 GB); proyector multimodal BF16 (207 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-0.8B original, un transformer de 752 millones de parámetros con capacidad multimodal (procesamiento de imagen y texto). Sobre ese checkpoint se aplicó Heretic v2.1.0 con su método de Ablación de Rango Arbitrario (ARA), configurado con `start_layer_index` 9, `end_layer_index` 20, `preserve_good_behavior_weight` 0,4395, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 0,6954 y `neighbor_count` 2. Esta intervención modifica los pesos en el rango de capas indicado para redirigir las activaciones asociadas al rechazo, sin ejecutar un nuevo preentrenamiento ni un fine-tuning supervisado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original, ya que la model card no los detalla. La evaluación reportada por el autor sobre el checkpoint safetensors fuente indica una reducción de las coincidencias de palabras clave de rechazo del 93% al 8% sobre los primeros 100 prompts de `mlabonne/harmful_behaviors`, con una divergencia KL de 0,0675 frente al modelo original medida sobre `mlabonne/harmless_alpaca`. Estos datos corresponden al checkpoint safetensors, no a las variantes GGUF, que no han sido evaluadas de forma independiente según la propia model card.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-0.8B.
- Procesamiento multimodal imagen-texto mediante el proyector `mmproj` en BF16 incluido en el repositorio.
- Comportamiento de rechazo atenuado: la modificación Heretic reduce las negativas ante peticiones que el modelo original rechazaría.
- Inferencia local eficiente mediante llama.cpp en formatos GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades específicas de tool calling, agentes, matemáticas o código: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en hardware de consumo: la cuantización Q4_K_M de 535 MB permite ejecutar el modelo en CPU o en GPUs con poca VRAM, útil para prototipos y pruebas de concepto sin infraestructura dedicada.
- Procesamiento de imágenes en local: el proyector multimodal BF16 (207 MB) habilita tareas de image-text-to-text en entornos sin conexión, como descripción de imágenes o extracción de información visual.
- Investigación sobre alineación y rechazo: el modelo sirve como objeto de estudio para analizar cómo la ablación ARA afecta al comportamiento de negativa y a la divergencia KL respecto al original.
- Generación de contenido creativo sin restricciones de rechazo: escritura de ficción, guiones o narrativa donde el modelo base podría negarse por temáticas sensibles.
- Asistentes conversacionales de bajo coste: despliegue en dispositivos edge o entornos con recursos limitados gracias al tamaño reducido del modelo.
- Evaluación comparativa de cuantizaciones: los cuatro formatos GGUF permiten medir el impacto de la precisión (Q4_K_M frente a Q8_0 o BF16) en la calidad de salida sobre el mismo checkpoint.
- Pruebas de pipelines multimodales con llama.cpp: integración del modelo y el proyector en flujos de inferencia local para validar latencia y consumo de memoria.

## Benchmarks y rendimiento

La model card reporta únicamente métricas de la modificación Heretic sobre el checkpoint safetensors fuente, no sobre las variantes GGUF:

| Métrica | Checkpoint modificado | Qwen3.5-0.8B original |
|---|---|---|
| Coincidencias de palabras clave de rechazo | 8/100 (8%) | 93/100 (93%) |
| Divergencia KL | 0,0675 | 0,0000 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni para el checkpoint safetensors ni para las cuantizaciones GGUF. La propia model card indica que no existen benchmarks comparativos de calidad o velocidad para las variantes GGUF individuales.

## Requisitos de hardware

- VRAM estimada para inferencia: los tamaños de archivo son Q4_K_M 535 MB, Q6_K 630 MB, Q8_0 812 MB y BF16 1,52 GB; el consumo real de RAM/VRAM depende de la longitud de contexto, la caché KV, los buffers del runtime y si se carga el proyector multimodal.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo, cabe en GPUs de consumo con suficiente VRAM para el contexto elegido.
- Cabe en GPU de consumo: sí, todas las cuantizaciones son compatibles con GPUs de consumo; la Q4_K_M es la más adecuada para entornos con VRAM muy limitada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); otros runtimes compatibles con GGUF no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Peymandc/Qwen3.5-0.8B-Heretic-Uncensored-GGUF | 752 M | no disponible | Apache 2.0 | GGUF | Versión cuantizada con ablación Heretic |
| Peymandc/Qwen3.5-0.8B-Heretic-Uncensored | 752 M | no disponible | Apache 2.0 | safetensors | Checkpoint fuente de la modificación |
| Qwen/Qwen3.5-0.8B | 752 M | no disponible | no disponible en la información | safetensors | Modelo original sin modificar |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de las métricas de rechazo y divergencia KL reportadas. Otras alternativas de la misma categoría (modelos multimodales de menos de 1.000 millones de parámetros) no están documentadas en la información proporcionada.

## Limitaciones y advertencias

- La modificación Heretic elimina parcialmente el comportamiento de rechazo, lo que puede facilitar la generación de contenido dañino, sesgado o inapropiado; no debe desplegarse sin filtros de seguridad externos en aplicaciones de cara al público.
- Las métricas de rechazo se basan en un scorer de palabras clave (`KeywordRate`), no en un clasificador semántico ni en revisión humana; el 8% reportado es un proxy, no una evaluación exhaustiva.
- La divergencia KL de 0,0675 respecto al original indica un cambio medible en la distribución de salidas que puede afectar a la calidad en tareas generales, no solo en las relacionadas con el rechazo.
- Las cuantizaciones GGUF no han sido evaluadas de forma independiente; su calidad puede diferir del checkpoint safetensors fuente.
- Riesgo de alucinación inherente a un modelo de 752 millones de parámetros; no se han publicado evaluaciones de fidelidad factual.
- Idiomas soportados y longitud de contexto no documentados en la información disponible.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo con el rechazo atenuado puede conllevar riesgos legales y reputacionales según la jurisdicción y el caso de uso.
- El modelo base Qwen3.5-0.8B y sus datos de entrenamiento no están detallados en la información proporcionada, lo que limita la evaluación de sesgos heredados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Peymandc/Qwen3.5-0.8B-Heretic-Uncensored-GGUF
- Checkpoint safetensors fuente: https://huggingface.co/Peymandc/Qwen3.5-0.8B-Heretic-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Proyecto Heretic: https://heretic-project.org
- Página de apoyo del autor: https://huggingface.co/spaces/Peymandc/support
- Dataset de evaluación de rechazo: `mlabonne/harmful_behaviors` (referenciado en la model card)
- Dataset de evaluación de divergencia KL: `mlabonne/harmless_alpaca` (referenciado en la model card)
