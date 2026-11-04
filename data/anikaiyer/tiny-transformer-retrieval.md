# anikaiyer/tiny-transformer-retrieval

## Resumen

Tiny Transformer for Retrieval es un repositorio experimental publicado por el usuario anikaiyer en HuggingFace que contiene una implementación funcional de un transformer de recuperación (retrieval) en configuración denominada "large". No se trata de un modelo entrenado ni de un checkpoint con pesos ajustados: el propio autor indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests) y que no se presenta como un modelo con benchmarks. El repositorio prioriza código transparente y pruebas reproducibles.

El modelo emplea una arquitectura transformer con atención dispersa (sparse), fusión tipo Tucker, activación GELU-tanh y normalización por batch (batchnorm). El número total de parámetros registrado en los safetensors es de 24.832, una cifra extremadamente reducida que confirma su naturaleza de juguete o prueba de concepto, coherente con la denominación "tiny" pese a la etiqueta "large" de la configuración interna.

Su relevancia actual es limitada como modelo de producción, pero resulta útil como referencia educativa o como punto de partida reproducible para experimentos de recuperación multimodal, dado que el autor sugiere evaluar sobre Flickr30k. La licencia Apache 2.0 facilita su reutilización y modificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tiny Transformer con atención dispersa y fusión Tucker |
| Parámetros totales | 24.832 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo "tiny" en configuración interna "large", con mecanismo de atención dispersa (sparse attention), fusión mediante descomposición de Tucker, función de activación GELU-tanh y normalización por batch. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto, que emplea el optimizador LAMB con un schedule coseno. El autor advierte que estos valores son puntos de partida en el script y no evidencia de un entrenamiento completado.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El checkpoint incluido no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio. El autor recomienda que cualquier evaluación significativa entrene todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y sugiere Flickr30k como primer conjunto de evaluación, reportando la métrica de la tarea en al menos tres semillas e incluyendo una línea base de capacidad equivalente.

## Capacidades

- Implementación de referencia para tareas de recuperación (retrieval) multimodal, orientada a experimentación.
- Código Python ejecutable con punto de entrada de entrenamiento y ejemplo de evaluación (`eval.py`).
- Configuración de arquitectura registrada en `config.json` y receta de experimento en `training_args.json`.
- Checkpoint de inicialización válido para pruebas de humo, no para inferencia con calidad.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- No se documenta modo de pensamiento (thinking), audio ni otras capacidades especiales.

## Casos de uso

- Pruebas de humo de pipelines de retrieval: el checkpoint de inicialización permite verificar que el flujo de carga, preprocesado y evaluación funciona antes de invertir en entrenamiento real.
- Investigación educativa sobre arquitecturas transformer con atención dispersa: el código transparente facilita estudiar cómo se implementa la fusión Tucker y la normalización por batch en un transformer pequeño.
- Reproducción de experimentos controlados: la receta LAMB con schedule coseno y los ficheros de configuración permiten replicar condiciones de entrenamiento y comparar con líneas base de capacidad equivalente.
- Evaluación comparativa sobre Flickr30k: el autor sugiere este conjunto para medir la métrica de recuperación en al menos tres semillas, lo que sirve como protocolo de evaluación reproducible.
- Desarrollo de adaptadores de carga: al ser una implementación personalizada, requiere un adaptador explícito antes de usar APIs genéricas de carga, lo que lo convierte en un caso práctico para practicar la integración con frameworks estándar.
- Base para experimentos de retrieval en dominios específicos: partiendo del código y la configuración, un equipo puede adaptar la arquitectura y entrenar con sus propios datos, revisando por separado los términos de las fuentes externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las afirmaciones sobre benchmarks se omiten deliberadamente y que no se reclama ninguna puntuación en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado que el checkpoint contiene 24.832 parámetros; no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por capacidad; no se dispone de recomendaciones del autor.
- Cabe en GPU consumer: sí, con amplio margen, aunque no se han publicado pruebas de latencia ni throughput.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor señala que las APIs genéricas de carga automática requieren un adaptador explícito.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformers de recuperación de tamaño tiny con atención dispersa y fusión Tucker) con los que establecer una comparación fiable de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado: es una inicialización para pruebas de humo, no un modelo listo para producción.
- No ha sido auditado en robustez, equidad ni transferencia de dominio.
- No se declaran sesgos conocidos, pero la ausencia de entrenamiento y auditoría implica que no pueden descartarse.
- Riesgo de alucinación no evaluado; al no ser un modelo generativo entrenado, la noción de alucinación no aplica directamente, pero tampoco hay garantías de calidad en retrieval.
- Longitud de contexto e idiomas soportados no disponibles, lo que impide planificar su uso multilingüe o con documentos largos.
- La licencia Apache 2.0 permite uso comercial del código y los pesos, pero el autor advierte de revisar por separado los términos de las fuentes de datos externas que se utilicen.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse de forma separada de los valores por defecto incluidos en este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/anikaiyer/tiny-transformer-retrieval
