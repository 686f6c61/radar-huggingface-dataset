# AhmedRdwan/consumer-complaint-classifier

## Resumen

El Consumer Complaint Classifier es un modelo de clasificación de texto desarrollado por AhmedRdwan y publicado en HuggingFace. Se trata de un ajuste fino de DistilBERT sobre narrativas de quejas de consumidores del sector financiero, con el objetivo de asignar cada texto a una de cinco categorias: credit_card, credit_reporting, debt_collection, mortgages_and_loans y retail_banking. El modelo resuelve un problema de enrutado y triaje automatico de reclamaciones, una tarea habitual en entidades financieras y organismos de defensa del consumidor.

Arquitectonicamente es un transformer encoder de tipo BERT destilado, con 66.957.317 parametros totales en formato safetensors y un repositorio de 0,3 GB. El entrenamiento se realizo sobre una muestra estratificada de 56.000 filas del dataset publico de quejas de consumo de la CFPB (Consumer Financial Protection Bureau), y el autor reporta un Macro F1 de 0,84 sobre el conjunto de test reservado.

El modelo es relevante por su caracter practico y ligero: al derivar de DistilBERT, puede ejecutarse en CPU o en GPUs de gama baja con latencias bajas, lo que lo hace apto para pipelines de clasificacion a gran volumen. Su licencia MIT permite uso comercial sin restricciones adicionales. La contrapartida es que se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado exclusivamente a la clasificacion monoetiqueta en cinco clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT) |
| Parametros totales | 66.957.317 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite arquitectonico de DistilBERT; no especificado en la model card) |
| Tipos de cuantizacion | no disponible (no se documentan en la model card; al ser safetensors fp32 admite conversion a int8/fp16) |
| Idiomas soportados | no disponible (la model card no lo especifica; la base distilbert-base-uncased y el dataset CFPB estan en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Numero de clases | 5 (credit_card, credit_reporting, debt_collection, mortgages_and_loans, retail_banking) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT, una version destilada de BERT en la que se reduce el numero de capas a la mitad (6 capas frente a 12) manteniendo la dimension oculta, lo que da lugar a un encoder de aproximadamente 67 millones de parametros. Sobre esta base se anade una cabeza de clasificacion para 5 etiquetas, que produce la prediccion de categoria sobre la representacion del token especial [CLS]. La destilacion se realiza originalmente mediante entrenamiento con distillation loss, combinando las distribuciones de probabilidad del profesor BERT con las etiquetas reales, tecnica descrita en el paper de DistilBERT (Sanh et al., 2019).

En cuanto a los datos, el autor indica que el ajuste fino se realizo sobre una muestra estratificada de 56.000 filas del dataset de quejas de consumidores de la CFPB, con las cinco categorias objetivo. No se detalla en la model card el numero de tokens de entrenamiento, la composicion exacta por clase, la presencia de preprocesado especifico, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un clasificador de este tipo). Tampoco se especifican hiperparametros como learning rate, numero de epocas, batch size o estrategia de validacion. La unica metrica reportada es un Macro F1 de 0,84 en el conjunto de test reservado.

## Capacidades

- Clasificacion de texto monoetiqueta en 5 categorias financieras: credit_card, credit_reporting, debt_collection, mortgages_and_loans y retail_banking.
- Procesamiento de narrativas de quejas de consumidores en formato texto libre.
- Salida de distribuciones de probabilidad por clase (logits), lo que permite aplicar umbrales de confianza y estrategias de rechazo.
- Inferencia eficiente en CPU gracias al tamano reducido del modelo (67 M de parametros).
- Capacidad de integrarse en pipelines de transformers, ONNX Runtime u otros runtimes de inferencia.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento.
- No se documentan capacidades multimodales (vision, audio) ni generacion de texto: es exclusivamente un modelo discriminativo.
- Capacidad multilingue: no documentada; el modelo base y los datos de entrenamiento apuntan a ingles.

## Casos de uso

