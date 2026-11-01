# savocheek/ru-reviews-rubert

## Resumen

ru-reviews-rubert es un modelo de clasificación de texto en ruso especializado en reseñas de establecimientos (hostelería, comercios y servicios), desarrollado por el usuario savocheek. Se obtiene por destilación de un modelo profesor multi-tarea basado en ruRoberta-large y se apoya en el encoder ai-forever/ruBert-base, con 178.309.635 parámetros totales (aproximadamente 178 M). Resuelve un problema concreto: analizar una reseña en ruso y devolver simultáneamente tres señales —polaridad (negativo/neutro/positivo), nota exacta de 1 a 5 estrellas y categoría del lugar (top-15 de rúbricas más "otro")— con un único modelo y un coste de inferencia muy contenido.

Su relevancia actual reside en la eficiencia: según la model card, la versión ONNX int8 procesa una reseña en CPU en 7,4 ms con un tamaño de 171 MB, frente a 29 ms y 341 MB del profesor large, manteniendo métricas prácticamente idénticas (macro-F1 de 0,823 frente a 0,820 en polaridad). Además, el modelo está pensado para producción en entornos sin GPU, lo que lo hace atractivo para pipelines de analítica de opiniones a escala.

La arquitectura es un transformer encoder tipo BERT (no generativo), con licencia MIT y soporte únicamente del idioma ruso. No dispone de ventana de contexto generativa ni de capacidad de tool calling: es un clasificador discriminativo de secuencia, no un modelo de lenguaje conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (ruBert-base), multi-cabeza de clasificación |
| Parámetros totales | 178.309.635 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; limitación típica de ruBert-base) |
| Tipos de cuantización | ONNX int8 (incluido en el repo); safetensors en precisión original |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (model.int8.onnx), heads.pt |

## Arquitectura y entrenamiento

El modelo parte de ai-forever/ruBert-base, un encoder transformer de tipo BERT preentrenado en ruso, sobre el que se añaden tres cabezas de clasificación: polaridad (3 clases), nota de 1 a 5 estrellas (regresión ordinal o clasificación, según la implementación del repositorio GitHub) y categoría del lugar (top-15 rúbricas más clase "otro"). El entrenamiento se realiza por destilación desde un profesor multi-tarea basado en ruRoberta-large, usando reseñas de Yandex Maps del dataset d0rj/geo-reviews-dataset-2023.

La model card documenta un proceso de calibración de la confianza: la temperatura de calibración es T ≈ 2,0 y reduce el ECE de 0,1186 a 0,0286 (fichero reports/calibration.json). También se reporta robustez ante ruido: con un 10 % de erratas la precisión se mantiene en 0,782 frente a 0,770 del profesor. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un clasificador de este tipo).

## Capacidades

- Clasificación de polaridad en tres clases: negativo, neutro y positivo.
- Predicción de la nota exacta de 1 a 5 estrellas (MAE de 0,356 estrellas y 89,7 % de predicciones con error ≤ 1 estrella en el test retenido).
- Clasificación de categoría del establecimiento: top-15 rúbricas más "otro", con accuracy de 0,752 y top-3 de 0,954.
- Procesamiento multi-tarea en una sola pasada: las tres cabezas se ejecutan sobre la misma representación del encoder.
- Inferencia en CPU mediante ONNX int8 (7,4 ms por reseña, 171 MB).
- Integración con la librería transformers mediante `pipeline("text-classification")` y compatibilidad con text-embeddings-inference y endpoints compatibles.
- Robustez moderada ante erratas (precisión de 0,782 con un 10 % de errores tipográficos).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito: es un clasificador, no un modelo generativo.

## Casos de uso

