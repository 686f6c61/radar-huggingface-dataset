# satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-gcn-bert

## Resumen

gcn_bert es un clasificador de grafos desarrollado por satyam-arora-iiit-hyderabad en el contexto de la asignatura ANLP (Advanced Natural Language Processing), Assignment 3 Part 2. El modelo aborda la tarea de clasificacion de noticias falsas sobre el dataset GossipCop en su variante UPFD (User Preference-aware Fake News Detection), donde cada muestra es un grafo de propagacion de noticias en redes sociales. Combina un codificador GCN (Graph Convolutional Network) con representaciones BERT, de ahi el nombre gcn_bert.

El modelo reporta un rendimiento medio de accuracy de 0,826, precision macro de 0,828, recall macro de 0,826 y F1 macro de 0,826 sobre el conjunto de evaluacion. Se trata de un artefacto academico de un repositorio de Hugging Face con cero descargas y cero likes, sin model card extendida, sin licencia declarada y con un tamano de repositorio de 0,0 GB (lo que sugiere pesos muy ligeros o ausencia de pesos publicados en el momento de la consulta).

Su relevancia es limitada fuera del ambito academico: no es un modelo de proposito general sino un clasificador binario de grafos de propagacion de noticias, y la informacion publica disponible es minima. Se documenta aqui como referencia para quien evalue reproducir el experimento o comparar enfoques GNN+PLM en deteccion de desinformacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GCN (Graph Convolutional Network) combinada con BERT (encoder de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente ingles, por el dataset GossipCop, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de grafos de tipo GCN con representaciones derivadas de BERT. El enfoque es coherente con la linea de trabajo UPFD (User Preference-aware Fake News Detection), en la que cada noticia se modela como un grafo de propagacion: los nodos representan usuarios o publicaciones y las aristas las interacciones (retuits, respuestas, menciones). El GCN agrega informacion de vecindad para producir embeddings de grafo, mientras que BERT aporta la representacion semantica del contenido textual de la noticia y posiblemente de los comentarios asociados.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de GossipCop UPFD, ni sobre el uso de tecnicas de alineacion como RLHF o DPO. Tampoco se detalla la estrategia de fusion entre las representaciones de BERT y las del GCN (concatenacion, atencion cruzada u otra), ni si el encoder BERT se congela o se ajusta finamente durante el entrenamiento. Toda esta informacion se considera no disponible.

## Capacidades

- Clasificacion binaria de grafos de propagacion de noticias (verdadera/falsa) sobre el dataset GossipCop UPFD.
- Procesamiento conjunto de estructura de grafo (GCN) y contenido textual (BERT).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (el dataset de origen es en ingles, sin confirmacion explicita).
- No se documentan capacidades especiales como modo thinking, vision o audio.
- Generacion de texto: no disponible; el modelo esta orientado a clasificacion, no a generacion.

## Casos de uso

- Deteccion de desinformacion en redes sociales: el modelo clasifica cadenas de propagacion de noticias en GossipCop como veraces o falsas, aprovechando tanto el texto como la estructura de interacciones de los usuarios.
- Investigacion academica en GNN + PLM: sirve como referencia reproducible para comparar estrategias de fusion entre grafos y modelos de lenguaje en tareas de clasificacion.
- Analisis de propagacion de rumores en plataformas de noticias de entretenimiento: el dataset GossipCop se centra en noticias de celebridades, por lo que el modelo es aplicable a ese dominio concreto.
- Baseline para experimentos de deteccion de fake news: sus metricas macro (F1 0,826) permiten usarlo como punto de partida en trabajos que exploren arquitecturas alternativas.
- Evaluacion de robustez de clasificadores de grafos: util para estudiar como varian las predicciones ante perturbaciones en la estructura del grafo de propagacion.
- Docencia y practicas de NLP: apropiado como ejemplo de pipeline completo (construccion de grafo, extraccion de features con BERT, entrenamiento de GCN y evaluacion con metricas macro).

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de evaluacion (medias):

| Metrica | Valor |
|---|---|
| Accuracy (media) | 0,8259 |
| Precision macro (media) | 0,8281 |
| Recall macro (media) | 0,8260 |
| F1 macro (media) | 0,8256 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible, ni desglose por clases, ni intervalos de confianza sobre las medias.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamano del repositorio es de 0,0 GB, lo que impide estimar el coste real; si se materializa como BERT-base mas una GCN ligera, cabria esperar del orden de 1-2 GB en fp16, pero es una estimacion no confirmada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; previsiblemente si el modelo es de escala BERT-base, pero no hay datos publicados.
- Opciones de despliegue: no disponible; al ser un modelo de grafos, requeriria un pipeline especifico (por ejemplo, PyTorch Geometric junto con Transformers) y no encaja directamente en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa de la misma categoria (deteccion de fake news con grafos de propagacion):

| Modelo | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gcn_bert (este modelo) | GCN + BERT sobre grafos de propagacion | no disponible | no disponible | Hugging Face, 0 descargas |
| GCN puro (UPFD baseline) | Solo estructura de grafo | no aplica | variable | Implementaciones publicas en repos academicos |
| GAT (UPFD baseline) | Graph Attention Network | no aplica | variable | Implementaciones publicas en repos academicos |
| BERT solo texto | Clasificacion textual sin grafo | 512 tokens (BERT-base) | variable segun checkpoint | Amplia |

Los datos de rendimiento de las alternativas no estan disponibles en la informacion proporcionada, por lo que no se establece comparacion numerica.

## Limitaciones y advertencias

- Artefacto academico: desarrollado para una asignatura, sin documentacion de produccion, sin versionado semantico y sin mantenimiento declarado.
- Sesgos conocidos: no documentados; el dataset GossipCop se centra en noticias de celebridades en ingles, lo que limita la generalizacion a otros dominios y lenguas.
- Riesgo de alucinacion: no aplica en sentido estricto al ser un clasificador, pero existe riesgo de falsos positivos y negativos en la clasificacion de noticias.
- Limitaciones de contexto e idioma: no disponibles; probablemente restringido al ingles y a la longitud maxima de BERT, sin confirmar.
- Restricciones de licencia: la licencia no esta declarada, lo que impide asumir permisos de uso comercial; debe contactarse con el autor antes de cualquier uso en produccion.
- El repositorio tiene 0,0 GB, por lo que no esta claro que los pesos esten efectivamente publicados; verificar antes de intentar cargar el modelo.
- Ausencia de model card detallada: no se documentan hiperparametros, semillas, splits de evaluacion ni protocolo de entrenamiento, lo que dificulta la reproducibilidad.
- No apto para despliegue directo en frameworks de inferencia estandar de LLM; requiere pipeline de grafos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-gcn-bert
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
