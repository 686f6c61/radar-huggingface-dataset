# maanka2/tijaabbo

## Resumen

MOSS-TTS-Nano es un modelo de síntesis de voz (text-to-speech) multilingüe y de código abierto desarrollado por MOSI.AI y el equipo OpenMOSS. Con solo 0,1 mil millones de parámetros, está diseñado para generación de voz en tiempo real, capaz de ejecutarse directamente en CPU sin necesidad de GPU, lo que simplifica el despliegue en entornos locales, servidores web y productos ligeros. El modelo presentado en este repositorio, `maanka2/tijaabbo`, es una copia o variante de MOSS-TTS-Nano alojada por el usuario maanka2, con la misma arquitectura y características.

La arquitectura se basa en un pipeline puramente autoregresivo de Audio Tokenizer + LLM, que produce audio nativo a 48 kHz en dos canales. Soporta 20 idiomas, incluyendo chino, inglés, español, francés, alemán, japonés, coreano, ruso, árabe, entre otros. Su tamaño reducido y su capacidad de inferencia en streaming lo hacen adecuado para aplicaciones de baja latencia y despliegue en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Tokenizer + LLM (autoregresivo) |
| Parametros totales | 0,1 mil millones (0.1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 20: zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 0.5 GB, probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura puramente autoregresiva compuesta por un audio tokenizer y un modelo de lenguaje (LLM). El audio tokenizer convierte la señal de audio en tokens discretos, y el LLM genera secuencias de tokens que luego se decodifican en voz. Esta combinación permite una generación de voz fluida y de baja latencia, con soporte de streaming.

No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO. La información disponible se centra en las capacidades de despliegue y en la arquitectura general, sin profundizar en el proceso de entrenamiento.

## Capacidades

- Generación de voz a partir de texto en 20 idiomas, con salida nativa de 48 kHz y dos canales.
- Clonación de voz: permite replicar una voz de referencia mediante el script `infer.py`, con soporte de clonación automática por fragmentos para textos largos.
- Inferencia en streaming: baja latencia y primer audio rápido, adecuado para aplicaciones en tiempo real.
- Ejecución en CPU: puede funcionar en una CPU de 4 núcleos sin GPU, lo que reduce los requisitos de hardware.
- Despliegue sencillo: incluye scripts de línea de comandos (`moss-tts-nano generate` y `moss-tts-nano serve`), una demo web local (`app.py`) y una interfaz de Hugging Face Space.
- Integración con herramientas de agente: se menciona un enlace a OpenClaw Skills, lo que sugiere compatibilidad con flujos de agente.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: al poder ejecutarse en CPU, es viable para altavoces inteligentes o dispositivos IoT con recursos limitados, generando respuestas de voz en tiempo real.
- Atención al cliente automatizada: integración en sistemas de IVR o chatbots que requieren síntesis de voz multilingüe, con baja latencia para conversaciones fluidas.
- Generación de audiolibros y contenido narrado: su soporte de 20 idiomas y clonación de voz permite producir narraciones personalizadas para plataformas de contenido.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con despliegue local sin dependencia de servicios en la nube.
- Doblaje y localización de vídeo: clonación de voz para doblar contenido en diferentes idiomas manteniendo la identidad vocal, útil para creadores y estudios pequeños.
- Prototipado rápido de productos TTS: gracias a su instalación sencilla y CLI, los desarrolladores pueden integrar síntesis de voz en demos o MVPs sin infraestructura compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como MOS (Mean Opinion Score), RTF (Real-Time Factor) o comparaciones con otros modelos TTS.

## Requisitos de hardware

- Inferencia en CPU: el modelo puede ejecutarse en una CPU de 4 núcleos, sin necesidad de GPU.
- VRAM: no se requiere VRAM si se usa CPU; en caso de usar GPU, el modelo es lo suficientemente pequeño (0.1B) para caber en cualquier GPU moderna, incluso con poca memoria (por ejemplo, 2 GB).
- GPU recomendadas: no se especifican, pero por su tamaño, cualquier GPU con al menos 2 GB de VRAM sería suficiente.
- Opciones de despliegue: scripts Python (`infer.py`, `app.py`), CLI empaquetada (`moss-tts-nano`), Hugging Face Space, y posiblemente servidores web mediante la API de MOSI.AI.
- Latencia y throughput: no se proporcionan cifras concretas, pero se destaca la baja latencia y el streaming para tiempo real.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos TTS en la documentación proporcionada. Se podría comparar con modelos como VITS, Tacotron 2 o Whisper TTS, pero no hay datos objetivos de rendimiento ni de características en la fuente. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo multilingüe entrenado con datos no especificados, podría presentar variaciones de calidad entre idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir pronunciaciones incorrectas o artefactos en textos complejos o poco frecuentes.
- Limitaciones de contexto: aunque soporta textos largos mediante clonación por fragmentos, no se especifica la longitud máxima de entrada.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y redistribución.
- Caveat de producción: al ser un modelo de 0.1B, la calidad de voz puede ser inferior a modelos más grandes; se recomienda evaluar en el caso de uso específico antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maanka2/tijaabbo
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano
- Demo en Hugging Face Space: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-TTS-Nano
- Demo web: https://openmoss.github.io/MOSS-TTS-Nano-Demo/
- Paper arXiv: https://arxiv.org/abs/2603.18090
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-TTS-Nano
- ModelScope: https://modelscope.cn/models/openmoss/MOSS-TTS-Nano
- Blog MOSI: https://mosi.cn/#models
- API Docs: https://studio.mosi.cn/docs/moss-tts-nano
