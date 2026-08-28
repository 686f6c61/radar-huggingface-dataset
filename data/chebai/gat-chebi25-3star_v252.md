# chebai/gat-chebi25-3star_v252

## Resumen

El modelo `chebai/gat-chebi25-3star_v252` es una Graph Attention Network (GAT) entrenada sobre el dataset ChEBI25-3STAR (v252), un subconjunto de la base de datos ChEBI (Chemical Entities of Biological Interest) que contiene entidades químicas con anotaciones de relevancia biológica. El modelo ha sido desarrollado por el grupo ChEB-AI, que publica tanto el dataset como la librería de grafos `python-chebai-graph` (v1.2.0) utilizada para el entrenamiento. Su propósito es aprender representaciones de moléculas a partir de su estructura gráfica para tareas de clasificación o predicción de propiedades químicas.

La relevancia de este modelo radica en su enfoque de integrar conocimiento químico explícito en redes neuronales de grafos, una línea de investigación que busca mejorar la interpretabilidad y el rendimiento en tareas de química computacional. El checkpoint se distribuye bajo licencia MIT, lo que permite su uso comercial y académico sin restricciones. Sin embargo, la información pública disponible es muy limitada: no se especifican el número de parámetros, la arquitectura exacta (número de capas, cabezas de atención, etc.) ni el contexto de entrada, más allá de que se trata de un GAT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Attention Network (GAT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (grafos moleculares, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo quimico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch Lightning (configuracion y version de libreria incluidas) |

## Arquitectura y entrenamiento

La arquitectura es una Graph Attention Network, un tipo de red neuronal de grafos que utiliza mecanismos de atención para ponderar la importancia de los nodos vecinos durante la agregación de información. En este caso, los nodos representan átomos y las aristas enlaces químicos, permitiendo al modelo capturar dependencias estructurales locales y globales de la molécula. El entrenamiento se realizó con la librería `python-chebai-graph` (v1.2.0) sobre el dataset ChEBI25-3STAR (v252), que contiene entidades químicas anotadas con tres estrellas (alta confianza) según la ontología ChEBI. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO, ya que no es un modelo de lenguaje. La tesis de maestría de Aditya Ganesh Khedekar (Universidad Otto-von-Guericke de Magdeburg, 2026) describe la integración de conocimiento químico en GNN, y es la referencia principal para entender el diseño del modelo.

## Capacidades

- Clasificación de entidades químicas: el modelo puede predecir categorías o propiedades de moléculas representadas como grafos, basándose en las anotaciones de ChEBI.
- Representación de moléculas: genera embeddings de grafos moleculares que pueden utilizarse como entrada para otros modelos o para análisis de similitud química.
- Integración de conocimiento químico: al estar entrenado sobre ChEBI, incorpora ontologías y relaciones semánticas entre compuestos, lo que puede mejorar la interpretabilidad de las predicciones.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso en el sentido de los LLM. Su dominio es exclusivamente la química estructural.

## Casos de uso

- Predicción de propiedades fisicoquímicas: dado un compuesto, el modelo puede estimar propiedades como solubilidad, lipofilia o toxicidad, útiles en fases tempranas de descubrimiento de fármacos.
- Clasificación de entidades biológicas: asignar categorías de ChEBI (por ejemplo, roles biológicos o aplicaciones) a nuevas moléculas, facilitando la anotación automática de bases de datos.
- Filtrado de compuestos en screening virtual: integrar el modelo en pipelines de cribado para priorizar candidatos con mayor probabilidad de actividad biológica.
- Análisis de similitud química: usar los embeddings generados para agrupar compuestos por similitud estructural, apoyando la búsqueda de análogos.
- Generación de características para QSAR: los embeddings del GAT pueden servir como descriptores moleculares en modelos de relación cuantitativa estructura-actividad.
- Educación e investigación: como modelo de referencia para estudiar la aplicación de GNN en química, dado su código abierto y su documentación asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión, recall u otras métricas sobre conjuntos de validación estándar (por ejemplo, MoleculeNet, QM9, etc.). Tampoco se comparan con otros modelos GNN en la model card.

## Requisitos de hardware

- Al ser un GNN de tamaño no especificado, los requisitos de hardware no están documentados. En general, un GAT para moléculas pequeñas (menos de 100 átomos) puede ejecutarse en CPU con memoria RAM moderada (8-16 GB) o en GPUs de gama media (por ejemplo, RTX 3060 o superior) si se procesan lotes grandes.
- No se indica si el checkpoint está cuantizado, por lo que se asume que se usa en precisión flotante (FP32 o FP16).
- Opciones de despliegue: al ser un modelo de PyTorch Lightning, puede servirse con frameworks como TorchServe o integrarse en scripts de Python. No es compatible directamente con vLLM, llama.cpp u Ollama, que están orientados a LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros GNN para química (por ejemplo, GIN, MPNN, Chemprop). La información disponible no incluye métricas ni referencias a modelos comparables. Se recomienda consultar la tesis de Khedekar para posibles comparaciones internas, pero no se han extraído datos de ella en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre ChEBI, el modelo puede estar sesgado hacia las entidades y anotaciones presentes en esa base de datos, que no cubren todo el espacio químico.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede producir predicciones incorrectas para moléculas fuera de la distribución de entrenamiento.
- Limitaciones de contexto: el modelo opera sobre grafos moleculares; no maneja texto ni secuencias, por lo que no es adecuado para tareas de lenguaje natural.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero se debe atribuir el copyright original. No hay restricciones adicionales conocidas.
- Caveat para producción: la ausencia de benchmarks y de especificaciones detalladas (número de parámetros, arquitectura exacta) dificulta evaluar su robustez y comparabilidad. Se recomienda validar el modelo en el dominio de aplicación específico antes de usarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chebai/gat-chebi25-3star_v252
- Dataset ChEBI25-3STAR: https://huggingface.co/datasets/chebai/ChEBI25-3STAR
- Repositorio de la librería ChEB-AI Graph: https://github.com/ChEB-AI/python-chebai-graph
- Tesis de maestría (PDF): https://www.uni-osnabrueck.de/fileadmin/informatik/Arbeitsgruppen/Hybride_KI/mt_aditya_khedekar.pdf
- Perfil del autor en Hugging Face: https://huggingface.co/chebai
