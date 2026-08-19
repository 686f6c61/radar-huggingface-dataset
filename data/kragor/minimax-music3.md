# Kragor/MiniMax-Music3

## Resumen

MiniMax Music 3 es un modelo de generación de música de texto a audio desarrollado por MiniMax AI, diseñado para crear canciones completas de hasta cinco minutos de duración. A diferencia de otros generadores que producen clips cortos o bucles, este modelo genera piezas musicales estructuralmente coherentes con voces expresivas, arreglos que evolucionan y calidad de audio estable en secuencias largas. El modelo acepta dos entradas complementarias: letras con etiquetas de sección (intro, verso, coro, puente, etc.) y una descripción musical detallada que especifica género, BPM, tonalidad, estilo vocal, instrumentación y perfil de producción.

La arquitectura es jerárquica y combina un LLM global de 8B parámetros (inicializado desde Qwen3-8B) que modela la estructura musical de largo alcance, un LLM local de 0.6B que restaura los detalles acústicos a nivel de trama, y un sistema de síntesis de estados ocultos continuos basado en Flow Matching y Flow-VAE. El resultado es audio estéreo WAV de 32 kHz y 16 bits. El repositorio referenciado (Kragor/MiniMax-Music3) contiene 2.431.905.920 parámetros en formato safetensors (67.2 GB), que corresponden probablemente a una parte del modelo completo (posiblemente el módulo de Flow Matching o el decodificador), aunque la arquitectura total declarada por el autor original suma aproximadamente 11B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida jerárquica: Global LLM (8B) + Local LLM (0.6B) + Flow Matching (2.4B) + Flow-VAE Decoder (123M) |
| Parametros totales | 2.431.905.920 (repo safetensors); modelo completo declarado ~11B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (letras en múltiples idiomas presumiblemente, sin confirmar) |
| Licencia | No disponible (enlace a LICENSE en el repo original) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniMax Music 3 emplea una arquitectura autoregresiva jerárquica que separa el modelado musical global del modelado acústico local. El LLM global de 8B parámetros predice el primer codebook RVQ trama a trama, capturando la progresión semántica y estructural de la canción. El LLM local de 0.6B predice los codebooks acústicos restantes dentro de cada trama, restaurando la información acústica de grano fino. El LLM global se inicializa desde Qwen3-8B y sus capas de embedding y salida se adaptan a tokens musicales semánticos durante el entrenamiento. Ambos LLM se entrenan conjuntamente para modelar todos los codebooks RVQ.

El tokenizador de entrenamiento utiliza ocho capas de Residual Vector Quantization (RVQ): el primer codebook semántico contiene 16.384 entradas y captura la semántica musical y la estructura; los siete codebooks acústicos restantes contienen 1.024 entradas cada uno y representan detalles acústicos residuales. En lugar de decodificar solo desde tokens RVQ discretos, el módulo de síntesis fusiona los estados ocultos finales de ambos LLM y los pasa por un sistema de Flow Matching de 2.4B parámetros que genera el latente del Flow-VAE, que finalmente es decodificado por un decodificador de 123M parámetros para producir audio estéreo de 32 kHz. El Flow-VAE está adaptado de MiniMax Speech y reentrenado para las características de rango dinámico y espectrales de la música.

## Capacidades

- Generación de canciones completas de hasta 5 minutos con estructura coherente (intro, verso, pre-coro, coro, puente, sección instrumental y outro).
- Condicionamiento dual: letras con etiquetas de sección explícitas (`[Intro]`, `[Verse]`, `[Chorus]`, `[Bridge]`, `[Instrumental]`, `[Solo]`, `[Outro]`, etc.) y descripción musical detallada.
- Control fino de estilo mediante Structured Caption con tres secciones: metadatos globales (género, subgénero, BPM, tonalidad, escala, progresión emocional, escenario de escucha, perfil de producción), detalles vocales (género de voz, timbre, estilo de interpretación, armonías, coros, efectos vocales) y arreglo (instrumentos principales y secundarios, evolución instrumental por sección, groove, bajo, percusión, texturas y efectos espaciales).
- Mantenimiento de temas musicales, ritmo, identidad vocal y progresión de arreglos a lo largo de secuencias largas.
- Salida de audio estéreo de 32 kHz y 16 bits en formato WAV.
- Integrable con pipelines de diffusers y compatible con sglang-omni para inferencia.

