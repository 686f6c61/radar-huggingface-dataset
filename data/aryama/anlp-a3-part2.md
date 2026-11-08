# Aryama/anlp-a3-part2

## Resumen

`Aryama/anlp-a3-part2` no es un modelo de lenguaje generativo, sino un paquete de artefactos de experimentacion academica: 45 checkpoints de modelos de clasificacion de grafos entrenados en PyTorch sobre los splits de UPFD GossipCop. El autor (Aryama) los publica como parte de una asignatura de Analisis de NLP (ANLP), con el objetivo de reproducir tablas comparativas de deteccion de noticias falsas sobre grafos de propagacion de noticias.

La arquitectura principal citada es BiGCN (Bi-Directional Graph Convolutional Network), segun Chen et al., arXiv:2101.05519, referenciada en el enunciado de la practica. El repositorio incluye las configuraciones de cada checkpoint y un manifiesto de experimento congelado con hashes SHA256 para garantizar reproducibilidad. El modelo no tiene pipeline declarado en Hugging Face, no declara licencia ni idiomas, y el tamano del repositorio es de 0.0 GB, lo que sugiere pesos de dimension reducida o que los ficheros binarios no estan materializados en el repo.

Por su naturaleza, no es un modelo util para inferencia general: es un conjunto de pesos y configuraciones para replicar un experimento concreto de clasificacion binaria (noticia falsa o veridica) sobre grafos de difusion. Su relevancia es exclusivamente docente y de reproducibilidad cientifica, no de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiGCN (Bi-Directional Graph Convolutional Network) segun Chen et al., arXiv:2101.05519; incluye otros modelos PyTorch personalizados del experimento |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre grafos de propagacion) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en precision de entrenamiento) |
| Idiomas soportados | no disponible (la tarea es clasificacion de grafos; el contenido textual subyacente es del dataset GossipCop, en ingles) |
| Licencia | no disponible (la model card indica que el dataset y los papers citados conservan sus propias licencias) |
| Formato de pesos | checkpoints PyTorch (`.pt`/`.pth`), no safetensors ni GGUF |
| Numero de checkpoints | 45 (mejor macro-F1 de validacion) |
| Dataset de entrenamiento | UPFD GossipCop splits |
| Tarea | Clasificacion de grafos / deteccion de noticias falsas |
| Manifiesto congelado SHA256 | `1cdb483fad854bdf3eb77f61aeb82e60fc2f49560f0dad5d1b10d4672f4b5a6a` |
| SHA256 del codigo de entrenamiento | `ab04b42c9ef3ec0751d770466310079265f053306de7e25ab2276d06abdd6f8e` |

## Arquitectura y entrenamiento

El componente central es BiGCN, una red convolucional de grafos bidireccional disenada para clasificar la veracidad de una noticia a partir del grafo de propagacion de sus retuits y respuestas. El grafo se construye con dos direcciones de aristas (de la noticia hacia los usuarios y de los usuarios hacia la noticia), lo que permite modelar tanto la difusion como la respuesta. El repositorio contiene 45 checkpoints seleccionados por mejor macro-F1 en validacion, junto con sus configuraciones, lo que indica una busqueda de hiperparametros o un barrido de semillas sobre los splits de UPFD GossipCop.

No se dispone de informacion sobre el numero de tokens, la composicion exacta del dataset ni sobre si se aplicaron tecnicas de aumento de datos o regularizacion especificas. La model card menciona que los modelos son "custom PyTorch models" y que la reproducibilidad se garantiza mediante un manifiesto congelado y un script (`bash scripts/part2/test_gnn.sh`) en el repositorio fuente, no incluido en Hugging Face. No hay evidencia de RLHF, DPO ni de innovaciones como decodificacion especulativa, ya que no es un modelo autoregresivo.

## Capacidades

- Clasificacion binaria de grafos de propagacion de noticias (falsa o veridica) sobre el dataset UPFD GossipCop.
- Modelado de estructura de grafo con GCN bidireccional (BiGCN).
- Reproduccion de experimentos academicos mediante checkpoints y manifiesto congelado con hashes SHA256.
- Comparacion de multiples configuraciones y semillas (45 checkpoints) para analisis de robustez.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No es un modelo de agentes ni de conversacion.

## Casos de uso

- Reproduccion de resultados academicos: cargar los checkpoints y ejecutar `scripts/part2/test_gnn.sh` para regenerar las tablas comparativas del trabajo, verificando los hashes del manifiesto.
- Docencia en analisis de NLP: usar los 45 checkpoints como material de laboratorio para estudiar el efecto de hiperparametros y semillas en macro-F1 sobre grafos de noticias.
- Investigacion en deteccion de desinformacion: emplear BiGCN como linea base frente a modelos de grafos mas recientes sobre UPFD GossipCop.
- Analisis de propagacion en redes sociales: adaptar el pipeline a otros grafos de difusion de noticias con estructura similar (retuits y respuestas).
- Auditoria de reproducibilidad: comparar los hashes SHA256 del codigo y del manifiesto con las versiones locales para detectar desviaciones.
- Estudio de sesgos en datasets de noticias: analizar como el modelo clasifica noticias de dominios concretos del corpus GossipCop y documentar disparidades por fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que los checkpoints se seleccionaron por mejor macro-F1 de validacion, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamano del repositorio es de 0.0 GB, lo que sugiere modelos de dimension reducida compatibles con GPU de gama baja.
- GPU recomendadas: no disponible; por la naturaleza de GCN sobre grafos de UPFD, una GPU consumer (GTX 1660, RTX 3060) es probablemente suficiente, pero no hay datos confirmados.
- Cabe en GPU consumer: probablemente si, sin confirmacion oficial.
- Opciones de despliegue: PyTorch nativo; no aplica vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aryama/anlp-a3-part2 | BiGCN + modelos PyTorch custom | Clasificacion de grafos (UPFD GossipCop) | no aplica | no disponible | Hugging Face (0 descargas) |
| BiGCN original (Chen et al., 2021) | BiGCN | Deteccion de noticias falsas en grafos | no aplica | segun paper | Codigo en repositorio de los autores |
| GCN estandar sobre UPFD | GCN | Clasificacion de grafos | no aplica | no disponible | Multiples implementaciones |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no soporta tool calling.
- Licencia no declarada: no se especifica si se permite uso comercial; la model card solo aclara que el dataset y los papers conservan sus licencias.
- Artefacto educativo: el propio autor lo describe como "educational experiment artifacts", sin garantias de robustez en produccion.
- Dependencia del dataset UPFD GossipCop: el rendimiento fuera de esa distribucion (otras redes, idiomas o dominios) no esta validado.
- Riesgo de sesgo: GossipCop cubre un dominio concreto de noticias de entretenimiento y celebridades en ingles; el modelo puede heredar sesgos de etiquetado y de fuente.
- Reproducibilidad condicionada: requiere el repositorio fuente y el script `test_gnn.sh`, no incluidos en Hugging Face.
- Sin pipeline declarado ni descargas: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion futura (2026-11-07) en los metadatos: posible inconsistencia que conviene verificar antes de citar el recurso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aryama/anlp-a3-part2
- Perfil del autor: https://huggingface.co/Aryama
- Paper de referencia BiGCN: https://arxiv.org/abs/2101.05519
- Otro modelo del autor (contexto): https://huggingface.co/Aryama/anlp-a2-m26