- Triaje automatico de reclamaciones bancarias: el modelo clasifica cada narrativa entrante en una de las cinco areas, permitiendo enrutar el ticket al departamento correspondiente (tarjetas, informes de credito, cobros, hipotecas o banca minorista) sin intervencion manual.
- Analisis de volumen en organismos reguladores: un regulador o defensor del consumidor puede procesar lotes de quejas y obtener la distribucion por categoria para detectar areas con mayor incidencia.
- Priorizacion de colas de atencion al cliente: al combinar la clase predicha con la probabilidad asociada, los casos de baja confianza pueden derivarse a revision humana, optimizando el esfuerzo del equipo.
- Enriquecimiento de bases de datos de CRM: clasificar retroactivamente quejas historicas para construir etiquetas de categoria y habilitar analitica agregada por producto financiero.
- Deteccion de tendencias y alertas tempranas: monitorizar el flujo de quejas por categoria a lo largo del tiempo para identificar picos en credit_reporting o debt_collection y activar investigaciones internas.
- Preprocesado en pipelines de NLP mas amplios: usar la etiqueta de categoria como caracteristica de entrada para modelos posteriores de analisis de sentimiento, resumen o extraccion de entidades.
- Filtrado y deduplicacion tematica: agrupar narrativas similares por categoria antes de aplicar tecnicas de clustering o busqueda semantica.
- Prototipado rapido y pruebas de concepto: al ser un modelo pequeno y con licencia MIT, es adecuado para validar arquitecturas de clasificacion antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Macro F1 | 0,84 | Test reservado (muestra CFPB) |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones con alternativas. El unico dato reportado por el autor es el Macro F1 indicado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 268 MB en fp32 (67 M de parametros x 4 bytes), unos 134 MB en fp16 y alrededor de 67 MB en int8. Estas cifras son estimaciones derivadas del numero de parametros; no estan documentadas por el autor.
- GPU recomendadas: cualquier GPU moderna es suficiente. El modelo cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o incluso en GPUs integradas y aceleradores de borde.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, e incluso puede ejecutarse integramente en CPU.
- Opciones de despliegue: pipeline de HuggingFace Transformers, ONNX Runtime, TorchServe, Text Generation Inference (TGI) para modelos encoder, FastAPI con transformers, o conversion a GGUF para llama.cpp/Ollama si se requiere un runtime unificado.
- Latencia y throughput estimados: no disponibles. Al tratarse de un encoder de 6 capas con 67 M de parametros, se espera una latencia muy baja (del orden de milisegundos por muestra en GPU y decenas de milisegundos en CPU), aunque no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Consumer Complaint Classifier (este modelo) | 66.957.317 | 512 tokens | Clasificacion 5 clases CFPB | MIT | HuggingFace |
| distilbert-base-uncased | ~66 M | 512 tokens | Modelo base, sin cabeza de clasificacion especifica | Apache 2.0 | HuggingFace |
| bert-base-uncased | ~110 M | 512 tokens | Modelo base, sin cabeza de clasificacion especifica | Apache 2.0 | HuggingFace |
| FinBERT (ProsusAI/finbert) | ~110 M | 512 tokens | Analisis de sentimiento financiero | no disponible en esta ficha | HuggingFace |

No se dispone de datos de rendimiento comparables para estos modelos en la tarea concreta de clasificacion de quejas CFPB, por lo que la comparacion se limita a parametros, contexto, tarea y licencia. No se han publicado comparaciones directas en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre quejas reales del CFPB, puede heredar sesgos presentes en los datos (por ejemplo, sobrerrepresentacion de determinados productos o perfiles demograficos).
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea, especialmente en narrativas ambiguas o que abordan varias categorias a la vez.
- Limitaciones de contexto: el limite de 512 tokens de DistilBERT puede truncar narrativas largas, lo que afectaria a la clasificacion. No se documenta ninguna estrategia de troceado o agregacion.
- Limitaciones de idioma: la model card no especifica idiomas soportados; el modelo base y el dataset de origen son en ingles, por lo que el rendimiento en otros idiomas no esta garantizado.
- Licencia: MIT, lo que permite uso comercial, modificacion y redistribucion con atribucion, sin restricciones adicionales conocidas.
- Caveat de produccion: no se documentan hiperparametros, criterios de validacion, ni analisis de errores. El Macro F1 de 0,84 es la unica metrica, y no se desglosa por clase, por lo que se desconoce si hay clases con rendimiento notablemente inferior.
- Modelo de nicho: con 0 descargas y 0 likes en el momento de la consulta, carece de validacion por parte de la comunidad y no hay evidencia de uso en produccion.
- Aviso: el modelo esta disenado para una taxonomia fija de 5 clases; no debe aplicarse a dominios distintos sin un nuevo ajuste fino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhmedRdwan/consumer-complaint-classifier
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Dataset de quejas de consumidores de la CFPB: https://www.consumerfinance.gov/data-research/consumer-complaints/
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Documentacion de HuggingFace Transformers para clasificacion de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
