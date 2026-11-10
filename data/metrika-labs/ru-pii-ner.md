# metrika-labs/ru-pii-ner

## Resumen

ru-pii-ner es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de datos personales (PII) en documentos en ruso. Lo desarrolla metrika-labs y se distribuye como un adaptador LoRA sobre el modelo base ai-forever/ruRoberta-large, un transformer encoder de tipo RoBERTa entrenado específicamente para ruso. El modelo resuelve un problema concreto: la anonimización de documentos jurídicos, administrativos y corporativos en ruso, donde la mayor parte de los datos personales no son nombres o teléfonos evidentes, sino identificadores contextuales (números de pasaporte, SNILS, INN, datos bancarios, números de historiales médicos, referencias judiciales o notariales) que no se pueden capturar con expresiones regulares.

La propuesta diferencial frente a aproximaciones basadas en reglas es que el etiquetado se ha diseñado siguiendo el sentido jurídico del 152-FZ (ley rusa de protección de datos personales) y la práctica judicial rusa, con una anotación conservadora: ante la duda de a quién pertenece un dato, se marca como personal. Además, el corpus de entrenamiento incluye variantes de OCR deficiente, HTML y Markdown, lo que lo hace robusto en pipelines reales de digitalización documental.

El modelo se publica bajo licencia Apache 2.0, con un tamaño de repositorio de 0,0 GB (solo los pesos del adaptador), 128 descargas y sin likes en el momento de la consulta. Es relevante ahora porque la mayoría de los modelos NER multilingües genéricos no cubren la tipología de identificadores rusos ni la distinción entre datos de persona física y datos de organización, que es precisamente el núcleo del cumplimiento normativo en Rusia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre ai-forever/ruRoberta-large (transformer encoder tipo RoBERTa) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base ruRoberta-large no se detalla en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru); el dataset incluye ~6% de ejemplos en inglés, bielorruso, uzbeko, kazajo, kirguís, tayiko, armenio, georgiano y azerí |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Pipeline | token-classification |
| Clases de entidad | PERSON, LOCATION, DATE, PHONE, EMAIL y PII (clase genérica padre) |
| Librería | peft |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) acoplado a ai-forever/ruRoberta-large, un encoder transformer de la familia RoBERTa preentrenado en ruso. La cabeza de clasificación de tokens se entrena sobre las representaciones del modelo base, con una matriz de transiciones CRF expuesta al usuario mediante el parámetro `o_to_b_shift`, que permite ajustar el sesgo entre la etiqueta `O` (fuera de entidad) y `B` (inicio de entidad) por clase. Este control es poco habitual en modelos NER estándar y permite calibrar precisión/recall por tipo de entidad sin reentrenar.

El dataset de entrenamiento consta de 4 097 ejemplos completamente generados mediante un proceso en varias etapas: definición jurídica del conjunto de PII y de las reglas de anotación, generación y aumentación de documentos, y revisión manual de una parte de los ejemplos. Cubre documentos personales, documentación laboral interna, materiales corporativos y administrativos, documentos legales y normativos, contratos, documentación comercial, financiera, contable y bancaria, documentos estatales y registrales, materiales médicos, sociales y educativos, documentación técnica y de producción, documentos de propiedad y transporte, correspondencia empresarial y de usuario, registros, formularios y tablas. Incluye variantes con OCR deficiente, HTML, Markdown y otros formatos, y aproximadamente un 6% de ejemplos en otros idiomas. La distribución de entidades en entrenamiento es: PERSON 7 790, LOCATION 1 918, DATE 4 514, PHONE 1 548, EMAIL 1 004 y PII 22 466, sobre 3 103 ejemplos con al menos una entidad PII.

La innovación principal no es arquitectónica sino de diseño de la tarea: la anotación se basa en el contexto y en el significado jurídico, de modo que el modelo distingue datos de persona física de datos de organización, y deja intactos los valores de referencia o de servicio no vinculados a una persona. Esto reduce el sobremarcado que producen los enfoques de "tapar todo" y mejora la utilidad del texto anonimizado.

