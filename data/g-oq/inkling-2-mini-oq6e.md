# g-oQ/Inkling-2-Mini-oQ6e

## Resumen

Inkling-2-Mini-oQ6e es una cuantización mixta del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario g-oQ mediante la herramienta oQ (oMLX v0.8.2). Se distribuye en formato MLX, es decir, orientada a la inferencia en hardware Apple Silicon (chips M-series), y emplea una asignación de precisión heterogénea por capas: la mayor parte de los pesos se almacena en NVFP4 de 4,5 bits efectivos, mientras que un subconjunto reducido se conserva en 6, 8, 16 y 32 bits para preservar la calidad en las capas más sensibles.

El checkpoint contiene 26.388.646.400 parámetros en el modelo de lenguaje y unos 318 millones adicionales en el módulo de visión, lo que sitúa el total lógico en torno a 26.707 millones de parámetros y un tamaño de repositorio de 17,9 GB. Es, por tanto, un modelo multimodal de ~26B que cabe en equipos de consumo con memoria unificada de 32 GB o superior, algo poco habitual en esta franja de tamaño.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización mixta que prioriza el ahorro de memoria sin degradar capas críticas; por otro, advierte de que se trata de una publicación de terceros con cero descargas y sin model card sustantiva del autor original, por lo que los datos de arquitectura, entrenamiento, benchmarks y licencia del modelo base no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal con módulo de visión, inferido de la estructura de pesos; detalles no publicados) |
| Parametros totales | 26.388.646.400 (lenguaje) + 0,318B (visión) = ~26.707B lógicos |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: NVFP4 grupo 16 (4,50 bits/peso), affine 6-bit grupo 64 (6,50), affine 8-bit grupo 64 (8,50), BF16 (16,00), FP32 (32,00); media efectiva 5,352 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería mlx) |
| Tamano del repositorio | 17,9 GB (16,640 GiB de pesos) |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Herramienta de cuantizacion | oQ / oMLX v0.8.2 |
| Fecha de publicacion | 2026-11-21 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Inkling-2-Mini: ni el tipo de transformer, ni si emplea atención lineal, mezcla de expertos o mecanismos híbridos. Lo que sí se deduce de la estructura del checkpoint es que se trata de un modelo multimodal: el desglose de almacenamiento separa un componente de lenguaje de 26.388B de parámetros y un componente de visión de 0.318B, ambos cuantizados con la misma política mixta. La etiqueta `inkling2_loop` en los tags de Hugging Face sugiere algún tipo de mecanismo recurrente o iterativo, pero no hay documentación que lo confirme.

Respecto al entrenamiento, no hay datos sobre número de tokens, composición del dataset, fases de RLHF/DPO ni innovaciones técnicas del modelo original. La única información técnica verificable corresponde al proceso de cuantización: oQ asigna precisión por tensor según su sensibilidad, de modo que el 76,3% de los pesos lógicos (20.384B) se comprime a NVFP4 con grupo de 16, el 15,3% (4.077B) se mantiene en affine 6-bit con grupo de 64, el 5,9% (1.572B) en affine 8-bit, el 2,4% (0.637B) en BF16 y un residual del 0,13% (0.036B) en FP32. El resultado es un checkpoint de 16,640 GiB con una media de 5,352 bits por peso, lo que supone una reducción aproximada del 66% frente a un almacenamiento BF16 equivalente.

## Capacidades

