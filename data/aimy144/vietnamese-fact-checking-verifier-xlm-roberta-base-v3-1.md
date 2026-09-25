# aiMy144/vietnamese-fact-checking-verifier-xlm-roberta-base-v3-1

## Resumen

El modelo `aiMy144/vietnamese-fact-checking-verifier-xlm-roberta-base-v3-1` es un clasificador de texto en vietnamita especializado en verificación de hechos (fact-checking), desarrollado por el usuario aiMy144. Se trata de un ajuste fino (fine-tuning) del checkpoint multilingüe `FacebookAI/xlm-roberta-base` para una tarea de inferencia de lenguaje natural (NLI) aplicada a la verificación de afirmaciones: dado un par formado por una evidencia y una afirmación, el modelo decide si la afirmación está respaldada (`SUPPORTED`), refutada (`REFUTED`) o si no hay información suficiente (`NOT_ENOUGH_INFO`).

El modelo cuenta con 278.045.955 parámetros (los propios de la arquitectura XLM-RoBERTa base) y se distribuye en formato safetensors bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales. Su relevancia radica en cubrir un idioma con poca cobertura en herramientas de verificación automática, como es el vietnamita, y en hacerlo con una arquitectura encoder-only relativamente ligera, adecuada para despliegues con latencia baja y coste reducido.

El propio autor advierte en la model card de que el entrenamiento se realizó sobre afirmaciones sintéticas o de tipo *silver* (generadas o etiquetadas de forma semiautomática), por lo que el modelo no debe tratarse como un oráculo de factualidad validado por humanos. El modelo reporta un Macro-F1 de 0,9686 en el conjunto de validación, particionado por documento fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa base), con cabecera de clasificación de secuencia |
| Parametros totales | 278.045.955 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; la arquitectura base XLM-RoBERTa admite 512 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa base, un transformer encoder-only preentrenado con objetivos enmascarados sobre corpus multilingües. En este ajuste, la cabecera de clasificación se reutiliza como un verificador de tres clases: `SUPPORTED`, `REFUTED` y `NOT_ENOUGH_INFO`. El formato de entrada es una secuencia con el orden `(evidence, claim)`, es decir, primero la evidencia y después la afirmación que se quiere verificar; alterar ese orden degradaría el rendimiento, dado que el modelo no fue entrenado para ser simétrico respecto a los dos segmentos.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de su carácter sintético o *silver*, ni si se aplicaron técnicas de alineación como RLHF o DPO (poco habituales en modelos encoder-only de clasificación). Sí se indica que las particiones de entrenamiento, validación y test se dividieron por documento fuente, lo que evita la fuga de información entre conjuntos y es una práctica metodológica correcta en tareas de verificación. El dataset asociado es `aiMy144/viet-fact-checking` (aproximadamente 121 MB, licencia CC-BY-4.0), con un fichero `corpus_v1.json`.

## Capacidades

- Clasificación de pares evidencia-afirmación en vietnamita con tres etiquetas: `SUPPORTED`, `REFUTED` y `NOT_ENOUGH_INFO`.
- Detección de inferencia textual: determina si una premisa (evidencia) implica, contradice o es neutral respecto a una hipótesis (afirmación).
- Tratamiento explícito de la abstención mediante la etiqueta `NOT_ENOUGH_INFO`, útil para no forzar una decisión binaria cuando la evidencia es insuficiente.
- Salida de logits y probabilidades por clase mediante el pipeline `text-classification`, integrable en sistemas de puntuación o umbrales personalizados.
- Modelo multilingüe de base, aunque el ajuste está orientado y evaluado únicamente en vietnamita.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas, visión, audio ni modo de pensamiento: es exclusivamente un clasificador.

## Casos de uso

- Verificación de afirmaciones en redacciones periodísticas: el modelo recibe un fragmento de evidencia recuperado (por ejemplo, un extracto de un artículo oficial) junto con una afirmación política y devuelve si está respaldada, refutada o si falta información, sirviendo como primera criba antes de la revisión humana.
- Moderación de contenido y desinformación en plataformas: integrado en un pipeline que recupere evidencia de fuentes verificadas y clasifique publicaciones potencialmente falsas, con la etiqueta `NOT_ENOUGH_INFO` actuando como colchón de seguridad para no censurar contenido sin base.
- Componente de un sistema RAG de verificación: el retriever aporta los pasajes y este modelo actúa como *verifier* o *reranker* de la respuesta, comprobando si cada pasaje respalda la afirmación generada.
- Auditoría de resúmenes automáticos en vietnamita: se compara cada frase del resumen con el documento original para detectar afirmaciones no sustentadas por el texto fuente.
- Sistemas de atención al cliente con base de conocimiento: antes de devolver una respuesta, se verifica que la afirmación contenida en la respuesta esté respaldada por los fragmentos recuperados de la documentación interna.
- Investigación académica en PLN para vietnamita: sirve como línea base (*baseline*) reproducible para experimentos de fact-checking y NLI en un idioma con recursos limitados.
- Enriquecimiento de bases de conocimiento y grafos: clasificar automáticamente pares (evidencia, afirmación) extraídos de fuentes estructuradas para poblar relaciones verificadas.
- Filtrado previo en anotación humana: reducir el volumen de afirmaciones que llegan a un revisor etiquetando automáticamente los casos claros y dejando solo los dudosos.

