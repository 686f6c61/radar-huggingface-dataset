# reflective-org/AIDE-SAI-emulator

## Resumen

AIDE-SAI-emulator es un paquete de pesos y datos auxiliares para la versión emulada de AIDE-SAI, un modelo de aerosol sulfatado estratosférico orientado a simulaciones de inyección de aerosoles estratosféricos (SAI, *stratospheric aerosol injection*), una de las técnicas de geoingeniería solar más estudiadas en modelización climática. Lo desarrolla la organización reflective-org y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje: es un conjunto de emuladores neuronales que sustituyen componentes costosos de un modelo climático acoplado ejecutado en GPU.

El repositorio contiene tres bloques: un emulador de radiación (redes de onda corta con 3 nodos de Gauss, onda larga y *clear-sky damping*, entrenadas sobre resoluciones integradas en ventana de RRTMGP), un emulador de atmósfera JCM P2@200 (T63, 95 niveles, estilo PARADIS) y una climatología mensual 1996-2014 de campos de frontera y química de CESM2 FWHIST sobre rejilla f09. El tamaño total del repositorio es de 3,4 GB, dominado por la climatología.

La relevancia es doble: por un lado, permite ejecutar un modelo de aerosol estratosférico completo en GPU reduciendo el coste computacional de la física radiativa y atmosférica; por otro, su naturaleza de *checkpoint* de investigación exige usarlo a través del repositorio de código (rama `emulator`), no de forma aislada. La red de microfísica que consume se publica por separado en reflective-org/AIDE-Microphysics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Emuladores neuronales (redes densas tipo PARADIS para atmosfera; redes para radiacion SW/LW) acoplados a transporte numerico y microfisica emulada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia de texto) |
| Tipos de cuantizacion | no disponible (pesos en numpy `.npz` y formatos propios del repo) |
| Idiomas soportados | no aplica (modelo fisico, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.npz` (numpy) para radiacion; bundles propios con pesos, normalizacion y terminos auxiliares para atmosfera; climatologia en ficheros de datos |
| Tamano del repositorio | 3,4 GB |
| Resolucion atmosferica | T63, 95 niveles (emulador P2@200) |
| Rejilla de climatologia | f09 (CESM2 FWHIST) |
| Periodo de climatologia | mensual, 1996-2014 |

## Arquitectura y entrenamiento

El sistema combina cuatro componentes: un emulador de radiacion, un emulador de atmosfera, transporte numerico y un emulador de microfisica de aerosoles (publicado aparte). El emulador de radiacion (`radem_gen2/`, 25 MB) incluye redes para onda corta con 3 nodos de Gauss, onda larga y *clear-sky damping*, entrenadas sobre resoluciones integradas en ventana del esquema RRTMGP. El emulador de atmosfera (`atmos_P2s200/`, 165 MB) sigue un diseño estilo PARADIS con pesos, normalizacion, condicion inicial del 1997-01-01T06, forzamiento de arrastre de onda QBO de tipo Hines y terminos *u-fixer*.

La climatologia de frontera (`bc_clim/`, 3,2 GB) contiene la media mensual 1996-2014 de los campos de frontera y quimica de CESM2 FWHIST que el modelo lee: gases, OH, humedad relativa, aerosol MAM4, columna radiativa y flujos superficiales, todo en rejilla f09. El fichero de vientos offline de 2 anos que usan los presets distintos de `linked_atmosphere` no se aloja en el repositorio: se regenera con `scripts/get_assets.py --met` (92 GB) y coincide con el de las ejecuciones publicadas en receta, no en bytes (diferencias de unos ulp desde el segundo frame).

No se dispone de informacion sobre el volumen de tokens de entrenamiento ni sobre el dataset de entrenamiento de las redes, mas alla de que la radiacion se entrena sobre RRTMGP y la atmosfera sobre un modelo JCM. No se documenta RLHF ni DPO, por tratarse de emuladores fisicos.

## Capacidades

- Emulacion de radiacion atmosferica: onda corta (3 nodos de Gauss), onda larga y *clear-sky damping* sobre resoluciones integradas en ventana de RRTMGP.
- Emulacion de atmosfera JCM a T63 con 95 niveles, incluyendo condicion inicial, normalizacion y forzamiento QBO por arrastre de onda.
- Acoplamiento con transporte numerico y microfisica de aerosoles emulada (AIDE-Microphysics).
- Lectura de campos de frontera y quimica desde climatologia mensual CESM2 FWHIST en rejilla f09.
- Ejecucion en GPU del modelo de aerosol estratosferico completo.
- Preset `linked_atmosphere` con acoplamiento atmosfera-atmosfera; otros presets requieren el fichero de vientos offline regenerado.
- Verificacion de integridad de assets mediante sha256 en `scripts/get_assets.py`.

## Casos de uso

- Simulaciones de inyeccion de aerosoles estratosfericos: el modelo permite ejecutar experimentos SAI con el emulador de radiacion y atmosfera en lugar de los esquemas fisicos completos, reduciendo el coste por paso de tiempo en GPU.
- Estudios de sensibilidad de forzamiento radiativo: la red de onda corta con 3 nodos de Gauss y la de onda larga permiten barrer parametros de inyeccion (latitud, altitud, tasa) y evaluar el forzamiento resultante con la climatologia de frontera fijada.
- Analisis de la respuesta de la circulacion estratosferica: el emulador P2@200 con forzamiento QBO de tipo Hines permite estudiar la interaccion entre el aerosol inyectado y la oscilacion cuasi-bienal.
- Experimentos de acoplamiento atmosfera-quimica: la climatologia mensual 1996-2014 de gases, OH, RH y MAM4 en rejilla f09 proporciona condiciones de contorno consistentes para runs de varios anos.
- Reproduccion de ejecuciones publicadas: el preset `linked_atmosphere` y la regeneracion del fichero de vientos con `--met` permiten replicar las recetas de los runs publicados (con diferencias de ulp en los vientos regenerados).
- Desarrollo y validacion de emuladores climaticos: el repositorio sirve como base para comparar emuladores neuronales frente a esquemas fisicos (RRTMGP, dycore del JCM) en tareas de radiacion y dinamica.
- Docencia y prototipado en geoingenieria solar: al ejecutarse en GPU y con assets verificados por sha256, facilita montar entornos reproducibles para cursos o pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 3,4 GB, pero el consumo en GPU depende del preset y del acoplamiento; no se documenta.
- GPU recomendadas: no disponible. El modelo esta disenado para ejecucion en GPU (JAX/PyTorch), pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: clonado del repositorio de codigo (rama `emulator`) y descarga de assets con `scripts/get_assets.py`; no se documenta vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Almacenamiento: 3,4 GB para el repositorio mas 92 GB adicionales si se regenera el fichero de vientos offline con `--met`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIDE-SAI-emulator | Emuladores de radiacion, atmosfera y climatologia para modelo SAI | no disponible | no aplica | Apache 2.0 | Hugging Face + GitHub (rama `emulator`) |
| AIDE-Microphysics | Emulador de microfisica de aerosoles | no disponible | no aplica | no disponible | Hugging Face (reflective-org) |
| AIDE-SAI (original) | Modelo de aerosol estratosferico con esquemas fisicos | no aplica | no aplica | no disponible | GitHub (reflective-org) |

No se dispone de informacion sobre otros emuladores climaticos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Son *checkpoints* de investigacion: la respuesta del emulador de atmosfera a calentamiento impuesto no ha sido validada contra su dycore.
- Los emuladores de aerosol y radiacion estan entrenados para la configuracion que fijan los presets; su uso fuera de ella no esta garantizado. Las comprobaciones y caveats conocidos estan en `docs/LINKED_VERSIONS.md` del repositorio de codigo.
- El fichero de vientos offline de 2 anos no se aloja en Hugging Face; debe regenerarse (92 GB) y difiere en unos ulp del usado en los runs publicados desde el segundo frame.
- No debe usarse de forma aislada: requiere el repositorio de codigo y la red de microfisica AIDE-Microphysics.
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, codigo, tool calling ni agentes; las secciones de la ficha relativas a esas capacidades no aplican.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza de investigacion y la falta de validacion del acoplamiento desaconsejan su uso en produccion sin evaluacion adicional.
- No se documentan sesgos, riesgo de alucinacion ni limitaciones idiomaticas por tratarse de un modelo fisico.

## Enlaces

- Hugging Face: https://huggingface.co/reflective-org/AIDE-SAI-emulator
- Repositorio de codigo (rama `emulator`): https://github.com/reflective-org/AIDE-SAI/tree/emulator
- Emulador de microfisica: https://huggingface.co/reflective-org/AIDE-Microphysics
- Documentacion de versiones enlazadas: `docs/LINKED_VERSIONS.md` en el repositorio de codigo
