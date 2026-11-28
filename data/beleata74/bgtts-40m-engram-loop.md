# beleata74/BgTTS-40M-Engram-Loop

## Resumen

BgTTS-40M-Engram-Loop es un modelo de síntesis de voz (text-to-speech) bilingüe búlgaro-inglés desarrollado por el usuario beleata74, especializado en clonación de voz mediante referencia de audio. El modelo no genera audio directamente: predice contenido de habla a partir de texto escrito, y un modelo separado (MioCodec v2, de Aratako) aplica el timbre del hablante de referencia y renderiza una onda de 44,1 kHz mono. Esta separación de responsabilidades permite clonar voces con tan solo 3-8 segundos de audio de referencia, incluso si la referencia está en un idioma distinto al texto solicitado.

Con 40.181.218 parámetros y un peso aproximado de 153 MiB en FP32 SafeTensors, es un modelo deliberadamente compacto que puede ejecutarse tanto en CPU como en GPU. Se inicializó desde BgTTS-38M-V2 (paso 258.680) y se afinó durante tres épocas sobre 1.285.440 enunciados (648.813 segmentos en búlgaro, 1.336,4 horas; 636.627 segmentos en inglés, 679,4 horas). La versión publicada corresponde a la época 3, paso 30.129.

La relevancia actual radica en su enfoque técnico: incorpora un módulo de "engram" (representaciones entrenables de palabras completas y secuencias locales de tres y cinco caracteres, inspirado en la investigación de DeepSeek) para mejorar la pronunciación contextual y el acento búlgaro, y una adaptación de capas compartidas (inspirada en la investigación de Z.ai) que ejecuta el tercer bloque del codificador dos veces con pesos compartidos. Es una pieza singular en el ecosistema TTS open source por su tamaño reducido, su licencia Apache 2.0 y su soporte nativo de búlgaro, un idioma poco representado en modelos de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con cross-attention; encoder bidireccional de 4 bloques, decoder causal de 8 bloques; anchura 384, 6 cabezas, feed-forward 1.536 |
| Parametros totales | 40.181.218 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (segmentos de entrenamiento de hasta 12 segundos) |
| Tipos de cuantizacion | FP32 (SafeTensors); no se documentan otras cuantizaciones |
| Idiomas soportados | Búlgaro (bg), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder. Un codificador bilingüe a nivel de carácter con cuatro bloques Transformer bidireccionales alimenta, mediante cross-attention, un decodificador causal de ocho bloques. Ambos usan anchura 384, seis cabezas de atención y anchura feed-forward de 1.536. El decodificador predice uno de los 12.800 códigos de MioCodec cada 40 ms, o un símbolo de fin de habla. La voz no entra en el modelo de texto: solo se aplica en el codec, mediante un vector de 128 dimensiones extraído de la referencia de audio.

