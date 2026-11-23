# netprojects/SenseNova-Loop-9B-MLX-4bit

## Resumen

SenseNova-Loop-9B-MLX-4bit es la conversión a 4 bits (cuantización afín, tamaño de grupo 64) del modelo SenseNova-Loop-9B de SenseNova (SenseTime), publicada por NetProjects para su ejecución en Apple Silicon mediante MLX. El modelo original es un transformer basado en Qwen3.5 con una innovación arquitectónica central: ejecución en bucle (*looped execution*) de un subconjunto de capas con pesos compartidos, junto con un mecanismo de dos flujos residuales (*two-stream mHC*) en las capas intermedias. El resultado son 56 pasadas de capa por token, lo que incrementa la profundidad efectiva sin aumentar el número de parámetros.

Con 8.956.949.376 parámetros totales (aproximadamente 9B) y un contexto configurado de 512K tokens mediante escalado YaRN, el modelo está orientado a tareas agénticas, generación de código, análisis de datos y razonamiento multi-paso. Incluye entrada de imagen a través de una torre de visión separada y una cabeza de predicción multi-token (MTP) que acelera la decodificación aproximadamente 1,7 veces.

Esta build de 4 bits ocupa 5,1 GB de pesos y es la variante más pequeña de la familia MLX publicada por NetProjects. Su fidelidad respecto al modelo original en bf16 es notablemente inferior a la de las builds de 6 y 8 bits: coincide en el token de mayor probabilidad en el 84,4 % de las posiciones y en el texto greedy en solo 2 de 16 prompts. La licencia Apache 2.0 facilita su uso comercial, aunque la fidelidad reducida aconseja evaluar la build de 6 bits para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con ejecución en bucle (looped transformer) y two-stream mHC; atención completa combinada con Gated DeltaNet |
| Parametros totales | 8.956.949.376 (~9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512K tokens (YaRN, factor 2 sobre 262.144 posiciones) |
| Tipos de cuantizacion | 4 bits afín, group size 64; routers y normas en float32; torre de visión en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantización 4-bit; pesos auxiliares en float32 (`model.fp32norms.safetensors`) y bfloat16 (`vision.safetensors`) |

## Arquitectura y entrenamiento

SenseNova-Loop-9B parte de la arquitectura Qwen3.5 y añade dos modificaciones. La primera es la ejecución en bucle: las capas 0–3 se ejecutan una vez, las capas 4–27 se ejecutan dos veces con pesos compartidos y las capas 28–31 se ejecutan una vez, sumando 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché (KV cache para atención completa, estado convolucional y recurrente para Gated DeltaNet). La segunda es el mecanismo two-stream mHC en las capas 4–27: el estado oculto se divide en dos flujos residuales enrutados por pequeños routers en float32 (gates pre/post y una matriz de mezcla 2×2 Sinkhorn con 20 iteraciones). Los 96 tensores de router permanecen en float32 y no se cuantizan.

El contexto largo se consigue con escalado YaRN de rope (factor 2 sobre 262.144 posiciones). El modelo incluye una cabeza de predicción multi-token (MTP) que genera borradores de tokens verificados en una sola pasada, acelerando la decodificación aproximadamente 1,7 veces. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional con modo de pensamiento (*thinking*) activable mediante `enable_thinking=True`.
- Razonamiento multi-paso y tareas agénticas, incluyendo ejecución de tareas de terminal y automatización.
- Generación y análisis de código, con soporte para tareas de tipo NL2Repo.
- Análisis de datos y consultas sobre bases de datos (evaluado en BIRD y AIDABench).
- Entrada de imagen: descripción de imágenes, con límite por defecto de aproximadamente 1 megapíxel por imagen (hasta 16,7 MP configurable, con mayor consumo de memoria).
- Decodificación acelerada mediante la cabeza MTP.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.

## Casos de uso

- Automatización de tareas de terminal y agentes de línea de comandos: el modelo obtiene 59,55 en Terminal-Bench 2.1, lo que lo hace adecuado para agentes que ejecutan comandos y resuelven tareas de sistema en entornos controlados.
- Análisis de datos sobre bases de datos relacionales: con 72,34 en BIRD y 65,31 en AIDABench, puede emplearse para traducir preguntas en lenguaje natural a consultas SQL y generar informes analíticos.
- Asistencia en desarrollo de software: su rendimiento en NL2Repo (41,36) permite integrarlo en flujos de generación de repositorios y código a partir de especificaciones.
- Procesamiento de documentos largos en local: con 512K tokens de contexto y decodificación MTP, es viable resumir o extraer información de documentos extensos en un Mac con Apple Silicon, como demuestra la prueba de encontrar un código oculto en un prompt de 64K tokens.
- Descripción y análisis de imágenes en dispositivos locales: la torre de visión en bfloat16 permite clasificar, describir o extraer texto de imágenes sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Prototipado e investigación en arquitecturas looped: al incluir el código `sensenova_loop.py` y los pesos en float32 de routers y normas, sirve para experimentar con ejecución en bucle y mHC en hardware de consumo.
- Asistentes conversacionales con razonamiento explícito: el modo thinking permite separar el razonamiento interno de la respuesta final en aplicaciones de atención al cliente o tutoría.

## Benchmarks y rendimiento

Los datos siguientes son los reportados por SenseNova para el modelo original en BF16, no para esta build cuantizada.

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | No disponible |
| GAIA | 69,90 | 37,86 | No disponible |
| AIDABench | 65,31 | No disponible | 65,01 |
| NL2Repo | 41,36 | No disponible | 44,60 |
| BIRD | 72,34 | 71,38 | No disponible |

Fidelidad de esta build de 4 bits respecto al código PyTorch de SenseNova en bf16 (16 prompts, todas las posiciones):

| Build | Tamano | Mismo token top | KL en el último token | Texto greedy idéntico | Imágenes: mismo token top |
|---|---|---|---|---|---|
| 6-bit | 7,3 GB | 96,7 % | 0,0056 | 4 / 16 | 98,0 % |
| 8-bit | 9,5 GB | 98,6 % | 0,0015 | 11 / 16 | 96,7 % |
| 4-bit (esta build) | 5,1 GB | 84,4 % | 0,1038 | 2 / 16 | 95,4 % |
| bf16 | 17,9 GB | 99,1 % | 0,0005 | 12 / 16 | Referencia |

## Requisitos de hardware

- VRAM/unified memory estimada: 5,1 GB de pesos en 4 bits; el consumo total en inferencia depende de la longitud de contexto y del número de imágenes. Con contexto largo o imágenes de alta resolución, el uso de memoria crece de forma significativa.
- Hardware objetivo: Apple Silicon con MLX. Las pruebas de referencia se realizaron en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- GPU NVIDIA: no disponible; esta build está pensada para MLX y Apple Silicon, no para CUDA.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; 5,1 GB de pesos permiten su ejecución en configuraciones de 16 GB o más, aunque el contexto de 512K y la entrada de imagen requieren más memoria.
- Despliegue: `mlx-lm` 0.32 o superior con `trust_remote_code=True`; servidor mediante `mlx_lm.server`. Para imagen y decodificación MTP se requiere el runtime `sensenova-loop-mlx` v0.3.0.
- Latencia y throughput: no se proporcionan cifras absolutas; la cabeza MTP ofrece aproximadamente 1,7 veces más velocidad de decodificación que la decodificación simple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-4bit (esta build) | ~9B | 512K | Apache 2.0 | MLX 4-bit | 5,1 GB; fidelidad reducida respecto a bf16 (84,4 % mismo token top) |
| SenseNova-Loop-9B-MLX-6bit | ~9B | 512K | Apache 2.0 | MLX 6-bit | 7,3 GB; recomendada por el autor por su mayor fidelidad (96,7 %) |
| SenseNova-Loop-9B-MLX-8bit | ~9B | 512K | Apache 2.0 | MLX 8-bit | 9,5 GB; fidelidad alta (98,6 %) |
| SenseNova-Loop-9B (original) | ~9B | 512K | Apache 2.0 | safetensors bf16 | 17,9 GB; referencia de fidelidad |

## Limitaciones y advertencias

- La fidelidad respecto al modelo original es limitada: solo el 84,4 % de las posiciones coinciden en el token de mayor probabilidad y únicamente 2 de 16 prompts generan texto greedy idéntico al bf16. El autor recomienda la build de 6 bits para un mejor equilibrio.
- El KL de 0,1038 en el último token indica una divergencia de distribución apreciable frente al modelo original, lo que puede afectar a tareas sensibles a la precisión.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de sesgo en la información disponible.
- Idiomas soportados no documentados; no se garantiza un rendimiento uniforme fuera de los idiomas evaluados por SenseNova.
- El contexto de 512K requiere memoria considerable y puede degradar la calidad en extremos muy largos; la prueba de 64K se realizó con la build de 6 bits, no con la de 4 bits.
- La entrada de imagen está limitada por defecto a aproximadamente 1 megapíxel por imagen; el límite de 16,7 MP exige mucha más memoria.
- El uso comercial está permitido por la licencia Apache 2.0, pero el modelo no está afiliado a SenseTime/SenseNova y las garantías sobre su comportamiento en producción recaen en el usuario.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código incluido en el repositorio; conviene auditar `sensenova_loop.py` antes de desplegarlo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build de 6 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Runtime MLX para visión y MTP: https://github.com/internet-projects/sensenova-loop-mlx/releases/tag/v0.3.0
- NetProjects: https://netprojects.com
