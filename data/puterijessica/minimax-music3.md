# puterijessica/MiniMax-Music3

## Resumen

MiniMax Music 3 es un modelo de generación musical de texto a audio desarrollado por MiniMax AI, diseñado para crear canciones completas de hasta cinco minutos de duración. A diferencia de otros generadores que producen clips cortos, este modelo mantiene coherencia estructural a lo largo de toda la pieza, incluyendo secciones como intro, verso, pre-coro, coro, puente, interludio instrumental y outro. Se condiciona mediante dos entradas complementarias: letras con etiquetas de sección explícitas y una descripción musical detallada que especifica género, BPM, tonalidad, progresión emocional, características vocales y arreglo instrumental.

La arquitectura es jerárquica e híbrida: combina un LLM global de 8B parámetros (inicializado desde Qwen3-8B) que modela la estructura musical a largo plazo, un LLM local de 0.6B que restaura los detalles acústicos por frame, y un sistema de síntesis de estado oculto continuo basado en Flow Matching (2.4B) y un decodificador Flow-VAE (123M). El resultado es audio WAV estéreo de 32 kHz y 16 bits. El repositorio en HuggingFace contiene 2.431.905.920 parámetros en safetensors (67.2 GB), aunque la arquitectura completa supera los 11B parámetros, lo que sugiere que el repo puede contener solo una parte de los pesos o una versión cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida jerárquica: Global LLM (8B) + Local LLM (0.6B) + Flow Matching (2.4B) + Flow-VAE Decoder (123M) |
| Parametros totales | 11.123.000.000 (estimado por componentes); 2.431.905.920 en safetensors del repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (genera hasta 5 minutos de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las letras pueden ser en cualquier idioma, pero no se especifica) |
| Licencia | no disponible (hay enlace a LICENSE en la model card, sin especificar tipo) |
| Formato de pesos | safetensors, diffusers |

## Arquitectura y entrenamiento

MiniMax Music 3 emplea una arquitectura autoregresiva jerárquica que separa el modelado musical global del modelado acústico local. El Global LLM (8B parámetros, inicializado desde Qwen3-8B) predice el primer codebook RVQ frame a frame, capturando la progresión semántica y estructural de la canción. El Local LLM (0.6B) predice los codebooks acústicos restantes dentro de cada frame, restaurando los detalles finos. Ambos se entrenan conjuntamente para modelar los ocho codebooks RVQ del tokenizador musical.

El tokenizador usa ocho capas de Residual Vector Quantization: el primer codebook semántico tiene 16.384 entradas y captura la semántica musical central; los siete codebooks acústicos restantes tienen 1.024 entradas cada uno. El entrenamiento primero optimiza el codebook semántico y luego entrena los ocho conjuntamente. En inferencia, la síntesis de audio no decodifica directamente los tokens discretos, sino que fusiona los estados ocultos finales de ambos LLM mediante un módulo de fusión, que alimenta un modelo Flow Matching (2.4B) y un decodificador Flow-VAE (123M) adaptado de MiniMax Speech y reentrenado para las características espectrales de la música. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de canciones completas de hasta cinco minutos con coherencia estructural: mantiene temas musicales, ritmo, identidad vocal y progresión de arreglos a lo largo de toda la pieza.
- Control fino mediante letras con etiquetas de sección explícitas: `[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Post-Chorus]`, `[Bridge]`, `[Instrumental]`, `[Solo]` y `[Outro]`.
- Descripción musical estructurada en tres secciones: metadatos globales (género, subgénero, BPM, tonalidad, escala, progresión emocional, escenario de escucha, perfil de producción), detalles vocales (género, timbre, estilo de interpretación, armonías, coros, efectos) y arreglo (instrumentos principales y secundarios, evolución instrumental por sección, groove, bajo, percusión, texturas, efectos espaciales).
- Síntesis de audio de alta calidad: salida WAV estéreo de 32 kHz y 16 bits.
- Voces expresivas y arreglos en evolución: el modelo genera interpretaciones vocales con identidad consistente y cambios instrumentales progresivos a lo largo de la canción.
- Soporte de generación de larga duración estable: mantiene la calidad de audio sin degradación en secuencias de cinco minutos.

