# gjtgjt/Muse-Glimmer-30B-heretic-r2

## Resumen

Muse-Glimmer-30B-heretic-r2 es una variante "decensored" del modelo multimodal Muse-Glimmer-30B, desarrollada por el usuario gjtgjt mediante la técnica de ablación residual rank-1 (Heretic). El objetivo es eliminar las direcciones de rechazo (refusal) en los pesos del modelo, reduciendo la probabilidad de que se niegue a responder a peticiones que el modelo original consideraría dañinas o inapropiadas. No se trata de un fine-tune, sino de una edición de pesos basada en la diferencia estadística entre activaciones ante prompts dañinos e inofensivos.

El modelo mantiene la arquitectura del base: un transformer denso de 30B parámetros, con entrada multimodal (imagen y texto) y salida de texto. Se distribuye en 13 shards de safetensors en BF16, con un tamaño de repositorio de 40 GB (la card indica ~56 GB para los pesos completos). La licencia es Apache-2.0, aunque el modelo base tiene su propia política de uso que debe respetarse. Esta versión corresponde a la segunda ronda de ablación (heretic-r2), que refina la primera (heretic-plus) editando únicamente los residual writers de `attn.o_proj`.

La relevancia de este modelo radica en su aplicación para entornos donde se requiere un asistente menos restrictivo, como la investigación en seguridad de IA o la generación de contenido creativo sin filtros. Sin embargo, su uso conlleva riesgos éticos y legales que se detallan en las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Muse-Glimmer-30B) |
| Parametros totales | 30B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor indica que no es GGUF; solo safetensors en BF16) |
| Idiomas soportados | Ingles, chino (en, zh) |
| Licencia | Apache-2.0 (con politica de uso del modelo base) |
| Formato de pesos | safetensors (13 shards, BF16) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de `meta-models/Muse-Glimmer-30B`, un transformer denso de 30B parámetros con capacidad multimodal (imagen-texto a texto). No se dispone de detalles sobre la arquitectura interna del base (número de capas, heads, etc.) ni sobre su proceso de entrenamiento original (dataset, número de tokens, técnicas de alineación como RLHF o DPO). El autor solo documenta el proceso de ablación aplicado.

La técnica empleada es Heretic rank-1, que consiste en calcular un vector de dirección `r = mean(activaciones en prompts dañinos) - mean(activaciones en prompts inofensivos)` y eliminarlo de los residual writers del modelo. En esta segunda ronda (heretic-r2), se parte de la versión `heretic-plus` (primera ronda) y se recalcula `r` a través de ella. Se realizan 120 pruebas de búsqueda de hiperparámetros (Optuna) y se selecciona el trial 89, que edita únicamente `attn.o_proj` con una dirección interpolada (índice 26.01). No se modifican ni el vision encoder, ni los embeddings, ni `attn.gate_proj`. El chat template, tokenizer y processor se copian del modelo base.

Los resultados de la evaluación interna del autor muestran una reducción de la tasa de rechazo (medida por palabras clave) de 98/100 en el original a 14/100 en esta versión, con una divergencia KL de 0.125 frente al original y de 0.002 frente a `heretic-plus`. La tercera ronda no se ejecutó porque la mejora incremental fue de solo 1 punto, por debajo del umbral predefinido de 3.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base, aunque no se especifican detalles concretos (matematicas, codigo, etc.).
- Multimodal: acepta entradas de imagen y texto, y produce texto (pipeline `image-text-to-text`).
- Soporte de tool calling: el template de chat incluye el prefijo `to=<tool>` para llamadas a herramientas, lo que sugiere compatibilidad con function calling.
- Multilingue: soporta ingles y chino.
- Modo "uncensored": reduccion significativa de rechazos en respuestas a peticiones que el modelo original consideraria dañinas, gracias a la ablacion de direcciones de refusal.
- Conversacional: el template de chat soporta turnos con destinatarios (`self`, `user`, `tool`), lo que permite razonamiento interno y respuestas al usuario.

## Casos de uso

