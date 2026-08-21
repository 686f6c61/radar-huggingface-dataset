# r3lax/MiniMax-Music3

## Resumen

MiniMax Music 3 es un modelo de generación musical de código abierto desarrollado por MiniMax, diseñado para crear canciones completas de hasta cinco minutos de duración a partir de letras y una descripción musical detallada. El modelo genera audio estéreo WAV a 32 kHz y 16 bits, manteniendo coherencia estructural a lo largo de toda la composición: temas musicales, ritmo, identidad vocal y progresión de arreglos. Este repositorio en particular, publicado por el usuario r3lax, contiene una parte del modelo con 2.431.905.920 parámetros (aproximadamente 2,4 mil millones) y un tamaño de 67,2 GB.

La arquitectura del modelo combina un LLM global de 8B parámetros para la estructura musical a largo plazo, un LLM local de 0,6B para el detalle acústico a nivel de trama, y un sistema de síntesis de estado oculto continuo basado en Flow Matching y Flow-VAE. El LLM global está inicializado desde Qwen3-8B. El modelo acepta dos entradas complementarias: letras con etiquetas de sección explícitas como `[Intro]`, `[Verse]`, `[Chorus]`, `[Bridge]` o `[Outro]`, y una descripción musical estructurada con metadatos globales, detalles vocales y arreglo instrumental.

