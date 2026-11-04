# litert-community/FastContext-1.0-4B-SFT

## Resumen

FastContext-1.0-4B-SFT es un modelo de lenguaje especializado en la exploración de repositorios de código como subagente de sistemas de agentes de programación. Desarrollado originalmente por Microsoft y publicado bajo licencia MIT, el modelo se construye sobre el backbone de Qwen3-4B-Instruct (arquitectura `Qwen3ForCausalLM`) y se afina mediante supervisión (SFT) para realizar descubrimiento de repositorios y recopilación de evidencia mediante llamadas paralelas a herramientas de lectura de ficheros (READ, GLOB, GREP).

La versión aquí documentada es una conversión comunitaria realizada por `litert-community` al formato LiteRT-LM (`.litertlm`) de Google, pensada para inferencia en dispositivo (on-device) en teléfonos Android, iPhone, Raspberry Pi y equipos de sobremesa. La conversión aplica cuantización int4 simétrica con clipping óptimo OCTAV y embeddings en INT8, reduciendo el peso principal a aproximadamente 2,11 GiB (block 32) o 1,94 GiB (block 128), lo que permite su ejecución en hardware de consumo.

Es relevante ahora porque demuestra la viabilidad de ejecutar subagentes especializados de programación completamente en el borde, sin conexión a la nube, con latencias de decodificación de 7,5 tok/s en un Galaxy S26 y 74,5 tok/s en un Mac Studio M4 Max. Conviene señalar, no obstante, que los repositorios originales de Microsoft y el paper asociado (arXiv:2606.14066) fueron retirados en junio de 2026, por lo que esta conversión constituye uno de los pocos artefactos disponibles del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3ForCausalLM) |
| Parametros totales | 4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 (KV cache en la conversión LiteRT-LM) |
| Tipos de cuantizacion | int4 simetrica por bloques (block 32 y block 128) + embeddings INT8; OCTAV optimal-clipping; computo entero |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (bundle con tokenizer y plantilla ChatML de Qwen3 incluidos) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4B parámetros derivado de Qwen3-4B-Instruct, por lo que hereda la arquitectura estándar de la familia Qwen3 con atención causal convencional. El ajuste SFT lo especializa como subagente de exploración de repositorios: en lugar de generar respuestas finales, el modelo emite llamadas estructuradas a herramientas de descubrimiento (READ para leer ficheros, GLOB para listar rutas y GREP para buscar patrones) que el agente orquestador ejecuta en paralelo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada.

La conversión a LiteRT-LM introduce dos innovaciones técnicas destacables. En primer lugar, la cuantización int4 con granularidad de bloque configurable: block 32 almacena escalas cada 32 pesos y preserva la precisión (88,0% en GSM8K, paridad con bf16), mientras que block 128 almacena una cuarta parte de las escalas y acelera la decodificación un 40% a costa de 6 puntos de precisión (81,0% en GSM8K). En segundo lugar, la externalización de la sección de embeddings en INT8, que reduce el tamaño del fichero y permite cargar el modelo en dispositivos con memoria limitada como el iPhone 17 Pro.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de exploración de código.
- Llamadas a herramientas en paralelo (tool calling / function calling) con las operaciones READ, GLOB y GREP como interfaz principal.
- Funcionamiento como subagente dentro de pipelines de agentes multi-paso para descubrimiento de repositorios y recopilación de evidencia.
- Comprensión de estructura de proyectos: identificación de puntos de entrada, ficheros de configuración y dependencias.
- Razonamiento matemático básico verificado mediante GSM8K (88,0% en block 32).
- Inferencia totalmente local en dispositivo, sin dependencia de red.
- Plantilla de chat Qwen3 ChatML (`<|im_start|>role\n…<|im_end|>`, token de parada `<|im_end|>`) incluida en el bundle.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Exploración de repositorios en agentes de programación: el modelo actúa como subagente que, ante una pregunta del usuario, emite llamadas GREP y GLOB para localizar los ficheros relevantes y READ para extraer su contenido, devolviendo evidencia al agente orquestador. Su especialización evita que el modelo principal gaste contexto en tareas de descubrimiento.
- Asistentes de código en el móvil sin conexión: integrado en Google AI Edge Gallery o en una app Android propia mediante LiteRT-LM, permite consultar la estructura de un proyecto desde el teléfono con 7,5 tok/s de decodificación en un Galaxy S26.
- Automatización de revisiones de código en el borde: desplegado en una Raspberry Pi 5 junto a un repositorio local, el modelo puede enumerar ficheros afectados por un cambio y localizar definiciones relevantes con 1,5 tok/s de decodificación, suficiente para tareas por lotes no interactivas.
- Servidor local compatible con OpenAI: mediante `litert-lm serve` en macOS o Linux, se expone el modelo como API local para que herramientas de desarrollo (editores, scripts de CI) consulten la estructura del repositorio sin enviar código a la nube.
- Indexación semántica de proyectos en pipelines de CI/CD: el modelo puede generar descripciones de módulos y mapas de dependencias durante la construcción, aprovechando su capacidad de lectura selectiva de ficheros para no procesar el repositorio completo.
- Demostraciones educativas de agentes en el borde: el bundle `.litertlm` autocontenido (tokenizer y plantilla incluidos) y el demo web con WebGPU permiten ilustrar el ciclo completo de un agente con tool calling en un navegador o dispositivo de bajo coste.
- Prototipado de subagentes especializados: al estar bajo licencia MIT y construido sobre Qwen3, sirve como base para afinar variantes con otras herramientas o dominios sin restricciones de uso comercial.