## Casos de uso

- Producción musical profesional: compositores y productores pueden generar demos completas de canciones con estructura definida (intro, verso, coro, puente) para presentar a artistas o sellos, usando letras propias y una descripción de estilo detallada.
- Creación de maquetas para sincronización audiovisual: generación de temas para bandas sonoras de vídeo, podcasts o publicidad, especificando género, BPM y progresión emocional para ajustarse a la narrativa.
- Herramienta de composición asistida: los letristas pueden escribir estrofas y coros con etiquetas de sección y obtener una interpretación musical completa que sirva de base para arreglos posteriores.
- Generación de música de fondo para videojuegos: creación de pistas largas con variaciones instrumentales que se adaptan a diferentes niveles o escenas, manteniendo coherencia temática.
- Educación musical: estudiantes de composición pueden experimentar con diferentes estilos, estructuras y arreglos generando variaciones de una misma letra con distintas descripciones musicales.
- Prototipado rápido para artistas independientes: músicos sin acceso a estudios de grabación pueden generar demos vocales e instrumentales de alta calidad para compartir con colaboradores o financiar proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos objetivos de evaluación como MMLU, HumanEval o métricas específicas de generación musical (FAD, CLAP score, etc.) en la documentación proporcionada.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la información disponible.
- El repositorio ocupa 67.2 GB, lo que sugiere que la inferencia requiere una GPU con al menos 80 GB de VRAM para cargar los pesos completos en FP16 (aproximadamente 22 GB para los 11B parámetros, más overhead de activaciones y el modelo Flow Matching).
- Para uso en consumer GPU (RTX 4090 con 24 GB), sería necesaria cuantización a 8 bits o 4 bits, aunque no se han publicado versiones GGUF ni cuantizadas.
- Opciones de despliegue: el pipeline está basado en diffusers, por lo que es compatible con la infraestructura de HuggingFace. Se menciona sglang-omni en los tags, lo que sugiere soporte para inferencia optimizada con SGLang, aunque no hay documentación detallada.
- La latencia y el throughput no están documentados; la generación de cinco minutos de audio probablemente requiere varios minutos de cómputo en GPU de alta gama.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de generación musical como MusicGen (Meta), Stable Audio (Stability AI) o Suno. La información disponible no incluye benchmarks comparativos ni métricas objetivas que permitan una comparación rigurosa. Cualitativamente, MiniMax Music 3 se diferencia por su capacidad de generar canciones completas de cinco minutos con estructura explícita y control fino sobre letras y arreglos, mientras que muchos competidores se limitan a clips de 30 segundos a un minuto.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo, pero al estar entrenado con datos musicales de internet, puede reflejar sesgos culturales y de género en los estilos generados.
- Riesgo de alucinación: como modelo generativo, puede producir letras o melodías que no correspondan exactamente a la descripción solicitada, especialmente en secciones largas.
- La licencia no está especificada en la información disponible, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con MiniMax AI antes de usar el modelo en producción.
- No se han publicado detalles sobre el dataset de entrenamiento, lo que dificulta evaluar posibles problemas de derechos de autor o calidad de los datos.
- El tamaño del repositorio (67.2 GB) y la arquitectura de 11B parámetros implican requisitos de hardware elevados, no aptos para entornos de desarrollo con GPUs de gama media.
- La generación de audio de larga duración puede presentar artefactos o degradación en secciones muy extensas, aunque el modelo está diseñado para mitigarlo.

## Enlaces

- Repositorio HuggingFace (mirror): https://huggingface.co/puterijessica/MiniMax-Music3
- Repositorio HuggingFace oficial: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- GitHub oficial: https://github.com/MiniMax-AI/MiniMax-Music3
- Demo interactiva: https://minimax-ai.github.io/music3-demo/
- Página de herramientas (terceros): https://minimax3.com/tools/minimax-music-3
- Análisis de casos de uso (terceros): https://www.aimodels.fyi/models/huggingFace/minimax-music3-minimaxai
