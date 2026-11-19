# Solstice-AI/Qwen3.8-27B-Uncensored-mlx-6Bit

## Resumen

Qwen3.8-27B-Uncensored-mlx-6Bit es una cuantización de 6 bits en formato MLX del modelo orcarouter/Qwen3.8-27B-Uncensored, publicada por Solstice-AI para ejecución nativa en Apple Silicon. El modelo base parte de la arquitectura Qwen 3.8, un transformer denso de aproximadamente 27.000 millones de parámetros, al que OrcaRouter aplicó una técnica de "abliteration" (ablación ortogonal de las direcciones de rechazo en los flujos residuales) para eliminar los mecanismos de negativa del modelo sin reentrenarlo por completo. Esta versión concreta comprime los pesos originales en BF16 (~54 GB) a unos 21,85 GB mediante cuantización afín de grupo (group_size 64), preservando, según el autor, el 99,2 % del rendimiento del modelo sin cuantizar.

El interés de esta ficha reside en dos ejes: por un lado, es un ejemplo de despliegue de un modelo de ~27B en memoria unificada de Macs de gama alta con velocidades de generación de 36 a 62 tokens por segundo; por otro, el modelo está deliberadamente orientado a casos de uso de red teaming, auditoría de sistemas y ciberseguridad ofensiva, con una ventana de contexto nativa declarada de 262.144 tokens. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque la naturaleza "uncensored" introduce riesgos operativos y de reputación que deben evaluarse con cuidado.

La información disponible proviene casi exclusivamente de la model card del autor; no se han publicado resultados de benchmarks independientes ni detalles completos del dataset de entrenamiento del modelo base, por lo que varios apartados de esta ficha indican "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen 3.8), pesos cuantizados en MLX 6-bit afín |
| Parametros totales | 26.895.993.856 (~26,9B; el autor declara 27,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K), según el autor |
| Tipos de cuantizacion | MLX 6-bit afín (group_size 64, mode affine); "turbo4/turbo3" como opciones de runtime en Anvil |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (5 shards, ~21,85 GB); no hay GGUF publicado por el autor |
| Libreria / runtime | mlx, mlx-lm (v0.19.0+), Anvil Runtime (Metal) |
| Pipeline | image-text-to-text |
| Hardware objetivo | Apple Silicon con memoria unificada de 32 GB o más |
| Huella de memoria activa | ~22,2 GB con contexto de 8K; ~24,8 GB con 32K |
| Descargas / likes | 2.048 descargas, 2 likes (en el momento de la consulta) |
| Fecha de creación / actualización | 2026-08-19 / 2026-10-15 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen 3.8 con aproximadamente 27B parámetros. Sobre el checkpoint base (orcarouter/Qwen3.8-27B-Uncensored), Solstice-AI aplica una cuantización afín de 6 bits por grupos de 64 pesos, empaquetada en safetensors compatibles con MLX. El autor afirma que esta cuantización retiene el 99,2 % del rendimiento del modelo en BF16 y reduce la memoria de pesos de ~54 GB a ~21,8 GB. La ventana de contexto de 262K se apoya en RoPE extendido, según la model card, calibrado para auditoría de código multiarchivo.

La innovación principal del modelo base es la "abliteración": OrcaRouter identificó las direcciones principales de rechazo en los estados residuales intermedios y ortogonalizó los pesos correspondientes, eliminando las negativas y preámbulos moralizantes sin un reentrenamiento completo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se detalla el proceso de calibración de la cuantización más allá de los parámetros indicados. El autor menciona optimizaciones de shaders fusionados en Metal y gestión de ancho de banda de memoria unificada en el runtime Anvil, pero no aporta detalles técnicos adicionales.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados de la arquitectura Qwen 3.8.
- Razonamiento matemático y derivación simbólica, según declara el autor.
- Generación y auditoría de código, incluyendo análisis de repositorios completos gracias a la ventana de 262K tokens.
- Uso de herramientas y function calling orientado a flujos agénticos (declarado en la model card como "agentic tool-use").
- Capacidad multimodal image-text-to-text según el pipeline declarado, aunque la model card no detalla la arquitectura de visión ni resolución de imágenes soportada.
- Multilingüe limitado a inglés y chino.
- Modo "uncensored": ausencia de mecanismos de rechazo por alineación, orientado a red teaming y pruebas de seguridad.
- Ejecución nativa en Apple Silicon vía MLX y Anvil, con servidor compatible con la API de OpenAI.

## Casos de uso

- Red teaming de aplicaciones LLM: el modelo, al carecer de direcciones de rechazo, permite generar prompts adversarios y evaluar la robustez de filtros y guardarraíles en pipelines de terceros sin que el propio modelo bloquee la prueba.
- Auditoría de seguridad de repositorios: con 262K tokens de contexto se pueden cargar varios archivos o un repositorio mediano completo y pedir al modelo que rastree patrones de vulnerabilidad (inyección SQL, desbordamientos, uso inseguro de APIs) en una sola pasada.
- Investigación de vulnerabilidades y análisis de binarios o código ofuscado: el modelo puede describir técnicas de explotación y analizar PoCs en entornos de laboratorio aislados, algo que modelos alineados suelen rechazar.
- Asistencia a desarrolladores en local sin conexión: al ejecutarse en MLX sobre un Mac con 32 GB o más, permite autocompletado, revisión de código y generación de tests sin enviar datos a la nube, útil en entornos con requisitos de confidencialidad.
- Generación de documentación técnica y análisis de código legacy: la ventana larga permite resumir módulos extensos y extraer contratos de API en una sola consulta.
- Prototipado de agentes con tool calling en estación de trabajo: el servidor compatible con OpenAI (`mlx_lm.server` o `anvil serve`) permite conectar frameworks agénticos locales a un endpoint HTTP en el puerto 8080.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de un modelo de ~27B al pasar de BF16 a 6 bits en tareas de razonamiento y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma que la cuantización de 6 bits preserva el 99,2 % del rendimiento del modelo en BF16, sin aportar cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación. Tampoco se ofrecen comparaciones numéricas con el checkpoint base sin cuantizar.

