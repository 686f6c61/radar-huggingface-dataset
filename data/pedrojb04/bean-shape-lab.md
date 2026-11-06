# pedrojb04/bean-shape-lab

## Resumen

Bean Shape Lab es un modelo de clasificación tabular entrenado desde cero por pedrojb04 para predecir la variedad de judía seca (siete clases) a partir de mediciones morfológicas. No es un modelo de lenguaje ni una red neuronal profunda: se trata de una regresión logística multinomial implementada con scikit-learn, con estandarización ajustada únicamente sobre el conjunto de entrenamiento y serializada en un artefacto JSON que contiene coeficientes, interceptos, estadísticas del escalador y el orden de clases y características.

El modelo se apoya en el conjunto de datos Dry Bean de Koklu y Özkan (2020), publicado en el repositorio UCI Machine Learning Repository bajo licencia CC BY 4.0. El autor reporta una accuracy de validación de 0,9243 y una accuracy de test retenido de 0,9210 con un macro F1 de 0,9346, frente a una línea base de mayoría del 0,2607. El propio autor advierte de que existen vectores de características idénticos entre los conjuntos de entrenamiento y de test (19 vectores distintos), lo que puede inflar la métrica reportada.

Es relevante ahora como ejemplo didáctico de buenas prácticas de reproducibilidad en machine learning tabular: separación de escalado solo con datos de entrenamiento, artefacto JSON en lugar de pickle, manifiesto de entrenamiento con checksums y procedencia, y limitaciones declaradas explícitamente. No está pensado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística multinomial (scikit-learn) |
| Parámetros totales | no disponible (coeficientes e interceptos en artefacto JSON) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT (modelo y código); dataset original CC BY 4.0 |
| Formato de pesos | artefacto JSON con coeficientes, interceptos, estadísticas del escalador, orden de clases y de características |

## Arquitectura y entrenamiento

El modelo es una regresión logística multinomial de siete clases entrenada desde cero sobre mediciones morfológicas del conjunto Dry Bean. La estandarización de características se ajusta exclusivamente con el conjunto de entrenamiento, lo que evita fuga de información en el preprocesamiento. El artefacto resultante es un JSON, no un pickle, con coeficientes, interceptos, estadísticas del escalador y los órdenes de clases y características, lo que facilita su inspección y reduce riesgos de deserialización.

El entrenamiento emplea una partición estratificada aleatoria 60/20/20 con semilla 42, con 8.166 filas de entrenamiento, 2.722 de validación y 2.723 de test. Se fija C=1 sin ajuste de hiperparámetros. El autor documenta procedencia del entrenamiento, checksum del dataset, checksum del modelo, split y commit de entrenamiento en `training-manifest.json`. La ejecución local es solo en CPU y no se usan datos personales.

## Capacidades

- Clasificación tabular multiclase (siete clases de judía seca) a partir de mediciones morfológicas.
- Estandarización de características integrada en el artefacto, con estadísticas derivadas solo del entrenamiento.
- Serialización en JSON inspeccionable, sin dependencia de pickle.
- Reproducibilidad documentada mediante manifiesto de entrenamiento con checksums y procedencia.
- Inferencia en CPU sin requisitos de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Docencia de machine learning tabular: sirve como ejemplo completo de pipeline con escalado sin fuga de datos, partición estratificada y artefacto JSON inspeccionable.
- Reproducción de experimentos: el manifiesto de entrenamiento con checksums y commit permite replicar el entrenamiento y verificar la integridad del dataset y del modelo.
- Comparación de líneas base: la accuracy de mayoría (0,2607) y la accuracy de test (0,9210) ofrecen una referencia para evaluar modelos más complejos sobre el mismo conjunto Dry Bean.
- Auditoría de fuga de datos: el caso de los 19 vectores de características idénticos entre train y test sirve para ilustrar cómo una partición aleatoria puede inflar métricas en datasets con duplicados.
- Prototipado de clasificación morfológica: como punto de partida para experimentar con clasificación de variedades de semilla antes de invertir en visión por computador o modelos más pesados.
- Integración ligera en scripts de análisis: al ser un artefacto JSON con inferencia en CPU, puede cargarse en entornos sin GPU para pruebas de concepto y validación de formatos de datos.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Accuracy de validación | 0,9243 |
| Accuracy de test retenido | 0,9210 |
| Macro F1 en test | 0,9346 |
| Línea base de mayoría (accuracy) | 0,2607 |
| Partición | Estratificada 60/20/20, semilla 42 (8.166 / 2.722 / 2.723 filas) |
| Hiperparámetros | C=1, sin ajuste |

La matriz de confusión de test y los resultados por clase están en `metrics.json`. El autor advierte de que 19 vectores de características distintos aparecen tanto en train como en test, lo que puede inflar la puntuación reportada.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no requiere GPU.
- No aplica VRAM: el artefacto es un JSON con coeficientes e interceptos de una regresión logística multinomial.
- No cabe plantear despliegue en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- El despliegue se realiza cargando el JSON con el repositorio de inferencia acompañante en un entorno Python con scikit-learn.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de clasificación tabular sobre el conjunto Dry Bean con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El autor declara explícitamente que es una demo educativa de investigación, no un clasificador de semillas para producción.
- La partición aleatoria no equivale a una evaluación retenida por granja, lote, cámara o tiempo; otros métodos y condiciones de medición pueden rendir peor.
- Existen 19 vectores de características idénticos entre train y test, lo que puede inflar la accuracy reportada.
- No se proporciona calibración; las probabilidades no están garantizadas como calibradas.
- No incluye detector de fuera de distribución ni pipeline de imágenes.
- No se ofrecen garantías operativas.
- Licencia del modelo y del código: MIT; el dataset original es CC BY 4.0 y exige atribución a los autores y cita del artículo y del dataset. La licencia MIT no altera la del dataset.
- Los datos originales no se redistribuyen en el repositorio.
- No procesa texto ni imágenes; solo características tabulares numéricas en el formato esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pedrojb04/bean-shape-lab
- Dataset Dry Bean (UCI): https://archive.ics.uci.edu/dataset/602/dry+bean+dataset
- DOI del dataset: https://doi.org/10.24432/C50S4B
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
