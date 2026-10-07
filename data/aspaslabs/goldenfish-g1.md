# aspaslabs/goldenfish-g1

## Resumen

Goldenfish 1 es un modelo de decisión de propósito general desarrollado por aspaslabs. No es un modelo generativo: recibe un estado (una pregunta más un contexto) y una lista de candidatos en forma de cadenas de texto, y devuelve una distribución de probabilidad sobre esos candidatos. La misma llamada, con los mismos pesos, sirve para decisiones binarias (sí/no), clasificación de pocas etiquetas, detección de intención con decenas o cientos de intenciones, priorización, políticas de contenido, selección de herramientas, enrutado a agentes o ranking de respuestas.

Técnicamente es un bi-encoder construido sobre el backbone `BAAI/bge-m3` (XLM-RoBERTa large, 24 capas, 1024 de dimensión oculta), al que se añaden cabezas de proyección y un módulo de refinamiento sobre conjuntos denominado SetMixer. El modelo totaliza 576.164.353 parámetros (566.705.152 en el backbone y 9.459.203 en las cabezas de decisión) y trabaja con ventanas de hasta 4096 tokens de estado y 128 tokens por candidato. Se distribuye en float32 con licencia Apache 2.0.

Su relevancia actual está en que cubre una tarea (elegir entre alternativas) que normalmente obliga a entrenar un clasificador por conjunto de etiquetas. Aquí las etiquetas son cadenas arbitrarias que se pasan en tiempo de inferencia, sin reentrenamiento, y si el conjunto de candidatos es fijo se pueden precalcular sus embeddings para que una decisión con 301 candidatos cueste prácticamente lo mismo que una con 2. El repositorio acumula 0 descargas y 1 like en el momento de la consulta, por lo que se trata de un modelo muy reciente y sin validación independiente publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder con cabeza de refinamiento sobre conjuntos (SetMixer); backbone transformer tipo XLM-RoBERTa large |
| Parametros totales | 576.164.353 (backbone 566.705.152; cabezas de decision 9.459.203) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 4096 tokens de estado; 128 tokens por candidato |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales. La carga admite float32 (por defecto) y `dtype=torch.bfloat16` opcional |
| Idiomas soportados | Ingles, portugues, codigo y texto mixto; el backbone es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` en float32, con SHA256 en `SHA256SUMS`; tokenizer y codigo incluidos (repo de 2,3 GB) |

## Arquitectura y entrenamiento

Goldenfish es un bi-encoder con una cabeza de refinamiento a nivel de conjunto. El estado se construye como `question [SEP] context` y pasa por el encoder compartido, seguido de CLS, un MLP, LayerNorm y normalización L2, produciendo un vector `s` de 512 dimensiones. Cada candidato pasa por el mismo encoder y por su propia proyección, generando `c_i`, también de 512 dimensiones. La puntuación base es una similitud coseno escalada por una temperatura aprendida (`tau = 0.045` en esta release), lo que convierte la parte separable del cálculo en un único producto matricial y permite precalcular los embeddings de un conjunto de candidatos fijo.

Sobre esa primera fase se aplica SetMixer: un Transformer encoder de 2 capas que opera sobre el conjunto formado por el estado y los 8 mejores candidatos de la fase base. Cada token de candidato lleva su embedding más su puntuación de primera fase, y el modelo no usa embeddings posicionales, de modo que el refinamiento es equivariante al orden de los candidatos. La salida de SetMixer es un residuo que se suma a los logits de esos 8 candidatos; con más de 8 candidatos, el resto conserva su puntuación de primera fase (la model card se interrumpe en este punto). El resultado final se normaliza con softmax para obtener la distribución de probabilidad.

No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Los tags del modelo indican fine-tuning sobre `BAAI/bge-m3` (revision `5617a9f6`), y el autor declara entrenamiento sobre inglés, portugués, código y texto mixto.

## Capacidades

- Clasificación de decisión binaria: preguntas tipo sí/no con dos candidatos.
- Clasificación de pocas etiquetas: categorización genérica con un puñado de opciones.
- Detección de intención: conjuntos de 10 a 150 intenciones en una sola llamada, sin reentrenamiento.
- Priorización: asignación de niveles como `low`, `medium`, `high` sobre tickets o incidencias.
- Decisiones de política: veredictos tipo `allow`, `review`, `block` sobre contenido.
- Selección de herramienta: elección del siguiente tool a invocar por un agente, usando nombres o descripciones como candidatos.
- Enrutado y clasificación documental: asignación de tickets, correos o documentos a colas o equipos.
- Ranking de respuestas: comparación de 2 a N respuestas candidatas y ordenación por preferencia.
- Clasificación con muchas etiquetas: cientos de categorías de producto u otras taxonomías amplias.
- Salidas estructuradas de decisión: el objeto `Decision` expone `choice`, `confidence`, `margin`, `entropy`, `ranked(k)` y el vector completo de probabilidades.
- Procesamiento por lotes mediante `decide_batch` con tuplas de contexto, pregunta y candidatos.
- Caché de candidatos: `cache_candidates` precalcula embeddings de un conjunto fijo y `rank` reutiliza esa caché.
- Capacidad multilingüe heredada del backbone, con foco declarado en inglés y portugués.
- No genera texto: su única salida es una distribución de probabilidad sobre los candidatos proporcionados.

## Casos de uso

- Triaje de atención al cliente: el modelo recibe el mensaje del usuario y una lista de categorías o colas (`reset_password`, `billing`, `cancel_account`, `technical_issue`) y devuelve la categoría con su confianza, lo que permite enrutar el ticket al equipo correcto y derivar a revisión humana los casos con margen bajo.
- Detección de intención en asistentes conversacionales: con 10 a 150 intenciones definidas como cadenas, se evita entrenar y mantener un clasificador dedicado; si el catálogo de intenciones es fijo, `cache_candidates` reduce cada decisión a una pasada del encoder sobre el estado.
- Moderación de contenido y cumplimiento de políticas: el modelo decide entre `allow`, `review` y `block` a partir de una pregunta de política y del texto a evaluar, integrándose en un pipeline previo a la publicación.
- Enrutado de herramientas en agentes: dado el estado de la conversación y la lista de herramientas disponibles (nombres o descripciones), el modelo selecciona la siguiente llamada; la salida `margin` y `entropy` permiten activar una estrategia de fallback cuando la decisión es ambigua.
- Clasificación de disputas y operaciones bancarias: categorizar cargos (`fraud`, `refund`, `card_delivery`, `cash_withdrawal`) a partir de descripciones libres del cliente, con probabilidades ordenadas para auditar los casos dudosos.
- Priorización de incidencias técnicas: asignar `low`, `medium` o `high` a descripciones de fallos, usando `decide_batch` para procesar lotes de tickets en una sola pasada.
- Ranking de respuestas candidatas: en sistemas de generación con múltiples borradores, usar el modelo como juez que ordena de 2 a N respuestas y selecciona la mejor sin necesidad de un modelo generativo adicional.
- Clasificación de catálogo con cientos de etiquetas: taxonomías amplias de producto o documento donde `rank` con caché de candidatos mantiene el coste constante frente al tamaño del conjunto de etiquetas.
- Verificación de respuestas con contexto: decidir si un pasaje responde a una pregunta (`yes`/`no`) usando la ventana de 4096 tokens de estado, útil en pipelines de control de calidad de resúmenes o respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 2,3 GB en float32 (coincide con el tamaño del repositorio) y en torno a 1,2 GB en bfloat16.
- VRAM total estimada para inferencia: del orden de 2,5 a 4 GB en float32 con lotes pequeños, ya que se trata de un encoder sin caché KV autoregresiva y las activaciones son moderadas.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4070, RTX 4090). También es viable en CPU, ya que la model card indica verificación en CPU con transformers 4.4x y 5.x.
- GPU recomendadas para producción con lotes grandes: A100, H100 o L40S, aunque el modelo es lo bastante pequeño como para que una sola GPU de gama media sea suficiente en la mayoría de cargas.
- Opciones de despliegue: el paquete oficial `goldenfish` (instalable desde el Hub con `pip install "git+https://huggingface.co/aspaslabs/goldenfish-g1"`), carga mediante `Goldenfish.from_pretrained` con `device="cuda"` y `dtype=torch.bfloat16` opcionales, y uso con transformers 4.4x y 5.x. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de entorno: Python 3.10 o superior y pip 23 o superior.
- Latencia y throughput: no disponibles. La model card solo señala que, con caché de candidatos, una decisión sobre 301 candidatos cuesta la misma pasada del encoder que una sobre 2, más un producto matricial de 301 x 512 y un refinamiento sobre los 8 mejores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aspaslabs/goldenfish-g1 | 576.164.353 | 4096 tokens de estado, 128 por candidato | Decision sobre candidatos, sin generacion | Apache 2.0 | HuggingFace (0 descargas, 1 like en el momento de la consulta) |
| BAAI/bge-m3 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Embeddings multilingues; es el backbone de goldenfish-g1 | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas de reranking o clasificacion zero-shot de la misma categoria | no disponible | no disponible | Puntuacion o clasificacion por pares | no disponible | no disponible |

No se dispone de datos comparativos de benchmarks ni de especificaciones completas de las alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo no genera texto. Solo puntúa y elige entre los candidatos que se le pasan; cualquier tarea que requiera producción de lenguaje necesita otro componente.
- La calidad de la decisión depende por completo de los candidatos suministrados. Etiquetas ambiguas, solapadas o mal nombradas degradan el resultado, y añadir una etiqueta no requiere entrenamiento pero sí cuidado en su redacción.
- Límite de 128 tokens por candidato: descripciones de herramientas o intenciones más largas deben recortarse o resumirse.
- Límite de 4096 tokens de estado: contextos más largos requieren truncado o segmentación, con la pérdida de información que ello implica.
- Idiomas: el entrenamiento declarado cubre inglés, portugués, código y texto mixto. Aunque el backbone es multilingüe, no hay garantía de rendimiento equivalente en otros idiomas, incluido el castellano.
- Riesgo de calibración: se ofrecen `confidence`, `margin` y `entropy`, pero no se han publicado curvas de calibración ni evaluaciones de fiabilidad de esas probabilidades. No conviene usarlas como umbrales automáticos sin validación propia.
- Sesgos: al derivar de `BAAI/bge-m3` y de datos no especificados, el modelo puede heredar sesgos presentes en el corpus del backbone. No se documenta ningún proceso de mitigación.
- Alucinación: al no generar texto, el riesgo clásico de alucinación no aplica, pero sí el de asignar una etiqueta incorrecta con alta confianza cuando el estado no encaja con ningún candidato.
- Madurez: el repositorio registra 0 descargas y 1 like, con creación y última actualización el mismo día. No hay validación independiente, benchmarks publicados ni evidencia de uso en producción.
- La model card está truncada en la descripción del comportamiento de SetMixer cuando hay más de 8 candidatos, por lo que el detalle exacto de esa rama del cálculo no está completamente documentado.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con las obligaciones habituales de conservar avisos de licencia y de patentes asociadas.
- Producción: no se documentan soportes para servidores de inferencia habituales (vLLM, TGI, Ollama) ni métricas de latencia, throughput o consumo bajo carga, por lo que el dimensionamiento debe hacerse con pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aspaslabs/goldenfish-g1
- Modelo base: https://huggingface.co/BAAI/bge-m3
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
