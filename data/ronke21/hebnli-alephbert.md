# ronke21/hebnli-alephbert

## Resumen

`ronke21/hebnli-alephbert` es un modelo de clasificación de inferencia en lenguaje natural (NLI) en hebreo, obtenido por ajuste fino (*fine-tuning*) de `onlplab/alephbert-base` sobre el conjunto de datos HebNLI. Clasifica pares premisa-hipótesis en tres etiquetas: implicación (*entailment*), contradicción y neutralidad. Forma parte del trabajo de investigación HeRE (Hebrew Relation Extraction), presentado en AACL/IJCNLP 2026, donde actúa como uno de los "desensuciadores" (*denoisers*) de la Estrategia 1: dada una premisa extraída de Wikipedia en hebreo y una hipótesis generada a partir de una tripleta de Wikidata, la probabilidad de implicación decide si el pasaje expresa dicha relación.

El modelo es un transformer tipo BERT de 125.978.883 parámetros (aproximadamente 126 millones), con una longitud máxima de secuencia de 250 tokens durante el entrenamiento. Es un modelo monolingüe en hebreo, orientado exclusivamente a clasificación de texto, no a generación. Su relevancia radica en que aborda una tarea poco cubierta en lenguas semíticas: la inferencia textual y la extracción de relaciones en hebreo, con un ajuste fino reproducible (semilla 42, hiperparámetros documentados) y pesos liberados bajo licencia Apache 2.0.

