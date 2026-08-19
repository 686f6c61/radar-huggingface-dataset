# pyaging/twelvecelldeconvolutebloodepictreg

## Resumen

El modelo `pyaging/twelvecelldeconvolutebloodepictreg` es un modelo de deconvolución celular basado en referencia, desarrollado por el equipo de pyaging, que estima la proporción de células T reguladoras a partir de datos de metilación de ADN obtenidos con arrays EPIC en sangre periférica. Se enmarca dentro de la categoría de "aging clocks" y herramientas de perfilado inmunológico de alta resolución, y está pensado para su uso en investigación biomédica, especialmente en estudios de envejecimiento y biología computacional.

El modelo hereda la metodología del trabajo de Salas et al. (2022) sobre deconvolución mejorada de células sanguíneas, pero utiliza una variante de 240 CpGs (procedente de Biolearn) en lugar de los 1.200 CpGs publicados originalmente. Esta selección de sondas no es un subconjunto de la lista publicada, sino que se basa en contrastes de metilación máximos entre cada tipo celular y el resto. No se trata de una red neuronal ni de un modelo de lenguaje: es un modelo de regresión con restricciones que resuelve un problema de optimización convexa.

La relevancia actual del modelo radica en su capacidad para cuantificar subpoblaciones inmunitarias a partir de datos de metilación ya existentes, sin necesidad de citometría de flujo, lo que permite reutilizar grandes cohortes epigenéticas para estudios de inmunosenescencia y enfermedades relacionadas con la edad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reference-based constrained deconvolution (regresion lineal con restricciones de no negatividad y suma a 1) |
| Parametros totales | No disponible (no es una red neuronal; el modelo consiste en un conjunto de 240 CpGs y sus coeficientes) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no procesa texto) |
| Tipos de cuantizacion | No aplica (no es un modelo de pesos continuos) |
| Idiomas soportados | No disponible (trabaja con datos numericos de metilacion, no con texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (los coeficientes se distribuyen dentro del paquete pyaging, no como archivos de pesos independientes) |

## Arquitectura y entrenamiento

El modelo implementa una deconvolucion celular basada en referencia, un metodo clasico en epigenetica computacional. La idea es resolver un sistema lineal donde la senal de metilacion observada en cada CpG es una combinacion lineal de las firmas de metilacion de los tipos celulares puros, ponderada por sus proporciones. La solucion se obtiene mediante optimizacion con restricciones: las proporciones deben ser no negativas y sumar 1.

La seleccion de CpGs es la innovacion principal: mientras que la libreria publicada EPIC IDOL-Ext utilizaba 1.200 sondas, este modelo hereda una variante de 240 CpGs de Biolearn, cuyas filas contienen 10 contrastes positivos y 10 negativos de metilacion maxima por subtipo celular. No se ha publicado informacion detallada sobre el proceso de entrenamiento (por ejemplo, si se utilizo validacion cruzada o conjuntos de entrenamiento/test), aunque se asume que los coeficientes se derivaron de datos de metilacion de leucocitos purificados. No se menciona el uso de RLHF, DPO ni tecnicas de aprendizaje profundo.

## Capacidades

- Prediccion de la proporcion de celulas T reguladoras (Treg) en sangre periferica a partir de datos de metilacion de arrays EPIC.
- Especifico para Homo sapiens y para tejido de leucocitos sanguineos purificados.
- Integrable en pipelines de analisis de envejecimiento epigenetico mediante la libreria pyaging.
- No genera texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de vision.
- No incluye modo de pensamiento ni funciones de chat.

## Casos de uso

- Estudios de inmunosenescencia: cuantificar la proporcion de Treg en cohortes de envejecimiento para correlacionar con edad biologica y riesgo de enfermedades autoinmunes. El modelo permite obtener estas proporciones a partir de datos de metilacion ya disponibles, evitando nuevas mediciones.
- Reanalisis de datos epigeneticos publicos: aplicar el modelo a conjuntos de datos de metilacion de sangre (por ejemplo, GEO) para extraer la fraccion de Treg sin necesidad de citometria de flujo.
- Validacion de biomarcadores: utilizar la proporcion de Treg como covariable en modelos de prediccion de mortalidad o fragilidad, ajustando por composicion celular.
- Control de calidad en estudios de asociacion epigenome-wide (EWAS): incluir la proporcion de Treg estimada como factor de confusion para reducir falsos positivos en la asociacion entre metilacion y fenotipos.
- Desarrollo de relojes epigeneticos de segunda generacion: integrar la proporcion de Treg como variable intermedia en modelos de edad fenotipica o de riesgo.
- Comparacion con metodos de citometria: validar resultados de experimentos de inmunofenotipado por citometria de flujo frente a estimaciones de metilacion en las mismas muestras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval ni metricas similares porque no es un modelo de lenguaje. Tampoco se proporcionan metricas de error (como RMSE o correlacion) para la deconvolucion en la model card. Se recomienda consultar el articulo de Salas et al. (2022) para validaciones del metodo original, aunque con la variante de 240 CpGs no se ofrecen cifras concretas.

## Requisitos de hardware

- El modelo es extremadamente ligero: no requiere GPU. La deconvolucion de una muestra se resuelve mediante un problema de optimizacion convexa con 240 variables, ejecutable en CPU en menos de un segundo.
- No se necesita VRAM especifica.
- Compatible con cualquier ordenador personal, incluyendo portatiles.
- Despliegue: se integra en la libreria pyaging (Python). No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles, pero se estima un tiempo de ejecucion por muestra del orden de milisegundos a pocos segundos, dependiendo del optimizador utilizado.

## Comparativa con modelos similares

| Modelo | Metodo | Numero de CpGs | Tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| twelvecelldeconvolutebloodepictreg (este) | Deconvolucion restringida basada en referencia | 240 | Sangre (leucocitos) | BSD-3-Clause | HuggingFace / pyaging |
| EPIC IDOL-Ext (Salas et al. 2022) | Deconvolucion restringida basada en referencia | 1.200 | Sangre | No especificada (articulo publicado) | Paquete R / repositorio del articulo |
| CIBERSORT (Newman et al. 2015) | Deconvolucion por regresion de soporte vectorial | ~500 (LM22) | Varios tejidos | No libre para uso comercial | Sitio web dedicado |
| EpiDISH | Deconvolucion robusta con restricciones | Variable | Sangre | GPL-3.0 | Paquete Bioconductor |

La comparativa se basa en caracteristicas generales conocidas; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Especificidad de tejido: el modelo solo es valido para sangre periferica (leucocitos purificados). Aplicarlo a otros tejidos produce resultados sin sentido.
- Dependencia de la plataforma de metilacion: esta calibrado para arrays EPIC; su uso con datos de 450K u otras plataformas puede requerir imputacion de sondas y no esta garantizado.
- La seleccion de 240 CpGs es una variante no publicada de Biolearn; no hay documentacion oficial sobre su validacion en cohortes independientes, lo que introduce incertidumbre sobre su robustez.
- Riesgo de sesgo por composicion celular: si la muestra contiene tipos celulares no contemplados en la referencia (p. ej., celulas tumorales circulantes), las estimaciones pueden estar sesgadas.
- No es un modelo de lenguaje: no puede responder preguntas ni generar texto; su unica salida es un valor numerico (proporcion de Treg).
- Licencia BSD-3-Clause permite uso comercial, pero la metodologia subyacente puede estar sujeta a patentes o restricciones de terceros (no se ha verificado).
- No se proporcionan intervalos de confianza ni medidas de incertidumbre en la salida, lo que limita su uso en contextos clinicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/twelvecelldeconvolutebloodepictreg
- Documentacion de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Articulo original de Salas et al. (2022): https://doi.org/10.1038/s41467-021-27864-7
