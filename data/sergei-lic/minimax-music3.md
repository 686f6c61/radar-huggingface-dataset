# sergei-lic/MiniMax-Music3

## Resumen

MiniMax Music 3 es un modelo de generación de música a partir de texto desarrollado por MiniMax AI, orientado a la creación de canciones completas de hasta cinco minutos de duración. A diferencia de otros sistemas de text-to-music centrados en fragmentos cortos, este modelo ha sido diseñado para mantener coherencia estructural y temática a lo largo de secuencias largas, generando estructuras completas con intro, estrofa, estribillo, puente e outro. El repositorio analizado (sergei-lic/MiniMax-Music3) es una réplica del modelo original publicado por MiniMaxAI.

La arquitectura combina un LLM global de 8B parámetros, inicializado desde Qwen3-8B, que modela la estructura musical de largo alcance, con un LLM local de 0.6B que predice los detalles acústicos a nivel de frame. La síntesis final se realiza mediante Flow Matching (2.4B) y un decodificador Flow-VAE (123M) que produce audio estéreo a 32 kHz y 16 bits. El modelo acepta dos entradas complementarias: letras con etiquetas de sección explícitas y una descripción musical detallada que puede estructurarse en metadatos globales, detalles vocales y arreglos.

El modelo es relevante porque aborda uno de los problemas abiertos en generación musical: la coherencia a largo plazo. La separación entre modelado global y local, junto con el uso de estados ocultos continuos en lugar de tokens RVQ discretos para la síntesis, permite preservar información acústica rica en articulación vocal, textura instrumental y continuidad temporal. El repositorio ocupa 57,3 GB y contiene 2.431.905.920 parámetros en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida jerárquica autoregresiva: Global LLM (8B) + Local LLM (0.6B) + Flow Matching (2.4B) + Flow-VAE decoder (123M) |
| Parametros totales | 2.431.905.920 (según safetensors del repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repo analizado; el repo original enlaza a LICENSE en MiniMaxAI/MiniMax-Music3 |
| Formato de pesos | safetensors |
| Duracion maxima de audio | Hasta 5 minutos por canción |
| Frecuencia de muestreo | 32 kHz, 16 bits, estéreo WAV |
| Tokenizer musical | RVQ de 8 capas: 1 codebook semántico (16.384 entradas) + 7 codebooks acústicos (1.024 entradas cada uno) |

## Arquitectura y entrenamiento

MiniMax Music 3 emplea una arquitectura autoregresiva jerárquica que separa el modelado musical global del modelado acústico local. El Global LLM (8B), inicializado desde Qwen3-8B, predice frame a frame el primer codebook RVQ y captura la progresión semántica y estructural de la canción. El Local LLM (0.6B) predice los siete codebooks acústicos restantes dentro de cada frame, restaurando el detalle acústico fino. Durante el entrenamiento, las capas de embedding y salida del Global LLM se adaptan primero a tokens musicales semánticos, y después ambos LLM se entrenan conjuntamente para modelar todos los codebooks RVQ.

La síntesis no se realiza únicamente a partir de tokens RVQ discretos: el módulo de síntesis fusiona los estados ocultos finales del Global y del Local LLM y los pasa por un módulo de Flow Matching (2.4B) que genera un latente Flow-VAE, decodificado por un Flow-VAE decoder (123M) hasta audio estéreo a 32 kHz. Esta representación continua preserva información acústica más rica que la decodificación discreta. La arquitectura Flow-VAE está adaptada de MiniMax Speech y reentrenada para el rango dinámico y las características espectrales de la música. El tokenizer de entrenamiento usa ocho capas de RVQ: el primer codebook semántico tiene 16.384 entradas y los siete acústicos tienen 1.024 cada uno; primero se optimiza el codebook semántico y después se entrenan conjuntamente los ocho. En inferencia, la síntesis de waveform usa los estados ocultos fusionados y no requiere el decodificador del tokenizer discreto.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de canciones completas de hasta cinco minutos con coherencia estructural de largo alcance: intro, estrofa, pre-estribillo, estribillo, post-estribillo, puente, instrumental, solo y outro.
- Generación de voces expresivas con identidad vocal mantenida a lo largo de la canción.
- Control fino mediante letras con etiquetas de sección explícitas (`[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Post-Chorus]`, `[Bridge]`, `[Instrumental]`, `[Solo]`, `[Outro]`).
- Control mediante descripción musical detallada: género, subgénero, BPM, tonalidad, escala, progresión emocional, escenario de escucha, perfil de producción, género vocal, timbre, estilo interpretativo, armonías, coros, efectos vocales, instrumentación principal y secundaria, evolución instrumental por sección, groove, bajo, percusión, texturas y efectos espaciales.
- Soporte de caption estructurada en tres bloques: metadatos globales, detalles vocales y arreglos.
- Generación de audio estéreo a 32 kHz y 16 bits en formato WAV.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües explícitas.

## Casos de uso

- Producción musical asistida: un compositor puede introducir letras con etiquetas de sección y una caption estructurada con BPM, tonalidad e instrumentación para obtener una maqueta completa de hasta cinco minutos con estructura de canción definida, lo que acelera la fase de preproducción.
- Generación de bandas sonoras para vídeo y publicidad: el modelo permite especificar progresión emocional y evolución instrumental por sección, adecuado para piezas que requieren cambios de intensidad a lo largo de un spot o un tráiler.
- Creación de jingles y música de marca: la caption estructurada permite fijar género, timbre vocal, instrumentación y perfil de producción, facilitando variaciones controladas sobre una misma identidad sonora.
- Prototipado rápido de canciones para artistas: permite iterar sobre letras y descripciones musicales para explorar arreglos, grooves y estilos vocales antes de entrar en estudio.
- Generación de música de fondo para juegos y experiencias interactivas: la capacidad de mantener temas y ritmo a lo largo de secuencias largas resulta útil para pistas que deben acompañar sesiones de juego prolongadas.
- Investigación en generación musical: la separación entre Global LLM, Local LLM y síntesis por Flow Matching con estados ocultos fusionados ofrece una arquitectura de referencia para estudiar coherencia de largo plazo y representaciones continuas frente a tokens RVQ discretos.
- Educación musical y demostraciones: permite ilustrar cómo una descripción textual de instrumentación, groove y estructura se traduce en un arreglo audible, útil en contextos docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 57,3 GB en formato safetensors, por lo que la inferencia requiere al menos esa cantidad de VRAM o de memoria unificada si se carga el modelo completo sin cuantizar.
- El componente de mayor tamaño es el Global LLM de 8B parámetros, inicializado desde Qwen3-8B, más el módulo de Flow Matching de 2.4B, el Local LLM de 0.6B y el decoder Flow-VAE de 123M.
- GPU recomendadas para carga completa: A100 80 GB, H100 80 GB o configuraciones multi-GPU. No se dispone de datos oficiales de VRAM mínima por componente.
- En GPU de consumo: no se dispone de información sobre cuantizaciones GGUF, AWQ o GPTQ que permitan ejecución en RTX 4090 (24 GB) o inferiores. El tag `diffusers` y el formato safetensors sugieren un flujo de inferencia con PyTorch.
- Opciones de despliegue: la model card menciona `sglang-omni` como tag y `diffusers` como librería. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniMax Music 3 | 2,43B en safetensors (Global LLM 8B + Local LLM 0.6B + Flow Matching 2.4B + Flow-VAE 123M) | Hasta 5 minutos por canción; contexto no disponible | No disponible en el repo analizado | Hugging Face (repo espejo sergei-lic y repo oficial MiniMaxAI) | Generación de canciones completas con estructura y voces |
| Alternativas de text-to-music | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio analizado es un espejo con 0 descargas y 0 likes; no es el repositorio oficial de MiniMax AI. Conviene verificar la integridad de los pesos frente al repo oficial MiniMaxAI/MiniMax-Music3.
- La licencia no está disponible en el repositorio analizado. El repo original enlaza a un archivo LICENSE en MiniMaxAI/MiniMax-Music3; es imprescindible consultarlo antes de cualquier uso comercial.
- No se documentan los idiomas soportados para las letras ni para las descripciones musicales.
- No se documenta el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, lo que dificulta evaluar sesgos y calidad en dominios concretos.
- Riesgo de alucinación en el sentido de generar secciones, letras o arreglos que no se correspondan exactamente con la caption o las etiquetas proporcionadas; no se han publicado métricas de fidelidad a la caption.
- La generación de voces plantea riesgos de uso indebido (imitación de estilos vocales, suplantación). No se documentan salvaguardas específicas.
- No se dispone de información sobre cuantizaciones ni sobre requisitos mínimos de VRAM, lo que limita la planificación de despliegues en producción.
- El tamaño del repo (57,3 GB) y la ausencia de datos de latencia o throughput impiden estimar costes operativos sin pruebas propias.
- La duración máxima de cinco minutos y el formato WAV a 32 kHz pueden no ajustarse a pipelines que requieran otros formatos o duraciones.

## Enlaces

- Repositorio analizado en Hugging Face: https://huggingface.co/sergei-lic/MiniMax-Music3
- Repositorio oficial de MiniMax AI en Hugging Face: https://huggingface.co/MiniMaxAI
- Licencia del modelo original: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- Repositorio GitHub: https://github.com/MiniMax-AI/MiniMax-Music3
- Demo: https://minimax-ai.github.io/music3-demo/
- Web oficial: https://www.minimax.io
- Documentación de API: https://platform.minimax.io/docs/guides/text-generation
- MiniMax Code: https://agent.minimax.io/
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/DPC4AHFCBw
- Contacto WeChat: https://platform.minimaxi.com/docs/faq/contact-us
