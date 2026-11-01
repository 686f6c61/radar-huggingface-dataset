# ezequiel-andrade/Qwen3-TTS-12Hz-1.7B-CustomVoice

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen de Alibaba, publicado en HuggingFace bajo el identificador `ezequiel-andrade/Qwen3-TTS-12Hz-1.7B-CustomVoice`. La variante CustomVoice ofrece control de estilo sobre timbres objetivo mediante instrucciones en lenguaje natural y soporta nueve timbres premium que cubren combinaciones de género, edad, idioma y dialecto. El modelo resuelve el problema de la generación de voz expresiva y controlable sin necesidad de clonación de audio, permitiendo ajustar tono, ritmo y emoción a partir de la semántica del texto y de instrucciones explícitas.

La arquitectura se basa en un LM discreto multi-codebook que modela la señal de voz de extremo a extremo, apoyado en el tokenizador propio Qwen3-TTS-Tokenizer-12Hz para la compresión acústica y el modelado semántico de alta dimensionalidad. Con 1.916.676.352 parámetros totales y un repositorio de 4,5 GB en formato safetensors, el modelo emplea una arquitectura híbrida de streaming de doble pista que permite generar tanto en modo streaming como no streaming, con una latencia de extremo a extremo de hasta 97 ms.

Su relevancia actual radica en que combina baja latencia, soporte de diez idiomas principales (incluido el español) y control de voz por instrucciones en un único modelo de 1,7B, lo que lo hace viable para despliegues interactivos en tiempo real. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook con tokenizador Qwen3-TTS-Tokenizer-12Hz; streaming híbrido de doble pista |
| Parametros totales | 1.916.676.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de lenguaje discreto multi-codebook que modela la voz de extremo a extremo, evitando los cuellos de botella de información y los errores en cascada propios de los esquemas tradicionales LM+DiT. Se apoya en el tokenizador Qwen3-TTS-Tokenizer-12Hz, que realiza compresión acústica eficiente y modelado semántico de alta dimensionalidad de la señal de voz, preservando información paralingüística y características del entorno acústico. La reconstrucción de voz se lleva a cabo mediante una arquitectura ligera no-DiT.

La innovación técnica principal es la arquitectura de generación en streaming híbrida de doble pista, que permite a un mismo modelo operar en modo streaming y no streaming. Puede emitir el primer paquete de audio inmediatamente tras la entrada de un solo carácter, con una latencia de síntesis de extremo a extremo de hasta 97 ms. El modelo integra comprensión semántica del texto para ajustar de forma adaptativa el tono, el ritmo y la expresión emocional, y muestra una robustez notablemente mejorada frente a texto de entrada con ruido. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de voz a partir de texto con control de estilo mediante instrucciones en lenguaje natural.
- Control multidimensional de atributos acústicos: timbre, emoción y prosodia.
- Nueve timbres premium que cubren combinaciones de género, edad, idioma y dialecto.
- Generación en streaming y no streaming con el mismo modelo.
- Baja latencia de extremo a extremo (hasta 97 ms) para escenarios interactivos en tiempo real.
- Soporte multilingüe en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Robustez mejorada frente a texto de entrada con ruido.
- Ajuste adaptativo de tono, ritmo y emoción según la semántica del texto.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Asistentes de voz en tiempo real: la latencia de 97 ms y el modo streaming permiten integrar el modelo en agentes conversacionales que requieren respuestas habladas inmediatas, sin esperas perceptibles por parte del usuario.
- Atención al cliente automatizada: el control de timbre y emoción por instrucciones permite adaptar el tono del agente virtual según el contexto de la conversación (por ejemplo, tono empático en reclamaciones) en cualquiera de los diez idiomas soportados.
- Audiolibros y narración dinámica: el modelo ajusta prosodia y ritmo según la semántica del texto, lo que permite generar narraciones expresivas con distintos timbres para personajes diferenciados.
- Locución para vídeo y publicidad: los nueve timbres premium y el control de estilo facilitan la producción de voces en off consistentes sin necesidad de grabar a un locutor humano.
- Sistemas de accesibilidad: conversión de texto a voz de alta fidelidad para lectores de pantalla y aplicaciones de asistencia a personas con discapacidad visual, con selección de timbre adecuado al usuario.
- Doblaje y localización de contenidos: el soporte de diez idiomas y los perfiles dialectales permiten generar pistas de voz localizadas manteniendo el estilo y la emoción del contenido original.
- Interfaces de voz para dispositivos IoT y automoción: el bajo coste computacional de un modelo de 1,7B y la generación en streaming lo hacen apto para entornos con recursos limitados y requisitos de respuesta inmediata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 1,9B parámetros en fp16 requiere aproximadamente 3,8 GB solo para los pesos, más memoria para el tokenizador y el búfer de audio; en cuantizaciones de 8 bits o 4 bits el requisito se reduce aproximadamente a la mitad o a un cuarto, respectivamente.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer con 8 GB o más de VRAM debería poder alojar el modelo en precisión reducida; para fp16 se recomienda al menos 8-12 GB.
- Cabe en GPU consumer: previsiblemente sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: el paquete `qwen-tts` y vLLM permiten la carga automática del modelo; también se documenta la descarga manual mediante `huggingface-cli` o ModelScope.
- Latencia y throughput: latencia de extremo a extremo de hasta 97 ms en modo streaming según el autor; no se dispone de datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Control por instrucciones | Licencia |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice | 1,9B | 10 | Sí | Sí | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1,7B | 10 | Sí | Sí (diseño de voz por descripción) | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-Base | 1,7B | 10 | Sí | No (clonación de voz en 3 s) | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | 0,6B | 10 | Sí | No | Apache 2.0 |

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo; como todo sistema entrenado con datos de voz, puede reproducir sesgos de género, edad o acento presentes en el corpus.
- Riesgo de alucinación no aplica en el sentido textual, pero el modelo puede generar prosodia o entonación inadecuada ante textos ambiguos o fuera de distribución.
- No se ha documentado la longitud máxima de texto de entrada ni el contexto soportado, lo que limita la planificación de producciones de audio largas.
- Aunque el modelo declara soporte de diez idiomas, no se han publicado métricas de calidad por idioma; el rendimiento en español puede diferir del obtenido en chino o inglés.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las normativas locales sobre síntesis de voz y suplantación de identidad.
- El repositorio analizado corresponde a una publicación de terceros (`ezequiel-andrade`) con solo 24 descargas y 0 likes; se recomienda contrastar con el repositorio oficial de Qwen antes de usarlo en producción.
- No se dispone de información sobre cuantizaciones oficiales ni sobre el soporte de herramientas de despliegue distintas de `qwen-tts` y vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ezequiel-andrade/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio oficial de Qwen3-TTS en HuggingFace (referencia): https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Tokenizador Qwen3-TTS-Tokenizer-12Hz: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Paper de referencia (arXiv:2601.15621): https://arxiv.org/abs/2601.15621
- Repositorio en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Imagen de introducción del proyecto: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/qwen3_tts_introduction.png
- Esquema de arquitectura: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/overview.png
