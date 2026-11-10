# satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-sage-content

## Resumen

`sage_content` es un repositorio de Hugging Face publicado por el usuario `satyam-arora-iiit-hyderabad` que contiene los artefactos de un clasificador de grafos basado en GraphSAGE, entrenado sobre el conjunto de datos GossipCop en el marco del dataset UPFD (User Preference-aware Fake News Detection). El modelo se presenta como parte de la asignatura ANLP (Assignment 3, Part 2) y su model card se limita a reportar metricas agregadas de evaluacion, sin describir la arquitectura con detalle ni el procedimiento de entrenamiento.

El problema que aborda es la deteccion de noticias falsas a partir de la propagacion de noticias en redes sociales: dado un grafo de difusion de una noticia (usuarios y interacciones), el modelo clasifica si la noticia es veridica o falsa. Los resultados reportados son notables en terminos de exactitud (0,9514 de media) y F1 macro (0,9514), aunque no se especifica el protocolo de evaluacion, el numero de semillas ni el split utilizado.

Es relevante como ejemplo de aplicacion de GraphSAGE a deteccion de desinformacion y como artefacto docente reproducible, pero no constituye un modelo de lenguaje ni un modelo generativo: es un clasificador de grafos de dominio especifico. El repositorio tiene 0 GB de tamano declarado, 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que los pesos podrian no estar efectivamente subidos o que el repositorio contiene unicamente metadatos y resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraphSAGE (clasificador de grafos; detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de grafos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset GossipCop es en ingles, pero no se declara explicitamente) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio declara 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura declarada es GraphSAGE, una familia de redes neuronales de grafos inductivas que agrega caracteristicas de vecinos mediante funciones de agregacion (media, LSTM, pooling) para generar embeddings de nodos. En el contexto de UPFD, el modelo opera sobre grafos de propagacion de noticias: cada nodo representa un usuario o una publicacion y las aristas representan interacciones (retuits, respuestas). El clasificador combina el embedding del nodo raiz (la noticia) con caracteristicas de contenido para producir una etiqueta binaria.

No se dispone de informacion sobre el numero de capas, dimensiones ocultas, funcion de agregacion concreta, hiperparametros de entrenamiento, numero de epocas, optimizador ni estrategia de validacion. Tampoco se documenta si se emplearon caracteristicas de contenido textual (por ejemplo, embeddings de BERT como en el trabajo original de UPFD) o solo caracteristicas estructurales del grafo. El dataset GossipCop es un subconjunto de UPFD con noticias de entretenimiento y celebridades; el split estandar de UPFD es 20 % entrenamiento, 10 % validacion y 70 % test, pero no se confirma que se haya seguido.

## Capacidades

- Clasificacion binaria de grafos de propagacion de noticias (veridica frente a falsa) sobre el dataset GossipCop.
- Aprendizaje inductivo sobre grafos: GraphSAGE puede generalizar a nodos y grafos no vistos durante el entrenamiento, a diferencia de enfoques transductivos como GCN sobre un grafo fijo.
- Procesamiento de estructura de difusion social (usuarios, interacciones, arboles de propagacion).
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- Capacidades multilingues: no disponibles; el entrenamiento se asocia a un dataset en ingles.

## Casos de uso

- Deteccion de desinformacion en plataformas de entretenimiento: el modelo puede clasificar cadenas de propagacion de noticias sobre celebridades, un dominio donde GossipCop es especialmente relevante, usando la estructura del grafo de difusion como senal.
- Moderacion asistida en redes sociales: integrado como componente de un pipeline que recibe el grafo de interacciones de una publicacion y emite una puntuacion de veracidad para priorizar la revision humana.
- Investigacion academica en deteccion de fake news: sirve como linea base reproducible de GraphSAGE sobre UPFD/GossipCop para comparar con GCN, GAT o GraphTransformer.
- Docencia y reproduccion de experimentos: el repositorio documenta metricas medias (accuracy 0,9514, F1 macro 0,9514) que permiten validar implementaciones propias del pipeline UPFD.
- Analisis forense de campanas de desinformacion: la estructura del grafo permite identificar patrones de propagacion anomales que complementan clasificadores puramente textuales.
- Prototipado de sistemas de verificacion de hechos: como clasificador auxiliar que aporta una senal estructural cuando el contenido textual es ambiguo o ha sido parafraseado.

## Benchmarks y rendimiento

Datos reportados en la model card (medias, sin desviacion tipica ni numero de ejecuciones):

| Metrica | Valor medio |
|---|---|
| Accuracy | 0,9514 |
| Precision macro | 0,9517 |
| Recall macro | 0,9514 |
| F1 macro | 0,9514 |

No se especifica el split de evaluacion, el numero de semillas, ni la comparacion con lineas base del paper UPFD. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo de grafos de pequeno tamano (tipico de GraphSAGE en UPFD), es probable que quepa en cualquier GPU consumer, pero no se confirma.
- GPU recomendadas: no disponibles; para inferencia sobre grafos de miles de nodos, una GTX 1660 o superior seria suficiente en la mayoria de implementaciones de PyTorch Geometric.
- Cabe en GPU consumer: probablemente si, dado el caracter ligero de GraphSAGE, aunque no hay datos oficiales.
- Opciones de despliegue: no documentadas; el formato de pesos no esta disponible, por lo que no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama ni TGI (ninguna de ellas aplica a modelos de grafos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dataset | Accuracy reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sage_content (este) | GraphSAGE | GossipCop (UPFD) | 0,9514 | no disponible | Hugging Face, 0 descargas |
| GCN (UPFD baseline) | GCN | GossipCop (UPFD) | no disponible en esta ficha | codigo abierto (repo UPFD) | GitHub |
| GAT (UPFD baseline) | GAT | GossipCop (UPFD) | no disponible en esta ficha | codigo abierto (repo UPFD) | GitHub |
| BiGCN (UPFD) | GCN bidireccional | GossipCop (UPFD) | no disponible en esta ficha | codigo abierto (repo UPFD) | GitHub |

No se dispone de los valores numericos de las lineas base en la informacion proporcionada, por lo que la comparacion cuantitativa no puede completarse.

## Limitaciones y advertencias

- La model card no documenta arquitectura, hiperparametros ni protocolo de evaluacion; la reproducibilidad es limitada.
- El repositorio declara 0.0 GB de tamano, lo que sugiere que los pesos podrian no estar incluidos; verificar antes de intentar cargarlo.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido.
- El modelo esta entrenado exclusivamente sobre GossipCop (noticias de entretenimiento en ingles); su generalizacion a otros dominios o idiomas no esta validada.
- Riesgo de sobreajuste al split o a la semilla concreta: se reportan solo medias sin desviaciones tipicas ni intervalos de confianza.
- No es un modelo de lenguaje: no genera texto ni soporta instrucciones; cualquier uso generativo requeriria un LLM adicional.
- Sesgos potenciales derivados del dataset GossipCop (sesgo de dominio, de fuente y temporal) no documentados por el autor.
- Alucinacion: no aplica en sentido estricto (clasificador), pero existe riesgo de falsos positivos y negativos con impacto reputacional en moderacion automatizada.

## Enlaces

- Hugging Face: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-sage-content
- Repositorio UPFD (referencia del dataset y lineas base): https://github.com/safe-graph/GNN-FakeNews
- Paper UPFD (User Preference-aware Fake News Detection): https://arxiv.org/abs/2104.12259
- Paper GraphSAGE (Inductive Representation Learning on Large Graphs): https://arxiv.org/abs/1706.02216
- Dataset GossipCop: https://github.com/KaiDMML/FakeNewsNet
