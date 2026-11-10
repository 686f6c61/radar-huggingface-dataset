# satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-mlp-bert

## Resumen

mlp_bert es un clasificador de grafos desarrollado por satyam-arora-iiit-hyderabad en el contexto de la asignatura ANLP (Advanced Natural Language Processing), Assignment 3 Part 2. El modelo esta disenado para la tarea de clasificacion de nodos en el dataset GossipCop dentro del benchmark UPFD (User Preference-aware Fake News Detection), un marco habitual para la deteccion de noticias falsas a partir de la propagacion de informacion en redes sociales.

La nomenclatura del repositorio sugiere una combinacion de un perceptron multicapa (MLP) con representaciones derivadas de BERT, orientada a clasificar nodos del grafo de difusion de noticias. El modelo card unicamente reporta metricas agregadas de evaluacion (accuracy, precision, recall y F1 macro), sin detallar arquitectura interna, tamano de parametros ni procedimiento de entrenamiento.

Se trata de un artefacto academico de un repositorio con 0 descargas y 0 likes, creado en noviembre de 2026, con un tamano de repo de 0.0 GB, lo que indica que no contiene pesos publicados o que estos son de tamano despreciable. Su relevancia practica es limitada fuera del contexto docente para el que fue creado; no obstante, sirve como referencia de resultados en la tarea GossipCop/UPFD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura sugiere MLP sobre representaciones BERT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano de repo 0.0 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna. El identificador del modelo (`mlp-bert`) y la etiqueta `mlp` sugieren un componente perceptron multicapa aplicado sobre embeddings o caracteristicas derivadas de un modelo BERT, en el marco de una tarea de clasificacion de nodos sobre el grafo de difusion de GossipCop (UPFD). No se especifica el numero de capas, dimensiones ocultas, funcion de activacion ni estrategia de agregacion de vecinos del grafo.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset mas alla de su origen (GossipCop/UPFD), ni si se aplicaron tecnicas de ajuste fino supervisado, regularizacion o aumento de datos. El modelo card solo incluye las metricas medias de evaluacion, sin describir el protocolo experimental, los splits utilizados ni la semilla o numero de ejecuciones promediadas.

## Capacidades

- Clasificacion de nodos en el dataset GossipCop dentro del benchmark UPFD (deteccion de noticias falsas basada en propagacion).
- Generacion de una etiqueta de clase por nodo o grafo segun el protocolo UPFD.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo ni matematicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No se documentan modos especiales (thinking mode, vision, audio).

## Casos de uso

- Investigacion academica en deteccion de desinformacion: el modelo puede utilizarse como linea base reproducible en experimentos sobre GossipCop/UPFD, comparando su F1 macro (0.7402) con variantes propias.
- Docencia en cursos de NLP y aprendizaje sobre grafos: sirve como ejemplo de pipeline de clasificacion de nodos con caracteristicas textuales (BERT) y un cabezal MLP.
- Reproduccion de resultados UPFD: util para validar implementaciones del protocolo de evaluacion (accuracy, precision, recall y F1 macro) en entornos controlados.
- Analisis de propagacion de noticias: en un contexto de investigacion, permite estudiar como las representaciones textuales y la estructura del grafo contribuyen a la clasificacion.
- Comparacion de arquitecturas: como referencia para contrastar modelos GNN puros (GCN, GraphSAGE, GAT) frente a enfoques que combinan texto y MLP.
- Prototipado de sistemas de moderacion: solo en fase exploratoria y con validacion adicional, dado que el modelo no publica pesos ni documentacion suficiente para produccion.

## Benchmarks y rendimiento

| Metrica | Valor medio |
|---|---|
| Accuracy | 0.7418 |
| Precision macro | 0.7484 |
| Recall macro | 0.7419 |
| F1 macro | 0.7402 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Las cifras corresponden al promedio reportado por el autor en la model card, sin detallar el numero de ejecuciones ni los splits.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (tamano de repo 0.0 GB; no se publican pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con alternativas de la misma categoria. El modelo card no incluye referencias a lineas base de UPFD (como GCN, GraphSAGE, GAT o variantes con BERT) ni resultados comparativos publicados.

| Modelo | Parametros | Contexto | F1 macro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlp_bert (este modelo) | no disponible | no disponible | 0.7402 | no disponible | Repo HF sin pesos aparentes |
| Alternativas UPFD | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se publican pesos en el repositorio (tamano 0.0 GB), por lo que no es posible su uso directo sin el codigo o los artefactos del autor.
- Ausencia total de documentacion sobre arquitectura, datos de entrenamiento y protocolo experimental, lo que impide evaluar su robustez y reproducibilidad.
- Licencia no especificada: no se puede asumir permiso para uso comercial ni redistribucion.
- Riesgo de sobreajuste al dataset GossipCop y de baja generalizacion a otros dominios o idiomas.
- Metricas reportadas como medias sin desviacion tipica ni numero de ejecuciones, lo que limita la interpretacion estadistica.
- El modelo es un artefacto academico sin mantenimiento ni soporte; no se recomienda su uso en produccion.
- Posibles sesgos derivados del dataset GossipCop (dominio de noticias en ingles y sesgo de anotacion), no documentados por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-mlp-bert
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo ni demos.
