# PocketAiHub/MiniMax-Music3-MLX

## Resumen

MiniMax-Music3-MLX es un port comunitario independiente del modelo de generación de música MiniMax-Music3, adaptado para ejecutarse de forma nativa en Apple Silicon mediante el framework MLX. Lo publica PocketAiHub, no MiniMax, y su objetivo es permitir la generación de música completa (con letra o instrumental) en Macs sin necesidad de CUDA, GPU NVIDIA o ComfyUI. El modelo original, desarrollado por MiniMax, combina un modelo autoregresivo global basado en Qwen3-8B, un transformer de difusión de flujo (flow-DiT) y un decodificador de forma de onda DAV para producir audio estéreo de alta calidad.

Este port incluye todos los componentes necesarios para la síntesis completa: codificador de texto, modelo de difusión y decodificador de audio, con pesos cuantizados a INT8 (tensorwise + ConvRot) para los dos primeros y FP32 para el decodificador. El repositorio ocupa aproximadamente 11,9 GB y ofrece una interfaz de línea de comandos sencilla que acepta prompts descriptivos, letras opcionales, duración (10-300 segundos) y número de pasos de flujo (1-30). La relevancia de este proyecto radica en que democratiza el acceso a un modelo de generación musical de última generación en hardware de consumo de Apple, sin depender de servicios en la nube ni de GPUs dedicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoregresivo global estilo Qwen (Qwen3-8B) + flow-DiT + decodificador DAV |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 tensorwise + ConvRot (text encoder y DiT), FP32 (DAV) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-Music3 Community License (licencia propietaria con términos de uso) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo original MiniMax-Music3, del cual este es un port, emplea una arquitectura híbrida de tres etapas. La primera es un modelo autoregresivo global inspirado en Qwen3-8B que genera tokens de texto y estructura musical con cache de KV. La segunda es un decodificador RVQ de siete codebooks que produce representaciones discretas de audio a nivel local. La tercera es un transformer de difusión de flujo (flow-DiT) con guía sin clasificador (classifier-free guidance) que refina la representación latente. Finalmente, un decodificador DAV convierte las latentes en forma de onda estéreo de 44,1 kHz y 16 bits.

El port MLX reproduce fielmente la implementación de referencia de ComfyUI (commit `efd4e951`), incluyendo la cuantización INT8 tensorwise con capas ConvRot evaluadas mediante matmul cuantizado de MLX. Los pesos son copias sin cambios del repack de Comfy-Org de MiniMax-Music-3, con checksums SHA-256 verificados. No se dispone de información sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación de este port.

## Capacidades

- Generación de música completa a partir de descripciones textuales (text-to-music), incluyendo género, instrumentación, tempo y estilo vocal.
- Soporte de letras opcionales mediante secciones estructuradas como `[Verse]`, `[Chorus]`, etc., que el modelo integra en la composición.
- Generación de piezas instrumentales usando el marcador `[Instrumental]`.
- Control de duración entre 10 y 300 segundos.
- Control del número de pasos de flujo (1-30), lo que permite ajustar el equilibrio entre calidad y velocidad.
- Generación determinista mediante semilla fija (seed), útil para reproducibilidad.
- Salida en formato WAV estéreo de 44,1 kHz y 16 bits.

## Casos de uso

- Creación rápida de demos musicales: un productor puede escribir un prompt como "balada pop con piano y voz femenina, 90 BPM" y obtener una maqueta de 60 segundos en minutos, sin necesidad de instrumentos o software DAW complejo.
- Bandas sonoras para vídeo: creadores de contenido pueden generar música instrumental de fondo para vídeos de YouTube, podcasts o presentaciones, ajustando duración y estilo con precisión.
- Prototipado de canciones con letra: compositores pueden escribir estrofas y estribillos en un archivo de texto, y el modelo los convierte en una interpretación vocal cantada, facilitando la exploración de melodías y arreglos.
- Generación de pistas de referencia: estudios de grabación pueden usar el modelo para producir versiones de referencia de un tema antes de la grabación final, ahorrando tiempo en sesiones de preproducción.
- Educación musical: profesores pueden generar ejemplos auditivos de diferentes géneros o estructuras (verso-coro-puente) para ilustrar conceptos teóricos en clase.
- Exploración creativa: artistas pueden combinar prompts inusuales (por ejemplo, "jazz fusión con sintetizadores y batería acústica") para descubrir ideas nuevas que luego desarrollan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El port no incluye métricas objetivas de calidad musical (como FAD, CLAP score) ni comparativas con otros modelos de generación de audio. La única validación reportada es una comprobación de señal del ejemplo incluido, que verifica duración, niveles RMS, correlación estéreo y ausencia de recortes, pero no mide calidad perceptual.

## Requisitos de hardware

- Apple Silicon Mac (M1, M2, M3 o M4) con macOS 14 o superior.
- Memoria unificada mínima de 32 GB; se recomiendan 48 GB o más para una experiencia fluida.
- Aproximadamente 12 GB de espacio en disco para el repositorio y los pesos.
- No requiere GPU dedicada; usa la CPU y GPU unificada del chip Apple.
- Ejecución mediante CLI local (`generate.py`) en un entorno Python 3.11-3.13. No se menciona soporte para vLLM, Ollama, TGI u otros servidores de inferencia.
- Rendimiento: una canción de 60 segundos con 30 pasos de flujo tarda "varios minutos" en un Mac con suficiente memoria. La velocidad exacta depende del modelo concreto y de la RAM disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo base MiniMax-Music3 compite en el espacio de generación de música con alternativas como MusicGen (Meta), Stable Audio (Stability AI) o AudioLDM, pero este port específico no incluye mediciones comparativas ni análisis de rendimiento frente a ellos.

## Limitaciones y advertencias

- Compatibilidad exclusiva con Apple Silicon macOS; no funciona en Intel Macs, Linux, Windows, CUDA o CPU-only.
- Inferencia muy intensiva en memoria; actualmente solo admite batch size 1.
- Utiliza pesos INT8 del repack de Comfy-Org, no los pesos de precisión completa del upstream de Diffusers, lo que puede afectar ligeramente a la calidad.
- El control generativo es aproximado: los prompts y las etiquetas de sección no garantizan resultados exactos en cuanto a letra, tempo, instrumentación o estructura.
- La salida con una semilla fija es determinista para la versión exacta de MLX y el runtime, pero no coincide muestra a muestra con PyTorch/ComfyUI debido a diferencias en los generadores de números aleatorios.
- Licencia propietaria (MiniMax-Music3 Community License) con términos de uso aceptable y condiciones comerciales específicas; es obligatorio revisar el documento antes de usar o redistribuir el modelo o sus salidas.
- El port es experimental y comunitario, no tiene soporte oficial de MiniMax.

## Enlaces

- Repositorio HuggingFace del port: https://huggingface.co/PocketAiHub/MiniMax-Music3-MLX
- Modelo base MiniMax-Music3: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Licencia del modelo: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- Repack de pesos de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-Music-3/tree/6444666eb6edfb2c7fcab5f8b81da8b84b4b17b6
- Commit de referencia en ComfyUI: https://github.com/Comfy-Org/ComfyUI/commit/efd4e951a00e85bd92e79f1d685427912b0dad5e