La relevancia actual de este modelo reside en su capacidad para generar canciones completas con estructura coherente, algo que los modelos de generación musical anteriores limitaban a clips cortos. Su licencia está marcada como no disponible en este repositorio, aunque la model card original de MiniMaxAI referencia un archivo LICENSE propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LLM global autoregresivo (8B) + LLM local (0.6B) + Flow Matching (2.4B) + Flow-VAE decoder (123M) |
| Parametros totales | 2.431.905.920 (en este repositorio; el modelo completo suma aproximadamente 11,1B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible en este repositorio |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniMax Music 3 utiliza una arquitectura jerárquica autoregresiva que separa el modelado musical global del modelado acústico local. El Global LLM (8B), inicializado desde Qwen3-8B, predice el primer codebook RVQ trama a trama y modela la progresión semántica y estructural de la canción. El Local LLM (0.6B) predice los codebooks acústicos restantes dentro de cada trama y restaura la información acústica de grano fino. Durante el entrenamiento, las capas de embedding y salida del Global LLM se adaptan primero a tokens musicales semánticos, y después ambos LLM se entrenan conjuntamente para modelar todos los codebooks RVQ.

La síntesis de audio no decodifica únicamente tokens RVQ discretos, sino que fusiona los estados ocultos finales de ambos LLM. Estas representaciones continuas conservan información acústica más rica para la articulación vocal, la textura instrumental y la continuidad temporal. El camino de síntesis es: estados ocultos de los LLM global y local, fusión de estados ocultos, Flow Matching (2.4B), latente Flow-VAE, decoder Flow-VAE (123M), y salida de audio estéreo a 32 kHz. El tokenizador de entrenamiento usa ocho capas de Residual Vector Quantization: la primera codebook semántica contiene 16.384 entradas y captura la semántica y estructura musical central; las siete codebooks acústicas restantes contienen 1.024 entradas cada una y representan los detalles acústicos residuales.

## Capacidades

- Generación de canciones completas de hasta cinco minutos con estructura coherente: intro, verso, pre-coro, coro, puente, sección instrumental y outro.
- Condicionamiento dual: letras con etiquetas de sección explícitas y descripción musical detallada con estilo, progresión emocional, interpretación vocal, instrumentación, arreglo y perfil de producción.
- Control fino de la música mediante captions estructurados con tres secciones: metadatos globales (género, subgénero, BPM, tonalidad, escala, progresión emocional, escenario de escucha, perfil de producción), detalles vocales (género de voz, timbre, estilo de interpretación, armonías, coros, efectos vocales) y arreglo (instrumentos primarios y secundarios, evolución instrumental por sección, groove, bajo, percusión, texturas y efectos espaciales).
- Generación de audio estéreo WAV a 32 kHz y 16 bits.
- Mantenimiento de temas musicales, ritmo, identidad vocal y progresión de arreglos a lo largo de secuencias largas.
- Capacidad de generar tanto canciones vocales como pistas instrumentales.
- Integración con pipelines de diffusers y sglang-omni.

## Casos de uso

- Producción musical independiente: un artista puede generar una canción completa con letras y estructura definidas, usando las etiquetas de sección para obtener un arreglo coherente con intro, coro y puente, y posteriormente refinar la mezcla en un DAW.
- Composición de maquetas para sellos discográficos: permite generar demos de canciones completas con una descripción de estilo, BPM y tonalidad, facilitando la evaluación rápida de ideas por parte de productores y A&R.
- Creación de bandas sonoras para videojuegos: el modelo puede producir temas musicales con duración suficiente para cubrir una escena completa, manteniendo la coherencia temática a lo largo de la secuencia.
- Generación de jingles y sintonías publicitarias: con una descripción de estilo y duración, el modelo genera piezas cortas con estructura definida y producción limpia, listas para pruebas de concepto.
- Prototipado de arreglos instrumentales: permite explorar variaciones de instrumentación, groove y textura para una misma letra, acelerando el proceso creativo de arreglistas.
- Educación musical: el modelo puede generar ejemplos de estructuras de canción con diferentes géneros y estilos, útil para estudiantes que necesitan analizar progresiones armónicas y formas musicales.
- Contenido para plataformas de streaming: creación de canciones originales con voz y arreglo completo para librerías de música libre de derechos, con la condición de verificar la licencia del modelo en el repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas comparativas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de generación de audio y no de razonamiento general. No hay datos de evaluación objetiva de calidad musical (por ejemplo, FAD o CLAP score) en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio contiene 2,4B parámetros en safetensors (67,2 GB), pero el modelo completo incluye componentes de 8B, 0.6B y 123M, por lo que la VRAM necesaria para cargar el modelo completo es sustancialmente mayor.
- GPU recomendadas: no disponible. Dado el tamaño del modelo completo, se recomienda al menos una GPU con 48-80 GB de VRAM para el modelo completo, como A100 o H100. Para el componente de 2,4B del repositorio, una RTX 4090 con 24 GB podría ser suficiente con cuantización, aunque no se especifica.
- Si cabe en consumer GPU: no se puede afirmar sin datos de cuantización. El componente de 2,4B del repositorio podría caber en una GPU de 24 GB con cuantización, pero el modelo completo no.
- Opciones de despliegue: el repositorio usa diffusers y sglang-omni, lo que sugiere compatibilidad con pipelines de generación de audio de HuggingFace. No hay soporte documentado para llama.cpp, Ollama o vLLM para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay datos suficientes para comparar con modelos alternativos de generación musical como MusicGen (Meta), AudioLDM 2 o Stable Audio. La información disponible no incluye benchmarks comparativos ni especificaciones detalladas de estos modelos alternativos en los materiales proporcionados. La comparativa queda pendiente de datos objetivos.

## Limitaciones y advertencias

- El repositorio es una publicación de un usuario (r3lax) y no la oficial de MiniMax; la licencia no está disponible, lo que impide verificar las condiciones de uso comercial.
- Los idiomas soportados no están documentados; no se puede confirmar si el modelo funciona correctamente en español o en otros idiomas distintos del inglés.
- La longitud de contexto no está especificada, lo que limita la planificación de generaciones largas.
- Riesgo de alucinación: los modelos de generación musical pueden producir letras o melodías que no se corresponden exactamente con la descripción solicitada, especialmente en secciones complejas como el puente o el solo.
- El modelo genera audio de 32 kHz, lo que puede limitar la calidad percibida en sistemas de alta fidelidad que esperan 44,1 kHz o 48 kHz.
- El repositorio no incluye documentación sobre el proceso de entrenamiento, los datos utilizados o si se aplicaron técnicas de alineación como RLHF o DPO, lo que dificulta evaluar sesgos o riesgos de contenido.
- La identidad vocal generada puede ser similar a voces reales existentes, lo que plantea riesgos legales y éticos en el uso de la voz generada para fines comerciales.
- No se especifican los requisitos de hardware para el modelo completo, lo que puede llevar a errores de memoria en entornos de producción.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/r3lax/MiniMax-Music3
- Página de demo: https://minimax-ai.github.io/music3-demo/
- Repositorio GitHub de MiniMax-AI: https://github.com/MiniMax-AI/MiniMax-Music3
- Guía independiente: https://minimaxmusic3.ai/
- Herramienta de generación: https://minimax3.com/tools/minimax-music-3
- Página de generación: https://www.minimax-music.com/minimax-music-3