El repositorio ocupa 0,5 GB y contiene pesos en formato safetensors. El modelo tiene un uso muy especializado y un número reducido de descargas (13 en el momento de la consulta), lo que refleja su carácter de artefacto de investigación más que de modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (base_model: onlplab/alephbert-base) |
| Parametros totales | 125.978.883 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 250 tokens (longitud máxima de secuencia usada en entrenamiento; la arquitectura base admite hasta 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base ajustado para clasificación de secuencias con tres clases de salida (`id2label`: 0 = היסק [implicación], 1 = סתירה [contradicción], 2 = ניטרלי [neutral]). La entrada es un par premisa-hipótesis codificado conjuntamente, con truncamiento a 250 tokens. El ajuste fino se realizó sobre HebNLI, un corpus de inferencia en lenguaje natural en hebreo.

El entrenamiento usó AdamW con tasa de aprendizaje 2e-5, tamaño de lote 64, calentamiento lineal durante el 10 % de los pasos, decaimiento de pesos 0,01, 8.000 pasos totales y evaluación cada 200 pasos. Se retuvo el checkpoint con mejor macro-F1 de validación, correspondiente al paso 4.600. Fue una única ejecución con semilla 42. No se documentan en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset más allá de HebNLI ni el uso de RLHF o DPO (no aplicables a una tarea de clasificación de este tipo).

La innovación metodológica no está en la arquitectura, sino en el uso del clasificador dentro del pipeline de HeRE: las hipótesis se generan con un LLM a partir de tripletas de Wikidata y el modelo filtra las alineaciones ruidosas del grafo de conocimiento mediante la probabilidad de implicación.

## Capacidades

- Clasificación de inferencia en lenguaje natural en hebreo en tres clases: implicación, contradicción y neutralidad.
- Puntuación de probabilidad por clase mediante `softmax` sobre los logits, apta para umbralización en pipelines de filtrado.
- Detección de relaciones expresadas en texto: dado un pasaje de Wikipedia y una hipótesis verbalizada de una tripleta, estima si la relación se sostiene.
- Procesamiento de pares premisa-hipótesis de hasta 250 tokens.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni uso como agente.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento explícito (*thinking mode*).
- Capacidad multilingüe limitada al hebreo; no se documenta rendimiento en otras lenguas.

## Casos de uso

- Filtrado de alineaciones en grafos de conocimiento: usar la probabilidad de implicación para decidir si un pasaje de Wikipedia en hebreo respalda una tripleta de Wikidata, tal como se plantea en el pipeline de HeRE (Estrategia 1). Es el caso de uso nativo del modelo.
- Construcción de datasets de extracción de relaciones en hebreo: el clasificador permite descartar pares premisa-hipótesis ruidosos antes de anotación manual o de entrenar un extractor supervisado.
- Verificación de hechos en hebreo a pequeña escala: dado un texto fuente y una afirmación, la clase de contradicción o implicación sirve como señal preliminar de veracidad, con revisión humana posterior.
- Evaluación de sistemas de generación en hebreo: comprobar si una respuesta generada está implicada por el contexto de referencia (métrica de fidelidad tipo NLI).
- Moderación o detección de inconsistencias documentales: comparar pares de documentos o secciones y marcar contradicciones entre ellos.
- Investigación en PLN semítico: línea base reproducible (semilla e hiperparámetros documentados) para experimentos de NLI en hebreo y para comparaciones con modelos multilingües.
- Preprocesamiento en pipelines de búsqueda semántica en hebreo: reordenar o filtrar candidatos recuperados según la probabilidad de implicación respecto a la consulta.

## Benchmarks y rendimiento

| Modelo | HebNLI dev macro-F1 | HebNLI test macro-F1 | HeRE gold validation F1 |
|---|---|---|---|
| AlephBERT (este ajuste) | 0,763 | 0,781 | 0,618 (Estrategia 1, hipótesis generada por LLM) |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB de pesos más activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en FP16: aproximadamente 0,25 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090); para lotes grandes, A100 o H100 no son necesarias pero permiten mayor throughput.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (PyTorch), `optimum`/ONNX Runtime, TorchScript; no se documenta soporte específico de vLLM, TGI o llama.cpp (no es un modelo generativo y no se publican pesos GGUF).
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un BERT base de 126 M de parámetros, la inferencia por par es del orden de milisegundos en GPU, pero no se aportan medidas concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ronke21/hebnli-alephbert | 125.978.883 | 250 tokens (entrenamiento) | NLI en hebreo (3 clases) | Apache 2.0 | Hugging Face |
| onlplab/alephbert-base | no disponible en la información | no disponible | Modelo base de lenguaje en hebreo | no disponible en la información | Hugging Face |
| Modelos NLI multilingües (p. ej. XLM-R ajustados) | no disponible en la información | no disponible | NLI multilingüe | no disponible en la información | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en HebNLI dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo monolingüe en hebreo: no debe esperarse un comportamiento correcto en otras lenguas.
- Longitud de entrada limitada a 250 tokens en el ajuste; premisas más largas se truncan y pueden perder la evidencia necesaria para la clasificación.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero sí existe riesgo de clasificaciones erróneas en pares ambiguos o con evidencia parcial; la salida es una probabilidad, no una decisión calibrada garantizada.
- Entrenado con una única ejecución y semilla 42; no se documenta variabilidad entre semillas ni intervalos de confianza.
- Sesgos: no se documentan análisis de sesgo; al derivar de Wikipedia en hebreo, puede heredar sesgos de cobertura y de representación de ese corpus.
- Uso comercial permitido por la licencia Apache 2.0, sujeta a las condiciones de la licencia del modelo base; conviene verificar la licencia de `onlplab/alephbert-base` antes de un despliegue en producción.
- No apto para generación, agentes ni tool calling; su uso en producción debe limitarse a clasificación de pares premisa-hipótesis.
- El rendimiento en dominios distintos de Wikipedia y Wikidata (el contexto de HeRE) no está documentado y puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/hebnli-alephbert
- Modelo base: https://huggingface.co/onlplab/alephbert-base
- Dataset HeRE: https://huggingface.co/datasets/ronke21/HeRE
- Código HeRE: https://github.com/Ronke21/HeRE
- Repositorio HebNLI: https://github.com/NNLP-IL/HebNLI
- Paper HeRE (ACL Anthology): https://aclanthology.org/2026.aacl-long.237/
- DOI del paper: https://doi.org/10.18653/2026.aacl-long.237
