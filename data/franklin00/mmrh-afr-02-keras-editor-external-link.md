# FrankLin00/mmrh-afr-02-keras-editor-external-link

## Resumen

`FrankLin00/mmrh-afr-02-keras-editor-external-link` es un artefacto de investigacion en seguridad publicado en Hugging Face bajo el identificador interno `keras/22899-file-editor-hdf5-externallink-afr`. No se trata de un modelo de aprendizaje automatico funcional, sino de un especimen inerte ("inert scanner specimen") disenado para preservar el vector de metadatos asociado a una vulnerabilidad concreta: la presencia de un `ExternalLink` de HDF5 bajo la clave `layers` en un fichero de modelo Keras. El repositorio tiene 0.0 GB de tamano, lo que confirma que no contiene pesos.

El proposito declarado por el autor es exclusivamente de investigacion academica en seguridad. El especimen no ejecuta operaciones de red ni accede a credenciales; cualquier sonda activa asociada ejecuta unicamente `whoami` en forma de argv (nunca mediante `shell=True`) y escribe su salida en una variable de entorno bajo `/tmp` o `$TMPDIR`. Los especimenes de la familia AFW utilizan el payload inerte literal `PWNED-INERT`.

Este repositorio es relevante para investigadores que trabajan en la seguridad de formatos de serializacion de modelos (Keras, HDF5, NumPy `.npy`, checkpoints, plantillas `.jinja`) y en la cadena de suministro de artefactos de Hugging Face. No debe emplearse en produccion ni como base para ningun sistema real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; especimen de seguridad) |
| Parametros totales | no disponible (repositorio de 0.0 GB, sin pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefacto HDF5/Keras con `ExternalLink` bajo `layers`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto reproduce un hallazgo de seguridad en el formato Keras/HDF5: un enlace externo (`ExternalLink`) embebido en el grupo `layers` de un fichero HDF5. Este tipo de enlace permite que un fichero HDF5 referencie un objeto alojado en otro fichero, lo que en contextos de carga de modelos puede derivar en resolucion de rutas o recursos no controlados por el consumidor.

El especimen se distribuye acompanado, a nivel de coleccion, de un `MANIFEST.json` que registra hashes y la ruta del hallazgo original. Cuando la primitiva vulnerable obliga a un contenedor o sufijo concreto (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el manifiesto documenta esa restriccion de formato en lugar de afirmar control de bytes en crudo. No hay datos de tokens de entrenamiento, composicion de dataset ni tecnicas de alineacion (RLHF/DPO) porque no aplica.

## Capacidades

- No genera texto, codigo ni realiza razonamiento: es un artefacto inerte.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- Su unica funcion es preservar el vector de metadatos `HDF5 ExternalLink under layers` para analisis de seguridad.
- La sonda asociada ejecuta exclusivamente `whoami` en forma argv y escribe la salida en `HFSCAN_KERAS__22899_FILE_EDITOR_HDF5_EXTERNALLINK_AFR` bajo `/tmp` o `$TMPDIR`.
- Los especimenes AFW emplean el payload inerte literal `PWNED-INERT`.

## Casos de uso

- Investigacion de vulnerabilidades en serializacion de modelos: permite reproducir y analizar el comportamiento de un `ExternalLink` de HDF5 bajo la clave `layers` en un entorno controlado, sin necesidad de construir el artefacto desde cero.
- Desarrollo de escaneres de seguridad para Hugging Face: sirve como caso de prueba (fixture) para validar detectores que inspeccionan metadatos de ficheros Keras/HDF5 antes de cargarlos.
- Formacion y docencia en seguridad de cadena de suministro de ML: el especimen ilustra de forma concreta como un formato de serializacion aparentemente inocuo puede transportar referencias externas.
- Validacion de pipelines de cuarentena: permite comprobar que un sistema de ingesta rechaza o aisla artefactos marcados como `not-for-production` y `security-research`.
- Auditoria de herramientas de carga de modelos: util para verificar si una libreria resuelve `ExternalLink` de forma segura o si sigue rutas fuera del contenedor esperado.
- Reproducibilidad de hallazgos academicos: el `MANIFEST.json` de la coleccion y los hashes permiten que otros investigadores verifiquen la integridad del especimen y reproduzcan el analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de aprendizaje automatico, no aplican metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos ni inferencia).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica.
- Para su inspeccion basta un entorno aislado (contenedor o maquina virtual) con herramientas de analisis de HDF5 y acceso de solo lectura al repositorio.

## Comparativa con modelos similares

| Artefacto | Tipo | Proposito | Licencia | Uso en produccion |
|---|---|---|---|---|
| `FrankLin00/mmrh-afr-02-keras-editor-external-link` | Especimen de seguridad (HDF5/Keras) | Investigacion de `ExternalLink` bajo `layers` | no disponible | No (marcado `not-for-production`) |
| `FrankLin00/mmrh-afw-*` (familia AFW) | Especimenes de seguridad | Payload inerte `PWNED-INERT` | no disponible | No |
| Modelos Keras legitimos en Hugging Face | Modelos neuronales | Inferencia real | variable | Si, segun licencia |

No se dispone de informacion sobre otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: no genera salidas ni puede integrarse en aplicaciones.
- Marcado explicitamente como `not-for-production`; su uso fuera de investigacion de seguridad esta desaconsejado.
- Licencia no disponible: no se puede asumir permiso de uso comercial ni redistribucion.
- El especimen preserva un vector de ataque real (`HDF5 ExternalLink`); manipularlo fuera de un entorno aislado puede exponer al consumidor a riesgos de resolucion de rutas.
- La sonda asociada solo ejecuta `whoami` y no realiza acceso a credenciales ni operaciones de red, pero cualquier modificación del artefacto invalida esa garantia.
- El repositorio tiene 0.0 GB y 0 descargas; no hay comunidad ni soporte.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque no aplica a un artefacto inerte.

## Enlaces

- Hugging Face: https://huggingface.co/FrankLin00/mmrh-afr-02-keras-editor-external-link
- Referencia al hallazgo original: `keras/22899-file-editor-hdf5-externallink-afr` (identificador interno citado en la model card)
- Manifiesto de la coleccion: `MANIFEST.json` (hashes y ruta del hallazgo, referenciado en la model card; no se proporciona URL directa)
