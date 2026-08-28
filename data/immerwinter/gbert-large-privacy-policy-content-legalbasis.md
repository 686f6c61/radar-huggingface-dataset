# Immerwinter/gbert-large-privacy-policy-content-legalbasis

## Resumen

El modelo `Immerwinter/gbert-large-privacy-policy-content-legalbasis` es un clasificador de texto en alemán, fine-tuneado a partir de `deepset/gbert-large`, diseñado para identificar la base jurídica (legal basis) en políticas de privacidad. Forma parte del pipeline DeepPrivacy, un conjunto de modelos especializados que analizan distintos aspectos de las políticas de privacidad en alemán, como contexto, audiencia, contacto, control, borrado, finalidad, retención, compartición y derechos del usuario, entre otros.

El modelo resuelve un problema concreto: la clasificación automática de oraciones de políticas de privacidad según la base legal del tratamiento de datos personales conforme al RGPD, en ocho categorías: `Consent`, `Contract`, `EmploymentProcedure`, `LegalObligation`, `LegitimateInterests`, `PublicInterests`, `VitalInterests` y `Other`. Fue entrenado sobre 4.003 oraciones anotadas y alcanza un macro-F1 de 0,984 y micro-F1 de 0,977.

Con 335,7 millones de parámetros, sigue la arquitectura BERT large (24 capas, 1024 dimensiones ocultas) y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas. Su relevancia actual radica en la creciente necesidad de automatizar el cumplimiento normativo en materia de protección de datos, especialmente en el contexto europeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT large (Transformer encoder, 24 capas, 16 cabezas de atencion) |
| Parametros totales | 335.744.008 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (maximo estandar de BERT) |
| Tipos de cuantizacion | Solo safetensors FP32 (no se publican cuantizaciones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | Aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT large, un Transformer encoder con 24 capas, 1024 dimensiones ocultas y 16 cabezas de atención, con un máximo de 512 tokens de contexto. El modelo base `deepset/gbert-large` fue entrenado en octubre de 2020 por los creadores del BERT alemán original junto con el equipo de dbmdz, y supera a sus predecesores en tareas de procesamiento de lenguaje natural en alemán.

El fine-tuning se realizó sobre 4.003 oraciones anotadas de políticas de privacidad en alemán, con una tarea de clasificación de texto multiclase en ocho categorías de base jurídica. No se dispone de información sobre el uso de técnicas de RLHF, DPO o aumentación de datos adicionales. El entrenamiento se centró exclusivamente en la clasificación supervisada de oraciones, sin innovaciones arquitectónicas adicionales respecto al modelo base.

## Capacidades

- Clasificación de oraciones en alemán según la base jurídica del tratamiento de datos, con ocho categorías: `Consent`, `Contract`, `EmploymentProcedure`, `LegalObligation`, `LegitimateInterests`, `PublicInterests`, `VitalInterests` y `Other`.
- Análisis de políticas de privacidad en alemán como parte de un pipeline modular, integrándose con otros modelos especializados (contexto, audiencia, control, borrado, finalidad, retención, compartición, etc.).
- Detección de la base legal en oraciones individuales, lo que permite un análisis granular y trazable de documentos legales.
- Soporte de clasificación de texto con etiquetas predefinidas, adecuado para pipelines de procesamiento de documentos legales.
- Capacidad multilingüe limitada al alemán; existe una versión en inglés del mismo clasificador (`Wravn/privbert-privacy-policy-content-legalbasis`).
- No soporta generación de texto, tool calling, agentes, visión ni audio; es exclusivamente un clasificador de secuencias.

## Casos de uso

- Auditoría de cumplimiento RGPD: el modelo permite analizar políticas de privacidad en alemán de forma automatizada, identificando qué base jurídica se declara para cada tratamiento de datos, lo que facilita la verificación del cumplimiento normativo.
- Revisión legal de contratos y avisos de privacidad: despachos de abogados y departamentos legales pueden procesar grandes volúmenes de documentos para extraer automáticamente las bases legales declaradas, reduciendo el tiempo de revisión manual.
- Monitorización de cambios regulatorios: permite comparar versiones de políticas de privacidad a lo largo del tiempo y detectar cambios en las bases legales declaradas, útil para el seguimiento de actualizaciones normativas.
- Generación de informes de cumplimiento: integrado en pipelines de procesamiento de documentos, el modelo puede alimentar sistemas de reporting que generan informes estructurados sobre la conformidad de políticas de privacidad con el RGPD.
- Análisis de competencia: permite analizar las políticas de privacidad de competidores en el mercado germanoparlante para entender sus estrategias de tratamiento de datos y bases legales utilizadas.
- Investigación académica en derecho y NLP: el modelo puede utilizarse como componente en investigaciones sobre análisis automatizado de documentos legales, detección de sesgos en políticas de privacidad o estudios comparativos entre jurisdicciones.
- Integración en herramientas de gestión de consentimiento: puede ayudar a clasificar automáticamente las bases legales en sistemas de gestión de consentimiento (CMP) para empresas que operan en Alemania, Suiza o Austria.

## Benchmarks y rendimiento

El modelo card reporta las siguientes métricas, evaluadas sobre el conjunto de validación del fine-tuning:

| Metrica | Valor |
|---|---|
| Macro-F1 (M-f1) | 0,984 |
| Micro-F1 (μ-f1) | 0,977 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Tampoco se dispone de resultados en benchmarks estándar como MMLU, HumanEval o GLUE, ya que se trata de un modelo especializado en una tarea concreta y no de un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,34 GB en FP32, unos 0,67 GB si se convierte a FP16 (conversión manual necesaria, ya que no se publican pesos en FP16).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA GTX 1060, RTX 3060 o superior ejecuta el modelo sin problemas. También es viable en GPU integradas con suficiente memoria compartida.
- Ejecución en CPU: viable con baja latencia para inferencia por lotes; el modelo de 335M parámetros puede procesar oraciones individuales en menos de 100 ms en un CPU moderno.
- Opciones de despliegue: Hugging Face Transformers (PyTorch), ONNX Runtime, TensorFlow Serving; no se proporcionan pesos en formato GGUF, por lo que no es compatible directamente con llama.cpp u Ollama sin conversión previa.
- Throughput estimado: no disponible en la información proporcionada; depende del hardware y del tamaño de los lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Tarea | F1 | Licencia |
|---|---|---|---|---|---|
| Immerwinter/gbert-large-privacy-policy-content-legalbasis | 335,7M | Aleman | Clasificacion de base legal | M-f1 0,984 / μ-f1 0,977 | Apache 2.0 |
| Wravn/privbert-privacy-policy-content-legalbasis | no disponible | Ingles | Clasificacion de base legal | no disponible | no disponible |
| deepset/gbert-large (modelo base) | 335,7M | Aleman | Modelo de lenguaje general | no aplica | MIT |

La comparación más directa es con la versión en inglés del mismo clasificador (`Wravn/privbert-privacy-policy-content-legalbasis`), que cubre la misma tarea pero para políticas de privacidad en inglés. No se dispone de datos de rendimiento de esta versión en la información disponible. El modelo base `deepset/gbert-large` sirve como referencia arquitectónica, pero no está especializado en la tarea de clasificación de bases legales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en alemán; no puede procesar correctamente políticas de privacidad en otros idiomas.
- La clasificación se limita a ocho categorías predefinidas de base jurídica; oraciones que no encajen claramente en estas categorías pueden clasificarse erróneamente como `Other`.
- El entrenamiento se realizó sobre 4.003 oraciones anotadas, un conjunto de datos relativamente pequeño que puede limitar la generalización a dominios o estilos de redacción diferentes.
- No se dispone de información sobre sesgos demográficos, geográficos o de estilo de redacción presentes en los datos de entrenamiento.
- Riesgo de alucinación en el sentido de clasificaciones incorrectas cuando el texto contiene lenguaje ambiguo o referencias cruzadas a otras secciones de la política de privacidad.
- La longitud máxima de contexto es de 512 tokens; oraciones o fragmentos más largos deben truncarse, lo que puede perder información relevante.
- No se han publicado resultados de evaluación en conjuntos de datos externos o independientes; las métricas reportadas provienen del propio proceso de fine-tuning.
- El modelo es un clasificador de secuencias, no un modelo generativo; no puede explicar sus decisiones ni generar texto.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Immerwinter/gbert-large-privacy-policy-content-legalbasis
- Modelo base deepset/gbert-large: https://huggingface.co/deepset/gbert-large
- Documentación del modelo base (README): https://huggingface.co/deepset/gbert-large/blob/main/README.md
- Versión en inglés del clasificador: https://huggingface.co/Wravn/privbert-privacy-policy-content-legalbasis
- Modelo de contexto del pipeline: https://huggingface.co/Immerwinter/gbert-large-privacy-policy-context
- Modelo de tema del pipeline: https://huggingface.co/Immerwinter/gbert-large-privacy-policy-topic
- Modelo de audiencia del pipeline: https://huggingface.co/Immerwinter/gelectra-large-privacy-policy-content-audience
- Modelo de contacto del pipeline: https://huggingface.co/Immerwinter/google-bert-privacy-policy-content-contact
- Modelo de control del pipeline: https://huggingface.co/Immerwinter/gbert-large-privacy-policy-content-control
- Modelo de borrado del pipeline: https://huggingface.co/Immerwinter/gbert-large-privacy-policy-content-deletion
- Modelo de política del pipeline: https://huggingface.co/Immerwinter/gelectra-large-privacy-policy-content-policy
- Modelo de procesamiento del pipeline: https://huggingface.co/Immerwinter/gbert-large-privacy-policy-content-processing
- Modelo de finalidad del pipeline: https://huggingface.co/Immerwinter/gelectra-large-privacy-policy-content-purpose
- Modelo de retención del pipeline: https://huggingface.co/Immerwinter/roberta-wechsel-privacy-policy-content-retention
- Modelo de seguridad/privacidad del pipeline: https://huggingface.co/Immerwinter/gbert-large-privacy-policy-content-securityprivacy
- Modelo de venta del pipeline: https://huggingface.co/Immerwinter/roberta-wechsel-privacy-policy-content-selling
- Modelo de compartición del pipeline: https://huggingface.co/Immerwinter/gottbert-privacy-policy-content-sharing
- Modelo de terceros del pipeline: https://huggingface.co/Immerwinter/gbert-large-privacy-policy-content-thirdparty
- Modelo de derechos del usuario del pipeline: https://huggingface.co/Immerwinter/gbert-large-privacy-policy-content-userrights
