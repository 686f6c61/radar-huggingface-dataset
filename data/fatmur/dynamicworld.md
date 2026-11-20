# fatmur/dynamicworld

## Resumen

`fatmur/dynamicworld` es un repositorio de Hugging Face que no contiene pesos de un modelo fundacional, sino el codigo de experimentos y las configuraciones para una tarea de segmentacion semantica de cobertura terrestre sobre imagenes Sentinel-2 L2A. El objetivo es clasificar cada pixel en una de las nueve clases del esquema Dynamic World (cobertura del suelo), emparejando anotaciones humanas con imagenes satelitales en la misma cuadricula. El autor, `fatur`, mantiene una arquitectura de tres repositorios: este (codigo y configs), un repositorio de dataset (`datasets/fatmur/dynamicworld`) y repositorios de modelos publicados individualmente (por ejemplo `fatmur/dynamicworld-small-cnn`).

El entrenamiento se ejecuta mediante `GeoSave` y su `LightningCLI` (`main.py`), con configuraciones autocontenidas en `configs/`. La tarea es segmentacion semantica pura: cada muestra es una imagen de 510×510 px con su anotacion original en la misma cuadricula. El plan de experimentos contempla una escalera de modelos (desde una CNN pequena con UNet sobre RGB hasta DINOv3 S/16 + DPT sobre GPU) para medir el compromiso entre precision y velocidad de inferencia.

