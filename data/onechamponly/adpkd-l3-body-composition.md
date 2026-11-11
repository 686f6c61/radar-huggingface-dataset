# OneChampOnly/adpkd-l3-body-composition

## Resumen

El modelo `OneChampOnly/adpkd-l3-body-composition` es un conjunto de pesos entrenados para un pipeline de análisis automático de composición corporal a nivel de la tercera vértebra lumbar (L3) sobre tomografías computarizadas (TC) abdominales de pacientes con enfermedad renal poliquística autosómica dominante (ADPKD). Lo desarrolla el autor identificado como OneChampOnly junto con un equipo de autores clinicos (Jigang Lee, DongGeun Yun, Yaerim Kim, Kyoung Tae Kim, Yong Chul Kim, Dha Woon Im, Hayne Cho Park y Youngwoo Kim), y esta asociado a un articulo cientifico sobre analisis totalmente automatizado de composicion corporal. No es un modelo de lenguaje: es un pipeline de segmentacion de imagen medica compuesto por varios modelos especializados.

El sistema resuelve tres tareas encadenadas: primero segmenta la vertebra L3 en el volumen de TC 3D con un nnU-Net `3d_lowres` compartido; despues localiza la seccion de referencia (endplate inferior de L3 como referencia primaria y punto medio de L3 como secundaria) mediante detectores YOLOv8n; y finalmente segmenta cuatro compartimentos de composicion corporal (musculo esqueletico, grasa visceral, grasa subcutanea y tejido adiposo intramuscular) con nnU-Net 2D especificos por nivel. El resultado son areas de seccion transversal en las secciones de referencia.

La version 1.1.0 sustituye el segmentador de L3 `3d_fullres` de la v1.0.0 por un `3d_lowres`, lo que amplia el campo de vision y reduce los errores de identificacion de nivel en validacion cruzada de 300 exploraciones de 6 a 2 pacientes. El repositorio pesa 6,2 GB y contiene 25 checkpoints (cuatro modelos por cada una de las cinco particiones de validacion cruzada) mas los ficheros de configuracion de nnU-Net. Es relevante para investigacion en imagen medica porque ofrece pesos reproducibles de un pipeline completo con licencia MIT, aunque los datos de entrenamiento no se publican por restricciones de IRB y privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-modelo: nnU-Net v2 (`3d_lowres`) para vertebra L3, nnU-Net v2 (`2d`) para composicion corporal, YOLOv8n para deteccion de seccion de referencia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada de imagen; metadatos de idioma no disponibles) |
| Licencia | MIT |
| Formato de pesos | PyTorch `checkpoint_best.pth` (nnU-Net), `best.pt` (Ultralytics YOLOv8); incluye `plans.json`, `dataset.json` y `dataset_fingerprint.json` |
| Tamano del repositorio | 6,2 GB (25 checkpoints, 4,66 GiB) |
| Modalidad de entrada | TC abdominal 3D |
| Salida | Areas de seccion transversal de musculo esqueletico, grasa visceral, grasa subcutanea y tejido adiposo intramuscular en L3 inferior (primaria) y L3 medio (secundaria) |
| Version | 1.1.0 (actualizado 2026-11-11) |

## Arquitectura y entrenamiento

El pipeline es una cascada de tres etapas. La primera es un nnU-Net v2 en configuracion `3d_lowres` que segmenta la vertebra L3 sobre el volumen de TC completo; esta configuracion, con resolucion reducida y mayor campo de vision, sustituye al `3d_fullres` de la v1.0.0 y es la responsable de la mejora en la identificacion de nivel. La segunda etapa usa dos detectores Ultralytics YOLOv8n, uno por nivel de referencia (inferior y medio), que localizan la seccion axial concreta a partir de la segmentacion de la vertebra. La tercera etapa aplica dos nnU-Net 2D, tambien uno por nivel, que segmentan los cuatro compartimentos de composicion corporal sobre esa seccion axial.

Los pesos se distribuyen como cinco particiones de validacion cruzada, cada una con los cuatro modelos (segmentador de L3, dos segmentadores 2D y dos detectores), totalizando 25 checkpoints. Cada directorio de nnU-Net incluye los ficheros `plans.json`, `dataset.json` y `dataset_fingerprint.json` necesarios en inferencia, y el repositorio proporciona `SHA256SUMS` para verificar la integridad de todos los ficheros. El entrenamiento se realizo sobre TC abdominales de pacientes con ADPKD de instituciones coreanas con anotacion manual; no se especifican en la informacion disponible el numero de tokens ni la composicion exacta del dataset, y las imagenes y mascaras no se publican por restricciones de IRB y privacidad. No se documentan tecnicas de RLHF, DPO ni innovaciones de decodificacion, al tratarse de un modelo de segmentacion.

## Capacidades

