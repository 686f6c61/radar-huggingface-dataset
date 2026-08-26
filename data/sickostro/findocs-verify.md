# Sickostro/FinDocs-Verify

## Resumen

FinDocs-Verify es un modelo de clasificación de texto basado en DistilBERT, desarrollado por Sickostro, especializado en la detección de discrepancias en facturas, como errores en el cálculo de cantidad por precio unitario frente al total. Se trata de un ajuste fino (fine-tuning) de `distilbert-base-uncased` sobre un conjunto de datos propietario de documentos de recepción, con el objetivo de automatizar la verificación de cumplimiento financiero.

El modelo resuelve un problema concreto en el procesamiento de documentos contables: identificar automáticamente si una factura contiene inconsistencias aritméticas que requieran revisión manual. Con 66,9 millones de parámetros y una ventana de contexto de 512 tokens, es ligero y adecuado para integraciones en pipelines de facturación o auditoría. Su relevancia radica en ofrecer una solución de bajo coste computacional para una tarea de alta frecuencia en entornos empresariales, aunque su precisión moderada (61,5%) limita su uso como herramienta de filtrado inicial más que como verificación definitiva.

El modelo se publica con licencia MIT según su model card, aunque el campo de licencia en Hugging Face figura como "no disponible". Está entrenado únicamente en inglés y su uso principal es la clasificación binaria de textos de facturas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT base, 6 capas, 768 dimensiones ocultas) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP32 o FP16) |
| Idiomas soportados | Inglés |
| Licencia | MIT (según model card; campo de Hugging Face indica "no disponible") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FinDocs-Verify es un ajuste fino del modelo `distilbert-base-uncased`, un transformer encoder destilado que conserva el 97% de las capacidades del BERT original con un 40% menos de parámetros. La arquitectura consta de 6 capas de atención, 12 cabezas de atención y una dimensión oculta de 768. Sobre esta base se añade una cabeza de clasificación binaria (dos salidas) que produce una probabilidad para las clases "factura limpia" (0) y "discrepancia detectada" (1).

El entrenamiento se realizó sobre un dataset propietario de documentos de recepción, con ejemplos etiquetados manualmente. Se emplearon 10 épocas con early stopping (paciencia de 2) sobre la pérdida de validación, siendo la época 8 la de mejor resultado. El batch size fue de 16, la tasa de aprendizaje de 5e-5, y el entrenamiento se ejecutó en una GPU NVIDIA RTX 4060 con 8 GB de VRAM, completándose en aproximadamente 43 segundos. No se aplicaron técnicas de RLHF ni DPO; el ajuste es supervisado estándar con entropía cruzada.

Una innovación destacable es el uso de un modelo destilado para una tarea de verificación financiera, lo que permite inferencia rápida y despliegue en entornos con recursos limitados. Sin embargo, la precisión moderada sugiere que el dataset de entrenamiento es reducido o presenta solapamiento entre clases.

## Capacidades

- Clasificación binaria de textos: detecta si una factura contiene discrepancias entre cantidad × precio unitario y el total.
- Procesamiento de texto en inglés, con truncamiento a 512 tokens.
- Inferencia rápida gracias a la arquitectura DistilBERT (aprox. 2 veces más rápida que BERT base).
- Compatible con la librería `transformers` de Hugging Face y con `text-embeddings-inference` para despliegue como endpoint.
- No soporta tool calling, generación de código, razonamiento multi-paso ni capacidades multimodales.
- No incluye modo de pensamiento (thinking mode) ni funcionalidades de agente.

## Casos de uso

- Verificación automática de facturas en sistemas de cuentas por pagar: el modelo puede integrarse en un pipeline que reciba el texto extraído de facturas (mediante OCR) y marque aquellas con posibles errores aritméticos para revisión manual, reduciendo el tiempo de procesamiento.
- Auditoría financiera interna: los equipos de auditoría pueden utilizar el modelo como primer filtro para identificar facturas sospechosas antes de una revisión detallada, aprovechando su recall del 100% para no dejar pasar ninguna discrepancia.
- Control de calidad en software de facturación: empresas que desarrollan herramientas de gestión documental pueden incorporar el modelo para validar automáticamente la coherencia de los datos extraídos por sus sistemas.
- Cumplimiento normativo (compliance): en sectores regulados, el modelo puede servir como capa de verificación adicional en flujos de aprobación de pagos, señalando facturas que requieran intervención humana.
- Automatización de procesos de conciliación bancaria: aunque el modelo está entrenado para facturas, su arquitectura permite adaptarlo a otros documentos financieros con reentrenamiento, sirviendo como base para detectar inconsistencias en extractos o recibos.
- Integración en asistentes de contabilidad: puede usarse como componente de un chatbot o API que, dado un texto de factura, devuelva una recomendación de revisión manual, como se muestra en el ejemplo de la API del modelo.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre el conjunto de test:

