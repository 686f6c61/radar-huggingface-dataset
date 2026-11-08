# haroon-ahmad/legalbert-canadian-outcome

## Resumen

Legal-BERT for Canadian appeal outcomes es un clasificador binario de texto especializado en resoluciones judiciales canadienses. Desarrollado por haroon-ahmad, se construye mediante fine-tuning de `nlpaueb/legal-bert-base-uncased` y predice, a partir de la sección de hechos de una resolución, la probabilidad de que una apelación o solicitud judicial haya sido estimada (allowed) frente a desestimada (dismissed). El modelo forma parte del trabajo *Validity-Aware Temporal Graph Retrieval of Canadian Precedent* (Ahmad, 2026) y se publica como artefacto de investigación, no como herramienta de asesoramiento legal.

La arquitectura es un transformer encoder BERT-base con 109.483.778 parámetros totales, licencia CC BY-SA 4.0 y pesos en formato safetensors. El repositorio ocupa 0,4 GB y el modelo solo soporta inglés. Su relevancia radica en que aborda una tarea de predicción de resultados judiciales con una metodología explícita de limpieza de datos (eliminación de frases que revelan el desenlace) y una evaluación separada en un conjunto fuera de distribución (Federal Court of Appeal), lo que permite medir su generalización más allá del corpus de entrenamiento.

El modelo no está pensado para uso directo en producción sin supervisión: el propio autor documenta un sesgo sistemático hacia la clase negativa (infrapredice "allowed") y una dependencia fuerte de señales de tribunal y tipo de caso. Su valor principal es como componente en pipelines de investigación jurídica o como baseline reproducible para experimentos de predicción de resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (fine-tune de nlpaueb/legal-bert-base-uncased) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por ventana; hasta 6 ventanas por documento (510 tokens con paso de 446) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT-base (transformer encoder bidireccional) afinado para clasificación binaria de secuencias. La entrada se construye a partir del texto de hechos extraído por `pipeline/facts_extract.py`, que omite encabezados de decisión y resumen, se detiene en la sección de análisis y elimina frases que enuncian el resultado. Los textos largos se dividen en ventanas de 510 tokens con paso de 446 tokens, cada una envuelta como `[CLS] … [SEP]`; se permiten como máximo 6 ventanas por documento y la probabilidad final es la media de las probabilidades de cada ventana. El autor advierte que las ventanas deben construirse manualmente porque el comportamiento del overflow de `tokenizers` cambió a partir de la versión 0.22.

El entrenamiento utilizó 34.087 decisiones, excluyendo casos vinculados a los objetivos de test y casos que comparten nombres de parte poco frecuentes con ellos. Se aplicaron 2 épocas, tasa de aprendizaje 2e-5, batch size 16 por GPU en 2 × T4 y semilla 42. El SHA-256 del dataset es `9750a6a913a308490e0ea78652c76a75b3530bd75f53ec4ab768244dbffc74ea`. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un fine-tuning supervisado estándar sobre etiquetas derivadas de reglas aplicadas al texto de disposición.

## Capacidades

- Clasificación binaria de resultados judiciales: estima la probabilidad de que una apelación o solicitud haya sido estimada frente a desestimada.
- Procesamiento de textos largos mediante ventaneo con agregación por media de probabilidades (hasta 6 ventanas de 510 tokens).
- Extracción de señal a partir de la sección de hechos, sin acceso al fallo ni al análisis jurídico.
- Especialización en el dominio legal canadiense (cortes de apelación y tribunales del corpus A2AJ).
- Funcionamiento como componente en pipelines de investigación: el autor documenta un combinador (`combiner_lb_snap.json`) que fusiona este modelo con un juez LLM (SubQ Snap) en log-odds.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación académica en predicción de resultados judiciales: el modelo sirve como baseline reproducible para experimentos sobre el corpus A2AJ, con métricas publicadas en validación, calibración, test y un conjunto fuera de distribución.
- Análisis exploratorio de corpus de jurisprudencia: permite etiquetar grandes volúmenes de decisiones canadienses con una probabilidad de estimación, útil para priorizar revisiones manuales o construir conjuntos de datos anotados.
- Componente en sistemas híbridos de apoyo a la decisión: combinado con un juez LLM mediante el combinador documentado, alcanza 0,770 de accuracy y 0,824 de AUC en el conjunto de test de 913 casos, lo que lo hace adecuado como señal secundaria en pipelines que requieran acceso a la API de Snap.
- Estudio de sesgos en modelos jurídicos: su sesgo documentado hacia la clase negativa (predice ~20% de casos como allowed frente a una tasa real del 34%) lo convierte en un caso de estudio útil para investigar calibración y desbalance en clasificación legal.
- Evaluación de generalización entre jurisdicciones: el conjunto de la Federal Court of Appeal (1.168 casos, fuera de distribución) permite medir la transferibilidad del modelo a cortes no vistas durante el entrenamiento.
- Filtrado previo en flujos de revisión documental: en despachos o unidades de investigación, puede usarse para clasificar preliminarmente expedientes y dirigir la atención humana hacia los casos con mayor probabilidad estimada, siempre con validación humana posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor, todos con umbral de decisión 0,5:

