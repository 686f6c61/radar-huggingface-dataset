# pyaging/pchannum

## Resumen

pchannum es un reloj epigenético (aging clock) publicado en el ecosistema pyaging que predice la edad cronológica de un individuo a partir de datos de metilación de ADN en sangre periférica (whole blood) de Homo sapiens. No es un modelo de lenguaje ni un transformer generativo: se trata de un modelo estadístico compuesto por un análisis de componentes principales (PCA) seguido de una regresión elastic net, entrenado para reproducir el score del reloj de Hannum original mediante un proxy de componentes principales.

El modelo aborda un problema concreto de la investigación biomédica: los relojes epigenéticos clásicos, como el de Hannum, presentan una fiabilidad test-retest limitada, lo que dificulta su uso en ensayos clínicos y en el seguimiento longitudinal. La aproximación PCA + elastic net, descrita por Higgins-Chen et al. en Nature Aging (2022), busca aumentar la estabilidad de las predicciones reduciendo la dimensionalidad de las señales de metilación antes de la regresión.

Su relevancia actual radica en que se distribuye como un artefacto listo para usar dentro de pyaging, una librería que centraliza y estandariza decenas de relojes epigenéticos. Con 793 descargas y un tamaño de repositorio de 1.0 GB, está orientado a investigadores que necesitan calcular edades epigenéticas de forma reproducible en pipelines de análisis de metilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + regresion elastic net |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica a este tipo de modelo) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT (software); los pesos retienen los terminos de los autores originales |
| Formato de pesos | no disponible (artefacto de pyaging) |

## Arquitectura y entrenamiento

La arquitectura combina una reduccion de dimensionalidad mediante componentes principales (PCA) sobre las señales de metilacion de ADN, seguida de una regresion elastic net que produce la prediccion final de edad cronologica. El modelo se entrena como un proxy de componentes principales cuyo objetivo es reproducir el score del reloj de Hannum original, de modo que hereda su comportamiento predictivo pero con mayor estabilidad estadistica.

El modelo opera sobre datos de metilacion de ADN de sangre periferica en humanos y predice edad cronologica. El año de referencia indicado en la model card es 2022, coincidiendo con la publicacion de Higgins-Chen et al. en Nature Aging, que describe la solucion computacional para mejorar la fiabilidad de los relojes epigeneticos. No se dispone de informacion sobre el numero de muestras de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de validacion cruzada especificas en la informacion proporcionada.

## Capacidades

- Prediccion de edad cronologica a partir de datos de metilacion de ADN en sangre periferica humana.
- Reproduccion del score del reloj de Hannum original mediante un proxy de componentes principales.
- Mejora de la fiabilidad test-retest respecto a relojes epigeneticos clasicos, segun el planteamiento del paper de referencia.
- Integracion directa con la libreria pyaging mediante la funcion `pya.pred.predict_age(adata, ["pchannum"])`.
- Aplicable a estudios longitudinales y ensayos clinicos donde la estabilidad de la prediccion es critica.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Estudios de envejecimiento poblacional: calcular la edad epigenetica de cohortes a partir de datos de metilacion de sangre y comparar la edad biologica con la cronologica, aprovechando la mayor estabilidad del proxy PCA.
- Ensayos clinicos con seguimiento longitudinal: usar el modelo para medir cambios en la edad epigenetica a lo largo del tiempo con menor ruido test-retest, lo que facilita detectar efectos de intervenciones.
- Investigacion en biomarcadores del envejecimiento: integrar pchannum en pipelines de pyaging junto con otros relojes para comparar predicciones y validar hallazgos.
- Analisis de datos de arrays de metilacion (p. ej. Illumina 450K o EPIC): procesar matrices de metilacion de sangre periferica y obtener un score de edad reproducible dentro de un flujo de analisis en Python.
- Reproducibilidad de estudios previos: recalcular el score de Hannum mediante el proxy para replicar resultados publicados con una implementacion estandarizada.
- Docencia y formacion en bioinformatica: utilizar el modelo como ejemplo practico de reduccion de dimensionalidad y regresion regularizada aplicada a datos omicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU, ya que consiste en una transformacion PCA y una regresion elastic net sobre datos tabulares.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en GPU consumer: si, aunque no es necesario; el cuello de botella es la carga del repositorio de 1.0 GB y el procesamiento de la matriz de metilacion.
- Opciones de despliegue: libreria pyaging en Python; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; dependen del tamaño de la matriz de metilacion de entrada y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Predictor | Tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pchannum | PCA + elastic net | Edad cronologica | Sangre periferica | MIT (software) | Hugging Face (pyaging) |
| Hannum original | Regresion elastica sobre CpGs | Edad cronologica | Sangre periferica | Terminos de los autores originales | Publicacion original |
| Otros relojes pyaging | Diversos (elastic net, PCA, etc.) | Edad cronologica o biologica | Variable | Variable | Hugging Face (pyaging) |

La informacion disponible no permite comparar metricas de rendimiento cuantitativas entre pchannum y alternativas concretas.

## Limitaciones y advertencias

- Solo aplica a Homo sapiens y a datos de metilacion de ADN de sangre periferica; no es transferible a otros tejidos o especies sin validacion.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades generativas.
- La licencia MIT cubre el software de pyaging, pero los pesos retienen los terminos de los autores originales; es necesario revisar las condiciones de uso comercial de los pesos.
- El modelo es un proxy del score de Hannum, por lo que hereda sus sesgos y limitaciones, incluida la dependencia de la plataforma de metilacion y del preprocesamiento.
- Riesgo de predicciones sesgadas si los datos de entrada no han sido normalizados de forma consistente con el entrenamiento original.
- No se dispone de informacion sobre el rendimiento en poblaciones no representadas en el entrenamiento ni sobre su calibracion en rangos de edad extremos.
- Para produccion en entornos clinicos, requiere validacion local y supervision experta; no debe usarse como unico criterio de decision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/pchannum
- Catalogo de relojes pyaging: https://pyaging.readthedocs.io
- Paper de referencia: https://doi.org/10.1038/s43587-022-00248-2
