# AfriSpeech/omnivoice-africa

## Resumen

OmniVoice-Africa es un modelo de síntesis de voz (text-to-speech) de tipo zero-shot adaptado a 93 lenguas africanas y al inglés ghanés. Lo desarrolla el equipo AfriSpeech / Ghana NLP como un fine-tuning del modelo base k2-fsa/OmniVoice, que combina un backbone transformer Qwen3-0.6B con un códec discreto HiggsAudio de 8 capas. El modelo resuelve el problema de la escasez de sistemas TTS de calidad para lenguas africanas de bajos recursos, cubriendo idiomas como twi, hausa, yoruba, suajili, zulú, igbo, amárico, shona, xhosa, kinyarwanda, lingala, wolof, fula, tigriña, oromo o afrikáans, entre otros.

La aportación técnica principal es la integración de representaciones fonéticas IPA mediante la librería africa-g2p y espeak-ng, lo que elimina ambigüedades de pronunciación y permite fonética cruzada exacta entre lenguas. El modelo tiene 813.977.841 parámetros, se distribuye en safetensors (repo de 4,1 GB) bajo licencia Apache 2.0 y soporta clonación de voz zero-shot con tan solo 3-5 segundos de audio de referencia.

Es relevante ahora porque democratiza la síntesis de voz en un continente con más de 2.000 lenguas y muy poca cobertura TTS comercial, y lo hace con un modelo de tamaño contenido (menos de mil millones de parámetros) que puede desplegarse en hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3-0.6B) + códec discreto HiggsAudio de 8 capas RVQ; TTS por difusión sobre tokens discretos |
| Parametros totales | 813.977.841 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el repo solo distribuye safetensors) |
| Idiomas soportados | 93 lenguas africanas + inglés ghanés (tw, ha, yo, sw, zu, ig, am, en, sn, xh, rw, ln, wo, ff, ti, om, af, ee, gaa, dag, entre otras) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de k2-fsa/OmniVoice: un backbone Qwen3-0.6B que procesa el texto (convertido previamente a fonemas IPA) y un códec discreto HiggsAudio de 8 capas de cuantización residual vectorial (RVQ) que genera los tokens de audio. La síntesis se plantea como un proceso de difusión sobre esos tokens discretos, lo que permite generar audio de forma no autorregresiva y con control de prosodia.

El fine-tuning se realizó sobre el dataset AfriSpeech/african-speech-tts-aligned, con 897 horas de habla (387.175 enunciados) en 93 lenguas africanas e inglés ghanés. Se empleó LoRA con RSLoRA (r=32, alpha=64) que posteriormente se fusionó en los pesos base de Qwen3-0.6B. El optimizador fue AdamW con learning rate máximo de 2e-5 y warmup coseno, y la función de pérdida fue entropía cruzada enmascarada sobre las 8 capas del codebook RVQ, alcanzando una pérdida de validación de 3,7184. El entrenamiento se ejecutó en una única NVIDIA H200 (140 GB VRAM) en bf16 con TF32. La innovación destacable es el pipeline fonético con africa-g2p y espeak-ng, que convierte el texto a IPA antes de la síntesis y resuelve ambigüedades de pronunciación entre lenguas.

## Capacidades

- Síntesis de voz (TTS) en 93 lenguas africanas y en inglés ghanés a partir de texto.
- Conversión automática de texto a fonemas IPA mediante africa-g2p, con soporte de espeak-ng para inglés.
- Clonación de voz zero-shot a partir de un clip de referencia de 3-5 segundos, con transcripción de referencia opcional.
- Control de velocidad de habla mediante el parámetro `speed`; el valor por defecto calibrado es 0,85 (aproximadamente 145 palabras por minuto), orientado a un ritmo conversacional natural.
- Generación de audio con prosodia y ritmo ajustados para claridad en lenguas de bajos recursos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del clip de referencia para clonación.

## Casos de uso

