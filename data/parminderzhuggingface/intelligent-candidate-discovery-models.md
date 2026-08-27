# ParminderzHuggingFace/intelligent-candidate-discovery-models

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de artefactos de recuperación semántica precomputados para un sistema de descubrimiento y ranking de candidatos. Fue desarrollado por Parminder Singh (ParminderzHuggingFace) como parte de la solución presentada al reto Redrob AI — India Runs Data & AI Challenge (Track 1). El paquete incluye un índice FAISS de 768 dimensiones (IndexFlatIP), un diccionario de metadatos de candidatos y metadatos de embeddings, todos generados offline con el modelo de embeddings BAAI/bge-base-en-v1.5.

El propósito es permitir que una aplicación desplegada realice búsqueda semántica sobre perfiles de candidatos a partir de descripciones de puestos, sin necesidad de regenerar los embeddings en tiempo de arranque. La relevancia actual radica en que demuestra un patrón práctico de separación entre código, datos y artefactos de recuperación en un pipeline de selección de personal basado en IA, usando componentes open source (FAISS, sentence-transformers, BGE). El repositorio tiene un tamaño de 0.3 GB, licencia MIT y está etiquetado como feature-extraction.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Indice FAISS IndexFlatIP (768 dimensiones) sobre embeddings de BAAI/bge-base-en-v1.5 |
| Parametros totales | no disponible (el repositorio no contiene pesos de modelo, solo artefactos de indizacion) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo de embeddings subyacente, bge-base-en-v1.5 soporta hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones; el indice FAISS es de precision completa) |
| Idiomas soportados | no disponible (los metadatos no especifican idiomas; bge-base-en-v1.5 esta entrenado principalmente para ingles) |
| Licencia | MIT |
| Formato de pesos | no aplica (artefactos: faiss.index, candidate_lookup.pkl, embedding_metadata.pkl) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino artefactos derivados de un modelo de embeddings existente. Los embeddings se generaron con BAAI/bge-base-en-v1.5, un transformer encoder de la familia BGE (BAAI General Embedding) con 109 millones de parametros, entrenado para tareas de recuperacion semantica y ranking. Sobre estos embeddings se construyo un indice FAISS de tipo IndexFlatIP (producto interno, equivalente a similitud coseno si los vectores estan normalizados), con dimensionalidad 768.

El proceso de entrenamiento o ajuste no se documenta en la informacion disponible. No se mencionan datos de entrenamiento, numero de tokens, ni tecnicas como RLHF o DPO. La arquitectura del sistema completo separa el codigo fuente (GitHub), los datos de candidatos (dataset en Hugging Face) y los artefactos de recuperacion (este repositorio). Los artefactos se precomputan offline y la aplicacion de produccion los descarga automaticamente si no estan disponibles localmente.

## Capacidades

- Recuperacion semantica de perfiles de candidatos: dado un texto de descripcion de puesto, el indice FAISS permite obtener los candidatos mas relevantes por similitud de embeddings.
- Ranking de candidatos: el sistema completo (no solo este repositorio) combina la recuperacion semantica con un mecanismo de puntuacion determinista hibrido que pondera relevancia profesional, coincidencia de habilidades, senales de comportamiento y consistencia del perfil.
- Integracion con aplicaciones desplegadas: los artefactos se descargan y cargan en tiempo de ejecucion, lo que facilita el despliegue en entornos de produccion sin recalcular embeddings.
- Compatibilidad con el ecosistema FAISS: el indice IndexFlatIP es un metodo de fuerza bruta que garantiza resultados exactos para busquedas por producto interno, adecuado para conjuntos de datos de tamano moderado.
- Uso como componente de busqueda semantica general: aunque esta orientado a candidatos, el indice y los metadatos podrian reutilizarse para otras tareas de recuperacion si se adaptan los datos.

## Casos de uso

