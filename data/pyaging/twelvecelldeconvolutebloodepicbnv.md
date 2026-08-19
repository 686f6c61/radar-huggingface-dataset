# pyaging/twelvecelldeconvolutebloodepicbnv

## Resumen

El modelo `twelvecelldeconvolutebloodepicbnv`, desarrollado por el equipo de pyaging, es un método de deconvolución de metilación de ADN restringido por referencia que estima la proporción de células B naive en sangre periférica a partir de datos de arrays EPIC. Este tipo de análisis permite inferir la composición inmune de una muestra sin necesidad de citometría de flujo, lo que resulta útil en estudios de envejecimiento, inmunología y biomarcadores. El modelo se basa en el trabajo de Salas et al. (2022), pero utiliza una selección de 240 CpGs no documentada públicamente, en lugar de los 1200 CpGs del protocolo original, lo que introduce una variación metodológica relevante para quienes reproduzcan estos análisis.

La arquitectura subyacente es una deconvolución lineal restringida (constrained least squares), donde las proporciones celulares se estiman minimizando el error cuadrático sujeto a que las proporciones sean no negativas y sumen uno. No se trata de una red neuronal ni de un modelo generativo, sino de un método estadístico clásico aplicado a datos de metilación. Está diseñado exclusivamente para la especie Homo sapiens y tejido de leucocitos de sangre purificada, y su salida es un valor continuo entre 0 y 1 que representa la fracción de células B naive.

