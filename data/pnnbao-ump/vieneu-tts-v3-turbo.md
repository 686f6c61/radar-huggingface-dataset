# pnnbao-ump/VieNeu-TTS-v3-Turbo

## Resumen

VieNeu-TTS v3 Turbo es un modelo de síntesis de voz (text-to-speech) de 48 kHz, bilingüe vietnamita-inglés, desarrollado por Phạm Nguyễn Ngọc Bảo (usuario pnnbao-ump). Se trata de una arquitectura original diseñada y entrenada desde cero sobre aproximadamente 10 000 horas de habla inglés-vietnamita, no un fine-tuning de modelos existentes. El modelo integra un codec neuronal (MOSS-Audio-Tokenizer-Nano) y un fonetizador propio (sea-g2p), y destaca por la clonación instantánea de voz, el cambio de código (code-switching) entre idiomas, el control de emociones experimental y la generación en streaming con baja latencia.

Con 130,9 millones de parámetros, el modelo está disponible bajo licencia Apache-2.0 y su implementación de referencia es el SDK Python `vieneu` (v3.3.0), que permite ejecutar la inferencia en CPU con ONNX Runtime (sin necesidad de PyTorch) o en GPU con PyTorch y batching automático. El repositorio incluye pesos en formato safetensors y ONNX, y el paquete completo ocupa 8,9 GB en disco.

Su relevancia actual radica en ofrecer una alternativa abierta y de alta fidelidad para síntesis de voz en vietnamita, con soporte nativo de acentos regionales (norte, centro y sur), 20 voces predefinidas y capacidades avanzadas como la clonación de voz a partir de clips de 3 a 8 segundos. Esto lo hace útil para aplicaciones de contenido multimedia, atención al cliente bilingüe, asistentes de voz y accesibilidad, tanto en entornos de desarrollo como de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Original del autor, basada en transformer con audio codec neuronal (MOSS-Audio-Tokenizer-Nano) y fonetizador sea-g2p. Se menciona un backbone Qwen3 en la instalación GPU, sin más detalle. |
| Parametros totales | 130 907 520 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (por defecto en CPU), fp32 (opcional), ONNX Runtime |
| Idiomas soportados | Vietnamita (vi), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura de VieNeu-TTS v3 Turbo es un diseño original de Phạm Nguyễn Ngọc Bảo, entrenado desde cero sobre un corpus de aproximadamente 10 000 horas de habla vietnamita e inglesa. No se trata de un fine-tuning ni de una adaptación de modelos TTS existentes. El modelo utiliza el codec neuronal MOSS-Audio-Tokenizer-Nano de OpenMOSS-Team para la representación de audio a 48 kHz, y el fonetizador sea-g2p (también del mismo autor) para la conversión de grafemas a fonemas en vietnamita e inglés.

El entrenamiento incorpora tokens de hablante para las 20 voces predefinidas y soporta marcadores de emoción no verbales (como `[cười]`, `[thở dài]`, `[hắng giọng]`) que permiten modular la expresividad. No se dispone de información sobre el uso de técnicas de alineación como RLHF o DPO. La inferencia puede ejecutarse en CPU mediante ONNX Runtime (sin dependencia de PyTorch) o en GPU con PyTorch, donde se habilita el batching automático para mejorar el rendimiento en textos largos. El modelo también admite streaming frame-by-frame con una latencia inicial de aproximadamente 300 ms y un factor de tiempo real (RTF) inferior a 1 en CPU.

## Capacidades

- Generación de habla de alta fidelidad a 48 kHz en vietnamita e inglés.
- 20 voces predefinidas que cubren las tres regiones dialectales de Vietnam (norte, centro y sur), con ambos géneros y varios perfiles de lectura.
- Clonación instantánea de voz a partir de un clip de referencia de 3 a 8 segundos, con opción de denoising.
- Code-switching bilingüe (vietnamita-inglés) dentro de una misma frase o conversación.
- Control de emociones y marcadores no verbales (experimental): risa, suspiro, aclaración de garganta.
- Streaming en tiempo real: primera muestra de audio en ~300 ms, RTF < 1 en CPU (2-3 veces más rápido que tiempo real en portátiles).
- Generación por lotes en GPU con batching automático para textos largos o múltiples hablantes.
- Soporte de conversaciones multi-hablante (modo "Conversation" en la interfaz web).
- Denoising de audio de referencia para mejorar la calidad de la clonación.

## Casos de uso

