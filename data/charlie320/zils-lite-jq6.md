# Charlie320/zils-lite-jq6

## Resumen

zils-lite-jq6 es un ajuste fino (fine-tune) de Qwen/Qwen3.5-0.8B publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo) destinado al pool de modelos tipo "soup" denominado Zils `d3-lite`, asociado a la subred 127 de Bittensor. El modelo tiene 852.985.920 parámetros (aproximadamente 0,85 mil millones) y se distribuye en formato safetensors con pesos en BF16, bajo licencia Apache-2.0.

El proceso de construcción es un "soup fine-tune": se parte de la media aritmética uniforme de los pesos de dos cuerpos previos del pool (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc), y sobre esa media se realizan seis ajustes LoRA de rango 32 (fusionados) con semillas distintas, que después se promedian de nuevo con pesos iguales. El entrenamiento es una destilación sin etiquetas: los objetivos son las probabilidades de respuesta del promedio "soup" actual del pool `d3-mini`, que actúa como profesor.

La relevancia de este modelo es acotada y muy específica: no es un modelo de propósito general pensado para uso directo, sino un componente de un ecosistema de modelos "decision" orientados a la subred de Bittensor. Su interés principal radica en documentar una técnica de agregación de pesos (model soup) combinada con destilación blanda y ajuste LoRA, más que en sus capacidades intrínsecas, sobre las que la información disponible es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B; incluye torre de visión heredada del padre) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (la model card indica "language weights trained" sin especificar idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. El modelo conserva la torre de visión del modelo padre, según indica la model card, y los pesos de lenguaje han sido entrenados. El repositorio ocupa 1,7 GB y contiene únicamente pesos en BF16.

El entrenamiento sigue un procedimiento de agregación en dos fases. Primero se calcula la media uniforme de los pesos de dos cuerpos del pool `d3-lite` del 14 de noviembre de 2026. Sobre esa media se ejecutan seis ajustes LoRA de rango 32 (posteriormente fusionados) con semillas diferentes: tres sobre 30.000 filas y tres sobre 45.913 filas, con una sola pasada cada uno y una tasa de aprendizaje de 5e-5. Finalmente, los seis resultados se promedian uniformemente con pesos iguales. Los objetivos de entrenamiento son blandos y sin etiquetas: las probabilidades de respuesta del promedio "soup" actual del pool `d3-mini` (media uniforme de Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b), es decir, destilación desde un profesor de mayor tamaño dentro del mismo ecosistema.

Los datos de entrenamiento provienen del split de entrenamiento de tasksource/tasksource-jev-typed-decisions (unas 630 tareas fuente), filtrado para incluir solo fuentes con metadatos de licencia comercial o no especificada, excluyendo fuentes no comerciales, tareas cuyo nombre coincide con tareas de BIG-bench y filas de Glaive. Las filas se usan únicamente como entradas de destilación sin etiquetas; no se emplearon sus etiquetas. Según el autor, no se usaron ítems de examen escritos, ítems de examen del validador, ítems de examen semilla públicos ni datos de clientes.

## Capacidades

- Generación de texto y modelado de lenguaje: al derivar de Qwen3.5-0.8B, conserva la capacidad base de generación, aunque no hay evaluación publicada de su calidad tras el ajuste.
- Modelo de decisión: la etiqueta "decision-model" y el entrenamiento sobre tasksource-jev-typed-decisions sugieren un uso orientado a tareas de decisión tipadas, sin que la model card detalle el formato exacto de salida.
- Capacidades multimodales: la model card indica que conserva la torre de visión del modelo padre, por lo que en principio mantiene entrada visual, aunque no se documenta su rendimiento.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card menciona "language weights trained" sin especificar idiomas.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Componente de un pool de modelos "soup": el uso previsto es servir como cuerpo dentro del pool Zils `d3-lite` de la subred 127 de Bittensor, donde se agrega con otros cuerpos mediante promediado de pesos. Es su aplicación principal y la única documentada por el autor.
- Destilación y agregación de pesos como técnica reproducible: el repositorio sirve como ejemplo práctico de combinación de model soup, LoRA de rango 32 y destilación blanda sin etiquetas para investigadores que quieran replicar el procedimiento sobre otros modelos base.
- Experimentación con modelos pequeños en local: con 0,85 mil millones de parámetros y pesos BF16, puede cargarse en GPUs de consumo para pruebas de inferencia, siempre que se acepte la ausencia de evaluaciones publicadas.
- Clasificación o decisión sobre datos tabulares o de tareas tipadas: dado el dataset de entrenamiento (tasksource-jev-typed-decisions), podría explorarse en tareas de decisión estructurada, aunque sin garantías de calidad al no haber benchmarks.
- Investigación sobre linaje de modelos: permite estudiar cómo se propaga el comportamiento al promediar cuerpos derivados de un mismo modelo base y aplicar ajustes LoRA posteriores.
- Prototipado multimodal ligero: la torre de visión heredada permite experimentar con entrada de imágenes en un modelo de menos de mil millones de parámetros, aunque su rendimiento no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 5 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9-1,2 GB para pesos; en 4 bits, alrededor de 0,5-0,7 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, con holgura, incluidas GPUs de gama media con 8 GB o más.
- Opciones de despliegue: al ser un transformer estándar en safetensors, es compatible en principio con vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama y Transformers; no hay confirmación del autor sobre compatibilidad con cada uno.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-jq6 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune soup de Qwen3.5-0.8B para el pool Zils d3-lite |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones | no disponible en la informacion | no disponible en la informacion | Hugging Face | Modelo base del que deriva |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo previo del pool, usado como punto de partida |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo previo del pool, usado como punto de partida |

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, métricas ni comparaciones publicadas, por lo que no puede afirmarse nada sobre su calidad real frente al modelo base.
- Modelo de nicho: está diseñado como componente de un pool de Bittensor, no como modelo de propósito general; su comportamiento fuera de ese contexto es incierto.
- Riesgo de alucinación: al ser un modelo de 0,85 mil millones de parámetros, la tasa de alucinación es previsiblemente alta en tareas abiertas, aunque no hay mediciones.
- Sesgos: los datos de entrenamiento provienen de tasksource con filtros de licencia, pero no se documenta ningún análisis de sesgo ni mitigación.
- Idiomas: no se especifican los idiomas soportados; el rendimiento fuera del inglés (si el dataset es mayoritariamente inglés) podría ser deficiente.
- Licencia: Apache-2.0 permite uso comercial, pero el autor advierte de que deben revisarse los términos de los datasets de origen antes de reutilizar el modelo.
- Trazabilidad del linaje: al ser un promedio de pesos de varios modelos, la atribución y la reproducibilidad exacta dependen de los repositorios intermedios, algunos de los cuales podrían no estar disponibles.
- Sin garantías de producción: no hay información sobre robustez, seguridad, filtrado de contenido ni comportamiento en despliegues reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-jq6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo del pool: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Cuerpo previo del pool: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Profesor de destilación (componente): https://huggingface.co/Zayaan/zils-mini-hm4
- Profesor de destilación (componente): https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Profesor de destilación (componente): https://huggingface.co/joamCriff123/zils-mini-m1113b
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
