# FrankLin00/mmrh-afr-03-keras-load-weights-external-link

## Resumen

`FrankLin00/mmrh-afr-03-keras-load-weights-external-link` no es un modelo de lenguaje. Es un especimen de escaneo inerte (scanner specimen) publicado en HuggingFace con fines de investigacion academica en seguridad, etiquetado explicitamente como `security-research` y `not-for-production`. Su contenido reproduce el vector de ataque asociado a la ruta de carga `keras/22900-load-weights-hdf5-externallink-afr`, es decir, un `ExternalLink` de HDF5 embebido bajo el grupo `model_weights` de un fichero de pesos Keras.

El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes, y no declara pipeline, licencia ni idiomas. Su relevancia no es funcional sino forense: sirve como muestra reproducible para estudiar como un fichero de pesos HDF5 puede referenciar recursos externos durante la carga con `load_weights`, un patron clasico de riesgo en la cadena de suministro de modelos.

La model card indica que cualquier sonda activa ejecuta unicamente `whoami` en forma argv (nunca `shell=True`) y escribe su salida en la variable de entorno `HFSCAN_KERAS__22900_LOAD_WEIGHTS_HDF5_EXTERNALLINK_AFR` bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red. Los especimenes AFW usan el payload inerte literal `PWNED-INERT`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un fichero de pesos HDF5 con un ExternalLink) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | HDF5 (Keras), con `ExternalLink` bajo `model_weights` |

## Arquitectura y entrenamiento

No existe arquitectura de red ni proceso de entrenamiento. El artefacto es un contenedor HDF5 concebido para ser cargado mediante el mecanismo de pesos de Keras, en el que el grupo `model_weights` contiene un enlace externo (`ExternalLink`) en lugar de tensores reales. Este tipo de enlace permite que un fichero HDF5 referencie objetos fuera del propio fichero, lo que en un contexto de carga de pesos abre la puerta a resolucion de rutas o recursos no controlados por el consumidor del modelo.

El especimen forma parte de una coleccion mayor documentada en un `MANIFEST.json` a nivel de coleccion, que registra hashes y la ruta del hallazgo de origen. La model card distingue entre especimenes AFR y AFW: los primeros preservan el vector tal cual, mientras que los AFW emplean el payload inerte `PWNED-INERT`. Cuando la primitiva vulnerable impone un contenedor o sufijo concreto (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el manifiesto registra esa restriccion de formato en lugar de asumir control de bytes en crudo. No se documentan tokens de entrenamiento, composicion de dataset ni fases de RLHF o DPO porque no aplica.

## Capacidades

- No genera texto, no razona, no produce codigo ni resuelve matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- Su unica funcion es servir como muestra inerte para reproducir y validar detecciones de seguridad en torno a la carga de pesos Keras desde HDF5 con enlaces externos.
- La sonda asociada ejecuta exclusivamente `whoami` en forma argv y registra la salida en una variable de entorno.

## Casos de uso

- Validacion de escaneres de seguridad: alimentar pipelines de analisis de artefactos (por ejemplo, escaneres de modelos en un registro interno) para comprobar que detectan `ExternalLink` en grupos `model_weights` de ficheros HDF5.
- Pruebas de regresion en herramientas de analisis de cadena de suministro de modelos: verificar que un cambio en el parser de HDF5 sigue marcando el especimen como sospechoso y no lo clasifica como pesos legitimos.
- Formacion y docencia en seguridad de IA: usar el artefacto como ejemplo controlado en un laboratorio sobre riesgos de deserializacion y carga de pesos, dado que el payload es inerte y limitado a `whoami`.
- Desarrollo de reglas de deteccion: derivar firmas o heuristicas (presencia de `ExternalLink`, rutas externas en `model_weights`) y contrastarlas contra este especimen y su manifiesto de hashes.
- Auditoria de repositorios de modelos: comprobar que una politica interna bloquea la descarga o el despliegue de artefactos etiquetados `not-for-production` y `security-research`.
- Verificacion de aislamiento en sandboxes: ejecutar la sonda en un entorno confinado y confirmar que la escritura queda restringida a `/tmp` o `$TMPDIR` y que no hay acceso a red ni a credenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es evaluable con MMLU, HumanEval, GSM8K ni metricas equivalentes, ya que no ejecuta inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia neuronal.
- GPU recomendadas: ninguna; el artefacto no requiere aceleracion por hardware.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no procede usar vLLM, llama.cpp, Ollama ni TGI. El unico uso previsto es su carga controlada en un entorno de analisis aislado con Keras/HDF5 para fines de investigacion.
- Latencia y throughput: no disponibles y no significativos.

## Comparativa con modelos similares

| Artefacto | Tipo | Proposito | Licencia | Uso en produccion |
|---|---|---|---|---|
| `FrankLin00/mmrh-afr-03-keras-load-weights-external-link` | Especimen HDF5 con ExternalLink | Investigacion de seguridad | no disponible | No (explicitamente prohibido) |
| Especimenes AFW de la misma coleccion | Especimenes con payload inerte `PWNED-INERT` | Investigacion de seguridad | no disponible | No |
| Modelos Keras legitimos con pesos HDF5 | Pesos reales | Inferencia | segun autor | Si |

No se dispone de datos para comparar con modelos de lenguaje de la misma categoria, ya que este artefacto no pertenece a esa categoria.

## Limitaciones y advertencias

- No es un modelo utilizable: no produce salidas de texto, codigo ni ninguna tarea de IA.
- Etiquetado `not-for-production`: no debe desplegarse en entornos productivos bajo ninguna circunstancia.
- Riesgo de seguridad inherente al vector que reproduce: la carga de pesos con `ExternalLink` en HDF5 puede derivar en resolucion de recursos no previstos si el consumidor no valida el fichero.
- Ausencia total de licencia declarada: no hay permisos explicitos de uso, redistribucion ni uso comercial.
- Sin idiomas, pipeline ni metricas declaradas: cualquier evaluacion funcional es imposible.
- Cero descargas y cero likes: no existe validacion comunitaria ni evidencia de uso independiente.
- La sonda asociada esta limitada a `whoami` y a escritura en `/tmp` o `$TMPDIR`, pero debe ejecutarse siempre en sandbox por tratarse de material de investigacion de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/FrankLin00/mmrh-afr-03-keras-load-weights-external-link
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, repos o demos) asociados a este artefacto.
