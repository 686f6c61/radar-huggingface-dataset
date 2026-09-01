# OneScience-Group/Surya

## Resumen

Surya es un modelo fundacional espaciotemporal para heliofísica e investigación de meteorología espacial, desarrollado por un equipo conjunto de NASA, IBM Research y la Universidad de Alabama en Huntsville. El modelo aprende la dinámica solar a partir de observaciones multi-instrumento del Solar Dynamics Observatory (SDO), combinando ocho canales de AIA y cinco productos de HMI. Su objetivo principal es predecir imágenes solares futuras a partir de dos pasos temporales históricos, con soporte para pronóstico autoregresivo de múltiples pasos.

La arquitectura de Surya integra gating espectral (spectral gating) con atención larga-corta (long-short attention), una combinación novedosa que permite modelar dependencias tanto de corto como de largo alcance en los datos solares. Con 366 millones de parámetros, se entrena sobre aproximadamente 257 TB de datos SDO registrados entre 2010 y 2024, estandarizados a intervalos de 12 minutos. Es el primer modelo fundacional en heliofísica que utiliza el avance temporal como tarea pretexto sobre datos SDO a resolución completa.

Publicado bajo licencia Apache 2.0, Surya está disponible en Hugging Face con código de entrenamiento, inferencia y evaluación, así como scripts para generar datos sintéticos de validación. El modelo tiene aplicaciones directas en predicción de llamaradas solares, segmentación de regiones activas y análisis de errores de pronóstico a diferentes horizontes temporales, lo que lo convierte en una herramienta relevante para la investigación de meteorología espacial y la preparación de infraestructuras sensibles a eventos solares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer espaciotemporal con spectral gating y long-short attention |
| Parametros totales | 366 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision espaciotemporal, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (etiqueta del modelo; no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoints .pt) |

## Arquitectura y entrenamiento

Surya emplea una arquitectura de transformer espaciotemporal que combina dos mecanismos principales: spectral gating y long-short attention. El gating espectral opera en el dominio de la frecuencia para capturar patrones periodicos y oscilatorios presentes en la actividad solar, mientras que la atencion larga-corta procesa simultaneamente dependencias locales y globales en el espacio y el tiempo. Esta combinacion permite al modelo aprender la evolucion fisica subyacente del Sol a partir de secuencias de imagenes multicanal.

El entrenamiento se realizo con datos del Solar Dynamics Observatory (SDO) de 2010 a 2024, incluyendo ocho canales de AIA (94, 131, 171, 193, 211, 304, 335 y 1600 angstrom) y cinco productos de HMI (campo magnetico y velocidad Doppler). Los datos fueron estandarizados a intervalos de 12 minutos, registrados espacialmente y normalizados mediante una transformacion signum-log. El volumen total de datos de entrenamiento es de aproximadamente 257 TB. La tarea pretexto consiste en predecir el siguiente paso temporal a partir de dos pasos historicos, y el modelo soporta pronostico autoregresivo multi-paso durante la inferencia.

El repositorio incluye un script para generar datos sinteticos que permiten validar el flujo de entrenamiento, inferencia y evaluacion sin necesidad de los datos reales. Los pesos entrenados sobre datos reales SDO/AIA y SDO/HMI se anuncian como disponibles proximamente en la carpeta `weight/`.

## Capacidades

- Prediccion de imagenes solares multicanal a partir de dos pasos temporales historicos.
- Pronostico autoregresivo multi-paso para simular la evolucion solar en horizontes temporales extendidos.
- Procesamiento conjunto de observaciones multi-instrumento de SDO (AIA y HMI) en un unico modelo.
- Analisis de errores de pronostico a diferentes lead times para investigacion de meteorologia espacial.
- Fine-tuning para prediccion de llamaradas solares de clase M y X en periodos futuros.
- Fine-tuning sobre magnetogramas para segmentacion de regiones activas y lineas de inversion de polaridad.
- Validacion de flujos de entrenamiento e inferencia con datos sinteticos.
- Entrenamiento distribuido multi-GPU mediante `torchrun`.

## Casos de uso

