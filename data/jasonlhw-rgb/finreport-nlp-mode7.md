# jasonlhw-rgb/finreport-nlp-mode7

## Resumen

FinReport-NLP mode7 es un modelo de reconocimiento de entidades nombradas (NER) desarrollado por jasonlhw-rgb para extraer secciones objetivo de informes financieros en chino, como la sección de análisis y discusión de la gestión (MD&A). Se trata del modelo final de una iteración que va de mode1 a mode7, y ha sido aplicado en producción a un corpus de aproximadamente 22.800 informes de texto plano. El modelo está construido sobre el framework spaCy, partiendo de un pipeline en blanco para chino (`spacy.blank("zh")`) y añadiendo un componente de NER con la etiqueta `TARGET_SECTION`. No se dispone de información sobre el número total de parámetros ni la longitud de contexto, ya que no es un modelo de lenguaje generativo sino un clasificador de token para NER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline spaCy de NER (`spacy.blank("zh")` + `ner`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | Formato nativo de spaCy (no safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo se basa en un pipeline de spaCy creado desde cero con `spacy.blank("zh")` y un componente de NER. La arquitectura interna del componente no está especificada en la documentación. El entrenamiento se realizó sobre un corpus de ~22.800 informes financieros en texto plano procedentes de caiwushi.net, con conjuntos de entrenamiento y prueba disponibles en Google Drive. No se especifica el número de tokens ni la composición detallada del dataset. Al ser un modelo discriminativo, no se aplicaron técnicas de RLHF ni DPO.

## Capacidades

- Extracción de entidades de tipo `TARGET_SECTION` en texto chino de informes financieros.
- Identificación de secciones de análisis y discusión de la gestión (MD&A) en informes anuales.
- Token-classification mediante el framework spaCy, con la etiqueta única `TARGET_SECTION`.
- Procesamiento de documentos largos en formato de texto plano.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales.
- Integración con pipelines de spaCy para preprocesamiento y extracción de información.

## Casos de uso

- Extracción automática de secciones MD&A en informes anuales chinos: el modelo se carga con spaCy y procesa el texto del informe para localizar y extraer la sección objetivo, ahorrando tiempo en la revisión manual.
- Análisis de informes financieros para auditoría: permite segmentar documentos y extraer las secciones relevantes para su revisión posterior por parte de auditores.
- Alimentación de pipelines de document AI: el modelo puede integrarse en flujos de procesamiento documental para clasificar y extraer contenido de informes financieros.
- Búsqueda y recuperación de información en corpus de informes: al extraer las secciones objetivo, facilita indexar y buscar contenido específico dentro de grandes colecciones de informes.
- Monitoreo regulatorio: ayuda a identificar automáticamente las secciones de gestión y análisis en presentaciones regulatorias, lo que puede agilizar el cumplimiento normativo.
- Preprocesamiento para análisis de sentimiento o riesgo: al extraer la sección MD&A, se puede aplicar análisis posterior sobre ese fragmento para evaluar el tono o el riesgo de la empresa.
- Automatización de lectura de informes para inversores: simplifica la extracción de información clave de los informes financieros, permitiendo un análisis más rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas de evaluación como precisión, recall o F1 para este modelo.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware para este modelo.
- Al ser un modelo de NER basado en spaCy, se espera que sea ligero y ejecutable en CPU, pero no hay datos oficiales.
- No se dispone de información sobre VRAM, GPU recomendadas, latencia o throughput.
- El despliegue se realiza mediante spaCy, que puede ejecutarse en Python sin necesidad de infraestructura especializada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. Este modelo es un caso especializado de NER para secciones de informes financieros chinos, por lo que no es directamente comparable con modelos de lenguaje generativos. Podría compararse con otros pipelines de NER de spaCy para chino, pero no hay datos de rendimiento en la información disponible.

## Limitaciones y advertencias

- Limitado al idioma chino (zh); no funciona con otros idiomas.
- Solo reconoce la etiqueta `TARGET_SECTION`; no extrae otras entidades como personas, organizaciones o fechas.
- No es un modelo generativo; no puede generar texto ni responder preguntas.
- Depende de la calidad del texto de entrada; los informes deben estar en formato de texto plano.
- No se han publicado métricas de evaluación, por lo que se desconoce su precisión en producción.
- La licencia MIT permite uso comercial, pero no hay garantías de rendimiento ni soporte.
- El repositorio en HuggingFace tiene un tamaño de 0.0 GB, lo que indica que probablemente solo contiene los pesos del modelo, no los datos de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/jasonlhw-rgb/finreport-nlp-mode7
- GitHub: https://github.com/jasonlhw-rgb/FinReport-NLP
- Release zip: https://github.com/jasonlhw-rgb/FinReport-NLP/releases
- Datasets (caiwushi.net): https://caiwushi.net/
- Conjuntos de entrenamiento/prueba (Google Drive): https://drive.google.com/drive/folders/19Qco5VdHnL1niEejzCE-LQr3aiEFF6E-?usp=drive_link
- Contacto: jason.lhw2025@gmail.com
