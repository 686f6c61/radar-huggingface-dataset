# cam-dupo/retrieval-rc1

## Resumen

`cam-dupo/retrieval-rc1` es un repositorio de investigación publicado en HuggingFace que contiene un prototipo de modelo ALBEF (Align Before Fuse) orientado a tareas de recuperación (retrieval) multimodal. Lo desarrolla el usuario cam-dupo y se distribuye bajo licencia Apache 2.0. El repositorio incluye un script Python (`predict.py`), un `config.json` con la configuración de arquitectura, un `training_args.json` con la receta de experimento por defecto y un checkpoint de inicialización en formato safetensors.

Es importante subrayar que el propio autor declara explícitamente que el checkpoint incluido **no ha sido entrenado** ni evaluado: se trata de una inicialización válida para pruebas de humo (smoke tests), no de un modelo con rendimiento demostrado. La model card indica que no se reclama ninguna puntuación de benchmark y que cualquier resultado futuro deberá documentarse por separado.

El interés del repositorio es, por tanto, como punto de partida reproducible para experimentación con arquitecturas ALBEF en tareas de retrieval (por ejemplo, recuperación imagen-texto), no como modelo listo para producción. El tamaño declarado del repositorio es de 0.0 GB y el recuento de parámetros en safetensors es de 16.576, lo que sugiere que el checkpoint incluido es meramente simbólico o de inicialización mínima, no un modelo "giant" completamente materializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBEF (Align Before Fuse) |
| Parametros totales | 16.576 (según safetensors; el checkpoint no representa un modelo "giant" completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura declarada es ALBEF, un modelo multimodal de tipo "align before fuse" que combina un codificador de imagen y un codificador de texto con un mecanismo de fusión basado en *tucker* (según la tabla de la model card). La configuración indica atención de tipo *flash*, activación *gelu tanh* y normalización *rmsnorm*. La escala declarada es "giant", aunque el checkpoint incluido no materializa esos parámetros (16.576 parámetros en safetensors).

Respecto al entrenamiento, la receta por defecto usa el optimizador Adam con un esquema de *constant warmup*. El autor advierte que estos son valores de partida del script y no evidencia de un entrenamiento completado. No se especifican número de tokens, composición del dataset, ni si hubo RLHF/DPO. La model card sugiere evaluar sobre Flickr30k reportando la métrica de la tarea en al menos tres semillas y con una línea base de capacidad comparable.

## Capacidades

- Recuperación multimodal (retrieval) imagen-texto como tarea objetivo declarada.
- Implementación personalizada en PyTorch con punto de entrada ejecutable (`predict.py`).
- No se documentan capacidades de generación de texto, razonamiento, código o matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking, visión, audio) más allá de la propia naturaleza multimodal del enfoque ALBEF.

## Casos de uso

- Pruebas de humo de pipeline: usar `predict.py` para verificar que la carga del checkpoint y el flujo de inferencia funcionan antes de invertir en entrenamiento real.
- Investigación reproducible en retrieval: servir como base para entrenar y comparar variantes ALBEF sobre Flickr30k con semillas controladas.
- Estudio de mecanismos de fusión: experimentar con la fusión *tucker* y la combinación de atención *flash* y normalización *rmsnorm* en tareas de alineación imagen-texto.
- Docencia y formación: ejemplo didáctico de estructura de repositorio (config, training_args, checkpoint) para quienes aprenden a publicar modelos de investigación.
- Base para adaptadores personalizados: al requerir un adaptador explícito para APIs de carga automática, sirve para practicar la integración de implementaciones custom en frameworks propios.
- Punto de partida para ablaciones: comparar recetas de entrenamiento (Adam con constant warmup frente a alternativas) manteniendo el mismo presupuesto de datos y ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el checkpoint incluido es de inicialización y no refleja un modelo "giant" completo).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la model card señala que, al ser una implementación custom, las APIs genéricas de carga automática requieren un adaptador explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Estado |
|---|---|---|---|---|---|
| cam-dupo/retrieval-rc1 | 16.576 (safetensors) | no disponible | sin benchmarks publicados | Apache 2.0 | prototipo sin entrenar |
| ALBEF (original, Salesforce) | no disponible en esta ficha | no disponible | no disponible en esta ficha | no disponible en esta ficha | modelo de referencia publicado |
| Alternativas de retrieval imagen-texto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicialización para smoke tests, no un modelo utilizable en producción.
- No hay benchmarks ni auditoría de robustez, equidad o transferencia de dominio.
- El recuento de parámetros (16.576) no concuerda con la escala "giant" declarada, lo que indica que el artefacto publicado no representa el modelo completo.
- Implementación custom: las APIs de carga automática (por ejemplo, `AutoModel`) requieren un adaptador explícito.
- Riesgo de alucinación y sesgos: no evaluados.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide garantizar cobertura multilingüe o conversaciones largas.
- Licencia Apache 2.0 permite uso comercial del código y pesos, pero deben revisarse por separado los términos de los datos externos que se utilicen.
- Cualquier resultado obtenido con un checkpoint futuro entrenado debe documentarse de forma separada a los valores por defecto aquí incluidos.

## Enlaces

- HuggingFace: https://huggingface.co/cam-dupo/retrieval-rc1
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
