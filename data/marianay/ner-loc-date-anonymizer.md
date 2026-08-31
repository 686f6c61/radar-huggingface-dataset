# marianaY/ner-loc-date-anonymizer

## Resumen

El modelo `marianaY/ner-loc-date-anonymizer` es un clasificador de tokenización (token classification) diseñado para la detección de entidades nombradas relacionadas con ubicaciones y fechas, con el objetivo de facilitar tareas de anonimización de datos personales. Desarrollado por Mariana Yuvchenko (usuario `marianaY`), el modelo se publicó en Hugging Face en agosto de 2026 y ha recibido 118 descargas hasta la fecha. Su nombre sugiere un uso específico en pipelines de privacidad, donde la identificación precisa de localizaciones y fechas es crítica para eliminar información sensible antes de procesar documentos con LLMs o almacenar datos.

El modelo cuenta con 107.723.525 parámetros, un tamaño que encaja con la familia de arquitecturas BERT-base (alrededor de 110 millones de parámetros), y está etiquetado con el tag `bert` en Hugging Face. El repositorio ocupa 1,7 GB, lo que indica que se distribuyen pesos en formato `safetensors`. La model card es genérica y no aporta detalles sobre el entrenamiento, los datos utilizados ni las métricas de evaluación, por lo que gran parte de la información técnica no está disponible públicamente. A pesar de ello, su pipeline (`token-classification`) y su nombre lo posicionan como una herramienta especializada en NER para anonimización, un área de creciente interés en entornos empresariales que manejan datos personales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (según tag, sin confirmación oficial) |
| Parametros totales | 107.723.525 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura no está documentada en la model card. El tag `bert` y el número de parámetros (107,7 M) sugieren que se trata de un modelo basado en BERT-base, probablemente fine-tuneado para la tarea de reconocimiento de entidades nombradas (NER) con etiquetas específicas para ubicaciones y fechas. Sin embargo, no se ha publicado información sobre el proceso de entrenamiento: ni el dataset utilizado, ni el número de épocas, ni si se aplicaron técnicas como fine-tuning con aprendizaje supervisado o ajuste con datos sintéticos. Tampoco se especifica si se usó algún método de alineación como RLHF o DPO, algo poco habitual en modelos de clasificación de tokens. La ausencia de detalles impide confirmar si se emplearon innovaciones técnicas como decodificación especulativa o atención lineal, que no son típicas en modelos de este tamaño.

## Capacidades

- Detección de entidades nombradas de tipo ubicación (LOC) y fecha (DATE) en texto, según el nombre del modelo.
- Clasificación a nivel de token, lo que permite identificar los límites exactos de cada entidad dentro de una frase.
- Integración con el ecosistema `transformers` de Hugging Face, lo que facilita su uso en pipelines de NER estándar.
- Compatibilidad con `endpoints_compatible`, lo que permite desplegarlo en la infraestructura de inferencia de Hugging Face.
- No se ha confirmado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multilingües más allá de lo que el modelo subyacente pueda ofrecer.

## Casos de uso

- Anonimización de documentos clínicos: el modelo puede identificar fechas de nacimiento, fechas de consulta y ubicaciones de hospitales o clínicas en historiales médicos, permitiendo su eliminación o enmascaramiento antes de compartir los datos con terceros.
- Preparación de datasets para entrenamiento de LLMs: antes de usar textos con información personal en fine-tuning, el modelo puede localizar y eliminar menciones de lugares y fechas, reduciendo el riesgo de fuga de datos.
- Cumplimiento normativo (RGPD, HIPAA): en empresas que procesan datos de clientes, el modelo puede integrarse en un pipeline de detección de PII para garantizar que los documentos no contengan información de ubicación o temporal sensible.
- Limpieza de logs y registros de sistemas: los logs de servidores suelen incluir direcciones IP, ciudades y marcas de tiempo; este modelo puede identificar las partes de fecha y ubicación para su posterior anonimización.
- Redacción automática de sentencias judiciales o informes legales: el modelo puede localizar fechas de eventos y lugares de juicio en textos legales, facilitando la publicación de versiones anonimizadas.
- Filtrado de contenido generado por usuarios en plataformas: para evitar que los usuarios compartan su ubicación o fechas personales en comentarios o reseñas, el modelo puede detectar y ocultar estas entidades en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión, recall o F1 para este modelo en ninguna tarea de NER estándar (como CoNLL-2003 o WNUT). Tampoco se han comparado sus métricas con otros modelos de anonimización.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~108 M parámetros en precisión fp32 ocupa aproximadamente 430 MB de memoria. Con cuantización a int8, podría reducirse a ~110 MB. Para inferencia en CPU, se necesitan al menos 2-4 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en GPUs integradas de gama media.
- Cabe en GPUs de consumo: sí, es un modelo pequeño que se puede ejecutar en cualquier GPU moderna, incluso en una Raspberry Pi con suficiente RAM (aunque con latencia mayor).
- Opciones de despliegue: al ser un modelo de `transformers`, se puede servir con vLLM, TGI, o mediante la API de inferencia de Hugging Face. También es compatible con `llama.cpp` si se convierte a formato GGUF, aunque no se ha confirmado dicha conversión.
- Latencia y throughput: no hay datos oficiales. En una GPU moderna (RTX 3090), se espera una latencia de pocos milisegundos por secuencia corta, pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo no tiene documentación sobre su rendimiento ni sobre los datos de entrenamiento, por lo que no es posible contrastarlo con alternativas como `dslim/bert-base-NER` (que cubre múltiples entidades), `spaCy` (modelos NER en varios idiomas) o `GLiNER` (NER basado en instrucciones). Se recomienda evaluar el modelo en un conjunto de datos propio antes de usarlo en producción.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos de alucinación o limitaciones de contexto. Al ser un modelo de NER, no genera texto, por lo que el riesgo de alucinación es bajo, pero puede cometer errores de clasificación (falsos positivos o negativos) en entidades ambiguas.
- No se especifica la licencia, lo que impide conocer si su uso comercial está permitido. Se debe contactar con el autor antes de utilizarlo en entornos empresariales.
- El modelo solo está etiquetado para ubicaciones y fechas; no cubre otros tipos de PII como nombres, correos electrónicos o números de teléfono, por lo que no es una solución completa de anonimización.
- No se ha confirmado el idioma o idiomas soportados. Si el modelo se entrenó solo con datos en inglés, su rendimiento en otros idiomas será deficiente.
- El repositorio no incluye ejemplos de uso ni código de inferencia, lo que dificulta su integración rápida.
- La fecha de creación (agosto de 2026) y el bajo número de descargas (118) indican que es un modelo reciente y poco probado en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/marianaY/ner-loc-date-anonymizer)
- [Perfil del autor en Hugging Face](https://huggingface.co/marianaY)
- No se han encontrado papers, repositorios de código ni demos asociados a este modelo específico.
