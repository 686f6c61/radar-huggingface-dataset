# lab-cosmo/pet-rho

## Resumen

PET-ρ es una familia de modelos de aprendizaje automatico para la prediccion de densidades electronicas (y, en algunas variantes, densidades de espin) de sistemas atomisticos. Desarrollado por el laboratorio lab-cosmo, el modelo no genera texto ni codigo: su salida son coeficientes de densidad electronica expresados sobre una base auxiliar, lo que lo situa en el ambito de la quimica computacional y la fisica atomistica mas que en el del procesamiento de lenguaje natural.

Los checkpoints publicados se entrenan sobre el conjunto de datos OMol25, calculado con el funcional wB97M-V y la base def2-TZVPD, y se distribuyen en variantes que predicen densidad total, densidad total mas densidad de espin, o ambas acompanadas de estimaciones de error (LLPR). El repositorio ocupa 5,1 GB y la licencia es BSD-3-Clause, permisiva para uso comercial.

La relevancia actual del modelo reside en su capacidad de aproximar densidades electronicas con coste muy inferior al de un calculo de estructura electronica ab initio, lo que habilita flujos de trabajo de alto rendimiento en cribado molecular y simulacion. La informacion disponible no detalla arquitectura, numero de parametros ni longitud de contexto, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre sistemas atomisticos) |
| Licencia | BSD-3-Clause |
| Formato de pesos | checkpoints `.ckpt` (`models/<model>-<size>-v<version>.ckpt`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo (tipo de red, capas, mecanismos de atencion ni tamano). Lo que si se especifica es el objetivo de entrenamiento: predecir densidades electronicas como coeficientes sobre una base auxiliar, y en algunas variantes tambien densidades de espin. La variante `pet-rho-omol-gap-llpr-l-v1.0.0` incorpora estimaciones de error mediante LLPR (Laplace-Last-Layer Prediction), una tecnica de cuantificacion de incertidumbre en la ultima capa.

El entrenamiento se realiza sobre el dataset OMol25 de moleculas, con referencias calculadas a nivel wB97M-V/def2-TZVPD. No se indica en la informacion disponible el numero de tokens o muestras, la composicion detallada del dataset, ni si se emplearon tecnicas de ajuste fino por refuerzo o preferencias (no aplicables en este dominio). Tampoco se detallan innovaciones de decodificacion o atencion.

## Capacidades

- Prediccion de densidad electronica total de sistemas moleculares como coeficientes sobre una base auxiliar.
- Prediccion de densidad de espin en las variantes `pet-rho-omol-l-v1.0.0` y `pet-rho-omol-gap-llpr-l-v1.0.0`.
- Estimacion de error asociada a la prediccion en la variante LLPR.
- Variante sin espin (`pet-rho-omol-nospin-l-v1.0.0`) para casos en que solo se requiere densidad total.
- Integracion mediante la libreria `qpet` (`DensityModel.from_release`).
- No se documentan capacidades de generacion de texto, codigo, vision, audio, tool calling ni razonamiento multi-paso, por no ser un modelo de lenguaje.

## Casos de uso

- Cribado de alto rendimiento de moleculas: predecir densidades electronicas de miles de candidatos sin ejecutar calculos DFT completos, usando la variante OMol25 como aproximacion rapida.
- Inicializacion de calculos de estructura electronica: emplear la densidad predicha como punto de partida para acelerar la convergencia de calculos wB97M-V/def2-TZVPD.
- Analisis de propiedades derivadas de la densidad: obtener magnitudes como momentos multipolares o densidades en puntos concretos a partir de los coeficientes predichos.
- Estudios de espin: usar las variantes con densidad de espin para sistemas con electrones desapareados, donde la distribucion de espin es relevante.
- Filtrado con control de incertidumbre: la variante LLPR permite descartar predicciones con error estimado alto antes de un calculo costoso.
- Generacion de datos sinteticos de densidad para entrenar modelos posteriores o aumentar conjuntos de referencia.
- Integracion en pipelines de quimica computacional mediante la libreria `qpet` y su API Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: uso mediante la libreria `qpet` (Python); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de densidad electronica ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta entrenado sobre OMol25 con el funcional wB97M-V y la base def2-TZVPD; su aplicabilidad fuera de ese dominio quimico o de ese nivel de teoria no esta documentada.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni comportamiento fuera de distribucion; en modelos de densidad, el analogo es la extrapolacion a sistemas o elementos no representados en el entrenamiento.
- La ausencia de datos de arquitectura, parametros y benchmarks impide evaluar su calidad frente a alternativas.
- La licencia BSD-3-Clause permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento (OMol25) si se redistribuyen derivados.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural ni tareas de texto.
- Los checkpoints se distribuyen en formato `.ckpt`, lo que puede requerir herramientas especificas para su carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lab-cosmo/pet-rho
- Paper de OMol25: https://arxiv.org/abs/2611.34732
- Libreria qpet: https://github.com/ppegolo/qpet
- Demo en Atomistic Cookbook: https://atomistic-cookbook.org/examples/pet-rho-omol25/pet-rho-omol25.html
