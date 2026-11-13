# green-coding/Green-Coding-Gemma4-12B-Q6_K

## Resumen

Green-Coding-Gemma4-12B-Q6_K es una cuantización en formato GGUF (tipo Q6_K) de un modelo de lenguaje de aproximadamente 11.900 millones de parámetros (11.907.350.576 según los pesos safetensors originales). Lo publica el usuario green-coding en Hugging Face y la nomenclatura del repositorio sugiere que deriva de un modelo de la familia Gemma, aunque la model card no aporta ninguna descripción técnica ni confirma la procedencia exacta de los pesos base. El repositorio se creó el 11 de noviembre de 2026 y se actualizó dos días después.

El modelo se distribuye bajo licencia MIT, lo que en principio facilita su uso comercial y su redistribución, y está etiquetado como compatible con endpoints y orientado a uso conversacional. El tamaño del repositorio es de 9,8 GB, coherente con una cuantización de 6 bits de un modelo de ~12B de parámetros.

La relevancia práctica de esta ficha es limitada: no hay información publicada sobre arquitectura, datos de entrenamiento, idiomas, benchmarks ni rendimiento, y el modelo no registra descargas ni interacciones. Cualquier evaluación en producción debería tratarse como una validación empírica desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura sugiere familia Gemma; sin confirmar) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q6_K (unica publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo. El nombre del repositorio incluye "Gemma4", lo que apunta a un modelo de la familia Gemma, pero la model card solo contiene la declaración de licencia MIT y no confirma la arquitectura, el número de capas, la dimensión de los embeddings ni el mecanismo de atención. Tampoco se especifica si emplea atención completa, atención con ventana deslizante u otro esquema.

Respecto al entrenamiento, se desconoce por completo el volumen de tokens, la composición del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, y cualquier innovación técnica asociada. El único dato verificable es el número de parámetros de los pesos safetensors originales y el hecho de que la versión distribuida aquí es una cuantización Q6_K, que reduce la precisión de los pesos a 6 bits por parámetro con el objetivo de disminuir el uso de memoria manteniendo una calidad cercana a la del modelo en precisión completa.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" del repositorio indica que está orientado a diálogo multi-turno, aunque no se detalla el formato de prompt ni las plantillas de chat.
- Razonamiento y conocimiento general: no disponible; no hay documentación que confirme capacidades específicas de razonamiento, matemáticas o código.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que el archivo GGUF puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face, pero no se aportan detalles.

## Casos de uso

- Despliegue local en estaciones de trabajo: al ser un GGUF Q6_K de ~12B, puede cargarse con llama.cpp u Ollama en equipos con suficiente memoria, lo que permite experimentar con un modelo conversacional sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales: la etiqueta "conversational" lo hace candidato para construir demos de chat multi-turno, siempre que se valide previamente la calidad de las respuestas y el formato de prompt esperado.
- Evaluación comparativa de cuantizaciones: sirve como punto de partida para medir la degradación de calidad de Q6_K frente a otras cuantizaciones (Q4_K_M, Q8_0) del mismo modelo base, si se dispone de él.
- Inferencia en entornos con GPU de gama alta para consumo: con ~9,8 GB de pesos, encaja en GPUs consumer con 12-16 GB de VRAM, lo que permite ejecutar el modelo completamente en GPU para tareas de generación de texto.
- Fines educativos y de investigación: útil para estudiar el comportamiento de modelos de ~12B cuantizados en tareas de comprensión y generación, dado que la licencia MIT facilita su uso en entornos académicos.
- Integración en pipelines internos de generación de texto: puede incorporarse como componente de resumen o redacción dentro de flujos automatizados, sujeto a una validación de calidad previa, ya que no hay benchmarks que respalden su rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q6_K ocupa aproximadamente 9,8 GB, por lo que se necesitan al menos 10-11 GB de VRAM para cargarlo completo en GPU, más espacio para el contexto KV.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para despliegues de mayor concurrencia.
- GPU consumer: cabe en tarjetas con 12 GB o más de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080); en GPUs de 8 GB requeriría descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la etiqueta "endpoints_compatible" sugiere compatibilidad con la infraestructura de endpoints de Hugging Face. No se confirma soporte de vLLM o TGI para este archivo.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Green-Coding-Gemma4-12B-Q6_K | ~11,9B | no disponible | GGUF Q6_K | MIT | Hugging Face (0 descargas) |
| Modelo base Gemma (familia, sin confirmar) | no disponible | no disponible | safetensors | no disponible | no disponible |
| Otras cuantizaciones del mismo base (Q4_K_M, Q8_0) | ~11,9B | no disponible | GGUF | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría; los datos del modelo base y de otras cuantizaciones no están publicados en la información disponible.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe arquitectura, entrenamiento, idiomas ni formato de prompt, lo que dificulta su uso correcto en producción.
- Procedencia incierta: el nombre sugiere un modelo Gemma, pero no se confirma la relación con los pesos originales ni la autoría del modelo base.
- Riesgo de alucinación: sin benchmarks ni evaluación publicada, no hay evidencia sobre la fiabilidad factual del modelo.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés.
- Cuantización Q6_K: introduce una pérdida de precisión respecto al modelo original; el impacto en calidad no está medido.
- Licencia MIT: permite uso comercial y redistribución, pero conviene verificar que la licencia del modelo base sea compatible, ya que la model card no lo aclara.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay retroalimentación de otros usuarios.

## Enlaces

- Hugging Face: https://huggingface.co/green-coding/Green-Coding-Gemma4-12B-Q6_K
