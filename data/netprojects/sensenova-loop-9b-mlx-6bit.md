# netprojects/SenseNova-Loop-9B-MLX-6bit

## Resumen

SenseNova-Loop-9B-MLX-6bit es una conversión cuantizada a 6 bits en formato MLX del modelo SenseNova-Loop-9B, desarrollado originalmente por SenseNova (SenseTime). Esta versión, publicada por NetProjects (Internet Projects Ltd) el 17 de noviembre de 2026, está optimizada para ejecutarse en Apple Silicon mediante la librería mlx-lm. El modelo base es un transformer basado en Qwen3.5 con una arquitectura "looped" que repite el paso por determinadas capas y emplea un mecanismo de dos flujos residuales denominado mHC.

El modelo resuelve tareas de generación de texto, razonamiento agéntico, código y análisis de datos, con una ventana de contexto configurada hasta 512K tokens mediante escalado YaRN. Su relevancia radica en que ofrece un rendimiento cercano a modelos de mayor tamaño en benchmarks agénticos (AutomationBench, Terminal-Bench 2.1, GAIA) manteniendo un tamaño de 9B parámetros, y en que esta conversión MLX permite desplegarlo en equipos Mac con memoria unificada, algo poco habitual en modelos de esta categoría.

La cuantización a 6 bits con tamaño de grupo 64 reduce el peso a 7,3 GB (frente a 17,9 GB en bf16), manteniendo una concordancia del 96,7 % en el token top-1 respecto a la implementación PyTorch de referencia en bf16 y un KL de 0,0056 en el último token. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con ejecución en bucle (looped) y dos flujos residuales mHC; atención completa y Gated DeltaNet |
| Parámetros totales | 8.956.947.840 (≈8,96B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K tokens (configuración YaRN, factor 2 sobre 262.144 posiciones) |
| Tipos de cuantización | 6 bits afín, tamaño de grupo 64 (esta versión); también disponibles 8 bits, 4 bits y bf16 en repositorios hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (mlx-lm); los 96 tensores de router mHC permanecen en float32 sin cuantizar |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B es un transformer derivado de Qwen3.5 con dos modificaciones principales. En primer lugar, la ejecución en bucle: las capas 0–3 se ejecutan una vez, las capas 4–27 se ejecutan dos veces compartiendo pesos y las capas 28–31 una vez, lo que resulta en 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché (KV cache para atención completa, estado convolucional y recurrente para Gated DeltaNet). En segundo lugar, las capas 4–27 incorporan un mecanismo de dos flujos residuales (mHC) en el que el estado oculto se divide en dos flujos enrutados por routers en float32 (puertas pre/post y una matriz de mezcla 2×2 de Sinkhorn con 20 iteraciones).

El contexto largo se gestiona mediante escalado YaRN con factor 2 sobre 262.144 posiciones, alcanzando los 512K tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La presente versión MLX es una conversión y cuantización de los pesos originales, no un reentrenamiento; el código de la arquitectura (`sensenova_loop.py`) se incluye en el repositorio y se carga mediante `trust_remote_code=True`.

## Capacidades

- Generación de texto conversacional con plantilla de chat y modo de razonamiento (thinking) activable mediante `enable_thinking=True`.
- Razonamiento agéntico multi-paso, evaluado en benchmarks como GAIA, AutomationBench y Terminal-Bench 2.1.
- Generación y comprensión de código, con resultados reportados en NL2Repo y Terminal-Bench.
- Análisis de datos y consultas estructuradas, evaluado en AIDABench y BIRD.
- Manejo de contexto largo: la versión de 6 bits localizó un código de acceso oculto en un prompt de 64K tokens según las pruebas del autor de la conversión.
- Soporte multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Automatización de flujos agénticos: el modelo puede orquestar tareas multi-paso con herramientas externas, respaldado por su resultado de 36,67 en AutomationBench, adecuado para pipelines de automatización de back-office.
- Asistencia en terminal y operaciones de sistema: con 59,55 en Terminal-Bench 2.1, puede emplearse en agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de línea de comandos.
- Análisis de datos conversacional: su puntuación de 65,31 en AIDABench y 72,34 en BIRD lo hace apto para generar consultas SQL y responder preguntas sobre bases de datos relacionales en herramientas de BI.
- Generación de código en producción: puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o resolución de incidencias, aunque requiere validación humana por el riesgo de alucinación.
- Procesamiento de documentos largos en local: gracias a los 512K tokens de contexto y a los 7,3 GB de pesos, permite resumir o extraer información de contratos, informes o expedientes en un Mac sin enviar datos a la nube.
- Desarrollo y prototipado en Apple Silicon: investigadores y desarrolladores pueden ejecutar el modelo con mlx-lm en un MacBook Pro para experimentar con arquitecturas looped y comparar contra la implementación PyTorch de referencia.
- Atención al cliente con contexto extendido: la ventana de 512K tokens permite mantener conversaciones multi-turno con historial largo y documentación de producto adjunta en un solo prompt.

## Benchmarks y rendimiento

Resultados reportados por SenseNova para el modelo original en BF16 (no para esta conversión MLX):

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | no disponible |
| GAIA | 69,90 | 37,86 | no disponible |
| AIDABench | 65,31 | no disponible | 65,01 |
| NL2Repo | 41,36 | no disponible | 44,60 |
| BIRD | 72,34 | 71,38 | no disponible |

Fidelidad de la conversión MLX respecto a la implementación PyTorch en bf16 (16 prompts, todas las posiciones, MacBook Pro M5 Max de 128 GB):

| Build | Tamaño | Mismo token top-1 | KL en último token | Texto greedy idéntico |
|---|---|---|---|---|
| 6 bits (esta versión) | 7,3 GB | 96,7 % | 0,0056 | 2 / 16 |
| 8 bits | 9,5 GB | 97,6 % | 0,0012 | 12 / 16 |
| 4 bits | 5,1 GB | 84,0 % | 0,0982 | 2 / 16 |
| bf16 | 17,9 GB | 98,6 % | 0,0012 | 12 / 16 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 7,3 GB de pesos más overhead de caché KV y estados recurrentes; se recomienda al menos 16 GB de memoria unificada para contexto moderado y 32 GB o más para contexto largo.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4, M5) con memoria unificada suficiente; las pruebas del autor se realizaron en un MacBook Pro M5 Max con 128 GB.
- No está pensado para GPU NVIDIA ni para CUDA; el formato es MLX y requiere mlx-lm.
- Opciones de despliegue: `mlx_lm.generate` en Python o servidor mediante `mlx_lm.server --model netprojects/SenseNova-Loop-9B-MLX-6bit --trust-remote-code`.
- Requisitos de software: Python 3.11 o superior y mlx-lm 0.32 o superior.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-6bit (esta versión) | ≈8,96B | 512K (YaRN) | Apache 2.0 | MLX safetensors, 7,3 GB | Optimizado para Apple Silicon; 96,7 % de concordancia top-1 con bf16 |
| SenseNova-Loop-9B (original) | ≈8,96B | 512K (YaRN) | Apache 2.0 | PyTorch/Transformers, bf16 | Referencia de calidad; requiere GPU o memoria unificada amplia |
| SenseNova-Loop-9B-Preview | no disponible | no disponible | no disponible | no disponible | Versión preliminar; inferiores resultados en los siete benchmarks comparados |
| Qwen3.8-27B | 27B (aproximado) | no disponible | no disponible | no disponible | Comparable en AutomationBench (36,67) y AIDABench (65,01); superior en NL2Repo (44,60) |

