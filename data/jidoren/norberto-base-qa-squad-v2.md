# jidoren/NorBERTo-base-qa-squad-v2

## Resumen

NorBERTo-base-qa-squad-v2 es un checkpoint de la familia Transformers publicado por el usuario jidoren en Hugging Face, con 149.606.402 parámetros almacenados en formato safetensors (0,3 GB de repositorio). La etiqueta de arquitectura declarada en el repositorio es `modernbert`, por lo que se trata de un encoder transformer bidireccional de tipo ModernBERT adaptado a la tarea de *question answering* extractivo (pipeline `question-answering`). El identificador del modelo indica un ajuste fino sobre SQuAD v2, el conjunto de pregunta-respuesta extractiva con preguntas sin respuesta, aunque la model card no documenta el procedimiento.

El problema que resuelve es la extracción de respuestas literales (span extraction) a partir de un contexto y una pregunta, un componente habitual en pipelines de búsqueda documental y RAG donde se necesita localizar la frase exacta que responde a una consulta en lugar de generar texto libre. Su tamaño de ~150 M de parámetros lo sitúa en la gama base, lo que permite inferencia en CPU y en GPUs de consumo con latencias bajas.

La relevancia de la ficha es limitada por la ausencia casi total de documentación: la model card es la plantilla autogenerada de Hugging Face, sin licencia declarada, sin idiomas declarados, sin métricas de evaluación, sin descripción del dataset de entrenamiento y con cero descargas y cero *likes* en el momento de la consulta. La búsqueda web asociada no devolvió ningún resultado relevante sobre este modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional; según la etiqueta `modernbert` del repositorio) |
| Parámetros totales | 149.606.402 (≈149,6 M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información del repositorio |
| Tipos de cuantización | No disponible; los pesos se distribuyen en safetensors (precisión original no documentada) |
| Idiomas soportados | No disponible; el identificador "NorBERTo" sugiere noruego, sin confirmación en la model card |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 0,3 GB) |

## Arquitectura y entrenamiento

La única información arquitectónica fiable es la etiqueta `modernbert` y el tamaño de parámetros (149,6 M), coherente con la escala de un ModelBERT en configuración *base*. La cabecera declarada corresponde a `question-answering`, es decir, una cabeza de predicción de inicio y fin de span sobre la secuencia de contexto, no una cabeza generativa. ModernBERT es una revisión del encoder BERT clásico que sustituye el embedding posicional absoluto por RoPE, alterna atención local y global y emplea capas sin sesgo; no obstante, no se confirma en la información disponible que este checkpoint herede esas características concretas ni cuál es su ventana de contexto efectiva.

No hay ningún dato sobre el entrenamiento: se desconoce el número de tokens, la composición del dataset (el nombre apunta a SQuAD v2, con preguntas sin respuesta, pero no está documentado), si hubo una fase previa de *pretraining* propia o si se partió de un checkpoint ya existente, ni si se aplicaron técnicas de alineación como RLHF o DPO (poco habituales en modelos extractivos). La etiqueta `arxiv:1910.09700` que aparece en el repositorio no corresponde a un artículo sobre el modelo: es la referencia a Lacoste et al. (2019) sobre estimación de emisiones de carbono, citada por la plantilla automática de la model card.

## Capacidades

- Extracción de respuestas extractivas: devuelve el span del contexto que responde a una pregunta dada (pipeline `question-answering` de Transformers).
- Manejo de preguntas sin respuesta: por el identificador "squad-v2", se espera soporte del caso en que la respuesta no está presente en el contexto, aunque no está confirmado en la documentación.
- Codificación de texto bidireccional: la torre encoder puede reutilizarse para clasificación, *reranking* o similitud semántica mediante *fine-tuning* adicional.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el checkpoint se puede desplegar en Hugging Face Inference Endpoints.
- No es un modelo generativo: no produce texto libre, por lo que no soporta *tool calling*, function calling, razonamiento multi-paso, agentes ni modo de pensamiento.
- Capacidades multilingües, de visión y de audio: no disponibles o inexistentes en la información proporcionada.

## Casos de uso

