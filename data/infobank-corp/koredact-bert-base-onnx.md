# infobank-corp/koredact-bert-base-onnx

## Resumen

El modelo `infobank-corp/koredact-bert-base-onnx` es una exportación a formato ONNX del modelo `koredact-bert-base`, desarrollado por la empresa coreana infobank-corp. Está especializado en la detección de información personal identificable (PII) en textos en coreano mediante token classification (NER), cubriendo 13 tipos de PII y utilizando un esquema de etiquetado BIO con 27 etiquetas. Su propósito principal es servir como componente de preprocesamiento para enmascarar datos sensibles antes de su publicación o uso en otros sistemas.

La relevancia de esta versión ONNX radica en que permite ejecutar el modelo sin depender de PyTorch, utilizando únicamente ONNX Runtime, lo que facilita su integración en entornos de producción con requisitos de latencia o restricciones de dependencias. El archivo de pesos es un único fichero `model.onnx` de 442 MB en precisión fp32, exportado con opset 20 mediante torch 2.13.0 dynamo. Se incluye además un archivo `parity.json` que documenta la verificación de equivalencia con el modelo PyTorch original, con una discrepancia máxima de logits de 8.5e-05 y cero diferencias en la predicción de tokens sobre un conjunto de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base) para token classification |
| Parametros totales | no disponible (modelo base BERT-base, sin cifra publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT suele usar 512, pero no se especifica) |
| Tipos de cuantizacion | fp32 (único formato publicado) |
| Idiomas soportados | coreano (ko) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (archivo `.onnx`) |

## Arquitectura y entrenamiento

El modelo es una exportación directa del checkpoint `infobank-corp/koredact-bert-base`, que a su vez es un modelo BERT-base entrenado para la tarea de token classification sobre PII en coreano. La arquitectura subyacente es la de un transformer encoder de tipo BERT, con una capa de clasificación por token que produce 27 logits (correspondientes a las etiquetas BIO para 13 tipos de PII). No se dispone de información pública sobre el proceso de entrenamiento del modelo base: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. La exportación a ONNX se realizó con torch 2.13.0 dynamo, opset 20, y las entradas son `input_ids`, `token_type_ids` y `attention_mask` con forma `[batch, seq]`, generando una salida `logits [batch, seq, 27]`. El archivo `parity.json` confirma que la conversión no introduce diferencias significativas respecto al modelo PyTorch original.

## Capacidades

- Detección de 13 tipos de información personal identificable (PII) en texto coreano, mediante etiquetado BIO con 27 etiquetas.
- Clasificación de tokens individuales, lo que permite identificar entidades como nombres, números de teléfono, direcciones, números de identificación, etc.
- Salida de logits por token, adecuada para postprocesado con agrupación BIO y fusión de spans solapados.
- Compatible con ONNX Runtime, lo que permite inferencia en CPU y GPU sin necesidad de PyTorch.
- Soporte para procesamiento de textos largos mediante división en ventanas de 400 caracteres con solapamiento de 100 caracteres, según las instrucciones del autor.
- No se mencionan capacidades adicionales como generación de texto, razonamiento, tool calling o soporte multilingüe más allá del coreano.

## Casos de uso

- Anonimización de documentos coreanos: el modelo identifica y marca entidades PII en informes, contratos o expedientes, permitiendo enmascararlas antes de su publicación o compartición externa.
- Cumplimiento normativo de protección de datos: integración en pipelines que deben cumplir con la Ley de Protección de Información Personal de Corea (PIPA), detectando automáticamente datos sensibles en registros y bases de datos.
- Preprocesamiento de datasets para entrenamiento de modelos: eliminar PII de corpus de texto coreano antes de utilizarlos para fine-tuning o entrenamiento desde cero, reduciendo riesgos de fuga de información.
- Redacción automática de informes médicos o legales: extraer y ocultar identificadores de pacientes o partes implicadas en documentos clínicos o judiciales.
- Análisis de logs de servidores y registros de actividad: detectar y enmascarar direcciones IP, correos electrónicos o números de teléfono en logs antes de su almacenamiento o análisis.
- Integración en aplicaciones de atención al cliente: filtrar PII en conversaciones de chat o correos electrónicos antes de enviarlos a sistemas de análisis o almacenamiento externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, etc.) en la información disponible. El único dato de rendimiento es la verificación de paridad con el modelo PyTorch original: sobre un conjunto de validación de 1.590 documentos, 1.870 segmentos y 196.653 tokens, se obtuvo cero discrepancias en el argmax de tokens y una diferencia máxima de logits de 8.5e-05. Este dato confirma la fidelidad de la conversión, pero no constituye una evaluación de calidad del modelo en tareas de NER.

## Requisitos de hardware

- El archivo ONNX pesa 442 MB en fp32, por lo que la inferencia requiere al menos 1-2 GB de memoria (RAM o VRAM) para cargar los pesos y los tensores intermedios.
- Puede ejecutarse en CPU con ONNX Runtime, siendo adecuado para entornos sin GPU. En CPU, la latencia dependerá del hardware; para un BERT-base típico, se esperan decenas de milisegundos por secuencia corta.
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.) puede manejar el modelo sin problemas.
- Opciones de despliegue: ONNX Runtime (Python, C#, C++), también se puede convertir a otros formatos como TensorRT o OpenVINO, aunque no se proporcionan instrucciones oficiales.
- No se recomienda su uso en entornos con restricciones de memoria muy estrictas, dado el tamaño del archivo fp32; una cuantización a int8 reduciría el consumo, pero no está publicada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede establecer una comparativa fiable con otras soluciones de detección de PII en coreano sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para coreano; no es aplicable a otros idiomas sin reentrenamiento.
- La salida está pensada para tareas de enmascaramiento y preprocesamiento, no debe utilizarse como base para decisiones legales o de cumplimiento sin supervisión humana.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos en la detección de ciertos tipos de PII o en variantes dialectales.
- Al ser una exportación ONNX, hereda las limitaciones del modelo base; cualquier error de predicción del modelo original se mantiene en esta versión.
- La licencia CC-BY-SA-4.0 implica que los usos derivados deben compartirse bajo la misma licencia, lo que puede ser restrictivo para aplicaciones comerciales cerradas.
- El procesamiento de textos largos requiere división en ventanas, lo que puede provocar pérdida de contexto en los límites de las ventanas si no se gestiona correctamente el solapamiento.

## Enlaces

- Modelo ONNX: https://huggingface.co/infobank-corp/koredact-bert-base-onnx
- Modelo base (PyTorch): https://huggingface.co/infobank-corp/koredact-bert-base
- Tutorial de ONNX Runtime con C# (referencia general, no específica del modelo): https://onnxruntime.ai/docs/tutorials/csharp/bert-nlp-csharp-console-app.html
