# flyingfishinwater/MOSS-TTS-Nano-100M

## Resumen

MOSS-TTS-Nano es un modelo de síntesis de voz (text-to-speech) multilingüe y de tamano reducido desarrollado por MOSI.AI y el equipo OpenMOSS. Con aproximadamente 0,1 B de parámetros declarados (142.477.056 parámetros reales según el fichero de safetensors), está disenado para generación de voz en tiempo real, con un consumo de recursos tan bajo que puede ejecutarse en CPU sin necesidad de GPU. La ficha que aquí se analiza, flyingfishinwater/MOSS-TTS-Nano-100M, es una conversión de terceros del modelo original OpenMOSS-Team/MOSS-TTS-Nano-100M al formato MLX mediante mlx-audio 0.4.0.

El modelo emplea una arquitectura autoregresiva pura basada en un tokenizador de audio (Audio Tokenizer) más un modelo de lenguaje, y produce audio nativo a 48 kHz y 2 canales. Su propuesta de valor es el despliegue ligero: inferencia por streaming con baja latencia, funcionamiento en una CPU de 4 núcleos y soporte para texto largo mediante clonación de voz con troceado automático.

Es relevante para desarrolladores que necesitan integrar TTS local sin infraestructura de GPU, ya sea en demos, servicios web ligeros o productos con requisitos de tiempo real. Cubre 20 idiomas, incluyendo castellano, y se distribuye bajo licencia Apache 2.0. Esta copia concreta, sin embargo, es una conversión no oficial con cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoregresiva pura: Audio Tokenizer + LLM |
| Parametros totales | 142.477.056 (~0,14 B) según safetensors |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 20: zh, en, de, es, fr, ja, it, hu, ko, ru, fa, ar, pl, pt, cs, da, sv, el, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (conversión a MLX mediante mlx-audio 0.4.0) |
| Formato de audio de salida | 48 kHz, 2 canales |
| Modelo base | OpenMOSS-Team/MOSS-TTS-Nano-100M |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion (repo) | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura es una tubería autoregresiva pura compuesta por un tokenizador de audio y un LLM. El tokenizador (MOSS-Audio-Tokenizer-Nano) convierte el audio de referencia en tokens discretos y el LLM genera los tokens de audio correspondientes al texto de entrada, que posteriormente se decodifican a forma de onda. El modelo base se publicó el 10 de abril de 2026 y esta copia se obtuvo convirtiendo dichos pesos a formato MLX con mlx-audio versión 0.4.0, lo que habilita su ejecución en hardware Apple Silicon.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones concretas de decodificación más allá del propio esquema autoregresivo con streaming. El modelo base está asociado a dos referencias arXiv (2603.18090 y 2602.10934), pero su contenido no se ha facilitado. La característica diferencial declarada es la combinación de tamano diminuto, salida nativa a 48 kHz estéreo y capacidad de inferencia en CPU de 4 núcleos.

## Capacidades

- Síntesis de voz multilingüe en 20 idiomas, entre ellos castellano, inglés, chino, alemán, francés, japonés, coreano, ruso, árabe, portugués o turco.
- Clonación de voz a partir de un audio de referencia (voice clone mode), que es el flujo recomendado por el autor.
- Inferencia por streaming con baja latencia hasta la primera muestra de audio.
- Generación de audio nativo a 48 kHz y 2 canales.
- Manejo de texto largo mediante clonación de voz con troceado automático.
- Despliegue local sencillo: scripts `infer.py` y `app.py`, además de una CLI empaquetada (`moss-tts-nano generate` y `moss-tts-nano serve`).
- Ejecución en CPU (streaming en una CPU de 4 núcleos) y en MLX sobre Apple Silicon.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada más allá de la referencia de clonación, ni modo de razonamiento explícito.

## Casos de uso

