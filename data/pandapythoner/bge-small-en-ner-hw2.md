# pandapythoner/bge-small-en-ner-hw2

## Resumen

bge-small-en-ner-hw2 es un modelo de reconocimiento de entidades nombradas (NER) obtenido por ajuste fino del encoder BAAI/bge-small-en-v1.5, publicado por el usuario pandapythoner en HuggingFace. Se trata de un modelo de clasificación de tokens (pipeline `token-classification`) con 33.215.625 parámetros, distribuido en formato safetensors y con licencia MIT. Su propósito es etiquetar secuencias de texto en inglés detectando entidades, no generar texto.

El modelo parte de bge-small-en-v1.5, un encoder tipo BERT de ~33 M de parámetros desarrollado por BAAI y orientado originalmente a embeddings de recuperación. El ajuste fino se realizó con el `Trainer` de Transformers durante 10 épocas, con `learning_rate` de 2e-05, batch de 16 y semilla 42, alcanzando en el conjunto de evaluación una F1 de 0.9141, precisión de 0.9019 y recall de 0.9266.

Su relevancia práctica es limitada pero clara: es un ejemplo de cómo reconvertir un encoder pequeño de recuperación en un extractor de entidades ligero, con coste de inferencia muy bajo y capacidad de ejecutarse en CPU. No obstante, la model card no documenta el conjunto de datos de entrenamiento ni el esquema de etiquetas, y el repositorio no registra descargas ni interacciones, por lo que debe tratarse como un experimento reproducible más que como un modelo listo para producción sin validación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (modelo base BAAI/bge-small-en-v1.5); configuracion de capas no detallada en la model card |
| Parametros totales | 33.215.625 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base; no confirmada explicitamente en la model card) |
| Tipos de cuantizacion | No declarados por el autor; al ser un encoder de 33 M de parametros admite cuantizacion a FP16, INT8 e INT4 mediante herramientas externas |
| Idiomas soportados | No declarados; el sufijo "en" del nombre y el modelo base indican uso previsto en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base BAAI/bge-small-en-v1.5, un encoder transformer bidireccional de tipo BERT con 33,2 M de parámetros, diseñado originalmente por BAAI para generar embeddings de frases y pasajes. Sobre esa base se ha añadido una cabeza de clasificación de tokens para la tarea de NER, sustituyendo el uso de similitud semántica por el etiquetado secuencial. La model card no especifica el número de capas, la dimensión oculta ni la configuración exacta de atención, aunque el recuento de parámetros es coherente con una configuración compacta del tipo BERT-small.

El entrenamiento se realizó con el `Trainer` de Transformers 5.19.0 sobre PyTorch 2.10.0+cu128, con 6250 pasos totales (10 épocas de 625 pasos), `learning_rate` de 2e-05 con scheduler lineal, optimizador AdamW (`ADAMW_TORCH_FUSED`, betas 0.9/0.999, epsilon 1e-08), batch de entrenamiento y evaluación de 16 y semilla 42. No se documenta el conjunto de datos empleado ("unknown dataset"), ni la composición del mismo, ni si hubo fases de RLHF o DPO; tampoco se declaran innovaciones técnicas adicionales como decodificación especulativa o atención lineal, que no aplicarían a un encoder de este tamaño. La pérdida de entrenamiento descendió de 0.4395 en la época 1 a 0.0532 en la época 10, mientras que la pérdida de validación se estabilizó alrededor de 0.165 a partir de la época 5.

## Capacidades

- Etiquetado de secuencias (NER): clasifica cada token de un texto en inglés con la etiqueta de entidad aprendida durante el ajuste fino; el esquema concreto de etiquetas no está documentado en la model card.
- Extracción de entidades en textos individuales o por lotes: el pipeline `token-classification` de Transformers permite procesar listas de frases con `batch_size` configurable.
- Uso como extractor de características: al conservar la arquitectura del encoder BGE, puede emplearse para obtener representaciones contextuales de tokens, aunque no es su función declarada.
- Inferencia en CPU: con 33 M de parámetros, la latencia en CPU es viable para volúmenes moderados sin acelerador.
- Capacidades multilingües: no declaradas; el modelo está orientado a inglés y no se documenta evaluación en otros idiomas.
- Generación de texto, razonamiento multi-paso, matemáticas, código, visión, audio, tool calling y uso como agente: no disponibles, al ser un modelo exclusivamente de clasificación de tokens.

## Casos de uso

- Anonimización de documentos en inglés: el modelo puede etiquetar nombres de personas, organizaciones y localizaciones en textos antes de almacenarlos o compartirlos, sustituyendo las entidades por marcadores. Su tamaño reducido (33 M de parámetros) permite ejecutar el proceso en local sin enviar datos a servicios externos.
- Enriquecimiento de metadatos en pipelines de indexación: al procesar lotes de documentos, las entidades detectadas pueden convertirse en campos estructurados (autor, organización, lugar) que alimenten un motor de búsqueda o una base de datos documental.
- Preprocesado para sistemas de extracción de relaciones: las etiquetas de entidad generadas sirven como entrada a un segundo modelo que determine relaciones entre ellas, por ejemplo en dominios financieros o legales.
- Moderación y filtrado de contenido: detección de menciones a organizaciones o personas concretas en flujos de texto entrante para aplicar reglas de negocio o revisión manual.
- Análisis de opiniones y encuestas: extracción de entidades mencionadas en comentarios de clientes en inglés para agrupar quejas o elogios por producto, marca o ubicación.
- Etiquetado asistido para anotación humana: el modelo actúa como preanotador en herramientas de anotación, reduciendo el trabajo manual de revisión antes de que un anotador corrija las etiquetas.
- Despliegue en dispositivos con recursos limitados: al ocupar aproximadamente 133 MB en FP32 y unos 66 MB en FP16, puede integrarse en contenedores pequeños o en entornos edge para clasificación de texto en tiempo real.

