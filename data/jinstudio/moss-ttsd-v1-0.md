# Jinstudio/MOSS-TTSD-v1.0

## Resumen

MOSS-TTSD-v1.0 es un modelo de texto a voz (TTS) orientado a la generación de diálogo conversacional multihablante de formato largo, desarrollado por MOSI.AI y el equipo OpenMOSS. Forma parte de la familia MOSS-TTS, compuesta por cinco modelos de producción que cubren narración, diálogo, diseño de voz, efectos de sonido y TTS en streaming en tiempo real. Este repositorio concreto (Jinstudio/MOSS-TTSD-v1.0) es una réplica del modelo original OpenMOSS-Team/MOSS-TTSD-v1.0, con los mismos 8.355.492.864 parámetros y licencia Apache 2.0.

El modelo resuelve un problema específico: producir audio conversacional con varios hablantes que suene natural, mantenga la coherencia de las voces durante decenas de minutos y permita controlar los turnos de palabra, partiendo de referencias de voz cortas para la clonación zero-shot. Está pensado para pódcasts, audiolibros, doblaje, retransmisiones y diálogo de personajes, no para síntesis de una sola frase.

Técnicamente emplea la arquitectura MossTTSDelay (8B parámetros), implementada con código personalizado dentro de la librería transformers (requiere `trust_remote_code`), y se apoya en el tokenizador de audio descrito en el paper MOSS-Audio-Tokenizer (arXiv:2602.10934). Soporta 20 idiomas, entre ellos el español. No se han publicado en la información disponible datos sobre contexto máximo, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossTTSDelay (8B), implementación con código personalizado en transformers |
| Parametros totales | 8.355.492.864 (~8,36 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos safetensors en 16 bits (16,7 GB). No se documentan variantes GGUF, AWQ, GPTQ ni int8/int4 |
| Idiomas soportados | 20: zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 16,7 GB) |

## Arquitectura y entrenamiento

MOSS-TTSD-v1.0 se basa en MossTTSDelay, una arquitectura autorregresiva que opera sobre tokens de audio discretos generados por el tokenizador MOSS-Audio-Tokenizer, presentado en el paper «MOSS-Audio-Tokenizer: Scaling Audio Tokenizers for Future Audio Foundation Models» (arXiv:2602.10934). El modelo consume texto y una referencia de voz corta, y produce la secuencia de tokens de audio correspondiente al diálogo, incluyendo la alternancia entre hablantes. La etiqueta `moss_tts_delay` del repositorio hace referencia a este esquema de generación con retardo, propio de la familia.

El objetivo declarado del modelo es el diálogo expresivo multihablante de gran escala: continuidad en emisiones largas, control de los turnos de conversación y clonación de voz zero-shot a partir de referencias breves. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni sobre innovaciones adicionales de decodificación (decodificación especulativa, atención lineal, etc.); estos datos no están publicados en la información disponible.

## Capacidades

- Síntesis de voz de diálogo multihablante: genera audio conversacional con varios interlocutores diferenciados.
- Clonación de voz zero-shot a partir de referencias de audio cortas.
- Formato largo: mantiene la continuidad y la coherencia de las voces en emisiones de decenas de minutos.
- Control de turnos de palabra (turn-taking) para estructurar la conversación.
- Síntesis expresiva, con variación de estilos de habla según el contenido.
- Multilingüe: 20 idiomas, incluido el español, además de chino, inglés, alemán, francés, japonés, italiano, hebreo, coreano, ruso, persa, árabe, polaco, portugués, checo, danés, sueco, húngaro, griego y turco.
- Salida en formato audio (pipeline `text-to-speech`); no es un modelo de generación de texto.
- No soporta tool calling ni function calling, razonamiento multi-paso, agentes, visión ni audio de entrada como comprensión: es exclusivamente un modelo de síntesis de voz.
- No se documenta modo «thinking», ni control de emoción por etiquetas explícitas, ni streaming de baja latencia en esta variante (esa función corresponde a MOSS-TTS-Realtime, un modelo distinto de 1,7B).

## Casos de uso

- Producción de pódcasts: el modelo genera diálogos completos entre dos o más locutores con voces diferenciadas y consistentes, lo que permite crear episodios íntegros a partir de un guion sin grabar a los hablantes.
- Audiolibros y narración con varios personajes: la clonación zero-shot desde referencias cortas permite asignar un timbre estable a cada personaje y mantenerlo durante capítulos largos, gracias a la continuidad en formato largo.
- Doblaje y localización de contenido: al cubrir 20 idiomas, se puede adaptar un guion a distintas lenguas manteniendo la identidad vocal del original mediante referencias de audio.
- Retransmisiones y comentario deportivo o de eventos: la expresividad y el control de turnos permiten generar comentarios con réplicas entre narrador y analista, con ritmo conversacional.
- Entretenimiento y role-play: diálogos de personajes para videojuegos, ficción interactiva o contenido de audio social donde se requieren varias voces coherentes sin estudio de grabación.
- Generación de datos sintéticos de diálogo para entrenar o evaluar sistemas ASR y modelos de diarización: el control de turnos y hablantes facilita producir corpus con etiquetas de quién habla en cada momento.
- Accesibilidad y lectura de documentos extensos: conversión de textos largos en audio con voces estables para usuarios con dificultades de lectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 8,36 B de parámetros): en fp16/bf16 los pesos ocupan unos 16,7 GB; con caché de tokens de audio, tokenizador y overhead de runtime hay que prever del orden de 20-24 GB.
- En int8 serían aproximadamente 8,4 GB de pesos y en int4 unos 4,2 GB, pero el repositorio no publica pesos cuantizados ni recetas de cuantización, por lo que estas cifras son estimaciones teóricas, no configuraciones soportadas documentadas.
- GPU recomendadas: A100 40 GB u 80 GB, H100 y L40S 48 GB para fp16 con margen; A100/H100 son la opción natural para producción con varias peticiones concurrentes.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en fp16 con un margen ajustado; por debajo de 24 GB habría que recurrir a cuantización, no documentada por el autor.
- Opciones de despliegue: carga mediante transformers con `trust_remote_code=True` (el repositorio usa código personalizado). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama en esta arquitectura de audio.
- Latencia y throughput: no disponible. No se publican métricas de RTF (real-time factor), ni de tiempo hasta el primer audio.

