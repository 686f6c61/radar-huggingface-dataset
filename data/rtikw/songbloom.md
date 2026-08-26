# rtikw/SongBloom

## Resumen

SongBloom es un framework de generación de canciones completas presentado por un equipo de investigadores (Chenyu Yang, Shuai Wang, Hangting Chen, Wei Tan, Jianwei Yu y Haizhou Li) en el artículo arXiv 2506.07634. El modelo combina un paradigma de generación intercalada que alterna un boceto autorregresivo con un refinamiento basado en difusión, logrando así la alta fidelidad de los modelos de difusión junto con la escalabilidad de los modelos de lenguaje. Este enfoque permite generar canciones de hasta 2 minutos y 30 segundos partiendo de una letra y un clip de audio de 10 segundos que actúa como prompt de estilo.

SongBloom es relevante porque aborda un problema abierto en la generación musical: la coherencia estructural en piezas largas. En lugar de generar la canción de una sola vez, el modelo extiende gradualmente un boceto musical de corto a largo y refina los detalles de grueso a fino, integrando contexto semántico y acústico previo en cada paso. El modelo tiene 2 mil millones de parámetros y está disponible bajo licencia Apache-2.0. El repositorio original fue eliminado por los autores, por lo que la distribución actual es un espejo no modificado alojado en HuggingFace y ModelScope.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo autorregresivo de difusión intercalada (autoregressive sketching + diffusion refinement) |
| Parametros totales | 2B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2m30s de audio (150 segundos) |
| Tipos de cuantizacion | bfloat16 (recomendado para GPUs de baja VRAM); fp32 disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 15.8 GB; probablemente safetensors o binarios de PyTorch) |

## Arquitectura y entrenamiento

SongBloom utiliza un modelo autorregresivo de difusión que combina la alta fidelidad de los modelos de difusión con la escalabilidad de los modelos de lenguaje. El proceso de generación se divide en dos fases intercaladas: primero, un boceto musical se extiende de forma autorregresiva de un segmento corto a uno largo; después, un refinamiento basado en difusión mejora los detalles de lo grueso a lo fino. Este paradigma intercalado integra el contexto semántico y acústico previo para guiar la generación, lo que permite mantener coherencia estructural en piezas largas.

El modelo se entrena con datos de canciones completas, aunque no se han publicado detalles sobre el número de tokens de audio, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La entrada consiste en una letra en formato JSONL junto con un clip de audio de 10 segundos a 48 kHz que actúa como prompt de estilo. La salida es una canción de hasta 150 segundos. El entrenamiento utilizó flash-attention v2.6.3 de forma opcional, y el modelo puede ejecutarse en precisión bfloat16 para reducir los requisitos de VRAM.

## Capacidades

- Generación de canciones completas de hasta 2 minutos y 30 segundos a partir de letras y un prompt de estilo en audio.
- Síntesis de voz cantada (singing voice synthesis) integrada con acompañamiento musical coherente.
- Control de estilo mediante un clip de referencia de 10 segundos (tipo de voz, instrumentación, género).
- Generación de música con estructura larga coherente (estrofa, estribillo, puente) gracias al paradigma intercalado.
- Soporte multilingüe para letras en inglés y chino.
- Pipeline de text-to-audio completo: entrada de letra y prompt de audio, salida de canción completa.
- Soporte de flash-attention para acelerar la inferencia en GPUs compatibles.
- Posibilidad de ejecución en GPU de consumo (RTX 4090) con cuantización bfloat16.

## Casos de uso

