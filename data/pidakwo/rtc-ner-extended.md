# pidakwo/rtc-ner-extended

## Resumen

RTC-NER-Extended es un modelo de reconocimiento de entidades nombradas (NER) especializado en el dominio de accidentes de tráfico (road traffic crashes, RTC), desarrollado por el usuario pidakwo. El modelo extrae información estructurada de narrativas no estructuradas sobre accidentes de tráfico, identificando entidades que el modelo base `pidakwo/rtc-ner` no cubre, como hora del accidente, día de la semana, número de vehículos, tipo de vehículo, personas implicadas y factores causales.

El modelo está construido con spaCy 3.8.x y consta de un pipeline `tok2vec → ner`. Utiliza `MultiHashEmbed` para la representación de tokens y `MaxoutWindowEncoder` para representaciones contextuales, junto con una arquitectura NER basada en transiciones. Además de su función principal de extracción de información, el modelo se ha empleado en flujos de anonimización de datos, identificando entidades que revelan información personal de los implicados (nombres, matrículas, direcciones y organizaciones) para su posterior sustitución por etiquetas.

El modelo está pensado para investigación y aplicaciones de extracción de información en el ámbito de la seguridad vial, con un enfoque específico en narrativas de accidentes en Nigeria. Su relevancia radica en la creación de conjuntos de datos estructurados a partir de informes no estructurados, lo que facilita el análisis posterior y la investigación en seguridad vial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | spaCy pipeline `tok2vec → ner` (MultiHashEmbed + MaxoutWindowEncoder + TransitionBasedParser.v2) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (modelo spaCy nativo, no cuantizable en el sentido de LLMs) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | spaCy (`.spacy` / `.whl` / directorio de modelo) |

## Arquitectura y entrenamiento

El modelo utiliza un pipeline de spaCy compuesto por dos componentes: `tok2vec` y `ner`. El componente `tok2vec` emplea `MultiHashEmbed` con un ancho de embedding de 96, seguido de un `MaxoutWindowEncoder` con profundidad 4, ventana de tamaño 1 y 3 piezas maxout. Las representaciones se basan en características hash de `NORM`, `PREFIX`, `SUFFIX` y `SHAPE`, sin usar word vectors estáticos.

El componente NER usa `TransitionBasedParser.v2` con ancho oculto de 64, 2 piezas maxout, `use_upper` activado y tamaño de corte del oráculo de 100. El entrenamiento se realizó con spaCy 3.8.x, con un tamaño de lote de 1000, dropout de 0.1, optimizador Adam con tasa de aprendizaje 0.001, regularización L2 de 0.01, clipping de gradiente en 1.0, máximo de 20.000 pasos de entrenamiento, evaluación cada 200 pasos y paciencia de 1.600. No se dispone de información sobre el tamaño del conjunto de datos de entrenamiento ni sobre el número de tokens utilizados.

## Capacidades

- Reconocimiento de 10 tipos de entidades específicas del dominio de accidentes de tráfico: `ADDRESS`, `FACTORS`, `NO_VEHICLES`, `PERSON`, `PERSONS_INVOLVED`, `PLATE_NO`, `TIME`, `VEHICLE_TYPE`, `VICTIM_ORGANIZATION` y `WEEKDAY`.
- Extracción de información temporal (hora del accidente y día de la semana).
- Identificación de factores causales, tipos de colisión, efectos de colisión, atributos del sitio físico, condiciones ambientales, actores (humanos y animales), tipos de mercancías y categoría general de vehículo.
- Detección de información personal identificable (PII) como nombres de personas, matrículas, direcciones y organizaciones de víctimas, útil para flujos de anonimización.
- Procesamiento de narrativas en inglés, con enfoque en informes de accidentes de tráfico.
- Integración nativa con el ecosistema spaCy, lo que permite su uso en pipelines de procesamiento de lenguaje natural existentes.

## Casos de uso

