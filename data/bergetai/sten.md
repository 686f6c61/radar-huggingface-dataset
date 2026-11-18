# bergetai/sten

## Resumen

Sten es un modelo de síntesis de voz (text-to-speech) en sueco desarrollado por Berget AI. Se trata de un fine-tuning de openbmb/VoxCPM2, un modelo de difusión autorregresiva de 2B parámetros sin tokenizador, sobre el que se ha entrenado un adaptador LoRA posteriormente fusionado con los pesos base. El resultado es un reemplazo directo del modelo original: misma arquitectura, mismos cargadores, pero con capacidad de producir habla natural en sueco, incluyendo la R alveolar correcta, prosodia sueca y el acento de palabras compuestas que el modelo base no genera de forma fiable.

El modelo resuelve un problema concreto: los modelos TTS multilingües de propósito general no producen sueco natural. Según el autor, la evaluación del modelo base frente a Zonos 3 Mini, KugelAudio, Qwen3-TTS y Piper en sueco no arrojó resultados satisfactorios en ninguno de los casos. Sten cubre esa carencia para una única voz, entrenada sobre un audiolibro narrado profesionalmente por un hablante nativo.

Con 2.290.004.544 parámetros y un repositorio de 5 GB, Sten está pensado para inferencia en producción con salida de audio a 48 kHz mono mediante el decodificador AudioVAE V2. La licencia Apache-2.0 y la disponibilidad de una API alojada en la UE (Suecia, con GDPR y DPA) lo hacen relevante para despliegues europeos que necesiten TTS en sueco con garantías de soberanía de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva sin tokenizador (VoxCPM2), con decodificador AudioVAE V2 |
| Parametros totales | 2.290.004.544 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (parametro `max_len` por defecto: 4096) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Sueco (sv) e ingles (en); otros idiomas no soportados oficialmente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 48 kHz mono |
| Libreria | voxcpm |
| Modelo base | openbmb/VoxCPM2 |
| Tamano del repositorio | 5.0 GB |

## Arquitectura y entrenamiento

Sten hereda la arquitectura de openbmb/VoxCPM2: un modelo de difusión autorregresiva sin tokenizador de 2B parámetros. La generación de audio se realiza mediante un proceso de difusión controlado por los parámetros `cfg_value` (classifier-free guidance) e `inference_timesteps`, y la salida se decodifica con AudioVAE V2 a 48 kHz mono. Al no depender de un tokenizador de audio discreto, el modelo opera directamente sobre representaciones continuas.

El entrenamiento consistió en un fine-tuning mediante adaptador LoRA sobre los pesos base, utilizando un audiolibro en sueco narrado profesionalmente por un único hablante (dataset privado). El adaptador se fusionó posteriormente en los pesos del modelo, de modo que el resultado es un checkpoint único cargable con los mismos loaders que VoxCPM2. El adaptador LoRA por separado está disponible en bergetai/sten-lora, donde se documentan los detalles de entrenamiento y notas sobre ROCm. La narración fue cedida para entrenamiento de ML sin compensación, con acuerdo en vigor con Berget AI (noviembre de 2026). No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en sueco con prosodia natural, R alveolar correcta y acento correcto en palabras compuestas.
- Síntesis de voz en inglés con calidad verificada.
- Salida de audio a 48 kHz mono mediante el decodificador AudioVAE V2.
- Control de la generación mediante `cfg_value` (guidance) e `inference_timesteps`.
- Generación de pausas naturales a partir de saltos de línea a nivel de frase en el texto de entrada.
- Disponibilidad como API alojada con metadatos de procedencia IA (RIFF `LIST`/`INFO`) y cabecera `X-Berget-AI-Generated: true`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento; es un modelo exclusivamente TTS.

## Casos de uso

