# chaoliangUNSW/MacJev-322M-4K-Laya-MLX

## Resumen

MacJev-322M-4K-Laya-MLX es la versión nativa para Apple Silicon del modelo de decisión MacJev-322M-4K-Laya, publicada por el usuario chaoliangUNSW. No es un modelo generativo de chat: recibe un estado observado y una pregunta tipada con respuestas candidatas, y en una única pasada hacia delante devuelve una probabilidad para cada candidato. Su función es clasificar, ordenar acciones, enrutar llamadas a herramientas y comprobar el estado de una tarea dentro de agentes locales que se ejecutan en un Mac.

Arquitectónicamente es un encoder mmBERT/ModernBERT de 321.908.998 parámetros, acompañado de embeddings de tipo, un transformer de decisión y un cabezal de puntuación de candidatos. El presupuesto de entrada es de 4096 tokens en total, con un límite estricto de 1024 tokens para la pregunta y sus opciones; si se supera, el runtime lanza `InputBudgetError` en lugar de truncar, de modo que ninguna evidencia o candidato desaparece sin aviso.

Este repositorio aporta el runtime `macjev_mlx.py`, escrito únicamente con `mlx` y `tokenizers` (sin PyTorch ni Transformers), que reproduce exactamente los resultados del modelo de referencia en FP32: en las 9.000 decisiones de validación elige la misma respuesta principal, con probabilidades que difieren como máximo en 0,00026. Su relevancia actual está en que permite ejecutar un componente de enrutamiento y verificación de agentes en local, con dependencias mínimas y latencias de décimas de segundo en un M1 Max.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT/ModernBERT con embeddings de tipo, transformer de decisión y scorer de candidatos |
| Parametros totales | 321.908.998 (322M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens por entrada en total, con presupuesto estricto de 1024 tokens para la pregunta y sus opciones |
| Tipos de cuantizacion | No disponible en este repositorio (pesos FP32); existe una versión GGUF del modelo base para llama.cpp |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en FP32 (1,29 GB) más runtime nativo MLX en Python |
| Tarea (pipeline) | text-classification |
| Modelo base | chaoliangUNSW/MacJev-322M-4K-Laya |
| Libreria | mlx |
| Tamano del repositorio | 1,3 GB |
| Requisitos de ejecucion | Mac con Apple Silicon y Python 3.11 o superior; dependencias `mlx` y `tokenizers` |
| Fecha de creacion | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo parte del checkpoint multilingüe Laya y se entrena como modelo de decisión. La pila está formada por un encoder mmBERT/ModernBERT, embeddings que codifican el tipo de pregunta, un transformer de decisión y un scorer que asigna una probabilidad a cada candidato. Las entradas se organizan con un esquema tipado: `choice` (elegir entre acciones con criterios), `score` (índices de cadena ordenados, como "0", "1"…) y `noul` (booleano con respuestas "false" y "true"). El orden de inserción de las claves de `choice` se respeta en la salida.

La model card reporta que las mejoras frente al checkpoint Laya del que parte se reprodujeron en tres semillas entrenadas de forma independiente, y que la versión publicada es la semilla elegida a priori sobre datos de desarrollo, lo que aporta evidencia de reproducibilidad. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. El repositorio incluye `manifest.json` con los checksums SHA-256 de cada fichero y las temperaturas de calibración, y `validation.json` con la concordancia medida frente al modelo de referencia en FP32.

La innovación principal de esta release es el runtime MLX nativo: verifica los checksums SHA-256 de todos los ficheros que carga en unos 2 segundos y ofrece resultados idénticos a la referencia PyTorch FP32, sin depender de PyTorch ni de Transformers.

## Capacidades

- Decisión y clasificación: devuelve `answer`, `probabilities`, `top_probability`, `input_tokens` y `latency_ms` para una pregunta tipada, no texto libre.
- Enrutamiento de herramientas: ordena y selecciona acciones candidatas a partir del estado observado (por ejemplo, `open_browser` frente a `copy_file` o `ask_user`).
- Comprobaciones de tipo sí/no (`noul`) sobre observaciones de 2K a 4K tokens, con una precisión del 89,1% en los conjuntos de prueba citados.
- Decisiones basadas en reglas (`choice` sobre criterios) con una precisión del 44,7% en entradas de 2K–4K tokens y del 39,7% en entradas largas de cualquier longitud.
- Puntuación de completitud o estado de tarea mediante preguntas de tipo `score` con escalas ordenadas.
- Calibración utilizable para umbrales: el error de calibración en entradas largas es de 0,032, lo que permite fijar umbrales de confianza con significado práctico.
- Capacidades multilingües limitadas a inglés y chino.
- Clasificación de texto en benchmarks públicos (decisiones tipadas, Emotion y AG News), con una mejora de 1,5 puntos porcentuales frente al checkpoint de partida.
- Integración como herramienta o servidor MCP: el modelo no genera texto, pero puede exponerse como herramienta para que un modelo de chat lo invoque.
- Modo de solo decisión: el resultado incluye `actions_executed: False`, es decir, el modelo puntúa pero no ejecuta nada.

## Casos de uso

- Enrutamiento de herramientas en agentes locales de Mac: dado el estado de la conversación y una lista de acciones disponibles, el modelo devuelve la probabilidad de cada una en una única pasada y permite elegir la acción con mayor probabilidad o aplicar un umbral de confianza gracias a su calibración (error de 0,032 en entradas largas).
- Verificación de estado de tareas antes de actuar: con preguntas de tipo `noul` sobre observaciones de 2K a 4K tokens alcanza un 89,1% de acierto, lo que permite comprobar si una condición previa se cumple realmente antes de disparar un paso del agente.
- Control de reglas de negocio sobre documentos largos: las decisiones de tipo `choice` con criterios permiten validar si un texto cumple un conjunto de reglas sin necesidad de un LLM generativo, con latencias de 0,05 a 0,85 s según la longitud de entrada.
- Puerta de calidad en pipelines de automatización: clasificar si una observación demuestra un hecho concreto (existencia de un fichero, finalización de una descarga) y actuar en consecuencia.
- Exposición como herramienta o servidor MCP para LM Studio: al no ser un modelo de chat, se integra publicando `decide()` como herramienta y dejando que el modelo conversacional lo invoque cuando necesite una decisión binaria o una selección entre candidatas.
- Clasificación de texto en local y sin conexión: análisis de sentimiento o categorización de noticias (Emotion y AG News) sobre datos que no pueden salir del equipo, con los 1,29 GB de pesos en FP32 residentes en memoria unificada.
- Puntuación de progreso en asistentes de tareas: usar preguntas de tipo `score` con escalas como "Not started", "Partly complete", "Complete and verified" para actualizar el estado de un flujo multi-paso.
- Selección de candidatos en recuperación de información: puntuar opciones de respuesta o fragmentos candidatos en un pipeline de búsqueda local, aprovechando que el modelo devuelve probabilidades por candidato en lugar de texto.

## Benchmarks y rendimiento

Resultados en conjuntos de prueba reservados, con el mismo presupuesto de entrada de 4096 tokens, comparando MacJev con el checkpoint multilingüe Laya del que parte:

| Tarea | Laya multilingue | MacJev |
|---|---:|---:|
| Comprobaciones si/no con entradas de 2K–4K tokens | 31,0% | 89,1% |
| Decisiones de reglas con entradas de 2K–4K tokens | 23,7% | 44,7% |
| Decisiones de reglas con entradas largas, todas las longitudes | 23,2% | 39,7% |
| Decisiones tipadas | 35,2% | 42,2% |
| Error de calibración en entradas largas (menor es mejor) | 0,253 | 0,032 |

Benchmarks públicos: sobre 11.600 decisiones públicas procedentes de decisiones tipadas, Emotion y AG News, la precisión sube 1,5 puntos porcentuales, con un intervalo de confianza del 95% de 1,1 a 1,8.

Comportamiento y latencia en un M1 Max con MLX 0.32.2:

| Longitud de entrada | Mediana | Percentil 90 |
|---|---:|---:|
| Hasta 1024 tokens | 0,05 s | 0,15 s |
| 1025 a 2048 tokens | 0,22 s | 0,34 s |
| 2049 a 4096 tokens | 0,54 s | 0,85 s |

Concordancia con la referencia: en las 9.000 decisiones de validación, el runtime MLX elige la misma respuesta principal que el modelo PyTorch FP32, con probabilidades que difieren como máximo en 0,00026. No se publican datos de MMLU, HumanEval, GSM8K ni de otros benchmarks de razonamiento generativo, ya que el modelo no es generativo.

## Requisitos de hardware

- Plataforma: exclusivamente Mac con Apple Silicon. No hay soporte CUDA en este repositorio.
- Memoria: los pesos FP32 ocupan 1,29 GB (el repositorio completo, 1,3 GB), por lo que el modelo cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o más. La memoria máxima exacta durante la inferencia no está publicada.
- GPU recomendadas: cualquier chip de la familia Apple Silicon. La model card proporciona medidas sobre un M1 Max con MLX 0.32.2.
- GPU de consumo: el modelo está pensado precisamente para hardware de consumo Apple; no requiere A100, H100 ni RTX 4090 para su ruta nativa.
- Opciones de despliegue: runtime nativo `macjev_mlx.py` (clase `MacJevMLX`, con interfaz de línea de comandos que procesa un objeto JSON por línea), descarga mediante `hf download` o `MacJevMLX.from_pretrained(...)`. Para otros entornos existen las versiones PyTorch FP32 y GGUF para llama.cpp del modelo base.
- Latencia: mediana de 0,05 s hasta 1024 tokens, 0,22 s entre 1025 y 2048 tokens y 0,54 s entre 2049 y 4096 tokens. No se publica throughput agregado ni rendimiento con batching.
- Dependencias: solo `mlx` y `tokenizers`, con Python 3.11 o superior.

## Comparativa con modelos similares

No se han encontrado en la información disponible modelos de decisión de terceros comparables. La comparación más significativa es con las otras distribuciones del mismo modelo y con el checkpoint del que deriva:

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MacJev-322M-4K-Laya-MLX | 321.908.998 | 4096 tokens (1024 para pregunta y opciones) | safetensors FP32 + MLX nativo | Apache 2.0 | Repositorio MLX |
| MacJev-322M-4K-Laya | No disponible en la información | 4096 tokens | PyTorch FP32 | Apache 2.0 | Repositorio PyTorch FP32 |
| MacJev-322M-4K-Laya-GGUF | No disponible en la información | 4096 tokens | GGUF para llama.cpp | Apache 2.0 | Repositorio GGUF |
| Checkpoint multilingüe Laya (punto de partida) | No disponible en la información | 4096 tokens | No disponible | No disponible | No disponible |

En rendimiento, la comparación directa publicada es frente al checkpoint Laya: 31,0% frente a 89,1% en comprobaciones si/no sobre entradas de 2K–4K tokens, y 0,253 frente a 0,032 de error de calibración.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo probabilidades sobre candidatos predefinidos. No puede usarse como sustituto de un LLM conversacional.
- Solo se ejecuta en Mac con Apple Silicon en esta distribución. Para GPU NVIDIA o entornos Linux con CUDA hay que recurrir a las versiones PyTorch FP32 o GGUF del modelo base.
- Presupuesto de entrada estricto: 4096 tokens en total y 1024 para la pregunta y sus opciones. Superarlo provoca `InputBudgetError`; no hay truncado silencioso, lo que exige gestionar la excepción en producción.
- Idiomas limitados a inglés y chino. No hay evidencia publicada de rendimiento en castellano.
- Las precisiones absolutas en decisiones de reglas son moderadas (44,7% en entradas de 2K–4K tokens), por lo que el modelo no es fiable como único mecanismo de decisión en dominios con reglas complejas.
- Riesgo de error en decisiones y, por extensión, en el enrutamiento de herramientas. La calibración del 0,032 en entradas largas permite mitigarlo con umbrales, pero no elimina el fallo.
- El modelo devuelve `actions_executed: False`: no ejecuta ninguna acción. Cualquier efecto real depende de la capa que consuma la decisión, que debe validar la salida.
- La model card advierte de que MacJev no funciona a través del motor de chat de LM Studio; hay que exponerlo como herramienta o servidor MCP.
- No se detallan en la información disponible la composición del dataset de entrenamiento, los sesgos conocidos ni las limitaciones idiomáticas específicas más allá de los idiomas declarados.
- Se recomienda mantener un único objeto de modelo cargado entre peticiones para evitar recargas y verificaciones de checksum repetidas.
- Licencia Apache 2.0, que permite uso comercial, sujeta a las condiciones de atribución indicadas en los ficheros `NOTICE` y `MMBERT_LICENSE` incluidos en el repositorio.

## Enlaces

- Repositorio MLX: https://huggingface.co/chaoliangUNSW/MacJev-322M-4K-Laya-MLX
- Modelo base en PyTorch FP32 (con detalles de entrenamiento): https://huggingface.co/chaoliangUNSW/MacJev-322M-4K-Laya
- Versión GGUF para llama.cpp: https://huggingface.co/chaoliangUNSW/MacJev-322M-4K-Laya-GGUF

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del repositorio.
