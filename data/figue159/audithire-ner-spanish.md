# figue159/audithire-ner-spanish

## Resumen

audithire-ner-spanish es un modelo de reconocimiento de entidades nombradas (NER) para castellano, publicado por el usuario figue159 en Hugging Face. Se trata de un fine-tuning de dccuchile/bert-base-spanish-wwm-cased, el BERT base entrenado con whole word masking sobre un corpus masivo de castellano por el equipo de DCC UChile. El modelo se distribuye con la pipeline token-classification de transformers y pesos en safetensors.

El modelo resuelve la tarea de etiquetado de secuencias token a token, es decir, la identificacion de entidades (personas, organizaciones, lugares, etc.) en texto en castellano. Su nombre sugiere un uso orientado a procesos de auditoria y contratacion ("audithire"), aunque la model card no documenta el esquema de etiquetas ni el dataset de entrenamiento empleado.

Es relevante por dos motivos: primero, porque parte de un backbone BERT en castellano bien establecido y de tamano contenido (109,3 millones de parametros), lo que permite desplegarlo en hardware modesto; segundo, porque los resultados declarados por el autor (F1 de 1,0) deben interpretarse con cautela, ya que la model card no especifica el conjunto de evaluacion y el modelo tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, whole word masking, cased) |
| Parametros totales | 109.267.209 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el backbone BERT base admite 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantizacion no documentada) |
| Idiomas soportados | castellano (inferido del modelo base y del nombre; no declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT base: 12 capas, atencion multi-cabeza bidireccional y una cabeza de clasificacion token a token para NER. El backbone dccuchile/bert-base-spanish-wwm-cased fue preentrenado con whole word masking y texto en minúsculas y mayúsculas sobre un corpus en castellano; el fine-tuning anade la cabeza de etiquetado sobre ese encoder.

El entrenamiento se realizo con el Trainer de transformers durante 3 epocas, con learning rate 3e-05, batch de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW fused (betas 0,9 y 0,999, epsilon 1e-08) y scheduler lineal. El numero total de pasos fue de 90, lo que implica un conjunto de entrenamiento muy pequeno (aproximadamente 480 ejemplos con batch 16 y 3 epocas). La model card no documenta el dataset, el esquema de etiquetas ni si hubo aumento de datos. Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Etiquetado de secuencias token a token para reconocimiento de entidades nombradas en castellano (la taxonomia concreta de entidades no esta documentada).
- Clasificacion contextual bidireccional gracias al encoder BERT, adecuada para desambiguar entidades segun el contexto de la frase.
- Procesamiento de texto en mayusculas y minusculas (backbone cased).
- No soporta generacion de texto, tool calling, function calling ni razonamiento multi-paso: es un modelo discriminativo de clasificacion.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue no declarada; el backbone esta especializado en castellano.

## Casos de uso

- Extraccion de entidades en documentos de auditoria: el modelo puede etiquetar nombres de personas, empresas y organismos en informes y contratos, siempre que se valide antes el esquema de etiquetas real del checkpoint.
- Enriquecimiento de curriculos y solicitudes de empleo: dado el nombre "audithire", encaja en la deteccion de nombres, titulaciones y organizaciones en CV para pipelines de seleccion, con revision humana obligatoria.
- Anonimizacion y pseudonimizacion de textos: al detectar entidades se pueden enmascarar datos personales antes de almacenar o compartir documentos, util para cumplimiento de proteccion de datos.
- Indexacion semantica de corpus legales o administrativos: extraer entidades para construir indices y facilitar busquedas sobre nombres de partes, juzgados o localidades.
- Preprocesado para sistemas de extraccion de relaciones: las entidades detectadas sirven como entrada a modulos posteriores de relation extraction en pipelines NLP.
- Clasificacion de tickets y correos de soporte: detectar productos, empresas o localidades mencionadas para enrutar incidencias, con la ventaja de que un BERT base cabe en una sola GPU consumer.
- Prototipado rapido de NER en castellano: al ser un checkpoint pequeno (0,4 GB), permite experimentar en local con transformers y comparar contra otros modelos antes de invertir en uno mayor.

## Benchmarks y rendimiento

La model card declara resultados sobre un conjunto de evaluacion no identificado. Se reproducen tal cual:

| Metrica | Valor declarado |
|---|---|
| Loss (validacion, epoca 3) | 0,0018 |
| Precision | 1,0 |
| Recall | 1,0 |
| F1 | 1,0 |

Evolucion por epoca segun la model card:

| Epoca | Step | Training loss | Validation loss | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| 1,0 | 30 | 0,0721 | 0,0165 | 1,0 | 1,0 | 1,0 |
| 2,0 | 60 | 0,0062 | 0,0023 | 1,0 | 1,0 | 1,0 |
| 3,0 | 90 | 0,0039 | 0,0018 | 1,0 | 1,0 | 1,0 |

El model-index del repositorio no contiene resultados adicionales (lista vacia). No hay benchmarks publicados sobre conjuntos estandar como CoNLL-2002, CoNLL-2003 ni AnCora, por lo que no es posible comparar de forma fiable con otros modelos NER en castellano.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB para los pesos, mas el overhead de activaciones; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16: alrededor de 0,25 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU para lotes pequenos.
- Cabe en GPU consumer: si, con margen amplio, incluidas GPUs de gama baja y portatiles.
- Opciones de despliegue: transformers con pipeline token-classification, TGI (Text Generation Inference no aplica a clasificacion), ONNX Runtime, y exportacion a GGUF mediante llama.cpp no esta documentada para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audithire-ner-spanish | 109,3 M | no disponible | NER castellano | no disponible | Hugging Face, 0 descargas |
| dccuchile/bert-base-spanish-wwm-cased | 109,3 M | 512 | backbone preentrenado | no disponible en esta ficha | Hugging Face, ampliamente usado |
| Modelos NER castellano de referencia (p. ej. fine-tunes sobre BETO o RoBERTa-BNE) | variable | 512 | NER castellano | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos publicados para audithire-ner-spanish, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Los resultados de F1 de 1,0 son sospechosamente perfectos y no van acompanados de la identificacion del conjunto de evaluacion; es probable que procedan de un split muy pequeno o poco representativo. No deben tomarse como indicador de rendimiento en produccion.
- El conjunto de entrenamiento parece muy reducido (unos 90 pasos totales), lo que incrementa el riesgo de sobreajuste y de baja generalizacion a dominios distintos.
- La model card no documenta el esquema de etiquetas, el dataset ni los idiomas; el uso en produccion exige inspeccionar el config y validar con datos propios.
- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido.
- Riesgo de sesgos heredados del corpus de preentrenamiento del backbone y del dataset de fine-tuning, no evaluado por el autor.
- Riesgo de alucinacion de entidades en textos fuera de dominio, comun en modelos NER con entrenamiento escaso.
- No apto para generacion de texto, razonamiento ni tareas de agente.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/figue159/audithire-ner-spanish
- Modelo base: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
