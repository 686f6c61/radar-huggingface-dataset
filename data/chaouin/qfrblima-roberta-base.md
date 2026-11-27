# chaouin/qfrblima-roberta-base

## Resumen

QFrBLiMa — RoBERTa-base es un clasificador supervisado de texto para distinguir entre frances metropolitano (MFr) y frances de Quebec (QFr). Lo desarrolla el autor chaouin como parte del proyecto QFrBLiMa, un benchmark contrastivo de marcadores linguisticos regionales. El modelo parte de FacebookAI/roberta-base y se ha afinado para una tarea binaria de clasificacion de variantes regionales con fines de investigacion.

El modelo resuelve un problema concreto: la identificacion automatica de marcadores lexicos y morfosintacticos que diferencian el frances de Quebec del frances metropolitano. Es relevante porque los sistemas de PLN entrenados predominantemente con frances metropolitano rinden peor en variedades regionales, y este tipo de clasificador permite cuantificar y analizar esa variacion de forma sistematica.

Con 124,6 millones de parametros, arquitectura RoBERTa-base (transformer encoder) y una longitud de secuencia de entrenamiento de 128 tokens, el modelo es ligero y desplegable en hardware modesto. Se distribuye bajo licencia MIT y esta disenado explicitamente para investigacion linguistica, no para inferir la identidad u origen de personas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base, afinado para clasificacion de secuencias) |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | Frances (fr), con foco en frances metropolitano y frances de Quebec |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un RoBERTa-base (transformer encoder con atencion bidireccional) al que se le ha anadido una cabeza de clasificacion de secuencias con dos clases: clase 0 para frances metropolitano (etiqueta heredada `FI`) y clase 1 para frances de Quebec (etiqueta heredada `FQ`). El afinado se realizo sobre un corpus supervisado separado de 938.484 ejemplos (751.288 de entrenamiento, 93.768 de validacion y 93.428 de test), balanceado por variedad dentro de cada uno de seis generos y de cada particion.

El entrenamiento uso tres epocas, tamano de lote efectivo de 32, tasa de aprendizaje de 2e-5, longitud maxima de secuencia de 128 y semilla 42. El checkpoint de la epoca 3 se selecciono por macro-F1 de validacion. El benchmark QFrBLiMa se uso exclusivamente para evaluacion externa, no para el afinado ni para la seleccion del checkpoint. El corpus supervisado y sus particiones no se redistribuyen publicamente, siguiendo a Khan et al. (2026); la documentacion de procedencia esta disponible en el repositorio de GitHub del proyecto.

## Capacidades

- Clasificacion binaria de texto en frances metropolitano frente a frances de Quebec, con puntuaciones softmax por clase.
- Evaluacion contrastiva por pares: dado un par de frases (una MFr y una QFr), el modelo asigna una puntuacion de clase 1 a cada una y se considera correcto si la frase QFr obtiene una puntuacion estrictamente mayor.
- Deteccion de marcadores linguisticos regionales en contextos controlados (el benchmark cubre 241 marcadores con cinco contextos por marcador).
- Procesamiento de textos cortos (hasta 128 tokens), adecuado para frases y parrafos breves.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un clasificador, no un modelo generativo.
- Capacidad multilingue limitada al frances; no se documenta soporte para otras lenguas.

## Casos de uso

- Investigacion en linguistica de corpus: cuantificar la presencia de marcadores quebequenses en un corpus de textos franceses y comparar distribuciones entre generos o registros, usando las puntuaciones de clase 1 como senal de variacion regional.
- Evaluacion de sistemas de PLN por variedad: medir si un modelo generativo o un traductor produce frances metropolitano o de Quebec en pares controlados, empleando el clasificador como juez contrastivo.
- Filtrado y anotacion de datasets: etiquetar automaticamente muestras de texto frances como MFr o QFr para construir o equilibrar corpus de entrenamiento por variedad regional.
- Analisis de adaptacion de contenido: detectar si un texto localizado para el mercado quebequense conserva marcadores regionales o ha sido neutralizado hacia el frances metropolitano.
- Estudios de variacion lexica: comparar pares de terminos (por ejemplo, "puzzle" frente a "casse-tete") y verificar si el modelo capta la preferencia regional documentada.
- Docencia y divulgacion: demostrar de forma interactiva como un transformer encoder detecta diferencias regionales en frases cortas, con un coste computacional minimo.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| Macro-F1 en test interno | 96,36 % |
| Precision por frase en QFrBLiMa | 54,27 % |
| Macro-F1 por frase en QFrBLiMa | 53,68 % |
| Precision estricta por pares en QFrBLiMa | 59,67 % |
| Precision estricta por pares (IC 95 %) | 54,94 %–64,32 % |