La relevancia actual de este modelo radica en su integración en el ecosistema `pyaging`, que unifica múltiples relojes de envejecimiento y métodos de deconvolución en una sola biblioteca de Python. Esto facilita la comparación directa entre diferentes estimadores de edad biológica y composición celular, un área de creciente interés en medicina de precisión y estudios longitudinales de envejecimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reference-based constrained deconvolution (regresión lineal restringida) |
| Parametros totales | No aplica (método estadístico, no red neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (datos biológicos, no texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (integrado en la librería pyaging, probablemente como coeficientes y lista de CpGs) |

## Arquitectura y entrenamiento

El modelo implementa una deconvolución basada en referencia, donde una matriz de metilación de referencia (obtenida de tipos celulares purificados) se utiliza para estimar las proporciones de cada tipo celular en una muestra mixta. El método emplea mínimos cuadrados restringidos, imponiendo que las proporciones sean no negativas y sumen 1. La referencia concreta utilizada es la biblioteca EPIC IDOL-Ext, pero con una sustitución interna: en lugar de los 1200 CpGs publicados, pyaging hereda una versión no documentada de Biolearn que usa 240 CpGs. Según la model card, estos 240 CpGs se seleccionaron para maximizar contrastes de metilación entre cada tipo celular y el resto, pero no se especifica el algoritmo exacto ni si son un subconjunto de los 1200 originales.

El entrenamiento, en el sentido de ajuste de coeficientes, se realiza sobre datos de metilación de sangre periférica de individuos humanos, con proporciones celulares conocidas obtenidas mediante métodos de referencia. No se dispone de detalles sobre el tamaño del conjunto de entrenamiento ni sobre el proceso de validación. El modelo fue desarrollado en 2022 y su salida es específicamente la proporción de células B naive.

## Capacidades

- Estimación de la proporción de células B naive en muestras de sangre periférica a partir de datos de metilación de arrays EPIC.
- Integración con el flujo de trabajo de pyaging para predicción de edad y deconvolución celular en un mismo pipeline.
- Funciona con datos de entrada estándar de metilación (matrices de beta-values) y requiere solo el nombre del modelo para su invocación.
- No soporta generación de texto, código, visión ni otras capacidades propias de modelos de lenguaje.
- No dispone de soporte para tool calling ni agentes, al ser un método estadístico de propósito específico.

## Casos de uso

- Estudios de envejecimiento e inmunosenescencia: permite cuantificar la disminución de células B naive en sangre con la edad, un biomarcador clásico de envejecimiento del sistema inmune.
- Análisis de composición inmune en cohortes clínicas: se puede aplicar a biobancos con datos de metilación para inferir la fracción de células B naive sin necesidad de citometría de flujo, reduciendo costes y tiempo.
- Validación de otros relojes epigenéticos: al conocer la proporción de células B naive, se pueden ajustar los relojes de envejecimiento por composición celular, mejorando su precisión en estudios longitudinales.
- Investigación en enfermedades autoinmunes: la proporción de células B naive es relevante en patologías como lupus o artritis reumatoide; este modelo permite monitorizar cambios en la composición inmune a partir de muestras almacenadas.
- Control de calidad en experimentos de metilación: la deconvolución puede detectar contaminación o desviaciones en la composición celular esperada de una muestra.
- Educación y reproducibilidad: al estar integrado en pyaging, sirve como ejemplo de aplicación de métodos de deconvolución para estudiantes e investigadores que quieran aprender el flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento como correlación con citometría de flujo, error absoluto medio ni comparación con otros métodos de deconvolución. Tampoco se proporcionan datos sobre la precisión de la estimación en diferentes cohortes o condiciones experimentales.

## Requisitos de hardware

- No requiere GPU ni hardware especializado; es un método de regresión lineal que se ejecuta en CPU en cuestión de segundos para muestras individuales.
- Memoria RAM: suficiente con unos pocos GB, dependiendo del tamaño del conjunto de datos de metilación (típicamente matrices de ~850K CpGs por muestra).
- Despliegue: se integra en la librería pyaging de Python, que depende de paquetes estándar como numpy y pandas. No requiere servicios de inferencia como vLLM u Ollama.
- Latencia: para una muestra individual, el cálculo es prácticamente instantáneo; para cohortes de miles de muestras, el tiempo escala linealmente con el número de muestras.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros métodos de deconvolución como el original de Salas et al. (1200 CpGs) o el método IDOL. La model card menciona que la selección de 240 CpGs es una "sustitución" no documentada, pero no ofrece datos comparativos de rendimiento. Por tanto, la comparativa se limita a aspectos cualitativos:

| Modelo | CpGs utilizados | Método | Documentación | Disponibilidad |
|---|---|---|---|---|
| twelvecelldeconvolutebloodepicbnv (pyaging) | 240 (no documentado) | Constrained deconvolution | Model card escueta | Librería pyaging |
| IDOL-Ext original (Salas et al. 2022) | 1200 | Constrained deconvolution | Paper publicado | Paquetes R/Bioconductor |
| Métodos alternativos (CIBERSORTx, etc.) | Variable | Diversos | Documentación extensa | Múltiples implementaciones |

## Limitaciones y advertencias

- El modelo está limitado a la estimación de células B naive; no proporciona proporciones de otros tipos celulares, aunque el nombre "twelvecelldeconvolute" sugiere que podría haber variantes para otros subtipos.
- La selección de los 240 CpGs no está documentada públicamente, lo que dificulta la reproducibilidad y la interpretación biológica de los resultados.
- La referencia de metilación subyacente puede introducir sesgos específicos de población o tejido; no se han reportado validaciones en poblaciones no europeas o en condiciones patológicas.
- La licencia BSD-3-Clause permite uso comercial, pero la falta de documentación técnica puede limitar su adopción en entornos regulados.
- No se han publicado métricas de error ni comparaciones con métodos de referencia, por lo que su precisión relativa es desconocida.
- El modelo asume que la metilación de las células B naive es estable y homogénea, lo que puede no cumplirse en ciertos estados de enfermedad o tras tratamientos inmunomoduladores.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/twelvecelldeconvolutebloodepicbnv
- Paper original (Salas et al., 2022): https://doi.org/10.1038/s41467-021-27864-7
- Documentación de pyaging: https://pyaging.readthedocs.io
