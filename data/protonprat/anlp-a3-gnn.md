# ProtonPrat/anlp-a3-gnn

## Resumen

`ProtonPrat/anlp-a3-gnn` es un repositorio de checkpoints de clasificadores de grafos entrenados sobre el conjunto de datos UPFD GossipCop para la deteccion de noticias falsas. No se trata de un modelo de lenguaje generativo ni de un modelo fundacional, sino de una coleccion de pesos (un checkpoint por configuracion y semilla) de redes neuronales sobre grafos (GNN) que clasifican la veracidad de una noticia a partir de su grafo de propagacion en redes sociales. El autor es ProtonPrat y el repositorio se publica en el contexto de una asignatura de procesamiento de lenguaje natural (ANLP, asignacion 3, parte B).

El repositorio incluye cinco arquitecturas comparadas (root_mlp, gcn, graphsage, gat y bigcn) y un estudio de ablacion de caracteristicas (profile, spacy, bert y content). Los mejores resultados se alcanzan con GAT (0,9682 de accuracy y 0,9683 de F1) y con caracteristicas de contenido (0,9725 de accuracy y F1), promediando cinco semillas (0-4). El tamano del repositorio es de 0,0 GB, lo que sugiere checkpoints ligeros propios de tareas de clasificacion sobre grafos, no de modelos de gran escala.

Su relevancia es acotada: sirve como referencia reproducible de experimentos academicos sobre deteccion de desinformacion con GNN, no como modelo listo para produccion. La model card no aporta informacion sobre licencia, idiomas ni pipeline, y no se han publicado especificaciones de contexto o cuantizacion porque no aplican a este tipo de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales sobre grafos (GNN): root_mlp, gcn, graphsage, gat, bigcn |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre grafos de propagacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio contiene un checkpoint por configuracion y semilla, nombrados como `<model>-<feature>-seed<k>.safetensors`. Cada checkpoint almacena los pesos de la epoca con mejor F1 de validacion. Los modelos se construyen con `src.part2.models.build_model` del repositorio de la asignacion, usando los hiperparametros definidos en `config.yaml`. Las arquitecturas evaluadas son root_mlp (una MLP sobre las caracteristicas de la raiz), gcn, graphsage, gat y bigcn, todas ellas variantes clasicas de agregacion de vecindarios en grafos.

El entrenamiento se realiza sobre UPFD GossipCop, un conjunto de grafos de propagacion de noticias etiquetadas como veraces o falsas. Se evaluan cuatro tipos de caracteristicas de nodo: profile (perfil del usuario), spacy (embeddings de spaCy), bert (embeddings de BERT) y content (caracteristicas de contenido). No se especifica en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, algo que en cualquier caso no aplica a un clasificador de grafos.

## Capacidades

- Clasificacion binaria de grafos de propagacion de noticias (veraz frente a falsa) sobre el dataset UPFD GossipCop.
- Comparacion de cinco arquitecturas GNN bajo un mismo protocolo experimental y cinco semillas.
- Ablacion de caracteristicas de nodo (profile, spacy, bert, content) para medir su impacto en la clasificacion.
- Reproducibilidad de experimentos academicos mediante checkpoints por semilla y configuracion.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso.
- No se documentan capacidades multilingues; el dataset GossipCop esta en ingles.

## Casos de uso

- Reproduccion de experimentos academicos: cargar los checkpoints con `src.part2.models.build_model` y `config.yaml` para replicar las tablas de resultados publicadas en la model card.
- Investigacion sobre deteccion de desinformacion: usar los grafos de UPFD GossipCop para estudiar como distintas arquitecturas GNN capturan patrones de propagacion de noticias falsas.
- Docencia en cursos de NLP y aprendizaje sobre grafos: emplear el repositorio como ejemplo completo de comparacion de arquitecturas y ablacion de caracteristicas.
- Benchmarking de GNN: tomar GAT, GraphSAGE, GCN y BigCN como lineas base para nuevas propuestas de clasificacion de grafos en la misma tarea.
- Analisis de caracteristicas: utilizar los resultados de ablacion (profile, spacy, bert, content) para decidir que representacion de nodo conviene en un pipeline de deteccion de fake news.
- Prototipado de moderacion de contenido: integrar un clasificador GNN como componente de senal adicional en un sistema de revision, siempre que se valide fuera del dataset original.

## Benchmarks y rendimiento

Resultados de test promediados sobre las semillas 0-4, segun la model card:

| Experimento | Configuracion | Accuracy | F1 |
|---|---|---|---|
| architecture_comparison | root_mlp | 0,7369 | 0,7313 |
| architecture_comparison | gcn | 0,9640 | 0,9642 |
| architecture_comparison | graphsage | 0,9668 | 0,9669 |
| architecture_comparison | gat | 0,9682 | 0,9683 |
| architecture_comparison | bigcn | 0,9545 | 0,9547 |
| feature_ablation | profile | 0,9573 | 0,9577 |
| feature_ablation | spacy | 0,9618 | 0,9618 |
| feature_ablation | bert | 0,9668 | 0,9669 |
| feature_ablation | content | 0,9725 | 0,9725 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los checkpoints son ligeros (repositorio de 0,0 GB) y compatibles con GPU de consumo, pero no se especifica el consumo exacto.
- GPU recomendadas: no disponible. Por el tamano del repositorio, cualquier GPU con soporte PyTorch deberia ser suficiente.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repositorio, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: PyTorch con `src.part2.models.build_model` y `config.yaml` del repositorio de la asignacion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProtonPrat/anlp-a3-gnn | GNN para clasificacion de grafos | no disponible | no aplica | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni admite instrucciones; solo clasifica grafos de propagacion.
- Resultados ligados a UPFD GossipCop; la generalizacion a otros dominios o idiomas no esta evaluada.
- Riesgo de sobreajuste a los patrones de propagacion del dataset; no se documentan pruebas fuera de distribucion.
- La model card no indica licencia, por lo que el uso comercial no esta autorizado de forma explicita.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a ataques adversariales.
- El repositorio depende del codigo de una asignacion (`src.part2.models.build_model`, `config.yaml`); sin ese codigo los checkpoints no son directamente utilizables.
- No se especifican requisitos de version de PyTorch ni dependencias, lo que puede dificultar la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/ProtonPrat/anlp-a3-gnn
- Paper de UPFD: no disponible en la informacion proporcionada
- Repositorio de la asignacion: no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
