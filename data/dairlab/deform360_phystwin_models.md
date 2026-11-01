# DAIRLab/deform360_phystwin_models

## Resumen

`DAIRLab/deform360_phystwin_models` no es un modelo de lenguaje, sino un repositorio de artefactos de investigacion: los ajustes (fits) de tipo spring-mass producidos por el proyecto PhysTwin sobre episodios del dataset Deform360. Cada carpeta corresponde a un objeto o episodio y a una ejecucion de ajuste concreta, e incluye todos los checkpoints guardados, los registros de ejecucion y la evidencia de seleccion de padres. Lo desarrolla DAIRLab, el laboratorio de investigacion en robotica y vision de Brown University.

El repositorio resuelve un problema de reproducibilidad: conserva, byte a byte, los estados intermedios de optimizaciones CMA y Adam aplicadas a la reconstruccion fisica de objetos deformables, junto con metadatos que trazan cada valor hasta su registro nativo. Es relevante para investigadores que quieran auditar o reutilizar los ajustes, no para inferencia generativa.

El tamano del repositorio es de 1,3 GB y la licencia declarada es MIT, con la salvedad de que los assets procesados de Deform360 no tienen licencia declarada en la revision fijada (`e92deaf7e437e7e51ad464706ae647f522a279d9`); la cobertura MIT de esos assets es una interpretacion del propietario, no una declaracion upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal generativa; ajustes spring-mass (fisica) sobre reconstrucciones splatfacto, optimizados con CMA y Adam |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT (para los paquetes de fit producidos por el proyecto; ver advertencias) |
| Formato de pesos | Checkpoints y ficheros de estado nativos por ejecucion, mas `run.json`, `checkpoints.tsv` y `dependencies.json` |

## Arquitectura y entrenamiento

Cada paquete de ejecucion contiene una carpeta `native/` con todos los checkpoints y ficheros de estado guardados: generaciones CMA con candidatos y estado de estrategia, o snapshots Adam con estado de continuacion y perdidas por actualizacion, ademas de registros de frontera de Deform360, optimizador, RNG y roles. La carpeta `evidence/` recoge los registros de lanzamiento, seleccion de padres y cualificacion citados por los registros de la ejecucion.

El repositorio incluye dos ejecuciones completas sobre `001-rope/episode_0`: `deform-rope-ep0-e2`, con etapas CMA (100 generaciones, 1100 evaluaciones) y Adam (500 pasadas, 48 000 actualizaciones), y `deform-rope-ep0-dp5`, una etapa `photometric_adam` (500 pasadas, 48 000 actualizaciones) cuyo padre es `deform-rope-ep0-e2` en `adam/pass_end_0500`. Las revisiones de codigo asociadas son `3ad61eca7228` y `3d870a7b97b5`. Los arrays canonicos de gaussianas embebidos en los checkpoints fotometricos derivan de la reconstruccion splatfacto upstream referenciada en `upstream_inputs`.

## Capacidades

- Almacenamiento y trazabilidad de ajustes fisicos spring-mass sobre episodios de Deform360.
- Conservacion byte a byte de checkpoints CMA y Adam con sus registros de perdida y estado de estrategia.
- Trazabilidad de procedencia: cada valor de `run.json` nombra el registro nativo del que proviene.
- Registro de presupuestos configurados frente a completados (generaciones, evaluaciones, pasadas, actualizaciones).
- Etiquetado BEST/FINAL bajo las condiciones de puntuacion declaradas por cada ajuste.
- Declaracion explicita de capacidades y desconocidos (`capabilities` y `unknowns`).
- No soporta generacion de texto, codigo, vision, tool calling ni agentes: no es un modelo de lenguaje.

## Casos de uso

