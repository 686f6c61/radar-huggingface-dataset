# CMB-ClimateModernBERT/Merge_Soup_CX

## Resumen

Merge_Soup_CX es un modelo de lenguaje enmascarado (masked language model) de tipo encoder, especializado en dominio climático, desarrollado por el equipo CMB-ClimateModernBERT como parte de la familia ClimateModernBERT. Se obtiene mediante la fusión lineal (model soup) de tres checkpoints resultantes de un continued pretraining de ModernBERT-Base sobre un corpus climático de 6,42 mil millones de tokens. El modelo está pensado para investigación en procesamiento de lenguaje natural aplicado al clima: clasificación de textos, etiquetado multi-etiqueta y recuperación de información en documentos de divulgación corporativa, políticas públicas, literatura científica y noticias climáticas.

Con 149,6 millones de parámetros y una ventana de contexto de 8.192 tokens, este checkpoint corresponde a la fase 1 del entrenamiento (extensión de contexto) sin la fase de especialización con decay de learning rate (LRD). La fusión se realiza con promediado uniforme de pesos normalizado, una técnica que combina los conocimientos adquiridos por cada variante entrenada en subcorpus distintos. El modelo alcanza una puntuación media de F1 de 74,2 en nueve benchmarks climáticos, superando al baseline ModernBERT-Base (73,5) y a ClimateBERT (72,1) bajo el mismo protocolo de evaluación.

Su relevancia actual radica en que aborda un problema poco explorado: cómo la composición del corpus de dominio influye en el rendimiento de la adaptación continua de modelos de lenguaje. Al estar basado en ModernBERT, hereda su eficiencia computacional y su soporte nativo en Transformers desde la versión 4.48, sin necesidad de confiar en código remoto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-Base) |
| Parametros totales | 149.655.232 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en BF16/FP32) |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT-Base, un transformer encoder de 22 capas con dimensión oculta de 768, 12 cabezas de atención y un vocabulario de 50.368 subpalabras. No se trata de un modelo generativo ni de tipo MoE; es un modelo denso de máscara de lenguaje (MLM) diseñado para representar texto. La fusión se realiza mediante promediado lineal uniforme de los pesos de tres checkpoints entrenados por separado, cada uno sobre un subcorpus distinto del corpus climático total de 6,42B tokens: académico (~1,28B), web climática (~5B) y sintético (~0,14B). Esta técnica, conocida como model soup, aprovecha la conectividad lineal de los mínimos de pérdida para combinar modelos sin necesidad de entrenamiento adicional.

El entrenamiento de cada componente siguió el protocolo de continued pretraining de ModernBERT en dos fases. La fase 1 (la única aplicada a este checkpoint, sufijo CX) consistió en 3 épocas con learning rate constante de 3e-4, batch global de 576, longitud de secuencia de 8.192 tokens, masking MLM del 30%, optimizador StableAdamW y precisión BF16, ejecutado en 4 GPUs NVIDIA A100 con MosaicML Composer. La fase 2, que aplica un decay de learning rate con schedule 1 − √t y factor final de 1e-3, no se incluye en esta variante; la versión con LRD (Merge_Soup_LRD) alcanza 76,3 de F1 media y es la recomendada por los autores para uso general.

## Capacidades

- Representación contextual de texto en inglés, orientada a tareas de clasificación, etiquetado y recuperación.
- Codificación de secuencias largas de hasta 8.192 tokens, útil para documentos extensos como informes corporativos o artículos científicos.
- Fine-tuning eficiente para clasificación de secuencias, clasificación multi-etiqueta y retrieval semántico.
- Adaptado específicamente a vocabulario y estructuras del dominio climático: emisiones, compromisos de reducción, recomendaciones TCFD, sentimiento climático, etc.
- No es un modelo generativo: no produce texto libre ni responde instrucciones; su salida son embeddings o logits de clasificación.
- No soporta tool calling, agentes ni razonamiento multi-paso; tampoco tiene capacidades multimodales.

## Casos de uso

- Análisis de divulgaciones corporativas sobre clima: el modelo puede fine-tunearse para detectar y clasificar menciones de emisiones de alcance 1, 2 y 3 en informes anuales o de sostenibilidad, ayudando a automatizar el seguimiento de compromisos empresariales.
- Clasificación de sentimiento climático en noticias y redes sociales: permite monitorizar la opinión pública sobre políticas climáticas, eventos extremos o anuncios de transición energética a partir de textos periodísticos.
- Detección de compromisos y acciones climáticas en documentos de políticas públicas: identifica si un texto gubernamental contiene objetivos de reducción de emisiones, plazos concretos o mecanismos de verificación.
- Recuperación de información en literatura científica: al estar entrenado sobre artículos de revistas revisadas por pares, puede usarse como encoder para sistemas de búsqueda semántica en repositorios de investigación climática.
- Cumplimiento de recomendaciones TCFD: clasifica si los informes financieros de empresas cumplen con las recomendaciones del Task Force on Climate-related Financial Disclosures, facilitando auditorías regulatorias.
- Etiquetado multi-etiqueta de textos climáticos: asigna múltiples categorías temáticas (mitigación, adaptación, gobernanza, etc.) a párrafos o documentos completos, útil para construir bases de datos estructuradas.
- Búsqueda de pasajes relevantes en informes de impacto climático: gracias a su contexto de 8.192 tokens, puede indexar secciones largas de documentos para recuperar evidencia específica sobre riesgos físicos o de transición.

