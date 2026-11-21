# cangyeone/seismic-snr-filtering-bias

## Resumen

`cangyeone/seismic-snr-filtering-bias` no es un modelo de aprendizaje automatico en el sentido convencional, sino un archivo de reproducibilidad cientifica asociado a un manuscrito de sismologia firmado por Ziye Yu, Xin Liu y Yuqi Cai. El repositorio contiene codigo, checkpoints entrenados, manifiestos de particion, historiales de validacion y tablas de resultados derivados de experimentos sobre el efecto del contraste de forma de onda (waveform contrast) en el valor de entrenamiento de modelos profundos aplicados a sismologia. El titulo del manuscrito, "Waveform contrast does not measure training value in seismic deep learning", resume la tesis central: la relacion senal-ruido (SNR) de las formas de onda no es un indicador fiable del valor de entrenamiento de un modelo sismologico.

El artefacto se distribuye bajo licencia CC BY 4.0 y ocupa aproximadamente 3,6 GB. La revision fechada el 29 de septiembre de 2026 anade materiales para comparaciones extendidas recogidas en las Notas Suplementarias 12 a 18, mientras que los experimentos originales de extremo fijo permanecen en la raiz del repositorio. Incluye herramientas de verificacion (`verify_release.py`, `prepare_workspace.py`), checksums SHA256 y un paquete de verificacion ejecutable para revisores anadido el 1 de octubre de 2026.

Es relevante ahora porque aborda un problema metodologico recurrente en el aprendizaje profundo aplicado a sismologia: la seleccion de muestras de entrenamiento basada en SNR. El repositorio no redistribuye los conjuntos de datos crudos (CREDIT-X1local, SeisDispFusion-NCF, SeismicX-Cont) y explicita las limitaciones de sus propios archivos, incluyendo la ausencia de trazas completas de probabilidad para algunas comparaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de artefactos de investigacion; contiene checkpoints de modelos profundos no especificados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 (materiales del proyecto); datos de terceros bajo sus propios terminos |
| Formato de pesos | checkpoints propios del proyecto (no se especifica safetensors ni GGUF); incluye archivos tar con miembros verificados por SHA256 |
| Tamano del repositorio | 3,6 GB |
| DOI del repositorio | 10.57967/hf/9115 (y 10.57967/hf/9778, que resuelve al mismo deposito) |
| Revision previa | `da82ce1fe8b571a43c93a91df55d60d6ddcac8e3` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de los modelos entrenados en el repositorio. Se trata de un archivo de reproducibilidad que contiene checkpoints entrenados, estados guardados, historiales de validacion, manifiestos de particion y seleccion, predicciones candidatas de monitorizacion, flujos seleccionados, asociaciones y analisis de dependencia. Los materiales estan organizados en `code/`, `checkpoints/`, `training_manifests/`, `configs/` y `results/` para el archivo original, y en `nc_revision_20260929/` para la revision de 2026.

El objeto de estudio es metodologico: evaluar si el contraste de forma de onda (medido habitualmente via SNR) predice el valor de entrenamiento en aprendizaje profundo sismologico. Los conjuntos de datos de referencia son CREDIT-X1local, SeisDispFusion-NCF y SeismicX-Cont, que no se redistribuyen y deben obtenerse de sus proveedores citados bajo sus propios terminos. El repositorio incluye identificadores de registro derivados, metadatos de etiquetado manual, valores de SNR y manifiestos de pertenencia para documentar las particiones. La correccion de archivo del 30 de septiembre de 2026 anade 72 arrays enteros TP/FP/FN que se habian excluido incorrectamente como caches de formas de onda; sus totales archivados reproducen las puntuaciones guardadas, pero no son trazas de probabilidad completas.

## Capacidades

- Reproduccion de experimentos de seleccion de muestras por SNR en aprendizaje profundo sismologico.
- Verificacion de integridad mediante SHA256 de cada archivo listado y, opcionalmente, de cada miembro de los archivos tar (`verify_release.py --members`).
- Creacion de un espacio de trabajo limpio y un directorio de drivers del articulo sin modificar los bytes congelados del codigo fuente (`prepare_workspace.py`).
- Reconstruccion de resultados: el paquete de verificacion para revisores incluye siete comprobaciones reales de reconstruccion de resultados, incluida la entrada minima ordenada de ID de referencia y hora para reproduccion exacta por bootstrap.
- Auditoria de particiones y seleccion mediante manifiestos, tablas de puntuaciones, derivados de figuras y ledgers de auditoria.
- Analisis de dependencia y asociacion a partir de predicciones de monitorizacion en JSONL con metadatos de fuente y estacion.
- No es un modelo generativo: no ofrece generacion de texto, codigo, vision, tool calling ni razonamiento de proposito general.

## Casos de uso