- Extracción de respuestas en documentación técnica: dado un manual o una referencia de API como contexto, el modelo localiza el fragmento exacto que responde a preguntas de desarrolladores ("¿cuál es el límite de peticiones por minuto?"), lo que reduce las alucinaciones frente a un modelo generativo.
- Componente lector en pipelines RAG: tras recuperar pasajes con un buscador vectorial, el modelo selecciona el span relevante y permite construir respuestas trazables, con cita literal del documento origen.
- Atención al cliente sobre base de conocimiento: para consultas cerradas de FAQ o condiciones de servicio, devuelve la frase de la política o del contrato que responde a la pregunta, con contexto típico de uno o varios párrafos.
- Extracción de campos en documentos: localización de entidades o cláusulas concretas (fechas, importes, plazos) en contratos, facturas o expedientes, formulando la consulta como pregunta sobre un contexto previamente segmentado.
- Anotación asistida de corpus: generación de spans candidatos para revisión humana en proyectos de etiquetado, aprovechando que un modelo de ~150 M de parámetros se ejecuta en CPU a bajo coste.
- Filtrado de preguntas en buscadores internos: descartar consultas cuya respuesta no está en el corpus recuperado, usando la capacidad de SQuAD v2 para señalar preguntas sin respuesta.
- Evaluación de calidad de *retrieval*: comprobar si el pasaje recuperado contiene realmente la respuesta, como métrica auxiliar en la evaluación de un sistema de búsqueda.
- Despliegue en entornos con recursos limitados: inferencia sobre CPU o GPU de gama baja para servicios de extracción de información en tiempo real, dado el reducido tamaño del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación (los apartados de *Testing Data*, métricas y resultados contienen únicamente el marcador `[More Information Needed]`), y no se dispone de cifras de exact match ni F1 sobre SQuAD v2 ni sobre ningún otro conjunto noruego o multilingüe.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 149,6 M de parámetros, sin incluir activaciones ni el contexto): ≈0,6 GB en fp32, ≈0,3 GB en fp16/bf16, ≈0,15 GB en int8 y ≈0,08 GB en int4.
- Memoria adicional por contexto: con ventanas largas (miles de tokens) las activaciones pueden superar el tamaño de los pesos, especialmente en lotes grandes.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo y solo se justifican por volumen de peticiones concurrentes.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- CPU: la inferencia en CPU es viable para cargas moderadas, dado el tamaño del modelo y que la tarea es una única pasada *forward* sin decodificación autoregresiva.
- Opciones de despliegue: `transformers` con PyTorch, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), servidores de inferencia tipo TGI o vLLM para *batching* dinámico, y conversión a ONNX u otros formatos para entornos embebidos. No se documenta compatibilidad con llama.cpp u Ollama, orientados a modelos generativos.
- Latencia y throughput: no disponibles; no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento ni de especificaciones confirmadas de modelos comparables dentro de la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa rigurosa. A modo de referencia categórica, este checkpoint pertenece a la familia de encoders tipo base de ~150 M de parámetros para QA extractivo, donde los puntos de comparación habituales serían checkpoints como ModernBERT-base o NorBERT-base; sin embargo, ni sus parámetros exactos, ni su contexto, ni su licencia se han podido confirmar a partir de las fuentes consultadas para esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jidoren/NorBERTo-base-qa-squad-v2 | 149,6 M | No disponible | No disponible | Hugging Face (0 descargas) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Documentación ausente: la model card es la plantilla autogenerada de Hugging Face, sin información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada: al no especificarse licencia, no se puede asumir uso comercial permitido; sería necesario contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: aunque el nombre apunta a noruego, no hay confirmación; el comportamiento en castellano no está garantizado.
- Riesgo de alucinación bajo: al ser extractivo, no genera texto, pero puede devolver un span incorrecto o de baja confianza cuando la respuesta no está en el contexto; es imprescindible aplicar umbrales de confianza y verificar el caso "sin respuesta".
- Sensibilidad al contexto: el rendimiento depende de que el pasaje que contiene la respuesta esté presente y bien delimitado; errores del recuperador se propagan directamente.
- Sesgos: no evaluados ni documentados; al desconocerse la composición del corpus de entrenamiento, no se pueden estimar sesgos de dominio, género o geográficos.
- Contexto limitado o desconocido: no se confirma la ventana máxima soportada; en tareas con documentos extensos habrá que segmentar y gestionar el solapamiento entre fragmentos.
- Artefacto sin tracción: 0 descargas y 0 *likes* en el momento de la consulta, sin repositorio, paper ni demo asociados; no hay evidencia de validación por terceros.
- Fecha de creación anómala (2026-09-16) en los metadatos del repositorio, lo que dificulta interpretar la antigüedad real del checkpoint.
- La búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo; todos los resultados obtenidos fueron irrelevantes (páginas comerciales de decoración y tarjetas de boda).

## Enlaces

- Hugging Face: https://huggingface.co/jidoren/NorBERTo-base-qa-squad-v2
- Paper citado en la plantilla de la model card (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental referenciada en la model card: https://mlco2.github.io/impact
- Repositorio, paper o demo específicos del modelo: no disponibles
- Resultados relevantes de la búsqueda web: ninguno