- Lectura de artículos y documentos en voz alta: el modelo acepta texto largo y lo trocea de forma automática, por lo que puede narrar contenido extenso sin intervención manual, manteniendo la voz clonada de referencia.
- Asistentes de voz locales: al funcionar en CPU de 4 núcleos y con streaming, es viable integrarlo en aplicaciones de escritorio que necesiten respuestas habladas sin depender de servicios en la nube.
- Audiolibros y pódcast generados: la clonación de voz y la salida a 48 kHz estéreo permiten producir contenido narrado con una identidad de voz consistente en castellano y otros idiomas.
- Accesibilidad para personas con discapacidad visual: lectura por voz de interfaces y contenidos con baja latencia, desplegable en el propio equipo del usuario.
- Doblaje y localización ligera: al cubrir 20 idiomas, puede generar pistas de voz para vídeos o tutoriales en varios idiomas a partir de un mismo guion.
- Demos y prototipos web: el demo FastAPI (`app.py`, puerto 18083) y el comando `moss-tts-nano serve` permiten levantar un servicio de TTS en minutos para validar productos.
- Sistemas de respuesta interactiva (IVR) y avisos automatizados: la baja latencia y el streaming encajan en flujos conversacionales donde el tiempo hasta el primer audio es crítico.
- Herramientas de creación de contenido para desarrolladores: integración en pipelines que generan narraciones a partir de texto (por ejemplo, resúmenes de commits o documentación) sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del repositorio y la model card consultada no incluyen métricas objetivas como MOS, WER, MMLU ni comparaciones numéricas con otros sistemas TTS. Solo se declaran características cualitativas (baja latencia, streaming, ejecución en CPU de 4 núcleos) sin valores medidos. No se deben asumir cifras no documentadas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (cálculo a partir de 142,5 M de parámetros; valores orientativos, no confirmados por el autor):
  - fp32: en torno a 0,57 GB de pesos.
  - fp16/bf16: en torno a 0,29 GB de pesos.
  - int8: en torno a 0,14 GB de pesos.
  - int4: en torno a 0,07 GB de pesos.
  A estas cifras hay que sumar el consumo del tokenizador de audio y de los estados intermedios.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU y para MLX en Apple Silicon. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) sería sobredimensionada para un modelo de este tamano.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en GPUs integradas, dado el reducido tamano de pesos.
- CPU: el autor indica que la generación por streaming puede ejecutarse en una CPU de 4 núcleos.
- Opciones de despliegue: scripts Python (`infer.py`, `app.py`), CLI empaquetada (`moss-tts-nano generate`, `moss-tts-nano serve`), servidor FastAPI incluido y ejecución mediante mlx-audio en Apple Silicon.
- Latencia y throughput: no se han publicado valores numéricos; solo se afirma baja latencia en tiempo real y rapidez hasta el primer audio.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos con otros modelos TTS (ni parámetros, ni contexto, ni rendimiento de alternativas). Por tanto, la comparativa se marca como no disponible. Como referencia estructural, este modelo pertenece a la categoría de TTS ligeros multilingües con licencia permisiva y ejecución en CPU, pero no se han facilitado cifras que permitan contrastarlo con competidores concretos.

## Limitaciones y advertencias

- Esta ficha corresponde a una conversión de terceros (autor flyingfishinwater) y no al repositorio oficial; la model card reproduce el texto de una conversión de mlx-community, lo que puede generar confusión sobre la autoría real.
- El repositorio presenta 0 descargas y 0 valoraciones en el momento de redactar la ficha, por lo que no hay evidencia de uso ni validación por parte de la comunidad.
- No se documentan tasas de error, artefactos de audio ni calidad subjetiva; la calidad "suficiente para productos en tiempo real" es una afirmación cualitativa del autor, no una métrica verificada.
- Riesgo de alucinación no aplica en el sentido textual, pero sí puede producirse inestabilidad en la prosodia, pronunciaciones incorrectas o artefactos en textos largos o idiomas poco representados.
- La calidad por idioma puede variar: se listan 20 idiomas, pero no se aportan datos de cobertura ni de rendimiento por lengua.
- La clonación de voz plantea riesgos éticos y legales (suplantación de identidad, uso indebido de voces de terceros); es responsabilidad del usuario cumplir la normativa aplicable en su jurisdicción.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base original y de las dependencias (mlx-audio, tokenizador de audio) antes de un despliegue en producción.
- No se especifican tipos de cuantización ni longitudes de contexto, lo que limita la planificación de optimizaciones de memoria.
- En producción conviene validar el comportamiento en CPU objetivo y medir latencia real, ya que no se publican cifras de throughput.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/flyingfishinwater/MOSS-TTS-Nano-100M
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M
- Model card original (referenciada): https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano
- Repositorio de código: https://github.com/OpenMOSS/MOSS-TTS-Nano
- Demo online: https://openmoss.github.io/MOSS-TTS-Nano-Demo/
- Space de demostración: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-TTS-Nano
- MOSI.AI: https://mosi.cn/#hero
- OpenMOSS: https://www.open-moss.com/
- Referencia arXiv asociada (identificador): arXiv:2603.18090
- Referencia arXiv asociada (identificador): arXiv:2602.10934
- mlx-audio (dependencia de conversión): no disponible enlace directo en la información proporcionada
