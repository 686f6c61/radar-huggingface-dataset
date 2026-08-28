# chebai/gat-chebi25_v252

## Resumen

El modelo `chebai/gat-chebi25_v252` es una red neuronal de grafos basada en Graph Attention Network (GAT) entrenada sobre el dataset ChEBI25 (versión v252), un recurso ontológico químico de referencia. Lo desarrolla el grupo ChEB-AI, un proyecto centrado en la integración de conocimiento ontológico químico en modelos de aprendizaje profundo, con el objetivo de incorporar las relaciones semánticas de la ontología ChEBI en el proceso de aprendizaje.

Este modelo resuelve tareas de clasificación y predicción sobre compuestos químicos, aprovechando la estructura de grafos moleculares y el conocimiento ontológico de ChEBI. Su relevancia radica en que aborda un problema específico de la química computacional: la necesidad de modelos que no solo procesen la estructura molecular, sino que también comprendan las relaciones jerárquicas y semánticas entre entidades químicas.

El repositorio incluye el checkpoint de PyTorch Lightning, los archivos de configuración y la versión de la librería utilizada para el entrenamiento. La arquitectura se describe en la tesis de maestría de Aditya Ganesh Khedekar, titulada "Integrating Chemical Knowledge into Graph Neural Networks" (Universidad Otto-von-Guericke de Magdeburgo, 2026). No se dispone de información sobre el número de parámetros, la longitud de contexto ni los idiomas soportados, ya que se trata de un modelo especializado en química, no en procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Attention Network (GAT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica, modelo de grafos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, modelo quimico) |
| Licencia | MIT |
| Formato de pesos | PyTorch Lightning checkpoint |

## Arquitectura y entrenamiento

La arquitectura es una Graph Attention Network (GAT), un tipo de red neuronal de grafos que utiliza mecanismos de atención para ponderar la importancia de los nodos vecinos durante la agregación de información. En este caso, los nodos representan átomos o entidades químicas y las aristas representan enlaces o relaciones ontológicas. El modelo se entrena con la librería ChEB-AI Graph (v1.2.0), disponible en el repositorio `python-chebai-graph`, que integra el conocimiento de la ontología ChEBI en el proceso de aprendizaje.

El dataset de entrenamiento es ChEBI25 (versión v252), un recurso que contiene entidades químicas de interés biológico con sus relaciones ontológicas. El entrenamiento se realizó con PyTorch Lightning, como indica el formato del checkpoint incluido en el repositorio. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO, ya que estas son más propias de modelos de lenguaje y no de redes neuronales de grafos.

La innovación técnica principal, según la tesis de Khedekar, es la integración explícita de conocimiento químico ontológico en la arquitectura de la red, lo que permite que el modelo no solo aprenda de la estructura molecular, sino también de las relaciones semánticas definidas en ChEBI.

## Capacidades

- Clasificacion de compuestos quimicos segun la ontologia ChEBI.
- Prediccion de propiedades quimicas y biologicas a partir de la estructura molecular representada como grafo.
- Incorporacion de relaciones ontologicas (jerarquicas y semanticas) en el proceso de aprendizaje.
- Representacion de moleculas como grafos, con atencion sobre los nodos para capturar dependencias locales y globales.
- Integracion con la libreria ChEB-AI para flujos de trabajo de quimica computacional.
- No soporta generacion de texto, tool calling, agentes, vision ni audio, al ser un modelo especializado en grafos quimicos.

## Casos de uso

- Descubrimiento de farmacos: el modelo puede clasificar compuestos candidatos segun su similitud con entidades quimicas conocidas en ChEBI, ayudando a filtrar moleculas con potencial terapeutico.
- Prediccion de toxicidad: al entrenarse sobre la ontologia ChEBI, puede predecir si un compuesto pertenece a categorias toxicas definidas en la ontologia, lo que resulta util en evaluaciones de seguridad quimica.
- Anotacion automatica de compuestos: dado un grafo molecular, el modelo puede asignar automaticamente las clases ChEBI correspondientes, ahorrando trabajo manual en bases de datos quimicas.
- Analisis de metabolomica: en estudios de metabolomica, el modelo puede clasificar metabolitos detectados experimentalmente dentro de la jerarquia ChEBI, facilitando la interpretacion biologica.
- Curaduria de bases de datos quimicas: el modelo puede validar y completar anotaciones ontologicas en bases de datos como ChEBI, PubChem o ChemSpider.
- Investigacion academica en quimica computacional: sirve como punto de partida para experimentos con GATs aplicados a ontologias quimicas, permitiendo comparar arquitecturas y estrategias de integracion de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion como exactitud, F1 o AUC sobre conjuntos de prueba estandar. Para obtener datos de rendimiento, seria necesario consultar la tesis de Khedekar o ejecutar el modelo sobre los conjuntos de evaluacion de ChEBI25.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo de grafos, el consumo de memoria depende del tamano de los grafos de entrada y del numero de cabezas de atencion, no de parametros de lenguaje.
- GPU recomendadas: no disponible. Modelos GAT de tamano moderado pueden ejecutarse en GPUs de consumo como una RTX 3060 o superiores, pero no hay datos concretos para este checkpoint.
- Compatibilidad con GPU de consumo: probablemente si, dado el ambito academico del proyecto, pero no confirmado.
- Opciones de despliegue: el checkpoint de PyTorch Lightning puede cargarse con PyTorch estándar. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos similares. En el campo de las GNNs aplicadas a quimica existen alternativas como Chemprop (MPNN), MolCLR (contrastivo) o Graphormer, pero no hay datos publicados que permitan comparar este modelo con ellos en terminos de rendimiento o parametros. La comparativa quedaria limitada a la arquitectura (GAT vs. MPNN vs. Transformer) y al dataset de entrenamiento (ChEBI25 vs. otros como ZINC o QM9), pero sin cifras concretas no es posible realizar una tabla comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente sobre ChEBI25, el modelo puede tener un rendimiento limitado en compuestos fuera del alcance de esa ontologia o en dominios quimicos no cubiertos.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero el modelo puede producir clasificaciones incorrectas si el grafo de entrada no esta bien construido o si el compuesto es muy diferente de los ejemplos de entrenamiento.
- Limitaciones de contexto o idioma: no aplica, al ser un modelo de grafos y no de lenguaje.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, sin restricciones significativas.
- Caveats para produccion: el modelo es un checkpoint de investigacion, sin garantias de robustez en entornos de produccion. Se recomienda validar su rendimiento en el dominio especifico antes de desplegarlo. Ademas, la documentacion es limitada y la comunidad de usuarios es muy pequena (0 descargas, 0 likes), lo que implica soporte y mantenimiento practicamente inexistentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chebai/gat-chebi25_v252
- Dataset ChEBI25 v252: https://huggingface.co/datasets/chebai/ChEBI25_v252
- Perfil del autor en HuggingFace: https://huggingface.co/chebai
- Libreria ChEB-AI Graph: https://github.com/ChEB-AI/python-chebai-graph
- Libreria ChEBai en PyPI: https://pypi.org/project/chebai/
- Repositorio ChEBai: https://github.com/ChEB-AI/python-chebai
- Aplicacion web Chebifier: https://github.com/ChEB-AI/chebifier-web/
- Tesis de Khedekar (PDF): https://www.uni-osnabrueck.de/fileadmin/informatik/Arbeitsgruppen/Hybride_KI/mt_aditya_khedekar.pdf
