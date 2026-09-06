# maanka2/wwe

## Resumen

MOSS-TTS-Nano es un modelo de síntesis de voz (text-to-speech) multilingüe y de tamaño reducido, desarrollado por MOSI.AI y el equipo OpenMOSS. Está diseñado para ejecutarse en tiempo real incluso en CPU sin GPU, lo que lo hace especialmente adecuado para aplicaciones locales, demos y productos ligeros donde el coste de infraestructura debe ser mínimo.

Con solo 0.100 millones de parámetros (0.1B), el modelo sigue una arquitectura puramente autoregresiva basada en un pipeline de Audio Tokenizer + LLM. Produce audio nativo a 48 kHz y 2 canales, y soporta un total de 20 idiomas, entre ellos español, inglés, chino, alemán, francés y japonés. Su relevancia actual radica en la combinación de un footprint muy pequeño con capacidades de clonación de voz y streaming, lo que facilita el despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Tokenizer + LLM autoregresivo |
| Parametros totales | 0.1B (100 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificado (soporta texto largo con troceado automático) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 20 idiomas: zh, en, de, es, fr, ja, it, hu, ko, ru, fa, ar, pl, pt, cs, da, sv, el, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (pesos en PyTorch según tags) |

## Arquitectura y entrenamiento

MOSS-TTS-Nano utiliza un pipeline autoregresivo compuesto por un tokenizador de audio (MOSS-Audio-Tokenizer-Nano) y un modelo de lenguaje ligero. El tokenizador convierte la señal de audio en tokens discretos, y el LLM genera secuencialmente esos tokens para producir la voz. Esta arquitectura permite una inferencia en streaming con baja latencia y un primer audio rápido.

No se han proporcionado datos sobre el proceso de entrenamiento, como el número de tokens, la composición del dataset o si se aplicaron técnicas de alineación tipo RLHF o DPO. La información disponible menciona que el modelo soporta entrada larga mediante clonación de voz automática por trozos, lo que sugiere una capacidad de manejo de textos extensos sin perder coherencia. Los artículos arXiv 2603.18090 y 2602.10934 aparecen en los tags del repositorio, pero no se detalla su contenido en la model card.

## Capacidades

- Generación de voz (text-to-speech) en 20 idiomas, incluidos español, inglés, chino, alemán, francés, japonés, coreano, ruso y árabe.
- Clonación de voz mediante el script `infer.py`, que permite replicar una voz a partir de muestras de audio.
- Inferencia en streaming con baja latencia y primer audio rápido, adecuada para aplicaciones en tiempo real.
- Ejecución en CPU sin necesidad de GPU, con soporte para procesadores de 4 núcleos.
- Salida de audio nativa a 48 kHz y 2 canales.
- Soporte de texto largo con troceado automático y clonación de voz por fragmentos.
- Despliegue flexible: script de línea de comandos `moss-tts-nano generate`, servidor `moss-tts-nano serve`, demo web con `app.py` y demo en HuggingFace Space.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo genera voz con streaming y baja latencia, por lo que puede integrarse en asistentes conversacionales para responder al instante. Su tamaño de 0.1B permite ejecutarlo en CPU, reduciendo costes de infraestructura.
- Clonación de voz para audiolibros: gracias a la clonación de voz y al soporte de texto largo con troceado automático, puede narrar libros completos manteniendo la voz de un locutor concreto sin necesidad de grabar todas las sesiones.
- Localización de contenido audiovisual: soporta 20 idiomas, lo que permite generar pistas de voz para vídeos o documentales en múltiples lenguas sin contratar actores de doblaje.
- Accesibilidad y lectura de pantalla: convierte texto a voz en tiempo real en aplicaciones para personas con discapacidad visual, con salida de audio de alta calidad a 48 kHz.
- Servicios web de síntesis de voz: el CLI `moss-tts-nano serve` y `app.py` permiten desplegar un endpoint de TTS en entornos de producción, con una pila sencilla y sin dependencias de GPU.
- Educación y aprendizaje de idiomas: genera pronunciaciones correctas en 20 idiomas, útil para aplicaciones de aprendizaje de vocabulario o práctica de conversación.
- Sistemas de respuesta de voz interactiva (IVR): para centralitas telefónicas, genera mensajes de voz dinámicos y personalizados en tiempo real, con un footprint mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere VRAM si se ejecuta en CPU; no se especifica un valor para GPU.
- GPU recomendadas: ninguna; el modelo puede ejecutarse en una CPU de 4 núcleos. Si se desea acelerar, no se indica una GPU concreta.
- Compatibilidad con GPU de consumo: no disponible (el tamaño de 0.1B sugiere que podría caber, pero no hay dato oficial).
- Opciones de despliegue: `python infer.py` para clonación de voz, `python app.py` para demo web, CLI `moss-tts-nano generate` y `moss-tts-nano serve`. También se puede probar en HuggingFace Space.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Al ser un modelo tiny (0.1B), la calidad de voz puede ser inferior a la de modelos TTS más grandes, especialmente en idiomas poco representados.
- No se han publicado benchmarks ni datos de entrenamiento, por lo que el rendimiento real no está documentado de forma verificable.
- La clonación de voz requiere muestras de audio de calidad; el procedimiento detallado no se describe en la model card.
- El modelo depende de MOSS-Audio-Tokenizer-Nano y de la infraestructura de OpenMOSS, lo que puede generar dependencias adicionales en el despliegue.
- La licencia Apache-2.0 permite uso comercial, pero es necesario revisar los términos completos de la licencia y las condiciones de los componentes asociados.
- No se documentan sesgos específicos ni limitaciones idiomáticas concretas; se recomienda probar el modelo en cada idioma antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maanka2/wwe
- Modelo original MOSS-TTS-Nano: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano
- ModelScope: https://modelscope.cn/models/openmoss/MOSS-TTS-Nano
- Blog de MOSI: https://mosi.cn/#models
- Paper arXiv 2603.18090: https://arxiv.org/abs/2603.18090
- Paper arXiv 2602.10934: https://arxiv.org/abs/2602.10934
- Demo online: https://openmoss.github.io/MOSS-TTS-Nano-Demo/
- HuggingFace Space: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-TTS-Nano
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-TTS-Nano.git
- Documentación de API: https://studio.mosi.cn/docs/moss-tts-nano
- AI Studio: https://studio.mosi.cn/experiments/moss-tts-nano
