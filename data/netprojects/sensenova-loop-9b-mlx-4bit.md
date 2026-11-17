# netprojects/SenseNova-Loop-9B-MLX-4bit

## Resumen

SenseNova-Loop-9B-MLX-4bit es una conversión a formato MLX con cuantización de 4 bits del modelo SenseNova-Loop-9B, desarrollado originalmente por SenseNova (SenseTime). Esta versión, publicada por NetProjects (Internet Projects Ltd), está optimizada para ejecución en Apple Silicon y no tiene afiliación con SenseTime ni SenseNova. El modelo base es un transformer basado en Qwen3.5 con una arquitectura "looped" que ejecuta determinadas capas varias veces por token, lo que incrementa la profundidad efectiva sin aumentar el número de parámetros.

El modelo resuelve tareas de generación de texto, razonamiento agéntico, código y análisis de datos, y resulta relevante porque ofrece una ventana de contexto de 512K tokens mediante escalado YaRN, algo poco habitual en modelos de menos de 10.000 millones de parámetros. Con 8.956.949.376 parámetros totales y un peso de 5,1 GB en esta cuantización, es la variante más ligera de la familia MLX publicada por NetProjects, pensada para equipos con memoria unificada limitada.

La ficha se centra en esta build de 4 bits, que según el autor presenta una fidelidad menor respecto al modelo original en bf16 que las builds de 6 y 8 bits, por lo que conviene valorar el compromiso entre tamaño y calidad numérica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con ejecución "looped" (56 pasadas de capa por token) y mHC de dos flujos en capas 4-27; atención completa y Gated DeltaNet |
| Parámetros totales | 8.956.949.376 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512K tokens (escalado YaRN, factor 2 sobre 262.144 posiciones) |
| Tipos de cuantización | 4 bits afín, group size 64 (esta build); también disponibles 6 bits, 8 bits y bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B es un transformer derivado de Qwen3.5 al que SenseNova añadió dos modificaciones principales. La primera es la ejecución "looped": las capas 0-3 se ejecutan una vez, las capas 4-27 se ejecutan dos veces con pesos compartidos y las capas 28-31 una vez, resultando en 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché (KV cache para atención completa, estado convolucional y recurrente para Gated DeltaNet). La segunda es un mecanismo mHC de dos flujos en las capas 4-27, donde el estado oculto se divide en dos flujos residuales enrutados por pequeños routers en float32 (gates pre/post y una matriz de mezcla Sinkhorn 2×2 con 20 iteraciones); los 96 tensores de router permanecen en float32 y no se cuantizan.

El contexto largo se consigue mediante escalado YaRN con factor 2 sobre 262.144 posiciones, alcanzando los 512K tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. Esta build de 4 bits, según las mediciones del autor, mantiene el mismo token top en el 84,0% de las posiciones respecto al código PyTorch original en bf16, con una KL de 0,0982 en el último token y texto greedy idéntico en 2 de 16 prompts.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Modo "thinking" activable mediante `enable_thinking=True` en la plantilla de chat.
- Razonamiento agéntico y tareas de múltiples pasos (evaluado en AutomationBench, Terminal-Bench 2.1, GAIA).
- Generación y análisis de código (NL2Repo, Terminal-Bench).
- Análisis de datos y consultas a bases de datos (AIDABench, BIRD).
- Procesamiento de contexto largo: el autor verificó que la build de 6 bits localiza un código oculto en un prompt de 64K tokens; no se reporta la misma prueba para la build de 4 bits.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque las evaluaciones agénticas sugieren compatibilidad con flujos de herramientas.

## Casos de uso

- Asistentes conversacionales en local sobre Apple Silicon: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 512K tokens, ejecutándose íntegramente en un Mac con memoria unificada suficiente.
- Análisis de documentos extensos: con 512K tokens de contexto, es adecuado para resumir o extraer información de contratos, informes o bases de código completas sin fragmentación.
- Automatización de tareas agénticas de terminal: sus resultados en Terminal-Bench 2.1 (59,55) lo sitúan como candidato para agentes que operan sobre entornos de línea de comandos.
- Generación de código en flujos de desarrollo: los resultados en NL2Repo (41,36) permiten integrarlo en pipelines de generación y revisión de repositorios, aunque por debajo de alternativas como Qwen3.8-27B (44,60).
- Consultas en lenguaje natural a bases de datos: con 72,34 en BIRD, puede emplearse como capa de traducción NL2SQL en herramientas de business intelligence.
- Análisis de datos exploratorio: su puntuación de 65,31 en AIDABench lo hace apto para tareas de interpretación y manipulación de datos asistida.
- Prototipado y experimentación en investigación: la licencia Apache 2.0 y la disponibilidad de builds en 4, 6, 8 bits y bf16 facilitan probar la arquitectura looped en distintos presupuestos de memoria.

