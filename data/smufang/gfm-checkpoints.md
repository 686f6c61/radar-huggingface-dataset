# smufang/GFM-checkpoints

## Resumen

GFM-checkpoints es un repositorio de pesos preentrenados publicado por el usuario smufang que reúne los checkpoints de los modelos evaluados en GFMBenchmark, el banco de pruebas presentado en el artículo *Evaluating Progress in Graph Foundation Models: A Comprehensive Benchmark and New Insights* (arXiv:2603.10033, 2026). No se trata de un modelo único, sino de una colección de pesos de ocho familias de modelos de grafos (MDGPT, SAMGPT, MDGFM, G2P2, GraphCLIP, HeCo, TGN y DDGCL), más los correspondientes a GFT, UniGraph2, GCOPE, DGI, GraphPrompt y DSSL en sus respectivos subdirectorios. El objetivo es permitir la reproducción de los resultados downstream sin necesidad de repetir el preentrenamiento.

El repositorio resuelve un problema práctico de reproducibilidad en el campo de los graph foundation models: los autores han reentrenado cada método con su código oficial y los hiperparámetros descritos en el apéndice del artículo, sobre un corpus común, de modo que las comparaciones entre métodos son homogéneas. Los pesos cubren distintos regímenes de evaluación (cross-domain, single-domain y escenarios few-shot), lo que permite estudiar la transferibilidad de representaciones entre dominios de grafos.

La relevancia actual radica en que los graph foundation models carecen todavía de protocolos de evaluación estandarizados, y este repositorio proporciona los artefactos necesarios para replicar un benchmark comprehensivo. El tamaño total del repositorio es de 6,1 GB, los pesos son `state_dict` de PyTorch y la licencia de los pesos es CC BY 4.0, aunque los datos subyacentes conservan sus términos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafos neuronales (GNN) y modelos fundacionales de grafos; varía por método (GNN con objetivos contrastivos, transformers sobre grafos, etc.) |
| Parametros totales | no disponible (depende del método y de la configuración de preentrenamiento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre grafos) |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa de PyTorch) |
| Idiomas soportados | no disponible (modelo de grafos, no lingüístico) |
| Licencia | CC BY 4.0 para los pesos; los datasets conservan sus licencias originales (algunos no comerciales) |
| Formato de pesos | PyTorch `state_dict` (`checkpoint.pth`, `.pt`, `.pkl`), cargables con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura única: agrupa los pesos de múltiples métodos de aprendizaje sobre grafos. Entre ellos figuran enfoques cross-domain (MDGPT, SAMGPT, MDGFM), modelos con preentrenamiento simple (G2P2, GraphCLIP), modelos single-domain (HeCo, TGN, DDGCL) y modelos como GFT, UniGraph2, GCOPE, DGI, GraphPrompt y DSSL. Cada carpeta codifica en su nombre la configuración de preentrenamiento: backbone (SAGE, GAT, FAGCN), objetivo, alineamiento de features, dimensión de entrada, dimensión oculta, número de capas y número de cabezas.

El entrenamiento se realizó con PyTorch 2.5.1 y PyTorch Geometric 2.7.0. Los autores reentrenaron cada método sobre un corpus común definido en el artículo, organizado en varios escenarios: Setting I y II (20 datasets marcados como *I* en la Tabla 1 del paper), Setting III con subconjuntos de citas (Cora, ogbn-arxiv, ACM, DBLP), redes sociales/web (Reddit, Texas, Wisconsin, Cornell, IMDB) y moléculas (HIV, COX2), y Setting IV (Photo, Computers, COX2, PROTEINS, ENZYMES, Elliptic), con una variante que emplea el backbone heterofílico FAGCN. Los identificadores `exp0` a `exp5` mapean cada checkpoint a su escenario de evaluación correspondiente.

## Capacidades

- Aprendizaje de representaciones sobre grafos para tareas de clasificación de nodos, enlace y grafo, según el método concreto.
- Transferencia cross-domain: los modelos MDGPT, SAMGPT y MDGFM permiten aplicar representaciones preentrenadas en un corpus multi-dominio a grafos de dominios no vistos.
- Evaluación few-shot: los checkpoints están preparados para los splits few-shot publicados en `smufang/GFM-datasets`.
- Soporte de múltiples backbones (SAGE, GAT, FAGCN) seleccionables mediante el identificador de experimento.
- Reproducción de resultados downstream sin reentrenamiento, mediante los scripts `scripts/*_downstream.sh`.
- Compatibilidad con el ecosistema PyTorch Geometric para reconstruir las clases de modelo desde el repositorio de código.
- No ofrece generación de texto, visión, audio ni tool calling: es un artefacto de investigación en graph machine learning.

