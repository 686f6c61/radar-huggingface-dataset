# netprojects/Raon-1-mini-MLX-3bit-mixed

## Resumen

Raon-1-mini es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por KRAFTON AI y entrenado desde cero. Cuenta con 28.800 millones de parámetros totales, de los cuales 4.300 millones están activos por token (6 de 128 expertos enrutados más 1 compartido), y una ventana de contexto de 262.144 tokens. Su arquitectura híbrida combina 18 capas de Raon Delta Attention con 7 capas de MLA con compuerta, e incorpora razonamiento integrado con seis niveles de esfuerzo configurables por petición.

El repositorio que nos ocupa, `netprojects/Raon-1-mini-MLX-3bit-mixed`, es una cuantización de 3 bits mixta para Apple Silicon realizada por NetProjects a partir de la publicación MXFP8 de KRAFTON. Ocupa 14,4 GB en disco y está pensado para ejecutarse en Macs con 24 GB de memoria unificada, lo que lo convierte en la variante más ligera de la familia de builds MLX publicada por este autor. El modelo base destaca en conversación en coreano y en tareas agénticas, con soporte de tool calling y siete idiomas.

La relevancia de esta ficha radica en que permite ejecutar un MoE de casi 33.000 millones de parámetros en hardware de consumo Apple con una pérdida de fidelidad medida respecto a los pesos bf16 del 6,1% en top-1 (93,9% de coincidencia sobre 311 posiciones evaluadas con teacher forcing). Es, por tanto, una opción práctica para desarrollo local y prototipado en macOS, no para despliegue en producción de alta concurrencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 18 capas Raon Delta Attention + 7 capas gated MLA |
| Parámetros totales | 32.697.914.936 (32,7 B) |
| Parámetros activos | 4,3 B por token (6 de 128 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 3 bits mixta (expertos enrutados en 3-bit affine, group size 64; resto de capas lineales en 6 bits; cabeza de salida y embeddings en 8 bits; router, `kv_b_proj` y compuertas RDA en bf16) |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE entrenado desde cero por KRAFTON AI. La arquitectura alterna 18 capas de Raon Delta Attention (una variante de atención con estado recurrente propietaria de KRAFTON) con 7 capas de atención multi-cabeza latente (MLA) con compuerta. El enrutamiento MoE activa 6 de 128 expertos enrutados más un experto compartido por token, lo que da los 4,3 B de parámetros activos sobre un total de 28,8 B. Dispone de seis niveles de esfuerzo de razonamiento (`none`, `low`, `medium`, `high`, `xhigh`, `max`) seleccionables por petición, y de una cabeza de salida opcional en dos etapas.

Esta build concreta no entrena ni modifica pesos: parte de la revisión `aa14d2989727` de `KRAFTON/Raon-1-mini` (expertos enrutados en fp8 con una escala potencia de dos por cada 32 entradas, resto en bf16) y aplica cuantización de precisión mixta. Los expertos enrutados se dequantizan exactamente desde MXFP8 y se recuantizan a 3 bits affine con group size 64; las capas de atención, expertos compartidos y primera capa densa pasan a 6 bits; la cabeza de salida y los embeddings a 8 bits; y el router, `kv_b_proj` y las proyecciones de compuerta RDA permanecen en bf16. El código (`raon_mlx_model.py`, `raon_serve.py`, tokenizer y plantilla de chat) se toma sin cambios de `KRAFTON/Raon-1-mini-mlx` en la revisión `78b7555b8902`. Se incluye además el modelo borrador DFlash2 para decodificación especulativa, aunque con esta build su uso resulta más lento que la generación plana (ver más abajo).

## Capacidades

- Generación de texto y razonamiento multi-paso con seis niveles de esfuerzo configurables por petición.
- Razonamiento matemático y científico de competición (AIME 2026, HMMT Feb 2026, GPQA Diamond).
- Conversación multi-turno y tareas de búsqueda (MultiChallenge, BrowseComp Plus).
- Tool calling / function calling, con configuraciones preparadas para Hermes Agent, Pi y OpenCode.
- Capacidades agénticas y razonamiento encadenado en varios pasos.
- Multilingüe en siete idiomas: coreano, inglés, japonés, chino, español, francés y tailandés.
- Modo de pensamiento (thinking) activable o desactivable en la plantilla de chat mediante `enable_thinking`.
- Cabeza de salida opcional en dos etapas.
- Decodificación especulativa mediante el modelo borrador DFlash2 incluido (funcional, pero no la ruta más rápida en esta build).

## Casos de uso

- Asistente de conversación local en Mac: el modelo gestiona diálogos multi-turno con hasta 262.144 tokens de contexto, suficiente para mantener historiales largos y documentos de referencia en memoria, con el nivel de esfuerzo `none` para respuestas rápidas de chat.
- Razonamiento matemático y científico asistido: con esfuerzo `high` o `xhigh` el modelo resuelve problemas tipo competición; útil para herramientas de tutoría o verificación de demostraciones en local sin enviar datos a la nube.
- Agente de código en el escritorio: soporta tool calling y se integra con OpenCode y Hermes Agent, de modo que puede orquestar edición de ficheros, ejecución de comandos y consultas a repositorios desde una sesión local en Apple Silicon. KRAFTON recomienda `presence_penalty` 0 para código y matemáticas.
- Procesamiento de documentación multilingüe: al cubrir coreano, inglés, japonés, chino, español, francés y tailandés, sirve para resumir, traducir o extraer información de corpus mixtos en un único modelo.
- Prototipado de pipelines agénticos con búsqueda: las puntuaciones en MultiChallenge y BrowseComp Plus lo sitúan como candidato para agentes que alternan consultas a herramientas y razonamiento multi-paso, con contexto largo para acumular resultados intermedios.
- Servidor compatible con OpenAI para desarrollo: `python raon_mlx_model.py serve --no-dflash` expone un endpoint que acepta el parámetro `reasoning_effort`, lo que permite probar integraciones antes de migrar a infraestructura GPU.
- Evaluación e investigación de cuantización: al publicarse las tres builds (3, 6 y 8 bits) con métricas de fidelidad top-1 frente a bf16, es un caso útil para estudiar el impacto de la cuantización mixta en un MoE de 128 expertos.

## Benchmarks y rendimiento

Datos de benchmarks del modelo base publicados por KRAFTON (no de esta build cuantizada):

| Benchmark | Resultado |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

Métricas de fidelidad y velocidad de las builds MLX de NetProjects, medidas sobre un MacBook Pro M5 Max con 128 GB:

| Build | Tamaño | Top-1 vs bf16 | Decodificación plana | Decodificación DFlash2 |
|---|---|---|---|---|
| 6-bit (recomendada) | 24,0 GB | 97,8% | 121 tok/s | 22 tok/s |
| 8-bit | 30,1 GB | 97,4% | 106 tok/s | 95 tok/s |
| 3-bit mixed (esta) | 14,4 GB | 93,9% | 39 tok/s | 62 tok/s |

La métrica top-1 se calcula sobre 311 posiciones con teacher forcing (8 prompts cortos en inglés y coreano, con thinking activado y desactivado). Las velocidades son indicativas, con un prompt corto greedy cada una, esfuerzo `none` en generación plana y thinking activado en DFlash2.

No se han publicado resultados de benchmarks del modelo cuantizado sobre las tareas estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 14,4 GB de pesos; con overhead de ejecución conviene disponer de al menos 24 GB de memoria unificada, que es el objetivo declarado de esta build.
- Hardware objetivo: Apple Silicon. Probado en MacBook Pro con chip M5 Max y 128 GB; encaja en Macs de 24 GB o más.
- GPU NVIDIA: no aplicable; los pesos están en formato MLX y el código de modelo es específico de MLX. Para CUDA existen otras publicaciones de KRAFTON.
- Despliegue: `mlx-lm` 0.32.2 con `mlx` 0.32.4 y `transformers` 5.20.1 (versiones fijadas por KRAFTON). Rutas disponibles: CLI `raon_mlx_model.py generate`, servidor compatible con OpenAI `raon_mlx_model.py serve` y `python -m mlx_lm server --trust-remote-code`.
- Decodificación especulativa: el borrador DFlash2 está incluido, pero sus kernels rápidos de verificación están escritos para NVFP4 y MXFP8; con las capas affine de esta build la generación plana es más rápida. Se recomienda `--no-dflash`. Para aprovechar DFlash2 hay que usar la build NVFP4 de 4 bits de KRAFTON.
- Throughput medido: 39 tok/s en generación plana y 62 tok/s con DFlash2 en M5 Max de 128 GB (indicativo).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Raon-1-mini MLX 3-bit mixed (esta build) | 32,7 B | 4,3 B | 262.144 | Apache 2.0 | MLX, 14,4 GB |
| Raon-1-mini MLX 6-bit (NetProjects) | 32,7 B | 4,3 B | 262.144 | Apache 2.0 | MLX, 24,0 GB, top-1 97,8%, 121 tok/s |
| Raon-1-mini MLX 8-bit (NetProjects) | 32,7 B | 4,3 B | 262.144 | Apache 2.0 | MLX, 30,1 GB, top-1 97,4%, 106 tok/s |
| Raon-1-mini-mlx NVFP4 de KRAFTON | 32,7 B | 4,3 B | 262.144 | Apache 2.0 | MLX, 4 bits, compatible con aceleración DFlash2 |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes de tamaño o categoría equivalente.

## Limitaciones y advertencias

- Pérdida de fidelidad por cuantización: la coincidencia top-1 frente a bf16 es del 93,9%, la más baja de las tres builds de NetProjects. Para tareas sensibles a la precisión (matemáticas de competición, código en producción) conviene valorar la build de 6 u 8 bits.
- DFlash2 no aporta ventaja en esta build: sus kernels rápidos están escritos para NVFP4 y MXFP8, por lo que la decodificación especulativa resulta más lenta que la generación plana; hay que usar `--no-dflash`.
- Sesgos: no se documentan en la información disponible análisis de sesgos del modelo base ni de la build cuantizada.
- Alucinación: no se publican evaluaciones específicas de tasa de alucinación; como todo modelo generativo, es susceptible de producir contenido incorrecto con apariencia plausible.
- Cobertura idiomática desigual: el modelo está entrenado en siete idiomas, pero su especialización declarada es el coreano y el inglés; el rendimiento en español, francés, tailandés, japonés y chino no se cuantifica en la documentación disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse la atribución correspondiente a KRAFTON AI y a NetProjects según los términos de la licencia.
- Dependencias fijadas: requiere versiones concretas de `mlx`, `mlx-lm` y `transformers`; mezclar versiones puede romper la carga del modelo. Además, `trust_remote_code=True` es necesario porque el código del modelo se carga desde la carpeta local.
- Ecosistema restringido: solo Apple Silicon; no hay pesos GGUF ni soporte CUDA en este repositorio.
- Parámetros de muestreo recomendados por KRAFTON: `presence_penalty` 1,5 para uso general y 0 para código y matemáticas; esfuerzo `none` para chat y tool calls simples.
- Advertencia de producción: el rendimiento medido (39 tok/s en generación plana) corresponde a un único prompt corto en un M5 Max; la concurrencia y las secuencias largas reducirán sustancialmente el throughput.

## Enlaces

- Repositorio Hugging Face de esta build: https://huggingface.co/netprojects/Raon-1-mini-MLX-3bit-mixed
- Build de 6 bits: https://huggingface.co/netprojects/Raon-1-mini-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Raon-1-mini-MLX-8bit
- Modelo base (KRAFTON): https://huggingface.co/KRAFTON/Raon-1-mini
- Build MLX NVFP4 de KRAFTON: https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- NetProjects: https://netprojects.com