## Benchmarks y rendimiento

Los siguientes resultados son los reportados por SenseNova para el modelo original en BF16, no para esta build cuantizada a 4 bits.

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | No disponible |
| GAIA | 69,90 | 37,86 | No disponible |
| AIDABench | 65,31 | No disponible | 65,01 |
| NL2Repo | 41,36 | No disponible | 44,60 |
| BIRD | 72,34 | 71,38 | No disponible |

El autor reporta además métricas de fidelidad de esta build de 4 bits respecto al código PyTorch original en bf16: 84,0% de coincidencia en token top, KL de 0,0982 en el último token y texto greedy idéntico en 2 de 16 prompts. Para comparar, la build de 6 bits alcanza 96,7% de coincidencia y KL de 0,0056, y la de 8 bits un 97,6% y KL de 0,0012.

## Requisitos de hardware

- VRAM/memoria unificada: 5,1 GB de pesos en esta cuantización de 4 bits; el consumo total debe sumar la caché KV y los estados de Gated DeltaNet para el contexto utilizado.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon; el autor reporta pruebas en un MacBook Pro M5 Max con 128 GB. No se documenta soporte para GPU NVIDIA en esta build.
- Compatibilidad con GPU de consumo: al ser MLX, requiere chips Apple (M1 en adelante); encaja en equipos con memoria unificada de 16 GB o superior, aunque el contexto largo de 512K exige mucha más memoria.
- Opciones de despliegue: mlx-lm 0.32 o superior con `trust_remote_code=True`; servidor mediante `mlx_lm.server`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-4bit (esta build) | 8,96B | 512K | Apache 2.0 | safetensors MLX | 5,1 GB, fidelidad reducida (84,0% top token) |
| SenseNova-Loop-9B-MLX-6bit | 8,96B | 512K | Apache 2.0 | safetensors MLX | 7,3 GB, 96,7% top token, recomendada por el autor |
| SenseNova-Loop-9B-MLX-8bit | 8,96B | 512K | Apache 2.0 | safetensors MLX | 9,5 GB, 97,6% top token |
| SenseNova-Loop-9B-MLX-bf16 | 8,96B | 512K | Apache 2.0 | safetensors MLX | 17,9 GB, 98,6% top token |
| Qwen3.8-27B | 27B (no confirmado) | No disponible | No disponible | No disponible | Referencia en benchmarks de SenseNova; supera en NL2Repo (44,60 vs 41,36) |

## Limitaciones y advertencias

- La cuantización a 4 bits reduce la fidelidad respecto al modelo original: solo el 84,0% de coincidencia en token top y KL de 0,0982, frente al 96,7% y 0,0056 de la build de 6 bits. El propio autor recomienda la build de 6 bits para mayor fidelidad.
- Solo 2 de 16 prompts generan texto greedy idéntico al modelo original en bf16, lo que puede afectar a tareas sensibles a la reproducibilidad exacta.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPU NVIDIA ni a entornos de servidor x86 convencionales.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni idiomas soportados.
- La ventana de 512K tokens requiere una gestión cuidadosa de la memoria; con cuantización de 4 bits y contexto máximo, el consumo de caché puede superar ampliamente el tamaño de los pesos.
- Los benchmarks presentados corresponden al modelo original en BF16, no a esta build cuantizada, por lo que el rendimiento real puede ser inferior.
- Aunque la licencia es Apache 2.0, el modelo deriva de Qwen3.5 y de SenseNova-Loop-9B; conviene revisar el archivo NOTICE del repositorio para obligaciones de atribución.
- El modelo no está afiliado a SenseTime ni SenseNova; el soporte y mantenimiento dependen de NetProjects.

## Enlaces

- Repositorio Hugging Face de esta build: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Modelo base original: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build MLX 6 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build MLX 8 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Build MLX bf16: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- Sitio de NetProjects: https://netprojects.com
