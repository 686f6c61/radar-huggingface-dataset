# netprojects/SenseNova-Loop-9B-MLX-4bit

## Resumen

SenseNova-Loop-9B-MLX-4bit es una conversión a 4 bits en formato MLX del modelo SenseNova-Loop-9B, desarrollado originalmente por SenseTime/SenseNova y publicado el 17 de noviembre de 2026. Esta versión concreta la mantiene el usuario netprojects (Internet Projects Ltd) y está pensada para ejecutar el modelo en Apple Silicon mediante la librería mlx-lm. El modelo base es un transformer basado en Qwen3.5 con dos modificaciones arquitectónicas: ejecución en bucle (looped execution) y un mecanismo de dos flujos residuales denominado mHC.

El modelo resuelve tareas de generación de texto multimodal (texto e imagen) con capacidades de razonamiento, agentes y análisis de datos, y su interés actual radica en que consigue un rendimiento en tareas agénticas (AutomationBench 36,67; Terminal-Bench 2.1 59,55; GAIA 69,90) con solo 8.956.949.376 parámetros, compitiendo con modelos notablemente mayores como Qwen3.8-27B. La versión MLX 4-bit reduce el peso a 5,1 GB, lo que permite ejecutarlo en Macs de 16 GB de memoria unificada.

La arquitectura es un transformer con 32 capas, de las cuales las capas 4 a 27 se ejecutan dos veces con pesos compartidos, dando 56 pasadas de capa por token. El contexto nominal es de 262.144 posiciones con escalado YaRN factor 2, y el autor de la conversión indica que se soporta la configuración de 512K tokens de SenseNova. Esta build prioriza el tamaño mínimo sobre la fidelidad numérica respecto al modelo original en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con ejecución en bucle (looped transformer) y dos flujos residuales mHC; atención completa y Gated DeltaNet |
| Parametros totales | 8.956.949.376 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 posiciones con YaRN factor 2 en la configuración del modelo; el autor de la conversión menciona el ajuste de 512K tokens de SenseNova |
| Tipos de cuantizacion | 4-bit afín con group size 64 (esta build); existen builds 6-bit, 8-bit y bf16 del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); 5,1 GB de pesos, 6,5 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B es un transformer de 32 capas construido sobre Qwen3.5. Su innovación principal es la ejecución en bucle: las capas 0 a 3 se ejecutan una vez, las capas 4 a 27 se ejecutan dos veces con pesos compartidos y las capas 28 a 31 una vez, totalizando 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché (KV cache para atención completa, estado convolucional y recurrente para Gated DeltaNet). Además, en las capas 4 a 27 se aplica el mecanismo mHC de dos flujos: el estado oculto se divide en dos flujos residuales enrutados por routers en float32 (puertas pre/post y una matriz de mezcla 2×2 Sinkhorn con 20 iteraciones). Los 96 tensores de router permanecen en float32 y no se cuantizan.

El contexto largo se consigue con escalado YaRN (factor 2 sobre 262.144 posiciones). El modelo incorpora una cabeza MTP (multi-token prediction) que, según el autor de la conversión, acelera la decodificación unas 1,7 veces. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. La conversión MLX mantiene en float32 los 81 pesos de RMSNorm (en `model.fp32norms.safetensors`) y carga el código mediante `trust_remote_code=True` con el archivo `sensenova_loop.py` incluido en el repositorio.

## Capacidades

- Generación de texto conversacional con plantilla de chat y modo thinking activable (`enable_thinking=True`).
- Entrada multimodal de imagen además de texto, según indica la model card de la conversión.
- Razonamiento multi-paso y ejecución de agentes, evaluado por SenseNova en benchmarks como GAIA y AutomationBench.
- Generación y comprensión de código, con resultados reportados en Terminal-Bench 2.1 y NL2Repo.
- Análisis de datos y consultas sobre bases de datos, con resultados en AIDABench y BIRD.
- Contexto largo: el autor de la conversión verificó que la build 6-bit localiza un código oculto en un prompt de 64K tokens; la configuración soporta hasta 262.144 posiciones con YaRN.
- Decodificación especulativa mediante la cabeza MTP integrada, con salida greedy equivalente a la decodificación normal salvo empates dentro de 0,25 logits.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Asistencia conversacional local en Mac: con 5,1 GB de pesos, el modelo cabe en un Mac de 16 GB y permite desplegar un chatbot con modo thinking mediante `mlx_lm.server`, sin depender de servicios en la nube.
- Automatización de tareas agénticas: los resultados reportados en AutomationBench (36,67) y GAIA (69,90) lo hacen adecuado para pipelines de agentes que resuelven tareas multi-paso con herramientas, ejecutados en hardware Apple.
- Análisis de documentos largos: con contexto de hasta 262.144 posiciones y YaRN, puede procesar informes extensos, contratos o expedientes completos en una sola pasada, útil para extracción de datos y resúmenes.
- Generación de código en entornos de desarrollo sobre macOS: sus resultados en Terminal-Bench 2.1 (59,55) y NL2Repo (41,36) permiten integrarlo en asistentes de terminal y revisión de repositorios ejecutados localmente.
- Consultas en lenguaje natural sobre bases de datos: el resultado en BIRD (72,34) lo hace viable para herramientas internas de NL2SQL en equipos que trabajan en Apple Silicon.
- Prototipado multimodal: al aceptar imágenes, sirve para experimentar con descripción de capturas, extracción de información de documentos escaneados o asistencia visual en aplicaciones de escritorio, usando el runtime `sensenova-loop-mlx`.
- Evaluación e investigación de arquitecturas en bucle: al ser una conversión fiel de un looped transformer con mHC, es útil para estudiar el efecto del número de bucles y comparar fidelidad entre cuantizaciones (4, 6, 8 bits y bf16).

