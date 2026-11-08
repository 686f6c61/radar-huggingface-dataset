# PiterQ/bge-reranker-v2-m3-CoreML

## Resumen

`PiterQ/bge-reranker-v2-m3-CoreML` es una conversión a Core ML del modelo de reranking `BAAI/bge-reranker-v2-m3`, desarrollado originalmente por BAAI (Beijing Academy of Artificial Intelligence) dentro del proyecto FlagEmbedding. Se trata de un cross-encoder multilingüe basado en la arquitectura XLM-RoBERTa que recibe un par consulta-pasaje y devuelve una puntuación de relevancia, usada para reordenar los resultados de un sistema de recuperación en pipelines RAG y motores de búsqueda.

La aportación de esta ficha concreta no es un nuevo entrenamiento, sino un cambio de formato: el autor (PiterQ) ha empaquetado los pesos originales como `mlprogram` en float16 y los ha compilado a `.mlmodelc`, con entradas fijas `input_ids` y `attention_mask` de forma [1, 512] y salida `score` (logit, transformable a 0–1 mediante sigmoide). El objetivo declarado es la inferencia en dispositivo dentro de la aplicación PLaiA, para búsqueda de conocimiento local sin depender de servidores.

Es relevante para desarrolladores que necesiten reranking multilingüe en ecosistema Apple (iOS, macOS) con latencia baja y sin conexión. No incorpora fine-tuning adicional ni cambios en los datos de entrenamiento; la licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa (cross-encoder de reranking) |
| Parametros totales | no disponible (modelo base bge-reranker-v2-m3, tamano "slim" segun documentacion BGE; no se especifica cifra) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (forma de entrada fija [1, 512] en la conversion Core ML) |
| Tipos de cuantizacion | float16 (mlprogram); no se documentan otras variantes |
| Idiomas soportados | multilingue (heredado de XLM-RoBERTa y bge-m3) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML: mlprogram float16, compilado a `.mlmodelc`; tokenizer XLM-RoBERTa original sin cambios; `meta.json` con ids y forma |

## Arquitectura y entrenamiento

El modelo subyacente es un cross-encoder construido sobre el encoder XLM-RoBERTa. Procesa conjuntamente la consulta y el pasaje candidato y produce una única puntuación de relevancia (logit), a diferencia de los bi-encoders que generan embeddings independientes. Según la documentación de BGE, `bge-reranker-v2-m3` se entrena a partir de `bge-m3`, lo que le confiere capacidad multilingüe manteniendo un tamano de modelo reducido.

Esta versión concreta no introduce ningún cambio en el entrenamiento: el autor indica explícitamente "format conversion only", sin fine-tuning ni modificación de los datos de entrenamiento. La conversión fija las entradas a `input_ids` y `attention_mask` de forma [1, 512] (int32 en Core ML, int64 en la variante ONNX) y expone la salida `score` como logit. Se conservan los ficheros del tokenizer originales de XLM-RoBERTa y se incluye un `meta.json` con los ids y la forma usados por la aplicación. No se documentan detalles sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información disponible.

## Capacidades

- Puntuación de relevancia consulta-pasaje (cross-encoding) para reranking en pipelines de recuperación.
- Reordenación de resultados de búsqueda y de candidatos en RAG (retrieval-augmented generation).
- Soporte multilingüe heredado de XLM-RoBERTa y del entrenamiento sobre `bge-m3`.
- Inferencia en dispositivo en el ecosistema Apple mediante Core ML (`.mlmodelc`).
- Salida como logit convertible a probabilidad 0–1 mediante sigmoide.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo de clasificación/puntuación.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reranking en RAG local en apps iOS/macOS: dado un conjunto de pasajes recuperados por un bi-encoder, el modelo los reordena por relevancia antes de pasarlos al LLM generador, ejecutándose íntegramente en el dispositivo mediante Core ML.
- Búsqueda de conocimiento offline en la app PLaiA: el autor lo publica específicamente para esta función, permitiendo consultas sobre una base de conocimiento local sin enviar datos a servidores.
- Búsqueda semántica multilingüe en aplicaciones Apple: al heredar el multilingüismo de XLM-RoBERTa, permite reordenar resultados en varios idiomas con un único modelo.
- Filtrado de candidatos en sistemas de preguntas y respuestas: puntuar pares consulta-pasaje para descartar los irrelevantes antes de la etapa generativa, reduciendo coste y alucinaciones.
- Priorización de resultados en motores de búsqueda documental internos: integrable en apps de escritorio macOS que indexan documentación local.
- Prototipado de pipelines de recuperación en dispositivo: útil para validar latencia y calidad de reranking sin infraestructura de servidor, con la ventaja de privacidad que supone no salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión no incluye métricas, y los resultados de bge-reranker-v2-m3 originales no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 1,2 GB, coherente con pesos en float16 de un encoder de tamano base.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo está pensado para Apple Neural Engine y GPU integrada de Apple Silicon mediante Core ML.
- Cabe en hardware consumer: sí, al estar diseñado para ejecución en dispositivo en iPhone, iPad y Mac con Apple Silicon.
- Opciones de despliegue: Core ML (`.mlmodelc`) en apps Apple; el modelo original puede desplegarse con FlagEmbedding, vLLM u otras herramientas, pero esta conversión está atada a Core ML.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PiterQ/bge-reranker-v2-m3-CoreML | XLM-RoBERTa (cross-encoder) | 512 tokens (fijo) | multilingüe | Apache 2.0 | Core ML (.mlmodelc) |
| BAAI/bge-reranker-v2-m3 | XLM-RoBERTa (cross-encoder) | no disponible en la información | multilingüe | Apache 2.0 | safetensors / PyTorch |
| furiosa-ai/bge-reranker-v2-m3 | XLM-RoBERTa (cross-encoder) | no disponible en la información | multilingüe | no disponible en la información | no disponible en la información |

Las tres variantes comparten el mismo modelo base; las diferencias principales son el formato de empaquetado y el entorno de despliegue objetivo (Core ML en dispositivo frente a servidor).

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: hereda todas las limitaciones del `bge-reranker-v2-m3` original.
- Entrada fija de 512 tokens: los pares consulta-pasaje más largos se truncan, lo que puede degradar la puntuación.
- Solo produce una puntuación de relevancia; no genera texto ni sirve como modelo de chat.
- Riesgo de sesgos heredados de los datos de entrenamiento originales de BAAI, no documentados en esta ficha.
- Posible degradación numérica por la conversión a float16; no se publican evaluaciones que la cuantifiquen.
- Uso comercial permitido por Apache 2.0, pero conviene revisar `LICENSE` y `NOTICE` del repo, que incluyen la atribución a BAAI y la cita de Chen et al. (2024).
- Dependencia del ecosistema Apple: no es portable a otros entornos sin reconvertir el modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria conocida.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/PiterQ/bge-reranker-v2-m3-CoreML
- Modelo original: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Conversión alternativa (Furiosa AI): https://huggingface.co/furiosa-ai/bge-reranker-v2-m3
- Documentación BGE sobre reranking: https://bge-model.com/tutorial/5_Reranking/5.2.html
- Repositorio FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Paper de referencia citado: Chen et al., *BGE M3-Embedding* (2024)