- Prediccion de dinamica solar: Surya genera imagenes futuras multicanal a partir de dos observaciones historicas, permitiendo anticipar la evolucion de estructuras solares como manchas, filamentos y eyecciones de masa coronal.
- Investigacion de meteorologia espacial: el modelo permite analizar la actividad solar y los errores de pronostico a diferentes horizontes temporales, facilitando el estudio de la propagacion de perturbaciones solares hacia la Tierra.
- Modelado multi-instrumento SDO: al procesar conjuntamente los 13 canales (AIA y HMI), Surya captura correlaciones entre la emision en diferentes longitudes de onda y el campo magnetico, algo que los modelos por canal no logran.
- Prediccion de llamaradas solares: mediante fine-tuning sobre las representaciones del modelo, se pueden clasificar y predecir llamaradas de clase M y X en ventanas temporales futuras, util para sistemas de alerta temprana.
- Segmentacion de regiones activas: el fine-tuning sobre magnetogramas permite segmentar regiones activas y lineas de inversion de polaridad, insumo clave para estudios de actividad solar y modelado de campos magneticos.
- Validacion rapida de pipelines: el script de datos sinteticos permite probar el flujo completo de entrenamiento, inferencia, evaluacion y visualizacion sin necesidad de acceder a los 257 TB de datos reales, util para depurar codigo y configuraciones.
- Entrenamiento distribuido en produccion: con `torchrun` se puede lanzar entrenamiento paralelo en multiples GPUs, escalando desde una configuracion pequena hasta la resolucion original de 4096x4096.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2508.14112) describe la metodologia y posiblemente incluya metricas, pero no se proporcionan valores concretos en la model card ni en los resumenes de la busqueda web.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia; la CPU puede utilizarse para validar el pipeline con la configuracion pequena por defecto.
- La configuracion original del paper, con resolucion de 4096x4096 y 366 millones de parametros, requiere recursos de computo multi-GPU a gran escala.
- No se especifican modelos concretos de GPU (A100, H100, etc.) en la documentacion proporcionada.
- Para configuraciones reducidas o datos sinteticos, una GPU de consumo medio podria ser suficiente, pero no hay datos de VRAM estimada.
- El repositorio incluye soporte para entornos DCU (acceleradores de Hygon) mediante el paquete `onescience[earth-dcu]`, ademas de entornos GPU estandar con `onescience[earth-gpu]`.
- No se indican opciones de despliegue como vLLM, Ollama o TGI; el flujo de uso es mediante scripts de Python (train.py, inference.py, result.py).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (modelos fundacionales espaciotemporales para heliofisica). Surya se presenta como el primer modelo fundacional en este dominio, por lo que no existe una referencia directa con la que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Los pesos entrenados sobre datos reales SDO/AIA y SDO/HMI no estan aun disponibles en el repositorio; solo se proporcionan datos sinteticos para validacion de flujo.
- El entrenamiento con la configuracion original requiere una infraestructura de computo muy grande (multi-GPU, datos de 257 TB), inaccesible para la mayoria de equipos individuales.
- El modelo esta disenado para datos de SDO especificamente; su aplicacion a otras misiones o instrumentos requeriria adaptaciones no documentadas.
- La resolucion espacial de 4096x4096 implica un consumo de memoria muy elevado; las configuraciones reducidas pueden no capturar todos los detalles fisicos relevantes.
- No se han publicado metricas de rendimiento cuantitativas en la informacion disponible, por lo que no es posible evaluar su precision frente a otros metodos.
- Aunque la licencia es Apache 2.0, el uso comercial de los datos originales de SDO puede estar sujeto a las politicas de la NASA; verificar antes de un despliegue en produccion.
- El modelo no es un sistema de lenguaje; su salida son imagenes o mapas de actividad, por lo que no debe confundirse con un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/Surya
- Paper en arXiv: https://arxiv.org/abs/2508.14112 (HTML: https://arxiv.org/html/2508.14112v1)
- Paper en NTRS de la NASA: https://ntrs.nasa.gov/citations/20250008498
- Blog de NASA Science: https://science.data.nasa.gov/blog/inside-surya-solar-ai-model
- Blog de IBM Research: https://research.ibm.com/blog/surya-heliophysics-ai-model-sun
