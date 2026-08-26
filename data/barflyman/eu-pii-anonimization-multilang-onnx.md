# barflyman/eu-pii-anonimization-multilang-ONNX

## Resumen

`barflyman/eu-pii-anonimization-multilang-ONNX` es una conversión a formato ONNX del modelo `bardsai/eu-pii-anonimization-multilang`, un detector multilingüe de información personal identificable (PII) diseñado para entornos de cumplimiento normativo en la Unión Europea. El modelo original, desarrollado por bards.ai, cubre las 24 lenguas oficiales de la UE y detecta 36 clases de entidades mapeadas a las categorías especiales del artículo 9 del GDPR y a los identificadores de alto riesgo del AI Act. Esta versión ONNX permite ejecutar la inferencia en CPU sin infraestructura GPU y también en el navegador mediante Transformers.js, lo que facilita su integración en pipelines de redacción de datos o en herramientas de anonimización en tiempo real.

La arquitectura subyacente es `xlm-roberta`, un transformer multilingüe preentrenado, adaptado a la tarea de clasificación de tokens con etiquetado BIO (Begin-Inside-Outside). El modelo se distribuye con pesos ONNX cuantizados en INT8, que reducen el tamaño aproximadamente cuatro veces en comparación con la versión completa, manteniendo la salida original. Aunque no se especifican los parámetros totales exactos en la ficha, el tamaño del repositorio (3,5 GB) corresponde a la familia de modelos xlm-roberta de tamaño base o similar. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones de atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | xlm-roberta (transformer para clasificación de tokens) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX (exportación) e INT8 cuantizado (`onnx/model_quantized.onnx`) |
| Idiomas soportados | 24 idiomas de la UE: en, pl, de, fr, es, it, nl, pt, ro, cs, sv, el, hu, bg, hr, da, et, fi, ga, lv, lt, mt, sk, sl |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (incluye safetensors en el modelo base, pero esta versión es ONNX) |

## Arquitectura y entrenamiento

El modelo se basa en `xlm-roberta`, un transformer pre-trained multilingüe, adaptado a la tarea de reconocimiento de entidades nombradas (NER) mediante una cabeza de clasificación de tokens con etiquetado BIO. El entrenamiento se realizó sobre datos multilingües reales (no traducciones del inglés), lo que garantiza un rendimiento comparable al de la línea base inglesa en lenguas como polaco, alemán, francés, italiano y español, según la documentación del modelo original.

El sistema cubre ocho familias de entidades: identidad personal, contacto y localización, documentos oficiales, datos financieros, identificadores técnicos, datos de organización, datos de salud/biométricos/genéticos (artículo 9 del GDPR) y categorías especiales (origen étnico, opiniones políticas, creencias religiosas, orientación sexual, afiliación sindical). No se especifican detalles sobre el número de tokens de entrenamiento, composición exacta del dataset ni el uso de técnicas de alineación (RLHF/DPO). La conversión a ONNX se realizó automáticamente mediante un espacio de Hugging Face, y se incluyen pesos cuantizados para inferencia en CPU.

## Capacidades

- Detección de PII en 24 idiomas de la UE con un solo modelo.
- Cobertura de 36 clases de entidades, incluidas las categorías especiales del GDPR (salud, datos biométricos, genéticos, origen étnico, opiniones políticas, religión, orientación sexual, afiliación sindical).
- Clasificación de tokens con etiquetado BIO (B- y I-), lo que permite localizar el inicio y la extensión de cada entidad.
- Inferencia en CPU con ONNX Runtime y en el navegador mediante Transformers.js, sin necesidad de GPU.
- Incluye pesos cuantizados INT8 para reducir el tamaño y mejorar la latencia en entornos de producción.
- Soporte de uso en pipelines de redacción de PII en tiempo real o en procesos de ingestión de datos.
- No es un modelo generativo; es un clasificador de tokens, por lo que no genera texto ni soporta tool calling o razonamiento multi-paso.

## Casos de uso

