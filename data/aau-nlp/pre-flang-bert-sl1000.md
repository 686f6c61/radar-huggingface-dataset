# AAU-NLP/Pre-FLANG-BERT-SL1000

## Resumen

Pre-FLANG-BERT-SL1000 es un modelo de etiquetado de secuencias (token classification) basado en BERT y afinado para extraer indicadores clave de rendimiento (KPI) financieros de informes de resultados de la SEC estadounidense (formularios 10-K y 10-Q). Lo desarrolla el grupo AAU-NLP (Universidad de Aalborg) y parte del modelo de dominio financiero SALT-NLP/FLANG-BERT, al que se le ha añadido una cabeza de clasificación de tokens con 1.001 etiquetas.

El modelo resuelve un problema muy concreto: identificar menciones de KPIs en texto financiero y mapearlas a las etiquetas de la taxonomía de presentación iXBRL, tras subir las entidades un nivel en la jerarquía (`n=1`). Se entrena sobre el dataset HiFi-KPI y cubre las 1.000 etiquetas de entidad más frecuentes más la etiqueta externa `O`. Es la variante FLANG del checkpoint Pre-BERT-SL1000 dentro de la misma colección.

Con 109,7 millones de parámetros, es un modelo pequeño y ligero (repo de 0,4 GB) pensado para integrarse en pipelines de procesamiento documental financiero, no para generación de texto. Su relevancia radica en la especialización: aplica un encoder preentrenado en lenguaje financiero a una tarea de extracción estructurada con una taxonomía regulatoria concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 109.661.417 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (ventana de entrada BERT; dividir documentos largos en fragmentos) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT con cabeza de clasificación de tokens (`BertForTokenClassification`). Se inicializa desde SALT-NLP/FLANG-BERT, un BERT preentrenado en dominio financiero, y se afina sobre el dataset HiFi-KPI para la tarea de sequence labeling. La capa de salida tiene 1.001 etiquetas: 1.000 etiquetas de entidad financiera (las más frecuentes de la taxonomía de presentación iXBRL, desplazadas un nivel hacia arriba, `n=1`) más la etiqueta `O`.

Las etiquetas guardadas usan nombres de entidad planos, sin prefijos BIO, y el mapeo exacto etiqueta-a-ID está en `config.json`. El modelo predice etiquetas a nivel de token (subword); no devuelve por sí mismo registros estructurados con valores, fechas o divisas. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF/DPO (no aplicables de forma habitual a este tipo de tarea). La innovación principal es el uso de una taxonomía jerárquica iXBRL como espacio de etiquetas y el preentrenamiento financiero del encoder base.

## Capacidades

- Etiquetado de secuencias (token classification) para reconocimiento de entidades financieras (NER).
- Extracción de menciones de KPIs financieros en informes 10-K y 10-Q en inglés.
- Mapeo de menciones a etiquetas de la taxonomía de presentación iXBRL (1.000 etiquetas de entidad).
- Reconocimiento de entidades basado en iXBRL para el parseo de documentos financieros.
- Salida a nivel de token con etiqueta, score y offsets de caracteres (compatible con `pipeline("token-classification")`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Extracción de KPIs de informes 10-K y 10-Q: el modelo identifica menciones de indicadores en el texto de los formularios, adecuado porque está afinado específicamente sobre la taxonomía de presentación de estos documentos.
- Parseo documental financiero con iXBRL: se usa para localizar entidades y alinearlas con etiquetas de la taxonomía regulatoria, facilitando la estructuración posterior de datos.
- Enriquecimiento de pipelines de análisis fundamental: las menciones etiquetadas pueden alimentar procesos de extracción de métricas para comparativas entre empresas y periodos.
- Preprocesado para modelos de extracción de valores: al marcar dónde aparecen los KPIs, sirve como primera etapa antes de un componente que capture cifras, fechas y divisas (que este checkpoint no devuelve).
- Indexación y búsqueda semántica de informes: las etiquetas por token permiten construir índices sobre tipos de KPI para recuperar fragmentos relevantes en bases documentales financieras.
- Investigación en NLP financiero: como checkpoint de referencia para comparar enfoques (BERT vs. FLANG) sobre el dataset HiFi-KPI en tareas de etiquetado jerárquico.
- Moderación y control de calidad de datos: detección de menciones de KPI en corpus para validar cobertura y consistencia de extracciones automáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,4-1 GB en fp32 para los pesos (109,7 M de parámetros); menor aún con cuantización a fp16 o int8.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso inferencia en CPU son viables para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (pipeline de token-classification), y por compatibilidad de arquitectura BERT, herramientas estándar como vLLM, TGI, ONNX Runtime o llama.cpp (si se convierte a GGUF), aunque el autor solo documenta el uso con `transformers`.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 109 M de parámetros, la latencia por fragmento es baja, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pre-FLANG-BERT-SL1000 | 109,7 M | no disponible | Token classification (KPI, iXBRL) | Apache 2.0 | Hugging Face (AAU-NLP) |
| Pre-BERT-SL1000 | no disponible | no disponible | Token classification (KPI, iXBRL) | no disponible | Hugging Face (AAU-NLP) |
| Cal-FLANG-BERT-SL1000 | no disponible | no disponible | Token classification (KPI, iXBRL) | no disponible | Hugging Face (AAU-NLP) |
| SALT-NLP/FLANG-BERT | no disponible | no disponible | Encoder financiero (base, sin cabeza de KPI) | no disponible | Hugging Face (SALT-NLP) |

La comparativa directa con métricas de rendimiento no está disponible; los modelos de la colección HiFi-KPI comparten tarea y espacio de etiquetas, diferenciándose por el encoder base (BERT vs. FLANG) y la variante de etiquetado.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que limita su uso fuera de informes en inglés.
- Dominio restringido: entrenado para informes SEC (10-K/10-Q) y taxonomía iXBRL; su rendimiento fuera de ese dominio no está garantizado.
- No devuelve registros estructurados: las predicciones son etiquetas a nivel de token, sin valores, fechas ni divisas; requiere un componente adicional para extraer datos numéricos.
- Ventana de entrada limitada: los documentos largos deben dividirse en párrafos o fragmentos que quepan en la ventana del modelo, con riesgo de perder contexto entre fragmentos.
- Riesgo de alucinación y errores de etiquetado: como cualquier clasificador, puede asignar etiquetas incorrectas o inventar límites de entidad en texto ambiguo; conviene validación humana en producción.
- Sesgos: no documentados por el autor; al derivar de un encoder financiero, puede heredar sesgos del corpus de preentrenamiento de FLANG-BERT.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base SALT-NLP/FLANG-BERT y del dataset HiFi-KPI.
- Madurez: pocas descargas (10) y sin likes en el momento de la consulta; considerar su carácter reciente y la ausencia de benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AAU-NLP/Pre-FLANG-BERT-SL1000
- Modelo base: https://huggingface.co/SALT-NLP/FLANG-BERT
- Contraparte BERT: https://huggingface.co/AAU-NLP/Pre-BERT-SL1000
- Variante Cal-FLANG: https://huggingface.co/AAU-NLP/Cal-FLANG-BERT-SL1000
- Dataset HiFi-KPI: https://huggingface.co/datasets/AAU-NLP/HiFi-KPI
- Paper HiFi-KPI: https://huggingface.co/papers/2502.15411
- Repositorio de código: https://github.com/aaunlp/HiFi-KPI
