# rodrigosdford/tiny-transformer-retrieval

## Resumen

`rodrigosdford/tiny-transformer-retrieval` es un repositorio experimental publicado en Hugging Face que contiene una implementación propia de un transformer de escala "nano" orientado a tareas de retrieval (recuperación de información multimodal, a juzgar por la recomendación de evaluar sobre Flickr30k). El autor es `rodrigosdford` y el paquete incluye el código del modelo (`run.py`), la configuración de arquitectura (`config.json`), la receta de entrenamiento por defecto (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`).

Es importante subrayar que, según la propia model card, el checkpoint incluido **no es un modelo entrenado**: se trata de una inicialización válida para pruebas de humo (smoke tests), no de un release con pesos entrenados ni evaluados. El repositorio no declara ningún resultado de benchmark ni pipeline de Hugging Face asociado.

Con 24.832 parámetros totales (verificado en los safetensors), se sitúa varios órdenes de magnitud por debajo de cualquier modelo de retrieval de producción. Su relevancia es, por tanto, didáctica y de reproducibilidad: sirve como punto de partida para experimentar con arquitecturas de atención grouped query, fusión tensorial y normalización InstanceNorm en un contexto de retrieval, no como componente listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención grouped query, fusión tensorial, activación GELU, normalización InstanceNorm) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8/INT4) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización, no entrenado) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de escala "nano" con atención de tipo grouped query (GQA), fusión tensorial, activación GELU y normalización InstanceNorm en lugar de LayerNorm. Esta combinación es poco habitual en transformers estándar y sugiere un diseño experimental orientado a explorar alternativas de normalización y fusión en tareas de retrieval. El repositorio incluye `config.json` con los parámetros de arquitectura generados y `training_args.json` con la receta por defecto: optimizador Adam y scheduler exponencial.

No se documenta ningún entrenamiento completado. La model card es explícita: los valores de la receta son "valores de partida en el script, no evidencia de una ejecución completada", y el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un checkpoint con benchmark. No se especifican número de tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO/alineación. La guía de evaluación del autor propone usar Flickr30k, reportar la métrica de la tarea en al menos tres semillas e incluir una baseline de capacidad equivalente.

## Capacidades

- No hay capacidades verificadas: el checkpoint no está entrenado, por lo que no genera texto, embeddings útiles ni recuperaciones con calidad medible.
- El código (`run.py`) implementa el modelo y un ejemplo ejecutable de prueba de humo; sirve como base para entrenar desde cero.
- Atención grouped query (GQA) implementada en la arquitectura, relevante para eficiencia en inferencia una vez entrenado.
- Fusión tensorial como mecanismo de combinación de representaciones (posiblemente para retrieval multimodal, dado el contexto de Flickr30k).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Pruebas de humo de pipelines de entrenamiento: usar el checkpoint de inicialización para verificar que el bucle de entrenamiento, la carga de datos y el guardado de pesos funcionan antes de lanzar experimentos reales.
- Reproducción de experimentos académicos: el repositorio incluye `config.json` y `training_args.json`, lo que permite replicar exactamente la configuración declarada por el autor en un entorno controlado.
- Estudio de alternativas de normalización: InstanceNorm frente a LayerNorm en transformers pequeños es un eje de investigación poco explorado; este código ofrece una base concreta para comparar.
- Experimentación con atención GQA en modelos de retrieval: permite medir el impacto de GQA en tareas de recuperación con un coste computacional mínimo.
- Benchmark sobre Flickr30k: la propia model card propone esta evaluación; el modelo serviría como baseline de baja capacidad en una comparativa con al menos tres semillas.
- Docencia y formación: un transformer de 24.832 parámetros es manejable para explicar atención, fusión y entrenamiento en un curso sin necesidad de GPUs.
- Prototipado de arquitecturas de retrieval multimodal: la combinación de fusión tensorial y GQA puede servir de banco de pruebas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "no se reclama ninguna puntuación de benchmark en este repositorio" y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización razonable; con 24.832 parámetros, los pesos en FP32 ocupan aproximadamente 0,1 MB.
- GPU recomendadas: cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobradamente suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer y en la mayoría de entornos embebidos.
- Opciones de despliegue: al ser una implementación custom, las APIs genéricas de carga automática (vLLM, TGI, Ollama) requieren un adaptador explícito. El uso previsto es ejecutar `python run.py --help` e inspeccionar el bloque `__main__` del script.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformers de retrieval de escala nano con inicialización no entrenada). Cualquier comparación con modelos de retrieval de producción (por ejemplo, familia BGE, E5 o CLIP) sería engañosa dado que este repositorio no contiene un modelo entrenado.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` no está entrenado ni auditado para robustez, equidad o transferencia de dominio; los resultados de cualquier uso directo serán aleatorios.
- No se declaran sesgos conocidos porque no hay modelo entrenado que evaluar; una vez entrenado, los sesgos dependerán del dataset utilizado.
- Riesgo de alucinación: no aplica en el estado actual (no genera texto), pero será relevante si se entrena para generación.
- Longitud de contexto e idiomas soportados no documentados.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin garantías; el autor advierte de revisar por separado los términos de los datos fuente si se usan datasets externos.
- Implementación custom: las APIs automáticas de Hugging Face (`AutoModel`, `pipeline`) no cargarán el modelo sin un adaptador explícito.
- Cualquier resultado publicado debe documentarse por separado del estado por defecto del repositorio, tal como indica el autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin señales de adopción ni mantenimiento por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/rodrigosdford/tiny-transformer-retrieval
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