- Redacción de PII en documentos y tickets de soporte: el modelo puede identificar y anonimizar nombres, direcciones, números de documento y datos de salud en correos electrónicos, tickets de atención al cliente o logs de chat antes de su almacenamiento o análisis, garantizando el cumplimiento del GDPR.
- Sanitización de datasets para entrenamiento o compartición: antes de compartir datos con terceros o moverlos entre jurisdicciones, el modelo detecta y elimina PII en datasets multilingües, reduciendo el riesgo de fuga de información personal.
- Filtrado de entradas en pipelines de RAG: al integrar el modelo en la fase de ingesta, se pueden filtrar los datos personales que no deben llegar al índice de búsqueda ni a los prompts del modelo generativo, evitando la exposición de información sensible en logs o respuestas.
- Auditoría y trazabilidad de redacciones: combinado con reglas de post-procesado, el modelo permite generar un registro de qué entidades se han redactado, cuándo y por qué, apoyando la construcción de pistas de auditoría para los responsables de protección de datos (DPO).
- Cumplimiento del artículo 9 del GDPR: la detección de categorías especiales (salud, datos biométricos, genéticos, etc.) en documentos legales o médicos permite aplicar políticas de acceso y retención específicas para estos datos de alto riesgo.
- Anonimización en el navegador: gracias a la versión ONNX y a Transformers.js, se puede ofrecer una herramienta de redacción de PII que ejecuta toda la inferencia localmente en el dispositivo del usuario, sin que los datos salgan de su equipo, lo que es especialmente útil en entornos de alta sensibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La documentación del modelo original indica que el rendimiento en polaco, alemán, francés, italiano y español es comparable al de la línea base inglesa, pero no se proporcionan cifras concretas de exactitud, precisión o recall. Por tanto, no se dispone de datos numéricos para comparar formalmente el modelo con alternativas.

## Requisitos de hardware

- Inferencia en CPU: el modelo cuantizado ONNX INT8 está diseñado para ejecutarse en CPU con latencias aceptables en pipelines de redacción en tiempo real o de ingesta de datos. No se requiere GPU.
- GPU: no es necesaria para la inferencia, aunque se puede utilizar si se dispone de ella para acelerar el procesamiento en lote.
- Memoria: el tamaño del repositorio es de 3,5 GB, pero la versión cuantizada INT8 reduce el peso aproximadamente cuatro veces en comparación con la versión completa, por lo que se estima que la carga en memoria es de varios cientos de MB a 1 GB dependiendo de la implementación.
- Opciones de despliegue: ONNX Runtime (CPU), Transformers.js en navegador, y mediante la librería `transformers` de Hugging Face (para la versión PyTorch original). No se menciona soporte directo para vLLM o TGI, ya que no es un modelo generativo.
- Demo en línea: el modelo original ofrece una demostración en el navegador (https://eu-pii.bards.ai/) que funciona sin conexión a internet para el procesamiento.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. Como referencia, existen alternativas en el espacio de detección de PII como modelos NER generalizados (por ejemplo, modelos basados en BERT o spaCy) que suelen estar limitados al inglés o a un número reducido de entidades. Sin embargo, no se han encontrado datos de rendimiento ni de arquitectura para establecer una comparación formal con este modelo. Por tanto, la comparativa con alternativas específicas se considera no disponible.

## Limitaciones y advertencias

- Rendimiento variable: la precisión del modelo depende de la lengua, el dominio y la calidad del texto de entrada. El ruido de OCR, el code-switching (mezcla de idiomas) y los formatos no habituales pueden degradar la capacidad de detección.
- Ambigüedad en las entidades: algunos nombres pueden ser también topónimos, o números con formato de identificador que no son realmente identificadores. Esto requiere reglas de post-procesado o revisión humana para evitar falsos positivos o negativos.
- Detección no equivale a cumplimiento legal: el modelo es una herramienta de apoyo a un flujo de redacción, no un sustituto del juicio del responsable de protección de datos (DPO). El cumplimiento normativo requiere un análisis más amplio.
- Ajuste de umbral necesario: el punto de operación óptimo (umbral de confianza) depende del caso de uso y debe calibrarse para cada escenario de producción.
- Limitación de contexto: no se ha especificado la longitud máxima de contexto que soporta el modelo, por lo que es necesario truncar o dividir textos muy largos antes de la inferencia.
- Licencia y uso: la licencia Apache 2.0 permite uso comercial y modificación, pero se recomienda revisar los términos completos de la licencia para el uso en aplicaciones de producción.

## Enlaces

- [Modelo en Hugging Face (versión ONNX)](https://huggingface.co/barflyman/eu-pii-anonimization-multilang-ONNX)
- [Modelo original de bardsai en Hugging Face](https://huggingface.co/bardsai/eu-pii-anonimization-multilang)
- [Demo en el navegador](https://eu-pii.bards.ai/)
- [Documentación de la demo](https://eu-pii.bards.ai/docs/)
- [Repositorio GitHub de integración (fabiopauli/eu-pii-anonymizer)](https://github.com/fabiopauli/eu-pii-anonymizer/blob/main/README.en.md)
