# metrika-labs/ru-pii-ner-gliner2.5

## Resumen

ru-pii-ner-gliner2.5 es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de datos personales (PII) en documentos en ruso. Lo desarrolla metrika-labs como un fine-tuning completo de fastino/gliner2.5-multi-v1, un extractor de arquitectura GLiNER2.5. Su propósito no es solo localizar nombres, direcciones, fechas, teléfonos y correos, sino también identificadores administrativos y burocráticos que en la práctica concentran buena parte de los datos personales en documentación real: números de pasaporte y documentos migratorios, SNILS, INN, datos bancarios, números médicos, judiciales, notariales, laborales y académicos, matrículas, billetes, pedidos, cuentas y códigos internos.

La relevancia del modelo radica en su enfoque: el conjunto de etiquetas no está fijado en los pesos, sino que se pasa en tiempo de inferencia junto con el texto, de modo que puede adaptarse a esquemas propios sin reentrenamiento. Además, la anotación se ha diseñado siguiendo el marco legal ruso (152-FZ) y criterios de práctica jurisprudencial, con una política conservadora: ante la duda de si un dato pertenece a una persona, se marca como PII, pero se preservan los datos de organizaciones y valores de referencia no vinculados a personas.

El modelo tiene 287.355.159 parámetros, procesa hasta 4096 tokens por pasada y se distribuye bajo licencia Apache 2.0 en formato safetensors, con un repositorio de 1,2 GB. Está pensado para pipelines de anonimización y cumplimiento normativo sobre corpus rusos, incluyendo documentos con OCR deficiente y formatos HTML o Markdown.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER2.5 (extractor de entidades; predicción directa de límites de span y clasificación contra etiquetas) |
| Parámetros totales | 287.355.159 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens por pasada |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ruso (ru); el dataset incluye ~6% de ejemplos en inglés, bielorruso, uzbeko, kazajo, kirguís, tayiko, armenio, georgiano y azerí |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de fastino/gliner2.5-multi-v1, un extractor GLiNER2.5. A diferencia de los enfoques clásicos de NER que clasifican cada token o que deslizan ventanas sobre todas las posibles combinaciones de inicio y fin, GLiNER2.5 predice directamente dónde empieza y dónde termina una entidad y después empareja el fragmento con cada etiqueta proporcionada. Esto implica que la longitud de la entidad no está limitada artificialmente: direcciones largas, datos bancarios y identificadores compuestos no se truncan, y el coste computacional no se degrada en documentos extensos. Con 4096 tokens de ventana, la mayoría de documentos se procesan enteros sin fragmentación.

El entrenamiento se realizó sobre un dataset completamente sintético de 4097 ejemplos, construido en varias fases: definición jurídica del alcance de los datos personales y de las reglas de anotación, generación y aumentación de documentos, y revisión manual posterior de una parte de los ejemplos. La cobertura temática incluye documentos personales, documentación laboral interna, materiales corporativos y administrativos, documentos legales y normativos, contratos, documentación comercial, financiera, contable y bancaria, documentos registrales y estatales, materiales médicos, sociales y educativos, documentación técnica y de producción, documentación sobre bienes inmuebles y vehículos, correspondencia profesional y de usuario, registros, directorios, formularios y tablas. Se incorporan variantes de OCR deficiente, HTML, Markdown y otros formatos. La distribución de entidades anotadas es: PERSON 7790, LOCATION 1918, DATE 4514, PHONE 1548, EMAIL 1004 y PII 22466. No se documenta en la información disponible el uso de RLHF, DPO ni detalles sobre el volumen total de tokens de entrenamiento.

La innovación práctica del modelo es la separación entre pesos y esquema de etiquetas: las etiquetas se suministran en la llamada de inferencia y el modelo las interpreta por su significado, permitiendo renombrarlas o añadir tipos nuevos sin reentrenar. El autor advierte que la calidad declarada solo está garantizada para las etiquetas documentadas.

## Capacidades

- Detección de entidades de tipo PERSON, LOCATION, DATE, PHONE y EMAIL en textos rusos.
- Detección de una clase agregada PII que cubre identificadores administrativos y burocráticos: pasaporte, documentos migratorios, SNILS, INN, números bancarios, médicos, judiciales, notariales, laborales, académicos, de propiedad, transporte, billetes, pedidos, cuentas, pases y códigos internos.
- Extracción con offsets de carácter (start/end) mediante include_spans, apta para anonimización o enmascarado posterior.
- Esquema de etiquetas configurable en inferencia: renombrado y adición de etiquetas sin reentrenamiento, con calidad garantizada solo para las etiquetas de la model card.
- Procesamiento de documentos completos de hasta 4096 tokens por pasada.
- Robustez ante OCR deficiente y formatos HTML y Markdown.
- Diferenciación por contexto entre datos de persona y datos de organización, sin depender únicamente de expresiones regulares.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Anonimización de expedientes legales y judiciales: el modelo localiza identificadores como números de caso, datos notariales y referencias judiciales dentro de documentos completos de hasta 4096 tokens, y devuelve offsets que permiten sustituir cada fragmento por una máscara antes de compartir el documento.
- Cumplimiento del 152-FZ en repositorios documentales: se puede ejecutar como paso previo a la indexación o al envío de documentos a sistemas externos, marcando pasaportes, SNILS, INN y datos bancarios que la normativa rusa considera datos personales.
- Procesamiento de documentación de recursos humanos: sobre contratos, expedientes y formularios internos, el modelo distingue datos del empleado de datos de la organización, lo que evita enmascarar información corporativa que no es PII y reduce el ruido en la anonimización.
- Enmascarado previo a pipelines de OCR: al tolerar variantes de OCR deficiente, puede colocarse después de la digitalización para detectar identificadores que las expresiones regulares no capturan por errores de reconocimiento o por formatos compuestos.
- Gestión de documentación médica y social: detección de números de historial, identificadores de prestaciones y datos de contacto en informes y formularios, con salida estructurada por clase para alimentar sistemas de seudonimización.
- Adaptación a esquemas internos de etiquetado: al recibir las etiquetas en la llamada, un equipo puede renombrarlas según su taxonomía corporativa o añadir tipos específicos sin reentrenar, aunque la calidad en etiquetas nuevas no está garantizada por el autor.
- Procesamiento de correspondencia y documentación financiera: extracción de cuentas, datos de pedidos y números de billetes en correos y extractos, con umbral de confianza ajustable para priorizar precisión o exhaustividad según el caso.

