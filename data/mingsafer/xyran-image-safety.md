# MingSafeR/xyran-image-safety

## Resumen

Xyran Image Safety Classifier es un modelo de clasificación de imágenes para moderación de contenido, desarrollado por MingSafeR como parte del SDK Xyran, un sistema de moderación local-first para Python. Su objetivo es realizar inferencia de seguridad sobre imágenes directamente en la máquina del usuario, sin necesidad de API key ni de enviar las imágenes a servicios externos de moderación.

El modelo se ejecuta a través de ONNX Runtime y expone categorías de probabilidad como `safe`, `sexual` y `graphic`, que las aplicaciones pueden interpretar según sus propios umbrales y políticas. Está pensado para integrarse en flujos de moderación automatizada, filtrado de subidas, limpieza de datasets y aplicaciones donde la privacidad o el funcionamiento offline son prioritarios.

No se ha publicado información sobre la arquitectura interna, el número de parámetros ni los datos de entrenamiento. La documentación disponible se centra en el uso práctico a través del SDK Xyran y en las consideraciones de seguridad y limitaciones del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (procesa imagenes) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura del modelo ni el proceso de entrenamiento. Se indica que el modelo se ejecuta mediante ONNX Runtime y que el preprocesamiento de las imagenes lo implementa el SDK Xyran. No se mencionan datos de entrenamiento, tecnicas de optimizacion ni innovaciones destacables. El diseno del sistema se centra en la inferencia local, con soporte para CPU y aceleracion por GPU a traves de ONNX Runtime, pero sin especificar la topologia de la red neuronal.

## Capacidades

- Clasificacion de imagenes en categorias de seguridad: `safe`, `sexual` y `graphic`.
- Inferencia local sin conexion a internet ni dependencia de servicios externos.
- Ejecucion en CPU y en GPU NVIDIA compatibles con CUDA mediante ONNX Runtime.
- Integracion sencilla con el SDK Xyran a traves de la CLI (`xyran scan`).
- Procesamiento por lotes de directorios de imagenes.
- Adecuado para flujos de moderacion automatizada con umbrales configurables por la aplicacion.
- No soporta generacion de texto, tool calling ni razonamiento multi-paso; es exclusivamente un clasificador de imagenes.

## Casos de uso

- Moderacion de contenido en plataformas comunitarias: el modelo puede puntuar cada imagen subida por los usuarios y bloquear o revisar automaticamente aquellas que superen un umbral de probabilidad de contenido sexual o grafico.
- Filtrado de subidas en aplicaciones web o moviles: al integrarse en el backend, permite rechazar imagenes no seguras antes de que se almacenen o se publiquen.
- Limpieza de datasets para entrenamiento de modelos de vision: se puede ejecutar sobre un corpus de imagenes para descartar ejemplos no deseados y mantener un conjunto de datos apto para uso comercial o publico.
- Aplicaciones de escritorio con procesamiento privado: gracias a su diseno local-first, puede analizar imagenes en el equipo del usuario sin enviarlas a ningun servidor, lo que resulta util en entornos con datos sensibles.
- Servicios self-hosted de moderacion: desplegado en infraestructura propia, permite controlar el almacenamiento y el procesamiento de las imagenes sin depender de APIs de terceros.
- Procesamiento offline de medios: en entornos sin conexion o con conectividad limitada, el modelo puede clasificar imagenes de forma local, manteniendo la disponibilidad del sistema de moderacion.
- Aplicaciones de IA locales con politicas de privacidad estrictas: al no requerir API key, el modelo se puede integrar en pipelines de IA que necesitan cumplir requisitos de residencia de datos o de no divulgacion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion menciona que se esta desarrollando un benchmark reproducible para evaluar falsos positivos en contenido seguro, recall de contenido sexual y grafico, rendimiento en ilustraciones y anime, recortes dificiles, throughput por lotes y rendimiento en CPU y GPU, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no especificadas; se indica compatibilidad con GPU NVIDIA a traves de ONNX Runtime y CUDA.
- Ejecucion en CPU soportada, por lo que puede desplegarse en maquinas sin GPU.
- El modelo se distribuye en formato ONNX, compatible con ONNX Runtime y potencialmente con TGI o vLLM si se adapta, aunque la via recomendada es el SDK Xyran.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Existen alternativas clasicas de moderacion de imagenes como OpenNSFW o modelos de deteccion NSFW basados en vision, pero no se han encontrado cifras de rendimiento ni especificaciones tecnicas que permitan una comparacion rigurosa. Por tanto, la comparacion directa se considera no disponible.

## Limitaciones y advertencias

- El modelo es probabilistico y puede producir falsos positivos y falsos negativos en la clasificacion.
- El rendimiento puede variar segun el tipo de contenido: fotografias, anime, manga, ilustraciones, imagenes muy recortadas, comprimidas, contenido abstracto, sujetos parcialmente visibles o imagenes ambiguas o adversariales.
- El contenido ilustrado y de estilo anime se identifica como un area de evaluacion y mejora continua.
- El modelo no debe tratarse como una determinacion autoritativa de seguridad; en aplicaciones donde una clasificacion incorrecta pueda causar danos, debe combinarse con politicas de moderacion, salvaguardas adicionales y revision humana.
- Los umbrales adecuados dependen de cada aplicacion; un valor valido para un caso de uso puede ser inapropiado para otro.
- La licencia del modelo no esta especificada en la documentacion, por lo que debe verificarse antes de cualquier uso comercial.
- No se han publicado benchmarks ni metricas oficiales que respalden su rendimiento.
- El preprocesamiento recomendado es el implementado por el SDK Xyran; reproducirlo desde cero puede dar resultados inconsistentes.

## Enlaces

- HuggingFace: https://huggingface.co/MingSafeR/xyran-image-safety
- Repositorio de Xyran en GitHub: https://github.com/mingshenhk/xyran/tree/main
- Paquete en PyPI: https://pypi.org/project/xyran/#description
