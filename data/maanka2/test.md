# maanka2/test

## Resumen

MOSS-TTS-Nano es un modelo de síntesis de voz (text-to-speech) multilingüe y de tamaño reducido desarrollado por MOSI.AI y el equipo OpenMOSS. Con solo 45,1 millones de parámetros, está diseñado para generar audio en tiempo real directamente en CPU, sin necesidad de GPU, lo que lo convierte en una opción práctica para demos locales, servicios web y productos ligeros. Su arquitectura combina un tokenizador de audio (MOSS-Audio-Tokenizer-Nano) con un modelo de lenguaje autorregresivo, lo que permite inferencia en streaming con baja latencia y salida de audio nativa a 48 kHz y 2 canales. El modelo soporta 20 idiomas y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en aplicaciones comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio Tokenizer + LLM autorregresivo |
| Parámetros totales | 45.137.408 (45,1 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 20 idiomas: zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MOSS-TTS-Nano utiliza un pipeline puramente autorregresivo compuesto por un tokenizador de audio (MOSS-Audio-Tokenizer-Nano) y un modelo de lenguaje (LLM) que genera los tokens de audio de forma secuencial. El tokenizador convierte la señal de audio en una secuencia discreta de tokens, y el LLM aprende a predecir el siguiente token de audio a partir del texto de entrada y del contexto acústico. Esta arquitectura permite la generación de voz en streaming, es decir, el audio comienza a reproducirse antes de que se complete toda la secuencia.

No se han proporcionado detalles sobre los datos de entrenamiento, el número de tokens ni el proceso de alineación (RLHF, DPO, etc.). La información disponible indica que el modelo está pensado para ejecutarse en CPU de 4 núcleos y que admite textos largos mediante clonación de voz por trozos (chunked voice cloning). El modelo se publicó el 10 de abril de 2026 según la model card, junto con un informe técnico (arxiv:2603.18090) y un trabajo sobre el tokenizador de audio (arxiv:2602.10934).

## Capacidades

- Generación de voz (text-to-speech) en 20 idiomas, incluyendo español, inglés, chino, alemán, francés, japonés, coreano, ruso, árabe, etc.
- Clonación de voz: permite replicar una voz a partir de una muestra de audio, con soporte para textos largos mediante segmentación automática.
- Inferencia en streaming: genera audio en tiempo real con baja latencia y primera respuesta rápida.
- Salida de audio nativa a 48 kHz y 2 canales (estéreo).
- Ejecución en CPU: puede generar voz en un procesador de 4 núcleos sin GPU.
- No soporta tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo de síntesis de voz y no de un modelo de lenguaje general.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede integrarse en aplicaciones de asistente por voz para responder con audio generado al instante, gracias a su inferencia en streaming y su baja latencia.
- Narración de audiolibros y contenido largo: su capacidad de procesar textos largos con clonación de voz por trozos permite generar narraciones extensas manteniendo una voz consistente.
- Doblaje y localización de vídeo: al soportar 20 idiomas y clonación de voz, puede utilizarse para generar pistas de audio dobladas en diferentes lenguas a partir de una voz de referencia.
- Servicios web de TTS: el CLI `moss-tts-nano serve` permite desplegar un servicio de síntesis de voz para aplicaciones web o APIs internas.
- Demos locales y prototipos: con `python infer.py` o `python app.py`, los desarrolladores pueden probar el modelo en un entorno local sin infraestructura de GPU.
- Accesibilidad: puede integrarse en lectores de pantalla o herramientas de apoyo para personas con discapacidad visual, ofreciendo una voz natural en múltiples idiomas.
- Productos embebidos o edge: al ser un modelo de 45 millones de parámetros y poder ejecutarse en CPU, es adecuado para dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; puede ejecutarse en CPU de 4 núcleos. En caso de usar GPU, la VRAM necesaria es inferior a 1 GB, dado que los pesos en FP32 ocupan aproximadamente 180 MB (45,1 M × 4 bytes). El repositorio ocupa 0,2 GB.
- GPU recomendadas: no se especifican. No es necesario usar GPU; según la documentación funciona en CPU de 4 núcleos.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo, incluso en GPUs antiguas de 2 GB de VRAM, aunque no es necesaria.
- Opciones de despliegue: documentadas: `python infer.py`, `python app.py`, CLI `moss-tts-nano generate` y `moss-tts-nano serve`, Hugging Face Spaces. No se documenta integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se proporcionan cifras concretas; la model card indica "baja latencia en tiempo real" y "primera respuesta rápida".

## Comparativa con modelos similares

No se han identificado modelos comparables con datos suficientes en la información disponible. La model card no incluye comparativas con otros sistemas TTS.

## Limitaciones y advertencias

- El repositorio en Hugging Face con ID `maanka2/test` es una copia de usuario, no el repositorio oficial. El modelo original está publicado por `OpenMOSS-Team/MOSS-TTS-Nano`. Es recomendable verificar la procedencia antes de usar en producción.
- El tag `custom_code` de Hugging Face indica que se requiere código personalizado para cargar los pesos, lo que implica confiar en el código del autor.
- No se dispone de información sobre sesgos, riesgos de alucinación o comportamientos no deseados, al no estar documentados en la model card.
- La calidad de voz puede ser inferior a la de modelos TTS de mayor tamaño, ya que el modelo es intencionadamente pequeño (0,1 B) y prioriza la eficiencia.
- El soporte de idiomas puede variar en calidad; la model card no detalla el rendimiento por idioma.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse los términos de la licencia y las atribuciones correspondientes.

## Enlaces

- Hugging Face (repositorio analizado): https://huggingface.co/maanka2/test
- Modelo original en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano
- Hugging Face Space (demo): https://huggingface.co/spaces/OpenMOSS-Team/MOSS-TTS-Nano
- ModelScope: https://modelscope.cn/models/openmoss/MOSS-TTS-Nano
- Informe técnico MOSS-TTS: https://arxiv.org/abs/2603.18090
- Paper MOSS-Audio-Tokenizer: https://arxiv.org/abs/2602.10934
- GitHub: https://github.com/OpenMOSS/MOSS-TTS-Nano
- Demo online: https://openmoss.github.io/MOSS-TTS-Nano-Demo/
- Blog de MOSI.AI: https://mosi.cn/#models
- Documentación de API: https://studio.mosi.cn/docs/moss-tts-nano
- AIStudio de prueba: https://studio.mosi.cn/experiments/moss-tts-nano
