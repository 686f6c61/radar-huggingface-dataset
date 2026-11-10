# satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-sage-bert

## Resumen

`sage_bert` es un modelo de clasificación de grafos desarrollado por el usuario `satyam-arora-iiit-hyderabad` como parte de la asignatura ANLP (Advanced Natural Language Processing), en el tercer trabajo práctico, parte 2. El modelo combina GraphSAGE, una arquitectura de red neuronal sobre grafos, con representaciones derivadas de BERT para clasificar nodos en el conjunto de datos GossipCop, un corpus de verificación de noticias construido a partir del dataset UPFD (User Preference-aware Fake News Detection).

El repositorio tiene un tamaño declarado de 0.0 GB, lo que sugiere que no contiene pesos publicados o que estos no se han subido a la plataforma. La model card es extremadamente escueta y se limita a reportar métricas agregadas: accuracy media de 0,9258, precisión macro media de 0,9259, recall macro medio de 0,9258 y F1 macro medio de 0,9258. No se especifican detalles sobre la arquitectura exacta, el proceso de entrenamiento, los hiperparámetros ni la metodología de evaluación.

El interés de este modelo es limitado fuera del contexto académico del que procede: se trata de un artefacto de un trabajo de asignatura, sin licencia declarada, sin idiomas especificados, sin pipeline definido y sin descargas ni interacciones en el momento de la consulta. No obstante, resulta relevante como ejemplo de hibridación entre modelos de lenguaje y redes neuronales sobre grafos aplicada a la detección de desinformación, un área activa de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraphSAGE combinado con representaciones BERT (según el nombre y la descripción del repositorio; detalles exactos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño del repositorio declarado: 0.0 GB) |

## Arquitectura y entrenamiento

El nombre del modelo y la descripción de la model card indican una combinación de GraphSAGE (Graph Sample and Aggregate) con BERT para la clasificación de grafos en el dataset GossipCop dentro del marco UPFD. GraphSAGE es una familia de redes neuronales sobre grafos que genera representaciones de nodos mediante el muestreo y agregación de las características de los vecinos, lo que permite inducir embeddings para nodos no vistos durante el entrenamiento. La integración con BERT sugiere que las características iniciales de los nodos (probablemente el texto de las noticias) se obtienen a partir de embeddings contextuales de BERT, que después se propagan y agregan a través de las aristas del grafo de propagación de noticias.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de fases de ajuste fino supervisado o preferencias (RLHF/DPO), ni sobre innovaciones técnicas concretas como decodificación especulativa o atención lineal. La model card únicamente reporta métricas medias, lo que sugiere que el autor promedió resultados sobre varias ejecuciones o particiones, pero no se detalla el protocolo de evaluación ni el número de semillas empleadas.

## Capacidades

- Clasificación de nodos en grafos de propagación de noticias, orientada a la detección de noticias falsas en el dataset GossipCop.
- Representación de nodos mediante agregación de vecinos al estilo GraphSAGE, lo que permite aprovechar la estructura del grafo de difusión.
- Uso de características textuales derivadas de BERT como entrada al componente de grafos.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe; los idiomas soportados figuran como no disponibles.
- No se ha documentado ningún modo especial (thinking mode, visión, audio).

## Casos de uso

- Detección de desinformación en redes sociales: el modelo se aplicaría sobre el grafo de propagación de una noticia (usuarios que la comparten y sus relaciones) para clasificar el nodo raíz como veraz o falso, aprovechando la estructura de difusión que GraphSAGE captura.
- Investigación académica en detección de fake news: sirve como línea base reproducible para comparar variantes de agregación de grafos combinadas con codificadores tipo BERT sobre el benchmark UPFD-GossipCop.
- Análisis de campañas de difusión coordinada: al modelar las relaciones entre cuentas y publicaciones, puede emplearse para identificar patrones estructurales asociados a la propagación de contenido engañoso.
- Docencia y reproducción de experimentos: el artefacto es útil en cursos de NLP avanzado como ejemplo de pipeline completo que une un codificador de lenguaje con una red neuronal sobre grafos.
- Prototipado de sistemas de verificación asistida: integrado en una herramienta de moderación, podría priorizar noticias candidatas a revisión humana en función de la estructura de su grafo de propagación.
- Evaluación de técnicas de GraphSAGE sobre dominios periodísticos: permite estudiar el efecto del muestreo de vecinos y de la profundidad de agregación en un corpus real de verificación de hechos.

## Benchmarks y rendimiento

Los únicos resultados publicados en la model card son métricas agregadas sobre el dataset GossipCop (UPFD):

| Metrica | Valor medio |
|---|---|
| Accuracy | 0,9258 |
| Precision macro | 0,9259 |
| Recall macro | 0,9258 |
| F1 macro | 0,9258 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni se detalla el protocolo de evaluación que respalda estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el número de parámetros ni el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con la información disponible; el repositorio declara un tamaño de 0.0 GB, lo que sugiere que no se han subido pesos.
- Opciones de despliegue: no se ha documentado compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia. Al tratarse de un modelo de clasificación de grafos, requeriría un entorno con soporte para PyTorch Geometric o DGL, no disponible como dato confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría, ya que no se conocen los parámetros, el contexto ni los detalles de entrenamiento de este modelo. A modo orientativo, se citan referencias del área sin datos comparativos verificables:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sage_bert (este modelo) | no disponible | no disponible | no disponible | Repositorio Hugging Face sin pesos declarados (0.0 GB) |
| GCN / GraphSAGE estándar sobre UPFD | no disponible | no aplica | según implementación original | Código de referencia UPFD en GitHub |
| BiGCN sobre UPFD | no disponible | no aplica | según implementación original | Código de referencia UPFD en GitHub |
| GACL sobre UPFD | no disponible | no aplica | según implementación original | Repositorios académicos asociados |

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide determinar si el uso comercial está permitido; debe considerarse no apto para producción hasta aclarar este punto.
- El repositorio declara un tamaño de 0.0 GB, por lo que es probable que los pesos no estén publicados y el modelo no sea directamente utilizable.
- No se documentan sesgos conocidos, pero al entrenarse sobre GossipCop (noticias de entretenimiento y celebridades en inglés) es esperable un sesgo de dominio y de idioma.
- Riesgo de alucinación no aplicable en sentido estricto al ser un clasificador, pero sí riesgo de falsos positivos y negativos en la clasificación de noticias; las métricas reportadas no incluyen intervalos de confianza ni desviaciones.
- No se detalla el protocolo de evaluación (particiones, semillas, preprocesado), lo que dificulta reproducir o validar las cifras reportadas.
- El modelo procede de un trabajo de asignatura y no ha pasado por revisión por pares ni por un proceso de validación independiente.
- No se especifican los idiomas soportados; la ausencia de esta información impide garantizar su funcionamiento fuera del inglés.
- No hay información sobre requisitos de hardware, latencia ni throughput, lo que impide evaluar su viabilidad en entornos reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a3-part2-sage-bert
- Dataset UPFD (referencia del benchmark): https://github.com/safe-graph/GNN-FakeNews
- Artículo original de GraphSAGE (Hamilton et al., 2017): https://arxiv.org/abs/1706.02216
- Artículo original de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Dataset GossipCop: no disponible como enlace directo en la información proporcionada.
