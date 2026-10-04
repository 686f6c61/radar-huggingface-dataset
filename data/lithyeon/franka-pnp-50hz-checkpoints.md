# lithyeon/franka-pnp-50hz-checkpoints

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de checkpoints de ajuste fino de pi0.5 (pi05_base) para una tarea concreta de robótica: pick-and-place con un brazo Franka a 50 Hz. Lo publica el usuario lithyeon como copia de seguridad de sus experimentos de entrenamiento dentro del ecosistema OpenPI de Physical Intelligence, y el repositorio ocupa 412,7 GB.

El interés principal es de tipo experimental y reproducible: se documentan cinco directorios de entrenamiento, cada uno con un protocolo distinto (desde un experimento de sobreajuste con una sola demostración hasta 450 demostraciones en una región de colocación de 10 x 15 cm), y se indica qué checkpoints conservan el estado del optimizador en `train_state/` y cuáles son solo de inferencia. Además, el autor publica hashes por fichero en `manifests/` y un `backup_status.json` con las revisiones verificadas.

La relevancia es acotada: no hay resultados de evaluación publicados, no se declara licencia explícita y el propio autor advierte de que almacenar un checkpoint no implica que el entrenamiento haya funcionado. Es material útil para quien quiera reanudar o auditar experimentos de políticas robóticas con OpenPI, no para uso en producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (modelo base pi05_base del proyecto OpenPI de Physical Intelligence); la informacion disponible no detalla la arquitectura interna |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica: es una politica robotica, no un modelo de lenguaje con ventana de contexto) |
| Tipos de cuantizacion | no disponible (los checkpoints se almacenan en el formato de entrenamiento; no se declaran versiones cuantizadas) |
| Idiomas soportados | no disponible (las instrucciones de la tarea no se documentan en la ficha) |
| Licencia | no disponible; el autor indica que se mantienen los terminos del modelo base pi05_base |
| Formato de pesos | Orbax (checkpoints JAX/OpenPI), con subdirectorios `params/`, `assets/` y, cuando corresponde, `train_state/`; no hay safetensors ni GGUF |
| Tamano del repositorio | 412,7 GB |
| Frecuencia de control | 50 Hz |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-10-04 |

Experimentos incluidos en el repositorio:

| Directorio | Experimento |
|---|---|
| `overfit1_fix3_50hz` | Sobreajuste con una demostracion, incluye entrenamiento continuado hasta 25k |
| `center5_v2_50hz` | 50 demostraciones en una region de colocacion de 5 x 5 cm |
| `mid10x15_50hz` | 450 demostraciones en una region de colocacion de 10 x 15 cm |
| `center5_noshelf_50hz` | 50 demostraciones sin estante; el entrenamiento podria seguir en curso |
| `incomplete/idlefilter_v2` | Artefacto local parcial; NO es un checkpoint utilizable ni reanudable |

## Arquitectura y entrenamiento

El modelo base es pi05_base, del proyecto OpenPI de Physical Intelligence, y los checkpoints aqui publicados son el resultado de ajuste fino sobre ese modelo para una tarea de pick-and-place ejecutada a 50 Hz sobre un brazo Franka. La informacion proporcionada no especifica la arquitectura interna (backbone, modulo de accion, mecanismo de generacion de acciones) ni el numero de parametros, tokens de entrenamiento o composicion del dataset; solo se documentan los protocolos de recogida de datos en terminos de numero de demostraciones y de region de colocacion.

El proceso de entrenamiento se describe mediante la estructura de los propios checkpoints. Los directorios `params/` y `assets/` son suficientes para inferencia, mientras que los que contienen `train_state/` preservan el estado del optimizador y permiten reanudar el entrenamiento con la implementacion OpenPI correspondiente y las estadisticas de normalizacion guardadas. Los nombres de carpeta siguen la indexacion basada en cero del codigo de entrenamiento: `19999` corresponde a 20.000 actualizaciones completadas y `24999` a 25.000. No se menciona el uso de RLHF, DPO ni ninguna tecnica de alineacion, algo esperable en un modelo de politica. El autor verifica cada checkpoint contra los tamanos y hashes de Hugging Face y registra los hashes por fichero en `manifests/`.

## Capacidades

- Ejecucion de una politica de pick-and-place sobre un brazo Franka a 50 Hz.
- Colocacion en regiones delimitadas: 5 x 5 cm (`center5_v2_50hz`) y 10 x 15 cm (`mid10x15_50hz`).
- Variante sin estante (`center5_noshelf_50hz`), que modifica la escena de entrenamiento.
- Inferencia a partir de `params/` y `assets/`, incluyendo las estadisticas de normalizacion guardadas.
- Reanudacion de entrenamiento desde los checkpoints que incluyen `train_state/`, preservando el estado del optimizador.
- Entrenamiento continuado documentado hasta 25.000 actualizaciones en el experimento de sobreajuste.
- No se documentan capacidades de tool calling, uso de agentes, multiturno, vision general, audio ni soporte multilingue: son capacidades fuera del alcance de estos artefactos.

## Casos de uso