- Generación de texto y razonamiento general: el componente de lenguaje de 26,4B parámetros es el núcleo del modelo, aunque no se detallan sus capacidades específicas.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,318B parámetros, lo que indica soporte para entrada de imágenes, si bien no se especifican tareas concretas (VQA, OCR, captioning, etc.).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas en la model card.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades de audio: no disponible.
- Cuantización selectiva: la propia publicación demuestra la capacidad de ejecutar el modelo con precisión mixta en MLX, preservando capas en 8, 16 y 32 bits.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 16,6 GiB cabe en equipos Apple Silicon de 32 GB o más (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max), lo que permite ejecutar un modelo de ~26B multimodal sin GPU dedicada. Es el caso de uso principal de esta publicación.
- Prototipado de aplicaciones multimodales en escritorio: gracias al módulo de visión y al formato MLX, se puede integrar en herramientas locales de análisis de imágenes o documentos sin depender de servicios en la nube.
- Evaluación de técnicas de cuantización mixta: investigadores que estudien el impacto de NVFP4 frente a affine 6/8-bit pueden usar este checkpoint como referencia reproducible con oMLX.
- Desarrollo de asistentes offline con requisitos de privacidad: al ejecutarse íntegramente en local, es adecuado para entornos donde los datos no pueden salir del dispositivo (sanidad, legal, industria).
- Experimentación con modelos de ~26B en formato MLX: sirve como banco de pruebas para pipelines de `mlx-lm` y para comparar rendimiento frente a cuantizaciones GGUF equivalentes.
- Fine-tuning ligero o adaptación posterior: aunque el checkpoint está cuantizado, puede servir como base para estudiar técnicas de adaptación sobre pesos de baja precisión, siempre que la licencia del modelo base lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint únicamente documenta la distribución de bits y el desglose de almacenamiento; no incluye métricas de calidad (perplejidad, MMLU, HumanEval, GSM8K, MMMU) ni comparaciones con el modelo base en BF16.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,6 GiB solo para pesos; con overhead de contexto y buffers de activación, se recomienda un mínimo de 24-32 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 en variantes Pro, Max o Ultra). La librería `mlx` no está pensada para GPUs NVIDIA o AMD.
- ¿Cabe en GPU de consumo? No en el sentido habitual: no es un checkpoint para CUDA. En Apple Silicon, sí cabe en equipos con 32 GB o más; en configuraciones de 16 GB quedaría muy justo o directamente fuera de rango.
- Opciones de despliegue: `mlx-lm` y el ecosistema oMLX (oQ). No es compatible directamente con vLLM, llama.cpp, Ollama o TGI, que esperan formatos GGUF, safetensors estándar o arquitecturas CUDA.
- Latencia y throughput: no disponibles. Dependerán del chip concreto (M3 Max vs M1 Pro), del ancho de banda de memoria y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ6e | ~26,7B (26,4B lenguaje + 0,3B visión) | no disponible | MLX safetensors, 5,35 bits/peso | no disponible | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini (base) | ~26,7B (según checkpoint derivado) | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| Alternativas de ~27B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre el modelo base ni sobre alternativas comparables en la misma franja de tamaño y formato para establecer una comparativa rigurosa de rendimiento. Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Publicación de terceros: el checkpoint lo ha generado el usuario g-oQ, no el equipo de Thinking Machines. No hay garantía de que la cuantización preserve la calidad del modelo original.
- Sin model card sustantiva: no se documentan sesgos, datos de entrenamiento, idiomas ni evaluación de riesgos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación publicada que lo cuantifique.
- Sesgos: desconocidos, al no haber documentación sobre la composición del dataset de entrenamiento.
- Restricciones de plataforma: el formato MLX limita la ejecución a Apple Silicon; no es portable a CUDA ni a CPU convencional sin reconversión.
- Cuantización agresiva en la mayoría de capas: el 76,3% de los pesos está en NVFP4 (4,5 bits efectivos), lo que puede degradar tareas sensibles a la precisión numérica (matemáticas, código, razonamiento de cadena larga) en comparación con el modelo en BF16.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni validación externa de la calidad del checkpoint.
- Contexto desconocido: no se puede planificar el uso en escenarios de contexto largo sin conocer la ventana máxima del modelo base.
- Idiomas no declarados: no se puede asumir un rendimiento multilingüe sin verificación empírica.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/g-oQ/Inkling-2-Mini-oQ6e
- Modelo base referenciado: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Documentación de MLX: no disponible en la información proporcionada
- Paper del modelo base: no disponible
- Blog o demo oficial: no disponible
