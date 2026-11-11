# SadikNawazAI/Chichu-Video-1.0-GGUF

## Resumen

Chichu-Video-1.0 es un modelo de lenguaje de 494 millones de parámetros especializado en la generación de guiones de vídeo estructurados. Lo desarrolla Sebastianpro88 como un ajuste fino (fine-tune) de Qwen2.5-0.5B-Instruct, y esta ficha concreta es una conversión a formato GGUF (cuantización Q4_K_M) publicada por SadikNawazAI como espejo byte a byte del repositorio original de mradermacher. El modelo produce descripciones de escena listas para alimentar generadores texto-a-vídeo, diálogos de personajes para TTS, narración y pistas de audio o efectos de sonido (SFX).

Su relevancia radica en el tamaño: con 494M parámetros y un fichero de 379 MiB, es ejecutable en dispositivos muy limitados (móviles, navegador, Raspberry Pi) mediante llama.cpp u Ollama, lo que lo convierte en una herramienta de prototipado rápido para pipelines de generación de vídeo. La arquitectura es un transformer Qwen2 denso (24 capas, hidden 896, 14 cabezas de atención con 2 KV heads, FFN de 4864) con una longitud de contexto declarada de 32.768 tokens, aunque su uso práctico recomendado es mucho menor.

No es un modelo de propósito general: está entrenado específicamente para guiones cortos en inglés, y su calidad en razonamiento, código o conocimiento factual es la propia de un modelo de 0,5B. Su utilidad está en la estructura del output (escenas, diálogo, narración, SFX) más que en la profundidad del contenido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen2 (`qwen2`) |
| Parámetros totales | 494.032.768 (~494M) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (declarado); uso recomendado 4.096 |
| Tipos de cuantización | Q4_K_M (~4,8 bits/peso); no se listan otras en el repo |
| Idiomas soportados | inglés (`en`) |
| Licencia | `other` (sin fichero de licencia separado; base Apache-2.0) |
| Formato de pesos | GGUF (versión 3), fichero `Chichu-Video-1.0.Q4_K_M.gguf` |
| Tamaño del fichero | 397.808.416 B (379 MiB) |
| Plantilla de chat | Qwen2.5 ChatML (`<|im_start|>` / `<|im_end|>`), embebida en el GGUF |
| SHA-256 | `0211da023ba2f9c732392d374a848d729d11b7d905de48097644b66f1b574098` |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct → Sebastianpro88/Chichu-Video-1.0 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-0.5B-Instruct sin modificaciones estructurales: transformer decoder-only denso con 24 capas, dimensión oculta de 896, 14 cabezas de atención y 2 cabezas KV (GQA), y FFN de 4864. El modelo se ajustó sobre esa base para una tarea concreta: generar guiones de vídeo con bloques diferenciados de descripción de escena, diálogo, narración y cues de audio/SFX.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF o DPO en el fine-tune de Sebastianpro88. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). La conversión a GGUF es una cuantización estándar Q4_K_M realizada con las herramientas de llama.cpp, sin cambios en la arquitectura ni en la plantilla de chat.

## Capacidades