## Limitaciones y advertencias

- La cuantización a 6 bits introduce una divergencia medible respecto a bf16: solo 2 de 16 prompts generan texto greedy idéntico, aunque la concordancia top-1 es del 96,7 %.
- Los benchmarks mostrados corresponden al modelo original en BF16, no a esta conversión; el rendimiento real en tareas agénticas puede diferir.
- No se dispone de información sobre sesgos conocidos, composición del dataset de entrenamiento ni idiomas soportados, lo que dificulta evaluar su comportamiento en dominios sensibles o en lenguas distintas del inglés.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de código y análisis de datos conviene validar las salidas antes de llevarlas a producción.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio incluye un archivo NOTICE que debe conservarse; el autor de la conversión no está afiliado a SenseTime/SenseNova.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código incluido en el repositorio; conviene revisarlo antes de desplegarlo en entornos sensibles.
- Solo funciona en Apple Silicon con mlx-lm; no es portable a CUDA ni a otros backends sin reconversión.
- El contexto de 512K tokens exige memoria adicional para la caché KV y los estados recurrentes, que puede superar ampliamente el tamaño de los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Versión MLX 8 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Versión MLX 4 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Versión MLX bf16: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Perfil de NetProjects: https://huggingface.co/netprojects
- Sitio del autor de la conversión: https://netprojects.com
