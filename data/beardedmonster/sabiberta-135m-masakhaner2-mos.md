# BeardedMonster/SabiBERTa-135M-masakhaner2-mos

## Resumen

SabiBERTa-135M-masakhaner2-mos es un modelo encoder-only de tipo ModernBERT, con 135.883.017 parámetros, publicado por BeardedMonster como fine-tuning de su checkpoint base `BeardedMonster/SabiBERTa-135M`. Está especializado en reconocimiento de entidades nombradas (NER) para el idioma mossi (Mooré, código ISO `mos`), hablado principalmente en Burkina Faso, y se ha entrenado sobre el corpus MasakhaNER 2.0.

El modelo resuelve un problema muy concreto: la extracción de entidades en una lengua africana de bajos recursos para la que existen pocos checkpoints ajustados y prácticamente ninguna herramienta lista para producción. Al ser un modelo de 135 M de parámetros, el coste de inferencia es muy bajo (ejecutable en CPU y en cualquier GPU de consumo), lo que lo hace utilizable en pipelines de anotación semiautomática o de preprocesado documental.

Su relevancia actual es doble: por un lado, forma parte del ecosistema MasakhaNER 2.0, que estandariza la evaluación de NER en lenguas africanas; por otro, el autor declara que el arnés de entrenamiento reproduce los baselines publicados con una desviación de aproximadamente 0,25 F1, de modo que las cifras son calibradas y no ad hoc. El resultado reportado es un span F1 medio de 0,6297, obtenido en una única ejecución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only, familia ModernBERT (bidireccional, etiqueta `modernbert` en el repo) |
| Parametros totales | 135.883.017 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como máximo del modelo; `max_length` de entrenamiento = 256 tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente fp32; tamaño de repo 0,5 GB) |
| Idiomas soportados | mossi / Mooré (`mos`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Token classification (NER), `AutoModelForTokenClassification` |
| Modelo base | BeardedMonster/SabiBERTa-135M |
| Dataset de ajuste | masakhaner2, protocolo `mos` |
| Etiquetas | `id2label` configurado; las predicciones decodifican directamente a nombres de etiqueta |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-10-18 |

## Arquitectura y entrenamiento

Se trata de un encoder bidireccional de la familia ModernBERT, reutilizado como cabecera de clasificación de tokens para NER. El modelo parte de `BeardedMonster/SabiBERTa-135M` y se ajusta de forma supervisada sobre el split de entrenamiento del protocolo `mos` de MasakhaNER 2.0, con etiquetas del esquema BIO estándar (persona, organización, localización y fecha). El autor no documenta la composición del corpus de preentrenamiento del modelo base en esta ficha.

Los hiperparámetros del ajuste están publicados: 50 épocas, learning rate 5e-05, batch size 32 y longitud máxima de secuencia 256 tokens. La métrica de selección es `span_f1` sobre el conjunto de evaluación, con un resultado medio de 0,6297 para el único idioma del checkpoint. El autor advierte explícitamente de que se trata de una sola ejecución, mientras que los artículos de referencia promedian sobre 5 semillas, por lo que las diferencias pequeñas frente a otros sistemas deben interpretarse como ruido. No se indican innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras) más allá de las propias de ModernBERT.

## Capacidades

- Reconocimiento de entidades nombradas en mossi (Mooré): persona, organización, localización y fecha, según el esquema de MasakhaNER 2.0.
- Clasificación de tokens a nivel de span, con `id2label` ya configurado para obtener nombres de etiqueta legibles sin postprocesado extra.
- Codificación contextual bidireccional, aprovechable como extractor de características para otras tareas token-level (POS tagging, chunking) mediante fine-tuning adicional.
- Procesamiento de secuencias de hasta 256 tokens por pasada de entrenamiento; secuencias más largas requieren truncado o segmentación con ventana deslizante.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un encoder de clasificación, no un modelo generativo.
- No tiene capacidades de visión, audio ni generación de texto libre.
- Multilingüismo: limitado a `mos`; no se declara transferencia a otras lenguas africanas en este checkpoint.

## Casos de uso

