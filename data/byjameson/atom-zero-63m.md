# byjameson/atom-zero-63m

## Resumen

Atom Zero 63M es un checkpoint de investigación publicado por el desarrollador independiente byjameson bajo el identificador `byjameson/atom-zero-63m`. Se trata de una versión ampliada en profundidad (depth-upcycled) del checkpoint base Atom Zero de 49,2M de parámetros, que pasa de 6 a 8 capas mediante copias interpoladas de bloques y un ajuste fino completo sobre un currículo de tareas de copia más 153 filas verificadas de un modelo profesor. El autor lo etiqueta explícitamente como artefacto de investigación y no como la base del producto, que sigue siendo `atom-zero-49m` en su versión `0.8.0`.

El modelo es un transformer decoder-only denso de 63.389.184 parámetros, dimensión 768, 12 cabezas de atención, vocabulario BPE de 8192 tokens y una longitud máxima de secuencia de 512 tokens. Su propósito declarado no es la conversación general ni el razonamiento, sino evaluar hasta qué punto el upcycling de profundidad mejora una capacidad muy concreta: copiar claves y valores dentro de una gramática restringida de claves alfanuméricas en minúsculas de 3 a 6 caracteres.

Su relevancia es acotada pero real para quien investiga técnicas de expansión de arquitecturas pequeñas: los resultados held-out muestran una mejora sustancial frente al estudiante destilado de 49M en la misma tarea (por ejemplo, 65,5% de exactitud frente a 0% en la etapa 4short), aunque el propio autor documenta un fallo total (0/30) fuera de distribución con claves prefijadas `field_` y `k_`. La licencia Apache 2.0 facilita su reutilización experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (implementación `TransformerLM` del paquete `atomzero`) |
| Parámetros totales | 63.389.184 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (`max_seq`) |
| Tipos de cuantización | no disponible (solo se distribuye el state dict en `model.pt`; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (tokenizador `chat_en_bpe8k.json`, presumiblemente orientado a inglés, sin declaración oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`model.pt`) con claves `config` y `state`; tokenizador en JSON (`chat_en_bpe8k.json`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de 8 capas, dimensión 768, 12 cabezas de atención y capa feed-forward de dimensión no especificada en la model card (se pasa como `cfg["ff"]` al constructor). El punto de partida es el checkpoint Atom Zero de 49,2M con 6 capas: el upcycling introduce dos capas adicionales mediante copias interpoladas de bloques, lo que eleva el recuento a 8 capas y 63,4M de parámetros. El vocabulario es un BPE de 8192 tokens y la ventana de contexto está fijada en 512 tokens.

El ajuste fino se realizó durante 3000 pasos con learning rate 5e-5, batch de 4, peso de contenido 2 y ejecución en una GPU doméstica ("host GPU"). El conjunto de entrenamiento combina el currículo de copia con 153 filas verificadas procedentes de un modelo profesor. No se documentan número total de tokens, composición detallada del dataset, ni fases de RLHF o DPO. La innovación técnica destacable es precisamente el procedimiento de depth upcycling con interpolación de bloques y su evaluación controlada sobre una tarea sintética de copia, con protocolo held-out de 200 filas por etapa.

## Capacidades

- Copia de claves y valores dentro de una gramática restringida: claves alfanuméricas en minúsculas de 3 a 6 caracteres, según el protocolo de evaluación del autor.
- Generación de texto autoregresiva básica propia de un transformer decoder-only de 63M, sin evaluación publicada de calidad general.
- No hay evidencia publicada de razonamiento, matemáticas, código, visión ni audio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor lo excluye explícitamente del alcance del modelo.
- Capacidades multilingües: no disponibles; el tokenizador se denomina `chat_en_bpe8k`, lo que sugiere orientación al inglés sin confirmación oficial.
- Capacidad especial: ninguna declarada más allá de la tarea de copia para la que fue ajustado.

## Casos de uso

- Investigación en depth upcycling: servir como punto de comparación reproducible frente al checkpoint de 49M para medir el efecto de añadir capas por interpolación de bloques en una tarea controlada de copia.
- Estudio de currículos sintéticos: el par currículo de copia más 153 filas de profesor permite analizar cómo escala la exactitud con la longitud de la tarea (etapas 2short, 3short, 4short) en modelos por debajo de 100M de parámetros.
- Línea base en experimentos de destilación: los resultados del estudiante de 49M (32% / 12% / 0% de exactitud) ofrecen una referencia cuantitativa para evaluar nuevas recetas de destilación sobre tareas de copia.
- Docencia y divulgación: un modelo de 63M con cargas en CPU y pesos de 0,3 GB permite ilustrar el ciclo completo de upcycling, ajuste fino y evaluación held-out en un entorno de laboratorio sin infraestructura dedicada.
- Pruebas de robustez y análisis de límites: el conjunto out-of-distribution de 30 filas con claves prefijadas `field_` y `k_` sirve como test de generalización para estudiar fallos de copia fuera de gramática.
- Integración en pipelines de experimentación con PyTorch: al cargarse como checkpoint base mediante `TransformerLM` y `load_state_dict`, puede incorporarse a scripts de evaluación automatizada sin dependencias de servidores de inferencia.

## Benchmarks y rendimiento

Resultados held-out de copia publicados por el autor (200 filas por etapa, claves y valores nuevos):

| Etapa | Exactitud exacta (63M) | Copia de clave (63M) | Exactitud exacta (estudiante 49M) |
|---|---:|---:|---:|
| 2short | 89,5% | 91,5% | 32% |
| 3short | 77,0% | 83,5% | 12% |
| 4short | 65,5% | 74,0% | 0% |

Prueba fuera de distribución: 0/30 en un conjunto de 30 filas con claves prefijadas `field_` y `k_`.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 63,4M de parámetros; en fp32 ocupa aproximadamente 0,25 GB de pesos, y en fp16 alrededor de 0,13 GB, más el estado de activaciones para secuencias de hasta 512 tokens. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 1-2 GB de memoria libre es suficiente. El entrenamiento se realizó en una "host GPU" no identificada.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor proporciona únicamente carga directa en PyTorch mediante `atomzero.transformer.TransformerLM` y el tokenizador de Hugging Face `tokenizers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea evaluada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atom Zero 63M (este) | 63,4M | 512 | Copia sintética (89,5% / 77,0% / 65,5% exacto) | Apache 2.0 | Hugging Face (`byjameson/atom-zero-63m`) |
| Atom Zero 49M (base del producto) | 49,2M | no disponible | Copia sintética (32% / 12% / 0% exacto como estudiante destilado) | no disponible en la información proporcionada | Referenciado en la model card |
| GPT-2 small | 124M | 1024 | Lenguaje general | MIT | Hugging Face |
| SmolLM-135M | 135M | 2048 | Lenguaje general | Apache 2.0 | Hugging Face |

La comparación con GPT-2 small y SmolLM-135M es solo orientativa por tamaño y licencia: no existen evaluaciones comunes publicadas que permitan contrastar rendimiento, y Atom Zero 63M no está entrenado como asistente general.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara explícitamente que no es la base del producto ni un asistente general, y que no demuestra calidad de asistente, razonamiento ni copia general.
- Fallo fuera de distribución documentado: 0/30 en claves con prefijos `field_` y `k_`; la copia solo funciona dentro de la gramática entrenada de claves alfanuméricas en minúsculas de 3 a 6 caracteres.
- Contexto muy limitado: 512 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Idiomas: no se declaran idiomas soportados; el tokenizador sugiere inglés, sin garantías para castellano.
- Sesgos conocidos: no documentados; un modelo de 63M entrenado sobre un currículo sintético puede reproducir los sesgos de los datos del profesor, no especificados.
- Riesgo de alucinación: alto en cualquier uso fuera de la tarea de copia, al no haberse evaluado su calidad generativa general.
- Licencia Apache 2.0: permite uso comercial, pero el propio autor desaconseja emplearlo como base de producto; el checkpoint de producto es `atom-zero-49m` / `0.8.0`.
- Formato de pesos no estándar para servidores de inferencia: requiere el paquete `atomzero` y cargar el state dict manualmente, sin soporte documentado en vLLM, llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byjameson/atom-zero-63m
- Resumen de resultados de upcycling: https://github.com/byjameson/atom-zero/blob/main/research/results/upcycle_8l_capability_summary.json
- Documentación del procedimiento de upcycling: https://github.com/byjameson/atom-zero/blob/main/docs/UPCYCLE.md
