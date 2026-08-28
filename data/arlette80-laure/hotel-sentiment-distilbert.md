# arlette80-laure/hotel-sentiment-distilbert

## Resumen

El modelo `arlette80-laure/hotel-sentiment-distilbert` es un clasificador de sentimiento binario (positivo/negativo) especializado en reseñas de hoteles. Fue desarrollado por el usuario arlette80-laure como proyecto educativo de fine-tuning con Hugging Face, partiendo del modelo base `distilbert-base-uncased`. Su objetivo es demostrar el flujo completo de adaptación de un transformer preentrenado a una tarea específica de clasificación de texto, utilizando un conjunto de datos personalizado de pequeñas dimensiones.

La relevancia de este modelo es principalmente didáctica: ilustra cómo transformar un modelo genérico de lenguaje en un clasificador de dominio específico con relativamente pocos recursos. Al estar basado en DistilBERT, hereda su arquitectura de transformer encoder con 66 millones de parámetros y una longitud de contexto de 512 tokens. No obstante, el autor advierte explícitamente que no debe considerarse listo para producción debido al tamaño reducido de su dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, base-uncased) |
| Parametros totales | 66 millones (aprox., heredados de distilbert-base-uncased) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se indica compatibilidad con transformers) |
| Idiomas soportados | ingles (entrenado principalmente con ejemplos en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (segun estandar de Hugging Face) |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una version destilada de BERT que conserva el 97% de su rendimiento en GLUE con un 40% menos de parametros y una velocidad de inferencia un 60% superior. La arquitectura es un transformer encoder de 6 capas, 12 cabezas de atencion y dimension oculta de 768. Al ser la variante "uncased", el texto se normaliza a minusculas antes de la tokenizacion.

El entrenamiento consistio en un fine-tuning supervisado sobre un dataset personalizado de reseñas de hoteles en ingles. La model card indica que se trata de un dataset "muy pequeno" de caracter educativo, con ejemplos como "The room was clean and comfortable" (positivo) o "The room was dirty and the service was terrible" (negativo). Se utilizo el Trainer de Hugging Face con PyTorch, pero no se especifican hiperparametros, numero exacto de ejemplos, ni la proporcion de datos de validacion. No se menciona el uso de tecnicas como RLHF o DPO.

## Capacidades

- Clasificacion binaria de sentimiento: asigna etiquetas `POSITIVE` o `NEGATIVE` a reseñas de hoteles en ingles.
- Analisis de texto corto: adecuado para reseñas de una o dos frases, dado su contexto maximo de 512 tokens.
- Integracion sencilla con Hugging Face Transformers mediante el pipeline `text-classification`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada: entrenado principalmente con ejemplos en ingles, aunque el tokenizador de DistilBERT puede procesar otras lenguas con menor precision.

## Casos de uso

- Demostracion educativa de fine-tuning: el caso principal es servir como ejemplo practico en cursos o tutoriales de Hugging Face para ensenar el flujo completo de adaptacion de un modelo preentrenado.
- Prototipado rapido de analisis de sentimiento: permite validar la viabilidad de un clasificador de reseñas hoteleras antes de invertir en un dataset mas grande.
- Clasificacion de comentarios en plataformas de reservas: puede aplicarse a un conjunto pequeno de reseñas para obtener una primera aproximacion de la satisfaccion del cliente, aunque con resultados limitados.
- Monitorizacion de feedback en establecimientos pequenos: hoteles o hostales que quieran categorizar manualmente sus comentarios con ayuda de una herramienta automatica basica.
- Practica de evaluacion de modelos: util para comparar el rendimiento de DistilBERT frente a BERT o RoBERTa en tareas de clasificacion de dominio especifico.
- Base para experimentos de mejora: sirve como punto de partida para anadir mas datos, ajustar hiperparametros o ampliar a mas idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion como accuracy, precision, recall o F1. Se desconoce el rendimiento del modelo en conjuntos de datos estandar como GLUE o en datasets de sentimiento como SST-2.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en precision FP32 (DistilBERT base requiere aproximadamente 260 MB de memoria para los pesos). Con cuantizacion INT8, se reduce a unos 130 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060 o superior). Tambien puede ejecutarse en CPU sin problemas para inferencia por lotes pequenos.
- Si cabe en consumer GPU: si, en todas las GPU modernas de consumo, incluidas las integradas de Intel o AMD con suficiente RAM.
- Opciones de despliegue: compatible con Hug Face Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama (mediante importacion), y TGI.
- Latencia y throughput estimados: en CPU moderna, latencia de ~10-30 ms por muestra; en GPU (p. ej., T4), ~2-5 ms por muestra. Throughput de cientos de muestras por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arlette80-laure/hotel-sentiment-distilbert | 66M | 512 | Sentimiento binario en reseñas hoteleras | MIT | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | 66M | 512 | Sentimiento binario (SST-2) | Apache-2.0 | Hugging Face |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125M | 512 | Sentimiento ternario (positivo/negativo/neutro) | MIT | Hugging Face |

El modelo de arlette80-laure se diferencia por estar especializado en el dominio hotelero, pero carece de la validacion en benchmarks que tienen los otros dos. El modelo de cardiffnlp ofrece tres clases y un entrenamiento mas robusto, mientras que el de SST-2 es un referente clasico para sentimiento general.

## Limitaciones y advertencias

- No es apto para produccion: el autor lo declara explicitamente como proyecto educativo con un dataset muy pequeno.
- Rendimiento pobre en reseñas complejas o ambiguas: puede fallar con sarcasmo, ironia o sentimientos mixtos.
- Sesgo de dominio: entrenado solo con ejemplos de hoteles en ingles; puede generalizar mal a otros sectores (restaurantes, transporte, etc.).
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede asignar etiquetas incorrectas con alta confianza.
- Limitacion de idioma: solo se garantiza un comportamiento razonable en ingles; otros idiomas pueden dar resultados poco fiables.
- Sin metricas de evaluacion: no se proporcionan datos de accuracy ni F1, por lo que es imposible cuantificar su calidad real.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo no ofrece garantias de rendimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/arlette80-laure/hotel-sentiment-distilbert)
- [Documentacion de DistilBERT en Hugging Face](https://huggingface.co/docs/transformers/model_doc/distilbert)
- [Modelo base distilbert-base-uncased](https://huggingface.co/distilbert/distilbert-base-uncased)
- [Notebook de clasificacion de sentimiento con DistilBERT (Colab)](https://colab.research.google.com/github/pranaya-mathur/Deep-Learning-Projects/blob/master/Sentiment_Classification_using_DistilBERT.ipynb/)
