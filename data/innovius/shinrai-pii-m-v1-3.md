# innovius/shinrai-pii-m-v1.3

## Resumen

ShinrAI PII M v1.3 es un modelo de detección y anonimización de información personal identificable (PII) desarrollado por Innovius como parte de su sistema ShinrAI, una solución de "cifrado semántico" que reemplaza datos sensibles respetando el contexto cultural y lingüístico. El modelo se basa en el encoder multilingüe jhu-clsp/mmBERT-base y está diseñado para tareas de token-classification (NER), con 307 millones de parámetros y soporte para 15 idiomas.

La versión v1.3 es la más reciente de la familia ShinrAI, e incorpora 19 cabezas de clasificación para distintos tipos de PII, detección de formato y una calidad mejorada para japonés, que había quedado rezagada en la versión anterior. El modelo se distribuye con pesos en safetensors y ONNX, y está pensado para despliegue on-premise, lo que lo hace relevante para organizaciones con requisitos estrictos de privacidad y soberanía de datos, como hospitales, bufetes de abogados o empresas sujetas al GDPR.

Su acceso es restringido (gated) y se rige por la Innovius Open License v1.0, que permite uso gratuito para gobiernos, educación, investigación y empresas con ingresos anuales inferiores a 10 millones de dólares, con conversión automática a Apache 2.0 en septiembre de 2028.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) basado en jhu-clsp/mmBERT-base, con cabezas de clasificación de tokens (NER) |
| Parametros totales | 307.632.515 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors y ONNX, sin cuantización declarada) |
| Idiomas soportados | Alemán, inglés, francés, español, italiano, polaco, portugués, ruso, ucraniano, turco, árabe, hebreo, japonés, coreano (15 locales) |
| Licencia | Innovius Open License v1.0 (conversión a Apache 2.0 el 1 de septiembre de 2028) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se construye sobre jhu-clsp/mmBERT-base, un encoder transformer multilingüe desarrollado por el Laboratorio de Procesamiento de Lenguaje y Cognición de la Universidad Johns Hopkins. Aunque el repositorio incluye la etiqueta "modernbert", no se especifica si se trata de una variante ModernBERT o de una adaptación propia; la base declarada es mmBERT-base. La arquitectura es de tipo encoder denso, con una cabeza de clasificación por token para identificar entidades PII.

No se han publicado detalles sobre el proceso de entrenamiento: se desconoce el número de tokens, la composición del dataset, si se aplicaron técnicas de ajuste fino supervisado o aprendizaje por refuerzo. La documentación de Innovius indica que la versión v1.3 incorpora 19 cabezas de clasificación (probablemente 19 tipos de PII) y detección de formato, pero no se ofrecen más detalles técnicos. El sistema ShinrAI se describe como "cifrado semántico", lo que sugiere que el modelo no solo detecta PII, sino que también genera reemplazos contextualmente apropiados, aunque no se detalla el mecanismo exacto.

## Capacidades

- Detección de entidades PII mediante token-classification (NER) en 15 idiomas, incluyendo escrituras no latinas (árabe, hebreo, japonés, coreano).
- 19 cabezas de clasificación para distintos tipos de PII (nombres, direcciones, fechas, números de identificación, etc.), aunque no se publica la lista exacta.
- Detección de formato, lo que permite identificar patrones como números de teléfono, correos electrónicos o códigos postales.
- Anonimización y pseudonimización de PII con reemplazo semántico que respeta el contexto cultural y lingüístico, según la propuesta de ShinrAI.
- Despliegue on-premise mediante el motor shinrai-engine, que expone una API FastAPI con inferencia ONNX en CPU o GPU.
- Integración con el conector de escritorio de ShinrAI para uso en flujos de trabajo locales.

## Casos de uso

