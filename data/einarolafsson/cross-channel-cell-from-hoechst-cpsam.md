# einarolafsson/cross-channel-cell-from-hoechst-cpsam

## Resumen

Cross-channel cell from hoechst (Cellpose-SAM) es un modelo de segmentación de imágenes de microscopía publicado por el usuario einarolafsson en HuggingFace. Se trata de un ajuste fino del modelo base `cpsam_v2` de Cellpose-SAM, entrenado durante 100 épocas en modo fichero, cuyo objetivo es generar máscaras celulares completas a partir de la señal del canal nuclear (Hoechst), es decir, resolver una tarea cross-channel: predecir la célula entera cuando solo se dispone de tinción nuclear.

El modelo está pensado para integrarse en spaCR, una herramienta de análisis fenotípico espacial de cribados de microscopía de alto contenido, y también puede usarse directamente con la librería Cellpose. El caso de uso declarado gira en torno a experimentos con Toxoplasma, donde la máscara celular obtenida se combina con modelos de patógeno para analizar la infección a nivel de célula individual.

Su relevancia es práctica y muy acotada: sobre el holdout del propio autor mejora el F1 de 0,3012 (modelo base) a 0,8697 (mejor época), un incremento absoluto de 0,5685. No es un modelo de propósito general ni un modelo de lenguaje: es un segmentador especializado, con licencia CC-BY-4.0, sin descargas ni valoraciones registradas en el momento de la consulta y con un repositorio de 12,2 GB que incluye pesos, checkpoints y artefactos de control de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (ajuste fino de `cpsam_v2`); no se detalla la composicion interna en la informacion disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (modelo de segmentacion de imagenes; no aplica ventana de tokens) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | pesos de Cellpose descargables con `hf_hub_download("einarolafsson/cross-channel-cell-from-hoechst-cpsam", "weights/cell_from_hoechst")`; extension concreta no disponible |
| Tarea (pipeline) | image-segmentation |
| Modelo base | `cpsam_v2` (CellposeSAM) |
| Entrenamiento | 100 epocas, modo fichero |
| Version de Cellpose | 4.0.9 (entrenamiento y evaluacion) |
| Tamano del repositorio | 12,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-18 / 2026-09-18 |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se obtiene por ajuste fino del checkpoint `cpsam_v2` de Cellpose-SAM. No se especifican en la model card el numero de parametros, el tipo de backbone, la resolucion de entrada ni los hiperparametros de entrenamiento mas alla de las 100 epocas y el modo fichero. El entrenamiento se ejecuto en una NVIDIA GeForce RTX 3090 Ti con Cellpose 4.0.9, version usada tambien para la evaluacion.

Los datos de entrenamiento son 2.578 campos anotados (237.957 objetos) y 451 campos de test reservados (45.098 objetos). La particion se hizo por pozo, de modo que ningun pozo aparece simultaneamente en entrenamiento y test, lo que reduce el riesgo de fuga de informacion entre particiones. La evaluacion se realiza a IoU entre 0,50 y 0,95 en pasos de 0,05, y cada modelo se compara contra el `cpsam_v2` original sobre el mismo holdout. El repositorio incluye `training/fields.csv` con el reparto por campo, curvas de perdida por epoca (`loss_per_epoch.csv`), metricas por checkpoint (`metrics.csv`), un `report.json` y el directorio `qc/` con metricas por imagen, por rango de IoU, resumenes por etiqueta y `comparison_vs_stock.csv`. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de segmentacion.

## Capacidades