## Benchmarks y rendimiento

El índice de modelo (`model-index`) publicado por el autor no contiene resultados (`results: []`). Los únicos datos disponibles son las métricas de evaluación declaradas en la model card durante el ajuste fino:

| Metrica | Valor en el conjunto de evaluacion |
|---|---|
| Loss | 0.1650 |
| Precision | 0.9019 |
| Recall | 0.9266 |
| F1 | 0.9141 |
| Accuracy | 0.9818 |

Evolución durante el entrenamiento (extracto de la tabla publicada por el autor):

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 625 | 0.3528 | 0.7730 | 0.8223 | 0.7969 | 0.9629 |
| 5.0 | 3125 | 0.1673 | 0.8939 | 0.9212 | 0.9073 | 0.9810 |
| 10.0 | 6250 | 0.1650 | 0.9019 | 0.9266 | 0.9141 | 0.9818 |

No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni con otros modelos de NER en la información disponible; estos benchmarks no son aplicables a un modelo de clasificación de tokens por entidades.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en FP32, unos 66 MB en FP16/BF16, unos 33 MB en INT8 y unos 17 MB en INT4. Son estimaciones derivadas del recuento de parámetros (33.215.625), no mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requiere A100, H100 ni RTX 4090. Una RTX 3060, RTX 4090 o una T4 cubren el modelo con margen amplio y permiten lotes grandes.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia en CPU es viable; con 33 M de parámetros se pueden procesar lotes de frases en tiempos del orden de milisegundos por lote en CPUs modernas, aunque no hay mediciones publicadas.
- Opciones de despliegue: pipeline `token-classification` de Transformers (PyTorch), exportación a ONNX u ONNX Runtime mediante Optimum, TorchScript, y servicio propio con FastAPI o similares. Ollama y llama.cpp no son vías habituales para un encoder BERT en este formato.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo para este modelo.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados para este modelo. La comparación se limita a características estructurales de alternativas habituales en NER en inglés:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pandapythoner/bge-small-en-ner-hw2 | 33,2 M | 512 tokens (segun modelo base) | F1 0.9141 en su conjunto de evaluacion (dataset no documentado) | MIT | HuggingFace, 0 descargas, 0 likes |
| BAAI/bge-small-en-v1.5 (modelo base) | ~33 M | 512 tokens | No disponible; orientado a embeddings, no a NER | MIT | HuggingFace, ampliamente utilizado |
| dslim/bert-base-NER | ~108 M (no confirmado en la informacion disponible) | 512 tokens | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |
| xlm-roberta-large-finetuned-conll03-english | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |

La comparación de rendimiento entre estos modelos no puede realizarse con los datos aportados, ya que cada uno emplea conjuntos de evaluación distintos y el de bge-small-en-ner-hw2 no está documentado.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset"; se desconoce el esquema de etiquetas, el dominio y el idioma real de los datos, lo que impide anticipar su comportamiento fuera de la distribución de entrenamiento.
- Idiomas: no se declaran idiomas soportados y el modelo base está orientado a inglés; el uso en castellano u otros idiomas no está validado y probablemente degrade el rendimiento.
- Sesgos: al no conocerse la composición del corpus de ajuste, no es posible caracterizar sesgos de género, origen o dominio. Cualquier uso en producción requiere una evaluación propia sobre datos representativos.
- Riesgo de alucinación en el sentido generativo: no aplica, ya que el modelo no genera texto. El riesgo equivalente es la asignación incorrecta de etiquetas, con una precisión declarada de 0.9019 y un recall de 0.9266, es decir, en torno a un 7-10 % de errores según la métrica y el umbral.
- Posible sobreajuste: la pérdida de entrenamiento cae hasta 0.0532 mientras la de validación se estanca en ~0.165 desde la época 5, lo que sugiere que épocas adicionales no aportan mejoras y que el modelo puede estar sobreajustando el conjunto de evaluación.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni informes de terceros que confirmen el rendimiento declarado.
- Licencia: MIT, que permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. No hay restricciones adicionales conocidas, pero la licencia del modelo base (MIT según la información disponible) debe respetarse igualmente.
- Advertencia de producción: antes de desplegarlo es imprescindible validar el esquema de etiquetas real, medir F1 sobre un conjunto propio anotado y comprobar el comportamiento con textos largos que superen la ventana de 512 tokens, en cuyo caso será necesario trocear la entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pandapythoner/bge-small-en-ner-hw2
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper del modelo base (C-Pack: Packed Resources For General Chinese Embeddings): https://arxiv.org/abs/2309.07597
- Librería Transformers: https://github.com/huggingface/transformers
- Documentación del pipeline de clasificación de tokens: https://huggingface.co/docs/transformers/main/en/tasks/token_classification
- Optimum (exportación a ONNX): https://github.com/huggingface/optimum
