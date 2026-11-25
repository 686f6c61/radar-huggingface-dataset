# husnainbinmunawar/polyretrieve-gutenberg-experimental

## Resumen

PolyRetrieve Gutenberg projection retriever es un artefacto de investigación publicado en Hugging Face por el usuario husnainbinmunawar. Se trata de un retriever de doble proyección (dual-projection) entrenado sobre características de n-gramas de caracteres extraídas de un corpus real de párrafos de Project Gutenberg, concretamente del ebook 1342 (Orgullo y prejuicio de Jane Austen). El modelo resuelve la tarea de recuperación de texto (text-retrieval) y está diseñado explícitamente para ejecutarse en CPU.

Su relevancia no reside en el rendimiento, sino en el resultado negativo que documenta: sobre 304 párrafos cronológicamente reservados (held-out), el retriever aprendido alcanza Recall@1 de 0,5329 y Recall@5 de 0,7599, mientras que una línea base léxica de coseno simple alcanza 1,0 en ambos cortes. El autor declara que este resultado negativo es intencionado y que la proyección aprendida no se promociona por encima de la línea base.

Con solo 147.840 parámetros totales y un tamaño de repositorio de 0,0 GB, el modelo es un experimento académico de escala mínima, no un sistema de búsqueda multilingüe ni de producción. La model card lo describe como un artefacto de investigación para CPU y advierte que el texto fuente no se incluye en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Retriever de doble proyección sobre características de n-gramas de caracteres |
| Parámetros totales | 147.840 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La arquitectura es un retriever de doble proyección que opera sobre características de n-gramas de caracteres. El modelo proyecta consultas y documentos a un espacio común mediante dos proyecciones aprendidas, partiendo de representaciones léxicas basadas en n-gramas de caracteres en lugar de embeddings densos preentrenados. El tamaño total de 147.840 parámetros confirma que se trata de una arquitectura de escala muy reducida, coherente con un experimento controlado y ejecutable en CPU.

El entrenamiento se realizó sobre un corpus de párrafos de Project Gutenberg (ebook 1342). La evaluación se llevó a cabo sobre 304 párrafos cronológicamente reservados, lo que sugiere una partición temporal del corpus para evitar filtración de información. No se dispone de datos sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre el uso de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Recuperación de texto (text-retrieval) sobre pares consulta-documento mediante proyección aprendida de n-gramas de caracteres.
- Ejecución en CPU, sin requisitos de GPU.
- Entrenamiento e inferencia de escala mínima (147.840 parámetros), apto para experimentación rápida.
- Evaluación documentada con métricas de Recall@1 y Recall@5 sobre un conjunto held-out cronológico.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües documentadas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reproducción de experimentos de recuperación léxica: el modelo sirve como referencia para comparar una proyección aprendida frente a una línea base de coseno léxico en un corpus controlado, gracias a que el autor documenta ambos resultados.
- Docencia sobre resultados negativos en machine learning: útil para ilustrar por qué una proyección aprendida de baja capacidad puede quedar por debajo de una línea base simple en recuperación de texto.
- Estudio de particiones cronológicas: el conjunto held-out de 304 párrafos permite analizar cómo generaliza un retriever entrenado sobre texto histórico cuando se evalúa en fragmentos posteriores del mismo corpus.
- Prototipado de pipelines de recuperación en CPU: al ejecutarse en CPU y ocupar un tamaño de repositorio de 0,0 GB, puede integrarse en entornos sin GPU para pruebas de concepto de recuperación.
- Investigación sobre características de n-gramas de caracteres: el modelo permite estudiar la utilidad de representaciones léxicas basadas en n-gramas frente a embeddings densos en tareas de recuperación.
- Análisis de licencias y redistribución de corpus: dado que el autor documenta explícitamente las restricciones de Project Gutenberg, sirve como caso de estudio de gestión de derechos en artefactos de investigación.

## Benchmarks y rendimiento

| Métrica | PolyRetrieve (aprendido) | Línea base coseno léxico |
|---|---|---|
| Recall@1 | 0,5329 | 1,0 |
| Recall@5 | 0,7599 | 1,0 |

Evaluación sobre 304 párrafos cronológicamente reservados del corpus de Project Gutenberg (ebook 1342). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para CPU.
- GPU recomendadas: ninguna; el autor lo clasifica como artefacto de CPU.
- Cabe en cualquier GPU consumer, aunque no es necesario su uso.
- Opciones de despliegue: PyTorch en CPU; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolyRetrieve Gutenberg projection retriever | 147.840 | no disponible | text-retrieval | other | Hugging Face |
| Línea base coseno léxico (misma evaluación) | 0 (sin parámetros aprendidos) | no disponible | text-retrieval | no aplica | Referencia en la model card |
| Otros retrievers de producción (p. ej. basados en embeddings densos) | no disponible | no disponible | text-retrieval | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- Resultado negativo intencionado: el retriever aprendido rinde peor que la línea base léxica (Recall@1 de 0,5329 frente a 1,0), por lo que no debe promocionarse como solución superior.
- No es un sistema de búsqueda multilingüe ni de producción; el autor lo califica explícitamente como artefacto de investigación para CPU.
- El texto fuente no se incluye en el repositorio; la redistribución requiere revisión específica de jurisdicción según la Project Gutenberg License.
- Licencia "other": no se detallan términos de uso comercial; debe consultarse la model card y la licencia de Project Gutenberg antes de cualquier uso.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, aunque al ser un retriever y no un modelo generativo, el riesgo de alucinación no aplica de la misma forma.
- Limitaciones de contexto e idioma: no disponibles.
- Corpus restringido a un único ebook (1342) y a una partición cronológica concreta; la generalización a otros dominios no está demostrada.
- Tamaño de repositorio de 0,0 GB y 147.840 parámetros: capacidad muy limitada para representar vocabulario o semántica compleja.

## Enlaces

- Hugging Face: https://huggingface.co/husnainbinmunawar/polyretrieve-gutenberg-experimental
- Project Gutenberg ebook 1342: https://www.gutenberg.org/ebooks/1342
- Project Gutenberg License: https://www.gutenberg.org/policy/license
