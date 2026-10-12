# general-forecast/kumo-tabular-large-regressor

## Resumen

`general-forecast/kumo-tabular-large-regressor` es una conversion de pesos a formato safetensors del modelo de regresion tabular `large/regressor.pt` publicado por NVIDIA dentro de la familia Kumo Tabular (`nvidia/Kumo-Tabular`, revision `3c3e10bbdb590ace29e7026847f92db3c603096d`). La conversion la realiza el usuario u organizacion `general-forecast` para su libreria `gfi`, y los pesos se mantienen sin modificar respecto al original. No se trata por tanto de un modelo nuevo ni de un fine-tuning, sino de una redistribucion del checkpoint de NVIDIA en otro formato.

El modelo es un regresor para datos tabulares basado en aprendizaje en contexto (in-context learning): la red predice el target a partir de las filas de entrenamiento y las filas a predecir suministradas en el mismo contexto, y su salida no es un unico valor escalar sino una distribucion empirica expresada mediante 999 cuantiles. Esa salida por cuantiles permite obtener intervalos de prediccion y estimaciones de incertidumbre sin entrenamiento adicional, algo relevante en entornos donde la calibracion importa tanto como el error medio.

Su relevancia actual se enmarca en la tendencia de los modelos fundacionales tabulares, que sustituyen el entrenamiento por conjunto de datos por una unica pasada de inferencia en contexto. Con 215.683.543 parametros (unos 215,7 M) y un repositorio de 0,9 GB, es un modelo pequeno en terminos absolutos, facil de desplegar en hardware de consumo, aunque la informacion disponible no incluye resultados de benchmarks ni detalles de la arquitectura interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; `config.json` expone `architecture_name` y `config` (equivalente a `MODEL_KWARGS["large"]` de NVIDIA `structured-data-models`) |
| Parametros totales | 215.683.543 (~215,7 M) |
| Parametros activos | no aplica; no es un modelo MoE segun la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors (0,9 GB para 215,7 M de parametros, compatible con fp32) |
| Idiomas soportados | no disponible; es un modelo para datos tabulares, no para texto |
| Licencia | OpenMDW 1.1 (etiqueta `license: other`, `license_name: openmdw-1.1`), la misma que los pesos originales de Kumo Tabular |
| Formato de pesos | safetensors (`model.safetensors`), bajo los nombres de parametro del modelo PyTorch de NVIDIA |
| Salida | 999 cuantiles |
| Modelo base | nvidia/Kumo-Tabular |
| Variables del dataset | no disponible |
| Repositorio de origen | revision `3c3e10bbdb590ace29e7026847f92db3c603096d` de `nvidia/Kumo-Tabular` |
| Libreria declarada | gfi |
| Tamano del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo: la model card se limita a indicar que se trata de la conversion del checkpoint `large/regressor.pt` de NVIDIA y que la red emite 999 cuantiles. Los metadatos de HuggingFace lo etiquetan como `tabular` e `in-context-learning` dentro de la familia `kumo-tabular`, y el `config.json` del repositorio contiene un campo `architecture_name` junto con la configuracion de tamanos, pero su contenido no se reproduce en la informacion proporcionada. Por tanto, no se puede confirmar si se trata de un transformer, de un modelo basado en atencion sobre filas y columnas, o de otra familia de arquitectura.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de tokens o de filas utilizado, la composicion del dataset, ni si hubo etapas de ajuste por refuerzo o preferencias, algo que en un regresor tabular seria en todo caso poco habitual. Lo unico verificable es que el autor de la conversion declara que los pesos son identicos a los del modelo original y que la licencia y el aviso de copyright de NVIDIA se conservan en el archivo `LICENSE` del repositorio. La innovacion tecnica reseñable, segun la propia model card, es la salida por cuantiles (999 valores) en lugar de una prediccion puntual.

## Capacidades

- Regresion tabular: predice la variable objetivo a partir de un conjunto de caracteristicas tabulares.
- Prediccion probabilistica: emite 999 cuantiles, lo que permite construir intervalos de prediccion y estimar la incertidumbre de cada estimacion.
- Aprendizaje en contexto: segun las etiquetas del repositorio (`in-context-learning`), el modelo puede resolver una tarea nueva aportando los ejemplos en el propio contexto, sin reentrenar los pesos por conjunto de datos.
- Integracion con la libreria `gfi`: los pesos se publican con los nombres de parametro del modelo PyTorch de NVIDIA para su uso desde esa libreria.
- Generacion de texto: no soportada; no es un modelo de lenguaje.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Vision, audio y otras modalidades: no soportadas.
- Capacidades multilingues: no aplicables; el modelo no procesa lenguaje natural, y no se documenta ningun tratamiento de variables categoricas textuales.

## Casos de uso

