# chaouin/qfrblima-bert-base-cased

## Resumen

QFrBLiMa — BERT-base-cased es un clasificador supervisado de variedades regionales del frances, desarrollado por el autor chaouin (GitHub: chaouin/QFrBLiMa). Se trata de un fine-tuning de google-bert/bert-base-cased para distinguir entre frances metropolitano (MFr) y frances de Quebec (QFr). El modelo forma parte de un conjunto de cinco clasificadores evaluados sobre QFrBLiMa, un benchmark contrastivo de marcadores linguisticos regionales. Su proposito es exclusivamente de investigacion sobre reconocimiento linguistico regional, no la inferencia de origen o identidad de personas.

Arquitectura transformer encoder tipo BERT-base con 108.311.810 parametros totales, pesos en safetensors y un repositorio de 0,4 GB. La longitud de contexto efectiva en entrenamiento es de 128 tokens, aunque la arquitectura BERT subyacente soporta hasta 512. La licencia es Apache 2.0, heredada del modelo base. El modelo tiene un uso muy especializado y un rendimiento externo modesto: 53,78 % de accuracy a nivel de frase sobre QFrBLiMa, lo que refleja la dificultad del benchmark contrastivo.

Es relevante ahora porque aborda un problema poco cubierto: la discriminacion automatica de variantes regionales del frances con un benchmark publico y evaluacion contrastiva por pares. No obstante, sus cifras de generalizacion externa son bajas y el corpus de entrenamiento no se redistribuye, lo que limita la reproducibilidad completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base-cased) |
| Parametros totales | 108.311.810 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens en entrenamiento; 512 tokens en la arquitectura base |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | frances (fr), con foco en frances metropolitano y frances de Quebec |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT-base-cased (transformer encoder bidireccional) con una cabeza de clasificacion de secuencias de dos clases (0 = MFr, 1 = QFr). El fine-tuning se realizo sobre un corpus supervisado separado de 938.484 ejemplos, dividido en 751.288 de entrenamiento, 93.768 de validacion y 93.428 de test, balanceado por variedad dentro de cada uno de seis generos y en cada particion. Se entrenaron tres epocas con tamano de batch efectivo de 32, learning rate de 2e-5, longitud maxima de secuencia de 128 y semilla 42. El checkpoint de la epoca 3 se selecciono por macro-F1 de validacion.

El benchmark QFrBLiMa se uso exclusivamente para evaluacion externa, no para fine-tuning ni seleccion de checkpoint. El corpus supervisado y sus particiones no se redistribuyen publicamente, siguiendo a Khan et al. (2026); la documentacion de procedencia esta en el repositorio de GitHub. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa; es un fine-tuning supervisado clasico.

## Capacidades

- Clasificacion binaria de texto: asigna una puntuacion de clase 0 (frances metropolitano) y clase 1 (frances de Quebec) a una frase.
- Evaluacion contrastiva por pares: permite comparar dos frases y determinar cual recibe mayor puntuacion QFr.
- Procesamiento de frases cortas: ventana de 128 tokens en el entrenamiento, adecuada para marcadores linguisticos y oraciones breves.
- Soporte de tokenizer rapido (use_fast=True) y de AutoModelForSequenceClassification de transformers.
- Compatibilidad con text-embeddings-inference y endpoints compatibles segun los tags del repositorio.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento multi-paso; es un clasificador puro.
- Capacidad multilingue limitada al frances (metropolitano y quebeques).

## Casos de uso

