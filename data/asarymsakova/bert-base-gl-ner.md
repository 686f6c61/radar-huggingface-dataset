# asarymsakova/bert-base-gl-ner

## Resumen

El modelo `asarymsakova/bert-base-gl-ner` es un sistema de reconocimiento de entidades nombradas (NER) para gallego, desarrollado por Albina Sarymsakova y Marcos Garcia (Universidade de Santiago de Compostela). Se trata de un fine-tuning de `marcosgg/bert-base-gl-cased`, un BERT base entrenado específicamente para gallego, adaptado a la tarea de clasificación de tokens con esquema de etiquetado BIO. El modelo reconoce cuatro tipos de entidades: personas (PER), localizaciones (LOC), organizaciones (ORG) y miscelánea (MISC).

La relevancia de este modelo radica en que cubre una lengua minoritaria con recursos limitados, ofreciendo un punto de partida sólido para tareas de extracción de información en gallego. Con 177 millones de parámetros y una ventana de contexto de 512 tokens, es un modelo compacto que puede ejecutarse en hardware de consumo. Su licencia AGPL-3.0 permite uso comercial siempre que se cumplan las condiciones de copyleft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BertForTokenClassification (BERT base, 12 capas, hidden size 768, 12 cabezas de atencion) |
| Parametros totales | 177.269.769 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | Gallego (gl) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura BERT base original, con 12 capas transformer, 12 cabezas de atencion y una dimension oculta de 768. La capa de clasificacion es una cabeza lineal sobre la representacion de cada token, entrenada con el esquema BIO (9 etiquetas: B-PER, I-PER, B-LOC, I-LOC, B-ORG, I-ORG, B-MISC, I-MISC, O). El modelo base `marcosgg/bert-base-gl-cased` fue preentrenado con texto en gallego con distincion de mayusculas/minusculas.

El fine-tuning se realizo sobre un conjunto de datos que combina cinco recursos NER para gallego: SLI NERC, TreeGal, PUD, CorNER y LREC. Los datos estan disponibles en formato JSON Lines con listas paralelas de tokens y etiquetas. Los hiperparametros de entrenamiento incluyen una tasa de aprendizaje de 4e-05, batch de entrenamiento de 64, batch de evaluacion de 16, 5 epocas, optimizador Adam (betas 0.9/0.999, epsilon 1e-08) y scheduler lineal. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado clasico.

## Capacidades

- Reconocimiento de entidades nombradas en gallego: personas, localizaciones, organizaciones y entidades miscelaneas.
- Clasificacion de tokens con esquema BIO, compatible con el pipeline `token-classification` de Hugging Face Transformers.
- Soporte de agregacion de entidades mediante `aggregation_strategy="simple"` para obtener entidades completas en lugar de tokens sueltos.
- Procesamiento de texto con distincion de mayusculas (cased), lo que ayuda a identificar nombres propios.
- Integracion sencilla con la libreria Transformers mediante `AutoModelForTokenClassification` y `AutoTokenizer`.
- Capacidad multilingue limitada: el modelo esta especializado exclusivamente en gallego, aunque el tokenizador BERT base puede manejar caracteres de otras lenguas romanicas.

## Casos de uso

- **Extraccion de entidades en documentos administrativos gallegos**: el modelo puede procesar textos legales o burocraticos en gallego para extraer nombres de personas, lugares y organizaciones, facilitando la indexacion y busqueda en archivos digitales.
- **Analisis de noticias y articulos periodisticos**: permite identificar protagonistas, ubicaciones y organizaciones en corpus de prensa gallega, util para estudios de medios o sistemas de recomendacion de contenido.
- **Construccion de grafos de conocimiento para el gallego**: al extraer entidades de textos, se pueden alimentar bases de datos semanticas o sistemas de pregunta-respuesta especificos para esta lengua.
- **Procesamiento de redes sociales y foros en gallego**: el modelo puede etiquetar menciones a personas, lugares y organizaciones en textos informales, aunque su rendimiento puede verse afectado por la variabilidad ortografica.
- **Anotacion automatica de corpus linguisticos**: investigadores en linguistica computacional pueden usar el modelo para pre-anotar grandes volumenes de texto en gallego, reduciendo el esfuerzo manual de anotacion.
- **Sistemas de atencion al cliente en gallego**: integrado en un chatbot o sistema de tickets, puede extraer automaticamente el nombre del cliente, la ubicacion o el producto mencionado para enrutar la consulta al departamento adecuado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados con seqeval a nivel de entidad (esquema BIO):

