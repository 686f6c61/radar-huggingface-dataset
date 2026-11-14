# raulgdp/bert-base-spanish-wwm-uncased-finetuned-nuevamente-2026-32

## Resumen

`bert-base-spanish-wwm-uncased-finetuned-nuevamente-2026-32` es un modelo de clasificación de tokens (token classification) obtenido por ajuste fino del checkpoint `dccuchile/bert-base-spanish-wwm-uncased` de la Universidad de Chile. Lo publica el usuario `raulgdp` en Hugging Face y sigue el pipeline `token-classification` de Transformers, por lo que su salida natural es un etiquetado por token: reconocimiento de entidades nombradas (NER), etiquetado POS, chunking u otras tareas secuenciales similares.

Arquitectura BERT base (encoder transformer bidireccional) con vocabulario en español y enmascarado de palabras completas (whole word masking). Cuenta con 109.267.209 parámetros reales según el fichero safetensors, lo que lo sitúa en el rango estándar de BERT-base. El ajuste fino se realizó durante 10 épocas con AdamW, learning rate 2e-5 y batch de 32, alcanzando en el conjunto de evaluación una F1 de 0,8366, precisión de 0,8321, recall de 0,8410 y accuracy de 0,9647.

Su relevancia es acotada: se trata de un experimento de ajuste fino sin model card completada (el propio autor deja "More information needed" en descripción, usos previstos y datos de entrenamiento), sin licencia declarada y sin descargas ni interacciones en el momento de la consulta. Es útil como referencia de un pipeline de NER en español, pero no como modelo listo para producción sin verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer bidireccional), variante whole word masking, uncased |
| Parametros totales | 109.267.209 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT admite hasta 512 tokens, aunque no se declara en la model card) |
| Tipos de cuantizacion | no disponible (no se declaran versiones GGUF, ONNX ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible en la model card; el modelo base está entrenado para español |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `dccuchile/bert-base-spanish-wwm-uncased`, un BERT base entrenado con enmascarado de palabras completas sobre corpus en español. La cabeza de clasificación de tokens se entrena sobre un dataset que el autor no identifica en la model card (aparece como "None dataset"). Los hiperparámetros documentados son: learning rate 2e-5, batch de entrenamiento y evaluación de 32, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y 10 épocas, con 2.610 pasos totales (261 pasos por época).

No se documenta composición del dataset, número de tokens de entrenamiento, ni si hubo técnicas adicionales como RLHF, DPO o decodificación especulativa (no aplicables en un encoder de clasificación). Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 5.2.0 y Tokenizers 0.23.3. La evolución del entrenamiento muestra sobreajuste moderado: la pérdida de validación baja hasta 0,1358 en la época 3 y repunta hasta 0,1895 en la época 10, mientras la pérdida de entrenamiento cae a 0,0135.

## Capacidades

- Clasificación de tokens por token: pensado para tareas secuenciales como NER, etiquetado POS, chunking o extracción de spans.
- Comprensión del español: hereda el vocabulario y el preentrenamiento del checkpoint `dccuchile/bert-base-spanish-wwm-uncased`.
- Codificación contextual bidireccional: adecuado para tareas de comprensión, no para generación de texto.
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: no declaradas; el modelo base está orientado al español.

## Casos de uso

- Reconocimiento de entidades nombradas en textos en español: el modelo etiqueta cada token con una categoría (persona, organización, lugar, etc.) y puede integrarse en pipelines de extracción de información sobre documentos, noticias o expedientes.
- Etiquetado morfosintáctico (POS tagging): útil para preprocesar corpus lingüísticos, construir árboles de dependencias o alimentar analizadores posteriores.
- Chunking sintáctico: segmentación de sintagmas nominales y verbales en pipelines de procesamiento del lenguaje natural clásico.
- Anonimización de datos personales: detección de nombres y entidades sensibles en textos antes de almacenarlos o compartirlos, con revisión humana dado el F1 de 0,8366.
- Extracción de campos en documentos estructurados semiestructurados (contratos, informes): etiquetado de spans relevantes para poblar bases de datos.
- Enriquecimiento de motores de búsqueda internos: etiquetado de entidades para indexación semántica y filtros facetados.
- Componente en pipelines de moderación o análisis de contenido: detección de menciones a entidades concretas en flujos de texto.

## Benchmarks y rendimiento

El autor declara métricas sobre el conjunto de evaluación, pero el model-index no contiene resultados formales (lista `results` vacía). Los datos disponibles son los de la tabla de entrenamiento:

| Epoca | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|
| 1 | 0,1536 | 0,7763 | 0,7515 | 0,7637 | 0,9552 |
| 2 | 0,1361 | 0,8148 | 0,8130 | 0,8139 | 0,9619 |
| 3 | 0,1358 | 0,8162 | 0,8243 | 0,8202 | 0,9632 |
| 4 | 0,1479 | 0,8086 | 0,8212 | 0,8149 | 0,9623 |
| 5 | 0,1616 | 0,8210 | 0,8346 | 0,8277 | 0,9636 |
| 6 | 0,1764 | 0,8112 | 0,8171 | 0,8142 | 0,9617 |
| 7 | 0,1775 | 0,8320 | 0,8359 | 0,8339 | 0,9646 |
| 8 | 0,1849 | 0,8257 | 0,8337 | 0,8297 | 0,9640 |
| 9 | 0,1892 | 0,8337 | 0,8419 | 0,8378 | 0,9651 |
| 10 | 0,1895 | 0,8321 | 0,8410 | 0,8366 | 0,9647 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores corresponden a la tarea de clasificación de tokens del ajuste fino, no a benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,44 GB de pesos (109,3 M de parámetros); en FP16, unos 0,22 GB. Con activaciones y overhead de runtime, cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes, A100, H100, L4 o RTX 4090 permiten throughput alto. Para inferencia puntual, una GTX 1650 o superior es suficiente.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: transformers con PyTorch, Hugging Face Inference Endpoints (la etiqueta `endpoints_compatible` está presente), ONNX Runtime si se exporta, o vLLM/TGI aunque estos últimos están más orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por secuencia corta en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `raulgdp/bert-base-spanish-wwm-uncased-finetuned-nuevamente-2026-32` | 109,3 M | no disponible | Token classification | no disponible | Hugging Face (0 descargas) |
| `dccuchile/bert-base-spanish-wwm-uncased` (modelo base) | ~110 M | 512 tokens (BERT estándar) | Masked LM / encoder | no disponible en esta ficha | Hugging Face |
| `PlanTL-GOB-ES/roberta-base-bne` | ~125 M | 512 tokens | Encoder en español | no disponible en esta ficha | Hugging Face |
| `BSC-TeMU/roberta-base-bne` (variantes NER) | ~125 M | 512 tokens | Token classification | no disponible en esta ficha | Hugging Face |

La comparación directa con alternativas de NER en español no puede completarse con datos de rendimiento porque el autor no publica comparativas ni el dataset de evaluación. El modelo base y las alternativas de RoBERTa en español son las referencias naturales por tamaño y dominio.

## Limitaciones y advertencias

- Model card incompleta: el autor deja "More information needed" en descripción, usos previstos, limitaciones y datos de entrenamiento, lo que impide conocer el dominio real de aplicación.
- Dataset de entrenamiento no identificado ("None dataset"): no se puede evaluar la representatividad ni el sesgo de los datos.
- Licencia no declarada: no hay garantía explícita de uso comercial; es necesario contactar con el autor antes de integrarlo en producción.
- Sobreajuste probable: la pérdida de validación repunta a partir de la época 3 mientras la de entrenamiento cae hasta 0,0135, lo que sugiere que el checkpoint final no es el óptimo en validación (la mejor F1 se alcanza en la época 9, 0,8378).
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la etiquetación: F1 de 0,8366 implica un margen de error considerable para producción sin revisión humana.
- Idiomas: no se declara soporte multilingüe; el modelo base está orientado al español y no se garantiza comportamiento en otras lenguas.
- Contexto: no se declara la longitud máxima, aunque el modelo base BERT admite 512 tokens; secuencias más largas requerirán truncamiento o segmentación.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validación externa del checkpoint.
- Fecha de creación declarada en 2026-11-14, lo que conviene verificar antes de citarlo como referencia estable.

## Enlaces

- Hugging Face: https://huggingface.co/raulgdp/bert-base-spanish-wwm-uncased-finetuned-nuevamente-2026-32
- Modelo base: https://huggingface.co/dccuchile/bert-base-spanish-wwm-uncased
- No se han encontrado papers, blogs, repositorios o demos adicionales en la búsqueda web proporcionada.