## Capacidades

- Reconocimiento de entidades nombradas en ruso con tipología específica de PII: PERSON, LOCATION, DATE, PHONE, EMAIL y una clase genérica PII que actúa como red de seguridad para identificadores sin categoría propia.
- Detección de identificadores contextuales que no se pueden expresar con expresiones regulares: datos de pasaporte y documentos migratorios, SNILS, INN y otros números estatales, datos bancarios, números médicos, judiciales, notariales, de personal y académicos, datos de propiedad y transporte, números de billetes y pedidos, cuentas, pases, códigos internos de sistemas.
- Distinción entre datos de persona física y datos de organización, con anotación conservadora ante ambigüedad.
- Robustez ante texto degradado: entrenado con variantes de OCR deficiente, HTML y Markdown.
- Procesamiento por lotes (`batch_size`) y filtrado por umbral de confianza (`min_score`).
- Ajuste de precisión/recall por clase mediante `o_to_b_shift` en la matriz de transiciones CRF.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo de etiquetado de tokens, no generativo).
- Capacidades multilingües: limitadas al ruso como idioma principal; presencia residual de otras lenguas en el corpus.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Anonimización de expedientes judiciales y documentos notariales: el modelo detecta referencias judiciales, datos notariales e identificadores de las partes que no aparecen como nombres propios, lo que permite publicar resoluciones con las PII enmascaradas sin destruir la estructura jurídica del texto.
- Cumplimiento del 152-FZ en pipelines de digitalización: integrado tras un motor de OCR, procesa lotes de documentos escaneados con calidad irregular (el entrenamiento incluye OCR deficiente) y marca pasaportes, SNILS, INN y datos bancarios antes de almacenar el texto.
- Despersonalización de historiales clínicos para investigación: identifica números de historia, datos de asegurado y referencias médicas además de nombres y fechas, lo que permite construir corpus clínicos utilizables sin exponer a los pacientes.
- Gestión de currículos y expedientes de personal: sobre documentación de RR. HH. en ruso, extrae y enmascara datos de contacto, identificadores fiscales y números de expediente interno antes de enviar los documentos a sistemas de selección o de terceros.
- Enmascaramiento previo a entrenamiento de modelos: como capa de preprocesado en la construcción de corpus rusos, elimina PII de correos, contratos y correspondencia antes de que el texto entre en un pipeline de entrenamiento o en un sistema RAG.
- Detección de fugas de datos en soporte y correspondencia: analiza tickets y correos de usuario en ruso para localizar identificadores personales que no deberían haberse compartido, con ajuste de sensibilidad por clase mediante `o_to_b_shift` para priorizar recall en PHONE o PII.
- Auditoría de contratos y documentación financiera: distingue datos de la persona física (firmante, beneficiario) de los datos de la organización, lo que permite anonimizar la parte personal de un contrato conservando la información mercantil necesaria para su análisis.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de validación de 457 ejemplos y 2 433 entidades únicas. La métrica Coverage mide la proporción de entidades de referencia completamente cubiertas por la predicción; el F1 estricto exige coincidencia exacta de límites.