## Benchmarks y rendimiento

El modelo se evaluó en nueve benchmarks climáticos de NLP bajo un protocolo unificado: tres semillas de fine-tuning, una única configuración de hiperparámetros (LR 4e-5, batch efectivo 64, weight decay 0.01, hasta 10 épocas con early stopping sobre F1 de validación). Las tareas binarias y ClimRetrieve reportan F1 de clase positiva; las tareas multi-clase y multi-etiqueta reportan macro-F1. Los resultados medios se muestran en la siguiente tabla, comparados con los valores de referencia del manuscrito.

| Modelo | F1 media (9 benchmarks) |
|---|---|
| ClimateModernBERT Merge_Soup_CX (este modelo) | 74,2 |
| ModernBERT-Base (baseline estable) | 73,5 |
| ClimateBERT | 72,1 |

No se han publicado en la información disponible los desgloses por benchmark individual (Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve), ni métricas adicionales como precisión, recall o latencia. Los autores indican que la variante con fase LRD (Merge_Soup_LRD) alcanza 76,3 de F1 media, por lo que este checkpoint debe considerarse una versión intermedia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP32 y 0,3 GB en BF16/FP16, dado que el modelo tiene 149,6M de parámetros. Con cuantización INT8 podría reducirse a ~0,15 GB (no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA T4, RTX 3060 o superiores funcionan sin problema; incluso es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPUs de consumo: sí, en todas las generaciones recientes (GTX 16xx, RTX 20xx/30xx/40xx, etc.).
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con Hugging Face Inference Endpoints, vLLM (aunque está pensado para generativos, soporta encoders), o mediante scripts propios con PyTorch. Para clasificación, es habitual usar pipelines de `transformers` o exportar a ONNX para optimización.
- Latencia y throughput estimados: no se dispone de datos publicados. Como referencia, un encoder de 150M parámetros en una GPU A100 puede procesar cientos de secuencias por segundo en inferencia por lotes, pero estos valores dependen de la longitud de secuencia y del hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 media (clima) | Licencia | Notas |
|---|---|---|---|---|---|
| ClimateModernBERT Merge_Soup_CX | 149,6M | 8.192 | 74,2 | no disponible | Encoder climático, fase 1 sin LRD |
| ModernBERT-Base (baseline) | 149,6M | 8.192 | 73,5 | Apache 2.0 | Modelo generalista, sin adaptación de dominio |
| ClimateBERT | 110M aprox. | 512 | 72,1 | Apache 2.0 | Encoder climático basado en RoBERTa, contexto corto |

La comparativa muestra que la adaptación de dominio mediante continued pretraining y fusión de modelos aporta una mejora modesta pero consistente sobre el baseline generalista. ClimateBERT, al tener una ventana de contexto mucho menor (512 tokens), queda limitado para documentos extensos. La principal ventaja de este modelo frente a ClimateBERT es su contexto 16 veces mayor y su arquitectura más moderna, aunque la licencia no está especificada, lo que puede ser un obstáculo para uso comercial.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que limita su aplicación a textos climáticos en español, francés u otras lenguas.
- Es un modelo de lenguaje enmascarado, no un sistema de instrucciones: no genera texto ni responde preguntas; su uso requiere fine-tuning para cada tarea downstream.
- No produce garantías factuales calibradas sobre ciencia climática: las predicciones deben interpretarse con cautela en contextos de toma de decisiones.
- Los datos sintéticos tienen efectos dependientes de la tarea: ayudan en tareas guiadas por taxonomías y marcos (p. ej., TCFD) pero degradan el rendimiento en tareas que requieren comprensión de discurso fino y compromisos.
- La licencia no está disponible en la información publicada; esto impide determinar si su uso comercial está permitido.
- Los benchmarks actuales de NLP climático operan mayormente a nivel de frase o pasaje, por lo que la capacidad de contexto largo de 8.192 tokens no está plenamente explotada en la evaluación reportada.
- No se han publicado resultados de sesgos o alucinaciones específicos para este modelo; al derivar de ModernBERT-Base, hereda los sesgos de su corpus de entrenamiento original, aunque el continued pretraining sobre textos académicos y web filtrada puede mitigar o alterar dichos sesgos de forma desconocida.
- El texto académico crudo no se redistribuye; solo se liberan los pipelines de procesamiento, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_CX
- Repositorio original (sraj): https://huggingface.co/sraj/Merge_Linear_CX_only
- Colección de modelos ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Variante recomendada con LRD: https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_LRD
- Página del proyecto: https://michaelyya.github.io/ClimateModernBERT/
- Repositorio de código y pipelines: https://github.com/Michaelyya/ClimateModernBERT
