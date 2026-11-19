# saidutta69/Qwen3.5-4B-heretic

## Resumen

Qwen3.5-4B-heretic es una variante "decensored" (sin rechazos) del modelo multimodal Qwen/Qwen3.5-4B de Alibaba Qwen, publicada por el usuario saidutta69 en Hugging Face. Se ha generado con la herramienta Heretic 2.0.0.dev0 aplicando Arbitrary-Rank Ablation (ARA) sobre la torre de lenguaje, dejando intacto el codificador de visión. El objetivo es eliminar las respuestas de rechazo del modelo base manteniendo sus capacidades de razonamiento, instrucciones y tool calling, algo relevante para desarrolladores que necesitan agentes locales sin filtros de negativa en dominios legítimos (investigación, red teaming, contenido para adultos consentido).

El modelo base es un transformer híbrido de 32 capas que combina 8 bloques de 3 capas gated DeltaNet con 1 capa de atención con compuertas, con 4.539.265.536 parámetros totales (4.205.751.296 en la torre de lenguaje y 333.514.240 en el codificador visual). Soporta 201 idiomas según la model card del autor y un contexto nativo de 262.144 tokens. La edición ARA se aplicó en las capas 15 a 27 con un peso de preservación de comportamiento del 0,99, logrando reducir los rechazos de 99/100 a 13/100 con una divergencia KL de 0,0081.

La relevancia práctica está en que ofrece un modelo de 4B con visión, contexto largo y tool calling que cabe en GPUs de consumo, con licencia Apache 2.0 y pesos en safetensors BF16 y GGUF (estos últimos solo texto). No obstante, la eliminación de rechazos implica riesgos de seguridad y de cumplimiento que deben evaluarse antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 capas en 8 bloques de (3 gated DeltaNet + 1 gated-attention) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF F16, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (solo texto) |
| Idiomas soportados | 201 idiomas segun la model card del autor; lista explicita: en, zh, ar, de, es, fr, it, ja, ko, pt, ru, hi, id, th, tr, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, multimodal) y GGUF (solo texto) |
| Parametros torre de lenguaje | 4.205.751.296 |
| Parametros codificador visual | 333.514.240 |
| Vocabulario | 248.320 tokens |
| Capas editadas (ARA) | 15 a 27 |
| Tamano del repo | 53,4 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida poco convencional: 32 capas organizadas en 8 bloques, cada uno con 3 capas de DeltaNet con compuertas seguidas de 1 capa de atención con compuertas. Esta combinación busca eficiencia en contexto largo (las capas DeltaNet reducen el coste cuadrático de la atención) manteniendo la capacidad expresiva de la atención completa. Incluye un codificador visual de 333,5M de parámetros que lo convierte en un modelo unificado de visión-lenguaje, y embeddings atados (tied embeddings) con un vocabulario de 248.320 tokens. La configuración declara `mtp_num_hidden_layers: 1`, aunque el checkpoint no incluye tensores MTP (multi-token prediction).

El proceso de "decensoring" se realizó con Heretic 2.0.0.dev0, en el trial 162 de una ejecución de 200 trials con semilla 982272333. En lugar de la ablación direccional clásica (que identifica una única dirección de rechazo y ortogonaliza contra ella), ARA aprende un subespacio de bajo rango sobre un rango de capas y combina dos objetivos: preservar el buen comportamiento (peso 0,9900) y dirigir el mal comportamiento (peso 0,0001), con un peso relativo de sobrecorrección de 0,8230 y un `neighbor_count` de 15. Solo se editó la torre de lenguaje; el codificador visual quedó intacto. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, si hubo RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento general en 201 idiomas, con especial solidez en instrucciones y conversación multi-turno.
- Comprensión de imágenes y vídeo mediante la torre de visión (solo disponible en safetensors BF16; los GGUF son solo texto).
- Tool calling y function calling, heredados del modelo base y orientados a flujos agénticos.
- Razonamiento multi-paso y uso en pipelines de agentes (la model card lo etiqueta como "agentic").
- Contexto largo de 262.144 tokens, adecuado para RAG sobre documentos extensos y conversaciones prolongadas.
- Modo "heretic": supresión de rechazos (13/100 frente a 99/100 del original), manteniendo MMLU, PIQA y WinoGrande dentro del ruido estadístico.
- Capacidades multilingües explícitas en 16 idiomas listados, con cobertura declarada de 201.
- No se documenta modo "thinking" explícito, soporte de audio ni decodificación especulativa en la información disponible.

## Casos de uso

