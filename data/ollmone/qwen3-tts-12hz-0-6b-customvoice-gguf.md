# OllmOne/Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice GGUF es una conversión a formato GGUF del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-CustomVoice, desarrollado originalmente por el equipo Qwen de Alibaba y empaquetado por el usuario OllmOne para su uso con la librería audio.cpp. Se trata de un modelo text-to-speech de 0,6 mil millones de parámetros que incorpora un conjunto de nueve voces predefinidas (Vivian, Serena, Uncle_Fu, Dylan, Eric, Ryan, Aiden, Ono_Anna y Sohee) y permite control de emoción mediante instrucciones en lenguaje natural.

El paquete resuelve el problema de desplegar TTS de calidad en entornos sin infraestructura GPU dedicada: al estar en formato GGUF y validado en CPU con audio.cpp, permite inferencia local en hardware modesto. Cada archivo GGUF es autocontenido e incluye el talker, el tokenizador de voz, el config.json, los ficheros del tokenizador de texto y la especificación del modelo de audio.cpp.

Es relevante ahora porque los modelos TTS de Qwen3 con control de voz y emoción solo estaban disponibles en formato safetensors y con dependencias pesadas de Python; esta conversión abre su uso a pipelines en C++ y a despliegues sin GPU. El contexto de audio se genera a una tasa de 12 Hz, lo que reduce el coste computacional frente a codecs de mayor frecuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3-TTS, talker + speech tokenizer + codec head + code-predictor heads) |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y BF16 |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors como formato original del modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de sus componentes: un talker (generador de tokens de audio), un speech tokenizer, una proyección de texto, una codec head y cabezas de predicción de códigos. La tasa de 12 Hz indica que el codec de audio opera a 12 tokens por segundo de audio generado. El paquete Q8_0 aplica cuantización de 8 bits a las proyecciones de atención y MLP del talker, a la proyección de texto, a la codec head y a las cabezas de predicción de códigos; las normas permanecen en BF16, los embeddings de texto y codec en F16 y las convoluciones del speech tokenizer en F32.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La conversión a GGUF se realizó con la herramienta `audiocpp_gguf` compilada desde el commit `52118521b338aaa376ad58350ec772342993485b` de audio.cpp, usando `--type q8_0` y `--type bf16` respectivamente. La validación se llevó a cabo en CPU con audio.cpp v0.9.2, ejecutando las nueve voces con frases cortas en chino, inglés, japonés y coreano, una instrucción de emoción y un pasaje chino de 35 segundos; la transcripción con Qwen3-ASR-0.6B (Q8_0) devolvió el texto de entrada con diferencias solo en puntuación, y el pasaje largo no mostró silencios superiores a 1,2 s (Q8_0) ni 0,7 s (BF16).

## Capacidades

- Síntesis de voz (text-to-speech) en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Nueve voces predefinidas seleccionables mediante `voice_id`: Vivian, Serena, Uncle_Fu, Dylan, Eric, Ryan, Aiden, Ono_Anna y Sohee.
- Control de emoción mediante el parámetro opcional `--instruct` (por ejemplo, "Very happy.").
- Generación en streaming mediante `--mode streaming`.
- Empaquetado autocontenido: un único archivo GGUF incluye todos los componentes necesarios.
- Integración con la CLI `audiocpp_cli` de audio.cpp para tareas TTS de la familia `qwen3_tts`.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso, al ser un modelo especializado en síntesis de voz.

## Casos de uso

