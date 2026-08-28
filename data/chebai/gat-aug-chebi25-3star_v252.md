# chebai/gat-aug-chebi25-3star_v252

## Resumen

El modelo `chebai/gat-aug-chebi25-3star_v252` es una Graph Attention Network (GAT) entrenada sobre el dataset químico ChEBI25-3STAR (versión v252), desarrollado por el grupo ChEB-AI. Su propósito es aprender representaciones de moléculas a partir de su estructura atómica y enlaces, con el objetivo de predecir propiedades químicas o clasificar compuestos según la ontología ChEBI. Este tipo de modelos es relevante en química computacional y descubrimiento de fármacos, donde los grafos moleculares permiten capturar relaciones estructurales que los descriptores tradicionales no reflejan.

La arquitectura GAT emplea mecanismos de atención sobre los nodos (átomos) y aristas (enlaces), lo que permite ponderar la importancia de cada vecino en la representación final. El modelo se distribuye como un checkpoint de PyTorch Lightning, junto con los ficheros de configuración y la versión de la librería `python-chebai-graph` (v1.2.0) usada durante el entrenamiento. El repositorio ocupa 0,1 GB, lo que sugiere un modelo de tamaño reducido, aunque no se publican detalles sobre el número de parámetros.

La relevancia actual de este modelo radica en su integración dentro del ecosistema ChEB-AI, que busca democratizar el acceso a modelos de IA para química. Al estar bajo licencia MIT, puede utilizarse libremente en investigación y aplicaciones comerciales, siempre que se respete la atribución correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Attention Network (GAT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de grafos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo químico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch Lightning (probablemente .ckpt o safetensors, no especificado) |

## Arquitectura y entrenamiento

La arquitectura se basa en una Graph Attention Network, que opera directamente sobre grafos moleculares. Cada átomo se representa como un nodo con características atómicas (tipo de elemento, carga, etc.) y los enlaces como aristas con propiedades de orden de enlace. Las capas de atención calculan pesos dinámicos entre nodos vecinos, permitiendo que el modelo aprenda qué interacciones atómicas son más relevantes para la tarea. El entrenamiento se realizó sobre el dataset ChEBI25-3STAR (v252), que contiene compuestos anotados con clases de la ontología ChEBI, probablemente en una tarea de clasificación multiclase o de predicción de propiedades.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. El modelo se entrenó con la librería `python-chebai-graph` v1.2.0, que proporciona utilidades para construir y entrenar GNNs sobre datos químicos. La tesis de Aditya Ganesh Khedekar (2026) describe la integración de conocimiento químico en redes neuronales de grafos, y sirve como referencia metodológica.

## Capacidades

- Predicción de propiedades químicas a partir de la estructura molecular (por ejemplo, toxicidad, solubilidad, actividad biológica).
- Clasificación de compuestos según la ontología ChEBI (clases químicas, roles biológicos, etc.).
- Generación de embeddings moleculares que pueden usarse como entrada para otros modelos o para análisis de similitud.
- Capacidad de procesar grafos moleculares de tamaño variable, gracias a la naturaleza flexible de las GNN.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión o audio, ya que es un modelo puramente químico.

## Casos de uso

- Descubrimiento de fármacos: el modelo puede filtrar librerías de compuestos candidatos, prediciendo si una molécula tiene actividad frente a un objetivo biológico concreto, reduciendo el coste de ensayos experimentales.
- Toxicología predictiva: dado un compuesto nuevo, se puede estimar su toxicidad potencial antes de síntesis, ayudando a priorizar moléculas seguras en etapas tempranas.
- Clasificación de metabolitos: en metabolómica, el modelo puede asignar compuestos desconocidos a clases ChEBI, facilitando la interpretación de espectros de masas.
- Optimización de moléculas: los embeddings generados por el modelo pueden alimentar algoritmos de optimización bayesiana o aprendizaje por refuerzo para diseñar análogos con mejores propiedades.
- Análisis de similitud química: al comparar los embeddings de dos moléculas, se puede medir su similitud estructural y funcional, útil en química medicinal.
- Integración en pipelines de quimioinformática: el checkpoint puede cargarse en entornos Python y combinarse con librerías como RDKit para preprocesar moléculas y obtener predicciones en lote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como exactitud, F1, AUC, ni comparaciones con otros modelos en tareas estándar de química (por ejemplo, MoleculeNet). Se recomienda evaluar el modelo en el propio dataset de validación o en benchmarks externos antes de usarlo en producción.

## Requisitos de hardware

- Al ser un modelo de 0,1 GB, es probable que quepa en GPUs de consumo (por ejemplo, RTX 3060 o superior) e incluso en CPU para inferencia de lotes pequeños.
- No se especifican requisitos de VRAM, pero un modelo de este tamaño típicamente requiere menos de 2 GB de VRAM en precisión float32.
- El despliegue puede realizarse mediante PyTorch Lightning, exportando el modelo a TorchScript u ONNX para inferencia en producción.
- No se mencionan herramientas específicas como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia dependerá del tamaño de las moléculas (número de átomos) y del hardware; para moléculas pequeñas (<50 átomos) se espera una inferencia en milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (GNNs para química). Existen alternativas conocidas como Chemprop (MPNN), GraphConv, o modelos preentrenados como MolCLR, pero no se han encontrado datos de comparación con este modelo concreto. Se recomienda consultar la literatura de GNNs moleculares para establecer referencias.

## Limitaciones y advertencias

- La información pública es muy limitada: no se detallan hiperparámetros, tamaño del dataset, ni métricas de rendimiento, lo que dificulta evaluar su calidad.
- El modelo se entrenó específicamente en el dataset ChEBI25-3STAR, por lo que su capacidad de generalización a otros dominios químicos (por ejemplo, polímeros, materiales inorgánicos) es incierta.
- Al ser un modelo de grafos, no maneja texto ni lenguaje natural; su uso se limita a entradas estructuradas como SMILES o grafos moleculares.
- No se han documentado sesgos específicos, pero el dataset ChEBI puede tener un desequilibrio de clases o una cobertura limitada de ciertos tipos de compuestos.
- La licencia MIT permite uso comercial, pero se debe citar adecuadamente al autor y a la tesis de referencia.
- No se garantiza la reproducibilidad completa si no se publican los datos de entrenamiento y los hiperparámetros exactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chebai/gat-aug-chebi25-3star_v252
- Dataset ChEBI25-3STAR: https://huggingface.co/datasets/chebai/ChEBI25-3STAR
- Perfil del autor (chebai): https://huggingface.co/chebai
- Repositorio de la librería ChEB-AI Graph: https://github.com/ChEB-AI/python-chebai-graph
- Tesis de referencia (PDF): https://www.uni-osnabrueck.de/fileadmin/informatik/Arbeitsgruppen/Hybride_KI/mt_aditya_khedekar.pdf
- Proyecto Chebifier Web (relacionado): https://github.com/ChEB-AI/chebifier-web/