| Clase | Entidades | Precision | Recall | F1 | Coverage |
|---|---:|---:|---:|---:|---:|
| PERSON | 830 | 92,10% | 92,65% | 92,37% | 96,99% |
| LOCATION | 258 | 78,65% | 81,40% | 80,00% | 93,41% |
| DATE | 580 | 88,51% | 90,34% | 89,42% | 95,00% |
| PHONE | 138 | 87,69% | 82,61% | 85,07% | 86,23% |
| EMAIL | 62 | 86,76% | 95,16% | 90,77% | 96,77% |
| PII | 2 433 | 84,34% | 85,86% | 85,09% | 93,51% |
| **Global** | **4 301** | **86,18%** | **87,54%** | **86,85%** | **94,19%** |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al ser un adaptador LoRA sobre ruRoberta-large (encoder de tamaño grande, no especificado), la huella corresponde prácticamente a la del modelo base en fp32 o fp16 más el adaptador, que es de tamaño reducido.
- GPU recomendadas: no disponible. Por la naturaleza del modelo (encoder, sin generación autorregresiva), es apto para GPUs de gama media y para CPU en cargas moderadas, pero no se han publicado mediciones.
- Cabe en GPU de consumo: previsiblemente sí, dado que se trata de un encoder con un adaptador LoRA, aunque no se dispone de cifras verificadas.
- Opciones de despliegue: la librería oficial `ru_pii_ner` (instalable vía `pip install "git+https://github.com/metrika-labs/ru-pii-ner.git"`), que expone `load()` y `predict()` con soporte de lotes, `min_score` y `o_to_b_shift`. Al ser un adaptador PEFT sobre un modelo de Hugging Face, es compatible con el ecosistema Transformers y PEFT; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Clases | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| metrika-labs/ru-pii-ner | ruRoberta-large | LoRA + CRF, token-classification | PERSON, LOCATION, DATE, PHONE, EMAIL, PII | no disponible | Apache 2.0 | Hugging Face, 128 descargas |
| metrika-labs/ru-pii-ner-gliner2.5 | GLiNER2.5 | zero-shot NER | tipos y límites de PII | no disponible | no disponible en la información | Hugging Face |
| ai-forever/ruRoberta-large | — | encoder preentrenado | no aplica (modelo base) | no disponible | no disponible en la información | Hugging Face |

La alternativa más directa es la variante GLiNER2.5 del mismo autor, que aborda la misma tarea con un enfoque zero-shot y permite definir tipos de entidad en tiempo de inferencia, a costa de un consumo de recursos mayor. No se dispone de datos de rendimiento de esa variante para comparar. Frente a modelos NER multilingües genéricos, la diferencia está en la tipología de identificadores rusos y en la distinción persona/organización, no en cifras de benchmarks comparables.

## Limitaciones y advertencias

- El modelo es solo una capa dentro de un sistema de anonimización: debe combinarse con expresiones regulares, diccionarios y reglas de negocio. Ni el modelo ni un pipeline totalmente automático garantizan detectar todos los datos sensibles.
- Está diseñado para PII de personas físicas; no detecta secretos comerciales ni otra información confidencial no vinculada a personas, que permanecerá visible si no se añaden reglas específicas.
- Sesgos conocidos: no documentados en la información disponible. El corpus es sintético y generado, lo que puede introducir una distribución distinta de la de documentos reales pese a la aumentación con OCR deficiente y formatos HTML/Markdown.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y de límites imprecisos, especialmente en LOCATION (F1 80,00%) y PHONE (coverage 86,23%, el valor más bajo de la tabla).
- Limitaciones de idioma: el modelo está orientado al ruso; el ~6% de ejemplos en otras lenguas no constituye una garantía de calidad multilingüe.
- Longitud de contexto no documentada: para documentos largos será necesario segmentar, con el riesgo de perder entidades que crucen fronteras de segmento.
- La clase PII es padre de PERSON, LOCATION, DATE, PHONE y EMAIL, por lo que un mismo fragmento puede recibir varias etiquetas; para anonimizar se recomienda usar la unión de todas las clases detectadas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base ruRoberta-large, cuyos términos no se detallan en la información disponible.
- El repositorio tiene 0,0 GB y 128 descargas: ecosistema pequeño, poca validación independiente y riesgo de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/metrika-labs/ru-pii-ner
- Variante GLiNER2.5: https://huggingface.co/metrika-labs/ru-pii-ner-gliner2.5
- Modelo base: https://huggingface.co/ai-forever/ruRoberta-large
- Repositorio del paquete de inferencia: https://github.com/metrika-labs/ru-pii-ner
