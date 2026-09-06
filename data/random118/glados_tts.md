# Random118/GLaDOS_TTS

## Resumen

GLaDOS TTS es un conjunto de modelos de síntesis de voz (text-to-speech) que replican la voz y el estilo de habla de GLaDOS, la inteligencia artificial del videojuego Portal. Publicado en HuggingFace por Random118, el modelo se compone de dos implementaciones: una basada en Style-Bert_VITS2, que reproduce la entonación emocional del personaje en inglés, y otra basada en GPT-SoVITS, que amplía la capacidad a japonés, inglés y chino mediante ajuste fino de la técnica zero-shot TTS. Además, el repositorio incluye un paquete de doblaje ruso generado con CosyVoice 3, con 20 clips de audio y perfiles de prosodia.

El modelo resuelve la necesidad de generar contenido de voz con la personalidad característica de GLaDOS, tanto para proyectos de fans como para aplicaciones creativas que requieran un tono sarcástico o asistente. Su relevancia actual radica en que combina dos arquitecturas TTS de código abierto y ofrece soporte multilingüe, lo que permite integrar la voz en distintos idiomas sin necesidad de entrenar desde cero. El tamaño del repositorio es de 0.4 GB, lo que indica que los pesos son relativamente ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Style-Bert_VITS2 y GPT-SoVITS (dos modelos separados) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS; no se especifica ventana de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés, chino, inglés, ruso (según metadata; el modelo Style-Bert_VITS2 solo inglés) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

GLaDOS TTS no es un modelo único, sino un conjunto de dos modelos distintos. El primero utiliza Style-Bert_VITS2, un sistema de TTS basado en VITS que incorpora un codificador BERT para modular el estilo emocional de la voz. Este modelo está entrenado para replicar la voz inglesa de GLaDOS y ofrece dos estilos: NeutralStyle, fiel al personaje original, y DeepStyle, con un tono más amable y asistente. El segundo modelo se basa en GPT-SoVITS, una arquitectura que combina un modelo GPT para la generación de contexto con un sistema SoVITS para la síntesis vocal. Según la model card, este modelo se ajusta con pocos minutos de datos de entrenamiento y mejora la similitud y el realismo de la voz en tareas de zero-shot TTS. No se proporciona información detallada sobre el dataset de entrenamiento, el número de tokens ni la composición de los datos. El paquete de ruso se generó con CosyVoice 3 mediante conversión de voz (voice conversion), utilizando un clip en inglés de GLaDOS como voz objetivo y alineación de duración y F0.

## Capacidades

- Generación de voz con la entonación y personalidad de GLaDOS, incluyendo matices sarcásticos y amenazantes.
- Dos estilos de habla en inglés: NeutralStyle (fiel al original) y DeepStyle (amable y asistente).
- Soporte multilingüe mediante el modelo GPT-SoVITS, con capacidad para generar voz en japonés, inglés y chino en una misma conversación.
- Paquete de doblaje ruso con 20 muestras de audio, manifiesto bilingüe, perfiles de prosodia por clip y scripts reproducibles.
- No soporta tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo puro de síntesis de voz.
- Sin capacidades de visión ni de procesamiento de audio más allá de la generación de voz.

## Casos de uso

- Creación de contenido para fans de Portal: el modelo permite generar líneas de voz de GLaDOS para vídeos, parodias o animaciones, aportando una personalidad reconocible que aumenta el atractivo del contenido.
- Doblaje de mods y juegos no oficiales: los desarrolladores pueden integrar la voz de GLaDOS en mods de Portal 2 o en juegos independientes, utilizando el estilo NeutralStyle para mantener la coherencia con el personaje original.
- Asistentes virtuales con personalidad: gracias al estilo DeepStyle, el modelo puede usarse en asistentes de voz o chatbots con salida de audio, ofreciendo un tono sarcástico pero funcional para interacciones de entretenimiento o soporte.
- Narración de tutoriales o guías técnicas: la voz de GLaDOS puede emplearse para narrar procesos paso a paso en vídeos educativos o demostraciones de software, añadiendo un elemento lúdico que mantiene la atención del espectador.
- Contenido educativo gamificado: el modelo puede generar instrucciones y avisos en un entorno de aprendizaje interactivo, donde la personalidad de GLaDOS actúa como "directora de pruebas" para motivar a los estudiantes.
- Doblaje multilingüe de contenido audiovisual: gracias al modelo GPT-SoVITS, es posible generar líneas de voz en japonés, inglés y chino para proyectos de animación, vídeos promocionales o podcasts temáticos que requieran una voz consistente en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de métricas objetivas de calidad de voz (como MOS o WER) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.4 GB, lo que sugiere que los pesos son ligeros, pero no se dispone de cifras oficiales de consumo de memoria.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es probable que pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero no hay confirmación oficial.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el tamaño reducido de los pesos, aunque no se ha verificado.
- Opciones de despliegue: no disponible. El modelo puede ejecutarse mediante los repositorios de Style-Bert_VITS2 y GPT-SoVITS, aunque no se especifican herramientas como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados que repliquen la voz de GLaDOS. Sin embargo, el modelo puede compararse con sus arquitecturas base:

| Modelo | Tipo | Idiomas | Notas |
|---|---|---|---|
| GLaDOS TTS (Style-Bert_VITS2) | Fine-tune de TTS emocional | Inglés | Replica la voz de GLaDOS con dos estilos |
| GLaDOS TTS (GPT-SoVITS) | Fine-tune de TTS zero-shot | Japonés, inglés, chino | Mayor similitud y realismo en voces |
| Style-Bert_VITS2 (base) | TTS emocional | Variable según entrenamiento | Modelo base sin la voz de GLaDOS |
| GPT-SoVITS (base) | TTS zero-shot | Variable según entrenamiento | Modelo base sin la voz de GLaDOS |

## Limitaciones y advertencias

- La voz de GLaDOS es un personaje con derechos de autor de Valve Corporation; el uso comercial de este modelo puede requerir licencia y podría infringir derechos de propiedad intelectual.
- El modelo Style-Bert_VITS2 está limitado al inglés; no genera voz en otros idiomas.
- El paquete de ruso no es un modelo completo, sino un conjunto de 20 clips de audio doblados, por lo que no permite generar nuevas frases en ruso de forma libre.
- La calidad de pronunciación puede variar en nombres propios, términos técnicos o palabras fuera del vocabulario de entrenamiento, lo que puede producir errores de articulación.
- La licencia CreativeML Open RAIL-M incluye cláusulas de uso responsable; es necesario revisar las condiciones antes de desplegar el modelo en producción o en aplicaciones comerciales.

## Enlaces

- HuggingFace: https://huggingface.co/Random118/GLaDOS_TTS
- Repositorio original en HuggingFace: https://huggingface.co/WarriorMama777/GLaDOS_TTS
- Repositorio de entrenamiento TTS_GLaDOS en GitHub: https://github.com/ianrose42/TTS_GLaDOS
