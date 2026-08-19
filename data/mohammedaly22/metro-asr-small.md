# mohammedaly22/Metro-ASR-Small

## Resumen

Metro-ASR Small es un modelo de reconocimiento automático del habla (ASR) no autorregresivo basado en CTC, desarrollado por Mohammed Aly, diseñado específicamente para el árabe egipcio (العامية المصرية) con soporte nativo para alternancia de código (code-switching) árabe-inglés. El modelo separa el conocimiento acústico del lingüístico en dos artefactos independientes: un codificador acústico Conformer de 61,6 millones de parámetros y un modelo de lenguaje n-grama desmontable (KenLM) que se puede reentrenar solo con texto para dominios específicos. Esta separación permite adaptar el sistema a vocabularios especializados sin tocar el modelo acústico.

Su relevancia radica en que aborda un problema poco cubierto: el reconocimiento de voz coloquial egipcia con mezcla frecuente de inglés, algo común en entornos técnicos, educativos y de atención al cliente en Egipto y la región. Al ser no autorregresivo, una sola pasada hacia adelante produce la transcripción completa, logrando una velocidad de 40–55 veces el tiempo real en CPU de portátil, sin necesidad de GPU. El modelo incluye un modelo de lenguaje n-grama generalista (`lm_5gram.bin`) y soporta decodificación por beam search con KenLM para mejorar la precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (12 capas, d_model=384, 6 cabezas, RoPE, SwiGLU, RMSNorm, SE-Conv, stochastic depth) |
| Parametros totales | 61.586.320 (61,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada (RoPE permite longitudes arbitrarias; un token cubre 40 ms de audio) |
| Tipos de cuantizacion | No disponibles |
| Idiomas soportados | Arabe (egipcio) e ingles (code-switching) |
| Licencia | MIT |
| Formato de pesos | No especificado (repositorio de 7,1 GB, probablemente safetensors o binarios PyTorch) |

## Arquitectura y entrenamiento

El modelo emplea un codificador Conformer de 12 bloques idénticos en configuración "Macaron": dos redes feed-forward con peso medio (SwiGLU, expansión 3×) alrededor de un módulo de atención y un módulo convolucional. La atención usa posiciones rotatorias (RoPE) sin sesgo en las proyecciones Q/K, lo que permite manejar secuencias más largas que las vistas en entrenamiento. La convolución es depthwise separable con kernel 31 y compuerta SE (squeeze-excitation), cubriendo un contexto local de aproximadamente 1,24 segundos. La normalización es RMSNorm pre-norm, más económica que LayerNorm. Se aplica stochastic depth con tasa 0,05 y una pérdida auxiliar CTC intermedia en la capa 6 con peso 0,3, descartada en inferencia.

El frontend convierte audio de 16 kHz en 80 bins log-Mel a 100 fps, seguido de un subsampling Conv2D ×4 que reduce la tasa a 25 fps antes del codificador, reduciendo el coste cuadrático de la atención en un factor 16. El tokenizador es BPE (SentencePiece) con vocabulario de 5.000 tokens, entrenado sobre un corpus equilibrado árabe/inglés para que las palabras inglesas sobrevivan como tokens completos. El entrenamiento usó más de 130.000 muestras de audio egipcio con code-switching, procedentes de los datasets listados (TTS egipcios, MGB-3, LibriSpeech para inglés, entre otros). No se menciona el uso de RLHF o DPO; el entrenamiento es puramente supervisado con CTC.

## Capacidades

- Reconocimiento de voz en árabe egipcio coloquial con alta precisión en habla natural y emocional.
- Soporte nativo de code-switching árabe-inglés dentro de una misma frase.
- Decodificación no autorregresiva: una sola pasada genera la transcripción completa, sin bucle de decodificador.
- Decodificación greedy (rápida) o beam search con KenLM para mayor precisión.
- Modelo de lenguaje n-grama desmontable y reentrenable solo con texto para dominios específicos (médico, legal, técnico).
- Inferencia en streaming (etiquetado como tal en los tags).
- Velocidad de 40–55× tiempo real en CPU de portátil, sin GPU.
- Procesamiento de audio de 16 kHz con ventana de contexto de 40 ms por token.

## Casos de uso

- Atención al cliente automatizada: el modelo puede transcribir llamadas de soporte en árabe egipcio con mezcla de términos técnicos en inglés, permitiendo análisis de sentimiento y generación de resúmenes en tiempo real gracias a su velocidad en CPU.
- Subtitulado automático de vídeos: para contenido creado en Egipto o dirigido a la diáspora, donde el code-switching es habitual. La baja latencia permite subtitulado en directo.
- Asistentes de voz en dispositivos móviles: al ser no autorregresivo y caber en CPU, puede ejecutarse en smartphones de gama media sin conexión a la nube.
- Transcripción de reuniones y entrevistas: en entornos empresariales o académicos donde se alterna árabe e inglés, el modelo produce transcripciones con WER del 28,15% en el conjunto de prueba mixto.
- Sistemas de documentación médica: reentrenando el modelo de lenguaje n-grama con texto clínico, se puede adaptar la decodificación a terminología médica sin tocar el modelo acústico.
- Archivado y búsqueda de contenido audiovisual: indexación de archivos de radio, televisión o podcasts egipcios con búsqueda por transcripción, aprovechando la licencia MIT para integración comercial.
- Herramientas educativas: transcripción de clases y material didáctico en árabe egipcio con apoyo de inglés, útil para plataformas de e-learning.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de prueba propio (test set de árabe egipcio + code-switching). No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| WER (All) | 28,15 % |
| CER (All) | 14,88 % |
| WER (Arabe) | 22,67 % |
| CER (Arabe) | 13,98 % |
| WER (Code-switching) | 32,73 % |
| CER (Code-switching) | 18,94 % |

El rendimiento en code-switching es significativamente peor que en árabe puro, lo que indica margen de mejora en la mezcla de idiomas. La velocidad declarada es de 40–55× tiempo real en CPU de portátil con decodificación greedy.

## Requisitos de hardware

- Inferencia en CPU: el modelo corre a 40–55× tiempo real en un portátil sin GPU, según la documentación oficial.
- VRAM: no se especifican requisitos de VRAM en la información disponible. Dado el tamaño de 61,6 M parámetros, es de esperar que quepa en cualquier GPU moderna con al menos 2 GB de VRAM en FP32, aunque no se ha confirmado.
- GPU recomendada: no se indica ninguna GPU específica; el modelo está pensado para CPU.
- Opciones de despliegue: se distribuye vía PyPI como paquete `metro-asr` y tiene una demo en Hugging Face Spaces. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de texto.
- Latencia: una sola pasada hacia adelante sin bucle de decodificador; la latencia exacta depende del hardware, pero la velocidad declarada sugiere decenas de milisegundos por utterance típica.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR para árabe egipcio en la información proporcionada. No se han publicado resultados frente a alternativas como Whisper (openai), Wav2Vec2-XLSR o MMS (Meta) en el mismo conjunto de prueba. La comparativa queda pendiente de futuras publicaciones del autor.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para árabe egipcio coloquial; puede degradarse significativamente con otros dialectos árabes (magrebí, levantino, etc.).
- El rendimiento en code-switching es notablemente inferior al árabe puro (WER 32,73% frente a 22,67%), lo que sugiere errores frecuentes en frases con mezcla de idiomas.
- No se especifican sesgos conocidos, pero al entrenarse con datasets de TTS y ASR mayoritariamente egipcios, puede tener un sesgo hacia hablantes masculinos, registros formales o acentos urbanos de El Cairo.
- Riesgo de alucinación: como todo modelo CTC, puede producir transcripciones fonéticamente plausibles pero incorrectas, especialmente con ruido de fondo o habla solapada.
- El modelo de lenguaje n-grama incluido es generalista; para dominios técnicos o médicos se recomienda reentrenarlo con texto específico.
- No se proporcionan pesos cuantizados ni formatos optimizados (ONNX, TensorRT), lo que puede limitar su despliegue en entornos de producción con restricciones de memoria.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre la precisión en casos de uso críticos.
- El repositorio tiene solo 29 descargas y 0 likes, lo que indica una adopción muy temprana y una comunidad de usuarios aún pequeña.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mohammedaly22/Metro-ASR-Small)
- [Demo interactiva en Hugging Face Spaces](https://huggingface.co/spaces/mohammedaly22/metro-asr)
- [Repositorio GitHub](https://github.com/MohammedAly22/metro-asr)
- [Paquete PyPI](https://pypi.org/project/metro-asr/)
- [Informe de evaluacion interactivo](https://mohammedaly22.github.io/metro-asr/)
