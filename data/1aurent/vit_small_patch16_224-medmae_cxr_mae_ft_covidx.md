# 1aurent/vit_small_patch16_224.medmae_CXR_mae_ft_COVIDx

## Resumen

El modelo `vit_small_patch16_224.medmae_CXR_mae_ft_COVIDx`, publicado por el usuario 1aurent en Hugging Face, es un Vision Transformer pequeno (ViT-Small) especializado en clasificacion de imagenes de radiografia de torax (CXR, chest X-ray). Se distribuye a traves de la libreria `timm` y emplea pesos en formato safetensors, con un total de 21.667.204 parametros y un tamano de repositorio de aproximadamente 0,1 GB.

El nombre del modelo revela su pipeline de entrenamiento: parte de una arquitectura ViT-Small con parches de 16x16 y resolucion de entrada 224x224, preentrenada con el esquema MedMAE (masked autoencoding sobre imagenes medicas) y posteriormente ajustada de forma supervisada (fine-tuning) sobre el conjunto COVIDx para clasificacion de imagenes de torax. Se trata, por tanto, de un modelo de vision encoder puro orientado a tareas de diagnostico asistido por imagen, no de un modelo generativo de texto.

Su relevancia actual es acotada pero concreta: sirve como referencia reproducible de un ViT-Small medico de bajo coste computacional, util para prototipado rapido, investigacion en clasificacion de CXR y como baseline frente a modelos mayores. La licencia Apache 2.0 facilita su reutilizacion comercial, aunque la informacion publica disponible sobre datos de entrenamiento, metricas y validacion clinica es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Small, patch 16, resolucion 224) |
| Parametros totales | 21.667.204 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tamano "small" con parches de 16x16 pixeles y resolucion de entrada de 224x224, segun la convencion de nombres de `timm` (`vit_small_patch16_224`). El modelo se integra en el ecosistema `timm` como clasificador de imagenes y exporta pesos en safetensors, lo que permite cargarlo con `timm.create_model` indicando `pretrained=True` o cargando el checkpoint desde el repositorio.

Segun el identificador del modelo, el entrenamiento sigue una cadena de dos etapas: primero un preentrenamiento auto-supervisado tipo MedMAE (masked autoencoding adaptado a imagenes medicas, reconstruyendo parches enmascarados) y despues un ajuste fino supervisado sobre el dataset COVIDx para clasificacion de radiografias de torax. No se dispone de informacion publica sobre el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, el uso de tecnicas de aumento de datos, ni sobre si se aplicaron estrategias de regularizacion o destilacion adicionales. Tampoco se documentan innovaciones tecnicas especificas mas alla del propio esquema MedMAE.

## Capacidades

- Clasificacion de imagenes de radiografia de torax: el modelo esta ajustado para predecir clases relacionadas con hallazgos en CXR (el conjunto COVIDx incluye categorias de neumonia, COVID-19 y normal, aunque la model card no detalla el etiquetado exacto).
- Extraccion de caracteristicas visuales: al ser un ViT, puede usarse como backbone congelado o ajustable para tareas de vision adicionales.
- Inferencia de bajo coste: con 21,7 M de parametros, es adecuado para entornos con recursos limitados.
- Integracion con `timm`: carga directa mediante la API de `timm` y compatibilidad con pipelines de `transformers` para `image-classification`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente discriminativo de vision.
- No dispone de capacidades multilingues ni de generacion de texto.
- No se documentan modos especiales como thinking, vision multimodal (imagen+texto) ni audio.

## Casos de uso

