# j-llm/JA-Engram-117M-Experiment

## Resumen

JA-Engram-117M-Experiment es un modelo de lenguaje japonés de escala reducida publicado por el usuario j-llm en HuggingFace. Se trata de un experimento de investigación que combina un transformer de aproximadamente 33M de parámetros con una tabla de memoria n-gram (Engram) de unos 84M de parámetros y una cabeza de decisión para tareas de elección múltiple, sumando un total de 117,36M de parámetros. El modelo emplea una implementación propia en PyTorch, inspirada conceptualmente en propuestas como DeepSeek Engram, pero no reproduce ningún modelo oficial.

El modelo fue entrenado en dos fases: un preentrenamiento sobre aproximadamente 2B tokens de texto japonés procedente de FineWeb-2-Edu Japanese y un ajuste supervisado (SFT) con 94.950 ejemplos construidos a partir de Swallow-Gemma-Magpie y Aya. Posteriormente se realizó un entrenamiento conjunto con tareas de elección múltiple (JCommonsenseQA y aritmética). El autor publica tanto los pesos como el código, incluyendo los resultados negativos: el rendimiento queda por debajo de modelos de tamaño similar y la calidad de generación libre y conversación es deficiente.

La relevancia del modelo es fundamentalmente metodológica. No está pensado como un asistente conversacional práctico, sino como una plataforma para estudiar la composición de modelos pequeños, la cuantización de tablas de memoria n-gram y el razonamiento de tipo selección frente a generación. El autor advierte explícitamente que no lo recomienda como modelo de chat japonés de uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (8 capas, anchura 384, GQA 6 heads atención / 2 KV heads, SwiGLU, RoPE) + tabla de memoria Engram n-gram + cabeza de decisión |
| Parametros totales | 117.360.912 (33M transformer + 84M Engram + 0,5M fusión + 0,15M cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Engram en 4 bits y 2 bits (tabla de memoria); cuerpo del transformer en punto flotante |
| Idiomas soportados | Japonés (ja) |
| Licencia | other (apache-2.0-and-gemma-terms) |
| Formato de pesos | PyTorch (.pt), código propio; no se indica GGUF ni safetensors |

## Arquitectura y entrenamiento

El cuerpo principal es un transformer decoder-only de 8 capas con anchura 384, atención con grouped-query attention (6 cabezas de atención y 2 de clave/valor), activación SwiGLU y embeddings rotatorios (RoPE). El vocabulario es de 32.768 tokens y la ventana de contexto de 2.048 tokens; la embedding de entrada comparte pesos con la LM head. El componente Engram hashea n-gramas de orden 2 y 3 en dos tablas cada uno y los inyecta en el cuerpo en las capas 2 y 5. La cabeza de decisión lee la pregunta y las opciones y devuelve una puntuación por opción.

El preentrenamiento se realizó sobre aproximadamente 2B tokens derivados de FineWeb-2-Edu Japanese. Después se aplicó SFT con 94.950 ejemplos procedentes de Swallow-Gemma-Magpie-v0.1 y Aya, con una señal de supervisión de unos 37,27M tokens (respuestas y token de fin). El entrenamiento conjunto consistió en 2.000 actualizaciones solo de la cabeza de decisión, seguidas de 5.000 actualizaciones mezclando LM replay, JCommonsenseQA y tareas aritméticas de selección; el checkpoint principal (`joint1000.pt`) corresponde a las 1.000 actualizaciones de esa fase. No se repitió el entrenamiento con múltiples semillas.

El autor documenta varias decisiones e incidencias técnicas: la cuantización del Engram se implementa almacenando las tablas en 4 y 2 bits y restaurando a BF16 solo las filas consultadas; el preentrenamiento original actualizaba pesos en BF16 (con momentos del optimizador en FP32), lo que puede hacer desaparecer actualizaciones pequeñas por redondeo; y los registros de `val_loss` del script antiguo usaban una muestra fija de los datos de entrenamiento, no un conjunto held-out. También se realizó un piloto comparando el tokenizador propio de 32K con el tokenizador v3 de LLM-jp, en el que este último obtuvo un BPB final aproximadamente un 1,53% inferior, aunque con un cuerpo mayor (58,49M frente a 32,83M), por lo que no se puede atribuir la mejora al tokenizador.

## Capacidades

- Generación de texto en japonés, con calidad limitada según el propio autor.
- Razonamiento de tipo selección múltiple: la cabeza de decisión puntúa opciones de respuesta (evaluada en JCommonsenseQA y aritmética de dos dígitos).
- Clasificación de pares de frases mediante verosimilitud de etiquetas (evaluada en JNLI en 0-shot y 3-shot).
- Memoria n-gram Engram para capturar patrones locales de 2 y 3 gramos.
- Cuantización de la tabla de memoria a 4 y 2 bits con impacto mínimo medido en las puntuaciones de selección.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking).
- Multilingüismo: únicamente japonés declarado.

