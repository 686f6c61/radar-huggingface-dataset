# davidmelash/modern_liberta_large_w2048_v7_2026-10-09_r5

## Resumen

`modern_liberta_large_w2048_v7_2026-10-09_r5` es un modelo de clasificación de tokens (token classification) orientado a la detección de datos personales en resoluciones judiciales ucranianas, con el objetivo de facilitar su pseudonimización. Lo desarrolla el usuario de Hugging Face `davidmelash` y deriva por fine-tuning de `Goader/modern-liberta-large`, un encoder ucraniano basado en la arquitectura ModernBERT. El modelo tiene 409.799.689 parámetros (~410M) y se distribuye en formato safetensors bajo licencia MIT.

La tarea concreta que resuelve es el reconocimiento de entidades nombradas (NER) sobre cuatro categorías: `ОСОБА` (persona), `АДРЕСА` (dirección), `НОМЕР` (número) e `ІНФОРМАЦІЯ` (información). El fine-tuning se ha realizado sobre un dataset sintético denominado `v7`, construido a partir de decisiones del Registro Unificado Estatal de Resoluciones Judiciales de Ucrania cuyos fragmentos anonimizados se rellenaron con valores generados (direcciones procedentes del directorio de Ukrposhta y de OpenStreetMap).

Es relevante porque aborda un caso de uso real de cumplimiento normativo y protección de datos en un dominio (documentos judiciales en ucraniano) con poca cobertura de modelos especializados. Al ser un encoder de ~410M parámetros, es ligero, desplegable en hardware modesto y apto para procesar grandes volúmenes de texto con baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only basado en ModernBERT (modelo base `Goader/modern-liberta-large`) |
| Parametros totales | 409.799.689 (~410M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens según el identificador del checkpoint (`w2048`); el modelo base soporta contextos más largos (hasta 8192 en ModernBERT). No confirmado de forma explícita en la model card |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, la arquitectura sobre la que se construye el modelo base `Goader/modern-liberta-large`. ModernBERT introduce mejoras respecto a BERT clásico, como la alternancia de capas de atención local y global, el uso de embeddings rotatorios (RoPE), la activación GeGLU y técnicas de unpadding para mejorar la eficiencia. El modelo base fue preentrenado sobre Kobza, un corpus ucraniano de aproximadamente 60.000 millones de tokens, y se presenta como el primer modelo ucraniano con soporte eficiente de contexto largo. Sobre esa base, este checkpoint aplica un fine-tuning para clasificación de tokens con 4 etiquetas de entidad.

El entrenamiento de fine-tuning se realizó sobre el dataset sintético `v7`, generado a partir de resoluciones judiciales del Registro Unificado Estatal de Resoluciones Judiciales de Ucrania: se tomaron documentos cuyos fragmentos ya estaban anonimizados y se rellenaron con valores generados, incluyendo direcciones del directorio de Ukrposhta y de OpenStreetMap (© OpenStreetMap contributors, ODbL). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF/DPO (no aplicables de forma habitual a un modelo encoder de clasificación). Tampoco se detallan hiperparámetros, número de épocas ni métricas de validación.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en ucraniano sobre cuatro tipos: `ОСОБА` (persona), `АДРЕСА` (dirección), `НОМЕР` (número) e `ІНФОРМАЦІЯ` (información).
- Clasificación a nivel de token, adecuada para etiquetado BIO/secuencial sobre documentos completos.
- Detección de datos personales orientada a pseudonimización de textos legales y judiciales.
- Procesamiento de contexto de hasta 2048 tokens según el identificador del checkpoint, útil para fragmentos largos de resoluciones judiciales.
- Ejecución como pipeline de `token-classification` en la librería transformers.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No incorpora generación de texto, razonamiento generativo, tool calling, capacidades multimodales (visión/audio) ni modo de razonamiento explícito: es un modelo exclusivamente discriminativo de etiquetado.
- Capacidad multilingüe limitada al ucraniano (no se declaran otros idiomas).

## Casos de uso

- Pseudonimización de resoluciones judiciales: el modelo identifica nombres, direcciones, números e información sensible en sentencias ucranianas para sustituirlos por marcadores, permitiendo publicar los documentos respetando la normativa de protección de datos.
- Cumplimiento del RGPD y normativas locales de privacidad: integrado en un pipeline de anonimización previo a la publicación o al archivado de expedientes legales, reduce la exposición de datos personales.
- Anonimización de datasets para investigación: permite preparar corpus judiciales o legales libres de datos personales antes de liberarlos para entrenamiento de otros modelos o para estudios académicos.
- Enmascaramiento en sistemas de gestión documental legal: en despachos y administraciones, se puede ejecutar como paso previo a la indexación o al envío de documentos a sistemas de búsqueda.
- Auditoría de fuga de datos personales: detección automática de entidades sensibles en grandes volúmenes de documentos para verificar que los procesos de anonimización previos han funcionado correctamente.
- Preprocesado para pipelines de NLP jurídico: servir como primer paso que etiqueta entidades antes de tareas posteriores de extracción de información, resumen o clasificación de documentos.
- Redacción asistida con privacidad: en herramientas que ayudan a redactar o revisar textos legales, marcar automáticamente las entidades antes de que el documento salga del entorno controlado.
- Cumplimiento en el sector público: procesamiento por lotes de registros judiciales para detectar y proteger datos personales antes de su difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones cuantitativas con otros modelos de NER en ucraniano.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead): ~1,6 GB en FP32, ~820 MB en FP16/BF16 y ~410 MB en INT8.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y prácticamente cualquier GPU con 4 GB o más de VRAM.
- Ejecutable en CPU para inferencia por lotes, dado que se trata de un encoder de ~410M parámetros.
- GPU recomendadas para alto throughput: A100, H100, L40S o RTX 4090 si se procesan grandes volúmenes en paralelo; para uso puntual, cualquier GPU moderna es suficiente.
- Opciones de despliegue: pipeline `token-classification` de transformers, exportación a ONNX Runtime para inferencia optimizada, y compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`). No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `davidmelash/modern_liberta_large_w2048_v7_2026-10-09_r5` | Token classification (NER ucraniano, fine-tune) | ~410M | 2048 tokens (según identificador) | MIT | Hugging Face |
| `Goader/modern-liberta-large` | Encoder ModernBERT (modelo base, preentrenado en ucraniano) | No disponible en la información proporcionada | Hasta 8192 tokens | No disponible en la información | Hugging Face |
| Otros modelos especializados en NER ucraniano | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de modelos comparables equivalentes (misma tarea y mismo idioma) en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente discriminativo de etiquetado de tokens; no genera texto ni mantiene diálogo, por lo que no debe emplearse para tareas generativas.
- Limitado al ucraniano; no hay evidencia de rendimiento en otros idiomas.
- Entrenado sobre un dataset sintético (`v7`) construido a partir de documentos anonimizados y valores generados: existe el riesgo de un dominio de entrenamiento poco realista y de un posible sesgo hacia los patrones de datos sintéticos, con degradación en documentos reales.
- No se publican métricas de evaluación (precisión, recall, F1) ni análisis de errores, por lo que el rendimiento real en producción es incierto.
- Riesgo de falsos positivos y falsos negativos: al tratarse de un modelo estadístico, puede no detectar entidades sensibles o marcar como datos personales fragmentos que no lo son, con implicaciones en flujos de cumplimiento normativo.
- La ventana de 2048 tokens (según identificador) obliga a fragmentar documentos largos, lo que puede afectar a entidades que queden a caballo entre fragmentos.
- Aunque la licencia MIT permite uso comercial, el modelo base y el corpus de preentrenamiento pueden tener sus propias condiciones; conviene revisar la licencia y los términos de `Goader/modern-liberta-large` y del corpus Kobza antes de un uso comercial.
- Las direcciones sintéticas provienen de directorios de Ukrposhta y OpenStreetMap (ODbL), cuyas licencias pueden imponer condiciones de atribución si se reutilizan los datos derivados.
- No se documentan sesgos específicos, pero el entrenamiento sobre textos judiciales ucranianos puede reflejar sesgos presentes en el dominio legal de origen.
- El número de descargas y likes es cero en el momento del registro y el modelo es reciente (creado en 2026-10-09), por lo que carece de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidmelash/modern_liberta_large_w2048_v7_2026-10-09_r5
- Modelo base: https://huggingface.co/Goader/modern-liberta-large
- README del modelo base: https://huggingface.co/Goader/modern-liberta-large/blob/main/README.md
