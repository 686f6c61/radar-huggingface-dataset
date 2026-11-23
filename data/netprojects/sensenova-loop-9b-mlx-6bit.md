# netprojects/SenseNova-Loop-9B-MLX-6bit

## Resumen

SenseNova-Loop-9B-MLX-6bit es una conversión a 6 bits en formato MLX del modelo SenseNova-Loop-9B, desarrollado originalmente por SenseTime / SenseNova y publicado el 17 de noviembre de 2026. Esta versión concreta la publica NetProjects (Internet Projects Ltd), que no tiene afiliación con SenseTime. El objetivo es ejecutar el modelo en Apple Silicon con mlx-lm, ocupando 7,3 GB de pesos en lugar de los 17,9 GB del bf16 original, con una calidad cercana al 8 bits.

El modelo base es un transformer de tipo "looped" construido sobre Qwen3.5, con 8.956.947.840 parámetros (aproximadamente 9B). Incorpora dos modificaciones sobre la arquitectura Qwen3.5: ejecución en bucle de capas (las capas 4–27 se ejecutan dos veces con pesos compartidos, lo que da 56 pasadas de capa por token) y un mecanismo mHC de dos flujos en esas mismas capas. Además soporta entrada de texto e imagen y un contexto configurado con YaRN de 512K tokens.