La evaluacion externa cubre 1.205 pares contrastivos, 241 marcadores y cinco contextos por marcador. La clasificacion por frase usa un umbral de 0,5. El intervalo de confianza se basa en 20.000 replicas bootstrap agrupadas por marcador linguistico. Las predicciones completas y los analisis estan disponibles en el repositorio de GitHub del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (124,6 M de parametros); en torno a 0,25 GB en fp16 y menos de 0,15 GB en cuantizacion de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son mas que suficientes y quedan limitadas por el ancho de banda mas que por la memoria.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU con latencias aceptables para lotes pequenos.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (el modelo declara compatibilidad con endpoints), ONNX Runtime y despliegue en CPU con cuantizacion dinamica.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU para lotes de secuencias de 128 tokens, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| QFrBLiMa — RoBERTa-base | 124,6 M | 128 tokens | Clasificacion MFr/QFr | MIT | Hugging Face |
| RoBERTa-base (FacebookAI) | 125 M | 512 tokens | Modelo base generico | MIT | Hugging Face |
| Otros clasificadores del benchmark QFrBLiMa | no disponible | no disponible | Clasificacion MFr/QFr | no disponible | GitHub del proyecto |

El autor indica que este modelo es uno de cinco clasificadores evaluados en QFrBLiMa, pero no se detallan en la informacion disponible los nombres, tamanos ni resultados de los otros cuatro. Tampoco se han publicado comparaciones con clasificadores regionales de terceros.

## Limitaciones y advertencias

- El modelo esta destinado a investigacion sobre reconocimiento linguistico regional, no a inferir el origen o la identidad de una persona.
- Las etiquetas de entrenamiento basadas en la fuente son proxies imperfectos del uso linguistico real; ninguna variedad implica un uso geografico exclusivo.
- Las puntuaciones softmax no estan calibradas; el umbral de 0,5 es una convencion de evaluacion, no una probabilidad calibrada.
- La precision estricta por pares en el benchmark externo (59,67 %) es modesta pese al alto macro-F1 interno (96,36 %): un buen rendimiento en test interno no garantiza generalizacion a otros dominios ni reconocimiento contrastivo.
- El contexto esta limitado a 128 tokens, insuficiente para documentos largos sin troceado previo.
- Solo se documenta soporte para frances; no se ha evaluado su comportamiento en otras lenguas o variedades.
- El corpus supervisado no se redistribuye y no se ha verificado la reconstruccion exacta del mismo, lo que dificulta la reproducibilidad completa del entrenamiento.
- Licencia MIT: permite uso comercial, pero el uso responsable excluye aplicaciones de perfilado o inferencia de identidad.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos y negativos en la clasificacion de variedades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaouin/qfrblima-roberta-base
- Dataset QFrBLiMa: https://huggingface.co/datasets/chaouin/qfrblima
- Repositorio GitHub del proyecto: https://github.com/chaouin/QFrBLiMa
- Resultados de evaluacion de encoders: https://github.com/chaouin/QFrBLiMa/tree/main/results/encoders
- Documentacion del corpus de entrenamiento: https://github.com/chaouin/QFrBLiMa/tree/main/data/training_corpus
- Modelo base RoBERTa: https://huggingface.co/FacebookAI/roberta-base
- Referencia Khan et al. (2026): https://aclanthology.org/2026.lrec-1.840/
