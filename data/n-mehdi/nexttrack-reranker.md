# N-Mehdi/nexttrack-reranker

## Resumen

nexttrack-reranker es un modelo de reranking para sistemas de recomendacion musical, publicado por el autor N-Mehdi bajo licencia Apache-2.0. No se trata de un modelo de lenguaje neuronal, sino de un ensemble de arboles potenciados (LightGBM) exportado a formato ONNX, cuyo cometido es reordenar las candidatas generadas por un sistema de recomendacion de siguiente pista musical (next-track recommendation). El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos no estan efectivamente alojados o que el contenido es minimo.

El modelo se presenta como la version 3 del modelo MLflow `nexttrack-reranker` e incluye, junto con los pesos ONNX, un fichero `settings.json` con las cuotas de candidatos y el orden de las caracteristicas esperadas por el modelo. Fue construido a partir del dataset `yandex/yambda` (Apache-2.0) en su variante de 50 millones de registros, mediante el proyecto next-track-rec del mismo autor.

Su relevancia es acotada y muy especifica: sirve como etapa de reranking en pipelines de recomendacion musical, no como modelo generativo. No hay informacion publicada sobre benchmarks, idiomas, contexto ni capacidades de razonamiento, por lo que su evaluacion debe hacerse en el marco del sistema de recomendacion completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosted decision trees) exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto libre; opera sobre caracteristicas numericas/categoricas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, acompanado de `settings.json` |

## Arquitectura y entrenamiento

La arquitectura es un modelo de arboles potenciados LightGBM, no un transformer. El modelo se exporta a ONNX para inferencia portable y se acompana de un fichero `settings.json` que define las cuotas de candidatos y el orden exacto de las caracteristicas que el modelo espera en la entrada. Esta configuracion es critica: cualquier integracion debe respetar ese orden y esas cuotas para que las predicciones sean validas.

El entrenamiento se realizo sobre el dataset `yandex/yambda` (licencia Apache-2.0), en su variante de 50 millones de registros, mediante el proyecto next-track-rec. La model card no detalla el numero de arboles, la profundidad, la funcion de perdida, el esquema de validacion ni si hubo ajuste de hiperparametros. Tampoco se especifica que caracteristicas concretas se usan (aunque por el dominio se infiere que seran relativas a usuario, pista, historial y candidatas), ni el proceso de generacion de candidatos previo al reranking. No se documenta ninguna innovacion tecnica adicional mas alla del empaquetado ONNX y la version de MLflow (`v3`).

## Capacidades

- Reranking de listas de candidatas en sistemas de recomendacion de siguiente pista musical.
- Inferencia portable mediante ONNX Runtime en entornos Python, C++, Java o servicios web.
- Consumo de caracteristicas tabulares en un orden predefinido por `settings.json`.
- Aplicacion de cuotas de candidatos definidas en la configuracion del modelo.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de NLP.

## Casos de uso

- Reranking en un servicio de streaming musical: tras generar un conjunto de candidatas con un modelo de recuperacion (embedding o collaborative filtering), el reranker reordena esas candidatas segun la probabilidad de ser la siguiente pista. Es adecuado por su bajo coste de inferencia en ONNX y su naturaleza tabular.
- Integracion en un pipeline de recomendacion por etapas: el modelo actua como segunda fase (retrieval + ranking) dentro de un sistema mayor, aplicando las cuotas de candidatos configuradas en `settings.json` para diversificar o limitar la lista final.
- Despliegue en entornos con recursos limitados: al ser un ensemble de arboles exportado a ONNX, la inferencia es ligera en CPU y no requiere GPU, lo que permite servirlo junto al resto del stack de recomendacion.
- Experimentacion con el dataset Yambda: investigadores que trabajen con `yandex/yambda` pueden usar este reranker como baseline reproducible para comparar estrategias de ranking sobre el mismo esquema de caracteristicas.
- Prototipado rapido de sistemas de next-track recommendation: el proyecto next-track-rec y este modelo permiten montar un pipeline completo de recuperacion y reranking con licencia permisiva.
- Evaluacion offline de politicas de recomendacion: el modelo puede usarse para puntuar candidatas en simulaciones y comparar metricas de ranking (NDCG, MRR) frente a heuristicas.
- Servicio de API de recomendacion: exportado a ONNX, puede cargarse en un microservicio que reciba caracteristicas y devuelva puntuaciones, facilitando el despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo de arboles en ONNX, la inferencia se ejecuta tipicamente en CPU.
- GPU recomendadas: no aplica; no se documenta soporte GPU ni necesidad de ella.
- Compatibilidad con GPU de consumo: no relevante para este tipo de modelo.
- Opciones de despliegue: ONNX Runtime (Python, C++, Java, C#), integracion en servicios web y pipelines de MLflow.
- Latencia y throughput estimados: no disponibles; dependen del numero de arboles, del numero de candidatas y del hardware, datos no publicados.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de reranking musical ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos, pero al entrenarse sobre `yandex/yambda` puede heredar sesgos de popularidad y de comportamiento de los usuarios del dataset.
- Riesgo de sobreajuste al esquema de caracteristicas y al orden definido en `settings.json`; cualquier cambio en el pipeline de caracteristicas invalida el modelo.
- El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar disponibles o que el contenido es minimo; conviene verificar la integridad antes de usarlo en produccion.
- No hay informacion sobre idiomas porque el modelo no procesa texto libre; no debe evaluarse como modelo de lenguaje.
- No se documentan metricas de calidad (NDCG, MRR, recall) ni validacion offline, por lo que su rendimiento real es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero el dataset de origen (`yandex/yambda`) tambien es Apache-2.0 y debe respetarse su atribucion.
- No se especifica la version de ONNX ni la de LightGBM usadas en la exportacion; posibles incompatibilidades con versiones futuras de ONNX Runtime.
- Ausencia de soporte documentado, tests o issues en el repositorio de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/N-Mehdi/nexttrack-reranker
- Proyecto next-track-rec: https://github.com/N-Mehdi/next-track-rec
- Dataset Yambda: https://huggingface.co/datasets/yandex/yambda