Es relevante ahora porque expone un pipeline completo y reproducible de extremo a extremo para segmentacion geoespacial: preparacion de datos con procedencia, entrenamiento supervisado, validacion sobre escenas completas, publicacion en el Hub y una API de inferencia georreferenciada. No obstante, en el momento de redactar esta ficha no hay pesos publicados en este repositorio ni resultados de benchmarks completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo unico: configuraciones de segmentacion semantica (CNN pequena + UNet sobre RGB; DINOv3 S/16 + DPT sobre GPU, esta ultima aun no entrenada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 510×510 px por muestra |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de vision por satelite, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible en este repositorio; los modelos publicados se distribuyen en repos separados (`fatmur/dynamicworld-<model>`) |

## Arquitectura y entrenamiento

El repositorio define una tarea de segmentacion semantica supervisada con un esquema de codificador/decodificador configurable. La configuracion de referencia `small_cnn_unet.yaml` usa una CNN pequena con UNet sobre canales RGB y esta pensada para ejecucion en CPU; la configuracion `dinov3_s_dpt.yaml` plantea DINOv3 S/16 como codificador con un decodificador DPT sobre GPU, aunque segun la model card aun no ha sido entrenada. El codigo organiza los componentes en `modules/supervised/` con `SceneDataset` (GeoTIFF de imagen + GeoTIFF de etiqueta), `DataModule` (lotes, recortes y aumentos) y `Module` (entrena sobre recortes y valida sobre escenas completas).

El flujo de datos parte de `data/processed/scene.parquet` con seleccion explicita de split y fuente; cada configuracion fija la seleccion de datos, el esquema de etiquetas y los ajustes del modelo. La ingesta descubre STAC Items de origen, adquiere cada escena una sola vez y escribe rutas, metadatos de bioma, geometria y diagnosticos. Las etiquetas originales se remapean solo en memoria dentro de `SceneDataset`, y la publicacion reutiliza los mismos nombres de clase y colores. El entrenamiento se ejecuta con `python main.py fit --config configs/small_cnn_unet.yaml`; la seleccion del mejor checkpoint se hace por `val_iou_macro`. La evaluacion final (`main.py test`) puntua solo el subconjunto de test ingerido, y la model card advierte que hay que adquirir la cohorte completa de 409 escenas antes de reportar un benchmark completo.

## Capacidades

- Segmentacion semantica de imagenes Sentinel-2 L2A en las nueve clases de cobertura terrestre del esquema Dynamic World.
- Procesamiento de escenas geoespaciales completas mediante troceado (`chip_size`, `chip_stride`, `chip_mode`, `merge_window`, `chip_batch_size`) y fusion de predicciones.
- Pipeline de inferencia georreferenciada cargable con `geosave.ml.load_pipeline` y ejecutable sobre `xarray.DataTree`.
- Entrenamiento supervisado con validacion sobre escenas completas y aumentos de datos.
- Publicacion automatizada de checkpoints al Hub mediante `scripts/publish.py`, con exportacion local opcional.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de vision por satelite, no un modelo de lenguaje.

## Casos de uso

- Monitorizacion de cobertura del suelo a escala regional: el pipeline acepta escenas Sentinel-2 L2A y produce mapas de las nueve clases Dynamic World, adecuado para seguimiento periodico de cambios en el territorio.
- Comparacion de arquitecturas por coste/precision: el plan de experimentos publica una escalera de modelos y mide velocidad frente a precision, lo que permite elegir la variante adecuada para un presupuesto de computo dado.
- Despliegue en entornos sin GPU: la configuracion `small_cnn_unet.yaml` esta disenada para CPU, lo que facilita prototipos y validacion en estaciones de trabajo sin acelerador.
- Integracion en pipelines geoespaciales existentes: la API basada en `xarray` y `GeoSave` permite encadenar la inferencia con herramientas de analisis raster ya establecidas.
- Reproducibilidad de experimentos: cada configuracion es autocontenida y fija la seleccion de datos y el esquema de etiquetas, lo que permite repetir entrenamientos y auditorias de procedencia.
- Generacion de productos georreferenciados: `publish.py` reconstruye el pipeline y lo empaqueta con sus ajustes de preprocesado y troceado, de modo que la inferencia en produccion prepara el raster exactamente igual que en entrenamiento y validacion.
- Investigacion sobre segmentacion supervisada con anotaciones humanas: el repositorio de dataset documenta tablas originales, fuentes de anotacion, reglas de votacion y solapamiento de escenas en `eda.ipynb`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion final solo puntua el subconjunto de test ingerido y que es necesario adquirir la cohorte completa de 409 escenas antes de reportar un resultado de benchmark completo. La metrica de seleccion de checkpoint es `val_iou_macro`, pero no se proporcionan valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; la configuracion DINOv3 S/16 + DPT esta pensada para GPU, pero no se detallan modelos concretos.
- Ejecucion en CPU: la configuracion `small_cnn_unet.yaml` (CNN pequena + UNet sobre RGB) esta disenada explicitamente para CPU.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: pipeline nativo de `GeoSave` (`geosave.ml.load_pipeline`) sobre `xarray`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta tarea.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de segmentacion de cobertura terrestre ni datos de rendimiento que permitan establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Este repositorio contiene codigo y configuraciones, no pesos de modelo; los pesos publicados residen en repositorios separados (`fatmur/dynamicworld-<model>`).
- La configuracion DINOv3 S/16 + DPT figura como no entrenada en la model card.
- Los resultados de test solo cubren el subconjunto ingerido; la cohorte completa de 409 escenas no esta disponible para un benchmark completo.
- La licencia no esta indicada, por lo que no se puede confirmar el uso comercial.
- La tarea esta limitada a las nueve clases del esquema Dynamic World y a imagenes Sentinel-2 L2A de 510×510 px por muestra; no hay soporte de otros sensores ni de otras resoluciones documentado.
- Al ser un modelo de vision por satelite, no procesa lenguaje ni soporta interaccion conversacional, tool calling o agentes.
- No se documentan sesgos especificos, riesgos de alucinacion ni limitaciones por idioma; en su lugar, los riesgos propios son errores de clasificacion por pixel y dependencia de la calidad de las anotaciones humanas y de las reglas de votacion descritas en `eda.ipynb`.
- El checkpoint heredado en la ruta superior `checkpoints/last.ckpt` se conserva como resultado de entrenamiento existente, pero no es el destino de las configuraciones actuales.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/fatmur/dynamicworld
- Repositorio de dataset: https://huggingface.co/datasets/fatmur/dynamicworld
- Modelo publicado de ejemplo: https://huggingface.co/fatmur/dynamicworld-small-cnn