- Agentes locales de automatización: el modelo puede gestionar cadenas de tool calling y razonamiento multi-paso en una GPU de consumo, con 262K de contexto para mantener el estado de la tarea sin truncar.
- RAG sobre documentación extensa: la ventana de 262.144 tokens permite ingerir manuales completos o expedientes largos sin fragmentación agresiva, y el modelo responde en el idioma del usuario.
- Asistencia multilingüe en atención al cliente: con cobertura declarada de 201 idiomas y 16 idiomas explícitos, puede atender conversaciones multi-turno en entornos donde el filtrado de rechazos del modelo base resulta contraproducente (por ejemplo, consultas médicas o legales que el modelo original rechaza por precaución).
- Investigación en seguridad y red teaming: la reducción de rechazos de 99/100 a 13/100 con KL de 0,0081 lo convierte en una herramienta controlada para estudiar comportamientos del modelo base sin la capa de negativa, comparando respuestas con y sin edición.
- Procesamiento de documentos con imágenes en local: usando los safetensors BF16 y `AutoProcessor`, se pueden extraer datos de capturas, formularios o vídeos sin enviar información a la nube.
- Generación de contenido creativo sin filtros: escritura de ficción, guiones o material para adultos consentido donde el modelo base rechazaría peticiones legítimas.
- Prototipado rápido en portátil: la cuantización Q4_K_M (2,71 GB) permite ejecutar el modelo en llama.cpp, LM Studio u Ollama en equipos sin GPU dedicada, aunque sin visión.

## Benchmarks y rendimiento

Resultados medidos por el autor con `lm-eval` en el mismo entorno para este checkpoint y el modelo original:

| Benchmark | Este modelo | Modelo original | stderr (este / original) |
|---|---|---|---|
| MMLU | 74,35% | 74,29% | 0,35 / 0,35 pp |
| PIQA | 77,48% | 77,37% | 0,97 / 0,98 pp |
| PIQA (norm) | 77,97% | 78,29% | 0,97 / 0,96 pp |
| WinoGrande | 69,22% | 69,77% | 1,30 / 1,29 pp |
| Rechazos | 13/100 | 99/100 | no disponible |
| Divergencia KL | 0,0081 | 0 (por definición) | no disponible |

Todas las diferencias en benchmarks de texto están dentro de aproximadamente un error estándar; la mayor es WinoGrande con -0,55 pp. Estos benchmarks no evalúan la torre de visión. No se han publicado resultados de benchmarks de visión, tool calling ni contexto largo en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16 (multimodal): aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda 16 GB o más para contexto largo.
- VRAM estimada en GGUF Q4_K_M (solo texto): aproximadamente 2,7 GB de pesos; cabe en GPUs de 6-8 GB con contexto moderado.
- VRAM estimada en GGUF Q8_0 (solo texto): aproximadamente 4,5 GB de pesos.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para BF16 con contexto largo y visión; RTX 3060/4060 (8-12 GB) para GGUF cuantizado en texto.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior con Q4_K_M/Q5_K_M; en BF16 requiere al menos 16 GB para contexto corto.
- Opciones de despliegue: llama.cpp (`llama serve -hf saidutta69/Qwen3.5-4B-heretic`), LM Studio, Ollama (según la model card), transformers con `AutoModelForCausalLM` (texto) o `AutoModelForImageTextToText` (visión). No se documenta soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-heretic | 4,54B | 262.144 | Si (solo safetensors) | 13/100 | Apache 2.0 | HF (safetensors + GGUF) |
| Qwen/Qwen3.5-4B (base) | 4,54B | 262.144 | Si | 99/100 | Apache 2.0 | HF oficial |
| Alternativas "abliterated" de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada; la comparación directa más fiable es contra el modelo base, que comparte arquitectura y solo difiere en la edición ARA.

## Limitaciones y advertencias

- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o inseguro sin negarse; no es apto para despliegues públicos sin capas de moderación externas.
- Riesgo de alucinación inherente a un modelo de 4B; el contexto largo de 262K no garantiza fidelidad a los documentos fuente.
- Los GGUF son solo texto: pierden la torre de visión, por lo que no sirven para casos de uso multimodal.
- La edición ARA puede introducir deriva limitada en fraseo y formato (KL 0,0081), aunque los benchmarks de texto se mantienen dentro del ruido.
- Sesgos conocidos del modelo base no documentados en la información disponible; la cobertura de 201 idiomas es una declaración del autor y no está verificada de forma independiente.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el cumplimiento normativo del contenido generado sin filtros.
- El checkpoint requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código personalizado del repositorio.
- No se documentan evaluaciones de seguridad, sesgo ni robustez adversarial para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/Qwen3.5-4B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic (herramienta de decensoring): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Imagen de portada de la model card: https://photu.kashyalabanavli.site/racer-is-op.png