## Casos de uso

- Investigación sobre arquitecturas híbridas transformer + memoria n-gram: el modelo sirve como banco de pruebas reproducible para medir el efecto de añadir tablas Engram a un cuerpo pequeño, comparando BPB con y sin memoria.
- Estudio de cuantización de tablas de embedding: las versiones Engram 4-bit y 2-bit permiten analizar la degradación de métricas (BPB, JCommonsenseQA, JNLI) al comprimir la memoria, con los ficheros de 177,9 MB y 156,9 MB respectivamente frente a 301,7 MB en punto flotante.
- Evaluación de razonamiento por selección frente a generación: el contraste entre el 57,54% en aritmética de selección y el 0% en generación libre de aritmética es un caso de estudio útil para investigar la brecha entre discriminar y generar.
- Reproducción de experimentos de bajo coste en una sola GPU: el modelo cabe y se entrena en una RTX 3090 según la documentación, lo que facilita replicar el pipeline completo de preentrenamiento, SFT y entrenamiento conjunto.
- Análisis de calibración de modelos pequeños: el autor reporta resultados de Brier score y ECE para distintas estrategias de calibración, útiles para estudiar la fiabilidad de las puntuaciones en modelos de escala reducida.
- Docencia y formación en ingeniería de LLM: el repositorio incluye los scripts de evaluación, los JSON de resultados y las condiciones experimentales, lo que lo convierte en material didáctico sobre cómo documentar resultados negativos y protocolos de evaluación.

## Benchmarks y rendimiento

Evaluación principal en japonés sobre los pesos publicados (datos del autor):

| Modelo | LM BPB ↓ | JCommonsenseQA ↑ | JNLI 3-shot ↑ | JNLI 3-shot macro-F1 ↑ | JNLI 0-shot ↑ |
|---|---:|---:|---:|---:|---:|
| joint1000 (principal) | 1,081391 | 52,81% | 45,06% | 0,3470 | 34,69% |
| joint5000 (final) | 1,069406 | 56,60% | 35,65% | 0,2433 | 35,49% |
| joint1000 Engram 4-bit | 1,081523 | 52,95% | 45,10% | 0,3468 | 34,89% |
| joint1000 Engram 2-bit | 1,093712 | 52,75% | 46,81% | 0,3553 | 36,36% |
| Engram 117M solo preentrenamiento | 1,024941 | no medido | 50,48% | 0,2950 | 32,10% |
| Backbone 33M solo preentrenamiento | 1,041784 | no medido | 39,51% | 0,2601 | 30,98% |

Comparación de BPB con modelos existentes (solo preentrenamiento, mismo corpus de 220 documentos y 619.479 bytes UTF-8):

| Categoría | Modelo | Parámetros totales | BPB ↓ |
|---|---|---:|---:|
| Tamaño de cuerpo | JA-Backbone-33M | 32,83M | 1,029758 |
| Tamaño de cuerpo | rinna/japanese-gpt2-xsmall | 37,40M | 0,916555 |
| Tamaño total | JA-Engram-117M | 117,36M | 1,014094 |
| Tamaño total | rinna/japanese-gpt2-small | 110,42M | 0,806208 |
| Tamaño total | llm-jp/llm-jp-3-150m | 152,32M | 0,844785 |

Según el autor, el cuerpo de 33M tiene un BPB aproximadamente un 12,35% superior al de rinna 37M; el Engram de 117M está un 25,79% por encima de rinna 110M y un 20,04% por encima de LLM-jp 152M. Estas cifras son diferencias relativas de pérdida, no de capacidad global.

Piloto de tokenizador (mismo corpus de 92.838 documentos y 396.250.996 bytes, 1 epoch, RTX 3090):

| Progreso | 32K actual (117,36M) | v3 nativo (143,02M) |
|---|---:|---:|
| 0% | 3,037758 | 3,137269 |
| 25% | 1,541448 | 1,525941 |
| 50% | 1,403973 | 1,381693 |
| 75% | 1,349743 | 1,328984 |
| 100% | 1,328392 | 1,308022 |