- Segmentacion de celulas a partir del canal nuclear (Hoechst): genera la mascara celular completa cuando la imagen de entrada corresponde al canal nuclear.
- Segmentacion cross-channel: la model card indica explicitamente que el modelo lee un canal de mascara celular (`cell_channel`) distinto del canal nuclear (`nucleus_channel`).
- Integracion con spaCR mediante el ajuste `custom_model`, aceptando una ruta a un modelo Cellpose personalizado.
- Uso directo con la API de Cellpose: `models.CellposeModel(gpu=True, pretrained_model=ruta)` y `eval(img, normalize=True)`.
- Segmentacion de instancias en imagenes de microscopia de alto contenido (HCS), con metricas de instancia (AJI, Dice, F1, precision, recall, mAP).
- Inferencia en GPU (se uso una RTX 3090 Ti en el desarrollo).
- Contexto de aplicacion en estudios de Toxoplasma, combinable con los modelos de patogeno de spaCR (`toxo_pv_lumen`, `toxo_cyto`).
- No dispone de generacion de texto, tool calling, capacidades de agente, vision general, audio ni modo de razonamiento. No es un modelo multimodal de proposito general.

## Casos de uso

- Segmentacion celular en cribados de alto contenido con un unico canal nuclear: si la placa solo dispone de tincion Hoechst, el modelo reconstruye la mascara de la celula completa, lo que evita repetir el experimento con un canal de membrana o citoplasma.
- Analisis fenotipico espacial con spaCR: se configura `custom_model` con la ruta de los pesos y se ejecuta `preprocess_generate_masks`, obteniendo mascaras por pozo para calcular morfologia, intensidad y vecindad celular.
- Estudios de infeccion por Toxoplasma: la mascara celular del huesped se combina con los modelos de patogeno disponibles en spaCR para cuantificar carga parasitaria por celula.
- Cribados geneticos o farmacologicos a gran escala: el modelo procesa los campos de una placa completa de forma desatendida, lo que permite puntuar miles de condiciones experimentales con un unico modelo afinado.
- Reanalisis de datos historicos: conjuntos de imagenes antiguos que solo conservan el canal Hoechst pueden reutilizarse para extraer conteos y morfometria celular sin volver a adquirir las muestras.
- Control de calidad y cuantificacion morfometrica: la salida de mascaras permite calcular area, excentricidad, solidez y numero de objetos por campo, con las metricas de instancia del propio modelo como referencia de fiabilidad.
- Generacion de mascaras para analisis de celula individual en pipelines de imagen: las mascaras resultantes alimentan pasos posteriores de cuantificacion de intensidad por celula o de analisis de vecindad.
- Procesamiento por lotes en entornos con GPU: al usar `CellposeModel(gpu=True)` puede integrarse en scripts de procesamiento masivo de placas, siempre pasando una ruta de fichero valida como `pretrained_model`.

## Benchmarks y rendimiento

Resultados sobre el holdout del autor (451 campos, 45.098 objetos; mejor epoca 70):

| Modelo | F1 | Precision | Recall | mAP | AJI | Dice |
|---|---|---|---|---|---|---|
| stock `cpsam_v2` | 0,3012 | 0,3086 | 0,2942 | 0,0575 | 0,3506 | 0,5235 |
| Best (epoca 70) | 0,8697 | 0,9437 | 0,8064 | 0,5591 | 0,7991 | 0,8948 |
| Final | 0,8667 | 0,9429 | 0,8018 | 0,5520 | 0,7929 | 0,8904 |

La mejora de F1 respecto al modelo base es de 0,5685 puntos absolutos (2,89x). El propio autor advierte que la razon de mejora en mAP esta inflada por un denominador casi nulo en el modelo base (0,0575) y recomienda citar la diferencia absoluta, no el cociente. Las metricas se calculan a IoU de 0,50 a 0,95 en pasos de 0,05. No hay resultados publicados en la informacion disponible para otros conjuntos de datos distintos del holdout descrito.

## Requisitos de hardware

