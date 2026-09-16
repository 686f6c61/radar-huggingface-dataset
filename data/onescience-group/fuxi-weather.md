# OneScience-Group/FuXi-Weather

## Resumen

FuXi-Weather es un sistema de aprendizaje automatico de extremo a extremo que transforma observaciones satelitales en crudo en predicciones meteorologicas globales. El sistema encadena FuXi-DA, un modulo de asimilacion de datos basado en asimilacion latente enmascarada (masked latent assimilation), con modelos de prediccion FuXi en cascada que cubren los plazos corto y medio. Ha sido propuesto por equipos de la Shanghai Academy of Artificial Intelligence for Science, la Universidad de Fudan, la CMA (China Meteorological Administration) y colaboradores, y esta descrito en el articulo "A data-to-forecast machine learning system for global weather" (Nature Communications, DOI 10.1038/s41467-025-62024-1).

El repositorio analizado, OneScience-Group/FuXi-Weather, es una reproduccion de ingenieria independiente de las especificaciones publicas de FuXi-Weather, no la implementacion oficial. Incluye scripts de generacion de datos sinteticos, entrenamiento monoproceso y multiproceso, inferencia y evaluacion, implementados en PyTorch, y permite ejecutar el ciclo completo en GPU, DCU o, con la configuracion minima de prueba, en CPU.

Su relevancia actual estriba en que aborda la asimilacion de observaciones satelitales dispersas (radiancias de microondas de tres satelites en orbita polar y radio ocultacion GNSS) junto con ERA5, con ciclos de actualizacion cada seis horas y predicciones globales de hasta diez dias. No se trata de un modelo de lenguaje: no dispone de ventana de contexto en tokens ni de pesos publicados dentro del repositorio, y los pesos oficiales se distribuyen por separado en Zenodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Asimilacion latente enmascarada (FuXi-DA) mas modelos de prediccion FuXi en cascada; implementacion en PyTorch |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). El sistema opera con ciclos de asimilacion de 6 horas y predicciones globales de hasta 10 dias |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 para este repositorio; el articulo original esta bajo CC BY-NC-ND 4.0 y el codigo, los pesos y los datos oficiales se rigen por sus propias licencias |
| Formato de pesos | No disponible. El repositorio no incluye pesos en el directorio `weight/`; los pesos oficiales se publican en Zenodo |

## Arquitectura y entrenamiento

La arquitectura descrita combina dos componentes. El primero, FuXi-DA, realiza una asimilacion de datos con representacion latente enmascarada, cuyo objetivo es fusionar observaciones satelitales dispersas con los campos de fondo generados por la prediccion. El segundo es una cascada de modelos de prediccion FuXi que operan en los rangos de corto y medio plazo. El entrenamiento optimiza de forma conjunta los objetivos de analisis y de prediccion, lo que acopla ambos modulos en lugar de entrenarlos por separado.

Los datos de entrenamiento citados son ERA5, radiancias de microondas procedentes de tres satelites en orbita polar y radio ocultacion GNSS. No se especifican en la informacion disponible el numero de tokens o muestras, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables, en principio, a un modelo de prediccion numerica). La inferencia genera predicciones en cascada con forma `[2,12,20,16,16]`, y la evaluacion calcula el RMSE por plazo de prediccion, almacenado en `result/evaluation/`.

## Capacidades

- Asimilacion de observaciones satelitales: fusiona observaciones dispersas (radiancias de microondas de tres satelites polares y radio ocultacion GNSS) con los campos de fondo de prediccion.
- Prediccion meteorologica global en cascada: combina modelos de corto y medio plazo para producir predicciones de hasta diez dias.
- Ciclo de analisis continuo: actualiza analisis y predicciones globales cada seis horas.
- Entrenamiento conjunto de analisis y prediccion mediante un unico objetivo optimizado de forma simultanea.
- Evaluacion integrada: calculo de RMSE por plazo de prediccion bajo `result/evaluation/`.
- Ejecucion reproducible: scripts para datos sinteticos (`scripts/fake_data.py`), entrenamiento monoproceso (`scripts/train.py`), entrenamiento multiproceso (`torchrun --standalone --nproc_per_node=2 scripts/train.py`), inferencia (`scripts/inference.py`) y evaluacion (`scripts/result.py`).
- Soporte de aceleracion en GPU y DCU (requiere una version compatible de DTK en el caso de DCU); la CPU solo soporta la configuracion minima de prueba.
- Tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues y modos de pensamiento o vision: no aplica, no es un modelo de lenguaje.

## Casos de uso