- Auditoria de reproducibilidad: inspeccionar `checkpoints.tsv` y `native/` para verificar que cada checkpoint corresponde al paso, padre y estado declarados.
- Reutilizacion de ajustes fisicos: partir de un snapshot Adam o de una generacion CMA concreta para experimentos de continuacion sobre el mismo episodio.
- Estudio de optimizacion hibrida: comparar el comportamiento de CMA (exploracion global) frente a Adam (refinamiento local) en el ajuste de parametros spring-mass.
- Analisis de perdidas: extraer las perdidas por actualizacion de los snapshots Adam para estudiar convergencia y estabilidad.
- Trazabilidad de datos derivados: seguir la cadena desde los checkpoints fotometricos hasta los arrays gaussianos de la reconstruccion splatfacto upstream via `dependencies.json`.
- Verificacion de linaje entre ejecuciones: comprobar que `deform-rope-ep0-dp5` declara correctamente a `deform-rope-ep0-e2` como padre en `adam/pass_end_0500`.
- Base para validacion en destino limpio: usar los paquetes como entrada del paso de validacion separado previsto en el plan PR4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que ningun modelo fue cargado, renderizado, reanudado ni reevaluado para la misma.

## Requisitos de hardware

- No aplica VRAM de inferencia: el repositorio contiene artefactos de ajuste, no pesos de un modelo desplegable.
- Almacenamiento: 1,3 GB para el repositorio completo; el espacio efectivo depende de cuantos paquetes de ejecucion se descarguen.
- GPU recomendadas: no disponibles para este repositorio; el entrenamiento original se realizo con el codigo del proyecto PhysTwin (revisiones `3ad61eca7228` y `3d870a7b97b5`), cuyos requisitos no se detallan en la informacion proporcionada.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Licencia | Tamano | Uso previsto |
|---|---|---|---|---|
| DAIRLab/deform360_phystwin_models | Ajustes spring-mass y checkpoints | MIT (interpretacion del propietario) | 1,3 GB | Auditoria y reutilizacion de fits |
| brownu/deform360 | Dataset crudo de episodios | MIT declarada | no disponible | Datos de entrada |
| brownu/deform360_processed | Assets procesados de Deform360 | Sin licencia declarada en la revision fijada | no disponible | Dependencia de los fits |

No se dispone de informacion sobre otros repositorios de ajustes PhysTwin comparables.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo desplegable: no admite inferencia generativa, tool calling ni agentes.
- La model card declara que ningun modelo fue cargado, renderizado, reanudado ni reevaluado; el uso en destino limpio es un paso de validacion separado aun no realizado.
- BEST y FINAL son etiquetas registradas bajo las condiciones de puntuacion de cada ajuste; el empaquetado no selecciona ningun modelo preferido.
- La recuperacion de ejecuciones interrumpidas esta cualificada por la identidad de ejecucion y las entradas registradas; extender el horizonte de una ejecucion completada y la reproduccion total no estan soportadas ni declaradas.
- Las ejecuciones historicas con rigidez fijada en uso (clamp-at-use) no se reinterpretan como ejecuciones de actualizacion proyectada.
- Licencia: MIT cubre los paquetes de fit producidos por el proyecto, pero `brownu/deform360_processed` no declara licencia en la revision fijada; la cobertura MIT de los assets derivados es una interpretacion del propietario (decision D12), no una declaracion upstream. Los datos upstream no se redistribuyen ni se relicencian.
- Riesgo de alucinacion y sesgos: no aplica en el sentido de modelos generativos; el riesgo relevante es de interpretacion incorrecta de la procedencia si no se consultan `run.json` y `dependencies.json`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DAIRLab/deform360_phystwin_models
- Dataset crudo Deform360: https://huggingface.co/datasets/brownu/deform360
- Dataset procesado Deform360: https://huggingface.co/datasets/brownu/deform360_processed
- Run `deform-rope-ep0-dp5`: https://huggingface.co/DAIRLab/deform360_phystwin_models/blob/main/processed/001-rope/episode_0/runs/deform-rope-ep0-dp5/README.md
- Run `deform-rope-ep0-e2`: https://huggingface.co/DAIRLab/deform360_phystwin_models/blob/main/processed/001-rope/episode_0/runs/deform-rope-ep0-e2/README.md
- Paper, blog o repositorio del proyecto PhysTwin: no disponible en la informacion proporcionada.
