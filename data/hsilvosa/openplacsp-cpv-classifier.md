# hsilvosa/openplacsp-cpv-classifier

## Resumen

El modelo `hsilvosa/openplacsp-cpv-classifier` es un clasificador multilabel de divisiones CPV (Common Procurement Vocabulary) para la contratación pública española. Desarrollado por hsilvosa, su objetivo es sugerir automáticamente las divisiones CPV correspondientes a partir del título, nombre del proyecto y resumen de un aviso de licitación. Está diseñado como una herramienta ligera y eficiente para entornos donde no se dispone de grandes recursos computacionales.

A diferencia de los modelos modernos basados en transformers, este clasificador combina características TF-IDF a nivel de palabra y de carácter con 45 clasificadores logísticos lineales, uno por cada división CPV. La versión 2 incorpora calibración de probabilidades y umbrales de decisión específicos por división, lo que mejora significativamente las métricas de precisión y cobertura. El modelo está entrenado con más de 606,000 avisos publicados en la plataforma nacional de contratación hasta diciembre de 2022, con datos de 2023 para calibración y 2024 como conjunto de prueba.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (word y char) + regresión logística lineal (45 clasificadores) |
| Parametros totales | no disponible (modelo clásico, no red neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de texto, no generativo) |
| Tipos de cuantizacion | no aplica (modelo sklearn, no requiere cuantización) |
| Idiomas soportados | Español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | joblib (model.joblib) |

## Arquitectura y entrenamiento

El modelo emplea un pipeline clásico de aprendizaje automático: extrae características TF-IDF tanto a nivel de palabra como de carácter (n-gramas), y las combina para alimentar 45 clasificadores logísticos lineales independientes, uno por cada división CPV. Cada clasificador produce una probabilidad de pertenencia a su división, y la versión 2 aplica calibración de probabilidades (probablemente mediante isotónica o Platt scaling) y selecciona un umbral de decisión óptimo por división para maximizar el rendimiento.

El entrenamiento se realizó sobre 606,309 avisos de contratación publicados en la plataforma nacional española hasta diciembre de 2022, con una semilla fija (20260817). Los datos de 2023 se reservaron para calibración y selección de umbrales, mientras que 2024 se mantuvo como conjunto de prueba temporal. El modelo no utiliza técnicas de RLHF ni DPO; es un enfoque supervisado clásico con etiquetas multilabel.

## Capacidades

- Clasificación multilabel de divisiones CPV (45 categorías) a partir de texto en español.
- Sugerencia de códigos CPV para avisos de contratación pública, basada en título, nombre de proyecto y resumen.
- Generación de probabilidades calibradas para cada división, lo que permite ordenar las predicciones por confianza.
- Soporte para clasificación con cobertura no vacía (el modelo puede predecir ninguna división si ninguna supera el umbral, aunque la cobertura es del 88.97% en el test de 2024).
- No incluye generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Automatización de la clasificación CPV en plataformas de contratación: el modelo puede preasignar divisiones CPV a nuevos avisos, reduciendo el trabajo manual de los gestores.
- Enriquecimiento de bases de datos de licitaciones: permite etiquetar históricos de avisos sin códigos CPV o con códigos erróneos, mejorando la calidad de los datos para análisis posteriores.
- Filtrado y alertas personalizadas: empresas que monitorizan oportunidades de negocio pueden usar las predicciones para recibir alertas solo de licitaciones en sus divisiones de interés.
- Análisis de mercado y tendencias: los códigos CPV predichos facilitan la agregación estadística de la actividad contractual por sectores.
- Asistencia a redacción de pliegos: durante la preparación de una licitación, el modelo puede sugerir divisiones CPV preliminares a partir del borrador del anuncio.
- Integración en pipelines de datos: al ser un modelo ligero y en formato joblib, puede ejecutarse en entornos de procesamiento por lotes o en funciones serverless sin necesidad de GPU.

## Benchmarks y rendimiento

El autor proporciona métricas de evaluación temporal sobre el conjunto de test de 2024, comparando el modelo base y la versión 2:

| Métrica (test 2024) | Modelo base | Versión 2 |
|---|---|---|
| Recall@3 | 0.9140 | 0.9214 |
| Micro-F1 | 0.5808 | 0.7276 |
| Macro-F1 | 0.4803 | 0.6180 |
| Brier score (menor es mejor) | 0.0277 | 0.0105 |
| Cobertura multilabel no vacía | 0.9933 | 0.8897 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es ligero (0.3 GB en disco) y no requiere GPU. Un solo núcleo de CPU es suficiente para clasificar avisos en milisegundos.
- Memoria RAM: se estima que el modelo ocupa menos de 1 GB en memoria durante la inferencia, dependiendo del tamaño del vectorizador TF-IDF.
- GPU recomendada: ninguna; el modelo no está diseñado para aceleración por GPU.
- Compatible con cualquier equipo que ejecute Python y scikit-learn, incluyendo instancias cloud de bajo coste y ordenadores portátiles.
- Opciones de despliegue: al ser un artefacto joblib, puede integrarse en servicios REST con frameworks como FastAPI o Flask, o en pipelines de procesamiento por lotes con Apache Airflow o Prefect. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no se proporcionan mediciones oficiales, pero por la naturaleza del modelo (regresión logística sobre TF-IDF), se espera una latencia inferior a 10 ms por muestra en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación CPV multilabel para contratación pública española) en los datos proporcionados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se entrena exclusivamente con texto administrativo español publicado en la plataforma nacional de contratación; puede tener un rendimiento inferior con textos de otras fuentes o con lenguaje no administrativo.
- No sustituye la clasificación CPV legalmente asignada; las predicciones son sugerencias y deben ser revisadas por personal cualificado.
- Las divisiones CPV con pocos ejemplos en el entrenamiento presentan mayor incertidumbre y menor precisión.
- El modelo no debe utilizarse para inferir fraude, ilegalidad o responsabilidad en ningún proceso de contratación.
- La cobertura multilabel no vacía es del 88.97% en el test de 2024, lo que significa que en aproximadamente el 11% de los casos el modelo no predice ninguna división, lo que puede requerir un manejo específico en producción.
- La exportación a formato skops no está disponible (según se indica en `safe_export_error`), por lo que la integración con herramientas que requieran ese formato puede fallar.

## Enlaces

- Modelo en Hugging Face: [hsilvosa/openplacsp-cpv-classifier](https://huggingface.co/hsilvosa/openplacsp-cpv-classifier)
- Dataset de entrenamiento: [hsilvosa/openplacsp](https://huggingface.co/datasets/hsilvosa/openplacsp)
- Perfil de GitHub del autor: [hsilvosa](https://github.com/hsilvosa)
