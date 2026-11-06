# hmzprover/hpsearch-embed-xs-agent

## Resumen

hpsearch-embed-xs-agent es un modelo de embeddings de frases (sentence-similarity) especializado en recuperación de teoremas y declaraciones de Lean 4 y Mathlib, desarrollado por el usuario hmzprover. Se trata de un ajuste fino adicional sobre hmzprover/hpsearch-embed-xs, que a su vez deriva de snowflake-arctic-embed-xs (22M parámetros). Su función es actuar como embedder de CPU para el modo `balanced` de la herramienta hpsearch, convirtiendo consultas de agentes y estados de prueba en vectores unitarios de 384 dimensiones que permiten búsqueda semántica sobre declaraciones matemáticas formalizadas.

El modelo resuelve un problema concreto: los agentes automáticos de demostración de teoremas escriben consultas rudimentarias (conjuntos de palabras clave o nombres Lean conjeturados) que los embedders genéricos no alinean bien con las declaraciones objetivo. Este ajuste entrena el modelo con cadenas de consultas reales de agentes emparejadas con la declaración que finalmente encontraron, incorporando negativos duros procedentes de búsquedas léxicas fallidas.

La relevancia actual radica en su orientación a entornos de recuperación aumentada para asistentes de demostración formal, con despliegue en ONNX y ejecución en CPU, lo que lo hace adecuado para pipelines de agentes con restricciones de latencia y sin GPU dedicada. El repositorio ocupa 0,1 GB y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de snowflake-arctic-embed-xs), exportado a ONNX |
| Parametros totales | 22M (según model card del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (int8 descartado por pérdida de 0,01 NDCG@10 en el dev set del autor) |
| Idiomas soportados | no disponible (entrenado sobre consultas y declaraciones Lean/Mathlib, predominantemente inglés técnico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`), tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo sentence-similarity heredado de snowflake-arctic-embed-xs (22M parámetros), exportado a ONNX con dos entradas (`input_ids` y `attention_mask`, ambas int64) y una salida `embedding` de vectores unitarios de dimensión 384 por lote. No emplea prefijo de instrucción: hpsearch sustituye la notación Lean por palabras y coloca el objetivo (goal) del estado de prueba en primer lugar antes de la codificación.

El ajuste fino utiliza consultas de búsqueda de agentes del dataset hmzprover/query-chains (bolsas de palabras clave y nombres Lean conjeturados que un agente introdujo en una herramienta de búsqueda de teoremas), cada una emparejada con la declaración que su cadena acabó encontrando en hmzprover/proofs. Los negativos duros son los resultados de búsqueda léxica que no corresponden a la declaración objetivo. Además, se reutilizan pares públicos del conjunto de entrenamiento original del modelo base. Se aplicó descontaminación excluyendo todas las cadenas del benchmark de búsqueda de hmzprover (positivas y negativas) y cualquier par cuya consulta normalizada, nombre o enunciado del objetivo aparezca en los conjuntos de evaluación usados por hpsearch (MathlibQR / MathlibMPR, Lean Finder, LeanStateSearch, TheoremSearch, TBPS, hmzprover).

## Capacidades

- Generación de embeddings de frases para similitud semántica (pipeline `sentence-similarity`).
- Recuperación de declaraciones y teoremas de Lean 4 / Mathlib a partir de consultas de agentes.
- Codificación de estados de prueba con el goal en primer plano y notación Lean normalizada a palabras.
- Manejo de consultas rudimentarias (bolsas de palabras clave, nombres conjeturados) propias de agentes automáticos.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Salida de vectores unitarios de 384 dimensiones, aptos para búsqueda por producto interno o similitud coseno.
- No soporta tool calling, agentes multi-paso, visión ni audio: es exclusivamente un embedder.

## Casos de uso

- Búsqueda de teoremas en asistentes de demostración: un agente Lean 4 introduce una consulta con palabras clave o un nombre conjeturado y el modelo la proyecta al espacio de embeddings para recuperar declaraciones candidatas de Mathlib, gracias al ajuste específico sobre consultas reales de agentes.
- Recuperación aumentada en pipelines de prueba automática: integrar el embedder como primer paso de un sistema de búsqueda que alimente a un modelo generador de demostraciones con los lemas relevantes, reduciendo el espacio de búsqueda antes del razonamiento.
- Indexación de bases de conocimiento matemático formalizado: generar embeddings de declaraciones de Mathlib y almacenarlos en un índice vectorial para consultas posteriores de baja latencia en CPU.
- Herramientas de búsqueda para IDE o editores de Lean: ofrecer búsqueda semántica de lemas dentro del editor sin GPU, aprovechando la exportación ONNX y el tamaño reducido del modelo.
- Filtrado de candidatos en sistemas híbridos léxico-semánticos: combinar los resultados de búsqueda léxica (usados como negativos duros en el entrenamiento) con la reordenación por embeddings para mejorar la precisión de recuperación.
- Evaluación y experimentación en investigación sobre recuperación formal: servir como componente de referencia en estudios comparativos de embedders para Lean, dado que el autor documenta la descontaminación frente a varios benchmarks públicos.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con pesos fp32 y un repositorio de 0,1 GB, encaja en servicios contenedorizados sin acelerador hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona que la cuantización int8 perdió 0,01 NDCG@10 en la mitad de desarrollo del autor, sin aportar valores absolutos de NDCG@10 ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, los 22M parámetros en fp32 ocupan aproximadamente 88 MB de pesos, más overhead de activaciones y runtime.
- GPU recomendadas: no disponible; el modelo está diseñado para CPU y no requiere GPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU sin aceleración.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio), con posibilidad de servir mediante infraestructura compatible con ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| hpsearch-embed-xs-agent | 22M | no disponible | Lean 4 / Mathlib (consultas de agentes) | Apache 2.0 | ONNX |
| hmzprover/hpsearch-embed-xs (base) | 22M | no disponible | Lean 4 / Mathlib (uso general) | no disponible | no disponible |
| snowflake-arctic-embed-xs (ancestro) | 22M | no disponible | Texto general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera del dominio Lean 4 / Mathlib no está documentado y probablemente sea inferior al de embedders de propósito general.
- Idiomas soportados no declarados; el entrenamiento se centra en consultas técnicas en inglés y notación Lean, por lo que el soporte multilingüe es incierto.
- Longitud de contexto no disponible; consultas o declaraciones largas podrían truncarse sin que se documente el límite.
- Riesgo de sobreajuste a los patrones de consulta de los agentes de hpsearch, lo que puede reducir la generalización a otros estilos de consulta.
- La cuantización int8 no se recomienda según el autor (pérdida de 0,01 NDCG@10 en su dev set), lo que limita optimizaciones de tamaño.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación externa inexistente.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones independientes de calidad en producción.
- No es un modelo generativo: no puede producir texto, código ni demostraciones; solo vectores de embedding.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmzprover/hpsearch-embed-xs-agent
- Modelo base: https://huggingface.co/hmzprover/hpsearch-embed-xs
- Repositorio hpsearch: https://github.com/humanfia/hpsearch
- Dataset de consultas: https://huggingface.co/datasets/hmzprover/query-chains
- Dataset de demostraciones: https://huggingface.co/datasets/hmzprover/proofs
