# satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-sage-spacy

## Resumen

`sage_spacy` es un clasificador de grafos desarrollado por el usuario `satyam-arora-iiit-hyderabad` en el contexto de la asignatura ANLP (Advanced Natural Language Processing), Assignment 3 Part 2, y publicado en Hugging Face. El modelo se entrena sobre el conjunto de datos GossipCop UPFD, un benchmark de deteccion de noticias falsas construido a partir de articulos de cotilleo (GossipCop) y representado como grafos de propagacion de noticias (UPFD: User Preference-aware Fake News Detection framework). La arquitectura declarada en el nombre es GraphSAGE, con un componente de procesamiento de lenguaje etiquetado como `spacy`, probablemente usado para la tokenizacion o extraccion de caracteristicas textuales de los nodos.

El modelo reporta metricas de clasificacion binaria (real vs. falso) con una precision media (accuracy) de 0,9175, macro precision de 0,9186, macro recall de 0,9174 y macro F1 de 0,9174. Estas cifras corresponden a medias sobre varias ejecuciones o folds, segun la convencion habitual en trabajos academicos de este tipo. No se especifica el numero de semillas ni la desviacion estandar asociada.

La relevancia de este modelo es limitada fuera del ambito academico: se trata de un artefacto de asignatura, sin model card detallada, sin licencia declarada, sin pesos visibles (tamano del repositorio de 0,0 GB) y sin pipeline definido en Hugging Face. Es util como referencia para quien quiera reproducir el experimento o comparar resultados en UPFD, pero no esta pensado para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraphSAGE (red neuronal de grafos) con componente spaCy para caracteristicas textuales |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (el modelo opera sobre grafos, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0,0 GB) |

## Arquitectura y entrenamiento

El modelo se basa en GraphSAGE, un esquema de agregacion de vecindarios para grafos homogeneos que genera embeddings de nodos mediante muestreo y agregacion de vecinos. En el contexto de UPFD, cada noticia se representa como un grafo bipartito de usuarios y publicaciones, y el clasificador produce una etiqueta binaria (noticia real o falsa). El sufijo `spacy` sugiere que las caracteristicas iniciales de los nodos textuales se obtienen mediante spaCy, probablemente con embeddings preentrenados o caracteristicas linguisticas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, el uso de RLHF/DPO (no aplicable a un clasificador de grafos) ni innovaciones tecnicas adicionales. La unica informacion cuantitativa disponible son las metricas de evaluacion reportadas en la model card.

## Capacidades

- Clasificacion binaria de noticias (real vs. falso) representadas como grafos de propagacion.
- Procesamiento de grafos con agregacion de vecindarios mediante GraphSAGE.
- Extraccion de caracteristicas textuales de nodos mediante spaCy (segun el nombre del modelo).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles.
- No se documenta vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Reproduccion academica del experimento UPFD: el modelo sirve como referencia para validar implementaciones de GraphSAGE sobre GossipCop en cursos o trabajos de investigacion, dado que se publican las metricas medias obtenidas.
- Comparacion de baselines en deteccion de desinformacion: permite contrastar el rendimiento de GraphSAGE con arquitecturas alternativas (GCN, GAT, GraphSAGE con otras caracteristicas) sobre el mismo split de UPFD.
- Analisis de propagacion de noticias en redes sociales: el modelo puede aplicarse a grafos de interacciones usuario-noticia para estudiar patrones de difusion de contenido falso en dominios de cotilleo.
- Docencia en procesamiento de lenguaje natural y grafos: util como ejemplo practico de combinacion de NLP (spaCy) y GNN (GraphSAGE) en un pipeline docente.
- Prototipado de clasificadores de contenido en entornos controlados: si se dispone de los pesos y del preprocesado original, podria integrarse en un pipeline de investigacion para etiquetar noticias de un dominio similar.
- Auditoria de sesgos en deteccion de desinformacion: permite estudiar como un clasificador basado en grafo se comporta en un corpus especifico (GossipCop), aunque sin garantias de generalizacion fuera de ese dominio.

## Benchmarks y rendimiento

| Metrica | Valor medio |
|---|---|
| Accuracy | 0,9175 |
| Macro precision | 0,9186 |
| Macro recall | 0,9174 |
| Macro F1 | 0,9174 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Las cifras anteriores son las reportadas por el autor en la model card y corresponden a medias, sin desviacion estandar ni detalle del protocolo de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo de grafos y no de un LLM, el consumo depende del tamano del grafo de entrada y del numero de parametros de las capas GraphSAGE, que no se especifican.
- GPU recomendadas: no disponible. Un modelo GraphSAGE de este tipo suele ejecutarse en GPU consumer (por ejemplo, RTX 3060 o superior) si el grafo cabe en memoria, pero no se confirma en la informacion proporcionada.
- Compatibilidad con GPU consumer: probablemente si, dado el caracter academico del modelo, pero no confirmado.
- Opciones de despliegue: no disponible. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a modelos de grafos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros modelos comparables en la misma categoria (clasificadores de grafos sobre UPFD) ni sus metricas, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio no contiene pesos visibles (tamano de 0,0 GB), por lo que no es posible descargar ni ejecutar el modelo tal cual.
- No se declara licencia, lo que impide determinar si su uso comercial esta permitido.
- No se especifican idiomas soportados ni dominio de aplicacion mas alla de GossipCop.
- Las metricas reportadas carecen de intervalos de confianza, numero de ejecuciones y protocolo de evaluacion detallado.
- Riesgo de sobreajuste al dominio de cotilleo (GossipCop); la generalizacion a otros dominios o idiomas no esta validada.
- No se documentan sesgos conocidos, pero un clasificador de noticias falsas entrenado en un corpus especifico puede heredar sesgos del etiquetado original.
- No apto para produccion: es un artefacto de asignatura sin documentacion tecnica suficiente, sin pipeline declarado y sin garantias de mantenimiento.
- La fecha de creacion indicada (2026-11-10) es futura respecto a la redaccion habitual de fichas, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-sage-spacy
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo o demos.
