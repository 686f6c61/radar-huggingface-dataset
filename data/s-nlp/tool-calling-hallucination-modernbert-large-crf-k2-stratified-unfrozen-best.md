# s-nlp/tool-calling-hallucination-modernbert-large-crf-k2-stratified-unfrozen-best

## Resumen

El modelo `s-nlp/tool-calling-hallucination-modernbert-large-crf-k2-stratified-unfrozen-best` es un clasificador de tokens (token-classification) desarrollado por el grupo s-nlp para detectar alucinaciones en las respuestas de asistentes que utilizan tool calling. Se basa en el encoder ModernBERT-large y añade una capa CRF (Conditional Random Field) para predecir spans de alucinación a nivel de carácter dentro de la respuesta del asistente, dado un contexto que incluye la consulta del usuario y la respuesta de la herramienta.

El modelo aborda un problema crítico en sistemas de agentes: cuando un LLM genera respuestas basadas en resultados de herramientas, puede inventar valores, eliminar campos o generar contenido no soportado por la evidencia. Este detector identifica esos segmentos problemáticos, lo que permite filtrar o corregir la salida antes de mostrarla al usuario. Su relevancia actual radica en el creciente despliegue de agentes autónomos y asistentes con acceso a APIs, donde la verificación de fidelidad es esencial.

Al ser un fine-tuning de ModernBERT-large, hereda la arquitectura de transformer encoder eficiente de dicho modelo, con una ventana de contexto de 8192 tokens (según las especificaciones del modelo base). Está diseñado para el idioma inglés y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (transformer encoder) + capa CRF para etiquetado de secuencias |
| Parametros totales | no disponible (basado en ModernBERT-large, aproximadamente 395M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (heredada de ModernBERT-large) |
| Tipos de cuantizacion | no disponible (formato safetensors, compatible con transformers) |
| Idiomas soportados | ingles (segun tag `en`) |
| Licencia | Apache 2.0 (segun metadatos de HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-large`, un encoder transformer de última generación optimizado para eficiencia y velocidad. Sobre esta base, s-nlp añade una capa de CRF (Conditional Random Field) que modela dependencias entre etiquetas consecutivas, lo que mejora la coherencia de los spans detectados. El nombre del modelo indica un entrenamiento con estrategia estratificada y capas no congeladas (`unfrozen`), aunque no se han publicado detalles específicos sobre el dataset de entrenamiento, el número de épocas o el proceso de optimización.

La tarea se formula como clasificación de tokens a nivel de carácter: cada carácter de la respuesta del asistente se etiqueta como parte de un span de alucinación o no. El contexto de entrada incluye la consulta del usuario y la respuesta de la herramienta, lo que permite al modelo contrastar la información generada con la evidencia disponible. Según la colección de s-nlp, el modelo detecta tres tipos de alucinación: conflicto de valor, eliminación de campos y sobre-generación.

## Capacidades

- Deteccion de spans de alucinacion a nivel de caracter en respuestas de asistentes con tool calling.
- Identificacion de conflictos de valor: cuando el asistente afirma un valor distinto al proporcionado por la herramienta.
- Deteccion de eliminacion de campos: cuando el asistente omite informacion que deberia incluir.
- Deteccion de sobre-generacion: cuando el asistente anade contenido no soportado por la respuesta de la herramienta.
- Salida estructurada de spans con posiciones de inicio y fin, util para post-procesamiento automatico.
- Compatible con pipelines de transformers para inferencia directa.

## Casos de uso

- Verificacion automatica de respuestas en agentes conversacionales: integrar el modelo como paso posterior a la generacion para marcar y eliminar segmentos alucinados antes de entregar la respuesta al usuario.
- Control de calidad en sistemas de soporte tecnico: auditar logs de interacciones para detectar patrones de alucinacion y mejorar los prompts o el fine-tuning del LLM subyacente.
- Filtrado de salidas en pipelines de generacion aumentada por recuperacion (RAG): comprobar que las respuestas generadas se ciñen a los documentos recuperados y señalar discrepancias.
- Monitorizacion de agentes autonomos que ejecutan acciones sobre APIs: detectar cuando el agente inventa resultados de llamadas a herramientas, evitando decisiones incorrectas.
- Entrenamiento de modelos de recompensa o preferencia: usar los spans detectados como señales para RLHF o DPO, penalizando respuestas con alucinaciones.
- Auditoria de cumplimiento en sectores regulados: revisar automaticamente las respuestas generadas por asistentes en banca o sanidad para garantizar que no contienen informacion falsa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como F1, precision o recall sobre datasets estandar de deteccion de alucinaciones. Se recomienda evaluar el modelo en el dataset `s-nlp/toolHACE` (mencionado en los tags) para obtener una medida de su rendimiento.

## Requisitos de hardware

- Al ser un modelo encoder de aproximadamente 395M parametros (basado en ModernBERT-large), la inferencia es ligera en comparacion con LLMs generativos.
- VRAM estimada: en FP16, el modelo ocupa alrededor de 790 MB de pesos, por lo que cabe en GPUs con 4 GB o mas. En cuantizacion INT8, el uso de VRAM se reduce a unos 400 MB.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o superiores. Tambien puede ejecutarse en CPU con razonable velocidad para inferencia por lotes.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con HuggingFace Inference Endpoints, o mediante librerias como ONNX Runtime o TensorRT para optimizacion.
- Latencia: no se dispone de datos medidos, pero para un encoder de este tamano, la inferencia en GPU suele ser de milisegundos por secuencia.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma tarea (deteccion de alucinaciones en tool calling). Existen otros detectores de alucinacion genericos, como los basados en NLI o en clasificacion de consistencia, pero no se han encontrado alternativas especificas con las mismas caracteristicas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta entrenado para el idioma ingles; su rendimiento en otros idiomas no esta garantizado.
- Solo detecta alucinaciones en el contexto de tool calling; no es aplicable a otros tipos de generacion libre sin adaptacion.
- La precision de los spans puede verse afectada por variaciones en el formato de las respuestas de las herramientas o en el estilo del asistente.
- No se han publicado estudios de sesgos; podria presentar falsos positivos o negativos en dominios especificos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base ModernBERT-large.
- El modelo no es generativo; no produce texto, solo etiquetas de clasificacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/s-nlp/tool-calling-hallucination-modernbert-large-crf-k2-stratified-unfrozen-best
- Coleccion de s-nlp sobre deteccion de alucinaciones en tool calling: https://huggingface.co/collections/s-nlp/tool-calling-hallucination-detection
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset toolHACE (mencionado en tags): https://huggingface.co/datasets/s-nlp/toolHACE
