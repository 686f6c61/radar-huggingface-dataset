# PraveenNIPE/sdg-classifier

## Resumen

SDG Classifier es un modelo de clasificación de texto multietiqueta desarrollado por el usuario PraveenNIPE que asigna descripciones de proyectos o políticas a los Objetivos de Desarrollo Sostenible (ODS) de Naciones Unidas con los que se relacionan. Se trata de un ajuste fino de `google-bert/bert-base-uncased` con una salida sigmoide independiente por objetivo, de modo que un mismo texto puede activar varias etiquetas simultáneamente. El modelo cubre 11 de los 17 ODS: concretamente los objetivos 1, 2, 4, 5, 6, 7, 9, 10, 11, 12 y 13.

Con 109,49 millones de parámetros y una arquitectura transformer encoder estándar (BERT base), el modelo está pensado para tareas de etiquetado temático sobre textos cortos en inglés, con una ventana de 512 tokens y truncado del input más allá de ese límite. Su relevancia práctica radica en la automatización del triaje de carteras de proyectos, informes de sostenibilidad o convocatorias de financiación, donde la clasificación manual según los ODS es costosa y poco consistente entre analistas.

El propio autor lo describe como un prototipo temprano entrenado sobre un conjunto de datos muy pequeño de descripciones breves de proyectos, por lo que debe tratarse como una sugerencia y no como un juicio definitivo. El repositorio incluye pesos en safetensors y una exportación ONNX en precisión completa para su uso con Transformers.js en el navegador, además de una demo pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), clasificación multietiqueta con una cabeza sigmoide por objetivo |
| Parametros totales | 109.490.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncado del input) |
| Tipos de cuantizacion | No se proporcionan versiones cuantizadas; el autor indica que las versiones ONNX de 8 bits alteraban las predicciones y no las incluye |
| Idiomas soportados | en (inglés) |
| Licencia | other |
| Formato de pesos | safetensors, ONNX (fp32) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas, sobre el que se ha añadido una cabeza de clasificación con una salida sigmoide por cada uno de los 11 ODS cubiertos. A diferencia de una clasificación softmax de clase única, cada objetivo se puntúa de forma independiente, lo que permite que un texto active varias etiquetas y que las puntuaciones no sumen 1. El tokenizador y el vocabulario son los del BERT base original, con input truncado a 512 tokens.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste adicionales como RLHF o DPO. El autor sí especifica que el ajuste se realizó sobre un conjunto de datos muy pequeño de descripciones cortas de proyectos, lo que condiciona la calibración de las probabilidades y la generalización fuera de ese dominio. No se documentan innovaciones arquitectónicas más allá del esquema multietiqueta con sigmoide.

## Capacidades

- Clasificación multietiqueta de textos cortos en inglés según 11 ODS (1, 2, 4, 5, 6, 7, 9, 10, 11, 12 y 13).
- Puntuación independiente por objetivo mediante sigmoide, con umbral recomendado de 0,3 como punto de partida.
- Procesamiento de descripciones de proyectos, políticas y textos similares de temática única.
- Exportación ONNX en fp32 para inferencia en el navegador con Transformers.js.
- Compatibilidad con el pipeline `text-classification` de Transformers y con Text Embeddings Inference / endpoints compatibles según los tags del repositorio.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- No cubre los ODS 3, 8, 14, 15, 16 y 17.

## Casos de uso

- Triaje de carteras de proyectos de cooperación: clasificar automáticamente cientos de descripciones breves de proyectos para preasignar los ODS correspondientes antes de la revisión humana, reduciendo el trabajo manual inicial.
- Etiquetado de convocatorias y subvenciones: procesar resúmenes de propuestas de financiación para verificar su alineación con los ODS declarados y detectar posibles desajustes entre la memoria y las etiquetas solicitadas.
- Enriquecimiento de bases de datos de informes de sostenibilidad: añadir metadatos temáticos ODS a registros existentes de forma masiva, aprovechando que el modelo procesa textos cortos con bajo coste computacional.
- Filtrado previo en plataformas de datos abiertos: clasificar descripciones de datasets o publicaciones para habilitar búsquedas facetadas por objetivo de desarrollo sostenible.
- Análisis exploratorio de corpus de políticas públicas: agrupar documentos por ODS para estudios preliminares de cobertura temática, siempre con validación posterior por analistas dado el carácter de prototipo del modelo.
- Demo interactiva en el navegador: desplegar la versión ONNX fp32 con Transformers.js para que usuarios no técnicos prueben la clasificación de textos sin infraestructura de servidor, por ejemplo en talleres o materiales formativos.
- Preetiquetado en pipelines de anotación humana: generar sugerencias de ODS que los anotadores confirmen o corrijan, acelerando la creación de datasets etiquetados de mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en fp32 para los pesos (109,49 M de parámetros), con overhead adicional de activaciones y tokenizador; el tamaño del repositorio es de 0,9 GB, que incluye safetensors y la exportación ONNX.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 y H100, aunque estas últimas están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline de Transformers, Transformers.js con el fichero `onnx/model.onnx` en `dtype: "fp32"`, Text Embeddings Inference (según tags del repositorio) y endpoints compatibles. No se proporcionan versiones GGUF ni cuantizadas de 8 bits.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| PraveenNIPE/sdg-classifier | 109,49 M | 512 tokens | Clasificación multietiqueta de 11 ODS en inglés | other | Prototipo con dataset pequeño; incluye ONNX fp32 |
| google-bert/bert-base-uncased | 110 M aprox. | 512 tokens | Modelo base de propósito general | Apache 2.0 | Requiere ajuste fino para clasificación ODS; no predice etiquetas por sí solo |
| Clasificadores ODS alternativos | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables específicos de clasificación ODS en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente, pero al entrenarse sobre un dataset muy pequeño de descripciones de proyectos, probablemente hereda los sesgos de dominio y de composición de ese corpus.
- Riesgo de alucinación de etiquetas: el modelo solo conoce 11 ODS; los textos sobre salud, océanos, bosques, paz o trabajo decente se asignarán al objetivo más cercano de los que sí conoce, generando etiquetas potencialmente engañosas.
- Calibración deficiente: la confianza en textos distintos a los ejemplos de entrenamiento suele ser baja, a menudo 0,4–0,5 como máximo, según el autor.
- Limitación de idioma y longitud: funciona mejor con descripciones cortas, de temática única y en inglés; el input se trunca a 512 tokens y no hay soporte multilingüe.
- Restricciones de licencia: la licencia es "other" y no se detallan sus términos, por lo que debe verificarse antes de cualquier uso comercial o redistribución.
- Caveat para producción: el autor lo califica de prototipo temprano; su salida debe tratarse como sugerencia y no como decisión final, recomendándose validación humana y recalibración del umbral según el caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PraveenNIPE/sdg-classifier
- Demo en el navegador: https://pnbayar.github.io/sdg-classifier/
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
