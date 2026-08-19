# MrMofer/MiniMax-H3-MLX-8bit

## Resumen

MiniMax-H3-MLX-8bit es una adaptación del modelo MiniMax-H3, un sistema generativo omni-modal desarrollado por MiniMax que produce video con audio nativo estereofónico a partir de texto o imágenes. Esta versión concreta, creada por MrMofer, es un empaquetado completo del pipeline (DiT de 33B parámetros, text encoder, VAEs de video y audio, tokenizer y configuraciones) cuantizado a 8 bits y optimizado para Apple Silicon mediante la librería MLX. Su propósito es permitir la ejecución local de generación de video con audio sincronizado en hardware de Apple, algo que de otra forma requeriría GPUs de gran capacidad.

El modelo resuelve el problema de la alta demanda de memoria de los modelos de difusión de video: al cuantizar el transformer principal y el text encoder a 8 bits, se reduce el consumo de VRAM/RAM de forma significativa, permitiendo su uso en equipos como un Mac Studio con M4 Max de 68,7 GB. La relevancia actual radica en que MiniMax-H3 es uno de los primeros modelos abiertos de generación de video nativa con audio, y esta versión MLX lo hace accesible a un público más amplio, aunque con limitaciones de rendimiento y resolución.

La arquitectura es un Diffusion Transformer (DiT) conjunto que procesa video y audio simultáneamente, con un text encoder basado en Qwen3-VL-32B truncado a 50 capas. El contexto no aplica en el sentido de los LLM, ya que se trata de un modelo de difusión. La licencia es la MiniMax H3 Community License, que permite uso no comercial y comercial bajo ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) conjunto video+audio |
| Parametros totales | 33B (DiT) + 32B (text encoder, truncado a 50 capas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusion, no autoregresivo) |
| Tipos de cuantizacion | 8-bit affine, grupo 64 (AdaLN 8-bit) para DiT y text encoder; VAE en fp16/bf16 y fp32 |
| Idiomas soportados | No disponibles (el text encoder Qwen3-VL es multilingue, pero no se especifica lista) |
| Licencia | MiniMax H3 Community License |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original MiniMax-H3 es un sistema omni-modal que unifica la comprensión de texto, imágenes, video y audio, y genera video con audio nativo de hasta 2K de resolución y 15 segundos de duración. La arquitectura principal es un transformer de difusión que opera sobre latentes de video y audio de forma conjunta, con un text encoder basado en Qwen3-VL-32B para condicionamiento multimodal. El video VAE es un VAE causal con tiles de 17 frames y crossfade de 5 frames, mientras que el audio VAE combina un codificador DAC y un vocoder BigVGAN para audio estéreo a 32 kHz.

En esta versión MLX-8bit, el DiT de 33B se cuantiza a 8 bits con agrupación de 64 elementos, y el text encoder se trunca a 50 de sus 64 capas para reducir memoria. La cuantización no reduce el coste de la atención, que es densa, sino que sirve para ajustar el modelo a la memoria disponible. No se proporcionan detalles sobre el entrenamiento del modelo original (número de tokens, dataset, técnicas de alineación), pero el pipeline incluye un Turbo LoRA de 4 pasos (EMA destilado) que permite reducir los pasos de denoising de 16 a 8, con una calidad visual aceptable según el informe de validación.

## Capacidades

- Generación de video a partir de texto (text-to-video) con audio nativo sincronizado.
- Generación de video a partir de imagen (image-to-video) según las etiquetas del modelo.
- Generación de audio estéreo a 32 kHz integrado en el video.
- Soporte de resolución nativa de 768px en el lado corto (p. ej. 1344x768 16:9), con degradación rápida por debajo de ese tamaño.
- Soporte de Turbo LoRA para reducir pasos de denoising (8 pasos con calidad validada).
- No soporta tool calling, razonamiento multi-step ni funciones de agente, al ser un modelo generativo de difusión.
- Capacidades multilingües implícitas a través del text encoder Qwen3-VL, aunque no se documentan idiomas específicos.

## Casos de uso

- Creación de clips cortos para redes sociales: el modelo puede generar videos de 5-15 segundos con audio sincronizado a partir de prompts descriptivos, ideal para contenido de marketing o entretenimiento en plataformas como TikTok o Instagram Reels.
- Prototipado de storyboards animados: los cineastas y creadores pueden generar versiones preliminares de escenas con movimiento y sonido para evaluar la dirección visual antes de la producción final.
- Generación de material de referencia para doblaje y efectos de sonido: al producir audio nativo, sirve como base para diseñar bandas sonoras o efectos Foley en proyectos de postproducción.
- Educación y demostraciones interactivas: profesores pueden crear ejemplos visuales y auditivos personalizados para explicar conceptos científicos o históricos sin necesidad de equipos de grabación.
- Pruebas de concepto en publicidad: las agencias pueden generar rápidamente variaciones de anuncios con diferentes escenarios y locuciones para presentar a clientes.
- Accesibilidad en investigación de IA: al ejecutarse en hardware Apple Silicon, permite a investigadores sin GPUs NVIDIA experimentar con generación de video+audio de última generación, aunque con tiempos de generación largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como FVD, CLIP score, etc.) en la informacion disponible. El autor proporciona un informe de validación interna en un M4 Max de 68,7 GB, con evaluaciones subjetivas de un modelo de visión independiente:

