# duhow/veucat-ct2

## Resumen

veucat-ct2 es la conversión a CTranslate2 del modelo de reconocimiento automático del habla duhow/veucat, publicada por el mismo autor (duhow) en Hugging Face. El modelo original es un fine-tuning de Whisper orientado a catalán y castellano, y esta versión está empaquetada específicamente para su uso con Faster Whisper, una implementación de inferencia basada en CTranslate2 que reduce el consumo de memoria y mejora la velocidad respecto a la implementación de referencia de OpenAI.

La relevancia de esta ficha es práctica: el repositorio no aporta un modelo nuevo, sino un artefacto de despliegue. Su valor está en que permite ejecutar un sistema ASR bilingüe catalán-castellano con requisitos de hardware modestos (el repositorio completo ocupa aproximadamente 0,1 GB) y con una latencia inferior a la de un Whisper estándar en las mismas condiciones. Está pensado para desarrolladores que necesitan transcripción en producción y no quieren depender de la pila de PyTorch completa.

La información pública disponible es escasa: la model card se limita a indicar la licencia, los idiomas y que se trata de una conversión a CTranslate2. No se detallan parámetros, contexto de audio, datos de entrenamiento ni resultados de benchmarks, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, convertido a CTranslate2); variante concreta no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper trabaja con ventanas de audio de 30 s; el tamaño del modelo base no se especifica) |
| Tipos de cuantización | no disponible (CTranslate2 admite int8, int8_float16, float16 y float32, pero el autor no indica qué variante se ha publicado) |
| Idiomas soportados | catalán (ca) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (modelo binario optimizado para Faster Whisper); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente, duhow/veucat, es un fine-tuning de Whisper sobre el que no se publican detalles en esta ficha: no se especifica si parte de Whisper tiny, base, small, medium o large, ni el número de horas de audio utilizadas, la composición del corpus ni si hubo etapas de aumento de datos o corrección de transcripciones. La única información fiable es que el ajuste está orientado a los idiomas catalán y español, lo que sugiere un corpus bilingüe, probablemente con predominio de catalán dado el nombre del modelo.

La contribución de veucat-ct2 es exclusivamente de ingeniería de despliegue: la conversión a CTranslate2 reescribe los pesos y operaciones del transformer para aprovechar kernels optimizados de CPU y GPU, con soporte de cuantización a int8 y float16. Esto habilita el uso con Faster Whisper, que implementa decodificación por lotes, caché de atención y un pipeline de VAD opcional para segmentar audio largo. No hay innovaciones de arquitectura propias ni datos de entrenamiento adicionales en esta versión.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en catalán y español.
- Detección automática del idioma entre los dos idiomas soportados, heredada del comportamiento multilingüe de Whisper.
- Transcripción con marcas de tiempo a nivel de segmento, útil para subtitulado.
- Integración con Faster Whisper para procesamiento por lotes y streaming de audio.
- Segmentación mediante VAD (voice activity detection) cuando se usa a través de Faster Whisper, lo que permite transcribir audios de duración arbitraria.
- No se documentan capacidades de traducción entre idiomas, diarización de hablantes, tool calling ni razonamiento multi-paso; no son funciones de un modelo ASR.

## Casos de uso

- Subtitulado automático de vídeo en catalán y español: el modelo puede transcribir pistas de audio y generar subtítulos con marcas de tiempo, integrándose en pipelines de postproducción mediante Faster Whisper.
- Transcripción de reuniones y actas: con segmentación VAD y procesamiento por lotes, permite convertir grabaciones de varios participantes en texto revisable, con la ventaja de que el repositorio ocupa poco espacio y puede desplegarse en servidores modestos.
- Atención al cliente y análisis de llamadas: transcripción de grabaciones telefónicas para extraer motivos de consulta, métricas de calidad o búsqueda de texto completo sobre el archivo histórico.
- Accesibilidad: generación de subtítulos en directo o diferidos para contenidos audiovisuales dirigidos a hablantes de catalán y castellano, con despliegue en CPU si no hay GPU disponible.
- Investigación en lingüística de corpus: transcripción masiva de entrevistas o grabaciones de campo en catalán, aprovechando la licencia Apache 2.0 para uso académico y comercial sin restricciones de atribución adicionales.
- Integración en aplicaciones de notas de voz: un servicio backend puede recibir audio desde una app móvil, transcribirlo con Faster Whisper y devolver texto, con un coste de infraestructura bajo gracias a la conversión a CTranslate2.
- Moderación y búsqueda de contenido en plataformas: indexación de audio subido por usuarios para detectar contenido sensible mediante transcripción previa y búsqueda por palabras clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER (word error rate), comparativas con Whisper original ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión porque se desconoce el tamaño del modelo base. Como referencia, un Whisper small en CTranslate2 int8 ocupa del orden de 0,5 GB y un large-v3 en float16 alrededor de 3 GB; el repositorio de 0,1 GB sugiere un modelo pequeño, pero no se confirma.
- GPU recomendadas: no disponibles. Cualquier GPU con soporte CUDA puede ejecutar CTranslate2; para modelos pequeños basta una GTX 1650 o superior.
- GPU de consumo: probablemente sí, dado el tamaño reducido del repositorio, pero el dato no está confirmado por el autor.
- Despliegue: Faster Whisper (recomendado, es el objetivo de la conversión), CTranslate2 directamente, o servidores compatibles con la API de OpenAI indicados en los tags del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| duhow/veucat-ct2 | no disponible | ca, es | CTranslate2 | Apache 2.0 | ventanas de 30 s (Whisper) |
| openai/whisper-small | 244 M | multilingüe (99 idiomas) | PyTorch / safetensors | MIT | ventanas de 30 s |
| openai/whisper-large-v3 | 1550 M | multilingüe (99 idiomas) | PyTorch / safetensors | MIT | ventanas de 30 s |
| duhow/veucat | no disponible | ca, es | PyTorch / safetensors | Apache 2.0 | ventanas de 30 s |

La comparativa es limitada porque no se conocen el tamaño ni el rendimiento del modelo base. Frente a Whisper estándar, la ventaja de veucat-ct2 es el formato CTranslate2, que reduce memoria y latencia; frente a whisper-small o large-v3, la ventaja es la especialización en catalán y español, a costa de perder cobertura multilingüe.

## Limitaciones y advertencias

- La información pública es mínima: no se documentan el tamaño del modelo, los datos de entrenamiento ni el rendimiento, lo que dificulta evaluar su calidad antes de desplegarlo.
- Al ser un fine-tuning sobre Whisper, hereda sus sesgos y sus fallos típicos: alucinaciones en pasajes de silencio o ruido, repeticiones y errores en nombres propios y términos técnicos.
- Cobertura lingüística restringida a catalán y español; no debe usarse para otros idiomas sin verificar el comportamiento.
- El formato CTranslate2 no es directamente cargable con la librería transformers estándar pese a la etiqueta library_name; requiere Faster Whisper o CTranslate2.
- No se especifica qué cuantización se ha publicado, lo que impide estimar con precisión la pérdida de precisión respecto al modelo original.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar el aviso de licencia y verificar las obligaciones heredadas del modelo base duhow/veucat.
- No hay garantías de mantenimiento: el repositorio tiene pocas descargas y ninguna interacción, por lo que la comunidad de soporte es prácticamente inexistente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/duhow/veucat-ct2
- Modelo base: https://huggingface.co/duhow/veucat
- Faster Whisper (implementación de referencia): https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Whisper (modelo original de OpenAI): https://github.com/openai/whisper