- Producción musical independiente: un artista puede generar un demo de una canción completa a partir de su letra y un clip de estilo de referencia, acelerando el proceso creativo antes de la grabación final.
- Composiciones para sincronización (sync licensing): creadores de contenido pueden generar rápidamente canciones para vídeos o podcasts, especificando el estilo mediante un prompt de audio y ajustando la letra.
- Herramientas de composición asistida: integración en DAWs o aplicaciones web donde el usuario escribe una letra y el modelo propone una maqueta musical completa que puede iterarse.
- Generación de maquetas para jingles publicitarios: agencias pueden producir variantes de una melodía con distintas letras y estilos a partir de un único prompt de audio de referencia.
- Educación musical: generar ejemplos de canciones en diferentes estilos para que estudiantes de composición analicen estructuras y arreglos.
- Prototipado de experiencias de audio interactivas: desarrolladores de juegos o aplicaciones pueden generar canciones de fondo personalizadas con letras adaptadas a la narrativa y un estilo definido por un clip de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo menciona que SongBloom supera a los métodos existentes en métricas subjetivas y objetivas, y que alcanza un rendimiento comparable a las plataformas comerciales de generación musical de última generación, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: para un modelo de 2B parámetros en bfloat16, los pesos requieren aproximadamente 4 GB de VRAM; sin embargo, la generación de audio de 150 segundos con el proceso de difusión y las representaciones intermedias requiere significativamente más memoria. El autor recomienda bfloat16 para GPUs con VRAM limitada.
- GPU recomendadas: RTX 4090 (24 GB) funciona con bfloat16; para fp32 se recomienda una GPU con mayor VRAM (por ejemplo, A100 o H100).
- En GPUs de consumo como RTX 4090 es viable, pero con limitaciones de longitud y tamaño de lote.
- Opciones de despliegue: inferencia mediante el script `infer.py` del repositorio, con soporte opcional de flash-attn v2.6.3. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de audio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se ha proporcionado una comparativa directa con modelos alternativos en los datos disponibles. El artículo menciona que SongBloom supera a métodos existentes en métricas subjetivas y objetivas y que es comparable a plataformas comerciales de música de última generación, pero no se incluyen nombres específicos de modelos ni resultados numéricos. Como referencia, otros modelos de generación musical de código abierto incluyen MusicGen (Meta, 1.5B) y Stable Audio (Stability AI), aunque no se dispone de una comparativa cuantitativa en esta información.

## Limitaciones y advertencias

- El repositorio original fue eliminado por los autores; la distribución actual es un espejo sin modificar, lo que implica que no hay mantenimiento oficial ni soporte técnico.
- No se han publicado detalles sobre el dataset de entrenamiento ni sobre posibles sesgos en los datos, lo que puede implicar un comportamiento menos robusto para estilos musicales o culturas no representadas.
- La generación de canciones largas puede presentar incoherencias en la estructura o en la letra en casos extremos, aunque el paradigma intercalado está diseñado para mitigarlo.
- El modelo requiere un prompt de audio de 10 segundos a 48 kHz; la calidad del resultado depende de la calidad de ese clip de referencia.
- Los idiomas soportados son inglés y chino; el rendimiento en otros idiomas no está documentado.
- La licencia Apache-2.0 permite uso comercial, pero al ser un mirror de un repositorio huérfano, es recomendable verificar la procedencia de los archivos antes de usarlo en producción.
- No se proporcionan garantías sobre la calidad musical ni sobre los derechos de las canciones generadas, que pueden estar sujetos a derechos de autor de las obras de referencia utilizadas en el entrenamiento.

## Enlaces

- Repositorio HuggingFace (mirror): https://huggingface.co/rtikw/SongBloom
- Repositorio HuggingFace original (eliminado): https://huggingface.co/CypressYang/SongBloom
- Repositorio HuggingFace del fork (rsxdalv): https://huggingface.co/rsxdalv/SongBloom
- Página del proyecto y demo: https://cypress-yang.github.io/SongBloom_demo/
- Paper en arXiv: https://arxiv.org/abs/2506.07634
- HTML del paper: https://arxiv.org/html/2506.07634v1
- Repositorio GitHub del fork: https://github.com/rsxdalv/tts-webui.songbloom
- Fuente original en ModelScope: https://modelscope.cn/models/AI-ModelScope/SongBloom