- Segmentacion 3D de la vertebra L3 en volumenes de TC abdominal.
- Deteccion de secciones de referencia axiales a nivel del endplate inferior de L3 y del punto medio de L3.
- Segmentacion 2D de cuatro compartimentos de composicion corporal: musculo esqueletico, grasa visceral, grasa subcutanea y tejido adiposo intramuscular.
- Cuantificacion de areas de seccion transversal en las secciones de referencia.
- Pipeline completamente automatizado de extremo a extremo, sin intervencion manual entre etapas.
- Validacion cruzada de cinco particiones con checkpoints independientes por fold, lo que permite seleccionar el modelo y reproducir resultados del articulo.
- Verificacion de integridad de pesos mediante sumas SHA256.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modalidades de texto, audio o vision general.

## Casos de uso

- Investigacion clinica en ADPKD: el pipeline permite obtener de forma automatica areas de musculo y grasa en L3 sobre cohortes retrospectivas de TC, sustituyendo la anotacion manual y facilitando estudios de asociacion entre composicion corporal y progresion de la enfermedad.
- Analisis de sarcopenia y obesidad en nefrologia: la cuantificacion de musculo esqueletico y grasa visceral en L3 es un marcador establecido; el modelo permite calcularlo de forma reproducible en grandes volumenes de exploraciones.
- Reproduccion de resultados publicados: al incluir los cinco folds de validacion cruzada, permite replicar exactamente las cifras del articulo sobre la cohorte original seleccionando el fold correspondiente.
- Procesamiento por lotes de TC abdominales: la arquitectura en cascada con deteccion YOLOv8n y segmentacion nnU-Net 2D esta pensada para ejecutarse sobre volumenes completos sin supervision, lo que lo hace adecuado para pipelines de investigacion a gran escala.
- Desarrollo de herramientas de investigacion en imagen medica: al tener licencia MIT y codigo publico en GitHub, sirve como base para construir o comparar pipelines de composicion corporal en otras patologias renales.
- Evaluacion de tecnicas de segmentacion medica: los checkpoints y ficheros de configuracion permiten usar el pipeline como referencia o baseline en estudios comparativos de segmentacion de organos y tejidos en TC.
- Analisis longitudinal de pacientes: la automatizacion permite procesar series temporales de TC de un mismo paciente para estudiar cambios en composicion corporal a lo largo del seguimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la validacion cruzada sobre 300 exploraciones redujo los errores de identificacion de nivel de 6 a 2 pacientes al pasar de `3d_fullres` a `3d_lowres` en la v1.1.0, pero no se proporcionan cifras de Dice, IoU ni otras metricas de segmentacion en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio ocupa 6,2 GB en disco, pero el consumo de VRAM depende del volumen de entrada y de la configuracion de nnU-Net (`3d_lowres` y `2d`), y no se detalla.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion facilitada.
- Compatibilidad con GPU de consumo: no disponible. Dado que los segmentadores de composicion corporal son 2D y el de vertebra es `3d_lowres`, es plausible que quepan en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: el pipeline se ejecuta con nnU-Net v2 y Ultralytics YOLOv8; el repositorio incluye scripts `tools/download_weights.py` para descargar, verificar y generar un registro de modelos (`config/model_registry.json`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de segmentacion de composicion corporal en L3 ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Los pesos se distribuyen para uso en investigacion y no constituyen un dispositivo medico; no deben usarse para decision clinica sin validacion regulatoria.
- El modelo se entreno exclusivamente con TC abdominales de pacientes con ADPKD de instituciones coreanas; su generalizacion a otras poblaciones, equipos, protocolos de adquisicion o patologias no esta documentada.
- Las imagenes y mascaras de entrenamiento no se publican por restricciones de IRB y privacidad, lo que limita la auditoria y la replicacion completa del entrenamiento.
- Riesgo de error en la identificacion del nivel vertebral: aunque la v1.1.0 reduce los fallos de 6 a 2 pacientes en 300 exploraciones, persiste un riesgo residual de seleccion incorrecta de la seccion de referencia.
- No se documentan sesgos especificos, tasas de alucinacion (no aplica a segmentacion) ni limitaciones de contexto o idioma (no aplica).
- La licencia MIT permite uso comercial, pero la ausencia de validacion clinica y la naturaleza de investigacion de los pesos deben tenerse en cuenta antes de cualquier despliegue en produccion sanitaria.
- No se especifican requisitos de preprocesado mas alla de los ficheros de configuracion de nnU-Net, por lo que es necesario seguir el README del repositorio de codigo para un uso correcto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneChampOnly/adpkd-l3-body-composition
- Codigo en GitHub: https://github.com/OneChampOnly/adpkd-l3-body-composition
- Registro archivado en Zenodo (v1.1.0): https://doi.org/10.5281/zenodo.24124217
- Documentacion de datos (referenciada en la model card): `docs/DATA.md` en el repositorio de codigo
- Metadatos de citacion (referenciado en la model card): `CITATION.cff` en el repositorio de codigo
