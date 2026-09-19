# computational-metabolomics/fiddle

## Resumen

FIDDLE (computational-metabolomics/fiddle) es un conjunto de checkpoints de aprendizaje profundo para metabolomica por espectrometria de masas, publicado en Hugging Face como espejo byte a byte de la release 2.0.0 del proyecto upstream `JosieHong/FIDDLE`. No es un modelo de lenguaje: los artefactos distribuidos son un modelo TCN (red convolucional temporal) y un modelo de rescoring, ambos orientados a datos de espectrometria de masas con analizador Orbitrap. El desarrollo corresponde a Yuhui Hong y al resto de contribuidores de FIDDLE.

El repositorio contiene unicamente la licencia Apache-2.0 y dos archivos ZIP (`fiddle_tcn_orbitrap.zip` y `fiddle_rescore_orbitrap.zip`), con un tamano total de 0.2 GB. La model card indica explicitamente que los ficheros son identicos a los de la release upstream y que no se ha realizado ninguna conversion de formato, por lo que el repositorio funciona como canal de distribucion y no como version reempaquetada.

Su relevancia practica es acotada y muy especifica: la etiqueta `galaxy-data-manager` sugiere su uso previsto como herramienta dentro de flujos de trabajo de Galaxy para metabolomica. No se publican parametros, datos de entrenamiento, benchmarks ni idiomas soportados, y el repositorio no registra descargas ni interacciones en el momento de la consulta, de modo que cualquier evaluacion tecnica exige acudir al repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; los nombres de los artefactos indican un modelo TCN (red convolucional temporal) y un modelo de rescoring |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada espectral no se describe en terminos de ventana de contexto) |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints originales en ZIP, sin cuantizaciones publicadas |
| Idiomas soportados | no aplica (entrada de datos numericos de espectrometria de masas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ZIP con checkpoints; formato interno de los pesos no especificado |
| Version | 2.0.0 |
| Tarea declarada | prediccion y rescoring sobre datos Orbitrap |
| Tamano del repositorio | 0.2 GB |
| Etiquetas del repositorio | galaxy, galaxy-data-manager, metabolomics, mass-spectrometry |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-18 / 2026-09-18 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura de forma explicita. Los nombres de los artefactos permiten inferir dos componentes diferenciados: un modelo TCN, habitual en el procesamiento de senales secuenciales como cromatogramas o espectros, y un modelo de rescoring, orientado a reevaluar candidatos generados por una etapa previa de busqueda o anotacion. Esta inferencia procede exclusivamente de la nomenclatura de los ficheros y no de documentacion tecnica incluida en el repositorio.

Tampoco se especifican el numero de tokens o muestras de entrenamiento, la composicion del conjunto de datos, ni si se emplearon tecnicas de ajuste fino con refuerzo (RLHF/DPO), algo por otra parte ajeno a este dominio. La model card unicamente certifica la integridad de los artefactos mediante sumas SHA-256 y confirma que no se ha realizado conversion alguna respecto a la release 2.0.0 del repositorio upstream.

## Capacidades

- Prediccion sobre datos de espectrometria de masas Orbitrap: el checkpoint `fiddle_tcn_orbitrap.zip` corresponde a la etapa de prediccion del flujo FIDDLE.
- Rescoring de resultados: el checkpoint `fiddle_rescore_orbitrap.zip` reevalua candidatos producidos por etapas anteriores del pipeline.
- Integracion en Galaxy: las etiquetas `galaxy` y `galaxy-data-manager` apuntan a su uso dentro de flujos de trabajo reproducibles de Galaxy.
- Procesamiento de datos de metabolomica no dirigida: el dominio declarado es metabolomics y mass-spectrometry.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio: no es un modelo de lenguaje.
- No dispone de tool calling ni de function calling en el sentido de los modelos generativos.
- No dispone de modo de razonamiento (thinking mode) ni de capacidades de agente multi-paso.
- No se documentan capacidades multilingues: la entrada es numerica y especifica del instrumento.
- El alcance instrumental esta limitado, segun la nomenclatura, a Orbitrap; no se documenta soporte para otras geometrias de analizador.

## Casos de uso

- Anotacion de espectros en metabolomica no dirigida: el modelo se insertaria como etapa de prediccion dentro de un pipeline que procesa espectros Orbitrap, alimentando la busqueda posterior en librerias espectrometricas.
- Filtrado de falsos positivos: el checkpoint de rescoring permite reevaluar las anotaciones candidatas y descartar aquellas con baja coherencia, reduciendo el trabajo de validacion manual.
- Integracion en flujos Galaxy: al estar etiquetado como `galaxy-data-manager`, puede incorporarse como paso de un workflow reproducible, con trazabilidad de entradas y salidas.
- Reanalisis retroactivo de conjuntos publicos: repositorios como MetaboLights o MassIVE almacenan miles de experimentos Orbitrap; el modelo permitiria reprocesarlos de forma homogenea.
- Control de calidad entre laboratorios: aplicar el mismo modelo de rescoring a replicas tecnicas ayuda a detectar anotaciones inestables y a homogeneizar criterios entre instalaciones.
- Despliegue en infraestructura local o HPC: al distribuirse como checkpoints para el software upstream, puede ejecutarse sin dependencia de servicios externos, algo relevante en datos clinicos o confidenciales.
- Cribado de lipidomica y metabolomica dirigida: el rescoring acelera la seleccion de candidatos antes de la confirmacion con estandares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, sensibilidad, F1 ni comparaciones cuantitativas, y la busqueda web realizada no devolvio documentacion tecnica asociada al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El conjunto completo de checkpoints ocupa 0.2 GB, pero ese dato corresponde al tamano de los archivos comprimidos, no al consumo en memoria en tiempo de ejecucion.
- GPU recomendadas: no documentadas. Por el tamano de los artefactos, es plausible que la inferencia quepa en GPUs de consumo (por ejemplo, una RTX 3060 de 12 GB), pero se trata de una inferencia no confirmada por el autor.
- Compatibilidad con GPU de consumo: probable segun el tamano de los checkpoints, siempre que el codigo upstream soporte aceleracion CUDA; no verificado.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje. El despliegue se realiza mediante el software del proyecto FIDDLE y, potencialmente, a traves de herramientas de Galaxy.
- Latencia y throughput: no disponibles.
- Aceleracion por CPU: no documentada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. No hay parametros, metricas ni condiciones de evaluacion publicadas para este modelo, y las fuentes consultadas no ofrecen resultados frente a otras herramientas de anotacion o rescoring en metabolomica. Por tanto, la comparativa se declara como no disponible.

## Limitaciones y advertencias

- Ambito restringido: no es un modelo de lenguaje ni un modelo multimodal; no debe emplearse para tareas de generacion de texto, codigo o vision.
- Especificidad instrumental: la nomenclatura indica entrenamiento sobre datos Orbitrap. La transferencia a otros analizadores (TOF, Q-TOF, timsTOF) no esta documentada y no puede asumirse.
- Ausencia de metricas: sin benchmarks publicados no es posible estimar la tasa de error ni comparar con alternativas antes de integrarlo en produccion.
- Licencia: se declara Apache-2.0 siguiendo la licencia del proyecto upstream. La propia model card senala que no existe una declaracion de licencia especifica para los checkpoints, por lo que conviene verificar las condiciones antes de un uso comercial.
- Metadatos incompletos: no se documentan parametros, datos de entrenamiento, composicion del dataset ni proceso de validacion.
- Sin validacion comunitaria en Hugging Face: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o revision por terceros.
- Naturaleza del repositorio: es un espejo de la release upstream, sin conversion; cualquier incidencia debe reportarse al proyecto original.
- Riesgo de alucinacion: no aplica en el sentido de los modelos generativos, pero existe riesgo de asignaciones incorrectas de identidad quimica que deben validarse experimentalmente.
- Mantenimiento: no se documenta ningun compromiso de soporte o actualizacion del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/computational-metabolomics/fiddle
- Repositorio upstream: https://github.com/JosieHong/FIDDLE
- Release 2.0.0: https://github.com/JosieHong/FIDDLE/releases/tag/v2.0.0
- Licencia upstream: https://github.com/JosieHong/FIDDLE/blob/v2.0.0/LICENSE
- La busqueda web realizada no devolvio ningun enlace relevante al modelo; los resultados obtenidos correspondian a foros sin relacion con el proyecto.