| Modelo | Precision | Recall | F1 |
|--------|-----------|--------|-----|
| DistilBERT (base) | 25,4% | 100% | 40,5% |
| FinDocs-Verify | 61,5% | 100% | 76,2% |

Matriz de confusión en test: TN=37, TP=16, FN=0, FP=10. El recall del 100% indica que todas las discrepancias reales fueron detectadas, aunque la precisión del 61,5% implica que un 38,5% de las predicciones positivas son falsos positivos (facturas limpias marcadas como discrepantes). No se dispone de resultados en benchmarks generales como MMLU, HumanEval o GSM8K, ya que el modelo es específico para una tarea de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (el modelo pesa ~0,3 GB en safetensors). Con cuantización a FP16 o INT8, el consumo se reduce aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, RTX 4060). También funciona en CPU, aunque con mayor latencia.
- Es apto para GPUs de consumo (gama media y baja) y para despliegue en entornos sin GPU.
- Opciones de despliegue: librería `transformers` de Hugging Face, `text-embeddings-inference` (indicado en los tags), `vLLM` (aunque es más adecuado para generación, también soporta clasificación), y `llama.cpp` si se convierte a GGUF (aunque no se proporciona en ese formato).
- Latencia estimada: en una GPU moderna (RTX 3060 o superior), la inferencia para un texto de 512 tokens es del orden de milisegundos (típicamente 5-15 ms). En CPU, puede ser de 50-100 ms.
- Throughput: con batch de 32, se pueden procesar cientos de facturas por segundo en una GPU de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Recall | F1 | Licencia |
|--------|------------|----------|-----------|--------|-----|----------|
| DistilBERT (base) | 66M | 512 | 25,4% | 100% | 40,5% | Apache 2.0 |
| FinDocs-Verify | 66M | 512 | 61,5% | 100% | 76,2% | MIT |
| BERT base (sin fine-tuning) | 110M | 512 | No disponible | No disponible | No disponible | Apache 2.0 |

La comparación directa con DistilBERT base (sin ajuste) muestra una mejora sustancial en precisión y F1, manteniendo el recall perfecto. No se dispone de datos de otros modelos ajustados para la misma tarea específica, por lo que no es posible una comparativa más amplia.

## Limitaciones y advertencias

- Precisión moderada (61,5%): un 38,5% de las facturas marcadas como discrepantes son en realidad limpias, lo que puede generar cargas de revisión innecesarias.
- Dataset de entrenamiento pequeño y propietario: no se especifica el número de ejemplos, y el modelo puede no generalizar bien a formatos de factura distintos de los vistos en el entrenamiento.
- Limitación de contexto: la ventana de 512 tokens obliga a truncar documentos largos, lo que podría perder información relevante en facturas extensas.
- Solo inglés: no es adecuado para facturas en otros idiomas sin reentrenamiento.
- Riesgo de alucinación: aunque es un modelo de clasificación y no genera texto, la salida de probabilidad puede ser sobreconfiada en casos fuera de distribución.
- Licencia: aunque la model card indica MIT, el campo de licencia en Hugging Face aparece como "no disponible"; se recomienda contactar al autor para confirmar los términos antes de uso comercial.
- Sin soporte para tool calling ni integración agéntica: es un modelo de clasificación puro, no apto para tareas que requieran razonamiento complejo o interacción con herramientas.

## Enlaces

- Modelo en Hugging Face: [Sickostro/FinDocs-Verify](https://huggingface.co/Sickostro/FinDocs-Verify)
- Repositorio GitHub: [Sick0stro/FinDocs-Verify](https://github.com/Sick0stro/FinDocs-Verify)
- No se encontraron otros enlaces relevantes en la búsqueda web (los resultados de FinDocsAI y FinDox corresponden a proyectos no relacionados).