- Generación de descripciones de escena estructuradas, pensadas como entrada para modelos texto-a-vídeo.
- Generación de diálogos de personajes aptos para síntesis de voz (TTS).
- Generación de narración en off.
- Generación de pistas de audio y efectos de sonido (SFX) asociadas a una escena.
- Conversación multi-turno básica mediante plantilla ChatML (heredada de Qwen2.5-0.5B-Instruct).
- Seguimiento de instrucciones sencillas sobre duración ("15-second", "30-second") y ambientación.
- No dispone de tool calling ni function calling documentado.
- No dispone de modo de razonamiento extendido (thinking mode).
- No soporta visión, audio de entrada ni otras modalidades.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Prototipado de pipelines texto-a-vídeo: el modelo genera la descripción de escena que se pasa directamente como prompt a un generador de vídeo (por ejemplo, un modelo de difusión de vídeo), permitiendo iterar sobre guiones sin coste de GPU significativo.
- Preproducción de vídeo corto en dispositivos móviles: con 379 MiB en Q4_K_M, puede ejecutarse en un teléfono mediante llama.cpp u Ollama, sirviendo como "director de bolsillo" para esbozar escenas de 15-30 segundos sobre la marcha.
- Generación de guiones para TTS: los bloques de diálogo y narración se pueden extraer y enviar a un motor de síntesis de voz para producir audiolibros cortos, anuncios o vídeos narrados.
- Creación de storyboards para animación o publicidad: el modelo produce descripciones de escena secuenciales que un equipo humano puede revisar y convertir en storyboard; útil por su bajo coste frente a modelos grandes.
- Generación de cues de SFX para postproducción: el modelo propone efectos de sonido coherentes con la escena descrita, que se pueden mapear a librerías de audio existentes.
- Educación y demos: al ser ejecutable en navegador o móvil, sirve para talleres y demostraciones sobre fine-tuning, cuantización GGUF y despliegue local de modelos, sin necesidad de infraestructura.
- Generación de contenido para redes sociales: guiones de 15-30 segundos para vídeos verticales, con diálogo y narración, generados escena por escena para evitar la deriva del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,4-0,6 GB en Q4_K_M (el fichero pesa 379 MiB; el consumo real depende del contexto y de los buffers de llama.cpp).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; funciona igualmente en CPU.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y en dispositivos móviles.
- Despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/SadikNawazAI/Chichu-Video-1.0-GGUF:Q4_K_M`), llama-cpp-python. No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera generación en tiempo real o superior en CPU moderna, pero no hay cifras publicadas.
- Contexto: aunque el modelo declara 32.768 tokens, la model card recomienda usar `--ctx-size 4096` para evitar consumo innecesario de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Chichu-Video-1.0 (Q4_K_M) | ~494M | 32.768 (uso 4.096) | Guiones de vídeo | `other` | GGUF |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 | Asistente general | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | ~1.500M | 32.768 | Asistente general | Apache-2.0 | safetensors, GGUF |
| SmolLM2-360M-Instruct | ~360M | 8.192 | Asistente general | Apache-2.0 | safetensors, GGUF |

La comparación con modelos de propósito general es la más directa, ya que no se han identificado en la información disponible otros fine-tunes de guiones de vídeo de tamaño comparable. Frente a Qwen2.5-0.5B-Instruct, Chichu-Video-1.0 sacrifica generalidad a cambio de estructura específica de guion; frente a Qwen2.5-1.5B-Instruct, ofrece menor capacidad de razonamiento pero un consumo de memoria tres veces menor.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Modelo de 0,5B: vocabulario simple, repeticiones ocasionales y conocimiento factual débil; no es un asistente general ni un modelo de código.
- Deriva en briefs largos: la model card advierte que las peticiones multi-escena largas pueden perder coherencia; se recomienda generar escena por escena.
- Riesgo de alucinación: los guiones generados son borradores; deben revisarse antes de producción.
- Licencia `other` sin fichero de licencia separado: la base Qwen2.5-0.5B-Instruct es Apache-2.0, pero los términos del fine-tune los fija el autor original (Sebastianpro88). Ante uso comercial, consultar con el autor.
- Repositorio espejo: esta publicación es una réplica byte a byte del GGUF de mradermacher; no aporta cambios ni garantías adicionales sobre el original.
- Sin datos de benchmarks: no hay evidencia publicada de calidad frente a alternativas.
- Contexto declarado de 32.768 tokens pero recomendación de 4.096: usar ventanas mayores puede degradar la calidad y aumentar el consumo de memoria sin beneficio claro.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SadikNawazAI/Chichu-Video-1.0-GGUF
- Modelo original (fine-tune): https://huggingface.co/Sebastianpro88/Chichu-Video-1.0
- Conversión GGUF original: https://huggingface.co/mradermacher/Chichu-Video-1.0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Aviso de licencia del repo: https://huggingface.co/SadikNawazAI/Chichu-Video-1.0-GGUF/blob/main/LICENSE-NOTICE.md
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
