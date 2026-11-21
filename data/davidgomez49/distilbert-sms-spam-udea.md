# DavidGomez49/distilbert-sms-spam-udea

## Resumen

distilbert-sms-spam-udea es un modelo de clasificación de texto obtenido por fine-tuning de distilbert-base-uncased, la variante destilada de BERT desarrollada por Hugging Face. Lo publica el usuario DavidGomez49 y su propósito declarado es la detección de spam en mensajes SMS, presumiblemente en el marco de un trabajo académico vinculado a la Universidad de Antioquia (UDeA), aunque la model card no documenta explícitamente el dataset de entrenamiento ni el origen de los datos.

El modelo resuelve una tarea binaria de clasificación de secuencias (spam frente a mensaje legítimo) y su interés práctico reside en su reducido coste computacional: con 66,9 millones de parámetros y un repositorio de 0,8 GB, puede ejecutarse en CPU o en GPUs de gama baja con latencias muy bajas, lo que lo hace apto para filtrado en tiempo real en pasarelas SMS o sistemas de mensajería.

La relevancia actual es limitada pero concreta: se trata de un artefacto pequeño, con licencia Apache 2.0 y compatible con el pipeline de text-classification de Transformers, útil como componente de filtrado previo en arquitecturas mayores o como referencia para experimentos de clasificación de spam. No obstante, la documentación publicada es mínima y no se han publicado resultados de benchmarks más allá de las métricas de validación reportadas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base distilbert-base-uncased soporta 512 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato safetensors en fp32; admite cuantizacion dinamica a int8 mediante herramientas estandar de PyTorch) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base esta entrenado principalmente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de distilbert-base-uncased, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de BERT-base (12 capas, 110 millones de parámetros). DistilBERT conserva aproximadamente el 97 % del rendimiento de BERT en tareas de comprensión del lenguaje con un 40 % menos de parámetros y una velocidad de inferencia un 60 % superior, según los datos publicados por Hugging Face para el modelo base. La tarea añadida es una cabeza de clasificación de secuencias con dos etiquetas.

El entrenamiento se realizó con el Trainer de Hugging Face durante 3 épocas, con un learning rate de 1e-05, batch size de 16 en entrenamiento y 64 en evaluación, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y precisión mixta nativa (AMP). Se completaron 774 pasos en total. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo técnicas de alineación como RLHF o DPO; la model card indica explícitamente "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento.

## Capacidades

- Clasificación binaria de texto: distingue entre mensajes SMS de spam y mensajes legítimos.
- Salida de etiqueta y puntuación de confianza mediante el pipeline `text-classification` de Transformers.
- Compatible con Text Embeddings Inference (TEI) y con endpoints de Hugging Face, según los tags del repositorio.
- Inferencia en CPU viable por su tamaño reducido (66,9 M de parámetros).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües no documentadas; el modelo base está orientado al inglés.

## Casos de uso

- Filtrado de spam en pasarelas SMS: el modelo puede clasificar cada mensaje entrante en milisegundos y descartar aquellos con alta probabilidad de spam antes de reenviarlos al usuario o al sistema de gestión, gracias a su reducido tamaño y a su coste de inferencia mínimo en CPU.
- Moderación de mensajes en aplicaciones de mensajería: integrado como paso previo a un clasificador más costoso o a un LLM, reduce el volumen de texto que llega a etapas posteriores del pipeline.
- Enriquecimiento de datasets de investigación: sirve para etiquetar automáticamente grandes corpus de SMS y construir conjuntos de datos de spam con supervisión débil, dado su F1 de 0,96 en validación.
- Detección de phishing por SMS (smishing): como clasificador binario de primera línea en sistemas de seguridad móvil, marcando mensajes sospechosos para revisión humana.
- Prototipado rápido y pruebas de concepto: su licencia Apache 2.0 y su tamaño permiten desplegarlo en entornos con recursos limitados (contenedores pequeños, dispositivos edge) sin necesidad de GPU.
- Componente de ensemble en sistemas antifraude: combinado con reglas heurísticas o con modelos de mayor tamaño, aporta una señal adicional de bajo coste para la puntuación de riesgo de un mensaje.
- Docencia y experimentación con fine-tuning: al estar generado con el Trainer y documentar hiperparámetros completos, sirve como ejemplo reproducible de clasificación con DistilBERT en cursos de PLN.

## Benchmarks y rendimiento

El autor declara las siguientes métricas sobre el conjunto de evaluación (no se especifica el tamaño ni la composición de dicho conjunto):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,0486 |
| Accuracy | 0,9903 |
| Precision | 0,9836 |
| Recall | 0,9375 |
| F1 | 0,96 |

Evolución por época según la model card:

| Epoca | Paso | Validation loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| 1 | 258 | 0,0522 | 0,9884 | 0,9677 | 0,9375 | 0,9524 |
| 2 | 516 | 0,0471 | 0,9903 | 0,9836 | 0,9375 | 0,96 |
| 3 | 774 | 0,0486 | 0,9903 | 0,9836 | 0,9375 | 0,96 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni el model-index contiene resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB para los pesos (66,9 M de parámetros × 4 bytes), más overhead de activaciones y del tokenizador; en la práctica, menos de 1 GB en total.
- VRAM estimada en int8: en torno a 70 MB para los pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; funciona sin problemas en GTX 1650, RTX 3050, RTX 4090, A100 y H100, aunque el modelo está sobredimensionado para estas últimas.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU es viable para volúmenes moderados de mensajes.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (TEI, indicado en los tags), endpoints de Hugging Face, ONNX Runtime y TorchScript tras conversión; también es convertible a GGUF para llama.cpp aunque no se distribuye en ese formato.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por secuencia en CPU moderna y throughput de miles de secuencias por segundo en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distilbert-sms-spam-udea | 66,9 M | no disponible (base: 512 tokens) | Clasificacion spam SMS | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base generalista | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base generalista | Apache 2.0 | Hugging Face |
| Modelos de spam SMS especializados en HF | variable | variable | Clasificacion spam SMS | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos publicados para este modelo frente a alternativas de la misma categoría; la comparación se limita a parámetros, contexto y licencia. El modelo base distilbert-base-uncased ofrece un punto de referencia arquitectónico, pero no es directamente comparable en la tarea de clasificación de spam sin un fine-tuning equivalente.

## Limitaciones y advertencias

- Documentación mínima: la model card indica "More information needed" en descripción, usos previstos y datos de entrenamiento, por lo que se desconoce la procedencia, el tamaño y la composición del dataset.
- Riesgo de sobreajuste al dominio: al no documentarse el corpus, no puede garantizarse la generalización a otros idiomas, registros o tipos de mensajes distintos de los de entrenamiento.
- Métricas sin contexto: el recall de 0,9375 es inferior a la precisión de 0,9836, lo que sugiere que el modelo deja pasar aproximadamente un 6 % de los mensajes positivos; en producción conviene ajustar el umbral según el coste relativo de falsos negativos y falsos positivos.
- Sesgos desconocidos: no se han publicado análisis de sesgo; el modelo base distilbert-base-uncased está entrenado mayoritariamente con texto en inglés y puede heredar sesgos de ese corpus.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí de clasificaciones erróneas con alta confianza.
- Idiomas: no se documenta soporte multilingüe; el uso en castellano u otros idiomas no está validado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Fecha de creación futura respecto a la fecha habitual de consulta (2026-11-21), lo que puede indicar metadatos inconsistentes en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidGomez49/distilbert-sms-spam-udea
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT (Hugging Face): no disponible en la información proporcionada
- Paper de DistilBERT (Sanh et al., 2019): no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