- Entrenamiento declarado: una NVIDIA GeForce RTX 3090 Ti (24 GB de VRAM) con Cellpose 4.0.9.
- VRAM de inferencia: no disponible. No se publican mediciones de consumo de memoria por cuantizacion ni por tamano de campo.
- GPU recomendadas: no disponibles de forma especifica; el desarrollo se hizo en una RTX 3090 Ti, por lo que una GPU consumer de gama alta con 24 GB es suficiente para reproducir el flujo de trabajo descrito.
- Compatibilidad con GPU consumer: probable en tarjetas con memoria suficiente para el modelo base de Cellpose-SAM, aunque no se documentan los requisitos minimos.
- Ejecucion en CPU: la API de Cellpose admite `gpu=False`, pero la model card no aporta datos de latencia ni de viabilidad practica en CPU para este ajuste fino.
- Opciones de despliegue: libreria Cellpose (`cellpose.models.CellposeModel`), spaCR via `pip install spacr` o `conda install -c conda-forge spacr`, y descarga de pesos con `huggingface_hub`. No aplican servidores de inferencia tipo vLLM, TGI, Ollama o llama.cpp, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | F1 en el holdout del autor | Licencia | Disponibilidad |
|---|---|---|---|---|
| cross-channel-cell-from-hoechst-cpsam | Segmentacion de celula completa desde canal nuclear | 0,8697 (mejor epoca) | CC-BY-4.0 | HuggingFace, 0 descargas |
| stock `cpsam_v2` (Cellpose-SAM) | Segmentacion generalista de celulas | 0,3012 | no disponible en la informacion proporcionada | Modelo base de Cellpose |
| Otros segmentadores generalistas (Cellpose, StarDist, SAM aplicado a microscopia) | Segmentacion de instancias | no disponible | no disponible | no disponible |

La comparacion cuantitativa solo es posible frente al checkpoint base, porque es el unico modelo que el autor evaluo sobre el mismo holdout y con el mismo protocolo. No hay datos de benchmarks de terceros ni comparaciones independientes en la informacion disponible.

## Limitaciones y advertencias

- El modelo es un ajuste fino de dominio: los resultados (F1 0,8697) corresponden al holdout del propio autor y a su distribucion de imagenes. No hay evidencia de generalizacion a otros microscopios, tinciones o tipos celulares.
- La model card advierte una cautela metodologica: la mejora en mAP esta inflada por un denominador casi nulo del modelo base (0,0575) y debe citarse como diferencia absoluta (0,5685 en F1), no como ratio.
- Dependencia del canal y del montaje experimental: el flujo de spaCR requiere declarar `cell_channel` y `nucleus_channel` correctamente; una configuracion erronea produce mascaras incorrectas de forma silenciosa.
- Riesgo de falsos positivos y falsos negativos en segmentacion: la precision es alta (0,9437) pero el recall es mas bajo (0,8064), de modo que se pierden aproximadamente una quinta parte de los objetos reales en el holdout.
- En spaCR, el ajuste `pathogen_model` no acepta rutas libres: se valida contra la lista fija `['toxo_pv_lumen', 'toxo_cyto']`. Un modelo personalizado debe pasarse por `custom_model`.
- Al usar Cellpose directamente hay que pasar siempre una ruta real al fichero de pesos: un nombre suelto no reconocido hace que Cellpose sustituya el modelo por su predeterminado sin avisar, lo que devuelve pesos equivocados.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor y la indicacion de los cambios realizados. El uso derivado debe mantener esas condiciones.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, por lo que no existe retroalimentacion externa ni replicacion independiente de los resultados.
- Limitaciones de contexto e idioma: no aplican ventana de contexto ni soporte multilingue, ya que no es un modelo de lenguaje.
- No se documentan sesgos del dataset (composicion por tipo celular, origen de las muestras, posibles desequilibrios entre pozos) mas alla del numero total de campos y objetos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/einarolafsson/cross-channel-cell-from-hoechst-cpsam
- Dataset de entrenamiento: https://huggingface.co/datasets/einarolafsson/cross-channel-cell-from-hoechst
- Repositorio de spaCR: https://github.com/EinarOlafsson/spacr
- Paquete en PyPI: https://pypi.org/project/spacr/
- Paquete en conda-forge: https://anaconda.org/conda-forge/spacr
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos trataban sobre gastronomia vietnamita y no guardan relacion con el contenido de esta ficha). No se dispone de articulo, paper ni demo adicionales en la informacion proporcionada.
