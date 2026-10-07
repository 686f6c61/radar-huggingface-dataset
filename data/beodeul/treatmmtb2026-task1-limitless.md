# beodeul/treatmmtb2026-task1-limitless

## Resumen

`beodeul/treatmmtb2026-task1-limitless` no es un modelo de lenguaje, sino un modelo de segmentación de imágenes médicas presentado por el equipo Limitless a la tarea 1 (Task 1) del reto TREAT-MMTB 2026. Su función es tomar estudios en formato DICOM y producir, para cada caso, una máscara de segmentación en NIfTI (`<case_id>.nii.gz`) junto con un fichero `prediction.csv` con las columnas `our_id,cavity`. El objeto segmentado es una cavidad, y el pipeline de entrenamiento recibe directorios de imágenes de tórax (CXR) y sus máscaras de etiquetas.

El repositorio se publica como una entrega reproducible completa: incluye los pesos entrenados, el código de entrenamiento y el código de inferencia y posprocesado. La solución se estructura como un conjunto (ensemble) de tres variantes de modelo, cada una entrenada con validación cruzada de cinco particiones (folds 0 a 4), lo que da un total de quince puntos de control en formato PyTorch. Las variantes internas se identifican como `v12_4_ropad_lite_gate_boostonly` (A), `v18_hdome2ch_boostonly` (B) y `v19_dark_hbasin_sep` (C).

Es relevante ahora por dos motivos: se distribuye bajo licencia Apache-2.0, lo que permite reutilización y adaptación, y aporta material reproducible (Dockerfile, `requirements.txt` y lanzadores de entrenamiento) para quien quiera reproducir el resultado o reentrenar sobre datos propios. La información pública no detalla arquitectura interna, número de parámetros ni métricas de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; el repositorio incluye el código del modelo (`pkgs/<variant>/cavity_mtl_pkg/`) y el script `train_cavity_mtl.py` |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (no aplica; es un modelo de segmentación de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; entrada de imagen médica) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (checkpoints PyTorch; `weights/{A,B,C}/fold{0..4}.pt`, verificación por `SHA256SUMS.txt`) |

Datos adicionales de la entrega:

| Parametro | Valor |
|---|---|
| Tarea | TREAT-MMTB 2026, Task 1 (segmentación de cavidad) |
| Entrada | DICOM por caso (`input/<case_id>/*.dcm`) |
| Salida | `output/<case_id>.nii.gz` y `output/prediction.csv` (`our_id,cavity`) |
| Variantes | A `v12_4_ropad_lite_gate_boostonly`; B `v18_hdome2ch_boostonly`; C `v19_dark_hbasin_sep` |
| Estrategia | ensemble de 3 variantes con validación cruzada de 5 folds cada una (15 checkpoints) |
| Entorno | Python 3.10, torch 2.1.0 |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura neuronal subyacente. Lo que sí se documenta es la organización del código: cada variante empaqueta su propio paquete `cavity_mtl_pkg` junto a un script `train_cavity_mtl.py`, lo que sugiere un enfoque de aprendizaje multitarea ("MTL", multi-task learning) aplicado a la segmentación de cavidad. Los nombres internos de las variantes (`boostonly`, `lite_gate`, `sep`, `ropad`, `hdome2ch`, `dark_hbasin`) apuntan a distintas decisiones de diseño y posprocesado, pero no se detalla su significado ni su implementación.

El entrenamiento se lanza mediante scripts PowerShell (`train_A.ps1`, `train_B.ps1`, `train_C.ps1`) que reciben el directorio de imágenes de tórax (`-Images`) y el de etiquetas (`-Masks`), y se apoyan en ficheros de configuración (`configs/train_args_{A,B,C}.json`) con los argumentos exactos del experimento. Cada variante se entrena con cinco folds (0 a 4). No se especifican el número de tokens de entrenamiento (no aplica), la composición del dataset, ni si se emplearon técnicas como RLHF o DPO (tampoco aplican a este tipo de modelo). La inferencia ensambla las variantes y aplica posprocesado posterior.

## Capacidades

- Segmentación de cavidad sobre estudios en formato DICOM, generando máscaras volumétricas en NIfTI.
- Salida tabular auxiliar (`prediction.csv`) con identificador de caso y etiqueta de cavidad.
- Inferencia en modo ensemble sobre tres variantes independientes, cada una con cinco folds.
- Posprocesado integrado en el propio script de inferencia (`predict.py`).
- Entrenamiento y reentrenamiento reproducibles a partir del código incluido y de los argumentos de configuración documentados.
- Despliegue reproducible mediante Docker con soporte de GPU (`docker run --rm --gpus all`).
- No se declaran capacidades de generación de texto, razonamiento lingüístico, tool calling, agentes, visión general, audio ni multilingüismo, ya que el modelo opera sobre imagen médica.

