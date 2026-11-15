# abdukuzi45/amharic-cpt-training-code-20261115-replay-diagnostics

## Resumen

El repositorio `abdukuzi45/amharic-cpt-training-code-20261115-replay-diagnostics` no contiene un modelo de lenguaje entrenado, sino codigo de entrenamiento (una celula de notebook Molab y codigo Python asociado) para un proceso de continued pre-training (CPT) sobre amharico. El autor, `abdukuzi45`, publica aqui los scripts de lanzamiento, diagnostico de replay numerico y utilidades de gestion de checkpoints de un pipeline de entrenamiento, etiquetados con los idiomas `am` (amharico) y `en` (ingles).

La model card describe correcciones de errores de conflicto de ficheros locales (`Local train.py differs`), la politica de preservacion de todos los checkpoints (`preserve_all_checkpoints`), la lectura de credenciales (`HF_TOKEN`, `WANDB_API_KEY`) desde el entorno del notebook y la separacion entre este repositorio de codigo y el repositorio de checkpoints de entrenamiento. No se documentan pesos, arquitectura ni resultados de evaluacion.

Por tanto, esta ficha no puede describir capacidades de inferencia, benchmarks ni requisitos de hardware de un modelo, ya que el artefacto publicado es codigo de entrenamiento. Todos los campos que requieren especificaciones de modelo se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene codigo de entrenamiento, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | am (amharico), en (ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio publica codigo: `FULL_SINGLE_CELL.py`, `ONE_CODE_BLOCK.md`, `COPY_FULL_CELL.html`) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo en la informacion disponible. Lo que documenta la model card es la infraestructura de entrenamiento: una celula de notebook Molab ejecutada en Python 3.13 sobre GPU SM120 con 96 GB de memoria, con modo por defecto de entrenamiento completo ("original gates enforced") y reutilizacion de checkpoints de reanudacion validos. El autor indica que un fallo genuino de replay numerico detiene el proceso, que las tolerancias no se han modificado y que las auditorias de hashing de dataset y de fronteras siguen presentes.

En cuanto a innovaciones tecnicas documentadas, destacan: staging de codigo fuente fijado en directorios content-addressed sin reemplazar ficheros locales previos; desactivacion en el subproceso worker del pruning remoto de checkpoints, del squash de historico y del borrado local; y una politica de almacenamiento que retiene todos los checkpoints (`preserve_all_checkpoints`). El autor declara explicitamente que no se ejecuto entrenamiento en GPU ni mutacion de checkpoints durante la publicacion del codigo, y que no se han probado la interaccion real con Marimo/navegador, la ejecucion en SM120, la paridad completa de actualizacion del modelo ni el entrenamiento de extremo a extremo.

## Capacidades

- No aplicable: el repositorio no publica un modelo con capacidades de inferencia.
- El codigo permite lanzar y reanudar un pipeline de continued pre-training sobre datos en amharico e ingles.
- Gestion de credenciales mediante variables de entorno del notebook (`HF_TOKEN`, `WANDB_API_KEY`), formularios previos en el kernel o caches del SDK, manteniendo los secretos solo en RAM.
- Preservacion de checkpoints y staging idempotente de codigo fuente con directorios content-addressed.
- Diagnostico de replay numerico con tolerancias sin cambios y observer de replay original.
- Tests en CPU para preservacion de ficheros en conflicto, staging repetido, rechazo de manipulacion (tamper rejection), busqueda de credenciales en entorno/RAM/SDK, politica de no borrado, observer de replay, empaquetado y modo por defecto.
- No se documentan tool calling, agentes, vision, audio ni modo de razonamiento, por tratarse de codigo de entrenamiento.

## Casos de uso

- Reproduccion de entrenamiento en Molab: usar la celula publicada en un notebook Python 3.13 / SM120 / 96 GB para lanzar o reanudar el CPT con las puertas (gates) originales aplicadas.
- Auditoria de integridad de datasets: las auditorias de hashing y fronteras documentadas permiten verificar que los datos de entrenamiento no han cambiado entre ejecuciones.
- Diagnostico de fallos de replay numerico: el observer de replay y las tolerancias sin cambios permiten aislar discrepancias numericas entre ejecuciones sobre GPU.
- Gestion segura de checkpoints en produccion: la politica `preserve_all_checkpoints` evita perdidas accidentales por pruning remoto o borrado local, a costa de mayor uso de disco y de almacenamiento en Hugging Face.
- Integracion con Hugging Face y W&B: el codigo lee `HF_TOKEN` y `WANDB_API_KEY` desde el entorno del kernel, lo que facilita subir checkpoints y registrar metricas sin incrustar secretos en el codigo.
- Control de versiones de codigo de entrenamiento: el staging content-addressed y la referencia al commit `25c36d1e802771f7ce7c336305723bfa2b5a55c3` permiten comparar releases de diagnostico y mantener trazabilidad.
- Separacion de repositorios: al estar este repo de codigo separado del repo de checkpoints, permite versionar scripts sin mezclar artefactos pesados de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU: el autor indica un entorno SM120 con 96 GB de memoria para el notebook de entrenamiento; no se detallan modelos concretos de GPU.
- VRAM para inferencia: no disponible (no se publican pesos).
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: no disponible para inferencia; para entrenamiento, el codigo esta disenado para notebooks Molab con Python 3.13.
- Latencia y throughput: no disponible.
- Almacenamiento: la retencion de todos los checkpoints implica crecimiento continuo del uso de disco y de Hugging Face, segun advierte la model card.

## Comparativa con modelos similares

No disponible. El repositorio publica codigo de entrenamiento y diagnostico, no un modelo de lenguaje, por lo que no existe una categoria de modelos comparables directa.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; no es utilizable para inferencia.
- No se especifica licencia, lo que impide determinar condiciones de uso comercial.
- El autor advierte que la causa raiz en GPU de un fallo genuino de replay numerico no se ha corregido ni validado en esta release.
- No se han probado la interaccion real con Marimo/navegador, la ejecucion en SM120, la paridad completa de actualizacion del modelo ni el entrenamiento de extremo a extremo.
- La release no elimina todos los escaneos de inicio (startup scans), segun la propia model card.
- Las credenciales mantenidas solo en RAM se pierden al cerrar el kernel; los secretos personales de ARIA no aparecen automaticamente en otro runtime de Molab.
- La retencion de todos los checkpoints incrementa el uso de disco y de Hugging Face de forma sostenida.
- Solo debe ejecutarse un launcher a la vez, segun las instrucciones del autor.
- Riesgo de sesgos, alucinacion y limitaciones idiomaticas: no evaluable, al no existir modelo publicado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/abdukuzi45/amharic-cpt-training-code-20261115-replay-diagnostics
- Codigo completo en un bloque: https://huggingface.co/abdukuzi45/amharic-cpt-training-code-20261115-replay-diagnostics/blob/main/ONE_CODE_BLOCK.md
- Fuente Python: https://huggingface.co/abdukuzi45/amharic-cpt-training-code-20261115-replay-diagnostics/blob/main/FULL_SINGLE_CELL.py
- HTML para copiar la celula: https://huggingface.co/abdukuzi45/amharic-cpt-training-code-20261115-replay-diagnostics/resolve/main/COPY_FULL_CELL.html?download=true
- Commit de la release de diagnostico anterior: `25c36d1e802771f7ce7c336305723bfa2b5a55c3`
