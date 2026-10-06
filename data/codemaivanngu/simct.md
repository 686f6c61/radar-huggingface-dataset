# codemaivanngu/simct

## Resumen

El repositorio `codemaivanngu/simct` no contiene un modelo de lenguaje con pesos, sino una distribucion de codigo fuente del proyecto SimCT / KDFlow, orientado a experimentos de destilacion de conocimiento (etiqueta `knowledge-distillation`). El artefacto principal es un Git bundle (`simct-b200-portable.bundle`) acompanado de un manifiesto (`source-manifest.json`) que conserva el commit original y el historial completo de Git, excluyendo expresamente runtime, checkpoints, datasets y artefactos remotos no versionados.

Segun la model card, el bundle corresponde a la rama `vdt/ops/b200-portable`, en el commit `4b9d70a58df4aa77d2bc35228207b959fdf6bee5`, y procede del repositorio de origen `github.com/sontungkieu/SimCT`. El repositorio de HuggingFace se usa como transporte de solo lectura porque el servidor Git de HF rechaza blobs historicos de imagenes; por eso se publica un bundle en lugar de un espejo de rama convencional. El tamano del repositorio es de 0,6 GB.

Su relevancia es acotada y muy especifica: sirve para reproducir, auditar o continuar el trabajo de SimCT en un entorno controlado (incluida la portabilidad a NVIDIA B200 y el uso de lanzadores RunAI), no para inferencia directa. Los metadatos publicos indican 0 descargas y 0 likes, licencia no declarada y ausencia de pipeline de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo, sino una distribucion de codigo fuente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el artefacto publicado es un Git bundle, no pesos de modelo) |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura de red, numero de parametros ni regimen de entrenamiento en la informacion proporcionada. La model card describe un repositorio de codigo fuente para experimentos de SimCT / KDFlow, con la etiqueta `knowledge-distillation`, lo que situa el proyecto en el ambito de la destilacion de conocimiento, pero sin especificar el metodo, el profesor, el alumno ni los datos empleados.

Los unicos detalles tecnicos documentados se refieren al flujo de trabajo de ingenieria: lanzador MP-OPD con microbatch 4; un runner de evaluacion con perfiles explicitos de codigo de autor y de especificacion de paper; un archivo independiente de evaluacion (`simct-eval-94114c1.zip`) que debe extraerse en un directorio nuevo y no actualizar el checkout de entrenamiento activo; y un descargador fijado de LCB-v6 (`download_lcb_v6-323216b.py`) cuya descarga de datos se ejecuta sobre almacenamiento corporativo. El proyecto MP-OPD A/B/C incluye adaptador de datos reales y controles, con 38 tests de CPU superados y 1 omitido. No se ha ejecutado ninguna evaluacion en GPU.

## Capacidades

- El repositorio no contiene ningun modelo entrenado, por lo que no tiene capacidades de inferencia (generacion de texto, codigo, matematicas, vision u otras).
- Distribucion de codigo fuente: permite clonar o actualizar el historial de Git mediante bundle, con verificacion de integridad por SHA-256 contra `source-manifest.json`.
- Reproducibilidad de experimentos de destilacion de conocimiento: el bundle conserva el commit original y el historial completo.
- Portabilidad de plataforma: la rama `vdt/ops/b200-portable` y los lanzadores bajo `experiments/runai` apuntan a despliegue en infraestructura RunAI y a NVVIDIA B200, aunque la canary combinada de GPU queda pendiente segun la model card.
- Herramientas de evaluacion: runner con perfiles de codigo de autor y de especificacion de paper, mas un archivo de evaluacion independiente con contrato documentado en `scripts/evaluation/CONTRACT_README.md`.
- Preparacion de datos: descargador fijado de LCB-v6 y utilidades de preparacion de mecanica con exclusion explicita de grupos de prompts ambiguos.
- Soporte de tool calling, agentes, modo thinking, multimodalidad o multilingueismo: no disponible (no aplica, al no existir modelo).

## Casos de uso