- Reproduccion de resultados cientificos: un revisor o investigador descarga el repositorio en un commit inmutable, ejecuta `verify_release.py` para validar checksums y `prepare_workspace.py` para generar un espacio de trabajo desde el que lanzar los drivers del articulo. Es adecuado porque el deposito congela el codigo fuente y documenta las rutas de reproduccion.
- Auditoria metodologica de seleccion por SNR: el repositorio permite examinar los manifiestos de particion y los valores de SNR para comprobar si la seleccion de muestras por relacion senal-ruido correlaciona con el rendimiento del modelo entrenado, que es la pregunta central del manuscrito.
- Verificacion de integridad de artefactos en publicaciones: los checksums SHA256 y los manifiestos a nivel de archivo permiten certificar que los resultados publicados corresponden a los artefactos depositados, util en procesos de revision por pares.
- Reconstruccion de intervalos de confianza: el paquete de revision permite reproducir exactamente el bootstrap a partir de la entrada minima ordenada de ID de referencia y hora, util para validar afirmaciones estadisticas del articulo.
- Formacion de investigadores en sismologia computacional: los materiales documentan el flujo completo desde la obtencion de datos de terceros hasta las tablas de puntuaciones y derivados de figuras, sirviendo como caso de estudio de reproducibilidad.
- Analisis de monitorizacion sismica: los archivos JSONL de predicciones de monitorizacion con metadatos de fuente y estacion permiten estudiar asociaciones y dependencias entre estaciones, aunque no son muestras de forma de onda.
- Evaluacion de sesgos en criterios de filtrado: el repositorio aporta evidencia empirica sobre si filtrar por SNR introduce sesgos en el conjunto de entrenamiento, util para disenar pipelines de datos en sismologia profunda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene tablas de puntuaciones y derivados de resultados cientificos del manuscrito, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni equivalentes, que ademas no aplican a este tipo de artefacto.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la informacion disponible, ya que el repositorio no documenta la inferencia de un modelo concreto.
- El tamano del repositorio es de 3,6 GB, por lo que se necesita espacio en disco suficiente para el deposito completo y para el espacio de trabajo generado por `prepare_workspace.py`.
- El entrenamiento y la evaluacion de los checkpoints incluidos requieren el entorno de ejecucion de los drivers del articulo, que conservan rutas especificas de maquina; no se ha certificado una ejecucion completa de extremo a extremo desde cero para este deposito.
- Opciones de despliegue: no aplica (no es un modelo servible via vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada artefactos de reproducibilidad comparables de la misma categoria (archivos de reproducibilidad sismologica con la misma tesis metodologica) ni se dispone de datos de parametros, contexto o rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de aprendizaje automatico utilizable para inferencia generica; es un archivo de investigacion. No debe presentarse como un modelo desplegable.
- El propio autor advierte que el repositorio es un artefacto de investigacion y no una afirmacion de que el manuscrito haya sido publicado o aceptado.
- Las trazas completas de probabilidad y las predicciones completas periodo a periodo no estan disponibles para todas las comparaciones de aprendizaje; las puntuaciones agregadas o estadisticas suficientes no deben describirse como esas predicciones completas.
- La lista de lagunas del archivo (`archive_gap_list.md`) sigue sin estar vacia y especifica limites en predicciones, identidad historica del modelo y arranque limpio.
- Algunos drivers congelados conservan rutas especificas de maquina y no se ha certificado una ejecucion completa de extremo a extremo desde cero para este deposito.
- Los conjuntos de datos crudos de terceros (CREDIT-X1local, SeisDispFusion-NCF, SeismicX-Cont) no se redistribuyen; deben obtenerse de sus proveedores bajo sus propios terminos. Las caches de evaluacion que contienen formas de onda y los archivos originales restringidos de claves de particion estan excluidos.
- Los archivos JSONL de monitorizacion son predicciones del modelo con metadatos, no muestras de forma de onda; no deben tratarse como datos sismicos crudos.
- La licencia CC BY 4.0 cubre solo los materiales controlados por el proyecto; los componentes de terceros conservan sus propios terminos (el codigo REAL incluido lleva su licencia MIT adjunta).
- Riesgo de sesgo y alucinacion: no aplica en el sentido de un modelo generativo; el riesgo relevante es de interpretacion erronea de los artefactos como resultados cientificos definitivos o como modelos listos para produccion.
- Para citar o descargar, debe usarse un commit inmutable del repositorio; el articulo registra el commit verificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cangyeone/seismic-snr-filtering-bias
- DOI del repositorio: https://doi.org/10.57967/hf/9115
- DOI del manuscrito (resuelve al mismo deposito): https://doi.org/10.57967/hf/9778
- Guia de cobertura y limitaciones: `nc_revision_20260929/COVERAGE.md`
- Fuentes de datos y definiciones de particion: `nc_revision_20260929/DATA_SOURCES_AND_SPLITS.md`
- Guia de reproduccion: `nc_revision_20260929/REPRODUCTION_GUIDE.md`
- Indice de artefactos: `nc_revision_20260929/ARTIFACT_INDEX.json`
- Manifiestos de bundle a nivel de archivo: `nc_revision_20260929/manifests/`
- Checksums SHA256: `CHECKSUMS.sha256`
- Fuente y registros de ejecucion congelados: `nc_revision_20260929/source/`
- Ledgers de auditoria, tablas de puntuaciones y derivados de figuras: `nc_revision_20260929/results/`
- Paquete de verificacion para revisores: `nc_reviewability_20261001/README.md`
- Crosswalk de resultados centrales: `nc_reviewability_20261001/CORE_RESULT_CROSSWALK.md`
- Correccion de archivo del 30 de septiembre de 2026: `nc_revision_20260929/provenance/count_array_correction_20260930.json`
- Lista de lagunas del archivo: `nc_revision_20260929/archive_gap_list.md`
- README de la revision original: `nc_revision_20260929/provenance/README_original_revision.md`
- Guia de reproduccion con datos abiertos: `OPEN_DATA_REPRODUCTION.md`
- Crosswalk de reproducibilidad: `REPRODUCIBILITY_CROSSWALK.md`