| Build | Configuracion | Tiempo | Veredicto visual |
|---|---|---|---|
| 8-bit (este repo) | 768x448, 16 pasos | 33,9 min | 9/10 — zorro coherente, fondo estable, sin derretimiento |
| 8-bit + Turbo LoRA | 768x448, 8 pasos | ~24 min | Alta confianza — "impresionante para un turbo LoRA de 4 pasos" |
| 4-bit + Turbo LoRA | 1344x768, 8 pasos | 2 h 3 min | 95% — arco de salto completo, sin artefactos |

Además, se verificó que la paridad con la implementación de referencia de diffusers es exacta (video 1.2e-6, audio 2.3e-8), y que el factor dominante de calidad es el tamaño del canvas: 21,4 dB de PSNR a 384x256 frente a 27,9 dB a 768x448.

## Requisitos de hardware

- Memoria residente durante la generación: DiT ~21,5 GB + text encoder ~22 GB + VAEs ~6 GB (con proyecciones AdaLN precomputadas y descartadas, liberando ~13,8 GB). Pico de RSS de 24,7 GB en configuracion 768x448.
- Para resolución nativa 1344x768, el pico alcanza ~57 GB, requiriendo un equipo con al menos 64 GB de RAM unificada y sin carga adicional (el sistema puede matar el proceso bajo presión de memoria).
- Solo compatible con Apple Silicon (MLX). No soporta GPUs NVIDIA ni AMD.
- GPUs recomendadas: M4 Max (68,7 GB) validado; se espera que funcione en M3 Ultra o M2 Ultra con 128 GB, aunque no está documentado.
- Opciones de despliegue: pipeline Python con scripts de generación (scripts/generate.py), integrable con PipeNetwork MLX port. No hay soporte para vLLM, llama.cpp, Ollama o TGI al ser un modelo de difusión.
- Latencia medida: 119 s/paso a 768x448 (33,9 min para 16 pasos); 996 s/paso a 1344x768 (2 h para 8 pasos). La atención densa no se beneficia de la cuantización en tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion maxima | Audio nativo | Hardware requerido | Licencia |
|---|---|---|---|---|---|
| MiniMax-H3 (original) | 33B DiT + 32B text encoder | 2K, 15 s | Si | GPUs de alta gama (A100/H100) | MiniMax H3 Community License |
| MiniMax-H3-MLX-8bit (este) | 33B DiT (8-bit) + 32B text encoder (8-bit) | 768px (nativo), hasta 1344x768 | Si | Apple Silicon (M4 Max 68 GB) | MiniMax H3 Community License |
| MiniMax-H3-NF4 (Rudra-ai) | 33B (NF4) | No disponible | No disponible | No disponible | No disponible |

No se dispone de comparativas con modelos cerrados como Sora o Runway Gen-3, ni con otros modelos abiertos de generación de video con audio (p. ej. Mochi 1, CogVideoX) porque no se han encontrado datos en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon; no hay soporte CUDA ni para GPUs de otras marcas.
- La resolución nativa es de 768px en el lado corto; por debajo de 448px la calidad se degrada rápidamente (21,4 dB PSNR a 384x256).
- Tiempos de generación muy largos: más de 30 minutos para un clip de 16 pasos, y hasta 2 horas para resolución nativa, lo que limita su uso en flujos de trabajo iterativos.
- Artefactos de costura periódicos (~1,2x) en el decodificador VAE, inherentes al diseño de tiles de 17 frames; se enmascaran a resolución nativa pero pueden aparecer en otros tamaños.
- El Turbo LoRA de 4 pasos puede colapsar a ruido si se usan exactamente 4 pasos; se recomienda 8 pasos para resultados estables.
- La licencia MiniMax H3 Community License tiene restricciones de uso comercial que deben revisarse antes de desplegar en producción.
- No se documentan sesgos específicos, pero al ser un modelo de generación de video, puede reflejar sesgos visuales y culturales de los datos de entrenamiento, que no se especifican.
- Riesgo de alucinación visual: el modelo puede generar objetos o movimientos inconsistentes con el prompt, especialmente en escenas complejas o con canvas reducidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MrMofer/MiniMax-H3-MLX-8bit
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- GitHub oficial de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Port MLX de PipeNetwork: https://github.com/PipeNetwork/minimax-h3-mlx
- Turbo LoRA (fuente): https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Guía de hardware y cuantización (ai-models-lab): https://deepwiki.com/ai-models-lab/minimax-h3/4.2-hardware-requirements-and-quantization-guide
- Hub comunitario de MiniMax-H3: https://github.com/ai-models-lab/minimax-h3
