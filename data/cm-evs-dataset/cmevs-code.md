# CM-EVS-Dataset/cmevs-code

## Resumen

CM-EVS Code Release es el repositorio de codigo que acompaña al articulo "CM-EVS: Sparse Panoramic RGB-D-Pose Data for Coverage-Oriented Scene Observation", aceptado en el track Evaluations and Datasets de NeurIPS 2026. No se trata de un modelo de lenguaje ni de un modelo generativo: es un conjunto de pipelines, scripts y utilidades para la seleccion de vistas en la adquisicion de datos 3D de escenas, orientado a la cobertura eficiente de observacion mediante panoramas equirectangulares con RGB, profundidad y pose.

El paquete incluye un pipeline basado en Blender para exportar escenas indoor, herramientas de proyeccion, geometria y profundidad, pruebas de regresion y comprobaciones de integridad del release. Se distribuye junto a un dataset companion (CM-EVS-Dataset/cmevs-erp-eval) que publica 13.631 triples RGB/profundidad/pose de 374 instancias de escena generadas en Blender.

Su relevancia actual radica en que aborda un problema practico de la captura de datos 3D a escala: como elegir un subconjunto de vistas panoramicas que maximice la cobertura de la escena minimizando conflictos y redundancia. La licencia MIT del codigo facilita su reutilizacion, aunque los assets y pesos externos quedan sujetos a sus propias condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un repositorio de codigo con pipelines de seleccion de vistas, geometria y renderizado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentacion y metadatos) |
| Licencia | MIT (codigo); datos y assets upstream bajo sus propios terminos |
| Formato de pesos | no disponible (el repositorio distribuye codigo Python/Bash, JSON de metadatos, Croissant 1.0.2 y checksums SHA-256) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo. Su nucleo es una implementacion de seleccion de vistas orientada a cobertura sobre datos panoramicos equirectangulares (ERP) con RGB, profundidad y pose. Incluye pipelines para Blender, mallas y nubes de puntos, utilidades de proyeccion, profundidad y geometria, y scripts de metricas y resumenes. El snapshot publico incorpora el codigo del colaborador `ManfredC/cmevs-code@f797f2bd...` con correcciones documentadas en `PROVENANCE.md`.

El release separa explicitamente el smoke test sin datos (metadatos sinteticos, seleccion greedy de conjuntos, renders simulados y metricas de ejemplo) del pipeline completo de Blender, que requiere un ejecutable externo de Blender y assets locales no redistribuidos. Los pesos opcionales de Depth Pro tambien deben obtenerse por separado bajo sus terminos originales. El entorno completo de renderizado y entrenamiento no ha sido validado por el test sin datos.

## Capacidades

- Seleccion de vistas orientada a cobertura sobre panoramas equirectangulares con RGB, profundidad y pose.
- Pipeline de exportacion de escenas indoor basado en Blender, con modo `DRY_RUN` para listar escenas sin renderizar.
- Utilidades de proyeccion, profundidad, geometria e integridad de hashes.
- Comprobacion de integridad del release mediante `scripts/check_release.py` y `tools/make_sha256sums.sh verify`.
- Pruebas de regresion deterministas para entradas invalidas, ficheros corruptos y comportamiento de las herramientas de hash.
- Publicacion de metadatos de dataset en formato Croissant 1.0.2 y manifiestos historicos de inventarios H100.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision general, tool calling ni agentes.

## Casos de uso

- Investigacion en adquisicion de datos 3D: usar el pipeline para seleccionar un subconjunto de vistas panoramicas que maximice la cobertura de una escena antes de capturar o renderizar, reduciendo coste de almacenamiento y computo.
- Reproducibilidad de resultados de NeurIPS: ejecutar `scripts/check_release.py` y las pruebas de regresion para verificar que el codigo publicado coincide con los hashes del release antes de comparar con el paper.
- Generacion de datasets sinteticos indoor: emplear el pipeline de Blender sobre assets `.blend` locales para exportar triples RGB/profundidad/pose y construir corpus de entrenamiento o evaluacion.
- Validacion de metadatos de pose: usar las utilidades de geometria para interpretar correctamente `cam_to_world`, cuaterniones con orden escalar-primero y coordenadas absolutas de escena en los JSON publicos.
- Integracion en pipelines de investigacion en vision por computador: reutilizar los modulos de proyeccion y profundidad como dependencias en experimentos de novel view synthesis o reconstruccion.
- Auditoria de integridad de artefactos cientificos: aplicar el esquema de checksums SHA-256 y los manifiestos para verificar la procedencia de datos y codigo en publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni equivalentes, y el smoke test genera metricas de ejemplo sobre datos sinteticos que no reproducen la cobertura a escala del paper ni los numeros de ERP-NVS.

## Requisitos de hardware

- El smoke test y las comprobaciones de release requieren Python 3.10+ y Bash, sin GPU ni paquetes Python de terceros.
- El pipeline completo de Blender requiere un ejecutable externo de Blender y dependencias cientificas opcionales instalables mediante `environment.yml` o `requirements.txt`.
- VRAM estimada para inferencia: no disponible (no es un modelo neuronal).
- GPU recomendadas: no disponible; el repositorio menciona inventarios historicos de H100 pero no especifica requisitos de GPU para su ejecucion.
- Opciones de despliegue: ejecucion local mediante scripts Bash y Python; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CM-EVS Code Release | Repositorio de codigo para seleccion de vistas 3D | no aplica | no aplica | MIT | Hugging Face |
| ManfredC/cmevs-code | Snapshot colaborador previo del mismo codigo | no aplica | no aplica | no disponible | Hugging Face |
| anon-cmevs-2026/cmevs-code | Release anonimo del mismo codigo | no aplica | no aplica | no disponible | Hugging Face |

No se dispone de informacion sobre proyectos alternativos comparables de seleccion de vistas orientada a cobertura con los que establecer una comparativa tecnica detallada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con criterios de MMLU, generacion de texto ni tool calling.
- El smoke test usa anotaciones sinteticas y renders simulados; no reproduce la cobertura a escala del paper, los diagnosticos oracle ni los numeros ERP-NVS.
- El pipeline completo de Blender es una ruta de implementacion separada y no implementa necesariamente todos los protocolos del paper.
- Los assets de escena y los pesos opcionales de Depth Pro no se redistribuyen y deben obtenerse bajo sus propios terminos.
- Los JSON de pose publicos declaran `cam_to_world`, cuaterniones escalar-primero y coordenadas absolutas; interpretarlos como world-to-camera o como offsets respecto al primer frame produce errores.
- Los manifiestos en `dataset_metadata/manifests_h100/` son inventarios historicos de hashes y no manifiestos de descarga publicos actuales.
- El Croissant incluido describe un snapshot fijado del dataset, no el archivo de codigo.
- El entorno completo de renderizado y entrenamiento no ha sido validado por el test sin datos.
- La licencia MIT cubre el codigo; los datos y assets upstream mantienen sus condiciones propias, lo que puede restringir el uso comercial de los artefactos derivados.
- El idioma de la documentacion es unicamente ingles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CM-EVS-Dataset/cmevs-code
- Dataset companion: https://huggingface.co/datasets/CM-EVS-Dataset/cmevs-erp-eval
- Paper (OpenReview): https://openreview.net/forum?id=mSu3YzwW3t
- Snapshot colaborador: https://huggingface.co/ManfredC/cmevs-code
- Release anonimo: https://huggingface.co/anon-cmevs-2026/cmevs-code
