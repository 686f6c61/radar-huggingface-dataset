# drzo/unicosys-hypergraph

## Resumen

El modelo Unicosys Hypergraph Knowledge Model es un sistema de representación de conocimiento basado en hipergrafos, desarrollado por el usuario drzo, que codifica la evidencia unificada de un caso legal específico (Case 2025-137857). Combina transacciones financieras, comunicaciones por correo electrónico, entidades y eventos temporales en un único grafo entrenable, diseñado para tareas de predicción de enlaces y razonamiento estructural. Con 34,7 millones de parámetros, integra un codificador de texto (Transformer de 2 capas, 4 cabezas) con una red de atención de grafos (GAT) para aprender representaciones de nodos y relaciones. Su relevancia radica en ofrecer un enfoque práctico para aplicar aprendizaje automático a datos legales y de investigación, permitiendo ajuste fino sobre un grafo de conocimiento concreto. Se distribuye bajo licencia MIT y su pipeline es graph-ml.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Node embedding (128-dim estructural + 256-dim texto), hidden 256, text encoder (Transformer 2 capas, 4 cabezas), graph attention (GAT 2 capas, 4 cabezas), link predictor (MLP 2 capas con margin ranking loss) |
| Parametros totales | 34.762.497 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina dos ramas de representación. Por un lado, los nodos se representan mediante embeddings estructurales de 128 dimensiones y embeddings de texto de 256 dimensiones, obtenidos a través de un codificador Transformer de 2 capas con 4 cabezas. Por otro lado, una red de atención de grafos (GAT) de 2 capas y 4 cabezas propaga información entre los nodos, capturando dependencias locales y globales. Finalmente, un predictor de enlaces basado en un MLP de 2 capas con pérdida margin ranking se encarga de puntuar la probabilidad de existencia de aristas. El entrenamiento se realiza mediante fine-tuning sobre tareas de predicción de enlaces, usando el grafo de conocimiento subyacente. No se han publicado detalles sobre el conjunto de datos de entrenamiento ni el número de tokens, pero el modelo está diseñado para codificar un grafo específico con 198.019 nodos y 13.415 aristas.

## Capacidades

- Representación de conocimiento en hipergrafos: codifica nodos y relaciones en un espacio vectorial continuo.
- Predicción de enlaces: puede inferir la probabilidad de que exista una relación entre dos nodos no conectados.
- Integración de texto y estructura: combina información textual de nodos (p.ej., contenido de emails) con la topología del grafo.
- Ajuste fino para tareas específicas: permite reentrenar el modelo sobre nuevos datos o grafos.
- No es un modelo de lenguaje: no genera texto ni respuestas conversacionales.
- No soporta tool calling ni agentes autónomos.

## Casos de uso

- Análisis de evidencia legal: el modelo puede ayudar a descubrir relaciones no evidentes entre entidades, transacciones y comunicaciones en un caso judicial, acelerando la revisión de documentos.
- Detección de fraude financiero: al combinar transacciones y comunicaciones, se pueden identificar patrones de colusión o transferencias sospechosas entre entidades.
- Reconstrucción de cronologías de eventos: con los nodos de timeline (10 eventos), el modelo puede ayudar a ordenar y conectar hechos en el tiempo.
- Análisis de comunicaciones corporativas: permite mapear la red de correos entre empleados y terceros, identificando influencias o cadenas de mando no explícitas.
- Investigación de relaciones entre entidades: el modelo predice posibles vínculos no documentados entre personas u organizaciones, lo que puede orientar nuevas líneas de investigación.
- Entrenamiento y adaptación a nuevos casos: gracias a su diseño modular, se puede reentrenar el modelo con grafos de otros casos legales o de investigación, manteniendo la misma arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan especificaciones de VRAM ni GPU en la documentación del modelo.
- Con 34,7 millones de parámetros, la inferencia es ligera y podría ejecutarse en CPU, aunque el tamaño del repositorio (22,8 GB) se debe principalmente a los tensores del grafo codificado, no a los pesos del modelo.
- El modelo es compatible con la librería transformers de Hugging Face, pero su pipeline es graph-ml, por lo que su despliegue típico es en entornos de investigación o análisis de datos, no en servidores de inferencia estándar.
- No se indican opciones de despliegue como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos equivalentes de grafos de conocimiento con características comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el caso legal 2025-137857; su generalización a otros dominios o casos es limitada sin un reentrenamiento.
- El grafo subyacente está desequilibrado: 197.993 nodos son correos electrónicos, mientras que las transacciones financieras y documentos legales son 0. Esto puede sesgar las predicciones hacia relaciones de comunicación.
- Al ser un modelo de grafos, no es adecuado para generación de texto ni para tareas de lenguaje natural.
- La licencia MIT permite uso comercial, pero no hay garantía de exactitud en las predicciones, especialmente en contextos legales donde los errores pueden tener consecuencias.
- El repositorio tiene un tamaño considerable (22,8 GB) debido a los tensores del grafo, lo que puede afectar la descarga y el almacenamiento.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/drzo/unicosys-hypergraph)
- [Repositorio del pipeline Unicosys en GitHub](https://github.com/hyperholmes/unicosys)
- [Perfil de drzo en GitHub](https://github.com/drzo)
