# Amber-666/clinical-modernbert-cmv

## Resumen

El modelo `Amber-666/clinical-modernbert-cmv` es un clasificador de frases (sentence classification) fine-tuneado sobre `Simonlee711/Clinical_ModernBERT`, un encoder transformer especializado en texto biomédico y clínico. Su función concreta es detectar si una frase de un informe clínico indica positividad por citomegalovirus (CMV), devolviendo una probabilidad entre dos clases: `CMV_POSITIVE` y `CMV_NEGATIVE`. El modelo se ha entrenado con 10.073 frases anotadas manualmente procedentes de 279 informes clínicos de CMV, y está pensado para su uso en pipelines de análisis de informes de radiología y otros documentos médicos.

La relevancia de este modelo radica en que aborda una tarea de clasificación muy específica dentro del dominio clínico, donde los modelos genéricos de NLP suelen fallar por falta de vocabulario especializado. Al partir de Clinical ModernBERT, que ya incorpora mejoras arquitectónicas de ModernBERT (RoPE, Flash Attention, GeGLU) y un preentrenamiento en literatura biomédica, el fine-tuning consigue un clasificador compacto de 136 millones de parámetros, con licencia MIT y disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (BERT-style) con mejoras de ModernBERT: RoPE, Flash Attention, GeGLU |
| Parametros totales | 136.579.586 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (modelo base); 512 tokens en el fine-tuning (según ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, Clinical ModernBERT, es un encoder transformer basado en ModernBERT, con mejoras como rotary positional embeddings (RoPE), Flash Attention para uso eficiente de memoria en contextos largos y capas de activación GeGLU. Se preentrenó sobre literatura biomédica, narrativas clínicas y ontologías médicas, con una ventana de contexto de 8.192 tokens.

El fine-tuning para CMV se realizó sobre este encoder con una cabeza de clasificación binaria. Los datos de entrenamiento consisten en 10.073 frases anotadas manualmente extraídas de 279 informes clínicos de CMV. Los hiperparámetros reportados son: learning rate 3e-5, weight decay 0, sin warmup, decaimiento lineal del LR, batch size 8, longitud máxima de 512 tokens, 3 épocas y semilla 168. No se menciona el uso de técnicas de alineación como RLHF o DPO; es un fine-tuning supervisado estándar.

## Capacidades

- Clasificación binaria a nivel de frase: devuelve la probabilidad de que una frase indique positividad por CMV.
- Clasificación a nivel de informe: el autor recomienda clasificar un informe como positivo si al menos una de sus frases supera el umbral de 0.5.
- Procesamiento por lotes con truncamiento y padding hasta 512 tokens por frase.
- Integración sencilla con la librería `transformers` de Hugging Face mediante `AutoModelForSequenceClassification`.
- No es un modelo generativo: no produce texto, solo etiquetas de clasificación.
- No soporta tool calling, agentes, visión ni audio.
- Solo inglés; no hay indicios de capacidades multilingües.

## Casos de uso

- Detección de CMV en informes de radiología: el modelo puede procesar automáticamente informes de tomografía o resonancia para señalar frases que sugieran infección activa por citomegalovirus, ayudando a priorizar la revisión médica.
- Cribado de historiales clínicos electrónicos: permite analizar grandes volúmenes de notas clínicas para identificar pacientes con posible CMV, reduciendo el esfuerzo manual de codificación.
- Investigación retrospectiva: en estudios epidemiológicos, se puede usar para etiquetar cohortes de pacientes a partir de informes históricos, acelerando la extracción de fenotipos.
- Soporte a la codificación médica: el clasificador puede asistir a codificadores profesionales sugiriendo la presencia de CMV en documentos, siempre bajo supervisión humana.
- Monitorización de ensayos clínicos: en estudios que requieren seguimiento de eventos adversos relacionados con CMV, el modelo puede filtrar informes relevantes para su revisión.
- Automatización de flujos de trabajo hospitalarios: integrado en un pipeline de NLP, puede clasificar informes en tiempo real y derivar los positivos a especialistas, mejorando la eficiencia operativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como precisión, recall o F1 sobre conjuntos de validación externos. El autor no reporta comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 136M de parámetros, lo que en FP32 ocupa aproximadamente 0,55 GB solo de pesos. Con activaciones y overhead, cabe en GPUs con 2 GB o más. En FP16, el consumo se reduce a la mitad.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. Incluso se puede ejecutar en CPU con razonable velocidad para lotes pequeños.
- Despliegue: compatible con Hugging Face `transformers`, `onnxruntime`, `TensorRT` y cualquier framework que soporte safetensors. No se han publicado versiones GGUF o cuantizaciones específicas.
- Latencia: al ser un encoder pequeño, la inferencia por frase es del orden de milisegundos en GPU y de decenas de milisegundos en CPU, dependiendo del hardware y del tamaño del lote.

## Comparativa con modelos similares

No se dispone de información comparativa directa con otros clasificadores de CMV. Como referencia, se puede comparar con el modelo base `Simonlee711/Clinical_ModernBERT` y con otros encoders clínicos como `BioBERT` o `ClinicalBERT`, pero no hay datos de rendimiento específicos para la tarea de CMV.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Amber-666/clinical-modernbert-cmv | 136M | 8.192 (base) / 512 (fine-tune) | Clasificación binaria CMV | MIT |
| Simonlee711/Clinical_ModernBERT | 136M (aprox.) | 8.192 | Encoder clínico general | MIT |
| BioBERT (base) | 110M | 512 | Encoder biomédico | MIT |

## Limitaciones y advertencias

- Es un modelo de clasificación a nivel de frase, no un modelo generativo ni un sistema de diagnóstico. No debe utilizarse para tomar decisiones clínicas sin revisión experta.
- El entrenamiento se realizó sobre un conjunto de datos limitado (279 informes) y específico de CMV; puede no generalizar a otros tipos de informes o variaciones lingüísticas del inglés clínico.
- No se han publicado métricas de rendimiento, por lo que se desconoce su precisión real y su tasa de falsos positivos/negativos.
- El umbral de clasificación (0.5) es un valor por defecto; puede ser necesario ajustarlo según la sensibilidad deseada.
- Solo soporta inglés; no es aplicable a textos en otros idiomas.
- La licencia MIT permite uso comercial, pero el modelo no es un dispositivo médico regulado; el usuario es responsable de cumplir con la normativa aplicable.
- No se han reportado sesgos específicos, pero como cualquier modelo entrenado en datos clínicos, puede reflejar sesgos presentes en los informes originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amber-666/clinical-modernbert-cmv
- Modelo base Clinical_ModernBERT: https://huggingface.co/Simonlee711/Clinical_ModernBERT
- Repositorio GitHub del modelo base: https://github.com/Simonlee711/Clinical_ModernBERT
- Paper de Clinical ModernBERT (arXiv): https://arxiv.org/pdf/2504.03964
