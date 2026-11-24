# Jetzu77/BSCCM

## Resumen

BSCCM (Blood Single-Cell Microscopy Model) es un modelo publicado en Hugging Face por el usuario Jetzu77, orientado a microscopia de celulas sanguineas individuales en modalidad label-free (sin tincion). El repositorio esta etiquetado con los tags `microscopy`, `single-cell`, `label-free`, `regression` y `blood-cells`, lo que sugiere que el modelo esta disenado para extraer propiedades cuantitativas (regresion) a partir de imagenes de celulas sanguineas sin necesidad de contraste quimico.

El repositorio tiene un tamano de 2,7 GB y acceso restringido (gated), lo que implica que los usuarios deben aceptar condiciones adicionales en Hugging Face antes de descargar los pesos. La informacion publica disponible es muy limitada: no se especifican parametros, arquitectura, contexto, idiomas ni pipeline. Se trata, por tanto, de un modelo de nicho con escasa documentacion publica en el momento de redactar esta ficha.

Dado que las etiquetas apuntan a `regression` sobre imagenes microscopicas, es probable que se trate de un modelo de vision (CNN o transformer de vision) entrenado para predecir variables continuas a nivel de celula individual, pero esta hipotesis no puede confirmarse con los datos disponibles. Cualquier uso en produccion requiere validacion directa contra la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, probablemente sin componente textual) |
| Licencia | other (ver condiciones en Hugging Face) |
| Formato de pesos | no disponible (repositorio de 2,7 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la informacion disponible. Los tags del repositorio (`microscopy`, `single-cell`, `label-free`, `regression`, `blood-cells`) indican que el modelo opera sobre imagenes de microscopia de celulas sanguineas y produce salidas de regresion, pero se desconoce si se trata de una CNN, un Vision Transformer, un modelo hibrido o cualquier otra familia arquitectonica.

Tampoco hay datos sobre el volumen de tokens, la composicion del dataset de entrenamiento, el uso de RLHF/DPO (poco probable en un modelo de vision cientifica) ni innovaciones tecnicas especificas. Toda esta informacion debe consultarse en la model card del repositorio, accesible solo tras aceptar las condiciones de acceso restringido.

## Capacidades

- Procesamiento de imagenes de microscopia de celulas sanguineas en modalidad label-free.
- Prediccion de variables continuas (regresion) a nivel de celula individual, segun el tag `regression`.
- Aplicacion potencial a analisis de poblaciones celulares sanguineas.
- No hay evidencia publica de soporte de tool calling, function calling, agentes ni razonamiento multi-step.
- No hay evidencia publica de capacidades multilingues ni de generacion de texto.
- No se documentan capacidades especiales adicionales (thinking mode, vision generativa, audio).

## Casos de uso

- Analisis de frotis sanguineos sin tincion: el modelo podria aplicarse a imagenes de celulas sanguineas adquiridas con microscopia de campo claro o de contraste de fase para estimar propiedades celulares sin necesidad de tinciones de Wright-Giemsa, reduciendo tiempo de preparacion de muestra.
- Investigacion en hematologia cuantitativa: uso como extractor de caracteristicas numericas por celula para estudios de morfologia eritrocitaria o leucocitaria, siempre que se valide contra ground truth de laboratorio.
- Control de calidad en laboratorios de imagen: deteccion de anomalias morfologicas en poblaciones celulares mediante regresion sobre caracteristicas continuas.
- Automatizacion de pipelines de citometria de imagen: integracion como etapa de inferencia en pipelines que procesan imagenes de celulas individuales y necesitan salidas numericas por objeto.
- Screening preclinico: evaluacion de cambios morfologicos inducidos por tratamientos en cultivos de celulas sanguineas, con salidas de regresion comparables entre condiciones.
- Investigacion academica en aprendizaje automatico aplicado a microscopia: uso como baseline o como componente en estudios de representacion label-free, sujeto a la licencia `other` y a las condiciones de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio de 2,7 GB sugiere pesos que, en precision completa, podrian requerir del orden de varios GB de VRAM, pero no se puede confirmar sin conocer el numero de parametros y el formato.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; probablemente viable en GPUs consumer si el modelo es de vision de tamano moderado, pero sin datos verificables.
- Opciones de despliegue: no disponible; al no conocerse el formato de pesos ni el pipeline, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos publicos comparables en la informacion proporcionada, y los tags del repositorio no permiten identificar alternativas equivalentes con datos verificables.

## Limitaciones y advertencias

- Documentacion publica practicamente inexistente: no hay model card visible con arquitectura, datos de entrenamiento ni metricas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia `other`: las condiciones de uso comercial no estan claras y deben revisarse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion o predicciones no calibradas: en tareas de regresion cientifica, la ausencia de benchmarks publicados impide evaluar la fiabilidad de las salidas.
- Sesgos desconocidos: no hay informacion sobre la demografia de las muestras, los equipos de microscopia utilizados ni las condiciones de adquisicion, lo que puede limitar la generalizacion.
- Idiomas: irrelevante si el modelo es puramente visual, pero no confirmado.
- Sin soporte verificado de tool calling, agentes ni integracion con frameworks de inferencia estandar.
- Recomendacion: validar exhaustivamente contra ground truth de laboratorio antes de cualquier uso clinico o diagnostico; este modelo no debe emplearse como herramienta medica sin certificacion regulatoria.

## Enlaces

- Hugging Face: https://huggingface.co/Jetzu77/BSCCM