- Valoracion de inmuebles con intervalos de confianza: el modelo recibe las caracteristicas de las viviendas (superficie, ubicacion, antiguedad) y devuelve los 999 cuantiles del precio; los cuantiles 0,1 y 0,9 permiten ofrecer una horquilla de valoracion en lugar de una cifra unica, algo util en tasacion y en portales inmobiliarios.
- Scoring de riesgo crediticio: a partir de variables socioeconomicas y de comportamiento, el modelo estima la distribucion de la perdida esperada o de la probabilidad de impago, lo que permite fijar politicas de concesion segun el apetito de riesgo en lugar de un umbral unico.
- Prevision de demanda en retail: con el historico de ventas y variables de calendario o promocion, se obtienen cuantiles de demanda que alimentan directamente decisiones de reposicion y de stock de seguridad.
- Prediccion de churn con incertidumbre: el modelo estima la distribucion del tiempo hasta la baja o del gasto futuro por cliente, de modo que los equipos de retencion pueden priorizar por valor esperado y no solo por probabilidad.
- Mantenimiento predictivo: regresion sobre lecturas de sensores para estimar la vida util restante de un componente, con intervalos que permiten programar intervenciones antes de que el cuantil inferior caiga por debajo del umbral operativo.
- Estimacion de costes y siniestralidad en seguros: el modelo predice el coste esperado de un siniestro a partir de las caracteristicas de la poliza y del asegurado, y los cuantiles altos sirven para dimensionar reservas tecnicas.
- Modelo base en pipelines de AutoML o de ciencia de datos: al no requerir entrenamiento por conjunto de datos, se puede usar como referencia rapida para comparar contra modelos especificos (gradient boosting, redes tabulares) antes de invertir tiempo en ajuste de hiperparametros.
- Investigacion sobre calibracion en datos tabulares: los 999 cuantiles permiten estudiar cobertura empirica y calibracion de predicciones probabilisticas en distintos regimenes de tamano de muestra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas (RMSE, MAE, AUC, cobertura de intervalos u otras) ni comparaciones con el checkpoint original de NVIDIA. La busqueda web realizada tampoco ha devuelto resultados tecnicos relacionados con el modelo, por lo que no es posible verificar su rendimiento frente a alternativas.

## Requisitos de hardware

- VRAM estimada en inferencia, calculada a partir de los 215.683.543 parametros: aproximadamente 862 MB en fp32, 431 MB en fp16 o bf16 y 216 MB en int8. Son estimaciones aritmeticas, no datos publicados por el autor, y no incluyen el consumo adicional de activaciones, que en un modelo de contexto tabular depende del numero de filas suministradas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre es suficiente en fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. No se requiere hardware de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos anos, e incluso en GPUs integradas o en CPU en modalidades con pocas filas de contexto.
- Opciones de despliegue: la libreria declarada es `gfi`; tambien es posible cargar los pesos en PyTorch, ya que se conservan los nombres de parametro del modelo original de NVIDIA (`structured-data-models`). Los servidores orientados a modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama) no aplican a este tipo de modelo tabular.
- Latencia y throughput: no disponibles. Dependen del numero de filas en contexto y no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos verificables de modelos comparables, y la busqueda web no ha devuelto material tecnico. La siguiente tabla compara unicamente los dos checkpoints de los que se tiene constancia directa en esta ficha; el resto de campos de alternativas queda marcado como no disponible.

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| general-forecast/kumo-tabular-large-regressor | 215,7 M | no disponible | 999 cuantiles | OpenMDW 1.1 | HuggingFace, 0 descargas |
| nvidia/Kumo-Tabular (original, `large/regressor.pt`) | no disponible | no disponible | 999 cuantiles | OpenMDW 1.1 | HuggingFace |
| Otros modelos fundacionales tabulares con aprendizaje en contexto | no disponible | no disponible | no disponible | no disponible | no disponible |

En la misma categoria existen otros modelos fundacionales tabulares con aprendizaje en contexto, pero los datos concretos de parametros, contexto y licencia no forman parte de la informacion facilitada, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso, ni vision o audio. Cualquier uso conversacional queda fuera de su alcance.
- Riesgo de sobreconfianza: al emitir 999 cuantiles, el modelo puede producir intervalos excesivamente estrechos. No hay datos publicados de calibracion ni de cobertura empirica que permitan cuantificar este riesgo.
- Sesgos: no se documenta la composicion del dataset de entrenamiento de NVIDIA, por lo que no es posible evaluar sesgos por subgrupo, ni su comportamiento en dominios alejados de los datos de entrenamiento.
- Limites de contexto: se desconoce cuantas filas y columnas admite el modelo en el contexto de inferencia. Es un parametro critico para cualquier despliegue en produccion y no esta disponible.
- Idiomas y variables categoricas: no se especifica el tratamiento de variables categoricas ni el soporte de texto en las columnas, algo habitual en datos tabulares reales.
- Licencia: OpenMDW 1.1, con la etiqueta `license: other`. Antes de un uso comercial conviene leer el archivo `LICENSE` del repositorio, que conserva el aviso de copyright de NVIDIA; la informacion disponible no reproduce los terminos completos de la licencia.
- Ausencia de validacion externa: el repositorio acumula 0 descargas y 0 likes, no incluye benchmarks y no hay publicaciones tecnicas asociadas en los resultados de busqueda, por lo que no existe evidencia independiente de su calidad.
- Trazabilidad de la conversion: los pesos declarados son identicos a los originales y solo cambia el contenedor, pero no se publica ningun test de equivalencia numerica entre `model.safetensors` y el `regressor.pt` original.
- Fechas de publicacion: el repositorio figura creado y actualizado el 2026-10-11, lo que conviene tener en cuenta al evaluar su madurez y mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/general-forecast/kumo-tabular-large-regressor
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Kumo-Tabular
- Repositorio de NVIDIA con los modelos de datos estructurados: https://github.com/NVIDIA/structured-data-models
- Libreria `gfi`: https://github.com/generalforecast/gfi
- Revision exacta utilizada como origen de la conversion: `3c3e10bbdb590ace29e7026847f92db3c603096d`
- Papers, blogs o demos adicionales: no disponible; la busqueda web no devolvio resultados relevantes sobre este modelo.
