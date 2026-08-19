# jiosephlee/intern-s1-mini-molecule-property-transfer-v1.2-bioavailability-ma-best-knn-mae5

## Resumen

Este modelo es un fine-tuning especializado del modelo científico multimodal Intern-S1-mini-lm (8.200 millones de parámetros) para la predicción de biodisponibilidad molecular mediante transferencia de ensayos (*assay transfer*). Desarrollado por el usuario jiosephlee, el checkpoint se seleccionó por su rendimiento en regresión KNN con métrica MAE@5 sobre un dataset de propiedades moleculares con votación media y límite de grado 16. El modelo aborda el problema de predecir la biodisponibilidad de compuestos químicos a partir de representaciones moleculares, un paso crítico en el descubrimiento de fármacos.

La arquitectura subyacente es un transformer basado en Qwen3 (según los tags de HuggingFace), con una longitud de contexto de 4096 tokens. El entrenamiento se realizó durante 40 épocas sobre un dataset de transferencia de propiedades, empleando pérdida de objetivo suave con peso de entropía cruzada de formato de 0,1. Este checkpoint se retuvo en el paso 75 (época 15) por su mejor MAE@5 en validación. Es un modelo de investigación, no un predictor validado clínicamente, y su relevancia radica en demostrar mejoras significativas frente a métodos clásicos basados en huellas Morgan para tareas de ranking molecular.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3, según tags) |
| Parametros totales | 8.201.221.120 (8,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base probablemente soporta inglés, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Intern-S1-mini-lm, una variante de 8B parámetros del modelo fundacional científico Intern-S1 desarrollado por el laboratorio Shanghai AI Laboratory. Intern-S1 está diseñado para interpretar estructuras químicas, comprender secuencias de proteínas y planificar rutas de síntesis, manteniendo capacidades generales de razonamiento. El fine-tuning se realizó sobre un dataset de transferencia de propiedades moleculares (v1.2 vote-mean) con un límite de grado de 16 (ocho pares entrantes y ocho salientes por molécula). El entrenamiento usó 4 GPUs con batch efectivo de 128, learning rate de 2e-5, optimizador paged AdamW 8-bit y programación coseno con 10% de warmup. Se aplicó empaquetado BFD (*best-fit decreasing*) y entrenamiento sin padding, con longitud de secuencia fija de 4096 tokens. La pérdida combina un objetivo de etiqueta suave con un peso de 0,1 para la entropía cruzada del formato de salida. El checkpoint retenido corresponde al paso 75 de optimización (época 15), seleccionado por menor KNN MAE@5 en validación.

## Capacidades

- Generación de texto en formato conversacional (pipeline text-generation).
- Predicción de biodisponibilidad molecular mediante ranking de compuestos.
- Transferencia de propiedades entre ensayos (*assay transfer*), permitiendo extrapolar resultados de un ensayo a otro.
- Razonamiento sobre estructuras químicas y propiedades moleculares, heredado del modelo base Intern-S1-mini-lm.
- Capacidad de generar respuestas en lenguaje natural sobre datos moleculares, útil para asistentes de investigación.
- Soporte para inferencia con text-generation-inference (TGI) según los tags del repositorio.
- No se documentan capacidades de tool calling, agentes o visión en este checkpoint específico.

## Casos de uso

- Screening virtual de bibliotecas químicas: el modelo puede ordenar miles de compuestos por su biodisponibilidad predicha, permitiendo priorizar aquellos con mayor probabilidad de éxito en ensayos posteriores.
- Priorización de candidatos a fármacos en etapas tempranas: dado un conjunto de moléculas sintetizadas, el ranking generado ayuda a seleccionar las más prometedoras para estudios *in vivo*.
- Transferencia de resultados entre ensayos experimentales: cuando un ensayo tiene datos limitados, el modelo puede extrapolar propiedades desde otros ensayos relacionados, reduciendo la necesidad de experimentación adicional.
- Análisis de relaciones estructura-actividad (SAR): al combinar la generación de texto con la capacidad de ranking, se pueden explorar cómo pequeñas modificaciones estructurales afectan la biodisponibilidad.
- Asistente conversacional para químicos computacionales: integrado en un chatbot, permite consultar propiedades de moléculas específicas y obtener explicaciones en lenguaje natural.
- Generación de informes automatizados sobre propiedades moleculares: el modelo puede producir descripciones textuales de los resultados de ranking para documentación de proyectos de investigación.

## Benchmarks y rendimiento

Los resultados publicados en la model card se centran en la métrica principal KNN MAE@5 (menor es mejor) junto con NDCG@5 y Spearman, evaluados sobre 36 consultas de ranking retenidas.

| Split / ranker | KNN MAE@5 | NDCG@5 | Spearman |
|---|---:|---:|---:|
| Validación / modelo | 0.5344 | 0.8071 | 0.2818 |
| Test / modelo | 0.4442 | 0.8590 | 0.3802 |
| Test / Morgan weighted | 0.7765 | 0.7375 | 0.0517 |
| Test / Morgan vanilla | 0.7963 | 0.7235 | 0.0203 |

El modelo reduce el KNN MAE@5 en test un 42,8% relativo al método de huellas Morgan ponderadas sobre las mismas consultas. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K para este checkpoint específico.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware para inferencia.
- Con 8,2B parámetros en precisión FP16, los pesos ocupan aproximadamente 16,4 GB, por lo que se requiere una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para carga completa sin cuantización.
- Con cuantización a 8 bits (FP8 o INT8), los pesos se reducen a unos 8,2 GB, permitiendo su ejecución en GPUs consumer de 12-16 GB (RTX 4070 Ti, RTX 4080) aunque con posibles pérdidas de precisión.
- El entrenamiento se realizó con 4 GPUs, pero para inferencia es suficiente una sola GPU con memoria adecuada.
- Opciones de despliegue compatibles: text-generation-inference (TGI), vLLM, llama.cpp (si se convierte a GGUF), y posiblemente Ollama mediante conversión.
- No se han publicado mediciones de latencia o throughput para este modelo.

## Comparativa con modelos similares

No se ha publicado una comparativa directa con otros modelos de predicción de propiedades moleculares en la información disponible. El modelo se compara internamente con métodos basados en huellas Morgan (weighted y vanilla), que son aproximaciones clásicas de representación molecular, pero no con otros modelos de lenguaje especializados en química. El modelo base Intern-S1-mini-lm tiene comparativas en el paper de Intern-S1 (arXiv:2508.15763), pero no se dispone de esos datos desglosados para este checkpoint. Por tanto, la comparativa con alternativas como ChemBERTa, MolT5 o modelos específicos de QSAR no está disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un predictor validado clínicamente; los resultados no deben usarse para decisiones médicas o regulatorias.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación; se recomienda contactar al autor antes de cualquier uso productivo.
- El modelo está especializado en biodisponibilidad y transferencia de ensayos; su rendimiento en otras propiedades moleculares o dominios químicos no está garantizado.
- La longitud de contexto está limitada a 4096 tokens, lo que restringe la entrada de moléculas muy grandes o contextos extensos.
- No se documentan sesgos específicos del dataset de entrenamiento, pero al ser un fine-tuning sobre datos químicos, podría heredar sesgos de las bases de datos de procedencia.
- Riesgo de alucinación en la generación de texto: como modelo de lenguaje, puede producir afirmaciones incorrectas sobre propiedades químicas si se le pregunta fuera de su dominio de entrenamiento.
- El número de descargas y likes es cero, lo que sugiere que es un modelo reciente y poco probado en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-molecule-property-transfer-v1.2-bioavailability-ma-best-knn-mae5
- Modelo base en HuggingFace: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Repositorio GitHub de Intern-S1: https://github.com/InternLM/Intern-S1
- Paper de Intern-S1 en arXiv: https://arxiv.org/abs/2508.15763
- Versión FP8 del modelo base en ModelScope: https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Intern-S1-mini-FP8
