# ibm-granite/granite-speech-4.1-2b-plus-GGUF

## Resumen

Granite-speech-4.1-2b-plus-GGUF es la versión cuantizada en formato GGUF del modelo de voz de IBM, `ibm-granite/granite-speech-4.1-2b-plus`, perteneciente a la familia Granite 4.1. El modelo combina un núcleo de lenguaje de aproximadamente 1.630 millones de parámetros con un proyector de audio (`mmproj`) que permite procesar entradas de voz directamente desde `llama.cpp`, sin necesidad de infraestructura adicional de ASR. Resuelve el problema de integrar reconocimiento y comprensión de voz en pipelines locales y autogestionados, manteniendo el formato nativo de llama.cpp y la compatibilidad con la API OpenAI de `llama serve`.

La relevancia de esta publicación radica en que traslada las capacidades de voz de Granite a un entorno de inferencia ligero y portable, con licencia Apache 2.0 y pesos en GGUF de varias cuantizaciones. Está pensado para desarrolladores que necesitan transcripción y comprensión de audio en local, sin depender de servicios en la nube ni de GPUs de gran formato. El repositorio ocupa 19,4 GB e incluye tanto los ficheros del modelo como el proyector de audio.

No se dispone de información detallada sobre la longitud de contexto, los idiomas soportados ni la composición del dataset de entrenamiento en la información proporcionada; se indica como "no disponible" en las secciones correspondientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de lenguaje con proyector de audio multimodal) |
| Parámetros totales | 1.631.752.192 (según safetensors del modelo base) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con varias cuantizaciones; el ejemplo documentado usa Q8_0 y proyector `mmproj-model-f16.gguf` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de audio en f16 |
| Modelo base | ibm-granite/granite-speech-4.1-2b-plus |
| Librería | llama.cpp |
| Tamaño del repositorio | 19,4 GB |
| Build de llama.cpp documentado | b11798 |
| Versión de Transformers documentada | 5.20.2 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Granite 4.1 y de la presencia de un proyector de audio (`mmproj`) que actúa como adaptador entre la señal acústica y el modelo de lenguaje. El patrón es el habitual en modelos multimodales de voz: un codificador de audio que transforma la forma de onda o los features acústicos en embeddings, un proyector que los alinea con el espacio del modelo de lenguaje y un transformer de lenguaje que genera la salida textual. El ejemplo de la model card confirma que el modelo acepta audio WAV y produce transcripciones en texto plano.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). La conversión a GGUF se ha realizado con la herramienta de llama.cpp y se distribuye junto con el proyector de audio en precisión f16, lo que permite ejecutar el modelo en `llama cli` y `llama serve` con soporte de la API OpenAI.

## Capacidades

- Procesamiento de audio: acepta ficheros WAV (incluido audio a 8 kHz, como el ejemplo `OSR_us_000_0010_8k.wav`) y genera transcripciones en texto.
- Comprensión de voz y respuesta conversacional: el modelo está etiquetado como "conversational" y admite prompts de texto junto con el audio.
- Integración con la API OpenAI de `llama serve`: el audio se envía como parte `input_audio` codificada en base64 dentro de `/v1/chat/completions`.
- Ejecución local con `llama.cpp`: no requiere servicios externos ni claves de API.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` y `deploy:azure` sugieren despliegue en entornos compatibles con endpoints gestionados.
- Generación de texto: al incorporar un modelo de lenguaje Granite 4.1 de ~1,6 B de parámetros, conserva las capacidades de generación textual del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio bidireccional: no disponible; la información solo documenta entrada de audio y salida de texto.

## Casos de uso

- Transcripción local de reuniones y notas de voz: el modelo puede procesar ficheros WAV mediante `llama cli` o `llama serve` y devolver la transcripción, lo que permite construir un pipeline de actas sin enviar audio a servicios en la nube.
- Asistentes de voz en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp, el audio no abandona la infraestructura del usuario, lo que encaja en sectores regulados (sanidad, legal, administración pública).
- Integración en aplicaciones de atención al cliente: mediante `llama serve` y la API compatible con OpenAI, se puede conectar un front-end de voz a un backend que transcribe y responde en el mismo flujo conversacional.
- Preprocesado de audio en pipelines de datos: transcripción por lotes de grabaciones para generar datasets de texto, indexación de contenido hablado o alimentación de sistemas de búsqueda.
- Prototipado rápido en estaciones de trabajo: el tamaño de ~1,6 B de parámetros y las cuantizaciones GGUF permiten experimentar en portátiles y equipos de sobremesa sin GPU dedicada de gama alta.
- Despliegue en el borde (edge): al no requerir infraestructura de servidor, puede embeberse en aplicaciones de escritorio o dispositivos con llama.cpp como runtime.
- Evaluación comparativa de modelos de voz: sirve como referencia Apache 2.0 para comparar calidad de transcripción frente a otros modelos ASR open source en un mismo entorno de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~1,6 B de parámetros en Q8_0 ocupa del orden de 1,7-2 GB para los pesos del lenguaje, más el proyector de audio en f16; las cuantizaciones más agresivas reducen el espacio necesario.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPUs de consumo con suficiente VRAM para el fichero GGUF elegido.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en GPUs con 4-8 GB de VRAM según la cuantización; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: `llama.cpp` (`llama cli` y `llama serve`), con compatibilidad declarada con endpoints y despliegue en Azure. No se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El ejemplo de la model card emplea un fichero de audio de 8 kHz del Open Speech Repository, pero no se aportan métricas de tiempo de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas oficiales en la información proporcionada. A continuación se comparan únicamente los atributos verificables frente a alternativas de la misma categoría (modelos de voz open source con licencia permisiva), indicando "no disponible" cuando no hay datos.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| granite-speech-4.1-2b-plus-GGUF | ~1,63 B | no disponible | Apache 2.0 | GGUF (llama.cpp) | Hugging Face (ibm-granite) |
| Whisper (variantes open source de OpenAI) | no disponible en esta ficha | no disponible | MIT (según variante) | varios | Hugging Face |
| Otros modelos de voz Apache 2.0 | no disponible | no disponible | Apache 2.0 | varios | Hugging Face |

La comparación cuantitativa de calidad (WER, MMLU, etc.) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo de lenguaje y voz, es esperable que herede sesgos de los datos de entrenamiento del modelo base, pero no se aportan detalles.
- Riesgo de alucinación: no cuantificado. En tareas de transcripción, el modelo puede generar texto plausible que no corresponde literalmente al audio, especialmente con ruido o acentos no representados en el entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y la lista de idiomas soportados no están disponibles; no debe asumirse cobertura multilingüe sin verificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales.
- Formato de entrada: el ejemplo documentado usa WAV; no se confirma soporte de otros formatos (MP3, FLAC, etc.) en la información disponible.
- Dependencia de la versión de llama.cpp: la model card referencia el build `b11798` y Transformers `5.20.2`; versiones distintas pueden requerir ajustes.
- Proyector de audio separado: es imprescindible cargar `mmproj-model-f16.gguf` junto con el modelo; omitirlo impide el procesamiento de audio.
- Uso en producción: no se aportan métricas de latencia, throughput ni tasas de error, por lo que la idoneidad para cargas productivas debe validarse con pruebas propias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- Documentación de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Documentación de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
- Open Speech Repository (audio de ejemplo): https://www.voiptroubleshooter.com/open_speech/american.html
- voiptroubleshooter.com: https://www.voiptroubleshooter.com/
