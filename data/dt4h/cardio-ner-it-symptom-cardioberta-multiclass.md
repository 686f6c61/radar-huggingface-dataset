# DT4H/cardio-ner-it-symptom-cardioberta-multiclass

## Resumen

El modelo `cardio-ner-it-symptom-cardioberta-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de síntomas en textos clínicos de cardiología en italiano. Desarrollado por el consorcio DataTools4Heart (DT4H), este modelo es un ajuste fino (finetune) de `CardioBERTa.it`, un modelo BERT preentrenado específicamente para el dominio clínico italiano. Su función principal es identificar y clasificar spans de texto que corresponden a síntomas, utilizando un esquema de etiquetado IOB (Inside-Outside-Beginning) y una única clase de entidad: `SYMPTOM`.

El modelo se ha entrenado mediante validación cruzada de 10 pliegues sobre la parte italiana del corpus CardioCCC (DataTools4Heart Cardiology Clinical Case Corpus), con 508 documentos clínicos. El checkpoint publicado corresponde a la media aritmética de los 10 modelos resultantes, una técnica de promediado de pesos que suele mejorar la robustez. Con 109 millones de parámetros, se trata de un modelo de tamaño medio, adecuado para tareas de extracción de información en entornos clínicos donde la precisión es crítica. Su relevancia actual radica en la creciente necesidad de automatizar el análisis de historiales médicos y notas clínicas, especialmente en el ámbito cardiovascular, donde la detección temprana de síntomas es fundamental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base) |
| Parametros totales | 109.339.395 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Italiano |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), concretamente en el modelo preentrenado `CardioBERTa.it`, que a su vez es una adaptación de BERT para el dominio biomédico y clínico en italiano. La arquitectura es un transformer encoder con atención bidireccional, típicamente con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, aunque estos detalles no se especifican explícitamente en la documentación disponible. El modelo se ha ajustado para la tarea de clasificación de spans (span classification) mediante etiquetado IOB, donde cada token se clasifica como `B-SYMPTOM`, `I-SYMPTOM` u `O` (fuera de entidad).

El entrenamiento se realizó sobre la parte italiana del corpus CardioCCC, concretamente los lotes 1 y 2, con 508 documentos clínicos validados. Se empleó una estrategia de validación cruzada de 10 pliegues, y el checkpoint final es la media aritmética de los 10 modelos por pliegue, una técnica de promediado de pesos que suele mejorar la generalización. No se proporcionan detalles sobre hiperparámetros, número de épocas o función de pérdida, pero al ser un finetune de un modelo BERT preentrenado, se asume un ajuste estándar con una capa de clasificación sobre la salida del token.

## Capacidades

- Detección de síntomas en texto clínico de cardiología en italiano, identificando spans de texto que representan manifestaciones clínicas (por ejemplo, "dolore toracico", "dispnea", "palpitazioni").
- Clasificación de tokens con etiquetas IOB para delimitar el inicio y la continuación de cada entidad.
- Soporte para textos largos mediante el uso de una ventana deslizante (stride) en la inferencia, como se indica en la documentación.
- Integración sencilla con la librería `transformers` de Hugging Face mediante el pipeline de `token-classification`.
- Capacidad multilingüe limitada: solo italiano, aunque existen variantes del mismo modelo para inglés y checo dentro del proyecto DT4H.
- No incluye capacidades de generación de texto, tool calling, razonamiento multi-paso ni otras funcionalidades más allá de la extracción de entidades.

## Casos de uso

- **Extracción de síntomas de informes de alta hospitalaria**: el modelo puede procesar automáticamente informes de pacientes cardiológicos para extraer los síntomas mencionados, facilitando la creación de bases de datos estructuradas para investigación clínica.
- **Análisis de historiales clínicos electrónicos**: integrado en sistemas de gestión hospitalaria, permite indexar y buscar pacientes por síntomas, mejorando la accesibilidad a la información para el personal médico.
- **Apoyo a la codificación clínica**: los síntomas detectados pueden servir como entrada para sistemas de codificación automática (p. ej., CIE-10), reduciendo el trabajo manual de los codificadores.
- **Monitorización de ensayos clínicos**: en estudios cardiovasculares, el modelo puede ayudar a identificar criterios de inclusión o exclusión basados en síntomas presentes en las notas de los pacientes.
- **Investigación en epidemiología**: al extraer síntomas de grandes volúmenes de texto clínico, se pueden analizar patrones de presentación de enfermedades cardiovasculares en poblaciones italianas.
- **Sistemas de alerta temprana**: en entornos de telemedicina, el modelo puede procesar mensajes de pacientes y alertar sobre la presencia de síntomas relevantes que requieran atención médica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una validación cruzada de 10 pliegues sobre el corpus CardioCCC, pero no se proporcionan métricas cuantitativas como precisión, recall o F1. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo BERT base con 109M parámetros, en FP32 ocupa aproximadamente 440 MB de memoria. En FP16 se reduce a ~220 MB, y en int8 a ~110 MB. Esto permite su ejecución en GPUs con 2 GB de VRAM o incluso en CPU con suficiente RAM.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente, como NVIDIA GTX 1650, RTX 2060, o superiores. Para despliegues en producción, una T4 o V100 es más que adecuada.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo como la RTX 3060, RTX 4060, etc., sin problemas.
- **Opciones de despliegue**: al ser un modelo de Hugging Face, se puede servir con `transformers` pipeline, o mediante servidores de inferencia como vLLM, TGI o Triton. También es posible exportarlo a ONNX o TensorRT para optimización.
- **Latencia y throughput**: no se dispone de datos medidos, pero para un BERT base, la inferencia en GPU suele ser del orden de milisegundos por frase (típicamente <10 ms en una T4 para secuencias cortas). En CPU, la latencia puede ser de 50-200 ms por frase.

## Comparativa con modelos similares

El proyecto DT4H ha publicado modelos equivalentes para otros idiomas, lo que permite una comparación directa en cuanto a arquitectura y tarea, aunque no se dispone de métricas de rendimiento.

| Modelo | Idioma | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cardio-ner-it-symptom-cardioberta-multiclass` | Italiano | 109M | no disponible | MIT | Hugging Face |
| `en-symptom-cardioberta-multiclass-ner` | Inglés | no disponible | no disponible | MIT | Hugging Face |
| `cardio-ner-cs-symptom-cardioberta-multiclass` | Checo | no disponible | no disponible | MIT | Hugging Face |

