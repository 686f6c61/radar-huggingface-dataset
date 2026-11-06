# Edge0/Audio8-TTS-Realistic-Air

## Resumen

Audio8-TTS-Realistic-Air es un modelo de síntesis de voz (text-to-speech) desarrollado por Edge0, presentado como una evolución del checkpoint Audio8-TTS-Preview-0.6b. Mantiene la arquitectura compacta de 0,6 mil millones de parámetros (601.159.424 en el modelo principal, excluyendo el códec) y añade mejoras sustanciales en naturalidad prosódica y expresividad, además de ampliar la cobertura lingüística de 11 a 23 idiomas. Está diseñado para generación de voz con clonación zero-shot a partir de una grabación de referencia y su transcripción exacta, o sin referencia.

Técnicamente emplea una arquitectura DualAR inspirada en Fish Audio S2 Pro: un transformer autorregresivo lento que predice un token semántico por frame de audio y un transformer autorregresivo rápido que predice los codebooks del códec condicionado al estado oculto del lento. Incorpora un códec neuronal de audio a 44,1 kHz incluido en el repositorio, con 2.048 muestras por frame (aproximadamente 21,5 frames por segundo), y un contexto de hasta 2.048 posiciones empaquetadas de texto y audio.

Su relevancia actual radica en ofrecer clonación de voz multilingüe con licencia Apache 2.0 y un tamaño contenido que permite despliegue en GPU de consumo, junto con un adaptador de serving para SGLang Omni con atención paginada, batching dinámico y API de voz compatible con OpenAI. El repositorio incluye pesos safetensors, tokenizer, processor y código personalizado de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (transformer autorregresivo lento + autorregresivo rápido) con códec neuronal de audio |
| Parametros totales | 601.159.424 (modelo principal, excluye el códec) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 23: chino, inglés, japonés, coreano, alemán, francés, español, italiano, ruso, árabe, finlandés, hindi, indonesio, malayo, neerlandés, noruego, polaco, portugués, sueco, tailandés, turco, vietnamita y cantonés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers, código personalizado con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura DualAR con dos componentes autorregresivos. El transformer lento consta de 24 capas con anchura 896, 14 cabezas de atención y 2 cabezas KV, y predice un token semántico por cada frame de audio. El transformer rápido consta de 4 capas con la misma anchura y configuración de atención, y predice los codebooks del códec para cada frame condicionado al estado oculto del modelo lento y a los codebooks precedentes. El códec acústico emplea 10 codebooks de 4.096 entradas cada uno y opera a 44,1 kHz con 2.048 muestras por frame, lo que equivale a unos 21,5 frames por segundo.

El códec incluido gestiona tanto la codificación del audio de referencia como la decodificación de la forma de onda, por lo que no requiere un checkpoint de códec adicional. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La model card menciona únicamente que el modelo parte de Audio8-TTS-Preview-0.6b y que esta versión mejora la naturalidad de la prosodia y la expresividad, además de añadir 12 idiomas. El despliegue de alto rendimiento se realiza mediante un adaptador SGLang Omni con atención paginada y batching dinámico.

## Capacidades

- Síntesis de voz a partir de texto en 23 idiomas, con calidad variable según el idioma.
- Clonación de voz zero-shot a partir de una grabación de referencia limpia y su transcripción exacta.
- Generación de voz sin audio de referencia, usando únicamente el texto de entrada.
- Control de expresividad y prosodia mejorado respecto al checkpoint Preview.
- Salida de audio a 44,1 kHz mediante el códec neuronal incluido.
- Inferencia mediante la interfaz estándar de Transformers con `AutoModel` y `AutoProcessor`.
- Serving de alto rendimiento mediante SGLang Omni, con API de voz compatible con OpenAI.
- Generación con muestreo configurable (temperatura, top-p, top-k) y hasta 1.024 tokens nuevos en los ejemplos de la model card.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso ni procesamiento de visión o audio de entrada más allá de la referencia de voz.

## Casos de uso

