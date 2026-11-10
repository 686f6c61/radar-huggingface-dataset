# satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-gat-bert

## Resumen
El modelo `anlp-m26-a3-part2-gat-bert`, publicado por el usuario `satyam-arora-iiit-hyderabad`, es un clasificador de grafos desarrollado como parte de la asignatura ANLP (Advanced Natural Language Processing), en concreto para el "Assignment 3 Part 2" sobre el conjunto de datos GossipCop UPFD. Combina, segun indica su nombre, un mecanismo de Graph Attention Network (GAT) con representaciones BERT para clasificar nodos o propagaciones de noticias en un grafo de difusion social.

La relevancia de esta publicacion es limitada: se trata de un artefacto academico con cero descargas y cero likes en el momento de la consulta, un repositorio de 0.0 GB (lo que sugiere que los pesos podrian no estar subidos o que el contenido es minimo) y sin model card tecnica mas alla de una tabla de metricas. No dispone de pipeline declarado, licencia, idiomas ni documentacion sobre arquitectura, datos de entrenamiento o hiperparametros.

Por tanto, esta ficha debe interpretarse como una descripcion de un experimento academico reproducible a partir de las metricas declaradas (accuracy media de 0,9212 y macro F1 media de 0,9212 sobre GossipCop UPFD), no como un modelo listo para produccion. Cualquier dato no presente en la model card se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAT + BERT (clasificador de grafos sobre GossipCop UPFD); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano del repo: 0.0 GB) |

## Arquitectura y entrenamiento
El nombre del repositorio y la model card indican una combinacion de Graph Attention Network (GAT) con BERT para la tarea de clasificacion de grafos del benchmark UPFD (User Preference-aware Fake News Detection) sobre el dataset GossipCop. En la literatura UPFD, este tipo de modelos construye un grafo de propagacion de noticias donde los nodos son usuarios y el nodo raiz es la noticia, y se combinan embeddings textuales de la noticia (aqui, presumiblemente extraidos con BERT) con atencion sobre las aristas del grafo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas. La model card unicamente reporta metricas agregadas (medias sobre varias ejecuciones): accuracy 0,9212, macro precision 0,9218, macro recall 0,9212 y macro F1 0,9212. La elevada simetria entre precision y recall sugiere un problema de clasificacion binaria razonablemente equilibrado, pero no es posible confirmarlo sin acceso al codigo o a la configuracion de entrenamiento.

## Capacidades
- Clasificacion de grafos de propagacion de noticias sobre el dataset GossipCop UPFD (tarea binaria de veracidad, segun el benchmark estandar).
- Extraccion de representaciones textuales mediante BERT (presumiblemente congelado o fine-tuneado; no disponible).
- Agregacion de informacion estructural mediante atencion sobre vecinos en el grafo (GAT).
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio ni tool calling.
- No se documentan capacidades multilingues ni modos especiales (thinking, agentes, multi-step reasoning).
- No se documenta soporte de function calling ni integracion con frameworks de agentes.

## Casos de uso
- Investigacion academica en deteccion de desinformacion: el modelo sirve como linea base reproducible para comparar variantes GAT/BERT sobre GossipCop UPFD en trabajos de asignatura o articulos.
- Reproduccion de experimentos UPFD: util para validar implementaciones propias del pipeline de grafos de propagacion (construccion de grafo, features BERT, entrenamiento GAT) contra las metricas declaradas.
- Docencia en NLP avanzado: ejemplo practico de combinacion de modelos de lenguaje con redes de grafos para tareas de clasificacion estructurada.
- Analisis de propagacion en redes sociales: aplicable, con reentrenamiento, a la clasificacion de cadenas de difusion de noticias en plataformas tipo Twitter o Reddit.
- Benchmarking interno de arquitecturas GNN: punto de comparacion para modelos GCN, GraphSAGE o GAT puros sobre el mismo dataset.
- Prototipado de moderacion de contenido asistida por grafo: solo como prueba de concepto, dado que no hay licencia ni documentacion de produccion.

## Benchmarks y rendimiento
Metricas declaradas en la model card (medias sobre ejecuciones, sin desviacion tipica ni numero de semillas):

| Metrica | Valor medio |
|---|---|
| Accuracy | 0,9212 |
| Macro precision | 0,9218 |
| Macro recall | 0,9212 |
| Macro F1 | 0,9212 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible, ni desagregados por clase, ni curvas de aprendizaje.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible (se desconoce el tamano de BERT utilizado y del GAT; el repo pesa 0.0 GB, por lo que los pesos podrian no estar incluidos).
- GPU recomendadas: no disponible; por la naturaleza del modelo (BERT base o similar + GAT), una GPU consumer con 8-16 GB seria suficiente en la mayoria de configuraciones tipicas, pero es una estimacion no confirmada.
- Compatibilidad con GPU consumer: probable si se trata de BERT-base + GAT, pero no verificable con la informacion disponible.
- Opciones de despliegue: no disponible; al ser un clasificador de grafos, requeriria un pipeline propio con PyTorch Geometric o DGL, no cubierto por vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La model card no referencia alternativas y no se dispone de datos publicos de otros clasificadores GAT+BERT sobre GossipCop UPFD con los que comparar de forma fiable en esta ficha.

## Limitaciones y advertencias
- Repositorio sin licencia declarada: no se puede asumir uso comercial ni redistribucion.
- Sin idiomas declarados: se desconoce si el modelo esta entrenado solo en ingles (GossipCop es un dataset en ingles) o soporta otros idiomas.
- Sin pipeline ni formato de pesos documentado: la integracion en produccion requeriria reconstruir el codigo de entrenamiento e inferencia.
- Tamano del repositorio de 0.0 GB: posible ausencia de pesos, tokenizador o configuracion; verificar antes de cualquier uso.
- Riesgo de sobreajuste al dataset GossipCop y a la particion concreta del benchmark; las metricas medias no incluyen intervalos de confianza.
- Riesgo de sesgo heredado de GossipCop (dominio de noticias en ingles, sesgo de plataforma y de anotacion).
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos/negativos en la clasificacion de veracidad, con implicaciones eticas si se usa para moderacion automatica.
- No apto para uso en produccion sin validacion externa, auditoria de sesgos y una licencia clara.

## Enlaces
- Hugging Face: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-gat-bert
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
