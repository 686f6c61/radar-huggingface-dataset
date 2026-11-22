# malkolm777/zils-lite-p21-leader-shuffle

## Resumen

zils-lite-p21-leader-shuffle es un ajuste fino (fine-tune) del modelo base joamCriff123/zils-lite-l1117a, publicado por el usuario malkolm777 en Hugging Face. Se presenta como un "cuerpo de decisión" (decision body) de la familia d3-lite, orientado a tareas de selección entre opciones múltiples y razonamiento de tipo pregunta-respuesta. El modelo tiene 852.985.920 parámetros totales (aproximadamente 853 millones) según los pesos en safetensors, y se distribuye bajo licencia Apache 2.0.

El entrenamiento consistió en una única pasada de LoRA de rango 64 sobre 800 preguntas verificadas del conjunto P3, con 480 ejemplos con objetivos del profesor "Ultra" y 0 con objetivos del profesor "mini". La model card indica que el subconjunto verificado hace énfasis en artes, razonamiento, herramientas, lenguaje y recuperación, y que se aplicó un reetiquetado consistente a 500 ítems de opción múltiple. El modelo se etiqueta con el prefijo qwen3_5, lo que sugiere una arquitectura derivada de la familia Qwen, aunque no se detalla en la información disponible.

La relevancia de esta ficha es limitada: se trata de un modelo experimental con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica extensa. Aun así, se documenta su estructura y características para desarrolladores que necesiten evaluar su idoneidad en tareas de decisión con opciones múltiples.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3_5, no confirmado en detalle) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

La arquitectura no se describe en detalle en la model card. La etiqueta `qwen3_5` y el uso de `custom_code` indican que el modelo requiere código personalizado para su carga, probablemente por una variante de la arquitectura Qwen. El tamaño de 853 millones de parámetros y el formato safetensors son los únicos datos estructurales confirmados.

El entrenamiento consistió en una única pasada de LoRA de rango 64 sobre el modelo base joamCriff123/zils-lite-l1117a. Se usaron 800 preguntas verificadas del conjunto P3, con 480 ejemplos con objetivos del profesor "Ultra" y 0 con objetivos del profesor "mini". La tasa de aprendizaje fue 4e-05 y la semilla 3008. El conjunto de entrenamiento verificó un reetiquetado consistente de 500 ítems de opción múltiple. El SHA256 del JSONL de entrenamiento es 2d827ef3e12d740a3a79359163f7f46d6fe35dbcf680379100ffa9ee96c791ea. No se mencionan técnicas como RLHF, DPO o decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento de tipo decisión entre opciones múltiples.
- Énfasis declarado en artes, razonamiento, herramientas, lenguaje y recuperación (según el subconjunto verificado de entrenamiento).
- Soporte de tool calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Selección entre opciones múltiples en entornos educativos: el modelo puede usarse para responder preguntas de opción múltiple con un reetiquetado consistente, adecuado para evaluaciones automatizadas de bajo coste.
- Clasificación de respuestas en pipelines de anotación: dado su entrenamiento en preguntas verificadas, puede integrarse como clasificador de opciones en flujos de etiquetado semiautomático.
- Razonamiento ligero en asistentes de decisión: por su tamaño (853 M), puede desplegarse en entornos con recursos limitados para tareas de elección entre alternativas.
- Filtrado y recuperación de información: el énfasis en "retrieval" del subconjunto de entrenamiento sugiere uso en tareas de selección de pasajes o respuestas candidatas.
- Prototipado de sistemas de decisión con LoRA: al ser un fine-tune de bajo rango, sirve como ejemplo para experimentar con adaptaciones de modelos base pequeños.
- Evaluación de técnicas de reetiquetado: el modelo documenta un reetiquetado de 500 ítems, útil para estudiar el efecto de esta técnica en modelos de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB (853 M parámetros × 2 bytes), más overhead de activaciones y contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB; en 4 bits: aproximadamente 0,5 GB (estimaciones teóricas, no confirmadas para este modelo).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, etc.) debería poder cargarlo en fp16; para cuantizaciones, GPUs integradas o incluso CPU.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas.
- Opciones de despliegue: al requerir `custom_code`, es necesario usar `trust_remote_code=True` en Transformers; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-p21-leader-shuffle | 853 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| joamCriff123/zils-lite-l1117a (base) | no disponible | no disponible | no disponible | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32k (típico) | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B | 1.5 B | 32k (típico) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para este modelo. La comparativa se limita a parámetros y licencia; los datos de contexto y rendimiento de los modelos Qwen son orientativos y no confirmados para este fine-tune.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- Sin benchmarks publicados: no se puede evaluar su rendimiento frente a alternativas.
- Requiere `custom_code` y `trust_remote_code=True`: riesgo de seguridad al ejecutar código del autor.
- Idiomas no documentados: no se puede garantizar soporte multilingüe.
- Longitud de contexto no disponible: puede limitar tareas de contexto largo.
- Riesgo de alucinación: inherente a modelos de lenguaje pequeños sin RLHF documentado.
- Sesgos: no documentados; el entrenamiento con preguntas P3 puede introducir sesgos del conjunto.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar LICENSE y NOTICE para atribuciones upstream.
- El reetiquetado de 500 ítems puede introducir artefactos en las respuestas si el modelo aprendió patrones del etiquetado artificial.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-p21-leader-shuffle
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- No se han encontrado papers, blogs, repos o demos adicionales en la información disponible.
