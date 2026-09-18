# ShaloyL/credit-card-default-prediction

## Resumen

`ShaloyL/credit-card-default-prediction` no es un modelo de lenguaje, sino un repositorio de artefactos binarios que distribuye el modelo ganador de un proyecto de clasificacion tabular sobre el conjunto de datos UCI Default of Credit Card Clients. El artefacto central es `selected_v1/model.cbm`, un modelo CatBoost (ensemble de arboles con gradient boosting) seleccionado mediante un flujo de trabajo de gobernanza de cuatro ajustes sin afinado de hiperparametros. El autor del repositorio es ShaloyL y la licencia declarada es MIT.

El proposito declarado por el autor es la priorizacion de campanas de contacto gestionadas por personas (human-owned outreach prioritisation). La model card excluye explicitamente el uso para acciones adversas, decisiones de credito autonomas, uso en produccion, afirmaciones especificas para India y afirmaciones de cumplimiento normativo. Se trata, por tanto, de un artefacto de portafolio y de auditoria, no de un sistema listo para explotacion comercial.

El repositorio no redistribuye datos de entrenamiento: estos se obtienen directamente del dataset UCI mediante un manifiesto de origen fijado por checksum, con atribucion CC BY 4.0 y una poblacion historica de Taiwan de 2005. El repositorio tiene 0 descargas, 0 likes y un tamano declarado de 0.0 GB, sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CatBoost (ensemble de arboles de decision con gradient boosting) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo tabular, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no aplica: CatBoost no distribuye pesos en formatos cuantizados tipo GGUF o AWQ) |
| Idiomas soportados | no disponible (el repositorio no declara idiomas; no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.cbm` (formato nativo de CatBoost) en `selected_v1/model.cbm`; artefactos legacy en `legacy_v1/` en formato Python pickle |
| Tarea (pipeline) | `tabular-classification` |
| Dataset de entrenamiento | UCI Default of Credit Card Clients (poblacion de Taiwan, 2005), CC BY 4.0 |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (registro HF) | 2026-09-18 |
| Ultima actualizacion (registro HF) | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura es CatBoost, una familia de gradient boosting sobre arboles de decision, segun declara la propia libreria (`library_name: catboost`) y las etiquetas del repositorio. El artefacto `selected_v1/model.cbm` es descrito por el autor como el ganador "sin cambios" de un flujo de gobernanza de cuatro ajustes sin afinado de hiperparametros (four-fit, no-tuning governance workflow). No se detallan en la informacion disponible el numero de arboles, la profundidad, la tasa de aprendizaje ni el resto de hiperparametros, ni el numero de filas o caracteristicas efectivamente utilizadas.

Los datos de entrenamiento no se redistribuyen en HuggingFace. Se adquieren directamente del dataset UCI Default of Credit Card Clients a traves de un manifiesto de origen fijado por checksum. El dataset se atribuye bajo CC BY 4.0 y representa una poblacion historica de Taiwan del ano 2005. No hay informacion sobre tecnicas de ajuste tipo RLHF o DPO, que no aplican a un modelo tabular de este tipo. La innovacion destacable de este repositorio es de gobernanza y reproducibilidad, no algorfun: el consumidor debe recuperar un commit exacto de HuggingFace y verificar de forma independiente los SHA-256 de los ficheros, y los cargadores estandar permanecen en local sin descargar artefactos de forma implicita. La autoridad de validacion reside en el repositorio de GitHub mediante manifiestos revisados y digests SHA-256.

## Capacidades

- Clasificacion tabular binaria orientada a riesgo de impago de tarjeta de credito, a partir de variables estructuradas del dataset UCI.
- Generacion de puntuaciones para priorizar que casos revisa primero un equipo humano de contacto (uso previsto declarado).
- Empaquetado de artefactos binarios verificables: permite comprobar integridad mediante SHA-256 frente a un manifiesto controlado por Git.
- Integracion en flujos de gobernanza de modelos: el repositorio incluye controles de registro y un contrato de inferencia descritos en el proyecto de GitHub.
- No soporta generacion de texto: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues declaradas.
- No tiene capacidades de vision, audio ni modo de razonamiento explicito.
- No se declaran capacidades de explicabilidad mas alla de la revision de subgrupos documentada en el repositorio de GitHub.

## Casos de uso

- Priorizacion de contacto humano: el modelo puntua casos de posible impago para que un equipo de gestion ordene su cola de trabajo. Es el unico uso aprobado explicitamente por el autor, y encaja porque la decision final permanece en manos de una persona.
- Auditoria de artefactos en un registro de modelos: un equipo de MLOps puede usar el repositorio para practicar la verificacion de commits exactos y digests SHA-256 antes de admitir un artefacto en su catalogo interno.
- Reproducibilidad de experimentos academicos: sirve como referencia congelada sobre el dataset UCI Default of Credit Card Clients, permitiendo comparar pipelines propios contra un artefacto con procedencia documentada.
- Material docente sobre gobernanza de modelos: el repositorio ilustra un flujo con manifiestos, revision de subgrupos y evidencia de test final, util en formacion sobre riesgos de modelos en el sector financiero.
- Pruebas de contrato de inferencia: permite validar en un entorno de staging que un cargador local respeta un esquema de entrada y salida fijo y no realiza descargas implicitas de artefactos.
- Analisis de deriva temporal: al proceder de una poblacion de Taiwan de 2005, el artefacto puede emplearse como punto de partida historico para estudiar como evolucionaria la distribucion de variables frente a datos mas recientes, sin tomar decisiones reales de credito.
- Evaluacion de riesgos de seguridad en artefactos legacy: los ficheros de `legacy_v1/` usan semantica de pickle y permiten ejecucion de codigo arbitrario, lo que los convierte en un caso de estudio controlado sobre carga insegura de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de evidencia de test final, revision de subgrupos y un dossier de release en el repositorio de GitHub, pero no reproduce cifras de AUC, Gini, KS, accuracy ni ningun otro metrica en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. CatBoost ejecuta inferencia sobre CPU por defecto para este tipo de artefacto; no se declara tamano del modelo ni requisitos de memoria.
- GPU recomendadas: no aplica para inferencia de un ensemble de arboles entrenado; el entrenamiento con GPU es una capacidad de CatBoost, pero no se documenta en este repositorio.
- GPU de consumo: no se requiere GPU. Un equipo de sobremesa o portatil convencional es suficiente para cargar y ejecutar el artefacto, dado que el repositorio declara 0.0 GB de tamano.
- Opciones de despliegue: carga mediante la libreria CatBoost consumiendo el fichero `.cbm`. Las herramientas orientadas a LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este tipo de modelo.
- Restriccion de despliegue declarada: los cargadores estandar deben permanecer en local y no descargar artefactos de forma implicita; la obtencion del artefacto se realiza recuperando un commit exacto y verificando SHA-256.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas en la informacion proporcionada, por lo que la comparacion es estructural y no medida. Cualquier cifra de rendimiento de las alternativas deberia verificarse en su documentacion original.

| Modelo | Categoria | Licencia | Contexto | Rendimiento publicado |
|---|---|---|---|---|
| ShaloyL/credit-card-default-prediction (CatBoost) | Clasificacion tabular de riesgo de credito | MIT | no aplica | no disponible |
| Alternativas basadas en XGBoost sobre el mismo dataset UCI | Clasificacion tabular de riesgo de credito | no disponible | no aplica | no disponible |
| Alternativas basadas en LightGBM sobre el mismo dataset UCI | Clasificacion tabular de riesgo de credito | no disponible | no aplica | no disponible |
| Regresion logistica como linea base sobre el mismo dataset UCI | Clasificacion tabular de riesgo de credito | no disponible | no aplica | no disponible |

## Limitaciones y advertencias

- Uso restringido por el propio autor: no esta aprobado para acciones adversas, decisiones de credito autonomas, uso en produccion, afirmaciones especificas para India ni afirmaciones de cumplimiento normativo.
- El unico uso previsto es la priorizacion de contacto con supervision humana, lo que implica que cualquier decision con efecto legal o economico sobre una persona queda fuera del alcance autorizado.
- Sesgo temporal y geografico: el dataset de entrenamiento corresponde a una poblacion de Taiwan de 2005 y no representa poblaciones ni condiciones de credito actuales.
- Riesgo de seguridad en `legacy_v1/`: los ficheros en formato Python pickle pueden ejecutar codigo arbitrario. El autor advierte que el alojamiento publico no establece su seguridad y que solo deben cargarse tras verificacion exacta contra el manifiesto legacy controlado por Git.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo, pero existe riesgo de extrapolacion incorrecta si se aplica a distribuciones de datos distintas de las de entrenamiento.
- No se redistribuyen datos de entrenamiento, por lo que la verificacion de sesgos por subgrupos depende de la documentacion externa del repositorio de GitHub.
- Ausencia de validacion externa: 0 descargas y 0 likes en HuggingFace, sin evidencia de uso independiente.
- Ausencia de benchmarks publicados: el rendimiento del modelo no puede contrastarse con la informacion disponible.
- Limitaciones de idioma: no disponible, al no ser un modelo de lenguaje.
- Requisito de verificacion manual: el consumo correcto exige recuperar un commit exacto y verificar los SHA-256 de forma independiente; no se admite la descarga implicita de artefactos por parte de cargadores estandar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ShaloyL/credit-card-default-prediction
- Repositorio de GitHub del proyecto: https://github.com/shaloy-lewis/credit-card-default-prediction
- Dataset de origen citado en la model card: UCI Default of Credit Card Clients (atribucion CC BY 4.0, sin URL proporcionada en la informacion disponible)
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas genericas de YouTube sin relacion con el modelo.