- Reanudacion de experimentos de entrenamiento: cargar un checkpoint con `train_state/` y continuar el ajuste de pi0.5 con la implementacion OpenPI y las estadisticas de normalizacion correspondientes, sin repetir las actualizaciones ya realizadas.
- Estudio de eficiencia de datos en robotica: comparar el experimento de sobreajuste con una sola demostracion frente a los de 50 y 450 demostraciones para analizar como escala el rendimiento con el volumen de datos.
- Analisis del efecto de la region de colocacion: contrastar `center5_v2_50hz` (5 x 5 cm) con `mid10x15_50hz` (10 x 15 cm) para medir la degradacion al ampliar la zona objetivo.
- Ablacion de escena: usar `center5_noshelf_50hz` frente a `center5_v2_50hz` para aislar el impacto de retirar el estante en la politica aprendida.
- Auditoria y trazabilidad de artefactos: verificar la integridad de cada checkpoint con los hashes de `manifests/` y las revisiones de `backup_status.json` antes de reutilizarlos en un experimento propio.
- Despliegue experimental en un Franka real o simulado: descargar unicamente `center5_v2_50hz/19999/**` mediante `snapshot_download` con `allow_patterns` y ejecutar inferencia con OpenPI, evitando los 412,7 GB del repositorio completo.
- Replicacion de pipelines de verificacion: el patron de respaldo (comprobacion de tamanos, hashes por fichero y estado de respaldo) sirve como plantilla para versionar checkpoints roboticos grandes en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el almacenamiento de un checkpoint de entrenamiento no implica ninguna afirmacion de evaluacion satisfactoria, y no se incluyen tasas de exito, curvas de recompensa ni metricas de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La informacion proporcionada no indica el numero de parametros del modelo base ni el tamano de un checkpoint individual.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. No puede determinarse sin conocer el tamano del modelo y el formato de los pesos.
- Opciones de despliegue: implementacion OpenPI (checkpoints Orbax de JAX). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que no se trata de un modelo de lenguaje con pesos safetensors o GGUF.
- Almacenamiento: el repositorio completo ocupa 412,7 GB; se recomienda descargar un unico checkpoint por patron para reducir el espacio necesario.
- Latencia y throughput: no disponibles, salvo la frecuencia de control de 50 Hz que define la tarea de entrenamiento.
- Nota practica: la reanudacion del entrenamiento requiere `train_state/` y la implementacion OpenPI compatible; los checkpoints solo de inferencia no pueden reproducir el estado completo del optimizador.

## Comparativa con modelos similares

No disponible. La busqueda web realizada no aporta datos de rendimiento, parametros, contexto ni licencia de este repositorio ni de alternativas comparables, y la informacion proporcionada no incluye metricas que permitan una comparacion cuantitativa con otras politicas roboticas.

| Aspecto | Este repositorio | Alternativas comparables |
|---|---|---|
| Parametros | no disponible | no disponible |
| Contexto | no aplica | no disponible |
| Rendimiento en tarea | sin evaluacion publicada | no disponible |
| Licencia | no disponible (terminos del modelo base) | no disponible |
| Disponibilidad | publico en Hugging Face, 0 descargas y 0 likes en el momento de la consulta | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: el autor advierte que un checkpoint almacenado no implica que el entrenamiento haya sido exitoso.
- Artefacto no utilizable: `incomplete/idlefilter_v2` carece de estado de entrenamiento y de assets de normalizacion, y podria carecer tambien de los ficheros de pesos; se archiva solo por trazabilidad.
- Proceso de respaldo en curso: los backups continuan hasta que `backup_status.json` indique finalizacion, por lo que el contenido puede cambiar.
- Licencia no declarada en el repositorio: se heredan los terminos del modelo base pi05_base, lo que condiciona cualquier uso comercial y debe verificarse en la fuente original.
- Dependencia fuerte del entorno: cargar los checkpoints exige la implementacion OpenPI y las estadisticas de normalizacion guardadas; fuera de ese entorno los ficheros no son directamente utilizables.
- Alcance muy restringido: se trata de politicas especificas de pick-and-place sobre Franka, con escenas y demostraciones concretas, por lo que el sesgo de dominio es alto y la generalizacion a otras tareas, objetos o robots no esta documentada.
- Riesgo de sobreajuste en al menos un experimento: `overfit1_fix3_50hz` esta disenado deliberadamente sobre una unica demostracion.
- Sin informacion sobre idiomas, cuantizacion, contexto ni requisitos de hardware, lo que impide planificar un despliegue en produccion con garantias.
- Nomenclatura ambigua: los directorios siguen indexacion basada en cero, de modo que `19999` equivale a 20.000 actualizaciones completadas; un error de lectura puede llevar a comparar estados de entrenamiento distintos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lithyeon/franka-pnp-50hz-checkpoints
- Listado de modelos de Hugging Face citado en la busqueda web: https://huggingface.co/models?sort=modified
- Proyecto OpenPI de Physical Intelligence y modelo base pi05_base: enlace no proporcionado en la informacion disponible; debe consultarse la fuente original del modelo base para conocer los terminos aplicables.