- Locución y doblaje para medios africanos: el modelo genera voz en lenguas como twi, hausa o suajili a partir de texto, lo que permite producir audios de noticias o contenidos divulgativos sin necesidad de un hablante nativo en estudio para cada lengua.
- Accesibilidad y lectura de pantalla: integración en aplicaciones de lectura en voz alta para usuarios de lenguas africanas de bajos recursos, con la posibilidad de clonar la voz del propio usuario a partir de 3-5 segundos de audio.
- Asistentes de voz para atención al cliente: despliegue de respuestas habladas en suajili, yoruba o amárico en líneas de atención telefónica o chatbots de voz, aprovechando que el modelo cubre múltiples lenguas con un único checkpoint.
- Preservación lingüística y educación: generación de materiales didácticos y audiolibros en lenguas con poca presencia digital (gaa, dag, ee, ff, ln, wo), usando el pipeline IPA para garantizar una pronunciación consistente.
- Contenido para redes y publicidad localizada: producción rápida de cuñas y anuncios en varias lenguas africanas con una misma voz de marca clonada, reduciendo el coste de adaptación por mercado.
- Investigación en TTS multilingüe: uso como modelo base para experimentos de fonética cruzada y evaluación de sistemas de síntesis en lenguas africanas, dado que es un fine-tuning abierto (Apache 2.0) sobre OmniVoice.
- Sistemas de navegación y avisos por voz: generación de indicaciones habladas en lenguas locales para aplicaciones de transporte, con control de velocidad para adaptarse a distintos contextos de escucha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de validación del entrenamiento (3,7184) y no incluye métricas como MOS, WER de ASR sobre el audio sintetizado ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: con 813.977.841 parámetros en bfloat16, los pesos ocupan aproximadamente 1,6 GB; sumando activaciones y el códec, se estima un uso de VRAM de entre 3 y 6 GB, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H200; para inferencia es suficiente una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 8 GB o más de VRAM, dado el tamaño del modelo.
- Opciones de despliegue: el ejemplo oficial usa la librería `omnivoice` con PyTorch y `device_map="cuda:0"` en bfloat16; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo TTS con códec de audio estas herramientas no son directamente aplicables.
- Latencia y throughput: no disponibles. El modelo aplica un ritmo de habla por defecto de aproximadamente 145 palabras por minuto (`speed=0.85`), pero no se publican cifras de tiempo real ni de factor de tiempo real (RTF).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OmniVoice-Africa (este) | 813.977.841 | no disponible | 93 lenguas africanas + inglés ghanés | Apache 2.0 | safetensors |
| k2-fsa/OmniVoice (base) | no disponible (backbone Qwen3-0.6B) | no disponible | multilingüe general (no se detalla) | no disponible en la informacion | no disponible |
| Otros TTS multilingües de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo se ha fine-tuneado sobre 897 horas de audio, un volumen reducido para 93 lenguas; es previsible que las lenguas con menos datos presenten menor calidad y mayor variabilidad, aunque no se publican métricas por lengua.
- Riesgo de alucinación y artefactos de audio: como todo modelo generativo de voz, puede producir pronunciaciones incorrectas, ruidos o prosodia anómala, especialmente en textos con nombres propios, siglas o préstamos no vistos en el entrenamiento.
- Dependencia de dependencias externas: requiere africa-g2p y espeak-ng para la conversión fonética; un fallo en el pipeline G2P degrada directamente la pronunciación.
- La clonación de voz zero-shot plantea riesgos de suplantación de identidad y uso indebido; no se documentan mecanismos de marca de agua ni de detección de voz sintética.
- Sesgos: no se documentan análisis de sesgo por género, dialecto o variedad regional dentro de cada lengua.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base k2-fsa/OmniVoice y el dataset african-speech-tts-aligned tienen sus propias condiciones que conviene verificar antes de un despliegue en producción.
- No se publican cifras de latencia, throughput ni VRAM oficial, por lo que los requisitos de hardware indicados son estimaciones.
- El soporte de inglés se limita al inglés ghanés; no se garantiza calidad en otras variedades del inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AfriSpeech/omnivoice-africa
- Modelo base: https://github.com/k2-fsa/OmniVoice
- Repositorio de entrenamiento (fork): https://github.com/michsethowusu/OmniVoice
- Librería fonética africa-g2p: https://github.com/AfriSpeech/africa-g2p
- Dataset de entrenamiento: https://huggingface.co/datasets/AfriSpeech/african-speech-tts-aligned
- Organización AfriSpeech en Hugging Face: https://huggingface.co/AfriSpeech
