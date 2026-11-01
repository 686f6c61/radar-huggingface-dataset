# aitrainingdatabroker/sales-call-outcome-classifier

## Resumen

Sales Call Outcome Classifier es un modelo de clasificación de texto desarrollado por AI Training Data Broker, un bróker y asesor técnico especializado en la venta y licencia de datos para laboratorios de IA. El modelo lee una nota libre escrita tras una llamada comercial y predice en qué estado se encuentra la oportunidad: `advanced`, `stalled`, `lost` o `won`. Resuelve un problema concreto de higiene de CRM: las notas son texto libre y el campo de fase del embudo a menudo queda vacío o desactualizado, por lo que una primera clasificación automática ayuda a ordenar el pipeline comercial.

Técnicamente es un ajuste fino de `distilroberta-base`, un transformer encoder de 82.121.476 parámetros, entrenado durante 6 épocas en una única RTX 3070 sobre un conjunto sintético de 239 filas. El modelo es monolingüe (inglés), tiene licencia Apache 2.0 y se distribuye en formato safetensors a través de la librería transformers. Su relevancia es acotada: es una herramienta pequeña, barata de inferir y fácil de desplegar, pensada como utilidad operativa más que como modelo de propósito general.

Conviene subrayar desde el principio que todos los datos de entrenamiento son inventados y generados a partir de plantillas. El propio autor advierte que las puntuaciones perfectas en su conjunto de test no son extrapolables a texto real, lo que sitúa al modelo en la categoría de prueba de concepto o utilidad interna a validar antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, `distilroberta-base`) |
| Parametros totales | 82.121.476 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base distilroberta-base admite 512 tokens; el autor no lo especifica) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, ONNX ni cuantizaciones publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de `distilroberta-base`, una versión destilada de RoBERTa que conserva la arquitectura transformer encoder con atención bidireccional y reduce el número de capas respecto al modelo original. Sobre esa base se añade una cabeza de clasificación de secuencia con cuatro etiquetas de salida (`advanced`, `lost`, `stalled`, `won`). No hay innovaciones arquitectónicas propias: es un ajuste fino estándar de clasificación de texto.

El entrenamiento se realizó durante 6 épocas en una sola GPU RTX 3070, con 239 filas procedentes del dataset `aitrainingdatabroker/synthetic-sales-call-notes-by-outcome`. Todos los datos son sintéticos y generados a partir de plantillas; el conjunto de test (80 filas) se construyó con plantillas que el modelo no vio durante el entrenamiento. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de este tamaño. Los scripts de generación de datos y entrenamiento están incluidos en la carpeta `source/` del repositorio, y las métricas completas en `scores.json`.

## Capacidades

- Clasificación de texto en cuatro clases de resultado comercial a partir de notas de llamada en inglés.
- Predicción con probabilidades por clase (el ejemplo de la model card usa `top_k=3`).
- Procesamiento de notas cortas y de estilo directo, similar al de las plantillas de entrenamiento.
- Integración directa con la pipeline `text-classification` de transformers.
- Compatibilidad declarada con Text Embeddings Inference y endpoints de HuggingFace.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No es multilingüe: solo inglés.

## Casos de uso

- Clasificación automática de notas de CRM: ingerir el campo de notas libres de cada oportunidad y asignar una etiqueta de estado para detectar registros sin fase actualizada, con revisión humana posterior.
- Priorización de pipeline comercial: marcar oportunidades `stalled` para que el equipo de ventas las revise antes que las `advanced`, usando la probabilidad de cada clase como señal de confianza.
- Enriquecimiento de exportaciones de CRM: procesar por lotes notas históricas y añadir una columna de predicción que facilite análisis agregados de conversión.
- Señal auxiliar en herramientas de gestión de oportunidades: sugerir un estado al comercial cuando este escribe la nota, siempre como recomendación editable y no como decisión automática.
- Detección de oportunidades perdidas sin registrar: localizar notas con lenguaje de cierre negativo que no se hayan marcado como `lost` en el sistema.
- Prototipado y evaluación de pipelines: servir como componente ligero y barato (82 M de parámetros, 0,3 GB) para probar arquitecturas de automatización de CRM antes de invertir en modelos mayores o en datos etiquetados propios.
- Filtrado previo en análisis de calidad de datos: separar notas cortas y claras de notas largas y ambiguas que requieran revisión manual.

