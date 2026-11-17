# iclr-submission-58778/rcqfusion-vod

## Resumen

RCQFusion es un modelo de deteccion 3D de objetos que combina radar y camara para conduccion autonoma, entrenado y evaluado sobre el dataset View of Delft (VoD) del TU Delft. Lo publica el autor `iclr-submission-58778` en Hugging Face, presumiblemente en el contexto de un envio a ICLR, y predice tres clases: peaton, ciclista y coche. No es un modelo de lenguaje: es un detector multimodal con backbone de vision y fusion radar-camara, empaquetado sobre el stack MMDetection3D 1.0.0rc6.

El repositorio contiene unicamente el checkpoint de inferencia (`weights/rcqfusion_vod.pth`, ~0,2 GB), los scripts de conversion de datos de VoD y el codigo de evaluacion. No incluye el dataset ni los indices generados, que deben construirse con los scripts `tools/create_vod_infos.py` y `tools/create_vod_temporal_infos.py`. La configuracion de inferencia es `configs/rcqfusion_vod.py`.

Su relevancia practica es acotada pero concreta: ofrece un checkpoint reproducible con resultados oficiales AP11 sobre el split de validacion de VoD (1.296 fotogramas) y una integracion completa con MMDetection3D, lo que facilita la comparacion con otras lineas de investigacion en deteccion radar-camara. La informacion publicada no detalla arquitectura interna, numero de parametros ni regimen de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector 3D multimodal radar-camara sobre MMDetection3D 1.0.0rc6) |
| Parametros totales | no disponible (checkpoint de ~0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP16 en la ejecucion de referencia; no se documentan otras |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible en la model card; el codigo y componentes de terceros se rigen por `licenses/THIRD_PARTY_NOTICES.md` y el uso del dataset por la licencia de investigacion de VoD |
| Formato de pesos | `.pth` (PyTorch), checkpoint en `weights/rcqfusion_vod.pth` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna: no se especifica si el backbone es una red convolutional, un transformer o una combinacion, ni como se realiza la fusion radar-camara (early, mid o late fusion). El nombre "RCQFusion" sugiere un modulo de fusion, pero no hay detalle tecnico publicado. El modelo se ejecuta sobre MMDetection3D 1.0.0rc6, lo que implica el uso de operadores CUDA especificos: atencion deformable, convolucion deformable y voxelizacion, requeridos por el build de MMCV con operadores CUDA.

Tampoco se documentan el volumen de datos de entrenamiento, la composicion del dataset, ni si hubo etapas de refinamiento. El checkpoint contiene el modelo de inferencia completo y no requiere ficheros de inicializacion de backbone separados. La evaluacion de referencia se realizo con PyTorch 1.9.1+cu111, torchvision 0.10.1+cu111, mmcv-full 1.6.0, MMDetection 2.28.2 y MMDetection3D 1.0.0rc6 sobre una NVIDIA RTX A5000, con FP16 y una sola GPU.

## Capacidades

- Deteccion 3D de objetos en escenas de conduccion autonoma sobre el dataset View of Delft.
- Clasificacion y localizacion de tres clases: peaton, ciclista y coche.
- Fusion multimodal radar-camara: utiliza imagenes de camara frontal e informacion de radar de 5 fotogramas.
- Uso de metadatos temporales de secuencia para enlazar fotogramas consecutivos.
- Evaluacion con la metrica oficial AP11 de VoD sobre el split de validacion.
- Soporte de ejecucion multi-GPU mediante `VOD_GPUS` y `CUDA_VISIBLE_DEVICES`.
- No soporta tool calling, agentes, generacion de texto ni capacidades linguisticas: es exclusivamente un detector visual.

## Casos de uso

- Investigacion en deteccion radar-camara: sirve como baseline reproducible con checkpoint publico y resultados AP11 documentados sobre VoD, lo que permite comparar nuevas propuestas de fusion multimodal bajo la misma configuracion de evaluacion.
- Validacion de pipelines de datos de VoD: los scripts `create_vod_infos.py` y `create_vod_temporal_infos.py` permiten generar indices de deteccion y metadatos temporales, utiles para preparar experimentos propios sobre el mismo dataset.
- Prototipado de percepcion para conduccion urbana: el modelo detecta peatones, ciclistas y coches en escenas de Delft, un entorno urbano con trafico mixto, adecuado para estudiar la deteccion de usuarios vulnerables de la via.
- Analisis de robustez radar frente a camara: al combinar ambos sensores, permite estudiar el comportamiento en condiciones de iluminacion adversa o con oclusiones parciales, aunque no se publican experimentos especificos de ablacion.
- Evaluacion comparativa de detectores 3D: la integracion con MMDetection3D 1.0.0rc6 facilita sustituir la configuracion `configs/rcqfusion_vod.py` por otras y comparar resultados bajo la misma metrica AP11.
- Reproduccion de resultados academicos: el checkpoint con SHA-256 `0d7e036fed3b374aedae291c7a9ed33766bdf7d3371fcb33261f6383e41b43b4` y la configuracion documentada permiten verificar los numeros publicados en el split de validacion.
- Formacion y docencia: como ejemplo practico de pipeline completo de deteccion 3D multimodal con MMDetection3D, incluyendo conversion de dataset, inferencia y evaluacion.

## Benchmarks y rendimiento

Resultados oficiales AP11 (porcentaje) sobre 1.296 fotogramas de validacion de VoD, ejecucion monogpu con FP16:

| Region de evaluacion | Peaton | Ciclista | Coche | mAP |
|---|---:|---:|---:|---:|
| Area completa | 53,6420 | 76,2288 | 54,1849 | 61,3519 |
| ROI del corredor de conduccion | 63,4496 | 90,8399 | 79,4648 | 77,9181 |

Con la combinacion alternativa de NumPy/Numba de `requirements-reference.txt` se obtuvo 61,3333 mAP en area completa y 77,9097 mAP en ROI en una ejecucion separada monogpu. No se publican comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint ocupa ~0,2 GB y la ejecucion de referencia corre en una NVIDIA RTX A5000 (24 GB) con FP16.
- GPU recomendadas: NVIDIA RTX A5000 (configuracion validada por el autor); no se documentan otras GPU probadas.
- GPU consumer: no se confirma compatibilidad con GPU consumer; requiere operadores CUDA de MMCV (atencion deformable, convolucion deformable, voxelizacion) y un driver compatible con CUDA 11.1.
- Despliegue: script `tools/infer_vod.sh` sobre MMDetection3D 1.0.0rc6 incluido en `vendor/mmdetection3d`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Multi-GPU: soportado mediante `VOD_GPUS=2` y `CUDA_VISIBLE_DEVICES=0,1`.
- Latencia y throughput: no disponibles.
- Entorno: Python 3.8, PyTorch 1.9.1+cu111, torchvision 0.10.1+cu111, mmcv-full 1.6.0 con operadores CUDA, MMDetection 2.28.2, MMDetection3D 1.0.0rc6, Linux.
- La instalacion completa no ha sido verificada en una maquina limpia segun el autor; la disponibilidad de wheels y los drivers GPU deben ser compatibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros detectores radar-camara ni con otros modelos evaluados sobre View of Delft.

## Limitaciones y advertencias

- Ambito restringido al dataset View of Delft y a tres clases (peaton, ciclista, coche); no es un modelo de proposito general.
- No se documenta la arquitectura interna, el numero de parametros ni el regimen de entrenamiento, lo que limita la evaluacion tecnica independiente.
- Licencia no declarada en la model card; el uso del dataset y la distribucion de parametros derivados estan sujetos a la licencia de investigacion de VoD, lo que puede restringir el uso comercial.
- El repositorio no incluye el dataset ni los indices; es necesario obtener VoD bajo su licencia y ejecutar los scripts de conversion, con el coste de preparacion asociado.
- La instalacion no ha sido verificada en una maquina limpia; la combinacion de versiones (PyTorch 1.9.1, CUDA 11.1, mmcv-full 1.6.0) es antigua y puede presentar problemas de compatibilidad con drivers y wheels actuales.
- Los resultados pueden variar ligeramente segun datos, hardware, versiones de software y ejecucion numerica, segun advierte el propio autor.
- Solo se evalua sobre el split de validacion; no se publican resultados en test ni estudios de generalizacion a otros dominios.
- Riesgo de sesgo hacia las condiciones de captura de Delft (entorno urbano neerlandes), sin analisis de sesgos publicado.
- No hay informacion sobre alucinacion o falsos positivos en escenarios adversos; la deteccion 3D en produccion requiere validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/iclr-submission-58778/rcqfusion-vod
- Dataset View of Delft: https://viewofdelft-dataset.tudelft.nl/
- Licencia de investigacion de VoD: https://intelligent-vehicles.org/datasets/view-of-delft/view-of-delft-dataset-research-use-license/
- Avisos de terceros (referenciado en la model card): `licenses/THIRD_PARTY_NOTICES.md` dentro del repositorio
- Configuracion de inferencia: `configs/rcqfusion_vod.py` dentro del repositorio
- Script de inferencia: `tools/infer_vod.sh` dentro del repositorio