## Benchmarks y rendimiento

Validación sobre 405 documentos y 4134 entidades, con métricas estrictas (el span solo cuenta si los límites coinciden exactamente con la referencia):

| Clase | Entidades | Precision | Recall | F1 | Coverage |
|---|---:|---:|---:|---:|---:|
| PERSON | 789 | 93,28% | 91,51% | 92,39% | 92,52% |
| LOCATION | 249 | 88,94% | 74,30% | 80,96% | 78,31% |
| DATE | 562 | 89,64% | 75,44% | 81,93% | 78,11% |
| PHONE | 136 | 95,04% | 84,56% | 89,49% | 86,03% |
| EMAIL | 62 | 100,00% | 87,10% | 93,10% | 87,10% |
| PII | 2336 | 89,91% | 80,86% | 85,15% | 83,05% |
| **Total** | 4134 | 90,83% | 81,98% | 86,18% | 84,06% |

Sensibilidad al umbral de decisión (por defecto 0,5):

| Umbral | Precision | Recall | F1 | TP | FP | FN |
|---:|---:|---:|---:|---:|---:|---:|
| 0,02 | 0,834 | 0,838 | 0,836 | 3464 | 689 | 670 |
| 0,10 | 0,868 | 0,834 | 0,851 | 3447 | 522 | 687 |
| 0,30 | 0,897 | 0,828 | 0,861 | 3422 | 392 | 712 |
| **0,50** | **0,908** | **0,820** | **0,862** | **3389** | **342** | **745** |
| 0,70 | 0,917 | 0,810 | 0,860 | 3349 | 302 | 785 |
| 0,90 | 0,929 | 0,795 | 0,857 | 3286 | 252 | 848 |
| 0,99 | 0,947 | 0,707 | 0,809 | 2922 | 164 | 1212 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparativas numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: con 287,4 M de parámetros, los pesos en fp32 ocupan aproximadamente 1,15 GB, en fp16 unos 0,57 GB y en int8 unos 0,29 GB. A ello hay que sumar la memoria de activaciones y del tokenizador, que no está cuantificada en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre en fp16 debería bastar para inferencia; para procesar lotes grandes o documentos de 4096 tokens conviene una GPU de datacenter como A100 o H100, aunque no se publican cifras de latencia ni throughput.
- GPU de consumo: cabe con holgura en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, incluso en precisión completa.
- Despliegue: la librería oficial es gliner2 (AutoExtractor), instalable con pip install gliner2 y compatible con model.to("cuda"). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---:|---|---|---|
| metrika-labs/ru-pii-ner-gliner2.5 | GLiNER2.5 | 287,4 M | 4096 tokens | Apache 2.0 | PII en ruso con etiquetas configurables |
| metrika-labs/ru-pii-ner | ruRoberta-large | no disponible | no disponible | no disponible | PII en ruso con clases fijas |
| fastino/gliner2.5-multi-v1 | GLiNER2.5 | no disponible | no disponible | no disponible | Extractor multilingüe de entidades, modelo base |

El autor presenta ru-pii-ner (basado en ruRoberta-large) como la alternativa de su propio catálogo, orientada a la misma tarea pero con reconocimiento de tipos y límites de PII mediante una arquitectura distinta. No se dispone de datos de rendimiento de ese modelo ni del modelo base en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El dataset de entrenamiento es completamente sintético (4097 ejemplos); el rendimiento en documentos reales puede diferir del reportado en validación.
- El recall global es del 81,98% con el umbral por defecto, lo que implica que aproximadamente una de cada cinco entidades de referencia no se detecta; en clases como LOCATION y DATE el recall baja al 74-75%.
- La calidad declarada solo está garantizada para las seis etiquetas documentadas; el uso de etiquetas nuevas o renombradas no tiene garantía de rendimiento.
- El modelo está orientado al ruso; aunque el dataset incluye un ~6% de ejemplos en otras lenguas, no se declara soporte multilingüe general.
- Riesgo de falsos positivos en valores que se parecen a identificadores personales pero pertenecen a organizaciones o son datos de referencia; la política de anotación es conservadora y puede sobrerrepresentar PII en casos ambiguos.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a adversarios o texto manipulado.
- La licencia Apache 2.0 permite uso comercial, pero el cumplimiento normativo (por ejemplo, 152-FZ) es responsabilidad del integrador; el modelo es una ayuda técnica, no una garantía legal.
- No se documentan requisitos de latencia ni comportamiento en producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/metrika-labs/ru-pii-ner-gliner2.5
- Modelo alternativo del mismo autor: https://huggingface.co/metrika-labs/ru-pii-ner
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
