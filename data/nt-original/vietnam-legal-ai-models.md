# NT-ORIGINAL/vietnam-legal-ai-models

## Resumen

El repositorio `NT-ORIGINAL/vietnam-legal-ai-models` contiene dos modelos de procesamiento de lenguaje natural específicos para el dominio legal vietnamita, desarrollados por el usuario NT-ORIGINAL (con copyright atribuido a KerryFT). El primer modelo, `PhoBERT_BiLSTM_CRF_weights.pt`, está diseñado para el reconocimiento de entidades nombradas (NER) en textos legales, mientras que el segundo, `PhoBERT_Relation_Super_Final.pt`, se centra en la extracción de relaciones entre entidades. Ambos se basan en el modelo preentrenado `vinai/phobert-base-v2`, una variante de BERT adaptada al vietnamita.

Estos modelos abordan la necesidad de automatizar la recuperación de información jurídica en vietnamita, un campo con escasez de recursos lingüísticos especializados. Su relevancia radica en que permiten extraer entidades como leyes, artículos, tribunales o personas, y las relaciones entre ellas, facilitando tareas de búsqueda y análisis documental. La arquitectura combina el transformer PhoBERT con capas BiLSTM y CRF para la tarea de NER, mientras que la arquitectura exacta del segundo modelo no se detalla en la documentación.

El repositorio tiene un tamaño de 1,1 GB y los pesos se distribuyen en formato PyTorch (`.pt`). La licencia es AGPL-3.0, lo que implica obligaciones de copyleft para uso comercial. El modelo está pensado para investigación y soporte a la consulta legal, pero no sustituye el asesoramiento profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PhoBERT-base-v2 (transformer) + BiLSTM + CRF para NER; arquitectura del modelo de relaciones no especificada |
| Parametros totales | No disponible (depende del modelo base; PhoBERT-base-v2 tiene 135M según su documentación, pero no se confirma en esta ficha) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base PhoBERT-base-v2, consultar su documentación) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en precisión completa, sin cuantización publicada) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo base es `vinai/phobert-base-v2`, un transformer tipo BERT preentrenado en vietnamita. Sobre esta base, el modelo de NER añade una capa BiLSTM seguida de una capa CRF para la etiquetación secuencial de entidades. Esta combinación es habitual en tareas de NER porque el CRF modela dependencias entre etiquetas consecutivas, mejorando la coherencia de las predicciones. El segundo modelo, dedicado a la extracción de relaciones, no especifica su arquitectura interna en la documentación proporcionada.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se detallan innovaciones técnicas particulares más allá de la arquitectura mencionada. El autor indica que los modelos se desarrollaron para fines de investigación, aprendizaje y apoyo a la recuperación de información legal en vietnamita.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en textos legales vietnamitas, identificando elementos como leyes, artículos, tribunales, personas, organizaciones, fechas, etc.
- Extracción de relaciones entre entidades legales, permitiendo estructurar la información extraída en forma de tripletas (sujeto, relación, objeto).
- Procesamiento de texto en vietnamita, utilizando el modelo base PhoBERT que ha sido entrenado específicamente para este idioma.
- No es un modelo generativo: no produce texto libre, sino que clasifica tokens o pares de entidades.
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales (visión, audio).
- No está diseñado para tareas de conversación o agentes autónomos.

## Casos de uso

- Búsqueda semántica en bases de datos legales: extraer entidades de documentos jurídicos para indexar y recuperar información relevante de forma más precisa que una búsqueda por palabras clave.
- Asistencia a la revisión de contratos: identificar automáticamente las partes contratantes, fechas, cláusulas y obligaciones mediante NER y extracción de relaciones, reduciendo el tiempo de revisión manual.
- Análisis de jurisprudencia: extraer entidades como tribunales, jueces, delitos y sentencias de resoluciones judiciales para construir grafos de conocimiento que faciliten el estudio de precedentes.
- Automatización de informes legales: combinar los modelos con pipelines de procesamiento para generar resúmenes estructurados de documentos legales, aunque el propio modelo no genera texto.
- Desarrollo de asistentes legales conversacionales: integrar los modelos como componente de extracción de información en un sistema más amplio que responda preguntas sobre normativa vietnamita.
- Investigación académica en PLN jurídico: servir como punto de partida para experimentos de NER y extracción de relaciones en el dominio legal vietnamita, dado su enfoque especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas como F1, precisión o recall para las tareas de NER o extracción de relaciones, ni comparaciones con otros modelos.

## Requisitos de hardware

- Al estar basado en PhoBERT-base-v2 (aproximadamente 135M de parámetros), la inferencia es ligera y puede ejecutarse en CPU con un consumo de memoria moderado (alrededor de 1-2 GB de RAM con pesos en float32).
- En GPU, cualquier tarjeta con al menos 4 GB de VRAM es suficiente para inferencia en lote pequeño (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.).
- No se proporcionan estimaciones de latencia o throughput.
- Los pesos se cargan con PyTorch; no se mencionan formatos optimizados como ONNX, TensorRT o GGUF, por lo que el despliegue se limita a entornos con PyTorch instalado.
- No se indica compatibilidad con servidores de inferencia como vLLM, TGI o llama.cpp, que suelen requerir formatos específicos (safetensors, GGUF).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se pueden establecer comparativas con otras soluciones de NER legal en vietnamita.

## Limitaciones y advertencias

- El modelo puede producir resultados inexactos u omitir información, como advierte el propio autor en la model card.
- Está diseñado exclusivamente para el idioma vietnamita; no es aplicable a otros idiomas sin un reentrenamiento completo.
- La licencia AGPL-3.0 impone obligaciones de copyleft: cualquier uso comercial o distribución de servicios basados en estos modelos debe liberar el código fuente bajo la misma licencia, lo que puede ser restrictivo para aplicaciones propietarias.
- No sustituye el asesoramiento legal profesional; sus salidas deben verificarse siempre con fuentes oficiales y textos legales vigentes.
- No se proporcionan detalles sobre el dataset de entrenamiento ni sobre posibles sesgos introducidos por los datos, por lo que no se puede evaluar la cobertura de diferentes áreas del derecho.
- Al ser un modelo de clasificación, no genera explicaciones ni justificaciones de sus predicciones, lo que limita su uso en contextos donde se requiera trazabilidad.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad y puede contener errores o carecer de soporte.

## Enlaces

- Repositorio en HuggingFace: [NT-ORIGINAL/vietnam-legal-ai-models](https://huggingface.co/NT-ORIGINAL/vietnam-legal-ai-models)
- Modelo base: [vinai/phobert-base-v2](https://huggingface.co/vinai/phobert-base-v2)
