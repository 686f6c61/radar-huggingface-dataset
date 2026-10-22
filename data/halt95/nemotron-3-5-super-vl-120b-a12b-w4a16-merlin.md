# halt95/Nemotron-3.5-Super-VL-120B-A12B-W4A16-Merlin

## Resumen

Nemotron-3.5-Super-VL-120B-A12B-W4A16-Merlin es una compilación cuantizada a 4 bits del modelo visión-lenguaje `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`, publicada por el usuario independiente halt95. El modelo base es un mixto de expertos (MoE) de NVIDIA con unos 129.000 millones de parámetros totales (128.958.078.472 según los safetensors) y aproximadamente 12.000 millones activos por token, con arquitectura híbrida Mamba-2 + atención + MoE y un codificador visual C-RADIO.

El objetivo de esta derivada es hacer viable el contexto completo de 1.048.576 tokens (1M) sobre cuatro GPU de 24 GB. El checkpoint pasa de 232 GiB en BF16 a unos 68 GiB (67,9 GiB de pesos en 63 shards), manteniendo en BF16 la atención, los expertos compartidos, los routers, los embeddings, el `lm_head` y la torre de visión, y cuantizando a INT4 los expertos enrutados y a INT8 las proyecciones Mamba-2 y la cabeza MTP.

