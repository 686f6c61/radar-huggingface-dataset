# qualcomm/Mobile-Bert-Uncased-Google

## Resumen

Mobile-Bert-Uncased-Google es una exportación optimizada del modelo MobileBERT, un codificador transformer compacto derivado de BERT y diseñado especificamente para tareas de comprensión del lenguaje en dispositivos con recursos limitados. La publicación corre a cargo de Qualcomm, que distribuye en su Hugging Face los ficheros ya compilados y perfilados para ejecutarse sobre la NPU de sus plataformas Snapdragon y Dragonwing, mediante el flujo Qualcomm AI Hub Workbench. El modelo base proviene de la implementación de Google Research referenciada en el paper arXiv:2004.02984.

El modelo resuelve el problema de desplegar representaciones lingüísticas de calidad en movil, IoT y computación de borde, donde un BERT-base de 110 M de parámetros resulta caro en memoria y latencia. Con 25,3 M de parámetros y un checkpoint en float de 130 MB, MobileBERT mantiene la estructura profunda y estrecha característica de su arquitectura y se ofrece aquí como backbone reutilizable y como cabecera de modelado de lenguaje enmascarado.

Aunque la pipeline declarada es text-generation, se trata en realidad de un encoder tipo BERT (no un modelo generativo autorregresivo), por lo que su uso típico es la extracción de características, la clasificación y el relleno de máscaras. La relevancia actual está en la combinación de licencia Apache 2.0, tamaño reducido y artefactos pre-exportados (ONNX y QNN_DLC) listos para cuantización y despliegue en NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder compacto basado en BERT (MobileBERT). Segun el paper de referencia (arXiv:2004.02984) emplea cuello de botella invertido y sustituye LayerNorm por NoNorm |
| Parametros totales | 25,3 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 384 tokens (resolucion de entrada 1x384) |
| Tipos de cuantizacion | float, w8a16 y w8a16_mixed_fp16 (runtime QNN_DLC); float en ONNX |
| Idiomas soportados | no disponible (checkpoint uncased, sin lista de idiomas publicada) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (libreria declarada), ONNX y QNN_DLC |

## Arquitectura y entrenamiento

MobileBERT es un codificador transformer de tipo "thin and deep": muchas capas y dimensión oculta reducida. Segun el paper de referencia, se entrena mediante transferencia de conocimiento progresiva desde BERT_LARGE como profesor, lo que permite que un modelo de 25,3 M de parámetros se acerque al rendimiento de BERT_BASE. El checkpoint concreto de este repositorio está "uncased" (texto en minúsculas) y se publica como artefacto ya exportado para inferencia, no como checkpoint entrenable original.

Qualcomm no documenta en esta ficha el número de tokens de preentrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; ese detalle pertenece al paper original y no se reproduce aquí. Lo que sí aporta esta publicación es la cadena de despliegue: exportación a ONNX y a QNN_DLC con precisión float, w8a16 y w8a16_mixed_fp16, compilada y perfilada con Qualcomm AI Hub Workbench para distintos chipsets.

## Capacidades

- Extracción de representaciones contextuales para downstream NLP (backbone para clasificación, NER, question answering y similitud semántica).
- Modelado de lenguaje enmascarado (masked language modeling), tal y como indica la model card.
- Inferencia de baja latencia sobre NPU de plataformas Snapdragon y Dragonwing.
- Ejecución en formato ONNX con ONNX Runtime y en formato QNN_DLC con QAIRT.
- Personalización mediante reexportación con pesos ajustados (fine-tuned) y formas de entrada propias a través de la librería Qualcomm AI Hub Models.
- No soporta de forma declarada tool calling, function calling, capacidades de agente, multimodalidad (visión o audio), ni modos de "thinking".

## Casos de uso

- Clasificación de texto en el dispositivo: reutilizar el encoder como backbone y añadir una cabeza de clasificación para moderación de contenido, detección de spam o categorización de reseñas, ejecutando todo en la NPU sin enviar datos a la nube.
- Extracción de entidades y análisis de sentimiento offline: al ser uncased y ligero, encaja en apps de notas, correo o mensajería que deben procesar texto de forma privada en el terminal.
- Relleno de palabras enmascaradas para autocompletado o corrección básica: útil en teclados predictivos o asistentes de escritura con restricciones de memoria.
- Búsqueda semántica local: generar embeddings de frases para indexar y recuperar documentos o conversaciones dentro de una app movil con contexto de hasta 384 tokens.
- Preprocesado de pipelines de voz o asistentes: usar el modelo como componente de comprensión de lenguaje en asistentes embebidos donde la latencia de 4-13 ms es crítica.
- IoT industrial y automoción: despliegue en plataformas Dragonwing (IQ-8275, QCS8550, QCS8450) para tareas de comprensión de texto en el borde sin conectividad.
- Prototipado rápido con fines de investigación: base de bajo coste para estudiar destilación, cuantización w8a16 y comportamiento de modelos compactos en NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, GLUE, SQuAD, etc.) en la informacion disponible. La model card sí aporta mediciones de tiempo de inferencia y memoria pico, resumidas a continuación (ONNX float como muestra representativa):

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | float | 4,353 | 0 - 231 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | ONNX | float | 5,843 | 0 - 230 | NPU |
| Snapdragon X2 Elite | ONNX | float | 4,645 | 1 - 1 | NPU |
| Snapdragon X Elite | ONNX | float | 11,146 | 81 - 81 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 7,839 | 0 - 396 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 13,252 | 0 - 376 | NPU |
| Dragonwing IQ-8275 | ONNX | float | 12,636 | 0 - 4 | NPU |
| Dragonwing QCS8550 (Proxy) | ONNX | float | 10,598 | 0 - 83 | NPU |
| QCS8450 | ONNX | float | 13,252 | 0 - 376 | NPU |
| Dragonwing IQ-9075 | ONNX | float | 13,034 | 0 - 4 | NPU |
| Dragonwing IQ-X7181 | ONNX | float | 11,146 | 81 - 81 | NPU |
| Dragonwing Q-8750 | ONNX | float | 5,843 | 0 - 230 | NPU |

