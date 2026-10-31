# rrchat/Cerberus-E4B-GGUF

## Resumen

Cerberus-E4B-GGUF es la versión cuantizada en formato GGUF de Cerberus-E4B, un modelo multimodal y multi-tarea de pesos abiertos desarrollado por rrlabs-ai y distribuido en este repositorio por el usuario rrchat. El modelo es un fine-tuning sobre `google/gemma-4-E4B-it` de Google DeepMind, con aproximadamente 7.5B de parámetros totales (incluyendo torres de visión y audio congeladas) y unos 4B de parámetros activos en el backbone de lenguaje. Está orientado a razonamiento, matemáticas, uso de agentes y tareas multimodales (imagen y audio).

Su relevancia radica en que combina capacidades de razonamiento con modo de pensamiento explícito (`<thought>`), soporte de tool calling y entrada multimodal (visión y audio a 16 kHz), todo ello ejecutable localmente mediante llama.cpp, Ollama o LM Studio. Los datos publicados por el autor muestran mejoras sustanciales frente al modelo base en MATH-500 (+16.7 puntos en modo thinking), manteniendo la paridad en IFEval. La licencia Apache-2.0 facilita su uso comercial, aunque el modelo base queda sujeto a los Gemma Terms of Use.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer multimodal con torres de visión ViT y audio Conformer congeladas) |
| Parametros totales | 7.518.069.290 (~7.5B) |
| Parametros activos | ~4B (backbone de lenguaje; arquitectura tipo MoE/activación parcial según Gemma 4 E4B) |
| Longitud de contexto | 8192 tokens (valor usado en los ejemplos de despliegue; máximo oficial no disponible) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, BF16 |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache-2.0 (modelo fine-tuned); el modelo base queda sujeto a los Gemma Terms of Use |
| Formato de pesos | GGUF (incluye archivos mmproj para el proyector multimodal en bf16 y f16) |

## Arquitectura y entrenamiento

Cerberus-E4B parte de la arquitectura Gemma 4 E4B de Google, un transformer de ~7.5B parámetros totales de los cuales ~4B corresponden al backbone de lenguaje activo. Las torres de visión (ViT que procesa imágenes en 280 tokens) y de audio (Conformer a 16 kHz) permanecen congeladas durante el fine-tuning, y se conectan al modelo de lenguaje mediante un proyector multimodal distribuido como archivo `mmproj` independiente.

El entrenamiento se realizó con una mezcla de datasets públicos: NVIDIA Nemotron-Post-Training-Dataset-v2 y Nemotron-SFT-Agentic-v2 (datos sintéticos de post-entrenamiento y agénticos), OpenR1-Math-220k de Hugging Face (trazas de razonamiento matemático), SmolTalk de HuggingFaceTB (datos conversacionales) y GrandMaster-PRO-MAX de Vikhrmodels (trazas de razonamiento en ruso). El modelo soporta dos modos de generación: Thinking Mode con trazas de razonamiento explícitas mediante el canal `<thought>`, e Instant Mode para respuestas directas y generación de código y JSON determinista.

## Capacidades

- Razonamiento matemático con modo de pensamiento explícito (`<thought>`) y modo directo (instant)
- Generación de código con alta fidelidad en JSON estructurado mediante decodificación greedy
- Tool calling y function calling para integración en pipelines agénticos
- Razonamiento multi-paso y uso como modelo agéntico (entrenado con Nemotron-SFT-Agentic-v2)
- Comprensión de imágenes (image-text-to-text) mediante el proyector multimodal ViT
- Reconocimiento y comprensión de audio a 16 kHz (transcripción y respuesta a preguntas sobre audio)
- Capacidades bilingües ruso/inglés, con trazas de razonamiento específicas en ruso
- Seguimiento de restricciones complejas de sistema (IFEval ~90.5%)
- Ejecución 100% local mediante llama.cpp, con soporte de chat web y móvil

## Casos de uso

- Asistente matemático y de razonamiento local: activando Thinking Mode con temperature 0.8, el modelo resuelve problemas de matemáticas con trazas de razonamiento verificables, alcanzando 60% en MATH-500 según el autor, todo sin enviar datos a la nube.
- Agentes con tool calling en local: su entrenamiento con datos agénticos de NVIDIA y su soporte de function calling lo hacen adecuado para orquestar herramientas (búsqueda web, APIs) desde llama-server en un equipo doméstico.
- Chat multimodal desde el móvil con rrchat: combinando llama-server con la interfaz rrchat, se pueden enviar fotos desde la cámara del teléfono y obtener respuestas multimodales con privacidad total.
- Transcripción y respuesta sobre audio: mediante `llama-mtmd-cli --audio`, se puede transcribir grabaciones y responder preguntas sobre su contenido en ruso o inglés.
- Generación de código y JSON estructurado: en Instant Mode con decodificación greedy (temperature 0.0), el modelo produce salida determinista adecuada para integraciones donde se requiere JSON válido.
- Atención al cliente o asistente conversacional bilingüe ruso-inglés: su entrenamiento con SmolTalk y datos de razonamiento en ruso lo hace útil para chat multi-turno en ambos idiomas.
- Análisis de imágenes en flujos de trabajo privados: con el mmproj bf16, se pueden describir y razonar sobre imágenes localmente, útil en entornos con restricciones de cumplimiento (GDPR, datos sensibles).