| Conjunto de test | F1 (%) | Precision (%) | Recall (%) |
|:----------------|:------:|:-------------:|:----------:|
| SLI NERC test   | 88.81  | 87.76         | 89.89      |
| TreeGal test    | 86.38  | 86.03         | 86.73      |
| PUD             | 83.82  | 83.45         | 84.19      |
| CorNER          | 91.51  | 91.46         | 91.56      |
| LREC            | 84.60  | 83.29         | 85.96      |
| **Mixto (concatenacion de todos)** | **86.30** | - | - |
| **Promedio de los cinco** | **87.03** | - | - |

Ademas, en el conjunto de desarrollo SLI NERC se reportan F1 90.46, precision 90.67, recall 90.25 y accuracy 98.97. En el test, la accuracy global es 99.15.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 177M de parametros en precision FP32, el modelo ocupa aproximadamente 0.7 GB en memoria. En FP16, alrededor de 0.35 GB. La inferencia con batch de 1 y secuencias de hasta 512 tokens puede ejecutarse con menos de 2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores funcionan sin problemas. Tambien es viable en CPU para inferencia por lotes pequenos.
- **Compatibilidad con GPU de consumo**: si, cabe en practicamente cualquier GPU moderna de consumo, incluidas las integradas de gama alta.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, ONNX Runtime, TorchServe, y puede exportarse a formato ONNX para optimizacion. No se han publicado archivos GGUF ni integraciones con llama.cpp u Ollama, pero al ser un modelo BERT estandar, puede convertirse con herramientas como `optimum` o `transformers`.
- **Latencia y throughput estimados**: en una GPU RTX 3060, la inferencia de una frase de 50 tokens tarda unos 10-20 ms. En CPU (8 nucleos modernos), unos 100-200 ms por frase. El throughput depende del batch; con batch de 32 en GPU se pueden procesar cientos de frases por segundo.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos NER especificos para gallego con los que comparar directamente. Como referencia, el modelo base `marcosgg/bert-base-gl-cased` no tiene resultados NER publicados. En el ambito de NER para otras lenguas, `dslim/bert-base-NER` (ingles, fine-tuning de bert-base-cased sobre CoNLL-2003) es un modelo comparable en tamano y arquitectura, pero no es multilingue y no cubre gallego. No se ha encontrado ningun otro modelo NER para gallego en Hugging Face con benchmarks publicados, por lo que la comparativa directa no esta disponible.

## Limitaciones y advertencias

- **Sesgos del modelo**: al ser un fine-tuning de un BERT preentrenado, puede heredar sesgos de genero, etnia o procedencia presentes en los datos de preentrenamiento. No se han realizado evaluaciones especificas de sesgo para gallego.
- **Riesgo de alucinacion**: en tareas de NER, el modelo puede etiquetar incorrectamente tokens ambiguos o fuera de vocabulario. La precision en los test sets ronda el 87-91%, por lo que existe un margen de error no despreciable.
- **Limitaciones de contexto**: la ventana de 512 tokens impide procesar documentos largos de una sola vez; es necesario segmentar el texto, lo que puede perder contexto entre segmentos.
- **Idioma**: el modelo solo esta entrenado para gallego. No debe usarse para otros idiomas, aunque comparta similitudes con portugues o espanol.
- **Restricciones de licencia**: la licencia AGPL-3.0 implica que cualquier servicio que ofrezca este modelo a traves de una red debe publicar el codigo fuente completo bajo la misma licencia. Esto puede ser un obstaculo para uso comercial propietario.
- **Caveat de produccion**: los resultados de los benchmarks se basan en conjuntos de test especificos (SLI, TreeGal, PUD, CorNER, LREC) que pueden no representar la diversidad real del gallego hablado o escrito en contextos no academicos. Se recomienda evaluar el modelo en el dominio de aplicacion antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asarymsakova/bert-base-gl-ner
- Modelo base: https://huggingface.co/marcosgg/bert-base-gl-cased
- Recursos NER para gallego (GitHub): https://github.com/albinasarymsakova/Named-Entity-Recognition-Resources-for-Galician
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