| Split | n | Accuracy | Balanced acc. | AUC | Baseline mayoritaria |
|---|---|---|---|---|---|
| Validación | 1.794 | 0,761 | 0,668 | 0,789 | 0,690 |
| Calibración | 2.000 | 0,755 | 0,665 | 0,783 | 0,681 |
| Test (limpio, 913 del paper) | 913 | 0,726 | 0,644 | 0,730 | 0,658 |
| Federal Court of Appeal (fuera de distribución) | 1.168 | 0,725 | 0,591 | 0,722 | 0,703 |

El combinador con el juez LLM SubQ Snap alcanza 0,770 de accuracy y 0,824 de AUC en los mismos 913 casos de test. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un BERT-base de 109 millones de parámetros, la inferencia en fp32 requiere aproximadamente 0,45 GB de pesos; en fp16, unos 0,22 GB. Con overhead de activaciones y batch pequeño, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o throughput alto, A100 o H100 aportan margen adicional.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (PyTorch) con `AutoModelForSequenceClassification`; el ventaneo debe implementarse manualmente según el repositorio. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| haroon-ahmad/legalbert-canadian-outcome | 109,5 M | 512 tokens por ventana (hasta 6 ventanas) | Clasificación binaria de resultados judiciales canadienses | CC BY-SA 4.0 | Hugging Face |
| nlpaueb/legal-bert-base-uncased | ~110 M | 512 tokens | Modelo base legal de propósito general (enmascarado) | no disponible en la información | Hugging Face |
| jhu-clsp/LegalBert | no disponible | no disponible | Modelo legal (transformers) | no disponible | Hugging Face |

La comparación con alternativas específicas de predicción de resultados judiciales canadienses no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgo hacia la clase negativa: el modelo etiqueta aproximadamente el 20% de los casos de test como allowed, frente a una tasa real del 34%, por lo que infrapredice la clase positiva.
- Etiquetas derivadas de reglas sobre el texto de disposición: los resultados mixtos o parciales fueron excluidos o forzados a una de las dos clases, lo que introduce ruido en el entrenamiento.
- Entrenado solo en cortes de apelación y tribunales canadienses del corpus A2AJ; no evaluado en tribunales de primera instancia ni en otras jurisdicciones.
- La mayor parte de la señal predictiva proviene del tribunal y del tipo de caso; en el paper, añadir precedentes recuperados no mejoró significativamente la predicción.
- No evaluado sobre texto crudo de resoluciones: el texto sin procesar suele revelar el resultado, por lo que el modelo solo es válido con la extracción de hechos del pipeline.
- Dependencia de la versión de `tokenizers`: el comportamiento del overflow cambió tras la versión 0.22, y las ventanas deben construirse manualmente.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir bajo la misma licencia; el texto de entrenamiento proviene del corpus A2AJ, donde cada decisión tiene la licencia de su tribunal de origen, lo que puede imponer restricciones adicionales.
- Artefacto de investigación: no constituye asesoramiento legal y no debe usarse para decisiones jurídicas sin supervisión humana.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración deficiente: las probabilidades no deben interpretarse como certezas sin validación en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haroon-ahmad/legalbert-canadian-outcome
- Modelo base: https://huggingface.co/nlpaueb/legal-bert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/haroon-ahmad/canadian-precedent-validity
- Código del proyecto: https://github.com/haroonahmaddata/canadian-precedent-validity
- Paper: Ahmad, 2026, arXiv:XXXX.XXXXX (identificador no disponible en la información proporcionada)
- Modelo comparable (jhu-clsp/LegalBert): https://huggingface.co/jhu-clsp/LegalBert
