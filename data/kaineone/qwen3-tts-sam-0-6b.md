# kaineone/Qwen3-TTS-Sam-0.6B

## Resumen

Qwen3-TTS-Sam-0.6B es un ajuste fino (fine-tune) del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-Base, desarrollado por el equipo Qwen de Alibaba. Lo publica el usuario kaineone como parte del proyecto KAINE, un espacio de trabajo neuronal global predictivo para una mente sintética en ejecución continua. El modelo incorpora un altavoz personalizado con voz neutra en cuanto a género (non-binary) para inglés, entrenado sobre el conjunto de datos de voz Sam, creado por Accenture Labs en colaboración con CereProc.

El problema que resuelve es concreto: disponer de una voz TTS sintética que no esté marcada como masculina ni femenina, algo relevante para asistentes digitales inclusivos y para aplicaciones de accesibilidad. El ajuste se hace sobre la arquitectura Qwen3-TTS de 0,6B, que trabaja con tokens de audio discretos a 12 Hz y un codificador de altavoz integrado. El checkpoint tiene 905.788.672 parámetros reales según los safetensors y ocupa 2,5 GB en el repositorio.

Es relevante ahora porque el ecosistema Qwen3-TTS acaba de publicarse (informe técnico arXiv:2601.15621, 2026) y este es uno de los primeros fine-tunes comunitarios que añade una identidad de voz concreta mediante un speaker embedding almacenado en la ranura 3000 del codec. La licencia Apache 2.0, tanto del modelo base como del dataset, permite uso comercial sin fricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer con tokenizador de audio discreto a 12 Hz y codificador de altavoz integrado) |
| Parametros totales | 905.788.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-TTS-12Hz-0.6B-Base, que convierte texto en códigos de audio discretos a una tasa de 12 Hz mediante un tokenizador de voz. La variante de 0,6B tiene `text_hidden_size=2048` y `hidden_size=1024`, lo que obliga a una capa `text_projection` para alinear dimensiones antes de combinar los embeddings de texto y de codec. El fine-tune añade un speaker embedding extraído del audio de referencia mediante el codificador de altavoz integrado y lo almacena en la ranura 3000 del codec bajo el nombre `sam`.

El entrenamiento siguió el pipeline oficial de supervisión fina (SFT) de Qwen3-TTS adaptado al tamaño 0,6B: 1099 enunciados del dataset Sam, 2 épocas, batch size 1 con acumulación de gradiente de 8 pasos (efectivo 8), precisión bfloat16, optimizador AdamW con weight_decay=0.01, gradient clipping 1.0 y learning rate 1e-7. El autor documenta explícitamente que tasas más altas (el valor por defecto de 2e-6 para el 1.7B) provocan salida distorsionada y pérdida del token EOS en este tamaño. La función de pérdida combina la entropía cruzada principal del codec-0 con 0,3× la pérdida del sub-talker para los 15 grupos de codebooks restantes. Todo el entrenamiento se ejecutó en una NVIDIA RTX 4070 SUPER de 12 GB.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés con una voz neutra en cuanto a género identificada como `sam`.
- Generación de audio a partir de texto mediante `generate_custom_voice`, seleccionando el altavoz por nombre.
- Uso de un speaker embedding preentrenado extraído de audio de referencia, sin necesidad de clonación en tiempo de inferencia.
- Salida de audio muestreada (el ejemplo de la model card escribe un WAV con `soundfile`).
- Compatibilidad con FlashAttention 2 para inferencia en GPU.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada; el modelo es exclusivamente TTS.

## Casos de uso

- Asistentes de voz inclusivos: integrar la voz `sam` en un asistente conversacional para que usuarios no binarios dispongan de una identidad vocal que no imponga un género binario, usando la API `generate_custom_voice` con el altavoz predefinido.
- Accesibilidad y lectores de pantalla: sustituir voces TTS convencionales por una voz neutra en aplicaciones de lectura para personas con discapacidad visual, aprovechando la licencia Apache 2.0 para distribución comercial.
- Locuciones para contenidos educativos: generar narraciones en inglés para material formativo sobre identidad de género o diversidad, donde una voz neutra evita sesgos de percepción.
- Prototipado de interfaces de voz: usar el checkpoint como voz por defecto en demos de producto y pruebas de usabilidad, dado su tamaño reducido (0,6B) y su despliegue en una GPU de consumo.
- Investigación en TTS y equidad: servir como punto de partida para estudiar cómo se comportan los speaker embeddings en modelos Qwen3-TTS pequeños y comparar con fine-tunes sobre otras voces.
- Integración en el proyecto KAINE: alimentar el módulo de salida de voz de una mente sintética en ejecución continua, tal como declara el autor en la model card.
- Generación de audiolibros o pódcast de nicho: producir locuciones en inglés con una voz consistente y neutra para publicaciones independientes, sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, WER, similitud de altavoz) ni comparaciones cuantitativas con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 2,5 GB en bfloat16; con overhead de activaciones y del tokenizador de audio, se estima un consumo de entre 3 y 5 GB en GPU, aunque no se ha publicado una medición oficial.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; el autor entrenó en una RTX 4070 SUPER de 12 GB, por lo que esa tarjeta es suficiente para inferencia.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 SUPER y superiores.
- Opciones de despliegue: la model card solo documenta el uso mediante la librería `qwen_tts` con `Qwen3TTSModel.from_pretrained` y `device_map="cuda:0"`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-Sam-0.6B | 905.788.672 | no disponible | en | apache-2.0 | Fine-tune con voz neutra `sam` |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | no disponible | no disponible | no disponible | no disponible | Modelo base sin altavoz personalizado |
| Qwen3-TTS-1.7B (variante base) | no disponible | no disponible | no disponible | no disponible | Tamaño superior citado en la model card; learning rate por defecto 2e-6 |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo inglés: el dataset Sam es exclusivamente en inglés y el speaker embedding no se ha validado en otros idiomas que el modelo base pudiera soportar.
- Hereda todas las limitaciones de la arquitectura Qwen3-TTS-12Hz-0.6B-Base, que no se detallan en la model card.
- Las características de la voz derivan de un único dataset (1099 enunciados de una sola voz de talento y datos de prosodia de un donante), por lo que no representan la diversidad real de voces no binarias.
- Riesgo de alucinación y artefactos de audio: no se documentan métricas de calidad ni pruebas de robustez ante textos largos, signos de puntuación complejos o números.
- Sensibilidad al learning rate: el autor advierte que tasas altas producen salida distorsionada y pérdida del token EOS en el tamaño 0,6B; cualquier reentrenamiento debe usar 1e-7.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del dataset Sam y del modelo base Qwen3-TTS antes de redistribuir derivados.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- No se documentan sesgos específicos más allá de la limitación de diversidad de la voz, pero al ser un modelo de voz entrenado con un único registro, puede reproducir particularidades prosódicas del mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaineone/Qwen3-TTS-Sam-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Repositorio Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Dataset Sam non-binary voice: https://github.com/Sam-Accenture-Non-Binary-Voice/non-binary-voice-files
- Proyecto KAINE: https://github.com/kaineone/kaine
- Anuncio de Accenture y CereProc sobre la voz no binaria: https://newsroom.accenture.com/news/2020/accenture-and-cereproc-introduce-and-open-source-the-worlds-first-comprehensive-non-binary-voice-solution
- CereProc: https://www.cereproc.com/
- Informe técnico Qwen3-TTS: https://arxiv.org/abs/2601.15621
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
