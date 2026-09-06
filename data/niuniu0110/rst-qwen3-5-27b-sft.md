# NiuNiu0110/rst-qwen3.5-27b-sft

## Resumen

rst-qwen3.5-27b-sft es un modelo de lenguaje multimodal desarrollado por NiuNiu0110, resultado de un fine-tune supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-27B. El objetivo es mejorar el rendimiento en tareas de terminal de larga duración mediante un pipeline de síntesis recursiva (Recursive Synthesis for Long-Horizon Terminal Tasks, RST). El modelo está pensado para actuar como agente en entornos de terminal, donde necesita descomponer tareas complejas en pasos recursivos y gestionar interacciones largas con el sistema.

La arquitectura es Qwen3_5ForConditionalGeneration, una variante multimodal (image-text-to-text) con un vision tower y una pila de texto. El modelo tiene 27.781.427.952 parámetros (aproximadamente 27.78B), no es un modelo de mezcla de expertos (MoE) y sus pesos se distribuyen en safetensors en bfloat16. La longitud de contexto no está especificada en la información disponible. Este checkpoint es un artefacto de entrenamiento sin benchmarks publicados, lo que el autor indica explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (multimodal imagen-texto) |
| Parámetros totales | 27.781.427.952 (27,78 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (corpus de entrenamiento en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es Qwen3_5ForConditionalGeneration, propia de la familia Qwen3.5. El modelo es multimodal: incluye un vision tower de 333 tensores copiado sin modificaciones del modelo base, y una pila de texto que es la que se entrena. Según la model card, el fine-tune se realizó con verl + FSDP2 sobre un corpus pre-tokenizado del dataset NiuNiu0110/RST-SFT-Qwen3.5-27B. La máscara de pérdida de Qwen3.5 se incorpora a los datos una sola vez (en el script 15_export_pretokenized.py) en lugar de recalcularse en cada backend, porque tokenizar por separado y concatenar no reproduce el render completo de la conversación para esta plantilla.

El proceso de exportación de los pesos es particular: verl escribe shards de FSDP que from_pretrained no puede cargar directamente. El checkpoint se generó con scripts/08_prepare_eval_ckpt.sh, que fusiona todos los shards, vuelve a insertar el vision tower desde el modelo base (el entrenamiento solo toca la pila de texto) y verifica que los pesos de texto realmente se movieron. Esta verificación es necesaria porque una fusión sobre un shard faltante produce un modelo cargable pero parcialmente sin entrenar, y una fusión que reproduce el modelo base es indistinguible de una exitosa sin esa comprobación.

## Capacidades

- Generación multimodal: procesa entradas de imagen y texto (pipeline image-text-to-text), lo que permite interactuar con capturas de pantalla, diagramas o interfaces gráficas junto con texto.
- Agente de terminal: diseñado para tareas de terminal de larga duración mediante síntesis recursiva de trayectorias (RST).
- Conversacional: etiquetado como "conversational", entrenado con SFT para mantener diálogos multi-turno.
- Razonamiento recursivo: el pipeline RST genera trayectorias recursivas para descomponer tareas largas en subpasos, lo que facilita la planificación en entornos de agente.
- Soporte de tool calling: no documentado explícitamente en la model card. No se puede afirmar su soporte.
- Idiomas: el corpus de entrenamiento está en inglés; no se especifican otros idiomas en la información.

## Casos de uso

- Automatización de operaciones de terminal: el modelo puede ejecutar secuencias de comandos y responder a salidas del sistema en sesiones largas, descomponiendo la tarea en pasos recursivos gracias al entrenamiento en trayectorias RST.
- Gestión de servidores y despliegues: útil para administrar servidores, lanzar scripts de despliegue y resolver errores en entornos de CI/CD, aprovechando su capacidad para mantener el contexto de la sesión.
- Análisis de logs y diagnóstico: interpreta salidas de comandos, logs y mensajes de error para sugerir acciones correctivas, combinando la información textual con capturas de pantalla si es necesario.
- Asistente de DevOps: puede integrarse en pipelines de automatización para tareas de mantenimiento, monitorización y resolución de incidencias, donde la síntesis recursiva ayuda a dividir problemas complejos en pasos manejables.
- Educación en sistemas operativos: genera explicaciones paso a paso de comandos de terminal y su funcionamiento, combinando texto e imágenes, lo que resulta adecuado para material didáctico.
- Automatización de tareas de investigación: al ser multimodal, puede analizar capturas de pantalla de interfaces de terminal y texto para ejecutar flujos de trabajo complejos, como la ejecución de experimentos o la recopilación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la model card indica explícitamente que no se ha ejecutado ningún benchmark contra este checkpoint y que debe tratarse como un artefacto no probado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 55,6 GB (27.781.427.952 parámetros × 2 bytes). Con overhead de KV cache, activaciones y el vision tower, se recomienda al menos 80 GB de VRAM para una inferencia completa en una sola GPU.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones con varias GPU (por ejemplo, 2 × RTX 4090 con paralelismo de modelo).
- GPU de consumo: no cabe en una GPU de 24 GB sin cuantización, y no se han publicado cuantizaciones del modelo.
- Opciones de despliegue: transformers (AutoModelForImageTextToText, AutoProcessor) y Hugging Face Inference Endpoints (según la etiqueta endpoints_compatible). No se documenta compatibilidad con vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la información disponible. El modelo es un fine-tune de Qwen/Qwen3.5-27B, pero no existen datos de rendimiento que permitan compararlo con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Sin benchmarks ejecutados: el autor lo declara como "untested artifact" de un run de entrenamiento; no hay ningún score que respalde su calidad.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar comandos o scripts incorrectos, lo que en tareas de terminal puede provocar errores en sistemas reales.
- Sesgos no evaluados: no se ha realizado ninguna evaluación de sesgos, seguridad o robustez.
- Especialización en tareas de terminal: el entrenamiento está centrado en trayectorias RST para terminal, por lo que su generalización a otros dominios (p. ej., generación de código genérico, conversación abierta) no está verificada.
- Limitación de idiomas: el corpus está en inglés; no se ha validado el comportamiento en otros idiomas.
- Licencia Apache-2.0: permite uso comercial, pero al no estar validado, no se recomienda su uso en producción sin una evaluación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NiuNiu0110/rst-qwen3.5-27b-sft
- Dataset de entrenamiento SFT: https://huggingface.co/datasets/NiuNiu0110/RST-SFT-Qwen3.5-27B
- Dataset DPO relacionado: https://huggingface.co/datasets/NiuNiu0110/RST-DPO-Qwen3.5-27B
- Repositorio del pipeline RST-Train: https://github.com/k1ssloo/RST-Train
- Paper (según búsqueda web): arxiv:2608.05466