## Benchmarks y rendimiento

Resultados publicados por el autor en `scores.json`, sobre 80 filas sintéticas reservadas para test:

| Metrica | Valor |
|---|---|
| Accuracy | 1,0 |
| Macro F1 | 1,0 |
| F1 `advanced` | 1,0 (20 ejemplos) |
| F1 `lost` | 1,0 (20 ejemplos) |
| F1 `stalled` | 1,0 (20 ejemplos) |
| F1 `won` | 1,0 (20 ejemplos) |

No se han publicado comparaciones con otros modelos ni resultados sobre texto real. El propio autor advierte que estas cifras reflejan un conjunto de test generado con plantillas nuevas pero del mismo estilo plano que el de entrenamiento, por lo que no son indicativas del rendimiento en notas reales de CRM.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,35 GB solo para pesos, más activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16 la huella de pesos baja a aproximadamente 0,17 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor entrenó en una RTX 3070. Para despliegue por lotes a gran escala son adecuadas A100, H100 o L4, aunque el modelo está sobredimensionado para ellas en términos de coste.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y prácticamente cualquier tarjeta con más de 2 GB de VRAM; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline de transformers, Text Embeddings Inference (declarado compatible), endpoints de HuggingFace. No se documentan artefactos GGUF para llama.cpp ni Ollama, ni configuración específica para vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sales-call-outcome-classifier | 82,1 M | no disponible (base: 512) | Clasificación de 4 clases sobre notas de ventas | Apache 2.0 | HuggingFace |
| distilroberta-base (base sin ajustar) | 82,1 M | 512 | Modelo de representación; requiere cabeza y ajuste propios | Apache 2.0 | HuggingFace |
| RoBERTa-base | ~125 M | 512 | Modelo de representación; requiere ajuste para clasificación | MIT | HuggingFace |
| DistilBERT-base | ~66 M | 512 | Modelo de representación; requiere ajuste para clasificación | Apache 2.0 | HuggingFace |

No se dispone de comparaciones publicadas con otros clasificadores específicos de notas de CRM, por lo que la comparativa se limita a los modelos base de la misma familia. La ventaja diferencial de este modelo es que ya está ajustado para la tarea concreta; su desventaja es que solo se ha validado sobre datos sintéticos.

## Limitaciones y advertencias

- Entrenado exclusivamente con texto sintético generado por plantillas; el rendimiento sobre notas reales de CRM es desconocido y probablemente muy inferior al 1,0 reportado.
- El conjunto de test emplea plantillas nuevas pero del mismo estilo plano de generación, por lo que la evaluación tiene fuga de distribución implícita.
- Solo admite notas cortas; notas largas o ambiguas pueden encajar legítimamente en dos resultados distintos.
- Monolingüe: no procesa notas en castellano ni en otros idiomas.
- Riesgo de alucinación de etiqueta: al ser un clasificador, siempre asigna una de las cuatro clases con cierta probabilidad, incluso ante entradas sin relación con ventas.
- Sesgos conocidos: no documentados por el autor; al proceder de plantillas sintéticas, puede reflejar los sesgos de redacción de dichas plantillas.
- No es asesoramiento legal ni certificación; el autor exige revisión humana antes de compartir o decidir algo basado en su salida.
- Licencia Apache 2.0 permite uso comercial, pero el autor solicita atribución a AI Training Data Broker y enlace a su web al compartir o construir sobre el modelo.
- No debe usarse como único criterio para decisiones comerciales o de cumplimiento sin validación previa sobre una muestra etiquetada propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aitrainingdatabroker/sales-call-outcome-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/aitrainingdatabroker/synthetic-sales-call-notes-by-outcome
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Guía sobre licencia de grabaciones de llamadas: https://aitrainingdatabroker.com/data/call-recordings/
- Guía sobre licencia de historial de CRM: https://aitrainingdatabroker.com/data/crm-history/
- Guía sobre licencia de datos de call centers: https://aitrainingdatabroker.com/sell/call-centers-and-bpos/
- Sitio del autor: https://aitrainingdatabroker.com/