- Anonimización de historiales clínicos: el modelo puede procesar cartas de derivación médica y otros documentos sanitarios para eliminar datos personales antes de su uso en investigación o entrenamiento de modelos, como se demuestra en el corpus Golden ePA de cartas de médicos alemanes.
- Cumplimiento del GDPR en empresas: organizaciones que manejan datos de clientes en múltiples idiomas pueden desplegar el modelo on-premise para garantizar que los textos no contengan PII antes de ser almacenados o compartidos.
- Preparación de datasets para entrenamiento de LLMs: antes de usar texto web o corpora internos para fine-tuning, el modelo puede limpiar automáticamente los datos eliminando o reemplazando PII, reduciendo el riesgo de fuga de información en modelos generativos.
- Protección de datos en chatbots y asistentes virtuales: el modelo puede integrarse en un pipeline de preprocesamiento para enmascarar PII en las conversaciones antes de que lleguen al modelo de lenguaje, evitando que el LLM memorice información sensible.
- Análisis de texto multilingüe con privacidad: empresas con operaciones en países de habla árabe, hebrea o asiática pueden usar el modelo para anonimizar documentos legales, financieros o de RRHH sin depender de servicios cloud externos.
- Despliegue en entornos con soberanía de datos: instituciones gubernamentales o de investigación pueden ejecutar el modelo en su propia infraestructura mediante el shinrai-engine (FastAPI + ONNX), cumpliendo requisitos de residencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión v1.3 en la información disponible. Los datos existentes corresponden a versiones anteriores:

| Versión | Benchmark | Resultado |
|---|---|---|
| v1.1 "Pathfinder" | Corpus Golden ePA (cartas de doctor alemanas reales, coincidencia estricta de spans) | F1 71.8 |
| v1.2 | Suites generadas en seis idiomas | Macro F1 89.2 - 94.4 |

Según el documento de Innovius, estos resultados se sitúan al nivel o por encima del rango del 60-85% reportado por servicios cloud de PII y del 85-95% auto-reportado por modelos open de clase RoBERTa en sus propios corpus. No se dispone de datos comparativos para v1.3.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Con 307 millones de parámetros, el modelo en FP32 ocupa aproximadamente 1,2 GB en memoria, y en FP16 unos 0,6 GB. El repositorio pesa 2,5 GB, lo que sugiere que incluye pesos en FP32 y posiblemente ONNX.
- Es probable que quepa en GPUs de consumo con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 3070, RTX 4060) para inferencia en FP16, aunque no está confirmado.
- El motor shinrai-engine soporta inferencia ONNX en CPU y GPU, por lo que también puede ejecutarse en entornos sin GPU, con mayor latencia.
- Para despliegue en producción, se puede usar el shinrai-engine con FastAPI, o exportar el modelo a otros formatos como ONNX Runtime o TensorRT. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, dado que es un modelo encoder, no generativo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de detección de PII. Existen alternativas como Microsoft Presidio (basado en spaCy y modelos NER) o modelos de HuggingFace como dslim/bert-base-NER, pero no se han encontrado datos de rendimiento comparables en la documentación de ShinrAI. Se recomienda evaluar el modelo en el corpus propio antes de decidir.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace; es necesario aceptar la licencia para descargarlo. El acceso se concede automáticamente a gobiernos, educación, investigación y empresas con ingresos anuales inferiores a 10 millones de dólares. Las empresas más grandes deben contactar con Innovius.
- Licencia no estándar: la Innovius Open License v1.0 no es una licencia de código abierto convencional; aunque se convierte a Apache 2.0 en 2028, hasta entonces impone restricciones de uso comercial para grandes empresas.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo o equidad del modelo en diferentes grupos demográficos o variedades lingüísticas.
- Riesgo de errores en detección: como todo modelo NER, puede fallar en la identificación de PII en textos con formatos inusuales, errores tipográficos o contextos ambiguos, lo que podría provocar fugas de información si se confía ciegamente en el resultado.
- Limitaciones de contexto: no se especifica la longitud máxima de secuencia soportada; al ser un modelo BERT, probablemente esté limitado a 512 tokens, lo que puede requerir segmentación de documentos largos.
- Dependencia del idioma: aunque cubre 15 idiomas, la calidad puede variar significativamente entre ellos; la documentación indica que el japonés fue un punto débil en v1.2 y se mejoró en v1.3, pero no hay métricas publicadas para todos los idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/innovius/shinrai-pii-m-v1.3
- Página oficial de ShinrAI: https://innovius.ai/shinrai/
- Repositorio shinrai-engine (GitHub): https://github.com/Innovius-ai/shinrai-engine
- Documento de visión general (PDF): https://innovius.ai/shinrai/shinrai-overview.pdf