## Casos de uso

- Composición musical profesional: un compositor puede generar un demo completo de una canción con letra y descripción de estilo, obteniendo una maqueta de 3-5 minutos con estructura definida (verso-coro-puente) para presentar a clientes o productores.
- Producción musical independiente: artistas sin acceso a estudio pueden crear canciones completas con voces y arreglos, usando el modelo como punto de partida para luego editar o remezclar en su DAW.
- Banda sonora para videojuegos: generar temas musicales con progresión emocional específica (tensión, calma, climax) que se adapten a diferentes escenas o niveles, con duración suficiente para cubrir secuencias completas de juego.
- Contenido para redes sociales: creadores de contenido pueden generar canciones originales con letras personalizadas y estilo definido para vídeos de YouTube, TikTok o Instagram, evitando problemas de derechos de autor.
- Prototipado rápido para jingles publicitarios: agencias pueden generar múltiples variaciones de un jingle con diferentes estilos y emociones en minutos, para testear con clientes antes de la producción final.
- Educación musical: profesores pueden crear ejemplos auditivos de diferentes géneros, estructuras de canción o técnicas vocales para ilustrar conceptos teóricos en clase.
- Terapia y bienestar: generar piezas musicales personalizadas con progresiones emocionales específicas (relajación, motivación) para sesiones de meditación, terapia o ejercicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos comparativos de MMLU, HumanEval u otras métricas, ya que se trata de un modelo de generación de audio y no de texto o código.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM ni requisitos de hardware en la información disponible.
- El modelo completo declarado (~11B parámetros) requiere una GPU con al menos 24 GB de VRAM para inferencia en precisión FP16, aunque la cuantización podría reducir este requisito.
- El repositorio referenciado contiene 2.4B parámetros (67.2 GB en safetensors), lo que sugiere que podría ejecutarse en GPUs consumer de gama alta (RTX 3090/4090 con 24 GB) si se cuantiza adecuadamente.
- Opciones de despliegue: compatible con diffusers y sglang-omni, según los tags del repositorio. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. Los modelos comparables en generación de música serían MusicGen (Meta), Stable Audio (Stability AI) o AudioLDM, pero no hay cifras de rendimiento publicadas que permitan una comparación objetiva. La principal diferencia cualitativa es que MiniMax Music 3 está diseñado específicamente para canciones completas de larga duración con estructura y voces, mientras que muchos alternativos se centran en clips cortos o música instrumental.

## Limitaciones y advertencias

- El repositorio referenciado (Kragor/MiniMax-Music3) es un mirror no oficial con 0 descargas y 0 likes; se desconoce si los pesos son completos o parciales, y no hay garantía de integridad respecto al modelo original de MiniMaxAI.
- La licencia no está disponible en la información del repositorio; el modelo original tiene un enlace a una licencia (posiblemente Creative Commons según el badge), pero no se confirma su texto ni sus restricciones de uso comercial.
- No se especifican los idiomas soportados para las letras; el modelo podría tener un rendimiento desigual con idiomas distintos del inglés.
- Riesgo de alucinación en la letra o en la estructura musical si las entradas son ambiguas o contradictorias.
- La salida es audio de 32 kHz, inferior a la calidad de estudio estándar (44.1 kHz o 48 kHz), lo que puede requerir post-procesado.
- No hay información sobre sesgos del modelo ni sobre su comportamiento con géneros musicales minoritarios o no occidentales.
- Para uso en producción, se recomienda validar la calidad de las salidas con oyentes humanos, ya que no hay benchmarks objetivos publicados.

## Enlaces

- Repositorio HuggingFace (mirror): https://huggingface.co/Kragor/MiniMax-Music3
- Repositorio oficial HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Repositorio GitHub: https://github.com/MiniMax-AI/MiniMax-Music3
- Demo oficial: https://minimax-ai.github.io/music3-demo/
- Plataforma MiniMax Agent: https://agent.minimax.io/
- Documentación de API: https://platform.minimax.io/docs/guides/text-generation