No se han encontrado otros modelos específicos para detección de síntomas en cardiología en italiano fuera del ecosistema DT4H. Modelos genéricos de NER biomédico como `BioBERT` o `MedNER` podrían adaptarse, pero no están especializados en el dominio cardiológico ni en italiano.

## Limitaciones y advertencias

- **Sesgo del corpus**: el modelo se ha entrenado exclusivamente con documentos clínicos de cardiología del corpus CardioCCC, por lo que puede no generalizar bien a otros dominios médicos o a estilos de redacción diferentes.
- **Idioma limitado**: solo soporta italiano; no es aplicable a otros idiomas sin reentrenamiento.
- **Clase única**: solo detecta la entidad `SYMPTOM`; no cubre otros tipos de entidades clínicas como medicamentos, procedimientos o diagnósticos.
- **Riesgo de alucinación**: como todo modelo de NER, puede producir falsos positivos o negativos, especialmente en textos ambiguos o con jerga no estándar.
- **Longitud de contexto**: al ser un BERT base, la longitud máxima de secuencia suele ser de 512 tokens. Para textos más largos se requiere usar ventanas deslizantes, lo que puede perder contexto global.
- **Uso en producción**: aunque la licencia MIT permite uso comercial, es recomendable validar el rendimiento en el dominio específico antes de desplegarlo en entornos clínicos reales, dado que no se han publicado métricas de evaluación.
- **Dependencia de `trust_remote_code`**: el modelo requiere la opción `trust_remote_code=True` en el pipeline de Hugging Face, lo que implica ejecutar código personalizado del autor; se debe revisar la seguridad de dicho código antes de usarlo en entornos sensibles.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DT4H/cardio-ner-it-symptom-cardioberta-multiclass)
- [Repositorio CardioNER en GitHub](https://github.com/DataTools4Heart/CardioNER)
- [Proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- [Organización DT4H en Hugging Face](https://huggingface.co/DT4H)
- [Modelo equivalente en inglés](https://huggingface.co/DT4H/en-symptom-cardioberta-multiclass-ner)
- [Modelo equivalente en checo](https://huggingface.co/DT4H/cardio-ner-cs-symptom-cardioberta-multiclass)