- Anotación semiautomática de corpus en mossi: preetiquetar textos con el modelo y revisar manualmente las entidades, reduciendo el coste de construcción de datasets NER frente a la anotación desde cero.
- Extracción de entidades en prensa y boletines locales: identificar nombres de personas, organizaciones y localidades en notas breves (menos de 256 tokens) para alimentar índices de búsqueda o bases de datos documentales.
- Enriquecimiento de sistemas de recuperación de información: usar las entidades detectadas como metadatos o filtros en un motor de búsqueda sobre documentación en Mooré.
- Monitorización de contenidos para ONG y organismos humanitarios: detección de topónimos y organizaciones en informes de campo para agregación geográfica y seguimiento de actores.
- Preprocesado en pipelines multilingües: como eslabón ligero (135 M de parámetros) dentro de un flujo mayor que enrute texto por idioma y aplique NER específico por lengua.
- Investigación en NLP de bajos recursos: punto de comparación reproducible frente a baselines de MasakhaNER 2.0, con hiperparámetros publicados y métrica declarada.
- Servicio de extracción de entidades en CPU: al caber holgadamente en memoria y no requerir GPU, puede desplegarse como microservicio de bajo coste en entornos con hardware limitado.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| MasakhaNER 2.0 (`mos`) | span F1 (media) | 0,6297 | Una sola ejecución; los baselines promedian 5 semillas |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un encoder de clasificación de tokens. Tampoco se incluyen métricas de precisión y recall desagregadas ni el tamaño del split de evaluación; el autor remite a `metrics.json` del repositorio para los resultados por idioma.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,55 GB de pesos, más activaciones (muy reducidas con `max_length` 256).
- VRAM estimada en fp16/bf16: aproximadamente 0,27 GB de pesos.
- VRAM estimada con cuantización int8: aproximadamente 0,14 GB de pesos.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Funciona en CPU con latencias adecuadas para procesamiento por lotes; no requiere A100/H100 salvo que se busque throughput masivo.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`, inferencia ONNX Runtime, TorchScript, o servidores tipo TGI/Text Embeddings Inference adaptados a token classification; `llama.cpp` y Ollama no aplican por no ser un modelo generativo.
- Latencia y throughput concretos: no disponibles en la información proporcionada. Como referencia estructural, 135 M de parámetros es un orden de magnitud inferior a un encoder base de 278 M, por lo que el coste por secuencia es proporcionalmente menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-mos | 135,9 M | 256 tokens (entrenamiento) | NER fine-tuned, `mos` | no disponible | HuggingFace, 0 descargas |
| XLM-RoBERTa base (ajustado a MasakhaNER 2.0) | aprox. 278 M | 512 tokens | NER multilingüe previo fine-tuning | MIT | Ampliamente disponible |
| mBERT (ajustado a MasakhaNER 2.0) | aprox. 178 M | 512 tokens | NER multilingüe previo fine-tuning | Apache 2.0 | Ampliamente disponible |
| AfriBERTa base (ajustado a MasakhaNER 2.0) | aprox. 126 M | 512 tokens | Preentrenado en lenguas africanas | MIT | Disponible en HuggingFace |

Los tres modelos de comparación figuran como baselines habituales en la literatura de MasakhaNER 2.0, pero en la información proporcionada no se incluyen sus puntuaciones numéricas para `mos`, por lo que no es posible establecer una comparación cuantitativa directa con el 0,6297 de span F1 de este checkpoint. Las cifras de parámetros de los competidores son aproximadas.

## Limitaciones y advertencias

- El resultado de 0,6297 procede de una sola ejecución; el autor advierte de que las diferencias pequeñas frente a otros sistemas deben tratarse como ruido estadístico.
- Licencia no declarada en el repositorio: la ficha indica que rigen la licencia y condiciones del modelo base (`BeardedMonster/SabiBERTa-135M`), que tampoco se detallan aquí. Antes de cualquier uso comercial es obligatorio verificar ese checkpoint.
- Ventana de 256 tokens: textos más largos requieren truncado o chunking, con el riesgo de perder entidades en los límites de los segmentos.
- Un único idioma (`mos`) y un único dominio de entrenamiento (noticias de MasakhaNER 2.0); el rendimiento fuera de ese dominio (texto jurídico, médico, redes sociales) es desconocido.
- Sensibilidad a la variación ortográfica del Mooré (diacríticos y convenciones de escritura no unificadas), no evaluada en la información disponible.
- Sin datos de calibración de probabilidades: las puntuaciones del modelo no deben interpretarse directamente como confianza fiable en producción.
- Sesgos: no documentados por el autor; al derivar de un corpus periodístico pueden aparecer sesgos de cobertura geográfica y de representación de nombres.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de falsos positivos y negativos en la detección de entidades.
- Repositorio sin descargas ni validación de la comunidad (0 descargas, 0 likes) y sin `pipeline_tag` declarado, lo que sugiere que no ha pasado por una revisión externa.
- No se documenta el tamaño ni la procedencia exacta del split de evaluación, lo que dificulta reproducir la cifra reportada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-mos
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Otro modelo del mismo autor (SabiYarn-125M, preentrenado en lenguas nigerianas): https://huggingface.co/BeardedMonster/SabiYarn-125M-finetune
- Búsqueda por etiqueta `sabiyarn` en HuggingFace: https://huggingface.co/models?other=sabiyarn
- Referencia sobre arquitectura BERT (Wikipedia): https://en.wikipedia.org/wiki/BERT_(language_model)
- El resto de resultados de la búsqueda web (modelsaber.com, savrn.com) no guardan relación con este modelo y se han descartado.