Es relevante porque demuestra inferencia de un MoE multimodal de gran tamaño con contexto de un millón de tokens en hardware Ampere de consumo (RTX 3090), apoyándose en el motor Merlin 3.0.0 —un fork de vLLM 0.32.0— con paralelismo de expertos, RecoverSSM para Mamba-2, decodificación especulativa MTP y caché KV en FP8. No es un modelo oficial de NVIDIA: es una derivada independiente, no revisada ni respaldada por NVIDIA, y requiere código remoto y un motor específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + atención + MoE (familia `nemotron_h_omni`), con codificador visual C-RADIO y cabeza MTP para decodificación especulativa |
| Parámetros totales | 128.958.078.472 (≈129B; el nombre comercial indica 120B) |
| Parámetros activos | ≈12B por token (MoE con 512 expertos enrutados por capa MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | W4A16: expertos enrutados INT4 (grupo 128, simétrico, round-to-nearest, sin datos de calibración); proyecciones `in_proj`/`out_proj` de Mamba-2 INT8 por canal de salida; cabeza MTP: expertos INT4 e `eh_proj`, atención, proyecciones latentes y de expertos compartidos INT8; atención principal, proyecciones latentes, expertos compartidos, routers, `conv1d`, embeddings, `lm_head`, torre de visión y proyector en BF16 (≈21K parámetros pequeños permanecen en F32); caché KV en FP8 E4M3 configurada por el motor |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW 1.1 (`license: other`, fichero `LICENSE` en el repositorio) |
| Formato de pesos | safetensors con `compressed-tensors` (63 shards, 67,9 GiB), más código de modelado remoto (`modeling_*.py`, `configuration_*.py`, `processing_*.py`, `ultra_v3_reasoning_parser.py`) |

## Arquitectura y entrenamiento

El modelo base combina capas Mamba-2 (modelo de espacio de estados) con capas de atención y capas MoE, un patrón híbrido que reduce el coste de atención en contextos muy largos. La componente multimodal la aporta un codificador visual C-RADIO más un proyector hacia el espacio del lenguaje, lo que sitúa al modelo en la categoría `image-text-to-text`. Incluye además una cabeza MTP (multi-token prediction) que actúa como modelo borrador para decodificación especulativa.

Sobre el entrenamiento no hay información en la documentación disponible: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO o fases de razonamiento. Lo que sí está documentado es el proceso de cuantización de esta derivada: cuantización post-entrenamiento con round-to-nearest simétrico y sin datos de calibración para los expertos, e INT8 por canal para las proyecciones Mamba-2, dejando en BF16 las partes sensibles (atención, routers, expertos compartidos, visión). La innovación práctica está en el motor: paralelismo de expertos repartido en cuatro GPU, implementación RecoverSSM para Mamba-2, decodificación especulativa con la cabeza MTP y caché KV en FP8 que permite mantener en VRAM un pool de 1.856.367 tokens.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de hasta 1M tokens.
- Comprensión de imágenes en entrada (`image-text-to-text`): descripción, extracción de información y respuesta a preguntas sobre documentos visuales.
- Modo de razonamiento explícito: la plantilla de chat de NVIDIA activa el pensamiento por defecto y el repositorio incluye el parser `ultra_v3_reasoning_parser.py` para separar el razonamiento de la respuesta final.
- Multilingüismo declarado en seis idiomas: inglés, español, francés, alemán, italiano y japonés.
- Razonamiento de múltiples pasos sobre contextos largos, favorecido por el contexto de 1M y por Mamba-2, que evita el coste cuadrático de la atención.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes: sí a nivel de infraestructura; la model card reporta ocho conversaciones de 16K mantenidas simultáneamente y ocho turnos de seguimiento concurrentes de 512 tokens con 429 tok/s agregados.
- Capacidades de audio: no documentadas (el tag de arquitectura es `nemotron_h_omni`, pero la información disponible solo detalla visión).

## Casos de uso

- Análisis de documentación técnica extensa: ingestión de manuales o repositorios completos de hasta 1M tokens en una sola sesión, con preguntas cruzadas entre secciones sin troceado ni recuperación externa.
- Procesamiento de documentación escaneada con visión: el modelo recibe imágenes de páginas y devuelve texto estructurado o respuestas, útil para digitalización de archivos y extracción de tablas.
- Asistentes de código sobre repositorios medianos: el contexto de 1M permite mantener varios ficheros y el historial de cambios en la ventana; conviene validar la calidad real en código, ya que no hay benchmarks publicados de HumanEval en la información disponible.
- Despliegue de agentes concurrentes en hardware de consumo: con 429 tok/s agregados para ocho agentes según la medición del autor, encaja en entornos de prototipado o investigación con cuatro RTX 3090 en lugar de un clúster de A100.
- Analítica de atención al cliente multi-idioma: cubre inglés, español, francés, alemán, italiano y japonés, con conversaciones largas que retienen el historial completo sin resumen intermedio.
- Investigación en eficiencia de inferencia: sirve como banco de pruebas reproducible de cuantización W4A16, paralelismo de expertos, decodificación especulativa MTP y caché KV FP8 sobre Ampere.
- Evaluación comparativa de cuantizaciones: al existir una variante NVFP4 oficial de NVIDIA, permite estudiar el compromiso entre tamaño, throughput y calidad, siempre que se añada una evaluación de calidad propia, que aquí no está publicada.

## Benchmarks y rendimiento

Las cifras disponibles son de rendimiento del motor, no de calidad. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible.

| Medición | Contexto | Resultado | Configuración |
|---|---|---|---|
| Pool de caché KV en VRAM | FP8, valor por defecto de 1M | 1.856.367 tokens | Merlin 3.0.0, 4× RTX 3090 |
| Sesiones simultáneas | 1 sesión de 1M o 5 de 262K | 1 o 5 | Ídem |
| Agentes concurrentes | 8 conversaciones de 16K + 8 seguimientos de 512 tokens, sin thinking | 429 tok/s agregados | Build pre-release del motor (2026-10-17) |
| Decodificación | 261.888 tokens de prompt + 128 de salida, thinking completo | 91 tok/s (mediana de 3) | Merlin 3.0.0 |
| Prefill | Prompt frío de 101.885 tokens | 3.744 tok/s | Merlin 3.0.0 |

Hardware de referencia: 4× RTX 3090 sin NVLink, a 220 W, con P2P activado; banco del 2026-10-20.

## Requisitos de hardware

- Pesos: 67,9 GiB (unos 68 GiB), frente a los 232 GiB del checkpoint BF16 original. No cabe en una GPU de 24 GB; requiere reparto multi-GPU.
- Configuración validada: 4× RTX 3090 (96 GB de VRAM total) sin NVLink, con P2P y a 220 W.
- Perfiles incluidos en el motor para otras tarjetas Ampere y Ada: RTX 4090, tarjetas de estación de trabajo de 48 GB, A100 y CMP 170HX. La model card advierte que los perfiles Ada se distribuyen sin probar.
- GPU de consumo: sí, en configuraciones multi-GPU (RTX 3090 y RTX 4090). No se documenta un despliegue monogpu, ni siquiera en A100/H100 de 80 GB.
- Caché KV: FP8 E4M3, configurada por el motor en tiempo de servicio; el pool medido ocupa 1.856.367 tokens íntegramente en VRAM.
- Motor de despliegue: Merlin 3.0.0 (fork de vLLM 0.32.0) con paralelismo de expertos, RecoverSSM y decodificación especulativa MTP. No hay GGUF ni soporte declarado para llama.cpp u Ollama; el repo es de tipo `vllm` con código remoto, que Merlin verifica contra el hash `remote-code.sha256` antes de arrancar.
- Throughput y latencia medidos: 3.744 tok/s de prefill en un prompt de 100K, 91 tok/s de decodificación con 262K de contexto y 429 tok/s agregados con ocho agentes.

## Comparativa con modelos similares

| Modelo | Parámetros (total / activos) | Contexto | Peso en disco | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este modelo (W4A16-Merlin) | 129B / ≈12B | 1M | ≈68 GiB | safetensors INT4/INT8/BF16 mixto | OpenMDW 1.1 | Requiere Merlin 3.0.0; validado en 4× RTX 3090 |
| `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` (base) | 120B / ≈12B | 1M | 232 GiB | safetensors BF16 | no indicada en la información disponible | Referencia de calidad; no cabe en 4×24 GB |
| `NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4` (build.nvidia.com) | 120B / ≈12B | no disponible | no disponible | NVFP4 (NVIDIA Model Optimizer + destilación con QAD) | no disponible | Cuantización oficial: visión, conector, convoluciones Mamba y embeddings en BF16, router en FP32 |
| Otros MoE multimodales de tamaño comparable (Qwen, Llama, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Derivada no oficial: el modelo lo publica halt95, no NVIDIA, y no está revisado ni respaldado por el fabricante. La model card original de NVIDIA se conserva sin cambios como `NVIDIA-MODEL-CARD.md` (revisión `1f8953f7`, 2026-10-16).
- Sin evaluación de calidad publicada: no hay MMLU, HumanEval, GSM8K ni MMMU para esta cuantización, por lo que la pérdida de calidad frente al BF16 es desconocida. La cuantización INT4 de los expertos usa round-to-nearest sin datos de calibración, lo que suele degradar más que técnicas con calibración o destilación (la variante NVFP4 oficial sí emplea destilación con QAD).
- Dependencia de un motor concreto: requiere Merlin 3.0.0 con receta y perfiles propios, además de ejecutar código remoto. No hay ruta documentada en llama.cpp, Ollama o TGI, lo que limita la portabilidad y complica la reproducibilidad a largo plazo.
- Perfiles Ada sin probar: solo la configuración 4× RTX 3090 está validada; el resto de perfiles (RTX 4090, 48 GB, A100, CMP 170HX) se distribuyen sin verificación según la propia model card.
- Riesgo de alucinación: no documentado ni medido en la información disponible; es esperable en un modelo de este tipo, especialmente en contextos de 1M donde la recuperación de detalles distantes no está evaluada.
- Cobertura idiomática limitada a seis idiomas; no se declara ni evalúa el rendimiento en otras lenguas, incluidos catalán, gallego o euskera.
- Licencia OpenMDW 1.1 marcada como `other`: es necesario revisar el fichero `LICENSE` antes de cualquier uso comercial, y comprobar además las condiciones del modelo base.
- Sesgos: no hay información sobre evaluación de sesgos o seguridad en la documentación disponible.
