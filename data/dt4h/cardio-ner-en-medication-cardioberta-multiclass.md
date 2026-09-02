# DT4H/cardio-ner-en-medication-cardioberta-multiclass

## Resumen

El modelo `DT4H/cardio-ner-en-medication-cardioberta-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de medicamentos en textos clínicos cardiológicos en inglés. Desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto europeo financiado por Horizon Europe, este modelo forma parte de una familia de herramientas de procesamiento de lenguaje natural orientadas al dominio cardiovascular. Su objetivo principal es extraer de forma automática las menciones a fármacos en historiales clínicos, informes de alta y otros documentos médicos, facilitando tareas de análisis secundario de datos sanitarios.

El modelo se basa en una arquitectura transformer del tipo RoBERTa (los tags indican `roberta` y el nombre "cardioberta" sugiere un preentrenamiento específico en corpus cardiológicos), con un total de 124.647.939 parámetros. Está diseñado para la tarea de clasificación de tokens (token-classification) y se distribuye en formato safetensors, con un tamaño de repositorio de 0,2 GB. Aunque la ficha oficial es muy escueta, el contexto del proyecto indica que se enmarca en un esfuerzo multilingüe de NER cardiológico, con variantes para otros idiomas como el checo.

Actualmente el modelo no registra descargas ni valoraciones en Hugging Face, lo que sugiere que es un recurso reciente o de uso interno del proyecto. Su relevancia radica en la escasez de modelos NER específicos para cardiología y en la necesidad de herramientas fiables para la extracción de información de datos clínicos no estructurados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (inferido por tags y nombre "cardioberta", no confirmado oficialmente) |
| Parametros totales | 124.647.939 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se infiere a partir de los metadatos y el nombre del modelo. "Cardioberta" apunta a un modelo base de tipo RoBERTa preentrenado en textos cardiológicos, sobre el cual se ha añadido una cabeza de clasificación de tokens para NER. El número de parámetros (124,6 millones) es consistente con un modelo RoBERTa-base (110M) más la capa de clasificación. Sin embargo, no se dispone de información oficial sobre el proceso de preentrenamiento, el corpus utilizado, el número de tokens de entrenamiento ni las técnicas de ajuste (fine-tuning) empleadas. La model card solo indica que la tarea es token-classification y el framework PyTorch.

El proyecto DataTools4Heart, que financia este desarrollo, se centra en la creación de una plataforma federada y respetuosa con la privacidad para el análisis de datos cardiológicos. Esto sugiere que el modelo fue entrenado con datos clínicos posiblemente anonimizados, aunque no se especifica la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. No hay información sobre innovaciones técnicas particulares más allá de la especialización en el dominio.

## Capacidades

- Reconocimiento de entidades nombradas (NER) para medicamentos en textos clínicos cardiológicos en inglés.
- Clasificación de tokens a nivel de palabra o subpalabra, devolviendo etiquetas de tipo BIO para identificar el inicio y la continuación de las menciones a fármacos.
- Procesamiento de documentos médicos no estructurados como informes de alta, notas de evolución o historiales electrónicos.
- Integración con el ecosistema Hugging Face Transformers, permitiendo su uso mediante `AutoModelForTokenClassification`.
- No se documentan capacidades adicionales como razonamiento, generación de texto, tool calling o soporte multilingüe (el modelo está limitado al inglés).

## Casos de uso

- **Extracción de medicamentos de historiales clínicos electrónicos**: el modelo puede procesar automáticamente notas clínicas para identificar todos los fármacos mencionados, facilitando la construcción de bases de datos estructuradas a partir de texto libre.
- **Apoyo a ensayos clínicos y estudios observacionales**: al extraer menciones de medicamentos de grandes volúmenes de documentos, los investigadores pueden correlacionar tratamientos con resultados cardiovasculares sin revisión manual.
- **Análisis de farmacovigilancia**: la detección de medicamentos en informes de eventos adversos permite monitorizar reacciones y posibles interacciones en población cardiológica.
- **Integración en pipelines de procesamiento de lenguaje natural clínico**: puede combinarse con otros modelos NER (por ejemplo, para enfermedades o procedimientos) para enriquecer representaciones semánticas de documentos médicos.
- **Soporte a sistemas de ayuda a la decisión clínica**: la extracción de medicamentos puede alimentar sistemas que alerten sobre duplicidades terapéuticas o contraindicaciones.
- **Investigación en repositorios federados**: en el contexto de DataTools4Heart, el modelo puede desplegarse en nodos locales para extraer información sin centralizar datos sensibles, preservando la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de precisión, recall o F1 para este modelo ni comparaciones con alternativas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 124 millones de parámetros en fp32, el modelo ocupa aproximadamente 500 MB de memoria. En fp16 se reduce a unos 250 MB. Es viable en GPUs con 2 GB o menos.
- **GPU recomendadas**: cualquier GPU moderna con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) puede ejecutar el modelo. Para procesamiento por lotes o integración en servicios, se recomienda una GPU con 4-8 GB (RTX 3070, A10, etc.).
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe en GPUs de consumo básicas e incluso en CPU (para inferencia en lote, aunque más lenta).
- **Opciones de despliegue**: al ser un modelo de transformers estándar, puede servirse con `pipeline` de Hugging Face, `vLLM` (aunque no está optimizado para NER, es posible), `TGI` (no recomendado para token classification) o mediante un contenedor FastAPI. Para entornos ligeros, también se puede exportar a ONNX o TorchScript.
- **Latencia y throughput estimados**: no se dispone de mediciones oficiales. En una GPU moderna (p. ej., RTX 3090), la inferencia sobre un documento de 512 tokens debería tomar menos de 10 ms por lote pequeño.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Tarea | Licencia |
|---|---|---|---|---|
| DT4H/cardio-ner-en-medication-cardioberta-multiclass | 124,6 M | en | NER de medicamentos cardiológicos | no disponible |
| DT4H/cardio-ner-en-cardioberta-multiclass | no disponible | en | NER de enfermedades, medicamentos, procedimientos y síntomas | no disponible |
| DT4H/cardio-ner-cs-medication-cardioberta-multiclass | no disponible | cs (checo) | NER de medicamentos cardiológicos | no disponible |

Los tres modelos pertenecen a la misma familia del proyecto DataTools4Heart. El modelo en inglés para medicamentos es el único con parámetros públicos (124,6 M). No se dispone de datos de rendimiento para comparar. En el ámbito general, existen otros modelos NER clínicos como `en_ner_bc5cdr_md` (BioBERT) o `clinicalnerpt` pero no son directamente comparables por dominio y licencia.

## Limitaciones y advertencias

- **Ausencia de licencia explícita**: no se indica ninguna licencia en la ficha, lo que impide su uso comercial sin consultar al autor. Es necesario contactar con DataTools4Heart para aclarar los términos.
- **Sin datos de rendimiento**: no hay métricas publicadas, por lo que no se puede evaluar su precisión ni comparar con otros modelos. El usuario debe validar el modelo con sus propios datos antes de usarlo en producción.
- **Alcance limitado al inglés**: no soporta otros idiomas, a pesar de que el proyecto tiene variantes para checo.
- **Posibles sesgos en el dominio**: al estar entrenado probablemente con datos de una región o institución específica, podría presentar sesgos en vocabulario, nombres de fármacos o formatos de documentación diferentes a otros entornos clínicos.
- **Riesgo de alucinación en entidades**: aunque es un modelo discriminativo (no generativo), puede cometer errores de etiquetado, especialmente con nombres de medicamentos compuestos o abreviaturas poco comunes.
- **Sin soporte para contexto largo**: al ser un modelo basado en RoBERTa, la longitud máxima de secuencia es típicamente 512 tokens, lo que obliga a truncar o segmentar documentos largos.
- **Estado de madurez**: con cero descargas y cero likes, el modelo no ha sido validado por la comunidad; se recomienda tratarlo como versión experimental.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/DT4H/cardio-ner-en-medication-cardioberta-multiclass)
- [Organización DataTools4Heart en Hugging Face](https://huggingface.co/DataTools4Heart)
- [Repositorio GitHub de DataTools4Heart](https://github.com/DataTools4Heart/)
- [Sitio web oficial del proyecto DataTools4Heart](https://www.datatools4heart.eu/)
