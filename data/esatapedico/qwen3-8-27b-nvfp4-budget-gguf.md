# esatapedico/Qwen3.8-27B-NVFP4-BUDGET-GGUF

## Resumen

Qwen3.8-27B-NVFP4-BUDGET-GGUF es una conversión a formato GGUF del modelo Qwen3.8-27B, un transformer denso de 27B parámetros con capacidades nativas de visión y lenguaje (VLM) y una ventana de contexto nativa de 262.144 tokens. La publica el usuario esatapedico, que parte del checkpoint NVFP4 de unsloth y genera dos variantes de bajo consumo: BUDGET y STARVED, ambas sin la cabeza MTP de decodificación especulativa.

El objetivo declarado es permitir servir el modelo en una única GPU Blackwell de 16 GB de VRAM. Para ello se mantiene un backbone NVFP4 de 448 tensores byte-idéntico entre toda la familia y se fijan los tensores de cabeza (lm_head y embeddings) a tipos de cuantización muy agresivos: Q3_K/Q2_K en BUDGET y Q2_K/Q2_K en STARVED. El resultado son ficheros de 14,72 GB y 14,59 GB respectivamente.

Es relevante porque demuestra una ruta práctica para ejecutar un modelo multimodal de 27B con contexto largo en hardware de consumo, a costa de una segunda cuantización sobre el checkpoint original (que ya venía de FP8) y de una pérdida medible de calidad en benchmarks. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet + Gated Attention, 64 capas, VLM nativo (visión y vídeo) |
| Parametros totales | 26.895.998.800 (26,9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Backbone NVFP4 (448 tensores); BUDGET: lm_head Q3_K + token_embd Q2_K; STARVED: lm_head Q2_K + token_embd Q2_K; 737 tensores F32 (normas, escalas, gates) |
| Idiomas soportados | en, multilingual (sin listado detallado de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (1.187 tensores por fichero); proyector multimodal mmproj-BF16.gguf separado |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros con un layout híbrido que combina capas Gated DeltaNet (atención lineal con estado recurrente) y capas de Gated Attention clásica, distribuidas en 64 capas. Esta mezcla busca reducir el coste de atención en contextos muy largos, lo que hace viable la ventana nativa de 262.144 tokens. Es un VLM nativo: procesa imágenes y vídeo además de texto, mediante un proyector multimodal que en esta conversión se distribuye como fichero `mmproj-BF16.gguf` aparte.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La conversión de esatapedico parte de `unsloth/Qwen3.8-27B-NVFP4` (ya cuantizado a NVFP4 desde FP8) y aplica una segunda cuantización a la ruta de atención y a los tensores de cabeza. Se elimina la cabeza MTP (`qwen35.nextn_predict_layers=0`), de modo que no hay decodificación especulativa y los ficheros cargan en cualquier build de llama.cpp sin la ruta `draft-mtp`. El backbone de 448 tensores es byte-idéntico entre todas las variantes de la familia, verificado con SHA-256 por tensor.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens).
- Comprensión de imágenes y vídeo de forma nativa mediante el proyector multimodal (`--mmproj`).
- Razonamiento y matemáticas: validado con MMLU y GSM8K en la model card.
- Capacidades multilingües (etiqueta `multilingual`, sin desglose de idiomas).
- Modo thinking: la model card menciona evaluaciones con "thinking off", lo que implica que el modelo base soporta un modo de razonamiento explícito.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Procesamiento de documentos largos en local: con 262.144 tokens de contexto nativo, el modelo puede resumir o extraer información de contratos, informes o expedientes completos en una sola pasada, sin chunking ni recuperación externa.
- Análisis de vídeo e imagen en estación de trabajo: el proyector multimodal permite describir escenas, transcribir contenido visual o responder preguntas sobre fotogramas, útil en inspección visual o catalogación de archivos multimedia.
- Asistente conversacional autoalojado: al caber en 16 GB de VRAM, se puede desplegar en una RTX 5070 Ti o similar para atención al cliente o asistencia interna sin depender de APIs externas, con la ventana de contexto cubriendo historiales extensos.
- Investigación sobre cuantización extrema: los ficheros BUDGET y STARVED sirven como referencia reproducible para estudiar la degradación de calidad al bajar lm_head y embeddings a Q2_K/Q3_K, con métricas publicadas de MMLU, GSM8K y perplejidad.
- Generación asistida en entornos con GPU de consumo: integrable en llama.cpp u Ollama para tareas de redacción, resumen y Q&A sobre corpus privados en equipos de un solo usuario.
- Evaluación comparativa de familias de cuantización: al compartir backbone byte-idéntico con los ocho tiers MTP del repositorio hermano, permite aislar el efecto de la cabeza MTP y de los tensores de cabeza en la calidad final.
- Prototipado de pipelines multimodales en CI: al cargar en llama.cpp sin la ruta `draft-mtp`, se puede automatizar en contenedores con GPU Blackwell de 16 GB para pruebas de regresión de prompts.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos sobre una RTX 5070 Ti (16 GB, Blackwell), contexto de 32k, KV en q4_0, documento fuente de 28k tokens y `max_tokens` 2000. Son ejecuciones únicas e indicativas.

| Tier | Prefill t/s | Decode t/s | Tiempo por petición (s) | distinct_ratio |
|---|---|---|---|---|
| BUDGET (Q3_K / Q2_K) | 2287,3 | 27,05 | 126,5 | 0,9877 |
| STARVED (Q2_K / Q2_K) | 2289,2 | 27,37 | 98,7 | 1,0 |

Calidad de tarea (suite unificada, 2026-11-11):

| Tier | Tamano | MMLU (n=1000) | GSM8K (n=200) | PPL |
|---|---|---|---|---|
| STARVED | 14,59 GB | 79,56% | 0,915 | 3,7429 |
| BUDGET | 14,72 GB | 80,26% | 0,895 | 3,5689 |
| VERY-LOW (MTP) | 14,86 GB | 80,26% | 0,900 | 3,5689 |
| COMPACT-LOW (MTP) | 15,16 GB | 79,92% | 0,905 | 3,4875 |
| LOW (MTP) | 15,53 GB | 80,75% | 0,920 | 3,5127 |

El resto de tiers MTP (MEDIUM y superiores) no está disponible en la información proporcionada. El autor advierte que las cifras de prefill son promedios que degradan con el crecimiento del contexto y no son comparables con mediciones hechas a otras longitudes de contexto o en otro hardware.

## Requisitos de hardware

- VRAM estimada: BUDGET pico de 15,9 GiB y STARVED pico de 15,7 GiB, medidos en una RTX 5070 Ti de 16 GB. Sin proyector multimodal se liberan aproximadamente 1 GB adicional.
- GPU recomendadas: RTX 5070 Ti (16 GB, sm_120) es el hardware de referencia; cualquier GPU Blackwell con 16 GB o más debería servir. Para mayor margen de contexto, una RTX 5090 (32 GB) o GPUs de datacenter (A100, H100) permiten contextos mucho mayores.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB Blackwell. En GPUs de 16 GB de generaciones anteriores (Ampere, Ada) el soporte de NVFP4 es limitado; el autor recomienda en ese caso las variantes GGUF convencionales de `unsloth/Qwen3.8-27B-GGUF`.
- Opciones de despliegue: llama.cpp (build estándar, sin necesidad de `draft-mtp`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. Ollama y vLLM no se mencionan explícitamente en la información disponible.
- Latencia y throughput: prefill de ~2288 t/s y decode de ~27 t/s a 32k de contexto en RTX 5070 Ti; una petición de 28k de entrada más 2000 tokens de salida tarda entre 98 y 127 segundos según el tier.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Calidad publicada | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4-BUDGET (este) | 26,9B denso | 262.144 | GGUF NVFP4, 14,72 GB | MMLU 80,26%, GSM8K 0,895, PPL 3,5689 | Apache 2.0 |
| Qwen3.8-27B-NVFP4-STARVED (mismo repo) | 26,9B denso | 262.144 | GGUF NVFP4, 14,59 GB | MMLU 79,56%, GSM8K 0,915, PPL 3,7429 | Apache 2.0 |
| Qwen3.8-27B-NVFP4-LOW (repo MTP) | 26,9B denso | 262.144 | GGUF NVFP4 + MTP, 15,53 GB | MMLU 80,75%, GSM8K 0,920, PPL 3,5127 | Apache 2.0 |
| unsloth/Qwen3.8-27B-NVFP4 (origen) | 26,9B denso | 262.144 | NVFP4 sin cuantizar a GGUF | no disponible | Apache 2.0 |

No se dispone de datos de benchmarks de modelos de otros desarrolladores (por ejemplo, alternativas de 27B-30B de otras familias) en la información proporcionada, por lo que la comparativa se limita a los tiers de la misma familia.

## Limitaciones y advertencias

- Doble cuantización: el checkpoint de origen ya era NVFP4 (derivado de FP8) y esta conversión recuantiza la ruta de atención, lo que acumula pérdida de precisión frente al modelo original en BF16.
- Tensores de cabeza en Q2_K/Q3_K: la perplejidad de STARVED (3,7429) es claramente peor que la de BUDGET (3,5689), y su MMLU cae 0,7 puntos. Para tareas sensibles a la precisión del vocabulario de salida conviene usar BUDGET o tiers superiores.
- Sin decodificación especulativa: al eliminar la cabeza MTP, se renuncia a la aceleración por drafter; el decode queda en ~27 t/s en RTX 5070 Ti.
- Soporte de hardware restringido: NVFP4 requiere GPU Blackwell (sm_120) para aprovecharse; en arquitecturas anteriores el rendimiento y la compatibilidad no están garantizados.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni de sesgo en la información disponible; como todo modelo generativo, puede producir contenido incorrecto con apariencia plausible, especialmente en cuantizaciones agresivas.
- Idiomas: la etiqueta de idiomas es genérica (`en`, `multilingual`) sin listado ni evaluación por idioma; el rendimiento en castellano no está verificado.
- Contexto efectivo: aunque el contexto nativo es de 262.144 tokens, las mediciones publicadas se hicieron a 32k; el rendimiento y la calidad más allá de esa longitud no están cuantificados en esta ficha.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original de Qwen y del checkpoint intermedio de unsloth antes de desplegar en producción.
- Benchmarks de una sola ejecución: los números de rendimiento son indicativos y no comparables con mediciones de otro hardware, contexto o arnés.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-NVFP4-BUDGET-GGUF
- Repositorio hermano con los tiers MTP y el proyector mmproj: https://huggingface.co/esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF
- Checkpoint de origen: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- GGUF convencionales del modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Sitio del autor: https://www.esatapedico.com
