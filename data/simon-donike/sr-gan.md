# simon-donike/SR-GAN

## Resumen

OpenSR SRGAN es un conjunto de modelos de superresolución (image-to-image) orientados a imagenes de teledeteccion, desarrollado por simon-donike dentro del ecosistema ESAOpenSR. El repositorio empaqueta tres presets preentrenados: SEN2-SR (4x sobre las bandas B04/B03/B02/B08 de Sentinel-2), RGB-NIR (4x sobre 4 bandas) y SWIR (8x sobre 6 bandas). El modelo resuelve el problema de aumentar la resolucion espacial de imagenes satelitales manteniendo coherencia espectral entre bandas, algo critico para analisis geoespacial de detalle fino.

La implementacion se basa en una arquitectura GAN de superresolucion (estilo ESRGAN) adaptada al dominio de observacion de la Tierra, distribuida como paquete Python instalable (`opensr-srgan`) con pesos en formato `.ckpt` (PyTorch). El repositorio ocupa 1,1 GB e incluye checkpoints de inferencia y de entrenamiento, configuraciones, splits de validacion cruzada entre sensores y artefactos de verificacion de integridad (SHA256SUMS, manifest.json).

Es relevante para investigadores y equipos de teledeteccion que necesiten aumentar la resolucion de productos Sentinel-2 sin recurrir a modelos genericos de vision, ya que los presets estan entrenados especificamente sobre distribuciones de reflectancia de sensores remotos y mantienen trazabilidad de entrenamiento reproducible (provenance, lineage, entorno de ejecucion registrado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN de superresolucion (estilo ESRGAN) adaptada a teledeteccion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.ckpt` sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | `.ckpt` (PyTorch checkpoint) para inferencia y entrenamiento |

Presets incluidos:

| Preset | Entrada / escala | Checkpoints |
|---|---|---|
| SEN2-SR | B04/B03/B02/B08, 4x | inference.ckpt, training.ckpt |
| RGB-NIR | 4 bandas, 4x | inference.ckpt |
| SWIR | 6 bandas, 8x | inference.ckpt |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de las redes generativas adversarias para superresolucion (SRGAN/ESRGAN), con un generador que aprende a mapear imagenes de baja resolucion a alta resolucion y un discriminador que penaliza la diferencia perceptual respecto a la referencia. La adaptacion al dominio de teledeteccion implica trabajar con tensores multibanda (BCHW en unidades de DN brutas, segun el ejemplo de la model card) y preservar la relacion entre bandas espectrales, no solo la nitidez visual.

El repositorio documenta el proceso de entrenamiento con artefactos de procedencia: `executed_training.yaml`, `lineage.json`, `environment.txt` y `source_at_stop.tar.gz`, ademas de un split de validacion cruzada entre sensores (`splits/crosssensor.json`) y metricas de validacion (`metrics/validation.json`). No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un modelo de imagen). Tampoco se detalla el numero de parametros del generador ni del discriminador.

## Capacidades

- Superresolucion de imagenes multibanda de Sentinel-2 (bandas B04, B03, B02, B08) con factor 4x en el preset SEN2-SR.
- Superresolucion 4x sobre imagenes de 4 bandas (RGB + NIR) en el preset RGB-NIR.
- Superresolucion 8x sobre imagenes de 6 bandas en el preset SWIR.
- Procesamiento por lotes de tensores BCHW en unidades de reflectancia digital (DN).
- Entrada/salida en tensores PyTorch en CPU (`predict_step` devuelve tensores CPU).
- Soporte de inferencia sobre GeoTIFF mediante el ejemplo `infer_geotiff.py`.
- Reanudacion de entrenamiento a partir del checkpoint de entrenamiento (`resume_training.py`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de texto o audio: es exclusivamente un modelo de imagen.

## Casos de uso

- Downscaling de productos Sentinel-2 para analisis urbano de detalle: aplicar SEN2-SR 4x sobre recortes de 10 m para obtener una representacion a 2,5 m que facilite la delimitacion de edificios y viales en estudios de expansion urbana.
- Monitorizacion agricola de parcelas: usar RGB-NIR 4x para mejorar la resolucion de indices de vegetacion (NDVI) calculados sobre las bandas rojo e infrarrojo cercano, permitiendo detectar estres hidrico a escala de subparcela.
- Analisis de humedad y mineralogia: el preset SWIR 8x permite aumentar la resolucion de bandas de infrarrojo de onda corta, util para discriminacion de tipos de suelo y deteccion de contenido de agua en superficie.
- Generacion de datos de entrenamiento aumentados: emplear el checkpoint de entrenamiento y los scripts de reanudacion para hacer fine-tuning sobre nuevas regiones o sensores, ampliando la cobertura geografica del modelo.
- Preprocesado en pipelines de teledeteccion: integrar `load_inference_model("SEN2-SR")` en flujos existentes basados en PyTorch para mejorar la resolucion de mosaicos antes de tareas de segmentacion o deteccion de cambios.
- Evaluacion comparativa de tecnicas de superresolucion: usar los tres presets como baseline reproducible (con split cross-sensor y metricas de validacion publicadas) en estudios academicos sobre SR en observacion de la Tierra.
- Verificacion de integridad en produccion cientifica: los ficheros `manifest.json` y `SHA256SUMS` permiten auditar que los pesos desplegados corresponden a la release oficial, requisito habitual en publicaciones y pipelines de datos geoespaciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `metrics/validation.json` y verificaciones de inferencia (`verification/inference.json`, `resume_original.json`, `resume_promotion.json`), pero sus valores numericos no se detallan en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 1,1 GB e incluye tres checkpoints de inferencia mas uno de entrenamiento; el checkpoint individual de inferencia es presumiblemente de menor tamano, pero no se publica el desglose por fichero.
- GPU recomendadas: no especificadas por el autor. Por el tipo de modelo (GAN de superresolucion de imagen) es esperable que funcione en GPUs consumer, pero no hay datos confirmados.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: paquete Python `opensr-srgan` instalable desde `git+https://github.com/ESAOpenSR/SRGAN.git@dev`; inferencia via `load_inference_model` y `predict_step`; ejemplos para tensores y GeoTIFF. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de imagen de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de parametros de este modelo en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas como Real-ESRGAN, SwinIR o SEN2SR. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenSR SRGAN (SEN2-SR) | no disponible | no aplica | MIT | Hugging Face + GitHub ESAOpenSR |
| Alternativas de SR en teledeteccion | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en imagenes de teledeteccion; no es un modelo de texto ni multimodal y no debe evaluarse con criterios de LLM.
- Los presets estan ligados a bandas y sensores concretos (Sentinel-2 B04/B03/B02/B08 para SEN2-SR; 4 bandas para RGB-NIR; 6 bandas para SWIR); aplicar un preset a un sensor o conjunto de bandas distinto puede producir resultados incorrectos.
- Riesgo de artefactos y alucinacion visual: como toda GAN de superresolucion, puede generar texturas plausibles pero inexistentes en la escena real, lo que invalida su uso para mediciones fisicas directas sin validacion.
- No se documentan sesgos geograficos o climaticos del dataset de entrenamiento; es probable que el rendimiento varie segun la region y la cobertura del suelo, pero no hay datos confirmados.
- Licencia MIT: permite uso comercial, pero debe revisarse `NOTICE.md` para el alcance exacto sobre datos de ejemplo y fuentes archivadas.
- El paquete se instala desde la rama `dev` del repositorio GitHub, lo que implica que la API puede cambiar sin versionado estable.
- No hay informacion sobre latencia, throughput ni requisitos minimos de memoria, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/simon-donike/SR-GAN
- Repositorio del paquete: https://github.com/ESAOpenSR/SRGAN (rama `dev`)
- Model card SEN2-SR v1: models/sen2-sr/v1/README.md (dentro del repositorio)
- Model card RGB-NIR v1: models/rgb-nir/v1/README.md (dentro del repositorio)
- Model card SWIR v1: models/swir/v1/README.md (dentro del repositorio)
- Ejemplos de inferencia y reanudacion: examples/README.md (dentro del repositorio)
- Artefactos de ejemplo: data/examples/README.md (dentro del repositorio)
- Licencia: LICENSE (MIT) y NOTICE.md (dentro del repositorio)