- Investigacion linguistica sobre variacion regional: el modelo permite cuantificar la senal de marcadores regionales en corpus de frances, comparando puntuaciones MFr frente a QFr en pares controlados.
- Evaluacion de benchmarks contrastivos: sirve como uno de los cinco clasificadores de referencia en QFrBLiMa para medir la capacidad de modelos encoder de reconocer marcadores regionales.
- Filtrado y anotacion asistida de corpus: puede pre-etiquetar frases como candidatas a MFr o QFr para revision humana, siempre con umbral de 0,5 y validacion posterior.
- Analisis de traduccion y localizacion: util para detectar si un texto localizado para Quebec conserva marcadores de frances metropolitano, con las cautelas de calibracion indicadas por el autor.
- Estudios de sesgo y procedencia de datos: permite analizar como las etiquetas basadas en fuente (proxies imperfectos) afectan a la clasificacion de variedades.
- Docencia y experimentacion con transformers: ejemplo reproducible de fine-tuning de BERT-base para clasificacion binaria con evaluacion contrastiva y bootstrap por marcador linguistico.
- Comparacion de arquitecturas encoder: base para contrastar BERT-base-cased con otros encoders sobre la misma tarea y benchmark.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| Macro-F1 en test interno | 95,45 % |
| Accuracy a nivel de frase en QFrBLiMa | 53,78 % |
| Macro-F1 a nivel de frase en QFrBLiMa | 52,44 % |
| Accuracy estricta por pares en QFrBLiMa | 58,01 % |
| Accuracy estricta por pares (IC 95 %) | 52,78 %–63,07 % |

La evaluacion externa cubre 1.205 pares contrastivos, 241 marcadores y cinco contextos por marcador. La clasificacion a nivel de frase usa umbral de 0,5. El intervalo de confianza se basa en 20.000 replicas bootstrap agrupadas por marcador linguistico. No se proporcionan resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (108 M de parametros); aproximadamente 0,5 GB en fp16 y menos de 0,3 GB en int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4090, T4, A100 o H100 funcionan sin problema, aunque el modelo esta muy sobredimensionado para estas GPU.
- Cabe en GPU consumer: si, en practicamente todas, incluidas GTX 1650 o inferiores con al menos 2 GB de VRAM.
- Tambien ejecutable en CPU con latencias de milisegundos por frase corta.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference, endpoints compatibles, ONNX Runtime y llama.cpp no aplica (no es un modelo generativo GGUF).
- Latencia y throughput: no disponibles de forma oficial; por tamano, se espera throughput de miles de frases por segundo en GPU y cientos en CPU, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chaouin/qfrblima-bert-base-cased | 108,3 M | 128 (entrenamiento) | Clasificacion MFr/QFr | Apache 2.0 | Hugging Face |
| google-bert/bert-base-cased | 108,3 M | 512 | Modelo base enmascarado | Apache 2.0 | Hugging Face |
| chaouin/qfrblima (otros cuatro clasificadores) | no disponible | no disponible | Clasificacion MFr/QFr | no disponible | Hugging Face (dataset y repo) |

No se dispone de resultados de benchmarks de los otros clasificadores del conjunto QFrBLiMa en la informacion proporcionada, por lo que la comparacion de rendimiento entre ellos no esta disponible.

## Limitaciones y advertencias

- El modelo esta destinado a investigacion sobre reconocimiento linguistico regional, no a inferir el origen o la identidad de personas.
- Las etiquetas de entrenamiento basadas en fuente son proxies imperfectos del uso linguistico; ninguna variedad implica un uso geografico exclusivo.
- Las puntuaciones softmax no estan calibradas; el umbral de 0,5 es una convencion de evaluacion, no una probabilidad calibrada.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y negativos en la clasificacion, con accuracy externa cercana al azar (53,78 %).
- Las altas puntuaciones internas (95,45 % macro-F1) no garantizan reconocimiento contrastivo ni generalizacion a otros dominios.
- El corpus supervisado no se redistribuye y la reconstruccion exacta no ha sido verificada, lo que limita la reproducibilidad.
- El modelo solo cubre frances; no soporta otros idiomas ni tareas generativas.
- La licencia Apache 2.0 permite uso comercial, pero el uso previsto por el autor es de investigacion y el modelo no es adecuado para decisiones sobre personas.
- Ventana de 128 tokens en entrenamiento: frases mas largas requieren truncamiento y pueden degradar la clasificacion.

## Enlaces

- Hugging Face: https://huggingface.co/chaouin/qfrblima-bert-base-cased
- Dataset QFrBLiMa: https://huggingface.co/datasets/chaouin/qfrblima
- Repositorio GitHub: https://github.com/chaouin/QFrBLiMa
- Resultados de encoders: https://github.com/chaouin/QFrBLiMa/tree/main/results/encoders
- Documentacion del corpus: https://github.com/chaouin/QFrBLiMa/tree/main/data/training_corpus
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Paper de referencia (Khan et al., 2026): https://aclanthology.org/2026.lrec-1.840/
