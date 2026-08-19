# Fatihaybasn/pathfinder-flan-t5-large-second-try-onnx-int8

## Resumen

Este modelo es una exportación en formato ONNX con cuantización INT8 del modelo base `google/flan-t5-large`, realizada por el usuario Fatihaybasn como parte del proyecto PathFinder-Ship. El objetivo es ofrecer una versión optimizada para inferencia en CPU mediante ONNX Runtime, manteniendo la arquitectura encoder-decoder de T5 con 783 millones de parámetros. El modelo está diseñado para tareas de generación de texto, chat y recuperación aumentada (RAG), y se integra en un asistente multimodal local-first que también emplea un clasificador de intención MiniLM cuantizado y un pipeline de visión YOLO-NAS.

La relevancia de esta publicación radica en su enfoque práctico para despliegue en entornos sin GPU, ya que la cuantización INT8 reduce el tamaño del modelo a aproximadamente 1.2 GB y permite ejecutarlo en hardware modesto. Aunque el repositorio no incluye benchmarks de rendimiento específicos del export ONNX, sí documenta métricas del modelo fuente (un LoRA ajustado sobre Flan-T5-Large) que sirven como referencia orientativa. La licencia Apache 2.0 facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) |
| Parametros totales | 783M (según documentación del proyecto PathFinder-Ship; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la documentación; el modelo base `google/flan-t5-large` tiene 512 tokens |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder_model.onnx, decoder_model.onnx, decoder_with_past_model.onnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 (Text-to-Text Transfer Transformer), un transformer encoder-decoder que trata todas las tareas de NLP como problemas de conversión texto-a-texto. El modelo base `google/flan-t5-large` fue fine-tuneado en más de 1000 tareas adicionales, cubriendo múltiples idiomas y formatos de instrucción. En este repositorio, el modelo se presenta como una exportación ONNX con cuantización INT8, realizada con la librería Optimum, y los nombres de archivo se han estandarizado para compatibilidad con `ORTModelForSeq2SeqLM`.

El proyecto PathFinder-Ship indica que el modelo fuente fue adaptado mediante LoRA (denominado "Second Try LoRA") para mejorar su rendimiento en tareas de chat y RAG, aunque no se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de ajuste. La cuantización INT8 se aplicó al export ONNX, pero no se documenta si hubo calibración o fine-tuning posterior. La evaluación incluida en la model card corresponde al modelo LoRA original, no al export ONNX, y se advierte explícitamente que no debe interpretarse como un benchmark de paridad.

## Capacidades

- Generación de texto condicionada a instrucciones, gracias a la base Flan-T5.
- Soporte para tareas de chat multi-turno, aunque la calidad depende de las plantillas de prompt y ajustes de decodificación.
- Integración con un motor RAG híbrido (ChromaDB + SQLite FTS5/BM25) para respuestas basadas en documentos recuperados.
- Clasificación de intención (comando vs. chat) mediante un clasificador MiniLM cuantizado, que enruta las peticiones al modelo adecuado.
- Capacidad de procesamiento de imágenes a través del pipeline de visión YOLO-NAS del proyecto PathFinder-Ship, aunque el modelo en sí no es multimodal.
- Optimizado para inferencia en CPU con ONNX Runtime, lo que permite ejecución sin GPU.

## Casos de uso

- Asistente local en CPU para entornos sin conectividad: el modelo puede ejecutarse en portátiles o servidores sin GPU, proporcionando respuestas a instrucciones en inglés. Su tamaño reducido (1.2 GB) y la cuantización INT8 lo hacen viable para hardware con poca memoria.
- Chat de atención al cliente basado en documentos: combinado con el motor RAG, el modelo puede responder preguntas sobre manuales, FAQs o bases de conocimiento internas, usando la ventana de contexto para integrar pasajes recuperados.
- Generación de respuestas en aplicaciones de soporte técnico: gracias a su fine-tuning LoRA para chat, puede mantener conversaciones multi-turno con usuarios, aunque requiere plantillas de prompt específicas para obtener buenos resultados.
- Clasificación y enrutamiento de intenciones en asistentes virtuales: aunque el modelo no hace clasificación directamente, el proyecto PathFinder-Ship lo usa junto con un clasificador MiniLM para distinguir entre comandos y preguntas conversacionales, mejorando la experiencia de usuario.
- Prototipado rápido de sistemas RAG en entornos sin GPU: al ser un export ONNX INT8, se puede integrar fácilmente con Optimum y probar pipelines de recuperación en máquinas de desarrollo sin aceleradores.
- Despliegue en dispositivos edge o servidores de baja potencia: la inferencia en CPU con ONNX Runtime permite ejecutar el modelo en Raspberry Pi, mini-PCs o instancias cloud de bajo coste, siempre que haya suficiente RAM (al menos 2-3 GB libres).

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks para el export ONNX INT8. Los únicos datos disponibles corresponden a la evaluación del modelo fuente (Second Try LoRA), que se muestran a continuación. Se advierte que no deben interpretarse como una medida del rendimiento del export ONNX.

| Metrica | Valor (modelo fuente LoRA) |
|---|---|
| Chat token-F1 | 0.5216 |
| RAG token-F1 | 0.8894 |
| RAG exact match | 0.7938 |

No se han publicado resultados de benchmarks para el modelo ONNX en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ONNX Runtime con `CPUExecutionProvider`. No requiere GPU.
- Memoria RAM: el tamaño del repositorio es de 1.2 GB, por lo que se recomienda al menos 2 GB de RAM libre para cargar los pesos y ejecutar la inferencia. En la práctica, con cuantización INT8, el consumo de memoria suele ser inferior al del modelo en fp32.
- GPU: no necesaria; si se desea usar GPU, se podría cambiar el provider a `CUDAExecutionProvider`, pero no está documentado ni probado.
- Opciones de despliegue: Optimum (`ORTModelForSeq2SeqLM`) con ONNX Runtime, compatible con Python. También se puede integrar en pipelines de Hugging Face Transformers.
- Latencia y throughput: no disponibles. Dependerán del hardware CPU, el tamaño del prompt y los parámetros de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| `google/flan-t5-large` (base) | 783M | 512 tokens | No (fp32) | Apache-2.0 | PyTorch / Safetensors |
| `Fatihaybasn/pathfinder-flan-t5-large-second-try-onnx-int8` | 783M | No disponible (heredado 512) | INT8 | Apache-2.0 | ONNX |
| `jncraton/flan-t5-large-ct2-int8` | 783M | 512 tokens | INT8 | Apache-2.0 | CTranslate2 |

La comparativa muestra que la principal diferencia con el modelo base es la cuantización y el formato ONNX, que facilita el despliegue en CPU. La variante CTranslate2 es similar en propósito, pero usa un runtime distinto. No se dispone de datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha documentado su comportamiento en otros idiomas, aunque Flan-T5-Large originalmente cubre más idiomas, este export no lo garantiza.
- La evaluación proporcionada corresponde al modelo LoRA fuente, no al export ONNX. No se ha verificado que la cuantización INT8 mantenga el mismo rendimiento; se recomienda realizar pruebas de humo antes de usar en producción.
- La calidad de las respuestas depende en gran medida de las plantillas de prompt y los parámetros de decodificación específicos del proyecto PathFinder-Ship. Sin ellos, el modelo puede producir resultados subóptimos.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de generación libre. En aplicaciones RAG, la calidad de la recuperación influye directamente en la precisión de las respuestas.
- No se incluyen mecanismos de tool calling ni funciones de agente; el modelo se limita a generación de texto secuencial.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir adecuadamente y no se ofrecen garantías sobre el rendimiento del modelo.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente probado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Fatihaybasn/pathfinder-flan-t5-large-second-try-onnx-int8
- Proyecto PathFinder-Ship (GitHub): https://github.com/fatihaybsn/PathFinder-Ship/tree/showcase/model-benchmarks-diagent-dogfooding
- Modelo base `google/flan-t5-large`: https://huggingface.co/google/flan-t5-large
- Ejemplo de modelo similar en CTranslate2: https://huggingface.co/jncraton/flan-t5-large-ct2-int8