## Casos de uso

- Apoyo a la lectura radiológica de cavidades: el modelo procesa directamente los DICOM de cada caso y devuelve una máscara NIfTI, lo que permite superponer la segmentación sobre el estudio original en el visor del radiólogo.
- Investigación en imagen torácica: al entregar máscaras de cavidad estandarizadas, facilita estudios cuantitativos sobre morfología y extensión de lesiones cavitadas.
- Preetiquetado para anotación: las máscaras generadas pueden servir como propuesta inicial que un especialista revise y corrija, reduciendo el tiempo de anotación manual.
- Reentrenamiento sobre datos propios: la licencia Apache-2.0 y la inclusión de `train_cavity_mtl.py` y de los scripts `train_{A,B,C}.ps1` permiten ajustar las variantes a cohortes locales con otro protocolo de adquisición.
- Reproducción de resultados del reto: la entrega incluye los argumentos exactos (`train_args_{A,B,C}.json`) y los checkpoints verificables por `SHA256SUMS.txt`, lo que permite reproducir el pipeline completo.
- Integración en pipelines de imagen médica: la conversión DICOM a NIfTI y la salida en CSV encajan en flujos de preprocesado y en sistemas de gestión de estudios que consumen artefactos tabulares.
- Despliegue en infraestructura con GPU: el Dockerfile y el `requirements.txt` permiten empaquetar el modelo como servicio de inferencia dentro de una red hospitalaria o de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (Dice, IoU, sensibilidad, especificidad ni resultados del reto TREAT-MMTB 2026) ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se documenta el consumo de memoria ni el número de parámetros por variante.
- GPU recomendadas: no disponible. El repositorio exige acceso a GPU en el arranque de Docker (`--gpus all`) y depende de CUDA a través de PyTorch 2.1.0.
- Ejecución en GPU de consumo: no disponible. El tamaño del repositorio (1,8 GB para 15 checkpoints) no permite deducir de forma fiable el tamaño de cada modelo, por lo que no se puede confirmar si cabe en GPU de gama de consumo.
- Opciones de despliegue documentadas: ejecución directa con Python 3.10 y PyTorch 2.1.0 (`python predict.py --input ... --output ... --weights ...`) y ejecución en contenedor (`docker build` + `docker run --gpus all`).
- Latencia y throughput: no disponibles.
- Entrenamiento: requiere GPU con CUDA; se lanza desde PowerShell mediante `train_A.ps1`, `train_B.ps1` y `train_C.ps1`; no se especifican tiempos ni recursos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación de cavidad ni con las soluciones de otros equipos del reto TREAT-MMTB 2026, y no se ofrecen parámetros, contexto ni métricas que permitan establecer una comparación objetiva.

## Limitaciones y advertencias

- Ausencia de métricas: no se publican resultados de validación ni de test, por lo que no es posible evaluar la fiabilidad clínica del modelo a partir de la información disponible.
- Documentación incompleta: no se especifican arquitectura, número de parámetros, datos de entrenamiento ni el significado de los identificadores internos de las variantes.
- Riesgo de sesgo de dominio: al ser un modelo entrenado para un reto concreto con un protocolo de adquisición determinado, puede degradarse ante equipos, poblaciones o parámetros de imagen distintos a los del conjunto de entrenamiento.
- Validación clínica pendiente: un modelo de segmentación médica no debe emplearse para decisiones diagnósticas sin validación prospectiva, control regulatorio y supervisión profesional.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero no exime del cumplimiento de la normativa de productos sanitarios (por ejemplo, marcado CE o autorización equivalente) si se emplea en contexto clínico.
- Reproducibilidad: aunque se aportan los argumentos de entrenamiento y los checkpoints, no se documenta el conjunto de datos exacto, lo que dificulta la reproducción completa.
- Dependencias concretas: el uso está ligado a Python 3.10 y torch 2.1.0, lo que puede condicionar la integración en entornos con otras versiones.
- Actividad nula en la plataforma: el repositorio registra cero descargas y cero "likes" en el momento de la consulta, sin comunidad que valide su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/beodeul/treatmmtb2026-task1-limitless
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
