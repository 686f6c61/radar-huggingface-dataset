# mobarmg/jev-schema-scorer-deberta-v3-large

## Resumen

jev-schema-scorer-deberta-v3-large es un modelo de clasificación de texto desarrollado por el usuario mobarmg, consistente en un encoder DeBERTa-v3-large con una única cabeza escalar que puntúa pares `(state, question + candidate)`. A partir de esos logits escalares, un decodificador determinista escrito en Python agrupa las puntuaciones por pregunta y las convierte en tres primitivas de respuesta: elección entre opciones (`choice`), verificación binaria de una proposición (`noul`) y puntuación ordinal sobre una escala (`score`). El texto de la pregunta, los criterios y los identificadores de las opciones se leen en tiempo de inferencia, no están fijados en los pesos, por lo que el mismo checkpoint responde a preguntas nuevas sobre conjuntos de etiquetas nuevos sin reentrenamiento.

El modelo parte de `microsoft/deberta-v3-large` y añade una cabeza de clasificación con `num_labels=1`; el total de parámetros publicados en safetensors es de 435.062.785, prácticamente idéntico al del modelo base más la cabeza escalar. La ventana efectiva es de 512 tokens, que debe alojar conjuntamente el estado, el esquema de la pregunta y el candidato evaluado. Se distribuye con licencia MIT y está entrenado y evaluado únicamente en inglés.

