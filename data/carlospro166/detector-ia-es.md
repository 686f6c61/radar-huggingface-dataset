# Carlospro166/detector-ia-es

## Resumen

El modelo `Carlospro166/detector-ia-es` es un clasificador de texto basado en la arquitectura BERT, publicado en Hugging Face por el usuario Carlospro166. Por su nombre e identificador, está orientado a la detección de contenido generado por inteligencia artificial en castellano, aunque la model card no documenta explícitamente esa finalidad ni el proceso de entrenamiento seguido. El repositorio contiene 109.852.418 parámetros en formato safetensors, lo que corresponde a la configuración estándar de un BERT-base (aproximadamente 110 millones de parámetros), y un tamaño total de 0,6 GB.

La relevancia de este modelo radica en su pipeline declarado (`text-classification`) y en su compatibilidad con infraestructura de inferencia habitual (transformers, ONNX, text-embeddings-inference y endpoints compatibles). No obstante, se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, creado y actualizado el 27 de noviembre de 2026, y cuya model card es la plantilla autogenerada de Hugging Face sin completar. Esto implica que no hay información verificable sobre datos de entrenamiento, métricas, licencia ni idiomas soportados.

En consecuencia, esta ficha describe lo que puede inferirse de los metadatos técnicos disponibles (arquitectura, tamaño, formatos, librería) y marca explícitamente como no disponible todo aquello que el autor no ha documentado. Cualquier evaluación de idoneidad para producción debe hacerse con cautela y validación empírica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder, tag `bert` en Hugging Face) |
| Parametros totales | 109.852.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base suele usar 512 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; existe variante ONNX en el repo) |
| Idiomas soportados | no disponible (el identificador sugiere castellano, sin confirmación documental) |
| Licencia | no disponible |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

La etiqueta `bert` y el recuento de 109.852.418 parámetros son consistentes con un BERT-base estándar: un transformer encoder de 12 capas, dimensión oculta 768 y 12 cabezas de atención, con una cabeza de clasificación sobre el token `[CLS]`. El repositorio incluye además artefactos ONNX, lo que facilita el despliegue en entornos de inferencia optimizados. La tag `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, citado en la plantilla de model card, y no a un paper del propio modelo.

No hay información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, si se aplicó fine-tuning supervisado sobre una base preentrenada (por ejemplo, BETO o BERT multilingual) ni si se usaron técnicas de regularización, aumento de datos o calibración. Tampoco se documenta el esquema de etiquetas (binario humano/IA, multiclase por generador, etc.) ni el procedimiento de evaluación. Todo ello debe considerarse no disponible.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo emite etiquetas y puntuaciones de confianza sobre secuencias de entrada.
- Detección de contenido generado por IA: inferida del identificador `detector-ia-es`, sin confirmación en la model card.
- Procesamiento de castellano: inferido del sufijo `-es`, sin confirmación documental.
- Inferencia vía transformers: compatible con `AutoModelForSequenceClassification` y `pipeline("text-classification")`.
- Despliegue ONNX: el repositorio incluye artefactos ONNX, lo que permite ejecución con ONNX Runtime.
- Compatibilidad con text-embeddings-inference y endpoints compatibles: según las tags de Hugging Face.
- Tool calling / function calling: no disponible (no es una capacidad propia de un clasificador BERT).
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Moderación de contenido en foros y comunidades: el modelo puede clasificar publicaciones como generadas por IA o humanas, integrándose en un pipeline de revisión previa a la publicación; su tamaño (110 M de parámetros) permite ejecutarlo en CPU con latencia baja para volúmenes moderados.
- Verificación editorial en medios: como filtro de primera pasada sobre textos recibidos de colaboradores, marcando aquellos con alta probabilidad de origen sintético para revisión humana posterior.
- Detección de spam y granjas de contenido: clasificación por lotes de comentarios y reseñas en plataformas de comercio electrónico, aprovechando la inferencia ONNX para procesar grandes volúmenes en servidores sin GPU.
- Señal auxiliar en sistemas antiplagio: combinación de la puntuación del clasificador con otras heurísticas (perplejidad, marcas de agua) para enriquecer el veredicto final en herramientas académicas.
- Investigación sobre detección de IA en español: uso como línea base o punto de comparación en estudios que evalúen la robustez de detectores frente a distintos generadores y dominios.
- Filtrado previo en pipelines de curación de datos: descarte automático de textos sintéticos al construir corpus de entrenamiento o evaluación en castellano, reduciendo contaminación por contenido generado.
- Enrutamiento en atención al cliente: clasificación de mensajes entrantes para derivar a agentes humanos o a respuestas automáticas según su origen estimado, aunque esta aplicación requiere validación empírica previa por la ausencia de métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (109,85 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, T4, L4, A10, A100, H100). El modelo no requiere GPU de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: viable para inferencia en producción a volúmenes moderados gracias al tamaño reducido; el ONNX incluido en el repo puede acelerar la ejecución con ONNX Runtime.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, text-embeddings-inference, endpoints compatibles con Hugging Face, y potencialmente servidores de inferencia genéricos que acepten modelos BERT.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carlospro166/detector-ia-es | 109,85 M | no disponible | Clasificacion de texto (deteccion de IA, inferida) | no disponible | Hugging Face, 0 descargas |
| BETO (dccuchile/bert-base-spanish-wwm-cased) | ~110 M | 512 tokens | Modelo base en castellano, fine-tuneable | MIT (segun su model card publica) | Hugging Face, ampliamente usado |
| RoBERTa-base (BSC-TeMU/roberta-base-bne) | ~125 M | 512 tokens | Modelo base en castellano | Apache 2.0 (segun su model card publica) | Hugging Face, ampliamente usado |
| Detectores comerciales de IA (GPTZero, Originality.ai) | no disponible | no disponible | Deteccion de texto IA | propietaria | SaaS |

La comparación con BETO y RoBERTa-BNE es pertinente porque, si el modelo se ha construido por fine-tuning sobre una base en castellano, esos serían los candidatos naturales. Sin embargo, la ausencia de documentación impide confirmar la relación. Los detectores comerciales se incluyen como referencia de categoría, no como equivalentes técnicos.

## Limitaciones y advertencias

- Model card incompleta: la práctica totalidad de los campos están sin rellenar (`[More Information Needed]`), lo que impide conocer datos de entrenamiento, etiquetas, métricas y sesgos.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue en producción.
- Idiomas no confirmados: el sufijo `-es` sugiere castellano, pero no hay documentación que lo respalde ni que aclare variantes (España vs. Latinoamérica).
- Riesgo de alucinación de etiquetas: como todo clasificador, puede producir falsos positivos y falsos negativos; sin métricas publicadas no es posible estimar su tasa de error.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se pueden evaluar sesgos por dominio, registro, género o variedad dialectal.
- Contexto limitado: si se confirma la configuración BERT-base, la ventana sería de 512 tokens, insuficiente para documentos largos sin truncado o segmentación.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso comunitario ni validación externa.
- Fecha de creación futura: el repositorio figura creado el 27 de noviembre de 2026, lo que puede indicar un error de metadatos o un artefacto reciente sin trayectoria de uso.
- Detección de IA como tarea intrínsecamente frágil: los detectores basados en clasificadores supervisados sufren degradación frente a nuevos generadores, parafraseo y edición humana; sin evaluación continua no se puede garantizar su fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Carlospro166/detector-ia-es
- Paper citado en la plantilla (Lacoste et al., 2019, sobre emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- BETO (referencia de modelo base en castellano): https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- RoBERTa-BNE (referencia de modelo base en castellano): https://huggingface.co/BSC-TeMU/roberta-base-bne
