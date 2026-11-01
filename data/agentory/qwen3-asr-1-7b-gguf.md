# agentory/qwen3-asr-1.7b-GGUF

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen (Alibaba). Este repositorio concreto, publicado por el usuario `agentory`, no contiene pesos nuevos ni un modelo entrenado desde cero: es una conversión a formato GGUF del modelo original `Qwen/Qwen3-ASR-1.7B`, pensada para su uso con el motor de inferencia CrispASR. La conversión preserva arquitectura, vocabulario y capacidades del modelo de origen; solo cambia la representación numérica de los pesos.

El modelo combina un codificador de audio de estilo Whisper de 24 capas con un decodificador basado en Qwen3 de 28 capas, lo que le permite transcribir y traducir voz de forma multilingüe. Según la model card, soporta 30 idiomas y 22 dialectos chinos, además de audio musical (voz cantada y canciones con música de fondo) y entradas de hasta 5 minutos de duración. Los pesos totales reales del modelo base ascienden a 2.349.243.536 parámetros.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un ASR multilingüe de calidad en CPU o GPU de gama baja mediante cuantización GGUF, con un archivo Q4_K de aproximadamente 1,5 GB. La versión Q4_K fue re-empaquetada en julio de 2026 para mantener el codificador de audio en Q8_0, corrigiendo un fallo documentado que podía producir transcripciones vacías o repetidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio estilo Whisper (24 capas) + proyector MLP de 2 capas + decodificador LLM Qwen3 (28 capas) |
| Parametros totales | 2.349.243.536 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (entradas de audio de hasta 5 minutos según la model card) |
| Tipos de cuantizacion | Q4_K, Q8_0, F16 |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, pt, ru, it (la model card indica 30 idiomas y 22 dialectos chinos en el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

Detalles técnicos adicionales del modelo base: codificador de audio con dimensión 1024, 16 cabezas de atención y activación GELU; proyector MLP de 1024 a 2048; decodificador con dimensión 2048, 16 cabezas de consulta y 8 de clave/valor, `head_dim` de 128 y activación SwiGLU; vocabulario de 151.936 tokens con BPE de tipo GPT-2; y RoPE theta de 1.000.000.

## Arquitectura y entrenamiento

La arquitectura es un sistema secuencial de dos etapas típico de los modelos de voz-a-texto modernos: un codificador de audio convolucional y transformer (24 capas, estilo Whisper) que transforma la señal acústica en representaciones latentes, un proyector MLP de dos capas que adapta esas representaciones al espacio del decodificador, y un LLM Qwen3 de 28 capas que genera el texto final. El uso de un decodificador Qwen3 permite heredar el comportamiento lingüístico y multilingüe de la familia Qwen3, incluyendo la tokenización BPE de 151.936 entradas.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en este repositorio, ya que la model card remite al proveedor original para esos detalles. Lo que sí está documentado es el proceso de conversión: se parte de la variante no-HF (`Qwen/Qwen3-ASR-1.7B`) mediante el script `convert-qwen3-asr-to-gguf.py`, se genera un GGUF F16 y se cuantiza con `crispasr-quantize`. El conversor también admite la variante `-hf`, con convención de nombres de tensores distinta pero resultados idénticos.

La innovación técnica destacable de esta conversión es el re-empaquetado de julio de 2026: el archivo Q4_K mantiene el codificador de audio de 24 capas en Q8_0 (aproximadamente 0,15 GB más grande) para evitar la deriva que sufrían los codificadores por debajo de 8 bits. La similitud coseno de la salida del codificador frente a la referencia F16 pasó de 0,9632 a 0,9989 en el mínimo y de 0,9913 a 0,9998 en la media, eliminando la degeneración en la decodificación.

## Capacidades

- Reconocimiento automático del habla multilingüe en 30 idiomas, con los diez idiomas listados en la model card (inglés, chino, japonés, coreano, alemán, francés, español, portugués, ruso e italiano) como conjunto verificado.
- Soporte de 22 dialectos chinos según la documentación del modelo base.
- Transcripción de voz cantada y de canciones con música de fondo, no solo habla limpia.
- Procesamiento de entradas de audio de hasta 5 minutos de duración.
- Modo de traducción de voz: transcripción con traducción al idioma objetivo (por ejemplo, `--translate --target-lang en`).
- Indicación de idioma opcional mediante el flag `-l` para mejorar la precisión cuando se conoce la lengua del audio.
- Generación de transcripciones con precisión perfecta en la muestra de referencia JFK (11 segundos, inglés) según la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo especializado en voz-a-texto, no un LLM de propósito general.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar audio de hasta 5 minutos por pasada y generar transcripciones en varios idiomas, lo que lo hace adecuado para actas automáticas de reuniones cortas o para segmentar grabaciones largas en fragmentos.
- Subtitulado multilingüe de vídeo: con el modo de traducción integrado, se puede transcribir audio en un idioma y generar subtítulos en otro (por ejemplo, japonés a inglés) sin pipeline separado de traducción.
- Atención al cliente por voz: transcripción de llamadas en inglés, español, alemán o francés para alimentar sistemas de análisis de sentimiento o bases de conocimiento, aprovechando el soporte de diez idiomas principales.
- Archivado y búsqueda de contenido audiovisual: conversión de grabaciones de podcasts o clases a texto indexable, con la ventaja de que el archivo Q4_K de 1,5 GB se ejecuta en CPU con 4 hilos a 0,2x tiempo real.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo casi real en equipos sin GPU dedicada, gracias a las cuantizaciones ligeras y al motor CrispASR.
- Análisis de contenido musical y radiofónico: transcripción de letras cantadas o de locuciones sobre música de fondo, un caso que muchos ASR convencionales no cubren.
- Despliegue en dispositivos con recursos limitados: la versión Q4_K cabe en memoria de sistemas embebidos o portátiles modestos, lo que permite integrar ASR en aplicaciones de escritorio o edge computing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo reporta una prueba cualitativa sobre la muestra de voz JFK (11 segundos, inglés) con el siguiente resultado:

| Metrica | Q4_K |
|---|---|
| Velocidad en CPU (4 hilos) | 0,2x tiempo real |
| Precision de transcripcion (muestra JFK) | Perfecta segun la model card |
| Similitud coseno del codificador vs F16 (min) | 0,9989 |
| Similitud coseno del codificador vs F16 (media) | 0,9998 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,5 GB para Q4_K, 2,5 GB para Q8_0 y 4,7 GB para F16 (la model card indica unos 5 GB de RAM para F16).
- GPU recomendadas: no se especifican modelos concretos; el motor CrispASR está orientado a ejecución en CPU, por lo que no se documenta una GPU mínima. Cualquier GPU con al menos 2-3 GB de memoria libre podría alojar las variantes Q4_K o Q8_0, pero este dato no está confirmado en la información disponible.
- ¿Cabe en GPU de consumo? Sí, las variantes Q4_K y Q8_0 caben holgadamente en cualquier GPU de consumo con 4 GB o más de VRAM, aunque la model card no confirma compatibilidad con backends GPU específicos.
- Opciones de despliegue: CrispASR es el motor documentado (`crispasr -m qwen3-1.7b -f audio.wav`). No se mencionan vLLM, llama.cpp, Ollama ni TGI como compatibles en la información proporcionada.
- Latencia y throughput: 0,2x tiempo real en CPU con 4 hilos para Q4_K, es decir, unos 55 segundos de proceso por cada 11 segundos de audio en esa configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (este, GGUF) | 2,35 mil millones | Hasta 5 minutos | 30 + 22 dialectos chinos | Apache 2.0 | GGUF |
| Whisper large-v3 | No disponible en la informacion | No disponible | No disponible | No disponible | No disponible |
| Alternativas ASR comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de otros modelos ASR en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas como Whisper, Parakeet o Canary. Se recomienda consultar benchmarks públicos de ASR (por ejemplo, en el Open ASR Leaderboard) para una comparación rigurosa.

## Limitaciones y advertencias

- Este repositorio es una conversión de formato, no un modelo nuevo: no aporta mejoras de capacidad sobre el modelo base y no debe citarse como un modelo distinto en trabajos académicos.
- La versión Q4_K anterior a julio de 2026 podía generar transcripciones vacías o frases repetidas en audios largos; es imprescindible usar el archivo re-empaquetado con el codificador en Q8_0.
- El modelo está especializado en ASR: no soporta tool calling, agentes, razonamiento multi-paso ni generación de texto general.
- La model card lista diez idiomas verificados, pero afirma 30 idiomas y 22 dialectos chinos en el modelo base; la cobertura real de los idiomas no listados no está confirmada en este repositorio.
- Riesgo de alucinación inherente a los modelos de voz-a-texto, especialmente con audio ruidoso, acentos no representados en el entrenamiento o música de fondo intensa.
- No se documentan sesgos específicos ni la composición del dataset de entrenamiento; el análisis de sesgos debe remitirse al proveedor original (Qwen).
- Licencia Apache 2.0 permite uso comercial, pero el repositorio no concede derechos adicionales a los de la licencia upstream.
- Bajo la regulación europea de IA (Reglamento UE 2024/1689, artículo 53), el proveedor del modelo sigue siendo Qwen; este repositorio no asume esa condición.
- Solo se documenta compatibilidad con CrispASR; el uso con otros motores GGUF (llama.cpp, Ollama) no está verificado y podría requerir adaptaciones por la arquitectura multimodal de audio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentory/qwen3-asr-1.7b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Variante HF del modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Motor CrispASR: https://github.com/CrispStrobe/CrispASR
- Issue CrispASR #240 (transcripciones vacías/repetidas): https://github.com/CrispStrobe/CrispASR/issues/240
- Issue CrispASR #218 (deriva del codificador por debajo de 8 bits): https://github.com/CrispStrobe/CrispASR/issues/218
