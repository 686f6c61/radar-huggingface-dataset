# Cosmicosrl/Timestral-123M-ONNX

## Resumen

Timestral-123M-ONNX es la exportación a ONNX del modelo base mistralai/Timestral-123M, publicada por Cosmicosrl. Se trata de un modelo de predicción de series temporales de 123 millones de parámetros, cuantizado a int8 (dinámico, por canal) para ejecutarse con ONNX Runtime sobre CPU. El repositorio contiene un único grafo que cubre horizontes de predicción de hasta 32 pasos sin covariables.

La relevancia de esta ficha radica en que ofrece una vía de despliegue ligera y sin GPU de un modelo de forecasting desarrollado por Mistral AI, con un tamaño de fichero de aproximadamente 149 MB. El grafo incorpora internamente la normalización, el promediado espejo (mirror averaging), el recorte a valores no negativos y el tope de cuantiles, lo que simplifica la integración en pipelines de producción.

No se dispone de información sobre idiomas soportados ni sobre resultados de benchmarks. La licencia es la Modified MIT de Mistral AI, que incluye una condición de ingresos que debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Timestral de Mistral AI); exportado a ONNX |
| Parametros totales | 123M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica por canal (embedding y cabeza de salida en fp32) |
| Idiomas soportados | no disponible (modelo de series temporales, no de texto) |
| Licencia | Modified MIT (Mistral AI), con condicion de ingresos |
| Formato de pesos | ONNX (`timestral-123m-int8.onnx`, 149.151.243 bytes) |

## Arquitectura y entrenamiento

El modelo base es mistralai/Timestral-123M, un transformer de 123 millones de parámetros orientado a predicción de series temporales. La exportación de Cosmicosrl genera un único grafo ONNX que integra el preprocesado y el postprocesado: normalización, promediado espejo, recorte a valores no negativos y tope de cuantiles. El grafo admite horizontes de predicción de hasta 32 pasos y no acepta covariables.

La cuantización es int8 dinámica por canal, manteniendo los embeddings y la cabeza de salida en fp32 para preservar precisión. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla ninguna innovación técnica adicional más allá del empaquetado del pipeline completo en el grafo ONNX.

## Capacidades

- Predicción de series temporales con horizontes de hasta 32 pasos.
- Funcionamiento sin covariables: el modelo no incorpora variables exógenas en la entrada.
- Normalización y postprocesado integrados en el grafo (mirror averaging, recorte no negativo, tope de cuantiles).
- Inferencia sobre CPU mediante ONNX Runtime, sin necesidad de GPU.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling ni agentes.
- No se documentan capacidades multilingües.

## Casos de uso

- Previsión de demanda en retail: el modelo puede generar predicciones de hasta 32 pasos para series de ventas diarias o semanales, ejecutándose en CPU dentro de un servicio de planificación.
- Planificación de capacidad en infraestructura: predicción de métricas como uso de CPU o tráfico de red a corto plazo, aprovechando la inferencia ligera en el propio servidor sin GPU.
- Previsión financiera de series univariantes: estimación de indicadores como precios o volúmenes a horizontes cortos, con el postprocesado de cuantiles ya incluido en el grafo.
- Monitorización industrial: predicción de lecturas de sensores para detección temprana de anomalías, desplegando el modelo ONNX en dispositivos con recursos limitados.
- Gestión energética: previsión de consumo eléctrico a corto plazo en entornos domésticos o de pequeña planta, con despliegue en CPU.
- Integración en pipelines de datos: al ser un único grafo ONNX con normalización y postprocesado internos, se puede encadenar directamente con etapas de ETL o con servicios de ONNX Runtime sin código adicional de preprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el fichero ONNX ocupa aproximadamente 149 MB.
- GPU recomendadas: no disponibles; el modelo está pensado para ONNX Runtime en CPU.
- Cabe en GPU consumer: sí, por tamaño, aunque no es el objetivo declarado del export.
- Opciones de despliegue: ONNX Runtime (CPU). No se documentan otros runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de forecasting con exportación ONNX ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No admite covariables: solo modela la serie objetivo, lo que limita escenarios con variables exógenas relevantes.
- Horizonte máximo de 32 pasos; no se documenta comportamiento más allá de ese límite.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas.
- La licencia Modified MIT de Mistral AI incluye una condición de ingresos que debe verificarse en el fichero `LICENSE` antes de uso comercial.
- Es un modelo derivado de pesos de Mistral AI; se requiere mantener la atribución ("2026 - Mistral AI").
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en producción.
- No se documentan garantías de precisión ni validación externa del export ONNX.

## Enlaces

- Hugging Face: https://huggingface.co/Cosmicosrl/Timestral-123M-ONNX
- Modelo base: https://huggingface.co/mistralai/Timestral-123M