- Asimilacion de satelites en investigacion meteorologica: el sistema fusiona observaciones dispersas de microondas y radio ocultacion GNSS con los campos de fondo, lo que permite estudiar el impacto de distintas fuentes de observacion en el analisis resultante.
- Prediccion global a medio plazo: la cascada de modelos de corto y medio plazo produce predicciones de hasta diez dias, adecuadas para experimentos de verificacion frente a reanalisis ERA5 o frente a predicciones operativas.
- Ciclo de analisis operativo en prototipos: con una actualizacion cada seis horas, puede integrarse en un bucle de asimilacion-prediccion para generar analisis globales sucesivos en entornos de investigacion.
- Evaluacion de habilidad predictiva: el script `scripts/result.py` genera el RMSE por plazo de prediccion, lo que sirve para comparar configuraciones, variantes del modelo o estrategias de asimilacion.
- Reproduccion y validacion de resultados publicados: al ser una reproduccion independiente de las especificaciones publicas, permite verificar de forma controlada el comportamiento descrito en el articulo, usando los pesos oficiales de Zenodo.
- Pruebas de integracion y humo (smoke tests) en CPU: `scripts/fake_data.py` y la configuracion por defecto permiten validar el pipeline completo sin GPU antes de lanzar entrenamientos reales.
- Entrenamiento distribuido en infraestructura propia: `torchrun` con `--nproc_per_node` posibilita escalar el entrenamiento en nodos con multiples GPU o DCU.
- Docencia y formacion tecnica: el repositorio ofrece un ejemplo completo de asimilacion de datos y prediccion con aprendizaje profundo, con puntos de entrada separados para datos, entrenamiento, inferencia y metricas.
- Integracion en flujos ModelScope/OneCode: la model card indica que el sistema puede ejecutarse en estos entornos para validar datos, entrenamiento, inferencia, metricas y visualizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los metadatos del repositorio no incluyen cifras numericas de RMSE, MMLU ni de ningun otro conjunto de evaluacion; unicamente se indica que la evaluacion produce el RMSE por plazo de prediccion en `result/evaluation/`. No se dispone de valores concretos ni de comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. La model card solo indica el uso de GPU o DCU cuando esten disponibles, sin especificar modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible.
- CPU: soporta unicamente la configuracion minima de prueba (smoke configuration).
- DCU: requiere instalar una version compatible de DTK.
- Entrenamiento multiproceso: soportado mediante `torchrun --standalone --nproc_per_node=2 scripts/train.py`; el numero maximo de procesos y la escalabilidad no se detallan.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; el flujo documentado se basa en scripts de Python y PyTorch, y en `hf download` para obtener el repositorio.
- Latencia y throughput: no disponibles. La inferencia genera predicciones en cascada con forma `[2,12,20,16,16]`, pero no se aportan tiempos de ejecucion.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la informacion proporcionada. Los unicos elementos relacionados identificados son los pesos y recursos oficiales de la familia FuXi, para los que tampoco se detallan parametros, contexto o rendimiento en esta informacion.

| Modelo o recurso | Parametros | Contexto / alcance | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FuXi-Weather (este repositorio, OneScience-Group) | No disponible | Ciclos de 6 h, prediccion global hasta 10 dias | No disponible | apache-2.0 (repositorio); articulo original CC BY-NC-ND 4.0 | HuggingFace, sin pesos incluidos |
| FuXi (pesos oficiales) | No disponible | No disponible | No disponible | Se rige por sus propios terminos | Zenodo, registro 10401602 |
| FuXi Weather (modelo oficial usado en el articulo) | No disponible | No disponible | No disponible | Se rige por sus propios terminos | Zenodo, registro 15762985 |

## Limitaciones y advertencias

- El repositorio es una reproduccion de ingenieria independiente de las especificaciones publicas, no la implementacion oficial del sistema descrito en el articulo; el comportamiento puede diferir del original.
- No se incluyen pesos en el repositorio (`weight/` esta vacio). Para obtener resultados significativos hay que descargar los pesos oficiales desde Zenodo y verificar su compatibilidad con el codigo de este repositorio.
- La licencia del repositorio es apache-2.0, pero el articulo original esta bajo CC BY-NC-ND 4.0 (prohibe el uso comercial y las obras derivadas de la publicacion) y el codigo, los pesos y los datos oficiales se rigen por sus propias licencias. Es imprescindible revisar esas condiciones antes de cualquier uso comercial o de redistribucion.
- No se documentan sesgos, tasas de alucinacion (concepto no aplicable a un modelo de prediccion fisica) ni limites de idioma mas alla del ingles en la documentacion.
- Alcance temporal limitado a diez dias de prediccion y ciclos de seis horas; no se especifican limites de cobertura geografica ni de resolucion espacial.
- Ausencia de cifras de rendimiento: no hay RMSE publicado, ni comparaciones con sistemas operativos, lo que impide evaluar su habilidad predictiva a partir de la informacion disponible.
- Repositorio sin adopcion comunitaria: cero descargas y cero "likes" en el momento de la consulta, sin evidencia de validacion por terceros.
- La ejecucion en CPU se limita a la configuracion minima de prueba; el entrenamiento real requiere GPU o DCU, y en DCU es necesaria una version compatible de DTK.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo; no se han podido contrastar datos adicionales por esa via.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OneScience-Group/FuXi-Weather
- Articulo: "A data-to-forecast machine learning system for global weather": https://doi.org/10.1038/s41467-025-62024-1
- Pesos oficiales de FuXi: https://zenodo.org/records/10401602
- Pesos oficiales de FuXi Weather (usados en el articulo): https://zenodo.org/records/15762985
- Nota: la busqueda web realizada no devolvio fuentes relevantes sobre este modelo, por lo que no se incluyen enlaces adicionales.