## Benchmarks y rendimiento

| Benchmark | Conjunto | Metrica | Resultado |
|---|---|---|---|
| Verificación de hechos en vietnamita (tarea propia) | Validacion | Macro-F1 | 0,9686 |

No se han publicado resultados de benchmarks en la informacion disponible más allá del Macro-F1 de validación indicado en la model card. No hay datos de MMLU, HumanEval, GSM8K ni de comparaciones estandarizadas con otros modelos, y no se detalla el tamaño del conjunto de validación ni el reparto de clases, por lo que la cifra debe interpretarse con cautela.

## Requisitos de hardware

- Inferencia en fp32: aproximadamente 1,1 GB de pesos (278 M de parámetros × 4 bytes), más overhead de activaciones; cabe sobradamente en cualquier GPU con 4 GB o más.
- Inferencia en fp16/bf16: aproximadamente 556 MB de pesos; ejecutable en GPUs consumer modestas (GTX 1650, RTX 3050, etc.).
- Cuantización a int8: en torno a 280 MB, viable incluso en CPU con librerías de inferencia optimizada.
- GPU recomendadas: cualquier GPU moderna es suficiente; para alto throughput, una T4, L4, RTX 4090 o A100 permiten procesar cientos o miles de pares por segundo en lote, aunque no se publican cifras de latencia ni de throughput concretas.
- CPU: el modelo es lo bastante pequeño para ejecutarse en CPU en escenarios de baja concurrencia; se recomienda quantización dinámica para reducir latencia.
- Opciones de despliegue: `transformers` con pipeline de `text-classification`, TorchServe, ONNX Runtime, Text Embeddings Inference (TEI) para clasificación, o `optimum` para exportación a ONNX. No se publican variantes GGUF ni Ollama, aunque la conversión a GGUF es técnicamente posible al ser un encoder estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Rendimiento en la tarea |
|---|---|---|---|---|---|
| Este modelo (XLM-R base ajustado) | 278 M | No especificado (base XLM-R: 512) | Vietnamita | MIT | Macro-F1 0,9686 en validación (tarea propia) |
| XLM-RoBERTa base (sin ajustar) | 278 M | 512 | Multilingue | MIT | No disponible |
| mDeBERTa-v3-base | ~278 M (86 M en el backbone) | 512 | Multilingue | MIT | No disponible |
| PhoBERT-base | ~135 M | 256 | Vietnamita | MIT | No disponible |

No se dispone de resultados comparativos publicados en la información proporcionada. Las cifras de parámetros y contexto de los modelos alternativos proceden de su documentación pública y no de una evaluación conjunta con este modelo, por lo que la comparación debe tomarse como orientativa.

## Limitaciones y advertencias

- Entrenado sobre afirmaciones sintéticas o *silver*: el autor advierte explícitamente de que no debe tratarse como un oráculo de factualidad validado por humanos. El Macro-F1 de 0,9686 puede sobreestimar el rendimiento real sobre datos de producción.
- Sensibilidad al orden de entrada: el par debe presentarse como `(evidence, claim)`. Invertir el orden puede degradar las predicciones de forma significativa.
- Dependencia de la calidad de la evidencia: si el pasaje de evidencia recuperado es irrelevante, incompleto o está mal segmentado, el modelo puede producir clasificaciones erróneas; no verifica la veracidad de la evidencia en sí.
- Riesgo de sesgo: al entrenarse con datos generados automáticamente, puede heredar los sesgos de las fuentes y del proceso de generación de afirmaciones; no se documentan análisis de sesgo.
- Cobertura lingüística limitada: aunque la base es multilingüe, el ajuste se evaluó solo en vietnamita. Su uso en otros idiomas no está validado.
- Longitud de contexto: no documentada en la model card; si se hereda la ventana de XLM-RoBERTa base (512 tokens), las evidencias largas deben truncarse o dividirse, lo que puede eliminar información relevante.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero conviene verificar la licencia del dataset asociado (CC-BY-4.0), que exige atribución.
- Adopción nula: el modelo registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que no cuenta con validación externa ni comunidad que reporte comportamientos en producción.
- Sin garantías de mantenimiento: al ser un repositorio de un autor individual con una única versión publicada, no hay compromiso de actualizaciones o correcciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aiMy144/vietnamese-fact-checking-verifier-xlm-roberta-base-v3-1
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset asociado: https://huggingface.co/datasets/aiMy144/viet-fact-checking
- Visor del dataset: https://huggingface.co/datasets/aiMy144/viet-fact-checking/viewer
- Proyecto de fact-checking en vietnamita basado en agentes y grafos de conocimiento: https://github.com/vietlinhh02/vietnamese-fact-checking
- Sistema de verificación de noticias en vietnamita: https://github.com/Namronaldo08102004/Vietfactcheck