## Casos de uso

- Reproducción de benchmarks académicos: cargar los pesos con `torch.load` y ejecutar los scripts downstream para replicar las tablas del artículo sin invertir cómputo en preentrenamiento.
- Investigación en transferibilidad entre dominios: comparar el rendimiento de MDGPT, SAMGPT y MDGFM sobre grafos de citas, sociales y moleculares usando el mismo corpus de preentrenamiento.
- Evaluación few-shot en grafos: emplear los splits de `smufang/GFM-datasets` junto con estos checkpoints para medir la capacidad de generalización con pocas etiquetas.
- Desarrollo de nuevos métodos de GFM: usar los pesos como línea base congelada y entrenar únicamente cabezas downstream para aislar el efecto de una nueva técnica.
- Estudio de backbones heterofílicos: comparar los checkpoints con backbone FAGCN (`exp4`/`exp5`) frente a los de SAGE y GAT en grafos con heterofilia.
- Auditoría de reproducibilidad: verificar resultados publicados por terceros partiendo de los mismos pesos y scripts, reduciendo la variabilidad por diferencias de entrenamiento.
- Docencia y experimentación: disponer de pesos listos para usar en cursos o prototipos de graph ML sin necesidad de infraestructura de preentrenamiento a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo arXiv:2603.10033 para las tablas de resultados; este repositorio solo contiene los pesos, no las métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; depende del método y del tamaño del grafo. El repositorio completo ocupa 6,1 GB en disco, pero cada checkpoint individual es sustancialmente menor.
- GPU recomendadas: no especificadas por el autor. Al tratarse de GNNs sobre grafos de tamaño moderado, una GPU consumer con 8-16 GB suele ser suficiente para inferencia y fine-tuning ligero de la mayoría de los checkpoints.
- Cabe en GPU consumer: previsiblemente sí para la mayoría de configuraciones, dado el tamaño de los grafos de los datasets (Cora, Texas, Wisconsin, Cornell, PROTEINS, ENZYMES, etc.), aunque no se aportan cifras concretas.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama ni TGI; el despliegue se realiza mediante PyTorch 2.5.1 y PyTorch Geometric 2.7.0 ejecutando los scripts del repositorio de código.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GFM-checkpoints (este repo) | Colección de checkpoints GFM | no disponible (varía por método) | no aplica | CC BY 4.0 (pesos) | Hugging Face |
| Checkpoints originales de cada método (MDGPT, SAMGPT, etc.) | Pesos publicados por los autores originales | no disponible | no aplica | Según cada método | Repositorios de cada autor |
| GraphCLIP / G2P2 oficiales | Modelos de preentrenamiento en grafos | no disponible | no aplica | Según cada método | Repositorios de cada autor |

La diferencia principal frente a los checkpoints oficiales es que estos han sido reentrenados de forma homogénea sobre un corpus común, lo que facilita comparaciones justas, a costa de no ser los pesos exactos publicados por los autores originales.

## Limitaciones y advertencias

- No es un modelo único ni un modelo de lenguaje: no admite prompts de texto ni tareas generativas.
- Los pesos no son los publicados por los autores originales; los resultados pueden diferir de los reportados en cada paper individual.
- Algunos datasets del corpus de preentrenamiento tienen licencias no comerciales (Elliptic: CC BY-NC-ND 4.0; FB15K-237: Microsoft Research Data License Agreement), lo que restringe el uso comercial de los pesos entrenados sobre ellos, especialmente en Setting I y Setting IV.
- Cada método conserva su propia licencia de código, que debe revisarse por separado.
- La carga requiere reconstruir las clases del modelo desde el repositorio de código; no hay `AutoModel` ni integración con `transformers`.
- Dependencia de versiones específicas (PyTorch 2.5.1, PyTorch Geometric 2.7.0) que puede generar incompatibilidades con entornos más recientes.
- No se aportan métricas de rendimiento ni cifras de latencia en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria todavía.

## Enlaces

- Hugging Face: https://huggingface.co/smufang/GFM-checkpoints
- Dataset: https://huggingface.co/datasets/smufang/GFM-datasets
- Código: https://github.com/smufang/GFMBenchmark
- Página del proyecto: https://xiexuanting.github.io/GFMBenchmark_Home/
- Paper: https://arxiv.org/abs/2603.10033
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
