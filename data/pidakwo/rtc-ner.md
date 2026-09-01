# pidakwo/rtc-ner

## Resumen

rtc-ner es un modelo de reconocimiento de entidades nombradas (NER) específico de dominio, desarrollado por P. O. Idakwo y colaboradores para extraer entidades geográficas, médicas y de incidentes a partir de informes textuales no estructurados de accidentes de tráfico (road traffic crash, RTC). El modelo está entrenado para transformar narrativas de accidentes en información estructurada que pueda alimentar análisis de siniestralidad, procesamiento geoespacial e investigación en respuesta a emergencias, con un foco particular en el contexto nigeriano.

Se basa en una arquitectura transformer integrada en el framework spaCy, y reconoce nueve tipos de entidades: carreteras, puntos de referencia, suburbios, pueblos, áreas de gobierno local, estados, hospitales, víctimas mortales y heridos. El modelo se distribuye como un pipeline completo de spaCy, listo para cargar y usar. Su relevancia radica en que aborda un problema práctico: convertir informes de accidentes redactados en lenguaje natural en datos estructurados y geolocalizables, un paso previo esencial para la planificación de emergencias y la mejora de la seguridad vial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base no especificado) integrado en spaCy |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato nativo de spaCy, sin cuantizacion) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | Pipeline spaCy (config.cfg, meta.json, tokenizer, vocab/, ner/, tok2vec/) |

## Arquitectura y entrenamiento

El modelo se construye sobre el framework spaCy con una arquitectura basada en transformer, aunque no se especifica el modelo transformer concreto (p. ej., BERT, RoBERTa) ni el tamaño de sus parámetros. El pipeline incluye componentes de tokenizacion, tok2vec y ner, empaquetados en un directorio que debe conservarse completo para su correcta carga.

No se han publicado detalles sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card menciona que el modelo se desarrolló en el contexto de una investigación sobre transformación de narrativas de accidentes en información estructurada, y cita un dataset asociado ("Nigerian Multi-modal Road Traffic Crash Data") con DOI, pero no se ofrecen métricas de entrenamiento ni hiperparámetros.

## Capacidades

- Extraccion de entidades geograficas: identifica carreteras (ROAD), puntos de referencia (LANDMARK), suburbios (SUBURB), pueblos o ciudades (TOWN), areas de gobierno local (LGA) y estados (STATE) en informes de accidentes.
- Extraccion de entidades medicas y de incidente: reconoce hospitales (HOSPITAL), personas fallecidas (CASUALTY) y personas heridas (INJURED).
- Procesamiento de narrativas de accidentes de trafico: el modelo esta entrenado especificamente para el dominio de informes de siniestros viales, no para texto general.
- Integracion con spaCy: se carga como un pipeline estandar de spaCy, lo que permite su uso con las utilidades habituales de la libreria (procesado de documentos, visualizacion de entidades, etc.).
- Preparacion para geocodificacion: las entidades geograficas extraidas pueden servir como entrada para sistemas de geocodificacion y analisis geoespacial.
- Soporte multilingue: no disponible; el modelo solo trabaja con texto en ingles.

## Casos de uso

- Construccion de bases de datos de accidentes de trafico: el modelo puede procesar miles de informes narrativos y extraer de forma automatica las ubicaciones (carretera, pueblo, estado) y las victimas, generando registros estructurados para su almacenamiento y consulta.
- Geocodificacion de puntos de accidente: las entidades ROAD, LANDMARK, TOWN y STATE extraidas pueden pasarse a un servicio de geocodificacion (p. ej., Nominatim o Google Maps) para obtener coordenadas y representar los incidentes en un mapa.
- Analisis geoespacial de siniestralidad: los datos estructurados resultantes permiten identificar patrones de concentracion de accidentes por zona, carretera o estado, util para estudios de seguridad vial.
- Investigacion en respuesta a emergencias: al extraer hospitales cercanos y tipos de victimas, el modelo facilita estudios sobre tiempos de respuesta y disponibilidad de recursos sanitarios.
- Curacion de datos para modelos de prediccion: las entidades extraidas pueden usarse como caracteristicas en modelos de machine learning que predicen la gravedad de accidentes o la probabilidad de fatalidad.
- Automatizacion de informes periodisticos: medios que publican noticias de accidentes pueden usar el modelo para estructurar la informacion clave (lugar, carretera, victimas) y generar resumenes o visualizaciones.

## Benchmarks y rendimiento

Segun el articulo de investigacion asociado (disponible en OpenReview), el modelo RTC-NER obtuvo una precision de 93,63, un recall de 93,61 y un F1-score de 93,62, superando a un modelo baseline (no especificado) en las tres metricas. No se proporcionan resultados comparativos con otros modelos NER en la informacion disponible.

| Metrica | Valor |
|---|---|
| Precision | 93,63 |
| Recall | 93,61 |
| F1-score | 93,62 |

Estos datos provienen del paper citado y deben interpretarse en el contexto de su dataset de evaluacion, cuyos detalles no se han publicado en la model card.

## Requisitos de hardware

No se ha publicado informacion sobre requisitos de hardware, VRAM estimada, GPUs recomendadas ni opciones de despliegue. Al ser un modelo spaCy basado en transformer, se espera que pueda ejecutarse en CPU para inferencia, aunque con mayor latencia que en GPU. No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos NER especificos para accidentes de trafico comparables. Los modelos NER genericos de spaCy (como en_core_web_trf) o modelos transformer como BERT podrian servir como referencia, pero no se han publicado comparaciones con ellos en la informacion disponible.

## Limitaciones y advertencias

- El modelo es especifico de dominio y no debe asumirse que generaliza bien a otros tipos de texto (p. ej., noticias generales, informes medicos no relacionados con accidentes).
- El rendimiento puede degradarse con variaciones en el estilo de redaccion entre los datos de entrenamiento y los de aplicacion, errores tipograficos, nombres de lugares ambiguos o ubicaciones no mencionadas explicitamente.
- Los nombres geograficos con multiples interpretaciones pueden causar errores de clasificacion.
- El modelo esta entrenado para el contexto nigeriano; su aplicacion a informes de otros paises puede producir resultados poco fiables.
- Las entidades extraidas deben ser revisadas o validadas antes de usarse en aplicaciones geoespaciales de alta precision.
- La licencia no esta especificada, por lo que se desconoce si permite uso comercial o restricciones de redistribucion.
- El modelo se proporciona con fines de investigacion; las predicciones no deben usarse en decisiones operativas, medicas o de emergencia sin validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pidakwo/rtc-ner
- Articulo de investigacion (Heliyon): doi:10.1016/j.heliyon.2024.e41067
- Dataset asociado (Zenodo): doi:10.5281/ZENODO.15862127
- Paper en OpenReview: https://openreview.net/forum?id=3eKM1dQzKW
