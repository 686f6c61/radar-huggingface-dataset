# Selbyggen/nb-whisper-medium-coreml

## Resumen

Selbyggen/nb-whisper-medium-coreml es una conversión de formato del modelo NbAiLab/nb-whisper-medium, desarrollado por la Biblioteca Nacional de Noruega (Nasjonalbiblioteket). No se trata de un modelo nuevo ni de un reentrenamiento: los pesos y el comportamiento son idénticos a los del modelo original. La conversión transforma los pesos de PyTorch a Core ML para que el modelo pueda ejecutarse en el Apple Neural Engine mediante el framework WhisperKit, lo que permite inferencia local en dispositivos con Apple Silicon (Mac, iPhone, iPad) sin enviar audio a servidores externos.

El modelo resuelve el problema de la transcripción automática de voz en noruego (bokmål, nynorsk y noruego genérico) en entornos locales y privados. Al estar basado en la arquitectura Whisper medium, cuenta con aproximadamente 769 millones de parámetros y una ventana de contexto de audio de 30 segundos por segmento, con capacidad de procesar audio más largo mediante segmentación interna. La relevancia actual radica en la demanda de soluciones de ASR que funcionen completamente en el dispositivo, sin dependencia de la nube, especialmente para aplicaciones de privacidad sensible como reuniones, notas de voz y transcripción médica o legal.