Su relevancia práctica radica en que sustituye a un LLM generativo en tareas de clasificación con salida estructurada: con 435 M de parámetros, coste lineal respecto al número de candidatos y probabilidades calibradas (Brier de 0,052 en la primitiva `noul`), ofrece una alternativa determinista y barata para triaje, enrutado y puntuación ordinal en pipelines de producción. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto reciente y sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only DeBERTa-v2 (DeBERTa-v3) con atención desacoplada y cabeza de clasificación escalar (`num_labels=1`) |
| Parametros totales | 435.062.785 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (estado + esquema + candidato deben caber en conjunto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo distribuye safetensors y su tamano (1,7 GB) es coherente con pesos en FP32 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors, mas `schema_scorer.py` (compilador de peticiones, decodificador y adaptador `LocalSystemOne`) |
| Modelo base | microsoft/deberta-v3-large (fine-tuning) |
| Tarea (pipeline) | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 1,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un encoder DeBERTa-v3-large (arquitectura DeBERTa-v2, 24 capas, atención desacoplada de contenido y posición) al que se le ha sustituido la cabeza de clasificación por una cabeza escalar única. Cada candidato de una pregunta se evalúa en un par de secuencias: `sequence_a` es el estado (texto libre o un objeto JSON serializado) y `sequence_b` contiene el candidato junto con su descripción, el tipo de primitiva, las instrucciones y los criterios. El candidato se coloca inmediatamente después del token `[SEP]`, de modo que los únicos tokens que varían entre los candidatos de una misma pregunta son precisamente aquellos a los que el encoder atiende con mayor facilidad. Cada par produce un logit y un softmax agrupado sobre los candidatos de la pregunta genera la distribución de respuesta. El entrenamiento minimiza la entropía cruzada entre ese softmax agrupado y una distribución objetivo: one-hot para `choice` y `score`, y `[1-p, p]` para `noul`.

Los datos de entrenamiento consisten en 7.650 preguntas sobre 3.000 textos cortos en inglés, repartidos en 30 dominios (triaje de soporte, moderación, reseñas de producto, enrutado de correo, cribado de currículums, banca, reclamaciones de seguros, mensajes de telesalud, helpdesk de TI, seguridad en aplicaciones de citas, entre otros). Cada dominio define una pregunta `choice`, una `score` y una `noul`. Los textos y las etiquetas son sintéticos, redactados según una especificación por dominio. Para forzar al modelo a leer el esquema en lugar de memorizar identificadores de etiqueta, cada ejemplo de entrenamiento utiliza una redacción aleatoria de instrucciones y criterios, baraja las opciones de `choice` y, en la mitad de los casos, sustituye los identificadores de opción por identificadores opacos (`opt_a`, `k2`, `bravo`, etc.). El split de evaluación reservado contiene 1.350 preguntas (15 % de los registros por dominio, estratificado sobre combinaciones de etiquetas). No se documenta en la información disponible el uso de RLHF, DPO ni de una fase de alineamiento adicional; tampoco se detalla el número total de tokens de entrenamiento.

## Capacidades

- Clasificación condicionada por esquema: responde a preguntas definidas en inferencia mediante un objeto JSON con `type`, `instructions` y `criteria` (no requiere reentrenamiento para nuevos conjuntos de etiquetas).
- Primitiva `choice`: selección por argmax entre opciones descritas textualmente, devolviendo el identificador ganador y la distribución de probabilidad sobre todas las opciones.
- Primitiva `noul`: verificación de una proposición en formato sí/no con probabilidad calibrada (por ejemplo, `{'is_urgent': 0.99}`).
- Primitiva `score`: puntuación ordinal sobre una escala descrita nivel a nivel, con índice de nivel esperado y probabilidades por nivel.
- Extracción de múltiples campos en una sola llamada: el ejemplo de la model card devuelve simultáneamente `department` (choice), `frustration` (score) e `is_urgent` (noul) a partir de un único texto.
- Decodificación determinista: el agrupamiento de logits y la conversión a respuesta se realizan con código, no con generación autoregresiva, lo que elimina variabilidad entre ejecuciones.
- Entrada flexible: el estado puede ser texto libre o un objeto JSON serializado.
- No dispone de generación de texto libre, razonamiento multi-paso, tool calling, capacidad de agente, visión, audio ni modo de pensamiento.
- No dispone de capacidades multilingües: solo inglés.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como estado y un esquema con `department` como primitiva `choice` (billing, technical, sales, etc.) para enrutarlo automáticamente al equipo correcto; la precisión de 0,889 en `choice` frente a 0,255 de azar lo hace viable como primera capa de enrutado.
- Priorización por urgencia y frustración: combinando una primitiva `score` de frustración (MAE de 0,183 niveles) y una `noul` de urgencia (exactitud 0,940, Brier 0,052), se puede ordenar la cola de atención al cliente sin necesidad de un LLM generativo.
- Enrutado de correo corporativo: clasificación de mensajes entrantes hacia departamentos o bandejas mediante un esquema `choice` definido en tiempo de ejecución, útil cuando las categorías cambian con frecuencia porque no exige reentrenar el modelo.
- Moderación de contenido: etiquetado de textos de usuario con criterios binarios (`noul`) o escalas de gravedad (`score`), con probabilidades que permiten fijar umbrales de revisión humana.
- Cribado de currículums: puntuación ordinal de candidatos frente a una rúbrica descrita en los criterios (por ejemplo, adecuación a un puesto en varios niveles), aprovechando que la rúbrica se define en inferencia y puede variar por vacante.
- Clasificación de reclamaciones y operaciones bancarias: categorización de reclamaciones de seguros o de solicitudes bancarias con esquemas por producto, sin depender de datos etiquetados propios para cada nueva taxonomía.
- Triaje de mensajes de telesalud: asignación de síntomas a niveles de prioridad mediante la primitiva `score`, con la salvedad de que se trata de un modelo de inglés y datos sintéticos, no de una herramienta clínica.
- Sustitución de LLM en pipelines de salida estructurada: para tareas de clasificación con esquema fijo, un encoder de 435 M con decodificación determinista reduce coste e infraestructura frente a un modelo generativo, manteniendo salida en formato JSON.
- Análisis de reseñas de producto: extracción simultánea de categoría del problema (`choice`) e intensidad de la opinión (`score`) sobre el mismo texto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de evaluación reservado (1.350 preguntas, 45 por dominio), medidos con `bench_dataset.py`:

| Primitiva | Metrica | Modelo | Azar |
|---|---|---|---|
| `choice` | exactitud | 0,889 | 0,255 |
| `noul` | exactitud | 0,940 | 0,500 |
| `noul` | Brier score (menor es mejor) | 0,052 | 0,250 |
| `score` | error absoluto medio en niveles (menor es mejor) | 0,183 | 0,700 |

Resultados por dominio (extracto de la tabla de la model card, que aparece truncada en la información proporcionada):

| Dominio | `choice` acc (azar) | `noul` acc / Brier | `score` MAE (uniforme) |
|---|---|---|---|
| auto_service | 0,733 (0,200) | 0,933 / 0,067 | 0,105 (0,667) |
| banking | 0,867 (0,200) | 1,000 / 0,002 | 0,283 (0,600) |
| bug_report | 0,867 (0,250) | 0,933 / 0,067 | 0,097 (0,667) |
| dating_safety | 0,933 (0,250) | 0,933 / 0,067 | 0,176 (0,533) |
| ecommerce_order | 1,000 (0,250) | 1,000 / 0,000 | 0,133 (0,600) |
| education | 1,000 (0,250) | 1,000 / 0,000 | 0,064 (0,600) |
| email_routing | 0,800 (0,250) | 0,933 / 0,061 | 0,189 (0,733) |
| fitness_nutrition | 0,867 (0,250) | 1,000 / 0,000 | 0,024 (0,733) |
| gov_services | 0,800 (0,200) | 1,000 / 0,000 | 0,074 (0,667) |
| health_symptom | 1,000 (0,200) | 1,000 / 0,000 | 0,213 (1,100) |
| hr_workplace | 0,800 (0,200) | 1,000 / 0,000 | 0,041 (0,600) |
| insurance_claim | 1,000 (0,250) | 0,933 / 0,067 | 0,266 (0,733) |
| it_helpdesk | 0,800 (0,250) | 1,000 / 0,000 | no disponible en el extracto |

No se han publicado resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks estandar) en la informacion disponible; las cifras anteriores corresponden exclusivamente a la evaluacion interna del autor sobre datos sinteticos.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los pesos ocupan aproximadamente 1,74 GB, por lo que con activaciones para secuencias de 512 tokens el consumo se sitúa en el entorno de 2,5 a 3 GB; en FP16/BF16 los pesos bajan a unos 0,87 GB y el total ronda 1,5 a 2 GB; en INT8 (cuantizacion no documentada por el autor) los pesos serian de unos 0,44 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM resulta suficiente. Una RTX 4090, A100 o H100 estan sobradamente dimensionadas y solo se justifican por volumen de peticiones, no por memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, GTX 1660 6 GB, etc.), e incluso en CPU para cargas moderadas.
- Opciones de despliegue: la via documentada es `transformers` con PyTorch mas el fichero `schema_scorer.py` del repositorio (adaptador `LocalSystemOne`). No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI; al ser un encoder de clasificacion con cabeza escalar, vLLM y llama.cpp no son aplicables directamente. El tag `text-embeddings-inference` aparece en los metadatos del modelo, pero la model card no describe su uso con TEI.
- Nota de coste computacional: cada candidato requiere una pasada completa del encoder, por lo que el coste de inferencia crece linealmente con el numero de opciones o niveles definidos en el esquema.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|---|
| mobarmg/jev-schema-scorer-deberta-v3-large | 435 M | 512 tokens | Clasificacion condicionada por esquema con cabeza escalar y decodificacion determinista | MIT | HuggingFace, 0 descargas | 0,889 acc en `choice`, 0,940 acc en `noul`, 0,183 MAE en `score` (evaluacion propia) |
| microsoft/deberta-v3-large (modelo base) | ~435 M | 512 tokens | Encoder preentrenado generico, requiere fine-tuning por tarea | MIT | Amplia difusion | No disponible: no es un clasificador listo para uso directo |
| MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli | ~435 M | 512 tokens | Clasificacion zero-shot NLI entrenada sobre MNLI, FEVER, ANLI y WANLI | MIT | Amplia difusion | No disponible en la informacion proporcionada |
| facebook/bart-large-mnli | ~407 M | 1.024 tokens | Clasificacion zero-shot basada en NLI con encoder-decoder | MIT | Amplia difusion | No disponible en la informacion proporcionada |