La model card también ofrece variantes QNN_DLC float, w8a16 y w8a16_mixed_fp16 con latencias del mismo orden (por ejemplo, 4,554 ms en Snapdragon 8 Elite Gen 5 For Galaxy Mobile con QNN_DLC float).

## Requisitos de hardware

- La arquitectura está pensada para NPU de Qualcomm; el despliegue objetivo no es GPU de servidor sino movil, tableta, PC con Snapdragon X y plataformas IoT.
- El checkpoint en float ocupa 130 MB, por lo que cabe holgadamente en cualquier dispositivo con más de 0,5 GB de memoria libre; la memoria pico medida varía entre 1 MB y 396 MB según chipset y runtime.
- GPUs recomendadas: no disponible para inferencia en GPU de escritorio o centro de datos; no se documenta soporte CUDA en esta ficha. Los artefactos ONNX podrían ejecutarse en GPU mediante ONNX Runtime, pero sin cifras publicadas.
- ¿Cabe en GPU de consumo? No hay datos publicados para RTX 4090 u otras; el modelo es lo bastante pequeño (25,3 M de parámetros) como para caber en cualquier GPU con al menos 1 GB de VRAM, pero Qualcomm no lo valida en ese escenario.
- Opciones de despliegue: Qualcomm AI Hub Workbench (recomendado), ONNX Runtime 1.27.1 para el artefacto ONNX, y QAIRT 2.50 para las variantes QNN_DLC, incluida la cuantización w8a16.
- Latencia estimada: entre 4,353 ms y 13,365 ms por inferencia según chipset, runtime y precisión, siempre sobre NPU. No se publica throughput ni datos de batch.

## Comparativa con modelos similares

Comparación de referencia con alternativas de la misma categoría de encoder compacto. Los datos de los otros modelos son de conocimiento general y pueden variar según checkpoint y configuración.

| Modelo | Parametros | Contexto tipico | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mobile-Bert-Uncased-Google (Qualcomm) | 25,3 M | 384 tokens | Apache 2.0 | Hugging Face + AI Hub, artefactos ONNX/QNN_DLC |
| BERT-base uncased | ~110 M | 512 tokens | Apache 2.0 | Google Research / Hugging Face |
| DistilBERT base uncased | ~66 M | 512 tokens | Apache 2.0 | Hugging Face |
| ALBERT base v2 | ~12 M | 512 tokens | Apache 2.0 | Hugging Face |

No se dispone de datos de precisión comparados en la informacion proporcionada, por lo que no se puede establecer una comparación de rendimiento tarea a tarea.

## Limitaciones y advertencias

- Es un encoder tipo BERT, no un modelo generativo autorregresivo: la etiqueta text-generation de la pipeline no implica generación libre de texto como en un modelo causal.
- Longitud de contexto fija y corta (384 tokens). Textos mas largos requieren truncado o fragmentación.
- Checkpoint uncased: no distingue mayúsculas y puede degradar en tareas que dependen de ellas (entidades, siglas).
- Idiomas no declarados; al ser un BERT uncased entrenado por Google suele estar orientado al inglés, pero Qualcomm no publica lista de idiomas.
- Riesgo de sesgos y alucinaciones heredado del corpus de preentrenamiento; no hay evaluaciones de sesgo en la ficha.
- El repositorio está orientado a inferencia en NPU de Qualcomm; no se documentan garantías de funcionamiento en otros hardware ni cifras de precisión cuantizada w8a16 frente a float.
- Licencia Apache 2.0, que permite uso comercial, pero se debe respetar la atribución y las condiciones del proyecto original de Google Research.
- Advertencia de mantenimiento: el repositorio tiene muy pocas descargas e interacciones (3 descargas, 0 likes en el momento de la consulta), por lo que el soporte de la comunidad es limitado.
- Para produccion conviene validar la calidad del modelo en la tarea concreta, dado que la ficha no aporta métricas de exactitud.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/Mobile-Bert-Uncased-Google
- Implementacion original MobileBERT (Google Research): https://github.com/google-research/google-research/tree/master/mobilebert
- Libreria Qualcomm AI Hub Models (Mobile-Bert-Uncased-Google): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/mobile_bert_uncased_google
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/mobile_bert_uncased_google
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Paper de MobileBERT (arXiv:2004.02984): https://arxiv.org/abs/2004.02984
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