La conversión fue realizada con la herramienta whisperkittools en precisión float16 sin cuantización, con un tamaño de repositorio de 1,5 GB. El modelo se distribuye bajo licencia Apache 2.0, la misma que el modelo original, y está siendo utilizado por la aplicación comercial Says (Mac, iPhone, iPad) para transcripción local en noruego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | Aproximadamente 769 millones (heredado de Whisper medium; no confirmado explícitamente en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (ventana estándar de Whisper); procesamiento de audio más largo mediante segmentación |
| Tipos de cuantizacion | float16 (sin cuantización); no se mencionan otras variantes |
| Idiomas soportados | Noruego (no), bokmål (nb), nynorsk (nn) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (float16), compatible con WhisperKit; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper medium de OpenAI: un transformer encoder-decoder con atención multi-cabeza estándar, diseñado para transcripción de voz y traducción. El modelo original NbAiLab/nb-whisper-medium fue desarrollado por la Biblioteca Nacional de Noruega mediante fine-tuning del modelo Whisper medium de OpenAI sobre datos de voz en noruego. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del repositorio de conversión no incluye esa información; sería necesario consultar la model card del modelo base para obtener esos datos.

La innovación técnica de esta ficha concreta no reside en el entrenamiento sino en la conversión a Core ML para ejecución en el Apple Neural Engine. La conversión se realizó con whisperkittools en precisión float16, sin cuantización, copiando config.json y generation_config.json sin cambios desde el modelo original. El modelo utiliza el mismo tokenizer que openai/whisper-medium. La ejecución en el Neural Engine permite inferencia acelerada por hardware en dispositivos Apple, con la ventaja de privacidad de que el audio no abandona el dispositivo.

## Capacidades

- Transcripción automática de voz (ASR) en noruego, con soporte para bokmål, nynorsk y noruego genérico.
- Generación de texto a partir de audio con puntuación y formato limpio (elimina repeticiones y falsos comienzos, según la model card).
- Procesamiento de audio de larga duración mediante segmentación interna (reuniones de aproximadamente 10 minutos mencionadas en las mediciones).
- Ejecución local en Apple Neural Engine mediante WhisperKit, sin conexión a red.
- Integración con el ecosistema Swift/Apple para aplicaciones macOS, iOS e iPadOS.
- No se menciona soporte de tool calling, function calling, agentes, multi-step reasoning, visión ni audio más allá de la transcripción estándar de Whisper.
- Capacidades multilingües limitadas a noruego; no se indica soporte para otros idiomas.

## Casos de uso

- Transcripción de reuniones en local: el modelo puede procesar grabaciones de reuniones de aproximadamente 10 minutos (como las mediciones de Storting mencionadas) en dispositivos Apple, manteniendo el audio en el dispositivo y cumpliendo requisitos de privacidad para entornos corporativos o gubernamentales.
- Aplicaciones de notas de voz para macOS, iOS e iPadOS: integración mediante WhisperKit en Swift permite añadir transcripción noruega a apps de notas sin infraestructura de servidores, con latencia dependiente del dispositivo pero sin coste de API.
- Subtitulado y accesibilidad: generación de subtítulos para vídeos en noruego en flujos de postproducción local, usando la ventana de 30 segundos por segmento y la segmentación automática para contenido más largo.
- Transcripción de entrevistas y periodismo: grabaciones de campo en noruego pueden transcribirse en un Mac portátil sin conexión, útil para periodistas que manejan material sensible y necesitan cumplir con protección de fuentes.
- Documentación clínica o legal con requisitos de privacidad: al ejecutarse completamente en el dispositivo, el modelo evita el envío de audio a terceros, lo que facilita el cumplimiento de normativas de protección de datos en entornos sanitarios o jurídicos.
- Investigación lingüística en noruego: el modelo permite transcribir corpus de habla espontánea (como NB Tale) y discurso parlamentario (NPSC, Storting) para análisis lingüístico, con la ventaja de que el proceso es reproducible localmente y sin dependencia de servicios externos.
- Prototipado rápido de ASR en Apple Silicon: desarrolladores que necesitan validar una pipeline de transcripción noruega pueden usar el snippet de Swift incluido en la model card para descargar el modelo y transcribir un archivo m4a en pocas líneas de código.

## Benchmarks y rendimiento

Los datos de precisión provienen de la model card del repositorio de conversión y se midieron con los mismos clips, normalización y ruta de código en el Neural Engine. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo ASR; se presentan las tasas de error de palabra (WER) proporcionadas por el autor.

| Conjunto | NB-Whisper medium (este) | NB-Whisper large |
|---|---:|---:|
| FLEURS nb (75 clips) | 6,5 % | 7,0 % |
| NST (75 clips) | 2,6 % | 2,2 % |
| NB Tale, habla espontánea (75 clips) | 15,8 % | 17,1 % |
| NPSC, Storting (75 clips) | 14,6 % | 14,8 % |
| Storting, cuatro reuniones de ~10 minutos | 13,6 % | 13,9 % |

La model card indica que el modelo original en PyTorch ofrece los mismos números dentro del margen de ruido. También señala que NPSC y NB Tale tienen referencias literales (verbatim), mientras que NB-Whisper genera texto limpio (elimina repeticiones y falsos comienzos), lo que explica la mayor parte del error en esos conjuntos. No se proporcionan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo se ejecuta en el Apple Neural Engine y en memoria unificada de Apple Silicon. El repositorio ocupa 1,5 GB en float16.
- GPU recomendadas: no se especifican GPU NVIDIA; el modelo está diseñado para Apple Silicon (Neural Engine). No se mencionan requisitos para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: el modelo está pensado para Mac, iPhone y iPad con Apple Silicon; no se indica soporte para GPU de consumo NVIDIA.
- Opciones de despliegue: WhisperKit (framework Swift) es la vía documentada; se descarga el modelo con WhisperKit.download y se transcribe con WhisperKit.transcribe. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Selbyggen/nb-whisper-medium-coreml (este) | ~769 M (heredado) | 30 s por segmento | Noruego (no, nb, nn) | Apache 2.0 | Core ML float16 | Conversión para Apple Neural Engine vía WhisperKit |
| NbAiLab/nb-whisper-medium | ~769 M (heredado) | 30 s por segmento | Noruego (no, nb, nn) | Apache 2.0 | PyTorch (safetensors presumiblemente) | Modelo original; misma precisión según la model card |
| NbAiLab/nb-whisper-large | ~1550 M (heredado) | 30 s por segmento | Noruego (no, nb, nn) | Apache 2.0 | PyTorch | Mayor tamaño; WER comparable o ligeramente mejor en algunos conjuntos según la tabla del autor |
| openai/whisper-medium | ~769 M | 30 s por segmento | Multilingüe (99 idiomas) | MIT (según el modelo original de OpenAI; no confirmado en la información disponible) | PyTorch | Modelo base sobre el que se hizo fine-tuning; no especializado en noruego |

No se dispone de datos de benchmarks comparativos con otros modelos ASR noruegos (por ejemplo, variantes de Vosk, Wav2Vec2 noruego o modelos comerciales) en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: cualquier sesgo o limitación del modelo original NbAiLab/nb-whisper-medium se hereda sin cambios.
- El modelo está especializado exclusivamente en noruego; no se debe esperar un rendimiento aceptable en otros idiomas.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido, silencios largos o audio de baja calidad.
- La model card indica que el modelo genera texto limpio (elimina repeticiones y falsos comienzos), lo que puede producir discrepancias con referencias literales (verbatim) y explicar parte del WER en conjuntos como NB Tale y NPSC.
- La ventana de contexto es de 30 segundos por segmento; el procesamiento de audio más largo depende de la segmentación interna de WhisperKit, que puede introducir errores en los límites de segmento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y de WhisperKit para cumplir con las atribuciones correspondientes.
- Dependencia del ecosistema Apple: el formato Core ML limita el despliegue a dispositivos Apple con Neural Engine; no es portable a GPU NVIDIA ni a servidores Linux convencionales sin reconversión.
- No se proporcionan datos sobre latencia, throughput ni consumo energético en la información disponible, lo que dificulta estimar el rendimiento en producción.
- No se han publicado resultados de benchmarks estándar de razonamiento o código porque no aplican a este tipo de modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Selbyggen/nb-whisper-medium-coreml
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-medium
- Organización NbAiLab: https://huggingface.co/NbAiLab
- WhisperKit (framework): https://github.com/argmaxinc/WhisperKit
- whisperkittools (herramienta de conversión): https://github.com/argmaxinc/whisperkittools
- Aplicación Says: https://sagtapp.com/
- Modelo Whisper medium de OpenAI (referencia del tokenizer): https://huggingface.co/openai/whisper-medium
