# satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-bigcn-bert

## Resumen

bigcn_bert es un clasificador de grafos desarrollado por satyam-arora-iiit-hyderabad en el contexto de la asignatura ANLP (Advanced Natural Language Processing), Assignment 3 Part 2. El modelo combina una arquitectura de red neuronal sobre grafos de tipo BERT (BigCN, o "BERT-based Graph Convolutional Network") con embeddings de lenguaje para clasificar grafos de propagacion de noticias del dataset GossipCop UPFD. Su proposito es determinar la veracidad de una noticia a partir de la estructura de difusion en redes sociales y del contenido textual asociado.

El repositorio tiene un tamano de 0.0 GB y no incluye informacion sobre arquitectura, parametros, contexto ni licencia. La model card unicamente reporta metricas de evaluacion: una precision media de 0.9493, un recall macro medio de 0.9494, un F1 macro medio de 0.9493 y una exactitud media de 0.9493. Estos valores sugieren un rendimiento alto en la tarea de clasificacion binaria de noticias falsas sobre GossipCop.

Se trata de un artefacto academico de un curso universitario, no de un modelo de proposito general. Su relevancia es limitada fuera del ambito de la deteccion de desinformacion basada en grafos de propagacion, y su publicacion no incluye los detalles necesarios para reproducir el entrenamiento o desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BigCN (graph neural network sobre grafos de propagacion) combinada con BERT |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card indica que el modelo se denomina "bigcn_bert" y que se trata de un clasificador de grafos para el dataset GossipCop UPFD. La nomenclatura sugiere una combinacion de BigCN (una red neuronal sobre grafos de propagacion de noticias) con representaciones BERT para las caracteristicas textuales de los nodos. No se proporciona informacion sobre el numero de capas, dimensiones ocultas, mecanismos de atencion ni sobre el esquema de agregacion de mensajes.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico dato de entrenamiento disponible son las metricas medias reportadas en la model card, que corresponden a la tarea de clasificacion binaria de GossipCop UPFD.

## Capacidades

- Clasificacion binaria de grafos de propagacion de noticias (verdadera/falsa) sobre el dataset GossipCop UPFD.
- Procesamiento de caracteristicas textuales mediante BERT, presumiblemente para nodos de noticias y respuestas.
- Modelado de la estructura del grafo de difusion para la deteccion de desinformacion.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.

## Casos de uso

- Deteccion de noticias falsas en GossipCop: el modelo clasifica un grafo de propagacion de una noticia como veridica o falsa, usando la estructura de difusion y el contenido textual. Es adecuado porque ha sido entrenado especificamente sobre este dataset y reporta un F1 macro medio de 0.9493.
- Investigacion academica en deteccion de desinformacion: sirve como linea base reproducible para comparar arquitecturas BigCN+BERT en tareas de clasificacion de grafos de noticias, dado que las metricas estan documentadas en la model card.
- Analisis de propagacion en redes sociales: permite estudiar como la estructura del grafo (respuestas, retuits, hilos) aporta senal para distinguir noticias verificadas de no verificadas en un corpus concreto.
- Experimentos de ablacion en cursos de ANLP: el modelo es util como referencia para comparar variantes de agregacion de grafos o de embeddings textuales en el mismo dataset.
- Evaluacion de pipelines de clasificacion de grafos: puede integrarse en un banco de pruebas para medir el rendimiento de infraestructura de inferencia sobre grafos de tamano variable.
- Docencia y formacion: sirve como ejemplo practico de combinacion de GNN y transformers para tareas de clasificacion estructurada en un entorno academico.

## Benchmarks y rendimiento

Los unicos datos disponibles son las metricas medias reportadas en la model card para la tarea de GossipCop UPFD:

| Metrica | Valor medio |
|---|---|
| Accuracy | 0.9493 |
| Precision macro | 0.9497 |
| Recall macro | 0.9494 |
| F1 macro | 0.9493 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio no incluye pesos ni instrucciones de ejecucion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos que permitan establecer una comparacion fiable en parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio tiene un tamano de 0.0 GB y no contiene informacion sobre pesos, configuracion ni tokenizador, por lo que no es posible verificar su reproducibilidad ni desplegarlo.
- La licencia no esta especificada, lo que impide determinar si su uso comercial esta permitido.
- Los idiomas soportados no estan documentados; el dataset GossipCop es predominantemente en ingles, por lo que el modelo probablemente no generaliza a otros idiomas.
- Las metricas reportadas son medias sobre el dataset GossipCop UPFD y no hay validacion independiente; el riesgo de sobreajuste al corpus es alto.
- No hay informacion sobre sesgos conocidos, riesgo de alucinacion (no es un modelo generativo) ni sobre el dominio de aplicacion fuera de la deteccion de desinformacion.
- Al ser un artefacto academico de un curso, no hay garantia de mantenimiento, soporte ni actualizaciones.
- No se debe asumir que el modelo es un LLM de proposito general: es un clasificador de grafos especifico de una tarea.

## Enlaces

- Hugging Face: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-bigcn-bert
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
