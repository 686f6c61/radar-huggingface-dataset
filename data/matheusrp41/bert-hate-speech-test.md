# matheusrp41/bert-hate-speech-test

## Resumen

El modelo `matheusrp41/bert-hate-speech-test` es un ajuste fino de `google-bert/bert-base-uncased` orientado a la clasificacion de texto para la deteccion de discurso de odio. Ha sido desarrollado por el usuario matheusrp41 y subido a HuggingFace con licencia Apache-2.0, lo que permite su uso comercial sin restricciones significativas. El modelo se genero mediante el flujo de entrenamiento estandar de la libreria Transformers, con un pipeline de text-classification.

Con 109.484.547 parametros, el modelo mantiene la arquitectura original de BERT-base, un transformer encoder de 12 capas con 768 dimensiones ocultas. La ventana de contexto es de 512 tokens, heredada del modelo base. Su relevancia radica en que ofrece un punto de partida para tareas de moderacion de contenido, aunque su rendimiento declarado (accuracy de 0,7193) sugiere que requiere validacion adicional antes de su uso en produccion.

La ficha tecnica del modelo es minima y no especifica el dataset de entrenamiento, lo que limita la reproducibilidad y la evaluacion de sesgos. A pesar de ello, el modelo puede servir como referencia para experimentos academicos o como base para ajustes posteriores con datos mas controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, 12 capas, 768 hidden) |
| Parametros totales | 109.484.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base entrenado en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT-base, un transformer encoder bidireccional de 12 capas con 12 cabezales de atencion, 768 dimensiones ocultas y 110 millones de parametros aproximados. El ajuste fino se realizo sobre un dataset no especificado en la model card, aunque la busqueda web sugiere que podria estar relacionado con el dataset `hate_speech_portuguese` (por similitud con otros modelos del mismo nombre), pero esto no se confirma en la informacion oficial.

El entrenamiento utilizo los siguientes hiperparametros: learning rate de 5e-05, batch size de 8, optimizador AdamW con betas (0,9; 0,999), scheduler lineal y 3 epocas. El proceso completo consto de 171 pasos. No se menciona el uso de tecnicas como RLHF o DPO, y el entrenamiento se limito a un ajuste supervisado clasico. La perdida final en validacion fue de 0,6291 con una accuracy de 0,7193.

## Capacidades

- Clasificacion de texto binaria o multiclase para deteccion de discurso de odio, segun el dataset de entrenamiento (no especificado).
- Generacion de embeddings contextuales de 768 dimensiones para representacion de frases.
- Inferencia de clasificacion con salida de probabilidades por clase.
- Capacidad multilingue limitada: el modelo base esta entrenado principalmente en ingles, aunque el dataset de ajuste podria ser portugues (segun pistas indirectas).
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento explicito ni capacidades multimodales.

## Casos de uso

- Moderacion de comentarios en redes sociales: el modelo puede clasificar comentarios de usuarios como odiosos o no odiosos, permitiendo a las plataformas filtrar contenido problematico de forma automatica. Su ventana de 512 tokens es suficiente para la mayoria de comentarios breves.
- Analisis de foros y comunidades online: integrable en pipelines de scraping para monitorizar la toxicidad en hilos de discusion, con alertas en tiempo real cuando se detecta discurso de odio.
- Filtrado de contenido en plataformas de noticias: los medios pueden usar el modelo para revisar comentarios antes de su publicacion, reduciendo la carga de moderadores humanos.
- Investigacion academica en NLP: util como baseline para estudios sobre deteccion de odio, comparando su rendimiento con modelos mas grandes o con tecnicas de data augmentation.
- Auditoria de contenido en archivos historicos: aplicable a datasets de texto antiguos para medir la evolucion del discurso de odio a lo largo del tiempo.
- Prototipado rapido de sistemas de moderacion: gracias a su tamano reducido, puede desplegarse en entornos de desarrollo para validar flujos de trabajo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| Loss | 0,6291 |
| Accuracy | 0,7193 |

La tabla de entrenamiento muestra la evolucion por epocas:

| Training Loss | Epoch | Step | Validation Loss | Accuracy |
|:-------------:|:-----:|:----:|:---------------:|:--------:|
| 0,6593 | 1.0 | 57 | 0,6316 | 0,6667 |
| 0,6008 | 2.0 | 114 | 0,6574 | 0,6667 |
| 0,4936 | 3.0 | 171 | 0,6291 | 0,7193 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El modelo-index de HuggingFace no incluye resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en FP32, reducible a unos 0,2 GB con cuantizacion INT8 (no confirmado por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3060 o superiores. Tambien puede ejecutarse en CPU con latencia aceptable para inferencia por lotes.
- Compatible con hardware de consumo: si, cabe en GPUs de gama media y baja.
- Opciones de despliegue: Hugging Face Inference Endpoints, vLLM, TGI, o mediante la libreria Transformers con PyTorch. Tambien es compatible con text-embeddings-inference segun los tags del repositorio.
- Latencia estimada: en CPU, aproximadamente 50-100 ms por secuencia de 128 tokens; en GPU, 5-15 ms. Throughput no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (hate speech) | Licencia |
|---|---|---|---|---|
| matheusrp41/bert-hate-speech-test | 109M | 512 | 0,7193 | Apache-2.0 |
| HateBERT (arxiv 2010.12472) | 110M | 512 | no disponible | MIT |
| wesleyfreit/bert-hate-speech-test | 109M | 512 | 0,5965 | Apache-2.0 |

HateBERT es un modelo de referencia en deteccion de abuso y odio, entrenado con datos de comunidades baneadas de Reddit. El modelo de wesleyfreit, con el mismo nombre, muestra una accuracy inferior (0,5965) y podria haber sido entrenado con el dataset `hate_speech_portuguese`. No se dispone de comparativas directas con modelos mas recientes como RoBERTa o DeBERTa en esta tarea especifica.

## Limitaciones y advertencias

- El dataset de entrenamiento no esta especificado, lo que impide evaluar sesgos demograficos o linguisticos.
- La accuracy de 0,7193 es moderada y probablemente insuficiente para produccion sin un umbral de confianza ajustado.
- El modelo base esta entrenado principalmente en ingles; su rendimiento en otros idiomas no esta garantizado.
- No se han realizado evaluaciones de robustez frente a ataques adversariales o texto ofensivo encubierto.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de exactitud ni soporte.
- El modelo podria presentar falsos positivos (texto no odioso clasificado como odioso) o falsos negativos, dependiendo del dominio de aplicacion.
- No se proporcionan pesos cuantizados ni versiones optimizadas para despliegue en edge.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/matheusrp41/bert-hate-speech-test
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Modelo similar (wesleyfreit): https://huggingface.co/wesleyfreit/bert-hate-speech-test
- Paper HateBERT: https://arxiv.org/abs/2010.12472
- Repositorio de deteccion de odio con BERT (referencia): https://github.com/JensBender/hate-speech-detection