- Triaje automatizado de radiografias de torax en entornos de investigacion: el modelo puede clasificar imagenes CXR en categorias de interes (normal, neumonia, COVID-19) como primer filtro antes de la revision por un radiologo, gracias a su tamano reducido y su ajuste especifico sobre COVIDx.
- Baseline en estudios comparativos de ViT medicos: sirve como referencia reproducible para evaluar mejoras de arquitecturas mayores o de esquemas de preentrenamiento alternativos en clasificacion de CXR.
- Prototipado rapido en entornos con GPU consumer: al ocupar menos de 0,1 GB en pesos, se puede desplegar en una unica GPU de gama media o incluso en CPU para pruebas de concepto.
- Extraccion de embeddings para busqueda o clustering de imagenes medicas: el backbone ViT puede generar representaciones vectoriales utiles para agrupar estudios similares o construir indices de recuperacion.
- Educacion y docencia en vision artificial medica: modelo ligero y de licencia permisiva para ilustrar el flujo completo de preentrenamiento auto-supervisado y ajuste fino supervisado en imagenes medicas.
- Integracion en pipelines de investigacion con `timm`: carga sencilla en scripts de experimentacion, lo que facilita la reproducibilidad de resultados en publicaciones y cuadernos de investigacion.
- Analisis de sesgo y robustez en modelos medicos pequenos: su tamano manejable permite ejecutar barridos de evaluacion sobre subgrupos demograficos o condiciones de adquisicion de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,09 GB solo para pesos, mas activaciones; en la practica, menos de 1 GB en la mayoria de configuraciones.
- VRAM estimada en FP16/BF16: aproximadamente 0,05 GB para pesos, con margen para lotes pequenos.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 pueden ejecutar el modelo con holgura. Tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en iGPU para inferencia puntual.
- Opciones de despliegue: `timm` (carga nativa), `transformers` (pipeline `image-classification`), ONNX Runtime si se exporta, y TorchScript. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1aurent/vit_small_patch16_224.medmae_CXR_mae_ft_COVIDx` | 21,7 M | Imagen 224x224 | Clasificacion CXR | Apache 2.0 | Hugging Face |
| ViT-Small estandar (`vit_small_patch16_224`) | ~22 M | Imagen 224x224 | Clasificacion ImageNet | Apache 2.0 | `timm` |
| ViT-Base medico (variantes CXR) | ~86 M | Imagen 224x224 | Clasificacion CXR | variable | Hugging Face |
| ResNet-50 medico | ~25 M | Imagen 224x224 | Clasificacion CXR | variable | Hugging Face |

La comparativa se limita a familias de arquitectura y tamano, ya que no se dispone de resultados de benchmarks publicados para este checkpoint concreto que permitan una comparacion cuantitativa de rendimiento frente a alternativas.

## Limitaciones y advertencias

- No es un dispositivo medico: el modelo no ha sido validado clinicamente ni cuenta con marcado CE o aprobacion regulatoria; no debe usarse para diagnostico real sin validacion independiente.
- Datos de entrenamiento no documentados: se desconoce la composicion exacta de COVIDx utilizada, el numero de imagenes, la distribucion de clases y las posibles fuentes de sesgo (hospital, equipo de adquisicion, demografia).
- Riesgo de sobreajuste al dataset COVIDx: al ser un ajuste fino sobre un conjunto concreto, puede degradarse en dominios distintos (otras poblaciones, otros equipos de rayos X).
- Sesgos potenciales: los datasets de CXR suelen presentar desequilibrios por sexo, edad, etnia y prevalencia de patologias; no se documenta ningun analisis de equidad.
- Riesgo de alucinacion en sentido figurado: como clasificador, puede producir predicciones de alta confianza en imagenes fuera de distribucion o de baja calidad.
- Sin capacidades generativas ni de texto: no es adecuado para tareas de lenguaje, agentes o razonamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad regulatoria y etica de su aplicacion en contextos sanitarios.
- Model card muy escasa: no se documentan metricas de validacion, umbrales de decision ni calibracion, lo que dificulta su uso responsable en produccion.
- Repositorio de bajo uso (47 descargas, 0 likes): poca comunidad y escasa retroalimentacion sobre su comportamiento real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/vit_small_patch16_224.medmae_CXR_mae_ft_COVIDx
- Libreria `timm`: https://github.com/huggingface/pytorch-image-models
- Documentacion de `timm` en Hugging Face: https://huggingface.co/docs/timm
- Dataset COVIDx (referencia habitual en la literatura): https://github.com/lindawangg/COVID-Net
- Repositorio de MedMAE (referencia del esquema de preentrenamiento): no disponible en la informacion proporcionada.