- Seleccion de personal automatizada: el sistema recupera candidatos relevantes a partir de una descripcion de vacante, reduciendo el tiempo de cribado inicial. Es adecuado porque el indice FAISS permite busquedas rapidas sobre un conjunto fijo de perfiles.
- Ranking de candidatos para entrevistas: tras la recuperacion, el mecanismo de puntuacion hibrido ordena los perfiles segun multiples criterios, lo que ayuda a priorizar entrevistas.
- Busqueda semantica en bases de datos de talento: organizaciones con un repositorio de CVs pueden usar este patron para buscar por competencias, experiencia o proyectos, en lugar de palabras clave exactas.
- Prototipado de sistemas de recomendacion de empleo: el flujo de separar artefactos de recuperacion y datos permite iterar rapidamente sobre el modelo de embeddings sin reindexar todo.
- Demostracion de arquitectura para retos de IA: el repositorio sirve como ejemplo de como estructurar una solucion completa (codigo, datos, artefactos) en un entorno de competicion.
- Integracion en pipelines de RRHH con Streamlit: la aplicacion viva en Hugging Face Spaces muestra como consumir estos artefactos desde una interfaz web para interaccion con reclutadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas de recuperacion como nDCG o Recall@K. El rendimiento del indice FAISS depende del numero de candidatos indexados y de la calidad de los embeddings de bge-base-en-v1.5, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- El repositorio pesa 0.3 GB, por lo que el almacenamiento necesario es minimo.
- La carga del indice FAISS y los metadatos requiere memoria RAM suficiente para albergar los vectores de 768 dimensiones. Para un conjunto de candidatos de tamano moderado (miles), un equipo con 8-16 GB de RAM es suficiente.
- No se requiere GPU para la inferencia, ya que la busqueda se realiza sobre vectores precomputados con FAISS en CPU.
- El despliegue puede hacerse en cualquier maquina con Python y las librerias FAISS, pickle y sentence-transformers (solo si se necesitan generar nuevos embeddings).
- La aplicacion de ejemplo se ejecuta como un Space de Hugging Face (Streamlit), que proporciona recursos CPU limitados pero suficientes para este caso.
- No se dispone de datos de latencia o throughput especificos, pero un indice IndexFlatIP con miles de vectores suele responder en milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa. Este repositorio no es un modelo de lenguaje, sino un conjunto de artefactos de recuperacion. Como referencia conceptual, se puede comparar con otros sistemas de busqueda semantica de candidatos que usan modelos de embeddings como:

| Sistema | Modelo de embeddings | Indice | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio | BAAI/bge-base-en-v1.5 | FAISS IndexFlatIP | MIT | Hugging Face |
| Otros sistemas de ranking de candidatos | OpenAI embeddings, E5, etc. | Qdrant, Milvus, Pinecone | Variable | Comercial o open source |
| Soluciones de busqueda semantica genericas | sentence-transformers | FAISS, Elasticsearch | Variable | Hugging Face, GitHub |

No hay datos publicos de rendimiento comparativo entre estos sistemas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene el modelo de embeddings en si, solo los artefactos derivados. Para regenerar embeddings o ampliar el indice, se necesita acceso a BAAI/bge-base-en-v1.5 y a los datos originales de candidatos.
- El indice FAISS es estatico: si se anaden nuevos candidatos, hay que regenerar los embeddings y reconstruir el indice offline.
- No se especifican los idiomas de los perfiles. bge-base-en-v1.5 esta optimizado para ingles, por lo que el rendimiento en otros idiomas puede degradarse.
- La licencia MIT cubre los artefactos, pero el uso del modelo de embeddings subyacente (bge-base-en-v1.5) tiene su propia licencia (MIT tambien, segun su pagina oficial, aunque conviene verificarlo).
- No hay informacion sobre sesgos en los datos de candidatos. El sistema podria heredar sesgos presentes en el dataset original (india-runs-candidates), lo que afectaria a la equidad en seleccion de personal.
- El riesgo de alucinacion no aplica directamente, ya que no es un modelo generativo, pero la calidad de la recuperacion depende de la cobertura y limpieza de los datos de candidatos.
- Para uso en produccion, se recomienda validar la calidad de los embeddings y el umbral de similitud para evitar falsos positivos o negativos en la seleccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ParminderzHuggingFace/intelligent-candidate-discovery-models
- Aplicacion viva (Space): https://huggingface.co/spaces/ParminderzHuggingFace/redrob-ai-candidate-ranking
- Dataset de candidatos: https://huggingface.co/datasets/ParminderzHuggingFace/india-runs-candidates
- Codigo fuente en GitHub: https://github.com/ParminderSinghGithub/India-Runs-Intelligent-Candidate-Discovery
- Perfil del autor: https://huggingface.co/ParminderzHuggingFace
- Modelo de embeddings subyacente: https://huggingface.co/BAAI/bge-base-en-v1.5