El entrenamiento partió de los pesos publicados de BgTTS-38M-V2 en el paso 258.680, eliminando su proyección de condicionamiento de hablante. En las épocas 1 y 2 se añadió un módulo de engram (2.004.704 parámetros) que, tras el segundo bloque del codificador, consulta representaciones entrenables de palabra completa y de secuencias locales de tres y cinco caracteres, con una compuerta que pondera esa información según el contexto en cada letra; su proyección de salida se inicializó a cero. En la época 3 se ejecutó el tercer bloque del codificador dos veces con pesos compartidos y dos compuertas escalares por posición de texto (770 parámetros entrenables), con la segunda actualización inicializada a cero; antes de continuar el entrenamiento, el modelo convertido reprodujo exactamente los logits de la época 2 en los ejemplos verificados y los mismos códigos muestreados para un prompt y semilla fijos. Se continuó el estado de AdamW y el schedule de learning rate. El split de fine-tuning contuvo 1.285.440 enunciados: 648.813 segmentos búlgaros (1.336,4 horas) y 636.627 segmentos ingleses (679,4 horas), con fuentes inglesas LibriTTS-R y Hi-Fi TTS.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto plano en búlgaro e inglés.
- Clonación de voz mediante referencia de audio de 3-8 segundos de un solo hablante, incluso si la referencia está en un idioma distinto al texto.
- Predicción autónoma de la duración del habla generada.
- Procesamiento de números y abreviaturas tal como se escriben (el autor recomienda escribirlos como deben sonar).
- Segmentación automática de entradas largas en fragmentos con pausas breves entre ellos.
- Generación determinista controlable mediante semilla (`--seed`) para obtener lecturas alternativas.
- Ejecución en CPU y en GPU (CUDA).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Doblaje de vídeo y series: el modelo permite sustituir diálogos originales por voz sintetizada en búlgaro usando cada línea del actor original como referencia de voz, como demuestra el clip de 29 segundos de *Dark Matter* incluido en la model card; es adecuado porque la referencia puede ser del idioma original y el texto de destino en búlgaro.
- Audiolibros y narración: con una grabación de 3-8 segundos de un narrador se puede generar voz consistente para textos largos, aprovechando la segmentación automática de entradas y la reutilización de una misma voz entre líneas mediante la API de Python.
- Atención al cliente automatizada en búlgaro: permite generar respuestas habladas con la voz de un agente de referencia, útil para empresas búlgaras que necesitan TTS en su idioma nativo, poco cubierto por modelos comerciales.
- Accesibilidad y lectura de pantalla: síntesis en CPU (sin GPU) para convertir texto a voz en aplicaciones de lectura, gracias a su tamaño de 153 MiB en FP32 y su soporte de ejecución en CPU.
- Localización de contenido educativo: traducción y doblaje de materiales en inglés a búlgaro manteniendo el timbre del profesor original, con control de semilla para reproducir lecturas.
- Prototipado rápido de asistentes de voz: al ser un modelo pequeño con licencia Apache 2.0, se puede integrar en demos y pruebas de concepto sin coste de licencia, usando el Space de demostración como referencia de comportamiento.
- Generación de voces para videojuegos o animación: clonación de voces de referencia para personajes, con la posibilidad de ajustar la lectura mediante semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de texto ocupa aproximadamente 153 MiB en FP32 SafeTensors; el codec MioCodec v2 es una descarga separada cuyo peso no se especifica en la información disponible. En conjunto, la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; no se requieren A100 ni H100. El autor documenta aceleración con CUDA y también ejecución en CPU.
- Cabe en GPU consumer: sí, en cualquier RTX o GTX compatible con la versión de CUDA de PyTorch instalada, dado el reducido tamaño del modelo.
- Opciones de despliegue: el repositorio incluye `synthesize.py` con carga de modelos (`load_models`), extracción de voz de referencia (`reference_voice`) y síntesis (`synthesize`); requiere Python 3.12 o 3.13, PyTorch y torchaudio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion de voz | Licencia | Contexto |
|---|---|---|---|---|---|
| BgTTS-40M-Engram-Loop | 40,18 M | bg, en | Si (referencia de 3-8 s) | Apache 2.0 | No disponible |
| BgTTS-38M-V2 (modelo base) | ~38 M | bg, en | Si | No disponible en la informacion | No disponible |
| MioCodec v2 (Aratako) | No disponible | No aplica (codec) | No aplica | No disponible en la informacion | No disponible |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información proporcionada para establecer una comparación de rendimiento objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con LibriTTS-R y Hi-Fi TTS para inglés y fuentes búlgaras no especificadas, puede heredar sesgos de esos corpus (acentos, registros y demografía de los hablantes).
- Riesgo de alucinación: en TTS se traduce en pronunciaciones incorrectas o lecturas erráticas de números y abreviaturas; el autor recomienda escribirlos como deben sonar.
- Limitaciones de contexto: los segmentos de entrenamiento fueron de hasta 12 segundos; las entradas largas se dividen en fragmentos con pausas breves, lo que puede afectar a la prosodia en textos muy largos.
- Limitaciones de idioma: solo búlgaro e inglés; no se documenta soporte de otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el codec MioCodec v2 es una descarga separada cuya licencia no se detalla en la información disponible y debe verificarse antes de producción.
- Caveat para producción: el modelo predice su propia duración; en aplicaciones de doblaje, el autor indica que el habla generada debe ajustarse a la escena después de la síntesis. La calidad depende de la limpieza de la grabación de referencia (un solo hablante, 3-8 segundos de habla continua).
- La versión publicada es la época 3, paso 30.129; no se documentan evaluaciones formales de calidad (MOS u otras).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beleata74/BgTTS-40M-Engram-Loop
- README en búlgaro: https://huggingface.co/beleata74/BgTTS-40M-Engram-Loop/blob/main/README.bg.md
- Demo en el navegador (Space): https://huggingface.co/spaces/beleata74/BgTTS-40M-Voice-Demo
- Modelo base BgTTS-38M-V2: https://huggingface.co/beleata74/BgTTS-38M-V2
- Checkpoint original del modelo base: https://huggingface.co/beleata74/BgTTS-38M-V2/tree/3f6ca06b3ca78352eb00d8e96349c0bedaa3d2f1
- Codec MioCodec v2 (Aratako): https://huggingface.co/Aratako/MioCodec-25Hz-44.1kHz-v2
- Clip de doblaje de demostración (29 s, MP4): https://huggingface.co/beleata74/BgTTS-40M-Engram-Loop/resolve/epoch-3/demo/dark-matter-bg-29s.mp4
- Investigación Engram (DeepSeek): https://github.com/deepseek-ai/Engram
- Investigación sobre capas compartidas (Z.ai): https://z.ai/blog/glm-5.4
- Instalación de PyTorch: https://pytorch.org/get-started/locally/
