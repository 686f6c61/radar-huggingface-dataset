# fasfadsf324/bert-tiny-finetuned-ner

## Resumen

bert-tiny-finetuned-ner es un modelo de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido mediante fine-tuning de prajjwal1/bert-tiny sobre el dataset conll2003. Lo publica el usuario fasfadsf324 en Hugging Face y sigue el formato estándar de los modelos generados automáticamente con la librería Trainer de Transformers, como indica la etiqueta `generated_from_trainer`. Su propósito es etiquetar secuencias de texto con categorías de entidades (persona, organización, localización y miscelánea) propias de CoNLL-2003.

La relevancia del modelo reside en su tamaño extremadamente reducido: parte de la arquitectura BERT-tiny, un transformer encoder de solo 2 capas y 128 dimensiones ocultas, lo que lo convierte en un candidato para entornos con recursos muy limitados, inferencia en CPU o tareas de extracción de entidades de baja latencia. No obstante, el repositorio no incluye información sobre licencia, idiomas soportados ni detalles de la model card más allá de los hiperparámetros de entrenamiento y las métricas declaradas.

El modelo alcanza un F1 de 0,8177 en el conjunto de evaluación de CoNLL-2003 según los datos declarados por el autor (no verificados de forma independiente). Se trata de un artefacto de experimentación más que de un modelo listo para producción, dado que la model card está generada automáticamente y carece de secciones de descripción, usos previstos y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-tiny, 2 capas, 128 dimensiones ocultas) |
| Parametros totales | no disponible (BERT-tiny tiene aproximadamente 4,4 M de parámetros según el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT-tiny soporta hasta 512 tokens de forma nativa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (safetensors/bin según el repositorio de Transformers; no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de prajjwal1/bert-tiny, un transformer encoder de tipo BERT con 2 capas, 128 dimensiones ocultas y 2 cabezas de atención, diseñado originalmente como modelo compacto de referencia. Sobre esta base se añade una cabeza de clasificación de tokens para etiquetar entidades según el esquema de CoNLL-2003 (BIO con las clases PER, ORG, LOC y MISC).

El entrenamiento se realizó sobre el dataset conll2003 con los siguientes hiperparámetros declarados en la model card: learning rate de 2e-05, batch size de 16 tanto en entrenamiento como en evaluación, optimizador Adam con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 5 épocas y semilla 42. Se emplearon Transformers 4.10.0, PyTorch 1.9.0+cu102, Datasets 1.11.0 y Tokenizers 0.10.3. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo técnicas de ajuste adicionales como RLHF o DPO, algo esperable en este tipo de fine-tuning supervisado.

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas en texto en inglés (dataset CoNLL-2003).
- Etiquetado de entidades de tipo persona, organización, localización y miscelánea según el esquema BIO de CoNLL-2003.
- Inferencia muy ligera: al partir de BERT-tiny, puede ejecutarse en CPU con requisitos mínimos de memoria.
- No dispone de soporte documentado de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documentan capacidades multilingües; el entrenamiento se limita a CoNLL-2003, que es un corpus en inglés.
- No se documenta modo thinking ni ninguna capacidad especial adicional.

## Casos de uso

- Extracción de entidades en pipelines de procesamiento de lenguaje natural: el modelo puede integrarse como paso de NER en flujos de análisis de texto en inglés, etiquetando personas, organizaciones y localizaciones en documentos.
- Prototipado rápido y experimentación: al ser un modelo de ~4,4 M de parámetros, permite iterar en local sin GPU y validar arquitecturas o esquemas de etiquetado antes de escalar a modelos mayores.
- Inferencia en dispositivos con recursos limitados: su tamaño reducido lo hace viable en CPU, entornos embebidos o contenedores sin aceleración hardware, aunque con la precisión limitada que reflejan sus métricas.
- Enriquecimiento de bases de datos documentales: se puede usar para poblar índices de entidades a partir de corpus en inglés, como paso previo a búsqueda o vinculación de entidades.
- Filtrado y preprocesado en pipelines de datos: sirve para anonimizar o etiquetar nombres de personas y organizaciones en textos antes de su procesamiento posterior.
- Docencia y reproducción de experimentos: el repositorio documenta hiperparámetros y curva de entrenamiento, lo que facilita reproducir el fine-tuning como ejercicio académico o de validación de la librería Trainer.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluación de CoNLL-2003 (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Precision | 0,8083 |
| Recall | 0,8274 |
| F1 | 0,8177 |
| Accuracy | 0,9598 |
| Loss | 0,1689 |

Evolución por época según la model card:

| Epoca | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|
| 1 | 0,1692 | 0,8072 | 0,8248 | 0,8159 | 0,9594 |
| 2 | 0,1678 | 0,8101 | 0,8277 | 0,8188 | 0,9600 |
| 3 | 0,1697 | 0,8103 | 0,8269 | 0,8186 | 0,9599 |
| 4 | 0,1694 | 0,8106 | 0,8263 | 0,8183 | 0,9600 |
| 5 | 0,1689 | 0,8083 | 0,8274 | 0,8177 | 0,9598 |

No se han publicado en la información disponible resultados comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño del modelo base (aproximadamente 4,4 M de parámetros); en la práctica puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se requiere GPU; cualquier GPU consumer (por ejemplo, GTX 1050, RTX 2060 o superiores) es más que suficiente.
- Cabe en cualquier GPU consumer y en la mayoría de entornos de CPU.
- Opciones de despliegue: Transformers con PyTorch (framework declarado en el repositorio); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que en general no están orientados a modelos encoder de clasificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia muy baja en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo orientativo estructural:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-tiny-finetuned-ner | ~4,4 M (BERT-tiny) | no disponible | NER (CoNLL-2003) | no disponible | Hugging Face |
| prajjwal1/bert-tiny (base) | ~4,4 M | 512 tokens | Modelo base | Apache 2.0 (según repositorio original) | Hugging Face |
| bert-base-NER (dslim) | ~110 M | 512 tokens | NER (CoNLL-2003) | no verificada en esta ficha | Hugging Face |

Los datos de rendimiento de las alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Model card generada automáticamente: las secciones de descripción, usos previstos y limitaciones están sin completar ("More information needed").
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no declarados: el entrenamiento se realizó sobre CoNLL-2003, corpus en inglés, por lo que el rendimiento en otros idiomas es incierto.
- Métricas no verificadas: los resultados de benchmarks los declara el autor y no han sido validados de forma independiente.
- Riesgo de alucinación y errores de etiquetado: como todo modelo de NER, puede producir falsos positivos y falsos negativos, especialmente en entidades ambiguas o dominios distintos al de entrenamiento.
- Sesgos potenciales: no documentados; al entrenarse sobre CoNLL-2003, puede heredar los sesgos de dominio y anotación de dicho corpus (texto periodístico en inglés).
- Contexto limitado: aunque no se declara explícitamente, BERT-tiny está limitado a 512 tokens, lo que restringe el procesamiento de documentos largos sin fragmentación.
- Uso en producción no recomendado sin evaluación previa: el repositorio tiene 0 descargas y 0 likes, y carece de documentación de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fasfadsf324/bert-tiny-finetuned-ner
- Modelo base: https://huggingface.co/prajjwal1/bert-tiny
- Dataset CoNLL-2003: https://huggingface.co/datasets/conll2003
