# neeraj-mO/bert-emotion-finetuned

## Resumen

El modelo `neeraj-mO/bert-emotion-finetuned` es un clasificador de emociones en seis clases (sadness, joy, love, anger, fear y surprise) obtenido mediante fine-tuning de `bert-base-uncased` sobre el conjunto de datos `dair-ai/emotion`, compuesto por tuits en inglés anotados con etiquetas emocionales. El autor es Neeraj Gupta y se publica bajo licencia Apache 2.0. El modelo resuelve el problema de la detección de emociones en texto corto, una tarea de clasificación de texto con aplicaciones en monitorización de redes sociales, análisis de opinión de clientes y sistemas de respuesta automática.

Partiendo de un BERT-base de 109 millones de parámetros, alcanza una precisión del 91,75 % y un F1 ponderado del 91,64 % en el split de validación, un resultado sólido para una tarea de seis clases. La arquitectura es la de un transformer encoder con 12 capas, 12 cabezas de atención y dimensión oculta de 768, con una ventana de contexto de 512 tokens. El modelo se distribuye en formato safetensors y es compatible con la librería Transformers y con Text Embeddings Inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base-uncased (transformer encoder, 12 capas, 12 cabezas, hidden 768) |
| Parametros totales | 109.486.854 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (cuantizable a int8 o int4 con herramientas externas) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT-base, un transformer encoder bidireccional preentrenado sobre BookCorpus y Wikipedia en inglés con los objetivos de masked language modeling y next sentence prediction. Sobre la representación del token `[CLS]` se añade una cabeza de clasificación lineal con seis salidas, una por emoción. El fine-tuning se realizó sobre el conjunto `dair-ai/emotion`, que contiene tuits en inglés etiquetados con seis emociones.

Los hiperparámetros de entrenamiento fueron: 2 épocas, tasa de aprendizaje de 2e-4, tamaño de lote de 64, weight decay de 0,01 y optimizador AdamW. La división de datos fue estratificada: 70 % entrenamiento, 20 % test y 10 % validación. No se menciona el uso de técnicas de alineación como RLHF o DPO, ya que se trata de una tarea de clasificación supervisada estándar.

## Capacidades

- Clasificación de texto en seis emociones: sadness, joy, love, anger, fear y surprise.
- Detección de emociones en texto corto en inglés, especialmente tuits y mensajes breves.
- Salida probabilística por clase mediante softmax, utilizable para establecer umbrales de confianza.
- Compatible con la API `pipeline` de Transformers para inferencia inmediata.
- Sin soporte para tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente discriminativo de clasificación.
- Sin capacidades multimodales: solo procesa texto.

## Casos de uso

- Monitorización de redes sociales: el modelo puede clasificar el tono emocional de tuits o publicaciones en inglés en tiempo real, lo que permite a equipos de community management detectar picos de ira o miedo ante un incidente de marca.
- Análisis de feedback de clientes: integrado en un pipeline de procesamiento de encuestas o reseñas, clasifica las emociones predominantes y permite priorizar respuestas ante clientes frustrados o asustados.
- Moderación de contenido: combinado con reglas de negocio, ayuda a identificar contenido con carga emocional negativa (ira o miedo) para su revisión manual.
- Sistemas de respuesta automática en atención al cliente: un chatbot puede usar la etiqueta emocional para adaptar el tono de su respuesta, mostrando empatía cuando detecta tristeza o miedo.
- Investigación de mercado: análisis de conversaciones en foros o redes sociales para medir la reacción emocional ante el lanzamiento de un producto.
- Investigación en UX: clasificación de comentarios de usuarios en pruebas de usabilidad para identificar frustración o sorpresa ante determinadas interacciones.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (validación) | 91,75 % |
| Weighted F1 (validación) | 91,64 % |

Estos resultados se obtuvieron sobre el split de validación del conjunto `dair-ai/emotion` tras el entrenamiento. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 440 MB en fp32 (109 millones de parámetros por 4 bytes). Con cuantización int8 se reduce a unos 110 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; modelos como NVIDIA T4, GTX 1660 o RTX 3060 funcionan sin problema.
- Compatible con CPU: al ser un modelo pequeño, la inferencia en CPU es viable con latencias de decenas de milisegundos por ejemplo.
- Opciones de despliegue: Transformers pipeline, vLLM, Text Embeddings Inference (segun los tags del repositorio), llama.cpp u Ollama con conversión previa a GGUF.
- Latencia estimada: en GPU moderna, la inferencia de un solo ejemplo suele estar por debajo de 10 ms; en CPU, entre 50 y 200 ms dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy | Licencia |
|---|---|---|---|---|
| neeraj-mO/bert-emotion-finetuned | 109 M | 512 | 91,75 % | Apache 2.0 |
| boltuix/bert-emotion | no disponible | no disponible | no disponible | Apache 2.0 |
| bert-base-uncased (sin fine-tuning) | 109 M | 512 | no aplica | Apache 2.0 |

El modelo `boltuix/bert-emotion` es otra versión fine-tuned de BERT para clasificación de emociones, también bajo licencia Apache 2.0, pero no se dispone de datos de rendimiento publicados. El modelo base `bert-base-uncased` no está entrenado para clasificación de emociones y requiere fine-tuning o cabezas adicionales para esta tarea.

## Limitaciones y advertencias

- Entrenado únicamente sobre tuits cortos en inglés; la generalización a texto largo, otros idiomas o registros formales es limitada.
- Las etiquetas emocionales son subjetivas y el modelo refleja los sesgos presentes en los datos de entrenamiento.
- No está indicado para diagnóstico clínico ni evaluación de salud mental.
- Segun el tutorial de Union AI sobre fine-tuning de BERT para emociones, este tipo de modelos tiende a hacer pattern matching sobre palabras emocionales clave y falla con ejemplos negados (por ejemplo, "I am not happy" tiende a clasificarse como alegría).
- El número de descargas es cero, lo que sugiere que el modelo es reciente y no ha sido validado por la comunidad.
- La ventana de contexto de 512 tokens limita su uso a textos breves.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neeraj-mO/bert-emotion-finetuned
- Conjunto de datos dair-ai/emotion: https://huggingface.co/datasets/dair-ai/emotion
- Modelo base bert-base-uncased: https://huggingface.co/google-bert/bert-base-uncased
- Tutorial de Union AI sobre fine-tuning de BERT para emociones: https://github.com/unionai/workshops/tree/main/tutorials/bert-fine-tuning-emotion
- Modelo alternativo boltuix/bert-emotion: https://huggingface.co/boltuix/bert-emotion
