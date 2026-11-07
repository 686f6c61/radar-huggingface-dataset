# caiofusco/qsar-prov-a

## Resumen

`caiofusco/qsar-prov-a` es un modelo predictivo de QSAR (relacion cuantitativa estructura-actividad) publicado en Hugging Face por Caio dos Santos Fusco. No se trata de un modelo de lenguaje ni de una red neuronal generativa, sino de un artefacto de machine learning entrenado para predecir propiedades o actividades quimicas a partir de descriptores moleculares, generado y exportado a traves de la plataforma de codigo abierto QSAR IA.

La relevancia del modelo radica en su caracter de pieza reproducible dentro de un ecosistema cientifico abierto: el repositorio incluye metadatos de procedencia (`projects/provenance.json` y `provenance_manifest.json`) que la plataforma QSAR IA verifica al importar, con el objetivo de facilitar la reproducibilidad y la colaboracion en descubrimiento de farmacos. La licencia es MIT.

La informacion publicada es muy limitada: el repositorio tiene un tamano de 0.0 GB, no declara pipeline, no especifica idiomas, no incluye resultados de benchmarks ni detalles sobre arquitectura, datos de entrenamiento o hiperparametros. Esta ficha refleja exclusivamente lo disponible y marca el resto como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo predictivo QSAR generado con la plataforma QSAR IA; no se especifica el algoritmo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB y no se detalla el formato de los artefactos) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card no especifica si se trata de una regresion lineal, un modelo basado en arboles (random forest, gradient boosting), una red neuronal o cualquier otro algoritmo de aprendizaje supervisado. Tampoco se detalla el conjunto de descriptores moleculares empleados ni el pipeline de preprocesamiento.

Respecto al entrenamiento, no se indica el numero de compuestos, la fuente del dataset, la variable objetivo (actividad biologica, toxicidad, propiedad fisicoquimica) ni el esquema de validacion. La unica informacion tecnica relevante es la presencia de metadatos de procedencia que la plataforma QSAR IA comprueba por consistencia al importar el modelo, sin que ello constituya una prueba criptografica de autoria.

## Capacidades

- Prediccion de propiedades o actividades quimicas en el marco de estudios QSAR, segun la finalidad declarada del repositorio.
- Integracion en flujos de trabajo de quimioinformatica y descubrimiento de farmacos gestionados por la plataforma QSAR IA.
- Importacion con verificacion de procedencia mediante `provenance.json` y `provenance_manifest.json`.
- Reutilizacion cientifica bajo licencia MIT.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingues, por tratarse de un modelo predictivo especializado y no de un modelo de lenguaje.

## Casos de uso

- Cribado virtual de compuestos: el modelo puede emplearse para priorizar moleculas candidatas en funcion de la actividad predicha, reduciendo el numero de compuestos que pasan a validacion experimental.
- Filtrado temprano de toxicidad o propiedades ADMET: aplicable en fases iniciales de descubrimiento para descartar candidatos con perfiles desfavorables antes de sintesis.
- Reproduccion de estudios publicados: al distribuirse con metadatos de procedencia, permite a otros grupos reimportar el modelo en QSAR IA y replicar los resultados del autor.
- Benchmarking interno de pipelines QSAR: util como referencia base contra la que comparar modelos propios entrenados sobre el mismo conjunto de descriptores.
- Docencia y formacion en quimioinformatica: ejemplo real de artefacto exportado desde una plataforma abierta, util para ilustrar flujos de trabajo reproducibles.
- Integracion en plataformas de gestion de proyectos cientificos: la verificacion de hashes al importar facilita la trazabilidad en entornos colaborativos o de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no especificarse arquitectura ni tamano, no puede estimarse.
- GPU recomendadas: no disponible; muchos modelos QSAR clasicos se ejecutan en CPU sin GPU, pero esto no se confirma para este artefacto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la via documentada es la importacion en la plataforma QSAR IA; no se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, y no se dispone de datos de rendimiento que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: sin arquitectura, dataset, variable objetivo ni metricas, no es posible evaluar la validez cientifica del modelo.
- Riesgo de sobreajuste o de aplicabilidad limitada al dominio quimico concreto con el que fue entrenado; no puede confirmarse la generalizacion a otras familias de compuestos.
- Los metadatos de procedencia no constituyen prueba criptografica de autoria, tal y como advierte la propia model card.
- Sin informacion sobre sesgos: no puede descartarse un sesgo de seleccion derivado del conjunto de entrenamiento (por ejemplo, sobrerrepresentacion de ciertas clases quimicas).
- Sin datos de calibracion ni de incertidumbre en las predicciones; en produccion farmacologica, las predicciones deben tratarse como orientativas y no como sustituto de validacion experimental.
- La licencia MIT permite uso comercial, pero la falta de especificaciones impide garantizar la idoneidad del modelo para entornos regulados.
- Repositorio sin descargas ni likes y con fecha de creacion futura respecto a la informacion de referencia, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caiofusco/qsar-prov-a
- Repositorio de la plataforma QSAR IA: https://github.com/altobellibm/qsar_ia_project
- ORCID del autor: https://orcid.org/0009-0003-6416-9788
- Perfil del autor en Hugging Face: https://huggingface.co/caiofusco
- Referencia sobre QSAR con deep learning: https://www.researchgate.net/publication/398042651_Artificial_Intelligence_in_Modern_Deep-Learning_QSAR
- Referencia sobre modelos QSAR con IA para descubrimiento de fungicidas: https://pubs.acs.org/doi/10.1021/acs.jafc.5c07939