Esta conversión es relevante porque permite ejecutar un modelo de 9B con contexto largo, capacidades multimodales y decodificación acelerada mediante MTP en hardware de consumo de Apple, manteniendo una fidelidad alta respecto a la implementación PyTorch de referencia (96,7% de coincidencia en el token top y KL de 0,0056 en el último token).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer looped basado en Qwen3.5, con mHC de dos flujos y atencion Gated DeltaNet |
| Parametros totales | 8.956.947.840 (aproximadamente 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K tokens configurados con YaRN (factor 2 sobre 262.144 posiciones) |
| Tipos de cuantizacion | 6 bits afín, group size 64 (existen variantes 4-bit, 8-bit y bf16 del mismo autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), vision tower en bfloat16, cabezas MTP y routers en float32 |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B parte de Qwen3.5 y añade dos elementos. El primero es la ejecución en bucle: las capas 0–3 se ejecutan una vez, las capas 4–27 se ejecutan dos veces con pesos compartidos y las capas 28–31 una vez, totalizando 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché (KV cache para atención completa, estado convolucional y recurrente para Gated DeltaNet). El segundo es el mecanismo mHC de dos flujos en las capas 4–27: el estado oculto se divide en dos flujos residuales enrutados por routers en float32 (gates pre/post y una matriz de mezcla 2×2 de Sinkhorn con 20 iteraciones). Los 96 tensores de router permanecen en float32 y no se cuantizan.

La conversión MLX mantiene los 81 pesos RMSNorm en float32 (en `model.fp32norms.safetensors`) para que las normas se calculen exactamente como en el código de SenseNova. El código del modelo es `sensenova_loop.py`, incluido en el repositorio y cargado por mlx-lm mediante `trust_remote_code=True`. El modelo incorpora una cabeza de predicción multi-token (MTP) que permite decodificación especulativa con una aceleración aproximada de 1,7×. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento con modo "thinking" activable mediante `enable_thinking=True`.
- Entrada de imagen (el vision tower se mantiene en bfloat16), con múltiples imágenes por prompt y un límite por defecto de aproximadamente 1 megapíxel por imagen.
- Contexto largo de hasta 512K tokens mediante YaRN; verificado en la práctica localizando un código oculto en un prompt de 64K tokens.
- Decodificación acelerada mediante la cabeza MTP (multi-token prediction).
- Capacidades orientadas a tareas agénticas, de código y de análisis de datos, según la evaluación de SenseNova.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos en local: con 512K tokens de contexto y capacidad de imagen, se puede introducir un informe completo o varios documentos y hacer preguntas sobre ellos en un Mac con suficiente memoria unificada.
- Asistente de código en el portátil: el modelo rinde en tareas de terminal y generación de repositorios (Terminal-Bench 2.1: 59,55; NL2Repo: 41,36) y puede ejecutarse con mlx-lm en Apple Silicon sin GPU dedicada.
- Automatización de tareas agénticas: sus resultados en AutomationBench (36,67) y GAIA (69,90) lo hacen adecuado para flujos multi-paso donde el modelo debe razonar sobre herramientas y estado.
- Consultas sobre bases de datos en lenguaje natural: con BIRD en 72,34, puede traducir preguntas a SQL en entornos de análisis de datos.
- Procesamiento de imágenes con descripción y razonamiento: clasificación, descripción o extracción de información de fotografías usando el script `generate_vision.py` con una o varias imágenes.
- Prototipado e investigación en arquitecturas looped: al incluir el código `sensenova_loop.py` y mantener routers y normas en float32, sirve para estudiar el comportamiento de transformers con capas reutilizadas sin necesidad de un clúster.
- Despliegue de servidor local: `mlx_lm.server` permite exponer el modelo como API compatible para pruebas de integración en una máquina Apple.

## Benchmarks y rendimiento

Resultados reportados por SenseNova para el modelo BF16 original (no para esta conversión MLX):

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | no disponible |
| GAIA | 69,90 | 37,86 | no disponible |
| AIDABench | 65,31 | no disponible | 65,01 |
| NL2Repo | 41,36 | no disponible | 44,60 |
| BIRD | 72,34 | 71,38 | no disponible |

Fidelidad de la conversión respecto al código PyTorch de referencia (bf16, 16 prompts, todas las posiciones):

| Build | Tamano | Mismo token top | KL en ultimo token | Texto greedy identico | Imagen: mismo token top |
|---|---|---|---|---|---|
| 6-bit (esta version) | 7,3 GB | 96,7% | 0,0056 | 4 / 16 | 98,0% |
| 8-bit | 9,5 GB | 98,6% | 0,0015 | 11 / 16 | 96,7% |
| 4-bit | 5,1 GB | 84,4% | 0,1038 | 2 / 16 | 95,4% |
| bf16 | 17,9 GB | 99,1% | 0,0005 | 12 / 16 | referencia |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 7,3 GB de pesos en 6 bits, más caché KV y estados recurrentes; con contexto largo el consumo crece de forma significativa.
- Hardware de referencia: MacBook Pro M5 Max con 128 GB, donde se realizaron las pruebas de fidelidad.
- Cabe en GPU de consumo Apple Silicon con memoria unificada suficiente; no está pensado para GPUs NVIDIA (formato MLX).
- Requiere Python 3.11 o superior y mlx-lm 0.32 o superior.
- Despliegue: `mlx_lm.load` y `mlx_lm.server` para texto; el runtime `sensenova-loop-mlx v0.3.0` para imagen y decodificación MTP.
- Aceleración: la cabeza MTP ofrece aproximadamente 1,7× de velocidad de decodificación según el autor.
- Latencia y throughput concretos: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-6bit | ~9B | 512K (YaRN) | Apache 2.0 | MLX, Apple Silicon | Conversion 6-bit, 7,3 GB, fidelidad 96,7% token top |
| SenseNova-Loop-9B-MLX-8bit | ~9B | 512K (YaRN) | Apache 2.0 | MLX, Apple Silicon | 9,5 GB, fidelidad 98,6% token top |
| SenseNova-Loop-9B (bf16) | ~9B | 512K (YaRN) | Apache 2.0 | PyTorch / Transformers | Referencia, 17,9 GB |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | Usado como baseline por SenseNova en AutomationBench, AIDABench y NL2Repo |

## Limitaciones y advertencias

- Es una conversión no oficial: NetProjects no está afiliado a SenseTime / SenseNova, por lo que el soporte y las garantías dependen del tercero.
- La cuantización a 6 bits introduce divergencia respecto al bf16: solo el 4 de 16 prompts generan texto greedy idéntico, aunque la coincidencia en el token top es del 96,7% y el KL es bajo (0,0056).
- La decodificación con MTP puede diferir del decoding plano cuando los dos mejores tokens están empatados dentro de 0,25 logits.
- El límite por defecto de aproximadamente 1 megapíxel por imagen reduce la resolución respecto al límite original de SenseNova (16,7 MP), que exige mucha más memoria.
- El contexto largo (512K) incrementa el consumo de memoria por las cachés KV y los estados recurrentes de las 56 pasadas de capa.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe uniforme.
- Riesgo de alucinación y sesgos: no se han publicado análisis específicos en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes derivados.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `sensenova_loop.py` antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Variante 8-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Variante 4-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Variante bf16: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Runtime MLX con vision y MTP: https://github.com/internet-projects/sensenova-loop-mlx/releases/tag/v0.3.0
- NetProjects: https://netprojects.com
