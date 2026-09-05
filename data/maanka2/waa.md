# maanka2/waa

## Resumen

El modelo `maanka2/waa` es una subida en Hugging Face del sistema de síntesis de voz MOSS-TTS-Nano, desarrollado por MOSI.AI y el equipo OpenMOSS. Se trata de un modelo de generación de voz multilingüe de tamaño reducido, con solo 0,1 mil millones de parámetros, diseñado para funcionar en tiempo real incluso sin GPU. Su objetivo principal es ofrecer una alternativa ligera y de baja latencia para aplicaciones de texto a voz (TTS) que necesiten desplegarse en entornos locales, servicios web o productos con recursos limitados.

La arquitectura combina un tokenizador de audio con un modelo de lenguaje autoregresivo, y produce audio nativo a 48 kHz con dos canales. El modelo soporta 20 idiomas y permite la clonación de voz con textos largos mediante troceado automático. Aunque el repositorio en Hugging Face es una copia realizada por el usuario `maanka2`, la información técnica y la documentación corresponden al modelo original MOSS-TTS-Nano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Tokenizer + LLM autoregresivo |
| Parametros totales | 0,1 mil millones (0,1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 20 idiomas: chino, inglés, alemán, español, francés, japonés, italiano, hebreo, húngaro, coreano, ruso, persa, árabe, polaco, portugués, checo, danés, sueco, griego y turco |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio PyTorch, 0,2 GB) |

## Arquitectura y entrenamiento

MOSS-TTS-Nano utiliza una arquitectura puramente autoregresiva compuesta por un tokenizador de audio y un modelo de lenguaje (LLM). El tokenizador de audio convierte las señales de voz en tokens discretos, y el LLM genera secuencias de esos tokens para sintetizar el habla. La salida de audio es nativa a 48 kHz con dos canales, lo que permite obtener una calidad de sonido adecuada para aplicaciones de producto sin necesidad de etapas de postprocesado adicionales.

El modelo está optimizado para inferencia en streaming, con baja latencia y primera respuesta rápida. Puede ejecutarse en una CPU de 4 núcleos sin necesidad de GPU, lo que simplifica enormemente el despliegue en entornos de producción ligeros. En cuanto al entrenamiento, la documentación disponible no incluye detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de voz (text-to-speech) en 20 idiomas, incluyendo chino, inglés, español, francés, alemán, japonés, coreano, ruso, árabe y turco, entre otros.
- Salida de audio nativa a 48 kHz con dos canales.
- Inferencia en streaming con baja latencia y primera respuesta rápida.
- Ejecución en CPU sin GPU, diseñada para funcionar en máquinas con 4 núcleos.
- Clonación de voz con texto largo mediante troceado automático del texto de entrada.
- Integración sencilla mediante scripts Python (`infer.py`, `app.py`) y una interfaz de línea de comandos (`moss-tts-nano generate` y `moss-tts-nano serve`).
- No se documentan capacidades de tool calling, razonamiento multi-paso ni soporte de agentes.

## Casos de uso

- Asistentes de voz en dispositivos sin GPU: gracias a su ejecución en CPU y su baja latencia, el modelo puede integrarse en asistentes locales para interacción en tiempo real, por ejemplo en quioscos o dispositivos embebidos.
- Narración multilingüe de contenido: soporta 20 idiomas, lo que permite generar audiolibros, podcasts o noticias habladas en varios idiomas desde un único modelo.
- Clonación de voz para productos personalizados: el modelo permite clonar voces con textos largos y troceado automático, adecuado para crear voces sintéticas personalizadas en aplicaciones de entretenimiento o accesibilidad.
- Prototipos y demos web: la disponibilidad de `app.py` y de un Space en Hugging Face facilita la creación de demos interactivas sin necesidad de infraestructura compleja.
- Servicios de voz en streaming para aplicaciones de comunicación: la inferencia en streaming y la baja latencia permiten integrar la síntesis de voz en chats de voz, sistemas de respuesta interactiva o aplicaciones de mensajería.
- Accesibilidad y educación: lectura de textos en voz alta en múltiples idiomas, útil para personas con discapacidad visual o para plataformas de aprendizaje de idiomas.
- Automatización de doblaje o subtítulos hablados en producción multimedia: el modelo ligero puede desplegarse en pipelines de generación de contenido para crear pistas de audio en distintos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la inferencia es en tiempo real en una CPU de 4 núcleos y destaca la baja latencia en streaming, pero no se aportan cifras concretas de latencia, throughput ni comparativas con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM para ejecución en CPU. Si se utiliza una GPU para acelerar la inferencia, el requisito de VRAM no está especificado.
- GPU recomendada: ninguna. El modelo está diseñado para funcionar en CPU de 4 núcleos.
- ¿Cabe en consumer GPU? No aplica, ya que puede ejecutarse en CPU. Cualquier GPU con memoria suficiente podría acelerar la inferencia, pero no se especifica.
- Opciones de despliegue: `infer.py`, `app.py`, CLI `moss-tts-nano generate` y `moss-tts-nano serve`, además de Hugging Face Spaces.
- Latencia y throughput: no disponibles. La model card afirma baja latencia y primera audio rápida en streaming, sin datos numéricos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de síntesis de voz de tamaño similar ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio en Hugging Face (`maanka2/waa`) es una subida de terceros con 0 descargas y 0 likes; no está respaldado por el equipo original de MOSS-TTS-Nano y no ha sido verificado de forma independiente.
- No se han publicado benchmarks, por lo que el rendimiento real en producción no está validado.
- La calidad de la síntesis de voz puede variar entre los 20 idiomas; no se proporcionan métricas de calidad por idioma.
- Al ser una copia, es responsabilidad del usuario verificar la integridad de los pesos y la correspondencia con el modelo original.
- La licencia Apache 2.0 permite uso comercial, pero se deben mantener los avisos de licencia y copyright.
- No se documentan sesgos específicos, pero los modelos de TTS pueden reflejar sesgos en los datos de entrenamiento; no hay información al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maanka2/waa
- Modelo original MOSS-TTS-Nano: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano
- Repositorio de GitHub: https://github.com/OpenMOSS/MOSS-TTS-Nano.git
- Demo web: https://openmoss.github.io/MOSS-TTS-Nano-Demo/
- Hugging Face Space: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-TTS-Nano
- Artículo en arXiv: https://arxiv.org/abs/2603.18090
- ModelScope: https://modelscope.cn/models/openmoss/MOSS-TTS-Nano
- Documentación de API: https://studio.mosi.cn/docs/moss-tts-nano
- AIStudio: https://studio.mosi.cn/experiments/moss-tts-nano
- MOSI.AI: https://mosi.cn/#hero
- OpenMOSS: https://www.open-moss.com/
