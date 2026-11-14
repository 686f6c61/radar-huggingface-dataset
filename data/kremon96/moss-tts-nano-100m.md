# Kremon96/MOSS-TTS-Nano-100M

## Resumen

MOSS-TTS-Nano-100M es un modelo de síntesis de voz (text-to-speech) multilingüe de código abierto desarrollado por MOSI.AI y el equipo OpenMOSS. Con aproximadamente 142 millones de parámetros, está diseñado específicamente para generación de voz en tiempo real con un coste computacional mínimo: puede ejecutarse en CPU de cuatro núcleos sin necesidad de GPU, y ofrece salida de audio nativa a 48 kHz y 2 canales. El repositorio evaluado aquí es una conversión al formato MLX realizada por Kremon96 a partir del modelo original `OpenMOSS-Team/MOSS-TTS-Nano-100M`, orientada a su ejecución en hardware Apple Silicon mediante la librería mlx-audio.

El modelo resuelve el problema de desplegar TTS de calidad aceptable en entornos con recursos limitados: demos locales, servicios web ligeros, integración en productos de bajo coste y prototipado rápido. Frente a modelos TTS de mayor tamaño que requieren GPU dedicada, MOSS-TTS-Nano prioriza huella reducida, baja latencia y primer audio rápido mediante inferencia en streaming, manteniendo soporte para clonación de voz y textos largos con troceado automático.