- Clonación de voz para audiolibros y narración: el modelo permite generar horas de narración con una voz consistente a partir de una única grabación de referencia y su transcripción, manteniendo la prosodia del hablante original.
- Doblaje y localización multilingüe: con 23 idiomas soportados, se puede reutilizar una misma voz de referencia para producir versiones en español, inglés, portugués, hindi o árabe, reduciendo el coste frente a doblaje humano por idioma.
- Asistentes de voz para atención al cliente: la generación sin referencia permite crear respuestas habladas dinámicas, y el adaptador SGLang Omni con batching dinámico facilita atender múltiples sesiones concurrentes con una API compatible con OpenAI.
- Accesibilidad y lectura de contenido: conversión de artículos, documentación o correos a audio con voces naturales, útil para usuarios con discapacidad visual o para consumo en movilidad.
- Producción de contenido para redes y pódcast: generación de locuciones con prosodia expresiva a partir de guiones, con control de temperatura y top-p para ajustar la variabilidad de la entrega.
- Prototipado de interfaces de voz en aplicaciones: al ser un modelo de 0,6B con licencia Apache 2.0, se puede integrar en entornos de desarrollo y desplegar en GPUs de consumo para pruebas de concepto sin costes de licencia.
- Investigación en síntesis de voz: su arquitectura DualAR documentada y su tamaño compacto lo hacen adecuado para experimentos de ablación, ajuste fino y comparación de estrategias de decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona que existe una evaluación por idioma y que la cobertura de benchmarks incluye algunos idiomas adicionales distintos de la lista de idiomas soportados, pero no se proporcionan cifras concretas en la información suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo principal tiene 601 millones de parámetros; en BF16 requiere aproximadamente 1,2 GB solo para los pesos, más el códec y las activaciones. En FP32 serían unos 2,4 GB para los pesos. No se dispone de cifras oficiales de VRAM total.
- GPU recomendadas: la model card indica que el paquete de Transformers se probó con PyTorch 2.8.0 y Transformers 4.57.3 en una NVIDIA H20 con BF16. No se especifican otras GPU recomendadas.
- GPU de consumo: por el tamaño del modelo, es previsible que quepa en GPUs de consumo con suficiente VRAM, pero no se confirma en la información disponible.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (probado con CUDA y también con ruta CPU/FP32 en el ejemplo de código) y SGLang Omni con atención paginada, batching dinámico y API compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo indica que el adaptador SGLang Omni está orientado a serving de alto rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-Air | 601 M (sin códec) | 2.048 posiciones | 23 | Apache 2.0 | Clonación zero-shot, códec 44,1 kHz incluido, serving SGLang Omni |
| Audio8-TTS-Preview-0.6b | 0,6 B | No disponible | 11 | No disponible en la información | Modelo base; esta versión añade 12 idiomas y mejora la prosodia |
| Fish Audio S2 Pro | No disponible | No disponible | No disponible | No disponible | Inspiración arquitectónica citada (DualAR); no se dispone de especificaciones comparables en la información |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- La calidad de la síntesis varía según el idioma; la propia model card advierte de que la calidad por idioma es desigual y remite a la evaluación por idioma.
- La clonación de voz requiere una grabación de referencia limpia y una transcripción que coincida exactamente con el contenido hablado; discrepancias en la transcripción degradan el resultado.
- Riesgo de uso indebido para suplantación de identidad o deepfakes de voz; la licencia Apache 2.0 no impone restricciones de uso, por lo que la responsabilidad ética y legal recae en el implementador.
- No se documentan sesgos específicos del modelo en la información disponible.
- Riesgo de alucinación en el sentido de prosodia o pronunciación incorrecta en textos ambiguos, siglas o nombres propios, especialmente en idiomas con menos cobertura.
- El contexto está limitado a 2.048 posiciones empaquetadas de texto y audio, lo que restringe la duración de las secuencias generadas por invocación.
- El modelo requiere `trust_remote_code=True` y código personalizado de Transformers; conviene revisar los archivos del repositorio antes de ejecutarlo en producción.
- El recuento de 0,6B excluye el códec; los requisitos reales de memoria deben considerar el códec y las activaciones adicionales.
- No se especifican requisitos de atribución más allá de los de Apache 2.0, pero se recomienda citar el paper y el repositorio originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Repositorio GitHub: https://github.com/Edge0-AI/Audio8_TTS
- Demo: https://edge0-ai.github.io/Audio8_TTS/realistic-0.6b/
- Paper (arXiv): https://arxiv.org/abs/2610.14776
- Playground en Hugging Face Spaces: https://huggingface.co/spaces/Edge0/Audio8-TTS-Realistic-0.6b
- Repositorio de referencia arquitectónica (Fish Audio): https://github.com/fishaudio/fish-speech