- Asistentes conversacionales sin restricciones de contenido: el modelo puede mantener conversaciones multi-turno sobre temas sensibles sin negarse a responder, gracias a la eliminacion de las direcciones de rechazo. Es adecuado para entornos de investigacion donde se necesita explorar respuestas a prompts controvertidos.
- Generacion de contenido creativo: escritores o creadores pueden usarlo para generar narrativas, dialogos o ideas que otros modelos bloquearian por politicas de seguridad. La reduccion de rechazos permite un flujo de trabajo mas fluido.
- Investigacion en seguridad de IA: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparandolo con el original para analizar como afecta la ablacion a la calidad y a la seguridad de las respuestas.
- Aplicaciones multimodales: al ser un modelo imagen-texto a texto, puede utilizarse para tareas como descripcion de imagenes, respuesta a preguntas visuales o generacion de texto a partir de contenido visual, en ingles o chino.
- Desarrollo de agentes con tool calling: el soporte de prefijos `to=<tool>` permite integrarlo en pipelines de agentes que necesitan llamar a APIs o ejecutar acciones, aunque no se ha probado formalmente su fiabilidad en este ambito.
- Traduccion y generacion bilingue: con soporte para ingles y chino, puede emplearse en sistemas de traduccion automatica o en asistentes que requieran cambiar de idioma en una misma conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona solo metricas internas de evaluacion del proceso de ablacion, que se resumen a continuacion:

| Checkpoint | Keywords / 100 | KL vs original | KL vs plus |
|---|---|---|---|
| Original Muse-Glimmer-30B | 98 | 0 | — |
| heretic-plus (ronda 1) | 15 | 0.125 | 0 |
| **heretic-r2 (este modelo)** | **14** | **0.125** | **0.002** |

Estas metricas se obtuvieron con el protocolo de evaluacion de Heretic (100 prompts de `mlabonne/harmful_behaviors`, decodificacion greedy, prefijo fijado ` to=user<|message|>`). No son comparables con benchmarks de calidad general, por lo que no se puede valorar el rendimiento del modelo en tareas estandar.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 56 GB (segun la card), por lo que se requiere una GPU con al menos 56 GB de VRAM para inferencia sin cuantizacion. El repositorio indica 40 GB, posiblemente comprimido, pero los pesos reales son ~56 GB.
- GPUs recomendadas: NVIDIA A100 (80 GB), H100 (80 GB), o multiples GPUs con tensor parallelism. No cabe en GPUs de consumo como RTX 4090 (24 GB) sin cuantizacion, y no se ofrecen versiones cuantizadas (GGUF, AWQ, etc.).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o directamente con la libreria `transformers`. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dado el tamano, se espera una latencia de varios segundos por generacion en una A100, pero no hay datos oficiales.

## Comparativa con modelos similares

La comparativa se limita a las variantes del mismo autor, ya que no se dispone de datos de otros modelos "uncensored" de tamano similar.

| Modelo | Parametros | Contexto | Keywords/100 | KL vs original | Licencia |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | 30B | No disponible | 98 | 0 | Apache-2.0 |
| Muse-Glimmer-30B-heretic-plus | 30B | No disponible | 15 | 0.125 | Apache-2.0 |
| **Muse-Glimmer-30B-heretic-r2** | **30B** | **No disponible** | **14** | **0.125** | **Apache-2.0** |

No se han encontrado modelos comparables de otros autores con caracteristicas similares en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos y contenido dañino: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita. Esto supone un riesgo significativo en entornos de produccion y requiere supervision humana.
- Alucinacion: no se dispone de datos sobre la tasa de alucinacion. La ablacion de pesos puede afectar a la coherencia factual en algunos dominios, aunque no hay evidencia en la documentacion.
- Limitaciones de contexto: se desconoce la longitud maxima de contexto soportada. El modelo base podria tener limitaciones, pero no se especifican.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el modelo base tiene una politica de uso (USAGE_POLICY.md) que debe respetarse. El autor no detalla dicha politica, por lo que se recomienda consultarla antes de cualquier uso comercial.
- Calidad general no evaluada: no se han publicado benchmarks estandar, por lo que no se puede garantizar el rendimiento en tareas tipicas de LLM (razonamiento, codigo, etc.). La edicion de pesos puede degradar capacidades no relacionadas con el rechazo.
- Soporte limitado: el autor no ofrece garantias ni mantenimiento. El modelo tiene 0 descargas y 0 likes en el momento de la redaccion, lo que indica una adopcion minima.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/gjtgjt/Muse-Glimmer-30B-heretic-r2
- Modelo base (Muse-Glimmer-30B): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio de Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Politica de uso del modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B/blob/main/USAGE_POLICY.md
