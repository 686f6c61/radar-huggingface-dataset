# frida404/Qwen3.8-27B-NVFP4-LC32K

## Resumen

Qwen3.8-27B-NVFP4-LC32K es una cuantización post-entrenamiento del modelo Qwen/Qwen3.8-27B (Apache-2.0) desarrollada por el usuario independiente frida404, no afiliada al equipo Qwen ni a NVIDIA. Su objetivo es servir el modelo completo en una única GPU NVIDIA Blackwell de 96 GB, aplicando NVFP4 a más capas que la cuantización de referencia de NVIDIA (nvidia/Qwen3.8-27B-NVFP4), incluidas las 48 proyecciones de atención lineal GDN y la cabeza MTP, y recuperando la precisión en contexto largo mediante calibración sobre documentos de 32K tokens.

El checkpoint ocupa 18,96 GB de safetensors (un 13,5% menos que el de NVIDIA, de 21,92 GB) e incorpora decodificación especulativa MTP cuantizada a NVFP4, además de soporte de visión (pipeline image-text-to-text). Está pensado para despliegue con vLLM sobre una RTX PRO 6000 Blackwell con ventana de hasta 131.072 tokens.

La relevancia actual reside en que demuestra que una cuantización agresiva W4A4 puede mantener el rendimiento en razonamiento y contexto largo con una pérdida controlada (en torno a -1,1 puntos en MRCR-128K frente al checkpoint NVFP4 de NVIDIA), sin necesidad de reentrenamiento y con un único acelerador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal GDN (gated delta net) y atención completa; cabeza MTP para decodificación especulativa; torre de visión |
| Parametros totales | 16.032.107.760 (según safetensors); el nombre comercial indica 27B |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | hasta 131.072 tokens en el perfil de servicio recomendado; calibración sobre ventanas de 32.768 tokens |
| Tipos de cuantizacion | NVFP4 W4A4 (MLP, GDN in_proj_qkv/in_proj_z/out_proj, lm_head, cabeza MTP), FP8 W8A8 per-tensor (atención completa q/k/v/o), BF16 (embeddings, GDN in_proj_a/b, conv1d, normas, torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (18,96 GB en total: 18,65 GB de tronco + 0,31 GB de shard MTP NVFP4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina 48 capas con proyecciones de atención lineal GDN (gated delta net) y 16 capas de atención completa, más una cabeza MTP (multi-token prediction) para decodificación especulativa y una torre de visión. Sobre esta base, la receta de cuantización aplica NVIDIA ModelOpt PTQ con calibración de pesos Local-Hessian por capa, barrido de escalas FP8 y amax global compartido para proyecciones fusionadas; el cuantizador de lm_head se desactiva en el paso principal y la cabeza NVFP4 se toma de una reproducción de la receta publicada de NVIDIA.

La innovación principal es el conjunto de calibración de contexto largo: 128 registros de 32.768 tokens (4,19 millones de tokens en total) compuestos por 32 ventanas de libros PG-19, 32 concatenaciones de repositorios de código (The Stack v1 vía ProLong), 16 capítulos de libros de texto (ProLong), 32 chats sintéticos multi-turno de recuperación (turnos de instrucción de Nemotron SFT como pajar y frases de PG-19 como agujas) y 16 trayectorias de agente OpenHands (SWE-rebench). Cada registro se filtró con reglas de solapamiento de 13-gramos y 50-gramos contra GPQA-D, IFBench, SciCode, LiveCodeBench v6, MRCR-128K, subconjuntos de MMMU-Pro y MMLU-Pro, y AA-LCR. La longitud de calibración es determinante: la misma disposición calibrada con muestras de 2.048 tokens pierde 2,30 puntos en MRCR-128K, y una mezcla 62% largo / 38% corto anula el beneficio. La cabeza MTP se cuantiza por separado sobre estados ocultos BF16 (128 × 2.048 tokens de Nemotron post-training v3), con una concordancia top-1 del 0,958 respecto a la cabeza BF16, y se injerta en el modelo.

## Capacidades

- Generación de texto y razonamiento con modo thinking activable (parser de razonamiento `qwen3` en vLLM).
- Comprensión de imágenes y texto (pipeline image-text-to-text, torre de visión en BF16).
- Generación y razonamiento sobre código, con soporte de tool calling (`--enable-auto-tool-choice` con parser `qwen3_coder`).
- Razonamiento matemático y científico de nivel avanzado (evaluado en GPQA-Diamond y HLE).
- Recuperación en contexto largo: manejo de conversaciones de hasta 128K tokens (evaluado con MRCR-128K sobre 1.492 conversaciones).
- Capacidades de agente multi-paso, con calibración específica sobre trayectorias OpenHands/SWE-rebench.
- Decodificación especulativa integrada mediante cabeza MTP cuantizada a NVFP4 (hasta 3 tokens especulativos por paso).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Atención al cliente con historial largo**: el modelo puede gestionar conversaciones multi-turno de hasta 131.072 tokens, lo que permite mantener en contexto transcripciones completas, documentación de producto y tickets previos sin truncar; la calibración sobre chats sintéticos de recuperación multi-turno refuerza este escenario.
- **Análisis de repositorios de código**: con contexto de 128K y calibración sobre concatenaciones de The Stack v1, es adecuado para revisar módulos completos, responder preguntas sobre arquitectura de un proyecto o generar parches; el soporte de tool calling permite integrarlo en pipelines de CI/CD que invoquen linters, tests o APIs internas.
- **Agentes autónomos de resolución de incidencias**: la calibración sobre trayectorias OpenHands/SWE-rebench y la decodificación especulativa MTP lo hacen apto para bucles de agente con múltiples pasos de razonamiento y llamadas a herramientas, con latencia reducida gracias al drafter NVFP4.
- **Procesamiento de documentos extensos con imágenes**: al ser image-text-to-text, puede extraer información de informes escaneados, gráficos o capturas junto con el texto circundante en una sola ventana de contexto, útil en auditoría documental o análisis financiero.
- **Asistente de investigación científica**: los resultados en GPQA-Diamond (87,88) y HLE (40,62) lo sitúan como candidato para responder preguntas de nivel experto en dominios STEM, con modo thinking para razonamientos de varios pasos.
- **Despliegue en una sola GPU para equipos pequeños**: al caber en una RTX PRO 6000 Blackwell de 96 GB con 18,96 GB de pesos, permite servir un modelo de razonamiento avanzado sin clúster multi-GPU, reduciendo costes de infraestructura para startups o laboratorios.
- **Generación de código asistida en IDE**: la ventana de 128K permite incluir el archivo abierto, dependencias y documentación de API, mientras que la decodificación especulativa con 3 tokens por paso mejora el throughput en autocompletado interactivo.

## Benchmarks y rendimiento

Evaluación con NeMo Gym v0.7.0, muestreo de model card (temperatura 1,0, top_p 0,95, thinking activado, 65.536 tokens máximos de salida), caché KV FP8, sin decodificación especulativa, sobre GB300. Los deltas se comparan con ejecuciones agrupadas de nvidia/Qwen3.8-27B-NVFP4 en el mismo harness, con ±1 error estándar.

| Benchmark | nvidia/Qwen3.8-27B-NVFP4 (agrupado) | Este modelo | Delta |
|---|---|---|---|
| GPQA-Diamond (x4) | 88,21 | 87,88 | -0,33 ± 0,67 |
| IFBench, stripped / raw (x2) | 80,81 / 74,81 | 82,67 / 76,50 | +1,9 / +1,7 |
| MRCR-128K (1.492 conversaciones, 2 ejecuciones) | 94,01 | 92,93 | -1,10 ± 0,50 |
| HLE (hle_verified) | 41,46 (2 ejecuciones) | 40,62 | -0,84 ± 0,92 |

La pérdida en MRCR-128K es estadísticamente significativa (IC 95% de -2,08 a -0,11) y se mantiene dentro del límite de -1,5 de precisión sin reentrenamiento; el checkpoint publicado de NVIDIA ya está ~1,3 puntos por debajo de BF16 en el mismo benchmark. La longitud de salida y la truncación no cambian en GPQA; el fin de secuencia prematuro dentro de `<think>` es más frecuente solo en HLE, donde sustituye truncaciones que habrían llegado a 64K (tasa de no-respuesta sin cambios: 28,1% frente a 28,0%). Las cifras de una sola ejecución conllevan un ruido entre trabajos de aproximadamente ±1 punto adicional al error estándar indicado.

## Requisitos de hardware

- **VRAM para pesos**: 18,96 GB en safetensors (18,65 GB de tronco + 0,31 GB de MTP). Con caché KV FP8 y ventana de 131.072 tokens, el perfil recomendado usa `--gpu-memory-utilization 0.85` sobre 96 GB, es decir, unos 81,6 GB reservados para pesos, caché KV, estados SSM y buffers.
- **GPU recomendadas**: NVIDIA Blackwell, en concreto RTX PRO 6000 Blackwell (96 GB) para el perfil de una sola tarjeta; GB300 para las mediciones de benchmarks. Requiere soporte de NVFP4 y FP8, por lo que no es compatible con generaciones anteriores (Ampere, Hopper) sin conversión.
- **Consumer GPU**: no cabe en GPUs de consumo actuales por el requisito de NVFP4 y FP8 nativos y por el tamaño del contexto; no se dispone de datos para RTX 4090 o similares.
- **Despliegue**: vLLM nightly `f5d93296` más la serie de parches del repositorio Qwen3.8-27B-NVFP4-SingleGPU-Serving. El vLLM upstream en ese commit carga el tronco pero no la cabeza MTP NVFP4 (el drafter MTP pierde las entradas de cuantización por capa; el grupo de parches 03 lo corrige). Variables de entorno necesarias: `VLLM_KV_K8V4=1`, `VLLM_GDN_SPEC_STATE=recover`, `VLLM_GDN_RECOVER_FOLD=1`, además de `--mamba-ssm-cache-dtype int16`.
- **Throughput y latencia**: el perfil por defecto usa `--max-num-seqs 256`, `--max-num-batched-tokens 8192`, chunked prefill y scheduling asíncrono, con configuración especulativa MTP de 3 tokens para lotes de 1 a 32 y 1 token para lotes de 33 a 1.024. Existe un perfil de baja latencia (≤16 peticiones concurrentes) con drafter DFlash2 NVFP4 documentado en `docs/FINAL_CONFIG.md`. No se publican cifras concretas de tokens por segundo ni de latencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| frida404/Qwen3.8-27B-NVFP4-LC32K (este) | 16,03B (safetensors) | 131.072 tokens en servicio | NVFP4 + FP8 + BF16 mixto | Apache-2.0 | Hugging Face, 18,96 GB |
| nvidia/Qwen3.8-27B-NVFP4 | no disponible | no disponible | NVFP4 (sin GDN ni MTP en NVFP4) | Apache-2.0 (heredada del base) | Hugging Face, 21,92 GB |
| Qwen/Qwen3.8-27B (BF16) | no disponible | no disponible | BF16 | Apache-2.0 | Hugging Face |

Frente al checkpoint de NVIDIA, este modelo reduce el tamaño un 13,5% (18,96 GB frente a 21,92 GB) al cuantizar a NVFP4 las 48 proyecciones GDN y la cabeza MTP, y recupera precisión en contexto largo mediante calibración a 32K; en benchmarks queda dentro de ±2 puntos en GPQA-Diamond, IFBench, MRCR-128K y HLE, con mejora en IFBench (+1,9 / +1,7) y pérdida significativa pero acotada en MRCR-128K (-1,10). Frente al base BF16, el checkpoint de NVIDIA ya pierde ~1,3 puntos en MRCR-128K, de modo que la pérdida acumulada de este modelo respecto a BF16 sería de aproximadamente 2,4 puntos en ese benchmark.

## Limitaciones y advertencias

- **Pérdida medible en contexto largo**: la caída de 1,10 puntos en MRCR-128K es estadísticamente significativa (IC 95% de -2,08 a -0,11); para aplicaciones donde la recuperación exacta en ventanas de 128K sea crítica, conviene validar con datos propios.
- **Mayor fin de secuencia prematuro en HLE**: dentro de `<think>` aparecen terminaciones anticipadas con más frecuencia que en el checkpoint de NVIDIA, aunque la tasa de no-respuesta se mantiene (28,1% frente a 28,0%).
- **Dependencia de parches y nightly**: requiere vLLM nightly concreto más parches propios; el vLLM upstream no carga la cabeza MTP NVFP4. Esto implica riesgo de rotura ante actualizaciones y menor soporte comunitario.
- **Restricción de hardware**: solo funciona en GPUs NVIDIA Blackwell con soporte NVFP4 y FP8; no es desplegable en A100, H100 ni GPUs de consumo.
- **Ruido en benchmarks**: las cifras de una sola ejecución llevan ±1 punto adicional de variación entre trabajos, más allá del error estándar citado.
- **Sesgos y alucinaciones**: no se documentan análisis específicos de sesgo ni tasas de alucinación en la información disponible; al derivar de Qwen3.8-27B, hereda los sesgos del modelo base, no evaluados aquí.
- **Idiomas**: no se declaran idiomas soportados en la model card; la cobertura multilingüe del base no está verificada para esta cuantización.
- **Licencia**: Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado ni respaldado por el equipo Qwen ni por NVIDIA; la responsabilidad de validación en producción recae en el usuario.
- **Autoría y mantenimiento**: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; se trata de un artefacto de un solo autor sin gobernanza comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frida404/Qwen3.8-27B-NVFP4-LC32K
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint NVFP4 de referencia de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Código, parches y reproducción: https://github.com/Frida-a/Qwen3.8-27B-NVFP4-SingleGPU-Serving
- Configuración de baja latencia: https://github.com/Frida-a/Qwen3.8-27B-NVFP4-SingleGPU-Serving/blob/main/docs/FINAL_CONFIG.md