- Extracción de información estructurada de informes de accidentes de tráfico: el modelo procesa narrativas no estructuradas y extrae entidades como tipo de vehículo, número de vehículos, personas implicadas y factores causales, permitiendo convertir texto libre en datos tabulares para su análisis.
- Construcción y enriquecimiento de conjuntos de datos RTC: al etiquetar automáticamente narrativas de accidentes, el modelo facilita la creación de datasets estructurados para investigación en seguridad vial, como se describe en el artículo sobre geo-parsing de incidentes RTC en Nigeria.
- Anonimización de datos personales en informes de accidentes: el modelo identifica entidades PII (nombres, matrículas, direcciones, organizaciones) que pueden ser sustituidas por sus etiquetas o marcadores, permitiendo publicar datos procesados sin revelar información personal.
- Análisis de factores de riesgo en accidentes: la extracción de la entidad `FACTORS` permite identificar patrones causales (condiciones ambientales, tipo de colisión, actores implicados) en grandes volúmenes de informes, apoyando estudios epidemiológicos de seguridad vial.
- Preparación de narrativas RTC para aprendizaje automático downstream: el modelo puede servir como paso previo para tareas de clasificación, agrupación o predicción, estructurando el texto de entrada en características útiles.
- Curación de datos y estructuración de información para organismos de tráfico: agencias de seguridad vial pueden usar el modelo para procesar informes policiales o de emergencias, extrayendo automáticamente campos clave para bases de datos oficiales.

## Benchmarks y rendimiento

Según los resultados publicados en OpenReview (artículo "Geo-parsing and Geo-Visualization of Road Traffic Crash Incident"), el modelo RTC-NER (base) obtuvo los siguientes resultados comparado con un baseline:

| Metrica | RTC-NER | Baseline |
|---|---|---|
| Precision | 93.63 | inferior |
| Recall | 93.61 | inferior |
| F1-score | 93.62 | inferior |

No se dispone de benchmarks específicos para la variante RTC-NER-Extended en la información proporcionada. Los datos corresponden al modelo base `rtc-ner`, no a la versión extendida.

## Requisitos de hardware

- Al ser un modelo spaCy de tamaño reducido (embedding width de 96, hidden width de 64), no requiere GPU para inferencia; puede ejecutarse en CPU sin problemas.
- Memoria RAM estimada: inferior a 1 GB para el modelo en memoria, aunque depende del tamaño del texto de entrada.
- GPU recomendada: no necesaria; cualquier CPU moderna es suficiente para inferencia en tiempo real.
- Compatible con cualquier hardware, incluidos entornos de producción de bajo coste y dispositivos sin aceleración GPU.
- Opciones de despliegue: al ser un modelo spaCy, se puede integrar en aplicaciones Python, servicios REST con FastAPI o Flask, o exportar a formato ONNX si se requiere optimización adicional.
- Latencia: no disponible, pero por el tamaño del modelo se espera una latencia de milisegundos por documento en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entidades | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RTC-NER-Extended | NER específico de dominio (accidentes de tráfico) | 10 entidades RTC + PII | ingles | no disponible | HuggingFace |
| RTC-NER (base) | NER específico de dominio (accidentes de tráfico) | entidades RTC (sin las extendidas) | ingles | no disponible | HuggingFace |
| spaCy `en_core_web_trf` | NER generalista | 18 entidades (PER, ORG, GPE, etc.) | ingles | MIT | spaCy |

La comparativa con modelos generalistas como `en_core_web_trf` no es directa: el modelo RTC-NER-Extended está especializado en un dominio muy concreto y no reconoce entidades generales, pero ofrece precisión superior en su dominio específico. No se dispone de otros modelos NER especializados en accidentes de tráfico para comparar.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para narrativas de accidentes de tráfico en inglés; su rendimiento fuera de este dominio será muy limitado.
- La anonimización basada en NER no garantiza la eliminación completa de información personal; el propio autor advierte que se requiere revisión humana o procesamiento adicional antes de publicar texto procesado.
- No se dispone de información sobre el tamaño del conjunto de entrenamiento, la composición del dataset ni posibles sesgos geográficos o demográficos.
- La licencia no está especificada, lo que genera incertidumbre sobre las condiciones de uso comercial y redistribución.
- El modelo no utiliza word vectors estáticos, lo que puede limitar su capacidad para generalizar a vocabulario no visto durante el entrenamiento.
- No se han publicado métricas de rendimiento específicas para la versión extendida; los datos de benchmarks corresponden al modelo base.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido ampliamente validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pidakwo/rtc-ner-extended
- Artículo DOAJ (Geo-parsing y análisis de incidentes RTC): https://doaj.org/article/ef7b3196ed5d4bce818d37913e5912bf
- Artículo OpenReview (PDF): https://openreview.net/pdf?id=3eKM1dQzKW
- Foro OpenReview: https://openreview.net/forum?id=3eKM1dQzKW