- Generación de audiolibros y narración por lotes: con un modelo de 0,6B en Q8_0 (1,71 GB), se puede ejecutar en CPU y procesar pasajes largos, como demuestra la validación con un texto chino de 35 segundos y pausas máximas de 1,2 s, adecuado para narración continua.
- Doblaje y localización multilingüe: al soportar diez idiomas y nueve voces, permite generar pistas de voz para vídeos o cursos en varios idiomas desde un mismo pipeline, seleccionando `voice_id` por idioma o personaje.
- Asistentes de voz embebidos: el formato GGUF y la inferencia en CPU con audio.cpp permiten integrar TTS en dispositivos sin GPU, como Raspberry Pi o sistemas empotrados, usando el binario `audiocpp_cli` o la librería C++.
- Prototipado de interfaces conversacionales: el control de emoción con `--instruct` permite generar respuestas con tono alegre, neutro o triste para evaluar la percepción de usuarios en pruebas de UX antes de invertir en infraestructura mayor.
- Generación de contenido para accesibilidad: conversión de texto a voz para lectores de pantalla o audiodescripciones, con la ventaja de que el paquete Q8_0 ocupa 1,71 GB y puede desplegarse en servidores sin acelerador dedicado.
- Síntesis en streaming para aplicaciones de tiempo real: el modo `--mode streaming` permite emitir audio conforme se genera, útil en chatbots de voz o sistemas de respuesta interactiva donde la latencia de primer token de audio es crítica.
- Pruebas de regresión de pipelines ASR/TTS: la validación del autor usa Qwen3-ASR-0.6B para transcribir las salidas y comparar con la entrada, un flujo replicable para verificar calidad en integraciones continuas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación documentada es cualitativa: transcripción con Qwen3-ASR-0.6B que recupera el texto de entrada (diferencias solo en puntuación) y ausencia de silencios largos (máximo 1,2 s en Q8_0 y 0,7 s en BF16 sobre un pasaje de 35 segundos).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el tamaño de los archivos (1,71 GB para Q8_0 y 2,16 GB para BF16) da una cota inferior del espacio de pesos, a la que hay que sumar el estado de activaciones y el búfer de audio.
- GPU recomendadas: no disponible; el autor valida exclusivamente en CPU con audio.cpp v0.9.2.
- Cabe en GPU de consumo: previsiblemente sí en cualquier GPU con al menos 4 GB de memoria para Q8_0, aunque no hay cifras oficiales de VRAM ni de velocidad.
- Opciones de despliegue: audio.cpp (CLI `audiocpp_cli` y librería C++); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; solo se reporta que la inferencia se ejecutó en CPU y que el modo streaming funciona igual que en el paquete de 1.7B CustomVoice.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice GGUF (este) | 0,6B | no disponible | 10 | Apache-2.0 | GGUF | Voces predefinidas + control de emoción, validado en CPU |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | 1,7B | no disponible | no disponible | Apache-2.0 (presumible, misma familia) | safetensors / GGUF | Mayor tamaño, misma familia y modo streaming; datos de rendimiento no disponibles |
| Qwen3-TTS-12Hz-0.6B-Base | 0,6B | no disponible | no disponible | Apache-2.0 | safetensors / GGUF | Variante base sin voces predefinidas; el paquete Q8_0 de este repo replica su selección de tipos |

No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo entre estas variantes.

## Limitaciones y advertencias

- El modelo está especializado en TTS: no realiza razonamiento, código, matemáticas ni tool calling.
- Solo se han validado cualitativamente frases cortas en chino, inglés, japonés y coreano más un pasaje chino; no hay validación publicada para español, italiano, alemán, francés, portugués ni ruso.
- Las voces disponibles están limitadas a las nueve predefinidas; no se documenta clonación de voz en esta variante CustomVoice.
- Riesgo de alucinación y artefactos de pronunciación no cuantificado: no se han publicado métricas objetivas (MOS, WER) en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen3-TTS; conviene verificar las condiciones del modelo original.
- El soporte de despliegue está restringido a audio.cpp; no hay integración documentada con ecosistemas como llama.cpp u Ollama.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- No se dispone de información sobre sesgos lingüísticos o de hablante del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OllmOne/Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Paquete GGUF oficial de referencia (audio-cpp): https://huggingface.co/audio-cpp/audio.cpp-gguf
- Repositorio audio.cpp: https://github.com/0xShug0/audio.cpp