- Audiolibros y narración de contenido largo: el modelo está entrenado sobre narración profesional de audiolibro y admite síntesis por frases o elevando `max_len`, lo que permite generar capítulos completos con pausas naturales marcadas por saltos de línea.
- Locución para medios y podcasts en sueco: la salida a 48 kHz mono y la prosodia nativa lo hacen adecuado para producción de audio broadcast sin necesidad de posprocesado intensivo.
- Asistentes de voz y atención al cliente en sueco: al ser un reemplazo directo de VoxCPM2, puede integrarse en pipelines existentes basados en la librería voxcpm sin cambios de arquitectura.
- Accesibilidad y lectura de textos: conversión de documentos y contenidos web a voz en sueco para lectores de pantalla y sistemas de accesibilidad.
- E-learning y formación corporativa: generación de material didáctico narrado en sueco e inglés con una voz consistente de hablante nativo.
- Despliegues con requisitos de soberanía de datos: la API alojada en la UE (Suecia) con GDPR y DPA permite usar TTS en sueco sin enviar datos fuera del Espacio Económico Europeo.
- Localización de contenido audiovisual: doblaje y voice-over de material originalmente en otros idiomas hacia sueco, con la advertencia de no emplear la voz para suplantar al narrador original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación cualitativa del modelo base frente a Zonos 3 Mini, KugelAudio, Qwen3-TTS y Piper en sueco, en la que ninguno produjo habla sueca natural, pero no se aportan métricas numéricas (MOS, WER, similitud de hablante u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 2.290.004.544 parámetros, en precisión completa (fp32) se requieren aproximadamente 9,2 GB solo para pesos; en fp16/bf16, unos 4,6 GB; en int8, unos 2,3 GB. Estas cifras son estimaciones a partir del recuento de parámetros y no están confirmadas por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, una GPU con 8-16 GB de VRAM (RTX 4070/4080/4090, A10, L4) debería ser suficiente en fp16, aunque no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí en modelos con 8 GB o más en fp16, sujeto a verificación; no confirmado por el autor.
- Opciones de despliegue: librería `voxcpm` (Python 3.12, torch ≥ 2.5) para inferencia local; API alojada de Berget AI (`https://api.berget.ai/v1/audio/speech`) compatible con el endpoint de speech de OpenAI. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sten (bergetai/sten) | 2,29B | sv, en | Apache-2.0 | HF + API alojada UE | Fine-tuning de VoxCPM2 para sueco |
| VoxCPM2 (openbmb) | 2B | Multilingue (no especificado) | Apache-2.0 | HF | Modelo base; sueco no natural segun el autor |
| Zonos 3 Mini | No disponible | No disponible | No disponible | No disponible | Evaluado por el autor; sueco no natural |
| Qwen3-TTS | No disponible | No disponible | No disponible | No disponible | Evaluado por el autor; sueco no natural |
| Piper | No disponible | Multilingue | No disponible | No disponible | Evaluado por el autor; sueco no natural |

No se dispone de datos de parámetros, contexto ni rendimiento numérico de los modelos alternativos en la información proporcionada; la comparación se limita a lo que el autor documenta cualitativamente.

## Limitaciones y advertencias

- Los números deben escribirse con letras en el texto de entrada ("fyrtiotre" en lugar de "43") para una pronunciación correcta.
- Los textos largos requieren elevar `max_len` (por defecto 4096) o sintetizar frase por frase.
- Solo sueco e inglés están verificados en calidad; otros idiomas no están soportados oficialmente.
- El modelo está entrenado sobre una única voz; no es un modelo multihablante.
- Prohibido usar Sten para generar habla que suplante al narrador original.
- Prohibido el uso para suplantación de identidad, fraude o desinformación, conforme a la model card de VoxCPM2.
- El contenido generado por IA debe etiquetarse claramente.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información disponible; al ser un modelo TTS, el riesgo principal es de prosodia incorrecta o artefactos acústicos más que de contenido factual.
- La licencia Apache-2.0 permite uso comercial, pero las restricciones de uso ético del modelo base y del narrador deben respetarse.
- El dataset de entrenamiento es privado, lo que limita la reproducibilidad del fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bergetai/sten
- Adaptador LoRA: https://huggingface.co/bergetai/sten-lora
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- API alojada de Berget AI: https://api.berget.ai/v1/audio/speech
- Blog de Berget AI con la evaluación completa: mencionado en la model card, URL no disponible en la información proporcionada.
