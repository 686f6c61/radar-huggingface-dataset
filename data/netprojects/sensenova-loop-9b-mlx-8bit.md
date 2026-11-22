# netprojects/SenseNova-Loop-9B-MLX-8bit

## Resumen

SenseNova-Loop-9B-MLX-8bit es una conversión a 8 bits (cuantización afín, tamaño de grupo 64) del modelo SenseNova-Loop-9B, publicada por NetProjects (Internet Projects Ltd) para su ejecución en hardware Apple Silicon mediante la librería MLX. El modelo base, desarrollado por SenseTime / SenseNova y publicado el 17 de noviembre de 2026, es un transformer basado en Qwen3.5 con dos modificaciones arquitectónicas principales: ejecución en bucle (looped execution) con pesos compartidos y un mecanismo de dos flujos residuales denominado mHC (multi-head routing con matrices de Sinkhorn). Cuenta con aproximadamente 8.950 millones de parámetros y un contexto nativo de 262.144 tokens, ampliable mediante YaRN.

La relevancia de esta ficha radica en que se trata de la conversión cuantizada más fiel al modelo original disponible para Apple Silicon, con un tamaño de pesos de 9,5 GB y una concordancia del 98,6 % en el token top-1 respecto al código PyTorch original en bf16. Incluye además soporte de entrada de imagen (torre de visión en bfloat16) y una cabeza MTP (multi-token prediction) que acelera la decodificación aproximadamente 1,7 veces. La licencia es Apache 2.0 y el modelo está pensado para generación de texto conversacional, tareas agénticas, codificación y análisis de datos.

