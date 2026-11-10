# satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-sage-profile

## Resumen

`sage_profile` es un clasificador de grafos desarrollado por el usuario `satyam-arora-iiit-hyderabad` en el contexto de una asignación académica (ANLP Assignment 3, Part 2) sobre el conjunto de datos GossipCop UPFD. El nombre del repositorio sugiere el uso de GraphSAGE como arquitectura de agregación de vecindarios sobre grafos de propagación de noticias, aunque la model card no lo confirma explícitamente.

El modelo resuelve una tarea de clasificación binaria o multiclase sobre grafos de propagación de noticias (fake news detection sobre el dataset UPFD-GossipCop). Los resultados reportados en la model card son una accuracy media de 0,9038 y un macro F1 medio de 0,9037, lo que indica un rendimiento equilibrado entre clases.

Es relevante únicamente como artefacto académico reproducible: el repositorio tiene 0 descargas, 0 likes, 0,0 GB de tamaño y no incluye pesos, licencia, idiomas ni pipeline declarados. No debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraphSAGE (inferida del nombre del repositorio; no confirmada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de grafos, no de secuencias) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño del repo: 0,0 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el proceso de entrenamiento. El identificador `sage-profile` y la tarea (clasificación de grafos UPFD sobre GossipCop) apuntan a un esquema de GraphSAGE con agregación de vecinos y una cabeza de clasificación a nivel de grafo, pero este extremo no está documentado por el autor.

Tampoco se especifican el número de capas, la dimensionalidad de los embeddings, la función de agregación (mean, LSTM, pooling), el número de tokens o el esquema de validación cruzada empleado para obtener las medias reportadas. Los únicos datos de entrenamiento disponibles son las métricas agregadas: accuracy media 0,9038, macro precision media 0,9047, macro recall media 0,9038 y macro F1 media 0,9037.

## Capacidades

- Clasificación de grafos de propagación de noticias sobre el dataset UPFD-GossipCop.
- Predicción de etiquetas a nivel de grafo (noticia verdadera o falsa, según la formulación estándar del dataset).
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües declaradas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reproducción académica de experimentos UPFD: el artefacto sirve para replicar los resultados de la asignación ANLP A3 Part 2 y comparar con otras implementaciones de GraphSAGE sobre GossipCop.
- Evaluación de pipelines de detección de desinformación: puede integrarse como referencia de rendimiento (macro F1 ≈ 0,90) en la comparación de clasificadores de grafos de propagación.
- Estudio de propagación de noticias en redes sociales: permite analizar cómo la estructura del grafo de difusión (retuits, respuestas) correlaciona con la veracidad del contenido.
- Docencia en aprendizaje sobre grafos: útil como ejemplo de entrenamiento de GNN con métricas macro promediadas para tratar el desbalance de clases.
- Baseline en investigación de fake news detection: sirve como punto de partida para arquitecturas más complejas (GAT, GCN, heterogéneas).
- Validación de infraestructura de evaluación: las métricas reportadas permiten comprobar que un pipeline de evaluación reproduce los valores del autor.

## Benchmarks y rendimiento

| Metrica | Valor medio |
|---|---|
| Accuracy | 0,9038 |
| Macro precision | 0,9047 |
| Macro recall | 0,9038 |
| Macro F1 | 0,9037 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no contiene pesos; tamaño 0,0 GB).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin pesos publicados; un GraphSAGE sobre UPFD-GossipCop suele entrenar en GPU de gama media, pero no hay datos del autor que lo confirmen.
- Opciones de despliegue: no disponible (no se documenta exportación a ningún formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sage_profile | no disponible | no aplica | Macro F1 0,9037 (GossipCop UPFD) | no disponible | Repo vacío (0,0 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos (0,0 GB), por lo que el modelo no es descargable ni ejecutable tal cual.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- Las métricas provienen de una única model card sin validación externa ni detalle del protocolo de evaluación (número de folds, semilla, split).
- El rendimiento está acotado al dataset GossipCop UPFD; no hay evidencia de generalización a otros dominios o idiomas.
- No se documentan sesgos conocidos, pero un clasificador de veracidad entrenado sobre un corpus periodístico concreto puede heredar los sesgos de etiquetado de ese corpus.
- Riesgo de alucinación no aplicable (no es un modelo generativo), pero sí riesgo de clasificaciones erróneas en grafos con estructuras de propagación atípicas.
- No apto para producción: es un artefacto académico sin documentación, sin licencia y sin pesos publicados.

## Enlaces

- Hugging Face: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-sage-profile
- Dataset UPFD (referencia de la tarea): no disponible en la información proporcionada
- Paper de GraphSAGE: no disponible en la información proporcionada