## Benchmarks y rendimiento

Resultados reportados por SenseNova para el modelo original en BF16, según la model card de la conversión:

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | No disponible |
| GAIA | 69,90 | 37,86 | No disponible |
| AIDABench | 65,31 | No disponible | 65,01 |
| NL2Repo | 41,36 | No disponible | 44,60 |
| BIRD | 72,34 | 71,38 | No disponible |

Fidelidad de esta conversión 4-bit respecto al código PyTorch de SenseNova (bf16, Transformers 5.18) sobre 16 prompts, medido en un MacBook Pro M5 Max de 128 GB:

| Metrica | 4-bit (esta build) | 6-bit | 8-bit | bf16 |
|---|---|---|---|---|
| Mismo token top que el código de SenseNova | 84,4% | 96,7% | 98,6% | 99,1% |
| KL en el último token | 0,1038 | 0,0056 | 0,0015 | 0,0005 |
| Texto greedy idéntico (16 prompts) | 2 / 16 | 4 / 16 | 11 / 16 | 12 / 16 |
| Prompts de imagen: mismo token top que bf16 | 95,4% | 98,0% | 96,7% | Referencia |

## Requisitos de hardware

- VRAM/memoria unificada: 5,1 GB de pesos en 4-bit; el repositorio ocupa 6,5 GB. El autor recomienda que la descarga no supere aproximadamente el 60% de la memoria del equipo.
- Cabe en Macs de 16 GB de memoria unificada; el autor la presenta como la build más ligera para ese segmento.
- Builds alternativas del mismo autor: 6-bit (7,3 GB de pesos, recomendada para 16 GB), 8-bit (9,5 GB, para 24 GB) y bf16 (17,9 GB, para 48 GB o más).
- GPU Apple Silicon: requiere chip de la familia M (el autor midió en un MacBook Pro M5 Max de 128 GB). No está pensada para GPU NVIDIA; no se dispone de datos de rendimiento en A100, H100 o RTX 4090.
- Despliegue: `mlx-lm>=0.32` con Python 3.11 o superior para texto (`mlx_lm.load` y `mlx_lm.server`); para entrada de imagen y decodificación MTP se necesita el runtime `sensenova-loop-mlx v0.3.0`. No se soportan vLLM, llama.cpp, Ollama ni TGI en esta build.
- Latencia y throughput: no disponibles de forma numérica; el autor indica una aceleración de aproximadamente 1,7 veces en decodificación con la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-4bit (esta ficha) | 8,96B | 262.144 (YaRN factor 2) | Apache 2.0 | MLX safetensors, Apple Silicon | 5,1 GB; fidelidad 84,4% respecto a bf16 |
| SenseNova-Loop-9B (original) | 8,96B | 262.144 (ajuste 512K reportado) | Apache 2.0 | PyTorch / Transformers | Referencia bf16; requiere `trust_remote_code` |
| SenseNova-Loop-9B-Preview | No disponible | No disponible | No disponible | No disponible | Inferior en los siete benchmarks comparados según SenseNova |
| Qwen3.8-27B | 27B (aproximado por el nombre) | No disponible | No disponible | No disponible | Iguala en AutomationBench (36,67) y supera en NL2Repo (44,60); peor en AIDABench (65,01) |

## Limitaciones y advertencias

- La cuantización 4-bit reduce la fidelidad respecto al original: solo el 84,4% de los tokens top coinciden con el código de SenseNova y el texto greedy idéntico se da en 2 de 16 prompts. El propio autor recomienda la build 6-bit para mayor fidelidad.
- No es una conversión oficial: está publicada por netprojects (Internet Projects Ltd) y no tiene afiliación con SenseTime/SenseNova.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python incluido en el repositorio (`sensenova_loop.py`); conviene auditar ese código antes de usarlo en producción.
- Solo funciona en Apple Silicon con mlx-lm; no hay soporte para CUDA, vLLM, llama.cpp u otros runtimes.
- Los benchmarks mostrados corresponden al modelo original en BF16, no a esta build cuantizada; el rendimiento real en 4-bit puede ser inferior.
- Riesgo de alucinación y sesgos: no se dispone de información específica en la documentación proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento en castellano ni en otros idiomas distintos del inglés.
- Soporte de tool calling: no confirmado explícitamente en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base conviene verificar las condiciones del modelo original SenseNova-Loop-9B.
- El contexto efectivo en la práctica puede verse limitado por la memoria del equipo; el autor solo verificó la recuperación de información en un prompt de 64K tokens con la build 6-bit.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build 6-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Runtime para imagen y MTP: https://github.com/internet-projects/sensenova-loop-mlx/releases/tag/v0.3.0
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
