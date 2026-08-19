# LeMerta/finetuned-trocr-models

## Resumen

LeMerta/finetuned-trocr-models es un conjunto de modelos de reconocimiento óptico de caracteres (OCR) basados en la arquitectura TrOCR, desarrollados por Lennard Merta (LeMerta) en el contexto de su trabajo de fin de grado. El repositorio, con un tamaño de 21,4 GB, contiene múltiples variantes ajustadas del modelo TrOCR de Microsoft, aunque no se ha publicado ninguna model card que detalle las características específicas de cada variante.

TrOCR (Transformer-based Optical Character Recognition) es una arquitectura encoder-decoder introducida por Microsoft en 2021 que combina un encoder de visión (ViT) con un decoder de texto (transformador), tratando el OCR como una tarea de generación de texto condicionada a imagen. Este enfoque elimina la necesidad de módulos de detección y segmentación de caracteres tradicionales, simplificando el pipeline de OCR.

La relevancia de este repositorio reside en que demuestra el proceso de fine-tuning de TrOCR sobre dominios específicos, un flujo habitual en entornos de producción donde los modelos preentrenados genéricos no alcanzan precisión suficiente en dominios particulares como texto curvo, documentos históricos o facturas. Sin embargo, la ausencia de documentación y de licencia explícita limita su uso directo en entornos corporativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder ViT + decoder transformer) |
| Parametros totales | no disponible (depende de la variante; TrOCR small ~62M, base ~334M, large ~558M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TrOCR estandar usa 512 tokens) |
| Tipos de cuantizacion | safetensors (precision no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TrOCR utiliza una arquitectura encoder-decoder completamente basada en transformers. El encoder es un Vision Transformer (ViT) que procesa la imagen de entrada dividiendola en parches de 16x16 pixeles, mientras que el decoder es un transformer de texto autoregresivo que genera la transcripcion token a token. El modelo se preentrena en dos fases: primero con imagenes sinteticas generadas a partir de texto existente, y despues con imagenes reales de documentos y texto de escenas naturales.

En cuanto al proceso de fine-tuning de este repositorio concreto, no se dispone de informacion detallada sobre el dataset utilizado, el numero de epochs, la tasa de aprendizaje o si se aplicaron tecnicas de aumento de datos. El autor mantiene un dataset asociado llamado `LeMerta/bachelor-thesis-datasets`, lo que sugiere que el entrenamiento se realizo con datos recopilados para su tesis de grado. Dado el tamano del repositorio (21,4 GB), es probable que contenga multiples checkpoints o varias variantes del modelo (small, base, large) ajustadas sobre distintos dominios, aunque esto no se puede confirmar sin acceso a la model card.

## Capacidades

- Reconocimiento de texto en imagenes (OCR): el modelo transcribe texto presente en imagenes a texto digital, capacidad heredada de la arquitectura TrOCR.
- Fine-tuning por dominio: al ser un conjunto de modelos ajustados, las capacidades concretas dependen del dataset de entrenamiento especifico de cada variante.
- Generacion autoregresiva de texto: el decoder genera la transcripcion token a token, lo que permite manejar secuencias de longitud variable.
- Procesamiento de imagenes de documento: capacidades tipicas de TrOCR incluyen OCR de documentos escaneados, capturas de pantalla y texto de escenas naturales.
- Capacidades multilingues: no disponible, aunque TrOCR preentrenado esta orientado principalmente a ingles.
- Soporte de tool calling, agentes y razonamiento multi-paso: no aplica, TrOCR es un modelo de OCR, no un LLM generalista.

## Casos de uso

- Digitalizacion de documentos historicos: el modelo puede transcribir documentos escaneados o fotografiados a texto digital para su indexacion y busqueda. Su naturaleza de fine-tuning permite adaptarlo a tipografias o estilos de escritura especificos de archivos historicos.
- Extraccion de datos de facturas y recibos: al ajustar TrOCR sobre documentos comerciales, el modelo puede transcribir campos clave como importes, fechas y numeros de factura, integrandose en pipelines de automatizacion de procesos contables.
- OCR de texto curvo o deformado: si el fine-tuning se realizo sobre datasets como SCUT CTW1500, el modelo seria adecuado para reconocer texto en superficies curvas como senales, logotipos o envases, donde los OCR tradicionales fallan.
- Accesibilidad para personas con discapacidad visual: el modelo puede integrarse en aplicaciones moviles que lean texto del entorno en tiempo real, convirtiendo imagenes de carteles, menus o etiquetas en audio.
- Automatizacion de tramitacion de formularios: transcripcion de formularios manuscritos o impresos en entornos administrativos y gubernamentales, reduciendo la entrada manual de datos.
- Indexacion de archivos audiovisuales: extraccion de texto de subtitulos incrustados en fotogramas de video o de texto superpuesto en imagenes para motores de busqueda internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card ni referencias a metricas de evaluacion como precision de caracteres (CER), precision de palabras (WER) o accuracy sobre datasets estandar como IAM, SROIE o FUNSD. Tampoco se proporcionan comparativas con el modelo TrOCR base o con alternativas como PaddleOCR o Tesseract.

## Requisitos de hardware

- VRAM estimada para inferencia: para TrOCR small (~62M parametros), aproximadamente 1-2 GB en fp16; para TrOCR large (~558M parametros), aproximadamente 3-4 GB en fp16. El repositorio de 21,4 GB sugiere que puede haber multiples modelos, por lo que el requisito real depende de la variante cargada.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para TrOCR base o large en fp16. Una RTX 3060, RTX 4060 o superior cubre las necesidades de inferencia.
- Compatibilidad con GPU consumer: si, TrOCR es un modelo ligero en comparacion con LLMs modernos y cabe sin problemas en GPUs de gama media.
- Opciones de despliegue: el formato safetensors permite su uso con la libreria `transformers` de HuggingFace. Se puede servir mediante pipelines de Python, ONNX Runtime para optimizacion en CPU, o integrado en frameworks como FastAPI para exponer un endpoint REST.
- Latencia y throughput: no disponible. En una GPU consumer moderna, la inferencia de TrOCR small sobre una imagen de 384x384 suele completarse en decenas de milisegundos, pero estos datos no estan confirmados para este repositorio concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LeMerta/finetuned-trocr-models | no disponible | no disponible | safetensors | no disponible | Fine-tuning de TrOCR, sin documentacion |
| microsoft/trocr-base-printed | ~334M | 512 tokens | pytorch | MIT | TrOCR base para texto impreso |
| microsoft/trocr-large-handwritten | ~558M | 512 tokens | pytorch | MIT | TrOCR large para texto manuscrito |
| PaddleOCR (PP-OCRv4) | ~12M (deteccion) + ~8M (reconocimiento) | variable | paddle | Apache 2.0 | Pipeline completo de deteccion + reconocimiento |

La comparativa muestra que el repositorio de LeMerta carece de informacion publica sobre parametros y licencia, lo que dificulta su evaluacion frente a alternativas bien documentadas como los modelos oficiales de Microsoft o PaddleOCR. Los modelos oficiales de TrOCR tienen licencia MIT y estan ampliamente validados en benchmarks publicos.

## Limitaciones y advertencias

- Ausencia de model card: no se documenta el proceso de entrenamiento, los datasets utilizados ni las metricas de evaluacion, lo que impide verificar la calidad del modelo.
- Licencia no especificada: el repositorio no declara licencia, lo que implica que legalmente no se puede usar, modificar o distribuir sin permiso explicito del autor. Esto bloquea su uso en produccion comercial.
- Riesgo de sesgos y alucinaciones: al no documentar la composicion del dataset de entrenamiento, no se puede evaluar si el modelo tiene sesgos hacia ciertos tipos de letra, idiomas o estilos de escritura.
- Limitaciones de TrOCR base: los modelos TrOCR preentrenados estan orientados principalmente a ingles y pueden degradarse con idiomas que usan caracteres no latinos o sistemas de escritura complejos.
- Riesgo de overfitting: un fine-tuning sobre un dataset reducido de tesis puede producir overfitting al dominio especifico, reduciendo la generalizacion a otros tipos de imagenes.
- Tamano del repositorio: 21,4 GB es considerable para modelos de OCR, lo que sugiere multiples checkpoints o variantes sin documentacion individual, dificultando la seleccion del artefacto correcto.
- Fecha de creacion futura: el repositorio esta fechado en 2026, lo que puede indicar un error de metadatos o un proyecto reciente sin madurez de validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LeMerta/finetuned-trocr-models
- Perfil del autor: https://huggingface.co/LeMerta
- Dataset asociado (tesis): https://huggingface.co/LeMerta/bachelor-thesis-datasets
- Referencia sobre fine-tuning de TrOCR con texto curvo (contexto general): https://learnopencv.com/fine-tuning-trocr-training-trocr-to-recognize-curved-text/