- Analítica de opiniones a escala: procesar grandes volúmenes de reseñas de Yandex Maps u otras plataformas en ruso para agregar polaridad, nota estimada y categoría del establecimiento, con 7,4 ms por reseña en CPU y sin necesidad de GPU.
- Monitorización de reputación en tiempo casi real: ingerir reseñas nuevas de comercios y generar alertas cuando la polaridad negativa o la nota predicha caiga por debajo de un umbral, gracias al bajo coste por inferencia.
- Enrutamiento automático de quejas: usar la categoría predicha y la polaridad para dirigir la reseña al equipo o departamento correspondiente (por ejemplo, restauración frente a servicios), con un top-3 de categoría del 95,4 %.
- Enriquecimiento de bases de datos y dashboards: poblar tablas analíticas con las tres etiquetas por reseña para cuadros de mando de calidad percibida por rúbrica y por zona geográfica.
- Filtrado previo en pipelines de moderación: descartar o priorizar reseñas potencialmente problemáticas antes de una revisión humana, usando la nota de 1 a 5 estrellas como señal ordinal.
- Detección de reseñas anómalas o inconsistentes: comparar la nota declarada por el usuario con la nota predicha por el modelo para marcar discrepancias que merezcan revisión manual.
- Despliegue en dispositivos sin GPU: al ejecutarse con ONNX int8 en 171 MB, puede integrarse en contenedores ligeros, funciones serverless o entornos de borde para clasificar reseñas localmente.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de test retenido:

| Métrica (test retenido) | Esta modelo | Profesor (large) |
|---|---|---|
| Polaridad, macro-F1 | 0,823 | 0,820 |
| Reseñas difíciles (hard-test) | 0,832 | 0,835 |
| Nota 1–5★: MAE | 0,356★ | 0,353★ |
| Nota 1–5★: error ≤ 1★ | 89,7 % | 90,6 % |
| Categoría: accuracy | 0,752 | 0,753 |
| Categoría: top-3 | 95,4 % | 95,2 % |
| Precisión con 10 % de erratas | 0,782 | 0,770 |
| CPU, ONNX int8: ms por reseña | 7,4 | 29 |
| CPU, ONNX int8: tamaño | 171 MB | 341 MB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a un clasificador de texto en ruso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 178 M de parámetros, la inferencia en FP32 requeriría aproximadamente 0,7 GB de memoria y en FP16 alrededor de 0,35 GB, aunque estos cálculos no están confirmados en la model card.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de memoria libre es suficiente por tamaño; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (178 M de parámetros); no se detallan modelos concretos.
- Opciones de despliegue: transformers (`pipeline`), ONNX Runtime con el fichero `onnx/model.int8.onnx`, text-embeddings-inference y endpoints compatibles. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 7,4 ms por reseña en CPU con ONNX int8 (frente a 29 ms del profesor); no se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| savocheek/ru-reviews-rubert | 178.309.635 | no disponible | Clasificación multi-tarea de reseñas en ruso | MIT | HuggingFace, ONNX int8 |
| Profesor multi-tarea ruRoberta-large (referenciado en la model card) | no disponible | no disponible | Clasificación multi-tarea de reseñas en ruso | no disponible | no disponible (no se indica identificador) |
| ai-forever/ruBert-base (modelo base) | no disponible | no disponible | Representaciones y clasificación en ruso | no disponible | HuggingFace |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, salvo los del profesor que aparecen en la tabla de benchmarks. No se han identificado otras alternativas comparables en la información disponible.

## Limitaciones y advertencias

- La clase "neutro" se define a partir de las reseñas de 3 estrellas, lo que puede introducir ambigüedad respecto a reseñas neutrales que no sean de 3★.
- Fuera del dominio (por ejemplo, críticas de películas) el macro-F1 cae a 0,62, por lo que no se recomienda su uso en dominios distintos al de reseñas de establecimientos.
- El sarcasmo sin marcadores explícitos es un punto débil reconocido por el autor.
- La confianza del modelo está sobreestimada: es necesario aplicar la temperatura de calibración (T ≈ 2,0) para obtener probabilidades fiables.
- Solo soporta ruso; no hay capacidades multilingües.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos o muy cortos.
- Licencia MIT: permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento (reseñas de Yandex Maps) en la información disponible.
- No se especifica la longitud máxima de contexto; textos muy largos pueden truncarse según la configuración de ruBert-base.
- Solo 20 descargas y 0 likes en el momento de la consulta: ecosistema reducido y poca validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/savocheek/ru-reviews-rubert
- Demo (Space): https://huggingface.co/spaces/savocheek/ru-reviews-demo
- Código y detalles de entrenamiento (GitHub): https://github.com/savocheek/sentiment-analysis-ru
- Modelo base: https://huggingface.co/ai-forever/ruBert-base
- Dataset: https://huggingface.co/datasets/d0rj/geo-reviews-dataset-2023
