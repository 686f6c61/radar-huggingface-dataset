# bartscheffer/deepkit-code-reranker-gguf

## Resumen

Este modelo es una conversión GGUF del reranker Qwen3-Reranker-0.6B, preparada por el proyecto Deepkit Code para integrarlo en herramientas de búsqueda y recuperación aumentada. No es un modelo de lenguaje generativo, sino un cross-encoder de reranking que puntúa la relevancia de pares consulta-documento. El proyecto Deepkit Code mantiene la conversión, que incluye cuantizaciones Q8_0 y f16, y la distribuye bajo licencia Apache-2.0.

El modelo original, desarrollado por Qwen, tiene 595.778.560 parámetros. Esta versión GGUF conserva la arquitectura del modelo base y añade la capa de clasificación con etiquetas yes/no y un softmax nativo. Su utilidad principal es mejorar la precisión de pipelines de RAG al reordenar los candidatos recuperados por búsqueda vectorial. La integración de búsqueda en producción con Deepkit Code está aún en desarrollo. La longitud de contexto no se ha publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (cross-encoder de reranking) |
| Parametros totales | 595.778.560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, f16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de reranking basado en la arquitectura Transformer de Qwen3. En lugar de generar texto, procesa simultáneamente la consulta y el documento para producir una puntuación de relevancia. La capa de salida utiliza `cls.output.weight` y un pooling de tipo Rank con dos etiquetas de clasificación: `yes` y `no`. El modelo aplica softmax de forma nativa, de modo que la primera salida corresponde a P(yes). No se debe aplicar un segundo softmax ni normalizar L2.

No se proporcionan datos sobre el entrenamiento del modelo original; esta conversión no modifica los pesos del modelo base, solo los convierte al formato GGUF. Los scripts de conversión y las dependencias están documentados en el repositorio del proyecto, y la conversión Q8_0 se verificó como byte-idéntica en el entorno registrado.

## Capacidades

- Reranking de pares consulta-documento mediante puntuación de relevancia.
- Salida de probabilidades P(yes) y P(no) con softmax nativo.
- Compatibilidad con el formato GGUF y cuantizaciones Q8_0 y f16.
- Ejecución en CPU y GPU mediante llama.cpp o librerías compatibles.
- Verificado con pruebas de humo: pares relevantes puntúan >0.999 y pares irrelevantes <0.00002.
- Integración con Deepkit Code (en desarrollo) para búsqueda en repositorios de código.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reordenación en RAG: tras una recuperación inicial de 50-100 candidatos mediante embeddings, el modelo puntúa cada par consulta-documento y devuelve los 3-5 más relevantes, mejorando la precisión de la generación posterior.
- Búsqueda en documentación técnica: en bases de conocimiento de desarrollo, filtra fragmentos de API o guías que realmente responden a la consulta, reduciendo ruido en los resultados.
- Búsqueda en repositorios de código: con Deepkit Code, reordena archivos o funciones candidatas en proyectos de código abierto, priorizando las coincidencias más relevantes.
- Filtrado de respuestas en soporte técnico: clasifica respuestas generadas o preguntas frecuentes según su relevancia a un ticket concreto, permitiendo recomendar la mejor solución.
- Optimización de costes en RAG: al reducir el número de documentos enviados al LLM generativo, disminuye el consumo de tokens y la latencia del sistema.
- Evaluación de relevancia de documentos en sistemas de búsqueda interna: para portales corporativos o wikis, puntúa resultados de búsqueda semántica y los ordena por relevancia real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card documenta pruebas de humo realizadas en CPU con tres pares: un par relevante puntúa por encima de 0.999 y uno irrelevante por debajo de 0.00002. Estas pruebas verifican la integridad de los artefactos, pero no constituyen un benchmark de recuperación ni una garantía de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización f16, aproximadamente 1.2 GB; con Q8_0, aproximadamente 0.6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA RTX 3060 o superior. También puede ejecutarse en CPU.
- ¿Cabe en consumer GPU? Sí, es un modelo pequeño y cabe en GPUs de consumo.
- Opciones de despliegue: llama.cpp, bindings de llama.cpp en Python o Rust, e integración con Deepkit Code. También se puede usar con Ollama si se registra el modelo como un modelo de reranking.
- Latencia y throughput: no disponibles. Solo se indica que las pruebas de humo se realizaron en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| deepkit-code-reranker-gguf | 595.778.560 | GGUF (Q8_0, f16) | Apache-2.0 | No disponible | Conversión mantenida por Deepkit Code |
| Qwen3-Reranker-0.6B (original) | 595.778.560 | Safetensors | Apache-2.0 | No disponible | Modelo base oficial de Qwen |

No se dispone de benchmarks que permitan comparar este modelo con otros rerankers de tamaño similar. La comparativa más directa es con el modelo original, del que deriva, cuyas capacidades son idénticas. La diferencia radica en el formato GGUF y las cuantizaciones, que facilitan el despliegue en entornos de CPU.

## Limitaciones y advertencias

- Es un modelo de reranking, no un modelo generativo: no puede generar texto ni seguir instrucciones.
- No produce embeddings; no debe usarse para recuperación vectorial.
- La integración de búsqueda en Deepkit Code está en desarrollo y no se recomienda para producción todavía.
- Las pruebas de humo no son un benchmark de recuperación ni una garantía de rendimiento.
- No se han publicado métricas de rendimiento en tareas de RAG ni comparativas con otros rerankers.
- Los idiomas soportados no están especificados; se hereda del modelo base Qwen, pero no está confirmado.
- Puede producir falsos positivos en la puntuación de relevancia, especialmente en dominios fuera de los datos de entrenamiento.
- No hay información sobre sesgos o alucinaciones; al no generar texto, el riesgo de alucinación no aplica.

## Enlaces

- https://huggingface.co/bartscheffer/deepkit-code-reranker-gguf
- https://github.com/bartscheffer/deepkit-code
- https://github.com/bartscheffer/deepkit-code/tree/a5762f2/scripts/models
- https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- https://github.com/agentset-ai/awesome-rerankers