## Benchmarks y rendimiento

Datos publicados por el autor del modelo (comparativa frente al modelo base):

| Benchmark | Base (Gemma-4-E4B-it) | Cerberus-E4B | Delta | Modo de generación |
|---|:---:|:---:|:---:|---|
| MATH-500 | 43.3% | 60.0% | +16.7% | Thinking Mode (`<thought>`) |
| MATH-500 | 35.0% | 48.0% | +13.0% | Instant Mode |
| MMLU-Redux | 62.0% | 63.0% | +1.0% | Conocimiento académico multidisciplinar |
| IFEval | 90.8% | 90.5% | Paridad (~90%) | Seguimiento de restricciones de sistema |

No se han publicado resultados de benchmarks en HumanEval, GSM8K ni otras suites en la información disponible.

## Requisitos de hardware

- Q4_K_M (4.97 GB): 6–8 GB de VRAM; cuantización recomendada como mejor equilibrio entre velocidad, tamaño y perplejidad
- Q5_K_M (5.37 GB): ~8 GB de VRAM; mayor precisión en matemáticas y código
- Q8_0 (7.48 GB): 12 GB o más de VRAM; cuantización de 8 bits casi sin pérdidas
- BF16 (14.02 GB): 16 GB o más de VRAM; máster sin comprimir
- Proyector multimodal (mmproj): ~1 GB adicional de VRAM para visión y audio
- Cabe en GPUs de consumo: sí; Q4_K_M funciona en GPUs de 8 GB como una RTX 4060/3060 Ti, y Q8_0 en una RTX 4090 (24 GB) con holgura. También es viable en CPU pura o con offload parcial gracias a llama.cpp
- Despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli`), Ollama (`ollama run hf.co/rrlabs-ai/Cerberus-E4B-GGUF`), LM Studio y la interfaz rrchat. No se menciona soporte para vLLM ni TGI con GGUF
- Configuración de muestreo recomendada: Thinking Mode con temperature 0.8–1.0, top_p 0.95, top_k 64 y sampler DRY (`--dry-multiplier 0.8 --dry-base 1.75 --dry-allowed-length 2`) para evitar bucles en trazas largas; Instant Mode y tool calling con temperature 0.0
- Latencia y throughput: no disponibles

## Comparativa con modelos similares

| Característica | Cerberus-E4B | Gemma-4-E4B-it (base) | Qwen3-VL-4B (categoría similar) |
|---|---|---|---|
| Parametros totales | ~7.5B | ~7.5B | ~4B |
| Parametros activos | ~4B | ~4B | no disponible |
| Multimodal | Visión + audio | Visión + audio | Visión |
| Razonamiento con thinking mode | Sí (`<thought>`) | No documentado | Sí (thinking mode) |
| MATH-500 | 60.0% (thinking) | 43.3% | no disponible |
| Tool calling | Sí | no disponible | Sí |
| Licencia | Apache-2.0 (sujeto a Gemma ToU) | Gemma Terms of Use | Apache-2.0 |
| Formato | GGUF | Safetensors | Safetensors y GGUF comunitarios |

Nota: los datos de Qwen3-VL-4B son orientativos y no provienen de la información proporcionada; no hay comparativas oficiales publicadas en la model card más allá de la comparación con su modelo base.

## Limitaciones y advertencias

- Ventana de contexto limitada a 8192 tokens en los ejemplos de despliegue, lo que restringe conversaciones muy largas o documentos extensos
- Soporte idiomático centrado en ruso e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior
- Riesgo de alucinación estándar de LLM; los benchmarks publicados son autoreportados por el autor y no verificados de forma independiente
- En Thinking Mode, las trazas largas pueden entrar en bucles si no se activa el sampler DRY, según advierte el propio autor
- Aunque el fine-tuning se publica bajo Apache-2.0, el modelo base google/gemma-4-E4B-it está sujeto a los Gemma Terms of Use de Google, lo que puede imponer restricciones adicionales de uso comercial
- Parte del dataset de entrenamiento deriva de NVIDIA Nemotron bajo la NVIDIA Open Synthetic Data License, con términos propios que conviene revisar para uso comercial
- La cuantización Q4_K_M puede degradar el rendimiento en matemáticas y código; el autor recomienda Q5_K_M o superior para esas tareas
- Las torres de visión y audio están congeladas respecto al modelo base, por lo que sus capacidades multimodales no mejoraron durante el fine-tuning

## Enlaces

- Repositorio GGUF: https://huggingface.co/rrchat/Cerberus-E4B-GGUF
- Pesos originales (adaptador): https://huggingface.co/rrlabs-ai/Cerberus-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset NVIDIA Nemotron post-training: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Dataset NVIDIA Nemotron agéntico: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Dataset GrandMaster-PRO-MAX (ruso): https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
- Proyecto rrchat: https://github.com/leftik1/rrchat
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
