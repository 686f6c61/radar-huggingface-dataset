# pyaging/pasta

## Resumen

El modelo `pyaging/pasta` es un reloj de envejecimiento transcriptómico desarrollado por el equipo de pyaging, una librería especializada en relojes biológicos. Concretamente, se trata de un clasificador de cambio de edad ("age-shift classifier") aplicado sobre expresión génica transformada por rango dentro de cada muestra. El modelo convierte una puntuación log-odds de regresión logística ridge (que compara muestras de individuos mayores frente a menores) en una puntuación de edad transcriptómica.

Este modelo está diseñado para predecir la edad biológica a partir de datos de transcriptómica (por ejemplo, RNA-seq) en humanos, con capacidad multi-tejido. Su relevancia radica en que permite cuantificar el envejecimiento a nivel molecular, lo que tiene aplicaciones en investigación biomédica, estudios de longevidad y evaluación de intervenciones (farmacológicas, genéticas, de estilo de vida) que puedan acelerar o revertir el envejecimiento. Fue publicado en 2025 en un preprint de bioRxiv (Salignon et al.).

Al tratarse de un modelo de regresión logística ridge, su arquitectura es sencilla y no requiere recursos computacionales elevados. La información disponible en la model card es limitada; no se especifican detalles sobre el número de parámetros, el contexto de entrenamiento ni los datos utilizados más allá de su naturaleza transcriptómica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística ridge |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, modelo tabular/transcriptómico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (se usa a través de la librería pyaging) |

## Arquitectura y entrenamiento

La arquitectura se basa en una regresión logística ridge, un modelo lineal regularizado con penalización L2. Se entrena para clasificar muestras transcriptómicas en dos grupos: individuos mayores frente a individuos más jóvenes, utilizando la expresión génica transformada por rango dentro de cada muestra (within-sample rank-transformed expression). Esta transformación reduce el efecto de factores técnicos y de composición celular, haciendo el modelo más robusto entre tejidos y experimentos.

No se dispone de información detallada sobre el número de genes utilizados, el tamaño del dataset de entrenamiento, el número de tokens (no aplica) ni si se emplearon técnicas como RLHF o DPO (no aplicables a este tipo de modelo). La publicación original (Salignon et al., 2025) describe el método, pero la model card no incluye esos detalles.

## Capacidades

- Predicción de edad transcriptómica (edad biológica) a partir de datos de expresión génica en humanos.
- Clasificación binaria de muestras como "mayores" o "menores" basada en un score log-odds.
- Conversión del score log-odds en una puntuación de edad continua.
- Aplicación multi-tejido (no restringido a un tejido concreto).
- Integración con la librería pyaging, que permite predecir edad con una sola línea de código (`pya.pred.predict_age(adata, ["pasta"])`).
- No es un modelo generativo ni de lenguaje; no soporta tool calling, agentes, ni procesamiento de texto.

## Casos de uso

- Investigación en envejecimiento: cuantificar la edad biológica de muestras de tejido humano para estudiar los mecanismos moleculares del envejecimiento.
- Evaluación de intervenciones antienvejecimiento: medir si un tratamiento farmacológico o genético revierte o acelera el envejecimiento a nivel transcriptómico.
- Estudios de longevidad: comparar la edad transcriptómica entre poblaciones o cohortes con diferentes expectativas de vida.
- Biomarcadores clínicos: potencial uso como biomarcador de envejecimiento en medicina personalizada, aunque se requiere validación adicional.
- Análisis de datos de RNA-seq: integrar el modelo en pipelines de análisis de expresión génica para obtener una métrica resumen del estado de envejecimiento de la muestra.
- Educación y divulgación: servir como ejemplo de aplicación de modelos de regresión en biología computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento como precisión, AUC o correlación con edad cronológica. Se recomienda consultar la publicación original (Salignon et al., 2025) para obtener datos de validación.

## Requisitos de hardware

- Al ser un modelo de regresión logística con un número reducido de parámetros (no especificado, pero típicamente miles o decenas de miles), no requiere GPU.
- Puede ejecutarse en CPU sin problemas, incluso en máquinas con pocos recursos.
- El uso principal se realiza a través de la librería pyaging, que probablemente requiere Python y dependencias científicas estándar (numpy, scipy, etc.).
- No se dispone de información sobre latencia o throughput, pero se espera que sea prácticamente instantáneo en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la model card. Existen otros relojes transcriptómicos (por ejemplo, el reloj de Horvath para metilación, o el reloj de Peters para transcriptómica), pero no se pueden comparar sin datos concretos de rendimiento y arquitectura.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para datos de transcriptómica humana; no es aplicable a otras especies ni a otros tipos de datos ómicos sin reentrenamiento.
- La transformación por rango dentro de la muestra requiere un preprocesamiento específico; un uso incorrecto puede llevar a resultados erróneos.
- La licencia BSD-3-Clause permite uso comercial y modificación, pero se debe mantener el aviso de copyright.
- No se han publicado detalles sobre posibles sesgos (por ejemplo, por edad, sexo o etnia) en la model card.
- El modelo es una herramienta de investigación; no debe usarse para diagnóstico clínico sin validación regulatoria.
- No se especifica la versión de pyaging requerida ni la compatibilidad con formatos de datos (AnnData, etc.), aunque se infiere que usa la estructura de datos de Scanpy.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/pasta
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Publicación original (preprint): Salignon, J. et al. Pasta, a versatile transcriptomic clock, maps the chemical and genetic determinants of aging and rejuvenation. bioRxiv 2025.06.04.657785 (2025). DOI: https://doi.org/10.1101/2025.06.04.657785
