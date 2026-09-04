# malaiwah/GLM-5.2-SIQ-Fruit-fp8

## Resumen

GLM-5.2-SIQ-Fruit-fp8 es una cuantización FP8 e4m3 block-scaled del modelo MoE GLM-5.2-SIQ-Fruit-bf16, desarrollada por malaiwah. Se trata de un fixture (accesorio de prueba) creado para ensayar la ruta candidata de la suite quant-fidelity, no una cuantización pensada para servir en producción. El modelo cuantiza todos los pesos de atención, indexer, MLP y expertos a FP8 e4m3 con una escala inversa FP32 por cada bloque de 128×128, manteniendo en BF16 los embeddings, la cabeza de salida, las normalizaciones, el router y el glue de MTP.

Con 5.040.368.896 parámetros totales y formato safetensors, está liberado bajo licencia MIT. Su relevancia actual radica en permitir evaluar la fidelidad de una cuantización FP8 block-scaled sobre una arquitectura MoE etiquetada como glm_moe_dsa, antes de su adopción en sistemas de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con atención DSA, según tags de HuggingFace; detalles no disponibles |
| Parametros totales | 5.040.368.896 |
| Parametros activos | no disponible (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 e4m3 block-scaled con escala inversa FP32 por bloques 128×128; embeddings, head, normalizaciones, router y MTP glue en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base corresponde a un modelo de mezcla de expertos (MoE) etiquetado como glm_moe_dsa, aunque no se han publicado especificaciones detalladas sobre el número de expertos, la dimensión de los estados ocultos o el mecanismo de atención. El modelo es una cuantización generada a partir del checkpoint `malaiwah/GLM-5.2-SIQ-Fruit-bf16` en el commit `ef68013aa6e16453cf52b5b77647f72fbe258c3c` mediante la herramienta `engines/tools/fp8_quantize.py`. Todos los pesos de atención, indexer, MLP y expertos se convierten a FP8 e4m3, con una escala inversa FP32 por bloque de 128×128 (escala = amax del bloque / 448, con rejilla rellenada por techo y bloques parciales conservados). Los embeddings, la cabeza de salida, las normalizaciones, el router y el glue de MTP permanecen en BF16 y se listan en `quantization_config.modules_to_not_convert`. En total se cuantizan 8588 tensores y 102 módulos permanecen nativos. No se proporcionan datos sobre el corpus de entrenamiento ni sobre procesos de alineación como RLHF o DPO.

## Capacidades

Al tratarse de un fixture de cuantización, no se han publicado capacidades funcionales específicas. Las capacidades del modelo son, en principio, las del modelo base `GLM-5.2-SIQ-Fruit-bf16`, pero no hay documentación al respecto en la información disponible.

- Generación de texto: no disponible.
- Razonamiento, código, matemáticas, visión: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- El modelo está diseñado para validar la fidelidad de la cuantización, no para tareas de inferencia.

## Casos de uso

- Evaluación de fidelidad de cuantización: el modelo permite comparar las salidas de la versión FP8 block-scaled con la versión BF16 original para medir el error de cuantización en cada capa y validar la calidad del esquema de escalas por bloque.
- Pruebas de regresión en pipelines de cuantización: al ser un fixture con un checkpoint base fijado a un commit concreto, se puede integrar en sistemas de integración continua para detectar cambios no deseados en el código de cuantización.
- Desarrollo y depuración de herramientas de cuantización: sirve como caso de prueba para implementar y verificar el soporte de FP8 e4m3 con escalas por bloque en librerías como vLLM, llama.cpp o TensorRT-LLM.
- Validación de kernels de cómputo en hardware: los pesos cuantizados permiten probar kernels de multiplicación de matrices en FP8 en GPUs compatibles (por ejemplo, H100 o RTX 4090) y comprobar la exactitud numérica frente a la BF16.
- Investigación sobre cuantización en modelos MoE: al ser un modelo MoE con atención DSA, resulta útil para estudiar cómo la cuantización afecta a las rutas de expertos y a los mecanismos de atención dispersa.
- Reproducción de experimentos de cuantización: el commit fijado del modelo base garantiza que cualquier experimento sobre el proceso de cuantización se pueda reproducir de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 5.040.368.896 parámetros en FP8, los pesos ocupan aproximadamente 5.04 GB (un byte por parámetro), más las escalas FP32 por bloque de 128×128, que añaden un pequeño overhead. El repositorio tiene un tamaño de 5.4 GB, lo que confirma esta estimación. Para inferencia se necesitaría además espacio para la caché KV y las activaciones, por lo que una GPU de 12-16 GB sería suficiente en una configuración básica.
- GPU recomendadas: no se han publicado recomendaciones oficiales. En principio, cualquier GPU con soporte para cómputo FP8 (Hopper o superior) podría ejecutar el modelo, aunque al ser un fixture no está optimizado para servir.
- ¿Cabe en GPU de consumo?: sí, una RTX 4090 de 24 GB podría alojar los pesos, pero no hay garantía de funcionamiento como servicio.
- Opciones de despliegue: no disponible. El modelo no está diseñado para ser servido; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de comparación no están disponibles. El modelo es un fixture de cuantización específico, por lo que no hay alternativas públicas con las que comparar en la misma categoría. Como referencia, el modelo base es `malaiwah/GLM-5.2-SIQ-Fruit-bf16`, del cual se diferencia por la cuantización FP8 block-scaled. Tampoco se han publicado resultados de benchmarks del modelo base en la información proporcionada.

## Limitaciones y advertencias

- Es un fixture de pruebas, no una cuantización para servir en producción; su objetivo es validar la ruta de cuantización de la suite quant-fidelity.
- No se han publicado datos sobre sesgos, alucinaciones, idiomas soportados ni límites de contexto.
- Al ser una cuantización de un modelo base no documentado, se desconocen los sesgos inherentes y el comportamiento en tareas de razonamiento o generación.
- La licencia MIT permite uso comercial, pero el modelo no está pensado para ser desplegado en sistemas reales.
- La cuantización FP8 e4m3 puede introducir pérdidas de precisión no evaluadas públicamente; no se ofrecen garantías de fidelidad.
- El repositorio no incluye información sobre el pipeline de transformadores ni sobre cómo cargar el modelo con las librerías habituales.

## Enlaces

- HuggingFace: https://huggingface.co/malaiwah/GLM-5.2-SIQ-Fruit-fp8
- Modelo base: https://huggingface.co/malaiwah/GLM-5.2-SIQ-Fruit
- No se han encontrado otros enlaces relevantes en la búsqueda web.
