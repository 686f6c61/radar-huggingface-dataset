# DT4H/cardio-ner-sv-cardioberta-multilabel

## Resumen

El modelo `DT4H/cardio-ner-sv-cardioberta-multilabel` es un sistema de reconocimiento de entidades nombradas (NER) de ámbito clínico especializado en cardiología, desarrollado por el proyecto europeo DataTools4Heart (DT4H). Está entrenado para detectar y clasificar entidades relacionadas con enfermedades, medicación, procedimientos y síntomas en textos médicos en sueco. Se basa en una arquitectura RoBERTa adaptada al dominio cardiológico (CardioBERTa) y se distribuye como un modelo de clasificación de tokens con etiquetado multilabel.

El modelo forma parte de una colección más amplia de modelos NER multilingües del proyecto DT4H, que cubre varios idiomas europeos (inglés, español, italiano, rumano, checo, sueco, entre otros) con el objetivo de estandarizar la estructuración de informes de cardiología en diferentes regiones de Europa. Su relevancia actual radica en la necesidad de extraer información estructurada de documentos clínicos no estructurados para facilitar la investigación, la interoperabilidad de datos y la medicina de precisión.

Con 124 millones de parámetros, es un modelo de tamaño medio que puede desplegarse en hardware moderado. La versión publicada corresponde al resultado de aplicar SLERP (mezcla de modelos) sobre los 10 pliegues del entrenamiento, lo que suele mejorar la robustez y la generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (CardioBERTa) |
| Parametros totales | 124.107.273 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16) |
| Idiomas soportados | sueco (sv) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer de RoBERTa, una variante de BERT optimizada con un entrenamiento más extenso y sin la tarea de predicción de siguiente oración. En este caso, la capa de salida se sustituye por un clasificador de tokens que asigna a cada token una o varias etiquetas entre las categorías clínicas objetivo (enfermedad, medicación, procedimiento, síntoma), lo que permite el etiquetado multilabel a nivel de token.

No se han publicado detalles específicos sobre el volumen de datos de entrenamiento, la composición del corpus ni el uso de técnicas de alineación como RLHF o DPO. El autor indica que esta versión es el resultado de aplicar SLERP (mezcla lineal de pesos) sobre los 10 pliegues del entrenamiento, una técnica que combina los pesos de varios modelos entrenados con diferentes particiones de datos para obtener un modelo final más estable y preciso. El entrenamiento se realizó con PyTorch y el modelo se adaptó al dominio cardiológico mediante un proceso de adaptación lingüística (posiblemente con CardioBERTa, un modelo de dominio específico).

## Capacidades

- Reconocimiento de entidades nombradas en textos clínicos de cardiología en sueco, con etiquetas para enfermedad, medicación, procedimiento y síntoma.
- Clasificación multilabel a nivel de token: un token puede pertenecer a varias categorías simultáneamente.
- Extracción de información estructurada a partir de informes médicos no estructurados, historias clínicas y notas de evolución.
- Procesamiento de texto clínico en sueco, adaptado al vocabulario y las expresiones propias del ámbito cardiológico.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Estructuración de informes de cardiología: el modelo puede procesar informes de alta, notas de consulta o resúmenes de procedimientos para extraer automáticamente las entidades clínicas relevantes, facilitando su almacenamiento en bases de datos estructuradas.
- Anonimización de documentos clínicos: al identificar menciones de enfermedades, medicamentos y procedimientos, el modelo puede ayudar a localizar información sensible para su posterior enmascaramiento o eliminación, cumpliendo con normativas de protección de datos.
- Codificación clínica automática: las entidades extraídas pueden mapearse a códigos estandarizados (p. ej., CIE-10, SNOMED CT) para facturación, registros de salud o investigación epidemiológica.
- Soporte a la investigación clínica: permite construir cohortes de pacientes a partir de criterios basados en diagnósticos, tratamientos o procedimientos mencionados en texto libre, acelerando estudios observacionales.
- Interoperabilidad entre sistemas sanitarios: al normalizar la información de informes en sueco, el modelo contribuye a la armonización de datos clínicos en el marco del proyecto DT4H, que busca integrar datos de diferentes países europeos.
- Asistencia a la revisión manual de historias clínicas: el modelo puede pre-etiquetar documentos para que los profesionales sanitarios validen o corrijan las anotaciones, reduciendo el tiempo de revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, latencia o throughput.
- Dado el tamaño del modelo (124M parámetros), se estima que puede ejecutarse en GPUs de consumo como NVIDIA RTX 3060 o superiores, aunque no hay confirmación oficial.
- El repositorio solo contiene pesos en safetensors, por lo que es necesario convertir el modelo a formatos como GGUF o ONNX para su despliegue en entornos optimizados (llama.cpp, Ollama, etc.).
- Opciones de despliegue habituales para modelos de este tipo: Hugging Face Transformers, PyTorch, ONNX Runtime, o servidores de inferencia como vLLM (si se convierte a un formato compatible).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (NER clínico cardiológico en sueco) dentro de los datos proporcionados. El proyecto DT4H publica otros modelos NER para distintos idiomas (p. ej., checo, multilingüe con XLM-RoBERTa), pero no se han facilitado métricas comparativas entre ellos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en sueco, por lo que no es aplicable a otros idiomas sin un proceso de adaptación o entrenamiento adicional.
- La licencia GPL-3.0 impone restricciones para su uso comercial: cualquier obra derivada debe distribuirse bajo la misma licencia, lo que puede ser un obstáculo para integraciones en productos propietarios.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en textos clínicos, puede reflejar sesgos presentes en los datos originales (p. ej., infrarrepresentación de ciertas poblaciones).
- Como todo modelo de lenguaje, puede producir falsos positivos o negativos en la detección de entidades, especialmente con terminología ambigua o contextos poco frecuentes.
- La ventana de contexto no está especificada; si es limitada (típica de RoBERTa, 512 tokens), los documentos largos deberán segmentarse, lo que puede afectar a la coherencia de las entidades a lo largo del texto.
- No se proporcionan instrucciones claras sobre cómo manejar la salida multilabel en la práctica (p. ej., umbrales de decisión), por lo que el usuario debe definir su propia estrategia de postprocesado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-sv-cardioberta-multilabel
- Colección CardioNER en Hugging Face: https://huggingface.co/collections/DT4H/cardioner
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Repositorio GitHub del proyecto: https://github.com/DataTools4Heart/
- Repositorio de código NER multilingüe (nlp4bia-bsc): https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER
