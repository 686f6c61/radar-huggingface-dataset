# Q-P1NG/multilingual-reranker-small-LiteRT

## Resumen

multilingual-reranker-small-LiteRT es una conversión al formato LiteRT (TFLite) del modelo Horizon-Labs/multilingual-reranker-small v1.2, un cross-encoder multilingüe de 141 millones de parámetros basado en la arquitectura mmBERT-small. Lo publica el usuario Q-P1NG y su función es puntuar la relevancia de un pasaje respecto a una consulta, es decir, actuar como reranker en pipelines de recuperación de información (RAG, búsqueda documental). El modelo original asigna una puntuación (logit, convertible a probabilidad 0-1 mediante sigmoide) a cada par pregunta-pasaje.

La relevancia de esta versión concreta está en su orientación a despliegue en dispositivo: se distribuye como un archivo `.tflite` de aproximadamente 147 MB con cuantización int8 dinámica y una ventana fija de 512 tokens, pensado para ejecutarse en la CPU de un teléfono mediante LiteRT 2.3. El autor lo emplea para ordenar los pasajes recuperados por su archivo local, sustituyendo a la variante GGUF que ejecutaba sobre llama.cpp.

El repositorio incluye además un fichero de vocabulario en formato GGUF (sin tensores) que permite tokenizar los pares con llama.cpp en modo `vocab_only`, evitando depender de un tokenizador en Python o Rust en el dispositivo. La licencia es Apache-2.0, igual que el modelo base, y los idiomas declarados son multilingüe con cobertura explícita de italiano, inglés, alemán, francés, español y portugués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en mmBERT-small (transformer encoder) |
| Parametros totales | 141M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (ventana fija del modelo convertido) |
| Tipos de cuantizacion | int8 dinámica (dynamic range quantization) sobre el modelo base en FP32 |
| Idiomas soportados | multilingüe; it, en, de, fr, es, pt declarados explícitamente |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT/TFLite (`.tflite`); vocabulario en GGUF sin tensores |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe el par `[BOS] pregunta [EOS] pasaje [EOS]` y produce un único logit de relevancia, en lugar de embeddings independientes como haría un bi-encoder. La arquitectura subyacente es mmBERT-small, con 141 millones de parámetros, y la conversión mantiene las entradas `input_ids` y `attention_mask` como int32 con forma `[1, 512]`. El pasaje se trunca para encajar en la ventana de 512 tokens y el relleno se hace con el id 0, enmascarado.

Según la model card, el modelo original se entrenó con texto web de licencia abierta (FineWeb y FineWeb-2, ODC-BY), MIRACL (Apache-2.0) y WebFAQ (CC-BY-4.0), y las etiquetas de entrenamiento provienen de Qwen3-Reranker-4B (Apache-2.0). No se detallan en la información disponible el número exacto de tokens de entrenamiento ni si hubo etapas de RLHF o DPO. La innovación técnica de esta conversión es doble: la cuantización int8 dinámica, que reduce el coste de inferencia en CPU, y el empaquetado del vocabulario como GGUF sin tensores para tokenizar en el dispositivo con llama.cpp de forma idéntica al tokenizador original.

## Capacidades

- Puntuación de relevancia pregunta-pasaje (text-ranking) mediante un logit; la sigmoide del logit da una probabilidad entre 0 y 1.
- Reranking multilingüe en italiano, inglés, alemán, francés, español y portugués, además de la cobertura multilingüe general del modelo base.
- Ejecución en CPU de dispositivos móviles mediante LiteRT 2.3 (`CompiledModel`).
- Tokenización en el propio dispositivo con llama.cpp en modo `vocab_only`, sin dependencias de Python ni Rust.
- Integración en pipelines de recuperación como segunda etapa tras un retriever (bi-encoder o búsqueda léxica).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no tiene modo thinking, visión ni audio.

## Casos de uso

- RAG en aplicaciones móviles offline: el modelo reordena los pasajes recuperados por un índice local antes de pasarlos a un LLM generativo, ejecutándose en la CPU del teléfono sin conexión.
- Búsqueda documental personal: ordenar fragmentos de PDFs o notas del usuario por relevancia respecto a una consulta, como hace el autor con su archivo, con una ventana de 512 tokens suficiente para pasajes cortos.
- Filtrado de candidatos en sistemas de preguntas y respuestas: dado un conjunto de 10-50 pasajes recuperados, seleccionar los tres primeros para reducir el contexto enviado al generador y el coste de inferencia.
- Asistentes de atención al cliente multilingües: puntuar respuestas candidatas de una base de conocimiento en español, italiano, francés, alemán, portugués o inglés antes de mostrarlas.
- Preprocesado de datasets de evaluación de recuperación: generar puntuaciones de relevancia para pares pregunta-pasaje en varios idiomas sin depender de infraestructura GPU.
- Aplicaciones de escritorio o embebidas con restricciones de memoria: el archivo de 147 MB y la inferencia en CPU lo hacen viable en entornos donde no se puede desplegar un reranker de mayor tamaño.
- Deduplicación y ordenación de resultados en motores de búsqueda internos: usar el logit como señal de ranking para desempatar resultados de un retriever léxico.

## Benchmarks y rendimiento

La model card incluye una evaluación propia sobre 38 preguntas en italiano e inglés acerca de dos PDFs, con 10 pasajes candidatos por pregunta (el que contiene la respuesta y los 9 más similares), comparando la versión int8 con el modelo original en FP32 (LiteRT 2.3, CPU de portátil, 8 hilos):

| Metrica | FP32 | Este modelo (int8) |
|---|---|---|
| Mismo mejor pasaje que FP32 | — | 37 / 38 |
| Mismos tres primeros | — | 94% |
| Pasaje con la respuesta en primera posición / en las tres primeras | 31 / 34 | 32 / 34 |
| Segundos por par | 0.41 | 0.13 |

Además, la tokenización con llama.cpp a partir del fichero de vocabulario fue idéntica a la de transformers en los 380 pares, tanto a 512 como a 128 tokens. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BEIR u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para el despliegue previsto; el modelo está pensado para CPU. El archivo `.tflite` ocupa aproximadamente 147 MB y el vocabulario GGUF unos 15 MB.
- GPU recomendadas: no disponibles; la conversión está orientada a LiteRT en CPU. Para el modelo base en FP32 se requeriría una GPU convencional, pero no se especifican modelos concretos.
- Cabe en cualquier dispositivo con al menos ~200 MB de memoria libre para los ficheros, incluidos teléfonos de gama media; no requiere GPU de consumo.
- Opciones de despliegue: LiteRT 2.3 (`CompiledModel`) para el `.tflite`; llama.cpp en modo `vocab_only` para la tokenización con el fichero de vocabulario. No hay variante para vLLM, TGI u Ollama.
- Latencia y throughput: 0.13 segundos por par en CPU de portátil con 8 hilos según la medición del autor; el rendimiento en CPU de teléfono no se detalla en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| multilingual-reranker-small-LiteRT (este) | 141M | 512 tokens | LiteRT int8 + vocab GGUF | Apache-2.0 | Optimizado para CPU móvil; evaluación propia limitada a 38 preguntas |
| Horizon-Labs/multilingual-reranker-small (base) | 141M | no disponible | safetensors (FP32) | Apache-2.0 | Referencia de calidad; 0.41 s por par en la medición del autor |
| Q-P1NG/multilingual-reranker-small-GGUF | 141M | no disponible | GGUF (Q8_0) | Apache-2.0 | Variante para llama.cpp citada por el autor como alternativa previa |
| Qwen3-Reranker-4B | 4B | no disponible | no disponible | Apache-2.0 | Modelo que generó las etiquetas de entrenamiento; mucho mayor y no apto para CPU móvil |

## Limitaciones y advertencias

- Ventana fija de 512 tokens: los pasajes más largos se truncan, lo que puede eliminar la parte relevante del texto.
- Evaluación muy reducida (38 preguntas sobre dos PDFs en italiano e inglés); no hay validación publicada en otros idiomas declarados ni en benchmarks estándar de recuperación.
- Al ser un cross-encoder, el coste crece linealmente con el número de pares pregunta-pasaje; no es adecuado para recuperar sobre corpus grandes sin una etapa previa de filtrado.
- Riesgo de sesgo heredado del modelo base y de sus datos de entrenamiento (texto web, MIRACL, WebFAQ) y de las etiquetas generadas por Qwen3-Reranker-4B, que pueden introducir preferencias del modelo etiquetador.
- No es un modelo generativo: no puede responder preguntas ni producir texto, solo puntuar pares.
- El logit no está calibrado como probabilidad; la sigmoide da un valor 0-1 pero su interpretación absoluta no está validada en la información disponible.
- Dependencia de LiteRT 2.3 y de llama.cpp para la tokenización; no hay soporte documentado para otros runtimes.
- Licencia Apache-2.0 permite uso comercial, pero se deben conservar los ficheros LICENSE y NOTICE del modelo base y la atribución a mmBERT-small (MIT).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Q-P1NG/multilingual-reranker-small-LiteRT
- Modelo base: https://huggingface.co/Horizon-Labs/multilingual-reranker-small
- Variante GGUF del mismo autor: https://huggingface.co/Q-P1NG/multilingual-reranker-small-GGUF
- Ficheros de conversión y licencia incluidos en el repositorio: `multilingual-reranker-small-CONVERSION.txt`, `multilingual-reranker-small-LICENSE.txt`, `multilingual-reranker-small-NOTICE.txt`
- Herramientas de conversión: repositorio Q-P1NG, directorio `tools/litert` (no se proporciona URL directa en la información disponible)