## Benchmarks y rendimiento

| Benchmark / métrica | Resultado | Contexto |
|---|---|---|
| GSM8K (block 32) | 88,0% | Paridad con bf16 según la model card |
| GSM8K (block 128) | 81,0% | −6 puntos frente a block 32 |
| Decode, Galaxy S26 GPU (block 128) | 7,5 tok/s | LiteRT-LM 0.16.0, 1674 ops delegadas |
| Prefill, Galaxy S26 GPU (block 128) | 86 tok/s | TTFT 2,47 s |
| Decode, Galaxy S26 CPU (block 32) | 7,1 tok/s | LiteRT-LM 0.16.0, TTFT 5,61 s |
| Decode, Mac Studio M4 Max GPU (block 32) | 74,5 tok/s | LiteRT-LM 0.14.0, prefill 964 tok/s, TTFT 279 ms |
| Decode, iPhone 17 Pro (block 32 / block 128) | ~10 / ~14 tok/s | Runtime Swift LiteRT-LM |
| Decode, Raspberry Pi 5 CPU 4 hilos | 1,5 tok/s (block 128) / 1,4 tok/s (block 32) | TTFT 26,04 s / 28,46 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible más allá de GSM8K.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2,5 GB libres de RAM para el build int4 de 4B; el peso principal ocupa ~2,11 GiB (block 32) o ~1,94 GiB (block 128).
- GPU de sobremesa recomendadas: cualquier GPU integrada o dedicada moderna con soporte de LiteRT-LM; los datos publicados incluyen Mac Studio M4 Max (GPU) con 74,5 tok/s de decodificación.
- GPU de centro de datos: no disponible en la información proporcionada (el modelo está orientado a borde, no a A100/H100).
- Cabe en GPU de consumo: sí; verificado en iPhone 17 Pro, Galaxy S26 y Mac con GPU M-series.
- Opciones de despliegue: runtime LiteRT-LM (CLI `litert_lm_main`, paquete `pip install litert-lm`, servidor local compatible con OpenAI mediante `litert-lm serve`), runtime Swift LiteRT-LM en iOS, Google AI Edge Gallery en Android (v1.0.16+ importa directamente desde Hugging Face) y demo web con WebGPU.
- Latencia y throughput: TTFT de 279 ms en Mac Studio M4 Max GPU, 2,47 s en Galaxy S26 GPU y 26,04 s en Raspberry Pi 5; decodificación entre 1,4 y 74,5 tok/s según plataforma.
- Nota de memoria: se recomienda reiniciar el teléfono antes de cargar el modelo si la memoria es escasa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| FastContext-1.0-4B-SFT (LiteRT-LM) | 4B | 4096 (KV cache) | `.litertlm`, on-device | MIT | Subagente especializado en exploración de repositorios; GSM8K 88,0% (block 32) |
| Qwen3-4B-Instruct (modelo base) | 4B | no disponible en esta ficha | safetensors, GGUF, múltiples runtimes | Apache 2.0 (según la familia Qwen3) | Modelo generalista; el FastContext añade especialización en tool calling para repos |
| Gemma block-128 (referencia de granularidad citada por el autor) | no disponible | no disponible | `.litertlm` | no disponible | El autor cita que la granularidad block 128 es la que usan los bundles oficiales de Gemma |

No se dispone de datos comparativos de rendimiento frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los repositorios originales `microsoft/FastContext-1.0-4B-SFT` y `microsoft/FastContext-1.0-4B-RL` ya no están disponibles en Hugging Face (último archivado el 2026-06-28) y el paper arXiv:2606.14066 fue retirado el 2026-06-30; los enlaces al origen en la model card no resuelven.
- El modelo está especializado como subagente de exploración de repositorios: no es un modelo generalista y su rendimiento en tareas ajenas al descubrimiento de código no está documentado.
- Contexto limitado a 4096 tokens de KV cache en esta conversión, lo que restringe la cantidad de evidencia que puede acumular en una sola sesión.
- La cuantización int4 block 128 degrada GSM8K en 6 puntos frente a block 32; debe elegirse block 32 salvo que la latencia de decodificación sea el factor dominante.
- Riesgo de alucinación en la selección de ficheros y patrones de búsqueda: el agente orquestador debe validar las rutas devueltas antes de ejecutar lecturas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; la plantilla ChatML de Qwen3 sugiere herencia multilingüe, pero no está verificada en esta conversión.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero al derivar de Qwen3-4B-Instruct conviene verificar las condiciones de la licencia del modelo base original.
- Para producción en dispositivos móviles se requiere LiteRT-LM 0.15+ (Android) o el runtime Swift correspondiente (iOS); versiones anteriores no cargan `.litertlm`.
- El throughput en Raspberry Pi 5 (1,4–1,5 tok/s) limita su uso a tareas por lotes, no interactivas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/FastContext-1.0-4B-SFT
- Modelo base original (ya no disponible): https://huggingface.co/microsoft/FastContext-1.0-4B-SFT
- Paper (retirado): https://arxiv.org/abs/2606.14066
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Runtime Swift LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Demo web con WebGPU: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/FastContext-1.0-4B-SFT
- Registro edge-compat (block 128): https://github.com/john-rocky/edge-compat/blob/main/cards/fastcontext-1.0-4b-sft-model-block128/CARD.md
- Registro edge-compat (block 32): https://github.com/john-rocky/edge-compat/blob/main/cards/fastcontext-4b/CARD.md