Esta ficha describe la conversión MLX 8-bit; las capacidades y benchmarks del modelo subyacente corresponden al SenseNova-Loop-9B original en bf16, tal como los reporta SenseNova.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con ejecución en bucle (looped transformer) y dos flujos residuales mHC; atención completa combinada con Gated DeltaNet |
| Parametros totales | 8.956.947.840 (~8,95 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 posiciones nativas; escalado YaRN con factor 2 (configuración de 512K tokens según SenseNova) |
| Tipos de cuantizacion | 8 bits afín con tamaño de grupo 64; existen builds de 4 bits, 6 bits y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye `model.fp32norms.safetensors`, `vision.safetensors` (bfloat16) y `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B parte de la arquitectura Qwen3.5 e incorpora dos innovaciones. La primera es la ejecución en bucle: las capas 0–3 se ejecutan una vez, las capas 4–27 se ejecutan dos veces con pesos compartidos y las capas 28–31 una vez, resultando en 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché (KV cache para atención completa, estado convolucional y recurrente para Gated DeltaNet). La segunda es el mecanismo mHC (multi-head routing con dos flujos) aplicado a las capas 4–27: el estado oculto se divide en dos flujos residuales enrutados por pequeños routers en float32 (puertas pre/post y una matriz de mezcla 2×2 de Sinkhorn con 20 iteraciones). Los 96 tensores de router permanecen en float32 y nunca se cuantizan.

En esta conversión MLX 8-bit, los 81 pesos RMSNorm también se envían en float32 para que las normas se calculen exactamente como en el código de SenseNova. El código del modelo (`sensenova_loop.py`) se incluye en el repositorio y se carga mediante `trust_remote_code=True`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La innovación destacable a nivel de inferencia es la cabeza MTP (multi-token prediction), que propone tokens candidatos y el modelo los verifica en una sola pasada, logrando una decodificación aproximadamente 1,7 veces más rápida.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat y modo de razonamiento (thinking) activable mediante `enable_thinking`.
- Razonamiento multi-paso y tareas agénticas: el modelo base reporta resultados en benchmarks como AutomationBench, Terminal-Bench 2.1 y GAIA.
- Codificación y tareas de terminal: resultados reportados en Terminal-Bench 2.1 y NL2Repo.
- Análisis de datos y consultas SQL: resultados reportados en AIDABench y BIRD.
- Entrada de imagen (modelo multimodal): torre de visión en bfloat16, con límite por defecto de aproximadamente 1 megapíxel por imagen y límite nativo de SenseNova de 16,7 MP.
- Contexto largo: manejo de prompts de hasta 262.144 posiciones con escalado YaRN; el build de 6 bits del mismo autor localizó un código oculto en un prompt de 64K tokens.
- Decodificación especulativa mediante cabeza MTP para acelerar la generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: despliegue de un chatbot multi-turno en un MacBook Pro con Apple Silicon mediante `mlx_lm.server`, aprovechando los 9,5 GB de pesos y la ventana de contexto de 262.144 tokens para mantener historiales largos sin recortes agresivos.
- Automatización de tareas agénticas de escritorio: uso del modelo en pipelines que requieren razonamiento multi-paso y ejecución de comandos, respaldado por los resultados reportados en Terminal-Bench 2.1 (59,55) y AutomationBench (36,67).
- Análisis de documentos extensos: procesamiento de contratos, informes o bases de código de decenas de miles de tokens gracias al contexto nativo de 262.144 posiciones y al escalado YaRN, con la ventaja de que el build de 6 bits del mismo autor demostró recuperación de información en prompts de 64K tokens.
- Generación y revisión de código en local: integración en editores o scripts de CI/CD en entornos macOS para tareas de NL2Repo y corrección de código, con decodificación acelerada por MTP para reducir latencia en bucles de edición.
- Consultas a bases de datos en lenguaje natural: traducción de preguntas a SQL (NL2SQL) en aplicaciones de análisis, respaldado por el resultado reportado en BIRD (72,34).
- Descripción y análisis de imágenes: uso de la entrada de visión para tareas de captioning, extracción de información de capturas de pantalla o documentos escaneados, con imágenes limitadas por defecto a ~1 MP para controlar el consumo de memoria.
- Prototipado e investigación sobre arquitecturas en bucle: estudio de transformers con pesos compartidos y enrutamiento mHC en un entorno MLX reproducible, comparando la fidelidad de las distintas cuantizaciones (4, 6 y 8 bits) frente a bf16.

## Benchmarks y rendimiento

Los siguientes resultados son los reportados por SenseNova para el modelo original en BF16, copiados de la model card original. No corresponden a la conversión MLX 8-bit y no deben interpretarse como mediciones de esta build.

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | no disponible |
| GAIA | 69,90 | 37,86 | no disponible |
| AIDABench | 65,31 | no disponible | 65,01 |
| NL2Repo | 41,36 | no disponible | 44,60 |
| BIRD | 72,34 | 71,38 | no disponible |

SenseNova indica que la versión release supera a la Preview en los siete benchmarks de su gráfico comparativo, que también incluye τ³-Banking y otras líneas base. Ambos usan dos bucles por defecto; en el estudio de escalado de bucles de SenseNova, tres o cuatro bucles obtuvieron puntuaciones aún más altas en algunas tareas.

Fidelidad de la conversión MLX 8-bit respecto al código PyTorch de SenseNova (Transformers 5.18, bf16) sobre 16 prompts, en todas las posiciones:

| Build | Tamano | Mismo token top-1 que el codigo de SenseNova | KL en el ultimo token | Texto greedy identico (16 prompts) | Prompts de imagen: mismo token top-1 que bf16 |
|---|---|---|---|---|---|
| 6 bits (recomendado) | 7,3 GB | 96,7 % | 0,0056 | 4 / 16 | 98,0 % |
| 8 bits (esta build) | 9,5 GB | 98,6 % | 0,0015 | 11 / 16 | 96,7 % |
| 4 bits | 5,1 GB | 84,4 % | 0,1038 | 2 / 16 | 95,4 % |
| bf16 | 17,9 GB | 99,1 % | 0,0005 | 12 / 16 | referencia |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,5 GB solo para los pesos en 8 bits; hay que sumar la caché KV (una ranura por pasada de capa, 56 pasadas por token), el estado convolucional y recurrente de Gated DeltaNet, la torre de visión en bfloat16 y la cabeza MTP. Para contexto largo y entrada de imagen se recomienda un equipo con 32 GB o más de memoria unificada.
- GPU/equipo recomendado: Apple Silicon exclusivamente (la librería MLX no soporta CUDA). Las pruebas del autor se realizaron en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no es ejecutable en GPU NVIDIA/AMD mediante MLX.
- Opciones de despliegue: `mlx-lm` 0.32 o superior (Python 3.11+), servidor mediante `mlx_lm.server --trust-remote-code`, y el runtime `sensenova-loop-mlx v0.3.0` para entrada de imagen y decodificación MTP.
- Latencia y throughput: no se han publicado cifras de latencia o throughput en la información disponible; el autor indica que la cabeza MTP ofrece una decodificación aproximadamente 1,7 veces más rápida, y que el resultado greedy con MTP coincide con la decodificación normal salvo cuando los dos mejores tokens están empatados dentro de 0,25 logits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-8bit (esta ficha) | ~8,95 mil millones | 262.144 (YaRN factor 2) | Apache 2.0 | MLX, Apple Silicon | 9,5 GB; fidelidad 98,6 % top-1 vs bf16 |
| SenseNova-Loop-9B original | ~8,95 mil millones | 262.144 (YaRN factor 2) | Apache 2.0 | PyTorch/Transformers | Referencia bf16; benchmarks de la tabla anterior |
| SenseNova-Loop-9B-MLX-6bit | ~8,95 mil millones | 262.144 (YaRN factor 2) | Apache 2.0 | MLX, Apple Silicon | 7,3 GB; recomendado por el autor por equilibrio tamano/fidelidad (96,7 % top-1) |
| SenseNova-Loop-9B-MLX-4bit | ~8,95 mil millones | 262.144 (YaRN factor 2) | Apache 2.0 | MLX, Apple Silicon | 5,1 GB; fidelidad 84,4 % top-1, KL 0,1038 |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Citado por SenseNova como línea base en AutomationBench (36,67) y AIDABench (65,01), NL2Repo (44,60) |

## Limitaciones y advertencias

- La conversión MLX 8-bit no es idéntica al modelo original: el texto greedy coincide en 11 de 16 prompts y el token top-1 en el 98,6 % de las posiciones. Para aplicaciones que requieren reproducibilidad exacta frente a bf16, debe tenerse en cuenta esta divergencia.
- El modelo solo se ejecuta en Apple Silicon mediante MLX; no hay soporte CUDA ni despliegue en GPU NVIDIA con esta build.
- La entrada de imagen requiere el runtime externo `sensenova-loop-mlx v0.3.0`; `mlx_lm.load` y `mlx_lm.server` usan únicamente el modelo de texto.
- El límite por defecto de ~1 MP por imagen es una restricción práctica de memoria; el límite nativo de 16,7 MP de SenseNova consume mucha más memoria.
- La decodificación MTP puede diferir del resultado greedy normal cuando los dos mejores tokens están empatados dentro de 0,25 logits.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni cobertura de idiomas; deben evaluarse empíricamente antes de usar el modelo en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la conversión (NetProjects) no está afiliado a SenseTime / SenseNova; conviene verificar la licencia y condiciones del modelo base original.
- Los benchmarks publicados corresponden al modelo base en BF16, no a esta conversión cuantizada; el rendimiento real en 8 bits puede diferir.
- El contexto de 262.144 posiciones con YaRN factor 2 implica un coste de memoria elevado para la caché KV multiplicada por las 56 pasadas de capa por token.

## Enlaces

- Repositorio Hugging Face de esta build: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Modelo base original: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build de 6 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Runtime MLX para visión y MTP (v0.3.0): https://github.com/internet-projects/sensenova-loop-mlx/releases/tag/v0.3.0
- Sitio del autor de la conversión: https://netprojects.com