## Comparativa con modelos similares

Comparación dentro de la propia familia MOSS-TTS, con los datos publicados en la model card:

| Modelo | Arquitectura | Parametros | Funcion principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-TTSD-v1.0 | MossTTSDelay | 8B | Diálogo multihablante de formato largo | apache-2.0 | Hugging Face (OpenMOSS-Team y réplica Jinstudio) |
| MOSS-TTS | MossTTSDelay | 8B | TTS base con clonación zero-shot y síntesis larga | apache-2.0 | Hugging Face (OpenMOSS-Team/MOSS-TTS) |
| MOSS-TTS-Local-Transformer | MossTTSLocal | 1,7B | Variante ligera de TTS | apache-2.0 | Hugging Face (OpenMOSS-Team/MOSS-TTS-Local-Transformer) |
| MOSS-TTS-Realtime | MossTTSRealtime | 1,7B | TTS en streaming multiturno para agentes de voz | apache-2.0 | Hugging Face (OpenMOSS-Team/MOSS-TTS-Realtime) |
| MOSS-VoiceGenerator | MossTTSDelay | 1,7B | Diseño de timbre desde texto libre, sin audio de referencia | apache-2.0 | Hugging Face (OpenMOSS-Team/MOSS-Voice-Generator) |
| MOSS-SoundEffect | MossTTSDelay | 8B | Texto a efectos de sonido y ambientes | apache-2.0 | Hugging Face (OpenMOSS-Team/MOSS-SoundEffect) |

No se dispone en la información proporcionada de datos de modelos comparables de otros desarrolladores (parámetros, contexto, benchmarks) para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Este repositorio (Jinstudio/MOSS-TTSD-v1.0) es una réplica con 0 descargas y 0 likes, publicada sin vinculación aparente con el equipo original; para producción conviene usar OpenMOSS-Team/MOSS-TTSD-v1.0 como fuente de referencia y verificar la integridad de los pesos.
- No se publican datos de entrenamiento, por lo que se desconocen los sesgos de acento, género, edad y procedencia de las voces del corpus; es esperable un sesgo hacia los idiomas con más presencia en los datos (previsiblemente chino e inglés).
- La calidad por idioma no está documentada individualmente; que el español figure entre los 20 idiomas soportados no garantiza un rendimiento equivalente al de los idiomas principales.
- Riesgo de artefactos acústicos, errores de pronunciación en nombres propios, siglas y números, y deriva del timbre en generaciones muy largas, aunque el modelo esté optimizado para continuidad.
- La clonación de voz zero-shot permite suplantar identidades vocales; es imprescindible aplicar consentimiento explícito, marcas de agua o detección de audio sintético antes de cualquier despliegue público.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se ofrece sin garantías; el autor original no asume responsabilidad sobre el uso del modelo.
- No es un modelo de texto: no genera respuestas escritas, no razona, no usa herramientas y no debe evaluarse con benchmarks de lenguaje.
- Requiere `trust_remote_code=True` al cargarse en transformers, lo que implica ejecutar código del repositorio; conviene auditar ese código antes de desplegarlo en entornos productivos.
- No se documenta soporte para cuantización ni para servidores de inferencia de alto rendimiento, lo que limita el despliegue escalado a la ruta estándar de transformers.

## Enlaces

- Repositorio Hugging Face de esta réplica: https://huggingface.co/Jinstudio/MOSS-TTSD-v1.0
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-TTSD-v1.0
- Repositorio GitHub del proyecto: https://github.com/OpenMOSS/MOSS-TTS
- Model card de MOSS-TTSD: https://github.com/OpenMOSS/MOSS-TTS/blob/main/docs/moss_ttsd_model_card.md
- Paper MOSS-Audio-Tokenizer: https://huggingface.co/papers/2602.10934
- Colección en ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Blog de MOSI.AI: https://mosi.cn/#models
- Web de OpenMOSS: https://www.open-moss.com/
- Demo en AI Studio: https://studio.mosi.cn
- Documentación de la API: https://studio.mosi.cn/docs/moss-tts
- Twitter: https://x.com/Open_MOSS
- Discord: https://discord.gg/fvm5TaWjU3