La relevancia actual del modelo reside en su combinación de licencia Apache 2.0, soporte para 20 idiomas (incluido el español) y una arquitectura puramente autorregresiva basada en tokenizador de audio más LLM, que simplifica el stack de despliegue. La conversión a MLX amplía su alcance al ecosistema de Apple, donde la inferencia local de audio resulta especialmente atractiva para aplicaciones de escritorio y móviles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autorregresiva: tokenizador de audio + LLM (MOSS-Audio-Tokenizer-Nano) |
| Parámetros totales | 142.477.056 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (formato MLX; el repo original puede ofrecer otras variantes) |
| Idiomas soportados | zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr (20 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (convertido a MLX) |
| Frecuencia de muestreo de salida | 48 kHz, 2 canales |
| Modelo base | OpenMOSS-Team/MOSS-TTS-Nano-100M |
| Tamaño del repositorio | 28,6 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

MOSS-TTS-Nano emplea una arquitectura puramente autorregresiva compuesta por un tokenizador de audio (MOSS-Audio-Tokenizer-Nano) y un modelo de lenguaje que genera secuencias de tokens de audio a partir del texto de entrada y, opcionalmente, de un audio de referencia para clonación de voz. Esta aproximación, en lugar de los pipelines clásicos de dos etapas (texto a mel-espectrograma y vocoder separado), unifica la generación y facilita la inferencia en streaming con baja latencia y primer audio rápido. La salida nativa es de 48 kHz y 2 canales, lo que evita etapas adicionales de remuestreo o upsampling en producción.

El modelo soporta textos largos mediante troceado automático con clonación de voz, de modo que la identidad de la voz de referencia se mantiene a lo largo de fragmentos sucesivos. Está optimizado para ejecutarse en CPU de cuatro núcleos en modo streaming, lo que sugiere un diseño cuidadoso del bucle de decodificación y del tokenizador. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

La conversión a MLX (versión 0.4.0 de mlx-audio) adapta los pesos originales para su ejecución eficiente en Apple Silicon, manteniendo la lógica de inferencia del modelo base.

## Capacidades

- Síntesis de voz multilingüe en 20 idiomas, incluidos español, inglés, chino, alemán, francés, japonés, italiano, coreano, ruso, árabe, portugués, polaco, turco, entre otros.
- Clonación de voz a partir de un audio de referencia (`--prompt-audio-path` o `--prompt-speech`), que es el flujo de trabajo principal recomendado por el autor.
- Generación de audio en streaming con baja latencia y primer audio rápido, adecuada para aplicaciones interactivas en tiempo real.
- Soporte de textos largos con troceado automático y clonación de voz consistente entre fragmentos.
- Salida de audio nativa a 48 kHz estéreo (2 canales).
- Inferencia en CPU sin GPU (streaming en CPU de 4 núcleos).
- Interfaces de despliegue: script Python (`infer.py`), demo web local con FastAPI (`app.py`) y CLI empaquetada (`moss-tts-nano generate` y `moss-tts-nano serve`).
- Soporte de síntesis desde fichero de texto (`--text-file`) para contenido de formato largo.
- No se documenta soporte de tool calling, agentes, visión ni audio de entrada más allá del audio de referencia para clonación.

## Casos de uso

- Asistentes de voz locales en aplicaciones de escritorio: el modelo puede ejecutarse en CPU de cuatro núcleos y generar audio en streaming, lo que permite integrar respuestas habladas en herramientas de productividad o lectores de pantalla sin depender de servicios en la nube.
- Demos web interactivas: con `app.py` o `moss-tts-nano serve` se levanta un servidor FastAPI local en el puerto 18083 que carga el modelo una vez y sirve peticiones de síntesis, adecuado para prototipos y validación con usuarios.
- Lectura de textos largos (audiolibros, artículos, documentación): el soporte de `--text-file` y el troceado automático con clonación de voz permiten convertir documentos extensos manteniendo una voz consistente entre fragmentos.
- Localización de contenido multilingüe: al cubrir 20 idiomas, el modelo sirve para generar pistas de voz en español, inglés, francés, alemán y otros idiomas a partir de un mismo guion, útil en marketing o e-learning.
- Clonación de voz para prototipos de marca: a partir de una muestra de audio de referencia se puede generar una voz personalizada para demos de producto, siempre que se respeten las consideraciones éticas y legales sobre consentimiento.
- Integración en dispositivos con recursos limitados: al no requerir GPU y mantener un tamaño de 0,1B parámetros, es viable en mini-PC, Raspberry Pi de gama alta o entornos embebidos con CPU suficiente para streaming.
- Accesibilidad: generación de voz para personas con discapacidad visual o del habla, con la ventaja de funcionar de forma local y sin conexión.
- Inferencia en Apple Silicon: la conversión MLX permite ejecutar el modelo de forma eficiente en Macs con chip M-series mediante mlx-audio, útil para aplicaciones de escritorio nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; en GPU, el modelo de 142M parámetros en precisión completa ocuparía aproximadamente 0,6 GB de pesos, aunque no se documentan requisitos oficiales de VRAM.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecutarse en CPU sin GPU.
- ¿Cabe en GPU de consumo? Sí, por tamaño (142M parámetros), cualquier GPU de consumo moderna podría alojarlo, aunque no es el objetivo declarado del modelo.
- CPU: streaming en CPU de 4 núcleos según el autor.
- Opciones de despliegue: `infer.py` (Python), `app.py` (FastAPI local), CLI `moss-tts-nano generate` y `moss-tts-nano serve`, y mlx-audio para Apple Silicon.
- Latencia y throughput: se declara baja latencia en tiempo real y primer audio rápido, pero no se proporcionan cifras concretas de latencia ni de throughput en la información disponible.
- Tamaño del repositorio: 28,6 GB, lo que sugiere que incluye múltiples artefactos (posiblemente pesos en varios formatos o audios de ejemplo); conviene revisar los ficheros antes de descargar.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MOSS-TTS-Nano-100M (este) | 142M | 20 | no disponible | Apache 2.0 | safetensors / MLX | TTS autorregresivo, CPU-friendly, streaming, clonación de voz |
| Piper TTS | no disponible | múltiples | no disponible | MIT (según variantes) | ONNX | TTS ligero para CPU, sin clonación de voz destacada |
| Coqui XTTS v2 | ~467M | 17 | no disponible | CPML (no comercial) | safetensors / PyTorch | Clonación de voz multilingüe, requiere más recursos |
| Kokoro TTS | ~82M | varios | no disponible | Apache 2.0 | safetensors / ONNX | TTS ligero de alta calidad, sin clonación de voz |

La comparativa se basa en características generales conocidas de estos modelos; no se dispone de datos de benchmarks comparativos en la información proporcionada. MOSS-TTS-Nano destaca por combinar clonación de voz, 20 idiomas y licencia Apache 2.0 en un tamaño de 0,1B, mientras que alternativas como XTTS v2 ofrecen clonación pero con licencia restrictiva para uso comercial y mayor coste computacional.

## Limitaciones y advertencias

- No se documentan sesgos específicos del modelo; al ser un TTS, puede heredar sesgos de pronunciación o prosodia de los datos de entrenamiento en determinados idiomas o acentos.
- Riesgo de alucinación en el sentido de prosodia incorrecta, pronunciación errónea de nombres propios o siglas, y posible inestabilidad en textos muy largos o con caracteres especiales.
- La clonación de voz plantea riesgos éticos y legales: es responsabilidad del usuario obtener consentimiento explícito de la persona cuya voz se clona y cumplir la normativa aplicable (por ejemplo, el Reglamento de IA de la UE).
- No se especifica la longitud máxima de contexto ni de texto de entrada; el troceado automático mitiga este punto, pero puede introducir discontinuidades en la prosodia entre fragmentos.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de las dependencias (mlx-audio, WeTextProcessing, pynini) y del tokenizador de audio.
- El repositorio evaluado es una conversión MLX de un tercero (Kremon96), no el modelo oficial; para producción se recomienda partir del modelo base `OpenMOSS-Team/MOSS-TTS-Nano-100M` y verificar la equivalencia de pesos.
- El tamaño del repositorio (28,6 GB) es desproporcionado para 142M parámetros, lo que puede indicar artefactos adicionales o pesos duplicados; verificar antes de descargar en entornos con almacenamiento limitado.
- No se han publicado benchmarks objetivos en la información disponible, por lo que la calidad de síntesis debe evaluarse empíricamente en el caso de uso concreto.
- El pipeline declarado en Hugging Face es "no disponible", lo que puede complicar la integración automática con librerías que esperan un pipeline estándar de text-to-speech.

## Enlaces

- Modelo en Hugging Face (conversión MLX): https://huggingface.co/Kremon96/MOSS-TTS-Nano-100M
- Modelo base original: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M
- Tokenizador de audio: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-TTS-Nano
- Demo online: https://openmoss.github.io/MOSS-TTS-Nano-Demo/
- Space de demostración: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-TTS-Nano
- Web de MOSI.AI: https://mosi.cn/#hero
- Web de OpenMOSS: https://www.open-moss.com/
- Paper de referencia (arXiv:2603.18090): https://arxiv.org/abs/2603.18090
- Paper de referencia (arXiv:2602.10934): https://arxiv.org/abs/2602.10934
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
