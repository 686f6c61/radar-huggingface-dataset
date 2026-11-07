# Nicolassuez/t5-small-commitbench

## Resumen

`Nicolassuez/t5-small-commitbench` es un modelo de generación de mensajes de commit obtenido mediante fine-tuning de `google-t5/t5-small` sobre el dataset CommitBench. Dado un diff de git, el modelo produce el mensaje de commit que describe el cambio. El repositorio es un espejo sin modificar de los ficheros de `thealper2/t5-small-commitbench` en la revisión `d17f8b367741834411f2ad160c3a2438f9e2a92f`, mantenido para que el proyecto aSup no dependa de un repositorio de terceros.

Arquitecturalmente es un transformer encoder-decoder en la variante T5, con 60.506.624 parámetros (unos 60,5 millones) y una ventana de entrada limitada a 512 tokens y de salida a 64 tokens. No es un modelo de propósito general: está especializado en una tarea text-to-text muy concreta, la summarización de diffs de código en forma de mensaje de commit, y su utilidad práctica depende de integrarlo en un pipeline de control de versiones.

Su relevancia es acotada: sirve como referencia ligera (0,2 GB de repositorio) para tareas de automatización de mensajes de commit, pero sus métricas de solapamiento léxico son modestas (ROUGE-1 de 19,31 y BLEU de 2,148 en el split de test) y el propio autor advierte de que parte de la puntuación refleja familiaridad con el estilo de commit de los repositorios, no generalización real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parámetros totales | 60.506.624 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrada, 64 tokens de salida (límites de entrenamiento) |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en precisión completa; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de `google-t5/t5-small`, un transformer encoder-decoder con vocabulario SentencePiece. El fine-tuning se realizó sobre los splits oficiales de `Maxscha/commitbench`, usando 500.000 ejemplos de entrenamiento de los 1.165.213 disponibles y 2.000 ejemplos de validación de los 249.689 disponibles; el split de test (249.688 ejemplos) no se usó para entrenar. El dataset cubre Python, JavaScript, PHP, Ruby, Java y Go.

La configuración de entrenamiento fue: batch size efectivo de 32 (batch por dispositivo 32, sin acumulación de gradientes), learning rate de 3e-05 con scheduler lineal y warmup ratio de 0,05, weight decay de 0,01, gradient clipping de 1,0, optimizador AdamW, precisión mixta bf16, semilla 42 y 2 épocas. El entrenamiento duró 1,219 horas en una NVIDIA GeForce RTX 5060 Ti de 15,9 GB. La longitud máxima de fuente se fijó en 512 tokens y la de destino en 64; según las mediciones del autor, el 0,7% de los diffs superan los 512 tokens y el 4,47% de los mensajes de commit superan los 64 tokens. La pérdida final de entrenamiento fue de 3,5762 y la mejor de validación de 3,2414. No se documenta RLHF ni DPO.

## Capacidades

- Generación de mensajes de commit a partir de un diff de git, con el formato de entrada `generate commit message: <git diff>`.
- Generación text-to-text determinista por defecto (`do_sample=False`), con búsqueda por haz (`num_beams=4`) y `no_repeat_ngram_size=3`.
- Comprensión de diffs en Python, JavaScript, PHP, Ruby, Java y Go, los seis lenguajes cubiertos por CommitBench.
- Resumen de cambios de código a nivel léxico, útil para descripciones cortas (media de 5,005 palabras generadas frente a 11,27 de referencia).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés; el resto de idiomas no está probado.

## Casos de uso

- Automatización de mensajes de commit en hooks de git: el modelo puede invocarse desde un `pre-commit` o `commit-msg` hook que reciba el diff staged y proponga un mensaje, dado su tamaño reducido (60,5 M de parámetros) y su latencia baja en CPU o GPU consumer.
- Generación de borradores en revisiones de código: en pipelines de CI, el modelo puede adjuntar un mensaje sugerido a cada pull request para que el revisor lo edite, reduciendo el tiempo dedicado a redactar descripciones.
- Etiquetado de historiales de repositorio: procesar commits antiguos sin mensaje útil y generar descripciones normalizadas para herramientas de búsqueda o analítica de repositorios.
- Enriquecimiento de changelogs: agrupar diffs por release y generar entradas breves de changelog a partir de los mensajes producidos, siempre con revisión humana por la baja precisión exacta (0,04 de exact match).
- Docencia y prototipado: servir como ejemplo didáctico de fine-tuning de T5 para tareas de summarization de código, con una configuración de entrenamiento reproducible documentada paso a paso.
- Filtrado y clasificación de cambios: usar el mensaje generado como señal auxiliar para clasificar commits (por ejemplo, detectar cambios de versión o de dependencias) en herramientas internas de ingeniería.
- Integración en asistentes de IDE: sugerir el mensaje de commit en el panel de control de versiones de un editor, aprovechando el formato de pesos safetensors y la compatibilidad con `transformers` y text-generation-inference.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test (20.000 ejemplos), con `num_beams=4`:

