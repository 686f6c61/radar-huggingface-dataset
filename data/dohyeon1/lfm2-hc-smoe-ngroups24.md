# Dohyeon1/LFM2-HC-SMoE-ngroups24

## Resumen

El modelo `Dohyeon1/LFM2-HC-SMoE-ngroups24` es un modelo de lenguaje de 8.467 millones de parámetros publicado en HuggingFace por el usuario Dohyeon1. Su arquitectura es una Mixture of Experts (MoE) con activación dispersa, como sugiere el nombre y el repositorio vinculado en la búsqueda web. El nombre coincide con la técnica HC-SMoE (Hierarchical Clustering for Sparsely activated Mixture of Experts), presentada en el repositorio `wazenmai/HC-SMoE` (ICML 2025), que permite fusionar expertos mediante agrupamiento jerárquico sin reentrenamiento, reduciendo los parámetros de un modelo SMoE.

El modelo se distribuye en formato `safetensors` con un tamaño de repositorio de 17.0 GB y está etiquetado para `text-generation`. Sin embargo, la model card no incluye información sobre el desarrollador original, el proceso de entrenamiento, los datos utilizados, la licencia ni los idiomas soportados. Por tanto, la ficha se limita a los datos verificables y señala explícitamente lo que no está disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con activación dispersa |
| Parametros totales | 8.467.856.832 (8,47 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tamaño del repo sugiere FP16/BF16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada en la model card sobre la arquitectura interna, los datos de entrenamiento o el procedimiento de optimización. El nombre `ngroups24` y la referencia al repositorio HC-SMoE indican que el modelo probablemente se ha construido aplicando el framework de fusión de expertos sobre un modelo base `LFM2`. HC-SMoE emplea clustering jerárquico basado en las salidas de los expertos para reducir el número de parámetros sin necesidad de reentrenamiento. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que el modelo está diseñado para producir texto, aunque no hay documentación sobre la calidad o el comportamiento esperado.
- Razonamiento, programación, matemáticas, visión: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Otros modos especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

Al no existir documentación sobre las capacidades del modelo, los siguientes usos son potenciales, derivados de su naturaleza como modelo MoE de 8,47 mil millones de parámetros para generación de texto. Deben validarse experimentalmente antes de considerar cualquier aplicación en producción.

- Asistentes conversacionales: el modelo podría emplearse para construir chatbots de dominio general, aprovechando la arquitectura MoE para reducir el coste computacional por inferencia en comparación con un modelo denso del mismo tamaño. Requiere validación previa de la calidad y consistencia de las respuestas.
- Generación de contenido escrito: podría usarse para redactar artículos, resúmenes o documentación técnica, siempre que se evalúe su capacidad para mantener coherencia y evitar alucinaciones.
- Análisis de documentos largos: si la longitud de contexto lo permite, podría aplicarse a la extracción de información o el resumen de textos extensos. Esta capacidad no está confirmada.
- Soporte en tareas de código: como modelo de lenguaje general, podría explorarse su uso para completar o explicar fragmentos de código, aunque no hay evidencia específica.
- Prototipado de aplicaciones NLP: adecuado para experimentos académicos o pruebas internas donde se precise un modelo de tamaño medio con inferencia escalable.
- Investigación en ingeniería de modelos: al estar basado en una técnica de fusión de expertos sin reentrenamiento, puede servir como caso de estudio para comparar HC-SMoE con otros métodos de reducción de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 17.0 GB, lo que sugiere pesos en FP16/BF16. Para inferencia sin cuantizar se necesitarían aproximadamente 17-20 GB de VRAM. Con cuantizaciones, el consumo podría reducirse, pero no se proporcionan datos al respecto.
- GPU recomendadas: para FP16/BF16, son adecuadas GPUs con 24 GB o más, como RTX 4090, A100 40 GB o H100.
- Consumer GPU: sí, una RTX 3090 o RTX 4090 de 24 GB podría alojar el modelo sin cuantizar, aunque habría que comprobar la compatibilidad con la librería de inferencia.
- Opciones de despliegue: al ser pesos en safetensors y estar etiquetado con la librería `transformers`, puede desplegarse con vLLM, TGI o directamente con `transformers`. Requiere un runtime que soporte arquitecturas MoE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Se desconocen el modelo base original, los benchmarks y la licencia, por lo que no se puede establecer una comparación fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados.
- Riesgo de alucinación: sin datos sobre el entrenamiento, no se puede estimar; se asume riesgo estándar en modelos generativos.
- Limitaciones de contexto o idioma: desconocidas, lo que impide garantizar un comportamiento adecuado en tareas multilingües o con documentos largos.
- Restricciones de licencia: la licencia no está especificada, por lo que el uso comercial es incierto y requiere verificación legal.
- Model card vacío: la falta de documentación es un riesgo importante para su adopción en producción.
- Procedencia verificable: el autor (Dohyeon1) es un usuario individual, no una organización reconocida; se recomienda auditar el modelo antes de cualquier uso.

## Enlaces

- HuggingFace: https://huggingface.co/Dohyeon1/LFM2-HC-SMoE-ngroups24
- Repositorio del framework HC-SMoE: https://github.com/wazenmai/HC-SMoE