La diferencia funcional relevante frente a los clasificadores zero-shot basados en NLI es que este modelo no reformula la clasificacion como entailment, sino que puntua directamente pares `(estado, pregunta + candidato)` y agrupa los logits por pregunta, devolviendo identificadores de opcion y distribuciones de probabilidad normalizadas, ademas de soportar escalas ordinales. No se han publicado comparaciones de rendimiento entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Idiomas: el modelo esta entrenado y evaluado exclusivamente en ingles; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Ventana estricta de 512 tokens: el estado, el esquema completo y el candidato deben caber conjuntamente en ese limite. Textos largos requieren truncado o resumen previo, con la consiguiente perdida de informacion.
- Requisito de al menos dos candidatos por pregunta: el softmax agrupado necesita una comparacion dentro del grupo, por lo que no puede usarse con una unica opcion.
- Datos sinteticos: los 3.000 textos y sus etiquetas fueron redactados por el autor segun especificaciones por dominio, no proceden de corpus reales. El salto a distribuciones reales de produccion puede degradar el rendimiento y no ha sido medido publicamente.
- Riesgo de alucinacion acotado pero existente: al no generar texto libre, no puede inventar contenido abierto, pero si puede asignar con alta confianza una opcion incorrecta cuando el estado es ambiguo o cae fuera de los 30 dominios de entrenamiento (por ejemplo, 0,733 de exactitud en `auto_service`).
- Calibracion variable: el Brier score de `noul` es bajo en agregado (0,052), pero la exactitud por dominio de `choice` baja hasta 0,733-0,800 en varios dominios, por lo que conviene monitorizar por caso de uso antes de automatizar decisiones.
- Sensibilidad al formato del esquema: la redaccion de instrucciones y criterios influye en el resultado; la model card no cuantifica la varianza ante cambios de redaccion.
- Sin validacion externa: 0 descargas y 0 likes, sin resultados de terceros que reproduzcan las cifras publicadas. La tabla de resultados por dominio aparece truncada en la informacion disponible (falta, entre otros, el desglose completo de los 30 dominios).
- Sin soporte de tool calling, agentes, multimodalidad ni generacion: no es un sustituto de un LLM de proposito general.
- Licencia MIT: permite uso comercial y modificacion sin restricciones adicionales; al derivar de `microsoft/deberta-v3-large`, tambien bajo MIT, no se identifican clausulas adicionales. No obstante, la responsabilidad sobre el uso de las predicciones (por ejemplo, en cribado de curriculums o triaje sanitario) recae en el integrador.
- Caveat de produccion: el repositorio incluye codigo auxiliar (`schema_scorer.py`) que debe auditarse antes de desplegarlo, y el modelo requiere un preprocesado propio (serializacion JSON del esquema) que no esta cubierto por la pipeline estandar de `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mobarmg/jev-schema-scorer-deberta-v3-large
- Demo (Space): https://huggingface.co/spaces/mobarmg/jev-schema-scorer
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Los resultados de la busqueda web realizada no contienen enlaces relevantes para este modelo: todas las entradas devueltas corresponden a paginas del portal de clientes de Allianz (kilometerstandsmeldung, meine-allianz, login y documentos) y no guardan relacion con el modelo ni con su autor. No se dispone por tanto de paper, blog tecnico ni repositorio adicional asociado.
