# Allinsama/OpenMOSS-Team__MOSS-TTS-Nano-100M

## Resumen

MOSS-TTS-Nano es un modelo de síntesis de voz (text-to-speech) multilingüe de código abierto desarrollado por MOSI.AI y el equipo OpenMOSS. Con solo 0,1 B de parámetros (100 M), está diseñado explícitamente para generación de voz en tiempo real y para ejecutarse en CPU sin GPU, manteniendo un stack de despliegue simple orientado a demos locales, servido web e integración ligera en producto.

La ficha que nos ocupa, `Allinsama/OpenMOSS-Team__MOSS-TTS-Nano-100M`, es una reproducción del repositorio oficial `OpenMOSS-Team/MOSS-TTS-Nano` publicada por un tercero, con 0 descargas y 0 likes en el momento de la consulta; conviene usar el repositorio original como referencia. El modelo se distribuye bajo licencia Apache-2.0 y tiene un tamaño de repositorio de 0,2 GB.

Su relevancia práctica está en el nicho de TTS de huella mínima: arquitectura autoregresiva pura (tokenizador de audio + LLM), salida nativa a 48 kHz en 2 canales, inferencia en streaming con primer audio rápido y capacidad de clonación de voz con troceado automático para textos largos. Cubre 20 idiomas según la model card, incluidos chino, inglés, español, francés, alemán, japonés, coreano, árabe y portugués.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS autoregresiva pura: tokenizador de audio + LLM (decoder) |
| Parámetros totales | 0,1 B (100 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; soporta texto largo mediante troceado automático (*chunked voice cloning*) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 20 según la model card: zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch con `custom_code`; no se especifica safetensors ni GGUF |
| Pipeline | text-to-speech |
| Frecuencia de muestreo de salida | 48 kHz, 2 canales |
| Modelo acompañante | MOSS-Audio-Tokenizer-Nano (tokenizador de audio, repo separado) |
| Tamaño del repositorio | 0,2 GB |
| Referencias | arXiv:2603.18090 y arXiv:2602.10934 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura autoregresiva pura construida sobre dos piezas: un tokenizador de audio (MOSS-Audio-Tokenizer-Nano, publicado como modelo independiente) que convierte la onda de audio en tokens discretos, y un LLM pequeño que modela la secuencia de tokens de audio condicionada por el texto y, cuando aplica, por el audio de referencia para la clonación de voz. La decodificación es en streaming, lo que permite emitir audio antes de haber generado la secuencia completa y reducir la latencia hasta el primer fragmento audible.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO; tampoco describe innovaciones de atención o decodificación especulativa más allá del esquema tokenizador + LLM. La información pública disponible se limita a las características de despliegue (huella pequeña, latencia baja, salida a 48 kHz estéreo, funcionamiento en CPU de 4 núcleos en modo streaming) y a la lista de 20 idiomas soportados.

## Capacidades

- Síntesis de voz multilingüe a partir de texto en 20 idiomas, con salida nativa a 48 kHz y 2 canales.
- Clonación de voz (*voice clone*) mediante audio de referencia, invocable desde `infer.py` y desde la CLI.
- Generación en streaming con baja latencia y primer audio rápido, adecuada para productos en tiempo real.
- Manejo de textos largos con troceado automático y clonación de voz consistente entre fragmentos.
- Ejecución en CPU: el modo streaming funciona en un CPU de 4 núcleos según el autor, sin GPU.
- Empaquetado de despliegue: script de inferencia (`infer.py`), demo web local (`app.py`), CLI (`moss-tts-nano generate` y `moss-tts-nano serve`) y Space de Hugging Face.
- No es un modelo de propósito general: no se documentan capacidades de razonamiento, generación de código, matemáticas, visión, tool calling ni agentes; el componente LLM está especializado en tokens de audio.

## Casos de uso

- Lectura de artículos y audiolibros: el troceado automático de textos largos permite procesar capítulos completos manteniendo la misma voz clonada entre fragmentos, sin cortar la prosodia de forma brusca.
- Localización de contenido audiovisual: con 20 idiomas y clonación de voz se puede generar una pista de doblaje en otro idioma partiendo de una muestra del hablante original, útil en e-learning y formación corporativa.
- Asistentes de voz en local y en el borde: al correr en CPU de 4 núcleos, encaja en cajas set-top, Raspberry Pi o portátiles sin GPU para lectura de notificaciones y respuestas habladas de un asistente doméstico.
- Accesibilidad y lectores de pantalla: síntesis a 48 kHz estéreo con latencia baja para leer contenido web o interfaces de escritorio en tiempo real, sin depender de servicios en la nube.
- Atención al cliente e IVR: generación dinámica de locuciones y respuestas pregrabadas en varios idiomas con `moss-tts-nano serve` como servicio HTTP, reduciendo el coste frente a TTS propietario por carácter.
- Prototipado rápido y demos web: `python app.py` levanta una demo local y el Space oficial permite probar la síntesis sin infraestructura, lo que acelera la validación de producto antes de invertir en un TTS mayor.
- Integración en pipelines de contenido: la CLI `moss-tts-nano generate` se puede encadenar en scripts de CI/CD o trabajos batch para generar versiones en audio de documentación técnica y posts de blog.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los resultados de búsqueda no incluyen métricas objetivas (MOS, WER, SIM de similitud de hablante, RTF) ni comparaciones numéricas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp16 (cálculo aproximado a partir de los 100 M de parámetros y las activaciones del decodificador), sin cifra oficial publicada.
- GPU: no es necesaria. Cualquier GPU consumer con 4 GB o más (RTX 3060, RTX 4060, RTX 4090) permite aumentar el throughput en modo batch; no se documentan requisitos para A100/H100.
- CPU: el autor indica que la generación en streaming funciona en un CPU de 4 núcleos. Es el modo de despliegue recomendado por el propio proyecto.
- Despliegue: `infer.py` (clonación de voz), `app.py` (demo web local), CLI empaquetada (`moss-tts-nano generate`, `moss-tts-nano serve`) y Space de Hugging Face. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI; el uso de `custom_code` obliga a cargar el código del repositorio.
- Latencia y throughput: no se publican cifras de RTF, latencia de primer audio ni muestras por segundo. El autor describe la latencia como "baja" para tiempo real, sin cuantificar.

## Comparativa con modelos similares

Los datos de la comparativa no provienen de la documentación facilitada, sino de conocimiento general de la categoría; verifíquelos antes de usarlos en producción.

| Modelo | Parámetros | Idiomas | Salida | Licencia | CPU sin GPU |
|---|---|---|---|---|---|
| MOSS-TTS-Nano | 0,1 B | 20 | 48 kHz estéreo | Apache-2.0 | Sí (4 núcleos, streaming) |
| Kokoro-82M | 82 M | 8 aprox. | 24 kHz mono | Apache-2.0 | Sí |
| Piper (VITS) | decenas de M por voz | decenas de idiomas/voces | 22,05 kHz mono | MIT | Sí |
| Orpheus / OuteTTS (LLM-based) | 0,6-3 B | varios | 24 kHz aprox. | MIT / Apache-2.0 variable | Limitado |

Frente a Kokoro y Piper, la ventaja declarada de MOSS-TTS-Nano es la salida a 48 kHz estéreo y la clonación de voz integrada con troceado para texto largo; frente a los TTS basados en LLM de mayor tamaño, su ventaja es la huella (0,2 GB de repositorio) y la viabilidad en CPU. No hay benchmarks públicos que permitan comparar calidad subjetiva entre estas opciones.

## Limitaciones y advertencias

- La ficha analizada es una reproducción publicada por el usuario `Allinsama` con 0 descargas; para producción debe usarse el repositorio oficial `OpenMOSS-Team/MOSS-TTS-Nano`.
- No hay resultados de benchmarks ni evaluaciones subjetivas publicadas: la calidad de la voz, la naturalidad prosódica y la similitud de la clonación no están cuantificadas.
- La model card anuncia 20 idiomas y el frontmatter incluye hebreo (`he`), pero la tabla de idiomas del README no lista hebreo; conviene verificar el soporte real de esa lengua.
- Requiere `trust_remote_code` al usar `custom_code`; audite el código antes de cargarlo en entornos con datos sensibles.
- El repositorio no especifica tipos de cuantización ni formatos alternativos (GGUF, ONNX), lo que limita opciones de optimización fuera de PyTorch.
- La clonación de voz abre riesgos claros de suplantación y deepfakes; Apache-2.0 permite uso comercial, pero la responsabilidad legal y ética sobre el contenido generado recae en el integrador.
- No se documentan sesgos lingüísticos, de género o de acento, ni el comportamiento del modelo ante texto con ruido, abreviaturas o números; son aspectos a evaluar internamente.
- Riesgo de alucinación en sentido TTS (pronunciación incorrecta, omisión o repetición de fragmentos en textos largos): no hay datos publicados sobre la tasa de fallos con el troceado automático.
- No se indican requisitos de red, licencias de terceros del tokenizador ni condiciones adicionales más allá de Apache-2.0.

## Enlaces

- Ficha en Hugging Face (reproducción): https://huggingface.co/Allinsama/OpenMOSS-Team__MOSS-TTS-Nano-100M
- Modelo oficial en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano
- Repositorio GitHub oficial: https://github.com/OpenMOSS/MOSS-TTS-Nano
- Space de demostración: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-TTS-Nano
- Demo web: https://openmoss.github.io/MOSS-TTS-Nano-Demo/
- Página del proyecto: https://openmoss.ai/MOSS-TTS-Nano-Demo/
- Artículo arXiv: https://arxiv.org/abs/2603.18090
- ModelScope: https://modelscope.cn/models/openmoss/MOSS-TTS-Nano
- Blog de MOSI.AI: https://mosi.cn/#models
- Documentación de API: https://studio.mosi.cn/docs/moss-tts-nano
- Prueba en AI Studio: https://studio.mosi.cn/experiments/moss-tts-nano
- Familia MOSS-TTS: https://github.com/OpenMOSS/MOSS-TTS
- Discord: https://discord.gg/Xf3aXddCjc
- X/Twitter: https://x.com/Open_MOSS