Latencia medida en RTX 3090, batch 1, BF16, sin KV cache: inferencia pointer del candidato principal con mediana de 14,881 ms y percentil 95 de 22,772 ms (32 preguntas, 15 correctas). Generación libre de texto con mediana de 1.976,613 ms, pero con 0 respuestas correctas, por lo que no se puede calcular una relación de velocidad con la misma calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero en punto flotante ocupa 301,7 MB; la versión Engram 4-bit, 178,0 MB; la versión Engram 2-bit, 157,0 MB. Con overhead de runtime, el modelo cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: el autor ejecutó entrenamiento y evaluación en una RTX 3090. Para inferencia basta una GPU consumer modesta (RTX 3060, RTX 4060 o superior); para entrenamiento se recomienda una RTX 3090 o superior.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 2 GB de VRAM.
- Opciones de despliegue: al ser una implementación PyTorch propia con código personalizado, no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El despliegue requiere cargar los checkpoints `.pt` con el código del repositorio.
- Latencia y throughput: mediana de 14,881 ms por consulta de selección en RTX 3090 (batch 1, BF16, sin KV cache); generación libre con mediana de 1.976,613 ms por secuencia en las condiciones del autor. No se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BPB (corpus del autor) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| JA-Engram-117M-Experiment | 117,36M | 2.048 | 1,014094 | apache-2.0-and-gemma-terms | HuggingFace, código propio |
| rinna/japanese-gpt2-small | 110,42M | no disponible | 0,806208 | no disponible en la información | HuggingFace |
| llm-jp/llm-jp-3-150m | 152,32M | no disponible | 0,844785 | no disponible en la información | HuggingFace |
| rinna/japanese-gpt2-xsmall | 37,40M | no disponible | 0,916555 | no disponible en la información | HuggingFace |

El modelo no supera a ninguno de los comparables en BPB según los datos del propio autor. Su interés comparativo reside en la arquitectura híbrida con memoria Engram y en la cabeza de selección, no en el rendimiento bruto.

## Limitaciones y advertencias

- Rendimiento inferior a modelos de tamaño similar: el autor indica explícitamente que queda por debajo de los SLM comparados, con especiales carencias en generación libre y conversación.
- Calidad conversacional deficiente: en las 12 preguntas fijas de conversación la puntuación objetiva fue 0 y se observaron repeticiones.
- Generación aritmética libre fallida: 0 coincidencias exactas en generación libre, frente a un 57,54% en selección de dos dígitos; la capacidad de elegir no se traslada a la de generar.
- Brecha entre selección y generación: los buenos resultados en tareas de elección múltiple no implican capacidad generativa equivalente.
- BPB peor tras SFT y entrenamiento conjunto que en el modelo solo preentrenado (1,081 frente a 1,025 en el candidato principal).
- JNLI 0-shot por debajo del baseline de etiqueta mayoritaria (34,69% frente a 54,43%); en 3-shot supera el baseline en macro-F1 pero no en exactitud.
- Posible pérdida de actualizaciones por redondeo: el preentrenamiento original actualizaba pesos en BF16, lo que podría eliminar actualizaciones pequeñas; el efecto no se ha medido.
- Validación incompleta: no se repitió el entrenamiento con múltiples semillas ni se realizó comparación ciega por humanos.
- Datos de evaluación limitados: el corpus de comparación es de 220 documentos y el de validación de 256 ventanas; no se auditó la superposición con los datos de entrenamiento de los modelos externos.
- Contexto corto (2.048 tokens) e idioma único (japonés).
- Licencia mixta (Apache 2.0 y términos de Gemma): es necesario revisar las condiciones de uso comercial derivadas del componente Gemma antes de un despliegue en producción.
- El autor no recomienda su uso como modelo de chat japonés práctico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/j-llm/JA-Engram-117M-Experiment
- Resultados de evaluación principal: evaluation-small-ja.json (en el repositorio del modelo)
- Comparación con modelos base: comparison-bases.json y comparison-protocol.json (en el repositorio del modelo)
- Piloto de tokenizador: tokenizer-pilot.json (en el repositorio del modelo)
- Resultados de latencia: evaluation-latency.json (en el repositorio del modelo)
- rinna/japanese-gpt2-xsmall: https://huggingface.co/rinna/japanese-gpt2-xsmall
- rinna/japanese-gpt2-small: https://huggingface.co/rinna/japanese-gpt2-small
- llm-jp/llm-jp-3-150m: https://huggingface.co/llm-jp/llm-jp-3-150m
- Dataset de preentrenamiento: hotchpotch/fineweb-2-edu-japanese
- Dataset de SFT: tokyotech-llm/swallow-gemma-magpie-v0.1
- Dataset de SFT: CohereLabs/aya_dataset