Los únicos datos de rendimiento publicados son de throughput en inferencia:

| Hardware | RAM unificada | Contexto | Velocidad declarada |
|---|---|---|---|
| Apple M4 Max | 128 GB | 64K–131K | ~62 tok/s |
| Apple M2 Ultra | 64–192 GB | 64K–131K | ~58 tok/s |
| Apple M3 Max | 64–96 GB | 32K–64K | ~55 tok/s |
| Apple M3/M4 Pro | 36–48 GB | 16K–32K | ~42 tok/s |
| Mac con 24 GB | 24 GB | 4K–8K | ~36 tok/s |

## Requisitos de hardware

- VRAM/RAM estimada: ~22,2 GB con contexto de 8K y ~24,8 GB con 32K; el repositorio ocupa 21,85 GB en disco.
- Hardware objetivo: exclusivamente Apple Silicon (M1 a M5 en variantes Pro, Max y Ultra) con memoria unificada de 32 GB o más. No hay soporte CUDA ni ROCm en esta publicación.
- Configuraciones verificadas por el autor: M4 Max de 128 GB, M3 Max de 64/96 GB y M2 Ultra de 64/192 GB. En un Mac de 24 GB funciona con contexto reducido (4K–8K) y poca RAM libre para el sistema.
- Despliegue: `mlx-lm` (CLI `mlx_lm.chat` y servidor `mlx_lm.server`) o el runtime Anvil de Solstice Labs (`anvil pull`, `anvil run`, `anvil serve`). No se publica versión GGUF, por lo que llama.cpp, Ollama y vLLM no son opciones directas sin conversión previa.
- Latencia y throughput: entre 36 y 62 tokens/s según el chip y la asignación de contexto, según datos del autor. No se dispone de mediciones de latencia de primer token ni de throughput en batch.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo, por lo que la comparación se limita a características estructurales. Las alternativas indicadas son orientativas y sus cifras provienen de conocimiento general, no de la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Solstice-AI/Qwen3.8-27B-Uncensored-mlx-6Bit | ~26,9B | 262K (declarado) | Apache 2.0 | Solo MLX / Apple Silicon |
| orcarouter/Qwen3.8-27B-Uncensored (base) | ~27B | no disponible en la información | Apache 2.0 (según tag) | Pesos sin cuantizar, presumiblemente BF16 |
| Qwen 3.8 27B original (Alibaba) | ~27B | no disponible en la información | no disponible en la información | Pesos originales con alineación estándar |
| Otras cuantizaciones MLX 6-bit de modelos ~27B | variable | variable | variable | Apple Silicon |

La diferencia principal frente al base es el formato (MLX 6-bit frente a BF16) y el objetivo de hardware (Apple Silicon frente a GPU discreta). Frente a modelos alineados de tamaño similar, la diferencia es la ausencia de mecanismos de rechazo, con las implicaciones éticas y de seguridad correspondientes.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": no aplica filtros de seguridad ni rechaza peticiones dañinas. Su uso en producción orientada al público requiere guardarraíles externos obligatorios.
- Riesgo elevado de generar contenido peligroso, ilegal o dañino si se usa sin supervisión; el autor lo orienta explícitamente a red teaming y ciberseguridad, no a asistencia general.
- La ablación de direcciones de rechazo puede degradar sutilmente capacidades de razonamiento o coherencia; no se han publicado evaluaciones independientes que lo cuantifiquen.
- Riesgo de alucinación inherente a los modelos de ~27B, agravado por la ausencia de benchmarks publicados.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La ventana de 262K tokens es una cifra declarada por el autor; no hay evidencia independiente de su calidad efectiva en tareas de recuperación de contexto largo (needle-in-a-haystack).
- Exclusivo para Apple Silicon: no ejecutable en GPU NVIDIA/AMD sin conversión de formato, y no hay GGUF oficial.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado y sobre el cumplimiento de normativas de seguridad y protección de datos.
- El modelo base y esta cuantización tienen muy poca tracción (2 likes, ~2.000 descargas) y no proceden de un laboratorio consolidado; conviene tratar la model card como marketing y validar el comportamiento con pruebas propias.
- No se detalla la composición del dataset ni posibles sesgos heredados del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-Uncensored-mlx-6Bit
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Runtime Anvil (Solstice Labs): https://github.com/Solstice-Labs/anvil
- Instalador de Anvil: https://anvil-llm.github.io/anvil/install.sh
- Apple MLX-LM: https://github.com/ml-explore/mlx-lm
- Banner del autor: https://cdn-uploads.huggingface.co/production/uploads/67c2e844e0921a5410eec10a/Y5M42dCag2f7Fc6fDtV0Z.jpeg