| Métrica | Valor |
|---|---|
| ROUGE-1 | 19,31 |
| ROUGE-2 | 4,668 |
| ROUGE-L | 17,42 |
| ROUGE-Lsum | 17,42 |
| BLEU | 2,148 |
| Exact match | 0,04 |
| Longitud media generada (palabras) | 5,005 |
| Longitud media de referencia (palabras) | 11,27 |

Desglose por lenguaje:

| Lenguaje | n | ROUGE-1 | ROUGE-2 | ROUGE-L | BLEU | Exact match |
|---|---|---|---|---|---|---|
| Python | 5.722 | 21,20 | 6,05 | 19,29 | 2,73 | 0,04 |
| JavaScript | 4.468 | 18,86 | 4,05 | 17,07 | 2,01 | 0,02 |
| PHP | 3.489 | 17,04 | 3,46 | 15,29 | 1,64 | 0,09 |
| Ruby | 2.808 | 22,08 | 5,79 | 19,65 | 2,44 | 0,04 |
| Java | 1.799 | 15,19 | 2,61 | 13,58 | 1,02 | 0,06 |
| Go | 1.714 | 18,65 | 4,45 | 16,75 | 2,11 | 0,00 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor advierte de que ROUGE y BLEU son métricas de solapamiento léxico y no capturan por completo si el mensaje describe correctamente el cambio.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,25 GB en fp32 (60,5 M de parámetros × 4 bytes), aproximadamente 0,12 GB en fp16/bf16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 5060 Ti, etc.) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las gamas actuales, incluidas las de 4 GB de VRAM.
- Opciones de despliegue: `transformers` (con `AutoModelForSeq2SeqLM`), text-generation-inference (el repo está marcado como compatible con endpoints), y exportación a otros runtimes no documentada.
- Latencia y throughput estimados: no disponibles de forma oficial; el entrenamiento completo de 2 épocas sobre 500.000 ejemplos tardó 1,219 horas en una RTX 5060 Ti, lo que da una idea del orden de magnitud del coste por paso, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nicolassuez/t5-small-commitbench | 60,5 M | 512 entrada / 64 salida | Generación de mensajes de commit | Apache 2.0 | Hugging Face |
| thealper2/t5-small-commitbench | 60,5 M | 512 entrada / 64 salida | Generación de mensajes de commit | Apache 2.0 | Hugging Face |
| google-t5/t5-small | 60,5 M | 512 | Text-to-text general | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de generación de mensajes de commit en la información proporcionada.

## Limitaciones y advertencias

- CommitBench sustituye literales identificativos por tokens placeholder: todos los diffs contienen `<HASH>` en lugar de hashes de commit, y el 26,5% de los mensajes de referencia contienen `<I>` (números), `<URL>` o `<EMAIL>`. El modelo reproduce estos tokens en su salida (por ejemplo, `Bumped version to <I>`), lo que puede requerir post-procesado.
- El vocabulario SentencePiece de T5 no cubre todos los caracteres del código fuente (llaves, barras invertidas, ángulos), por lo que aproximadamente el 2,35% de los tokens de entrada se convierten en `<unk>`, limitando la precisión con la que el modelo lee el diff.
- Los diffs de más de 512 tokens se truncan y la parte final del cambio no es visible para el modelo.
- Los splits de CommitBench son aleatorios sobre commits, no sobre repositorios: el 98,6% de los ejemplos de test provienen de repositorios que también aparecen en entrenamiento. Las puntuaciones reflejan en parte familiaridad con el estilo de commit de un proyecto, no generalización a código no visto.
- El dataset es solo en inglés y cubre seis lenguajes; el comportamiento en otros lenguajes o en cambios multi-fichero muy grandes no está probado.
- CommitBench se distribuye bajo CC BY-NC 4.0, lo que restringe el uso comercial de los datos; aunque los pesos del modelo son Apache 2.0, conviene revisar la implicación de la licencia del dataset en un despliegue comercial.
- Riesgo de alucinación: al ser un modelo generativo de 60,5 M de parámetros, puede producir mensajes genéricos o incorrectos; el exact match de 0,04 indica que rara vez coincide exactamente con el mensaje de referencia.
- No se documentan sesgos específicos más allá de los derivados del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nicolassuez/t5-small-commitbench
- Modelo original: https://huggingface.co/thealper2/t5-small-commitbench
- Modelo base: https://huggingface.co/google-t5/t5-small
- Dataset: https://huggingface.co/datasets/Maxscha/commitbench
- Perfil del autor: https://huggingface.co/Nicolassuez