- Auditoria de codigo de investigacion: descargar el bundle, verificar el SHA-256 contra el manifiesto y revisar el commit `4b9d70a...` para auditar exactamente la version usada en los experimentos de SimCT / KDFlow.
- Reproduccion de experimentos de destilacion: reconstruir el checkout con `git clone --branch vdt/ops/b200-portable` sobre el bundle y ejecutar los lanzadores documentados, teniendo en cuenta que los checkpoints y datasets estan excluidos del repositorio.
- Portabilidad a hardware B200: reutilizar la rama especifica de portabilidad y los lanzadores RunAI para adaptar el pipeline a nodos con GPU B200, asumiendo que la canary combinada de GPU sigue pendiente.
- Arranque de evaluacion independiente: extraer `simct-eval-94114c1.zip` en un directorio separado y ejecutar el runner de evaluacion con el perfil de especificacion de paper, sin tocar el checkout de entrenamiento activo.
- Validacion en integracion continua ligera: aprovechar los 38 tests de CPU del proyecto MP-OPD A/B/C para comprobar regresiones antes de solicitar recursos de GPU.
- Preparacion de pipelines de datos a escala: usar el descargador fijado de LCB-v6 en almacenamiento corporativo para generar conjuntos de evaluacion versionados y reproducibles.
- Actualizacion incremental del bundle: aplicar `git pull --ff-only` desde el bundle sobre un checkout limpio en la misma rama, para sincronizar cambios sin reescribir historia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ejecuto ninguna evaluacion en GPU, que la matematica del paper requiere `math-verify` y que quedan pendientes la preflight corporativa y la verificacion de datasets. Los unicos resultados cuantitativos declarados son de pruebas de software: 38 tests de CPU superados y 1 omitido en el proyecto MP-OPD A/B/C.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay modelo ni pesos en el repositorio).
- GPU objetivo: la rama `vdt/ops/b200-portable` y la documentacion de `experiments/runai` apuntan a NVIDIA B200; no se detallan otras GPU recomendadas.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible para inferencia. Para el codigo, el mecanismo previsto es Git sobre un bundle (`git clone --branch ... /ruta/simct-b200-portable.bundle`), con lanzadores bajo `experiments/runai`.
- Latencia y throughput: no disponible. Solo se documenta un parametro de ejecucion, microbatch 4 en el lanzador MP-OPD, sin cifras de rendimiento asociadas.
- Almacenamiento: el repositorio ocupa 0,6 GB; el codigo clonado, mas los datasets y checkpoints excluidos, requeriran espacio adicional no cuantificado en la informacion disponible.

## Comparativa con modelos similares

No disponible. El repositorio no publica un modelo con parametros, contexto o licencia comparables, y la informacion proporcionada no identifica alternativas de la misma categoria (distribuciones de codigo para destilacion de conocimiento) con las que establecer una comparacion con datos verificables.

## Limitaciones y advertencias

- No es un modelo: no se pueden realizar inferencias, evaluaciones de calidad ni despliegues de servicio a partir de este repositorio.
- Ausencia de licencia declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion, lo que bloquea su adopcion en produccion.
- Artefactos incompletos por diseno: runtime, checkpoints, datasets y `remote_artifacts` estan excluidos, por lo que la reproduccion completa exige fuentes externas.
- Verificacion obligatoria de integridad: la propia model card exige comprobar el SHA-256 contra `source-manifest.json` antes de cualquier operacion Git.
- Estado de validacion parcial: la canary combinada de GPU esta pendiente, no se ejecuto evaluacion en GPU, la matematica del paper requiere `math-verify` y la preflight corporativa y la verificacion de datasets siguen sin cerrarse.
- Compatibilidad de proxy y descarga del servidor: la model card indica que no ha sido verificada por la subida local.
- Flujo de publicacion restringido: el bundle es un transporte de solo lectura; cualquier edicion desde el servidor requiere un flujo de publicacion autorizado por separado.
- Anomalia en metadatos: las fechas de creacion y actualizacion indicadas (2026-09-09 y 2026-10-06) son posteriores a la fecha de consulta habitual, conviene tratarlas con cautela.
- Sin senal de adopcion: 0 descargas y 0 likes, sin pipeline declarado ni idiomas soportados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/codemaivanngu/simct
- Repositorio de origen del codigo: https://github.com/sontungkieu/SimCT
- Artefactos citados en la model card (dentro del repositorio de HuggingFace, revision fijada): `simct-b200-portable.bundle`, `source-manifest.json`, `simct-eval-94114c1.zip`, `download_lcb_v6-323216b.py`, `MP-OPD-ABC-HUONG-DAN.md`, `pull-mp-opd-abc.sh`
- Documentacion en el checkout: `experiments/runai/README.md`, `scripts/evaluation/CONTRACT_README.md`
- Papers, blogs o demos adicionales: no disponible