- Producción de podcasts y contenido multimedia: el modelo permite generar episodios con múltiples voces, control de emociones y acentos regionales, gracias a la generación por lotes y las 20 voces predefinidas. Es adecuado para creadores que necesitan diversidad de locutores sin contratar actores de voz.
- Atención al cliente bilingüe: la capacidad de code-switching entre vietnamita e inglés, junto con la clonación de voz, permite crear asistentes virtuales que alternan idiomas de forma natural, mejorando la experiencia de usuarios en mercados multilingües.
- Audiolibros y narración: las voces predefinidas con acentos regionales y la alta calidad de 48 kHz hacen posible producir audiolibros en vietnamita con una sonoridad cercana a la humana, manteniendo coherencia en largas sesiones de lectura.
- Doblaje de vídeo: la clonación instantánea de voz permite doblar contenido audiovisual con la voz de un actor o locutor concreto, reduciendo costes y tiempos frente a la grabación en estudio.
- Asistentes de voz en tiempo real: el streaming de baja latencia (~300 ms) habilita aplicaciones de conversación interactiva, como guías turísticos virtuales o sistemas de respuesta por voz en kioscos.
- Generación de contenido para redes sociales: los marcadores de emoción (risa, suspiro) y la variedad de voces permiten crear vídeos virales, memes de audio o anuncios con un tono expresivo y dinámico.
- Herramientas de accesibilidad: síntesis de voz natural para lectores de pantalla en vietnamita e inglés, especialmente útil para personas con discapacidad visual o dificultades de lectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como MOS (Mean Opinion Score), MMLU o similares para comparar con otros modelos TTS.

## Requisitos de hardware

- CPU: funciona con ONNX Runtime, sin necesidad de PyTorch. Por defecto usa cuantización int8, que es ~1,6 veces más rápida y ~4 veces más pequeña que fp32. Se recomienda para texto corto y llamadas interactivas.
- GPU: requiere CUDA ≥ 12.8 y PyTorch. El batching automático hace que la GPU sea rentable para textos largos o alta productividad; para texto corto, la CPU suele ser más rápida.
- VRAM estimada: no disponible oficialmente. Con 130,9 millones de parámetros, el modelo base es ligero, pero el pipeline completo (codec + fonetizador) ocupa 8,9 GB en disco. Es probable que quepa en GPUs de consumo como RTX 3060, RTX 4090, etc., pero no hay datos confirmados.
- Opciones de despliegue: SDK Python `vieneu` (pip install), interfaz web (`uv run vieneu-web`), ONNX Runtime en CPU, PyTorch en GPU, y servicios gestionados de terceros como LA Studio (runtime nativo) o Mixpeek (pipeline gestionado).
- Latencia y throughput: primera audio en ~300 ms en streaming, RTF < 1 en CPU (2-3× tiempo real en portátiles). En GPU, el throughput mejora con batching, pero no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos TTS vietnamitas o bilingües (por ejemplo, Coqui XTTS, VietTTS, VITS). No se han publicado resultados de benchmarks comparativos en la documentación disponible. Se recomienda evaluar el modelo en el caso de uso concreto antes de tomar una decisión.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en vietnamita e inglés; su rendimiento en otros idiomas no está garantizado.
- El control de emociones es experimental y puede producir resultados inestables con temperaturas altas (se recomienda temperatura ~0,8 para mayor estabilidad).
- La clonación de voz requiere clips de referencia de 3 a 8 segundos; clips con ruido o baja calidad pueden degradar el resultado, aunque existe una opción de denoising.
- En CPU, la generación de textos largos puede ser lenta; se recomienda usar GPU con batching para estos casos.
- El repositorio incluye un backbone Qwen3 (mencionado en la instalación GPU) y el codec MOSS-Audio-Tokenizer-Nano, cada uno con su propia licencia. Aunque la licencia general es Apache-2.0, es necesario verificar las licencias de los componentes individuales antes de un uso comercial.
- No se han documentado sesgos específicos, pero como todo modelo de síntesis de voz, puede reflejar sesgos presentes en los datos de entrenamiento.
- El streaming y la clonación de voz en CPU requieren la instalación de dependencias adicionales (kaldi-native-fbank, soxr), que pueden no estar disponibles en todos los entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Repositorio GitHub: https://github.com/pnnbao97/VieNeu-TTS
- Paquete PyPI: https://pypi.org/project/vieneu/
- Comunidad Discord: https://discord.gg/yJt8kzjzWZ
- Codec MOSS-Audio-Tokenizer-Nano: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Fonetizador sea-g2p: https://github.com/pnnbao97/sea-g2p
- Integración en LA Studio: https://www.lastudioai.com/models/pnnbao-ump/vieneu-tts-v3-turbo
- Integración en Mixpeek: https://mixpeek.com/model/pnnbao-ump/VieNeu-TTS-v3-Turbo
