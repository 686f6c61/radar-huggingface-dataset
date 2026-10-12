# general-forecast/kumo-tabular-medium-regressor

## Resumen

Kumo Tabular medium regressor es un modelo de regresión para datos tabulares desarrollado originalmente por NVIDIA dentro de su familia Kumo Tabular. El repositorio analizado, publicado por el usuario general-forecast, no introduce pesos nuevos: contiene una conversion a formato safetensors de los pesos `medium/regressor.pt` del modelo base nvidia/Kumo-Tabular (revision `3c3e10bbdb590ace29e7026847f92db3c603096d`), manteniendo los nombres de parametro originales de PyTorch.

El modelo resuelve tareas de prediccion sobre datos estructurados mediante in-context learning: recibe una tabla de entrada y produce una salida de regresion. Su cabeza de red emite 999 cuantiles, lo que permite obtener no solo una estimacion puntual sino una distribucion predictiva completa util para cuantificar incertidumbre.

Con 62.492.439 parametros (aproximadamente 62,5 millones) y un repositorio de 0,3 GB, es un modelo compacto que puede ejecutarse en hardware de gama media. La conversion esta pensada para la libreria gfi del propio autor, y la licencia aplicada es OpenMDW 1.1, heredada de los pesos originales de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el `config.json` expone `architecture_name`, no detallado en la informacion) |
| Parametros totales | 62.492.439 (aproximadamente 62,5 M) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`, etiquetada como `license: other`) |
| Formato de pesos | safetensors (`model.safetensors`) mas `config.json` |

## Arquitectura y entrenamiento

La model card indica que los pesos son "los de NVIDIA's Kumo Tabular medium regressor (`medium/regressor.pt`)" y que la red "emite 999 cuantiles". La arquitectura concreta se describe en el `config.json` mediante el campo `architecture_name` y el bloque `config`, que reproduce los tamanos de `MODEL_KWARGS["medium"]` de la libreria de NVIDIA `structured-data-models`. No se proporcionan en la informacion disponible detalles sobre el tipo de red (transformer, MLP u otra), ni sobre el numero de capas, dimensiones ocultas o mecanismo de atencion.

Los tags del repositorio apuntan a un enfoque de in-context learning aplicado a datos tabulares (`tabular`, `in-context-learning`, `kumo-tabular`). No se documentan en el material proporcionado el volumen de tokens o filas de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. La unica operacion realizada por el autor del repositorio es la conversion de formato, y la model card afirma explicitamente que "los pesos no han sido modificados".

## Capacidades

- Regresion sobre datos tabulares: prediccion de variables objetivo continuas a partir de tablas de entrada.
- Salida cuantilica: la red emite 999 cuantiles, lo que permite construir una distribucion predictiva y derivar intervalos de confianza o medidas de incertidumbre.
- In-context learning tabular: por los tags del repositorio, el modelo esta disenado para recibir el contexto de la tabla en la propia inferencia.
- Soporte de tool calling / function calling: no aplicable (modelo de regresion tabular).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Valoracion de precios: estimar el precio de un inmueble, vehiculo o activo a partir de variables tabulares como superficie, ubicacion y antiguedad, usando la salida cuantilica para ofrecer un rango de precios en lugar de un unico valor.
- Scoring de riesgo crediticio: predecir la probabilidad o severidad de impago sobre variables socioeconomicas; los 999 cuantiles permiten segmentar la cartera por niveles de riesgo y no solo por una estimacion puntual.
- Prevision de demanda: proyectar ventas o consumo por producto y periodo a partir de series tabulares; los cuantiles superiores e inferiores ayudan a planificar stock con margenes de seguridad.
- Mantenimiento predictivo: estimar la vida util restante de un componente industrial (RUL) a partir de lecturas de sensores tabuladas, utilizando los cuantiles para acotar la ventana de intervencion.
- Deteccion de anomalias: comparar el valor observado con la distribucion cuantilica predicha; desviaciones grandes respecto al rango esperado senalan observaciones atipicas.
- Investigacion en machine learning tabular: servir como baseline reproducible en estudios de in-context learning o de regresion cuantilica, gracias a que los pesos son identicos a los de NVIDIA y estan en un formato estandar.
- Forecasting financiero y de seguros: estimar magnitudes como siniestralidad o flujos con bandas de incertidumbre derivadas de la salida cuantilica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 62.492.439 parametros, sin incluir activaciones ni memoria del runtime): aproximadamente 250 MB en fp32, 125 MB en fp16/bf16, 62,5 MB en int8 y 31 MB en int4.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer (por ejemplo, series RTX 30xx o 40xx) seria suficiente, e incluso es plausible la ejecucion en CPU.
- Cabe en GPU consumer: si, dado el reducido numero de parametros (cálculo estimado, no confirmado por el autor).
- Opciones de despliegue: la libreria declarada es `gfi` (https://github.com/generalforecast/gfi). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| general-forecast/kumo-tabular-medium-regressor | 62.492.439 | no disponible | OpenMDW 1.1 | HuggingFace, formato safetensors | Conversion del modelo base para la libreria gfi |
| nvidia/Kumo-Tabular (base) | no disponible | no disponible | OpenMDW 1.1 | HuggingFace, PyTorch (`medium/regressor.pt`) | Pesos originales; la conversion no los modifica |
| Otros modelos tabulares comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas con datos en la informacion proporcionada |

## Limitaciones y advertencias

- El repositorio es una redistribucion: general-forecast no ha entrenado el modelo, por lo que cualquier limitacion del modelo original de NVIDIA se hereda sin cambios.
- No se documentan sesgos conocidos, pero al tratarse de un modelo de regresion tabular, los sesgos dependerian del dataset de entrenamiento original, que no se detalla.
- Riesgo de predicciones erroneas: al operar sobre datos tabulares, una mala calidad, valores faltantes o un desajuste de distribucion entre la tabla de inferencia y los datos de entrenamiento pueden degradar las estimaciones. No hay informacion sobre su robustez.
- La salida de 999 cuantiles exige postprocesado para obtener una estimacion puntual o intervalos, lo que anade complejidad de integracion.
- No se dispone de datos sobre longitud de contexto, idiomas soportados ni limites de tamano de tabla, lo que dificulta dimensionar su uso en produccion.
- La licencia OpenMDW 1.1 esta etiquetada como `license: other` en HuggingFace; es imprescindible revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial.
- El repositorio registra 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-10-11) es posterior a la fecha de actualizacion y resulta inusual; conviene verificar la procedencia y el estado del repositorio.
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo (solo definiciones de diccionario del termino "general" en frances), por lo que no se ha podido contrastar informacion adicional.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/general-forecast/kumo-tabular-medium-regressor
- Modelo base en HuggingFace: https://huggingface.co/nvidia/Kumo-Tabular
- Repositorio NVIDIA structured-data-models: https://github.com/NVIDIA/structured-data-models
- Libreria gfi: https://github.com/generalforecast/gfi
- Licencia del repositorio: LICENSE (referenciado en la model card; consultar en el propio repositorio de HuggingFace)
