# Fatihaybasn/pathfinder-flan-t5-large-second-try-lora

## Resumen

El modelo `Fatihaybasn/pathfinder-flan-t5-large-second-try-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Fatihaybasn sobre el checkpoint preentrenado `google/flan-t5-large`. Forma parte del proyecto PathFinder-Ship, un asistente multimodal local-first que combina generación de texto, RAG (Retrieval-Augmented Generation) y visión. Este adaptador se ha ajustado específicamente para tareas de chat y RAG, optimizando el modelo base para responder a instrucciones y recuperar información de un corpus de documentos.

El adaptador añade aproximadamente 18,28 millones de parámetros entrenables (un 2,28 % del modelo base) y se publica bajo licencia Apache 2.0. Su relevancia radica en que permite adaptar un modelo de 783 millones de parámetros con un coste de entrenamiento reducido, manteniendo el rendimiento del modelo base y facilitando su despliegue en entornos con recursos limitados. El modelo está diseñado para ejecutarse en inglés y se ha evaluado en conjuntos de datos específicos del proyecto, con métricas de F1 token a nivel de chat y RAG.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder con adaptador LoRA |
| Parametros totales | Modelo base: 783M; adaptador LoRA: 18,28M entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base T5 tiene 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `google/flan-t5-large`, un modelo encoder-decoder de la familia T5 con 783 millones de parámetros. La técnica LoRA congela los pesos originales e introduce matrices de bajo rango en las capas de atención y feed-forward. En este caso, los módulos objetivo son `q`, `k`, `v`, `o`, `wi_0`, `wi_1` y `wo`, con un rango de 16, alpha de 32 y dropout de 0,05.

El entrenamiento se realizó sobre una mezcla de 100.000 registros de chat y RAG, con una partición determinista 95/5 (semilla 42) para validación. Se empleó una época, una tasa de aprendizaje de 1e-4, un warmup del 6 % y pesos de tarea de 1,7 para chat y 1,0 para RAG. Además, se aplicó label smoothing (0,02 para chat, 0,00 para RAG) y R-Drop parcial con probabilidad 0,15 y lambda 0,25. El adaptador resultante tiene aproximadamente 18,28 millones de parámetros entrenables.

## Capacidades

- Generación de texto en inglés, especializado en respuestas de chat y recuperación de información (RAG).
- Soporte de enrutamiento de intención: el proyecto PathFinder-Ship utiliza un clasificador separado para distinguir entre comandos y conversación, pero el adaptador en sí está diseñado para generar respuestas coherentes en ambos contextos.
- Integración con motores RAG híbridos (ChromaDB + SQLite FTS5/BM25) para respuestas basadas en documentos.
- No se documentan capacidades de tool calling, visión o audio en el adaptador; estas pertenecen a otros componentes del sistema PathFinder-Ship.
- Multilingüismo limitado: solo se ha evaluado en inglés.

## Casos de uso

- Asistente virtual local: el adaptador puede integrarse en un sistema que se ejecute en CPU, como el propio PathFinder-Ship, para responder preguntas de usuario con contexto conversacional.
- Chatbot con RAG sobre documentación técnica: dado su entrenamiento en tareas RAG, es adecuado para construir sistemas que recuperen pasajes relevantes de una base de conocimiento y generen respuestas basadas en ellos.
- Clasificación y generación de respuestas en inglés para soporte al cliente: su capacidad de chat multi-turno permite manejar consultas de usuarios con contexto.
- Prototipado de asistentes con bajo coste computacional: al ser un adaptador LoRA, puede cargarse sobre el modelo base y ajustarse con pocos recursos, ideal para experimentación.
- Sistema de preguntas y respuestas sobre un corpus específico: el adaptador puede usarse con un pipeline RAG para responder preguntas factuales sobre documentos internos.
- Automatización de tareas de redacción o resumen en inglés: aunque no se menciona explícitamente, el modelo base FLAN-T5-large es capaz de realizar tareas de instrucción general, y el adaptador hereda esas capacidades.

## Benchmarks y rendimiento

El autor proporciona métricas de evaluación sobre conjuntos de validación propios del proyecto (300 ejemplos de chat y 160 de RAG). No se reportan benchmarks estándar como MMLU o HumanEval.

| Metrica | Valor |
|---|---|
| Chat token-F1 | 0,5216 |
| RAG token-F1 | 0,8894 |
| RAG exact match | 0,7938 |

Estas métricas son específicas del proyecto y no deben interpretarse como comparables a benchmarks generales. El autor indica que son "métricas de referencia del proyecto, no porcentajes de precisión universales".

## Requisitos de hardware

- El modelo base FLAN-T5-large tiene 783M parámetros, lo que en FP32 requiere aproximadamente 3 GB de VRAM. Con cuantización (por ejemplo, int8) puede reducirse a ~1,5 GB.
- El adaptador LoRA añade solo 18,28M parámetros, por lo que el coste adicional es despreciable.
- El proyecto PathFinder-Ship afirma ejecutarse completamente en CPU usando ONNX, lo que sugiere que el modelo puede correr en hardware sin GPU, aunque con mayor latencia.
- Para inferencia en GPU, una tarjeta con 4 GB de VRAM (como GTX 1650 o RTX 3050) sería suficiente en FP16 o int8.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), o directamente con Transformers y PEFT.
- No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros adaptadores LoRA sobre FLAN-T5 en la información proporcionada. La comparación más directa es con el modelo base `google/flan-t5-large`:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| google/flan-t5-large | 783M | 512 | Apache 2.0 | Modelo base, sin ajuste específico |
| Fatihaybasn/pathfinder-flan-t5-large-second-try-lora | 783M + 18,28M LoRA | No disponible | Apache 2.0 | Adaptador LoRA para chat y RAG |

No se mencionan alternativas de la misma categoría en la información disponible.

## Limitaciones y advertencias

- El adaptador solo se ha evaluado en inglés; su rendimiento en otros idiomas es desconocido.
- Las métricas de evaluación se basan en solapamiento de tokens (token-F1) y coincidencia exacta, que pueden no reflejar calidad semántica o errores factuales.
- El modelo hereda los sesgos y limitaciones del checkpoint base `google/flan-t5-large` y de los datos de entrenamiento utilizados para el ajuste.
- El contexto de entrada está limitado por el modelo base (512 tokens), lo que puede ser insuficiente para documentos largos en tareas RAG.
- No se documentan restricciones adicionales más allá de la licencia Apache 2.0, que permite uso comercial.
- El adaptador está diseñado para un pipeline específico (PathFinder-Ship) y puede no funcionar correctamente fuera de ese contexto sin ajustes.

## Enlaces

- HuggingFace: https://huggingface.co/Fatihaybasn/pathfinder-flan-t5-large-second-try-lora
- Repositorio PathFinder-Ship: https://github.com/fatihaybsn/PathFinder-Ship
- Documentación de FLAN-T5 en Transformers: https://huggingface.co/docs/transformers/model_doc/flan-t5
- Modelo base google/flan-t5-large: https://huggingface.co/google/flan-t5-large
